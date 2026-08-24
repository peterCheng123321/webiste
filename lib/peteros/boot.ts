import type { KernelBounds, PeterOSKernel } from "./kernel/create-kernel"
import { createIoQueue } from "./kernel/io-queue"

function mark(name: string) {
  if (typeof performance === "undefined") return
  performance.mark(name)
}

function measure(name: string, start: string, end: string) {
  if (typeof performance === "undefined") return
  try {
    performance.measure(name, start, end)
  } catch {
    /* marks missing */
  }
}

function idle(cb: () => void) {
  if (typeof window === "undefined") {
    cb()
    return
  }
  const ric = window.requestIdleCallback?.bind(window)
  if (ric) ric(() => cb(), { timeout: 2000 })
  else window.setTimeout(cb, 1)
}

/** Prefetch toy apps after the critical shell+About path. */
export function scheduleDeferredIo() {
  const queue = createIoQueue()
  queue.enqueue({
    id: "critical-done",
    priority: "critical",
    run: async () => {
      mark("peteros-critical-io-done")
    },
  })
  queue.enqueue({
    id: "toy-chunks",
    priority: "deferred",
    run: async () => {
      await Promise.all([
        import("@/components/peteros/apps/projects-app"),
        import("@/components/peteros/apps/resume-app"),
        import("@/components/peteros/apps/finder-app"),
        import("@/components/peteros/apps/terminal-app"),
        import("@/components/peteros/apps/scheduler-app"),
        import("@/components/peteros/apps/ats-app"),
        import("@/components/peteros/apps/sensor-app"),
        import("@/components/peteros/apps/segment-app"),
        import("@/components/peteros/apps/paint-app"),
      ])
    },
  })
  idle(() => {
    void queue.drain()
  })
}

/** Shared boot path for `/os` and the homepage peel. */
export function bootPeterOS(kernel: PeterOSKernel, bounds: KernelBounds) {
  if (kernel.getState().booted) {
    kernel.setBounds(bounds)
    return
  }
  mark("peteros-boot-start")
  kernel.init(bounds)
  mark("peteros-about-visible")
  measure("peteros-boot", "peteros-boot-start", "peteros-about-visible")
  scheduleDeferredIo()
}
