# Research, reference sources and verification boundaries

**Planning review:** 2026-10-15. The sources below justify design constraints; none prove a particular real-world Unicode lookalike is registered, malicious or currently bypasses Chrome.

## Primary standards

1. Unicode UTS #39: https://www.unicode.org/reports/tr39/ — skeleton mappings, confusable detection, mixed/whole-script tests and identifier restrictions. Skeleton equivalence is not a pixel-level visual match.
2. Unicode UTS #46: https://www.unicode.org/reports/tr46/ — IDNA compatibility and processing. Implementation version and behavior must be recorded.
3. Chromium IDN policy: https://chromium.googlesource.com/chromium/src/+/main/docs/idn.md — existing browser spoof checks; avoid assuming those checks are absent or bypassed.
4. Public Suffix List: https://publicsuffix.org/ and https://github.com/publicsuffix/list — registrable domain boundaries, including compound and private suffixes.
5. IANA IDN tables: https://www.iana.org/domains/idn-tables — registries may prohibit proposed character mixes.
6. Unicode data terms: https://unicode.org/copyright.html — verify licensing and notices before redistribution.

## Extension behavior

7. Chrome webNavigation: https://developer.chrome.com/docs/extensions/reference/api/webNavigation — committed navigation observation is not synchronous request interception.
8. Chrome declarativeNetRequest: https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest — potential blocking research only, not M1 scope.
9. Chrome Web Store policies: https://developer.chrome.com/docs/webstore/program-policies/policies — accuracy of claims, least privilege and treatment of browser activity.

## Unverified assertions

- IDNLens branding and trademark availability have not been cleared.
- Synthetic test inputs do not establish that their domains are registrable or live.
- Relative effectiveness versus Chromium, Firefox or phishing extensions has not been benchmarked.
- Unicode skeleton and xn-- labels alone neither imply maliciousness nor catch every lookalike.
- A post-commit badge cannot promise pre-click prevention.

## Gate 0 outputs

Create docs/DEPENDENCIES.md with exact package versions and licenses, reference test vectors, IDNA mapping semantics, PSL private-rule decision, source URLs, hashes and known deviations. This document does not exist yet.
