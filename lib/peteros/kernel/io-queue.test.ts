import { describe, expect, it } from "vitest"
import { createIoQueue } from "./io-queue"

describe("io-queue", () => {
  it("runs critical then deferred then idle", async () => {
    const order: string[] = []
    const q = createIoQueue()
    q.enqueue({
      id: "idle",
      priority: "idle",
      run: async () => {
        order.push("idle")
      },
    })
    q.enqueue({
      id: "crit",
      priority: "critical",
      run: async () => {
        order.push("critical")
      },
    })
    q.enqueue({
      id: "def",
      priority: "deferred",
      run: async () => {
        order.push("deferred")
      },
    })
    await q.drain()
    expect(order).toEqual(["critical", "deferred", "idle"])
  })

  it("keeps draining after a deferred item fails", async () => {
    const order: string[] = []
    const q = createIoQueue()
    q.enqueue({
      id: "a",
      priority: "deferred",
      run: async () => {
        throw new Error("chunk failed")
      },
    })
    q.enqueue({
      id: "b",
      priority: "deferred",
      run: async () => {
        order.push("b")
      },
    })
    q.enqueue({
      id: "c",
      priority: "idle",
      run: async () => {
        order.push("c")
      },
    })
    await q.drain()
    expect(order).toEqual(["b", "c"])
  })
})
