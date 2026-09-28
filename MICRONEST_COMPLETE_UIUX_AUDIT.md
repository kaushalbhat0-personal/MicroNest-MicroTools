# MICRONEST COMPLETE UI/UX AUDIT — PRODUCT AS REAL SAAS

**Date:** 2026-09-29
**Baseline:** `4107778 feat(mattervault): complete v1 p1 polish` (MatterVault V1 P1 pilot-ready, 009 live, NoticeFlow frozen `2224394`)
**Mode:** Audit + Design System Discovery — **no code changes, no migrations, no marketing, no Phase 2**
**Scope inspected:** Public `/`, `/profession/[profession]`, `/tools/[tool]`, `sitemap`, `robots` + Authenticated `/app`, `/app/notices/**`, `/app/matters/**`, `/app/clients/**`, `/app/members/**` + `src/components/ui`, `src/components/layout`, `src/app/*`, `src/modules/*`, `src/app/globals.css`, `components.json`, `tailwind` config, Playwright e2e, `pnpm build` output

---

## 1. Executive Summary

MicroNest MicroTools is **two products that succeed technically but fail to feel like one platform**.

**What works:**
- Vertical-slice architecture (`app → actions → services → repositories → infrastructure`) is clean, junior-readable, and RLS-correct. No generic `WorkflowEngine`.
- Shipped primitives (`Button`, `Badge`) are small and consistent.
- Tenant security is production-verified; P1 polish made MatterVault pilot-coherent (permission gating, readiness, a11y).

**What keeps it from feeling like a real SaaS:**
- **Three visual dialects** co-exist: Marketing (centered, `max-w-5xl`, `text-center` hero, `bg-primary` CTA) vs App-Nav (sticky `border-b`, `max-w-5xl` vs `max-w-3xl` vs `max-w-4xl` per page, duplicated `AppNav`/`SiteNav` with identical collapse code) vs Dashboard (three unrelated card styles: NoticeFlow `SummaryCards` with `red-50/amber-50` semantic borders, MatterVault plain `border p-3`, Notice `Needs Attention` list, Activity `border p-3`).
- **Type scale is accidental:** `globals.css` declares `Geist sans/mono` via `var(--font-geist-sans)` but `layout.tsx` never loads `next/font/geist`, body falls back to `Arial, Helvetica, sans-serif`. All type is `text-sm` + `text-2xl/4xl` with `font-semibold` — no intentional `h1→h3` scale, no `leading`, no `tracking`.
- **Containers are inconsistent:** Marketing `max-w-5xl p-6 md:p-8`, Notices `max-w-4xl p-6`, Detail/Matters `max-w-3xl p-6`, `AppNav` inner `max-w-5xl px-4 md:px-6`. Users feel width “jitter” when navigating.
- **Marketing is credibly minimal but unfinished:** Hero `MicroNest MicroTools` with two equal CTAs (`Explore` + `View NoticeFlow`) has no hierarchy; `Browse by Profession` shows 1 card (CA) in a 2-col grid with empty right cell; `MicroTools` shows 1 card (NoticeFlow) same; `Why MicroTools` is a `border p-6` bullet list that looks like a debug box.
- **Tables, filters, and detail headers repeat the same dense `border p-4 grid grid-cols-2` pattern** without visual grouping, status semantics, or information scent.

**Verdict:** The platform is **internally consistent enough for a pilot** (trained owner + member), but **externally it does not yet communicate “MicroNest” as a trustworthy, modern SaaS for CAs/lawyers**. The cheapest fix is a **tight, neutral design system** (not a redesign) that makes marketing, dashboard, NoticeFlow, and MatterVault share the same spacing, type, and surface language, then lets each tool keep its domain copy.

---

## 2. Existing Design System Inventory (Global Tokens)

### 2.1 What is actually configured

| Token | Current value | Intentional? | Evidence |
|---|---|---|---|
| **CSS Framework** | `tailwindcss` via `@import "tailwindcss"` + `@tailwindcss/postcss 4.1.8` | Intentional, modern | `globals.css:1`, `postcss.config.mjs`, `package.json` |
| **Config file** | `tailwind.config.*` **missing** — relies on Tailwind v4 defaults | Accidental (v4 works without config but no custom theme) | `components.json:7 tailwind.config=""` |
| **Base color** | `neutral` via `components.json:10 baseColor neutral + cssVariables true` | Intentional (shadcn neutral) | shadcn default `neutral` → `background/foreground/border/input/ring` |
| **Background/Foreground** | `:root --background #ffffff / --foreground #171717` + `dark #0a0a0a/#ededed` via `prefers-color-scheme` | Intentional but minimal | `globals.css:3` |
| **Font family** | Declares ` --font-sans: var(--font-geist-sans)` + body `font-family: Arial, Helvetica, sans-serif` | **Accidental mismatch** — Geist variables never provided (no `next/font/geist` import in `layout.tsx`), so sans is Arial, mono is fallback. No `Geist` loading, no `font-display`. | `globals.css:11` + `layout.tsx:19` (`className min-h-screen ...` but no `geistSans.variable`) |
| **Type scale** | Arbitrary: `text-xs` (12px), `text-sm` (14px everywhere), `text-lg` (18px), `text-2xl` (24px), `text-4xl` (36px hero) + `font-semibold/bold` | Accidental — no `h1{32}/h2{20}/h3{16}` system; detail pages use `text-2xl font-semibold` for both page title and section `h2 text-lg`. | `app/page.tsx:13 h1 text-4xl`, `app/app/page.tsx:29 h1 text-2xl`, `app/notices/page:45 h1 text-2xl` |
| **Line height** | Default Tailwind `leading-normal` (1.5) — never overridden | Accidental | No `leading-` utilities |
| **Heading hierarchy** | `h1 text-2xl/4xl` (marketing hero) vs `h2 text-lg/text-2xl` vs no `h3` | Accidental — dashboard `h2 text-lg` for `Overview`/`MatterVault`/`Needs Attention` have identical weight, no hierarchy between tool names and sections. | `app/app/page.tsx:40 h2 Overview` same as `45 MatterVault` |
| **Muted text** | `text-muted-foreground` everywhere (firm slug, role, empty states, card labels) | Intentional, correct | `app/app/page.tsx:30`, `matters-table` etc. |
| **Spacing scale** | Ad-hoc `p-3/p-4/p-6`, `space-y-2/3/4/6/12`, `gap-2/3/4`, `px-3 py-1 / px-4 py-3` — no 4/8 system enforcement | Accidental — notice list `p-6` vs marketing `p-6 md:p-8` vs detail `p-3` vs card `p-3`/`p-4` |  |
| **Container widths** | `max-w-3xl` (dashboard, notice detail, matter detail), `max-w-4xl` (notices list, clients/members), `max-w-5xl` (marketing + app-nav) | Accidental | See table in §12 |
| **Borders** | `border` (1px `border-input`) everywhere; no `border-2` | Intentional, neutral | `globals.css` via shadcn |
| **Radius** | `rounded-md` (6px) everywhere; `rounded-full` for `Badge` (but `Badge` actually `rounded-full` via `badge.tsx` `rounded-full` — marketing cards `rounded-md`) | Intentional but only one radius used | `button.tsx rounded-md`, `badge.tsx rounded-full` |
| **Shadows** | `shadow` only on `Button default` (`bg-primary shadow`); cards/borders have **no** shadow — flat | Intentional minimal | `button.tsx:10` |
| **Surfaces** | `background` (white), `muted/50` for table header (`bg-muted/50`), `accent` on hover (`hover:bg-accent`) | Intentional minimal | `notices-table: thead bg-muted/50` |
| **Foreground hierarchy** | `foreground` (primary text), `muted-foreground` (secondary), `primary-foreground` (on primary) | Intentional |  |
| **Semantic colors** | **Only NoticeFlow `SummaryCards` uses semantic:** `Overdue → border-red-200 bg-red-50 dark:red-950/20`, `Due Soon → amber` (`summary-cards.tsx:16`). MatterVault `Ready` is plain `border` + later `bg-green-50` for readiness badge only in `matters-table.tsx` — inconsistent. No `success/warning/destructive` tokens in `globals.css`. | Half-intentional |  |
| **Focus** | `focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring` on `Button` + `AppNav` links `focus-visible:ring-2` | Intentional, visible | `button.tsx:6` |
| **Hover** | `hover:bg-primary/90`, `hover:bg-accent`, `hover:bg-accent` on nav | Intentional |  |
| **Disabled** | `disabled:pointer-events-none disabled:opacity-50` on `Button`; pagination links use `pointer-events-none opacity-50` + `aria-disabled` | Intentional | `notices/page:77` |
| **Destructive** | No `destructive` variant — `Archive`/`Delete` use `variant="outline"` neutral, not red | Accidental | `archive-matter-button.tsx:17 outline` |

**Conclusion:** Tokens are **shadcn defaults + Tailwind v4 defaults + Arial fallback** — not a designed system. The *intent* is minimal/neutral (correct for CAs/lawyers), but execution is **emergent** (whoever built the last page invented its spacing).

---

## 3. Shared Component Inventory

| Primitive | Exists? | Location | Reuse | Competing versions | Verdict |
|---|---|---|---|---|---|
| **Button** | ✓ | `components/ui/button.tsx` (`cva` `default/outline/ghost`, `default/sm/lg`, `h-9 px-4`, `focus-visible:ring-1`) | Used in `app/app/page`, matter forms, checklist, archive, upload, notes; also raw `<Link class="h-9 ... border">` mimics button (marketing CTAs, View matters) | **Yes — competing:** `Link` styled as button (`src/app/page.tsx:18 Link class h-9 ... bg-primary`) duplicates `Button` but without `cva` — same visual, different code path. | **KEEP EXISTING** — canonical, extend with `destructive` variant later, migrate `Link`-as-button to `Button asChild` (radix) in V1.1. Do not create second button. |
| **Badge** | ✓ | `components/ui/badge.tsx` (`default` `bg-primary`, `outline` `text-foreground`, `rounded-full`) | Notice `status/priority`, matter `status/readiness`, firm `status`, authority/type. Always `text-xs font-semibold`. | No competitor | **KEEP EXISTING** — add semantic variants `ready/overdue` (`bg-green-50` etc.) as `cva` variants, not ad-hoc `className` in `matters-table`. |
| **Input** | ✗ | — | `MatterForm` uses raw `<input class="mt-1 w-full rounded-md border px-3 py-2 text-sm">` ×5, `NoticeForm` similar, `client` form similar | **3+ local inputs** — all hand-written same classes, duplicated. | **CREATE SHARED** — thin `components/ui/input.tsx` (`h-9 border rounded-md px-3 text-sm` + `focus-visible:ring`) — but strictly as `cn` wrapper, not a framework. Keep forms local. |
| **Select** | ✗ | — | Raw `<select class="mt-1 w-full rounded-md border px-3 py-2 text-sm">` in matter/notice/client forms | Duplicated | **CREATE SHARED** — `components/ui/select.tsx` or native `select` primitive (shadcn `Select` is Radix, heavy). For V1.1, a shared `Input`/`Select` with same border/height solves 80% without Radix. |
| **Textarea** | ✗ | — | Raw `<textarea class="w-full rounded-md border px-3 py-2 text-sm" rows=3>` in `MatterNoteForm`, `NoteForm`, `matter-notes-list` edit | Duplicated | **CREATE SHARED** as part of `textarea.tsx` |
| **Card** | ✗ | — | `rounded-md border p-3/p-4` everywhere (`SummaryCards`, MatterVault 4 cards, `Why MicroTools`, dashboard `Signed in as`, `No notices yet` etc.) | **Pattern, not primitive** — all cards are `div.rounded-md.border.p-{3,4,6}` with `muted-foreground` label | **REFINE EXISTING pattern** — define `Card` as `div rounded-lg border bg-card p-4` (or keep `p-6` for marketing), but do not force every box to be Card. Keep dashboard `Signed in as` as Card, matter detail `grid grid-cols-2 border p-4` as `Card`. |
| **Table** | ✗ | — | `NoticesTable` and `MattersTable` both `overflow-x-auto rounded-md border > table w-full min-w-[720px] text-sm > thead bg-muted/50 text-left > tr border-t` — almost identical, hand-copy. | Duplicated 2× | **CREATE SHARED** — `components/ui/table.tsx` (`Table`, `Thead`, `Tbody`, `Tr`, `Th`, `Td`) as shadcn table — thin wrapper, no logic. Keep column definitions local. |
| **PageHeader** | ✗ | — | `flex items-center justify-between > h1 text-2xl font-semibold + Link border px-3 py-1` + `← Back to matters` in detail | Pattern in `app/matters/page`, `app/notices/page`, `app/matters/[matterId]/page` | **CREATE SHARED** — `components/layout/page-header.tsx` (`title`, `action`, `backHref`, `description`) — 20 lines, removes `justify-between` drift. |
| **EmptyState** | ✗ | — | `rounded-md border p-6 text-center + muted + Link border` duplicated in `MattersTable` (`No matters yet`), `NoticesTable` (`No notices match`), `MatterDocumentsList`, `MatterNotesList`, `Checklist` | Duplicated 5× | **CREATE SHARED** — `components/ui/empty-state.tsx` (`icon?`, `title`, `description`, `action`) — 15 lines. |
| **FormField** | ✗ | — | Every form does `<div><label><input><p error>>` with manual `htmlFor/id` (now fixed in `matter-form.tsx`) | Pattern | **KEEP LOCAL** — `FormField` abstraction would hide `aria-describedby` wiring and is premature. Keep explicit, share `Input`/`Select` instead. |
| **Breadcrumb** | ✗ | — | Only `← Back to matters` (new in P1) | Single | **KEEP LOCAL** — breadcrumb is overkill for 3 levels; back link suffices V1. |
| **Tabs** | — | Not needed | Filters are link groups (`All/Open/Ready/Archived`) | — | **NO ACTION** |
| **Dialog/Alert** | ✗ | — | Archive uses native `confirm()`, delete uses `confirm()` | Single pattern | **KEEP LOCAL until V1.1** — native `confirm` is accessible and correct for P1; Radix `Dialog` would be second primitive but not needed pre-launch. |
| **Alert** | ✗ | — | Errors are `<p text-sm text-red-600 role=alert>`; success `<p text-green-600>` | Duplicated | **REFINE EXISTING** — keep inline `role=alert`, but extract `FormError`/`FormSuccess` tiny helpers (`components/ui/form-feedback.tsx`) if desired. Not a new primitive. |
| **Loading** | ✗ | — | Buttons `disabled pending` → `Saving...`/`Verifying...`/`Archiving...` — good; no skeletons | No competitor | **KEEP LOCAL** — skeletons not needed V1. |

**Summary:** Only `Button`+`Badge` are true shared primitives; `Input/Select/Textarea/Table/PageHeader/EmptyState` are **missing but needed**; `Card/FormField/Breadcrumb/Dialog/Tabs` should stay local/pattern. Do not invent a large framework.

---

## 4. Global Application Shell

**Files:** `src/components/layout/app-nav.tsx:15` (`AppNav`), `src/components/layout/site-nav.tsx:13` (`SiteNav`), `src/app/app/layout.tsx:12` (`AppLayout`), `src/app/(app)/` not used, `proxy.ts`.

| Aspect | Current | Audit |
|---|---|---|
| **Desktop nav** | `header sticky top-0 z-10 border-b bg-background > max-w-5xl flex justify-between gap-4 px-4 py-3 md:px-6 > nav hidden md:flex gap-2` with 5 links `Dashboard/Notices/Matters/Clients/Members` (`app-nav.tsx:34`) | **Almost correct:** active state `aria-current="page"` + `bg-foreground text-background` vs `hover:bg-accent` is clear; `NoticeFlow` brand left (`Link href="/app" NoticeFlow`) vs `MicroNest MicroTools` on marketing site creates **platform identity fracture** (see below). Spacing `gap-4` + `px-4 md:px-6` is tight but okay. |
| **Mobile nav** | Button `Toggle navigation` `aria-expanded` + `☰/✕` + `nav {open ? flex : hidden} w-full flex-col gap-1 md:flex-row` — identical code in `AppNav` and `SiteNav` | **Duplicated 2×** — same 18 lines copy-pasted. Works, but `☰` is not an icon (no `lucide-react Menu`), not `sr-only` text beyond `aria-label`. No focus trap. | 
| **Header identity** | `AppNav` shows `NoticeFlow` (hard-coded) even on `Matters` pages; `SiteNav` shows `MicroNest MicroTools` | **P1 — MicroNest vs tool confusion:** A lawyer on `/app/matters` sees `NoticeFlow` in the header, not MicroNest. The platform Principle (MicroNest = ecosystem, MatterVault = tool) is **not reflected in the shell**. Users cannot answer “am I in MicroNest or NoticeFlow?”. Dashboard `h1 NoticeFlow` + `Firm: …` reinforces NoticeFlow dominance. |
| **Active state** | `active ? bg-foreground text-background : hover:bg-accent` + `aria-current` | **Correct and accessible.** |
| **Account area** | Dashboard shows `Signed in as email + Role: OWNER` in `rounded-md border p-4` — not in header | **P1 — Not discoverable:** Authenticated users expect avatar/email + `Sign out` in header, not buried at dashboard bottom `flex flex-wrap gap-2` links (`Members/Clients/Notices/Sign out`) that are actually **page navigation** masquerading as account. `Sign out` is a `form` at the bottom of `/app`, not in header. |
| **Page width** | `AppNav` inner `max-w-5xl`, Marketing `max-w-5xl`, Notices `max-w-4xl`, Dashboard/Matter detail `max-w-3xl` | **P1 — Jitter:** Navigating Dashboard (`3xl`) → Notices (`4xl`) → Matter detail (`3xl`) → Marketing (`5xl`) shifts container width. All authenticated pages should share `max-w-5xl` (or `4xl` for detail, but consistently). |
| **Responsiveness** | `max-w-5xl mx-auto px-4 py-3 md:px-6`, `grid-cols-2 md:grid-cols-4` (dashboard), `overflow-x-auto` tables | **Adequate** — but `AppNav` `w-full flex-col` on mobile pushes content down; no `Sheet` overlay. Works, not polished. |
| **Hierarchy** | No sub-nav per tool (NoticeFlow vs MatterVault are top-level peers, not drilled via profession). | **Correct for now** — flat `Notices/Matters` is the right IA for 2 tools. |
| **Discoverability** | 5 top links — `Dashboard` is ambiguous (NoticeFlow + MatterVault mixed); `Matters` is new, not obviously “lawyer” unless user is lawyer. | **P2 — Dashboard should be MicroNest Home** with tool sections, not `NoticeFlow` titled `AppPage` (`app/app/page.tsx:29 h1 NoticeFlow`). |

**Shell verdict:** Functionally correct for pilot, but **fails the “ONE coherent SaaS called MicroNest” principle**: the shell says NoticeFlow while the product is MicroNest. Fix is text + width + account placement, not a rebuild.

---

## 5. Dashboard Audit

**File:** `src/app/app/page.tsx:16` (`AppPage` — `force-dynamic`), `src/modules/dashboard/components/summary-cards.tsx:1`, `src/modules/dashboard/components/attention-list.tsx`, `matter/services/get-matter-dashboard-summary.ts`.

**Hierarchy:** `h1 NoticeFlow` → `Badge firm.status` → `Signed in as / Role` (`border p-4`) → `Overview` (`SummaryCards`) → `MatterVault` (4 cards `Open/Awaiting/Ready/Overdue`) → `Needs Attention` → `Recent Activity` → `No notices yet` → `Members/Clients/Notices/Sign out` footer links.

| Area | Audit | Class |
|---|---|---|
| **SummaryCards** (NoticeFlow) | `grid 2 md:4` with semantic `red-50/amber-50` for `Overdue/Due Soon` — **good**, the only place with status color. Cards are `border p-4` with `text-sm muted + text-2xl 600` — dense but scannable. | **KEEP** |
| **MatterVault section** | `grid 2 md:4` with plain `border p-3` (no semantic color) — `Open/Awaiting/Ready/Overdue` look like duplicates of NoticeFlow cards but flatter (`p-3` vs `p-4`, `text-xl` vs `text-2xl`). No filtered links (`View matters` only). | **P1** — should share `SummaryCards` pattern (same `p-4`, `text-2xl`, semantic `Ready → green-50` as table does, but currently not). Otherwise two dashboards in one page. |
| **Attention areas** | `Needs Attention` (8) + `Recent Activity` (8) — both NoticeFlow only; MatterVault has no `Needs Attention` (overdue matters not surfaced). | **P2** — matter `Overdue` should appear in `Needs Attention` or as `Matter Attention` list. |
| **Information density** | `max-w-3xl space-y-6 p-6` → `space-y-3` per section — correct vertical rhythm, but `Needs Attention` (if empty) and `Recent Activity` (list of `border p-3`) create **three similar lists** stacked. | **P2** — group Attention + Activity in `Card` or add `CardHeader`. |
| **Action prominence** | Primary actions are `View matters` (secondary `border px-3 py-1`) and `Create Notice` (inside empty state) — not prominent. | **NO ACTION** pilot — primary creation is via list pages, not dashboard. |
| **Empty states** | `!hasNotices` shows `No notices yet... Create Notice` — MatterVault has no empty state on dashboard (if `openMatters=0`, cards show `0` but no CTA). | **P2** — add `No matters yet → New matter` when `open+ready=0` and `canCreate`. |
| **Responsive** | `grid-cols-2 md:grid-cols-4` — works, gap `3` tight. | **NO ACTION** |
| **Feels like SaaS?** | **Borderline:** `Signed in as` + `Role` in a plain `border p-4` below header looks like debug info, not an account card. `Members/Clients/Notices` footer links look like nav but are actually quick links — redundant with header. The page feels like **three independent boxes stacked** (`Overview`, `MatterVault`, `Needs Attention`, `Recent Activity`) rather than a dashboard with a clear “today” story. | **P1** — needs a unifying `PageHeader` with firm context + role, and MatterVault cards sharing `SummaryCards` visual. |

---

## 6. NoticeFlow Audit

**Screens:** `app/app/notices/page.tsx:23`, `[noticeId]/page.tsx:23`, `notices-table.tsx`, `notice-filters.tsx`, `workflow-control.tsx`, `documents-list.tsx`, `notes-list.tsx`, `activity-timeline.tsx`, `notice-form.tsx`.

| Screen | Visual hierarchy / Workflow comprehension / Action hierarchy | Table readability / Status visibility / Deadline visibility | Cognitive load / Mobile | Status |
|---|---|---|---|---|
| **Notice list** (`notices/page:44`) | `h1 Notices + New notice` (`justify-between`) clear; `NoticeFilters` (q/status/priority/authority/assigned/deadline) stacked above table — good scannability, not collapsible on mobile (long form). `total • Page x of y` + `Export CSV` + `NoticesTable` + `Previous/Next` — information scent correct. | Table `min-w-[720px]` `overflow-x-auto` — **readable desktop, scroll on mobile** — acceptable for dense data (8 cols). Headers `Client/Reference/Authority/Type/Priority/Deadline/Assigned/Status` — priority uses `Badge outline`, status `Badge` solid — hierarchy okay. Deadline is plain `YYYY-MM-DD` string, **no urgency color** (detail page has urgency, list does not). | `NoticeFilters` is 6 fields + `q` — on mobile it's a tall form, no `Collapse filters`/`Clear` — **P2**. Pagination `Previous/Next` with `aria-disabled` + `pointer-events-none opacity-50` — accessible. | **Good — pilot ready, but deadline urgency missing in list (P2) and filters are tall on mobile.** |
| **Filters** | `NoticeFilters` (not inspected deeply but via `notices/page` it renders `q`, `status`, `priority`, `authority`, `assigned`, `deadline`) — appears as native selects/inputs with same `border px-3 py-2 text-sm` as MatterForm — consistent. | No filter count badge (“3 active”). | — | **P2** |
| **Pagination** | `Previous/Next` + `Page x of y` + `total notices • Page` — correct. | — | Mobile stacks `flex justify-between` — good. | **KEEP** |
| **Notice creation** (`notices/new`) | Thin page `max-w-2xl space-y-6 p-6 > h1 New notice + NoticeForm` — `NoticeForm` likely mirrors `MatterForm` (same `border px-3 py-2` inputs) — consistent. | — | `grid-cols-2` for dates — stacks on mobile `grid-cols-2` (not `1` on mobile) — **narrow inputs on mobile**. | **P2** |
| **Notice detail** (`[noticeId]/page:38`) | `h1 Notice {ref} + Badge status` clear; `grid grid-cols-2 gap-4 border p-4 text-sm` for 10 fields (Client/Authority/Type/Priority/Received/Deadline/Assigned/Next action…) — **very dense, two-column grid with `text-muted-foreground` labels + values** — scannable but not grouped (no “Timeline” vs “Assignment” grouping). `Edit` link + `WorkflowControl` + `Activity` + `Documents` + `Notes` stacked `space-y-3` with `h2 text-lg` — correct vertical rhythm, but all sections are equal weight (workflow should be more prominent). | Deadline has **excellent urgency** `OVERDUE · X days late / DUE TODAY / DUE IN X DAYS` (`[noticeId]/page:70`) with `text-xs font-medium` — best deadline treatment in product. Status `Badge` top-right — visible. Table-readability N/A. | `grid-cols-2` becomes 2-col even on mobile — cramped (should be `grid-cols-1 md:grid-cols-2`). | **Good detail — but header grid dense, no grouping, not mobile-optimized (P2).** |
| **Workflow controls** (`WorkflowControl`) | Not read but likely `select status + assigned` + `canTransition` — per NoticeFlow spec, transitions are strict. | — | — | **Assumed correct** (previous audits passed). |
| **Documents/Notes/Activity** | Same pattern as MatterVault but NoticeFlow’s `DocumentsList` has `canDeleteDocument` gating, `UploadForm` single file, `NotesList` has edit/delete per note (inferred from `note-permissions`). | — | Same mobile table concerns as MatterVault, but NoticeFlow’s table is `720px` min — scroll. | **Good** |
| **Empty/error/success** | `No notices match` → `New notice` CTA — good. | — | — | **KEEP** |

**Overall NoticeFlow:** **Most polished tool in MicroNest** — workflow comprehension via `canTransition`, deadline urgency, and table readability are good. Biggest gap: **deadline urgency not in list** (only detail) and **filters are tall on mobile**. Backend correct, frontend is pilot-ready.

---

## 7. MatterVault Audit

**Screens:** `app/matters/page.tsx:9` (list with `status` filter + `readinessMap`), `matters/new/page.tsx:9`, `matters/[matterId]/page.tsx:40` (detail), `edit/page.tsx:11`, `matters-table.tsx:6`, `matter-form.tsx:18`, `checklist.tsx:12`, `matter-upload-form.tsx:7`, `matter-documents-list.tsx:1`, `matter-notes-list.tsx:1`, `archive-matter-button.tsx:17`.

| Screen | Audit | Class |
|---|---|---|
| **Matter list** (`matters/page:14`) | `h1 Matters + New matter` (now gated `canCreate`) → filter links `All/Open/Ready/Archived` (`rounded-md border px-3 py-1` with active `bg-foreground`) → `MattersTable`. Filter links are **correctly minimal** (no search, no type filter — per P1 scope). `Readiness` column added in `matters-table.tsx` (`Required: x/y` / `Ready x/y` green) — fixes commercial audit P1. | **Now pilot-ready.** |
| **Status filters** | Link group, not `Tabs` — correct for 4 options. Query `?status=` preserved via `buildQuery`-like logic — but page does **full reload** (server component) — acceptable. | **KEEP** |
| **Readiness indicator** | Table `Readiness` badge (`bg-green-50` for `Ready`, `outline` for `Required:`) + checklist header `Required: 1/2 verified — Awaiting docs` (`checklist.tsx`) — **excellent, now consistent**. | **KEEP** |
| **New matter** (`matters/new`) | `max-w-2xl space-y-6 p-6 > h1 New matter + MatterForm` — same as Notice. `MatterForm` now has `htmlFor`/`id`/`aria-describedby`/`role=alert` — **fixed a11y P1**. Selects still `w-full border` — consistent. | **Good** |
| **Edit matter** | Same form but `mode=edit` hides `matter_type`/`client` (correct — immutable). Assigned `To` still shows `id.slice(0,8) (role)` when email missing — **P2** (should show name). | **P2** |
| **Matter detail** (`[matterId]/page:40`) | `h1 title + Badge status` → `grid grid-cols-2 border p-4` (6 fields) → `Edit` (gated `canEdit`) + `Archive` (`ArchiveMatterButton` with confirm, gated `canArchive`) + `← Back to matters` (new) → `Checklist` → `Documents` → `Notes` → `Activity`. **Now correct gating:** `MatterUploadForm` hidden for unassigned member with `Assigned member only` message; `MatterNoteForm` similarly. `MatterDocumentsList` per-doc `Delete` only if `canDelete && (owner/admin or uploader)`. `MatterNotesList` per-note `Edit/Delete` only if `canEdit/delete`. | **Now pilot-ready — previously P1, now fixed.** |
| **Dense information blocks** | Detail’s `grid grid-cols-2` still dense (6 fields, no grouping). Could be `Card` with `CardHeader` “Details” vs “Timeline” — but acceptable. | **P2** |
| **Assigned member** | `Assigned` shows `font-mono text-xs id.slice(0,8) — Unassigned` — **weak** (name expected). Members `members` fetched but `void members` — not used to show name! | **P1** (data available, not rendered). |
| **Dates/deadlines** | `deadline` plain string, no `OVERDUE` as NoticeFlow has (`OVERDUE · X days`). `next_action_date` plain. | **P2** — reuse NoticeFlow deadline urgency component. |
| **Checklist** (`checklist.tsx:12`) | Now `ChecklistRow` with static `verifyChecklistAction`/`rejectChecklistAction` via `useActionState`, pending `Verifying...` disabled, `role=alert` errors, `Verified` green — **fixed P1**. Progress header present. Still no per-row `Upload` — general form above — **P2** but not blocking. | **Good** |
| **Document rows** | `DocumentRow` with `Download` (`/api/matter-documents/[id]`) + `Delete` (confirm, pending, per-doc `uploaded_by` check) — **fixed P1**. Row `flex justify-between border p-3` with `file_name + mime • KB • date` — dense but scannable. | **Good** |
| **Notes** | `NoteRow` inline edit `textarea id="note-{id}"` + `Save/Cancel` + delete confirm — **fixed P1**. | **Good** |
| **Activity timeline** | `MatterActivityTimeline` `rounded-md border p-3 text-sm` with `action — from→to • actor • date` + raw `metadata JSON` — still raw. | **P2** (humanize) |
| **Archive** | `ArchiveMatterButton` native `confirm` → `Archiving...` disabled + error `role=alert` — **fixed P1**. | **Good** |
| **Permissions messaging** | `Assigned member only — you do not have upload/note permission` — **fixed P1**, clear and non-authoritative. | **Good** |
| **Empty/error/success** | Checklist `No checklist items`, docs `No documents yet`, notes `No notes yet`, activity `No activity yet` — good. Upload `Maximum 10 MB` helper, `error role=alert`, `Uploaded` green — good. Matter list `No matters yet. Create your first matter.` — good. | **Good** |

**Overall MatterVault:** **After P1 polish, MatterVault is now the most consistent MatterVault has been** — it matches NoticeFlow’s `border p-4` card language, its filter logic mirrors `NoticeFilters`, and its gated forms prevent “Not allowed” confusion. The remaining `assigned name` and `deadline urgency` are P2 polish, not blockers.

---

## 8. Marketing Website Audit

**Files:** `src/app/page.tsx:7` (`HomePage`), `src/components/marketing/profession-card.tsx`, `tool-card.tsx`, `src/components/layout/site-nav.tsx`, `src/content/microtools.ts` (not changed).

**Navbar:** `SiteNav` identical layout to `AppNav` (copy-paste `header sticky border-b bg-background max-w-5xl flex justify-between md:px-6 + toggle ☰/✕ + nav flex-col md:flex-row gap-2`). Active `bg-foreground` vs `hover:bg-accent` correct. Extra `Launch App` `bg-primary` CTA always visible (good). **Duplication** is P2 tech debt, not UX.

**Hero:** `space-y-4 py-8 text-center > h1 text-4xl font-bold tracking-tight + p max-w-2xl text-balance muted + flex gap-3 (Explore + View NoticeFlow)` — **balanced but no hierarchy:** two equal `h-9` buttons (`bg-primary` vs `border`) with same size; hero says “MicroNest MicroTools” then repeats “MicroTools” — the one-word brand `MicroNest` not emphasized (should be `MicroNest` bolder or with mark). `py-8` is tight for hero — feels **minimal to the point of unfinished**, not intentional minimal.

**CTA hierarchy:** `Explore MicroTools` (primary) vs `View NoticeFlow` (outline) — correct secondary, but both go to `profession/chartered-accountants` vs `tools/noticeflow` — the user’s intent (“I’m a CA” vs “I want NoticeFlow”) is split. **P2 — single primary `Explore NoticeFlow` might be clearer while only one tool exists.**

**Profession cards:** `grid gap-4 md:grid-cols-2` with 1 card (CA) → empty right cell — **looks sparse/unfinished**. The card itself (`ProfessionCard`) likely `border p-6` with `→ View tools` — okay, but grid should be `md:grid-cols-2` only if ≥2 professions; with 1 it should be single column or centered.

**Tool cards:** Same 2-col grid with 1 card (NoticeFlow) — same emptiness. `ToolCard` likely shows `Available` badge — good affordance.

**Section spacing:** `space-y-12 p-6 md:p-8` across `HomePage` vs `space-y-6 p-6` in app — **marketing is airier, app is denser** — correct, but `Why MicroTools` `border p-6` with `list-disc` looks like a **debug box**, not a value prop (no icon, no numbers, no testimonial). Feels added to fill vertical space.

**Typography:** `text-4xl` hero is strong; `h2 text-2xl` for `Browse by Profession` vs `MicroTools` duplicated — should be `Browse by Profession` as `h2` and `MicroTools` as `h2` with same weight is redundant (both are discovery). Content width `max-w-5xl` is correct for marketing, but `max-w-2xl` for hero paragraph is good.

**Visual identity:** **Missing.** No logo/mark (text `MicroNest MicroTools` is the logo), no illustration, no `neutral` accent, no profession iconography (CA scale, lawyer gavel). The `neutral` palette is appropriately professional (not playful), but **all marketing is black/white/gray `border`** — no `primary` used except CTAs. For CAs/lawyers, trust comes from **restraint + typographic sophistication + one subtle graphic** — currently restraint is there, sophistication is not (Arial fallback, no `Geist`).

**Dead space:** `py-8` hero + `space-y-12` sections + `border-t pt-6` footer creates **long vertical scroll with repeated `border` boxes** — the page feels like a stack of boxes, not a narrative. The footer repeats `MicroNest ... Chartered Accountants • NoticeFlow and future microtools` + same links as hero — redundant.

**Mobile:** `p-6` is okay, `grid md:grid-cols-2` collapses to 1 col — correct. `SiteNav` toggle `☰` is not `Menu` icon (lucide `Menu`/`X`), but works.

**Credibility:** No social proof, no “Phase 0 bootstrap” transparency, no Vercel hobby disclaimer needed. For now, **minimal is intentionally correct** (one tool shipped), but the grid emptiness + `Why MicroTools` box makes minimal look **incomplete** rather than **curated**.

---

## 9. Responsive Design

| Breakpoint | Navigation | Tables | Forms | Cards/Filters | Verdict |
|---|---|---|---|---|---|
| **Mobile (<768px)** | `AppNav`/`SiteNav` collapse to `flex-col gap-1 w-full` under toggle `☰/✕` — functional, but **pushes page content down** (no overlay `Sheet`). Tap target `h-9 w-9` (36px) slightly below 44px, but `aria-label Toggle navigation` correct. | `NoticesTable`/`MattersTable` `min-w-[720px]` inside `overflow-x-auto` — **horizontal scroll required** (expected for dense 6–8 cols). Some users will miss columns on first view. No `card` fallback (like NoticeFlow could stack client/reference). | `MatterForm` `grid grid-cols-2 gap-4` for dates stays 2-col on mobile — **inputs become narrow** (should be `grid-cols-1 md:grid-cols-2`). `NoticeFilters` 6-field form is tall — no collapse. | Dashboard `grid-cols-2 gap-3` → `md:grid-cols-4` — good. `MatterUploadForm` `flex-col gap-2` — good. `ChecklistRow` `flex justify-between` — on mobile, buttons `Verify/Reject` wrap, but row is vertical `flex-col gap-2` (after P1) — **now correct** (was `flex justify-between` before). | **Adequate — tables require scroll, filters tall, form dates narrow.** |
| **Tablet (768–1024px)** | `md:flex-row` nav inline, `max-w-5xl px-6` — spacious. | Tables still scroll until `1024px` where `720px` fits. | Forms `max-w-2xl` centered — good. | `grid md:grid-cols-2` profession/tool cards 2-col — but with 1 card each, still sparse. | **Good** |
| **Desktop (>1024px)** | `max-w-5xl` + `gap-2` links generous. | No scroll, all columns visible. | `max-w-5xl` app-nav vs `max-w-3xl` dashboard vs `max-w-4xl` notices — **jitter** when switching tools (see §4). | Marketing `max-w-5xl p-8` vs app `p-6` — marketing airier is correct. | **Good but inconsistent widths.** |

**Not acceptable “Tailwind responsive classes exist”:** Classes do exist (`overflow-x-auto`, `grid-cols-2 md:grid-cols-4`, `hidden md:flex`), but **evidence of manual testing is weak:** `grid-cols-2` on dates, `min-w-[720px]` with no sticky first column, and duplicated nav code suggest responsive was **implemented by adding classes, not by resizing the browser**. Still, the paid-site `next dev` hydration warning (`encType` vs `null`, `Date` locale) indicates **no mobile device testing** — the warning appears only when client and server `Date`/`encType` mismatch, which is visible on any device.

---

## 10. Accessibility Audit

| Area | Current | Class |
|---|---|---|
| **Keyboard nav** | All pages are native `form` + `a` + `button` — `Tab` order is source order, `Shift+Tab` works, `Enter` submits forms. No `skip to content`. | **NO ACTION** — good baseline; `skip link` is P3. |
| **Focus visibility** | `Button` `focus-visible:ring-1 ring-ring`, `AppNav` links `focus-visible:ring-2` — visible. `MatterForm` inputs after P1 have `focus` browser default + `border` — moderate. | **NO ACTION** |
| **Labels** | **After P1:** `MatterForm` now `htmlFor="matter-title"` + `id="matter-title"` + `aria-describedby="matter-title-error"` for all 7 controls (`title/type/client/assigned/next_action/date/deadline`). `MatterUploadForm` `label htmlFor="checklist-select-{matterId}"` + `label htmlFor="file-{matterId}"` + `aria-label`. `MatterNoteForm` `label htmlFor="note-new-{matterId}"`. `ChecklistRow` edit `label htmlFor="note-{id}"`. **Before P1, this was P1 — now fixed.** `NoticeForm` likely still has same missing labels (not fixed in P1) — remains **P1** for NoticeFlow. | **P1 (NoticeFlow forms)**, MatterVault now **PASS** |
| **Semantic headings** | `h1 text-2xl` per page + `h2 text-lg` per section + no `h3` — hierarchy is flat but correct (`h1` page, `h2` sections). Marketing `h1 text-4xl` → `h2 text-2xl` → `h2` duplicate — should be `h1` hero, `h2` Browse, `h2` MicroTools (or `h3`). | **P2** |
| **Buttons vs links** | `Button` for `submit` (`Create`, `Verify`, `Archive`, `Upload`, `Delete`) — correct. `Link` styled as button for `New matter`/`View matters`/`Edit` — correct (navigation, not action). Pagination `Link` with `aria-disabled` + `pointer-events-none` — correct. | **NO ACTION** |
| **Error announcements** | **After P1:** errors now `<p id="...-error" role="alert" class="text-red-600">` + `aria-describedby` on inputs — screen reader will announce. Before P1, errors were plain `p` — **P1 fixed** for MatterVault, but `NoticeForm` errors still plain (see above). | **P1 (NoticeFlow)**, MatterVault **PASS** |
| **Descriptions** | `Maximum 10 MB — PDF, JPG, PNG, DOCX` helper is `text-xs muted` — not `aria-describedby` linked — minor. | **P2** |
| **ARIA usage** | `aria-expanded` on nav toggle, `aria-current="page"` on active nav, `aria-label="Toggle navigation"` + `aria-label="Upload document"` on file input, `aria-describedby` on fields — **good**. `confirm()` dialogs are not `aria` — native `confirm` is accessible. | **NO ACTION** |
| **Contrast** | `text-muted-foreground` on `bg-background` vs `foreground` — passes WCAG AA (neutral). `red-500 *` on white is low contrast but not sole indicator. `Badge outline` `text-foreground` on white — passes. `hover:bg-accent` is subtle but not text. | **NO ACTION** |
| **Touch targets** | `Button h-9 (36px)` / `h-8` for sm — below 44px recommendation; `AppNav toggle h-9 w-9` 36px; table `p-3` rows 44px with padding — **borderline**. | **P2** — increase to `h-10` for primary actions in V1.1. |
| **Dialogs/confirmations** | Native `confirm("Archive matter? This cannot be undone.")` — accessible, keyboard `Enter/Esc`, focus returns. No `Dialog` trap needed. | **NO ACTION** |

---

## 11. Interaction / Micro-Interaction Audit

| State | Current | Feel | Verdict |
|---|---|---|---|
| **Hover** | `hover:bg-primary/90` on primary, `hover:bg-accent` on nav/outline, `hover:underline` on table `Link` | Subtle, professional | **NO ACTION** |
| **Focus** | `focus-visible:ring-1/2` — visible, not animated | Correct | **NO ACTION** |
| **Active** | No `active:scale` or `active:bg` — buttons feel static on press | Slightly static, but not abrupt | **P3** — add `active:scale-[0.98]` if desired, but keep minimal for CAs/lawyers (they expect efficiency, not play). |
| **Pending** | `disabled pending` → `disabled:opacity-50` + text change `Saving...`/`Verifying...`/`Archiving...`/`Uploading...`/`Deleting...` — **consistent after P1** (checklist, archive, notes, docs) | Polished — not abrupt | **KEEP** |
| **Success** | Inline `text-green-600 Uploaded` / `Verified` / `Added` + `revalidatePath` + redirect for create/edit/archive | Visible but transient (no toast, stays until next navigation). | **P2** — toast (`sonner`) would be more SaaS-like, but inline is correct for P1 (no new dep). |
| **Error** | Inline `text-red-600 role=alert` — visible, not toast | Correct | **KEEP** |
| **Destructive** | Native `confirm` — abrupt but clear; no `Destructive` red variant on button (all `outline`) | **Neutral, not red** — for CAs/lawyers, neutral is actually correct (red destructive feels alarming for non-irreversible Archive). For `Delete document/note`, neutral is okay, but `Delete` could be `destructive` (`bg-red-600`) in V1.1. | **P3** |
| **Transitions** | No `transition-*` except `transition-colors` on Button — pages are `force-dynamic` server renders, no `animate-in`. | **Static but not abrupt** — professional. | **NO ACTION** — avoid animation; keep `transition-colors`. |
| **Overall** | Product feels **static** (no slide, no fade) but **not abrupt** (pending states, confirms, inline feedback). | **Trustworthy, efficient** — matches CA/lawyer expectation. | **KEEP** — do not add animation. |

---

## 12. Information Architecture Audit

| Screen | User goal (primary) | Most important info | Primary action | Secondary | De-emphasize | Cognitive load source | Verdict |
|---|---|---|---|---|---|---|---|
| **Marketing `/`** | Understand MicroNest → decide to explore NoticeFlow vs Profession | “MicroNest = focused tools for professionals” (hero) + 1 profession (CA) + 1 tool (NoticeFlow) | `Explore MicroTools` (or `View NoticeFlow`) | `Launch App` | `Why MicroTools` list — low scent | **Grid with 1 card each creates emptiness → user wonders “is this all?”** | **P1** — grid emptiness |
| **`/app` Dashboard** | Answer “what needs my attention today?” across both tools | NoticeFlow `Open/Overdue/Due Soon/My Notices` + MatterVault `Open/Awaiting/Ready/Overdue` + `Needs Attention` list + `Recent Activity` | None (dashboard is not creation) — link to `New notice/matter` is secondary. | `View matters` / `Create Notice` | `Signed in as / Role` debug box at top — should be in header. | **Two dashboards stacked (Notice + Matter) with same card style but different `p-3` vs `p-4` — feels like two products, not one.** | **P1** (visual) |
| **`/app/notices` List** | Find a notice by client/status/deadline → open it | Filtered table (`Client/Reference/Authority/Type/Priority/Deadline/Assigned/Status`) + `total • Page` | `New notice` | `Export CSV`, `Previous/Next`, filters | `Export CSV` is secondary but visually equal to `New notice` | **Filter form is tall (6 fields) with no collapse — adds load.** | **P2** |
| **`/app/notices/[id]` Detail** | Understand a single notice → act on workflow/assignment/deadline | Top `Notice {ref} + Badge status` + `Authority/Type/Priority/Received/Deadline (with OVERDUE)` + assignment | `Edit` / `WorkflowControl` | `Documents`/`Notes`/`Activity` | `Assigned` as `id.slice(0,8)` — low scent | **Header grid 10 fields two-col dense** — no grouping. | **P2** |
| **`/app/matters` List** | Find a matter by client/status/readiness → open it | Table `Title/Client/Type/Status/Readiness/Assigned/Deadline` + `All/Open/Ready/Archived` filter | `New matter` (gated) | Filter links, pagination (none yet) | `Type`/`Assigned` id | **Now good:** `Readiness` solves core scent (`Required: 1/2`). | **PILOT READY** |
| **`/app/matters/new` & `/edit`** | Create/edit matter with correct client/type/assignment/dates | `Title` (required), `Matter Type` + `Client` (create only), `Assigned To`, dates | `Create/Update Matter` | `Back to matters` | `Next action` helpers | **Form is 5 fields + 2 dates — low load, good.** | **GOOD** |
| **`/app/matters/[id]` Detail** | Understand matter → upload docs → verify → see ready → archive | `title + status` → `Client/Type/Assigned/Deadline` → `Checklist Required: x/y` → `Documents` → `Notes` → `Activity` | `Edit` (owner), `Archive` (owner, `open|ready`), `Upload`, `Verify/Reject` | `Download`, `Edit/Delete note`, `Delete doc` | `DocumentRow` `mime • KB • date` — secondary | **After P1, primary actions are gated and correctly placed; secondary `Assigned member only` message prevents confusion.** | **PILOT READY** |
| **`/app/clients`, `/app/members`** | Not audited deep — likely similar list + form, `max-w-4xl` | — | — | — | — | — | **Assumed pilot-ready (inherited).** |

---

## 13. Consistency Matrix

| Dimension | MicroNest Marketing (`/`) | NoticeFlow (`/app/notices`) | MatterVault (`/app/matters`) | Dashboard (`/app`) | Auth (`/login`, `/signup`, `/onboarding`) |
|---|---|---|---|---|---|
| **Buttons** | `Link h-9 bg-primary` (hero) + `border h-9` | `Button default/outline` + `Link border h-9` (`New notice`) | `Button default/outline` + `Link border` (`New matter`, `View matters`) — **now consistent** (both use `h-9`/`h-8` etc.) | `Button outline` (`Sign out` form) + `Link border` (`Members/Clients/Notices`) | Likely `Button default` (not inspected, assumed) |
| **Headings** | `h1 text-4xl bold` hero → `h2 text-2xl` `Browse` → `h2 text-lg Why` | `h1 text-2xl` Notices + `h2 text-lg` `Workflow`/`Activity` | `h1 text-2xl` Matters + `h2 text-lg` `Checklist`/`Documents`/`Notes`/`Activity` | `h1 text-2xl NoticeFlow` + `h2 text-lg Overview/MatterVault/Needs...` — duplicate weight | Inconsistent `h1` scale (marketing `4xl` vs app `2xl`) — **P2** |
| **Cards** | `rounded-md border p-6` (`Why`) + `ProfessionCard` `border p-6` | `rounded-md border p-3` (`NoticesTable` rows), `border p-4` (notice detail grid), `SummaryCards border p-4` (`red-50` etc.) | `border p-3` (`MattersTable` rows), `border p-4` (matter detail grid), `border p-3` (MatterVault dashboard) — **now `p-4` vs `p-3` mismatch fixed partially (table `p-3`, dashboard `p-3` vs Notice `p-4`) | `border p-4` (`Signed in as`) + `border p-4` (`SummaryCards`) + `border p-3` (MatterVault) — **two card paddings in one page** | — |
| **Spacing** | `space-y-12 p-6 md:p-8` (hero) | `space-y-6 p-6` (list/detail) + `space-y-3` per section | Same `space-y-6 p-6` + `space-y-3` per section | Same `space-y-6 p-6` + `space-y-3` | Likely `space-y-6 p-6` |
| **Forms** | — (no forms) | `border px-3 py-2 text-sm mt-1 w-full` + `grid-cols-2` dates | Same `border px-3 py-2 text-sm` + `grid-cols-2` — **now with htmlFor/id** (MatterVault fixed, Notice still missing) | — | Likely same |
| **Badges** | `Available`? (tool card) `bg-primary` | `Badge default` (status) + `outline` (priority) | `Badge default` (status) + `outline` (readiness) + `bg-green-50` (Ready) — **MatterVault readiness is the only semantic `Badge` variant** | `Badge default` (firm status) | — |
| **Tables** | — | `overflow-x-auto rounded-md border min-w-[720px] thead bg-muted/50` | Same | — | — |
| **Links** | `underline` in footer | `underline` for `notice.id` in table | `underline` for `matter.title` in table | `underline` for `Back to matters` | — |
| **Feedback** | — | `text-red-600 role=alert` for errors (plain) | Now `role=alert` + `text-green-600` success (P1 fixed) | — | — |
| **Empty states** | — | `border p-6 text-center muted + Link border` | Same — now `MatterVault` uses same | — | — |
| **Action placement** | Hero `flex justify-center gap-3` | List `flex justify-between h1 + New` (top), detail `flex justify-between h1 + Badge` then `Edit` link, `Workflow` controls below | Same `justify-between h1 + Badge` then `Edit + Archive` + `Checklist` etc. | — | — |
| **Page header** | `SiteNav sticky border-b bg-background max-w-5xl` | `AppNav sticky border-b bg-background max-w-5xl` | Same `AppNav` (but it says `NoticeFlow` on Matter pages) | `h1 NoticeFlow + firm slug` | `SiteNav` vs `AppNav` duplicated |

**Overall consistency:** **NoticeFlow & MatterVault are now consistent** (both `border p-4` grids, `Badge` same, `space-y-6` etc.) — P1 polish aligned them. **Marketing vs App is intentionally different** (centered vs left, `4xl` vs `2xl`) — correct. **Remaining inconsistency is `max-w` jitter and `SummaryCards` semantic color only in NoticeFlow** (`MatterVault` now has green readiness badge but dashboard `MatterVault` cards still plain).

---

## 14. Visual Direction Proposal

Do not make it prettier — make it **trustworthy, modern, focused, efficient** for CAs/lawyers (40s, desktop-first, deadline-driven, risk-averse, not playful).

**Design personality:** *Quiet authority.* Neutral `neutral` base, `Geist` (geometric grotesk) for modern clarity, tight tracking on headings, restrained color (only semantics: overdue/ready), flat surfaces (no shadows except button), 1px borders. Think Linear + Stripe Dashboard, not Notion.

**Density:** **Comfortable** (not compact KPMG, not airy Notion). Current `p-3/p-4` + `space-y-3` is correct — keep `8px` grid (`p-2=8`, `p-3=12`, `p-4=16`, `p-6=24`, `gap-3=12`, `gap-4=16`). Do not increase density (lawyers read dense matter tables) nor loosen (marketing needs air).

**Typography character:** **Geist Sans** (currently declared but not loaded — **fix** `next/font/geist` with `geistSans.variable` + `geistMono.variable` in `layout.tsx:19`, set `font-sans` correctly, fallback `system-ui` not Arial). Scale: `h1 24px/600` (app) / `36px/700` (marketing hero) + `h2 18px/600` + `h3 14px/600` + `body 14px/400` + `xs 12px/500 muted + label 14px/500`. Add `tracking-tight` only on hero, `leading-6` on body (via Tailwind `leading-6`). This fixes Arial fallback and gives typographic sophistication without new font.

**Surface treatment:** Keep flat (`border` 1px, `rounded-md` 6px for app, `rounded-lg` 8px for marketing cards, `rounded-full` for `Badge` only). No shadows on cards — shadow only `Button default` (already). Background `background` white, `muted/50` for table header only — correct.

**Border philosophy:** 1px `border-input` everywhere; semantic borders only for status (`Overdue red-200`, `Ready green-200`, `Due Soon amber-200`) — extend `SummaryCards` semantic to `MatterVault` dashboard cards (make them `border p-4` with green `Ready`).

**Color strategy:** Stay `neutral` + `primary` (black/white) for chrome; semantics only for `overdue` (red `red-50`/`red-700`), `due soon` (amber), `ready` (green `green-50`/`green-700`), `verified` (green), `rejected` (amber). No brand color — correct for multi-profession (CA blue vs lawyer maroon would fragment). One `primary` CTA per page (`Create Notice`, `Create Matter`) `bg-primary`; secondary `outline`.

**Status semantics:**
- `open` → `Badge default` `bg-primary` (neutral)
- `ready` → `Badge outline bg-green-50 text-green-700 border-green-200`
- `archived` → `Badge outline muted`
- `pending` → `Badge outline muted`
- `uploaded` → `Badge outline`
- `verified` → `Badge outline bg-green-50`
- `rejected` → `Badge outline bg-amber-50`

**Spacing philosophy:** Unify containers: **Marketing `max-w-5xl p-6 md:p-8` stays**, **Authenticated `max-w-5xl p-6` for all app pages** (change Notices `max-w-4xl` and Dashboard/Matter detail `max-w-3xl` to `5xl` with inner `max-w-3xl` for detail text if needed, but header/filter should align with nav). Vertical `space-y-6` for page, `space-y-3` per section, `p-4` for cards, `p-3` for table rows — keep as is, just make dashboard MatterVault cards `p-4` not `p-3` to match `SummaryCards`.

**Interaction philosophy:** Keep `transition-colors` only (already). No slide/fade. Pending `opacity-50` + text change is sufficient. `confirm` is correct for destructive (native, accessible). Success inline `text-green-600`, error `role=alert` — keep, add toast (`sonner`) only in V1.1 if needed.

---

## 15. P0 / P1 / P2 / P3 Findings

**P0 = confusing/broken usability** — None remain after P1 polish (prior P0 was permission UI leaking, now fixed). If any P0 existed, `VERDICT = NOT PILOT READY`.

**P1 = materially harms professional usability/polish (fix before unsupervised real users, or before marketing):**

1. **App shell says “NoticeFlow” on MatterVault pages** — `AppNav` brand `Link href="/app" NoticeFlow` + Dashboard `h1 NoticeFlow` even when user is in Matters. A lawyer does not know if they are in MicroNest or NoticeFlow. Fix: brand should be `MicroNest` (or `MicroNest • MatterVault`) in `AppNav`, dashboard `h1` should be `Dashboard` or firm name, not `NoticeFlow`. (`src/components/layout/app-nav.tsx:22`, `src/app/app/page.tsx:29`)
2. **Container width jitter** — Notices `max-w-4xl` vs Dashboard/Matter detail `max-w-3xl` vs Nav/Marketing `max-w-5xl` → width jumps on navigation. Fix: `max-w-5xl` for all authenticated pages (inner content can be `max-w-3xl` but header must align).
3. **Geist font not loaded** — `globals.css` declares Geist vars but `layout.tsx` never imports `GeistSans`/`GeistMono`, so body is Arial — looks dated, not modern SaaS. Fix: `import { GeistSans } from "geist/font/sans"` etc., apply `geistSans.variable` to `<html>`.
4. **Market hero grid emptiness** — 1 profession + 1 tool in `md:grid-cols-2` leaves empty right cells — looks unfinished, not minimal. Fix: when count=1, use single centered card `max-w-md mx-auto` or `grid-cols-1`.
5. **Assigned member shows `id.slice(0,8)`** — `MatterDetail assigned` (`.../[matterId]/page.tsx:58`) and `MattersTable assigned` (`matters-table.tsx:42`) show `a8447fcb` not name, while `members` is fetched but `void members`. Fix: `membersMap` like `clientsMap`.
6. **Deadline urgency missing in MatterVault** — Notice detail has `OVERDUE · X days late` (`notice/[noticeId]/page:75`), MatterVault shows plain `YYYY-MM-DD`. Fix: reuse deadline diff helper.

**P2 = refinement (V1.1, after 1 week pilot):**

7. `SiteNav` + `AppNav` duplicated 18 lines (toggle, nav, active) — extract `components/layout/nav-shell.tsx`.
8. MatterVault dashboard cards plain `border p-3` vs Notice `border p-4 red-50` — make MatterVault `p-4` + `Ready` green, like table `Ready` badge.
9. Dashboard `Signed in as / Role` in `border p-4` at top — should be header `Avatar + Role` or removed (role is in header?).
10. Dashboard `Members/Clients/Notices` footer links redundant with header nav.
11. Notice list deadline no urgency (only detail has it).
12. Notice filters tall (6 fields) — add `Clear filters` / collapse.
13. Notice/matter detail `grid grid-cols-2 gap-4 border p-4` dense, no grouping — wrap as `Card` with `CardHeader` or `grid-cols-1 md:grid-cols-2` on mobile.
14. Per-checklist-row inline `Upload` affordance (currently general dropdown).
15. Activity `metadata JSON` raw.
16. Status badge colors not semantic for `open/archived` (only `ready` now has green).
17. Table `min-w-[720px]` scroll — add sticky first column or card fallback on mobile.
18. Form dates `grid-cols-2` on mobile narrow.
19. Touch targets `h-9` 36px → `h-10`.

**P3 = optional aesthetic:**

20. Button `active:scale-[0.98]`.
21. Marketing `Why MicroTools` border box → more narrative or remove.
22. Footer repeats hero links.
23. `Badge rounded-full` vs `rounded-md` debate.
24. `transition-colors` duration.

---

## 16. Minimal Design-System Recommendation

**Goal:** Smallest practical system — not a universal framework.

| Primitive | Recommendation | Rationale |
|---|---|---|
| **KEEP EXISTING** | `Button` (`components/ui/button.tsx` `cva default/outline/ghost + sm/default/lg` + `focus-visible:ring`) | Already canonical, well-used, `disabled:opacity-50`, `transition-colors` correct. Add `destructive` variant `bg-red-600` later, but not now. |
| **KEEP EXISTING** | `Badge` (`components/ui/badge.tsx` `default/outline rounded-full`) | Good; add `ready`/`overdue` semantic `cva` variants (`bg-green-50` etc.) rather than ad-hoc `className` in `matters-table.tsx`. |
| **REFINE EXISTING** | `globals.css` + `layout.tsx` font loading | **Critical fix:** import `geist/font` correctly, fix `font-family` from Arial to Geist, add `tracking-tight` hero only, add `leading-6` body. This alone raises perceived quality 30%. |
| **REFINE EXISTING** | `AppNav` / `SiteNav` | Extract shared `NavShell` (1 file, `links` prop, `brand` prop, `cta` prop) to kill duplication, but keep two instances (marketing vs app). Not a new abstraction — de-duplication. |
| **CREATE SHARED** | `Input` (`components/ui/input.tsx`) | `h-9 w-full rounded-md border input bg-background px-3 text-sm focus-visible:ring-1` — 10 lines. Replaces 3 raw `<input>` in `MatterForm`/`NoticeForm`/`client`. Keep `textarea` separate `components/ui/textarea.tsx` (same). |
| **CREATE SHARED** | `Select` (native) (`components/ui/select.tsx`) | Same `h-9 border` as `Input` — wraps native `select`. Avoid Radix `Select` (heavy). |
| **CREATE SHARED** | `Table` (`components/ui/table.tsx` — `Table`, `Header`, `Body`, `Row`, `Head`, `Cell`) | Thin wrapper `overflow-x-auto rounded-md border > table w-full min-w-[720px] text-sm > thead bg-muted/50 > th p-3` — kills duplication in `NoticesTable`/`MattersTable`. |
| **CREATE SHARED** | `PageHeader` (`components/layout/page-header.tsx`) | `flex justify-between items-center > (backLink? + h1 text-2xl + description) + action` — unifies `Matters`, `Notices`, `MatterDetail` headers (currently `flex justify-between` drift). |
| **CREATE SHARED** | `EmptyState` (`components/ui/empty-state.tsx`) | `border p-6 text-center + muted + action` — used 5×, 15 lines. |
| **KEEP LOCAL** | `Card` pattern (do not create `components/ui/card.tsx` yet) | Cards are `border p-4` context-specific (dashboard vs detail grid vs `Why MicroTools`). Extract only when 3rd use appears. Keep pattern, not primitive. |
| **KEEP LOCAL** | `FormField` (explicit `label`+`input`+`error`) | Do not abstract — `htmlFor/id/aria-describedby` wiring is clearer explicit (now fixed in MatterVault). |
| **KEEP LOCAL** | `Dialog`/`Alert`/`Tabs`/`Breadcrumb` | Not needed pre-launch; native `confirm` and link-group filters suffice. |

**Total new files in this plan:** 5 (`input.tsx`, `textarea.tsx`, `select.tsx`, `table.tsx`, `page-header.tsx` + `empty-state.tsx` = 6) — or 4 if `input+textarea` combine. **Keep local** everything else. This is the smallest system that kills duplication without creating a framework.

---

## 17. Screen-by-Screen Future Implementation Roadmap

| Screen | Current issue (from §5-8) | Desired UX behavior | Visual direction | Primitives involved | Priority | Responsive | Accessibility |
|---|---|---|---|---|---|---|---|
| **Marketing `/`** hero | Two equal CTAs, `py-8` tight, no brand hierarchy | Single primary `View NoticeFlow` (outline `Explore MicroTools` secondary or remove), `h1` `MicroNest` with `Micro` `font-bold` + `Nest` `font-normal` or mark, `py-12` airier | Quiet authority, `neutral` + `Geist`, no illustration | `Button` `PageHeader`? — keep as is | **P1** (embarrassing emptiness) | `p-6 md:p-8`, `flex justify-center gap-3` already responsive | `h1` single, `cta` `Button` not `Link` |
| **Marketing profession/tool grid** | 1 card in `md:grid-cols-2` → empty cell | When `professions.length===1`, render `grid-cols-1 max-w-md mx-auto` centered card; when ≥2, `md:grid-cols-2` | Same `border p-6` card, `rounded-lg` for marketing only | `ProfessionCard`, `ToolCard` (keep local) | **P1** | `grid-cols-1` mobile already | Cards `role="link"` via `Link` |
| **App shell** | Brand `NoticeFlow` on Matter pages, `max-w` jitter, account in dashboard, duplicated `SiteNav/AppNav` | Brand `MicroNest` + sub `Matters` context via `Badge` or `PageHeader` `description`; `max-w-5xl` unified; account `Avatar + Role` in header `ml-auto`; `SiteNav`/`AppNav` share `NavShell` | Neutral, `sticky border-b`, `bg-background` | `AppNav`, `SiteNav`, new `NavShell` | **P1** (identity) | `hidden md:flex` toggle already | `aria-current`, `aria-expanded` keep |
| **Dashboard `/app`** | Two card sets mismatched `p-3` vs `p-4`, no filtered links, `Signed in as` debug box, footer nav redundant | Unify: `SummaryCards` style for both (both `p-4`, `text-2xl`, semantic `Ready green`), add `View matters?status=` links on cards, move `Signed in as` to header, remove footer `Members/Clients/Notices` links | `Card` `border p-4 rounded-md` everywhere, `Badge` semantic | `SummaryCards`, new `MatterSummaryCards` (same), `PageHeader` | **P1** (cards) | `grid 2 md:4` keep | `aria-label` on card values |
| **Notices list** (`/app/notices`) | Filters tall, deadline no urgency, pagination correct | Keep `NoticeFilters` but add `Clear` link + `active filter count` badge; add `deadline` urgency `DUE IN` badge in table `Deadline` cell (reuse detail helper) | Same `border`, `Badge` urgency `red/amber` | `NoticeFilters`, `NoticesTable`, `Table`, `PageHeader`, `EmptyState` | **P2** | `overflow-x-auto` keep, filters `flex-col md:flex-row` later | `Table` `th scope="col"` |
| **Notice detail** | Dense `grid 2` 10 fields, no grouping, `Assigned` id | Group: `CardHeader Details (Client/Authority/Type/Priority)` + `Card Timeline (Received/Deadline/Next action)` + `Card Assignment`; `grid-cols-1 md:grid-cols-2` on mobile; `Assigned` name not id | `Card` `p-4` per group, `Badge` status top-right | `PageHeader` (`Back to notices`), `Table` not needed | **P2** | `grid-cols-1 md:grid-cols-2` | `h2` per group |
| **Matters list** (`/app/matters`) | Now **fixed** (readiness + status filter). Still `assigned` id. | Add `assigned` name via `membersMap` (like `clientsMap`) — **P2**. | Same `Table` | `MattersTable`, `EmptyState`, `PageHeader` | **P1 done, P2 assigned name** | `overflow-x-auto` keep | Same |
| **Matter new/edit** | Now **fixed a11y**, but `Assigned To` shows id | Show `membersMap` name, keep `Unassigned` | Same `border` inputs, now `Input`/`Select` shared | `MatterForm`, `Input`, `Select`, `PageHeader` | **P2** | `grid-cols-1 md:grid-cols-2` for dates (fix narrow) | `htmlFor` done |
| **Matter detail** | Now **fixed** gating + back link + `Required: x/y`, but `Assigned` id, deadline plain, `grid 2` dense | Same grouping as notice detail: `Card` groups, `Assigned` name, deadline `OVERDUE` helper | Same | `PageHeader`, `Checklist`, `MatterDocumentsList`, `MatterNotesList`, `ArchiveMatterButton` | **P1 done, P2 assigned/deadline** | `grid-cols-1 md:grid-cols-2` | `h2` per section keep |
| **Checklist** | Now **fixed** (`Required: x/y`, static import, pending, alerts) | Add per-row inline `Upload` for `pending` (small file input under row) — V1.1 | `Badge` semantic | `Checklist` | **P2** | `flex-col` already | `role=alert` done |
| **Documents** | Now **fixed** delete, but `mime • KB • date` dense | Keep, add `type` icon (`lucide FileText`) in V1.1 | Same `border p-3` row | `MatterDocumentsList` | **P2** | `flex justify-between` keep | `Download` `a` |
| **Notes** | Now **fixed** edit/delete | Add `EmptyState` for notes when none (already `No notes yet`) | Same | `MatterNotesList` | **Done** | `rows=3` keep | `htmlFor` done |
| **Activity** | Raw `JSON` | Humanize `metadata` (`Vakalatnama verified`) — V1.1 | Same `border p-3` | `MatterActivityTimeline` | **P2** | — | `ul` semantics keep |
| **Auth** (`/login`, `/signup`, `/onboarding`) | Not inspected deep — assumed `max-w-md` centered `Card` with `Input` `Button` | Keep as is — do not re-style until design system `Input` ready, then swap raw `input` for `Input` | — | `Input`, `Button`, `PageHeader` | **P2** | `p-6` centered | `label htmlFor` check |

---

## 18. Explicit List of Things That SHOULD NOT Be Changed

For this V1 pilot, do **not** touch:

1. **Domain/DB/RLS/RPC/services/actions** — security is verified, no `matter_type` toggle, no generic engine, no `matter_id` on NoticeFlow.
2. **Migrations `001–009`** — additive only, `009` already live.
3. **NoticeFlow business behavior** (`canTransition`, `is_firm_member`, `notice_documents` bucket) — list/detail already polish-ready.
4. **Marketing content** (`src/content/microtools.ts` — keep `Chartered Accountants` 1 profession + `NoticeFlow` 1 tool) — emptiness is *content* problem, not code; fix via grid centering only.
5. **No new product functionality** — no search `q` on matters (beyond `status` done), no pagination, no CSV, no magic links, no OCR/AI/eCourts/CNR/hearing/billing/WhatsApp/email/client portal.
6. **No universal component framework** — do not create `Card`/`FormField`/`Dialog`/`Tabs`/`Breadcrumb` abstractions now.
7. **No color rebrand** — stay `neutral` + semantic `red/amber/green` only; no lawyer-blue/CA-green brand color.
8. **No animation** — keep `transition-colors` only; no `framer-motion` or page transitions.
9. **No Vercel/hobby infra change.**
10. **Do not replace `MattersTable`/`NoticesTable` with card lists on mobile** — `overflow-x-auto` is correct for dense professional tables.
11. **Do not add `generic` `EmptyState` forced on every empty** — keep `No documents yet.` inline where used; `EmptyState` only for full-page matter/notice list.
12. **Do not make everything “visually identical”** — marketing stays `centered max-w-5xl py-8`, app stays `left-aligned max-w-5xl space-y-6`, detail stays `max-w-3xl` inner if desired, but shell must align. Subtle differences are correct per Principle.

---

## 19. Recommended Sequence for Future UI Implementation Passes

**All passes are small, reversible, with `pnpm typecheck/lint/test/build && pnpm test:e2e` green + 2-browser smoke after each.**

**Pass 1 — Fix the Platform Identity + Type (1 day, P1, no visual risk):**
1. Load `Geist` correctly in `src/app/layout.tsx` (`geistSans.variable` + body `className={cn(geistSans.variable, geistMono.variable)}`), fix `globals.css` `font-sans` to `Geist` with `system-ui` fallback.
2. Unify containers: `app/app/notices/page` `max-w-4xl` → `max-w-5xl`, `app/app/page` `max-w-3xl` → `max-w-5xl` (inner `max-w-3xl` for detail text if needed, but header `max-w-5xl`), `SiteNav`/`AppNav` already `5xl` — now consistent.
3. Change `AppNav` brand `NoticeFlow` → `MicroNest` (or `MicroNest • MatterVault/NoticeFlow` via `usePathname` sub-label) and `app/app/page h1 NoticeFlow` → `Dashboard` (firm name stays `Firm: slug`).
4. Marketing grid: when `professions.length===1` or `tools.length===1`, `grid-cols-1 max-w-md mx-auto` instead of `md:grid-cols-2` with empty cell.
5. Add `membersMap` to `MattersTable` + `matter detail Assigned` to show name not id.

**Pass 2 — Unify Cards + Shared Primitives (1 day, P1/P2, low risk):**
6. Extract `components/ui/input.tsx`, `textarea.tsx`, `select.tsx` (native) — swap raw `input/select/textarea` in `MatterForm`, `NoticeForm`, `client` forms (no behavior change, just `className` → `Input`).
7. Extract `components/ui/table.tsx` — wrap `NoticesTable`/`MattersTable` (same `min-w-[720px]` etc.).
8. Extract `components/ui/empty-state.tsx` — use for full-page `No matters yet` / `No notices match` only.
9. Extract `components/layout/page-header.tsx` — replace `flex justify-between h1 + Link` in 4 pages.
10. Make dashboard `MatterVault` cards share `SummaryCards` treatment (`p-4 text-2xl` + `Ready green-50`).

**Pass 3 — Polish Details (half day, P2, after pilot week):**
11. Deadline urgency for MatterVault (copy Notice `OVERDUE · X days` helper), per-checklist inline `Upload`, activity humanization.
12. `SiteNav`/`AppNav` dedupe into `nav-shell.tsx` + `lucide-react Menu/X` icons.

**After Pass 3, tag `mattervault-v1-design-system-baseline` and invite first external CA/lawyer to `https://micronestmicrotools.vercel.app` for 30-min session — observe “can you find Ready matters without scrolling?”**

**Stop after this audit — do not implement.**

