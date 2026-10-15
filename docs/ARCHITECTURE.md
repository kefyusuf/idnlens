# Technical design — IDNLens

**Status:** Proposed · **Scope:** M0 design and restricted M1 integration sketch.

## 1. Architecture and responsibility split

```text
 M0 (offline, platform-independent)

 caller-supplied hostname + protected registrable domains + pinned datasets
                             |
                  [input validation]
                             |
                  [IDNA A-label/U-label]
                             |
                  [PSL/eTLD+1 resolver]
                             |
           [script/confusable signal extraction]
                             |
             [exact protected catalog matching]
                             |
             [discrete rule-based classification]
                             |
                typed DomainAnalysis result

 M1 (thin Chrome MV3 integration)

 chrome.webNavigation.onCommitted (top frame, HTTP(S))
                             |
                    URL -> hostname adapter
                             |
                     M0 analyzeDomain
                             |
                 storage.session per-tab summary
                             |
                 chrome.action badge + popup
```

No generic plugin architecture, no event bus, no server, no factory framework. Small pure functions with explicit data dependencies are sufficient.

## 2. Public M0 API (conceptual contract)

```ts
type Outcome = 'NO_INDICATOR' | 'REVIEW' | 'LOOKALIKE' | 'UNSUPPORTED';

type AnalysisInput = {
  hostname: string;
  protectedDomains: readonly string[]; // exact, validated registrable domains
};

type Evidence = {
  code: 'MIXED_SCRIPT' | 'CONFUSABLE_MATCH' | 'WHOLE_SCRIPT_MATCH' |
        'IDNA_ANOMALY' | 'UNSUPPORTED_HOST';
  detail: string;                 // static/generated safe text; no HTML
  codePoints?: readonly string[]; // U+XXXX for relevant characters
};

type DomainAnalysis = {
  outcome: Outcome;
  asciiHostname: string | null;
  unicodeHostname: string | null;
  registrableAscii: string | null;
  registrableUnicode: string | null;
  matchedProtectedDomain: string | null;
  evidence: readonly Evidence[];
  dataVersions: { unicode: string; psl: string; catalog: string };
};

declare function analyzeDomain(input: AnalysisInput): DomainAnalysis;
```

The accompanying JSON Schema is authoritative for the serialized output shape. TypeScript code shown here is **illustrative** and not an implementation. `protectedDomains` will be injected in M0 fixtures and provided by bundled versioned data in M1.

## 3. Canonical hostname handling

- Chrome/browser adapter uses `new URL(navigation.url)` and passes `url.hostname` only; NEVER string-split a raw URL on `/`, `@` or `.` to identify the registered domain.
- The core accepts one hostname, not URL/userinfo/path/query/hash. Domain strings with schemes, embedded credentials, paths or ports are invalid/unsupported.
- Use a standards-conforming, pinned IDNA/UTS #46 transformation for U-label vs A-label. Browser URL serialization usually yields ASCII `xn--` A-labels; the core must intentionally reverse-map to Unicode for analysis.
- Reject malformed A-labels, invalid label lengths, disallowed characters and transformation errors instead of auto-declaring clean.
- Use a PSL implementation with explicit version and effective-TLD+1 resolution. Check that `login.paypal.com.attacker.co.uk` resolves to `attacker.co.uk`; do not treat text before registrable suffix as trusted identity.
- Exclude IPs, localhost, extension schemes, data URLs, unsupported/intranet-only hosts from IDN analysis (`UNSUPPORTED`); no automatic DNS/network lookup to validate existence.
- Case/normalization and trailing root dot are handled explicitly; IDNA policy and behavior must be proven with fixtures. Avoid ad-hoc Unicode `.toLowerCase()` as a replacement for IDNA.
- Canonical protected-domain list must be validated through the same pipeline.

## 4. Detection

- For each supported registrable domain, obtain scripts and UTS #39 confusable skeleton from pinned Unicode data and a documented mapping implementation. Include `Script_Extensions` behavior and a test for whole-script confusables, not merely counting unique `Script` values.
- Compare against protected catalog entries; a candidate exactly equal to a protected domain is not a `LOOKALIKE`.
- Restrict first-version protected-domain confusable comparison to the **same exact normalized public suffix**, avoiding speculative cross-TLD conflation.
- Detect mixed-script anomalies independently. `REVIEW` can be used where anomaly is supported but protected match is absent. Unicode alone must not trigger it.
- `LOOKALIKE` wins over `REVIEW`; `UNSUPPORTED` is reserved for non-analyzable input, not for a missed match.
- When an IDN maps to a canonical domain due to permitted IDNA equivalence, do not misclassify it as a distinct attacker domain without verifying canonical identity.
- No edit-distance scoring, visual ML, typography/font-specific metrics or automatic registration lookups.

## 5. M1 extension lifecycle and data flow

1. On `webNavigation.onCommitted`, filter `frameId === 0` and `http:`/`https:`. Check document identity where supported.
2. Immediately clear/replace any warning state for that tab for the current committed navigation; schedule analysis with an anti-stale tab/document token.
3. Convert the URL to hostname, analyze via M0, store only essential per-tab result in `chrome.storage.session` (not full URL, query, fragment or history).
4. For `REVIEW`/`LOOKALIKE`, set badge text `!` and background; for other results, clear badge.
5. Popup finds active tab ID, reads its corresponding result, and shows result along with a `not a safety verdict` disclaimer. For a missing result, show `No current analysis`, not `Safe`.
6. `tabs.onRemoved` may be required for cleanup; if used, review exact `tabs` permission necessity separately. Add no broad host permission by default.
7. Handle extension reload and MV3 worker suspension: missing `storage.session` data yields an unknown state; do not reuse prior-page results.

Chrome's `webNavigation` API describes navigation lifecycle signals, **not a guaranteed synchronous request-blocking mechanism**. No claim of protection prior to page loading in M1.

## 6. Technology constraints

- TypeScript, strict mode. Tests through Vitest or equivalent; choose smallest build tool justified by MV3/TS needs.
- Source tree deliberately flat until a second adapter exists.
- Proposed layout after implementation begins:

```text
src/core/{idna.ts,psl.ts,scripts.ts,confusables.ts,analyze.ts,types.ts}
src/data/     # generated, versioned, attributed security tables
src/chrome/   # M1 only: background.ts, popup.{html,ts}, manifest.json
src/tests/    # conformance/regression/property tests
```

- Dataset updates are explicit PRs: record Unicode version, source URL, SHA-256 of source tables, PSL snapshot date, license notices, diff summary and test results. No runtime downloading in M0/M1.
- Third-party dependency selection requires a smoke spike for IDNA behavior, PSL resolution and bundle footprint before lockfile is accepted. Prefer correctness and provenance over a self-written IDNA codec.

## 7. Error, privacy and adversarial handling

- Bound hostname length and label count; reject malformed UTF-16 (e.g. unpaired surrogate) and excessive characters without uncaught exceptions.
- All display of attacker-controlled hostnames uses DOM text APIs (`textContent`), never `innerHTML` or arbitrary `href` to the visited domain.
- Apply directionality isolation in popup and provide ASCII/Punycode values for inspection.
- Do not transmit, retain or log full URLs. In tests and diagnostics, use synthetic/sanitized hosts.
- Distinguish `analysis unsupported` from `no indicator` and `possible lookalike` from `confirmed fraud`.

## 8. Anti-patterns rejected for first release

- `hostname.includes('amazon')` or string-splitting suffixes.
- Checking only whether `xn--` appears (misses diverse cases / adds false positives).
- Treating Unicode code points as malicious by default.
- Comparing entire URLs or arbitrary subdomains to brand names.
- Trusting `https` as proof of brand identity.
- Using a general LLM/vision model for hostname classification.