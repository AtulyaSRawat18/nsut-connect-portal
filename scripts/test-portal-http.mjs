import assert from "node:assert/strict";

const base = process.env.PORTAL_TEST_URL || "http://localhost:3000";
let checks = 0;
async function page(path, expectedStatus = 200) {
  const response = await fetch(new URL(path, base), { redirect: "manual", signal: AbortSignal.timeout(120_000) });
  assert.equal(response.status, expectedStatus, `${path}: unexpected status`);
  return response.text();
}
function pass(name) { checks++; console.log(`PASS ${name}`); }

for (const path of ["/", "/login", "/signup"]) {
  const html = await page(path);
  assert.doesNotMatch(html, /<nav[^>]+aria-label="Main navigation"/);
  assert.match(html, /class="auth-shell"/);
  assert.match(html, /<title>[^<]*NSUT Research Network<\/title>/);
  assert.match(html, /nsut-research-network-logo\.png/);
  assert.equal(/NSUT Connect|nsut-logo\.png/.test(html), false, `${path}: old branding remains`);
  pass(`${path}: focused account entry`);
}

const routes = ["/home", "/projects", "/faculty", "/publications", "/forum", "/news", "/opportunities", "/developments", "/whats-new", "/feed", "/idea", "/about", "/contact", "/grants", "/ethics", "/privacy", "/terms", "/ip-policy", "/unauthorized"];
for (const path of routes) {
  const html = await page(path);
  assert.match(html, /<nav[^>]+aria-label="Main navigation"/);
  assert.match(html, /aria-label="Footer navigation"/);
  assert.match(html, /href="#main-content"/);
  assert.equal((html.match(/<main[\s>]/g) || []).length, 1, `${path}: nested main landmarks`);
  assert.ok((html.match(/<h1[\s>]/g) || []).length >= 1, `${path}: missing page heading`);
  assert.doesNotMatch(html, /href="#"/);
  assert.match(html, /aria-labelledby="portal-search-title"/);
  assert.match(html, /<title>[^<]*NSUT Research Network<\/title>/);
  assert.match(html, /nsut-research-network-logo\.png/);
  assert.equal(/NSUT Connect|nsut-logo\.png/.test(html), false, `${path}: old branding remains`);
  pass(`${path}: shared navigation, search, landmarks, links`);
}

for (const path of ["/projects?q=quantum", "/faculty?q=research", "/publications?q=climate", "/forum?q=FSOC", "/news?q=research", "/opportunities?type=scholarship", "/developments?category=research", "/whats-new?type=event"]) {
  const html = await page(path);
  assert.match(html, /class="portal-filter-bar/);
  assert.match(html, /<input[^>]+type="search"[^>]+aria-label=/);
  assert.doesNotMatch(html, /Dummy data fallback|Scalable Blockchain Architecture for IoT|Google Research Internship 2026/);
  pass(`${path}: accessible filters and shared data views`);
}

for (const path of ["/dashboard", "/dashboard/faculty", "/dashboard/student/applications", "/admin", "/moderator"]) {
  const response = await fetch(new URL(path, base), { redirect: "manual", signal: AbortSignal.timeout(120_000) });
  assert.ok([303, 307, 308].includes(response.status), `${path}: expected guest redirect`);
  assert.match(response.headers.get("location") || "", /\/login/);
  pass(`${path}: guest access remains protected`);
}

const missing = await page("/portal-test-page-does-not-exist", 404);
assert.match(missing, /We could not find that page/);
pass("custom not-found page");

const topic = await page("/idea/quantum-computing");
assert.match(topic, /<title>Quantum Computing \| IDea \| NSUT Research Network<\/title>/);
assert.match(topic, /rel="icon" href="\/nsut-research-network-logo\.png"/);
pass("IDea topic inherits network title and browser icon");

for (const asset of ["/campus-fountain.jpg", "/nsut-research-network-logo.png", "/_next/image?url=%2Fnsut-research-network-logo.png&w=128&q=75"]) {
  const response = await fetch(new URL(asset, base));
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") || "", /^image\//);
  pass(`${asset}: visual asset available`);
}
console.log(`${checks} portal HTTP checks passed. Browser interaction and visual layout are not covered by this suite.`);
