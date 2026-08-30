# Q10 post-limit reconciliation evidence

**Reconciled classification:** `PASS`
**Evidence origin:** user-uploaded Codex workspace bundle after Codex usage-limit interruption.
**Bundle SHA-256:** `0240d10c7f94b4f4fd084c4c24801ce72f3d3817642382e2c330cc6d9783394f`

This evidence supersedes the earlier pre-Send failure for acceptance purposes. The later bounded, materially different tab-bound execution reached the target and passed Q10.

## Acceptance mapping

- Fresh entry stayed in the configured Project: **PASS** — fresh root `https://chatgpt.com/g/g-p-6a9323b61110819182dba0224678aa8b-t/project`.
- New conversation ID appeared: **PASS** — old `6a932926-c750-83ed-9e99-d3addc14f456`, new `6a93ceab-9f20-83eb-bd76-3bb7974cf1b6`.
- Transitional SPA state handled without false wrong-Project classification: **PASS** — fresh-entry and first post-Send observation were `SAME_PROJECT_TRANSITIONAL`, followed by `SAME_PROJECT_NEW_CONVERSATION`.
- Exactly one trusted Send: **PASS** — `send_attempted=1`, `send_action_count=1`, `send_dispatch_state=CLICK_RETURNED`.
- Exactly one stable marker user turn: **PASS** — message ID `0c5e7409-5b24-4d1f-a6be-1434b8556318`, text `Q10_FRESH_CHAT_SPA_PROBE`.
- No resend: **PASS** — one Send action in the UI.Vision log and one user marker turn.

## Artifact integrity

- success CSV SHA-256: `97c2529b84eb6baee5e83b7faaa5dafde7d498e6a70fde03986bc5f940a4e89d`
- UI.Vision log SHA-256: `85184e61e919c0357a138cc2f883db0b071f7b04ce8662c146da144e4634d6a8`
- regression harness SHA-256: `4ca51b9bae8e1bfa5884cbc97c31d514c6297f667753f484c7169109ddf57845`

The exact successful local canonical macro file was not included in the uploaded bundle; its full SHA-256 therefore cannot be independently recomputed here. The target-behavior evidence is nevertheless direct: the UI.Vision log records explicit tab selection, Project-home click, composer click/type, exactly one Send click, and the exported CSV independently records the resulting same-Project fresh conversation and marker turn.

## Raw success evidence

```text
meta,PASS,,1,1,CLICK_RETURNED,1,0,https://chatgpt.com/g/g-p-6a9323b61110819182dba0224678aa8b/c/6a932926-c750-83ed-9e99-d3addc14f456,6a932926-c750-83ed-9e99-d3addc14f456,1,https://chatgpt.com/g/g-p-6a9323b61110819182dba0224678aa8b-t/project,6a93ceab-9f20-83eb-bd76-3bb7974cf1b6,1,1,0c5e7409-5b24-4d1f-a6be-1434b8556318,Q10_FRESH_CHAT_SPA_PROBE,10.0.178
fresh-entry-1,SAME_PROJECT_TRANSITIONAL,https://chatgpt.com/g/g-p-6a9323b61110819182dba0224678aa8b-t/project
post-send-1,SAME_PROJECT_TRANSITIONAL,https://chatgpt.com/g/g-p-6a9323b61110819182dba0224678aa8b-t/project
post-send-2,SAME_PROJECT_NEW_CONVERSATION,https://chatgpt.com/g/g-p-6a9323b61110819182dba0224678aa8b-t/c/6a93ceab-9f20-83eb-bd76-3bb7974cf1b6
user,0c5e7409-5b24-4d1f-a6be-1434b8556318,Q10_FRESH_CHAT_SPA_PROBE
```

## UI.Vision execution facts

```text
Status=OK
uiv.tabs.select {"index":1}
uiv.browser.click Project-home button
uiv.browser.click composer
uiv.browser.type "Q10_FRESH_CHAT_SPA_PROBE"
uiv.browser.click Send button
Q10 PASS: one possible Send resolved to exactly one marker user turn 0c5e7409-5b24-4d1f-a6be-1434b8556318 in new conversation 6a93ceab-9f20-83eb-bd76-3bb7974cf1b6
Runtime 11.53s
```
