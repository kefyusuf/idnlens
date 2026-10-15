import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { assessAuditReport, verifyLockedGraph } from './audit-evidence.mjs';

const root = fileURLToPath(new URL('./', import.meta.url));
const policy = {
  severityThreshold: 'low',
  requireZeroKnownVulnerabilities: true,
  graphs: {
    main: { root: '.', packages: { tr46: '7.0.0', punycode: '2.3.1', tldts: '7.4.18', 'tldts-core': '7.4.18' } },
    regex: { root: 'regex-replay', packages: { '@unicode/unicode-18.0.0': '2.0.7', regenerate: '1.4.2' } },
  },
};
const fixture = (counts = {}) => {
  const vulnerabilities = { info: 0, low: 0, moderate: 0, high: 0, critical: 0, ...counts };
  const total = Object.values(vulnerabilities).reduce((a, b) => a + b, 0);
  return {
    auditReportVersion: 2,
    vulnerabilities: total > 0 ? { sample: { name: 'sample', severity: 'moderate' } } : {},
    metadata: {
      vulnerabilities: { ...vulnerabilities, total },
      dependencies: { total: 7, prod: 6, dev: 0, optional: 0, peer: 0, peerOptional: 0 },
    },
  };
};

test('policy must identify two exact, already reviewed lockfile graphs', () => {
  const actual = JSON.parse(readFileSync(join(root, 'audit-policy.json'), 'utf8'));
  assert.deepEqual(actual, policy);
  const graphs = Object.keys(actual.graphs);
  assert.deepEqual(graphs, ['main', 'regex']);
  for (const name of graphs) {
    const lockDir = join(root, actual.graphs[name].root);
    const result = verifyLockedGraph(lockDir, actual.graphs[name].packages);
    assert.equal(result.packageCount, Object.keys(actual.graphs[name].packages).length);
  }
});

test('valid npm audit v2 response with zero known vulnerabilities passes narrowly', () => {
  assert.deepEqual(assessAuditReport(fixture(), 0, 4), {
    status: 'PASS_NO_KNOWN_ADVISORIES_AT_SCAN_TIME',
    total: 0,
    severities: { info: 0, low: 0, moderate: 0, high: 0, critical: 0 },
  });
});

test('any reported vulnerability is a review blocker; never auto-fix', () => {
  for (const severity of ['info', 'low', 'moderate', 'high', 'critical']) {
    const result = assessAuditReport(fixture({ [severity]: 1 }), 1, 4);
    assert.equal(result.status, 'BLOCKED_REVIEW_ADVISORIES', severity);
    assert.equal(result.total, 1);
  }
});

test('network/API errors, unsupported JSON and inconsistent counts fail closed', () => {
  for (const body of [
    { error: { code: 'E403', summary: 'registry returned 403' } },
    {},
    { auditReportVersion: 1, metadata: fixture().metadata },
    { auditReportVersion: 2, metadata: { vulnerabilities: {} } },
    fixture({ high: -1 }),
    { ...fixture(), metadata: { ...fixture().metadata, vulnerabilities: { ...fixture().metadata.vulnerabilities, total: 3 } } },
  ]) {
    assert.throws(() => assessAuditReport(body, 1, 4));
  }
  assert.throws(() => assessAuditReport({ ...fixture(), vulnerabilities: undefined }, 0, 4), /vulnerabilit/i);
  assert.throws(() => assessAuditReport({ ...fixture(), vulnerabilities: { unexpected: { severity: 'high' } } }, 0, 4), /vulnerabilit/i);
  assert.throws(() => assessAuditReport('not JSON', 0, 4));
  assert.throws(() => assessAuditReport(fixture(), 1, 4), /exit/i);
  assert.throws(() => assessAuditReport(fixture(), 2, 4), /exit/i);
  assert.throws(() => assessAuditReport(fixture(), 0, 0), /package/i);
});

test('installed versions must not silently change during advisory review', () => {
  const dir = join(root, 'regex-replay');
  assert.throws(() => verifyLockedGraph(dir, { regenerate: '9.9.9' }), /graph/i);
  assert.throws(() => verifyLockedGraph(root, { tldts: '7.4.18' }), /graph/i);
});
