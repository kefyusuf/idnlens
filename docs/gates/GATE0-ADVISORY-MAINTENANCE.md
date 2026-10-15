# Gate 0-04B — npm Advisory & Maintenance Review

**Date:** 2026-10-15  
**Status:** Scoped security scan **PASS at observed time**; overall Gate 0 **OPEN**.  
**Applies to:** Two already locked Gate 0 npm graphs, six packages total. No package upgrade, runtime security classifier, deployment, Chrome extension, or M0 implementation.

## 1. Scan method and immutable graph scope

The reviewed source graphs are pinned in `spikes/gate0/package-lock.json` and `spikes/gate0/regex-replay/package-lock.json` (npm v3, SHA-512 tarball integrity):

| Graph | Packages | Role |
|---|---|---|
| `main` | `tr46@7.0.0`, `punycode@2.3.1`, `tldts@7.4.18`, `tldts-core@7.4.18` | Gate 0 IDNA/PSL candidate runtime dependencies |
| `regex` | `@unicode/unicode-18.0.0@2.0.7`, `regenerate@1.4.2` | Gate 0-only regex regeneration toolchain |

CI executes `npm ci --ignore-scripts --no-audit --no-fund` against both exact locks, tests the graph against `audit-policy.json`, then queries the **live public npm registry** using `npm audit --json --audit-level=low --registry=https://registry.npmjs.org/`. The registry query runs only in CI; IDNLens production code has no network dependencies.

The JSON parser and exit-code evaluator explicitly reject malformed/error responses, incomplete graph coverage, invalid severity totals and inconsistent vulnerability-detail maps. Any reported finding blocks this Gate 0 security review; nothing runs `npm audit fix` and packages are never silently upgraded.

**Observed scan result:** [GitHub Actions run 38731751240](https://github.com/kefyusuf/idnlens/actions/runs/38731751240) on 2026-10-15 at:
- **12:03:25.398 UTC** — `main`, 4 packages: **0 vulnerabilities** (info/low/moderate/high/critical = 0)
- **12:03:25.766 UTC** — `regex`, 2 packages: **0 vulnerabilities** (info/low/moderate/high/critical = 0)

These are observations at the recorded time from npm's advisory service, **not proof of safety**. An advisory published afterward, an unreported exploit, malicious code, an unsupported vulnerability database, or loss of registry access is outside this scan's guarantee. Do not use this result as a phishing safety verdict.

## 2. Maintenance source review (as of 2026-10-15)

Upstream GitHub repository metadata was inspected and recorded as a *maintenance signal*, not a security certification or a proof of actual maintainer responsiveness.

| Locked package(s) | Upstream source | Repository archived? | Last observed upstream push UTC | Interpretation |
|---|---|---|---|---|
| `tr46@7.0.0` | [jsdom/tr46](https://github.com/jsdom/tr46) | No | 2026-10-04 | Recent release aligned with Unicode 18 |
| `tldts@7.4.18`, `tldts-core@7.4.18` | [remusao/tldts](https://github.com/remusao/tldts) | No | 2026-10-14 | Recent repository activity |
| `punycode@2.3.1` | [mathiasbynens/punycode.js](https://github.com/mathiasbynens/punycode.js) | No | 2024-04-18 | Older source-push activity; monitor and review compatibility; do not infer vulnerability or abandonment |
| `regenerate@1.4.2` | [mathiasbynens/regenerate](https://github.com/mathiasbynens/regenerate) | No | 2026-10-04 | Recent repository activity |
| `@unicode/unicode-18.0.0@2.0.7` | [node-unicode/unicode-18.0.0](https://github.com/node-unicode/unicode-18.0.0) | No | 2026-09-11 | Version-specific generator package, Gate 0 tooling only |

The observed `pushed_at` date is **not the publication date of the locked package**. Historical activity, open issues, release cadence and governance still require contextual review if the product scope or security requirements change. Do not add automated remote monitoring in this PR.

## 3. TDD and checks

- **RED:** commit `bc9f149`, [Actions run 38731199661](https://github.com/kefyusuf/idnlens/actions/runs/38731199661): Node imports failed as expected because `audit-evidence.mjs` did not yet exist; npm lockfile installations passed.
- **GREEN:** commit `91a0b67`, [Actions run 38731406975](https://github.com/kefyusuf/idnlens/actions/runs/38731406975): **5/5 tests** and real registry scans of both graphs passed.
- **Negative-case hardening:** commit `c8c1c5b`, [expected failing Actions run 38731640965](https://github.com/kefyusuf/idnlens/actions/runs/38731640965), proved that inconsistent advisory-detail JSON was erroneously permitted. The fix in `1a5ee62` and matching positive fixtures in `f2cce6a` produced **5/5 tests plus two valid zero-advisory scans**, evidenced by run 38731751240.
- CI reports capture UTC time, graph ID, package count, severity counts and the linked workflow revision. No secrets or package mutations are part of the task.

## 4. Unresolved / release holds

- **Gate 0-04A finding is not fixed:** `@unicode/unicode-18.0.0@2.0.7` declares MIT metadata but lacks a bundled top-level license/notice file. Distribution notices still require review.
- Unicode License V3 source-data attribution and MPL-2.0 PSL-derived data treatment remain open.
- A later security advisory must trigger a new reviewed task; **today's zero-advisory scan is not permanent clearance**.
- **Bundle footprint measurement** remains required; a separate minimal measurement gate should precede ADR-0002/0003 acceptance.
- The PSL upstream generator has not been independently replayed from source; its immutable source/gitlink and shipped trie byte identity have been verified separately in Gate 0-03C. Decide whether replay is a required release gate, rather than assuming it happened.
- No production dependency choice is approved, ADR-0002/0003 remain **Proposed**, and **M0 is not authorized**.

This report is security-review evidence for a restricted dependency selection spike, not a product-security assurance or production release approval.
