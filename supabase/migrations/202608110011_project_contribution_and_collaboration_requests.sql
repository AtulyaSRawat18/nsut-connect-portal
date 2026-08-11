-- Separate non-seat student contribution and faculty collaboration workflows.

begin;

insert into public.app_permissions (permission_key, resource, action, description) values
  ('contribution.create', 'project_contribution', 'create', 'Request a non-seat contribution after student vacancies are filled.'),
  ('contribution.read.own', 'project_contribution', 'read_own', 'Read caller contribution requests.'),
  ('contribution.review', 'project_contribution', 'review', 'Review contribution requests for owned projects.'),
  ('collaboration.create', 'faculty_collaboration', 'create', 'Request faculty collaboration on another faculty member project.'),
  ('collaboration.read.own', 'faculty_collaboration', 'read_own', 'Read caller faculty collaboration requests.'),
  ('collaboration.review', 'faculty_collaboration', 'review', 'Review faculty collaboration requests for owned projects.')
on conflict (permission_key) do update set
  resource = excluded.resource,
  action = excluded.action,
  description = excluded.description;

insert into public.role_permissions (role_key, permission_key) values
  ('student', 'contribution.create'),
  ('student', 'contribution.read.own'),
  ('faculty', 'contribution.review'),
  ('faculty', 'collaboration.create'),
  ('faculty', 'collaboration.read.own'),
  ('faculty', 'collaboration.review'),
  ('admin', 'contribution.create'),
  ('admin', 'contribution.read.own'),
  ('admin', 'contribution.review'),
  ('admin', 'collaboration.create'),
  ('admin', 'collaboration.read.own'),
  ('admin', 'collaboration.review')
on conflict do nothing;

create table if not exists public.project_contribution_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  student_id uuid not null references public.portal_users(id) on delete cascade,
  contribution_statement text not null check (char_length(contribution_statement) between 80 and 2500),
  skills_summary text not null check (char_length(skills_summary) between 40 and 1200),
  availability_hours smallint not null check (availability_hours between 1 and 40),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  faculty_note text check (faculty_note is null or char_length(faculty_note) <= 1000),
  reviewed_by uuid references public.portal_users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, student_id)
);

create table if not exists public.faculty_collaboration_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  requester_faculty_id uuid not null references public.portal_users(id) on delete cascade,
  collaboration_type text not null check (collaboration_type in ('research', 'methodology', 'facilities', 'data', 'co_supervision', 'publication', 'other')),
  proposal text not null check (char_length(proposal) between 80 and 3000),
  expertise_summary text not null check (char_length(expertise_summary) between 40 and 1200),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  owner_note text check (owner_note is null or char_length(owner_note) <= 1000),
  reviewed_by uuid references public.portal_users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, requester_faculty_id)
);

create index if not exists project_contribution_requests_project_status_idx
  on public.project_contribution_requests(project_id, status, created_at desc);
create index if not exists project_contribution_requests_student_idx
  on public.project_contribution_requests(student_id, created_at desc);
create index if not exists faculty_collaboration_requests_project_status_idx
  on public.faculty_collaboration_requests(project_id, status, created_at desc);
create index if not exists faculty_collaboration_requests_requester_idx
  on public.faculty_collaboration_requests(requester_faculty_id, created_at desc);

alter table public.project_contribution_requests enable row level security;
alter table public.faculty_collaboration_requests enable row level security;

revoke all on public.project_contribution_requests from anon, authenticated;
revoke all on public.faculty_collaboration_requests from anon, authenticated;
grant select, insert on public.project_contribution_requests to authenticated;
grant select, insert on public.faculty_collaboration_requests to authenticated;

drop policy if exists "Contribution participants can read requests" on public.project_contribution_requests;
create policy "Contribution participants can read requests"
  on public.project_contribution_requests for select to authenticated
  using (
    (student_id = auth.uid() and public.authorize('contribution.read.own'))
    or (
      public.authorize('contribution.review')
      and exists (
        select 1 from public.projects project
        where project.id = project_contribution_requests.project_id and project.faculty_id = auth.uid()
      )
    )
  );

drop policy if exists "Students request contribution after seats fill" on public.project_contribution_requests;
create policy "Students request contribution after seats fill"
  on public.project_contribution_requests for insert to authenticated
  with check (
    student_id = auth.uid()
    and status = 'pending'
    and faculty_note is null
    and reviewed_by is null
    and reviewed_at is null
    and public.authorize('contribution.create')
    and exists (
      select 1 from public.projects project
      where project.id = project_contribution_requests.project_id
        and project.status = 'open'
        and project.available_seats = 0
        and project.faculty_id <> auth.uid()
    )
    and not exists (
      select 1 from public.applications application
      where application.project_id = project_contribution_requests.project_id and application.student_id = auth.uid()
    )
  );

drop policy if exists "Faculty collaboration participants read requests" on public.faculty_collaboration_requests;
create policy "Faculty collaboration participants read requests"
  on public.faculty_collaboration_requests for select to authenticated
  using (
    (requester_faculty_id = auth.uid() and public.authorize('collaboration.read.own'))
    or (
      public.authorize('collaboration.review')
      and exists (
        select 1 from public.projects project
        where project.id = faculty_collaboration_requests.project_id and project.faculty_id = auth.uid()
      )
    )
  );

drop policy if exists "Faculty request collaboration on other projects" on public.faculty_collaboration_requests;
create policy "Faculty request collaboration on other projects"
  on public.faculty_collaboration_requests for insert to authenticated
  with check (
    requester_faculty_id = auth.uid()
    and status = 'pending'
    and owner_note is null
    and reviewed_by is null
    and reviewed_at is null
    and public.authorize('collaboration.create')
    and exists (
      select 1 from public.projects project
      where project.id = faculty_collaboration_requests.project_id
        and project.status = 'open'
        and project.faculty_id <> auth.uid()
    )
  );

create or replace function public.review_project_contribution_request(
  target_request_id uuid,
  new_status text,
  review_note text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_record public.project_contribution_requests%rowtype;
begin
  if not public.authorize('contribution.review') then
    raise exception 'Contribution review permission required' using errcode = '42501';
  end if;
  if new_status not in ('accepted', 'rejected') then
    raise exception 'Invalid contribution decision' using errcode = '22023';
  end if;
  if new_status = 'rejected' and char_length(trim(coalesce(review_note, ''))) < 3 then
    raise exception 'A rejection note is required' using errcode = '22023';
  end if;

  select request.* into target_record
  from public.project_contribution_requests request
  where request.id = target_request_id
  for update;
  if not found then raise exception 'Contribution request not found' using errcode = 'P0002'; end if;
  if not exists (
    select 1 from public.projects project
    where project.id = target_record.project_id and project.faculty_id = auth.uid()
  ) then
    raise exception 'Only the project owner can review this request' using errcode = '42501';
  end if;

  update public.project_contribution_requests
  set status = new_status,
      faculty_note = nullif(trim(coalesce(review_note, '')), ''),
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      updated_at = now()
  where id = target_request_id;
end;
$$;

create or replace function public.review_faculty_collaboration_request(
  target_request_id uuid,
  new_status text,
  review_note text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_record public.faculty_collaboration_requests%rowtype;
begin
  if not public.authorize('collaboration.review') then
    raise exception 'Collaboration review permission required' using errcode = '42501';
  end if;
  if new_status not in ('accepted', 'rejected') then
    raise exception 'Invalid collaboration decision' using errcode = '22023';
  end if;
  if new_status = 'rejected' and char_length(trim(coalesce(review_note, ''))) < 3 then
    raise exception 'A rejection note is required' using errcode = '22023';
  end if;

  select request.* into target_record
  from public.faculty_collaboration_requests request
  where request.id = target_request_id
  for update;
  if not found then raise exception 'Collaboration request not found' using errcode = 'P0002'; end if;
  if not exists (
    select 1 from public.projects project
    where project.id = target_record.project_id and project.faculty_id = auth.uid()
  ) then
    raise exception 'Only the project owner can review this request' using errcode = '42501';
  end if;

  update public.faculty_collaboration_requests
  set status = new_status,
      owner_note = nullif(trim(coalesce(review_note, '')), ''),
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      updated_at = now()
  where id = target_request_id;
end;
$$;

revoke all on function public.review_project_contribution_request(uuid, text, text) from public;
revoke all on function public.review_faculty_collaboration_request(uuid, text, text) from public;
grant execute on function public.review_project_contribution_request(uuid, text, text) to authenticated;
grant execute on function public.review_faculty_collaboration_request(uuid, text, text) to authenticated;

commit;
