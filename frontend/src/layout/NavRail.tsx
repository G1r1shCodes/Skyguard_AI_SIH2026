import { NavLink, Link } from "react-router";
import {
  Home,
  LayoutGrid,
  Activity,
  RadioTower,
  TriangleAlert,
  Wrench,
  ChartLine,
  Map as MapIcon,
  Settings as SettingsIcon,
} from "lucide-react";
import LogoMark from "../components/LogoMark";
import { useStream } from "../lib/StreamProvider";

const items = [
  { to: "/overview", label: "Overview", icon: LayoutGrid },
  { to: "/live", label: "Live Monitor", icon: Activity },
  { to: "/stations", label: "Stations", icon: RadioTower },
  { to: "/anomalies", label: "Anomalies", icon: TriangleAlert },
  { to: "/maintenance", label: "Maintenance", icon: Wrench },
  { to: "/analytics", label: "Analytics", icon: ChartLine },
  { to: "/map", label: "Map", icon: MapIcon },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

function systemStatus(
  backendOnline: boolean,
  connected: boolean,
  latests: { ensemble: { is_anomaly: boolean; severity: string }; root_cause: { is_genuine_weather: boolean } }[],
): { color: string; text: string } {
  if (!backendOnline) return { color: "var(--color-haze)", text: "Demo mode" };
  const faults = latests.filter((p) => p.ensemble.is_anomaly && !p.root_cause.is_genuine_weather);
  if (faults.some((p) => p.ensemble.severity === "CRITICAL"))
    return { color: "var(--color-status-critical)", text: "Faults detected" };
  if (faults.length > 0) return { color: "var(--color-status-warning)", text: "Anomalies active" };
  if (!connected) return { color: "var(--color-status-warning)", text: "Connecting…" };
  return { color: "var(--color-status-normal)", text: "System healthy" };
}

export default function NavRail() {
  const { backendOnline, connected, latestByStation } = useStream();
  const sys = systemStatus(backendOnline, connected, Object.values(latestByStation));

  return (
    <aside className="flex w-[248px] shrink-0 flex-col border-r border-mist bg-frost px-4 py-5">
      <Link
        to="/"
        title="Return to Landing Page"
        className="flex items-center gap-2.5 px-2 group transition-opacity hover:opacity-85"
      >
        <LogoMark className="h-9 w-9 transition-transform group-hover:scale-105" />
        <span className="font-display text-[17px] font-semibold text-ink">SkyGuard AI</span>
      </Link>

      <div className="mt-4 px-2">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-xl border border-mist bg-white px-3 py-1.5 text-xs font-semibold text-haze transition-colors hover:border-azimuth/40 hover:text-ink"
        >
          <Home size={14} /> Back to Landing Page
        </Link>
      </div>

      <nav className="mt-4 flex flex-col gap-1">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-azimuth/[0.08] text-azimuth"
                  : "text-haze hover:bg-mist/50 hover:text-ink"
              }`
            }
          >
            {({ isActive }: { isActive: boolean }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-azimuth" />
                )}
                <Icon size={17} strokeWidth={1.5} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-3 pt-4">
        <div
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
          style={{ background: `color-mix(in srgb, ${sys.color} 12%, transparent)`, color: sys.color }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: sys.color }} />
          {sys.text}
        </div>
        <div className="flex items-center gap-2.5 rounded-xl border border-mist bg-white px-3 py-2">
          <LogoMark className="h-5 w-5 shrink-0" />
          <div className="text-[11px] leading-tight">
            <div className="font-semibold text-ink">Smart India Hackathon 2026</div>
            <div className="font-mono text-haze">Problem Statement 26073</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
