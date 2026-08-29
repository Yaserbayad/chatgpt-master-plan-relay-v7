# Q04 Fresh-Chat Authority Qualification Plan

Status: QUALIFICATION-ONLY
Project ID: relay-v7-q04-fresh-chat-qualification

## Purpose
Prove that a fresh ChatGPT Project conversation can reconstruct current GitHub authority from Project Instructions plus a generic bootstrap, without relying on prior conversation memory.

## Rules
- GitHub files in this qualification package are the only authority for this test.
- Do not infer state from earlier chats.
- `STATE.json` determines current execution state.
- When the project is PAUSED, no governed work is eligible to execute.

## Work

### Q04-T01 — Harmless interpretation sentinel
- Order: 1
- Status source: STATE.json
- Dependency: none
- Acceptance: Must not execute while project_status is PAUSED.

## Expected fresh-chat interpretation
A conforming fresh chat should determine:
- project_id = `relay-v7-q04-fresh-chat-qualification`
- plan_revision = 4
- project_status = `PAUSED`
- Q04-T01 = `TODO`
- next executable work = none, because the project is PAUSED
