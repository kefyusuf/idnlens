import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('./', import.meta.url));
const manifestPath = join(root, 'psl-sources.json');
const expected = Object.freeze({
  version: '7.4.18',
  tag: 'v7.4.18',
  tagObjectSha: '0d706a673d79aefcd95560a3f2f8d744071e6bb0',
  tagCommit: '3ac3c4cd3161b0e56383ff93c23a79a7e5e91508',
  sourceTree: 'ca4454e0b0c4d4caed9d32fc62ee5d8d255660a6',
  pslCommit: '3929462652695bad04f0a27afb600974014a3c8b',
  triePath: 'packages/tldts/src/data/trie.ts',
});

function sha256(data) {
  return createHash('sha256').update(data).digest('hex');
}

function readManifest() {
  return JSON.parse(readFileSync(manifestPath, 'utf8'));
}

test('PSL provenance manifest records an exact tagged source and immutable submodule', () => {
  const m = readManifest();
  for (const [key, value] of Object.entries(expected)) {
    assert.equal(m[key], value, key);
  }
  assert.equal(m.pslFile, 'public_suffix_list.dat');
  assert.equal(m.pslLicense, 'MPL-2.0');
  assert.equal(m.trieSourceUrl, 'https://raw.githubusercontent.com/remusao/tldts/' + m.tagCommit + '/' + m.triePath);
  assert.equal(m.pslSourceUrl, 'https://raw.githubusercontent.com/publicsuffix/list/' + m.pslCommit + '/' + m.pslFile);
  assert.match(m.pslSha256, /^[0-9a-f]{64}$/u);
  assert.match(m.trieSha256, /^[0-9a-f]{64}$/u);
});

test('upstream tagged ref resolves through annotated tag to the exact source commit and PSL gitlink', {
  skip: !process.env.IDNLENS_PSL_PROOF_DIR,
}, () => {
  const m = readManifest();
  const read = (name) => JSON.parse(readFileSync(join(process.env.IDNLENS_PSL_PROOF_DIR, name), 'utf8'));
  const ref = read('tag-ref.json');
  const tag = read('tag-object.json');
  const tree = read('tag-tree.json');

  assert.equal(ref.ref, 'refs/tags/' + m.tag);
  assert.equal(ref.object.type, 'tag');
  assert.equal(ref.object.sha, m.tagObjectSha);
  assert.equal(tag.object.type, 'commit');
  assert.equal(tag.object.sha, m.tagCommit);
  assert.equal(tree.sha, m.sourceTree);
  const gitlink = tree.tree.find((entry) => entry.path === 'publicsuffix');
  assert.ok(gitlink, 'expected publicsuffix submodule link in upstream tag tree');
  assert.equal(gitlink.mode, '160000');
  assert.equal(gitlink.type, 'commit');
  assert.equal(gitlink.sha, m.pslCommit);
});

test('PSL and generated trie source match pinned SHA-256, and npm packaged trie matches tagged source', {
  skip: !process.env.IDNLENS_PSL_PROOF_DIR,
}, () => {
  const m = readManifest();
  const folder = process.env.IDNLENS_PSL_PROOF_DIR;
  const psl = readFileSync(join(folder, 'public_suffix_list.dat'));
  const trie = readFileSync(join(folder, 'trie.ts'));
  const installedTrie = readFileSync(join(root, 'node_modules/tldts/src/data/trie.ts'));
  assert.equal(sha256(psl), m.pslSha256, 'upstream public_suffix_list.dat digest');
  assert.equal(sha256(trie), m.trieSha256, 'upstream generated trie digest');
  assert.equal(sha256(installedTrie), m.trieSha256, 'npm tldts@7.4.18 source trie must match tag');
  const header = psl.toString('utf8', 0, 1400);
  assert.match(header, /Mozilla Public/);
  assert.match(header, /BEGIN ICANN DOMAINS/);
  assert.match(psl.toString('utf8'), /BEGIN PRIVATE DOMAINS/);
});

test('PSL checksum detects a changed byte', () => {
  const data = Buffer.from('com\nco.uk\n');
  const altered = Buffer.from(data);
  altered[0] ^= 1;
  assert.notEqual(sha256(data), sha256(altered));
});
