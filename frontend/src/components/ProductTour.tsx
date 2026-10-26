import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const TOUR_KEY = "skyguard.productTour.v1";
const START_EVENT = "skyguard:start-tour";

type Step = {
  title: string;
  body: string;
  route: string;
  // null = terminal step (no target, centered card over a plain dim)
  target: string | null;
};

const steps: Step[] = [
  {
    title: "Network at a glance",
    body: "Every KPI streams in from the stations — online count, active anomalies, detection latency. If the backend is not connected, the whole app falls back to representative demo data instead of blanking.",
    route: "/overview",
    target: '[data-tour="overview-kpis"]',
  },
  {
    title: "Fault vs weather — the core question",
    body: "Every anomaly is classified before any healing: sensor faults are isolated and repaired, genuine weather is corroborated and left untouched. This band reconciles all three for the last 24 hours.",
    route: "/overview",
    target: '[data-tour="verdict-band"]',
  },
  {
    title: "Run the stream",
    body: "Pick a station, choose the data source, set the playback rate, then start or stop the telemetry. This one control strip drives the entire Live Monitor page.",
    route: "/live",
    target: '[data-tour="live-controls"]',
  },
  {
    title: "Break things on purpose",
    body: "Inject a temperature spike, a stuck sensor, calibration drift — even a genuine thunderstorm — and watch detection and self-healing respond live.",
    route: "/live",
    target: '[data-tour="injection"]',
  },
  {
    title: "The decision, explained",
    body: "The explainable-AI panel shows the verdict (fault or weather), the evidence behind it, neighbouring-station agreement, and exactly how the reading was healed. Freeze the stream any time to inspect one frame.",
    route: "/live",
    target: '[data-tour="explain"]',
  },
  {
    title: "Every station on one screen",
    body: "Filter and search across the network, then click (or press Enter on) any row to drill into that station's telemetry, sensor health and recent anomalies.",
    route: "/stations",
    target: '[data-tour="stations-table"]',
  },
  {
    title: "You're set",
    body: "That's the full loop: watch the network, drill into anomalies, inject scenarios and inspect every decision. Replay this tour any time from the help button in the top bar or from Settings.",
    route: "/overview",
    target: null,
  },
];

/** Replay the guided tour (TopBar help button, Settings). */
export function startTour() {
  window.dispatchEvent(new Event(START_EVENT));
}

/** Forget the "seen" flag so the tour launches on the next app load. */
export function clearTourSeen() {
  try {
    localStorage.removeItem(TOUR_KEY);
  } catch {
    /* storage unavailable (private mode) — tour still works this session */
  }
}

type Hole = { top: number; left: number; width: number; height: number } | null;

export default function ProductTour() {
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);
  const [hole, setHole] = useState<Hole>(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const step = steps[i];
  const nextBtnRef = useRef<HTMLButtonElement | null>(null);

  const next = useCallback(() => {
    setI((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
  }, []);

  const finish = useCallback(() => {
    try {
      localStorage.setItem(TOUR_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  }, []);

  // First-visit auto-launch (skipped when storage says the tour was done).
  useEffect(() => {
    let seen = false;
    try {
      seen = localStorage.getItem(TOUR_KEY) === "1";
    } catch {
      /* ignore */
    }
    if (seen) return;
    const t = setTimeout(() => {
      setI(0);
      setOpen(true);
    }, 900);
    return () => clearTimeout(t);
  }, []);

  // Manual start (help button / Settings replay).
  useEffect(() => {
    const onStart = () => {
      setI(0);
      setOpen(true);
    };
    window.addEventListener(START_EVENT, onStart);
    return () => window.removeEventListener(START_EVENT, onStart);
  }, []);

  // Drive navigation, then measure the highlighted element.
  useEffect(() => {
    if (!open) return;
    if (!step.target) {
      setHole(null);
      return;
    }
    if (pathname !== step.route) navigate(step.route);
  }, [open, i, step, pathname, navigate]);

  // Keep the spotlight locked onto the target while the SPA transition and the
  // rise-in entrance animation settle.
  useEffect(() => {
    if (!open || !step.target) {
      setHole(null);
      return;
    }
    let alive = true;
    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;
    const measure = () => {
      if (!alive) return;
      const el = document.querySelector(step.target as string);
      if (el) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          setHole({ top: r.top, left: r.left, width: r.width, height: r.height });
        }
      }
      if (tries++ < 14) timer = setTimeout(measure, 110);
    };
    measure();
    const onResize = measure;
    window.addEventListener("resize", onResize);
    return () => {
      alive = false;
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, [open, i, step, pathname]);

  // Keyboard: Esc exits, arrows step. Focus goes to Next on every step change.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") setI((prev) => Math.max(0, prev - 1));
    };
    window.addEventListener("keydown", onKey);
    nextBtnRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, finish, next]);

  if (!open) return null;

  const pad = 9;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const holeBox =
    hole
      ? {
          top: Math.max(hole.top - pad, 8),
          left: Math.max(hole.left - pad, 8),
          width: Math.min(hole.width + pad * 2, vw - 16),
          height: Math.min(hole.height + pad * 2, vh - 16),
        }
      : null;

  const cardW = Math.min(368, vw - 32);
  let cardStyle: { top: number; left: number } | undefined;
  if (holeBox) {
    const belowTop = holeBox.top + holeBox.height + 14;
    const spaceBelow = vh - belowTop;
    const aboveTop = holeBox.top - 208;
    cardStyle =
      spaceBelow >= 208 || aboveTop < 8
        ? { top: Math.min(belowTop, vh - 190), left: holeBox.left + holeBox.width / 2 - cardW / 2 }
        : { top: Math.max(12, aboveTop), left: holeBox.left + holeBox.width / 2 - cardW / 2 };
    cardStyle.left = Math.max(16, Math.min(cardStyle.left, vw - cardW - 16));
  } else {
    cardStyle = { top: (vh - 240) / 2, left: (vw - cardW) / 2 };
  }

  return (
    <>
      {step.target && holeBox ? (
        <div
          aria-hidden
          className="fixed z-[1000] pointer-events-none rounded-xl"
          style={{ ...holeBox, boxShadow: "0 0 0 100000px rgba(15, 27, 45, 0.55)", transition: "all 180ms ease-out" }}
        />
      ) : (
        <div aria-hidden className="fixed inset-0 z-[1000]" style={{ background: "rgba(15, 27, 45, 0.45)" }} />
      )}

      <div
        role="dialog"
        aria-label={`Product tour — ${step.title} (step ${i + 1} of ${steps.length})`}
        className="fixed z-[1001] rounded-2xl border border-mist bg-white p-5 shadow-lift"
        style={{ width: cardW, top: cardStyle.top, left: cardStyle.left }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="font-mono text-[11px] font-medium text-haze">
            {i + 1} / {steps.length}
          </div>
          <button
            onClick={finish}
            aria-label="Skip tour"
            className="flex h-6 w-6 items-center justify-center rounded-md text-haze hover:bg-mist/50 hover:text-ink"
          >
            <X size={15} />
          </button>
        </div>
        <h2 className="mt-1 font-display text-[17px] font-semibold text-ink">{step.title}</h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-haze">{step.body}</p>
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={() => setI(Math.max(0, i - 1))}
            disabled={i === 0}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-haze transition-colors hover:bg-mist/50 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={14} /> Back
          </button>
          <button
            ref={nextBtnRef}
            onClick={() => (i < steps.length - 1 ? setI(i + 1) : finish())}
            className="ml-auto flex items-center gap-1 rounded-xl bg-azimuth px-4 py-2 text-sm font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5"
          >
            {i < steps.length - 1 ? "Next" : "Finish"}
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </>
  );
}
