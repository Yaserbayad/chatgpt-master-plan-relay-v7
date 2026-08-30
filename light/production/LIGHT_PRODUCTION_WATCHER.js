// Light production first increment: one bounded same-chat SEND qualification.
const TARGET_PROJECT_TOKEN = 'g-p-6a9323b61110819182dba0224678aa8b';
const BRIDGE_PATH = 'C:\\Users\\usr\\Documents\\CodexLight\\RelayCodexLightProduction.ps1';
const SCHEMA_PATH = 'C:\\Users\\usr\\Documents\\CodexLight\\LIGHT_PRODUCTION_ACTION.schema.json';
const CONFIG_PATH = 'C:\\Users\\usr\\Documents\\CodexLight\\production_config.json';
const INPUT_PROTOCOL = 'relay-light-production-event-v1';
const OUTPUT_PROTOCOL = 'relay-light-production-action-v1';
const MESSAGE = 'css=[data-message-author-role]';
const STOP = 'css=[data-testid="stop-button"]';
const COMPOSER = 'css=[role="textbox"][contenteditable="true"][aria-label="Chat with ChatGPT"]';
const SUBMIT_SURFACE = 'css=button[class*="composer-submit-button-color"]';
const STATE_FILE = 'LIGHT_PRODUCTION_STATE.csv';
const LIGHT_MAX_SENDS = 1;
const POLL_MS = 3000;
const STABLE_MS = 1500;
const MAX_COMPLETION_POLLS = 180;
const SEND_CONFIRM_POLLS = 6;
const SEND_CONFIRM_MS = 2000;

function clean(v) { return v == null ? '' : String(v).replace(/\s+/g,' ').trim(); }
function raw(v) { return v == null ? '' : String(v); }
function normalize(v) { return raw(v).replace(/\r\n/g,'\n').replace(/\r/g,'\n'); }
function normalizeEditorClipboard(v) { return normalize(v).replace(/\u00A0+$/,''); }
function attr(m,n) { try { const v=m.getAttribute(n); return v==null?'':String(v); } catch (_) { return m&&m.attributes&&m.attributes[n]!=null?String(m.attributes[n]):''; } }
function all(locator, timeout=2, includeHidden=false) { const o={required:false,timeout}; if(includeHidden)o.includeHidden=true; const r=uiv.findElements(locator,o); return Array.isArray(r)?r:[]; }
function hasAttr(m,n) { const a=m&&m.attributes?m.attributes:{}; if(Object.prototype.hasOwnProperty.call(a,n)) return true; try{return m.getAttribute(n)!==null;}catch(_){return false;} }
function enabled(m) { return !!m&&!hasAttr(m,'disabled')&&clean(attr(m,'aria-disabled')).toLowerCase()!=='true'; }
function submitSurfaceSnapshot() {
  const xs=all(SUBMIT_SURFACE,1,false);
  if(xs.length!==1) return {count:xs.length,match:null,aria:'',disabled:'',ariaDisabled:''};
  const m=xs[0]; return {count:1,match:m,aria:clean(attr(m,'aria-label')),disabled:hasAttr(m,'disabled')?'true':'false',ariaDisabled:clean(attr(m,'aria-disabled'))};
}
function isVoiceSurface(s) { return s.count===1&&s.aria.toLowerCase()==='start voice'; }
function isSendSurface(s) { return s.count===1&&enabled(s.match)&&s.aria.toLowerCase()==='send prompt'; }
function conversationId(url) { const m=String(url||'').match(/\/c\/([^/?#]+)/); return m?m[1]:''; }
function makeNonce() { return `LIGHT_PROD_${new Date().toISOString().replace(/[^0-9A-Za-z]/g,'')}_${Math.random().toString(36).slice(2,14)}`; }
function messageText(m) { const t=raw(m&&m.text); return t || raw(m&&m.value); }
function classifyFailure(reason,response) {
  const s=`${clean(reason)} ${clean(response&&response.reason)}`.toLowerCase();
  if(/workspace is out of credits|out of credits|usage limit reached|reached your usage limit|add credits to continue|increase your limits to continue/.test(s)) return 'CODEX_CREDITS_REQUIRED';
  if(/human/.test(s)) return 'HUMAN_REQUIRED';
  return 'OTHER';
}
function tabBinding() {
  const tabs=uiv.tabs.list();
  const candidates=tabs.filter(t=>t&&clean(t.url).includes(TARGET_PROJECT_TOKEN)&&conversationId(clean(t.url)));
  if(candidates.length!==1) throw new Error(`WRONG_TAB_BINDING: expected exactly one configured-Project conversation tab; found ${candidates.length}`);
  const index=Number(candidates[0].index); if(!Number.isFinite(index)||index<1) throw new Error('WRONG_TAB_BINDING: invalid tab index');
  return index;
}
function snapshot(boundIndex) {
  const selected=uiv.tabs.select(boundIndex); const url=clean(selected&&selected.url); const cid=conversationId(url);
  if(!url.includes(TARGET_PROJECT_TOKEN)||!cid) throw new Error('WRONG_TAB_BINDING: selected tab left configured Project conversation');
  const generating=all(STOP,1).length!==0;
  const seen=new Set(); const messages=[];
  for(const m of all(MESSAGE,2,true)) { const author=clean(attr(m,'data-message-author-role')); const id=clean(attr(m,'data-message-id')); if((author!=='user'&&author!=='assistant')||!id||seen.has(id))continue; seen.add(id); messages.push({author,id,text:messageText(m)}); }
  let ui=-1; for(let i=messages.length-1;i>=0;i-=1){ if(messages[i].author==='user'){ui=i;break;} }
  const user=ui>=0?messages[ui]:null; const assistants=ui>=0?messages.slice(ui+1).filter(x=>x.author==='assistant'):[]; const assistant=assistants.length?assistants[assistants.length-1]:null;
  return {url,conversationId:cid,generating,user,assistant,messages};
}
function sameCompleted(a,b){ return !!(a&&b&&!a.generating&&!b.generating&&a.user&&b.user&&a.assistant&&b.assistant&&a.conversationId===b.conversationId&&a.user.id===b.user.id&&a.assistant.id===b.assistant.id&&a.assistant.text===b.assistant.text&&raw(a.assistant.text).trim()); }
function waitStableCompleted(boundIndex, requiredUserId='') {
  for(let i=0;i<MAX_COMPLETION_POLLS;i+=1){
    const a=snapshot(boundIndex);
    if(!a.generating&&a.user&&a.assistant&&(!requiredUserId||a.user.id===requiredUserId)){
      uiv.sleep(STABLE_MS); const b=snapshot(boundIndex); if(sameCompleted(a,b)&&(!requiredUserId||b.user.id===requiredUserId)) return b;
    }
    uiv.sleep(POLL_MS);
  }
  throw new Error('UNSTABLE_COMPLETION: no stable completed assistant observed within bounded polling window');
}
function readState(){ if(!uiv.csv.exists(STATE_FILE)) return null; const rows=uiv.csv.read(STATE_FILE); if(!Array.isArray(rows)||rows.length<2)return null; return {assistant_message_id:clean(rows[1][0]),status:clean(rows[1][1]),updated_at:clean(rows[1][2])}; }
function writeState(id,status){ uiv.csv.write(STATE_FILE,[['assistant_message_id','status','updated_at'],[id,status,new Date().toISOString()]]); }
function assertSourceIdentity(boundIndex,source){ const s=snapshot(boundIndex); if(s.generating)throw new Error('GENERATING: ChatGPT started generating before action'); if(!s.user||!s.assistant||s.conversationId!==source.conversationId||s.user.id!==source.user.id||s.assistant.id!==source.assistant.id||s.user.text!==source.user.text||s.assistant.text!==source.assistant.text)throw new Error('STALE_IDENTITY: source conversation/message identity changed'); return s; }
function confirmSubmission(boundIndex,source,prompt){
  for(let i=0;i<SEND_CONFIRM_POLLS;i+=1){ const s=snapshot(boundIndex); if(s.user&&s.user.id!==source.user.id&&raw(s.user.text).replace(/\r/g,'')===raw(prompt).replace(/\r/g,'')) return s.user; uiv.sleep(SEND_CONFIRM_MS); }
  return null;
}

uiv.setVar('!TIMEOUT_MACRO',900);
const boundIndex=tabBinding(); const originalClipboard=raw(uiv.clipboard.read()); const startedAt=Date.now();
let source=null,response=null,nonce='',xrunExit='',result='FAIL',failureReason='',failureClass='NONE',sendClickCount=0,submissionConfirmed=false,nextCompletionObserved=false,browserIdentityRevalidated=false,newUserId='',nextAssistantId='',baselineSubmitAria='',pastedSubmitAria='',copySentinelReplaced=false,stagedCopyExact=false;
try {
  source=waitStableCompleted(boundIndex);
  const prior=readState();
  if(prior&&prior.assistant_message_id===source.assistant.id&&(prior.status==='SENT_CONFIRMED'||prior.status==='SEND_AMBIGUOUS')) throw new Error(`DUPLICATE_SOURCE_TURN: ${prior.status}`);
  nonce=makeNonce();
  const event={protocol:INPUT_PROTOCOL,nonce,observed_at:new Date().toISOString(),project_token:TARGET_PROJECT_TOKEN,url:source.url,conversation_id:source.conversationId,user_message_id:source.user.id,user_text:source.user.text,assistant_message_id:source.assistant.id,assistant_text_length:source.assistant.text.length,assistant_text:source.assistant.text};
  const eventJson=JSON.stringify(event); uiv.clipboard.write(eventJson); if(uiv.clipboard.read()!==eventJson) throw new Error('BRIDGE_FAILURE: clipboard event round-trip mismatch');
  const args=`-NoProfile -ExecutionPolicy Bypass -File "${BRIDGE_PATH}" -SchemaPath "${SCHEMA_PATH}" -ConfigPath "${CONFIG_PATH}"`;
  let xrunError=''; try{uiv.run('XRunAndWait','powershell.exe',args);}catch(e){xrunError=clean(e&&e.message?e.message:e);} xrunExit=clean(uiv.getVar('!xrun_exitcode'));
  const returned=raw(uiv.clipboard.read()); try{response=JSON.parse(returned);}catch(_){throw new Error(`BRIDGE_FAILURE: non-JSON response; exit=${xrunExit||'(empty)'}`);}
  if(xrunError||xrunExit!=='0') throw new Error(`BRIDGE_FAILURE: exit=${xrunExit||'(empty)'}; action=${clean(response.action)}; reason=${clean(response.reason)}; ${xrunError}`);
  if(response.protocol!==OUTPUT_PROTOCOL||response.nonce!==nonce||response.conversation_id!==source.conversationId||response.assistant_message_id!==source.assistant.id) throw new Error('STALE_IDENTITY: bridge result identity mismatch');
  if(!['SEND_PROMPT','STOP','HUMAN'].includes(response.action)) throw new Error(`INVALID_ACTION: ${clean(response.action)}`);
  browserIdentityRevalidated=!!assertSourceIdentity(boundIndex,source);
  if(response.action==='STOP'){ result='PASS'; failureClass='STOP_REQUESTED'; }
  else if(response.action==='HUMAN'){ result='PASS'; failureClass='HUMAN_REQUIRED'; }
  else {
    const prompt=raw(response.prompt); if(!prompt.trim()) throw new Error('INVALID_ACTION: SEND_PROMPT prompt is empty');
    const beforeStage=assertSourceIdentity(boundIndex,source); browserIdentityRevalidated=!!beforeStage;
    const baselineSurface=submitSurfaceSnapshot(); baselineSubmitAria=baselineSurface.aria;
    if(!isVoiceSurface(baselineSurface)) throw new Error(`COMPOSER_NOT_EMPTY: expected Start Voice baseline; found count=${baselineSurface.count}, aria=${baselineSurface.aria||'(empty)'}`);
    const composerCount=all(COMPOSER,2,false).length; if(composerCount!==1)throw new Error(`STAGE_VERIFY_FAILED: expected exactly one target composer; found ${composerCount}`);
    uiv.clipboard.write(prompt); if(normalize(uiv.clipboard.read())!==normalize(prompt)) throw new Error('STAGE_VERIFY_FAILED: prompt clipboard round-trip mismatch');
    uiv.browser.click(COMPOSER); uiv.browser.type('${KEY_CTRL+KEY_V}'); uiv.sleep(500);
    const pastedSurface=submitSurfaceSnapshot(); pastedSubmitAria=pastedSurface.aria;
    if(!isSendSurface(pastedSurface)) throw new Error(`STAGE_VERIFY_FAILED: submit surface did not transition to Send prompt; found count=${pastedSurface.count}, aria=${pastedSurface.aria||'(empty)'}`);
    const copySentinel=`LIGHT_COPY_SENTINEL_${nonce}_${new Date().toISOString()}`;
    uiv.clipboard.write(copySentinel); if(uiv.clipboard.read()!==copySentinel) throw new Error('STAGE_VERIFY_FAILED: could not seed copy sentinel');
    const stagedCount=all(COMPOSER,2,false).length; if(stagedCount!==1)throw new Error(`STAGE_VERIFY_FAILED: expected exactly one target composer after paste; found ${stagedCount}`);
    uiv.browser.click(COMPOSER); uiv.browser.type('${KEY_CTRL+KEY_A}'); uiv.browser.type('${KEY_CTRL+KEY_C}'); uiv.sleep(250);
    const copied=raw(uiv.clipboard.read()); copySentinelReplaced=copied!==copySentinel;
    if(!copySentinelReplaced) throw new Error('STAGE_VERIFY_FAILED: copy-back did not replace sentinel');
    stagedCopyExact=normalizeEditorClipboard(copied)===normalizeEditorClipboard(prompt);
    if(!stagedCopyExact) throw new Error('STAGE_VERIFY_FAILED: staged prompt copy-back does not match');
    uiv.clipboard.write(originalClipboard);
    assertSourceIdentity(boundIndex,source);
    const sendSurface=submitSurfaceSnapshot(); if(!isSendSurface(sendSurface))throw new Error(`SEND_CONTROL_MISSING: submit surface not Send prompt; count=${sendSurface.count}, aria=${sendSurface.aria||'(empty)'}`);
    const send=sendSurface.match;
    if(sendClickCount>=LIGHT_MAX_SENDS) throw new Error('INVALID_ACTION: material send bound exceeded');
    writeState(source.assistant.id,'SEND_AMBIGUOUS');
    uiv.browser.click(send); sendClickCount+=1;
    const confirmed=confirmSubmission(boundIndex,source,prompt);
    if(!confirmed){ writeState(source.assistant.id,'SEND_AMBIGUOUS'); throw new Error('SEND_AMBIGUOUS_NO_RETRY: Send was clicked once but submission was not confirmed'); }
    submissionConfirmed=true; newUserId=confirmed.id; writeState(source.assistant.id,'SENT_CONFIRMED');
    const next=waitStableCompleted(boundIndex,newUserId); nextCompletionObserved=true; nextAssistantId=next.assistant.id; result='PASS';
  }
} catch(e){ failureReason=clean(e&&e.message?e.message:e); if(failureClass==='NONE')failureClass=classifyFailure(failureReason,response); }
finally { uiv.clipboard.write(originalClipboard); }

const rows=[[
  'result','failure_reason','failure_class','elapsed_ms','conversation_id','source_user_message_id','source_assistant_message_id','nonce','xrun_exit_code','bridge_action','bridge_prompt_sha256','codex_version','codex_exit_code','codex_duration_ms','assistant_text_sha256','browser_identity_revalidated','baseline_submit_aria','pasted_submit_aria','copy_sentinel_replaced','staged_copy_exact','send_click_count','submission_confirmed','new_user_message_id','next_completion_observed','next_assistant_message_id'
],[
  result,failureReason,failureClass,Date.now()-startedAt,source?source.conversationId:'',source&&source.user?source.user.id:'',source&&source.assistant?source.assistant.id:'',nonce,xrunExit,response?clean(response.action):'',response?clean(response.prompt_sha256):'',response?clean(response.codex_version):'',response&&response.codex_exit_code!=null?response.codex_exit_code:'',response&&response.codex_duration_ms!=null?response.codex_duration_ms:'',response?clean(response.assistant_text_sha256):'',browserIdentityRevalidated?'true':'false',baselineSubmitAria,pastedSubmitAria,copySentinelReplaced?'true':'false',stagedCopyExact?'true':'false',sendClickCount,submissionConfirmed?'true':'false',newUserId,nextCompletionObserved?'true':'false',nextAssistantId
]];
const stamp=new Date().toISOString().replace(/[:.]/g,'-'); const file=`LIGHT_PRODUCTION_target_${stamp}.csv`; uiv.csv.write(file,rows); uiv.files.exportToDownloads(file);
if(result!=='PASS')throw new Error(`LIGHT PRODUCTION TARGET FAIL: ${failureReason}; evidence=${file}`);
uiv.log(`LIGHT PRODUCTION TARGET PASS: action=${response&&response.action}; send_clicks=${sendClickCount}; next_completion=${nextCompletionObserved}; ${file}`,'green');
