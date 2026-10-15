import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('./', import.meta.url));
const manifest = JSON.parse(readFileSync(root + 'package.json', 'utf8'));
const lockPath = root + 'package-lock.json';

function getLock() {
  assert.ok(existsSync(lockPath), 'Gate 0 dependency spike requires a committed package-lock.json');
  return JSON.parse(readFileSync(lockPath, 'utf8'));
}

const expected = Object.freeze({
  tr46: '7.0.0',
  tldts: '7.4.18',
  punycode: '2.3.1',
  'tldts-core': '7.4.18',
});

test('direct dependency versions are exact and match the lockfile root', () => {
  const lock = getLock();
  assert.equal(lock.lockfileVersion, 3);
  assert.deepEqual(manifest.dependencies, { tr46: expected.tr46, tldts: expected.tldts });
  assert.deepEqual(lock.packages[''].dependencies, manifest.dependencies);
});

test('locked graph contains only reviewed direct and transitive candidates', () => {
  const lock = getLock();
  const actual = Object.keys(lock.packages).filter((path) => path !== '');
  assert.deepEqual(actual.sort(), Object.keys(expected).map((name) => 'node_modules/' + name).sort());
  for (const [name, version] of Object.entries(expected)) {
    assert.equal(lock.packages['node_modules/' + name]?.version, version, name);
  }
});

test('each external package has a registry tarball reference and integrity digest', () => {
  const lock = getLock();
  for (const [path, entry] of Object.entries(lock.packages)) {
    if (path === '') continue;
    assert.match(entry.resolved, /^https:\/\/registry\.npmjs\.org\//u, path);
    assert.match(entry.integrity, /^sha512-[A-Za-z0-9+/]+={0,2}$/u, path);
  }
});

test('transitive dependency edges are frozen in the lockfile', () => {
  const lock = getLock();
  assert.equal(lock.packages['node_modules/tr46'].dependencies?.punycode, '^2.3.1');
  assert.equal(lock.packages['node_modules/tldts'].dependencies?.['tldts-core'], '^7.4.18');
});
