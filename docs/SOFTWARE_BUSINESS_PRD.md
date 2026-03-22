# Software Business OS PRD

## 1. Product Summary
Software Business OS is an internal operations system for a software agency or software studio. The product centralizes development tracking and business records in one place so the owner and team can manage bugs, features, tasks, budgets, team members, and commissions without relying on scattered spreadsheets, chat messages, and manual notes.

The product should feel like an expanded internal "development tab" that combines delivery tracking with finance and team operations.

The currently implemented release focuses on the operational foundation: authentication, executive overview, project management, and user administration inside a unified DaisyUI-based interface. Additional business domains remain part of the roadmap and should extend the same operating model.

## 2. Problem Statement
Most small software businesses track delivery and business operations in separate tools:

- Bugs, features, and tasks live in chat, Trello, Notion, or ad hoc spreadsheets.
- Budget planning and actual expenses are difficult to compare per project.
- Team assignments and contribution history are not visible in one system.
- Commission calculations for sales, referrals, or delivery contributors are often manual.
- Quotations, proposals, and agreements are often created manually in separate document tools with no connection to project records.
- Delivery data from other projects or legacy systems is difficult to reuse when bugs and tasks are stored in SQLite files or exposed only through custom APIs.
- Owners cannot quickly answer basic questions such as:
  - What bugs are still open?
  - Which features are blocked?
  - Which project is over budget?
  - Who is responsible for a task?
  - How much commission is owed this month?
  - Which legal document version was sent to the client?
  - Which software licenses or credentials are active for a project?
  - What delivery issues exist across external or legacy projects?

## 3. Product Goals
- Provide one internal dashboard for software business operations.
- Track software delivery work across bugs, features, and tasks.
- Track project budgets, spending, and financial health.
- Track team members, roles, assignments, and workload.
- Track project software licenses, credentials, and renewal risk.
- Track commissions with clear formulas and payout status.
- Generate and manage reusable legal and commercial documents per project.
- Consolidate selected delivery data from external systems through API integrations.
- Give the owner a reliable operational view across all active projects.
- Establish a coherent UI system using DaisyUI so all operational pages are fast to extend and consistent to use.

## 4. Non-Goals
- Full accounting replacement
- Payroll system replacement
- Git hosting replacement
- Advanced project estimation using AI
- External client portal in the first release
- Full CRM with sales pipeline automation in the first release
- Full contract lifecycle management with negotiation redlines and e-signature in the first release
- General-purpose ETL platform for every third-party system

## 5. Primary Users
### Owner / Admin
- Creates projects
- Reviews delivery progress
- Monitors budget usage
- Reviews commission and payout records
- Reviews quotations, proposals, and agreements before sending
- Monitors external integration health
- Manages team access

### Project Manager / Operations
- Creates and updates features, bugs, and tasks
- Assigns team members
- Updates budgets and expense records
- Creates quotations, proposals, and agreement drafts from templates
- Imports project delivery data from external systems when needed
- Monitors delivery status and blockers

### Developer / Designer / QA
- Views assigned work
- Updates task and bug status
- Adds notes, blockers, and completion updates
- Logs work evidence when needed

### Finance / Business Ops
- Records project budgets
- Adds expenses and other financial entries
- Reviews commission eligibility and payout status
- Prepares commercial documents such as quotations and proposals

## 6. Core Modules
### 6.1 Dashboard
- Show high-level summary for active projects
- Show open bugs, in-progress features, overdue tasks, budget alerts, unpaid commissions, and pending legal documents
- Show quick filters by project, team member, and date range

Current release scope:
- Executive portfolio overview
- API health signal
- Recent projects list
- Team access summary

### 6.2 Projects
- Create and manage software projects
- Store project code, client name, status, start date, deadline, and notes
- Link all records to a project when applicable

Current release scope:
- Project create, list, and archive flows
- Delivery-oriented status and deadline tracking
- Multi-project workspace mockups for delivery, licenses, and legal operations

### 6.3 Development Workspace
This is the core area inspired by the current project's development tab.

- Separate tabs or views for:
  - Bugs
  - Features
  - Tasks
  - Optional QA / release checklist
- Support priority, status, assignee, due date, labels, and notes
- Support cross-linking:
  - A bug can belong to a feature
  - A task can belong to a feature
  - Multiple tasks can resolve one bug or deliver one feature

### 6.4 Budget Tracking
- Define planned budget per project
- Record actual expenses
- Categorize expenses such as development, design, infrastructure, tools, marketing, and operations
- Compare planned budget versus actual spending
- Show warning when spending exceeds threshold

### 6.5 Team Management
- Maintain internal team records
- Store role, skill set, join date, status, and default commission eligibility
- Track project assignments and ownership

Current release scope:
- User creation
- Role assignment
- Account activation and password reset

### 6.6 Commission Tracking
- Record commission rules by project, role, referral, or contribution type
- Support fixed amount and percentage commission
- Track commission source, amount, status, and payout date
- Support approval flow before payout

### 6.7 Legal Workspace
- Create legal and commercial documents tied to a project
- Support document types such as quotation, proposal, and agreement
- Use reusable templates with placeholders for client, project, pricing, scope, dates, and terms
- Generate output for PDF export and document viewer rendering
- Keep document version history, status, owner, and approval notes

### 6.8 Licenses And Credentials
- Track software subscriptions, API keys, SSL certificates, and third-party access records per project
- Store renewal dates, ownership, vendor references, and status signals
- Surface renewal and rotation risks inside the project workspace and portfolio dashboard

### 6.9 External Integrations
- Connect to external project systems through API calls
- Import or sync API documentation metadata for linked projects
- Pull bug and task data from SQLite-backed systems through integration endpoints
- Map external records into internal project views without losing source references
- Track sync status, last run time, errors, and manual re-sync actions

### 6.10 Activity Log
- Record important actions for auditability
- Example: bug created, task reassigned, budget updated, commission approved, proposal exported, integration sync failed

## 7. Functional Requirements
### 7.1 Authentication And Access
- Users must log in to access the system.
- The system must support role-based access control.
- Owner / Admin must have access to all modules.
- Operational roles must only access the modules they need.
- The system must support first-owner bootstrap before normal sign-in becomes the default access path.

### 7.2 Project Records
- The system must allow creation, editing, archiving, and listing of projects.
- Each bug, feature, task, budget entry, assignment, and commission record should be attachable to a project.
- Projects must support statuses such as `planning`, `active`, `on-hold`, `completed`, and `cancelled`.

### 7.3 Bug Management
- Users must be able to create bug records with title, severity, priority, status, assignee, and reproduction notes.
- Bugs must support statuses such as `open`, `in-progress`, `resolved`, `verified`, and `closed`.
- Bugs should support optional links to feature, release, and related tasks.

### 7.4 Feature Management
- Users must be able to create feature records with scope, priority, business value, and target release.
- Features must support statuses such as `backlog`, `planned`, `in-progress`, `blocked`, `done`, and `cancelled`.
- Features should allow child tasks.

### 7.5 Task Management
- Users must be able to create execution tasks that belong to a project and optionally to a feature or bug.
- Tasks must support statuses such as `todo`, `in-progress`, `blocked`, `review`, and `done`.
- Tasks must support due date, assignee, and estimate fields.

### 7.6 Budget Management
- Users must be able to define a planned budget per project.
- Users must be able to record budget items and expense items.
- The system must calculate total planned, total actual, remaining budget, and variance.
- The system should show alerts when budget is over plan or near threshold.

### 7.7 Team Management
- Admin must be able to create and manage team member records.
- Team members must have role, active status, contact info, and assignment history.
- The system should show who is assigned to which project and how many active tasks they own.

### 7.8 Commission Management
- Admin or finance users must be able to define commission rules and create commission records.
- Commission must support source types such as project sale, referral, upsell, or delivery incentive.
- Commission must support statuses such as `draft`, `approved`, `paid`, and `cancelled`.
- The system must calculate payable amounts based on fixed value or percentage.

### 7.9 Legal Document Management
- Users must be able to create legal document records for `quotation`, `proposal`, and `agreement`.
- Legal documents must belong to a project and may optionally reference client, budget, or feature scope data.
- The system must support reusable templates with merge fields for project, client, pricing, scope, payment terms, and signature blocks.
- Users must be able to preview documents in an internal document viewer before export or send-out.
- The system must support export to `pdf` and document-friendly formats such as `docx` when templates allow it.
- Legal documents must support statuses such as `draft`, `in-review`, `approved`, `sent`, `signed`, and `archived`.
- The system should preserve document versions and export history for audit purposes.

### 7.10 External Integration Management
- Admin users must be able to register integration connections for other projects or external systems.
- Integrations must support authenticated API calls to fetch project metadata, API documentation references, bugs, and tasks.
- The system must support ingesting normalized bug and task data originating from SQLite-backed systems through an API layer or connector service.
- Imported records must preserve source identifiers, sync timestamps, and source-system references.
- Users must be able to trigger manual sync and view sync result states such as `queued`, `running`, `succeeded`, `partial`, and `failed`.
- The system should support field mapping so external statuses and priorities can be translated into internal values.
- The system should allow read-only external records by default unless explicit write-back rules are configured.

### 7.11 Reporting
- The system should provide filters by project, status, assignee, and date range.
- The system should provide summary cards for delivery, finance, and payout health.
- The system should provide export-ready lists for finance and operations review.
- The system should provide reporting views for legal document status and integration sync health.

## 8. Data Model Scope
Core entities for v1:

- `users`
- `roles`
- `projects`
- `project_members`
- `features`
- `bugs`
- `tasks`
- `budget_plans`
- `budget_entries`
- `commission_rules`
- `commissions`
- `legal_document_templates`
- `legal_documents`
- `legal_document_versions`
- `integration_connections`
- `integration_sync_jobs`
- `external_records`
- `activity_logs`

Recommended relationships:

- One project has many features, bugs, tasks, budget entries, and commissions.
- One project has many legal documents and integration sync records.
- One feature has many tasks and many related bugs.
- One user can belong to many projects through `project_members`.
- One commission may belong to one project and one recipient user.
- One legal document may have many document versions and exports.
- One integration connection may sync many external records into one or more internal projects.

## 9. Key Business Rules
- Every operational record should have an owner or assignee where relevant.
- A task may belong to either a feature, a bug, both, or neither, but it must belong to a project.
- Budget entries must always have category, amount, type, and date.
- Commission cannot move to `paid` before it is `approved`.
- An agreement should not move to `sent` or `signed` without an approved document version.
- External records synced from other systems must retain source IDs and should not silently overwrite manually edited internal records.
- Archived projects remain readable but should not accept new active work by default.
- Soft delete is preferred for finance and audit-sensitive records.

## 10. UX Requirements
- The product should feel like internal operational software: fast, dense, and practical.
- The dashboard should prioritize tables, filters, badges, tabs, and summary cards.
- The development area should let users update status quickly without excessive navigation.
- Forms should be optimized for frequent data entry.
- Legal document creation should support template selection, structured fields, preview, and one-click export.
- Integration screens should clearly show connection setup, mapping, sync logs, and failure reasons.
- Mobile support is required for viewing and quick updates, but desktop is the primary experience.
- DaisyUI is the default page composition system for the product.
- The product theme should stay close to a neutral shadcn-like palette while using DaisyUI components and structure.
- Each page should have strong hierarchy: breadcrumb, section kicker, title, operational summary, action area, and work surface.

## 11. Suggested Information Architecture
- `/login`
- `/dashboard`
- `/dashboard/projects`
- `/dashboard/users`

Planned expansion:
- `/dashboard/projects/[projectId]`
- `/dashboard/development`
- `/dashboard/development/bugs`
- `/dashboard/development/features`
- `/dashboard/development/tasks`
- `/dashboard/legal`
- `/dashboard/legal/templates`
- `/dashboard/legal/documents`
- `/dashboard/legal/documents/[documentId]`
- `/dashboard/finance/budgets`
- `/dashboard/finance/commissions`
- `/dashboard/integrations`
- `/dashboard/integrations/[integrationId]`
- `/dashboard/team`
- `/dashboard/reports`
- `/dashboard/settings`

## 12. Success Metrics
- Owner can see open bugs, active features, budget status, unpaid commissions, and pending legal documents in less than 2 minutes.
- Team can update delivery records without needing external spreadsheets.
- Monthly commission calculation time is reduced significantly from manual process.
- Project overspending becomes visible before it becomes a major problem.
- Work ownership is clear for each active project.
- Quotations, proposals, and agreements can be generated from templates without leaving the system.
- External bugs and tasks from connected projects become visible through a single operational view.

## 13. MVP Priorities
### Priority 1
- Authentication and role-based access
- Project management
- Team assignment
- Executive dashboard overview

Priority 1 currently implemented:
- Authentication and owner bootstrap
- Dashboard overview
- Project management
- User management

Priority 1 next expansion:
- Bugs, features, and tasks board
- Basic budget tracking
- Basic commission records
- Basic legal document templates and document generation
- Read-only external sync for bugs and tasks through API integration

### Priority 2
- Activity log
- Dashboard analytics
- Filters, saved views, and exports
- Approval workflow for commissions
- PDF export and in-app document viewer
- API docs reference sync and integration mapping UI

### Priority 3
- File attachments
- Notifications
- Client records
- Release and QA checklist
- Agreement approval workflow with version compare
- Optional write-back sync to external systems

## 14. Risks And Constraints
- Budget and commission logic can become inconsistent without strict validation.
- Team members may resist using the system if data entry is slow.
- Scope can expand too quickly into ERP territory.
- Reporting quality depends on disciplined project and finance updates.
- Legal templates can become unreliable if placeholders, pricing fields, and approval rules are not standardized.
- SQLite data sync depends on a stable connector or API layer; direct database coupling across projects should be avoided.

## 15. Future Expansion
- Client management
- Invoice and payment tracking
- Profitability dashboard per project
- Timesheets
- Release planning and sprint management
- Integration with GitHub, Slack, or WhatsApp notifications
- E-signature provider integration
- Clause library and template automation by project type
- Two-way sync with external issue trackers and project systems
