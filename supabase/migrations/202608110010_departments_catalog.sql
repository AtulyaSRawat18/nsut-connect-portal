-- Canonical NSUT department catalogue across Main, East, West, and campus-neutral units.

create table if not exists public.departments (
  id text primary key,
  name text not null,
  short_name text not null,
  campus text check (campus is null or campus in ('Main', 'East', 'West')),
  sort_order smallint not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.departments (id, name, short_name, campus, sort_order) values
  ('biological-sciences-engineering-main', 'Biological Sciences & Engineering', 'BSE', 'Main', 1),
  ('chemistry-main', 'Chemistry', 'Chemistry', 'Main', 2),
  ('civil-engineering-west', 'Civil Engineering', 'Civil', 'West', 3),
  ('computer-science-engineering-main', 'Computer Science & Engineering', 'CSE', 'Main', 4),
  ('computer-science-engineering-east', 'Computer Science & Engineering', 'CSE', 'East', 5),
  ('electrical-engineering-main', 'Electrical Engineering', 'EE', 'Main', 6),
  ('electronics-communication-engineering-main', 'Electronics & Communication Engineering', 'ECE', 'Main', 7),
  ('electronics-communication-engineering-east', 'Electronics & Communication Engineering', 'ECE', 'East', 8),
  ('humanities-social-sciences-main', 'Humanities & Social Sciences', 'HSS', 'Main', 9),
  ('humanities-social-sciences-east', 'Humanities & Social Sciences', 'HSS', 'East', 10),
  ('information-technology-main', 'Information Technology', 'IT', 'Main', 11),
  ('instrumentation-control-engineering-main', 'Instrumentation & Control Engineering', 'ICE', 'Main', 12),
  ('management-studies-main', 'Management Studies', 'Management', 'Main', 13),
  ('mathematics-main', 'Mathematics', 'Mathematics', 'Main', 14),
  ('mechanical-engineering-main', 'Mechanical Engineering', 'Mechanical', 'Main', 15),
  ('mechanical-engineering-west', 'Mechanical Engineering', 'Mechanical', 'West', 16),
  ('physics-main', 'Physics', 'Physics', 'Main', 17),
  ('personality-development', 'Personality Development', 'Personality Development', null, 18),
  ('design', 'Design', 'Design', null, 19),
  ('architecture-planning', 'Architecture & Planning', 'Architecture', null, 20),
  ('innovation-entrepreneurship-venture-development', 'Innovation, Entrepreneurship & Venture Development (IEV)', 'IEV', null, 21),
  ('geoinformatics-west', 'Geoinformatics', 'Geoinformatics', 'West', 22)
on conflict (id) do update set
  name = excluded.name,
  short_name = excluded.short_name,
  campus = excluded.campus,
  sort_order = excluded.sort_order,
  is_active = true,
  updated_at = now();

alter table public.departments enable row level security;
drop policy if exists "Departments are publicly readable" on public.departments;
create policy "Departments are publicly readable"
  on public.departments for select to anon, authenticated using (is_active);
revoke all on public.departments from anon, authenticated;
grant select on public.departments to anon, authenticated;

alter table public.student_profiles add column if not exists department text;
alter table public.announcements add column if not exists department text;
alter table public.highlights add column if not exists department text;

alter table public.projects drop constraint if exists projects_department_check;
alter table public.forum_posts drop constraint if exists forum_posts_department_check;

update public.projects set department = case department
  when 'BT' then 'biological-sciences-engineering-main'
  when 'CIVIL' then 'civil-engineering-west'
  when 'CSE' then 'computer-science-engineering-main'
  when 'ECE' then 'electronics-communication-engineering-main'
  when 'ICE' then 'instrumentation-control-engineering-main'
  when 'IT' then 'information-technology-main'
  when 'MAC' then 'mathematics-main'
  when 'MECH' then 'mechanical-engineering-main'
  when 'BBA' then 'management-studies-main'
  else department end;

update public.forum_posts set department = case department
  when 'BT' then 'biological-sciences-engineering-main'
  when 'CIVIL' then 'civil-engineering-west'
  when 'CSE' then 'computer-science-engineering-main'
  when 'ECE' then 'electronics-communication-engineering-main'
  when 'ICE' then 'instrumentation-control-engineering-main'
  when 'IT' then 'information-technology-main'
  when 'MAC' then 'mathematics-main'
  when 'MECH' then 'mechanical-engineering-main'
  when 'BBA' then 'management-studies-main'
  else department end;

update public.faculty_profiles set department = case department
  when 'BT' then 'biological-sciences-engineering-main'
  when 'CIVIL' then 'civil-engineering-west'
  when 'CSE' then 'computer-science-engineering-main'
  when 'ECE' then 'electronics-communication-engineering-main'
  when 'ICE' then 'instrumentation-control-engineering-main'
  when 'IT' then 'information-technology-main'
  when 'MAC' then 'mathematics-main'
  when 'MECH' then 'mechanical-engineering-main'
  when 'BBA' then 'management-studies-main'
  else department end;

update public.student_profiles set department = case department
  when 'BT' then 'biological-sciences-engineering-main'
  when 'CIVIL' then 'civil-engineering-west'
  when 'CSE' then 'computer-science-engineering-main'
  when 'ECE' then 'electronics-communication-engineering-main'
  when 'ICE' then 'instrumentation-control-engineering-main'
  when 'IT' then 'information-technology-main'
  when 'MAC' then 'mathematics-main'
  when 'MECH' then 'mechanical-engineering-main'
  when 'BBA' then 'management-studies-main'
  else department end;

update public.faculty_verification_requests set department = case department
  when 'BT' then 'biological-sciences-engineering-main'
  when 'CIVIL' then 'civil-engineering-west'
  when 'CSE' then 'computer-science-engineering-main'
  when 'ECE' then 'electronics-communication-engineering-main'
  when 'ICE' then 'instrumentation-control-engineering-main'
  when 'IT' then 'information-technology-main'
  when 'MAC' then 'mathematics-main'
  when 'MECH' then 'mechanical-engineering-main'
  when 'BBA' then 'management-studies-main'
  else department end;

update public.profiles set department = case department
  when 'BT' then 'biological-sciences-engineering-main'
  when 'CIVIL' then 'civil-engineering-west'
  when 'CSE' then 'computer-science-engineering-main'
  when 'ECE' then 'electronics-communication-engineering-main'
  when 'ICE' then 'instrumentation-control-engineering-main'
  when 'IT' then 'information-technology-main'
  when 'MAC' then 'mathematics-main'
  when 'MECH' then 'mechanical-engineering-main'
  when 'BBA' then 'management-studies-main'
  else department end;

alter table public.projects drop constraint if exists projects_department_fkey;
alter table public.projects add constraint projects_department_fkey foreign key (department) references public.departments(id);
alter table public.forum_posts drop constraint if exists forum_posts_department_fkey;
alter table public.forum_posts add constraint forum_posts_department_fkey foreign key (department) references public.departments(id);
alter table public.faculty_profiles drop constraint if exists faculty_profiles_department_fkey;
alter table public.faculty_profiles add constraint faculty_profiles_department_fkey foreign key (department) references public.departments(id);
alter table public.student_profiles drop constraint if exists student_profiles_department_fkey;
alter table public.student_profiles add constraint student_profiles_department_fkey foreign key (department) references public.departments(id);
alter table public.faculty_verification_requests drop constraint if exists faculty_verification_requests_department_fkey;
alter table public.faculty_verification_requests add constraint faculty_verification_requests_department_fkey foreign key (department) references public.departments(id);
alter table public.announcements drop constraint if exists announcements_department_fkey;
alter table public.announcements add constraint announcements_department_fkey foreign key (department) references public.departments(id);
alter table public.highlights drop constraint if exists highlights_department_fkey;
alter table public.highlights add constraint highlights_department_fkey foreign key (department) references public.departments(id);

create index if not exists projects_department_idx on public.projects(department);
create index if not exists forum_posts_department_idx on public.forum_posts(department);
create index if not exists faculty_profiles_department_idx on public.faculty_profiles(department);
create index if not exists announcements_department_idx on public.announcements(department);
create index if not exists highlights_department_idx on public.highlights(department);
