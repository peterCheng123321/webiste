"use client"

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react"
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
import { track } from "@/lib/track"

type Mode = "embedded" | "fullscreen" | "page"

type Props = {
  mode?: Mode
  onExpand?: () => void
  onCloseExpand?: () => void
}

const APPEARANCE_KEY = "peteros-icon-appearance"

function nextId() {
  return `w-${Math.random().toString(36).slice(2, 9)}`
}

function defaultPlacement(appId: AppId, index: number, bounds: { w: number; h: number }) {
  const meta = appMeta(appId)
  const width = Math.min(meta.defaultWidth, Math.max(280, bounds.w - 64))
  const height = Math.min(meta.defaultHeight, Math.max(220, bounds.h - 110))
  const x = Math.min(48 + (index % 5) * 24, Math.max(24, bounds.w - width - 100))
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
  const [bounds, setBounds] = useState({ w: 800, h: 500 })
  const [windows, setWindows] = useState<WindowState[]>([])
  const [zTop, setZTop] = useState(10)
  const [clock, setClock] = useState("")
  const [activeApp, setActiveApp] = useState<AppId | null>(null)
  const [appearance, setAppearanceState] = useState<IconAppearance>("light")
  const [trashFull, setTrashFull] = useState(false)
  const bootId = useId()

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
    }
    tick()
    const id = setInterval(tick, 15_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    setWindows((prev) => {
      if (prev.length) return prev
      const place = defaultPlacement("about", 0, bounds)
      return [
        {
          id: nextId(),
          appId: "about",
          title: "About This Mac…",
          ...place,
          z: 10,
          minimized: false,
          maximized: false,
        },
      ]
    })
    setActiveApp("about")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bootId])

  const focus = useCallback((id: string) => {
    setZTop((z) => {
      const next = z + 1
      setWindows((ws) => {
        const target = ws.find((w) => w.id === id)
        if (target) setActiveApp(target.appId)
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
    track("peteros_app_open", { app: id })

    setActiveApp(id)
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
            title: id === "about" ? "About This Mac…" : appMeta(id).title,
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

  const putInTrash = useCallback(() => setTrashFull(true), [])
  const emptyTrash = useCallback(() => setTrashFull(false), [])

  const close = useCallback((id: string) => {
    setWindows((ws) => {
      const next = ws.filter((w) => w.id !== id)
      const top = [...next].sort((a, b) => b.z - a.z)[0]
      setActiveApp(top?.appId ?? null)
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
    setActiveApp(null)
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

  const appName = activeApp
    ? activeApp === "about"
      ? "PeterOS"
      : appMeta(activeApp).title
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
          activeApp={activeApp}
          appearance={appearance}
          setAppearance={setAppearance}
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

        <div className="pos-desktop">
          <div className="pos-wallpaper" aria-hidden />

          <div className="pos-desktop-icons pos-desktop-icons-right">
            {[...SYSTEM_APPS.filter((a) => a.id !== "about"), ...TOY_APPS.slice(0, 3)].map(
              (app) => (
                <button
                  key={app.id}
                  type="button"
                  className="pos-desktop-icon"
                  onClick={() => openApp(app.id)}
                >
                  <span className="pos-desktop-icon-glyph" aria-hidden>
                    <AppIcon
                      id={app.id}
                      size={56}
                      appearance={appearance}
                      open={running.has(app.id)}
                    />
                  </span>
                  <span className="pos-desktop-icon-label">{app.title}</span>
                </button>
              )
            )}
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
