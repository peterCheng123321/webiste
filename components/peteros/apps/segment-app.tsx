"use client"

import {
  useCallback,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as RE,
} from "react"

type Mask = {
  id: number
  x: number
  y: number
  r: number
  hue: number
  label: string
}

const LABELS = ["torso", "limb", "head", "occluded", "region"]

export function SegmentApp() {
  const stageRef = useRef<HTMLDivElement>(null)
  const [masks, setMasks] = useState<Mask[]>([
    { id: 1, x: 42, y: 48, r: 16, hue: 200, label: "torso" },
    { id: 2, x: 62, y: 58, r: 12, hue: 12, label: "limb" },
  ])
  const [selected, setSelected] = useState<number | null>(1)
  const [tool, setTool] = useState<"add" | "move">("add")
  const [opacity, setOpacity] = useState(0.4)
  const drag = useRef<{
    id: number
    ox: number
    oy: number
    pointerId: number
  } | null>(null)
  const idRef = useRef(3)

  const addAt = (clientX: number, clientY: number) => {
    const el = stageRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = ((clientX - rect.left) / rect.width) * 100
    const y = ((clientY - rect.top) / rect.height) * 100
    const id = idRef.current++
    const r = 10 + Math.random() * 10
    const mask: Mask = {
      id,
      x: Math.max(r, Math.min(100 - r, x)),
      y: Math.max(r, Math.min(100 - r, y)),
      r,
      hue: Math.floor(Math.random() * 360),
      label: LABELS[masks.length % LABELS.length],
    }
    setMasks((m) => [...m.slice(-8), mask])
    setSelected(id)
  }

  const onPointerDown = (e: RE) => {
    if (!e.isPrimary || e.button !== 0) return
    const target = (e.target as HTMLElement).closest("[data-mask-id]") as HTMLElement | null
    if (target) {
      const id = Number(target.dataset.maskId)
      const m = masks.find((item) => item.id === id)
      if (!m) return
      setSelected(id)
      if (tool === "move") {
        drag.current = {
          id,
          ox: e.clientX,
          oy: e.clientY,
          pointerId: e.pointerId,
        }
        ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      }
      return
    }
    if (tool === "add") {
      addAt(e.clientX, e.clientY)
      return
    }
  }

  const onPointerMove = (e: RE) => {
    const d = drag.current
    if (!d || d.pointerId !== e.pointerId || !stageRef.current) return
    const rect = stageRef.current.getBoundingClientRect()
    const dx = ((e.clientX - d.ox) / rect.width) * 100
    const dy = ((e.clientY - d.oy) / rect.height) * 100
    d.ox = e.clientX
    d.oy = e.clientY
    setMasks((list) =>
      list.map((m) =>
        m.id === d.id
          ? {
              ...m,
              x: Math.max(m.r, Math.min(100 - m.r, m.x + dx)),
              y: Math.max(m.r, Math.min(100 - m.r, m.y + dy)),
            }
          : m
      )
    )
  }

  const onPointerUp = (event: RE) => {
    if (drag.current && drag.current.pointerId !== event.pointerId) return
    drag.current = null
    try {
      event.currentTarget.releasePointerCapture(event.pointerId)
    } catch {
      /* capture may already be released */
    }
  }

  const autoSeg = useCallback(() => {
    const next = [
      { id: idRef.current++, x: 38, y: 42, r: 20, hue: 190, label: "torso" },
      { id: idRef.current++, x: 58, y: 38, r: 12, hue: 40, label: "head" },
      { id: idRef.current++, x: 30, y: 68, r: 11, hue: 140, label: "limb" },
      { id: idRef.current++, x: 68, y: 66, r: 11, hue: 300, label: "limb" },
    ]
    setMasks(next)
    setSelected(next[0]?.id ?? null)
  }, [])

  const onMaskKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    mask: Mask,
  ) => {
    const delta = event.shiftKey ? 2 : 0.5
    let dx = 0
    let dy = 0
    if (event.key === "ArrowLeft") dx = -delta
    else if (event.key === "ArrowRight") dx = delta
    else if (event.key === "ArrowUp") dy = -delta
    else if (event.key === "ArrowDown") dy = delta
    else if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault()
      setMasks((current) => current.filter((item) => item.id !== mask.id))
      setSelected(null)
      return
    } else return

    event.preventDefault()
    setMasks((current) =>
      current.map((item) =>
        item.id === mask.id
          ? {
              ...item,
              x: Math.max(item.r, Math.min(100 - item.r, item.x + dx)),
              y: Math.max(item.r, Math.min(100 - item.r, item.y + dy)),
            }
          : item,
      ),
    )
  }

  const sel = masks.find((m) => m.id === selected)

  return (
    <div className="mac-app segment-app">
      <div className="seg-toolbar">
        <div className="seg-tools">
          <button
            type="button"
            className={tool === "add" ? "mac-seg active" : "mac-seg"}
            aria-pressed={tool === "add"}
            onClick={() => setTool("add")}
          >
            + Mask
          </button>
          <button
            type="button"
            className={tool === "move" ? "mac-seg active" : "mac-seg"}
            aria-pressed={tool === "move"}
            onClick={() => setTool("move")}
          >
            Move
          </button>
          <button type="button" className="mac-btn" onClick={autoSeg}>
            Auto-seg
          </button>
          <button
            type="button"
            className="mac-btn"
            onClick={() => {
              setMasks([])
              setSelected(null)
            }}
            disabled={masks.length === 0}
          >
            Clear
          </button>
        </div>
        <label className="seg-opacity">
          Opacity
          <input
            type="range"
            min={0.15}
            max={0.75}
            step={0.05}
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="seg-layout">
        <div
          ref={stageRef}
          className="seg-stage"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onLostPointerCapture={() => {
            drag.current = null
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/peteros/segment-patient-frame.png"
            alt="Anonymous overhead depth-camera frame of a patient on a clinical bed"
            className="seg-source-image"
            draggable={false}
          />
          {masks.map((m) => (
            <button
              key={m.id}
              type="button"
              data-mask-id={m.id}
              className={selected === m.id ? "seg-mask active" : "seg-mask"}
              aria-label={`${m.label} mask ${m.id}`}
              aria-pressed={selected === m.id}
              style={{
                left: `${m.x}%`,
                top: `${m.y}%`,
                width: `${m.r * 2}%`,
                height: `${m.r * 2 * 0.9}%`,
                background: `hsla(${m.hue}, 75%, 55%, ${opacity})`,
                borderColor: `hsla(${m.hue}, 85%, 60%, 0.95)`,
              }}
              onClick={(e) => {
                e.stopPropagation()
                setSelected(m.id)
              }}
              onKeyDown={(event) => onMaskKeyDown(event, m)}
            />
          ))}
          <span className="seg-hint">
            {tool === "add" ? "click to drop a mask" : "drag masks to refine"}
          </span>
        </div>

        <aside className="seg-side">
          <h3>Masks ({masks.length})</h3>
          <ul className="seg-list">
            {masks.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  className={selected === m.id ? "active" : ""}
                  aria-pressed={selected === m.id}
                  data-window-focus={selected === m.id ? "" : undefined}
                  onClick={() => setSelected(m.id)}
                  onKeyDown={(event) => onMaskKeyDown(event, m)}
                >
                  <i style={{ background: `hsl(${m.hue}, 70%, 55%)` }} />
                  <span>{m.label}</span>
                  <em>#{m.id}</em>
                </button>
              </li>
            ))}
          </ul>
          {sel && (
            <div className="seg-selected-info">
              <strong>{sel.label}</strong>
              <span>
                center {sel.x.toFixed(0)}%, {sel.y.toFixed(0)}%
              </span>
              <button
                type="button"
                className="mac-btn"
                onClick={() => {
                  setMasks((m) => m.filter((x) => x.id !== sel.id))
                  setSelected(null)
                }}
              >
                Delete mask
              </button>
            </div>
          )}
          <p className="seg-footnote">SAM-flavored demo · AI for Health CV vibe</p>
        </aside>
      </div>
      <div className="seg-statusbar" role="status">
        <span>{masks.length} {masks.length === 1 ? "mask" : "masks"} · frame 0248</span>
        <span>{selected ? `${sel?.label ?? "mask"} selected · arrows nudge` : "No selection"}</span>
      </div>
    </div>
  )
}
