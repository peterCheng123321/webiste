"use client"

import "@/app/peteros.css"
import dynamic from "next/dynamic"

const PeterOS = dynamic(
  () => import("./peter-os").then((module) => module.PeterOS),
  {
    ssr: false,
    loading: () => (
      <div className="pos-shell pos-shell-page pos-shell-loading" aria-hidden>
        <div className="pos-wallpaper" />
      </div>
    ),
  },
)

export function OsPageClient() {
  return (
    <main className="os-page">
      <PeterOS mode="page" />
    </main>
  )
}
