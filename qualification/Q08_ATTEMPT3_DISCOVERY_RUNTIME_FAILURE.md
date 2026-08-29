# Q08 — Attempt 3 Send Discovery Runtime Failure

Status: PRESERVED TARGET FAILURE — Q08 remains TODO
Date: 2026-08-29
Diagnostic: `qualification/Q08_SEND_DISCOVERY.js`
Target runtime: UI.Vision 10.0.178 / Chrome 152.0.7977.65

## Observed target failure

The read-only Send-control discovery diagnostic failed with:

`Q08_SEND_DISCOVERY.js failed: Math.hypot is not a function (line 77) (Runtime 1.28s)`

## Diagnosis

The diagnostic itself used `Math.hypot(dx, dy)` only to rank controls by geometric distance from the composer. The UI.Vision JavaScript runtime used by the target does not implement `Math.hypot`.

This failure does not invalidate the already target-proven Q08 partial evidence:
- trusted composer targeting progressed successfully in the prior corrected Q08 input run;
- multiline/Unicode trusted clipboard paste and exact copy-back were reached before the Send-discovery failure;
- Q08 remains unresolved only at deterministic enabled-Send discovery.

The diagnostic is read-only and the failure occurred before CSV export. It performed no click, typing, Submit, navigation, refresh, clipboard mutation, project mutation, or GitHub mutation.

## Corrective action

Replace the unsupported distance expression with the equivalent conservative arithmetic:

`Math.sqrt(dx * dx + dy * dy)`

No Q08 acceptance criterion, architecture, or production selector is changed by this diagnostic compatibility fix.
