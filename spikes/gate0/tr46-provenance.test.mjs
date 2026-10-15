import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('./', import.meta.url));
const evidenceDir = process.env.IDNLENS_TR46_PROOF_DIR;
const expected = Object.freeze({
  tag: 'v7.0.0',
  version: '7.0.0',
  unicodeVersion: '18.0.0',
  uts46Revision: 36,
  tagObjectSha: '6343e032fd673fb10d4e39f6f05b690ee3e113cb',
  tagCommit: '6d09104f21991d496aa2a8535d21bdea91a9c216',
  tagTree: 'd452de725b0914d94a4f77068f8ae00672b8e179',
  mappingSource: 'https://www.unicode.org/Public/18.0.0/idna/IdnaMappingTable.txt',
});

const sha256 = (data) => createHash('sha256').update(data).digest('hex');
const readManifest = () => JSON.parse(readFileSync(join(root, 'tr46-sources.json'), 'utf8'));
const proofFile = (name) => readFileSync(join(evidenceDir, name));
const proofJson = (name) => JSON.parse(proofFile(name).toString('utf8'));

test('tr46 manifest fixes release identity and source URLs', () => {
  const manifest = readManifest();
  for (const [key, value] of Object.entries(expected)) {
    assert.equal(manifest[key], value, key);
  }
  assert.equal(manifest.generatorUrl, 'https://raw.githubusercontent.com/jsdom/tr46/' + expected.tagCommit + '/scripts/generateMappingTable.mjs');
  assert.equal(manifest.statusMappingUrl, 'https://raw.githubusercontent.com/jsdom/tr46/' + expected.tagCommit + '/lib/statusMapping.js');
  for (const name of ['mappingSourceSha256', 'generatorSha256', 'statusMappingSha256', 'publishedMappingSha256']) {
    assert.match(manifest[name], /^[a-f0-9]{64}$/u, name);
  }
});

test('immutable git tag resolves to the audited source tree', { skip: !evidenceDir }, () => {
  const manifest = readManifest();
  const ref = proofJson('tag-ref.json');
  const tag = proofJson('tag-object.json');
  const commit = proofJson('tag-commit.json');
  assert.equal(ref.ref, 'refs/tags/' + manifest.tag);
  assert.equal(ref.object.type, 'tag');
  assert.equal(ref.object.sha, manifest.tagObjectSha);
  assert.equal(tag.object.type, 'commit');
  assert.equal(tag.object.sha, manifest.tagCommit);
  assert.equal(commit.sha, manifest.tagCommit);
  assert.equal(commit.tree.sha, manifest.tagTree);
});

test('raw Unicode mapping and exact tagged generator have pinned hashes', { skip: !evidenceDir }, () => {
  const m = readManifest();
  for (const [name, digest] of [
    ['IdnaMappingTable.txt', m.mappingSourceSha256],
    ['scripts/generateMappingTable.mjs', m.generatorSha256],
    ['lib/statusMapping.js', m.statusMappingSha256],
  ]) {
    assert.equal(sha256(proofFile(name)), digest, name);
  }
  const pkg = proofJson('package.json');
  assert.equal(pkg.name, 'tr46');
  assert.equal(pkg.version, m.version);
  assert.equal(pkg.unicodeVersion, m.unicodeVersion);
  assert.equal(pkg.license, 'MIT');
  assert.match(pkg.scripts.prepublish, /generateMappingTable\.mjs/u);
  assert.equal(pkg.engines.node, '^22.14.0 || >=24.0.0');
});

test('offline replay of tagged generator exactly reproduces locked npm mapping table', { skip: !evidenceDir }, () => {
  const m = readManifest();
  // No test-initiated HTTP: the preload limits fetch() to the verified local byte input.
  const shim = join(root, 'tr46-offline-fetch.mjs');
  const generator = join(evidenceDir, 'scripts/generateMappingTable.mjs');
  const run = spawnSync(process.execPath, ['--import', shim, generator], {
    env: {
      ...process.env,
      IDNLENS_TR46_OFFLINE_INPUT: join(evidenceDir, 'IdnaMappingTable.txt'),
      IDNLENS_TR46_EXPECTED_URL: m.mappingSource,
    },
    encoding: 'utf8',
    timeout: 30000,
  });
  assert.equal(run.status, 0, 'tagged generator failed: ' + run.stderr);
  const replayed = proofFile('lib/mappingTable.json');
  const packaged = readFileSync(join(root, 'node_modules/tr46/lib/mappingTable.json'));
  assert.equal(sha256(packaged), m.publishedMappingSha256);
  assert.equal(sha256(replayed), m.publishedMappingSha256, 'replayed source differs from published package');
  assert.deepEqual(replayed, packaged, 'generated mapping must match published bytes');
});

test('digest control detects a modified source byte', () => {
  const original = Buffer.from('IDNA source\n');
  const tampered = Buffer.from(original);
  tampered[0] ^= 1;
  assert.notEqual(sha256(original), sha256(tampered));
});
