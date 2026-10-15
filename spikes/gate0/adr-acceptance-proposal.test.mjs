import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('../../', import.meta.url));
const text = path => readFileSync(resolve(root, path), 'utf8');
const record = () => JSON.parse(text('docs/gates/GATE0-DECISION-READINESS.json'));
const accepted = ['ADR-0001', 'ADR-0002', 'ADR-0003'];

test('only the three M0-01 architectural policies are staged for acceptance', () => {
  const index = text('docs/DECISIONS.md');
  for (const id of accepted) {
    const source = text('docs/adr/' + id + '.md');
    assert.match(source, /^- \*\*Status:\*\* Accepted$/mu, id);
    assert.match(source, /Design acceptance does not certify implementation/u, id);
    const suffix = id.slice(-4);
    const row = index.split('\n').find(line => line.includes('[' + suffix + ']'));
    assert.ok(row, 'index entry missing: ' + id);
    assert.match(row, /\| Accepted \|/u, id);
  }
  for (const n of [4, 5, 6, 7, 8]) {
    const id = 'ADR-' + String(n).padStart(4, '0');
    assert.match(text('docs/adr/' + id + '.md'), /^- \*\*Status:\*\* Proposed$/mu, id);
    const row = index.split('\n').find(line => line.includes('[' + String(n).padStart(4, '0') + ']'));
    assert.match(row, /\| Proposed \|/u);
  }
});

test('readiness ledger distinguishes approved architecture from implementation and release', () => {
  const m = record();
  assert.deepEqual(m.adrStatuses, {
    'ADR-0001': 'Accepted',
    'ADR-0002': 'Accepted',
    'ADR-0003': 'Accepted',
  });
  assert.equal(m.decisionOwnerSignoff, 'APPROVED_VIA_MERGED_ADR_PR');
  assert.equal(m.findings.find(x => x.id === 'MAINTAINER_DECISION').status, 'EVIDENCED');
  assert.equal(m.status, 'OPEN');
  assert.equal(m.m0Authorized, false);
  assert.equal(m.productionDependenciesApproved, false);
  assert.equal(m.releaseApproved, false);
  assert.equal(m.authorizationBoundary.internalM0.authorized, false);
  assert.equal(m.authorizationBoundary.internalM0.status, 'PENDING_SEPARATE_GATE0_CLOSURE');
  assert.equal(m.authorizationBoundary.publicDistribution.authorized, false);
  assert.equal(m.authorizationBoundary.publicDistribution.status, 'BLOCKED');
  assert.deepEqual(m.deferredImplementationEvidence, [
    'M0-01 strict hostname and UTS #46 implementation behavior tests',
    'M0-02 PSL integration and private suffix behavior tests',
    'M0-03 UTS #39 transform and normative conformance fixtures',
  ]);
});

test('proposed design acceptance does not lift notice and repository license holds', () => {
  const m = record();
  assert.equal(m.findings.find(x => x.id === 'THIRD_PARTY_NOTICES').status, 'OPEN');
  assert.equal(m.findings.find(x => x.id === 'REPOSITORY_LICENSE').status, 'OPEN');
  assert.match(text('docs/gates/GATE0-DECISION-BOUNDARY.md'), /public.*distribution/iu);
  assert.match(text('docs/DECISIONS.md'), /Gate 0.*OPEN/u);
});
