# Q08 — V10 Trusted Composer/Input Qualification Runbook

Status: READY FOR TARGET RUN
Date: 2026-08-29
Candidate: UI.Vision 10.0.178 / Chrome 152.0.7977.65
Target Project: https://chatgpt.com/g/g-p-6a9323b61110819182dba0224678aa8b/project
Probe: `qualification/Q08_INPUT_PROBE.js`

## Objective

Target-prove the exact Q08 WBS requirements without Submit:

- exactly one eligible composer;
- trusted `uiv.browser.click`;
- clipboard-backed multiline/Unicode paste through trusted browser input;
- exactly one enabled Send control after staging;
- correct draft produced while Chrome is in the background.

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
2. Ensure the composer is empty.
3. Run `Q08_INPUT_PROBE.js`.
4. Immediately after pressing Run, switch to a non-Chrome application and keep Chrome in the background while the 3.5-second qualification delay expires and the probe performs its trusted click/paste.
5. Return to Chrome after the macro finishes.
6. Confirm visually that the Q08 qualification draft is present and was NOT submitted.
7. Retain/upload the exported `Q08_input_probe_*.csv`.

## Qualification payload

```text
Q08_INPUT_PROBE
ASCII: trusted browser clipboard paste
Unicode: café naïve Ελληνικά 日本語 🙂

BLANK-LINE-BEFORE-THIS
```

## Automatic checks

The probe must independently prove:

- correct Project URL and a valid conversation ID;
- no live `stop-button`;
- exactly one composer before and after paste;
- empty composer before qualification;
- real OS clipboard write/read round-trip equals the payload;
- trusted browser click focuses the composer;
- trusted Ctrl+V stages the multiline/Unicode payload;
- the reacquired composer exposes all required Unicode/payload tokens;
- trusted select-all/copy-back reproduces the exact payload after CRLF→LF normalization;
- exactly one enabled Send control exists after staging;
- original OS clipboard is restored;
- no Submit is executed.

## PASS criteria

PASS only if:

1. the exported CSV reports `result=PASS`;
2. Project/conversation identity is correct;
3. `composer_count=1`;
4. `payload` and `copied_back` are exact after line-ending normalization;
5. the Send evidence identifies exactly one enabled Send control;
6. the operator confirms Chrome was switched to the background before trusted input occurred;
7. the draft remained unsent.

Any macro error, wrong/multiple composer, paste mismatch, missing/ambiguous Send, or accidental Submit is FAIL/TODO evidence, not PASS.

## Verification before target run

- JavaScript syntax check: PASS (`node --check`)
- isolated mocked target behavior: PASS
- mocked checks cover trusted paste, blank line, Unicode, Send evidence, CSV export, and clipboard restoration
- probe SHA-256: `9ba1cbbb140f6fc3b15ec78f78098c02af3c6902cab4752c8c6eb4b1ca5f6c69`

## Official API basis

- https://ui.vision/rpa/docs/uiv
- https://ui.vision/ai/ai-system-prompt
- https://ui.vision/rpa/home/whatsnew?b=chrome

The UI.Vision V10 documentation identifies `uiv.browser.*` as trusted browser-debugger input for Chrome/Edge that can operate with the browser in the background. The current UI.Vision AI macro documentation identifies `uiv.clipboard.read()` / `uiv.clipboard.write(text)` as the real OS clipboard API.
