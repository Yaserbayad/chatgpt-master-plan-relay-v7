# Light Version Verification

## Q15-B bridge qualification

Status: **VERIFIED TARGET PASS**.

The returned Windows target evidence ZIP was independently inspected, hash-verified, and byte-bound to the accepted `light-version` Q15-B source revision. All ten Q15-B acceptance requirements passed.

Durable evidence:

`light/evidence/Q15B_2026-08-30.md`

Accepted Q15-B source revision:

`3562b6090c3ad1c8663d4f1fcc6cb506269051d1`

The verified runtime evidence includes:

- exactly one configured-Project conversation binding;
- completed/no-stop-button source turn;
- stable user/assistant message identity;
- full assistant text crossing Ui.Vision -> PowerShell with local SHA-256;
- exactly one ephemeral `--sandbox read-only` Codex model turn;
- exact bounded-sample reproduction;
- protocol/nonce/id/length/hash/action validation;
- post-Codex browser identity revalidation;
- no material ChatGPT browser action;
- verified PASS evidence export/package.

Q15-B no longer gates production implementation.

## First production watcher/actuator

Status: **LOCALLY VERIFIED TARGET CANDIDATE — TARGET PASS REQUIRED**.

Contract:

`light/PRODUCTION_CONTRACT.md`

Local verification/evidence:

`light/evidence/PRODUCTION_LOCAL_2026-08-30.md`

Current candidate artifacts:

```text
light/production/LIGHT_PRODUCTION_ACTION.schema.json
light/production/LIGHT_PRODUCTION_WATCHER.js
light/production/RelayCodexLightProduction.ps1
light/production/RUN_LIGHT_PRODUCTION_TARGET.ps1
light/tests/test_production_contract.mjs
light/tests/simulate_production_watcher.mjs
```

Persisted Git blob binding:

```text
d06dbdcfb341e443663736fcdc14274c0560b3c3  LIGHT_PRODUCTION_ACTION.schema.json
a886399ebc2895351c679f1b30ccd524f1b84a56  LIGHT_PRODUCTION_WATCHER.js
ea7878a8b9849d9aa2f1fbd822004d0bfb6fafb4  RUN_LIGHT_PRODUCTION_TARGET.ps1
3fb41fe1ef6f4ac6f0ade600858d700c49d19aaf  RelayCodexLightProduction.ps1
99aa8817326841c8ca8fee2acf72b76179523b9d  test_production_contract.mjs
1d20f052f667d5c05b4914d41947d257553f6d50  simulate_production_watcher.mjs
```

Verified locally after final byte reconciliation:

```text
node light/tests/test_production_contract.mjs
LIGHT PRODUCTION CONTRACT TESTS: PASS

node light/tests/simulate_production_watcher.mjs
LIGHT PRODUCTION WATCHER SIMULATION: PASS

node --check light/production/LIGHT_PRODUCTION_WATCHER.js
PASS (exit 0)
```

The local execution environment has no PowerShell runtime, so no claim is made that the production PowerShell candidate has been locally executed. The Windows target run is the remaining runtime boundary.

### Safety/behavior verified before target

- generation gates dispatch;
- two stable snapshots gate a completed source turn;
- one new source assistant turn generates one bridge event;
- handled/ambiguous turns are deduped before Codex;
- returned action is identity-bound and allowlisted to `SEND_PROMPT | STOP | HUMAN`;
- STOP/HUMAN perform no browser material action;
- untrusted/model-generated prompt text is clipboard-staged and never passed to the trusted-key parser;
- only the constant `${KEY_CTRL+KEY_V}` chord is sent through trusted typing;
- exact staged composer text and exact source identity/text are reacquired before Send;
- one material Send maximum;
- `SEND_AMBIGUOUS` is persisted before the Send click as a crash/retry fence;
- ambiguous/click-failure paths never retry;
- successful Send requires a new user message exactly matching the staged prompt;
- success then requires the following stable completed assistant turn;
- no OCR/screenshots/Ui.Vision AI/page-world eval/generic coordinates/fresh-chat/Chrome-restart logic.

A persistence-verification mismatch also caught and corrected an incorrectly escaped PowerShell path-normalization regex before target packaging. The corrected runner is Git blob `ea7878a8b9849d9aa2f1fbd822004d0bfb6fafb4`.

## Remaining acceptance boundary

Run the bounded production target package once against exactly one completed configured-Project ChatGPT conversation tab. The qualification may send exactly one fixed safe prompt:

`Reply exactly LIGHT_PRODUCTION_TARGET_OK.`

Production target PASS requires returned evidence proving:

1. bridge/Codex exit 0;
2. exact pre-action browser identity revalidation;
3. exactly one Send click;
4. exact new-user-message confirmation;
5. following stable completed assistant turn observed;
6. valid evidence bundle bound to the current candidate.

Do not blindly rerun a target failure. Diagnose the returned evidence first. After independently verified target PASS, proceed to bounded same-chat reliability/soak before implementing fresh-chat/recovery behavior.
