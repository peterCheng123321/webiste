# Homepage design QA

## Reference and implementation

- Selected visual target: `/Users/peter/.codex/generated_images/019f6aa4-39d3-7620-b8ea-6e89e49f6b75/exec-13c5781f-858c-4f04-b680-b8b9fc37ca07.png`
- Browser implementation, desktop: `/Users/peter/.codex/visualizations/2026/07/16/019f6aa4-39d3-7620-b8ea-6e89e49f6b75/design-language-audit/implementation-desktop-final.png`
- Browser implementation, mobile: `/Users/peter/.codex/visualizations/2026/07/16/019f6aa4-39d3-7620-b8ea-6e89e49f6b75/design-language-audit/implementation-mobile-final.png`
- Full-view comparison: `/Users/peter/.codex/visualizations/2026/07/16/019f6aa4-39d3-7620-b8ea-6e89e49f6b75/design-language-audit/source-vs-implementation.png`
- Hero/live-detail comparison: `/Users/peter/.codex/visualizations/2026/07/16/019f6aa4-39d3-7620-b8ea-6e89e49f6b75/design-language-audit/hero-live-comparison.png`

## Tested states

- Desktop: 1586 × 992, initial homepage after entrance animation settled.
- Mobile: 390 × 844, initial homepage after entrance animation settled.
- Live state: two DOM snapshots 320 ms apart changed from `83.600678240741%` to `83.601048611111%`.
- Theme: browser prefers dark mode; the editorial homepage intentionally stays light to match the selected visual while PeterOS retains its own dark/glass environment.

## Comparison findings

- The desktop hierarchy, gutters, one-line hero, Deloitte underline, 952 px day rail, lower biography, and three navigation anchors align with the selected target.
- The displayed percentage and marker position necessarily differ from the static target because they reflect the real current time in Shanghai.
- The browser version uses the site’s actual Instrument Serif and JetBrains Mono files, so small glyph-shape differences from the generated raster reference are intentional and consistent with the existing identity.
- The mobile hero wraps to two readable lines, the live rail stays within the viewport, and the top-right PeterOS peel no longer collides with the timezone label.
- No horizontal overflow, clipped live labels, hydration mismatch, or blocking browser/server error was observed.

## Iteration history

1. First render exposed the browser’s dark preference and a double-counted desktop gutter.
2. The homepage was isolated as a light editorial surface and changed to a single viewport-based gutter system.
3. Hero width, vertical rhythm, rail geometry, biography width, and lower-column anchors were tuned against the full-size target.
4. Mobile spacing and the peel/timezone collision were corrected, then desktop and mobile were recaptured.

## PeterOS microdetails and System Profiler

- Desktop before/after comparison: `/Users/peter/.codex/visualizations/2026/07/16/019f6aa4-39d3-7620-b8ea-6e89e49f6b75/design-language-audit/peteros-before-vs-after.png`
- Final desktop: `/Users/peter/.codex/visualizations/2026/07/16/019f6aa4-39d3-7620-b8ea-6e89e49f6b75/design-language-audit/peteros-profiler-desktop-final.png`
- Production-build desktop: `/Users/peter/.codex/visualizations/2026/07/16/019f6aa4-39d3-7620-b8ea-6e89e49f6b75/design-language-audit/peteros-profiler-production.png`
- Final mobile: `/Users/peter/.codex/visualizations/2026/07/16/019f6aa4-39d3-7620-b8ea-6e89e49f6b75/design-language-audit/peteros-profiler-mobile-final.png`
- Desktop state: 1440 × 900, System Profiler open on Identity with Deloitte selected as the queued career node.
- Mobile state: 390 × 844, same initial state.

The former generic profile-card stack is replaced by a distinct PeterOS instrument: live Shanghai time, next-boot strip, interactive career bus, process monitor, and system-oriented secondary tabs. The selected career node and all four tabs were exercised in the browser.

Microdetail validation:

- File menu opens with correct menu semantics, focuses its first item, wraps through items with arrow keys, and Escape closes only the menu while leaving PeterOS open.
- Appearance control cycles light → dark → clear → light and exposes its current state in its accessible name.
- Running and focused Dock states are distinct; opening Projects moved the active state to Projects while About remained running.
- At 390 px the document width stayed exactly 390 px, the window measured 358 px from x=16 to x=374, and the 534 px Dock content stayed inside its own 390 px horizontal scroller.
- Compact Dock mode had zero inline widths from the desktop magnification loop.
- The System Profiler content measured `scrollWidth === clientWidth === 358px`, with no horizontal clipping.

## Annotated homepage consolidation

- Before: `/Users/peter/.codex/visualizations/2026/07/16/019f6aa4-39d3-7620-b8ea-6e89e49f6b75/homepage-comments-audit/01-before.png`
- Final desktop, 1440 × 900: `/Users/peter/.codex/visualizations/2026/07/16/019f6aa4-39d3-7620-b8ea-6e89e49f6b75/homepage-comments-audit/06-final-1440.png`
- Final mobile, 390 × 844: `/Users/peter/.codex/visualizations/2026/07/16/019f6aa4-39d3-7620-b8ea-6e89e49f6b75/homepage-comments-audit/03-mobile-top.png`
- Same-viewport before/after comparison: `/Users/peter/.codex/visualizations/2026/07/16/019f6aa4-39d3-7620-b8ea-6e89e49f6b75/homepage-comments-audit/07-before-after.png`
- Background-animation frame comparison: `/Users/peter/.codex/visualizations/2026/07/16/019f6aa4-39d3-7620-b8ea-6e89e49f6b75/homepage-comments-audit/16-glow-animation-compare.png`
- Production animation preview: `/Users/peter/.codex/visualizations/2026/07/16/019f6aa4-39d3-7620-b8ea-6e89e49f6b75/homepage-comments-audit/18-background-animation.gif`

The six browser annotations were resolved as one composition rather than isolated patches. The 1440 × 900 render now has `scrollHeight === innerHeight === 900`, with the contact footer visible at the bottom. The hero uses Inter instead of the stretched serif, and both the Shanghai-day number and faint background grid changed between timed browser reads. The lower content is a bordered editorial index with explicit Work/Research labels; Undergraduation ends in 2026, Syracuse retains Salekin Lab context and is labeled Research, and the duplicate Library VR experience is omitted while the project remains.

The background now has two independently verified motion layers: an 18-second diagonal grid drift and a 16-second pale-blue ambient field that crosses the canvas. Both computed transforms changed between browser frames; the ambient layer is removed and the grid is held static under `prefers-reduced-motion: reduce`.

Responsive and interaction checks:

- At the browser's default 1086 × 908 viewport, the page still fit exactly and all project titles rendered without ellipsis.
- At 390 × 844, `scrollWidth === innerWidth === 390`; the index stacks and scrolls vertically without horizontal clipping.
- The PeterOS entry button opened the desktop dialog and the Done control returned to the unchanged homepage at scroll position zero.
- The final DOM exposes one H1, three H2 section headings, an Explore navigation landmark, and separate Experience and Projects regions.

final result: passed

## PeterOS purpose-built app refinement — final pass

### Reference and implementation

- Source visual truth: `/Users/peter/.codex/generated_images/019f6aa4-39d3-7620-b8ea-6e89e49f6b75/exec-5084d520-2521-4169-abba-2753884a6200.png`
- Browser-rendered implementation: `/Users/peter/.codex/visualizations/2026/07/19/peteros-app-refinement/24-overall-post-regression.png`
- Full-view comparison evidence: `/Users/peter/.codex/visualizations/2026/07/19/peteros-app-refinement/25-source-final-comparison.png`
- Focused System Profiler comparison: `/Users/peter/.codex/visualizations/2026/07/19/peteros-app-refinement/26-about-focused-comparison.png`
- Close → open → close icon-state evidence: `/Users/peter/.codex/visualizations/2026/07/19/peteros-app-refinement/30-icon-close-open-close.png`
- App-state captures: `11-about-refined.png` through `20-terminal-refined.png` in `/Users/peter/.codex/visualizations/2026/07/19/peteros-app-refinement/`
- Viewport: 1280 × 720 production browser at `http://127.0.0.1:3000/os`
- State: Peter // System Profiler open on Identity; Deloitte shown as the queued next boot; default dark PeterOS appearance.

### Required fidelity surfaces

- Fonts and typography: the final browser keeps the target's compact macOS menu typography, monospaced telemetry, and editorial Peter Cheng display face. Command labels and status bars were increased to 9–10 px with stronger contrast. Truncation is limited to intentional compact Scheduler metadata; primary codes and actions remain readable.
- Spacing and layout rhythm: the menu bar, left-weighted profiler, right-side lab icons, bottom Dock, and open wallpaper field preserve the selected composition. The working profiler keeps the previously approved vertical source list rather than the concept's horizontal tabs; this is an intentional macOS System Settings refinement, not unresolved drift. Every app now owns its window-sized command bar, content region, inspector/status area, and app-specific minimum dimensions.
- Colors and visual tokens: dark indigo chrome, blue selection, cool glass, cyan/green/yellow system signals, and light macOS utility windows stay within the selected palette. Active, disabled, queued, running, focused, and destructive states are visually distinct.
- Image quality and asset fidelity: the existing generated PeterOS icon family remains sharp and optically aligned. Segment now uses a real 1448 × 1086 generated clinical depth-camera frame at `/Users/peter/Downloads/Code/projects/personal-website (1)/public/assets/peteros/segment-patient-frame.png`; the app preserves its 4:3 coordinate space so masks do not drift or crop as the window changes.
- Copy and content: Deloitte is consistently incoming/queued; Library VR no longer launches the unrelated clinical Segment app; Resume describes the actual untagged PDF accurately; Scheduler, ATS, IMU, Segment, Paint, Finder, Projects, Terminal, and About use purpose-specific labels rather than duplicated résumé copy.
- Icons and controls: all launcher, Dock, project, Finder, and Trash icons use the generated asset system. No emoji, inline SVG substitute, placeholder illustration, or CSS-built patient remains.
- Responsiveness and accessibility: window-body container queries replace viewport-only app collapse. Roving keyboard focus works in Finder, Scheduler's grid and palette, Projects, About, menus, and Dock. Visible focus, semantic progress, live-state restraint, text alternatives, and reduced-motion support remain in place.

### Primary interactions tested

- Scheduler: Auto-fill, occupied-cell removal, arrow-key grid movement, radio-arrow palette selection, close/reopen state retention, and dynamic Dock presence.
- ATS Lab: complete five-stage scan, final score and keyword results, edit-during-scan cancellation, repeated scans, empty-input protection, and word-boundary matching that rejects `capital`, `draws`, and `reactive` false positives.
- IMU Lab: canvas-only pointer source, 60 Hz signal with 10 Hz UI publication, stable pause, resume, peak reset, and retained telemetry across window hiding.
- Segment: existing-mask selection in Add mode, keyboard nudge/delete, Auto-seg, Clear, pointer-capture cleanup, and mask/image coordinate alignment.
- Paint: click dot, pointer drag, Undo, Redo, menu-bar Undo/Redo, primary-pointer gating, clear/export controls, and close/reopen canvas/history retention.
- Finder/Trash: keyboard selection, two real Finder windows, shared Trash state, Dock Trash routing, restore, permanent purge, and one targeted keyboard-modal confirmation sheet with focus wrap and Escape dismissal.
- Terminal: `open nonsense`, `ls`, Enter submission, draft-safe history, clear/cancel shortcuts, contained scrolling, and retained session after Close/reopen.
- Window shell: Close and Minimize now remain distinct while preserving app state; Quit removes the app and returns focus; hidden windows no longer render through author CSS; dynamic toy Dock entries launch and restore correctly.
- Icon state: window-open state is independent from process-running state. Close keeps the running dot but switches to the closed icon asset, Minimize keeps the open asset, and reopen restores the open asset.
- Menu bar: horizontal menu switching, vertical menu navigation, New Finder Window, safe Empty Trash confirmation, and Paint-specific Undo/Redo.
- Browser console: empty after the final interaction run; unrelated host Statsig transport warnings were outside the app page and did not appear in `qaTab2.dev.logs()`.

### Comparison history

1. The first app sweep found hidden windows still painting, close/minimize state loss, misleading Trash actions, an unreal New Finder command, missing toy Dock entries, stale ATS timers, 40 Scheduler tab stops, per-frame React telemetry, CSS patient art, destructive Paint erasing, and an invalid Terminal success response.
2. The shared shell, app state, Dock, Finder/Trash, Terminal, Scheduler, ATS, IMU, Segment, Paint, Projects, Resume, and About behaviors were rebuilt and captured in the browser.
3. A second browser/static pass found remaining shared-Trash ownership, close/minimize distinction, IMU reset/pause, Segment crop/drag coordinates, Paint pointer ownership, Scheduler palette keyboard behavior, ATS substring false positives, Library VR routing, small-label contrast, and menu-level Paint undo gaps. Each was fixed and re-tested.
4. The final regression audit found that Empty Trash removed its own source tombstones, the keyboard dialog was not modal, an expanded mobile Dock could clip, and maximized-window geometry could become stale after a viewport change. Permanent purge keys, focus trapping/Escape return, safe centered horizontal Dock scrolling, and maximized-bound reconciliation were added. Browser retesting confirmed the purged file remained absent and the dialog wrapped focus and dismissed safely.
5. The full-view and focused combined comparisons confirmed the approved PeterOS composition, palette, hierarchy, icon language, and System Profiler content. The vertical profiler navigation and slightly larger working window are intentional product refinements that keep all four functional panels discoverable.
6. A final user-reported state bug showed app icons staying open after Close because the asset variant followed process state. Window-open state was separated from the running indicator, and a close → open → close browser contact sheet confirmed the closed/open/closed asset sequence while the Dock process dot remained present.
7. No actionable P0, P1, or P2 issue remains. The final production build, type check, whitespace check, browser interactions, image loading, and page console all passed.

### Generated Segment source frame

- Mode: built-in ImageGen, one generation.
- Saved asset: `/Users/peter/Downloads/Code/projects/personal-website (1)/public/assets/peteros/segment-patient-frame.png`
- Final prompt:

```text
Use case: scientific-educational
Asset type: PeterOS Segment app clinical research sensor frame, rendered inside an application at approximately 390 × 290 px.
Primary request: Create a single 4:3 landscape overhead thermal/depth-camera frame of an anonymous patient lying centered on a clinical bed.
Input image: palette and visual-style reference only. Use its dark PeterOS indigo, midnight navy, cobalt-blue, violet, and restrained cyan luminosity. Do not reproduce any desktop, windows, icons, interface, text, or layout from the reference.
Scene/backdrop: A quiet clinical research capture from a ceiling-mounted depth sensor. The bed outline, pillow, mattress rails, and sparse surrounding floor geometry are visible but understated.
Subject: One anonymous adult human subject lying supine and centered, represented only as a smooth low-detail thermal/depth silhouette. No identifiable face, no facial features, no skin detail, no clothing logos.
Style/medium: Tasteful low-detail scientific sensor imagery; refined depth-map/thermal-camera aesthetic; subtle pixel-level sensor noise and gentle contour falloff; clean enough to support colored segmentation-mask overlays later.
Composition/framing: Strict 4:3 landscape frame; true overhead view; full bed contained with comfortable margin; body centered from head to feet; strong readable silhouette at small rendered size.
Lighting/mood: Dark, calm, clinical, precise, non-threatening.
Color palette: Deep indigo and navy base, soft cobalt/violet depth bands, restrained cool-cyan highlights. Maintain sufficient luminance contrast between subject, mattress, bed outline, and floor for future segmentation colors.
Text: none.
Constraints: Exactly one image frame. No UI, no controls, no panels, no labels, no numbers, no typography, no masks or segmentation overlays, no watermark. No identifiable person, no visible face, no gore, no injury, no medical emergency. Keep the subject tasteful and clearly human while deliberately anonymous.
Avoid: photorealistic identity, detailed anatomy, hospital branding, excessive neon, rainbow heat-map colors, red/orange heat signatures, horror mood, blur that destroys the silhouette, clutter, cinematic perspective, cropped bed or cropped body.
```

final result: passed

## PeterOS custom icon system and functional desktop — final pass

### Reference and implementation

- Source visual truth: `/Users/peter/.codex/generated_images/019f6aa4-39d3-7620-b8ea-6e89e49f6b75/exec-5084d520-2521-4169-abba-2753884a6200.png`
- Production-browser implementation: `/Users/peter/.codex/visualizations/2026/07/16/019f6aa4-39d3-7620-b8ea-6e89e49f6b75/peteros-icon-system/10-production-final.png`
- Full-view source/implementation comparison: `/Users/peter/.codex/visualizations/2026/07/16/019f6aa4-39d3-7620-b8ea-6e89e49f6b75/peteros-icon-system/11-source-vs-final.png`
- Focused icon-region comparison: `/Users/peter/.codex/visualizations/2026/07/16/019f6aa4-39d3-7620-b8ea-6e89e49f6b75/peteros-icon-system/12-icon-regions-final.png`
- Closed/open icon-state contact sheet: `/Users/peter/.codex/visualizations/2026/07/16/019f6aa4-39d3-7620-b8ea-6e89e49f6b75/peteros-icon-system/13-icon-state-contact-sheet.png`
- Tested viewport/state: 1280 × 720 at production `/os`, with Peter // System Profiler open on Identity.

### Visual comparison

- Typography: the menu bar, window labels, telemetry, and icon labels retain the site's existing monospaced system voice; the profiler identity uses the established editorial display face. Weight, hierarchy, and label contrast remain legible at the rendered sizes.
- Spacing and layout: the black menu bar, left-weighted profiler, right desktop rail, and centered bottom Dock reproduce the selected composition. The profiler intentionally uses a persistent vertical source list instead of the reference's compact horizontal tabs so all four working panels remain visible and macOS-like.
- Color and tokens: the wallpaper, dark metal window chrome, indigo selection, cool glass Dock, cyan activity, and green/yellow status signals align with the source. The generated wallpaper was darkened during comparison so foreground windows and icons retain separation.
- Image quality and assets: all visible PeterOS icons are generated 512 × 512 RGBA image assets with transparent corners; no emoji, CSS drawings, fake placeholders, or visible chroma halos remain. Twelve icon families each have a distinct closed/idle and open/active state.
- Copy and content: Peter Cheng, Shanghai, Deloitte, WashU, Syracuse, AI for Health Institute, project names, and 2026.08 timing remain consistent across the desktop and System Profiler.
- No unresolved P0, P1, or P2 visual fidelity issue remained in the final combined comparison.

### Interaction and accessibility checks

- Dock launch moved focus to Projects while About remained running; closing the Projects window kept its running indicator, while Command+Q removed the process and its window.
- Finder moved `resume.pdf` to the session Trash, hid it from its source folder, exposed it in the Trash view, changed the Dock Trash to its full state, and restored it successfully.
- Window edge/corner resize handles changed the profiler geometry while respecting minimum dimensions and desktop bounds.
- Shift+F10 opened the desktop context menu with first-item focus; Arrow Down moved focus and Open Terminal launched a real Terminal window. Escape, Tab, Home, End, and arrow-key handling are implemented for the menu.
- The production browser reported `scrollWidth === innerWidth === 1280`, `scrollHeight === innerHeight === 720`, 12 visible PeterOS state images, zero broken images, and an empty browser log after the interaction run.
- Existing 390 × 844 PeterOS checks remain recorded above. The final icon scale has explicit compact overrides and the profiler converts its source list to a horizontal scroller at the existing mobile breakpoint; the current in-app browser surface exposed only the fixed 1280 × 720 viewport for this final recapture.

### Iteration history

1. The first contact-sheet audit found the Paint active state too similar to idle and several active assets optically undersized.
2. Paint active was regenerated with a live cyan stroke and status point; Projects, Resume, Scheduler, Trash, Folder, and Paint were optically recentered or normalized.
3. The first full-view comparison found the wallpaper too bright and the desktop/Dock icons too small relative to the selected source.
4. The wallpaper treatment was darkened, desktop icons increased to 72 px, Dock icons increased to 52 px, and the production view was recaptured.
5. The final source/implementation and focused icon comparisons found no actionable severity issue; functional browser checks completed without console errors.

final result: passed
