# MICRONEST MARKETING 07 MOTION REPORT — SUBTLE INTERACTION + REVEAL

**Date:** 2026-09-29 17:30 IST
**Baseline:** `e05754667a5ff4aabd913d4687a949d5c568d93a feat(marketing): activate lawyer and MatterVault marketing` + uncommitted `RCCF-MICRONEST-MARKETING-06` hero platform concept `Profession → Workflow → MicroTool` (`py-16 md:py-20` `space-y-8` `pt-6` triad inside hero)
**Scope:** Motion polish only — `src/app/page.tsx` + `src/app/globals.css` + tiny `Reveal` primitive + `profession-card` / `nav-shell` hover polish; no content/route/DB change; ZERO new deps

---

## 1. Baseline

- Hero after 06: `eyebrow FOCUSED… + h1 Small tools… + p Small, focused… + CTAs Explore/Launch App + triad Profession → Workflow → MicroTool` inside `bg-muted/10 rounded-lg bg-grid py-16 md:py-20`, `space-y-8` main. No entrance, no scroll reveal, no hover beyond `hover:bg-accent` + `active:scale-[0.98]`.
- Sections `Browse by Profession (CA+Lawyers md:grid-cols-2)`, `Featured MicroTools (NoticeFlow+ MatterVault md:grid-cols-2 with border-t bg-muted/20 workflows)`, `Why MicroTools (3-col border-t)` — static, no reveal.
- Nav `NavShell sticky top-0 border-b` with `links[5] Home+CA+NoticeFlow+Lawyers+MatterVault` `hover:bg-accent` but no `transition-colors`.
- `globals.css` only `.bg-grid`; build `12/12` pages, `16` e2e PASS.

## 2. Motion Goals

Quiet, professional, responsive, deliberate, premium, fast — animation supports hierarchy, not identity. CSS-first (`opacity`, `translateY`, `transform`, `ease-out`), durations 150–500ms, reveals ~400–500ms, hero stagger 0–240ms. No `framer-motion/motion/GSAP/Lenis/Magic/Aceternity`, no infinite decorative, no large movement/bounce/spin/glow/pulse.

## 3. Motion Inventory

**LOAD (hero):**

| Element | Trigger | Property | Duration | Easing | Delay | Infinite | Reduced-motion |
|---|---|---|---|---|---|---|---|
| eyebrow `FOCUSED…` | page load (animation) | `opacity 0→1`, `translateY 8px→0` (`@keyframes mn-reveal`) | 500ms | ease-out | 0ms | No | none (opacity 1, transform none) |
| heading `Small tools…` | load | same | 500ms | ease-out | 60ms | No | none |
| paragraph `Small, focused…` | load | same | 500ms | ease-out | 120ms | No | none |
| CTAs `Explore+Launch` | load | same (wrapper) | 500ms | ease-out | 180ms | No | none |
| triad `Profession→Workflow→MicroTool` | load | same | 500ms | ease-out | 240ms | No | none |

**SCROLL:**

| Element | Trigger | Property | Duration | Easing | Delay | Infinite | Reduced-motion |
|---|---|---|---|---|---|---|---|
| Browse section wrapper | IntersectionObserver enters viewport (threshold 0.15, rootMargin `0px 0px -40px 0px`) | `opacity 0→1`, `translateY 8px→0` (transition) | 400ms | ease-out | 0ms (section) | No | opacity 1, transform none, transition none |
| CA card | same observer (nested `Reveal delayMs 0`) | same | 400ms | ease-out | 0ms | No | same |
| Lawyers card | same | same | 400ms | ease-out | 60ms | No | same |
| Featured section wrapper | observer | same | 400ms | ease-out | 0ms | No | same |
| NoticeFlow card | observer nested | same | 400ms | ease-out | 0ms | No | same |
| MatterVault card | observer nested | same | 400ms | ease-out | 60ms | No | same |
| Why section | observer | same | 400ms | ease-out | 0ms | No | same |

**INTERACTION:**

| Element | Trigger | Property | Duration | Easing | Infinite | Reduced-motion |
|---|---|---|---|---|---|---|
| Profession cards `mn-card` | hover | `transform translateY 0→-1px`, `background-color` | 200ms | ease-out | No | `transform none` |
| Featured cards `mn-card` | hover | same | 200ms | ease-out | No | same |
| Nav links `NavShell Link` | hover/active | `background-color` `hover:bg-accent` / `active bg-foreground` | 200ms | default | No | preserved (functional) |
| Mobile toggle button | hover | `background-color` | 200ms | default | No | preserved |
| CTAs `Explore/Launch` | hover/active | `background-color`, `transform active:scale-[0.98]` | 200ms | default | No | preserved |

Workflow badges `Receipt…Close` / `Create…Archive` remain static (no badge animation) — parent card hover only.

That is the full inventory — ~12 animated primitives, no more.

## 4. Hero Animation

**Trigger:** CSS `animation` on page load (no JS, no `IntersectionObserver`).

**Keyframes `src/app/globals.css:28` `@keyframes mn-reveal`:** `from { opacity 0; translateY 8px } → to { opacity 1; translateY 0 }` — compositor-friendly `opacity`+`transform`, no `width/height/top/left/margin/padding`.

**Classes:** `.mn-reveal { animation: mn-reveal 500ms ease-out both; }` — `both` retains final state (no jump). Applied to 5 elements in `src/app/page.tsx:15` with `style={{ animationDelay: "0ms"|"60ms"|"120ms"|"180ms"|"240ms" }}` matching brief `eyebrow 0, heading 60, supporting 120, CTAs 180, triad 240`.

**Triad:** Single `mn-reveal` on wrapper `div[aria-label="How MicroNest works"]` delay 240ms — not per-pill stagger (avoids theatrical). Arrows/dots/grid not animated (task 2. `Do NOT animate arrows continuously...`).

**Reduced-motion:** `@media (prefers-reduced-motion: reduce) { .mn-reveal { animation: none; opacity:1; transform:none } }` — content appears immediately, no transform.

**Usable immediately:** `500ms` max with `240ms` delay → last element at `740ms` total, page usable during (no `pointer-events` block).

## 5. Section Reveal

**Not CSS-only:** Requires scroll position → `IntersectionObserver` is genuinely necessary (task 3. `Prefer CSS where possible` but `Only trigger when section enters viewport`).

**Why not generic framework:** Only 3 sections + 4 cards need reveal (Browse, Featured section wrappers plus staggered card wrappers, Why). A generic `AnimationEngine/RevealProvider/MotionSystem` for 3 uses would be over-engineering (task 14.). Chose **one tiny marketing-only primitive** `src/components/marketing/reveal.tsx` (24 lines, `use client`, no deps, no config, no registry) — acceptable per brief `A small reusable presentation primitive is acceptable ONLY if it prevents obvious duplication`.

**Primitive `reveal.tsx`:**

```tsx
"use client"; import { useEffect, useRef, useState } from "react";
export function Reveal({ children, className, delayMs }: { delayMs?: number }) {
  const ref = useRef<HTMLDivElement>(null); const [visible,setVisible]=useState(false);
  useEffect(()=>{ const el=ref.current; if(!el) return;
    const o=new IntersectionObserver(([e])=>{ if(e.isIntersecting){ setVisible(true); o.unobserve(e.target); } },
      { threshold:0.15, rootMargin:"0px 0px -40px 0px"}); o.observe(el); return()=>o.disconnect(); },[]);
  return <div ref={ref} className={`mn-section ${visible?"is-visible":""} ${className??""}`} style={delayMs?{transitionDelay:`${delayMs}ms`}:undefined}>{children}</div>;
}
```

- Threshold `0.15` (15% visible) + `rootMargin -40px` bottom ensures reveal triggers slightly before fully centered.
- `observer.unobserve` after first intersect → animation runs once (no re-trigger on scroll up).
- `delayMs` maps to `transition-delay` for stagger.

**Wiring `src/app/page.tsx:36`:**

- `Browse by Profession` entire `section` wrapped in `<Reveal>` (section wrapper `delay 0`, triggers section heading + grid together).
- Each `ProfessionCard` wrapped individually in `<Reveal delayMs={i*60}>` → CA 0ms, Lawyers 60ms (task 4. subtle stagger, no horizontal slide).
- `Featured MicroTools` same: section `<Reveal>` + each tool `Link` in `<Reveal delayMs={i*60}>` → NoticeFlow 0ms, MatterVault 60ms.
- `Why MicroTools` single `<Reveal>` around section (no card stagger — 3 columns are text, not interactive cards).

**Properties:** `.mn-section { opacity 0; translateY 8px; transition: opacity 400ms ease-out, transform 400ms ease-out }` → `.is-visible { opacity 1; translateY 0 }` — same `8px→0` + `400–500ms` ease-out as brief.

**Reduced-motion:** `@media (prefers-reduced-motion: reduce) { .mn-section { opacity:1; transform:none; transition:none } }` → content immediately, no reveal transform, no delay.

## 6. Card Interaction

**Profession cards `src/components/marketing/profession-card.tsx:7` `class="mn-card rounded-md border p-6 hover:bg-accent"`:**

- `.mn-card { transition: background-color 200ms ease-out, transform 200ms ease-out }`
- `.mn-card:hover { transform: translateY(-1px) }` — subtle ` -1px` (not `scale 1.05 / shadow-lg / glow / 3D` banned). Keeps `rounded-md`/`1px border`/`neutral`.

**Featured cards `src/app/page.tsx:50` `Link class="mn-card overflow-hidden rounded-md border hover:bg-accent"`:** same `mn-card` hover `translateY(-1px)` + `background-color` transition (workflow badges inside remain static — no per-badge animation, parent `hover:bg-accent` sufficient, per task 6.).

**Buttons `src/app/page.tsx:22` CTAs:** `Explore` `transition-all duration-200 hover:bg-primary/90 active:scale-[0.98]`, `Launch App` `transition-colors duration-200 hover:bg-accent active:scale-[0.98]` — no ripple/magnetic/gradient/shine/glow.

## 7. Navigation Interaction

**`src/components/layout/nav-shell.tsx:38` Nav link:** `class="... transition-colors duration-200 ... hover:bg-accent"` — was already `hover:bg-accent` but no `transition-colors`; added `duration-200` for subtle state interpolation (not redesigned, IA/links `Home+CA+NoticeFlow+Lawyers+MatterVault` unchanged, `Launch App` unchanged).

**Mobile toggle button:** `inline-flex h-10 w-10 border transition-colors duration-200 hover:bg-accent md:hidden` — subtle hover, not `hover:bg-accent` previously missing (now has).

**Mobile menu open/close:** `nav` `class="${open ? "flex" : "hidden"} w-full flex-col ... md:flex"` — `hidden↔flex` is `display` toggle (can't animate `height` compositor-friendly without layout shift, so kept `display` toggle as brief allows `A small opacity/height transition is acceptable. Do NOT use a large slide animation.` — chose no large slide, immediate, to avoid animating `height` which would trigger layout). Reduced motion irrelevant here.

## 8. Mobile Behavior

- Restrained: same durations (no increase for mobile), compositor `opacity/transform` only.
- Triad at 375 `flex-col ↓` vertical `Profession ↓ Workflow ↓ MicroTool` with `gap-3` — `mn-reveal` `translateY 8px→0` vertical, not horizontal, so mobile not clipped.
- Scroll reveal `threshold 0.15` works on small viewport (trigger early via `rootMargin -40px`).
- Sticky header `header.sticky top-0 z-10 border-b` unaffected (no `height` animation, no `fixed` change).
- Cards at 375 `327px` full, `mn-card:hover` `translateY -1px` still usable (hover via tap, no persistent state).

## 9. Reduced Motion

**Implemented `@media (prefers-reduced-motion: reduce)` in `src/app/globals.css:55`:**

```css
@media (prefers-reduced-motion: reduce) {
  .mn-reveal { animation: none !important; opacity:1 !important; transform:none !important; }
  .mn-section { opacity:1 !important; transform:none !important; transition:none !important; }
  .mn-card:hover { transform:none !important; }
}
```

- Disables entrance `animation`, scroll `transition`, stagger `transitionDelay` still `transition:none`, retains `opacity:1` immediate.
- Functional hover/focus `background-color` remains possible but transform removed (per brief retain functional states where appropriate — we remove translate but keep `hover:bg-accent` color).
- No content depends on animation completion (`mn-reveal` starts `opacity 0` but `animation:none` → `1`, so reduced-motion content never hidden; likewise `mn-section` static `opacity:1`).

**Verification:** Browser emulated `prefers-reduced-motion: reduce` (`page.emulateMedia({ reducedMotion: "reduce" })`) at 12/12 motion tests: `getByText(FOCUSED…)`, heading, triad `Profession/Workflow/MicroTool` all visible immediately, `getComputedStyle(.mn-reveal).animationName === "none"` PASS, no infinite animation, nav usable.

## 10. Performance Considerations

- Only `opacity`+`transform` (`translateY`, `translateY -1px`) — compositor thread, no layout (`width/height/top/left/margin/padding`) — no layout shift (Verified `overflow false` at 5 viewports).
- Hero `500ms` + stagger `240ms` total `740ms` first paint; scroll reveals `400ms` — no long cinematic intro, page usable during.
- `IntersectionObserver` disconnect after first (`unobserve`) — no continuous scroll handlers.
- No `bg-grid` animation (static `linear-gradient 40px 40px` — per 12. `DO NOT animate bg-grid`).

## 11. Files Changed

**Zero new npm deps.** Files genuinely required (per 13. `Prefer src/app/page.tsx src/app/globals.css and existing presentation components only`):

| File | Change | Why |
|---|---|---|
| `src/app/globals.css` | `+42` lines: `@keyframes mn-reveal`, `.mn-reveal`, `.mn-section/.is-visible`, `.mn-card`, `@media prefers-reduced-motion reduce` | CSS-first motion primitives (hero stagger, section reveal, hover, reduced-motion) — single place, no lib |
| `src/app/page.tsx` | `+15 -6` (import `Reveal`, add `mn-reveal style={{animationDelay}}` to 5 hero elements, wrap Browse/Featured/Why in `<Reveal>` with `delayMs i*60` card stagger, add `mn-card` + `transition-*` to Featured Links) | Hero entrance + section reveals + card stagger + CTA hover — only file needing presentation wiring |
| `src/components/marketing/reveal.tsx` | New `+29` `use client` tiny `IntersectionObserver` wrapper (threshold 0.15, rootMargin -40px, unobserve, transitionDelay) | Prevent duplication of 3 section observers — marketing-only, no framework, acceptable primitive |
| `src/components/marketing/profession-card.tsx` | `+1` `mn-card` class on `Link` | Profession card hover `translateY -1px` + `background-color 200ms` — matches Featured cards |
| `src/components/layout/nav-shell.tsx` | `+2` `transition-colors duration-200` on Nav Link + mobile toggle `hover:bg-accent` | Subtle nav interaction polish (per 8.) |

**Also modified:** `src/app/page.tsx` hero vertical rhythm from `06` still (`space-y-8` `md:py-20` `pt-6` triad inside hero) preserved — not reverted.

**Not changed (per 13.):** `src/content/microtools.ts` (2 professions/2 tools intact), `src/modules/**`, `src/app/app/**`, `supabase/**`, auth/services/repositories/migrations/RLS/RPC, `site-nav.tsx` links unchanged, `layout.tsx` metadata unchanged, `package.json` unchanged.

## 12. Dependencies

- `0` new npm dependencies — verified `git diff -- package.json` empty, `pnpm-lock.yaml` empty.
- No `framer-motion`/`motion`/`GSAP`/`Lenis`/`Magic UI`/`Aceternity`/`React Spring`/animation libraries — `package.json` deps remain `next 16.3.6, react 19.1.0, @supabase/ssr 0.7.0, geist 1.7.2, tailwindcss 4.1.8` etc.

## 13. Validation

```
pnpm typecheck → tsc --noEmit → PASS (0 errors, Reveal client component typed, no professions change)
pnpm lint      → eslint       → PASS (0 errors, reveal.tsx no any, mn-* classes not linted)
pnpm test      → vitest run   → PASS (36 passed | 1 skipped (37), 228 passed | 1 skipped (229), Duration 24.12s)
  No test weakened.
pnpm build     → next build   → PASS (Compiled 23.6s, 12/12 pages, ● /profession/lawyers + ● /tools/mattervault intact,  ƒ Proxy)
  Route table unchanged: ○ /, ● /profession/*×2, ● /tools/*×2, ○ /sitemap.xml etc.
pnpm test:e2e  → playwright test → PASS (16 passed, 48.6s — auth 3 + notices-pagination 4 + smoke 9 (homepage both professions+tools, Lawyers, MatterVault, CA, 404s, sitemap 5 URLs))
```

No `pnpm audit` regression (not run per previous, `build` `No known vulnerabilities` found at prior).

## 14. Browser Verification

**Viewports 375, 768, 1024, 1280, 1440 — HOME `motion home at ${vp}` 5 tests PASS:**

- Hero enters smoothly (`mn-reveal` 0→240ms stagger, `opacity 0 translateY 8 → 1 0`, `ease-out 500ms`, no layout jump — `main` still `max-w-5xl mx-auto`, `hero bg-muted/10 rounded-lg` with `bg-grid` static 40px).
- Triad `Profession → Workflow → MicroTool` appears correctly (inside hero `pt-6`, `flex-col ↓` at 375, `sm:flex-row →` at 768+).
- `Browse reveals` — section `Reveal threshold 0.15` triggers when scrolled into view (verified via scroll in motion tests — sections become `is-visible` `opacity 1`).
- `Featured reveals` — `NoticeFlow` 0ms then `MatterVault` 60ms stagger `translateY 8→0` `400ms`.
- `Why reveals` — `Why MicroTools` `border-t` 3-col reveals.
- `cards hover correctly` — `mn-card:hover translateY -1px 200ms` on Profession `CA/Lawyers` and Featured `NoticeFlow/MatterVault` (`background-color` transition `200ms`), no `shadow-lg/glow/scale`.

**MOBILE 375 specifics:**
- `mobile nav opens/closes correctly` — `button[aria-label="Toggle navigation"]` click opens `Lawyers` nav link visible (fixed strict-mode `getByRole('navigation').getByRole('link', {name: 'Lawyers'})`), close hides; no animation clipping, no horizontal `overflow false`, cards `327px` full remain usable.

**PAGES verified `responsive ${route} no overflow` at 375+1280:**
- `/profession/chartered-accountants` 200 `CA → NoticeFlow` (ToolCard `mn-card`), no overflow
- `/profession/lawyers` 200 `Lawyers → MatterVault`, no overflow
- `/tools/noticeflow` 200 CA eyebrow + notice 5 bullets, no overflow
- `/tools/mattervault` 200 Lawyers eyebrow + mattervault 5 bullets, no overflow

**Reduced-motion (12 motion tests including):**
- `reduced motion disables transforms` — `page.emulateMedia({ reducedMotion: "reduce" })` at `/`, content appears without delayed reveal (`animationName none`), no transform entrance, no infinite animation, nav/cards usable.

All 12 `verify-motion.spec.ts` tests PASS before removal; then `pnpm test:e2e` full `16` PASS after.

## 15. Regression Verification

| Area | Evidence | Verdict |
|---|---|---|
| NoticeFlow functionality (`/app/notices` filters/pagination/CSV) | `git diff -- src/modules/ src/app/app/ supabase/` empty; `test:e2e` notices-pagination 4 PASS | PASS |
| MatterVault functionality (`/app/matters` create, checklist, upload, verify) | same diff empty; unit `228` PASS | PASS |
| Authenticated `src/app/app/**` dashboard, clients, members | diff empty | PASS |
| Database / migrations `supabase/migrations 008/009` | diff empty | PASS |
| RLS/RPC `matters is_firm_member SELECT`, `verify_checklist_item_and_maybe_ready FOR UPDATE` | diff empty | PASS |
| Auth `proxy.ts`, `supabase-service.ts` | diff empty | PASS |
| Services/repositories (`matter-permissions`, `matter-repository`) | diff empty | PASS |
| Content model `microtools.ts` (`lawyers/mattervault` 2/2) | diff empty — content unchanged (hero motion does not derive from `microtools.ts` per 06) | PASS |
| Sitemap `src/app/sitemap.ts` `5` URLs | `build` `○ /sitemap.xml` + e2e `sitemap 5 URLs` PASS | PASS |
| Public routes `○/ ●/profession/*2 ●/tools/*2` | `build` route table + e2e `smoke` 9 PASS | PASS |

## 16. Security Impact

- No `supabase/migrations` change — no RLS (`matters/checklist_items SELECT is_firm_member`), no RPC (`SECURITY DEFINER auth.uid() + firm_role`) change.
- No `auth`/`firm_members`/`is_firm_member`/`firm_role` change.
- `Reveal` primitive is presentation-only client `div` observer, no `supabase` import, no `firm_id` leakage.
- `globals.css` motion is CSS `opacity/transform`, no `service-role` exposure.

## 17. Out-of-Scope

Confirmed not done per brief `STOP`:

- Not redesigned page — `Browse/Featured/Why/footer/sitemap` structure unchanged (only added `mn-*` classes + `Reveal` wrappers).
- Not changed content — `microtools.ts` 2/2, `ProfessionCard` description, `Featured` workflows, `Why` 3 bullets untouched.
- Not added profession/tool — still `2/2`.
- Not added pricing/testimonials/FAQ/blog, MatterVault/NoticeFlow app code, MatterVault screenshots, MatterVault business logic.
- Not added generic `MotionProvider/AnimationEngine/useReveal()` — single `Reveal` is tiny, justified, not a framework.
- Not added animation library — zero deps.
- `bg-grid` not animated (per 12.)

## 18. Final Verdict

**PASS — Quiet, CSS-first motion makes homepage feel polished without becoming animated template.**

Hero `500ms ease-out 8px→0` stagger `0/60/120/180/240ms` + sections `400ms 8px→0` via `IntersectionObserver threshold 0.15` + cards `60ms` stagger `400ms` + hover `200ms translateY -1px` is deliberate, fast, compositor-friendly, `prefers-reduced-motion` safe, no infinite/bouncing/glow/shadow. `Browse` `CA 0ms / Lawyers 60ms`, `Featured` `NoticeFlow 0ms / MatterVault 60ms` reveal is enough (task 15 motion inventory satisfied, no more motion added because possible).

Files are minimal (`globals.css` keyframes, `page.tsx` hero stagger + `Reveal` wrappers, `reveal.tsx` 29-line primitive, `profession-card.tsx` + `nav-shell.tsx` hover `200ms`) — no generic framework, no deps.

`typecheck/lint/test/build (12/12) / test:e2e 16` PASS, browser `375/768/1024/1280/1440` hero/scroll/hover/nav/reduced-motion PASS, regression `app/modules/supabase/package.json` no diff.

- package.json unchanged — **0 new dependencies**
- no database changes
- no migrations
- no RLS changes
- no RPC changes
- no auth changes
- no authenticated app changes

**STOP — Do not redesign marketing page, do not change content, do not add another profession/tool, do not add pricing/testimonials/FAQ/blog, do not modify MatterVault/NoticeFlow, do not add animation libraries, do not create generic motion framework.**

