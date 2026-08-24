"use client"

import "@/app/peteros.css"
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react"
import dynamic from "next/dynamic"
import {
  TOY_APPS,
  appMeta,
  isAppId,
  type AppId,
} from "./types"
import { WindowFrame } from "./window-frame"
import { AboutApp } from "./apps/about-app"
import { AppIcon } from "./app-icon"
import { Dock } from "./dock"
import { MenuBar } from "./menu-bar"
import {
  PeterOSContext,
  type IconAppearance,
} from "./context"
import { AnimatePresence } from "motion/react"
import { track } from "@/lib/track"
import { bootPeterOS } from "@/lib/peteros/boot"
import { useKernelState, usePeterOSKernel } from "@/lib/peteros/hooks"
import { focusedWindowId } from "@/lib/peteros/kernel/create-kernel"
import { shouldTick } from "@/lib/peteros/kernel/scheduler"

function AppLoading() {
  return (
    <div className="mac-app pos-app-loading" role="status">
      <span>Opening application…</span>
    </div>
  )
}

const ProjectsApp = dynamic(
  () => import("./apps/projects-app").then((module) => module.ProjectsApp),
  { loading: AppLoading },
)
const ResumeApp = dynamic(
  () => import("./apps/resume-app").then((module) => module.ResumeApp),
  { loading: AppLoading },
)
const FinderApp = dynamic(
  () => import("./apps/finder-app").then((module) => module.FinderApp),
  { loading: AppLoading },
)
const TerminalApp = dynamic(
  () => import("./apps/terminal-app").then((module) => module.TerminalApp),
  { loading: AppLoading },
)
const SchedulerApp = dynamic(
  () => import("./apps/scheduler-app").then((module) => module.SchedulerApp),
  { loading: AppLoading },
)
const AtsApp = dynamic(
  () => import("./apps/ats-app").then((module) => module.AtsApp),
  { loading: AppLoading },
)
const SensorApp = dynamic(
  () => import("./apps/sensor-app").then((module) => module.SensorApp),
  { loading: AppLoading },
)
const SegmentApp = dynamic(
  () => import("./apps/segment-app").then((module) => module.SegmentApp),
  { loading: AppLoading },
)
const PaintApp = dynamic(
  () => import("./apps/paint-app").then((module) => module.PaintApp),
  { loading: AppLoading },
)

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

type AppContentProps = {
  appId: AppId
  focused: boolean
  hidden: boolean
  suspended: boolean
  finderTrashOpenToken: number
  finderTrashConfirmToken: number
  onOpenApp: (appId: AppId | string) => void
}

const AppContent = memo(function AppContent({
  appId,
  focused,
  hidden,
  suspended,
  finderTrashOpenToken,
  finderTrashConfirmToken,
  onOpenApp,
}: AppContentProps) {
  switch (appId) {
    case "about":
      return <AboutApp suspended={suspended || hidden} />
    case "projects":
      return <ProjectsApp onOpenApp={onOpenApp} />
    case "resume":
      return <ResumeApp />
    case "finder":
      return (
        <FinderApp
          onOpenApp={onOpenApp}
          openTrashToken={focused ? finderTrashOpenToken : 0}
          confirmTrashToken={focused ? finderTrashConfirmToken : 0}
        />
      )
    case "terminal":
      return <TerminalApp onOpenApp={onOpenApp} />
    case "scheduler":
      return <SchedulerApp />
    case "ats":
      return <AtsApp />
    case "sensor":
      return <SensorApp suspended={suspended || hidden} />
    case "segment":
      return <SegmentApp />
    case "paint":
      return <PaintApp />
  }
})

function PeterOSComponent({
  mode = "embedded",
  suspended = false,
  onExpand,
  onCloseExpand,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const desktopRef = useRef<HTMLDivElement>(null)
  const contextMenuRef = useRef<HTMLDivElement>(null)
  const kernel = usePeterOSKernel()
  const os = useKernelState(kernel)
  const [clock, setClock] = useState("")
  const [finderTrashOpenToken, setFinderTrashOpenToken] = useState(0)
  const [finderTrashConfirmToken, setFinderTrashConfirmToken] = useState(0)
  const [selectedDesktopApp, setSelectedDesktopApp] = useState<AppId | null>(null)
  const [desktopMenu, setDesktopMenu] = useState<DesktopMenuState>(null)
  const windows = os.windows
  const bounds = os.bounds
  const appearance = os.appearance
  const trashItems = os.trashItems
  const purgedTrashKeys = os.purgedTrashKeys
  const windowsRef = useRef(windows)
  const focusedIdRef = useRef<string | null>(null)
  windowsRef.current = windows

  useEffect(() => {
    if (!desktopMenu) return
    requestAnimationFrame(() => {
      contextMenuRef.current?.querySelector<HTMLButtonElement>("button")?.focus()
    })
  }, [desktopMenu])

  useEffect(() => {
    kernel.setAppearance(readAppearance())
  }, [kernel])

  const setAppearance = useCallback((a: IconAppearance) => {
    kernel.setAppearance(a)
    try {
      localStorage.setItem(APPEARANCE_KEY, a)
    } catch {
      /* ignore */
    }
  }, [kernel])

  useEffect(() => {
    if (suspended) return
    const el = desktopRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (!kernel.getState().booted) {
        bootPeterOS(kernel, { w: width, h: height })
      } else {
        kernel.setBounds({ w: width, h: height })
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [kernel, suspended])

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

  const focus = useCallback((id: string) => {
    kernel.focus(id)
  }, [kernel])

  const openApp = useCallback((appId: AppId | string) => {
    if (!isAppId(appId)) return
    track("peteros_app_open", { app: appId })
    kernel.open(appId)
  }, [kernel])

  const openNewApp = useCallback((appId: AppId | string) => {
    kernel.openNew(appId)
  }, [kernel])

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

  const putInTrash = useCallback(
    (entry: Parameters<typeof kernel.putInTrash>[0]) => {
      kernel.putInTrash(entry)
    },
    [kernel],
  )
  const restoreTrashItem = useCallback(
    (key: string) => {
      kernel.restoreTrashItem(key)
    },
    [kernel],
  )
  const emptyTrash = useCallback(() => {
    kernel.emptyTrash()
  }, [kernel])
  const trashFull = trashItems.length > 0

  const focusDockApp = useCallback((appId?: AppId) => {
    if (!appId) return
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const dock = rootRef.current?.querySelector<HTMLElement>(".pos-dock")
        const preferred = dock?.querySelector<HTMLButtonElement>(
          `[data-dock-id="${appId}"]`,
        )
        const fallback = dock?.querySelector<HTMLButtonElement>("[data-dock-item]")
        ;(preferred ?? fallback)?.focus({ preventScroll: true })
      })
    })
  }, [])

  const close = useCallback((id: string) => {
    const appId = windowsRef.current.find((window) => window.id === id)?.appId
    kernel.close(id)
    focusDockApp(appId)
  }, [focusDockApp, kernel])

  const quitApp = useCallback((appId: AppId) => {
    kernel.quit(appId)
    focusDockApp(appId)
  }, [focusDockApp, kernel])

  const minimize = useCallback((id: string) => {
    const appId = windowsRef.current.find((window) => window.id === id)?.appId
    kernel.minimize(id)
    focusDockApp(appId)
  }, [focusDockApp, kernel])

  const maximize = useCallback((id: string) => {
    kernel.maximize(id)
  }, [kernel])

  const move = useCallback((id: string, x: number, y: number) => {
    kernel.move(id, x, y)
  }, [kernel])

  const resize = useCallback((id: string, geometry: Parameters<typeof kernel.resize>[1]) => {
    kernel.resize(id, geometry)
  }, [kernel])

  const focusedId = focusedWindowId(windows)
  focusedIdRef.current = focusedId

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
    for (const window of kernel.getState().windows) {
      kernel.close(window.id)
    }
  }, [kernel])

  const openTrash = useCallback(() => {
    setFinderTrashOpenToken((token) => token + 1)
    openApp("finder")
  }, [openApp])

  const requestEmptyTrash = useCallback(() => {
    setFinderTrashOpenToken((token) => token + 1)
    setFinderTrashConfirmToken((token) => token + 1)
    openApp("finder")
  }, [openApp])

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

  const openAppsSignature = [...new Set(
    windows.filter((window) => !window.closed).map((window) => window.appId),
  )]
    .sort()
    .join("|")
  const openApps = useMemo(
    () => new Set<AppId>(openAppsSignature ? (openAppsSignature.split("|") as AppId[]) : []),
    [openAppsSignature],
  )
  const running = useMemo(() => new Set<AppId>(os.running), [os.running])
  const windowBounds = useMemo(
    () => ({ width: bounds.w, height: bounds.h }),
    [bounds.h, bounds.w],
  )

  const isAppOpen = useCallback(
    (id: string) => {
      if (!isAppId(id)) return false
      return openApps.has(id)
    },
    [openApps]
  )

  const ctx = useMemo(
    () => ({
      appearance,
      setAppearance,
      openApp,
      trashItems,
      purgedTrashKeys,
      trashFull,
      emptyTrash,
      putInTrash,
      restoreTrashItem,
      isAppOpen,
    }),
    [
      appearance,
      setAppearance,
      openApp,
      trashItems,
      purgedTrashKeys,
      trashFull,
      emptyTrash,
      putInTrash,
      restoreTrashItem,
      isAppOpen,
    ]
  )

  useEffect(() => {
    if (suspended) return

    const onShortcut = (event: KeyboardEvent) => {
      if (event.key === "Escape" && desktopMenu) {
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()
        setDesktopMenu(null)
        return
      }
      if (event.key === "ContextMenu" || (event.shiftKey && event.key === "F10")) {
        const target = event.target
        if (
          target instanceof Element &&
          target.closest(".pos-window, .pos-menubar, .pos-dock")
        ) {
          return
        }
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
        openNewApp("finder")
      } else if (key === "q" && focusedId) {
        event.preventDefault()
        quitFocused()
      } else if (event.shiftKey && event.key === "Backspace" && trashFull) {
        event.preventDefault()
        requestEmptyTrash()
      }
    }

    window.addEventListener("keydown", onShortcut, true)
    return () => window.removeEventListener("keydown", onShortcut, true)
  }, [
    closeFocused,
    bounds.h,
    bounds.w,
    desktopMenu,
    focusedId,
    minimizeFocused,
    openNewApp,
    quitFocused,
    requestEmptyTrash,
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
      >
        <MenuBar
          appName={appName}
          activeApp={focusedAppId}
          appearance={appearance}
          openApp={openApp}
          openNewApp={openNewApp}
          closeFocused={closeFocused}
          quitFocused={quitFocused}
          minimizeFocused={minimizeFocused}
          maximizeFocused={maximizeFocused}
          closeAll={closeAll}
          requestEmptyTrash={requestEmptyTrash}
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
                  openNewApp("finder")
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
                    open={openApps.has(app.id)}
                  />
                </span>
                <span className="pos-desktop-icon-label">{app.title}</span>
              </button>
            ))}
          </div>

          <AnimatePresence>
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
                  onResize={resize}
                  bounds={windowBounds}
                  hidden={win.minimized || win.closed}
                >
                  <AppContent
                    appId={win.appId}
                    focused={win.id === focusedId}
                    hidden={win.minimized || win.closed}
                    suspended={
                      suspended ||
                      win.minimized ||
                      win.closed ||
                      !shouldTick(kernel, win.appId)
                    }
                    finderTrashOpenToken={finderTrashOpenToken}
                    finderTrashConfirmToken={finderTrashConfirmToken}
                    onOpenApp={openApp}
                  />
                </WindowFrame>
              ))}
          </AnimatePresence>
        </div>

        <Dock
          appearance={appearance}
          activeApp={focusedAppId}
          running={running}
          openApps={openApps}
          trashFull={trashFull}
          onOpen={(id) => {
            if (id === "trash") {
              openTrash()
            } else openApp(id)
          }}
        />
      </div>
    </PeterOSContext.Provider>
  )
}

export const PeterOS = memo(PeterOSComponent)
