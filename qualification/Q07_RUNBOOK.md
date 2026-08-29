# Q07 — V10 Browser Observation Qualification Runbook

Status: READY FOR TARGET RETRY — CSP-SAFE PROBE V2
Date: 2026-08-29
Candidate: UI.Vision 10.0.178 / Chrome 152.0.7977.65
Target Project: https://chatgpt.com/g/g-p-6a9323b61110819182dba0224678aa8b/project
Current probe: qualification/Q07_OBSERVE_CSP_SAFE.js
Failed superseded probe: qualification/Q07_OBSERVE.js
Failure evidence:
- qualification/Q07_ATTEMPT1_CSP_FAILURE.md
- qualification/Q07_ATTEMPT2_EXPORT_API_FAILURE.md

## Attempt-1 correction

The first probe used page-world string evaluation and was blocked by ChatGPT Content Security Policy (`unsafe-eval`). This is preserved as target evidence and is not an architectural Q07 failure. UI.Vision's current guidance explicitly directs CSP-blocked scripts to read the page through finder snapshots instead of retrying the page-world eval.

The replacement probe uses only finder snapshots plus current-tab metadata. It performs no page-world JavaScript execution.

## Attempt-2 correction

The first CSP-safe revision reached CSV export but used the removed spelling `uiv.exportToDownloads(file)`. UI.Vision 10.0.178 reported that export-by-name has moved to `uiv.files.exportToDownloads(name)`. The probe was corrected only at that API call; the observation design and acceptance criteria are unchanged.

## Safety

The probe is observation-only. It performs no click, typing, navigation, refresh, or Submit. It reads current tab metadata and DOM finder snapshots, then exports a CSV.

## Target executions required

1. Open a conversation inside the configured test Project while ChatGPT is idle/completed.
2. Run `Q07_OBSERVE_CSP_SAFE.js`; retain the exported `Q07_observation_*.csv`.
3. Manually submit one harmless prompt that produces a non-trivial response, for example: `Count slowly from 1 to 50, one number per line.`
4. While that response is visibly generating, run `Q07_OBSERVE_CSP_SAFE.js` again; retain the second CSV.
5. After generation fully completes, run `Q07_OBSERVE_CSP_SAFE.js` once more; retain the third CSV.

## Evidence required for PASS

From the three target CSVs, Q07 must establish deterministic, reacquirable evidence for:
- configured Project identity/root;
- current conversation identity from current-tab URL/state;
- rendered user-turn enumeration;
- rendered assistant-turn enumeration and ordering/correlation;
- an observable distinction between generating and completed response state.

No production selector is frozen from a single snapshot. If the CSP-safe finder route still cannot expose a stable deterministic observation boundary, Q07 fails and the affected architecture must be reviewed rather than inferred.

## Verification of current probe

Static/package verification after the export API correction:
- JavaScript syntax check: PASS (`node --check`);
- no obsolete `uiv.exportToDownloads` call: PASS;
- current export call is exactly `uiv.files.exportToDownloads(file)`: PASS;
- packaged file Git blob SHA matches GitHub current blob SHA: `9cc5a8760d4f2e0c0a61672bb27e20d2132956c9`;
- packaged-file SHA-256: `eadd44986a126a94991e9faf26f8d07ec2c50865de59b1b7c839fd2552753a40`.

## Official API basis

- https://ui.vision/ai/ai-system-prompt
- https://ui.vision/rpa/docs/uiv
- https://forum.ui.vision/t/ui-vision-10-beta-ai-javascript-uiv-macros-and-new-real-user-browser-clicks-that-need-no-focus/29839/33
