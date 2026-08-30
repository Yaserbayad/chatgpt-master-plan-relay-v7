# Q15-B Codex Usage Waiting Evidence — 2026-08-30

## Observed condition

The human attempted the Q15-B Codex bridge qualification after installing/exposing the Codex CLI. The Codex invocation returned:

`Usage limit reached. You've reached your usage limit. Increase your limits to continue using codex.`

This occurred before a successful Q15-B bridge round trip could be completed.

## Classification

`WAITING`

Reason: Q15-B requires one locally authenticated `codex exec` invocation. The required executor is temporarily unavailable because the current Codex usage allowance is exhausted. This is not evidence of a bridge, UI.Vision, browser, nonce-validation, or architecture failure.

## Deterministic resolution check

Q15-B may resume when a read-only Codex CLI invocation no longer returns the usage-limit condition. The qualification must then rerun the existing Q15-B probe exactly once under its current safety constraints.

## Safety / preserved evidence

- Q01–Q14 PASS evidence is unaffected.
- No Q15-B PASS is claimed.
- No material ChatGPT browser action is authorized while waiting.
- Do not substitute an API-key-funded path merely to bypass the ChatGPT/Codex allowance boundary unless separately authorized by the human.
- Q16 remains ineligible until Q15 becomes PASS.
