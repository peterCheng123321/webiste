"use client"

import { useMemo, useState } from "react"

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

export function AtsApp() {
  const [text, setText] = useState(SAMPLE)
  const [stage, setStage] = useState(-1)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  const analysis = useMemo(() => {
    const lower = text.toLowerCase()
    const hits = KEYWORDS.filter((x) => lower.includes(x.k))
    const raw = hits.reduce((a, h) => a + h.w, 0)
    const max = KEYWORDS.reduce((a, h) => a + h.w, 0)
    const pct = Math.min(99, Math.round((raw / max) * 100 + (text.length > 120 ? 5 : 0)))
    return { hits, pct }
  }, [text])

  const run = () => {
    setDone(false)
    setScore(0)
    setStage(0)
    let s = 0
    const tick = () => {
      if (s < STAGES.length) {
        setStage(s)
        setScore(Math.round((analysis.pct * (s + 1)) / STAGES.length))
        s++
        setTimeout(tick, 280)
      } else {
        setScore(analysis.pct)
        setDone(true)
        setStage(STAGES.length - 1)
      }
    }
    tick()
  }

  return (
    <div className="mac-app ats-app">
      <div className="ats-top">
        <div>
          <h2>ATS Lab</h2>
          <p>Toy from Application Tracker · keyword triage pipeline</p>
        </div>
        <button type="button" className="mac-btn primary" onClick={run}>
          Run scan
        </button>
      </div>

      <div className="ats-pipeline">
        {STAGES.map((name, i) => (
          <div
            key={name}
            className={
              stage > i ? "ats-stage done" : stage === i ? "ats-stage active" : "ats-stage"
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
              setDone(false)
              setStage(-1)
              setScore(0)
            }}
            rows={8}
            spellCheck={false}
          />
          <div className="ats-drop-hint">Tip: paste a cover letter or LinkedIn about</div>
        </div>

        <div className="ats-result-col">
          <div className="ats-meter-ring">
            <svg viewBox="0 0 100 100" className="ats-ring">
              <circle cx="50" cy="50" r="40" className="ats-ring-bg" />
              <circle
                cx="50"
                cy="50"
                r="40"
                className="ats-ring-fg"
                style={{
                  strokeDasharray: `${(score / 100) * 251} 251`,
                }}
              />
            </svg>
            <div className="ats-ring-label">
              <strong>{stage >= 0 ? score : "—"}</strong>
              <span>match</span>
            </div>
          </div>

          {done && (
            <>
              <div className="ats-verdict">
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
