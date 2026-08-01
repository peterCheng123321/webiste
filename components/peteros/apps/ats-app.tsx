"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

const KEYWORDS = [
  { k: "python", w: 8 },
  { k: "typescript", w: 8 },
  { k: "node", w: 7 },
  { k: "react", w: 6 },
  { k: "machine learning", w: 10 },
  { k: "pytorch", w: 9 },
  { k: "backend", w: 8 },
  { k: "api", w: 6 },
  { k: "postgres", w: 7 },
  { k: "aws", w: 7 },
  { k: "computer vision", w: 9 },
  { k: "segmentation", w: 8 },
  { k: "research", w: 5 },
  { k: "distributed", w: 7 },
  { k: "internship", w: 4 },
]

const SAMPLE = `Backend engineering intern with experience in Node.js, TypeScript, and PostgreSQL.
Built ML pipelines with PyTorch for computer vision segmentation.
Cut API latency 45% and shipped REST endpoints on AWS.`

const STAGES = ["Ingest", "Parse", "Keywords", "Score", "Route"] as const

function matchesKeyword(text: string, keyword: string) {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const normalized = escaped.replace(/\\ /g, "\\s+")
  const variant =
    keyword === "postgres"
      ? "postgres(?:ql)?"
      : keyword === "node"
        ? "node(?:\\.js)?"
        : normalized
  return new RegExp(`\\b${variant}\\b`, "i").test(text)
}

export function AtsApp() {
  const [text, setText] = useState(SAMPLE)
  const [stage, setStage] = useState(-1)
  const [score, setScore] = useState(0)
  const [scanState, setScanState] = useState<"idle" | "running" | "done">("idle")
  const timersRef = useRef<number[]>([])

  const analysis = useMemo(() => {
    const hits = KEYWORDS.filter((x) => matchesKeyword(text, x.k))
    const raw = hits.reduce((a, h) => a + h.w, 0)
    const max = KEYWORDS.reduce((a, h) => a + h.w, 0)
    const pct = Math.min(99, Math.round((raw / max) * 100 + (text.length > 120 ? 5 : 0)))
    return { hits, pct }
  }, [text])

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer))
    timersRef.current = []
  }, [])

  useEffect(() => clearTimers, [clearTimers])

  const reset = useCallback(() => {
    clearTimers()
    setScanState("idle")
    setScore(0)
    setStage(-1)
  }, [clearTimers])

  const run = () => {
    clearTimers()
    setScanState("running")
    setScore(0)
    setStage(0)

    STAGES.forEach((_, index) => {
      const timer = window.setTimeout(() => {
        setStage(index)
        setScore(Math.round((analysis.pct * (index + 1)) / STAGES.length))
      }, index * 280)
      timersRef.current.push(timer)
    })

    timersRef.current.push(
      window.setTimeout(() => {
        setScore(analysis.pct)
        setStage(STAGES.length)
        setScanState("done")
      }, STAGES.length * 280),
    )
  }

  return (
    <div className="mac-app ats-app">
      <div className="ats-top ats-commandbar">
        <div className="ats-command-copy">
          <span>Keyword triage</span>
          <strong>{scanState === "running" ? STAGES[Math.min(stage, STAGES.length - 1)] : scanState === "done" ? "Scan complete" : "Ready"}</strong>
        </div>
        <button
          type="button"
          className="mac-btn primary"
          onClick={run}
          disabled={scanState === "running" || text.trim().length === 0}
          data-window-focus
        >
          {scanState === "running" ? "Scanning…" : scanState === "done" ? "Scan again" : "Run scan"}
        </button>
      </div>

      <div className="ats-pipeline" aria-label="Scan pipeline" aria-busy={scanState === "running"}>
        {STAGES.map((name, i) => (
          <div
            key={name}
            className={
              scanState === "done" || stage > i
                ? "ats-stage done"
                : stage === i
                  ? "ats-stage active"
                  : "ats-stage"
            }
          >
            <span className="ats-stage-num">{i + 1}</span>
            <span>{name}</span>
          </div>
        ))}
      </div>

      <div className="ats-layout">
        <div className="ats-input-col">
          <label htmlFor="ats-ta">Application blurb</label>
          <textarea
            id="ats-ta"
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              reset()
            }}
            rows={8}
            spellCheck={false}
          />
          <div className="ats-input-meta">
            <span>Paste a cover letter or LinkedIn About</span>
            <span>{text.length} characters</span>
          </div>
        </div>

        <div className="ats-result-col">
          <div className="ats-score-card">
            <span>Match score</span>
            <strong>{stage >= 0 ? `${score}%` : "—"}</strong>
            <progress max={100} value={score} aria-label="Application match score">
              {score}%
            </progress>
            <small>Portfolio demo · heuristic keyword weighting</small>
          </div>

          {scanState === "idle" && (
            <div className="ats-idle">
              Ready to scan. Results stay local to this window.
            </div>
          )}

          {scanState === "running" && (
            <div className="ats-idle" role="status" aria-live="polite">
              Running {STAGES[Math.min(stage, STAGES.length - 1)]}…
            </div>
          )}

          {scanState === "done" && (
            <>
              <div className="ats-verdict" role="status" aria-live="polite">
                {analysis.pct >= 70
                  ? "Strong match — ship it."
                  : analysis.pct >= 40
                    ? "Decent — add more stack keywords."
                    : "Thin match — rewrite with concrete tech."}
              </div>
              <div className="ats-hits">
                <h3>Keywords hit ({analysis.hits.length})</h3>
                <div className="ats-hit-list">
                  {analysis.hits.length === 0 ? (
                    <span className="ats-miss">none yet</span>
                  ) : (
                    analysis.hits.map((h) => (
                      <span key={h.k} className="ats-hit">
                        {h.k}
                        <em>+{h.w}</em>
                      </span>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
