"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

const nav = [
  { label: "Index", href: "#index" },
  { label: "Work", href: "#work" },
  { label: "Selected", href: "#selected" },
  { label: "Studies", href: "#studies" },
  { label: "Contact", href: "#contact" },
]

const sectionIds = nav.map((item) => item.href.slice(1))

export function SiteHeader() {
  const [activeSection, setActiveSection] = useState("top")
  const [currentTime, setCurrentTime] = useState("")

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "America/Chicago",
        }) + " CT",
      )
    }
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id)
        })
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0.05 },
    )
    sectionIds.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <header className="site-topbar fixed top-0 inset-x-0 z-50">
      <div className="editorial-container flex items-center justify-between py-4">
        <Link href="#top" className="flex items-baseline gap-3">
          <span className="font-serif text-2xl leading-none">Zhongquan Cheng</span>
          <span className="hidden md:inline font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            — Portfolio / MMXXVI
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 font-mono text-[11px] uppercase tracking-[0.22em]">
          {nav.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className={`transition-colors ${
                activeSection === item.href.slice(1)
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="text-muted-foreground/70 mr-1.5">
                {String(i).padStart(2, "0")}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="status-pill hidden lg:flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
          <span>Available · Shanghai</span>
          {currentTime && <span className="opacity-70">· {currentTime}</span>}
        </div>
      </div>
    </header>
  )
}
