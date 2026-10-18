# Threat model — IDNLens

**Method:** lightweight STRIDE + abuse-case analysis. **Status:** Draft, first review needed before implementation.

## 1. System and trust boundaries

The adversary can cause a browser to navigate to a hostile domain name and can craft domain labels using permitted Unicode code points; the adversary may also host convincing page content. IDNLens receives a hostname from a Chrome navigation event, performs offline parsing/matching, and renders explanatory results in an extension-owned popup. The **hostname is untrusted attacker-controlled input**.

Trust boundaries:

- Remote navigated domain / `webNavigation` URL (untrusted) -> extension adapter.
- Adapter input -> IDNA and PSL libraries (parser attack surface).
- Pinned Unicode, PSL and domain catalog datasets (supply-chain, version/review boundary).
- Detection core result -> browser `storage.session` / popup (staleness, HTML injection, spoofed evidence).
- Chrome extension manifest and packaging -> end user (permission and update integrity).

## 2. Assets and safety goals

- User's ability to distinguish a site from a protected canonical domain.
- Privacy of visited hostnames (and strict non-access to path/query/history where not needed).
- Accuracy and provenance of analyzed normalized domain and Unicode evidence.
- Extension execution integrity: no code/data injection or unreviewed remote code.
- Trustworthy user messaging: never claim a site is verified, malicious, or guaranteed blocked.

## 3. Threat and mitigation register

| ID | Scenario | Impact | v0 mitigation | Residual risk |
|---|---|---|---|---|
| T01 | Mixed-script confusable domain impersonates protected target | Credential theft via deception | UTS #39 mapping, protected catalog match, clear LOOKALIKE evidence | Unmapped confusables / non-IDN phishing |
| T02 | Whole-script lookalike bypasses simple mixed-script rule | Missed warning | Whole-script fixture tests and skeleton comparisons | Browser rendering and dataset limitations |
| T03 | Legitimate multilingual IDN falsely warned | Loss of trust, accessibility harm | No blanket Unicode alerts; benign corpus, reviewed criteria | Ambiguous domains remain |
| T04 | Hostname text inserted into extension HTML/attributes | Extension XSS / deceptive UI | `textContent`, no remote content, CSP, bidi isolation, no arbitrary visited-host links | Browser/third-party bug |
| T05 | Subdomain/userinfo tricks (`login.brand.com.bad.tld`, `brand.com@bad.tld`) | Incorrect protected-domain identity | WHATWG URL adapter + PSL eTLD+1; fixture tests | Separate generic deception not detected |
| T06 | Private/intranet/IP addresses treated as public domains | Erroneous confidence | UNSUPPORTED result for non-public/incomplete parsing | Public suffix list incompleteness |
| T07 | MV3 service worker dies or tab navigates again, stale badge remains | Wrong warning context / false reassurance | Session-scoped keyed state; clear on commit, doc/navigation ID and race guards | Browser lifecycle edge cases |
| T08 | Analysis crashes on pathological Unicode/length | Availability / silent false state | Bounded input, defensive validation, fuzz/property tests, unsupported failure | Third-party parser vulnerabilities |
| T09 | Unauthorized network transmission of domains/telemetry | Privacy breach | No outbound networking; minimal permissions; review built assets | New code supply-chain change |
| T10 | Compromised Unicode/PSL update or dependency | False negatives / arbitrary code execution | Pin versions and checksums, license+source review, CI tests, no runtime feeds | Maintainer account compromise |
| T11 | Attacker uses phishing that has no Unicode confusables | False sense of safety | Say `NO_INDICATOR` not `SAFE`; clear limitations | Not detected by design |
| T12 | Attacker relies on confusable characters absent from pinned dataset | Missed warning | Version-pinned tests; explicit update policy, future evaluation | Zero-day mappings remain |
| T13 | RTL/combining marks deceive result popup | Misread hostname evidence | U-label and A-label side-by-side, bidi isolates, code points, no HTML | Visual differences across fonts |
| T14 | Popup links user to attacker domain under 'verify' action | Credential leakage from UX | Never automatically link to candidate domain; user-initiated independent navigation guidance | User may still click elsewhere |
| T15 | Extension advertised as phishing blocker but only shows post-load badges | Unsafe reliance | Accurate copy, no pre-click or blocking claims; store listing checks | User misunderstands warnings |

## 4. Abuse cases as tests

1. A protected `paypal.com` is in fixtures; `pаypal.com` contains Cyrillic `а` and should be evaluated as a candidate confusable (exact outcome determined by pinned standard, confirmed via conformance checks).
2. `аррӏе.com` (whole Cyrillic lookalike of `apple.com`) must be evaluated via whole-script logic, not just mixed-script counting. Check registry restrictions independently; tests do not assume successful real-world registration.
3. `bücher.de` should not become a possible attacker merely because it uses Latin diacritics.
4. `login.paypal.com.attacker.co.uk` must resolve the registrable domain to `attacker.co.uk`.
5. `https://paypal.com@attacker.example/` must never be parsed as the protected hostname by the URL adapter.
6. `file:`, `chrome:`, `data:`, IP literals and broken punycode must not yield `NO_INDICATOR` as if clean.
7. Tab A navigation N+1 must invalidate navigation N's popup/badge state even if async steps complete out of order.

## 5. Data handling decision

- **Collected for immediate analysis:** top-frame current hostname, not full browsing history.
- **Transiently retained:** current tab ID, normalized hostname/evidence, navigation token in `storage.session`; not path, query, fragment, userinfo, or history list.
- **Shared externally:** nothing in M0/M1. No network endpoints, SDK telemetry, cloud diagnostics, or update requests at runtime.
- **Logs:** disabled by default for visited hostnames. Local development console output must use synthetic fixtures.
- **User control:** uninstall clears extension data; popup does not silently send feedback.

## 6. Security review checklist

- [ ] Manifest contains only documented necessary permissions; no `<all_urls>`, broad host permissions, content scripts, or DNR in M1.
- [ ] Runtime and shipped bundle contain no external network fetch or remote executable code.
- [ ] Test hostile Unicode, bidi, malformed and very long hostnames across popup and core.
- [ ] Audit all input sinks for HTML/DOM/URL injection.
- [ ] Audit core dependency licenses/lockfile, Unicode and PSL attribution/checksums.
- [ ] Reproduce at least one whole-script and one mixed-script fixture with frozen reference data.
- [ ] Verify stale-navigation handling after redirect, refresh, worker suspension and rapid tab reuse.
- [ ] Have an independent reviewer sign off on release notes and truthful security claims.

## M0-01 security-review preparation

**Review status: PREPARED, not maintainer-approved.** Gate 0 remains OPEN and M0-01 remains NOT AUTHORIZED; the maintainer review remains pending. This is a scoped technical assessment of the accepted ADR-0001/0002/0003 architecture, not formal signoff or evidence of an implemented detector.

The M0-01 trust boundary begins with an **untrusted hostname-only string** passed to a synchronous, deterministic offline normalizer. There is no browser URL parser, tab state, catalog, PSL/eTLD+1 selection, UTS #39 lookalike classifier, telemetry, or UI in this first slice.

| Threat | M0-01-specific risk and proposed verification | Responsibility / limit |
|---|---|---|
| T06 | Reject IP literals, localhost, incomplete/invalid labels and hostname inputs containing URLs, userinfo, ports or paths; do not silently classify such inputs as harmless | Host syntax boundary in M0-01; public/private/unknown PSL suffix classification belongs to M0-02 |
| T08 | Bound long and pathological Unicode inputs before processing; include invalid A-label, joiner, bidi, unpaired-surrogate, overlong label and repeatability tests, with explicit unsupported failures | M0-01 hostname validation; broader property/performance security testing remains M0-06 |
| T09 | Assert no runtime network, browser API, remote lookup, telemetry or visited-host logging in the normalization module; use only synthetic fixture inputs | M0-01 pure module; M1 navigation privacy and storage analysis are later gates; CI-only npm registry access is not runtime behavior |
| T10 | Verify pinned dependency lockfile and source provenance for `tr46@7.0.0`, strict nontransitional flags and deterministic offline checks; review any version change separately | Gate 0 evidence can support an internal candidate decision, not approve production shipping, source licensing or future dependency updates |

The M0-01 RED→GREEN slice must prove both valid Unicode/A-label round trips and rejection cases without generating `SAFE` or `MALICIOUS` outcomes. The accepted policy does **not** mean implementation exists. T01–T03 Unicode confusable detection, T05 PSL identity handling, T04/T07/T13 popup/worker risks, catalog decisions and any phishing claim stay with their later milestones.

**Residual review questions:** confirm strict normalization flags and hostile-input limits with the maintainer; explicitly accept or reject internal candidate use; and record a *separate* Gate 0 closeout/M0-01 GO or NO-GO. Preserve the existing third-party Unicode/PSL notices and root-license publication holds. No extension or distribution is authorized by this document.

## 7. Unsupported risks

Credential-stealing sites on ordinary ASCII domains, compromised genuine sites, phishing inside subdomains that are not IDN confusables, visually similar logos/content, malicious downloads, transport attacks, QR-based phishing, IDNs outside supported data/version, and deceptive email senders are **not handled**.