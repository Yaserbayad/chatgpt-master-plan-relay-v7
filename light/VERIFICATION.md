# Light Version Verification

## Q15-B bridge qualification

Status: **VERIFIED TARGET PASS**.

Durable evidence: `light/evidence/Q15B_2026-08-30.md`

Q15-B proves the target Codex execution primitive used by Light: locally authenticated `codex-cli 0.151.0`, console-backed, ephemeral, no-tool, read-only, structured, nonce-bound, exit 0, with post-Codex browser identity revalidation. It does not by itself prove repeated normal-production semantic decisions.

## Production / master same-chat qualification

Status: **PRIMED-INPUT CANDIDATE LOCALLY VERIFIED — REAL TARGET PASS REQUIRED**.

Production and the bounded same-chat soak are **not target-PASS yet**.

Preferred qualification path:

`light/production/RUN_LIGHT_MASTER_QUALIFICATION.ps1`

Contracts:

- `light/PRODUCTION_CONTRACT.md`
- `light/MASTER_QUALIFICATION_CONTRACT.md`

Latest local evidence:

`light/evidence/MASTER_QUALIFICATION_LOCAL_PRIMED_2026-08-30.md`

### Preserved target evidence

Key evidence records include:

- `light/evidence/PRODUCTION_TARGET_FAIL_2026-08-30_122613.md`
- `light/evidence/PRODUCTION_TARGET_FAIL_2026-08-30_123922.md`
- `light/evidence/PRODUCTION_TARGET_FAIL_2026-08-30_140440.md`
- `light/evidence/PRODUCTION_TARGET_PREFLIGHT_FAIL_2026-08-30_142107.md`
- `light/evidence/MASTER_QUALIFICATION_TARGET_FAIL_2026-08-30_150220.md`
- `light/evidence/MASTER_QUALIFICATION_TARGET_FAIL_2026-08-30_151704.md`

### Current diagnosis

The latest target run (`151704`) verified cycle-0 Codex action/prompt, source identity and browser revalidation, but trusted Ctrl+V from the initial empty composer produced:

```text
baseline_submit_aria=Start Voice
pasted_submit_aria=Start Voice
send_click_count=0
```

The exact composer locator was used, yet Ui.Vision still resolved the trusted click to the composer `div` and the failure signature was unchanged. Therefore the preceding locator-vs-snapshot diagnosis is **falsified as the sufficient cause**.

Reinspection of main Q08 evidence exposed the actual qualification boundary:

- Q08 Attempt 5 already failed to prove fresh paste/copy from an empty composer.
- Final Q08 PASS first used ordinary trusted typing, verified `Start Voice -> Send prompt`, cleared with Ctrl+A/Backspace and verified `Send prompt -> Start Voice`, then used Ctrl+V and observed `Start Voice -> Send prompt`, followed by sentinel-protected copy-back.

Therefore Q08 target-qualified the sequence:

```text
ordinary trusted input -> clear -> clipboard paste -> sentinel copy-back
```

It did not prove that direct fresh Ctrl+V works independently from the initial `Start Voice` state.

### Current correction

Every material SEND cycle now proves:

```text
Start Voice
-> fixed local trusted `x`
-> Send prompt
-> Ctrl+A + Backspace
-> Start Voice
-> clipboard model prompt + Ctrl+V
-> Send prompt
-> unique copy sentinel + Ctrl+A/Ctrl+C
-> exact staged copy
-> one bounded Send
```

The watcher exports:

- `baseline_submit_aria`
- `primer_submit_aria`
- `primer_cleared_aria`
- `pasted_submit_aria`
- `copy_sentinel_replaced`
- `staged_copy_exact`

The PowerShell master supervisor independently validates the entire transition sequence for every material-send cycle. STOP must leave all primer/paste fields untouched.

The primer is exactly the fixed local ASCII string `x`. Model-generated/user/browser text remains clipboard-only and never enters `uiv.browser.type`.

### Master seven-cycle acceptance

One successful master run requires:

- cycle 0: deterministic forced seed SEND;
- cycles 1-5: normal production Codex independently chooses exact `LIGHT_SOAK_01` through `LIGHT_SOAK_05`;
- cycle 6: normal production Codex chooses terminal `STOP`.

Total successful target run:

- 7 Codex turns;
- 6 bounded material Sends;
- 5 normal-production semantic SEND decisions;
- 1 normal-production STOP decision.

For each SEND cycle the supervisor independently requires correct conversation/message chain, unique nonce, source hash, Codex exit/action/prompt hash, browser identity, primed input transitions, sentinel/exact staged copy, exactly one Send, exact submission confirmation and following stable assistant completion.

A wrong semantic Codex output is rejected by qualification-only bridge guards before Ui.Vision receives an actionable result.

### Current implementation/test blobs

```text
0f8112af1f917901baaa8259eb9faf18b42ba817  light/production/LIGHT_PRODUCTION_WATCHER.js
5c2c8e813822355b421970e38abdf3d7a18e195d  light/production/RUN_LIGHT_MASTER_QUALIFICATION.ps1
2490165233cc5904e3731fc6ac4279e7ef29f2ef  light/production/RelayCodexLightProduction.ps1
d06dbdcfb341e443663736fcdc14274c0560b3c3  light/production/LIGHT_PRODUCTION_ACTION.schema.json
685f50997e098821c5c3d5e55236ce7ce3d06ec3  light/PRODUCTION_CONTRACT.md
896655dfe141087a3309b068f53de54337ecd5c1  light/MASTER_QUALIFICATION_CONTRACT.md
cd97aef91c7981fd044b8bcdaaf2b20ddcbe9df0  light/tests/test_production_contract.mjs
3b6b3f3a12d223705894ac0d03a2d549a5ea1a67  light/tests/simulate_production_watcher.mjs
2bedb6996f3122e9bd255a81c336fd06fcae77f8  light/tests/test_master_qualification_harness.mjs
0735fa94fc361c1bd91e1f807a197705bf159461  light/tests/simulate_master_qualification.mjs
```

### Fresh local verification

```text
node --check light/production/LIGHT_PRODUCTION_WATCHER.js
PASS

node light/tests/test_production_contract.mjs
LIGHT PRODUCTION CONTRACT TESTS: PASS

node light/tests/simulate_production_watcher.mjs
LIGHT PRODUCTION PRIMED SENTINEL SIMULATION: PASS

node light/tests/test_master_qualification_harness.mjs
LIGHT MASTER QUALIFICATION STATIC CONTRACT: PASS

node light/tests/simulate_master_qualification.mjs
LIGHT MASTER QUALIFICATION PRIMED ACCEPTANCE SIMULATION: PASS
```

The primed-input root-cause explanation remains **SUPPORTED, not target-CONFIRMED** until the next real master run proves the new primer/clear/paste fields.

## Remaining acceptance boundary

Run the replacement master package once against exactly one completed configured-Project ChatGPT conversation with an empty composer showing `Start Voice`. Do not interact with ChatGPT during the run.

Any failure stops at the first boundary with no automatic retry and preserves evidence. A genuine master PASS requires all seven target cycles and independent verification of the returned evidence bundle.

After master PASS, the current same-chat production path plus bounded reliability soak are qualified. **Fresh-chat/recovery remains the next separate major stage.**
