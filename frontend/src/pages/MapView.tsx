import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router";
import { Layers, Maximize2, Radio, Sparkles, ExternalLink, Activity } from "lucide-react";
import { Card, StatusPill, StatusSpine } from "../components/primitives";
import { mapPins as mockPins, statusColor, type Status } from "../components/data";
import { useStream } from "../lib/StreamProvider";
import { coordinatedChannels, packetStatus, packetLabel, shortName } from "../lib/adapters";
import type { ProcessedPacket } from "../lib/types";

const legend: { label: string; status: Status }[] = [
  { label: "Normal", status: "normal" },
  { label: "Weather Event", status: "weather" },
  { label: "Warning", status: "warning" },
  { label: "Sensor Fault", status: "critical" },
];

const MOCK_CALLOUT = {
  status: "weather" as Status,
  text: "2 nearby stations reporting a coordinated pressure drop — corroborated as a genuine regional weather event, not isolated sensor faults.",
};

function spatialCallout(latests: ProcessedPacket[]): { status: Status; text: string } {
  const corroborated = latests.find((p) => p.ensemble.is_anomaly && p.spatial?.is_corroborated_event);
  if (corroborated) {
    const s = corroborated.spatial;
    return {
      status: "weather",
      text: `${s.other_stations_anomalous} of ${s.other_stations_reporting} nearby stations report coordinated conditions — corroborated as a genuine regional weather event, not isolated sensor faults.`,
    };
  }
  const isolated = latests.find((p) => p.ensemble.is_anomaly && !p.root_cause.is_genuine_weather);
  if (isolated) {
    return {
      status: "warning",
      text: "Active anomalies are isolated to individual stations — neighbours report normal conditions, consistent with sensor faults rather than a regional event.",
    };
  }
  return {
    status: "normal",
    text: "All stations reporting consistent regional conditions — no coordinated anomalies or isolated faults detected.",
  };
}

type Pin = {
  id: string;
  name: string;
  type: string;
  temp: string;
  pressure: string;
  humidity: string;
  status: Status;
  label: string;
  latlng: [number, number];
};

type MapTileStyle = "canvas" | "osm" | "satellite";

const TILE_PROVIDERS: Record<MapTileStyle, { url: string; maxZoom: number; attribution: string }> = {
  canvas: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    maxZoom: 16,
    attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ",
  },
  osm: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    maxZoom: 19,
    attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    maxZoom: 18,
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics",
  },
};

export default function MapView() {
  const { backendOnline, stations, latestByStation, selectedStationId, setStation } = useStream();
  const live = backendOnline;

  const [active, setActive] = useState<string | null>(selectedStationId);
  const [mapStyle, setMapStyle] = useState<MapTileStyle>("canvas");
  const callout = live ? spatialCallout(Object.values(latestByStation)) : MOCK_CALLOUT;

  const pins: Pin[] = stations.map((s) => {
    const latest = latestByStation[s.station_id] ?? null;
    if (live) {
      return {
        id: s.station_id,
        name: shortName(s.name),
        type: s.station_type,
        temp: latest && latest.raw.temperature != null ? `${latest.raw.temperature.toFixed(1)} °C` : "—",
        pressure: latest && latest.raw.pressure != null ? `${latest.raw.pressure.toFixed(1)} hPa` : "—",
        humidity: latest && latest.raw.relative_humidity != null ? `${latest.raw.relative_humidity.toFixed(0)} %` : "—",
        status: latest ? packetStatus(latest) : "idle",
        label: latest ? packetLabel(latest) : "Offline",
        latlng: [s.latitude, s.longitude] as [number, number],
      };
    }
    const mock = mockPins.find((p) => p.id === s.station_id);
    return {
      id: s.station_id,
      name: shortName(s.name),
      type: s.station_type,
      temp: mock?.temp ?? "—",
      pressure: "1012.4 hPa",
      humidity: "58 %",
      status: mock?.status ?? "idle",
      label: mock?.label ?? "Demo data",
      latlng: [s.latitude, s.longitude] as [number, number],
    };
  });

  const weatherPin = pins.find((p) => p.status === "weather") ?? null;
  const faultPin = pins.find((p) => p.status === "critical") ?? null;

  const weatherPacket = weatherPin ? latestByStation[weatherPin.id] : undefined;
  const weatherChannels =
    live && weatherPacket ? coordinatedChannels(weatherPacket) : "Coordinated P↓ · T↓ · RH↑";
  const faultSpatial = faultPin ? latestByStation[faultPin.id]?.spatial : undefined;
  const faultShare =
    live && faultSpatial && faultSpatial.other_stations_reporting > 0
      ? `${faultSpatial.other_stations_anomalous} of ${faultSpatial.other_stations_reporting} neighbours share this signal → sensor hardware fault.`
      : "No neighbour shares this signal → sensor hardware fault isolated.";

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const markersByIdRef = useRef<Record<string, L.Marker>>({});

  const fitNetwork = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const bounds = L.latLngBounds(pins.map((p) => L.latLng(p.latlng)));
    if (bounds.isValid()) {
      map.fitBounds(bounds.pad(0.22), { maxZoom: 8, animate: true });
    }
  }, [pins]);

  const select = useCallback(
    (id: string) => {
      setActive(id);
      if (live) setStation(id);
      const targetPin = pins.find((p) => p.id === id);
      const map = mapRef.current;
      if (map && targetPin) {
        map.flyTo(targetPin.latlng, Math.max(map.getZoom(), 6), { duration: 0.8 });
        const marker = markersByIdRef.current[id];
        if (marker) {
          marker.openPopup();
        }
      }
    },
    [live, pins, setStation],
  );

  // Initialize Leaflet Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
      attributionControl: true,
    });

    const provider = TILE_PROVIDERS[mapStyle];
    const tileLayer = L.tileLayer(provider.url, {
      attribution: provider.attribution,
      maxZoom: provider.maxZoom,
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    markerLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    setTimeout(() => {
      map.invalidateSize();
      fitNetwork();
    }, 250);

    return () => {
      map.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
    };
  }, []);

  // Update Tile Layer on style switch
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }
    const provider = TILE_PROVIDERS[mapStyle];
    const tileLayer = L.tileLayer(provider.url, {
      attribution: provider.attribution,
      maxZoom: provider.maxZoom,
    }).addTo(map);
    tileLayerRef.current = tileLayer;
  }, [mapStyle]);

  // Build markers and popups
  useEffect(() => {
    const map = mapRef.current;
    const layer = markerLayerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    markersByIdRef.current = {};

    // Corroboration arcs
    if (weatherPin) {
      pins
        .filter((p) => p.id !== weatherPin.id && p.status !== "critical")
        .forEach((n) => {
          L.polyline([weatherPin.latlng, n.latlng], {
            color: statusColor.weather,
            weight: 2,
            opacity: 0.85,
            dashArray: "6 8",
            className: "arc-flow",
          }).addTo(layer);
        });
    }

    for (const p of pins) {
      const isFault = p.id === faultPin?.id;
      const isWeather = p.id === weatherPin?.id;
      const isSelected = active === p.id;
      const color = statusColor[p.status];

      const halo = isFault
        ? `<span class="sg-halo live-dot" style="color:${color}; opacity:0.45"></span>` +
          `<span class="sg-halo iso-ring" style="border:2px dashed ${color}; opacity:0.6; width:38px; height:38px"></span>` +
          `<span class="sg-halo iso-halo" style="border:2px dashed ${color}; width:44px; height:44px"></span>`
        : isWeather
        ? `<span class="sg-halo live-dot" style="color:${color}; opacity:0.4"></span>`
        : "";

      const icon = L.divIcon({
        className: "sg-pin-ico",
        html:
          `<span class="sg-pin${isSelected ? " is-selected" : ""}" style="--pin:${color}">` +
          `${halo}<span class="sg-dot"></span></span>`,
        iconSize: [46, 46],
        iconAnchor: [23, 23],
      });

      const marker = L.marker(p.latlng, { icon }).addTo(layer);
      markersByIdRef.current[p.id] = marker;

      marker.on("click", () => select(p.id));

      // Clean, single-line label badge beneath pin (NO bulky multi-line text)
      marker.bindTooltip(
        `<span style="display:inline-flex;align-items:center;gap:4px;">` +
          `<span style="width:6px;height:6px;border-radius:50%;background:${color};"></span>` +
          `<strong>${p.name}</strong> · ${p.temp}` +
        `</span>`,
        {
          permanent: true,
          direction: "bottom",
          offset: [0, 10],
          className: "sg-name",
        },
      );

      // Rich interactive popup on click
      const popupHtml = `
        <div style="font-family: var(--font-sans); min-width: 220px; padding: 2px;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">${p.type} AWS</span>
            <span style="font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 9999px; background: color-mix(in srgb, ${color} 15%, transparent); color: ${color};">${p.label}</span>
          </div>
          <h4 style="font-size: 14px; font-weight: 700; color: #0f1b2d; margin: 0 0 6px 0;">${p.name}</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px; margin-bottom: 8px; background: #f8fafc; padding: 6px 8px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <div><span style="color:#64748b;">Temp:</span> <strong>${p.temp}</strong></div>
            <div><span style="color:#64748b;">Pressure:</span> <strong>${p.pressure}</strong></div>
            <div style="grid-column: span 2;"><span style="color:#64748b;">Humidity:</span> <strong>${p.humidity}</strong></div>
          </div>
          <div style="font-size: 11px; line-height: 1.4; color: #475569; margin-bottom: 8px;">
            ${
              isFault
                ? `<strong style="color: ${color};">⚠️ Hardware Fault:</strong> ${faultShare}`
                : isWeather
                ? `<strong style="color: ${statusColor.weather};">⛈ Weather Front:</strong> ${weatherChannels}. Corroborated with neighbors.`
                : `<strong style="color: #10b981;">✅ Healthy:</strong> Regional conditions consistent with adjacent stations.`
            }
          </div>
          <a href="/stations/${p.id}" style="display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; color: #1d6fe0; text-decoration: none;">
            Drill into telemetry &rarr;
          </a>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: "sg-popup",
        offset: [0, -14],
      });
    }
  }, [pins, active, weatherPin, faultPin, weatherChannels, faultShare, select]);

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[330px_1fr]">
      {/* Left Station Control & Diagnostics Panel */}
      <div className="flex flex-col gap-4 self-start">
        <Card status="idle" className="p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-ink">Stations ({pins.length})</div>
            <button
              onClick={fitNetwork}
              title="Reset view to fit all Indian stations"
              className="flex items-center gap-1 rounded-lg border border-mist bg-white px-2.5 py-1 text-xs font-semibold text-haze transition-colors hover:border-azimuth/40 hover:text-ink"
            >
              <Maximize2 size={12} /> Fit Fleet
            </button>
          </div>

          {/* Legend */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {legend.map((l) => (
              <span
                key={l.label}
                className="flex items-center gap-1.5 rounded-full bg-stratus px-2.5 py-1 text-[11px] font-medium text-haze"
              >
                <span className="h-2 w-2 rounded-full" style={{ background: statusColor[l.status] }} />
                {l.label}
              </span>
            ))}
          </div>

          {/* Station list buttons */}
          <div className="mt-4 flex flex-col gap-2">
            {pins.map((p) => (
              <button
                key={p.id}
                onClick={() => select(p.id)}
                aria-pressed={active === p.id}
                className={`relative overflow-hidden rounded-xl border py-2.5 pl-4 pr-3 text-left transition-all ${
                  active === p.id
                    ? "border-azimuth bg-azimuth/[0.06] shadow-sm ring-1 ring-azimuth/20"
                    : "border-mist bg-white hover:bg-stratus/60"
                }`}
              >
                <StatusSpine status={p.status} />
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-bold text-ink">{p.name}</div>
                    <div className="text-[11px] text-haze">
                      {p.type} &bull; {p.temp}
                    </div>
                  </div>
                  <StatusPill status={p.status}>{p.label}</StatusPill>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Spatial Consistency Card - cleanly placed in sidebar instead of blocking map */}
        <Card status={callout.status} className="p-4 border border-mist bg-white">
          <div
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
            style={{ color: statusColor[callout.status] }}
          >
            <Radio size={14} />
            Spatial Consistency
          </div>
          <p className="mt-2 text-[12px] leading-relaxed text-ink font-normal">
            {callout.text}
          </p>
          <div className="mt-3 pt-2.5 border-t border-mist/70 flex items-center justify-between text-[11px] text-haze">
            <span>Mesh Corroborator</span>
            <span className="font-semibold text-ink">45 km Cross-Check</span>
          </div>
        </Card>
      </div>

      {/* Right Map Canvas with Custom Controls */}
      <Card status="idle" className="relative p-2 overflow-hidden shadow-card">
        {/* Top-Right Map Layer Controls */}
        <div className="absolute right-4 top-4 z-[800] flex items-center gap-1.5 rounded-xl border border-mist/80 bg-white/95 p-1 shadow-lift backdrop-blur-md">
          <button
            onClick={() => setMapStyle("canvas")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              mapStyle === "canvas"
                ? "bg-azimuth text-white shadow-sm"
                : "text-haze hover:bg-mist/50 hover:text-ink"
            }`}
          >
            Light Canvas
          </button>
          <button
            onClick={() => setMapStyle("osm")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              mapStyle === "osm"
                ? "bg-azimuth text-white shadow-sm"
                : "text-haze hover:bg-mist/50 hover:text-ink"
            }`}
          >
            OpenStreetMap
          </button>
          <button
            onClick={() => setMapStyle("satellite")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              mapStyle === "satellite"
                ? "bg-azimuth text-white shadow-sm"
                : "text-haze hover:bg-mist/50 hover:text-ink"
            }`}
          >
            Satellite
          </button>
        </div>

        {/* Map Canvas */}
        <div className="relative h-[540px] w-full xl:h-[680px]">
          <div ref={containerRef} className="h-full w-full rounded-xl" />
        </div>
      </Card>
    </div>
  );
}
