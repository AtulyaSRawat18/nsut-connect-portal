# Product Requirements Document: NSUT Connect Portal

**Status:** Implementation baseline and forward plan  
**Version:** 1.0  
**Date:** 30 July 2026  
**Repository:** `AtulyaSRawat18/nsut-connect-portal`  
**Active branch:** `agent/rbac-moderator-faculty`  
**Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, Supabase Auth and Postgres  
**Audience:** Product owner, engineering agents, designers, reviewers, and deployment operators

## 1. Executive summary

NSUT Connect Portal is a role-based campus research and community platform. It turns a largely informational university-web experience into an authenticated service where students discover and apply to projects, faculty manage research activity, moderators operate trust workflows, and administrators manage accounts and roles.

The first production objective is a safe pilot supporting public discovery, institutional authentication, student project applications, faculty project and publication management, moderator report handling, and administrative governance. Redis, distributed custom session storage, payments, and a native mobile app are outside initial scope.

Much of the interface and authorization foundation already exists. The immediate delivery risk is infrastructure: the configured Supabase project is retired and a new project must be provisioned before authentication and live database workflows can be validated.

## 2. Problem statement

Academic activity is difficult to discover when faculty expertise, open projects, publications, events, grants, applications, and conversations live across static pages, email, spreadsheets, and messaging groups. Students lack a transparent path from discovery to application status. Faculty lack a consistent place to present work and review interest. Institutions need verification, moderation, and access governance before enabling participation.

The product addresses four connected problems:

1. **Discovery:** make people, research, opportunities, and updates searchable.
2. **Participation:** provide clear workflows for applying, publishing, discussing, and reviewing.
3. **Trust:** verify identity, constrain permissions, moderate misuse, and audit privileged actions.
4. **Operations:** give each role a focused workspace rather than one generic dashboard.

## 3. Vision and pilot success

### Vision

Become NSUT's trusted digital commons for research discovery, academic collaboration, and governed community participation.

### Pilot success criteria

- A verified student can sign in, find a project, apply, and track status.
- An approved faculty member can create a project, review applicants, and publish research.
- A moderator can resolve a report and review faculty-verification evidence.
- An administrator can activate, suspend, and assign roles with an audit record.
- Public visitors can browse populated faculty, project, publication, news, forum, and opportunity pages.
- Unauthorized users cannot retrieve or mutate protected data through routes or Supabase APIs.
- The application is reproducible from committed schema, migrations, documentation, and seed tooling.

## 4. Goals and non-goals

### Goals

- Useful public academic discovery without mandatory login.
- Participation restricted to verified institutional identities.
- Normalized RBAC for student, faculty, moderator, and administrator capabilities.
- Transparent project application and review status.
- Verified faculty profiles and research-publication management.
- Structured report, verification, and audit workflows.
- Vercel and Supabase deployment without Redis.
- A repeatable and isolated staging/demo environment.

### Non-goals for the first release

- Replacing official ERP, examination, fee, attendance, payroll, or grade systems.
- Payments or official academic-record workflows.
- Native mobile apps, direct messaging, or real-time chat.
- Redis or custom distributed session storage.
- Automatic production ingestion from unapproved sources.
- Official public branding without institutional approval.

## 5. Personas

### Public visitor

Browses people, projects, publications, news, events, opportunities, and discussions without an account.

### Student

Uses an institutional identity to find mentors and projects, apply, monitor outcomes, maintain a profile, and participate in the community.

### Faculty member

Begins pending approval, then maintains a verified profile, publishes projects and outputs, reviews applicants, and posts updates.

### Moderator

Receives an additive moderator role and operates prioritized report and faculty-verification queues with auditable decisions.

### Administrator

Manages account status and role assignments and inspects governance activity.

### Deployment operator/live agent

Maintains migrations, environments, tests, deployment, monitoring, and incidents while preserving security boundaries and secrets.

## 6. Roles and permissions

RBAC is additive through `user_roles`. `portal_users.role` remains a primary compatibility role while normalized permissions are authoritative for new operations.

| Capability | Public | Student | Faculty | Moderator | Admin |
| --- | --- | --- | --- | --- | --- |
| Browse public content | Yes | Yes | Yes | Yes | Yes |
| Maintain own profile | No | Yes | Yes | Yes | Yes |
| Apply to projects | No | Yes | With student role | No | No |
| Manage own projects | No | No | Yes | No | Yes |
| Review owned-project applications | No | No | Yes | No | Yes |
| Manage own publications | No | No | Yes | No | Yes |
| Publish announcements/opportunities | No | No | Yes | No | Yes |
| Create reports | No | Yes | Yes | Yes | Yes |
| Read/resolve moderation queues | No | No | No | Yes | Yes |
| Review faculty verification | No | No | No | Yes | Yes |
| Suspend users | No | No | No | Permission-based | Yes |
| Assign roles | No | No | No | No | Yes |
| Read audits/system settings | No | No | No | Limited | Yes |

No protected operation may rely solely on UI visibility or client state. Server guards and database policies must independently authorize it.

## 7. Key journeys

### 7.1 Student registration and application

1. Student registers with an approved institutional email.
2. Supabase sends a PKCE-compatible verification link.
3. Callback exchanges the code and establishes a session.
4. Student account begins active with the student role.
5. Student opens an available project and submits a statement of purpose and optional resume.
6. Student tracks pending, accepted, or rejected status.

Acceptance: duplicates are rejected; another student cannot read the application; unrelated faculty cannot review it.

### 7.2 Faculty onboarding and ownership

1. Faculty registers and begins pending.
2. Verification evidence enters the moderator queue.
3. Moderator or administrator approves the identity.
4. Faculty signs in again to refresh claims.
5. Faculty creates and maintains projects and publications.
6. Faculty reviews only applications to owned projects.

Acceptance: pending or suspended faculty are denied; faculty cannot mutate another owner's records.

### 7.3 Moderation

1. An active member reports a supported entity with category, summary, and evidence.
2. Queue shows priority, age, type, reporter, and status.
3. Moderator assigns or opens the report, records a reasoned action, and resolves or dismisses it.
4. Immutable moderation records preserve actor, target, reason, metadata, and time.

Acceptance: ordinary members cannot read or update the queue.

### 7.4 Administration

1. Admin reviews an account.
2. Admin activates, suspends, or reactivates it through an audited server/database operation.
3. Admin assigns a normalized role without deleting other valid roles.
4. The platform records the action.

Acceptance: admin is never a public signup choice, and ordinary users cannot mutate roles or status.

## 8. Functional requirements

Priority is P0 release-blocking, P1 pilot-important, and P2 later enhancement.

### Public discovery

- **FR-PUB-001 (P0):** Public pages render without authentication.
- **FR-PUB-002 (P0):** Faculty, projects, publications, news, opportunities, developments, highlights, and forum use persisted data.
- **FR-PUB-003 (P0):** Production uses explicit empty/error states, never silent demo fallbacks.
- **FR-PUB-004 (P1):** Lists support working search, filters, and pagination.
- **FR-PUB-005 (P1):** Detail routes use stable IDs and proper not-found states.

### Authentication and lifecycle

- **FR-AUTH-001 (P0):** Signup accepts only configured institutional domains.
- **FR-AUTH-002 (P0):** Supabase Auth owns passwords, refresh tokens, verification, and revocation.
- **FR-AUTH-003 (P0):** Confirmation uses a PKCE callback.
- **FR-AUTH-004 (P0):** Students default active and faculty default pending.
- **FR-AUTH-005 (P0):** Login rejects unverified, pending, suspended, or banned accounts.
- **FR-AUTH-006 (P0):** Protected routes fail closed when configuration or session validation fails.
- **FR-AUTH-007 (P1):** Add password reset, resend verification, and session-management UI.

### Profiles

- **FR-PRO-001 (P0):** `portal_users` is canonical application identity.
- **FR-PRO-002 (P0):** Members edit only allowed fields of their own profile.
- **FR-PRO-003 (P0):** Faculty profiles include department, designation, research, bio, office data, approved links, and verification.
- **FR-PRO-004 (P0):** Student profiles expose appropriate academic fields without private application data.
- **FR-PRO-005 (P1):** Directory search and filters work against persisted data.

### Projects and applications

- **FR-PRJ-001 (P0):** Active faculty create/update only owned projects.
- **FR-PRJ-002 (P0):** Projects contain title, description, department, status, capacity, owner, requirements, and dates.
- **FR-PRJ-003 (P0):** Students apply once to an open project.
- **FR-PRJ-004 (P0):** Faculty review only applications for owned projects.
- **FR-PRJ-005 (P0):** Application status changes are recorded in history.
- **FR-PRJ-006 (P1):** Faculty manage milestones and skill requirements.
- **FR-PRJ-007 (P1):** Resume objects are private to student and authorized reviewers.

### Publications and content

- **FR-CNT-001 (P0):** Faculty create and view publications attached to their identity.
- **FR-CNT-002 (P0):** Public results show title, authors, date, owner, and external URL.
- **FR-CNT-003 (P0):** Authorized faculty/content handlers create announcements and opportunities.
- **FR-CNT-004 (P1):** Mutations use typed, validated server handlers.
- **FR-CNT-005 (P1):** Feed ingestion is secret-authenticated, deduplicated, bounded, and attributable.

### Forum

- **FR-FOR-001 (P0):** Public users read approved posts.
- **FR-FOR-002 (P0):** Active members create posts and replies as their visible institutional identity; anonymous participation is not supported.
- **FR-FOR-003 (P1):** Posts and replies are reportable into the permission-protected moderator queue with category, explanation, target context, duplicate prevention, rate limits, and origin validation.
- **FR-FOR-004 (P1):** Add editing and deletion rules while retaining pagination and spam controls.

### Moderation and verification

- **FR-MOD-001 (P0):** Moderators view open, reviewing, urgent, resolved, and dismissed queues.
- **FR-MOD-002 (P0):** Resolution requires permission and a reason.
- **FR-MOD-003 (P0):** Actions create immutable audit records.
- **FR-MOD-004 (P0):** Faculty verification supports pending, reviewing, approved, rejected, and changes-requested.
- **FR-MOD-005 (P0):** Approval updates verification and account state consistently.
- **FR-MOD-006 (P1):** Queues support filters, assignment, ownership, and age indicators.

### Administration

- **FR-ADM-001 (P0):** Admins manage account status through an audited function.
- **FR-ADM-002 (P0):** Admins assign/revoke normalized roles.
- **FR-ADM-003 (P0):** Public registration cannot create an administrator.
- **FR-ADM-004 (P1):** Admin UI exposes roles, status, verification, and recent audits.
- **FR-ADM-005 (P1):** High-risk actions require confirmation and a reason.
## 9. Data requirements

### Identity and access

- `portal_users`: canonical identity, primary compatibility role, status, ban, and approval.
- `app_roles`, `app_permissions`, `role_permissions`, `user_roles`: normalized additive RBAC.
- `admin_audit_log`: administrative mutations.

### Academic and community

- `faculty_profiles`, `student_profiles`
- `projects`, `project_requirements`, `project_milestones`
- `applications`, `application_status_history`
- `publications`, `announcements`, `highlights`, `forum_posts`
- `skills`, `user_skills`

### Trust and safety

- `content_reports`
- `moderation_actions`
- `faculty_verification_requests`

### Compatibility

The legacy `profiles` table remains because earlier foreign keys reference it. New features must use `portal_users`. A planned migration must replace remaining foreign keys, generate types, verify parity, and only then remove `profiles`.

### Handling rules

- Demo accounts use `demo.*@nsut.ac.in` and deterministic content IDs.
- Production must never use the shared demo password.
- Service credentials stay server-only and never appear in bundles, logs, commits, or agent messages.
- Public views minimize personally identifiable information.
- Destructive migrations require backup, staging rehearsal, explicit approval, and rollback.

## 10. API requirements

| Endpoint | Purpose |
| --- | --- |
| `POST /api/auth/signup` | Institutional registration |
| `POST /api/auth/login` | Session creation and state checks |
| `POST /api/auth/logout` | Session revocation |
| `GET /api/auth/session` | Safe current identity |
| `PATCH /api/admin/users/:id/status` | Audited status mutation |
| `POST /api/admin/users/:id/roles` | Role assignment |
| `POST /api/faculty/publications` | Publication creation |
| `POST /api/moderator/reports/:id/resolve` | Report resolution |
| `POST /api/moderator/faculty-verifications/:id/review` | Verification decision |
| `GET /api/feed` | Personalized/public feed |
| `GET /api/cron/fetch-feeds` | Secret-authenticated ingestion |

All mutations use schema validation, live server-side identity and permission checks, safe stable errors, and origin checks where appropriate. Authentication and abuse-prone routes are rate-limited. Service-role clients are created only after server-side secret or permission checks succeed.

## 11. Security and privacy

- **SEC-001:** Supabase Auth owns passwords, refresh rotation, verification, recovery, and revocation.
- **SEC-002:** Proxy guards, server guards, and RLS each protect sensitive operations.
- **SEC-003:** JWT claims support navigation; live database roles remain authoritative.
- **SEC-004:** The Custom Access Token Hook issues controlled role/account claims.
- **SEC-005:** RLS is enabled on all exposed application tables.
- **SEC-006:** The service-role key never reaches browser code.
- **SEC-007:** Moderator and admin actions are attributable and auditable.
- **SEC-008:** Logs exclude passwords, tokens, keys, resumes, and sensitive evidence.
- **SEC-009:** Production receives dependency, redirect, header, and environment-separation review.
- **SEC-010:** Threat modeling covers takeover, escalation, IDOR, RLS bypass, stored content, malicious URLs, uploads, cron misuse, and secret leakage.

## 12. UX, accessibility, and content

- Responsive mobile, tablet, and desktop layouts.
- Keyboard-operable navigation, forms, dialogs, and actions.
- Visible focus, semantic structure, useful labels, and sufficient contrast.
- WCAG 2.2 AA release target.
- Role navigation must not imply unavailable actions are usable.
- High-risk actions require confirmation and consequence text.
- Forms provide field validation and preserve safe input after recoverable errors.
- Loading, empty, denied, not-found, and service-error states are explicit.
- Placeholder links and fabricated production claims are prohibited.
- Search controls must work or be removed before release.

## 13. Non-functional requirements

### Performance

Public pages should meet acceptable Core Web Vitals on mid-tier mobile. Lists use pagination or bounded queries, and the app avoids unnecessary client JavaScript and unbounded selects.

### Reliability

External-feed failure cannot break core pages. Migrations are versioned and ordered. Production changes have observable deployment and rollback. Scheduled work is idempotent and retry-safe.

### Maintainability

Generate Supabase TypeScript types, remove remaining `any`, centralize authorization/validation/error helpers, add critical tests, and keep README, backend notes, PRD, and runbooks aligned.

### Observability

Capture build/deployment failures, route errors, auth failures, and cron outcomes without sensitive payloads. Configure uptime/error monitoring and incident ownership before official release.

## 14. Metrics

### Activation

- Verified signup completion
- Faculty approval time
- First project view and first application completion

### Engagement

- Weekly active users by role
- Project views and qualified applications
- Active faculty projects/publications
- Opportunity and news engagement

### Workflow health

- Application review time
- Open moderation queue age
- Faculty verification turnaround
- Report resolution/dismissal rates

### Reliability/security

- Auth error rate
- Unauthorized/forbidden rate
- Server errors by route
- Failed deployment/migration count
- Security incidents and containment time

Metrics must not expose private content or reward low-quality volume.

## 15. Environments and deployment

### Local

- Next.js at `http://localhost:3000`.
- `.env.local` uses a development or staging Supabase project.
- Demo seeding is allowed only after verifying a non-production target.

### Preview/staging

- Vercel preview uses a staging Supabase project and separate variables.
- Redirect URLs include approved preview patterns.
- PR smoke tests run against staging data.

### Production

- Production Supabase has backups.
- Migrations are rehearsed in staging.
- Custom Access Token Hook is enabled.
- Exact Site URL/callback, Vercel variables, domain, monitoring, cron, and rollback are verified.

Required variables:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL
CRON_SECRET
```

**Current blocker:** workstation configuration points to a retired Supabase hostname. Do not seed until a live project URL and matching keys replace it.

## 16. Testing and release gates

### Required automated coverage

- Institutional-domain signup and confirmation callback
- Login state rejection
- Route denial for every role boundary
- Project/application ownership and duplicate prevention
- Faculty application review
- Moderator report and verification actions
- Admin status/role authorization and audit creation
- RLS matrix for anonymous, student, faculty, moderator, admin, and service contexts
- Seed idempotency and cleanup in staging

### Browser smoke suite

- Public pages populate correctly.
- Student login, application, and tracking.
- Faculty login, project creation, applicant review, and publication creation.
- Moderator login, report resolution, and verification review.
- Admin status and role assignment.
- Mobile and desktop navigation/forms.

### Release gates

- Production build and TypeScript pass.
- Critical tests pass.
- No committed secrets or production demo password.
- RLS/security review approved.
- Backup and rollback rehearsed.
- Critical accessibility review completed.
- Monitoring and incident owner configured.
- Institutional branding/privacy approval obtained.

## 17. Delivery phases

### Phase A — restore staging (P0)

1. Create a staging Supabase project.
2. Apply `supabase/schema.sql` and both migrations in order.
3. Configure redirects and `custom_access_token_hook`.
4. Replace local/preview environment values.
5. Run `npm run seed:demo` and verify documented sign-ins.
6. Fix the canonical Vercel preview and remove duplicate project linkage.

### Phase B — harden workflows (P0/P1)

1. Generate database types and remove untyped responses.
2. Replace production mock fallbacks with designed states.
3. Move remaining client mutations behind typed handlers.
4. Add the critical test and RLS matrix.
5. Complete password recovery and verification resend.
6. Review file uploads and external URLs.

### Phase C — pilot quality (P1)

1. Implement search, filtering, and pagination.
2. Improve moderator/admin audit surfaces.
3. Add application and verification notifications.
4. Add metrics, error monitoring, and operational dashboards.
5. Complete accessibility and content cleanup.

### Phase D — institutional scale (P2)

1. Remove the legacy profile layer safely.
2. Add approved official-system integrations.
3. Add alumni/mentor flows if governance permits.
4. Add durable distributed abuse controls when scale requires them.
5. Establish retention, export, deletion, and appeal policies.

## 18. Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Incorrect RLS or role policy | Exposure/escalation | Authorization matrix, review, fail closed |
| Invalid Supabase environment | Auth/content unavailable | Preflight, staging, runbook |
| Demo credentials in production | Compromise | Seed guard, removal, rotation |
| Mock fallback hides outage | Misleading UI | Explicit states and monitoring |
| Dual profile models diverge | Identity inconsistency | Canonical identity and migration |
| Faculty impersonation | Trust failure | Pending state, evidence, audit |
| Moderation backlog | Harm remains visible | Priority, assignment, age metrics |
| Unofficial branding/data use | Legal/reputation risk | Approval and prototype labeling |
| Agent makes unsafe changes | Regression/data loss | Scoped tasks, review, backups, approval |

## 19. Definition of done

A feature is done only when user behavior and acceptance criteria are implemented; server and database authorization protect it; validation and all UI states exist; tests cover success and critical denials; schema changes use migrations; no secrets are committed; build and targeted checks pass; documentation is updated; and the feature is reviewed in preview.

## 20. Live engineering agent handoff

This section is designed for conversion into a live-agent system prompt.

### Mission

Move NSUT Connect Portal from secure prototype to production-ready institutional pilot while preserving data, enforcing RBAC/RLS, and keeping the repository deployable.

### Starting state

- Repository: `AtulyaSRawat18/nsut-connect-portal`
- Branch/PR: `agent/rbac-moderator-faculty`, draft PR #1
- Seed-workflow commit at document creation: `97ea1e1`
- Source: `src/`
- Baseline: `supabase/schema.sql`
- Migrations: `202607290001_auth_foundation.sql`, `202607290002_rbac_moderation_faculty.sql`
- Auth notes: `BACKEND_AUTH.md`
- Seeder: `scripts/seed-demo.mjs`
- Commands: `npm run dev`, `npm run build`, `npm run seed:demo`, `npm run seed:demo:clean`

### Known facts

- Production build succeeds and generates 40 routes.
- Targeted checks for recently changed pages pass.
- Repository-wide lint has pre-existing `any`, unused import, and accessibility issues and is not yet a clean gate.
- The configured Supabase hostname does not resolve; the latest seed preflight created no accounts.
- Vercel showed two failing preview checks and likely duplicate project connections.
- The product remains a prototype absent institutional authorization.

### Agent operating rules

1. Inspect repository, branch, and dirty state first.
2. Never print, commit, transmit, or expose secrets.
3. Never place the service role in browser code.
4. Preserve `portal_users`, normalized RBAC, and RLS invariants.
5. Never weaken authorization to make tests pass.
6. Verify staging before demo seeding.
7. Require explicit approval, exact target, backup, and recovery for destructive database/Git actions.
8. Preserve unrelated user changes.
9. Prefer migrations over manual remote changes.
10. Test in proportion to risk and separate pre-existing failures from introduced failures.
11. Keep commits small and update the draft PR.
12. Stop for credentials, governance choices, or new external authority.

### Recommended first tasks

1. Provision or verify staging Supabase without exposing credentials.
2. Apply schema and migrations.
3. Configure Auth redirects and the access-token hook.
4. Seed demo data, verify counts, and test student/faculty/moderator logins.
5. Fix the canonical Vercel preview and disconnect the duplicate.
6. Implement automated authorization/RLS tests.
7. Generate Supabase types and reduce `any` incrementally.
8. Replace mock fallbacks and nonfunctional controls.
9. Create a production runbook and launch checklist.

### Required update format

Each cycle reports:

- Outcome achieved
- Files, migrations, and external systems changed
- Tests and verification
- Security/RBAC impact
- Remaining blockers and risks
- Exact next action

### Completion boundary

A successful build alone is not production readiness. Readiness requires live infrastructure, validated auth/RLS, critical tests, monitoring, backups, rollback, privacy/security review, and institutional approval.

## 21. Open product decisions

1. Will this become an officially authorized NSUT service?
2. Which domains and account types are allowed?
3. Who may approve faculty and appoint moderators/admins?
4. What evidence is required for verification?
5. Which content/moderation policies and appeals apply?
6. What retention, export, and deletion rules apply?
7. Which official systems may be integrated?
8. Is public forum content search-indexed?
9. Which additive roles can students/faculty hold?
10. What support and service commitments apply?

Until decided, the agent should use safe defaults, state assumptions, and avoid irreversible governance choices.
