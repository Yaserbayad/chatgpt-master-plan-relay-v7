# Q10 — Attempt 2 Project Root Has No Composer

Status: PRESERVED PRE-SEND TARGET FAILURE — Q10 remains TODO
Date: 2026-08-29
Candidate: UI.Vision 10.0.178 / Chrome 152.0.7977.65
Probe: `qualification/Q10_FRESH_CHAT_SPA_PROBE.js`

## Target evidence

Uploaded CSV (user-side filename was normalized on upload):
`Q10_fresh_chat_spa_2026-08-29T22-38-49-879Z.csv`

SHA-256:
`5080d3e06e88ee59ae75b19bcc784f5b93e1a75aa6ded1c9c48599f58429ef40`

Observed failure:

`Q10 PRE_SEND_FAILURE: Q10 configured Project root was reached but fresh-chat composer did not become ready within the SPA readiness window; NO RESEND`

## Reconstructed target facts

The CSV contains one meta row and twelve trace rows.

Meta:
- `result = FAIL`
- `send_action_count = 0`
- `fresh_root_observed = 1`
- old conversation ID = `6a932926-c750-83ed-9e99-d3addc14f456`
- expected UI.Vision = `10.0.178`

Every trace sample from `2026-08-29T22:38:20.842Z` through `2026-08-29T22:38:47.516Z` reports:
- classification `SAME_PROJECT_TRANSITIONAL`
- URL `https://chatgpt.com/g/g-p-6a9323b61110819182dba0224678aa8b/project`
- no conversation ID.

Thus the Project-root identity was stable for roughly 27 seconds, but the qualified chat composer never mounted.

## Diagnosis

Attempt 1 showed that URL readiness did not imply composer readiness. Attempt 2 added a bounded composer-readiness wait. The second target run demonstrates that the Project root itself is not a fresh-chat composer surface in this target UI; increasing the wait again would be a materially equivalent retry with no new evidence.

The next corrective action is therefore read-only Project-root UI discovery to identify the actual control/surface that starts a new chat inside the configured Project. No Send attempt should occur until that control is target-proven.

## Safety / replay status

This attempt failed before any material submission:
- `send_action_count = 0`
- no qualification marker was sent
- no new conversation was created by the probe
- no resend ambiguity exists.

Q10 remains safe to continue with a materially different read-only diagnostic.
