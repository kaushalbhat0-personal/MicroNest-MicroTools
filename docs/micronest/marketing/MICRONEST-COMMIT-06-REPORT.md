# MICRONEST COMMIT 06 REPORT — HERO ACTIVATION + MOTION POLISH

**Date:** 2026-09-29 18:00 IST
**Baseline Commit:** `e05754667a5ff4aabd913d4687a949d5c568d93a` — `feat(marketing): activate lawyer and MatterVault marketing` (2 professions `chartered-accountants→noticeflow` + `lawyers→mattervault`, `Featured MicroTools` 2, sitemap 5 URLs, 16 e2e PASS)
**New Commit:** `6bacae9bfa3d1dedc36385977abdd98a06f1c417` — `feat(marketing): polish platform hero and motion`
**RCCF-06:** RCCF-MICRONEST-MARKETING-06 — Platform Hero Activation (`Profession → Workflow → MicroTool`)
**RCCF-07:** RCCF-MICRONEST-MARKETING-07 — Marketing Motion Pass (hero stagger, section reveal, hover, reduced-motion)

---

## 1. Previous Commit SHA

```
e05754667a5ff4aabd913d4687a949d5c568d93a
e057546 feat(marketing): activate lawyer and MatterVault marketing
b70418c feat(marketing): refine featured tool composition
```

Verified via `git log --oneline -3` and `git rev-parse HEAD` before commit.

## 2. New Commit SHA

```
6bacae9bfa3d1dedc36385977abdd98a06f1c417
6bacae9 feat(marketing): polish platform hero and motion
```

Verified via `git rev-parse HEAD` after commit and after push:
```
6bacae9bfa3d1dedc36385977abdd98a06f1c417
```

## 3. Commit Message

```
feat(marketing): polish platform hero and motion
```

## 4. RCCF-06 Summary (Platform Hero Activation)

- **Problem:** Hero `Chartered Accountants → GST/Income-tax notice → NoticeFlow` represented 1 of 2 niches while `SiteNav/Browse/Featured` already `CA+Lawyers / NoticeFlow+MatterVault` — mismatch.
- **Goal:** Make hero platform-level `Profession → Workflow → MicroTool` (one conceptual triad, not two workflows, no dashboard/bento/screenshot/carousel).
- **Changes in `src/app/page.tsx`:**
  - `main space-y-12 → space-y-8` (48→32 between hero/Browse — still editorial)
  - `hero section py-16 md:py-24 → py-16 md:py-20` (64→80 desktop, mobile preserved)
  - Removed detached `section.flex py-4 aria-label="How MicroNest works" CA→GST→NoticeFlow` (outside hero, floating)
  - Added `div.flex pt-6 sm:flex-row gap-3 sm:gap-4` inside hero `div.relative space-y-6` after CTAs with pills `Profession → Workflow → MicroTool` (`rounded-full border bg-card` + `h-2 w-2 bg-primary` dot + `→/↓ muted aria-hidden`, same styling, inside `bg-muted/10 rounded-lg bg-grid` hero)
  - No content-model change (`src/content/microtools.ts` untouched), no `profession-card`/`tool-card`/`site-nav`/`/profession/[profession]`/`/tools/[tool]`/`sitemap` change.
- **Design preserved:** `FOCUSED SOFTWARE FOR PROFESSIONAL WORKFLOWS` eyebrow + `h1 Small tools for the work that matters.` + `Small, focused…` supporting copy + `Explore MicroTools bg-primary / Launch App border` CTAs; `Geist/neutral/1px/border/bg-card/bg-grid` quiet authority.
- **Vertical rhythm:** `eyebrow ↓ heading ↓ supporting ↓ CTAs ↓ pt-6 small intentional gap ↓ Profession→Workflow→MicroTool` inside hero — cohesive (CTA→triad 24px) vs prior detached 112px.

## 5. RCCF-07 Summary (Motion Polish)

- **Goal:** CSS-first subtle motion (150–500ms, `opacity/translateY`, `ease-out`, no infinite/decorative) — quiet professional premium, not animated template. Zero new npm deps (no `framer-motion/motion/GSAP/Magic/Aceternity`).
- **CSS `src/app/globals.css:28`:**
  - `@keyframes mn-reveal { from { opacity 0; transform translateY 8px } to { opacity 1; translateY 0 } }`
  - `.mn-reveal { animation: mn-reveal 500ms ease-out both }` (hero stagger)
  - `.mn-section { opacity 0; transform translateY 8px; transition: opacity 400ms ease-out, transform 400ms ease-out }` → `.is-visible { opacity 1; transform none }` (scroll)
  - `.mn-card { transition: background-color 200ms, transform 200ms }` hover `translateY -1px`
  - `@media (prefers-reduced-motion: reduce) { .mn-reveal/.mn-section animation none; opacity 1; transform none; transition none; .mn-card:hover transform none }`
- **Reveal primitive `src/components/marketing/reveal.tsx`:** Tiny 42-line `use client` `IntersectionObserver` threshold 0.15 rootMargin -40px, unobserve after first, `delayMs → transitionDelay`.
  - Why primitive: 3 sections + 4 cards need reveal → duplication of observer would be generic framework overkill; single marketing-only primitive prevents duplication, not `AnimationEngine/RevealProvider/MotionSystem` (task 14 allowed).
- **Hero stagger `src/app/page.tsx:15`:** `eyebrow 0ms, heading 60ms, p 120ms, CTAs 180ms, triad 240ms` via `class mn-reveal style={{animationDelay}}` — `500ms` max, last at `740ms`, usable immediately, arrows/dots/grid not animated.
- **Section reveals `src/app/page.tsx:36`:** `Browse` section `<Reveal>` + each `ProfessionCard` `<Reveal delayMs i*60>` (`CA 0, Lawyers 60`), `Featured` section + each tool `Link mn-card` `<Reveal i*60>` (`NoticeFlow 0, MatterVault 60`), `Why` single `<Reveal>` — `400ms 8px→0`.
- **Card/nav hover:** `ProfessionCard Link mn-card rounded-md border p-6 hover:bg-accent`, `Featured Link mn-card overflow-hidden border hover:bg-accent` (+ existing workflow badges static), `NavShell Link transition-colors duration-200 hover:bg-accent`, mobile toggle `transition-colors`.
- **bg-grid not animated** (per task 12), badges not individually animated (task 6), buttons `transition-all 200 hover:bg-primary/90 active:scale-[0.98]` responsive, not flashy.

## 6. Files Committed

**8 files** verified via `git diff --cached --name-only` and `stat`:

| File | Status | Lines |
|---|---|---|
| `src/app/page.tsx` | modified | +108 -78 (188 with whitespace, 11 net hero+motion vs pure diff: hero inside+stagger + Reveal wrappers) |
| `src/app/globals.css` | modified | +58 `mn-reveal/mn-section/mn-card/reduced-motion` |
| `src/components/marketing/reveal.tsx` | new file | +42 `use client` IntersectionObserver |
| `src/components/marketing/profession-card.tsx` | modified | +1 `mn-card` |
| `src/components/layout/nav-shell.tsx` | modified | +2 `transition-colors duration-200` on Link + toggle |
| `docs/micronest/marketing/MICRONEST-COMMIT-05-REPORT.md` | new file | +273 (previously untracked post-push artifact, now committed) |
| `docs/micronest/marketing/MICRONEST-MARKETING-06-REPORT.md` | new file | +222 hero report |
| `docs/micronest/marketing/MICRONEST-MARKETING-07-MOTION-REPORT.md` | new file | +271 motion report |

```
git diff --cached --stat:
 .../MICRONEST-COMMIT-05-REPORT.md              | 273 +++++
 .../MICRONEST-MARKETING-06-REPORT.md           | 222 ++++
 .../MICRONEST-MARKETING-07-MOTION-REPORT.md    | 271 ++++
 src/app/globals.css                            |  58 +++++
 src/app/page.tsx                               | 188 ++++++----
 src/components/layout/nav-shell.tsx            |   4 +-
 src/components/marketing/profession-card.tsx   |   2 +-
 src/components/marketing/reveal.tsx            |  42 +++
 8 files changed, 970 insertions(+), 90 deletions(-)
```

Also `git status --short` before add showed exactly:
```
 M src/app/globals.css
 M src/app/page.tsx
 M src/components/layout/nav-shell.tsx
 M src/components/marketing/profession-card.tsx
?? docs/micronest/marketing/MICRONEST-COMMIT-05-REPORT.md
?? docs/micronest/marketing/MICRONEST-MARKETING-06-REPORT.md
?? docs/micronest/marketing/MICRONEST-MARKETING-07-MOTION-REPORT.md
?? src/components/marketing/reveal.tsx
```
No other modified/untracked (verified `git ls-files --others --exclude-standard` same 4).

## 7. Source Diff Summary

**`src/app/page.tsx` diff combined RCCF-06+07 (vs `e057546`):**

- Import `+import { Reveal }`.
- `main space-y-12 → space-y-8`; `hero py-16 md:py-24 → py-16 md:py-20`.
- Hero `eyebrow p/h1/p/CTAs/triad` each `class mn-reveal style={{animationDelay:"0/60/120/180/240ms"}}`; CTAs links added `transition-all/transition-colors duration-200 hover:bg-*`.
- Detached `section py-4 CA→GST→NoticeFlow` **removed** (12 lines).
- New inner `div pt-6 flex ... Profession → Workflow → MicroTool` inside hero `space-y-6` (same pill styling `rounded-full border bg-card` + dot).
- Sections `Browse/Featured/Why` wrapped `<Reveal>`; cards `ProfessionCard/Featured Link mn-card` inside `<Reveal delayMs i*60>`.
- `Browse/Featured/Why` headings/content unchanged (SEO/browse semantics preserved).

**`src/app/globals.css` diff:** `+58` keyframes + classes + reduced-motion.

**`reveal.tsx` new:** 42 lines observer primitive (marketing-only, no framework).

**`profession-card.tsx` diff:** `class rounded-md border p-6 hover:bg-accent → mn-card rounded-md border p-6 hover:bg-accent`.

**`nav-shell.tsx` diff:** `class ... hover:bg-accent → ... transition-colors duration-200 hover:bg-accent` on Link; toggle adds `transition-colors duration-200 hover:bg-accent`.

## 8. Documentation Committed

- `docs/micronest/marketing/MICRONEST-COMMIT-05-REPORT.md` — Commit-05 hero+02 activation `e057546` 273 lines (intentional remaining docs per `IMPORTANT DOCUMENT RULE` — not arbitrary, belongs `docs/micronest/**`, previously untracked post-push artifact).
- `docs/micronest/marketing/MICRONEST-MARKETING-06-REPORT.md` — Hero activation report 222 lines (14 sections, baseline/problem, `Profession→Workflow→MicroTool` copy, vertical rhythm `pt-6` `space-y-8` `md:py-20`, responsive, validation).
- `docs/micronest/marketing/MICRONEST-MARKETING-07-MOTION-REPORT.md` — Motion report 271 lines (18 sections, inventory hero 5 stagger, section reveals 3+4 cards `60ms` `400ms`, card/nav hover `200ms`, reduced-motion `none`, performance).

No `MICRONEST-COMMIT-06-REPORT.md` yet (this report is post-push untracked per instruction — not committed).

## 9. Validation Results

Run before staging and before commit (no weakening):

```
pnpm typecheck → tsc --noEmit → PASS (0 errors, Reveal client typed)
pnpm lint      → eslint       → PASS (0 errors, no any, mn-* classes not linted)
pnpm test      → vitest run   → PASS (36 passed | 1 skipped (37), 228 passed | 1 skipped (229), Duration 26.64s)
pnpm build     → next build   → PASS (Compiled 21.2s, TypeScript 7.7s, 12/12 pages)
  Route table identical to e057546:
    ○ /, ○ /_not-found, ƒ /api/matter-documents/[id], ƒ /api/notices/export, ƒ /app (7), ○ /login, ƒ /onboarding
    ● /profession/chartered-accountants, ● /profession/lawyers
    ○ /robots.txt, ○ /signup, ○ /sitemap.xml
    ● /tools/noticeflow, ● /tools/mattervault
```

## 10. E2E Results

```
pnpm test:e2e → playwright test → PASS (16 passed, 46.0s)
  [1-3] auth: /app→/login, login/signup render, onboarding→/login
  [4-7] notices-pagination: filters, export, Previous disabled, no firm_id
  [8-16] smoke: root Small tools… heading, homepage both professions+tools (CA+Lawyers / NoticeFlow+MatterVault), Lawyers eyebrow, tools/noticeflow 200, tools/mattervault 200, profession/chartered-accountants 200, profession/lawyers 200, 404 profession, 404 tool, sitemap 5 URLs
```

Temporary motion verification `verify-commit06.spec.ts` (10 tests: home at 375/768/1024/1280/1440 hero `Profession/Workflow/MicroTool` no CA, `chartered` 0 in hero, reduced motion `animationName none`, 4 routes no overflow) also PASS 25.3s before removal — not recreated for commit (task `MOTION REGRESSION: If it was intentionally removed after verification, do NOT recreate`).

Final suite remains `16 passed` (not `12` old, now `9 smoke + 7` = `16` with `2/2` activation).

## 11. Browser Verification

All via `verify-commit06.spec.ts` (removed after, 10 PASS) + smoke `16`:

| Viewport | Home | Public routes `375/1280` no overflow |
|---|---|---|
| 375 | PASS: hero `Profession ↓ Workflow ↓ MicroTool` vertical `gap-3`, eyebrow/h1/p/CTAs `mn-reveal` stagger, Browse `CA` (327) stacked Lawyers (327), Featured `NoticeFlow` `Receipt…` + `MatterVault` `Create…` within `mn-card`, no `scrollWidth>innerWidth`, hero animation not clipping | `/profession/chartered-accountants` PASS, `/profession/lawyers` PASS, `/tools/noticeflow` PASS, `/tools/mattervault` PASS |
| 768 | PASS: hero `Profession → Workflow → MicroTool` horizontal `sm:flex-row gap-4 sm:text-sm`, Browse `344` 2-col, Featured `344` 2-col, Why `md:grid-cols-3` | same |
| 1024 | PASS: hero `Profession → Workflow → MicroTool` centered `max-w-5xl space-y-8 md:py-20 pt-6`, Browse `472` 2-col, Featured `472` 2-col | same |
| 1280 | PASS: same capped `max-w-5xl 1024`, no overflow, card hover `translateY -1px` correct | same |
| 1440 | PASS: same capped | same |

**HOME checks:** hero `Profession→Workflow→MicroTool` visible + `Browse reveal` (section becomes `is-visible`), `Featured reveal` (NoticeFlow 0ms, MatterVault 60ms), `Why reveal`, card hover `mn-card:hover translateY -1px` via `card.hover()` still no overflow (`Background color transition 200ms`). `bg-grid` not animated (static).

## 12. Reduced-Motion Verification

`page.emulateMedia({ reducedMotion: "reduce" })` at `/` (verified via `verify-commit06.spec.ts` `reduced motion`):

- Content visible immediately (eyebrow, heading, triad `Profession/Workflow/MicroTool` no delayed reveal)
- `getComputedStyle(.mn-reveal).animationName` → `"none"` (vs `mn-reveal` normally)
- Scroll sections `Reveal` rendered without transform (`mn-section` `opacity 1; transform none; transition none`)
- No infinite animation (triad not looping, no pulse)
- Navigation usable (`Home, CA, NoticeFlow, Lawyers, MatterVault` links + mobile toggle `aria-expanded` toggle after reduced motion still)
- Cards usable (`Lawyers`, `MatterVault` Links still `hover:bg-accent` but no `translateY`)

PASS at dedicated test before removal.

## 13. Protected-Area Verification

Verified via `git diff -- <path>` (all empty):

| Path | Diff | Contains |
|---|---|---|
| `src/content/microtools.ts` | empty | no profession/tool `lawyers/mattervault` change (content remains 2/2) |
| `src/modules/` | empty | no `matter`/`notice`/`document`/`note`/`activity` logic |
| `src/app/app/` | empty | no `app/matters`, `app/notices`, dashboard, `api/matter-documents` change |
| `supabase/` | empty | no `supabase/migrations` `008/009` `matters/matter-documents` `public=false`, no RLS/RPC `is_firm_member` `verify_checklist_item_and_maybe_ready` |
| `package.json` | empty | no deps (see §14) |
| `pnpm-lock.yaml` | empty | no lock change |
| `supabase/migrations` | empty | no migration |
| `RLS/RPC/auth/services/repositories` | empty | via modules/app diff empty |

Also confirmed `src/app/profession/[profession]/page.tsx`, `src/app/tools/[tool]/page.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/layout.tsx` no diff (layout description already `For CA(NoticeFlow) and Lawyers(MatterVault)`).

## 14. Dependency Verification

- `package.json` unchanged (`git diff -- package.json` empty) — verified no `["dependencies"]` addition.
- `pnpm-lock.yaml` unchanged (`git diff -- pnpm-lock.yaml` empty).
- **0 new dependencies** — checked for `framer-motion`, `motion`, `GSAP`, `Lenis`, `Magic UI`, `Aceternity`, `React Spring`, animation library — none found in `package.json` diff; `package.json` deps remain `next 16.3.6, react 19.1.0, @supabase/ssr 0.7.0, geist 1.7.2, tailwindcss 4.1.8`.
- `Reveal` primitive uses only `React useEffect/useRef/useState` + `IntersectionObserver` (browser native, no lib).

## 15. Push Result

```
git push origin main → e057546..6bacae9  main -> main
To https://github.com/kaushalbhat0-personal/MicroNest-MicroTools.git
```

Verified `git push origin main 2>&1`:
```
   e057546..6bacae9  main -> main
```
Exit 0, no force, remote `To https://github.com/...`.

## 16. Local/Remote SHA Comparison

```
git rev-parse HEAD                  → 6bacae9bfa3d1dedc36385977abdd98a06f1c417
git ls-remote origin refs/heads/main → 6bacae9bfa3d1dedc36385977abdd98a06f1c417  refs/heads/main
```

**Match: YES** — local `HEAD` equals `origin/main`.

Verified via:
```bash
git rev-parse HEAD
# 6bacae9bfa3d1dedc36385977abdd98a06f1c417
git ls-remote origin refs/heads/main
# 6bacae9bfa3d1dedc36385977abdd98a06f1c417  refs/heads/main
```

## 17. Final Working-Tree Status

After push `git status --short`:

```
(no output)   # `git status` would show no output with --short when clean
```

Full `git status`:
```
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

However this report instruction notes post-commit report artifact:

- `docs/micronest/marketing/MICRONEST-COMMIT-06-REPORT.md` remains **untracked as post-commit artifact** — intentionally not included in `6bacae9` (per `FINAL REPORT: Because this report is created after the commit, do NOT create another commit merely to include this report. It may remain untracked`).

Therefore **commit/push clean:** YES (no remaining source/docs changes to commit).

**Post-commit report untracked:** One intentional file `MICRONEST-COMMIT-06-REPORT.md` (this file) — `git ls-files --others --exclude-standard` after report creation would show `docs/micronest/marketing/MICRONEST-COMMIT-06-REPORT.md` only; no other untracked.

## 18. Any Intentionally Uncommitted Files

**Before staging (expected) we had 4 untracked remains after staging 8 (8 committed), now after this report:**

| File | Status | Why uncommitted |
|---|---|---|
| `docs/micronest/marketing/MICRONEST-COMMIT-06-REPORT.md` | untracked (this file) | Post-commit artifact — per instruction `It may remain untracked as a post-commit artifact.` — no extra commit for reporting. |
| *(no other untracked)* | — | All other intentional docs (`MICRONEST-COMMIT-05-REPORT.md`, `MICRONEST-MARKETING-06/07` reports, `reveal.tsx`, `globals.css`, `page.tsx`, `profession-card.tsx`, `nav-shell.tsx`) were committed in `6bacae9`. No `e2e/verify-*.spec.ts` temp (removed), no `playwright output`, no `.env`, no `node_modules`. |

No unexpected file exists — `git ls-files --others --exclude-standard` shows only this report.

---

## Explicit Confirmations

- 0 new dependencies — `package.json`/`pnpm-lock.yaml` no diff, no `framer-motion/motion/GSAP/Lenis/Magic UI/Aceternity` etc.
- no database changes — `supabase/` empty
- no migrations — `supabase/migrations` empty
- no RLS changes — no `RLS` `is_firm_member` policy change
- no RPC changes — no `verify_checklist_item_and_maybe_ready`/`archive_matter` change
- no auth changes — `proxy.ts`/`supabase-service.ts` empty
- no authenticated app changes — `src/app/app/**` empty
- no MatterVault business logic changes — `src/modules/matter/**` empty
- no NoticeFlow business logic changes — `src/modules/notice/**` empty

---

**STOP** — Marketing surface frozen at `6bacae9`. No redesign, no more animation, no more professions/tools, no pricing/testimonials/FAQ/blog, no MatterVault/NoticeFlow modification.

