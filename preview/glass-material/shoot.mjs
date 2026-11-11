import puppeteer from "puppeteer-core"
import { mkdir } from "node:fs/promises"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "../..")
const outDir = path.join(root, "docs/images/glass-material")
await mkdir(outDir, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--hide-scrollbars"]
})

const shots = []
try {
  const page = await browser.newPage()
  await page.setViewport({ width: 1120, height: 640, deviceScaleFactor: 2 })
  const names = { regular: "regular-frost", lens: "thin-lens", clear: "clear-dim", chrome: "frost-chrome" }
  const only = process.env.ONLY ? process.env.ONLY.split(",") : ["regular", "lens", "clear", "chrome"]
  for (const option of only) {
    for (const theme of ["light", "dark"]) {
      const file = `glass-${names[option]}-${theme}.png`
      const url = "file://" + path.join(root, "preview/glass-material/index.html") + `?option=${option}&theme=${theme}`
      await page.goto(url, { waitUntil: "load" })
      await page.waitForFunction("window.__glassReady === true")
      await new Promise((r) => setTimeout(r, 400))
      const card = await page.$("#card")
      const dest = path.join(outDir, file)
      await card.screenshot({ path: dest })
      const report = await page.evaluate(() => window.__glassReport)
      const box = await card.boundingBox()
      shots.push({ file, box, report })
    }
  }
} finally {
  await browser.close()
}

console.log(JSON.stringify(shots, null, 2))
