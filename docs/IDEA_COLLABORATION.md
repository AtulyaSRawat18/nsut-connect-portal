# IDea Test Branch

## Baseline and scope

The existing portal is a Next.js App Router / React application backed by
Supabase Auth and Postgres. `portal_users` is canonical identity; normalized
permissions, server guards, and RLS govern mutations. The forum already supplies
attributed discussions, replies, votes, and reporting. The entry route previously
shared the global navbar, and the navbar had no mobile navigation.

Baseline commit: `59a74cd5800e9de40c51aa2ba03344008efea6a4`.
GitHub freeze tag: `freeze/pre-idea-2026-10-04`.
Test branch: `test/idea-entry-2026-10-04`.
The freeze is a preserved release reference, not a change to branch protection.

## User behavior

- `/`, `/login`, and `/signup` use a focused account entry shell without the
  portal navbar/footer. Existing auth, verification, and faculty approval remain.
- `/idea` and `/idea/[slug]` provide 24 curated interest spaces with detailed
  niches, resource links, typo-tolerant Fuse.js search, and cross-branch people
  discovery. Acronyms include FSOC, QKD, RAG, and TinyML.
- Joining a space makes the account discoverable to active signed-in members.
  Leaving removes that interest. Anonymous visitors see aggregate counts only.
- Connections are private, one-way saved contacts, not mutual friendships or
  messages. Profile pages provide members' existing public contact information.
- Discussions and shared HTTPS resources use the existing moderated forum.
  A member must join a space before publishing there. Replies and reports use
  existing forum workflows. The recent discussion feed is capped at 100 posts.
- Popular spaces are ranked by actual active memberships, not invented counts.
  With no members, the sidebar shows editorial discovery suggestions instead.
- Catalog resources remain available during an outage. Live-data errors are
  explicit; the interface never substitutes fictitious people for a failed read.

## Database rollout

Apply `202610040013_idea_collaboration.sql` only after migrations 001-012.
It adds `idea_topics`, `idea_memberships`, `idea_connections`, two limited read
functions, `idea.participate`, and topic/resource fields on `forum_posts`.
All new tables have RLS. The forum gets a restrictive INSERT policy so existing
permissive policies cannot bypass IDea membership checks.

`idea_people()` returns only opted-in, active members' names, roles, departments,
bios, and interest IDs to authorized members. It excludes private emails and
other account fields. `idea_member_counts()` exposes aggregate counts only.
Mutation endpoints validate identity, permission, origin, input, and rate limits.
Browser payloads never select the acting user ID. No service key is used by the
application. The service key is used only by the guarded staging demo seeder.

Before remote rollout, confirm the configured project matches linked staging
`vvpmjvavowslmtqwkbuj`, that it is active, and that prior migrations exist.
Do not reset or reseed the existing database. The additive seed only joins
existing namespaced demo faculty/students to spaces:

```powershell
$env:IDEA_STAGING_PROJECT = 'vvpmjvavowslmtqwkbuj'
node --env-file=.env.local scripts/seed-idea.mjs
```

## Verification and recovery

Run `npm run test:idea`, `npx tsc --noEmit`, scoped ESLint,
and `npm run build`. Verify guest, student, faculty, suspended-account, and
cross-user database policies on staging before promotion. Check small screens,
keyboard tabs, light/dark mode, search, joining/leaving, connection persistence,
discussion creation, resource links, and reporting in a browser preview.

For application rollback, deploy the freeze tag. The migration is additive and
can remain in place during rollback; do not drop tables containing member data.
Promote through review rather than force-pushing the frozen source branch.

## Local verification status (5 October 2026)

The 13 search and Postgres policy tests pass. Policy tests execute migration 013
in PGlite against representative existing portal contracts, including denied
cross-user writes, suspended accounts, guest access, private connections, and
unjoined-space publishing. They do not replace live Supabase validation.

The production build and scoped lint checks pass. On this Windows checkout,
the existing `.next` cache is locked and Turbopack stalled; use the isolated
directory and webpack for reproducible local runs:

```powershell
$env:NSUT_BUILD_DIR = '.next-idea'
npm run build -- --webpack
npm run dev -- --webpack
```

The linked Supabase project still reports `INACTIVE`. Migration 013 and the
demo-interest seed have not been applied remotely. Restore the staging project,
verify migrations 001-012, then apply 013 and run the guarded seed. Login and
live memberships/connections remain unavailable until that happens.

Browser access to localhost was denied by the browser permission check, so
desktop/mobile screenshots and interactive browser review remain unverified.
All 13 HTTP smoke checks pass: the three account-entry routes omit portal
navigation, four IDea URLs render, unknown spaces return 404, guest mutations
return 401, foreign-origin mutations return 403, guest reads expose no private
member data, and both campus/logo image assets load. Run them against the local
server with `node scripts/test-idea-http.mjs`.
