# Requirement-to-evidence traceability matrix

**Status:** Planned; test names are proposed IDs, not executed checks.

| Requirement | ADR linkage | Proposed tests | Gate |
|---|---|---|---|
| FR-01 strict hostname input | 0001, 0002 | U1 invalid input; F011–F019, F028 | M0 |
| FR-02 IDNA/ACE normalization | 0002, 0003 | U1 roundtrip; F003, F025–F027 | M0 |
| FR-03 registrable domain via PSL | 0002, 0003 | U2 suffix; F008–F010, F020–F021 | M0 |
| FR-04 UTS #39 skeleton | 0003, 0004 | U3 normative vectors; F003–F005, F023 | M0 |
| FR-05 independent script indicators | 0003, 0004 | U3 script/whole-script; benign controls F006–F007 | M0 |
| FR-06 protected catalog compare | 0004, 0005 | U4 same-suffix; F001–F005, F022, F029–F030 | M0 |
| FR-07 structured evidence, metadata | 0003, 0004 | U5 schema validation and snapshot stability | M0 |
| FR-08 discrete outcome semantics | 0004 | U5 classification; no `SAFE`/`MALICIOUS` | M0 |
| FR-09 top-frame HTTP(S) navigation | 0006 | E1 top-frame/redirect/unsupported scheme | M1 |
| FR-10 badge and popup | 0004, 0006 | E2 keyboard/copy/long host/bidi | M1 |
| FR-11 local privacy | 0001, 0007 | S1 network/permission/storage review | M1 |
| FR-12 stale navigation isolation | 0006, 0007 | E1 tab switch/refresh/worker restart | M1 |

## Acceptance evidence template

When implementation starts, attach to each PR:

```text
Task ID:
Requirement(s) and ADR(s):
Base and reviewed HEAD SHA:
Added/changed behavior:
Explicit non-goals honored:
Test command(s) and result:
Representative fixtures:
Unicode/PSL/catalog version changes:
New permissions/network/storage behavior:
Known limits, reviewer, verdict:
```

A green unit suite is not a substitute for a reviewed domain-correctness and benign-IDN corpus. A product test is not evidence of phishing efficacy.