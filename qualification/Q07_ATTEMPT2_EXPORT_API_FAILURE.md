# Q07 Attempt 2 — UI.Vision V10 Export API Failure

Status: PRESERVED TARGET EVIDENCE — PROBE DEFECT
Date: 2026-08-29
Candidate: UI.Vision 10.0.178 / Chrome 152.0.7977.65
Probe at failure: `qualification/Q07_OBSERVE_CSP_SAFE.js`

## Target error

The CSP-safe probe successfully progressed through page/tab observation and CSV creation, then failed at the export call with:

```text
Q07_OBSERVE.js failed: uiv.exportToDownloads has moved to uiv.files.exportToDownloads("Q07_observation_2026-08-29T19-09-43-712Z.csv") — it takes a NAME, like list/exists/remove, so it lives with them (line 96) (Runtime 0.73s)
```

## Diagnosis

The observation route itself was no longer blocked by ChatGPT CSP. The failure was isolated to an outdated UI.Vision V10 export API spelling. Current UI.Vision V10 guidance states that export-by-name is `uiv.files.exportToDownloads(name)` and that `uiv.exportToDownloads` has been removed.

Official source:
- https://ui.vision/ai/ai-system-prompt

## Correction

Replace only:

```javascript
uiv.exportToDownloads(file);
```

with:

```javascript
uiv.files.exportToDownloads(file);
```

No architecture or Q07 acceptance criteria change is required. Q07 remains TODO until the corrected probe produces the three required real target observations.
