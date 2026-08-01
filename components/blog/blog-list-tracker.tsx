"use client"

import { useEffect } from "react"
import { track } from "@/lib/track"

export function BlogListTracker({ count }: { count: number }) {
  useEffect(() => {
    track("blog_list_view", { count })
  }, [count])
  return null
}
