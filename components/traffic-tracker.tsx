"use client"

import { useEffect } from "react"
import { track } from "@/lib/track"

/**
 * Global click/outbound traffic tracking for the portfolio.
 * Uses event delegation so homepage links, footer CTAs, and PeterOS chrome
 * are covered without wiring every element by hand.
 */
export function TrafficTracker() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      if (!target) return

      // PeterOS open buttons
      if (target.closest("[data-open-peteros]")) {
        track("cta_peteros_open", { source: pathSource() })
        return
      }

      const anchor = target.closest("a")
      if (!anchor) return

      const href = anchor.getAttribute("href") || ""
      if (!href || href.startsWith("#")) return

      if (href.includes("resume.pdf") || href.endsWith("/resume.pdf")) {
        track("cta_resume", {
          source: pathSource(),
          download: anchor.hasAttribute("download") ? "true" : "false",
        })
        return
      }

      if (href.startsWith("mailto:")) {
        track("cta_email", { source: pathSource() })
        return
      }

      if (href.includes("github.com")) {
        track("cta_github", { source: pathSource() })
        return
      }

      if (href.includes("linkedin.com")) {
        track("cta_linkedin", { source: pathSource() })
        return
      }

      if (href === "/os" || href.startsWith("/os")) {
        track("cta_full_desktop", { source: pathSource() })
        return
      }

      // External outbound (http/https, different origin)
      if (/^https?:\/\//i.test(href)) {
        try {
          const url = new URL(href)
          if (url.origin !== window.location.origin) {
            track("outbound_link", {
              host: url.hostname,
              path: url.pathname,
              source: pathSource(),
            })
          }
        } catch {
          // ignore malformed URLs
        }
      }
    }

    document.addEventListener("click", onClick, { capture: true })
    return () => document.removeEventListener("click", onClick, { capture: true })
  }, [])

  return null
}

function pathSource() {
  if (typeof window === "undefined") return "ssr"
  return window.location.pathname || "/"
}
