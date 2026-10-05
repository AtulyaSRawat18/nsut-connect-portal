import assert from 'node:assert/strict';

const base = 'http://localhost:3000';
async function request(path, options = {}) {
  return fetch(`${base}${path}`, { signal: AbortSignal.timeout(60_000), ...options });
}
for (const path of ['/', '/login', '/signup']) {
  const response = await request(path);
  const html = await response.text();
  assert.equal(response.status, 200, path);
  assert.ok(!html.includes('aria-label="Main navigation"'), `${path} must omit portal navigation`);
  assert.ok(html.includes('Create account'), `${path} must expose account entry`);
  console.log(`PASS ${path}: account entry without portal navigation`);
}
for (const path of ['/idea', '/idea/quantum-computing', '/idea/fsoc', '/idea?view=connections']) {
  const response = await request(path);
  const html = await response.text();
  assert.equal(response.status, 200, path);
  assert.ok(html.includes('aria-label="Main navigation"'));
  assert.ok(html.includes('Search interests and people'));
  assert.ok(html.includes('idea-results'));
  console.log(`PASS ${path}: IDea route and search render`);
}
const missing = await request('/idea/not-a-real-space');
assert.equal(missing.status, 404);
console.log('PASS unknown interest space: 404');

const guest = await request('/api/idea', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: base }, body: JSON.stringify({ action: 'interest', topicId: 'fsoc', selected: true }) });
assert.equal(guest.status, 401);
console.log('PASS guest mutation: 401');
const foreign = await request('/api/idea', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://untrusted.example' }, body: '{}' });
assert.equal(foreign.status, 403);
console.log('PASS cross-origin mutation: 403');
const community = await request('/api/idea');
const data = await community.json();
assert.ok([200, 503].includes(community.status));
assert.equal(data.userId, null);
assert.deepEqual(data.people, []);
assert.deepEqual(data.connections, []);
if (community.status === 503) assert.ok(data.error);
console.log(`PASS guest community read: ${community.status}, no private member data${community.status === 503 ? ', explicit outage response' : ''}`);
for (const asset of ['/campus-fountain.jpg', '/nsut-logo.png']) {
  const response = await request(asset);
  assert.equal(response.status, 200);
  assert.ok(response.headers.get('content-type')?.startsWith('image/'));
  assert.ok((await response.arrayBuffer()).byteLength > 1000);
  console.log(`PASS image asset: ${asset}`);
}
