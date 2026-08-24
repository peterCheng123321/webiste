# PeterOS Stage 1 — Kernel and Speed

Date: 2026-08-24
Status: approved design, awaiting implementation plan
Repo: `peterCheng123321/webiste` (`petercheng.dev`)

## Goal

Make PeterOS faster by treating it as an operating system: fix **coding logic**, **I/O processing time**, and **CPU use** (including extra cores where they pay). **No new features** in this stage. Features ship later on top of this kernel (Stage 2 virtual FS/IPC, Stage 3 visual polish).

Speed axes, in order:

1. Boot + first window (desktop usable, System Profiler open)
2. Interaction latency (drag, resize, focus, open/close, Dock)
3. Site load (homepage and `/os` JS/CSS/fonts/images)

All three must improve. Success is a **before/after comparison** on the same production build, not a redesign.

## Non-goals (Stage 1)

- New apps or lab features
- Visual redesign of chrome, homepage, or icons
- Virtual filesystem
- General IPC beyond Stage 1 syscalls
- Crash recovery of saved window layouts
- Mobile PeterOS (`PETEROS_MIN_WIDTH` 900 px gate stays)

## Current system (why it is slow)

PeterOS is a macOS-style desktop in Next.js 15. The kernel is `components/peteros/peter-os.tsx` (~1000 lines): windows, processes, z-order, trash, clock, bounds, and menus in one React tree.

| Lens | What happens today |
| --- | --- |
| Logic | `setWindows` / clock / bounds re-render the whole desktop. Apps call into React state, not syscalls. |
| I/O | `/os` statically imports the kernel. Homepage mounts `OsStage` (peel). Every route loads ~7000-line `globals.css`, three Google fonts, unoptimized images. Toy apps are code-split; About, chrome, and CSS are not. |
| CPU | Peel animation re-renders React every frame. IMU targets 60 Hz. Hidden/minimized apps can keep working. Extra cores unused (no Worker, no I/O queue, no scheduler). |

## Approach

**Hybrid kernel.** UI stays on the main thread (it must paint the DOM). Process table and window manager leave React and live in a pure TypeScript store. An I/O scheduler ranks boot work. Hidden/minimized apps are suspended. A Worker runs only the measured IMU hot loop. Feature freeze.

Rejected:

- React-only memo cleanup — faster to ship, nothing for Stage 2 to sit on.
- Full Worker kernel — every drag/focus becomes IPC; likely slower boot.

## Architecture

```
I/O scheduler          Kernel (pure TS)           Views (React)
─────────────          ────────────────           ─────────────
critical: shell CSS    process table              menu / dock / desktop
          About        window manager  ──store──► window frames
          Dock icons   focus / z-order            app content (subscribed)
deferred: toy chunks   cooperative scheduler
          extra icons  syscall bus (open/quit)
idle:     prefetch     suspend hidden/minimized

Main thread: input, layout, paint, kernel
Worker:      IMU loop only (Stage 1); same port for later labs
```

- Kernel is outside React: process table, windows, focus, launch/quit/minimize.
- Shell components subscribe to **slices** via `useSyncExternalStore`.
- Dragging a window updates geometry in the store; **only that frame paints**. About, IMU, and Dock do not re-render.
- `/os` and the homepage peel share one `boot.ts`. Homepage does **not** download the kernel until the user opens PeterOS.

## Kernel modules and data flow

Pure TypeScript under `lib/peteros/`. React only paints.

```
lib/peteros/
  kernel/store.ts           single store + subscribe(selector)
  kernel/process.ts         spawn, quit, running table
  kernel/window-manager.ts  create, focus, move, resize, min/max/close
  kernel/scheduler.ts       running | focused | hidden | suspended
  kernel/io-queue.ts        critical → deferred → idle
  kernel/syscalls.ts        the only API apps/shell may call
  boot.ts                   one boot path for /os and the homepage peel
  workers/imu.worker.ts     60 Hz in worker, 10 Hz to UI if not suspended
```

`components/peteros/peter-os.tsx` becomes a composer: boot, then shell views. Menu, Dock, desktop, and each `WindowFrame` subscribe to their slice only. Existing apps keep current user-visible behavior; they talk to the OS through syscalls, not `setWindows`.

### Stage 1 syscalls

`open`, `quit`, `focus`, `minimize`, `close`, `maximize`, `move`, `resize`, `setAppearance`.

Trash remains an opaque blob in the store. A real filesystem is Stage 2.

### Data flow

1. **Boot** — I/O critical: OS CSS, chrome, About. Kernel `init` → spawn `about` → first paint. Toy chunks and extra icons are deferred; analytics idle.
2. **Homepage** — peel chrome may load; kernel JS is not on the critical path until open. `/os` uses the same `boot.ts`.
3. **Open app** — `open(id)` → spawn or unhide → focus window → I/O loads that chunk. Failure: process stays running, window shows Retry; other windows keep working.
4. **Drag/resize** — pointer hits `move`/`resize` in the store. Only that frame’s geometry subscriber paints. App content is not notified.
5. **Scheduler** — unfocused, hidden, or minimized processes do not get rAF/timers. IMU Worker keeps 60 Hz internally but posts to the UI only when the process is focused and not suspended. Worker failure falls back to a 10 Hz main-thread loop.

### Process states

`running | focused | hidden | suspended`

- Close hides the window and keeps the process running (Dock dot stays).
- Quit removes process and windows.
- Minimize hides the window; process is suspended (no rAF).
- Hidden or unfocused: no ticks; IMU posts **zero** UI messages.

## Error handling

The desktop stays up. A failed app or I/O item never takes down the kernel.

**Invariants**

- At most one focused window. `z` only increases.
- `open` of an unknown id is a no-op (Terminal may print `command not found`; Dock/icons never pass unknown ids).
- `quit` of a missing process is a no-op.
- Bounds of `0` (first layout frame) do not spawn About twice; boot is a one-shot latch.

**I/O**

- Critical boot (OS CSS / chrome) fails → full-screen retry on `/os` and on the peel, not a blank page. Homepage underneath stays usable.
- Deferred chunk fails → process stays `running`, window shows Retry.
- Idle (analytics, extra icons) fails silently.

**CPU / Worker**

- IMU Worker fails to start, crashes, or is blocked → 10 Hz main-thread fallback; process marked `degraded`; desktop does not reload.
- A throw in a suspended/hidden app is isolated to that window; scheduler stops its ticks.

**Input / geometry**

- Drag/resize outside desktop bounds clamp; they do not throw.
- Appearance `localStorage` unavailable → in-memory only.
- Viewport `< 900px` → existing desktop gate; kernel does not boot on mobile.

## Testing

Tests encode why the kernel exists: logic, I/O, and CPU stay isolated so later features do not melt the main thread.

### Kernel (no DOM, no React)

Spawn, quit, focus, z-order, minimize/close vs quit, boot latch (About once). Unknown `open`/`quit` are no-ops.

### Scheduler

Hidden, minimized, or unfocused processes do not receive ticks. Focused IMU may publish at ~10 Hz; suspended IMU publishes zero UI messages. Worker-crash path switches to the 10 Hz fallback without tearing down other processes.

### I/O queue

Critical items complete before deferred; deferred before idle. A failed deferred item leaves the queue running. Module-graph assertion: homepage initial JS does not include `lib/peteros` until open; `/os` and peel share `boot.ts`.

### Store isolation

A `move`/`resize` notifies only the geometry subscriber for that window id. Dock, clock, and other app content do not subscribe to geometry.

### App smoke

Thin `/os` production boot: chrome + About, empty page console. Existing lab behavior is not re-specified here.

### Overall system speed comparison (merge gate)

Stage 1 is not done until a **baseline vs candidate comparison** shows improvement on all three speed axes and no CPU-isolation regression.

Capture **baseline on current `main`** before kernel work, using a production build (`next build` && `next start`), viewport **1280×720**, same machine, same browser. Capture **candidate** the same way after the kernel lands. Write both JSON blobs plus a markdown table to `docs/superpowers/perf/2026-08-24-peteros-speed-comparison.md`.

Do not use `next dev` for this comparison.

**A. Page load**

| Metric | How |
| --- | --- |
| Homepage JS transferred (gzip) | Next build client stats / Network |
| `/os` JS transferred (gzip) | same |
| Kernel in homepage initial graph | must be **no** on candidate |
| Homepage FCP and TBT | Performance / Lighthouse on production |
| `/os` CSS parse cost | OS CSS split off homepage `globals` |

**B. Boot + first window**

Use the same **DOM signal** on both builds: time from `navigationStart` (route `/os`) or from peel-open (homepage) until the About window title is in the DOM and the menu bar and Dock are hit-testable.

Candidate also sets `performance.mark` / `measure` in `boot.ts` (`peteros-boot-start` → `peteros-about-visible`) aligned to that DOM signal, plus a mark that critical I/O finished before the first deferred item starts.

Baseline does not need `boot.ts`; the DOM signal is enough to compare.

**C. Interaction**

| Metric | How |
| --- | --- |
| Window drag | 60 frames of `move`; p95 frame duration from rAF timestamps |
| Focus switch | click background window → that window is focused |
| Open deferred app | Dock click → window chrome visible; chunk may still load |

Candidate must not re-render Dock, clock, or other app trees during drag (store isolation test + frame times).

**D. CPU**

| Metric | How |
| --- | --- |
| Idle long tasks on desktop with About focused | Performance longtask / observer over 5s |
| IMU UI messages in 2s, focused | ~10 Hz, not 60 Hz |
| IMU UI messages in 2s, minimized | **0** |
| Worker vs fallback | fallback path still 10 Hz; desktop stays up |

**Pass rule**

- Homepage load: JS transferred down; kernel absent from initial graph.
- `/os` boot: About-visible DOM signal faster than baseline.
- Interaction: drag p95 faster than baseline and no extra-subscriber renders.
- CPU: minimized IMU is 0 UI messages; idle long tasks not worse than baseline.

If one axis is within measurement noise, say so in the report and still show the raw numbers. An axis that is **worse** blocks merge unless the report names a kernel bug and a fix. New features must not be added to “make the demo look faster.”

## Implementation sequence (inside Stage 1)

1. Record baseline comparison numbers on `main`.
2. Extract kernel store, process table, window manager, syscalls. Wire shell to subscriptions. Behavior match, no new UI.
3. I/O queue + CSS/bundle split + lazy homepage kernel + `/os` through `boot.ts`.
4. Scheduler suspend + IMU Worker with main-thread fallback.
5. Kernel unit tests, isolation tests, I/O order tests.
6. Record candidate numbers; write the comparison report. Fix until the pass rule holds.

## Later stages (not this spec)

- **Stage 2** — Virtual FS and IPC on the syscall bus.
- **Stage 3** — Visual polish, once the core is stable and the speed comparison is green.
