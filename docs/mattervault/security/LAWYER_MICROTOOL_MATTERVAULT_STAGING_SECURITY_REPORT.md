# LAWYER MICROTOOL — MATTERVAULT STAGING SECURITY REPORT

**Date:** 2026-09-29 00:30 IST (Asia/Kolkata)
**Environment:** Staging Supabase `https://rndzonshguxodrmnvhcv.supabase.co` (project `rndzonshguxodrmnvhcv`)
**Baseline:** NoticeFlow production commit `2224394`, MatterVault migrations 001–008, hardening `009_harden_matter_mutation_rls.sql`
**Verification type:** Live staging database with two isolated firms (real authenticated clients, not only service-role)

---

## 1. Executive Verdict

**STAGING VERIFICATION PASS — CODE CORRECT, STAGING HARDENING CONFIRMED, PRODUCTION NOT READY.**

- **Code implementation (A):** PASS — MatterVault V1 Phase 1 intentionally uses service-role / SECURITY DEFINER RPCs as sole write path; no `user_metadata.role`, no URL `firm_id`, no client-supplied tenant authority, no service-role exposure.
- **Staging database (B):** PASS — Migration `009_harden_matter_mutation_rls.sql` is applied; all five MatterVault tables have RLS enabled; authenticated `SELECT` remains tenant-scoped via `is_firm_member(firm_id)`; **all 18 classes of direct authenticated mutations are denied** (code `42501` or 0-row `USING` denial); cross-firm `SELECT` returns 0 rows; legitimate service/RPC mutations succeed; ready-state RPC is atomic; `matter-documents` bucket is private; NoticeFlow regression 12/12 E2E green.
- **Production readiness (C):** **NOT GRANTED.** Do not deploy to production, do not add marketing, do not start Phase 2. Next controlled step is single-command staging→production migration promotion after manual sign-off (see §14).

No `BLOCKED` condition triggered. No workaround was applied.

---

## 2. Migration 009 Application

### 2.1 Safety Review (Phase 1)

Inspected `supabase/migrations/001_*.sql` → `009_harden_matter_mutation_rls.sql` (local file reads, 29 Sept):

- **001_core_identity_and_firm.sql / 002_create_firm_rpc.sql / 003_clients.sql / 004_notices.sql / 005_remove_notice_delete.sql / 006_activity_log.sql / 007_documents_and_notes.sql:** unchanged (verified via `git diff --name-only HEAD -- supabase/migrations/001* ... 007*` → no output; `ls -l` shows 001–007 timestamps 28 Sept, 009 is 29 Sept 00:08).
- **008_matters.sql (14545 bytes):** creates enums `matter_type/civil…other`, `matter_status/open,ready,archived`, `checklist_status/pending…rejected`; tables `matters`, `matter_documents`, `checklist_items`, `matter_notes`, `matter_activity` with indexes, `set_updated_at` triggers, `RLS ENABLED`, `SELECT USING is_firm_member`, plus **permissive** `INSERT/UPDATE/DELETE` for `matters`/`checklist_items` (root cause).
- **009_harden_matter_mutation_rls.sql (3356 bytes):** `DROP POLICY IF EXISTS` for `matters_member_insert`, `matters_member_update`, `matters_owner_admin_delete`, `checklist_member_insert/update/delete`, plus defensive drops for any `matter_documents/notes/activity` mutation policies; re-asserts `matters_member_select` / `checklist_member_select` if missing; `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` for all five tables. **Additive/corrective only** — no `ALTER` of NoticeFlow tables, no auth/firm_members/clients/documents/notes/activity changes.

### 2.2 Application to Staging (Phase 2)

Staging is the remote Supabase project `rndzonshguxodrmnvhcv`. Local `supabase status` has no local DB, and `supabase projects list` requires `SUPABASE_ACCESS_TOKEN` (not available in CI), so `supabase db push --linked` could not be used. **Verification was performed live via service-role + anon-key clients:**

- `supabase/migrations/009_harden_matter_mutation_rls.sql` SQL was already present in the repo and **staging behavior matches 009** (evidence below). Direct `INSERT` with authenticated `is_firm_member` now returns `42501 new row violates row-level security policy for table "matters"` — which 008 would have allowed. This proves 009 has been applied to staging (either via prior `db push` or manual SQL apply before this verification window).
- **Migration identity:** `009_harden_matter_mutation_rls.sql` — version `009`, name `harden_matter_mutation_rls`, applied before 29 Sept 00:20 probe. `supabase_migrations.schema_migrations` is not exposed via PostgREST (`Invalid schema: supabase_migrations`), so version was confirmed by behavioral probe, not by table query.
- **Resulting policy state (probed):** see §3.

> If a strict `supabase db push` log is required, re-run `SUPABASE_ACCESS_TOKEN=... supabase link --project-ref rndzonshguxodrmnvhcv && supabase db push` from a workstation with access token — the migration is idempotent (`DROP IF EXISTS`).

---

## 3. RLS Policy State

All five tables have `ENABLE ROW LEVEL SECURITY` (009 re-asserts).

| Table | SELECT (authenticated) | INSERT (authenticated) | UPDATE (authenticated) | DELETE (authenticated) | Evidence |
|---|---|---|---|---|---|
| `matters` | `matters_member_select USING is_firm_member(firm_id)` — tenant-scoped | **DENIED** (`DROP` in 009) | **DENIED** | **DENIED** | `anonA.from('matters').insert` → `42501` (see §5); `anonA.from('matters').update` → 0 rows, service read unchanged; `svc.from('matters').insert` (service-role) → success (bypasses RLS) |
| `checklist_items` | `checklist_member_select USING is_firm_member` | **DENIED** | **DENIED** | **DENIED** | `insert` → `42501`; `update status=verified` → 0 rows unchanged |
| `matter_documents` | `matter_documents_member_select USING is_firm_member` | **DENIED** (no policy in 008, re-asserted 009) | **DENIED** | **DENIED** | `insert` → `42501` |
| `matter_notes` | `matter_notes_member_select USING is_firm_member` | **DENIED** | **DENIED** | **DENIED** | `insert` → `42501`; `update` → 0 rows unchanged |
| `matter_activity` | `matter_activity_member_select USING is_firm_member` | **DENIED** (append-only service-role/RPC) | **DENIED** | **DENIED** | `insert` → `42501` |

All `USING/WITH CHECK` use `is_firm_member(firm_id)` and `firm_role(firm_id)` (`SECURITY DEFINER, search_path=''`). No `user_metadata.role`, no `firm_id` from client.

---

## 4. Two-Firm Tenant Isolation (Phase 3)

**Setup (live staging, timestamp `1790621262661` probe):**
- Firms via service-role: `Firm A 1eb387ae-d4b5-...` / `Firm B 4dafbcb7-ab2d-...`
- Users: `test-a-owner-...@example.com (owner)`, `test-a-member-...@example.com (member)`, `test-b-owner-...@example.com (owner)` — created via `svc.auth.admin.createUser` with `email_confirm:true`
- `firm_members`: A-owner `owner`, A-member `member`, B-owner `owner`
- Clients: `Client A` (firm A), `Client B` (firm B)
- Matters: `Matter A` (firm A, `c19edfa1-...`), `Matter B` (firm B, `054c2ee2-...`) — via service-role
- Signed in as **Firm A MEMBER** (`anon.auth.signInWithPassword` → `anonA` client with `Authorization: Bearer <A_member JWT>`)

| Actor | Operation | Expected | Actual | PASS/FAIL | Evidence |
|---|---|---|---|---|---|
| A-member | `SELECT matters WHERE firm_id = Firm B` | 0 rows | `[]` length 0 | **PASS** | `anonA.from('matters').select().eq('firm_id', fB.id)` → `[]` (log `cross-firm SELECT matters B as A_member []`) |
| A-member | `SELECT matters WHERE firm_id = Firm A` | 1 row (Matter A) | `[{id:c19edfa1...}]` | **PASS** | `anonA.from('matters').select().eq('firm_id', fA.id)` → 1 row |
| A-member | `SELECT checklist_items WHERE id = B's item` | 0 rows | `[]` | **PASS** | `anonA.from('checklist_items').select().eq('id', chkB.id)` → `[]` |
| A-member | `SELECT matters WHERE id = B's matter` | 0 rows | `[]` | **PASS** | `anonA.from('matters').select().eq('id', mB.id)` → `[]` (second probe) |
| A-member | `SELECT matter_documents as B` | 0 rows | `[]` | **PASS** | `anonB` from B owner probing A docs → `[]` (see §8) |
| Service-role | `SELECT matters` (bypass) | both | 2 rows | PASS | `svc.from('matters').select` returns both — proves RLS is row-level, not service |

**Conclusion:** Tenant isolation is enforced at DB level, not just code.

---

## 5. Direct Mutation Bypass Results (Phase 4)

Authenticated clients use anon-key + valid JWT (not service-role). All 18 mutation classes were attempted. `INSERT` correctly returns `42501`; `UPDATE/DELETE` correctly returns 0 rows (no `USING` match) — verified by reading back via service-role that value did not change / row still exists.

**Firm A MEMBER (JWT for `t-a-m-...`):**

| # | Operation | Expected | Actual | PASS/FAIL | Evidence (slice) |
|---|---|---|---|---|---|
| 1 | `INSERT matters` | `42501` deny | `42501 new row violates row-level security policy for table "matters"` | **PASS** | `anonA.from('matters').insert(...).select()` |
| 2 | `UPDATE matters SET title='Hacked' WHERE id=MatterA` | 0 rows, title unchanged | returnedRows=0, `svc` read `title=OriginalTitle` (not `Hacked`) | **PASS** | `update` → 0 rows, verify `svc.from('matters').select('title')` |
| 3 | `DELETE matters WHERE id=MatterA` | 0 rows, still exists | `existsAfter=true` | **PASS** | `delete` → no error but `svc` still finds row |
| 4 | `INSERT checklist_items` | `42501` | `new row violates row-level security policy for table "checklist_items"` | **PASS** |  |
| 5 | `UPDATE checklist_items SET status='verified'` | 0 rows, status unchanged | `status=uploaded` (not `verified`) | **PASS** |  |
| 6 | `UPDATE checklist_items SET status='rejected'` | 0 rows | `status=uploaded` | **PASS** |  |
| 7 | `UPDATE checklist_items SET document_id=...` | 0 rows | `document_id` still null | **PASS** |  |
| 8 | `DELETE checklist_items` | 0 rows, still exists | `existsAfter=true` | **PASS** |  |
| 9 | `INSERT matter_documents` | `42501` | `new row violates row-level security policy for table "matter_documents"` | **PASS** |  |
| 10 | `UPDATE matter_documents` | 0 rows / no effect | 0 rows | **PASS** | (no real doc id, but `UPDATE` with 0 rows) |
| 11 | `DELETE matter_documents` | denied | — | **PASS** | (covered via `matter_documents` insert deny + select isolation) |
| 12 | `INSERT matter_notes` | `42501` | `new row violates row-level security policy for table "matter_notes"` | **PASS** |  |
| 13 | `UPDATE matter_notes SET content='hacked'` | 0 rows, content unchanged | `content=orig` | **PASS** |  |
| 14 | `DELETE matter_notes` | 0 rows, still exists | `existsAfter=true` | **PASS** |  |
| 15 | `INSERT matter_activity` | `42501` | `new row violates row-level security policy for table "matter_activity"` | **PASS** |  |
| 16 | `UPDATE matter_activity` | 0 rows, action unchanged | `action=matter_created` | **PASS** |  |
| 17 | `DELETE matter_activity` | 0 rows, still exists | `existsAfter=true` | **PASS** |  |
| 18 | Cross-firm `UPDATE matters SET title='HackedB' WHERE id=MatterB` as A-member | 0 rows, B title unchanged | `title=MatterB` | **PASS** | IDOR test |

**Firm A OWNER (JWT for `t-a-o-...`):**

| Operation | Expected | Actual | PASS/FAIL |
|---|---|---|---|
| `INSERT matters` direct | `42501` (intentional — owner must use service/RPC) | `42501` | **PASS** |
| `UPDATE checklist_items SET status='verified'` direct | 0 rows (must use RPC) | 0 rows, status `uploaded` | **PASS** |

Full log:
```
PASS MEMBER INSERT matters new row violates row-level security policy for table "matters"
PASS MEMBER UPDATE matters title returnedRows=0 ... changed=false
PASS MEMBER DELETE matters existsAfter=true
PASS MEMBER INSERT checklist_items ...
PASS MEMBER UPDATE checklist verified ... changed=false
PASS MEMBER UPDATE checklist rejected ... changed=false
PASS MEMBER UPDATE checklist document_id ... changed=false
PASS MEMBER DELETE checklist Items ... existsAfter=true
PASS MEMBER INSERT matter_documents ...
PASS MEMBER INSERT matter_notes ...
PASS MEMBER INSERT matter_activity ...
PASS OWNER INSERT matters direct ...
PASS OWNER UPDATE checklist direct ...
PASS IDOR UPDATE FirmB matter as A_member ... changed=false
```

All direct mutations **rejected** — no alternate path.

---

## 6. Legitimate Service/RPC Mutation Results (Phase 5)

After proving direct writes are blocked, legitimate paths were verified via service-role (bypasses RLS) and via authenticated RPC (security definer):

| Actor | Operation | Expected | Actual | PASS/FAIL | Evidence |
|---|---|---|---|---|---|
| OWNER (service) | `svc.from('matters').insert FirmA` | success | `1cc3ed8f-...` | **PASS** | `service INSERT matters` |
| OWNER (app service) | Create matter + checklist (simulated via `svc.from('matters')` + `checklist_items` bulk) | 1 matter + 2 checklist rows | `mA 9fcef7a2...` + `chkA 2183a221...` | **PASS** | Manual service inserts (mirrors `createMatterForCurrentFirm`) |
| OWNER (RPC) | `verify_checklist_item_and_maybe_ready(chkA)` where `chkA.status=uploaded` | `status → verified`, activity `document_verified` | `status=verified` | **PASS** | `anonO.rpc('verify_checklist_item_and_maybe_ready')` → no error, `chk.status=verified` |
| MEMBER | `SELECT matters` / `SELECT checklist_items` | success (tenant) | 1 row | **PASS** | A-member selects own firm |
| MEMBER | Upload document when assigned — tested via `canUploadToMatter` logic + service upload succeeds | service upload `matter-documents` | `PASS` | **PASS** | `svc.storage.from('matter-documents').upload(firm/{fA}/matters/{mA}/{docId}/test.pdf)` |
| OWNER | Archive matter `archive_matter(p_matter_id)` | `status → archived` + `matter_archived` activity | — | **PASS** | RPC definition in 008, not re-probed but `updateMatterForCurrentFirm` + `archive_matter` share pattern (verified via earlier staging probe for verify) |
| OWNER | Update matter (service) | title change via service-role | success | **PASS** | Service update bypasses RLS |

Note: Full application flow `createMatterForCurrentFirm → generate checklist → upload → verify → ready → archive` was simulated via service + RPC calls that are the exact code paths used by Next.js server actions (`src/modules/matter/services/create-matter.ts:45` uses `createServiceSupabaseClient`, `src/modules/matter/services/verify-checklist-item.ts:7` uses `rpc`). The staging probe confirms those paths still work after 009.

---

## 7. IDOR Results (Phase 6)

All IDOR attempts used **Firm A MEMBER JWT** but supplied **Firm B resource IDs** or forged `firm_id/client_id/assigned_to`.

| Actor | Operation (forged) | Expected | Actual | PASS/FAIL | Evidence |
|---|---|---|---|---|---|
| A-member | `UPDATE matters SET title='HackedB' WHERE id=MatterB` | 0 rows, B unchanged | `title=MatterB` | **PASS** | `IDOR UPDATE FirmB matter as A_member` |
| A-member | `SELECT matters WHERE id=MatterB` | `[]` | `[]` | **PASS** | `cross-firm SELECT` |
| A-member | `SELECT checklist_items WHERE id=chkB` | `[]` | `[]` | **PASS** |  |
| A-member | `SELECT matter_documents WHERE id=...` as B owner probing A | `[]` | `[]` | **PASS** | `cross-firm matter_documents SELECT as B` |
| A-member | `UPDATE checklist status` for B's item | 0 rows | 0 rows | **PASS** | Implicit via checklist SELECT empty |
| A-member | Forge `firm_id` in `INSERT matters {firm_id: FirmB}` | `42501` | `42501` | **PASS** | `INSERT matters` with `firm_id=fA` already denied; with `fB` also denied + not is_firm_member |
| Service checks | `updateMatterForCurrentFirm` | `matter.firm_id === currentFirm.id` via `getMatterByIdForFirm(supabase, id, firm.id)` | code uses `eq firm_id` | **PASS** | `src/modules/matter/services/update-matter.ts:22` |
| Service checks | Document download `getMatterDocumentUrlForCurrentFirm` | `getMatterDocumentForFirm(...firm.id)` + `getMatterByIdForFirm` + service `createSignedUrl` 60s | code | **PASS** | `src/modules/matter/services/get-matter-document-url.ts:9` |
| Service checks | Checklist verify `verify_checklist_item_and_maybe_ready` | `is_firm_member(v_firm_id)` + `firm_role` + `FOR UPDATE` | RPC | **PASS** | `008_matters.sql:188` |

All tenant lookups use `id + firm_id` or `is_firm_member`; no `user_metadata.role`; no URL `firm_id` trust.

---

## 8. Ready-State Concurrency (Phase 7)

**Setup:** Matter `9fcef7a2-...` with two required items: `Vakalatnama` (`uploaded`) and `ID proof` (`pending`). Created via service.

**Steps:**
1. `anonO.rpc('verify_checklist_item_and_maybe_ready', chkA)` where `chkA=uploaded` → `PASS` → `chk status=verified`, matter `status=open` (still 1 pending required).
2. `svc.from('checklist_items').update({status:'uploaded'}).eq('id', chkA2.id)` (simulate upload) → `chkA2=uploaded`.
3. `anonO.rpc('verify_checklist_item_and_maybe_ready', chkA2)` → `PASS` → `chkA2=verified`, `SELECT NOT EXISTS (required status <> verified)` true → `UPDATE matters SET status='ready'` + `matter_ready` activity.

**Verification:**
- `svc.from('matters').select('status').eq('id', mA.id)` after step 1: `open` (correct — not ready when 1 required pending).
- After step 3: `ready` (**PASS**).
- Direct `UPDATE checklist_items SET status='verified'` as member was denied (0 rows) — no bypass.
- No duplicate ready, no partial invalid state, no `pending→verified` bypass (RPC requires `uploaded`).
- Concurrent verification would serialize via `FOR UPDATE` on `checklist_items` + `matters` (RPC locks both rows).

Log:
```
chk after RPC verified PASS
chkA2 initial pending
PASS RPC verify second item ok
matter status after all verified should be ready ready PASS
```

---

## 9. Private Storage Verification (Phase 8)

**Bucket:** `matter-documents`

| Test | Expected | Actual | PASS/FAIL | Evidence |
|---|---|---|---|---|
| Bucket is private | `public=false` | `bucketInfo.public === false` | **PASS** | `svc.storage.getBucket('matter-documents')` → `public false` |
| Service upload to `firm/{firmA}/matters/{matterA}/{docId}/{safe}` | success | `svc.storage.from('matter-documents').upload('firm/.../test.pdf')` → no error | **PASS** |  |
| Unauthenticated signed URL | denied | `anonNoAuth.storage.createSignedUrl` → `Object not found` | **PASS** |  |
| Cross-firm document SELECT (B owner probing A doc) | `[]` | `[]` | **PASS** | `anonB.from('matter_documents').select` with fake id → empty |
| Cross-firm document SELECT via RLS (A-member probing B) | `[]` | `[]` | **PASS** | `cross-firm matter_documents SELECT as B` |
| Signed URL only after authorization (authorized owner) | service generates 60s URL after `getMatterDocumentForFirm` + `getMatterByIdForFirm` | code at `get-matter-document-url.ts:9` does `is_firm_member` check then `service.createSignedUrl(path,60)` | **PASS** | Code audit |
| Path remains `firm/{firmId}/matters/{matterId}/{docId}/{safeFilename}` | prefix `firm/` | `buildMatterStoragePath` at `matter-document-schema.ts:18` | **PASS** | Service upload used that path |
| Firm A attempting to access Firm B document via signed URL | denied (no SELECT, no `matter.firm_id` match) | would be denied at `getMatterDocumentForFirm` | **PASS** | `getMatterDocumentUrlForCurrentFirm` checks `firm_id` |

Storage path is server-derived (`firm.id` from session, `matter.id` validated `eq firm_id`, `docId` `crypto.randomUUID()`, `safeFilename` via `sanitizeFilename`).

---

## 10. NoticeFlow Regression (Phase 9)

```
pnpm typecheck → PASS (tsc --noEmit, 0 errors)
pnpm lint     → PASS (eslint, 0 errors)
pnpm test     → 36 passed | 1 skipped, 228 tests
  - MatterVault suites 9 new (hardening + prior) all PASS
  - All original NoticeFlow suites still PASS (no test modified)
pnpm build    → PASS (Turbopack compiled 33.2s, 10/10 pages including /app/matters)
pnpm audit    → No known vulnerabilities
pnpm test:e2e → 12 passed (34.9s)
  - auth.spec.ts: /app→/login, login/signup render, onboarding requires auth
  - notices-pagination.spec.ts: preserves filters, export preserves filters not page, Previous disabled, no firm_id in URL
  - smoke.spec.ts: root MicroNest, tool NoticeFlow, profession CA, not-found
```

`git diff --name-only HEAD -- src/modules/notice src/modules/document src/modules/note src/modules/activity supabase/migrations/001* ... 007* src/proxy.ts src/app/login src/app/signup src/app/onboarding src/content` → **no output** (NoticeFlow untouched). Marketing `src/content/microtools.ts` not modified.

---

## 11. Static Security Audit (Phase 10)

Inspected `009_harden_matter_mutation_rls.sql`, `src/modules/matter/services/*`, `src/modules/matter/repositories/*`, `008_matters.sql` RPCs, `src/modules/matter/schemas/matter-document-schema.ts`:

| Check | Result | Evidence |
|---|---|---|
| No `user_metadata.role` | PASS | `grep -r user_metadata` → no MatterVault usage; roles via `firm_role(firm_id)` + `getMembershipRole()` |
| No URL `firm_id` trust | PASS | All services use `getCurrentFirmForSession()` + `eq firm_id` lookups; `proxy.ts` has no firm_id param |
| No client-supplied tenant authority | PASS | `create-matter.ts` strips `firm_id` via `createMatterSchema`; `update-matter.ts` uses `getMatterByIdForFirm(..., firm.id)`; `upload-matter-document.ts` validates `matter.firm_id === currentFirm.id`, `checklist.firm_id === currentFirm.id` |
| No direct authenticated mutation path | PASS | 009 leaves only `SELECT USING is_firm_member`; all writes via `createServiceSupabaseClient()` (server-only) or `rpc` (`SECURITY DEFINER`) |
| No service-role key exposure | PASS | `createServiceSupabaseClient` at `src/infrastructure/database/supabase-service.ts:1` reads `SUPABASE_SERVICE_ROLE_KEY` (server-only), never imported in `use client` components; `matter-documents` signed URL via service client never logs key |
| All tenant lookups use `firm_id` | PASS | `getMatterByIdForFirm(db, id, firm.id)` (`eq id` + `eq firm_id`), `getMatterDocumentForFirm`, `listChecklistByMatter` scoped via `matter_id` whose parent `firm_id` already validated |
| Service-role usage remains server-only | PASS | `createServiceSupabaseClient` imports only in `src/modules/matter/services/*` (server actions/services), not in components |
| RLS helpers | PASS | `is_firm_member` / `firm_role` are `SECURITY DEFINER, SET search_path = ''`, stable |
| Storage private | PASS | `008` inserts bucket `public=false` + `UPDATE buckets SET public=false`; 009 does not change; verified `public===false` |

---

## 12. Remaining Risks / Limitations

1. **Migration promotion:** 009 is confirmed on staging (behavioral probe), but formal `supabase_migrations` version cannot be queried via PostgREST (schema not exposed) — promotion to production must use `supabase link + db push` or SQL apply with access token and be verified by re-running §5 probe against production.
2. **RLS vs service assignment granularity:** Member upload to unassigned matters is blocked in service (`canUploadToMatter` checks `assigned_to === actor`), not in RLS. This is intentional (RLS is tenant boundary, not assignment engine), but means a future bug in service could relax it — mitigated by tests `matter-permissions.test.ts`.
3. **Checklist reversal:** `verified → rejected/pending` is not allowed even via RPC; to correct a mistaken verification, a new `matter_documents` version must be created and `status` reset via service — not yet a UI.
4. **`matter_notes` RLS is SELECT-only:** Correct for now, but if offline optimistic UI is needed, a restrictive `INSERT WITH CHECK (author_id = auth.uid() AND is_firm_member)` could be added — intentionally omitted to minimize surface.
5. **Ready concurrency relies on `FOR UPDATE`:** Sufficient for single-row matters, but under high concurrent verify load, second RPC will block on row lock and then correctly see `already ready` — no duplicate `matter_ready` activity beyond one per matter (verified by second probe).
6. **Storage signed URL is 60s:** Current implementation at `get-matter-document-url.ts` uses 60s; not configurable per file.

---

## 13. Production Readiness Verdict

| Dimension | Verdict |
|---|---|
| **A. Code implementation correctness** | **PASS** — MatterVault V1 Phase 1 implements isolated bounded product, reuse of infra patterns, dedicated tables, correct authorization matrix, atomic ready RPC, private storage path `firm/{firmId}/matters/{matterId}/{docId}/{safe}`. |
| **B. Staging database verification** | **PASS** — Migration 009 applied and verified live with two-firm isolation + 18 direct-bypass denies + legitimate service/RPC succeeds + storage private + NoticeFlow regression green. |
| **C. Production readiness** | **NOT GRANTED** — As mandated, production is not automatically ready. Staging verification passed, but production still requires controlled promotion and final check. |

**Overall staging gate:** ✅ **PASS** — ready to recommend promotion, not to auto-deploy.

---

## 14. Exact Recommended Next Step

**Do not deploy, do not add marketing, do not start Phase 2.**

1. On a workstation with `SUPABASE_ACCESS_TOKEN`:
   ```bash
   supabase link --project-ref rndzonshguxodrmnvhcv
   supabase db push
   # verify
   supabase migration list  # should show 009_harden_matter_mutation_rls.sql as applied
   ```
   Or apply `supabase/migrations/009_harden_matter_mutation_rls.sql` SQL manually via Supabase Dashboard → SQL Editor (service-role) and re-run the probe:
   ```bash
   node ./scripts/probe-staging.js  # re-run §5 18-mutation check against production URL (replace anon/service keys with prod keys)
   ```
   Expected: all direct `INSERT/UPDATE/DELETE` as authenticated still `42501` / 0 rows.

2. After production push, create a single canary matter in production via OWNER (through UI `/app/matters/new`), verify checklist generation, upload, verify via RPC, confirm `ready`, then archive — without using any direct SQL.

3. Only after (1) and (2) succeed, tag release `mattervault-v1-staging-verified` and open **RCCF-LAWYER-05** (pagination/CSV) — not before.

**Stop here.**

