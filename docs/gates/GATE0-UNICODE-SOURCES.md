# Gate 0-03B — Unicode 18.0 source data provenance

**Status:** Unicode source checksum sub-gate verified in CI; overall Gate 0 remains **OPEN**.  
**Date:** 2026-10-15  
**Scope:** Four exact Unicode source files and a standalone data-provenance check only. No Unicode parser, UTS #39 detector, M0 implementation, browser code, or production data bundle.

## Authoritative release

- Unicode release: **18.0.0**, announced 2026-09-16.
- UTS #39: **Revision 34**, https://www.unicode.org/reports/tr39/tr39-34.html.
- Security files: `https://www.unicode.org/Public/18.0.0/security/`.
- UCD script data: `https://www.unicode.org/Public/18.0.0/ucd/`.
- Data-file license: **Unicode License V3**, https://www.unicode.org/license.txt, subject to file-specific notices and redistribution obligations. The data itself is **not vendored** in this change.

## Pinned source manifest

`spikes/gate0/unicode-sources.json` records exact upstream HTTPS URLs and the SHA-256 of raw source bytes for:

| File | SHA-256 |
|---|---|
| `security/IdentifierStatus.txt` | `5863c7d99ca18f213c41c7318aa5528bebfb6d32ec0f1d5944e37192c119aebd` |
| `security/confusables.txt` | `6ed3ee967c9dfdf6677d563c9985182fbc50a2efb7d6059cd57b2e2ce18f5b92` |
| `ucd/ScriptExtensions.txt` | `5c9d34a922f687726f2a8bcf57d49f905987e51f1b21b58c95a00fbe255cec23` |
| `ucd/Scripts.txt` | `0071fd81b6aeae25f6e8bce8efec3066a6476a91b49bdb2f52dc76e817862a6a` |

The manifest is the source of truth; do not copy these hashes into a separate runtime dataset.

## TDD proof

- **RED:** [Unicode source CI](https://github.com/kefyusuf/idnlens/actions/runs/38722452447) downloaded and hashed all four official sources successfully. The two manifest-dependent tests failed because the manifest did not exist; the independent mutation-detection test passed. This was an intentional, interpretable RED (not a network failure).
- **GREEN:** add the manifest populated only with the raw SHA-256 digests observed in the RED runner. The CI fetches the files to the ephemeral runner temp directory and compares SHA-256 against the committed manifest. It runs no production code and does not publish binaries.
- The earlier GitHub Actions workflow syntax issue at commit `3e36d40` is **not** counted as TDD RED; it was corrected before the documented test failure.

## Security and reproducibility boundary

The checksum proves that the retrieved bytes match the recorded Git manifest, not that upstream data is error-free or that a package uses the same Unicode version. Live external retrieval happens **only in the Gate 0 CI verification workflow**; M0/M1 will not download sources at runtime. Future implementation will need a reviewed, reproducible transformation and bundled data license notice.

## Remaining Gate 0 work

- Pin a verifiable **PSL** source snapshot; determine and document the data snapshot actually embedded in `tldts@7.4.18`.
- Review `tr46@7.0.0` Unicode/UTS #46 mapping provenance and differences from UTS #39 18.0.
- Audit dependency and data license notices, maintenance/security posture and bundle size.
- ADR-0002 and ADR-0003 remain **Proposed**, not approved; M0 remains blocked.
