# Docs Index

> All project documentation lives under `docs/`. Root `README.md` is the only doc outside this folder.

## Structure

```
docs/
├── README.md                          # this index
├── architecture/
│   ├── ARCHITECTURE.md                # constitution — folder ownership, boundaries, naming
│   └── system-design.md               # Phase 0 stack & layout
├── mattervault/                       # Lawyer MicroTool — MatterVault (pilot)
│   ├── audits/
│   │   └── LAWYER_MICROTOOL_MATTERVAULT_V1_COMMERCIAL_READINESS_AUDIT.md
│   ├── implementation/
│   │   ├── LAWYER_MICROTOOL_MATTERVAULT_V1_REPORT.md
│   │   └── LAWYER_MICROTOOL_MATTERVAULT_V1_P1_POLISH_REPORT.md
│   └── security/
│       ├── LAWYER_MICROTOOL_MATTERVAULT_RLS_HARDENING_REPORT.md
│       ├── LAWYER_MICROTOOL_MATTERVAULT_STAGING_SECURITY_REPORT.md
│       └── LAWYER_MICROTOOL_MATTERVAULT_PRODUCTION_SECURITY_REPORT.md
└── micronest/                         # MicroNest platform
    ├── audits/
    │   ├── MICRONEST_COMPLETE_UIUX_AUDIT.md
    │   └── MICRONEST_PRODUCT_READINESS_AUDIT.md
    ├── marketing/
    │   ├── MICRONEST_MARKETING_DESIGN_AUDIT.md
    │   ├── MICRONEST_MARKETING_DESIGN_IMPLEMENTATION_REPORT.md
    │   └── MICRONEST_RESPONSIVE_LAYOUT_FIX_REPORT.md
    └── uiux/
        ├── MICRONEST_UIUX_PASS_01_REPORT.md
        ├── MICRONEST_UIUX_PASS_02_REPORT.md
        ├── MICRONEST_UIUX_PASS_03_REPORT.md
        └── MICRONEST_UIUX_PASS_03A_RESPONSIVE_VERIFICATION.md
```

## Conventions

- **Naming:** `PROJECT_TOPIC_TYPE.md` (e.g. `MICRONEST_UIUX_PASS_01_REPORT.md`).
- **Placement:**
  - `architecture/` — cross-cutting system rules (stable).
  - `mattervault/` / `micronest/` — project-scoped docs; sub-folders `audits/`, `implementation/`, `security/`, `uiux/`, `marketing/` by concern.
- **Root:** keep `README.md` at repository root for GitHub rendering; do not add reports to root.
- **New docs:** create under the closest project + concern folder; update this index.
