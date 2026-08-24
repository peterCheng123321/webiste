import type { KernelBounds, PeterOSKernel } from "./kernel/create-kernel"

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
}
