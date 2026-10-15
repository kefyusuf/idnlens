# Roadmap and delivery gates

**Principle:** detailed documentation is not authorization to expand implementation scope. Do the smallest falsifiable work first.

## Gate 0 — Brief and dependency-selection spike (no implementation milestone yet)

Deliverables:
1. Review PRD, threat model, ADRs with explicit `Accepted`/`Superseded` statuses.
2. Run minimal offline library spike to compare at most two candidate IDNA implementations and one PSL parser against targeted fixtures. Check license, data provenance, package maintenance, correctness, and bundle impact.
3. Pin one Unicode security dataset version, UTS #39 revision, UTS #46 implementation/policy, PSL snapshot and checksums. Draft license/attribution notices.
4. Verify repository name and public license before repository/public publishing (working name is not cleared).

**Stop/go:** No new feature, browser extension scaffolding or catalog feed until parsing and source provenance choices are recorded.

## M0 — Offline domain analysis core

Suggested independently reviewable work units:

| Task | Scope | Verification |
|---|---|---|
| M0-01 | strict hostname input/IDNA normalization | invalid/valid Unicode roundtrip tests |
| M0-02 | PSL registrable-domain resolution | `co.uk`, subdomain, private/unknown suffix tests |
| M0-03 | Unicode script/skeleton extraction | referenced UTS #39 vectors |
| M0-04 | fixed protected-domain matching and classification | benign + lookalike + no-indicator + unsupported tests |
| M0-05 | evidence schema, reproducibility metadata and API documentation | schema snapshots, deterministic ordering |
| M0-06 | integration/property tests, performance and security review | M0 gate evidence report |

**M0 accepted only if:** all FR-01..08, approved fixtures, version provenance, performance report and non-goal compliance verified. **M0 result is a library, not a user-facing security product.**

## M1 — Minimal Chrome MVP

| Task | Scope | Verification |
|---|---|---|
| M1-01 | MV3 manifest/worker; top-frame HTTP(S) commit adapter | navigation smoke, minimum permissions |
| M1-02 | transient per-tab result and stale-navigation guards | race/worker-lifecycle tests |
| M1-03 | action badge + accessible popup explanations | keyboard, bidi, long-name test |
| M1-04 | vetted finite bundled protected-domain catalog | source and revision history |
| M1-05 | no-network, no-history, security and false-positive audit | permission/artifact check; review report |

**M1 accepted only if:** FR-09..12 and all M1 verification pass. Install unpacked on local test browser first. No automatic store publication.

## Beta/publishing gate (separate decision)

- Store policies/permissions and privacy disclosure current at date of submission.
- Branding/trademark/name check and asset/licensing inventory done.
- Clear listing states that the tool **does not block phishing** and **does not verify safe sites**.
- Independent review, installation test, ZIP integrity and signed/tagged source release.
- Release notes include known limitations, date of pinned Unicode/PSL data, and reproducible tests.

## HOLD: backlog, not to implement without a new ADR

Firefox/Edge binaries; manual watchlist editing; heuristic ASCII typos; visual font renderer; click interception; DNR/warnings before navigation; cloud feeds; transparency dashboard; user accounts; translations; paid product model. Measure real user need before approving any item.

## Project tracking format

Each task should have `{ID, scope, dependencies, acceptance, explicit non-goals, test evidence, PR/commit, status}`. Allowed statuses: `PROPOSED -> READY -> IN_PROGRESS -> VERIFYING -> DONE`, with `BLOCKED` for unmet dependencies. A task moves to DONE only with evidence bound to the reviewed commit.

## First next step

**Start Gate 0**, not M0 coding: select/pin the source data and parsing behavior with small reference tests. Do not create a generalized plugin platform or test numerous architectures unless concrete results demand it.