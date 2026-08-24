import { OsDesktopGate } from "@/components/peteros/os-desktop-gate"
import { OsPageClient } from "@/components/peteros/os-page-client"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "PeterOS — Zhongquan Cheng",
  description:
    "Peter's interactive desktop — custom icons, working windows, Finder, Terminal, projects, and labs. Desktop screens only.",
}

export default function OsPage() {
  return (
    <OsDesktopGate>
      <OsPageClient />
    </OsDesktopGate>
  )
}
