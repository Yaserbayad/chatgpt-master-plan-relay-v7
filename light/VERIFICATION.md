# Light Version Verification

## Q15-B bridge qualification

Status: **VERIFIED TARGET PASS**.

Durable evidence: `light/evidence/Q15B_2026-08-30.md`

Accepted Q15-B source revision: `3562b6090c3ad1c8663d4f1fcc6cb506269051d1`

Q15-B proves the target Codex execution primitive used by Light: one locally authenticated `codex-cli 0.151.0` console-backed, ephemeral, no-tool, read-only, structured, nonce-bound turn with exit 0 and post-Codex browser identity revalidation. It does not by itself prove repeated normal-production semantic decisions.

## Production watcher history

Production is **not yet target-PASS**.

Durable evidence includes:

- `light/evidence/PRODUCTION_LOCAL_2026-08-30.md`
- `light/evidence/PRODUCTION_TARGET_FAIL_2026-08-30_122613.md`
- `light/evidence/PRODUCTION_TARGET_FAIL_2026-08-30_123922.md`
- `light/evidence/PRODUCTION_TARGET_FAIL_2026-08-30_140440.md`
- `light/evidence/PRODUCTION_TARGET_PREFLIGHT_FAIL_2026-08-30_142107.md`

The prior target attempts established these reusable corrections:

1. finder snapshots are not authoritative staged-text proof;
2. the Q09 selector-only diagnosis was falsified by target evidence;
3. the target-proven Q08 contract is required: `Start Voice -> Send prompt`, unique copy sentinel before Ctrl+C, sentinel replacement, exact copied text with only terminal-NBSP normalization;
4. the target runner must create its own macro staging directory rather than require it to pre-exist;
5. no failed/ambiguous material Send is automatically retried.

The current production watcher preserves the Q08 sentinel/submit-surface contract, strict identity/nonce binding, one-Send maximum, pre-click `SEND_AMBIGUOUS`, exact submission confirmation, and following stable-completion requirement.

## Master qualification / same-chat soak

Status: **LOCALLY VERIFIED MASTER CANDIDATE — ONE REAL TARGET RUN REQUIRED**.

Preferred next qualification path:

`light/production/RUN_LIGHT_MASTER_QUALIFICATION.ps1`

Contract:

`light/MASTER_QUALIFICATION_CONTRACT.md`

Local evidence:

`light/evidence/MASTER_QUALIFICATION_LOCAL_2026-08-30.md`

The master harness replaces the normal sequence of one-off target test followed by a separate soak. It performs one bounded seven-cycle run:

- cycle 0: deterministic forced seed `SEND_PROMPT` to prove the complete target mechanical path and establish a controlled handshake;
- cycles 1-5: **normal production mode**; Codex must independently choose `SEND_PROMPT` and return exactly `LIGHT_SOAK_01` through `LIGHT_SOAK_05` from the preceding ChatGPT assistant state;
- cycle 6: **normal production mode**; Codex must choose `STOP` when the assistant explicitly declares the objective complete.

Total successful run:

- 7 Codex turns;
- 6 bounded safe material Sends;
- 5 normal-production semantic SEND decisions;
- 1 normal-production terminal STOP decision.

PowerShell remains a deterministic supervisor/test oracle only. It does not decide semantics and does not perform ChatGPT browser actions.

### Master safety and proof rules

Every SEND cycle requires:

- same conversation and exact user/assistant ID chain;
- unique nonce;
- expected source assistant SHA-256;
- bridge/Codex exit 0;
- exact expected Codex action and prompt SHA-256;
- browser identity revalidated;
- `Start Voice -> Send prompt` transition;
- nonce-bound copy sentinel replaced;
- exact staged copy;
- exactly one Send click;
- exact new-user-message confirmation;
- following stable assistant completion.

The terminal cycle requires `STOP`, empty prompt hash, zero Send clicks, no submission and no next-completion wait.

Qualification-only bridge guards validate expected source identity/hash before Codex and expected action/prompt hash after Codex but before returning an actionable result to Ui.Vision. Therefore a wrong semantic Codex output fails before staging or Send. These guards are inactive in normal production unless `master_qualification_mode=true`.

The master harness stops at the first failure and never retries a failed or ambiguous material action. Partial evidence is preserved.

### Current master source binding

```text
8328f06495b83c2f263b26e6e9f335d8df426aa5  light/production/LIGHT_PRODUCTION_WATCHER.js
2490165233cc5904e3731fc6ac4279e7ef29f2ef  light/production/RelayCodexLightProduction.ps1
d06dbdcfb341e443663736fcdc14274c0560b3c3  light/production/LIGHT_PRODUCTION_ACTION.schema.json
09f513ce062387669c21c09d9f02dab6bb4009be  light/production/RUN_LIGHT_MASTER_QUALIFICATION.ps1
dc45da6fc711e4d429f31d92041bb8fb766a124d  light/MASTER_QUALIFICATION_CONTRACT.md
add4d4c45cf467a74240c058860ba05b88b0b03f  light/tests/test_production_contract.mjs
f60d602a4ee27a8a4c87782dc8b9272237e8dd74  light/tests/simulate_production_watcher.mjs
ea9d2c1b6d3c43f11c33607d6c3fd05f8038d544  light/tests/test_master_qualification_harness.mjs
767447fc550346fd9a1ef503d427c84ca50e6335  light/tests/simulate_master_qualification.mjs
```

### Fresh local verification

```text
node light/tests/test_production_contract.mjs
LIGHT PRODUCTION CONTRACT TESTS: PASS

node light/tests/simulate_production_watcher.mjs
LIGHT PRODUCTION SENTINEL/SUBMIT-SURFACE SIMULATION: PASS

node light/tests/test_master_qualification_harness.mjs
LIGHT MASTER QUALIFICATION STATIC CONTRACT: PASS

node light/tests/simulate_master_qualification.mjs
LIGHT MASTER QUALIFICATION ACCEPTANCE SIMULATION: PASS
```

The master adversarial simulation independently rejects conversation drift, user/assistant chain breaks, nonce reuse, wrong source assistant state, wrong Codex prompt hash, staging transition failure, sentinel failure, double Send, early STOP, terminal SEND and terminal completion wait.

The local execution environment has no Windows PowerShell/real Chrome+Ui.Vision target, so no target PASS is claimed from these local results.

## Remaining acceptance boundary

Run the packaged master qualification once against exactly one completed configured-Project ChatGPT conversation with an empty composer showing `Start Voice`. Do not interact with ChatGPT during the run.

A genuine master PASS requires all seven target cycles and the returned evidence ZIP to verify independently. After that PASS, the current same-chat production path **and bounded reliability soak** are qualified. Fresh-chat/recovery remains the next separate major stage.

The older one-off production target runner remains available only as a focused diagnostic fallback; the master harness is the preferred qualification path.
