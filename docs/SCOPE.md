# Frozen scope, guardrails and milestones

**Status:** Proposed scope freeze, 2026-10-15.

## Definition of done by milestone

### M0 — Offline analysis core ONLY

In: `analyzeDomain(hostname, protectedDomains, pinnedData)`; hostname parsing/normalization, eTLD+1/PSL, Unicode script + UTS #39 skeleton, discrete results with evidence and metadata, fixtures, property/negative tests, benchmarks and documentation. No HTTP requests even for data updates at runtime.

Out: `manifest.json`, extensions, popup, persistent storage, client/backend API, OAuth, databases, AI, HTML scraping, DNR/webRequest, threat feeds, web crawler, telemetry, screenshots, brand-name crawler, fuzzy ASCII similarity.

**M0 Gate:** inspectable fixtures and measured behavior; no security efficacy claim.

### M1 — Minimal Chrome extension adapter

In: Manifest V3 service worker, top-frame `webNavigation.onCommitted` for HTTP(S), transient local per-tab state, toolbar badge and popup explaining results, no-host-permissions-by-default investigation, small reviewed offline protected domain catalog, browser integration testing, privacy statement.

Out: blocking, redirects, intercepting clicks, `declarativeNetRequest`, content scripts, all-page access, side panel, alerts in page DOM, remote updates, browser sync, account, Firefox binary, logo recognition, generic phishing claims.

**M1 Gate:** no spurious current-tab badges after navigation; minimal permissions; no network calls; no stale warnings from old page/document IDs; accessibility tested.

### M2 — Future, not authorized

Optional pilot/quantitative evaluation, more browser engines, custom watchlist, DNR-based intervention feasibility, provenance-signed catalog updates, optional locale support. A new problem statement, independent ADR and acceptance criteria are mandatory before any M2 work.

## Changes requiring explicit scope review

Any new permission or network flow; new external dependency; expanding from domains to page contents; claiming phishing detection or prevention; persistent history; opt-in data transmission; generalized risk scores; extra frameworks/monorepos; automatic updates; auto-blocking; integration with cloud reputation APIs; ML/LLM.

## Release-blocking principles

1. Never label a site as `SAFE` or `MALICIOUS` from this algorithm.
2. Never assert that no warning implies safe browsing.
3. Unicode presence alone is not a warning.
4. No input-controlled HTML insertion or URL fetch.
5. No hidden remote telemetry, browser history retention, or overly broad permissions.
6. No support of domains outside confidently parsed scope as a clean result.
7. Detect only what the standard+catalog rules can support; log all gaps as limitations.
8. Avoid needless abstractions until an implementation or test requires them.

## Deferred backlog (explicitly NOT part of PRD acceptance)

- Detect ASCII edit-distance typo domains and brand variants.
- Pre-click interception and network blocking.
- DNS/WHOIS/certificate reputation enrichment.
- Cross-browser adapter abstraction before a second browser is actually ported.
- Remote domain catalog sync, signature verification infrastructure and SaaS dashboard.
- Automated brand/domain discovery; screen/font appearance scoring and AI vision.
- Enterprise administration and crowdsourced threat data.