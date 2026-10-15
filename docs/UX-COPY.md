# UX wording and claims

**Status:** Proposed copy only; no user interface has been implemented.

| Outcome | Header | Explanation |
|---|---|---|
| LOOKALIKE | Possible domain impersonation | This hostname resembles a protected domain through potentially confusable characters. Check the destination independently before entering credentials. |
| REVIEW | Unusual domain characters | A supported script/character indicator was detected. This alone does not prove malice. |
| NO_INDICATOR | No supported indicator found | None of the currently implemented checks matched. This does not verify safety or ownership. |
| UNSUPPORTED | Domain not analyzed | IDNLens could not reliably analyze this input. This is not a safety result. |

## Synthetic illustration

Possible domain impersonation:
- Unicode hostname: pаypal.com (the inserted a-like character is Cyrillic U+0430)
- ASCII representation: calculate with the chosen, tested IDNA implementation
- Resembles: paypal.com (only if present in the verified protected catalog)
- Evidence: U+0430 versus Latin U+0061

The synthetic example is not proof that the hostname is registerable or live.

## Prohibited claims

Never use: safe, verified, trusted, 100% protection, blocks phishing, intercepts before click, protects against every lookalike, all non-ASCII names are unsafe, or all xn-- domains are malicious.

## Accessibility and safe rendering

- Show Unicode and ASCII hostname as inert text, not attacker-controlled links.
- Distinguish the registrable domain from the subdomain and preserve the rightmost suffix when wrapping.
- Use bidirectional isolation for mixed RTL/LTR characters and inspect control-character rendering.
- Use explicit copy actions only on user interaction.
- Pair badge color with visible text; do not rely on red/green alone.
- For missing tab state show "No current analysis", not a stale or safe verdict.
