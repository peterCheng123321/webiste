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
  maximized: boolean
}

export type AppMeta = {
  id: AppId
  title: string
  icon: string
  defaultWidth: number
  defaultHeight: number
  kind: "system" | "toy"
}

export const APPS: AppMeta[] = [
  { id: "about", title: "About", icon: "👤", defaultWidth: 480, defaultHeight: 460, kind: "system" },
  { id: "projects", title: "Projects", icon: "🛠", defaultWidth: 620, defaultHeight: 440, kind: "system" },
  { id: "resume", title: "Resume", icon: "📄", defaultWidth: 680, defaultHeight: 500, kind: "system" },
  { id: "finder", title: "Finder", icon: "📁", defaultWidth: 640, defaultHeight: 420, kind: "system" },
  { id: "terminal", title: "Terminal", icon: "⬛", defaultWidth: 520, defaultHeight: 320, kind: "system" },
  {
    id: "scheduler",
    title: "Scheduler",
    icon: "📅",
    defaultWidth: 640,
    defaultHeight: 440,
    kind: "toy",
  },
  {
    id: "ats",
    title: "ATS Lab",
    icon: "📨",
    defaultWidth: 560,
    defaultHeight: 440,
    kind: "toy",
  },
  {
    id: "sensor",
    title: "IMU Lab",
    icon: "📡",
    defaultWidth: 520,
    defaultHeight: 400,
    kind: "toy",
  },
  {
    id: "segment",
    title: "Segment",
    icon: "🩺",
    defaultWidth: 560,
    defaultHeight: 420,
    kind: "toy",
  },
  {
    id: "paint",
    title: "Paint",
    icon: "🎨",
    defaultWidth: 560,
    defaultHeight: 400,
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
