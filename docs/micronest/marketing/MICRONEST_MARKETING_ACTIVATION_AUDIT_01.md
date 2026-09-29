# MICRONEST MARKETING ACTIVATION AUDIT 01 — LAWYER + MATTERVAULT PUBLIC ACTIVATION

**Date:** 2026-09-29 13:00 IST
**Baseline:** `b70418cff0c833184ea9491ec711f61d4d730e6a feat(marketing): refine featured tool composition` (homepage `py-16` hero + `bg-grid`, 3-step `gap-3 sm:gap-4`, `Browse max-w-3xl`/`Featured max-w-4xl` single-card + integrated workflow `border-t bg-muted/20`)
**Mode:** Audit + planning only — no code, no deps, no DB, no RLS/RPC, no commit/push
**Scope:** Smallest controlled change to make `Lawyers → MatterVault` publicly discoverable while making MicroNest genuinely multi-profession

---

## 1. Executive Summary

MicroNest marketing is **correct for 1 profession / 1 tool but not for 2 / 2**. The entire public surface is content-driven except three hard-coded marketing surfaces that would make MatterVault look appended later:

- `src/content/microtools.ts:31` has `professions[1]` `chartered-accountants → [noticeflow]` and `tools[1]` `noticeflow`; adding a second entry is trivial, but two templates currently contain CA/NoticeFlow literal text that would diverge.
- `src/app/page.tsx:39` and `:48` guard single-card editorial widths with `professions.length === 1 ? "grid gap-4 max-w-3xl mx-auto" : "grid gap-4 md:grid-cols-2"` — the branch is **already written for 2** (the `md:grid-cols-2` fallback), so no layout rewrite is needed; the only question is whether constrained `max-w-3xl/4xl` wrapper is still appropriate.
- `src/components/layout/site-nav.tsx:4` and `src/app/tools/[tool]/page.tsx:36,45,59,66` hard-code `Chartered Accountants` / `NoticeFlow` strings, so a second tool would render incorrect profession and misleading `What it does` copy.

MatterVault as implemented is **pilot-ready but not self-serve at scale** (see §4). Its V1 contract is strictly `matter created → checklist issued → client uploads → lawyer verifies/rejects → file ready → archive` with `Vakalatnama/ID proof/...` templates, `matter-documents` private bucket 10 MB `pdf/jpg/png/docx`, notes `1..5000`, 7 activity events. No eCourts/OCR/AI/hearing/billing/WhatsApp/client portal exists, so marketing must not claim them.

The smallest clean activation is **1 content file + 4 marketing surfaces + 0 new deps + 0 new routes/templates** (see §18). Profession/tool counts go `1/1 → 2/2`, homepage automatically becomes `md:grid-cols-2` two-card grid at desktop, sitemap/metadata/e2e surface becomes multi-profession without a second architecture, and the hero `Profession → Workflow → MicroTool` mental model remains valid because it already describes `Lawyers → matter workflow → MatterVault` as naturally as `CAs → notice workflow → NoticeFlow`.

**No redesign, no second marketing architecture, no CMS, no lawyer-specific component, no authenticated app change.**

---

## 2. Current Marketing Architecture

**File tree inspected:**

```
src/content/microtools.ts            — static content (professions[], tools[], getProfession/getTool)
src/app/page.tsx                     — public homepage (SiteNav + hero + 3-step + Browse + Featured + Why + footer)
src/app/profession/[profession]/page.tsx — dynamic profession page (generateStaticParams from professions[], generateMetadata, ToolCard grid)
src/app/tools/[tool]/page.tsx        — dynamic tool page (generateStaticParams from tools[], hardcoded CA + NoticeFlow copy)
src/components/marketing/profession-card.tsx — generic ProfessionCard (Link + Badge tools.length)
src/components/marketing/tool-card.tsx      — generic ToolCard (Link + Badge status + hardcoded CA line)
src/components/layout/site-nav.tsx   — public nav (hardcoded links[3]: Home, CA, NoticeFlow + Launch App CTA)
src/components/layout/nav-shell.tsx  — thin NavShell (max-w-5xl, toggle h-10, aria-expanded/current)
src/app/layout.tsx                   — RootLayout (GeistSans/Mono variable, metadataBase, title/description/openGraph)
src/app/sitemap.ts                   — dynamic sitemap (base / + ...professions + ...tools)
src/app/robots.ts                    — static robots (allow /, sitemap)
src/app/globals.css:29               — .bg-grid Tailark 40px grid (MIT, comment)
e2e/smoke.spec.ts                    — 5 tests (root heading Small tools..., NoticeFlow tool, CA profession, 404s)
```

**Request flow:**

```
GET /              → src/app/page.tsx (reads professions/tools, renders hero/Browse/Featured via ProfessionCard + inline Featured link)
GET /profession/:slug → src/app/profession/[profession]/page.tsx (getProfession(slug) → notFound() → title/desc + grid md:grid-cols-2 ToolCard)
GET /tools/:slug      → src/app/tools/[tool]/page.tsx (getTool(slug) → notFound() → hardcoded CA sections + appHref CTA)
GET /sitemap.xml   → src/app/sitemap.ts (professions.map + tools.map)
GET /robots.txt    → src/app/robots.ts
SiteNav            → site-nav.tsx:4 links[] → NavShell → pathname startsWith active
```

**Static vs dynamic:**

- `professions`/`tools` are **static in-process arrays** (no DB, no CMS, no fetch, no file read) at `src/content/microtools.ts:30`.
- `generateStaticParams` in both dynamic routes enumerates slugs from those arrays, so `next build` emits `● /profession/chartered-accountants` and `● /tools/noticeflow` as SSG.
- Adding entries to the arrays automatically extends `generateStaticParams`, `sitemap()`, and homepage iteration without new route files.
- `src/app/layout.tsx:12` root `description` is `Chartered Accountants: NoticeFlow and future microtools` — a second product will need wording change but not structure change.

**Current branch guards (critical for 2-card with no rewrite):**

`src/app/page.tsx:39`:
```tsx
<div className={professions.length === 1 ? "grid gap-4 max-w-3xl mx-auto" : "grid gap-4 md:grid-cols-2"}>
```
`src/app/page.tsx:48`:
```tsx
<div className={tools.length === 1 ? "grid gap-4 max-w-4xl mx-auto" : "grid gap-4 md:grid-cols-2"}>
```
When `length === 2`, these evaluate to `"grid gap-4 md:grid-cols-2"` (no `max-w` constraint) — i.e. the homepage **already knows how to show 2**. The audit question (§8/§9) is whether that is the right 2-card composition or whether editorial `max-w` constraints are still needed.

**Hard-coded surfaces (the only non-content-driven parts):**

| Location | Hard code | Impact for 2nd profession |
|---|---|---|
| `site-nav.tsx:6` | `"/profession/chartered-accountants"` label `Chartered Accountants` | Would not show Lawyers |
| `site-nav.tsx:7` | `"/tools/noticeflow"` label `NoticeFlow` | Would not show MatterVault |
| `tools/[tool]/page.tsx:36` | `<p>Chartered Accountants</p>` above title | MatterVault would show wrong profession |
| `tools/[tool]/page.tsx:45` | `<p>NoticeFlow helps CAs track GST...` | Wrong product description |
| `tools/[tool]/page.tsx:48-53` | `<li>Notice management...` 5 bullets for notices | Wrong feature list |
| `tools/[tool]/page.tsx:59` | `<p>Indian Chartered Accountants...` | Wrong audience |
| `tools/[tool]/page.tsx:66` | `href="/profession/chartered-accountants"` CTA | Wrong profession link |
| `tool-card.tsx:13` | `<p>Chartered Accountants → {tool.name}</p>` | Would show CA for MatterVault |
| `page.tsx:100-105` | Footer links CA + NoticeFlow only | Incomplete sitemap for 2/2 |
| `layout.tsx:12` | `description` mentions only `Chartered Accountants: NoticeFlow` | SEO stale |
| `page.tsx:34` | Middle 3-step pill `GST/Income-tax notice` | Single-workflow example — ambiguous for 2 (acceptable, see §7) |

**All other surfaces are content-driven and need no code except content entries.**

---

## 3. Current Content Model

**Types at `src/content/microtools.ts:1`:**

```ts
export type ToolStatus = "available" | "coming_soon";
export type Tool = {
  slug: string;
  name: string;
  description: string;
  profession: string;  // FK to Profession.slug, not FK enforced
  status: ToolStatus;
  href: string;        // "/tools/{slug}"
  appHref: string;     // "/app" | "/app/matters" etc.
};
export type Profession = {
  slug: string;
  name: string;
  description: string;
  tools: Tool[];
};
```

**Current values:**

```ts
const noticeflow: Tool = {
  slug: "noticeflow",
  name: "NoticeFlow",
  description: "Notice workflow management for CA firms. Track GST and income-tax notices from receipt to closure — without spreadsheets.",
  profession: "chartered-accountants",
  status: "available",
  href: "/tools/noticeflow",
  appHref: "/app",
};
export const professions: Profession[] = [{
  slug: "chartered-accountants",
  name: "Chartered Accountants",
  description: "Lightweight tools for Chartered Accountants to manage statutory workflows with clarity.",
  tools: [noticeflow],
}];
export const tools: Tool[] = [noticeflow];
```

**Model properties:**

- One `Tool` belongs to one `Profession` via `tool.profession` string equality (no join table, no DB).
- `Profession.tools` is **duplicated reference** to same `Tool` objects (authoritative list is `tools[]`, profession view is lens).
- `href` is redundant with `slug` but kept for static routing (`/tools/{slug}`) — add for MatterVault as `"/tools/mattervault"`.
- `appHref` points into authenticated app: NoticeFlow `"/app"` (covers `/app/notices`), MatterVault should be `"/app/matters"`.
- `status` drives badge variant `default`/`outline` (`page.tsx:54`, `tool-card.tsx:10`, `tools/[tool]/page.tsx:38`).
- No `workflow`, no `features`, no `audience`, no `capabilities` arrays — tool page hardcodes them (see gap in §11).
- No `sortOrder`, no `featured` flag — order is array order.

**Implication for activation:** Adding Lawyers/MatterVault requires **one new `Tool` const + one new `Profession` entry + two array pushes**, not a new model. The `profession` FK string must be kept equal to the new profession `slug` or `Profession.tools` will desync.

---

## 4. MatterVault Source-of-Truth Review

**Docs inspected:** `docs/mattervault/implementation/LAWYER_MICROTOOL_MATTERVAULT_V1_REPORT.md` (V1 Phase 1, 53 files, 008 migration), `LAWYER_MICROTOOL_MATTERVAULT_V1_P1_POLISH_REPORT.md` (P1 7 fixes, pilot-ready, no marketing), `audits/LAWYER_MICROTOOL_MATTERVAULT_V1_COMMERCIAL_READINESS_AUDIT.md` (audit only, 7 P1 repaired), `security/LAWYER_MICROTOOL_MATTERVAULT_PRODUCTION_SECURITY_REPORT.md` (production 8/8 PASS, 009 applied, `public=false` bucket), `audits/MICRONEST_PRODUCT_READINESS_AUDIT.md` §5 (platform pilot-ready).

**Implemented V1 boundary (what can be marketed):**

| Dimension | Implemented | Evidence |
|---|---|---|
| **Core workflow** | `matter created → checklist issued → client uploads → lawyer verifies/rejects → file ready → archive` | `LAWYER_MICROTOOL_MATTERVAULT_V1_REPORT.md` §4 `verify_checklist_item_and_maybe_ready FOR UPDATE` + `matter_status open→ready→archived` + `checklist pending→uploaded→verified/rejected` |
| **Matter types** | 6: `civil, criminal, negotiable_instrument, rent, recovery, other` | `src/modules/matter/constants/matter-constants.ts:1` `MATTER_TYPES` |
| **Checklist templates** | Hard-coded 3–5 per type, `required` flags (e.g. civil: `Vakalatnama*, ID proof*, Agreement*, Payment proof`) — no DB template engine | `checklist-templates.ts:8` `CHECKLIST_TEMPLATES` — marketing must not promise configurable templates |
| **Documents** | `firm/{firmId}/matters/{matterId}/{docId}/{safeFilename}`, `matter-documents` bucket `public=false`, `10 MB`, `pdf/jpeg/png/docx`, `upsert:false`, cleanup on fail, linked `document_id → uploaded` | `LAWYER_MICROTOOL_MATTERVAULT_V1_REPORT.md` §8, `matter-document-schema.ts:18` |
| **Matter fields** | `title 1..200`, `matter_type` immutable after create, `status open/ready/archived`, `assigned_to` `SET NULL`, `next_action 500`, `next_action_date`, `deadline`; `firm_id/client_id/assigned_to` all `eq firm_id` tenant | `008_matters.sql:10` |
| **Notes** | `matter_notes` `1..5000`, `author_id = auth.uid()`, append + edit/delete own on assigned (owner any) | `matter-note-service.ts` |
| **Activity** | `matter_activity` 7: `matter_created, checklist_issued, document_uploaded, document_verified, note_added, matter_ready, matter_archived` append-only `is_firm_member` | `matter-activity-types.ts:7` |
| **Permissions** | OWNER/ADMIN full, MEMBER `view all, upload only assigned, notes own on assigned`, cannot `create/edit/verify/archive`; RPC `auth.uid()+is_firm_member+owner/admin+FOR UPDATE` | `matter-permissions.ts` |
| **Dashboard** | `open/awaiting/ready/overdue` via `getMatterDashboardSummary` (distinct matter_ids where `required != verified` among open) | `get-matter-dashboard-summary.ts` |
| **Routes** | `/app/matters` list (`?status` filter + `Required: x/y` readiness), `/app/matters/new`, `/app/matters/[matterId]` detail (checklist+docs+notes+activity), `/app/matters/[matterId]/edit`, `/api/matter-documents/[id]` 60s signed | `LAWYER_MICROTOOL_MATTERVAULT_V1_REPORT.md` §12 |

**Explicitly NOT implemented (must NOT be marketed):**

`eCourts integration, OCR, AI legal advice, AI legal conclusions, hearing automation, filing automation, billing, WhatsApp automation, client portal, legal research, case outcome prediction, generic practice management, magic upload tokens, CSV export, CNR/hearing packs, invoice generation` — all listed in `RCCF-LAWYER-03 DO NOT implement` and absent from `008_matters.sql`/`src/modules/matter`. Any copy implying them is inaccurate.

**Commercial posture after P1 polish (§3 of P1 report):** `PILOT READY` for 1–3 firms ≤30 matters (permission-gated UI, checklist feedback, archive confirm, note/doc delete, a11y labels, readiness + `?status`, inline upload, humanized activity). Not yet **self-serve at scale** (needs search/pagination — correctly deferred, but irrelevant to marketing activation safety). Public `Available` badge is truthful because the product is technically available under existing RLS at `/app/matters` authenticated; marketing positioning should optionally note pilot/signed-up semantics without inventing a new `status` enum.

**Accurate public positioning language (derived from implemented behavior, not invented):**

> `MatterVault — Client document collection and matter file organization for Indian litigators. Create a matter, issue a checklist from the matter type, collect client uploads, verify or reject each item, and know when the file set is ready — without spreadsheets.`

This omits the forbidden claims and matches `professions` need for a one-line `Profession.description` and `Tool.description`.

---

## 5. Profession Activation Plan

**Required new profession:**

| Field | Value | Rationale |
|---|---|---|
| `slug` | `lawyers` | RESTful plural, matches `chartered-accountants` pattern, URL `/profession/lawyers`; alternative `legal-professionals` is verbose and not used in docs (docs consistently say `Lawyers`). |
| `name` | `Lawyers` | Display name parity with `Chartered Accountants`; docs use `Lawyers` (not `Advocates`/`Litigators` — `Litigators` is narrowing, `Advocates` is India-specific but `Lawyers` is neutral and matches project docs). |
| `description` | `Focused tools for litigators and law firms to organize client document collection and keep matter files ready to file.` | One sentence, faithful to V1 (§4), no eCourts/OCR/AI claim, mirrors CA description form `Focused tools for ... to ...` with workflow language `client document collection`. |
| `tools` | `[mattervault]` | Single-element array referencing the new `mattervault: Tool` const (same shape as `chartered-accountants → [noticeflow]`). |

**Alternative considered:** `slug: law` vs `lawyers`. `law` is ambiguous (law as discipline vs profession); `lawyers` is symmetric with `chartered-accountants` and matches sitemap/docs.

**No CMS/DB migration required:** Static array push in `src/content/microtools.ts` — same file NoticeFlow uses, same import sites, no service/registry.

**Page to publish:** `GET /profession/lawyers` via existing `src/app/profession/[profession]/page.tsx` (generateStaticParams auto-includes new `slug`).

---

## 6. Tool Activation Plan

**Required new tool (mirror `noticeflow` shape, no new model):**

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

| Field | Value | Justification |
|---|---|---|
| `slug` | `mattervault` | Lowercase single-word, matches docs/file paths `src/modules/matter` and doc titles `MatterVault`; already used internally (`/app/matters`). |
| `name` | `MatterVault` | Pascal-capped as `NoticeFlow` — existing brand; docs use `MatterVault` consistently. |
| `description` | `Client document collection and matter file organization for Indian litigators — from checklist to ready file, without spreadsheets.` | 18 words, under 140 chars, matches §4 boundary (checklist→ready), audience `Indian litigators`, avoids forbidden claims, mirrors NoticeFlow 2-sentence form but adapted (workflow, not authority). |
| `profession` | `lawyers` | FK to §5 `slug`, must equal exactly `lawyers` or `Profession.tools` desyncs. |
| `status` | `available` | Product is technically available authenticated at `/app/matters` under 009 RLS; `available` is the existing enum (`ToolStatus = "available" | "coming_soon"`). Do not invent `pilot`/`beta`/`limited` enum for this tool alone. |
| `href` | `/tools/mattervault` | Static marketing page path, parity with `/tools/noticeflow`. |
| `appHref` | `/app/matters` | Authenticated entry point (not `/app` generic — that was NoticeFlow's generic dashboard; MatterVault's list is `/app/matters`). |
| `workflow` | Not in `Tool` type — displayed separately as `Checklist → Upload → Verify → Ready → Archive` badge row on homepage/tool page (content local, not a model field). | Do not extend `Tool` with `workflow[]` — marketing-only local `flex-wrap` as homepage does for NoticeFlow (`Receipt→...→Close`). |

**Registration (no new config system):**

```ts
export const professions: Profession[] = [
  { slug: "chartered-accountants", name: "Chartered Accountants", description: "...", tools: [noticeflow] },
  { slug: "lawyers", name: "Lawyers", description: "...", tools: [mattervault] },
];
export const tools: Tool[] = [noticeflow, mattervault];
```

Order is array order — `chartered-accountants` first preserves current visual left→right.

**Technical availability vs marketing positioning:**

- Technical (`status` enum): `available` — correct, the tool is gated by `is_firm_member` at `/app/matters`, any firm member can reach it, no feature flag.
- Commercial (copy nuance): Copy should not imply `self-serve immediate onboarding for any lawyer on the internet` at scale, because docs note `PILOT READY 1–3 firms` before self-serve. The accurate nuance is in prose (`for Indian litigators — pilot` or `launch MatterVault` button still just goes to `/app/matters` authenticated), not in `status`. `coming_soon` would be inaccurate (it is already there).

---

## 7. Homepage Composition Recommendation

**Current homepage anatomy at `src/app/page.tsx:11` (`max-w-5xl space-y-12`):**

```
SiteNav
hero (bg-grid, eyebrow FOCUSED..., h1 Small tools..., p, Explore + Launch App CTAs)
3-step Profession → Workflow → MicroTool (rounded-full pill row)
Browse by Profession
Featured MicroTool (now overflow-hidden border + workflow border-t inside)
Why MicroTools (3-col border-t row)
footer
```

**With 2 professions / 2 tools, the structure should remain exactly this — no new sections, no section reordering, no hero rewrite.**

**Why hero stays:**

- Headline `Small tools for the work that matters.` is **profession-agnostic** (it already served `Chartered Accountants: NoticeFlow and future microtools` while only one tool existed). It does not say `for CAs`.
- Supporting line `Small, focused software tools for professionals... Built around specific workflows, not all-in-one platforms.` already describes the `Profession → Workflow → MicroTool` mental model that applies equally to `Lawyers → matter workflow → MatterVault`.
- `Explore MicroTools` → `/profession/chartered-accountants` as the only CTA is the one literal that becomes narrow with 2 professions. It currently deep-links to the single profession, which would hide Lawyers. Fix is CTA target/label, not hero prose (see §8).
- Adding `for everyone`/`AI`/`pricing`/`testimonials` would violate quiet authority / ready audit `do not`.

**3-step `Profession → Workflow → MicroTool` (src/app/page.tsx:27):**

Current pills: `Chartered Accountants → GST/Income-tax notice → NoticeFlow` (CA-specific workflow text). With two niches this pill row becomes either (a) still a single example (keep) or (b) updated to a more generic workflow noun. Since the audit in §2 measured it as `960` `gap-3 sm:gap-4` centered, the correct action is **keep current pills for V1 activation** (they illustrate the model, they do not claim the site is CA-only), or optionally make the middle pill `Statutory workflow`/`Matter workflow` plural — but not required for smallest change. The section already visually serves `Lawyers: MatterVault...` via cards below.

**Switch decision for with-2-cards layout:** The `length === 1 ? constrained max-w wrapper : md:grid-cols-2` guards are already correct (see §2). At `length === 2`, both `Browse` and `Featured` become `grid gap-4 md:grid-cols-2` (see §8/§9 recommendation to **remove** the `max-w-3xl/4xl` constrained island and use full `md:grid-cols-2`).

**What must change on homepage (minimal, planned §8-§9):**

- `Browse by Profession` grid: 2 `ProfessionCard`s side-by-side at `md`+ (already supported by guard).
- `Featured MicroTools` heading **pluralize** `MicroTool → MicroTools` (section has 2), and grid 2 `FeaturedCard`s `md:grid-cols-2` with distinct workflow rows per tool.
- Footer line `Chartered Accountants • NoticeFlow and future microtools` and footer links CA+NoticeFlow only → expand to 4 links.
- (Optional/`should`) `Explore MicroTools` CTA: since the page now scrolls to two professions, CTA should point to `/#browse` or remain CA-first; audit recommends changing to `Explore` that scrolls to `Browse` or keeps `Chartered Accountants` as first card with equal weighting — no CTA rewrite needed for smallest change, but label can stay.

**What must not change:** No new hero illustration, no dashboard screenshot, no bento, no animation, no extra section for Lawyers, no `max-w-5xl` change.

---

## 8. Browse by Profession Recommendation

**Current (1 profession, src/app/page.tsx:39):**

```tsx
<h2>Browse by Profession</h2>
<div className={professions.length === 1 ? "grid gap-4 max-w-3xl mx-auto" : "grid gap-4 md:grid-cols-2"}>
  {professions.map(p => <ProfessionCard key={p.slug} profession={p} />)}
</div>
```

`ProfessionCard` at `src/components/marketing/profession-card.tsx:7` is generic (`name`, `description`, `Badge {profession.tools.length} tools`, `→ View tools`) — requires no change: with 2 it will automatically show `1 tools` on each.

**With 2 professions this becomes:**

```
┌──────────────────────┐  ┌──────────────────────┐
│ Chartered Accountants│  │ Lawyers              │
│ Lightweight tools... │  │ Focused tools for... │
│ [1 tools] →          │  │ [1 tools] →          │
└──────────────────────┘  └──────────────────────┘
```

**Recommendation for smallest clean activation:**

- **Remove the constrained single-card wrapper** (`max-w-3xl mx-auto` branch) and render `grid gap-4 md:grid-cols-2` unconditionally (or keep guard — with `length === 2` it already yields `md:grid-cols-2`, so no code change is strictly needed). The guard is harmless but editorial single-card `max-w-3xl` island at 1024 (768 vs 960, 128px gutters) is no longer relevant; with 2 it is full `md:grid-cols-2` (each card ~476–478px at 960 container `gap-4`, still comfortable `p-6`).
- **Do not add `max-w-3xl` to the 2-card grid** — it would constrain two 384px cards inside 768, wasting space. Full `md:grid-cols-2` within `max-w-5xl` already gives the editorial rhythm verified at `MICRONEST_RESPONSIVE_LAYOUT_FIX_REPORT.md` (hero 960, Why 960, Browse should now also be 960 when 2).
- **Card height:** At 476px wide, `ProfessionCard p-6` ratio is `476×110 ≈ 4.3:1` vs `768×110 ≈ 7:1` before — less empty, no `p-8` needed (the earlier `p-8` suggestion at §25 of AUDIT_02 assumed single 768 card; with pairs the rectangle is less stretched).
- **Order:** `chartered-accountants` first, `lawyers` second (array order) — avoids implying Lawyers is an afterthought while keeping stable sort.

**Alternatives rejected:** `1-column constrained editorial list` (`max-w-md stacked`) would re-introduce the `max-w-md` mobile-island bug at desktop (448 inside 960) that was just fixed; `md:grid-cols-2` is correct.

---

## 9. Featured MicroTools Recommendation

**Current (1 tool, src/app/page.tsx:46, now b70418c refined):**

```tsx
<h2>Featured MicroTool</h2>  // singular
<div className={tools.length === 1 ? "grid gap-4 max-w-4xl mx-auto" : "grid gap-4 md:grid-cols-2"}>
  {tools.map(t => (
    <Link className="overflow-hidden rounded-md border hover:bg-accent">
      <div className="p-6"><h3>{t.name}</h3><Badge>{status}</Badge><p>{t.description}</p></div>
      <div className="border-t bg-muted/20 px-6 py-3 flex flex-wrap gap-1.5">
        // 6 NoticeFlow pills: Receipt → Review → Draft → Submit → Follow-up → Close
      </div>
    </Link>
  ))}
</div>
```

With 2 tools the guard again resolves to `grid gap-4 md:grid-cols-2` (two 464px-wide cards at 960 `gap-4`).

**Recommendation:**

- **Headline:** `Featured MicroTool` → `Featured MicroTools` (plural) — minimal copy fix; keeps singular when loop renders single? Hardcoding plural is acceptable since the section now contains 2; alternative conditional `Featured MicroTool{tools.length>1?'s':''}` is overengineering.
- **Workflow rows must diverge per tool (not share one NoticeFlow line):**

| Tool | Workflow badge row (inside `border-t bg-muted/20`) | Why |
|---|---|---|
| `NoticeFlow` | `Receipt → Review → Draft → Submit → Follow-up → Close` (existing, 6 pills) | Statutory notice lifecycle — already in homepage at `src/app/page.tsx:59` |
| `MatterVault` | `Create → Checklist → Upload → Verify → Ready → Archive` (6 pills, same `rounded-full border bg-background px-2 py-0.5` + `→ text-muted` styling, `flex-wrap` `text-xs` `border-t bg-muted/20 px-6 py-3`) | Matches actual V1 state machine `matter_status open→ready→archived` + `checklist pending→uploaded→verified` derived from `matter-constants.ts` `MATTER_STATUSES`/`CHECKLIST_STATUSES` and report §4 workflow `create→checklist→upload→verify→ready→archive` |

Implementation: inline conditional inside the `tools.map` rather than a new `Tool.workflow` array field (keeps `Tool` type unchanged per §3/§6; workflow is marketing-only `flex-wrap` local to `page.tsx`). Example local:

```tsx
<div className="flex flex-wrap items-center gap-1.5 border-t bg-muted/20 px-6 py-3 text-xs">
  {t.slug === "noticeflow" ? (
    <>Receipt→Review→Draft→Submit→Follow-up→Close</>
  ) : (
    <>Create→Checklist→Upload→Verify→Ready→Archive</>
  )}
</div>
```

Both badge sets use same `rounded-full border bg-background px-2 py-0.5` + `→ text-muted-foreground` primitives as the just-refined NoticeFlow card (§5 of IMPLEMENTATION_03) — do not style MatterVault badges differently.

- **Grid choice:** Keep `md:grid-cols-2` without outer `max-w-4xl`. At desktop `~464px` per card, each workflow row (6 pills `~520px` needed) will **wrap to 2 lines** — acceptable `flex-wrap` as at 375, not a layout failure. Constraining to `max-w-4xl` (896) would make two small cards inside a wide container with side gutters again island; full `md:grid-cols-2` within `960` is denser and correct.
- **Badge parity:** Both cards show `Available` (`status === "available"` → `default`) — truthful (see §6); do not add `Pilot` badge variant.

---

## 10. Profession Route Recommendation

**File:** `src/app/profession/[profession]/page.tsx:1` (49 lines)

**Current behavior:**

```ts
export function generateStaticParams() { return professions.map(p => ({ profession: p.slug })); }
export async function generateMetadata({ params }) { const data = getProfession(slug); if (!data) return {}; return { title: `${data.name} — ...`, description: data.description, openGraph: { ... } }; }
export default async function ProfessionPage({ params }) {
  const data = getProfession(profession); if (!data) notFound();
  return (<SiteNav /><main class="max-w-5xl space-y-8 p-6 md:p-8"><h1>{data.name}</h1><p>{data.description}</p><section grid md:grid-cols-2 {data.tools.map(t => <ToolCard .../>)} /></main>);
}
```

**With `lawyers` added:**

- `generateStaticParams` automatically yields `[{profession: "chartered-accountants"}, {profession: "lawyers"}]` — `next build` will emit `● /profession/lawyers` as SSG (already observed `●` for CA); no code change.
- `generateMetadata` will return `Lawyers — MicroNest ...` + `Focused tools for litigators...` — correct OpenGraph without code change.
- Page title/description/tool listing become content-driven (`data.name`, `data.description`, `data.tools`) — no special-case `if (slug === "lawyers")`.
- Empty behavior: not needed (1 tool), but `grid md:grid-cols-2` with 1 tool would leave empty right cell again at desktop — same island previously fixed. However profession detail page `src/app/profession/[profession]/page.tsx:40` already uses `grid gap-4 md:grid-cols-2` with 1 card (no conditional). At desktop this is a left card + empty right (1 of 2). Recommendation: **keep `md:grid-cols-2` as is** — a single card left-aligned is acceptable (the tool is the only item, it is not a marketing island like homepage; the page is already `max-w-5xl space-y-8` with context). Optional future `max-w-md` wrapper is not needed for correctness; defer.
- Navigation: `SiteNav` links still hard-coded (see §12) — no impact on this route's own nav.

**Desired architecture achieved:** `/profession/[profession]` remains single dynamic template, not `/profession/lawyers` hardcoded.

**Verification:** `GET /profession/lawyers` → 200 with `h1 Lawyers`, `GET /profession/nonexistent-profession` → `notFound()` `This page could not be found.` (see §17).

---

## 11. Tool Route Recommendation

**File:** `src/app/tools/[tool]/page.tsx:1` (75 lines) — **the only template that is not content-driven**.

**Current hard-codes (see §2 table):** profession label `Chartered Accountants`, CA copy `NoticeFlow helps CAs track GST...`, 5 notice-specific bullets, `Who it is for: Indian CAs...`, CTA `View Chartered Accountants tools` hard-coded `href`, and generic `What it does / Who it is for` structure is otherwise sound.

**Required refactor (minimal, planned for §18):**

Without changing the route shape (`/tools/[tool]` dynamic), make the template read from `getTool(slug)` + a derived profession lookup:

```ts
const data = getTool(tool);                 // already
if (!data) notFound();
const profession = getProfession(data.profession); // new: derive name/slug for breadcrumbs + CTA
```

Then conditionally render content per `data.slug`:

| Block | NoticeFlow (`noticeflow`) content (keep) | MatterVault (`mattervault`) content (add) |
|---|---|---|
| Eyebrow `Profession` | `Chartered Accountants` via `profession.name` (dynamic after fix) | `Lawyers` via same `profession.name` |
| `What it does` `p.muted` | `NoticeFlow helps CAs track GST and income-tax notices from receipt to closure without spreadsheets. It organizes the workflow, not the professional judgment.` | `MatterVault helps Indian litigators collect client documents against a checklist, verify each item, and know when the file set is ready to file — without spreadsheets.` |
| Bullets | 5 notice bullets (type/deadline/priority/client/archive, assignment, 13 transitions, activity/docs/notes, dashboard/search/pagination/CSV) | 5 MatterVault bullets faithful to §4: `Matter management with type, client, status, assigned, deadline, next action and checklist`; `Checklist templates per matter type (civil, criminal, NI, rent, recovery, other)`; `Document collection with private bucket, 10 MB PDF/JPG/PNG/DOCX, checklist linkage`; `Notes and activity with verify/reject and ready signal`; `Matter list with readiness Required: x/y and dashboard open/awaiting/ready/overdue` |
| `Who it is for` | `Indian Chartered Accountants, solo CAs and small firms.` | `Indian litigators and small law firms — solo and partnership.` |
| CTAs | `Launch NoticeFlow` → `data.appHref` (already dynamic), `View Chartered Accountants tools` → `/profession/chartered-accountants` | `Launch MatterVault` → `/app/matters` (via `data.appHref`), `View Lawyers tools` → `/profession/lawyers` (via `profession.slug`) |
| Disclaimer | `NoticeFlow organizes workflow. Professional judgment remains with your CA.` | `MatterVault organizes workflow. Professional judgment remains with counsel.` |

**No new templates:** Single `src/app/tools/[tool]/page.tsx` with `if (data.slug === "mattervault")` branches for copy only — no `src/app/tools/mattervault/page.tsx` duplicate, no `legal-tool-page.tsx`, no `mattervault-workflow` component.

**Workflow/badge visualization:** Do not duplicate homepage badge row on tool page at V1 — keep `rounded-md border p-6` text sections (the homepage already carries the workflow badge row). Optional future: add the same `Checklist → Upload → Verify → Ready → Archive` badge row to this page's `What it does` section as `border-t` row — deferred.

**`generateStaticParams`/`generateMetadata` already dynamic** — will emit `● /tools/mattervault` with correct title `MatterVault — MicroNest MicroTools` without code change (§3).

---

## 12. SEO/Sitemap Recommendation

**Sitemap `src/app/sitemap.ts:6`:**

```ts
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://micronestmicrotools.vercel.app";
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now },
    ...professions.map(p => ({ url: `${base}/profession/${p.slug}`, lastModified: now })),
    ...tools.map(t => ({ url: `${base}/tools/${t.slug}`, lastModified: now })),
  ];
}
```

With `2/2`, `sitemap()` automatically yields `4` entries beyond `/`: `/profession/chartered-accountants`, `/profession/lawyers`, `/tools/noticeflow`, `/tools/mattervault` — **no code change required**. `next build` will emit `/sitemap.xml` with 5 URLs (previously 3).

**Robots `src/app/robots.ts:4`:**

```ts
export default function robots() { return { rules: { userAgent: "*", allow: "/" }, sitemap: "https://micronestmicrotools.vercel.app/sitemap.xml" }; }
```

No change — already `allow: /` + correct sitemap URL.

**Canonical/OpenGraph:**

- `src/app/layout.tsx:7` `metadataBase: new URL("https://micronestmicrotools.vercel.app")` already sets canonical base; dynamic `generateMetadata` in profession/tool routes returns `title`/`description`/`openGraph` from content (§10/§11) — with new entries they auto-apply.
- Root `title: "MicroNest MicroTools — Lightweight tools for professionals"` and `template: "%s — MicroNest MicroTools"` remain correct.
- Do not add blog/FAQ schema unless already supported — **not present** (`Select-String jsonld/schema/blog` → 0 hits); adding new structured data for 2 would be out of minimal scope.
- JSON-LD absent — do not introduce for activation (would be premature `Product`/`BreadcrumbList` schema for 2 cards).

**Verified no additional SEO file missing:** `src/app/profession` and `src/app/tools` have no `opengraph-image.tsx` custom image — correct to defer (same image for both professions is acceptable at V1).

---

## 13. Metadata Recommendation

**Root `src/app/layout.tsx:12`:**

Current `description`: `"MicroNest MicroTools — small, focused software tools for professionals. Chartered Accountants: NoticeFlow and future microtools."` — with `Lawyers/MatterVault` live, `future microtools` becomes inaccurate (one is now real). Change to profession-agnostic: `"MicroNest MicroTools — small, focused software tools for professionals. For Chartered Accountants (NoticeFlow) and Lawyers (MatterVault)."` The `openGraph.description`: `"Small, focused software tools for professionals."` can stay (it is already generic).

**Title `src/app/layout.tsx:9`:** `default: "MicroNest MicroTools — Lightweight tools for professionals"` — keep (generic, correct for two verticals).

**Profession pages `src/app/profession/[profession]/page.tsx:16`:** `"${data.name} — MicroNest MicroTools"` + `data.description` — automatically correct for `Lawyers` after content push (no code).

**Tool pages `src/app/tools/[tool]/page.tsx:16`:** `"${data.name} — MicroNest MicroTools"` + `data.description` — automatically correct for `MatterVault`; do not change template.

**No second SEO system:** Keep `next/metadata` `Metadata` only, no `next-seo`, no `jsonld` lib, no `sitemap-index`.

---

## 14. Responsive Recommendation

**Context:** Previous homepage was corrected at `MICRONEST_RESPONSIVE_LAYOUT_FIX_REPORT.md` to eliminate `max-w-md` mobile island (448 inside 960) by using `max-w-3xl/4xl` editorial islands for single cards. With 2 cards the composition changes.

**Verified via code dimensions (no device):**

| Breakpoint | `main` | Current with 1 (Browse/Featured) | With 2 after activation (`md:grid-cols-2` no `max-w` wrapper) | Composition judgment |
|---|---|---|---|---|
| **375** | 327 usable (375-48) | `327` full, 1-col `Browse` 327, `Featured` 327, workflow `flex-wrap` 2 lines | Same but **two stacked rows**: `Browse` 2 rows × 327, `Featured` 2 rows × 327 — still full width, single column, gap-4, no overflow | Correct, stacked is expected single-col on phone; each card already 327 usable, readable, no `max-w` cap matters (768 > 327) |
| **768** | 704 usable (768-64) | `704` full, still 1-col before `md:` (since `max-w-3xl` 768 > 704, so still full); at exactly 768 `md:grid-cols-3` Why begins | `md:grid-cols-2` activates at 768, so `Browse` `2-col` `344` each (704-16)/2, `Featured` `344` each — 2 cards side-by-side at tablet | Correct; 344px cards dense but still `p-6` 24px + `text-sm`, not cramped (profession description 2 lines wraps). Previous 704 full single card would have left gutter 0, now 2 cards use width. |
| **1024** | 960 usable | `profGrid 768` centered 128 gutters, `featGrid 896` centered 64 gutters | `Browse` `md:grid-cols-2` `472` each ((960-16)/2), `Featured` `472` each — symmetric pairs in full `960` hero width | Correct; 472×110 cards use 97% of `960` with gap, `footer` 960, hero 960, Why 960 → **no width oscillation** (all sections now 960 / 472 pair vs before 768/896 island). |
| **1280** | 1024 capped `max-w-5xl` | Same as 1024 (768/896), gutters 128/64 | `Browse` `472` each, `Featured` `472` each (same) — capped, not stretched | Correct, symmetry maintained, not narrow island |
| **1440** | 1024 capped | Same | Same | Same, intentional cap |

**Conclusion on old `max-w-3xl/4xl` widths:**

- With 1 card, `max-w-3xl` (768) and `max-w-4xl` (896) were **editorial islands** inside `1024` (128px / 64px gutters) to avoid 448 mobile look-alike.
- With 2 cards, those constrained wrappers are **no longer correct** — they would make two 384/448 cards inside 768/896, leaving large side gutters again while cards are small. The intended 2-card composition is **full-width `md:grid-cols-2` within `max-w-5xl`** (no `max-w` wrapper), so the 1-card special case can remain as conditional or be simplified to unconditional `md:grid-cols-2` (with 1 card that is then left-aligned + empty right cell on profession/tool detail pages — acceptable, see §10).

**Do not optimize for symmetry alone:** The `Browse` 472 vs `Featured` 472 symmetry is natural, not forced; the card contents differ (profession vs tool badge) — that's correct hierarchy, not asymmetry to be fixed.

---

## 15. Accessibility Recommendation

**Inspected:** `src/app/page.tsx:27` 3-step `aria-label="How MicroNest works"` + `aria-hidden` on `→/↓`; `src/components/layout/nav-shell.tsx:23` `aria-label="Toggle navigation"` + `aria-expanded`; dynamic routes `h1→h2→h3` hierarchy; `SiteNav` `aria-current="page"`.

**With 2 professions/tools:**

- **Heading hierarchy:** `h1 Small tools...` → `h2 Browse by Profession` / `h2 Featured MicroTools` / `h2 Why MicroTools` → `h3 Focused` etc. and `h3 {profession.name}` / `h3 {tool.name}` — remains `h1→h2→h3` correct with 2 cards (each `Card` is `h3`).
- **Workflow arrows:** `→`/`↓` stay `aria-hidden="true"` (decorative), text `Receipt`/`Create` etc. remain accessible — add the same for new MatterVault badges.
- **Focus:** `Button h-9` `focus-visible:ring-1` + `NavShell` `focus-visible:ring-2` already; new cards use same `Link rounded-md border hover:bg-accent` + `focus-visible` — no change.
- **Skip link / landmarks:** No change needed; `main` landmark already covers new cards.
- **Reduced motion:** No animation (`bg-grid` static `linear-gradient`) — no `prefers-reduced-motion` needed.

**No new a11y debt introduced by adding `Lawyers/MatterVault` if template fixes in §11 are done (profession name dynamic, footer links have same `underline`).**

---

## 16. Content/Copyright Considerations

**Microtools `src/content/microtools.ts` is the sole copyright-relevant source for public professions/tools** (no CMS, no DB, no user-generated). Registration via static array means content license is the repo's own (proprietary as per `MICRONEST_PRODUCT_READINESS_AUDIT.md` `LICENSE` proprietary note at `abf0184`).

**Required copy artifacts (no invented claims):**

| Surface | Copy | Provenance | License risk |
|---|---|---|---|
| `chartered-accountants` profession `description` (existing) | `Lightweight tools for Chartered Accountants to manage statutory workflows with clarity.` | Existing, keep | None |
| `lawyers` profession `description` (new) | `Focused tools for litigators and law firms to organize client document collection and keep matter files ready to file.` | Derived from V1 §4 checklist→ready language (`lawfirm → matters → checklist issued → upload → verify`) — not invented claim | None |
| `NoticeFlow` `description` (existing) | `Notice workflow management for CA firms...` | Existing | None |
| `MatterVault` `description` (new) | `Client document collection and matter file organization for Indian litigators — from checklist to ready file, without spreadsheets.` | Same as §4 accurate positioning line | None |
| Homepage `Why MicroTools` 3 bullets | `Focused`, `Professional` (`Tenant-isolated, audit-trailed...`), `Workflow-first` | Existing; `Professional` bullet already mentions `audit-trailed` — true for both (MatterVault also `matter_activity` append-only, but don't change line). | None |
| Homepage footer | `MicroNest MicroTools — Chartered Accountants • NoticeFlow and future microtools` + `© 2026 Kaushal Bhat.` | Footer `future microtools` becomes partially stale; change to `Chartered Accountants • NoticeFlow • Lawyers • MatterVault` or `For Chartered Accountants and Lawyers` — minor wording, not copyright. Keep `©` line. | None |
| Tool pages `What it does` / `Who it is for` (§11 table) | Conditional prose for NoticeFlow vs MatterVault | MatterVault prose limited to V1 boundary §4 (no eCourts/OCR/AI) | None |

**Unsupported claims to avoid (per RCCF boundary):**

> `secure legal case management platform`, `complete litigation operating system`, `automates your legal practice`, `AI legal advice`, `eCourts integrated`, `predicts case outcomes`, `billing included`, `client portal`, `WhatsApp automation` — all inconsistent with `MatterVault V1 REPORT §17 Phase 2 excluded` and `PRODUCTION_SECURITY_REPORT §16 Next Step Do NOT add marketing with such claims`.

**Brand identity remains `quiet authority` (`Geist`, `neutral`, `1px`, `rounded-md`, `bg-grid` subtle) — no logo/illustration needed for second profession; typography + spacing + consistent `Badge rounded-full` workflow language is identity.**

---

## 17. E2E Test Recommendation

**Current `e2e/smoke.spec.ts:1` (5 tests):**

```ts
root → heading Small tools for the work that matters + Browse by Profession
tool   → /tools/noticeflow → NoticeFlow
profession → /profession/chartered-accountants → Chartered Accountants
404 → /profession/nonexistent-profession → This page could not be found.
404 → /tools/nonexistent-tool → This page could not be found.
```

**Required updates/additions (no test implemented now, audit only):**

| Test | Assertion | Purpose |
|---|---|---|
| `homepage contains both professions` | `GET / → expect(getByRole("link", {name:"Chartered Accountants"}))` + `Lawyers` + `Browse by Profession` heading still | Multi-profession discoverability, Browse 2-card |
| `homepage contains both tools` | `GET / → expect(getByRole("heading", {name:"NoticeFlow"}))` + `MatterVault` + both `Available` badges + both workflow badge rows (`Receipt...` and `Create...`) | Featured 2-card with distinct workflows |
| `/profession/lawyers works` (new) | `GET /profession/lawyers → heading Lawyers + description litigators + MatterVault link` | Dynamic profession route without special case |
| `/tools/mattervault works` (new) | `GET /tools/mattervault → heading MatterVault + badge Available + Lawyers eyebrow + What it does/ Who it is for + Launch MatterVault → /app/matters` | Dynamic tool route, fixes hard codes |
| `chartered-accountants profession still works` | `GET /profession/chartered-accountants → heading CA + tools[1]` | No regression |
| `noticeflow tool still works` | `GET /tools/noticeflow → heading NoticeFlow + CA eyebrow + original bullets` | No regression on refactored template |
| `unknown profession still 404s` | `GET /profession/nonexistent → This page could not be found.` (existing, keep) | |
| `unknown tool still 404s` | `GET /tools/nonexistent-tool → This page could not be found.` (existing, keep) | |
| `sitemap includes both new routes` | Fetch `/sitemap.xml` and assert `includes /profession/lawyers` + `/tools/mattervault` | Content-driven sitemap |
| `mobile navigation unchanged` | `page.setViewportSize({width:375}) → toggle → expect(link Lawyers/MatterVault visible)` | NavShell no regression with more links |

**Plus programmatic `typecheck: getProfession('lawyers') !== undefined && getTool('mattervault') !== undefined` via unit test `src/content/microtools.test.ts` (new, trivial).**

No change to `e2e/auth.spec.ts` (3) or `e2e/notices-pagination.spec.ts` (4) — authenticated app untouched (see §19).

---

## 18. Exact Files Expected to Change

**Total expected: 5–6 files, 0 new deps, 0 new routes, 0 migrations.**

| # | File | Change type | Lines est. |
|---|---|---|---|
| 1 | `src/content/microtools.ts` | **Modify** — add `mattervault: Tool` const + `lawyers: Profession` entry; push to `professions[]` and `tools[]` | `+12…14` |
| 2 | `src/app/page.tsx` | **Modify — presentation only** — pluralize `Featured MicroTool → Featured MicroTools`; keep guard or simplify to `grid gap-4 md:grid-cols-2` (remove `max-w-3xl/4xl` when 2); branch workflow badges per `t.slug` (6 NoticeFlow vs 6 MatterVault pills `Create→...→Archive` with same `rounded-full/bg-muted/20` styling); expand footer line + footer links to include `Lawyers` + `MatterVault` | `~+15…25 -5` |
| 3 | `src/components/layout/site-nav.tsx` | **Modify** — add 2 entries to `links[]`: `{href:"/profession/lawyers", label:"Lawyers"}` and `{href:"/tools/mattervault", label:"MatterVault"}` (making `[Home, CA, NoticeFlow, Lawyers, MatterVault]`). Keep `cta Launch App`; keep `exact` on Home only. | `+2` |
| 4 | `src/components/marketing/tool-card.tsx` | **Modify — 1 line** — replace hard-coded `Chartered Accountants → {tool.name}` with dynamic profession name lookup: import `getProfession` or look up `professions.find(p=>p.slug===tool.profession)` or pass `professionName` prop; render `{professionName} → {tool.name}`. Without this, MatterVault card would show wrong CA name when used on `/profession/lawyers`. | `+3…5` |
| 5 | `src/app/tools/[tool]/page.tsx` | **Modify — template de-hardcoding** — derive `profession = getProfession(data.profession)` for eyebrow + CTA href/label; branch `What it does` paragraph, bullet list (5 MatterVault bullets §11), `Who it is for`, CTA links, disclaimer per `data.slug === "mattervault"` conditional (no template duplication). | `~+25…40 -10` |
| 6 | `src/app/layout.tsx` (optional, SEO) | **Modify** — update root `description` from `Chartered Accountants: NoticeFlow and future microtools` to `For Chartered Accountants (NoticeFlow) and Lawyers (MatterVault).` (+ `openGraph.description` if keeps). | `+1` |
| 7 | `src/app/sitemap.ts` / `robots.ts` | **No file change** — already content-driven | 0 |
| 8 | `e2e/smoke.spec.ts` | Optionally update in implementation RCCF — add Lawyers/MatterVault + sitemap tests (listed in §17, implementation step). | `+15…25` |

**Not new files:** No `src/app/profession/lawyers/page.tsx` (dynamic route handles), no `src/app/tools/mattervault/page.tsx`, no `src/content/lawyers.ts`, no `mattervault-card.tsx`, no `profession-registry.service.ts`, no marketing DB.

---

## 19. Exact Files That Must NOT Change

```text
MUST NOT CHANGE — regression guard (no auth/DB/migrations/NoticeFlow/MatterVault business logic):

supabase/migrations/**                — no new migration, no ALTER, no RLS/RPC change (008/009 final)
src/proxy.ts                          — session proxy only, no firm_id trust change
src/infrastructure/**                  — service-client server-only, no exposure
src/modules/notice/**                  — NoticeFlow domain untouched (notice-documents bucket, canTransition, notice-permissions)
src/modules/document/** src/modules/note/** src/modules/activity/** — NoticeFlow docs/notes/activity untouched
src/modules/matter/**                  — MatterVault bounded context untouched (matters/checklist_items/matter_documents/matter_notes/matter_activity, constants, permissions, services, repositories, RPCs)
src/app/app/**                         — authenticated app untouched (/app, /app/matters, /app/notices, /app/clients, /app/members, /api/matter-documents, dashboard)
src/app/onboarding/** src/app/login/** src/app/signup/** — auth flows untouched
src/app/profession/[profession]/page.tsx — KEEP AS IS (already generic; no lawyers special case)
src/app/sitemap.ts src/app/robots.ts    — keep as is (already dynamic)
src/app/globals.css                    — keep .bg-grid, no new CSS
src/components/layout/nav-shell.tsx     — keep, reuse via links[] only
src/components/ui/**                   — Button/Badge/Input/etc. keep, no new lib
package.json / pnpm-lock.yaml           — no new npm dep (no framer-motion/magic-ui/aceternity/cms/sanity/contentlayer)
src/content/microtools.ts               — ONLY edit per §18; do not replace with CMS/DB/derived fetching
e2e/auth.spec.ts e2e/notices-pagination.spec.ts — keep authenticated tests unchanged
```

Also must NOT change: `src/app/page.tsx` hero `py-16`/`bg-grid`/`eyebrow`/`h1`/`p`; `src/app/page.tsx` `Why MicroTools` `border-t pt-6 md:grid-cols-3` composition (quiet authority preserves editorial spacing).

---

## 20. Implementation Sequence

**Single RCCF, smallest clean change, zero deps, verify-only implementation.**

**Step 1 — Content source of truth (5 min, 1 file)**

Edit `src/content/microtools.ts`:
1. Add `const mattervault: Tool = { slug:"mattervault", name:"MatterVault", description:"Client document collection...", profession:"lawyers", status:"available", href:"/tools/mattervault", appHref:"/app/matters" }` above `professions` — keep `noticeflow` const adjacent.
2. Extend `export const professions = [{slug:"chartered-accountants",...,tools:[noticeflow]}, {slug:"lawyers", name:"Lawyers", description:"Focused tools for litigators...", tools:[mattervault]}]`
3. Extend `export const tools = [noticeflow, mattervault]`
4. Keep `getProfession`/`getTool` helpers unchanged (they already use `.find`).

Check: `pnpm typecheck` still `ToolStatus` union satisfied.

**Step 2 — Remove marketing template hard-codes (10 min, 2 files)**

Edit `src/components/marketing/tool-card.tsx:13`:
- Replace `Chartered Accountants → {tool.name}` with dynamic: add `const prof = professions.find(p=>p.slug===tool.profession)` or `getProfession(tool.profession)` and render `{prof?.name ?? tool.profession} → {tool.name}`.

Edit `src/app/tools/[tool]/page.tsx` (see §11 table):
- Add `const profession = getProfession(data.profession)` after `getTool`.
- Replace hard-coded `<p>Chartered Accountants</p>` with `{profession?.name}`.
- Branch `What it does` / bullet `ul` / `Who it is for` / CTAs `href/label` / disclaimer per `data.slug === "mattervault"` (6 blocks).
- Keep `generateStaticParams`/`generateMetadata` unchanged.

**Step 3 — Homepage 2-card composition (10 min, 1 file)**

Edit `src/app/page.tsx`:
- Change `h2 Featured MicroTool` → `Featured MicroTools`.
- Update footer line `MicroNest MicroTools — Chartered Accountants • NoticeFlow and future microtools` → `MicroNest MicroTools — Chartered Accountants • NoticeFlow • Lawyers • MatterVault` (or `For Chartered Accountants and Lawyers — NoticeFlow and MatterVault`).
- Expand footer links `flex flex-wrap gap-4` from 3 to 5 (add `Lawyers` → `/profession/lawyers`, `MatterVault` → `/tools/mattervault`).
- Inside `tools.map` workflow row: conditional 6 pills — `noticeflow: Receipt→...→Close` else `mattervault: Create→Checklist→Upload→Verify→Ready→Archive` (same `rounded-full border bg-background px-2 py-0.5` + `→ text-muted` primitives, `border-t bg-muted/20 px-6 py-3 flex-wrap text-xs` container unchanged).
- `Browse`/`Featured` grids: keep `professions.length === 1 ? "grid gap-4 max-w-3xl mx-auto" : "grid gap-4 md:grid-cols-2"` — with `length 2` they already become `md:grid-cols-2`; no change strictly required. Optionally simplify to unconditional `grid gap-4 md:grid-cols-2` for clarity.

**Step 4 — Navigation (2 min, 1 file)**

Edit `src/components/layout/site-nav.tsx:4`:
- Add `links[]`: `{ href: "/profession/lawyers", label: "Lawyers" }` and `{ href: "/tools/mattervault", label: "MatterVault" }` after CA/NoticeFlow entries (order `[Home, CA, NoticeFlow, Lawyers, MatterVault]`).

**Step 5 — Optional SEO trim (1 min, 1 file)**

Edit `src/app/layout.tsx:12` `description` → `For Chartered Accountants (NoticeFlow) and Lawyers (MatterVault).` (keeps professional keywords for sitemap/OP).

**Step 6 — Validation (15 min, no push)**

Run with `length 2`:

```
pnpm typecheck → PASS (0)
pnpm lint      → PASS (0)
pnpm test      → PASS (36/228 — content now 2/2, add small unit test for microtools 2/2 if desired)
pnpm build     → PASS (● /profession/lawyers + ● /tools/mattervault in 10–12 pages, no overflow)
pnpm test:e2e  → PASS after adding §17 tests (update smoke.spec.ts to check both professions/tools + 404s still)
```

Plus manual responsive review at `375/768/1024/1280/1440` per §14 (both Browse and Featured `md:grid-cols-2` pairs) and `noOverflow` visual.

**Step 7 — Hand off to commit RCCF**

`git add` only files in §18 (plus `e2e/smoke.spec.ts` + `src/content/microtools.test.ts` if test added) → commit `feat(marketing): activate Lawyers and MatterVault` → `git push origin main` → report with §12 sitemap 5 URLs verified.

**Do not start V2 (magic links/OCR/eCourts) until pilot sign-off.**

---

## 21. Explicit Non-Goals

Do **not** in activation:

- Add `MatterVault` business logic, modify `src/modules/matter` services/repositories/migrations/RLS/RPC (008/009 final) — MatterVault app already `PILOT READY`.
- Add MatterVault to DB/CMS/`Supabase`/`Notion`/`Sanity`/`Contentlayer` — keep static `microtools.ts` source of truth, not a registry service.
- Create `lawyers`-specific or `mattervault`-specific component (`LawyersProfessionCard`, `MatterVaultToolCard`, `LegalHero`) — `ProfessionCard`/`ToolCard` are generic, keep via `professions.find` / dynamic profession lookup.
- Create second marketing architecture, `bento` card set, dashboard screenshot, hero illustration, gradient/glass/neon, `framer-motion`, `Magic UI AnimatedGridPattern`, `Aceternity Beams/Wobble`.
- Add `Blog`, `FAQ` schema unless already present (none), `Testimonials`, `Pricing`, `Team`, `Newsletter`, `Pricing` per-tenant billing.
- Modify `/app/**` authenticated app — `Lawyers/MatterVault` only becomes publicly discoverable, not functionally changed.
- Hard-code `/profession/lawyers` or `/tools/mattervault` as separate pages — keep `/[profession]` / `/[tool]` dynamic routes.
- Add new npm dep (`geist` `1.7.2`, `tailwindcss` `4.1.8`, `next` `16.3.6` only — no `motion`, `contentlayer`, `sanity`).
- Invent MatterVault capabilities (`eCourts`, `OCR`, `AI advice`, `hearing automation`, `billing`, `WhatsApp`, `client portal`, `legal research`, `case prediction`) — cap at V1 (§4).
- Add `matter_type` editability after creation, `matter-documents` 10 MB bump, or `matter_type` new enum (`appeal`, `writ`) without discovery.
- Duplicate `Profession`/`Tool` grey-box primitives (`Card` framework `CardHeader/CardContent`) — `Link rounded-md border p-6` is enough for 2 cards.

---

## 22. Final Verdict

**WHAT IS THE SMALLEST CLEAN CHANGE THAT MAKES MATTERVAULT PUBLICLY VISIBLE WHILE MAKING MICRONEST GENUINELY MULTI-PROFESSION?**

One content file (`microtools.ts` `mattervault + lawyers` 12–14 lines) plus four marketing template fixes (`site-nav.tsx` +2 links, `tool-card.tsx` 1 dynamic line, `tools/[tool]/page.tsx` 6 hard-code branches, `page.tsx` headline/workflows/footer plural) and optional one SEO line (`layout.tsx` description), zero deps, zero new routes, zero DB/migrations/RLS/RPC, zero authenticated change.

The existing dynamic architecture already supports multi-profession — `generateStaticParams`, `sitemap`, `getProfession/getTool`, `ProfessionCard`, `NavShell`, `layout metadata` are content-driven. The only non-multi state was three hard-coded CA/NoticeFlow literal blocks and the editorial single-card guard that, with `length 2`, automatically becomes the correct `md:grid-cols-2` two-card composition at desktop (472px each in 960, `flex-wrap` workflows wrapping naturally, 375 single-col stacked). Hero `Small tools for the work that matters.` + 3-step `Profession → Workflow → MicroTool` + `Browse` 2-profession grid + `Featured` 2-tool grid with divergent `Receipt…Close` vs `Create…Archive` workflows + `Why` 3-col editorial row is then visibly `MicroNest was designed for multiple niches from the beginning` — not `CA site + random lawyer card`.

No second architecture, no duplicated page template, no CMS, no lawyer-specific component, no NoticeFlow/MatterVault business or security change. MatterVault copy stays faithful to implemented V1 (`checklist → upload → verify → ready → archive`, no eCourts/OCR/AI), `status: available` remains truthful with positioning nuance in prose not enum.

**This audit does not invent capabilities, does not modify code, and does not weaken the pilot-ready security boundary (009 behaviorally 8/8 PASS). Implementation is a single RCCF with §18 files, §20 sequence, §17 e2e surface, and §14 responsive `375/768/1024/1280/1440` no-overflow.**

**Do not implement in this audit — wait for RCCF-MICRONEST-MARKETING-05 to instruct implementation. Do not commit. Do not push.**

