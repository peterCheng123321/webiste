"use client"

import { useCallback, useEffect, useRef, useState, type PointerEvent as RE } from "react"

const COLORS = [
  "#1c1c1e",
  "#ff3b30",
  "#ff9f0a",
  "#ffd60a",
  "#30d158",
  "#0a84ff",
  "#5e5ce6",
  "#bf5af2",
  "#ffffff",
]

type Tool = "brush" | "eraser"

export function PaintApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const last = useRef<{ x: number; y: number } | null>(null)
  const [color, setColor] = useState(COLORS[0])
  const [size, setSize] = useState(4)
  const [tool, setTool] = useState<Tool>("brush")
  const [history, setHistory] = useState<ImageData[]>([])

  const snapshot = useCallback(() => {
    const c = canvasRef.current
    const ctx = c?.getContext("2d")
    if (!c || !ctx) return
    try {
      const data = ctx.getImageData(0, 0, c.width, c.height)
      setHistory((h) => [...h.slice(-12), data])
    } catch {
      /* tainted canvas unlikely */
    }
  }, [])

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext("2d")
    if (!ctx) return
    ctx.fillStyle = "#fafafa"
    ctx.fillRect(0, 0, c.width, c.height)
    // subtle paper grain grid
    ctx.strokeStyle = "rgba(0,0,0,0.03)"
    for (let x = 0; x < c.width; x += 20) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, c.height)
      ctx.stroke()
    }
    snapshot()
  }, [snapshot])

  const pos = (e: RE) => {
    const c = canvasRef.current!
    const r = c.getBoundingClientRect()
    return {
      x: ((e.clientX - r.left) / r.width) * c.width,
      y: ((e.clientY - r.top) / r.height) * c.height,
    }
  }

  const down = (e: RE) => {
    drawing.current = true
    const c = canvasRef.current
    const ctx = c?.getContext("2d")
    if (!c || !ctx) return
    c.setPointerCapture(e.pointerId)
    const p = pos(e)
    last.current = p
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.lineWidth = size
    ctx.strokeStyle = tool === "eraser" ? "#fafafa" : color
    if (tool === "eraser") ctx.lineWidth = size * 2.2
  }

  const move = (e: RE) => {
    if (!drawing.current) return
    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx || !last.current) return
    const p = pos(e)
    ctx.beginPath()
    ctx.moveTo(last.current.x, last.current.y)
    ctx.lineTo(p.x, p.y)
    ctx.strokeStyle = tool === "eraser" ? "#fafafa" : color
    ctx.lineWidth = tool === "eraser" ? size * 2.2 : size
    ctx.lineCap = "round"
    ctx.stroke()
    last.current = p
  }

  const up = () => {
    if (drawing.current) snapshot()
    drawing.current = false
    last.current = null
  }

  const undo = () => {
    const c = canvasRef.current
    const ctx = c?.getContext("2d")
    if (!c || !ctx || history.length < 2) return
    const next = history.slice(0, -1)
    const prev = next[next.length - 1]
    if (prev) ctx.putImageData(prev, 0, 0)
    setHistory(next)
  }

  const clear = () => {
    const c = canvasRef.current
    const ctx = c?.getContext("2d")
    if (!c || !ctx) return
    ctx.fillStyle = "#fafafa"
    ctx.fillRect(0, 0, c.width, c.height)
    snapshot()
  }

  return (
    <div className="mac-app paint-app">
      <div className="paint-toolbar">
        <div className="paint-tools">
          <button
            type="button"
            className={tool === "brush" ? "mac-seg active" : "mac-seg"}
            onClick={() => setTool("brush")}
          >
            Brush
          </button>
          <button
            type="button"
            className={tool === "eraser" ? "mac-seg active" : "mac-seg"}
            onClick={() => setTool("eraser")}
          >
            Eraser
          </button>
          <button type="button" className="mac-btn" onClick={undo} disabled={history.length < 2}>
            Undo
          </button>
          <button type="button" className="mac-btn" onClick={clear}>
            Clear
          </button>
        </div>
        <div className="paint-colors">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={color === c ? "paint-swatch active" : "paint-swatch"}
              style={{
                background: c,
                boxShadow: c === "#ffffff" ? "inset 0 0 0 1px #ccc" : undefined,
              }}
              onClick={() => {
                setColor(c)
                setTool("brush")
              }}
              aria-label={c}
            />
          ))}
        </div>
        <label className="paint-size">
          Size
          <input
            type="range"
            min={1}
            max={28}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
          />
        </label>
      </div>
      <canvas
        ref={canvasRef}
        width={520}
        height={280}
        className="paint-canvas"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerLeave={up}
      />
    </div>
  )
}
