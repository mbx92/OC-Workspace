# Copilot Instructions

## Product Context
- This repository is an internal operations system for a software business.
- Current implemented scope covers authentication, owner bootstrap, dashboard overview, project management, and user administration.
- Future work should extend the same platform toward development tracking, finance, legal, integrations, and reporting.

## Stack
- Nuxt 4 with Vue 3 and TypeScript
- Server routes under `server/api`
- Business logic in `server/services`
- Drizzle ORM with PostgreSQL
- Tailwind CSS with DaisyUI
- Zod for write validation

## Architecture Rules
- Keep page components focused on presentation and request orchestration.
- Put business rules in `server/services`, not in Vue pages.
- Reuse existing server validation and permission patterns before introducing new abstractions.
- Treat projects as the main business object and link new operational records to a project unless there is a clear reason not to.
- Preserve auditability. Important writes should remain traceable through service-layer activity logging patterns.

## UI Rules
- Use DaisyUI as the default component system.
- Keep the app on the existing `ocs` theme and neutral shadcn-like palette.
- Prefer DaisyUI primitives such as `drawer`, `navbar`, `menu`, `card`, `stats`, `table`, `badge`, `alert`, `fieldset`, `input`, `select`, `textarea`, and `button`.
- Use the helper classes in `app/assets/css/main.css` only when they remove meaningful repetition: `ocs-panel`, `ocs-glass`, `ocs-kicker`, `ocs-heading`, `ocs-subtle`, `ocs-field`, `ocs-select`, `ocs-textarea`, `ocs-shell-gap`.
- For route pages, prefer this structure when relevant: breadcrumb, kicker, title, summary text, stats/actions, main work area.
- Desktop is the primary target, but drawer navigation and forms must stay usable on mobile.
- Avoid reintroducing shadcn-vue, Reka UI, or custom component systems unless explicitly requested.

## Page Design Rules
- Build pages as dense internal tools, not marketing pages.
- Favor strong information hierarchy and operational clarity over decorative effects.
- Tables should sit inside responsive wrappers.
- Forms should use `fieldset` plus `legend` for consistency.
- Place feedback near the triggering action using DaisyUI alerts.
- Keep actions explicit: create, archive, activate, deactivate, reset, refresh.

## Data And Validation Rules
- Keep enums explicit and stable.
- Normalize nullable form fields before sending them to the API.
- Keep money values in smallest currency units if finance modules are added.
- Prefer soft delete or archive flows for audit-sensitive records.

## Implementation Preferences
- Before changing docs, keep `docs/SOFTWARE_BUSINESS_GUIDELINES.md`, `docs/SOFTWARE_BUSINESS_PRD.md`, and `docs/SOFTWARE_BUSINESS_IMPLEMENTATION_PLAN.md` consistent with the actual codebase.
- When adding a new module, update navigation, route structure, and documentation together.
- When replacing UI patterns, remove dead files and dependencies from the previous approach.
- Validate with `npm run build` after meaningful UI or route refactors.
