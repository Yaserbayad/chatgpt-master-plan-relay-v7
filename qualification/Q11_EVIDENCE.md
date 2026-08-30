# Q11 — Stable v6 Path Comparison Evidence

Status: PASS
Date: 2026-08-30
Depends on: Q09 PASS

## Objective

Compare the current V10 target-proven input/Submit path against the preserved v6.0.3 target-proven send path and select exactly one production input route.

## Preserved v6 evidence recovered

The preserved Q01 evidence bundle identifies `ChatGPT-Master-Plan-Relay-v6.0.3.zip` with SHA-256 `fc2459641dca874d100a7b30534203757fbdd3f54039d3f82be2b43f9f4f29d2`, verifies its manifest, and records a 16/16 local contract suite. The historical v6.0.3 production specification and verification record are evidence only, not current architecture authority.

The v6.0.3 verification record preserves the target-proven pre-submit/Submit path inherited from the v6.0.1 Windows/UI.Vision 9.6.1 run:

`unique clean contenteditable -> usable visible anchor -> local OCR engine 98 -> exactly one OCR match -> XClickText -> XType Ctrl+V -> exactly one enabled Send -> pre-submit identity revalidation -> durable FENCE -> exactly one Send click`

The same record explicitly limits the v6.0.3 post-submit `submittedConversationId` / `NoteSubmitted` recovery changes to local/code/contract verification; those newer recovery changes were not target-PASS in that preserved record.

## Current V10 evidence

Current frozen target tuple:
- UI.Vision 10.0.178
- Chrome 152.0.7977.65
- Windows 11 24H2 build 26100.9168
- Desktop Automation/XModules v2 2.0.12

`qualification/Q08_EVIDENCE.md` target-proves the V10 semantic trusted-browser input route:
- unique composer;
- `uiv.browser.click`;
- trusted browser keyboard input;
- clipboard-backed multiline/Unicode/blank-line transport;
- enabled semantic Send surface;
- no material Submit during Q08;
- only terminal U+00A0 clipboard serialization markers are canonicalized.

`qualification/Q09_EVIDENCE.md` target-proves:
- exactly one material `uiv.browser.click` on the reacquired enabled `Send prompt` surface;
- `send_action_count = 1`;
- exactly one new stable user-message ID;
- unchanged configured Project/conversation identity for Q09;
- no retry/resend path after the click.

## Comparison

| Criterion | Preserved v6.0.3 path | Qualified V10 path | Decision impact |
|---|---|---|---|
| Current target tuple | Historical UI.Vision 9.6.1 target evidence | Target-proven on UI.Vision 10.0.178 / Chrome 152 | V10 |
| Contenteditable focus | OCR anchor + native `XClickText` | Semantic element resolution + trusted `uiv.browser.click` | V10 |
| Prompt transport | Native `XType Ctrl+V` | Trusted browser input + clipboard-backed Ctrl+V | V10 |
| Multiline/Unicode/blank lines | Historical route does not provide current-target payload proof | Target-proven by Q08 | V10 |
| Coordinate/OCR coupling | Requires OCR/native focus path | No material coordinate/OCR dependency in selected input path | V10 |
| Exactly-one Send | Historical target-proven through sole Send click | Current-target Q09 proves one click -> one new stable user turn | V10 |
| Background suitability | Native XClick/XType requires native desktop/focus behavior | Q08 qualifies the V10 trusted-browser tier intended for background browser use | V10 |
| Current selector/control evidence | Historical target state | Current target semantic composer/Send evidence | V10 |
| Recovery beyond Send | Historical FENCE path target-proven; v6.0.3 new submitted-conversation recovery only locally verified | Durable crash recovery remains separately gated by Q12/C07 | Neutral for Q11; Q12 remains mandatory |
| Dependency/complexity | OCR + native focus + RealUser/XModules-era behavior and helper architecture | Semantic Browser Vision input route with strict uniqueness/reacquisition | V10 |

## Production route decision

Select exactly one production input route:

**V10 semantic trusted-browser route.**

Production input/Submit semantics shall be:
1. positively identify configured Project/conversation state;
2. resolve exactly one eligible composer semantically;
3. stage prompt through the Q08-qualified trusted-browser/clipboard path;
4. preserve Q08 sentinel and narrow terminal-NBSP canonicalization rules;
5. reacquire exactly one enabled semantic `Send prompt` control immediately before use;
6. perform exactly one automatic `uiv.browser.click` Submit site;
7. after Send, observe/reconcile only and never automatically resend on ambiguity.

The preserved v6 route remains historical fallback engineering evidence, not the selected production input path. It must not be reintroduced merely because later V10 work encounters an unrelated defect.

## Acceptance mapping

- V10 result compared against preserved v6 target-proven send path: PASS.
- Target-proven versus local-only v6 evidence boundaries preserved: PASS.
- Exactly one production input route selected: PASS — V10 semantic trusted-browser route.
- Legacy evidence not promoted to current architecture authority: PASS.

Q11 conclusion: PASS.
