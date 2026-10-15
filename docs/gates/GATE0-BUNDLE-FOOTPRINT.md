# Gate 0-05 — Reproducible Browser Bundle Footprint

**Status:** Targeted benchmark **PASS**; Gate 0 remains **OPEN**.  
**Measured:** 2026-10-15, Ubuntu GitHub Actions, Node `22.16.0`.  
**Scope:** Two already-reviewed candidates, `tr46@7.0.0` and `tldts@7.4.18`, with their pinned transitives. No M0, Chrome extension, security classification or production dependency approval.

## Measurement contract

A dedicated benchmark-only `esbuild@0.25.12` installation is locked in `spikes/gate0/bundle-probe/package-lock.json`. Runtime candidate dependencies retain their **unchanged** existing `spikes/gate0/package-lock.json`.

- Platform: `browser`
- Format: `esm`
- Target: `chrome120` (**benchmark target only**, not an M1 compatibility decision)
- `bundle: true`, `sourcemap: false`, `charset: utf8`, `legalComments: inline`
- Both `minify: false` and `minify: true`
- SHA-256 over emitted JS bytes; gzip at level 9, plus Node Brotli compression
- Exactly three tiny exported test entrypoints: IDNA candidate, PSL candidate and both together
- No source maps, source-data downloads, framework polyfills, runtime networking, app UI or output artifacts committed

## Observed output bytes

Source: [Gate 0 bundle CI run 38733809858](https://github.com/kefyusuf/idnlens/actions/runs/38733809858) (benchmark at commit `ceb723c115d69509b4dd694cb7cd618efc8aedf4`).

| Benchmark entry | Unminified raw | Minified raw | Minified gzip | Minified Brotli |
|---|---:|---:|---:|---:|
| `idna` (`tr46`, `punycode`) | 263,691 B | 224,786 B | 63,648 B | 36,071 B |
| `psl` (`tldts`, `tldts-core`) | 164,547 B | 126,457 B | 46,320 B | 39,959 B |
| `combined` (all four) | 428,228 B | **351,330 B** | **110,078 B** | **76,864 B** |

Values are decimal **bytes**, not KiB. In binary units the combined minified JS is approximately **343.1 KiB**, gzip **107.5 KiB**, Brotli **75.1 KiB**.

### Minified artifact SHA-256

| Entry | SHA-256 |
|---|---|
| `idna` | `36a6974cbb6b10acdc7584ba5e56794ceb9650b302601dd807df3007a232dbe5` |
| `psl` | `e6919679c92db8dda49697e008ea95e4856ed2fcf85d12431c067f31f67b2d4b` |
| `combined` | `e2a2c07981266afc0fa646aad5c18a01989dd13c95e13b7c843226576a125423` |

The CI workflow prints a full JSON measurement record for all six outputs, including their SHA-256 values and bundled package names. It does **not** publish JavaScript bundles. Compression sizes are descriptive benchmarks and do not imply Chrome Web Store distribution will use the same compression.

## TDD and behavioral checks

- **RED:** commit `1141d01`, [Actions run 38733610817](https://github.com/kefyusuf/idnlens/actions/runs/38733610817): missing measurement module caused the expected RED while the real npm-generated `esbuild` lockfile was produced and captured for the next step.
- **GREEN:** module commit `8532ada`, CI wiring `ceb723c`, [Actions run 38733809858](https://github.com/kefyusuf/idnlens/actions/runs/38733809858): **4/4** tests passed.
- The tests compare a second build against the first (full report including SHA-256), verify exactly which npm packages entered each bundle, and execute the combined generated ESM output to check `bücher.de`, `example.co.uk` and private `github.io` suffix behavior.
- The browser-target ESM produced no Node built-in imports or required Node polyfills for the tested exports.

## Interpretation and explicit limits

This is a **dependency-footprint estimate** for representative, intentionally minimal functions under one fixed bundler/target combination. It is **not** the finished M0 library, the entire browser extension, on-disk installed size, runtime memory, startup cost, or a Chrome compatibility/latency benchmark.

Not included: UTS #39 skeleton/script datasets and extraction code, a protected-domain catalog, evidence serialization, UI/popup, worker adapter, permissions, browser runtime overhead, third-party notice bundle, error handling, test assets or final packaging.

No arbitrary bundle-size threshold is imposed. The measured cost is an input to the Gate 0 ADR review, **not** evidence that one candidate must be rejected. Alternative PSL implementations, further compression work, code splitting and browser platform changes are **outside** the scope of this gate.

## Open Gates

1. Third-party license notices: `@unicode/unicode-18.0.0@2.0.7` metadata-only license evidence, Unicode License V3 redistribution, PSL MPL-2.0 derived data handling.
2. Determine whether the non-replayed upstream PSL generator is necessary for acceptance, given the separately verified tagged npm trie identity.
3. Review ADR-0002 and ADR-0003, plus source-data decisions, against the recorded evidence; decisions remain **Proposed**.
4. Gate 0 completion review before authorizing M0-01. **No M0 work is approved by this measurement.**
