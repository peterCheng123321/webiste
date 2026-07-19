"use client"

import {
  useMemo,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react"
import { defaultData, type Project } from "@/lib/default-data"
import { ProjectDiagram } from "@/components/project-diagram"

const TOY_FOR: Record<string, string> = {
  scheduler: "scheduler",
  ats: "ats",
  imu: "sensor",
  vr: "segment",
}

type Props = {
  onOpenApp?: (app: string) => void
}

export function ProjectsApp({ onOpenApp }: Props) {
  const projects = defaultData.projects
  const [activeId, setActiveId] = useState(projects[0]?.id ?? "")
  const [filter, setFilter] = useState<string>("all")

  const tags = useMemo(() => {
    const s = new Set<string>()
    projects.forEach((p) => p.tags.forEach((t) => s.add(t)))
    return ["all", ...Array.from(s).slice(0, 8)]
  }, [projects])

  const list = projects.filter(
    (p) => filter === "all" || p.tags.some((t) => t.toLowerCase() === filter.toLowerCase())
  )
  const active: Project | undefined =
    list.find((p) => p.id === activeId) ?? list[0] ?? projects[0]

  const onProjectKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    projectId: string,
  ) => {
    const options = Array.from(
      event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
        '[role="option"]',
      ) ?? [],
    )
    const current = options.indexOf(event.currentTarget)
    if (current < 0) return

    let next = current
    if (event.key === "ArrowDown") next = Math.min(options.length - 1, current + 1)
    else if (event.key === "ArrowUp") next = Math.max(0, current - 1)
    else if (event.key === "Home") next = 0
    else if (event.key === "End") next = options.length - 1
    else return

    event.preventDefault()
    const option = options[next]
    option?.focus()
    setActiveId(option?.dataset.projectId ?? projectId)
  }

  return (
    <div className="mac-app projects-app">
      <div className="mac-toolbar projects-filters">
        {tags.map((t) => (
          <button
            key={t}
            type="button"
            className={filter === t ? "mac-seg active" : "mac-seg"}
            aria-pressed={filter === t}
            onClick={() => setFilter(t)}
          >
            {t === "all" ? "All" : t}
          </button>
        ))}
      </div>

      <div className="projects-split">
        <div className="projects-list" role="listbox" aria-label="Projects">
          {list.map((p) => (
            <button
              key={p.id}
              type="button"
              role="option"
              aria-selected={active?.id === p.id}
              data-project-id={p.id}
              tabIndex={active?.id === p.id ? 0 : -1}
              className={active?.id === p.id ? "projects-row active" : "projects-row"}
              onClick={() => setActiveId(p.id)}
              onKeyDown={(event) => onProjectKeyDown(event, p.id)}
            >
              <div className="projects-thumb">
                {p.diagram ? (
                  <ProjectDiagram kind={p.diagram} />
                ) : (
                  <span className="projects-thumb-fallback">{p.title[0]}</span>
                )}
              </div>
              <div className="projects-row-text">
                <strong>{p.title}</strong>
                <span>
                  {p.year ?? "—"}
                  {p.subtitle ? ` · ${p.subtitle}` : ""}
                </span>
              </div>
            </button>
          ))}
        </div>

        {active && (
          <div className="projects-detail">
            <div className="projects-detail-visual">
              {active.diagram ? (
                <ProjectDiagram kind={active.diagram} />
              ) : (
                <div className="projects-detail-empty">No diagram</div>
              )}
            </div>
            <h2>{active.title}</h2>
            {active.subtitle && <p className="projects-detail-sub">{active.subtitle}</p>}
            <p className="projects-detail-desc">{active.description}</p>
            <div className="projects-tags">
              {active.tags.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
            <div className="projects-actions">
              {active.diagram && TOY_FOR[active.diagram] && onOpenApp && (
                <button
                  type="button"
                  className="mac-btn primary"
                  onClick={() => onOpenApp(TOY_FOR[active.diagram!])}
                >
                  Open related toy
                </button>
              )}
              {active.repoUrl && (
                <a className="mac-btn" href={active.repoUrl} target="_blank" rel="noreferrer">
                  Repo
                </a>
              )}
              {active.demoUrl && (
                <a className="mac-btn" href={active.demoUrl} target="_blank" rel="noreferrer">
                  Demo
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
