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

## Run

Extract the ZIP to any normal folder and execute `RUN_Q15B_LIGHT.ps1` in Windows PowerShell.

Before running, leave exactly one completed ChatGPT conversation tab from the configured Project open. The runner stages the Light files into `C:\Users\usr\Documents\CodexLight`, invokes the Ui.Vision macro, and creates a PASS/FAIL evidence ZIP on the Desktop.

The test does not submit anything to ChatGPT.

## After PASS

Only after target PASS should the production Light watcher be implemented. The production watcher can then add the native low-frequency Ui.Vision sleep/check loop and a small allowlisted action schema while leaving all semantic decisions to Codex.
