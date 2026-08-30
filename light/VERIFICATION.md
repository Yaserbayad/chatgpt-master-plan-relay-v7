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

Status: **Q09-SEND-DISCOVERY CORRECTED, LOCALLY VERIFIED TARGET CANDIDATE — TARGET PASS REQUIRED**.

Contract:

`light/PRODUCTION_CONTRACT.md`

Evidence records:

- `light/evidence/PRODUCTION_LOCAL_2026-08-30.md`
- `light/evidence/PRODUCTION_TARGET_FAIL_2026-08-30_122613.md`
- `light/evidence/PRODUCTION_TARGET_FAIL_2026-08-30_123922.md`

### Target attempt 1 — staging snapshot false negative

The first Windows/Chrome production attempt failed safely before Send with:

```text
STAGE_VERIFY_FAILED: staged prompt does not match
```

The material gate was corrected to verify staging by trusted copy-back (`Ctrl+A` / `Ctrl+C`) rather than treating a Ui.Vision rich-editor finder snapshot's `.text/.value` as authoritative.

### Target attempt 2 — Send discovery regression

The corrected copy-back candidate then reached the next material gate and failed safely with:

```text
SEND_CONTROL_MISSING: semantic Send control not found
```

The uploaded second evidence ZIP was independently verified. Runtime evidence proves:

```text
xrun_exit_code=0
bridge_action=SEND_PROMPT
codex_exit_code=0
browser_identity_revalidated=true
send_click_count=0
submission_confirmed=false
next_completion_observed=false
```

The Ui.Vision log proves staging copy-back completed successfully and source identity was revalidated before Send discovery. It then queried only:

```text
css=button[data-testid="send-button"]
css=button[aria-label="Send prompt"]
```

with the default visible-only finder behavior; neither matched. No Send click occurred.

Existing target-qualified main Relay Q09 technical evidence had already proven this exact mechanical Send surface and discovery behavior:

```text
css=button[class*="composer-submit-button-color"][aria-label="Send prompt"]
includeHidden: true
enabled-state filtering
```

The Light implementation had simplified away those qualified invariants. This was the root cause of target attempt 2.

### Current correction

The Light watcher now:

1. tries the Q09-qualified `composer-submit-button-color` selector first;
2. queries each Send locator with `includeHidden: true`;
3. filters out `disabled` and `aria-disabled=true` candidates;
4. requires exactly one enabled candidate for a locator and fails on ambiguity;
5. retains the prior two selectors only as secondary fallbacks;
6. preserves one-Send maximum, pre-click `SEND_AMBIGUOUS`, identity revalidation, dedupe, and no-retry semantics.

The staging-copy-back correction from attempt 1 remains unchanged.

### Current source binding

```text
d06dbdcfb341e443663736fcdc14274c0560b3c3  LIGHT_PRODUCTION_ACTION.schema.json
c8968386530efc4381411fed1aae90dda38c485f  LIGHT_PRODUCTION_WATCHER.js
ea7878a8b9849d9aa2f1fbd822004d0bfb6fafb4  RUN_LIGHT_PRODUCTION_TARGET.ps1
3fb41fe1ef6f4ac6f0ade600858d700c49d19aaf  RelayCodexLightProduction.ps1
9406c92c762f285f25cab7a29346bb6bc70a1b56  test_production_contract.mjs
393ce2046207e8dc2d9df44b2d810bd8842bce36  simulate_production_watcher.mjs
```

The three corrected watcher/test blobs above were reread from GitHub and byte-bound to the locally tested files with `git hash-object`.

### Current local verification

```text
node --check light/production/LIGHT_PRODUCTION_WATCHER.js
PASS

node light/tests/test_production_contract.mjs
LIGHT PRODUCTION CONTRACT TESTS: PASS

node light/tests/simulate_production_watcher.mjs
LIGHT PRODUCTION STAGE COPY-BACK SIMULATION: PASS

focused Q09 Send-discovery regression
SEND DISCOVERY REGRESSION: PASS
```

The regression suite now proves both target failure boundaries:

- stale/empty rich-editor finder snapshots after successful paste do not create a staging false negative;
- corrupted copy-back still fails before Send;
- Send discovery succeeds only when the Q09-qualified hidden semantic selector path is honored;
- generation, stale identity, STOP/HUMAN, duplicate-turn, ambiguous-send, and no-retry fences remain intact.

The local execution environment has no PowerShell runtime; unchanged PowerShell bridge/runner execution remains a Windows-target boundary.

## Remaining acceptance boundary

Run the replacement bounded production target package once against exactly one completed configured-Project ChatGPT conversation tab with an empty composer. The qualification may send exactly one fixed safe prompt:

`Reply exactly LIGHT_PRODUCTION_TARGET_OK.`

Production target PASS requires returned evidence proving:

1. bridge/Codex exit 0;
2. exact pre-action browser identity revalidation;
3. exact staged-text trusted copy-back verification;
4. qualified semantic Send discovery;
5. exactly one Send click;
6. exact new-user-message confirmation;
7. following stable completed assistant turn observed;
8. evidence bundle bound to the current source.

Do not blindly rerun a target failure. Diagnose returned evidence first. After independently verified target PASS, proceed to bounded same-chat reliability/soak before implementing fresh-chat/recovery behavior.
