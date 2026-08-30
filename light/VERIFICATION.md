# Light Version Verification

## Q15-B bridge qualification

Status: **VERIFIED TARGET PASS**.

Durable evidence: `light/evidence/Q15B_2026-08-30.md`

Accepted Q15-B source revision: `3562b6090c3ad1c8663d4f1fcc6cb506269051d1`

Q15-B no longer gates production implementation.

## First production watcher/actuator

Status: **Q08 SENTINEL / SUBMIT-SURFACE CONTRACT RESTORED, LOCALLY VERIFIED — TARGET PASS REQUIRED**.

Contract: `light/PRODUCTION_CONTRACT.md`

Evidence records:

- `light/evidence/PRODUCTION_LOCAL_2026-08-30.md`
- `light/evidence/PRODUCTION_TARGET_FAIL_2026-08-30_122613.md`
- `light/evidence/PRODUCTION_TARGET_FAIL_2026-08-30_123922.md`
- `light/evidence/PRODUCTION_TARGET_FAIL_2026-08-30_140440.md`

### Target attempt 1

Safe pre-Send failure:

```text
STAGE_VERIFY_FAILED: staged prompt does not match
```

The finder-snapshot text check was removed because Ui.Vision finder results are snapshots.

### Target attempt 2

Safe pre-Send failure:

```text
SEND_CONTROL_MISSING: semantic Send control not found
```

The Light watcher had omitted the Q09-qualified Send selector / discovery behavior, so that behavior was restored.

### Target attempt 3 — convergence correction

The third target run failed with the same `SEND_CONTROL_MISSING` signature even though the uploaded evidence proves the Q09 selector, `includeHidden:true`, and enabled filtering were actually executed. No Send click occurred.

Therefore the attempt-2 selector-only root-cause claim is **falsified**.

The third evidence ZIP is independently hash-verified and byte-bound to the failed watcher blob `c8968386530efc4381411fed1aae90dda38c485f`.

Reinspection of the already target-qualified Q08 evidence exposed a more fundamental implementation regression: Light had reintroduced Q08's known false-positive clipboard oracle. It wrote the prompt to the clipboard before paste, then copied and compared against the same prompt without first replacing the clipboard with a unique sentinel. A silent paste/copy no-op can therefore leave the clipboard unchanged and falsely pass staging.

Q08 final target PASS had explicitly required:

```text
Start Voice -> Send prompt
unique copy sentinel before Ctrl+C
copy must replace sentinel
copied text == prompt after CR + terminal-NBSP-only normalization
```

### Current correction

The production watcher now restores that target-proven Q08 contract:

1. require one visible `composer-submit-button-color` surface with `aria-label="Start Voice"` before staging;
2. trusted clipboard paste through the composer;
3. require the same visible surface to transition to enabled `aria-label="Send prompt"`;
4. seed a unique nonce-bound clipboard sentinel before Ctrl+C;
5. require Ctrl+C to replace the sentinel;
6. compare copied text with terminal-NBSP-only editor normalization;
7. restore original clipboard;
8. revalidate source identity;
9. reacquire the same visible submit surface as `Send prompt` before the one bounded click.

The previous selector-only `includeHidden:true` click path is removed. One-Send maximum, pre-click `SEND_AMBIGUOUS`, dedupe, identity binding, STOP/HUMAN, and no automatic retry remain unchanged.

### Current source binding

```text
d06dbdcfb341e443663736fcdc14274c0560b3c3  LIGHT_PRODUCTION_ACTION.schema.json
eb8ff2a0367732f66207b4611cfe7336b9da0d16  LIGHT_PRODUCTION_WATCHER.js
ea7878a8b9849d9aa2f1fbd822004d0bfb6fafb4  RUN_LIGHT_PRODUCTION_TARGET.ps1
3fb41fe1ef6f4ac6f0ade600858d700c49d19aaf  RelayCodexLightProduction.ps1
41a1ea86da47a56f14b22b093c79eb402c841d52  test_production_contract.mjs
9864c04ee91e140637871811ded502c27ecc2639  simulate_production_watcher.mjs
```

The watcher and both test files were reread from GitHub and byte-bound to the locally tested files.

### Current local verification

```text
node --check light/production/LIGHT_PRODUCTION_WATCHER.js
PASS

node light/tests/test_production_contract.mjs
LIGHT PRODUCTION CONTRACT TESTS: PASS

node light/tests/simulate_production_watcher.mjs
LIGHT PRODUCTION SENTINEL/SUBMIT-SURFACE SIMULATION: PASS
```

The simulation proves:

- paste no-op fails before Send by missing `Start Voice -> Send prompt` transition;
- copy no-op fails because the sentinel is not replaced;
- copied-content mismatch fails before Send;
- terminal NBSP editor serialization is accepted without broad whitespace trimming;
- generation gating, stale identity, STOP/HUMAN, duplicate-turn, Send-click failure, one-Send and no-retry behavior remain intact.

The local environment has no PowerShell runtime, so unchanged PowerShell bridge/runner execution remains Windows-target evidence only.

## Remaining acceptance boundary

Production is **not target-PASS**.

Run the replacement bounded target package once against exactly one completed configured-Project ChatGPT conversation tab with an empty composer. It may send exactly one fixed prompt:

`Reply exactly LIGHT_PRODUCTION_TARGET_OK.`

Target PASS requires evidence proving:

1. bridge/Codex exit 0;
2. pre-action identity revalidation;
3. `baseline_submit_aria=Start Voice`;
4. `pasted_submit_aria=Send prompt`;
5. `copy_sentinel_replaced=true`;
6. `staged_copy_exact=true`;
7. exactly one Send click;
8. exact new-user-message confirmation;
9. following stable completed assistant turn;
10. evidence bundle bound to the current source.

Do not blindly rerun a target failure. Diagnose returned evidence first. After independently verified target PASS, proceed to bounded same-chat reliability/soak before fresh-chat/recovery work.
