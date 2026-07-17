"use client"

import { useEffect, useState, type CSSProperties } from "react"

const DAY_MS = 86_400_000
const SHANGHAI_OFFSET_MS = 8 * 60 * 60 * 1000

type DayReading = {
  percent: number
  time: string
}

function getDayReading(now = Date.now()): DayReading {
  const elapsed = ((now + SHANGHAI_OFFSET_MS) % DAY_MS + DAY_MS) % DAY_MS
  const hours = Math.floor(elapsed / 3_600_000)
  const minutes = Math.floor((elapsed % 3_600_000) / 60_000)
  const seconds = Math.floor((elapsed % 60_000) / 1000)

  return {
    percent: (elapsed / DAY_MS) * 100,
    time: [hours, minutes, seconds]
      .map((part) => String(part).padStart(2, "0"))
      .join(":"),
  }
}

export function ShanghaiDayProgress() {
  const [reading, setReading] = useState<DayReading | null>(null)

  useEffect(() => {
    const update = () => setReading(getDayReading())
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches

    update()
    if (reducedMotion) return

    const interval = window.setInterval(update, 80)
    return () => window.clearInterval(interval)
  }, [])

  const progress = reading?.percent ?? 0
  const style = {
    "--day-progress": `${progress}%`,
  } as CSSProperties

  return (
    <section
      className={`home-day${reading ? " is-ready" : ""}`}
      style={style}
      aria-label="Live progress through the current day in Shanghai"
    >
      <span className="sr-only">
        Live progress through the current day in Shanghai.
      </span>

      <div className="home-day-visual" aria-hidden="true">
        <p className="home-day-caption">
          <span>{(reading?.percent ?? 0).toFixed(12)}%</span> LOCAL DAY
        </p>

        <div className="home-day-track">
          <span className="home-day-tick home-day-tick-start">00</span>
          <span className="home-day-tick home-day-tick-mid">12</span>
          <span className="home-day-tick home-day-tick-end">24</span>
          <span className="home-day-marker" />
          <span className="home-day-now">{reading?.time ?? "00:00:00"}</span>
        </div>
      </div>
    </section>
  )
}
