# Light Production Watcher — Local Verification 2026-08-30

Status: **locally verified target candidate; real-browser production target evidence required**.

This record applies only to `light-version`. It does not alter or imply main-project state.

## Preconditions

- Q15-B target qualification is independently verified PASS in `light/evidence/Q15B_2026-08-30.md`.
- Production contract is frozen in `light/PRODUCTION_CONTRACT.md`.
- First target increment is same-chat only and permits at most one material Send.

## Persisted source binding

The locally tested bytes are bound to these Git blobs on `light-version`:

```text
d06dbdcfb341e443663736fcdc14274c0560b3c3  light/production/LIGHT_PRODUCTION_ACTION.schema.json
a886399ebc2895351c679f1b30ccd524f1b84a56  light/production/LIGHT_PRODUCTION_WATCHER.js
ea7878a8b9849d9aa2f1fbd822004d0bfb6fafb4  light/production/RUN_LIGHT_PRODUCTION_TARGET.ps1
3fb41fe1ef6f4ac6f0ade600858d700c49d19aaf  light/production/RelayCodexLightProduction.ps1
99aa8817326841c8ca8fee2acf72b76179523b9d  light/tests/test_production_contract.mjs
1d20f052f667d5c05b4914d41947d257553f6d50  light/tests/simulate_production_watcher.mjs
```

Local SHA-256 values for the corresponding production/test artifacts before packaging:

```text
b368b9dff2fd8c5ac8ed6c611e3f7561181b432a79dce9ea51d9da1ae4368f4c  LIGHT_PRODUCTION_ACTION.schema.json
7a653abf3517756e61759f8918c97df5fc2000a049031a5a7460d26eb8f031f1  LIGHT_PRODUCTION_WATCHER.js
26814afa20b19849aed404cf9d3cd836ccc57a2c1c49d16aad3c16f8aa7d43c9  RUN_LIGHT_PRODUCTION_TARGET.ps1
071cf5e7071e242e76476ba0e740c190482c75e4577c712cd4dbad39a2c00619  RelayCodexLightProduction.ps1
25870e70f3126ee1fe5358465f0f51b01e22c72ef79fdec2e8294a12a4ff0f7a  test_production_contract.mjs
```

The simulation source differs from the earlier pre-persistence SHA-256 only by removal of one blank line so its bytes match the persisted Git blob; the tests were rerun after that reconciliation.

## Verification performed

```text
node light/tests/test_production_contract.mjs
LIGHT PRODUCTION CONTRACT TESTS: PASS

node light/tests/simulate_production_watcher.mjs
LIGHT PRODUCTION WATCHER SIMULATION: PASS

node --check light/production/LIGHT_PRODUCTION_WATCHER.js
PASS (exit 0)
```

The local Linux execution environment does not contain `pwsh`, so PowerShell runtime syntax/execution is not claimed from local evidence. The exact PowerShell candidate must be exercised by the Windows target runner before production PASS can be accepted.

## Behavior proven by simulation/static tests

- No dispatch while the ChatGPT stop button indicates generation.
- Two stable identical completed snapshots are required before dispatch.
- One bridge event is emitted for one new completed assistant turn.
- A persisted `SENT_CONFIRMED` or `SEND_AMBIGUOUS` source turn is rejected before Codex.
- Returned nonce/conversation/assistant identity is checked before material action.
- `SEND_PROMPT`, `STOP`, and `HUMAN` are the only action values.
- STOP and HUMAN perform no material browser action.
- The model-generated prompt is never passed to `uiv.browser.type`; prompt text is staged through clipboard and only the constant `${KEY_CTRL+KEY_V}` paste chord enters trusted typing.
- The staged composer text is reacquired and must exactly equal the prompt before Send.
- Source conversation/user/assistant IDs and texts are reacquired and revalidated before Send.
- At most one Send click is possible in this target increment.
- `SEND_AMBIGUOUS` is persisted before the material Send click, closing the crash/retry window.
- Successful submission requires a new user message with exact staged prompt text.
- Ambiguous confirmation and simulated Send-click exception perform no automatic retry and retain `SEND_AMBIGUOUS`.
- Success requires observation of the following stable completed assistant turn.
- No OCR, screenshots, Ui.Vision AI, page-world eval, generic coordinate action, `FRESH_CHAT`, or Chrome restart logic exists in the watcher.
- Codex remains a console-backed, no-tool, ephemeral, `--sandbox read-only`, strict-schema semantic turn; PowerShell remains transport/validation only.

## Persistence reconciliation finding

Byte-level source binding caught a two-byte mismatch in the first persisted target runner. Inspection showed the PowerShell URL-normalization regex had been persisted with a single regex backslash instead of the tested double-backslash literal matcher. The repository copy was corrected and reread; Git blob `ea7878a8b9849d9aa2f1fbd822004d0bfb6fafb4` now exactly matches the locally tested runner. This correction happened before target packaging or execution.

## Remaining acceptance boundary

The first production watcher/actuator is **not target-PASS yet**. Run the bounded Windows/Chrome target package once. The runner may send exactly one fixed safe prompt, `Reply exactly LIGHT_PRODUCTION_TARGET_OK.`, and accepts PASS only when target evidence proves:

1. the bridge and Codex return exit 0;
2. pre-action browser identity is revalidated;
3. exactly one Send click occurs;
4. the new user message exactly confirms the staged safe prompt;
5. the following assistant turn reaches a stable completed state;
6. a PASS/FAIL evidence ZIP is produced for independent verification.

No blind rerun is authorized after a target failure; diagnose the returned evidence first.
