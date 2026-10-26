import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card, StatusPill, StatusSpine } from "../components/primitives";
import { mapPins as mockPins, statusColor, type Status } from "../components/data";
import { useStream } from "../lib/StreamProvider";
import { coordinatedChannels, packetStatus, packetLabel, shortName } from "../lib/adapters";
import type { ProcessedPacket } from "../lib/types";

const legend: { label: string; status: Status }[] = [
  { label: "Normal", status: "normal" },
  { label: "Weather", status: "weather" },
  { label: "Warning", status: "warning" },
  { label: "Fault", status: "critical" },
];

const MOCK_CALLOUT = {
  status: "weather" as Status,
  text: "2 nearby stations reporting a coordinated pressure drop — corroborated as a genuine regional weather event, not isolated sensor faults.",
};

// Summarise the network's spatial consistency from the latest packet per station:
// a corroborated event points to genuine regional weather, isolated anomalies to
// sensor faults, and a quiet network to consistent conditions everywhere.
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
  status: Status;
  label: string;
  latlng: [number, number];
};

export default function MapView() {
  const { backendOnline, stations, latestByStation, selectedStationId, setStation } = useStream();
  const live = backendOnline;

  const [active, setActive] = useState<string | null>(selectedStationId);
  const callout = live ? spatialCallout(Object.values(latestByStation)) : MOCK_CALLOUT;

  // Real coordinates come from station metadata (the StreamProvider keeps its
  // built-in fallback metadata even offline, so the map always has positions).
  // Live status/temp come from the latest packet; offline they come from the
  // representative demo set.
  const pins: Pin[] = stations.map((s) => {
    const latest = latestByStation[s.station_id] ?? null;
    if (live) {
      return {
        id: s.station_id,
        name: shortName(s.name),
        type: s.station_type,
        temp: latest && latest.raw.temperature != null ? `${latest.raw.temperature.toFixed(1)} °C` : "—",
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
      status: mock?.status ?? "idle",
      label: mock?.label ?? "Demo data",
      latlng: [s.latitude, s.longitude] as [number, number],
    };
  });

  const weatherPin = pins.find((p) => p.status === "weather") ?? null;
  const faultPin = pins.find((p) => p.status === "critical") ?? null;

  // Captions from the pin's own packet, not fixed strings: the weather tooltip
  // names the channels actually shifting; the fault caption reports the real
  // neighbour agreement count. Offline keeps representative demo text.
  const weatherPacket = weatherPin ? latestByStation[weatherPin.id] : undefined;
  const weatherChannels =
    live && weatherPacket ? coordinatedChannels(weatherPacket) : "Coordinated P↓ · T↓ · RH↑";
  const faultSpatial = faultPin ? latestByStation[faultPin.id]?.spatial : undefined;
  const faultShare =
    live && faultSpatial && faultSpatial.other_stations_reporting > 0
      ? `${faultSpatial.other_stations_anomalous} of ${faultSpatial.other_stations_reporting} neighbours share this signal → sensor fault.`
      : "No neighbour shares this signal → sensor fault.";

  const select = (id: string) => {
    setActive(id);
    if (live) setStation(id);
  };

  // ── Leaflet map lifecycle ────────────────────────────────
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const selectRef = useRef(select);
  selectRef.current = select;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
      attributionControl: true,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);
    markerLayerRef.current = L.layerGroup().addTo(map);
    // Settle once after layout — avoids a half-rendered first frame in the grid.
    setTimeout(() => map.invalidateSize(), 250);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
    };
  }, []);

  // (Re)build markers whenever pins, selection or fault/weather state changes.
  useEffect(() => {
    const map = mapRef.current;
    const layer = markerLayerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    // Corroboration arcs: an active weather station's shift is shared with its
    // (non-faulted) neighbours — the flowing dashes read "spreading signal".
    if (weatherPin) {
      pins
        .filter((p) => p.id !== weatherPin.id && p.status !== "critical")
        .forEach((n) => {
          L.polyline([weatherPin.latlng, n.latlng], {
            color: statusColor.weather,
            weight: 1.6,
            opacity: 0.8,
            dashArray: "5 6",
            className: "arc-flow",
          }).addTo(layer);
        });
    }

    for (const p of pins) {
      const isFault = p.id === faultPin?.id;
      const isSelected = active === p.id;
      const color = statusColor[p.status];
      const halo = isFault
        ? `<span class="sg-halo live-dot" style="color:${color}; opacity:0.45"></span>` +
          `<span class="sg-halo iso-ring" style="border:2px dashed ${color}; opacity:0.55; width:38px; height:38px"></span>` +
          `<span class="sg-halo iso-halo" style="border:2px dashed ${color}; width:42px; height:42px"></span>`
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
      marker.on("click", () => selectRef.current(p.id));
      if (isFault) {
        marker.bindTooltip(
          `<strong style="color:${color}">ISOLATED</strong><br>${faultShare}`,
          { permanent: true, direction: "top", offset: [0, -12], className: "sg-tip", interactive: true },
        );
      } else if (p.id === weatherPin?.id) {
        marker.bindTooltip(
          `<strong style="color:${statusColor.weather}">${weatherChannels}</strong><br>Physically consistent across channels → genuine weather.`,
          { permanent: true, direction: "top", offset: [0, -12], className: "sg-tip", interactive: true },
        );
      } else {
        marker.bindTooltip(`${p.name}`, {
          permanent: true,
          direction: "bottom",
          offset: [0, 10],
          className: "sg-name",
        });
      }
    }

    const bounds = L.latLngBounds(pins.map((p) => L.latLng(p.latlng)));
    if (bounds.isValid()) map.fitBounds(bounds.pad(0.2), { maxZoom: 8, animate: false });
  }, [pins, active, weatherPin, faultPin, weatherChannels, faultShare]);

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[320px_1fr]">
      <Card status="idle" className="flex flex-col self-start p-5">
        <div className="text-sm font-semibold text-ink">Stations</div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {legend.map((l) => (
            <span key={l.label} className="flex items-center gap-1.5 rounded-full bg-stratus px-2.5 py-1 text-[11px] font-medium text-haze">
              <span className="h-2 w-2 rounded-full" style={{ background: statusColor[l.status] }} />
              {l.label}
            </span>
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-2">
          {pins.map((p) => (
            <button
              key={p.id}
              onClick={() => select(p.id)}
              aria-pressed={active === p.id}
              className={`relative overflow-hidden rounded-xl border py-2.5 pl-4 pr-3 text-left transition-colors ${
                active === p.id ? "border-azimuth/40 bg-azimuth/[0.04]" : "border-mist bg-white hover:bg-stratus/60"
              }`}
            >
              <StatusSpine status={p.status} />
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-medium text-ink">{p.name}</div>
                  <div className="text-[11px] text-haze">{p.type} · {p.temp}</div>
                </div>
                <StatusPill status={p.status}>{p.label}</StatusPill>
              </div>
            </button>
          ))}
        </div>
      </Card>

      <Card status="idle" className="p-2">
        <div className="relative h-[480px] w-full xl:h-[620px]">
          <div ref={containerRef} className="h-full w-full rounded-xl" />
          <div className="pointer-events-none absolute left-9 top-8 z-[850] max-w-[260px] rounded-xl border border-mist bg-white/95 p-4 shadow-card">
            <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: statusColor[callout.status] }}>
              Spatial consistency
            </div>
            <p className="mt-1.5 text-[12px] leading-relaxed text-ink">{callout.text}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
