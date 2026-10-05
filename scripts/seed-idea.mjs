import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

// Run with node --env-file=.env.local scripts/seed-idea.mjs after migration 013.
const expectedProject = 'vvpmjvavowslmtqwkbuj';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!url || new URL(url).hostname !== `${expectedProject}.supabase.co` || process.env.IDEA_STAGING_PROJECT !== expectedProject) {
  throw new Error('Explicit IDEA_STAGING_PROJECT confirmation of the known staging target is required.');
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('Staging service key is not configured.');
const supabase = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const topics = JSON.parse(readFileSync(new URL('../src/content/idea-topics.json', import.meta.url), 'utf8'));
const { data: users, error } = await supabase.from('portal_users').select('id, email').like('email', 'demo.%@nsut.ac.in').eq('account_status', 'active').order('email');
if (error) throw new Error('Could not read staging demo members.');
const demoUsers = users.filter(user => /^demo\.(student|faculty)\d{2}@nsut\.ac\.in$/.test(user.email));
if (!demoUsers.length) throw new Error('No existing namespaced demo members found. Run the approved baseline seed first.');
const memberships = demoUsers.flatMap((user, index) => [...new Set([topics[index % topics.length].id, topics[(index + 6) % topics.length].id, ['ml-research', 'quantum-computing', 'fsoc', 'ai-quant'][index % 4]])].map(topic_id => ({ user_id: user.id, topic_id })));
const { error: seedError } = await supabase.from('idea_memberships').upsert(memberships, { onConflict: 'user_id,topic_id', ignoreDuplicates: true });
if (seedError) throw new Error('IDea seed failed. Verify migration 013 is applied.');
console.log(`Seeded ${memberships.length} interest memberships for ${demoUsers.length} existing demo members in verified staging.`);
