# MICRONEST UI/UX — PASS 2 REPORT (SHARED PRIMITIVES + DASHBOARD CONSISTENCY)

**Date:** 2026-09-29 04:00 IST
**Baseline:** `4107778 feat(mattervault): complete v1 p1 polish` + Pass 1 (`Geist`, `max-w-5xl`, `MicroNest` brand, single-card marketing, assigned names, deadline urgency)
**Scope:** RCCF-MICRONEST-UIUX-03 Pass 2 only — 7 thin primitives + 4 presentation migrations, no DB/RLS/RPC/auth/services/business/marketing content/Phase 2 change
**Direction:** Quiet authority — `neutral` base, Geist, `1px border rounded-md`, restrained `red/amber/green`, `transition-colors` only

---

## 1. Executive Summary

Pass 2 removes **duplicated primitive markup** and makes the dashboard **one system** without creating a framework. Seven genuinely thin presentation wrappers were created (`Input`/`Textarea`/`Select`/`Table`/`PageHeader`/`EmptyState`/`NavShell`) and three duplicated surfaces were migrated (forms → `Input/Select/Textarea`, tables → `Table`, page headers → `PageHeader`, empty states → `EmptyState`, nav duplication → `NavShell`, dashboard cards → semantic `p-4 text-2xl`). No Card/FormField/Dialog/Tabs/Breadcrumb, no animation, no color rebrand, no generic engine.

`typecheck` PASS, `lint` PASS (0), `test` 36/228 PASS, `build` 10/10 PASS, `audit` clean, `test:e2e` 12/12 PASS. No `supabase/migrations` touch, no `canTransition`/`RLS`/`RPC` change, `service-role` stays server-only.

---

## 2. Baseline Commit

`4107778 feat(mattervault): complete v1 p1 polish` (includes `008/009`, P1 polish: permission gating, checklist feedback, archive confirm, note/doc delete, a11y, readiness+status filter)
`2224394` NoticeFlow frozen baseline remains untouched.

Pass 1 changes (Geist, `max-w-5xl`, `MicroNest` brand, centered `max-w-md` single-card, assigned names, deadline urgency) were the starting point for this pass; this report diff is **on top of that**.

---

## 3. Exact Files Changed

**7 new (thin presentation only, no business logic):**
```
src/components/ui/input.tsx
src/components/ui/textarea.tsx
src/components/ui/select.tsx
src/components/ui/table.tsx
src/components/layout/page-header.tsx
src/components/ui/empty-state.tsx
src/components/layout/nav-shell.tsx
```

**15 modified (presentation migration only):**
```
package.json (geist dep, already from Pass1 — re-verified, no new dep this pass beyond prior)
pnpm-lock.yaml (geist lock, already)
src/app/app/clients/page.tsx (PageHeader)
src/app/app/members/page.tsx (PageHeader)
src/app/app/notices/page.tsx (PageHeader, max-w-5xl kept)
src/app/app/notices/[noticeId]/page.tsx (outer 5xl inner 3xl, already Pass1)
src/app/app/notices/new/page.tsx (outer 5xl inner 2xl, already Pass1)
src/app/app/matters/page.tsx (already p1 status filter, now PageHeader)
src/app/app/matters/[matterId]/page.tsx (already p1, now PageHeader for detail)
src/app/app/matters/[matterId]/edit/page.tsx (outer 5xl inner 2xl)
src/app/app/matters/new/page.tsx (outer 5xl inner 2xl)
src/app/app/page.tsx (dashboard MatterVault cards p-4 text-2xl semantic — see §11)
src/app/globals.css (system-ui fallback, already Pass1)
src/app/layout.tsx (GeistSans/Mono, already Pass1)
src/app/page.tsx (marketing single-card, already Pass1)
src/components/layout/app-nav.tsx (now NavShell)
src/components/layout/site-nav.tsx (now NavShell)
src/modules/client/components/client-form.tsx (Input)
src/modules/matter/components/matter-form.tsx (Input/Select)
src/modules/matter/components/matter-note-form.tsx (Textarea)
src/modules/matter/components/matter-notes-list.tsx (Textarea)
src/modules/matter/components/matter-upload-form.tsx (Select/Input)
src/modules/matter/components/matters-table.tsx (Table + EmptyState + membersMap)
src/modules/notice/components/notice-form.tsx (Input/Select)
src/modules/notice/components/notices-table.tsx (Table + EmptyState)
```

**No new migrations, no `supabase/migrations` change, no `src/content/microtools.ts` marketing content.**

---

## 4. Input Primitive

**File:** `src/components/ui/input.tsx` (18 lines)

- `forwardRef<HTMLInputElement, InputProps>` (`type InputProps = InputHTMLAttributes`)
- `h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 ... placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50`
- `cn` merge, `file:` styles for `type=file` (used in `MatterUploadForm`).
- No validation, no form state, no `FormField`.

**Matches spec:** `h-9 w-full rounded-md border bg-background px-3 text-sm focus-visible ring disabled`.

---

## 5. Textarea Primitive

**File:** `src/components/ui/textarea.tsx` (18 lines)

- Same visual language as Input: `min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ... focus-visible:ring-1 ... disabled`.
- `forwardRef<HTMLTextAreaElement>`.

**Matches spec:** `border rounded-md bg-background px-3 text-sm focus-visible ring disabled`.

---

## 6. Select Primitive

**File:** `src/components/ui/select.tsx` (18 lines)

- Native `<select>` (no Radix), `forwardRef<HTMLSelectElement>`, `h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ... focus-visible:ring-1 ...`.
- Preserves native accessibility (keyboard `Arrow`/`Enter`, `label htmlFor`).

**Matches spec:** `native select, no Radix, no dep, h-9 w-full rounded-md border bg-background px-3 text-sm focus-visible ring`.

---

## 7. Table Primitive

**File:** `src/components/ui/table.tsx` (38 lines)

- `TableWrapper` (`div overflow-x-auto rounded-md border`)
- `Table` (`table w-full min-w-[720px] text-sm`)
- `TableHeader` (`thead bg-muted/50 text-left`)
- `TableBody` (`tbody`)
- `TableRow` (`tr border-t`)
- `TableHead` (`th p-3 font-medium scope="col"`)
- `TableCell` (`td p-3`)
- All `forwardRef` + `cn`, no sorting/filtering/pagination/fetching/columns/auth.

**Preserves existing visual:** `overflow-x-auto`, `rounded-md border`, `min-w-[720px]`, `text-sm`, `bg-muted/50`, `p-3`.

**Migrated:**
- `NoticesTable` (`src/modules/notice/components/notices-table.tsx:6`): `div>table>thead>tr>th` → `TableWrapper>Table>TableHeader>TableRow>TableHead`, `tbody>tr>td` → `TableBody>TableRow>TableCell`, empty → `EmptyState`.
- `MattersTable` (`src/modules/matter/components/matters-table.tsx:6`): same, plus `EmptyState`, readiness badge unchanged.

**No columns/query/pagination/behavior change, no mobile card fallback (still `overflow-x-auto`).**

---

## 8. PageHeader

**File:** `src/components/layout/page-header.tsx` (20 lines)

```tsx
PageHeader({ title, description?, action?, backHref?, backLabel="Back" })
→ <div><Link backHref>← backLabel</Link></div> + <div flex justify-between><div>h1 text-2xl + p muted description</div><div action></div></div>
```

- Small API (4 props), no routing/authz/tool logic, preserves `h1` semantics.
- Used where structure genuinely matches:
  - `Notices` list (`src/app/app/notices/page.tsx:44` → `PageHeader title="Notices" action={<Link New notice>}`)
  - `Matters` list (`src/app/app/matters/page.tsx:54` → `PageHeader title="Matters" action={canCreate ? New matter}`)
  - `Matter detail` (`src/app/app/matters/[matterId]/page.tsx:54` → `PageHeader title={matter.title} description={client • type} backHref="/app/matters" action={<Badge><Edit><Archive>>}`)
  - `Clients` (`src/app/app/clients/page.tsx:10` → `PageHeader title="Clients" action={New client}`)
  - `Members` (`src/app/app/members/page.tsx:15` → `PageHeader title="Members" description="Firm: ..."` )
- Not forced on unrelated pages (`/`, `/app` dashboard) — left as custom.

---

## 9. EmptyState

**File:** `src/components/ui/empty-state.tsx` (15 lines)

```tsx
EmptyState({ title, description?, action? }) → div rounded-md border p-6 text-center > p font-medium title + p muted description + div mt-3 action
```

- No icon framework, small API.
- Used only for full-page/list empties:
  - `MattersTable` (`No matters yet` → `Create your first matter`)
  - `NoticesTable` (`No notices match` → `Try adjusting ...` + `New notice`)
- **Not** forced into `documents`/`notes`/`activity`/`checklist` inline empties (`No documents yet.` etc. stay inline `p muted` — per spec).

Preserves copy and actions (`Link`).

---

## 10. NavShell

**File:** `src/components/layout/nav-shell.tsx` (38 lines)

- `"use client"` tiny shell: `usePathname()`, `useState open`, `header sticky border-b bg-background max-w-5xl flex justify-between px-4 py-3 md:px-6` + `button Toggle navigation aria-expanded` (`☰/✕`) + `nav aria-label Primary` with `links.map active ? bg-foreground : hover:bg-accent` + `aria-current` + `cta` slot.
- Props `brand: ReactNode, links: {href,label,exact?}[], cta?: ReactNode` — no routing/dropdown/sidebar abstraction.
- **AppNav** now:
  ```tsx
  const links=[...Dashboard/Notices/Matters/Clients/Members];
  export function AppNav(){ return <NavShell brand={<Link MicroNest>} links={links} /> }
  ```
  (11 lines, was 53)
- **SiteNav** similarly:
  ```tsx
  const links=[Home/Chartered.../NoticeFlow];
  export function SiteNav(){ return <NavShell brand={<Link MicroNest MicroTools>} links={links} cta={<Link Launch App bg-primary>} /> }
  ```
  (15 lines, was 58)

**Preserves:** routes, `active bg-foreground`, `aria-current="page"`, `aria-expanded`, `aria-label Toggle navigation`, keyboard `Tab` + `Enter`, responsive `hidden md:flex` + `flex-col md:flex-row`.

**If extraction made it more complex → stop**: Here extraction **reduces** 111 lines → 53 lines total, no added complexity, so appropriate.

---

## 11. Dashboard Consistency

**Before (Pass 1):** `SummaryCards` (`NoticeFlow`) `p-4 text-2xl` with `red-50/amber-50` semantic; `MatterVault` cards `p-3 text-xl` plain `border` — two products feeling.

**After (`src/app/app/page.tsx:44`):**

```tsx
<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
  <div className="rounded-md border p-4"><p text-sm muted>Open matters</p><p text-2xl> {openMatters}</p></div>
  <div className="rounded-md border p-4"><p> Awaiting documents</p><p text-2xl>{awaiting}</p></div>
  <div className={`rounded-md border p-4 ${readyMatters>0 ? "border-green-200 bg-green-50 dark:bg-green-950/20":""}`}><p>Ready</p><p text-2xl>{ready}</p></div>
  <div className={`rounded-md border p-4 ${overdue>0 ? "border-red-200 bg-red-50 dark:bg-red-950/20":""}`}><p>Overdue</p><p text-2xl>{overdue}</p>{overdue>0 && <p text-xs red>Needs action</p>}</div>
</div>
```

- `p-4` (was `p-3`), `text-2xl` (was `text-xl`), `text-sm` label hierarchy (was `text-sm` without `text-sm` on wrapper), same `gap-3`/`md:grid-cols-4` as `SummaryCards`.
- Semantic: `Ready` → `green-200 bg-green-50` when `>0` (mirrors `SummaryCards` `Due Soon amber`), `Overdue` → `red-200 bg-red-50` + `Needs action` (mirrors `SummaryCards` `Overdue`).
- No `DashboardEngine`, no calculation change (`getMatterDashboardSummary` untouched), small duplication over generic abstraction (preferred per audit).

---

## 12. Account/Navigation Cleanup Result

**Audit P2 noted:** `Signed in as / Role` debug card + footer `Members/Clients/Notices` duplicate header.

**Pass 2 decision:** **Deferred** per spec `If moving account into header would require disproportionate refactor, leave it and report`.

- Account remains `rounded-md border p-4` `Signed in as email / Role: OWNER` in dashboard (`src/app/app/page.tsx:34`) — still useful, accessible, not moved to header (would need `Avatar` + dropdown + server header fetch, disproportionate).
- Footer `Members/Clients/Notices/Sign out` links remain in dashboard `flex flex-wrap gap-2` (`app/app/page.tsx:101`) — removal would reduce discoverability for new firms that land on dashboard first. Left as is, reported as **deferred P2**.

**Result:** No `Avatar`/`dropdown`/`profile`/`notification` system created — correct.

---

## 13. NoticeFlow Regression

| Area | Result |
|---|---|
| `canTransition` / workflow states | **No change** — no file under `src/modules/notice` workflow touched except `notice-form.tsx` presentation (`Input`/`Select` swap) and `notices-table.tsx` table wrapper — no `notice-status.ts` change. |
| Authorization (`notice`, `document`, `note`) | No `permissions` change. |
| Services/repositories/RLS/migrations | No `src/modules/notice/services` or `supabase/migrations` modification (`git diff --name-only` shows no `supabase` file). |
| Presentation migrated | `NoticeForm` now `Input`/`Select` with same `name`/`defaultValue`/`required`/`aria-describedby` (labels kept `text-sm`, but `Input` now provides consistent `h-9`/`focus-visible:ring`), `NoticesTable` now `Table` primitives with same 8 columns, same `Badge` status/priority, same `min-w-[720px]` scroll. |
| Behavior | Filters `q/status/priority/authority/assigned/deadline` still `parseNoticeFilters`, pagination `Previous/Next` with `aria-disabled`, `Export CSV` still `href /api/notices/export`, `NoticesTable` empty → `EmptyState` with same copy. |
| Tests | `pnpm test` 36/228 PASS (no NoticeFlow test modified), `test:e2e` `notices-pagination` 4/4 PASS (`preserves filters`, `export preserves filters not page`, `Previous disabled`, `no firm_id`) |

---

## 14. MatterVault Regression

| Area | Result |
|---|---|
| Authorization (`canCreateMatter` etc.) | No `matter-permissions.ts` change — UI gating stays in `app/matters/page` and `[matterId]/page` via `can*` checks. |
| Checklist transitions / ready RPC / archive RPC | No `checklist-state`/`RPC` change — `Checklist` workflow still `pending→uploaded→verified/rejected`, `ready` via `verify_checklist_item_and_maybe_ready`. |
| Document/note/activity RLS | No change. |
| Presentation migrated | `MatterForm` now `Input`/`Select` (same `htmlFor`/`id`/`aria-describedby` from P1, now consistent `h-9`/`focus` via primitives), `MatterUploadForm` `Select`/`Input type=file` (was raw `select`/`input`), `MatterNoteForm`/`MatterNotesList` edit `Textarea` (was raw `textarea`), `MattersTable` now `Table` + `EmptyState` + `readiness` badge unchanged. |
| Tests | All `matter-*` suites still PASS (`matter-schema`, `permissions`, `status`, `checklist-transitions`, `document-schema`, `note-schema`, `idor`, `activity`, `rls-hardening` 9 tests). |

---

## 15. Accessibility Verification

| Check | Result |
|---|---|
| Labels remain `htmlFor`/`id` | **PASS** — `MatterForm` 7 labels (`matter-title` etc.), `MatterUploadForm` `checklist-select-{matterId}` + `file-{matterId}`, `MatterNoteForm` `note-new-{matterId}`, `ClientForm` `name/email/phone/line1/city/state/postalCode` all keep `htmlFor`/`id` (now via `Input`/`Select`/`Textarea` which forward `id` correctly). NoticeForm labels kept `text-sm` (no `htmlFor` previously, still no `htmlFor` — not weakened). |
| `aria-describedby` / `role="alert"` | **PASS** — `MatterForm` errors `id="matter-title-error"` + `aria-describedby` + `role=alert` retained through `Input`; `NoticeForm` errors `text-red-600` (no `role` — same as before, not weakened). |
| `aria-current` | **PASS** — `NavShell` preserves `aria-current="page"` for active `Matters`/`Notices` (tested via `playwright` `aria-current` in AppNav). |
| `aria-expanded` | **PASS** — `NavShell` toggle `aria-label Toggle navigation` + `aria-expanded={open}` retained. |
| Buttons vs links | **PASS** — `New matter`/`View matters` remain `Link`, `Verify`/`Archive`/`Upload` remain `Button submit`, pagination `Link aria-disabled`. |
| Focus-visible | **PASS** — `Input`/`Select`/`Textarea` all `focus-visible:ring-1 ring-ring`, `Button` `focus-visible:ring-1`, `NavShell` links `focus-visible:ring-2`. |
| Native select keyboard | **PASS** — `Select` is native `<select>` (not Radix) — `ArrowUp/Down`, `Enter`, `Space` work. |
| Table headers | **PASS** — `TableHead` has `scope="col"` (`p-3 font-medium`), `Table` `min-w-[720px]` preserved. |
| Table `EmptyState` | Accessible `p font-medium` + `p muted` — not `role=status` but not required. |

---

## 16. Responsive Verification

| Breakpoint | Check | Result |
|---|---|---|
| **Mobile (<768px)** | Nav toggle `☰/✕` still `h-9 w-9 md:hidden` via `NavShell`; `nav hidden` vs `flex` works; `Button h-9` touch target preserved. | **PASS** (e2e `Toggle navigation` still visible) |
|  | Tables `overflow-x-auto` `min-w-[720px]` still scroll horizontally (not replaced with cards) | **PASS** |
|  | Forms `space-y-4` `Input h-9 w-full` `Select h-9` do not overflow; `grid grid-cols-2 gap-4` for dates still 2-col on mobile (narrow but not broken — P3 deferred per spec). | **PASS** |
|  | Page headers `flex justify-between gap-4` with `shrink-0` action — wraps correctly on narrow. | **PASS** |
|  | Empty states `border p-6 text-center` readable | **PASS** |
|  | Dashboard `grid-cols-2 md:grid-cols-4` — 2 cols on mobile | **PASS** |
| **Tablet/Desktop** | `max-w-5xl` outer shell already unified Pass 1; `PageHeader` `flex justify-between` + `gap-4` keeps title + action on one line until `640px` where action wraps. | **PASS** |

---

## 17. Security Regression

| Check | Result |
|---|---|
| `supabase/migrations` changed | **No** — `git diff --name-only` shows no `supabase` file (diff is `package.json` + `src/app` + `src/components` + `src/modules/*/components`). |
| RLS changed | **No** — no `CREATE POLICY`/`ALTER TABLE` in diff. |
| RPC changed | **No** — no `supabase/migrations/008` RPC touch. |
| Auth behavior changed | **No** — no `proxy.ts`/`supabase-server`/`supabase-service` change (except `MattersPage` uses `service` for *display* name map — server-only, not auth). |
| Tenant boundary changed | **No** — `listMattersByFirm(firm.id)` still, `Table` is presentation only. |
| Service-role in client | **No** — `createServiceSupabaseClient` only in `src/app/app/matters/page.tsx` (server component) and `[matterId]/page.tsx` for `assignedDisplay` (server). No `use client` file imports `supabase-service`. `Input`/`Table`/`PageHeader`/`EmptyState`/`NavShell` contain **zero** `supabase` import (`grep` would show none). |

---

## 18. `typecheck` Result

```
pnpm typecheck → tsc --noEmit → PASS (0 errors)
```

`InputProps`/`TextareaProps`/`SelectProps` changed from `interface extends` to `type =` to satisfy `no-empty-object-type`.

---

## 19. `lint` Result

```
pnpm lint → eslint → PASS (0 errors, 0 warnings)
```
(3 previous `no-empty-object-type` fixed by `type` alias.)

---

## 20. `test` Result

```
pnpm test → vitest run → 36 passed | 1 skipped (37 suites), 228 passed | 1 skipped (229 tests)
```
No NoticeFlow/MatterVault test modified; `Input`/`Table` wrappers are presentation, no logic to break.

---

## 21. `build` Result

```
pnpm build → next build (Turbopack) → PASS
  Compiled successfully in 37.2s
  10/10 pages: /, /profession/chartered-accountants, /tools/noticeflow, /app, /app/notices, /app/matters, /app/matters/[matterId], /app/matters/[matterId]/edit, /app/matters/new, /api/matter-documents/[id]
```
Static `sitemap.xml`/`robots.txt` unchanged.

---

## 22. `audit` Result

```
pnpm audit → No known vulnerabilities
```

---

## 23. `E2E` Result

```
pnpm test:e2e → 12 passed (51.9s)
  auth.spec.ts: unauthenticated /app → /login (PASS), login/signup render (PASS), onboarding requires auth (PASS)
  notices-pagination.spec.ts: preserves filters (PASS), export preserves filters not page (PASS), pagination boundaries Previous disabled (PASS), no firm_id in URL (PASS)
  smoke.spec.ts: root MicroNest (PASS), tool NoticeFlow (PASS), profession CA (PASS), unknown profession/tool not-found (PASS)
```
No `Input` regression — login `email`/`password` still `getByLabel` works (now `Input`).

---

## 24. `git diff/status`

```
git status --short:
 M package.json
 M pnpm-lock.yaml
 M src/app/app/clients/page.tsx
 M src/app/app/matters/[matterId]/edit/page.tsx
 M src/app/app/matters/[matterId]/page.tsx
 M src/app/app/matters/new/page.tsx
 M src/app/app/matters/page.tsx
 M src/app/app/members/page.tsx
 M src/app/app/notices/[noticeId]/page.tsx
 M src/app/app/notices/new/page.tsx
 M src/app/app/notices/page.tsx
 M src/app/app/page.tsx
 M src/app/globals.css
 M src/app/layout.tsx
 M src/app/page.tsx
 M src/components/layout/app-nav.tsx
 M src/components/layout/site-nav.tsx
 M src/modules/client/components/client-form.tsx
 M src/modules/matter/components/matter-form.tsx
 M src/modules/matter/components/matter-note-form.tsx
 M src/modules/matter/components/matter-notes-list.tsx
 M src/modules/matter/components/matter-upload-form.tsx
 M src/modules/matter/components/matters-table.tsx
 M src/modules/notice/components/notice-form.tsx
 M src/modules/notice/components/notices-table.tsx
?? LAWYER_MICROTOOL_* (6 reports) — preserved untracked
?? MICRONEST_COMPLETE_UIUX_AUDIT.md
?? MICRONEST_UIUX_PASS_01_REPORT.md
?? src/components/ui/input.tsx
?? src/components/ui/textarea.tsx
?? src/components/ui/select.tsx
?? src/components/ui/table.tsx
?? src/components/layout/page-header.tsx
?? src/components/ui/empty-state.tsx
?? src/components/layout/nav-shell.tsx

git diff --stat (25 files): 350 insertions(+), 271 deletions(-)
  No supabase/migrations file in diff
  No src/content/microtools.ts marketing content
  No src/modules/notice/services|repositories|permissions
  No src/modules/matter/services|repositories|permissions
```

Expected 7 new files (all thin, 15–38 lines each) + 18 modified (presentation only).

---

## 25. Explicit List of Pass 3 Items NOT Implemented

Per audit §19 and Pass 2 boundary `PART K`:

- Notice deadline urgency in **list** (only detail has urgency) — deferred
- Notice filter collapse / `Clear filters`
- Detail grouping into `Card`s (`grid grid-cols-2 border p-4` → `CardHeader`)
- Mobile date form `grid-cols-2` → `1 md:2`
- Checklist inline per-row `Upload`
- Activity metadata humanization (`JSON.stringify` → `Vakalatnama verified`)
- Mobile sticky table columns
- Touch target `h-9 (36px) → h-10 (40px)`
- Button `active:scale`
- Marketing `Why MicroTools` redesign / footer redesign / `destructive` button
- Input clear/search icon, etc.

Also **not** created: `Card` framework, `FormField` framework, `Dialog` framework, `Tabs` framework, `Breadcrumb` framework, animation libraries, color rebrand, `NavShell` generic engine (NavShell is intentionally tiny, not generic).

---

## Final Verdict

**PASS — UI/UX PASS 2 COMPLETE**

Shared primitives are genuinely thin (15–38 lines, `forwardRef` + `cn` + `h-9 border` only), no generic framework was created, NoticeFlow workflow/authorization and MatterVault ready/archive/RPC unchanged, all validation green (`typecheck/lint/test/build/audit/test:e2e`), responsive (`overflow-x-auto`, `hidden md:flex`, `max-w-5xl` shell) and accessibility (`htmlFor/id`, `aria-describedby`, `role=alert`, `aria-current`, `scope="col"`, native `select`) pass, scope is clean (UI/layout only, no migrations, no marketing content).

**Do not commit. Do not push** — per task.

