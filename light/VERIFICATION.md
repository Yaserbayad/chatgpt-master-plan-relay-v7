# Light Version Verification

## Q15-B bridge qualification

Status: **VERIFIED TARGET PASS**.

The returned Windows target evidence ZIP was independently inspected, hash-verified, and byte-bound to the accepted `light-version` Q15-B source revision. All ten Q15-B acceptance requirements passed.

Durable evidence:

`light/evidence/Q15B_2026-08-30.md`

Accepted Q15-B source revision:

`3562b6090c3ad1c8663d4f1fcc6cb506269051d1`

Q15-B no longer gates production implementation.

## First production watcher/actuator

Status: **CORRECTED LOCALLY VERIFIED TARGET CANDIDATE — TARGET PASS REQUIRED**.

Contract:

`light/PRODUCTION_CONTRACT.md`

Evidence records:

- `light/evidence/PRODUCTION_LOCAL_2026-08-30.md`
- `light/evidence/PRODUCTION_TARGET_FAIL_2026-08-30_122613.md`

### First target attempt

The first real Windows/Chrome production target attempt reached the material staging gate and failed safely with:

```text
STAGE_VERIFY_FAILED: staged prompt does not match
```

The failure occurred before the Send-control lookup and before any Send click in the accepted watcher source. No automatic retry occurred. The generated target evidence ZIP was not uploaded with the report, so no claim is made that the ZIP itself was inspected.

The failing verifier compared the clipboard-pasted ChatGPT rich contenteditable composer against a newly acquired Ui.Vision finder match's `.text/.value`. Ui.Vision v10 finder matches are snapshots; the target failure therefore did not prove that paste itself failed and did not provide an independent staged-text readback.

### Corrective change

The staged-prompt material gate now uses trusted copy-back instead of finder-snapshot text:

1. clipboard-stage the model prompt;
2. focus the composer;
3. trusted `${KEY_CTRL+KEY_V}` paste;
4. reacquire/refocus composer;
5. trusted `${KEY_CTRL+KEY_A}` then `${KEY_CTRL+KEY_C}`;
6. require copied clipboard text to exactly match the intended prompt, with CR normalization only;
7. restore original clipboard;
8. revalidate source identity before locating/clicking Send.

No model-generated prompt text is passed to `uiv.browser.type`; only the three constant trusted key chords are used. One-Send, dedupe, nonce/identity, `SEND_AMBIGUOUS` pre-click fencing and no-retry behavior are unchanged.

### Current source binding

```text
d06dbdcfb341e443663736fcdc14274c0560b3c3  LIGHT_PRODUCTION_ACTION.schema.json
dc934f5a39ecf2c877c47e9936aeb13a7b8cc620  LIGHT_PRODUCTION_WATCHER.js
ea7878a8b9849d9aa2f1fbd822004d0bfb6fafb4  RUN_LIGHT_PRODUCTION_TARGET.ps1
3fb41fe1ef6f4ac6f0ade600858d700c49d19aaf  RelayCodexLightProduction.ps1
147274e28a75c3ad585dbc2e410e8c6b338b8573  test_production_contract.mjs
de8c1f3d3218c0f3da6df060fdde3fd0b65e2d95  simulate_production_watcher.mjs
```

### Current local verification

```text
node --check light/production/LIGHT_PRODUCTION_WATCHER.js
PASS

node light/tests/test_production_contract.mjs
LIGHT PRODUCTION CONTRACT TESTS: PASS

node light/tests/simulate_production_watcher.mjs
LIGHT PRODUCTION STAGE COPY-BACK SIMULATION: PASS
```

The regression simulation explicitly proves:

- a stale/empty contenteditable finder snapshot after a successful paste does not cause false failure;
- corrupted copy-back fails before Send;
- no dispatch while generating;
- stale bridge identity fails before staging;
- STOP/HUMAN perform no material action;
- `SEND_AMBIGUOUS` persists before Send and ambiguous/click-failure paths do not retry;
- duplicate handled source turns are rejected before Codex.

The local execution environment has no PowerShell runtime; unchanged PowerShell bridge/runner runtime remains a Windows-target boundary.

## Remaining acceptance boundary

Run the corrected bounded production target package once against exactly one completed configured-Project ChatGPT conversation tab with an empty composer. The qualification may send exactly one fixed safe prompt:

`Reply exactly LIGHT_PRODUCTION_TARGET_OK.`

Production target PASS requires returned evidence proving:

1. bridge/Codex exit 0;
2. exact pre-action browser identity revalidation;
3. exact staged-text trusted copy-back verification;
4. exactly one Send click;
5. exact new-user-message confirmation;
6. following stable completed assistant turn observed;
7. evidence bundle bound to the corrected source.

Do not blindly rerun a target failure. Diagnose returned evidence first. After independently verified target PASS, proceed to bounded same-chat reliability/soak before implementing fresh-chat/recovery behavior.
