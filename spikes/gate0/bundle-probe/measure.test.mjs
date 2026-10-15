import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { measureBundles, PROFILES } from './measure.mjs';

const root = fileURLToPath(new URL('./', import.meta.url));
const pkg = JSON.parse(readFileSync(root + 'package.json', 'utf8'));

test('measurement tool is isolated, exact-versioned and not an M0 dependency', () => {
  const lock = JSON.parse(readFileSync(root + 'package-lock.json', 'utf8'));
  assert.deepEqual(pkg.devDependencies, { esbuild: '0.25.12' });
  assert.equal(lock.lockfileVersion, 3);
  assert.deepEqual(lock.packages[''].devDependencies, pkg.devDependencies);
  assert.equal(lock.packages['node_modules/esbuild'].version, '0.25.12');
  for (const [name, entry] of Object.entries(lock.packages)) {
    if (!name) continue;
    assert.match(entry.integrity, /^sha512-[A-Za-z0-9+/]+={0,2}$/u, name);
    assert.match(entry.resolved, /^https:\/\/registry\.npmjs\.org\//u, name);
  }
});

test('browser measurement covers exactly IDNA, PSL and combined bundle under fixed settings', async () => {
  const report = await measureBundles();
  assert.equal(report.tool, 'esbuild@0.25.12');
  assert.deepEqual(report.config, {
    platform: 'browser', format: 'esm', target: 'chrome120',
    bundle: true, sourcemap: false, charset: 'utf8', legalComments: 'inline',
  });
  assert.deepEqual(Object.keys(report.profiles).sort(), ['combined', 'idna', 'psl']);
  assert.deepEqual(PROFILES.slice().sort(), Object.keys(report.profiles).sort());
  for (const [name, profile] of Object.entries(report.profiles)) {
    assert.deepEqual(Object.keys(profile).sort(), ['minified', 'unminified']);
    for (const [mode, result] of Object.entries(profile)) {
      assert.ok(Number.isSafeInteger(result.rawBytes) && result.rawBytes > 0, name + '/' + mode);
      assert.ok(Number.isSafeInteger(result.gzipBytes) && result.gzipBytes > 0);
      assert.ok(Number.isSafeInteger(result.brotliBytes) && result.brotliBytes > 0);
      assert.match(result.sha256, /^[0-9a-f]{64}$/u);
      assert.ok(Array.isArray(result.packageInputs));
      assert.ok(result.packageInputs.length > 0);
    }
    assert.ok(profile.minified.rawBytes <= profile.unminified.rawBytes);
  }
  assert.ok(report.profiles.idna.minified.packageInputs.includes('tr46'));
  assert.ok(report.profiles.idna.minified.packageInputs.includes('punycode'));
  assert.ok(report.profiles.psl.minified.packageInputs.includes('tldts'));
  assert.ok(report.profiles.psl.minified.packageInputs.includes('tldts-core'));
  assert.deepEqual(report.profiles.combined.minified.packageInputs,
    ['punycode', 'tldts', 'tldts-core', 'tr46']);
});

test('identical inputs and settings generate byte-identical bundles twice', async () => {
  const a = await measureBundles();
  const b = await measureBundles();
  assert.deepEqual(a, b);
});

test('browser ESM output exercises IDNA and PSL without a Node polyfill', async () => {
  const report = await measureBundles({ includeOutput: true });
  const entry = report.output.get('combined:minified');
  assert.ok(entry);
  const js = await import('data:text/javascript;base64,' + entry.toString('base64'));
  assert.equal(js.idnaCandidate('bücher.de'), 'xn--bcher-kva.de');
  assert.equal(js.pslCandidate('shop.example.co.uk'), 'example.co.uk');
  assert.equal(js.pslCandidate('sub.example.github.io'), 'example.github.io');
});
