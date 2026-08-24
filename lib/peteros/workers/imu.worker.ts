const FRAME_MS = 1000 / 60
const PUBLISH_MS = 100
const H = 120

type Target = { x: number; y: number; z: number }

let target: Target = { x: H / 2, y: H / 2, z: H / 2 }
let lastPublish = 0
let timer: ReturnType<typeof setInterval> | null = null

function loop() {
  const now = Date.now()
  if (now - lastPublish < PUBLISH_MS) return
  lastPublish = now
  postMessage({
    type: "sample",
    x: target.x,
    y: target.y,
    z: target.z,
    at: now,
  })
}

self.onmessage = (event: MessageEvent) => {
  const data = event.data
  if (data?.type === "target") {
    target = { x: data.x, y: data.y, z: data.z }
    return
  }
  if (data?.type === "start") {
    if (timer) return
    timer = setInterval(loop, FRAME_MS)
    return
  }
  if (data?.type === "stop") {
    if (timer) clearInterval(timer)
    timer = null
  }
}
