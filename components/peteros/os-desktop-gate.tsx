"use client"

import "@/app/peteros.css"
import type { ReactNode } from "react"
import Link from "next/link"
import { usePeterOSDesktop } from "./use-peteros-desktop"

/**
 * Wraps the full /os route. On small screens, skip loading PeterOS entirely
 * and point people back to the portfolio.
 */
export function OsDesktopGate({ children }: { children: ReactNode }) {
  const desktop = usePeterOSDesktop()

  if (!desktop) {
    return (
      <main className="os-mobile-gate">
        <p className="os-mobile-gate-kicker">PeterOS</p>
        <h1 className="os-mobile-gate-title">Desktop only</h1>
        <p className="os-mobile-gate-copy">
          The interactive desktop needs a larger screen (about 900px and up).
          On this device, use the portfolio homepage instead.
        </p>
        <p className="os-mobile-gate-actions">
          <Link href="/">← Back to portfolio</Link>
          <a href="/resume.pdf" target="_blank" rel="noreferrer">
            Résumé (PDF)
          </a>
        </p>
      </main>
    )
  }

  return <>{children}</>
}
