# MICRONEST COMMIT 08 REPORT — STABILIZE ANIMATED CARD RENDERING

**Date:** 2026-09-29 20:45 IST
**Baseline Commit:** `1d3bc84c3935a7a125c936bb8e387f4326337c21` — `fix(marketing): resolve motion card border regression` (07A)
**New Commit:** `28cc9588ddb9010b2d7e692c12044e8a8e3e9493` — `fix(marketing): stabilize animated card rendering`
**RCCF:** RCCF-MICRONEST-UIUX-08 / RCCF-MICRONEST-COMMIT-08 — Static Border Fix

---

## 1. Previous Commit SHA

```
1d3bc84c3935a7a125c936bb8e387f4326337c21
1d3bc84 fix(marketing): resolve motion card border regression
6bacae9 feat(marketing): polish platform hero and motion
e057546 feat(marketing): activate lawyer and MatterVault marketing
```

Verified via `git rev-parse HEAD` and `git log --oneline -3` before commit.

## 2. New Commit SHA

```
28cc9588ddb9010b2d7e692c12044e8a8e3e9493
28cc958 fix(marketing): stabilize animated card rendering
```

Verified via `git rev-parse HEAD` after commit and after push:
```
28cc9588ddb9010b2d7e692c12044e8a8e3e9493
```

## 3. Commit Message

```
fix(marketing): stabilize animated card rendering
```

## 4. Root Cause

**07A did NOT fix the real root cause — visual regression persisted at 375/768/1024/1280/1440 (Chartered Accountants / Lawyers / NoticeFlow / MatterVault outer 1px borders fragmented, content positioned correctly, internal `border-t bg-muted/20` intact).**

Before 08, architecture after 07A (`src/app/page.tsx:41` + `src/components/marketing/profession-card.tsx:7` + `src/app/globals.css:51`) was:

```tsx
<section>Browse
  <Reveal delayMs={0}>               // div.mn-section { opacity 0; transform translateY(8px); transition 400ms }
    <Link class="mn-card rounded-md border p-6">  // 1px solid 6px inside transformed ancestor
```

Same for Featured: `Reveal → Link.mn-card.overflow-hidden.rounded-md.border`. `Reveal` (`src/components/marketing/reveal.tsx:34`) renders `<div class="mn-section {is-visible}">` with `IntersectionObserver threshold 0.15 rootMargin -40px`. `globals.css:51` `.mn-section { opacity 0; transform translateY(8px) } → .is-visible { opacity 1; transform translateY(0) }`.

**Why this breaks:** Parent `transform translateY(8→0)` even at rest (`translateY(0)` → `matrix(1,0,0,1,0,0)`) creates stacking/compositing layer. Child `border 1px` inside that layer at fractional `matrix(...,0.09)` subpixel (during 400ms transition) is antialiased as `0.5px` → horizontal outer borders disappear, vertical fragments, detached `rounded-md 6px` corners. Parent `opacity 0→1` at `0.988` also blends border lighter. Static control `mn-card` without Reveal always `border 1px solid rgb(23,23,23) br 6px tf none op 1` perfect — proves border inside transform is the cause, not `.mn-card` itself. Other factors checked: `overflow-hidden` + `border-radius` clip fractional, `animation` vs `transition`, `IntersectionObserver` timing (`375` all `matrix 8 op 0` before scroll, `768+` Browse `is-visible` Featured `8/0` until scroll), nested wrappers (single 8→0 still one too many), paint/compositing (`translateY(0)` still layer).

Per UI/UX skill **Animation: transform-performance + layout-shift-avoid**: use `transform/opacity` but **border must not be on transformed element or inside transformed ancestor**.

## 5. Fix

**Fix: bordered cards remain completely static; Reveal animation applies only to inner card content; Why section border remains outside animated content; reduced-motion preserved; no new dependencies.**

**Architecture after 08 — static border, inner content animates:**

```
Link.mn-card.rounded-md.border (static, no transform/opacity, 1px solid 6px none/1)
└── Reveal.mn-section (opacity 0→1 translateY 8→0 400ms delay i*60)
    └── h3/p/Badge/workflows

<section>Why
  <h2>Why MicroTools</h2>                 // static
  <div.border-t.pt-6>                      // static border-t
    <Reveal>                               // inner grid animates
      <div.grid.md:grid-cols-3>
```

**Changes vs `1d3bc84` (`git diff --stat` `2 files 36+33` before docs):**

| File | Change |
|------|--------|
| `src/components/marketing/profession-card.tsx:1` | Import `Reveal`, add `delayMs?: number`, outer `Link` static `mn-card rounded-md border hover:bg-accent` (no `p-6`), inner `<Reveal delayMs className="p-6">` wraps `h3/p/Badge`. |
| `src/app/page.tsx:41` | Browse: `Reveal→ProfessionCard` → `ProfessionCard delayMs={i*60}` (pass stagger). |
| `src/app/page.tsx:50` | Featured: `Reveal→Link` → `Link.mn-card.overflow-hidden.rounded-md.border` outer static → `<Reveal delayMs>` inner wraps `p-6` + workflow `border-t bg-muted/20`. |
| `src/app/page.tsx:98` | Why: `Reveal→section` → `section→h2→div.border-t.pt-6` static → `<Reveal><div.grid>` inner. |

`src/app/globals.css` unchanged (reuses `.mn-section` for inner), `src/components/marketing/reveal.tsx` unchanged (observer threshold 0.15), hero `mn-reveal 500ms 0/60/120/180/240` intact.

## 6. Files Committed

**5 files** verified via `git diff --cached --name-only` and `--stat`:

| File | Status | Lines |
|------|--------|-------|
| `src/app/page.tsx` | modified | `50 +--` (Browse invert, Featured invert, Why border-outside) |
| `src/components/marketing/profession-card.tsx` | modified | `19 +-` (add Reveal inner) |
| `.agents/skills.md` | new file | `107 +` |
| `docs/micronest/marketing/MICRONEST-COMMIT-07-REPORT.md` | new file (prior untracked intentional) | `263 +` |
| `docs/micronest/marketing/MICRONEST-UIUX-08-REPORT.md` | new file | `370 +` |

```
git diff --cached --stat:
 .agents/skills.md                                  | 107 ++++++
 .../marketing/MICRONEST-COMMIT-07-REPORT.md        | 263 +++++++++++++++
 .../marketing/MICRONEST-UIUX-08-REPORT.md          | 370 +++++++++++++++++++++
 src/app/page.tsx                                   |  50 +--
 src/components/marketing/profession-card.tsx       |  19 +-
 5 files changed, 776 insertions(+), 33 deletions(-)

git diff --cached --name-only:
.agents/skills.md
docs/micronest/marketing/MICRONEST-COMMIT-07-REPORT.md
docs/micronest/marketing/MICRONEST-UIUX-08-REPORT.md
src/app/page.tsx
src/components/marketing/profession-card.tsx
```

Also `git status --short` before add showed exactly:
```
 M src/app/page.tsx
 M src/components/marketing/profession-card.tsx
?? .agents/
?? docs/micronest/marketing/MICRONEST-COMMIT-07-REPORT.md
?? docs/micronest/marketing/MICRONEST-UIUX-08-REPORT.md
```

No other modified/untracked.

## 7. Documentation Committed

- `.agents/skills.md` — Project guidance documenting actual installed UI/UX skill (see §9 below).
- `docs/micronest/marketing/MICRONEST-COMMIT-07-REPORT.md` — Prior post-commit artifact from `1d3bc84` (263 lines, 07A motion border fix, staged per instruction `If it is an intentional untracked MicroNest report, include it too`).
- `docs/micronest/marketing/MICRONEST-UIUX-08-REPORT.md` — 08 diagnostic report (370 lines, 13 sections: skill, root cause, browser evidence at 5 viewports 6 states, before/after structure, fix, motion, responsive, reduced-motion, validation, files).

## 8. Validation Results

Run before commit (staged, no weakening):

```
pnpm typecheck → tsc --noEmit → PASS (0 errors, Reveal delayMs optional, mn-* typed)
pnpm lint      → eslint       → PASS (0 errors)
pnpm test      → vitest run   → PASS (36 passed | 1 skipped (37), 228 passed | 1 skipped (229), Duration 25.98s)
pnpm build     → next build   → PASS (Compiled 22.3s, TypeScript 4.4s, 12/12 pages: ○ /, ● /profession/chartered-accountants ● /profession/lawyers ● /tools/noticeflow ● /tools/mattervault, ○ /sitemap.xml)
pnpm test:e2e  → playwright test → PASS (16 passed 47.3s: auth 3, notices-pagination 4, smoke 9: root, homepage both professions/tools, NoticeFlow, MatterVault, CA, Lawyers, 404s, sitemap 5 URLs)
```

Also temporary `e2e/verify-08.spec.ts` 10 tests PASS before removal (5 responsive + 5 reduced-motion, see §9) — not counted in 16, removed per `Do not stage temporary tests`.

## 9. Browser / Responsive Verification (from UIUX-08 report §4 + verify-08 after fix)

**After fix `e2e/verify-08.spec.ts` 10 tests (all PASS before removal):**

**Outer `a.mn-card` — at rest (no scroll) all viewports `1px solid 6px none/1`:**

| Viewport | CA | Lawyers | NoticeFlow | MatterVault | Transform | Opacity | Overflow |
|----------|----|---------|------------|-------------|-----------|---------|----------|
| 375 | 327×180 | 327×180 | 327×221 hidden | 327×241 hidden | none | 1 | visible/hidden |
| 768 | 344×180 | 344×180 | 344×221 hidden | 344×221 hidden | none | 1 | — |
| 1024 | 472×160 | 472×160 | 472×221 hidden | 472×221 hidden | none | 1 | — |
| 1280 | 472×160 @160 | 472×160 @648 | 472×221 @160 | 472×221 @648 | none | 1 | — |
| 1440 | 472×160 @240 | 472×160 @728 | 472×221 @240 | 472×221 @728 | none | 1 | — |

→ Complete rectangles, no detached corners, no fragments.

**Inner `.mn-section` inside `a.mn-card` — initial / after scroll:**

- `375` initial: 4 inner `matrix(1,0,0,1,0,8) op 0` (content invisible but outer border visible — stable per principle).
- `768` initial: Browse 2 inner `is-visible matrix(...,0) op 1`, Featured 2 `matrix(...,8) op 0`.
- `1024/1280/1440` initial: same as 768 (Browse visible, Featured below fold).
- After `scrollTo 800 +1000ms`: all 4 inner `matrix(...,0) op 1` at every viewport — content faded inside static border.

**No overflow:** `document.documentElement.scrollWidth <= window.innerWidth` true at all 5.

**Hover:** `first card hover 300ms` at every viewport → outer `tf none` `w 327→327` / `472→472` no jump, border solid.

**Why border:** `div.border-t.pt-6` outside `Reveal` → static top line, grid inside animates.

## 10. Reduced-Motion Verification

`page.emulateMedia({ reducedMotion: "reduce" })` at `/` `375/768/1024/1280/1440`:

- Before scroll: `eyebrow`, `h1`, `p`, `CTAs`, triad `Profession/Workflow/MicroTool` all `animationName none` (via `@media reduce .mn-reveal { animation none opacity1 transform none }`).
- Inner `.mn-section` (now inside card): `opacity 1 transform none transition none` at all viewports (`verify-08` reduced suite: `{"tf":"none","op":"1","tr":"none"}` at 5 viewports) — no entrance animation.
- After `scrollTo 800`: all `.mn-section` still `1/none`.
- Outer `a.mn-card` also `transform none` (already static) — hover `bg-accent` only.
- Nav `Home, CA, NoticeFlow, Lawyers, MatterVault` usable, `Toggle navigation` `aria-expanded`.

PASS at `verify-08` `reduced motion` 5 tests.

## 11. Skill Documentation

Created `.agents/skills.md` (107 lines) per instruction FIRST — documents actual installed skill, not invented:

| Field | Value |
|-------|-------|
| Skill name | `ui-ux-pro-max` |
| Package | `nextlevelbuilder/ui-ux-pro-max-skill` (375.1K installs) |
| Global path | `C:\Users\91866\.agents\skills\ui-ux-pro-max` |
| Entry | `C:\Users\91866\.agents\skills\ui-ux-pro-max\SKILL.md` (214 lines) |
| Search script | `C:\Users\91866\.agents\skills\ui-ux-pro-max\scripts\search.py` |
| References | `references/quick-reference.md` (256 lines, 119 guidelines, 10 priority categories) + `references/pro-rules.md` |
| Data | `data/` 79 styles (50 active), 192 palettes, 74 font pairings, 119 guidelines, 105 icons, 17 GSAP presets, 25 chart types, 22 stacks |
| Install status | `npx skills list -g --json` → global OpenCode copy mode 2026-09-29, also `banner-design, brand, design, design-system, slides, ui-styling` from same package + `find-skills` |
| Searches run | `"border transform fractional" --domain ux` → Transform Performance, `"scroll reveal stagger" --domain gsap` → Scroll Reveal Subtle 300-400ms y 8-16px, `"layout shift avoid" --domain ux` → Content Jumping; verified fit before apply |

File mandates: consult skill before changing `src/app/*`, `src/components/marketing/*`, `globals.css`; log domain/category; visual browser verification mandatory at `375/768/1024/1280/1440` covering 6 states (static without Reveal, inside Reveal, during, after, after scroll, hover) + reduced-motion + no overflow.

## 12. Protected-Area Verification

Verified via `git diff -- <path>` (all empty before commit, staged diff excluded):

| Path | Diff | Contains |
|------|------|----------|
| `src/content/microtools.ts` | `git diff --name-only -- src/content/microtools.ts` → empty | no `2 professions/2 tools` change |
| `src/modules/` | `git diff --name-only -- src/modules/` → empty | no `matter`/`notice`/`document` logic |
| `src/app/app/` | `git diff --name-only -- src/app/app/` → empty | no `app/matters`, `api/matter-documents` |
| `supabase/` | `git diff --name-only -- supabase/` → empty | no `supabase/migrations` `008/009`, no RLS/RPC `is_firm_member` `verify_checklist_item_and_maybe_ready` |
| `package.json` | empty | no deps |
| `pnpm-lock.yaml` | empty | no lock |
| `src/app/profession/[profession]/page.tsx`, `src/app/tools/[tool]/page.tsx`, `src/app/sitemap.ts` | empty via broader `git diff --stat` → only 2 source files changed | — |

Confirmed via `git diff --stat -- src/content/microtools.ts src/modules/ src/app/app/ supabase/ package.json pnpm-lock.yaml` → no output.

## 13. Dependency Verification

- `package.json` unchanged (`git diff -- package.json` empty) — zero new deps.
- `pnpm-lock.yaml` unchanged (`git diff -- pnpm-lock.yaml` empty).
- Checked for `framer-motion`, `motion`, `GSAP`, `Lenis`, `Magic UI`, `Aceternity` — none added; deps remain `next 16.3.6, react 19.1.0, @supabase/ssr 0.7.0, geist 1.7.2, tailwindcss 4.1.8` (build log no install).
- `Reveal` still `React useEffect/useRef/useState` + `IntersectionObserver` native only.

## 14. Push Result

```
git push origin main → 1d3bc84..28cc958  main -> main
To https://github.com/kaushalbhat0-personal/MicroNest-MicroTools.git
```

Verified `git push origin main 2>&1`:
```
   1d3bc84..28cc958  main -> main
```
Exit 0, no force, remote `To https://...`.

## 15. Local/Remote SHA Comparison

```
git rev-parse HEAD                  → 28cc9588ddb9010b2d7e692c12044e8a8e3e9493
git ls-remote origin refs/heads/main → 28cc9588ddb9010b2d7e692c12044e8a8e3e9493  refs/heads/main
```

**Match: YES** — local `HEAD` equals `origin/main`.

Verified via:
```bash
git rev-parse HEAD
# 28cc9588ddb9010b2d7e692c12044e8a8e3e9493
git ls-remote origin refs/heads/main
# 28cc9588ddb9010b2d7e692c12044e8a8e3e9493  refs/heads/main
```

## 16. Final Working-Tree Status

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

Before this report creation, `git ls-files --others --exclude-standard` → empty (no untracked). After creating this report:

```
?? docs/micronest/marketing/MICRONEST-COMMIT-08-REPORT.md
```

However this report instruction notes post-commit report artifact:

- `docs/micronest/marketing/MICRONEST-COMMIT-08-REPORT.md` remains **untracked as post-commit artifact** — intentionally not included in `28cc958` (per `Do NOT create another commit for the post-commit report. It may remain untracked`).

Therefore **commit/push clean:** YES (no remaining source/docs to commit excluding this report).

**Post-commit report untracked:** One intentional file `MICRONEST-COMMIT-08-REPORT.md` (this file) — `git ls-files --others --exclude-standard` after report shows only this file; no other untracked (no `e2e/verify-*.spec.ts` temp, no screenshots, no caches, no secrets, no `node_modules`).

## 17. Any Intentionally Untacked Artifacts

| File | Status | Why uncommitted |
|------|--------|-----------------|
| `docs/micronest/marketing/MICRONEST-COMMIT-08-REPORT.md` | untracked (this file) | Post-commit artifact — per instruction `It may remain untracked` — no extra commit. |
| *(no other untracked)* | — | All prior intentional docs (`MICRONEST-COMMIT-07-REPORT.md`, `MICRONEST-UIUX-08-REPORT.md`, `.agents/skills.md`, source) were committed in `28cc958`. No `e2e/verify-08.spec.ts` temp (removed before commit), no screenshots, no caches. |

---

## Explicit Confirmations

- 0 new dependencies — `package.json`/`pnpm-lock.yaml` no diff
- no database changes — `supabase/` empty
- no migrations — `supabase/migrations` empty
- no RLS changes — no `is_firm_member` policy change
- no RPC changes — no `verify_checklist_item_and_maybe_ready` change
- no auth changes — `proxy.ts`/`supabase-service.ts` empty
- no authenticated app changes — `src/app/app/**` empty
- no MatterVault business logic changes — `src/modules/matter/**` empty
- no NoticeFlow business logic changes — `src/modules/notice/**` empty
- implementation NOT modified after verification — only the verified 08 staged fix committed, no redesign, no new animation, no new tools/professions

---

**STOP** — Marketing surface frozen at `28cc958`. No redesign, no more animation, no more professions/tools, no pricing/testimonials/FAQ/blog, no MatterVault/NoticeFlow modification.
