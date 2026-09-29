# MICRONEST MARKETING DESIGN IMPLEMENTATION 03 — FEATURED TOOL + WORKFLOW INTEGRATION

**Date:** 2026-09-29 09:00 IST
**Baseline:** `1b3038f feat(micronest): complete ui/ux baseline` + `abf0184 feat(marketing): polish MicroNest quiet authority homepage` (`5c1b41e` responsive `max-w-3xl/4xl` fix)
**Scope:** RCCF-MICRONEST-MARKETING-03 — narrow visual refinement, presentation-only, zero deps, no authenticated/app/backend/migrations change
**Direction:** Quiet authority — `neutral` `Geist` `1px rounded-md` flat, `bg-muted/20` subtle, `active:scale-[0.98]`, no gradients/glass/motion

---

## 1. Baseline

- `src/app/page.tsx:11` after marketing polish: hero `py-16 md:py-24 bg-muted/10` + `bg-grid` + `eyebrow FOCUSED...` + `h1 Small tools... 4xl/5xl` + `p` + `Explore bg-primary / Launch App border` + 3-step `rounded-full border bg-card` + `Browse` `max-w-3xl` (768) `ProfessionCard border p-6` + `Featured` `max-w-4xl` (896) `ToolCard border p-6` + detached `mt-3 border-t workflow` + `Why` `border-t 3-col` + `footer`.
- `ProfessionCard` `rounded-md border p-6 hover:bg-accent` `h3 + p + Badge` — `768×100` ratio 7.6:1 at 1280, feels empty.
- `ToolCard` `Link rounded-md border p-6` with `Chartered Accountants → NoticeFlow` footer line + outside `border-t` workflow = malformed border (gap 12px).

---

## 2. Scope

**Implemented (presentation only):**
- Featured MicroTool structural fix (one complete surface)
- Workflow integration (badges inside card, not detached row)
- Redundant `Chartered Accountants → NoticeFlow` removal
- 3-step `gap-2` → `gap-3 sm:gap-4` and `px-3 py-1.5 text-xs` → `sm:px-4 sm:py-2 sm:text-sm` for stronger desktop anchor
- Profession card decision (deferred `p-6→p-8`)

**Not implemented (per boundaries):**
- No DB/RLS/RPC/services, no `SiteNav` IA change, no `Geist`/`Tailwind` change, no `Button`/`Badge` framework, no `Card` framework, no `framer-motion`, no `Magic UI`/`Aceternity`, no new profession/tool, no marketing sections.

---

## 3. Files Changed

**Only `src/app/page.tsx` (2 sections):**

```diff
- <section flex-col gap-2 py-4 sm:flex-row>
+ <section flex-col gap-3 py-4 sm:flex-row sm:gap-4>
  - <div px-3 py-1.5 text-xs>
  + <div px-3 py-1.5 sm:px-4 sm:py-2 sm:text-sm text-xs>

- <div key={t.slug} className="space-y-0">
-   <ToolCard tool={t} />
-   <div className="mt-3 flex flex-wrap gap-1.5 border-t pt-3">
+ <Link key={t.slug} href={t.href} className="overflow-hidden rounded-md border hover:bg-accent">
+   <div className="p-6">
+     <div className="flex items-center justify-between gap-2"><h3>{t.name}</h3><Badge>{status}</Badge></div>
+     <p className="mt-2 text-sm text-muted-foreground">{t.description}</p>
+   </div>
+   <div className="flex flex-wrap gap-1.5 border-t bg-muted/20 px-6 py-3 text-xs">
```

- Removed `import { ToolCard }` (unused after inline), added `import { Badge }`.
- Kept `ProfessionCard` import for `Browse` (no change, `p-6` kept).
- No `src/components/marketing/profession-card.tsx` change (deferred).
- No `src/app/globals.css` change (grid already).
- No `package.json` change.

**Why only `page.tsx`:** All marketing composition is local to `src/app/page.tsx` — `ToolCard`/`ProfessionCard` are small `Link` primitives, no need for generic `Card` framework. The outer `rounded-md border overflow-hidden` now owns the single visual border, inner `p-6` + `border-t bg-muted/20 px-6 py-3` workflow is inside, no `mt-3` gap.

---

## 4. Featured Tool Structural Fix

**Before:**

```tsx
<div className="space-y-0">
  <ToolCard tool={t} /> // Link rounded-md border p-6 (has bottom border 1px, rounded-b-md)
  <div className="mt-3 flex border-t pt-3"> // border-t 1px, 12px gap above
```

Visual: `Card border` (bottom) → `12px white gap` (`mt-3`) → `border-t` (top) → workflow badges. The `gap` + `border-t` creates **vertical interruption**: card bottom `rounded-md` ends, white gap, then new line. At `896px` desktop, card bottom `rounded` + gap looks malformed, not complete.

**After:**

```tsx
<Link href={t.href} className="overflow-hidden rounded-md border hover:bg-accent">
  <div className="p-6"> // content: h3 + Badge + p (no border)
  </div>
  <div className="border-t bg-muted/20 px-6 py-3 flex flex-wrap"> // workflow: border-t inside outer, bg-muted/20 subtle, px-6 py-3
```

- **ONE outer border** `rounded-md border overflow-hidden` (single `1px` all sides, `rounded-md` corners preserved via `overflow-hidden`).
- **Inside:** `p-6` for content (no border), `border-t` for workflow section (top border is inside outer, `bg-muted/20` subtle, `px-6 py-3` aligns with `p-6` horizontal).
- No `mt-3` gap, no `space-y-0` wrapper, no nested competing borders.

**Result:** At 1280, `featGrid 896` → `featCard 896` (896-0, since outer is grid cell) with `p-6` content + `border-t` workflow inside = **one complete surface** `rounded-md` with workflow visually belonging, not floating.

---

## 5. Workflow Integration

- **Badges:** `span rounded-full border bg-background` (was `bg-muted/30`) — `bg-background` (white) inside `bg-muted/20` section gives subtle contrast, `border` `1px`, `px-2 py-0.5 text-xs`, `→` `text-muted` `text-xs` `aria-hidden`.
- **Layout:** `flex flex-wrap gap-1.5` with `border-t` inside card — at 375, `327px` grid → badges wrap to 2 lines naturally (`Receipt` `Review` `Draft` on first line, `Submit` `Follow-up` `Close` on second); at 1280, `896-48=848` usable, badges `~600` fit **one line** (verified via `getBoundingClientRect` at 1280: workflow container `~840` vs badges `600`).
- **Not six cards:** Workflow remains `Badge` row, not `┌────────┐` per stage, not `bento`, not numbered dashboard.

---

## 6. Redundant Content Removal

**Removed:** `p className="mt-2 text-xs text-muted-foreground">Chartered Accountants → NoticeFlow</p>` that was inside `ToolCard` (and would be duplicated in new inline content).

**Reason:** Page already communicates `Chartered Accountants` (Browse card) → `GST/Income-tax notice` (3-step middle pill) → `NoticeFlow` (featured card `h3`), plus `Browse` section heading. Repeating inside featured card is sparse (1 card, 1 line) and redundant.

**New featured content:** `h3 NoticeFlow + Badge Available` + `p` description `Notice workflow management... without spreadsheets.` + workflow badges → **focus on product description + workflow**, not profession link.

---

## 7. Profession Card Decision

**Audit said:** `Profession card is now technically wide enough (768) but feels like an empty horizontal rectangle (768×100, 7.6:1) — only permitted refinement is `p-6 → p-8` if genuinely still short after featured fix.`

**Decision:** **Keep `p-6` (not `p-8`)** — after measuring at 1280, `profGrid 768` with `ProfessionCard p-6` (24px) + `h3` (18px) + `p` (14px 2 lines) + `Badge` row = `~110px` tall vs `768` wide = **7:1** — still wide, but making it `p-8` (32px) would be `~126px` (6:1) — not materially better, and would make `Browse` `p-8` while `Featured` `p-6` + `border-t` inconsistent (`p-6` content + `py-3` workflow = total `~150px` tall for featured, so `Browse` at `p-6` is actually more similar height to `Featured` content `p-6` alone). Keeping `p-6` keeps `ProfessionCard` and `Featured` content `p-6` aligned.

**No change to `src/components/marketing/profession-card.tsx` (`rounded-md border p-6`)** — correct to keep, `max-w-3xl` already makes it editorial (768 vs previous 448), not empty.

---

## 8. 3-Step Decision

**Current:** `flex flex-col sm:flex-row py-4 gap-2` with `rounded-full border bg-card px-3 py-1.5 text-xs` + `h-2 w-2 bg-primary` dot.

**Change:** `gap-2 → gap-3` (`8→12px`) and at `sm` `gap-4` (`16px`) + `px-3 py-1.5 text-xs → sm:px-4 sm:py-2 sm:text-sm` — makes anchor **stronger at desktop** (from `~460px` total at 960 to `~530px` at 960, 48% → 55% of hero width) while keeping mobile `text-xs` compact.

**Not a diagram framework** — still `flex` with `rounded-full` pills local to `page.tsx`.

---

## 9. Responsive Verification

| Viewport | Main | Hero | ProfGrid | ProfCard | FeatGrid | FeatCard | Why | 3-step | Overflow |
|---|---|---|---|---|---|---|---|---|---|
| 375 | 375 | 327 | 327 | 327 | 327 | 327 | 327 | 327 | false |
| 768 | 768 | 704 | 704 | 704 | 704 | 704 | 704 | 704 | false |
| 1024 | 1024 | 960 | 768 | 768 | 896 | 896 | 960 | 960 | false |
| 1280 | 1024 | 960 | 768 | 768 | 896 | 896 | 960 | 960 | false |
| 1440 | 1024 | 960 | 768 | 768 | 896 | 896 | 960 | 960 | false |

- At 375: `profGrid 327` full, `featGrid 327` full, workflow `flex-wrap` 2 lines, 3-step vertical `↓`, no overflow.
- At 768: `profGrid 704` full, `featGrid 704` full, `Why` `md:grid-cols-3` 3-col `234` each, 3-step `sm:flex-row` horizontal `→`.
- At 1024/1280: `profGrid 768` centered `128px` gutters, `featGrid 896` centered `64px` gutters — **not mobile island**, hero `960` full, `Why` `960` full.

**Visual:** Featured card now **one border** with workflow inside `bg-muted/20`, not gap + detached line — at 1280, `featCard 896` with `p-6` + `border-t` looks complete, `Browse` `768` centered below hero `960` feels proportionate.

---

## 10. Validation Results

```
pnpm typecheck → tsc --noEmit → PASS (0)
pnpm lint → eslint → PASS (0, Badge import now used in page.tsx, no unused)
pnpm test → vitest run → 36 passed | 1 skipped (37) 228 passed | 1 skipped
pnpm build → next build → PASS (Compiled successfully in 30.7s, 10/10 pages)
pnpm audit → No known vulnerabilities
pnpm test:e2e → 12 passed (smoke updated to Small tools... heading + Browse)
```

No new test for marketing workflow (static), but smoke `root renders` still `Browse by Profession` visible.

---

## 11. Regression Results

| Area | Result |
|---|---|
| NoticeFlow `canTransition` | No file in `src/modules/notice` changed (only `src/app/page.tsx` marketing) |
| MatterVault `pending→uploaded→verified` | No `src/modules/matter` file changed (only marketing) |
| Navigation | `SiteNav` `NavShell` `max-w-5xl` `h-10` toggle still, `aria-current`/`aria-expanded` |
| Links | `Explore MicroTools` → `/profession/chartered-accountants`, `Launch App` → `/app`, `ProfessionCard` → `/profession/...`, `Featured` `Link` → `/tools/noticeflow` (same `href` as `ToolCard` `tool.href`) |
| Auth | No `proxy.ts`/`supabase` change |
| Backend | No `supabase/migrations`, `RLS`, `RPC`, `services`, `storage` |

---

## 12. Dependency Changes

| Dep | Before | After | Justified |
|---|---|---|---|
| `geist` | 1.7.2 | 1.7.2 | Kept |
| `tailwindcss` | 4.1.8 | 4.1.8 | Already, `bg-grid` CSS uses `color-mix` |
| `Magic UI` | not installed | not installed | Correct, not used |
| `Aceternity` | not installed | not installed | Correct |

**0 new npm deps.**

---

## 13. Security Impact

| Check | Result |
|---|---|
| `supabase/migrations` | No diff (`git diff --name-only` has no `supabase`) |
| RLS | No |
| RPC | No |
| Auth | No |
| Services | No |
| `MatterVault` business | No `src/modules/matter` change |
| `NoticeFlow` business | No |
| `app/**` authenticated | No `src/app/app/**` change (only `src/app/page.tsx` public) |

---

## 14. Out-of-Scope Items

- `profession-card.tsx` `p-6→p-8` **deferred** (kept `p-6`, ratio 7.6:1 acceptable after `max-w-3xl` fix)
- `Why` `3-col` still plain `h3 + p` (no icon/number) — deferred P2
- `SiteNav` IA, `content/microtools.ts` (still 1/1), `sitemap`/`robots`, `MatterVault` to marketing, `Lawyers`, `pricing`, `testimonials` — all deferred per boundaries

---

## 15. Final Verdict

**PASS** — Featured MicroTool now reads as **one complete `rounded-md border overflow-hidden` surface** (`p-6` content + `border-t bg-muted/20 px-6 py-3` workflow), not `card + gap + border-t` detached. `Chartered → NoticeFlow` redundant line removed, workflow `Receipt → ... → Close` integrated. 3-step `gap-3 sm:gap-4` stronger. Profession card kept `p-6` (768) as editorial, not empty. Responsive 375/768/1024/1280/1440 all `noOverflow` true, desktop `768/896` editorial (75%/87% of `1024`), not mobile island.

