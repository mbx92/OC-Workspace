# Software Business OS Implementation Plan

## 1. Purpose
This document converts the PRD into an execution plan. It defines implementation phases, workstreams, priorities, and delivery rules for building Software Business OS in a controlled way.

Use this document together with:

- `docs/SOFTWARE_BUSINESS_PRD.md`
- `docs/SOFTWARE_BUSINESS_GUIDELINES.md`

## 2. Delivery Principles
- Build the operational core first before advanced reporting or automation.
- Deliver vertical slices that include schema, API, UI, validation, and audit logging.
- Keep each phase shippable on its own.
- Prefer read-only integrations before any cross-system write-back.
- Treat legal documents and finance workflows as audit-sensitive domains.
- Standardize the UI layer on DaisyUI so each new domain inherits a proven page, form, and navigation pattern.

## 3. Target MVP
The MVP should let an internal software business:

- manage projects
- manage team assignments
- manage workspace users and roles
- see an executive dashboard overview

The current codebase baseline already covers:

- authentication and owner bootstrap
- dashboard overview shell
- project CRUD-lite flows (create, list, archive)
- user administration flows

The next delivery phases expand this baseline into development, finance, legal, integrations, and reporting.

## 4. Workstreams
### 4.1 Platform Foundation
- Nuxt 4 app setup
- authentication and session handling
- role-based authorization
- base layout and dashboard shell
- database connection, migrations, and seed strategy
- DaisyUI-based shared form, table, stat, alert, and navigation patterns

### 4.2 Core Delivery Domain
- projects
- features
- bugs
- tasks
- licenses and credentials
- legal workspace access from the project detail page
- activity logs
- filtering, sorting, and saved views if time allows

### 4.3 Finance Domain
- budget plans
- budget entries
- commission rules
- commissions
- finance summary reporting

### 4.4 Legal Domain
- legal document templates
- legal document generation
- version history
- internal document preview
- `pdf` export
- optional `docx` export

### 4.5 Integration Domain
- integration connection management
- provider authentication config
- sync jobs
- API docs reference ingestion
- external bug/task ingestion
- mapping and sync health UI

## 5. Phase Plan
### Phase 0: Foundation And Architecture
Goal: establish technical foundations and implementation conventions.

Scope:
- initialize Nuxt 4, Tailwind, DaisyUI, Drizzle, Zod, and auth stack
- set up project structure from guidelines
- implement base user, role, and session schema
- implement shared layout, navigation, table, form, badge, and filter components
- create activity log base service and audit helper
- create environment config strategy and secrets handling rules

Acceptance criteria:
- users can sign in
- role checks work server-side
- migrations run cleanly
- dashboard shell and route protection are in place
- audit helper is available to all domain services

Current status:
- Completed
- Includes login/bootstrap page, dashboard layout, projects page, and users page in DaisyUI

### Phase 1: Projects And Development Workspace
Goal: ship the operational core used daily by the team.

Scope:
- projects CRUD
- project members CRUD
- features CRUD
- bugs CRUD
- tasks CRUD
- licenses register per project
- legal workspace route per project
- project detail page
- development workspace with tabs or linked views for bugs, features, tasks, licenses, and legal workspace
- filters for project, assignee, status, priority, due date
- activity logging for create, update, assign, and status changes

Acceptance criteria:
- admin and project manager can create and manage project records
- users can create and update bugs, features, and tasks
- all development records are linked to projects
- relationships between bug, feature, and task are enforced
- dashboard shows open bug, active feature, and overdue task counts

Current status:
- In progress only for project operations
- Multi-project mockup routes exist for project overview, legal workspace, and licenses

### Phase 2: Finance And Team Operations
Goal: add financial visibility and ownership management.

Scope:
- budget plan CRUD
- budget entry CRUD
- commission rule CRUD
- commission CRUD with approval flow
- team management views
- budget summaries and variance calculations
- finance dashboard cards and lists

Acceptance criteria:
- planned versus actual budget is visible per project
- commission calculation is reproducible from stored inputs
- commission cannot be paid before approval
- finance users can access finance modules without full admin access

### Phase 3: Legal Workspace
Goal: generate formal project documents inside the system.

Scope:
- legal template CRUD
- document type support for `quotation`, `proposal`, `agreement`
- template placeholder engine for project, client, scope, pricing, and terms
- generated document record and versioning
- legal document detail page with preview
- PDF generation pipeline
- optional DOCX export path
- approval and send status workflow
- activity logs for approve, export, send

Acceptance criteria:
- user can create a quotation, proposal, or agreement from a template
- user can preview a generated document before export
- user can export PDF successfully
- document versions are preserved
- sent and signed states require an approved document version

### Phase 4: External Integrations
Goal: consolidate selected data from other projects and systems.

Scope:
- integration connection CRUD
- provider configuration UI
- encrypted credential storage
- sync job runner
- API docs reference ingestion
- external bug/task ingestion via API connectors
- field mapping for status and priority normalization
- sync result logs and failure display
- read-only external record display in project views

Acceptance criteria:
- admin can configure at least one external connection
- manual sync can fetch external bugs and tasks
- imported records preserve source IDs and timestamps
- sync can fail safely without partial corruption
- sync history and errors are visible in the UI

### Phase 5: Reporting, Hardening, And Release Readiness
Goal: prepare the product for stable internal adoption.

Scope:
- cross-module reporting pages
- legal status reporting
- integration health reporting
- pagination, indexing, and query tuning
- automated tests for core business rules
- role review and permission audit
- data seed/demo setup
- release checklist and rollback notes

Acceptance criteria:
- reporting covers delivery, finance, legal, and integration health
- critical business rules have automated tests
- large tables are paginated and indexed
- internal release checklist is complete

## 6. Backlog By Domain
### Projects
- project create, edit, archive, list
- project members and ownership
- client metadata on project

### Development
- feature create/edit/status flow
- bug create/edit/status flow
- task create/edit/status flow
- quick-create from related records

### Finance
- budget plan setup
- budget entries and variance
- commission rules
- commission approvals and payout state

### Legal
- template library
- template variables
- versioned generated documents
- PDF rendering
- DOCX export adapter
- document viewer

### Integrations
- connection setup
- auth credentials
- sync jobs
- external bug/task mapping
- API docs references
- sync monitoring

## 7. Technical Guidelines For Implementation
### Backend
- Keep domain logic in `server/services/`.
- Keep DB schema per domain in `server/db/schema/`.
- Use Zod validation at every write boundary.
- Add audit logging inside services, not inside page handlers.
- Put provider-specific integration code in `server/services/integrations/providers/`.

### Frontend
- Use dense dashboard layouts.
- Use reusable DaisyUI table and filter primitives per domain.
- Prefer slide-over or modal forms for quick CRUD.
- Keep route-level pages thin and compose domain components.
- Keep all new pages visually aligned with the `ocs` DaisyUI theme.
- Reuse shared helper classes only where DaisyUI primitives alone would cause duplication.

### Data
- Use explicit enums.
- Use integer money values in smallest currency units.
- Use soft delete for finance and legal records where removal would harm auditability.
- Preserve raw external payload snapshots for sync debugging.

## 8. Suggested Folder Expansion
```text
app/
  pages/
    dashboard/
      index.vue
      projects/
      development/
      finance/
      legal/
      integrations/
      reports/
  components/
    dashboard/
    development/
    finance/
    legal/
    integrations/
server/
  api/
    projects/
    features/
    bugs/
    tasks/
    budgets/
    commissions/
    legal/
    integrations/
    reports/
  db/
    schema/
      core/
      development/
      finance/
      legal/
      integrations/
  services/
    projects/
    development/
    finance/
    legal/
    integrations/
      providers/
```

## 9. Testing Plan
### Backend tests
- permission checks
- project lifecycle rules
- development state transitions
- budget variance calculation
- commission approval rules
- legal document approval and export rules
- integration sync mapping and idempotency

### Frontend tests
- table filters and sorting
- role-based navigation visibility
- development quick-create flows
- finance form validation
- legal document preview and export actions
- integration sync status and error states

## 10. Risks And Mitigations
- Risk: scope expands into ERP territory.
  Mitigation: keep phases strict and defer non-core modules.
- Risk: legal documents become hard to maintain.
  Mitigation: use typed templates, versioning, and controlled placeholders.
- Risk: external integrations become fragile.
  Mitigation: normalize data, preserve raw payloads, and keep sync read-only first.
- Risk: audit gaps in finance and legal flows.
  Mitigation: require service-level activity logging and state transition validation.

## 11. Recommended Build Order
1. foundation and auth
2. dashboard overview, projects, and users
3. development workspace
4. team and finance
5. legal workspace
6. external integrations
7. reporting and hardening

## 12. Definition Of Done
A feature is done only when:

- schema and migrations are added
- server validation is added
- permissions are enforced
- UI flows are implemented
- activity logging is added where required
- happy path is manually verified
- automated tests cover critical rules
- docs are updated if scope or enums changed
