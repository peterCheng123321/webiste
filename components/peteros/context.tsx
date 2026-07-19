"use client"

import { createContext, useContext } from "react"
import type { AppId } from "./types"

export type IconAppearance = "light" | "dark" | "clear"

export type PeterOSTrashNode = {
  id: string
  name: string
  kind: "folder" | "file" | "app"
  appId?: AppId
  preview?: string
  children?: PeterOSTrashNode[]
}

export type PeterOSTrashEntry = {
  key: string
  item: PeterOSTrashNode
  parentId: string
}

export type PeterOSContextValue = {
  appearance: IconAppearance
  setAppearance: (a: IconAppearance) => void
  openApp: (id: string) => void
  trashItems: PeterOSTrashEntry[]
  purgedTrashKeys: string[]
  /** Trash has items (full can) vs empty. */
  trashFull: boolean
  emptyTrash: () => void
  putInTrash: (entry: PeterOSTrashEntry) => void
  restoreTrashItem: (key: string) => void
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
      trashItems: [],
      purgedTrashKeys: [],
      trashFull: false,
      emptyTrash: () => {},
      putInTrash: () => {},
      restoreTrashItem: () => {},
      isAppOpen: () => false,
    }
  }
  return ctx
}
