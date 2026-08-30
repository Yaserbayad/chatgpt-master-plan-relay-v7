# Q15 Low-Resource Qualification Scope Amendment — 2026-08-30

## Authority

Explicit current human instruction on 2026-08-30 supersedes the standalone Q15-A PowerShell timing-harness requirement. The human explicitly directed that the failed test must not be repeated and that the ~10-minute wait belongs inside UI.Vision itself rather than an external PowerShell qualification wrapper.

This amendment modifies only Q15-A. It does not remove or weaken the separately authorized Q15-B UI.Vision → local bridge → Codex → UI.Vision qualification in `master-plan/Q15_CODEX_WATCHER_AMENDMENT_2026-08-30.md`.

## Observed failed harness

The human ran `Q15_RUN.ps1`. It reported that Q15 started, requested the target Project conversation remain unchanged, then terminated after approximately 13 minutes because the expected Q15 evidence CSV was not produced.

This is classified as a failure of the standalone qualification harness/evidence-return path, not evidence that UI.Vision native sleep is unavailable. Per explicit human authority, the same test must not be repeated.

## Amended Q15-A decision

For the current Phase-Q gate:

- no PowerShell/external timer is required to prove the ~10-minute wait;
- the production design must implement the wait directly inside the UI.Vision macro using UI.Vision's native sleep/check mechanism;
- no routine refresh, OCR/image loop, or aggressive polling is permitted during the wait;
- end-to-end runtime cadence proof is deferred to the later UI.Vision regression/verification stage (including T15) after the actual watcher exists.

Q15-A therefore no longer blocks Phase Q on a standalone external timing test.

## Q15-B remains required

The following remains unchanged and must still be target-proven before Q15/Q16 can PASS:

```text
completed ChatGPT response
→ UI.Vision event
→ local bridge
→ one Codex invocation
→ strict nonce-bound result
→ local bridge validation
→ UI.Vision acceptance
```

with no material ChatGPT browser mutation during the qualification probe.

## Impact analysis

- Q01–Q14: PRESERVE.
- Q15-A: standalone external test removed; native UI.Vision implementation + later regression proof selected.
- Q15-B: unchanged and still required.
- Q15: remains TODO until Q15-B passes.
- Q16: remains TODO until Q15 passes.
- I06/T15: retain the native low-frequency UI.Vision sleep/check requirement and later end-to-end verification.

## Checkpoint compatibility

The temporary `pre-C01-qualification-1` checkpoint has no `checkpoint_revision` or `baseline.version`; none is fabricated. This amendment is made durable by checkpoint reference until C01 freezes the production schema.
