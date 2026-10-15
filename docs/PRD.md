# PRD — IDNLens

**Version:** 0.1 · **Date:** 2026-10-15 · **Status:** Draft / M0-focused · **Owner:** Project maintainer (to assign)

## 1. Executive summary

IDNLens is a browser-domain inspection tool focused on a narrowly defined attack class: visually confusable internationalized domain names (IDN homographs). Unicode allows characters from different writing systems to resemble one another; an attacker-controlled registrable domain can therefore look like a trusted domain. Existing browsers already implement substantial defenses. IDNLens aims to provide **additional, transparent analysis and understandable evidence**, without claiming complete phishing protection or duplicating an entire browser security engine.

The first product increment (M0) is **a pure, deterministic TypeScript core and conformance-style test corpus**, with no browser extension yet. M1 adds an unobtrusive Chrome MV3 adapter to inspect committed top-frame HTTP(S) navigations and display warnings in an action badge/popup. The core works without network access, user registration, or browser content permissions.

## 2. Problem and rationale

- Users visually judge hostnames and can overlook non-Latin confusable characters.
- Internationalized domain names are legitimate; simply warning on `non-ASCII` produces unacceptable false positives.
- The correct comparison target is a **registrable domain**, not arbitrary substrings or a full hostname string.
- Browser display protections vary by version and platform, so independent explanation may help; it is not evidence that a particular attack bypasses current Chrome without reproducible tests.
- An extension that incorrectly marks a site `safe` can increase risk. IDNLens must not make that assertion.

## 3. Goals

G1. Detect and explain selected Unicode confusability indicators using version-pinned UTS #39 data.

G2. Identify possible impersonation of a **bounded, explicitly maintained protected-domain catalog** by comparing normalized registrable domains; never silently compare against the entire internet.

G3. Treat well-formed internationalized domains as normal when no supported impersonation indicator is observed; do not flag on Unicode presence alone.

G4. Operate offline, deterministically, transparently, and with the minimum permissions required by the supported browser adapter.

G5. Build an auditable suite of positive, negative, edge-case and property tests before any user-facing security claim.

## 4. Non-goals

Out of scope for v0.1/v0.2: general phishing URL detection; HTML/form/content scanning; safe-browsing database; maliciousness verdicts; TLS certificate analysis; typosquatting/edit-distance matching for ASCII domains; lookalike logos; email inspection; server-side enrichment; URL redirects/blocking; whole-page overlays; crowd-sourced threat feeds; website screenshots; AI/LLM; browser sync; accounts; telemetry; full-history logging; enterprise policy; mobile support; automatic Firefox release.

Differences only in TLD (e.g. a similar second-level label on another TLD) are deliberately **not** a v0.1 lookalike match. Similarity signals should not be applied to unregistered pseudo suffixes or private hosts as though they were public domains.

## 5. Users and jobs-to-be-done

**Primary:** A browser user who receives an unfamiliar link but wants to know whether a domain contains visually misleading international characters.

**Secondary:** A security-minded developer/auditor who wants a reproducible offline analysis of a domain and structured evidence.

**Not yet targeted:** SOC teams, companies administering thousands of devices, parents managing devices, users requiring universal phishing protection.

### Example stories

- U1: When the visited domain visually resembles a protected domain, I want a clear `possible lookalike` message showing exactly why, so I can navigate independently to the known address.
- U2: When a domain contains Cyrillic/Latin mixing, I want to see the script evidence without an unjustified claim that the domain is malicious.
- U3: When I open a legitimate IDN, I do not want an intrusive warning solely because the domain is Unicode.
- U4: As a developer, I can pass a hostname and fixed catalog to `analyzeDomain()` and receive a stable result without browser/network access.
- U5: If a domain cannot be parsed reliably, I want an `UNSUPPORTED` result, not a `safe` determination.

## 6. Functional requirements (traceable)

| ID | Requirement | Milestone | Acceptance evidence |
|---|---|---|---|
| FR-01 | Accept a hostname (not arbitrary pasted URL) in the core; reject invalid/unsupported inputs explicitly | M0 | Parsing and invalid-host tests |
| FR-02 | Normalize Unicode and ASCII/Punycode domain representations according to a pinned, documented IDNA strategy | M0 | Unicode ↔ A-label fixture parity; documented deviations |
| FR-03 | Resolve public suffix and registrable domain using a pinned PSL snapshot | M0 | `co.uk`, ICANN/private, unknown suffix tests |
| FR-04 | Compute UTS #39 confusable skeleton with pinned Unicode security data | M0 | Reference vectors, version/hash proof |
| FR-05 | Detect mixed-script indicators separately from a protected-domain lookalike match | M0 | Positive/negative Unicode fixtures |
| FR-06 | Match against an injected exact protected registrable-domain catalog with a defined same-suffix policy | M0 | Exact-match and cross-TLD negative tests |
| FR-07 | Return structured explanation: evidence code, character/code point evidence when supported, matched target, version metadata | M0 | Result schema validation and snapshot tests |
| FR-08 | Return `NO_INDICATOR`, `REVIEW`, `LOOKALIKE`, or `UNSUPPORTED`; never `SAFE`/`MALICIOUS` | M0 | Enum/schema tests |
| FR-09 | Inspect top-frame, committed HTTP(S) navigations; avoid analyzing subframes | M1 | MV3 integration tests |
| FR-10 | Display a small warning badge and accessible popup for `REVIEW`/`LOOKALIKE`; stay quiet for `NO_INDICATOR` | M1 | UI/interaction tests |
| FR-11 | Analyze locally without external requests, history collection or persisting URL paths/query strings | M1 | Permission/network/storage review |
| FR-12 | Avoid displaying a previous tab's analysis after navigating to another hostname (including service worker suspension) | M1 | Navigation/state race integration tests |

## 7. Classification model (not a security verdict)

- **NO_INDICATOR:** None of the *supported* indicators were detected. This DOES NOT assert the destination is safe.
- **REVIEW:** The domain has a relevant script/identifier anomaly, but no verified protected-domain match. Explain why review may help.
- **LOOKALIKE:** Confusable match (via supported UTS #39 logic) of a different registrable domain to a protected catalog entry under the frozen comparison policy. This is *possible impersonation*, not proof of attacker intent.
- **UNSUPPORTED:** Input not analyzable confidently (invalid host, IP, localhost, unsupported suffix/IDNA edge). Do not default to `NO_INDICATOR`.

Never use an arbitrary continuous `risk score` in the first version. Explain discrete signals and allow the user to judge.

## 8. Detection rules, v0.1

1. Core accepts a hostname (a separate M1 adapter parses a full URL with a standards-compliant URL parser).
2. Convert/validate using a pinned IDNA process; record both ASCII and Unicode host spellings.
3. Resolve eTLD+1 using a versioned PSL; do not compare apparent brand fragments inside unrelated subdomains.
4. For supported registrable domains: compute scripts and confusable skeleton using pinned UTS #39 tables.
5. Mark `REVIEW` for supported anomalous mixed-script/identifier signals that do not produce a confirmed catalog match. Unicode alone cannot trigger `REVIEW`.
6. Mark `LOOKALIKE` only if the registrable domain **differs** from the protected domain, its relevant label(s) meet the pinned confusable-match method, and its suffix meets the same-suffix policy. Exact canonical domain/subdomains are excluded.
7. Prefer explicit `UNSUPPORTED` where domain normalization or PSL interpretation lacks certainty.
8. Limit matched-target outputs to deterministic, bounded results and stable sorting.

**Design limitation:** Confusable skeleton equality is not a font-specific visual equivalence test. Some lookalikes will not be detected; some mapped characters are legitimately used. The product must disclose both properties.

## 9. Experience and content requirements (M1)

**At-a-glance:** a small action badge `!` only on `REVIEW` or `LOOKALIKE`; no full-page interruption. Colors supplement, not replace, text labels.

**Popup:** domain's normalized Unicode and ASCII/Punycode spelling, outcome label, plain-language explanation, up to 3 strongest supported signals, relevant Unicode code points, protected match if any, and disclaimer `No indicator does not mean safe`. Copy values through text nodes only; never interpolate domain contents as HTML. Show the **registrable domain** prominently and the subdomain separately.

**Privacy:** explain that only the top-frame hostname is analyzed locally; no browsing data leaves the browser. Display stored transient state only for the active tab; avoid automatic retention of raw URLs or paths.

**Accessibility:** keyboard operation, WCAG 2.2 AA as an aspirational review baseline, accessible badge meaning mirrored as text, high contrast, long/punycode hostname line wrapping, RTL isolation for Unicode.

## 10. Quality requirements and measurement

| Category | Required gate |
|---|---|
| Correctness | All reviewed normative-vector tests and frozen regression fixtures pass; no release with unexplained deviations |
| Benign IDN specificity | All benign IDN fixtures avoid `LOOKALIKE`; outcomes justified and reviewed, rather than blanket `Unicode = risky` |
| Coverage | Cases for mixed-script, whole-script, safe IDNs, PSL parsing, subdomain trickery, punycode, malformed input, bidi, combining marks and state races |
| Determinism | Same input + same catalog + same versioned datasets = same output on supported runtimes |
| Performance | Benchmark 1,000 fixture-driven analyses on a stated machine/runtime; target p95 < 20 ms after warmup, excluding startup (target, not unverified claim) |
| Privacy | No network access by analysis core; M1 extension no analytics and no URL/query/path persistence |
| Security | Input length limits, escaped popup rendering, dependency audit, licensed pinned data |
| Honest UX | No `safe`/`malicious` verdict, no `pre-click protection` claim |

**Product effectiveness caveat:** Without independently labeled, representative positives and negatives, do not publish field-level precision/recall, browser bypass rate, or guarantees about protection efficacy.

## 11. Dependencies and assumptions

- UTS #39 confusables and script data must be pinned, reviewed and license-noticed; see ADR-0003.
- IDNA/UTS #46 library and PSL implementation must be selected by a short license/behavior spike, not by popularity alone.
- A small protected-domain catalog will be curated, reviewed and versioned for M1. M0 injects fixtures; no remote feeds.
- Chrome MV3 permission surface is limited to `webNavigation`, `storage` (if needed for `storage.session`) and `action`; actual manifest must be tested for the smallest viable set.
- Browser native IDN defenses are a baseline to test against, not to assume absent.

## 12. Acceptance and shipping gates

**M0 exit:** FR-01..08 implemented; pinned datasets documented; schema tests, malicious/benign fixtures, PSL cases, Unicode conformance smoke and negative controls pass; no backend/browser permissions.

**M1 exit:** FR-09..12 implemented; Chrome unpacked integration smoke works in at least one specified stable release; measured false-alert sample documented; extension permissions and network behavior inspected; accessibility/security review signed off.

**Public store submission:** not automatic at M1 completion. Requires separate privacy language, trademark/name check, data license inventory, independent reviewer and store-policy check.

## 13. Open questions (explicit decision gates)

- Exact IDNA implementation and Unicode dataset versions: decide in M0 dependency spike.
- Handling private PSL domains: define and lock behavior before implementation; default = unresolved/unsupported when uncertain.
- Protected catalog seed contents and verification process: decide before M1, not during M0.
- UI languages and public license: decide prior to public beta.
- Firefox interoperability and pre-navigation intervention: later studies, not v0.1 features.