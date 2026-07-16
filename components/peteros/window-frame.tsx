"use client"

import {
  useCallback,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react"
import { motion, AnimatePresence } from "motion/react"
import type { WindowState } from "./types"

type Props = {
  win: WindowState
  focused: boolean
  children: ReactNode
  onFocus: (id: string) => void
  onClose: (id: string) => void
  onMinimize: (id: string) => void
  onMaximize: (id: string) => void
  onMove: (id: string, x: number, y: number) => void
  bounds?: { width: number; height: number }
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
  bounds,
}: Props) {
  const dragRef = useRef<{
    ox: number
    oy: number
    sx: number
    sy: number
  } | null>(null)
  const [dragging, setDragging] = useState(false)

  const onPointerDownTitle = useCallback(
    (e: ReactPointerEvent) => {
      if (win.maximized) return
      if ((e.target as HTMLElement).closest("button")) return
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
        ny = Math.max(24, Math.min(ny, bounds.height - 40))
      } else {
        ny = Math.max(24, ny)
      }
      onMove(win.id, nx, ny)
    },
    [bounds, onMove, win.id, win.width]
  )

  const onPointerUp = useCallback((e: ReactPointerEvent) => {
    dragRef.current = null
    setDragging(false)
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      /* already released */
    }
  }, [])

  if (win.minimized) return null

  const layout = win.maximized
    ? {
        left: 0,
        top: 28,
        width: "100%" as const,
        height: "calc(100% - 28px - 80px)",
      }
    : {
        left: win.x,
        top: win.y,
        width: win.width,
        height: win.height,
      }

  return (
    <AnimatePresence>
      <motion.div
        key={win.id}
        className={[
          "pos-window",
          focused ? "focused" : "",
          dragging ? "dragging" : "",
          win.maximized ? "maximized" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          zIndex: win.z,
          position: "absolute",
        }}
        initial={{ opacity: 0, scale: 0.9, y: 16 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
          left: layout.left,
          top: layout.top,
          width: layout.width,
          height: layout.height,
        }}
        exit={{ opacity: 0, scale: 0.92, y: 12 }}
        transition={
          dragging
            ? { duration: 0 }
            : {
                type: "spring",
                stiffness: 420,
                damping: 32,
                mass: 0.85,
              }
        }
        onPointerDown={() => onFocus(win.id)}
        role="dialog"
        aria-label={win.title}
        data-focused={focused ? "true" : "false"}
      >
        <div
          className="pos-titlebar"
          onPointerDown={onPointerDownTitle}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onDoubleClick={() => onMaximize(win.id)}
        >
          <div className="pos-traffic">
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
      </motion.div>
    </AnimatePresence>
  )
}
