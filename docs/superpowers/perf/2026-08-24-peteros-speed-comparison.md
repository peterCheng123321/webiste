# PeterOS speed comparison

Date: 2026-08-24
Viewport target: 1280×720
Build: `pnpm build` (production). Do not use `next dev`.

## Candidate (`feat/peteros-kernel-speed`)

Production route table after kernel work:

| Route | Size | First Load JS |
| --- | --- | --- |
| `/` | 4.38 kB | 109 kB |
| `/os` | 1.86 kB | 106 kB |
| shared | | 101 kB |

`/os` no longer statically imports `peter-os.tsx` (OsPageClient + `dynamic(..., { ssr: false })`). Homepage `app/page.tsx` does not import `lib/peteros`. `app/globals.css` no longer contains `.pos-shell`; desktop chrome is `app/peteros.css` loaded with the OS.

Kernel unit tests: 12 passed (`pnpm test`) — process/window syscalls, scheduler (minimized IMU does not tick), I/O order, module graph.

## Baseline (`main`, before kernel)

Not re-built in this pass (would require checking out `main` and a second production compile on the same machine). On `main`, `/os` statically imported `PeterOS`, and `globals.css` included the full PeterOS + Mac app chrome on every route.

Re-run on `main` with the same `pnpm build` and paste the route table here before calling the merge gate green for **boot** and **interaction** (those need a browser).

## Runtime axes (browser, production `next start`, 1280×720)

| Axis | How | Baseline | Candidate | Pass? |
| --- | --- | --- | --- | --- |
| Homepage JS / kernel graph | build + graph tests | static OS CSS on `/` | kernel not in homepage source graph | **yes** (graph tests) |
| `/os` first load | Next route table | (record on `main`) | 1.86 kB / 106 kB | pending vs `main` table |
| Boot: About visible | DOM signal from navigationStart | pending | `peteros-boot` measure in `boot.ts` | pending browser |
| Drag p95 | 60 frames rAF | pending | kernel `move` + memo WindowFrame | pending browser |
| IMU minimized | UI messages / 2s | likely > 0 | `shouldPublishImu` false; SensorApp effect bails on `suspended` | **unit** yes; browser pending |

## Pass rule (spec)

- Homepage load: JS graph — **pass** (source graph). Byte comparison vs `main` still needs the `main` route table.
- `/os` boot DOM signal — **pending browser**.
- Interaction drag p95 — **pending browser**.
- CPU minimized IMU — **pass** at kernel unit level; confirm in browser.

New features were not added to inflate the demo.
