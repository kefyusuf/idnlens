# Architecture Decision Record index

**Architectural direction only:** ADR-0001, ADR-0002 and ADR-0003 are accepted by the maintainer **when this decision PR is reviewed and merged**; other ADRs remain `Proposed`. Acceptance of a design is **not** proof of implementation, Gate 0 closure, internal M0-01 authorization, or public distribution approval.

| ADR | Decision topic | Status | Applies |
|---|---|---|---|
| [0001](adr/ADR-0001.md) | Offline, deterministic core first | Accepted | M0 |
| [0002](adr/ADR-0002.md) | IDNA + registrable domain normalization | Accepted | M0 |
| [0003](adr/ADR-0003.md) | Version-pinned Unicode/PSL data | Accepted | M0 |
| [0004](adr/ADR-0004.md) | Evidence-based discrete outcomes | Proposed | M0 |
| [0005](adr/ADR-0005.md) | Finite protected-domain catalog | Proposed | M0/M1 |
| [0006](adr/ADR-0006.md) | Chrome on-commit, badge-only MVP | Proposed | M1 |
| [0007](adr/ADR-0007.md) | Privacy, storage and permission minimization | Proposed | M1 |
| [0008](adr/ADR-0008.md) | No automatic interception/blocking | Proposed | M1 |

**Gate 0 remains OPEN; M0-01 is NOT authorized.** Third-party redistribution notices, the repository license choice and release approval remain separate issues.

## ADR review rules

An ADR is `Accepted`, `Superseded`, or `Rejected` by a documented maintainer decision. Each contains context, considered alternatives, decision, consequences and reversibility. When implementation contradicts an accepted ADR, open a new ADR or explicit amendment in a dedicated PR. Decisions in future work are **not permission to ship scope-expanding features**.