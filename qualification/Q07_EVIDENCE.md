# Q07 — V10 Browser Observation Qualification Evidence

Status: PASS
Date: 2026-08-29
Candidate: UI.Vision 10.0.178 / Chrome 152.0.7977.65
Target Project token: `g-p-6a9323b61110819182dba0224678aa8b`
Observation probe: `qualification/Q07_OBSERVE_CSP_SAFE.js`
Turn-scan diagnostic: `qualification/Q07_TURN_SCAN_DIAGNOSTIC.js`
Prior partial evidence: `qualification/Q07_TARGET_EVIDENCE_PARTIAL.md`

## Target evidence set

### Idle / generating / completed observations

1. `Q07_observation_2026-08-29T20-41-33-353Z.csv`
   - SHA-256: `7dc3e14a3c8aadb55796f627a7c061803d0bfc4de618a34f7a73108e235d2f6c`
2. `Q07_observation_2026-08-29T20-42-58-585Z.csv`
   - SHA-256: `b92b464d8a4944a0496c4463577ac5f79f7b4f2655d22664bacbdc37ccfb30bf`
3. `Q07_observation_2026-08-29T20-43-11-142Z.csv`
   - SHA-256: `0706e08c62f38cd5fa347e1590843acad394c3d291bab23497900da84c0bf306`

### Turn-enumeration diagnostic

4. `Q07_turn_scan_2026-08-29T21-03-51-028Z.csv`
   - SHA-256: `b216881a4eea57f2f75f45bad10945f7e2cdad0e108335749b80627cbe8a8abb`

## Acceptance evidence

### 1. Configured Project root — PASS

All target observations and the turn scan report a URL containing the configured Project token:

`g-p-6a9323b61110819182dba0224678aa8b`

The turn scan reports:

`https://chatgpt.com/g/g-p-6a9323b61110819182dba0224678aa8b/c/6a932926-c750-83ed-9e99-d3addc14f456`

### 2. Conversation identity — PASS

The conversation ID is deterministically parsed and remains stable across the qualification sequence:

`6a932926-c750-83ed-9e99-d3addc14f456`

### 3. User-turn enumeration — PASS

The initial raw visible DOM snapshot undercounted the conversation because an older user node was outside the current visible finder result. The dedicated UI.Vision-only turn scan resolved this boundary.

Turn-scan meta evidence:
- before visible count = 4
- before include-hidden count = 5
- after Home visible count = 5
- after Home include-hidden count = 5
- after End visible count = 5
- after End include-hidden count = 5
- unique user count = 3
- unique assistant count = 2

The scan reacquired and accumulated all three known user message IDs:

- `48830c2a-759d-461e-9d83-30773d17926e`
- `2a96f980-4ff7-4d31-b522-4d129f1b980d`
- `be8d5f4e-d9b8-4cff-b7a8-c69474814783`

Therefore raw visible-DOM count is rejected as the conversation-total oracle, while the qualified UI.Vision-only enumeration approach can account for the render-window change by including hidden matches and/or reacquiring render windows and deduplicating stable message IDs.

### 4. Assistant-turn correlation — PASS

The generating snapshot contains user message ID:

`be8d5f4e-d9b8-4cff-b7a8-c69474814783`

with the Q07 count prompt. The completed snapshot contains assistant message ID:

`d185f1ae-c05f-4b8a-8875-19f25091e2a9`

following that user turn. Stable author/message-ID ordering therefore provides a deterministic current-turn correlation boundary for this target cycle.

### 5. Generating/completed distinction — PASS

Only the actively generating observation exposes the live control:

- `data-testid="stop-button"`
- `aria-label="Stop answering"`
- `aria-disabled="false"`

The live Stop control is absent from the idle/completed observations. Broad text matching such as historical `Stopped thinking` is not a valid generation oracle; the qualified signal is the specific live Stop control.

## Additional target observations

- Exactly one composer candidate was observed in each of the three main target snapshots.
- The turn-scan diagnostic ran only in a completed/idle state and made no prompt, Submit, refresh, project navigation, or GitHub mutation.
- Attempt-1 CSP failure and attempt-2 export-API failure remain preserved as superseded probe evidence; neither invalidates the corrected target result.

## Qualification conclusion

PASS — Q07 has target evidence for all required acceptance boundaries:

- Project root;
- conversation ID;
- user-turn enumeration despite render-window/visibility changes;
- assistant-turn correlation;
- generating/completed distinction.

Production implementation must not use raw visible `[data-message-author-role]` count alone as the conversation-total oracle. It must use the qualified stable-message-ID enumeration/reacquisition semantics established by this evidence.
