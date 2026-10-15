import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

const manifestUrl = new URL('./unicode-sources.json', import.meta.url);
const expectedPaths = [
  'security/IdentifierStatus.txt',
  'security/confusables.txt',
  'ucd/ScriptExtensions.txt',
  'ucd/Scripts.txt',
];

function readManifest() {
  return JSON.parse(readFileSync(manifestUrl, 'utf8'));
}

test('Unicode source inventory pins exactly four authoritative 18.0.0 data files', () => {
  const manifest = readManifest();
  assert.equal(manifest.unicodeVersion, '18.0.0');
  assert.equal(manifest.uts39Revision, 34);
  assert.equal(manifest.license, 'Unicode-3.0');
  assert.deepEqual(manifest.sources.map((source) => source.path).sort(), expectedPaths);
  assert.equal(manifest.sources.length, 4);
  for (const source of manifest.sources) {
    assert.equal(source.url, 'https://www.unicode.org/Public/18.0.0/' + source.path);
    assert.match(source.sha256, /^[0-9a-f]{64}$/u);
  }
});

test('recorded SHA-256 digests match official source bytes in the CI evidence cache', {
  skip: !process.env.IDNLENS_UNICODE_SOURCE_DIR,
}, () => {
  const manifest = readManifest();
  for (const source of manifest.sources) {
    const data = readFileSync(join(process.env.IDNLENS_UNICODE_SOURCE_DIR, source.path));
    const actual = createHash('sha256').update(data).digest('hex');
    assert.equal(actual, source.sha256, 'source digest mismatch: ' + source.path);
  }
});

test('a changed byte invalidates a recorded SHA-256 digest', () => {
  const original = Buffer.from('Unicode example\n', 'utf8');
  const digest = createHash('sha256').update(original).digest('hex');
  const altered = Buffer.from(original);
  altered[0] ^= 1;
  assert.notEqual(createHash('sha256').update(altered).digest('hex'), digest);
});
