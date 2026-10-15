# Gate 0 — Node.js IDNA baseline evidence

**Status:** Evidence recorded; dependency selection **OPEN**.  
**Date:** 2026-10-15  
**Scope:** Roadmap Gate 0, one candidate baseline only; no M0 production code.

## Question

Can Node's built-in `node:url` `domainToASCII()` and `domainToUnicode()` be safely treated as strict, version-pinned hostname/IDNA validation for IDNLens?

## Environment

- Local Node.js: `v22.16.0`
- ICU: `77.1`
- Runtime Unicode: `16.0`
- Test runner: built-in `node:test`, with no installed dependencies
- Run: `node --test spikes/gate0/idna-baseline.test.mjs`

## TDD evidence

1. **RED:** start with a naive wrapper accepting every nonempty `domainToASCII()` output. **13 passed / 12 failed** (25 tests).
2. **GREEN:** add strict hostname-only delimiters, explicit root-dot handling, DNS label syntax/length bounds, IP exclusions, and A-label canonical round-trip checks. **25 passed / 0 failed** (25 tests).
3. Syntax check: `node --check` for both files passed.

Representative observations from this runtime:

| Input | Raw `domainToASCII()` | Strict probe | Interpretation |
|---|---|---|---|
| `аmazon.com` (U+0430) | `xn--mazon-3ve.com` | accepted for syntax | A-label conversion; not a phishing verdict |
| `bücher.de` | `xn--bcher-kva.de` | accepted for syntax | Legitimate IDN is not suspicious by itself |
| `xn--invalid-.com` | `xn--invalid-.com` | rejected | Raw conversion is not sufficient A-label validation |
| `a..com` | `a..com` | rejected | Empty DNS label must not pass |
| `-bad.com` | `-bad.com` | rejected | Invalid label boundaries |
| `localhost` | `localhost` | rejected | Not a public multi-label host |

## Conclusion and limits

- **NO-GO for using raw `domainToASCII()` as complete validation.**
- This wrapper is a **behavioral baseline**, not a recommended final IDNA library or implementation of UTS #46. It uses runtime ICU/Unicode data, so behavior may change when Node changes. It does not perform PSL registrable-domain resolution, registry policy checks, Unicode UTS #39 confusable detection, or network/DNS/registration checks.
- `accepted` means accepted by this **spike's narrow syntax experiment**, not that a domain exists, is registrable, reputable, or safe.
- No dependency is selected, no ADR status is changed, and Gate 0 is **not passed** by this single baseline.

## Next bounded step

Compare one explicitly versioned UTS #46 candidate against these fixtures (including deviation/Bidi/Joiner cases), and one versioned PSL parser against compound, private and unknown-suffix cases. Record licenses, version provenance and data hashes before accepting ADR-0002/0003 or starting M0-01.
