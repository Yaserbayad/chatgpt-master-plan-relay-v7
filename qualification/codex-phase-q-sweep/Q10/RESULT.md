# Q10 result

**Candidate classification:** `FAIL`
**Run classification:** `PROVEN_PRE_SEND_FAILURE`
**Rerun safe under current authorization:** NO — the single authorized corrected target run was consumed.

UI.Vision 10.0.178 executed the exact canonical `Q10_FRESH_CHAT_SPA_PROBE.js` (SHA-256 `7684f33d8dc86309c8e71554212de8c064ab50ad8cfb6bdbb1cd087f49223d92`) once through the official Command Line API. The run started in configured Project `t` at old conversation `6a932926-c750-83ed-9e99-d3addc14f456`.

The saved UI.Vision log and exported CSV agree:

- `send_attempted=false`
- `send_action_count=0`
- `send_dispatch_state=NOT_ATTEMPTED`
- `home_click_count=0`
- `sidebar_click_count=0`
- `new_conversation_id` absent
- `new_stable_marker_user_count=0`

UI.Vision failed before Project-home navigation because its own finder returned zero active configured-Project conversation links and zero Open-sidebar controls. A post-run observation confirmed that the target remained idle in the same configured Project conversation, the marker was absent, and no material action is ambiguous.
