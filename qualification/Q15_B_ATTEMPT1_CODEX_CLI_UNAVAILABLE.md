# Q15-B Attempt 1 — Codex CLI unavailable preflight

Date: 2026-08-30

## Result

`PROVEN_PRE_PROBE_FAILURE`

The user launched `Q15_B_INSTALL_AND_RUN.ps1` on the target Windows environment. The launcher stopped at its initial Codex CLI preflight with:

```text
Codex CLI was not found in PATH.
```

## Safety interpretation

- UI.Vision Q15-B probe was not launched.
- No ChatGPT browser action occurred.
- No Send/Submit, typing, refresh, navigation, or fresh-chat action occurred.
- No Codex invocation occurred.
- No project-state mutation occurred as part of the probe.
- Rerun is safe after the local Codex CLI prerequisite is installed/authenticated and resolvable.

## Root cause

The current target Windows environment does not expose a local `codex` CLI command to PowerShell. Q15-B requires the locally authenticated Codex CLI because the qualified candidate IPC path is UI.Vision -> local bridge -> `codex exec` -> local bridge -> UI.Vision.

This is a missing target prerequisite, not evidence that the Q15-B IPC architecture failed.
