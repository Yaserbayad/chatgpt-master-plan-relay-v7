# Q07 — V10 Browser Observation Qualification Runbook

Status: READY FOR TARGET RUN
Date: 2026-08-29
Candidate: UI.Vision 10.0.178 / Chrome 152.0.7977.65
Target Project: https://chatgpt.com/g/g-p-6a9323b61110819182dba0224678aa8b/project
Probe: qualification/Q07_OBSERVE.js

## Safety
The probe is observation-only. It performs no click, typing, navigation, refresh, or Submit. It reads current DOM metadata and exports a CSV.

## Target executions required

1. Open a conversation inside the configured test Project while ChatGPT is idle/completed.
2. Run `Q07_OBSERVE.js`; retain the exported `Q07_observation_*.csv`.
3. Manually submit one harmless prompt that produces a non-trivial response, for example: `Count slowly from 1 to 50, one number per line.`
4. While that response is visibly generating, run `Q07_OBSERVE.js` again; retain the second CSV.
5. After generation fully completes, run `Q07_OBSERVE.js` once more; retain the third CSV.

## Evidence required for PASS
From the three target CSVs, Q07 must establish deterministic, reacquirable evidence for:
- configured Project identity/root;
- current conversation identity from URL/state;
- rendered user-turn enumeration;
- rendered assistant-turn enumeration and ordering/correlation;
- an observable distinction between generating and completed response state.

No production selector is frozen from a single snapshot. If target DOM does not expose a stable deterministic boundary, Q07 fails and the affected architecture must be reviewed rather than inferred.

## Official API basis
- https://ui.vision/rpa/docs/uiv
- https://ui.vision/rpa/home/whatsnew
