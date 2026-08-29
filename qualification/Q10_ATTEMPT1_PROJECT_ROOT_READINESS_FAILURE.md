# Q10 — Attempt 1 Project-Root Readiness Failure

Status: PRESERVED PRE-SEND FAILURE — Q10 remains TODO
Date: 2026-08-29
Candidate: UI.Vision 10.0.178 / Chrome 152.0.7977.65
Probe: `qualification/Q10_FRESH_CHAT_SPA_PROBE.js`

## Target evidence

`Q10_fresh_chat_spa_2026-08-29T22-30-59-494Z.csv`

SHA-256:
`bf05fe4fc23e1dfdd390ddb549a6004240390e1bab637284a90783756d083b47`

Observed error:

`Q10 PRE_SEND_FAILURE: Q10 fresh Project root requires exactly one composer; found 0; NO RESEND`

## What the CSV proves

- `result = FAIL`
- `send_action_count = 0`
- `fresh_root_observed = 1`
- `url_before` was the configured Relay v7 Project conversation
- the old conversation ID was `6a932926-c750-83ed-9e99-d3addc14f456`
- the first post-navigation trace was `SAME_PROJECT_TRANSITIONAL`
- the URL was exactly `https://chatgpt.com/g/g-p-6a9323b61110819182dba0224678aa8b/project`
- no conversation ID existed yet at the Project root

Therefore the fresh-entry identity/SPA classification itself worked. The failure happened before any Send because the probe treated Project-root URL resolution as sufficient UI readiness and then performed only one bounded composer lookup.

## Diagnosis

The original probe broke out of its fresh-entry loop as soon as it observed `SAME_PROJECT_TRANSITIONAL`. It then queried the composer once with a 3-second finder timeout. This conflated two distinct conditions:

1. navigation/identity readiness — the correct Project root is loaded;
2. fresh-chat UI readiness — exactly one composer has mounted.

The target CSV proves condition 1 but not condition 2.

Current OpenAI Projects documentation describes a project surface with a new-chat field, so the correction is to wait for SPA composer readiness while continuously retaining same-Project URL classification rather than changing the architecture or guessing a new selector.

Reference:
- https://help.openai.com/en/articles/10169521

## Corrective action

The Q10 probe is corrected so pre-send readiness requires both:

- `SAME_PROJECT_TRANSITIONAL`; and
- exactly one mounted target composer.

It polls that combined condition across a bounded readiness window. Any wrong-origin, old-conversation, premature new-conversation, multiple-composer, or timeout state fails before Send. The exactly-one Send path remains unchanged and is not entered until readiness is positively established.

Focused regression:
- old probe with delayed composer mount: FAIL before Send;
- corrected probe with delayed composer mount: PASS through one Send to a new same-Project conversation;
- JavaScript syntax check: PASS.

Corrected probe SHA-256:
`75c21364d86aa932c57a2f8c0f15293ee8757aea2dfb82eb4289036d989307f6`
