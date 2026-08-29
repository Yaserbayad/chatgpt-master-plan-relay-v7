# Q08 — V10 Trusted Composer/Input Qualification Runbook

Status: READY FOR TARGET RETRY — SENTINEL-PROTECTED V3
Date: 2026-08-29
Candidate: UI.Vision 10.0.178 / Chrome 152.0.7977.65
Target Project: https://chatgpt.com/g/g-p-6a9323b61110819182dba0224678aa8b/project
Canonical probe: `qualification/Q08_INPUT_PROBE.js`

Evidence history:
- `qualification/Q08_ATTEMPT1_SNAPSHOT_FALSE_NEGATIVE.md`
- `qualification/Q08_ATTEMPT2_SEND_DISCOVERY_FAILURE.md`
- `qualification/Q08_ATTEMPT3_DISCOVERY_RUNTIME_FAILURE.md`
- `qualification/Q08_ATTEMPT4_SEND_DISCOVERY_EVIDENCE.md`

## Objective

Target-prove the Q08 WBS requirements without Submit:
- exactly one eligible composer;
- trusted `uiv.browser.click`;
- clipboard-backed multiline/Unicode prompt paste through trusted browser input;
- exactly one enabled Send control after staging;
- correct draft produced while Chrome is in the background.

## Evidence correction after live Send discovery

The Attempt-4 live discovery CSV showed no Send control. The composer form exposed four controls, including a `composer-submit-button-color` surface still labeled `Start Voice`.

This revealed a flaw in the previous copy-back oracle. The old probe put the qualification payload on the clipboard before Ctrl+V and later compared the clipboard to that same payload after Ctrl+C. If paste/copy failed, an unchanged clipboard could still equal the expected payload and false-pass.

Therefore the prior claim that Attempt 2 target-proved trusted paste is withdrawn. Q08 remains TODO.

## Current V3 proof design

The current canonical `Q08_INPUT_PROBE.js` fixes the oracle:

1. require the correct Project/conversation, idle state, exactly one empty composer;
2. snapshot the baseline composer submit surface;
3. place the multiline/Unicode payload on the real OS clipboard;
4. give the operator 3.5 seconds to switch Chrome into the background;
5. trusted `uiv.browser.click` the composer and trusted Ctrl+V;
6. reacquire the composer;
7. overwrite the OS clipboard with a unique `Q08_COPYBACK_SENTINEL_<timestamp>` value;
8. trusted Ctrl+A / Ctrl+C;
9. require Ctrl+C to replace the sentinel;
10. require the resulting clipboard to exactly equal the qualification payload after CRLF→LF normalization;
11. require exactly one enabled composer submit surface after the proven paste;
12. require that surface to be explicitly Send/Submit or to transition away from the baseline `Start Voice` state;
13. restore the operator's original clipboard;
14. export `Q08_input_probe_v3_*.csv` whether PASS or FAIL;
15. never click Submit.

The finder snapshot's `.text` / `.value` remains diagnostic only.

## Target execution

1. Open the Relay v7 test Project conversation and ensure ChatGPT is fully idle/completed.
2. Ensure the composer is completely empty. Clear any leftover qualification draft manually before the run.
3. Run the current canonical `Q08_INPUT_PROBE.js`.
4. Immediately switch to a non-Chrome application and keep Chrome in the background during the 3.5-second delay and trusted input.
5. Return after the macro completes.
6. Do not click Send.
7. Leave any successfully staged Q08 draft unsent.
8. Upload the exported `Q08_input_probe_v3_*.csv`.

If the macro fails, it now exports the CSV before raising the final error; upload that CSV as well as the exact error.

## Qualification payload

```text
Q08_INPUT_PROBE
ASCII: trusted browser clipboard paste
Unicode: café naïve Ελληνικά 日本語 🙂

BLANK-LINE-BEFORE-THIS
```

## PASS criteria

PASS only if target evidence establishes all of:
1. correct Project/conversation identity;
2. exactly one composer;
3. Chrome was switched to the background before trusted input;
4. copy-back replaced the unique sentinel;
5. copied-back text exactly equals the multiline/Unicode payload after line-ending normalization;
6. exactly one enabled composer submit surface exists after staging;
7. that surface is explicitly Send/Submit or deterministically transitions from the baseline `Start Voice` state;
8. the draft remains unsent.

No Submit is part of Q08.

## Verification of current V3 probe

- JavaScript syntax check: PASS (`node --check`).
- false-paste regression: PASS — unchanged clipboard is rejected because the sentinel remains.
- success-path mock: PASS — trusted paste/copy overwrites the sentinel and the submit surface transitions to Send.
- clipboard restoration on PASS and FAIL: PASS in mock verification.
- current Git blob SHA: `8e5eff07dc71101629cb4b5ed1d522c1ccf833f5`.
- current SHA-256: `2a8f7e86579b1b056483124fb15f4014e504a7755f472fa144b84045712dc785`.

## Official UI.Vision basis

- https://ui.vision/rpa/docs/uiv
- https://ui.vision/ai/ai-system-prompt
- https://ui.vision/rpa/home/whatsnew?b=chrome

UI.Vision V10 documents `uiv.browser.*` as trusted browser-debugger input for Chrome/Edge that can operate while the browser is in the background, and `uiv.clipboard.read()` / `uiv.clipboard.write(text)` as the real OS clipboard API.
