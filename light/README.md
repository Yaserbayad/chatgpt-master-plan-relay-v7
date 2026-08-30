# ChatGPT Relay — Light Version

Independent parallel experiment. It does not use or mutate the main Relay v7 runtime state.

## Goal

Minimize Ui.Vision to a browser sensor/actuator and make Codex the semantic orchestrator. The first gate proves the hardest boundary before production logic is built:

```text
completed ChatGPT response
-> Ui.Vision observation
-> local PowerShell bridge
-> one Codex invocation
-> strict nonce-bound structured result
-> Ui.Vision validation
```

## Light Q15-B acceptance

The test passes only when all are true:

1. Exactly one configured-Project ChatGPT conversation tab is bound.
2. ChatGPT is completed (no live `stop-button`).
3. Stable latest user and following assistant message IDs are captured.
4. Full assistant text crosses Ui.Vision -> local bridge and is locally SHA-256 hashed.
5. Codex is invoked exactly once, ephemerally, in read-only sandbox mode.
6. Codex reads a bounded 96-character normalized sample derived from the assistant response and reproduces it exactly.
7. Protocol, nonce, assistant ID, length, hash, sample and action all validate.
8. The ChatGPT browser identity is unchanged after Codex returns.
9. No ChatGPT Send, click, navigation, refresh, OCR, screenshot or Ui.Vision AI action occurs.
10. PASS/FAIL evidence is exported and packaged.

## Target environment reused from proven v7 qualification

- Windows 11 24H2 build 26100.9168
- Chrome 152.0.7977.65
- Ui.Vision 10.0.178
- Desktop Automation/XModules v2 2.0.12
- Project token `g-p-6a9323b61110819182dba0224678aa8b`
- Existing Ui.Vision launcher: `C:\Users\usr\Documents\Codex\ui.vision.html`
- Ui.Vision macros: `C:\Users\usr\Desktop\uivision\macros`

## Current Codex boundary and exact run order

The latest Windows direct preflight reached `codex exec` with `codex-cli 0.151.0` and returned exit code 1 with both stdout and stderr empty. This happened before Q15-B/Ui.Vision started, so it is not evidence of a browser-control failure.

The affected Light source previously passed the prompt as a positional argument from a child PowerShell process while leaving non-TTY stdin implicit. Current Codex `exec` can consume piped stdin as prompt input. The current Light source therefore makes stdin deterministic in both Codex call sites: it invokes `codex exec ... -` and pipes the finite prompt to stdin. The read-only sandbox, ephemeral mode, output schema, timeout, and no-retry rules remain unchanged.

Current next step:

1. Run the current `TEST_CODEX_DIRECT.ps1` from `light/probe` (or the supplied launcher package).
2. If it reports `CODEX_CREDITS_REQUIRED`, stop until Codex entitlement is available.
3. If it reports `CODEX_DIRECT_FAIL`, preserve `CODEX_DIRECT_DIAGNOSTIC_*.txt`; do not start Q15-B or blindly repeat the same run.
4. Continue only if it prints `CODEX_DIRECT_PASS` and exits 0.
5. Then leave exactly one completed ChatGPT conversation tab from the configured Project open and run `RUN_Q15B_LIGHT.ps1` from the same current source set.
6. Accept Q15-B only if the runner produces a PASS evidence ZIP.

`TEST_CODEX_DIRECT.ps1` is browser-independent and read-only. It exists only to prove that the locally authenticated Codex CLI can complete one minimal structured execution before the browser round trip is attempted.

## Q15-B runner

Use the current `light/probe` files together. The runner stages the Light files into `C:\Users\usr\Documents\CodexLight`, invokes the Ui.Vision macro, and creates a PASS/FAIL evidence ZIP on the Desktop.

The test does not submit anything to ChatGPT. A credit-limit failure remains a failed qualification attempt but is classified distinctly so it is not mistaken for a bridge defect.

## After PASS

Only after target PASS should the production Light watcher be implemented. The production watcher can then add the native low-frequency Ui.Vision sleep/check loop and a small allowlisted action schema while leaving all semantic decisions to Codex.
