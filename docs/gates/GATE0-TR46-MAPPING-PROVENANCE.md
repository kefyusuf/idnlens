# Gate 0-03D — TR46 mapping source provenance and offline replay

**Status:** Mapping-table sub-gate **PASS**; complete TR46 data provenance and overall Gate 0 remain **OPEN**.  
**Date:** 2026-10-15  
**Scope:** Only mapping-table provenance for the already locked `tr46@7.0.0` candidate. No M0 or browser code and no production dependency decision.

## Immutable evidence chain

1. [TR46 v7.0.0](https://github.com/jsdom/tr46/releases/tag/v7.0.0) (2026-10-04) uses annotated tag object `6343e032fd673fb10d4e39f6f05b690ee3e113cb` pointing to source commit `6d09104f21991d496aa2a8535d21bdea91a9c216` (root tree `d452de725b0914d94a4f77068f8ae00672b8e179`).
2. Tagged `package.json` declares `unicodeVersion: 18.0.0`; the official reference is [UTS #46 Revision 36](https://www.unicode.org/reports/tr46/tr46-36.html).
3. [Tagged generator](https://github.com/jsdom/tr46/blob/6d09104f21991d496aa2a8535d21bdea91a9c216/scripts/generateMappingTable.mjs) fetches `https://unicode.org/Public/18.0.0/idna/IdnaMappingTable.txt`, parses the mapping-status ranges and emits `lib/mappingTable.json`. The generated file is intentionally absent from tagged Git sources and is created before publication.
4. The raw mapping input, tagged generator, tagged status constants, and published npm mapping bytes are recorded in `spikes/gate0/tr46-sources.json` with SHA-256 digests.
5. **Proof beyond metadata:** the exact tagged generator was executed in a child process with `fetch()` strictly replaced by a single allowlisted local response containing the hashed upstream input. The regenerated `mappingTable.json` is **byte-identical** to the one shipped in the lockfile-verified npm tarball.

## Pinned SHA-256 fingerprints

| Artifact | SHA-256 |
|---|---|
| Unicode 18.0 `IdnaMappingTable.txt` | `a03b1eb38032268c696406a83f0972d6a815acd2c8d4151d42ec0fda70ffced1` |
| Tagged `scripts/generateMappingTable.mjs` | `b2d3cc7721d43c6453f83ab06aa7ee5e21f3b4f0670bd090b76fbf8e7d09274a` |
| Tagged `lib/statusMapping.js` | `ab7f706a1e3e74f4efd276560bb50e15f71dd0b20f85e87e21d1c18259420064` |
| Published and replayed `lib/mappingTable.json` | `82ae922b231ebc91e7f9f7d761dd62a68d49698878a55f79e43e83cd435dc448` |

## TDD evidence

- **RED:** commit `8f0be35`; [CI evidence](https://github.com/kefyusuf/idnlens/actions/runs/38728381908) downloaded all exact source artifacts and printed their digests. The manifest was absent: **4 expected failures / 1 pass**. No misleading network or CI syntax failure counted as RED.
- **GREEN:** commit `d79f0e2`; [CI evidence](https://github.com/kefyusuf/idnlens/actions/runs/38728447920) passed **5/5** tests: pinned identity, Git tag resolution, source checksums, offline exact replay against the locked npm package, and a source-byte mutation control.
- GitHub Actions fetches sources only for Gate 0 verification. The replay process cannot make network calls through `fetch`, and no downloaded data file is checked into this repository.

## Limitations and explicit holds

- **Not yet covered:** `tr46/lib/regexes.js`. Its generator consumes additional Unicode 18 data and `@unicode/unicode-18.0.0`; reproducing and pinning that generated regex artifact is a separate small verification unit.
- Mapping equivalence does **not** prove correct handling of every Unicode domain. Behavior fixtures remain separate, and no phishing or safety verdict is established.
- The immutable Git commit and raw file digests are evidence of a particular source, not proof that a GitHub tag can never be moved. The upstream tag's annotated signature is not relied upon as an attestation.
- Tagged package claims MIT; Unicode source data is subject to Unicode License V3 and notice requirements. Redistribution audit remains open.
- No production dependency, PSL policy, browser integration or ADR status changed.

**Next:** the remaining TR46 regex-data identity check, then package/license review and bundle-footprint assessment; only after all Gate 0 evidence is complete may ADR-0002/ADR-0003 be considered for acceptance.
