import { createElement, type ElementType, type HTMLAttributes, type ReactNode } from "react"
import "./glass.css"

export const GLASS_MATERIALS = [
  "solid",
  "regular",
  "thin",
  "clear",
  "chrome",
] as const

export type GlassMaterial = (typeof GLASS_MATERIALS)[number]

export type GlassTone = "light" | "dark"

export type GlassProps = {
  as?: ElementType
  material?: GlassMaterial
  tone?: GlassTone
  className?: string
  children?: ReactNode
} & Omit<HTMLAttributes<HTMLElement>, "color">

export const DEFAULT_GLASS_MATERIAL: GlassMaterial = "solid"
export const DEFAULT_TRANSLUCENT_MATERIAL: GlassMaterial = "regular"

export function Glass({
  as = "div",
  material = DEFAULT_GLASS_MATERIAL,
  tone = "light",
  className,
  children,
  ...rest
}: GlassProps) {
  const classes = ["glass", className].filter(Boolean).join(" ")

  return createElement(
    as,
    {
      ...rest,
      className: classes,
      "data-glass-material": material,
      "data-glass-tone": tone,
    },
    createElement("span", {
      className: "glass__dim",
      "aria-hidden": true,
    }),
    createElement("div", { className: "glass__content" }, children),
  )
}
