# NSUT Connect Portal — Live Agent Kickoff

Use the following as the first goal in a Codex task opened at the repository root.
The repository-level `AGENTS.md` will supply persistent operating instructions.

```text
/goal Restore the NSUT Connect Portal staging environment so authentication
and database workflows can be validated without exposing secrets.

Read AGENTS.md, docs/PRD.md, and docs/PRODUCT_DESCRIPTION.md first. Follow the
hard invariants, operating rules, required update format, and completion boundary.

Objectives:
1. Inspect the repository, current branch (`agent/rbac-moderator-faculty`),
   remotes, PR state, and dirty/uncommitted work. Preserve unrelated changes.
2. Confirm whether a live staging Supabase URL and matching keys already exist
   in the environment. Inspect names and validity without printing values. If
   no live staging project exists, stop and ask me to provision it or supply the
   credentials securely. Do not guess or fabricate a project.
3. Verify explicitly that the target is non-production before any migration or
   seed operation. Record the verification without revealing identifiers that
   should remain private.
4. Once staging is confirmed, back it up if it contains data, then apply:
   a. supabase/schema.sql
   b. supabase/migrations/202607290001_auth_foundation.sql
   c. supabase/migrations/202607290002_rbac_moderation_faculty.sql
   Apply them in exactly that order. Prefer the migration workflow and retain a
   rollback plan.
5. Configure staging Auth Site URL, redirect URLs, and
   public.custom_access_token_hook. Verify configuration rather than assuming it.
6. Configure local and Vercel Preview environment variables by name only:
   NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
   SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SITE_URL, and CRON_SECRET. Never print,
   log, commit, or transmit their values.
7. Run npm run seed:demo. Verify expected record counts and end-to-end login for
   the documented student, faculty, and moderator demo accounts. Do not seed a
   production environment.
8. Test route authorization, server permission checks, and representative RLS
   denials for anonymous, student, faculty, moderator, and administrator contexts.
9. Inspect the Vercel preview deployment. Fix the canonical preview and identify
   or remove duplicate project linkage only with the necessary authority and a
   clear exact target.
10. Run the production build and relevant targeted checks. Report pre-existing
    repository-wide lint debt separately from introduced failures.
11. Keep implementation commits small and scoped. Update draft PR #1 with the
    staging changes, validation evidence, security impact, blockers, and rollback.

Report every cycle using AGENTS.md:
- Outcome achieved
- Files, migrations, and external systems changed
- Tests and verification performed
- Security/RBAC impact
- Remaining blockers and risks
- Exact next action

Do not mark this goal complete until staging authentication, seeded role logins,
representative RLS/route authorization, and the canonical preview deployment have
all been validated. A successful local build alone is not completion.
```

## Suggested follow-up goal

After Phase A is complete:

```text
/goal Harden NSUT Connect Portal workflows for pilot readiness: generate and use
Supabase TypeScript types, reduce untyped database responses, replace production
mock fallbacks with explicit states, add the RBAC/RLS authorization test matrix,
and finish password recovery and verification resend. Follow AGENTS.md and the
P0/P1 requirements in docs/PRD.md. Preserve security invariants and report each
cycle in the required format.
```
