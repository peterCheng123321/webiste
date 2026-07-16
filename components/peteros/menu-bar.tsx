"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { SYSTEM_APPS, TOY_APPS, type AppId } from "./types"
import { AppIcon } from "./app-icon"
import type { IconAppearance } from "./context"
import { usePeterOS } from "./context"

export type MenuId =
  | "apple"
  | "app"
  | "file"
  | "edit"
  | "view"
  | "toys"
  | "appearance"
  | "go"
  | "help"

type Props = {
  appName: string
  activeApp: AppId | null
  appearance: IconAppearance
  setAppearance: (a: IconAppearance) => void
  openApp: (id: AppId | string) => void
  closeFocused: () => void
  minimizeFocused: () => void
  maximizeFocused: () => void
  closeAll: () => void
  mode: "embedded" | "fullscreen" | "page"
  onExpand?: () => void
  onCloseExpand?: () => void
  clock: string
}

function Item({
  children,
  onClick,
  kbd,
  disabled,
  checked,
}: {
  children: ReactNode
  onClick?: () => void
  kbd?: string
  disabled?: boolean
  checked?: boolean
}) {
  return (
    <button
      type="button"
      className={checked ? "pos-menu-row checked" : "pos-menu-row"}
      disabled={disabled}
      onClick={onClick}
    >
      <span className="pos-menu-row-label">
        {checked != null && (
          <span className="pos-menu-check" aria-hidden>
            {checked ? "✓" : ""}
          </span>
        )}
        {children}
      </span>
      {kbd && <span className="pos-menu-kbd">{kbd}</span>}
    </button>
  )
}

function Sep() {
  return <div className="pos-menu-sep" role="separator" />
}

export function MenuBar({
  appName,
  activeApp,
  appearance,
  setAppearance,
  openApp,
  closeFocused,
  minimizeFocused,
  maximizeFocused,
  closeAll,
  mode,
  onExpand,
  onCloseExpand,
  clock,
}: Props) {
  const { trashFull, emptyTrash, isAppOpen } = usePeterOS()
  const [open, setOpen] = useState<MenuId | null>(null)
  const barRef = useRef<HTMLElement>(null)

  const toggle = useCallback((id: MenuId) => {
    setOpen((cur) => (cur === id ? null : id))
  }, [])

  const closeMenus = useCallback(() => setOpen(null), [])

  // click outside
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!barRef.current?.contains(e.target as Node)) closeMenus()
    }
    window.addEventListener("pointerdown", onDown)
    return () => window.removeEventListener("pointerdown", onDown)
  }, [open, closeMenus])

  // esc
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenus()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, closeMenus])

  const run = (fn: () => void) => {
    fn()
    closeMenus()
  }

  /** Classic Mac: once a menu is open, hovering another title switches */
  const hoverOpen = (id: MenuId) => {
    if (open && open !== id) setOpen(id)
  }

  const titleBtn = (
    id: MenuId,
    label: ReactNode,
    extraClass = ""
  ) => (
    <button
      type="button"
      className={[
        id === "app" ? "pos-menu-app" : "pos-menu-item",
        open === id ? "active" : "",
        extraClass,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-haspopup="menu"
      aria-expanded={open === id}
      onPointerDown={(e) => {
        e.stopPropagation()
        e.preventDefault()
        toggle(id)
      }}
      onMouseEnter={() => hoverOpen(id)}
    >
      {label}
    </button>
  )

  return (
    <header className="pos-menubar" ref={barRef}>
      <div className="pos-menubar-left">
        {/*  */}
        <div className="pos-menu-wrap">
          {titleBtn("apple", "", "pos-apple")}
          {open === "apple" && (
            <div className="pos-menu-dropdown" role="menu" onPointerDown={(e) => e.stopPropagation()}>
              <Item onClick={() => run(() => openApp("about"))}>About This Mac</Item>
              <Sep />
              <Item onClick={() => run(() => openApp("finder"))}>System Preferences…</Item>
              <Item onClick={() => run(() => openApp("about"))}>About PeterOS</Item>
              <Sep />
              <div className="pos-menu-label">Icon appearance</div>
              {(["light", "dark", "clear"] as const).map((id) => (
                <Item
                  key={id}
                  checked={appearance === id}
                  onClick={() => run(() => setAppearance(id))}
                >
                  {id[0].toUpperCase() + id.slice(1)}
                </Item>
              ))}
              <Sep />
              <Item
                onClick={() => run(emptyTrash)}
                disabled={!trashFull}
                kbd="⇧⌘⌫"
              >
                Empty Trash…
              </Item>
              <Sep />
              {mode === "fullscreen" && onCloseExpand && (
                <Item onClick={() => run(onCloseExpand)} kbd="⎋">
                  Close PeterOS
                </Item>
              )}
              {mode === "embedded" && onExpand && (
                <Item onClick={() => run(onExpand)}>Enter Full Screen</Item>
              )}
              {mode === "page" && (
                <Item onClick={() => run(() => { window.location.href = "/" })}>
                  Quit to Site
                </Item>
              )}
            </div>
          )}
        </div>

        {/* App name — was a dead span */}
        <div className="pos-menu-wrap">
          {titleBtn("app", appName)}
          {open === "app" && (
            <div className="pos-menu-dropdown" role="menu" onPointerDown={(e) => e.stopPropagation()}>
              <Item onClick={() => run(() => openApp(activeApp ?? "about"))}>
                About {appName}
              </Item>
              <Sep />
              <Item onClick={() => run(minimizeFocused)} kbd="⌘M">
                Hide {appName}
              </Item>
              <Item onClick={() => run(closeFocused)} kbd="⌘W">
                Close Window
              </Item>
              <Item onClick={() => run(closeAll)}>Close All Windows</Item>
              <Sep />
              <Item
                onClick={() =>
                  run(() => {
                    if (mode === "fullscreen" && onCloseExpand) onCloseExpand()
                    else if (mode === "page") window.location.href = "/"
                  })
                }
                kbd="⌘Q"
              >
                Quit {appName}
              </Item>
            </div>
          )}
        </div>

        {/* File */}
        <div className="pos-menu-wrap">
          {titleBtn("file", "File")}
          {open === "file" && (
            <div className="pos-menu-dropdown" role="menu" onPointerDown={(e) => e.stopPropagation()}>
              <Item onClick={() => run(() => openApp("finder"))} kbd="⌘N">
                New Finder Window
              </Item>
              <Item onClick={() => run(() => openApp("terminal"))}>New Terminal</Item>
              <Sep />
              <Item onClick={() => run(() => openApp("resume"))}>Open Résumé…</Item>
              <Item onClick={() => run(() => openApp("projects"))}>Open Projects…</Item>
              <Sep />
              <Item onClick={() => run(closeFocused)} kbd="⌘W" disabled={!activeApp}>
                Close
              </Item>
              <Item
                onClick={() =>
                  run(() => {
                    window.open("/resume.pdf", "_blank")
                  })
                }
              >
                Download Résumé PDF
              </Item>
            </div>
          )}
        </div>

        {/* Edit */}
        <div className="pos-menu-wrap">
          {titleBtn("edit", "Edit")}
          {open === "edit" && (
            <div className="pos-menu-dropdown" role="menu" onPointerDown={(e) => e.stopPropagation()}>
              <Item
                onClick={() =>
                  run(() => {
                    document.execCommand("undo")
                  })
                }
                kbd="⌘Z"
              >
                Undo
              </Item>
              <Sep />
              <Item
                onClick={() =>
                  run(() => {
                    document.execCommand("cut")
                  })
                }
                kbd="⌘X"
              >
                Cut
              </Item>
              <Item
                onClick={() =>
                  run(() => {
                    document.execCommand("copy")
                  })
                }
                kbd="⌘C"
              >
                Copy
              </Item>
              <Item
                onClick={() =>
                  run(() => {
                    document.execCommand("paste")
                  })
                }
                kbd="⌘V"
              >
                Paste
              </Item>
              <Item
                onClick={() =>
                  run(() => {
                    document.execCommand("selectAll")
                  })
                }
                kbd="⌘A"
              >
                Select All
              </Item>
            </div>
          )}
        </div>

        {/* View */}
        <div className="pos-menu-wrap">
          {titleBtn("view", "View")}
          {open === "view" && (
            <div className="pos-menu-dropdown" role="menu" onPointerDown={(e) => e.stopPropagation()}>
              <Item onClick={() => run(() => openApp("finder"))}>as Icons</Item>
              <Item onClick={() => run(() => openApp("finder"))}>as List</Item>
              <Sep />
              <Item onClick={() => run(maximizeFocused)} disabled={!activeApp}>
                Enter Full Screen Window
              </Item>
              <Item onClick={() => run(minimizeFocused)} disabled={!activeApp}>
                Minimize
              </Item>
              <Sep />
              <Item onClick={() => run(() => openApp("projects"))}>Show Projects</Item>
              <Item onClick={() => run(() => openApp("about"))}>Show About</Item>
            </div>
          )}
        </div>

        {/* Toys */}
        <div className="pos-menu-wrap pos-menu-hide-sm">
          {titleBtn("toys", "Toys")}
          {open === "toys" && (
            <div className="pos-menu-dropdown" role="menu" onPointerDown={(e) => e.stopPropagation()}>
              {TOY_APPS.map((a) => (
                <Item key={a.id} onClick={() => run(() => openApp(a.id))}>
                  <AppIcon
                    id={a.id}
                    size={18}
                    appearance={appearance}
                    open={isAppOpen(a.id)}
                    className="pos-menu-app-icon"
                  />
                  {a.title}
                  {isAppOpen(a.id) ? "  · open" : ""}
                </Item>
              ))}
            </div>
          )}
        </div>

        {/* Appearance */}
        <div className="pos-menu-wrap pos-menu-hide-sm">
          {titleBtn("appearance", "Appearance")}
          {open === "appearance" && (
            <div
              className="pos-menu-dropdown pos-appearance-menu"
              role="menu"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div className="pos-appearance-swatches">
                {(["light", "dark", "clear"] as const).map((id) => (
                  <button
                    key={id}
                    type="button"
                    className={
                      appearance === id
                        ? `pos-appearance-card active ${id}`
                        : `pos-appearance-card ${id}`
                    }
                    onClick={() => run(() => setAppearance(id))}
                  >
                    <span className="pos-appearance-preview">
                      <AppIcon id="finder" size={36} appearance={id} />
                      <AppIcon id="scheduler" size={36} appearance={id} />
                    </span>
                    <span>{id[0].toUpperCase() + id.slice(1)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Go */}
        <div className="pos-menu-wrap pos-menu-hide-sm">
          {titleBtn("go", "Go")}
          {open === "go" && (
            <div className="pos-menu-dropdown" role="menu" onPointerDown={(e) => e.stopPropagation()}>
              <div className="pos-menu-label">Applications</div>
              {SYSTEM_APPS.map((a) => (
                <Item key={a.id} onClick={() => run(() => openApp(a.id))}>
                  <AppIcon
                    id={a.id}
                    size={18}
                    appearance={appearance}
                    open={isAppOpen(a.id)}
                    className="pos-menu-app-icon"
                  />
                  {a.title}
                  {isAppOpen(a.id) ? "  · open" : ""}
                </Item>
              ))}
              <Sep />
              <div className="pos-menu-label">Toys</div>
              {TOY_APPS.map((a) => (
                <Item key={a.id} onClick={() => run(() => openApp(a.id))}>
                  <AppIcon
                    id={a.id}
                    size={18}
                    appearance={appearance}
                    open={isAppOpen(a.id)}
                    className="pos-menu-app-icon"
                  />
                  {a.title}
                  {isAppOpen(a.id) ? "  · open" : ""}
                </Item>
              ))}
              <Sep />
              <Item
                onClick={() =>
                  run(() => {
                    window.location.href = "/"
                  })
                }
              >
                Back to Website
              </Item>
              <Item
                onClick={() =>
                  run(() => {
                    window.location.href = "/os"
                  })
                }
              >
                Full Desktop
              </Item>
            </div>
          )}
        </div>

        {/* Help */}
        <div className="pos-menu-wrap pos-menu-hide-sm">
          {titleBtn("help", "Help")}
          {open === "help" && (
            <div className="pos-menu-dropdown" role="menu" onPointerDown={(e) => e.stopPropagation()}>
              <Item onClick={() => run(() => openApp("about"))}>PeterOS Help</Item>
              <Item onClick={() => run(() => openApp("terminal"))}>
                Open Terminal (`help`)
              </Item>
              <Sep />
              <Item
                onClick={() =>
                  run(() => {
                    window.open("https://github.com/petercheng123321", "_blank")
                  })
                }
              >
                GitHub Profile
              </Item>
              <Item
                onClick={() =>
                  run(() => {
                    window.open("/resume.pdf", "_blank")
                  })
                }
              >
                View Résumé
              </Item>
              <Sep />
              <Item disabled>PeterOS v0.2 · vintage icons</Item>
            </div>
          )}
        </div>
      </div>

      <div className="pos-menubar-right">
        {mode === "fullscreen" && onCloseExpand && (
          <button type="button" className="pos-menu-item" onClick={onCloseExpand}>
            Done
          </button>
        )}
        {mode === "embedded" && onExpand && (
          <button type="button" className="pos-menu-item" onClick={onExpand}>
            ↗
          </button>
        )}
        <div className="pos-menu-wrap">
          <button
            type="button"
            className={open === "appearance" ? "pos-menu-item pos-appearance-chip active" : "pos-menu-item pos-appearance-chip"}
            title="Icon appearance"
            onPointerDown={(e) => {
              e.stopPropagation()
              toggle("appearance")
            }}
            onMouseEnter={() => hoverOpen("appearance")}
          >
            {appearance === "light" ? "◐" : appearance === "dark" ? "●" : "○"}
          </button>
        </div>
        <span className="pos-status-icons" aria-hidden>
          <span title="Wi‑Fi">◐</span>
          <span title="Battery">▣</span>
        </span>
        <span className="pos-clock">{clock}</span>
      </div>
    </header>
  )
}

