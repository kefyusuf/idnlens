import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { resolve, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('./', import.meta.url));
const manifestFile = join(root, 'license-notices.json');
const expected = [
  'main:@npm/punycode@2.3.1',
  'main:@npm/tldts@7.4.18',
  'main:@npm/tldts-core@7.4.18',
  'main:@npm/tr46@7.0.0',
  'regex:@npm/@unicode/unicode-18.0.0@2.0.7',
  'regex:@npm/regenerate@1.4.2',
].sort();

const graphs = Object.freeze({
  main: root,
  regex: join(root, 'regex-replay'),
});

function manifest() {
  return JSON.parse(readFileSync(manifestFile, 'utf8'));
}

function lockedPackages() {
  const packages = [];
  for (const [graph, dir] of Object.entries(graphs)) {
    const lock = JSON.parse(readFileSync(join(dir, 'package-lock.json'), 'utf8'));
    assert.equal(lock.lockfileVersion, 3);
    for (const [path, item] of Object.entries(lock.packages)) {
      if (!path) continue;
      assert.ok(path.startsWith('node_modules/'));
      packages.push({ graph, dir, path, version: item.version, license: item.license });
    }
  }
  return packages;
}

test('two immutable Gate 0 npm graphs contain precisely six reviewed packages', () => {
  const found = lockedPackages().map(({graph, path, version}) =>
    graph + ':@npm/' + path.slice('node_modules/'.length) + '@' + version
  ).sort();
  assert.deepEqual(found, expected);
});

test('license inventory is complete, version-bound and not a production approval', () => {
  const record = manifest();
  assert.equal(record.status, 'EVIDENCE_ONLY_NOT_DISTRIBUTION_APPROVAL');
  const actual = record.packages.map((entry) =>
    entry.graph + ':@npm/' + entry.name + '@' + entry.version
  ).sort();
  assert.deepEqual(actual, expected);
  assert.equal(new Set(actual).size, actual.length);
  for (const entry of record.packages) {
    assert.equal(entry.license, 'MIT');
    if (entry.evidence === 'METADATA_ONLY') {
      assert.equal(entry.name, '@unicode/unicode-18.0.0');
      assert.equal(entry.graph, 'regex');
      assert.equal(entry.licenseFile, null);
      assert.equal(entry.noticeStatus, 'BLOCKED_MISSING_BUNDLED_LICENSE');
    } else {
      assert.equal(entry.evidence, 'BUNDLED_LICENSE_TEXT');
      assert.equal(entry.noticeStatus, 'REQUIRES_RELEASE_REVIEW');
      assert.ok(entry.licenseFile && !entry.licenseFile.includes('..'));
    }
  }
});

test('each npm package matches its recorded license evidence level and version', () => {
  const record = manifest();
  for (const entry of record.packages) {
    const dir = graphs[entry.graph];
    assert.ok(dir, 'unknown graph ' + entry.graph);
    const base = resolve(dir, 'node_modules', entry.name);
    const pkg = JSON.parse(readFileSync(join(base, 'package.json'), 'utf8'));
    assert.equal(pkg.name, entry.name);
    assert.equal(pkg.version, entry.version);
    assert.equal(pkg.license, 'MIT', entry.name + ': package metadata license');
    const lock = lockedPackages().find(p => p.graph === entry.graph && p.path === 'node_modules/' + entry.name);
    assert.equal(lock?.version, entry.version, 'lockfile mismatch');
    assert.equal(lock?.license, entry.license, 'lockfile license mismatch');
    if (entry.evidence === 'METADATA_ONLY') {
      assert.equal(entry.name, '@unicode/unicode-18.0.0');
      assert.equal(entry.licenseFile, null);
      continue;
    }
    const noticePath = resolve(base, entry.licenseFile);
    assert.ok(noticePath.startsWith(base + sep), 'notice path must stay in package');
    assert.ok(statSync(noticePath).isFile(), 'license notice must be a file');
    const notice = readFileSync(noticePath, 'utf8');
    assert.match(notice, /permission is hereby granted/i, entry.name + ' missing MIT license grant');
    assert.match(notice, /copyright/i, entry.name + ' missing copyright in notice');
  }
});

test('Unicode and PSL data retain separate, explicitly unapproved licenses', () => {
  const data = manifest().dataSources;
  assert.deepEqual(data.map(x => x.id).sort(), ['psl', 'unicode']);
  const byId = Object.fromEntries(data.map(x => [x.id, x]));
  assert.equal(byId.unicode.license, 'Unicode-3.0');
  assert.equal(byId.psl.license, 'MPL-2.0');
  assert.equal(byId.unicode.disposition, 'RELEASE_NOTICE_REVIEW_REQUIRED');
  assert.equal(byId.psl.disposition, 'RELEASE_NOTICE_REVIEW_REQUIRED');

  const unicode = JSON.parse(readFileSync(join(root, 'unicode-sources.json'), 'utf8'));
  const psl = JSON.parse(readFileSync(join(root, 'psl-sources.json'), 'utf8'));
  assert.equal(unicode.unicodeVersion, '18.0.0');
  assert.equal(psl.pslCommit, byId.psl.sourceCommit);
  assert.equal(psl.pslSha256, byId.psl.sha256);
  assert.equal(unicode.license, byId.unicode.license);
  assert.equal(byId.unicode.reference, 'https://www.unicode.org/license.txt');
  assert.equal(byId.psl.reference, 'https://www.mozilla.org/en-US/MPL/2.0/');
});

test('source inventory does not mark package/data redistribution as approved', () => {
  const record = manifest();
  assert.equal(record.productionApproved, false);
  assert.ok(record.packages.every(x => x.noticeStatus !== 'APPROVED'));
  assert.ok(record.dataSources.every(x => x.disposition !== 'APPROVED'));
});
