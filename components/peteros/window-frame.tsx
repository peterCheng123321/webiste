"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react"
import { motion, useReducedMotion } from "motion/react"
import {
  MIN_WINDOW_HEIGHT,
  MIN_WINDOW_WIDTH,
  appMeta,
  type WindowGeometry,
  type WindowResizeDirection,
  type WindowState,
} from "./types"

const RESIZE_DIRECTIONS: WindowResizeDirection[] = [
  "n",
  "s",
  "e",
  "w",
  "ne",
  "nw",
  "se",
  "sw",
]

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max))
}

type Props = {
  win: WindowState
  focused: boolean
  children: ReactNode
  onFocus: (id: string) => void
  onClose: (id: string) => void
  onMinimize: (id: string) => void
  onMaximize: (id: string) => void
  onMove: (id: string, x: number, y: number) => void
  onResize: (id: string, geometry: WindowGeometry) => void
  bounds?: { width: number; height: number }
  hidden?: boolean
}

export function WindowFrame({
  win,
  focused,
  children,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  onMove,
  onResize,
  bounds,
  hidden = false,
}: Props) {
  const frameRef = useRef<HTMLDivElement>(null)
  const wasHiddenRef = useRef(true)
  const onMoveRef = useRef(onMove)
  const onResizeRef = useRef(onResize)
  const moveFrameRef = useRef(0)
  const resizeFrameRef = useRef(0)
  const pendingMoveRef = useRef<{ id: string; x: number; y: number } | null>(null)
  const pendingResizeRef = useRef<{
    id: string
    geometry: WindowGeometry
  } | null>(null)
  onMoveRef.current = onMove
  onResizeRef.current = onResize
  const dragRef = useRef<{
    ox: number
    oy: number
    sx: number
    sy: number
  } | null>(null)
  const resizeRef = useRef<{
    direction: WindowResizeDirection
    pointerX: number
    pointerY: number
    geometry: WindowGeometry
  } | null>(null)
  const [dragging, setDragging] = useState(false)
  const [resizing, setResizing] = useState<WindowResizeDirection | null>(null)
  const reduceMotion = useReducedMotion() === true

  const flushMove = useCallback(() => {
    moveFrameRef.current = 0
    const pending = pendingMoveRef.current
    pendingMoveRef.current = null
    if (pending) onMoveRef.current(pending.id, pending.x, pending.y)
  }, [])

  const flushResize = useCallback(() => {
    resizeFrameRef.current = 0
    const pending = pendingResizeRef.current
    pendingResizeRef.current = null
    if (pending) onResizeRef.current(pending.id, pending.geometry)
  }, [])

  useEffect(
    () => () => {
      cancelAnimationFrame(moveFrameRef.current)
      cancelAnimationFrame(resizeFrameRef.current)
    },
    [],
  )

  useEffect(() => {
    const becameVisible = wasHiddenRef.current && !hidden
    wasHiddenRef.current = hidden
    if (!becameVisible || !focused) return

    const frame = frameRef.current
    if (!frame) return
    const raf = requestAnimationFrame(() => {
      if (frame.contains(document.activeElement)) return
      const preferred = frame.querySelector<HTMLElement>("[data-window-focus]")
      ;(preferred ?? frame).focus({ preventScroll: true })
    })
    return () => cancelAnimationFrame(raf)
  }, [focused, hidden])

  const onPointerDownTitle = useCallback(
    (e: ReactPointerEvent) => {
      if (win.maximized) return
      if ((e.target as HTMLElement).closest("button")) return
      e.stopPropagation()
      onFocus(win.id)
      dragRef.current = {
        ox: e.clientX,
        oy: e.clientY,
        sx: win.x,
        sy: win.y,
      }
      setDragging(true)
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    },
    [onFocus, win.id, win.maximized, win.x, win.y]
  )

  const onPointerMove = useCallback(
    (e: ReactPointerEvent) => {
      const d = dragRef.current
      if (!d) return
      let nx = d.sx + (e.clientX - d.ox)
      let ny = d.sy + (e.clientY - d.oy)
      if (bounds) {
        nx = Math.max(-win.width + 80, Math.min(nx, bounds.width - 80))
        ny = Math.max(0, Math.min(ny, bounds.height - 40))
      } else {
        ny = Math.max(0, ny)
      }
      pendingMoveRef.current = { id: win.id, x: nx, y: ny }
      if (!moveFrameRef.current) {
        moveFrameRef.current = requestAnimationFrame(flushMove)
      }
    },
    [bounds, flushMove, win.id, win.width]
  )

  const onPointerUp = useCallback((e: ReactPointerEvent) => {
    if (moveFrameRef.current) {
      cancelAnimationFrame(moveFrameRef.current)
      flushMove()
    }
    dragRef.current = null
    setDragging(false)
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      /* already released */
    }
  }, [flushMove])

  const onPointerDownResize = useCallback(
    (e: ReactPointerEvent, direction: WindowResizeDirection) => {
      if (win.maximized) return
      e.preventDefault()
      e.stopPropagation()
      onFocus(win.id)
      resizeRef.current = {
        direction,
        pointerX: e.clientX,
        pointerY: e.clientY,
        geometry: {
          x: win.x,
          y: win.y,
          width: win.width,
          height: win.height,
        },
      }
      setResizing(direction)
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    },
    [onFocus, win.height, win.id, win.maximized, win.width, win.x, win.y]
  )

  const onPointerMoveResize = useCallback(
    (e: ReactPointerEvent) => {
      const active = resizeRef.current
      if (!active) return
      e.preventDefault()

      const dx = e.clientX - active.pointerX
      const dy = e.clientY - active.pointerY
      const start = active.geometry
      const direction = active.direction
      const hasEast = direction.includes("e")
      const hasWest = direction.includes("w")
      const hasNorth = direction.includes("n")
      const hasSouth = direction.includes("s")

      const boundWidth = bounds?.width ?? Number.POSITIVE_INFINITY
      const boundHeight = bounds?.height ?? Number.POSITIVE_INFINITY
      const meta = appMeta(win.appId)
      const minWidth = Math.min(
        Math.max(MIN_WINDOW_WIDTH, meta.minWidth),
        boundWidth,
      )
      const minHeight = Math.min(
        Math.max(MIN_WINDOW_HEIGHT, meta.minHeight),
        boundHeight,
      )

      let x = start.x
      let y = start.y
      let width = start.width
      let height = start.height

      if (hasEast) {
        if (bounds) {
          x = clamp(x, 0, Math.max(0, boundWidth - minWidth))
        }
        width = clamp(start.width + dx, minWidth, boundWidth - x)
      } else if (hasWest) {
        const right = bounds
          ? clamp(start.x + start.width, minWidth, boundWidth)
          : start.x + start.width
        x = clamp(
          start.x + dx,
          bounds ? 0 : Number.NEGATIVE_INFINITY,
          right - minWidth
        )
        width = right - x
      }

      if (hasSouth) {
        if (bounds) {
          y = clamp(y, 0, Math.max(0, boundHeight - minHeight))
        }
        height = clamp(start.height + dy, minHeight, boundHeight - y)
      } else if (hasNorth) {
        const bottom = bounds
          ? clamp(start.y + start.height, minHeight, boundHeight)
          : start.y + start.height
        y = clamp(start.y + dy, 0, bottom - minHeight)
        height = bottom - y
      }

      if (bounds) {
        width = clamp(width, minWidth, boundWidth)
        height = clamp(height, minHeight, boundHeight)
        x = clamp(x, 0, boundWidth - width)
        y = clamp(y, 0, boundHeight - height)
      }

      pendingResizeRef.current = {
        id: win.id,
        geometry: { x, y, width, height },
      }
      if (!resizeFrameRef.current) {
        resizeFrameRef.current = requestAnimationFrame(flushResize)
      }
    },
    [bounds, flushResize, win.id]
  )

  const onPointerUpResize = useCallback((e: ReactPointerEvent) => {
    if (resizeFrameRef.current) {
      cancelAnimationFrame(resizeFrameRef.current)
      flushResize()
    }
    resizeRef.current = null
    setResizing(null)
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      /* already released */
    }
  }, [flushResize])

  const layout = win.maximized
    ? {
        left: 0,
        top: 0,
        width: "100%" as const,
        height: "calc(100% - 72px)",
      }
    : {
        left: win.x,
        top: win.y,
        width: win.width,
        height: win.height,
      }

  return (
    <motion.div
      ref={frameRef}
      key={win.id}
      className={[
        "pos-window",
        focused ? "focused" : "",
        dragging ? "dragging" : "",
        resizing ? "resizing" : "",
        win.maximized ? "maximized" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        zIndex: win.z,
        position: "absolute",
      }}
      hidden={hidden}
      aria-hidden={hidden || undefined}
      tabIndex={-1}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.9, y: 16 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        left: layout.left,
        top: layout.top,
        width: layout.width,
        height: layout.height,
      }}
      exit={reduceMotion ? undefined : { opacity: 0, scale: 0.92, y: 12 }}
      transition={
        dragging || resizing || reduceMotion || hidden
          ? { duration: 0 }
          : {
              type: "spring",
              stiffness: 420,
              damping: 32,
              mass: 0.85,
            }
      }
      onPointerDown={(event) => {
        onFocus(win.id)
        const target = event.target
        if (!(target instanceof Element)) return
        if (
          target.closest(
            "button, a, input, textarea, select, [contenteditable='true'], [tabindex]:not([tabindex='-1'])",
          )
        ) {
          return
        }
        frameRef.current?.focus({ preventScroll: true })
      }}
      onFocusCapture={() => {
        if (!focused) onFocus(win.id)
      }}
      role="dialog"
      aria-label={win.title}
      data-focused={focused ? "true" : "false"}
      data-minimized={win.minimized ? "true" : "false"}
      data-closed={win.closed ? "true" : "false"}
      data-app-id={win.appId}
      data-resize-direction={resizing ?? undefined}
    >
      <div
        className="pos-titlebar"
        onPointerDown={onPointerDownTitle}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onDoubleClick={() => onMaximize(win.id)}
      >
        <div
          className="pos-traffic"
          onDoubleClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className="pos-dot pos-dot-close"
            aria-label="Close"
            onClick={(e) => {
              e.stopPropagation()
              onClose(win.id)
            }}
          >
            <span className="pos-dot-glyph">×</span>
          </button>
          <button
            type="button"
            className="pos-dot pos-dot-min"
            aria-label="Minimize"
            onClick={(e) => {
              e.stopPropagation()
              onMinimize(win.id)
            }}
          >
            <span className="pos-dot-glyph">−</span>
          </button>
          <button
            type="button"
            className="pos-dot pos-dot-max"
            aria-label="Maximize"
            onClick={(e) => {
              e.stopPropagation()
              onMaximize(win.id)
            }}
          >
            <span className="pos-dot-glyph">+</span>
          </button>
        </div>
        <span className="pos-title">{win.title}</span>
        <span className="pos-titlebar-spacer" />
      </div>
      <div className="pos-window-body">{children}</div>
      {!win.maximized &&
        RESIZE_DIRECTIONS.map((direction) => (
          <span
            key={direction}
            className={`pos-window-resize pos-window-resize-${direction}`}
            aria-hidden="true"
            onPointerDown={(event) => onPointerDownResize(event, direction)}
            onPointerMove={onPointerMoveResize}
            onPointerUp={onPointerUpResize}
            onPointerCancel={onPointerUpResize}
            onLostPointerCapture={() => {
              resizeRef.current = null
              setResizing(null)
            }}
          />
        ))}
    </motion.div>
  )
}
