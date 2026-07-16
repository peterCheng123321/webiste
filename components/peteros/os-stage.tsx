"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as RE,
} from "react"
import { PeterOS } from "./peter-os"

type Props = {
  defaultExpanded?: boolean
}

const EAR = 100
/** px of drag for a full peel — higher = need more drag, slower feel */
const DRAG_FULL = 420
/** fraction of peel to commit open on release */
const COMMIT = 0.22
/** rAF lerp toward target peel (lower = silkier / slower catch-up) */
const LERP = 0.085
/** click-to-open animation duration (ms) */
const OPEN_MS = 1400
const CLOSE_MS = 900

/**
 * Triangle of revealed OS (peeled area) from top-right.
 * p=0 → ear size; p=1 → full screen.
 */
function peeledClip(p: number): string {
  if (p >= 0.995) return "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"
  const w =
    typeof window !== "undefined"
      ? Math.max(window.innerWidth, window.innerHeight)
      : 1400
  // smoothstep for gentler early growth
  const t = p * p * (3 - 2 * p)
  const size = EAR + t * (w * 1.6 - EAR)
  return `polygon(100% 0%, 100% ${size}px, calc(100% - ${size}px) 0%)`
}

/**
 * Inverse: remaining webpage sheet still covering the screen.
 * Hole cut from top-right triangle grows as peel increases.
 */
function pageSheetClip(p: number): string {
  if (p <= 0.001) return "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"
  if (p >= 0.995) return "polygon(0% 0%, 0% 0%, 0% 0%)" // gone
  const w =
    typeof window !== "undefined"
      ? Math.max(window.innerWidth, window.innerHeight)
      : 1400
  const t = p * p * (3 - 2 * p)
  const size = EAR + t * (w * 1.6 - EAR)
  // Full rect with a triangular bite from the top-right
  return `polygon(0% 0%, calc(100% - ${size}px) 0%, 100% ${size}px, 100% 100%, 0% 100%)`
}

export function OsStage({ defaultExpanded = false }: Props) {
  const [open, setOpen] = useState(defaultExpanded)
  const [booted, setBooted] = useState(defaultExpanded)
  const [dragging, setDragging] = useState(false)
  const [hover, setHover] = useState(false)
  const [pageShot, setPageShot] = useState<string | null>(null)
  const [capturing, setCapturing] = useState(false)

  // Smooth peel: target is what gesture wants; display is lerped
  const targetPeel = useRef(defaultExpanded ? 1 : 0)
  const displayPeel = useRef(defaultExpanded ? 1 : 0)
  const [, setTick] = useState(0) // force render for lerp frames
  const rafRef = useRef(0)
  const animatingRef = useRef(false)

  const openRef = useRef(open)
  openRef.current = open

  const drag = useRef<{
    id: number
    x0: number
    y0: number
    peel0: number
    moved: boolean
  } | null>(null)

  const bump = () => setTick((n) => (n + 1) % 1_000_000)

  // Continuous lerp loop while not fully settled open
  useEffect(() => {
    let alive = true
    const tick = () => {
      if (!alive) return
      const target = openRef.current ? 1 : targetPeel.current
      const cur = displayPeel.current
      const next = cur + (target - cur) * (dragging ? 0.22 : LERP)
      const settled = Math.abs(next - target) < 0.001
      displayPeel.current = settled ? target : next
      if (!settled || animatingRef.current || dragging) {
        bump()
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      alive = false
      cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging])

  const setTargetPeel = useCallback((p: number) => {
    targetPeel.current = Math.min(1, Math.max(0, p))
  }, [])

  const capturePage = useCallback(async () => {
    if (pageShot || capturing) return pageShot
    setCapturing(true)
    try {
      const { toPng } = await import("html-to-image")
      // Hide our own peel chrome so it isn't in the shot
      const peelRoot = document.querySelector(".pos-peel") as HTMLElement | null
      const prev = peelRoot?.style.visibility
      if (peelRoot) peelRoot.style.visibility = "hidden"

      const node =
        (document.querySelector("main.home") as HTMLElement | null) ??
        document.body

      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: Math.min(2, window.devicePixelRatio || 1),
        backgroundColor: "#ffffff",
        filter: (el) => {
          if (!(el instanceof HTMLElement)) return true
          // never include peel UI in snapshot
          return !el.classList?.contains("pos-peel") && !el.closest?.(".pos-peel")
        },
      })

      if (peelRoot) peelRoot.style.visibility = prev ?? ""
      setPageShot(dataUrl)
      return dataUrl
    } catch (err) {
      console.warn("[PeterOS] page snapshot failed, using solid sheet", err)
      return null
    } finally {
      setCapturing(false)
      const peelRoot = document.querySelector(".pos-peel") as HTMLElement | null
      if (peelRoot) peelRoot.style.visibility = ""
    }
  }, [pageShot, capturing])

  const openOS = useCallback(async () => {
    setBooted(true)
    await capturePage()
    animatingRef.current = true
    setTargetPeel(1)
    // Slow ease to fully open, then lock interactive
    const start = performance.now()
    const from = displayPeel.current
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / OPEN_MS)
      // ease-in-out cubic — slower in the middle, deliberate
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      targetPeel.current = from + (1 - from) * e
      displayPeel.current = targetPeel.current
      bump()
      if (t < 1) {
        requestAnimationFrame(step)
      } else {
        animatingRef.current = false
        setOpen(true)
        targetPeel.current = 1
        displayPeel.current = 1
        bump()
      }
    }
    requestAnimationFrame(step)
    setDragging(false)
    drag.current = null
  }, [capturePage, setTargetPeel])

  const closeOS = useCallback(() => {
    setOpen(false)
    animatingRef.current = true
    const start = performance.now()
    const from = displayPeel.current
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / CLOSE_MS)
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      const v = from * (1 - e)
      targetPeel.current = v
      displayPeel.current = v
      bump()
      if (t < 1) {
        requestAnimationFrame(step)
      } else {
        animatingRef.current = false
        targetPeel.current = 0
        displayPeel.current = 0
        setDragging(false)
        drag.current = null
        bump()
      }
    }
    requestAnimationFrame(step)
  }, [])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement | null)?.closest?.("[data-open-peteros]")) {
        e.preventDefault()
        void openOS()
      }
    }
    document.addEventListener("click", onClick)
    return () => document.removeEventListener("click", onClick)
  }, [openOS])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeOS()
    }
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [open, closeOS])

  useEffect(() => {
    if (!booted && (hover || dragging || displayPeel.current > 0.01 || open)) {
      setBooted(true)
    }
  }, [hover, dragging, open, booted])

  const onPointerDown = async (e: RE) => {
    if (openRef.current || animatingRef.current) return
    if (e.button !== 0 && e.pointerType === "mouse") return
    e.preventDefault()
    e.stopPropagation()
    void capturePage()
    setBooted(true)
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    drag.current = {
      id: e.pointerId,
      x0: e.clientX,
      y0: e.clientY,
      peel0: displayPeel.current,
      moved: false,
    }
    setDragging(true)
  }

  const onPointerMove = (e: RE) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    const dist = Math.hypot(e.clientX - d.x0, e.clientY - d.y0)
    if (dist > 8) d.moved = true
    // Softer mapping — more travel for same peel
    const next = Math.min(1, Math.max(0, d.peel0 + dist / DRAG_FULL))
    setTargetPeel(next)
  }

  const finish = (e: RE) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
    const dist = Math.hypot(e.clientX - d.x0, e.clientY - d.y0)
    const moved = d.moved || dist > 8
    const p = displayPeel.current
    drag.current = null
    setDragging(false)

    if (!moved) {
      void openOS()
      return
    }
    if (p >= COMMIT || dist >= DRAG_FULL * COMMIT) {
      void openOS()
    } else {
      // slow snap shut
      animatingRef.current = true
      const start = performance.now()
      const from = displayPeel.current
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / 700)
        const e2 = 1 - Math.pow(1 - t, 3)
        const v = from * (1 - e2)
        targetPeel.current = v
        displayPeel.current = v
        bump()
        if (t < 1) requestAnimationFrame(step)
        else {
          animatingRef.current = false
          targetPeel.current = 0
          displayPeel.current = 0
          bump()
        }
      }
      requestAnimationFrame(step)
    }
  }

  const p = displayPeel.current
  const showCurl = !open
  const showLayers = booted && (open || p > 0.002 || hover || dragging || capturing)

  const curlScale = 1 + p * 1.6 + (hover && !dragging ? 0.05 : 0)
  const curlOpacity = open ? 0 : Math.max(0, 1 - p * 1.15)
  const curlTX = p * 36
  const curlTY = p * 28

  return (
    <div
      className={[
        "pos-peel",
        open ? "is-open" : "",
        dragging ? "is-dragging" : "",
        hover ? "is-hover" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {showLayers && (
        <>
          {/* Bottom: full PeterOS (always full-bleed under the peeling page) */}
          <div
            className="pos-peel-os"
            style={{
              opacity: p > 0.01 || open ? 1 : 0,
              pointerEvents: open ? "auto" : "none",
              transition: dragging ? "none" : "opacity 0.4s ease",
            }}
            role={open ? "dialog" : undefined}
            aria-modal={open || undefined}
            aria-label={open ? "PeterOS" : undefined}
          >
            <PeterOS
              mode="fullscreen"
              onCloseExpand={open ? closeOS : undefined}
            />
          </div>

          {/* Top: snapshot of the real homepage — peels away as triangle hole grows */}
          {!open && (
            <div
              className="pos-peel-page"
              style={{
                clipPath: pageSheetClip(p),
                opacity: p >= 0.99 ? 0 : 1,
                backgroundImage: pageShot ? `url(${pageShot})` : undefined,
              }}
              aria-hidden
            >
              {!pageShot && <div className="pos-peel-page-fallback" />}
              {/* Soft shadow along the peel edge */}
              <div
                className="pos-peel-page-edge"
                style={{
                  // edge follows triangle size
                  opacity: p > 0.02 && p < 0.98 ? 0.55 : 0,
                }}
              />
            </div>
          )}
        </>
      )}

      {showCurl && (
        <button
          type="button"
          className="pos-peel-curl"
          aria-label="Peel open PeterOS — click or drag slowly"
          style={{
            transform: `translate3d(${curlTX}px, ${curlTY}px, 0) scale(${curlScale})`,
            opacity: curlOpacity,
            transition: dragging
              ? "none"
              : "transform 0.7s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease",
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={finish}
          onPointerCancel={finish}
          onMouseEnter={() => {
            setHover(true)
            void capturePage()
          }}
          onMouseLeave={() => {
            if (!drag.current) setHover(false)
          }}
        >
          <span className="pos-peel-curl-sheet" aria-hidden>
            <span className="pos-peel-curl-grain" />
            <span className="pos-peel-curl-fold" />
            <span className="pos-peel-curl-shine" />
          </span>
          <span className="pos-peel-curl-underside" aria-hidden />
          <span className="pos-peel-curl-label">
            <em>PeterOS</em>
            <small>click · drag</small>
          </span>
        </button>
      )}
    </div>
  )
}
