"use client"

import { useRef, useSyncExternalStore } from "react"
import {
  createKernel,
  type KernelState,
  type PeterOSKernel,
} from "./kernel/create-kernel"

export function usePeterOSKernel() {
  const ref = useRef<PeterOSKernel | null>(null)
  if (!ref.current) ref.current = createKernel()
  return ref.current
}

export function useKernelState(kernel: PeterOSKernel): KernelState {
  return useSyncExternalStore(kernel.subscribe, kernel.getState, kernel.getState)
}
