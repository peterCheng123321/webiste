"use client"

import { useCallback, useRef, useState, type PointerEvent as RE } from "react"

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
  const drag = useRef<{ id: number; ox: number; oy: number } | null>(null)
  const idRef = useRef(3)

  const addAt = (clientX: number, clientY: number) => {
    const el = stageRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = ((clientX - rect.left) / rect.width) * 100
    const y = ((clientY - rect.top) / rect.height) * 100
    const id = idRef.current++
    const mask: Mask = {
      id,
      x,
      y,
      r: 10 + Math.random() * 10,
      hue: Math.floor(Math.random() * 360),
      label: LABELS[masks.length % LABELS.length],
    }
    setMasks((m) => [...m.slice(-8), mask])
    setSelected(id)
  }

  const onPointerDown = (e: RE) => {
    if (tool === "add") {
      addAt(e.clientX, e.clientY)
      return
    }
    const target = (e.target as HTMLElement).closest("[data-mask-id]") as HTMLElement | null
    if (!target) return
    const id = Number(target.dataset.maskId)
    const m = masks.find((x) => x.id === id)
    if (!m) return
    setSelected(id)
    drag.current = { id, ox: e.clientX, oy: e.clientY }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: RE) => {
    const d = drag.current
    if (!d || !stageRef.current) return
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
              x: Math.max(5, Math.min(95, m.x + dx)),
              y: Math.max(5, Math.min(95, m.y + dy)),
            }
          : m
      )
    )
  }

  const onPointerUp = () => {
    drag.current = null
  }

  const autoSeg = useCallback(() => {
    setMasks([
      { id: idRef.current++, x: 38, y: 42, r: 20, hue: 190, label: "torso" },
      { id: idRef.current++, x: 58, y: 38, r: 12, hue: 40, label: "head" },
      { id: idRef.current++, x: 30, y: 68, r: 11, hue: 140, label: "limb" },
      { id: idRef.current++, x: 68, y: 66, r: 11, hue: 300, label: "limb" },
    ])
  }, [])

  const sel = masks.find((m) => m.id === selected)

  return (
    <div className="mac-app segment-app">
      <div className="seg-toolbar">
        <div className="seg-tools">
          <button
            type="button"
            className={tool === "add" ? "mac-seg active" : "mac-seg"}
            onClick={() => setTool("add")}
          >
            + Mask
          </button>
          <button
            type="button"
            className={tool === "move" ? "mac-seg active" : "mac-seg"}
            onClick={() => setTool("move")}
          >
            Move
          </button>
          <button type="button" className="mac-btn" onClick={autoSeg}>
            Auto-seg
          </button>
          <button type="button" className="mac-btn" onClick={() => setMasks([])}>
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
        >
          <div className="seg-subject">
            <div className="seg-subject-head" />
            <div className="seg-subject-body" />
          </div>
          {masks.map((m) => (
            <button
              key={m.id}
              type="button"
              data-mask-id={m.id}
              className={selected === m.id ? "seg-mask active" : "seg-mask"}
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
                  onClick={() => setSelected(m.id)}
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
    </div>
  )
}
