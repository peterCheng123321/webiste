"use client"

/**
 * PeterOS artwork. Every icon has an idle and an active state so the desktop
 * can communicate application state without layering on generic badges.
 */

import type { AppId } from "./types"
import type { IconAppearance } from "./context"

export type IconId = AppId | "trash" | "folder"

type Props = {
  id: IconId
  size?: number
  className?: string
  appearance?: IconAppearance
  /** Open folder, full Trash, or running application state. */
  open?: boolean
}

/**
 * Semantic pairs — closed → open
 * Chosen so the metaphor reads at dock size without a badge.
 */
const PAIR: Record<IconId, { closed: string; open: string; openMeans: string }> = {
  about: {
    closed: "/icons/peteros/about-closed.png",
    open: "/icons/peteros/about-open.png",
    openMeans: "profile open",
  },
  projects: {
    closed: "/icons/peteros/projects-closed.png",
    open: "/icons/peteros/projects-open.png",
    openMeans: "toolbox open",
  },
  resume: {
    closed: "/icons/peteros/resume-closed.png",
    open: "/icons/peteros/resume-open.png",
    openMeans: "document open",
  },
  finder: {
    closed: "/icons/peteros/finder-closed.png",
    open: "/icons/peteros/finder-open.png",
    openMeans: "folder window open",
  },
  terminal: {
    closed: "/icons/peteros/terminal-closed.png",
    open: "/icons/peteros/terminal-open.png",
    openMeans: "session active",
  },
  scheduler: {
    closed: "/icons/peteros/scheduler-closed.png",
    open: "/icons/peteros/scheduler-open.png",
    openMeans: "day sheet open",
  },
  ats: {
    closed: "/icons/peteros/ats-closed.png",
    open: "/icons/peteros/ats-open.png",
    openMeans: "mail open",
  },
  sensor: {
    closed: "/icons/peteros/sensor-closed.png",
    open: "/icons/peteros/sensor-open.png",
    openMeans: "network live",
  },
  segment: {
    closed: "/icons/peteros/segment-closed.png",
    open: "/icons/peteros/segment-open.png",
    openMeans: "gallery open",
  },
  paint: {
    closed: "/icons/peteros/paint-closed.png",
    open: "/icons/peteros/paint-open.png",
    openMeans: "drawing in progress",
  },
  trash: {
    closed: "/icons/peteros/trash-closed.png",
    open: "/icons/peteros/trash-open.png",
    openMeans: "trash full",
  },
  folder: {
    closed: "/icons/peteros/folder-closed.png",
    open: "/icons/peteros/folder-open.png",
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
  const shownOpen = open
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
