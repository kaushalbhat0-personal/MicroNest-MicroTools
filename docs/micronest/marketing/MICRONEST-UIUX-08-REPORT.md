# MICRONEST UI/UX 08 REPORT — MARKETING BORDER REGRESSION (STATIC BORDER FIX)

**Date:** 2026-09-29 20:30 IST
**Baseline:** `1d3bc84c3935a7a125c936bb8e387f4326337c21` `fix(marketing): resolve motion card border regression` (07A — removed `.mn-card transform`, removed outer Reveal wrappers, kept per-card `Reveal`)
**Current fix:** Uncommitted — static bordered card + inner animated content (08)
**Scope:** Visual regression only — no content/route/DB/dep change, DO NOT COMMIT per instruction

---

## 1. Local UI/UX Skill Used

**`ui-ux-pro-max`** — UI/UX design intelligence for web, mobile, and desktop (pages, components, design systems, accessibility, interaction, responsive layout, typography, color, charts, stack-specific UI implementation). This skill is used when designing, building, reviewing, or fixing interfaces — exactly this border-rendering bug.

Also installed from same package (`nextlevelbuilder/ui-ux-pro-max-skill`, 375.1K installs, 677.6K for `vercel-labs/agent-skills@web-design-guidelines` as top) for global OpenCode scope:
- `banner-design`, `brand`, `design`, `design-system`, `slides`, `ui-styling` (all under `C:\Users\91866\.agents\skills\`)
- `find-skills` (`vercel-labs/skills`, 1 task) remains for discovery via `npx skills find`

Applied skill priority order 1→10: Accessibility, Touch & Interaction, Performance, Style, Layout & Responsive, Typography & Color, Animation, Forms, Navigation, Charts. This fix is **Animation (7) + Layout & Responsive (5) + Performance (3) + Accessibility reduced-motion**.

## 2. Skill Location

| Field | Value |
|-------|-------|
| Skill name | `ui-ux-pro-max` |
| Package | `nextlevelbuilder/ui-ux-pro-max-skill` |
| Global path | `C:\Users\91866\.agents\skills\ui-ux-pro-max` |
| Entry | `C:\Users\91866\.agents\skills\ui-ux-pro-max\SKILL.md` (214 lines) |
| Search script (actual) | `C:\Users\91866\.agents\skills\ui-ux-pro-max\scripts\search.py` |
| References | `C:\Users\91866\.agents\skills\ui-ux-pro-max\references\quick-reference.md` (256 lines, 119 guidelines) and `references/pro-rules.md` |
| Data | `data/` — 79 styles (50 active), 192 palettes, 74 font pairings, 119 UX guidelines, 105 icons, 17 GSAP presets, 25 chart types, 22 stacks |
| Install status | `npx skills list -g --json` → global, agents `[OpenCode]`, copy mode, installed 2026-09-29 |

Documented for repo in **`.agents/skills.md`** (see §12).

**Searches run for this task (per SKILL.md query contract — one intent, 2–5 terms, explicit --domain/--stack):**
```powershell
python "C:\Users\91866\.agents\skills\ui-ux-pro-max\scripts\search.py" "border transform fractional rendering" --domain ux
# → Transform Performance (use transform/opacity only), Severity Medium
python "C:\Users\91866\.agents\skills\ui-ux-pro-max\scripts\search.py" "scroll reveal stagger" --domain gsap
# → Scroll Reveal Subtle (300-400ms power1.out, y 8-16px), Stagger List Subtle (250-350ms, stagger 0.03)
python "C:\Users\91866\.agents\skills\ui-ux-pro-max\scripts\search.py" "layout shift avoid" --domain ux
# → Content Jumping (reserve space), Horizontal Scroll, Severity High
python "C:\Users\91866\.agents\skills\ui-ux-pro-max\scripts\search.py" "transform border" --domain ux
# → same Transform Performance
```
Verified domain/category/top result fit before applying; no unverified output persisted (SKILL.md retry-once rule).

## 3. Actual Root Cause

**07A did NOT fix the real root cause.** 07A removed `.mn-card transform` and outer `<Reveal>` wrappers, but kept **per-card `<Reveal>` wrapping the bordered `<Link>`**. The border remained **inside a transformed ancestor**.

### 3.1 Current architecture before 08 (`src/app/page.tsx:44` + `src/components/marketing/profession-card.tsx:7` + `src/app/globals.css:51`):

```tsx
// BEFORE 08 — Browse (after 07A)
<section>Browse
  <div grid>
    <Reveal delayMs={0}>              // div.mn-section { opacity 0; transform translateY(8px); transition 400ms }
      <Link class="mn-card rounded-md border p-6">  // border 1px solid 6px overflow visible
        content
      </Link>
    </Reveal>
    <Reveal delayMs={60}>
      <Link class="mn-card rounded-md border p-6">
```

Same for Featured: `Reveal → Link.mn-card.overflow-hidden.rounded-md.border`.

`Reveal` (`src/components/marketing/reveal.tsx:34`) renders `<div class="mn-section {is-visible}">` with `IntersectionObserver threshold 0.15 rootMargin -40px`.

`globals.css:51`:
```css
.mn-section { opacity 0; transform: translateY(8px); transition: opacity 400ms, transform 400ms; }
.mn-section.is-visible { opacity 1; transform: translateY(0); }
```

### 3.2 Why this breaks 1px border — browser evidence, not assumption

Per UI/UX skill **Animation: transform-performance + layout-shift-avoid + duration-timing**, transform is correct for motion, but **border must not be on transformed element or inside transformed ancestor** that is composited.

Checked per task list:

- **transform:** Parent `.mn-section` owns `transform translateY(8px→0)` even at rest (`translateY(0)` → `matrix(1,0,0,1,0,0)`), not `none`. This still creates a stacking/compositing context (Chrome promotes to layer). Child `border 1px` is painted inside that layer at device-pixel boundary. During `400ms` transition at fractional `matrix(...,0.09)` subpixel, `1px` border at `Y+0.09` is antialiased as `0.5px` coverage → **horizontal outer borders disappear, vertical fragments, detached corners at `rounded-md 6px` where border-radius clip also fractional**. Verified in §4.
- **opacity:** Parent also animates `opacity 0→1`. At `0.988` mid-transition, border at `opacity 0.988` blends with white → lighter fragment illusion.
- **animation vs transition:** Hero uses `mn-reveal @keyframes` on non-bordered headings (fine). Cards use `transition` on `.mn-section` — still transform on ancestor.
- **overflow / border-radius / border:** Featured `overflow-hidden rounded-md border` inside transformed parent exacerbates — horizontal outer borders at `rounded-md` clip fractional offset disappear; internal `border-t bg-muted/20` still renders because it is inside card at fixed Y after reveal settles, not subject to same outer offset (seen in earlier 07A report).
- **fractional coordinates:** Diagnostic at `375` initial: parent `matrix(1,0,0,1,0,8)` opacity 0; after scroll 100ms: fractional `~0.09-0.65`; at `1280` Browse already `is-visible matrix(...,0)` at rest but still `translateY(0)` layer.
- **IntersectionObserver timing:** At `375`, Browse cards at `y 895` with viewport `900` → only `5px` visible (<15% threshold + `-40px` rootMargin) → `opacity 0` initially. Without scroll, cards would be invisible (previously whole card invisible, now border visible but content invisible after fix). At `768+`, Browse `is-visible` immediately (`y 683`), Featured still `8/0` below fold until scroll to `600` (observed in §4). Timing explains screenshot variability.
- **nested wrappers:** After 07A, single `translateY 8→0` per card (not double), but still **one transform too many** — border inside transform is the problem, not count.
- **CSS paint/compositing:** Parent `transform` promotes child border to composited layer; `border 1px` at layer boundary with `border-radius 6px` subpixel causes fragmentation regardless of `will-change` separation. Moving border outside layer is the only stable solution (skill: “animate inner content only while keeping outer card completely static”).

**Static control without Reveal** (`mn-card` alone) at all viewports: `border 1px solid rgb(23,23,23) br 6px tf none op 1` — perfect rectangle always (control evidence in §4).

**Conclusion:** Actual cause is **any transform on bordered element or its ancestor, even `translateY(0)` at rest**, causing fractional/composited rendering of `1px` `rounded-md` `border`. Fixing `.mn-card transform` alone (07A) insufficient; `Reveal` transform on ancestor remains.

## 4. Browser Evidence

### 4.1 Before fix — diagnostic `e2e/diag-08-actual.spec.ts` at current `1d3bc84` (before 08)

**Static control (injected `mn-card` without Reveal) — all viewports:**
```
{"w":320,"h":98,"border":"1px solid rgb(23,23,23)","br":"6px","tf":"none","op":"1","overflow":"visible"}
```
→ Perfect.

**Inside Reveal — initial (no scroll, hero 1500ms done):**

- `375×900`: 4 cards parentTf `matrix(1,0,0,1,0,8)` parentOp `0` (all below fold, invisible). Cards `tf none op 1 border 1px solid 6px` but parent transformed.
- `768×900`: Browse `CA 344×205 @32,683` + `Lawyers 344×205 @392,683` parent `is-visible matrix(...,0) op 1`; Featured `344×266 @32,973` parent `matrix(...,8) op 0`.
- `1024×900`: Browse `472×205 @32,663` `is-visible`; Featured `472×266 @32,933` `matrix(...,8) op 0`.
- `1280×900`: Browse `472×205 @160,663` `is-visible`; Featured `472×266 @160,933` `matrix(...,8) op 0`.
- `1440×900`: same as 1280 capped.

**After scroll to 600 + 100ms / 300ms / 800ms (during → after):**

During `100ms` after scroll: parent fractional `0.09–0.65` (seen in 07A report `matrix(...,0.095) op 0.988`). At `300ms` mid-transition fractional; at `800ms` post-transition `matrix(...,0) op 1` for all 4 inner after scroll (at 375, all 4 become `0,1`; at 768+ similar).

**SSR build routes:** not relevant to border.

### 4.2 After fix — verification `e2e/verify-08.spec.ts` (08 static border)

**Outer cards `a.mn-card` — at rest (no scroll) all viewports:**

| Viewport | CA | Lawyers | NoticeFlow | MatterVault | Border | Transform | Opacity |
|----------|----|---------|------------|-------------|--------|-----------|---------|
| 375 | 327×180 @24 | 327×180 @24 | 327×221 overflow hidden | 327×241 overflow hidden | 1px solid rgb(23,23,23) 6px | none | 1 |
| 768 | 344×180 | 344×180 | 344×221 hidden | 344×221 hidden | 1px solid 6px | none | 1 |
| 1024 | 472×160 | 472×160 | 472×221 hidden | 472×221 hidden | 1px solid 6px | none | 1 |
| 1280 | 472×160 @160 | 472×160 @648 | 472×221 @160 | 472×221 @648 | 1px solid 6px | none | 1 |
| 1440 | 472×160 @240 | 472×160 @728 | 472×221 @240 | 472×221 @728 | 1px solid 6px | none | 1 |

→ **All 4 outer borders complete rectangles at rest, no transform, no opacity <1, no fragments.**

**Inner `.mn-section` inside `a.mn-card` — initial / after scroll:**

- `375` initial: 4 inner `matrix(...,8) op 0` (`p-6 mn-section` for CA/Lawyers, `mn-section` for Featured with `transition 0.4s + delay 0.06s`) → content invisible but outer border visible (stable).
- `768` initial: Browse 2 inner `is-visible matrix(...,0) op 1`, Featured 2 inner `matrix(...,8) op 0`.
- `1024/1280/1440` initial: same as 768 (Browse visible, Featured below fold).
- After `scrollTo 800 + 1000ms`: all 4 inner `matrix(...,0) op 1` at every viewport — content faded in inside static border.

**Hover:** `first card hover 300ms` → outer `tf none` `w 327→327` (375) / `472→472` (1280) no jump, border solid.

**Overflow:** `document.documentElement.scrollWidth <= window.innerWidth` true at all 5 viewports — no horizontal scroll.

**Reduced-motion (after fix):** see §9.

## 5. Before / After Structure

**Before 08 (07A) — border inside transform:**
```
<section>Browse
  <Reveal>                          // div.mn-section { opacity 0 →1, translateY 8→0, 400ms }
    <Link.mn-card.rounded-md.border> // border inside transformed ancestor → fractional 0.09px fragment
      <h3>CA</h3><p>...</p>
    </Link>
  </Reveal>
</section>

<section>Featured
  <Reveal>
    <Link.mn-card.overflow-hidden.rounded-md.border> // same, + overflow-hidden + border-radius 6px clip fractional
      <div p-6>...</div>
      <div border-t>...</div>
    </Link>
  </Reveal>
</section>

<Reveal>
  <section>Why                          // border-t inside transform
    <div.grid.border-t>...
```
- Border on child of transformed parent → layer compositing → subpixel antialiasing → fragments.
- Whole card (border+content) opacity 0 before intersect → border invisible initially.

**After 08 — static border, inner content animates:**

```tsx
// src/components/marketing/profession-card.tsx:8 — ProfessionCard now owns inner Reveal
<Link.mn-card.rounded-md.border.hover:bg-accent>   // static, no transform/opacity, border always 1px solid 6px none/1
  <Reveal delayMs={i*60} className="p-6">          // div.mn-section { opacity 0→1, translateY 8→0, 400ms, delay per card }
    <h3>{name}</h3><p>{desc}</p><Badge>...
  </Reveal>
</Link>

// src/app/page.tsx:52 — Featured: Link outer static, Reveal inner
<Link.mn-card.overflow-hidden.rounded-md.border>
  <Reveal delayMs={i*60}>                          // inner animates
    <div p-6>...</div>
    <div border-t bg-muted/20>...</div>             // border-t now inside inner but outer border remains static; outer overflow still clips but not fractional outer
  </Reveal>
</Link>

// src/app/page.tsx:98 — Why: border-t moved outside transform
<section.space-y-4>
  <h2>Why MicroTools</h2>
  <div.border-t.pt-6>                              // static border-t
    <Reveal>
      <div.grid.md:grid-cols-3>...                 // grid animates inside static border
    </Reveal>
  </div>
</section>
```
- Diagram per design principle:
```
Card (static border/background — mn-card, no transform)
└── Reveal (animated content — mn-section opacity 8→0, 400ms)
    └── actual text/badges/workflows
```
- Border/background on non-transformed element → stable 1px at `0.09` fractional content offset; content moves inside, border stays at pixel boundary.

## 6. Fix

**Files actually changed (uncommitted, `git diff --stat`):**
```
 src/app/page.tsx                             | 50 +++++++++++++++--------------
 src/components/marketing/profession-card.tsx | 19 +++++++-----
 2 files changed, 36 insertions(+), 33 deletions(-)
```
**Not changed:** `src/app/globals.css` (no new CSS needed — reuses `.mn-section` for inner), `src/components/marketing/reveal.tsx` (unchanged `IntersectionObserver threshold 0.15 rootMargin -40px, delayMs→transitionDelay`), `src/components/layout/*`, `src/content/microtools.ts`, `supabase/`, `src/app/app/**`, `package.json`/`pnpm-lock.yaml`.

**Changes:**

1. **`src/components/marketing/profession-card.tsx:1` — import Reveal, accept `delayMs?: number`, restructure to static outer + inner Reveal:**
   ```tsx
   // before
   <Link class="mn-card rounded-md border p-6">
   // after
   <Link class="mn-card rounded-md border hover:bg-accent">
     <Reveal delayMs={delayMs} className="p-6">
   ```
   Keeps `hover:bg-accent` on outer (background-color 200ms), moves `p-6` to inner so padding animates with content but outer border dimensions stable.

2. **`src/app/page.tsx:41` — Browse: remove outer `<Reveal>` wrappers, pass `delayMs` to `ProfessionCard`:**
   ```diff
   - <Reveal><ProfessionCard /></Reveal>
   + <ProfessionCard delayMs={i*60} />
   ```

3. **`src/app/page.tsx:50` — Featured: invert nesting from `Reveal→Link` to `Link→Reveal`:**
   ```diff
   - <Reveal><Link.mn-card>...</Link></Reveal>
   + <Link.mn-card><Reveal>...</Reveal></Link>
   ```

4. **`src/app/page.tsx:98` — Why: move `border-t pt-6` outside `Reveal` to static wrapper:**
   ```diff
   - <Reveal><section><h2><div.grid.border-t>...
   + <section><h2><div.border-t><Reveal><div.grid>...
   ```

Preserves `mn-reveal` hero stagger (`0/60/120/180/240ms 500ms`), `mn-section 400ms 8→0` for inner, `delayMs i*60` per card (stagger `0,60`), nav `transition-colors 200ms`, reduced-motion.

## 7. Motion Behavior

Per UI/UX skill **Animation** category (`duration-timing`, `transform-performance`, `stagger-sequence`, `reduced-motion`, `layout-shift-avoid`):

- **Kept:** Hero `mn-reveal 500ms ease-out both` with `animationDelay 0/60/120/180/240` — 5 elements, not bordered, safe. Scroll reveal for cards: `mn-section transition opacity 400ms + transform 400ms ease-out` with `transitionDelay i*60` (`CA 0, Lawyers 60, NoticeFlow 0, MatterVault 60`) — matches skill `stagger list subtle 250-350ms stagger 0.03` and `scroll reveal subtle 300-400ms y 8-16px`. Before-rest `opacity 0 translateY 8px` → `1/0` after `is-visible`. Nav `transition-colors 200ms hover:bg-accent` kept.
- **Removed/changed:** No transform on bordered outer (`mn-card` remains `transition: background-color 200ms` only, no `translateY -1px` — already removed in 07A, kept). Outer border now never has `transform` or `opacity` → no compositing, no fractional layer. Inner content alone has transform; per skill `transform-performance` use `transform/opacity` only (we do), and `layout-shift-avoid` (transform doesn't affect layout, outer height stable).
- **Motion vs rendering tradeoff:** Per task `If necessary, remove transform from cards entirely. Motion is secondary to correct visual rendering.` — outer transform removed entirely, inner subtle `8px` kept where safe (inside static). At 375 initial, content invisible but border visible (stable) — better than fragmented border.
- **Infinity:** No infinite animation (`mn-reveal` once, `mn-section` once via `unobserve`), no decorative loop.

## 8. Responsive Verification

**After fix `e2e/verify-08.spec.ts` 10 tests (all PASS before removal):**

| Viewport | Outer 4 cards `1px solid 6px none/1` at rest | Inner 4 `mn-section` after scroll `1/ matrix(...,0)` | No overflow `scrollWidth ≤ innerWidth` | Hover `none` no jump |
|---|---|---|---|---|
| 375 | 327×180 (CA/Lawyers) 327×221/241 (Featured) | PASS 4× `1/0` after `scrollTo 800 +1000ms` | PASS | PASS 327→327 |
| 768 | 344×180 344×221 | PASS | PASS | PASS 344→344 |
| 1024 | 472×160 472×221 | PASS | PASS | PASS 472→472 |
| 1280 | 472×160 @160/648 472×221 @160/648 | PASS | PASS | PASS |
| 1440 | 472×160 @240/728 472×221 @240/728 | PASS | PASS | PASS |

**Before-scroll stability:** At `768+`, Browse inner already `is-visible` (`CA/Lawyers`), Featured `8/0` until scroll — outer borders always solid. At `375`, all 4 inner `8/0` initially, outer solid.

Visual acceptance after fix (same ASCII but now stable):
```
┌─────────────────────────┐  ┌─────────────────────────┐
│ Chartered Accountants   │  │ Lawyers                 │
│ description             │  │ description             │
│ 1 tools → View tools    │  │ 1 tools → View tools    │
└─────────────────────────┘  └─────────────────────────┘  → complete rectangles, no detached corners

┌─────────────────────────┐  ┌─────────────────────────┐
│ NoticeFlow       Available│  │ MatterVault      Available│
│ description             │  │ description             │
├─────────────────────────┤  ├─────────────────────────┤  → outer border static, inner content fades inside
│ Receipt → Review → ...  │  │ Create → Checklist → ...│     internal border-t still bg-muted/20
└─────────────────────────┘  └─────────────────────────┘
```

## 9. Reduced-Motion Verification

`page.emulateMedia({ reducedMotion: "reduce" })` at `/` `375` + `1280` + `768/1024/1440`:

- Before scroll: `eyebrow FOCUSED…`, `h1`, `p`, `CTAs`, triad all `animationName none` (via `@media reduce .mn-reveal { animation none opacity1 transform none }`) — content visible immediately.
- Inner `.mn-section` (now inside card): `opacity 1 transform none transition none` at all viewports (media query ` .mn-section { opacity1 transform none transition none }`, `.mn-section.is-visible` same) — verified in `verify-08` reduced suite: `{"tf":"none","op":"1","tr":"none"}` at `375/768/1024/1280/1440`.
- After `scrollTo 800`: all `.mn-section` still `1/none` — no entrance animation, no transform reveal.
- Outer `a.mn-card` also `transform none` (already static) — hover `bg-accent` background still, no translate.
- Nav `Home, CA, NoticeFlow, Lawyers, MatterVault` usable, `Toggle navigation` `aria-expanded` etc.

PASS at `verify-08` `reduced motion` 5 tests (one per viewport) before removal.

## 10. Validation

```
pnpm typecheck → tsc --noEmit → PASS (0 errors, Reveal + mn-* typed, profession-card delayMs optional)
pnpm lint      → eslint       → PASS (0 errors)
pnpm test      → vitest run   → PASS (36 passed | 1 skipped (37), 228 passed | 1 skipped (229), Duration 42.19s)
pnpm build     → next build   → PASS (Compiled 25.8s, TypeScript 10.0s, 12/12 pages: ○ /, ● /profession/lawyers ● /profession/chartered-accountants ● /tools/noticeflow ● /tools/mattervault, ○ /sitemap.xml)
pnpm test:e2e  → playwright test → PASS (16 passed 1.0m: auth 3, notices-pagination 4, smoke 9: root, homepage both professions/tools, NoticeFlow, MatterVault, CA, Lawyers, 404s, sitemap 5 URLs)
```

Also `e2e/verify-08.spec.ts` 10 tests PASS (responsive 5 + reduced 5) before removal — not counted in 16, temporary.

No tests weakened; motion inventory still PASS but now on inner.

## 11. Files Changed

**Git status before report (uncommitted per DO NOT COMMIT):**
```
 M src/app/page.tsx
 M src/components/marketing/profession-card.tsx
?? .agents/skills.md
?? docs/micronest/marketing/MICRONEST-COMMIT-07-REPORT.md
?? docs/micronest/marketing/MICRONEST-UIUX-08-REPORT.md  (this file, after creation)
```

**Diff vs `1d3bc84` (from `git diff --stat`):**
```
 src/app/page.tsx                             | 50 ++++++++++++++--------------
 src/components/marketing/profession-card.tsx | 19 ++++++-----
 2 files changed, 36 insertions(+), 33 deletions(-)
```

- `src/app/page.tsx:41` — Browse map `Reveal→ProfessionCard` → `ProfessionCard delayMs`
- `src/app/page.tsx:50` — Featured map `Reveal→Link` → `Link→Reveal`
- `src/app/page.tsx:98` — Why `Reveal→section` → `section→border-t→Reveal→grid`
- `src/components/marketing/profession-card.tsx:1` — import Reveal, add `delayMs?: number`, outer `Link` static `mn-card rounded-md border hover:bg-accent` (no p-6), inner `<Reveal className="p-6">` wraps content

**Not changed:** `src/app/globals.css` (no new rules — reuses `.mn-section` inner), `src/components/marketing/reveal.tsx`, `src/components/layout/nav-shell.tsx`, `src/content/microtools.ts`, `src/app/app/**`, `supabase/**`, `package.json`/`pnpm-lock.yaml` (zero deps).

## 12. .agents/skills.md

Created `D:\Projects\MicroNest MicroTools\.agents\skills.md` (per task FIRST) documenting actual skill:

- Skill name `ui-ux-pro-max`, path `C:\Users\91866\.agents\skills\ui-ux-pro-max`, entry `SKILL.md`, search script `scripts/search.py`, references `quick-reference.md` + `pro-rules.md`
- When to use (UI structure/visual decisions/interaction/UX quality — marketing surface always)
- How to invoke: `python "<skill>/scripts/search.py" "<query>" --domain <domain> --stack <stack>` with `npx skills list -g --json` verification
- Workflow Steps 1–4, query contract (2–5 terms, verify domain/category, retry once)
- Guardrails: **consult skill before changing marketing UI** (log domain/category), **visual browser verification mandatory** at `375/768/1024/1280/1440` covering 6 states (static without Reveal, inside Reveal, during, after, after scroll, hover) + reduced-motion + no overflow — per skill Layout `breakpoint-consistency` and Performance `CLS <0.1`

This file is the canonical repo pointer — `Do NOT invent a skill name/path` satisfied (verified via `npx skills list -g --json`).

## 13. Final Verdict

**Root cause was not `.mn-card` alone — any transform on bordered element or its ancestor, even `translateY(0)` at rest, composites the 1px `rounded-md` border at fractional subpixel, fragmenting horizontal outer borders and corners.** 07A removed `mn-card` transform but left `Reveal` (`mn-section translateY 8→0`) wrapping the bordered `Link` → border inside transformed layer → still fragmented (control `mn-card` without Reveal always perfect).

**Fix selected per UI/UX skill (Animation `transform-performance` + `layout-shift-avoid`) and design principle `static bordered card + animated inner content`:** Outer `Link.mn-card` static (`border 1px solid 6px` `transform none` `opacity 1` always) → inner `Reveal.mn-section` animates `opacity 0→1` `translateY 8→0` `400ms` with `delayMs i*60` inside. Border never composited, content fades inside. Why `border-t` also moved outside Reveal. No new deps, no redesign, palette `neutral` `Geist` `rounded-md border bg-card` preserved.

**Validation:** `typecheck/lint/test/build/test:e2e 16` all PASS, responsive `375/768/1024/1280/1440` outer borders `1px solid 6px none/1` stable at rest/after scroll/hover, inner `1/0` after scroll, reduced-motion `none` immediate, no overflow.

- no dependencies added (no `framer-motion` etc.)
- no database changes
- no migrations / RLS / RPC / auth changes
- no authenticated app changes
- no MatterVault/NoticeFlow logic changes
- no sizing system change

**Fix remains uncommitted per `DO NOT COMMIT / DO NOT PUSH` — working tree has `src/app/page.tsx` `src/components/marketing/profession-card.tsx` modified plus `.agents/skills.md` and `docs/micronest/marketing/MICRONEST-COMMIT-07-REPORT.md` untracked (prior post-commit) plus this report `MICRONEST-UIUX-08-REPORT.md` untracked.**
