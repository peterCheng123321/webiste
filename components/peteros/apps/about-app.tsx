"use client"

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react"
import { defaultData } from "@/lib/default-data"
import {
  deloitteBootLabel,
  deloitteExperienceLead,
  deloittePhaseLabel,
  deloitteProcessState,
  deloitteRoleLine,
  deloitteStationDetail,
  deloitteStationMeta,
  deloitteStatusMeta,
  hasStartedAtDeloitte,
} from "@/lib/role"

type Tab = "overview" | "experience" | "skills" | "contact"
type StationId = "syracuse" | "washu" | "deloitte"

function buildStations(now: Date) {
  return [
    {
      id: "syracuse" as const,
      label: "Syracuse",
      meta: "B.S. CS · 2025",
      phase: "ARCHIVED / FOUNDATION",
      detail:
        "Systems, mobile engineering, and research foundations came online here.",
    },
    {
      id: "washu" as const,
      label: "WashU",
      meta: "M.S. CS · live",
      phase: "ACTIVE / RESEARCH",
      detail:
        "Applied ML, computer vision, and reliable data pipelines are running now.",
    },
    {
      id: "deloitte" as const,
      label: "Deloitte",
      meta: deloitteStationMeta(now),
      phase: deloittePhaseLabel(now),
      detail: deloitteStationDetail(now),
    },
  ]
}

const TAB_LABELS: Array<[Tab, string]> = [
  ["overview", "Identity"],
  ["experience", "Logbook"],
  ["skills", "Modules"],
  ["contact", "Ports"],
]

const SHANGHAI_TIME_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Shanghai",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
})

type Props = {
  suspended?: boolean
}

export function AboutApp({ suspended = false }: Props) {
  const { personalInfo, experiences, skills, awards, languages } = defaultData
  const [tab, setTab] = useState<Tab>("overview")
  const [station, setStation] = useState<StationId>("deloitte")
  const [now, setNow] = useState<Date | null>(null)
  const [tabOrientation, setTabOrientation] = useState<"vertical" | "horizontal">("vertical")
  const layoutRef = useRef<HTMLDivElement>(null)
  const clock = now ?? new Date()
  const started = hasStartedAtDeloitte(clock)
  const deloitte = experiences.find((e) => e.company === "Deloitte")
  const current = experiences.filter((e) => e.current)
  const deloitteQueued = current.some((e) => e.company === "Deloitte") && !started
  const queuedCount = deloitteQueued ? 1 : 0
  const liveCount = current.length - queuedCount
  const stations = useMemo(() => buildStations(clock), [clock])
  const selectedStation = useMemo(
    () => stations.find((item) => item.id === station) ?? stations[0],
    [station, stations],
  )

  useEffect(() => {
    if (suspended) return
    const tick = () => setNow(new Date())
    let interval = 0
    const start = () => {
      if (document.hidden) return
      tick()
      interval = window.setInterval(tick, 1000)
    }
    const onVisibilityChange = () => {
      window.clearInterval(interval)
      if (!document.hidden) start()
    }
    start()
    document.addEventListener("visibilitychange", onVisibilityChange)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [suspended])

  useEffect(() => {
    const layout = layoutRef.current
    if (!layout) return
    const update = () => {
      if (layout.clientWidth > 0) {
        setTabOrientation(layout.clientWidth <= 500 ? "horizontal" : "vertical")
      }
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(layout)
    return () => observer.disconnect()
  }, [])

  const shanghaiTime = now ? SHANGHAI_TIME_FORMATTER.format(now) : "--:--:--"
  const bootWindow =
    deloitte?.startDate.replace(/-/g, ".").slice(0, 7) ?? "2026.08"

  const onTabKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    currentTab: Tab,
  ) => {
    const tabs = TAB_LABELS.map(([id]) => id)
    const currentIndex = tabs.indexOf(currentTab)
    let nextIndex = currentIndex

    if (event.key === "ArrowRight" || event.key === "ArrowDown")
      nextIndex = (currentIndex + 1) % tabs.length
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
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
      <div className="about-layout" ref={layoutRef}>
        <aside className="about-toolbar">
          <div className="about-toolbar-brand">
            <span className="about-toolbar-monogram" aria-hidden="true">
              P
            </span>
            <span className="about-toolbar-mark">
              PETER<span>OS</span>
            </span>
          </div>
          <span className="about-toolbar-section">System profile</span>
          <div
            className="about-tabset"
            role="tablist"
            aria-label="System profile views"
            aria-orientation={tabOrientation}
          >
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
                <span className="about-tab-indicator" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
          <span className="about-toolbar-live">
            <span aria-hidden="true" /> SYSTEM LIVE
          </span>
        </aside>

        <div className="about-workspace">
          <div className="about-workspace-head" aria-hidden="true">
            <span>System Profiler</span>
            <span>Peter ID · build 26.7</span>
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
                      width={56}
                      height={56}
                      decoding="async"
                    />
                    <span className="about-avatar-signal" aria-hidden="true" />
                  </div>

                  <div className="about-identity">
                    <p className="about-kicker">PETEROS / IDENTITY NODE 01</p>
                    <h2>
                      Peter <span>Cheng</span>
                    </h2>
                    <p>{deloitteRoleLine(clock)}</p>
                  </div>

                  <div className="about-local-time">
                    <span>{personalInfo.location} / UTC+08</span>
                    <time>{shanghaiTime}</time>
                  </div>
                </header>

                <div className="about-boot-strip">
                  <div>
                    <span>{deloitteBootLabel(clock)}</span>
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
                    <span aria-hidden="true" />{" "}
                    {started ? "LIVE" : "QUEUED"}
                  </div>
                </div>

                <div className="about-route">
                  <div className="about-section-label">
                    <span>Career bus / channel 01</span>
                    <span>03 nodes</span>
                  </div>
                  <div className="about-route-track">
                    {stations.map((item, index) => (
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
                    <span>
                      {String(liveCount).padStart(2, "0")} live ·{" "}
                      {String(queuedCount).padStart(2, "0")} queued
                    </span>
                  </div>
                  <div className="about-process-head" aria-hidden="true">
                    <span>PID</span>
                    <span>Process</span>
                    <span>State</span>
                  </div>
                  {current.map((experience, index) => {
                    const state =
                      experience.company === "Deloitte"
                        ? deloitteProcessState(clock)
                        : "live"
                    return (
                    <div
                      className={
                        state === "queued"
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
                        {state}
                      </span>
                    </div>
                    )
                  })}
                </div>

                <p className="about-kernel-note">
                  Reliable backends · applied ML · transformation delivery
                </p>
              </section>
            )}

            {tab === "experience" && (
              <div className="about-timeline">
                {experiences.map((e) => {
                  const isDeloitte = e.company === "Deloitte"
                  const queued = isDeloitte && !started
                  const bullets =
                    isDeloitte
                      ? [
                          deloitteExperienceLead(clock),
                          ...e.description.slice(1),
                        ]
                      : e.description
                  return (
                  <article key={e.id} className="about-exp-card">
                    <div className="about-exp-rail">
                      <span
                        className={
                          queued
                            ? "about-exp-dot queued"
                            : e.current || (isDeloitte && started)
                              ? "about-exp-dot on"
                              : "about-exp-dot"
                        }
                      />
                    </div>
                    <div className="about-exp-body">
                      <header>
                        <strong>{e.title}</strong>
                        <span className="about-exp-meta">
                          {e.company}
                          {isDeloitte
                            ? deloitteStatusMeta(clock)
                            : e.current
                              ? " · now"
                              : e.endDate
                                ? ` · ${e.endDate.slice(0, 4)}`
                                : ""}
                        </span>
                      </header>
                      <ul>
                        {bullets.map((line, i) => (
                          <li key={i}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  </article>
                  )
                })}
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
                    ["languages", "Programming languages"],
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
                  <h3>Spoken languages</h3>
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
      </div>
    </div>
  )
}
