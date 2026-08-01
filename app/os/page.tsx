import { PeterOS } from "@/components/peteros/peter-os"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "PeterOS — Zhongquan Cheng",
  description: "Peter's interactive desktop — custom icons, working windows, Finder, Terminal, projects, and labs.",
}

export default function OsPage() {
  return (
    <main className="os-page">
      <PeterOS mode="page" />
    </main>
  )
}
