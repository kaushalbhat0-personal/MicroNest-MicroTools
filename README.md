# NoticeFlow — CA Notice Workflow

> **Notice workflow management for CA firms.** Solo CAs and small firms track tax/GST notices from receipt through closure without spreadsheets.

**Status: Phase 0 — Bootstrap complete.** Infrastructure + tooling only. No auth, tenancy, or business domain yet.

---

## What NoticeFlow Is

A focused notice lifecycle tool: `RECEIVED → REVIEW → ASSIGNED? → AWAITING_CLIENT? → DRAFTING → INTERNAL_REVIEW → READY_TO_SUBMIT → SUBMITTED → FOLLOW_UP → CLOSED`. Solo path `REVIEW→DRAFTING` works without assignment.

**Is NOT:** tax advisor, filing system, AI, OCR, WhatsApp/SMS, government portal automation.

## Phase 0 Scope

- Next.js 16 App Router + React 19 + TypeScript strict + Tailwind 4 + shadcn
- Supabase foundations (`supabase-client/server/middleware/service`) — no business tables yet
- Shared kernel `src/modules/core/shared` (errors/response/types)
- Minimal shell at `/` + testing harness (Vitest + Playwright)
- `supabase/config.toml` placeholder (no migrations)

Phase 1+ will add: auth, firms/firm_members, RLS, RBAC, clients, notices, documents, notes, activity.

## Local Setup

```sh
cp .env.example .env.local   # fill from Supabase dashboard
pnpm install
pnpm dev      # http://localhost:3000
```

Requires `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server-only).

## Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Next dev server |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint (next core-web-vitals) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Vitest smoke |
| `pnpm test:e2e` | Playwright smoke |
| `pnpm test:e2e:list` | List E2E specs |

## Architecture Overview

```
User → Vercel Hobby (Next.js, proxy.ts session refresh)
       → Supabase Auth → Supabase Postgres (RLS Phase 1+)
                      → Supabase Storage private (Phase 3, service_role)
```

Vertical slices: `src/modules/core` (kernel) + future `firm/client/notice/document/activity`. Infrastructure: `src/infrastructure/database`. Security: server-side ownership checks, RLS default-deny (Phase 1), private bucket + signed URLs (Phase 3).

## Important Security Boundary (Phase 0)

- `SUPABASE_SERVICE_ROLE_KEY` lives only in `src/infrastructure/database/supabase-service.ts` — never imported from client components.
- No RLS/auth guard yet — Phase 1 will add.
- No business endpoint exists to bypass.

## Non-Goals (Current)

Auth flows, tenancy, RLS, RBAC, clients/notices/documents/activity, billing, email, AI/OCR, government APIs.
