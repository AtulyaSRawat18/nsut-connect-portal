# Research workspace and forum interaction

## User-facing behavior

- `/dashboard` is the role entry point. Faculty are redirected to the single faculty workspace at `/dashboard/faculty`; administrators and standalone moderators are redirected to their governed workspaces. This removes the earlier duplicate faculty portal.
- Faculty projects accept a Drive/Docs link, Word or PDF link, portal-local file, descriptive reference, or `NA` at creation time. Linked material should document the problem, method, milestones, evidence plan, risks, responsible-use limits, and expected outputs where applicable.
- Faculty can record project progress from 0–100%, health (`on_track`, `at_risk`, `blocked`, or `completed`), and a dated assessment note.
- New news records require a primary HTTPS source. New opportunities require an HTTPS or site-local action/source link.
- The public forum supports signed up/down scores and inline replies on the forum feed. Full thread pages remain available for complete discussion history.

## Authorization and data boundaries

- Forum reads are public. Replies and votes require an active authenticated member.
- Forum mutation routes enforce same-origin requests, rate limits, server-side identity checks, schema validation, and RLS.
- A member can create, update, or delete only their own vote. Reply authors and users with `content.moderate` permission can update or delete replies under RLS.
- Project creation and assessment remain permission-gated. Project assessment also verifies ownership on the server; administrators retain their explicit override.
- `portal_users` remains the canonical application identity for reply attribution.

## Migrations

Apply after the existing schema and RBAC migrations:

1. `202608020003_research_evidence_and_forum.sql`
2. `202608030004_forum_score_semantics.sql`

The first migration adds project evidence/assessment fields, mandatory source-link constraints for new content, forum replies, vote tables, RLS policies, grants, and score triggers. The second preserves signed post and reply scores for up/down voting.

## Rollback

Application rollback: redeploy the prior Vercel preview. The additive database columns and tables can remain unused safely.

Database rollback requires a staging backup and explicit approval because dropping forum reply/vote tables would destroy participant content. If only signed scoring must be reverted, replace `public.apply_forum_vote_score()` with the earlier clamped implementation; no vote rows need to be deleted.
