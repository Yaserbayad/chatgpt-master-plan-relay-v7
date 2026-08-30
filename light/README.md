# ChatGPT Relay — Light Version

Independent parallel experiment. It does not use or mutate the main Relay v7 runtime state.

## Goal

Minimize Ui.Vision to a browser sensor/actuator and make Codex the semantic orchestrator:

```text
completed ChatGPT response
-> Ui.Vision observation
-> local PowerShell transport
-> one bounded Codex model turn
-> strict nonce-bound structured result
-> Ui.Vision validation
```

## Light Q15-B acceptance

The test passes only when all are true:

1. Exactly one configured-Project ChatGPT conversation tab is bound.
2. ChatGPT is completed (no live `stop-button`).
3. Stable latest user and following assistant message IDs are captured.
4. Full assistant text crosses Ui.Vision -> PowerShell and is locally SHA-256 hashed.
5. Codex is invoked exactly once for the model turn, ephemerally, with `--sandbox read-only`.
6. Codex receives only bounded metadata plus a 96-character normalized sample and reproduces it exactly without tools/files.
7. Protocol, nonce, assistant ID, length, hash, sample and action all validate.
8. The ChatGPT browser identity is unchanged after Codex returns.
9. No ChatGPT Send, click, navigation, refresh, OCR, screenshot or Ui.Vision AI action occurs.
10. PASS/FAIL evidence is exported and packaged.

## Target environment

- Windows 11 24H2 build 26100.9168
- Chrome 152.0.7977.65
- Ui.Vision 10.0.178
- Desktop Automation/XModules v2 2.0.12
- Project token `g-p-6a9323b61110819182dba0224678aa8b`
- Existing Ui.Vision launcher: `C:\Users\usr\Documents\Codex\ui.vision.html`
- Ui.Vision macros: `C:\Users\usr\Desktop\uivision\macros`

## Current Codex boundary

Windows target evidence on 2026-08-30 established that `codex-cli 0.151.0` can complete a foreground model-only `codex exec` turn with `sandbox: read-only` and exit 0. The previous Light hidden/headless child path returned exit 1 with empty stdout/stderr. Separate Windows sandbox smoke tests returned exit 1 for default/elevated/unelevated modes.

The current Q15-B candidate therefore stays on the proven model-only boundary:

- Codex is launched through a normal console-backed child PowerShell; `-WindowStyle Hidden` is forbidden.
- Codex stdout/stderr remain attached to that console; the final strict response is read from `--output-last-message`.
- Q15-B no longer asks Codex to read `event.json` or `assistant_probe.txt`. PowerShell supplies only the bounded fields/sample directly as untrusted prompt data.
- Codex is explicitly instructed to use no tools/files.
- `--sandbox read-only`, `--ephemeral`, strict `--output-schema`, timeouts, and no-blind-retry behavior remain.
- `--ignore-user-config` isolates the Relay turn from unrelated user MCP/plugin configuration while normal Codex authentication remains available.
- `model_reasoning_effort="low"` avoids the xhigh overhead observed in the diagnostic control turn.

## Exact run order

1. Run the current `TEST_CODEX_DIRECT.ps1` (or the supplied launcher package).
2. Continue only if it prints `CODEX_DIRECT_PASS` and exits 0.
3. The launcher then runs `RUN_Q15B_LIGHT.ps1` automatically against exactly one completed configured-Project ChatGPT tab.
4. Accept Q15-B only if the runner produces a PASS evidence ZIP and that ZIP is independently verified.

A short-lived PowerShell/Codex console window may appear during each Codex call in this qualification revision. No interaction with it is required.

## After PASS

Only after target PASS should the production Light watcher/actuator be implemented. The production loop remains focused on:

```text
observe completed response -> Codex decision -> stage/send exactly one next prompt -> observe next completion
```
