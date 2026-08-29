# Q10 — Same-Project Fresh-Chat / SPA Qualification Runbook

Status: READY FOR ONE TARGET FRESH-CHAT SEND
Date: 2026-08-29
Candidate: UI.Vision 10.0.178 / Chrome 152.0.7977.65
Target Project: https://chatgpt.com/g/g-p-6a9323b61110819182dba0224678aa8b/project
Probe: `qualification/Q10_FRESH_CHAT_SPA_PROBE.js`
Depends on: Q09 PASS

## Objective

Prove:
- a deterministic fresh entry remains in the same configured Project;
- the no-conversation Project-root URL is treated as a valid transitional state, not a wrong-Project failure;
- after exactly one trusted qualification Send, a new conversation ID appears;
- the new conversation ID differs from the prior conversation ID;
- any temporary generic `chatgpt.com` URL is treated as `UNKNOWN_TRANSITIONAL` while resolving, not falsely classified as a different Project;
- no resend occurs after the single Send.

## Target procedure

1. Start in the existing Relay v7 Project conversation after ChatGPT is fully idle/completed.
2. Run `Q10_FRESH_CHAT_SPA_PROBE.js` once.
3. The probe records the existing conversation ID.
4. It uses official `uiv.open(PROJECT_ROOT)` to navigate the current tab to the exact configured Project root and waits for a `SAME_PROJECT_TRANSITIONAL` state with no conversation ID.
5. It requires exactly one Project composer.
6. It stages `Q10_FRESH_CHAT_SPA_PROBE` using target-qualified trusted browser click/type.
7. It reacquires exactly one enabled `Send prompt` surface.
8. It performs exactly one trusted Send click.
9. It never retries/resends after that click.
10. It samples the current URL while the ChatGPT transition resolves.
11. PASS requires a final `SAME_PROJECT_NEW_CONVERSATION` URL whose conversation ID differs from the prior ID.
12. It exports `Q10_fresh_chat_spa_*.csv` whether the post-send outcome is PASS or ambiguous.

## URL classification

- Project token + no `/c/<id>` → `SAME_PROJECT_TRANSITIONAL`
- Project token + old conversation ID → `SAME_PROJECT_OLD_CONVERSATION`
- Project token + different conversation ID → `SAME_PROJECT_NEW_CONVERSATION`
- `https://chatgpt.com/...` without a Project token while resolving → `UNKNOWN_TRANSITIONAL`
- other origin / resolved wrong location → `DIFFERENT_PROJECT_OR_ORIGIN`

`UNKNOWN_TRANSITIONAL` does not count as PASS; it is tolerated only until the URL resolves. This prevents transient SPA URL changes from being falsely treated as wrong-Project while still requiring positive same-Project proof for acceptance.

## PASS criteria

PASS only if the CSV proves:
- old conversation ID exists before fresh entry;
- fresh Project root is observed without a conversation ID;
- exactly one Send action occurs;
- no `DIFFERENT_PROJECT_OR_ORIGIN` result occurs;
- final new conversation ID exists and differs from the old conversation ID;
- final URL still contains the configured Project token.

If the probe reports `AMBIGUOUS_AFTER_SINGLE_SEND`, do not rerun or resend; upload the CSV for reconciliation.

## Verification before target run

- JavaScript syntax check: PASS (`node --check`).
- mock successful fresh-entry → transitional URL → new-conversation path: PASS.
- mock no-new-ID path: correctly reports ambiguity and performs only one Send.
- source contains exactly one qualification Send click expression.
- local SHA-256: `bfb49b2fdbca5deb35ee3c50b26751a0b096fad131834fc6b8684eac23cf725b`.

## Official UI.Vision basis

- https://ui.vision/rpa/docs/uiv
- https://ui.vision/ai/ai-system-prompt

Current UI.Vision V10 documentation defines `uiv.open(url)` as current-tab navigation and `uiv.tabs.list()` as the current URL/tab observation API. `uiv.browser.click/type` is the trusted Chrome/Edge input tier used for the staged marker and single Send.
