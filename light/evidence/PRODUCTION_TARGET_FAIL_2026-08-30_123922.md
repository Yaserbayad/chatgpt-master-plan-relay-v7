# Light Production Target Failure — 2026-08-30 12:39:22Z

Status: **FAIL — safe pre-Send Send-control discovery failure**.

This evidence applies only to the independent Light Version on branch `light-version`. It does not modify or imply any main-project state.

## Uploaded target bundle

- Uploaded bundle SHA-256: `4bc1d6518a615a78c632d5af2e5b96b4f61b42b8444e0e75573a7788d29f2d31`
- Internal `SHA256.txt`: all six files verified successfully.

Internal hashes:

```text
b368b9dff2fd8c5ac8ed6c611e3f7561181b432a79dce9ea51d9da1ae4368f4c  LIGHT_PRODUCTION_ACTION.schema.json
456fc0de22b4047ad09719bb6916cb7fd9d9eeb39cc8159407a61631a91f8387  LIGHT_PRODUCTION_target.log
74fbf3ec7a2d94e6c2269975dd8cb9fb7fe8592fa81db302e1c970a96c5ab82a  LIGHT_PRODUCTION_target_2026-08-30T12-39-21-223Z.csv
594c64e8093bbd33b77bd80f967fb41a5fb3a62ec51edca193c5c98ce759a977  LIGHT_PRODUCTION_WATCHER.js
071cf5e7071e242e76476ba0e740c190482c75e4577c712cd4dbad39a2c00619  RelayCodexLightProduction.ps1
0fafff8c7d516fc651f8795f8513e32feb5a200c99a1098e4609cb626aa50927  RESULT.txt
```

The bundled runtime source is byte-bound to these Git blobs from the failed candidate:

```text
dc934f5a39ecf2c877c47e9936aeb13a7b8cc620  LIGHT_PRODUCTION_WATCHER.js
3fb41fe1ef6f4ac6f0ade600858d700c49d19aaf  RelayCodexLightProduction.ps1
d06dbdcfb341e443663736fcdc14274c0560b3c3  LIGHT_PRODUCTION_ACTION.schema.json
```

## Runtime result

```text
result=FAIL
failure_reason=SEND_CONTROL_MISSING: semantic Send control not found
failure_class=OTHER
elapsed_ms=21120
conversation_id=6a93ceab-9f20-83eb-bd76-3bb7974cf1b6
source_user_message_id=0c5e7409-5b24-4d1f-a6be-1434b8556318
source_assistant_message_id=fb403d5d-d400-4b74-a6cf-a2aa647ea126
nonce=LIGHT_PROD_20260830T123903786Z_z9gasc2d0b
xrun_exit_code=0
bridge_action=SEND_PROMPT
codex_version=codex-cli 0.151.0
codex_exit_code=0
codex_duration_ms=6700
assistant_text_sha256=fd95b67d2915ed1c0c9e8159a2bc6e3dfa6faa65abb72d2432c0ea9cbb308ef8
browser_identity_revalidated=true
send_click_count=0
submission_confirmed=false
next_completion_observed=false
```

## Boundary localization

The Ui.Vision log proves the following ordered runtime path:

1. source turn was stably observed and bound;
2. `XRunAndWait` completed with exit 0;
3. Codex returned `SEND_PROMPT` with exit 0;
4. `#prompt-textarea` was found;
5. trusted clipboard paste executed;
6. composer was reacquired;
7. trusted Ctrl+A / Ctrl+C copy-back executed and did not trigger a staging mismatch;
8. source identity was revalidated;
9. the watcher queried only `button[data-testid="send-button"]` and visible `button[aria-label="Send prompt"]`;
10. neither matched;
11. `send_click_count=0`; no material submission occurred.

Therefore the previous copy-back staging correction is target-proven through its gate. The remaining failure was Send-control discovery only.

## Root cause

Existing target-qualified main Relay Q09 technical evidence used this exact Send surface:

```text
css=button[class*="composer-submit-button-color"][aria-label="Send prompt"]
```

and discovered it with `includeHidden: true`, then filtered candidates for enabled state before the single trusted click.

The Light candidate had simplified that qualified mechanical invariant: it omitted the `composer-submit-button-color` selector, queried with the default visible-only finder path, and did not perform enabled-state filtering. The target failure is therefore a Light implementation regression from already-qualified technical evidence, not evidence that Codex, staging, identity binding, or the one-Send architecture failed.

## Correction

The Light watcher now:

- tries the Q09-qualified selector first;
- queries Send candidates with `includeHidden: true`;
- filters out disabled / `aria-disabled=true` candidates;
- rejects ambiguous multiple enabled matches;
- retains the previous two selectors only as secondary fallbacks;
- preserves all one-Send, pre-click `SEND_AMBIGUOUS`, identity, dedupe, and no-retry rules.

Corrected persisted blobs:

```text
c8968386530efc4381411fed1aae90dda38c485f  light/production/LIGHT_PRODUCTION_WATCHER.js
393ce2046207e8dc2d9df44b2d810bd8842bce36  light/tests/simulate_production_watcher.mjs
9406c92c762f285f25cab7a29346bb6bc70a1b56  light/tests/test_production_contract.mjs
```

Correction commits:

```text
8ab928d5ed0b7af27dcfc8e190dc4260fbddde16  Restore Q09-qualified Send discovery
f5939742554d0954272733a52f9a2d816a65cdab  Guard Q09-qualified Send discovery
f7f3219ea3526d5770f84d06a58d4b8626e2e6ea  Require Q09-qualified Send discovery
```

Local verification after correction:

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

## Remaining boundary

Production target qualification remains **not PASS**. Run the replacement target package once. Do not automatically repeat a failure; preserve and diagnose returned evidence first.
