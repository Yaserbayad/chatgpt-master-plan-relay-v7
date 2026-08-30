# Q14 result

**Candidate classification:** `INCONCLUSIVE`

The external version guard positively matched Windows `26100.9168`, running and on-disk Chrome `152.0.7977.65`, registered UI.Vision `10.0.178`, Desktop Automation `2.0.12`, and Chrome Local State `profile.last_used` directory `Default`, exiting `0`. It resolves UI.Vision through the path registered in the selected profile's Secure Preferences rather than choosing the newest on-disk directory. With expected Chrome deliberately changed to `0.0.0.0`, it emitted `MISMATCH`, named both running and on-disk Chrome fields, set `material_action_allowed=false`, and exited `1`.

The comparison and nonzero-exit mechanics are supported, but full Q14 is not. The guard was not demonstrated gating a UI.Vision macro because the permitted actuator surface is unavailable, and the target tab-to-Chrome-process association is not independently exposed. This is a qualification-only external preflight, not a production browser supervisor or an in-macro guard. Google Updater services and a Ready GoogleUpdater scheduled task mean Chrome may drift; UI.Vision may drift through Chrome extension update behavior. Updates were not disabled. The guard detects drift at invocation; it does not prevent it.
