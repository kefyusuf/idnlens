import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('../../', import.meta.url));
const read = path => readFileSync(new URL('../../' + path, import.meta.url), 'utf8');
const gate = () => JSON.parse(read('docs/gates/GATE0-DECISION-READINESS.json'));

test('M0-01 PRD review reflects accepted policy without pretending implementation approval', () => {
  const prd = read('docs/PRD.md');
  assert.match(prd, /\*\*Status:\*\* Draft \/ M0-focused/u);
  assert.match(prd, /## M0-01 scope and design-review preparation/u);
  assert.match(prd, /ADR-0001, ADR-0002, and ADR-0003.*Accepted/u);
  assert.match(prd, /tr46@7\.0\.0/u);
  assert.match(prd, /strict nontransitional/u);
  assert.match(prd, /hostname-only/u);
  assert.match(prd, /M0-02.*PSL/u);
  assert.match(prd, /M0-03.*UTS #39/u);
  assert.match(prd, /internal use.*pending maintainer approval/iu);
  assert.match(prd, /M0-01 remains NOT AUTHORIZED/u);
  assert.doesNotMatch(prd, /Exact IDNA implementation and Unicode dataset versions: decide in M0 dependency spike/u);
  assert.doesNotMatch(prd, /Handling private PSL domains: define and lock behavior before implementation/u);
  assert.match(prd, /ICANN and PRIVATE.*ADR-0002/u);
});

test('threat-model M0-01 review binds T06, T08, T09 and T10 to bounded tests', () => {
  const threat = read('docs/THREAT-MODEL.md');
  assert.match(threat, /\*\*Status:\*\* Draft, first review needed before implementation/u);
  assert.match(threat, /## M0-01 security-review preparation/u);
  const section = threat.split('## M0-01 security-review preparation')[1]?.split('\n## ')[0];
  assert.ok(section, 'review preparation section missing');
  for (const id of ['T06', 'T08', 'T09', 'T10']) {
    assert.match(section, new RegExp('^\\| ' + id + ' \\|', 'mu'), id);
  }
  assert.match(section, /IP.*localhost/u);
  assert.match(section, /long.*Unicode/iu);
  assert.match(section, /no runtime network/iu);
  assert.match(section, /lockfile.*provenance/iu);
  assert.match(section, /maintainer review remains pending/iu);
  assert.match(section, /M0-01 remains NOT AUTHORIZED/u);
});

test('design review preparation cannot mutate M0 or distribution authorization', () => {
  const m = gate();
  assert.equal(m.status, 'OPEN');
  assert.equal(m.m0Authorized, false);
  assert.equal(m.releaseApproved, false);
  assert.equal(m.productionDependenciesApproved, false);
  assert.equal(m.authorizationBoundary.internalM0.authorized, false);
  assert.equal(m.authorizationBoundary.publicDistribution.authorized, false);
  assert.equal(m.authorizationBoundary.publicDistribution.status, 'BLOCKED');
  assert.deepEqual(m.adrStatuses, {
    'ADR-0001': 'Accepted',
    'ADR-0002': 'Accepted',
    'ADR-0003': 'Accepted',
  });
  assert.match(read('docs/gates/GATE0-M001-CLOSEOUT-REVIEW.md'), /\*\*Disposition: HOLD/u);
});
