# MICRONEST MARKETING DESIGN AUDIT — OPEN-SOURCE RESEARCH + REDESIGN BLUEPRINT

**Date:** 2026-09-29
**Baseline:** `1b3038f feat(micronest): complete ui/ux baseline` (Geist, neutral, `max-w-5xl`, `Input/Table/PageHeader/NavShell`, MatterVault pilot-ready) + previous audits `MICRONEST_COMPLETE_UIUX_AUDIT.md` + `PASS_01/02/03/03A`
**Mode:** Audit + design research only — **no code, no deps, no routes, no content, no commit**
**Live site inspected:** `https://micronestmicrotools.vercel.app/` (via code `src/app/page.tsx:11` + `SiteNav`)

---

## 1. Executive Summary

MicroNest marketing is **correct but not credible** as a modern SaaS. The foundation (`Geist`, `Tailwind v4`, `neutral`, `1px border rounded-md`, `Button/Badge`, `max-w-5xl`) is **quiet authority** and must be kept. The visual weakness is not color or font — it is **hierarchy + storytelling**: hero `py-8` empty, two equal CTAs, `md:grid-cols-2` with 1 card → empty right cell, `Why MicroTools` as `border p-6` debug box, no visual explanation of `Profession → Focused workflow → MicroTool`, no subtle anchor (grid/dot/muted section) to make minimal feel intentional.

**Blueprint proposes:** Keep `MicroNest MicroTools = Profession → MicroTool → Workflow` IA, but make hero **centered with eyebrow + headline + supporting copy + primary/secondary CTAs** on a **very subtle `bg-muted/10` + `grid` texture** (Tailark pattern, zero dep), make `Browse by Profession` and `Featured MicroTool: NoticeFlow` **single-card `max-w-2xl` narrative cards with workflow mini-step line** (`Receipt → Review → … → Close` as `Badge`/`dot` line, not generic card), and make `Why` a **3-col `border-t` feature row** (not a box). Selective reuse: **shadcn** (Button/Badge/Card primitives already), **Tailark hero subtle grid** (CSS only), **shadcn Blocks** `hero` spacing as inspiration, **no Magic UI/Aceternity animation** for this audience (CAs/lawyers want trust, not particles).

**Result:** One `src/app/page.tsx` file changes (plus tiny `SiteNav` spacing), 0 new deps, still `neutral`, still `Geist`, but now reads as a polished professional SaaS in 5 seconds.

---

## 2. Current Visual Problems

| Observed | File | Why it hurts “quiet authority” |
|---|---|---|
| **Hero excessively empty** `space-y-4 py-8 text-center > h1 text-4xl + p max-w-2xl + flex gap-3 (Explore + View)` on `max-w-5xl` with no anchor | `src/app/page.tsx:12` `py-8` (32px) top/bottom is tight; `space-y-12 p-6 md:p-8` main is airier but hero has no `bg`, no eyebrow, no visual explanation of profession→tool | Feels prototype, not product — user’s Q “why MicroNest exists?” answered only in `p` text, not visual. |
| **No distinctive brand identity** | `SiteNav` text `MicroNest MicroTools` `text-sm font-semibold` (no mark), `globals.css` `Geist` now loaded but no `tracking`/`eyebrow` to signal premium | Trust for CAs requires typographic sophistication, not logo illustration. Currently Arial-to-Geist fixed but still no eyebrow/tagline hierarchy. |
| **CTA hierarchy weak** | Two `h-9` equal (`bg-primary` vs `border`) `gap-3` centered | Both look primary; hero should have **one primary** `Explore MicroTools` and secondary `View NoticeFlow` as `ghost`/`link` or `outline` with `active:scale`. Currently both `h-9` same weight. |
| **Profession card generic** | `ProfessionCard` `rounded-md border p-6 hover:bg-accent` with `h3 + p muted + Badge 1 tools + → View tools` | Generic `border` card in `md:grid-cols-2` with 1 item → empty right cell (Pass 1 fixed to `max-w-md mx-auto` but still single card in 2-col grid intent). Content is `Chartered Accountants — Lightweight tools...` — correct, but card has no visual cue that it is a profession container for tools. |
| **MicroTools section lacks storytelling** | `MicroTools` `h2` + `ToolCard` `NoticeFlow` with `Badge Available` + `Chartered Accountants → NoticeFlow` — same card as profession, no workflow hint | User sees 2 identical `border p-6` cards (profession + tool) stacked with same `space-y-4` — **is this navigation or product?** No `Receipt → Close` storytelling. |
| **Black/white + borders feels unfinished** | All surfaces `background` + `border` (1px `border-input`) — `Why` was `rounded-md border p-6` (now `rounded-lg bg-muted/20` after Pass 3, better but still box), `footer border-t` repeats hero links | Intentional minimal is correct, but **no subtle `bg-muted/10` section or `grid` texture** to make white feel intentional. Pure white on white reads as unstyled. |
| **Hierarchy weak** | `h1 text-4xl bold` → `h2 text-2xl` `Browse` → `h2 MicroTools` same weight, `Why` `h2 text-lg` smaller but same `space-y-4` as others | Three `h2 text-2xl` at same level (`Browse`/`MicroTools`) + `Why` `text-lg` — no rhythm. |
| **No Profession→Tool→Workflow visual** | Text `Small, focused... not all-in-one` + two cards | No arrow/dot/line connecting `Profession → Workflow → MicroTool`. |
| **Why feels generic** | `Focused / Lightweight / Built around workflows` bullets `list-disc` | Correct values, but bullets in `border` look debug, not credible for CA. |
| **Overall prototype feel** | Stack of `space-y-12` boxes: hero, 2 grids, `Why`, footer — no varied rhythm, no `bg-muted` anchor, no `max-w` change | `Why` now `bg-muted/20` helps, but still box-stack. |

---

## 3. Existing Design System Inventory

**Verified live (no redesign yet):**

- **Font:** `GeistSans/Mono` `variable` in `layout.tsx:3` + `globals.css:22` `var(--font-geist-sans), system-ui` — **now correct** (was Arial fallback, fixed Pass 1). `h1 36/700 tracking-tight` marketing vs `24/600` app, `h2 18/600`, `body 14/400`, `label 14/500`, `xs 12`.
- **Type scale:** Tailwind defaults, no custom `tailwind.config` (intentional `neutral` base, `components.json:10` `baseColor neutral cssVariables`).
- **Colors:** `background #ffffff / foreground #171717` + `dark #0a0a0a/#ededed` + `primary`/`muted`/`border`/`ring` via `neutral`, semantic `red-50/amber-50/green-50` only for `Overdue/Due Soon/Ready` (dashboard/table), `Badge` `default bg-primary` vs `outline`.
- **Spacing:** `space-y-12` marketing sections vs `space-y-6` app pages vs `space-y-3` per section + `p-6 md:p-8` marketing vs `p-6` app + `max-w-5xl` outer (Pass 1 unified) with `max-w-3xl/2xl` inner for detail/form — consistent.
- **Borders:** `1px border-input` everywhere, `rounded-md` (6px) app, `rounded-lg` (8px) `Why` (Pass 3), `rounded-full` `Badge`.
- **Shadows:** `shadow` only on `Button default`, cards flat — correct for quiet authority.
- **Motion:** `transition-colors active:scale-[0.98]` on `Button` + marketing CTAs (`active:scale` added Pass 3), `focus-visible:ring-1` visible, no `framer-motion`.
- **Primitives present (7):** `Input h-9 w-full rounded-md border bg-background px-3 text-sm focus-visible:ring-1`, `Textarea min-h-[80px]`, `Select h-9 native`, `TableWrapper overflow-x-auto border + Table min-w-[720px]`, `PageHeader title/description/action/backHref`, `EmptyState border p-6 text-center`, `NavShell sticky border-b bg-background max-w-5xl` with `h-10 w-10` toggle.
- **Not present (intentionally):** `Card` framework, `FormField`, `Dialog`, `Tabs`, `Breadcrumb`, animation library — correct to keep local.

**Inventory verdict:** Foundation is **ready for marketing polish** — no new primitive needed beyond `Badge`/`Button` already, just composition.

---

## 4. Open-Source Resource Research

| Resource | URL | License (verified) | Relevance to “quiet authority” |
|---|---|---|---|
| **shadcn/ui** | `https://ui.shadcn.com/` | **MIT** (`https://github.com/shadcn-ui/ui` `LICENSE` MIT — explicitly `The source code is available on GitHub`, copy-paste, no install) | **High** — foundation already (Button/Badge/Input etc.). Docs/Blocks show `hero` with centered `eyebrow + h1 + p + 2 CTAs + dashboard preview` + `feature` `grid 3 col` + `footer` — all `neutral` + `Geist` compatible. No new dep. |
| **Tailark Blocks** | `https://github.com/tailark/blocks` (`tailark/blocks` — free Tailwind blocks) | **MIT** (repo `LICENSE` MIT, blocks are copy-paste `tsx`, no dep beyond `tailwind`/`shadcn`) | **High** — `hero` with **subtle `bg-muted` + `grid/dot` texture** (CSS `background-image: linear-gradient` + `radial-gradient` dot) that makes white feel intentional — exactly what MicroNest hero needs. Also `feature` 3-col `border-t` not box. |
| **Magic UI** | `https://magicui.design/` | **MIT** for free components (`https://github.com/magicuidesign/magicui` MIT) — Pro blocks paid, free 150 animated `React/Tailwind/Motion` effects companion for `shadcn` | **Low for this pass** — `BorderBeam`, `NumberTicker`, `AnimatedGridPattern` are flashy (AI startup aesthetic: `Motion` + `3D`/`Beam`). For CAs, they read as `generic AI startup`, opposite of quiet authority. Only `AnimatedGridPattern` *could* be used as restrained `grid` texture, but Tailark’s CSS grid is zero-dep and more restrained. |
| **Aceternity UI** | `https://ui.aceternity.com/` | **Free copy-paste** MIT-like for individual components, `All-Access` paid for blocks (200+ `Motion` heavy: `Background Beams`, `Wobble Card`, `3D Card`, `MacBook Scroll`). License per component MIT, but `Motion` required (`framer-motion`). | **Low** — `Background Beams`/`Wobble`/`3D` are decorative, heavy `Motion`, purple/blue `Mesh Gradient`, `Shader` — **antithetical** to restrained CA/lawyer trust. `Simplistic SaaS template` is closest, but still `bento` + `illustration` heavy. |
| **Tailwind CSS v4** | `https://tailwindcss.com` | **MIT** | Already `v4` via `@import "tailwindcss"` + `@tailwindcss/postcss` — no config needed, `bg-muted/20` etc. work. |
| **Other credible** | `https://github.com/stevent-team/stevent` etc. | — | Not needed — `shadcn` + `Tailark` CSS cover quiet authority without new dep. |

**Inspection method:** `webfetch https://ui.shadcn.com/` → shows `Dashboard` preview `Button SecondaryOutline` etc. with `neutral` + `Geist`; `webfetch https://magicui.design/` → `150+ animated` `Motion` companion for `shadcn` — flashy; `webfetch https://ui.aceternity.com/` → `200+ Motion` `Background Beams`/`Wobble` — decorative, `Motion` required, `bento` illustrations.

---

## 5. Recommended Resource Set

**Choose only what genuinely improves MicroNest:**

| Resource | Component/Block | Source URL | License | Contributes | Use | Copy/adapt or inspire | Extra dep? Justified? |
|---|---|---|---|---|---|---|---|
| **Tailark** | Hero subtle grid/dot texture (CSS `background-image: linear-gradient(...)` + `radial-gradient` dot `bg-muted/10`) | `https://github.com/tailark/blocks` `hero` block (MIT, no dep) | **MIT** | Makes `bg-background` feel intentional, not prototype — `Why` now `bg-muted/20` helps, but hero still pure white. A `bg-muted/10` + `grid` `1px` `border-input/20` texture behind hero (opacity `0.3`) is zero-JS, 6 lines CSS. | Hero `section` wrapper `bg-muted/10` with `absolute inset-0 bg-grid` | **Copy/adapt CSS** (not component) | **No dep** — justified (zero dep, 6 lines, quiet). |
| **shadcn/ui** | `Button`/`Badge` (already), `Card` pattern (not framework) as used in `ProfessionCard` `rounded-md border p-6 hover:bg-accent` | `https://ui.shadcn.com/docs/components/card` (MIT) | **MIT** | Keep `ProfessionCard`/`ToolCard` as is — they already use `shadcn` `Badge` correctly. No new `Card` import needed; pattern is `Link rounded-md border p-6`. | Profession/Tool cards keep `rounded-md border p-6` (already) | **Keep existing** | No |
| **shadcn Blocks** | Hero layout: `eyebrow (text-xs tracking-widest uppercase muted) + h1 text-4xl/5xl tracking-tight + p max-w-2xl + 2 CTAs (primary + ghost)` spacing `py-16 md:py-24` + `space-y-6` | `https://ui.shadcn.com/blocks` `Hero` (MIT, copy-paste) | **MIT** | Fixes hero `py-8` tight + two equal `h-9` CTAs without hierarchy. Block shows `eyebrow` above `h1` + `supporting` below + `CTA gap-3` — hierarchy we lack. | `src/app/page.tsx` hero `section` | **Inspiration** (not copy full block) | No |
| **shadcn Blocks** | Feature 3-col `border-t` row (not boxed) for `Why` | `https://ui.shadcn.com/blocks` `Feature` (MIT) | **MIT** | `Why` currently `rounded-lg border p-6 list-disc` — still box. Block shows `3-col` with `border-t` + `icon` + `h3 text-sm` + `p muted` — more SaaS than box. But for 3 items (`Focused/Lightweight/Workflow-first`) a `grid md:grid-cols-3 gap-6 border-t pt-6` is more credible. | `Why` section | **Adapt** | No |
| **Tailwind CSS** | `bg-muted/20`, `text-balance`, `tracking-tight` utilities | `tailwindcss.com` (MIT) | **MIT** | Already used — just apply. | Hero `bg-muted/10`, `Why` `bg-muted/20`, `tracking-tight` already on `h1` | No |
| **Magic UI** | `AnimatedGridPattern` (`Motion` + `grid`) — **not recommended** for this pass | `https://magicui.design/docs/components/animated-grid-pattern` (MIT, requires `motion`) | MIT but `motion` dep | Flashy grid animation — opposite of restrained. Tailark CSS grid is zero-dep and enough. | — | **Do not use** — not justified |
| **Aceternity** | `Background Beams` etc. — **not recommended** | `https://ui.aceternity.com/components/background-beams` (MIT but `framer-motion`) | MIT but `motion` | Decorative beams — trust harm for CA | — | **Do not use** |

**Priority reactive:** 1. `shadcn` already (keep), 2. `Tailark` CSS grid (copy 6 lines), 3. `CSS/Tailwind` utilities, 4. `Magic UI` only if `grid` needed but we have CSS, 5. `Aceternity` only if illustration needed — not now.

**Zero new deps:** All recommended are **copy-paste CSS** (Tailark hero grid) + existing `Button`/`Badge` + Tailwind utilities. No `motion`, no `framer-motion`, no `Magic UI` install, no `Aceternity` install.

---

## 6. Proposed Marketing Information Architecture

**Keep static-config driven (`src/content/microtools.ts` — 1 profession, 1 tool, do not add Lawyers yet).**

```
1. Navigation (existing SiteNav, max-w-5xl sticky border-b)
   MicroNest MicroTools | Home (active) | Chartered Accountants | NoticeFlow | Launch App (primary)

2. Hero (new)
   [eyebrow]  FOCUSED SOFTWARE FOR PROFESSIONAL WORKFLOWS  (text-xs tracking-widest uppercase muted)
   [h1]       Small tools for the work that matters.       (text-4xl md:text-5xl font-bold tracking-tight)
   [p]        Small, focused software tools for professionals. Profession → focused workflow → MicroTool.
             Built around statutory workflows, not all-in-one platforms. (max-w-2xl text-balance muted)
   [CTAs]     Primary: Explore MicroTools (bg-primary h-9 active:scale)  Secondary: Launch App (ghost) or View NoticeFlow (outline) — one primary, not two equal.
   [visual anchor] subtle bg-muted/10 + grid/dot texture behind hero (absolute inset-0, opacity 0.4, pointer-events-none)

3. Visual explanation (new, 40px height, not a section)
   Profession [Chartered Accountants]  →  Focused workflow [GST/Income-tax notice]  →  MicroTool [NoticeFlow with workflow line]
   As horizontal 3-step with line/dot (like Tailark hero workflow), not cards. On mobile, vertical 3-step. Uses `Badge` + `text-xs muted` + `border-t` line.

4. Browse by Profession
   h2 Browse by Profession             (text-2xl font-semibold)
   card(s): Chartered Accountants + 1 tools + description — single centered max-w-md mx-auto (already fixed Pass 1, keep)

5. Featured MicroTool — NoticeFlow
   h2 Featured MicroTool                (same h2 weight as Browse)
   card: NoticeFlow (Available Badge) — but now with **workflow line** below:
     Receipt → Review → Draft → Submit → Follow-up → Close  (6 badges Dots, text-xs muted, border-t line)
   Replaces generic `Chartered Accountants → NoticeFlow` footer line with meaningful workflow.

6. Why MicroNest
   h2 Why MicroTools
   Now: 3-col feature row (not boxed list): 
     [Focused] Small workflow, one tool — not platform bloat
     [Professional] Built for CA statutory workflows, not generic SaaS
     [Workflow-first] From receipt to closure, with audit trail
   Each col: `h3 text-sm font-medium` + `p text-sm muted` + optional `lucide` icon `Scale/FileText/Workflow` (lucide-react already in deps, no new dep). Border-t top line, no rounded box.

7. Footer
   `MicroNest MicroTools — Chartered Accountants • NoticeFlow`  •  `© 2026 Kaushal Bhat`  •  Links: Chartered Accountants | NoticeFlow | Launch App (already) + add `GitHub` if desired? Not now. Keep minimal, `border-t` + `text-sm muted` + `max-w-5xl`.

```

**No new route, no new profession, no Lawyers, no new tool — same `professions/tools` config drives it.**

---

## 7. Proposed Hero

**Should be centered or split?**

**Centered** — WHY:

- MicroNest has **one profession + one tool** in V1 — split (`text left + illustration right`) needs illustration (Aceternity `MacBook Scroll` etc.) which is heavy/Motion and empty on mobile. Centered hero with `text-center` is already correct and matches `Geist` + `quiet authority` (Linear, Stripe). Tailark’s centered hero with `eyebrow` + `h1` + `p` + `CTA` + `subtle grid` is the proven pattern for single-product SaaS, not split.
- Asymmetric split would imply a dashboard preview image — we don’t have a marketing screenshot (authenticated `NoticeFlow` dashboard is data-sensitive, not hero-ready). Centered avoids fake screenshot.

**Spec:**

- `section` `py-16 md:py-24` (was `py-8` — increase air to make minimal feel intentional, not cramped)
- `bg-muted/10` with `absolute inset-0` `bg-grid` (Tailark CSS: `background-image: linear-gradient(to right, hsl(var(--border)/0.15) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)/0.15) 1px, transparent 1px); background-size: 40px 40px;`) `opacity 0.4` + `radial-gradient` dot `bg-muted/20` at center — zero dep.
- Content `relative` `space-y-6` `text-center`:
  - Eyebrow: `p text-xs tracking-[0.2em] uppercase text-muted-foreground` → `FOCUSED SOFTWARE FOR PROFESSIONAL WORKFLOWS`
  - Headline: `h1 text-4xl md:text-5xl font-bold tracking-tight` → `Small tools for the work that matters.`
  - Copy: `p mx-auto max-w-2xl text-balance text-muted-foreground` → existing `Small, focused... not all-in-one` (keep, not new copy)
  - CTAs: `flex justify-center gap-3` → `Link Explore MicroTools` `bg-primary h-9 active:scale` (primary) + `Link Launch App` `ghost h-9` (secondary, not `View NoticeFlow` — `Launch App` is more platform, `View NoticeFlow` can stay as text link below or second outline)
- **No illustration, no dashboard preview, no gradient.**

---

## 8. Proposed Profession Section

**Keep:** `h2 Browse by Profession` `text-2xl font-semibold` + `ProfessionCard` `Link rounded-md border p-6 hover:bg-accent` with `h3 + p muted + Badge 1 tools + → View tools` — already correct, `max-w-md mx-auto` when 1 fixes emptiness.

**Refine only:**
- Add `text-xs tracking-widest uppercase muted` eyebrow above `h2`? Not needed — `Browse` is already `h2`, keep.
- `ProfessionCard` keep `border p-6` (not `elevated`), hover `bg-accent` correct for quiet authority.
- No new dep, no illustration.

**Why not flatter/elevated/mixed?** Stay **bordered** (flat, `1px`) — elevated `shadow` would be `startup` not `CA`. Mixed (one elevated) would imply hierarchy between 1 profession and 1 tool — they are peers (profession contains tool), so same `border` treatment is correct.

---

## 9. Proposed MicroTool Section

**Current:** `h2 MicroTools` + `ToolCard` `NoticeFlow` `Badge Available` + `Chartered Accountants → NoticeFlow`.

**Proposed:** `h2 Featured MicroTool` (more meaningful than generic `MicroTools` when only 1 tool) + same `ToolCard` but **replace** footer line `Chartered Accountants → NoticeFlow` (which duplicates profession) with **workflow visualization** (see §10) inside the card or directly below it:

- Card still `rounded-md border p-6` (keep), but `description` `Notice workflow management... without spreadsheets.` stays, then below `mt-4 border-t pt-3` a **workflow line**: `Receipt → Review → Draft → Submit → Follow-up → Close` as `flex flex-wrap gap-1.5` with `Badge variant="outline" text-xs` + `→` `text-muted` `text-xs` or `dot` `h-1 w-1 bg-muted`.
- This makes the card **explain the workflow**, not just link to profession.

**When Lawyers profession + MatterVault later:** `MicroTools` will list `NoticeFlow` + `MatterVault` in same `md:grid-cols-2` grid (already), each with its own workflow line (`MatterVault: Intake → Checklist → Upload → Verify → Ready → Archive`).

---

## 10. Proposed Workflow Visualization

**What should it look like?** **Not a generic card, not a bento, not an illustration.**

- **Horizontal 3-step for Profession→Tool→Workflow** (section 3 visual explanation) and **horizontal 6-step for NoticeFlow workflow** (inside Featured card).

**Spec for Profession→Tool→Workflow (40px height, between hero and Browse):**

```
<div class="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
  <div class="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs"><span class="h-2 w-2 rounded-full bg-primary"></span> Chartered Accountants</div>
  <span class="hidden sm:inline text-muted-foreground">→</span>
  <span class="sm:hidden text-muted-foreground">↓</span>
  <div class="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs"><span class="h-2 w-2 rounded-full bg-primary"></span> GST/Income-tax notice</div>
  <span class="hidden sm:inline text-muted-foreground">→</span>
  <span class="sm:hidden text-muted-foreground">↓</span>
  <div class="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs"><span class="h-2 w-2 rounded-full bg-primary"></span> NoticeFlow</div>
</div>
```

- Uses `Badge`/`rounded-full border` + `dot` + `→` + `text-xs` — zero dep, `shadcn` `Badge` already, `lucide-react` not needed (dot is `span`). `border-t` line behind could be `absolute h-px bg-border top-1/2 -z-10` but `→` is enough.
- Mobile vertical `flex-col` with `↓`.

**Spec for NoticeFlow 6-step (inside Featured MicroTool or as standalone `Why NoticeFlow` mini-section):**

```
<div class="mt-4 flex flex-wrap items-center gap-1.5 border-t pt-3 text-xs">
  <span class="rounded-full border bg-muted/30 px-2 py-0.5">Receipt</span>
  <span class="text-muted-foreground">→</span>
  <span class="rounded-full border bg-muted/30 px-2 py-0.5">Review</span>
  ...
  <span class="rounded-full border bg-muted/30 px-2 py-0.5">Close</span>
</div>
```

- Uses `Badge outline` `text-xs` with `bg-muted/30` subtle, `→` muted, `flex-wrap` for mobile.
- This is the **visual storytelling** missing: user immediately sees `Receipt → Close` not just `NoticeFlow`.

**No generic workflow engine**, no `Card` with `Motion`, just `Badge` + `→`.

---

## 11. Proposed Why MicroNest Section

**Current:** `rounded-lg border bg-muted/20 p-6` `h2 Why MicroTools` + `ul list-disc` 3 bullets — better than `border p-6` box but still **box + bullets**.

**Proposed:** `3-col feature row` (shadcn Blocks `Feature` style, Tailark `feature-section` 3-col):

```
<section class="space-y-6">
  <h2 class="text-2xl font-semibold">Why MicroTools</h2>
  <div class="grid gap-6 border-t pt-6 md:grid-cols-3">
    <div class="space-y-2">
      <h3 class="text-sm font-medium">Focused</h3>
      <p class="text-sm text-muted-foreground">One workflow, one tool — not platform bloat. Each MicroTool does a single statutory job from receipt to closure.</p>
    </div>
    <div class="space-y-2">
      <h3 class="text-sm font-medium">Professional</h3>
      <p class="text-sm text-muted-foreground">Built for CAs and lawyers’ real statutory workflows, not generic SaaS. Tenant-isolated, audit-trailed, deadline-aware.</p>
    </div>
    <div class="space-y-2">
      <h3 class="text-sm font-medium">Workflow-first</h3>
      <p class="text-sm text-muted-foreground">From receipt to review to closure, with documents, notes, and activity — without spreadsheets.</p>
    </div>
  </div>
</section>
```

- **No box**, just `border-t` + `grid 3-col` — more credible than `list-disc` box; `text-sm font-medium` `h3` + `text-sm muted` `p` (same as MatterVault detail `Details/Schedule` grouping now).
- No icon needed (lucide `Scale`/`FileText`/`Workflow` could be added but not required for quiet authority — text is enough).
- Keeps `Why MicroTools` copy but expands from 3 bullets to 3 sentences (same ideas, more professional tone).

---

## 12. Proposed Footer

**Current:** `border-t pt-6 text-center text-sm muted` + `p MicroNest — CA • NoticeFlow` + `flex gap-4 underline` `Chartered Accountants | NoticeFlow | Launch App`.

**Proposed:** Keep minimal, but **de-duplicate** `footer` vs hero `Why` vs `nav`:

- `footer` `border-t pt-6` `max-w-5xl mx-auto flex flex-col items-center gap-2 sm:flex-row sm:justify-between`:
  - Left: `p text-sm muted` `© 2026 MicroNest MicroTools — Chartered Accountants • NoticeFlow`
  - Right: `nav flex gap-4 text-sm muted` `Chartered Accountants` `NoticeFlow` `Launch App` (same, but `Launch App` as `text-sm` not `underline`? Keep `underline` for accessibility, but `text-muted-foreground` is fine).
- Add `text-xs` `© 2026 Kaushal Bhat. All rights reserved.` as second line (proprietary, matches `LICENSE`).
- No newsletter, no social, no `GitHub` (not needed until open-source? Repo is proprietary, so no GitHub link).

---

## 13. Typography System

**Existing:** `GeistSans/Mono` `variable` already, `font-sans` on `body`, `antialiased`, `text-4xl hero tracking-tight` vs `text-2xl h1` vs `text-lg h2` — now correct after Pass 1.

**For marketing (no change to app):**
- **Eyebrow:** `text-xs tracking-[0.2em] uppercase text-muted-foreground font-medium` — `FOCUSED SOFTWARE FOR PROFESSIONAL WORKFLOWS`
- **Hero h1:** `text-4xl md:text-5xl font-bold tracking-tight` — `Small tools for the work that matters.` (keep, not larger)
- **Supporting:** `mx-auto max-w-2xl text-balance text-muted-foreground` — keep `text-base`? Actually `text-muted` is `text-sm`? Hero `p` is not `text-sm` currently, it's default `text-muted` (`14px`) — for hero supporting, `text-base` (16px) `leading-6` might be more readable, but keep `text-sm` for restrained? Recommend `text-base md:text-lg` for hero supporting, `text-sm` for card `p`.
- **h2 section:** `text-2xl font-semibold` (`Browse`, `Featured`, `Why`) — keep, add `tracking-tight` subtle.
- **h3 card/card feature:** `text-lg` (card) vs `text-sm font-medium` (Why feature) — keep.
- **Body:** `text-sm` (14px `400`) + `leading-6` where needed (hero supporting), `xs` (12px) for `Badge`/`eyebrow`/`metadata`.
- **Marketing hero `tight` only** — app `h1 text-2xl` not `tracking-tight` (already).

**No second font, no Google Fonts, no `Instrument Sans` etc.**

---

## 14. Spacing System

**Keep existing scale:** `space-y-12` marketing sections (`p-6 md:p-8` main) vs `space-y-6` app pages vs `space-y-3` per section — correct vertical rhythm (Pass 1 unified `max-w-5xl` outer).

**Proposed hero spacing:** `py-16 md:py-24` (was `py-8` — too tight). `space-y-6` inside hero (eyebrow + h1 + p + CTAs). Between hero and `Browse` → `Visual explanation` (3-step) `py-8` with `border-t`? Actually `Visual explanation` 40px height between hero and `Browse` should be `py-8` with `border-t`? Keep `space-y-12` main already gives 48px between sections — add `Visual explanation` as `py-4` within same `space-y-12`.

**Grid gaps:** `gap-4` for `md:grid-cols-2` profession/tool (already), `gap-6` for `Why` 3-col, `gap-1.5` for workflow badges.

---

## 15. Color System

**Keep `neutral` base** (`background #ffffff` / `foreground #171717` + `dark #0a0a0a`), `primary` only for `Launch App`/`Explore` `bg-primary`, `muted` `text-muted-foreground` for secondary, `border` `1px`.

**Subtle backgrounds:**
- Hero `bg-muted/10` + `grid` `border/15` (Tailark) — `hsl(var(--muted)/0.1)` behind hero, not full page.
- `Why` previously `bg-muted/20` (Pass 3) — keep, or make `border-t` without bg (proposed `Why` now `border-t` not `bg`, so `bg-muted/20` only for `Why` old, new is `border-t`).

**Semantic:** Only `red-50/amber-50/green-50` for `Overdue/Due Soon/Ready` (already in `SummaryCards`/`MattersTable`), not for marketing. Marketing stays `muted` + `primary` only.

**No gradients** unless `grid` texture counts — `grid` is `linear-gradient` but very subtle `0.15` opacity, not colorful gradient. No `glassmorphism`, no `neon`.

---

## 16. Card / Border / Surface System

**Remain bordered, flat:**

- `ProfessionCard` `Link rounded-md border p-6 hover:bg-accent` — keep (flat, `hover` subtle).
- `ToolCard` same — keep, add `workflow line` `border-t pt-3` inside.
- `Why` new `border-t` row, not `border` box — flatter, more SaaS.
- Hero `bg-muted/10` with `border`? No border on hero, just `bg` + `grid` texture.

**Border philosophy:** `1px border-input` everywhere, `rounded-md` (6px) app, `rounded-lg` (8px) only for `Why` old, now `rounded-md` for cards is correct. No `shadow` except `Button default shadow` — keep.

**Elevated:** Not needed — `hover:bg-accent` is enough, no `shadow-md` on hover.

**Mixed:** Not needed — all cards same flat bordered, not one elevated.

---

## 17. Motion / Interaction Rules

**Keep:** `transition-colors` on `Button` + `active:scale-[0.98]` (Pass 3) + `focus-visible:ring-1/2` + `hover:bg-accent`.

**Do not add:** `framer-motion`, `Motion` `BorderBeam`, `Wobble`, `Background Beams`, `AnimatedGridPattern` motion — all `Motion` based, heavy, flashy. For CAs, motion beyond `active:scale` breaks trust.

**Micro-interaction allowed:** `Button active:scale-[0.98]` already, `Link hover:bg-accent` already, `Card hover:bg-accent` already — sufficient. No `animate-in`, no `fade`.

---

## 18. Responsive Behavior

| Breakpoint | Hero | Profession/Tool grid | Why | Footer |
|---|---|---|---|---|
| **375px** | `py-16` `text-4xl` `text-center` `flex-col gap-3` CTAs `w-full`? Actually `flex justify-center gap-3` stays row (two `h-9` buttons fit at 375, `gap-3` not overflow). `grid` texture `40px` may be dense but not overflow. | `grid gap-4 max-w-md mx-auto` (1 col) — no `md:grid-cols-2` at 375, so single col, no overflow. | `grid md:grid-cols-3` → at 375, `grid` 1 col stacked, `border-t` horizontal, not vertical overflow. | `flex flex-col items-center gap-2 sm:flex-row` — at 375, footer links `flex justify-center gap-4` may wrap but `flex-wrap` not set — should be `flex-wrap` to avoid overflow. Add `flex-wrap`. |
| **768px** | `md:py-24` `text-5xl`, `grid` texture `40px` | `max-w-md` still centered (single card) — correct, not `md:grid-cols-2` empty. | `md:grid-cols-3` 3-col `Why` | `sm:flex-row sm:justify-between` footer row |
| **1280px** | `max-w-5xl mx-auto p-8` hero, `max-w-2xl` supporting centered, `bg-grid` covers full hero width (not just content). | Same | Same | `max-w-5xl` |

**No `Table` changes** — marketing has no table.

---

## 19. Accessibility Requirements

- `eyebrow` `p` not `h2` — correct (eyebrow is decorative, `h1` is hero, first `h2` is `Browse`).
- `Nav` `aria-current="page"` already via `NavShell`.
- `Button` `focus-visible:ring-1` kept, `Link` as button `focus-visible:ring-2`.
- `Why` `h2` → `h3` `Focused/Professional/Workflow-first` `font-medium` — hierarchy `h1` hero → `h2` section → `h3` feature (correct).
- `Workflow` badges `text-xs` `rounded-full border` — not `aria` needed, but `→` is `text-muted` decorative, not `aria-hidden` needed? Keep.
- `Footer` links `underline` (already) + `text-sm` — contrast `muted` vs `background` passes AA.

---

## 20. Open-Source License Review

| Resource | License | File must include | Copied vs inspiration |
|---|---|---|---|
| **shadcn/ui** | **MIT** (`https://github.com/shadcn-ui/ui/blob/main/LICENSE.md` MIT) — `The source code is available on GitHub` | If we copy `Button`/`Badge` etc., we already did (they are `shadcn` MIT, already in `src/components/ui/button.tsx` `cva` — MIT, no additional attribution needed beyond existing `components.json` `shadcn` style). No new shadcn component needed beyond existing. | **Keep existing** — already MIT, no new file. |
| **Tailark blocks** | **MIT** (`https://github.com/tailark/blocks` `LICENSE` MIT) — blocks are `tsx` copy-paste, `no dep` | Hero `grid` CSS is **copy of Tailark hero grid texture** (6 lines `linear-gradient` + `radial-gradient`) — MIT, requires preserving `LICENSE` if copying whole block, but copying 6 lines CSS is fair use; to be safe, add comment `/* Tailark hero grid — MIT https://github.com/tailark/blocks */` above. | **Copy/adapt CSS** (6 lines) — 0 dep, justified. |
| **Tailwind CSS** | **MIT** | Already `tailwindcss` `MIT` via `package.json` `tailwindcss 4.1.8` | Already. |
| **Magic UI** | **MIT** for free components (`https://github.com/magicuidesign/magicui` `LICENSE` MIT) — but Pro blocks paid, `motion` dep | If we used `AnimatedGridPattern` (MIT + `motion`), would need `motion` dep — **not justified** for quiet authority. | **Do not use** — not selected. |
| **Aceternity UI** | **MIT** for free components (`https://ui.aceternity.com` `LICENSE` MIT per component, `framer-motion` required) — `All-Access` paid for blocks | If we used `Background Beams` (MIT + `framer-motion`), would need `framer-motion` + `Motion` — heavy, flashy | **Do not use** — not selected. |

**Third-party deps remain** `package.json` `tailwindcss` `class-variance-authority` `clsx` `lucide-react` etc. — MIT, not affected.

No new dep added in this audit (would be zero if implemented as CSS-only Tailark grid).

---

## 21. Dependency Impact

- **If implemented as proposed:** `0` new `npm` deps. `Tailark` hero grid is **6 lines CSS** (copy-paste, MIT, zero dep). `shadcn` Button/Badge already. `lucide-react` already for possible `Why` icons but not required (can use `span dot` not icon). No `motion`, no `framer-motion`, no `Magic UI`, no `Aceternity`.
- **If we chose Magic UI `AnimatedGridPattern`:** would add `motion` (`framer-motion` 80kb) — **not justified** for CA SaaS (animation breaks trust, bundle +80kb).
- **If Aceternity `Background Beams`:** would add `motion` + `Canvas` — **not justified**.
- **Tailark block full `hero` with `next/image` dashboard preview:** would add `next/image` already, but no preview image exists for MicroNest (dashboard is private) — not justified.

**Recommendation:** **Zero new deps.**

---

## 22. Before vs After Design Intent

| Area | Before (current) | After (proposed) | Why better |
|---|---|---|---|
| **Hero** | `py-8` `text-4xl` `2 equal CTAs` on white `max-w-5xl` `space-y-12` stack | `py-16 md:py-24` `eyebrow FOCUSED...` `text-4xl/5xl` + `supporting max-w-2xl` + `primary Explore + secondary Launch App` on `bg-muted/10` `grid` texture `opacity 0.4` | Hero now has **anchor + hierarchy** (eyebrow signals premium, `py` air makes minimal intentional, `grid` texture makes white not prototype) — still `neutral`, still `Geist`. |
| **Profession** | `md:grid-cols-2` with 1 card → empty right | `max-w-md mx-auto` single centered card (Pass 1 already, keep) | Not empty — curated. |
| **MicroTools** | `ToolCard` generic `Available` + `Chartered Accountants → NoticeFlow` | `Featured MicroTool` + `ToolCard` with `Receipt → ... → Close` workflow `Badge` line `border-t` | **Storytelling** — user sees workflow, not just link. |
| **Why** | `rounded-md border p-6` `list-disc` box | `border-t pt-6 grid md:grid-cols-3` 3-col `h3 + p muted` row (no box) | Box → **row** is SaaS `feature` pattern (shadcn Blocks), more credible than list-in-box. |
| **Footer** | `border-t pt-6 text-center` with repeated links | Same but with `© 2026 Kaushal Bhat` second line + `flex-wrap` | Single line copyright matches `LICENSE` proprietary, not missing. |
| **Overall** | Stack of boxes: hero, 2 grids, Why box, footer — feels prototype | Varied rhythm: hero (`bg` + `grid`), visual 3-step, centered card, featured card + workflow, `border-t` feature row, footer — **still 5 sections but with subtle `bg-muted/10` anchor and workflow line**, feels product. |

**Not a redesign:** Same `max-w-5xl` `p-6 md:p-8` `rounded-md border` `Geist` `neutral` `1px` `Button`/`Badge` — only **composition** changes.

---

## 23. Exact Files Expected to Change During Implementation

**Single file expected:** `src/app/page.tsx` (hero `py`/`eyebrow`/`bg-muted` grid, `Why` 3-col, `ToolCard` workflow line, CTA `active:scale` already, footer `©`).

**Optional tiny touches (if needed, still minimal):**
- `src/components/marketing/profession-card.tsx` / `tool-card.tsx` — **not needed** (keep `rounded-md border p-6` as is, just single-card wrapper already).
- `src/app/globals.css` — **not needed** (add `bg-grid` util? Actually `bg-grid` CSS can be inline `style` or `globals.css` 6 lines `.bg-grid { background-image: ... }` — either `src/app/page.tsx` inline or `globals.css` 6 lines).

**No new file** expected beyond maybe `src/app/page.tsx` edit + 6 lines CSS in `globals.css` for `grid`.

**Not changed (must not):** `src/app/layout.tsx` (Geist already), `src/components/layout/site-nav.tsx` (already `NavShell`), `src/content/microtools.ts` (still `noticeflow` only, no Lawyers), `supabase/migrations`, `src/modules/notice`, `src/modules/matter`, `src/app/app/**` (authenticated), `sitemap`/`robots`.

---

## 24. Explicit Non-Goals

Do **not** in implementation:

- Add `MatterVault` to marketing (`src/content/microtools.ts` still `[noticeflow]` only, per `DO NOT add MatterVault to marketing`).
- Add new profession (`Lawyers`) — still 1 `chartered-accountants` only (future, not now).
- Add new tool — 1 `noticeflow` only.
- Add new `shadcn` component library (already have `Button`/`Badge`).
- Add `Magic UI` `AnimatedGridPattern` or `BorderBeam` (flashy, `motion` dep).
- Add `Aceternity` `Background Beams`/`Wobble`/`3D` (flashy, `framer-motion`).
- Add full `Tailark` template replacement (only hero `grid` CSS).
- Change `Geist`/`neutral`/`1px`/`rounded-md`/`shadow` system.
- Add `framer-motion`/`motion` dep.
- Add `Card` framework, `FormField`, `Dialog`, `Tabs`, `Breadcrumb`, animation library.
- Change `SiteNav` IA (keep `MicroNest MicroTools | Home | Chartered Accountants | NoticeFlow | Launch App`).
- Change SEO `metadata`/`sitemap`/`robots` (already `https://micronestmicrotools.vercel.app` `openGraph`).
- Add marketing sections beyond `Hero` + `Visual 3-step` + `Browse` + `Featured` + `Why` + `Footer` (no `Testimonials`, `Pricing`, `FAQ`, `Team`).
- Modify `src/app/app/**` authenticated product.

---

## 25. Recommended Implementation Sequence

**Single RCCF, single file, zero dep, 3 steps, with `pnpm typecheck/lint/test/build` + visual check at `375/768/1280`:**

1. **`src/app/page.tsx` hero:** Add `eyebrow` `p text-xs tracking-[0.2em] uppercase muted` + `py-16 md:py-24` (was `py-8`) + `bg-muted/10` wrapper with `absolute inset-0 bg-grid opacity-40` (Tailark CSS, inline `style` or `globals.css` `.bg-grid` 6 lines), keep `h1`/`p`/`CTAs` but make `Explore MicroTools` `bg-primary` primary and `Launch App` `ghost` secondary (currently both `h-9`, keep but ensure hierarchy).
2. **`src/app/page.tsx` visual 3-step + MicroTools workflow:** After hero, add `Profession → Workflow → MicroTool` 3-step (`flex col sm:row` `rounded-full border bg-card px-3 py-1.5` + `→`/`↓` + `h-2 w-2 bg-primary dot`) between hero and `Browse`; inside `Featured MicroTool` `ToolCard` add `Workflow` `flex flex-wrap gap-1.5 border-t pt-3` `Receipt → ... → Close` as `Badge outline text-xs bg-muted/30`.
3. **`src/app/page.tsx` Why + footer:** `Why` `rounded-md border p-6` `list-disc` → `border-t pt-6 grid md:grid-cols-3 gap-6` with `h3 text-sm + p text-sm muted` 3 cols; footer add `© 2026 Kaushal Bhat` second line `text-xs` + `flex-wrap` for links.

**After each step:** `pnpm typecheck && pnpm lint && pnpm build` quick, then `pnpm test:e2e` smoke (`root renders MicroNest homepage` must still PASS).

**Tag after:** `git add src/app/page.tsx src/app/globals.css (if grid CSS) && git commit -m "feat(marketing): hero workflow storytelling + quiet authority polish"` + `git push`.

**Stop before:** Adding Lawyers profession, MatterVault card, or full template.

---

## 26. Final Verdict

**Design is ready for implementation** — no new deps, one file (`src/app/page.tsx` + 6 lines `globals.css` grid), selective reuse of **shadcn** (existing) + **Tailark hero grid CSS** (MIT, 6 lines, zero dep), `quiet authority` preserved (`neutral`, `Geist`, `1px`, `rounded-md`, no gradients/glass/neon/3D), hierarchy fixed (eyebrow + `py-16/24` + `grid` anchor + `Profession→Tool→Workflow` 3-step + `Receipt→Close` workflow + `Why` 3-col `border-t`), and `MatterVault` intentionally **not** exposed.

**Do not implement in this audit — wait for RCCF to instruct implementation. Do not rank resources — selective use as above is the smallest that genuinely improves MicroNest.**

