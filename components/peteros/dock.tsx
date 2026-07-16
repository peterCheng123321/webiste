"use client"

import { useCallback, useEffect, useRef, type PointerEvent as RE } from "react"
import { SYSTEM_APPS, TOY_APPS, type AppId } from "./types"
import { AppIcon } from "./app-icon"
import type { IconAppearance } from "./context"

type Props = {
  appearance: IconAppearance
  running: Set<AppId>
  trashFull: boolean
  onOpen: (id: AppId | "trash") => void
  onEmptyTrash?: () => void
}

type DockItem =
  | { kind: "app"; id: AppId; title: string }
  | { kind: "sep"; id: string }
  | { kind: "trash"; id: "trash"; title: string }

const ITEMS: DockItem[] = [
  ...SYSTEM_APPS.map((a) => ({ kind: "app" as const, id: a.id, title: a.title })),
  { kind: "sep", id: "sep-1" },
  ...TOY_APPS.map((a) => ({ kind: "app" as const, id: a.id, title: a.title })),
  { kind: "sep", id: "sep-2" },
  { kind: "trash", id: "trash", title: "Trash" },
]

const BASE = 52
const MAX_SCALE = 1.55
const SPREAD = 110
/** Lerp factor per frame (~60fps) — higher = snappier, lower = silkier */
const LERP = 0.22

export function Dock({ appearance, running, trashFull, onOpen, onEmptyTrash }: Props) {
  const ref = useRef<HTMLElement>(null)
  const scalesRef = useRef<number[]>(ITEMS.map(() => 1))
  const targetRef = useRef<number[]>(ITEMS.map(() => 1))
  const mouseX = useRef<number | null>(null)
  const rafRef = useRef(0)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  const computeTargets = useCallback((clientX: number | null) => {
    if (clientX == null) {
      targetRef.current = ITEMS.map(() => 1)
      return
    }
    let bi = 0
    targetRef.current = ITEMS.map((item) => {
      if (item.kind === "sep") return 1
      const btn = itemRefs.current[bi++]
      if (!btn) return 1
      const r = btn.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const dist = Math.abs(clientX - cx)
      if (dist >= SPREAD) return 1
      const t = 1 - dist / SPREAD
      // smoothstep-ish for soft shoulders
      const s = t * t * (3 - 2 * t)
      return 1 + s * (MAX_SCALE - 1)
    })
  }, [])

  // rAF loop — continuous lerp like ryOS / game-style UI
  useEffect(() => {
    let alive = true
    const tick = () => {
      if (!alive) return
      computeTargets(mouseX.current)
      let dirty = false
      const next = scalesRef.current.map((cur, i) => {
        const target = targetRef.current[i] ?? 1
        const v = cur + (target - cur) * LERP
        if (Math.abs(v - cur) > 0.001) dirty = true
        // snap when close
        return Math.abs(v - target) < 0.002 ? target : v
      })
      scalesRef.current = next

      // apply transforms without React re-render
      let bi = 0
      ITEMS.forEach((item, i) => {
        if (item.kind === "sep") return
        const btn = itemRefs.current[bi++]
        if (!btn) return
        const scale = next[i] ?? 1
        const lift = (scale - 1) * 40
        const width = BASE + 10 + (scale - 1) * 36
        btn.style.width = `${width}px`
        btn.style.transform = `translate3d(0, ${-lift}px, 0)`
        const icon = btn.querySelector<HTMLElement>(".pos-dock-icon")
        if (icon) {
          icon.style.transform = `scale(${scale})`
        }
      })

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      alive = false
      cancelAnimationFrame(rafRef.current)
    }
  }, [computeTargets])

  const onMove = useCallback((e: RE) => {
    mouseX.current = e.clientX
  }, [])

  const onLeave = useCallback(() => {
    mouseX.current = null
  }, [])

  let bi = 0

  return (
    <div className="pos-dock-wrap">
      <nav
        ref={ref}
        className="pos-dock pos-dock-vintage"
        aria-label="Dock"
        onPointerMove={onMove}
        onPointerLeave={onLeave}
      >
        {ITEMS.map((item) => {
          if (item.kind === "sep") {
            return <span key={item.id} className="pos-dock-sep" aria-hidden />
          }
          const idx = bi++
          const isRunning = item.kind === "app" ? running.has(item.id) : false
          const isOpen =
            item.kind === "trash" ? trashFull : isRunning
          const tip =
            item.kind === "trash"
              ? trashFull
                ? "Trash (full) — double-click to empty"
                : "Trash (empty)"
              : item.title
          return (
            <button
              key={item.id}
              type="button"
              data-dock-item
              ref={(el) => {
                itemRefs.current[idx] = el
              }}
              className={isRunning || (item.kind === "trash" && trashFull) ? "pos-dock-item running" : "pos-dock-item"}
              onClick={() => onOpen(item.id)}
              onDoubleClick={() => {
                if (item.kind === "trash" && trashFull) onEmptyTrash?.()
              }}
              title={tip}
            >
              <span className="pos-dock-icon" aria-hidden>
                <AppIcon
                  id={item.id}
                  size={BASE}
                  appearance={appearance}
                  open={isOpen}
                />
              </span>
              <span className="pos-dock-tip">{tip}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
