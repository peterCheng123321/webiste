"use client"

import { useMemo, useState } from "react"
import { defaultData } from "@/lib/default-data"
import { AppIcon } from "../app-icon"
import type { AppId } from "../types"
import { usePeterOS } from "../context"

type Item = {
  id: string
  name: string
  kind: "folder" | "file" | "app"
  appId?: AppId
  preview?: string
  children?: Item[]
}

function buildTree(): Item {
  return {
    id: "root",
    name: "Peter",
    kind: "folder",
    children: [
      {
        id: "apps",
        name: "Applications",
        kind: "folder",
        children: [
          { id: "a-about", name: "About.app", kind: "app", appId: "about" },
          { id: "a-projects", name: "Projects.app", kind: "app", appId: "projects" },
          { id: "a-resume", name: "Resume.app", kind: "app", appId: "resume" },
          { id: "a-term", name: "Terminal.app", kind: "app", appId: "terminal" },
          { id: "a-sched", name: "Scheduler.app", kind: "app", appId: "scheduler" },
          { id: "a-ats", name: "ATS Lab.app", kind: "app", appId: "ats" },
          { id: "a-sensor", name: "IMU Lab.app", kind: "app", appId: "sensor" },
          { id: "a-seg", name: "Segment.app", kind: "app", appId: "segment" },
          { id: "a-paint", name: "Paint.app", kind: "app", appId: "paint" },
        ],
      },
      {
        id: "about",
        name: "About",
        kind: "folder",
        children: [
          {
            id: "bio",
            name: "bio.txt",
            kind: "file",
            preview: defaultData.personalInfo.bio,
          },
          {
            id: "contact",
            name: "contact.vcf",
            kind: "file",
            preview: [
              defaultData.personalInfo.email,
              defaultData.personalInfo.phone,
              defaultData.personalInfo.github,
              defaultData.personalInfo.linkedin,
            ]
              .filter(Boolean)
              .join("\n"),
          },
        ],
      },
      {
        id: "work",
        name: "Experience",
        kind: "folder",
        children: defaultData.experiences.map((e) => ({
          id: e.id,
          name: `${e.company.split("·")[0].trim().replace(/\s+/g, "_")}.md`,
          kind: "file" as const,
          preview: `# ${e.title}\n@ ${e.company}\n\n${e.description.map((d) => `- ${d}`).join("\n")}`,
        })),
      },
      {
        id: "proj",
        name: "Projects",
        kind: "folder",
        children: defaultData.projects.map((p) => ({
          id: p.id,
          name: `${p.title.replace(/\s+/g, "_")}.md`,
          kind: "file" as const,
          preview: `# ${p.title}\n${p.subtitle ?? ""}\n\n${p.description}\n\n${p.tags.join(" · ")}`,
        })),
      },
      {
        id: "resume",
        name: "resume.pdf",
        kind: "file",
        preview: "PDF document — open Resume.app to view.",
      },
    ],
  }
}

type Props = { onOpenApp?: (app: string) => void }

export function FinderApp({ onOpenApp }: Props) {
  const { appearance } = usePeterOS()
  const root = useMemo(() => buildTree(), [])
  const [path, setPath] = useState<Item[]>([root])
  const [selected, setSelected] = useState<Item | null>(null)
  const [view, setView] = useState<"icons" | "list">("icons")
  const current = path[path.length - 1]
  const items = current.children ?? []

  const open = (item: Item) => {
    if (item.kind === "folder") {
      setPath((p) => [...p, item])
      setSelected(null)
      return
    }
    if (item.kind === "app" && item.appId && onOpenApp) {
      onOpenApp(item.appId)
      return
    }
    if (item.name === "resume.pdf" && onOpenApp) {
      onOpenApp("resume")
      return
    }
    setSelected(item)
  }

  const favorites = [
    { label: "Applications", target: "apps" },
    { label: "Experience", target: "work" },
    { label: "Projects", target: "proj" },
    { label: "About", target: "about" },
  ]

  const goFavorite = (id: string) => {
    const folder = root.children?.find((c) => c.id === id)
    if (folder) {
      setPath([root, folder])
      setSelected(null)
    }
  }

  return (
    <div className="mac-app finder-app">
      <div className="finder-toolbar">
        <button
          type="button"
          className="mac-btn"
          disabled={path.length <= 1}
          onClick={() => {
            setPath((p) => p.slice(0, -1))
            setSelected(null)
          }}
        >
          ←
        </button>
        <div className="finder-path">
          {path.map((n, i) => (
            <button
              key={n.id}
              type="button"
              className="finder-crumb"
              onClick={() => {
                setPath((p) => p.slice(0, i + 1))
                setSelected(null)
              }}
            >
              {n.name}
              {i < path.length - 1 ? " › " : ""}
            </button>
          ))}
        </div>
        <div className="finder-view-toggle">
          <button
            type="button"
            className={view === "icons" ? "mac-seg active" : "mac-seg"}
            onClick={() => setView("icons")}
          >
            Icons
          </button>
          <button
            type="button"
            className={view === "list" ? "mac-seg active" : "mac-seg"}
            onClick={() => setView("list")}
          >
            List
          </button>
        </div>
      </div>

      <div className="finder-body">
        <aside className="finder-sidebar">
          <p className="finder-side-label">Favorites</p>
          {favorites.map((f) => (
            <button key={f.target} type="button" onClick={() => goFavorite(f.target)}>
              {f.label}
            </button>
          ))}
          <p className="finder-side-label">Quick open</p>
          <button type="button" onClick={() => onOpenApp?.("terminal")}>
            Terminal
          </button>
          <button type="button" onClick={() => onOpenApp?.("scheduler")}>
            Toys
          </button>
        </aside>

        <div className="finder-main">
          {view === "icons" ? (
            <div className="finder-icons">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={
                    selected?.id === item.id ? "finder-icon-item active" : "finder-icon-item"
                  }
                  onClick={() => setSelected(item)}
                  onDoubleClick={() => open(item)}
                >
                  <span className="finder-icon-glyph">
                    {item.kind === "app" && item.appId ? (
                      <AppIcon
                        id={item.appId}
                        size={44}
                        appearance={appearance}
                      />
                    ) : item.kind === "folder" ? (
                      <AppIcon
                        id="folder"
                        size={44}
                        appearance={appearance}
                        /* closed on the desktop; open when selected (peering inside) */
                        open={selected?.id === item.id}
                      />
                    ) : item.name.endsWith(".pdf") ? (
                      <span className="finder-file-glyph pdf">PDF</span>
                    ) : (
                      <span className="finder-file-glyph">TXT</span>
                    )}
                  </span>
                  <span className="finder-icon-name">{item.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <ul className="finder-list-view">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={selected?.id === item.id ? "active" : ""}
                    onClick={() => setSelected(item)}
                    onDoubleClick={() => open(item)}
                  >
                    <span>
                      {item.kind === "folder" ? "Folder" : item.kind === "app" ? "App" : "File"}
                    </span>
                    <strong>{item.name}</strong>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="finder-preview">
          {selected ? (
            <>
              <div className="finder-preview-head">
                {selected.kind === "app" && selected.appId ? (
                  <AppIcon id={selected.appId} size={48} appearance={appearance} />
                ) : selected.kind === "folder" ? (
                  <AppIcon id="folder" size={48} appearance={appearance} open />
                ) : (
                  <span className="finder-file-glyph big">DOC</span>
                )}
                <div>
                  <strong>{selected.name}</strong>
                  <span className="finder-preview-kind">{selected.kind}</span>
                </div>
              </div>
              {selected.preview && (
                <pre className="finder-preview-body">{selected.preview}</pre>
              )}
              {(selected.kind === "app" || selected.name === "resume.pdf") && (
                <button type="button" className="mac-btn primary" onClick={() => open(selected)}>
                  Open
                </button>
              )}
              {selected.kind === "folder" && (
                <button type="button" className="mac-btn primary" onClick={() => open(selected)}>
                  Open folder
                </button>
              )}
            </>
          ) : (
            <p className="finder-preview-empty">Select an item · double-click to open</p>
          )}
        </aside>
      </div>
    </div>
  )
}
