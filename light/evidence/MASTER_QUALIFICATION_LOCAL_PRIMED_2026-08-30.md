# Light Master Qualification — Primed Input Local Verification 2026-08-30

Status: **LOCALLY VERIFIED PRIMED-INPUT MASTER CANDIDATE — REAL TARGET RUN REQUIRED**.

This record applies only to `light-version`. It does not change or imply main Relay/master-plan state.

## Triggering target evidence

The preceding target run is preserved in:

`light/evidence/MASTER_QUALIFICATION_TARGET_FAIL_2026-08-30_151704.md`

It proved cycle 0 reached the exact production watcher and Codex path, but direct clipboard paste from the initial empty `Start Voice` composer remained `Start Voice` with zero Sends.

That result falsified the preceding locator-vs-snapshot diagnosis as a sufficient cause.

Reinspection of Q08 history exposed the actual qualification boundary:

- Q08 Attempt 5 already failed to prove fresh paste/copy from an empty composer.
- Final Q08 PASS used ordinary trusted typing first, then Ctrl+A/Backspace clear, then Ctrl+V paste, then sentinel-protected copy-back.

Therefore Q08 proved a sequence-qualified rich-editor input path, not an independently working fresh Ctrl+V primitive.

## Current production correction

Every material SEND cycle now requires:

```text
Start Voice
-> trusted click + fixed local ordinary input `x`
-> Send prompt
-> trusted Ctrl+A + Backspace
-> Start Voice
-> clipboard model prompt + trusted Ctrl+V
-> Send prompt
-> nonce-bound sentinel + Ctrl+A/Ctrl+C
-> exact copied prompt
-> one bounded Send
```

New watcher evidence fields:

- `primer_submit_aria`
- `primer_cleared_aria`

The model/Codex prompt remains clipboard-only and is never passed to `uiv.browser.type`. The only ordinary trusted text is the fixed ASCII local primer `x`; all other trusted-input calls are fixed key chords.

The deterministic PowerShell master supervisor independently requires, for each material-send cycle:

```text
baseline_submit_aria=Start Voice
primer_submit_aria=Send prompt
primer_cleared_aria=Start Voice
pasted_submit_aria=Send prompt
copy_sentinel_replaced=true
staged_copy_exact=true
send_click_count=1
submission_confirmed=true
next_completion_observed=true
```

STOP must leave baseline/primer/clear/paste evidence empty and perform zero Send.

## TDD

RED was reproduced against the exact pre-primer watcher with a target-faithful model in which fresh Ctrl+V silently no-ops until the contenteditable editor has accepted ordinary trusted input once.

Observed RED matched the real target failure signature:

```text
STAGE_VERIFY_FAILED: submit surface did not transition to Send prompt; found count=1, aria=Start Voice
```

GREEN after restoring the sequence-qualified Q08 precondition:

```text
LIGHT PRODUCTION CONTRACT TESTS: PASS
LIGHT PRODUCTION PRIMED SENTINEL SIMULATION: PASS
LIGHT MASTER QUALIFICATION STATIC CONTRACT: PASS
LIGHT MASTER QUALIFICATION PRIMED ACCEPTANCE SIMULATION: PASS
```

The simulations additionally reject:

- primer ordinary-type no-op;
- primer clear no-op;
- post-primer paste no-op;
- copy sentinel not replaced;
- copied-content mismatch;
- stale identity;
- generation-time dispatch;
- Send click failure / ambiguous confirmation;
- duplicate source turn;
- wrong conversation/message chain;
- nonce reuse;
- wrong Codex prompt hash;
- double Send;
- early STOP / terminal SEND.

## Persisted implementation/test blobs

```text
0f8112af1f917901baaa8259eb9faf18b42ba817  light/production/LIGHT_PRODUCTION_WATCHER.js
5c2c8e813822355b421970e38abdf3d7a18e195d  light/production/RUN_LIGHT_MASTER_QUALIFICATION.ps1
2490165233cc5904e3731fc6ac4279e7ef29f2ef  light/production/RelayCodexLightProduction.ps1
d06dbdcfb341e443663736fcdc14274c0560b3c3  light/production/LIGHT_PRODUCTION_ACTION.schema.json
cd97aef91c7981fd044b8bcdaaf2b20ddcbe9df0  light/tests/test_production_contract.mjs
3b6b3f3a12d223705894ac0d03a2d549a5ea1a67  light/tests/simulate_production_watcher.mjs
2bedb6996f3122e9bd255a81c336fd06fcae77f8  light/tests/test_master_qualification_harness.mjs
0735fa94fc361c1bd91e1f807a197705bf159461  light/tests/simulate_master_qualification.mjs
685f50997e098821c5c3d5e55236ce7ce3d06ec3  light/PRODUCTION_CONTRACT.md
896655dfe141087a3309b068f53de54337ecd5c1  light/MASTER_QUALIFICATION_CONTRACT.md
```

Local SHA-256 for the changed runtime/test files:

```text
5ebe679aa70c02f315afc0effc84fd46c104b9cb6de97cbd552b99cb7a866493  LIGHT_PRODUCTION_WATCHER.js
9ad5f8e786765cfbb3863bcc831fa92cc81b79835906817c0f6b3ee5ef92ac36  RUN_LIGHT_MASTER_QUALIFICATION.ps1
56d25674ea87cc0e3ff5d29063a37874faeb43fd9e627a69e117865ea1d3ecb3  test_production_contract.mjs
6f4a7aed5fce6b4d287fdf0ff1d484c3e01bab89a06858fc36c5e33ab059f5f1  simulate_production_watcher.mjs
47cd8987d474f04a85c8d09abd2df429658c7920ee05e75a927b64be84ffc955  test_master_qualification_harness.mjs
3c0fce029fcb7373494dad94a3ca2b89e5a15f16ae7793d89b0088094c9170af  simulate_master_qualification.mjs
```

Each returned Git content blob exactly matched `git hash-object` for the locally tested file.

## Review

- Correctness: the change restores the exact state ordering present in the final Q08 target-PASS diagnostic and adds explicit checks at every transition.
- Security/trust: model/browser/user text still never enters ordinary trusted typing; only fixed `x` and fixed key chords do.
- Architecture: Codex remains semantic only, Ui.Vision mechanical only, PowerShell supervisor/transport only.
- Safety: one-Send maximum, pre-click `SEND_AMBIGUOUS`, exact confirmation, and no automatic retry remain unchanged.
- Scope: no fresh-chat, Chrome restart, OCR, screenshot, Ui.Vision AI, page eval, generic coordinates, API billing, or main-project mutation added.

## Remaining proof boundary

The primed-input causal explanation is **SUPPORTED but not yet target-CONFIRMED**. A real target master run must prove the new primer and clear fields before any claim that the production/same-chat soak path is qualified.
