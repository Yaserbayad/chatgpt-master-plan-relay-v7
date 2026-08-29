# Q09 — V10 Trusted Submit Qualification Evidence

Status: PASS
Date: 2026-08-29
Candidate: UI.Vision 10.0.178 / Chrome 152.0.7977.65
Target Project token: `g-p-6a9323b61110819182dba0224678aa8b`
Probe: `qualification/Q09_TRUSTED_SEND_PROBE.js`

## Target evidence

`Q09_trusted_send_2026-08-29T22-22-14-549Z.csv`

SHA-256:
`43c5fb63ff5b1028313bcbfd14bb6029ccd70e4863c029e7c97e41c6d5bce9bb`

## Acceptance evidence

The CSV meta row reports:

- `result = PASS`
- `send_performed = 1`
- `send_action_count = 1`
- `url_before = https://chatgpt.com/g/g-p-6a9323b61110819182dba0224678aa8b/c/6a932926-c750-83ed-9e99-d3addc14f456`
- `url_after = https://chatgpt.com/g/g-p-6a9323b61110819182dba0224678aa8b/c/6a932926-c750-83ed-9e99-d3addc14f456`
- `conversation_before = 6a932926-c750-83ed-9e99-d3addc14f456`
- `conversation_after = 6a932926-c750-83ed-9e99-d3addc14f456`
- `before_unique_user_count = 3`
- `new_user_count = 1`
- `new_user_id = 38eb6d48-0578-4f73-8ade-33055a2bf1a6`
- `generation_observed = 1`

The new user turn text corresponds to the staged Q08 qualification payload:

```text
Q08_CLIPBOARD_PASTE_PROBE
ASCII: clipboard via trusted browser input
Unicode: café naïve Ελληνικά 日本語 🙂

BLANK-LINE-BEFORE-THIS
```

The observation set also contains the three previously known pre-send user message IDs and the newly created user message ID, demonstrating a one-message delta from the qualified pre-send set.

## Exactly-one trusted Send — PASS

The qualified probe contains one material Send action only: one trusted `uiv.browser.click` on the reacquired enabled `aria-label="Send prompt"` surface. It contains no Enter-key submit path and no retry/resend after the click.

The target evidence reports `send_action_count = 1` and exactly one previously unseen user message ID. Therefore one trusted Send created exactly one user turn.

## Identity stability — PASS

Project token and conversation ID are unchanged before and after the single Send. No fresh-chat or wrong-Project transition occurred during Q09.

## Normal submission progression — PASS

`generation_observed = 1` and the first post-send observation contains an assistant request placeholder (`Thinking`), showing that the newly created user turn entered normal ChatGPT generation after the one trusted Send.

Assistant completion is not required by the Q09 acceptance criterion.

## No resend / ambiguity safety — PASS

The probe stops after one Send action and observes only. The target result was directly provable as one new user turn, so no ambiguous recovery or resend path was entered.

## Qualification conclusion

PASS — Q09 target evidence proves exactly one trusted Send action created exactly one new user turn in the same configured Project/conversation.
