# LAWYER MICROTOOL — MATTERVAULT V1 COMMERCIAL READINESS AUDIT

**Date:** 2026-09-29 02:00 IST
**Scope:** Audit only — no code/migration/feature/marketing changes
**Baseline:** MatterVault V1 Phase 1 implementation + 009 hardening + staging/production security PASS (8/8 gates)
**Production security:** Verified live (`rndzonshguxodrmnvhcv`, 18 bypasses denied, two-firm isolation, RPC ready, storage private, NoticeFlow 12/12 E2E green)
**App URL:** `https://micronestmicrotools.vercel.app` → `https://micronestmicrotools.vercel.app/app/matters` (authenticated)

---

## 1. Executive Summary

MatterVault V1 Phase 1 is **security-correct and domain-clean** but **not yet commercially coherent** for unsupervised real users. The bounded context is intact (dedicated `matters/checklist_items/matter_documents/matter_notes/matter_activity`, no `matter_id` on NoticeFlow, no generic engine), RLS is hardened (only `SELECT USING is_firm_member`, writes via `service_role`/RPC), and the core state machine (`open → ready → archived`, `pending → uploaded → verified/rejected`) is atomically enforced. However, the **product surface is incomplete for first-paying usage**: matter discovery is list-only (no search/filter/pagination), permission-aware UI is missing (member sees owner actions then gets backend rejection), document/note UX is half-wired (upload works but download is raw, notes have no edit/delete UI, checklist Verify/Reject uses non-standard dynamic import), and several UX/accessibility gaps would create support load on day one.

**In one line:** *Security passed — product not yet sellable without 7 P0/P1 fixes.* No V1 scope creep is needed; all required fixes are ≤1 day each and stay within Phase 1 contract. V1.1/V2 remain correctly deferred.

---

## 2. Original V1 Contract

Reconstructed from `RCCF-LAWYER-03` (Phase 1 only) + implementation report + staging/production reports. No separate `DISCOVERY & PRODUCT BLUEPRINT` file exists in repo (`glob **/*.md` → only architecture + reports) — the spec in the RCCF is treated as the contract and is consistent across reports.

**Target user:** A law firm **Owner/Admin** (creates/monitors) and **assigned Member** (executes own matters). Solo Owner must work with `assigned_to = null`.

**Primary workflow (the single workflow V1 must carry):**
`Create matter (client + type + title) → auto-generate checklist from `matter_type` → Member uploads docs (general or per checklist item, 10 MB, PDF/JPG/PNG/DOCX) → Owner/Admin verifies or rejects → when all `required` items `verified` → matter `ready` (atomic RPC) → `archived` (owner/admin).` Notes and activity are supporting, not primary.

**Core problem:** Lawyers track matters in spreadsheets/WhatsApp, lose document completeness signal (is the file set ready to file?), lose assignment and deadline visibility across `civil/criminal/negotiable_instrument/rent/recovery/other`.

**V1 entities (bounded, dedicated tables):** `matters` (title `1..200`, `matter_type`, `open/ready/archived`, `assigned_to`, `next_action 500`, `next_action_date`, `deadline`), `checklist_items` (`label 1..100`, `required`, `pending/uploaded/verified/rejected`, `document_id`), `matter_documents` (private bucket `matter-documents`, `firm/{firmId}/matters/{matterId}/{docId}/{safe}`), `matter_notes` (`1..5000`), `matter_activity` (`matter_created/checklist_issued/document_uploaded/document_verified/note_added/matter_ready/matter_archived`).

**Required screens (Phase 1):** `/app/matters` (list), `/app/matters/new` (create), `/app/matters/[matterId]` (detail with checklist/documents/notes/activity), `/app/matters/[matterId]/edit` (title/assigned/next_action/dates/deadline), dashboard MatterVault summary, AppNav `Matters` link. **Not required in Phase 1:** pagination abstraction, CSV, magic links, OCR/AI/eCourts/CNR/hearing/billing/WhatsApp/SMS/email/client portal, public marketing (`/profession/lawyers`, `/tools/mattervault`).

**Authorization:** Owner/Admin full; Member `view all`, `upload only to assigned`, `create/edit/delete own notes only on assigned`; Member cannot `create matter`, `edit matter`, `verify/reject`, `ready`, `archive`. Backend remains authoritative.

**Production boundaries:** `2224394` NoticeFlow frozen; no `matter_id` on `notices/documents/notes/activity_log`; no `firm_members/client` schema change; reuse `users/firms/firm_members/clients/Auth/is_firm_member/firm_role`.

---

## 3. Requirement Matrix

| Requirement | Discovery (RCCF spec) | Architecture (implicit) | Implementation (`V1_REPORT.md`) | Production Verified | Status |
|---|---|---|---|---|---|
| `matters` table with `firm_id/client_id/title/matter_type/status/assigned_to/next_action/_date/deadline` | ✓ | ✓ | ✓ `008_matters.sql:10` | ✓ live `svc.from('matters')` | **Done** |
| `checklist_items` with `(matter_id,label)` unique, `required`, `pending…rejected` | ✓ | ✓ | ✓ `008:75` | ✓ via checklist probe | **Done** |
| Checklist templates hard-coded 3–5 per type (`civil/criminal/NI/rent/recovery/other`) | ✓ | ✓ | ✓ `checklist-templates.ts:6` | ✓ | **Done** |
| `matter_documents` private `matter-documents` 10 MB PDF/JPG/PNG/DOCX, path `firm/...` | ✓ | ✓ | ✓ `matter-document-schema.ts:18` | ✓ private `public=false`, `42501` | **Done** |
| `matter_notes` `1..5000` | ✓ | ✓ | ✓ | ✓ `42501` + service note | **Done** |
| `matter_activity` 7 actions append-only | ✓ | ✓ | ✓ `matter-activity-types.ts:7` | ✓ `42501` + service | **Done** |
| RLS tenant `SELECT USING is_firm_member`, writes via `service_role`/RPC | ✓ | ✓ | ✓ then hardened 009 | ✓ 18 bypasses denied | **Done** |
| Owner/Admin `create/edit/verify/reject/archive` | ✓ | ✓ | ✓ `matter-permissions.ts` | ✓ owner RPC works | **Done** |
| Member `view all`, upload only assigned, notes own on assigned | ✓ | ✓ | ✓ | ✓ member SELECT own / cross empty | **Done** |
| Solo Owner `assigned_to=null` works | ✓ | ✓ | ✓ | ✓ `canUploadToMatter(owner, null)` | **Done** |
| Create matter → auto checklist → `matter_created`+`checklist_issued` (no partial) | ✓ | ✓ | ✓ `create-matter.ts:45` delete on fail | ✓ canary `CHECKLIST generated` | **Done** |
| `pending→uploaded → verified/rejected → pending/uploaded` only | ✓ | ✓ | ✓ `checklist-schema.ts:7` + RPC | ✓ direct `verified` 0 rows | **Done** |
| `ready` only when all `required verified`, atomic `FOR UPDATE` | ✓ | ✓ | ✓ `verify_..._maybe_ready` | ✓ staging `ready PASS` | **Done** |
| `open→ready→archived` + `open→archived` only, no generic engine | ✓ | ✓ | ✓ `matter-status.ts:3` | ✓ | **Done** |
| Upload `checklistItemId` links `document_id` → `uploaded` | ✓ | ✓ | ✓ `upload-matter-document.ts:60` | ✓ canary linked | **Done** |
| Download signed URL 60s after firm check | ✓ | ✓ | ✓ `get-matter-document-url.ts:9` | ✓ cross-firm `[]` + unauth denied | **Done** |
| `/app/matters` list with title/client/type/status/assigned/deadline | ✓ | ✓ | ✓ `matters-table.tsx:6` | ✓ | **Done** |
| `/app/matters/new` create form | ✓ | ✓ | ✓ `matter-form.tsx:18` | ✓ | **Done** |
| `/app/matters/[matterId]` detail (header + checklist + docs + notes + activity) | ✓ | ✓ | ✓ `.../[matterId]/page.tsx:40` | ✓ canary | **Done** |
| `/app/matters/[matterId]/edit` (title/assigned/next_action/dates, no `matter_type` change) | ✓ (16A) | ✓ | ✓ `edit/page.tsx:20` | ✓ | **Done** |
| Dashboard MatterVault section (`open/awaiting/ready/overdue`) | ✓ | ✓ | ✓ `page.tsx:44` | ✓ live probe 4 cards | **Done** |
| AppNav `Matters` | ✓ reuse | ✓ | ✓ `app-nav.tsx:7` | ✓ | **Done** |
| `matter_type` immutable after creation (V1 choice A) | ✓ | — | ✓ schema omits `matter_type` on update | ✓ | **Done** |
| Server-side pagination for matters | ○ if needed for correctness | — | **Not implemented** (list-all) | — | **Gap — see §9** |
| CSV export | **Out of scope Phase 1** | — | Not implemented | — | **NO ACTION** |
| Search/filter (client/title/status/type/assigned/deadline) | Ambiguous: blueprint calls for discovery, but Phase 1 spec says list-without-pagination if needed | — | **Not implemented** | — | **Gap — see §9** |
| Marketing `/profession/lawyers`, `/tools/mattervault` | **Out of scope until V1 production verified** | — | Not created | — | **NO ACTION** |
| Magic links / `matter_upload_tokens` | **V2** | — | Not created | — | **NO ACTION** |

✓ = present and verified, ○ = conditional.

---

## 4. Core Workflow Audit

**Trace with code pointers:**

| Step | UI exists | Action exists | Service exists | Authorization | Error handling | Activity | Tenant isolation | Verdict |
|---|---|---|---|---|---|---|---|---|
| **1. Create matter** — select `client` (must belong to firm), pick `matter_type`, enter `title 1..200`, optionally `assigned_to` (must be firm member), `next_action 500`, dates | `GET /app/matters/new` → `MatterForm mode=create` (`matters/new/page.tsx:9` + `matter-form.tsx:44`) | `createMatterAction` (`actions/create-matter.ts:9`) → `createMatterForCurrentFirm` | `src/modules/matter/services/create-matter.ts:8` (`createMatterSchema.safeParse` → `getCurrentFirmForSession` → `canCreateMatter(owner/admin)` → `getClientById` firm check → `firm_members` assigned check → `service.from('matters').insert` + bulk `checklist_items` + delete on checklist fail + `matter_activity matter_created/checklist_issued`) | `canCreateMatter` owner/admin only (`matter-permissions.ts:7`) — member blocked | `fieldErrors` rendered (`matter-form.tsx:41`), `error` banner (`106`), Zod `1..200` | `matter_created` + `checklist_issued` (service) | `firm_id = server-derived currentFirm.id`, `client.firm_id === currentFirm.id` | **Pass — clean** |
| **2. Checklist generated** | Detail `Checklist` section (`.../[matterId]/page.tsx:89`) | — | same service bulk from `CHECKLIST_TEMPLATES` (`checklist-templates.ts:6`) | — | `uq_checklist_matter_label` | `checklist_issued` | `matter_id + firm_id` | **Pass** |
| **3. Matter assigned / edited** | `MatterForm mode=edit` (`.../edit/page.tsx:11`) — title/assigned/next_action/dates only | `updateMatterAction` (`actions/update-matter.ts:9`) | `updateMatterForCurrentFirm` (`services/update-matter.ts:8`) — `getMatterByIdForFirm(...firm.id)` + `canEditMatter(owner/admin)` + assigned membership + `service.update(... eq firm_id)` | `canEditMatter` owner/admin only | `fieldErrors` | none (intentional — edit not an activity in V1) | `id + firm_id` scoped | **Pass — but UI shows Edit to members (see §7)** |
| **4. Upload document (general or per checklist)** | `MatterUploadForm` (`components/matter-upload-form.tsx:7`) — dropdown `checklistItemId` + file input | `uploadMatterDocumentAction` (`actions/upload-matter-document.ts:5`) | `uploadMatterDocumentForCurrentFirm` (`services/upload-matter-document.ts:13`) — `getMatterByIdForFirm` + `canUploadToMatter` (member only assigned) + `MATTER_ALLOWED_MIME_TYPES`/`MAX_FILE_SIZE` + `checklist.firm_id/matter_id` check + `service.storage.upload` + `service.from('matter_documents').insert` + cleanup `remove` on fail + link `document_id/status=uploaded` + `matter_activity document_uploaded` | `canUploadToMatter` (`matter-permissions.ts:21`) | `error` banner, MIME/10 MB check | `document_uploaded` | `firm/{firmId}/matters/{matterId}/{docId}/{safe}` server-derived, `matter.firm_id === currentFirm.id` | **Pass — but UX awkward (see §5)** |
| **5. Verify / Reject** | `Checklist` (`components/checklist.tsx:26`) — `Verify`/`Reject` for `uploaded` when `canVerify` | `verifyChecklistAction`/`rejectChecklistAction` (`actions/verify-checklist.ts:5`) — dynamic `import` inside | `verifyChecklistItemForCurrentFirm` (`services/verify-checklist-item.ts:7`) → `rpc('verify_checklist_item_and_maybe_ready')` / `rpc('reject_checklist_item')` | RPC `is_firm_member` + `firm_role in owner/admin` + `status=uploaded` (`008:193`) | RPC exception → `error` (not surfaced in current `Checklist` UI — no error banner) | `document_verified` (+ `matter_ready` if all required verified) | `FOR UPDATE` + `firm_id` | **Pass functionally, UI wiring has P1 (dynamic import, no error)** |
| **6. Ready** | Badge `matter.status` (`.../[matterId]/page.tsx:44`) | implicit via RPC | atomic RPC: `UPDATE checklist status=verified` + `NOT EXISTS required <> verified` → `UPDATE matters status=ready` (008:214) | owner/admin via RPC | — | `matter_ready from_status=open to_status=ready` | same | **Pass** |
| **7. Archive** | `Archive` button (`.../[matterId]/page.tsx:78`) inline `form action={"use server"}` calling `archiveMatterForCurrentFirm` directly | `archiveMatterAction` exists (`actions/archive-matter.ts:7`) but page does not use it | `archiveMatterForCurrentFirm` → `rpc('archive_matter')` (`services/archive-matter.ts:5`) — `open/ready→archived`, owner/admin | `archive_matter` owner/admin | — | `matter_archived` | `is_firm_member` + `FOR UPDATE` | **Pass — but no confirmation (P1) and page bypasses action's `revalidate/redirect`** |
| **Notes** | `MatterNotesList` + `MatterNoteForm` (`.../[matterId]/page.tsx:100`) | `createMatterNoteAction` / `update`/`delete` (`actions/matter-notes.ts:5`) | `matter-note-service.ts:8` — `canCreateMatterNote` etc., `author_id = auth.uid()` + activity `note_added` | Owner/admin any, member only assigned + own | `error` banner | `note_added` | `note.firm_id === currentFirm.id` via `getMatterByIdForFirm` | **Pass — but edit/delete UI missing (P1)** |
| **Activity** | `MatterActivityTimeline` (`.../[matterId]/page.tsx:106`) | — | `listActivitiesByMatter` ordered `created_at ASC` | read `is_firm_member` | — | — | `matter_id` → `firm_id` via RLS `SELECT` | **Pass — but raw JSON metadata (P2)** |

**Broken/awkward transitions:**
- Verify/Reject buttons do not disable after click, no success feedback, no error display (P1).
- Upload then verify is two separate forms; no inline “Upload for this item” per checklist row (P2).
- Archive has no `confirm("Archive?")` and is adjacent to Edit with same styling (P1).
- Member sees Create/Edit/Verify/Archive UI then gets backend deny — inconsistent (P1, §7).

---

## 5. UI/UX Audit

**Routes inspected:** `src/app/app/matters/page.tsx:14`, `.../new/page.tsx:9`, `.../[matterId]/page.tsx:40`, `.../[matterId]/edit/page.tsx:11`, `src/app/app/page.tsx:44`, `src/components/layout/app-nav.tsx:7`, components `matter-form.tsx`, `checklist.tsx`, `matters-table.tsx`, `matter-upload-form.tsx`.

| Area | Finding | Classification |
|---|---|---|
| **Desktop list** (`/app/matters`) | `MattersTable` `min-w-[720px]` inside `overflow-x-auto border` — works, but header `Title/Client/Type/Status/Assigned/Deadline` truncates `title` not wrapped; `assigned_to` shows `id.slice(0,8)` not name (vs notices which also does, but lawyers expect assignee name). | **P2** |
| **Mobile list** | Horizontal scroll required (same as notices) — acceptable, but no card fallback; `max-w-4xl p-6` is thumb-friendly. | **NO ACTION** (V1 parity with NoticeFlow) |
| **Detail header** | `grid grid-cols-2 gap-4 border p-4` shows 6 fields + `Badge` status; good hierarchy. No breadcrumb/back link (`← Matters`). | **P2** |
| **Empty states** | `MattersTable` `No matters yet. Create your first matter.` + CTA — good. `Checklist` `No checklist items.` — should not happen (auto). `MatterDocumentsList` `No documents yet.` — good. `MatterNotesList` `No notes yet.` — good. `MatterActivityTimeline` `No activity yet.` — good. | **NO ACTION** |
| **Loading states** | Server components have no suspense fallback; client forms show `pending` via `pending ? "Saving..." : "Create"` on submit button (`matter-form.tsx:108`) and `Uploading...` (`matter-upload-form.tsx:30`). No skeletons — acceptable for V1. | **NO ACTION** |
| **Error states** | `MatterForm` renders `fieldErrors.title` etc. and `s.error` — good. `MatterUploadForm` renders `state.error` — good. `Checklist` Verify/Reject has **no error/success UI** — failure is silent. | **P1** |
| **Form validation** | `title maxLength 200 required`, `matter_type` select, `client_id required` — good. `next_action maxLength 500` — good. Dates are `type=date` — no `deadline >= today` hint, no inline `Deadline must not be before ...` as NoticeFlow has (`notice-schema.ts:16`). | **P2** |
| **Destructive confirmation** | Archive is `POST` without `confirm` — accidental archive possible. | **P1** |
| **Success feedback** | Create redirects to detail (good), update redirects, upload shows `Uploaded` green, note shows `Added` green, checklist verify has no feedback. | **P1** (checklist) |
| **Disabled states** | Buttons `disabled={pending}` — good; `canVerify` hides buttons for members — good, but still renders form element (should hide entirely — it does). | **NO ACTION** |
| **Permission-aware UI** | **Fail:** `MatterForm` at `/app/matters/new` and Edit link are visible to `member` (no `canCreateMatter` / `canEditMatter` gate). Member will see form, submit, get backend `Not allowed` — poor UX. | **P1** |
| **Breadcrumbs/back** | No `← Back to Matters` on `new/[matterId]/edit`; user must use browser back or AppNav. | **P2** |
| **Document upload UX** | Single file input + dropdown `General document (no checklist)` + `checklistItems.map(label — status)` — functional but requires two clicks to know which checklist item needs doc. No drag-drop, no file list before upload, no size hint beyond `Maximum 10 MB`. | **P2** |
| **Checklist UX** | Row `label *` (required red star) + `Doc: ...` truncated + `Badge status` + Verify/Reject. No progress indicator (`2/4 required verified`), no “Ready when all verified” hint. | **P2** |
| **Note UX** | `textarea rows=3 maxLength 5000` + `Add note` — good, but **edit/delete UI missing** despite backend supporting it (`matter-notes.ts` actions exist). | **P1** |
| **Activity UX** | `action — from→to • actor 8chars • date` + `metadata JSON.stringify` — raw. | **P2** |
| **Matter status visibility** | `Badge` shows `open/ready/archived` — no color distinction (NoticeFlow has same, but matters would benefit: `open` gray, `ready` green, `archived` muted). | **P2** |
| **Deadline/next-action visibility** | Deadline shown as `YYYY-MM-DD` string, no `OVERDUE/DUE IN` as NoticeFlow has (`.../[noticeId]/page.tsx:70`). `next_action_date` shown but not emphasized. | **P2** |

**Overall:** Functional for an internal pilot with 1–2 trained users, but not for unsupervised self-serve. The **member-sees-owner-actions** and **no checklist verify feedback + no archive confirm + no note edit/delete UI** are the only UX issues that would generate immediate support tickets.

---

## 6. Accessibility Audit

Checked `matter-form.tsx:32`, `checklist.tsx:26`, `matter-upload-form.tsx:25`, `matters-table.tsx:17`, `matter-documents-list.tsx:8`, `app-nav.tsx`.

| Check | Finding | Class |
|---|---|---|
| Keyboard navigation | All forms are native `form` + `button type=submit` + `select/input` — tabbable. `AppNav` has `Toggle navigation` button with `aria-expanded` — good. | **NO ACTION** |
| Labels | `MatterForm` uses `<label class="text-sm font-medium">Title</label>` **without `htmlFor`/`id`** — screen reader association missing. Same for `Matter Type`, `Client`, `Assigned To`, etc. (`matter-form.tsx:32`). Upload `select` and `input type=file` also unlabeled (no `label for`). | **P1** |
| Focus states | Buttons use `Button` (`shadcn`) with `focus-visible:ring` via `app-nav` and `Badge` — focus visible. Inputs use `rounded-md border` but no explicit `focus:ring` — browser default is visible, moderate. | **P2** |
| Button semantics | Archive is `<button type="submit">` inside `form` — correct. Verify/Reject are `<Button type="submit">` inside `form` — correct. Not `div` buttons. | **NO ACTION** |
| Form errors | `fieldErrors` rendered as `<p class="text-sm text-red-600">` — not associated via `aria-describedby`/`role="alert"`. Screen reader may not announce. | **P1** |
| Upload accessibility | `<input type="file" accept=".pdf,..." class="w-full text-sm">` — not labeled, no `aria-label`. | **P1** |
| Table semantics | `MattersTable` uses `<table><thead><tbody><th scope>` implicit — good; `<Link>` inside `td` is focusable. Horizontal scroll container has no `aria-label` but acceptable. | **P2** |
| Color contrast | `text-muted-foreground` on `border` + `Badge outline` — same as NoticeFlow, which passes. Red `*` for required is not sole indicator (label + text). | **NO ACTION** |
| Touch targets | Buttons `h-9 px-3` (≈36px) slightly below 44px recommendation but same as NoticeFlow; `MattersTable` rows `p-3` — okay. | **P2** |
| Screen-reader semantics | Activity `action` not announced as list; `ul` is present — good. Documents `Download` is `<a download>` — correct. | **NO ACTION** |

**Summary:** Not blocking — keyboard works, semantics are native — but **P1** label association + file input label + error `aria-describedby` should be fixed before marketing to lawyers (many use screen reader on dense forms).

---

## 7. Authorization/UI Consistency

**Backend:** `matter-permissions.ts` is authoritative; services enforce `canCreateMatter(owner/admin)`, `canEditMatter(owner/admin)`, `canUploadToMatter(member only assigned)`, `canVerifyChecklist(owner/admin)` via RPC, `canCreateMatterNote(member only assigned)`. RLS is second layer (now deny-all writes).

| UI element | Backend allows | UI shows to MEMBER | Consistent? | Finding |
|---|---|---|---|---|
| `/app/matters/new` `MatterForm` + `New matter` link (`matters/page.tsx:18`) | MEMBER `create` → `Not allowed` | **Shown** | **No** | **P1** — should gate link + page by `canCreateMatter` (like NoticeFlow gates `canCreateNotice` at service, but UI not hidden — here worse because spec says member cannot create). |
| `Edit` link (`.../[matterId]/page.tsx:74`) | MEMBER edit → `Not allowed` (`canEditMatter` false) | **Shown** | **No** | **P1** |
| `Archive` button (`.../[matterId]/page.tsx:78`) | MEMBER archive → RPC `Only owner/admin can archive` | **Shown** (only `status !== archived` check, no role) | **No** | **P1** — should be `role in owner/admin && status in open/ready` |
| `Checklist Verify/Reject` (`checklist.tsx:26` `canVerify` prop) | `canVerify` is `owner/admin` via `canVerifyChecklist(role)` from `getMembershipRole` — so buttons **hidden for member** | Hidden | **Yes** | **NO ACTION** — correct |
| `MatterUploadForm` | `canUploadToMatter` member only assigned | **Shown always** — no `canUploadToMatter` prop | **Partial** | **P1** — member on unassigned matter sees upload then gets `Not allowed` — should hide/disable with message `Assigned member only` |
| `MatterNoteForm` | `canCreateMatterNote` member only assigned | **Shown always** | **No** | **P1** — same |
| `MatterDocumentsList Download` | `getMatterDocumentUrlForCurrentFirm` checks `is_firm_member` + `matter.firm_id` | Shown to all members | **Yes** (read is allowed for all members) | **NO ACTION** |
| `MatterNotesList` edit/delete | `canEditMatterNote` | **Not rendered** (no UI) | **N/A** | **P1** — owner/admin has no UI to use the permission they have |

**Backend remains authoritative** (all direct bypasses `42501`/0 rows), so **no security issue** — but **UX leaks** will cause “I clicked and nothing happened” confusion. Note: `canEditMatter` takes `_actorUserId`/`_matterAssignedTo` but currently ignores them (member always false) — correct per spec, but signature suggests future assignment-based edit which V1 explicitly forbids.

---

## 8. Document Workflow

| Step | Implementation | Audit |
|---|---|---|
| Upload | `MatterUploadForm` `encType=multipart` → `uploadMatterDocumentAction` → `uploadMatterDocumentForCurrentFirm` | Works; `select checklistItemId` optional — good. |
| MIME validation | `MATTER_ALLOWED_MIME_TYPES` `pdf/jpeg/png/docx` (`types/matter-document-types.ts:5`) | Strict, correct. |
| 10 MB limit | `MATTER_MAX_FILE_SIZE 10*1024*1024` + `file.size > MAX` check (`services/upload-matter-document.ts:28`) | Enforced pre-upload. |
| Private storage | `matter-documents public=false` (`008:161`), `service.storage.upload` `upsert:false` | Verified `public===false` (staging/production). |
| Checklist linkage | `checklistItemId` validated `eq firm_id` + `matter_id === matter.id` → `update checklist_items document_id + status=uploaded` | Correct, not auto-verified. |
| Upload status | `checklist_items.status=uploaded` after link | Correct. |
| Verification | RPC `verify_checklist_item_and_maybe_ready` `uploaded→verified` only | Atomic, tested. |
| Rejection | RPC `reject_checklist_item` `uploaded→rejected` | Exists, but member cannot `pending→uploaded` via UI per item (must use general upload). |
| Download | `GET /api/matter-documents/[id]/route.ts:5` → `getMatterDocumentUrlForCurrentFirm` → `service.createSignedUrl(path,60)` → `redirect` | Works; 60s expiry correct; no authz bypass (firm check before sign). Minor: `download` attribute on cross-origin Supabase URL may not force download (browser follows redirect, content-disposition matters), but file opens — **P2**. |
| Signed URL | 60s | Short, safe. |
| Error handling | `uploadError.message` → `error` banner; `state.error` shown | Good, but `Checklist` verify has no error banner (see §5). |
| Cleanup after failures | `try { insert } catch { remove([path]) }` (`upload-matter-document.ts:60`) | Correct. |
| Missing | No delete UI for documents (`delete-matter-document.ts` service exists but no list delete button). | **P1** (owner needs to replace wrong file). |

**No OCR/AI** — correct out-of-scope.

---

## 9. Search & Discovery

**Current V1:** `GET /app/matters` does `listMattersForCurrentFirm()` → `listMattersByFirm(...).order(deadline).order(updated_at)` → returns **all** firm matters (no `WHERE`, no `limit`). `MattersTable` renders all rows. No query param handling.

| Capability | Current V1 | Original V1 scope (RCCF spec) | Classification |
|---|---|---|---|
| Client search | None (client name shown via `clientsMap` but not searchable) | Blueprint likely expected at least client filter (NoticeFlow has `q/status/priority/authority/assigned/deadline` filters) | **P2** (V1.1) — for <20 matters, table scan is fine; search not a blocker for pilot. |
| Title search `q` | None | Not explicitly required in Phase 1 spec (spec says “list should support title/client/type/status/assigned/deadline + readiness indicator” — not search) | **P2** |
| Status filter `open/ready/archived` | None (status badge shown, not filterable) | Phase 1 spec: `firm_id+status` index exists (`008:26`) but UI has no filter | **P1** before real-user launch if firm has >10 matters — without filter, “Ready to file” matters drowned. However V1 spec says “server-side pagination only if already needed for correctness” — so delay is acceptable. | **P1** (not P0 — workaround is browser find, but first real user will ask day 2). |
| Matter type filter `civil…other` | None | Not in Phase 1 required list | **V2** |
| Assigned filter | None | Phase 1 spec lists assigned as column | **P2** |
| Deadline `overdue/due soon` filter | None | NoticeFlow has `deadline` filter; MatterVault dashboard has `overdue` count but no filter | **P2** |
| Pagination | None (returns all) | Spec §14: “Implement server-side pagination only if it is already needed for correctness at this phase. Do not create generic pagination abstractions.” — correct to defer. | **NO ACTION** (V1.1 when >50 matters) |
| Readiness indicator | Not rendered in table (only status). Dashboard has `awaitingDocuments` count but table has no `2/4 verified` column. | Spec §14: “readiness indicator” required | **P1** — table should show `Required: 2/3 verified` or `Awaiting` badge, otherwise status `open` alone does not convey document completeness (the core value prop). |

**Verdict:** V1 deliberately deferred search/pagination — acceptable for **internal pilot** (≤20 matters). For **commercial** launch (first 5 paying firms), **P1** is status filter + readiness indicator; rest is **P2/V2**.

---

## 10. Dashboard

Current `GET /app` renders `MatterVault` section (`app/app/page.tsx:44`):

```
Open matters | Awaiting documents | Ready | Overdue
View matters → /app/matters
```

**Audit of definitions** (`get-matter-dashboard-summary.ts:11`):

| Metric | Definition | Correct? |
|---|---|---|
| `openMatters` | `matters.status === 'open'` | ✓ |
| `readyMatters` | `status === 'ready'` | ✓ |
| `overdueMatters` | `status !== 'archived' && deadline && deadline < todayInKolkata()` | ✓ (uses `todayInKolkata` `en-CA` Asia/Kolkata, same as NoticeFlow) |
| `awaitingDocuments` | distinct `matter_id` where `checklist_items.required=true && status != 'verified'` among `open` matters | ✓ (counts matters needing docs, not items) |

| Check | Finding |
|---|---|
| Tenant scoping | `eq firm_id` + `supabase` RLS `is_firm_member` — correct. |
| Zero states | Shows `0` with border cards — good. |
| Stale counts | `force-dynamic`, no cache — fresh. |
| Links to underlying data | Only `View matters` — no `awaiting` → filtered list, no `ready` → filtered, no `overdue` → filtered. | **P2** |
| Role behavior | Same counts for owner/admin/member (dashboard is not role-filtered except via `firm_id`) — correct, members see firm-wide counts (as intended). | **NO ACTION** |

**Usefulness:** Counts answer the lawyer’s daily question (“what needs my attention?”) — but without filtered links, user must mentally map. Still useful for V1 pilot.

---

## 11. Domain/Architecture

| Check | Result | Evidence |
|---|---|---|
| Bounded context: `matters/checklist_items/matter_documents/matter_notes/matter_activity` | **Clean** — dedicated tables, no `matter_id` on `documents/notes/activity_log` (`Select-String` → only `008` hits) | `supabase/migrations/008:53` etc. |
| No coupling with NoticeFlow | **Clean** — `src/modules/matter` imports `client/firm` but not `notice/document/note/activity`; `src/modules/notice` has no `matter` import. | `Select-String matter in notice/document` → no output |
| No shared generic workflow engine | **Clean** — `canTransitionMatter` is pure `open→ready/archived` (`matter-status.ts:3`), not generic. | |
| No unnecessary abstraction | **Clean** — no `WorkflowEngine/DashboardEngine/utils/helpers/generic repository` | Folders `constants/types/schemas/permissions/repositories/services/actions/components` as spec §18, 5 services small (largest `create-matter.ts` 95 lines) |
| Reuse infra correctly | **Clean** — `users/firms/firm_members/clients/Auth/is_firm_member/firm_role/service-role/filename` reused | `create-matter.ts:14` etc. |
| Migrations additive | **Clean** — 008 additive, 009 `DROP POLICY IF EXISTS` corrective, no `ALTER notices` | `git diff 001-007` no output |

**Junior-readable?** Yes — file names answer `where does this live` (`matter-permissions.ts`, `checklist-templates.ts`), `page.tsx` thin (<30 lines), services <100 lines, no god files.

---

## 12. Performance/Code Structure

No artificial load test (per rule) — structural inspection:

| Area | Finding | Class |
|---|---|---|
| N+1 queries | `/app/matters` does 1 `matters` + 1 `clients` (all) → `Map` — good. `/app/matters/[matterId]` does `getMatter` + `getClientById` + `listMembersByFirm` + `getMembershipRole` + `checklist` + `documents` + `notes` + `activity` = 8 queries sequentially (no `Promise.all`). For single matter, latency okay (<500 ms), but could be `Promise.all([checklist, documents, notes, activity])`. | **P2** |
| Giant server components | All `page.tsx` <115 lines, `MatterForm` 113 lines — not giant. | **NO ACTION** |
| Giant services | Largest `create-matter.ts` 95 lines, `upload-matter-document.ts` 105 lines — fine. | **NO ACTION** |
| Duplicated authorization | `getCurrentFirmForSession` + `getMembershipRole` called in every service — not duplicated business rule, just session fetch (acceptable). `canCreateMatter` etc. single source. | **NO ACTION** |
| Duplicated tenant lookup | Each service does `getMatterByIdForFirm(..., firm.id)` — consistent pattern, not duplication. | **NO ACTION** |
| God files / unnecessary abstractions | None found. | **NO ACTION** |
| Client-side fetching that should be server-side | `Checklist` Verify uses `await import("../actions/verify-checklist")` inside client `form action` — this forces client-side dynamic import for a server action (see §7). Should be static `import { verifyChecklistAction } from "../actions/verify-checklist"` at top. | **P1** |
| Expensive dashboard queries | `getMatterDashboardSummary` does `select id,status,deadline` (matters) + `select matter_id` where `required && status != verified` with `in (matter_id)` — for <100 matters, fine. No `count(*)` — fine. | **NO ACTION** |
| Unsafe parallel mutations | `verify_checklist_item_and_maybe_ready` uses `FOR UPDATE` — safe. | **NO ACTION** |

---

## 13. Production Safety

| Check | Result |
|---|---|
| No destructive commands run | Audit only, no `supabase db push/reset`, no test data created |
| No secrets exposed | `SUPABASE_SERVICE_ROLE_KEY` not printed (masked), no JWT in report |
| No Supabase alteration | No migration change, no RLS touch |
| No NoticeFlow modification | `git diff HEAD -- src/modules/notice ...` no output (from prior reports) |
| Production DB not touched | No live probe in this audit (staging/production probes were prior tasks, with canary cleanup). This audit is file-only. |

---

## 14. Findings by Classification

**Every finding has exactly one class.** No score.

### P0 — Blocks real-user V1 usage
*None.* Security is pass, core create→checklist→upload→verify→ready→archive works end-to-end (verified live). There is no data loss or tenant leak.

### P1 — Required before V1 launch (first real paying firm, unsupervised)

1. **Member sees owner actions then gets backend deny** — `New matter` link, `Edit`, `Archive`, `Upload`/`Note` forms visible to member on unassigned matters. Backend correctly denies, but UX is broken. Gate UI by `canCreateMatter`/`canEditMatter`/`canArchiveMatter`/`canUploadToMatter` (pass `role + assigned_to` to components). (`matters/page.tsx:18`, `.../[matterId]/page.tsx:74,78`, `matter-upload-form.tsx:7`)
2. **Checklist Verify/Reject has no error/success feedback and uses dynamic import** — `checklist.tsx:28` does `await import("../actions/verify-checklist")` inside client `form action` (non-standard) and has no `error`/`ok` banner. Should statically import and show feedback like `MatterUploadForm` does.
3. **Archive has no confirmation** — one click archives (`.../[matterId]/page.tsx:78`). Needs `confirm("Archive matter? This cannot be undone.")` or dedicated `Archive` page/modal. Also page bypasses `archiveMatterAction` (which has `revalidate/redirect`) and calls service directly.
4. **Note edit/delete UI missing** — backend `updateMatterNote/deleteMatterNote` exists (`matter-note-service.ts`), but `MatterNotesList` only lists, no edit/delete buttons. Owner needs to correct a typo, member needs to delete own note.
5. **Document delete UI missing** — `deleteMatterDocument` service exists (`delete-matter-document.ts:8`) but `MatterDocumentsList` has only `Download` (`matter-documents-list.tsx:8`), no `Delete` (owner/admin or uploader on assigned).
6. **Form labels not associated + file input unlabeled + errors not `aria-describedby`** — `matter-form.tsx:32` `label` without `htmlFor`/`id`; `matter-upload-form.tsx:25` file input no label; errors `text-red-600` not `role=alert`/`aria-describedby`. Fix with `id="title"` + `<label htmlFor="title">` + `aria-describedby="title-error"` etc.
7. **Matter table missing readiness indicator + no status filter** — V1 spec §14 requires readiness indicator; dashboard has `awaitingDocuments` but table shows only `status` badge. Add `Required: 2/3 verified` or `Awaiting` badge and `?status=open` filter (like NoticeFlow `?status=`) — without it, a firm with 20 matters cannot find “what is ready to file”.

### P2 — V1.1 improvement (should be next after launch, not blocking)

8. No breadcrumb/back link on `new/detail/edit` (`← Matters`).
9. Deadline not emphasized (no `OVERDUE`/`DUE IN` as NoticeFlow does) and `next_action_date` not highlighted.
10. Upload UX is single file input + dropdown; no per-checklist-row “Upload” affordance, no drag-drop.
11. Checklist no progress header (`2/4 required verified`) and no “Ready when all required verified” hint.
12. Activity `metadata` rendered as raw `JSON.stringify` — should be humanized (`Checklist item Vakalatnama verified`).
13. Status badge no color semantics (`open` gray vs `ready` green vs `archived` muted).
14. `MatterForm` shows `assigned_to` as `user_id.slice(0,8) (role)` when `email` missing — should fallback to `name` or show `Unassigned` differently.
15. `MattersTable` `assigned_to` shows `id.slice(0,8)` — same, should show member name via `membersMap` (like notices could).
16. Dashboard `Open/Awaiting/Ready/Overdue` cards have no filtered links (e.g., `awaiting` → `/app/matters?status=open&ready=false`).
17. Detail page does 8 sequential queries — can be `Promise.all` for checklist/documents/notes/activity.
18. Focus states on inputs could add `focus-visible:ring`.
19. Touch targets `h-9` (36px) — increase to `h-10` for 40px+.

### V2 — Future scope (explicitly deferred, not a gap)

- Search `q` (title/client), type `civil…other` filter, assigned filter, deadline range filter, pagination (generic), CSV export — all Phase 2 per spec §14 “pagination only if needed” and spec “DO NOT implement CSV export”.
- Magic upload links `matter_upload_tokens`, OCR/AI/translation, eCourts/CNR/hearing calendar/packs, billing, legal research, WhatsApp/SMS/email automation, client portal, public marketing `/profession/lawyers`, `/tools/mattervault`.
- Per-checklist `required` toggle by user, admin-configurable templates (spec forbids: “Do NOT create a database template engine”).

### NO ACTION — Acceptable/intended

- No pagination on list (correct per spec for Phase 1).
- No CSV (out of scope).
- `matter_type` immutable after creation (intended `16A`).
- Mobile horizontal scroll table (parity with NoticeFlow).
- Dashboard is not role-specific (firm-wide counts are intended).

---

## 15. V1 Required Fixes

**7 items, each ≤1 day, no migration, no new tables, no NoticeFlow change.** Do these, then re-run `typecheck/lint/test/build + manual smoke (member vs owner in two browsers)` and V1 is sellable for pilot:

1. **Gate UI by role** — pass `role` + `matter.assigned_to` to `MatterForm`/`MattersTable`/`MatterUploadForm`/`MatterNoteForm` and hide `New matter`/`Edit`/`Archive`/`Upload`/`Note` when `canCreateMatter`/`canEditMatter`/`canUploadToMatter`/`canCreateMatterNote` is false; show `Assigned member only` hint.
2. **Fix Checklist Verify/Reject** — static `import { verifyChecklistAction, rejectChecklistAction } from "../actions/verify-checklist"` at top of `checklist.tsx`, add `useActionState`-like pending/error/success, or at minimum `formAction` with `error` banner.
3. **Archive confirm + use action** — replace inline `form action={"use server" import archiveMatterForCurrentFirm}` with `import { archiveMatterAction } from "@/modules/matter/actions/archive-matter"` and add `onSubmit={e=>!confirm('Archive matter?') && e.preventDefault()}` (or a small `ArchiveDialog`).
4. **Add note edit/delete UI** — `MatterNotesList` gets `Edit` (inline textarea) + `Delete` (confirm) for `canEditMatterNote`/`canDeleteMatterNote`, wired to `updateMatterNoteAction`/`deleteMatterNoteAction`.
5. **Add document delete UI** — `MatterDocumentsList` gets `Delete` for `canUploadToMatter` owner or uploader, calling `deleteMatterDocument` service/action.
6. **Associate labels + a11y** — add `id="title"` etc., `<label htmlFor="title">`, `aria-describedby="title-error"` + `role="alert"` on errors, `aria-label="Upload document"` on file input.
7. **Add readiness + status filter** — matters table column `Required 2/3` or badge `Awaiting docs` (compute `requiredCount/verifiedCount` per matter via `checklist_items` in `listMatters` or join), plus `?status=open|ready|archived` filter links/dropdown (reuse NoticeFlow `notice-filter-schema.ts` pattern, no generic abstraction).

After fixes, V1 is **pilot-ready** (1–2 firms, ≤30 matters, trained owner). Not yet self-serve at scale — that is V1.1.

---

## 16. V1.1 Candidates

Pick 3–4 after first week of real use:

- `?q` title/client search + `?status` filter + readiness column (if not done in P1).
- Back link `← Matters` + breadcrumb `Matters / Matter Title` on detail/edit.
- Deadline `OVERDUE 3 days` styling + `next_action` overdue highlight (copy NoticeFlow’s `response_deadline` logic).
- Activity humanization (`document_verified` → `Vakalatnama verified by Akash`).
- Status badge colors.
- `Promise.all` for detail queries.
- `View matters` filtered links from dashboard cards.

---

## 17. V2 Candidates

Per spec “DO NOT implement” list — all correctly deferred:

- Magic upload links `matter_upload_tokens` (client portal without login)
- OCR / AI / translation
- eCourts / CNR integration
- Hearing calendar / hearing packs
- Billing / legal research
- WhatsApp / SMS / email automation
- Client portal
- CSV export (now generic pagination + export)
- Public marketing `microtools.ts` `lawyers` + `/profession/lawyers` + `/tools/mattervault`

---

## 18. Explicitly Out of Scope

**In this audit, do not:** redesign, implement fixes, add pagination abstraction, add CSV, add magic links, add OCR/AI/eCourts, add marketing, start Phase 2, modify migrations, alter `proxy.ts`/`NoticeFlow`. Audit only.

Also **not required for V1:** generic pagination abstraction (spec forbids), generic repository/service, `DashboardEngine`, `AnalyticsEngine`, `utils/helpers/engine/workflow/events` folders.

---

## 19. Final V1 Readiness Statement

**Security:** **Production verified PASS (8/8).**

**Product:** **NOT YET COMMERCIALLY READY without the 7 P1 fixes above.**

Current V1 is **secure, domain-clean, and functionally complete enough for a supervised pilot** (owner creates, member uploads, owner verifies → ready, notes/activity work). It is **not yet coherent for unsupervised paying users** because the UI presents forbidden actions to members, hides no-op feedback on verify/reject, lacks note/document delete, and has no readiness/status discovery — all of which would create immediate support load and erode trust in the “ready to file” promise.

**No score, no “ready” claim by security alone** (per §19). After the 7 P1 fixes (estimated 4–6 hours total) and a **2-browser manual smoke** (owner vs member, upload to assigned vs unassigned, verify → ready, archive, note edit/delete), MatterVault V1 will be **commercially pilot-ready**.

**NoticeFlow remains protected:** No `matter_id` on `notices/documents/notes/activity_log`, no `notice-documents` bucket change, no NoticeFlow RLS/route change, E2E 12/12 green.

---

## 20. Recommended Next RCCF

**RCCF-LAWYER-07 — MATTERVAULT V1 P1 POLISH (no new tables, no marketing, no Phase 2).**

**Scope (7 items only, in order):**

1. `src/app/app/matters/page.tsx` + `src/modules/matter/components/matter-form.tsx` — gate `New matter` link + form by `canCreateMatter(role)`; gate `Edit` + `Archive` + `Upload`/`Note` by `canEditMatter`/`canArchiveMatter`/`canUploadToMatter`.
2. `src/modules/matter/components/checklist.tsx` — static import of `verifyChecklistAction/rejectChecklistAction`, add pending/disabled + error/success banner.
3. `src/app/app/matters/[matterId]/page.tsx:78` — replace inline archive `form` with `archiveMatterAction`, add `confirm`.
4. `src/modules/matter/components/matter-notes-list.tsx` + `matter-note-form.tsx` — add Edit/Delete UI wired to existing `updateMatterNoteAction/deleteMatterNoteAction` with `canEditMatterNote` gate.
5. `src/modules/matter/components/matter-documents-list.tsx` — add Delete for `canUploadToMatter` or uploader, wired to `deleteMatterDocument` service/action.
6. `src/modules/matter/components/matter-form.tsx` + `matter-upload-form.tsx` — `htmlFor`/`id` + `aria-describedby`/`role=alert` + file `aria-label`.
7. `src/modules/matter/services/list-matters.ts` + `src/modules/matter/components/matters-table.tsx` — add `required/verified` counts per matter (join or batched `checklist_items` query), render `Awaiting docs`/`Ready` badge + `?status=` filter (reuse `notice-filter-schema.ts` shape, no generic).

**Acceptance:** `pnpm typecheck/lint/test/build` green, Playwright smoke 12/12 + **new 2-browser MatterVault smoke** (create as owner → visible to member, member upload only assigned → owner verify → ready → archive → note edit/delete) **without touching NoticeFlow tests**. No migration, no `microtools.ts`, no Phase 2.

**Do not start V2** (magic links/OCR/eCourts/hearing/billing) until V1 P1 polish is merged and tagged.

