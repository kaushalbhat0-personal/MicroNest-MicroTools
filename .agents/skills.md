# MicroNest Skills Registry — UI/UX

> **Source of truth for OpenCode UI/UX work.** Every change that looks, feels, moves, or is interacted with must consult this skill before editing `src/app/*`, `src/components/marketing/*`, `src/app/globals.css`, or any marketing surface.

## 1. Actual Installed UI/UX Skill

| Field | Value |
|-------|-------|
| **Skill name** | `ui-ux-pro-max` |
| **Package** | `nextlevelbuilder/ui-ux-pro-max-skill` (installed 2026-09-29, global) |
| **Skill path (global)** | `C:\Users\91866\.agents\skills\ui-ux-pro-max` |
| **Entry file** | `C:\Users\91866\.agents\skills\ui-ux-pro-max\SKILL.md` |
| **Search script (actual)** | `C:\Users\91866\.agents\skills\ui-ux-pro-max\scripts\search.py` |
| **References** | `C:\Users\91866\.agents\skills\ui-ux-pro-max\references\quick-reference.md` (119 UX guidelines, 10 priority categories) and `references/pro-rules.md` (pre-delivery checklist) |
| **Data** | `data/` — 79 styles (50 active), 192 product palettes, 74 font pairings, 119 UX guidelines, 105 icons, 17 GSAP presets, 25 chart types, 22 stacks |
| **Description** | UI/UX design intelligence for web, mobile, and desktop. Use when designing, building, reviewing, or fixing interfaces — pages, components, design systems, accessibility, interaction, responsive layout, typography, color, charts, and stack-specific UI implementation. |
| **Also installed from same package (global, OpenCode scope)** | `banner-design`, `brand`, `design`, `design-system`, `slides`, `ui-styling` — all under `C:\Users\91866\.agents\skills\<name>` (see `ui-ux-pro-max` SKILL.md for delineation); `find-skills` (`C:\Users\91866\.agents\skills\find-skills\SKILL.md` from `vercel-labs/skills`) remains for discovery via `npx skills find` |

## 2. When to Use It (per SKILL.md)

**Apply when** the task involves UI structure, visual design decisions, interaction patterns, or UX quality control:

- designing new pages or refactoring UI components
- choosing color / typography / spacing / layout systems
- reviewing UI for UX / accessibility / consistency
- implementing navigation / animation / responsive behavior
- improving perceived quality and usability

**Skip for** pure backend logic, API/database design, non-visual perf, infra/DevOps, non-visual scripts — unless it changes how something looks/feels/moves/is interacted with.

For MicroNest **marketing surface** (`/`, `/profession/*`, `/tools/*`, `SiteNav`, hero, cards, `globals.css` motion) — **always apply**; this is Priority 1–7 work (Accessibility, Touch & Interaction, Performance, Style, Layout & Responsive, Typography & Color, Animation).

## 3. How OpenCode Must Invoke / Follow It

### 3.1 Locate (do not invent)
```powershell
npx skills list -g --json
# confirms ui-ux-pro-max at C:\Users\91866\.agents\skills\ui-ux-pro-max
Get-Content "C:\Users\91866\.agents\skills\ui-ux-pro-max\SKILL.md"
```

### 3.2 Read completely before any UI edit
- `SKILL.md` — priority table 1→10, workflow Steps 1–4, query contract
- `references/quick-reference.md` — full 119 guideline index (do not re-load every turn; read on demand per category)
- `references/pro-rules.md` — pre-delivery checklist (icon discipline, interaction feedback, light/dark contrast, safe areas, a11y) — read before delivering app UI

### 3.3 Workflow (SKILL.md Steps 1–4)
1. **Analyze requirements:** extract product type, audience/context, style keywords, stack. Detect stack from `package.json` (`next` 16.3.6, `react` 19.1.0, `tailwindcss` 4.1.8, `geist` 1.7.2) — never assume.
2. **Design system (new page/system):** `python "<skill>/scripts/search.py" "<query>" --design-system -p "<Project>"`
3. **Supplement with targeted searches (one intent, 2–5 terms, explicit --domain / --stack):**
   ```powershell
   python "C:\Users\91866\.agents\skills\ui-ux-pro-max\scripts\search.py" "<keyword>" --domain <domain> [-n <max>]
   python "C:\Users\91866\.agents\skills\ui-ux-pro-max\scripts\search.py" "<keyword>" --stack <stack>
   ```
   Domains: `product`, `style`, `color`, `typography`, `google-fonts`, `chart`, `ux`, `landing`, `icons`, `gsap`, `react`, `web`, etc. Stacks: `nextjs`, `react`, `html-tailwind`, `shadcn`, `vue`, etc.
   Use the smallest search mode that fits; verify domain/category/top result fit; retry once narrower if empty/off-topic; never persist unverified output.
4. **Implement per priority order** 1 Accessibility → 2 Touch & Interaction → 3 Performance → 4 Style → 5 Layout & Responsive → 6 Typography & Color → 7 Animation → 8 Forms → 9 Navigation → 10 Charts.

### 3.4 Contract before implementation
- One dominant intent per query, 2–5 meaningful terms + one constraint (product/platform/interaction).
- Verify returned domain/category/top result identity before applying.
- If no verified match after one retry, state no match and label fallback as fallback (do not fabricate).

### 3.5 Output formats
`--design-system` supports `-f ascii|markdown|--json`; domain searches support `--json`.

## 4. Mandatory Guardrails for MicroNest Marketing UI

### 4.1 Consult-skill-before-change
- Before editing `src/app/page.tsx`, `src/app/globals.css`, `src/components/marketing/reveal.tsx`, `src/components/marketing/profession-card.tsx`, `src/components/layout/nav-shell.tsx`, or any marketing route/component, OpenCode **must**:
  1. Read this `.agents/skills.md` and `C:\Users\91866\.agents\skills\ui-ux-pro-max\SKILL.md`
  2. Run at least one `search.py` query for the specific concern (e.g., `"border transform fractional" --domain ux`, `"layout shift avoid" --domain ux`, `"reduced motion" --domain ux`, `"stagger list" --domain gsap`)
  3. Record the domain/category/top result in the report (see `docs/micronest/marketing/MICRONEST-UIUX-08-REPORT.md` §1–2)

No UI edit without a logged skill query. If skill search returns 0, follow quick-reference priority table and mark output as fallback.

### 4.2 Visual browser verification is mandatory
- Every marketing UI change **must** be verified in a real browser (Playwright `chromium`, `pnpm test:e2e` webServer `next dev`) at **all** breakpoints `375 / 768 / 1024 / 1280 / 1440` (per `quick-reference.md` `breakpoint-consistency`).
- Check at least: normal static card without Reveal, card inside Reveal, card during animation, card after animation, card after scroll, card on hover — plus `prefers-reduced-motion: reduce`, hover, no `scrollWidth > innerWidth`, no layout shift.
- Capture evidence via diagnostic `e2e/*.spec.ts` or `page.evaluate` (`getComputedStyle`, `getBoundingClientRect`, `borderWidth/style/color`, `transform`, `opacity`) — not just screenshots. Screenshots alone are insufficient per UX skill Performance `CLS < 0.1` and `reduce-reflows`.
- `pnpm typecheck && pnpm lint && pnpm test && pnpm build && pnpm test:e2e` must all PASS before review; leave uncommitted on failure.

### 4.3 Design invariance
- Do not redesign palette, type, or hero content when fixing bugs — preserve `neutral` `Geist` `rounded-md border bg-card bg-muted/10 bg-grid` quiet-authority language (SKILL.md Style Selection `consistency`).
- Motion is secondary to correct rendering: never animate the element that owns the 1px border (`rounded-md border`) if that creates fractional compositing; animate inner content only (`opacity` + `translateY` inside a static outer).

## 5. Invocation Checklist (copy-paste for OpenCode turns)

```powershell
# 1. Confirm skill present
npx skills list -g --json
Get-Content "C:\Users\91866\.agents\skills\ui-ux-pro-max\SKILL.md" | Select-Object -First 40

# 2. Read quick-reference for the category
Get-Content "C:\Users\91866\.agents\skills\ui-ux-pro-max\references\quick-reference.md"

# 3. Targeted search (example for this 08 fix)
python "C:\Users\91866\.agents\skills\ui-ux-pro-max\scripts\search.py" "transform border fractional" --domain ux
python "C:\Users\91866\.agents\skills\ui-ux-pro-max\scripts\search.py" "layout shift avoid" --domain ux
python "C:\Users\91866\.agents\skills\ui-ux-pro-max\scripts\search.py" "scroll reveal stagger" --domain gsap
python "C:\Users\91866\.agents\skills\ui-ux-pro-max\scripts\search.py" "reduced motion" --domain ux

# 4. Verify in browser at all breakpoints
npx playwright test e2e/diag-verify.spec.ts --project=chromium
```

This file is the canonical skill pointer for this repo — keep it in sync with `npx skills list -g --json`. Do not invent skill names/paths.
