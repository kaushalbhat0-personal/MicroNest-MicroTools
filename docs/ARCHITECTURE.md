# NoticeFlow — Architecture Constitution

> **Goal: a junior developer understands the codebase in one glance.**
> Folder names, file names, and file locations must answer *where does this live?* without reverse-engineering.

This constitution is **law for Phase 1+**. Phase 0 implements only the foundations below; business domains arrive later without breaking these rules.

---

## 1. Overview

```
User → Vercel Hobby (Next.js 16 App Router, proxy.ts) → Supabase Auth/Postgres/Storage (RLS)
```

* **Thin entry points** compose; **domain modules** own business rules; **infrastructure** owns Supabase wiring; **shared** stays small.
* Vertical slices: `core` (kernel) → `firm` → `client` → `notice` → `document`/`activity`. No generic platform.

---

## 2. Folder Ownership

| Path | Owns | May NOT contain |
|------|------|-----------------|
| `src/app/` | Routes, layouts, **thin** `page.tsx`/`route.ts` that compose modules | DB queries, business rules, validation impl |
| `src/proxy.ts` | Session refresh now; firm/role gate Phase 1 | Business domain logic |
| `src/components/ui/` | Reusable presentational primitives (`button`, `badge`) | Domain-specific UI, DB calls |
| `src/infrastructure/database/` | Supabase client creation only (`supabase-client`, `supabase-server`, `supabase-middleware`, `supabase-service`) | Repositories, permissions, schemas |
| `src/lib/` | **Genuinely shared** tiny helpers (`cn`, `env` placeholder) | Domain logic, `notice-helpers` |
| `src/modules/core/shared/` | Cross-cutting primitives (`errors.ts`, `response.ts`, `types.ts` UUID/Pagination) | Firm/notice/client concepts |
| `src/modules/{firm,client,notice,document,activity}/` *(Phase 1+)* | **One domain** — its services, repos, schemas, permissions, components | Other domain's code |
| `supabase/` | `config.toml` + `migrations/` | Business logic |
| `e2e/` | Playwright smoke (Phase 0) → lifecycle/security Phase 5 | Unit helpers |
| `docs/` | `ARCHITECTURE.md` (this file), `architecture/system-design.md` | Code |

If you cannot tell where a file belongs from this table, the name/location is wrong.

---

## 3. Module Boundaries

* `core/shared` — zero deps on other modules.
* Each business module owns its slice; may read another module's **public** API, never its internals.
* No circular imports. Dependency flows **downward** (see §4).

---

## 4. Dependency Direction

```
UI (app/*, components/*)
  ↓
Actions / Application Flow (page.tsx, route.ts, actions.ts — thin composition)
  ↓
Domain Services (notice-service.ts — business rules)
  ↓
Repositories (notice-repository.ts — DB queries)
  ↓
Infrastructure (supabase-client/server/service)
```

Cross-cutting (`errors`, `utils`) may be used anywhere. Never invert.

---

## 5. File Responsibility — One Reason to Change

| File | One responsibility | Example |
|------|--------------------|---------|
| `*-schema.ts` | Zod validation only | `notice-schema.ts` |
| `*-permissions.ts` | Who may do what, tenant checks | `notice-permissions.ts` |
| `*-repository.ts` | Supabase queries for that domain | `notice-repository.ts` |
| `*-service.ts` | Business rules, status transitions | `notice-service.ts` / `notice-status.ts` |
| `*-types.ts` | Domain types, no logic | `notice-types.ts` |
| `components/*` | Rendering + local UI state | `notice-card.tsx` |
| `actions.ts` | Thin orchestration: auth → validate → service → response | `actions.ts` |
| `route.ts` | Thin handler: auth → validate → repo/service → response | `route.ts` |

Avoid `utils.ts`, `helpers.ts`, `common.ts`, `manager.ts` unless genuinely generic.

---

## 6. Thin Entry-Point Rule

**Entry files answer *WHAT happens here?* — not *HOW everything works?***

* `page.tsx`: 1) obtain required data 2) call domain operation 3) compose UI. No 200-line queries.
* `actions.ts`: 1) authenticate 2) validate input 3) call `service`/`repository` 4) return. Business rules live in `*-service.ts`/`*-status.ts`.
* `route.ts`/`proxy.ts`: same — delegate immediately.

**Enforcement:** if `page.tsx`/`actions.ts` imports `supabase` directly for business queries, or contains validation impl, split it.

---

## 7. Database Access

* Supabase client creation lives **only** in `src/infrastructure/database/` (4 files). Everywhere else imports from there.
* Repositories (`*-repository.ts`) are the **only** place that calls `.from()`, `.select()`, `.insert()`.
* Do not mix client creation, SQL, business rules, and UI in one file.

---

## 8. Authorization Placement

* Authorization lives in clearly named `*-permissions.ts` (or `permissions.ts` inside the module). Example: `notice-permissions.ts` → `canTransition()`, `canMutateNotice()`, `isFirmMember()`.
* `proxy.ts` + `actions.ts`/`route.ts` call the permission module — never hide checks inside a UI component.
* Server-side enforcement only. Client may hide UI, but security does not depend on it.

---

## 9. Validation Placement

* Zod schemas live in `*-schema.ts` per domain. `actions.ts`/`route.ts` import and `safeParse` them.
* Never bury schemas inside giant `actions.ts` or `page.tsx`.

---

## 10. UI / Business Logic Separation

* Components handle rendering, interaction, presentation state.
* `notice-status.ts`/`notice-service.ts` handle transitions, deadline math, assignment rules.
* A component that computes `isOverdue` inline should import it from the domain service instead.

---

## 11. Shared Code — Only When Truly Shared

`src/lib/` and `src/modules/core/shared/` are for code **multiple domains need**. Domain-specific code stays in its module even if convenient to put in `lib/`. When in doubt, keep it in the domain — extract later when second consumer appears.

---

## 12. Naming Conventions

Prefer explicit: `notice-service.ts`, `notice-repository.ts`, `notice-permissions.ts`, `notice-schema.ts`, `notice-status.ts`, `notice-types.ts`, `client-card.tsx`.

Avoid vague: `utils.ts` (except `src/lib/utils.ts` for `cn`), `helpers.ts`, `misc.ts`, `manager.ts`.

Magic strings for states → `constants.ts` or `types.ts` per domain.

---

## 13. Anti-Patterns — Prohibited

* God components / God `actions.ts` / God `repository.ts` / 500-line `page.tsx`
* `generic utils` dumping ground, business logic inside `lib/`
* DB queries scattered in UI, authorization hidden in presentation
* `utils.ts` containing unrelated responsibilities, `helpers.ts` per domain
* Cross-domain imports without reason, circular deps
* Premature abstraction: generic repositories, `StorageProvider`, workflow engines before second use-case
* Duplicate business rules / copy-pasted `isFirmMember` checks
* Unexplained folders, files whose purpose is not inferable from name

---

## 14. Example Future Feature — Conceptual Only

> Do **not** create these directories in Phase 0. Shown to illustrate §5–§12.

```
src/modules/notice/              # Phase 3 — example, not yet created
├── components/
│   ├── notice-card.tsx          # rendering
│   └── notice-timeline.tsx
├── actions/
│   └── actions.ts               # thin: auth → validate → service → response
├── services/
│   ├── notice-service.ts        # business rules
│   └── notice-status.ts         # canTransition() pure
├── repositories/
│   └── notice-repository.ts     # Supabase queries
├── schemas/
│   └── notice-schema.ts         # Zod
├── permissions/
│   └── notice-permissions.ts    # canMutate, tenant checks
├── types/
│   └── notice-types.ts
└── constants/
    └── notice-constants.ts
```

Phase 1 (`firm`) and Phase 2 (`client`) follow the same shape.

---

## 15. Junior Navigation Guide

* **Where is auth?** `src/proxy.ts` + `src/infrastructure/database/*` now; `src/modules/core` untouched; Phase 1 → `src/modules/firm/` (or `auth` slice) — not `lib/`.
* **Where does firm/tenant logic live?** Future `src/modules/firm/{services,repositories,permissions,schemas}` — tenant checks never in UI.
* **Where do notices live?** Future `src/modules/notice/` — see §14.
* **Where is validation?** `*-schema.ts` next to its domain.
* **Where are business rules?** `*-service.ts` / `*-status.ts`.
* **Where are DB queries?** `*-repository.ts` inside the owning module, using `src/infrastructure/database/*`.
* **Where are server actions?** `actions/actions.ts` inside each module; routes under `src/app/*/route.ts` thin.
* **Where is authorization?** `*-permissions.ts` per domain + `proxy.ts` gate.
* **Where is Supabase infra?** `src/infrastructure/database/` only.
* **Where are shared utilities?** `src/lib/utils.ts` (`cn`) and `src/modules/core/shared/{errors,response,types}`.

If you answer these by reading the tree, the architecture succeeded.

---

## 16. Enforcement

* Reviewers reject PRs that add `utils/helpers` per domain, 300-line `page.tsx`, or DB calls in components.
* No `any`, `eslint-disable`, `ts-ignore` without documented justification.
* `pnpm typecheck && pnpm lint && pnpm test && pnpm build && pnpm test:e2e:list && pnpm audit` must stay green.
