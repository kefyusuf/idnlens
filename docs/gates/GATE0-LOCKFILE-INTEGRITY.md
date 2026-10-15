# Gate 0-03A — npm lockfile integrity evidence

**Status:** Targeted lockfile task verified; Gate 0 remains **OPEN**.  
**Date:** 2026-10-15  
**Scope:** Reproducible installation of the two already-reviewed candidate packages and two transitives. No production M0 code, browser integration, new dependencies, or ADR acceptance.

## Acceptance questions

1. Does a committed lockfile freeze direct and transitive versions?
2. Does each tarball have an npm integrity checksum and fixed resolver URL?
3. Does CI enforce the committed graph using `npm ci`, without running package scripts?
4. Do the existing IDNA/PSL behavior fixtures still pass?

## TDD RED → GREEN evidence

- **RED:** commit `4ed197a` ([workflow](https://github.com/kefyusuf/idnlens/actions/runs/38721414418)) ran four new provenance tests against an intentionally missing lockfile. **4 provenance tests failed** with `package-lock.json` missing; the preexisting 33 candidate tests passed. The workflow-generated lockfile candidate was captured from that run, not invented manually.
- **GREEN:** committed lockfile `96e0fb4`; final CI wiring commit `a876422`. [Dependency workflow run](https://github.com/kefyusuf/idnlens/actions/runs/38721590639) completed successfully with **37/37 tests passed**. It installed using `npm ci --ignore-scripts --no-audit --no-fund`.
- **Independent baseline:** `gate0-idna.yml` remains responsible for the original 25 Node-only tests, without requiring npm dependencies.

## Locked graph

- `tr46@7.0.0` → `punycode@2.3.1`
- `tldts@7.4.18` → `tldts-core@7.4.18`
- All four registry tarballs have SHA-512 integrity entries, tested by `dependency-provenance.test.mjs`.
- The direct dependencies in `package.json` must match the lockfile root and be exact versions.

## Interpretation

**PASS for the narrowly scoped npm lockfile milestone.** This does not establish that the packages are appropriate production dependencies. Integrity does not itself pin upstream Unicode UTS #39 security files or identify the PSL snapshot embedded by `tldts`.

## Open / not verified by this PR

- Unicode UTS #39 versioned source files, checksums, licensing and transforms.
- Verifiable PSL upstream snapshot attribution and checksum; package data provenance.
- License audit for all packages, maintenance/security review.
- Reproducible bundle size measurement and final dependency selection.
- ADR-0002 and ADR-0003 remain **Proposed**; Gate 0 is not closed.

**Next smallest task:** independently document and verify exact standards data snapshots, source hashes and notices; only then undertake ADR acceptance review. No M0-01 work is authorized by this evidence.
