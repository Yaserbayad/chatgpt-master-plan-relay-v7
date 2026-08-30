import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root=path.resolve(new URL('..',import.meta.url).pathname);
const prod=path.join(root,'production');
const harness=fs.readFileSync(path.join(prod,'RUN_LIGHT_MASTER_QUALIFICATION.ps1'),'utf8');
const bridge=fs.readFileSync(path.join(prod,'RelayCodexLightProduction.ps1'),'utf8');
const watcher=fs.readFileSync(path.join(prod,'LIGHT_PRODUCTION_WATCHER.js'),'utf8');
const contract=fs.readFileSync(path.join(root,'MASTER_QUALIFICATION_CONTRACT.md'),'utf8');

for(const token of [
  "label='SEED'","label='SOAK_01'","label='SOAK_02'","label='SOAK_03'","label='SOAK_04'","label='SOAK_05'","label='TERMINAL_STOP'",
  "expected_action='STOP'","expected_action='SEND_PROMPT'","material_send=$false","material_send=$true",
  'master_qualification_mode = $true','expected_conversation_id','expected_user_message_id','expected_assistant_message_id','expected_assistant_text_sha256','expected_action','expected_prompt_sha256',
  'conversation continuity','user-message chain','assistant-message chain','source assistant sha256','nonce reused','Codex prompt sha256',
  'baseline submit surface','pasted submit surface','copy sentinel','staged copy','Send count','submission confirmation','next completion',
  'STOP Send count','STOP submission','STOP next completion','MASTER_SUMMARY.csv','SHA256.txt','CYCLES_REQUIRED=7',
  '[IO.Directory]::CreateDirectory($MacroDir)','[IO.Directory]::CreateDirectory($LightDir)','codex-cli 0.151.0'
]) assert.ok(harness.includes(token),`master harness missing ${token}`);

assert.equal((harness.match(/\[pscustomobject\]@\{ index=/g)||[]).length,7,'must define exactly seven cycles');
assert.equal((harness.match(/qualification_mode=\$false/g)||[]).length,6,'cycles 1-6 must use normal production mode');
assert.equal((harness.match(/material_send=\$true/g)||[]).length,6,'exactly six material sends');
assert.equal((harness.match(/material_send=\$false/g)||[]).length,1,'exactly one no-send terminal cycle');
assert.ok(!harness.includes('Invoke-WebRequest'));
assert.ok(!harness.includes('FRESH_CHAT'));
assert.ok(!harness.includes('LIGHT_PRODUCTION_STATE.csv') || !/Remove-Item[^\n]*LIGHT_PRODUCTION_STATE/.test(harness),'must not reset durable dedupe state');
assert.ok(!/uiv\.|browser\.click|browser\.type/.test(harness),'PowerShell supervisor must not control ChatGPT directly');

for(const token of [
  '$MasterQualificationMode = $false','master_qualification_mode','master qualification conversation id mismatch','master qualification user message id mismatch',
  'master qualification assistant message id mismatch','master qualification assistant text sha256 mismatch','master qualification action mismatch','master qualification prompt sha256 mismatch'
]) assert.ok(bridge.includes(token),`bridge missing ${token}`);
assert.ok(bridge.indexOf('master qualification action mismatch') < bridge.indexOf('Write-BridgeClipboard -Action $Action'),'semantic mismatch must fail before returning an actionable result');
assert.ok(watcher.includes('bridge_prompt_sha256'),'watcher must expose the Codex prompt hash to the independent supervisor');

for(const token of ['Seven-cycle plan','Cycles 1-5 — production semantic soak','Cycle 6 — production terminal STOP','never automatically retried','fresh-chat/recovery remains the next separate stage']) assert.ok(contract.includes(token),`contract missing ${token}`);
console.log('LIGHT MASTER QUALIFICATION STATIC CONTRACT: PASS');
