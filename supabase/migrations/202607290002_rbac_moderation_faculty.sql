-- Normalized RBAC, moderation, and faculty workflow schema.
-- Apply after 202607290001_auth_foundation.sql.

begin;

alter table public.portal_users drop constraint if exists portal_users_role_check;
alter table public.portal_users add constraint portal_users_role_check
  check (role in ('student', 'faculty', 'moderator', 'admin'));

create table if not exists public.app_roles (
  role_key text primary key,
  display_name text not null,
  description text not null,
  rank smallint not null default 0,
  is_system boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.app_permissions (
  permission_key text primary key,
  resource text not null,
  action text not null,
  description text not null,
  created_at timestamptz not null default now(),
  unique (resource, action)
);

create table if not exists public.role_permissions (
  role_key text not null references public.app_roles(role_key) on delete cascade,
  permission_key text not null references public.app_permissions(permission_key) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role_key, permission_key)
);

create table if not exists public.user_roles (
  user_id uuid not null references public.portal_users(id) on delete cascade,
  role_key text not null references public.app_roles(role_key) on delete restrict,
  assigned_by uuid references public.portal_users(id),
  assigned_at timestamptz not null default now(),
  expires_at timestamptz,
  primary key (user_id, role_key)
);

insert into public.app_roles (role_key, display_name, description, rank) values
  ('student', 'Student', 'Discovers projects and submits applications.', 10),
  ('faculty', 'Faculty', 'Publishes research and reviews student applications.', 30),
  ('moderator', 'Moderator', 'Reviews reports, content, and faculty verification evidence.', 60),
  ('admin', 'Administrator', 'Controls role assignments, policies, and institutional settings.', 100)
on conflict (role_key) do update set
  display_name = excluded.display_name,
  description = excluded.description,
  rank = excluded.rank;

insert into public.app_permissions (permission_key, resource, action, description) values
  ('profile.read', 'profile', 'read', 'Read member profiles.'),
  ('profile.update.own', 'profile', 'update_own', 'Update the caller profile.'),
  ('project.read', 'project', 'read', 'Read research projects.'),
  ('project.create', 'project', 'create', 'Create a research project.'),
  ('project.update.own', 'project', 'update_own', 'Update owned projects.'),
  ('application.create', 'application', 'create', 'Apply to an open project.'),
  ('application.read.own', 'application', 'read_own', 'Read caller applications.'),
  ('application.review', 'application', 'review', 'Review applications to owned projects.'),
  ('publication.manage.own', 'publication', 'manage_own', 'Manage owned publications.'),
  ('announcement.create', 'announcement', 'create', 'Publish institutional announcements.'),
  ('opportunity.create', 'opportunity', 'create', 'Publish opportunities and events.'),
  ('report.create', 'report', 'create', 'Report content or accounts.'),
  ('report.read', 'report', 'read', 'Read the moderation queue.'),
  ('report.resolve', 'report', 'resolve', 'Resolve moderation reports.'),
  ('content.moderate', 'content', 'moderate', 'Hide, restore, or remove reported content.'),
  ('faculty.verify', 'faculty', 'verify', 'Approve or reject faculty verification.'),
  ('user.suspend', 'user', 'suspend', 'Suspend or reactivate member accounts.'),
  ('role.manage', 'role', 'manage', 'Assign and revoke RBAC roles.'),
  ('audit.read', 'audit', 'read', 'Read moderation and administration audit events.'),
  ('system.manage', 'system', 'manage', 'Manage platform-wide settings.')
on conflict (permission_key) do update set
  resource = excluded.resource,
  action = excluded.action,
  description = excluded.description;

insert into public.role_permissions (role_key, permission_key)
select 'student', permission_key from public.app_permissions
where permission_key in (
  'profile.read', 'profile.update.own', 'project.read', 'application.create',
  'application.read.own', 'report.create'
)
on conflict do nothing;

insert into public.role_permissions (role_key, permission_key)
select 'faculty', permission_key from public.app_permissions
where permission_key in (
  'profile.read', 'profile.update.own', 'project.read', 'project.create',
  'project.update.own', 'application.review', 'publication.manage.own',
  'announcement.create', 'opportunity.create', 'report.create'
)
on conflict do nothing;

insert into public.role_permissions (role_key, permission_key)
select 'moderator', permission_key from public.app_permissions
where permission_key in (
  'profile.read', 'project.read', 'report.create', 'report.read',
  'report.resolve', 'content.moderate', 'faculty.verify', 'user.suspend',
  'audit.read'
)
on conflict do nothing;

insert into public.role_permissions (role_key, permission_key)
select 'admin', permission_key from public.app_permissions
on conflict do nothing;

insert into public.user_roles (user_id, role_key)
select id, role from public.portal_users
where role in ('student', 'faculty', 'moderator', 'admin')
on conflict do nothing;

alter table public.app_roles enable row level security;
alter table public.app_permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_roles enable row level security;

create or replace function public.authorize(requested_permission text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.role_permissions rp on rp.role_key = ur.role_key
    join public.portal_users u on u.id = ur.user_id
    where ur.user_id = auth.uid()
      and rp.permission_key = requested_permission
      and (ur.expires_at is null or ur.expires_at > now())
      and u.account_status = 'active'
      and (u.banned_until is null or u.banned_until <= now())
  );
$$;

create or replace function public.has_app_role(requested_roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.portal_users u on u.id = ur.user_id
    where ur.user_id = auth.uid()
      and ur.role_key = any(requested_roles)
      and (ur.expires_at is null or ur.expires_at > now())
      and u.account_status = 'active'
      and (u.banned_until is null or u.banned_until <= now())
  );
$$;

revoke all on function public.authorize(text) from public;
revoke all on function public.has_app_role(text[]) from public;
grant execute on function public.authorize(text) to authenticated;
grant execute on function public.has_app_role(text[]) to authenticated;

drop policy if exists "Authenticated users can read roles" on public.app_roles;
create policy "Authenticated users can read roles" on public.app_roles
  for select to authenticated using (true);
drop policy if exists "Authenticated users can read permissions" on public.app_permissions;
create policy "Authenticated users can read permissions" on public.app_permissions
  for select to authenticated using (true);
drop policy if exists "Authenticated users can read role permissions" on public.role_permissions;
create policy "Authenticated users can read role permissions" on public.role_permissions
  for select to authenticated using (true);
drop policy if exists "Users and role managers can read assignments" on public.user_roles;
create policy "Users and role managers can read assignments" on public.user_roles
  for select to authenticated
  using (user_id = auth.uid() or public.authorize('role.manage'));

create table if not exists public.content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.portal_users(id) on delete cascade,
  entity_type text not null check (entity_type in ('forum_post', 'announcement', 'project', 'profile', 'application')),
  entity_id uuid not null,
  category text not null check (category in ('spam', 'harassment', 'misinformation', 'privacy', 'academic_integrity', 'other')),
  summary text not null check (char_length(summary) between 10 and 500),
  evidence jsonb not null default '{}'::jsonb,
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  assigned_to uuid references public.portal_users(id),
  resolution_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.moderation_actions (
  id bigint generated always as identity primary key,
  report_id uuid references public.content_reports(id) on delete set null,
  moderator_id uuid not null references public.portal_users(id),
  action text not null check (action in ('assigned', 'warned', 'hidden', 'restored', 'removed', 'suspended', 'resolved', 'dismissed')),
  target_type text not null,
  target_id uuid,
  reason text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.faculty_verification_requests (
  id uuid primary key default gen_random_uuid(),
  faculty_id uuid not null unique references public.portal_users(id) on delete cascade,
  department text,
  designation text,
  employee_reference text,
  evidence_url text,
  status text not null default 'pending' check (status in ('pending', 'reviewing', 'approved', 'rejected', 'changes_requested')),
  submitted_at timestamptz not null default now(),
  reviewed_by uuid references public.portal_users(id),
  reviewed_at timestamptz,
  review_note text,
  updated_at timestamptz not null default now()
);

alter table public.faculty_profiles
  add column if not exists bio text,
  add column if not exists office_location text,
  add column if not exists office_hours text,
  add column if not exists scholar_url text,
  add column if not exists orcid text,
  add column if not exists website_url text,
  add column if not exists verification_status text not null default 'pending';

alter table public.faculty_profiles drop constraint if exists faculty_profiles_verification_status_check;
alter table public.faculty_profiles add constraint faculty_profiles_verification_status_check
  check (verification_status in ('pending', 'reviewing', 'approved', 'rejected', 'changes_requested'));

create table if not exists public.skills (
  id bigint generated always as identity primary key,
  name text not null unique,
  category text not null default 'technical',
  created_at timestamptz not null default now()
);

create table if not exists public.user_skills (
  user_id uuid not null references public.portal_users(id) on delete cascade,
  skill_id bigint not null references public.skills(id) on delete cascade,
  proficiency smallint check (proficiency between 1 and 5),
  is_verified boolean not null default false,
  verified_by uuid references public.portal_users(id),
  created_at timestamptz not null default now(),
  primary key (user_id, skill_id)
);

create table if not exists public.project_requirements (
  project_id uuid not null references public.projects(id) on delete cascade,
  skill_id bigint not null references public.skills(id) on delete cascade,
  minimum_proficiency smallint check (minimum_proficiency between 1 and 5),
  is_required boolean not null default true,
  primary key (project_id, skill_id)
);

create table if not exists public.project_milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  due_at timestamptz,
  status text not null default 'planned' check (status in ('planned', 'active', 'completed', 'blocked')),
  created_by uuid not null references public.portal_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.application_status_history (
  id bigint generated always as identity primary key,
  application_id uuid not null references public.applications(id) on delete cascade,
  from_status text,
  to_status text not null,
  changed_by uuid references public.portal_users(id),
  note text,
  created_at timestamptz not null default now()
);

alter table public.content_reports enable row level security;
alter table public.moderation_actions enable row level security;
alter table public.faculty_verification_requests enable row level security;
alter table public.skills enable row level security;
alter table public.user_skills enable row level security;
alter table public.project_requirements enable row level security;
alter table public.project_milestones enable row level security;
alter table public.application_status_history enable row level security;

create policy "Members can create reports" on public.content_reports
  for insert to authenticated
  with check (reporter_id = auth.uid() and public.authorize('report.create'));
create policy "Reporters and moderators can read reports" on public.content_reports
  for select to authenticated
  using (reporter_id = auth.uid() or public.authorize('report.read'));
create policy "Moderators can update reports" on public.content_reports
  for update to authenticated
  using (public.authorize('report.resolve'))
  with check (public.authorize('report.resolve'));
create policy "Moderators can read actions" on public.moderation_actions
  for select to authenticated using (public.authorize('audit.read'));
create policy "Faculty can read own verification" on public.faculty_verification_requests
  for select to authenticated
  using (faculty_id = auth.uid() or public.authorize('faculty.verify'));
create policy "Faculty can submit verification" on public.faculty_verification_requests
  for insert to authenticated
  with check (faculty_id = auth.uid() and public.has_app_role(array['faculty']));
create policy "Verification team can update requests" on public.faculty_verification_requests
  for update to authenticated
  using (public.authorize('faculty.verify'))
  with check (public.authorize('faculty.verify'));
create policy "Members can read skills" on public.skills
  for select to authenticated using (true);
create policy "Members can read user skills" on public.user_skills
  for select to authenticated using (true);
create policy "Users can manage own skills" on public.user_skills
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Members can read project requirements" on public.project_requirements
  for select using (true);
create policy "Faculty manage project requirements" on public.project_requirements
  for all to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.faculty_id = auth.uid()))
  with check (exists (select 1 from public.projects p where p.id = project_id and p.faculty_id = auth.uid()));
create policy "Project participants read milestones" on public.project_milestones
  for select to authenticated
  using (
    exists (select 1 from public.projects p where p.id = project_id and p.faculty_id = auth.uid())
    or exists (
      select 1 from public.applications a
      where a.project_id = project_id and a.student_id = auth.uid() and a.status = 'accepted'
    )
  );
create policy "Faculty manage milestones" on public.project_milestones
  for all to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.faculty_id = auth.uid()))
  with check (
    created_by = auth.uid()
    and exists (select 1 from public.projects p where p.id = project_id and p.faculty_id = auth.uid())
  );
create policy "Application participants read history" on public.application_status_history
  for select to authenticated
  using (
    exists (
      select 1 from public.applications a
      join public.projects p on p.id = a.project_id
      where a.id = application_id
        and (a.student_id = auth.uid() or p.faculty_id = auth.uid())
    )
  );

create or replace function public.sync_primary_user_role()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.user_roles (user_id, role_key)
  values (new.id, new.role)
  on conflict (user_id, role_key) do nothing;
  return new;
end;
$$;
drop trigger if exists sync_primary_user_role on public.portal_users;
create trigger sync_primary_user_role after insert or update of role on public.portal_users
for each row execute procedure public.sync_primary_user_role();

create or replace function public.queue_faculty_verification()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.faculty_verification_requests (faculty_id, department, designation)
  select new.user_id, new.department, new.designation
  from public.portal_users u
  where u.id = new.user_id and u.role = 'faculty'
  on conflict (faculty_id) do nothing;
  return new;
end;
$$;
drop trigger if exists queue_faculty_verification on public.faculty_profiles;
create trigger queue_faculty_verification after insert on public.faculty_profiles
for each row execute procedure public.queue_faculty_verification();

insert into public.faculty_verification_requests (faculty_id, department, designation)
select u.id, fp.department, fp.designation
from public.portal_users u
join public.faculty_profiles fp on fp.user_id = u.id
where u.role = 'faculty' and u.account_status = 'pending'
on conflict (faculty_id) do nothing;

create or replace function public.assign_portal_role(target_id uuid, new_role text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.authorize('role.manage') then
    raise exception 'Role management permission required' using errcode = '42501';
  end if;
  if not exists (select 1 from public.app_roles where role_key = new_role) then
    raise exception 'Unknown role' using errcode = '22023';
  end if;
  insert into public.user_roles (user_id, role_key, assigned_by)
  values (target_id, new_role, auth.uid()) on conflict (user_id, role_key) do nothing;
  insert into public.admin_audit_log (admin_id, action, target_user_id, details)
  values (auth.uid(), 'role_assigned', target_id, jsonb_build_object('role', new_role));
end;
$$;

create or replace function public.resolve_content_report(
  target_report_id uuid, new_status text, selected_action text, note text
)
returns void language plpgsql security definer set search_path = '' as $$
declare target_record public.content_reports%rowtype;
begin
  if not public.authorize('report.resolve') then
    raise exception 'Moderation permission required' using errcode = '42501';
  end if;
  if new_status not in ('resolved', 'dismissed') then
    raise exception 'Invalid resolution status' using errcode = '22023';
  end if;
  select * into target_record from public.content_reports where id = target_report_id for update;
  if not found then raise exception 'Report not found' using errcode = 'P0002'; end if;
  update public.content_reports set
    status = new_status, assigned_to = auth.uid(), resolution_note = note,
    resolved_at = now(), updated_at = now()
  where id = target_report_id;
  insert into public.moderation_actions (
    report_id, moderator_id, action, target_type, target_id, reason
  ) values (
    target_report_id, auth.uid(), selected_action,
    target_record.entity_type, target_record.entity_id, note
  );
end;
$$;

create or replace function public.review_faculty_verification(
  request_id uuid, decision text, note text default null
)
returns void language plpgsql security definer set search_path = '' as $$
declare request_record public.faculty_verification_requests%rowtype;
begin
  if not public.authorize('faculty.verify') then
    raise exception 'Faculty verification permission required' using errcode = '42501';
  end if;
  if decision not in ('approved', 'rejected', 'changes_requested') then
    raise exception 'Invalid verification decision' using errcode = '22023';
  end if;
  select * into request_record from public.faculty_verification_requests where id = request_id for update;
  if not found then raise exception 'Verification request not found' using errcode = 'P0002'; end if;
  update public.faculty_verification_requests set
    status = decision, reviewed_by = auth.uid(), reviewed_at = now(),
    review_note = note, updated_at = now()
  where id = request_id;
  update public.faculty_profiles set verification_status = decision
  where user_id = request_record.faculty_id;
  update public.portal_users set
    account_status = case when decision = 'approved' then 'active' else account_status end,
    approved_by = case when decision = 'approved' then auth.uid() else approved_by end,
    approved_at = case when decision = 'approved' then now() else approved_at end,
    updated_at = now()
  where id = request_record.faculty_id;
  insert into public.moderation_actions (
    moderator_id, action, target_type, target_id, reason
  ) values (
    auth.uid(), case when decision = 'approved' then 'resolved' else 'dismissed' end,
    'faculty_verification', request_record.faculty_id, coalesce(note, decision)
  );
end;
$$;

create or replace function public.record_application_status_change()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if old.status is distinct from new.status then
    insert into public.application_status_history (
      application_id, from_status, to_status, changed_by
    ) values (new.id, old.status, new.status, auth.uid());
  end if;
  return new;
end;
$$;
drop trigger if exists record_application_status_change on public.applications;
create trigger record_application_status_change after update of status on public.applications
for each row execute procedure public.record_application_status_change();

revoke all on function public.assign_portal_role(uuid, text) from public;
revoke all on function public.resolve_content_report(uuid, text, text, text) from public;
revoke all on function public.review_faculty_verification(uuid, text, text) from public;
grant execute on function public.assign_portal_role(uuid, text) to authenticated;
grant execute on function public.resolve_content_report(uuid, text, text, text) to authenticated;
grant execute on function public.review_faculty_verification(uuid, text, text) to authenticated;

-- JWT claims carry a role snapshot for navigation; DB authorization remains authoritative.
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare claims jsonb; primary_role text; portal_status text; role_list jsonb;
begin
  select u.role, u.account_status into primary_role, portal_status
  from public.portal_users u where u.id = (event->>'user_id')::uuid;
  select coalesce(jsonb_agg(ur.role_key order by r.rank desc), '[]'::jsonb) into role_list
  from public.user_roles ur join public.app_roles r on r.role_key = ur.role_key
  where ur.user_id = (event->>'user_id')::uuid
    and (ur.expires_at is null or ur.expires_at > now());
  claims := event->'claims';
  claims := jsonb_set(claims, '{user_role}', to_jsonb(coalesce(primary_role, 'student')));
  claims := jsonb_set(claims, '{user_roles}', role_list);
  claims := jsonb_set(claims, '{account_status}', to_jsonb(coalesce(portal_status, 'pending')));
  return jsonb_build_object('claims', claims);
end;
$$;
grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook(jsonb) from authenticated, anon, public;

commit;
