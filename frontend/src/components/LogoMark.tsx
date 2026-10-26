// SkyGuard brand mark — a watchtower shield broadcasting station telemetry.
// The mast reads "automated weather station", the arcs read "live signal", the
// shield reads "protection / monitoring". Used in the nav rail and favicon
// (public/skyguard.svg mirrors this geometry for the browser tab).
export default function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label="SkyGuard AI logo"
    >
      <path
        d="M24 3 L41 9 V23 C41 33.5 34.2 40.6 24 45 C13.8 40.6 7 33.5 7 23 V9 Z"
        className="text-azimuth"
        fill="currentColor"
      />
      <g
        stroke="#ffffff"
        strokeWidth={2.4}
        strokeLinecap="round"
        fill="none"
      >
        <path d="M24 17 L19.5 36 M24 17 L28.5 36" />
        <path d="M21.6 26.5 H26.4 M20.4 31.5 H27.6" />
        <path d="M19.24 12.75 A5.5 5.5 0 0 1 28.76 12.75" opacity={0.95} strokeWidth={2.2} />
        <path d="M15.77 10.75 A9.5 9.5 0 0 1 32.23 10.75" opacity={0.5} strokeWidth={2.2} />
      </g>
      <circle cx={24} cy={15.5} r={2.2} fill="#ffffff" />
    </svg>
  );
}
