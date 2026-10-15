# Release and review checklist

**Status:** Planning. No functioning detector, compiled extension, benchmarks or release evidence exist yet.

## M0 core gate

- [ ] Proposed ADRs have been reviewed and accepted, amended, or rejected.
- [ ] Dependency, dataset versions, provenance, licenses and SHA-256 checksums are recorded.
- [ ] IDNA/UTS #46 and PSL behavior verified by reference and boundary fixtures.
- [ ] UTS #39 skeleton, mixed-script and whole-script vectors verified.
- [ ] Contract, property-based, deterministic and malformed-input tests pass.
- [ ] Benchmark hardware, environment and percentile metrics recorded.
- [ ] No network/browser/AI dependencies in the runtime core.
- [ ] Independent review of legitimate IDN false positives and unsupported cases.
- [ ] Test and review evidence associated with the exact commit SHA.

## M1 Chrome gate

- [ ] Every manifest permission justified; minimal Chrome MV3 permission set.
- [ ] Chrome stable version and unpacked extension installation verified.
- [ ] onCommitted top-frame filtering and HTTP(S)-only behavior tested.
- [ ] Redirects, reload, worker suspension and tab switching do not leak stale warnings.
- [ ] NO_INDICATOR is not presented as safe or verified.
- [ ] Untrusted text rendered inertly; Unicode bidirectional cases inspected.
- [ ] No external requests, analytics, URL paths/queries or permanent history collection.
- [ ] Protected-domain catalog contents, versions and provenance reviewed.
- [ ] Accessibility, copy and security claims independently reviewed.

## Public publishing — separate approval

- [ ] Repository/store/package naming and relevant trademark risks assessed.
- [ ] Source license chosen; third-party Unicode/PSL/dependency notices included.
- [ ] Store privacy and minimum-permission policies rechecked at publication date.
- [ ] Independent security review, known limits and release notes documented.
- [ ] Reproducible build, package hash, tagged commit and changelog produced.
- [ ] No unapproved scope, network code or permission change included.
