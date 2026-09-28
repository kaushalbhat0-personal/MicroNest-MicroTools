# NoticeFlow — System Design (Phase 0)

## Stack

Next.js 16 App Router → React 19 → TypeScript strict → Tailwind 4 + shadcn/Base UI
→ Supabase (Postgres + Auth + Storage, RLS) → Zod → Vitest (jsdom) → Playwright (chromium, workers=1)
→ Vercel Hobby (₹0 before first customer)

## Layout

```
src/
  app/                  # Next App Router — layout.tsx + page.tsx (placeholder /)
  proxy.ts              # Phase 0: session refresh only; Phase 1: firm/role gate
  infrastructure/
    database/           # supabase-client (browser anon), supabase-server (cookie), supabase-middleware (updateSession), supabase-service (service_role, server-only)
  modules/
    core/shared/        # AppError, successResponse/handleApiError, UserRole/Pagination — small kernel
    # Phase 1+: firm/, client/, notice/, document/, activity/
  lib/                  # utils (cn), env (placeholder)
  components/ui/        # button, badge (+ future shadcn)
supabase/
  config.toml           # local dev config (no business tables Phase 0)
  migrations/.gitkeep   # placeholder — 001_* arrives Phase 1
e2e/                    # smoke.spec.ts
docs/architecture/
```

## Vertical Slices

`core` has no deps; feature slices (`firm` → `client` → `notice` → `document/activity`) depend inward only. No generic `WorkflowEngine/NotificationEngine` — explicit `canTransition()` per domain.

## Server / Client Boundary

- Server: `supabase-server.ts` (RLS via session), `supabase-service.ts` (service_role, never client), Server Actions (future), Route Handlers (future).
- Client: `supabase-client.ts` (anon, RLS), UI components.
- `proxy.ts` refreshes `auth` cookies; Phase 1 adds firm membership check.

## Service-Role Boundary

`SUPABASE_SERVICE_ROLE_KEY` imported only via `supabase-service.ts`. ESLint/audit will flag any `"use client"` import of it. Phase 0 does not call it.

## Future RLS / Auth (Phase 1)

- Helpers `is_firm_member(uuid)`, `firm_role(uuid)` `SECURITY DEFINER set search_path=''`.
- Every tenant row carries `firm_id`; policies `using (is_firm_member(firm_id))`; `activity_log` insert = service_role only (no arbitrary client insert).
- Assignments optional; `MEMBER` mutates only own assigned notices; `OWNER/ADMIN` any firm notice.
- Private bucket `notice-documents` — RLS deny all client, service_role via Server Action + signed URL 60s.

## Testing

- Unit (Vitest): pure helpers, workflow guards.
- Integration: two-firm RLS fixture (FirmA → FirmB resource = denied).
- E2E (Playwright): smoke now; lifecycle + cross-tenant security Phase 5.

## ₹0 Constraint

Vercel Hobby + Supabase Free + no Resend/AI/Upstash V1. Upgrade only on real usage.

## Non-Goals

Business domain, migrations, RLS, RBAC, billing, email, AI/OCR, government APIs.
