# NSUT Connect Portal — Product Description

## One-line description

NSUT Connect Portal is a secure, role-based digital campus platform that helps students, faculty members, moderators, and administrators discover research, collaborate on projects, publish academic work, share institutional updates, and manage community trust workflows in one place.

## Product overview

The portal is designed as a modern community and research layer for Netaji Subhas University of Technology. It combines the information architecture expected from a university website with authenticated workflows normally spread across email, spreadsheets, informal messaging groups, and disconnected departmental systems.

Public visitors can explore research projects, faculty profiles, publications, announcements, opportunities, forum conversations, institutional highlights, and university information. Authenticated members receive a workspace tailored to their responsibilities:

- Students discover projects, apply to research opportunities, track applications, maintain academic profiles, and participate in the campus community.
- Faculty members publish and manage projects, review applicants, maintain research profiles and publications, and post departmental updates.
- Moderators review reports, resolve content and conduct issues, and evaluate faculty-verification evidence.
- Administrators control account status and role assignments and oversee platform governance.

The product uses Supabase Auth for password and session management, short-lived JWTs for authenticated identity, normalized role-based access control for authorization, Postgres Row Level Security as the final data boundary, and auditable server-side workflows for sensitive actions.

## Product vision

Create a trusted digital commons for NSUT where academic opportunities are visible, collaboration is easy to initiate, institutional knowledge is searchable, and every privileged action is accountable.

The long-term product should become the dependable starting point for:

1. Finding faculty expertise and active research.
2. Matching students with projects, mentors, internships, grants, and events.
3. Managing project applications and academic outputs.
4. Publishing trustworthy institutional and departmental updates.
5. Building a discoverable record of university research and participation.
6. Operating moderation, verification, and access-control workflows safely.

## Core value proposition

### For students

The portal replaces fragmented opportunity discovery with one searchable place to find projects, faculty, publications, events, scholarships, internships, and community discussions. Application tracking gives students a clear status rather than an opaque email thread.

### For faculty

The portal provides a structured workspace for publishing projects, reviewing applicants, maintaining publications, announcing updates, and establishing a verified institutional profile.

### For moderators

The portal provides dedicated queues, evidence, priority and status controls, and an audit trail for reports and faculty-verification decisions.

### For administrators

The portal centralizes approval, suspension, reactivation, and role assignment while keeping authorization decisions out of client-side code and mutable signup metadata.

### For the institution

The portal creates a coherent, searchable representation of academic activity and campus opportunities while providing the governance controls required for a trusted institutional service.

## Primary product surfaces

### Public discovery

- Homepage and institutional overview
- Faculty directory and member profiles
- Research project directory and project details
- Research publications
- News, developments, highlights, grants, and opportunities
- Attributed community forum with reportable posts and replies, plus a public activity feed
- Ethics, university information, and informational pages

### Student workspace

- Student dashboard
- Project discovery and applications
- Application-status tracking
- Editable student biography, education, academic details, public contacts, links, and CV/resume
- Personalized feed and community participation

### Faculty workspace

- Faculty overview dashboard
- Owned project management
- New-project creation
- Applicant review and accept/reject workflow
- Publication management
- Departmental news and opportunity publishing
- Editable faculty biography, education, office/contact details, academic links, CV/resume, and verification status

### Moderator workspace

- Trust-and-safety dashboard
- Open, urgent, reviewing, resolved, and dismissed report queues
- Content-report resolution
- Faculty-verification review
- Moderation-action history

### Administration

- User-account review
- Faculty approval and suspension
- Role assignment, including additive moderator roles
- Audited administrative actions

## Product principles

1. Security is enforced at every layer. Route guards, server checks, database functions, and RLS must agree.
2. Roles are not UI decoration. Every sensitive read or write is permission-gated on the server and database.
3. Institutional identity is verifiable. Public signup is limited to approved university email domains and faculty access requires approval.
4. Public information is useful without requiring login. Authentication is reserved for participation and private workflows.
5. Empty, loading, and error states are explicit. Production must never silently substitute fake data.
6. Privileged actions are auditable. Moderator and administrator decisions retain actor, target, reason, and timestamp.
7. The interface remains accessible, responsive, and understandable for users who are not technically sophisticated.
8. Development data is isolated. Demo users and records are clearly namespaced and must never be confused with production identities.

## Current implementation snapshot

As of 30 July 2026, the repository contains:

- Next.js 16 App Router, React 19, TypeScript, and Tailwind CSS.
- Supabase SSR and browser clients.
- Institutional signup, PKCE callback, login, logout, session, and protected-route flows.
- JWT-backed identity and normalized RBAC tables for student, faculty, moderator, and administrator roles.
- Database permissions, RLS policies, faculty verification, content reports, moderation actions, audit events, skills, project requirements, milestones, and application history.
- Public discovery pages and protected student, faculty, moderator, and administrator workspaces.
- A repeatable development seed containing 24 students, 24 faculty members, one moderator, and linked page content.
- A production build that successfully generates 40 application routes.

The configured Supabase project URL is currently retired and does not resolve. A new live Supabase project must be provisioned, the schema and migrations applied, authentication hooks configured, and environment variables replaced before demo accounts or production sign-ins will work.

## Product positioning statement

For NSUT students, faculty, and institutional teams who need a trusted way to discover and coordinate academic activity, NSUT Connect Portal is a role-aware campus collaboration platform that unifies projects, applications, publications, opportunities, community discussion, verification, and moderation. Unlike static university pages or informal messaging groups, it combines public discovery with secure, auditable workflows backed by institutional identity and database-level authorization.

## Important naming and governance note

“NSUT Connect Portal” is a working product name. Public production use of the university name, marks, logos, domains, member data, or claims of official status requires explicit institutional authorization, privacy review, and security approval. Until then, deployments should be described as prototypes or internal/staging environments.
