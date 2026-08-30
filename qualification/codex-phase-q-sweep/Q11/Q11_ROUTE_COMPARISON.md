# Q11 — v6.0.3 versus V10 send-path evidence inventory and route decision

Status: **INCONCLUSIVE — PROVISIONAL ROUTE SELECTED**

Date: 2026-08-29  
Scope: read-only inventory of the repository and `C:/Users/usr/Documents/Codex`. This report does not treat a plan assertion, user-reported component version, or official product documentation as a substitute for target-run evidence.

## Decision

Select exactly one provisional production input route from the available evidence: **the V10 semantic trusted-browser route**:

1. resolve exactly one eligible composer semantically;
2. use `uiv.browser.click` and trusted browser keyboard input to stage the payload (clipboard-backed Ctrl+V for multiline/Unicode); and
3. reacquire and click exactly one enabled semantic `Send prompt` control using `uiv.browser.click`.

The selection is provisional because the required preserved v6.0.3 target-proven comparison input is absent. It is conditional on preserving the Q08/Q09 guards in the production implementation and on the separately required Q12 durable FENCE qualification. It is not a claim that Q11 passed or that the route is production-ready today: Q10, Q12–Q15, and the Q16 gate remain outside this comparison.

Do **not** select the alleged v6.0.3/RealUser/coordinate route. No preserved v6.0.3 target-proven send-path artifact was found from which its mechanism, behavior, dependencies, or safety properties could be established. Selecting it would replace qualified target evidence with unsupported inference.

## Evidence status

### Authoritative target evidence for V10

- Q06 freezes the tested tuple: UI.Vision **10.0.178**, Chrome **152.0.7977.65**, Windows 11 24H2 build 26100.9168, and Desktop Automation/XModules v2 **V2.0.12**. Q06 records the official minimum relationship that XModules v2.0.12 requires UI.Vision V10.0.153 or later. The selected 10.0.178 therefore satisfies that documented relationship.
- Q08 target-proves the input diagnostic on the logged-in configured Project and one stable conversation: trusted click/direct type, trusted Ctrl+A + Backspace, clipboard-backed Ctrl+V, and sentinel-protected Ctrl+C copy-back. It records the state sequence `Start Voice → Send prompt → Start Voice → Send prompt` and a preserved multiline/Unicode/blank-line payload. Copy-back differs only by two terminal U+00A0 markers; line endings and all internal whitespace and Unicode are preserved.
- Q09 target-proves one material `uiv.browser.click` on a reacquired enabled `aria-label="Send prompt"` surface. Its evidence reports `send_action_count = 1`, exactly one new stable user-message ID, unchanged Project/conversation identity, and observed generation. It has no Enter-submit or retry/resend path.
- Q07 target-proves the configured Project/conversation identity, stable message-ID correlation, a live `data-testid="stop-button"` generation signal, and the need to enumerate turns using visible/hidden reacquisition plus stable-ID deduplication rather than raw visible-DOM count.

### v6.0.3 status

No v6.0.3 source package, macro/script, verification record, target log/CSV/screenshot, package hash/index, exact UI.Vision/Chrome/RealUser version tuple, or failure/recovery record was found in the searched locations. `MASTER_PLAN.md` describes Q01 as requiring those items but does not itself supply them. `Q02_TARGET_ENVIRONMENT.md` only says RealUser V2026 was user-reported and that production use remains conditional on Q11; it does not prove a v6.0.3 run.

Consequently, every v6 entry below is **unresolved**, not a negative technical finding, and the Q11 candidate classification remains `INCONCLUSIVE`.

## Comparison

| Criterion | v6.0.3 route | V10 route | Evidence-based implication |
|---|---|---|---|
| Target-proven success | Unresolved; no preserved target run found. | Proven by Q08 input and Q09 single-Send target evidence. | V10 is the only route with available target evidence. |
| Exact input mechanism | Unresolved. No macro/script establishes whether it used RealUser, desktop/native input, clipboard, coordinates, or another mechanism. | `uiv.browser.click`, `uiv.browser.type`, OS clipboard write/read, Ctrl+V and Ctrl+C; V10 trusted browser input. | Select V10 semantics, not an inferred legacy mechanism. |
| Multiline / Unicode / blank lines | Unresolved. | Target-proven via sentinel-protected copy-back for `café`, Greek, Japanese, emoji, line breaks, and an intentional blank line. Only terminal U+00A0 serialization markers are tolerated. | V10 has a narrowly defined payload-normalization contract. |
| Focus | Unresolved. | V10 uses trusted browser click before typing and reacquires the composer/control. Evidence history shows focus loss/stale snapshots can occur; the final path validates results rather than assuming focus. | Retain unique-resolution and result checks. |
| Foreground / background behavior | Unresolved. | Q08 documents the official background-capable `uiv.browser.*` tier and target procedure included a 3.5-second switch to a non-Chrome app before input. | V10 has documented and qualified background intent; do not infer equivalent legacy behavior. |
| Clipboard | Unresolved. | Real OS clipboard is used; write/read is pre-verified, a unique sentinel must be overwritten by Ctrl+C, original clipboard is restored, and equality is strict except terminal U+00A0 and line-ending normalization. | The V10 clipboard path is proven but must preserve its sentinel guard. |
| RealUser | No v6 artifact proves whether or how RealUser was used. Q02's V2026 entry is user-reported only. | Not selected; Q08/Q09 use `uiv.browser.*`, not RealUser. | No RealUser claim may drive the decision. |
| Coordinates versus semantic resolution | Unresolved. No legacy selectors or coordinates were found. | Composer and Send are resolved via DOM semantics and strict cardinality; Q09 uses a semantic Send selector and re-resolves after enumeration. No material click is coordinate-addressed. | V10 avoids unproven coordinate coupling. |
| Chrome 152 / UI.Vision 10.0.178 compatibility | Unresolved; no legacy tuple or target run is preserved. | Directly qualified on Chrome 152.0.7977.65 and UI.Vision 10.0.178; Q06 records XModules v2.0.12 compatibility with V10.0.153+. | Only V10 has target evidence for the current frozen tuple. |
| Exactly-one Send safety | Unresolved. | Q09 reports one material click, `send_action_count = 1`, one new user-message ID, same Project/conversation, and no resend. On ambiguity it errors without replay. | V10 supplies the required one-Send proof pattern. |
| Selector/control stability | Unresolved. | Current target has a single relevant composer in Q08/Q09; Q08 proves state transition on the submit surface. Evidence history shows selector drift/failure was discovered and corrected rather than hidden. Q10 separately documents title- and surface-specific composer variation at Project home. | V10 semantics are qualified only for the evidenced conversation state; production must re-resolve, require cardinality one, and fail closed on drift. |
| Known failure modes | Unresolved. | Stale finder snapshots; generic metadata failing to discover Send; unsupported `Math.hypot`; false-pass clipboard oracle; focus/key-path uncertainty; render-window message loss; direct Project-root/label assumptions. Each is recorded in Q07/Q08/Q10 evidence and corrected with narrower guards. | V10 risks are known and have explicit fail-closed countermeasures. |
| Recoverability | Unresolved. | Q09 stops and does not resend after any post-click ambiguity. Full durable transaction recovery remains dependent on Q12/C07 and is not yet target-proven. | V10 is safer than an unverified legacy route, but no route may claim crash-window recovery before Q12. |
| Dependency count | Unresolved. | Evidenced path uses Chrome, UI.Vision V10 `uiv.browser.*`, and OS clipboard; Q06 notes XModules v2 for desktop/hard-drive features. RealUser is not an input dependency for this route. | V10 has a bounded, documented input dependency set. |
| Production complexity | Unresolved. | Moderate: semantic resolvers, strict cardinality, clipboard sentinel/canonicalization, turn-ID reconciliation, and non-replayable Send handling are required. | This is justified complexity because it is evidence-backed; unknown legacy complexity cannot be preferred. |

## Why the other route must not be selected

The v6 route cannot meet the Q11 comparison threshold from the currently preserved material. Specifically missing are:

1. the exact v6.0.3 package or macro source and its package hash;
2. the v6.0.3 verification procedure and result;
3. target-run logs/CSVs/screenshots that prove the correct Project and conversation;
4. an exact browser, UI.Vision, XModule/RealUser, Windows, and extension compatibility tuple;
5. proof of its exact input and submit actions, including foreground/focus requirements;
6. payload evidence covering multiline, Unicode, blank lines, clipboard behavior, and any canonicalization;
7. proof that one Submit produced one new user turn without retry/resend;
8. selector/coordinate records and a demonstrated drift/failure policy; and
9. its failure, reconciliation, and crash-window recovery evidence.

Absent those artifacts, claims that v6 was more stable, coordinate-based, RealUser-based, or otherwise preferable would be fabrication. Even a future recovered v6 package should be treated as a candidate requiring current-target requalification, not as automatic authority over the V10 result.

## Required implementation constraints for the selected V10 route

- Bind all material action to the configured Project token and a parsed conversation identity; reject wrong/unknown state.
- Require idle/completed state and exactly one eligible composer before staging.
- Preserve the Q08 clipboard procedure: pre-verify clipboard write/read, seed a unique copy-back sentinel, require its replacement, normalize only CRLF/CR and terminal U+00A0, and restore the original clipboard.
- Require exactly one enabled semantic Send surface after staging, reacquire it immediately before the click, and fail closed on zero or multiple candidates.
- Maintain exactly one automatic Submit site: one `uiv.browser.click` only, never Enter, never retry/resend.
- After Send, observe only and reconcile by stable user-message-ID delta. Any ambiguity remains non-replayable.
- Do not use raw visible message count as the conversation-total oracle; use Q07-style window reacquisition/include-hidden enumeration and stable-ID deduplication.
- Treat Q10 Project-home variation and Q12 durable FENCE proof as remaining gates; neither is satisfied by Q08/Q09.

## Sources searched

Repository evidence and scripts:

- `qualification/Q02_TARGET_ENVIRONMENT.md`
- `qualification/Q06_UIVISION_CANDIDATE.md`
- `qualification/Q07_EVIDENCE.md`, `Q07_TARGET_EVIDENCE_PARTIAL.md`, and `Q07_TURN_SCAN_DIAGNOSTIC.js`
- `qualification/Q08_EVIDENCE.md`, `Q08_RUNBOOK.md`, `Q08_INPUT_PROBE.js`, `Q08_INPUT_PATH_DIAGNOSTIC.js`, `Q08_SEND_DISCOVERY.js`, and all five preserved Q08 attempt records
- `qualification/Q09_EVIDENCE.md`, `Q09_RUNBOOK.md`, and `Q09_TRUSTED_SEND_PROBE.js`
- `qualification/Q10_PROJECT_ROOT_DISCOVERY_EVIDENCE.md`
- `master-plan/MASTER_PLAN.md` and repository history/all refs

Workspace search:

- all visible and hidden non-dependency files under `C:/Users/usr/Documents/Codex`, excluding `.git`, `node_modules`, virtual environments, and build output where applicable;
- terms including `v6.0.3`, `version 6.0.3`, `UI.Vision 6`, `uivision 6`, `RealUser`, `XClick`, `XType`, and relay/v6/send/evidence/macro filename patterns.

## Concerns

1. Q01's promised v6.0.3 artifact index is absent from the searched repository/workspace. This is the central evidence gap for Q11.
2. V10 selector evidence is target-state-specific. It must be implemented with semantic re-resolution and strict uniqueness, not frozen as an eternal selector fact.
3. Q09 proves one Send in a live run, not durable recovery across interruption. Q12 is still load-bearing for production exactly-once safety.
4. The V10 route is the only defensible selection from current evidence, but Q11 cannot make a comparative claim that it is intrinsically superior to v6; it establishes that it is the only route currently qualified on the frozen target.
