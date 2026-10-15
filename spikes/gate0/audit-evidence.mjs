import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const severities = ['info', 'low', 'moderate', 'high', 'critical'];
const keys = (o) => Object.keys(o).sort();

export function verifyLockedGraph(dir, expected) {
  const lock = JSON.parse(readFileSync(join(dir, 'package-lock.json'), 'utf8'));
  const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
  assert.equal(lock.lockfileVersion, 3, 'expected immutable lockfile v3');
  const actual = {};
  for (const [path, item] of Object.entries(lock.packages)) {
    if (!path) continue;
    assert.ok(path.startsWith('node_modules/'), 'unexpected graph path');
    actual[path.slice('node_modules/'.length)] = item.version;
    assert.match(item.integrity, /^sha512-[A-Za-z0-9+/]+={0,2}$/u);
  }
  assert.deepEqual(keys(actual), keys(expected), 'locked graph differs from reviewed packages');
  assert.deepEqual(actual, expected, 'locked graph version mismatch');
  assert.deepEqual(lock.packages[''].dependencies, pkg.dependencies);
  for (const [name, version] of Object.entries(pkg.dependencies)) {
    assert.equal(actual[name], version, 'direct dependency must be exact');
  }
  return { packageCount: keys(actual).length };
}

export function assessAuditReport(report, exitCode, minimumPackages) {
  if (!report || typeof report !== 'object' || Array.isArray(report) ||
      report.error || report.auditReportVersion !== 2) {
    throw new Error('Audit registry response invalid/unavailable');
  }
  const details = report.vulnerabilities;
  if (!details || typeof details !== 'object' || Array.isArray(details)) {
    throw new Error('Audit vulnerabilities payload missing or invalid');
  }
  const counts = report.metadata?.vulnerabilities;
  const dependencies = report.metadata?.dependencies;
  if (!counts || !dependencies || !Number.isInteger(dependencies.total) ||
      dependencies.total < minimumPackages || minimumPackages < 1) {
    throw new Error('Audit response has incomplete package coverage');
  }
  const summarized = {};
  for (const severity of severities) {
    const count = counts[severity];
    if (!Number.isSafeInteger(count) || count < 0) {
      throw new Error('Missing/invalid severity count for ' + severity);
    }
    summarized[severity] = count;
  }
  const total = severities.reduce((sum, severity) => sum + summarized[severity], 0);
  if (!Number.isSafeInteger(counts.total) || counts.total !== total) {
    throw new Error('Audit severity totals inconsistent');
  }
  if ((total === 0 && Object.keys(details).length !== 0) ||
      (total > 0 && Object.keys(details).length === 0)) {
    throw new Error('Audit vulnerabilities detail map inconsistent with severity totals');
  }
  if (total === 0) {
    if (exitCode !== 0) {
      throw new Error('Audit exit status disagrees with empty advisory report');
    }
    return { status: 'PASS_NO_KNOWN_ADVISORIES_AT_SCAN_TIME', total, severities: summarized };
  }
  if (exitCode !== 1) {
    throw new Error('Audit exit status invalid for reported vulnerabilities');
  }
  return { status: 'BLOCKED_REVIEW_ADVISORIES', total, severities: summarized };
}
