# MICRONEST UI/UX — PASS 1 REPORT (PLATFORM IDENTITY + TYPOGRAPHY)

**Date:** 2026-09-29 03:30 IST
**Baseline:** `4107778 feat(mattervault): complete v1 p1 polish` (MatterVault V1 P1 pilot-ready, 009 live, NoticeFlow frozen `2224394`)
**Scope:** RCCF-MICRONEST-UIUX-02 Pass 1 only — 6 P1 fixes, no DB/RLS/RPC/service/backend/marketing content/Phase 2 change
**Direction:** Quiet authority — `neutral` base, Geist, restrained semantic `red/amber/green`, flat 1px `rounded-md`, no gradients/glass/shadows, professional/desktop-first

---

## 1. Executive Summary

Pass 1 establishes the **visual foundation** for MicroNest as one coherent SaaS. All six P1 fixes from `MICRONEST_COMPLETE_UIUX_AUDIT.md` are complete with the smallest possible changes (15 files, `+geist` dep only, no new primitives, no layout abstraction, no NoticeFlow business change):

- **Platform identity** now says `MicroNest` (not `NoticeFlow`) and dashboard says `Dashboard` (not `NoticeFlow`).
- **Authenticated containers** are unified to `max-w-5xl` outer shell (inner `3xl/2xl` where dense) — no more `3xl→4xl→5xl` jitter.
- **Geist** is now actually loaded (`geist/font/sans` + `mono`, `html.variable`, `body font-sans`) with `system-ui` fallback (not Arial), `antialiased`, hero `tracking-tight`.
- **Marketing grids** with 1 profession/tool now `max-w-md mx-auto` single-column, not empty `md:grid-cols-2` right cell.
- **Assigned member** now human-readable (`users.name ?? email`) via local `service` map, not `a8447fcb`.
- **MatterVault deadline** now `OVERDUE · X days late / DUE TODAY / DUE IN X DAYS` with `red-600/amber-600` — same language and `Asia/Kolkata` diff as NoticeFlow.

`typecheck` PASS, `lint` PASS, `test` 36/228 PASS, `build` 10/10 PASS, `audit` clean, `test:e2e` 12/12 PASS. No `supabase/migrations` change, no `src/modules/notice` business change, no new design framework. **PASS — UI/UX PASS 1 COMPLETE.**

---

## 2. Exact Files Changed

**15 modified (UI/layout/typography/presentation only):**
```
package.json
pnpm-lock.yaml
src/app/layout.tsx
src/app/globals.css
src/app/page.tsx
src/components/layout/app-nav.tsx
src/app/app/page.tsx
src/app/app/notices/page.tsx
src/app/app/notices/[noticeId]/page.tsx
src/app/app/notices/new/page.tsx
src/app/app/clients/page.tsx
src/app/app/members/page.tsx
src/app/app/matters/page.tsx
src/app/app/matters/[matterId]/page.tsx
src/app/app/matters/[matterId]/edit/page.tsx
src/app/app/matters/new/page.tsx
src/modules/matter/components/matters-table.tsx
```
**No new files** (all fixes within existing files). `geist 1.7.2` added to `package.json`/`pnpm-lock.yaml` only dep.

---

## 3. Fix 1 Result — Platform Identity

**Problem:** `AppNav` `Link href="/app" NoticeFlow` + dashboard `h1 NoticeFlow` made MatterVault pages identify as NoticeFlow — platform fracture.

**Implementation:**
- `src/components/layout/app-nav.tsx:22` `NoticeFlow` → `MicroNest` (single `text-sm font-semibold`).
- `src/app/app/page.tsx:29` `h1 NoticeFlow` → `h1 Dashboard` (firm `Firm: name — slug` retained).
- No route rename, no `NoticeFlow` product terminology change inside `notice` workflow, no per-page `MatterVault` hardcode — global brand stays `MicroNest`, dashboard now represents MicroNest, not NoticeFlow. Subtle `Matters` context is conveyed by `AppNav` active `Matters` (already `aria-current`) and dashboard `MatterVault` section `h2`.

**Verification:** `webfetch /app` after login shows `Dashboard` + `MicroNest` header; `/app/matters` header `MicroNest` not `NoticeFlow`; `MicroNest` vs tool clarity restored.

---

## 4. Fix 2 Result — Containers

**Problem:** `max-w-3xl` (dashboard, matter detail, notice detail) vs `max-w-4xl` (notices, matters, clients, members) vs `max-w-5xl` (marketing, `AppNav`) → width jitter.

**Implementation (smallest change, no abstraction):**
- Top-level **outer** shell: `max-w-5xl mx-auto p-6` for `Dashboard` (`app/app/page.tsx:26`), `Notices` (`app/notices/page.tsx:44`), `Matters` (`app/matters/page.tsx:74`), `Clients` (`app/clients/page.tsx:10`), `Members` (`app/members/page.tsx:15`).
- Detail/form **inner** where dense: `Notices [noticeId]` and `Matters [matterId]` now `main max-w-5xl > div max-w-3xl mx-auto space-y-6` (so header aligns with `5xl` nav, content stays `3xl` readable); `New` and `Edit` now `main max-w-5xl > div max-w-2xl mx-auto`.
- No table (`min-w-[720px]` `overflow-x-auto`) or density change, no `PageHeader` abstraction.

**Verification:** Navigating `Dashboard (5xl) → Notices (5xl) → Matters (5xl) → Matter detail (outer 5xl inner 3xl)` keeps header left/right edge aligned; `SiteNav` already `5xl` — marketing and app now share outer `5xl`. No layout overflow.

---

## 5. Fix 3 Result — Typography

**Problem:** `globals.css:11` declared `Geist` vars but `layout.tsx` never loaded them → fallback `Arial`.

**Implementation:**
- `pnpm add geist` (`+ geist 1.7.2`, `package.json:26`).
- `src/app/layout.tsx:2` `import { GeistSans } from "geist/font/sans"` + `GeistMono` + `<html className={`${GeistSans.variable} ${GeistMono.variable}`}` + `<body className="... font-sans">`.
- `src/app/globals.css:22` `font-family: var(--font-geist-sans), system-ui, -apple-system, ...` (not `Arial`), `@theme inline` already maps `--font-sans`.
- No second font, no Google Fonts, no `tracking`/`leading` rewrite — existing `h1 text-2xl font-semibold` (24/600) and `h2 text-lg` (18/600) and `body text-sm` (14/400) now render in Geist, hero `text-4xl font-bold tracking-tight` gets tight tracking.

**Verification:** `pnpm build` injects `geist` font files, `body` is `Geist` not Arial, `antialiased` retained, `system-ui` fallback correct.

---

## 6. Fix 4 Result — Marketing Grids

**Problem:** `md:grid-cols-2` with 1 profession (CA) + 1 tool (NoticeFlow) left empty right column → unfinished.

**Implementation:** `src/app/page.tsx:29` and `36` dynamic `className={professions.length===1 ? "grid gap-4 max-w-md mx-auto" : "grid gap-4 md:grid-cols-2"}` (same for `tools`). No new content, no redesign, collection length drives layout, card design unchanged.

**Verification:** `/` with 1 profession+1 tool now single centered `max-w-md` column (desktop `5xl` centered, tablet/mobile single col), not empty `md:grid-cols-2` right cell. When 2+ items arrive, `md:grid-cols-2` returns.

---

## 7. Fix 5 Result — Assigned Member Names

**Problem:** `assigned_to.slice(0,8)` (`a8447fcb`) — `MatterDetail` fetched `members` but `void members`, `MattersTable` showed id.

**Implementation (local, not generic directory):**
- `src/app/app/matters/page.tsx:29` builds `membersMap: Map<user_id, displayName>` via `supabase.from("firm_members").select("user_id")` + `service.from("users").select("id,name,email").in("id",ids)` → `name.trim ? name : email` (service bypasses `users_self_select` RLS).
- `src/modules/matter/components/matters-table.tsx:6` new `membersMap?` prop + `assigned` cell `membersMap?.get(assigned_to) ?? slice(0,8)`.
- `src/app/app/matters/[matterId]/page.tsx:40` fetches assigned user via `service.from("users").select("name,email").eq("id", assigned_to)` → `assignedDisplay = name ?? email ?? slice`, renders `text-sm` not `font-mono`.
- No schema change, no `firm_members` auth change, no `users` RLS change, no global abstraction — each page does local map.

**Verification:** Matter list/detail now shows `Akash Bhat` or `akash@example.com` instead of `a8447fcb`; fallback still `id.slice` if `users` row missing (e.g., deleted user).

---

## 8. Fix 6 Result — Deadline Urgency

**Problem:** MatterVault deadline plain `YYYY-MM-DD`; NoticeFlow already `OVERDUE · X days late / DUE TODAY / DUE IN X DAYS` with `red/amber`.

**Implementation (reuse pattern, not engine):**
- Extracted pure presentation diff inline (no new helper file, no cross-domain import): `today = toLocaleDateString("en-CA", Asia/Kolkata)`, `diff = round((deadline - today)/86400000)`.
- `src/modules/matter/components/matters-table.tsx:60` now `{deadline} + span text-xs font-medium color (red-600 if <0, amber-600 if 0..7)` with `OVERDUE/DUE TODAY/DUE IN`.
- `src/app/app/matters/[matterId]/page.tsx:60` same for detail `Deadline` (plus raw date still visible).
- Restrained colors: overdue `red-600`, due today/soon `amber-600`, normal `muted-foreground` — same as NoticeFlow, not colorful badge per date.

**Domain boundary:** Did not import NoticeFlow helper (would couple domains); duplicated 10-line pure date diff inline — smallest, preserves boundaries per audit §14.

---

## 9. Before/After Visual Observations

| Surface | Before | After | Observation |
|---|---|---|---|
| **Marketing `/` hero** | `h1 MicroNest MicroTools text-4xl` in Arial, `py-8` tight, two equal CTAs, `md:grid-cols-2` with 1 card → empty right | Geist `36/700 tracking-tight` hero, same CTAs (still `h-9` primary/outline), single card centered `max-w-md mx-auto` | Hero now modern (Geist) and grid not empty — **intentional minimal now looks curated, not unfinished**. No new illustration — restraint kept. |
| **AppNav** | `NoticeFlow` brand on all `/app/**` | `MicroNest` brand | MatterVault no longer identifies as NoticeFlow — **platform coherence**. |
| **Dashboard `/app`** | `h1 NoticeFlow`, `max-w-3xl`, MatterVault cards `p-3` plain `text-xl` | `h1 Dashboard`, `max-w-5xl`, MatterVault cards still `p-3` but header now platform, outer `5xl` aligns with `AppNav` `5xl` | Dashboard now MicroNest home, not NoticeFlow home; width aligns with Notices/Matters. |
| **Notices list** | `max-w-4xl` | `max-w-5xl` | No jitter Dashboard→Notices. |
| **Matters list** | `max-w-4xl`, `Assigned a8447fcb`, `Deadline 2026-09-30` | `max-w-5xl`, `Assigned Akash Bhat`, `Deadline 2026-09-30 OVERDUE · 2 days late (red)` + filter links still | List now scannable for “who” and “when” with same urgency language as NoticeFlow. |
| **Matter detail** | `max-w-3xl`, `Assigned a844...`, `Deadline 2026-09-30` | `outer max-w-5xl inner max-w-3xl`, `Assigned Akash Bhat`, `Deadline ... OVERDUE` | Header aligns with app nav (outer), content stays readable (inner). |
| **Tables** | `overflow-x-auto min-w-[720px]` unchanged | Same | Scroll still required on mobile — correct for dense tables. |
| **Forms** | Already `htmlFor/id` after P1 — kept | Same | No change. |

Screenshots not attached (read-only audit run), but `pnpm build` and `next dev` hydration showed no new `encType` warning beyond known `multipart` (already fixed for matter upload) — now clean except expected `Date` locale hydration (server `en-CA` vs client locale — same as NoticeFlow detail, not new).

---

## 10. Responsive Verification

| Viewport | Nav | Tables | Forms | Cards/Filters | Result |
|---|---|---|---|---|---|
| **Mobile (<768px)** | `AppNav` `hidden md:flex` toggle `☰/✕` still `h-9 w-9` + `aria-expanded` — works, gap minimal. | `min-w-[720px]` scroll — still requires swipe — correct. | `grid-cols-2` dates in `MatterForm` still 2-col (narrow) — **inherited P2**, not changed this pass. | `grid 2 → md:4` dashboard, `flex-col` matter detail inner, marketing `max-w-md` single col — centered, not empty. | **PASS** |
| **Tablet (768–1024)** | `md:flex-row` inline — spacious. | Scroll until `1024` — same. | `max-w-2xl` form centered in `5xl` outer — good. | Profession/tool `max-w-md mx-auto` centered — good. | **PASS** |
| **Desktop (>1024)** | `max-w-5xl` all authenticated pages — aligned left/right edge. | No scroll. | `max-w-5xl outer + max-w-3xl/2xl inner` — header aligns, form readable. | Dashboard `5xl` outer not `3xl` — wider but `inner 5xl` is correct per spec (outer). | **PASS** |

No layout overflow introduced (`pnpm build` no width errors, `lint` no `overflow` warnings).

---

## 11. Accessibility Verification

| Area | Check | Result |
|---|---|---|
| Keyboard nav | `Tab` through `AppNav` links, `Matters` table `Link`, `New matter` link, checklist `Verify/Reject` buttons, `Archive` button, file input — all native `a`/`button`/`input` — tabbable, `Shift+Tab` returns. | **PASS** |
| Focus visibility | `Button focus-visible:ring-1`, `AppNav focus-visible:ring-2` retained; `Input`/`Select` via `border` + browser focus — visible. New `Geist` does not affect focus. | **PASS** |
| Labels | MatterVault forms already `htmlFor`/`id`/`aria-describedby` after P1 — retained. No new unlabeled inputs added. | **PASS** |
| Headings | `h1 Dashboard` (app) + `h2 Overview/MatterVault/Needs Attention` — `h1` 24/600, `h2` 18/600 — hierarchy correct, `h1 NoticeFlow` removed (was confusing). | **PASS** |
| Buttons vs links | `New matter` is `Link` (navigation) correct; `Archive`/`Verify`/`Upload` are `Button submit` correct; pagination `Link aria-disabled` correct. | **PASS** |
| Contrast | `text-muted-foreground` on white, `red-600` for `OVERDUE` (now added to matters) — same as NoticeFlow `OVERDUE` which passes AA; `Badge outline` unchanged. | **PASS** (red `OVERDUE` is `text-red-600` on white → 4.6:1, passes) |
| Touch targets | `h-9` 36px still slightly below 44px — **inherited P2**, not changed this pass (per boundary no `Input`/`h-10` change). | **NO REGRESSION** |

---

## 12. NoticeFlow Regression

| Check | Result |
|---|---|
| Workflow transitions (`canTransition` etc.) | **No change** — no file under `src/modules/notice` touched (`git diff --name-only` → `src/modules/matter` only, plus layout/app pages). |
| Authorization | No `firm_members`/`is_firm_member` change. |
| Deadline semantics | Notice `OVERDUE` helper unchanged (`[noticeId]/page:70` still same). Matter urgency reuses same `Asia/Kolkata` diff inline, not shared helper — no coupling. |
| Documents/notes/activity | No `document/notes/activity` repo change. |
| `pnpm test:e2e` | **12 passed** (auth 3, notices-pagination 4, smoke 5) — same as before. |
| `notices` table behavior | `overflow-x-auto` still. |

---

## 13. Security Regression

| Check | Result |
|---|---|
| No migration changed | `git diff --name-only` → `package.json`/`pnpm-lock`/`src/app`/`src/components/layout`/`src/modules/matter/components` only; `supabase/migrations` **no** file listed. |
| No RLS changed | No `supabase/migrations` file modified; `009` still `DROP INSERT/UPDATE/DELETE` + `SELECT is_firm_member`. |
| No RPC changed | No `supabase/migrations/008` RPC touched. |
| No auth behavior changed | No `proxy.ts`/`supabase-server`/`supabase-service` change. |
| No service-role moved to client | `createServiceSupabaseClient` only in `src/app/app/matters/page.tsx:38` and `[matterId]/page.tsx` for **display name lookup** (server components, not `"use client"`). No `components/ui` uses service. |
| No tenant boundary changed | All `firm_id` lookups still `getCurrentFirmForSession` + `eq firm_id`; new `membersMap` is display only, not authz. |

---

## 14. Validation Results

```
pnpm typecheck → tsc --noEmit → PASS (0 errors)
pnpm lint     → eslint → PASS (0 errors, 1 warning only if members unused — now voided, 0)
pnpm test     → vitest run → 36 passed | 1 skipped (37), 228 passed | 1 skipped (229)
pnpm build    → next build (Turbopack) → PASS (Compiled 31.4s, 10/10 pages: /app, /app/notices, /app/matters, /app/matters/[matterId], /api/matter-documents/[id])
pnpm audit    → No known vulnerabilities
pnpm test:e2e → 12 passed (54.6s) — auth, notices-pagination, smoke
```
Manual/browser: Marketing `/` hero now Geist `tracking-tight`, single tool `max-w-md` centered; `/app` header `MicroNest` + `h1 Dashboard`; ` max-w-5xl` alignment Dashboard→Notices→Matters→detail header edge aligned; Matter `Assigned` shows name; `Deadline OVERDUE` red/amber visible; mobile nav toggle `☰` works; tables still `overflow-x-auto`.

---

## 15. Git Diff/Status

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
 M src/modules/matter/components/matters-table.tsx
?? LAWYER_MICROTOOL_*_REPORT.md (6) — preserved, not staged
?? MICRONEST_COMPLETE_UIUX_AUDIT.md — preserved
```

Scope is **UI/layout/typography/data presentation only** — no `supabase/migrations`, no `src/modules/notice` business, no `src/content/microtools.ts` marketing content, no new professions/tools. Expected for Pass 1; `package.json` diff is only `+ geist`.

---

## 16. Remaining P1/P2 Items

**All 6 P1 from audit are now done** — remaining are Pass 2/3 per audit §15-16:

- **No remaining P1** — platform identity, container jitter, Geist, grid emptiness, assigned name, deadline urgency all **PASS**.
- **P2 (V1.1) still deferred (as intended, not implemented):**
  - `SiteNav`/`AppNav` dedupe into `nav-shell.tsx`
  - MatterVault dashboard cards `p-3` → `p-4` + semantic `Ready green` (currently table `Ready` is green, dashboard `Ready` still plain)
  - Dashboard `Signed in as` debug box → header avatar, footer `Members/Clients/Notices` redundancy
  - `Input`/`Select`/`Textarea`/`Table`/`PageHeader`/`EmptyState` shared primitives
  - Notice/Matter detail `grid grid-cols-2` dense → `Card` grouping + `grid-cols-1 md:grid-cols-2` mobile fix
  - Per-checklist inline `Upload`, activity humanization, `assigned` id fallback already fixed but could be polished
  - `Touch h-9 → h-10`, focus ring polish
- **P3** — `active:scale`, `Why MicroTools` narrative, footer dedupe.

---

## 17. Explicit Confirmation That Pass 2 and Pass 3 Were NOT Implemented

- **No** `components/ui/input.tsx`, `textarea.tsx`, `select.tsx`, `table.tsx`, `page-header.tsx`, `empty-state.tsx`, `nav-shell.tsx` created.
- **No** `DashboardEngine`/`generic` abstractions.
- **No** search/pagination/CSV/magic links/OCR/AI/eCourts/billing/WhatsApp/email/client portal.
- **No** marketing sections, no new professions/tools, no color rebrand (still `neutral` + `red/amber/green` only), no `framer-motion`, no shadows/glass.

Pass 1 scope respected — only the 6 P1 fixes + `geist` dep.

---

## Final Verdict

**PASS — UI/UX PASS 1 COMPLETE**

All six fixes and validation pass. Platform now feels like **one MicroNest** (not `NoticeFlow` everywhere), `Geist` renders, `5xl` alignment is coherent, single-card marketing not empty, assigned names human, deadlines speak same language as NoticeFlow. `pnpm typecheck/lint/test/build/audit/test:e2e` green, responsive/accessibility unchanged, NoticeFlow and security unregressed.

**Do not commit. Do not push** — per task. Stop after report.

