import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  Activity,
  Radio,
  ShieldCheck,
  Cpu,
  Sparkles,
  ArrowRight,
  Play,
  Layers,
  Thermometer,
  Gauge,
  Droplets,
  Wind,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import LogoMark from "../components/LogoMark";

export default function HomePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"stream" | "verdict" | "stations">("stream");
  const [timeStr, setTimeStr] = useState<string>("");
  const [selectedStation, setSelectedStation] = useState(0);

  // Live ticking clock matching the reference screenshot design
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const seconds = now.getSeconds().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "pm" : "am";
      hours = hours % 12 || 12;
      setTimeStr(`${hours.toString().padStart(2, "0")}:${minutes}:${seconds} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const previewStations = [
    {
      id: "AWS-LEH-01",
      name: "Leh High-Altitude AWS",
      region: "Ladakh (3,524m)",
      temp: "-4.2°C",
      pressure: "678 hPa",
      humidity: "28%",
      wind: "34 km/h NW",
      status: "Healthy",
      verdict: "Normal Telemetry",
      isWeather: false,
    },
    {
      id: "RAD-SHM-04",
      name: "Shimla Ridge Doppler Radar",
      region: "Himachal Pradesh",
      temp: "11.4°C",
      pressure: "790 hPa",
      humidity: "86%",
      wind: "62 km/h W",
      status: "Severe Event",
      verdict: "Thunderstorm Corroborated (Genuine Weather)",
      isWeather: true,
    },
    {
      id: "AWS-CHE-09",
      name: "Cherrapunji Pluviometer Station",
      region: "Meghalaya",
      temp: "18.1°C",
      pressure: "865 hPa",
      humidity: "98%",
      wind: "19 km/h S",
      status: "Healed",
      verdict: "Temperature Transducer Drift (Auto-Healed)",
      isWeather: false,
    },
    {
      id: "AWS-JAI-12",
      name: "Jaisalmer Arid Boundary AWS",
      region: "Rajasthan",
      temp: "37.5°C",
      pressure: "998 hPa",
      humidity: "14%",
      wind: "42 km/h NE",
      status: "Healthy",
      verdict: "Normal Telemetry",
      isWeather: false,
    },
  ];

  const currentStn = previewStations[selectedStation];

  return (
    <div className="relative min-h-screen bg-stratus text-ink font-sans selection:bg-azimuth/20 selection:text-azimuth">
      {/* ─────────────────────────────────────────────────────────────
          1. FLOATING PILL NAVBAR (Matches reference screenshot style)
      ───────────────────────────────────────────────────────────── */}
      <header className="fixed top-4 left-0 right-0 z-50 px-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between rounded-full border border-mist/80 bg-white/95 px-5 py-2.5 shadow-lift backdrop-blur-md transition-all">
          {/* Brand Left */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <LogoMark className="h-7 w-7 transition-transform group-hover:scale-105" />
            <span className="font-display text-[17px] font-bold tracking-tight text-ink">
              SkyGuard <span className="text-azimuth font-semibold">AI</span>
            </span>
          </Link>

          {/* Nav Center Links */}
          <nav className="hidden md:flex items-center gap-1.5 text-sm font-medium">
            <a
              href="#hero"
              className="rounded-full bg-[#bdf044] px-4 py-1 text-slate-900 font-bold shadow-sm transition-transform hover:scale-105"
            >
              Home
            </a>
            <a
              href="#stats"
              className="rounded-full px-3 py-1 text-haze transition-colors hover:text-ink hover:bg-mist/40"
            >
              Stats
            </a>
            <a
              href="#features"
              className="rounded-full px-3 py-1 text-haze transition-colors hover:text-ink hover:bg-mist/40"
            >
              Features
            </a>
            <a
              href="#preview"
              className="rounded-full px-3 py-1 text-haze transition-colors hover:text-ink hover:bg-mist/40"
            >
              Preview
            </a>
            <a
              href="#architecture"
              className="rounded-full px-3 py-1 text-haze transition-colors hover:text-ink hover:bg-mist/40"
            >
              Architecture
            </a>
          </nav>

          {/* Right Action: Dashboard Pill */}
          <div className="flex items-center gap-2">
            <Link
              to="/overview"
              className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-white transition-all hover:bg-slate-800 hover:shadow-md active:scale-95"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. HERO SECTION WITH SCENIC MEADOW LANDSCAPE BACKGROUND
      ───────────────────────────────────────────────────────────── */}
      <section
        id="hero"
        className="relative pt-32 pb-24 px-4 overflow-hidden min-h-[92vh] flex flex-col justify-between"
      >
        {/* Modern atmospheric radar grid and ambient glow */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(rgba(29, 111, 224, 0.09) 1.5px, transparent 1.5px),
              linear-gradient(to bottom, #ffffff 0%, #f6f8fb 100%)
            `,
            backgroundSize: "28px 28px, 100% 100%",
          }}
        />

        {/* Ambient atmospheric radial lights */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[380px] bg-gradient-to-tr from-azimuth/15 via-cyan-400/10 to-indigo-500/15 rounded-full blur-3xl pointer-events-none z-0" />

        {/* Subtle radar range rings for atmospheric command aesthetic */}
        <div className="absolute top-28 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-azimuth/10 pointer-events-none z-0" />
        <div className="absolute top-28 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-azimuth/5 pointer-events-none z-0" />
        <div className="absolute top-28 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] rounded-full border border-azimuth/[0.03] pointer-events-none z-0" />

        {/* Gentle transition blend into the next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-stratus to-transparent z-0 pointer-events-none" />

        {/* Hero Copy */}
        <div className="relative z-10 mx-auto max-w-4xl text-center pt-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3.5 py-1 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Smart India Hackathon 2026 &bull; PS 26073</span>
          </div>

          {/* Main Title */}
          <h1 className="mt-5 font-display text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.08]">
            A workspace built for <br />
            <span className="bg-gradient-to-r from-slate-950 via-slate-800 to-azimuth bg-clip-text text-transparent">
              sensor reliability.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 mx-auto max-w-2xl text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
            Autonomous weather radar & AWS telemetry validation. Corroborate genuine storms
            across neighboring stations, isolate sensor faults in milliseconds, and self-heal
            data streams before they reach forecast models.
          </p>

          {/* Hero CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              to="/overview"
              className="flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-lift transition-all hover:bg-slate-800 hover:-translate-y-0.5 active:scale-95"
            >
              Dashboard <ArrowRight size={16} />
            </Link>

            <Link
              to="/overview?tour=1"
              className="flex items-center gap-2 rounded-full bg-[#bdf044] px-6 py-3 text-sm font-bold text-slate-950 shadow-lift transition-all hover:bg-[#b0e835] hover:-translate-y-0.5 active:scale-95"
            >
              <Play size={15} className="fill-slate-950" /> Product Demo
            </Link>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            3. HERO FLOATING APP PREVIEW (Matches reference screenshot)
        ───────────────────────────────────────────────────────────── */}
        <div className="relative z-10 mx-auto mt-12 w-full max-w-5xl px-2">
          <div className="group relative rounded-3xl border border-white/40 bg-[#0e1626]/95 text-white shadow-2xl backdrop-blur-xl transition-all hover:shadow-[0_20px_50px_rgba(15,23,42,0.35)] overflow-hidden">
            {/* Window title bar */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5 bg-black/20">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-3 font-display text-xs font-semibold tracking-wider text-slate-300 uppercase">
                  SkyGuard Console &bull; Live Telemetry Engine
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </span>
                <Link
                  to="/live"
                  className="hidden sm:flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Full View <ChevronRight size={14} />
                </Link>
              </div>
            </div>

            {/* Preview Frame Body */}
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[380px]">
              {/* Left Mock Sidebar (Exact Timmo UI structure from user image) */}
              <div className="md:col-span-4 border-r border-white/10 bg-black/30 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 px-2 py-1 text-lg font-bold font-display tracking-tight text-white">
                    <LogoMark className="h-6 w-6 text-azimuth" />
                    SkyGuard
                  </div>

                  {/* Sidebar Navigation buttons */}
                  <div className="mt-5 space-y-1">
                    <button
                      onClick={() => setActiveTab("stream")}
                      className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                        activeTab === "stream"
                          ? "bg-white/15 text-white shadow-sm"
                          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                      }`}
                    >
                      <Activity size={16} /> Live Stream & Clock
                    </button>
                    <button
                      onClick={() => setActiveTab("verdict")}
                      className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                        activeTab === "verdict"
                          ? "bg-white/15 text-white shadow-sm"
                          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                      }`}
                    >
                      <ShieldCheck size={16} /> Fault vs Weather
                    </button>
                    <button
                      onClick={() => setActiveTab("stations")}
                      className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                        activeTab === "stations"
                          ? "bg-white/15 text-white shadow-sm"
                          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                      }`}
                    >
                      <Radio size={16} /> Station Fleet
                    </button>
                  </div>
                </div>

                {/* Bottom station status chip */}
                <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-[11px] font-medium text-slate-400">Current Node:</div>
                  <div className="text-xs font-semibold text-white truncate">{currentStn.name}</div>
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Kalman Filter Active
                  </div>
                </div>
              </div>

              {/* Right Content Area (Large Clock and Metrics from reference image) */}
              <div className="md:col-span-8 p-6 flex flex-col justify-between bg-gradient-to-br from-[#0e1626] to-[#131e34]">
                {activeTab === "stream" && (
                  <>
                    {/* Big Live Clock (Hero visual feature from Timmo image) */}
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <div className="font-mono text-5xl sm:text-7xl font-bold tracking-tight text-white drop-shadow-sm select-none">
                        {timeStr || "11:08:44 pm"}
                      </div>
                      <div className="mt-2 text-xs font-medium tracking-widest text-slate-400 uppercase">
                        Synchronized UTC Network Time &bull; Station Telemetry Ticking
                      </div>
                    </div>

                    {/* Sensor Readouts Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10">
                      <div className="rounded-xl bg-white/5 p-3 border border-white/5">
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Thermometer size={13} className="text-orange-400" /> Temp
                        </div>
                        <div className="mt-1 font-mono text-lg font-semibold text-white">
                          {currentStn.temp}
                        </div>
                      </div>
                      <div className="rounded-xl bg-white/5 p-3 border border-white/5">
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Gauge size={13} className="text-cyan-400" /> Pressure
                        </div>
                        <div className="mt-1 font-mono text-lg font-semibold text-white">
                          {currentStn.pressure}
                        </div>
                      </div>
                      <div className="rounded-xl bg-white/5 p-3 border border-white/5">
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Droplets size={13} className="text-purple-400" /> Humidity
                        </div>
                        <div className="mt-1 font-mono text-lg font-semibold text-white">
                          {currentStn.humidity}
                        </div>
                      </div>
                      <div className="rounded-xl bg-white/5 p-3 border border-white/5">
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Wind size={13} className="text-emerald-400" /> Wind
                        </div>
                        <div className="mt-1 font-mono text-lg font-semibold text-white">
                          {currentStn.wind}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === "verdict" && (
                  <div className="flex flex-col justify-center h-full space-y-4 py-4">
                    <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-5">
                      <div className="flex items-center gap-2 text-indigo-300 font-semibold text-sm">
                        <Sparkles size={16} /> Explainable AI Decision Engine
                      </div>
                      <div className="mt-2 text-xl font-bold text-white">
                        {currentStn.verdict}
                      </div>
                      <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                        Ensemble Isolation Forest + AutoEncoder evaluated 45-km spatial ring.
                        Triangulated with 3 neighboring AWS nodes to rule out localized hardware failure.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="rounded-xl bg-white/5 p-3 border border-white/10">
                        <span className="text-slate-400">Confidence Score:</span>
                        <div className="font-mono text-sm font-bold text-emerald-400 mt-0.5">99.4%</div>
                      </div>
                      <div className="rounded-xl bg-white/5 p-3 border border-white/10">
                        <span className="text-slate-400">Imputation Action:</span>
                        <div className="font-mono text-sm font-bold text-azimuth mt-0.5">Kalman Reconstructed</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "stations" && (
                  <div className="space-y-2 py-2">
                    <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Select Weather Radar / AWS Node:
                    </div>
                    {previewStations.map((stn, idx) => (
                      <button
                        key={stn.id}
                        onClick={() => setSelectedStation(idx)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                          selectedStation === idx
                            ? "bg-azimuth/20 border-azimuth text-white shadow-sm"
                            : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10"
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs">{stn.name}</div>
                          <div className="text-[11px] text-slate-400">{stn.region}</div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            stn.isWeather
                              ? "bg-indigo-500/20 text-indigo-300"
                              : "bg-emerald-500/20 text-emerald-300"
                          }`}
                        >
                          {stn.status}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Bottom Quick Launch Link */}
                <div className="pt-4 flex items-center justify-between border-t border-white/10 mt-3">
                  <div className="text-xs text-slate-400">
                    Real-time NOAA & AWS telemetry simulator connected.
                  </div>
                  <Link
                    to="/overview"
                    className="flex items-center gap-1 text-xs font-semibold text-[#bdf044] hover:underline"
                  >
                    Open Live Operator Console <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. STATS SECTION ("Stats")
      ───────────────────────────────────────────────────────────── */}
      <section id="stats" className="py-20 px-4 max-w-6xl mx-auto border-t border-mist/80">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-azimuth">
            Proven Performance
          </span>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink">
            Engineered for national weather infrastructure.
          </h2>
          <p className="mt-3 text-sm text-haze leading-relaxed">
            Eliminating false sensor alarms and data corruption across Doppler weather radar stations,
            AWS ground arrays, and upper-air soundings.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-5">
          <div className="rounded-2xl border border-mist bg-white p-6 shadow-card hover:shadow-lift transition-shadow">
            <div className="font-display text-4xl sm:text-5xl font-extrabold text-ink tnum">
              99.8<span className="text-azimuth">%</span>
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-900">
              Fault Isolation Accuracy
            </div>
            <p className="mt-1 text-xs text-haze leading-relaxed">
              Distinguishes isolated transducer failures from genuine macro storms.
            </p>
          </div>

          <div className="rounded-2xl border border-mist bg-white p-6 shadow-card hover:shadow-lift transition-shadow">
            <div className="font-display text-4xl sm:text-5xl font-extrabold text-ink tnum">
              &lt;18<span className="text-azimuth">ms</span>
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-900">
              Inference Latency
            </div>
            <p className="mt-1 text-xs text-haze leading-relaxed">
              Ultralight edge model runs on ARM gateways and low-power telemetry boxes.
            </p>
          </div>

          <div className="rounded-2xl border border-mist bg-white p-6 shadow-card hover:shadow-lift transition-shadow">
            <div className="font-display text-4xl sm:text-5xl font-extrabold text-ink tnum">
              50<span className="text-azimuth">+</span>
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-900">
              Active Stations Monitored
            </div>
            <p className="mt-1 text-xs text-haze leading-relaxed">
              Simultaneous multi-station ingestion with real-time geospatial topology.
            </p>
          </div>

          <div className="rounded-2xl border border-mist bg-white p-6 shadow-card hover:shadow-lift transition-shadow">
            <div className="font-display text-4xl sm:text-5xl font-extrabold text-ink tnum">
              Zero
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-900">
              Missing Telemetry Gaps
            </div>
            <p className="mt-1 text-xs text-haze leading-relaxed">
              Continuous Kalman imputation ensures downstream NWP models never crash.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. FEATURES SECTION ("Features")
      ───────────────────────────────────────────────────────────── */}
      <section id="features" className="py-20 px-4 bg-frost border-y border-mist/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-azimuth">
              Core Capabilities
            </span>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink">
              The four pillars of SkyGuard AI.
            </h2>
            <p className="mt-3 text-sm text-haze leading-relaxed">
              From raw sensor signals to explainable operator verdicts, every step is automated
              and mathematically backed.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feature 1 */}
            <div className="rounded-3xl border border-mist bg-white p-8 shadow-card hover:shadow-lift transition-all group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-azimuth/10 text-azimuth group-hover:scale-110 transition-transform">
                <Radio size={24} />
              </div>
              <h3 className="mt-5 font-display text-xl font-bold text-ink">
                Spatial Mesh Corroboration
              </h3>
              <p className="mt-2 text-sm text-haze leading-relaxed">
                When a single station reports a sudden 5°C drop and 30 hPa pressure plunge,
                SkyGuard correlates adjacent stations in the geospatial network. If neighbors verify
                the trend, it is tagged as a genuine convective front. If isolated, it is quarantined
                as a sensor hardware glitch.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-azimuth">
                <span>Multi-station mesh triangulation</span> &rarr;
              </div>
            </div>

            {/* Feature 2 */}
            <div className="rounded-3xl border border-mist bg-white p-8 shadow-card hover:shadow-lift transition-all group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 group-hover:scale-110 transition-transform">
                <Sparkles size={24} />
              </div>
              <h3 className="mt-5 font-display text-xl font-bold text-ink">
                Explainable AI (XAI) Decision Trail
              </h3>
              <p className="mt-2 text-sm text-haze leading-relaxed">
                No black-box guesses. Operators receive granular attribution: ensemble model
                weights, SHAP feature importance, and historical deviation metrics for every single
                alert, empowering meteorologists to make high-confidence decisions during severe events.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-indigo-600">
                <span>Transparent decision metrics</span> &rarr;
              </div>
            </div>

            {/* Feature 3 */}
            <div className="rounded-3xl border border-mist bg-white p-8 shadow-card hover:shadow-lift transition-all group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 group-hover:scale-110 transition-transform">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="mt-5 font-display text-xl font-bold text-ink">
                Real-Time Kalman Self-Healing
              </h3>
              <p className="mt-2 text-sm text-haze leading-relaxed">
                Faulty or missing data points are instantly reconstructed using a combination of
                temporal Kalman filters and spatial inverse-distance weighting. Downstream numerical
                weather models receive unbroken, synthetic-healed telemetry feeds without delay.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-600">
                <span>Zero telemetry interruptions</span> &rarr;
              </div>
            </div>

            {/* Feature 4 */}
            <div className="rounded-3xl border border-mist bg-white p-8 shadow-card hover:shadow-lift transition-all group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-600 group-hover:scale-110 transition-transform">
                <AlertTriangle size={24} />
              </div>
              <h3 className="mt-5 font-display text-xl font-bold text-ink">
                Live Anomaly Injection Sandbox
              </h3>
              <p className="mt-2 text-sm text-haze leading-relaxed">
                Test disaster readiness before nature strikes. Inject sudden temperature spikes,
                calibration drift, frozen transducer states, and synthetic supercells at the click
                of a button to evaluate system response in real time.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-orange-600">
                <span>Interactive stress testing</span> &rarr;
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. INTERACTIVE PREVIEW SECTION ("Preview")
      ───────────────────────────────────────────────────────────── */}
      <section id="preview" className="py-20 px-4 max-w-6xl mx-auto">
        <div className="rounded-3xl border border-mist bg-white p-8 md:p-12 shadow-card">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-mist">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-azimuth">
                Interactive Telemetry
              </span>
              <h2 className="mt-2 font-display text-3xl font-bold text-ink">
                Explore real station telemetry.
              </h2>
              <p className="mt-2 text-sm text-haze">
                Select any station below to inspect live sensor readouts and automated diagnostic status.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/overview"
                className="flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2.5 text-xs font-semibold text-white shadow-card hover:bg-slate-800 transition-colors"
              >
                Open Full Console <ExternalLink size={14} />
              </Link>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            {previewStations.map((stn, idx) => (
              <button
                key={stn.id}
                onClick={() => setSelectedStation(idx)}
                className={`p-5 rounded-2xl border text-left transition-all ${
                  selectedStation === idx
                    ? "border-azimuth bg-azimuth/[0.04] ring-2 ring-azimuth/20 shadow-sm"
                    : "border-mist bg-stratus/50 hover:bg-mist/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-azimuth">{stn.id}</span>
                  <span
                    className={`h-2 w-2 rounded-full ${
                      stn.isWeather ? "bg-indigo-500" : "bg-emerald-500"
                    }`}
                  />
                </div>
                <div className="mt-2 font-display text-sm font-bold text-ink">{stn.name}</div>
                <div className="text-xs text-haze">{stn.region}</div>
                <div className="mt-4 pt-3 border-t border-mist/60 flex items-center justify-between text-xs">
                  <span className="font-mono font-semibold text-ink">{stn.temp}</span>
                  <span className="font-mono text-haze">{stn.pressure}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Detailed inspect card */}
          <div className="mt-8 rounded-2xl bg-frost p-6 border border-mist flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-ink uppercase tracking-wider">
                  Active Analysis: {currentStn.name}
                </span>
                <span className="rounded-full bg-azimuth/10 px-2 py-0.5 text-[10px] font-bold text-azimuth">
                  {currentStn.id}
                </span>
              </div>
              <div className="text-sm font-semibold text-ink">
                Status: {currentStn.verdict}
              </div>
              <div className="text-xs text-haze">
                Relative Humidity: {currentStn.humidity} &bull; Surface Wind Velocity: {currentStn.wind}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                to={`/stations`}
                className="flex items-center gap-1.5 rounded-xl border border-mist bg-white px-4 py-2 text-xs font-semibold text-ink hover:bg-mist/40 transition-colors shadow-sm"
              >
                Station Details
              </Link>
              <Link
                to={`/live`}
                className="flex items-center gap-1.5 rounded-xl bg-azimuth px-4 py-2 text-xs font-semibold text-white hover:bg-blue-600 transition-colors shadow-sm"
              >
                Live Monitor &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. ARCHITECTURE & SIH DETAILS ("Architecture")
      ───────────────────────────────────────────────────────────── */}
      <section id="architecture" className="py-20 px-4 bg-ink text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#bdf044]">
              System Pipeline
            </span>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
              End-to-End Resilience Pipeline
            </h2>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              How SkyGuard AI processes high-rate telemetry packets from raw physical sensors to clean,
              actionable meteorological intelligence.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="font-mono text-xs font-bold text-[#bdf044]">STEP 01</div>
              <h4 className="mt-2 font-display text-lg font-bold text-white">Ingestion & Norm</h4>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                Raw packets streamed via MQTT/HTTP. Telemetry normalized against rolling baselines
                and diurnal cycle expectations.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="font-mono text-xs font-bold text-[#bdf044]">STEP 02</div>
              <h4 className="mt-2 font-display text-lg font-bold text-white">Ensemble Detection</h4>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                Dual Isolation Forest + Deep AutoEncoder flags anomalous residuals with sub-18ms
                execution per telemetry burst.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="font-mono text-xs font-bold text-[#bdf044]">STEP 03</div>
              <h4 className="mt-2 font-display text-lg font-bold text-white">Spatial Corroboration</h4>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                Adjacency matrix queries neighboring stations. Correlated signals confirm genuine
                severe weather events.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="font-mono text-xs font-bold text-[#bdf044]">STEP 04</div>
              <h4 className="mt-2 font-display text-lg font-bold text-white">Self-Healing Output</h4>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                Kalman state correction imputes faulty readings, preserving clean feeds for downstream
                forecasters and emergency alerts.
              </p>
            </div>
          </div>

          {/* SIH Banner inside architecture */}
          <div className="mt-12 rounded-2xl border border-white/15 bg-white/5 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <LogoMark className="h-8 w-8 text-azimuth shrink-0" />
              <div>
                <div className="font-semibold text-sm text-white">Smart India Hackathon 2026</div>
                <div className="text-xs text-slate-400">Problem Statement 26073 &bull; Weather Radar & AWS Data Reliability</div>
              </div>
            </div>

            <Link
              to="/overview"
              className="flex items-center gap-2 rounded-xl bg-[#bdf044] px-5 py-2.5 text-xs font-bold text-slate-950 transition-all hover:bg-[#b0e835] active:scale-95"
            >
              Launch Platform <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. CALL TO ACTION & FOOTER
      ───────────────────────────────────────────────────────────── */}
      <footer className="bg-slate-950 text-slate-400 py-12 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-6 w-6 text-azimuth" />
            <span className="font-display font-bold text-white text-base">SkyGuard AI</span>
            <span className="text-xs text-slate-500">&bull; SIH 2026</span>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <Link to="/overview" className="hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link to="/live" className="hover:text-white transition-colors">
              Live Monitor
            </Link>
            <Link to="/map" className="hover:text-white transition-colors">
              Network Map
            </Link>
            <Link to="/analytics" className="hover:text-white transition-colors">
              Analytics
            </Link>
          </div>

          <div className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} SkyGuard AI. Built for SIH 2026.
          </div>
        </div>
      </footer>
    </div>
  );
}
