# Q08 — Attempt 5 Sentinel-Protected Input Failure

Status: PRESERVED TARGET FAILURE — Q08 remains TODO
Date: 2026-08-29
Probe: `qualification/Q08_INPUT_PROBE.js` V3 sentinel-protected oracle
Target: UI.Vision 10.0.178 / Chrome 152.0.7977.65

## Target evidence

Uploaded CSV: `Q08_input_probe_v3_2026-08-29T21-53-04-700Z.csv`

SHA-256: `018fbc5d8e5e86e48f5fc62da1de7a18f233f1089d62e51bfc7021a6409dcdd4`

The CSV reports:
- `result=FAIL`;
- failure reason: `Q08 copy-back did not replace sentinel; trusted paste/copy is not proven`;
- correct configured Project URL;
- stable conversation ID `6a932926-c750-83ed-9e99-d3addc14f456`;
- exactly one composer;
- baseline composer submit surface `aria-label="Start Voice"`;
- `observed_draft` empty;
- copy sentinel `Q08_COPYBACK_SENTINEL_2026-08-29T21:52:58.327Z`;
- `copied_back` equals that sentinel exactly;
- no post-paste Send surface was observed.

## Qualification meaning

This is a valid failure of the corrected oracle. Unlike the earlier Q08 attempt, an unchanged clipboard can no longer false-pass because V3 overwrites the clipboard with a unique sentinel before Ctrl+C.

The target run therefore does **not** prove that trusted Ctrl+V inserted the payload or that trusted Ctrl+C copied editor contents. It also does not yet distinguish whether the root cause is:
1. trusted click did not leave the contenteditable composer focused;
2. ordinary `uiv.browser.type(text)` cannot reach the editor in this state;
3. Ctrl+A / Backspace key-combo behavior fails;
4. Ctrl+V specifically fails;
5. Ctrl+C specifically fails.

Official UI.Vision guidance states that `uiv.browser.type(...)` sends keystrokes to the currently focused element and can silently no-op if focus was not actually retained; for rich `contenteditable` editors it recommends trusted `uiv.browser.click` followed by `uiv.browser.type(text)` and explicit result verification.

## Corrective action

Do not repeat V3 unchanged. Run a materially different diagnostic that separates:
- direct trusted typing;
- Ctrl+A + Backspace clearing;
- Ctrl+V clipboard paste;
- Ctrl+C clipboard copy-back.

Q08 remains `TODO`. No Submit occurred and no project/conversation authority was mutated by this failed probe.
