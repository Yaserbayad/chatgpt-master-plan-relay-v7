# Q07 Attempt 1 — CSP Failure Evidence

Status: TARGET FAILURE — PROBE DEFECT, Q07 REMAINS TODO
Date: 2026-08-29
Target: ChatGPT Project on Chrome 152.0.7977.65 / UI.Vision 10.0.178
Failed probe: qualification/Q07_OBSERVE.js

## Observed target failure

The first Q07 observation probe failed immediately at its `uiv.eval(...)` call. The target error reported that evaluating a string as JavaScript violates ChatGPT's Content Security Policy because `unsafe-eval` is not allowed.

No click, typing, navigation, refresh, Submit, or project-state mutation occurred.

## Root cause

`uiv.eval(code)` uses the same page-world execution mechanism as UI.Vision `executeScript`. UI.Vision's current official guidance states that website CSP can block this mechanism, specifically on pages that ban `unsafe-eval`, and directs scripts to read the page through DOM finders instead of retrying/rephrasing the eval.

UI.Vision 10.0.125+ finder snapshots expose element attributes through `getAttribute()` / `attributes`, and `uiv.tabs.list()` exposes current tab URL metadata. The installed candidate 10.0.178 is new enough for those capabilities.

## Corrective action

Replace the failed probe with a CSP-safe observation probe that uses only:
- `uiv.findElements` / DOM finder snapshots;
- finder `getAttribute()` / `attributes`;
- `uiv.tabs.list()` current-tab metadata;
- `uiv.csv.write` + export.

The replacement must contain no page-world JavaScript execution.

Sources:
- https://ui.vision/ai/ai-system-prompt
- https://ui.vision/rpa/docs/uiv
- https://forum.ui.vision/t/ui-vision-10-beta-ai-javascript-uiv-macros-and-new-real-user-browser-clicks-that-need-no-focus/29839/33

Acceptance consequence: Q07 is not failed architecturally and is not PASS. It remains TODO pending a materially different CSP-safe target run.