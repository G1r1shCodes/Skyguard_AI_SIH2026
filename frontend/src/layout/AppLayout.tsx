import { Outlet, NavLink, useMatches, useLocation } from "react-router";
import {
  LayoutGrid,
  Activity,
  RadioTower,
  TriangleAlert,
  Wrench,
  ChartLine,
  Map as MapIcon,
  Settings as SettingsIcon,
} from "lucide-react";
import NavRail from "./NavRail";
import TopBar from "./TopBar";
import ProductTour from "../components/ProductTour";

// Same IA as the desktop NavRail, kept in sync by hand — if a route is added,
// update BOTH lists.
const mobileNavItems = [
  { to: "/overview", label: "Overview", icon: LayoutGrid },
  { to: "/live", label: "Live", icon: Activity },
  { to: "/stations", label: "Stations", icon: RadioTower },
  { to: "/anomalies", label: "Anomalies", icon: TriangleAlert },
  { to: "/maintenance", label: "Maintenance", icon: Wrench },
  { to: "/analytics", label: "Analytics", icon: ChartLine },
  { to: "/map", label: "Map", icon: MapIcon },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

type Handle = { title?: string };

export default function AppLayout() {
  const matches = useMatches();
  const { pathname } = useLocation();
  const title =
    [...matches].reverse().find((m) => (m.handle as Handle)?.title)?.handle as Handle | undefined;

  return (
    <div className="flex h-full w-full overflow-hidden bg-stratus text-ink">
      <div className="hidden lg:block">
        <NavRail />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar title={title?.title ?? "SkyGuard AI"} />
        {/* Mobile navigation — the desktop NavRail is hidden below lg, so this
            scrollable pill strip replaces it. Horizontally scrollable on small
            screens; visually-hidden scroll cue is unnecessary because pills cut
            off at the edge read as scrollable. */}
        <nav
          aria-label="Primary"
          className="border-b border-mist bg-white px-3 py-2 lg:hidden"
        >
          <ul className="flex min-w-max gap-1 overflow-x-auto">
            {mobileNavItems.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors ${
                      isActive
                        ? "bg-azimuth/[0.08] text-azimuth"
                        : "text-haze hover:bg-mist/50 hover:text-ink"
                    }`
                  }
                >
                  <Icon size={15} strokeWidth={1.5} />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <main className="flex-1 overflow-y-auto">
          {/* key on the route so each view plays one quiet rise-in on mount */}
          <div key={pathname} className="rise-in mx-auto max-w-[1520px] px-4 py-6 sm:px-7">
            <Outlet />
          </div>
        </main>
      </div>
      {/* First-visit guided tour + manual replay (TopBar help button) */}
      <ProductTour />
    </div>
  );
}
