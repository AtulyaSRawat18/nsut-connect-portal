import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { before, after, test } from 'node:test';
import { PGlite } from '@electric-sql/pglite';

const db = new PGlite();
const student = '10000000-0000-4000-8000-000000000001';
const faculty = '10000000-0000-4000-8000-000000000002';
const suspended = '10000000-0000-4000-8000-000000000003';
const unlisted = '10000000-0000-4000-8000-000000000004';

// Minimal existing portal contracts, followed by the actual migration under test.
// This runs real Postgres RLS; it does not replace live staging validation.
before(async () => {
  await db.exec(`
    create role anon nologin; create role authenticated nologin;
    create schema auth;
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema public, auth to anon, authenticated;
    create table portal_users(id uuid primary key, name text, email text, role text, account_status text, banned_until timestamptz);
    create table faculty_profiles(user_id uuid primary key, department text, bio text, research_area text);
    create table student_profiles(user_id uuid primary key, department text, bio text);
    create table app_roles(role_key text primary key);
    create table app_permissions(permission_key text primary key, resource text not null, action text not null, description text not null, unique(resource, action));
    create table role_permissions(role_key text, permission_key text, primary key(role_key, permission_key));
    create table user_roles(user_id uuid, role_key text);
    insert into app_roles values ('student'), ('faculty'), ('moderator'), ('admin');
    insert into portal_users values
      ('${student}', 'Demo Student', 'demo.student01@nsut.ac.in', 'student', 'active', null),
      ('${faculty}', 'Demo Faculty', 'demo.faculty01@nsut.ac.in', 'faculty', 'active', null),
      ('${suspended}', 'Suspended', 'demo.student03@nsut.ac.in', 'student', 'suspended', null),
      ('${unlisted}', 'Unlisted', 'member@nsut.ac.in', 'student', 'active', null);
    insert into user_roles select id, role from portal_users;
    insert into student_profiles values ('${student}', 'CSE', 'Quantum research');
    insert into faculty_profiles values ('${faculty}', 'ECE', 'Optics', 'Quantum information');
    create function public.is_active_member(member_id uuid default auth.uid()) returns boolean language sql stable security definer set search_path = '' as
      $$ select exists(select 1 from public.portal_users where id = member_id and account_status = 'active' and (banned_until is null or banned_until <= now())) $$;
    create function public.authorize(permission text) returns boolean language sql stable security definer set search_path = '' as
      $$ select public.is_active_member() and exists(select 1 from public.user_roles ur join public.role_permissions rp on rp.role_key = ur.role_key where ur.user_id = auth.uid() and rp.permission_key = permission) $$;
    create table forum_posts(id uuid primary key default gen_random_uuid(), author_id uuid references portal_users(id), title text, content text, moderation_status text default 'visible', created_at timestamptz default now());
    alter table forum_posts enable row level security;
    create policy baseline_insert on forum_posts for insert to authenticated with check(author_id = auth.uid() and is_active_member());
    create policy baseline_read on forum_posts for select using(moderation_status = 'visible');
    grant select, insert on forum_posts to authenticated;
  `);
  await db.exec(readFileSync(new URL('../supabase/migrations/202610040013_idea_collaboration.sql', import.meta.url), 'utf8'));
});
after(async () => { await db.close(); });

const asUser = (id, run) => db.transaction(async tx => {
  await tx.exec('set local role authenticated');
  await tx.query("select set_config('request.jwt.claim.sub', $1, true)", [id]);
  return run(tx);
});

test('migration seeds 24 fields and grants participation to all member roles', async () => {
  assert.equal((await db.query('select count(*)::int as n from idea_topics')).rows[0].n, 24);
  assert.equal((await db.query("select count(*)::int as n from role_permissions where permission_key = 'idea.participate'")).rows[0].n, 4);
});
test('students and faculty join with their own identities; duplicate joins are idempotent', async () => {
  for (const id of [student, faculty]) await asUser(id, tx => tx.query("insert into idea_memberships(user_id, topic_id) values ($1, 'quantum-computing') on conflict do nothing", [id]));
  await asUser(student, tx => tx.query("insert into idea_memberships(user_id, topic_id) values ($1, 'quantum-computing') on conflict do nothing", [student]));
  assert.equal((await db.query('select count(*)::int as n from idea_memberships')).rows[0].n, 2);
});
test('forged membership and suspended-account writes are denied', async () => {
  await assert.rejects(asUser(student, tx => tx.query("insert into idea_memberships values ($1, 'fsoc', now())", [faculty])), /row-level security/);
  await assert.rejects(asUser(suspended, tx => tx.query("insert into idea_memberships values ($1, 'fsoc', now())", [suspended])), /row-level security/);
});
test('directory exposes only opted-in members and no private email field', async () => {
  const result = await asUser(student, tx => tx.query('select * from idea_people()'));
  assert.equal(result.rows.length, 2);
  assert.ok(result.rows.every(row => row.is_demo && !('email' in row)));
  assert.equal((await asUser(suspended, tx => tx.query('select * from idea_people()'))).rows.length, 0);
});
test('guests can read aggregate counts but not membership identities', async () => {
  const result = await db.transaction(async tx => { await tx.exec('set local role anon'); return tx.query('select * from idea_member_counts()'); });
  assert.equal(Number(result.rows[0].member_count), 2);
  await assert.rejects(db.transaction(async tx => { await tx.exec('set local role anon'); return tx.query('select * from idea_memberships'); }), /permission denied/);
  await assert.rejects(db.transaction(async tx => { await tx.exec('set local role anon'); return tx.query('select * from idea_people()'); }), /permission denied/);
});
test('saved connections persist privately and reject self, forged, and unlisted targets', async () => {
  await asUser(student, tx => tx.query('insert into idea_connections(user_id, target_id) values ($1,$2)', [student, faculty]));
  assert.equal((await asUser(student, tx => tx.query('select * from idea_connections'))).rows.length, 1);
  assert.equal((await asUser(faculty, tx => tx.query('select * from idea_connections'))).rows.length, 0);
  await assert.rejects(asUser(student, tx => tx.query('insert into idea_connections(user_id, target_id) values ($1,$1)', [student])), /check constraint/);
  await assert.rejects(asUser(student, tx => tx.query('insert into idea_connections(user_id, target_id) values ($1,$2)', [faculty, student])), /row-level security/);
  await assert.rejects(asUser(student, tx => tx.query('insert into idea_connections(user_id, target_id) values ($1,$2)', [student, unlisted])), /row-level security/);
});
test('restrictive forum policy blocks unjoined posts even when baseline policy permits them', async () => {
  await assert.rejects(asUser(student, tx => tx.query("insert into forum_posts(author_id, title, idea_topic) values ($1, 'A new idea', 'fsoc')", [student])), /row-level security/);
  await asUser(student, tx => tx.query("insert into forum_posts(author_id, title, idea_topic, resource_url) values ($1, 'Quantum reading group', 'quantum-computing', 'https://quantum.cloud.ibm.com/learning/en')", [student]));
  await assert.rejects(asUser(student, tx => tx.query("insert into forum_posts(author_id, title, idea_topic, resource_url) values ($1, 'Bad link', 'quantum-computing', 'javascript:alert(1)')", [student])), /check constraint/);
  await assert.rejects(asUser(student, tx => tx.query("insert into forum_posts(author_id, title, idea_topic, moderation_status) values ($1, 'Hidden', 'quantum-computing', 'hidden')", [student])), /row-level security/);
});
test('members cannot remove others interests, but can leave and remove own saved connections', async () => {
  await asUser(student, tx => tx.query('delete from idea_memberships where user_id = $1', [faculty]));
  assert.equal((await db.query('select * from idea_memberships where user_id = $1', [faculty])).rows.length, 1);
  await asUser(student, tx => tx.query('delete from idea_connections where user_id = $1', [student]));
  assert.equal((await asUser(student, tx => tx.query('select * from idea_connections'))).rows.length, 0);
  await asUser(student, tx => tx.query('delete from idea_memberships where user_id = $1', [student]));
  assert.equal((await asUser(student, tx => tx.query('select * from idea_people()'))).rows.length, 1);
});
