# ChatGPT Relay — Light Version

Independent parallel experiment. It does not use or mutate the main Relay v7 runtime state.

## Architecture

```text
ChatGPT Web
-> Ui.Vision minimal watcher/actuator
-> local PowerShell transport
-> one bounded Codex semantic turn
-> strict nonce/identity-bound structured action
-> Ui.Vision mechanical actuator
```

Responsibility remains deliberately split:

- **Codex:** semantic interpretation, next-action selection, prompt generation, and later recovery/fresh-chat/human decisions.
- **Ui.Vision:** browser observation plus exact allowlisted mechanical input only.
- **PowerShell:** IPC, hashing, process/timeout handling, schema/identity validation only.

Chrome-only. No OpenAI API billing. No Chrome restart/crash recovery scope.

## Q15-B bridge gate — VERIFIED PASS

Q15-B was target-qualified on 2026-08-30 with Windows 11 build 26100.9168, Chrome 152.0.7977.65, Ui.Vision 10.0.178, Desktop Automation/XModules 2.0.12, and `codex-cli 0.151.0`.

Independent evidence verification is recorded in:

`light/evidence/Q15B_2026-08-30.md`

The accepted Q15-B proves the read-only round trip:

```text
completed ChatGPT response
-> Ui.Vision observation
-> PowerShell
-> one console-backed no-tool Codex turn
-> strict structured result
-> Ui.Vision validation/revalidation
```

Production implementation is therefore ungated by Q15-B.

## First production increment

The frozen contract is `light/PRODUCTION_CONTRACT.md`.

The current first-increment candidate implements the smallest same-chat loop:

```text
observe new stable completed assistant turn
-> one Codex decision
-> SEND_PROMPT | STOP | HUMAN
-> exact pre-action browser identity revalidation
-> for SEND_PROMPT, stage and send at most one message
-> confirm the new user message
-> observe the following completed assistant turn
```

Important safety/mechanical properties:

- low-frequency polling and two-snapshot completion stability;
- no dispatch while ChatGPT is generating;
- durable dedupe for handled/ambiguous source turns;
- strict nonce/conversation/message binding;
- model-generated prompt text never enters the trusted-key parser: it is clipboard-staged and pasted with only the constant `${KEY_CTRL+KEY_V}` trusted key chord;
- exact staged-text verification before Send;
- `SEND_AMBIGUOUS` is persisted before the one material Send click, preventing automatic duplicate submission after a crash/ambiguous result;
- no automatic Send retry;
- no OCR, screenshots, Ui.Vision AI, page-world eval, generic coordinate workflow, or fresh-chat behavior in this increment.

Local static and simulation verification is recorded in:

`light/evidence/PRODUCTION_LOCAL_2026-08-30.md`

## Current target boundary

The production watcher/actuator is **locally verified but not yet target-PASS**.

`light/production/RUN_LIGHT_PRODUCTION_TARGET.ps1` performs a bounded real-browser qualification. It may send exactly one fixed safe message:

```text
Reply exactly LIGHT_PRODUCTION_TARGET_OK.
```

PASS requires target evidence proving one Send click, exact submission confirmation, and observation of the following stable completed assistant turn. Any ambiguous material submission stops without retry.

After independent verification of a production target PASS, the next stage is a bounded same-chat reliability/soak test. Fresh-chat/recovery behavior remains deferred until that soak passes.
