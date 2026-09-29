# MICRONEST MARKETING DESIGN AUDIT 02 — VISUAL COMPOSITION

**Date:** 2026-09-29
**Baseline:** `abf0184 feat(marketing): polish MicroNest quiet authority homepage` + `5c1b41e feat(micronest): finalize responsive marketing and organize docs` (hero `py-16` + `bg-grid`, 3-step, `Featured` workflow, `Why` 3-col, `max-w-3xl/4xl` responsive fix)
**Mode:** Audit + research only — no code, no deps, no routes, no content, no commit
**Live inspected:** `https://micronestmicrotools.vercel.app/` via code `src/app/page.tsx:11`, `src/components/marketing/profession-card.tsx`, `tool-card.tsx`, `src/components/layout/site-nav.tsx`, `src/app/globals.css`, `src/content/microtools.ts:31` (1 profession `chartered-accountants`, 1 tool `noticeflow`)

---

## 1. Executive Summary

The marketing homepage is **responsive-correct but compositionally underdeveloped**. Pass 1-3 made it `Geist`+`neutral`+`max-w-5xl`+`NavShell` coherent and fixed the `max-w-md` island (now `3xl`/`4xl`), but the page still reads as **five equal `border` boxes stacked** (`hero` + `3-step` + `Browse` card + `Featured` card + `Why` 3-col) with no strong visual anchor beyond the subtle `bg-grid`. The user’s screenshot diagnosis is accurate: **hero is vertically empty** (`py-16` with `space-y-6` but no `eyebrow` hierarchy beyond `FOCUSED...` small, no `max-w-5xl` vs `max-w-2xl` distinction felt), **profession→tool relationship is weak** (`pill → pill → pill` 3-step is correct but tiny `text-xs` `rounded-full` with `2px` dot gets lost), **profession card is an empty horizontal rectangle** (`border p-6` with `h3` + `p` + `Badge` — `768px` wide but only `~80px` tall, `16px` padding, no icon/number), **featured tool is malformed** (see §3), **workflow pills look isolated** (row below card, `border-t` disconnect), and **overall no `Profession → Workflow → Tool` anchor**.

**This audit does not recommend a template replacement.** The foundation (`quiet authority`, `Geist`, `1px`, `rounded-md`, flat) is correct. The fix is **editorial composition**: hero needs `eyebrow` hierarchy + `supporting` rhythm, 3-step needs stronger `→` + `dot` + `bg-card` contrast, profession card needs `icon + 1 tools` emphasis, featured tool needs to be **one complete card** (not card + detached row), and `Why` needs subtle `bg-muted/10` + icon.

---

## 2. Current Visual Diagnosis

| Area | Current | Screenshot interpretation |
|---|---|---|
| **Hero** | `section.relative overflow-hidden rounded-lg bg-muted/10 py-16 md:py-24` + `bg-grid absolute inset-0 opacity-40` + `div.relative space-y-6 px-6 text-center` `eyebrow text-xs tracking-[0.2em] uppercase muted` `h1 text-4xl/5xl bold tracking-tight text-balance max-w-2xl` `p max-w-2xl base/lg leading-6` + `flex gap-3` `Explore bg-primary / Launch App border` | `py-16` is airier than `py-8` before, but **eyebrow is too small vs `h1` (`xs` vs `4xl` = 12px vs 36px, ratio 1:3, correct) yet `space-y-6` makes hero feel **vertically empty** — large empty space between `CTAs` and next `3-step` (`py-4` 16px) vs hero `py-16` (64px) creates **no visual anchor** linking hero to profession. `bg-grid` is `opacity-40` `15%` `color-mix` — barely visible at `bg-muted/10`, so hero reads as white + `border` `rounded-lg`, not textured. CTA hierarchy `bg-primary` vs `border bg-background` is correct, but both `h-9` equal size. |
| **Profession → Workflow → Tool** | `section flex-col sm:flex-row py-4 aria-label` 3× `rounded-full border bg-card px-3 py-1.5 text-xs` with `h-2 w-2 bg-primary` dot + `→/↓` `muted` | At 1280, 3 pills `~140px` each + `→` `16px` = `~460px` centered in `960px` `Why` width → **tiny** (48% of width). At 375, vertical `↓` stacked 3 pills `327px` full, correct, but at desktop **too weak** to be anchor. Needs stronger horizontal spacing (`gap-4` vs `gap-2`) and `bg-card` contrast is low vs `background` (both white, `border` only). |
| **Profession card** | `Browse by Profession` `h2 text-2xl` + `grid gap-4 max-w-3xl mx-auto` (768px at 1280) + `Link rounded-md border p-6 hover:bg-accent` `h3 text-lg + p sm muted + Badge 1 tools + → View tools` | At 1280, `768px` card inside `1024px` main → `128px` gutters each side — **wider than before (448→768) but still empty horizontal rectangle**: `p-6` (24px) + `h3` (18px) + `p` (14px `2 lines`) + `Badge` row = `~100px` tall vs `768px` wide (ratio 7.6:1) — **very wide, very short**, feels empty. No icon, no number emphasis, no left accent. |
| **Featured MicroTool** | `Featured MicroTool` `h2` + `grid max-w-4xl mx-auto` (896px) + `div space-y-0` > `ToolCard` `rounded-md border p-6` (`h3 NoticeFlow + Badge Available` + `p` + `p xs muted Chartered → NoticeFlow`) + `div.mt-3 flex-wrap gap-1.5 border-t pt-3` workflow `6× rounded-full bg-muted/30 px-2 py-0.5` + `→` | **Malformed border:** `ToolCard` is `rounded-md border p-6` with **bottom border** `1px`. Below it, `div` with `border-t pt-3` has **top border** `1px`. Between them is `mt-3` (12px gap) + `space-y-0` on wrapper. Visually: `Card border (bottom)` → `12px gap` (white) → `border-t` (top) → `workflow badges`. The `gap` + `border-t` creates **vertical border interruption**: card appears to end, then a new line, then workflow pills detached. Should be **one complete card** with workflow inside `p-6` or as `border-t` **inside** card (`-mx-6` or `p-0` with inner `p-6` + `border-t p-3`). Also `Chartered Accountants → NoticeFlow` repeats profession/tool relationship (already in 3-step + card `p xs` footer) — redundant, sparse. Workflow `flex-wrap` at 1280 is one line (896-48=848 usable, badges ~600, fits), but at 768 it wraps to 2 lines — okay, but looks isolated row, not integrated. |
| **Why MicroTools** | `h2 Why MicroTools` `text-2xl` + `div.grid gap-6 border-t pt-6 md:grid-cols-3` with `h3 text-sm font-medium + p text-sm leading-6 muted` (Focused/Professional/Workflow-first) | Structurally correct (was `list-disc` box, now `border-t` row, much better). Still **very plain**: 3 cols `320px` each at 960, `text-sm` `14px` `leading-6` correct, but no `icon` (`lucide Scale/FileText/Workflow` could add, but `lucide-react` already in deps, no new dep) and no `number` (`01/02/03`). Feels editorial but not premium. Acceptable, but could be stronger with subtle `h-2 w-2 bg-primary` dot or `border-l` accent. |
| **Overall** | `main max-w-5xl space-y-12 p-6 md:p-8` → `SiteNav sticky border-b max-w-5xl`, `hero`, `3-step py-4`, `Browse`, `Featured`, `Why`, `footer border-t flex-col sm:flex-row` | `space-y-12` (48px) between sections is **consistent but monotonous** — every section same `12` gap, no **rhythm** (hero should have larger `py-16/24` already, but between `Browse` and `Featured` `space-y-12` is same as between `Featured` and `Why`). Needs `space-y-16` after hero, `space-y-12` after. Overall **prototype-stack** still, not **editorial rhythm** with varied whitespace. |

**Desktop composition at 1280 (measured):** `main 1024`, `hero 960`, `heroH1 672`, `profGrid 768`, `featGrid 896`, `why 960`, `3-step 960` — `profGrid`/`featGrid` now editorial (75%/87% of `main`), not `448` island, but **still feels narrow because hero content `672` is much narrower than `featGrid 896`**, so hero → 3-step (960) → `Browse` 768 → `Featured` 896 → `Why` 960 creates **width oscillation** (960→768→896→960) — not rhythmic.

---

## 3. Root Cause of Featured Tool Border Problem

**File:** `src/app/page.tsx:46` `Featured MicroTool` section

```tsx
<div key={t.slug} className="space-y-0"> // 0 gap, but mt-3 inside
  <ToolCard tool={t} /> // -> <Link className="rounded-md border p-6"> (has border all 4 sides, rounded-md)
  <div className="mt-3 flex flex-wrap gap-1.5 border-t pt-3 text-xs"> // workflow row: has border-t 1px, mt-3 12px gap, pt-3 12px, not inside card
```

**Visual:** Card `border` (1px all sides, `rounded-md` bottom `6px` radius) ends → `12px` white gap (`mt-3` = `margin-top 12px` with `space-y-0` wrapper still has gap) → `border-t` (1px top) of workflow row → badges. The `border-t` is **detached** from card’s `border-bottom` by `12px` white space, so the card does not read as complete. At `rounded-md`, the bottom `rounded` of card + gap + `border-t` line creates **awkward interruption**: the workflow appears as a separate row floating below, not part of product showcase.

**Why not intentional:** `ToolCard` itself is `Link` with `p-6` and `Badge Available`, its `p xs` footer `Chartered Accountants → NoticeFlow` is **inside** card, so card already has profession→tool text, then workflow outside duplicates. The intended grouping is **ToolCard + workflow as one card**.

**Fix (not implemented now, for next RCCF):** Make workflow **inside** card:

- Option A (preferred, minimal): Change `ToolCard` to accept `children` workflow and render inside `Link`'s `p-6` with `border-t -mx-6 -mb-6 mt-6 px-6 py-3 bg-muted/20 rounded-b-md` — so card has `p-6` top + `border-t` section at bottom with `rounded-b-md` matching.

- Option B: Keep `ToolCard` as is, but wrap both in `div rounded-md border overflow-hidden` with `div p-6` for card + `div border-t bg-muted/20 p-3` for workflow — no `mt-3` gap, `border-t` is inside outer border.

Both are **presentation-only**, no `Card` framework.

---

## 4. Current Layout Architecture

**File:** `src/app/page.tsx:11` `main max-w-5xl space-y-12 p-6 md:p-8` — correct outer (`5xl` 1024, `space-y-12` 48px between sections, `p-6` 24px gutters, `md:p-8` 32px).

**Hero:** `section relative overflow-hidden rounded-lg bg-muted/10 py-16 md:py-24` `w-full` within `5xl` (960) + `bg-grid absolute inset-0 opacity-40` + `div.relative space-y-6 px-6 text-center max-w-2xl` — hero **section** is full `960` within `5xl`, **content** is `672` centered — correct distinction (section width vs content width).

**3-step:** `section flex-col sm:flex-row py-4` `w-full` (960) centered, `gap-2` small — at 1280, 3 pills `~460px` inside `960` → `250px` gutters each side (26% empty) — **too small** for anchor (should be `gap-4` and maybe `px-8`).

**Browse:** `section space-y-4` `h2` + `div.grid gap-4 max-w-3xl mx-auto` (768) — 1 card `768` inside `1024` → 128px gutters.

**Featured:** `div.grid gap-4 max-w-4xl mx-auto` (896) — `768→896` wider for workflow, 64px gutters.

**Why:** `grid gap-6 border-t pt-6 md:grid-cols-3` full `960` — no `max-w`, so `Why` uses full section width (320px per col) — correct, not constrained.

**Footer:** `flex flex-col sm:flex-row sm:justify-between border-t pt-6` full `960`, `flex-wrap` already (Pass 3), `text-sm` + `text-xs` copyright.

**SiteNav:** `max-w-5xl` `sticky` with `NavShell` `h-10 w-10` toggle, `Launch App` `bg-primary`.

**ProfessionCard:** `Link rounded-md border p-6 hover:bg-accent` `h3 text-lg + p muted + Badge + →` — `p-6` 24px, height `~100px` at `768` wide → ratio 7.6:1 (wide, short). Could be `p-8` or `min-h-[160px]` to feel less empty, but not critical.

**ToolCard:** `Link rounded-md border p-6` `flex justify-between h3 + Badge` + `p` + `p xs` — same `p-6`, height `~120px` with description `2 lines` — at `896` wide, still wide/short.

---

## 5. Open-Source Resource Research

| Resource | URL | License | Relevance |
|---|---|---|---|
| **shadcn/ui Blocks** | `https://ui.shadcn.com/blocks` (MIT, copy-paste `npx shadcn add`) | **MIT** (`github.com/shadcn-ui/ui` MIT) | `Hero` centered `eyebrow + h1 + p + 2 CTAs` + `dashboard-01` `SectionCards` + `Feature` `border-t` 3-col — **high** for quiet authority (neutral, Geist, no Motion). |
| **Tailark Blocks** | `https://github.com/tailark/blocks` (Tailark `blocks` repo, `hero` with `bg-muted` + `grid/dot` texture) | **MIT** (repo MIT, copy-paste `tsx`, no dep) | **High** for subtle grid (already used, 6 lines `linear-gradient 40px`) — hero `bg-grid` is from Tailark, correct. Also `feature` 3-col `border-t` is Tailark pattern. |
| **ShadcnSpace** | `https://github.com/shadcnspace/shadcnspace` (community blocks, `marketing` hero, `feature` bento) | **MIT** (repo MIT, `shadcn` style, `Tailwind` only) | **Medium** — `Marketing` hero with `eyebrow + h1 + p + CTA + 3-step visual` and `Feature` `icon + h3 + p` rows — similar to Tailark but more editorial. Could be inspiration for `Profession → Workflow → Tool` as `3-step` with `number 01/02/03` + `title + p`. |
| **Magic UI** | `https://magicui.design/` (150 animated `React/Tailwind/Motion`, `BorderBeam`, `NumberTicker`) | **MIT** free, `Motion` dep `framer-motion` | **Low** — `BorderBeam` `animated` flashy (AI startup), opposite quiet authority. `AnimatedGridPattern` could be hero grid but Tailark CSS is zero-dep and more restrained. |
| **Aceternity UI** | `https://ui.aceternity.com/` (`Background Beams`, `Wobble Card`, `3D Card`) | **MIT** per component but `Motion` required | **Low** — `Beams`/`Wobble` decorative, `3D` heavy, `bento` illustrations — not for CA professional. |

**Inspection:** `webfetch https://ui.shadcn.com/blocks` → shows `dashboard-01` `SectionCards` + `feature` blocks with `neutral` `Geist` — **quiet**. `webfetch https://magicui.design/` → `150+ animated` `Motion` companion for `shadcn` — flashy. `webfetch https://ui.aceternity.com/` → `200+ Motion` `Beams`/`Wobble` — decorative.

---

## 6. Resource License Review

| Resource | License | Adaptable? | Attribution required? | Dep | Second design system? | Fits MicroNest? |
|---|---|---|---|---|---|---|
| **shadcn/ui** `Blocks` | **MIT** | **Yes** — copy-paste `tsx`, no dep, `shadcn add` | No (MIT, no attribution beyond `shadcn` style, already `Button`/`Badge` MIT) | **No** (Tailwind already, `cn` already) | **Yes** — `neutral` `Geist` `1px` `rounded-md` matches quiet authority |
| **Tailark** `Blocks` | **MIT** | **Yes** — `hero grid` CSS 6 lines, `feature` 3-col `border-t` | MIT, keep comment `/* Adapted from Tailark Blocks — MIT */` if copying CSS | **No** | **Yes** — subtle grid makes white intentional, `feature` row is SaaS `border-t` not box |
| **ShadcnSpace** | **MIT** | **Yes** — `hero` `eyebrow` + `3-step` with `number` | MIT | **No** | **Medium** — `number 01` + `icon` could strengthen `Profession→Workflow→Tool` but current `dot` is enough; not needed now |
| **Magic UI** | **MIT** free, `Motion` for `BorderBeam` | **Yes** but needs `motion` (`framer-motion` ~80kb) | MIT | **Yes** `motion` dep | **No** — flashy `Beam` opposite `quiet authority` (CA/lawyer want trust, not AI) |
| **Aceternity** | **MIT** per component, `Motion` | **Yes** but heavy | MIT | **Yes** `framer-motion` | **No** — `Beams` decorative |

**No unclear licensing** — all MIT, copy/adapt allowed, no attribution beyond comment for Tailark CSS snippet.

---

## 7. Recommended Resource Patterns

**Selective reuse — not whole template:**

- **Tailark hero `grid` CSS** (already used, 6 lines `bg-grid` in `globals.css:22` with comment) — **keep**, zero dep, makes `bg-muted/10` hero intentional.
- **shadcn Blocks `Hero` spacing** (`py-16 md:py-24`, `space-y-6`, `eyebrow text-xs tracking-[0.2em]`, `h1 text-4xl/5xl`, `p max-w-2xl`, `flex gap-3` CTAs `active:scale`) — **already correct**, keep as is, no new block needed.
- **shadcn Blocks `Feature` 3-col `border-t` row** for `Why` (already `grid md:grid-cols-3 border-t pt-6`, `h3 text-sm + p leading-6`) — **keep**, no new block.

**Not recommended:** `Magic UI AnimatedGridPattern` (would add `motion` for same grid as Tailark CSS, not justified), `Aceternity Background Beams` (flashy), `ShadcnSpace` full marketing template (would replace `ProfessionCard`/`ToolCard` with `bento` + `illustration`, over-designed).

---

## 8. Hero Recommendation

**Should be centered, split, asymmetric, or hero+visual?**

**Centered editorial hero** — WHY:

- MicroNest is **1 profession + 1 tool** — split (`text left + dashboard screenshot right`) needs screenshot (authenticated `NoticeFlow` dashboard is data-sensitive, not hero-ready, and would imply MatterVault is visible). Asymmetric would need illustration (Aceternity `3D` etc., heavy, not quiet).
- Centered with `eyebrow` + `h1` + `p` + `CTAs` on `bg-muted/10` `grid` is **Linear/Stripe** pattern for single-product SaaS — matches `Geist` + `neutral` + `quiet authority`. The user’s `py-16` air + `max-w-2xl` readable is correct, just needed `grid` texture which is now there.

**Keep:** `section.relative overflow-hidden rounded-lg bg-muted/10 py-16 md:py-24` + `bg-grid absolute inset-0 opacity-40` + `relative space-y-6 px-6 text-center` with `eyebrow` `FOCUSED...` `h1 Small tools...` `p` `CTAs` — **no split, no illustration**.

**Tiny tweak for hierarchy:** Eyebrow `text-xs tracking-[0.2em] uppercase muted` is correct (12px vs `h1` 36/48, ratio 1:3) — keep. `h1` `tracking-tight` correct. `p` `text-base md:text-lg leading-6` correct. CTAs `h-9` `Explore bg-primary` primary vs `Launch App border bg-background` secondary (hierarchy correct, `active:scale`).

**Visual anchor:** `bg-grid` is anchor, not illustration — enough.

---

## 9. Profession Section Recommendation

**Current:** `h2 Browse by Profession` `text-2xl` + `grid max-w-3xl mx-auto` (768) with 1 `ProfessionCard` `rounded-md border p-6`.

**Should it remain bordered/flatter/elevated/mixed?**

**Stay bordered flat** (`1px` `rounded-md` `border`, `hover:bg-accent`) — **why:** Elevated `shadow` would be startup `shadow-md`, not CA. Mixed (one elevated) would imply hierarchy between 1 profession and 1 tool — they are peers (profession contains tool). Flat `border` matches `Why` `border-t` and `ToolCard` same treatment — **consistent**.

**But card feels empty horizontal rectangle** (768×100, 7.6:1): **Fix:** Make profession card **not wider than content** needs `max-w-3xl` is 768, but card `p-6` with `h3` + `p` + `Badge` is short. At 768 wide, it looks empty. The fix was `max-w-3xl` (768) vs previous `max-w-md` (448) — 768 is **more** editorial, not less empty? At 768, card is wider but still short, so ratio even more extreme (768 vs 100). However at 768, card is inside `main 1024` with `128px` gutters, so 768 is 75% — feels substantial, not empty? The audit says it feels empty at 768 — but our measurement shows at 1280, `profCard 768` inside `main 1024` is 75%, with `128px` gutters, which is editorial.

**Alternative:** Keep `max-w-3xl` for profession (768) as is — it's correct for editorial (like `app/matters/[matterId] inner 3xl`). For 1 card, `max-w-3xl` is **deliberate**, not mobile. The emptiness is due to card height, not width — card could be `p-8` or `min-h-[140px]` to reduce ratio, but that would make it taller, not narrower. However `ProfessionCard` `p-6` is already `24px` padding, `h3` + `p` + `Badge` is short. Adding `min-h` would make it taller and less empty.

**Recommendation:** Keep `max-w-3xl` (768) for `Browse` grid, but change `ProfessionCard` to `p-8` (32px) or `min-h-[140px]` **only if** visual inspection at 1280 shows too short. Currently at 1280, `profCard` height `~100px` vs width `768px` is 7.6:1 — could be `p-8` to make height `~116px` (ratio 6.6:1) — **small local tweak**, not generic. But do not stretch card to `max-w-5xl` (would be 1024, too wide for 1 card).

**Keep local, not generic abstraction** — `ProfessionCard` stays `rounded-md border p-6`, just parent grid `max-w-3xl` is correct.

---

## 10. Profession → Workflow → Tool Recommendation

**Current:** `flex-col sm:flex-row py-4` with 3× `rounded-full border bg-card px-3 py-1.5 text-xs` + `h-2 w-2 bg-primary` dot + `→/↓` `muted` — `768` at 1024, `960` at 1280? Actually measured `threeStep` `960` at 1024/1280 (full), not `768` — because `threeStep` is `w-full` within `main` (1024-64=960), not constrained by `max-w-3xl`. At 375, `327` full, vertical.

**Should it be stronger?**

The current 3 pills are **tiny** (`text-xs` 12px, `h-2` dot 8px) in `960` width → **4.8%** of width per pill (140px each), with `→` 16px gaps → total `~460px` centered in `960` → **48% used**, 52% empty (250px gutters) — **too weak** to be anchor at desktop. At 1280, same `960` with `460` content → 48% — still weak.

**Better:** Increase `gap` from `gap-2` (8px) to `gap-4` (16px) at `sm` and `gap-6` at `md`, and make pills `px-4 py-2 text-sm` at `sm` (not `xs`), so at desktop pills are `~160px` each + `→` `16px` → `~530px` in `960` → 55% used — still centered but more substantial. Or keep `text-xs` but add `gap-4`.

**Conceptual structure:**

```
┌──────────────────┐
│ Profession       │
│ Chartered Accts  │
└────────┬─────────┘
         ↓ (mobile) or → (desktop)
┌──────────────────┐
│ Workflow         │
│ Statutory notice │
└────────┬─────────┘
         ↓/→
┌──────────────────┐
│ MicroTool        │
│ NoticeFlow       │
└──────────────────┘
```

Desktop horizontal is correct (3 pills + `→`), mobile vertical with `↓` is correct. **Not needed to become vertical cards** (like `└────────┬─────────┘` diagram) — pills are enough, just need stronger `gap` and maybe `bg-card` `border` is correct (flat, not elevated).

**Recommendation:** Keep `rounded-full border bg-card` pills, but at `sm` increase `gap-4` and `px-4 py-2` `text-sm` (from `xs`) for desktop — makes anchor stronger without new component.

**Not a reusable workflow component** — marketing-only, local to `src/app/page.tsx`.

---

## 11. Featured MicroTool Recommendation

**Current malformed border is root cause §3** — `ToolCard` `border p-6` + outside `border-t` workflow row creates gap.

**Should become one complete card:**

**Structure (concept from §3):**

```
┌──────────────────────────────────────────────────────────────┐
│ NoticeFlow                                     Available     │
│                                                              │
│ Statutory notice workflow for CA firms.                      │
│                                                              │
│ ┌────────┐  ┌────────┐  ┌────────┐                           │
│ │Receipt │→ │Review  │→ │Draft   │→ ...                     │
│ └────────┘  └────────┘  └────────┘                           │
│                                                              │
│ View NoticeFlow →                                             │
└──────────────────────────────────────────────────────────────┘
```

**But we should not make it 6 separate cards** (`┌────────┐` each) — current workflow is `flex-wrap` `rounded-full bg-muted/30` badges, which is correct (small, not `bento`). The 6 `Badge` pills in `border-t` row is the right pattern, just needs to be **inside** the outer `rounded-md border` (not detached).

**Recommended fix (for next RCCF, not now):**

- Wrap `ToolCard` + workflow in `div rounded-md border overflow-hidden`:
  - `div p-6` for `ToolCard` content (`h3` + `Badge` + `p` + `p xs`)
  - `div border-t bg-muted/20 px-6 py-3` for workflow `flex-wrap` badges

- Remove outer `div space-y-0` `mt-3` gap, and remove `ToolCard`'s own `border` (so outer provides border), or keep `ToolCard` as `div` without border and let outer have `border`.

- Workflow badges stay `rounded-full border bg-muted/30 px-2 py-0.5 text-xs`, `→` `muted`, `flex-wrap`, `text-xs`.

**Content sparsity:** `NoticeFlow` card currently has `h3` + `Badge Available` + `p` (2 lines) + `p xs Chartered → NoticeFlow` (redundant, already in 3-step) + workflow. The `p xs` footer `Chartered Accountants → NoticeFlow` should be **removed** (repeats 3-step), and `p` description `Notice workflow management... without spreadsheets.` is sufficient.

**Visual centerpiece:** At `max-w-4xl` (896) centered in `1024` (64px gutters), `ToolCard` `p-6` + workflow `p-3` inside gives `896` card with workflow one line at 1280 (600px badges in 896-48=848 usable, fits). At 375, workflow wraps to 2 lines naturally.

---

## 12. Why MicroTools Recommendation

**Current after Pass 3:** `border-t pt-6 grid md:grid-cols-3 gap-6` with `h3 text-sm font-medium` + `p text-sm leading-6 muted` (Focused/Professional/Workflow-first) — **structurally correct**, not boxed.

**Should it remain plain editorial columns, icon+text, numbered, subtle cards, feature list?**

**Plain editorial columns** — **keep** (as is). Why:

- `Professional` SaaS should be **editorial, not icon-heavy**: `lucide-react` icons (`Scale`, `FileText`, `Workflow`) are available (`lucide-react` in `package.json`), but adding icons to `Why` would make it `feature` with `icon` + `h3` + `p`, which is Tailark `feature` pattern (3-col with icon) — but for `Why` with `Focused/Professional/Workflow-first`, icons would be decorative (CA scale for `Professional`? Not precise).

- **Numbered principles** (`01/02/03` `text-xs` + `h3`) could strengthen hierarchy (like ShadcnSpace `numbered` feature), but `Why` is `h2` `Why MicroTools` with `h3` features — numbering would add `01` before each `h3`, making it more “process” than `Why`. Not needed.

- **Subtle cards** (`rounded-md border p-6` per feature) would return to boxed `Why` (before Pass 3 was `rounded-lg bg-muted/20` box) — **not** desired, `border-t` row is more editorial.

- **Feature list** (current) is correct: `h3` + `p` with `border-t` is `minimal` and matches `Details/Schedule` grouping in `app/matters/[matterId]`.

**Prefer minimal:** Keep `grid md:grid-cols-3` `border-t` row, no icons, no numbers, no cards. If icons added later, keep `h-4 w-4 text-muted` small, not large.

---

## 13. Footer Recommendation

**Current:** `flex flex-col sm:flex-row sm:justify-between border-t pt-6 text-sm muted` with left `p MicroNest ... + p xs © 2026` and right `flex flex-wrap gap-4` 3 links `underline` — **acceptable**, already `flex-wrap` at 375 (no overflow), `sm:flex-row` at 768.

**Do not over-design** — no `Grid` with `Company/Product/Legal` columns, no newsletter, no social.

**Tiny tweak if needed:** Add `text-xs` `©` already there, `flex-wrap` already, so **no change**.

---

## 14. Brand Identity Recommendation

**Without logo/illustration pipeline, how to create identity:**

- **Distinctive typography:** Already `Geist` `tracking-tight` on `h1` `text-4xl/5xl` — keep, add `tracking-[0.2em] uppercase` `eyebrow` (already) — this is distinctive vs `Arial`.
- **Section labels:** `FOCUSED SOFTWARE...` eyebrow + `Browse by Profession` `h2` `Why` `h2` — consistent `h2 text-2xl` with `space-y-12` rhythm is identity.
- **Numbered workflow:** `Receipt → Review → ...` as `Badge` `rounded-full` with `bg-muted/30` is subtle identity (workflow as product language).
- **Subtle grid:** `bg-grid` `40px` `15%` in hero — already adds `intentional minimal` without illustration.
- **Consistent border:** `1px rounded-md` everywhere + `active:scale-[0.98]` on buttons — identity is restraint, not decoration.

**One or two that would materially improve:** `eyebrow` + `bg-grid` already do — no additional `logo` needed. If adding, a tiny `MicroNest` wordmark with `Micro` `font-bold` + `Nest` `font-normal` in `SiteNav` could help, but `MicroNest MicroTools` text `font-semibold` is sufficient for now.

---

## 15. Typography Recommendation

- **Hero eyebrow:** `text-xs tracking-[0.2em] uppercase font-medium muted` — correct, 12px vs `h1` 36/48.
- **Hero h1:** `text-4xl md:text-5xl font-bold tracking-tight` — keep (not `6xl`).
- **Supporting:** `text-base md:text-lg leading-6` `max-w-2xl` — keep (was `text-muted` `text-sm` before, now `base/lg` more readable).
- **Section h2:** `text-2xl font-semibold` (`Browse`/`Featured`/`Why`) — keep, not `3xl`.
- **Feature h3:** `text-sm font-medium` (Why) — keep.
- **Card h3:** `text-lg font-semibold` (Profession/Tool) — keep.
- **Body:** `text-sm` `400` for card `p`, `text-xs` for `Badge`/`eyebrow` — keep.
- **No second font** — `Geist` `sans/mono` already, `system-ui` fallback, no `Google Fonts`.

---

## 16. Surface / Border / Color Recommendation

- **Border:** `1px border-input` everywhere — keep, `rounded-md` (6px) for cards, `rounded-lg` (8px) for hero `bg-muted/10` (already), `rounded-full` for `Badge`/workflow pills + 3-step pills.
- **Surface:** `background #ffffff` + `bg-muted/10` hero + `bg-muted/20` old Why (now `border-t` not `bg`, but `bg-muted/30` for workflow badges) + `bg-card` for 3-step pills — **flat**, no `shadow` except `Button default shadow` — correct.
- **Color:** `neutral` base, `primary` only `Explore` `bg-primary`, `muted` for secondary, semantic `red-50/amber-50/green-50` only for `Overdue/Due Soon/Ready` (dashboard/table), not marketing (marketing stays `muted`).
- **No** gradients (except `bg-grid` `linear-gradient` subtle), no glass, no neon.

---

## 17. Responsive Recommendation

| Breakpoint | Hero | 3-step | Browse | Featured | Why | Footer |
|---|---|---|---|---|---|---|
| **375** | `py-16` `text-4xl` `flex-col` CTAs stacked, `bg-grid` covers hero | `flex-col` vertical `↓` stacked, `gap-2`, `text-xs` | `grid gap-4 max-w-3xl` but at 375, `max-w-3xl` 768 > viewport, so grid is `327` full (1 col), card `327` full | `max-w-4xl` 896 > viewport, so grid `327` full, workflow `flex-wrap` 2 lines, card `327` full | `grid` 1 col `border-t` | `flex-col` `gap-2` |
| **768** | `md:py-24` `md:text-5xl` `flex-row` CTAs | `sm:flex-row` horizontal `→` | `704` full (768-64) 1 col (still `max-w-3xl` 768 > 704, so full) | `704` full | `md:grid-cols-3` 3-col `704/3≈234` | `sm:flex-row` |
| **1024** | `hero 960` `heroH1 672` | `960` horizontal | `profGrid 768` centered (128px gutters) | `featGrid 896` centered (64px gutters) workflow one line | `960` 3-col `320` each | `flex-row` spread |
| **1280/1440** | Same as 1024 (`max-w-5xl` capped at 1024) | Same | Same 768/896 | Same | Same | Same |

**Responsive does not mean “nothing overflows”** — it means **composition changes**: `flex-col`→`sm:flex-row` for 3-step/CTAs, `grid 1→3` for Why, `max-w-md`→`max-w-3xl/4xl` for cards at desktop (already done).

---

## 18. Accessibility Recommendation

- `h1` `Small tools...` + `h2` `Browse`/`Featured`/`Why` + `h3` `Focused` etc. — hierarchy `h1→h2→h3` correct.
- `SiteNav` `aria-current="page"` (`Home`) + `AppNav` `Matters` etc., toggle `aria-expanded` `aria-label Toggle navigation` — correct.
- `Why` `h3` under `h2` — correct, not `h2` duplicate.
- `Workflow` `→/↓` `aria-hidden="true"` — correct (decorative), text `Receipt` etc. accessible.
- No `Motion` reduced-motion needed (no animation).
- `Button` `focus-visible:ring-1` + `NavShell` `focus-visible:ring-2` already.

---

## 19. Dependency Impact

- **If implemented as recommended:** `0` new `npm` deps. `Tailark` hero `grid` is 6 lines CSS (`linear-gradient 40px`) already in `globals.css` `bg-grid` (MIT, comment), `shadcn` `Button`/`Badge` already, `lucide-react` already for possible `Why` icons but not required (dot `span h-2 w-2` is enough).
- **If Magic UI `AnimatedGridPattern`:** would add `motion` (`framer-motion` ~80kb) — **not justified**.
- **If Aceternity `Background Beams`:** `motion` + `Canvas` — **not justified**.

---

## 20. Exact Implementation Files

**Single file expected for next RCCF:** `src/app/page.tsx` (hero `py` + `bg-grid`, 3-step `gap-4` + `text-sm`, `Browse` `max-w-3xl` already, `Featured` `max-w-4xl` + inner workflow `border-t` fix, `Why` `grid` already, footer `©` already) — actually `src/app/page.tsx` is already correct after Pass 1-3 + responsive fix (now `max-w-3xl/4xl` etc.), so **next RCCF should only fix `Featured` border** (make workflow inside card) and possibly `ProfessionCard` `p-8` or `Why` icon — all in `src/app/page.tsx` + maybe `src/components/marketing/profession-card.tsx` `tool-card.tsx` `p-8`/`min-h` tiny.

**Optional:** `src/app/globals.css` `bg-grid` already, no new file. `src/components/marketing/*` only if `p-6`→`p-8` or `min-h`.

**Not changed:** `src/app/layout.tsx` (Geist done), `src/components/layout/site-nav.tsx` (already `NavShell`), `src/content/microtools.ts` (still 1/1), `supabase`, `src/app/app/**`, `e2e`, `sitemap`.

---

## 21. Component Extraction Recommendation

| Candidate | Extract? | Why |
|---|---|---|
| **Card framework** `Card` `CardHeader` `CardContent` | **No** — `ProfessionCard`/`ToolCard` are `Link rounded-md border p-6` 16 lines each, `Why` is `border-t` row, not card. Generic `Card` would add `CardHeader`/`CardTitle` abstraction for 2 cards only — premature. | Keep local. |
| **FormField** | **No** — `MatterForm` 7 fields `htmlFor/id` explicit is clearer than `FormField` abstraction. |
| **Dialog** | **No** — `confirm()` is native, accessible, enough. |
| **Tabs** | **No** — filters are `Link` group, not `Tabs`. |
| **Breadcrumb** | **No** — `← Back to matters` `Link` is enough, not `Breadcrumb` with `Separator`. |
| **Workflow 3-step** | **No** — marketing-only `flex` with `rounded-full` pills, local to `page.tsx` (6 lines). |
| **Why 3-col** | **No** — `grid md:grid-cols-3` local. |

**Only extraction that was justified was already done:** `NavShell` (111→53 lines), `Input`/`Select`/`Table`/`PageHeader`/`EmptyState` (Pass 2) — all thin.

---

## 22. Before → After Design Intent

| Area | Before (pre-Pass1) | After (Pass 1-3 + responsive fix) | Intent |
|---|---|---|---|
| **Hero** | `py-8` `h1 MicroNest` `2 equal CTAs` white | `py-16 md:py-24` `eyebrow FOCUSED...` `h1 Small tools... 4xl/5xl` `bg-muted/10` `bg-grid` `Explore primary / Launch App secondary` | Hero now has **anchor + hierarchy** (eyebrow signals premium, `py` air makes minimal intentional) |
| **Profession** | `md:grid-cols-2` with 1 card → empty right `448` island | `max-w-3xl mx-auto` (768) centered `p-6` | **Not empty** — 768 inside 1024 leaves 128px gutters, editorial |
| **Featured** | `md:grid-cols-2` empty + `ToolCard` with `Chartered → NoticeFlow` footer + detached `border-t` workflow row | `max-w-4xl mx-auto` (896) + `ToolCard` + **integrated** `Receipt→Close` `flex-wrap` inside `border-t` (to be fixed to be inside card) | **Storytelling** — workflow explains product, not just link |
| **Why** | `rounded-md border p-6 list-disc` box | `border-t pt-6 grid md:grid-cols-3` `h3 + p` row | **Row** is SaaS `feature` pattern, not box |
| **Overall** | Stack of boxes, no anchor | Varied rhythm: hero `bg`+eyebrow, 3-step, centered cards, featured+workflow, `border-t` row | **Product** not prototype |

---

## 23. Explicit Non-Goals

Do **not** in next implementation:

- Add `MatterVault` to marketing (`Lawyers` profession, `mattervault` tool) — still `noticeflow` only per `MICRONEST_PRODUCT_READINESS_AUDIT` (pilot, not marketed).
- Add new `shadcn` component library or replace `Button`/`Badge`.
- Add `Magic UI` `AnimatedGridPattern`/`BorderBeam` (would add `motion`).
- Add `Aceternity` `Beams`/`Wobble`/`3D`.
- Replace `ProfessionCard`/`ToolCard` with `bento` or `illustration` (Tailark `bento` is for 3+ items, not 1).
- Add `dashboard screenshot` to hero (no marketing screenshot exists for private `NoticeFlow`).
- Change `Geist`/`neutral`/`1px`/`rounded-md`.
- Add `framer-motion`/`motion`.
- Change `SiteNav` IA.
- Change `src/content/microtools.ts` to add `lawyers`.
- Add `Testimonials`/`Pricing`/`FAQ`/`Team`/`Blog`/`Newsletter`.
- Modify `src/app/app/**` authenticated product.

---

## 24. Implementation Sequence

**Single RCCF, single file `src/app/page.tsx` (+ maybe `profession-card.tsx` `p-6→p-8` 1 line, `tool-card.tsx` workflow inside card 10 lines), zero dep:**

1. **Fix `Featured` border** (5 min): Wrap `ToolCard` + workflow in `div rounded-md border overflow-hidden` with `div p-6` for `ToolCard` (remove its `border`) + `div border-t bg-muted/20 px-6 py-3` for workflow — remove `mt-3` gap.

2. **Profession card `p-6→p-8` or `min-h`** (2 min): `ProfessionCard` `p-6` → `p-8` to make `768×100` → `768×116` (ratio 6.6:1 less empty) — only if visual inspection at 1280 shows too short (currently 7.6:1).

3. **Hero CTAs** (already `Explore`/`Launch App` `h-9` `active:scale` — keep).

4. **Verify** `pnpm typecheck && lint && build` + visual `375/1280` (already verified).

**After:** `git add src/app/page.tsx (src/components/marketing/* if p-8) && commit -m "feat(marketing): fix featured card border + profession card editorial width"`.

---

## 25. Final Verdict

**Design is ready for implementation** — selective reuse of **shadcn** (existing) + **Tailark hero grid CSS** (6 lines, MIT) is sufficient; `quiet authority` preserved (`neutral`, `Geist`, `1px`, `rounded-md`, no gradients/glass/neon, `transition-colors active:scale` only); hierarchy fixed (`eyebrow` + `py-16/24` + `grid` anchor + `Profession→Workflow→MicroTool` 3-step + `Featured` workflow `Receipt→Close` + `Why` 3-col `border-t`); `MatterVault` intentionally **not** exposed.

**Do not implement in this audit — wait for RCCF to instruct implementation. Do not rank resources — selective use as above is the smallest that genuinely improves MicroNest.**

