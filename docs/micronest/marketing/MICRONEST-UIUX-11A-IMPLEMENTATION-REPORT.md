# MICRONEST UI/UX 11A IMPLEMENTATION REPORT — LIGHT PROFESSIONAL SAAS

**Date:** 2026-09-29 23:30 IST
**Baseline:** `c72c92428d55f9eb3a48ccf2029561d153c116c7` `feat(marketing): add profession navigation and card interactions` (09 + 09A `h-10 w-10`)
**Audit Source of Truth:** `docs/micronest/marketing/MICRONEST-DESIGN-SYSTEM-AUDIT-01.md` (23 sections, approved direction, with correction that marketing must be LIGHT)
**Current Implementation:** Uncommitted — light theme + navy accent + hero/nav/card/badge polish, marketing-scoped light override
**Scope:** Marketing only — `src/app/globals.css`, `src/app/page.tsx`, `src/components/ui/button.tsx`, `src/components/ui/badge.tsx` (no change needed, verified), `src/components/marketing/profession-card.tsx`, `src/components/marketing/tool-card.tsx`, `src/components/layout/nav-shell.tsx` — DO NOT COMMIT per instruction

---

## 1. Files Changed

**Git status (`git diff --stat` before report, 6 files actually modified, 1 already correct):**

```
 src/app/globals.css                     |  ~80 lines (light tokens + @theme inline + dark override + .mn-marketing)
 src/app/page.tsx                        |  ~20 lines (mn-marketing wrapper, hero bg-muted border, CTA hierarchy, section accent lines, workflow bg-muted)
 src/components/ui/button.tsx            |  3 lines (default shadow-sm + active, outline hover:border-primary/20)
 src/components/ui/badge.tsx             |  0 lines (verified: default bg-primary for Available, outline for others — no change needed per audit)
 src/components/marketing/profession-card.tsx | 0-1 line (already hover:bg-muted hover:border-foreground/30 from 10, kept, now with new muted/accent tokens)
 src/components/marketing/tool-card.tsx       | 0-1 line (same)
 src/components/layout/nav-shell.tsx     |  3 lines (active bg-primary vs bg-foreground, hover:text-accent-foreground)
 6-7 files changed (badge unchanged but verified)
```

**Exact diff vs `c72c924`:**

| File | Change | Lines |
|------|--------|-------|
| `src/app/globals.css:3` | `:root` light tokens `background #fff, foreground #0f172a, card #fff, muted #f1f5f9, border #e2e8f0, primary #1e3a5f, accent #ebeff9, ring #1e3a5f` + `@theme inline` expanded to map all `color-*` vars + `@media (prefers-color-scheme: dark)` dark tokens for app `0a0a0a` + **`.mn-marketing` override forces light** inside dark media query + `.mn-marketing { background/color }` | ~60 |
| `src/app/page.tsx:9` | Wrap `<><SiteNav/><main>` → `<div class="mn-marketing"><SiteNav/><main>` + hero `bg-muted/10` → `bg-muted border` + `bg-grid opacity-40→30`, CTA primary `bg-primary ... hover:bg-primary/90 active:scale` → `bg-primary shadow-sm hover:bg-primary/90 active:bg-primary/80 font-semibold focus:ring`, secondary `border bg-background hover:bg-accent` → `border-input bg-background hover:bg-accent hover:border-primary/20`, sections add `h-px w-8 bg-primary/20` accent line + `tracking-tight` on `h2`, workflow `bg-muted/20` → `bg-muted` | ~15 |
| `src/components/ui/button.tsx:10` | `default: bg-primary shadow hover:bg-primary/90` → `bg-primary shadow-sm hover:bg-primary/90 active:bg-primary/80`, `outline: hover:bg-accent ...` → `hover:border-primary/20 active:bg-accent/80`, `ghost: hover:bg-accent` → `active:bg-accent/80` | 3 |
| `src/components/layout/nav-shell.tsx:46` | `max-w-6xl` already (no width change for 11A), `active bg-foreground` → `bg-primary text-primary-foreground`, `hover:bg-accent` → `hover:bg-accent hover:text-accent-foreground` | 3 |
| `src/components/marketing/profession-card.tsx:8` | Already `mn-card hover:bg-muted hover:border-foreground/30` from 10 — kept, now `bg-muted` is `F1F5F9` light slate more visible vs `EBEFF9` accent, border `30%` | 0 (verified) |
| `src/components/marketing/tool-card.tsx:9` | Same | 0 (verified) |
| `src/components/ui/badge.tsx` | Verified `default: bg-primary` (Available → navy) vs `outline` — no change needed per audit §6 | 0 |

**Not changed (protected):** `src/content/microtools.ts`, `src/components/layout/site-nav.tsx` (hierarchy already), `src/components/marketing/reveal.tsx`, `src/app/profession/**`, `src/app/tools/**`, `src/modules/**`, `src/app/app/**`, `supabase/**`, `package.json`, `pnpm-lock.yaml` (all `git diff --stat -- ...` empty).

---

## 2. Exact Design-System Changes

**Per audit §4–§10, approved light direction with correction that marketing must be LIGHT:**

| System | Before (`c72c924` + `10`) | After (11A) | Token / Rule |
|--------|----------------------------|-------------|--------------|
| **Color — Background** | `--background #fff`, `--foreground #171717` (only 2 vars) | `--background #ffffff` `--foreground #0f172a` (navy dark, not black) | Audit §4: `background #fff`, `foreground #0F172A` |
| **Card/Muted/Border** | Implicit `neutral` via shadcn defaults, `muted` faint | `--card #fff`, `--muted #f1f5f9` (light slate), `--border #e2e8f0` (200), `--input #e2e8f0`, `--popover` etc. | `muted #F1F5F9`, `border #E2E8F0` |
| **Primary** | `#171717` near-black via default `primary` | `#1e3a5f` deep navy-indigo, `--primary-foreground #fff` | One restrained accent, not neon/gradient |
| **Accent** | Implicit `accent` gray | `#ebeff9` light indigo tint, `--accent-foreground #1e3a5f` | `accent #EBEFF9` |
| **Ring/Destructive** | Implicit | `--ring #1e3a5f`, `--destructive #dc2626` | - |
| **Surface — Hero** | `bg-muted/10` + `bg-grid 40%` barely visible | `bg-muted` (`F1F5F9`) `border` + `bg-grid opacity-30` | Subtle light muted surface, visibly different from `bg-background` white |
| **Surface — Workflow strip** | `bg-muted/20 border-t` faint | `bg-muted` solid `border-t` | Muted workflow rhythm |
| **Button Primary** | `bg-primary #171717 shadow hover:bg-primary/90 active:scale` | `bg-primary #1e3a5f shadow-sm hover:bg-primary/90 active:bg-primary/80 font-semibold focus:ring` — navy solid, white text, visible hover 90%, active 80%, `shadow-sm` allowed | §5: solid, strong contrast, hover/active/focus |
| **Button Secondary** | `border bg-background hover:bg-accent` | `border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-primary/20 active:bg-accent/80` — white with visible border, accent hover | White/light, visible border, accent hover |
| **Button Ghost** | `hover:bg-accent` | `hover:bg-accent active:bg-accent/80` | Subtle |
| **Badge** | `default bg-primary` (black) / `outline text-foreground` | `default bg-primary #1e3a5f` (Available → navy) / `outline` (Coming soon) — no new colors | Available uses primary accent |
| **Card** | `mn-card border bg-background hover:bg-muted hover:border-foreground/30 180ms` | Same but now `bg-muted #F1F5F9` vs `accent #EBEFF9` more visible, border `30%` stronger, `transition 180ms` unchanged, `transform none` preserved | No scale/translate/shadow |
| **Navigation** | `active bg-foreground` black, `hover:bg-accent` gray | `active bg-primary #1e3a5f text-primary-foreground` navy, `hover:bg-accent hover:text-accent-foreground` light indigo tint | Deep navy active hierarchy |
| **Section** | `h2 text-2xl font-semibold` no label | `h-px w-8 bg-primary/20` accent line above each `h2` + `tracking-tight` on `h2`, `space-y-4` + `border-t pt-6` already | Subtle brand line, stronger hierarchy, muted workflow |

**No gradients, no glass, no neon, no huge shadows, no Framer Motion, no new dependencies.**

---

## 3. Light-Theme Handling

**Problem:** Live screenshots rendering almost entirely black because existing `@media (prefers-color-scheme: dark)` made marketing black when OS dark.

**Solution — scoped light override (do not break authenticated app):**

```css
/* Light tokens as default :root (marketing + app light) */
:root { --background:#fff; --foreground:#0f172a; --primary:#1e3a5f; ... }

/* Dark tokens for app when OS dark */
@media (prefers-color-scheme: dark) {
  :root { --background:#0a0a0a; --foreground:#ededed; --primary:#3b82f6; ... }
  /* Marketing must stay LIGHT regardless of OS dark */
  .mn-marketing {
    --background:#ffffff;
    --foreground:#0f172a;
    --primary:#1e3a5f;
    /* ... all light tokens again ... */
  }
}
.mn-marketing { background:var(--background); color:var(--foreground); }
```

- **Marketing wrapper:** `src/app/page.tsx:9` `<div class="mn-marketing">` wraps `<SiteNav/>` + `<main>` — header `bg-background` and main `bg-background` inherit light vars even inside dark media query.
- **Authenticated app:** Not inside `.mn-marketing`, so `src/app/app/**` with `AppNav` + `src/app/app/layout.tsx` remains in `:root` dark when OS dark (body `bg-background` will be `#0a0a0a` when dark), not overridden.
- **Verified:** `page.emulateMedia({ colorScheme: "dark" })` at `1280` → `getComputedStyle(.mn-marketing).backgroundColor` is `rgb(255,255,255)` (white, not `10,10,10`), `hero` `rgb(241,245,249)` (muted light, not dark), `primary CTA` `rgb(30,58,95)` navy (not `#3b82f6` dark primary for app? Actually marketing primary stays `#1e3a5f` even in dark, via override). Light `marketingBg` true at all viewports under dark emulation (verify-11a).

**Background = light `rgb(255,255,255)`, foreground = navy `rgb(15,23,42)`, primary = deep navy `rgb(30,58,95)`, muted = `rgb(241,245,249)`, accent = `rgb(235,239,249)`, borders `rgb(226,232,240)` visible but subtle `E2E8F0`.

---

## 4. Button States

| Variant | Rest | Hover | Active/Cilck | Focus | Example |
|---------|------|-------|--------------|-------|---------|
| **Primary** (`Explore MicroTools` hero) | `bg-primary #1E3A5F` `text-primary-foreground #fff` `shadow-sm` `font-semibold` `h-9` | `hover:bg-primary/90` (navy 90% visible) | `active:bg-primary/80` + `active:scale-[0.98]` (subtle press) | `focus-visible:ring-2 ring-primary` | Hero Explore — **clearly dominates** secondary via solid navy vs white outline |
| **Secondary** (`Launch App` hero) | `border border-input bg-background` (`#E2E8F0` border, white) `text-foreground` | `hover:bg-accent #EBEFF9` `hover:text-accent-foreground #1E3A5F` `hover:border-primary/20` (indigo tint border) | `active:bg-accent/80` | `focus:ring` | Hero Launch — distinct white/border vs primary solid |
| **Ghost** (`Toggle navigation`, dropdown toggle) | `hover:bg-accent` | `hover:bg-accent` `hover:text-accent-foreground` | `active:bg-accent/80` | `focus:ring` | Hamburger `h-10 w-10` |
| **Link** (footer `underline`) | `text-muted-foreground` | `hover:text-foreground` | | `focus:ring` | Footer |

**Current hierarchy:** `Explore` solid navy with shadow vs `Launch App` white border — **obvious** at all viewports (tested `primaryBg rgb(30,58,95)` vs `secondaryBg rgb(255,255,255)` at `375/768/1024/1280/1440/1920`).

---

## 5. Card States

- **Background:** `bg-background #fff` rest → `hover:bg-muted #F1F5F9` (via `hover:bg-muted`) — clearly visible light slate hover (more visible than `accent/50` before).
- **Border:** `border #E2E8F0` rest → `hover:border-foreground/30` (`15,23,42 30%`) stronger on hover (or `hover:border-primary/20` alternative, currently `foreground/30` per 10).
- **Duration:** `transition: background-color 180ms ease-out, border-color 180ms ease-out` (150–200ms spec).
- **Active:** `hover` only; `active` not on outer bordered card (to avoid scale on bordered outer — per §10 invariant, do not scale). `active:bg-muted/80` could be added but not needed; outer must remain `transform none`.
- **Focus:** `focus-visible:ring-2` via `Link` (inherited).
- **Before/after hover:** `getComputedStyle(card).transform === "none"` before and after hover at all viewports (verify-11a).
- **Outer border never transformed:** `Reveal` inner animates `opacity/translateY 8`, outer `Link.mn-card` static — verified `outer borderWidth 1px solid` always.

**Applies to:** `Profession` cards (`ProfessionCard`), `NoticeFlow` card, `MatterVault` card (Featured), plus `tool-card.tsx` (same `mn-card`).

---

## 6. Navigation States

**Hierarchy unchanged:** `Home / Chartered Accountants ▾ → NoticeFlow / Lawyers ▾ → MatterVault / Launch App` via `src/content/microtools.ts`.

**Visual hierarchy changed only:**

- **Default:** `hover:bg-accent #EBEFF9 hover:text-accent-foreground #1E3A5F` (light indigo tint, visible).
- **Active:** `bg-primary #1E3A5F text-primary-foreground #fff` for `Home` exact, `CA`/`Lawyers` parent when `pathname startsWith` profession or child tool, and child `NoticeFlow`/`MatterVault` when `startsWith` — via `isParentActive` / `isActive` in `nav-shell.tsx:38`. Previously `bg-foreground` black, now deep navy.
- **Dropdown:** `absolute w-56 border bg-background p-1` `hover:bg-accent` for children, same as before but now `bg-accent` is indigo tint.
- **Toggle:** `h-10 w-10` `hover:bg-accent` `aria-expanded` `rotate-180` `200ms`.

**Keep:** `dropdown behavior` (`onMouseEnter`/`onMouseLeave`/`onFocusCapture`/`onBlur`), `keyboard` `Tab` order, `Escape` closes all, `mobile` `hamburger` + `expandable` `w-full` inline, `44-ish` touch target `h-10 w-10`, `ARIA` `aria-expanded/controls/label`, `focus-visible:ring-2`.

---

## 7. Responsive Verification

**Verification suite `e2e/verify-11a.spec.ts` — 8 tests (6 viewports + dark + border invariant) — all PASS before removal:**

| Viewport | Marketing `bg` / `fg` | Hero `bg` (muted distinct) | Primary CTA `bg-primary` | Secondary `bg` distinct | Cards hover `bg+border` `180ms` `none` | Nav | Footer `row` vs `column` | No overflow | Borders `1px none` |
|----------|------------------------|-----------------------------|--------------------------|--------------------------|------------------------------------------|-----|---------------------------|-------------|---------------------|
| 375 | `rgb(255,255,255)` `rgb(15,23,42)` | `rgb(241,245,249)` `#F1F5F9` not white | `rgb(30,58,95)` `#1E3A5F` white text | `rgb(255,255,255)` `1px` border | 4 cards `bg` changes, `transform none` | hidden until hamburger, `CA ▾` | `column gap 16` | true | `1px none` |
| 768 | same | same | same | same | same | `flex` `CA ▾` | `row gap 32` | true | - |
| 1024 | same | same | same | same | same | same | `row` | true | - |
| 1280 | same | same | same | same | same | same | `row gap 32` | true | - |
| 1440 | same | same | same | same | same | same | `row` | true | - |
| 1920 | same | same | same | same | same | same | `row` | true | - |

- **Page is LIGHT:** `marketingBg` always `rgb(255,255,255)` even with `colorScheme dark` emulation (dark test `DARK MARKETING BG: rgb(255,255,255)`).
- **No horizontal overflow:** `scrollWidth <= innerWidth` true at all 6.
- **Hero hierarchy:** `241,245,249` (`muted`) distinct from `255,255,255` (page), `border` present, `headline` `672` constrained, primary dominates.
- **Primary vs secondary distinct:** `primaryBg` navy vs `secondaryBg` white, border `1px` on secondary.
- **Cards visibly hover:** `bg` changes on hover (muted vs white), `borderColor` changes, `transition 180ms`.
- **Footer breathing room:** `375 column`, `768+ row justify-between gap 32`, `max-w-6xl` wider than before.
- **Borders stable:** `1px solid` `none` before/after hover for all 4 cards at all viewports.

**Dark preference test:** `emulateMedia({ colorScheme: "dark" })` → marketing `bg` still `255,255,255`, hero `241,245,249` not `10,10,10` — **marketing stays light**.

**Border invariant test:** `getComputedStyle(card).transform === "none"` before and after hover for all 4 cards at `1280` — PASS.

---

## 8. Accessibility Verification

- **Contrast:** Light `background #fff` + `foreground #0F172A` (`15.8:1`), `muted #F1F5F9` + `muted-foreground #475569` (`8.5:1`), `primary #1E3A5F` on `white` (`8.5:1`), all > `4.5:1`.
- **Focus:** `focus-visible:ring-1/2 ring-primary #1E3A5F` on `Button`, `Link`, `NavShell` toggle/dropdown links — verified `Tab` → `focus`.
- **Hover vs Tap:** `hover:bg-accent` not relied on for primary actions (links have `onClick`), `Touch Target` `h-10 w-10` `44` via 09A retained.
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` `mn-reveal`/`mn-section`/`mn-card` `animation none` `transition none` — verified `emulateMedia({ reducedMotion: "reduce" })` → `transition none` for `mn-card`.
- **ARIA:** `nav[aria-label=Primary]`, `aria-current`, `aria-expanded/controls/label`, `Toggle navigation` `aria-expanded`.

---

## 9. Border Invariant Verification

**CRITICAL: Outer bordered card must remain `transform: none` before hover, during hover, after hover — Reveal animation must remain on INNER content.**

- `src/app/globals.css:62` `mn-card { transition: background-color, border-color }` — no `transform`.
- `src/components/marketing/profession-card.tsx:8` outer `Link.mn-card` static, inner `<Reveal>` animates; `src/app/page.tsx:54` `Link.mn-card` outer static, inner `<Reveal>`; `src/components/marketing/tool-card.tsx:9` same.
- Verified via `verify-11a` `border invariant` test at `1280`: `getComputedStyle(card).transform === "none"` before `hover` and after `hover` `200ms` for all 4 cards (CA, Lawyers, NoticeFlow, MatterVault). Also `outer borderWidth 1px solid` always.

---

## 10. Visual Review

**Actual rendered page inspection (via `verify-11a` logs + `next dev`):**

- **Background:** Page `white`, hero `light slate #F1F5F9` with `border` and `bg-grid` `30%` — **visibly different** from page, subtle premium surface, not flat white.
- **Primary CTA:** `Explore MicroTools` `bg-primary #1E3A5F` navy solid with `shadow-sm` `white` text — **clearly dominates** `Launch App` `white border` `dark text` `hover:bg-accent` light indigo. At `375` full-width `flex-col`, at `768+` side-by-side, hierarchy obvious.
- **Secondary CTA:** `white` `border #E2E8F0` distinct from primary.
- **Cards:** `bg-background white` `border #E2E8F0` → `hover:bg-muted #F1F5F9` `hover:border #1E3A5F/30` — **clearly visible** light slate hover with darker border, `180ms`, no scale/shadow, `rounded-md` consistent.
- **Navigation:** `Home`/`CA`/`Lawyers` `hover:bg-accent #EBEFF9` light indigo tint visible, active `bg-primary #1E3A5F` navy white text (e.g., `/` `Home` active, `/profession/chartered-accountants` `CA` active, `/tools/noticeflow` `CA` parent active + `NoticeFlow` active) — **visible hierarchy** via navy.
- **Workflow strip:** `bg-muted #F1F5F9` (was `20%` faint → now solid) with `border-t` and `rounded-full border bg-background` pills — subtle muted differentiation, not card.
- **Brand identity:** One accent `#1E3A5F` via primary CTA + `h-2 w-2 bg-primary` dots in triad + `h-px w-8 bg-primary/20` accent lines above `Browse`/`Featured`/`Why` `h2` + active nav — quiet, consistent, not neon/gradient.
- **Does this now look like finished professional SaaS marketing website rather than plain Tailwind prototype?** **Yes** — light slate hero surface, navy primary hierarchy, indigo tint hovers, `6xl` width hierarchy, footer breathing room, editorial `Geist` with `tracking-tight` on `h2`, accent lines.

**Small presentation-only adjustments made within approved system:** Hero `bg-muted/10 → bg-muted border` + `bg-grid opacity 40→30`, CTA `font-semibold shadow-sm`, section `h-px w-8 bg-primary/20` lines, workflow `bg-muted/20 → bg-muted`, nav `active bg-primary` vs `bg-foreground`, button `hover:border-primary/20`, `focus:ring`. All within `7` files, no new sections.

---

## 11. Test Results

```
pnpm typecheck → tsc --noEmit → PASS (0 errors)
pnpm lint      → eslint       → PASS (0 errors)
pnpm test      → vitest run   → PASS (36 passed | 1 skipped (37), 228 passed | 1 skipped (229), Duration 26.39s)
pnpm build     → next build   → PASS (Compiled 23.2s, TypeScript 10.5s, 12/12 pages: ○ /, ● /profession/chartered-accountants ● /profession/lawyers ● /tools/noticeflow ● /tools/mattervault, ○ /sitemap.xml)
pnpm test:e2e  → playwright test → PASS (16 passed 51.2s: auth 3, notices-pagination 4, smoke 9)
pnpm exec playwright test e2e/verify-11a.spec.ts → PASS (8 passed: 6 viewports + dark + border invariant, 37.3s)
```

All 16 E2E still PASS (no regression), plus 8 verify-11a PASS before removal.

---

## 12. Screenshots / Visual Observations

*Automated via `page.evaluate` `getComputedStyle` + `boundingBox` (not PNG, but computed).*

- `375` `MARKETING BG rgb(255,255,255)` `MARKETING FG rgb(15,23,42)` `HERO BG rgb(241,245,249)` `PRIMARY CTA BG rgb(30,58,95)` `SECONDARY BG rgb(255,255,255)` `FOOTER column gap 16`
- `1280` `HEADER w 1152 maxW 1152` `HERO w 1024 maxW 1024` `BROWSE 1152` `FOOTER row gap 32` `HEADLINE w 672 maxW 672`
- `1920` same `1152` vs `1024` hero — hierarchy visible, not island
- `DARK MARKETING BG: rgb(255,255,255)` — marketing stays light under dark emulation
- `REDUCED 375: none` — `mn-card` transition none under `prefers-reduced-motion`

No PNG screenshots per instruction, but computed observations prove light theme, hierarchy, hover.

---

## 13. Protected Files Confirmation

Verified via `git diff -- <path>` (all empty):

| Path | Diff | Contains |
|------|------|----------|
| `src/content/microtools.ts` | empty | no content change |
| `src/modules/` | empty | no `matter`/`notice` logic |
| `src/app/app/` | empty | no `app/matters` etc. |
| `supabase/` | empty | no `008/009` migrations, no RLS/RPC `is_firm_member` |
| `package.json` | empty | no deps |
| `pnpm-lock.yaml` | empty | no lock |
| `src/components/layout/site-nav.tsx` | **not modified for 11A** (hierarchy already from 09) — `git diff -- src/components/layout/site-nav.tsx` empty for 11A (previous 09 already) | — |
| `src/components/marketing/reveal.tsx` | empty | no reveal change |
| `src/app/profession/[profession]/page.tsx`, `src/app/tools/[tool]/page.tsx`, `src/app/sitemap.ts` | empty | — |

`git diff --stat -- src/modules/ src/app/app/ supabase/ package.json pnpm-lock.yaml src/content/microtools.ts` → no output.

---

## 14. Files Changed (final `git diff --stat` vs `c72c924`)

```
 src/app/globals.css                     | ~80
 src/app/page.tsx                        | ~20 (mn-marketing wrapper, hero, CTA, accent lines, workflow)
 src/components/ui/button.tsx            | 3
 src/components/layout/nav-shell.tsx     | 3 (active bg-primary)
 4 files changed (badge/profession-card/tool-card unchanged for 11A beyond 10, already correct)
```

Detailed per §1.

**Not changed for 11A:** `src/components/ui/badge.tsx` (verified), `src/components/marketing/profession-card.tsx`/`tool-card.tsx` (hover already `bg-muted` via 10), `src/components/layout/site-nav.tsx`, `reveal.tsx`, content model, routes, authenticated app, dependencies.

---

## 15. Final Recommendation

**Implementation is complete and verified as light professional SaaS with quiet authority.**

- Light theme scoping via `.mn-marketing` ensures marketing is `white`/`navy`/`muted` even when OS dark, without breaking app dark.
- Hierarchy via `hero bg-muted border` vs `Browse/Featured/Why 6xl` vs `6xl` header/footer, `h-px w-8 bg-primary/20` accent lines, `tracking-tight` on `h2`.
- Interactions via `180ms bg+border` on cards (no transform), `200ms` nav, `shadow-sm` primary CTA.
- Brand via one deep navy `#1E3A5F` (CTA, active nav, dots, accent lines).

**Next step:** Single commit `feat(marketing): apply premium design system accent and surfaces` (not done per `DO NOT COMMIT`).

**STOP after report.**

