import { describe, expect, it } from "vitest"
import { createIoQueue } from "./io-queue"

describe("boot I/O order used by scheduleDeferredIo", () => {
  it("marks critical complete before deferred prefetch", async () => {
    const order: string[] = []
    const q = createIoQueue()
    q.enqueue({
      id: "critical-done",
      priority: "critical",
      run: async () => {
        order.push("critical")
      },
    })
    q.enqueue({
      id: "toy-chunks",
      priority: "deferred",
      run: async () => {
        order.push("deferred")
      },
    })
    await q.drain()
    expect(order).toEqual(["critical", "deferred"])
  })
})
