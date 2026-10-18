import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('../../', import.meta.url));
const file = path => resolve(root, path);
const read = path => readFileSync(file(path), 'utf8');
const gate = () => JSON.parse(read('docs/gates/GATE0-DECISION-READINESS.json'));
const review = 'docs/gates/GATE0-M001-CLOSEOUT-REVIEW.md';

test('the Gate 0 to internal M0-01 closeout review is recorded as HOLD, not authorization', () => {
  assert.ok(existsSync(file(review)), 'a separately reviewable Gate 0 closeout report is required');
  const document = read(review);
  assert.match(document, /\*\*Disposition: HOLD\b/u);
  assert.match(document, /## Evidence already satisfied/u);
  assert.match(document, /## Unresolved prerequisites/u);
  assert.match(document, /## Explicit maintainer decision required/u);
  assert.match(document, /Gate 0 remains OPEN/u);
  assert.match(document, /M0-01 remains NOT AUTHORIZED/u);
  assert.match(document, /public distribution remains BLOCKED/u);
});

test('the gate record and decisions retain the exact independent authorization boundaries', () => {
  const m = gate();
  assert.equal(m.status, 'OPEN');
  assert.equal(m.m0Authorized, false);
  assert.equal(m.productionDependenciesApproved, false);
  assert.equal(m.releaseApproved, false);
  assert.equal(m.authorizationBoundary.internalM0.status, 'PENDING_SEPARATE_GATE0_CLOSURE');
  assert.equal(m.authorizationBoundary.internalM0.authorized, false);
  assert.equal(m.authorizationBoundary.publicDistribution.status, 'BLOCKED');
  assert.equal(m.authorizationBoundary.publicDistribution.authorized, false);
  assert.deepEqual(m.adrStatuses, {
    'ADR-0001': 'Accepted',
    'ADR-0002': 'Accepted',
    'ADR-0003': 'Accepted',
  });
  for (const n of [4, 5, 6, 7, 8]) {
    assert.match(read('docs/adr/ADR-' + String(n).padStart(4, '0') + '.md'), /^- \*\*Status:\*\* Proposed$/mu);
  }
});

test('review scope isolates M0-01 implementation evidence from later milestones and publishing', () => {
  const document = read(review);
  assert.match(document, /## M0-01 only: first TDD slice/u);
  assert.match(document, /hostname-only/u);
  assert.match(document, /tr46@7\.0\.0/u);
  assert.match(document, /nontransitional/u);
  assert.match(document, /invalid A-label/u);
  assert.match(document, /Unicode and ASCII\/Punycode/u);
  assert.match(document, /M0-02.*PSL/u);
  assert.match(document, /M0-03.*UTS #39/u);
  assert.match(document, /ADR-0004.*M0-04/u);
  assert.match(document, /ADR-0006, ADR-0007 and ADR-0008 remain Proposed for M1/u);
  assert.match(document, /## Publication holds remain separate/u);
  assert.match(document, /Unicode.*PSL/u);
  assert.match(document, /no Chrome extension/u);
});
