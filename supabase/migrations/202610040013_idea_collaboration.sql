-- IDea: public interest spaces, opt-in discovery, private saved connections.
begin;
create table public.idea_topics (
  id text primary key,
  title text not null,
  category text not null
);
insert into public.idea_topics (id, title, category) values
  ('ml-research', 'ML Research', 'Computing & AI'),
  ('generative-ai', 'Generative AI & Language', 'Computing & AI'),
  ('computer-vision', 'Computer Vision', 'Computing & AI'),
  ('edge-ai', 'Edge AI & TinyML', 'Computing & AI'),
  ('ai-quant', 'AI & Quantitative Finance', 'Finance & Mathematics'),
  ('applied-mathematics', 'Applied Mathematics', 'Finance & Mathematics'),
  ('quantum-computing', 'Quantum Computing', 'Quantum & Photonics'),
  ('quantum-communications', 'Quantum Communication', 'Quantum & Photonics'),
  ('photonics', 'Photonics & Optical Devices', 'Quantum & Photonics'),
  ('space-tech', 'Space Technology', 'Space & Communications'),
  ('fsoc', 'Free-Space Optical Communication', 'Space & Communications'),
  ('wireless-6g', 'Wireless & 6G', 'Space & Communications'),
  ('bioinformatics', 'Bioinformatics & Genomics', 'Bio & Health'),
  ('biomedical', 'Biomedical Engineering', 'Bio & Health'),
  ('synthetic-biology', 'Synthetic Biology', 'Bio & Health'),
  ('civil-structures', 'Civil & Structural Engineering', 'Civil & Environment'),
  ('water-climate', 'Water & Climate', 'Civil & Environment'),
  ('geospatial', 'Geospatial & Earth Observation', 'Civil & Environment'),
  ('robotics', 'Robotics & Autonomy', 'Robotics & Hardware'),
  ('drones', 'Drones & Aerial Systems', 'Robotics & Hardware'),
  ('vlsi', 'VLSI & Embedded Systems', 'Robotics & Hardware'),
  ('energy', 'Clean Energy & Storage', 'Energy & Materials'),
  ('materials', 'Advanced Materials', 'Energy & Materials'),
  ('fluid-thermal', 'Fluid & Thermal Engineering', 'Energy & Materials');

insert into public.app_permissions (permission_key, resource, action, description)
values ('idea.participate', 'idea', 'participate', 'Join interest spaces, save connections, and publish IDea discussions')
on conflict do nothing;
insert into public.role_permissions (role_key, permission_key)
select role_key, 'idea.participate' from public.app_roles
where role_key in ('student', 'faculty', 'moderator', 'admin')
on conflict do nothing;

create table public.idea_memberships (
  user_id uuid not null references public.portal_users(id) on delete cascade,
  topic_id text not null references public.idea_topics(id),
  created_at timestamptz not null default now(),
  primary key (user_id, topic_id)
);
create index idea_memberships_topic_idx on public.idea_memberships(topic_id, user_id);
create table public.idea_connections (
  user_id uuid not null references public.portal_users(id) on delete cascade,
  target_id uuid not null references public.portal_users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, target_id),
  check (user_id <> target_id)
);
alter table public.idea_topics enable row level security;
alter table public.idea_memberships enable row level security;
alter table public.idea_connections enable row level security;
create policy "Read idea catalogue" on public.idea_topics for select using (true);
create policy "Read active opt-in members" on public.idea_memberships for select to authenticated
  using (public.is_active_member(user_id) and public.is_active_member());
create policy "Join as yourself" on public.idea_memberships for insert to authenticated
  with check (user_id = auth.uid() and public.authorize('idea.participate'));
create policy "Leave own interests" on public.idea_memberships for delete to authenticated
  using (user_id = auth.uid() and public.authorize('idea.participate'));
create policy "Read own connections" on public.idea_connections for select to authenticated
  using (user_id = auth.uid() and public.authorize('idea.participate'));
create policy "Save an active discoverable member" on public.idea_connections for insert to authenticated
  with check (user_id = auth.uid() and public.authorize('idea.participate')
    and public.is_active_member(target_id)
    and exists (select 1 from public.idea_memberships m where m.user_id = target_id));
create policy "Remove own connections" on public.idea_connections for delete to authenticated
  using (user_id = auth.uid() and public.authorize('idea.participate'));

-- Only aggregate counts are public. Member names are available to active members.
create function public.idea_member_counts()
returns table (topic_id text, member_count bigint)
language sql stable security definer set search_path = ''
as $$
  select m.topic_id, count(*) from public.idea_memberships m
  join public.portal_users u on u.id = m.user_id
  where u.account_status = 'active' and (u.banned_until is null or u.banned_until <= now())
  group by m.topic_id
$$;
revoke all on function public.idea_member_counts() from public;
grant execute on function public.idea_member_counts() to anon, authenticated;

alter table public.forum_posts add column idea_topic text references public.idea_topics(id);
alter table public.forum_posts add column resource_url text
  check (resource_url is null or (length(resource_url) <= 700 and resource_url ~ '^https://[^[:space:]]+$'));
create index forum_posts_idea_idx on public.forum_posts(idea_topic, created_at desc)
  where idea_topic is not null;
create policy "Idea discussions require membership" on public.forum_posts as restrictive for insert to authenticated
  with check (
    idea_topic is null or (
      author_id = auth.uid() and public.authorize('idea.participate') and moderation_status = 'visible'
      and exists (select 1 from public.idea_memberships m where m.user_id = auth.uid() and m.topic_id = idea_topic)
    )
  );
create function public.idea_people()
returns table (id uuid, name text, role text, department text, bio text, topics text[], is_demo boolean)
language sql stable security definer set search_path = ''
as $$
  select u.id, u.name, u.role, coalesce(f.department, s.department, ''),
    coalesce(f.research_area, s.bio, f.bio, ''), array_agg(m.topic_id order by m.topic_id),
    u.email like 'demo.%@nsut.ac.in'
  from public.portal_users u
  join public.idea_memberships m on m.user_id = u.id
  left join public.faculty_profiles f on f.user_id = u.id
  left join public.student_profiles s on s.user_id = u.id
  where public.authorize('idea.participate') and public.is_active_member(u.id)
  group by u.id, u.name, u.role, u.email, f.department, s.department, f.research_area, s.bio, f.bio
$$;
revoke all on function public.idea_people() from public;
grant execute on function public.idea_people() to authenticated;
grant select on public.idea_topics to anon, authenticated;
grant select, insert, delete on public.idea_memberships, public.idea_connections to authenticated;
commit;
