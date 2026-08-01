"use client"

import { useEffect, useState } from "react"
import { PETEROS_DESKTOP_MQ } from "@/lib/peteros-desktop"

/**
 * True only on viewports wide enough for PeterOS.
 * Starts false to avoid SSR/client mismatch and accidental mobile open.
 */
export function usePeterOSDesktop() {
  const [desktop, setDesktop] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(PETEROS_DESKTOP_MQ)
    const sync = () => setDesktop(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  return desktop
}
