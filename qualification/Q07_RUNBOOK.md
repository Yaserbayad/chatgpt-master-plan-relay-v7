# Q07 — V10 Browser Observation Qualification Runbook

Status: TARGET EVIDENCE PARTIAL — ONE TURN-SCAN CHECK REMAINS
Date: 2026-08-29
Candidate: UI.Vision 10.0.178 / Chrome 152.0.7977.65
Target Project: https://chatgpt.com/g/g-p-6a9323b61110819182dba0224678aa8b/project
Observation probe: `qualification/Q07_OBSERVE_CSP_SAFE.js`
Turn-scan diagnostic: `qualification/Q07_TURN_SCAN_DIAGNOSTIC.js`
Partial target evidence: `qualification/Q07_TARGET_EVIDENCE_PARTIAL.md`
Failed superseded probe: `qualification/Q07_OBSERVE.js`
Failure evidence:
- `qualification/Q07_ATTEMPT1_CSP_FAILURE.md`
- `qualification/Q07_ATTEMPT2_EXPORT_API_FAILURE.md`

## Completed target evidence

The required idle → generating → completed three-snapshot observation was executed on the real target and analyzed.

Target-proven from those CSVs:
- correct configured Project token in the live URL;
- stable conversation ID `6a932926-c750-83ed-9e99-d3addc14f456`;
- stable per-message IDs/author metadata for currently returned turns;
- new user turn `be8d5f4e-d9b8-4cff-b7a8-c69474814783` correlates to completed assistant turn `d185f1ae-c05f-4b8a-8875-19f25091e2a9`;
- generating state exposes `data-testid="stop-button"` / `aria-label="Stop answering"`;
- that live Stop control is absent from the idle/completed snapshots;
- exactly one composer candidate was observed in all three snapshots.

## Remaining Q07 issue

A raw current `[data-message-author-role]` finder count is not sufficient as a conversation-total oracle.

The first target snapshot returned user message ID:
`48830c2a-759d-461e-9d83-30773d17926e`

After the new Q07 prompt, that earlier user turn was no longer returned by the current finder result even though the same-conversation evidence proves it existed. The current DOM count therefore reported two user turns although at least three user turns existed in that conversation.

Q07 must not PASS until a deterministic UI.Vision-only enumeration method accounts for this render-window change.

## One remaining target execution

Run `Q07_TURN_SCAN_DIAGNOSTIC.js` exactly once while ChatGPT is fully completed/idle in the same test conversation.

The diagnostic:
1. captures the current message set;
2. also asks the DOM finder for hidden matches;
3. clicks the last rendered message only to move keyboard focus away from the composer;
4. sends trusted browser `Home`;
5. captures the top render window;
6. sends trusted browser `End` to restore the recent/bottom view;
7. accumulates unique `data-message-id` values across the overlapping snapshots;
8. exports `Q07_turn_scan_*.csv`.

It refuses to start if a live `stop-button` is present. It does not enter prompt text, Submit, navigate, refresh, or invoke page-world JavaScript.

## PASS criteria for the remaining boundary

The returned turn-scan CSV must:
- report the same configured Project token and a valid conversation ID;
- successfully produce distinct/overlapping message snapshots across the scan if the page changes render windows;
- accumulate all relevant known user turns from the qualification conversation, including:
  - `48830c2a-759d-461e-9d83-30773d17926e`
  - `2a96f980-4ff7-4d31-b522-4d129f1b980d`
  - `be8d5f4e-d9b8-4cff-b7a8-c69474814783`
- therefore establish a deterministic unique-user-turn count despite the raw current DOM undercount;
- make no project, conversation, or GitHub state mutation.

If the scan does not reacquire the missing older turn, Q07 remains TODO and the next resolution must use a materially different UI.Vision-only observation method; do not infer PASS.

## Diagnostic verification before target run

`Q07_TURN_SCAN_DIAGNOSTIC.js`:
- JavaScript syntax check: PASS (`node --check`);
- mocked render-window scan: PASS;
- mocked unique count reconstructs 3 user / 2 assistant IDs from overlapping windows;
- current Git blob SHA: `d281fd8645cbfae081667b61c4dbb09c467cb1e8`;
- packaged-file SHA-256: `0201ceb4f9f88886d2d2af948651c7c146b1c19c25941464f5e4d56255404162`.

## Official API basis

- https://ui.vision/ai/ai-system-prompt
- https://ui.vision/rpa/docs/uiv
- https://ui.vision/rpa/docs/xtype
