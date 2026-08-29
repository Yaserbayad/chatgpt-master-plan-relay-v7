# Q08 — V10 Trusted Composer/Input Qualification Runbook

Status: TARGET EVIDENCE PARTIAL — INPUT PATH ISOLATION REQUIRED
Date: 2026-08-29
Candidate: UI.Vision 10.0.178 / Chrome 152.0.7977.65
Target Project: https://chatgpt.com/g/g-p-6a9323b61110819182dba0224678aa8b/project
Canonical qualification probe: `qualification/Q08_INPUT_PROBE.js`
Current diagnostic: `qualification/Q08_INPUT_PATH_DIAGNOSTIC.js`

Evidence history:
- `qualification/Q08_ATTEMPT1_SNAPSHOT_FALSE_NEGATIVE.md`
- `qualification/Q08_ATTEMPT2_SEND_DISCOVERY_FAILURE.md`
- `qualification/Q08_ATTEMPT3_DISCOVERY_RUNTIME_FAILURE.md`
- `qualification/Q08_ATTEMPT4_SEND_DISCOVERY_EVIDENCE.md`
- `qualification/Q08_ATTEMPT5_SENTINEL_FAILURE.md`

## Objective

Target-prove the Q08 WBS requirements without Submit:
- exactly one eligible composer;
- trusted `uiv.browser.click`;
- clipboard-backed multiline/Unicode prompt paste via trusted browser input;
- exactly one enabled Send control after staging;
- correct draft produced while Chrome is in the background.

## Current evidence

Attempt 4 proved the empty composer exposes one `composer-submit-button-color` surface labeled `Start Voice`; there was no Send control while the editor remained empty.

Attempt 5 used the corrected sentinel-protected V3 oracle. Its CSV is `Q08_input_probe_v3_2026-08-29T21-53-04-700Z.csv`, SHA-256 `018fbc5d8e5e86e48f5fc62da1de7a18f233f1089d62e51bfc7021a6409dcdd4`.

Attempt 5 reports:
- correct Project/conversation;
- exactly one composer;
- baseline submit surface `Start Voice`;
- empty post-input finder snapshot;
- a unique copy sentinel seeded before Ctrl+C;
- `copied_back` remained exactly equal to that sentinel;
- no post-paste Send state.

Therefore the previous claim that trusted paste/copy was already target-proven is invalid. V3 correctly rejects the run. Q08 remains TODO.

## Why the next diagnostic is different

Official UI.Vision guidance states:
- `uiv.browser.type(...)` sends keystrokes to the currently focused element and can silently no-op if focus is absent;
- rich `contenteditable` chat editors should be driven with trusted `uiv.browser.click` followed by `uiv.browser.type(text)`;
- key combinations use `${KEY_CTRL+KEY_A}`-style syntax.

The next diagnostic therefore separates four boundaries instead of repeating the same paste attempt:

1. **direct trusted type** — click the exact target-proven composer locator and send a short Unicode marker with `uiv.browser.type(text)`;
2. **Ctrl+A + Backspace** — if direct type activated the submit surface, verify key-combo clearing returns the surface to `Start Voice`;
3. **Ctrl+V paste** — only if clearing works, place a multiline/Unicode payload on the OS clipboard and test Ctrl+V;
4. **Ctrl+C copy-back** — only if paste activates the submit surface, seed a new sentinel and require Ctrl+C to overwrite it with the exact payload.

The diagnostic exports a CSV and reports the first failing stage as one of:
- `direct_trusted_type`;
- `ctrl_a_backspace`;
- `ctrl_v_paste`;
- `ctrl_c_copy`;
- `copy_content_mismatch`.

It never clicks Submit.

## Exact next target action

1. Ensure ChatGPT is idle/completed in the same Relay v7 Project conversation.
2. Ensure the composer is completely empty and its button state is `Start Voice`.
3. Create/run a fresh UI.Vision JavaScript macro from `qualification/Q08_INPUT_PATH_DIAGNOSTIC.js`.
4. Immediately switch to a non-Chrome application during the 3.5-second delay and keep Chrome in the background for the trusted-input stages.
5. After completion, do not click Send.
6. Upload the exported `Q08_input_path_*.csv` and the exact macro error if it failed.

If direct trusted typing fails, the next investigation is focus/targeting of `uiv.browser.click/type`. If direct type works but Ctrl+V fails, then the clipboard-paste requirement itself is isolated and must be reconciled before Q08 can PASS; do not silently substitute direct typing for the frozen clipboard requirement.

## Diagnostic verification

`Q08_INPUT_PATH_DIAGNOSTIC.js`:
- JavaScript syntax check: PASS (`node --check`);
- static no-Submit guard: PASS;
- mock case where direct type/clear work but Ctrl+V fails: correctly reports `ctrl_v_paste`;
- mock full success path: PASS;
- local SHA-256: `0e671bb63772eaaefcc81b4cb97d0a433af3fe3c805baec42c8a26be02beb3f7`;
- GitHub blob SHA: `9364f08150e9c9559107dfb7f980823505cc1efd`.

## Official UI.Vision basis

- https://ui.vision/ai/ai-system-prompt
- https://ui.vision/rpa/docs/uiv

The current UI.Vision documentation identifies `uiv.browser.*` as trusted Chrome/Edge debugger input that can operate while the browser is in the background, and identifies `uiv.clipboard.read()` / `uiv.clipboard.write(text)` as access to the real OS clipboard.
