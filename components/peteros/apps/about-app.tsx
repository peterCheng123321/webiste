"use client"

import {
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react"
import { defaultData } from "@/lib/default-data"

type Tab = "overview" | "experience" | "skills" | "contact"
type StationId = "syracuse" | "washu" | "deloitte"

const STATIONS: Array<{
  id: StationId
  label: string
  meta: string
  phase: string
  detail: string
}> = [
  {
    id: "syracuse",
    label: "Syracuse",
    meta: "B.S. CS · 2025",
    phase: "ARCHIVED / FOUNDATION",
    detail: "Systems, mobile engineering, and research foundations came online here.",
  },
  {
    id: "washu",
    label: "WashU",
    meta: "M.S. CS · live",
    phase: "ACTIVE / RESEARCH",
    detail: "Applied ML, computer vision, and reliable data pipelines are running now.",
  },
  {
    id: "deloitte",
    label: "Deloitte",
    meta: "Analyst 1 · next",
    phase: "QUEUED / NEXT BOOT",
    detail: "Technology Transformation in Shanghai is the next system environment.",
  },
]

const TAB_LABELS: Array<[Tab, string]> = [
  ["overview", "Identity"],
  ["experience", "Logbook"],
  ["skills", "Modules"],
  ["contact", "Ports"],
]

export function AboutApp() {
  const { personalInfo, experiences, skills, awards, languages } = defaultData
  const [tab, setTab] = useState<Tab>("overview")
  const [station, setStation] = useState<StationId>("deloitte")
  const [now, setNow] = useState<Date | null>(null)
  const deloitte = experiences.find((e) => e.company === "Deloitte")
  const current = experiences.filter((e) => e.current)
  const selectedStation = useMemo(
    () => STATIONS.find((item) => item.id === station) ?? STATIONS[0],
    [station],
  )

  useEffect(() => {
    const tick = () => setNow(new Date())
    tick()
    const interval = window.setInterval(tick, 1000)
    return () => window.clearInterval(interval)
  }, [])

  const shanghaiTime = now
    ? new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Shanghai",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(now)
    : "--:--:--"
  const bootWindow = deloitte?.startDate.replace("-", ".") ?? "2026.08"

  const onTabKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    currentTab: Tab,
  ) => {
    const tabs = TAB_LABELS.map(([id]) => id)
    const currentIndex = tabs.indexOf(currentTab)
    let nextIndex = currentIndex

    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length
    else if (event.key === "ArrowLeft")
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length
    else if (event.key === "Home") nextIndex = 0
    else if (event.key === "End") nextIndex = tabs.length - 1
    else return

    event.preventDefault()
    const nextTab = tabs[nextIndex]
    setTab(nextTab)
    requestAnimationFrame(() => document.getElementById(`about-tab-${nextTab}`)?.focus())
  }

  return (
    <div className="mac-app about-app">
      <div className="mac-toolbar about-toolbar">
        <span className="about-toolbar-mark" aria-hidden="true">
          SYS/ABOUT
        </span>
        <div className="about-tabset" role="tablist" aria-label="System profile views">
          {TAB_LABELS.map(([id, label]) => (
            <button
              key={id}
              id={`about-tab-${id}`}
              type="button"
              role="tab"
              aria-selected={tab === id}
              aria-controls={`about-panel-${id}`}
              tabIndex={tab === id ? 0 : -1}
              className={tab === id ? "mac-seg active" : "mac-seg"}
              onClick={() => setTab(id)}
              onKeyDown={(event) => onTabKeyDown(event, id)}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="about-toolbar-live">
          <span aria-hidden="true" /> LIVE
        </span>
      </div>

      <div
        className="mac-app-body about-app-body"
        id={`about-panel-${tab}`}
        role="tabpanel"
        aria-labelledby={`about-tab-${tab}`}
      >
        {tab === "overview" && (
          <section className="about-console" aria-label="Peter identity system">
            <header className="about-console-head">
              <div className="about-avatar-node">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={personalInfo.photo}
                  alt={personalInfo.name}
                  className="about-avatar"
                />
                <span className="about-avatar-signal" aria-hidden="true" />
              </div>

              <div className="about-identity">
                <p className="about-kicker">PETEROS / IDENTITY NODE 01</p>
                <h2>
                  Peter <span>Cheng</span>
                </h2>
                <p>{personalInfo.title}</p>
              </div>

              <div className="about-local-time">
                <span>{personalInfo.location} / UTC+08</span>
                <time>{shanghaiTime}</time>
              </div>
            </header>

            <div className="about-boot-strip">
              <div>
                <span>Next boot</span>
                <strong>Deloitte</strong>
              </div>
              <div>
                <span>Role</span>
                <strong>Analyst 1</strong>
              </div>
              <div>
                <span>Window</span>
                <strong>{bootWindow}</strong>
              </div>
              <div className="about-boot-state">
                <span aria-hidden="true" /> QUEUED
              </div>
            </div>

            <div className="about-route">
              <div className="about-section-label">
                <span>Career bus / channel 01</span>
                <span>03 nodes</span>
              </div>
              <div className="about-route-track">
                {STATIONS.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    className={station === item.id ? "active" : ""}
                    aria-pressed={station === item.id}
                    onClick={() => setStation(item.id)}
                  >
                    <span className="about-route-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <strong>{item.label}</strong>
                    <small>{item.meta}</small>
                  </button>
                ))}
              </div>
              <div className="about-route-readout" aria-live="polite">
                <span>{selectedStation.phase}</span>
                <p>{selectedStation.detail}</p>
              </div>
            </div>

            <div className="about-processes">
              <div className="about-section-label">
                <span>Running processes</span>
                <span>{String(current.length).padStart(2, "0")} active</span>
              </div>
              <div className="about-process-head" aria-hidden="true">
                <span>PID</span>
                <span>Process</span>
                <span>State</span>
              </div>
              {current.map((experience, index) => (
                <div
                  className={
                    experience.company === "Deloitte"
                      ? "about-process-row queued"
                      : "about-process-row"
                  }
                  key={experience.id}
                >
                  <span>{String(index + 1).padStart(3, "0")}</span>
                  <span>
                    <strong>{experience.company.split("·")[0].trim()}</strong>
                    <small>{experience.title}</small>
                  </span>
                  <span className="about-process-state">
                    <span aria-hidden="true" />
                    {experience.company === "Deloitte" ? "queued" : "live"}
                  </span>
                </div>
              ))}
            </div>

            <p className="about-kernel-note">
              Reliable backends · applied ML · transformation delivery
            </p>
          </section>
        )}

        {tab === "experience" && (
          <div className="about-timeline">
            {experiences.map((e) => (
              <article key={e.id} className="about-exp-card">
                <div className="about-exp-rail">
                  <span className={e.current ? "about-exp-dot on" : "about-exp-dot"} />
                </div>
                <div className="about-exp-body">
                  <header>
                    <strong>{e.title}</strong>
                    <span className="about-exp-meta">
                      {e.company}
                      {e.current ? " · now" : e.endDate ? ` · ${e.endDate.slice(0, 4)}` : ""}
                    </span>
                  </header>
                  <ul>
                    {e.description.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
            {awards.length > 0 && (
              <div className="about-awards">
                <h3>Awards</h3>
                {awards.map((a) => (
                  <div key={a.id} className="about-award-chip">
                    <strong>{a.title}</strong>
                    <span>
                      {a.organization} · {a.year}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "skills" && (
          <div className="about-skills">
            {(
              [
                ["languages", "Languages"],
                ["ml", "ML & Data"],
                ["mobile", "Mobile & Reality"],
                ["tools", "Platforms"],
              ] as const
            ).map(([cat, title]) => (
              <section key={cat}>
                <h3>{title}</h3>
                <div className="about-skill-cloud">
                  {skills
                    .filter((s) => s.category === cat)
                    .map((s) => (
                      <span key={s.id} className="about-skill-pill">
                        {s.name}
                      </span>
                    ))}
                </div>
              </section>
            ))}
            <section>
              <h3>Languages</h3>
              <div className="about-skill-cloud">
                {languages.map((l) => (
                  <span key={l.id} className="about-skill-pill soft">
                    {l.name} · {l.level}
                  </span>
                ))}
              </div>
            </section>
          </div>
        )}

        {tab === "contact" && (
          <div className="about-contact">
            <a className="about-contact-btn primary" href={`mailto:${personalInfo.email}`}>
              <span className="about-contact-ico" aria-hidden="true">
                MAIL
              </span>
              <span>
                <strong>Email</strong>
                <small>{personalInfo.email}</small>
              </span>
            </a>
            {personalInfo.linkedin && (
              <a
                className="about-contact-btn"
                href={personalInfo.linkedin}
                target="_blank"
                rel="noreferrer"
              >
                <span className="about-contact-ico" aria-hidden="true">
                  LINK
                </span>
                <span>
                  <strong>LinkedIn</strong>
                  <small>zhongquan-cheng</small>
                </span>
              </a>
            )}
            {personalInfo.github && (
              <a
                className="about-contact-btn"
                href={personalInfo.github}
                target="_blank"
                rel="noreferrer"
              >
                <span className="about-contact-ico" aria-hidden="true">
                  GIT
                </span>
                <span>
                  <strong>GitHub</strong>
                  <small>petercheng123321</small>
                </span>
              </a>
            )}
            <a className="about-contact-btn" href={`tel:${personalInfo.phone.replace(/\s/g, "")}`}>
              <span className="about-contact-ico" aria-hidden="true">
                TEL
              </span>
              <span>
                <strong>Phone</strong>
                <small>{personalInfo.phone}</small>
              </span>
            </a>
            <a className="about-contact-btn" href="/resume.pdf" target="_blank" rel="noreferrer">
              <span className="about-contact-ico" aria-hidden="true">
                PDF
              </span>
              <span>
                <strong>Download résumé</strong>
                <small>PDF</small>
              </span>
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
