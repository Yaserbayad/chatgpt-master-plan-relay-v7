# ChatGPT Master Plan Relay v7 — Authoritative Development WBS

Source baseline: `ChatGPT_Master_Plan_Relay_v7_FINAL_DEVELOPMENT_BASELINE.md`
Source baseline SHA-256: `178168a3bd2027e6189f7a5b9cab42248887503428995534b3d1bffeda7a65c3`
Source section: `# 36. Authoritative Development WBS`

The WBS below is preserved from the authoritative v7 development baseline. This package exists so qualification and later execution can address stable work IDs without repeatedly loading the full baseline document.

---

# 36. Authoritative Development WBS

The phases below are mandatory and dependency ordered.

---

## PHASE Q — Qualification Before Build

### Q01 — Preserve v6.0.3 evidence baseline
**Objective:** Preserve the latest verified legacy package and evidence without modifying it.  
**Depends on:** none.  
**Acceptance:**
- v6.0.3 spec, verification, target logs and package hashes are indexed;
- target-proven vs locally verified boundaries are explicitly distinguished;
- no legacy artifact is treated as current architecture authority.

### Q02 — Freeze actual target environment inventory
**Depends on:** Q01.  
Record:
- Windows build;
- browser/profile/version;
- UI.Vision installed releases;
- FileAccess/RealUser XModule releases where present;
- ChatGPT Business workspace/Project;
- GitHub integration;
- Telegram environment.
**Acceptance:** no environment-critical implementation placeholder remains.

### Q03 — GitHub autonomous read/write qualification
**Depends on:** Q02.  
On a disposable state file:
1. read exact state;
2. obtain current revision/blob SHA if exposed;
3. update a harmless field;
4. reread and verify;
5. restore;
6. record any confirmation friction.
**PASS:** exact routine cycle works unattended as required.  
**FAIL:** architecture execution stops until GitHub write path is resolved.

### Q04 — Fresh-chat authority qualification
**Depends on:** Q03.  
Create a fresh chat in the target Project using only Project Instructions + generic bootstrap.  
**PASS:** it independently locates and correctly interprets the same current GitHub authority.

### Q05 — Real Master Plan access/size qualification
**Depends on:** Q04.  
Prove ChatGPT can:
- read small `STATE.json`;
- locate one WBS item by stable ID in the actual plan;
- load only relevant task context;
- avoid repeatedly ingesting the whole plan unnecessarily.
**PASS:** fresh-cycle reconstruction is practical and bounded.

### Q06 — Select exact UI.Vision V10 candidate
**Depends on:** Q02.  
Record exact build. Do not target “latest”.

### Q07 — V10 browser observation qualification
**Depends on:** Q06.  
Prove:
- Project root;
- conversation ID;
- user-turn enumeration;
- assistant-turn correlation;
- generating/completed distinction.
**PASS:** deterministic observation on actual logged-in ChatGPT.

### Q08 — V10 trusted composer/input qualification
**Depends on:** Q07.  
Prove:
- unique composer;
- `uiv.browser.click`;
- clipboard-based multiline/Unicode prompt paste via trusted browser input;
- enabled Send.
**PASS:** correct ChatGPT draft created with browser background allowed.

### Q09 — V10 trusted Submit qualification
**Depends on:** Q08.  
Prove exactly one trusted Send action creates exactly one user turn.

### Q10 — Same-Project fresh-chat/SPA qualification
**Depends on:** Q09.  
Prove:
- fresh entry stays in same Project;
- new conversation ID appears;
- transitional URL state is handled without false wrong-Project classification.

### Q11 — Stable v6 path comparison
**Depends on:** Q09.  
Compare V10 target result against preserved v6 target-proven send path.  
**Decision:** select exactly one production input route.

### Q12 — UI.Vision hard-drive journal qualification
**Depends on:** Q02, Q06.  
Using UI.Vision FileAccess/Hard-Drive CSV:
- append FENCE;
- reread;
- terminate browser/UI.Vision abruptly;
- restart;
- reread exact FENCE;
- repeat across several interruption points.
**PASS:** durability required for one-Submit semantics is target-proven.  
**FAIL:** stop UI.Vision-only architecture; do not add helper silently.

### Q13 — Telegram qualification
**Depends on:** Q02.  
Prove one secure UI.Vision-controlled notification route.  
**PASS:** message arrives and secret does not appear in GitHub, macro source or normal logs.

### Q14 — Version/update control qualification
**Depends on:** Q06.  
Prove exact version can be identified and unexpected runtime drift can be detected or operationally prevented during a run.

### Q15 — Low-resource observation qualification
**Depends on:** Q07.  
Prove a ~10-minute sleep/check cycle:
- macro effectively idle between observations;
- no routine refresh;
- no OCR/image work while sleeping;
- completed response is correctly processed at next check.

### Q16 — Qualification gate
**Depends on:** Q03–Q15.  
**PASS condition:** all load-bearing assumptions pass on target or an explicitly approved fallback is selected.  
Only then freeze the implementation runtime baseline.

---

## PHASE C — Freeze Contracts

### C01 — Final Master Plan package schema
**Depends on:** Q16.  
Freeze `MASTER_PLAN.md` + `STATE.json` schema, stable IDs/statuses, revision semantics and evidence refs.

### C02 — Project Instructions v7
**Depends on:** C01.  
Include authority, one-unit execution, replay rules, GitHub persist/confirm rule and nonce-bound ORCH result.

### C03 — Replay/human-gate schema
**Depends on:** C01.  
Every executable unit must declare replay class and any human gate.

### C04 — Relay wire protocol
**Depends on:** C02.  
Freeze `[RELAY:id]` and final nonce-bound ORCH syntax.

### C05 — Fixed relay prompts
**Depends on:** C02, C04.  
Freeze CONTINUE, RETRY, FRESH_BOOTSTRAP, PROTOCOL_REPAIR.

### C06 — Browser identity contract
**Depends on:** Q10.  
Freeze SAME/DIFFERENT/UNKNOWN_TRANSITIONAL and conversation identity semantics.

### C07 — Send/recovery transaction contract
**Depends on:** Q12.  
Freeze FENCE → exactly one Submit → COMMITTED/AMBIGUOUS; no resend.

### C08 — Failure taxonomy
**Depends on:** C01–C07.  
At minimum:
```text
UI_TRANSIENT
UI_DRIFT
CHATGPT_TRANSIENT
RATE_OR_USAGE_LIMIT
AUTH_REQUIRED
GITHUB_READ_FAILURE
GITHUB_WRITE_FAILURE
PROTOCOL_FAILURE
AMBIGUOUS_TRANSACTION
HUMAN_GATE
VERSION_DRIFT
JOURNAL_FAILURE
```
Each receives one bounded recovery route.

### C09 — Architecture contract gate
**Depends on:** C01–C08.  
No implementation code beyond prototypes until contracts are internally consistent and reviewable.

---

## PHASE I — UI.Vision Relay Implementation

### I01 — Modular V10 relay skeleton
**Depends on:** C09.  
Structure:
```text
Relay/
  main.js
  page.js
  observe.js
  send.js
  navigation.js
  journal.js
  telegram.js
  recovery.js
```
Use included libraries; no giant single script.

### I02 — Project/page probe
**Depends on:** I01, C06.  
Reacquire current browser state per observation.

### I03 — Rendered-turn enumerator
**Depends on:** I02.  
Enumerate visible user/assistant turns and count actual user turns.

### I04 — Relay user-turn correlation
**Depends on:** I03, C04.  
Locate exact current `[RELAY:id]` user turn.

### I05 — Assistant-response correlation
**Depends on:** I04.  
Select only the assistant turn following the correlated user turn.

### I06 — Low-frequency completion detector
**Depends on:** I05, Q15.  
Default:
```text
sleep ~10 minutes → one brief check
```
No constant polling or routine refresh.

### I07 — Strict ORCH parser
**Depends on:** I05, C04.  
Final non-empty line + exact nonce only.

### I08 — Conversation rollover
**Depends on:** I03, C05.  
Use actual rendered user-turn count; no tenth automated user prompt.

### I09 — Same-Project fresh-chat navigation
**Depends on:** I02, C06.  
Create fresh chat only inside configured Project.

### I10 — Unique composer resolver
**Depends on:** I02, Q11.  
Exactly one eligible composer or fail.

### I11 — Prompt staging/input
**Depends on:** I10.  
Use selected qualified input tier. No full rich-editor equality oracle.

### I12 — Unique Send resolver
**Depends on:** I11.  
Exactly one enabled Send control.

### I13 — Append-only journal writer/reader
**Depends on:** Q12, C07.  
UI.Vision hard-drive storage only.

### I14 — Durable FENCE
**Depends on:** I12, I13.  
Append + reread matching FENCE before Submit.

### I15 — Canonical single Submit
**Depends on:** I14.  
Exactly one automatic Submit site.

### I16 — Fresh conversation ID note
**Depends on:** I15.  
Immediately persist new conversation ID if/when observable.

### I17 — Commit observer
**Depends on:** I15, I16.  
After default low-frequency wait, positively prove rendered relay-tagged user turn.

### I18 — Startup reconciliation
**Depends on:** I13, I17.  
Observation-only. No input/Submit capability.

### I19 — RETRY convergence
**Depends on:** C08, I07.  
Implement bounded two-retry/fresh-context/two-retry ceiling.

### I20 — Protocol repair
**Depends on:** I07, C05.  
One durable-state-based repair; then one fresh context; then stop.

### I21 — Auth/rate/service error handling
**Depends on:** C08, I02.  
No bypass; preserve safe state.

### I22 — Telegram notifications
**Depends on:** Q13, C08.  
Human, relay-failure, ambiguity and auth classes.

### I23 — Version drift guard
**Depends on:** Q14.  
Detect unqualified UI.Vision/browser baseline.

### I24 — Compact diagnostics
**Depends on:** I01–I23.  
Log:
- timestamp;
- relay ID;
- high-level browser state;
- transaction transition;
- error class.
No raw secrets/full prompts by default.

### I25 — Relay implementation gate
**Depends on:** I01–I24.  
Static review proves exactly one Submit site and no forbidden architecture component.

---

## PHASE T — Verification and Regression

### T01 — Script syntax/module tests
**Depends on:** I25.  
All JS parses; includes resolve.

### T02 — Transaction structural tests
**Depends on:** I25.  
Prove:
- FENCE before Submit;
- exactly one Submit site;
- no FENCE/AMBIGUOUS → Submit path;
- reconcile has no input.

### T03 — ORCH adversarial parser tests
**Depends on:** I07.  
Include:
- quoted markers;
- code-block markers;
- wrong nonce;
- old nonce;
- malformed final line;
- valid marker earlier but invalid final line.

### T04 — Historical stale-URL/SPA regression
**Depends on:** I02.

### T05 — IPC/liveness regression
**Depends on:** I02.

### T06 — Coordinate/focus regression
**Depends on:** I10–I12.  
Old XClick coordinate and DOM+native focus failure must be structurally absent in selected path.

### T07 — Rich-editor oracle regression
**Depends on:** I11.  
No full `storeText`/copy-back equality requirement.

### T08 — Multiple/hidden composer/Send regression
**Depends on:** I10, I12.

### T09 — Multiline/Unicode/blank-line transport
**Depends on:** I11.

### T10 — Transitional Project identity regression
**Depends on:** I02, I09.

### T11 — Fresh conversation ID regression
**Depends on:** I16.

### T12 — Duplicate Submit regression
**Depends on:** I14–I18.

### T13 — Restart FENCE regression
**Depends on:** I13–I18.

### T14 — Conversation-count regression
**Depends on:** I08.  
Test restart + human message + nine existing user turns.

### T15 — Low-resource wait regression
**Depends on:** I06.  
Verify ~10-minute observation cadence, no routine refresh, no OCR/image loop while sleeping.

### T16 — GitHub durable-state integration tests
**Depends on:** C01, C02.  
Prove:
```text
work → AC verification → state write → reread → ORCH
```
and write failure cannot produce NEXT/DONE.

### T17 — Replay policy tests
**Depends on:** C03, I19.  
SAFE / RECONCILE_FIRST / HUMAN_ON_AMBIGUITY.

### T18 — Crash-window fault injection
**Depends on:** I13–I18.  
Terminate at:
```text
before FENCE
after FENCE
during Submit
immediately after Submit
after fresh conversation ID
during response generation
after project artifact change but before STATE update
after STATE update before ORCH
```

### T19 — Telegram tests
**Depends on:** I22.

### T20 — Auth/rate/usage tests
**Depends on:** I21.

### T21 — Wrong-Project test
**Depends on:** I02.  
Known different Project permits observation only, no material action.

### T22 — Verification gate
**Depends on:** T01–T21.  
No critical failure remains.

---

## PHASE E — End-to-End Disposable Project

### E01 — Create deterministic disposable GitHub project
**Depends on:** T22.  
Include WBS tasks exercising:
- normal PASS/NEXT;
- RETRY;
- fresh context;
- RECONCILE_FIRST;
- human gate;
- closure.

### E02 — Normal autonomous multi-task run
**Depends on:** E01.  
Prove repeated:
```text
GitHub → ChatGPT work → GitHub state → ORCH → next cycle
```

### E03 — Multi-chat continuity
**Depends on:** E02.  
Cross at least three automatically created chats.

### E04 — Prompt-limit behavior
**Depends on:** E03.  
No tenth automated user prompt.

### E05 — Human-gate stop
**Depends on:** E02.  
Stop exactly at predefined gate and Telegram human.

### E06 — Resume after human gate
**Depends on:** E05.  
No previously completed work is repeated.

### E07 — RETRY/reconciliation sequence
**Depends on:** E02.

### E08 — Browser restart from safe state
**Depends on:** E02.

### E09 — Restart after FENCE
**Depends on:** E02.  
No automatic resend.

### E10 — Restart immediately after Submit
**Depends on:** E02.  
Commit recovered if provable; otherwise AMBIGUOUS/stop.

### E11 — GitHub write failure
**Depends on:** E02.  
No false NEXT/DONE.

### E12 — Disposable project completion
**Depends on:** E01–E11.  
Entire project reaches valid DONE with durable evidence.

---

## PHASE R — Reliability Qualification

### R01 — 2-hour unattended soak
**Depends on:** E12.  
Record all unexpected behavior. Fix only reproduced evidence-backed defects.

### R02 — 8-hour unattended soak
**Depends on:** R01.  
Require multiple normal cycles and chat rollovers.

### R03 — Browser lifecycle assessment
**Depends on:** R02.  
Using real resource/behavior data, decide whether periodic browser recycle is needed.

### R04 — Optional Task Scheduler lifecycle setup
**Depends on:** R03.  
Only if justified. Launcher/restart only; no project orchestration.

### R05 — 24-hour unattended acceptance
**Depends on:** R02–R04 as applicable.  
PASS requires:
- no wrong Project;
- no duplicate Submit;
- no false NEXT/DONE;
- no uncontrolled RETRY loop;
- no lost durable FENCE;
- correct fresh-chat continuity;
- correct GitHub progression;
- low CPU/browser activity during waits;
- detected failures notify correctly;
- no manual intervention except deliberately injected human gate.

### R06 — Reliability gate
**Depends on:** R05.  
No unresolved critical issue.

---

## PHASE P — Packaging and Production Pilot

### P01 — Current platform/terms launch gate
**Depends on:** R06.  
Record the accepted basis for unattended production use. Never bypass platform restrictions.

### P02 — Production configuration specification
**Depends on:** R06.  
Document:
- repository/path;
- Project URL;
- qualified UI.Vision/browser versions;
- journal location;
- Telegram configuration;
- wait/timeout settings;
- log location/retention.

### P03 — Release manifest
**Depends on:** P02.  
Hashes/versions for all relay source and Project Instructions.

### P04 — Rollback package
**Depends on:** P03.  
Preserve immediately preceding qualified release.

### P05 — Operator recovery runbook
**Depends on:** P02.  
Only genuine human steps:
- auth/MFA;
- ambiguous fenced transaction;
- human project gate;
- unqualified version drift;
- hard host failure.

### P06 — Low-risk real-project pilot
**Depends on:** P01–P05.  
Execute a bounded real Master Plan tranche.

### P07 — Pilot audit
**Depends on:** P06.  
Verify no repeated completed work, wrong state mutation or hidden human dependency.

### P08 — Final production acceptance
**Depends on:** P07.  
All Definition-of-Done items true; no unresolved critical defect/transaction/platform gate.

### P09 — Freeze production baseline
**Depends on:** P08.  
Record exact qualified runtime tuple and release hash.

---
