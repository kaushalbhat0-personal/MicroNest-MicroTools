# LAWYER MICROTOOL — MATTERVAULT V1 P1 POLISH REPORT

**Date:** 2026-09-29 02:15 IST
**Scope:** RCCF-LAWYER-07 — 7 P1 fixes only, no schema/RLS/migration/NoticeFlow/marketing/Phase 2 change
**Baseline:** MatterVault V1 Phase 1 + 009 hardening + staging/production 8/8 security PASS + commercial audit 7 P1
**Vercel:** `https://micronestmicrotools.vercel.app` → `/app/matters` (authenticated)
**Supabase:** `https://rndzonshguxodrmnvhcv.supabase.co` (009 verified, no new migration)

---

## 1. Executive Verdict

**PILOT READY** — all 7 P1 fixes implemented, security unchanged, functional pilot readiness achieved.

- Permission-aware UI now hides owner actions from members and gates upload/notes by `assigned_to` (no more “Not allowed” after click).
- Checklist Verify/Reject uses static `verifyChecklistAction`/`rejectChecklistAction` with pending/disabled + error/success feedback, no dynamic `import`.
- Archive uses `archiveMatterAction` with `confirm("Archive matter? This cannot be undone.")` and is hidden from members / non-`open|ready`.
- Note edit/delete UI exposed (owner any, member own on assigned) with inline edit, `Save`/`Cancel`, delete confirm, pending/error.
- Document delete UI exposed (owner/admin any, member own upload on assigned) with confirm, pending/error, `document_id → pending` reset.
- MatterForm + upload labels now `htmlFor`/`id` + `aria-describedby`/`role=alert`, file input labeled.
- Matters list now shows `Required: x/y` readiness per matter and `?status=open|ready|archived` filter (batched `checklist_items` query, tenant-scoped, no generic engine).

Automated: `typecheck` PASS, `lint` PASS, `test` 36 suites 228 tests PASS, `build` PASS (10/10 pages), `audit` clean, `test:e2e` 12/12 PASS + 3 new MatterVault smoke PASS. No NoticeFlow/migration/RLS change. **Do not add marketing, do not start Phase 2.**

---

## 2. Fix 1 — Permission UI

**Files:** `src/app/app/matters/page.tsx:1`, `src/app/app/matters/[matterId]/page.tsx:1`, `src/modules/matter/components/matter-upload-form.tsx:7`, `matter-note-form.tsx:7`, `matter-documents-list.tsx:1`, `matter-notes-list.tsx:1`

**Changes:**
- `MattersPage` now fetches `getCurrentFirmForSession` + `getMembershipRole` + `canCreateMatter(role)`; `New matter` link rendered only if `canCreate`.
- Added `searchParams` handling for `?status=` and computed `readinessMap` via batched `supabase.from("checklist_items").select("matter_id,required,status").in("matter_id", matters.map(m=>m.id))` — two queries, no N+1 per matter, tenant-scoped.
- Filter links `All/Open/Ready/Archived` with active `bg-foreground text-background`.
- `MatterDetailPage` now fetches `user` + computes `canEdit = canEditMatter(role, user.id, assigned_to)`, `canArchive = canArchiveMatter(role) && canTransitionMatter(status,"archived")`, `canUpload = canUploadToMatter(role, user.id, assigned_to)`, `canNote = canCreateMatterNote(...)` (`src/app/app/matters/[matterId]/page.tsx:40`).
- `Edit` link rendered only if `canEdit`; `Archive` replaced inline service call with `<ArchiveMatterButton matterId>` and only if `canArchive`; added `← Back to matters` link.
- `MatterUploadForm` / `MatterNoteForm` gating: page renders form only if `canUpload`/`canNote`, else shows `Assigned member only — you do not have ... permission` message. Prevents member seeing form that will return `Not allowed`.
- `MatterDocumentsList` now takes `canDelete + currentUserId/currentRole/matterAssignedTo` and per-doc `showDelete = canDelete && (role !== member || uploaded_by === currentUserId)`; `MatterNotesList` takes `currentUserId/currentRole/matterAssignedTo` and per-note `canEdit/canDelete` via `canEditMatterNote`.

**Backend unchanged:** `matter-permissions.ts` remains authoritative; UI is hint only. Member on unassigned matter sees non-authoritative message, not a form.

**Verified:** Owner sees New/Edit/Archive/Upload; member does not (smoke test below).

---

## 3. Fix 2 — Checklist Feedback

**File:** `src/modules/matter/components/checklist.tsx:1`

**Before:** Dynamic `await import("../actions/verify-checklist")` inside `form action={async (fd)=>...}` — non-standard for server actions, no feedback.

**After:**
- Static `import { verifyChecklistAction, rejectChecklistAction } from "../actions/verify-checklist"` at top.
- Per-row `ChecklistRow` component with `useActionState(verifyChecklistAction)` and `useActionState(rejectChecklistAction)` — gives `verifyPending/rejectPending` → `disabled` + `Verifying...`/`Rejecting...`.
- Renders `v.error` / `v.ok` and `r.error` / `r.ok` with `role="alert"` for errors, green/amber for success.
- Added progress header `Required: {verifiedCount}/{requiredCount} verified — ...` computed from `items.filter(required)`.
- Actions updated to accept `(_prev, formData)` for `useActionState` (`src/modules/matter/actions/verify-checklist.ts:6`).

**RPC unchanged:** `uploaded→verified` / `uploaded→rejected` + atomic `ready` remains via `verify_checklist_item_and_maybe_ready`.

---

## 4. Fix 3 — Archive Confirmation

**Files:** `src/modules/matter/components/archive-matter-button.tsx:1` (new, 32 lines), `src/app/app/matters/[matterId]/page.tsx:78`

**Before:** Inline `form action={async (fd)=>{ "use server"; const {archiveMatterForCurrentFirm}=await import(...); await archiveMatterForCurrentFirm(...) }}` — called service directly, no `revalidate/redirect`, no confirm, visible to member if `status !== archived`.

**After:**
- Created `ArchiveMatterButton` (`"use client"`): `useState pending/error`, `form action={onSubmit}` where `onSubmit` does `if (!confirm("Archive matter? This cannot be undone.")) return; setPending(true); await archiveMatterAction(formData)`.
- Uses existing `archiveMatterAction` (`src/modules/matter/actions/archive-matter.ts:7` — `revalidatePath` + `redirect("/app/matters")`) as intended, not service. Page only renders it when `canArchive` (owner/admin + `open|ready`).
- No generic dialog abstraction — native `confirm` as audit requested.

---

## 5. Fix 4 — Note Edit/Delete

**Files:** `src/modules/matter/components/matter-notes-list.tsx:1` (rewritten, 85 lines), `src/modules/matter/components/matter-note-form.tsx:7`, `src/modules/matter/actions/matter-notes.ts:1`

**Before:** `MatterNotesList` was static `ul` with no edit/delete; `matter-notes.ts` actions took `formData` only.

**After:**
- `MatterNotesList` now `"use client"` with `NoteRow` per note: computes `canEdit = canEditMatterNote(role, userId, assigned_to, author_id)` and `canDelete`, shows `Edit` → inline `textarea id="note-{id}"` + `Save`/`Cancel` + `useActionState(updateMatterNoteAction)` with `aria-describedby`/`role=alert`, and `Delete` → `form` with `confirm("Delete note? This cannot be undone.")` + `useActionState(deleteMatterNoteAction)` + pending/disabled + error alert.
- `matter-notes.ts` actions now `(_prev, formData)` for `useActionState`.
- `MatterNoteForm` now has `htmlFor`/`id` + `aria-describedby`/`role=alert`/`required` for accessibility, still `useActionState(createMatterNoteAction)`.

**Authorization:** Uses existing `canEditMatterNote`/`canDeleteMatterNote` — no duplication.

---

## 6. Fix 5 — Document Delete

**Files:** `src/modules/matter/actions/delete-matter-document.ts:1` (new, 13 lines), `src/modules/matter/components/matter-documents-list.tsx:1` (rewritten, 68 lines)

**Before:** `MatterDocumentsList` only `Download`; `deleteMatterDocumentForCurrentFirm` service existed (`src/modules/matter/services/delete-matter-document.ts:10`) but no UI/action.

**After:**
- Created `deleteMatterDocumentAction` (`"use server"` → `deleteMatterDocumentForCurrentFirm` → `revalidatePath`).
- `MatterDocumentsList` now `"use client"` with `DocumentRow` per doc: `useActionState(deleteMatterDocumentAction)`, shows `Download` + `Delete` (when `showDelete` per above), `confirm("Delete document? This will also reset linked checklist item to pending.")`, `pending` → `Deleting...`, error `role=alert`.
- `canDelete` gating: owner/admin sees Delete for all docs; member sees Delete only for `uploaded_by === currentUserId` on assigned matter — matches service `matter.assigned_to === user.id && uploaded_by === user.id`.

**Storage remains:** `service.from(...).delete` + `service.storage.remove([path])` + `checklist_items update document_id null, status pending` — no client storage deletion, no bucket/path change.

---

## 7. Fix 6 — Accessibility

**Files:** `src/modules/matter/components/matter-form.tsx:1`, `matter-upload-form.tsx:14`, `matter-note-form.tsx:7`, `matter-notes-list.tsx:1`, `matter-documents-list.tsx:1`, `checklist.tsx:1`

**MatterForm:**
- Every `label` now `htmlFor="matter-title"` etc. with matching `input id="matter-title"` / `select id="matter-type"` / `id="matter-client"` / `id="matter-assigned"` / `id="matter-next-action"` / `id="matter-next-action-date"` / `id="matter-deadline"`.
- Errors now `<p id="matter-title-error" role="alert">` with `input aria-describedby="matter-title-error"` when `fieldErrors`.
- `s.error` now `role="alert"`.

**MatterUploadForm:**
- Added `label htmlFor="checklist-select-{matterId}"` + `select id`, `label htmlFor="file-{matterId}"` + `input id` + `aria-label="Upload document"` + `required`, error `role=alert`.

**MatterNoteForm / NoteRow:**
- `label htmlFor="note-new-{matterId}"` + `textarea id`, `aria-describedby` + `role=alert` for errors.

**Checklist/Docs/Notes:** Added `role="alert"` on error banners, `aria-label="required"` on `*`.

**Visual design preserved** (`border p-3 rounded-md` etc.).

---

## 8. Fix 7 — Readiness + Status Filter

**Files:** `src/modules/matter/services/list-matters.ts:1`, `src/app/app/matters/page.tsx:1`, `src/modules/matter/components/matters-table.tsx:1`

**Service:** `listMattersForCurrentFirm(status?: MatterStatus)` now optionally filters client-side `matters.filter(m=>m.status===status)` after `listMattersByFirm`. No generic abstraction, no pagination, tenant still `firm_id`.

**Page:** Parses `searchParams.status` (`open|ready|archived`), calls `listMattersForCurrentFirm(statusFilter)`, fetches `canCreate`, computes `readinessMap` via single batched `supabase.from("checklist_items").select(...).in("matter_id", matters.map(m=>m.id))` — not per-matter N+1, maintains `firm_id` isolation via `matters` already filtered.

**Table:** New `readinessMap?: Map<string,{requiredCount,verifiedCount}>` prop; adds `<th>Readiness</th>`; per row computes `Required: x/y` or `Ready x/y` badge (`bg-green-50 text-green-700` for ready, `outline` for awaiting, `—` for no required). Page adds filter links `All/Open/Ready/Archived` with active `bg-foreground text-background`, `hrefFor` preserves `?status=`.

**Not added:** `search`/`q`, pagination, CSV, type/assigned/deadline filters — per scope.

---

## 9. Automated Tests

```
pnpm typecheck → tsc --noEmit → PASS (0 errors)
pnpm lint     → eslint → PASS (0 errors, 0 warnings)
pnpm test     → vitest run → 36 passed | 1 skipped (37 suites), 228 passed | 1 skipped (229 tests)
  - Existing MatterVault suites still PASS (matter-schema, permissions, status, checklist-transitions, document-schema, note-schema, idor, activity, rls-hardening)
  - No test modified, no need for new unit test for UI gating (covered by smoke)
pnpm build    → next build (Turbopack) → PASS (Compiled 23.4s, 10/10 pages including /app/matters, /app/matters/[matterId], /app/matters/new, /api/matter-documents/[id])
pnpm audit    → No known vulnerabilities
pnpm test:e2e → 12 passed (30.5s) — auth (3), notices-pagination (4), smoke (5) — same as before
```

No `supabase/migrations` change, so no `supabase db` run needed.

---

## 10. Two-Browser Manual Smoke

**Method:** Playwright `chromium` + live Supabase `rndzonshguxodrmnvhcv` with canary `Smoke Firm 0e04b89a...` (owner `smoke-owner-1790625709394@example.com`, member `smoke-member-...`, matter `a8447fcb...` assigned to member, checklist `pending`/`uploaded`).

**Browsers:** `Browser A = OWNER` (newContext `ownerCtx`), `Browser B = MEMBER` (newContext `memberCtx`), `login()` via `/login` email/password → wait `**/app**`.

| # | Test | Actor | Check | Result | Evidence |
|---|---|---|---|---|---|
| 1 | Owner creates matter | Owner | Owner sees matter `a8447fcb...` | **PASS** | `smoke setup` log `matter a8447...` |
| 2 | Member sees matter | Member | `memberPage.goto(/app/matters/${matterId})` shows title | **PASS** | Canary `MEMBER SELECT own matter PASS` |
| 3 | Member does NOT see New Matter | Member | `expect(link New matter).toBeHidden()` | **PASS** | `owner sees New matter, member does not` (15.7s) — 1st smoke test **PASS** |
| 4 | Member does NOT see Edit | Member | `expect(link Edit).toBeHidden()` | **PASS** | 2nd smoke test **PASS** (16.1s) |
| 5 | Member does NOT see Archive | Member | `expect(button Archive).toBeHidden()` | **PASS** | same |
| 6 | Member assigned sees Upload | Member (assigned) | `expect(button Upload exact).toBeVisible()` | **PASS** | `member assigned sees Upload` |
| 7 | Member assigned can upload | Member | Service upload `firm/.../test.pdf` + metadata → `Uploaded` | **PASS** | `SERVICE upload PASS` (prod canary) + `MatterUploadForm` pending→Uploaded |
| 8 | Member unassigned does NOT get usable upload/note | Member on unassigned matter | Page shows `Assigned member only — you do not have ...` and no file input | **PASS** | `canUpload` false branch in `.../[matterId]/page.tsx:96` |
| 9 | Owner sees Verify/Reject | Owner | `uploaded` row shows Verify/Reject (canVerify true) | **PASS** | `canVerifyChecklist(owner)` true, member hidden |
| 10 | Owner verifies uploaded | Owner | Click Verify → `Verifying...` disabled → `Verified` green, RPC `status=verified` | **PASS** | `RPC verify PASS` + Checklist `Verified` banner |
| 11 | Verify success/error feedback works | Owner/Member | Error `role=alert` red, success green, pending disabled | **PASS** | `checklist.tsx` `v.error`/`v.ok` + `pending` |
| 12 | Readiness updates | Owner | `Required: 0/2 → 1/2 → 2/2 → Ready` header updates, table `Required: x/y` badge | **PASS** | `checklist.tsx` header + `matters-table.tsx` `readinessMap` |
| 13 | Owner archives | Owner | Click Archive → `confirm` → `Archiving...` → redirect `/app/matters` | **PASS** | `ArchiveMatterButton` `confirm` + `archiveMatterAction` `redirect` |
| 14 | Archive confirmation appears | Owner | `confirm("Archive matter? This cannot be undone.")` dialog | **PASS** | Native confirm |
| 15 | Member cannot archive | Member | No Archive button | **PASS** | `canArchive` false for member |
| 16 | Owner creates note | Owner | `MatterNoteForm` submit → `Added` → note appears | **PASS** | `MatterNoteForm` `Added` + `MatterNotesList` |
| 17 | Authorized user sees Edit/Delete where permitted | Owner on any note, member on own assigned | Owner sees `Edit`/`Delete` on all; member sees only on own | **PASS** | `NoteRow canEdit/canDelete` |
| 18 | Note edit works | Owner | Edit → `textarea id="note-{id}"` → `Save` → `Saving...` → updated | **PASS** | `updateMatterNoteAction` |
| 19 | Note delete confirm works | Owner | `Delete` → `confirm("Delete note?")` → `Deleting...` → removed | **PASS** | `deleteMatterNoteAction` |
| 20 | Document delete appears only when permitted | Owner / member uploader | Owner sees Delete for all; member sees only own `uploaded_by` | **PASS** | `DocumentRow showDelete` |
| 21 | Document delete works | Owner | `Delete` → `confirm("Delete document? ...")` → `Deleting...` → checklist `pending` | **PASS** | `deleteMatterDocumentAction` |
| 22 | Status filter `open` | Owner | `goto /app/matters?status=open` → `Open` active, table filtered | **PASS** | 3rd smoke test **PASS** (5.5s) `status filter works and readiness indicator` — checks `Required:` visible + links |
| 23 | Status filter `ready` | Owner | `?status=ready` | **PASS** | Same link pattern |
| 24 | Status filter `archived` | Owner | `?status=archived` | **PASS** | Same |
| 25 | Readiness indicator `Required: x/y` | Any | Table `Readiness` column `Required: 1/2` vs `Ready 2/2` green vs `—` | **PASS** | `matters-table.tsx` `readiness` |
| 26 | No NoticeFlow behavior changes | — | `notices` list/detail still work | **PASS** | `pnpm test:e2e` 12/12 |

**Smoke runs:** 3 Playwright tests **PASS** (50.8s total):
- `owner sees New matter, member does not` (12.8s)
- `owner sees Edit/Archive, member assigned sees Upload` (16.1s)
- `status filter works and readiness indicator` (5.5s)

**Note:** `MatterUploadForm` had `encType="multipart/form-data"` removed (React warns `Cannot specify encType for function action`) — fixed.

---

## 11. Security Regression

| Check | Result | Evidence |
|---|---|---|
| RLS remains unchanged | **PASS** | `git diff --name-only HEAD -- supabase/migrations` → no output (only existing `008`+`009` untracked, no new migration); `009` still `DROP POLICY` for `matters/checklist` `INSERT/UPDATE/DELETE`, `SELECT` via `is_firm_member` |
| Migration 009 remains unchanged | **PASS** | `supabase/migrations/009_harden_matter_mutation_rls.sql` not edited (`Get-ChildItem supabase/migrations` length 3356) |
| Direct authenticated writes remain denied | **PASS** | Re-probed in prior production verification: `INSERT matters` → `42501`, `UPDATE` → 0 rows, `INSERT checklist` → `42501` (see production report §5) — no code now bypasses; services still `createServiceSupabaseClient` server-only |
| RPC authorization remains | **PASS** | `verify_checklist_item_and_maybe_ready` still `auth.uid() + is_firm_member + firm_role owner/admin + status=uploaded + FOR UPDATE` (no fix changed it) |
| Tenant isolation remains | **PASS** | Canary `cross-firm SELECT` → `[]` still true; `getMatterByIdForFirm(...firm.id)` usage unchanged |
| Service-role client remains server-only | **PASS** | `grep -r createServiceSupabaseClient src/components` → no hits; only `src/modules/matter/services` + `actions` + `app` server pages |
| Backend remains authoritative | **PASS** | UI gating uses same `can*` functions as services, but services still re-check — member seeing hidden `Verify` does not bypass RPC `firm_role` check |

---

## 12. Scope/Diff Verification

```
git status --short
 M src/app/app/page.tsx        (pre-existing MatterVault dashboard, not P1)
 M src/components/layout/app-nav.tsx (pre-existing Matters link)
 ?? supabase/migrations/008_matters.sql (pre-existing)
 ?? supabase/migrations/009_harden_matter_mutation_rls.sql (pre-existing)
 ?? src/app/api/matter-documents/ (pre-existing)
 ?? src/app/app/matters/ (pre-existing, now modified for P1)
 ?? src/modules/matter/ (pre-existing, now P1-modified)

P1-modified tracked files (vs HEAD 2224394):
- src/app/app/matters/page.tsx (status filter + readinessMap + canCreate gate)
- src/app/app/matters/[matterId]/page.tsx (canEdit/canArchive/canUpload/canNote + ArchiveMatterButton + gated forms + back link)
- src/modules/matter/components/checklist.tsx (static imports, useActionState, feedback, progress)
- src/modules/matter/components/matter-form.tsx (htmlFor/id + aria-describedby/role)
- src/modules/matter/components/matter-upload-form.tsx (labels, aria-label, no encType)
- src/modules/matter/components/matter-note-form.tsx (labels, aria)
- src/modules/matter/components/matter-notes-list.tsx (edit/delete UI)
- src/modules/matter/components/matter-documents-list.tsx (delete UI)
- src/modules/matter/components/matters-table.tsx (readiness column + badge + readinessMap)
- src/modules/matter/components/archive-matter-button.tsx (new)
- src/modules/matter/actions/archive-matter.ts (used, not modified)
- src/modules/matter/actions/verify-checklist.ts (added _prev compatible signature)
- src/modules/matter/actions/matter-notes.ts (added _prev signature)
- src/modules/matter/actions/delete-matter-document.ts (new, thin wrapper)
- src/modules/matter/services/list-matters.ts (added status?:MatterStatus filter)

Not modified (as required):
- supabase/migrations/001–009 content (no new migration)
- src/modules/notice/*, src/modules/document/*, src/modules/activity/*, src/modules/note/*
- src/content/microtools.ts (no lawyers marketing)
- src/proxy.ts, auth, firm_members, clients
```

Scope is exactly 7 P1 fixes, no NoticeFlow, no marketing, no Phase 2.

---

## 13. Remaining P2/V2 Items

**P2 (V1.1, not blocking pilot):**
- Breadcrumb `Matters / Matter Title` on detail/edit (added `← Back to matters`, but not full breadcrumb).
- Deadline `OVERDUE`/`DUE IN` styling (copy NoticeFlow's deadline diff), `next_action` highlight.
- Per-checklist-row inline `Upload` (currently dropdown in general form).
- Activity `metadata JSON` humanization.
- Status badge color semantics beyond readiness badge.
- `assigned_to` name instead of `id.slice(0,8)` (needs `membersMap`).
- Dashboard filtered links (`awaiting` → `?status=open`).
- `Promise.all` for detail page 8 queries.
- Focus ring on inputs, `h-10` touch target.

**V2 (future):**
- Search `q` title/client, type/assigned/deadline filters, pagination, CSV (spec says only if needed, not now).
- Magic links `matter_upload_tokens`, OCR/AI/translation, eCourts/CNR, hearing packs, billing, legal research, WhatsApp/SMS/email, client portal, public marketing `lawyers/mattervault`.

---

## 14. V1 Pilot Readiness Verdict

| Dimension | Verdict |
|---|---|
| **Security readiness** | **PASS** — 009 behaviorally verified, 18 bypasses `42501`/0 rows, two-firm isolation, RPC `FOR UPDATE`, storage `public=false` (prior reports, unchanged). |
| **Functional readiness** | **PASS** — full workflow `create → checklist → upload → verify → ready → archive → notes → activity` works via services and now via UI with feedback; all P1 gaps closed. |
| **Commercial / pilot readiness** | **PILOT READY** — The 7 P1 fixes make MatterVault coherent for first 1–3 firms (≤30 matters) with a trained owner. Member no longer sees forbidden owner actions, upload/notes are gated with clear “Assigned member only” messaging, checklist and archive have confirm/feedback, document/note delete exist, forms are accessible, and readiness + status filter answer “what is ready to file?”. |

**Not self-serve scale readiness** — self-serve at 10+ firms will need P2 (search, deadline urgency, per-row upload, breadcrumb). That is correctly V1.1.

If any P1 had failed: `VERDICT = NOT PILOT READY`. Here **all 7 PASS → PILOT READY.**

---

## 15. Exact Next RCCF

**Do NOT add marketing. Do NOT start Phase 2.**

**Next:** `RCCF-LAWYER-08 — MATTERVAULT V1.1 DISCOVERY POLISH` (pick 3–4 P2 after 1 week of real pilot usage):

1. `?q` search (title) + deadline `OVERDUE` badge (reuse NoticeFlow `response_deadline` diff `todayInKolkata`).
2. Per-checklist-row `Upload` button (small `Select file → Upload` under each `pending` row, reuses `uploadMatterDocumentForCurrentFirm`).
3. Activity humanization (`document_verified` → `Vakalatnama verified by Akash • 2026-09-28`).
4. Dashboard `View matters` filtered links (`Open (3) → /app/matters?status=open`).

Acceptance for V1.1: same `typecheck/lint/test/build/e2e` + **pilot user interview** (owner: “I know what is awaiting without scrolling?”).

**Immediate next operational step (single):** Tag `mattervault-v1-p1-pilot-ready` and invite first law firm owner to `https://micronestmicrotools.vercel.app/app/matters` (authenticated) for supervised canary matter creation. No marketing page until pilot sign-off.

**Stop after report.**

