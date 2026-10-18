# Gate 0-08 — Internal M0-01 Closeout and Start Review

**Disposition: HOLD — explicit maintainer scope/security signoff and separate start approval required.**  
**Reviewed:** 2026-10-18  
**Immutable baseline:** `main@cd8f4bacb1536fcc5f18e364a5cda07f3b8ed4bb` (squash merge of PR #13).  
**Scope:** Internal M0-01 entry decision *assessment only*. No authorization, implementation, dependency change, release asset, or extension code.

Gate 0 remains OPEN; M0-01 remains NOT AUTHORIZED; public distribution remains BLOCKED. This document assesses an existing decision boundary. Neither merging this review nor successful CI changes those three facts.

## Evidence already satisfied

| Gate 0 evidence | Observed disposition | Reference |
|---|---|---|
| Offline deterministic-core direction | ADR-0001 `Accepted` as design only | [ADR-0001](../adr/ADR-0001.md), [PR #13](https://github.com/kefyusuf/idnlens/pull/13) |
| Strict IDNA and registrable-domain direction | ADR-0002 `Accepted` as design only | [ADR-0002](../adr/ADR-0002.md), [candidate fixtures](../../spikes/gate0/idna-dependencies.test.mjs) |
| Immutable Unicode/PSL provenance policy | ADR-0003 `Accepted` as design only | [ADR-0003](../adr/ADR-0003.md), [readiness record](GATE0-DECISION-READINESS.json) |
| IDNA/PSL candidate behavior and provenance | `tr46@7.0.0` and `tldts@7.4.18` evaluated with targeted offline probes; lockfile, source fingerprints, notices, advisory snapshot, and dependency-only bundle measurements recorded | [Gate 0-06 review](GATE0-DECISION-READINESS.md) |
| Exact-head change verification | [PR #13](https://github.com/kefyusuf/idnlens/pull/13) squash merged; nine checks passed on the resulting `main` commit | [merge commit](https://github.com/kefyusuf/idnlens/commit/cd8f4bacb1536fcc5f18e364a5cda07f3b8ed4bb) |

This is sufficient to **prepare a bounded internal implementation decision**, not to assert that any M0 behavior has been implemented, conformance-tested, or certified safe.

## Unresolved prerequisites

1. **Maintainer scope/security review:** [PRD](../PRD.md) remains `Draft / M0-focused`; the [threat model](../THREAT-MODEL.md) explicitly requires its first review before implementation. The maintainer must confirm that M0-01's hostname-only scope and the relevant hostile-input, privacy, and supply-chain risks (T06, T08, T09, T10) are acceptable as a starting design. This is a review of existing documents, **not permission to expand the threat model or product**.
2. **Internal dependency decision:** Explicitly approve or reject `tr46@7.0.0` as a **version-locked candidate for internal M0-01 implementation**, with existing strict nontransitional UTS #46 policy. `tldts@7.4.18` is a researched candidate for **M0-02**, not an M0-01 implementation requirement. Neither decision constitutes final shipping/redistribution clearance.
3. **Separate Gate 0 closeout and M0-01 start authorization:** Record the maintainer's explicit Go/No-Go scope, the gate's completion disposition, and permission to begin *only* M0-01. The current [machine-readable readiness record](GATE0-DECISION-READINESS.json) stays `OPEN` with `m0Authorized: false` and `authorizationBoundary.internalM0.authorized: false` until then. A generic continuation instruction or green CI is **not** this decision.

Remaining `Proposed` decisions ADR-0004/0005 concern classification and protected-catalog work (M0-04 and later), not the normalization-only first slice. Review them before their affected work; do not silently treat them as accepted today.

## M0-01 only: first TDD slice

**Purpose:** a hostname-only, synchronous, offline TypeScript normalization boundary with deterministic accepted/rejected results. The input is an untrusted hostname string, **not** a URL or an arbitrary brand name. Use the reviewed `tr46@7.0.0` strict nontransitional mapping policy with `checkBidi`, `checkHyphens`, `checkJoiners`, `useSTD3ASCIIRules`, `verifyDNSLength` enabled; `transitionalProcessing` and `ignoreInvalidPunycode` disabled.

**RED tests first (using pinned fixtures):** uppercase ASCII and ordinary DNS labels; Unicode and ASCII/Punycode round trips (`bücher.de` / `xn--bcher-kva.de`); nontransitional `faß.de`; Cyrillic-lookalike labels **as IDNA syntax only**, not as attack verdicts; trailing-dot normalization; invalid A-label and punycode, missing/empty labels, overlong labels, hyphen errors, joiner/bidi cases, unpaired surrogate, URL/userinfo/port/path, localhost and IP literals, and non-string inputs. Confirm deterministic repeatability without runtime DNS, fetch, browser API, database, or AI service.

**Minimal GREEN:** implement only hostname input validation plus normalized ASCII/Unicode host spellings or an explicit unsupported result (not `SAFE`/`MALICIOUS`). Bind tests to the exact dependency version and document deviations. Run static/input-boundary review and preserve RED → GREEN → refactor → CI evidence on a dedicated branch.

**Explicit exclusions:** **M0-02 PSL** registrable-domain resolution, **M0-03 UTS #39** skeleton/scripts, **ADR-0004 / M0-04** classification, ADR-0005 protected-domain catalog, UI, and no Chrome extension. M0-01 does **not** implement `analyzeDomain()` or claim a complete lookalike detector. Keep registrable-domain and outcome decisions for their own authorized work units.

## Publication holds remain separate

The raw Unicode security data, PSL-derived trie and third-party license notices require release-specific review. The build-only Unicode helper has a published-artifact license notice gap; it need not become an M0 runtime dependency. No root project `LICENSE` has been chosen. **Unicode and PSL redistribution clearance, source licensing, brand/name checks, packaging, public repository reuse claims, Chrome store publishing, and production release remain outside this internal start assessment.**

An internal M0-01 Go decision may be considered **without falsely clearing publication holds**. Licensing obligations still apply to internal dependency use; this review is not legal advice and makes no assertion of public distribution rights.

## Explicit maintainer decision required

Select and document **one** outcome *in a later, separately reviewed authorization PR*:

- **GO (limited internal work):** accept the existing PRD/threat-model scope review, approve the exact locked M0-01 normalization dependency/policy, record a scoped Gate 0 closeout disposition, and explicitly authorize **only M0-01** with the tests and exclusions above. Keep other milestone and public release holds.
- **NO-GO:** retain Gate 0 OPEN and M0-01 unauthorized; identify the specific missing review or candidate-policy issue rather than starting further generic research.

**Current outcome is HOLD; neither option has been selected.** After this assessment PR, the next action is a maintainer decision, not an automated status mutation or new implementation branch.
