# Q08 — V10 Trusted Composer/Input Qualification Runbook

Status: READY FOR TARGET RETRY — SNAPSHOT-SAFE PROBE
Date: 2026-08-29
Candidate: UI.Vision 10.0.178 / Chrome 152.0.7977.65
Target Project: https://chatgpt.com/g/g-p-6a9323b61110819182dba0224678aa8b/project
Probe: `qualification/Q08_INPUT_PROBE.js`
Attempt-1 evidence: `qualification/Q08_ATTEMPT1_SNAPSHOT_FALSE_NEGATIVE.md`

## Objective

Target-prove the exact Q08 WBS requirements without Submit:

- exactly one eligible composer;
- trusted `uiv.browser.click`;
- clipboard-backed multiline/Unicode paste through trusted browser input;
- exactly one enabled Send control after staging;
- correct draft produced while Chrome is in the background.

## Attempt-1 correction

The first target run stopped on `Q08 draft observation missing token: Q08_INPUT_PROBE` before the stronger copy-back verification ran.

UI.Vision V10 DOM finder results are snapshots rather than live DOM handles. Therefore finder `.text` / `.value` after trusted input is diagnostic only and is not an acceptance oracle for staged editor content.

The corrected probe keeps post-paste snapshot text only as evidence, then verifies the actual staged draft with trusted Ctrl+A / Ctrl+C and exact OS-clipboard copy-back. A focused regression test reproducing an empty/stale finder snapshot failed against the old probe and passes after this correction. The normal mocked Q08 target test also remains PASS.

## Safety

The probe contains no Send/Submit action.

It:
- refuses to run while ChatGPT is generating;
- refuses to run if the composer is not empty;
- never clears an existing draft;
- writes the qualification payload to the real OS clipboard, then restores the operator's original clipboard before completion;
- leaves the verified draft in the composer unsent.

## Target execution

1. Open the same Relay v7 test Project conversation and ensure ChatGPT is fully idle/completed.
2. Ensure the composer is empty. If the failed prior attempt left a visible Q08 draft, clear it manually before retrying.
3. Run the current `Q08_INPUT_PROBE.js`.
4. Immediately after pressing Run, switch to a non-Chrome application and keep Chrome in the background while the 3.5-second qualification delay expires and the probe performs its trusted click/paste.
5. Return to Chrome after the macro finishes.
6. Confirm visually that the Q08 qualification draft is present and was NOT submitted.
7. Retain/upload the exported `Q08_input_probe_*.csv`.

For operational clarity, use a UI.Vision JavaScript macro named `Q08_INPUT_PROBE`; do not reuse the old Q07 diagnostic macro name.

## Qualification payload

```text
Q08_INPUT_PROBE
ASCII: trusted browser clipboard paste
Unicode: café naïve Ελληνικά 日本語 🙂

BLANK-LINE-BEFORE-THIS
```

## Automatic checks

The corrected probe must independently prove:

- correct Project URL and a valid conversation ID;
- no live `stop-button`;
- exactly one composer before and after paste;
- empty composer before qualification;
- real OS clipboard write/read round-trip equals the payload;
- trusted browser click targets the composer;
- trusted Ctrl+V stages the multiline/Unicode payload;
- trusted Ctrl+A / Ctrl+C copy-back reproduces the exact payload after CRLF→LF normalization;
- exactly one enabled Send control exists after staging;
- original OS clipboard is restored;
- no Submit is executed.

The reacquired finder's `.text` / `.value` is retained in `observed_draft` for diagnosis only and does not determine PASS.

## PASS criteria

PASS only if:

1. the exported CSV reports `result=PASS`;
2. Project/conversation identity is correct;
3. `composer_count=1`;
4. `payload` and `copied_back` are exact after line-ending normalization;
5. the Send evidence identifies exactly one enabled Send control;
6. the operator confirms Chrome was switched to the background before trusted input occurred;
7. the draft remained unsent.

Any macro error, wrong/multiple composer, copy-back mismatch, missing/ambiguous Send, or accidental Submit is FAIL/TODO evidence, not PASS.

## Verification before target retry

- JavaScript syntax check: PASS (`node --check`)
- focused stale-snapshot regression: RED against old probe, GREEN after correction
- normal isolated mocked target behavior: PASS
- current probe Git blob SHA: `55fc235fe20e11f6efe0470be5de9f31d77f325f`
- current probe SHA-256: `44df3a2abb9bb2524b6ea0747ca486272ae17dd296587574f6ee12e3becdf63a`

## Official API basis

- https://ui.vision/rpa/docs/uiv
- https://ui.vision/ai/ai-system-prompt
- https://ui.vision/rpa/home/whatsnew?b=chrome
- https://forum.ui.vision/t/ui-vision-10-beta-ai-javascript-uiv-macros-and-new-real-user-browser-clicks-that-need-no-focus/29839/33

UI.Vision V10 documents `uiv.browser.*` as trusted browser-debugger input for Chrome/Edge that can operate with the browser in the background, `uiv.clipboard.read()` / `uiv.clipboard.write(text)` as the real OS clipboard API, and DOM finder results as snapshots rather than live DOM handles.