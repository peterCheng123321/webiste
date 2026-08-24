"use client"

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react"

const W = 400
const H = 120
const FRAME_MS = 1000 / 60

type Telemetry = {
  mag: number
  label: "idle" | "motion" | "active"
  peak: number
  samples: number
}

function pushSample(buffer: number[], value: number) {
  buffer.push(Math.max(4, Math.min(H - 4, value + (Math.random() - 0.5) * 1.5)))
  if (buffer.length > W) buffer.shift()
}

function strokeSignal(
  ctx: CanvasRenderingContext2D,
  buffer: number[],
  color: string,
) {
  ctx.strokeStyle = color
  ctx.lineWidth = 1.6
  ctx.beginPath()
  buffer.forEach((y, x) => (x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
  ctx.stroke()
}

type Props = {
  suspended?: boolean
}

export function SensorApp({ suspended = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bufX = useRef<number[]>(Array(W).fill(H / 2))
  const bufY = useRef<number[]>(Array(W).fill(H / 2))
  const bufZ = useRef<number[]>(Array(W).fill(H / 2))
  const target = useRef({ x: H / 2, y: H / 2, z: H / 2 })
  const [mode, setMode] = useState<"mouse" | "motion">("mouse")
  const [running, setRunning] = useState(true)
  const [telemetry, setTelemetry] = useState<Telemetry>({
    mag: 0,
    label: "idle",
    peak: 0,
    samples: 0,
  })
  const [deviceStatus, setDeviceStatus] = useState<
    "idle" | "requesting" | "live" | "denied" | "unavailable"
  >("idle")
  const peakRef = useRef(0)
  const sampleCountRef = useRef(0)

  useEffect(() => {
    if (suspended || !running) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const paint = (t: { x: number; y: number; z: number }) => {
      pushSample(bufX.current, t.x)
      pushSample(bufY.current, t.y)
      pushSample(bufZ.current, t.z)
      ctx.fillStyle = "#0b0f14"
      ctx.fillRect(0, 0, W, H)
      ctx.strokeStyle = "rgba(255,255,255,0.06)"
      ctx.beginPath()
      for (let y = 0; y < H; y += 20) {
        ctx.moveTo(0, y)
        ctx.lineTo(W, y)
      }
      ctx.stroke()
      strokeSignal(ctx, bufX.current, "#ff6b6b")
      strokeSignal(ctx, bufY.current, "#4ecdc4")
      strokeSignal(ctx, bufZ.current, "#ffe66d")
      const last =
        Math.abs((bufX.current.at(-1) ?? H / 2) - H / 2) +
        Math.abs((bufY.current.at(-1) ?? H / 2) - H / 2) +
        Math.abs((bufZ.current.at(-1) ?? H / 2) - H / 2)
      const m = Math.min(100, Math.round((last / (H * 1.2)) * 100))
      peakRef.current = Math.max(peakRef.current * 0.995, m)
      sampleCountRef.current++
      setTelemetry({
        mag: m,
        peak: Math.round(peakRef.current),
        samples: sampleCountRef.current,
        label: m > 55 ? "active" : m > 22 ? "motion" : "idle",
      })
    }

    let worker: Worker | null = null
    let raf = 0
    let lastPublish = 0
    try {
      worker = new Worker(new URL("@/lib/peteros/workers/imu.worker.ts", import.meta.url))
      worker.onmessage = (event: MessageEvent) => {
        if (event.data?.type !== "sample") return
        target.current = { x: event.data.x, y: event.data.y, z: event.data.z }
        paint(target.current)
      }
      worker.onerror = () => {
        worker?.terminate()
        worker = null
      }
      const sync = setInterval(() => {
        worker?.postMessage({ type: "target", ...target.current })
      }, FRAME_MS)
      worker.postMessage({ type: "start" })
      return () => {
        clearInterval(sync)
        worker?.postMessage({ type: "stop" })
        worker?.terminate()
      }
    } catch {
      const draw = (now: number) => {
        if (now - lastPublish >= 100) {
          lastPublish = now
          paint(target.current)
        }
        raf = requestAnimationFrame(draw)
      }
      raf = requestAnimationFrame(draw)
      return () => cancelAnimationFrame(raf)
    }
  }, [running, suspended])

  useEffect(() => {
    if (suspended) return
    if (mode !== "motion" || deviceStatus !== "live") return
    const handler = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity
      if (!a) return
      target.current = {
        x: H / 2 + (a.x ?? 0) * 4,
        y: H / 2 + (a.y ?? 0) * 4,
        z: H / 2 + ((a.z ?? 0) - 9.8) * 4,
      }
    }
    window.addEventListener("devicemotion", handler)
    return () => window.removeEventListener("devicemotion", handler)
  }, [deviceStatus, mode, suspended])

  const enableDevice = async () => {
    if (typeof DeviceMotionEvent === "undefined") {
      setDeviceStatus("unavailable")
      return
    }

    setDeviceStatus("requesting")
    const motionEvent = DeviceMotionEvent as typeof DeviceMotionEvent & {
      requestPermission?: () => Promise<"granted" | "denied">
    }
    try {
      const permission = motionEvent.requestPermission
        ? await motionEvent.requestPermission()
        : "granted"
      if (permission !== "granted") {
        setDeviceStatus("denied")
        return
      }
      setMode("motion")
      setDeviceStatus("live")
    } catch {
      setDeviceStatus("denied")
    }
  }

  const usePointer = () => {
    setMode("mouse")
    setDeviceStatus("idle")
  }

  const resetPeak = () => {
    peakRef.current = 0
    setTelemetry((current) => ({ ...current, peak: 0 }))
  }

  const updatePointer = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (mode !== "mouse") return
    const rect = event.currentTarget.getBoundingClientRect()
    const nx = ((event.clientX - rect.left) / rect.width) * H
    const ny = ((event.clientY - rect.top) / rect.height) * H
    target.current = {
      x: Math.max(4, Math.min(H - 4, nx)),
      y: Math.max(4, Math.min(H - 4, ny)),
      z: Math.max(4, Math.min(H - 4, (nx + ny) / 2)),
    }
  }

  const sourceStatus =
    deviceStatus === "denied"
      ? "Device permission denied · using Pointer"
      : deviceStatus === "unavailable"
        ? "Device motion unavailable · using Pointer"
        : mode === "motion"
          ? "Device motion connected"
          : "Move the pointer over the scope"
  const { mag, label, peak, samples } = telemetry

  return (
    <div className="mac-app sensor-app">
      <div className="sensor-top sensor-commandbar">
        <div className="sensor-command-copy">
          <span>3-axis stream</span>
          <strong>{running ? `${mode === "motion" ? "Device" : "Pointer"} source · live` : "Capture paused"}</strong>
        </div>
        <div className="sensor-controls">
          <button
            type="button"
            className={mode === "mouse" ? "mac-seg active" : "mac-seg"}
            aria-pressed={mode === "mouse"}
            onClick={usePointer}
          >
            Pointer
          </button>
          <button
            type="button"
            className={mode === "motion" ? "mac-seg active" : "mac-seg"}
            aria-pressed={mode === "motion"}
            onClick={enableDevice}
            disabled={deviceStatus === "requesting"}
          >
            {deviceStatus === "requesting" ? "Requesting…" : "Device"}
          </button>
          <button
            type="button"
            className="mac-btn"
            onClick={() => setRunning((r) => !r)}
          >
            {running ? "Pause" : "Resume"}
          </button>
          <button type="button" className="mac-btn" onClick={resetPeak} disabled={peak === 0}>
            Reset peak
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="sensor-canvas"
        role="img"
        aria-label="Live X, Y, and Z motion signal plot"
        onPointerDown={updatePointer}
        onPointerMove={updatePointer}
      />

      <div className="sensor-legend">
        <span className="x">X</span>
        <span className="y">Y</span>
        <span className="z">Z</span>
      </div>

      <div className="sensor-dashboard">
        <div className="sensor-gauge">
          <span>Magnitude</span>
          <strong>{mag}%</strong>
          <div className="sensor-bar">
            <i style={{ width: `${mag}%` }} />
          </div>
        </div>
        <div className="sensor-gauge">
          <span>Peak</span>
          <strong>{peak}%</strong>
          <div className="sensor-bar peak">
            <i style={{ width: `${peak}%` }} />
          </div>
        </div>
        <div className="sensor-class">
          <span>Classifier</span>
          <strong className={label}>{label}</strong>
          <small>idle / motion / active · demo only</small>
        </div>
      </div>
      <div className="sensor-statusbar" aria-label="Sensor capture status">
        <span>{samples.toLocaleString()} samples · 60 Hz signal / 10 Hz UI</span>
        <span>{sourceStatus}</span>
      </div>
      <span className="sr-only" aria-live="polite">{sourceStatus}</span>
    </div>
  )
}
