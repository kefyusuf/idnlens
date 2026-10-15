# IDNLens — Project overview

**Date:** October 15, 2026  
**Status:** Planning draft. Implementation has not started.

## Product

IDNLens is a small open-source security project that inspects internationalized domain names (IDNs) locally and explains signals of visual Unicode impersonation. It is neither a generic phishing detector, URL blocker, nor a site-safety certification tool.

The first delivery is a deterministic TypeScript `analyzeDomain()` function backed by pinned reference datasets, explainable output, and automated tests. The second delivery is a Chrome Manifest V3 extension observing committed top-level navigations and showing nonblocking toolbar warnings.

## Rationale

Chromium already includes substantial IDN spoofing checks. IDNLens does not aim to replace those controls. It offers independent, testable explanations of character scripts, code points, and domain identity. Non-ASCII characters, including `xn--` labels, are not inherently malicious.

## M0 — Core acceptance criteria

1. Validate hostname-only inputs; malformed URL-like strings, port numbers, and IP addresses must never be silently classified as safe.
2. Perform consistent U-label and A-label (Punycode) normalization.
3. Extract registrable domains using a version-pinned Public Suffix List, including multi-label suffixes such as `co.uk`.
4. Verify UTS #39 skeleton, mixed-script, and whole-script behavior against reference vectors.
5. Compare against a bounded, exact protected-domain catalog with an explicit same-suffix policy.
6. Return only `NO_INDICATOR`, `REVIEW`, `LOOKALIKE`, or `UNSUPPORTED`, with evidence.
7. Cover legitimate IDNs, invalid inputs, and adversarial Unicode fixtures.
8. Require no browser, database, external network, server, or AI/LLM.

## M1 — Chrome acceptance criteria

Observe only top-frame committed HTTP(S) navigations. Explain suspect results through a browser-action badge and popup, without navigation blocking or external data transmission. Do not retain full browsing history or display stale warnings after another navigation.

## Decisions proposed for review

- ADR-0001: Framework-independent pure TypeScript detection core.
- ADR-0002: Standards-defined IDNA parsing and registrable domains through PSL.
- ADR-0003: Pin Unicode and PSL versions, licenses, and checksums.
- ADR-0004: Explainable indicators instead of blanket safe/malicious scores.
- ADR-0005: Small, reviewed, versioned catalog of protected domains.
- ADR-0006: Chrome MV3 committed-navigation observation, badge, and popup.
- ADR-0007: Local processing and minimum browser permissions.
- ADR-0008: No pre-click prevention or automatic blocking in v0.

All decisions remain **Proposed** pending review.

## Explicit hold list

Firefox/Edge packaging, general phishing classification, typosquatting, brand crawling, threat-intelligence services, remote update feeds, cloud APIs, subscriptions, dashboards, machine learning, OCR/screenshot inspection, and pre-click blocking. None is authorized as implementation scope.

## Next step

**Gate 0:** Select and verify the IDNA/PSL library strategy; fix Unicode dataset version, provenance, and licenses; verify fixture expectations against references. Then implement M0-01 as a small test-first change.

This repository currently contains planning documents, not evidence of functional browser protection.
