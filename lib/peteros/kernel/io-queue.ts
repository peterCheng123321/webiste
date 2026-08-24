export type IoPriority = "critical" | "deferred" | "idle"

export type IoItem = {
  id: string
  priority: IoPriority
  run: () => Promise<void>
}

const ORDER: IoPriority[] = ["critical", "deferred", "idle"]

export function createIoQueue() {
  const items: IoItem[] = []
  let draining = false

  return {
    enqueue(item: IoItem) {
      items.push(item)
    },
    async drain() {
      if (draining) return
      draining = true
      try {
        for (const priority of ORDER) {
          const batch = items.filter((item) => item.priority === priority)
          for (const item of batch) {
            const index = items.indexOf(item)
            if (index >= 0) items.splice(index, 1)
            try {
              await item.run()
            } catch {
              if (priority === "critical") throw new Error(`critical I/O failed: ${item.id}`)
            }
          }
        }
      } finally {
        draining = false
      }
    },
  }
}

export type IoQueue = ReturnType<typeof createIoQueue>
