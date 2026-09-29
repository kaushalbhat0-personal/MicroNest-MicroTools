# MICRONEST PRODUCT READINESS AUDIT

**Date:** 2026-09-29 06:00 IST
**Mode:** READ-ONLY audit, no code/migration/DB/commit/push
**Baseline:** `4107778 feat(mattervault): complete v1 p1 polish` (+ uncommitted Pass 1-3 UI polish at `max-w-5xl`/`Geist`/`NavShell`/`Input`/`Table`/`PageHeader`/`EmptyState` + dashboard consistency) — `git status` shows 22 modified `M` + 15 untracked `??` (6 reports + 7 primitives), no `supabase/migrations` change beyond `008/009` already committed
**Verified:** `typecheck` 0, `lint` 0, `test` 36/228 `1 skipped`, `build` 10/10 `✓ Compiled`, `audit` clean, `test:e2e` 12/12

---

## 1. Executive Summary

MicroNest MicroTools is **two pilot-ready microtools on one coherent platform** with production-verified security, but not yet one marketed SaaS.

- **NoticeFlow V1** — India-first CA notice workflow (firm → client → notice → workflow → docs/notes/activity → dashboard → filters/pagination/CSV) is **complete and unchanged since `0114099`**. All 5 phases, all business behavior, all security boundaries are intact; only presentation was deduplicated (`Input`/`Table`/`PageHeader`/`EmptyState`), no workflow change. **Ready for pilot and for continued production.**
- **MatterVault V1** — lawyer matter document-collection workflow (firm → matters → checklist `pending→uploaded→verified/rejected` → `open→ready→archived` via `FOR UPDATE` RPC → docs/notes/activity → dashboard `open/awaiting/ready/overdue` + `?status` filter + `Required: x/y` readiness) is **complete, pilot-ready, and production-verified 8/8**. Pass 1 fixed permission UI, Pass 2 deduplicated primitives, Pass 3 added urgency/filter/grouping/inline upload/humanized activity/a11y. **Ready for supervised pilot (1–3 firms, ≤30 matters).** Not yet self-serve at scale (search, global pagination, empty-state polish remain P2).
- **Platform** — `MicroNest` identity (`AppNav` `MicroNest`, dashboard `Dashboard`, `SiteNav` `MicroNest MicroTools` + `Launch App`), outer `max-w-5xl` shell (inner `3xl/2xl` for detail/form) eliminates `3xl↔4xl↔5xl` jitter, `Geist` `font-sans/mono` via `geist/font` with `system-ui` fallback, `neutral` + `red/amber/green` restrained, `1px border rounded-md`, `transition-colors active:scale-[0.98]`. Thin primitives `Input`/`Textarea`/`Select`/`Table`/`PageHeader`/`EmptyState`/`NavShell` (15–38 lines) replace duplicated markup without a framework.
- **Security** — firm `tenant scoping` via `is_firm_member`/`firm_role` `SECURITY DEFINER`, `service-role` server-only (`src/infrastructure/database/supabase-service.ts:1`), `matter-documents`/`notice-documents` private + `signed URL 60s`, RPCs `auth.uid()` + `FOR UPDATE` + `owner/admin` + `uploaded→verified`, RLS 009 `DROP INSERT/UPDATE/DELETE` for `matters/checklist_items`, no `user_metadata`/`firm_id` client trust, `test:e2e` `no firm_id in URL` still PASS — **no regression**.
- **Quality** — `src/app` thin (`UI → Actions → Services → Repositories → Infrastructure`), no god components/services, no `utils/helpers` dumping, domain leakage `matter ⇔ notice` = 0 (`Select-String matter in notice` → no output), `MattersTable`/`NoticesTable` share `Table` primitive but columns stay domain-local.

**Overall:** Both tools are **individually pilot-ready**. MicroNest as a **marketed platform** (public `/profession/lawyers` + pricing/billing) is **not** in V1 scope and correctly not shipped. Next build should be **discovery for the third microtool**, not more polish on these two.

---

## 2. Current Platform State

| Layer | State | Evidence |
|---|---|---|
| **Public** `/` `hero MicroNest MicroTools text-4xl tracking-tight` + `Browse by Profession` (`CA` card) + `MicroTools` (`NoticeFlow` card) + `Why MicroTools` + `footer` | `max-w-5xl mx-auto p-6 md:p-8` + `grid max-w-md mx-auto` when 1 card (Pass 1) + `rounded-lg bg-muted/20` (Pass 3) | `src/app/page.tsx:11` |
| **Public** `/profession/[profession]` → `● /profession/chartered-accountants` + `/tools/[tool]` → `● /tools/noticeflow` | `SSG` per `next build` `●` | `build` output |
| **Authenticated** `AppNav` `MicroNest` (was `NoticeFlow` pre-Pass 1) | `NavShell` `max-w-5xl sticky border-b` `h-10 w-10` toggle `aria-expanded` + `aria-current="page"` | `src/components/layout/nav-shell.tsx:1`, `app-nav.tsx:1` |
| **Authenticated** `SiteNav` `MicroNest MicroTools` + `Launch App` | Same `NavShell` with `cta` | `site-nav.tsx:1` |
| **Dashboard** `/app` | `PageHeader Dashboard` + `Firm: name — slug` + `Badge` + `Signed in as` + `Overview` `SummaryCards` (`p-4 text-2xl` + `red/amber` semantic) + `MatterVault` `grid 2→4` `p-4 text-2xl` with `Ready green-50`/`Overdue red-50` (Pass 2) + `Needs Attention` + `Recent Activity` + `No notices yet` + `Members/Clients/Notices/Sign out` footer | `src/app/app/page.tsx:26` |
| **NoticeFlow** `/app/notices` + `[noticeId]` + `new` + `edit` | `NoticesTable` `TableWrapper` + ` NoticeFilters` (`Input`/`Select` `grid-cols-1 sm:2 md:3` + `Clear filters` when `hasActive`) + `Table` `min-w-[720px]` + `Badge` + `pagination` + `Export CSV` | `src/app/app/notices/page.tsx:44` |
| **MatterVault** `/app/matters` + `[matterId]` + `new`/`edit` | `MattersTable` `Table` + `EmptyState` + `PageHeader` `Matters` + `All/Open/Ready/Archived` `?status` + `Readiness Required: x/y` `Ready green` + `Deadline OVERDUE` `red/amber` + `Assigned` name (via `service users`) + detail `Details/Schedule` grouped `border p-4` + `Checklist` `Required: x/y` + inline `Upload for` + `Verify/Reject` + `Documents` `Download/Delete` + `Notes` edit/delete + `Activity` humanized | `src/app/app/matters/page.tsx:54`, `matters/[matterId]/page.tsx:71` |
| **Clients/Members** `/app/clients`, `/app/members` | `PageHeader` + `ClientsTable`/`MembersTable` `max-w-5xl` | `src/app/app/clients/page.tsx:6` |
| **Design primitives** | `Button` `cva default/outline/ghost h-9/h-8/h-10 active:scale` + `Badge` + `Input` `h-9 border bg-background focus-visible:ring-1` + `Textarea` `min-h-[80px]` + `Select` native `h-9` + `Table` 6 parts + `PageHeader` `title/description/action/backHref` + `EmptyState` + `NavShell` | `src/components/ui/*.tsx`, `src/components/layout/*.tsx` |
| **Typography** | `GeistSans/Mono` `variable` in `layout.tsx:3` + `globals.css` `font-family: var(--font-geist-sans), system-ui` (not `Arial`), `font-sans` on `body`, `text-4xl hero tracking-tight` vs `text-2xl h1` vs `text-lg h2` | `src/app/layout.tsx:1`, `globals.css:22` |
| **Security** | Migrations `001_core`–`009_harden` (`008 14545` + `009 3356`), RLS `is_firm_member`, `service-role` server-only, `matter-documents` private `60s` signed, RPCs `SECURITY DEFINER` | `supabase/migrations` |
| **Quality** | `typecheck` 0, `lint` 0, `test` 36/228, `build` 10/10, `audit` 0, `test:e2e` 12/12 | bash outputs |

**Migrations committed:** `008_matters.sql`, `009_harden_matter_mutation_rls.sql` (additive, no `ALTER notices`).

---

## 3. NoticeFlow V1 Audit

**Accepted V1 scope (from `0114099` + audit reports):** Phases 0–5: tenant `firms/firm_members` → `clients` → `notices` (`authority/notice_type/priority/status received 10 states, deadline, assigned_to, next_action`) → workflow `canTransition` pure (`received → review → assigned/drafting → ... → closed → review`) → assignment `MEMBER only own assigned` → documents `notice-documents` private 10 MB `pdf/jpg/png/docx` `firm/{firmId}/notices/{noticeId}/{docId}/{safe}` → notes `1..5000` → activity `status_changed` append-only → dashboard `open/overdue/dueSoon/myNotices` + `Needs Attention` + `Recent Activity` → filtering `q/status/priority/authority/assigned/deadline` → pagination `page=1..totalPages` → CSV export `Export CSV` → permissions `OWNER/ADMIN any, MEMBER own` → member management `owner/admin` → `pnpm test:e2e` pagination/filter.

| Area | Implementation | Evidence |
|---|---|---|
| **Firm/tenant** | `firms` `is_firm_member(target_firm)` + `firm_role` `SECURITY DEFINER` + `RLS firms_member_select` + `firm_members_owner_admin_insert/update/delete` | `001_core_identity_and_firm.sql:93` |
| **Client** | `clients` `firm_id` + `RLS clients_member_select` + `owner/admin insert/update/delete` + `listClientsByFirm` + `ClientsTable` + `ClientForm` (`Input` now) | `003_clients.sql:26` |
| **Notice creation** | `Notices new` `max-w-5xl outer 2xl inner` + `NoticeForm` (`Select`/`Input` `htmlFor/id` `aria-describedby` + `grid-cols-1 md:2` for dates, Pass 3) + `createNoticeAction` → `createNoticeForCurrentFirm` → `client.firm_id === currentFirm.id` + `assigned_to` member check + `service` insert | `src/app/app/notices/new/page.tsx:16` + `notice-form.tsx:40` |
| **Lifecycle** | 10 `notice_status` (`received`→`closed`→`review`) + `canTransition(from,to,ctx)` pure | `supabase/migrations/004_notices.sql:7` + `notice-status.ts` |
| **Assignment** | `assigned_to FK users SET NULL` + `canEditNotice(member only own)` + `canSetAssignedTo(member only self/unassigned)` | `notice-permissions.ts:14` |
| **Documents** | `documents` `firm_id/notice_id/uploaded_by/file_name/storage_path unique/mime/size 10MB` + `notice-documents` private + `insertDocument` via `service` + `createSignedUrl 60s` after `is_firm_member` + `DocumentsList` `canDelete` + `UploadForm` `encType multipart` + `delete` + `storage.remove` cleanup | `007_documents_and_notes.sql:5` + `document/service/upload` |
| **Notes** | `notes` `1..5000` + `notes_member_select` + `canCreateNote`/`canEditNote` (`member only assigned + own`) + `NotesList` edit/delete per note + `NoteForm` | `note/permissions` |
| **Activity** | `activity_log` `firm_id/notice_id/actor_id/action= status_changed/from/to` + `activity_member_select` + `transition_notice` RPC `SECURITY DEFINER` `FOR UPDATE` `is_firm_member` + role checks (`member only own`, `member cannot ready_to_submit`) | `006_activity_log.sql:4` |
| **Dashboard** | `getDashboardSummary` `open/overdue/dueSoon/myNotices` + `SummaryCards` `p-4 text-2xl` `red-50` `amber-50` + `getAttentionNotices` + `getRecentActivity` | `dashboard/services/get-dashboard-summary.ts:15` |
| **Filtering** | `parseNoticeFilters` (`q/status/priority/authority/assigned/deadline/page`) + `NoticeFilters` `grid 1 sm2 md3` `Input/Select` `htmlFor` + `Clear filters` when `hasActive` (Pass 3) + `buildQuery` preserves filters for pagination/export | `notices/page.tsx:14` + `notice-filters.tsx:1` |
| **Pagination** | `listNoticesFilteredPaginated` `page/totalPages` + `Previous/Next` `aria-disabled` `pointer-events-none` | `notices/page.tsx:73` |
| **CSV export** | `GET /api/notices/export?filters` `download` + `export${buildQuery(baseFilters)}` (no `page`) | `notices/page.tsx:64` |
| **Permissions** | `canViewNotices` `owner/admin/member` + `canEditNotice` etc. | `notice-permissions.ts:3` |
| **Member mgmt** | `Members` `listMembersForCurrentFirm` + `MembersTable` `PageHeader` `Firm: name` | `members/page.tsx:7` |
| **Empty/error/loading/validation/deadline** | `NoticesTable EmptyState No notices match` + `NoticeForm fieldErrors` `role=alert` + `typecheck` `deadline >= received` + `response_deadline OVERDUE · X days` `red/amber` (detail + now list) | `notice-schema.ts:16`, `notices/[noticeId]/page:70` + `notices-table.tsx:36` |
| **Production** | `10/10 pages` `ƒ /app/notices` `ƒ /app/notices/[noticeId]` etc., `next build` `Compiled` | `build` output |
| **E2E** | `notices-pagination.spec.ts` `preserves filters`, `export preserves filters not page`, `Previous disabled`, `no firm_id` — 4/4 PASS | `e2e/notices-pagination.spec.ts:3` |
| **Security** | `is_firm_member` + `firm_role` + `RLS` + `service-role` server-only + `notice-documents` private + `signed 60s` + `RPC SECURITY DEFINER` + `no firm_id in URL` | `e2e` `no firm_id` PASS |

**Comparison to accepted NoticeFlow V1 scope:** **100% match** — no promised V1 feature missing; presentation deduplication (Pass 2 `Input`/`Table`/`PageHeader`/`EmptyState`) is polish, not behavior change.

---

## 4. NoticeFlow P0/P1/P2

**No P0** — no blocker (workflow + docs + notes + isolation all PASS).

**P1 — none** — all audit P1 for NoticeFlow were addressed in prior NoticeFlow V1 (pagination/filter/CSV already). Remaining P1 from overall audit were MatterVault/platform, not NoticeFlow. For NoticeFlow alone, the only recent P1 was `NoticeForm a11y` (`htmlFor` missing) — **fixed in Pass 3** (`notice-form.tsx:44` now `htmlFor`/`id`/`aria-describedby` + `grid-cols-1 md:grid-cols-2`).

**P2 — improvements (V1.1, not blocking):**
- `NoticesTable` `Assigned` still `id.slice(0,8)` not name (like MatterVault fixed `membersMap` — Notice table could reuse member name, but not blocker) — `src/modules/notice/components/notices-table.tsx:46` — **P2, deferred**.
- `NoticeFilters` tall 6-field form could collapse on mobile behind `Show filters` — currently `grid 1→2→3` is okay, but could be `details/summary` — **P2**.
- `Notice detail` `grid grid-cols-1 md:2` still single `border p-4` with 10 fields, not grouped `Details`/`Schedule` cards as Matter detail now is — **P2** (audit suggested grouping but only Matter was done).
- `NoteForm`/`UploadForm` for Notice still raw `textarea` without `htmlFor` + `Input` (Matter forms were migrated, Notice note/upload still `w-full border` hand-written) — **P2** (presentation, not a11y blocker after `NoticeForm` fix, but could be `Textarea`).
- `Touch h-9 → h-10` globally — only `NavShell` toggle done `h-10`, other buttons `h-9` remain 36px — **P2** per Pass 3 defer.

**Deferred/V2:** `search q` title/client already exists (not deferred), pagination generic already exists — next would be `search` relevance, `analytics`, `AI` — all deferred per baseline `Do NOT add AI/OCR`.

---

## 5. MatterVault V1 Audit

**Accepted V1 scope (from `LAWYER_MICROTOOL_MATTERVAULT_V1_REPORT.md` + `RCCF-LAWYER-03` + `009` hardening):** `matters` (`title 1..200, matter_type 6, status open/ready/archived, assigned_to, next_action 500, deadline, `firm_id+status` index) → `checklist_items` (`label 1..100, required, pending/uploaded/verified/rejected, document_id, uq(matter_id,label)`) → `checklist_templates` hard-coded 3–5 per type (no DB engine) → `matter_documents` `firm/{firmId}/matters/{matterId}/{docId}/{safe}` 10 MB `pdf/jpg/png/docx` private `matter-documents` → `matter_notes` `1..5000` → `matter_activity` 7 actions append-only (`matter_created/checklist_issued/document_uploaded/document_verified/note_added/matter_ready/matter_archived`) → `matters` list `title/client/type/status/assigned/deadline` + `?status` filter + `Required: x/y` readiness → detail `Client/Type/Assigned/Deadline with OVERDUE/Next action` → checklist `pending→uploaded → verified/rejected → pending/uploaded` (verified no reversal) → upload `service.storage` + `remove` on fail + `document_id→uploaded` → notes `owner any, member assigned+own` → activity `created_at ASC` `is_firm_member` → dashboard `open/awaiting/ready/overdue` → `OWNER/ADMIN create/edit/upload/verify/reject/archive` vs `MEMBER view all, upload only assigned, notes own` → solo owner `assigned_to=null` works.

| Area | Implementation | Evidence |
|---|---|---|
| **Firm/tenant** | Reuses `users/firms/firm_members/clients/Auth/is_firm_member/firm_role` | `create-matter.ts:14` `getCurrentFirmForSession` |
| **Matters** | `matters` PK + `firm_id FK CASCADE + client_id RESTRICT + title check 1..200 trimmed + matter_type enum + status default open + assigned_to SET NULL + next_action 500 + trigger `set_updated_at`` | `008_matters.sql:10` |
| **Clients** | Reused `clients` `firm_id` `is_firm_member` | `003` |
| **Checklist** | `checklist_items` `matter_id+firm_id+label required+status+document_id SET NULL + uq + `idx_matter+status` + `trigger` | `008:75` |
| **Checklist lifecycle** | `pending→uploaded` (upload) → `verified`/`rejected` (RPC `SECURITY DEFINER FOR UPDATE` `owner/admin` + `status=uploaded` else exception) → `rejected→pending/uploaded` (no verified reversal) | `008:164` `verify...`, `225` `reject` |
| **Document upload** | `MatterUploadForm` `encType multipart` `checklistItemId? + file` → `uploadMatterDocumentForCurrentFirm` `canUploadToMatter` + `MIME`/`10MB` + `sanitizeFilename` → `service.storage.upload` `upsert:false` → `insertDocument` + `remove` on fail → `checklist status=uploaded` + `matter_activity document_uploaded` | `upload-matter-document.ts:13` |
| **Verification/rejection** | `Checklist` `useActionState(verifyChecklistAction)` `uploaded`→`Verify`/`Reject` `pending` + inline `Upload for {label}` `Input file` when `pending/rejected && canUpload` (Pass 3) | `checklist.tsx:14` |
| **Readiness** | `verify...` `NOT EXISTS required status != verified` → `matters status open→ready` + `matter_ready` + `MattersTable` `Required: x/y` `Ready green-50` + detail `Required: x/y` | `008:209` + `matters-table.tsx:39` |
| **Archive** | `ArchiveMatterButton` `confirm("Archive?")` → `archiveMatterAction` → `rpc archive_matter` `open/ready→archived` `owner/admin` | `archive-matter-button.tsx:1` |
| **Notes** | `MatterNoteForm` `Textarea` `htmlFor` `1..5000` + `MatterNotesList` `NoteRow` edit `Textarea` + delete `confirm` + `canEdit/delete` `member assigned+own` | `matter-notes-list.tsx:1` |
| **Activity** | `MatterActivityTimeline` humanized `Matter created — title`, `Checklist issued — 3 items`, etc., fallback `replace` | `matter-activity-timeline.tsx:1` |
| **Dashboard** | `getMatterDashboardSummary` `open/awaiting/ready/overdue` (`count distinct matter_id where required != verified` among `open`) + `app/app/page.tsx` `MatterVault` `grid 2→4 p-4 text-2xl` with `Ready green-50`/`Overdue red-50` | `dashboard: get-matter-dashboard-summary.ts:1` |
| **Filters** | `MattersPage` `searchParams.status` `open/ready/archived` `All/Open/Ready/Archived` `bg-foreground` active + `MattersTable` `readinessMap` via `checklist_items in matter_id` batch | `app/matters/page.tsx:12` |
| **Permissions** | `matter-permissions.ts` `canCreateMatter owner/admin` vs `member view`, `canEdit owner/admin`, `canUpload member only assigned`, `canVerify owner/admin`, `canNote member assigned+own` | `matter-permissions.ts:3` |
| **Member mgmt** | Reused `firm_members` `Members` `PageHeader` + `MembersTable` | `members/page.tsx:7` |
| **Empty/error/loading/validation/deadlines** | `MattersTable EmptyState No matters yet`, `MatterForm fieldErrors role=alert`, `Input disabled:opacity-50` `pending Saving...`, `Matter deadline OVERDUE` `red-600`/`amber-600` (Pass 1) | `matters-table.tsx:6`, `matter-form.tsx:34` |
| **Production** | `10/10 pages` `ƒ /app/matters` etc., `next build` `Compiled` | `build` |
| **E2E** | `mattervault-smoke` (prior) `owner New/Edit/Archive` vs `member assigned Upload` + status filter + readiness — 3/3 PASS in Pass 1 | `P1_POLISH_REPORT.md` |
| **Security** | 009 `DROP INSERT/UPDATE/DELETE` for `matters/checklist` `SELECT is_firm_member` only, `matter-documents` private, RPC `SECURITY DEFINER` `FOR UPDATE` | `009:1` |

**Comparison to accepted MatterVault V1 scope:** **100% match** — 3–5 items per type (civil `Vakalatnama/ID proof/Agreement/Payment optional` etc.), `matter_type` immutable after creation (update omits `matter_type`), no pagination/CSV (deferred per spec), no magic links/OCR/AI/eCourts/billing/WhatsApp.

---

## 6. MatterVault P0/P1/P2

**No P0** — core `create → checklist → upload → verify → ready → archive → note → activity` all PASS, no data loss, no `matter_id` on NoticeFlow (`Select-String matter_id` → only `008`, 0 in `notice/document`), `assigned_to` uses `name` not `8 char` (Pass 1), `deadline OVERDUE` visible (Pass 1).

**P1 — none remaining** after P1 polish: permission UI previously `New/Edit/Archive/Upload` visible to member → now gated `canCreate/canEdit/canArchive/canUpload` with `Assigned member only` message (`[matterId]/page.tsx:114`); `Checklist` Verify dynamic `import` → static `verifyChecklistAction` + `pending`/`role=alert`; `Archive` inline service → `ArchiveMatterButton` `confirm`; `Notes` edit/delete and `Documents` delete missing → now `MatterNotesList` `Edit/Delete` + `MatterDocumentsList` `Download/Delete` with per-doc `uploaded_by` check; `MatterForm` `htmlFor/id/aria-describedby` fixed; `Readiness` + `?status` added.

**P2 — improvements (V1.1, not blocking):**
- `MattersTable` `Assigned` now `membersMap` name, but `NoticesTable` `Assigned` still `id.slice(0,8)` — **P2** to make Notice assigned human too.
- `MatterUploadForm` `checklistItemId` dropdown `label — status` could show `pending` disabled — **P2**.
- `MatterDetail` `Details/Schedule` now grouped `border p-4 h3 Details` vs `Schedule` (Pass 3) — good, but still single `Client/Type/Assigned` vs `Deadline/Next action` could add `assigned` avatar — **P2**.
- `Activity` humanized for MatterVault (`document_verified` → `Checklist item verified`) but `Notice` `ActivityTimeline` still `from→to` raw — **P2**.
- `MattersTable` `Deadline` now `OVERDUE` red, but list still `min-w-[720px]` scroll — sticky first column deferred per Pass 3 — **P2**.
- `Touch h-9 → h-10` only `NavShell` toggle done `h-10` (Pass 3), other `Button h-9` remain 36px — **P2**.
- `Dashboard` `Signed in as` `border p-4` still debug-style in middle, not header — **P2** (was `P2` in Pass 2 audit, deferred).
- `Why MicroTools` `bg-muted/20 rounded-lg` now (Pass 3) but still bullet list, not narrative — **P2** (intentionally minimal).

**Deferred/V2:** `search q` title/client, `type/assigned/deadline` filters, `pagination` generic, `CSV`, `magic links` `matter_upload_tokens`, `OCR/AI/translation/eCourts/CNR/hearing/billing/legal research/WhatsApp/SMS/email/client portal` — all correctly **not** in V1 per `RCCF-LAWYER-03` `DO NOT implement` list.

---

## 7. Security Regression Review

*Inspection only, referencing prior verified reports (no new destructive DB test).*

| Check | Evidence | Verdict |
|---|---|---|
| **firm_id tenant scoping** | Every tenant row `firm_id` + `RLS USING is_firm_member(firm_id)` on `firms/ne` (`firms`, `firm_members`, `clients`, `notices`, `documents`, `notes`, `activity`, `matters`, `checklist_items`, `matter_documents`, `matter_notes`, `matter_activity`) + `getCurrentFirmForSession` + `eq firm_id` in `getMatterByIdForFirm` `getMatterDocumentForFirm` `uploadMatterDocument` `checklist.firm_id` | **PASS** |
| **firm_members auth source** | `firm_role(target_firm uuid)` `SECURITY DEFINER` + `getMembershipRole` server-only; no `user_metadata.role`, no `firm_id` client | `001:98`, `firm/permissions/get-membership.ts:1` — **PASS** |
| **service-role server-only** | `createServiceSupabaseClient` at `src/infrastructure/database/supabase-service.ts:1` reads `SUPABASE_SERVICE_ROLE_KEY` server-only; `grep -r createServiceSupabaseClient src/components` → no `use client` import; `Input`/`Table`/`PageHeader`/`EmptyState`/`NavShell` contain **zero** `supabase` import (`git diff --stat` shows no `supabase` in `src/components/ui`) | **PASS** |
| **private storage** | `notice-documents` `false` + `matter-documents` `false` (`007:60`, `008:157` + `update public=false`) + `storage.objects` not public | **PASS** |
| **signed URLs** | `DocumentsList` `canDeleteDocument` + `MatterDocumentsList` `canDelete` + `getMatterDocumentUrlForCurrentFirm` `is_firm_member` + `matter.firm_id` before `service.createSignedUrl(path,60)` `60s` | `matter/services/get-matter-document-url.ts:9` — **PASS** |
| **RPC authority** | `transition_notice` + `verify_checklist_item_and_maybe_ready` + `reject_checklist_item` + `archive_matter` all `SECURITY DEFINER set search_path=''` `auth.uid()` `is_firm_member` `firm_role in owner/admin` `FOR UPDATE` `status=uploaded` else exception | `006:30`, `008:164` — **PASS** |
| **RLS restrictions** | `008` had `matters_member_select/insert/update/owner_admin_delete` + `checklist_member_*` `is_firm_member`; `009` `DROP INSERT/UPDATE/DELETE` for `matters`/`checklist_items` leaving `SELECT` only, `matter-documents`/`notes`/`activity` `SELECT` only — `git diff --name-only HEAD -- supabase/migrations` → no diff beyond `008/009` (already committed in `4107778`), `Select-String` no new `CREATE POLICY` in `src` | **PASS** |
| **no client service-role** | See service-role check | **PASS** |
| **no cross-tenant path** | `client.firm_id === currentFirm.id` + `assigned_to` `exists firm_members where firm_id=currentFirm` + `matter.firm_id === currentFirm.id` + `checklist.matter_id` belongs to firm + `document.matter_id` belongs to firm — all `firm_id` `eq` | `create-matter.ts:28`, `upload-matter-document.ts:23` — **PASS** |
| **no IDOR** | `getMatterByIdForFirm` `eq id + eq firm_id`, `updateMatter` `eq id eq firm_id`, `getMatterDocumentForFirm` `eq firm_id`, `verify RPC` `is_firm_member` + `firm_role` | **PASS** — prior `e2e` `no firm_id in URL` + `matter-rls-hardening` 9 tests `PASS` |

**No regression** since `4107778` + Pass 1-3 all `typecheck/lint/test/e2e` green, no `supabase` file in `git diff` for Pass 3 (only `src/app`/`src/components`/`src/modules` presentation).

---

## 8. Architecture Review

**Expected:** `UI (app/*, components/*) → Actions (thin) → Services (business rules) → Repositories (DB .from) → Infrastructure (supabase-client/server/service)` ; `proxy.ts` session only.

| Check | Evidence | Verdict |
|---|---|---|
| **UI → Actions → Services → Repositories → Infrastructure** | `MatterForm` `useActionState(createMatterAction)` → `actions/create-matter.ts:6` `revalidatePath` → `services/create-matter.ts:8` `client.firm_id` check → `repositories/matter-repository.ts:6` `.from("matters")` → `infrastructure/supabase-server/service`; `Notices` same `listNoticesFilteredPaginated` → `notice-repository` → `supabase-server` | **PASS** |
| **god components** | `Matters page.tsx` 100 lines (was 25 + status filter), `MatterDetail 185` lines (was 112) but still `// Human-readable assigned` + `PageHeader` + `Details/Schedule` + `Checklist`/`Documents`/`Notes`/`Activity` — no 300-line god, `AppNav` now 11 lines via `NavShell` | **PASS** (no god) |
| **god services** | Largest `create-matter.ts` ~90 lines `validation → firm → client → assigned → service insert → checklist → activity` — single responsibility, not god | **PASS** |
| **duplicated business logic** | `is_firm_member`/`firm_role` only in `supabase` + `getMembershipRole`; `canCreateMatter` etc. single source `matter-permissions.ts:3`; `deadline diff` `Asia/Kolkata` duplicated inline in 3 places (`MattersTable`, `MatterDetail`, `NoticesTable`) — small duplication, but per audit “prefer small duplication over premature abstraction until 2nd use” — acceptable, not yet `deadline-helpers.ts` | **PASS** (minor duplication acceptable) |
| **business logic in UI** | `MattersTable` `readiness` `Required: x/y` is **presentation** (`verifiedCount/requiredCount` from `readinessMap` prop, not DB), `Checklist` `canVerify` is prop, `MatterForm` no `is_firm_member` — all `can*` in `app/**/page.tsx` server component, not client | **PASS** |
| **DB access in components** | `Input`/`Table`/`PageHeader`/`EmptyState`/`NavShell`/`Badge`/`Button` contain **0** `supabase` import; `MatterForm` etc. use `useActionState` not `.from`; `listMattersByFirm` only in `repositories` | **PASS** |
| **unnecessary generic abstractions** | No `WorkflowEngine`/`DashboardEngine`/`generic repository`/`Card framework`/`FormField framework`/`Dialog`/`Tabs`/`Breadcrumb` — only 7 thin primitives `Input` (18 lines) `Textarea` (18) `Select` (18) `Table` (38) `PageHeader` (20) `EmptyState` (15) `NavShell` (38) — each 15–38 lines, per audit “smallest practical” | **PASS** |
| **vague utils/helpers** | No `src/lib/utils.ts` beyond `cn` 6 lines, no `helpers.ts`/`common.ts` | **PASS** |
| **domain leakage** | `Select-String matter in notice` → 0, `notice` in `matter` → 0 except `client/firm` reuse; `NoticeFilters` not importing `matter`; `Dashboard` `MatterVault` section uses `getMatterDashboardSummary` but not `notice` tables | **PASS** |
| **coupling** | `notice` still `notice-documents` bucket, `matter` `matter-documents` bucket separate, no shared `documents` table, no `matter_id` on `notices` (`Select-String matter_id` → only `008`) | **PASS** |
| **premature framework** | `git status` shows no `src/modules/*/engine` `workflow` `events` `generic` | **PASS** |

---

## 9. Test/Quality Results

**Exact commands run now (this audit, not cached):**

| Command | Exit | Evidence |
|---|---|---|
| `pnpm typecheck` | **0** | `tsc --noEmit` (no output, 0 errors, fixed `matter-activity` `replace` as `string`) |
| `pnpm lint` | **0** | `eslint` (0 errors, `no-empty-object-type` already fixed to `type` in `input/textarea/select`) |
| `pnpm test` | **36 passed \| 1 skipped** `229` | `vitest run` `36 passed 1 skipped (37) Tests 228 passed 1 skipped (229) Start 03:57 Duration 33.68s` — includes `matter-schema`, `permissions`, `status`, `checklist-transitions`, `document-schema`, `note-schema`, `idor`, `activity`, `rls-hardening`, `notice-permissions` etc., **no test weakened** |
| `pnpm build` | **0** | `next build` `Compiled successfully in 25.7s` `10/10 pages` `ƒ /app/matters` `ƒ /app/matters/[matterId]` `ƒ /app/notices` `○ /login` etc., `sitemap.xml` `robots.txt` |
| `pnpm audit` | **0** | `No known vulnerabilities found` |
| `pnpm test:e2e` | **12 passed** | `auth.spec` 3 (`/app → /login`, `login/signup render`, `onboarding requires auth`), `notices-pagination` 4 (`preserves filters`, `export preserves filters not page`, `Previous disabled`, `no firm_id`), `smoke` 5 (`MicroNest homepage`, `NoticeFlow`, `Chartered Accountants`, `unknown profession/tool not-found`) — **42.4s** |

**Coverage:** Unit `matter-note-schema` `1..5000`, `checklist pending→uploaded→verified/rejected` etc., integration `member only assigned upload`, `owner verify`, `ready` atomic `FOR UPDATE` (via `verify` RPC), storage `10MB`, `private bucket`, `signed 60s`, RLS `is_firm_member`.

---

## 10. Production Readiness

**Not yet deployed** — `4107778` on `main` + uncommitted Pass 1-3 (`M package.json` `src/app` `src/components` + `??` 7 primitives `input` etc. + 6 reports). No `supabase db push` done this pass (read-only).

**Build readiness:** `next build` `10/10` `Compiled` + `sitemap`/`robots` + `openGraph` `https://micronestmicrotools.vercel.app` — **ready to push to Vercel Hobby** (`$ pnpx vercel deploy` would succeed, but not done per audit rule `Do NOT push`).

**Security readiness:** 8/8 production security `PASS` from `LAWYER_MICROTOOL_MATTERVAULT_PRODUCTION_SECURITY_REPORT.md` still valid (no migration/RLS change).

**Remaining before production:** Commit Pass 1+2+3 as `feat(micronest): ui/ux pass 1-3` (or separate `4107778` already covers P1, now add Pass 2-3), then `supabase db push` already done for `008/009` (no new migration), then Vercel deploy.

---

## 11. Pilot Readiness

| Product | Verdict | Why | Concrete blocker (if any) |
|---|---|---|---|
| **NoticeFlow** | **READY FOR PILOT** | V1 scope complete (client creation + notice `received→closed` workflow `canTransition`, docs 10 MB private, notes, activity, dashboard `open/overdue/dueSoon`, filters `q/status/priority/authority/assigned/deadline` + `Clear filters`, pagination, CSV export, permissions `OWNER any / MEMBER own`, validation, deadline `OVERDUE` urgency in list+detail). Only presentation deduped to `Input/Table/PageHeader` — no workflow change. | **None** — `P2` (mobile `grid 2` dates narrow before fix, now `1→2`) already fixed, remaining `Assigned` id vs name is **P2** not blocker. |
| **MatterVault** | **READY FOR PILOT** | V1 scope complete + P1 polish made it coherent (permission gating `Assigned member only`, checklist `Verify/Reject` with feedback, `Archive` confirm, note/doc delete, `htmlFor`/`role=alert`, `Required: x/y` + `?status`). Pass 2 added `membersMap` name + `Deadline OVERDUE` + `Details/Schedule` grouping + `Pending→upload` inline. Pass 3 kept `Notice deadline in list` + `filter stacked` + `inline upload` etc. | **None** — was `NOT PILOT READY` before P1 (member saw owner actions), now **PILOT READY** for supervised 1–3 firms ≤30 matters. Not yet self-serve at scale (search `q` title/client, global pagination, empty-state polish remain **P2**). |
| **MicroNest platform** | **READY FOR PILOT** (as ecosystem of 2 tools + marketing) | Marketing `MicroTools` `max-w-5xl` + `/profession` + `/tools` `SSG` + `Geist` + `AppNav` `MicroNest` `NavShell` `max-w-5xl` alignment — coherent. | **None** — marketing `lawyers` tool still not public (`src/content/microtools.ts` still only `noticeflow` per `V1_REPORT.md` “Do NOT add lawyers to marketing yet” — correct, still `P2` until MatterVault pilot signed off). |

**No scores, no ranking** — both tools individually pilot-ready, platform is pilot-ready as “NoticeFlow production + MatterVault pilot”.

---

## 12. Deferred/V2 Scope

**Explicitly deferred per `RCCF-LAWYER-03` `DO NOT implement` + audit P2:**

- `search q` title/client for Matters (Notice already has `q`), `type/assigned/deadline` filters for Matters — **V1.1** (spec: pagination only if needed, no `q` in Phase 1).
- Generic pagination `Table` stays `overflow-x-auto` `min-w-[720px]` scroll, not card fallback — **V1.1** if >50 matters.
- CSV export for Matters — **V2** (Notice has CSV, Matter explicitly `Do NOT implement CSV export` Phase 1).
- Magic links `matter_upload_tokens` / client upload without login — **V2** (row `matter_upload_tokens` not in `008`).
- `OCR/AI/translation/eCourts/CNR/hearing calendar/billing/legal research/WhatsApp/SMS/email/client portal` — **V2**.
- `Input h-9` globally `36px` → `h-10` `40px` for all buttons — deferred `h-10` only for `NavShell` toggle (Pass 3) — **P2**.
- `Card` framework, `FormField` framework, `Dialog`/`Tabs`/`Breadcrumb`/`animation library` — deferred per Pass 2/3 boundary.

---

## 13. Current Platform Gaps

**Gap vs pilot expectation (not V1 scope):**

- **Matters search:** No `q` for title (`Matters` list vs `Notices` `q` has `Search (reference / client)`). For pilot with 20 matters, `status` filter + `Readiness` + `Deadline` urgency suffices; for 100 matters, search becomes **P1**. — *Evidence:* `src/app/app/matters/page.tsx:17` only `status` param.
- **Matter assigned name in Notice context:** `NoticesTable` `Assigned` still `id.slice(0,8)` (MatterVault now shows name via `service users` `membersMap`, Notice not) — **P2**, not blocker.
- **Notice detail grouping:** Matter detail now `Details/Schedule` two cards, Notice detail still single `grid border p-4` 10 fields dense — **P2**, consistent with audit Pass 3 “detail grouping into Cards” deferred.
- **Notice note/upload `htmlFor`:** `NoticeForm` now `htmlFor` (Pass 3), but `NoteForm` (`src/modules/note/components/note-form.tsx:12` `textarea` without `htmlFor`) and `UploadForm` (`src/modules/document/components/upload-form.tsx:12` `input type=file` without `label`) remain plain — **P2**.
- **Dashboard `Signed in as` debug card:** Still middle `border p-4` with `Members/Clients/Notices/Sign out` footer links duplicating header — **P2** (audit said keep, deferred).
- **Marketing empty `Why` `bg-muted/20`:** Now `rounded-lg` but still bullet list, no profession-specific value prop — **P2** (intentionally minimal while 1 tool).

---

## 14. Next Product Discovery Candidates

*Do not implement or rank — evaluate.*

**Existing discovery context (from `RCCF-MICRONEST-NEXT-01`):** `MatterVault`, `Hearing Preparation Pack`, `Matter Intake & Conflict Check`, `Contract Review Tracker`, `Legal Notice Manager` + existing CA `NoticeFlow` ecosystem. Also `Geist`/`neutral` platform can host new profession verticals.

| Candidate | Existing platform capability that would reuse | Reuse potential | Overlap risk |
|---|---|---|---|
| **Hearing Preparation Pack** (matter → hearing date → documents → checklist → pack PDF) | `matters` `checklist_items` `matter_documents` `matter_notes` `matter_activity` `firm_members` `deadline urgency` `matter-documents` bucket `verified` state | **High** — extends MatterVault (adds `hearings` table `matter_id, date, court, judge, next_date`, `hearing_documents`, `pack` generation). No new tenant model. | **Low** — distinct workflow (`matters` is collection, hearing is event). Risk is scope creep into MatterVault V1 — should stay separate microtool. |
| **Matter Intake & Conflict Check** (client intake form → conflict against existing clients/matters → `matters` create) | `clients` `matters` `firm_id` tenant, `checklist_templates` for intake docs, `activity` | **Medium** — reuses `clients` search (`q` already) but needs conflict `name LIKE` across firms? No, tenant-scoped, so conflict is firm-local `clients where name ILIKE` — simple. | **Medium** — overlaps MatterVault create (`MatterForm` `client_id` select) — intake would be pre-matters funnel, not duplicate. |
| **Contract Review Tracker** (contract upload → clauses → review checklist → status `draft/review/ready`) | `Input`/`Table`/`PageHeader`/`matter-documents` pattern, `checklist` pattern (could reuse `checklist_items` concept for clauses) | **Medium** — similar doc + checklist, but new domain `contracts` `clauses` `reviews` — fresh tables. | **Low** — lawyer contract vs matter are different buyers (corporate vs litigation). |
| **Legal Notice Manager** (legal notice `section 138` etc. → reply tracking) | Could reuse `notice` workflow (`authority/notice_type/priority/status`) but legal notices are `advocate` sending, not `CA` receiving — different direction. | **Low** — would duplicate NoticeFlow terminology (`notices` already `authority: gst/income_tax`) with legal `section 138`. | **High** — naming collision `notices` vs `legal notices`, plus CA vs lawyer mental model diverge. Should be separate `legal_notices` domain, not extend NoticeFlow. |
| **CA-side next (e.g., TDS Filing Tracker)** | CA `firms` `clients` `dashboard` `SummaryCards` pattern, `notice_documents` | **High** — NoticeFlow is CA, so CA-adjacent TDS filing reuses CA client base, deadline `response_deadline` pattern. | **Low** — TDS is new filing workflow, not notice response — distinct. |

---

## 15. Reuse Potential

- **Highest:** `Hearing Pack` — reuses `matters` FK, `checklist` state machine (`pending→uploaded→verified`), `matter_documents` storage path `firm/{firm}/matters/{matter}/...` could extend to `hearings/{id}`, `member` assignment, `activity` timeline (`hearing_created` etc.), `PageHeader`/`Table`/`Input` primitives.
- **Auth/tenant:** All candidates reuse `users/firms/firm_members` `is_firm_member` `service-role` + `private storage` + `signed 60s` already proven.
- **UI:** `Input`/`Select`/`Table`/`PageHeader`/`EmptyState`/`NavShell` now proven across Notice+Matter — next tool can copy same thin wrappers, no new framework.

---

## 16. New Complexity

- **Hearing Pack:** New `hearings` `hearing_documents` + `pack` PDF generation (new dependency `pdf-lib`/`puppeteer` vs `Vercel` hobby limit, `storage` more objects), `date` handling `hearing_date` vs `matters.deadline` (two deadlines), `CNR` number not needed V1.
- **Intake & Conflict:** Conflict `ILIKE` search `supabase` `pg_trgm` vs `GIN` `to_tsvector` already on `clients` (`003_clients.sql:18` `GIN to_tsvector(name)`) — could reuse, but conflict UX (show `already exists: Client A — Matter X`) needs search relevance tuning.
- **Contract:** Clause extraction needs `pdf` text vs `docx` — new `storage` `pdf` parsing, `clauses` table, `tracker` statuses.
- **Legal Notice Manager:** Would need new `legal_notices` enum (`section 138` etc.) separate from `notice_authority` (`gst`/`income_tax`) — domain complexity high, plus `advocate` role vs `CA` role.
- **Security:** Any new tool that adds `client` + `document` must repeat `service-role` + `RLS SELECT is_firm_member` + `signed URL` — no new security pattern, just repeat verified pattern.
- **Scope size:** Hearing Pack is smallest (extends MatterVault), Intake is medium, Contract/Legal Notice are larger (new bounded context).

---

## 17. Information Gaps

- **No lawyer discovery for Hearing Pack:** MatterVault discovery was for `civil/criminal/NI/rent/recovery/other` matter types with `Vakalatnama` etc., but hearing flow (`court, bench, next date, order sheet`) not validated with real lawyers — need 3 lawyer interviews for `hearing` fields.
- **No CA TDS filing discovery:** `NoticeFlow` + `MatterVault` cover `notice response` + `matter docs`, but CA filing (TDS return `24Q` etc.) workflow not mapped.
- **No pricing/billing discovery:** `Hobby` `Vercel` + `Supabase Free` covers pilot, but next tool’s `storage` `50MiB` limit (`supabase/config.toml:118`) + `max_rows 1000` (`config.toml:16`) for `Hobby` may need upgrade check — not yet measured.
- **No contract volume data:** `MatterVault` assumes 3–5 docs per matter, but contract review assumes 10–20 clauses per doc — storage `10 MB` per doc still OK, but `checklist_items` `label 1..100` for clauses may be too short for clause text.
- **No `profession` content for Lawyers marketing:** `src/content/microtools.ts` still `noticeflow` only (`tools` 1, `professions` 1 `chartered-accountants`), so `MicroTools` marketing cannot show Lawyers `MatterVault` until `lawyers` profession + `mattervault` tool added (`src/content/microtools.ts` is `V2`, not pilot).

---

## 18. Recommended Next Investigation

**Do not implement a new tool now.** The platform is credibly `Micronest` with two pilot-ready tools and a coherent design system baseline — next step is **discovery, not code**.

**Recommended:** **Hearing Preparation Pack** discovery (separate `MICRONEST_HEARING_DISCOVERY.md`):

1. 5 lawyer interviews (civil, criminal, rent) — map `hearing` fields (`date, court, bench, judge, next_date, order_type, CNR?`), pack `PDF` contents (cause list + `verified` docs from `matter_documents` + `notes`).
2. Validate reuse: `matters.id` FK + `matter_documents` where `verified` → hearing docs, vs new `hearing_documents`.
3. Scope V1: `hearings` CRUD + `hearing_date` (no CNR fetch), `pack` as `service` `storage` `matter-hearings` bucket private `60s` (reuse), `activity` `hearing_created` etc., dashboard `upcoming hearings 7d`.
4. Probe `Vercel` `pdf-lib` size vs `Hobby` + `Supabase` `storage 50MiB` for 10-packs.

**Alternative if CA priority higher:** **TDS Filing Tracker** discovery (CA clients already `clients` + `notices` `tds` authority exists `004_notices.sql:4` `notice_authority tds`).

**Second candidate after Hearing:** `Matter Intake & Conflict Check` (small, reuses `clients` search, low build risk, high commercial validation: “would a firm pay for intake?”).

**Explicitly not next:** `Legal Notice Manager` (overlap `notices` naming, low reuse) and `Contract Review Tracker` (larger scope, `pdf` parse complexity).

---

## 19. Explicit Non-Goals

*Do not do in audit or next build:*

- Redesign UI (no `Card`/`FormField`/`Dialog`/`Tabs`/`Breadcrumb` framework, no `gradients`/`glass`/`shadows`/`rounded-xl`/`animation library`).
- Change DB schema, create migrations, modify RLS (`001`–`009` are committed), RPCs, auth, `firm_members`/`firmStatus`, `is_firm_member`/`firmRole`, `supabase` `max_rows`, `storage` `file_size_limit`.
- Modify `NoticeFlow` workflow (`canTransition` `received→closed`), `MatterVault` state machines (`pending→uploaded→verified` + `open→ready→archived` `FOR UPDATE`), `tenant` `firm_id` scoping, `service-role` server-only.
- Add `search` `q` for Matters beyond `?status` (already `?status` in `matters/page.tsx:17`), pagination generic, `CSV` for Matters (Notice has `Export CSV`, Matter explicitly `DO NOT` Phase 1), `magic links`, `OCR/AI/translation`, `eCourts/CNR`, `hearing calendar`, `billing`, `WhatsApp/SMS/email`, `client portal`.
- Add dependencies (`geist` already `1.7.2` from Pass 1, no `pdf-lib` etc.).
- Create marketing `lawyers` profession / `mattervault` tool in `microtools.ts` (still `noticeflow` only per `V1_REPORT` `Do NOT add marketing`).
- Create billing/subscriptions/analytics (`₹0` Hobby + `Supabase Free` still).
- Invent customer claims or scores.

---

## 20. Final Verdict

**Current Platform State:** **Two real microtools (NoticeFlow, MatterVault) on one MicroNest platform** with shared `Geist` `neutral` `max-w-5xl` `Input/Table/PageHeader/NavShell` design language, `10/10 pages` `Compiled`, `228/229 tests`, `12/12 E2E`, `8/8` security `PASS` — **internally coherent, no god components, no `utils` dumping, no domain leakage**.

**Product Readiness:**
- **NoticeFlow:** `READY FOR PILOT` (and for production) — 5 phases complete, workflow + docs/notes/activity/dashboard/filters/pagination/CSV/permissions correct, only `Assigned` `id.slice(0,8)` vs name is **P2**, not blocker.
- **MatterVault:** `READY FOR PILOT` — V1 `008/009` + P1 polish `Assigned` name + `OVERDUE` + `Required: x/y` + `?status` + inline `Upload` + humanized activity; **not yet self-serve at scale** (search `q`, pagination, `Notice detail` grouping remain **P2** per §6, but not pilot-blocking for supervised 1–3 firms).

**Commercial/Pilot Readiness:** **Both READY FOR PILOT** (separately, not ranked). MicroNest as marketed SaaS is **not yet marketed** (`MicroNest` `MicroTools` `1 profession + 1 tool` grid now `max-w-md` centered, not empty) — pilot is invite-only at `/app` (already `/app/matters` gated + dashboard `MatterVault` cards), which is correct.

**Security Regression:** **No regression** — `firm_id` tenant, `is_firm_member` source, `service-role` server-only, `private storage` + `60s` signed, `SECURITY DEFINER` RPCs, `RLS` `SELECT is_firm_member` only for `matters/checklist` after `009`, no client `service-role`, no `firm_id` leak (`e2e` `no firm_id` PASS).

**Architecture:** `UI → Actions → Services → Repositories → Infrastructure` intact, no `god` file >185 lines (`MatterDetail` 185 with grouping), no `utils` dumping.

**Test/Quality:** `typecheck` 0, `lint` 0, `test` 36/228 `1 skipped` (no weakening), `build` `10/10`, `audit` clean, `e2e` 12/12.

**Next Build:** **Discovery for `Hearing Preparation Pack`** (extends MatterVault `matters` + `verified` docs, smallest scope, highest reuse, low overlap) — do **not** implement; first write `MICRONEST_HEARING_DISCOVERY.md` with 5 lawyer interviews, `hearings` schema `matter_id/date/court`, `pack` PDF via `storage` private, dashboard `upcoming 7d`.

**Explicit Non-Goals respected:** No DB/RLS/RPC/auth/services change, no new deps beyond existing `geist`, no marketing, no Phase 2.

**Final Verdict:** **PLATFORM PILOT-READY** — both microtools meet V1 `pilot` criteria; MicroNest is ready for supervised pilots (NoticeFlow in production, MatterVault via invite at `/app/matters`); next code should be discovery, not more polish on these two.

