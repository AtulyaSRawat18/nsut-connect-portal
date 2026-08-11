# Prototype admin and project-application workflows

This document describes the staging prototype implemented by migrations
202608030005_application_admin_workflow.sql,
202608030006_forum_moderation_guards.sql,
202608030007_application_submission_guards.sql, and
202608110008_editable_profiles_flexible_evidence_and_seats.sql.

## Login modes

The login screen asks the member to choose either:

- **Student** for student accounts.
- **Faculty / staff** for faculty, moderator, and administrator accounts.

The selection is an entry-point hint, not an authorization claim. The server signs
the user in, loads the canonical portal_users row and normalized user_roles,
then rejects a mode that does not match those live assignments. The selected mode
is stored in a short-lived, HttpOnly, SameSite cookie only to route /dashboard.
RLS and server permission guards remain authoritative.

## Structured project applications

An open project may publish its working material as a Drive/Docs link, Word or
PDF link, portal-local file, descriptive reference, or `NA`. A complete
application contains:

- A 100–3,000 character statement of purpose.
- A 40–1,200 character skills and evidence summary.
- Weekly availability from 1 to 40 hours.
- A CV/resume reference (link, document reference, descriptive text, or `NA`).
- An HTTPS Google Forms response or questionnaire link.
- The applicant's explicit confirmation that the links are appropriate to share
  with the faculty reviewer.

Submissions pass through POST /api/projects/[id]/applications, which verifies
the active student identity, application.create, the open project, remaining
seat availability, field formats, and duplicate applications. Faculty decisions pass through
PATCH /api/faculty/applications/[id] and the review_project_application
security-definer function. The function checks application.review and verifies
that the reviewer owns the target project. Acceptance locks the application and
project rows, decrements `projects.available_seats` exactly once, and refuses an
acceptance when no seat remains. Reversing an acceptance restores one seat.
Direct application updates are revoked from the authenticated role.

Staging contains two complete pending examples for the first demo faculty account.
Their CVs are synthetic PDFs under public/demo-cvs/. Their Google Forms URLs are
explicitly synthetic placeholders and must be replaced with live institutional
forms before real applicant testing.

## Prototype administrator

The control plane has only four sections:

- /admin — overview, pending work, announcements, opportunities, and audit history.
- /admin/users — accounts, status changes, and normalized role assignments.
- /admin/reports — report resolution and reversible forum-post moderation.
- /admin/faculty-verification — faculty-verification decisions.

The admin role is limited to this exact permission set:

- user.read
- user.suspend
- role.manage
- report.read
- report.resolve
- content.moderate
- faculty.verify
- announcement.create
- opportunity.create
- audit.read

The website does not expose a database console, passwords, JWTs, service-role
keys, audit deletion, or permanent content deletion. Forum moderation uses
visible, hidden, and removed states; audit and report records remain intact.
Every sensitive route checks the live server-side role and permission set, and
the database applies RLS or a permission-checked RPC.

The existing moderator role remains distinct. It enters through **Faculty /
staff** mode and retains moderation and faculty-verification duties without
receiving /admin access or role.manage.

## Creating the real prototype admin

Register a normal institutional account first. In the confirmed non-production
staging SQL editor, replace the placeholder email and run:

    update public.portal_users
    set
      role = 'admin',
      account_status = 'active',
      approved_at = now()
    where email = 'YOUR_ADMIN_EMAIL@nsut.ac.in';

    insert into public.user_roles (user_id, role_key)
    select id, 'admin'
    from public.portal_users
    where email = 'YOUR_ADMIN_EMAIL@nsut.ac.in'
    on conflict do nothing;

Sign out and sign back in using **Faculty / staff** mode so the custom access-token
hook can issue a fresh JWT. Never promote an account from client code.

## Staging seed and validation

Only after explicitly verifying that the configured project is non-production:

    npm run seed:demo -- --confirm-staging
    node scripts/seed-admin-application-demo.mjs --confirm-staging

DEMO_ACCOUNT_PASSWORD must be supplied through ignored local configuration. No
seed script prints it.

The repeatable seed creates 24 students and 24 faculty members with completed,
varied biographies, education, academic details, public contact fields and
academic links. Every faculty directory card opens `/profile/[id]`; identified
forum posts and replies also link to the same public profile route. Two students
use the synthetic CV PDFs in `public/demo-cvs/`; unavailable demo documents use
the explicit `NA` value so the interface does not publish broken links.

Validation must cover:

- Anonymous access to seeded faculty and student profile routes without exposing
  private `portal_users` account-state fields.
- Anonymous access to public forum content and denial of member data.
- Student application creation permission and direct decision denial.
- Faculty visibility of owned applications and the decision RPC.
- Moderator moderation permissions without administrator account permissions.
- The administrator's exact ten-permission assignment.
- Anonymous and student denial of /admin.
- Successful student, faculty, moderator-as-faculty, and admin-as-faculty logins.

## Project participation workflows

Apply `202608110011_project_contribution_and_collaboration_requests.sql` after
migrations `008` through `010`.

- Student vacancy applications remain in `applications`. Accepting one consumes
  exactly one `projects.available_seats` vacancy through
  `review_project_application`.
- When `available_seats` reaches zero, students no longer receive an application
  button. They may create one `project_contribution_requests` record proposing a
  bounded, non-seat contribution. Accepting it never changes seat accounting.
- Faculty viewers never receive vacancy or seat actions. A faculty member who
  does not own the project may create one `faculty_collaboration_requests`
  proposal describing the collaboration type, scope and expertise offered.
- Project owners review contribution and collaboration records through separate
  owner-only security-definer functions. Direct table updates are not granted to
  application clients.
- The faculty workspace keeps student applications, incoming student
  contributions, incoming faculty collaborations and outgoing collaborations
  visibly distinct.

## Rollback

Keep the pre-migration JSON snapshot outside the repository. To roll back:

1. Stop Preview traffic and preserve a fresh snapshot.
2. Restore affected rows from the snapshot.
3. Remove the three new application constraints and columns only after exporting
   any newly submitted application evidence.
4. Restore the previous forum SELECT and engagement policies.
5. Drop review_project_application and admin_moderate_report.
6. Restore the previous administrator permission mappings.
7. Remove the staging demo administrator from Auth and its linked profile/role
   rows only after verifying the exact staging-only target.

Prefer a forward migration for any shared environment; do not edit an already
applied migration in place.
