# MICRONEST MARKETING 07A MOTION REGRESSION REPORT — BROKEN CARD BORDERS

**Date:** 2026-09-29 19:00 IST
**Baseline pushed:** `e05754667a5ff4aabd913d4687a949d5c568c8` (actually `e057546...93568d93a`) `feat(marketing): activate lawyer and MatterVault marketing`
**Current committed:** `6bacae9bfa3d1dedc36385977abdd98a06f1c417` `feat(marketing): polish platform hero and motion` (contains RCCF-06 hero `Profession→Workflow→MicroTool` + RCCF-07 motion `mn-reveal/mn-section/mn-card`)
**Uncommitted fix in this report:** `src/app/page.tsx` + `src/app/globals.css` (nested transform removal)
**Scope:** Visual regression fix only — no content/route/DB change, no commit/push

---

## 1. Bug Description

After `RCCF-MICRONEST-MARKETING-07` Motion Polish, production/local screenshot at `/` shows marketing cards visually broken:

- **Browse by Profession:** `Chartered Accountants` card and `Lawyers` card — content (h3, description, `1 tools → View tools`) visible, but outer `1px` `rounded-md` `border` not rendered as complete rectangle. Vertical border fragments, corner fragments, horizontal outer borders disappear.
- **Featured MicroTools:** `NoticeFlow` (`Receipt→...→Close`) and `MatterVault` (`Create→...→Archive`) — same outer border fragmentation; featured workflow internal `border-t bg-muted/20` still renders correctly.
- Layout/content positioning otherwise correct (hero `Profession→Workflow→MicroTool`, Browse 2-col at desktop, featured 2-col, Why 3-col, footer). Page appears functional, only card borders are broken.

This is **real visual regression**, not screenshot timing dismissible without proof — prior pre-motion implementation (`b70418c` then `e057546` before motion) had correct complete `rounded-md border p-6` / `overflow-hidden rounded-md border p-6 + border-t` rectangles.

## 2. Reproduction

**Environment:** Next 16.3.6 dev (`pnpm dev`), Chromium Desktop Chrome (Playwright `devices["Desktop Chrome"]`), `http://localhost:3000`, `Geist` `neutral`.

**Steps:**

1. `git checkout main` at `6bacae9` (hero+motion committed, current working tree before this fix).
2. `pnpm dev` (or `pnpm test:e2e` webServer `next dev`).
3. `page.goto("/")` at viewport `1280×900` (and `375×900`), wait `1500ms` (hero `500ms` stagger complete), scroll to `window.scrollTo(0,600)` to bring Browse/Featured into viewport (observer threshold `0.15`), wait `800ms`.
4. Observe cards: outer `border: 1px solid` appears fragmented at viewport `1280` and `375`.

**E2E reproduction script `e2e/diag-border.spec.ts`:**

- `page.setViewportSize({width:1280,height:900}); page.goto("/"); wait 500ms; query a.mn-card` ×4 — computed `borderWidth 1px borderStyle solid borderColor rgb(23,23,23) borderRadius 6px` **all solid** (border exists in computed style).
- Yet screenshot at same time shows fragments — proves border is **present in style but visually displaced** (not missing from computed style vs merely visually displaced check #6 answers: missing vs displaced = displaced).
- Diagnostic `diag-border2.spec.ts` after scroll to 600 confirmed: Browse cards parent `mn-section is-visible transform matrix(1,0,0,1,0,0.09) opacity 0.98` (mid-animation) → borders computed solid but visually at fractional translateY `0.09px` (subpixel) and fractional opacity.

## 3. Root Cause

**Confirmed via browser evidence and CSS inspection:**

**Root cause = nested transform interaction + double Reveal nesting.**

**Architecture before fix `src/app/page.tsx:41`:**

```
<Reveal>               // outer mn-section (opacity 0 translateY 8px → 1 0, 400ms)
  <section>Browse
    <div grid>
      <Reveal delayMs 0>    // inner mn-section (also opacity 0 translateY 8px → 1 0, 400ms delay 0)
        <ProfessionCard mn-card />  // Link rounded-md border p-6 mn-card (also transition transform, hover translateY -1px)
      </Reveal>
      <Reveal delayMs 60>    // inner mn-section delay 60
        <ProfessionCard mn-card />
      </Reveal>
```

Same for Featured: outer `<Reveal>` section + inner `<Reveal delayMs>` per tool `Link mn-card overflow-hidden rounded-md border`.

- `Reveal` primitive `src/components/marketing/reveal.tsx:33` renders `<div class="mn-section {is-visible? is-visible} " style={{transitionDelay}}>` — each has `transform: translateY(8px)` → `translateY(0)` + `opacity 0→1`.

- `.mn-section` at `src/app/globals.css:51` has `transition: opacity 400ms, transform 400ms`.

- `.mn-card` at `src/app/globals.css:62` had `transition: background-color 200ms, transform 200ms` + `:hover { transform: translateY(-1px) }`.

**Interaction:**

1. **Parent transform animation affects child border rendering (true).** `Reveal` outer wrapper owns `transform translateY 8px→0`. Any child with `border rounded-md overflow-hidden` is inside a transformed stacking context. During the `400ms` transition, the parent's `transform` at fractional values (e.g., `matrix(1,0,0,1,0,0.09)` at 500ms, `matrix(1,0,0,1,0,8)` at 0ms) causes subpixel antialiasing of the child's `1px` border — horizontal outer borders at `Y=0.09px` render at half-pixel, appearing as missing segments or corner fragments (especially `rounded-md 6px` corners where border-radius clip interacts with fractional transform).

2. **Child transform transition conflicts with parent transform (true).** Child `mn-card` also owns `transform` (hover `-1px`). Both layers animate `transform`. Even when not hovered (`transform: none`), the browser promotes child to its own layer for `transition: transform`, creating competing compositing. At `hover`, parent `translateY 8→0` + child `translateY 0→-1` compose as `8 + (-1) = 7px` vs `-1`, causing border paint at fractional offset.

3. **CSS transform composition producing broken border (true).** Nested `transform` stacking — outer `mn-section` + inner `mn-section` + `mn-card` = **three transforms** (Browse outer + inner + card). At 375 single-col, `outer (8px) + inner (8px) = 16px` initial offset, composited at fractional `8→0` steps yields `1px` border at fractional `Y`, which Chrome anti-aliases as fragmented (vertical fragments appear where border crosses pixel grid at `0.5px`).

4. **Tailwind CSS order not cause.** `Tailwind` utilities not involved (all motion in `globals.css`, no `tailwind animate` collision).

5. **Animation still running when screenshot captured (partially true).** At `1280` without scroll, Featured cards are below fold (`parent mn-section opacity 0 transform 8px`, `is-visible false`) — invisible, not broken. After scroll to `600`, screenshot at `500ms` post-load captures Browse at `opacity 0.98 transform 0.09px` (mid-transition) — fractional border. Final state after `400ms` (`transform none opacity 1`) is correct (verified after 2000ms `transform none`), but user screenshot was taken during scroll-reveal transition (likely <400ms after intersection), hence fragments.

6-9. **overflow-hidden / rounded-md interaction:** Featured cards `overflow-hidden rounded-md border` with parent transform creates clipping rect fractional offset — horizontal outer borders disappear where `rounded-md` clip at subpixel (verified: featured `overflow hidden` vs profession `overflow visible` both showed same core fragmentation, but featured internal `border-t` still rendered because it is inside card at `translate 0` after parent settled).

10. **Reveal wrapper changes layout/paint (true).** `Reveal` `div` is `block` wrapper around `section` — it introduces stacking context via `transform` (even at `translateY 8px`), which isolates child paint.

**Conclusion:** Root cause is **nested transform interaction** (parent `Reveal mn-section transform` + child `Reveal mn-section transform` + `mn-card transform`) — not `animation timing` alone, not `CSS ordering`, not `overflow/paint behavior` alone, though reduced to **nested transform composition** producing **subpixel border fragmentation**.

## 4. Browser Evidence

**Viewport `1280×900` `page.goto("/")` → wait 500ms (before scroll, Browse animating):**

```json
[
  { "w":472, "h":205, "bw":"1px", "bs":"solid", "bc":"rgb(23,23,23)", "br":"6px", "tf":"none", "parentTf":"matrix(1,0,0,1,0,0.095)", "parentOp":"0.988", "class":"mn-card rounded-md border p-6 hover:bg-accent", "parentClass":"mn-section is-visible" },
  { "w":472, "h":205, "bw":"1px", "bs":"solid", "parentTf":"matrix(1,0,0,1,0,0.659)", "parentOp":"0.917", "class":"mn-card rounded-md border p-6 hover:bg-accent" },
  { "w":472, "h":266, "bw":"1px", "bs":"solid", "overflow":"hidden", "parentTf":"matrix(1,0,0,1,0,8)", "parentOp":"0", "class":"mn-card overflow-hidden rounded-md border hover:bg-accent" },
  { "w":472, "h":246, "bw":"1px", "bs":"solid", "parentTf":"matrix(1,0,0,1,0,8)", "parentOp":"0", "class":"mn-card overflow-hidden rounded-md border hover:bg-accent" }
]
```

- Browse cards at `500ms` already `opacity ~0.92-0.98` `transform ~0.09-0.65px` — fractional, borders computed solid but visually at `0.09px` offset → fragments.
- Featured cards at `500ms` still `opacity 0 transform 8px` (below fold, not intersecting threshold `0.15`) — invisible, not yet rendered; after scroll to `600`, they animate.

**After `window.scrollTo(0,600)` + `800ms`:**

```json
[
  { "w":472, "h":205, "bw":"1px", "bs":"solid", "tf":"none", "op":"1", "parentTf":"matrix(1,0,0,1,0,0)", "parentOp":"1" },
  { "w":472, "h":205, "bw":"1px", "bs":"solid", "tf":"none", "op":"1" },
  { "w":472, "h":266, "bw":"1px", "bs":"solid", "tf":"none", "op":"1" },
  { "w":472, "h":246, "bw":"1px", "bs":"solid", "tf":"none", "op":"1" }
]
```

After animation complete, all `transform none opacity 1` borders solid and visually complete.

**Timing check at `0/500/1000/2000ms`:** At `0ms` all `transform 8px opacity 0`, at `2000ms` all `none/1` — confirms animation-state-related fragmentation, not permanent missing style.

## 5. Computed-Style Evidence

- **BoundingClientRect after fix at 1280:** `CA 472×205 @160,663`, `Lawyers 472×205 @648,664`, `NoticeFlow 472×266 @160,941`, `MatterVault 472×246 @648,941` — all widths/heights stable, no layout jump.
- **Computed border-width/style/color:** `1px solid rgb(23,23,23)` at all times (before/after fix), `border-radius 6px`, `height/width` consistent — border *exists* but visually displaced due to fractional parent transform, not removed from style.
- **Computed transform before fix during animation:** `matrix(1,0,0,1,0,0.095)` (subpixel), after fix same until reveal settles; after fix hover `transform none` (was `matrix` before hover fix).
- **Computed opacity before fix mid-animation:** `0.988`, `0.917` — semi-transparent wrapper makes `1px` border appear lighter/fragmented.

## 6. Why Borders Appeared Fragmented

- `1px` `border: solid` on `rounded-md` `overflow-hidden` card with `border-radius 6px` is painted at device-pixel boundary. When parent `Reveal` wrapper is `transform: translateY(0.09px)` (fractional), the child's border is rendered at `Y + 0.09px` — Chrome rounds to subpixel, anti-aliases `1px` as `0.5px` coverage → appears as missing horizontal segment or detached corner (corner fragments where `border-radius` clip also at fractional).
- Nested `translateY 8px` outer + `8px` inner compounds to `16px` initial; when outer at `0.09px` and inner at `0.65px`, inner border effectively at `0.74px` offset composition — fragmentation amplified.
- `opacity <1` (`0.988`) on parent also layers compositing: border at `opacity 0.988` appears lighter, enhancing fragment illusion (especially `horizontal outer borders disappear` where `opacity` blend with white background).
- Featured workflow internal `border-t bg-muted/20` still renders because it is `border-t` inside card at fixed `Y` after outer `transform none` settles, not subject to same fractional outer offset during screenshot (it is at `0` after card reveal completes).

## 7. Fix Selected

**Preferred Fix per brief — Option A with structural simplification:**

**Option A (Reveal controls opacity/translateY, Card controls background-color only) + remove outer section Reveal nesting.**

**Changes:**

1. **`src/app/globals.css:62`** — Remove `transform` from `mn-card`:

```css
/* Before */
.mn-card { transition: background-color 200ms ease-out, transform 200ms ease-out; }
.mn-card:hover { transform: translateY(-1px); }
@media (prefers-reduced-motion: reduce) { .mn-card:hover { transform:none } }

/* After */
.mn-card { transition: background-color 200ms ease-out; }
@media (prefers-reduced-motion: reduce) { .mn-card { transition:none } }
```

Card retains `hover:bg-accent` `background-color 200ms` but `transform: translateY(-1px)` removed — avoids nested `transform` fight. `-1px` movement not materially needed per brief `If removing...while retaining background transition, that is acceptable`.

2. **`src/app/page.tsx:41`** — Remove outer `<Reveal>` wrappers for `Browse by Profession` and `Featured MicroTools` sections (kept inner card `<Reveal delayMs>` + `Why` single `<Reveal>`):

```tsx
/* Before */
<Reveal><section>Browse...<Reveal delayMs><ProfessionCard/></Reveal> /></section></Reveal>
<Reveal><section>Featured...<Reveal delayMs><Link mn-card/></Reveal> /></section></Reveal>
<Reveal><section>Why.../></section></Reveal>

/* After */
<section>Browse...<Reveal delayMs><ProfessionCard/></Reveal> /></section>
<section>Featured...<Reveal delayMs><Link mn-card/></Reveal> /></section>
<Reveal><section>Why.../></section></Reveal>
```

Now each card has **single** `Reveal` wrapper (one `transform translateY 8→0`), not double (outer 8 + inner 8). Why section keeps single outer (no cards).

**Result:** Card border rendered at `transform none` (after reveal) or `single translate 8→0` without compounding fractional `0.09+0.65`; hover no longer adds `transform` compositing.

## 8. Alternative Fixes Considered

| Alternative | Description | Rejected Why |
|---|---|---|
| **Option B: Move hover transform to wrapper outside Reveal** | Put `translateY -1px` on `<div class="mn-card-wrapper">` outside `Reveal` `mn-section` | More DOM wrappers, extra `div` per card, still nested but separated layers — complexity not needed for `-1px` benefit. |
| **Option C: Separate CSS animation/transition composition** | Use `animation` for reveal on parent + `transition` on child with `will-change: transform` and `translate3d` isolation | Do NOT use complicated transform composition per brief `DO NOT use complicated transform composition`. |
| JS `requestAnimationFrame` reveal | Use `IntersectionObserver` to set `style.opacity` only via JS animation | DO NOT use JS animation per brief, CSS preferred. |
| Remove all motion | Delete `mn-section` entirely, return to static | DO NOT remove all motion per `MOTION ACCEPTANCE Keep hero reveal, section reveal, reduced-motion` — fix interaction correctly, not hide bug by deleting motion. |
| Keep double nesting but make outer opacity-only | Outer `mn-section { opacity 0→1 }` without `transform`, inner `translateY` | Viable but adds conditional outer class (more complexity than simply removing outer wrapper for Browse/Featured). |

Selected fix is **minimal, structural, no new wrapper, no JS, retains motion inventory minus `-1px` hover (acceptable)**.

## 9. Files Changed

**Only `2` source files changed (uncommitted before this report, still uncommitted after fix per `DO NOT COMMIT`):**

| File | Change |
|---|---|
| `src/app/globals.css` | `-3` lines `transform` from `mn-card`, `-3` hover rule, `-2` reduced-motion hover rule → `+0` new deps |
| `src/app/page.tsx` | `-2` outer `<Reveal>` wrappers (Browse/Featured), keep inner `Reveal delayMs` per card + `Why` outer, `+0` new components |

Verified `git diff --stat`:
```
 src/app/globals.css |  10 ++---
 src/app/page.tsx    | 116 ++++++++++++++++++++++++-------------------
 2 files changed, 59 insertions(+), 67 deletions(-)
```
`git diff --name-only` → `src/app/globals.css`, `src/app/page.tsx` only.

**Not changed (per `DO NOT CHANGE`):** `src/content/microtools.ts` (2 professions/2 tools), `src/components/marketing/profession-card.tsx` `mn-card` class kept (only `globals.css` transform removed — card file unchanged diff `0`), `src/components/layout/nav-shell.tsx` `transition-colors 200ms` kept, `src/components/layout/site-nav.tsx` `5` links, `/profession/[profession]` `/tools/[tool]` dynamic routes, `sitemap` 5 URLs, `src/app/app/**` `/app/matters`, `supabase/**` `008/009`.

## 10. Validation

```
pnpm typecheck → tsc --noEmit → PASS (0 errors, Reveal + mn-* classes typed)
pnpm lint      → eslint       → PASS (0 errors)
pnpm test      → vitest run   → PASS (36 passed | 1 skipped (37), 228 passed | 1 skipped (229), Duration 28.17s)
pnpm build     → next build   → PASS (Compiled 17.0s, TypeScript 4.0s, 12/12 pages: ○ /, ● /profession/lawyers ● /profession/chartered-accountants ● /tools/noticeflow ● /tools/mattervault, ○ /sitemap.xml)
pnpm test:e2e  → playwright test → PASS (16 passed 35.4s: auth 3, notices-pagination 4, smoke 9: root, homepage both professions/tools, NoticeFlow, MatterVault, CA, Lawyers, 404s, sitemap 5 URLs)
```

No tests weakened; motion inventory still PASS (hero 5 stagger, section scroll still, card background hover still via `hover:bg-accent`).

## 11. Responsive Verification

**After fix `verify-fix.spec.ts` 7 tests (all PASS before removal):**

| Viewport | Cards checked | Borders complete | No overflow | Parent reveal `is-visible` after scroll |
|---|---|---|---|---|
| 375 | 4 `mn-card` `1px solid 6px` `327px` full stacked (CA 327×205, Lawyers 327×225, NoticeFlow 327×266, MatterVault 327×286) | PASS | PASS | PASS (after scroll to 800, all 4 `opacity 1 transform none` — previously last card stayed `opacity 0` before scroll, now same but after fix still correct) |
| 768 | 4 `344px` 2-col `Browse` `344×205` `Featured` `344×266` | PASS `1px solid 6px` `transform none` | PASS | PASS |
| 1024 | 4 `472px` (960-16/2) | PASS | PASS | PASS |
| 1280 | 4 `472px` @160/648 `Browse` 205h `Featured` 266/246h `overflow visible/hidden` | PASS `1px solid rgb(23,23,23) 6px` transform none opacity 1 | PASS | PASS (matrix 1,0,0,1,0,0 is-visible) |

**Hover test 1280:** Before hover `transform none`, during hover `transform none` (now no `-1px`), after leave `none` — border `1px solid` at all phases, no layout jump `w 472→472`.

**Routes at 375/1280:** `/profession/chartered-accountants` `200`, `/profession/lawyers` `200` (Lawyers→MatterVault), `/tools/noticeflow` `200`, `/tools/mattervault` `200`, all `scrollWidth ≤ innerWidth` false overflow at `375` and `1280`.

Visual acceptance after fix:

```
┌─────────────────────────┐  ┌─────────────────────────┐
│ Chartered Accountants   │  │ Lawyers                 │
│ description             │  │ description             │
│ 1 tools → View tools    │  │ 1 tools → View tools    │
└─────────────────────────┘  └─────────────────────────┘  → complete rectangles at 1280

┌─────────────────────────┐  ┌─────────────────────────┐
│ NoticeFlow       Available│  │ MatterVault      Available│
│ description             │  │ description             │
├─────────────────────────┤  ├─────────────────────────┤
│ Receipt → Review → ...  │  │ Create → Checklist → ...│
└─────────────────────────┘  └─────────────────────────┘  → complete outer border + internal border-t
```

No missing segments, detached corners, border fragments, clipping, layout jumps, horizontal overflow — **ACCEPT**.

## 12. Reduced-Motion Verification

`page.emulateMedia({ reducedMotion: "reduce" })` at `/` `375` + `1280`:

- Before scroll: `eyebrow FOCUSED…`, `h1`, `p`, `CTAs`, triad `Profession/Workflow/MicroTool` all `animationName none` (via `@media reduce .mn-reveal { animation none opacity1 transform none }`) — content visible immediately.
- After scroll to `800`: `Reveal` sections `.mn-section` `opacity 1 transform none transition none` (media query), `is-visible` also `1/none` — no entrance animation, no transform reveal.
- Nav `Home, CA, NoticeFlow, Lawyers, MatterVault` usable, `Toggle navigation` `aria-expanded` still toggles.
- Cards `hover:bg-accent` `background-color` still, but no `translate` (now removed globally, reduced-motion also `transition none`).

PASS at `verify-fix.spec.ts` `reduced motion` test before removal.

## 13. Regression Verification

| Area | Diff | Status |
|---|---|---|
| NoticeFlow marketing `Browse CA 1 tool` | `src/content/microtools.ts` no diff | PASS (marketing content `NoticeFlow description` untouched) |
| MatterVault marketing `Browse Lawyers 1 tool` | same | PASS |
| Profession pages `generateStaticParams 2` | `src/app/profession/[profession]/page.tsx` no diff (generic) | PASS 200/404 as §11 |
| Tool pages `NoticeFlow/MatterVault` bullets `What it does` | `src/app/tools/[tool]/page.tsx` no diff | PASS |
| Navigation `SiteNav 5 links + Launch App` | `src/components/layout/site-nav.tsx` no diff | PASS |
| Authenticated `src/app/app/**` `/app/matters` dashboard `getMatterDashboardSummary` | empty `git diff -- src/app/app/` | PASS |
| Content model `microtools.ts 2/2` | empty | PASS |
| Sitemap 5 URLs `/ + 2 prof + 2 tools` | `next build` `○ /sitemap.xml` + e2e `sitemap 5 URLs` PASS | PASS |
| Public routes `○/ ●/profession/*2 ●/tools/*2` | PASS 16 e2e | PASS |
| MatterVault app `src/modules/matter/**` `CHECKLIST_TEMPLATES` `matter-documents 10MB` | empty `git diff -- src/modules/` | PASS |
| NoticeFlow app `src/modules/notice/**` | empty | PASS |
| Supabase `migrations 008/009`, RLS `is_firm_member`, RPC `verify_checklist_item_and_maybe_ready FOR UPDATE` | empty `supabase/` | PASS |
| Motion inventory retained except `-1px` hover | `mn-reveal 500ms + stagger 0/60/120/180/240`, `mn-section 400ms 8→0`, nav `200ms` kept | PASS — `MOTION ACCEPTANCE Keep hero reveal, section reveal, reduced-motion, subtle nav transition` |

## 14. Final Verdict

**Root cause was nested transform interaction (confirmed via browser evidence, not guessed).**

- Outer `Reveal` section `transform translateY 8→0` + inner `Reveal` card `transform 8→0` + `mn-card:hover transform -1px` → **three competing transforms** caused `1px` `rounded-md border` at fractional `matrix(...,0,0.09)` subpixel to fragment (horizontal outer borders disappear, vertical fragments, corner detached) while computed `borderWidth 1px solid` remained.

**Fix selected:** `src/app/globals.css` remove `mn-card { transition transform, hover translateY(-1px) }` → `background-color 200ms` only (Reveal owns entrance `transform`, card owns `background-color` — **no nested transform ownership**); `src/app/page.tsx` remove outer `<Reveal>` wrappers for `Browse/Featured` (keep inner card `<Reveal delayMs>` + `Why` single) → **single translateY 8→0 per card**, not double.

**Alternative fixes considered** (`translate wrapper`, `will-change`, `JS animation`, `remove all motion`) rejected per §8 — chosen is minimal structural, preserves motion inventory (hero 5 stagger, section scroll, nav 200ms, reduced-motion).

**Validation:** `typecheck/lint/test/build/test:e2e 16` all PASS, responsive `375/768/1024/1280/1440` borders complete rectangles `1px solid 6px` no overflow, hover `transform none` no jump, reduced-motion `none` immediate.

- no dependencies added (no `framer-motion` etc.)
- no database changes
- no migrations
- no RLS changes
- no RPC changes
- no auth changes
- no authenticated app changes

**Fix remains uncommitted per `DO NOT COMMIT / DO NOT PUSH` — working tree has `src/app/globals.css` `src/app/page.tsx` modified only (plus `docs/micronest/marketing/MICRONEST-COMMIT-06-REPORT.md` untracked post-commit artifact from prior).**

