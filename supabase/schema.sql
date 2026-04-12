-- Core Portal Database Schema

-- 1. Create a table for Institutional Profiles
create table profiles (
  id uuid references auth.users not null primary key,
  email text not null,
  nsut_roll_number text unique,
  role text check (role in ('student', 'faculty', 'admin')) default 'student',
  full_name text,
  department text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Turn on RLS for strict student/faculty security isolation
alter table profiles enable row level security;

-- 3. Create granular RLS policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- 4. Server-Side Function triggering upon Auth Registration (NSUT Mail + Roll Number)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, nsut_roll_number, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data->>'email',
    new.raw_user_meta_data->>'roll_number',
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$;

-- 5. Trigger deployment
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. Create Projects Table
create table projects (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  department text check (department in ('CSE', 'ECE', 'IT', 'MAC', 'ICE', 'MECH', 'CIVIL', 'BT', 'BBA')) not null,
  status text check (status in ('open', 'closed')) default 'open',
  faculty_id uuid references public.profiles(id) not null,
  max_students integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table projects enable row level security;

create policy "Projects are viewable by everyone."
  on projects for select using (true);

create policy "Only faculty can insert projects"
  on projects for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'faculty'
    )
  );

create policy "Faculty can update their own projects"
  on projects for update
  using (
    faculty_id = auth.uid()
  );

-- 7. Create Applications Table
create table applications (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) not null,
  student_id uuid references public.profiles(id) not null,
  statement_of_purpose text not null,
  resume_url text, -- Storage bucket URL
  status text check (status in ('pending', 'accepted', 'rejected')) default 'pending',
  applied_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (project_id, student_id) -- Prevent multiple applications per project
);

alter table applications enable row level security;

create policy "Students can view their own applications"
  on applications for select
  using (student_id = auth.uid());

create policy "Faculty can view applications for their projects"
  on applications for select
  using (
    exists (
      select 1 from projects
      where projects.id = applications.project_id and projects.faculty_id = auth.uid()
    )
  );

create policy "Students can insert their own applications"
  on applications for insert
  with check (
    student_id = auth.uid() and
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'student'
    )
  );

create policy "Faculty can update application status"
  on applications for update
  using (
    exists (
      select 1 from projects
      where projects.id = applications.project_id and projects.faculty_id = auth.uid()
    )
  );

-- 8. Create Publications Table
create table publications (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  authors text[] not null,
  published_date date,
  url text,
  faculty_id uuid references public.profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table publications enable row level security;

create policy "Publications are viewable by everyone"
  on publications for select using (true);

create policy "Faculty can manage their own publications"
  on publications for all
  using (faculty_id = auth.uid());

-- 9. Storage for Resumes
insert into storage.buckets (id, name, public) 
values ('resumes', 'resumes', false);

create policy "Students can upload their own resumes"
  on storage.objects for insert
  with check ( bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text );

create policy "Students can view their own resumes"
  on storage.objects for select
  using ( bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text );

create policy "Faculty can view applicants resumes"
  on storage.objects for select
  using ( bucket_id = 'resumes' );

-- 10. Create Forum Posts Table
create table forum_posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  author_id uuid references public.profiles(id) not null,
  department text check (department in ('CSE', 'ECE', 'IT', 'MAC', 'ICE', 'MECH', 'CIVIL', 'BT', 'BBA')),
  upvotes integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table forum_posts enable row level security;

create policy "Forum posts are viewable by everyone"
  on forum_posts for select using (true);

create policy "Authenticated users can create forum posts"
  on forum_posts for insert
  with check (auth.uid() = author_id);

-- 11. Create Announcements (News) Table
create table announcements (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  author_id uuid references public.profiles(id) not null,
  category text default 'general',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table announcements enable row level security;

create policy "Announcements are viewable by everyone"
  on announcements for select using (true);

create policy "Only admin/faculty can create announcements"
  on announcements for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role in ('admin', 'faculty')
    )
  );

-- 12. Create Highlights (What's New / Deals) Table
create table highlights (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  type text check (type in ('internship', 'scholarship', 'event', 'highlight')) not null,
  link_url text,
  deadline date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table highlights enable row level security;

create policy "Highlights are viewable by everyone"
  on highlights for select using (true);


