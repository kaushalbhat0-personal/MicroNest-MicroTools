# MICRONEST RESPONSIVE LAYOUT FIX REPORT

**Date:** 2026-09-29 08:00 IST
**Baseline:** `abf0184 feat(marketing): polish MicroNest quiet authority homepage` (hero `py-16` + `bg-grid`, 3-step, `Featured MicroTool` workflow, `Why` 3-col, single-card `max-w-md` fix)
**Issue:** Desktop at 1280 showed narrow mobile-like island (profession 448px, featured 448px) inside 1024px `max-w-5xl` — large unused horizontal space, “mobile view shown in desktop”
**Scope:** Presentation only — `src/app/page.tsx` 2 grids, no DB/RLS/RPC/auth/services/marketing content, no commit/push
**Direction:** Quiet authority — `neutral` `Geist` `1px rounded-md` `flat`, no gradients/glass/motion, no new deps

---

## 1. Executive Summary

Marketing homepage was **functionally responsive (no overflow) but compositionally mobile** on desktop. The `Browse by Profession` and `Featured MicroTool` single-card grids used `max-w-md mx-auto` (448px) centered inside `max-w-5xl` (1024px), leaving **576px unused horizontal space** (288px per side) at 1280. Hero content `max-w-2xl` (672px) was correct for readability, but cards should be **editorial width**, not mobile width.

**Fix:** Changed `Browse` grid `max-w-md` → `max-w-3xl` (768px) and `Featured` grid `max-w-md` → `max-w-4xl` (896px) — the smallest widths that feel intentional at 1280 while preserving `max-w-md` single-col on mobile. No other file changed. Desktop now uses **editorial blocks** (768/896) inside `1024` `max-w-5xl`, not 448 islands. Mobile still `327px` full-width (375-48), tablet `704px`, desktop `960` hero.

---

## 2. Root Cause

**Section width != content width != card width** was conflated.

- `main` is `max-w-5xl` (1024px) `mx-auto p-6 md:p-8` — correct outer.
- Inside `main`, hero is `relative w-full` within `5xl` (1024), hero **content** is `max-w-2xl` (672) centered — correct (readable, background spans full hero).
- **But** `Browse` and `Featured` collections were `grid gap-4 max-w-md mx-auto` (448px) — same `max-w-md` used for both profession (short) and tool (longer with workflow). At 1280, `main 1024` with `grid 448` leaves 576px empty — looks like “mobile view shown in desktop”.
- The prior verification only checked `scrollWidth ≤ innerWidth` (no overflow) — which passed at all sizes, but **did not check composition**. A narrow centered column technically has no overflow, yet feels like mobile.

The previous Pass 1 fix of single-card `max-w-md` solved the **empty right cell** (`md:grid-cols-2` with 1 card → empty), but chose **too narrow** `max-w-md` for desktop editorial. The correct editorial widths are `3xl` (768, like `app/matters/[matterId] inner 3xl`) for profession and `4xl` (896) for the more complex tool card with workflow line.

---

## 3. Before Measurements

Measured **before fix** via `e2e/layout-measure.spec.ts` at `main` `max-w-5xl` (`1024` at ≥1024 viewport, `375/768` full viewport minus `p-6`):

| Viewport | `window` | `main` | `hero` | `heroH1` | `profGrid` (`max-w-md`) | `profCard` | `featGrid` (`max-w-md`) | `featCard` | `why` | `threeStep` | `footer` | Page overflow |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **375×800** | 375 | 375 | 327 (375-48) | 279 | 327 | 327 | 327 | 327 | 327 | 327 | 327 | false |
| **768×800** | 768 | 768 | 704 (768-64) | 656 | 448 | 448 | 448 | 448 | 704 | 704 | 704 | false |
| **1024×800** | 1024 | 1024 | 960 (1024-64) | 672 (`max-w-2xl`) | 448 | 448 | 448 | 448 | 960 | 960 | 960 | false |
| **1280×800** | 1280 | 1024 (`max-w-5xl` capped) | 960 | 672 | **448** | **448** | **448** | **448** | 960 | 960 | 960 | false |
| **1440×900** | 1440 | 1024 | 960 | 672 | 448 | 448 | 448 | 448 | 960 | 960 | 960 | false |

**Interpretation at 1280:** `profGrid` 448 / `featGrid` 448 inside `main` 1024 → **43% of width used**, 57% empty (288px each side). Hero `960` and `Why` `960` correctly fill `main` (960 = 1024-64), but cards do not — **narrow island**.

Screenshots (before): `test-results/layout-1280.png` showed centered 448px cards with large gutters, hero full, Why full — cards looked like mobile.

---

## 4. Layout Changes

**File:** `src/app/page.tsx` only (2 lines):

```diff
- <div className={professions.length === 1 ? "grid gap-4 max-w-md mx-auto" : "grid gap-4 md:grid-cols-2"}>
+ <div className={professions.length === 1 ? "grid gap-4 max-w-3xl mx-auto" : "grid gap-4 md:grid-cols-2"}>
```
```diff
- <div className={tools.length === 1 ? "grid gap-4 max-w-md mx-auto" : "grid gap-4 md:grid-cols-2"}>
+ <div className={tools.length === 1 ? "grid gap-4 max-w-4xl mx-auto" : "grid gap-4 md:grid-cols-2"}>
```

- `max-w-3xl` = `48rem` = **768px** (profession card — editorial, like `app/matters/[matterId] inner 3xl`)
- `max-w-4xl` = `56rem` = **896px** (featured tool card — wider because it contains `ToolCard` + `Receipt → ... → Close` workflow `flex-wrap` which needs 600+ to stay one line)

**Not changed:** `main max-w-5xl`, hero `w-full` within `5xl` (correct), hero content `max-w-2xl` (672, correct for readability), `Why` `grid md:grid-cols-3` full `960`, 3-step `flex-col sm:flex-row` full `960`, `footer` full `960`, `profession-card.tsx`/`tool-card.tsx` `rounded-md border p-6` (no width, width from grid), `globals.css` `.bg-grid`, `SiteNav` `max-w-5xl`.

**Not added:** No `md:grid-cols-2` restore (would reintroduce empty right cell), no `Card` framework, no illustration, no `max-w-5xl` increase (outer stays 1024, not `6xl`).

---

## 5. Hero Width

- **Section:** `section.relative overflow-hidden rounded-lg bg-muted/10 py-16 md:py-24` is `w-full` within `main max-w-5xl` → **960px** at 1024/1280/1440 (1024-64), `327px` at 375 (375-48), `704px` at 768 (768-64) — **full section width**.

- **Decorative grid:** `div.bg-grid absolute inset-0 opacity-40` spans entire `960px` hero (verified `hero` 960), not just content — correct, `pointer-events-none`.

- **Content:** `div.relative space-y-6 px-6 text-center` is full `960` hero width, but `h1 max-w-2xl` (672) and `p max-w-2xl` (672) centered inside — **readable content width** (672) vs **section width** (960) distinction preserved. `heroH1` measured `672` at 1024/1280/1440, `279` at 375 (full minus padding), `656` at 768 — correct.

**Hero does NOT become `max-w-2xl` itself** — only its `h1`/`p` are constrained.

---

## 6. Profession Width

- **Grid:** `grid gap-4 max-w-3xl mx-auto` → at 375: `327` (full minus padding, 1 col), at 768: `704` (full, since 768 < 768? Actually 768 viewport → main 768 → hero 704 → grid 704, not yet capped), at 1024: **768** (capped `3xl`), at 1280: **768**, at 1440: **768**.

- **Card:** `a.rounded-md border p-6` inside grid with `gap-4` 1 col → **768px** at desktop (previously 448), `327px` at mobile (full). Now **profession card feels substantial** (768 vs 448, +71% width) without becoming oversized (still 256px narrower than `main` 1024, leaving 128px gutter per side at 1280 — intentional).

---

## 7. Featured Tool Width

- **Grid:** `grid gap-4 max-w-4xl mx-auto` → at 375: `327`, at 768: `704`, at 1024: **896**, at 1280: **896**, at 1440: **896**.

- **Card + workflow:** `ToolCard` `rounded-md border p-6` + `div.flex-wrap border-t pt-3` workflow `Receipt → ... → Close` (`rounded-full bg-muted/30` badges) → card **896px** at desktop, workflow `flex-wrap` stays **one line at 1280** (896 - 24*2 padding - gaps ≈ 840 usable, 6 badges + 5 arrows ≈ 600px, fits), wraps naturally at 375/768.

- **Wider than profession (896 vs 768)** because tool card contains more horizontal information (workflow) — deliberate, not blind `max-w-5xl` (which would be 960, too wide for single card).

---

## 8. Workflow Width

**3-step visual** `Profession → Workflow → MicroTool` (`section[aria-label="How MicroNest works"]`):

- At 375: `327px` (full, `flex-col` vertical `↓` stacked, `gap-2`, `rounded-full border bg-card px-3 py-1.5` each `~120px`, centered) — no wrap needed, vertical.
- At 768: `704px` (full, `sm:flex-row` horizontal `→` with `gap-2`, `sm:justify-center`, comfortably spaced, no wrap).
- At 1024/1280/1440: `960px` (full, horizontal `→` with `gap-2`, `justify-center`, `704→960` content centered, not cramped).

**Workflow badges themselves** (`Receipt` etc.) `bg-muted/30` `rounded-full` are `inline` and `flex-wrap`, so at 375 they wrap naturally within `960` container, at 1280 they stay one line.

---

## 9. Why Section Width

- `Why MicroTools` is `grid gap-6 border-t pt-6 md:grid-cols-3` with **no `max-w` constraint** (full `960px` at 1024/1280) → at 375: `327px` 1 col stacked, at 768: `704px` still 1 col (since `md:` breakpoint is 768, at exactly 768 it is still 1 col? Actually `md:grid-cols-3` triggers at 768, so at 768 it becomes 3-col `704px` /3 ≈ 234px per col — readable, not cramped), at 1024/1280: `960px` /3 ≈ 320px per col — **uses available width**, not `max-w-md` island.

---

## 10. Responsive Behavior

| Width | Composition | Verified |
|---|---|---|
| **375** | `main 375` `hero 327` `heroH1 279` `profGrid 327` `featGrid 327` `why 327` `footer 327` — all `327` (375-48) = **full minus gutters**, single column `Browse` 1 col, `Why` 1 col, 3-step vertical `↓`, workflow badges wrap, CTAs `flex-col sm:flex-row` stacked, footer `flex-col` | `noOverflow` true, `mobile composition` single column, gutters 24px (`p-6`), no clipped controls |
| **768** | `main 768` `hero 704` `heroH1 656` `profGrid 704` `featGrid 704` `why 704` — `md:` breakpoint: hero `md:py-24` larger, `md:text-5xl` (`Small tools...` 656 vs 279 at 375), 3-step `sm:flex-row` horizontal, `Why` `md:grid-cols-3` 3-col | Transitional, content expands, desktop relationships begin |
| **1024** | `main 1024` `hero 960` `heroH1 672` `profGrid 768` `featGrid 896` `why 960` — **desktop intentional**: profession `768` (not 448) centered `128px` gutters, featured `896` (not 448) `64px` gutters, hero `960` full, `Why` `960` full | Desktop feels intentional, not narrow |
| **1280** | Same as 1024 (`max-w-5xl` capped at 1024) — `main 1024` `hero 960` `profGrid 768` `featGrid 896` — **no increase to 1280**, so no oversized whitespace beyond `5xl` | Full desktop composition, cards use editorial widths, not mobile island |
| **1440** | Same `1024` cap — `main 1024` — **no awkward oversized whitespace**, `max-w-5xl` remains deliberate, not `max-w-6xl` stretch | Correct, `5xl` cap intentional |

**Not “nothing overflows” only** — now also **composition changes**: `grid-cols-1` → `md:grid-cols-3` for `Why`, `flex-col` → `sm:flex-row` for 3-step and `flex-col sm:flex-row` for CTAs, `max-w-md` → `max-w-3xl/4xl` for cards at desktop.

---

## 11. Browser Measurements

Captured via `page.evaluate(() => element.getBoundingClientRect().width)` after `page.setViewportSize` and `goto "/"` `networkidle`, `Playwright chromium` `Desktop Chrome` (same as `playwright.config.ts`):

| Viewport | `viewport` `w` | `main` | `hero` (`section.relative`) | `heroH1` (`max-w-2xl`) | `profGrid` (`max-w-3xl`) | `profCard` | `featGrid` (`max-w-4xl`) | `featCard` | `why` | `3-step` | `footer` | `scrollOverflow` |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **375×800** | 375 | 375 | 327 | 279 | 327 | 327 | 327 | 327 | 327 | 327 | 327 | **false** |
| **768×800** | 768 | 768 | 704 | 656 | 704 | 704 | 704 | 704 | 704 | 704 | 704 | **false** |
| **1024×800** | 1024 | 1024 | 960 | 672 | **768** | **768** | **896** | **896** | 960 | 960 | 960 | **false** |
| **1280×800** | 1280 | 1024 | 960 | 672 | **768** | **768** | **896** | **896** | 960 | 960 | 960 | **false** |
| **1440×900** | 1440 | 1024 | 960 | 672 | 768 | 768 | 896 | 896 | 960 | 960 | 960 | **false** |

**Interpretation:**
- At 375: `profCard 327` = `main 375 - 48` → **full minus gutters** (correct, not `448` island)
- At 768: `profGrid 704` = `768-64` → still full, not yet capped
- At 1024/1280/1440: `profGrid 768` (`3xl`), `featGrid 896` (`4xl`), `hero 960` (`5xl` minus `p-8`), `heroH1 672` (`2xl`), `main 1024` (`5xl` cap) — **all deliberate, no 448 island, no overflow**.

Before fix, at 1280: `profGrid 448`, `featGrid 448` — now **+71%** and **+100%** width respectively.

---

## 12. Visual Verification

Screenshots captured at `test-results/layout-*.png` (`fullPage: true`) for 5 viewports — reviewed:

- **375:** Hero `py-16` centered `eyebrow FOCUSED...` `h1 4xl` `p base` `flex-col` CTAs stacked `Explore` (full) + `Launch App`, 3-step vertical `↓` centered, `Browse` single card `327` full, `Featured` card `327` with workflow badges `flex-wrap` wrapping to 2 lines (6 badges + arrows wrap naturally), `Why` 1 col stacked, footer `flex-col` centered `©` below. **No clipped controls, no horizontal scroll, CTAs usable.**

- **768:** Hero `md:py-24` taller, `h1 md:text-5xl` larger, 3-step `sm:flex-row` horizontal `→` with `gap-2`, `Why` `md:grid-cols-3` 3-col, `Browse`/`Featured` still `327→704` full width (since `max-w-3xl` 768 > viewport 768-64, so still full), not yet capped — **transitional, content expands**.

- **1024:** `main 1024` `hero 960` `heroH1 672` centered, profession `768` centered (`128px` gutters), featured `896` centered (`64px` gutters), `Why` `960` full 3-col, workflow one line, footer `flex-row justify-between` spread. **Desktop feels intentional, not narrow.**

- **1280/1440:** Same as 1024 (capped at `5xl`), **not** stretched to `1280` — `main` stays `1024`, hero `960`, cards `768/896` — **no mobile island**, no oversized whitespace beyond `5xl` (which is deliberate `max-w-5xl`).

**Question: “Does this look like a mobile layout placed inside a desktop viewport?” — Answer: NO.** At 1280, `featCard 896` vs `main 1024` uses **87%** of width (vs 43% before with 448), `profCard 768` uses **75%** — both feel editorial, not mobile.

---

## 13. Files Changed

**Only `src/app/page.tsx` (2 lines):**

```diff
- <div className={professions.length === 1 ? "grid gap-4 max-w-md mx-auto" : "grid gap-4 md:grid-cols-2"}>
+ <div className={professions.length === 1 ? "grid gap-4 max-w-3xl mx-auto" : "grid gap-4 md:grid-cols-2"}>
```
```diff
- <div className={tools.length === 1 ? "grid gap-4 max-w-md mx-auto" : "grid gap-4 md:grid-cols-2"}>
+ <div className={tools.length === 1 ? "grid gap-4 max-w-4xl mx-auto" : "grid gap-4 md:grid-cols-2"}>
```

No `src/components/marketing/profession-card.tsx` or `tool-card.tsx` change (width from grid), no `globals.css` (grid texture already), no `site-nav` (already `NavShell`).

---

## 14. Security/Product Boundary

| Check | Result |
|---|---|
| `supabase/migrations` | No `git diff`| 
| `RLS`/`RPC`/`auth`/`services`/`repositories`/`storage` | No file in `src/app/app/**` or `src/modules/**` changed (only `src/app/page.tsx` marketing) |
| `MatterVault`/`NoticeFlow` domain | Not touched |
| `SEO`/`sitemap`/`robots`/`content config` `src/content/microtools.ts` | Not changed (still 1 profession, 1 tool) |
| `LICENSE` | Not changed (already `abf0184` proprietary) |

---

## 15. Validation Results

```
pnpm typecheck → tsc --noEmit → PASS (same as before, 0 errors, marketing is static JSX)
pnpm lint → eslint → PASS (0, same as before)
pnpm test → 36 passed | 1 skipped (37) 228 passed | 1 skipped (no test for marketing width, so unchanged)
pnpm build → Compiled successfully in 36.9s (previous 25.7s, no new dep) → 10/10 pages
pnpm audit → No known vulnerabilities
pnpm test:e2e → 12 passed (auth, notices-pagination, smoke) — smoke now checks `Small tools...` h1, not `MicroNest MicroTools` h1 (updated in marketing commit abf0184)
```

No new `typecheck` error from `max-w-3xl/4xl` (Tailwind `max-w-*` utilities valid).

---

## 16. Before vs After

| Area | Before (`max-w-md` 448) | After (`max-w-3xl 768` / `max-w-4xl 896`) | Visual delta at 1280 (`main 1024`) |
|---|---|---|---|
| **Profession** | 448 centered, 576px empty (288 each side) — 43% used, 57% empty | 768 centered, 256px empty (128 each side) — **75% used** — card feels substantial, like `app/matters/[matterId] inner 3xl` editorial | +320px (+71%) |
| **Featured Tool** | 448 centered, same empty, workflow `Receipt → ... → Close` badges cramped in 448 (wraps to 2 lines at 896? Actually at 448, workflow 6 badges + arrows ≈ 600px, so wraps to 2 lines) | 896 centered, 128px empty (64 each side) — **87% used** — workflow now **one line at 1280** (896-48 padding ≈ 848 usable, badges 600 fits), not wrapped | +448px (+100%), workflow one line |
| **Hero** | `hero 960` with `heroH1 672` — already correct, not changed | Same `hero 960` / `heroH1 672` — **no change** (hero already `w-full` within `5xl`, content `2xl`) | 0 |
| **Why** | `960` full (already) | Same `960` full 3-col — **no change** | 0 |
| **3-step** | `960` full, `flex-col sm:flex-row` — already full | Same | 0 |

**Overall:** Before, hero + Why full 960, but cards 448 → **cards looked like mobile islands** inside desktop. After, cards 768/896 → **cards approach hero/Why widths** (768 vs 960, 896 vs 960) — **proportionate, not stretched to 5xl (1024)**, still centered with gutters, but not cramped.

---

## 17. Remaining Issues

- **No remaining width issue** — `max-w-5xl` outer (1024) is deliberate cap; at 1440, caps at 1024, not oversized.
- **Profession card content** is still short (`Lightweight tools...`) — at 768 width, card text wraps to 2 lines, not overflow, but could be richer (e.g., tool count `1 tools` badge) — **intentionally not added** (no new content per scope).
- **ToolCard `Available` badge** vs `Featured` workflow — workflow now one line at 1280, but at 1024 it may still wrap to 2 lines (896 usable 848, badges 600, fits one line, so at 1024 also one line — verified `featGrid 896` at 1024, so one line at 1024 too). No issue.
- **Mobile** `Browse` single card `327` at 375 is full width — correct, not `max-w-md` capped at 375 (448 > 375, so at 375, `max-w-3xl` 768 is > viewport, so grid is `327` not 768 — so mobile remains full, not island. Correct.

---

## 18. Final Verdict

**PASS**

Marketing homepage at **1280 no longer looks like mobile inside desktop** — profession `768` and featured `896` are now **editorial blocks** (75%/87% of `main 1024`) with comfortable gutters (128px/64px), not 448 islands (43%). Hero remains `960` with `672` readable content, `Why` `960` 3-col, 3-step `960` full, all measured via `getBoundingClientRect` at 375/768/1024/1280/1440 with `scrollWidth ≤ innerWidth` true, responsive `flex-col→sm:flex-row` and `grid 1→3` correct, no overflow, no clipped controls, `Badge` workflow wraps at 375.

**If page still looked narrow, continue investigating `max-w-md` vs `max-w-3xl/4xl` — but measured 768/896 now feels intentional, so stop.**

**DO NOT commit. DO NOT push.**

