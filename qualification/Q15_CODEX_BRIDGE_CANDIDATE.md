# Q15 Codex Watcher / IPC Candidate

**Status:** CANDIDATE ONLY — target evidence still required; Q15 remains `TODO`.

## Purpose

Qualify the critical Relay bridge before production watcher development:

```text
ChatGPT completed response
→ UI.Vision read-only watcher event
→ local PowerShell IPC bridge
→ one read-only ephemeral `codex exec`
→ strict nonce-bound structured result
→ UI.Vision validation and browser-state revalidation
```

The same macro retains the original Q15 low-resource requirement: one bounded observation, approximately ten minutes of `uiv.sleep`, then the next bounded observation. Codex is not invoked until after that wait.

## Candidate files

- `qualification/Q15_CODEX_BRIDGE_PROBE.js`
- `qualification/RelayCodexBridge.ps1`
- `qualification/Q15_CODEX_PROBE_OUTPUT.schema.json`
- `qualification/Q15_CODEX_BRIDGE_RUN.ps1`

## Target bindings reused from prior PASS evidence

- Windows user/path set already used by Phase Q: `C:\Users\usr\...`
- UI.Vision `10.0.178`
- configured ChatGPT Project token `g-p-6a9323b61110819182dba0224678aa8b`
- Chrome/UI.Vision launcher and macro paths from the existing Q15 runner
- Q07 stable message-ID/completion observation model
- Q08 clipboard path
- XModule/XRun external-script boundary

## Safety / failure behavior

The candidate test performs no ChatGPT Send, click, fresh-chat navigation, refresh, OCR, image, or browser-AI action.

It performs exactly one Codex model invocation after the ten-minute wait. The Codex process is constrained to:

- `codex exec`
- `--ephemeral`
- `--skip-git-repo-check`
- `--sandbox read-only`
- strict `--output-schema`
- a 900-second hard process deadline with process-tree termination on timeout
- no automatic retry

The assistant response is transported locally and hashed, but the qualification prompt explicitly tells Codex not to read the full `assistant.txt`; Codex reads only event metadata. This minimizes qualification token use while still proving that the full response crossed the UI.Vision→bridge boundary.

Stale/corrupt results fail closed through exact nonce, assistant message ID, text length, and assistant-text SHA-256 checks, followed by current browser conversation/user/assistant identity revalidation after Codex returns.

## Local verification performed before target delivery

The final package was freshly rebuilt and verified after all hardening changes:

- ZIP integrity: PASS
- `node --check Q15_CODEX_BRIDGE_PROBE.js`: PASS
- structural contract test: PASS
- simulated successful UI.Vision bridge round trip: PASS
- simulated stale-nonce response: correctly rejected

Local/package SHA-256 values:

```text
2d90375a8cbb3695a0b04c67d7842c17658f9f6df261ffe493d3815efedbb2b2  Q15_CODEX_BRIDGE_PROBE.js
b2f4e1a0dbd944296b05cc62229ec2a7422a13c9dd70f1d321a08a4279d59ab6  RelayCodexBridge.ps1
6544fb225804be93895a60c862d7571b8f8cacacfb03d3916c5f16cd5fba2588  Q15_CODEX_PROBE_OUTPUT.schema.json
8a9ed59fef1821adf09dc3adcdfb591ec567aa3ad668471d735ba7b2feb4a849  Q15_CODEX_BRIDGE_RUN.ps1
93d4e64164234728c4f5642a5cfa5020de55c28a79137667fc49fd2de8e32439  Q15_CODEX_WATCHER_TESTER.zip
```

## Verification limitation

The current execution environment does not provide the user's Windows PowerShell/UI.Vision/Codex desktop runtime. Therefore no claim is made that Q15 passes. The candidate must run on the actual target machine and produce the runner's evidence ZIP. Only that target evidence can satisfy the amended Q15 acceptance criteria and justify `Q15 → PASS`.
