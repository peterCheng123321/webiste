"use client"

/**
 * Classic Mac OS 9 artwork. Application icons stay visually stable; only
 * semantic objects such as folders and Trash switch between closed/open art.
 *
 * Pack: bearz314/MacOS9-icons (MIT) → /public/icons/macos9/
 */

import type { AppId } from "./types"
import type { IconAppearance } from "./context"

export type IconId = AppId | "trash" | "folder"

type Props = {
  id: IconId
  size?: number
  className?: string
  appearance?: IconAppearance
  /** Semantic object state. Only folder and Trash use alternate artwork. */
  open?: boolean
}

/**
 * Semantic pairs — closed → open
 * Chosen so the metaphor reads at dock size without a badge.
 */
const PAIR: Record<IconId, { closed: string; open: string; openMeans: string }> = {
  about: {
    closed: "/icons/macos9/about-closed.png",
    open: "/icons/macos9/about-open.png",
    openMeans: "profile open",
  },
  projects: {
    closed: "/icons/macos9/projects-closed.png",
    open: "/icons/macos9/projects-open.png",
    openMeans: "toolbox open",
  },
  resume: {
    closed: "/icons/macos9/resume-closed.png",
    open: "/icons/macos9/resume-open.png",
    openMeans: "document open",
  },
  finder: {
    closed: "/icons/macos9/finder-closed.png",
    open: "/icons/macos9/finder-open.png",
    openMeans: "folder window open",
  },
  terminal: {
    closed: "/icons/macos9/terminal-closed.png",
    open: "/icons/macos9/terminal-open.png",
    openMeans: "session active",
  },
  scheduler: {
    closed: "/icons/macos9/scheduler-closed.png",
    open: "/icons/macos9/scheduler-open.png",
    openMeans: "day sheet open",
  },
  ats: {
    closed: "/icons/macos9/ats-closed.png",
    open: "/icons/macos9/ats-open.png",
    openMeans: "mail open",
  },
  sensor: {
    closed: "/icons/macos9/sensor-closed.png",
    open: "/icons/macos9/sensor-open.png",
    openMeans: "network live",
  },
  segment: {
    closed: "/icons/macos9/segment-closed.png",
    open: "/icons/macos9/segment-open.png",
    openMeans: "gallery open",
  },
  paint: {
    closed: "/icons/macos9/paint-closed.png",
    open: "/icons/macos9/paint-open.png",
    openMeans: "drawing in progress",
  },
  trash: {
    closed: "/icons/macos9/trash-closed.png",
    open: "/icons/macos9/trash-open.png",
    openMeans: "trash full",
  },
  folder: {
    closed: "/icons/macos9/folder-closed.png",
    open: "/icons/macos9/folder-open.png",
    openMeans: "folder open",
  },
}

export function AppIcon({
  id,
  size = 56,
  className,
  open = false,
}: Props) {
  const pair = PAIR[id]
  const isStatefulObject = id === "folder" || id === "trash"
  const shownOpen = isStatefulObject && open
  const src = shownOpen ? pair.open : pair.closed

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={["pos-app-icon", shownOpen ? "is-open" : "is-closed", className]
        .filter(Boolean)
        .join(" ")}
      data-icon={id}
      data-open={shownOpen ? "true" : "false"}
      draggable={false}
      style={{
        width: size,
        height: size,
        display: "block",
        objectFit: "contain",
        userSelect: "none",
        pointerEvents: "none",
      }}
    />
  )
}
