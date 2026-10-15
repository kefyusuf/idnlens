# Gate 0-06 — ADR-0002/0003 Decision Readiness Review

**Status:** EVIDENCE REVIEW COMPLETE — **GATE 0 OPEN / DECISION PENDING**  
**Reviewed:** 2026-10-15  
**Evidence baseline:** [main `1b73091b95eb5dd734d175832e053c3bd9c620c5`](https://github.com/kefyusuf/idnlens/commit/1b73091b95eb5dd734d175832e053c3bd9c620c5)  
**Machine-readable findings:** [GATE0-DECISION-READINESS.json](GATE0-DECISION-READINESS.json)

This is a bounded **decision-preparation** review, not an ADR acceptance, a license clearance, a code change to M0, a browser extension, or a release authorization. Both ADRs remain **Proposed**. The repository remains limited to planning material and Gate 0 spikes.

## 1. Recommendation: ADR-0002 (normalization and registrable-domain identity)

**Recommendation for maintainer review: retain the proposed design** and use the already pinned `tr46@7.0.0` (UTS #46 Unicode 18.0, nontransitional strict behavior) and `tldts@7.4.18` (explicitly enabling ICANN and PRIVATE PSL suffix rules) as **candidate** dependencies for the eventual M0 implementation. Do **not** label these as approved production dependencies yet.

Evidence:
- [Node baseline](GATE0-IDNA-BASELINE.md) demonstrated that the built-in Node conversion by itself is not an adequate strict hostname boundary.
- [Candidate behavior comparisons](GATE0-DEPENDENCY-COMPARISON.md) cover expected valid/invalid hostnames, A-labels, joining controls, nontransitional ß behavior, compound suffixes, private suffixes and unknown suffixes.
- [Tagged TR46 mapping](GATE0-TR46-MAPPING-PROVENANCE.md) and [regex generator replay](GATE0-TR46-REGEX-PROVENANCE.md) reproduce the locked npm data bytes from pinned Unicode inputs.
- [PSL source identity](GATE0-PSL-PROVENANCE.md) ties tagged `tldts` to a pinned gitlink and byte-identical npm trie.

**Policy to approve later, not implemented by this review:** accept hostnames, not URLs; reject IPs, localhost, malformed or ambiguous hosts with `UNSUPPORTED`; use explicit nontransitional UTS #46 checks; compute registrable domains using known ICANN/PRIVATE suffixes; do not treat a successfully normalized IDN or an unknown suffix as proof that a website is safe or malicious. Domain registrability at a live registry is outside scope.

**Remaining ADR-0002 decision:** formal maintainer review and acceptance (or amendment). The Gate 0 comparison is limited, not a full IDNA/PSL conformance suite; implementation-time conformance and false-positive tests remain M0 tasks.

## 2. Recommendation: ADR-0003 (version-pinned standards data)

**Recommendation for maintainer review: retain the pinning/provenance policy.** The following sources are recorded, but no final M0 dataset pipeline has been implemented:

| Input | Reviewed fixed identity | Evidence |
|---|---|---|
| UTS #39 | Unicode `18.0.0`, Revision `34`; four raw security/script files with SHA-256 | [Unicode source manifest](../../spikes/gate0/unicode-sources.json), [Gate 0-03B](GATE0-UNICODE-SOURCES.md) |
| UTS #46 | `tr46@7.0.0`, Unicode 18.0, Revision `36`; mapping + generated regex byte replay | [Gate 0-03D](GATE0-TR46-MAPPING-PROVENANCE.md), [Gate 0-03E](GATE0-TR46-REGEX-PROVENANCE.md) |
| PSL | `publicsuffix/list@3929462652695bad04f0a27afb600974014a3c8b`; original source and tagged/generated npm trie hashed | [PSL manifest](../../spikes/gate0/psl-sources.json), [Gate 0-03C](GATE0-PSL-PROVENANCE.md) |
| npm | Exact direct/transitive versions, registry URLs and SHA-512 integrity | [Gate 0-03A](GATE0-LOCKFILE-INTEGRITY.md) |

For M0, source transformations and notices must be traceable, and **no runtime fetching** is permitted. UTS #39 confusable skeleton/script transformation and conformance vectors have *not* been implemented: raw file hashes are not proof of those later algorithms.

## 3. PSL generator replay: a consciously bounded recommendation

**Proposed disposition: NOT REQUIRED FOR CANDIDATE SELECTION, with explicit caveat.**

The existing [Gate 0-03C](GATE0-PSL-PROVENANCE.md) trace verifies the immutable PSL input snapshot, the submodule gitlink at the tagged `tldts` source tree, and byte identity between the tagged trie source and installed npm source. This is sufficient *source identity evidence to evaluate the candidate* without importing an upstream generator toolchain merely for more research.

**It does not prove source-to-generated-trie reproducibility** or fully audit the upstream generator. If IDNLens later changes/rebuilds the trie, changes `tldts` versions, introduces a custom PSL dataset, requires fully reproducible from-source artifacts, or an independent review flags generation risk, the generator and its inputs must be replayed in a separate bounded unit. This disposition is a **review recommendation**, not a maintainer-accepted waiver.

## 4. Remaining holds, correctly separated

| Risk / hold | Blocks now | Next minimal action |
|---|---|---|
| **ADR owner sign-off** | Accepting ADR-0002/0003; authorizing M0-01 | Maintainer reviews this evidence and records an explicit Accepted/Amended/Rejected decision in a separate PR |
| **Unicode helper package notice** | Claiming full third-party-notice clearance for the Gate 0 tooling and any distribution that includes it | Resolve `@unicode/unicode-18.0.0@2.0.7` MIT copyright/license text from a trusted origin; note that this package is **Gate 0 tooling only**, not in the candidate M0 runtime graph |
| **Unicode/PSL redistribution notices** | Any public distribution of bundled data or derived trie without a reviewed notice strategy | Decide treatment of Unicode-3.0 and MPL-2.0 sources, preserve upstream notices, verify final artifact contents |
| **Repository source license** | Declaring the already-public source legally reusable under a chosen open-source license or calling publication clearance complete | Explicit maintainer choice of root `LICENSE`, if any; review branding/name status separately |
| **UTS #39 generator/fixtures and M0 behavior** | M0 acceptance, **not** mere Gate 0 evidence collection | Work under the later M0 tasks only after design decisions are accepted |
| **Advisory freshness** | Future release or production dependency acceptance based solely on the old scan | Re-run fail-closed npm audit on the exact approved lockfiles close to each review/release |

The [license evidence report](GATE0-LICENSE-EVIDENCE.md) identifies actual package notices and the Unicode-tooling gap; the [notices draft](../THIRD-PARTY-NOTICES-DRAFT.md) is intentionally **not a final distribution notice bundle**. The [advisory report](GATE0-ADVISORY-MAINTENANCE.md) found zero reported npm vulnerabilities on 2026-10-15, which is neither an attestation nor a permanent guarantee.

## 5. Bundle impact, without a premature threshold

[Gate 0-05](GATE0-BUNDLE-FOOTPRINT.md) measured the **candidate dependencies alone** at 351,330 bytes minified, 110,078 bytes gzip and 76,864 bytes Brotli for its combined entrypoint, using pinned `esbuild@0.25.12` with a Chrome 120 benchmark target. This is **not** the finished M0, extension, runtime-memory or startup-time footprint. It does not justify changing scope, introducing more frameworks, or choosing another PSL engine without evidence of a concrete budget problem.

## 6. Stop/go recommendation and next bounded unit

**Gate 0-06 evidence readiness: PASS as a review package; Gate 0 overall: OPEN.** No authorization has been granted to implement M0. ADR-0002 and ADR-0003 stay Proposed in their source files and in `docs/DECISIONS.md`.

Next bounded action: **record explicit maintainer decisions** on ADR-0002/0003 and the disposition of license/notice blockers, in a separate scope-checked PR. Do not conflate a decision to start *internal* M0 development with permission to distribute binaries or derived data. If the decision owner cannot approve, keep Gate 0 blocked and work only on the specific blocking evidence.

All work must continue via RED → GREEN → verification → feature branch commit → PR CI/review → exact-head squash merge; release/deployment remain out of scope.
