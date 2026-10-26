import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { ChevronLeft, ChevronRight, X, Sparkles, CheckCircle2 } from "lucide-react";

const TOUR_KEY = "skyguard.productTour.v2";
const START_EVENT = "skyguard:start-tour";

type Step = {
  title: string;
  badge: string;
  body: string;
  route: string;
  target: string | null;
};

const steps: Step[] = [
  {
    title: "Network at a glance",
    badge: "Telemetry Health",
    body: "Live streaming KPIs across all active weather radar and AWS stations. If backend telemetry is offline, intelligent fallback demo mode keeps the dashboard fully interactive.",
    route: "/overview",
    target: '[data-tour="overview-kpis"]',
  },
  {
    title: "Fault vs Weather Verdict",
    badge: "Core AI Engine",
    body: "Every anomaly is classified in real time: hardware sensor faults are isolated and repaired via Kalman estimation, while genuine severe weather is corroborated with neighbors and preserved.",
    route: "/overview",
    target: '[data-tour="verdict-band"]',
  },
  {
    title: "Real-time Telemetry Controls",
    badge: "Live Monitor",
    body: "Switch stations, toggle real NOAA vs synthetic feeds, and tune playback rate. This control strip synchronizes streaming telemetry across all diagnostic cards.",
    route: "/live",
    target: '[data-tour="live-controls"]',
  },
  {
    title: "Fault Injection Sandbox",
    badge: "Simulation",
    body: "Inject synthetic spikes, stuck transducers, calibration drifts, or convective storm fronts to test detection accuracy and self-healing under extreme stress.",
    route: "/live",
    target: '[data-tour="injection"]',
  },
  {
    title: "Explainable AI Decision Trail",
    badge: "Interpretability",
    body: "Inspect ensemble model weights, feature attributions, and spatial corroboration metrics. Freeze telemetry at any moment to dissect individual frame decisions.",
    route: "/live",
    target: '[data-tour="explain"]',
  },
  {
    title: "Fleet Station Directory",
    badge: "Geospatial Fleet",
    body: "Search, filter, and inspect station telemetry and hardware sensor health. Click any station row to drill into high-frequency historical analytics.",
    route: "/stations",
    target: '[data-tour="stations-table"]',
  },
  {
    title: "You are ready to explore!",
    badge: "Ready",
    body: "You now understand the complete SkyGuard loop: monitor live feeds, simulate anomalies, inspect explainable verdicts, and safeguard weather network integrity.",
    route: "/overview",
    target: null,
  },
];

/** Replay or launch the guided tour from anywhere. */
export function startTour() {
  window.dispatchEvent(new Event(START_EVENT));
}

/** Clear seen flag to allow auto-launching again. */
export function clearTourSeen() {
  try {
    localStorage.removeItem(TOUR_KEY);
  } catch {
    /* ignore private mode */
  }
}

type Hole = { top: number; left: number; width: number; height: number };

export default function ProductTour() {
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);
  const [hole, setHole] = useState<Hole | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const nextBtnRef = useRef<HTMLButtonElement | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const step = steps[i];

  const finish = useCallback(() => {
    try {
      localStorage.setItem(TOUR_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
    // Remove query param if present
    if (searchParams.get("tour")) {
      searchParams.delete("tour");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const next = useCallback(() => {
    if (i < steps.length - 1) {
      setI((prev) => prev + 1);
    } else {
      finish();
    }
  }, [i, finish]);

  const prev = useCallback(() => {
    setI((curr) => Math.max(0, curr - 1));
  }, []);

  // Check URL query param `?tour=1` or `?tour=true`
  useEffect(() => {
    if (searchParams.get("tour") === "1" || searchParams.get("tour") === "true") {
      setI(0);
      setOpen(true);
    }
  }, [searchParams]);

  // Global event listener to start tour
  useEffect(() => {
    const onStart = () => {
      setI(0);
      setOpen(true);
    };
    window.addEventListener(START_EVENT, onStart);
    return () => window.removeEventListener(START_EVENT, onStart);
  }, []);

  // Ensure user is on the correct route for this step
  useEffect(() => {
    if (!open) return;
    if (pathname !== step.route) {
      navigate(step.route);
    }
  }, [open, step.route, pathname, navigate]);

  // Measure element, smooth scroll into view, and track during scroll/resize
  useEffect(() => {
    if (!open || !step.target) {
      setHole(null);
      return;
    }

    let active = true;
    let timeoutId: ReturnType<typeof setTimeout>;

    const updatePosition = () => {
      if (!active) return;
      const el = document.querySelector(step.target as string);
      if (el) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          setHole({
            top: r.top,
            left: r.left,
            width: r.width,
            height: r.height,
          });
        }
      }
    };

    // Scroll target into view gently on step change
    const scrollToTarget = () => {
      const el = document.querySelector(step.target as string);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      }
      updatePosition();
    };

    // Immediate attempt + delayed attempts to allow React route transition to settle
    scrollToTarget();
    timeoutId = setTimeout(scrollToTarget, 300);

    const onScrollOrResize = () => {
      requestAnimationFrame(updatePosition);
    };

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });

    const interval = setInterval(updatePosition, 400);

    return () => {
      active = false;
      clearTimeout(timeoutId);
      clearInterval(interval);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open, i, step.target, pathname]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    nextBtnRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, finish, next, prev]);

  if (!open) return null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cardW = Math.min(420, vw - 32);

  let cardTop = (vh - 280) / 2;
  let cardLeft = (vw - cardW) / 2;
  let placement: "below" | "above" | "center" = "center";

  if (step.target && hole) {
    const cardH = cardRef.current ? cardRef.current.offsetHeight : 240;
    const spaceBelow = vh - (hole.top + hole.height + 16);
    const spaceAbove = hole.top - 16;

    if (spaceBelow >= cardH) {
      cardTop = hole.top + hole.height + 14;
      placement = "below";
    } else if (spaceAbove >= cardH) {
      cardTop = Math.max(16, hole.top - cardH - 14);
      placement = "above";
    } else {
      // Dock near bottom
      cardTop = Math.max(16, vh - cardH - 24);
      placement = "below";
    }

    cardLeft = Math.max(16, Math.min(hole.left + hole.width / 2 - cardW / 2, vw - cardW - 16));
  }

  return (
    <>
      {/* Dim overlay with SVG mask */}
      <svg
        className="fixed inset-0 z-[1000] h-full w-full pointer-events-none"
        aria-hidden="true"
      >
        <defs>
          <mask id="skyguard-tour-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {hole && step.target && (
              <rect
                x={Math.max(0, hole.left - 8)}
                y={Math.max(0, hole.top - 8)}
                width={hole.width + 16}
                height={hole.height + 16}
                rx="14"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(15, 27, 45, 0.65)"
          mask="url(#skyguard-tour-mask)"
          className="transition-all duration-300 ease-out"
        />
      </svg>

      {/* Target spotlight ring */}
      {hole && step.target && (
        <div
          aria-hidden="true"
          className="fixed z-[1001] pointer-events-none rounded-2xl border-2 border-azimuth shadow-[0_0_24px_rgba(29,111,224,0.45)] transition-all duration-300 ease-out animate-pulse"
          style={{
            top: Math.max(0, hole.top - 8),
            left: Math.max(0, hole.left - 8),
            width: hole.width + 16,
            height: hole.height + 16,
          }}
        >
          <span className="absolute -top-3 left-3 flex items-center gap-1 rounded-full bg-azimuth px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
            <Sparkles size={11} />
            Step {i + 1}
          </span>
        </div>
      )}

      {/* Tour Dialog Card */}
      <div
        ref={cardRef}
        role="dialog"
        aria-label={`Product tour: ${step.title} (Step ${i + 1} of ${steps.length})`}
        className="fixed z-[1002] rounded-2xl border border-mist/80 bg-white p-5 shadow-lift transition-all duration-200"
        style={{
          width: cardW,
          top: cardTop,
          left: cardLeft,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-mist/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-azimuth/10 px-2 py-0.5 text-[11px] font-semibold text-azimuth">
              {step.badge}
            </span>
            <span className="font-mono text-xs text-haze">
              {i + 1} of {steps.length}
            </span>
          </div>

          <button
            onClick={finish}
            aria-label="Exit tour"
            title="Exit tour"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-haze transition-colors hover:bg-mist/60 hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="mt-3.5">
          <h2 className="font-display text-[17px] font-bold tracking-tight text-ink">
            {step.title}
          </h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-haze">
            {step.body}
          </p>
        </div>

        {/* Step dots */}
        <div className="mt-4 flex items-center justify-center gap-1.5 py-1">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`Jump to step ${idx + 1}`}
              className={`h-2 rounded-full transition-all ${
                idx === i
                  ? "w-6 bg-azimuth"
                  : "w-2 bg-mist hover:bg-haze/40"
              }`}
            />
          ))}
        </div>

        {/* Footer actions */}
        <div className="mt-4 flex items-center justify-between pt-2 border-t border-mist/60">
          <button
            onClick={prev}
            disabled={i === 0}
            className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold text-haze transition-colors hover:bg-mist/50 hover:text-ink disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeft size={14} /> Back
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={finish}
              className="rounded-xl px-2.5 py-1.5 text-xs font-medium text-haze transition-colors hover:bg-mist/50 hover:text-ink"
            >
              Skip
            </button>
            <button
              ref={nextBtnRef}
              onClick={next}
              className="flex items-center gap-1.5 rounded-xl bg-azimuth px-4 py-2 text-xs font-semibold text-white shadow-card transition-all hover:bg-blue-600 hover:shadow-lift active:scale-95"
            >
              {i < steps.length - 1 ? (
                <>
                  Next <ChevronRight size={14} />
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} /> Complete Tour
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
