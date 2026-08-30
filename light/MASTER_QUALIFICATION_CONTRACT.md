# Light Master Qualification / Same-Chat Soak Contract

Status: candidate contract for the independent `light-version` project.

## Purpose

Replace repeated one-off target packages with one bounded, deterministic, stop-on-first-failure qualification that exercises the real Light production path end to end while keeping the test oracle independent of Codex.

Codex remains the production semantic orchestrator under test. PowerShell only stages files/config, sequences cycles, validates exact machine-observable evidence, and packages results. Ui.Vision remains the only browser observer/actuator.

## Scope

This contract qualifies only the current same-chat Light architecture:

`ChatGPT Web -> Ui.Vision -> PowerShell bridge -> Codex -> Ui.Vision`

It does not implement or qualify fresh-chat creation, Chrome restart/crash recovery, OCR, screenshots, Ui.Vision AI, page-world evaluation, generic coordinates, or OpenAI API billing.

## Preconditions

- Windows 11 target already used by Q15-B/Q08/Q09 production qualifications.
- Chrome, Ui.Vision launcher, and locally authenticated Codex CLI are available.
- Exactly one completed configured-Project ChatGPT conversation tab is open.
- Composer is empty and exposes the `Start Voice` baseline.
- The harness may send exactly six bounded safe messages in one conversation.
- The operator does not interact with ChatGPT while the harness is active.

## Seven-cycle plan

The master harness runs seven sequential Ui.Vision/Codex cycles and stops at the first failure. It never retries a failed or ambiguous material action.

### Cycle 0 — deterministic seed / mechanical acceptance

Bridge config uses `qualification_mode=true` so Codex must return exactly one `SEND_PROMPT` containing the frozen handshake seed. This proves the complete production staging/send/confirmation/completion path and establishes a deterministic assistant state for the semantic soak.

The seed instructs ChatGPT to emit an exact five-step next-token sequence followed by an explicit completion statement.

### Cycles 1-5 — production semantic soak

Bridge config uses `qualification_mode=false`; no target prompt is supplied to Codex.

For each cycle, the latest assistant message states the exact next safe token required to continue. Normal production Codex policy must independently choose `SEND_PROMPT` and return that exact token. The deterministic supervisor verifies the Codex-returned prompt by SHA-256 rather than accepting the model's success claim.

Each cycle must also prove the full target browser path:

- same bound conversation;
- exact source user/assistant chain from the prior cycle;
- unique nonce;
- bridge and Codex exit 0;
- browser identity revalidated;
- exact Q08 target-qualified composer locator resolves uniquely;
- material composer focus is performed by passing that locator string directly to `uiv.browser.click`, never a finder snapshot object;
- `Start Voice -> Send prompt` transition after trusted paste;
- nonce-bound copy sentinel replaced by Ctrl+C after refocusing through the same locator string;
- exact staged copy with only terminal NBSP normalization;
- exactly one Send click;
- exact new-user-message confirmation;
- next stable assistant completion.

### Cycle 6 — production terminal STOP

Normal production mode observes an assistant message that explicitly states the objective is complete and no further same-chat message is useful. Codex must choose `STOP`.

Required terminal evidence:

- action exactly `STOP`;
- empty prompt hash;
- zero Send clicks;
- no submission confirmation/new user message;
- no next completion awaited;
- `STOP_REQUESTED` classification;
- same conversation and exact source chain from cycle 5.

## Exact handshake

Seed message:

```text
This is a bounded relay reliability handshake. Follow these rules exactly and do not add any other text.
Reply now exactly: NEXT ACTION REQUIRED: Send exactly LIGHT_SOAK_01 and nothing else.
If the next user message is exactly LIGHT_SOAK_01, reply exactly: NEXT ACTION REQUIRED: Send exactly LIGHT_SOAK_02 and nothing else.
If the next user message is exactly LIGHT_SOAK_02, reply exactly: NEXT ACTION REQUIRED: Send exactly LIGHT_SOAK_03 and nothing else.
If the next user message is exactly LIGHT_SOAK_03, reply exactly: NEXT ACTION REQUIRED: Send exactly LIGHT_SOAK_04 and nothing else.
If the next user message is exactly LIGHT_SOAK_04, reply exactly: NEXT ACTION REQUIRED: Send exactly LIGHT_SOAK_05 and nothing else.
If the next user message is exactly LIGHT_SOAK_05, reply exactly: OBJECTIVE COMPLETE. No further same-chat message is useful. Stop.
```

Expected production Codex prompts for cycles 1-5 are exactly:

`LIGHT_SOAK_01`, `LIGHT_SOAK_02`, `LIGHT_SOAK_03`, `LIGHT_SOAK_04`, `LIGHT_SOAK_05`.

## Chain invariants

For every cycle after cycle 0:

- `conversation_id` equals cycle 0 conversation ID;
- `source_user_message_id` equals the prior cycle `new_user_message_id`;
- `source_assistant_message_id` equals the prior cycle `next_assistant_message_id`;
- source assistant SHA-256 equals the frozen expected assistant text for that cycle;
- nonce is non-empty and unique across all seven cycles.

For cycles 0-5, the bridge prompt SHA-256 must equal the exact expected prompt SHA-256. For cycle 6 it must be empty.

## Material input invariant recovered from target failure

The master harness inherits the frozen production material-input contract. The exact composer locator is:

`css=[role="textbox"][contenteditable="true"][aria-label="Chat with ChatGPT"]`

Before paste and before copy-back it must resolve to exactly one visible composer. Trusted focus must use `uiv.browser.click(COMPOSER)` with that locator string directly. Finder snapshots may be used for observation but must not be passed as material composer focus targets. This preserves the Q08 target-PASS focus/input path and prevents the cycle-0 `Start Voice -> Start Voice` failure observed when a finder snapshot was converted into a coordinate click on a `div`.

## Failure policy

- Any preflight, bridge, identity, staging, semantic, chain, Send, confirmation, timeout, or evidence mismatch immediately ends the run.
- A failed/ambiguous cycle is never automatically retried.
- Evidence collected through the failure is preserved.
- A PASS cannot be inferred from terminal output alone; the evidence bundle must contain all seven validated cycle records and source hashes.

## Evidence bundle

The final Desktop ZIP contains:

- exact watcher, bridge, schema, and master harness source used;
- one CSV and one Ui.Vision log per executed cycle;
- `MASTER_SUMMARY.csv` with expected/actual action, prompt hash, source/next IDs, nonce, staging flags, Send count, and validator result;
- `RESULT.txt` with `PASS` or first failure boundary;
- `SOURCE.txt` with branch/head/source blob bindings supplied in the package;
- `SHA256.txt` covering every evidence file.

PASS means all seven cycles passed their exact contract. After this PASS, the same-chat production path and bounded soak are qualified; fresh-chat/recovery remains the next separate stage.
