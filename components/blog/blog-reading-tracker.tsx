"use client"

import { useEffect, useRef } from "react"
import { track } from "@/lib/track"

type Props = {
  slug: string
  title: string
}

/**
 * Fires blog_view on mount, blog_scroll at 25/50/75, blog_complete at ~90%.
 */
export function BlogReadingTracker({ slug, title }: Props) {
  const fired = useRef(new Set<string>())

  useEffect(() => {
    track("blog_view", { slug, title })

    const onScroll = () => {
      const el = document.documentElement
      const max = el.scrollHeight - el.clientHeight
      if (max <= 0) return
      const pct = Math.round((el.scrollTop / max) * 100)

      for (const mark of [25, 50, 75] as const) {
        const key = `s${mark}`
        if (pct >= mark && !fired.current.has(key)) {
          fired.current.add(key)
          track("blog_scroll", { slug, depth: mark })
        }
      }

      if (pct >= 90 && !fired.current.has("done")) {
        fired.current.add("done")
        track("blog_complete", { slug })
      }
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })

    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest?.(
        ".blog-prose a[href]",
      ) as HTMLAnchorElement | null
      if (!anchor) return
      const href = anchor.getAttribute("href") || ""
      if (!/^https?:\/\//i.test(href)) return
      try {
        const u = new URL(href)
        if (u.origin !== window.location.origin) {
          track("blog_outbound", { slug, host: u.hostname })
        }
      } catch {
        /* ignore */
      }
    }
    document.addEventListener("click", onClick, { capture: true })

    return () => {
      window.removeEventListener("scroll", onScroll)
      document.removeEventListener("click", onClick, { capture: true })
    }
  }, [slug, title])

  return null
}
