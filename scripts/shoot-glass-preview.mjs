import puppeteer from "puppeteer-core"
import { mkdir, copyFile } from "node:fs/promises"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")
const outDir = path.join(root, "docs/images/glass-component")
const mediaDir = "/cursor/stores/bc-7bd9e2a6-ce6f-5bf6-9f6a-10659cb2d149/media"
const artifactsDir = "/opt/cursor/artifacts"

await mkdir(outDir, { recursive: true })
await mkdir(mediaDir, { recursive: true })
await mkdir(artifactsDir, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--hide-scrollbars"],
})

const shots = []
const base = "http://127.0.0.1:3456"

try {
  const page = await browser.newPage()

  const capture = async (name, url, width, height, prepare) => {
    await page.setViewport({ width, height, deviceScaleFactor: 2 })
    await page.goto(url, { waitUntil: "networkidle0" })
    if (prepare) await prepare(page)
    await new Promise((r) => setTimeout(r, 250))
    const file = `${name}.png`
    const dest = path.join(outDir, file)
    await page.screenshot({ path: dest, fullPage: false })
    await copyFile(dest, path.join(mediaDir, file))
    await copyFile(dest, path.join(artifactsDir, file))
    shots.push({ file, width, height, url })
  }

  await capture("glass-before-home-1440", `${base}/`, 1440, 900)
  await capture("glass-before-home-390", `${base}/`, 390, 844)

  await capture("glass-after-solid-1440", `${base}/preview/glass`, 1440, 900)
  await capture("glass-after-solid-768", `${base}/preview/glass`, 768, 900)
  await capture("glass-after-solid-390", `${base}/preview/glass`, 390, 844)

  const selectRegular = async (p) => {
    await p.select("select", "regular")
    await new Promise((r) => setTimeout(r, 200))
  }

  await capture(
    "glass-after-regular-1440",
    `${base}/preview/glass`,
    1440,
    900,
    selectRegular,
  )
  await capture(
    "glass-after-regular-768",
    `${base}/preview/glass`,
    768,
    900,
    selectRegular,
  )
  await capture(
    "glass-after-regular-390",
    `${base}/preview/glass`,
    390,
    844,
    selectRegular,
  )

  const selectDark = async (p) => {
    await p.select("select", "regular")
    const selects = await p.$$("select")
    await selects[1].select("dark")
    await new Promise((r) => setTimeout(r, 200))
  }

  await capture(
    "glass-after-regular-dark-1440",
    `${base}/preview/glass`,
    1440,
    900,
    selectDark,
  )
} finally {
  await browser.close()
}

console.log(JSON.stringify(shots, null, 2))
