# MICRONEST MARKETING 06 REPORT — PLATFORM HERO ACTIVATION

**Date:** 2026-09-29 16:00 IST
**Baseline:** `e05754667a5ff4aabd913d4687a949d5c568d93a feat(marketing): activate lawyer and MatterVault marketing`
**Scope:** RCCF-MICRONEST-MARKETING-06 — Hero-only platform-level concept refinement
**File:** `src/app/page.tsx` only — no content model, no profession/tool card, no nav, no DB, no commit/push

---

## 1. Baseline

- Production `e057546` has `2 professions` (`chartered-accountants → [noticeflow]`, `lawyers → [mattervault]`) + `2 tools` (`noticeflow` `available /tools/noticeflow /app`, `mattervault` `available /tools/mattervault /app/matters`) via `src/content/microtools.ts:31` static arrays.
- Homepage at `src/app/page.tsx:11` was `max-w-5xl space-y-12 p-6 md:p-8` with `hero py-16 md:py-24 bg-muted/10 rounded-lg + bg-grid` containing `eyebrow FOCUSED SOFTWARE FOR PROFESSIONAL WORKFLOWS + h1 Small tools for the work that matters. + p Small, focused... + Explore MicroTools bg-primary / Launch App border`, followed by detached `section[aria-label="How MicroNest works"] flex flex-col sm:flex-row py-4 gap-3 sm:gap-4` pills `Chartered Accountants → GST/Income-tax notice → NoticeFlow` (each `rounded-full border bg-card px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm + h-2 w-2 bg-primary dot + →/↓ muted`), then `Browse by Profession md:grid-cols-2 CA+Lawyers` + `Featured MicroTools md:grid-cols-2 NoticeFlow (Receipt→...→Close) + MatterVault (Create→...→Archive) border-t bg-muted/20` + `Why MicroTools border-t 3-col` + footer.
- Build emitted `● /profession/lawyers` + `● /tools/mattervault` sitemap 5 URLs, `16` e2e PASS.

## 2. Problem

Hero communicated **CA → NoticeFlow** while navigation/browse/featured communicated **CA+Lawyers / NoticeFlow+MatterVault** — mismatch.

```
Hero:        Chartered Accountants → GST/Income-tax notice → NoticeFlow   (1 of 2 niches)
Navigation:  Home + Chartered Accountants + NoticeFlow + Lawyers + MatterVault (2+2)
Browse:      Chartered Accountants 1 tool || Lawyers 1 tool                (2)
Featured:    NoticeFlow (Receipt…Close)  || MatterVault (Create…Archive)   (2)
```

Hero was no longer platform-neutral after `2/2` activation (`e057546`). Task requires hero to communicate MicroNest architecture itself `Profession → Workflow → MicroTool` as one platform-level anchor, not two hero workflows inside hero, not dashboard/bento/screenshot/illustration/carousel/animation.

## 3. Hero Concept Selected

**Selected wording — minimal conceptual triad (no profession/tool specificity, no supporting adjective inflation):**

```
Profession → Workflow → MicroTool
```

**Why this over alternatives:**

- Exact target labels from brief: `Profession → Workflow → MicroTool` — each is one word, matches `src/content` type names `Profession`/`Tool` but presented as concept (capitalized), already in brief `TARGET HERO CONCEPT`.
- Alternative `Profession-specific → Focused workflow → Purpose-built tool` (brief suggestion) is longer, forces line-wrap at 375, and duplicates `Focused` already in `eyebrow FOCUSED SOFTWARE...` — rejected as verbose.
- No derivation from `microtools.ts` (per task `CONTENT SOURCE do NOT derive`), no `microtools.ts` relationship hard-code — intentional conceptual, not `getProfession`.

**Visual treatment:** Same `rounded-full border bg-card px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm + h-2 w-2 bg-primary + →/↓ muted aria-hidden` pills as before — quiet authority preserved (`Geist/neutral/1px/bg-card`), `aria-label="How MicroNest works"` retained, words remain accessible text (not images).

## 4. Exact Copy Changed

**Only `src/app/page.tsx:24` pills text changed:**

| Before (CA-locked) | After (platform-level) |
|---|---|
| `Chartered Accountants` | `Profession` |
| `GST/Income-tax notice` | `Workflow` |
| `NoticeFlow` | `MicroTool` |

Preserved `FOCUSED SOFTWARE FOR PROFESSIONAL WORKFLOWS` eyebrow, `Small tools for the work that matters.` `h1`, `Small, focused software tools for professionals. Built around specific workflows, not all-in-one platforms.` supporting copy, `Explore MicroTools` + `Launch App` CTAs — per task `HERO COPY preserve` (no headline/supporting rewrite).

**Scope check:** Hero no longer references `Chartered Accountants`, `GST/Income-tax`, `NoticeFlow` — verified via `page.locator("section").first().getByText("Chartered Accountants")` count 0 in browser verification.

## 5. Vertical Rhythm Change

**Problem:** Screenshots show excessive separation between `CTAs ↓ Profession→Workflow→MicroTool` — pills felt floating near bottom, not part of hero narrative (`space-y-12` between sections + `hero py-16 md:py-24` bottom 64/96 + detached `py-4` pills).

**Smallest Tailwind adjustments (one file `src/app/page.tsx`):**

| Element | Before | After | Delta |
|---|---|---|---|
| `main` | `space-y-12` (48px between hero/Browse) | `space-y-8` (32px) | −16px all sections (still editorial, not dense) |
| `hero section` | `py-16 md:py-24` (64 → 96) | `py-16 md:py-20` (64 → 80) | −16px desktop bottom, mobile preserved |
| `three-step pills` | `section.flex ... py-4 (16px)` detached **outside** hero | `div.flex ... pt-6 (24px)` **inside** hero `div.relative space-y-6` after CTAs | Gap CTA→pills now `pt-6` 24px inside same `bg-muted/10` container, cohesive; total hero→Browse gap reduced from ~112px to ~32px |

**Target feeling achieved:**

```
eyebrow
  ↓ space-y-6
headline
  ↓
supporting copy
  ↓
CTAs
  ↓ pt-6 (small intentional gap)
Profession → Workflow → MicroTool   (inside hero bg-muted/10 + bg-grid, 1px border pills)
── hero rounded-lg ends (py-16 md:py-20 bottom) ──
  ↓ space-y-8 (32px)
Browse by Profession (CA+Lawyers md:grid-cols-2)
```

Hero not compressed (`py-16` mobile kept, `md:py-20` vs `24` just −16px), editorial whitespace preserved, no dense block, pills already at `sm:flex-row` horizontal `→` desktop and `flex-col ↓` mobile (responsive unchanged).

## 6. Responsive Behavior

**Preserved existing responsive pill behavior:**

- At **375px** `flex-col` vertical `Profession ↓ Workflow ↓ MicroTool` (`gap-3`, `text-xs px-3 py-1.5`, `↓` `sm:hidden`, `text-muted sm:hidden`).
- At **768px+** `sm:flex-row sm:justify-center sm:gap-4` horizontal `Profession → Workflow → MicroTool` (`sm:px-4 sm:py-2 sm:text-sm`, `→ hidden sm:inline`).

**Hero container responsive:** `py-16 md:py-20` keeps `py-16` mobile (64px) and reduces desktop `md:py-20` 80px vs 96px — still `md:` breakpoint, no forced horizontal on mobile.

Desktop composition at `1024` remains centered (`max-w-5xl mx-auto`, pills `flex justify-center` inside `max-w-2xl`-adjacent hero `space-y-6`), browse `md:grid-cols-2` `472px` each, featured `472px` each, `Why` 960, all within `max-w-5xl`.

## 7. Files Changed

**Exactly 1 source file changed (per task `IMPLEMENTATION FILE Expected source change: src/app/page.tsx` one-file change):**

| File | Lines | Why |
|---|---|---|
| `src/app/page.tsx` | `+11 -12` (`space-y-8` `md:py-20` + pills inside hero `pt-6 Profession→Workflow→MicroTool`) | Hero-only platform concept — replace CA-specific detached `section py-4 Chartered/GST/NoticeFlow` with `div pt-6 Profession/Workflow/MicroTool` inside `section.bg-muted/10 py-16 md:py-20` + cohesive CTA gap. |

**Verified `git diff --stat` `1 file changed, 11 insertions(+), 12 deletions(-)` and `git diff --name-only` `src/app/page.tsx` only.**

## 8. Validation Results

```
pnpm typecheck → tsc --noEmit → PASS (0 errors, no professions/tools import change, hero only JSX)
pnpm lint      → eslint       → PASS (0 errors)
pnpm test      → vitest run   → PASS (36 passed | 1 skipped (37 suites), 228 passed | 1 skipped (229 tests), Duration 25.13s)
  No test weakened, hero change has no unit test counterpart (static JSX).
pnpm build     → next build   → PASS (Compiled 21.3s, TypeScript 9.6s, 12/12 pages)
  Route table unchanged vs baseline:
    ○ /, ○ /_not-found, ƒ /api/matter-documents/[id], ƒ /api/notices/export, ƒ /app (7 routes), ○ /login, ƒ /onboarding
    ● /profession/chartered-accountants, ● /profession/lawyers
    ○ /robots.txt, ○ /signup, ○ /sitemap.xml
    ● /tools/noticeflow, ● /tools/mattervault
  12/12 pages, ƒ Proxy middleware.
pnpm test:e2e  → playwright test → PASS (16 passed, 43.4s)
  smoke 9: root Small tools…, homepage both professions+tools (Browse+Featured still CA+Lawyers / NoticeFlow+MatterVault), profession Lawyers+CA 200, tools NoticeFlow+MatterVault 200, 404 profession/tool, sitemap 5 URLs
  auth 3 + notices-pagination 4 unchanged.
```

## 9. Browser Verification

**Primary — home page hero platform-level verification (`viewports 375/768/1024/1280/1440`, `verify-hero.spec.ts` 9 tests all PASS 21.4s):**

| Viewport | Overflow | Hero `Profession Workflow MicroTool` visible | Hero NOT `CA/GST/NoticeFlow` | Browse `CA+Lawyers` | Featured `NoticeFlow+MatterVault` |
|---|---|---|---|---|---|
| 375 | false | Profession + Workflow + MicroTool (vertical `↓`) | 0 hits | `CA` + `Lawyers` `h3` | `NoticeFlow` + `MatterVault` `h3` |
| 768 | false | same horizontal `→` `sm:text-sm` | 0 | same | same |
| 1024 | false | same `md:py-20` centered | 0 | same | same |
| 1280 | false | same capped `max-w-5xl 1024` | 0 | same | same |
| 1440 | false | same capped | 0 | same | same |

Checks performed: `overflow document.documentElement.scrollWidth > innerWidth false`, `getByText("Profession")` visible, `getByText("Workflow")` visible, `getByText("MicroTool")` visible, `heroSection.getByText("Chartered Accountants")` count 0, `heroSection.getByText("NoticeFlow")` count 0, `heroSection.getByText("GST/Income-tax notice")` count 0, `getByLabel("How MicroNest works")` visible, arrows `aria-hidden`.

**Additional routes at 375+1280:**

- `/profession/chartered-accountants` 200 no overflow (ToolCard `Chartered Accountants → NoticeFlow` still via `getProfession` dynamic)
- `/profession/lawyers` 200 no overflow (`Lawyers → MatterVault`)
- `/tools/noticeflow` 200 no overflow (CA eyebrow, notice bullets, `View Chartered Accountants tools`)
- `/tools/mattervault` 200 no overflow (Lawyers eyebrow, mattervault `Client document...`, 5 mattervault bullets, `View Lawyers tools`)

Visual checks 10/10 per task `VISUAL CHECKS`:

1. Hero no longer references `Chartered Accountants` — PASS (hero 0 hits, browse still shows CA below)
2. Hero no longer references `NoticeFlow` — PASS (hero 0, featured still shows both)
3. Hero represents multi-profession platform — PASS (`Profession→Workflow→MicroTool` abstract triad)
4. CTA-to-concept spacing intentional — PASS (`pt-6` 24px inside hero `space-y-6`, not floating)
5. Hero not excessively compressed — PASS (`py-16` kept, `md:py-24→20` only −16px desktop)
6. Browse by Profession unchanged — PASS (verified `md:grid-cols-2` CA+Lawyers, no card edit)
7. Featured MicroTools unchanged — PASS (verified `NoticeFlow Receipt…Close` + `MatterVault Create…Archive` inside `border-t bg-muted/20` still)
8. Homepage still communicates `CA→NoticeFlow / Lawyers→MatterVault` below hero — PASS
9. Desktop centered — PASS (`max-w-5xl mx-auto flex justify-center`)
10. Mobile vertical readable — PASS (`flex-col ↓` at 375)

## 10. Regression Verification

| Area | Checked | Result |
|---|---|---|
| NoticeFlow marketing | `Browse` CA card, `Featured` NoticeFlow `Receipt→...→Close` workflow, profession `chartered-accountants` page `ToolCard CA → NoticeFlow`, tool `noticeflow` bullets `What it does` 5, `Who it is for Indian CAs`, CTA `View Chartered Accountants tools` | PASS — no change except hero (browse/featured verified identical) |
| MatterVault marketing | `Browse` Lawyers `Focused tools for litigators...`, `Featured` MatterVault `Create→...→Archive`, `profession/lawyers` `Lawyers → MatterVault`, `tools/mattervault` `Lawyers` eyebrow + mattervault 5 bullets + `View Lawyers tools` | PASS |
| Profession pages | `generateStaticParams` `2` sitemap 5 URLs, both 200, 404 still | PASS |
| Tool pages | both 200, CTA `data.appHref` `/app` vs `/app/matters` preserved, `Badge available` | PASS |
| Navigation `SiteNav` | `links[5] Home+CA+NoticeFlow+Lawyers+MatterVault` + `Launch App` unchanged, `NavShell` `aria-expanded/current` | PASS (`git diff -- src/components/layout/site-nav.tsx` empty) |
| Content model `src/content/microtools.ts` | `professions 2 / tools 2` untouched | PASS (`git diff -- src/content/microtools.ts` empty) |
| Authenticated app `src/app/app/**` `/app/matters` `/app/notices` + dashboard | no diff | PASS (`git diff -- src/app/app/` empty) |
| Marketing cards `profession-card.tsx` `tool-card.tsx` | no diff (`ToolCard getProfession` dynamic kept, `ProfessionCard` 1 tool badge) | PASS (`git diff -- src/components/marketing/` empty) |

## 11. Dependency Impact

- `package.json` **unchanged** (`git diff -- package.json` empty, `git diff -- pnpm-lock.yaml` empty).
- No dependencies added — `geist 1.7.2`, `tailwindcss 4.1.8`, `next 16.3.6`, `react 19.1.0` same.
- No new components/dependencies (task `Do NOT add Framer Motion/Magic UI/Aceternity/...` — verified 0).
- Hero reuses existing pills (`rounded-full border bg-card` + `h-2 w-2 bg-primary` dot + `→/↓ muted`) + `Badge` + `bg-grid` (6-line Tailark `linear-gradient 40px 15%`), no new CSS.

## 12. Security Impact

- No `supabase/migrations` diff — no migrations, no RLS, no RPC (`verify_checklist_item_and_maybe_ready FOR UPDATE`, `archive_matter` unchanged).
- No `proxy.ts` `auth` / `src/infrastructure/database/supabase-service.ts` `SUPABASE_SERVICE_ROLE_KEY` server-only change.
- No `firm_id` tenant `is_firm_member`/`firm_role SECURITY DEFINER` change; storage `matter-documents` `public=false` signed `60s` unchanged.
- Marketing hero text `Profession/Workflow/MicroTool` is public conceptual, no firm data.

## 13. Out-of-Scope Confirmation

Confirmed **not changed/added** (per task `DO NOT CHANGE` + `STOP CONDITION`):

- `src/content/microtools.ts` — not modified (content `lawyers/mattervault` already activated at `e057546`).
- `src/components/marketing/profession-card.tsx`, `src/components/marketing/tool-card.tsx`, `src/components/layout/site-nav.tsx` — no diff.
- `/profession/[profession]`, `/tools/[tool]` — no diff beyond homepage hero; routes still `●` SSG.
- MatterVault / NoticeFlow / `src/app/app/**` authenticated app — no diff (`src/app/app` empty).
- Supabase / database / migrations / RLS / RPC / auth / services / repositories — no diff.
- `Browse by Profession`, `Featured MicroTools`, `Why MicroTools`, footer, sitemap, SEO (`layout.tsx` description already `CA(NoticeFlow)+Lawyers(MatterVault)` at `e057546`) — no diff beyond hero's `space-y-8` gap (still `Browse`/`Featured` intact).
- No `another profession`, `another tool`, `pricing/testimonials/FAQ/blog`, `screenshots`, `animations`, `Magic/Aceternity/Motion`, `generic Workflow` component — `Tool` type untouched, hero pills remain 6 lines local to `page.tsx`.

## 14. Final Verdict

**PASS — Hero now communicates platform architecture `Profession → Workflow → MicroTool` with cohesive vertical rhythm, without redesigning browse/featured or touching content/DB/security.**

Platform narrative mismatch fixed: `Hero: CA→NoticeFlow` (single niche) → `Profession→Workflow→MicroTool` (platform abstract, 1 triad, `bg-grid` hero, `pt-6` CTA gap, `py-16 md:py-20` editorial), while `Browse` `CA 1 tool || Lawyers 1 tool` + `Featured` `NoticeFlow 6 Receipt…Close || MatterVault 6 Create…Archive` keep profession/tool examples below hero — `2` niches discoverable as before (verified).

Implementation is **1 file `src/app/page.tsx` (`+11 -12`, `space-y-8` `md:py-20` `pt-6 Profession/Workflow/MicroTool` inside hero `space-y-6 bg-muted/10`)**, preserves `Geist/neutral/1px/border/bg-card`, no new deps/components/DB.

`typecheck/lint/test/build/test:e2e (16)` all PASS, responsive `375/768/1024/1280/1440` no overflow and hero platform-level visible, regression no `content/market nav/profession/tool/matter/notice/supabase` diff.

- package.json unchanged — **0 new dependencies**
- no database changes
- no migrations
- no RLS changes
- no RPC changes
- no auth changes
- no authenticated app changes

**STOP — Do not redesign Browse/Featured/Why/footer, do not add another profession/tool, do not add pricing/testimonials/FAQ/blog/screenshots/animations, do not modify MatterVault/NoticeFlow.**

