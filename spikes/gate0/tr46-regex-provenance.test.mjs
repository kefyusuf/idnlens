import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('./', import.meta.url));
const replay = join(root, 'regex-replay');
const proof = process.env.IDNLENS_REGEX_PROOF_DIR;
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const readManifest = () => JSON.parse(readFileSync(join(root, 'tr46-regex-sources.json'), 'utf8'));

const expected = Object.freeze({
  tag: 'v7.0.0',
  tagCommit: '6d09104f21991d496aa2a8535d21bdea91a9c216',
  unicodeVersion: '18.0.0',
  generatorUrl: 'https://raw.githubusercontent.com/jsdom/tr46/6d09104f21991d496aa2a8535d21bdea91a9c216/scripts/generateRegexes.mjs',
  joiningTypeUrl: 'https://unicode.org/Public/18.0.0/ucd/extracted/DerivedJoiningType.txt',
  combiningClassUrl: 'https://unicode.org/Public/18.0.0/ucd/extracted/DerivedCombiningClass.txt',
});

test('replay dependency graph uses exactly the two upstream versions and their integrity', () => {
  const pkg = JSON.parse(readFileSync(join(replay, 'package.json'), 'utf8'));
  const lock = JSON.parse(readFileSync(join(replay, 'package-lock.json'), 'utf8'));
  assert.equal(pkg.unicodeVersion, '18.0.0');
  assert.equal(lock.lockfileVersion, 3);
  assert.deepEqual(pkg.dependencies, {
    '@unicode/unicode-18.0.0': '2.0.7',
    regenerate: '1.4.2',
  });
  assert.deepEqual(lock.packages[''].dependencies, pkg.dependencies);
  const locked = Object.keys(lock.packages).filter((name) => name !== '');
  assert.deepEqual(locked.sort(), [
    'node_modules/@unicode/unicode-18.0.0',
    'node_modules/regenerate',
  ].sort());
  for (const path of locked) {
    assert.match(lock.packages[path].integrity, /^sha512-[A-Za-z0-9+/]+={0,2}$/u);
    assert.match(lock.packages[path].resolved, /^https:\/\/registry\.npmjs\.org\//u);
  }
});

test('regex source inventory pins exact tagged generator and versioned Unicode inputs', () => {
  const m = readManifest();
  for (const [key, value] of Object.entries(expected)) {
    assert.equal(m[key], value, key);
  }
  for (const key of [
    'generatorSha256', 'joiningTypeSha256', 'combiningClassSha256', 'publishedRegexSha256',
  ]) {
    assert.match(m[key], /^[a-f0-9]{64}$/u, key);
  }
});

test('runner source files match manifest fingerprints and locked npm output', {
  skip: !proof,
}, () => {
  const m = readManifest();
  for (const [file, checksum] of [
    [join(replay, 'scripts/generateRegexes.mjs'), m.generatorSha256],
    [join(proof, 'DerivedJoiningType.txt'), m.joiningTypeSha256],
    [join(proof, 'DerivedCombiningClass.txt'), m.combiningClassSha256],
    [join(root, 'node_modules/tr46/lib/regexes.js'), m.publishedRegexSha256],
  ]) {
    assert.equal(hash(readFileSync(file)), checksum, file);
  }
});

test('tagged generator replays offline to the exact npm regex artifact', {
  skip: !proof,
}, () => {
  const m = readManifest();
  const result = spawnSync(process.execPath, [
    '--import', join(root, 'tr46-regex-offline-fetch.mjs'),
    join(replay, 'scripts/generateRegexes.mjs'),
  ], {
    cwd: replay,
    env: {
      ...process.env,
      IDNLENS_REGEX_JOINING_TYPE_FILE: join(proof, 'DerivedJoiningType.txt'),
      IDNLENS_REGEX_COMBINING_CLASS_FILE: join(proof, 'DerivedCombiningClass.txt'),
    },
    timeout: 30000,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, 'tagged generator failed: ' + result.stderr);
  const generated = readFileSync(join(replay, 'lib/regexes.js'));
  const published = readFileSync(join(root, 'node_modules/tr46/lib/regexes.js'));
  assert.equal(hash(generated), m.publishedRegexSha256);
  assert.deepEqual(generated, published, 'replayed regex output differs from installed tr46@7.0.0');
});

test('digest evidence fails closed on a one-byte source mutation', () => {
  const original = Buffer.from('DerivedJoiningType\n', 'utf8');
  const altered = Buffer.from(original);
  altered[0] ^= 1;
  assert.notEqual(hash(original), hash(altered));
});
