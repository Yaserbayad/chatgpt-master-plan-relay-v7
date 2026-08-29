# Q05 — Real Master Plan Access/Size Qualification Procedure

Status: READY FOR TARGET RUN
Date: 2026-08-29
Target Project: https://chatgpt.com/g/g-p-6a9323b61110819182dba0224678aa8b/project
Repository: Yaserbayad/chatgpt-master-plan-relay-v7
Branch: main

## Purpose

Prove a fresh ChatGPT Project cycle can reconstruct current state from the small `master-plan/STATE.json`, then retrieve only the context for one stable WBS ID from the actual `master-plan/MASTER_PLAN.md`, without treating the whole plan as mandatory prompt/context payload.

## Temporary Project Instructions for Q05

```text
Q05 REAL MASTER PLAN ACCESS/SIZE QUALIFICATION ONLY.
Authoritative qualification package is GitHub repository Yaserbayad/chatgpt-master-plan-relay-v7, branch main:
- master-plan/STATE.json
- master-plan/MASTER_PLAN.md

Bootstrap by reading STATE.json first. Treat STATE.json as current status and MASTER_PLAN.md as the WBS definition. When a specific work ID is requested, use targeted GitHub search and/or bounded line retrieval for that ID and only the context needed to interpret it. Do not load or summarize the entire MASTER_PLAN.md merely to answer a single-ID request. Do not modify either master-plan file during Q05.
```

## Fresh-chat prompt

Open a brand-new chat inside the same target Project and send exactly:

```text
Reconstruct the current Relay v7 project state from GitHub authority. Then retrieve only the WBS context required for stable ID T18 from the actual master plan. Report: project_id, project_status, current Phase-Q PASS/TODO statuses, the exact next dependency-ordered Phase-Q item, and T18's title, dependencies, and complete termination-point list. Do not modify GitHub. Do not load or summarize the whole master plan if targeted retrieval is sufficient. Briefly state which GitHub files/ranges/searches you actually read.
```

## PASS criteria

The fresh cycle must:

1. read `master-plan/STATE.json` and identify:
   - project_id = `chatgpt-master-plan-relay-v7`
   - project_status = `ACTIVE`
   - Q01, Q02, Q03, Q04, Q06 = `PASS`
   - Q05, Q07–Q16 = `TODO`
   - exact next dependency-ordered Phase-Q item = `Q05`
2. retrieve stable ID `T18` from `master-plan/MASTER_PLAN.md` and report:
   - title = `Crash-window fault injection`
   - depends on = `I13–I18`
   - termination points exactly covering:
     - before FENCE
     - after FENCE
     - during Submit
     - immediately after Submit
     - after fresh conversation ID
     - during response generation
     - after project artifact change but before STATE update
     - after STATE update before ORCH
3. use bounded/targeted plan retrieval rather than requiring a whole-plan summary/load for this single-ID lookup;
4. make no GitHub mutation.

If the chat cannot find the ID without whole-plan ingestion, cannot distinguish status from plan definition, reports stale state, or mutates authority: Q05 FAILS.
