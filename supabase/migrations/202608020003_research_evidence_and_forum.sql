-- Research evidence, assessment and authenticated forum engagement.
-- Apply after 202607290002_rbac_moderation_faculty.sql.

begin;

alter table public.projects
  add column if not exists brief_url text,
  add column if not exists progress_percent smallint not null default 0,
  add column if not exists health_status text not null default 'on_track',
  add column if not exists progress_note text,
  add column if not exists last_assessed_at timestamptz;

alter table public.projects drop constraint if exists projects_progress_percent_check;
alter table public.projects add constraint projects_progress_percent_check
  check (progress_percent between 0 and 100);
alter table public.projects drop constraint if exists projects_health_status_check;
alter table public.projects add constraint projects_health_status_check
  check (health_status in ('on_track', 'at_risk', 'blocked', 'completed'));
alter table public.projects drop constraint if exists projects_brief_url_format_check;
alter table public.projects add constraint projects_brief_url_format_check
  check (brief_url is null or brief_url ~* '^(https://|/).+\.pdf([?#].*)?$');

update public.projects set brief_url = '/briefs/edge-ai-ev-battery-health.pdf', progress_percent = 45,
  progress_note = 'Dataset protocol complete; embedded baseline validation is in progress.', last_assessed_at = now()
where id = '69c9154f-7fd0-490d-a839-862186fb806c' and brief_url is null;
update public.projects set brief_url = '/briefs/insar-landslide-warning.pdf', progress_percent = 30,
  progress_note = 'Study-area data audit complete; uncertainty model is being designed.', last_assessed_at = now()
where id = 'db240800-0c81-442d-adea-9c0f0a444b62' and brief_url is null;
update public.projects set brief_url = '/briefs/microfluidic-amr-screening.pdf', progress_percent = 20,
  health_status = 'at_risk', progress_note = 'Biosafety review is required before laboratory validation.', last_assessed_at = now()
where id = 'a5a4aa71-a73a-4928-a54b-fad63af14628' and brief_url is null;
update public.projects set brief_url = '/briefs/indian-science-knowledge-graph.pdf', progress_percent = 55,
  progress_note = 'Ontology and licensing audit complete; bilingual retrieval evaluation is active.', last_assessed_at = now()
where id = '7a92a4ac-e1a4-4525-af2c-c586f658d74e' and brief_url is null;

alter table public.projects drop constraint if exists projects_new_rows_require_brief;
alter table public.projects add constraint projects_new_rows_require_brief
  check (brief_url is not null) not valid;

alter table public.announcements add column if not exists source_url text;
alter table public.announcements drop constraint if exists announcements_source_url_format_check;
alter table public.announcements add constraint announcements_source_url_format_check
  check (source_url is null or source_url ~* '^https://');
update public.announcements set source_url = 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2286937&lang=2&reg=48'
where id = '4aa0faa0-5281-4214-a966-2b1144c068a9' and source_url is null;
update public.announcements set source_url = 'https://www.isro.gov.in/Spadex_Successful_demonstration_of_Second_Docking_and_Power_Transfer.html'
where id = 'f123e8fa-5e7e-4cbb-a270-ff36da98039b' and source_url is null;
update public.announcements set source_url = 'https://bmi.dbtindia.gov.in/biomanufacturing-initiative.php'
where id = '25a283d8-1d5d-47ac-a67c-077692bfa8ac' and source_url is null;
update public.announcements set source_url = 'https://www.startupindia.gov.in/'
where id = '8f929e52-32e0-4b42-a359-0f49f12c6ffd' and source_url is null;
alter table public.announcements drop constraint if exists announcements_new_rows_require_source;
alter table public.announcements add constraint announcements_new_rows_require_source
  check (source_url is not null) not valid;

update public.highlights
set link_url = '/contact?subject=Climate%20Infrastructure%20Data%20Sprint'
where id = '4605aa30-912b-4f4d-ae72-b0694d30d518' and link_url is null;
alter table public.highlights drop constraint if exists highlights_link_url_format_check;
alter table public.highlights add constraint highlights_link_url_format_check
  check (link_url is null or link_url ~* '^(https://|/)');
alter table public.highlights drop constraint if exists highlights_new_rows_require_link;
alter table public.highlights add constraint highlights_new_rows_require_link
  check (link_url is not null) not valid;

create table if not exists public.forum_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.forum_posts(id) on delete cascade,
  author_id uuid not null references public.portal_users(id) on delete cascade,
  parent_id uuid references public.forum_replies(id) on delete cascade,
  content text not null check (char_length(content) between 2 and 5000),
  score integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.forum_post_votes (
  post_id uuid not null references public.forum_posts(id) on delete cascade,
  voter_id uuid not null references public.portal_users(id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (post_id, voter_id)
);

create table if not exists public.forum_reply_votes (
  reply_id uuid not null references public.forum_replies(id) on delete cascade,
  voter_id uuid not null references public.portal_users(id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (reply_id, voter_id)
);

alter table public.forum_replies enable row level security;
alter table public.forum_post_votes enable row level security;
alter table public.forum_reply_votes enable row level security;

create policy "Forum replies are public" on public.forum_replies for select using (true);
create policy "Active members create replies" on public.forum_replies for insert to authenticated
  with check (author_id = auth.uid() and public.is_active_member());
create policy "Authors and moderators update replies" on public.forum_replies for update to authenticated
  using (author_id = auth.uid() or public.authorize('content.moderate'))
  with check (author_id = auth.uid() or public.authorize('content.moderate'));
create policy "Authors and moderators delete replies" on public.forum_replies for delete to authenticated
  using (author_id = auth.uid() or public.authorize('content.moderate'));

create policy "Members read own post votes" on public.forum_post_votes for select to authenticated
  using (voter_id = auth.uid());
create policy "Active members create post votes" on public.forum_post_votes for insert to authenticated
  with check (voter_id = auth.uid() and public.is_active_member());
create policy "Members update own post votes" on public.forum_post_votes for update to authenticated
  using (voter_id = auth.uid()) with check (voter_id = auth.uid() and public.is_active_member());
create policy "Members delete own post votes" on public.forum_post_votes for delete to authenticated
  using (voter_id = auth.uid());

create policy "Members read own reply votes" on public.forum_reply_votes for select to authenticated
  using (voter_id = auth.uid());
create policy "Active members create reply votes" on public.forum_reply_votes for insert to authenticated
  with check (voter_id = auth.uid() and public.is_active_member());
create policy "Members update own reply votes" on public.forum_reply_votes for update to authenticated
  using (voter_id = auth.uid()) with check (voter_id = auth.uid() and public.is_active_member());
create policy "Members delete own reply votes" on public.forum_reply_votes for delete to authenticated
  using (voter_id = auth.uid());

create or replace function public.apply_forum_vote_score()
returns trigger language plpgsql security definer set search_path = '' as $$
declare delta integer;
begin
  if tg_op = 'INSERT' then delta := new.value;
  elsif tg_op = 'DELETE' then delta := -old.value;
  else delta := new.value - old.value;
  end if;
  if tg_table_name = 'forum_post_votes' then
    update public.forum_posts set upvotes = greatest(coalesce(upvotes, 0) + delta, 0) where id = coalesce(new.post_id, old.post_id);
  else
    update public.forum_replies set score = score + delta where id = coalesce(new.reply_id, old.reply_id);
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end $$;

drop trigger if exists forum_post_vote_score on public.forum_post_votes;
create trigger forum_post_vote_score after insert or update or delete on public.forum_post_votes
  for each row execute function public.apply_forum_vote_score();
drop trigger if exists forum_reply_vote_score on public.forum_reply_votes;
create trigger forum_reply_vote_score after insert or update or delete on public.forum_reply_votes
  for each row execute function public.apply_forum_vote_score();

grant select on public.forum_replies to anon, authenticated;
grant insert, update, delete on public.forum_replies to authenticated;
grant select, insert, update, delete on public.forum_post_votes, public.forum_reply_votes to authenticated;

commit;
