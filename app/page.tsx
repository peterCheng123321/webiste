"use client"

import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, Github, Linkedin, Mail, MapPin, Phone } from "lucide-react"
import { defaultData } from "@/lib/default-data"

const formatMonth = (value: string) => {
  if (!value) return ""
  const [year, month] = value.split("-")
  if (!month) return year
  const date = new Date(Number(year), Number(month) - 1, 1)
  return date.toLocaleString("en-US", { month: "short", year: "numeric" })
}

const formatRange = (start: string, end: string, current: boolean) =>
  `${formatMonth(start)} — ${current || !end ? "Present" : formatMonth(end)}`

const nav = [
  { label: "Index", href: "#index" },
  { label: "Work", href: "#work" },
  { label: "Selected", href: "#selected" },
  { label: "Studies", href: "#studies" },
  { label: "Contact", href: "#contact" },
]

export default function Home() {
  const data = defaultData
  const [activeSection, setActiveSection] = useState("top")
  const [currentTime, setCurrentTime] = useState("")
  const [formData, setFormData] = useState({ name: "", email: "", message: "" })
  const [formSuccess, setFormSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const sectionIds = ["index", "work", "selected", "studies", "contact"]

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setFormSuccess(true)
      setFormData({ name: "", email: "", message: "" })
      setTimeout(() => setFormSuccess(false), 4500)
    }, 900)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const skillGroups: Array<{ key: "languages" | "ml" | "mobile" | "tools"; title: string }> = [
    { key: "languages", title: "Languages" },
    { key: "ml", title: "ML & Data" },
    { key: "mobile", title: "Mobile & Reality" },
    { key: "tools", title: "Platforms & Tools" },
  ]

  const tickerWords = [
    "Backend",
    "Applied ML",
    "Computer Vision",
    "Sensor Systems",
    "Distributed Systems",
    "Data Pipelines",
    "Signal Processing",
    "Full-Stack",
    "Interaction Design",
  ]

  return (
    <main id="top" className="min-h-screen bg-background text-foreground">
      {/* ───────────────────── Top Bar ───────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-background/85 backdrop-blur-md border-b border-[hsl(var(--rule))]">
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

          <div className="hidden lg:flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
            <span>Available · St. Louis</span>
            {currentTime && <span className="opacity-70">· {currentTime}</span>}
          </div>
        </div>
      </header>

      {/* ───────────────────── Hero ───────────────────── */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="editorial-container">
          <div className="grid grid-cols-12 gap-x-6 gap-y-10">
            <div className="col-span-12 flex items-baseline justify-between mb-2">
              <span className="eyebrow">Portfolio · Vol. 01</span>
              <span className="eyebrow hidden md:inline">St. Louis, MO · 38.627° N</span>
            </div>

            <h1 className="col-span-12 display-xl">
              Zhongquan<br />
              <span className="italic text-[hsl(var(--primary))]">Cheng.</span>
            </h1>

            <div className="col-span-12 md:col-span-7 md:col-start-1 pt-6">
              <p className="lede">
                Software engineer and researcher building reliable backends
                and applied&nbsp;ML systems. Currently at Washington University
                in St.&nbsp;Louis — previously Syracuse, Shanghai,
                and a handful of hackathons in between.
              </p>
            </div>

            <div className="col-span-12 md:col-span-4 md:col-start-9 pt-6 flex flex-col gap-4">
              <div className="flex items-baseline justify-between gap-4">
                <span className="eyebrow">Now</span>
                <span className="text-sm">M.S. CS, WashU · Backend @ Undergraduation.com</span>
              </div>
              <div className="rule" />
              <div className="flex items-baseline justify-between gap-4">
                <span className="eyebrow">Focus</span>
                <span className="text-sm">Backend · Applied ML · CV Research</span>
              </div>
              <div className="rule" />
              <div className="flex items-baseline justify-between gap-4">
                <span className="eyebrow">Status</span>
                <span className="text-sm">Open to Summer 2026 internships</span>
              </div>
            </div>

            <div className="col-span-12 flex flex-wrap gap-3 pt-10">
              <Link href="#selected" className="btn btn-solid">
                Selected work <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link href="#contact" className="btn btn-ghost">
                Get in touch
              </Link>
              <a
                href="/resume (1).pdf"
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost"
              >
                Résumé (PDF)
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────── Ticker ───────────────────── */}
      <section className="border-y border-[hsl(var(--rule))] py-6 overflow-hidden">
        <div className="ticker-track font-serif text-3xl md:text-5xl italic">
          {[...tickerWords, ...tickerWords].map((word, i) => (
            <span key={i} className="inline-flex items-center gap-12">
              {word}
              <span className="text-[hsl(var(--primary))]">✦</span>
            </span>
          ))}
        </div>
      </section>

      {/* ───────────────────── 00 / Index (About) ───────────────────── */}
      <section id="index" className="section">
        <div className="editorial-container">
          <div className="section-head">
            <div className="col-span-12 md:col-span-3 flex flex-col gap-2">
              <span className="section-index">§ 00 / Index</span>
              <span className="eyebrow">About</span>
            </div>
            <h2 className="col-span-12 md:col-span-9 display-lg">
              A habit of picking up the hard&nbsp;part&nbsp;of the stack —
              and then <span className="italic text-[hsl(var(--primary))]">finishing&nbsp;it.</span>
            </h2>
          </div>

          <div className="grid grid-cols-12 gap-x-6 gap-y-10">
            <div className="col-span-12 md:col-span-4 lg:col-span-3">
              <div className="photo-frame aspect-[3/4] reveal">
                {data.personalInfo.photo ? (
                  <img
                    src={data.personalInfo.photo}
                    alt={data.personalInfo.name}
                    className="w-full h-full object-cover grayscale-[0.15]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    Portrait
                  </div>
                )}
              </div>
              <p className="eyebrow mt-3">Fig. 01 — St. Louis, 2025</p>
            </div>

            <div className="col-span-12 md:col-span-7 md:col-start-6 space-y-8 reveal">
              <p className="lede not-italic font-sans text-[1.25rem] leading-[1.55] text-foreground/80">
                {data.personalInfo.bio}
              </p>

              <div className="grid grid-cols-2 gap-x-6 gap-y-4 font-mono text-xs uppercase tracking-[0.18em]">
                <div>
                  <div className="text-muted-foreground">Location</div>
                  <div className="text-foreground normal-case tracking-normal font-sans text-sm pt-1">
                    {data.personalInfo.location}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Email</div>
                  <a
                    href={`mailto:${data.personalInfo.email}`}
                    className="link-underline text-foreground normal-case tracking-normal font-sans text-sm pt-1 break-all"
                  >
                    {data.personalInfo.email}
                  </a>
                </div>
                <div>
                  <div className="text-muted-foreground">Phone</div>
                  <div className="text-foreground normal-case tracking-normal font-sans text-sm pt-1">
                    {data.personalInfo.phone}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Elsewhere</div>
                  <div className="flex items-center gap-3 pt-1 text-sm">
                    {data.personalInfo.github && (
                      <a
                        href={data.personalInfo.github}
                        target="_blank"
                        rel="noreferrer"
                        className="link-underline normal-case tracking-normal font-sans"
                      >
                        GitHub
                      </a>
                    )}
                    {data.personalInfo.linkedin && (
                      <a
                        href={data.personalInfo.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="link-underline normal-case tracking-normal font-sans"
                      >
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────── 01 / Work (Experience) ───────────────────── */}
      <section id="work" className="section border-t border-[hsl(var(--rule))]">
        <div className="editorial-container">
          <div className="section-head">
            <div className="col-span-12 md:col-span-3 flex flex-col gap-2">
              <span className="section-index">§ 01 / Work</span>
              <span className="eyebrow">Experience &amp; Research</span>
            </div>
            <h2 className="col-span-12 md:col-span-9 display-lg">
              Positions held, in&nbsp;chronological&nbsp;order.
            </h2>
          </div>

          <div className="grid grid-cols-12 gap-x-6">
            <div className="col-span-12 space-y-0">
              {data.experiences.map((exp, i) => (
                <article
                  key={exp.id}
                  className="grid grid-cols-12 gap-x-6 gap-y-3 py-10 border-t border-[hsl(var(--rule))] reveal"
                >
                  <div className="col-span-12 md:col-span-2 flex md:flex-col md:gap-3 justify-between md:justify-start items-baseline md:items-start">
                    <span className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                      {exp.type === "research" ? "Research" : "Professional"}
                    </span>
                  </div>

                  <div className="col-span-12 md:col-span-7 space-y-4">
                    <header className="space-y-1">
                      <h3 className="display-md">{exp.title}</h3>
                      <p className="text-base text-muted-foreground">
                        {exp.company}
                        {exp.location ? ` · ${exp.location}` : ""}
                      </p>
                    </header>
                    <ul className="space-y-2 text-[0.95rem] leading-relaxed text-foreground/85">
                      {exp.description.map((line, idx) => (
                        <li key={idx} className="flex gap-3">
                          <span className="text-[hsl(var(--primary))] shrink-0">—</span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="col-span-12 md:col-span-3 md:text-right">
                    <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {formatRange(exp.startDate, exp.endDate, exp.current)}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────── 02 / Selected Work (Projects) ───────────────────── */}
      <section id="selected" className="section border-t border-[hsl(var(--rule))]">
        <div className="editorial-container">
          <div className="section-head">
            <div className="col-span-12 md:col-span-3 flex flex-col gap-2">
              <span className="section-index">§ 02 / Selected</span>
              <span className="eyebrow">Projects</span>
            </div>
            <h2 className="col-span-12 md:col-span-9 display-lg">
              A short reading list of what I&apos;ve&nbsp;built.
            </h2>
          </div>

          <div>
            {data.projects.map((project, i) => (
              <a
                key={project.id}
                href={project.demoUrl || project.repoUrl || "#"}
                target={project.demoUrl || project.repoUrl ? "_blank" : undefined}
                rel="noreferrer"
                className="project-row group reveal"
              >
                <span className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground pt-2">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="space-y-2">
                  <h3 className="project-title display-md">
                    {project.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {project.subtitle}
                  </p>
                  <p className="text-[0.95rem] leading-relaxed text-foreground/80 max-w-2xl">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
                    {project.tags.map((t) => (
                      <span
                        key={t}
                        className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 pt-2">
                  <span className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    {project.year}
                  </span>
                  <ArrowUpRight className="w-5 h-5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-[hsl(var(--primary))]" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────── 03 / Studies (Education + Skills) ───────────────────── */}
      <section id="studies" className="section border-t border-[hsl(var(--rule))]">
        <div className="editorial-container">
          <div className="section-head">
            <div className="col-span-12 md:col-span-3 flex flex-col gap-2">
              <span className="section-index">§ 03 / Studies</span>
              <span className="eyebrow">Education &amp; Competencies</span>
            </div>
            <h2 className="col-span-12 md:col-span-9 display-lg">
              Where I studied,
              <br />
              and what I&apos;ve learned to&nbsp;use.
            </h2>
          </div>

          <div className="grid grid-cols-12 gap-x-6 gap-y-16">
            {/* Education */}
            <div className="col-span-12 md:col-span-5 space-y-8 reveal">
              <span className="eyebrow">Education</span>
              <div className="space-y-10">
                {data.education.map((edu) => (
                  <div key={edu.id} className="space-y-1">
                    <h3 className="display-md">{edu.school}</h3>
                    <p className="text-base">{edu.degree}</p>
                    <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {edu.location} · {formatMonth(edu.startDate)} — {formatMonth(edu.endDate)}
                    </p>
                    {edu.notes && (
                      <p className="text-sm text-foreground/75 pt-1">{edu.notes}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-10 space-y-4">
                <span className="eyebrow">Awards &amp; Leadership</span>
                <div className="space-y-4">
                  {data.awards.map((a) => (
                    <div key={a.id} className="space-y-0.5">
                      <p className="text-base font-medium">{a.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {a.organization} · {a.year}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-10 space-y-4">
                <span className="eyebrow">Languages</span>
                <div className="space-y-2">
                  {data.languages.map((l) => (
                    <div key={l.id} className="flex justify-between text-sm border-b border-[hsl(var(--rule))] py-2">
                      <span>{l.name}</span>
                      <span className="text-muted-foreground">{l.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="col-span-12 md:col-span-6 md:col-start-7 space-y-10 reveal">
              <span className="eyebrow">Competencies</span>
              <div className="space-y-10">
                {skillGroups.map((group) => {
                  const items = data.skills.filter((s) => s.category === group.key)
                  if (items.length === 0) return null
                  return (
                    <div
                      key={group.key}
                      className="grid grid-cols-12 gap-x-6 pt-6 border-t border-[hsl(var(--rule))]"
                    >
                      <div className="col-span-4">
                        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                          {group.title}
                        </span>
                      </div>
                      <div className="col-span-8 flex flex-wrap gap-x-5 gap-y-2">
                        {items.map((s) => (
                          <span key={s.id} className="font-serif text-xl md:text-2xl">
                            {s.name}
                            <span className="text-[hsl(var(--primary))]">.</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────── 04 / Contact ───────────────────── */}
      <section id="contact" className="section border-t border-[hsl(var(--rule))]">
        <div className="editorial-container">
          <div className="section-head">
            <div className="col-span-12 md:col-span-3 flex flex-col gap-2">
              <span className="section-index">§ 04 / Contact</span>
              <span className="eyebrow">Get in touch</span>
            </div>
            <h2 className="col-span-12 md:col-span-9 display-lg">
              A good email beats a&nbsp;bad&nbsp;meeting.
              <br />
              <span className="italic text-[hsl(var(--primary))]">Say&nbsp;hello.</span>
            </h2>
          </div>

          <div className="grid grid-cols-12 gap-x-6 gap-y-12">
            <aside className="col-span-12 md:col-span-5 space-y-10 reveal">
              <div className="space-y-1">
                <span className="eyebrow">Direct</span>
                <a
                  href={`mailto:${data.personalInfo.email}`}
                  className="block display-md link-underline"
                >
                  {data.personalInfo.email}
                </a>
              </div>

              <div className="space-y-4 pt-4 border-t border-[hsl(var(--rule))]">
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{data.personalInfo.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{data.personalInfo.location}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>Response within 24h</span>
                </div>
              </div>

              <div className="flex items-center gap-5 pt-4 border-t border-[hsl(var(--rule))]">
                {data.personalInfo.github && (
                  <a
                    href={data.personalInfo.github}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 link-underline text-sm"
                  >
                    <Github className="w-4 h-4" /> GitHub
                  </a>
                )}
                {data.personalInfo.linkedin && (
                  <a
                    href={data.personalInfo.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 link-underline text-sm"
                  >
                    <Linkedin className="w-4 h-4" /> LinkedIn
                  </a>
                )}
              </div>
            </aside>

            <form
              onSubmit={handleSubmit}
              className="col-span-12 md:col-span-7 space-y-8 reveal"
            >
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="form-field">
                  <label htmlFor="name" className="eyebrow">
                    01 · Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="Your name"
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="email" className="eyebrow">
                    02 · Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="you@domain.com"
                  />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="message" className="eyebrow">
                  03 · Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="form-input resize-none"
                  placeholder="Tell me what you're building…"
                />
              </div>

              <div className="flex items-center justify-between gap-4 pt-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  {formSuccess
                    ? "— Message received. Back to you soon."
                    : "Replies usually within 24h."}
                </span>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-solid"
                >
                  {isSubmitting ? "Sending…" : "Send message"}
                  {!isSubmitting && <ArrowUpRight className="w-4 h-4" />}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ───────────────────── Footer ───────────────────── */}
      <footer className="border-t border-[hsl(var(--rule))] py-10">
        <div className="editorial-container grid grid-cols-12 gap-6 items-baseline">
          <p className="col-span-12 md:col-span-6 font-serif text-2xl italic">
            End&nbsp;of&nbsp;document.
          </p>
          <div className="col-span-12 md:col-span-6 flex flex-wrap gap-x-6 gap-y-1 md:justify-end font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            <span>© {new Date().getFullYear()} Zhongquan Cheng</span>
            <span>Set in Instrument Serif &amp; Inter</span>
            <span>Built with Next.js</span>
          </div>
        </div>
      </footer>
    </main>
  )
}
