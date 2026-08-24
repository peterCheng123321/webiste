import type { AppId } from "@/components/peteros/types"
import { focusedWindowId, type PeterOSKernel } from "./create-kernel"

export type ProcessRunState = "running" | "focused" | "hidden" | "suspended"

export function runState(kernel: PeterOSKernel, appId: AppId): ProcessRunState {
  const { windows, running } = kernel.getState()
  if (!running.includes(appId)) return "hidden"
  const focusedId = focusedWindowId(windows)
  const own = windows.filter((w) => w.appId === appId)
  const focused = own.find((w) => w.id === focusedId)
  if (focused) return "focused"
  const visible = own.some((w) => !w.minimized && !w.closed)
  if (visible) return "running"
  const minimized = own.some((w) => w.minimized && !w.closed)
  if (minimized) return "suspended"
  return "hidden"
}

export function shouldTick(kernel: PeterOSKernel, appId: AppId) {
  const state = runState(kernel, appId)
  return state === "focused" || state === "running"
}

export function shouldPublishImu(kernel: PeterOSKernel) {
  return runState(kernel, "sensor") === "focused"
}
