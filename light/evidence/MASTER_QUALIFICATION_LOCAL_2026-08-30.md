# Light Master Qualification / Same-Chat Soak — Local Verification 2026-08-30

Status: **LOCALLY VERIFIED MASTER CANDIDATE — REAL WINDOWS/CHROME TARGET RUN REQUIRED**.

This evidence applies only to the independent `light-version` project. It does not modify or imply main Relay/master-plan state.

## Why Codex is eligible for this qualification

The prerequisite Codex execution primitive is already target-proven by `light/evidence/Q15B_2026-08-30.md`.

Q15-B independently verified on the real Windows/Chrome/Ui.Vision target that `codex-cli 0.151.0` can execute one console-backed, ephemeral, no-tool, read-only, structured, nonce-bound turn with exit 0, strict returned identity validation, and post-Codex browser identity revalidation.

That proof is intentionally narrower than the new master qualification. It does **not** prove repeated normal-production semantic decisions. The master harness is designed to prove those decisions rather than assume them.

## Master qualification design

Contract: `light/MASTER_QUALIFICATION_CONTRACT.md`

One PowerShell launch executes seven serial cycles in one configured-Project ChatGPT conversation:

1. cycle 0: forced deterministic seed `SEND_PROMPT` to establish the controlled handshake and prove the complete browser material path;
2. cycles 1-5: normal production mode; Codex must independently choose `SEND_PROMPT` and return exactly `LIGHT_SOAK_01` through `LIGHT_SOAK_05` according to the preceding ChatGPT assistant instruction;
3. cycle 6: normal production mode; Codex must independently choose `STOP` when the assistant declares the objective complete.

Total target behavior if all cycles pass:

- 7 Codex turns;
- 6 material Sends;
- 5 normal-production semantic SEND decisions;
- 1 normal-production terminal STOP decision.

The deterministic PowerShell supervisor is the test oracle. It never decides project semantics and never performs ChatGPT browser actions directly.

## Qualification-only semantic safety guards

`RelayCodexLightProduction.ps1` now accepts opt-in `master_qualification_mode` expectations:

- expected conversation ID;
- expected source user message ID;
- expected source assistant message ID;
- expected source assistant SHA-256;
- expected Codex action;
- expected Codex prompt SHA-256.

During master qualification, source identity/hash expectations are checked before Codex execution. Codex action and prompt hash are checked after Codex execution but before an actionable bridge result is returned to Ui.Vision. A wrong semantic answer therefore fails before prompt staging or Send.

When `master_qualification_mode` is absent/false, normal production behavior is unchanged.

## Exact implementation source binding

Implementation revision before this evidence record:

`cdc87a55be2bd45dbb2b4052ac89ccf3544bf7ac`

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
b253cc94a20f3f124242ff8131c8486389e655d4  light/evidence/Q15B_2026-08-30.md
```

Local SHA-256 values for the changed/new source and tests:

```text
acf0461cc526044e45f105abfd6ad54ff5d9b3676dd81aff4944ceb38b4a9879  LIGHT_PRODUCTION_WATCHER.js
81c4aebc94a168191e243ca78db241f4a24679a5bf77983c312affbd41df3404  RelayCodexLightProduction.ps1
94a3d54c2454da5d808e5e571e30465ec2950006b0dbd505c8eff987f356953e  RUN_LIGHT_MASTER_QUALIFICATION.ps1
fb282a6d51b0326123fac067ac7dcf64cf79864818b051940a3cfe4965db5547  MASTER_QUALIFICATION_CONTRACT.md
32917fb758919e27f7101448dce240c111c7f14fefe940b20dba8e2dbc345525  test_production_contract.mjs
9b1a07bccc3e7b55b51ed3b69a9f8933328fef6fa7d70ea2503c4dc4a4eef70a  simulate_production_watcher.mjs
d39e00f3ba3722b757a79f057d6dc3968738d658cb4311f602c98fe3a25e1725  test_master_qualification_harness.mjs
0ee153172aea09a3cd0e4c7914e401e4ee63e4aa257a434362b952fa98a344e9  simulate_master_qualification.mjs
```

The Git blob IDs above were reread/persisted and exactly match `git hash-object` for the locally tested bytes.

## TDD evidence

RED before implementation:

- the exact pre-change watcher failed the new requirement because `bridge_prompt_sha256` was absent;
- the pre-change candidate had no `RUN_LIGHT_MASTER_QUALIFICATION.ps1`, so the master static contract could not pass.

GREEN after implementation:

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

All relevant JavaScript syntax checks also passed.

## Master adversarial acceptance coverage

The master acceptance simulation proves the deterministic validator rejects each of these independently:

1. conversation drift;
2. user-message chain break;
3. assistant-message chain break;
4. nonce reuse;
5. wrong expected source-assistant semantic state/hash;
6. wrong Codex prompt/token hash;
7. staging submit-surface transition failure;
8. clipboard sentinel failure;
9. double Send;
10. early STOP;
11. terminal SEND instead of STOP;
12. terminal cycle incorrectly waiting for another completion.

Existing production simulation remains green for generation gating, Q08 sentinel staging, terminal-NBSP normalization, stale identity, click failure, ambiguous submission, STOP/HUMAN, duplicate-turn rejection, one-Send bound, and no automatic retry.

## Security / separation review

- Codex output remains untrusted and schema/identity-bound.
- Wrong master-qualification semantic output is blocked before Ui.Vision can stage/click it.
- Model-generated prompt text never enters the trusted-key parser.
- PowerShell supervisor contains no Ui.Vision/browser click/type control.
- No OpenAI API path was added.
- No fresh-chat, Chrome restart, OCR, screenshot, Ui.Vision AI, page-world eval, or generic coordinate behavior was added.
- No main-branch or main-project authority is touched.

## Local execution limitation

The local verification environment has Node.js but no Windows PowerShell runtime and no real target Chrome/Ui.Vision session. Therefore this evidence does **not** claim that `RUN_LIGHT_MASTER_QUALIFICATION.ps1` has executed successfully on Windows.

## Remaining acceptance boundary

Run the packaged master harness once on the target Windows/Chrome/Ui.Vision environment with exactly one completed configured-Project ChatGPT conversation and an empty composer.

A genuine master PASS requires all seven target cycles to satisfy the exact contract and the returned evidence bundle to verify independently. Any first failure stops without retry and preserves partial evidence.

After independently verified master PASS, the current same-chat production path plus bounded reliability soak are qualified. Fresh-chat/recovery remains the next separate major stage.
