# NSUT Connect Portal — Agent Instructions

## Mission

Move NSUT Connect Portal from secure prototype to production-ready institutional
pilot while preserving data, enforcing RBAC/RLS, and keeping the repository
deployable. A successful build alone is not production readiness. Read
`docs/PRD.md` and `docs/PRODUCT_DESCRIPTION.md` for the product baseline.
Production readiness also requires live infrastructure, validated auth/RLS,
critical tests, monitoring, backups, rollback, privacy/security review, and
institutional approval.

## Repository facts

- Repository: `AtulyaSRawat18/nsut-connect-portal`
- Active branch: `agent/rbac-moderator-faculty` (draft PR #1)
- Stack: Next.js 16, React 19, TypeScript, Tailwind CSS, Supabase Auth and Postgres
- Source: `src/`
- Schema baseline: `supabase/schema.sql`
- Migrations, in order:
  1. `supabase/migrations/202607290001_auth_foundation.sql`
  2. `supabase/migrations/202607290002_rbac_moderation_faculty.sql`
- Auth notes: `BACKEND_AUTH.md`
- Seeder: `scripts/seed-demo.mjs`
- Commands: `npm run dev`, `npm run build`, `npm run seed:demo`, `npm run seed:demo:clean`

## Known blocker

The configured Supabase hostname is retired and does not resolve. Do not seed,
apply remote migrations, or attempt live authentication/database work until a
new live staging Supabase project URL and matching keys are confirmed. Verify
the exact target before running any seed or migration command. Never guess or
fabricate a project.

## Non-goals

Do not build Redis or custom distributed session storage, payments, a native
mobile app, direct messaging or real-time chat, official ERP/exam/fee/grade
replacement, automatic production ingestion from unapproved sources, or
unofficial institutional branding.

## Hard invariants

1. Never print, commit, log, or transmit secrets such as
   `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, access tokens, or passwords in
   code, commits, tool output, or agent messages.
2. Never place the service-role key in browser or client code.
3. Preserve `portal_users` as canonical identity, normalized RBAC
   (`app_roles`, `app_permissions`, `role_permissions`, `user_roles`), and RLS
   on every exposed table.
4. Never weaken authorization, server guards, RLS, or permission checks merely
   to make a test or build pass.
5. Production must never use the shared demo password. Demo accounts remain
   namespaced as `demo.*@nsut.ac.in` and are restricted to verified non-production
   environments.
6. Every protected mutation requires server-side identity and permission checks.
   UI visibility is never sufficient authorization.
7. Treat JWT claims as navigation/coarse-gating data; live database roles and
   permissions remain authoritative for sensitive decisions.

## Operating rules

1. Inspect the repository, current branch, remotes, and dirty state before changes.
2. Read the closest applicable `AGENTS.md` and the relevant PRD sections first.
3. Verify the target is staging before any demo seed.
4. Destructive database or Git actions—drops, destructive resets, force-pushes,
   or history rewrites—require explicit human approval, an exact target, a
   backup, and a rollback plan before execution.
5. Preserve unrelated user changes. Do not reformat or refactor outside scope.
6. Prefer versioned migrations over manual remote database changes.
7. Test in proportion to risk. Separate pre-existing failures, including known
   repository-wide lint debt, from failures introduced by the current work.
8. Keep commits small and scoped, and update the draft PR description as work lands.
9. Stop and ask a human for credentials, secrets, governance decisions, or new
   external-system authority.
10. Do not claim production readiness based only on a successful build.
11. Use explicit empty, loading, denied, not-found, and error states. Do not hide
    production outages behind demo fallback content.
12. Update documentation whenever behavior, schema, deployment, or operating
    assumptions change.

## Open product decisions

The following are not settled. Use safe defaults, state assumptions, and avoid
irreversible choices:

- Official institutional authorization status
- Allowed signup domains and account types
- Who approves faculty and appoints moderators/administrators
- Faculty verification evidence requirements
- Moderation, appeals, and escalation policy
- Retention, export, and deletion rules
- Official-system integrations
- Forum search indexing
- Additive-role rules for students and faculty
- Pilot and production support commitments

## Required update format

Every work cycle must report:

- Outcome achieved
- Files, migrations, and external systems changed
- Tests and verification performed
- Security/RBAC impact
- Remaining blockers and risks
- Exact next action

## Definition of done

A feature is done only when:

- User behavior and acceptance criteria are implemented.
- Server and database authorization protect it.
- Validation and loading, empty, denied, not-found, and error states exist.
- Tests cover the successful path and critical denials.
- Schema changes use versioned migrations.
- No secrets or unsafe production demo data are committed.
- Build and targeted checks pass.
- Documentation is updated.
- The change is reviewed in a preview environment.

## Completion boundary

The agent must not claim the platform is production-ready merely because it
builds. Readiness requires a live environment, validated authentication and RLS,
critical automated tests, monitoring, backups, rollback, privacy/security review,
and institutional approval.
