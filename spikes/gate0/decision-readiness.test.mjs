import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('../../', import.meta.url));
const manifestPath = resolve(root, 'docs/gates/GATE0-DECISION-READINESS.json');
const load = (path) => JSON.parse(readFileSync(resolve(root, path), 'utf8'));
const decision = () => load('docs/gates/GATE0-DECISION-READINESS.json');

const criteria = [
  'IDNA_BEHAVIOR', 'IDNA_SOURCE_PROVENANCE', 'PSL_BEHAVIOR',
  'PSL_SOURCE_IDENTITY', 'UNICODE_SECURITY_DATA', 'PACKAGE_INTEGRITY',
  'SECURITY_REVIEW', 'BUNDLE_FOOTPRINT',
  'PSL_GENERATOR_REPLAY', 'THIRD_PARTY_NOTICES',
  'MAINTAINER_DECISION', 'REPOSITORY_LICENSE',
];

test('Gate 0 decision record must exist and never silently authorize M0', () => {
  assert.ok(existsSync(manifestPath), 'decision-readiness JSON is required');
  const m = decision();
  assert.equal(m.gate, 'Gate 0');
  assert.equal(m.evidenceBaseCommit, '1b73091b95eb5dd734d175832e053c3bd9c620c5');
  assert.equal(m.status, 'OPEN');
  assert.equal(m.m0Authorized, false);
  assert.equal(m.productionDependenciesApproved, false);
  assert.equal(m.releaseApproved, false);
  assert.equal(m.decisionOwnerSignoff, 'PENDING');
  assert.deepEqual(m.adrStatuses, { 'ADR-0002': 'Proposed', 'ADR-0003': 'Proposed' });
});

test('every readiness finding has unique identity, bounded disposition, and real file evidence', () => {
  const m = decision();
  assert.deepEqual(m.findings.map(x => x.id).sort(), criteria.slice().sort());
  assert.equal(new Set(m.findings.map(x => x.id)).size, criteria.length);
  const allowed = ['EVIDENCED', 'OPEN', 'NOT_REQUIRED_FOR_SELECTION', 'PENDING_SIGNOFF'];
  for (const finding of m.findings) {
    assert.ok(allowed.includes(finding.status), finding.id);
    assert.ok(Array.isArray(finding.evidencePaths) && finding.evidencePaths.length > 0, finding.id);
    for (const path of finding.evidencePaths) {
      assert.ok(path.startsWith('docs/') || path.startsWith('spikes/gate0/'), 'unreviewed path: ' + path);
      assert.ok(!path.includes('..') && existsSync(resolve(root, path)), 'evidence missing: ' + path);
    }
  }
});

test('candidate package versions and source hashes match pinned evidence', () => {
  const m = decision();
  const lock = load('spikes/gate0/package-lock.json');
  const psl = load('spikes/gate0/psl-sources.json');
  const unicode = load('spikes/gate0/unicode-sources.json');
  assert.deepEqual(m.candidates, { idna: 'tr46@7.0.0', psl: 'tldts@7.4.18' });
  assert.equal(lock.packages['node_modules/tr46'].version, '7.0.0');
  assert.equal(lock.packages['node_modules/tldts'].version, '7.4.18');
  assert.equal(psl.pslCommit, m.sources.pslCommit);
  assert.equal(psl.trieSha256, m.sources.packagedTrieSha256);
  assert.equal(unicode.unicodeVersion, m.sources.unicodeVersion);
  assert.equal(unicode.uts39Revision, m.sources.uts39Revision);
});

test('license and signoff holds cannot be reclassified as completed by a green CI', () => {
  const m = decision();
  const byId = Object.fromEntries(m.findings.map(x => [x.id, x]));
  assert.equal(byId.THIRD_PARTY_NOTICES.status, 'OPEN');
  assert.equal(byId.MAINTAINER_DECISION.status, 'PENDING_SIGNOFF');
  assert.equal(byId.REPOSITORY_LICENSE.status, 'OPEN');
  assert.equal(byId.PSL_GENERATOR_REPLAY.status, 'NOT_REQUIRED_FOR_SELECTION');
  assert.equal(m.pslReplayPolicy, 'NOT_REQUIRED_FOR_CANDIDATE_SELECTION_WITH_CAVEAT');
  const notices = load('spikes/gate0/license-notices.json');
  assert.equal(notices.productionApproved, false);
  assert.ok(notices.packages.some(x => x.noticeStatus === 'BLOCKED_MISSING_BUNDLED_LICENSE'));
  assert.equal(existsSync(resolve(root, 'LICENSE')), false, 'a new root LICENSE requires decision re-review');
});

test('ADR proposals and roadmap still require explicit owner review', () => {
  const m = decision();
  for (const [adr, expectedStatus] of Object.entries(m.adrStatuses)) {
    const source = readFileSync(resolve(root, 'docs/adr/' + adr + '.md'), 'utf8');
    assert.match(source, new RegExp('^- \\*\\*Status:\\*\\* ' + expectedStatus + '$', 'mu'), adr);
  }
  const roadmap = readFileSync(resolve(root, 'docs/ROADMAP.md'), 'utf8');
  assert.match(roadmap, /No new feature, browser extension scaffolding or catalog feed/u);
  assert.match(roadmap, /## Gate 0/u);
});


test('Gate 0-07 separates internal development approval from release authorization', () => {
  const m = decision();
  const boundary = m.authorizationBoundary;
  assert.deepEqual(boundary.internalM0, {
    status: 'PENDING_EXPLICIT_MAINTAINER_DECISION',
    minimumADRsForM001: ['ADR-0001', 'ADR-0002', 'ADR-0003'],
    gate0ClosureRequired: true,
    authorized: false,
  });
  assert.deepEqual(boundary.publicDistribution, {
    status: 'BLOCKED',
    thirdPartyNoticesReviewed: false,
    repositoryLicenseChosen: false,
    authorized: false,
  });
  assert.equal(m.m0Authorized, boundary.internalM0.authorized);
  assert.equal(m.releaseApproved, boundary.publicDistribution.authorized);
  for (const adr of boundary.internalM0.minimumADRsForM001) {
    const source = readFileSync(resolve(root, 'docs/adr/' + adr + '.md'), 'utf8');
    assert.match(source, /^- \*\*Status:\*\* Proposed$/mu, adr);
  }
});

test('Gate 0-07 links upstream Unicode generator MIT text without clearing the npm notice gap', () => {
  const m = decision();
  const source = m.unicodeHelperNoticeEvidence;
  assert.deepEqual(source, {
    package: '@unicode/unicode-18.0.0@2.0.7',
    packageSourceCommit: 'f4cac36e42e85a43d037cb010fdb1f2eb17c1c36',
    generatorRepository: 'node-unicode/node-unicode-data',
    generatorCommit: '6bb2993582494b715c78a10708a456be5249d188',
    licensePath: 'LICENSE-MIT.txt',
    licenseGitBlobSha: 'a41e0a7ef970ecdd83d82cd99bda97b22077bc62',
    result: 'UPSTREAM_LICENSE_TEXT_FOUND_BUNDLED_NOTICE_MISSING',
    distributionApproved: false,
  });
  const inventory = load('spikes/gate0/license-notices.json');
  const pkg = inventory.packages.find(p => p.graph === 'regex' && p.name === '@unicode/unicode-18.0.0');
  assert.equal(pkg?.licenseFile, null);
  assert.equal(pkg?.evidence, 'METADATA_ONLY');
  assert.equal(pkg?.noticeStatus, 'BLOCKED_MISSING_BUNDLED_LICENSE');
  assert.equal(inventory.productionApproved, false);
  const draft = readFileSync(resolve(root, 'docs/THIRD-PARTY-NOTICES-DRAFT.md'), 'utf8');
  assert.match(draft, /node-unicode\/node-unicode-data/u);
  assert.match(draft, /not a final distribution clearance/i);
});
