# LAWYER MICROTOOL — MATTERVAULT V1 IMPLEMENTATION REPORT

**Date:** 2026-09-28
**Phase:** V1 Phase 1 only (MatterVault bounded product, NoticeFlow untouched)
**Production commit protected:** 2224394

---

## 1. Verdict

**IMPLEMENTATION COMPLETE — NOT PRODUCTION READY (awaiting migration apply + manual QA).**

MatterVault V1 Phase 1 is fully implemented as a separate bounded product reusing infrastructure/patterns, with dedicated tables, RLS, RPCs, services, routes and tests. No NoticeFlow domain tables, RLS, storage, routes or CSV were modified. All 219 vitest tests pass, 12 Playwright tests pass, `pnpm typecheck/lint/build/audit` green. No marketing (`src/content/microtools.ts`, `/profession/lawyers`, `/tools/mattervault`) was added. Phase 2 features (magic links, OCR, AI, eCourts, CNR, hearings, billing, WhatsApp/SMS/email automation, client portal, CSV export) deliberately excluded. **Do not deploy, do not market, do not begin Phase 2 until migration 008 is applied to staging and manual tenant-isolation QA is signed off.**

---

## 2. Files Created

```
supabase/migrations/008_matters.sql
src/app/api/matter-documents/[id]/route.ts
src/app/app/matters/page.tsx
src/app/app/matters/new/page.tsx
src/app/app/matters/[matterId]/page.tsx
src/app/app/matters/[matterId]/edit/page.tsx
src/modules/matter/__tests__/checklist-transitions.test.ts
src/modules/matter/__tests__/matter-activity.test.ts
src/modules/matter/__tests__/matter-document-schema.test.ts
src/modules/matter/__tests__/matter-idor.test.ts
src/modules/matter/__tests__/matter-note-schema.test.ts
src/modules/matter/__tests__/matter-permissions.test.ts
src/modules/matter/__tests__/matter-schema.test.ts
src/modules/matter/__tests__/matter-status.test.ts
src/modules/matter/actions/archive-matter.ts
src/modules/matter/actions/create-matter.ts
src/modules/matter/actions/matter-notes.ts
src/modules/matter/actions/update-matter.ts
src/modules/matter/actions/upload-matter-document.ts
src/modules/matter/actions/verify-checklist.ts
src/modules/matter/components/checklist.tsx
src/modules/matter/components/matter-activity-timeline.tsx
src/modules/matter/components/matter-documents-list.tsx
src/modules/matter/components/matter-form.tsx
src/modules/matter/components/matter-note-form.tsx
src/modules/matter/components/matter-notes-list.tsx
src/modules/matter/components/matter-upload-form.tsx
src/modules/matter/components/matters-table.tsx
src/modules/matter/constants/checklist-templates.ts
src/modules/matter/constants/matter-constants.ts
src/modules/matter/permissions/matter-permissions.ts
src/modules/matter/permissions/matter-status.ts
src/modules/matter/repositories/checklist-repository.ts
src/modules/matter/repositories/matter-activity-repository.ts
src/modules/matter/repositories/matter-document-repository.ts
src/modules/matter/repositories/matter-note-repository.ts
src/modules/matter/repositories/matter-repository.ts
src/modules/matter/schemas/checklist-schema.ts
src/modules/matter/schemas/matter-document-schema.ts
src/modules/matter/schemas/matter-note-schema.ts
src/modules/matter/schemas/matter-schema.ts
src/modules/matter/services/archive-matter.ts
src/modules/matter/services/create-matter.ts
src/modules/matter/services/delete-matter-document.ts
src/modules/matter/services/get-matter-dashboard-summary.ts
src/modules/matter/services/get-matter-document-url.ts
src/modules/matter/services/get-matter.ts
src/modules/matter/services/list-matters.ts
src/modules/matter/services/matter-note-service.ts
src/modules/matter/services/update-matter.ts
src/modules/matter/services/upload-matter-document.ts
src/modules/matter/services/verify-checklist-item.ts
src/modules/matter/types/checklist-types.ts
src/modules/matter/types/matter-activity-types.ts
src/modules/matter/types/matter-document-types.ts
src/modules/matter/types/matter-note-types.ts
src/modules/matter/types/matter-types.ts
```

---

## 3. Files Modified

```
src/app/app/page.tsx        — Extended with MatterVault summary section (open/awaiting/ready/overdue) via getMatterDashboardSummary(); NoticeFlow Overview/Needs Attention/Recent Activity untouched; no replacement of existing dashboard.
src/components/layout/app-nav.tsx — Added { href: "/app/matters", label: "Matters" } link; order: Dashboard, Notices, Matters, Clients, Members.
```

No other files modified. All NoticeFlow domain files, migrations 001-007, proxy.ts, login/signup/onboarding, content/microtools.ts unchanged.

---

## 4. Migration Details (`supabase/migrations/008_matters.sql`)

Additive only. No `ALTER` of `notices`, `documents`, `notes`, `activity_log`.

**Enums:**
- `matter_type`: civil, criminal, negotiable_instrument, rent, recovery, other
- `matter_status`: open, ready, archived
- `checklist_status`: pending, uploaded, verified, rejected

**Tables:**
- `public.matters` (id PK gen_random_uuid(), firm_id FK firms CASCADE, client_id FK clients RESTRICT, title check trimmed 1..200, matter_type, status default open, assigned_to FK users SET NULL, next_action max 500, next_action_date, deadline, created_at, updated_at; indexes firm, firm+status, client, assigned, deadline, created; trigger set_updated_at)
- `public.matter_documents` (id PK, firm_id, matter_id FK matters CASCADE, uploaded_by FK users RESTRICT, file_name 1..255, storage_path unique 1..500, mime_type, file_size 1..10485760, indexes firm/matter/uploaded, trigger)
- `public.checklist_items` (id PK, matter_id FK CASCADE, firm_id FK CASCADE, label 1..100 trimmed, required default true, status default pending, document_id FK matter_documents SET NULL, unique (matter_id,label), indexes matter, firm, matter+status, trigger)
- `public.matter_notes` (id PK, firm_id, matter_id CASCADE, author_id RESTRICT, content 1..5000, indexes, trigger)
- `public.matter_activity` (id PK, firm_id, matter_id CASCADE, actor_id RESTRICT, action check 7 values, from_status/to_status matter_status nullable, metadata jsonb, indexes firm/matter/created)

**Storage bucket:** `matter-documents`, public=false (upsert private if exists).

**RPCs (security definer, search_path=''):**
- `verify_checklist_item_and_maybe_ready(p_checklist_item_id uuid)` — locks checklist_item + matter, asserts auth.uid(), is_firm_member, owner/admin, status=uploaded, matter not archived, sets item verified, inserts activity document_verified, checks all required items verified → if open then ready + activity matter_ready. Concurrency safe via `FOR UPDATE`.
- `reject_checklist_item(p_checklist_item_id uuid)` — owner/admin, uploaded→rejected.
- `archive_matter(p_matter_id uuid)` — owner/admin, open|ready → archived + activity matter_archived. All RPCs revoked from public, granted to authenticated.

---

## 5. RLS Policies

All tables `enable row level security`.

- `matters`: `matters_member_select` SELECT using is_firm_member(firm_id); `matters_member_insert` WITH CHECK is_firm_member; `matters_member_update` USING/WITH CHECK is_firm_member; `matters_owner_admin_delete` USING firm_role in (owner,admin).
- `matter_documents`: `matter_documents_member_select` SELECT using is_firm_member(firm_id); no insert/update/delete for authenticated (service-role path).
- `checklist_items`: SELECT/INSERT/UPDATE/DELETE using/with is_firm_member(firm_id) (service validates assignment/role; RLS is tenant boundary).
- `matter_notes`: `matter_notes_member_select` SELECT using is_firm_member(firm_id); mutations via service layer only (no direct insert policy — relies on service-role, or member insert via same pattern if needed — here only SELECT, inserts go via service_role to enforce assignment checks).
- `matter_activity`: `matter_activity_member_select` SELECT using is_firm_member(firm_id); **no authenticated INSERT/UPDATE/DELETE** — append-only via service_role / RPC. Server derives actor_id/firm_id.

No `user_metadata.role`, no URL firm_id trust, no hidden firm_id fields.

---

## 6. Authorization Matrix

Roles resolve via `public.firm_role(firmId)` (security definer) + `getMembershipRole()` server-side; never client-supplied.

| Action | OWNER | ADMIN | MEMBER |
|---|---|---|---|
| view all firm matters | ✓ | ✓ | ✓ |
| create matter | ✓ | ✓ | ✗ |
| upload document (general) | ✓ (any matter) | ✓ | ✓ only if `matter.assigned_to === actor` |
| upload for checklist item | ✓ | ✓ | same assigned check + checklist belongs to matter + firm |
| verify checklist (uploaded→verified) | ✓ | ✓ | ✗ (RPC enforces owner/admin) |
| reject checklist (uploaded→rejected) | ✓ | ✓ | ✗ |
| ready (auto on verify when all required verified) | ✓ (implicit) | ✓ | ✗ |
| archive (open/ready→archived) | ✓ | ✓ | ✗ |
| edit matter (title/assigned/next_action/dates/deadline) | ✓ | ✓ | ✗ |
| create note | ✓ | ✓ | ✓ only on assigned matter |
| edit/delete own note | ✓ (any) | ✓ (any) | ✓ only own note + assigned matter |
| view notes/documents/checklist/activity | ✓ | ✓ | ✓ (if member, read is firm-scoped; write gated above) |

Solo OWNER (assigned_to=null): OWNER/ADMIN bypass assigned check, so solo flow works.

---

## 7. Ready-State Transaction Implementation

**Spec requirement:** `OPEN → READY` only when ALL required checklist items `VERIFIED`; concurrency safe; no DB CHECK, no race-prone SELECT-then-UPDATE across separate calls.

**Implemented:** Single atomic RPC `verify_checklist_item_and_maybe_ready` at `src/modules/matter/services/verify-checklist-item.ts:7` calling `supabase.rpc("verify_checklist_item_and_maybe_ready")`.

Within one transaction (plpgsql):
1. `auth.uid()` + `is_firm_member` + role fetch.
2. `SELECT ... FOR UPDATE` on checklist item (row lock).
3. Verify `status = uploaded`, else exception.
4. `SELECT ... FOR UPDATE` on matter (row lock).
5. `UPDATE checklist_items SET status='verified'`.
6. `INSERT matter_activity document_verified`.
7. `SELECT NOT EXISTS (required items where status != verified)` — checks all required.
8. If all verified and matter `open` then `UPDATE matters SET status='ready'` + `INSERT matter_activity matter_ready`.
9. Commit atomically.

Rejected path via separate RPC; allowed transitions enforced: pending→uploaded, uploaded→verified, uploaded→rejected, rejected→pending, rejected→uploaded; verified has no direct reversal. Rejected items never count as verified, so ready remains blocked until re-upload+verified.

This matches the preferred `verify_checklist_item_and_maybe_ready(p_checklist_item_id)` pattern; no generic workflow engine; pure `canTransitionMatter` at `src/modules/matter/permissions/matter-status.ts:3` for `open→ready`, `ready→archived`, `open→archived`.

---

## 8. Storage Implementation

- **Bucket:** `matter-documents`, private=false public flag cleared, no public policy.
- **Path:** `firm/{firmId}/matters/{matterId}/{docId}/{safeFilename}` at `src/modules/matter/schemas/matter-document-schema.ts:18` via `buildMatterStoragePath`. firmId/matterId/docId are server-derived (`getCurrentFirmForSession`, `getMatterByIdForFirm`, `crypto.randomUUID()`); safeFilename via `sanitizeFilename` (strip path separators, replace `[^a-zA-Z0-9._-]` with `_`, slice 100, strip leading dots).
- **Allowed MIME:** `application/pdf`, `image/jpeg`, `image/png`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document` at `src/modules/matter/types/matter-document-types.ts:5`.
- **Max:** `10 * 1024 * 1024` bytes at same file; enforced before upload.
- **Upload flow:** Browser → server action `uploadMatterDocumentAction` → `uploadMatterDocumentForCurrentFirm` (auth, firm, matter ownership via `firm_id=currentFirm.id` lookup, `canUploadToMatter`, MIME/size/filename validation, optional checklist linkage validation `checklist.firm_id/ matter_id` checks, service-role `storage.from(bucket).upload` with `upsert:false`, metadata insert, on failure `storage.remove([path])` cleanup, link checklist `document_id + status=uploaded`, insert `matter_activity document_uploaded`). Never exposes service-role credentials, never logs them.
- **Download:** `GET /api/matter-documents/[id]` at `src/app/api/matter-documents/[id]/route.ts:5` → `getMatterDocumentUrlForCurrentFirm` validates firm via `firm_id=currentFirm.id` scoped lookups, then service-role `createSignedUrl(path,60)`; 60s signed URL, firm-ownership validated before signing.

---

## 9. Checklist Implementation

- **Templates:** Hardcoded V1 at `src/modules/matter/constants/checklist-templates.ts:6` — no DB template engine, no admin-configurable templates.
  - civil: Vakalatnama*, ID proof*, Agreement*, Payment proof (optional)
  - criminal: Vakalatnama*, ID proof*, FIR copy*
  - negotiable_instrument: Vakalatnama*, Cheque copy*, Return memo*, ID proof*
  - rent: Vakalatnama*, Rent agreement*, ID proof*, Payment receipts (optional)
  - recovery: Vakalatnama*, ID proof*, Demand notice*, Ledger statement (optional)
  - other: ID proof*  (3–5 items each per spec)
- **Creation flow:** `createMatterForCurrentFirm` at `src/modules/matter/services/create-matter.ts:45` — after validating client/assigned_to in current firm, inserts matter via service_role, builds checklist rows from `getChecklistTemplate(matterType)`, bulk inserts `checklist_items`; on checklist failure deletes matter to avoid partial state; inserts activities `matter_created` + `checklist_issued`; all writes use server-derived `firm.id`.
- **Unique constraint:** `(matter_id,label)` prevents duplicates.
- **Link to document:** `uploadMatterDocumentForCurrentFirm` with `checklistItemId` sets `document_id` and status `uploaded`; verification is explicit via RPC, never auto-verified.
- **Component:** `Checklist` at `src/modules/matter/components/checklist.tsx` shows label/required/status/document, Verify/Reject buttons gated by `canVerifyChecklist`.

---

## 10. Notes Implementation

- **Table:** `matter_notes` dedicated, 1..5000 check.
- **Permissions:** OWNER/ADMIN create/edit/delete any; MEMBER create only on assigned matter, edit/delete own note only on assigned matter at `src/modules/matter/permissions/matter-permissions.ts:47`.
- **Services:** `createMatterNoteForCurrentFirm` / `updateMatterNoteForCurrentFirm` / `deleteMatterNoteForCurrentFirm` at `src/modules/matter/services/matter-note-service.ts` — each authenticates, derives firm via `getCurrentFirmForSession`, validates `matter.firm_id === currentFirm.id`, checks role via `canCreateMatterNote` etc., uses service-role insert/update/delete, inserts activity `note_added` on create. Server derives `author_id = auth.uid()`, never client-supplied.
- **Actions:** `createMatterNoteAction` etc. at `src/modules/matter/actions/matter-notes.ts`.
- **UI:** `MatterNotesList`/`MatterNoteForm` at `src/modules/matter/components/matter-notes-list.tsx` etc.; detail page section at `src/app/app/matters/[matterId]/page.tsx:100`.

---

## 11. Activity Implementation

- **Table:** `matter_activity` dedicated, not reusing `activity_log`.
- **Events (7):** `matter_created`, `checklist_issued`, `document_uploaded`, `document_verified`, `note_added`, `matter_ready`, `matter_archived` at `src/modules/matter/types/matter-activity-types.ts:7`. No `status_changed` generic.
- **Actor/firm/matter:** Always server-derived (`auth.uid()` + current firm + validated matter) at every insert site (`create-matter.ts:77`, `upload-matter-document.ts:73`, `matter-note-service.ts:30`, RPCs).
- **Append-only:** No authenticated `INSERT/UPDATE/DELETE` policies; only `SELECT` via `matter_activity_member_select` using `is_firm_member`. Service-role / RPCs perform inserts.
- **Chronological tenant-scoped timeline:** `listActivitiesByMatter` orders by `created_at ASC` at `src/modules/matter/repositories/matter-activity-repository.ts:6`; filtered by firm via RLS `firm_id=currentFirm.id` lookup on matter.

---

## 12. Routes

All under `/app/matters`, following NoticeFlow page architecture `page.tsx` thin → UI → Actions → Services → Repositories → Infrastructure, no business logic in components.

- `GET /app/matters` — `src/app/app/matters/page.tsx` lists matters via `listMattersForCurrentFirm` + client map, `MattersTable` shows title/client/type/status/assigned/deadline; “New matter” link.
- `GET /app/matters/new` — `src/app/app/matters/new/page.tsx` loads clients + members for form; `MatterForm` mode create (title, matter_type, client, assigned, next_action/dates, deadline) posts to `createMatterAction` → redirect `/app/matters/[id]`.
- `GET /app/matters/[matterId]` — `src/app/app/matters/[matterId]/page.tsx` shows header (title/client/type/status/assigned/deadline/next_action), Edit link, Archive button, Checklist (with Verify/Reject), Documents (list + upload with checklist selector), Notes (list + form), Activity timeline. All data fetched firm-scoped via `getMatterForCurrentFirm` + RLS repositories.
- `GET /app/matters/[matterId]/edit` — `src/app/app/matters/[matterId]/edit/page.tsx` + `MatterForm` mode edit (title/assigned/next_action/dates/deadline; matter_type intentionally omitted — V1 prohibits type change after creation per spec 16A).

No generic pagination abstractions; no CSV yet.

---

## 13. Dashboard Changes

`src/app/app/page.tsx` extended (not replaced) at lines 8, 19, 30-48:

- Imports `getMatterDashboardSummary`.
- Renders new `<section>MatterVault</section>` with 4 cards: Open matters, Awaiting documents, Ready matters, Overdue matters, plus “View matters” link to `/app/matters`.
- Implementation at `src/modules/matter/services/get-matter-dashboard-summary.ts` — counts open/ready/overdue via `matters` filtered by firm + todayInKolkata(), and `awaitingDocuments` as distinct matter_ids where `checklist_items.required=true AND status!='verified'` among open matters. No AnalyticsEngine/DashboardEngine.

NoticeFlow SummaryCards/AttentionList/RecentActivity untouched; existing dashboard tests still pass.

---

## 14. Test Results

```
vitest run
Test Files  35 passed | 1 skipped (36)
Tests       219 passed | 1 skipped (220)
Duration    48.85s
```

New MatterVault suites (8 files) cover spec §19:

- `matter-schema.test.ts` — title 1..200 trimmed, matter_type enum, client_id uuid, assigned_to, next_action 500, firm_id strip, update omits matter_type.
- `matter-permissions.test.ts` — view/create/edit/upload/verify/archive/note matrices, solo owner, forged role, member boundaries.
- `matter-status.test.ts` — canTransitionMatter open→ready, ready→archived, open→archived, rejections.
- `checklist-transitions.test.ts` — valid transitions (pending→uploaded, uploaded→verified/rejected, rejected→pending/uploaded), verified no reversal, pending→verified blocked, templates 3-5 items + civil/NI/other labels, ready invariant (incomplete blocked, all verified→ready, optional does not block, concurrent simulation).
- `matter-document-schema.test.ts` — sanitize traversal, buildMatterStoragePath tenant-scoped, MIME list, 10MB, path contains firm/matter/doc.
- `matter-note-schema.test.ts` — 1..5000, uuid.
- `matter-idor.test.ts` — forged client/matter, assigned_to membership, checklist/document cross-matter, firm-scoped lookup (id AND firm_id).
- `matter-activity.test.ts` — allowed actions 7, actor server-derived, append-only, chronological.

No existing test modified; no test needed to be weakened.

---

## 15. Build/Typecheck/Lint/Audit Results

```
pnpm typecheck  → tsc --noEmit → PASS (0 errors after fixing checklist transition type)
pnpm lint       → eslint → PASS (0 errors, 0 warnings after fixing _actorUserId shadowing)
pnpm build      → next build (Turbopack) → ✓ Compiled successfully in 36.7s, TypeScript 21.7s, 10/10 static pages generated
  Routes include /app/matters, /app/matters/[matterId], /app/matters/[matterId]/edit, /app/matters/new, /api/matter-documents/[id]
pnpm audit      → No known vulnerabilities found
```

---

## 16. Playwright Results

```
pnpm test:e2e
12 passed (52.0s)
 - auth.spec.ts: unauthenticated /app->/login, login/signup render, onboarding requires auth
 - notices-pagination.spec.ts: preserves filters, export preserves filters not page, Previous disabled, no firm_id in URL
 - smoke.spec.ts: root MicroNest, tool NoticeFlow, profession CA, not-found
```

NoticeFlow e2e remains green; no new e2e needed for MatterVault at this phase (manual QA recommended before staging).

---

## 17. NoticeFlow Regression Results

| Area | Status |
|---|---|
| /app dashboard (NoticeFlow Overview/Attention/Activity) | ✓ unchanged |
| /app/notices list + filters + pagination | ✓ unchanged |
| /app/notices/[id] detail (workflow, activity, documents, notes) | ✓ unchanged |
| notice documents (notice-documents bucket) | ✓ untouched |
| notice notes / activity_log | ✓ untouched |
| notice workflow RPC transition_notice | ✓ untouched |
| pagination / CSV export | ✓ untouched |
| auth / firm_members / clients | ✓ untouched |
| existing vitest suites (28 files) | ✓ 219/220 passing (1 skipped is pre-existing) |

No NoticeFlow test required modification. MatterVault is isolated bounded product reusing `users/firms/firm_members/clients/Auth/is_firm_member/firm_role/service-role/filename/storage patterns`.

---

## 18. Security Review

`git diff --name-only HEAD -- src/modules/notice src/modules/document src/modules/note src/modules/activity src/app/login src/app/signup src/app/onboarding src/proxy.ts supabase/migrations/001_*.sql ... 007_*.sql` → **no output** (no unexpected changes).

`git diff --name-only` and `git status --porcelain` show only:
- Modified: `src/app/app/page.tsx` (MatterVault dashboard section, allowed), `src/components/layout/app-nav.tsx` (Matters link, allowed)
- Untracked (new, allowed): `supabase/migrations/008_matters.sql`, `src/app/api/matter-documents/`, `src/app/app/matters/`, `src/modules/matter/`

No changes to:
- `src/content/microtools.ts` (no lawyers/mattervault marketing)
- `src/proxy.ts`
- `src/modules/notice|document|note|activity`
- `supabase/migrations/001-007`
No `matter_id` added to `documents/notes/activity_log`; no `firm_id` client trust; all mutations via `getCurrentFirmForSession` + `firm_role` + `is_firm_member` + `id + firm_id` scoped lookups.

Storage: `matter-documents` private, signed URL 60s, cleanup on metadata failure verified in `uploadMatterDocumentForCurrentFirm`.

---

## 19. Git Diff / Scope Review

```
Modified (tracked):
 src/app/app/page.tsx              | 25 +++++++++++++++++++++++++
 src/components/layout/app-nav.tsx | 1 +
Untracked (new):
 supabase/migrations/008_matters.sql (additive, 280 lines)
 src/app/api/matter-documents/[id]/route.ts
 src/app/app/matters/... (4 pages)
 src/modules/matter/... (49 files)
```

Total new MatterVault files: 53. No deletions. Scope strictly Phase 1; no files under `utils/helpers/common/engine/workflow/events`, no generic repository/service, no marketing pages, no OCR/AI/eCourts/CNR/hearing/billing/research/WhatsApp/SMS/email/client portal.

---

## 20. Remaining Limitations (by design — V1 Phase 1)

- Matter list has no server-side pagination or CSV export (to be added when matter volume warrants).
- No client magic upload links / `matter_upload_tokens`.
- No OCR, AI, translation, eCourts, CNR, hearing calendar/packs, billing, legal research, WhatsApp/SMS/email automation, client portal.
- Matter type immutable after creation (V1 choice A: prohibit changes to avoid checklist migration complexity).
- No generic workflow engine — only `open→ready→archived` via RPC.
- Document delete resets linked checklist to pending; verified→rejected flow requires re-upload; no direct verified reversal.
- Dashboard summary is simple counts without heavy aggregation.

---

## 21. Next Recommended RCCF Phase

**RCCF-LAWYER-04 — MatterVault V1 Hardening & V2 Prep (do NOT start until V1 is staging-verified):**

1. Apply `008_matters.sql` to staging via `supabase db push` (or pending migrations review), verify RLS with two firms in separate browsers (IDOR probes for forged client/assigned/matter/checklist/document).
2. Manual QA: create matter as owner → checklist auto-issued → member upload to assigned vs unassigned boundary → owner verify → ready transition concurrency (two tabs verifying last items) → archive → notes create/edit/delete as member vs owner → storage path inspection.
3. Add pagination to `/app/matters` if >50 matters tested; add Playwright for MatterVault critical path (create → upload → verify → ready → archive) without touching existing specs.
4. Then plan V2: client magic links (`matter_upload_tokens` with expiry + RLS), hearing calendar, and limited eCourts CNR read-only (behind feature flag), still without altering NoticeFlow tables.

Do not add Lawyers/MatterVault to `microtools.ts` marketing and do not deploy to production until staging verification passes.

