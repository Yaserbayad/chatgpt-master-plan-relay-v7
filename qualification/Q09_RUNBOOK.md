# Q09 — V10 Trusted Submit Qualification Runbook

Status: READY FOR ONE TARGET SEND
Date: 2026-08-29
Candidate: UI.Vision 10.0.178 / Chrome 152.0.7977.65
Target Project: https://chatgpt.com/g/g-p-6a9323b61110819182dba0224678aa8b/project
Probe: `qualification/Q09_TRUSTED_SEND_PROBE.js`
Depends on: Q08 PASS

## Objective

Prove exactly one trusted Send action creates exactly one new ChatGPT user turn.

## Preconditions

- ChatGPT is idle/completed.
- The same Relay v7 test Project conversation is open.
- The Q08 qualification payload remains staged as an unsent draft.
- Exactly one enabled composer submit surface has `aria-label="Send prompt"`.

## Probe behavior

1. validate Project/conversation identity and idle state;
2. require one target composer;
3. reconstruct the complete pre-send user-message-ID set using the Q07-qualified visible/includeHidden + Home/End scan;
4. restore bottom view and reacquire exactly one enabled `Send prompt` surface;
5. execute exactly one `uiv.browser.click(send)`;
6. never retry or resend after that click;
7. observe message IDs only for up to ~6 seconds;
8. PASS only if exactly one previously unseen user message ID appears in the same Project/conversation;
9. export `Q09_trusted_send_*.csv` whether the post-send result is PASS or ambiguous.

If post-send proof is ambiguous, the macro reports `AMBIGUOUS_AFTER_SINGLE_SEND` and explicitly performs no resend.

## PASS criteria

PASS only if the exported CSV proves:
- `send_performed = true`;
- `send_action_count = 1`;
- same Project and conversation before/after;
- `new_user_count = 1`;
- one stable new user message ID is recorded.

The assistant response does not need to finish for Q09 PASS.

## Verification before target run

- JavaScript syntax check: PASS (`node --check`).
- mock exactly-one-new-user path: PASS.
- mock zero-new-user ambiguity: PASS, no resend.
- mock two-new-user ambiguity: PASS, no resend.
- source contains exactly one Send click expression and no Enter-key submission path.
- local SHA-256: `d9cbeda60427d3deaf2e68e665e76eae2cd1903ed49bf5c1c5e2f7372581e555`.

## Official UI.Vision basis

- https://ui.vision/rpa/docs/uiv
- https://ui.vision/ai/ai-system-prompt

`uiv.browser.click` is the trusted Chrome/Edge browser input tier used for the single Send action.
