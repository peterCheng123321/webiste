# Design QA — Editorial detail pass

## Comparison target

- Source visual truth:
  - Homepage: `.agenthub-tmp/detail-polish/source-qa.png`
  - Notes index: `.agenthub-tmp/detail-polish/notes-qa.png`
  - Article reader: `.agenthub-tmp/detail-polish/article-qa.png`
- Browser-rendered implementation:
  - Homepage: `.agenthub-tmp/detail-polish/prod-home-qa.png`
  - Notes index: `.agenthub-tmp/detail-polish/prod-notes-qa.png`
  - Article reader: `.agenthub-tmp/detail-polish/prod-article-qa.png`
- Full-view comparison evidence:
  - `.agenthub-tmp/detail-polish/home-comparison.png`
  - `.agenthub-tmp/detail-polish/notes-comparison.png`
  - `.agenthub-tmp/detail-polish/article-comparison.png`
- Responsive and state evidence:
  - `.agenthub-tmp/detail-polish/mobile-home-qa.png`
  - `.agenthub-tmp/detail-polish/mobile-notes-qa.png`
  - `.agenthub-tmp/detail-polish/mobile-article-qa.png`
  - `.agenthub-tmp/detail-polish/wide-article-qa.png`
  - `.agenthub-tmp/detail-polish/peteros-open-qa.png`

## Capture normalization

- Primary CSS viewport: `844 × 1200`.
- Source captures: `1688 × 2400` pixels at 2× density.
- Implementation captures: `844 × 1198` pixels at 1× density. cmux exposed a 1200 CSS-pixel viewport with a 1198-pixel captured content surface.
- Comparison normalization: implementation captures were scaled to `1688 × 2396`, then padded by four pixels to `1688 × 2400` before horizontal composition with the source.
- Additional viewports: `390 × 844` mobile and `1440 × 1000` wide desktop.
- Theme/state: light editorial paper theme, top-of-page state, live production content. The homepage mock's active PeterOS launcher becomes a clearly labeled desktop-only row at the 844-pixel implementation viewport because the real OS intentionally requires a minimum 900-pixel width.

## Findings

- No actionable P0, P1, or P2 findings remain.
- Typography: the production display sans, mono metadata, weights, line heights, wrapping, and numbered article headings preserve the source hierarchy. Real post titles create expected content-dependent wraps without collapsing the layout.
- Spacing and layout: mastheads, paper grid, hero proportions, index rules, article ledger, deck, TOC, prose column, and wide record rail follow the source rhythm. Mobile layouts collapse cleanly without horizontal page overflow.
- Colors and tokens: warm paper, near-black ink, gray rules, restrained muted text, and the blue status/accent token are consistent across portfolio and Notes surfaces.
- Image and asset fidelity: the editorial target contains no image assets. PeterOS was checked separately using its real existing icon and wallpaper assets; no placeholder, CSS-art, or improvised image substitute was introduced.
- Copy and content: production uses the real portfolio, post, tag, date, and reading-time data. Source-only sample values were not copied over real content.
- Accessibility and behavior: semantic filter buttons expose `aria-pressed`, article navigation remains link-based, keyboard focus styles are retained, reduced-motion handling remains present, and mobile PeterOS messaging does not advertise an unavailable launcher.

## Focused comparison

No extra cropped comparison was required. The normalized 3376 × 2400 side-by-side composites keep the small mono labels, rule alignment, title wrapping, filter state, and article metadata legible. PeterOS was additionally opened and captured at 1440 × 1000 to verify its detailed chrome and assets independently.

## Interaction and browser checks

- Notes filters: All `6`, Systems `3`, AI + research `4`, Field notes `4`; active state and visible count update together.
- Article TOC: hash navigation reached `#the-shape-of-the-problem` and scrolled the target to the top.
- Reading progress: the document-level progress token updated during scroll and the existing analytics thresholds fired.
- PeterOS: desktop peel launcher opened a full `role="dialog"` surface with body scroll locked; the dedicated `/os` route loaded `.pos-shell` in `page` mode.
- Narrow viewport: PeterOS remains the first Explore row with explicit `Desktop screens only` / `Desktop` status instead of disappearing.
- Browser errors: none. Console contained only expected Vercel Analytics and Speed Insights development diagnostics.

## Comparison history

1. Initial homepage comparison found a P2 responsive placement gap: the real PeterOS entry disappeared below 900 pixels, while the source retained it as the first Explore row.
2. Fix: added an explicit narrow-width PeterOS list-item rule, retained the desktop launcher and `/os` route, and added a compact `Desktop` status label to the non-interactive fallback.
3. Post-fix evidence: `.agenthub-tmp/detail-polish/home-comparison.png` and `.agenthub-tmp/detail-polish/prod-home-qa.png`. The first-row placement is restored, the platform constraint is communicated, and desktop functionality is proven by `.agenthub-tmp/detail-polish/peteros-open-qa.png`.

## Follow-up polish

- P3: production homepage rows are intentionally denser than the mock because they include all real roles and projects within the same index system.
- P3: source sample reading times differ from production-calculated values; the real calculated values are retained.

## Implementation checklist

- [x] Unified homepage, Notes index, and article reader tokens and mastheads.
- [x] Added working Notes filters and real-content index rows.
- [x] Added article metadata ledger, deck, TOC, numbered Markdown hierarchy, and record rail.
- [x] Preserved and verified PeterOS overlay and dedicated route.
- [x] Checked 844-pixel, mobile, and wide layouts in cmux.
- [x] Compared normalized source and implementation captures side by side.
- [x] Ran tests, production build, and whitespace validation.

final result: passed
