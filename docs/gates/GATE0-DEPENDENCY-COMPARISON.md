# Gate 0 — Versioned IDNA and PSL dependency comparison

**Status:** Behavior verified; production adoption **NOT APPROVED**.  
**Date:** 2026-10-15  
**Scope:** Roadmap Gate 0 only. No M0 implementation, browser extension, or phishing verdict.

## Question and candidates

Compare the existing Node IDNA baseline against precisely one UTS #46 package and one PSL parser.

- `tr46@7.0.0` — MIT; https://github.com/jsdom/tr46
- `tldts@7.4.18` — MIT; https://github.com/remusao/tldts
- Node: `22.16.0` (GitHub Actions)
- Resolved transitive packages during GREEN: `punycode@2.3.1`, `tldts-core@7.4.18`

## TDD proof

- **RED** — commit [a03f11e](https://github.com/kefyusuf/idnlens/commit/a03f11eb39de250b8b720d381e768e708d7eade7), [CI failure](https://github.com/kefyusuf/idnlens/actions/runs/38718894753): dependencies installed; 25 baseline tests passed; new tests could not import the deliberately missing candidate implementation.
- **GREEN** — commit [6f70dd2](https://github.com/kefyusuf/idnlens/commit/6f70dd230104042bfa8440ab38f1f44562524424), [CI success](https://github.com/kefyusuf/idnlens/actions/runs/38719237975): 58/58 tests passed (25 baseline + 33 new).
- Tests execute without DNS or network requests *after dependency installation*.

## Targeted observations

| Input | Candidate result |
|---|---|
| Cyrillic-first-letter `аmazon.com` | `xn--mazon-3ve.com`; valid IDNA syntax does not establish maliciousness |
| `bücher.de` | `xn--bcher-kva.de`; IDN alone is not suspicious |
| `faß.de` | Nontransitional mapping `xn--fa-hia.de`, distinct from `fass.de` |
| Invalid A-label, empty label, URL/port, invalid joiner, bidi override, IP | Rejected by the spike's hostname policy |
| `login.paypal.com.attacker.co.uk` | Registrable domain `attacker.co.uk` |
| `sub.example.github.io` | Private-suffix registrable domain `example.github.io` |
| Unknown suffix, `co.uk` alone, localhost | Unsupported; not declared safe |

Strict `tr46` flags: `checkBidi`, `checkHyphens`, `checkJoiners`, `useSTD3ASCIIRules`, `verifyDNSLength` enabled; `transitionalProcessing` and `ignoreInvalidPunycode` disabled. The private PSL section is explicitly enabled.

## Limits / next gate

Exact **direct** dependency versions are written in the isolated spike manifest, but the experiment installs without a lockfile and disables installation scripts. **Neither transitive version freeze nor tarball integrity is yet guaranteed.** Also open: embedded PSL snapshot provenance, UTS #39 confusables/scripts data version and checksums, notices, maintenance/security review, and bundle impact.

Do not accept ADR-0002/0003 or begin M0-01 on the strength of these tests alone. The next Gate 0 task must record reproducible dependency hashes, data licenses/revisions and bundle measurements, followed by explicit decision review.
