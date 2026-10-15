# Gate 0-04A — License and attribution evidence

**Status:** Package/license evidence **VERIFIED WITH BLOCKER**; redistribution **NOT APPROVED**.  
**Date:** 2026-10-15  
**Scope:** Two existing pinned npm graphs (6 packages), Unicode 18.0 source data, and the immutable PSL snapshot. No production dependencies, release assets, vulnerability scan, or browser/runtime changes.

## What was inspected

Installed through `npm ci --ignore-scripts --no-audit --no-fund` on Node 22.16.0. Both lockfile graphs and the six-package inventory are matched by `spikes/gate0/license-notices.test.mjs`.

| Package (locked) | Declared SPDX | Shipped license evidence | Status |
|---|---|---|---|
| `tr46@7.0.0` | MIT | `LICENSE.md` | File and MIT permission/copyright text verified |
| `punycode@2.3.1` | MIT | `LICENSE-MIT.txt` | File and MIT permission/copyright text verified |
| `tldts@7.4.18` | MIT | `LICENSE` | File and MIT permission/copyright text verified |
| `tldts-core@7.4.18` | MIT | `LICENSE` | File and MIT permission/copyright text verified |
| `regenerate@1.4.2` | MIT | `LICENSE-MIT.txt` | File and MIT permission/copyright text verified |
| `@unicode/unicode-18.0.0@2.0.7` | MIT (npm metadata) | **No top-level LICENSE/COPYING/NOTICE** in the installed tarball | **BLOCKED — metadata-only evidence; investigate package attribution** |

The last package is used only by the offline **Gate 0 TR46 regex replay**, not by the candidate M0 runtime; nevertheless its copyright notice must not be silently inferred from metadata.

## Upstream data is licensed separately

- The raw Unicode 18.0 source files are covered by **Unicode License V3 (SPDX: Unicode-3.0)**, subject to exceptions and source-specific terms. Official source: https://www.unicode.org/license.txt and https://www.unicode.org/copyright.html. Existing exact raw source hashes are preserved in `spikes/gate0/unicode-sources.json` and TR46 manifests.
- The pinned `public_suffix_list.dat` file carries an **MPL-2.0** notice. Immutable Git commit: `publicsuffix/list@3929462652695bad04f0a27afb600974014a3c8b`, SHA-256 `2919eb9803c91a3f73a507cc6fedc934de005543c22c4016f72e3343de5dd6e7`.
- An MIT declaration for `tldts` package source **does not settle the license/notice treatment** of PSL-derived bundled trie data. Distinct source provenance and attribution need review before distributing IDNLens binaries.

## Test evidence

- **RED:** commit `6f5073a`, [GitHub Actions](https://github.com/kefyusuf/idnlens/actions/runs/38730053093) installed both lockfiles and enumerated actual notice filenames. Missing `license-notices.json` caused **4 expected failures; 1 graph test passed**.
- The evidence inspection identified a missing top-level license file in `@unicode/unicode-18.0.0@2.0.7`. The next test commit `c21b108` explicitly models this as **metadata-only, release blocked**, instead of fabricating a bundled notice.
- **GREEN:** commit `0126bbf`, [GitHub Actions](https://github.com/kefyusuf/idnlens/actions/runs/38730227117) passed **5/5** checks with all package versions, license texts, the metadata-only exception, and data-source license separation recorded.

## Gate 0-07 follow-up: upstream generator license found, package notice still missing

The `@unicode/unicode-18.0.0@2.0.7` [generated package repository at its release commit](https://github.com/node-unicode/unicode-18.0.0/tree/f4cac36e42e85a43d037cb010fdb1f2eb17c1c36) declares MIT and points to `node-unicode/node-unicode-data` as its generator. The [generator MIT license file](https://github.com/node-unicode/node-unicode-data/blob/6bb2993582494b715c78a10708a456be5249d188/LICENSE-MIT.txt) was located at fixed commit `6bb2993582494b715c78a10708a456be5249d188` and Git blob `a41e0a7ef970ecdd83d82cd99bda97b22077bc62`.

This establishes **upstream MIT license text exists**; it **does not repair the missing license file in the published Unicode helper package** or approve redistributing generated Unicode data. The helper appears only in the Gate 0 regex replay toolchain, not the intended M0 dependency graph. Its future release inclusion and correct notices must be reviewed against actual artifacts. The package status in `spikes/gate0/license-notices.json` intentionally remains `BLOCKED_MISSING_BUNDLED_LICENSE`.

## Remaining actions before release decision

1. Resolve the Unicode helper's license notice gap from a trusted upstream source and decide whether/which original copyright notices must be carried forward. **Do not mark approved based on npm metadata alone.**
2. Decide correct notices and distribution treatment for MPL-covered PSL data and generated/embedded trie outputs.
3. Prepare final third-party license texts/notices if any data or packages will actually be distributed.
4. **Gate 0-04B:** complete separate time-bound vulnerability/advisory and maintenance review. `npm ci --no-audit` is **not** a security audit.
5. Measure bundle impact and review ADR-0002/0003. They remain **Proposed**; Gate 0 remains **OPEN**.

This report is a technical evidence record, **not legal advice or an approval to redistribute** third-party material.
