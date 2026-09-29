# LAWYER MICROTOOL — MATTERVAULT RLS HARDENING REPORT (03A)

**Date:** 2026-09-29
**Baseline:** MatterVault V1 Phase 1 implemented (migrations 001-008, 53 matter files, dashboard + nav extensions)
**Hardening migration:** `supabase/migrations/009_harden_matter_mutation_rls.sql`
**Production commit protected:** 2224394

---

## 1. Finding

MatterVault V1 correctly used service-role / RPC mutation paths (`createMatterForCurrentFirm`, `uploadMatterDocumentForCurrentFirm`, `verify_checklist_item_and_maybe_ready`, `reject_checklist_item`, `archive_matter`) with server-derived `auth.uid()` + `current firm` + `firm_role()` + `is_firm_member()` + tenant-scoped lookups (`id + firm_id`). However RLS on two core tables still exposed an alternate authenticated mutation surface:

- `matters`: `SELECT` (member), `INSERT` (is_firm_member), `UPDATE` (is_firm_member), `DELETE` (owner/admin)
- `checklist_items`: `SELECT` / `INSERT` / `UPDATE` / `DELETE` (all `is_firm_member`)

This allowed an authenticated client with a stolen/valid JWT to attempt direct `supabase.from('matters').insert/update/delete` or `supabase.from('checklist_items').update({status:'verified', document_id:...})` and bypass application authorization:

- MEMBER could direct `INSERT` a matter (app forbids)
- MEMBER could direct `UPDATE` any firm matter (app forbids edit)
- MEMBER could direct `UPDATE checklist_items` to `verified` / `rejected` / `document_id` without RPC role + status-machine checks
- OWNER/ADMIN could also bypass business rules (e.g., setting `ready` without all required verified)

Other tables were already hardened: `matter_documents`, `matter_notes`, `matter_activity` had only `SELECT` for authenticated (no INSERT/UPDATE/DELETE), correctly forcing service-role paths. The hardening objective: remove the alternate RLS write path for `matters` and `checklist_items` while keeping tenant `SELECT`.

---

## 2. Root Cause

Migration `008_matters.sql` was modeled on early NoticeFlow pattern (`notices` allowed `INSERT/UPDATE` for `is_firm_member` with service-layer checks). For MatterVault the authorization matrix is stricter (member cannot create/edit/verify/archive) and the design explicitly chose **service-role / RPC as the single authoritative write path**. Retaining authenticated `INSERT/UPDATE/DELETE` RLS policies created a second, weaker authorization path that database alone could not constrain to the per-role / per-status rules — violating defense-in-depth requirement §1-2 of 03A.

---

## 3. RLS Before (008)

```
-- matters (008)
CREATE POLICY "matters_member_select" FOR SELECT USING (is_firm_member(firm_id));
CREATE POLICY "matters_member_insert" FOR INSERT WITH CHECK (is_firm_member(firm_id));
CREATE POLICY "matters_member_update" FOR UPDATE USING (is_firm_member) WITH CHECK (is_firm_member);
CREATE POLICY "matters_owner_admin_delete" FOR DELETE USING (firm_role IN ('owner','admin'));

-- checklist_items (008)
CREATE POLICY "checklist_member_select" FOR SELECT USING (is_firm_member);
CREATE POLICY "checklist_member_insert" FOR INSERT WITH CHECK (is_firm_member);
CREATE POLICY "checklist_member_update" FOR UPDATE USING (is_firm_member) WITH CHECK (is_firm_member);
CREATE POLICY "checklist_member_delete" FOR DELETE USING (is_firm_member);

-- matter_documents (008) — correct
CREATE POLICY "matter_documents_member_select" FOR SELECT USING (is_firm_member);
-- (no INSERT/UPDATE/DELETE)

-- matter_notes (008) — correct
CREATE POLICY "matter_notes_member_select" FOR SELECT USING (is_firm_member);
-- (no INSERT/UPDATE/DELETE)

-- matter_activity (008) — correct
CREATE POLICY "matter_activity_member_select" FOR SELECT USING (is_firm_member);
-- (no INSERT/UPDATE/DELETE) — append-only service-role
```

Result: `matters` and `checklist_items` had direct authenticated write capability that could bypass `canCreateMatter` / `canEditMatter` / `canVerifyChecklist` / RPC status-machine (`uploaded→verified`).

---

## 4. RLS After (009)

New corrective migration `009_harden_matter_mutation_rls.sql` — additive, does not alter 001-008, idempotent `DROP POLICY IF EXISTS`:

**matters:**
- `SELECT` — retained `matters_member_select USING is_firm_member(firm_id)` (re-created if missing)
- `INSERT` — **DENY** (policy `matters_member_insert` dropped)
- `UPDATE` — **DENY** (policy `matters_member_update` dropped)
- `DELETE` — **DENY** (policy `matters_owner_admin_delete` dropped)

**checklist_items:**
- `SELECT` — retained `checklist_member_select`
- `INSERT` — **DENY** (dropped)
- `UPDATE` — **DENY** (dropped)
- `DELETE` — **DENY** (dropped)

**matter_documents / matter_notes / matter_activity:**
- `SELECT` — retained
- `INSERT/UPDATE/DELETE` — defensively `DROP POLICY IF EXISTS` for any accidental mutation policies (`matter_documents_member_insert`, `matter_notes_owner_admin_insert`, `matter_activity_member_insert`, etc.), ensuring no authenticated write path exists. `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` re-asserted for all five tables.

Effect: authenticated clients keep tenant-scoped reads; all writes now must go through existing service-role / RPC paths that enforce role + assignment + status + firm-ownership.

---

## 5. Mutation-Path Matrix

| Table | SELECT (authenticated) | INSERT (authenticated) | UPDATE (authenticated) | DELETE (authenticated) | Intended Mutation Path (service-role / RPC) |
|---|---|---|---|---|---|
| `matters` | ✓ `is_firm_member` | ✗ denied (009) | ✗ denied (009) | ✗ denied (009) | `createMatterForCurrentFirm` (service-role insert + checklist gen + `matter_created`/`checklist_issued` activities), `updateMatterForCurrentFirm` (service-role update with `firm_id` scoped `eq`), `archive_matter(p_matter_id)` RPC (security definer, `FOR UPDATE`, role owner/admin, status `open/ready→archived`) |
| `checklist_items` | ✓ `is_firm_member` | ✗ denied (009) | ✗ denied (009) | ✗ denied (009) | `verify_checklist_item_and_maybe_ready(p_checklist_item_id)` RPC (locks item+matter, owner/admin, `uploaded→verified`, auto `open→ready` when all required verified, activity `document_verified`/`matter_ready`), `reject_checklist_item` RPC (`uploaded→rejected`), checklist generation in matter creation (service-role bulk insert) |
| `matter_documents` | ✓ `is_firm_member` | ✗ no policy (008, re-asserted 009) | ✗ no policy | ✗ no policy | `uploadMatterDocumentForCurrentFirm` (auth + firm + `canUploadToMatter` + MIME/10MB + checklist linkage `firm_id+matter_id` check + service-role storage upload `matter-documents` path `firm/{firmId}/matters/{matterId}/{docId}/{safe}` + metadata insert + cleanup on failure), `deleteMatterDocumentForCurrentFirm` (service-role delete + storage remove + checklist unlink) |
| `matter_notes` | ✓ `is_firm_member` | ✗ no policy | ✗ no policy | ✗ no policy | `createMatterNoteForCurrentFirm` / `updateMatterNoteForCurrentFirm` / `deleteMatterNoteForCurrentFirm` (service-role with `canCreateMatterNote` etc., server-derived `author_id`) |
| `matter_activity` | ✓ `is_firm_member` | ✗ no policy | ✗ no policy | ✗ no policy | Append-only service-role inserts (`matter_created`, `checklist_issued`, `document_uploaded`, `document_verified`, `note_added`, `matter_ready`, `matter_archived`) and RPC inserts; no UPDATE/DELETE |

All `is_firm_member(firm_id)` / `firm_role(firm_id)` remain `SECURITY DEFINER, search_path=''` helpers. No `user_metadata.role`, no URL/hidden `firm_id` trust.

---

## 6. Direct Bypass Tests

Added `src/modules/matter/__tests__/matter-rls-hardening.test.ts` (9 tests) — pure migration + source inspection (no live DB required, works offline):

- Proves 008 originally created the permissive policies (`matters_member_insert`, `matters_member_update`, `matters_owner_admin_delete`, `checklist_member_insert/update/delete`).
- Proves 009 drops each of those policies (`DROP POLICY IF EXISTS`).
- Proves SELECT retained and RLS re-enabled.
- Proves `matter_documents / matter_notes / matter_activity` remain SELECT-only before and after (and 009 defensively drops any mutation variants).
- **Member bypass denied:** asserts 009 contains no `CREATE POLICY ... FOR INSERT/UPDATE/DELETE` for matters/checklist, so `supabase.from('matters').insert` or `supabase.from('checklist_items').update({status:'verified'})` with anon key will hit RLS deny — covering MEMBER cannot `INSERT matters`, `UPDATE matters`, `DELETE matters`, `INSERT checklist_items`, `UPDATE checklist_items`, `DELETE checklist_items`, `status=verified`/`rejected`, `document_id`.
- **OWNER/ADMIN:** asserts no authenticated direct mutation path even for privileged roles; writes must use service-role/RPC (intentionally stricter than DB role).
- **Service/RPC regression:** reads `src/modules/matter/services/create-matter.ts`, `verify-checklist-item.ts`, `upload-matter-document.ts` and asserts they still use `createServiceSupabaseClient` or `rpc("verify_checklist_item_and_maybe_ready")` and firm-scoped storage path.

Existing bypass coverage remains:
- `matter-permissions.test.ts` (member create/edit/upload/verify blocked)
- `checklist-transitions.test.ts` (verified has no direct reversal)
- `matter-idor.test.ts` (forged client/matter/assigned/checklist/document + `id + firm_id` scoped lookup)

---

## 7. Service/RPC Regression

Services unchanged (except RLS surface). Verified still authoritative:

- `createMatterForCurrentFirm` (`src/modules/matter/services/create-matter.ts:1`) — `createMatterSchema` → `getCurrentFirmForSession` → `canCreateMatter` → `getClientById` firm check → `assigned_to` membership → service-role `matters` insert → service-role `checklist_items` bulk insert from `CHECKLIST_TEMPLATES` → service-role `matter_activity` (`matter_created`, `checklist_issued`); on checklist error deletes matter (no partial state).
- `verifyChecklistItemForCurrentFirm` / `rejectChecklistItemForCurrentFirm` (`src/modules/matter/services/verify-checklist-item.ts:1`) — `supabase.rpc("verify_checklist_item_and_maybe_ready")` / `reject_checklist_item` (security definer, `FOR UPDATE`, owner/admin only, `uploaded→verified/rejected`, ready guarded).
- `archiveMatterForCurrentFirm` (`src/modules/matter/services/archive-matter.ts:1`) — `rpc("archive_matter")`.
- `uploadMatterDocumentForCurrentFirm` — tenant matter lookup `eq firm_id`, `canUploadToMatter` (member only assigned), MIME `MATTER_ALLOWED_MIME_TYPES`, `MATTER_MAX_FILE_SIZE`, `sanitizeFilename`, `buildMatterStoragePath`, service-role storage upload with `upsert:false`, cleanup on metadata failure, checklist `document_id` + `uploaded`, activity `document_uploaded`.
- Notes / dashboard / list / get — unchanged, all tenant-scoped.

Build still generates `/api/matter-documents/[id]` (signed URL 60s) and `/app/matters` routes.

---

## 8. NoticeFlow Regression

| Area | Result |
|---|---|
| Existing vitest | 228 passed \| 1 skipped (was 219, +9 hardening tests) |
| Existing 35 suites + new hardening suite | 36 passed \| 1 skipped |
| Playwright e2e (12 tests) | 12 passed — auth, notices-pagination (filters/page/export/no firm_id in URL), smoke (root, NoticeFlow tool, CA profession) |
| `/app` NoticeFlow dashboard | unchanged (MatterVault section still shows open/awaiting/ready/overdue but does not replace NoticeFlow cards) |
| `/app/notices` + `[noticeId]` + workflow + activity + documents + notes + pagination + CSV | unchanged |
| Migrations 001-007 | untouched (`git diff --name-only HEAD -- supabase/migrations/001* ... 007*` → no output) |
| `src/modules/notice|document|note|activity` | no diff |

---

## 9. Automated Validation

```
pnpm typecheck  → tsc --noEmit → PASS
pnpm lint       → eslint → PASS (0 errors, 0 warnings after fixing _actorUserId shadowing in hardening test)
pnpm test       → vitest run → 36 passed | 1 skipped, 228 tests (9 new hardening tests)
pnpm build      → next build (Turbopack) → ✓ Compiled 33.2s, TypeScript 14.6s, 10/10 static pages (includes /app/matters, /api/matter-documents/[id])
pnpm audit      → No known vulnerabilities
pnpm test:e2e   → playwright → 12 passed (34.9s)
```

---

## 10. Git/Scope Verification

```
git diff --name-only:
 src/app/app/page.tsx
 src/components/layout/app-nav.tsx   (both from prior V1, not modified in hardening)

git status --short:
 M src/app/app/page.tsx
 M src/components/layout/app-nav.tsx
 ?? LAWYER_MICROTOOL_MATTERVAULT_V1_REPORT.md   (prior report)
 ?? src/app/api/matter-documents/             (prior V1)
 ?? src/app/app/matters/                      (prior V1)
 ?? src/modules/matter/                       (prior V1, now +1 test)
 ?? supabase/migrations/008_matters.sql       (prior V1)
 ?? supabase/migrations/009_harden_matter_mutation_rls.sql  (NEW — this hardening)

git diff --name-only HEAD -- src/modules/notice src/modules/document src/modules/note src/modules/activity
  src/app/login src/app/signup src/app/onboarding src/proxy.ts src/content → (no output)
```

Expected changes limited to:
- `009_harden_matter_mutation_rls.sql` (RLS hardening)
- `src/modules/matter/__tests__/matter-rls-hardening.test.ts` (bypass tests)
- Prior V1 MatterVault files remain untracked but not re-modified; no NoticeFlow domain files, no 001-007 migrations, no marketing (`src/content/microtools.ts` untouched, no `/profession/lawyers`), no unrelated refactor.

---

## 11. Remaining Limitations

- Hardening is RLS-only; **migration 009 must be applied** (`supabase db push` or pending migrations review) on staging/production to take effect — the codebase already assumes it (services use service-role, but until 009 is applied, direct authenticated writes would still be allowed at DB level on an 008-only instance).
- `matter_notes` still has only SELECT for authenticated; all mutations via service-role — correct per §4/5, but if future offline-first or optimistic UI needed, a restrictive `INSERT` policy with `author_id = auth.uid()` could be considered — intentionally not added now to keep attack surface minimal.
- No row-level assignment check in RLS (member upload to unassigned matters is enforced in service layer, not DB) — by design, as RLS is tenant boundary, not per-row assignment engine; service/RPC remains authoritative.
- Checklist `status` transitions are enforced only in RPCs (`uploaded→verified/rejected`); no DB `CHECK` constraint for `verified` no-reversal — concurrent safety relies on `FOR UPDATE` in RPC, which is sufficient but DB constraint would be defense-in-depth for non-RPC paths (now moot because no direct UPDATE path exists).

---

**FINAL RULE:** Do NOT deploy. Do NOT apply migration to production. Do NOT add Lawyers/MatterVault to marketing. Do NOT start Phase 2. Stop after this hardening report.
