-- Prevent new engagement with forum content hidden by moderation.

drop policy if exists "Active members create replies" on public.forum_replies;
create policy "Active members reply to visible posts"
  on public.forum_replies for insert to authenticated
  with check (
    author_id = auth.uid()
    and public.is_active_member()
    and exists (
      select 1 from public.forum_posts post
      where post.id = forum_replies.post_id
        and post.moderation_status = 'visible'
    )
  );

drop policy if exists "Active members create post votes" on public.forum_post_votes;
create policy "Active members vote on visible posts"
  on public.forum_post_votes for insert to authenticated
  with check (
    voter_id = auth.uid()
    and public.is_active_member()
    and exists (
      select 1 from public.forum_posts post
      where post.id = forum_post_votes.post_id
        and post.moderation_status = 'visible'
    )
  );

drop policy if exists "Members update own post votes" on public.forum_post_votes;
create policy "Members update votes on visible posts"
  on public.forum_post_votes for update to authenticated
  using (voter_id = auth.uid())
  with check (
    voter_id = auth.uid()
    and public.is_active_member()
    and exists (
      select 1 from public.forum_posts post
      where post.id = forum_post_votes.post_id
        and post.moderation_status = 'visible'
    )
  );

drop policy if exists "Active members create reply votes" on public.forum_reply_votes;
create policy "Active members vote on visible replies"
  on public.forum_reply_votes for insert to authenticated
  with check (
    voter_id = auth.uid()
    and public.is_active_member()
    and exists (
      select 1
      from public.forum_replies reply
      join public.forum_posts post on post.id = reply.post_id
      where reply.id = forum_reply_votes.reply_id
        and post.moderation_status = 'visible'
    )
  );

drop policy if exists "Members update own reply votes" on public.forum_reply_votes;
create policy "Members update votes on visible replies"
  on public.forum_reply_votes for update to authenticated
  using (voter_id = auth.uid())
  with check (
    voter_id = auth.uid()
    and public.is_active_member()
    and exists (
      select 1
      from public.forum_replies reply
      join public.forum_posts post on post.id = reply.post_id
      where reply.id = forum_reply_votes.reply_id
        and post.moderation_status = 'visible'
    )
  );
