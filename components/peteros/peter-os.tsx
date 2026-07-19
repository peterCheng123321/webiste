"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react"
import {
  SYSTEM_APPS,
  TOY_APPS,
  appMeta,
  isAppId,
  type AppId,
  type WindowGeometry,
  type WindowState,
} from "./types"
import { WindowFrame } from "./window-frame"
import { AboutApp } from "./apps/about-app"
import { ProjectsApp } from "./apps/projects-app"
import { ResumeApp } from "./apps/resume-app"
import { FinderApp } from "./apps/finder-app"
import { TerminalApp } from "./apps/terminal-app"
import { SchedulerApp } from "./apps/scheduler-app"
import { AtsApp } from "./apps/ats-app"
import { SensorApp } from "./apps/sensor-app"
import { SegmentApp } from "./apps/segment-app"
import { PaintApp } from "./apps/paint-app"
import { AppIcon } from "./app-icon"
import { Dock } from "./dock"
import { MenuBar } from "./menu-bar"
import { PeterOSContext, type IconAppearance } from "./context"
import { AnimatePresence } from "motion/react"

type Mode = "embedded" | "fullscreen" | "page"

type Props = {
  mode?: Mode
  suspended?: boolean
  onExpand?: () => void
  onCloseExpand?: () => void
}

type DesktopMenuState = { x: number; y: number } | null

const APPEARANCE_KEY = "peteros-icon-appearance"
// The Dock owns core applications; the desktop is the workbench for labs.
// Keeping those roles distinct avoids presenting the same launcher twice.
const DESKTOP_APPS = TOY_APPS

function nextId() {
  return `w-${Math.random().toString(36).slice(2, 9)}`
}

function defaultPlacement(appId: AppId, index: number, bounds: { w: number; h: number }) {
  const meta = appMeta(appId)
  const verticalClearance = bounds.h <= 500 ? 150 : 110
  const width = Math.min(meta.defaultWidth, Math.max(240, bounds.w - 32))
  const height = Math.min(
    meta.defaultHeight,
    Math.max(180, bounds.h - verticalClearance),
  )
  const x = Math.min(48 + (index % 5) * 24, Math.max(16, bounds.w - width - 16))
  const y = 44 + (index % 5) * 20
  return { width, height, x, y }
}

function readAppearance(): IconAppearance {
  if (typeof window === "undefined") return "light"
  try {
    const v = localStorage.getItem(APPEARANCE_KEY)
    if (v === "light" || v === "dark" || v === "clear") return v
  } catch {
    /* ignore */
  }
  return "light"
}

export function PeterOS({
  mode = "embedded",
  suspended = false,
  onExpand,
  onCloseExpand,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const desktopRef = useRef<HTMLDivElement>(null)
  const contextMenuRef = useRef<HTMLDivElement>(null)
  const bootedRef = useRef(false)
  const [bounds, setBounds] = useState({ w: 0, h: 0 })
  const [windows, setWindows] = useState<WindowState[]>([])
  const [running, setRunning] = useState<Set<AppId>>(() => new Set())
  const [zTop, setZTop] = useState(10)
  const [clock, setClock] = useState("")
  const [appearance, setAppearanceState] = useState<IconAppearance>("light")
  const [trashFull, setTrashFull] = useState(false)
  const [selectedDesktopApp, setSelectedDesktopApp] = useState<AppId | null>(null)
  const [desktopMenu, setDesktopMenu] = useState<DesktopMenuState>(null)

  useEffect(() => {
    if (!desktopMenu) return
    requestAnimationFrame(() => {
      contextMenuRef.current?.querySelector<HTMLButtonElement>("button")?.focus()
    })
  }, [desktopMenu])

  useEffect(() => {
    setAppearanceState(readAppearance())
  }, [])

  const setAppearance = useCallback((a: IconAppearance) => {
    setAppearanceState(a)
    try {
      localStorage.setItem(APPEARANCE_KEY, a)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    if (suspended) return
    const el = desktopRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setBounds({ w: width, h: height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [suspended])

  useEffect(() => {
    if (suspended) return
    let timeout = 0

    const tick = () => {
      const d = new Date()
      setClock(
        d
          .toLocaleString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })
          .replaceAll(",", "")
      )
      timeout = window.setTimeout(tick, 60_050 - (Date.now() % 60_000))
    }

    tick()
    return () => window.clearTimeout(timeout)
  }, [suspended])

  useEffect(() => {
    if (bootedRef.current || bounds.w <= 0 || bounds.h <= 0) return

    bootedRef.current = true
    const place = defaultPlacement("about", 0, bounds)
    setWindows([
      {
        id: nextId(),
        appId: "about",
        title: "Peter // System Profiler",
        ...place,
        z: 10,
        minimized: false,
        maximized: false,
      },
    ])
    setRunning(new Set(["about"]))
  }, [bounds])

  useEffect(() => {
    if (bounds.w <= 0 || bounds.h <= 0) return

    setWindows((current) =>
      current.map((win) => {
        if (win.maximized) return win

        const width = Math.min(win.width, Math.max(240, bounds.w - 32))
        const verticalClearance = bounds.h <= 500 ? 150 : 110
        const height = Math.min(
          win.height,
          Math.max(180, bounds.h - verticalClearance),
        )
        const x = Math.min(
          Math.max(16, win.x),
          Math.max(16, bounds.w - width - 16),
        )
        const y = Math.min(Math.max(0, win.y), Math.max(0, bounds.h - height - 72))

        if (
          width === win.width &&
          height === win.height &&
          x === win.x &&
          y === win.y
        ) {
          return win
        }

        return { ...win, width, height, x, y }
      }),
    )
  }, [bounds.h, bounds.w])

  const focus = useCallback((id: string) => {
    setZTop((z) => {
      const next = z + 1
      setWindows((ws) => {
        return ws.map((w) =>
          w.id === id ? { ...w, z: next, minimized: false } : w
        )
      })
      return next
    })
  }, [])

  const openApp = useCallback((appId: AppId | string) => {
    if (!isAppId(appId)) return
    const id = appId

    setRunning((current) => {
      if (current.has(id)) return current
      const next = new Set(current)
      next.add(id)
      return next
    })

    setZTop((z) => {
      const nextZ = z + 1
      setWindows((ws) => {
        const existing = ws.find((w) => w.appId === id)
        if (existing) {
          return ws.map((w) =>
            w.id === existing.id ? { ...w, minimized: false, z: nextZ } : w
          )
        }
        const place = defaultPlacement(id, ws.length, {
          w:
            desktopRef.current?.clientWidth ??
            rootRef.current?.clientWidth ??
            800,
          h:
            desktopRef.current?.clientHeight ??
            rootRef.current?.clientHeight ??
            500,
        })
        return [
          ...ws,
          {
            id: nextId(),
            appId: id,
            title: id === "about" ? "Peter // System Profiler" : appMeta(id).title,
            ...place,
            z: nextZ,
            minimized: false,
            maximized: false,
          },
        ]
      })
      return nextZ
    })
  }, [])

  const onDesktopIconKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLButtonElement>, appId: AppId) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault()
        openApp(appId)
        return
      }

      const navigationKeys = [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "Home",
        "End",
      ]
      if (!navigationKeys.includes(event.key)) return

      const buttons = Array.from(
        event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
          ".pos-desktop-icon",
        ) ?? [],
      )
      if (!buttons.length) return

      let next: HTMLButtonElement | undefined
      if (event.key === "Home") next = buttons[0]
      else if (event.key === "End") next = buttons.at(-1)
      else {
        const currentRect = event.currentTarget.getBoundingClientRect()
        const currentX = currentRect.left + currentRect.width / 2
        const currentY = currentRect.top + currentRect.height / 2
        const horizontal = event.key === "ArrowLeft" || event.key === "ArrowRight"

        next = buttons
          .filter((button) => button !== event.currentTarget)
          .map((button) => {
            const rect = button.getBoundingClientRect()
            const dx = rect.left + rect.width / 2 - currentX
            const dy = rect.top + rect.height / 2 - currentY
            return {
              button,
              dx,
              dy,
              score: horizontal
                ? Math.abs(dx) + Math.abs(dy) * 3
                : Math.abs(dy) + Math.abs(dx) * 3,
            }
          })
          .filter(({ dx, dy }) => {
            if (event.key === "ArrowLeft") return dx < -4
            if (event.key === "ArrowRight") return dx > 4
            if (event.key === "ArrowUp") return dy < -4
            return dy > 4
          })
          .sort((a, b) => a.score - b.score)[0]?.button
      }

      if (!next) return
      event.preventDefault()
      next.focus()
      const nextApp = next.dataset.appId
      if (nextApp && isAppId(nextApp)) setSelectedDesktopApp(nextApp)
    },
    [openApp],
  )

  const putInTrash = useCallback(() => setTrashFull(true), [])
  const emptyTrash = useCallback(() => setTrashFull(false), [])

  const focusDockApp = useCallback((appId?: AppId) => {
    if (!appId) return
    requestAnimationFrame(() => {
      rootRef.current
        ?.querySelector<HTMLButtonElement>(`[data-dock-id="${appId}"]`)
        ?.focus({ preventScroll: true })
    })
  }, [])

  const close = useCallback((id: string) => {
    const appId = windows.find((window) => window.id === id)?.appId
    setWindows((ws) => ws.filter((w) => w.id !== id))
    focusDockApp(appId)
  }, [focusDockApp, windows])

  const quitApp = useCallback((appId: AppId) => {
    setWindows((ws) => ws.filter((window) => window.appId !== appId))
    setRunning((current) => {
      if (!current.has(appId)) return current
      const next = new Set(current)
      next.delete(appId)
      return next
    })
    focusDockApp(appId)
  }, [focusDockApp])

  const minimize = useCallback((id: string) => {
    const appId = windows.find((window) => window.id === id)?.appId
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, minimized: true } : w)))
    focusDockApp(appId)
  }, [focusDockApp, windows])

  const maximize = useCallback((id: string) => {
    setWindows((ws) =>
      ws.map((w) => (w.id === id ? { ...w, maximized: !w.maximized } : w))
    )
  }, [])

  const move = useCallback((id: string, x: number, y: number) => {
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, x, y } : w)))
  }, [])

  const resize = useCallback((id: string, geometry: WindowGeometry) => {
    setWindows((ws) =>
      ws.map((w) => (w.id === id ? { ...w, ...geometry } : w))
    )
  }, [])

  const focusedId = useMemo(() => {
    const top = [...windows]
      .filter((w) => !w.minimized)
      .sort((a, b) => b.z - a.z)[0]
    return top?.id ?? null
  }, [windows])

  const focusedAppId = useMemo(
    () => windows.find((window) => window.id === focusedId)?.appId ?? null,
    [focusedId, windows],
  )

  const closeFocused = useCallback(() => {
    if (focusedId) close(focusedId)
  }, [focusedId, close])

  const quitFocused = useCallback(() => {
    if (focusedAppId) quitApp(focusedAppId)
  }, [focusedAppId, quitApp])

  const minimizeFocused = useCallback(() => {
    if (focusedId) minimize(focusedId)
  }, [focusedId, minimize])

  const maximizeFocused = useCallback(() => {
    if (focusedId) maximize(focusedId)
  }, [focusedId, maximize])

  const closeAll = useCallback(() => {
    setWindows([])
  }, [])

  const renderApp = (appId: AppId) => {
    switch (appId) {
      case "about":
        return <AboutApp suspended={suspended} />
      case "projects":
        return <ProjectsApp onOpenApp={openApp} />
      case "resume":
        return <ResumeApp />
      case "finder":
        return <FinderApp onOpenApp={openApp} />
      case "terminal":
        return <TerminalApp onOpenApp={openApp} />
      case "scheduler":
        return <SchedulerApp />
      case "ats":
        return <AtsApp />
      case "sensor":
        return <SensorApp suspended={suspended} />
      case "segment":
        return <SegmentApp />
      case "paint":
        return <PaintApp />
    }
  }

  const shellClass = useMemo(() => {
    const base =
      mode === "page"
        ? "pos-shell pos-shell-page"
        : mode === "fullscreen"
          ? "pos-shell pos-shell-fullscreen"
          : "pos-shell pos-shell-embedded"
    return `${base} appearance-${appearance}`
  }, [mode, appearance])

  const appName = focusedAppId
    ? focusedAppId === "about"
      ? "PeterOS"
      : appMeta(focusedAppId).title
    : "Finder"

  const isAppOpen = useCallback(
    (id: string) => {
      if (!isAppId(id)) return false
      return running.has(id)
    },
    [running]
  )

  const ctx = useMemo(
    () => ({
      appearance,
      setAppearance,
      openApp,
      trashFull,
      emptyTrash,
      putInTrash,
      isAppOpen,
    }),
    [appearance, setAppearance, openApp, trashFull, emptyTrash, putInTrash, isAppOpen]
  )

  useEffect(() => {
    if (suspended) return

    const onShortcut = (event: KeyboardEvent) => {
      if (event.key === "Escape" && desktopMenu) {
        event.preventDefault()
        setDesktopMenu(null)
        return
      }
      if (event.key === "ContextMenu" || (event.shiftKey && event.key === "F10")) {
        event.preventDefault()
        setDesktopMenu({
          x: Math.max(8, Math.min(32, bounds.w - 218)),
          y: Math.max(8, Math.min(44, bounds.h - 252)),
        })
        return
      }
      if (!event.metaKey || event.ctrlKey || event.altKey) return

      const key = event.key.toLowerCase()
      if (key === "w" && focusedId) {
        event.preventDefault()
        closeFocused()
      } else if (key === "m" && focusedId) {
        event.preventDefault()
        minimizeFocused()
      } else if (key === "n") {
        event.preventDefault()
        openApp("finder")
      } else if (key === "q" && focusedId) {
        event.preventDefault()
        quitFocused()
      } else if (event.shiftKey && event.key === "Backspace" && trashFull) {
        event.preventDefault()
        emptyTrash()
      }
    }

    window.addEventListener("keydown", onShortcut, true)
    return () => window.removeEventListener("keydown", onShortcut, true)
  }, [
    closeFocused,
    bounds.h,
    bounds.w,
    desktopMenu,
    emptyTrash,
    focusedId,
    minimizeFocused,
    openApp,
    quitFocused,
    suspended,
    trashFull,
  ])

  return (
    <PeterOSContext.Provider value={ctx}>
      <div
        ref={rootRef}
        className={shellClass}
        data-mode={mode}
        data-appearance={appearance}
        data-suspended={suspended}
        onPointerDownCapture={(event) => {
          const target = event.target
          if (!(target instanceof Element)) return
          if (!target.closest(".pos-context-menu")) setDesktopMenu(null)
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <MenuBar
          appName={appName}
          activeApp={focusedAppId}
          appearance={appearance}
          openApp={openApp}
          closeFocused={closeFocused}
          quitFocused={quitFocused}
          minimizeFocused={minimizeFocused}
          maximizeFocused={maximizeFocused}
          closeAll={closeAll}
          mode={mode}
          onExpand={onExpand}
          onCloseExpand={onCloseExpand}
          clock={clock}
        />

        <div
          ref={desktopRef}
          className="pos-desktop"
          onPointerDown={(event) => {
            const target = event.target
            if (!(target instanceof Element)) return
            if (target.closest(".pos-desktop-icon, .pos-window")) return
            setSelectedDesktopApp(null)
          }}
          onContextMenu={(event) => {
            event.preventDefault()
            const target = event.target
            if (!(target instanceof Element)) return
            if (target.closest(".pos-window, .pos-desktop-icon, .pos-dock")) return
            const rect = event.currentTarget.getBoundingClientRect()
            const menuWidth = 210
            const menuHeight = 244
            setSelectedDesktopApp(null)
            setDesktopMenu({
              x: Math.max(8, Math.min(event.clientX - rect.left, rect.width - menuWidth - 8)),
              y: Math.max(8, Math.min(event.clientY - rect.top, rect.height - menuHeight - 8)),
            })
          }}
        >
          <div className="pos-wallpaper" aria-hidden />

          {desktopMenu && (
            <div
              ref={contextMenuRef}
              className="pos-context-menu"
              role="menu"
              aria-label="Desktop options"
              style={{ left: desktopMenu.x, top: desktopMenu.y }}
              onPointerDown={(event) => event.stopPropagation()}
              onKeyDown={(event) => {
                if (event.key === "Tab") {
                  setDesktopMenu(null)
                  return
                }
                if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
                  return
                }
                const items = Array.from(
                  event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"),
                )
                if (!items.length) return
                const current = items.indexOf(document.activeElement as HTMLButtonElement)
                let next = current
                if (event.key === "ArrowDown") next = (current + 1) % items.length
                else if (event.key === "ArrowUp") {
                  next = (current - 1 + items.length) % items.length
                } else if (event.key === "Home") next = 0
                else next = items.length - 1
                event.preventDefault()
                items[next]?.focus()
              }}
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  openApp("finder")
                  setDesktopMenu(null)
                }}
              >
                <span>New Finder Window</span>
                <kbd>⌘N</kbd>
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  openApp("terminal")
                  setDesktopMenu(null)
                }}
              >
                <span>Open Terminal</span>
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  openApp("about")
                  setDesktopMenu(null)
                }}
              >
                <span>About PeterOS</span>
              </button>
              <span className="pos-context-sep" role="separator" />
              <span className="pos-context-label">Desktop appearance</span>
              {(["light", "dark", "clear"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  role="menuitemradio"
                  aria-checked={appearance === option}
                  className="pos-context-choice"
                  onClick={() => {
                    setAppearance(option)
                    setDesktopMenu(null)
                  }}
                >
                  <span className="pos-context-check" aria-hidden="true">
                    {appearance === option ? "✓" : ""}
                  </span>
                  <span>{option[0].toUpperCase() + option.slice(1)}</span>
                </button>
              ))}
            </div>
          )}

          <div className="pos-desktop-icons pos-desktop-icons-right">
            {DESKTOP_APPS.map((app, index) => (
              <button
                key={app.id}
                type="button"
                className="pos-desktop-icon"
                data-app-id={app.id}
                data-selected={selectedDesktopApp === app.id}
                aria-label={app.title}
                aria-pressed={selectedDesktopApp === app.id}
                tabIndex={
                  selectedDesktopApp === app.id ||
                  (selectedDesktopApp == null && index === 0)
                    ? 0
                    : -1
                }
                onFocus={() => setSelectedDesktopApp(app.id)}
                onClick={() => {
                  setSelectedDesktopApp(app.id)
                  if (window.matchMedia("(pointer: coarse)").matches) {
                    openApp(app.id)
                  }
                }}
                onDoubleClick={() => openApp(app.id)}
                onKeyDown={(event) => onDesktopIconKeyDown(event, app.id)}
              >
                <span className="pos-desktop-icon-glyph" aria-hidden>
                  <AppIcon
                    id={app.id}
                    size={72}
                    appearance={appearance}
                    open={running.has(app.id)}
                  />
                </span>
                <span className="pos-desktop-icon-label">{app.title}</span>
              </button>
            ))}
          </div>

          <AnimatePresence>
            {windows
              .filter((win) => !win.minimized)
              .map((win) => (
                <WindowFrame
                  key={win.id}
                  win={win}
                  focused={win.id === focusedId}
                  onFocus={focus}
                  onClose={close}
                  onMinimize={minimize}
                  onMaximize={maximize}
                  onMove={move}
                  onResize={resize}
                  bounds={{ width: bounds.w, height: bounds.h }}
                >
                  {renderApp(win.appId)}
                </WindowFrame>
              ))}
          </AnimatePresence>
        </div>

        <Dock
          appearance={appearance}
          activeApp={focusedAppId}
          running={running}
          trashFull={trashFull}
          onEmptyTrash={emptyTrash}
          onOpen={(id) => {
            if (id === "trash") {
              // single click: open Finder at trash metaphor; empty via double-click
              openApp("finder")
            } else openApp(id)
          }}
        />
      </div>
    </PeterOSContext.Provider>
  )
}
