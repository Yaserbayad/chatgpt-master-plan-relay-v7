# Q04 — Fresh-Chat Authority Qualification Procedure

Status: READY FOR TARGET RUN
Date: 2026-08-29
Target Project: https://chatgpt.com/g/g-p-6a9323b61110819182dba0224678aa8b/project

## Temporary Project Instructions for this qualification

Use the following exact qualification-only instructions in the target test Project:

```text
Q04 FRESH-CHAT AUTHORITY QUALIFICATION ONLY.
Current authority is GitHub repository Yaserbayad/chatgpt-master-plan-relay-v7, branch main:
- qualification/q04-authority/MASTER_PLAN.md
- qualification/q04-authority/STATE.json
On every bootstrap, read both exact files from GitHub before interpreting project state. Do not infer current state from prior conversations or memory. GitHub authority overrides chat history. Do not modify either file during Q04. If project_status is PAUSED, execute no governed work.
```

## Generic bootstrap prompt

Open a brand-new chat inside the same target Project and send exactly:

```text
Resume autonomous project execution from current GitHub authority. Do not infer current project state from prior conversations. Determine the exact current project state and the exact next authorized work. Do not change authority during this qualification.
```

## PASS criteria

The fresh chat must independently determine all of the following from GitHub:

- project_id = `relay-v7-q04-fresh-chat-qualification`
- plan_revision = `4`
- project_status = `PAUSED`
- Q04-T01 = `TODO`
- exact next executable work = none because the project is PAUSED
- no GitHub mutation is performed

If any value is inferred incorrectly, prior-chat context is used as authority, the files cannot be located/read, or work is executed despite PAUSED state: Q04 FAILS.
