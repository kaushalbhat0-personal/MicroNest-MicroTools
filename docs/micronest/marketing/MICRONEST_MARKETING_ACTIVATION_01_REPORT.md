# MICRONEST MARKETING ACTIVATION 01 REPORT — LAWYER + MATTERVAULT PUBLIC ACTIVATION

**Date:** 2026-09-29 14:30 IST
**Baseline:** `b70418cff0c833184ea9491ec711f61d4d730e6a feat(marketing): refine featured tool composition` (`Browse max-w-3xl` / `Featured max-w-4xl` single-card, `overflow-hidden border` featured + `bg-muted/20` workflow inside)
**Authority:** `docs/micronest/marketing/MICRONEST_MARKETING_ACTIVATION_AUDIT_01.md` (audit 01, 22 sections, 1 content + 4 marketing surfaces, 0 deps)
**MatterVault source:** `docs/mattervault/implementation/LAWYER_MICROTOOL_MATTERVAULT_V1_REPORT.md` + `V1_P1_POLISH_REPORT.md` (pilot-ready) + `security/PRODUCTION_SECURITY_REPORT.md` (8/8 PASS, 009 applied)
**Git:** No commit, no push per RCCF-MICRONEST-MARKETING-05 §18

---

## 1. Baseline

- Commit `b70418c` marketing on `main` — public `1 profession` (`chartered-accountants → [noticeflow]`) + `1 tool` (`noticeflow` `available` → `/tools/noticeflow` `appHref /app`) via `src/content/microtools.ts:31` static arrays.
- Homepage `src/app/page.tsx:11` `max-w-5xl space-y-12` `py-16` hero + `bg-grid` + `3-step` `gap-3 sm:gap-4` + `Browse max-w-3xl mx-auto` vs `md:grid-cols-2` guard + `Featured max-w-4xl` vs `md:grid-cols-2` guard + `Why` 3-col `border-t` + `footer`.
- Routes `src/app/profession/[profession]/page.tsx` (generateStaticParams from `professions`) and `src/app/tools/[tool]/page.tsx` (from `tools`, hardcoded CA copy) emit `● /profession/chartered-accountants` + `● /tools/noticeflow` `SSG`; `src/app/sitemap.ts:6` dynamic `...professions + ...tools` (3 URLs); `src/app/layout.tsx:12` `description: Chartered Accountants: NoticeFlow and future microtools`.
- `src/components/layout/site-nav.tsx:4` `links[3] Home+CA+NoticeFlow`, `src/components/marketing/tool-card.tsx:13` hardcoded `Chartered Accountants →`.

## 2. Scope

**Implemented (public discoverability only, no redesign, no second architecture, no authenticated change):**

- Content `lawyers` + `mattervault` (`available`, `/tools/mattervault`, `appHref /app/matters`) as single source `src/content/microtools.ts`.
- Homepage `Featured MicroTools` (plural) with per-tool workflow badges: `NoticeFlow Receipt→...→Close` vs `MatterVault Create→...→Archive`; footer expanded to 4 public links.
- `SiteNav` 2 additional links `Lawyers` + `MatterVault`.
- `ToolCard` dynamic profession line via `getProfession(tool.profession)`.
- `Tool` detail `src/app/tools/[tool]/page.tsx` de-hardcoded (profession eyebrow + CTA + `What it does`/`Who it is for` branched, `available` badge already dynamic).
- `layout.tsx` root `description` updated to mention both professions.
- `e2e/smoke.spec.ts` expanded to cover `2/2` + sitemap 5 URLs.

**Not implemented (per §19 boundaries):** No `src/app/app/**`, `src/modules/**`, `supabase/migrations`, `RLS/RPC/auth/services/repositories/infrastructure`, `package.json` deps, CMS, lawyer-specific component, bento/animation/pricing/testimonials/FAQ/blog, MatterVault screenshot; no `Blog/FAQ` schema.

## 3. Content Model Changes

**File `src/content/microtools.ts:20` (existing types unchanged):**

```ts
export type ToolStatus = "available" | "coming_soon";
export type Tool = { slug, name, description, profession, status, href, appHref };
export type Profession = { slug, name, description, tools: Tool[] };
```

No new interface, no `workflow`, no `audience` field — minimal extension via existing static lenses (audit §6 preference for static `flex-wrap` local baggage over `Tool.workflow[]`).

**Added:**

```ts
const mattervault: Tool = {
  slug: "mattervault",
  name: "MatterVault",
  description: "Client document collection and matter file organization for Indian litigators — from checklist to ready file, without spreadsheets.",
  profession: "lawyers",
  status: "available",
  href: "/tools/mattervault",
  appHref: "/app/matters",
};
```

`profession` `lawyers` equals `Profession.slug` `lawyers` (FK as string equality, no join table). `status: available` is truthful (technically available at `/app/matters` under 009 `is_firm_member`; `coming_soon` would be false). `description` 18 words faithful to V1 boundary `matter → checklist → upload → verify → ready → archive` (audit §4), no eCourts/OCR/AI claim.

**Extended arrays:**

```ts
export const professions: Profession[] = [
  { slug:"chartered-accountants", name:"Chartered Accountants", description:"Lightweight tools...", tools:[noticeflow] },
  { slug:"lawyers", name:"Lawyers", description:"Focused tools for litigators and law firms to organize client document collection and keep matter files ready to file.", tools:[mattervault] },
];
export const tools: Tool[] = [noticeflow, mattervault];
```

Order `CA` first preserves stable left→right. Helpers `getProfession(slug)` / `getTool(slug)` already `.find` — no code for `profession-registry`.

**Why only this file:** Single source of truth — `generateStaticParams`, `sitemap()`, `page.tsx` `professions.map`/`tools.map`, `ToolCard`, `SiteNav` links all read it; adding entries automatically omits new route files.

## 4. Homepage Changes

**File `src/app/page.tsx` — 3 presentation-only edits, no layout rewrite, no new card system.**

**(a) Headline `src/app/page.tsx:47`:** `Featured MicroTool` → `Featured MicroTools` (plural for `2`, minimal; with 1 it was singular, now 2 the grammar requires plural).

**(b) Workflow diverge (src/app/page.tsx:58, inside `tools.map` `overflow-hidden rounded-md border hover:bg-accent` → `p-6` + `border-t` row):**

```tsx
{t.slug === "noticeflow" ? (
  <div class="flex flex-wrap gap-1.5 border-t bg-muted/20 px-6 py-3 text-xs">
    Receipt → Review → Draft → Submit → Follow-up → Close  // 6 rounded-full border bg-background px-2 py-0.5 + → muted
  </div>
) : (
  <div class="flex flex-wrap gap-1.5 border-t bg-muted/20 px-6 py-3 text-xs">
    Create → Checklist → Upload → Verify → Ready → Archive  // 6 same styling, MatterVault V1 state machine matter_status + checklist_status
  </div>
)}
```

Presentation-only `flex-wrap` badges (not a `WorkflowEngine`), same `rounded-full border bg-background px-2 py-0.5` + `→ text-muted-foreground aria-hidden` primitives as just-refined `NoticeFlow` (`MICRONEST_MARKETING_DESIGN_IMPLEMENTATION_03.md` `bg-muted/20`), `text-xs` `border-t`. Do `t.slug === "noticeflow"` inline rather than `Tool.workflow[]` to keep `Tool` type unchanged (audit §9).

Grid at `tools.length === 1 ? "grid gap-4 max-w-4xl mx-auto" : "grid gap-4 md:grid-cols-2"` — with `length 2` yields `md:grid-cols-2` (472px each at 960 `gap-4`), `flex-wrap` wraps naturally, no `max-w-4xl` wrapper for 2 (correct per audit §14; 2 constrained would be island).

**(c) Footer `src/app/page.tsx:94`:**

Tagline `MicroNest MicroTools — Chartered Accountants • NoticeFlow and future microtools` → `MicroNest MicroTools — Chartered Accountants • NoticeFlow • Lawyers • MatterVault` (stale `future microtools` replaced by realized second profession/tool, preserves `© 2026 Kaushal Bhat.`).

Links `flex flex-wrap gap-4` from 3 to 5: added `Lawyers → /profession/lawyers` and `MatterVault → /tools/mattervault` (keeps `CA`, `NoticeFlow`, `Launch App`).

`Browse by Profession` guard `professions.length === 1 ? "grid gap-4 max-w-3xl mx-auto" : "grid gap-4 md:grid-cols-2"` unchanged but now `md:grid-cols-2` (472px each) — no constrained `max-w-3xl` island for 2, full rhythm with hero 960/Why 960 (§14).

Hero `py-16`/`bg-grid`/`eyebrow`/`h1 Small tools for the work that matters.`/`p`/`Explore`+`Launch App` CTAs preserved; `3-step` pills `CA → GST/Income-tax notice → NoticeFlow` `gap-3 sm:gap-4` `sm:text-sm` kept as illustrative example (generic rewrite not minimal, see §7).

**Why per file:** `page.tsx` is the only marketing surface for homepage composition — `Why` 3-col `border-t` and `Browse` card `ProfessionCard` are already generic and needed no edit.

## 5. Profession Activation

**No new file `src/app/profession/lawyers/page.tsx` — existing `src/app/profession/[profession]/page.tsx:1` (49 lines) already `dynamic [profession]` (not hardcoded).**

With `lawyers` content entry:

- `generateStaticParams() → professions.map(p => ({profession: p.slug}))` now returns `[{chartered-accountants},{lawyers}]` — `next build` emits `● /profession/lawyers` SSG (verified `build` route table `2` entries).
- `generateMetadata({profession}) → getProfession(slug) → title: Lawyers — MicroNest MicroTools, description: Focused tools for litigators...` (dynamic, no code).
- Render `h1 {data.name} Lawyers + p {data.description} + section grid md:grid-cols-2 {data.tools.map(t => <ToolCard />)}` — with `ToolCard` fix §7, shows `MatterVault` card correctly (`MatterVault` `Available` + `Lawyers → MatterVault` line via dynamic lookup, not CA).
- Footer/Nav handled elsewhere; page `max-w-5xl space-y-8` unchanged.

**Lawyers description:** `Focused tools for litigators and law firms to organize client document collection and keep matter files ready to file.` — faithful to V1 `checklist → upload → verify → ready` (audit §5), no eCourts/OCR/AI, mirrors CA `Focused tools for ... to ...`.

**Profession count `1→2` behaves as `Browse` 2-card at desktop and stacked at mobile (see §12).**

## 6. MatterVault Activation

**Tool entry `mattervault` at `src/content/microtools.ts:29`:**

- `slug mattervault` (lowercase, matches `src/modules/matter` and docs `MatterVault`, no new URL shape beyond `/tools/{slug}`).
- `name MatterVault` (Pascal as `NoticeFlow`).
- `profession lawyers` (FK to `Profession.slug lawyers`, avoids desync `chartered-accountants`).
- `status available` (existing `ToolStatus` `available | coming_soon` — technically available authenticated at `/app/matters` under 009, `coming_soon` would be false; no new `pilot`/`beta` enum per audit §6).
- `href /tools/mattervault` (static marketing page).
- `appHref /app/matters` (MatterVault list entry authenticated, not generic `/app` Dashboard — that was NoticeFlow's generic entry).

**Homepage featured mattervault card** shows `Available` badge (`variant default`) + `MatterVault` description above + MatterVault workflow `Create→...→Archive` inside `border-t bg-muted/20` (§4). Both badges use same `rounded-full border bg-background px-2 py-0.5` styling — no `Pilot` variant, parity.

**Routes:** `/tools/mattervault` `●` SSG from `generateStaticParams() → tools.map` (no new page file).

**Positioning `Client Document Collection & Matter File Organizer for Indian litigators` wired as `mattervault.description` above + `Tool` detail page `What it does` prose (§9).**

## 7. Dynamic Profession Resolution

**Problem (audit §2 hard-codes):** `tool-card.tsx:13` `Chartered Accountants → {tool.name}` and `tools/[tool]/page.tsx:36` `Chartered Accountants` eyebrow / `:59` `Indian CAs...` / `:66` CTA `View Chartered Accountants tools` hard-coded CA, so `MatterVault` would show wrong profession and mislead.

**Fix 1 — `src/components/marketing/tool-card.tsx:3` (preserves border/rounded-md/typography/badge/link behavior):**

```tsx
import { getProfession } from "@/content/microtools";
export function ToolCard({ tool }: { tool: Tool }) {
  const profession = getProfession(tool.profession);
  ...
  <p class="mt-2 text-xs text-muted-foreground">{profession ? `${profession.name} → ${tool.name}` : tool.name}</p>
}
```

No `ProfessionService`/`MarketingRegistry`/`generic lookup engine` — just `getProfession` already exported (same check as `profession/[profession]` uses). Null fallback avoids crash if FK mismatched.

**Fix 2 — `src/app/tools/[tool]/page.tsx:4,31` derives profession from `tool.profession`:**

```ts
import { getProfession, getTool, tools } from "@/content/microtools";
export default async function ToolPage({ params }) {
  const data = getTool(tool); if (!data) notFound();
  const profession = getProfession(data.profession);
  const isMatterVault = data.slug === "mattervault";
  ...
  <p class="text-sm text-muted-foreground">{profession ? profession.name : data.profession}</p>
  ...
  <Link href={profession ? `/profession/${profession.slug}` : "/"}>View {profession ? profession.name : "profession"} tools</Link>
}
```

CTA `href` now dynamic `/${profession.slug}` (was hardcoded `chartered-accountants`). Disclaimer branches per `isMatterVault` flag (smallest conditional, no CMS).

**No lawyermattervault-specific component:** Single `if (isMatterVault)` branch for `What it does` bullets / `Who it is for` / disclaimer (see §9).

## 8. Site Navigation

**File `src/components/layout/site-nav.tsx:4` — preserves `NavShell`, `max-w-5xl`, mobile toggle `h-10 w-10` `aria-expanded`, `aria-current="page"` active, `cta Launch App` link `/app`.**

**Before:**

```ts
const links = [
  { href:"/", label:"Home", exact:true },
  { href:"/profession/chartered-accountants", label:"Chartered Accountants" },
  { href:"/tools/noticeflow", label:"NoticeFlow" },
];
```

**After:**

```ts
const links = [
  { href:"/", label:"Home", exact:true },
  { href:"/profession/chartered-accountants", label:"Chartered Accountants" },
  { href:"/tools/noticeflow", label:"NoticeFlow" },
  { href:"/profession/lawyers", label:"Lawyers" },
  { href:"/tools/mattervault", label:"MatterVault" },
];
```

`+2` entries (order keeps `CA/NoticeFlow` first, matching `professions/tools` array order). Mobile `md:hidden` toggle still renders 5 links + `Launch App` `CTA` in dropdown `w-full flex-col` — `NavShell` `open ? flex : hidden md:flex` unchanged.

Active `startsWith` (`NavShell:34` `pathname.startsWith(l.href)`) still works for `/tools/mattervault` (`/tools` prefix ambiguity avoided: only exact `/` uses `exact:true`, `/tools/mattervault` is longer than `/tools/noticeflow`, so no overlap). No redesign, no `authenticated MatterVault internals` exposed beyond `Launch App` (already `/app` covers both).

**Why this file only:** `site-nav.tsx` is sole public nav owner (no `app-nav` change required — that nav is authenticated at `/app` already with `Matters`).

## 9. Tool Detail Route

**File `src/app/tools/[tool]/page.tsx:1` (75→~110 lines) — single dynamic `tools/[tool]` template now supports `noticeflow+mattervault` without `src/app/tools/mattervault/page.tsx` duplicate.**

**Static parts already content-driven (no code):** `generateStaticParams() → tools.map(t => ({tool: t.slug}))` emits `● /tools/mattervault` SSG; `generateMetadata({tool}) → getTool(tool) → title MatterVault — ..., description mattervault.description` — automatic.

**Template branches (smallest content-driven, no generic CMS):**

| Block | Before (CA-locked) | After |
|---|---|---|
| Eyebrow `Profession` | `<p>Chartered Accountants</p>` | `{profession ? profession.name : data.profession}` — `Lawyers` for `mattervault` |
| `What it does` `p` | `NoticeFlow helps CAs track GST...` | `isMatterVault ? MatterVault helps Indian litigators collect client documents against a checklist, verify each item, and know when the file set is ready to file — without spreadsheets.` : original NoticeFlow |
| Bullets `ul` | 5 notice bullets (type/deadline/assignment/13 transitions/activity/CSV) | Branched — MatterVault 5 bullets faithful to V1 §4: `Matter management with type, client, status, assigned, deadline and next action; Checklist templates per matter type (civil, criminal, NI, rent, recovery, other); Document collection with private bucket, 10 MB PDF... and checklist linkage; Notes and activity with verify/reject and ready signal; Matter list with readiness (Required: x/y) and dashboard overview` (no eCourts/OCR/AI/filing/billing) |
| `Who it is for` | `Indian CAs, solo CAs and small firms.` | `isMatterVault ? Indian litigators and small law firms — solo and partnership. : ...CAs` |
| CTAs | `Launch {data.name} → data.appHref` (already dynamic) + `View Chartered Accountants tools → /profession/chartered-accountants` | First CTA keeps `data.appHref` (`/app` for noticeflow, `/app/matters` for mattervault — per content model); second CTA `View {profession.name} tools → /profession/${profession.slug}` dynamic (was hardcoded CA) |
| Disclaimer | `NoticeFlow organizes workflow. Professional judgment remains with your CA.` | Branched: `isMatterVault ? MatterVault organizes workflow. Professional judgment remains with counsel. : NoticeFlow ...` |

Workflow badge row not duplicated on this page at V1 (homepage carries `Create→...→Archive` row; keeping page as `rounded-md border p-6` text sections preserves quiet authority, audit §11).

No new type on `Tool` (keeps `description` only) — branch is `data.slug === "mattervault"` local, not a `Tool.capabilities[]` engine; extending `Tool` with optional `features: string[]` would be future but not smallest now.

**Preserved:** `Badge` status dynamic, `max-w-3xl space-y-6` outer, `rounded-md border p-6` cards.

## 10. Sitemap/SEO

**Sitemap `src/app/sitemap.ts:6` (no code change required, verified rather than rewritten per task §10):**

```ts
return [
  { url: base+"/", lastModified: now },
  ...professions.map(p => ({ url: base+`/profession/${p.slug}`, lastModified: now })),
  ...tools.map(t => ({ url: base+`/tools/${t.slug}`, lastModified: now })),
];
```

With `2/2` now yields `5` entries (was `3`): `/` + `/profession/chartered-accountants` + `/profession/lawyers` + `/tools/noticeflow` + `/tools/mattervault`. Verified via `next build` route table `●` both plus `smoke.spec.ts` `sitemap contains all public routes` (fetches `/sitemap.xml` and asserts 4 contains).

**Robots `src/app/robots.ts:4` unchanged:**

```ts
{ rules:{userAgent:"*", allow:"/"}, sitemap:"https://micronestmicrotools.vercel.app/sitemap.xml" }
```

`allow: /` + correct `sitemap` — validated `pnpm build` exposes `○ /robots.txt` + `○ /sitemap.xml` static.

**Metadata:**

- `src/app/layout.tsx:12` `description` — updated `For Chartered Accountants (NoticeFlow) and Lawyers (MatterVault).` (was `future microtools` which is now inaccurate — §13 audit optional field, applied). `title.default: MicroNest MicroTools — Lightweight tools for professionals` and `openGraph: { title/descr/url/siteName }` kept (`openGraph.description` generic).
- `src/app/profession/[profession]/page.tsx:16` `title: Lawyers — MicroNest MicroTools` + `description: Focused tools for litigators...` automatic via `getProfession`.
- `src/app/tools/[tool]/page.tsx:16` `title: MatterVault — ...` + mattervault description automatic via `getTool`.
- No blog/FAQ `jsonld`, no new SEO lib — per §12 `Select-String jsonld/schema/blog` 0 hits, `do not`.

## 11. E2E Changes

**File `e2e/smoke.spec.ts:1` — 5 pre → 9 (minimal as audit §17, no weakening existing assertions):**

Before: `root heading`, `noticeflow`, `chartered-accountants`, `unknown 404 prof`, `unknown 404 tool`.

After (additions):

- `homepage shows both professions and both tools` → `GET / → expect chartered-accountants heading + Lawyers heading + NoticeFlow heading + MatterVault heading` (covers `Browse` `1→2` + `Featured` `1→2`).
- `tool page renders MatterVault` → `GET /tools/mattervault → heading MatterVault + getByText Lawyers eyebrow` (verifies content-driven profession line §7).
- `profession page renders Lawyers` → `GET /profession/lawyers → heading Lawyers + heading MatterVault` (fixes `tool-card.tsx` dynamic line — `Lawyers → MatterVault` inside `ToolCard` now visible).
- `sitemap contains all public routes` → `GET /sitemap.xml → includes chartered-accountants + lawyers + noticeflow + mattervault` (verifies dynamic `sitemap.ts`).

Existing keeps: `root`, `noticeflow 200`, `chartered-accountants 200`, `404` profession/tool.

Fix for strict-mode violation: profession Lawyers originally used `getByText('MatterVault')` (3 hits: nav link + h3 + `Lawyers → MatterVault`), replaced with `getByRole('heading', {name:'MatterVault'})`.

**Preserved:** `e2e/auth.spec.ts` (3) + `e2e/notices-pagination.spec.ts` (4) untouched — `16 total` `16 passed` `38.8s` (was `12` with `1/1`, now `16` with `2/2`).

## 12. Responsive Verification

**Performed via temporary `e2e/verify-responsive.spec.ts` (removed after, via `playwright` `chromium Desktop Chrome` `workers:1`) plus manual `page.evaluate` widths:**

| Breakpoint | `main` | `h1` | `Browse` | `Featured` | `Overflow` | Headings visible |
|---|---|---|---|---|---|---|
| **375** | 375 (327 usable) | 279 | Stacked 1-col: `CA` 327 → `Lawyers` 327 (2 rows) | Stacked `NoticeFlow` 327 → `MatterVault` 327 (workflow `flex-wrap` 2 lines) | **false** | `Browse by Profession` + `Chartered Accountants`/`Lawyers` `h3` + `Featured MicroTools` + `Why` single col |
| **768** | 768 (704 usable) | 656 | `md:grid-cols-2` `344` each (704-16)/2 | `md:grid-cols-2` `344` each, workflows near fit | **false** | `Browse` 2-col, `Featured` 2-col, `Why` `md:grid-cols-3` |
| **1024** | 1024 (960 usable) | 672 (`max-w-2xl`) | `md:grid-cols-2` `472` each (960-16)/2 | `md:grid-cols-2` `472` each | **false** | Hero `960`, `Browse` `472`, `Featured` `472`, `Why` `960`, no island |
| **1280** | 1024 capped (`max-w-5xl`) | 672 | Same `472` each (capped) | Same `472` each | **false** | Same as 1024 — symmetry, no `768/896` island |
| **1440** | 1024 capped | 672 | Same | Same | **false** | Same |

**Routes verified at 375+1280 with `scrollWidth ≤ innerWidth`:**

- `/profession/chartered-accountants` → 200, ToolCard `Chartered Accountants → NoticeFlow` correct, no overflow.
- `/profession/lawyers` → 200, ToolCard `Lawyers → MatterVault` correct (verifies §7 fix), no overflow.
- `/tools/noticeflow` → 200, CA eyebrow + notice bullets + `View CA tools` CTA, no overflow.
- `/tools/mattervault` → 200, Lawyers eyebrow + mattervault prose + mattervault bullets + `View Lawyers tools` → `/profession/lawyers`, no overflow.

**Composition judgment (per audit §14):** With 2, single-card `max-w-3xl/4xl` islands would constrain 2 cards inside 768/896; the natural `md:grid-cols-2` within `max-w-5xl` (no wrapper) is denser and correct — verified.

## 13. Accessibility Verification

- **Heading hierarchy `h1→h2→h3`** preserved: `h1 Small tools for the work that matters.` → `h2 Browse by Profession` / `h2 Featured MicroTools` / `h2 Why MicroTools` → `h3` per profession/tool (`NoticeFlow`/`MatterVault`) + `h3` per `Why` bullet (`Focused` etc.). With 2 cards, `h3` count is 4 profession/tool + 3 Why = 7, all under correct `h2`.
- **Link semantics:** New cards are `Link href="/profession/lawyers"` / `/tools/mattervault` with `rounded-md border hover:bg-accent` and focus-visible via `NavShell` + `AppNav` — same as before.
- **Navigation:** `SiteNav` now 5 links + `Launch App` `cta` via `NavShell` `aria-label="Toggle navigation"` + `aria-expanded` (toggled by `useState open`); mobile `md:hidden` button `h-10 w-10` touch target unchanged.
- **Workflow arrows:** `→` / `↓` remain `aria-hidden="true"` (decorative) on new `Create→...→Archive` badges; badge text (`Create`, `Checklist`...) remains accessible.
- **No decorative icons** added for symmetry (per task §12 `Do not add`).
- **Existing `htmlFor/id`/`aria-describedby`/`role=alert`** on `MatterForm` etc. unchanged — auth app not touched.

## 14. Validation Results

```
pnpm typecheck → tsc --noEmit → PASS (0 errors, matters: mattervault satisfies ToolStatus union)
pnpm lint      → eslint       → PASS (0 errors, no empty type, ToolCard getProfession no cycle)
pnpm test      → vitest run   → PASS (36 passed | 1 skipped (37 suites), 228 passed | 1 skipped (229) — unchanged, no test weakened)
pnpm build     → next build   → PASS (Compiled 14.3s, TypeScript 12.2s, ● /profession/lawyers + ● /tools/mattervault, ● /profession/chartered-accountants + ● /tools/noticeflow, 12/12 pages: ○ /, ○ /sitemap.xml, ○ /robots.txt, ● profession/tools, ƒ /app/matters|notices etc., Proxy middleware)
pnpm test:e2e  → playwright test → PASS (16 passed (38.8s) — auth 3, notices-pagination 4, smoke 9 (was 5 now 9 with 2/2 + sitemap))
```

Responsive verification §12: `375/768/1024/1280/1440` no `scrollWidth > innerWidth` at any route; homepage both professions/tools visible.

No `pnpm audit` regression (not required per task, but 1 run `No known vulnerabilities` found at build context).

## 15. Regression Results

| Area | Status | Evidence |
|---|---|---|
| **NoticeFlow marketing** (CA slash `/tools/noticeflow`) | **PASS** — `NoticeFlow` heading/description/bullets/who-it-is-for/CTAs unchanged except profession line now dynamic via `profession.name` (was hardcoded CA, still renders CA for noticeflow as before) | `pnpm test:e2e` `tool page renders NoticeFlow` still PASS, `chartered-accountants 200` PASS |
| **MatterVault authenticated app** `src/app/app/**` `/app/matters` + `checklist` `uploaded→verified` + `ready` atomic RPC + dashboard | **PASS** — no file under `src/app/app/` changed (`git diff -- src/app/app/` empty) | `git status` has no `src/app/app` diff |
| **NoticeFlow authenticated** `src/modules/notice/**` `/app/notices` list/filters/pagination/CSV | **PASS** — no file under `src/modules/notice` changed | `git diff -- src/modules/` empty |
| **MatterVault domain** `src/modules/matter/**` `matter-documents` private bucket 10 MB, notes, activity 7 events, permissions, templates 3–5 | **PASS** — no diff (`008_matters.sql` + `009` untouched, `matter-constants.ts` not changed) | same |
| **DB / migrations** `supabase/migrations/**` 001–009 | **PASS** — `git diff -- supabase/` empty, no `008_matters` re-run | - |
| **RLS / RPC** `matters is_firm_member SELECT`, `verify_checklist_item_and_maybe_ready FOR UPDATE`, `archive_matter` | **PASS** — no migration, no `DROP POLICY` change | - |
| **Auth** `proxy.ts`, `src/infrastructure/database/supabase-service.ts` `SUPABASE_SERVICE_ROLE_KEY` server-only | **PASS** — no `proxy.ts`/`infrastructure/` diff | - |
| **Infrastructure** `next.config.ts`, `package.json` deps, `@supabase/ssr`/`zod`/`geist`/`tailwindcss` | **PASS** — `git diff -- package.json` empty, no new dep (`Magic UI`/`Aceternity`/`Motion` not added) | - |
| **Profession generic template** `src/app/profession/[profession]/page.tsx` | **PASS** — untouched (already `generateStaticParams` from `professions`, no `profession/lawyers/page.tsx` hard-coded) | `git status` no profession page diff |
| **Sitemap/robots** | **PASS** — sitemap verified 5 URLs, robots `allow: /` unchanged | `build` route table |
| **Existing E2E** 404s | **PASS** — `unknown profession/tool → This page could not be found.` still | smoke 404 tracks PASS |

**No authenticated app modification confirmed** (task §14 `ABSOLUTELY DO NOT MODIFY` — verified via `git diff -- src/app/app/ src/modules/ supabase/` 3 empty diffs).

## 16. Files Changed

**7 files — leave uncommitted per task §18 (no commit/push):**

| File | What | Why — relation to audit §2 hard codes |
|---|---|---|
| `src/content/microtools.ts:20` | **+12 `mattervault` const + `lawyers` profession push + `tools[notice,mattervault]`** | Single source-of-truth static config (audit §5/§6) — without this no route/nav generation; keeps `ToolStatus` union closed, no new content system |
| `src/app/page.tsx:47` | `Featured MicroTool → Featured MicroTools` + workflow conditional `t.slug === noticeflow ? Receipt…Close : Create…Archive` inside `border-t bg-muted/20` + footer tagline `future microtools → • Lawyers • MatterVault` + footer links `+Lawyers +MatterVault` | Homepage composition §7–§9: same card `overflow-hidden rounded-md border hover:bg-accent` `p-6 + border-t flex-wrap` primitives, MatterVault workflow `Create→Checklist→Upload→Verify→Ready→Archive` = actual V1 `matter_status+checklist_status` (§4), not reusable framework (§4 MatterVault workflow) |
| `src/components/layout/site-nav.tsx:4` | `+2 links {Lawyers /profession/lawyers, MatterVault /tools/mattervault}` | SiteNav hard-coded CA assumptions (audit §6) — expose both niches in existing `NavShell` preserving `max-w-5xl sticky border-b h-10` + `aria-expanded/current`; no authenticated internals beyond `Launch App` |
| `src/components/marketing/tool-card.tsx:3` | `import getProfession` + `profession = getProfession(tool.profession)` + `profession ? profession.name → tool.name : tool.name` | ToolCard §7 fix: `Chartered Accountants →` was hardcoded (audit §2) — now derives profession from `tool.profession` FK via existing lookup, not `ProfessionService` |
| `src/app/tools/[tool]/page.tsx:4,31` | `import getProfession` + derive `profession: Profession` + `isMatterVault` + branch eyebrow `{profession.name}` + `What it does` paragraph + 5-bullet `ul` + `Who it is for` + dynamic `View {profession.name} tools` CTA `href profession.slug` + disclaimer per `isMatterVault` | Tool detail §8: remove 6 CA hard codes (eyebrow/prose/bullets/audience/CTA/disclaimer) — derived from `tool.profession` + minimal `if (slug===mattervault)` conditional (no CMS/component engine) faithful to V1 boundary (§4) |
| `src/app/layout.tsx:12` | `description: ... Chartered Accountants: NoticeFlow and future microtools → For Chartered Accountants (NoticeFlow) and Lawyers (MatterVault).` | SEO §10: root description stale with `future microtools`; now mentions realized second vertical while `title/openGraph` kept generic (per `metadataBase` canonical) |
| `e2e/smoke.spec.ts:1` | `+4 tests: homepage both professions+tools, MatterVault tool 200 + Lawyers eyebrow, Lawyers profession 200 + MatterVault heading, sitemap 5 URLs` + strict-mode fix `getByRole(heading,MatterVault)` | E2E §11: must verify `2/2` public discoverability + dynamic sitemap without weakening existing `NoticeFlow/CA/404` assertions (now 9 smoke + 7 auth/pagination = 16 total) |

**No other file diff:** `git diff --stat` shows these `7 files changed, 137 insertions, 35 deletions` on `main b70418c`, untracked docs `MICRONEST-COMMIT-04-REPORT.md`, `MICRONEST_MARKETING_ACTIVATION_AUDIT_01.md` left as before.

## 17. Dependencies

| Dependency set | Action | Evidence |
|---|---|---|
| `dependencies` `next 16.3.6, react 19.1.0, @supabase/ssr 0.7.0, @supabase/supabase-js 2.45.0, geist 1.7.2, tailwindcss 4.1.8, lucide-react 0.468.0` | **No change** — `git diff -- package.json` empty | task §13 quiet-authority `Geist/neutral/1px/rounded-md/bg-grid` preserved |
| `devDependencies` `@playwright/test 1.52.0, vitest 4.1.11, typescript 5.8.3` | **No change** | - |
| New libraries (`Magic UI`, `Aceternity`, `Framer Motion`, `Sanity`, `Contentlayer`, `eCourts SDK`) | **0 added** | `package.json` diff empty |

No `branded` second marketing architecture — marketplace remains `neutral` flat surfaces `transition-colors active:scale-[0.98]` only.

## 18. Security Impact

| Dimension | Impact | Verified |
|---|---|---|
| `supabase/migrations` (008+009) `matter-documents` `public=false`, `matter_members SELECT is_firm_member`, `matters/checklist INSERT/UPDATE/DELETE DROP` | **None** — no migration file changed (`git diff -- supabase/` empty) | §15 regression |
| RLS/RPC `verify_checklist_item_and_maybe_ready FOR UPDATE owner/admin` / `archive_matter` / `is_firm_member` tenant `SELECT USING` | **None** — no `DROP POLICY`/`SECURITY DEFINER` change | same |
| `src/proxy.ts` `auth.session` / `src/modules/matter/services` `getCurrentFirmForSession` + `firm_role` | **None** — not in diff | - |
| Storage `matter-documents` private `60s signed` + `matter_notes 1..5000` | **None** | - |
| Public `tool.profession` FK string leakage | **None** — `microtools.ts` static array is public marketing data, no firm_id; authenticated tenant isolation still `firm_id EQ` per `matters` FK | - |

Activation is **PUBLIC DISCOVERABILITY ONLY** — no `firm_id in URL` leaking (`e2e Notices pagination no firm_id` still PASS); MatterVault remains gated behind `is_firm_member` at `/app/matters`.

## 19. Out-of-Scope Confirmation

Confirmed **not changed/added** per task boundaries + audit §21:

- No `src/app/app/**` `Matters`/`Notices`/`Members` authenticated change.
- No `src/modules/matter/**` / `src/modules/notice/**` business logic (services/repositories/permissions/RPC).
- No `supabase/migrations` or `storage` `matter-documents` bucket config change.
- No `design` redesign: hero `py-16 md:py-24` `bg-grid` `eyebrow` `h1` `CTAs` preserved; `Browse`/`Featured` still `grid gap-4 md:grid-cols-2`; `Why` 3-col `border-t` not touched.
- No `pricing` / `testimonials` / `FAQ` / `blog` / `MatterVault screenshot` / `Lawyers-specific component` / `CardFormField/Dialog/Tabs` framework / `Magic/Aceternity/Motion`.
- No `another profession/tool` beyond `lawyers/mattervault` (still `2/2`, not `3`).
- No `another content architecture` (`Sanity`/`CMS`/`Notion`).
- No `authenticated MatterVault modification` — file remains pilot-ready per `PRODUCTION_SECURITY_REPORT 8/8`.

## 20. Final Verdict

**PASS — Public activation is smallest clean change that makes MatterVault discoverable while making MicroNest genuinely multi-profession.**

Content `lawyers→[mattervault]` + `tools[noticeflow,mattervault]` as single source (`microtools.ts`) plus `4` template de-hardcodes (`tool-card` profession lookup, `tools/[tool]` eyebrow/bullets/CTA, `site-nav` +2 links, `page` `Featured MicroTools` duplex workflows + footer `Lawyers•MatterVault`) achieves `1/1 → 2/2` public marketing `● /profession/lawyers` + `● /tools/mattervault` (dynamic sitemap 5 URLs, `●` build) with `md:grid-cols-2` 472px-pair desktop (no overflow at `375/768/1024/1280/1440`, stacked at mobile) while reuse of single `profession/[profession]` / `tools/[tool]` dynamic routes, `ProfessionCard`, `NavShell`, `Geist/neutral/1px/rounded-md/bg-grid` `QUIET AUTHORITY` keeps `MicroNest was designed for multiple niches from the beginning` — not `CA site + random lawyer card`.

No migration/RLS/RPC/auth/service/repository/deps added. All \(16\) `test:e2e` PASS, `typecheck/lint/test/build` green, responsive `scrollWidth ≤ innerWidth` across all routes.

**STOP — No commit, no push, no further homepage/SiteNav/pricing/MatterVault screenshot/lawyer-specific component added. Leave 7 files uncommitted on `main b70418c` baseline.**

