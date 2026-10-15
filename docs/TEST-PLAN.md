# Test and verification plan

**Status:** Proposed test gate specification, not test results.

## 1. Strategy

Tests are **evidence first**: standard-based examples, synthetic attack cases, benign IDNs, PSL domain boundaries, schema contract and browser lifecycle. Keep known expected output from standard/reference datasets separate from heuristic expectations or hypotheses. The initial `test-fixtures/cases.csv` contains **test proposals**, not verified outputs; mark `expected` values after pinning datasets and independent review.

### Test suites

| Suite | What | Required before |
|---|---|---|
| U1 | IDNA A-label/U-label roundtrip, case normalization, invalid labels | M0 |
| U2 | PSL eTLD+1 extraction; multi-label suffixes; private rules; unknown TLDs | M0 |
| U3 | UTS #39 script sets, skeleton, mixed/whole-script conformance vectors | M0 |
| U4 | Catalog matching and same-suffix policy | M0 |
| U5 | Outcome priority, evidence stability, schema and no unsafe claims | M0 |
| P1 | Property/fuzz tests: arbitrary Unicode, malicious lengths, invalid UTF-16; no unhandled crash | M0 |
| P2 | Deterministic output with pinned datasets, stable ordering | M0 |
| E1 | MV3 top-frame navigation badge, popup and session storage, no stale state | M1 |
| E2 | UI screenreader/keyboard/bidi/no HTML injection | M1 |
| S1 | Dependency/license audit, package inspection, no network/overbroad permissions | M1 |
| B1 | Benchmark p95 time with versioned sample & stated machine | M0 and M1 |

## 2. Positive cases

- Cyrillic `а` (U+0430) replacing Latin `a` (U+0061) inside a protected same-suffix name.
- Full-script Cyrillic name designed to resemble Latin protected registrable label.
- Mixed Latin/Greek and Latin/Cyrillic labels where UTS #39 marks a confusable possibility.
- A-label (`xn--...`) and U-label spellings yield equivalent analysis.
- `www.` and other subdomains of a protected registrable domain are not impersonation solely on subdomain name.

## 3. Benign and false-positive controls

- ASCII protected domain identical to catalog entry.
- Legitimate diacritic-bearing Latin IDNs (e.g., `bücher.de`).
- Non-Latin domain with no protected catalog match (e.g., `例え.テスト` may be reserved; treat as parsing fixture only, not an active site).
- A valid IDN from a non-Latin writing system with an ordinary script pattern.
- A non-target domain whose skeleton resembles no protected entry.
- Different TLD with similar second-level label; remains non-LOOKALIKE under v0 policy.
- `xn--` text appearing in unrelated URL path must not influence hostname analysis.

## 4. Boundary/adversarial controls

- Credential/userinfo (`https://trusted.example@attacker.example/`), scheme-relative links, multi-label suffix (`co.uk`), trailing dot, label length bounds, Unicode NFD/NFC, bidirectional controls, malformed A-label, unpaired surrogate, IP literals, localhost, unknown suffix, private PSL entry, percent encoding and delimiters.
- Reject URL strings passed into hostname-only core, rather than trying to guess.
- No network requests, no HTML evaluation.
- Rapid navigations with old-analysis completion and tab reload/close; stale results must never overwrite current navigation.

## 5. Metric interpretation

**Do not claim measured accuracy without a benchmark corpus.** Maintain separate labeled sets:

- `positive-review`: reference-proven confusable examples;
- `negative-benign`: reviewed real IDNs where a LOOKALIKE alert would be wrong;
- `unsupported`: intentionally invalid/out-of-scope inputs;
- `unknown`: ambiguous cases excluded from pass/fail accuracy until adjudicated.

For a tested release report: counts, matched/unmatched, per-category false positives/false negatives, dataset provenance, dataset age, test environment and the exact definitions of numerator/denominator. For an initial fixed curated benign corpus, require **zero unintended `LOOKALIKE` classifications** before release, while avoiding a claim of universal zero false positives.

## 6. Benchmarks and CI gates

- Run determinism/schema/unit tests on Linux and Windows for Node.js LTS versions explicitly selected at implementation.
- TypeScript type-check and formatting check.
- Benchmark 1,000 known inputs after warmup; measure time distribution; document machine, versions and load. Initial performance *target*: p95 under 20 ms per analysis. Treat regression as a review gate, not blindly as a public SLA.
- Lockfile must remain stable in CI; no runtime external data fetching. Network only used to install dependencies in build environments, subject to standard CI restrictions.
- Dependency vulnerability scan where tools available, review transitive licenses, inspect artifact contents.
- M1 manual Chrome unpacked smoke: normal domain; reviewed suspicious synthetic hostname parsing; UI visible; tab switch; new navigation; service worker restart; no full URL in storage.

## 7. Required traceability per change

For each code PR: requirement/ADR reference, threat(s) affected, failing regression test (if defect), passing suite evidence, deviations from standard, bundle/permission changes, and user-facing message changes.

## 8. Test fixtures status

`../test-fixtures/cases.csv` is a **seed set**. The `hypothesis` column intentionally does not assert outcomes for all examples. At M0 gate, convert reviewed cases into machine-readable records with Unicode/PSL version, explicit `expectedOutcome`, and standard/test citation. Do not turn conceptual rows into green tests without validating reference mappings.