# Q16 Qualification Gate — Candidate Report

**Status:** NOT YET ELIGIBLE  
**Current blocker:** Q15-B is `WAITING` on Codex usage allowance availability.  
**Purpose:** pre-assemble the Q16 gate so that no already-proven qualification is repeated when Q15-B becomes executable.

## Gate rule

Q16 depends on Q03–Q15 and may PASS only when every load-bearing assumption is target-proven or an explicitly approved fallback is selected.

## Current qualification matrix

| Item | Current state | Gate interpretation |
|---|---|---|
| Q03 | PASS | GitHub read/write/persist-confirm path qualified. |
| Q04 | PASS | Fresh-chat authority reconstruction qualified. |
| Q05 | PASS | Bounded real-plan access qualified. |
| Q06 | PASS | Exact UI.Vision V10 candidate frozen. |
| Q07 | PASS | Logged-in ChatGPT observation/completion identity qualified. |
| Q08 | PASS | Trusted composer/input path qualified. |
| Q09 | PASS | Exactly-one trusted Submit qualified. |
| Q10 | PASS | Same-Project fresh-chat/SPA transition qualified. |
| Q11 | PASS | V10 semantic trusted-browser production input route selected. |
| Q12 | PASS | Human-authorized current-scope in-Chrome UI.Vision hard-drive FENCE append + exact reread qualified. External Chrome crash/restart is not required for current Q12 acceptance. |
| Q13 | PASS | Secure Telegram notification route and secret-hygiene evidence accepted. |
| Q14 | PASS | Exact runtime tuple identification + deliberate drift mismatch detection qualified. |
| Q15-A | APPROVED DEFERRED RUNTIME PROOF | Native UI.Vision sleep/check is the required production mechanism; standalone PowerShell timing qualification is retired; end-to-end cadence proof remains for later T15 after implementation. |
| Q15-B | WAITING | Read-only UI.Vision → local bridge → one Codex CLI invocation → validated nonce/message-bound UI.Vision result is not yet target-proven because Codex usage allowance is exhausted. |
| Q15 | WAITING | Cannot PASS until Q15-B passes. |
| Q16 | TODO / INELIGIBLE | Dependency Q15 is not PASS. |

## Architecture already established for the Q16 decision

Subject to Q15-B success, the candidate runtime boundary is:

```text
ChatGPT Web
  → UI.Vision watcher/actuator
  → narrow local IPC bridge
  → Codex CLI semantic/orchestration decision
  → narrow local IPC bridge
  → UI.Vision mechanical actuator
```

Durable project authority remains GitHub/ChatGPT Project authority; Codex does not become checkpoint authority.

## Exact remaining evidence needed

When Codex allowance becomes available:

1. run the already-published Q15-B probe once;
2. verify one configured-Project completed assistant response is captured read-only;
3. verify one nonce/message-bound event crosses UI.Vision → bridge → Codex;
4. verify Codex returns strict `PROBE_OK` with exact nonce + assistant message ID;
5. verify bridge validation succeeds and UI.Vision accepts only the current exact result;
6. verify no ChatGPT Send, fresh-chat navigation, refresh, or other material browser mutation occurred;
7. persist Q15-B evidence and reconcile Q15 to PASS only if every amended Q15-B criterion is proven;
8. then execute Q16 gate reconciliation without repeating Q03–Q14.

## Q16 decision once Q15-B returns

- **If Q15-B PASS:** Q15 may PASS; Q16 may then evaluate all current qualification evidence and, if coherent, PASS and authorize the post-Q16 runtime-baseline re-freeze before C01.
- **If Q15-B materially fails:** Q15 does not PASS. Preserve failure evidence and make an explicit architecture decision; do not silently revert to the old UI.Vision-only semantic-orchestration design and do not bypass the failure with API-key billing unless separately authorized.

## Prohibited premature actions

Until Q15 and Q16 PASS:

- do not mark Q16 PASS;
- do not execute C01 or later implementation work as governed WBS progression;
- do not rewrite the production baseline as though the Codex-watcher path were already qualified;
- do not rerun Q01–Q14 solely because Q15-B is waiting.
