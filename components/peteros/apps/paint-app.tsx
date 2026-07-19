"use client"

import { useCallback, useEffect, useRef, useState, type PointerEvent as RE } from "react"

const COLORS = [
  ["Ink", "#1c1c1e"],
  ["Red", "#ff3b30"],
  ["Orange", "#ff9f0a"],
  ["Yellow", "#ffd60a"],
  ["Green", "#30d158"],
  ["Blue", "#0a84ff"],
  ["Indigo", "#5e5ce6"],
  ["Violet", "#bf5af2"],
  ["White", "#ffffff"],
]

type Tool = "brush" | "eraser"

export function PaintApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const activePointer = useRef<number | null>(null)
  const last = useRef<{ x: number; y: number } | null>(null)
  const [color, setColor] = useState(COLORS[0][1])
  const [size, setSize] = useState(4)
  const [tool, setTool] = useState<Tool>("brush")
  const [history, setHistory] = useState<ImageData[]>([])
  const [future, setFuture] = useState<ImageData[]>([])

  const snapshot = useCallback(() => {
    const c = canvasRef.current
    const ctx = c?.getContext("2d")
    if (!c || !ctx) return
    try {
      const data = ctx.getImageData(0, 0, c.width, c.height)
      setHistory((h) => [...h.slice(-12), data])
      setFuture([])
    } catch {
      /* tainted canvas unlikely */
    }
  }, [])

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, c.width, c.height)
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
    if (!e.isPrimary || e.button !== 0 || activePointer.current != null) return
    e.preventDefault()
    const c = canvasRef.current
    const ctx = c?.getContext("2d")
    if (!c || !ctx) return
    drawing.current = true
    activePointer.current = e.pointerId
    c.setPointerCapture(e.pointerId)
    const p = pos(e)
    last.current = p
    ctx.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over"
    ctx.beginPath()
    ctx.arc(p.x, p.y, (tool === "eraser" ? size * 2.2 : size) / 2, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()
  }

  const move = (e: RE) => {
    if (!drawing.current || activePointer.current !== e.pointerId) return
    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx || !last.current) return
    const p = pos(e)
    ctx.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over"
    ctx.beginPath()
    ctx.moveTo(last.current.x, last.current.y)
    ctx.lineTo(p.x, p.y)
    ctx.strokeStyle = color
    ctx.lineWidth = tool === "eraser" ? size * 2.2 : size
    ctx.lineCap = "round"
    ctx.stroke()
    last.current = p
  }

  const up = (event: RE) => {
    if (activePointer.current !== event.pointerId) return
    if (drawing.current) snapshot()
    drawing.current = false
    activePointer.current = null
    last.current = null
    try {
      event.currentTarget.releasePointerCapture(event.pointerId)
    } catch {
      /* capture may already be released */
    }
  }

  const undo = () => {
    const c = canvasRef.current
    const ctx = c?.getContext("2d")
    if (!c || !ctx || history.length < 2) return
    const next = history.slice(0, -1)
    const current = history.at(-1)
    const prev = next[next.length - 1]
    if (prev) ctx.putImageData(prev, 0, 0)
    if (current) setFuture((stack) => [...stack, current])
    setHistory(next)
  }

  const redo = () => {
    const c = canvasRef.current
    const ctx = c?.getContext("2d")
    const next = future.at(-1)
    if (!c || !ctx || !next) return
    ctx.putImageData(next, 0, 0)
    setFuture((stack) => stack.slice(0, -1))
    setHistory((stack) => [...stack.slice(-12), next])
  }

  useEffect(() => {
    const onUndo = () => undo()
    const onRedo = () => redo()
    window.addEventListener("peteros:paint-undo", onUndo)
    window.addEventListener("peteros:paint-redo", onRedo)
    return () => {
      window.removeEventListener("peteros:paint-undo", onUndo)
      window.removeEventListener("peteros:paint-redo", onRedo)
    }
  })

  const clear = () => {
    const c = canvasRef.current
    const ctx = c?.getContext("2d")
    if (!c || !ctx) return
    ctx.clearRect(0, 0, c.width, c.height)
    snapshot()
  }

  const save = () => {
    const c = canvasRef.current
    if (!c) return
    const exportCanvas = document.createElement("canvas")
    exportCanvas.width = c.width
    exportCanvas.height = c.height
    const ctx = exportCanvas.getContext("2d")
    if (!ctx) return
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, c.width, c.height)
    ctx.drawImage(c, 0, 0)
    const link = document.createElement("a")
    link.download = "peteros-paint.png"
    link.href = exportCanvas.toDataURL("image/png")
    link.click()
  }

  return (
    <div
      className="mac-app paint-app"
      onKeyDown={(event) => {
        if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "z") return
        event.preventDefault()
        if (event.shiftKey) redo()
        else undo()
      }}
    >
      <div className="paint-toolbar">
        <div className="paint-tools">
          <button
            type="button"
            className={tool === "brush" ? "mac-seg active" : "mac-seg"}
            aria-pressed={tool === "brush"}
            onClick={() => setTool("brush")}
          >
            Brush
          </button>
          <button
            type="button"
            className={tool === "eraser" ? "mac-seg active" : "mac-seg"}
            aria-pressed={tool === "eraser"}
            onClick={() => setTool("eraser")}
          >
            Eraser
          </button>
          <button type="button" className="mac-btn" onClick={undo} disabled={history.length < 2}>
            Undo
          </button>
          <button type="button" className="mac-btn" onClick={redo} disabled={future.length === 0}>
            Redo
          </button>
          <button type="button" className="mac-btn" onClick={clear}>
            Clear
          </button>
          <button type="button" className="mac-btn primary" onClick={save}>
            Save PNG
          </button>
        </div>
        <div className="paint-colors" role="group" aria-label="Paint colors">
          {COLORS.map(([name, swatch]) => (
            <button
              key={swatch}
              type="button"
              className={color === swatch ? "paint-swatch active" : "paint-swatch"}
              style={{
                background: swatch,
                boxShadow: swatch === "#ffffff" ? "inset 0 0 0 1px #ccc" : undefined,
              }}
              onClick={() => {
                setColor(swatch)
                setTool("brush")
              }}
              aria-label={name}
              aria-pressed={color === swatch && tool === "brush"}
            />
          ))}
        </div>
        <label className="paint-size">
          Size <output>{size}px</output>
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
        onPointerCancel={up}
        onLostPointerCapture={up}
        role="img"
        aria-label="Drawing canvas"
        tabIndex={0}
        data-window-focus
      />
      <div className="paint-statusbar" role="status">
        <span>{tool === "brush" ? "Brush" : "Eraser"} · {size}px</span>
        <span>520 × 280 px · ⌘Z undo</span>
      </div>
    </div>
  )
}
