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
