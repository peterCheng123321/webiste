"use client"

import { useEffect } from "react"

/**
 * Adds the `is-visible` class to every `.reveal` element as it scrolls into
 * view, driving the CSS entrance animations. Renders nothing — it only wires
 * up the observer over the server-rendered markup.
 */
export function RevealOnScroll() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible")
        })
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
    )
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return null
}
