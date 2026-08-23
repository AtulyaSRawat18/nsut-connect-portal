-- Structured project applications and least-privilege prototype administration.

alter table public.applications
  add column if not exists skills_summary text,
  add column if not exists availability_hours integer,
  add column if not exists google_form_response_url text,
  add column if not exists faculty_note text,
  add column if not exists reviewed_at timestamptz;

alter table public.applications
  drop constraint if exists applications_sop_length,
  add constraint applications_sop_length
    check (char_length(statement_of_purpose) between 100 and 3000),
  drop constraint if exists applications_skills_length,
  add constraint applications_skills_length
    check (skills_summary is null or char_length(skills_summary) between 40 and 1200),
  drop constraint if exists applications_availability_range,
  add constraint applications_availability_range
    check (availability_hours is null or availability_hours between 1 and 40),
  drop constraint if exists applications_resume_url_format,
  add constraint applications_resume_url_format
    check (
      resume_url is null
      or resume_url ~* '^https://[^[:space:]]+\.pdf([?#].*)?$'
      or resume_url ~* '^/[^[:space:]]+\.pdf([?#].*)?$'
    ),
  drop constraint if exists applications_google_form_url_format,
  add constraint applications_google_form_url_format
    check (
      google_form_response_url is null
      or google_form_response_url ~* '^https://(docs\.google\.com/forms/|forms\.gle/)[^[:space:]]+$'
    );

insert into public.app_permissions (permission_key, resource, action, description)
values ('user.read', 'user', 'read', 'Read member accounts for institutional administration.')
on conflict (permission_key) do update set
  resource = excluded.resource,
  action = excluded.action,
  description = excluded.description;

-- The prototype administrator is intentionally limited to the agreed control-plane duties.
delete from public.role_permissions
where role_key = 'admin'
  and permission_key not in (
    'user.read', 'user.suspend', 'role.manage',
    'report.read', 'report.resolve', 'content.moderate',
    'faculty.verify', 'announcement.create', 'opportunity.create', 'audit.read'
  );

insert into public.role_permissions (role_key, permission_key)
select 'admin', permission_key
from public.app_permissions
where permission_key in (
  'user.read', 'user.suspend', 'role.manage',
  'report.read', 'report.resolve', 'content.moderate',
  'faculty.verify', 'announcement.create', 'opportunity.create', 'audit.read'
)
on conflict do nothing;

drop policy if exists "User readers can inspect member accounts" on public.portal_users;
create policy "User readers can inspect member accounts"
  on public.portal_users for select to authenticated
  using (public.authorize('user.read'));

create or replace function public.review_project_application(
  target_application_id uuid,
  new_status text,
  review_note text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_record public.applications%rowtype;
  owner_id uuid;
begin
  if not public.authorize('application.review') then
    raise exception 'Application review permission required' using errcode = '42501';
  end if;
  if new_status not in ('accepted', 'rejected') then
    raise exception 'Invalid application decision' using errcode = '22023';
  end if;
  if new_status = 'rejected' and char_length(trim(coalesce(review_note, ''))) < 3 then
    raise exception 'A rejection note is required' using errcode = '22023';
  end if;

  select * into target_record
  from public.applications
  where id = target_application_id
  for update;
  if not found then
    raise exception 'Application not found' using errcode = 'P0002';
  end if;

  select faculty_id into owner_id
  from public.projects
  where id = target_record.project_id;
  if owner_id is distinct from auth.uid() then
    raise exception 'Only the project owner can review this application' using errcode = '42501';
  end if;

  update public.applications
  set status = new_status,
      faculty_note = nullif(trim(coalesce(review_note, '')), ''),
      reviewed_at = now()
  where id = target_application_id;
end;
$$;

alter table public.forum_posts
  add column if not exists moderation_status text not null default 'visible';

alter table public.forum_posts
  drop constraint if exists forum_posts_moderation_status_check,
  add constraint forum_posts_moderation_status_check
    check (moderation_status in ('visible', 'hidden', 'removed'));

create index if not exists forum_posts_moderation_status_created_idx
  on public.forum_posts (moderation_status, created_at desc);

drop policy if exists "Forum posts are viewable by everyone" on public.forum_posts;
drop policy if exists "Visible forum posts are public" on public.forum_posts;
create policy "Visible forum posts are public"
  on public.forum_posts for select
  using (
    moderation_status = 'visible'
    or author_id = auth.uid()
    or public.authorize('content.moderate')
  );

drop policy if exists "Forum replies are public" on public.forum_replies;
drop policy if exists "Replies follow parent post visibility" on public.forum_replies;
create policy "Replies follow parent post visibility"
  on public.forum_replies for select
  using (
    exists (
      select 1 from public.forum_posts post
      where post.id = forum_replies.post_id
    )
  );

create or replace function public.admin_moderate_report(
  target_report_id uuid,
  selected_action text,
  note text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_record public.content_reports%rowtype;
  next_visibility text;
begin
  if not public.authorize('content.moderate') then
    raise exception 'Content moderation permission required' using errcode = '42501';
  end if;
  if selected_action not in ('hidden', 'removed', 'restored') then
    raise exception 'Invalid moderation action' using errcode = '22023';
  end if;
  if char_length(trim(coalesce(note, ''))) < 3 then
    raise exception 'A moderation note is required' using errcode = '22023';
  end if;

  select * into target_record
  from public.content_reports
  where id = target_report_id
  for update;
  if not found then
    raise exception 'Report not found' using errcode = 'P0002';
  end if;
  if target_record.entity_type <> 'forum_post' then
    raise exception 'This prototype can only hide or remove forum posts' using errcode = '22023';
  end if;

  next_visibility := case
    when selected_action = 'hidden' then 'hidden'
    when selected_action = 'removed' then 'removed'
    else 'visible'
  end;

  update public.forum_posts
  set moderation_status = next_visibility
  where id = target_record.entity_id;
  if not found then
    raise exception 'Forum post not found' using errcode = 'P0002';
  end if;

  update public.content_reports
  set status = 'resolved',
      assigned_to = auth.uid(),
      resolution_note = trim(note),
      resolved_at = now(),
      updated_at = now()
  where id = target_report_id;

  insert into public.moderation_actions (
    report_id, moderator_id, action, target_type, target_id, reason
  ) values (
    target_report_id, auth.uid(), selected_action,
    target_record.entity_type, target_record.entity_id, trim(note)
  );
end;
$$;

revoke all on function public.review_project_application(uuid, text, text) from public;
revoke all on function public.admin_moderate_report(uuid, text, text) from public;
grant execute on function public.review_project_application(uuid, text, text) to authenticated;
grant execute on function public.admin_moderate_report(uuid, text, text) to authenticated;
