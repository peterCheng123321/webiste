import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const root = path.resolve(__dirname, "../../..")

describe("bundle graph", () => {
  it("homepage page does not import the PeterOS kernel", () => {
    const page = readFileSync(path.join(root, "app/page.tsx"), "utf8")
    expect(page).not.toMatch("lib/peteros")
    expect(page).not.toMatch("peter-os")
  })

  it("/os page does not statically import peter-os", () => {
    const page = readFileSync(path.join(root, "app/os/page.tsx"), "utf8")
    expect(page).not.toMatch('from "@/components/peteros/peter-os"')
    expect(page).toMatch("OsPageClient")
  })

  it("homepage globals no longer contain .pos-shell desktop chrome", () => {
    const css = readFileSync(path.join(root, "app/globals.css"), "utf8")
    expect(css).not.toMatch(/\.pos-shell\s*\{/)
    expect(css).toMatch("peteros.css")
  })
})
