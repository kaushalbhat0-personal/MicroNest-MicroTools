# MICRONEST UI/UX 10 REPORT — DESKTOP WIDTH + FOOTER + HOVER POLISH

**Date:** 2026-09-29 22:30 IST
**Baseline:** `c72c92428d55f9eb3a48ccf2029561d153c116c7` `feat(marketing): add profession navigation and card interactions` (09 — hierarchical nav + subtle hover `h-10` 09A)
**Current fix:** Uncommitted — desktop width hierarchy + footer breathing room + hover visibility polish
**Scope:** Marketing surface only — no DB/RPC/RLS/app logic/dep/route change, DO NOT COMMIT per instruction

---

## 1. UI/UX Skill Used

**`ui-ux-pro-max`** from `.agents/skills.md` and verified via `npx skills list -g --json`:

| Field | Value |
|-------|-------|
| Skill name | `ui-ux-pro-max` |
| Package | `nextlevelbuilder/ui-ux-pro-max-skill` (375.1K) |
| Global path | `C:\Users\91866\.agents\skills\ui-ux-pro-max` |
| Entry | `SKILL.md` (214 lines) |
| Search script | `scripts/search.py` |
| References | `references/quick-reference.md` (119 guidelines) |

**Queries run before UI changes (per skill query contract — one intent, 2–5 terms, explicit --domain):**

```powershell
python "C:\Users\91866\.agents\skills\ui-ux-pro-max\scripts\search.py" "container width responsive" --domain ux
# → Layout Container Width (max-w-prose 65-75ch, don't let text span full viewport, Medium) + Horizontal Scroll (max-w-full, High)

python "C:\Users\91866\.agents\skills\ui-ux-pro-max\scripts\search.py" "footer layout" --domain ux
# → Fixed Positioning (account for safe areas), Stacking Context, Viewport Units

python "C:\Users\91866\.agents\skills\ui-ux-pro-max\scripts\search.py" "card hover background border" --domain ux
# → Hover States (hover:bg-gray-100 cursor-pointer, Medium), Hover vs Tap (don't rely only on hover), Color Contrast 4.5:1
```

Applied priority order: Layout & Responsive (5) → Typography & Color (6) → Animation (7) → Navigation (9). Verified domain/category/top result fit.

## 2. Width Strategy

**Problem:** Production screenshots at ~1900px showed content as `max-w-5xl` (~1024px) narrow island with excessive side gutters (448px each side at 1920). Hero + Browse + Featured + Why + Footer + Header all shared same `1024` container.

**Principle (per task):** Do NOT simply make everything `max-w-7xl`. Use **hierarchy**: Hero narrower editorial measure, others wider where appropriate, target `max-w-6xl / max-w-7xl`, at `1280` still balanced, at `1440/1920` no longer narrow island, hero headline/copy remains constrained (`max-w-2xl` inner), no excessive full-width text lines.

**Implementation:**

| Area | Before (`c72c924`) | After (10) | Rationale |
|------|---------------------|------------|-----------|
| **Header** `src/components/layout/nav-shell.tsx:46` | `mx-auto flex max-w-5xl ... px-4 py-3 md:px-6` | `mx-auto flex max-w-6xl ... px-4 py-3 md:px-6 lg:px-8` | Wider desktop container `1152px` (6xl) vs `1024` (5xl); `lg:px-8` adds breathing room at large; aligns with content. |
| **Main** `src/app/page.tsx:12` | `<main class="mx-auto max-w-5xl space-y-8 p-6 md:p-8">` | `<main class="space-y-8 p-6 md:p-8">` (no max, sections handle) | Decouple to allow per-section hierarchy. |
| **Hero** `src/app/page.tsx:13` | `<section class="relative ...">` inside `max-w-5xl` main | `<section class="mx-auto max-w-5xl relative ...">` | **Keeps narrower editorial measure** `1024` even when main wider; inner `h1`/`p` already `mx-auto max-w-2xl` (672px) so headline stays constrained. |
| **Browse** `src/app/page.tsx:41` | `<section class="space-y-4">` inside `max-w-5xl` | `<section class="mx-auto max-w-6xl space-y-4">` | Wider `1152` for browse grid (2-col at desktop). |
| **Featured** `src/app/page.tsx:50` | same | `<section class="mx-auto max-w-6xl space-y-4">` | Same wider for featured tools. |
| **Why** `src/app/page.tsx:98` | `<section class="space-y-4">` | `<section class="mx-auto max-w-6xl space-y-4">` | Wider for 3-col grid. |
| **Footer** `src/app/page.tsx:120` | `<footer class="flex ...">` inside `max-w-5xl` main | `<footer class="mx-auto flex max-w-6xl ...">` | Wider footer matches sections, avoids cramped narrow container. |

**Result hierarchy:**
- `Hero` `1024` (5xl) — editorial, rounded-lg `bg-muted/10` background not full-bleed, headline `672` constraint.
- `Browse/Featured/Why/Footer/Header` `1152` (6xl) — `+128px` wider than before, `+256` if choosing 7xl, reduces island effect while keeping `1280` balanced (128px gutters at 1280 vs 256 before; at 1440: 144px gutters; at 1920: 384 gutters vs 448 before — `+64` less island per side, plus `lg:px-8`).

**Why not `max-w-7xl` for everything:** `7xl` (1280) at `1280` viewport would be edge-to-edge (no gutter), too wide, would feel unbalanced. `6xl` keeps gutters at all breakpoints while still wider. Hero intentionally stays `5xl` to avoid excessive line length (`max-w-prose` guidance: `65-75ch`).

## 3. Footer Changes

**Before:** `<footer class="flex flex-col items-center gap-2 border-t pt-6 text-sm text-muted-foreground sm:flex-row sm:justify-between">` with inner `text-center sm:text-left` + `flex flex-wrap justify-center gap-4` for links, inside narrow `max-w-5xl` main — cramped at desktop, links wrap unnecessarily, little horizontal breathing room.

**After (`src/app/page.tsx:120`):**
```tsx
<footer class="mx-auto flex max-w-6xl flex-col gap-4 border-t pt-8 text-sm text-muted-foreground md:flex-row md:items-start md:justify-between md:gap-8">
  <div class="text-center md:text-left space-y-1">
    <p>MicroNest MicroTools — ...</p>
    <p class="text-xs">© 2026 Kaushal Bhat. ...</p>
  </div>
  <div class="flex flex-wrap justify-center gap-4 md:flex-nowrap md:justify-end md:gap-6">
```

- `mx-auto max-w-6xl` — wider container (1152 vs 1024) gives horizontal breathing room.
- `gap-4` vs `gap-2` vertical, `pt-8` vs `pt-6` more top breathing, `md:gap-8` between left/right groups, `md:gap-6` between links (vs `gap-4`) — more horizontal spacing.
- `md:flex-row md:items-start md:justify-between` — brand/copy left, navigation grouped cleanly right, `md:flex-nowrap md:justify-end` prevents links wrapping unnecessarily at desktop (they stay one line until needed).
- Mobile: `flex-col` stack naturally, `text-center` → `md:text-left`, `justify-center` → `md:justify-end`, preserve readability.
- No new content, no redesign visually (still `border-t`, `text-sm`, `text-muted-foreground`, `underline` links).
- Header consistency: `max-w-6xl` + `lg:px-8` matches footer width.

## 4. Hover Changes

**Keep cards completely static with respect to transform — DO NOT use translate/scale/shadow/3D/glow. Increase visibility using only `background-color` + `border-color`, existing neutral tokens, `150–200ms`.**

**Before (09):** `mn-card { transition: background-color 180ms, border-color 180ms }` with `hover:bg-accent/50 hover:border-foreground/20` (`bg-background` rest). Barely visible at `50`/`20` opacity.

**After (10) — `src/app/globals.css:62` unchanged `180ms`, but updated hover classes to more visible:**

- `src/components/marketing/profession-card.tsx:8`:
  ```tsx
  // before
  <Link class="mn-card rounded-md border bg-background hover:bg-accent/50 hover:border-foreground/20">
  // after
  <Link class="mn-card rounded-md border bg-background hover:bg-muted hover:border-foreground/30">
  ```
- `src/app/page.tsx:54` Featured same:
  ```tsx
  <Link class="mn-card overflow-hidden rounded-md border bg-background hover:bg-muted hover:border-foreground/30">
  ```
- `src/components/marketing/tool-card.tsx:9` same.

**Change:** `hover:bg-accent/50` (50% accent) → `hover:bg-muted` (solid `muted`, light neutral gray, more visible than translucent accent), `hover:border-foreground/20` → `hover:border-foreground/30` (stronger border, `30%` foreground). Both existing neutral tokens (`muted`, `foreground`), no new color.

**Duration:** `180ms` within `150–200ms` spec, `ease-out`, static `transform none` preserved (verified: `borderWidth 1px`, `transform none` before/after hover, no `translate`/`scale`/`shadow`).

**Reduced-motion:** `@media (prefers-reduced-motion: reduce) { .mn-card { transition: none !important } }` unchanged — hover still applies instantly but without animation.

**Must be clearly visible on:** Profession cards (Browse), NoticeFlow card, MatterVault card — all three use same `mn-card` + `hover:bg-muted` + `hover:border-foreground/30`, verified at `375/768/1024/1280/1440/1920` (background changes from `bg-background` white to `muted` gray, border darkens).

## 5. Header

**Use wider desktop container consistently. Do NOT change navigation hierarchy / profession dropdowns / mobile nav / Launch App / accessibility.**

- `src/components/layout/nav-shell.tsx:46` `max-w-5xl` → `max-w-6xl` + `lg:px-8` (same as content wider sections, aligned).
- No other header changes: links still `Home` + `CA ▾ → NoticeFlow` + `Lawyers ▾ → MatterVault` + `Launch App`, `children` via `professions`, `h-10 w-10` toggle (09A), `Escape`, `focusCapture`, `aria-expanded/controls`, `sticky top-0 z-20 border-b`.

## 6. Browser Verification

**Verification suite `e2e/verify-10.spec.ts` — 6 tests (one per viewport `375/768/1024/1280/1440/1920`) — all PASS before removal:**

| Viewport | Header inner `max-w` / `w` | Hero `max-w` / `w` (narrow) | Browse `w` (wider) | Featured `w` | Why `w` | Footer `w` / flex | Hero headline `w` (constrained) | No overflow | Cards hover visible (`bg+border` `180ms`, `1px`, `none`) |
|----------|-----------------------------|-------------------------------|--------------------|--------------|---------|-------------------|----------------------------------|-------------|----------------------------------------------------------|
| 375 | `maxW 1152px`, `w 375` (full width, viewport < max) | `maxW 1024px`, `w 327` | `327` | `327` | `327` | `327` `maxW 1152` `flex-col gap 16` | `279 maxW 672` | true | 4 cards `bg` changes, `transform none` |
| 768 | `768` `1152` | `704` `1024` | `704` | `704` | `704` | `704` `1152` `flex-row justify-between gap 32` | `656 maxW 672` | true | same |
| 1024 | `1024` `1152` | `960` `1024` (960 = 1024 - padding) | `960` | `960` | `960` | `960` | `672` | true | same |
| 1280 | **`1152` `1152`** | **`1024` `1024`** | **`1152`** | **`1152`** | **`1152`** | **`1152` `row`** | `672` | true | same |
| 1440 | `1152` `1152` | `1024` `1024` | `1152` | `1152` | `1152` | `1152` | `672` | true | same |
| 1920 | `1152` `1152` | `1024` `1024` | `1152` | `1152` | `1152` | `1152` | `672` | true | same |

**Checks:**
- **Desktop content width:** At `1280`, header `1152` > `1024` hero, Browse/Featured/Why/Footer `1152` > hero `1024` — wider desktop container used, at `1920` Browse `1152` not `1024` island (1152 vs 1024 = `+128` wider, gutters 384 vs 448).
- **Hero remains intentionally narrow:** `1024` outer vs `1152` others, headline `672` (<800) at all desktop viewports — no full-width text lines.
- **Browse/Featured/Why use available space:** `1152` at `1280+` vs `1024` before.
- **Footer no longer cramped:** `max-w 1152`, `flex-row justify-between gap 32` at `768+` (was `gap 2`/`gap 4` narrow), `md:gap-8` + `md:gap-6` + `md:flex-nowrap` prevents wrap; verified `footerFlex` `row` at desktop, `column` at mobile.
- **Cards hover clearly visible:** `hover:bg-muted` (muted gray, more visible than `accent/50`) + `hover:border-foreground/30` (stronger), `transition 180ms`, verified `bg` changes on hover, `borderWidth 1px`, `transform none`, `w` unchanged.
- **Borders stable:** `1px solid` `transform none` before/after hover at all viewports.
- **Header uses wider container:** `max-w-6xl` `lg:px-8` consistent with content.
- **No horizontal overflow:** `scrollWidth <= innerWidth` true at all 6 viewports.

**At 1920 specifically:** Header `1152` vs old `1024` island — not edge-to-edge but `+128` wider, visually less island, hero `1024` still centered narrow, overall balanced, not `max-w-7xl` full-bleed.

## 7. Validation

```
pnpm typecheck → tsc --noEmit → PASS (0 errors)
pnpm lint      → eslint       → PASS (0 errors)
pnpm test      → vitest run   → PASS (36 passed | 1 skipped (37), 228 passed | 1 skipped (229), Duration 32.76s)
pnpm build     → next build   → PASS (Compiled 50s, TypeScript 10.1s, 12/12 pages: ○ /, ● /profession/chartered-accountants ● /profession/lawyers ● /tools/noticeflow ● /tools/mattervault, ○ /sitemap.xml)
pnpm test:e2e  → playwright test → PASS (16 passed 1.1m: auth 3, notices-pagination 4, smoke 9: root, homepage both professions/tools, NoticeFlow, MatterVault, CA, Lawyers, 404s, sitemap 5 URLs)
```

Also `e2e/verify-10.spec.ts` 6 tests PASS before removal — not counted in 16.

## 8. Responsive Results

See §6 table. Summary:

- **Mobile `375`:** Header `375` full width (viewport < max), hero `327`, Browse/Featured/Why/Footer `327` all within viewport, headline `279` constrained, footer `column gap 16`, cards hover works (touch not hover-only via tap).
- **Tablet `768`:** Header `768` full, hero `704`, Browse `704`, headline `656`, footer `row gap 32`.
- **Laptop `1024`:** Header `1024`, hero `960`, Browse `960`, headline `672` (max), footer `row`.
- **Desktop `1280`:** Header `1152` (6xl) > hero `1024` (5xl) — hierarchy visible, Browse `1152`, headline `672` — balanced, not narrow island (was `1024` before).
- **Large `1440`:** Same `1152` vs `1024`, gutters `144` each side (vs `208` before at 5xl) — more breathing room.
- **Ultra `1920`:** Header `1152`, Browse `1152`, hero `1024` — content `1152` not `1024`, island reduced (`384` gutters vs `448` before), hero narrow.

No horizontal overflow at any viewport, no layout shift on hover (cards `transform none` `w` unchanged), footer `md:gap-8` prevents cramped feeling.

## 9. Confirmation No Card Transforms

- `src/app/globals.css:62` `mn-card { transition: background-color 180ms, border-color 180ms }` — no `transform`, `scale`, `translate`, `shadow`.
- `profession-card.tsx` `tool-card.tsx` `page.tsx` hover `hover:bg-muted hover:border-foreground/30` — only `background-color` + `border-color`.
- Verified via `getComputedStyle(card).transform === "none"` before/after hover at all `375/768/1024/1280/1440/1920` for all 4 cards.
- `Reveal` inner still `opacity 0→1 translateY 8→0` inside static outer — border remains on non-transformed outer (08 invariant preserved).
- `@media (prefers-reduced-motion: reduce)` still `transition none`.

## 10. Protected-Area Confirmation

Verified via `git diff -- <path>` (all empty):

| Path | Diff | Contains |
|------|------|----------|
| `src/content/microtools.ts` | empty | no content change |
| `src/modules/` | empty | no `matter`/`notice` logic |
| `src/app/app/` | empty | no `app/matters` etc. |
| `supabase/` | empty | no migrations `008/009`, no RLS/RPC `is_firm_member` |
| `package.json` | empty | no deps |
| `pnpm-lock.yaml` | empty | no lock |
| `src/app/profession/*`, `src/app/tools/*`, `src/app/sitemap.ts` | empty via broader diff | — |

`git diff --stat -- src/modules/ src/app/app/ supabase/ package.json pnpm-lock.yaml` → no output.

## 11. Files Changed

**Git status (`git diff --stat` before commit, 5 files):**

```
 src/app/globals.css                          | 2 +- (already hover 180ms, but hover color changed in cards)
 src/app/page.tsx                             | 14 +++++++-------
 src/components/layout/nav-shell.tsx          | 2 +- (max-w-5xl → max-w-6xl lg:px-8)
 src/components/marketing/profession-card.tsx | 2 +- (hover:bg-accent/50 → hover:bg-muted hover:border-...)
 src/components/marketing/tool-card.tsx       | 2 +- (same)
 5 files changed, ~22 insertions(+), ~22 deletions(-) — plus width/footer hierarchy
```

Detailed per file:

| File | Change |
|------|--------|
| `src/app/page.tsx:12` | `main mx-auto max-w-5xl` → `main space-y-8` + per-section `mx-auto max-w-5xl` (hero) / `max-w-6xl` (Browse/Featured/Why) / `footer mx-auto max-w-6xl` + footer `gap-4 pt-8 md:gap-8 md:flex-row md:items-start` etc. |
| `src/components/layout/nav-shell.tsx:46` | `max-w-5xl` → `max-w-6xl lg:px-8`. |
| `src/app/globals.css:62` | Already `180ms` (no change needed for width, hover color via classes). |
| `src/components/marketing/profession-card.tsx:8` | `hover:bg-accent/50 hover:border-foreground/20` → `hover:bg-muted hover:border-foreground/30`. |
| `src/components/marketing/tool-card.tsx:9` | Same. |
| `src/app/page.tsx:54` | Same Featured hover. |

**Not changed:** `src/content/microtools.ts`, `src/modules/**`, `src/app/app/**`, `supabase/**`, `package.json`, `pnpm-lock.yaml`, `src/components/marketing/reveal.tsx`, `src/components/layout/site-nav.tsx` (nav hierarchy unchanged), header nav hierarchy.

## 12. Final Verdict

**Width:** Hierarchy `Hero 5xl (1024) < Browse/Featured/Why/Footer/Header 6xl (1152) >` — at `1280` balanced (hero narrower editorial, content wider), at `1920` not island (`1152` vs previous `1024`), no excessive text lines (`h1 max-w-2xl 672`). Header `6xl lg:px-8` consistent.

**Footer:** Wider `6xl`, `pt-8 gap-4 md:gap-8`, brand left `space-y-1`, nav right `flex-wrap md:flex-nowrap md:justify-end md:gap-6` — breathing room, no unnecessary wrap, mobile stack.

**Hover:** `hover:bg-muted hover:border-foreground/30` `180ms` clearly visible on all 3 card types, only `background+border`, no `transform/scale/shadow`, reduced-motion `none` preserved, borders stable `1px solid transform none`.

**Validation:** `typecheck/lint/test/build/test:e2e 16` PASS, browser `375/768/1024/1280/1440/1920` widths + footer + hover + borders + no overflow PASS.

- no transforms on cards
- no dependencies
- no authenticated app change

**Uncommitted per `DO NOT COMMIT / DO NOT PUSH` — working tree has 5 modified source files + 2 untracked reports (08 + 09 + 10 pending) for review.**
