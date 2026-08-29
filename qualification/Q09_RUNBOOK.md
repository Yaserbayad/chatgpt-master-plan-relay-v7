# Q09 — V10 Trusted Submit Qualification Runbook

Status: PASS — TARGET QUALIFICATION COMPLETE
Date: 2026-08-29
Candidate: UI.Vision 10.0.178 / Chrome 152.0.7977.65
Target Project: https://chatgpt.com/g/g-p-6a9323b61110819182dba0224678aa8b/project
Probe: `qualification/Q09_TRUSTED_SEND_PROBE.js`
Final evidence: `qualification/Q09_EVIDENCE.md`
Depends on: Q08 PASS

## Objective

Prove exactly one trusted Send action creates exactly one new ChatGPT user turn.

## Final target result

CSV:
`Q09_trusted_send_2026-08-29T22-22-14-549Z.csv`

SHA-256:
`43c5fb63ff5b1028313bcbfd14bb6029ccd70e4863c029e7c97e41c6d5bce9bb`

Observed result:
- `result = PASS`
- `send_performed = 1`
- `send_action_count = 1`
- same Project URL before/after
- same conversation ID before/after: `6a932926-c750-83ed-9e99-d3addc14f456`
- pre-send unique user count = 3
- new user count = 1
- new user message ID = `38eb6d48-0578-4f73-8ade-33055a2bf1a6`
- generation observed = 1

## PASS criteria

PASS is satisfied because the target evidence proves:
- exactly one trusted Send action occurred;
- exactly one previously unseen user message ID appeared;
- Project identity remained stable;
- conversation identity remained stable;
- no retry/resend occurred;
- normal response generation began after the new user turn.

The assistant response did not need to finish for Q09 PASS.

## Safety property retained

The Q09 probe contains exactly one material Send click and no Enter-key submit path. After that click, it only observes. Any future ambiguity after a Send must remain non-replayable without separate positive reconciliation; never auto-resend.

## Official UI.Vision basis

- https://ui.vision/rpa/docs/uiv
- https://ui.vision/ai/ai-system-prompt

`uiv.browser.click` is the trusted Chrome/Edge browser input tier used for the qualified one-Send action.
