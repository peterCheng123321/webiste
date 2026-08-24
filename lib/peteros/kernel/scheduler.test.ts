import { describe, expect, it } from "vitest"
import { createKernel } from "./create-kernel"
import { runState, shouldPublishImu, shouldTick } from "./scheduler"

describe("scheduler", () => {
  it("gives focused app ticks and IMU publish; minimized IMU publishes zero", () => {
    let n = 0
    const k = createKernel({ id: () => `w${++n}` })
    k.init({ w: 1200, h: 800 })
    k.open("sensor")
    const sensor = k.getState().windows.find((w) => w.appId === "sensor")!
    expect(runState(k, "sensor")).toBe("focused")
    expect(shouldTick(k, "sensor")).toBe(true)
    expect(shouldPublishImu(k)).toBe(true)

    k.minimize(sensor.id)
    expect(runState(k, "sensor")).toBe("suspended")
    expect(shouldTick(k, "sensor")).toBe(false)
    expect(shouldPublishImu(k)).toBe(false)
  })

  it("hides ticks for closed windows that are still running", () => {
    let n = 0
    const k = createKernel({ id: () => `w${++n}` })
    k.init({ w: 1200, h: 800 })
    k.open("sensor")
    const sensor = k.getState().windows.find((w) => w.appId === "sensor")!
    k.close(sensor.id)
    expect(runState(k, "sensor")).toBe("hidden")
    expect(shouldTick(k, "sensor")).toBe(false)
    expect(shouldPublishImu(k)).toBe(false)
  })
})
