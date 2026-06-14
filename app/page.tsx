import type { CSSProperties, ReactNode } from "react"
import Link from "next/link"
import { ArrowUpRight, Github, Linkedin, Mail, MapPin, Phone } from "lucide-react"
import { defaultData, type Skill } from "@/lib/default-data"
import { SiteHeader } from "@/components/site-header"
import { RevealOnScroll } from "@/components/reveal-on-scroll"
import { ContactForm } from "@/components/contact-form"
import { SurfaceToggle } from "@/components/surface-toggle"

const formatMonth = (value: string) => {
  if (!value) return ""
  const [year, month] = value.split("-")
  if (!month) return year
  const date = new Date(Number(year), Number(month) - 1, 1)
  return date.toLocaleString("en-US", { month: "short", year: "numeric" })
}

const formatRange = (start: string, end: string, current: boolean) =>
  `${formatMonth(start)} — ${current || !end ? "Present" : formatMonth(end)}`

const skillGroups: Array<{ key: Skill["category"]; title: string }> = [
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

const focusRoman = ["i.", "ii.", "iii.", "iv.", "v.", "vi.", "vii.", "viii.", "ix."]

function SectionHead({
  index,
  eyebrow,
  children,
}: {
  index: string
  eyebrow: string
  children: ReactNode
}) {
  return (
    <div className="section-head">
      <div className="col-span-12 md:col-span-3 flex flex-col gap-2">
        <span className="section-index">{index}</span>
        <span className="eyebrow">{eyebrow}</span>
      </div>
      <h2 className="col-span-12 md:col-span-9 display-lg">{children}</h2>
    </div>
  )
}

export default function Home() {
  const data = defaultData

  return (
    <main id="top" className="relative z-10 min-h-screen text-foreground">
      <SiteHeader />
      <RevealOnScroll />
      <SurfaceToggle />

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
                href="/resume.pdf"
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

      {/* ───────────────────── Focus index (glass plate) ───────────────────── */}
      <section className="focus-section">
        <div className="editorial-container">
          <div className="focus-plate reveal">
            <div className="focus-head">
              <span className="eyebrow">§ Focus / An index</span>
              <span className="eyebrow">Nine areas · 2026</span>
            </div>
            <div className="focus-grid">
              {tickerWords.map((word, i) => (
                <div
                  key={word}
                  className="focus-item"
                  style={{ "--i": i } as CSSProperties}
                >
                  <span className="eyebrow">{focusRoman[i]}</span>
                  <span className="focus-w">{word}</span>
                  <span className="focus-star">✦</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────── 00 / Index (About) ───────────────────── */}
      <section id="index" className="section">
        <div className="editorial-container">
          <SectionHead index="§ 00 / Index" eyebrow="About">
            A habit of picking up the hard&nbsp;part&nbsp;of the stack —
            and then <span className="italic text-[hsl(var(--primary))]">finishing&nbsp;it.</span>
          </SectionHead>

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
          <SectionHead index="§ 01 / Work" eyebrow="Experience & Research">
            Positions held, in&nbsp;chronological&nbsp;order.
          </SectionHead>

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
          <SectionHead index="§ 02 / Selected" eyebrow="Projects">
            A short reading list of what I&apos;ve&nbsp;built.
          </SectionHead>

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
          <SectionHead index="§ 03 / Studies" eyebrow="Education & Competencies">
            Where I studied,
            <br />
            and what I&apos;ve learned to&nbsp;use.
          </SectionHead>

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
                        <span className="eyebrow">{group.title}</span>
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
          <SectionHead index="§ 04 / Contact" eyebrow="Get in touch">
            A good email beats a&nbsp;bad&nbsp;meeting.
            <br />
            <span className="italic text-[hsl(var(--primary))]">Say&nbsp;hello.</span>
          </SectionHead>

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

            <ContactForm email={data.personalInfo.email} />
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
