# Q07 — V10 Browser Observation Qualification Runbook

Status: PASS
Date: 2026-08-29
Candidate: UI.Vision 10.0.178 / Chrome 152.0.7977.65
Target Project: https://chatgpt.com/g/g-p-6a9323b61110819182dba0224678aa8b/project
Observation probe: `qualification/Q07_OBSERVE_CSP_SAFE.js`
Turn-scan diagnostic: `qualification/Q07_TURN_SCAN_DIAGNOSTIC.js`
Final evidence: `qualification/Q07_EVIDENCE.md`
Partial evidence retained: `qualification/Q07_TARGET_EVIDENCE_PARTIAL.md`
Failed superseded probe: `qualification/Q07_OBSERVE.js`
Failure evidence:
- `qualification/Q07_ATTEMPT1_CSP_FAILURE.md`
- `qualification/Q07_ATTEMPT2_EXPORT_API_FAILURE.md`

## Qualified target result

The target qualification established all required Q07 boundaries:

- configured Project token is deterministic from the live URL;
- conversation ID is deterministic and stable;
- rendered user/assistant turns expose stable `data-message-id` + author metadata;
- the current user turn can be correlated with its following assistant turn;
- active generation is deterministically identified by the live `data-testid="stop-button"` / `aria-label="Stop answering"` control;
- completed/idle state lacks that live Stop control;
- exactly one composer candidate was observed in the three principal snapshots;
- raw visible DOM message count is not a valid conversation-total oracle because ChatGPT can omit an older rendered turn from the visible finder result;
- UI.Vision-only enumeration can account for this by using include-hidden/reacquired render windows and deduplicating stable message IDs.

## Turn-enumeration resolution

The final target turn scan:

`Q07_turn_scan_2026-08-29T21-03-51-028Z.csv`

SHA-256:
`b216881a4eea57f2f75f45bad10945f7e2cdad0e108335749b80627cbe8a8abb`

reported:

- before visible = 4
- before include-hidden = 5
- after Home visible = 5
- after Home include-hidden = 5
- after End visible = 5
- after End include-hidden = 5
- unique users = 3
- unique assistants = 2

and reacquired all three qualification user IDs:

- `48830c2a-759d-461e-9d83-30773d17926e`
- `2a96f980-4ff7-4d31-b522-4d129f1b980d`
- `be8d5f4e-d9b8-4cff-b7a8-c69474814783`

## Production constraint carried forward

Do not use raw current visible `[data-message-author-role]` count alone as the conversation-total oracle. Production observation/counting must use the qualified stable-message-ID enumeration/reacquisition semantics.

## Final acceptance

Q07 = PASS.

Full acceptance proof is recorded in `qualification/Q07_EVIDENCE.md`.
