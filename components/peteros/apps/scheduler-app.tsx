"use client"

import { useMemo, useState, type KeyboardEvent as ReactKeyboardEvent } from "react"

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const
const SLOTS = ["9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM"] as const

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
  const [inspected, setInspected] = useState<string | null>(null)
  const [focusedCell, setFocusedCell] = useState(key(0, 0))

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
      if (next[k]) next[k] = null
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

  const onCellKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    day: number,
    slot: number,
  ) => {
    let nextDay = day
    let nextSlot = slot
    if (event.key === "ArrowLeft") nextDay--
    else if (event.key === "ArrowRight") nextDay++
    else if (event.key === "ArrowUp") nextSlot--
    else if (event.key === "ArrowDown") nextSlot++
    else if (event.key === "Home") {
      nextDay = 0
      nextSlot = 0
    } else if (event.key === "End") {
      nextDay = DAYS.length - 1
      nextSlot = SLOTS.length - 1
    } else return

    event.preventDefault()
    nextDay = Math.max(0, Math.min(DAYS.length - 1, nextDay))
    nextSlot = Math.max(0, Math.min(SLOTS.length - 1, nextSlot))
    const nextKey = key(nextDay, nextSlot)
    setFocusedCell(nextKey)
    event.currentTarget
      .closest(".sched-grid")
      ?.querySelector<HTMLButtonElement>(`[data-cell="${nextKey}"]`)
      ?.focus()
  }

  const onCourseKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
  ) => {
    const options = Array.from(
      event.currentTarget
        .closest('[role="radiogroup"]')
        ?.querySelectorAll<HTMLButtonElement>('[role="radio"]') ?? [],
    )
    const current = options.indexOf(event.currentTarget)
    if (current < 0) return

    let next = current
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      next = (current + 1) % options.length
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = (current - 1 + options.length) % options.length
    } else if (event.key === "Home") next = 0
    else if (event.key === "End") next = options.length - 1
    else return

    event.preventDefault()
    const nextOption = options[next]
    const nextCourse = nextOption?.dataset.courseId
    if (nextCourse) setSelected(nextCourse)
    nextOption?.focus()
  }

  return (
    <div className="mac-app sched-app">
      <div className="sched-top sched-commandbar">
        <div className="sched-command-copy">
          <span>Week builder</span>
          <strong>{stats.courses ? `${stats.courses} courses · ${stats.credits} credits` : "Empty schedule"}</strong>
        </div>
        <div className="sched-actions">
          <button type="button" className="mac-btn" onClick={autoFill}>
            Auto-fill
          </button>
          <button
            type="button"
            className="mac-btn"
            onClick={() => setGrid({})}
            disabled={stats.cells === 0}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="sched-layout">
        <div className="sched-main">
          <div className="sched-palette" role="radiogroup" aria-label="Course palette">
            {CATALOG.map((c) => (
              <button
                key={c.id}
                type="button"
                className={selected === c.id ? "sched-chip active" : "sched-chip"}
                role="radio"
                aria-checked={selected === c.id}
                data-course-id={c.id}
                tabIndex={selected === c.id ? 0 : -1}
                style={{ ["--c" as string]: c.color }}
                onClick={() => setSelected(c.id)}
                onKeyDown={onCourseKeyDown}
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
                        data-cell={key(di, si)}
                        tabIndex={focusedCell === key(di, si) ? 0 : -1}
                        style={c ? { background: c.color } : undefined}
                        onClick={() => toggle(di, si)}
                        onFocus={() => {
                          setFocusedCell(key(di, si))
                          setInspected(c?.id ?? null)
                        }}
                        onKeyDown={(event) => onCellKeyDown(event, di, si)}
                        onMouseEnter={() => setInspected(c?.id ?? null)}
                        onMouseLeave={() => setInspected(null)}
                        aria-label={`${DAYS[di]} ${slot}${c ? `, ${c.code}; activate to remove` : `, empty; activate to add ${course.code}`}`}
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
            <div className="sched-alert" role="status" aria-live="polite">
              Heavy day{stats.heavyDays.length > 1 ? "s" : ""}:{" "}
              {stats.heavyDays.map((d) => DAYS[d]).join(", ")}
            </div>
          ) : stats.cells > 0 ? (
            <div className="sched-ok" role="status" aria-live="polite">Schedule looks balanced</div>
          ) : (
            <div className="sched-empty" role="status">No courses placed yet</div>
          )}

          {inspected && (
            <p className="sched-hover">
              Inspecting {CATALOG.find((c) => c.id === inspected)?.code}
            </p>
          )}
        </aside>
      </div>
    </div>
  )
}
