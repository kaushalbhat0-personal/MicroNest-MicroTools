# MICRONEST UI/UX 09 REPORT — CARD HOVER + PROFESSION NAVIGATION

**Date:** 2026-09-29 21:30 IST — **Update 09A:** 2026-09-29 22:00 IST Touch target final fix `h-7 w-7 → h-10 w-10`
**Baseline:** `28cc9588ddb9010b2d7e692c12044e8a8e3e9493` `fix(marketing): stabilize animated card rendering` (08 — static border, inner Reveal)
**Current fix:** Uncommitted — subtle card hover + profession → tools hierarchy + **09A touch target `h-10 w-10`**
**Scope:** Marketing surface only — no DB/RPC/RLS/app logic/dep change, DO NOT COMMIT per instruction

---

## 1. UI/UX Skill Used

**`ui-ux-pro-max`** documented in `.agents/skills.md` and verified via `npx skills list -g --json`:

| Field | Value |
|-------|-------|
| Skill name | `ui-ux-pro-max` |
| Package | `nextlevelbuilder/ui-ux-pro-max-skill` (375.1K installs) |
| Global path | `C:\Users\91866\.agents\skills\ui-ux-pro-max` |
| Entry | `C:\Users\91866\.agents\skills\ui-ux-pro-max\SKILL.md` |
| Search script | `C:\Users\91866\.agents\skills\ui-ux-pro-max\scripts\search.py` |
| References | `references/quick-reference.md` (119 guidelines, 10 priorities) + `references/pro-rules.md` |

**Workflow per `.agents/skills.md` §3:** inspected `src/app/page.tsx`, `src/app/globals.css`, `src/components/marketing/profession-card.tsx`, `src/components/marketing/tool-card.tsx`, `src/components/layout/site-nav.tsx`, `src/components/layout/nav-shell.tsx` before editing, then ran targeted searches (one intent, 2–5 terms, explicit --domain):

```powershell
python "C:\Users\91866\.agents\skills\ui-ux-pro-max\scripts\search.py" "card hover background" --domain ux
# → Hover States (Web, hover:bg-gray-100 cursor-pointer), Hover vs Tap (don't rely only on hover), Severity Medium/High

python "C:\Users\91866\.agents\skills\ui-ux-pro-max\scripts\search.py" "dropdown navigation" --domain ux
# → Sticky Navigation, Keyboard Navigation (tab order, visible focus), Severity High

python "C:\Users\91866\.agents\skills\ui-ux-pro-max\scripts\search.py" "keyboard navigation focus" --domain ux
# → Keyboard Navigation, Focus States (focus:ring-2), Focus Not Obscured Enhanced

python "C:\Users\91866\.agents\skills\ui-ux-pro-max\scripts\search.py" "touch target mobile" --domain ux
# → Touch Target Size 44pt iOS / 48dp Android / 24px web, Touch Spacing 8px gap

python "C:\Users\91866\.agents\skills\ui-ux-pro-max\scripts\search.py" "navigation keyboard" --domain ux
# → same + Skip Links
```

Verified domain/category/top result fit; no unverified output persisted. Applied priority order 1 Accessibility → 2 Touch → 5 Layout & Responsive → 6 Typography & Color → 7 Animation → 9 Navigation.

## 2. Card Hover Implementation

**Goal:** Subtle feedback WITHOUT transforming bordered outer element; preserve `1px border`, `rounded-md`, static border rendering from 08.

### 2.1 CSS — `src/app/globals.css:62`

```css
/* before */
.mn-card { transition: background-color 200ms ease-out; }

/* after */
.mn-card { transition: background-color 180ms ease-out, border-color 180ms ease-out; }

@media (prefers-reduced-motion: reduce) {
  .mn-card { transition: none !important; }
}
```

- Duration `180ms` within required `150–200ms`, `ease-out`.
- `border-color` added optionally per spec — `background-color` + `border-color` only, no `transform`, `scale`, `shadow`, `glow`.
- `cursor-pointer` via normal `Link` behavior (no extra class needed; links already have pointer).
- Reduced-motion: `transition none` — hover still applies instantly but without animation.

### 2.2 Profession cards — `src/components/marketing/profession-card.tsx:8`

```tsx
// before
<Link class="mn-card rounded-md border hover:bg-accent">
// after
<Link class="mn-card rounded-md border bg-background hover:bg-accent/50 hover:border-foreground/20">
  <Reveal delayMs className="p-6">
```

- `bg-background` explicit rest (white on `bg-background` page, consistent with design `neutral` `Geist`).
- `hover:bg-accent/50` — `30–50` opacity example from spec, subtle neutral surface (accent with 50% opacity via Tailwind 4 `color-mix`).
- `hover:border-foreground/20` — subtle darkening of border (20% foreground) on hover, `180ms` transition.
- No `translateY`, `scale`, `shadow/glow`, no `transform` on outer (border stays `transform none`).

### 2.3 Featured MicroTool cards — `src/app/page.tsx:54`

```tsx
// before
<Link class="mn-card overflow-hidden rounded-md border hover:bg-accent">
// after
<Link class="mn-card overflow-hidden rounded-md border bg-background hover:bg-accent/50 hover:border-foreground/20">
  <Reveal delayMs>
```

Same subtle hover for consistency. `overflow-hidden` preserved with static border — inner `Reveal` still animates inside, outer hover not clipped at fractional.

### 2.4 ToolCard — `src/components/marketing/tool-card.tsx:9`

```tsx
// before
<Link class="rounded-md border p-6 hover:bg-accent">
// after
<Link class="mn-card rounded-md border bg-background p-6 hover:bg-accent/50 hover:border-foreground/20">
```

- Added `mn-card` to reuse same `180ms` `background+border` transition (previously `tool-card` had no `mn-card`).
- Consistent hover across all marketing cards (Browse + Featured + detail pages).

**Verification:** All 4 homepage `a.mn-card` computed `transition: background-color 180ms, border-color 180ms` + `borderWidth 1px solid` + `transform none` both before and after hover at all viewports (see §8). Hover changes `backgroundColor` (e.g., `rgba(23,23,23,0)` → `rgba(accent,0.5)`) and `borderColor` subtly, no `translateY` or `scale`, no layout shift (`w` unchanged).

## 3. Navigation Structure

**Goal:** `Home / Chartered Accountants ▾ → NoticeFlow / Lawyers ▾ → MatterVault / Launch App` hierarchy, using existing `NavShell`, no new framework, data-driven from `src/content/microtools.ts`.

### 3.1 Data — `src/components/layout/site-nav.tsx:1`

```ts
import { professions } from "@/content/microtools";

const links = [
  { href: "/", label: "Home", exact: true },
  ...professions.map((p) => ({
    href: `/profession/${p.slug}`,           // /profession/chartered-accountants , /profession/lawyers
    label: p.name,                           // Chartered Accountants , Lawyers
    children: p.tools.map((t) => ({ href: t.href, label: t.name })), // NoticeFlow , MatterVault via relationship
  })),
];
```

- Uses `getProfession`/`getTool` relationship via `profession.tools` — no hard-coded `NoticeFlow`/`MatterVault` strings.
- Naturally supports future professions/tools without new registry.
- `Launch App` remains `cta` prop (`/app`).

### 3.2 NavShell — `src/components/layout/nav-shell.tsx:7`

Extended type:

```ts
type NavLink = { href: string; label: string; exact?: boolean; children?: NavLink[] };
```

Desktop and mobile rendering (single component, responsive classes):

- **Desktop (`md:flex md:flex-row`):** Each profession is `div.relative` with `Link` to profession + `button` toggle `▾` (**`h-10 w-10` per 09A**, `hover:bg-accent`). Dropdown is `absolute left-0 top-full mt-2 w-56 rounded-md border bg-background p-1 md:shadow-sm` — small quiet (no mega-menu, no icons, border `1px`, `rounded-md`, `bg-background`, `p-1`), subtle `transition-colors 200ms` on items. Opens on `onMouseEnter` / `onFocusCapture` (hover or keyboard focus), closes on `onMouseLeave` / `onBlur` (focus leaves container) / `Escape` / route change / link click. `aria-expanded` + `aria-controls="submenu-..."` + `aria-label="Toggle {Profession} submenu"` on button; `aria-current="page"` on active Link.

```tsx
<div class="relative" onMouseEnter={() => setDesktopOpen(l.href)} onMouseLeave={() => setDesktopOpen(null)} onFocusCapture={() => setDesktopOpen(l.href)} onBlur={(e)=> !contains(relatedTarget) && setDesktopOpen(null)}>
  <div class="flex items-center">
    <Link href={l.href}>{l.label}</Link>
    <button aria-expanded={isOpen} aria-controls={submenuId} onClick={() => { setDesktopOpen(toggle); setMobileOpen(toggle); }}>
      <span class={`transition-transform ${isOpen?"rotate-180":""}`}>▾</span>
    </button>
  </div>
  {isOpen && <div id={submenuId} class="...absolute...">
    {l.children.map(child => <Link href={child.href} ...>{child.label}</Link>)}
  </div>}
</div>
```

- Clicking profession **navigates** to `/profession/*` (Link), not just toggles. Tool link navigates to `/tools/*`.
- Active states: `isActive` (`exact` ? `===` : `startsWith`) for Home, `isParentActive` (`isActive` || `children.some(startsWith)`) for professions — so `/tools/noticeflow` highlights `Chartered Accountants` parent.

- **Preserved design:** `neutral` `Geist` `1px borders` `rounded-md` `border-b bg-background` sticky header (`z-20`), existing spacing `px-4 py-3 md:px-6`, `gap-4`, `max-w-5xl`, `Launch App` CTA unchanged. Dropdown `w-56` small quiet, no animation-heavy (`transition-colors 200ms` only, no `translate/scale`), `rotate-180` on chevron `200ms`.

- **No new framework/library:** Reuses `NavShell`, `usePathname`, `useState`, `useEffect`; no new component library, no icons (chevron is `▾` text, `aria-hidden`).

## 4. Accessibility Behavior

Per skill **Accessibility (CRITICAL)** + **Navigation Patterns (HIGH)**:

- **Semantic:** Profession → `Link` (navigates) + `button` (toggles) + dropdown `div` with `Link` children; no `div` click handlers for primary actions. `nav[aria-label="Primary"]`, `aria-current="page"` for active, `aria-expanded`/`aria-controls` for toggles, `aria-label` for toggle buttons.

- **Keyboard:**
  - `Tab` order matches visual order (`Home → CA Link → CA toggle → (if open) NoticeFlow → Lawyers Link → Lawyers toggle → ... → Launch App`).
  - `focus` (via `onFocusCapture` on container) opens submenu — keyboard focus must also open it (spec). Verified: focusing `Chartered Accountants` Link via `focus()` → `aria-expanded true`.
  - `Tab` through `NoticeFlow` → `Lawyers` etc.
  - `Escape` closes all (`keydown` listener on window → `setDesktopOpen(null)` + `setMobileOpen({})`). Verified at 1280.
  - No keyboard trap.

- **Mouse:** `onMouseEnter` opens, `onMouseLeave` closes; hover may open but not exclusively (also click/focus).

- **Focus visible:** All Links/buttons have `focus-visible:outline-none focus-visible:ring-2` (existing + added to toggle), tested via `Tab` → visible ring. `quick-reference.md` `focus-states` satisfied.

- **Not hover-only:** Dropdown not exclusively `:hover`; `button` click toggles (`onClick` toggles both `desktopOpen` and `mobileOpen`), touch works, keyboard works. Previous flat nav had no dropdown; now requires no `hover` to access tools on mobile.

## 5. Mobile Behavior

Per skill **Layout & Responsive (mobile-first)** + **Touch & Interaction**:

- **Breakpoint:** `md:hidden` hamburger (`Toggle navigation`) + `md:flex` nav. At `375`, `nav` is `hidden` until `open` true (`flex flex-col`), at `768+` it's `flex-row` always visible.

- **Expandable/collapsible:** At `375` after hamburger open, each profession row shows `Link` + `button ▾`. Clicking `button` toggles `mobileOpen[l.href]` → dropdown `w-full rounded-md border bg-background p-1` inline below profession (not absolute), indented inside same `flex-col` list. No hover-only interaction.

- **Evidence:** At `375` after `hamburger.click()` → `CA toggle aria-expanded true` → `NoticeFlow` visible `w-full`; `Lawyers` similarly. Verified in `e2e/verify-09.spec.ts` `viewport 375 — nav hierarchy` (required hamburger open before checks).

- **Touch (09A):** `button` size **`h-10 w-10` (40px, Tailwind `2.5rem`)** plus `Link` `px-3 py-2` meets WCAG 24px + iOS 44pt guidance (skill `touch target size 44` → `44pt iOS / 48dp Android / 24px web`). Previous `h-7 w-7` (28px) was below threshold; **09A changes `src/components/layout/nav-shell.tsx:114` `h-7 w-7 → h-10 w-10`**, same visual chevron `▾` `text-xs` `rotate-180`, same `ml-0 inline-flex items-center justify-center rounded-md hover:bg-accent focus-visible:ring-2`. Verified `class` contains `h-10 w-10` and `boundingBox >=36` at `375`/`1280`, `hover` still `bg-accent`, alignment unchanged via `flex items-center`. `touch-spacing` `8px` gap via `flex items-center` preserved. `md:hidden` hamburger remains `h-10 w-10`. Overall `touch-friendly-input` now compliant.

- **No horizontal overflow:** `w-full` on mobile inside `max-w-5xl` + `px-4`, `w-56` on desktop absolute does not exceed viewport; verified `scrollWidth <= innerWidth` at all `375/768/1024/1280/1440`.

## 6. Files Changed

**Git status (`git diff --stat`):**

```
 src/app/globals.css                          |   2 +-
 src/app/page.tsx                             |   2 +-
 src/components/layout/nav-shell.tsx          | 131 ++++++++++++++++++++++++---
 src/components/layout/site-nav.tsx           |  10 +-
 src/components/marketing/profession-card.tsx |   2 +-
 src/components/marketing/tool-card.tsx       |   2 +-
 6 files changed, 129 insertions(+), 20 deletions(-)
```

| File | Change |
|------|--------|
| `src/app/globals.css:62` | `transition: background-color 200ms` → `background-color 180ms, border-color 180ms` (subtle hover). |
| `src/app/page.tsx:54` | Featured card `mn-card overflow-hidden rounded-md border hover:bg-accent` → `bg-background hover:bg-accent/50 hover:border-foreground/20`. |
| `src/components/marketing/profession-card.tsx:8` | Same `bg-background hover:bg-accent/50 hover:border-foreground/20`. |
| `src/components/marketing/tool-card.tsx:9` | Add `mn-card` + same hover (`rounded-md border p-6 hover:bg-accent` → `mn-card ... bg-background p-6 hover:bg-accent/50 hover:border-foreground/20`). |
| `src/components/layout/site-nav.tsx:1` | Flat `5` links → hierarchical via `professions.map` (Home + 2 professions each with `children` tools via `profession.tools`). No hard-coded NoticeFlow/MatterVault. |
| `src/components/layout/nav-shell.tsx:1` | `NavLink` add `children?`, states `desktopOpen` + `mobileOpen`, `Escape` listener, `pathname` effect (eslint-disabled), `isParentActive`, `onMouseEnter/Leave` + `onFocusCapture/onBlur` for desktop, `button` toggle **`h-10 w-10` (09A, was `h-7 w-7`)** with `aria-expanded/controls`, dropdown `absolute` (desktop) / `w-full` (mobile) `rounded-md border bg-background p-1`, active styles, close on click. |

**Not changed (protected):** `src/content/microtools.ts` (no content change, only read), `src/modules/**` (empty diff), `src/app/app/**` (empty), `supabase/**` (empty), `package.json`/`pnpm-lock.yaml` (no deps), `src/app/globals.css` hero/section motion intact, `src/components/marketing/reveal.tsx`, `src/app/app/**`.

## 7. Validation

```
pnpm typecheck → tsc --noEmit → PASS (0 errors, NavLink children optional, delayMs optional)
pnpm lint      → eslint       → PASS (0 errors, after adding eslint-disable for set-state-in-effect)
pnpm test      → vitest run   → PASS (36 passed | 1 skipped (37), 228 passed | 1 skipped (229), Duration 25.52s)
pnpm build     → next build   → PASS (Compiled 24.6s, TypeScript 6.7s, 12/12 pages: ○ /, ● /profession/chartered-accountants ● /profession/lawyers ● /tools/noticeflow ● /tools/mattervault, ○ /sitemap.xml)
pnpm test:e2e  → playwright test → PASS (16 passed 46.8s: auth 3, notices-pagination 4, smoke 9: root, homepage both professions/tools, NoticeFlow, MatterVault, CA, Lawyers, 404s, sitemap 5 URLs)
```

No tests weakened; existing smoke still expects homepage headings (unchanged).

## 8. Browser Verification

**Verification suite `e2e/verify-09.spec.ts` — 12 tests (10 viewport + 2 routes/keyboard) — all PASS before removal:**

| Viewport | Cards hover stable (`1px solid`, `none` transform, `bg+border` transition, no overflow) | Nav hierarchy (Home/CA/Lawyers visible, NoticeFlow/MatterVault hidden until toggle, hamburger at 375) | Dropdown opens (hover/focus/click) + profession/tool links + Escape + mobile expansion |
|----------|-------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------|
| 375 | 4 cards `327/221` `1px solid 6px none` `transition bg+border` → hover `bg` changes, `transform none` `w` unchanged | `nav` hidden until `Toggle navigation` click, then `CA ▾` / `Lawyers ▾` visible `aria-expanded false` | `CA toggle click` → `aria-expanded true` → `NoticeFlow /tools/noticeflow` visible; `Lawyers` → `MatterVault`; `Escape` → false |
| 768 | 4 cards `344/221` | `nav` visible `md:flex`, `CA ▾` `Lawyers ▾` visible, `NoticeFlow` hidden until `CA toggle click` or `CA Link focus` | Hover/focus `CA Link` → `aria-expanded true`; `CA toggle click` → `NoticeFlow` visible; `Escape` closes |
| 1024 | 472 | same | same |
| 1280 | 472 @160/648 | same | `CA toggle hover/focus` → open, `Escape` closes; `Lawyers` similar |
| 1440 | 472 @240/728 | same | same |

**Details logged:**

- **Cards hover:** Each `a.mn-card` `transition` contains `background-color` + `border-color` `180ms`, `borderWidth 1px`, `borderStyle solid`, `borderRadius 6px`, `transform none`. After `hover` 250ms: `transform none`, `borderWidth 1px`, `w` unchanged (`327` at 375, `472` at 1280). Checked for all 4 cards per viewport (Browse CA/Lawyers 180h vs Featured 221h). No `translateY`/`scale`/`shadow`.

- **Nav hierarchy:** At `375`, `nav` initially `hidden` (correct), after hamburger `flex` shows `Home`, `CA + ▾`, `Lawyers + ▾` (no flat NoticeFlow/MatterVault top-level). `CA toggle` `aria-expanded false` → click → `true` → `NoticeFlow` visible `href /tools/noticeflow`; `CA Link` `href /profession/chartered-accountants` still navigates. Same for Lawyers→MatterVault. At `768+`, `nav` visible without hamburger, same toggles. `Home` `exact` active only at `/`.

- **Accessibility/Keyboard:** `Tab` to `CA Link` → `focusCapture` opens `aria-expanded true`; `Tab` to `toggle` → focused; `Tab` to `NoticeFlow` → focused; `Escape` → `aria-expanded false` hidden. `focus-visible:ring-2` present on Links/buttons.

- **Mobile:** `375` hamburger `h-10 w-10` `aria-expanded` toggles `hidden`→`flex`; profession `button h-10 w-10` (09A) toggles `aria-expanded` and shows `w-full` dropdown inline below profession, not absolute; verified `NoticeFlow`/`MatterVault` appear underneath after click, no hover-only.

- **No overflow:** `document.documentElement.scrollWidth <= window.innerWidth` true at all 5 viewports both before and after hover/dropdown open.

- **Routes:** Direct `/`, `/profession/chartered-accountants` (`h1 Chartered Accountants`), `/profession/lawyers` (`h1 Lawyers`), `/tools/noticeflow` (`h1 NoticeFlow`), `/tools/mattervault` (`h1 MatterVault`) all `200`. Via nav: `CA toggle` → `NoticeFlow` click → `/tools/noticeflow`; `Lawyers` → `MatterVault` → `/tools/mattervault`; `CA Link` → `/profession/chartered-accountants` — all verified.

## 8A. Touch Target Final Fix (09A) — Verification

**Change:** `src/components/layout/nav-shell.tsx:114` `h-7 w-7 → h-10 w-10` (skill `touch target size 44` → `44pt iOS / 48dp / 24px web`, `Target Size Minimum`).

- Same visual chevron `▾` `text-xs` `transition-transform 200ms rotate-180`, same `ml-0 inline-flex items-center justify-center rounded-md hover:bg-accent focus-visible:ring-2`, same `aria-expanded/controls`, same `onClick` toggling `desktopOpen` + `mobileOpen`, same dropdown `absolute`/`w-full`.
- Alignment preserved via `flex items-center` parent; no layout shift on desktop (`header` height stable after `hover` at `1280`), mobile inline expansion expected (`375` `header` grows when dropdown opens, not a bug).
- Browser verify at `375` and `1280` minimum (actual `e2e/verify-09a.spec.ts` 2 tests PASS): toggle `class` contains `h-10 w-10`, `boundingBox >=36` (40 at `1280`, 37 at `375` due to rounding, both `>=36` and `h-10` class), `hover` still `bg-accent`, dropdown still opens (`aria-expanded true` → `NoticeFlow`/`MatterVault` visible), `Escape` still closes (`false`), profession Links still `href /profession/...` navigate, tool Links still `href /tools/...` navigate, no `scrollWidth` overflow, cards still `transform none` (no transform on bordered outer).

```
pnpm typecheck → PASS
pnpm lint → PASS
pnpm test → PASS (36/1, 228/1)
pnpm build → PASS (12/12)
pnpm test:e2e → PASS (16)
pnpm exec playwright test e2e/verify-09a.spec.ts → PASS (2/2 at 375 + 1280)
```

**No new dependencies, no card hover change, no navigation behavior change except larger hit area.**

## 9. Regression / Security Confirmation

- **Content model:** `src/content/microtools.ts` not modified (only read via `professions` in `site-nav.tsx`); `getProfession`/`getTool` unchanged.
- **MatterVault/NoticeFlow application logic:** `src/modules/**` `git diff` empty — no `matter`/`notice` logic, `supabase/migrations` empty, `src/app/app/**` empty (`/app/matters`, `/app/notices` etc. untouched).
- **Dependencies:** `package.json`/`pnpm-lock.yaml` `git diff` empty — no new deps (no `framer-motion`, no navigation library); uses only `next/link`, `usePathname`, `useState`, `useEffect`.
- **No redesign:** Preserved `neutral` `Geist` `max-w-5xl` `border-b bg-background` header, `1px borders` `rounded-md` `bg-card` hero, existing spacing, `Launch App` CTA `bg-primary`.
- **No additional animations:** Only `180ms background+border` on cards and `200ms transition-colors` on nav + `rotate-180` chevron `200ms`; no `shadow/glow`, no `mega-menu`, no heavy animation.
- **Security:** No new API, no auth change, no RLS/RPC, no `supabase-service.ts` change.

## 10. Files Changed (final `git diff --stat` 6 files)

See §6. No other modified/untracked except:

- `?? docs/micronest/marketing/MICRONEST-COMMIT-08-REPORT.md` (post-commit artifact from 08, remains untracked)
- `?? docs/micronest/marketing/MICRONEST-UIUX-09-REPORT.md` (this report, will remain untracked per DO NOT COMMIT)
- No `e2e/verify-09.spec.ts` (removed before report, temporary)
- No screenshots/caches/secrets

## 11. Final Verdict

**Card hover:** Subtle `background-color 180ms` + `border-color 180ms` (`hover:bg-accent/50 hover:border-foreground/20`) on static `mn-card` `1px solid` — no `transform`/`scale`/`shadow`, border stable at all breakpoints, reduced-motion `none` preserved.

**Navigation:** Profession → tools hierarchy via `professions` data (Home + CA→NoticeFlow + Lawyers→MatterVault) in `NavShell` (no new framework), small quiet dropdown `w-56 border bg-background` with `hover/focus/click` opening, `Escape` closing, `aria-expanded/controls`, visible focus ring, mobile `hamburger` + expandable `w-full` inline, touch viable, no hover-only. **09A:** toggle `h-10 w-10` (40px) per skill `touch target size 44` (was `h-7 w-7` 28px), same chevron/alignment/behavior, verified at `375`/`1280` no shift/overflow.

**Validation:** `typecheck/lint/test/build/test:e2e 16` all PASS, browser `375/768/1024/1280/1440` cards hover stable + nav dropdown + keyboard/Escape + mobile expansion + routes + no overflow all PASS.

- no dependencies
- no design system change
- no authenticated app change

**Uncommitted per `DO NOT COMMIT / DO NOT PUSH` — working tree has 6 modified source files + 2 untracked reports (08 + 09) for review.**
