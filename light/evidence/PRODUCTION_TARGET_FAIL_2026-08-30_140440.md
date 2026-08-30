# Light Production Target Failure — 2026-08-30 14:04:40Z

Status: **FAIL — safe pre-Send; Q09 selector-only diagnosis falsified**.

This evidence applies only to the independent Light Version on branch `light-version`. It does not modify or imply main-project state.

## Uploaded target bundle

- Uploaded bundle SHA-256: `7c85857149cbda61fff8d20a27cd6582fd4ad39231fd98b117b3db27ce705db4`
- Internal `SHA256.txt`: all six files verified successfully.

```text
b368b9dff2fd8c5ac8ed6c611e3f7561181b432a79dce9ea51d9da1ae4368f4c  LIGHT_PRODUCTION_ACTION.schema.json
c8ce0dd8c38a822d69f1e50c7990ea41392d0f35005e28d247f4dab145c5f198  LIGHT_PRODUCTION_target.log
6615309545627c35e06738a3e757879cd5b830fced169f729c7a33d765373718  LIGHT_PRODUCTION_target_2026-08-30T14-04-39-884Z.csv
50c14b5674425067d163cc3ee8b9bbab3538fab346d4a3d960b0c505b732062f  LIGHT_PRODUCTION_WATCHER.js
071cf5e7071e242e76476ba0e740c190482c75e4577c712cd4dbad39a2c00619  RelayCodexLightProduction.ps1
0fafff8c7d516fc651f8795f8513e32feb5a200c99a1098e4609cb626aa50927  RESULT.txt
```

Bundled runtime source is byte-bound to the failed candidate:

```text
c8968386530efc4381411fed1aae90dda38c485f  LIGHT_PRODUCTION_WATCHER.js
3fb41fe1ef6f4ac6f0ade600858d700c49d19aaf  RelayCodexLightProduction.ps1
d06dbdcfb341e443663736fcdc14274c0560b3c3  LIGHT_PRODUCTION_ACTION.schema.json
```

## Runtime result

```text
result=FAIL
failure_reason=SEND_CONTROL_MISSING: semantic Send control not found
failure_class=OTHER
elapsed_ms=23772
conversation_id=6a93ceab-9f20-83eb-bd76-3bb7974cf1b6
source_user_message_id=0c5e7409-5b24-4d1f-a6be-1434b8556318
source_assistant_message_id=fb403d5d-d400-4b74-a6cf-a2aa647ea126
nonce=LIGHT_PROD_20260830T140419810Z_cii0h9omudq
xrun_exit_code=0
bridge_action=SEND_PROMPT
codex_version=codex-cli 0.151.0
codex_exit_code=0
codex_duration_ms=7287
assistant_text_sha256=fd95b67d2915ed1c0c9e8159a2bc6e3dfa6faa65abb72d2432c0ea9cbb308ef8
browser_identity_revalidated=true
send_click_count=0
submission_confirmed=false
next_completion_observed=false
```

## Boundary evidence

The target log proves that after the Light copy-back check and source-identity revalidation the Q09-fix candidate actually executed all three Send queries with `includeHidden:true`:

```text
button[class*="composer-submit-button-color"][aria-label="Send prompt"]
button[data-testid="send-button"]
button[aria-label="Send prompt"]
```

None matched. Therefore the attempt-2 hypothesis that the failure was caused only by omitting the Q09 selector / `includeHidden:true` behavior is **FALSIFIED**.

No Send click occurred.

## Recovered prior target evidence

Main Relay Q08 had already discovered and corrected a more fundamental verifier defect on the same target environment:

- writing the payload to the clipboard;
- issuing trusted Ctrl+V;
- then issuing Ctrl+A / Ctrl+C;
- and comparing the clipboard to the same original payload

can false-pass if paste and/or copy silently no-op, because the clipboard may simply remain unchanged.

Q08 final target PASS required a non-replayable copy sentinel and independently observable composer submit-surface transitions:

```text
Start Voice -> Send prompt -> Start Voice -> Send prompt
```

It also required only terminal U+00A0 normalization for contenteditable clipboard serialization.

The failed Light watcher had reintroduced the old false oracle: it never seeded a unique sentinel before Ctrl+C and it did not require the target-proven `Start Voice -> Send prompt` transition. Thus the third target failure does **not** prove paste succeeded; the later `SEND_CONTROL_MISSING` is compatible with a silent paste/copy no-op that the Light verifier mistakenly accepted.

## Corrective implementation

The Light watcher now restores the Q08 target-proven staging contract:

1. require the visible composer submit surface to be exactly `Start Voice` before staging;
2. clipboard-stage the prompt and trusted Ctrl+V paste;
3. require the visible submit surface to transition to enabled `Send prompt`;
4. write a unique nonce-bound copy sentinel to the clipboard before Ctrl+C;
5. require Ctrl+C to replace the sentinel;
6. require copied text to equal the prompt after CR normalization and terminal-NBSP-only normalization;
7. restore the original clipboard;
8. revalidate source identity;
9. reacquire the same visible `composer-submit-button-color` surface and require `Send prompt` before the one bounded click.

The selector-only `includeHidden:true` click path is removed. One-Send maximum, pre-click `SEND_AMBIGUOUS`, dedupe, identity binding, and no automatic retry remain unchanged.

Corrected persisted blobs:

```text
eb8ff2a0367732f66207b4611cfe7336b9da0d16  light/production/LIGHT_PRODUCTION_WATCHER.js
9864c04ee91e140637871811ded502c27ecc2639  light/tests/simulate_production_watcher.mjs
41a1ea86da47a56f14b22b093c79eb402c841d52  light/tests/test_production_contract.mjs
```

Correction commits:

```text
910d8884ec3f22236a3e4b01144b0b3a2289b830  fix: restore Q08 sentinel staging contract
db9cb5dc1990bda167b9b2a65719c4c45ce7d892  test: guard sentinel staging and submit surface
9b8ccba356715fc6ad8b81dce3f0f7e1ceda29ec  test: require Q08 sentinel staging contract
```

Local verification:

```text
node --check light/production/LIGHT_PRODUCTION_WATCHER.js
PASS

node light/tests/test_production_contract.mjs
LIGHT PRODUCTION CONTRACT TESTS: PASS

node light/tests/simulate_production_watcher.mjs
LIGHT PRODUCTION SENTINEL/SUBMIT-SURFACE SIMULATION: PASS
```

The simulation explicitly distinguishes paste no-op, copy no-op, copied-content mismatch, terminal-NBSP serialization, stale identity, generation, STOP/HUMAN, duplicate-turn, ambiguous submission, and Send-click failure.

## Remaining boundary

Production target qualification remains **not PASS**. The next target run must use the sentinel/state-transition candidate once. A failure must again be preserved and diagnosed before any repeat.
