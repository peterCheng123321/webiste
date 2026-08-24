# PeterOS Stage 1 Kernel and Speed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract a hybrid PeterOS kernel (process table, window manager, I/O queue, cooperative scheduler, IMU worker) so boot, interaction, and page load get faster with a baseline-vs-candidate comparison gate — no new features.

**Architecture:** Pure TypeScript kernel store outside React; shell views subscribe via `useSyncExternalStore` to slices. I/O queue ranks critical → deferred → idle. Hidden/minimized processes do not tick. IMU 60 Hz runs in a Worker and publishes ~10 Hz only when focused. Homepage does not load kernel JS until open.

**Tech Stack:** Next.js 15, React 19, TypeScript, Vitest (node) for kernel tests, existing `components/peteros` UI.

## Global Constraints

- Feature freeze: no new apps, no visual redesign, no virtual FS, no general IPC beyond Stage 1 syscalls.
- Stage 1 syscalls: `open`, `quit`, `focus`, `minimize`, `close`, `maximize`, `move`, `resize`, `setAppearance`.
- Process states: `running | focused | hidden | suspended`.
- Close keeps process running; quit removes process and windows; minimize suspends ticks.
- IMU: 60 Hz in worker, ~10 Hz UI when focused, **0** UI messages when minimized/hidden.
- Homepage initial JS must not include `lib/peteros` until open; `/os` and peel share `boot.ts`.
- Comparison: production `next build` && `next start`, viewport 1280×720; report at `docs/superpowers/perf/2026-08-24-peteros-speed-comparison.md`.
- Work in repo `peterCheng123321/webiste` on a feature branch, not `main` commits mixed with unrelated work.
- Existing app user-visible behavior stays.

## File map

- Create: `lib/peteros/kernel/create-kernel.ts` — store, process table, window manager, syscalls
- Create: `lib/peteros/kernel/scheduler.ts` — tick permission from window/process state
- Create: `lib/peteros/kernel/io-queue.ts` — priority queue
- Create: `lib/peteros/boot.ts` — `bootPeterOS`, performance marks, spawn About
- Create: `lib/peteros/workers/imu.worker.ts` — 60 Hz loop, post 10 Hz
- Create: `lib/peteros/hooks.ts` — `useKernelSlice`
- Create: `lib/peteros/kernel/*.test.ts`
- Create: `vitest.config.ts`
- Modify: `components/peteros/peter-os.tsx` — composer over kernel
- Modify: `app/os/page.tsx` — lazy kernel via client boot wrapper
- Modify: `package.json` — `test` script, vitest
- Modify: `app/globals.css` / new `app/peteros.css` — OS CSS not on homepage critical path
- Create: `docs/superpowers/perf/2026-08-24-peteros-speed-comparison.md`

### Task 1: Vitest + kernel process/window store

**Files:**
- Create: `vitest.config.ts`
- Create: `lib/peteros/kernel/create-kernel.ts`
- Create: `lib/peteros/kernel/create-kernel.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `createKernel(options?: { id?: () => string })` with `subscribe`, `getState`, `init(bounds)`, `setBounds`, `open`, `openNew`, `quit`, `focus`, `close`, `minimize`, `maximize`, `move`, `resize`, `setAppearance`, `putInTrash`, `restoreTrashItem`, `emptyTrash`.

- [ ] Add vitest as a project devDependency and `"test": "vitest run"`.
- [ ] Write failing tests: unknown `open`/`quit` no-ops; `init` spawns About once; second `init` no extra About; `close` keeps running; `quit` removes; `focus` raises z and at most one focused visible window; `move` changes only that window.
- [ ] Implement `createKernel` until tests pass.
- [ ] Commit.

### Task 2: Scheduler + I/O queue

**Files:**
- Create: `lib/peteros/kernel/scheduler.ts`
- Create: `lib/peteros/kernel/scheduler.test.ts`
- Create: `lib/peteros/kernel/io-queue.ts`
- Create: `lib/peteros/kernel/io-queue.test.ts`

**Interfaces:**
- Produces: `runState(kernel, appId)` → `running | focused | hidden | suspended`; `shouldTick(kernel, appId)` boolean; `shouldPublishImu(kernel)` boolean.
- Produces: `createIoQueue()` with `enqueue({ id, priority, run })`, `drain()` processes critical then deferred then idle; failed deferred does not stop queue.

- [ ] Failing tests then implementation.
- [ ] Commit.

### Task 3: Wire PeterOS UI to kernel

**Files:**
- Create: `lib/peteros/hooks.ts`
- Create: `lib/peteros/boot.ts`
- Modify: `components/peteros/peter-os.tsx`
- Modify: `components/peteros/menu-bar.tsx` (clock local if it still re-renders the shell)

**Interfaces:**
- Consumes: Task 1 kernel, Task 2 scheduler.
- Produces: `bootPeterOS(kernel, bounds)` marks `peteros-boot-start` / `peteros-about-visible`.

- [ ] Replace `windows`/`running`/`zTop` React state with one kernel instance + `useSyncExternalStore`.
- [ ] Pass `suspended={osSuspended || minimized || closed || !shouldTick}` into apps.
- [ ] Keep Finder/Trash tokens, desktop menu, Dock, shortcuts.
- [ ] Commit.

### Task 4: I/O — lazy `/os`, CSS split, homepage graph

**Files:**
- Create: `components/peteros/os-page-client.tsx` (dynamic import PeterOS, ssr false)
- Modify: `app/os/page.tsx`
- Create: `app/peteros.css` (move `.pos-*` / `.mac-*` / `.os-page` / `.os-mobile-gate` from `globals.css`)
- Modify: `app/globals.css`
- Modify: `components/peteros/peter-os.tsx` and `os-stage.tsx` to import `app/peteros.css`

- [ ] `/os` must not statically import `peter-os.tsx`.
- [ ] Homepage `globals.css` must not contain `.pos-shell` desktop chrome (peel chrome may stay if required for the dog-ear; kernel CSS loads with PeterOS).
- [ ] Commit.

### Task 5: IMU Worker

**Files:**
- Create: `lib/peteros/workers/imu.worker.ts`
- Modify: `components/peteros/apps/sensor-app.tsx`

- [ ] Worker ticks 60 Hz; posts at 10 Hz; main thread ignores posts when `shouldPublishImu` is false.
- [ ] Worker init failure → 10 Hz main-thread loop; process `degraded` flag on kernel optional; desktop stays up.
- [ ] Commit.

### Task 6: Speed comparison report

**Files:**
- Create: `docs/superpowers/perf/2026-08-24-peteros-speed-comparison.md`

- [ ] Production build both as possible: record candidate; baseline from measurements taken on `main` before kernel commits, or re-checkout `main` build artifacts / documented DOM signal times.
- [ ] Table for load, boot, interaction, CPU. Pass/fail per spec.
- [ ] Commit.
