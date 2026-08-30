# Q12 Human-Authorized Scope Amendment — 2026-08-30

## Authority

Explicit current human instruction on 2026-08-30 supersedes the original Q12 browser-lifecycle requirement for the current Phase-Q qualification only.

## Decision

The current production/qualification scope is operation **inside an already-running Chrome session**. External Chrome crash/restart handling and browser lifecycle control are optional and are not required to complete Q12 at this stage.

## Amended Q12 acceptance

Using UI.Vision FileAccess/Hard-Drive CSV:

- append a FENCE through UI.Vision storage;
- reread the exact FENCE through UI.Vision storage;
- prove the expected record is present exactly once and is not partial/corrupt;
- preserve the UI.Vision-only storage boundary.

External Chrome termination, Chrome restart, or Windows/browser lifecycle automation is **not required for Q12 PASS** under this amendment.

**PASS:** the in-Chrome UI.Vision hard-drive journal can append and exactly reread the FENCE required before one-Submit semantics.

**FAIL:** the UI.Vision-only journal path cannot reliably append/reread the required FENCE.

## Existing evidence impact

`qualification/Q12_POST_LIMIT_PARTIAL_EVIDENCE.md` already proves:

- UI.Vision `uiv.csv.append` was used;
- UI.Vision `uiv.csv.read` was used;
- the unique FENCE did not pre-exist;
- append succeeded;
- immediate exact reread succeeded with `exact_reread_count=1`;
- no native filesystem write was used as journal durability proof.

That evidence is sufficient for the amended Q12 acceptance. Its additional restart evidence is stronger than currently required but is not needed for PASS.

## Impact analysis

- Q01-Q11: unaffected; existing PASS proof remains valid.
- Q12: acceptance narrowed as above; existing evidence now satisfies it.
- Q13-Q16: acceptance semantics unchanged.
- C07/I13/I14: still require the in-Chrome FENCE append+reread transaction and remain compatible with this amendment.
- Future dedicated browser/crash lifecycle items (for example T13/T18, E08-E10, R03-R04) are **not changed by this narrow Phase-Q amendment**. They may be revisited separately when reached if the human continues to exclude Chrome-crash/lifecycle resilience from scope.

## Checkpoint compatibility

The temporary `pre-C01-qualification-1` checkpoint has no `checkpoint_revision` or `baseline.version`; none is fabricated. This amendment is made durable by explicit checkpoint reference until C01 freezes the production schema.
