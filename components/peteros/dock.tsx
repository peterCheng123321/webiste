"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as RE,
} from "react"
import { SYSTEM_APPS, TOY_APPS, type AppId } from "./types"
import { AppIcon } from "./app-icon"
import type { IconAppearance } from "./context"

type Props = {
  appearance: IconAppearance
  activeApp: AppId | null
  running: Set<AppId>
  openApps: Set<AppId>
  trashFull: boolean
  onOpen: (id: AppId | "trash") => void
}

type DockItem =
  | { kind: "app"; id: AppId; title: string }
  | { kind: "sep"; id: string }
  | { kind: "trash"; id: "trash"; title: string }

const PINNED_ITEMS: DockItem[] = [
  ...SYSTEM_APPS.map((a) => ({ kind: "app" as const, id: a.id, title: a.title })),
]

const BASE = 52
const MAX_SCALE = 1.55
const SPREAD = 110
/** Lerp factor per frame (~60fps) — higher = snappier, lower = silkier */
const LERP = 0.22
const MAGNIFY_QUERY =
  "(min-width: 641px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)"

export function Dock({
  appearance,
  activeApp,
  running,
  openApps,
  trashFull,
  onOpen,
}: Props) {
  const items = useMemo<DockItem[]>(
    () => [
      ...PINNED_ITEMS,
      ...TOY_APPS.filter((app) => running.has(app.id)).map((app) => ({
        kind: "app" as const,
        id: app.id,
        title: app.title,
      })),
      { kind: "sep", id: "sep-1" },
      { kind: "trash", id: "trash", title: "Trash" },
    ],
    [running],
  )
  const ref = useRef<HTMLElement>(null)
  const scalesRef = useRef<number[]>(items.map(() => 1))
  const targetRef = useRef<number[]>(items.map(() => 1))
  const mouseX = useRef<number | null>(null)
  const rafRef = useRef(0)
  const startAnimationRef = useRef<() => void>(() => {})
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const previousRunningRef = useRef(new Set(running))
  const [focusIndex, setFocusIndex] = useState(0)

  const computeTargets = useCallback((clientX: number | null) => {
    if (clientX == null) {
      targetRef.current = items.map(() => 1)
      return
    }
    let bi = 0
    targetRef.current = items.map((item) => {
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
  }, [items])

  const resetMagnification = useCallback(() => {
    mouseX.current = null
    scalesRef.current = items.map(() => 1)
    targetRef.current = items.map(() => 1)

    itemRefs.current.forEach((button) => {
      if (!button) return
      button.style.removeProperty("width")
      button.style.removeProperty("transform")
      button
        .querySelector<HTMLElement>(".pos-dock-icon")
        ?.style.removeProperty("transform")
    })
  }, [items])

  useEffect(() => {
    const buttonCount = items.filter((item) => item.kind !== "sep").length
    scalesRef.current = items.map(() => 1)
    targetRef.current = items.map(() => 1)
    itemRefs.current.length = buttonCount
    setFocusIndex((current) => Math.min(current, Math.max(0, buttonCount - 1)))
  }, [items])

  // Run the magnification loop only while values are moving. Pointer movement
  // restarts it, so the dock does no layout work while it is idle.
  useEffect(() => {
    let alive = true
    const magnify = window.matchMedia(MAGNIFY_QUERY)

    const tick = () => {
      if (!alive || !magnify.matches) return
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
      items.forEach((item, i) => {
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

      if (dirty) rafRef.current = requestAnimationFrame(tick)
      else rafRef.current = 0
    }

    const startAnimation = () => {
      if (!magnify.matches || rafRef.current) return
      rafRef.current = requestAnimationFrame(tick)
    }

    startAnimationRef.current = startAnimation

    const syncMagnification = () => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
      resetMagnification()
      if (magnify.matches && mouseX.current != null) startAnimation()
    }

    magnify.addEventListener("change", syncMagnification)
    syncMagnification()

    return () => {
      alive = false
      magnify.removeEventListener("change", syncMagnification)
      cancelAnimationFrame(rafRef.current)
      startAnimationRef.current = () => {}
      resetMagnification()
    }
  }, [computeTargets, items, resetMagnification])

  const onMove = useCallback((e: RE) => {
    mouseX.current = e.clientX
    startAnimationRef.current()
  }, [])

  const onLeave = useCallback(() => {
    mouseX.current = null
    startAnimationRef.current()
  }, [])

  useEffect(() => {
    const previous = previousRunningRef.current
    const launched = [...running].filter((id) => !previous.has(id))
    previousRunningRef.current = new Set(running)

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    launched.forEach((id) => {
      const button = itemRefs.current.find(
        (item) => item?.dataset.dockId === id,
      )
      button?.classList.add("launching")
    })
  }, [running])

  const onDockKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLButtonElement>) => {
      const buttons = itemRefs.current.filter(
        (button): button is HTMLButtonElement => Boolean(button),
      )
      const current = buttons.indexOf(event.currentTarget)
      if (current < 0) return

      let next = current
      if (event.key === "ArrowLeft") next = Math.max(0, current - 1)
      else if (event.key === "ArrowRight") {
        next = Math.min(buttons.length - 1, current + 1)
      } else if (event.key === "Home") next = 0
      else if (event.key === "End") next = buttons.length - 1
      else return

      event.preventDefault()
      setFocusIndex(next)
      buttons[next]?.focus()
    },
    [],
  )

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
        {items.map((item) => {
          if (item.kind === "sep") {
            return <span key={item.id} className="pos-dock-sep" aria-hidden />
          }
          const idx = bi++
          const isRunning = item.kind === "app" ? running.has(item.id) : false
          const isActive = item.kind === "app" && activeApp === item.id
          const isWindowOpen =
            item.kind === "app" ? openApps.has(item.id) : false
          const isOpen = item.kind === "trash" && trashFull
          const tip =
            item.kind === "trash"
              ? trashFull
                ? "Trash (full)"
                : "Trash (empty)"
              : item.title
          const accessibleLabel =
            item.kind === "trash"
              ? tip
              : `${item.title}${isActive ? ", active" : isRunning ? ", running" : ""}`
          return (
            <button
              key={item.id}
              type="button"
              data-dock-item
              data-dock-id={item.id}
              ref={(el) => {
                itemRefs.current[idx] = el
              }}
              className={[
                "pos-dock-item",
                isRunning ? "running" : "",
                isActive ? "active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              data-active={isActive || undefined}
              data-running={isRunning || undefined}
              aria-label={accessibleLabel}
              tabIndex={idx === focusIndex ? 0 : -1}
              onFocus={() => setFocusIndex(idx)}
              onClick={() => onOpen(item.id)}
              onKeyDown={onDockKeyDown}
              onAnimationEnd={(event) => {
                if (event.animationName === "posDockLaunch") {
                  event.currentTarget.classList.remove("launching")
                }
              }}
            >
              <span className="pos-dock-icon" aria-hidden>
                <AppIcon
                  id={item.id}
                  size={BASE}
                  appearance={appearance}
                  open={isWindowOpen || isOpen}
                />
              </span>
              <span className="pos-dock-tip" role="tooltip" aria-hidden="true">
                {tip}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
