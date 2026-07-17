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

type Mode = "embedded" | "fullscreen" | "page"

type Props = {
  mode?: Mode
  onExpand?: () => void
  onCloseExpand?: () => void
}

const APPEARANCE_KEY = "peteros-icon-appearance"
const DESKTOP_APPS = [
  ...SYSTEM_APPS.filter((app) => app.id !== "about"),
  ...TOY_APPS.slice(0, 3),
]

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

export function PeterOS({ mode = "embedded", onExpand, onCloseExpand }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const bootedRef = useRef(false)
  const [bounds, setBounds] = useState({ w: 0, h: 0 })
  const [windows, setWindows] = useState<WindowState[]>([])
  const [zTop, setZTop] = useState(10)
  const [clock, setClock] = useState("")
  const [appearance, setAppearanceState] = useState<IconAppearance>("light")
  const [trashFull, setTrashFull] = useState(false)
  const [selectedDesktopApp, setSelectedDesktopApp] = useState<AppId | null>(null)

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
    const el = rootRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setBounds({ w: width, h: height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
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
          .replace(",", "")
      )
      timeout = window.setTimeout(tick, 60_050 - (Date.now() % 60_000))
    }

    tick()
    return () => window.clearTimeout(timeout)
  }, [])

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
        const y = Math.min(
          Math.max(32, win.y),
          Math.max(32, bounds.h - height - 72),
        )

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
          w: rootRef.current?.clientWidth ?? 800,
          h: rootRef.current?.clientHeight ?? 500,
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

  const close = useCallback((id: string) => {
    setWindows((ws) => {
      const next = ws.filter((w) => w.id !== id)
      return next
    })
    // Closing a window “throws it away” → full trash (classic Mac)
    setTrashFull(true)
  }, [])

  const minimize = useCallback((id: string) => {
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, minimized: true } : w)))
  }, [])

  const maximize = useCallback((id: string) => {
    setWindows((ws) =>
      ws.map((w) => (w.id === id ? { ...w, maximized: !w.maximized } : w))
    )
  }, [])

  const move = useCallback((id: string, x: number, y: number) => {
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, x, y } : w)))
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

  const minimizeFocused = useCallback(() => {
    if (focusedId) minimize(focusedId)
  }, [focusedId, minimize])

  const maximizeFocused = useCallback(() => {
    if (focusedId) maximize(focusedId)
  }, [focusedId, maximize])

  const closeAll = useCallback(() => {
    setWindows((ws) => {
      if (ws.length) setTrashFull(true)
      return []
    })
  }, [])

  const running = useMemo(() => {
    const s = new Set<AppId>()
    windows.forEach((w) => s.add(w.appId))
    return s
  }, [windows])

  const renderApp = (appId: AppId) => {
    switch (appId) {
      case "about":
        return <AboutApp />
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
        return <SensorApp />
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

  return (
    <PeterOSContext.Provider value={ctx}>
      <div
        ref={rootRef}
        className={shellClass}
        data-mode={mode}
        data-appearance={appearance}
        onContextMenu={(e) => e.preventDefault()}
      >
        <MenuBar
          appName={appName}
          activeApp={focusedAppId}
          appearance={appearance}
          openApp={openApp}
          closeFocused={closeFocused}
          minimizeFocused={minimizeFocused}
          maximizeFocused={maximizeFocused}
          closeAll={closeAll}
          mode={mode}
          onExpand={onExpand}
          onCloseExpand={onCloseExpand}
          clock={clock}
        />

        <div
          className="pos-desktop"
          onPointerDown={(event) => {
            const target = event.target
            if (!(target instanceof Element)) return
            if (target.closest(".pos-desktop-icon, .pos-window")) return
            setSelectedDesktopApp(null)
          }}
        >
          <div className="pos-wallpaper" aria-hidden />

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
                    size={56}
                    appearance={appearance}
                  />
                </span>
                <span className="pos-desktop-icon-label">{app.title}</span>
              </button>
            ))}
          </div>

          {windows.map((win) => (
            <WindowFrame
              key={win.id}
              win={win}
              focused={win.id === focusedId}
              onFocus={focus}
              onClose={close}
              onMinimize={minimize}
              onMaximize={maximize}
              onMove={move}
              bounds={{ width: bounds.w, height: bounds.h }}
            >
              {renderApp(win.appId)}
            </WindowFrame>
          ))}
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
