const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const { test } = require('node:test');
const ts = require('typescript');

const filename = path.resolve(__dirname, '../src/lib/idea-search.ts');
const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true, resolveJsonModule: true } });
const searchModule = new Module(filename, module);
searchModule.filename = filename;
searchModule.paths = Module._nodeModulePaths(path.dirname(filename));
searchModule._compile(compiled.outputText, filename);
const { IDEA_TOPICS, searchTopics, searchPeople } = searchModule.exports;

test('quantum spelling mistakes resolve to the intended space', () => {
  assert.equal(searchTopics('quantumn computing')[0].id, 'quantum-computing');
  assert.equal(searchTopics('quntum computing')[0].id, 'quantum-computing');
});
test('niche and acronym searches find their parent fields', () => {
  assert.equal(searchTopics('FSOC')[0].id, 'fsoc');
  assert.equal(searchTopics('QKD')[0].id, 'quantum-communications');
  assert.ok(searchTopics('atmospheric turbulence').some(item => item.id === 'fsoc'));
  assert.ok(searchTopics('AI quant').some(item => item.id === 'ai-quant'));
  assert.ok(searchTopics('civil').some(item => item.id === 'civil-structures'));
  assert.ok(searchTopics('bio').some(item => item.id === 'bioinformatics'));
});
test('interest discovery finds people across departments without duplicate results', () => {
  const people = [
    { id: 'a', name: 'Quantum Researcher', department: 'ECE', bio: '', topics: ['quantum-computing'] },
    { id: 'b', name: 'Student B', department: 'CSE', bio: '', topics: ['quantum-computing'] },
    { id: 'c', name: 'Student C', department: 'Civil', bio: '', topics: ['civil-structures'] },
  ];
  assert.deepEqual(searchPeople(people, 'quantumn computing').map(item => item.id), ['a', 'b']);
  assert.equal(new Set(searchPeople(people, 'quantum').map(item => item.id)).size, searchPeople(people, 'quantum').length);
  assert.deepEqual(searchPeople(people, '', 'civil-structures').map(item => item.id), ['c']);
  assert.deepEqual(searchPeople(people, 'CSE').map(item => item.id), ['b']);
});
test('empty and unrelated queries behave predictably', () => {
  assert.equal(searchTopics('   ').length, IDEA_TOPICS.length);
  assert.deepEqual(searchTopics('zzzxxyyunknown'), []);
  assert.deepEqual(searchPeople([], 'quantum'), []);
});
test('catalogue has unique routable spaces and HTTPS resources', () => {
  assert.equal(new Set(IDEA_TOPICS.map(topic => topic.id)).size, IDEA_TOPICS.length);
  assert.ok(IDEA_TOPICS.length >= 24);
  for (const topic of IDEA_TOPICS) {
    assert.match(topic.id, /^[a-z0-9-]+$/);
    assert.ok(topic.niches.length >= 4);
    for (const resource of topic.resources) assert.equal(new URL(resource.url).protocol, 'https:');
  }
});
