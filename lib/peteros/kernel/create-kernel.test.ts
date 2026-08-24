import { describe, expect, it } from "vitest"
import { createKernel } from "./create-kernel"

function kernelWithIds(ids: string[]) {
  let i = 0
  return createKernel({
    id: () => ids[i++] ?? `extra-${i}`,
  })
}

describe("createKernel", () => {
  it("treats unknown open and quit as no-ops", () => {
    const k = kernelWithIds(["w1"])
    k.init({ w: 1200, h: 800 })
    const before = k.getState()
    k.open("not-an-app")
    k.quit("not-an-app")
    expect(k.getState().windows).toEqual(before.windows)
    expect(k.getState().running).toEqual(before.running)
  })

  it("init spawns About once and a second init does not spawn another", () => {
    const k = kernelWithIds(["about-1", "about-2"])
    k.init({ w: 1200, h: 800 })
    k.init({ w: 1200, h: 800 })
    const about = k.getState().windows.filter((w) => w.appId === "about")
    expect(about).toHaveLength(1)
    expect(about[0].id).toBe("about-1")
    expect(about[0].closed).toBe(false)
    expect(k.getState().running).toEqual(["about"])
    expect(about[0].title).toBe("Peter // System Profiler")
  })

  it("close keeps the process running; quit removes process and windows", () => {
    const k = kernelWithIds(["about-1", "proj-1"])
    k.init({ w: 1200, h: 800 })
    k.open("projects")
    const project = k.getState().windows.find((w) => w.appId === "projects")!
    k.close(project.id)
    expect(k.getState().running).toContain("projects")
    expect(k.getState().windows.find((w) => w.id === project.id)?.closed).toBe(
      true,
    )
    k.quit("projects")
    expect(k.getState().running).not.toContain("projects")
    expect(k.getState().windows.some((w) => w.appId === "projects")).toBe(false)
  })

  it("focus raises z and leaves at most one focused visible window", () => {
    const k = kernelWithIds(["about-1", "proj-1"])
    k.init({ w: 1200, h: 800 })
    k.open("projects")
    const about = k.getState().windows.find((w) => w.appId === "about")!
    const project = k.getState().windows.find((w) => w.appId === "projects")!
    k.focus(about.id)
    const state = k.getState()
    const focused = state.windows
      .filter((w) => !w.minimized && !w.closed)
      .sort((a, b) => b.z - a.z)[0]
    expect(focused.id).toBe(about.id)
    expect(focused.z).toBeGreaterThan(project.z)
  })

  it("move changes only that window geometry", () => {
    const k = kernelWithIds(["about-1", "proj-1"])
    k.init({ w: 1200, h: 800 })
    k.open("projects")
    const about = k.getState().windows.find((w) => w.appId === "about")!
    const project = k.getState().windows.find((w) => w.appId === "projects")!
    const projectBefore = { ...project }
    k.move(about.id, 80, 90)
    const after = k.getState()
    const aboutAfter = after.windows.find((w) => w.id === about.id)!
    const projectAfter = after.windows.find((w) => w.id === project.id)!
    expect(aboutAfter.x).toBe(80)
    expect(aboutAfter.y).toBe(90)
    expect(projectAfter.x).toBe(projectBefore.x)
    expect(projectAfter.y).toBe(projectBefore.y)
    expect(projectAfter.width).toBe(projectBefore.width)
  })

  it("keeps a title-bar handle reachable when moving windows offscreen", () => {
    const k = kernelWithIds(["about-1"])
    k.init({ w: 1200, h: 800 })
    const about = k.getState().windows[0]
    k.move(about.id, -1000, 1000)
    const moved = k.getState().windows[0]
    expect(moved.x).toBe(-about.width + 80)
    expect(moved.y).toBe(760)
  })
})
