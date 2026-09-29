# MICRONEST DESIGN SYSTEM AUDIT 01 — PREMIUM PROFESSIONAL SAAS

**Date:** 2026-09-29 23:00 IST
**Baseline:** `c72c92428d55f9eb3a48ccf2029561d153c116c7` `feat(marketing): add profession navigation and card interactions` (09 + 09A `h-10 w-10`)
**Skill:** `ui-ux-pro-max` (`C:\Users\91866\.agents\skills\ui-ux-pro-max`, `SKILL.md`, `references/quick-reference.md`, `scripts/search.py`)
**Mode:** AUDIT ONLY — no code changes, no deps, no commit/push
**Target:** PREMIUM PROFESSIONAL SAAS + QUIET AUTHORITY + EDITORIAL + MODERN + DISTINCTIVE — extend existing Tailwind/shadcn `neutral` `Geist` foundation, not flashy, one controlled implementation pass next

---

## 1. Executive Summary

Current marketing UI is **technically correct but visually under-differentiated**: responsive at `375/768/1024/1280/1440/1920` (via verify-10), borders stable (`OUTER BORDER MUST NEVER BE TRANSFORMED` invariant intact after 08), navigation hierarchical and accessible, hover subtle — but **almost entirely black/white** (`--background #fff` / `--foreground #171717` only two tokens in `src/app/globals.css:3`), weak hierarchy, primary CTA does not feel primary, cards flat, sections lack surface rhythm, hover barely visible even after 10's `bg-muted` bump, no recognizable accent, interactions lack a consistent language. Authenticated app (`src/app/app/*`, `src/components/layout/app-nav.tsx`) uses same `neutral` flat style — conventions exist but marketing has no intentional accent to signal *MicroNest* vs generic shadcn.

Audit proposes **one restrained brand accent (deep indigo `#1E3A5F` → primary, with `+` muted/ border system)** plus **3 brand mechanisms (accent dot + section eyebrow rule + CTA hierarchy)** to achieve quiet authority without neon, gradients, or glass. All recommendations extend `tailwindcss 4.1.8` + `shadcn` `baseColor neutral` + `Geist` — no new deps, no `Framer Motion`. Next implementation pass can be ~7 files (`globals.css`, `page.tsx`, `button.tsx`, `profession-card.tsx`, `tool-card.tsx`, `nav-shell.tsx`, `badge.tsx`).

**Key decision:** Remain **near-monochrome with one accent**, not pure monochrome. Pure `black/white` cannot create `primary` hierarchy or card depth without shadow abuse. One deep professional accent solves CTA, hierarchy, and identity with minimal tokens.

---

## 2. Current Design Diagnosis

**Inspected:** `src/app/globals.css` (87 lines, only 2 tokens, `bg-grid` 15% border, `mn-*` motion), `src/app/page.tsx` (146 lines, `max-w-5xl` hero / `max-w-6xl` browse/featured/why/footer, `mn-reveal` hero, `Reveal` inner for cards), `src/components/ui/button.tsx` (cva `default bg-primary hover:bg-primary/90` `outline` `ghost`, `active:scale-[0.98]`), `src/components/ui/badge.tsx` (`default bg-primary` / `outline`), `src/components/layout/nav-shell.tsx` (159 lines, `sticky` `max-w-6xl` hierarchical), `src/components/layout/site-nav.tsx` (professions via `profession.tools`), `src/components/marketing/profession-card.tsx` (`mn-card border bg-background hover:bg-muted hover:border-foreground/30` `180ms`), `src/content/microtools.ts` (2 professions → 2 tools), plus authenticated `src/app/app/layout.tsx` (`AppNav` flat `Dashboard/Notices/Matters/Clients/Members`), `src/components/layout/app-nav.tsx`.

| Area | Current State | Problem | Impact |
|------|---------------|---------|--------|
| **Color** | Only `#fff`/`#171717` + Tailwind `neutral` `border` `muted` `accent` via shadcn defaults (no explicit tokens in `globals.css`); primary `bg-primary` is near-black `#171717` / `0a0a0a` dark, accent `bg-muted`/`bg-accent` barely distinguishable from background | Almost entirely black/white, no accent, weak hierarchy, primary buttons look like secondary | Low distinctive, low CTA hierarchy |
| **Button** | `Explore MicroTools` `bg-primary text-primary-foreground` `hover:bg-primary/90` `active:scale` (primary) vs `Launch App` `border bg-background hover:bg-accent` (secondary) — both `h-9`, same radius, same font; no strong contrast between primary/secondary | Primary does not *feel* primary: both near-black/white, hover `90%` too subtle, no `active` border distinction | Medium |
| **Card** | `rounded-md border bg-background p-6 hover:bg-muted hover:border-foreground/30` `180ms` — flat, no distinctive surface, hover now visible after 10 but still `muted` (light gray) on white is low contrast | Cards feel flat, no surface differentiation from page, hover weak vs `border` alone | Medium |
| **Page surfaces** | `bg-background` page, `bg-muted/10` hero `rounded-lg` `bg-grid 15%`, cards `bg-background`, workflow strip `bg-muted/20 border-t`, why `border-t` — almost all white, hero `muted/10` too faint | Sections lack surface rhythm, no quiet differentiation, visual flatness, hero grid 40% opacity too subtle | Medium |
| **Typography** | `Geist` `font-sans` only, `tracking-[0.2em] uppercase` eyebrow `text-xs`, `h1 text-4xl md:text-5xl font-bold`, `h2 text-2xl font-semibold`, body `text-base md:text-lg`, `text-sm` cards — hierarchy via size/weight only, no editorial accent | Hierarchy weak, all `Geist`, no distinctive display vs body, eyebrow muted gray disappears | Low |
| **Interaction** | `transition-colors 200ms` nav, `mn-card 180ms bg/border`, `mn-section 400ms opacity/translateY 8`, `active:scale-[0.98]` on hero CTAs only, dropdown `200ms` — consistent but too uniform, no `active` for cards, `focus-visible:ring-2` generic | Lacks consistent language for `active/click` on cards, `selected` state missing, all `200ms` similar | Low |
| **Brand identity** | `h-2 w-2 bg-primary` dot in `Profession → Workflow → MicroTool` pills, `bg-grid`, `Geist` — no logo, no accent line, no numbered workflow, no CTA treatment distinction | No recognizable accent, interactions lack consistent language, almost generic shadcn | High |

**Authenticated app conventions:** `AppNav` flat `5` links (`Dashboard/Notices/Matters/Clients/Members`) via same `NavShell` `max-w-6xl` `border-b`, no dropdown, `brand MicroNest` vs marketing `MicroNest MicroTools`, same `neutral` palette, `Button` same `bg-primary` — marketing should feel like premium editorial *outside* while app remains functional *inside*; marketing can afford one accent, app can stay neutral.

**Overall:** Responsive and stable (08 border invariant, 09A `h-10 w-10`), but monochrome flatness prevents premium feel. Audit must add *restrained* color/surface/typography without flashy or transform abuse.

---

## 3. Design Direction

**Target:** `PREMIUM PROFESSIONAL SAAS` — for Chartered Accountants and litigators handling statutory deadlines, not consumer playful. `QUIET AUTHORITY` — confident, not loud, like Stripe/Linear/Figma marketing with editorial restraint. `EDITORIAL` — asymmetric grid? No, but magazine-like hierarchy (eyebrow → headline → supporting → CTA → triad). `MODERN` — `Geist` clean, `rounded-md` consistent, `neutral` base. `DISTINCTIVE` — one accent makes MicroNest recognizable in screenshots.

**Principles (from `ui-ux-pro-max` priority 1→10):**
- **1 Accessibility:** `4.5:1` contrast, `focus-visible:ring-2`, `prefers-reduced-motion`.
- **2 Touch:** `44×44` `h-10 w-10` already fixed.
- **3 Performance:** No layout shift, `transform` only on inner `Reveal`, no `width/height` animation.
- **4 Style Selection:** One accent, consistency, SVG icons not emoji.
- **5 Layout & Responsive:** `mobile-first`, `max-w-5xl` hero / `max-w-6xl` content, no `horizontal scroll`.
- **6 Typography & Color:** `16px` base `1.5` line-height, semantic tokens not raw hex.
- **7 Animation:** `150–250ms` subtle, `transform/opacity` only, `stagger 30–60ms`.
- **8 Forms/Feedback, 9 Navigation:** `bottom-nav ≤5`, deep linking (already).
- Extend `neutral` base, do not replace.

**Mood keywords:** `professional, editorial, quiet, authoritative, restrained, precise, statutory, deadline-aware, tenant-isolated`.

---

## 4. Color System

**Decision:** Remain **near-monochrome with ONE restrained brand accent**, not pure monochrome. Pure `black/white` fails to create primary hierarchy without shadow. One accent solves CTA + hierarchy + identity with minimal tokens, keeps `neutral` foundation.

**Skill research:**

- Query `professional saas color` → Result 1 `Micro SaaS` `Indigo #6366F1 / Emerald #059669` + `B2B Service` `Navy #0F172A / Blue #0369A1` — professional indigo/navy common for B2B.
- Query `legal finance professional` → Result 1 `Legal Services` `Navy #1E3A8A + Gold #B45309` `Authority navy + trust gold`, Result 3 `Banking` `Navy #0F172A + Gold #A16207` — **deep navy/indigo** is consensus for legal/finance trust, gold too warm for MicroNest.
- Query `indigo accent professional` → `Resume #1E3A5F / Blue #2563EB + Green #16A34A` `Professional navy`.

**Evaluation of alternatives:**

| Accent | Hex | Pros (MicroNest) | Cons | Verdict |
|--------|-----|------------------|------|---------|
| **Deep Blue** `#1E3A5F` / `#1E3A8A` | Professional, trust, matches CA `NoticeFlow` statutory authority, dark enough for `QUIET AUTHORITY` | Slightly cold, needs warm muted to balance | **Recommended primary** |
| **Indigo** `#6366F1` | Modern SaaS, distinctive, `ui-ux-pro-max` Micro SaaS primary | Can feel consumer playful, too vibrant for litigators | Alternative for `muted` accent line |
| **Teal** `#0F766E` | Calm, distinctive, works for document workflow | Less authority for legal, may feel health | Rejected |
| **Emerald** `#059669` | Success green, but MicroNest needs trust not profit | Too `success` semantic, conflicts with `destructive` | Rejected |
| **Warm Amber** `#B45309` | Gold trust (legal), premium | Too warm, conflicts with `destructive` red, needs careful contrast | Rejected as primary, could be secondary accent line if needed |

**Recommendation: ONE restrained brand accent = Deep Navy-Indigo `#1E3A5F` (or `#1E3A8A` for slightly more blue).**

**Proposed tokens (extend `globals.css:3`, not neon, not gradients, not excessive):**

```css
:root {
  --background: #ffffff;
  --foreground: #0F172A; /* deeper than #171717, spec: Professional navy foreground, was #171717 */
  --card: #ffffff;
  --card-foreground: #0F172A;
  --muted: #F1F5F9; /* was implicit, now explicit light neutral surface */
  --muted-foreground: #475569; /* from skill: 475569 */
  --border: #E2E8F0; /* was --color-border implicit, now explicit neutral 200 */
  --primary: #1E3A5F; /* NEW: deep navy-indigo, was #171717 black */
  --primary-foreground: #ffffff;
  --accent: #EBEFF9; /* light indigo muted for hover, was default */
  --accent-foreground: #1E3A5F;
  --ring: #1E3A5F;
  --destructive: #DC2626;
  --destructive-foreground: #ffffff;
  --success: #059669; /* emerald for workflow success, but restrained */
  --warning: #D97706; /* amber for deadlines, but not primary */
}
@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
    --primary: #3B82F6; /* lighter blue for dark mode contrast */
  }
}
```

- **Background** `#fff` — keep, base.
- **Foreground** `#0F172A` — deeper navy vs `#171717`, more editorial authority, 4.5:1 on white `15.8:1`.
- **Muted surface** `#F1F5F9` (`muted`) vs `F8FAFC` — for hero `bg-muted/10` → more visible `bg-muted/40`? Or hero `bg-muted`.
- **Card surface** `#fff` — keep, but hover `bg-muted`.
- **Border** `#E2E8F0` — neutral 200, slightly darker than current implicit, gives subtle card definition.
- **Primary brand color** `#1E3A5F` — deep navy-indigo, restrained, professional, quiet authority, not neon, not gradient, one accent.
- **Primary foreground** `#fff` — contrast `8.5:1`.
- **Accent** `#EBEFF9` — light indigo tint for hover (`hover:bg-accent` becomes visible indigo tint vs barely visible before).
- **Destructive** `#DC2626` — standard red, keep.
- **Success** `#059669` — emerald, for workflow `Ready` etc., but not primary.
- **Warning** `#D97706` — amber, for deadline urgency.

**Why this accent:** Matches MicroNest's **legal/finance trust** (CA notices, litigators), deep navy is `QUIET AUTHORITY` vs indigo `6366F1` too vibrant, vs teal too health, vs amber too warm. One accent keeps monochrome discipline (previously almost entirely black/white had no accent — now one accent gives distinctive brand in screenshots). All hovers (`bg-muted`/`bg-accent`) become indigo-tinted vs gray, making cards feel premium not flat.

**Do NOT:** Neon (`#6366F1` at full saturation), gradients, excessive colors (keep to `primary` + `muted` + `border` + `destructive` only).

---

## 5. Typography System

**Keep Geist unless strong reason not to.** `Geist` `font-sans` already `neutral` professional, editorial via weight/size not new font.

**Audit per `quick-reference.md` Typography (6):**

| Element | Current | Desired Hierarchy | Design Rule |
|---------|---------|-------------------|-------------|
| **Display heading** `h1` | `text-4xl md:text-5xl font-bold tracking-tight` `max-w-2xl` | Keep `Geist`, `font-bold 700`, `tracking-tight -0.02em`, `text-4xl md:text-5xl`, `line-height 1.1`, `color foreground #0F172A` (deeper) | Add `text-foreground` explicit, keep `balance` |
| **Section heading** `h2` | `text-2xl font-semibold` | `text-2xl md:text-3xl font-semibold tracking-tight`, add subtle `eyebrow` above each section? Or keep `text-2xl` but add `text-xs uppercase tracking-[0.2em]` label e.g., `Browse` / `Featured` / `Why` | Add `uppercase eyebrow` for editorial rhythm |
| **Body** | `text-base md:text-lg leading-6` muted | `text-base leading-7` (`1.75` per `line-height` rule), `text-muted-foreground #475569` for supporting | Increase `leading-7` for readability |
| **Muted text** | `text-sm text-muted-foreground` | Same, `text-sm leading-6` | Keep |
| **Eyebrow** | `text-xs tracking-[0.2em] uppercase text-muted-foreground` | Keep, but make accent `text-primary` dot? Or keep muted, but add `h-px w-8 bg-primary` accent line? | Use brand dot already `h-2 w-2 bg-primary` (now indigo) |
| **Labels** | `Badge outline` | `Badge` `text-xs font-medium` with `bg-primary` for `Available` (primary) vs `outline` for `Coming soon` — hierarchy | `Available` `bg-primary text-primary-foreground` (indigo) vs `outline` |
| **Button typography** | `text-sm font-medium` | Keep `text-sm font-medium`, primary `font-semibold`? Add `tracking-wide`? | Primary CTA `font-semibold` to look primary |

**Hierarchy rather than many sizes:** Use `12 / 14 / 16 / 18 / 24 / 32 / 48` scale already via `text-xs / text-sm / text-base / text-2xl / text-4xl`, add `text-3xl` for `h2` at desktop only.

**Geist keep reason:** No strong reason to replace — `Inter` pairing would be `Inter` vs `Geist` similar neutral, but `Geist` already distinctive for Vercel-like premium SaaS, editorial `Geist` + `mono` sufficient. Changing would be redesign.

---

## 6. Surface System

**Goal:** Visual rhythm without clutter, avoid every section being another card.

**Current:** Base `bg-background` (white), hero `bg-muted/10` + `bg-grid 40%` (too faint), cards `bg-background`, workflow strip `bg-muted/20` `border-t`, why `border-t`.

**Proposed rhythm (extend muted):**

| Surface | Current | Desired | Rule |
|---------|---------|---------|------|
| **Base background** | `bg-background #fff` | Keep `#fff` | Base |
| **Hero surface** | `bg-muted/10 rounded-lg` with `bg-grid 15%` | `bg-muted/40` or `bg-card` + subtle `border` + `bg-grid 20%` — slightly stronger to differentiate from base, not card-like | Hero needs subtle hero surface, not just `10%` faint |
| **Section surface** | No differentiation (all white) | **Alternate:** `Browse` white, `Featured` `bg-muted/30` subtle strip? Or keep white but use `border-t` dividers already in Why | Avoid every section card, use `muted` strip for Featured only |
| **Cards** | `bg-background` | `bg-card #fff` `border #E2E8F0` `rounded-md` | Card surface distinct via `border` + `hover:bg-muted` |
| **Muted workflow strip** | `bg-muted/20 border-t` | Keep `bg-muted/30` slightly stronger, `border-t` muted | Workflow strip is `muted` tint, not white |

**Avoid visual clutter:** Not every section gets `bg-muted`; only hero + featured workflow strip have `muted` tint, others stay white. This creates `white → muted hero → white Browse → white Featured (but cards) + muted strip → white Why` rhythm.

**Implementation:** In `globals.css` define `--muted: #F1F5F9`, then hero `bg-muted` (or `bg-muted/50`), workflow `bg-muted`.

---

## 7. Border System

**Current:** `border` `1px` `rounded-md` on cards, `border-t` on workflow/why/footer, `border-b` on header, `rounded-full border bg-card` pills in hero triad, `rounded-full border bg-background` workflow pills inside cards.

**Problems:** `border` color implicit (`--color-border` 15% grid), cards feel flat due to faint border, hover `border-foreground/20→30` subtle but `border` itself weak.

**Define consistent:**

- **Width:** `1px` `border` for all cards/nav (keep), `border-t` for separators.
- **Color:** Light `border #E2E8F0` (neutral 200) rest, `hover:border-foreground/30` or `hover:border-primary/20` (indigo tint) for cards — stronger than current but still quiet.
- **Radius:** `rounded-md` (`6px`) for cards/buttons, `rounded-lg` (`8px`) for hero, `rounded-full` for pills/badges — keep, consistent `6px` not excessive (`quick-reference` `effects-match-style`).
- **Focus border:** `focus-visible:ring-1 ring-primary` already via `Button` `focus-visible:ring-ring`.

**Preserve 08 invariant:** `OUTER BORDER MUST NEVER BE TRANSFORMED` — border stays on static outer `Link` `mn-card`, inner `Reveal` has `transform`, not outer.

**Do NOT:** Glass, huge shadows, glow, `transform` on bordered cards, excessive `rounded-2xl`.

---

## 8. Button System

**Audit existing `src/components/ui/button.tsx`:**

```ts
default: "bg-primary text-primary-foreground shadow hover:bg-primary/90" // primary
outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground" // secondary
ghost: "hover:bg-accent hover:text-accent-foreground" // ghost
```

**Current hierarchy problem:** `Explore MicroTools` `bg-primary` (near-black) `hover:bg-primary/90` vs `Launch App` `border bg-background hover:bg-accent` — both `h-9` same radius/font, primary not *obviously* primary (both monochrome, `90%` hover too subtle).

**Define (extend, not redesign):**

| Variant | Rest | Hover | Active/Click | Focus | Usage |
|---------|------|-------|--------------|-------|-------|
| **Primary** (`default`) | `bg-primary #1E3A5F` `text-primary-foreground #fff` `shadow-sm` (keep) | `hover:bg-primary/90` (or `hover:bg-[#1E3A8A]` slightly lighter indigo) — keep `90%` but with indigo it's more visible (navy → lighter navy) | `active:scale-[0.98]` + `active:bg-primary/80` (already) | `focus-visible:ring-1 ring-primary` | `Explore MicroTools` (hero), form submits, `Launch App` inside hero? Actually `Launch App` is secondary. |
| **Secondary** (`outline`) | `border border-input bg-background` `text-foreground` | `hover:bg-accent hover:text-accent-foreground` → `hover:bg-muted hover:border-foreground/30` (more visible) | `active:bg-muted` | same ring | `Launch App` in hero (currently `border bg-background`), secondary CTAs |
| **Ghost** | `hover:bg-accent` | `hover:bg-muted` | `active:bg-accent` | | `Toggle navigation` hamburger, dropdown `button` toggle |
| **Link** | `underline` `text-muted-foreground` | `hover:text-foreground` + `hover:bg-accent`? Actually footer `underline` `text-muted-foreground` → `hover:text-foreground` | | `focus-visible:ring-2` | Footer `Chartered Accountants` etc. |

**Current `Explore` vs `Launch App` hierarchy:** Must be obvious: `Explore` solid indigo `bg-primary` with white text vs `Launch App` `border` white with dark text — primary looks primary via solid vs outline; after accent change, `primary` indigo vs `secondary` border will be more distinct (currently both black/white similar). Keep `h-9 px-6`, `rounded-md`, `text-sm font-medium`, but make primary `font-semibold`? Add `shadow-sm` to primary only.

**Implementation:** No new file, just update `button.tsx` `default` to use new `--primary` `#1E3A5F` (already via CSS var, no code change), but ensure `hover:bg-primary/90` remains. Secondary `hover:bg-accent` will become indigo tint `EBEFF9` more visible.

---

## 9. Card System

**Define consistent (preserve 08 invariant):**

| Property | Value |
|----------|-------|
| **Background** | `bg-card #fff` rest, `hover:bg-muted` (or `hover:bg-accent` indigo tint) — `muted #F1F5F9` |
| **Border** | `1px solid border #E2E8F0` rest, `hover:border-primary/20` or `hover:border-foreground/30` — border stronger on hover, `180ms` |
| **Radius** | `rounded-md 6px` (cards), `overflow-hidden` for Featured (already) |
| **Padding** | `p-6` (profession) / `p-6` + `px-6 py-3` workflow strip (featured) — keep `8dp` spacing scale |
| **Hover** | `hover:bg-muted hover:border-foreground/30` `transition: background-color 180ms, border-color 180ms` — no transform, no shadow |
| **Active** | `active:bg-muted/80` or `active:scale-[0.98]`? But **DO NOT** use `transform` on bordered outer — so `active:scale` is forbidden for cards (hero CTA has `active:scale` but card outer must not). Use `active:bg-muted` only. |
| **Focus** | `focus-visible:ring-2 ring-primary` (via `Link` focus) — `outline-none` + `ring` |
| **Selected** | Not needed for marketing cards (no selection), but if needed: `border-primary bg-accent` |

**Do NOT:** Glass, huge shadows (`shadow-lg`), glow, `transform` on bordered cards, `rounded-2xl` excessive.

**Preserve 08 invariant:** Outer `Link.mn-card` static `transform none` `opacity 1`, inner `Reveal` animates `opacity/translateY` — verified `verify-10` `transform none` before/after hover.

---

## 10. Interaction System

**Define consistent behavior (150–250ms, no Framer Motion, no infinite, no scroll gimmicks):**

| State | Duration/Easing | Visual | Notes |
|-------|-----------------|--------|-------|
| **hover** | `180ms ease-out` (cards) / `200ms` (nav) | `background-color` + `border-color` change, `cursor-pointer` | Cards: `bg-muted` + `border` stronger; Nav: `hover:bg-accent` |
| **active/click** | `100ms` | `active:bg-muted/80` or `active:scale-[0.98]` only for buttons *not* bordered cards (hero CTAs have `active:scale`, cards should not) | Skill `press-feedback` `scale 0.95–1.05` for tappable cards/buttons but **not for bordered outer** |
| **focus** | instant | `focus-visible:ring-1/2 ring-primary` `outline-none` | All `Link`/`button` have `focus-visible:ring-2` |
| **disabled** | — | `opacity 50%` `pointer-events-none` (via `Button` disabled) | |
| **selected** | `180ms` | `bg-primary text-primary-foreground` for nav active (`bg-foreground` currently) | `NavShell` `bg-foreground` for active `Home` etc. |
| **navigation dropdown** | `200ms` `ease-out` `transition-colors` + `rotate-180` chevron `200ms` | `absolute w-56 border bg-background p-1` `hover:bg-accent` | No heavy animation |
| **cards** | `180ms` hover, `400ms` reveal `opacity/translateY 8` stagger `60ms` | Reveal inner, not outer | Already |
| **buttons** | `200ms` `hover:bg-primary/90` | Primary `bg-primary` → `90%` | |
| **links** | `200ms` | `underline` → `hover:text-foreground` | Footer |

**Animations remain subtle:** `150–250ms` (hero `500ms` reveal is exception for entrance, but `150–200` for hover), `quick-reference` `duration-timing` `transform-performance` (only `transform/opacity`), `exit-faster-than-enter`, `stagger 30–60ms` (currently `60ms`).

---

## 11. Navigation System

**Current `src/components/layout/nav-shell.tsx`:** `sticky top-0 z-20 border-b bg-background max-w-6xl`, flat vs hierarchical via `professions`, dropdown `w-56 border bg-background p-1`, `h-10 w-10` toggle, `Escape`, `focusCapture`.

**Audit:** Navigation already follows skill `Navigation Patterns` (sticky, `z-20`, not `z-100`), `predictable back`, `deep linking` (`/profession/*` + `/tools/*`).

**Recommendations (extend, not redesign):**

- Keep `sticky` with `max-w-6xl` (wider desktop) — correct.
- Dropdown small quiet `w-56` correct — not mega-menu.
- Add `focus-not-obscured` check: sticky nav `h` ~56px must not hide `focus` when anchor links? No anchor, fine.
- Ensure `skip-links` for keyboard users? Not yet, but could add `Skip to main content` hidden link (skill `skip-links`).
- Keep `bottom-nav-limit` not applicable (desktop header).
- No change to hierarchy — already `Home / CA ▾ → NoticeFlow / Lawyers ▾ → MatterVault`.

**No new framework.**

---

## 12. Hero System

**Current `src/app/page.tsx:13`:** `mx-auto max-w-5xl relative overflow-hidden rounded-lg bg-muted/10 py-16 md:py-20` with `bg-grid 40%` + `eyebrow tracking-[0.2em] uppercase muted` + `h1 text-4xl md:text-5xl font-bold tracking-tight max-w-2xl` + `p text-base md:text-lg muted max-w-2xl` + `Explore bg-primary / Launch App border` + `triad pills rounded-full border bg-card`.

**Problems:** Almost white hero (`muted/10` too faint), grid `40%` subtle, CTA hierarchy weak (both `h-9`), triad pills border `bg-card` vs hero `muted/10` low contrast.

**Desired change (design rule):**

| Element | Current Problem | Desired Change | Rule |
|---------|-----------------|----------------|------|
| **Hero surface** | `bg-muted/10` faint | `bg-muted/40` or `bg-card border` slightly stronger, `bg-grid` `color-mix 20%` not `15%` | Hero needs subtle hero surface, not just `10%` faint |
| **Eyebrow** | `text-muted-foreground` gray disappears | Keep `tracking-[0.2em] uppercase text-xs` but add small accent `h-px w-8 bg-primary` line above? Or keep muted but add `font-medium` | Eyebrow needs more presence vs body |
| **Headline** | `Geist bold` good, but no accent | Keep `Geist bold`, maybe `text-foreground #0F172A` deeper, `tracking-tight` | Editorial: headline is hero, no change needed beyond deeper color |
| **CTAs** | Both `h-9` same size, hierarchy weak | Primary `Explore` `bg-primary` indigo `shadow-sm` `font-semibold`, secondary `Launch App` `border bg-background` — make primary *look* primary via solid indigo vs outline | Button system: primary solid vs secondary outline |
| **Triad** | Pills `border bg-card` on `muted/10` low contrast | Pills `border bg-card shadow-sm` or `bg-background border` with `h-2 w-2 bg-primary` dot already accent — keep but ensure `bg-card` vs hero `muted` contrast | Triad is already good with dots, keep |

**Keep:** `Geist` `neutral`, `rounded-lg` hero, `bg-grid` MIT pattern.

---

## 13. Section System

**Current:** `Browse` `Why` etc. `space-y-4`, `h2 text-2xl font-semibold`, grids `gap-4 md:grid-cols-2` (Browse/Featured) / `gap-6 md:grid-cols-3` (Why), `border-t` separators in Why/Footer.

**Desired change:**

| Section | Current Problem | Desired Change | Rule |
|---------|-----------------|----------------|------|
| **Browse by Profession** `max-w-6xl` | No surface differentiation, `h2` `2xl` weak | Add eyebrow `Browse` `text-xs uppercase tracking-[0.2em] muted` above `h2`? Or keep `h2` but add `border-b`? Keep white background, cards `bg-card` provide rhythm | Section needs `h2` + maybe eyebrow, not another card |
| **Featured MicroTools** | No surface, cards flat | Keep white but workflow strip `bg-muted/20` → `bg-muted/40` slightly stronger for rhythm, cards `hover:bg-muted` already | Visual rhythm via `muted` strip |
| **Why MicroTools** | `border-t` faint, `h3 text-sm font-medium` muted hierarchy | Keep `border-t` but make `pt-8` more breathing (already `pt-6` → `pt-8` after 10), `h3` `font-semibold` vs `medium`? Keep `leading-6` | Why needs more breathing vs Browse |

**Avoid making every section another card:** Only hero + workflow strip have `muted` tint, others white — rhythm without clutter.

---

## 14. Workflow Visual System

**Current:** Inside Featured cards, `border-t bg-muted/20 px-6 py-3 text-xs flex-wrap gap-1.5` with `rounded-full border bg-background px-2 py-0.5` pills `Receipt→Review→Draft→Submit→Follow-up→Close` and `Create→Checklist→Upload→Verify→Ready→Archive`, `→` muted `aria-hidden`.

**Problems:** `bg-muted/20` too faint, `rounded-full border` pills `bg-background` on `muted/20` low contrast, `→` `text-muted-foreground` small, no numbered hierarchy, no accent.

**Recommendations (1–3 mechanisms for brand identity, but workflow is one):**

- **Mechanism 1 (numbered workflow):** Could add small numbered circles? But current pills `Receipt` etc. are workflow steps — could number `1 Receipt`? However would be redesign of content, task says `Do not redesign content` in 08, but audit can recommend. Keep pills but make `bg-background` → `bg-card` with `border` slightly stronger, `→` `text-primary` indigo tint subtle? Or keep muted.
- **Surface:** `bg-muted/20` → `bg-muted/40` stronger for rhythm.
- **Accent line:** Below workflow strip, could add `h-px bg-primary/20` subtle accent line? But would be extra.
- **Keep:** `rounded-full` pills are distinctive for workflow, consistent `border`, no new iconography needed.

**Design rule:** Workflow strip is `muted` surface differentiation, not card; pills `bg-background` distinct from strip; `→` muted is fine.

**Do not:** Add illustration system, numbered workflow if not needed.

---

## 15. Brand Identity

**Current almost no visual identity beyond typography:** `h-2 w-2 bg-primary` dot in triad, `bg-grid`, `Geist`.

**Recommend only 1–3 mechanisms (no logo project, no illustration):**

| Mechanism | Description | Why it fits MicroNest | Implementation | Not to copy |
|-----------|-------------|-----------------------|----------------|-------------|
| **1. One accent color (Deep Navy-Indigo `#1E3A5F`)** | Primary `bg-primary` indigo for `Explore` CTA, `Available` badge, active nav `bg-foreground`? Actually `bg-primary` already, but now indigo vs black; hover `bg-accent EBFF9` indigo tint; `h-2 w-2 bg-primary` dot already | Professional trust for CA/litigators, `quiet authority`, distinctive in screenshots vs black/white, not neon | `globals.css` `--primary #1E3A5F`, `buttonVariants default bg-primary`, `Badge default bg-primary` | Neon `#6366F1` full, gradients, excessive colors |
| **2. Small geometric mark — accent dot + accent line** | Already `h-2 w-2 bg-primary` dot in triad pills; extend to `section label rule`: each `h2` section could have small `h-px w-8 bg-primary/30` line above eyebrow? Or `border-t` could be `border-primary/10`? | Minimal geometry, editorial, creates brand recall without logo | Add `div h-px w-8 bg-primary` above `Browse`/`Featured`/`Why` `h2` or keep dot only | Huge logo, illustration |
| **3. Consistent CTA treatment** | Primary `Explore MicroTools` solid indigo `shadow-sm` `font-medium`, secondary `Launch App` outline, dropdown `bg-primary` active | Creates identity via CTA hierarchy, restrained iconography (no icons unless useful, per task) | `button.tsx` variants already, just ensure primary `shadow-sm` | Restrained iconography — no icons in nav pills (already no icons, good) |

**Why 3 is enough:** One accent color gives distinctive screenshots, dot gives small geometric memory, CTA treatment gives interaction identity — no need for numbered workflow as brand (workflow pills already numbered via order), no illustration.

**No logo project:** Keep `MicroNest MicroTools` text brand.

---

## 16. Responsive System

**Evaluate `375/768/1024/1280/1440/1920` for proposed design system:**

| Viewport | Current (after 10) | Proposed with accent/surface | Works? |
|----------|--------------------|------------------------------|--------|
| **375** | Header `375` full, hero `327` `1024` max, browse `327`, headline `279` | Same widths, accent indigo `primary` visible on `Explore` button `h-9` full width `flex-col` CTA, `h-10 w-10` toggles already | Yes, mobile stack, hero `py-16` |
| **768** | Header `768`, hero `704` (`1024` max), browse `704` | Same, `md:flex-row` nav, `md:grid-cols-2` browse, hero `md:py-20` | Yes |
| **1024** | Header `1024`, hero `960`, browse `960` | Same, `960` within `1024` viewport, gutters `32` each side | Yes |
| **1280** | Header `1152` `6xl`, hero `1024` `5xl`, browse `1152` `6xl` — hierarchy visible | Same, but `primary` indigo more distinctive at `1280` balanced (1152 with 64 gutters) | Yes, balanced |
| **1440** | `1152` vs `1024` | Same, gutters `144` | Yes |
| **1920** | `1152` vs `1024` | Same, not island, `lg:px-8` adds breathing | Yes, `1152` not `1024` reduces island by `128`, still not full-bleed, hero narrow |

**Proposed design system works across all:** `max-w-5xl` hero keeps `max-w-2xl` headline constrained at all, `max-w-6xl` content gives breathing at desktop, no `horizontal scroll` (`scrollWidth <= innerWidth` verified in verify-10), `line-length` `60–75ch` via `max-w-2xl`/`max-w-3xl` for browse if `1` profession case.

**Mobile-first:** `375` stack, `768` 2-col, `1024` 2-col, `1280` 2-col with wider gutters — no breakpoint jump.

---

## 17. Accessibility

Per `ui-ux-pro-max` priority 1 + 10 + `quick-reference.md`:

- **Contrast:** New `--foreground #0F172A` on `#fff` `15.8:1` (> `4.5:1`), `--muted #F1F5F9` on `foreground` `15:1`, `--primary #1E3A5F` on `white` `8.5:1` (> `4.5:1`), `text-muted-foreground #475569` on white `7.1:1` — all pass. Hero `text-muted-foreground` on `muted` background? Need check: `muted #F1F5F9` with `475569` `8.5:1` passes.
- **Focus:** `focus-visible:ring-1 ring-primary` on `Button`, `focus-visible:ring-2` on `Link`/`button` in `NavShell` — already `visible-focus` `2–4px`.
- **Keyboard:** `Tab` order via `Home → CA → toggle → NoticeFlow → ...`, `Escape` closes, `skip-links` could be added (not yet, recommend).
- **Touch:** `h-10 w-10` `40px` meets `24px` web + `44pt` iOS (09A fix).
- **Reduced-motion:** `@media (prefers-reduced-motion: reduce)` `animation none` `transition none` already for `mn-reveal`/`mn-section`/`mn-card`.
- **Icons:** All `→` `aria-hidden`, `aria-label` on toggles, `aria-expanded/controls`, `aria-current`.
- **Heading hierarchy:** `h1` `Small tools...` → `h2` `Browse` → `h3` `CA/Lawyers/NoticeFlow` → `h3` `Focused` etc. — sequential `h1→h2→h3` no skip, good.
- **Color not only:** Workflow `Receipt→Review` uses `→` plus pills `border`, not color alone.

---

## 18. Open-Source Research

**Use official shadcn, Tailark, ui-ux-pro-max, other genuinely open-source if useful. For each recommended pattern: SOURCE / LICENSE / EXACT PATTERN / WHY IT FITS / WHAT TO ADAPT / WHAT NOT TO COPY / DEPENDENCIES — do not recommend entire template.**

### Pattern 1: shadcn/ui `Button` + `Card` foundations

- **SOURCE:** `https://ui.shadcn.com` `shadcn/ui` (official)
- **LICENSE:** MIT `https://github.com/shadcn-ui/ui/blob/main/LICENSE.md`
- **EXACT PATTERN:** `Button` `cva` `variant default: bg-primary text-primary-foreground shadow hover:bg-primary/90` `outline: border border-input bg-background hover:bg-accent` + `Card` `rounded-lg border bg-card text-card-foreground shadow-sm`
- **WHY IT FITS:** MicroNest already uses `baseColor neutral` `cssVariables` `components.json:9`, `tailwindcss 4.1.8`, `geist` — extending `neutral` with one accent keeps `quiet authority`; `Button` hierarchy already `primary vs outline` matches 2. `Card` `bg-card` `border` `shadow-sm` subtle premium without glass.
- **WHAT TO ADAPT:** Change `--primary` from `#171717` to `#1E3A5F` (deep navy), `--muted` to `#F1F5F9`, `--border` to `#E2E8F0`, `--accent` to `EBEFF9`; keep `rounded-md` not `rounded-lg` for cards to avoid excessive rounding (current `md` is correct per `effects-match-style`).
- **WHAT NOT TO COPY:** Do not copy `shadcn` `Card` `shadow` as `shadow-lg`, do not add `glass` or `huge shadows`, keep `mn-card` `transition bg+border` not `shadow`.
- **DEPENDENCIES:** Already `shadcn` `tailwindcss`, `class-variance-authority`, no new.

### Pattern 2: Tailark Blocks Hero (already used) + Section dividers

- **SOURCE:** `https://github.com/tailark/blocks` `Tailark` (MIT, noted in `globals.css:28`)
- **LICENSE:** MIT `https://github.com/tailark/blocks/blob/main/LICENSE`
- **EXACT PATTERN:** Hero `relative overflow-hidden rounded-lg bg-muted/10 py-16 md:py-20` with `bg-grid` `linear-gradient 15% border` `40px` + `section` `space-y-4` `h2 text-2xl font-semibold` `border-t pt-6` Why + `footer border-t pt-8`
- **WHY IT FITS:** Already in codebase, editorial grid via `bg-grid`, not full-bleed, quiet. `Section` dividers `border-t` create rhythm without cards.
- **WHAT TO ADAPT:** Increase hero `bg-muted/10` → `bg-muted/40` for subtle surface, keep `bg-grid 15%→20%` slightly stronger, keep `max-w-5xl` hero vs `max-w-6xl` sections hierarchy (10 already does).
- **WHAT NOT TO COPY:** Do not copy Tailark's `exaggerated-minimalism` `clamp 3rem 12rem` or `bauhaus` hard shadows — would be flashy, not `quiet authority`.
- **DEPENDENCIES:** None (CSS only).

### Pattern 3: `ui-ux-pro-max` Skill Guidance — Editorial + Professional SaaS

- **SOURCE:** `C:\Users\91866\.agents\skills\ui-ux-pro-max` `SKILL.md` + `references/quick-reference.md` + `scripts/search.py` (`--domain color`, `--domain typography`, `--domain style`, `--domain ux`)
- **LICENSE:** Skill package `nextlevelbuilder/ui-ux-pro-max-skill` (installed global, 375K installs), MIT-like open-source skill, no runtime dep.
- **EXACT PATTERN:** `style` `editorial-grid-magazine` (active, `Magazine layout, asymmetric grid, editorial typography`) + `color` `Legal Services #1E3A8A + Gold #B45309` / `Resume #1E3A5F` + `typography` `Minimal Swiss Inter` + `ux` `Hover States hover:bg-gray-100` / `Touch Target 44pt` / `Container Width max-w-prose`
- **WHY IT FITS:** `Editorial Grid` matches MicroNest's `hero eyebrow → h1 → supporting → CTA → triad` editorial hierarchy, not dashboard. `Legal Services` navy `#1E3A8A` justifies deep navy accent for CA/litigators trust. `Minimal Swiss Inter` (single font `Inter`/`Geist` for dashboard) supports keeping `Geist` (already `Geist` is Inter-like neutral). `Hover States` + `Touch Target` justify `hover:bg-muted` `h-10 w-10`.
- **WHAT TO ADAPT:** Use `Geist` not `Inter` (keep), use `hover:bg-muted` not `hover:bg-gray-100`, use `max-w-6xl` not `max-w-prose` for cards grid (since cards not prose).
- **WHAT NOT TO COPY:** Do not copy `editorial-grid-magazine` `parallax images`, `drop caps`, `asymmetric grid` — too magazine, not SaaS. Do not copy `B2B Service` `gold` accent — too warm.
- **DEPENDENCIES:** None (skill is audit tool, not runtime).

**No entire template recommended** — only patterns above.

---

## 19. Exact Files To Change

**For next ONE controlled implementation pass (extend Tailwind/shadcn, not redesign):**

| File | Change (exact) | Reason |
|------|----------------|--------|
| `src/app/globals.css:3` | Replace `:root { --background #fff; --foreground #171717 }` with tokens from §4 (`--background #fff; --foreground #0F172A; --card #fff; --muted #F1F5F9; --border #E2E8F0; --primary #1E3A5F; --primary-foreground #fff; --accent #EBEFF9; --ring #1E3A5F; --destructive #DC2626;` + dark mode `--primary #3B82F6`), keep `@theme inline`, keep `bg-grid` but `15%→20%`, keep `mn-*` | Color system — one accent |
| `src/app/page.tsx:13` | Hero `bg-muted/10` → `bg-muted/40` (or `bg-card border`), keep `max-w-5xl` hero vs `max-w-6xl` others already | Hero surface differentiation |
| `src/app/page.tsx:41` | Browse `h2 text-2xl font-semibold` → add eyebrow `p text-xs tracking-[0.2em] uppercase text-muted-foreground` above `h2`? Optional, or keep `h2` but ensure `max-w-6xl` already | Section hierarchy editorial |
| `src/app/page.tsx:98` | Why `border-t pt-6` already `pt-8` after 10, keep, maybe add `h-px w-8 bg-primary/30` above `h2` for brand line | Brand accent line |
| `src/components/ui/button.tsx:10` | Keep `cva` but ensure `default` `bg-primary` now indigo (via CSS var, no code change needed), maybe add `font-semibold` to `default` for primary hierarchy | Button system — primary must LOOK primary via indigo vs outline |
| `src/components/ui/badge.tsx:9` | `default: bg-primary` now indigo — already, keep `Available` `bg-primary` vs `outline` — no change | Badge hierarchy |
| `src/components/marketing/profession-card.tsx:8` | Already `hover:bg-muted hover:border-foreground/30` — keep, maybe `hover:border-primary/20` indigo tint instead of `foreground/30` to tie accent | Card hover with accent tint |
| `src/components/marketing/tool-card.tsx:9` | Same | Same |
| `src/components/layout/nav-shell.tsx:46` | `max-w-6xl` already, keep `border-b bg-background`, maybe active `bg-primary` indigo vs `bg-foreground` black? Change `active` `bg-foreground` → `bg-primary` indigo for brand | Navigation active brand |
| `src/content/microtools.ts` | **DO NOT CHANGE** — content model | — |

**Do NOT change:** `src/modules/**`, `src/app/app/**`, `supabase/**`, `package.json`, `pnpm-lock.yaml`, `src/components/layout/site-nav.tsx` (hierarchy already), `src/components/marketing/reveal.tsx`, `src/app/profession/**`, `src/app/tools/**`, `src/app/sitemap.ts`.

**Count:** ~7 files + `globals.css` as above, all CSS var + class tweaks, no new components.

---

## 20. Implementation Sequence

**Sequence for next pass (single controlled pass, not multiple):**

1. **`src/app/globals.css` — Color tokens** (1 file, 10 tokens). Update `:root` to §4, keep `bg-grid` `15%→20%`, verify `dark` mode. No other file yet — check `pnpm build` passes.
2. **`src/components/ui/button.tsx` + `src/components/ui/badge.tsx` — Button/Badge hierarchy** (2 files, no logic, just ensure `bg-primary` now indigo via var). Add `font-semibold` to `buttonVariants default` if hierarchy still weak.
3. **`src/app/page.tsx` — Hero surface + section eyebrow + footer accent line** (1 file, `bg-muted/10→40`, optional `h-px w-8 bg-primary` above `h2`).
4. **`src/components/marketing/profession-card.tsx` + `src/components/marketing/tool-card.tsx` + `src/app/page.tsx` Featured — Card hover accent tint** (3 files, `hover:border-foreground/30` → `hover:border-primary/20` to tie accent, keep `hover:bg-muted`).
5. **`src/components/layout/nav-shell.tsx` — Navigation active accent** (1 file, `active bg-foreground` → `bg-primary` indigo, keep `hover:bg-accent EBFF9`).
6. **Verify:** `pnpm typecheck` `lint` `test` `build` `test:e2e` + browser `375/768/1024/1280/1440/1920` (same verify-10) + `prefers-reduced-motion`.
7. **Commit single:** `feat(marketing): apply premium design system accent and surfaces`.

**Do NOT interleave** MatterVault/NoticeFlow.

---

## 21. Before → After Design Intent

| Area | Before (`c72c924` + `10`) | After (proposed) | Intent |
|------|----------------------------|------------------|--------|
| **Overall** | Almost entirely black/white, flat, faible hierarchy | Near-monochrome + **one deep indigo accent** `1E3A5F`, quiet `muted` surfaces, editorial hierarchy | Premium professional SaaS, distinctive in screenshots |
| **Hero** | `bg-muted/10` faint, grid `40%`, CTA `bg-primary #171717` near-black, triad pills `bg-card` | `bg-muted/40` subtle surface, grid `20%`, CTA `bg-primary #1E3A5F` indigo solid `shadow-sm`, headline `foreground #0F172A` deeper | Hero feels premium, not just white, primary CTA pops vs secondary |
| **Browse** | White, `h2 2xl`, cards `bg-background` flat | White, `h2` + eyebrow `BROWSE` `tracking-[0.2em]`, cards `bg-card border #E2E8F0 hover:bg-muted hover:border-primary/20` | Hierarchy via eyebrow + card border stronger |
| **Featured** | White, cards `bg-background`, workflow `bg-muted/20` | White, workflow `bg-muted/30` slightly stronger, cards same hover indigo tint | Rhythm via `muted` strip |
| **Why** | `border-t pt-8` faint | `border-t` + `h-px w-8 bg-primary/30` accent line above `h2` | Brand line, editorial |
| **Footer** | `max-w-6xl` `gap-4/8`, almost white, `underline` links muted | Same layout (10 already), but `text-muted-foreground #475569` on `muted` vs white contrast already, links `hover:text-foreground` | No change needed after 10 |
| **Buttons** | Primary `bg-primary #171717` vs secondary `border` similar | Primary `bg-primary #1E3A5F` indigo vs secondary `border` white — **obvious hierarchy**: solid indigo vs outline | Primary *looks* primary |
| **Cards** | `hover:bg-muted hover:border-foreground/30` visible after 10 | Same but `hover:border-primary/20` indigo tint ties accent, `bg-muted #F1F5F9` distinct | Cards feel premium, not flat, hover visible |
| **Navigation** | `bg-foreground` black active, `hover:bg-accent` gray | `bg-primary indigo` active, `hover:bg-accent EBFF9` indigo tint | Navigation brand accent |
| **Responsive** | `375` stack, `1280` `1152` balanced, `1920` not island | Same `max-w` hierarchy, but with accent, `1920` gutters still `384` but screenshots now have indigo CTA/accents, distinctive | Works across all |

**No new visual language:** Keep `neutral`, `Geist`, `rounded-md`, `1px`, `150–200ms`, `OUTER BORDER MUST NEVER BE TRANSFORMED`.

---

## 22. Explicit Non-Goals

- **No logo project** — keep `MicroNest MicroTools` text brand, `h-2 w-2 bg-primary` dot sufficient.
- **No illustration system** — no icons unless genuinely useful (already no icons in nav, good).
- **No glass, huge shadows, glow, transform on bordered cards** — preserve 08 invariant.
- **No gradients, neon, excessive colors** — one accent `#1E3A5F` only, plus `muted/border/destructive`.
- **No Framer Motion, infinite animation, scroll gimmicks** — remain `150–250ms` `transform/opacity` only, `prefers-reduced-motion`.
- **No full redesign of content** — `Hero Browse Featured Why Footer` copy/content unchanged, only surface/color/hierarchy.
- **No new dependencies** — no `framer-motion`, no `gsap` (already 17 presets not used), no new component library, no `shadcn` template import.
- **No authenticated app changes** — `src/app/app/*`, `supabase`, `RCL/RPC`, `MatterVault`/`NoticeFlow` untouched.
- **No entire template** — do not recommend `acme/marketing` template, only patterns.
- **No dark mode redesign** — keep `prefers-color-scheme: dark` `0a0a0a` with `primary #3B82F6` light, not full dark system.
- **No adding many font sizes** — keep `Geist`, hierarchy via `tracking-tight`/`font-semibold`, not new scale.

---

## 23. Final Recommendation

**Proceed with ONE controlled implementation pass as in §20 (7 files, CSS vars + classes, no new components).**

**Prioritize:**

1. **Color system** (`globals.css` `--primary #1E3A5F` etc.) — highest impact for `primary` hierarchy and distinctive screenshots, low risk.
2. **Button hierarchy** (`button.tsx` `font-semibold` for `default`) — makes `Explore MicroTools` obviously primary.
3. **Hero surface** (`page.tsx` `bg-muted/40`) — subtle differentiation, not flat.
4. **Card hover accent tint** (`hover:border-primary/20` vs `foreground/30`) — ties accent to cards, visible at `375/1920`.
5. **Navigation active** (`nav-shell.tsx` `bg-primary`) — brand accent in nav.
6. Verify then commit `feat(marketing): apply premium design system accent and surfaces`.

**Why this works for MicroNest:** Deep navy-indigo `#1E3A5F` is **professional trust** for CA/litigators (statutory), not trendy, not neon, fits `quiet authority` vs black/white monochrome which cannot create hierarchy without shadow abuse. One accent keeps restraint, `muted #F1F5F9` + `border #E2E8F0` + `Geist` maintains `editorial modern` vs `exaggerated-minimalism` `clamp 12rem` or `bauhaus` hard shadows which would be flashy. All patterns are open-source MIT (shadcn, Tailark, skill guidance) and extend existing `neutral` foundation — no new deps, no illustration, no logo, `150–250ms` quiet motion.

**Risk low:** Only CSS vars + `hover` classes, no `transform` on bordered outer, no layout shift, `max-w` hierarchy already verified at `1920`.

**STOP after audit — await single implementation pass.**

