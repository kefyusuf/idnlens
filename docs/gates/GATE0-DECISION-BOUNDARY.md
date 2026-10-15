# Gate 0-07A — Decision Authority and License Blocker Disposition

**Status:** Review boundary **DEFINED / MAINTAINER SIGNOFF PENDING**  
**Date:** 2026-10-15  
**Baseline:** `36d13fa0a2d051f95c7c38959ee11ad905f0afe0`  
**Scope:** One decision-boundary clarification and one upstream-license-evidence follow-up. No acceptance of ADRs, no M0 code, no extension, no release, no dependency or data upgrade.

## 1. Internal development and public distribution are separate decisions

**Internal M0-01 implementation — NOT AUTHORIZED YET.** The existing [Gate 0-06 readiness matrix](GATE0-DECISION-READINESS.json) remains open and requires an explicit maintainer decision. At a minimum, ADR-0001 (offline core), ADR-0002 (strict hostname/IDNA/PSL policy), and ADR-0003 (pinned data) need reviewed dispositions relevant to M0-01, followed by a recorded Gate 0 closure and M0-01 authorization. These three decisions alone do not automatically close every Gate 0 requirement. Remaining M0-specific ADRs must be reviewed before affected work.

**Public or binary distribution — BLOCKED independently.** The repository is already public, but its root does not contain a project `LICENSE`; this is a repository licensing decision, not a reason to invent a license. Third-party Unicode and MPL-2.0 PSL-derived data notices and the actual binary asset inventory are not cleared. Internal development approval, if later given, must not be interpreted as permission to package or publish a browser extension.

The machine-readable contract explicitly records both authorization decisions as **false**, even when all verification workflows pass.

## 2. Unicode generator-license follow-up

An upstream MIT license was found for the `node-unicode/node-unicode-data` generator:

- Generator repository snapshot: `node-unicode/node-unicode-data@6bb2993582494b715c78a10708a456be5249d188`.
- Actual MIT license: [`LICENSE-MIT.txt`](https://github.com/node-unicode/node-unicode-data/blob/6bb2993582494b715c78a10708a456be5249d188/LICENSE-MIT.txt); fixed Git blob `a41e0a7ef970ecdd83d82cd99bda97b22077bc62`.
- Generated-package release commit: [`node-unicode/unicode-18.0.0@f4cac36e42e85a43d037cb010fdb1f2eb17c1c36`](https://github.com/node-unicode/unicode-18.0.0/tree/f4cac36e42e85a43d037cb010fdb1f2eb17c1c36), tagged in commit description as version `2.0.7`. Its `package.json` declares MIT.
- **Observed blocker unchanged:** installed `@unicode/unicode-18.0.0@2.0.7` npm artifact contains no top-level bundled LICENSE/COPYING/NOTICE; no assumption that the generator's MIT license automatically satisfies all generated Unicode data notice obligations. License inventory remains `BLOCKED_MISSING_BUNDLED_LICENSE`.
- This npm helper is **only a Gate 0 regex generation/test dependency**, not one of the four reviewed M0 runtime candidate packages; it need not be imported or distributed by internal M0-01.

The upstream source improves attribution traceability, **not legal release clearance**. Final redistribution decisions must be taken against the actual release content and applicable Unicode-3.0 / PSL MPL-2.0 requirements. Do not silently copy or relabel an unrelated MIT notice.

## 3. PSL generator replay boundary

The [PSL chain](GATE0-PSL-PROVENANCE.md) establishes exact source Gitlink and hash plus byte identity between tagged and npm-packaged `tldts@7.4.18` trie. [Gate 0-06](GATE0-DECISION-READINESS.md) recommended that generator replay should *not be a prerequisite merely to select a candidate*, because doing so adds a separate upstream toolchain and does not address the presently blocking maintainer/signoff question.

This remains a **review recommendation**, not an accepted waiver or claim of source-to-output reproducibility. If an M0 build later derives a new PSL artifact or claims complete source replay, that task must prove it in its own TDD slice.

## 4. Exact remaining decision

The maintainer must explicitly record a choice for the Gate 0 design direction (accept, amend or reject ADR-0001/0002/0003 with any dependencies of M0-01), whether candidate dependency selection is acceptable for **internal work**, and whether to keep Gate 0 open for other requirements. No action in this PR impersonates that approval.

The project source-license choice and third-party notices remain **publication gates**, separately from authorizing internal tests.

## 5. Verification and non-goals

The existing Gate 0 dependency CI now additionally rejects decision-record changes that implicitly grant M0 permission, promote project publication, misstate third-party notices, or claim ADR acceptance without source changes. RED is a specific missing boundary in the previous decision record; GREEN requires exact separation while preserving existing package and source fingerprints.

**No new package, workflow, feature, browser adapter, data feed, policy engine or production implementation.** This review should be merged only after exact-head CI and commit-scope review. Gate 0 and ADRs remain pending after merge.
