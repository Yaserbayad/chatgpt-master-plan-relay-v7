# Q07 — Target Browser Observation Evidence (Partial)

Status: TODO — partial target evidence, not PASS
Date: 2026-08-29
Candidate: UI.Vision 10.0.178 / Chrome 152.0.7977.65
Target Project token: `g-p-6a9323b61110819182dba0224678aa8b`
Probe: `qualification/Q07_OBSERVE_CSP_SAFE.js`

## Uploaded target CSVs

1. `Q07_observation_2026-08-29T20-41-33-353Z.csv`
   - SHA-256: `7dc3e14a3c8aadb55796f627a7c061803d0bfc4de618a34f7a73108e235d2f6c`
   - intended state: idle/completed before the Q07 count prompt
2. `Q07_observation_2026-08-29T20-42-58-585Z.csv`
   - SHA-256: `b92b464d8a4944a0496c4463577ac5f79f7b4f2655d22664bacbdc37ccfb30bf`
   - intended state: response actively generating
3. `Q07_observation_2026-08-29T20-43-11-142Z.csv`
   - SHA-256: `0706e08c62f38cd5fa347e1590843acad394c3d291bab23497900da84c0bf306`
   - intended state: response completed

## Target-proven observations

### Project and conversation identity — proven
All three CSVs report the same URL:
`https://chatgpt.com/g/g-p-6a9323b61110819182dba0224678aa8b/c/6a932926-c750-83ed-9e99-d3addc14f456`

Therefore:
- configured Project token is present in the live URL;
- conversation ID is deterministically parsed as `6a932926-c750-83ed-9e99-d3addc14f456`;
- the conversation identity remains stable across idle → generating → completed observation.

### Composer observation — proven for this target state
All three snapshots report exactly one composer candidate.

### Generating/completed distinction — proven
The generating snapshot contains a control with:
- `data-testid="stop-button"`
- `aria-label="Stop answering"`
- `aria-disabled="false"`

That control is absent from both the first idle/completed snapshot and the final completed snapshot.

The earlier broad `generation_signal_count` also sees an unrelated historical control whose text is `Stopped thinking`; therefore production logic must use the specific live Stop control rather than the broad word-regex count.

### Current-turn assistant correlation — proven
The generating snapshot contains user message ID:
`be8d5f4e-d9b8-4cff-b7a8-c69474814783`
with text beginning `Count slowly from 1 to 50, one number per line.`

The completed snapshot then contains assistant message ID:
`d185f1ae-c05f-4b8a-8875-19f25091e2a9`
after that user turn, with the expected numbered response. This proves a stable message-ID/author-order boundary for correlating the new assistant turn to the new user turn in this target cycle.

## Unresolved Q07 acceptance boundary — complete user-turn enumeration

The first snapshot returns these message nodes in order:
1. user `48830c2a-759d-461e-9d83-30773d17926e`
2. assistant `9d2c1252-cab0-41fc-9279-db51ef5f0609`
3. user `2a96f980-4ff7-4d31-b522-4d129f1b980d`

After the new Q07 test prompt is submitted, the second snapshot returns:
1. assistant `9d2c1252-cab0-41fc-9279-db51ef5f0609`
2. user `2a96f980-4ff7-4d31-b522-4d129f1b980d`
3. user `be8d5f4e-d9b8-4cff-b7a8-c69474814783`

The earlier user message `48830c2a-759d-461e-9d83-30773d17926e` is no longer returned by the live DOM finder, even though it existed in the same conversation moments earlier. Consequently the raw current `[data-message-author-role]` match count reports two user turns after the new prompt although the target evidence itself proves at least three user turns exist in that conversation.

This means the current raw-DOM-count method is not sufficient proof for the v7 requirement to use the actual conversation user-turn count for rollover.

## Qualification conclusion

Q07 remains `TODO`, not PASS.

Already target-proven:
- Project root/identity from URL;
- conversation ID;
- current user/assistant message IDs and ordering;
- current-turn assistant correlation;
- deterministic generating/completed signal via the live `stop-button`;
- one composer in the observed states.

Still required before Q07 PASS:
- one deterministic UI.Vision-only method that enumerates/counts all relevant user turns despite the live page dropping an earlier turn from the current finder result.

No later Q07-dependent phase item may rely on raw current DOM message count as the conversation-total oracle until this boundary is resolved and target-proven.
