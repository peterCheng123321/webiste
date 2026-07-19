export type AppId =
  | "about"
  | "projects"
  | "resume"
  | "finder"
  | "terminal"
  | "scheduler"
  | "ats"
  | "sensor"
  | "paint"
  | "segment"

export type WindowState = {
  id: string
  appId: AppId
  title: string
  x: number
  y: number
  width: number
  height: number
  z: number
  minimized: boolean
  closed: boolean
  maximized: boolean
}

export type WindowGeometry = Pick<
  WindowState,
  "x" | "y" | "width" | "height"
>

export type WindowResizeDirection =
  | "n"
  | "s"
  | "e"
  | "w"
  | "ne"
  | "nw"
  | "se"
  | "sw"

export const MIN_WINDOW_WIDTH = 240
export const MIN_WINDOW_HEIGHT = 150

export type AppMeta = {
  id: AppId
  title: string
  defaultWidth: number
  defaultHeight: number
  minWidth: number
  minHeight: number
  kind: "system" | "toy"
}

export const APPS: AppMeta[] = [
  { id: "about", title: "About", defaultWidth: 720, defaultHeight: 540, minWidth: 520, minHeight: 380, kind: "system" },
  { id: "projects", title: "Projects", defaultWidth: 640, defaultHeight: 460, minWidth: 500, minHeight: 340, kind: "system" },
  { id: "resume", title: "Résumé", defaultWidth: 700, defaultHeight: 520, minWidth: 520, minHeight: 360, kind: "system" },
  { id: "finder", title: "Finder", defaultWidth: 680, defaultHeight: 450, minWidth: 520, minHeight: 330, kind: "system" },
  { id: "terminal", title: "Terminal", defaultWidth: 560, defaultHeight: 340, minWidth: 360, minHeight: 220, kind: "system" },
  {
    id: "scheduler",
    title: "Scheduler",
    defaultWidth: 640,
    defaultHeight: 500,
    minWidth: 560,
    minHeight: 390,
    kind: "toy",
  },
  {
    id: "ats",
    title: "ATS Lab",
    defaultWidth: 560,
    defaultHeight: 470,
    minWidth: 500,
    minHeight: 360,
    kind: "toy",
  },
  {
    id: "sensor",
    title: "IMU Lab",
    defaultWidth: 520,
    defaultHeight: 420,
    minWidth: 460,
    minHeight: 340,
    kind: "toy",
  },
  {
    id: "segment",
    title: "Segment",
    defaultWidth: 560,
    defaultHeight: 440,
    minWidth: 500,
    minHeight: 360,
    kind: "toy",
  },
  {
    id: "paint",
    title: "Paint",
    defaultWidth: 560,
    defaultHeight: 430,
    minWidth: 500,
    minHeight: 330,
    kind: "toy",
  },
]

export const APP_IDS = APPS.map((a) => a.id)

export function isAppId(id: string): id is AppId {
  return (APP_IDS as string[]).includes(id)
}

export function appMeta(id: AppId): AppMeta {
  return APPS.find((a) => a.id === id)!
}

export const SYSTEM_APPS = APPS.filter((a) => a.kind === "system")
export const TOY_APPS = APPS.filter((a) => a.kind === "toy")
