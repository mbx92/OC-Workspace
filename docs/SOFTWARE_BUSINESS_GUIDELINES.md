# Software Business OS Guidelines

## Purpose
This document defines how to build the software business operating system described in `SOFTWARE_BUSINESS_PRD.md`. It is intended to keep implementation focused, coherent, and maintainable.

## Product Direction
Build this as an internal operations product, not a public marketing app.

- Prioritize dense dashboards over decorative UI.
- Optimize for fast updates, filtering, and auditability.
- Treat projects as the root business object.
- Keep development tracking and business tracking connected through shared project records.
- Use DaisyUI as the default component language for all operator-facing pages.
- Keep visual language consistent across auth, dashboard, forms, tables, and management screens.
- Prefer reusable DaisyUI patterns such as `drawer`, `navbar`, `card`, `stats`, `table`, `alert`, and `fieldset` before introducing custom abstractions.

## Target Stack
- Framework: Nuxt 4
- Language: TypeScript
- ORM: Drizzle ORM
- Database: PostgreSQL
- Styling: Tailwind CSS + DaisyUI
- Component system: DaisyUI with minimal custom utility classes in `app/assets/css/main.css`
- Validation: Zod

## Architecture Principles
- Use server-first data access for sensitive business records.
- Keep business rules in server-side service or repository layers, not in page components.
- Prefer explicit domain modules over generic catch-all utilities.
- Design for auditability: important state changes should be traceable.
- Use soft delete for records with business or finance relevance.

## Suggested Project Structure
- `app/pages/` for route pages
- `app/components/` for reusable UI components
- `app/composables/` for client helpers and reusable state
- `app/layouts/` for shared shells such as dashboard and auth/default wrappers
- `server/api/` for HTTP handlers
- `server/db/` for Drizzle client, schema, and queries
- `server/services/` for business logic
- `server/utils/` for auth, permissions, formatting, and shared helpers
- `types/` for shared app types if needed

Example structure:

```text
app/
  layouts/
    default.vue
    dashboard.vue
  pages/
    login.vue
    dashboard.vue
    dashboard/
      index.vue
      projects/
      users/
  components/
    dashboard/
    forms/
server/
  api/
    auth/
    projects/
    users/
  db/
    client.ts
    schema/
  services/
    projects/
    users/
```

## Current Product Scope
The current implemented product scope is intentionally narrower than the long-term platform vision.

- Authentication and bootstrap owner flow
- Dashboard overview
- Project management
- User and role management
- Activity-aware server-side service layer

Future domains such as development tracking, finance, legal, integrations, and reporting should follow the same architecture and design rules introduced in the current scope.

## UI System Rules
- All new pages should be composed with DaisyUI primitives first.
- Use `data-theme="ocs"` for authenticated and public surfaces that belong to the product.
- Keep custom classes semantic and low in number; prefer helper classes like `ocs-panel`, `ocs-field`, `ocs-select`, and `ocs-textarea` only when repetition becomes meaningful.
- Favor card-based panels with visible hierarchy over flat containers.
- Use top-level page sections in this order when relevant: breadcrumb, kicker, heading, summary copy, stats/actions, main work area.
- Tables should default to responsive wrappers and compact action placement.
- Forms should use `fieldset` + `legend` for consistent operator-focused data entry.
- Alerts should be explicit and near the action area they relate to.
- The desktop experience is primary, but mobile navigation must remain usable through a drawer or stacked layout.

## Domain Boundaries
### Projects
- Every main record should connect to a project where applicable.
- Avoid creating parallel structures that duplicate project ownership.

### Development
- `features`, `bugs`, and `tasks` are separate entities with explicit relationships.
- Do not overload one generic work-items table unless there is a strong technical reason.
- Keep workflow states distinct because reporting for bugs, features, and tasks is different.

### Finance
- Separate budget planning from actual expense entries.
- Store amounts as integers in the smallest currency unit when possible.
- Keep financial edits auditable.

### Team
- Team member profile data should be separate from auth credentials when possible.
- Project assignment should be modeled through a join table.

### Commission
- Model commission rules separately from commission transactions.
- Store the calculation basis used at payout time so historical records stay stable.

### Legal Documents
- Keep document templates separate from generated document records.
- Treat generated output and rendered content as versions, not inline mutable blobs.
- Do not mix quotation, proposal, and agreement templates into one untyped document model without a document type field.
- Approval and send states must be server-controlled because they affect auditability.

### Licenses And Credentials
- Track licenses, credentials, and certificates per project rather than as a global flat list.
- Store references and renewal metadata in app records; keep actual secrets in secure storage.
- Treat token rotation and expiration as audit-relevant operational events.

### External Integrations
- Keep integration connection configuration separate from synced record storage.
- Treat external bugs and tasks as source-backed records with stable source IDs.
- Prefer read-only synchronization in early phases.
- Do not connect directly to another project's SQLite file from the app runtime; use an API or connector boundary.

## Recommended Tables
- `users`
- `sessions`
- `roles`
- `projects`
- `project_members`
- `features`
- `bugs`
- `tasks`
- `project_licenses`
- `budget_plans`
- `budget_entries`
- `commission_rules`
- `commissions`
- `legal_document_templates`
- `legal_documents`
- `legal_document_versions`
- `integration_connections`
- `integration_field_mappings`
- `integration_sync_jobs`
- `external_records`
- `activity_logs`

## Example Schema Guidance
### `projects`
- `id`
- `code`
- `name`
- `client_name`
- `status`
- `start_date`
- `deadline`
- `notes`
- `created_at`
- `updated_at`
- `archived_at`

### `features`
- `id`
- `project_id`
- `title`
- `description`
- `priority`
- `status`
- `business_value`
- `target_release`
- `owner_id`
- `created_at`
- `updated_at`

### `bugs`
- `id`
- `project_id`
- `feature_id`
- `title`
- `description`
- `severity`
- `priority`
- `status`
- `assignee_id`
- `reported_by_id`
- `due_date`
- `created_at`
- `updated_at`

### `tasks`
- `id`
- `project_id`
- `feature_id`
- `bug_id`
- `title`
- `description`
- `status`
- `priority`
- `assignee_id`
- `estimate_hours`
- `due_date`
- `created_at`
- `updated_at`

### `budget_plans`
- `id`
- `project_id`
- `planned_amount`
- `currency`
- `notes`
- `created_at`
- `updated_at`

### `budget_entries`
- `id`
- `project_id`
- `type`
- `category`
- `amount`
- `currency`
- `entry_date`
- `description`
- `created_by_id`
- `created_at`

### `commissions`
- `id`
- `project_id`
- `recipient_user_id`
- `rule_id`
- `source_type`
- `source_reference`
- `calculation_type`
- `rate_or_amount`
- `base_amount`
- `commission_amount`
- `status`
- `approved_by_id`
- `approved_at`
- `paid_at`
- `notes`
- `created_at`

### `legal_document_templates`
- `id`
- `name`
- `document_type`
- `template_format`
- `version`
- `is_active`
- `content_json`
- `created_by_id`
- `created_at`
- `updated_at`

### `legal_documents`
- `id`
- `project_id`
- `template_id`
- `document_type`
- `title`
- `status`
- `client_name`
- `currency`
- `owner_id`
- `approved_by_id`
- `approved_at`
- `sent_at`
- `signed_at`
- `created_at`
- `updated_at`

### `legal_document_versions`
- `id`
- `document_id`
- `version_number`
- `payload_json`
- `rendered_html`
- `pdf_file_path`
- `docx_file_path`
- `created_by_id`
- `created_at`

### `integration_connections`
- `id`
- `project_id`
- `name`
- `provider_type`
- `base_url`
- `auth_type`
- `encrypted_credentials`
- `status`
- `last_synced_at`
- `created_by_id`
- `created_at`
- `updated_at`

### `integration_sync_jobs`
- `id`
- `connection_id`
- `job_type`
- `status`
- `started_at`
- `finished_at`
- `records_created`
- `records_updated`
- `error_message`
- `triggered_by_id`
- `created_at`

### `external_records`
- `id`
- `connection_id`
- `project_id`
- `source_entity_type`
- `source_id`
- `source_status`
- `source_payload_json`
- `mapped_entity_type`
- `mapped_entity_id`
- `last_seen_at`
- `created_at`
- `updated_at`

## Status And Enum Rules
Keep enums explicit and stable.

- Project status: `planning`, `active`, `on-hold`, `completed`, `cancelled`
- Feature status: `backlog`, `planned`, `in-progress`, `blocked`, `done`, `cancelled`
- Bug status: `open`, `in-progress`, `resolved`, `verified`, `closed`
- Task status: `todo`, `in-progress`, `blocked`, `review`, `done`
- Commission status: `draft`, `approved`, `paid`, `cancelled`
- Legal document type: `quotation`, `proposal`, `agreement`
- Legal document status: `draft`, `in-review`, `approved`, `sent`, `signed`, `archived`
- Budget entry type: `planned`, `expense`, `adjustment`
- Integration connection status: `active`, `paused`, `error`, `archived`
- Integration sync status: `queued`, `running`, `succeeded`, `partial`, `failed`

If a new enum is added, update:

- Drizzle schema
- Zod validation
- API handlers
- UI filters and badges
- Reporting logic

## API Design Guidelines
- Organize endpoints by domain.
- Keep CRUD endpoints predictable.
- Use server validation for every write operation.
- Return only the data the UI needs.
- Centralize calculation logic for budgets and commissions.

Suggested endpoint families:

- `/api/auth/*`
- `/api/projects/*`
- `/api/features/*`
- `/api/bugs/*`
- `/api/tasks/*`
- `/api/budgets/*`
- `/api/commissions/*`
- `/api/legal/templates/*`
- `/api/legal/documents/*`
- `/api/integrations/*`
- `/api/team/*`
- `/api/reports/*`

Integration endpoint guidance:

- Use internal endpoints to manage connections, field mappings, sync jobs, and sync history.
- Run external API access from server handlers or background jobs only.
- Normalize third-party responses before writing to domain tables.
- Keep provider-specific code in `server/services/integrations/providers/`.

## Validation Rules
- Use Zod schemas for request payloads.
- Validate enum membership server-side.
- Prevent invalid state transitions.
- Reject negative expense and commission amounts unless explicitly supported by adjustment rules.
- Require project linkage for all project-scoped records.
- Require approved document versions before `sent` or `signed` transitions.
- Require source ID and connection ID for any externally synced record.
- Reject integration write-back unless the connection explicitly supports it.

## Access Control Guidelines
- `owner` or `admin` can access all modules.
- `project_manager` can manage delivery and budget records but may have limited user management.
- `finance` can manage budget and commission modules.
- `developer`, `designer`, and `qa` can update assigned development records but not finance settings by default.

Permission checks should be enforced on the server, not only in the UI.

## UI Guidelines
- Use shadcn UI primitives for dialogs, tables, tabs, forms, drawers, dropdown menus, and alerts.
- Use Tailwind utility classes with a restrained dashboard style.
- Favor:
  - sticky filters
  - compact tables
  - badge-based statuses
  - slide-over or modal forms for quick edits
  - detail panels for project context
- Avoid:
  - overly spacious marketing layouts
  - long multi-step forms unless necessary
  - hiding important operational data behind too many clicks

Legal workspace UI guidance:

- Use template picker plus structured form fields before opening full document preview.
- Keep preview and metadata side-by-side on desktop when possible.
- Show version history and export actions near the document header.

Integration UI guidance:

- Show connection health, last sync, and error state at the top of the page.
- Separate connection setup from field mapping and sync history.
- Display imported external records as read-only unless write-back is enabled.

## Dashboard Guidelines
The dashboard should answer these questions immediately:

- Which projects need attention?
- Which bugs and tasks are blocked or overdue?
- Which project is over budget?
- Which commissions are waiting for approval or payout?
- Which team members are overloaded?

Recommended dashboard sections:

- Top summary cards
- Delivery health table
- Budget health table
- Commission queue
- Legal document queue
- Integration sync alerts
- Team workload snapshot

## Development Workspace Guidelines
This area should take direct inspiration from the existing "development tab" pattern:

- Use tabs for `Bugs`, `Features`, `Tasks`, and optionally `QA`.
- Add quick-create actions near the table header.
- Allow inline status updates for common actions.
- Provide filters for project, assignee, priority, and status.
- Show counts for open bugs, active features, and overdue tasks.
- Support creating a task from a bug or feature without retyping shared context.

## Finance Guidelines
- Show planned budget, actual expense, remaining budget, and variance in one place.
- Record every expense entry with category, amount, date, and creator.
- Do not let commission logic read from hand-entered summary text; it should rely on structured fields.

## Commission Guidelines
- Keep commission calculation transparent.
- Save the exact formula inputs used to compute the amount.
- Allow approval before payout.
- Treat commission changes as high-audit events and log them.

## Legal Document Guidelines
- Store document template structure and final rendered version separately.
- Generate PDFs from a server-side renderer to keep output consistent.
- If `docx` export is supported, treat it as an export target, not the source of truth.
- Log approval, export, send, and sign events.
- Never overwrite a sent document version; create a new version.

## Integration Guidelines
- Start with pull-based sync, not event-driven bi-directional sync.
- Normalize external bug and task data into a stable internal shape before displaying it.
- Keep raw payload snapshots for debugging.
- Add idempotency checks so re-running sync does not duplicate records.
- Expose sync results and failures clearly to admins.

## Activity Log Guidelines
Log at least these actions:

- record created
- record updated
- assignee changed
- status changed
- budget changed
- commission approved
- commission paid
- legal document approved
- legal document exported
- integration sync started
- integration sync failed
- project archived

Recommended fields:

- `id`
- `actor_user_id`
- `entity_type`
- `entity_id`
- `action`
- `before_json`
- `after_json`
- `created_at`

## Reporting Guidelines
- Build list and summary reporting first.
- Do not start with complex charting.
- Ensure every major table can be filtered by project and date range.
- Make exports easy for budget and commission reviews.

## Performance Guidelines
- Use paginated queries for large tables.
- Index foreign keys and commonly filtered columns.
- Add indexes for:
  - `project_id`
  - `status`
  - `assignee_id`
  - `created_at`
  - `entry_date`
  - `recipient_user_id`
  - `document_type`
  - `connection_id`
  - `source_id`
- Precompute heavy financial summaries only if query cost becomes visible.

## Testing Guidelines
- Test business rules before visual polish.
- Add backend tests for:
  - commission calculation
  - budget variance calculation
  - permission checks
  - state transitions
  - legal document approval and export rules
  - integration sync idempotency and mapping
- Add frontend tests for:
  - filters
  - table actions
  - form validation
  - role-based visibility
  - document preview and export actions
  - integration sync status displays

## Delivery Priorities
### Phase 1
- Auth
- Projects
- Bugs, features, tasks
- Team assignment

### Phase 2
- Budget plans and expenses
- Commission records and approval flow
- Activity logs
- Legal templates and legal document generation

### Phase 3
- Reports
- Notifications
- Attachments
- External integrations
- PDF and document viewer improvements

## Anti-Patterns To Avoid
- Mixing budget summaries and raw expense records in one ambiguous table
- Treating bugs, features, and tasks as identical when workflows differ
- Hiding business rules inside page components
- Relying on client-side permission checks only
- Using free-text fields where structured finance data is required
- Turning the first version into a full ERP

## Documentation Rules
- Keep PRD and guidelines aligned with implemented scope.
- Document what exists versus what is planned.
- Update enum, route, and data model docs whenever business rules change.
