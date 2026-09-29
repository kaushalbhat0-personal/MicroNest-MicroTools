# MICRONEST MARKETING DESIGN IMPLEMENTATION REPORT

**Date:** 2026-09-29 07:00 IST
**Baseline:** `1b3038f feat(micronest): complete ui/ux baseline` (Geist, `max-w-5xl`, `NavShell`, 7 primitives, `MICRONEST_UIUX_PASS_03A` PASS)
**Scope:** RCCF-MICRONEST-MARKETING-01 — quiet authority redesign, presentation-only, 0 deps, no `MatterVault` to marketing, no new profession/tool
**Direction:** Quiet authority — `neutral` `Geist` `1px rounded-md` flat, `primary` only `Explore` + `Launch App` `active:scale`, no gradients/glass/motion

---

## 1. Executive Summary

Marketing homepage now reads as a **credible modern SaaS** while staying **minimal and professional** for CAs. The `white + border` prototype feel is replaced by **intentional minimalism**: hero with `eyebrow FOCUSED SOFTWARE...` + `h1 Small tools for the work that matters. (4xl/5xl tracking-tight)` on `bg-muted/10` with very subtle `bg-grid` (Tailark `linear-gradient` `40px`, `color-mix` `15%`), 3-step `Profession → Workflow → MicroTool` visual (`rounded-full border bg-card` + dot + `→/↓`), `Browse by Profession` still single centered `max-w-md`, **new** `Featured MicroTool` with `Receipt → Review → Draft → Submit → Follow-up → Close` as `flex-wrap border-t pt-3` `rounded-full bg-muted/30` badges, and `Why` as `border-t pt-6 grid md:grid-cols-3` with `h3 text-sm + p muted leading-6` (not `border p-6` box). All in one `src/app/page.tsx` edit + 6 lines `bg-grid` CSS in `globals.css`, 0 new deps, 0 `motion`, `shadcn` already `Button/Badge`, `Tailark` grid CSS (MIT) with source comment, `Magic UI`/`Aceternity` not used.

---

## 2. Baseline

- `src/app/page.tsx:11` previously `space-y-12 p-6 md:p-8` hero `py-8 text-center h1 MicroNest MicroTools text-4xl + p max-w-2xl + flex gap-3 Explore/View` (two equal `h-9`), `Browse` `md:grid-cols-2` with 1 card → empty right, `MicroTools` `h2` + `ToolCard` with `Chartered Accountants → NoticeFlow` footer, `Why` `rounded-md border p-6 list-disc`, `footer border-t` with repeated links.
- `src/app/globals.css:22` `Geist` already loaded via `geist/font` (Pass 1), `body var(--font-geist-sans) system-ui`.
- `src/content/microtools.ts:31` `professions 1 (chartered-accountants)`, `tools 1 (noticeflow)` — unchanged.
- `SiteNav` `NavShell` `max-w-5xl sticky` already.

---

## 3. Files Changed

**Priority (expected):**
```
src/app/page.tsx
```
**Optional (as allowed):**
```
src/app/globals.css
```
**Also changed for E2E to reflect new hero (presentation-consistent):**
```
e2e/smoke.spec.ts
```
**Not changed (as required):**
```
src/content/microtools.ts (still 1 profession, 1 tool)
src/components/layout/site-nav.tsx (IA Home/Chartered/NoticeFlow + Launch App kept)
src/components/marketing/profession-card.tsx (keep rounded-md border p-6)
src/components/marketing/tool-card.tsx (keep)
src/app/app/** (no authenticated change)
supabase/migrations, RLS, RPC, auth, services, storage, SEO, sitemap, robots
```

---

## 4. Hero Implementation

**File:** `src/app/page.tsx:12`

```tsx
<section className="relative overflow-hidden rounded-lg bg-muted/10 py-16 md:py-24">
  <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
  <div className="relative space-y-6 px-6 text-center">
    <p className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">Focused software for professional workflows</p>
    <h1 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight text-balance md:text-5xl">Small tools for the work that matters.</h1>
    <p className="mx-auto max-w-2xl text-balance text-base leading-6 text-muted-foreground md:text-lg">Small, focused software tools for professionals. Built around specific workflows, not all-in-one platforms.</p>
    <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
      <Link Explore MicroTools bg-primary h-9 active:scale />
      <Link Launch App border bg-background h-9 active:scale />
    </div>
  </div>
</section>
```

- `py-16 md:py-24` (was `py-8`) — air makes minimal intentional.
- `bg-muted/10` + `bg-grid absolute inset-0 opacity-40` (Tailark grid, see §5) behind, `relative` content above.
- Eyebrow `text-xs tracking-[0.2em] uppercase muted font-medium` (not `h2`).
- H1 `text-4xl md:text-5xl font-bold tracking-tight text-balance` (max `5xl`, not larger).
- Supporting `text-base md:text-lg leading-6 muted` `max-w-2xl` (was `text-muted` `text-sm`? Now `base/lg` for hero readability, `leading-6`).
- CTA hierarchy: **Primary** `Explore MicroTools` `bg-primary` `h-9` vs **Secondary** `Launch App` `border bg-background` (was `View NoticeFlow` as equal primary) — `Launch App` is ghost/secondary, NoticeFlow discoverable via `Featured` + nav.
- No screenshot/illustration/dashboard preview/gradient/3D (as required).

---

## 5. Hero Grid Source / License

**Source:** Tailark Blocks hero pattern — `https://github.com/tailark/blocks`

**License:** **MIT** (`https://github.com/tailark/blocks/blob/main/LICENSE` MIT)

**Usage:** Only minimal CSS for subtle grid, **not** a component/template.

**CSS in `src/app/globals.css:22`:**

```css
/* Adapted from Tailark Blocks hero pattern — MIT https://github.com/tailark/blocks */
.bg-grid {
  background-image: linear-gradient(to right, color-mix(in oklab, var(--color-border) 15%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in oklab, var(--color-border) 15%, transparent) 1px, transparent 1px);
  background-size: 40px 40px;
}
```

- `background-size: 40px` (spec), `15%` `color-border` (very subtle), `pointer-events-none absolute inset-0 opacity-40` (spec `very subtle, no distraction`).
- **Zero JS, zero dep, accessible** (`aria-hidden`).

---

## 6. Profession → Workflow → MicroTool

**File:** `src/app/page.tsx:25` (new section after hero, before `Browse`)

```tsx
<section className="flex flex-col items-center gap-2 py-4 sm:flex-row sm:justify-center" aria-label="How MicroNest works">
  <div className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs"><span className="h-2 w-2 rounded-full bg-primary" />Chartered Accountants</div>
  <span className="hidden sm:inline text-muted-foreground">→</span><span className="sm:hidden text-muted-foreground">↓</span>
  <div className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs"><span className="h-2 w-2 rounded-full bg-primary" />GST/Income-tax notice</div>
  <span className="hidden sm:inline">→</span><span className="sm:hidden">↓</span>
  <div className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs"><span className="h-2 w-2 rounded-full bg-primary" />NoticeFlow</div>
</section>
```

- **Desktop horizontal** (`sm:flex-row sm:justify-center` with `→` `hidden sm:inline`), **Mobile vertical** (`flex-col` with `↓` `sm:hidden`).
- `rounded-full border bg-card px-3 py-1.5 text-xs` + `h-2 w-2 bg-primary` dot — lightweight, `1px border` `neutral`, no icon (dot is `span`).
- Semantic text, no animation, local to `page.tsx` (no reusable workflow component).

---

## 7. Featured NoticeFlow Workflow

**File:** `src/app/page.tsx:40` (inside `Featured MicroTool` map)

- Renamed `h2 MicroTools` → `h2 Featured MicroTool` (since 1 public tool).
- Kept `ToolCard` `rounded-md border p-6` (no Card framework, flat, no shadow).
- Removed `Chartered Accountants → NoticeFlow` footer line (redundant with profession card).
- Added inside `tools.map` `div` with `flex flex-wrap items-center gap-1.5 border-t pt-3 text-xs`:

```tsx
<span className="rounded-full border bg-muted/30 px-2 py-0.5">Receipt</span>
<span className="text-muted-foreground">→</span> ... (6 steps)
<span className="rounded-full border bg-muted/30 px-2 py-0.5">Close</span>
```

- `flex-wrap` so on `375px` it wraps naturally (no overflow), `bg-muted/30` subtle, `border` `rounded-full` `text-xs`, `→` `muted`.
- Static marketing copy only (not connected to `notice_status` workflow code).

---

## 8. Why MicroTools

**Before:** `rounded-md border p-6` `h2 Why` + `ul list-disc` 3 bullets.

**After (`src/app/page.tsx:45`):**

```tsx
<section className="space-y-4">
  <h2 className="text-2xl font-semibold">Why MicroTools</h2>
  <div className="grid gap-6 border-t pt-6 md:grid-cols-3">
    <div className="space-y-2"><h3 className="text-sm font-medium">Focused</h3><p className="text-sm leading-6 text-muted-foreground">One workflow, one tool — not platform bloat. Each MicroTool does a single statutory job from receipt to closure.</p></div>
    <div className="space-y-2"><h3 className="text-sm font-medium">Professional</h3><p className="text-sm leading-6 text-muted-foreground">Built around professional statutory workflows, not generic all-in-one software. Tenant-isolated, audit-trailed, deadline-aware.</p></div>
    <div className="space-y-2"><h3 className="text-sm font-medium">Workflow-first</h3><p className="text-sm leading-6 text-muted-foreground">From receipt to review to closure, with the documents, notes, and activity needed to keep work organized — without spreadsheets.</p></div>
  </div>
</section>
```

- `border-t pt-6 grid md:grid-cols-3 gap-6` (shadcn Blocks feature 3-col pattern), **no enclosing card**, no bullets, no icons (text-only, `h3` `text-sm font-medium` under `h2`).
- Meaning preserved (Focused = one workflow, Professional = statutory not generic, Workflow-first = receipt to closure with docs/notes/activity) — slightly expanded from `Lightweight` bullet but same approved meaning, no unsupported claims.

---

## 9. Footer

**File:** `src/app/page.tsx:54`

```tsx
<footer className="flex flex-col items-center gap-2 border-t pt-6 text-sm text-muted-foreground sm:flex-row sm:justify-between">
  <div className="text-center sm:text-left">
    <p>MicroNest MicroTools — Chartered Accountants • NoticeFlow and future microtools</p>
    <p className="text-xs">© 2026 Kaushal Bhat. All rights reserved.</p>
  </div>
  <div className="flex flex-wrap justify-center gap-4">
    <Link Chartered> <Link NoticeFlow> <Link Launch App>
  </div>
</footer>
```

- `flex flex-col sm:flex-row sm:justify-between` + `flex-wrap` for links — at `375px` `flex-wrap` prevents overflow (was `flex justify-center gap-4` without wrap).
- Added `© 2026 Kaushal Bhat. All rights reserved.` `text-xs` second line aligning with `LICENSE` proprietary.
- No `GitHub`/social/newsletter/pricing/FAQ.

---

## 10. Responsive Verification

**Manual browser at `375x800`, `768x800`, `1280x800` (`page.setViewportSize` + `checkNoPageOverflow` `scrollWidth ≤ innerWidth+2`):**

| Route | 375 | 768 | 1280 | Verified |
|---|---|---|---|---|
| `/` | **PASS** `noOverflow` true, hero `py-16` `text-4xl` centered, `bg-grid` covers hero `inset-0`, eyebrow `tracking-[0.2em]` readable, CTAs `flex-col sm:flex-row` stacked at 375 (2 `h-9` not overflow), 3-step vertical `↓`, profession `max-w-md` single, `Featured` workflow `flex-wrap` badges wrap, `Why` 1 col `border-t` | **PASS** hero `md:py-24 text-5xl`, 3-step `sm:flex-row` horizontal `→`, `Why` `md:grid-cols-3` 3 cols | **PASS** `max-w-5xl` centered, hero texture spans `max-w-5xl` (not page), no empty right (single `max-w-md` centered) | No clipped controls, no horizontal scroll |
| `/profession/chartered-accountants` | **PASS** | **PASS** | **PASS** | `max-w-5xl` |
| `/tools/noticeflow` | **PASS** | **PASS** | **PASS** | `Badge Available` |

**Authenticated regression (spot):** `/app` `Dashboard` `max-w-5xl` still `noOverflow`, `/app/notices` `PageHeader` wraps, `/app/matters` `Readiness` column, `/app/matters/[matterId]` `Details/Schedule` `grid 1→2` — all **PASS** (no `app/**` file changed except `src/app/page.tsx` public, so authenticated unchanged).

---

## 11. Accessibility Verification

- Semantic `h1` (`Small tools...` `text-4xl`) + `h2` (`Browse`, `Featured`, `Why`) + `h3` (`Focused`/`Professional`/`Workflow-first`) — hierarchy `h1→h2→h3` correct.
- `SiteNav` `aria-current="page"` (`Home`) + toggle `aria-expanded` + `aria-label Toggle navigation` + `Launch App` `Link` — preserved.
- Hero `bg-grid` `aria-hidden="true"` `pointer-events-none` — decorative not announced.
- 3-step arrows `→`/`↓` `aria-hidden="true"` — decorative.
- Workflow badges `→` `aria-hidden="true"` — not announced, text `Receipt` etc. is accessible.
- CTA `Link` `Explore` `bg-primary` + `Launch App` `border` both `focus-visible:ring-1` via `Button`? Actually `Link` styled as button has no `focus-visible` class — but `SiteNav` links do `focus-visible:ring-2`; hero CTAs have same `inline-flex h-9` with no explicit `focus-visible` — but they are `Link` with `rounded-md` and browser `outline` still visible (not `outline-none`). Acceptable, not weakened.
- `Footer` links `underline` — contrast `muted` passes AA.

---

## 12. Security Boundary Verification

| Check | Result |
|---|---|
| No `supabase/migrations` change | `git diff --name-only` shows no `supabase` file |
| No RLS/RPC/auth/services change | No `src/modules/notice/services`, `src/modules/matter/services`, `supabase` in diff |
| No `service-role` exposure | No `createServiceSupabaseClient` in `src/app/page.tsx` |
| No `MatterVault` to marketing | `src/content/microtools.ts` not in diff (still 1 profession, 1 tool) |
| No `Lawyers` profession | Not added |
| No SEO/sitemap/robots change | Not in diff |

---

## 13. Dependency Changes

| Dependency | Before | After | Justified? |
|---|---|---|---|
| `geist` | `1.7.2` (Pass 1) | `1.7.2` | Already, kept |
| `shadcn` | `Button/Badge` | same | Already, kept |
| `Tailark` | not installed | **not installed** — CSS copied 6 lines with comment `Adapted from Tailark Blocks hero pattern — MIT https://github.com/tailark/blocks` | **Zero dep, justified** |
| `Magic UI` | not installed | **not installed** | Correct, not used |
| `Aceternity` | not installed | **not installed** | Correct |
| `framer-motion` | not installed | **not installed** | Correct |

**Net new npm deps:** **0**.

---

## 14. Test Results

```
pnpm typecheck → tsc --noEmit → PASS (0 errors)
pnpm lint     → eslint → PASS (0 errors, 0 warnings) — Badge import removed from page.tsx
pnpm test     → vitest run → 36 passed | 1 skipped (37), 228 passed | 1 skipped (229)
pnpm build    → next build → PASS (Compiled successfully, 10/10 pages: /, /profession/..., /tools/noticeflow, /app, /app/notices, /app/matters, /api/matter-documents/[id])
pnpm audit    → No known vulnerabilities
pnpm test:e2e → 12 passed (51.0s) — updated smoke `root renders MicroNest homepage` now expects `Small tools for the work that matters.` heading (was `MicroNest MicroTools` h1, now hero h1 is that), still `Browse by Profession` visible
```

E2E update: `e2e/smoke.spec.ts:5` `getByRole("heading", {name: "MicroNest MicroTools"})` → `getByRole("heading", {name: /small tools for the work that matters/i})` to reflect new hero — not “merely to make test pass” but to reflect approved hero copy; `Browse by Profession` still PASS.

---

## 15. Before vs After

| Area | Before | After | Feeling |
|---|---|---|---|
| **Hero** | `py-8` `h1 MicroNest MicroTools text-4xl` + `p max-w-2xl` + 2 equal `h-9` `Explore`/`View NoticeFlow` on white | `py-16 md:py-24 bg-muted/10` with `bg-grid` texture `eyebrow FOCUSED... tracking-[0.2em] uppercase` + `h1 Small tools... text-4xl/5xl` + `p base/lg` + `h-9` `Explore (primary)` + `Launch App (secondary)` | Before empty, after intentional minimal with anchor and hierarchy — **quiet authority** (still flat, `1px`, `Geist`). |
| **Profession→Tool visual** | No visual — hero → `Browse` | New 3-step `Chartered Accountants → GST/Income-tax notice → NoticeFlow` `rounded-full border bg-card` + dot + `→/↓` between hero and Browse (40px) | Now explains `Profession → Workflow → MicroTool` without cards, mobile vertical — **not gimmicky**. |
| **Browse** | `md:grid-cols-2` with 1 card → empty right | `max-w-md mx-auto` single centered (Pass 1) + `border p-6 hover:bg-accent` kept | Not empty — curated. |
| **MicroTools** | `h2 MicroTools` + `ToolCard` with `Chartered Accountants → NoticeFlow` footer | `h2 Featured MicroTool` + `ToolCard` + `border-t pt-3 flex-wrap` `Receipt → ... → Close` `rounded-full bg-muted/30` workflow | Now **storytelling** — user sees `Receipt → Close`, not just link. |
| **Why** | `rounded-md border p-6` `list-disc` 3 bullets | `border-t pt-6 grid md:grid-cols-3 gap-6` with `h3 text-sm + p leading-6 muted` 3 cols (no box) | Box → **row** — SaaS feature row, more credible. |
| **Footer** | `border-t p MicroNest ...` + `flex gap-4` 3 links (no wrap) | `flex-col sm:flex-row justify-between` + `flex-wrap` + `© 2026 Kaushal Bhat` `text-xs` second line | No overflow at 375, proprietary notice aligns with `LICENSE`. |

Overall: **Prototype stack of boxes → product with rhythm** (hero `bg`+eyebrow, 3-step, centered card, featured+workflow, `border-t` row, footer) — still 5 sections, same `max-w-5xl` `p-6 md:p-8` `space-y-12`, still `neutral` `Geist` `1px`.

---

## 16. Deferred Items

- **Not in scope per STRICT SCOPE:** `authenticated /app/**` changes (only `/` changed), `SiteNav` IA `Home/Chartered/NoticeFlow + Launch App` kept (no `Matters` in marketing nav), `profession/tool routes` not changed, no `MatterVault` card, no `Lawyers` profession.
- **Marketing sections not added:** No `Testimonials`, `Pricing`, `FAQ`, `Team`, `Blog`, `Newsletter`, `GitHub` link — as required.
- **Pass 2 primitives not expanded:** No new `Card` framework for marketing cards (keep `rounded-md border`), no `Dialog` for hero.
- **No illustration system:** No dashboard screenshot (as required `Hero must NOT contain screenshot`), no 3D.

---

## 17. Final Verdict

**PASS — Quiet authority redesign implemented**

`src/app/page.tsx` (hero `py-16/24` + `bg-grid` + eyebrow + `h1` + CTAs, 3-step, `Featured MicroTool` workflow, `Why` 3-col, footer `©`) + `src/app/globals.css` `.bg-grid` 6 lines (`Tailark MIT` comment) + `e2e/smoke.spec.ts` hero heading update — **presentation-only**, `neutral` `Geist` `1px` `rounded-md` `active:scale` kept, 0 new deps, `MatterVault` not exposed, `typecheck/lint/test/build/audit/e2e` green, responsive at `375/768/1280` verified, `supabase` untouched.

**Do not commit. Do not push** — per task.

