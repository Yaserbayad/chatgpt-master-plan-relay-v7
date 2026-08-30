# Q12 UI.Vision hard-drive journal test matrix

All rows are `NOT_EXECUTED`. The required UI.Vision FileAccess/Hard-Drive actuator was unavailable through the permitted control surface. No substitute filesystem write was performed, and no UI.Vision journal was created, written, reread, interrupted, or restarted.

| Row | Interruption point | Expected durable state | Status | Exact reason |
|---|---|---|---|---|
| A | Before FENCE append | No FENCE exists; downstream Submit must remain blocked. | `NOT_EXECUTED` | UI.Vision-only actuation unavailable. |
| B | Immediately after FENCE append | The exact appended record is the candidate durable state to be verified; no Submit is inferred. | `NOT_EXECUTED` | UI.Vision-only actuation unavailable. |
| C | After FENCE append but before normal macro completion | The exact FENCE should survive interruption and later same-mechanism reread. | `NOT_EXECUTED` | UI.Vision-only actuation unavailable. |
| D | After successful FENCE reread | Append and exact reread are proven before any later interruption. | `NOT_EXECUTED` | UI.Vision-only actuation unavailable. |
| E | Abrupt UI.Vision termination after durable FENCE | The exact prior FENCE survives UI.Vision termination and restart. | `NOT_EXECUTED` | UI.Vision-only actuation unavailable. |
| F | Abrupt Chrome/UI.Vision termination after durable FENCE | The exact prior FENCE survives combined browser/controller termination. | `NOT_EXECUTED` | UI.Vision-only actuation unavailable. |
| G | Restart Chrome/UI.Vision | The same hard-drive journal is reopened without replacement storage or helper state. | `NOT_EXECUTED` | UI.Vision-only actuation unavailable. |
| H | Reread exact prior FENCE after restart | Every field, sequence number, and checksum/correlation value matches the pre-termination record. | `NOT_EXECUTED` | UI.Vision-only actuation unavailable. |

Rerun is safe when UI.Vision actuation is available. This test remains load-bearing for Q16 acceptance.
