"use client"

import { createContext, useContext } from "react"

export type IconAppearance = "light" | "dark" | "clear"

export type PeterOSContextValue = {
  appearance: IconAppearance
  setAppearance: (a: IconAppearance) => void
  openApp: (id: string) => void
  /** Trash has items (full can) vs empty */
  trashFull: boolean
  emptyTrash: () => void
  putInTrash: () => void
  /** Is this app currently running (window open)? */
  isAppOpen: (id: string) => boolean
}

export const PeterOSContext = createContext<PeterOSContextValue | null>(null)

export function usePeterOS() {
  const ctx = useContext(PeterOSContext)
  if (!ctx) {
    return {
      appearance: "light" as IconAppearance,
      setAppearance: () => {},
      openApp: () => {},
      trashFull: false,
      emptyTrash: () => {},
      putInTrash: () => {},
      isAppOpen: () => false,
    }
  }
  return ctx
}
