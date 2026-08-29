# Q08 — Attempt 1 Snapshot False-Negative Evidence

Status: SUPERSEDED PROBE FAILURE — Q08 remains TODO
Date: 2026-08-29
Candidate: UI.Vision 10.0.178 / Chrome 152.0.7977.65
Probe: `qualification/Q08_INPUT_PROBE.js`

## Target error

The target run stopped with:

`Q08 draft observation missing token: Q08_INPUT_PROBE`

The UI.Vision player label shown by the operator was `Q07_TURN_SCAN_DIAGNOSTIC.js`, but the executed code/error is Q08 probe logic. This naming mismatch is operational only; Q08 acceptance is determined by the executed probe behavior and target evidence.

## Diagnosis

The failed check used the post-paste finder result's `.text` / `.value` as an acceptance oracle before the stronger copy-back verification ran.

UI.Vision V10 finder results are element snapshots rather than live DOM handles. Therefore snapshot `.text` / `.value` is not a sound proof that trusted paste failed. The target error does not establish whether the real editor content was absent because the probe aborted before trusted Ctrl+A / Ctrl+C copy-back could verify the actual staged draft.

Official basis:
- https://ui.vision/rpa/docs/uiv
- https://forum.ui.vision/t/ui-vision-10-beta-ai-javascript-uiv-macros-and-new-real-user-browser-clicks-that-need-no-focus/29839/33

## Corrective action

The post-paste finder text is retained only as diagnostic evidence. Q08 acceptance now relies on the stronger sequence:

1. trusted browser click on the unique composer;
2. trusted Ctrl+V from the verified OS clipboard payload;
3. reacquire unique composer;
4. trusted Ctrl+A / Ctrl+C;
5. compare copied-back text exactly with the multiline/Unicode payload after line-ending normalization;
6. require exactly one enabled Send control;
7. do not Submit.

## Regression verification

A focused regression test reproducing an empty/stale finder snapshot while the underlying editor contains the trusted pasted payload:
- fails against the old probe with the same `draft observation missing token` error;
- passes after the correction.

The existing normal mocked Q08 target test also passes after the correction, and JavaScript syntax validation passes.

Corrected probe SHA-256:
`44df3a2abb9bb2524b6ea0747ca486272ae17dd296587574f6ee12e3becdf63a`

## Outcome

Q08 remains `TODO`. The attempt is not a target PASS or a target proof that trusted background paste failed. One corrected target run is required.