# Q12 post-limit partial reconciliation evidence

**Reconciled classification:** `PARTIAL — TODO`
**Evidence origin:** user-uploaded Codex workspace bundle after Codex usage-limit interruption.
**Bundle SHA-256:** `0240d10c7f94b4f4fd084c4c24801ce72f3d3817642382e2c330cc6d9783394f`

The uploaded artifacts prove a real UI.Vision hard-drive CSV FENCE append/reread and one abrupt combined Chrome/UI.Vision termination/restart recovery. They do **not** yet satisfy the authoritative Q12 requirement to repeat durability qualification across several interruption points. Q12 therefore remains `TODO`.

## Proven

- UI.Vision hard-drive CSV path was used (`uiv.csv.append`, `uiv.csv.read`).
- Unique transaction `Q12-0e82f0168ddc46d58f921e90fe310b48` did not exist before append (`before_count=0`).
- Exact reread immediately after append succeeded (`exact_reread_count=1`).
- The exact FENCE survived the interruption/restart sequence and was reread with `exact_count=1`, `partial_or_corrupt_count=0`, `ordered=true`.
- Restart verification completed with UI.Vision `Status=OK`.

## Still required

The authoritative Q12 criterion says to repeat across **several interruption points**. The uploaded bundle contains one completed interruption/restart sequence, so additional distinct interruption windows remain required before Q12 can be `PASS`.

## Artifact integrity

- write probe SHA-256: `497a2e07279adae31a1f28bcee6e6324e6b9686699b4fa589864ed1d8cce301f`
- restart probe SHA-256: `bdbac7ce38a683e14897529c50c322a3191348bc59e822531078a96170c4ce4e`
- write evidence CSV SHA-256: `9a97b2e1fff23193b1444cfaf7067e0dde16b22b2d97c34a173503ea34a3e70b`
- restart evidence CSV SHA-256: `fc6f48e12ad26407c21c7f737f1c6d5bb8d0cb4ff8b25bcb32a9c5fa4a534473`
- restart UI.Vision log SHA-256: `c750412e132a3445bc877fc6c009374b7b3eb1adbb22ef3cd0cbcb96452096f2`

## Write-phase evidence

```csv
test_id,transaction_id,utc,sequence,checksum,record_type,before_count,exact_reread_count
Q12,Q12-0e82f0168ddc46d58f921e90fe310b48,2026-08-30T06:34:54.7768395Z,1,837aad74527446dbd5a81fa6b083b7b4b703022b96cee6023497ed5af8555c75,FENCE,0,1
```

## Restart evidence

```csv
test_id,transaction_id,utc,sequence,checksum,record_type,exact_count,partial_or_corrupt_count,ordered,total_rows
Q12,Q12-0e82f0168ddc46d58f921e90fe310b48,2026-08-30T06:34:54.7768395Z,1,837aad74527446dbd5a81fa6b083b7b4b703022b96cee6023497ed5af8555c75,FENCE,1,0,true,1
```

## UI.Vision restart log facts

```text
Status=OK
Q12 RESTART PASS tx=Q12-0e82f0168ddc46d58f921e90fe310b48 exact=1 partial=0
Runtime 1.03s
```

## Probe semantics

The write probe uses `uiv.csv.append` followed by exact `uiv.csv.read`, records evidence, then sleeps for an interruption window. The restart probe rereads the same `Q12_durable_fence.csv`, requires one exact matching record, zero partial/corrupt records, and preserves order. No native filesystem write is used as durability proof.
