import {
  appMeta,
  isAppId,
  type AppId,
  type WindowGeometry,
  type WindowState,
} from "@/components/peteros/types"
import type {
  IconAppearance,
  PeterOSTrashEntry,
} from "@/components/peteros/context"

export type KernelBounds = { w: number; h: number }

export type KernelState = {
  windows: WindowState[]
  running: AppId[]
  zTop: number
  appearance: IconAppearance
  trashItems: PeterOSTrashEntry[]
  purgedTrashKeys: string[]
  bounds: KernelBounds
  booted: boolean
  degraded: AppId[]
}

export type KernelListener = () => void

export type CreateKernelOptions = {
  id?: () => string
}

function nextIdDefault() {
  return `w-${Math.random().toString(36).slice(2, 9)}`
}

function windowTitle(appId: AppId) {
  return appId === "about" ? "Peter // System Profiler" : appMeta(appId).title
}

export function defaultPlacement(
  appId: AppId,
  index: number,
  bounds: KernelBounds,
) {
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

function clampWindows(windows: WindowState[], bounds: KernelBounds) {
  if (bounds.w <= 0 || bounds.h <= 0) return windows
  return windows.map((win) => {
    const meta = appMeta(win.appId)
    const availableWidth = Math.max(240, bounds.w - 32)
    const availableHeight = Math.max(
      180,
      bounds.h - (bounds.h <= 500 ? 150 : 110),
    )
    const width = Math.min(
      Math.max(win.width, Math.min(meta.minWidth, availableWidth)),
      availableWidth,
    )
    const verticalClearance = bounds.h <= 500 ? 150 : 110
    const height = Math.min(
      Math.max(win.height, Math.min(meta.minHeight, availableHeight)),
      Math.max(180, bounds.h - verticalClearance),
    )
    const x = Math.min(Math.max(16, win.x), Math.max(16, bounds.w - width - 16))
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
  })
}

function addRunning(running: AppId[], id: AppId) {
  return running.includes(id) ? running : [...running, id]
}

export function focusedWindowId(windows: WindowState[]) {
  const top = [...windows]
    .filter((w) => !w.minimized && !w.closed)
    .sort((a, b) => b.z - a.z)[0]
  return top?.id ?? null
}

export function createKernel(options: CreateKernelOptions = {}) {
  const makeId = options.id ?? nextIdDefault
  let state: KernelState = {
    windows: [],
    running: [],
    zTop: 10,
    appearance: "light",
    trashItems: [],
    purgedTrashKeys: [],
    bounds: { w: 0, h: 0 },
    booted: false,
    degraded: [],
  }
  const listeners = new Set<KernelListener>()

  function emit() {
    for (const listener of listeners) listener()
  }

  function setState(next: KernelState) {
    state = next
    emit()
  }

  const api = {
    subscribe(listener: KernelListener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    getState(): KernelState {
      return state
    },
    init(bounds: KernelBounds) {
      if (state.booted) {
        if (bounds.w !== state.bounds.w || bounds.h !== state.bounds.h) {
          api.setBounds(bounds)
        }
        return
      }
      if (bounds.w <= 0 || bounds.h <= 0) return
      const place = defaultPlacement("about", 0, bounds)
      setState({
        ...state,
        bounds,
        booted: true,
        zTop: 10,
        running: ["about"],
        windows: [
          {
            id: makeId(),
            appId: "about",
            title: windowTitle("about"),
            ...place,
            z: 10,
            minimized: false,
            closed: false,
            maximized: false,
          },
        ],
      })
    },
    setBounds(bounds: KernelBounds) {
      if (bounds.w === state.bounds.w && bounds.h === state.bounds.h) return
      setState({
        ...state,
        bounds,
        windows: clampWindows(state.windows, bounds),
      })
    },
    open(appId: string) {
      if (!isAppId(appId)) return
      const existing = [...state.windows]
        .filter((w) => w.appId === appId)
        .sort((a, b) => {
          const aVisible = !a.minimized && !a.closed ? 1 : 0
          const bVisible = !b.minimized && !b.closed ? 1 : 0
          if (aVisible !== bVisible) return bVisible - aVisible
          return b.z - a.z
        })[0]
      const nextZ = state.zTop + 1
      if (existing) {
        setState({
          ...state,
          zTop: nextZ,
          running: addRunning(state.running, appId),
          windows: state.windows.map((w) =>
            w.id === existing.id
              ? { ...w, minimized: false, closed: false, z: nextZ }
              : w,
          ),
        })
        return
      }
      const place = defaultPlacement(appId, state.windows.length, state.bounds)
      setState({
        ...state,
        zTop: nextZ,
        running: addRunning(state.running, appId),
        windows: [
          ...state.windows,
          {
            id: makeId(),
            appId,
            title: windowTitle(appId),
            ...place,
            z: nextZ,
            minimized: false,
            closed: false,
            maximized: false,
          },
        ],
      })
    },
    openNew(appId: string) {
      if (!isAppId(appId)) return
      const nextZ = state.zTop + 1
      const place = defaultPlacement(appId, state.windows.length, state.bounds)
      const retained =
        appId === "finder"
          ? state.windows.filter((window) => !(window.appId === "finder" && window.closed))
          : state.windows
      setState({
        ...state,
        zTop: nextZ,
        running: addRunning(state.running, appId),
        windows: [
          ...retained,
          {
            id: makeId(),
            appId,
            title: windowTitle(appId),
            ...place,
            z: nextZ,
            minimized: false,
            closed: false,
            maximized: false,
          },
        ],
      })
    },
    quit(appId: string) {
      if (!isAppId(appId)) return
      if (!state.running.includes(appId) && !state.windows.some((w) => w.appId === appId)) {
        return
      }
      setState({
        ...state,
        running: state.running.filter((id) => id !== appId),
        windows: state.windows.filter((window) => window.appId !== appId),
      })
    },
    focus(id: string) {
      const win = state.windows.find((w) => w.id === id)
      if (!win) return
      const current = focusedWindowId(state.windows)
      if (current === id && !win.minimized && !win.closed) return
      const nextZ = state.zTop + 1
      setState({
        ...state,
        zTop: nextZ,
        windows: state.windows.map((w) =>
          w.id === id ? { ...w, z: nextZ, minimized: false, closed: false } : w,
        ),
      })
    },
    close(id: string) {
      if (!state.windows.some((w) => w.id === id)) return
      setState({
        ...state,
        windows: state.windows.map((window) =>
          window.id === id
            ? { ...window, minimized: false, closed: true }
            : window,
        ),
      })
    },
    minimize(id: string) {
      if (!state.windows.some((w) => w.id === id)) return
      setState({
        ...state,
        windows: state.windows.map((w) =>
          w.id === id ? { ...w, minimized: true, closed: false } : w,
        ),
      })
    },
    maximize(id: string) {
      if (!state.windows.some((w) => w.id === id)) return
      setState({
        ...state,
        windows: state.windows.map((w) =>
          w.id === id ? { ...w, maximized: !w.maximized } : w,
        ),
      })
    },
    move(id: string, x: number, y: number) {
      const win = state.windows.find((w) => w.id === id)
      if (!win) return
      const nx = Math.min(
        Math.max(16, x),
        Math.max(16, state.bounds.w - win.width - 16),
      )
      const ny = Math.min(
        Math.max(0, y),
        Math.max(0, state.bounds.h - win.height - 72),
      )
      if (nx === win.x && ny === win.y) return
      setState({
        ...state,
        windows: state.windows.map((w) =>
          w.id === id ? { ...w, x: nx, y: ny } : w,
        ),
      })
    },
    resize(id: string, geometry: WindowGeometry) {
      if (!state.windows.some((w) => w.id === id)) return
      setState({
        ...state,
        windows: clampWindows(
          state.windows.map((w) => (w.id === id ? { ...w, ...geometry } : w)),
          state.bounds,
        ),
      })
    },
    setAppearance(appearance: IconAppearance) {
      if (state.appearance === appearance) return
      setState({ ...state, appearance })
    },
    putInTrash(entry: PeterOSTrashEntry) {
      if (state.trashItems.some((item) => item.key === entry.key)) return
      setState({ ...state, trashItems: [...state.trashItems, entry] })
    },
    restoreTrashItem(key: string) {
      setState({
        ...state,
        trashItems: state.trashItems.filter((item) => item.key !== key),
      })
    },
    emptyTrash() {
      const keys = state.trashItems.map((item) => item.key)
      setState({
        ...state,
        purgedTrashKeys: [...new Set([...state.purgedTrashKeys, ...keys])],
        trashItems: [],
      })
    },
    markDegraded(appId: AppId) {
      if (state.degraded.includes(appId)) return
      setState({ ...state, degraded: [...state.degraded, appId] })
    },
  }

  return api
}

export type PeterOSKernel = ReturnType<typeof createKernel>
