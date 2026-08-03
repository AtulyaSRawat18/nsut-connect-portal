-- Preserve signed community scores for Reddit-style up/down voting.
-- Apply after 202608020003_research_evidence_and_forum.sql.

begin;

create or replace function public.apply_forum_vote_score()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  delta integer;
begin
  if tg_op = 'INSERT' then
    delta := new.value;
  elsif tg_op = 'DELETE' then
    delta := -old.value;
  else
    delta := new.value - old.value;
  end if;

  if tg_table_name = 'forum_post_votes' then
    update public.forum_posts
    set upvotes = coalesce(upvotes, 0) + delta
    where id = coalesce(new.post_id, old.post_id);
  else
    update public.forum_replies
    set score = score + delta
    where id = coalesce(new.reply_id, old.reply_id);
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end
$$;

commit;
