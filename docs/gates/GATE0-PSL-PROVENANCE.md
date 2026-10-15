# Gate 0-03C — PSL source snapshot and npm trie provenance

**Status:** Source-chain checks passed; overall Gate 0 remains **OPEN**.  
**Date:** 2026-10-15  
**Scope:** Confirm exactly which PSL revision is referenced by the tagged `tldts@7.4.18` repository and verify the generated trie shipped by the locked npm package. No PSL implementation or M0 code.

## Chain of evidence

1. `remusao/tldts` annotated tag [v7.4.18](https://github.com/remusao/tldts/releases/tag/v7.4.18) points to commit `3ac3c4cd3161b0e56383ff93c23a79a7e5e91508` via tag object `0d706a673d79aefcd95560a3f2f8d744071e6bb0`.
2. That commit's root tree includes a Git submodule at `publicsuffix` with exact Gitlink `3929462652695bad04f0a27afb600974014a3c8b` (repository `publicsuffix/list`).
3. The submodule's [public_suffix_list.dat at that commit](https://github.com/publicsuffix/list/blob/3929462652695bad04f0a27afb600974014a3c8b/public_suffix_list.dat) has SHA-256 `2919eb9803c91a3f73a507cc6fedc934de005543c22c4016f72e3343de5dd6e7`.
4. The tagged [generated trie.ts](https://github.com/remusao/tldts/blob/3ac3c4cd3161b0e56383ff93c23a79a7e5e91508/packages/tldts/src/data/trie.ts) has SHA-256 `4588582bb1f5cc66d6ad7b9981c410d0a9e3527b2fc0d2c7e308a3d74ccd9a4c`.
5. **The installed, lockfile-verified `tldts@7.4.18` npm package's `src/data/trie.ts` has the exact same SHA-256 as the tagged generated trie.**

These identities are recorded once in `spikes/gate0/psl-sources.json`, with exact URLs and full SHAs.

## TDD — reviewable RED/GREEN

- **RED:** commit `420e1f5`; [GitHub Actions run](https://github.com/kefyusuf/idnlens/actions/runs/38723908956) successfully fetched GitHub tag metadata, immutable source bytes, and the installed npm trie. The manifest did not yet exist: **3 expected failures, 1 pass**.
- **GREEN:** commit `f9badfe`; [GitHub Actions run](https://github.com/kefyusuf/idnlens/actions/runs/38723996755) confirmed **4/4 passed**: manifest identity, tag-to-gitlink trace, two raw file digests + npm byte identity, and digest mutation control.
- Original dependency behavior and Node IDNA tests remain separate. No new npm package is installed.

## Policy and licensing

The authoritative PSL file declares **Mozilla Public License 2.0**, including a notice directing live users to the canonical distribution URL `https://publicsuffix.org/list/public_suffix_list.dat`. Immutable commit URLs are used here solely to establish **Gate 0 reproducibility and provenance**, not as a supported live-update endpoint.

`tldts` declares MIT for its package code. The embedded PSL-derived data has a separate provenance/license chain. Its redistributable form and required notices must be reviewed before M0 packaging. Keep the upstream source license notice visible and do not assume MIT also covers PSL source data.

## What this verification does NOT prove

- Byte identity of the released trie with the tagged trie **does not demonstrate that re-running the upstream generator from the pinned PSL source is byte-for-byte deterministic**; generator, toolchain and other inputs have not been replayed.
- This validates a specific snapshot, not that it is today's live PSL.
- SHA-256 and gitlinks do not prove registry validity, ownership, intent or harmlessness of a website.
- No PSL source list or trie is checked into IDNLens in this PR, and no runtime download exists.

## Remaining Gate 0 gates

`tr46` mapping-data provenance, package/source license and redistribution notice audit, reproducible bundle-footprint assessment, and explicit review of ADR-0002/0003. **No M0 work is authorized yet.**
