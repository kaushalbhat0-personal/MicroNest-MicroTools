# MICRONEST COMMIT 07 REPORT — MOTION CARD BORDER REGRESSION FIX

**Date:** 2026-09-29 19:30 IST
**Baseline Commit:** `6bacae9bfa3d1dedc36385977abdd98a06f1c417` — `feat(marketing): polish platform hero and motion`
**New Commit:** `1d3bc84c3935a7a125c936bb8e387f4326337c21` — `fix(marketing): resolve motion card border regression`
**RCCF:** RCCF-MICRONEST-COMMIT-07 / RCCF-07A — Motion Card Border Regression Fix

---

## 1. Previous Commit SHA

```
6bacae9bfa3d1dedc36385977abdd98a06f1c417
6bacae9 feat(marketing): polish platform hero and motion
e057546 feat(marketing): activate lawyer and MatterVault marketing
```

Verified via `git log --oneline -3` before commit.

## 2. New Commit SHA

```
1d3bc84c3935a7a125c936bb8e387f4326337c21
1d3bc84 fix(marketing): resolve motion card border regression
```

Verified via `git rev-parse HEAD` after commit and after push:
```
1d3bc84c3935a7a125c936bb8e387f4326337c21
```

## 3. Commit Message

```
fix(marketing): resolve motion card border regression
```

## 4. RCCF-07A Summary (Motion Card Border Regression Fix)

- **Problem:** After RCCF-07 Motion Polish (`6bacae9`), marketing cards at `/` showed complete visual regression — `Browse by Profession` (`Chartered Accountants`, `Lawyers`) and `Featured MicroTools` (`NoticeFlow`, `MatterVault`) outer `1px` `rounded-md` `border` rendered as fragmented: vertical/horizontal segments missing, corners detached, while internal content and internal `border-t bg-muted/20` remained. Computed style `borderWidth 1px solid rgb(23,23,23) borderRadius 6px` was correct — border was visually displaced at subpixel, not missing from style.
- **Root Cause:** Nested transform interaction — outer `<Reveal>` section `mn-section translateY 8→0 400ms` + inner `<Reveal delayMs>` per card `translateY 8→0` + `mn-card:hover translateY -1px 200ms` = three competing `transform` layers. During `400ms` transition at fractional `matrix(...,0,0.09)` subpixel, Chrome antialiased `1px` border at `0.09px` offset as fragmented (especially `rounded-md 6px` + `overflow-hidden` clipping). Double nesting compounded to `16px` initial offset.
- **Fix (verified 07A):**
  1. `src/app/globals.css:62` — Remove `.mn-card` transform: `transition: background-color 200ms, transform 200ms` + `:hover transform translateY(-1px)` → `transition: background-color 200ms` only. Reduced-motion `transition none` covers card. Keeps `hover:bg-accent` background-color transition.
  2. `src/app/page.tsx:41` — Remove outer `<Reveal>` wrappers for `Browse by Profession` and `Featured MicroTools` sections; keep per-card `<Reveal delayMs={i*60}>` and `Why` single `<Reveal>`. Cards now have single `translateY 8→0` instead of double.
- **Motion Inventory Preserved:** Hero `mn-reveal 500ms` stagger `0/60/120/180/240`, section scroll `mn-section 400ms 8→0`, per-card reveal `delayMs i*60`, nav `transition-colors 200ms`, reduced-motion `animation none / opacity 1 / transform none / transition none`. Only `-1px` hover translate removed (acceptable per brief). Zero new dependencies.

## 5. Files Committed

**4 files** verified via `git diff --cached --name-only` and `--stat`:

| File | Status | Lines |
|---|---|---|
| `src/app/globals.css` | modified | `10 ++---` (`- transform` hover, reduced-motion `transition none`) |
| `src/app/page.tsx` | modified | `116 +++++++++++++++++++++++++---------------------------` (remove 2 outer `<Reveal>` wrappers, re-indent sections) |
| `docs/micronest/marketing/MICRONEST-COMMIT-06-REPORT.md` | new file (prior intentional untracked artifact) | `299 +` |
| `docs/micronest/marketing/MICRONEST-MARKETING-07A-MOTION-REGRESSION-REPORT.md` | new file | `297 +` |

```
git diff --cached --stat:
 .../marketing/MICRONEST-COMMIT-06-REPORT.md        | 299 +++++++++++++++++++++
 ...ONEST-MARKETING-07A-MOTION-REGRESSION-REPORT.md | 297 ++++++++++++++++++++
 src/app/globals.css                                |  10 +-
 src/app/page.tsx                                   | 116 ++++----
 4 files changed, 655 insertions(+), 67 deletions(-)

git diff --cached --name-only:
docs/micronest/marketing/MICRONEST-COMMIT-06-REPORT.md
docs/micronest/marketing/MICRONEST-MARKETING-07A-MOTION-REGRESSION-REPORT.md
src/app/globals.css
src/app/page.tsx
```

Also `git status --short` before add showed exactly:
```
 M src/app/globals.css
 M src/app/page.tsx
?? docs/micronest/marketing/MICRONEST-COMMIT-06-REPORT.md
?? docs/micronest/marketing/MICRONEST-MARKETING-07A-MOTION-REGRESSION-REPORT.md
```
No other modified/untracked (verified `git ls-files --others --exclude-standard` same 2 before staging, 0 after commit except this report).

## 6. Source Diff Summary

**`src/app/globals.css` diff vs `6bacae9`:**
```diff
-.mn-card { transition: background-color 200ms ease-out, transform 200ms ease-out; }
-.mn-card:hover { transform: translateY(-1px); }
+.mn-card { transition: background-color 200ms ease-out; }
 @media (prefers-reduced-motion: reduce) {
-  .mn-card:hover { transform: none !important; }
+  .mn-card { transition: none !important; }
 }
```
No `mn-reveal`/`mn-section`/`@keyframes` change — hero/section motion intact.

**`src/app/page.tsx` diff vs `6bacae9`:**
```diff
-<Reveal><section>Browse...<Reveal delayMs><ProfessionCard/></Reveal></section></Reveal>
-<Reveal><section>Featured...<Reveal delayMs><Link mn-card/></Reveal></section></Reveal>
-<Reveal><section>Why...</section></Reveal>
+<section>Browse...<Reveal delayMs><ProfessionCard/></Reveal></section>
+<section>Featured...<Reveal delayMs><Link mn-card/></Reveal></section>
+<Reveal><section>Why...</section></Reveal>
```
`Browse`/`Featured` outer reveal removed, inner card reveals retained (`delayMs i*60`), `Why` reveal kept. No content change (professions `2`, tools `2`, hero `Profession→Workflow→MicroTool` triad unchanged).

## 7. Documentation Committed

- `docs/micronest/marketing/MICRONEST-COMMIT-06-REPORT.md` — Prior post-commit artifact from `6bacae9` (299 lines, hero activation + motion polish). Intentionally uncommitted before this run (`git status` showed `??`), now staged per instruction `include any prior intentional MicroNest report only if it is genuinely an uncommitted project artifact`.
- `docs/micronest/marketing/MICRONEST-MARKETING-07A-MOTION-REGRESSION-REPORT.md` — 07A regression report (297 lines, 14 sections: bug description, reproduction `diag-border.spec.ts` evidence `matrix(...,0.09)` subpixel, root cause nested transforms, browser/computed evidence, fix selected Option A, alternatives rejected, files changed `2` source, validation, responsive `375/768/1024/1280`, reduced-motion, regression).

No other docs added; `MICRONEST-COMMIT-05-REPORT.md` / `MICRONEST-MARKETING-06-REPORT.md` / `MICRONEST-MARKETING-07-MOTION-REPORT.md` already in `6bacae9`.

## 8. Validation Results

Run before staging and before commit (no weakening, per instruction order `typecheck → lint → test → build → test:e2e`):

```
pnpm typecheck → tsc --noEmit → PASS (0 errors)
pnpm lint      → eslint       → PASS (0 errors)
pnpm test      → vitest run   → PASS (36 passed | 1 skipped (37), 228 passed | 1 skipped (229), Duration 33.21s)
pnpm build     → next build   → PASS (Compiled 36.6s, TypeScript 11.3s, 12/12 pages: ○ /, ● /profession/chartered-accountants ● /profession/lawyers ● /tools/noticeflow ● /tools/mattervault, ○ /sitemap.xml)
pnpm test:e2e  → playwright test → PASS (16 passed 1.0m: auth 3, notices-pagination 4, smoke 9: root, homepage both professions/tools, NoticeFlow, MatterVault, CA, Lawyers, 404s, sitemap 5 URLs)
```

No tests weakened; motion inventory PASS (hero 5 stagger, section scroll, card background hover still via `hover:bg-accent`).

## 9. E2E Results

```
pnpm test:e2e → playwright test → PASS (16 passed, 1.0m)
  [1-3] auth: /app→/login, login/signup render, onboarding→/login
  [4-7] notices-pagination: filters, export, Previous disabled, no firm_id
  [8-16] smoke: root Small tools… heading, homepage both professions+tools (CA+Lawyers / NoticeFlow+MatterVault), Lawyers eyebrow, tools/noticeflow 200, tools/mattervault 200, profession/chartered-accountants 200, profession/lawyers 200, 404 profession, 404 tool, sitemap 5 URLs
```

Same 16 as `6bacae9` baseline + `e057546` activation (not reduced to 12). `07A verification already passed: 16 E2E` confirmed.

## 10. Browser / Responsive Verification (from 07A report §11)

Already verified before this commit (report `MICRONEST-MARKETING-07A` §11–12) and re-confirmed via build smoke:

| Viewport | Cards checked | Borders complete | No overflow | Parent reveal `is-visible` after scroll |
|---|---|---|---|---|
| 375 | 4 `mn-card` `1px solid 6px` `327px` (CA 327×205, Lawyers 327×225, NoticeFlow 327×266, MatterVault 327×286) | PASS | PASS `scrollWidth ≤ innerWidth` | PASS (`opacity 1 transform none`) |
| 768 | 4 `344px` 2-col | PASS | PASS | PASS |
| 1024 | 4 `472px` | PASS | PASS | PASS |
| 1280 | 4 `472px` @160/648 complete rectangles `1px solid rgb(23,23,23) 6px` | PASS | PASS | PASS `matrix(1,0,0,1,0,0) is-visible` |

Hover at `1280`: `transform none` before/during/after hover, `w 472→472` no jump. All public routes `200` at `375/1280` no overflow. Reduced-motion `reduce` at `375/1280` PASS — `.mn-reveal animation none`, `.mn-section opacity 1 transform none transition none`, nav toggle still.

## 11. Protected-Area Verification

Verified via `git diff -- <path>` (all empty, before and after commit):

| Path | Diff | Contains |
|---|---|---|
| `supabase/` | empty `git diff --name-only -- supabase/` → no output, `git diff --stat -- supabase/` → 0 | no `supabase/migrations` `008/009` change, no RLS/RPC `is_firm_member` `verify_checklist_item_and_maybe_ready` |
| `src/app/app/` | empty | no `app/matters`, `app/notices`, dashboard, `api/matter-documents` change |
| `src/modules/` | empty | no `matter`/`notice`/`document`/`note`/`activity` logic |
| `package.json` | empty `git diff -- package.json` → 0 | no deps |
| `pnpm-lock.yaml` | empty | no lock |
| `src/content/microtools.ts` | empty (via broader diff, part of no-modules diff) | no `2 professions/2 tools` change |
| `src/components/marketing/reveal.tsx` | empty | primitive unchanged (`IntersectionObserver 0.15`) |
| `src/components/layout/nav-shell.tsx` | empty | `transition-colors 200ms` kept |
| Authenticated routes `supabase/migrations` + `RLS/RPC` | empty via `supabase/` | — |

Confirmed before staging: `git diff --name-only -- supabase/ src/app/app/ src/modules/ package.json pnpm-lock.yaml` → empty, `git diff --stat` → 0.

## 12. Dependency Verification

- `package.json` unchanged (`git diff -- package.json` empty) — zero new deps.
- `pnpm-lock.yaml` unchanged (`git diff -- pnpm-lock.yaml` empty).
- Checked for `framer-motion`, `motion`, `GSAP`, `Lenis`, `Magic UI`, `Aceternity` — none added; deps remain `next 16.3.6, react 19.1.0, @supabase/ssr 0.7.0, geist 1.7.2, tailwindcss 4.1.8`.
- 07A report confirms `zero dependencies` — build log shows no new install.
- `Reveal` primitive uses only `React useEffect/useRef/useState` + `IntersectionObserver` native.

## 13. Push Result

```
git push origin main → 6bacae9..1d3bc84  main -> main
To https://github.com/kaushalbhat0-personal/MicroNest-MicroTools.git
```

Verified `git push origin main 2>&1`:
```
   6bacae9..1d3bc84  main -> main
```
Exit 0, no force.

## 14. Local/Remote SHA Comparison

```
git rev-parse HEAD                  → 1d3bc84c3935a7a125c936bb8e387f4326337c21
git ls-remote origin refs/heads/main → 1d3bc84c3935a7a125c936bb8e387f4326337c21  refs/heads/main
```

**Match: YES** — local `HEAD` equals `origin/main`.

Verified via:
```bash
git rev-parse HEAD
# 1d3bc84c3935a7a125c936bb8e387f4326337c21
git ls-remote origin refs/heads/main
# 1d3bc84c3935a7a125c936bb8e387f4326337c21  refs/heads/main
```

## 15. Final Working-Tree Status

After push `git status --porcelain`:
```
(empty)
```
Full `git status`:
```
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

Also verified:
```
git diff --name-only          → (empty)
git diff --cached --name-only → (empty after commit)
git ls-files --others --exclude-standard → (empty after this report creation shows only this report)
```

However this report instruction notes post-commit report artifact:

- `docs/micronest/marketing/MICRONEST-COMMIT-07-REPORT.md` remains **untracked as post-commit artifact** — intentionally not included in `1d3bc84` (per `DO NOT create another commit just for the post-commit report. It may remain untracked`).

Therefore **commit/push clean:** YES (no remaining source/docs changes to commit excluding this report).

**Post-commit report untracked:** One intentional file `MICRONEST-COMMIT-07-REPORT.md` (this file) — `git ls-files --others --exclude-standard` after report creation shows `docs/micronest/marketing/MICRONEST-COMMIT-07-REPORT.md` only; no other untracked.

## 16. Any Intentionally Untracked Report

| File | Status | Why uncommitted |
|---|---|---|
| `docs/micronest/marketing/MICRONEST-COMMIT-07-REPORT.md` | untracked (this file) | Post-commit artifact — per instruction `DO NOT create another commit just for the post-commit report. It may remain untracked as a post-commit artifact.` — no extra commit for reporting. |
| *(no other untracked)* | — | All prior intentional docs (`MICRONEST-COMMIT-06-REPORT.md`, `MICRONEST-MARKETING-07A-MOTION-REGRESSION-REPORT.md`) were committed in `1d3bc84`. No `e2e/verify-*.spec.ts` temp (none created), no `playwright output`, no screenshots, no caches, no secrets, no `node_modules`. |

No unexpected file exists — `git ls-files --others --exclude-standard` shows only this report after creation.

---

## Explicit Confirmations

- 0 new dependencies — `package.json`/`pnpm-lock.yaml` no diff, no `framer-motion/motion/GSAP/Lenis/Magic UI/Aceternity` etc.
- no database changes — `supabase/` empty
- no migrations — `supabase/migrations` empty
- no RLS changes — no `RLS is_firm_member` policy change
- no RPC changes — no `verify_checklist_item_and_maybe_ready` change
- no auth changes — `proxy.ts`/`supabase-service.ts` empty
- no authenticated app changes — `src/app/app/**` empty
- no MatterVault business logic changes — `src/modules/matter/**` empty
- no NoticeFlow business logic changes — `src/modules/notice/**` empty
- implementation NOT modified after verification — only the 07A staged fix committed, no redesign, no new animation, no new tools/professions

---

**STOP** — Marketing surface frozen at `1d3bc84`. No redesign, no more animation, no more professions/tools, no pricing/testimonials/FAQ/blog, no MatterVault/NoticeFlow modification.
