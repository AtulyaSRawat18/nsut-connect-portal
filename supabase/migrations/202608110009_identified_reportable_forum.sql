-- Keep forum participation attributable and allow posts and replies to enter moderation.

alter table public.content_reports
  drop constraint if exists content_reports_entity_type_check;

alter table public.content_reports
  add constraint content_reports_entity_type_check
  check (entity_type in ('forum_post', 'forum_reply', 'announcement', 'project', 'profile', 'application'));

create unique index if not exists content_reports_open_reporter_target_idx
  on public.content_reports (reporter_id, entity_type, entity_id)
  where status in ('open', 'reviewing');
