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

type Pt = { x: number; y: number }

/* ── tuning ────────────────────────────────────────────── */
const REST = 40 // px dog-ear when idle
const HOVER = 74 // px dog-ear on hover
const OPEN_MS = 950
const CLOSE_MS = 640
const SPRING_MS = 520
const HOVER_MS = 300
/** commit-open on release once the grabbed corner has travelled this
 *  fraction of the screen diagonal toward the far corner */
const COMMIT = 0.4

/* ── geometry helpers ──────────────────────────────────── */
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

function vw() {
  return typeof window !== "undefined" ? window.innerWidth : 1440
}
function vh() {
  return typeof window !== "undefined" ? window.innerHeight : 900
}
function diag() {
  return Math.hypot(vw(), vh())
}
/** unit vector from the grabbed corner (top-right) toward the far corner (bottom-left) */
function dHat(): Pt {
  const W = vw()
  const H = vh()
  const L = Math.hypot(W, H) || 1
  return { x: -W / L, y: H / L }
}
function corner(): Pt {
  return { x: vw(), y: 0 }
}
function restPoint(len = REST): Pt {
  const c = corner()
  const d = dHat()
  return { x: c.x + d.x * len, y: c.y + d.y * len }
}
function openPoint(): Pt {
  const c = corner()
  const d = dHat()
  const L = diag() * 1.7 // push the crease well past the far corner → full reveal
  return { x: c.x + d.x * L, y: c.y + d.y * L }
}

/**
 * Sutherland–Hodgman clip of `poly` by the half-plane { X : (X − M)·dir ≤ 0 }.
 * `dir` points OUT of the kept region.
 */
function clipHalfPlane(poly: Pt[], M: Pt, dir: Pt): Pt[] {
  const side = (p: Pt) => (p.x - M.x) * dir.x + (p.y - M.y) * dir.y
  const out: Pt[] = []
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]
    const b = poly[(i + 1) % poly.length]
    const da = side(a)
    const db = side(b)
    if (da <= 0) {
      out.push(a)
      if (db > 0) {
        const t = da / (da - db)
        out.push({ x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) })
      }
    } else if (db <= 0) {
      const t = da / (da - db)
      out.push({ x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) })
    }
  }
  return out
}

function polyToClip(poly: Pt[]): string {
  if (poly.length < 3) return "polygon(0 0, 0 0, 0 0)"
  return (
    "polygon(" +
    poly.map((p) => `${p.x.toFixed(1)}px ${p.y.toFixed(1)}px`).join(", ") +
    ")"
  )
}

/**
 * Fold the page corner C=(W,0) onto the control point P.
 * The crease is the perpendicular bisector of C→P, so C reflects exactly onto P.
 * Returns the lifted-wedge clip (pre-transform) and the CSS reflection matrix
 * that maps that wedge onto the flap.
 */
function foldGeometry(P: Pt) {
  const W = vw()
  const H = vh()
  const C = corner()
  const M = { x: (C.x + P.x) / 2, y: (C.y + P.y) / 2 }
  const dir = { x: C.x - P.x, y: C.y - P.y } // normal to the crease, points P→C
  const rect: Pt[] = [
    { x: 0, y: 0 },
    { x: W, y: 0 },
    { x: W, y: H },
    { x: 0, y: H },
  ]
  // lifted wedge = the half nearer C
  const wedgePoly = clipHalfPlane(rect, M, { x: -dir.x, y: -dir.y })

  // reflection across the crease: X' = X − 2((X−M)·û)û
  const len = Math.hypot(dir.x, dir.y) || 1
  const ux = dir.x / len
  const uy = dir.y / len
  const a = 1 - 2 * ux * ux
  const b = -2 * ux * uy
  const c = -2 * ux * uy
  const d = 1 - 2 * uy * uy
  const mdotu = M.x * ux + M.y * uy
  const e = 2 * mdotu * ux
  const f = 2 * mdotu * uy
  const matrix = `matrix(${a.toFixed(4)}, ${b.toFixed(4)}, ${c.toFixed(4)}, ${d.toFixed(4)}, ${e.toFixed(2)}, ${f.toFixed(2)})`

  return { wedgeClip: polyToClip(wedgePoly), matrix }
}

export function OsStage({ defaultExpanded = false }: Props) {
  const [open, setOpen] = useState(defaultExpanded)
  const [booted, setBooted] = useState(defaultExpanded)
  const [active, setActive] = useState(defaultExpanded) // peel in progress
  const [dragging, setDragging] = useState(false)
  const [hover, setHover] = useState(false)
  const [mounted, setMounted] = useState(defaultExpanded)

  const [, force] = useState(0)
  const bump = useCallback(() => force((n) => (n + 1) % 1_000_000), [])

  // Control point = the grabbed corner's current position.
  const P = useRef<Pt>(defaultExpanded ? openPoint() : restPoint())
  const rafRef = useRef(0)
  const hasOpenedRef = useRef(defaultExpanded)
  const openRef = useRef(open)
  openRef.current = open
  const activeRef = useRef(active)
  activeRef.current = active

  const drag = useRef<{ id: number; moved: boolean; x0: number; y0: number } | null>(
    null,
  )

  const stopAnim = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = 0
  }, [])

  const animateTo = useCallback(
    (to: Pt, dur: number, ease: (t: number) => number, onDone?: () => void) => {
      stopAnim()
      const from = { ...P.current }
      const start = performance.now()
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / dur)
        const k = ease(t)
        P.current = { x: from.x + (to.x - from.x) * k, y: from.y + (to.y - from.y) * k }
        bump()
        if (t < 1) {
          rafRef.current = requestAnimationFrame(step)
        } else {
          rafRef.current = 0
          onDone?.()
        }
      }
      rafRef.current = requestAnimationFrame(step)
    },
    [bump, stopAnim],
  )

  const reducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

  const openOS = useCallback(() => {
    setBooted(true)
    setActive(true)
    setDragging(false)
    drag.current = null
    if (reducedMotion()) {
      P.current = openPoint()
      hasOpenedRef.current = true
      setOpen(true)
      bump()
      return
    }
    animateTo(openPoint(), OPEN_MS, easeInOutCubic, () => {
      hasOpenedRef.current = true
      setOpen(true)
    })
  }, [animateTo, bump])

  const closeOS = useCallback(() => {
    setOpen(false)
    if (reducedMotion()) {
      setActive(false)
      setHover(false)
      P.current = restPoint()
      bump()
      return
    }
    P.current = openPoint()
    animateTo(restPoint(), CLOSE_MS, easeOutCubic, () => {
      setActive(false)
      setHover(false)
      bump()
    })
  }, [animateTo, bump])

  // Delegated open triggers ([data-open-peteros] buttons anywhere on the page)
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement | null)?.closest?.("[data-open-peteros]")) {
        e.preventDefault()
        openOS()
      }
    }
    document.addEventListener("click", onClick)
    return () => document.removeEventListener("click", onClick)
  }, [openOS])

  // Esc to close + lock scroll while open
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

  // Keep the idle dog-ear anchored to the corner across resizes
  useEffect(() => {
    const onResize = () => {
      if (openRef.current || activeRef.current || rafRef.current) return
      P.current = restPoint(hover ? HOVER : REST)
      bump()
    }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [hover, bump])

  // Settle the idle dog-ear with real viewport dims once mounted — otherwise
  // the SSR fallback dimensions (1440×900) bake a giant fold into first paint.
  useEffect(() => {
    if (!openRef.current && !activeRef.current) {
      P.current = defaultExpanded ? openPoint() : restPoint(REST)
    }
    setMounted(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => stopAnim, [stopAnim])

  /* ── pointer / drag ──────────────────────────────────── */
  const onPointerDown = (e: RE) => {
    if (openRef.current) return
    if (e.button !== 0 && e.pointerType === "mouse") return
    e.preventDefault()
    e.stopPropagation()
    stopAnim()
    setBooted(true)
    setActive(true)
    try {
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
    drag.current = { id: e.pointerId, moved: false, x0: e.clientX, y0: e.clientY }
    setDragging(true)
  }

  const onPointerMove = (e: RE) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    if (Math.hypot(e.clientX - d.x0, e.clientY - d.y0) > 6) d.moved = true
    // 1:1 — the corner goes exactly where the cursor is (a touch of headroom
    // beyond the edges so you can fling it fully open)
    P.current = {
      x: clamp(e.clientX, -0.25 * vw(), vw()),
      y: clamp(e.clientY, 0, 1.25 * vh()),
    }
    bump()
  }

  const finish = (e: RE) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
    drag.current = null
    setDragging(false)

    // click (no real drag) → full open
    if (!d.moved) {
      openOS()
      return
    }
    const travelled = Math.hypot(P.current.x - corner().x, P.current.y - corner().y)
    if (travelled >= COMMIT * diag()) {
      openOS()
    } else {
      // spring back to the resting dog-ear
      const restingPoint = restPoint(hover ? HOVER : REST)
      const settleClosed = () => {
        setActive(false)
        if (!hasOpenedRef.current) setBooted(false)
        bump()
      }
      if (reducedMotion()) {
        P.current = restingPoint
        settleClosed()
      } else {
        animateTo(restingPoint, SPRING_MS, easeOutCubic, settleClosed)
      }
    }
  }

  const onEnter = () => {
    if (openRef.current) return
    setHover(true)
    if (!drag.current && !activeRef.current && !rafRef.current) {
      if (reducedMotion()) {
        P.current = restPoint(HOVER)
        bump()
      } else {
        animateTo(restPoint(HOVER), HOVER_MS, easeOutCubic)
      }
    }
  }
  const onLeave = () => {
    if (drag.current) return
    setHover(false)
    if (!activeRef.current && !openRef.current) {
      if (reducedMotion()) {
        P.current = restPoint(REST)
        bump()
      } else {
        animateTo(restPoint(REST), HOVER_MS, easeOutCubic)
      }
    }
  }

  // Render nothing geometry-dependent until mounted, so SSR and the first
  // client paint agree and real viewport dims drive the fold.
  if (!mounted) {
    return <div className="pos-peel" aria-hidden />
  }

  /* ── derived render state ────────────────────────────── */
  const geo = foldGeometry(P.current)
  const travelled = Math.hypot(P.current.x - corner().x, P.current.y - corner().y)
  const frac = clamp(travelled / diag(), 0, 1)
  const labelOpacity = open ? 0 : clamp(1 - frac * 6, 0, 1)
  const showChrome = !open
  const animating = Boolean(rafRef.current)
  const showFlapEffects = hover || active || dragging || animating

  return (
    <div
      className={[
        "pos-peel",
        open ? "is-open" : "",
        active ? "is-active" : "",
        dragging ? "is-dragging" : "",
        hover ? "is-hover" : "",
        animating ? "is-animating" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* PeterOS underneath, revealed through the peeled wedge — mounted once
          booted. Clipped to the wedge while peeling so the live homepage shows
          on the still-flat side; unclipped (full-bleed) once open. */}
      {booted && (
        <div
          className="pos-peel-os"
          style={{
            clipPath: open ? undefined : geo.wedgeClip,
            opacity: open || active ? 1 : 0,
            visibility: open || active ? "visible" : "hidden",
            pointerEvents: open ? "auto" : "none",
          }}
          role={open ? "dialog" : undefined}
          aria-modal={open || undefined}
          aria-label={open ? "PeterOS" : undefined}
        >
          <PeterOS
            mode="fullscreen"
            suspended={!open && !active}
            onCloseExpand={open ? closeOS : undefined}
          />
        </div>
      )}

      {/* The lifted flap — the folded corner showing the paper backside.
          Outer layer carries the cast shadow (unclipped) so it isn't clipped
          away with the flap; inner layer is clipped to the wedge + reflected. */}
      {!open && (
        <div className="pos-peel-flap-shadow" aria-hidden>
          <div
            className="pos-peel-flap"
            style={{
              clipPath: geo.wedgeClip,
              transform: geo.matrix,
              transformOrigin: "0 0",
            }}
          >
            {showFlapEffects ? (
              <>
                <div className="pos-peel-flap-grain" />
                <div className="pos-peel-flap-shade" />
                <div className="pos-peel-flap-sheen" />
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Grab target + invitation label */}
      {showChrome && (
        <button
          type="button"
          className="pos-peel-hit"
          aria-label="Peel the page open to PeterOS — click or drag the corner"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={finish}
          onPointerCancel={finish}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
        >
          <span
            className="pos-peel-label"
            style={{ opacity: labelOpacity }}
            aria-hidden
          >
            <em>PeterOS</em>
            <small>peel ↘</small>
          </span>
        </button>
      )}
    </div>
  )
}
