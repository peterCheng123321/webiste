"use client"

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react"
import { BatteryFull, Wifi } from "lucide-react"
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
  | "go"
  | "help"

const MENU_ORDER: MenuId[] = [
  "apple",
  "app",
  "file",
  "edit",
  "view",
  "toys",
  "go",
  "help",
]

type Props = {
  appName: string
  activeApp: AppId | null
  appearance: IconAppearance
  openApp: (id: AppId | string) => void
  openNewApp: (id: AppId | string) => void
  closeFocused: () => void
  quitFocused: () => void
  minimizeFocused: () => void
  maximizeFocused: () => void
  closeAll: () => void
  requestEmptyTrash: () => void
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
      role={checked == null ? "menuitem" : "menuitemradio"}
      aria-checked={checked == null ? undefined : checked}
      disabled={disabled}
      tabIndex={-1}
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
  openApp,
  openNewApp,
  closeFocused,
  quitFocused,
  minimizeFocused,
  maximizeFocused,
  closeAll,
  requestEmptyTrash,
  mode,
  onExpand,
  onCloseExpand,
  clock,
}: Props) {
  const { trashFull, isAppOpen } = usePeterOS()
  const [open, setOpen] = useState<MenuId | null>(null)
  const barRef = useRef<HTMLElement>(null)
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null)
  const menuBaseId = useId()

  const triggerDomId = useCallback(
    (id: MenuId) => `${menuBaseId}-${id}-trigger`,
    [menuBaseId],
  )
  const menuDomId = useCallback(
    (id: MenuId) => `${menuBaseId}-${id}-menu`,
    [menuBaseId],
  )

  const getMenuItems = useCallback(
    (id: MenuId) => {
      const menu = document.getElementById(menuDomId(id))
      if (!menu) return []
      return Array.from(
        menu.querySelectorAll<HTMLButtonElement>(
          '[role="menuitem"]:not(:disabled), [role="menuitemradio"]:not(:disabled)',
        ),
      )
    },
    [menuDomId],
  )

  const focusMenuEdge = useCallback(
    (id: MenuId, edge: "first" | "last") => {
      requestAnimationFrame(() => {
        const items = getMenuItems(id)
        const item = edge === "first" ? items[0] : items.at(-1)
        item?.focus()
      })
    },
    [getMenuItems],
  )

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

  // Escape closes only the active menu, before the surrounding PeterOS shell
  // can interpret the same key as a request to close the whole experience.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      e.preventDefault()
      e.stopPropagation()
      closeMenus()
      requestAnimationFrame(() => lastTriggerRef.current?.focus())
    }
    window.addEventListener("keydown", onKey, true)
    return () => window.removeEventListener("keydown", onKey, true)
  }, [open, closeMenus])

  const run = (fn: () => void) => {
    fn()
    closeMenus()
    requestAnimationFrame(() => lastTriggerRef.current?.focus())
  }

  const onMenuKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      const id = event.currentTarget.dataset.menuId as MenuId | undefined
      if (!id) return

      if (event.key === "Tab") {
        closeMenus()
        return
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault()
        const currentMenu = MENU_ORDER.indexOf(id)
        const direction = event.key === "ArrowRight" ? 1 : -1
        const nextId =
          MENU_ORDER[
            (currentMenu + direction + MENU_ORDER.length) % MENU_ORDER.length
          ]
        const nextTrigger = document.getElementById(
          triggerDomId(nextId),
        ) as HTMLButtonElement | null
        lastTriggerRef.current = nextTrigger
        setOpen(nextId)
        focusMenuEdge(nextId, "first")
        return
      }

      const items = getMenuItems(id)
      if (!items.length) return
      const current = items.indexOf(document.activeElement as HTMLButtonElement)
      let next = current

      if (event.key === "ArrowDown") next = (current + 1) % items.length
      else if (event.key === "ArrowUp")
        next = (current - 1 + items.length) % items.length
      else if (event.key === "Home") next = 0
      else if (event.key === "End") next = items.length - 1
      else return

      event.preventDefault()
      items[next]?.focus()
    },
    [closeMenus, focusMenuEdge, getMenuItems, triggerDomId],
  )

  const menuProps = useCallback(
    (id: MenuId) => ({
      id: menuDomId(id),
      role: "menu" as const,
      "aria-labelledby": triggerDomId(id),
      "data-menu-id": id,
      onKeyDown: onMenuKeyDown,
      onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) =>
        event.stopPropagation(),
    }),
    [menuDomId, onMenuKeyDown, triggerDomId],
  )

  /** Classic Mac: once a menu is open, hovering another title switches. */
  const hoverOpen = (id: MenuId, trigger: HTMLButtonElement) => {
    if (open && open !== id) {
      lastTriggerRef.current = trigger
      setOpen(id)
      focusMenuEdge(id, "first")
    }
  }

  const titleBtn = (
    id: MenuId,
    label: ReactNode,
    extraClass = ""
  ) => (
    <button
      type="button"
      id={triggerDomId(id)}
      className={[
        id === "app" ? "pos-menu-app" : "pos-menu-item",
        open === id ? "active" : "",
        extraClass,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-haspopup="menu"
      aria-expanded={open === id}
      aria-controls={menuDomId(id)}
      aria-label={id === "apple" ? "PeterOS menu" : undefined}
      onClick={(e) => {
        e.stopPropagation()
        lastTriggerRef.current = e.currentTarget
        const willOpen = open !== id
        toggle(id)
        if (willOpen) focusMenuEdge(id, "first")
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          lastTriggerRef.current = e.currentTarget
          const willOpen = open !== id
          toggle(id)
          if (willOpen) focusMenuEdge(id, "first")
          return
        }
        if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return
        e.preventDefault()
        lastTriggerRef.current = e.currentTarget
        setOpen(id)
        focusMenuEdge(id, e.key === "ArrowUp" ? "last" : "first")
      }}
      onMouseEnter={(e) => hoverOpen(id, e.currentTarget)}
    >
      {label}
    </button>
  )

  return (
    <header className="pos-menubar" ref={barRef}>
      <div className="pos-menubar-left">
        {/* PeterOS system menu */}
        <div className="pos-menu-wrap">
          {titleBtn(
            "apple",
            <AppIcon
              id="about"
              size={17}
              appearance={appearance}
              className="pos-system-mark"
              open={isAppOpen("about")}
            />,
            "pos-apple",
          )}
          {open === "apple" && (
            <div className="pos-menu-dropdown" {...menuProps("apple")}>
              <Item onClick={() => run(() => openApp("about"))}>About PeterOS</Item>
              <Sep />
              <Item onClick={() => run(() => openApp("finder"))}>Open Finder…</Item>
              <Sep />
              <Item
                onClick={() => run(requestEmptyTrash)}
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
            <div className="pos-menu-dropdown" {...menuProps("app")}>
              <Item onClick={() => run(() => openApp("about"))}>About PeterOS</Item>
              <Sep />
              <Item
                onClick={() => run(minimizeFocused)}
                kbd="⌘M"
                disabled={!activeApp}
              >
                Minimize {appName}
              </Item>
              <Item
                onClick={() => run(closeFocused)}
                kbd="⌘W"
                disabled={!activeApp}
              >
                Close Window
              </Item>
              <Item onClick={() => run(closeAll)}>Close All Windows</Item>
              <Sep />
              <Item
                onClick={() => run(quitFocused)}
                kbd="⌘Q"
                disabled={!activeApp}
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
            <div className="pos-menu-dropdown" {...menuProps("file")}>
              <Item onClick={() => run(() => openNewApp("finder"))} kbd="⌘N">
                New Finder Window
              </Item>
              <Item onClick={() => run(() => openApp("terminal"))}>Open Terminal</Item>
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
        <div className="pos-menu-wrap pos-menu-hide-xs">
          {titleBtn("edit", "Edit")}
          {open === "edit" && (
            <div className="pos-menu-dropdown" {...menuProps("edit")}>
              <Item
                onClick={() =>
                  run(() => {
                    if (activeApp === "paint") {
                      window.dispatchEvent(new Event("peteros:paint-undo"))
                    } else {
                      document.execCommand("undo")
                    }
                  })
                }
                kbd="⌘Z"
              >
                Undo
              </Item>
              {activeApp === "paint" && (
                <Item
                  onClick={() =>
                    run(() => {
                      window.dispatchEvent(new Event("peteros:paint-redo"))
                    })
                  }
                  kbd="⇧⌘Z"
                >
                  Redo
                </Item>
              )}
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
        <div className="pos-menu-wrap pos-menu-hide-xs">
          {titleBtn("view", "View")}
          {open === "view" && (
            <div className="pos-menu-dropdown" {...menuProps("view")}>
              <Item onClick={() => run(() => openApp("finder"))}>Show Finder</Item>
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
            <div className="pos-menu-dropdown" {...menuProps("toys")}>
              {TOY_APPS.map((a) => (
                <Item key={a.id} onClick={() => run(() => openApp(a.id))}>
                  <AppIcon
                    id={a.id}
                    size={18}
                    appearance={appearance}
                    className="pos-menu-app-icon"
                    open={isAppOpen(a.id)}
                  />
                  {a.title}
                  {isAppOpen(a.id) ? "  · open" : ""}
                </Item>
              ))}
            </div>
          )}
        </div>

        {/* Go */}
        <div className="pos-menu-wrap pos-menu-hide-sm">
          {titleBtn("go", "Go")}
          {open === "go" && (
            <div className="pos-menu-dropdown" {...menuProps("go")}>
              <div className="pos-menu-label" aria-hidden="true">
                Applications
              </div>
              {SYSTEM_APPS.map((a) => (
                <Item key={a.id} onClick={() => run(() => openApp(a.id))}>
                  <AppIcon
                    id={a.id}
                    size={18}
                    appearance={appearance}
                    className="pos-menu-app-icon"
                    open={isAppOpen(a.id)}
                  />
                  {a.title}
                  {isAppOpen(a.id) ? "  · open" : ""}
                </Item>
              ))}
              <Sep />
              <div className="pos-menu-label" aria-hidden="true">
                Toys
              </div>
              {TOY_APPS.map((a) => (
                <Item key={a.id} onClick={() => run(() => openApp(a.id))}>
                  <AppIcon
                    id={a.id}
                    size={18}
                    appearance={appearance}
                    className="pos-menu-app-icon"
                    open={isAppOpen(a.id)}
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
            <div className="pos-menu-dropdown" {...menuProps("help")}>
              <Item onClick={() => run(() => openApp("about"))}>PeterOS Help</Item>
              <Item onClick={() => run(() => openApp("terminal"))}>Open Terminal</Item>
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
              <Item disabled>PeterOS 1.0 · custom icon system</Item>
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
          <button
            type="button"
            className="pos-menu-item"
            aria-label="Enter full screen"
            onClick={onExpand}
          >
            ↗
          </button>
        )}
        <div className="pos-status-icons" role="group" aria-label="System status">
          <span className="pos-status-icon" title="Wi-Fi connected">
            <Wifi size={14} strokeWidth={1.8} aria-hidden />
            <span className="sr-only">Wi-Fi connected</span>
          </span>
          <span className="pos-status-icon" title="Battery available">
            <BatteryFull size={15} strokeWidth={1.8} aria-hidden />
            <span className="sr-only">Battery available</span>
          </span>
        </div>
        <time className="pos-clock">{clock}</time>
      </div>
    </header>
  )
}
