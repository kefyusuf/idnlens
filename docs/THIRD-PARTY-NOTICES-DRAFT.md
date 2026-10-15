# Third-party notices — working draft (not for distribution)

**State:** INCOMPLETE / RELEASE-BLOCKING REVIEW REQUIRED  
**Purpose:** Record which notices must be addressed before any bundled library, browser extension, or public release. This document is **not** a finished LICENSE/NOTICE bundle or a legal clearance.

## Candidate npm libraries

The following versions are used only in Gate 0 source verification and behavior probes; adoption into M0 remains undecided.

| Artifact | Declared license | Available bundled notice |
|---|---|---|
| `tr46@7.0.0` | MIT | `node_modules/tr46/LICENSE.md` |
| `punycode@2.3.1` | MIT | `node_modules/punycode/LICENSE-MIT.txt` |
| `tldts@7.4.18` | MIT | `node_modules/tldts/LICENSE` |
| `tldts-core@7.4.18` | MIT | `node_modules/tldts-core/LICENSE` |
| `regenerate@1.4.2` (Gate 0 replay tool) | MIT | `node_modules/regenerate/LICENSE-MIT.txt` |
| `@unicode/unicode-18.0.0@2.0.7` (Gate 0 replay tool) | MIT in npm metadata | **No top-level license text in installed package; pending upstream review** |

The full license text and specific copyright attribution for any ultimately distributed packages must be copied from the corresponding **verified installed artifact**, not paraphrased or replaced with a generic template.

## Source data

**Unicode 18.0 data:** Unicode License V3 (SPDX `Unicode-3.0`). Source terms: https://www.unicode.org/license.txt. Preserve the required copyright and permission notice either with the relevant data/software or in accompanying documentation as permitted by the applicable terms. This is a source identification, not final compliance sign-off.

**Public Suffix List:** the immutable source snapshot `publicsuffix/list@3929462652695bad04f0a27afb600974014a3c8b` declares MPL-2.0. The canonical live PSL is https://publicsuffix.org/list/public_suffix_list.dat. Determine applicable notice, source-availability, and modification requirements for whichever derived data is ultimately bundled. Do not conflate PSL-derived content with `tldts`'s MIT code license.

## Release block

- [ ] Resolve package metadata-only Unicode helper notice.
- [ ] Establish whether any Unicode / PSL source data or derived data is distributed in the final artifact.
- [ ] Preserve actual license texts, copyright holders and applicable upstream notices.
- [ ] Confirm review of MPL-2.0 treatment for generated PSL data.
- [ ] Finish separate dependency vulnerability and maintenance review.
- [ ] Recheck this inventory against the final release's dependency/data manifest.

This file must not be published as a complete third-party notices document until the list above is resolved.
