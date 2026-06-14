/**
 * Per-project hairline "lab-notebook" diagrams — thin strokes, mono labels,
 * `currentColor` so they re-ink in Ink mode. Each loops one quiet gesture that
 * explains what the project does. Pure SVG + CSS keyframes (see globals.css):
 * zero client JS. Ported from the design bundle's distinct.html.
 */

const DIAG = {
  viewBox: "0 0 140 100",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 0.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const

const LABEL = {
  fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
  fontSize: 4.5,
  letterSpacing: 0.4,
  fill: "currentColor",
  opacity: 0.65,
} as const

/* 01 — Course Scheduler: scanning cursor sweeps the week; blocks reveal per column */
function DiagScheduler() {
  const cols = 5,
    rows = 6
  const x0 = 16,
    y0 = 14,
    w = 22,
    h = 11
  const blocks = [
    { c: 0, r: 0, s: 2 },
    { c: 0, r: 4, s: 2 },
    { c: 1, r: 1, s: 1 },
    { c: 1, r: 4, s: 1 },
    { c: 2, r: 0, s: 3 },
    { c: 3, r: 0, s: 1 },
    { c: 3, r: 2, s: 2 },
    { c: 4, r: 3, s: 2 },
  ]
  const CYCLE = 6
  return (
    <svg {...DIAG}>
      {["M", "T", "W", "Th", "F"].map((d, i) => (
        <text key={i} x={x0 + i * w + w / 2} y={9} textAnchor="middle" {...LABEL}>
          {d}
        </text>
      ))}
      {Array.from({ length: cols + 1 }).map((_, i) => (
        <line key={`v${i}`} x1={x0 + i * w} y1={y0} x2={x0 + i * w} y2={y0 + rows * h} opacity="0.35" />
      ))}
      {Array.from({ length: rows + 1 }).map((_, i) => (
        <line key={`h${i}`} x1={x0} y1={y0 + i * h} x2={x0 + cols * w} y2={y0 + i * h} opacity="0.35" />
      ))}
      {["9", "10", "11", "12", "1", "2"].map((hh, i) => (
        <text key={i} x={x0 - 3} y={y0 + i * h + h / 2 + 1.5} textAnchor="end" {...LABEL}>
          {hh}
        </text>
      ))}
      {blocks.map((b, i) => {
        const delay = (b.c / cols) * (CYCLE * 0.55)
        return (
          <g
            key={i}
            style={{
              transformOrigin: `${x0 + b.c * w + w / 2}px ${y0 + (b.r + b.s / 2) * h}px`,
              animation: `zc-reveal-seq ${CYCLE}s ${delay}s ease-out infinite`,
            }}
          >
            <rect x={x0 + b.c * w + 1.2} y={y0 + b.r * h + 1.2} width={w - 2.4} height={b.s * h - 2.4} fill="currentColor" opacity="0.14" />
            <rect x={x0 + b.c * w + 1.2} y={y0 + b.r * h + 1.2} width={w - 2.4} height={b.s * h - 2.4} />
          </g>
        )
      })}
      <g style={{ animation: `zc-scan-x ${CYCLE}s ease-in-out infinite` }}>
        <line x1={x0} y1={y0 - 2} x2={x0} y2={y0 + rows * h + 2} strokeWidth={0.8} opacity="0.9" />
      </g>
      <text x={4} y={96} {...LABEL}>
        FIG. A · GREEDY PACK · C=5 R=6
      </text>
    </svg>
  )
}

/* 02 — ATS: a single dot traverses the pipeline end-to-end; bars grow as score settles */
function DiagATS() {
  const nodes = [
    { x: 18, label: "INBOX" },
    { x: 52, label: "PARSE" },
    { x: 88, label: "SCORE" },
    { x: 122, label: "TRIAGE" },
  ]
  const bars = [0.8, 0.55, 0.9, 0.35, 0.7, 0.6]
  const pathD = `M ${nodes[0].x + 11} 42 L ${nodes[3].x - 11} 42`
  return (
    <svg {...DIAG}>
      <line x1={nodes[0].x + 11} y1={42} x2={nodes[3].x - 11} y2={42} strokeDasharray="1.5 1.5" opacity="0.5" />
      {nodes.map((n, i) => (
        <g key={i}>
          <rect x={n.x - 11} y={34} width={22} height={16} fill="var(--surface-raised)" />
          <rect x={n.x - 11} y={34} width={22} height={16} />
          <text x={n.x} y={44.5} textAnchor="middle" {...LABEL}>
            {n.label}
          </text>
        </g>
      ))}
      <circle
        r={1.6}
        fill="currentColor"
        style={{
          offsetPath: `path('${pathD}')`,
          animation: "zc-dot-traverse 4.2s cubic-bezier(0.65,0,0.35,1) infinite",
        }}
      />
      {nodes.map((n, i) => (
        <rect
          key={`halo${i}`}
          x={n.x - 13}
          y={32}
          width={26}
          height={20}
          fill="none"
          strokeWidth={0.8}
          opacity={0}
          style={{ animation: `zc-pulse 4.2s ${i * 1.05}s ease-in-out infinite` }}
        />
      ))}
      {bars.map((v, i) => (
        <g
          key={i}
          style={{
            transformOrigin: `${25 + i * 16}px 82px`,
            animation: `zc-bar-grow 4.2s ${2.8 + i * 0.08}s cubic-bezier(0.4, 1.4, 0.5, 1) infinite`,
          }}
        >
          <rect x={20 + i * 16} y={82 - v * 18} width={10} height={v * 18} fill="currentColor" opacity="0.18" />
          <rect x={20 + i * 16} y={82 - v * 18} width={10} height={v * 18} />
        </g>
      ))}
      <text x={4} y={96} {...LABEL}>
        FIG. B · 2-PL LOGISTIC · K=6
      </text>
      <text x={4} y={20} {...LABEL}>
        GMAIL API →
      </text>
    </svg>
  )
}

/* 03 — IMU + audio: static waveforms, a vertical scope-cursor sweeps both channels */
function DiagIMU() {
  const imu = Array.from({ length: 141 })
    .map((_, i) => {
      const v = Math.sin(i * 0.28) * 5 + Math.sin(i * 0.71) * 2 + Math.sin(i * 0.13) * 3
      return `${i === 0 ? "M" : "L"}${i},${28 + v}`
    })
    .join(" ")
  const audioBars = Array.from({ length: 70 }).map((_, i) => {
    const x = i * 2
    const env = Math.abs(Math.sin(x * 0.11 + 1.2)) * 11 * (0.55 + 0.45 * Math.sin(x * 0.04))
    return { x, h: env }
  })
  return (
    <svg {...DIAG}>
      <text x={4} y={12} {...LABEL}>
        CH-01 · IMU · ACCEL-Y
      </text>
      <text x={4} y={56} {...LABEL}>
        CH-02 · AUDIO · ENV
      </text>
      <line x1={0} y1={28} x2={140} y2={28} opacity="0.25" />
      <line x1={0} y1={72} x2={140} y2={72} opacity="0.25" />
      <path d={imu} strokeWidth={0.7} strokeDasharray="2 0" style={{ animation: "zc-wave-flow 5s linear infinite" }} />
      {audioBars.map((a, i) => (
        <line
          key={i}
          x1={a.x}
          y1={72 - a.h / 2}
          x2={a.x}
          y2={72 + a.h / 2}
          strokeWidth={0.8}
          opacity={0.35 + a.h / 30}
          style={{ animation: `zc-pulse ${2.5 + (i % 3) * 0.4}s ${(i * 0.04) % 1.5}s ease-in-out infinite` }}
        />
      ))}
      <g style={{ animation: "zc-scan-x 5s ease-in-out infinite" }}>
        <line x1={0} y1={5} x2={0} y2={90} strokeWidth={0.8} opacity="0.85" />
        <circle cx={0} cy={28} r={1.4} fill="currentColor" />
        <circle cx={0} cy={72} r={1.4} fill="currentColor" />
      </g>
      <text x={4} y={96} {...LABEL}>
        FIG. C · 50HZ · N=1.1k
      </text>
    </svg>
  )
}

/* 04 — VR: isometric room steady; gesture trail redraws, viewer pings at the target */
function DiagVR() {
  return (
    <svg {...DIAG}>
      <g transform="translate(70 52)">
        <path d="M -40 0 L 0 -20 L 40 0 L 0 20 Z" opacity="0.35" />
        <g opacity="0.7">
          <path d="M -32 -4 L -8 -16 L -8 -10 L -32 2 Z" />
          <path d="M 8 -16 L 32 -4 L 32 2 L 8 -10 Z" />
          <path d="M -20 10 L 0 0 L 20 10 L 0 20 Z" />
        </g>
        <circle cx="0" cy="4" r="1.8" fill="currentColor" />
        <circle cx="0" cy="4" r="5" opacity="0" strokeWidth={0.6} style={{ animation: "zc-pulse 3.8s ease-in-out infinite" }} />
      </g>
      <path d="M 22 78 Q 50 70 70 58 T 118 32" strokeWidth={0.9} strokeDasharray="200" style={{ animation: "zc-gesture 3.8s ease-out infinite" }} />
      <circle cx={118} cy={32} r={1.6} fill="currentColor" style={{ animation: "zc-pulse 3.8s 2.5s ease-in-out infinite" }} />
      <text x={4} y={12} {...LABEL}>
        ROOM · ISO 2:1
      </text>
      <text x={4} y={96} {...LABEL}>
        FIG. D · GESTURE · P=0.92
      </text>
    </svg>
  )
}

export function ProjectDiagram({ kind }: { kind?: "scheduler" | "ats" | "imu" | "vr" }) {
  switch (kind) {
    case "scheduler":
      return <DiagScheduler />
    case "ats":
      return <DiagATS />
    case "imu":
      return <DiagIMU />
    case "vr":
      return <DiagVR />
    default:
      return null
  }
}
