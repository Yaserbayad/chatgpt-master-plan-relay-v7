import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const sha=s=>crypto.createHash('sha256').update(s,'utf8').digest('hex');
const steps=[
  'NEXT ACTION REQUIRED: Send exactly LIGHT_SOAK_01 and nothing else.',
  'NEXT ACTION REQUIRED: Send exactly LIGHT_SOAK_02 and nothing else.',
  'NEXT ACTION REQUIRED: Send exactly LIGHT_SOAK_03 and nothing else.',
  'NEXT ACTION REQUIRED: Send exactly LIGHT_SOAK_04 and nothing else.',
  'NEXT ACTION REQUIRED: Send exactly LIGHT_SOAK_05 and nothing else.',
  'OBJECTIVE COMPLETE. No further same-chat message is useful. Stop.'
];
const prompts=['SEED_HASH_ONLY','LIGHT_SOAK_01','LIGHT_SOAK_02','LIGHT_SOAK_03','LIGHT_SOAK_04','LIGHT_SOAK_05',''];
const actions=['SEND_PROMPT','SEND_PROMPT','SEND_PROMPT','SEND_PROMPT','SEND_PROMPT','SEND_PROMPT','STOP'];

function validRows(){
  const rows=[];
  for(let i=0;i<7;i++){
    const send=i<6;
    rows.push({
      result:'PASS',failure_reason:'',failure_class:send?'NONE':'STOP_REQUESTED',conversation_id:'conv-1',
      source_user_message_id:i===0?'u0':`u${i}`,source_assistant_message_id:i===0?'a0':`a${i}`,
      nonce:`n${i}`,xrun_exit_code:'0',bridge_action:actions[i],bridge_prompt_sha256:i===0?'seedhash':(i<6?sha(prompts[i]):''),codex_version:'codex-cli 0.151.0',codex_exit_code:'0',
      assistant_text_sha256:i===0?'arbitrary':sha(steps[i-1]),browser_identity_revalidated:'true',
      baseline_submit_aria:send?'Start Voice':'',pasted_submit_aria:send?'Send prompt':'',copy_sentinel_replaced:send?'true':'false',staged_copy_exact:send?'true':'false',
      send_click_count:send?'1':'0',submission_confirmed:send?'true':'false',new_user_message_id:send?`u${i+1}`:'',next_completion_observed:send?'true':'false',next_assistant_message_id:send?`a${i+1}`:''
    });
  }
  return rows;
}
function verify(rows){
  assert.equal(rows.length,7);
  const nonces=new Set(); const conv=rows[0].conversation_id;
  for(let i=0;i<7;i++){
    const r=rows[i],send=i<6;
    assert.equal(r.result,'PASS'); assert.equal(r.failure_reason,''); assert.equal(r.xrun_exit_code,'0'); assert.equal(r.codex_exit_code,'0'); assert.equal(r.codex_version,'codex-cli 0.151.0'); assert.equal(r.browser_identity_revalidated,'true');
    assert.equal(r.conversation_id,conv); assert.ok(r.nonce&&!nonces.has(r.nonce)); nonces.add(r.nonce); assert.equal(r.bridge_action,actions[i]);
    if(i>0){assert.equal(r.source_user_message_id,rows[i-1].new_user_message_id);assert.equal(r.source_assistant_message_id,rows[i-1].next_assistant_message_id);assert.equal(r.assistant_text_sha256,sha(steps[i-1]));}
    const expectedPrompt=i===0?'seedhash':(i<6?sha(prompts[i]):''); assert.equal(r.bridge_prompt_sha256,expectedPrompt);
    if(send){assert.equal(r.failure_class,'NONE');assert.equal(r.baseline_submit_aria,'Start Voice');assert.equal(r.pasted_submit_aria,'Send prompt');assert.equal(r.copy_sentinel_replaced,'true');assert.equal(r.staged_copy_exact,'true');assert.equal(r.send_click_count,'1');assert.equal(r.submission_confirmed,'true');assert.equal(r.next_completion_observed,'true');assert.ok(r.new_user_message_id&&r.next_assistant_message_id);}
    else{assert.equal(r.failure_class,'STOP_REQUESTED');assert.equal(r.send_click_count,'0');assert.equal(r.submission_confirmed,'false');assert.equal(r.new_user_message_id,'');assert.equal(r.next_completion_observed,'false');assert.equal(r.next_assistant_message_id,'');}
  }
  return true;
}
assert.equal(verify(validRows()),true);
const cases=[
  ['conversation drift',r=>r[3].conversation_id='conv-2'],
  ['user chain break',r=>r[2].source_user_message_id='wrong'],
  ['assistant chain break',r=>r[4].source_assistant_message_id='wrong'],
  ['nonce reuse',r=>r[5].nonce=r[4].nonce],
  ['wrong source assistant semantic state',r=>r[3].assistant_text_sha256='0'.repeat(64)],
  ['wrong Codex token',r=>r[2].bridge_prompt_sha256='f'.repeat(64)],
  ['staging transition failure',r=>r[1].pasted_submit_aria='Start Voice'],
  ['sentinel failure',r=>r[1].copy_sentinel_replaced='false'],
  ['double Send',r=>r[4].send_click_count='2'],
  ['early STOP',r=>r[3].bridge_action='STOP'],
  ['terminal Send',r=>{r[6].bridge_action='SEND_PROMPT';r[6].send_click_count='1';}],
  ['terminal completion wait',r=>r[6].next_completion_observed='true']
];
for(const [name,mutate] of cases){const rows=validRows();mutate(rows);assert.throws(()=>verify(rows),undefined,name);}
console.log('LIGHT MASTER QUALIFICATION ACCEPTANCE SIMULATION: PASS');
