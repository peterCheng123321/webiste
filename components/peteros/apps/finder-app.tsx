"use client"

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react"
import { defaultData } from "@/lib/default-data"
import { AppIcon } from "../app-icon"
import {
  usePeterOS,
  type PeterOSTrashNode,
} from "../context"

type Item = Omit<PeterOSTrashNode, "children"> & {
  children?: Item[]
  deletedKey?: string
}

const TRASH_FOLDER: Item = {
  id: "trash",
  name: "Trash",
  kind: "folder",
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

type Props = {
  onOpenApp?: (app: string) => void
  openTrashToken?: number
  confirmTrashToken?: number
}

export function FinderApp({
  onOpenApp,
  openTrashToken = 0,
  confirmTrashToken = 0,
}: Props) {
  const {
    appearance,
    emptyTrash,
    isAppOpen,
    purgedTrashKeys,
    putInTrash,
    restoreTrashItem,
    trashItems: deletedItems,
  } = usePeterOS()
  const root = useMemo(() => buildTree(), [])
  const consumedTrashOpenToken = useRef(0)
  const consumedTrashConfirmToken = useRef(0)
  const finderRootRef = useRef<HTMLDivElement>(null)
  const emptySheetRef = useRef<HTMLDivElement>(null)
  const [path, setPath] = useState<Item[]>([root])
  const [selected, setSelected] = useState<Item | null>(null)
  const [view, setView] = useState<"icons" | "list">("icons")
  const [confirmEmpty, setConfirmEmpty] = useState(false)
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
          ) && !purgedTrashKeys.includes(`${current.id}:${item.id}`),
      )

  useEffect(() => {
    if (openTrashToken <= consumedTrashOpenToken.current) return
    consumedTrashOpenToken.current = openTrashToken
    setPath([root, TRASH_FOLDER])
    setSelected(null)
  }, [openTrashToken, root])

  useEffect(() => {
    if (confirmTrashToken <= consumedTrashConfirmToken.current) return
    consumedTrashConfirmToken.current = confirmTrashToken
    setPath([root, TRASH_FOLDER])
    setSelected(null)
    if (deletedItems.length > 0) setConfirmEmpty(true)
  }, [confirmTrashToken, deletedItems.length, root])

  useEffect(() => {
    if (deletedItems.length > 0) return
    setSelected((currentItem) => (currentItem?.deletedKey ? null : currentItem))
    setConfirmEmpty(false)
  }, [deletedItems.length])

  useEffect(() => {
    if (!confirmEmpty) return
    const previousFocus = document.activeElement as HTMLElement | null
    const frame = requestAnimationFrame(() => {
      emptySheetRef.current
        ?.querySelector<HTMLButtonElement>("button")
        ?.focus({ preventScroll: true })
    })
    return () => {
      cancelAnimationFrame(frame)
      requestAnimationFrame(() => {
        if (
          previousFocus?.isConnected &&
          !previousFocus.matches(":disabled")
        ) {
          previousFocus.focus({ preventScroll: true })
          return
        }
        finderRootRef.current
          ?.querySelector<HTMLButtonElement>("button:not(:disabled)")
          ?.focus({ preventScroll: true })
      })
    }
  }, [confirmEmpty])

  const onEmptySheetKeyDown = (
    event: ReactKeyboardEvent<HTMLDivElement>,
  ) => {
    if (event.key === "Escape") {
      event.preventDefault()
      event.stopPropagation()
      setConfirmEmpty(false)
      return
    }
    if (event.key !== "Tab") return
    const buttons = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>(
        "button:not(:disabled)",
      ),
    )
    if (!buttons.length) return
    const first = buttons[0]
    const last = buttons.at(-1) ?? first
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

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
    if (!deletedItems.some((deleted) => deleted.key === key)) {
      putInTrash({ key, item: selected, parentId: current.id })
    }
    setSelected(null)
  }

  const restoreSelected = () => {
    if (!isTrashView || !selected?.deletedKey) return

    restoreTrashItem(selected.deletedKey)
    setSelected(null)
  }

  const emptyFinderTrash = () => {
    setSelected(null)
    emptyTrash()
    setConfirmEmpty(false)
  }

  const canMoveSelectedToTrash =
    Boolean(selected) &&
    !isTrashView &&
    selected?.kind !== "app" &&
    selected?.id !== "apps"

  const onItemKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    item: Item,
  ) => {
    if (event.key === "Enter") {
      event.preventDefault()
      open(item)
      return
    }
    if (event.key === " ") {
      event.preventDefault()
      setSelected(item)
      return
    }

    const options = Array.from(
      event.currentTarget
        .closest('[role="listbox"]')
        ?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? [],
    )
    const currentIndex = options.indexOf(event.currentTarget)
    if (currentIndex < 0) return
    const columns =
      view === "icons"
        ? Math.max(
            1,
            Math.floor(
              (event.currentTarget.parentElement?.clientWidth ?? 90) / 90,
            ),
          )
        : 1
    let nextIndex = currentIndex
    if (event.key === "ArrowRight") nextIndex++
    else if (event.key === "ArrowLeft") nextIndex--
    else if (event.key === "ArrowDown") nextIndex += columns
    else if (event.key === "ArrowUp") nextIndex -= columns
    else if (event.key === "Home") nextIndex = 0
    else if (event.key === "End") nextIndex = options.length - 1
    else return

    event.preventDefault()
    nextIndex = Math.max(0, Math.min(options.length - 1, nextIndex))
    const next = items[nextIndex]
    if (next) setSelected(next)
    options[nextIndex]?.focus()
  }

  return (
    <div className="mac-app finder-app" ref={finderRootRef}>
      <div className="finder-toolbar">
        <button
          type="button"
          className="mac-btn"
          aria-label="Back to previous folder"
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
              aria-current={i === path.length - 1 ? "page" : undefined}
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
        <select
          className="finder-location"
          aria-label="Current Finder location"
          value={current.id}
          onChange={(event) => {
            if (event.target.value === root.id) {
              setPath([root])
              setSelected(null)
            } else {
              goFavorite(event.target.value)
            }
          }}
        >
          <option value={root.id}>Peter</option>
          {favorites.map((favorite) => (
            <option key={favorite.target} value={favorite.target}>
              {favorite.label}
            </option>
          ))}
        </select>
        <div className="finder-view-toggle">
          {isTrashView && (
            <button
              type="button"
              className="mac-btn"
              disabled={deletedItems.length === 0}
              onClick={() => setConfirmEmpty(true)}
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
            Scheduler
          </button>
        </aside>

        <div className="finder-main">
          {items.length === 0 ? (
            <p className="finder-preview-empty">
              {isTrashView ? "Trash is empty" : "This folder is empty"}
            </p>
          ) : view === "icons" ? (
            <div className="finder-icons" role="listbox" aria-label={current.name}>
              {items.map((item, index) => (
                <button
                  key={item.deletedKey ?? item.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected(item)}
                  tabIndex={isSelected(item) || (!selected && index === 0) ? 0 : -1}
                  className={
                    isSelected(item) ? "finder-icon-item active" : "finder-icon-item"
                  }
                  onClick={() => {
                    setSelected(item)
                    if (window.matchMedia("(pointer: coarse)").matches) {
                      open(item)
                    }
                  }}
                  onDoubleClick={() => open(item)}
                  onKeyDown={(event) => onItemKeyDown(event, item)}
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
            <ul className="finder-list-view" role="listbox" aria-label={current.name}>
              {items.map((item, index) => (
                <li key={item.deletedKey ?? item.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected(item)}
                    tabIndex={isSelected(item) || (!selected && index === 0) ? 0 : -1}
                    className={isSelected(item) ? "active" : ""}
                    onClick={() => {
                      setSelected(item)
                      if (window.matchMedia("(pointer: coarse)").matches) {
                        open(item)
                      }
                    }}
                    onDoubleClick={() => open(item)}
                    onKeyDown={(event) => onItemKeyDown(event, item)}
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
                  <span
                    className={`finder-file-glyph big${selected.name.endsWith(".pdf") ? " pdf" : ""}`}
                  >
                    {selected.name.endsWith(".pdf") ? "PDF" : "TXT"}
                  </span>
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

      <div className="finder-statusbar" role="status">
        <span>
          {items.length} {items.length === 1 ? "item" : "items"}
        </span>
        <span>{isTrashView ? "Trash" : view === "icons" ? "Icon view" : "List view"}</span>
      </div>

      {confirmEmpty && (
        <div className="finder-sheet-backdrop">
          <div
            ref={emptySheetRef}
            className="finder-sheet"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="finder-empty-title"
            aria-describedby="finder-empty-copy"
            onKeyDown={onEmptySheetKeyDown}
          >
            <AppIcon id="trash" size={50} appearance={appearance} open />
            <div>
              <strong id="finder-empty-title">Empty Trash?</strong>
              <p id="finder-empty-copy">
                These {deletedItems.length} {deletedItems.length === 1 ? "item" : "items"} can’t be restored afterward.
              </p>
              <div className="finder-sheet-actions">
                <button type="button" className="mac-btn" onClick={() => setConfirmEmpty(false)}>
                  Cancel
                </button>
                <button type="button" className="mac-btn danger" onClick={emptyFinderTrash}>
                  Empty Trash
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
