# Gate 0-03E — TR46 generated regex provenance and offline replay

**Status:** Regex-source replay **PASS**; overall Gate 0 **OPEN**.  
**Date:** 2026-10-15  
**Scope:** `tr46@7.0.0` generated `lib/regexes.js` and its immediate inputs. No M0 implementation, browser adapter, production-data bundling or ADR status changes.

## Source-to-package chain

- Source release: `jsdom/tr46` tag `v7.0.0`, anchored to immutable commit `6d09104f21991d496aa2a8535d21bdea91a9c216` (tag identity established in [Gate 0-03D](GATE0-TR46-MAPPING-PROVENANCE.md)).
- [Tagged generator](https://github.com/jsdom/tr46/blob/6d09104f21991d496aa2a8535d21bdea91a9c216/scripts/generateRegexes.mjs) reads **Unicode 18.0.0** data from two versioned upstream files, plus Unicode property arrays shipped in `@unicode/unicode-18.0.0@2.0.7`.
- The two remote inputs are `DerivedJoiningType.txt` and `DerivedCombiningClass.txt`. The generator also uses `regenerate@1.4.2`.
- Replayer package and npm lockfile are isolated in `spikes/gate0/regex-replay/`. The two helper packages and SHA-512 npm integrity values were selected from the **tagged upstream TR46 lockfile**; both are exact-locked. This graph is only used during the Gate 0 CI.
- `spikes/gate0/tr46-regex-sources.json` records immutable source URL, SHA-256 source fingerprints and SHA-256 of the **published `regexes.js`**. No source-data copy is committed.

## Verified SHA-256

| Artifact | SHA-256 |
|---|---|
| `scripts/generateRegexes.mjs` from fixed TR46 commit | `4f30b5268ffe684c1e2a90705ebd33e785285b1bce8e4a00d8cc77cb806f70a4` |
| Unicode `DerivedJoiningType.txt` | `e2408ff2c92b175b0f7bf62c989bbb54c7b077528fe31f8d69b96fa09e7d61ed` |
| Unicode `DerivedCombiningClass.txt` | `ef6b2611cfb660dba3f6b458b9eb4b05f44ed2417302ee7749d7f0f348793121` |
| Published/replayed `lib/regexes.js` | `eb690752aa1b1ac024251681317369bf96df463f3632d650163e0b8b658e4e1d` |

The committed JSON manifest and exact replay lockfile are canonical; the copied digests above are for human inspection.

## TDD RED → GREEN evidence

- **RED:** commit `a741750`, [Actions run 38729130973](https://github.com/kefyusuf/idnlens/actions/runs/38729130973). All files fetched and SHA-256 printed; the intentionally missing manifest caused **3 failures**, with the locked dependency graph and tamper control **2 passes**. This was a real test failure, not a CI/network error.
- **GREEN:** commit `d96f434`, [Actions run 38729214340](https://github.com/kefyusuf/idnlens/actions/runs/38729214340). **5/5** tests passed.
- The tagged generator is executed under Node 22.16.0 with a child-process `fetch` override. Only two expected official Unicode URLs can be resolved to the verified **local** source files. Any unexpected request throws. The resulting `regexes.js` is byte-for-byte identical to the source included in the already locked `tr46@7.0.0` package.
- Baseline, PSL, Unicode and existing TR46 mapping tests remain in separate workflows. No production library or browser-extension code changed.

## Boundaries and remaining Gate 0 work

This verifies **the exact produced regex artifact for these pinned inputs and tools on the CI runtime**. It does not formally prove all TR46 implementation behavior, domain safety, Unicode conformance or reproducible future package releases. The source files are fetched only for CI proof, never during M0/M1 runtime. The upstream versioned URLs are subject to remote availability; the recorded digest detects unexpected changes.

The remaining Gate 0 work is: all package and underlying data license/notice requirements; dependency security and maintenance review; measured browser-oriented package size; any remaining PSL generator proof deemed essential; and a recorded accept/reject decision for ADR-0002/0003. Both ADRs remain **Proposed** and M0 work is **not authorized** by this PR.
