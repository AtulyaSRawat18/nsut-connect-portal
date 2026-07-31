-- JWT/RBAC foundation inspired by the Nalum backend.
-- Supabase Auth owns passwords, access-token JWTs, refresh rotation and revocation.
-- public.portal_users is the authoritative application authorization record.

begin;

alter table public.portal_users
  drop constraint if exists portal_users_role_check;

alter table public.portal_users
  add constraint portal_users_role_check
  check (role in ('student', 'faculty', 'admin'));

alter table public.portal_users
  add column if not exists account_status text not null default 'active',
  add column if not exists banned_until timestamptz,
  add column if not exists ban_reason text,
  add column if not exists approved_at timestamptz,
  add column if not exists approved_by uuid references public.portal_users(id),
  add column if not exists updated_at timestamptz not null default now();

alter table public.portal_users
  drop constraint if exists portal_users_account_status_check;

alter table public.portal_users
  add constraint portal_users_account_status_check
  check (account_status in ('pending', 'active', 'suspended'));

-- Backfill the canonical record from the original profiles table.
insert into public.portal_users (id, name, email, role, is_content_handler, account_status)
select
  p.id,
  coalesce(nullif(p.full_name, ''), split_part(p.email, '@', 1)),
  lower(p.email),
  case when p.role in ('student', 'faculty', 'admin') then p.role else 'student' end,
  coalesce(p.is_content_handler, false),
  'active'
from public.profiles p
on conflict (id) do nothing;

-- Keep compatibility with tables that still reference profiles while all new
-- application code and JWT claims use portal_users.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_role text;
  display_name text;
begin
  requested_role := case
    when new.raw_user_meta_data->>'role' = 'faculty' then 'faculty'
    else 'student'
  end;
  display_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    split_part(new.email, '@', 1)
  );

  insert into public.profiles (
    id, email, nsut_roll_number, full_name, role, is_content_handler
  ) values (
    new.id,
    lower(new.email),
    nullif(new.raw_user_meta_data->>'roll_number', ''),
    display_name,
    requested_role,
    false
  ) on conflict (id) do nothing;

  insert into public.portal_users (
    id, name, email, role, is_content_handler, account_status
  ) values (
    new.id,
    display_name,
    lower(new.email),
    requested_role,
    false,
    case when requested_role = 'faculty' then 'pending' else 'active' end
  ) on conflict (id) do nothing;

  if requested_role = 'faculty' then
    insert into public.faculty_profiles (user_id, department, designation)
    values (
      new.id,
      nullif(new.raw_user_meta_data->>'department', ''),
      nullif(new.raw_user_meta_data->>'designation', '')
    ) on conflict (user_id) do nothing;
  else
    insert into public.student_profiles (user_id, roll_number, course, year)
    values (
      new.id,
      nullif(new.raw_user_meta_data->>'roll_number', ''),
      nullif(new.raw_user_meta_data->>'course', ''),
      case
        when new.raw_user_meta_data->>'year' ~ '^[1-8]$'
          then (new.raw_user_meta_data->>'year')::integer
        else null
      end
    ) on conflict (user_id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists on_auth_user_created_v2 on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Add relationships for PostgREST joins while legacy profile FKs are phased out.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'projects_faculty_portal_user_fkey') then
    alter table public.projects add constraint projects_faculty_portal_user_fkey
      foreign key (faculty_id) references public.portal_users(id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'applications_student_portal_user_fkey') then
    alter table public.applications add constraint applications_student_portal_user_fkey
      foreign key (student_id) references public.portal_users(id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'announcements_author_portal_user_fkey') then
    alter table public.announcements add constraint announcements_author_portal_user_fkey
      foreign key (author_id) references public.portal_users(id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'forum_posts_author_portal_user_fkey') then
    alter table public.forum_posts add constraint forum_posts_author_portal_user_fkey
      foreign key (author_id) references public.portal_users(id);
  end if;
end $$;

create or replace function public.is_active_member(member_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.portal_users u
    where u.id = member_id
      and u.account_status = 'active'
      and (u.banned_until is null or u.banned_until <= now())
  );
$$;

create or replace function public.has_portal_role(required_roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.portal_users u
    where u.id = auth.uid()
      and u.role = any(required_roles)
      and u.account_status = 'active'
      and (u.banned_until is null or u.banned_until <= now())
  );
$$;

revoke all on function public.is_active_member(uuid) from public;
revoke all on function public.has_portal_role(text[]) from public;
grant execute on function public.is_active_member(uuid) to authenticated;
grant execute on function public.has_portal_role(text[]) to authenticated;

-- A role is never accepted from mutable user metadata. This hook reads the
-- authoritative DB record and places it in newly issued access-token JWTs.
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  claims jsonb;
  portal_role text;
  portal_status text;
  content_handler boolean;
begin
  select role, account_status, is_content_handler
    into portal_role, portal_status, content_handler
  from public.portal_users
  where id = (event->>'user_id')::uuid;

  claims := event->'claims';
  claims := jsonb_set(claims, '{user_role}', to_jsonb(coalesce(portal_role, 'student')));
  claims := jsonb_set(claims, '{account_status}', to_jsonb(coalesce(portal_status, 'pending')));
  claims := jsonb_set(claims, '{is_content_handler}', to_jsonb(coalesce(content_handler, false)));
  return jsonb_build_object('claims', claims);
end;
$$;

grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook(jsonb) from authenticated, anon, public;

-- Users may edit their display name, but never their role, status or ban fields.
revoke update on public.portal_users from authenticated;
grant update (name) on public.portal_users to authenticated;

drop policy if exists "Users can view their own record" on public.portal_users;
drop policy if exists "Portal users are visible to active members" on public.portal_users;
drop policy if exists "Users can update their own display name" on public.portal_users;
create policy "Portal users are visible to active members"
  on public.portal_users for select to authenticated
  using (
    id = auth.uid()
    or (account_status = 'active' and public.is_active_member())
    or public.has_portal_role(array['admin'])
  );
create policy "Users can update their own display name"
  on public.portal_users for update to authenticated
  using (id = auth.uid() and public.is_active_member())
  with check (id = auth.uid() and public.is_active_member());

drop policy if exists "Content Handlers can insert projects" on public.projects;
drop policy if exists "Active faculty can create projects" on public.projects;
drop policy if exists "Faculty can update their own projects" on public.projects;
create policy "Active faculty can create projects"
  on public.projects for insert to authenticated
  with check (
    faculty_id = auth.uid()
    and public.has_portal_role(array['faculty', 'admin'])
  );
create policy "Faculty can update their own projects"
  on public.projects for update to authenticated
  using (faculty_id = auth.uid() and public.is_active_member())
  with check (faculty_id = auth.uid() and public.is_active_member());

drop policy if exists "Students can insert their own applications" on public.applications;
drop policy if exists "Active students can apply to open projects" on public.applications;
drop policy if exists "Faculty can update application status" on public.applications;
drop policy if exists "Project faculty can update application status" on public.applications;
create policy "Active students can apply to open projects"
  on public.applications for insert to authenticated
  with check (
    student_id = auth.uid()
    and public.has_portal_role(array['student'])
    and exists (
      select 1 from public.projects p
      where p.id = project_id and p.status = 'open'
    )
  );
create policy "Project faculty can update application status"
  on public.applications for update to authenticated
  using (
    public.is_active_member()
    and exists (
      select 1 from public.projects p
      where p.id = project_id and p.faculty_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.faculty_id = auth.uid()
    )
  );

drop policy if exists "Only admin/faculty can create announcements" on public.announcements;
drop policy if exists "Active faculty can create announcements" on public.announcements;
create policy "Active faculty can create announcements"
  on public.announcements for insert to authenticated
  with check (
    author_id = auth.uid()
    and public.has_portal_role(array['faculty', 'admin'])
  );

drop policy if exists "Content Handlers can insert highlights" on public.highlights;
drop policy if exists "Content handlers can create highlights" on public.highlights;
create policy "Content handlers can create highlights"
  on public.highlights for insert to authenticated
  with check (
    exists (
      select 1 from public.portal_users u
      where u.id = auth.uid()
        and u.account_status = 'active'
        and (u.role in ('faculty', 'admin') or u.is_content_handler)
    )
  );

drop policy if exists "Authenticated users can create forum posts" on public.forum_posts;
drop policy if exists "Active members can create forum posts" on public.forum_posts;
create policy "Active members can create forum posts"
  on public.forum_posts for insert to authenticated
  with check (author_id = auth.uid() and public.is_active_member());

drop policy if exists "Faculty can view applicants resumes" on storage.objects;
drop policy if exists "Project faculty can view applicant resumes" on storage.objects;
create policy "Project faculty can view applicant resumes"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'resumes'
    and exists (
      select 1
      from public.applications a
      join public.projects p on p.id = a.project_id
      where p.faculty_id = auth.uid()
        and a.student_id::text = (storage.foldername(name))[1]
    )
  );

create table if not exists public.admin_audit_log (
  id bigint generated always as identity primary key,
  admin_id uuid not null references public.portal_users(id),
  action text not null,
  target_user_id uuid references public.portal_users(id),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.admin_audit_log enable row level security;

drop policy if exists "Admins can read audit log" on public.admin_audit_log;
create policy "Admins can read audit log"
  on public.admin_audit_log for select to authenticated
  using (public.has_portal_role(array['admin']));

create or replace function public.admin_set_account_status(
  target_id uuid,
  new_status text,
  reason text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.has_portal_role(array['admin']) then
    raise exception 'Admin privileges required' using errcode = '42501';
  end if;
  if new_status not in ('pending', 'active', 'suspended') then
    raise exception 'Invalid account status' using errcode = '22023';
  end if;

  update public.portal_users
  set
    account_status = new_status,
    ban_reason = case when new_status = 'suspended' then reason else null end,
    approved_at = case when new_status = 'active' then now() else approved_at end,
    approved_by = case when new_status = 'active' then auth.uid() else approved_by end,
    updated_at = now()
  where id = target_id;

  if not found then
    raise exception 'Portal user not found' using errcode = 'P0002';
  end if;

  insert into public.admin_audit_log (admin_id, action, target_user_id, details)
  values (
    auth.uid(),
    'account_status_changed',
    target_id,
    jsonb_build_object('new_status', new_status, 'reason', reason)
  );
end;
$$;

revoke all on function public.admin_set_account_status(uuid, text, text) from public;
grant execute on function public.admin_set_account_status(uuid, text, text) to authenticated;

commit;
