"use client"

import { useEffect, useState } from "react"

type Surface = "paper" | "ink"

/**
 * Fixed glass Paper/Ink toggle. Flips the whole surface by setting
 * `data-surface` on <html>, persists the choice in localStorage, and wires the
 * delegated cursor-tracking lens for every glass `.btn` on the page.
 */
export function SurfaceToggle() {
  const [mode, setMode] = useState<Surface>("paper")

  // Sync button state with whatever the no-flash script already applied.
  useEffect(() => {
    const current = document.documentElement.getAttribute("data-surface")
    if (current === "ink" || current === "paper") setMode(current)
  }, [])

  // Cursor-tracking lens — delegated, since the buttons are client-rendered.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const target = e.target as Element | null
      const btn = target?.closest?.(".btn") as HTMLElement | null
      if (!btn) return
      const r = btn.getBoundingClientRect()
      btn.style.setProperty("--mx", `${e.clientX - r.left}px`)
      btn.style.setProperty("--my", `${e.clientY - r.top}px`)
    }
    document.addEventListener("pointermove", onMove)
    return () => document.removeEventListener("pointermove", onMove)
  }, [])

  const select = (next: Surface) => {
    document.documentElement.setAttribute("data-surface", next)
    try {
      localStorage.setItem("zc-surface", next)
    } catch {
      /* ignore unavailable storage */
    }
    setMode(next)
  }

  return (
    <div className="surf-toggle glass glass-thin" role="group" aria-label="Surface mode">
      <button type="button" aria-pressed={mode === "paper"} onClick={() => select("paper")}>
        Paper
      </button>
      <button type="button" aria-pressed={mode === "ink"} onClick={() => select("ink")}>
        Ink
      </button>
    </div>
  )
}
