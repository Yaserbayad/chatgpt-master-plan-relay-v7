# Light Production Target Failure — 2026-08-30 12:26 UTC

Status: **TARGET FAIL — PRE-SEND STAGING VERIFICATION**

This record applies only to `light-version`. It does not alter or imply any main-project state.

## Observed target evidence

The Windows target runner reported:

```text
Codex CLI: codex-cli 0.151.0
Starting bounded Light production target qualification.
LIGHT PRODUCTION TARGET FAIL: production watcher failed: STAGE_VERIFY_FAILED: staged prompt does not match
Upload this evidence bundle: C:\Users\usr\Desktop\LIGHT_PRODUCTION_evidence_20260830_122613.zip
```

Ui.Vision also reported:

```text
Q15B_LIGHT_PROBE.js failed: LIGHT PRODUCTION TARGET FAIL: STAGE_VERIFY_FAILED: staged prompt does not match; evidence=LIGHT_PRODUCTION_target_2026-08-30T12-26-13-396Z.csv (line 118) (Runtime 16.57s)
```

The generated evidence ZIP was not uploaded with this failure report, so this record does not claim inspection of that archive. The terminal/log evidence is sufficient to localize the failure to the watcher staging-verification line.

## Safety interpretation

In the accepted watcher source, the failing `STAGE_VERIFY_FAILED: staged prompt does not match` check occurs before:

- locating the Send control;
- persisting the pre-click `SEND_AMBIGUOUS` fence;
- any Send click;
- submission confirmation.

Therefore the failing code path cannot have submitted a ChatGPT message. No automatic retry occurred.

## Diagnosis

The pre-fix watcher used a newly reacquired Ui.Vision DOM match's `.text/.value` snapshot as the authoritative proof that a clipboard-pasted rich contenteditable composer exactly matched the intended prompt.

Ui.Vision v10 documents finder results as snapshots carrying `.text`, `.value`, position and attributes; they are not live DOM handles. This makes a strict rich-editor snapshot equality check an unsafe verifier for the material-send gate. The observed target failure cannot distinguish a failed paste from a snapshot/readback mismatch because the old evidence did not record an independent staged-text readback.

## Corrective change

The smallest fail-closed correction replaces only the staged-text verifier:

1. paste via the already-qualified clipboard + trusted `${KEY_CTRL+KEY_V}` path;
2. reacquire the composer and focus it;
3. use constant trusted `${KEY_CTRL+KEY_A}` then `${KEY_CTRL+KEY_C}`;
4. read the copied staged text from the clipboard;
5. require exact prompt equality (line-ending normalization only);
6. restore the original clipboard;
7. continue to the existing source-identity revalidation and one-Send bound only if copy-back succeeds.

No model-generated text is passed to the trusted key parser. Send count, dedupe, nonce/identity validation, ambiguous-send fencing and no-retry semantics are unchanged.

## Regression verification

A new simulation explicitly models a stale/empty rich-editor finder snapshot after a successful paste. The corrected watcher passes that case because copy-back proves the actual staged text. A separate corrupted-copy-back case fails before Send.

Target PASS remains unproven until the corrected package is run on Windows/Chrome and its returned evidence is independently verified.
