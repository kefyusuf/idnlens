# IDNLens

**See what a domain is really made of.**

IDNLens is a privacy-first, offline domain-inspection project focused on Unicode and internationalized domain-name (IDN) impersonation indicators.

**Status:** Planning, v0.1 (October 15, 2026). No detection engine or browser extension has been implemented or tested.

## Product boundaries

- **M0:** Implement and verify a deterministic TypeScript `analyzeDomain()` core and a standards-based test corpus.
- **M1:** Add a Chrome Manifest V3 adapter that observes committed top-frame HTTP(S) navigations and offers an accessible action badge/popup.
- Analyze locally without an account, backend, analytics, or external runtime requests.
- Do not claim that a site is safe or malicious. Evidence-based outputs are `NO_INDICATOR`, `REVIEW`, `LOOKALIKE`, and `UNSUPPORTED`.
- No automatic navigation blocking, generic phishing detection, full-history collection, or AI/LLM functionality in the initial scope.

## Project documentation

- [Product requirements (PRD)](docs/PRD.md)
- [Scope and non-goals](docs/SCOPE.md)
- [Technical architecture](docs/ARCHITECTURE.md)
- [Architecture decision index](docs/DECISIONS.md)
- [Threat model](docs/THREAT-MODEL.md)
- [Test strategy](docs/TEST-PLAN.md)
- [Milestones and gates](docs/ROADMAP.md)
- [Requirements traceability](docs/TRACEABILITY.md)
- [Project overview](docs/PROJECT-OVERVIEW.md)
- [Research references](docs/RESEARCH.md)

The initial ADRs are **proposals**, not accepted or implemented decisions. Sample cases are **hypotheses**, not measured detection results.

## Implementation gate

Complete Gate 0 (dependency choices, Unicode/IDNA/PSL data provenance and licenses, reviewed conformance fixtures, accepted decisions) before implementing M0. Chrome packaging belongs to M1.

## Source material

- [Unicode Technical Standard #39](https://www.unicode.org/reports/tr39/)
- [Unicode Technical Standard #46](https://www.unicode.org/reports/tr46/)
- [Chromium IDN display policy](https://chromium.googlesource.com/chromium/src/+/main/docs/idn.md)
- [Public Suffix List](https://publicsuffix.org/)
- [Chrome webNavigation API](https://developer.chrome.com/docs/extensions/reference/api/webNavigation)

> This project is not a general phishing blocker. A result with no indicators is not proof that a site is safe.

A source-code license and third-party dataset notices must be reviewed before publication of an implemented build.
