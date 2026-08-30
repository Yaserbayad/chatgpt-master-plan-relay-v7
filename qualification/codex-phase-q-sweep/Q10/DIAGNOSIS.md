# Q10 diagnosis — corrected CLI target run

**Candidate classification:** `FAIL`
**Run classification:** `PROVEN_PRE_SEND_FAILURE`

## Command Line API and macro identity

The generated launch page at `C:\Users\usr\Documents\Codex\ui.vision.html` targets UI.Vision hard-drive storage (`xfile`). The active store was positively identified at `C:\Users\usr\Desktop\uivision`; its standard `macros`, `images`, `datasources`, and `logs` directories were current. Only `macros/Q10_FRESH_CHAT_SPA_PROBE.js` was synchronized, and its SHA-256 matched the governed canonical value:

```text
7684f33d8dc86309c8e71554212de8c064ab50ad8cfb6bdbb1cd087f49223d92
```

An initial CLI invocation without the V10 JavaScript `.js` suffix failed at macro resolution. UI.Vision emitted no macro-start status, created no CSV or saved log, and performed no macro or browser action. UI.Vision's installed source shows that the `macro=` value is passed verbatim to storage. This event is preserved as a pre-run CLI resolution failure, not counted as a Q10 run.

The sole target run then used `direct=1&macro=Q10_FRESH_CHAT_SPA_PROBE.js&storage=xfile` with a unique `savelog` path. UI.Vision emitted exactly one start record at `2026-08-30T05:56:38.705Z` and completed at `2026-08-30T05:56:43.890Z`.

## Direct target evidence

The exported `raw/Q10_fresh_chat_spa_2026-08-30T05-56-43-152Z.csv` and `raw/Q10_uivision_cli_20260830T055900Z.log` agree that the run began at:

```text
https://chatgpt.com/g/g-p-6a9323b61110819182dba0224678aa8b/c/6a932926-c750-83ed-9e99-d3addc14f456
```

The configured Project token and old conversation ID were correct. UI.Vision found no stop control, then its own `uiv.$` queries returned zero active configured-Project conversation links and zero Open-sidebar controls. It failed before Project-home activation, staging, or Send:

```text
send_attempted=false
send_action_count=0
send_dispatch_state=NOT_ATTEMPTED
home_click_count=0
sidebar_click_count=0
new_conversation_id=
marker_user_count=0
```

The observation-only post-run record independently confirms the same configured Project and old conversation remained active and idle, with no marker text and no new conversation.

## Finding and safety

Q10 does not satisfy the PASS criteria. The hard blocker is now specific to UI.Vision's browser DOM visibility: the observer can see the configured Project link and Open-sidebar control, but the canonical UI.Vision finder cannot resolve them. The single authorized corrected target run has been consumed. No Send was possible, no resend occurred, and no material action remains ambiguous; nevertheless, no further run is authorized.
