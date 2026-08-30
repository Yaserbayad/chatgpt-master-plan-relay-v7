# Light Version — Frozen Candidate Design

## Responsibility split

### Ui.Vision
- bind the correct ChatGPT Project conversation;
- observe stable user/assistant message identity;
- distinguish generating from completed;
- transfer the completed response to the local bridge;
- validate one nonce-bound result;
- later execute only allowlisted mechanical browser actions.

### Local bridge
- transport only;
- validate event/result identity;
- invoke one bounded Codex process;
- enforce timeout and read-only qualification sandbox;
- return compact validated output.

### Codex
- production target: own semantic interpretation, recovery choice, next prompt, same-chat/fresh-chat choice and stop/human decisions;
- qualification target: prove it can receive the event context and read a response-derived sample through the bridge.

## Non-goals

The Light Version does not make Ui.Vision a workflow engine, does not use Ui.Vision AI, does not add a browser extension, does not add an OpenAI API dependency, and does not reuse the main v7 project checkpoint as mutable authority.

## Gate sequence

1. Q15-B bridge test on target Windows runtime.
2. If PASS: production watcher/actuator implementation.
3. Production watcher soak/regression testing.
4. If FAIL: diagnose the exact IPC/Codex/Ui.Vision boundary before adding features.
