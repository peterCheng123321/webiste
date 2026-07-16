"use client"

import { useMemo, useState } from "react"

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const
const SLOTS = ["9am", "10", "11", "12", "1pm", "2", "3", "4"] as const

type Course = {
  id: string
  code: string
  title: string
  credits: number
  color: string
}

const CATALOG: Course[] = [
  { id: "cse131", code: "CSE 131", title: "Intro CS", credits: 3, color: "#7ec3f1" },
  { id: "cse247", code: "CSE 247", title: "Data Structures", credits: 3, color: "#f1c27e" },
  { id: "math309", code: "MATH 309", title: "Matrix Algebra", credits: 3, color: "#b8e0a0" },
  { id: "cse330", code: "CSE 330", title: "Rapid Prototype", credits: 3, color: "#e0a0c8" },
  { id: "cse417", code: "CSE 417", title: "Algorithms", credits: 3, color: "#c4b5fd" },
]

function key(d: number, s: number) {
  return `${d}-${s}`
}

export function SchedulerApp() {
  const [selected, setSelected] = useState(CATALOG[0].id)
  const [grid, setGrid] = useState<Record<string, string | null>>({})
  const [hover, setHover] = useState<string | null>(null)

  const course = CATALOG.find((c) => c.id === selected)!

  const stats = useMemo(() => {
    const placed = new Set<string>()
    let cells = 0
    Object.values(grid).forEach((v) => {
      if (v) {
        placed.add(v)
        cells++
      }
    })
    const credits = CATALOG.filter((c) => placed.has(c.id)).reduce((a, c) => a + c.credits, 0)
    const heavyDays: number[] = []
    for (let d = 0; d < 5; d++) {
      let n = 0
      for (let s = 0; s < 8; s++) if (grid[key(d, s)]) n++
      if (n > 4) heavyDays.push(d)
    }
    return { courses: placed.size, cells, credits, heavyDays }
  }, [grid])

  const toggle = (d: number, s: number) => {
    const k = key(d, s)
    setGrid((g) => {
      const next = { ...g }
      if (next[k] === selected) next[k] = null
      else next[k] = selected
      return next
    })
  }

  const autoFill = () => {
    const next: Record<string, string | null> = {}
    CATALOG.forEach((c, i) => {
      const day = i % 5
      const slot = 1 + (i % 4)
      next[key(day, slot)] = c.id
      next[key(day, slot + 1)] = c.id
    })
    setGrid(next)
  }

  return (
    <div className="mac-app sched-app">
      <div className="sched-top">
        <div>
          <h2>Course Scheduler</h2>
          <p>Toy from the Engineering Course Scheduler · paint blocks onto the week</p>
        </div>
        <div className="sched-actions">
          <button type="button" className="mac-btn" onClick={autoFill}>
            Auto-fill
          </button>
          <button type="button" className="mac-btn" onClick={() => setGrid({})}>
            Clear
          </button>
        </div>
      </div>

      <div className="sched-layout">
        <div className="sched-main">
          <div className="sched-palette">
            {CATALOG.map((c) => (
              <button
                key={c.id}
                type="button"
                className={selected === c.id ? "sched-chip active" : "sched-chip"}
                style={{ ["--c" as string]: c.color }}
                onClick={() => setSelected(c.id)}
              >
                <i style={{ background: c.color }} />
                <span>
                  <strong>{c.code}</strong>
                  <small>
                    {c.title} · {c.credits}cr
                  </small>
                </span>
              </button>
            ))}
          </div>

          <div className="sched-grid-wrap">
            <div className="sched-grid">
              <div className="sched-corner" />
              {DAYS.map((d, di) => (
                <div
                  key={d}
                  className={
                    stats.heavyDays.includes(di) ? "sched-day heavy" : "sched-day"
                  }
                >
                  {d}
                </div>
              ))}
              {SLOTS.map((slot, si) => (
                <div key={slot} className="sched-row">
                  <div className="sched-time">{slot}</div>
                  {DAYS.map((_, di) => {
                    const id = grid[key(di, si)]
                    const c = CATALOG.find((x) => x.id === id)
                    const heavy = stats.heavyDays.includes(di) && !!id
                    return (
                      <button
                        key={key(di, si)}
                        type="button"
                        className={heavy ? "sched-cell heavy" : "sched-cell"}
                        style={c ? { background: c.color } : undefined}
                        onClick={() => toggle(di, si)}
                        onMouseEnter={() => setHover(c?.id ?? null)}
                        onMouseLeave={() => setHover(null)}
                        aria-label={`${DAYS[di]} ${slot}`}
                      >
                        {c ? c.code.split(" ")[1] : ""}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="sched-side">
          <div className="sched-stat-cards">
            <div>
              <strong>{stats.courses}</strong>
              <span>courses</span>
            </div>
            <div>
              <strong>{stats.credits}</strong>
              <span>credits</span>
            </div>
            <div>
              <strong>{stats.cells}</strong>
              <span>blocks</span>
            </div>
          </div>

          <div className="sched-selected">
            <div className="sched-selected-swatch" style={{ background: course.color }} />
            <div>
              <strong>{course.code}</strong>
              <p>{course.title}</p>
              <small>{course.credits} credits · click cells to paint</small>
            </div>
          </div>

          {stats.heavyDays.length > 0 ? (
            <div className="sched-alert">
              Heavy day{stats.heavyDays.length > 1 ? "s" : ""}:{" "}
              {stats.heavyDays.map((d) => DAYS[d]).join(", ")}
            </div>
          ) : (
            <div className="sched-ok">Schedule looks balanced</div>
          )}

          {hover && (
            <p className="sched-hover">
              Hovering {CATALOG.find((c) => c.id === hover)?.code}
            </p>
          )}
        </aside>
      </div>
    </div>
  )
}
