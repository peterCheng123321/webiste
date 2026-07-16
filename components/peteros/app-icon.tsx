"use client"

/**
 * Classic Mac OS 9 icons with real open / closed bitmaps.
 *
 * Thinking (not a green pip):
 * - Folder closed vs folder open (lid up, contents visible)
 * - Trash empty vs trash full (paper sticking out)
 * - Mail closed vs mail open (envelope with letter)
 * - Document closed vs document open (page with text)
 * - Terminal idle CRT vs keyboard-active session
 * - Calendar closed vs clipboard/open day sheet
 * - etc. — each pair is a different picture from the pack
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
  /** true = use the “open” bitmap for this icon */
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
  appearance = "light",
  open = false,
}: Props) {
  const pair = PAIR[id]
  const src = open ? pair.open : pair.closed

  const filters: string[] = []
  if (appearance === "dark") filters.push("brightness(0.82) contrast(1.05) saturate(0.95)")
  if (appearance === "clear") filters.push("brightness(1.06) contrast(0.95) saturate(0.92)")

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={`${id}-${open ? "open" : "closed"}`}
      src={src}
      alt=""
      title={open ? pair.openMeans : undefined}
      width={size}
      height={size}
      className={["pos-app-icon", open ? "is-open" : "is-closed", className]
        .filter(Boolean)
        .join(" ")}
      data-icon={id}
      data-open={open ? "true" : "false"}
      draggable={false}
      style={{
        width: size,
        height: size,
        display: "block",
        objectFit: "contain",
        filter: filters.length ? filters.join(" ") : undefined,
        opacity: appearance === "clear" ? 0.93 : 1,
        userSelect: "none",
        pointerEvents: "none",
        // crossfade feel when swapping open/closed bitmaps
        transition: "filter 160ms ease, opacity 160ms ease",
      }}
    />
  )
}
