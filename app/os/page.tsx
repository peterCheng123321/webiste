import { PeterOS } from "@/components/peteros/peter-os"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "PeterOS — Zhongquan Cheng",
  description: "A tiny desktop on the web — About, Projects, Resume, Finder, Terminal.",
}

export default function OsPage() {
  return (
    <main className="os-page">
      <PeterOS mode="page" />
    </main>
  )
}
