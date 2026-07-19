"use client"

import { useEffect, useMemo, useState } from "react"
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
  deletedKey?: string
}

type DeletedItem = {
  key: string
  item: Item
  parentId: string
}

const TRASH_FOLDER: Item = {
  id: "trash",
  name: "Trash",
  kind: "folder",
}

let finderTrashItems: DeletedItem[] = []

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
          { id: "a-resume", name: "Résumé.app", kind: "app", appId: "resume" },
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
        preview: "PDF document — open Résumé.app to view.",
      },
    ],
  }
}

type Props = { onOpenApp?: (app: string) => void }

export function FinderApp({ onOpenApp }: Props) {
  const { appearance, emptyTrash, isAppOpen, putInTrash, trashFull } = usePeterOS()
  const root = useMemo(() => buildTree(), [])
  const [path, setPath] = useState<Item[]>([root])
  const [selected, setSelected] = useState<Item | null>(null)
  const [view, setView] = useState<"icons" | "list">("icons")
  const [deletedItems, setDeletedItems] = useState<DeletedItem[]>(() =>
    trashFull ? finderTrashItems : [],
  )
  const current = path[path.length - 1]
  const isTrashView = current.id === TRASH_FOLDER.id
  const trashItems = useMemo(
    () =>
      deletedItems.map(({ item, key }) => ({
        ...item,
        deletedKey: key,
      })),
    [deletedItems],
  )
  const items = isTrashView
    ? trashItems
    : (current.children ?? []).filter(
        (item) =>
          !deletedItems.some(
            (deleted) => deleted.parentId === current.id && deleted.item.id === item.id,
          ),
      )

  useEffect(() => {
    if (trashFull) return
    finderTrashItems = []
    setDeletedItems((currentItems) => (currentItems.length > 0 ? [] : currentItems))
    setSelected((currentItem) => (currentItem?.deletedKey ? null : currentItem))
  }, [trashFull])

  const isSelected = (item: Item) =>
    item.deletedKey
      ? selected?.deletedKey === item.deletedKey
      : selected?.id === item.id

  const open = (item: Item) => {
    if (isTrashView) {
      setSelected(item)
      return
    }
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
    { label: "Trash", target: "trash" },
  ]

  const goFavorite = (id: string) => {
    if (id === TRASH_FOLDER.id) {
      setPath([root, TRASH_FOLDER])
      setSelected(null)
      return
    }
    const folder = root.children?.find((c) => c.id === id)
    if (folder) {
      setPath([root, folder])
      setSelected(null)
    }
  }

  const moveSelectedToTrash = () => {
    if (
      !selected ||
      isTrashView ||
      selected.kind === "app" ||
      selected.id === "apps"
    ) {
      return
    }

    const key = `${current.id}:${selected.id}`
    const nextItems = deletedItems.some((deleted) => deleted.key === key)
      ? deletedItems
      : [...deletedItems, { key, item: selected, parentId: current.id }]
    finderTrashItems = nextItems
    setDeletedItems(nextItems)
    setSelected(null)
    putInTrash()
  }

  const restoreSelected = () => {
    if (!isTrashView || !selected?.deletedKey) return

    const remaining = deletedItems.filter(
      (deleted) => deleted.key !== selected.deletedKey,
    )
    finderTrashItems = remaining
    setDeletedItems(remaining)
    setSelected(null)
    if (remaining.length === 0) emptyTrash()
  }

  const emptyFinderTrash = () => {
    finderTrashItems = []
    setDeletedItems([])
    setSelected(null)
    emptyTrash()
  }

  const canMoveSelectedToTrash =
    Boolean(selected) &&
    !isTrashView &&
    selected?.kind !== "app" &&
    selected?.id !== "apps"

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
          {isTrashView && (
            <button
              type="button"
              className="mac-btn"
              disabled={!trashFull && deletedItems.length === 0}
              onClick={emptyFinderTrash}
            >
              Empty Trash
            </button>
          )}
          <button
            type="button"
            className={view === "icons" ? "mac-seg active" : "mac-seg"}
            aria-pressed={view === "icons"}
            onClick={() => setView("icons")}
          >
            Icons
          </button>
          <button
            type="button"
            className={view === "list" ? "mac-seg active" : "mac-seg"}
            aria-pressed={view === "list"}
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
            <button
              key={f.target}
              type="button"
              aria-current={current.id === f.target ? "page" : undefined}
              onClick={() => goFavorite(f.target)}
            >
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
          {items.length === 0 ? (
            <p className="finder-preview-empty">
              {isTrashView ? "Trash is empty" : "This folder is empty"}
            </p>
          ) : view === "icons" ? (
            <div className="finder-icons">
              {items.map((item) => (
                <button
                  key={item.deletedKey ?? item.id}
                  type="button"
                  className={
                    isSelected(item) ? "finder-icon-item active" : "finder-icon-item"
                  }
                  onClick={(event) => {
                    setSelected(item)
                    if (
                      event.detail === 0 ||
                      window.matchMedia("(pointer: coarse)").matches
                    ) {
                      open(item)
                    }
                  }}
                  onDoubleClick={() => open(item)}
                >
                  <span className="finder-icon-glyph">
                    {item.kind === "app" && item.appId ? (
                      <AppIcon
                        id={item.appId}
                        size={44}
                        appearance={appearance}
                        open={isAppOpen(item.appId)}
                      />
                    ) : item.kind === "folder" ? (
                      <AppIcon
                        id="folder"
                        size={44}
                        appearance={appearance}
                        /* closed on the desktop; open when selected (peering inside) */
                        open={isSelected(item)}
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
                <li key={item.deletedKey ?? item.id}>
                  <button
                    type="button"
                    className={isSelected(item) ? "active" : ""}
                    onClick={(event) => {
                      setSelected(item)
                      if (
                        event.detail === 0 ||
                        window.matchMedia("(pointer: coarse)").matches
                      ) {
                        open(item)
                      }
                    }}
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
                  <AppIcon
                    id={selected.appId}
                    size={48}
                    appearance={appearance}
                    open={isAppOpen(selected.appId)}
                  />
                ) : selected.kind === "folder" ? (
                  <AppIcon id="folder" size={48} appearance={appearance} open />
                ) : (
                  <span className="finder-file-glyph big">DOC</span>
                )}
                <div>
                  <strong>{selected.name}</strong>
                  <span className="finder-preview-kind">
                    {isTrashView ? `deleted ${selected.kind}` : selected.kind}
                  </span>
                </div>
              </div>
              {selected.preview && (
                <pre className="finder-preview-body">{selected.preview}</pre>
              )}
              {!isTrashView &&
                (selected.kind === "app" || selected.name === "resume.pdf") && (
                <button type="button" className="mac-btn primary" onClick={() => open(selected)}>
                  Open
                </button>
              )}
              {!isTrashView && selected.kind === "folder" && (
                <button type="button" className="mac-btn primary" onClick={() => open(selected)}>
                  Open folder
                </button>
              )}
              {isTrashView && selected.deletedKey && (
                <button type="button" className="mac-btn primary" onClick={restoreSelected}>
                  Restore
                </button>
              )}
              {canMoveSelectedToTrash && (
                <button type="button" className="mac-btn" onClick={moveSelectedToTrash}>
                  Move to Trash
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
