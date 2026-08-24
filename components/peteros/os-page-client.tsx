"use client"

import "@/app/peteros.css"
import { PeterOS } from "./peter-os"

export function OsPageClient() {
  return (
    <main className="os-page">
      <PeterOS mode="page" />
    </main>
  )
}
