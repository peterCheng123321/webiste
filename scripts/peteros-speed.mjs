#!/usr/bin/env node
/**
 * Production speed probe for PeterOS. Requires `pnpm build && pnpm start`
 * and system Chrome. Viewport 1280×720.
 */
import puppeteer from "puppeteer-core"

const BASE = process.env.PETEROS_URL ?? "http://127.0.0.1:3000"
const CHROME =
  process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--window-size=1280,720"],
  defaultViewport: { width: 1280, height: 720 },
})

const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 720 })

await page.goto(`${BASE}/os`, { waitUntil: "domcontentloaded", timeout: 60_000 })
const about = await page.waitForSelector(
  '[data-app-id="about"][data-closed="false"]',
  { timeout: 30_000 },
)
const aboutVisibleMs = await page.evaluate(() => performance.now())

const bootMeasure = await page.evaluate(() => {
  const entries = performance.getEntriesByName("peteros-boot")
  return entries[0]?.duration ?? null
})

const box = await about.boundingBox()
if (!box) throw new Error("about window has no box")

const frames = []
let last = Date.now()
const onFrame = () => {
  const now = Date.now()
  frames.push(now - last)
  last = now
}
await page.evaluate(() => {})
page.on("framenavigated", () => {})

await page.mouse.move(box.x + box.width / 2, box.y + 8)
await page.mouse.down()
for (let i = 0; i < 60; i++) {
  const t0 = Date.now()
  await page.mouse.move(box.x + box.width / 2 + i * 3, box.y + 8 + (i % 5), {
    steps: 1,
  })
  frames.push(Date.now() - t0)
}
await page.mouse.up()

frames.sort((a, b) => a - b)
const p95 = frames[Math.min(frames.length - 1, Math.floor(frames.length * 0.95))]

const jsBytes = await page.evaluate(async () => {
  if (!performance.getEntriesByType) return null
  const res = performance.getEntriesByType("resource")
  let js = 0
  for (const r of res) {
    if (r.name.includes(".js")) js += r.transferSize || 0
  }
  return js
})

const result = {
  url: `${BASE}/os`,
  viewport: "1280x720",
  aboutVisibleMs,
  bootMeasureMs: bootMeasure,
  dragP95Ms: p95,
  jsTransferBytes: jsBytes,
  dragSamples: frames.length,
}

console.log(JSON.stringify(result, null, 2))
await browser.close()
