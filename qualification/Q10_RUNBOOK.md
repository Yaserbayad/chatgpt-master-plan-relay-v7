# Q10 — Same-Project Fresh-Chat / SPA Qualification Runbook

Status: READY FOR CORRECTED TARGET RETRY — PRE-SEND SPA READINESS FIX
Date: 2026-08-29
Candidate: UI.Vision 10.0.178 / Chrome 152.0.7977.65
Target Project: https://chatgpt.com/g/g-p-6a9323b61110819182dba0224678aa8b/project
Probe: `qualification/Q10_FRESH_CHAT_SPA_PROBE.js`
Depends on: Q09 PASS
Attempt-1 evidence: `qualification/Q10_ATTEMPT1_PROJECT_ROOT_READINESS_FAILURE.md`

## Objective

Prove:
- a deterministic fresh entry remains in the same configured Project;
- the no-conversation Project-root URL is treated as a valid transitional state, not a wrong-Project failure;
- fresh-chat UI readiness is not inferred from URL readiness alone;
- after exactly one trusted qualification Send, a new conversation ID appears;
- the new conversation ID differs from the prior conversation ID;
- temporary generic `chatgpt.com` URLs are treated as `UNKNOWN_TRANSITIONAL` while resolving, not falsely classified as a different Project;
- no resend occurs after the single Send.

## Attempt-1 target evidence

CSV:
`Q10_fresh_chat_spa_2026-08-29T22-30-59-494Z.csv`

SHA-256:
`bf05fe4fc23e1dfdd390ddb549a6004240390e1bab637284a90783756d083b47`

Attempt 1 safely failed before Send:
- `send_action_count = 0`;
- the configured Project root was observed;
- classification was `SAME_PROJECT_TRANSITIONAL`;
- no conversation ID existed at the root;
- the immediate composer lookup returned zero elements.

The original probe incorrectly treated Project-root URL resolution as fresh-chat UI readiness. This was a test defect, not evidence of wrong-Project navigation.

## Corrected readiness rule

The current probe does not proceed to staging until both are positively true:

1. the URL is `SAME_PROJECT_TRANSITIONAL` for the configured Project root; and
2. exactly one target composer has mounted.

The probe polls this combined condition across a bounded SPA readiness window. During that window:
- `DIFFERENT_PROJECT_OR_ORIGIN` fails immediately;
- the old conversation ID fails immediately;
- a premature new conversation ID before Send fails immediately;
- multiple composers fail immediately;
- no mounted composer by the end of the window fails before Send.

Only after readiness is proven does it stage `Q10_FRESH_CHAT_SPA_PROBE`, reacquire one enabled `Send prompt`, and permit the single qualification Send.

## Target procedure

1. Start in an existing Relay v7 Project conversation after ChatGPT is fully idle/completed.
2. Run the current `Q10_FRESH_CHAT_SPA_PROBE.js` once.
3. The probe records the existing conversation ID.
4. It uses `uiv.open(PROJECT_ROOT)` to navigate the current tab to the exact configured Project root.
5. It waits for both same-Project transitional identity and exactly one mounted fresh-chat composer.
6. It stages `Q10_FRESH_CHAT_SPA_PROBE` using target-qualified trusted browser click/type.
7. It reacquires exactly one enabled `Send prompt` surface.
8. It performs exactly one trusted Send click.
9. It never retries/resends after that click.
10. It samples the current URL while the ChatGPT SPA transition resolves.
11. PASS requires a final `SAME_PROJECT_NEW_CONVERSATION` URL whose conversation ID differs from the prior ID.
12. It exports `Q10_fresh_chat_spa_*.csv` whether PASS, pre-send failure, or post-send ambiguity.

## URL classification

- Project token + no `/c/<id>` → `SAME_PROJECT_TRANSITIONAL`
- Project token + old conversation ID → `SAME_PROJECT_OLD_CONVERSATION`
- Project token + different conversation ID → `SAME_PROJECT_NEW_CONVERSATION`
- `https://chatgpt.com/...` without a Project token while resolving → `UNKNOWN_TRANSITIONAL`
- other origin / resolved wrong location → `DIFFERENT_PROJECT_OR_ORIGIN`

`UNKNOWN_TRANSITIONAL` does not count as PASS; it is tolerated only while resolving. Positive same-Project proof remains required for acceptance.

## PASS criteria

PASS only if the CSV proves:
- old conversation ID exists before fresh entry;
- fresh Project root is observed without a conversation ID;
- fresh-chat composer readiness is positively established before staging;
- exactly one Send action occurs;
- no `DIFFERENT_PROJECT_OR_ORIGIN` result occurs;
- final new conversation ID exists and differs from the old conversation ID;
- final URL still contains the configured Project token.

If the corrected probe reports `AMBIGUOUS_AFTER_SINGLE_SEND`, do not rerun or resend; upload the CSV for reconciliation.

## Verification before corrected target retry

- JavaScript syntax check: PASS (`node --check`).
- focused delayed-composer regression against old probe: FAIL before Send as expected.
- same delayed-composer regression against corrected probe: PASS through exactly one Send to a new same-Project conversation.
- exactly-one Send path remains unchanged.
- corrected local SHA-256: `75c21364d86aa932c57a2f8c0f15293ee8757aea2dfb82eb4289036d989307f6`.
- corrected GitHub blob SHA: `7cc89950210a7cfd3f0eb31c4b7012782f88413a`.

## Current product/source basis

OpenAI Projects documentation, updated in August 2026, continues to describe projects as supporting creation of chats and depicts a project with a new-chat field:
- https://help.openai.com/en/articles/10169521

UI.Vision basis:
- https://ui.vision/rpa/docs/uiv
- https://ui.vision/ai/ai-system-prompt

`uiv.open(url)` is used for current-tab navigation; `uiv.tabs.list()` supplies URL observation; `uiv.browser.click/type` remains the trusted input tier for the staged marker and single Send.
