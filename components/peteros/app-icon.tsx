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
    closed: "/icons/peteros/about-closed.webp",
    open: "/icons/peteros/about-open.webp",
    openMeans: "profile open",
  },
  projects: {
    closed: "/icons/peteros/projects-closed.webp",
    open: "/icons/peteros/projects-open.webp",
    openMeans: "toolbox open",
  },
  resume: {
    closed: "/icons/peteros/resume-closed.webp",
    open: "/icons/peteros/resume-open.webp",
    openMeans: "document open",
  },
  finder: {
    closed: "/icons/peteros/finder-closed.webp",
    open: "/icons/peteros/finder-open.webp",
    openMeans: "folder window open",
  },
  terminal: {
    closed: "/icons/peteros/terminal-closed.webp",
    open: "/icons/peteros/terminal-open.webp",
    openMeans: "session active",
  },
  scheduler: {
    closed: "/icons/peteros/scheduler-closed.webp",
    open: "/icons/peteros/scheduler-open.webp",
    openMeans: "day sheet open",
  },
  ats: {
    closed: "/icons/peteros/ats-closed.webp",
    open: "/icons/peteros/ats-open.webp",
    openMeans: "mail open",
  },
  sensor: {
    closed: "/icons/peteros/sensor-closed.webp",
    open: "/icons/peteros/sensor-open.webp",
    openMeans: "network live",
  },
  segment: {
    closed: "/icons/peteros/segment-closed.webp",
    open: "/icons/peteros/segment-open.webp",
    openMeans: "gallery open",
  },
  paint: {
    closed: "/icons/peteros/paint-closed.webp",
    open: "/icons/peteros/paint-open.webp",
    openMeans: "drawing in progress",
  },
  trash: {
    closed: "/icons/peteros/trash-closed.webp",
    open: "/icons/peteros/trash-open.webp",
    openMeans: "trash full",
  },
  folder: {
    closed: "/icons/peteros/folder-closed.webp",
    open: "/icons/peteros/folder-open.webp",
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
      decoding="async"
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
