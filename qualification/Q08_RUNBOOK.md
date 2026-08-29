# Q08 — V10 Trusted Composer/Input Qualification Runbook

Status: TARGET EVIDENCE PARTIAL — SEND CONTROL DISCOVERY REMAINS
Date: 2026-08-29
Candidate: UI.Vision 10.0.178 / Chrome 152.0.7977.65
Target Project: https://chatgpt.com/g/g-p-6a9323b61110819182dba0224678aa8b/project
Input probe: `qualification/Q08_INPUT_PROBE.js`
Send diagnostic: `qualification/Q08_SEND_DISCOVERY.js`
Attempt-1 evidence: `qualification/Q08_ATTEMPT1_SNAPSHOT_FALSE_NEGATIVE.md`
Attempt-2 evidence: `qualification/Q08_ATTEMPT2_SEND_DISCOVERY_FAILURE.md`
Attempt-3 evidence: `qualification/Q08_ATTEMPT3_DISCOVERY_RUNTIME_FAILURE.md`

## Objective

Target-prove the exact Q08 WBS requirements without Submit:
- exactly one eligible composer;
- trusted `uiv.browser.click`;
- clipboard-backed multiline/Unicode prompt paste through trusted browser input;
- exactly one enabled Send control after staging;
- correct draft produced while Chrome is in the background.

## Target-proven after Attempt 2

Attempt 2 reached the Send-discovery block only after the corrected probe had already passed:
- correct Project/conversation checks;
- idle-state check;
- exactly one empty composer before staging;
- OS clipboard write/read round-trip;
- trusted `uiv.browser.click`;
- trusted Ctrl+V staging;
- exactly one composer after staging;
- trusted Ctrl+A / Ctrl+C copy-back;
- exact multiline/Unicode payload equality after line-ending normalization.

Therefore the trusted composer/input path is target-proven. Q08 remains TODO only because the generic metadata rule found zero Send candidates.

## Attempt-3 diagnostic runtime correction

The first read-only Send discovery run failed before CSV export because the UI.Vision target JavaScript runtime does not implement `Math.hypot`.

The diagnostic used that function only to rank controls by geometric distance from the composer. It is now replaced by the equivalent conservative arithmetic:

`Math.sqrt(dx * dx + dy * dy)`

This changes no Q08 acceptance criterion, selector assumption, architecture, or target behavior. The diagnostic remains read-only.

## Remaining target action

If the Q08 draft from Attempt 2 is still present, do not clear it and do not repeat the paste test.

Run the current corrected `Q08_SEND_DISCOVERY.js` exactly once while ChatGPT is idle/completed with that draft still staged.

The diagnostic is read-only. It performs no click, typing, clipboard mutation, Submit, navigation, or refresh. It exports `Q08_send_discovery_*.csv` containing:
- every current `button` / `role=button` snapshot;
- full captured attribute maps;
- geometry relative to the composer;
- results for `button[type=submit]`, send-related `data-testid` / `aria-label`, and form-button probes.

Upload that one CSV for analysis. The production Send locator must be frozen from target evidence rather than guessed.

## If the draft is no longer present

Rerun the current `Q08_INPUT_PROBE.js` with an empty composer and the background-switch procedure. If it reaches the same Send-discovery error, leave the staged draft in place and then run the corrected `Q08_SEND_DISCOVERY.js`.

## PASS criteria

Q08 can PASS only after target evidence establishes all of:
1. correct Project/conversation identity;
2. exactly one composer;
3. exact multiline/Unicode trusted paste and copy-back;
4. Chrome background operation during trusted input;
5. exactly one deterministic enabled Send control after staging;
6. draft remains unsent.

No Submit is part of Q08.

## Diagnostic verification

Current `Q08_SEND_DISCOVERY.js`:
- JavaScript syntax check: PASS (`node --check`);
- unsupported `Math.hypot` absent: PASS;
- conservative `Math.sqrt(dx * dx + dy * dy)` replacement present: PASS;
- current Git blob SHA: `9168917d52ece445168fcf6effa1251f9bc53835`;
- packaged SHA-256: `d0926fb30a80dccb4512853c490709caba34c33ad3256a674fac4ea33defc514`;
- observation-only by source inspection: no `uiv.browser.click/type`, clipboard mutation, Submit, navigation, or refresh.

## Official UI.Vision basis

- https://ui.vision/rpa/docs/uiv
- https://forum.ui.vision/t/ui-vision-10-beta-ai-javascript-uiv-macros-and-new-real-user-browser-clicks-that-need-no-focus/29839/33

UI.Vision V10 finder matches expose captured attributes through `.attributes` / `getAttribute()` and carry geometry such as coordinates/rect data. These snapshots are suitable for target selector discovery without page-world JavaScript.
