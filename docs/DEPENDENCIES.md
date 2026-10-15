# Gate 0 dependency and data provenance register

**Status:** Working record; not an approved production dependency list.  
**Last reviewed:** 2026-10-15  
**Scope:** Gate 0 only. Do not assume that a fixed npm version pins upstream Unicode or PSL source revisions.

## Reproducible npm candidate graph

The isolated `spikes/gate0/package-lock.json` is an npm lockfile v3 produced on Node 22.16.0. The CI installs it using `npm ci --ignore-scripts --no-audit --no-fund`, then runs targeted dependency and provenance tests.

| Package | Version | Role | License claim | Integrity |
|---|---|---|---|---|
| `tr46` | `7.0.0` | UTS #46 processing candidate | MIT (source/package claim; independent notice audit pending) | SHA-512 in committed lock |
| `punycode` | `2.3.1` | transitive dependency of tr46 | license audit pending | SHA-512 in committed lock |
| `tldts` | `7.4.18` | PSL resolver candidate | MIT (npm package claims) | SHA-512 in committed lock |
| `tldts-core` | `7.4.18` | transitive dependency of tldts | license audit pending | SHA-512 in committed lock |

For exact `resolved` tarball URLs and complete SHA-512 strings, inspect **the lockfile itself**. There is no separate copied digest inventory to keep in sync. All versions, including transitive versions, are tested against an explicit allowlist in `dependency-provenance.test.mjs`.

**Reproducibility boundary:** An integrity-checked registry install means fixed npm packages; it does not attest maintainer identity, eliminate registry availability risk, guarantee rebuild equivalence across all platforms, or establish the age of bundled source data. Runtime analysis remains offline; installation uses npm registry access.

## Standards and source-data provenance — partial verification only

| Source | Current reference / intent | Provenance work remaining |
|---|---|---|
| Unicode UTS #39 | Revision 34 / Unicode 18.0.0, https://www.unicode.org/reports/tr39/tr39-34.html | **Reference pinned**. Review implementation algorithm and transformations before acceptance. |
| Unicode security data | https://www.unicode.org/Public/18.0.0/security/ | **Exact raw checksums pinned** for `confusables.txt` and `IdentifierStatus.txt` in `spikes/gate0/unicode-sources.json`. No production bundle yet. |
| Unicode Script/Script_Extensions | https://www.unicode.org/Public/18.0.0/ucd/ | **Exact raw checksums pinned** for `Scripts.txt` and `ScriptExtensions.txt`. Data transforms and bundle plan not yet selected. |
| Public Suffix List | https://publicsuffix.org/list/public_suffix_list.dat | **Pinned source revision:** `publicsuffix/list@3929462652695bad04f0a27afb600974014a3c8b` and raw SHA-256 in `spikes/gate0/psl-sources.json`. `tldts@7.4.18` tagged npm trie bytes match its tagged Git source; generator replay not yet verified. |
| PSL license | MPL-2.0 in pinned upstream source | **Source license identified.** Generated-data redistribution and notice obligations still need review before production packaging. |
| UTS #46 implementation data | `tr46@7.0.0` / Unicode 18.0.0 / UTS #46 Revision 36 | **Mapping and regex artifacts verified:** pinned official Unicode sources and tagged generation scripts reproduce both published npm `mappingTable.json` and `regexes.js` byte-for-byte in CI. See `spikes/gate0/tr46-sources.json`, `spikes/gate0/tr46-regex-sources.json` and Gate 0-03D/03E evidence reports. License, security and bundle review remain open. |

Do **not** download upstream `latest` data implicitly or add a runtime feed. This table records prospective sources, not a selected or bundled data version.

## Explicit remaining gates

1. Unicode 18.0 security files, the PSL snapshot, and TR46 mapping table now have pinned SHA-256 records. TR46 mapping and regex source/replay are now proven for pinned data; PSL generator replay, packaging notices and risk review remain open.
2. Verify transitive licenses, Unicode-3.0 redistribution notices and package maintenance/security posture.
3. Measure minified and uncompressed browser-oriented bundle impact using a reproducible method; no extension scaffold is authorized.
4. Review ADR-0002 and ADR-0003 against that evidence; they remain **Proposed** until an explicit decision.

Any upgrade to the four-package lock graph requires a dedicated reviewed PR, an updated expected graph in the tests, and re-running all Gate 0 checks.
