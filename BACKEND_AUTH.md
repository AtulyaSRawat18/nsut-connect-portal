# Authentication and authorization foundation

This phase ports the strongest authentication concepts from the Nalum backend
without copying its password database or Redis dependency.

## Architecture

- **Supabase Auth** owns passwords, institutional email verification, short-lived
  access-token JWTs, refresh-token rotation, session revocation and password
  recovery.
- **`portal_users`** is the authoritative application identity. Roles and account
  status are never trusted from mutable signup metadata.
- **Next.js proxy** validates the JWT with `auth.getUser()` and enforces route-level
  student, faculty and admin access. Protected routes fail closed.
- **Server guards** repeat authorization inside protected Server Components and
  API handlers. UI checks are never the only security boundary.
- **Postgres RLS** is the final authorization boundary for projects,
  applications, announcements, opportunities, forum posts and resume objects.
- **Admin status changes** go through a security-definer database function that
  verifies the caller is an active admin and writes an audit record.

The browser does not receive the service-role key. The feed cron route now
requires `Authorization: Bearer <CRON_SECRET>` before it creates a service-role
client.

## Account lifecycle

1. A user registers with an `@nsut.ac.in` address.
2. Supabase sends its PKCE-compatible confirmation link to `/auth/callback`.
3. Students begin as `active`; faculty begin as `pending`.
4. An active admin approves or suspends faculty through
   `admin_set_account_status`.
5. Login rejects unverified, pending and suspended accounts before returning a
   successful application session.

Admin is deliberately absent from the public registration schema. Promote the
first trusted admin from the Supabase SQL editor after that person has registered
and verified their email:

```sql
update public.portal_users
set role = 'admin', account_status = 'active', approved_at = now()
where email = 'trusted-admin@nsut.ac.in';
```

## Deployment

1. Back up the Supabase database.
2. Apply `supabase/migrations/202607290001_auth_foundation.sql` in a staging
   project first.
3. In Supabase Dashboard ? Authentication ? Hooks, enable
   `public.custom_access_token_hook` as the Custom Access Token hook.
4. Configure the site URL and add these redirect URLs:
   `http://localhost:3000/auth/callback` and the production equivalent.
5. Configure the variables in `.env.example`. Keep `SUPABASE_SERVICE_ROLE_KEY`
   and `CRON_SECRET` server-only.
6. Sign out and sign back in after enabling the hook so a fresh JWT receives the
   `user_role`, `account_status` and `is_content_handler` claims.

## API surface added in this phase

| Endpoint | Purpose |
| --- | --- |
| `POST /api/auth/signup` | Validated, throttled institutional registration |
| `POST /api/auth/login` | JWT session creation plus account-state checks |
| `POST /api/auth/logout` | Session revocation and cookie clearing |
| `GET /api/auth/session` | Safe current-identity response |
| `PATCH /api/admin/users/:id/status` | Audited admin approval/suspension |
| `GET /api/cron/fetch-feeds` | Secret-authenticated service operation |

Mutation routes reject a mismatched `Origin` header. Login and signup use a
small in-memory limiter, intentionally matching the requested no-Redis scope.
This limiter is useful for a single long-running deployment but is not globally
consistent across multiple serverless instances. Supabase Auth's provider-level
rate limits remain the primary distributed control. If the platform later runs
across many instances, use a managed gateway or durable rate-limit store.

## Compatibility bridge

The original schema mixed `profiles` and `portal_users`. The migration makes
`portal_users` canonical but mirrors newly registered users into `profiles`
temporarily, because several existing foreign keys still target that table. It
also adds explicit `portal_users` foreign keys for PostgREST joins.

Do not add new features against `profiles`. A later migration should copy any
remaining data, replace the legacy foreign keys, update generated Supabase types
and then remove the compatibility table.

## Next backend phases

1. Move project, application, announcement, opportunity and profile mutations
   behind typed route handlers and eliminate client-side authorization queries.
2. Replace every mock fallback with explicit empty, loading and error states.
3. Generate Supabase database types and remove remaining `any` values.
4. Add password recovery, resend-verification and faculty-document review flows.
5. Add integration tests for registration, confirmation, login, role denial,
   project ownership, application ownership, suspension and admin audit writes.
6. Replace static admin metrics with database-backed moderation and audit views.

## Phase 2: normalized RBAC and operational workspaces

Apply `supabase/migrations/202607290002_rbac_moderation_faculty.sql` after the
auth-foundation migration. It adds:

- `app_roles`, `app_permissions`, `role_permissions`, and `user_roles`;
- multiple simultaneous roles per account;
- permission checks through `authorize(permission_key)`;
- content reports and immutable moderation actions;
- faculty verification requests and approval workflows;
- skills, project requirements, project milestones, and application history;
- moderator and faculty workspace pages with server-side authorization.

Administrators can grant moderator access without replacing an existing student or
faculty role:

```http
POST /api/admin/users/<user-id>/roles
Content-Type: application/json

{ "role": "moderator" }
```

The equivalent database function is `assign_portal_role(target_id, 'moderator')`.
It checks `role.manage` against the caller and records the assignment in the admin
audit log. After assignment, the user should sign out and back in so their JWT
navigation claims refresh. Database authorization reads the live role tables and
does not wait for token refresh.

New protected areas:

- `/moderator` — trust-and-safety metrics and current queues;
- `/moderator/reports` — content report review and resolution;
- `/moderator/faculty-verification` — faculty evidence review;
- `/dashboard/faculty` — faculty research overview;
- `/dashboard/faculty/projects` — owned project management;
- `/dashboard/faculty/publications` — publication management.