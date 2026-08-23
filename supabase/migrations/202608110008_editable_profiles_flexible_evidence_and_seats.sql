-- Editable academic profiles, flexible project evidence, and transactional seat accounting.

alter table public.student_profiles
  add column if not exists department text,
  add column if not exists bio text,
  add column if not exists education text,
  add column if not exists contact_email text,
  add column if not exists website_url text,
  add column if not exists github_url text,
  add column if not exists linkedin_url text,
  add column if not exists cv_url text;

alter table public.faculty_profiles
  add column if not exists education text,
  add column if not exists contact_email text,
  add column if not exists github_url text,
  add column if not exists linkedin_url text,
  add column if not exists cv_url text;

alter table public.portal_users add column if not exists profile_completed_at timestamptz;
update public.portal_users set profile_completed_at = coalesce(profile_completed_at, now());

alter table public.student_profiles
  drop constraint if exists student_profiles_year_range,
  add constraint student_profiles_year_range check (year is null or year between 1 and 8),
  drop constraint if exists student_profiles_bio_length,
  add constraint student_profiles_bio_length check (bio is null or char_length(bio) <= 3000),
  drop constraint if exists student_profiles_education_length,
  add constraint student_profiles_education_length check (education is null or char_length(education) <= 3000);

alter table public.faculty_profiles
  drop constraint if exists faculty_profiles_bio_length,
  add constraint faculty_profiles_bio_length check (bio is null or char_length(bio) <= 3000),
  drop constraint if exists faculty_profiles_education_length,
  add constraint faculty_profiles_education_length check (education is null or char_length(education) <= 3000);

-- Profile writes are limited to the owner and to presentation fields. Canonical
-- email, role, account status, bans, and faculty verification remain immutable.
revoke update on public.portal_users from authenticated;
grant update (name) on public.portal_users to authenticated;
drop policy if exists "Users can update their own display name" on public.portal_users;
create policy "Users can update their own display name"
  on public.portal_users for update to authenticated
  using (
    id = auth.uid()
    and account_status in ('active', 'pending')
    and (banned_until is null or banned_until <= now())
  )
  with check (
    id = auth.uid()
    and account_status in ('active', 'pending')
    and (banned_until is null or banned_until <= now())
  );

revoke update on public.student_profiles from authenticated;
grant update (
  roll_number, course, year, department, bio, education, contact_email,
  website_url, github_url, linkedin_url, cv_url
) on public.student_profiles to authenticated;
drop policy if exists "Students update own academic profile" on public.student_profiles;
create policy "Students update own academic profile"
  on public.student_profiles for update to authenticated
  using (
    user_id = auth.uid()
    and exists (
      select 1 from public.portal_users account
      where account.id = auth.uid()
        and account.account_status in ('active', 'pending')
        and (account.banned_until is null or account.banned_until <= now())
    )
  )
  with check (user_id = auth.uid());

revoke update on public.faculty_profiles from authenticated;
grant update (
  department, designation, research_area, bio, education, contact_email,
  office_location, office_hours, scholar_url, orcid, website_url, github_url,
  linkedin_url, cv_url
) on public.faculty_profiles to authenticated;
drop policy if exists "Faculty update own public profile" on public.faculty_profiles;
create policy "Faculty update own public profile"
  on public.faculty_profiles for update to authenticated
  using (
    user_id = auth.uid()
    and exists (
      select 1 from public.portal_users account
      where account.id = auth.uid()
        and account.account_status in ('active', 'pending')
        and (account.banned_until is null or account.banned_until <= now())
    )
  )
  with check (user_id = auth.uid());

create or replace function public.mark_own_profile_complete()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.portal_users account
    where account.id = auth.uid()
      and account.account_status in ('active', 'pending')
      and (account.banned_until is null or account.banned_until <= now())
  ) then
    raise exception 'Profile completion is not allowed' using errcode = '42501';
  end if;

  update public.portal_users
  set profile_completed_at = now(),
      updated_at = now()
  where id = auth.uid();
end;
$$;

-- Project references may be a Drive/Docs URL, Word/PDF URL, portal-local path,
-- descriptive text, or NA. They are evidence references, not trusted URLs.
alter table public.projects drop constraint if exists projects_brief_url_format_check;
alter table public.projects drop constraint if exists projects_new_rows_require_brief;
alter table public.projects
  drop constraint if exists projects_brief_reference_length,
  add constraint projects_brief_reference_length
    check (brief_url is null or char_length(brief_url) between 1 and 700);

alter table public.applications drop constraint if exists applications_resume_url_format;
alter table public.applications
  drop constraint if exists applications_resume_reference_length,
  add constraint applications_resume_reference_length
    check (resume_url is null or char_length(resume_url) between 1 and 700);

alter table public.projects add column if not exists available_seats integer;

update public.projects project
set available_seats = greatest(
  project.max_students - (
    select count(*)::integer
    from public.applications application
    where application.project_id = project.id and application.status = 'accepted'
  ),
  0
)
where project.available_seats is null;

alter table public.projects alter column available_seats set not null;
alter table public.projects
  drop constraint if exists projects_available_seats_range,
  add constraint projects_available_seats_range
    check (available_seats between 0 and max_students);

create or replace function public.sync_project_available_seats()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  accepted_count integer;
begin
  if tg_op = 'INSERT' then
    new.available_seats := new.max_students;
    return new;
  end if;

  if new.max_students is distinct from old.max_students then
    select count(*)::integer into accepted_count
    from public.applications
    where project_id = new.id and status = 'accepted';

    if new.max_students < accepted_count then
      raise exception 'Capacity cannot be lower than accepted students' using errcode = '23514';
    end if;
    new.available_seats := new.max_students - accepted_count;
  end if;
  return new;
end;
$$;

drop trigger if exists sync_project_available_seats on public.projects;
create trigger sync_project_available_seats
before insert or update of max_students on public.projects
for each row execute procedure public.sync_project_available_seats();

drop policy if exists "Active students submit complete applications" on public.applications;
create policy "Active students submit complete applications"
  on public.applications for insert to authenticated
  with check (
    student_id = auth.uid()
    and public.has_portal_role(array['student'])
    and char_length(statement_of_purpose) between 100 and 3000
    and skills_summary is not null
    and char_length(skills_summary) between 40 and 1200
    and availability_hours between 1 and 40
    and google_form_response_url is not null
    and status = 'pending'
    and exists (
      select 1 from public.projects project
      where project.id = applications.project_id
        and project.status = 'open'
        and project.available_seats > 0
    )
  );

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
  target_project public.projects%rowtype;
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

  select * into target_project
  from public.projects
  where id = target_record.project_id
  for update;
  if not found then
    raise exception 'Project not found' using errcode = 'P0002';
  end if;
  if target_project.faculty_id is distinct from auth.uid() then
    raise exception 'Only the project owner can review this application' using errcode = '42501';
  end if;

  if target_record.status <> 'accepted' and new_status = 'accepted' then
    if target_project.available_seats <= 0 then
      raise exception 'No seats are available for this project' using errcode = '23514';
    end if;
    update public.projects
    set available_seats = available_seats - 1,
        updated_at = now()
    where id = target_project.id;
  elsif target_record.status = 'accepted' and new_status = 'rejected' then
    update public.projects
    set available_seats = least(max_students, available_seats + 1),
        updated_at = now()
    where id = target_project.id;
  end if;

  update public.applications
  set status = new_status,
      faculty_note = nullif(trim(coalesce(review_note, '')), ''),
      reviewed_at = now()
  where id = target_application_id;
end;
$$;

revoke all on function public.sync_project_available_seats() from public;
revoke all on function public.mark_own_profile_complete() from public;
revoke all on function public.review_project_application(uuid, text, text) from public;
grant execute on function public.mark_own_profile_complete() to authenticated;
grant execute on function public.review_project_application(uuid, text, text) to authenticated;
