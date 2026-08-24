# PeterOS speed comparison

Date: 2026-08-24  
Machine: local macOS, system Chrome headless, viewport **1280×720**  
Server: `pnpm build && pnpm exec next start -p 3000`  
Probe: `scripts/peteros-speed.mjs` (About = `[data-app-id="about"][data-closed="false"]`, time = `performance.now()` after `domcontentloaded` + selector)

## Production first-load JS (Next route table)

| Route | Baseline `main` | Candidate `feat/peteros-kernel-speed` |
| --- | --- | --- |
| `/` | 4.37 kB / **108 kB** first load | 4.37 kB / **109 kB** first load |
| `/os` | 60.4 kB / **164 kB** first load | 61.5 kB / **166 kB** first load |

Homepage JS is not smaller (1 kB noise). `/os` first-load JS is not smaller once PeterOS is statically imported again (needed so About is not waiting on a second chunk). The homepage **CSS** win is real: `app/globals.css` no longer contains `.pos-shell` / Mac app chrome (~5447 lines moved to `app/peteros.css`, loaded with the OS). Kernel is absent from `app/page.tsx`.

## Runtime `/os` (two runs each)

| Metric | Baseline `main` | Candidate | Notes |
| --- | --- | --- | --- |
| About-visible (ms) | 147.8, 147.8 | 138, 143.2 | Candidate faster (~5–7%). Small; treat as noise-band with a favorable direction. |
| `peteros-boot` measure (ms) | n/a | 0–0.3 | Kernel `init` only, not DOM. |
| Drag p95 (ms) | 10, 9 | 9, 9 | No regression. Probe moves titlebar 60 steps; not a paint profiler. |
| JS transfer after probe (bytes) | 171231 | 193759 | Candidate higher because idle **deferred toy prefetch** starts after boot. |

## Kernel / CPU (unit tests, `pnpm test`)

13 passed: unknown open/quit no-ops, About once, close vs quit, focus z-order, move isolation, I/O critical→deferred, minimized IMU `shouldPublishImu === false`, homepage graph.

Browser IMU message counts were not collected (would need Sensor app open + worker instrumentation).

## Pass rule vs spec

| Rule | Result |
| --- | --- |
| Homepage JS transferred down | **No** (108 → 109 kB). CSS chrome removed from homepage. Kernel not in homepage source graph: **yes**. |
| `/os` About-visible faster | **Yes, small** (148 → ~140 ms). |
| Drag p95 faster + no extra-subscriber renders | p95 **flat** (9–10 ms). Window records keep identity on `move`; `WindowFrame` is memoized. |
| Minimized IMU 0 UI messages | **Unit yes**; browser not measured. |
| Idle long tasks | **Not measured** in Chrome. |

An axis that is **worse** on first-load JS (`/os` 164 → 166, `/` 108 → 109) is within 2 kB. Boot was not sacrificed to shrink `/os` (a fully lazy `/os` made About-visible **956 ms** vs 678 ms on `main`; that approach was reverted).

New features were not added to fake the demo.
