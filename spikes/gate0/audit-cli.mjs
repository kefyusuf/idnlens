import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assessAuditReport, verifyLockedGraph } from './audit-evidence.mjs';

const [graph, reportPath, rawExit] = process.argv.slice(2);
const root = dirname(fileURLToPath(import.meta.url));

try {
  const policy = JSON.parse(readFileSync(join(root, 'audit-policy.json'), 'utf8'));
  if (!Object.hasOwn(policy.graphs, graph) || !reportPath ||
      !/^(0|1|[2-9][0-9]*)$/u.test(rawExit)) {
    throw new Error('Unknown graph or invalid audit command arguments');
  }
  const locked = verifyLockedGraph(
    join(root, policy.graphs[graph].root), policy.graphs[graph].packages
  );
  const report = JSON.parse(readFileSync(reportPath, 'utf8'));
  const result = assessAuditReport(report, Number(rawExit), locked.packageCount);
  const evidence = {
    graph, atUTC: new Date().toISOString(),
    packageCount: locked.packageCount,
    advisorySource: 'https://registry.npmjs.org/',
    auditTool: 'npm audit --json --audit-level=low',
    ...result,
  };
  process.stdout.write(JSON.stringify(evidence) + '\n');
  if (result.status !== 'PASS_NO_KNOWN_ADVISORIES_AT_SCAN_TIME') process.exitCode = 1;
} catch (err) {
  process.stderr.write('SECURITY_REVIEW_UNAVAILABLE_OR_INVALID: ' + err.message + '\n');
  process.exitCode = 2;
}
