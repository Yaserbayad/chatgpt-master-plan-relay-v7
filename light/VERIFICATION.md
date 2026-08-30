# Light Version Q15-B — Candidate Verification

Status: **locally verified source candidate; target Windows runtime evidence required**.

## Target evidence received 2026-08-30

The Windows diagnostic established:

- OS: Windows build 26100; PowerShell 5.1.26100.9168.
- Codex: `codex-cli 0.151.0` at the native Codex executable path.
- Foreground model-only `codex exec` with `sandbox: read-only`: **PASS**, exit 0, returned `CODEX_FOREGROUND_OK`.
- The foreground turn selected `gpt-5.6-sol`, xhigh reasoning, and consumed 17,602 tokens.
- A Cloudflare MCP OAuth `AuthRequired` error appeared but was non-fatal to the model turn.
- Direct Windows sandbox smoke tests returned exit 1 for default, elevated, and unelevated modes.
- The previous hidden/headless Light direct preflight returned exit 1 with no stdout/stderr.
- The later explicit-stdin hidden/headless preflight reproduced the same silent exit 1.
- Q15-B / Ui.Vision had not started during those failed preflights.

These facts rule out Codex installation, account/model availability, and the explicit-stdin hypothesis as the cause of the preflight failure. They do **not** prove the Windows sandbox helper is usable for Codex tool execution.

## Candidate correction

This revision deliberately targets only the proven working boundary:

1. Remove `-WindowStyle Hidden` from the Codex child path. A normal console-backed child PowerShell launches Codex; stdout/stderr remain attached to that console.
2. Keep bounded hard timeouts: 120 seconds for direct preflight and 600 seconds for Q15-B Codex.
3. Read only the final schema-bound result from `--output-last-message`; do not capture Codex stdout/stderr through headless pipes.
4. Keep `--ephemeral`, `--skip-git-repo-check`, `--sandbox read-only`, and `--output-schema`.
5. Add `--ignore-user-config` so this isolated Relay turn does not load unrelated user MCP/plugin config; normal `CODEX_HOME` authentication remains in use.
6. Force `model_reasoning_effort="low"` to avoid the xhigh overhead observed in the foreground diagnostic.
7. Remove Codex local file/tool use from Q15-B. PowerShell computes the full-response length/hash and sends only nonce, assistant ID, length, SHA-256, and the bounded 96-character normalized sample directly as untrusted prompt data.
8. Codex is explicitly instructed to use no tools/files and must return the same strict result schema.
9. Prompt transport remains explicit finite stdin (`codex exec ... -`); the target evidence showed stdin itself was not the failing boundary.

## Local verification

- `node --check Q15B_LIGHT_PROBE.js`: PASS.
- Light static contract suite: PASS.
- Q15-B success simulation: PASS.
- stale-nonce simulation: correctly rejected.
- credit-limit simulation: remains deterministic Q15-B failure.
- Ui.Vision v10 evidence export path remains `uiv.files.exportToDownloads(...)`.
- no ChatGPT send/click/navigation/refresh/OCR/Ui.Vision-AI path in Q15-B.
- exactly one `XRunAndWait` bridge invocation.
- no full assistant response persisted to disk by the bridge.
- no event/probe file is required by Codex.
- no hidden Codex child launch remains.
- no Codex stdout/stderr capture pipe remains; only stdin carries the prompt.
- strict output is read from `--output-last-message`.
- read-only sandbox remains configured.

## Remaining acceptance boundary

Run the current launcher once on the Windows target. If direct preflight passes, allow it to continue automatically into Q15-B. Q15-B becomes PASS only after independent verification of the generated target evidence ZIP.

If the console-backed direct preflight still fails, do not modify Ui.Vision or weaken the sandbox; preserve that new result and diagnose the remaining launch boundary.

Production watcher/actuator implementation remains gated on target Q15-B PASS.
