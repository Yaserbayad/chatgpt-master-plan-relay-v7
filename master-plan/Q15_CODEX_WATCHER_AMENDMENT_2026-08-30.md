# Q15 Human-Authorized Codex Watcher Amendment — 2026-08-30

## Authority

Explicit current human instruction on 2026-08-30 changes the Relay architecture direction before Q15/Q16 completion. The goal is to minimize UI.Vision logic and interaction, use Codex for semantic orchestration, and first qualify the watcher/IPC boundary because it is the critical bottleneck.

This amendment is limited to the current Phase-Q qualification and the Q16 runtime-baseline decision. It does not silently execute or freeze the later C/I/T implementation baseline.

## Architecture decision under qualification

The candidate runtime boundary is now:

```text
ChatGPT Web
    |
    v
UI.Vision watcher/actuator
    |
    | completed-output event / exact mechanical command only
    v
local IPC bridge
    |
    v
Codex CLI
    |
    | semantic decision / structured action
    v
local IPC bridge
    |
    v
UI.Vision actuator
```

Responsibilities:

- **Codex** owns semantic interpretation, orchestration, recovery decisions, next-action selection, prompt generation, and context-rollover decisions.
- **UI.Vision** remains intentionally mechanical: observe browser state, detect completion, transfer an event, receive a structured command, and execute only a small qualified actuator surface.
- **The local IPC bridge** performs transport/validation/process invocation only. It must not become a second workflow engine or project authority.
- **GitHub/ChatGPT project authority remains unchanged.** Codex is an orchestrator for browser-relay decisions, not durable project authority.

The previous blanket Phase-Q assumption of `PowerShell supervisor = NONE`, `custom local helper = NONE`, and `second AI/controller = NONE` is superseded only to the minimum extent required by this explicitly authorized candidate. A tiny local IPC bridge is permitted; a second independent project manager is not.

## Amended Q15 objective

Q15 now qualifies the critical Codex watcher path in addition to preserving the original low-resource waiting requirement.

### Q15-A — Low-resource observation

Retain the existing requirements:

- approximately 10 minutes between bounded observations;
- UI.Vision effectively idle while sleeping;
- no routine refresh;
- no OCR/image work while sleeping;
- completed ChatGPT response correctly recognized at the next observation.

### Q15-B — UI.Vision → Codex → UI.Vision bridge

On the actual target environment, prove all of the following in one read-only browser qualification cycle:

1. UI.Vision binds exactly one configured-Project conversation and verifies ChatGPT is completed/idle using the already-qualified completion signal.
2. UI.Vision identifies the stable assistant message following the latest stable user turn and captures its message ID plus response text without sending, clicking a material ChatGPT action, refreshing, or navigating.
3. UI.Vision creates a unique nonce-bound event and transfers it to a local bridge using a deterministic local transport.
4. UI.Vision invokes the bridge through the qualified XModule/XRun boundary and waits for one bounded bridge result.
5. The bridge invokes the locally authenticated Codex CLI only after the completion event; Codex is not kept active during the long ChatGPT wait.
6. Codex reads the event and returns one strict machine-readable response conforming to the probe schema.
7. The response echoes the exact nonce and assistant message ID and returns the probe action `PROBE_OK`.
8. The bridge validates/parses the Codex result and returns only the validated result to UI.Vision.
9. UI.Vision rejects stale/mismatched nonce or assistant-message identity and accepts only the exact current response.
10. The qualification emits compact evidence sufficient to reconstruct: target identity, assistant message identity, nonce, bridge exit status, Codex invocation success, validated result, and absence of browser mutation.

### Safety/qualification constraints

- No ChatGPT Send/Submit is permitted in Q15-B.
- No fresh-chat navigation is permitted in Q15-B.
- No project-state mutation is permitted merely to prove IPC.
- No automatic retry of Codex or browser material action is permitted in the probe.
- No API key is required by the architecture; the target test may use the existing locally authenticated Codex CLI/ChatGPT account path.
- Full assistant response text is transport data and must not be persisted in normal evidence by default; evidence should retain identifiers, lengths/hashes, and compact diagnostics instead.
- Existing clipboard/input evidence may be reused, but a stale clipboard value must never false-pass; the nonce/identity checks are mandatory.

## Q15 PASS condition

Q15 is PASS only when both Q15-A and Q15-B are target-proven.

The Codex bridge must demonstrate a complete event round trip:

```text
completed ChatGPT response
→ UI.Vision event
→ local bridge
→ one Codex invocation
→ strict nonce-bound result
→ local bridge validation
→ UI.Vision acceptance
```

with no ChatGPT browser mutation during the IPC probe.

## Q15 failure decision

If Q15-A fails, low-resource observation remains unresolved.

If Q15-B fails, do not build the production Codex-orchestrated watcher. Preserve the failure evidence and either correct the exact IPC defect with a materially different attempt or return to the human for an architecture decision.

## Q16 impact

Q16 remains the Phase-Q qualification gate. It may pass only after Q03–Q15, including this amended Q15, are proven.

After Q16, the implementation runtime baseline must be re-frozen to reflect the successful qualified architecture before C01 or later implementation work executes. The old downstream UI.Vision-only implementation clauses that conflict with this amendment must not be executed as current authority without that post-Q16 re-freeze.

## Existing evidence impact

- Q01–Q14: **PRESERVE**. Their target evidence remains valid and directly supports the new sensor/actuator design.
- Q07 completion/identity evidence: preserved and reused by Q15-B.
- Q08 trusted input/clipboard evidence: preserved; useful for future actuator transport but not required to mutate ChatGPT during Q15-B.
- Q09 exactly-one Send evidence: preserved; no Send occurs in Q15-B.
- Q10 same-Project fresh-chat evidence: preserved; no fresh navigation occurs in Q15-B.
- Q12 journal evidence and its human-authorized scope amendment: preserved.
- Q14 version-drift evidence: preserved; the probe remains bound to the qualified target tuple.
- Q15: remains `TODO` until both amended sub-qualifications are proven.
- Q16: remains `TODO`.

## Checkpoint compatibility

The temporary `pre-C01-qualification-1` checkpoint has no `checkpoint_revision` or `baseline.version`; none is fabricated. This amendment is made durable by explicit checkpoint reference, following the existing pre-C01 amendment mechanism, until C01 freezes the production schema.
