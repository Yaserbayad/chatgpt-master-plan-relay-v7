import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const source = fs.readFileSync(new URL('../production/LIGHT_PRODUCTION_WATCHER.js', import.meta.url), 'utf8');
const projectUrl = 'https://chatgpt.com/g/g-p-6a9323b61110819182dba0224678aa8b/c/convo-1';
const targetPrompt = 'Reply exactly LIGHT_PRODUCTION_TARGET_OK.';
function message(author,id,text){return {text,getAttribute(n){return n==='data-message-author-role'?author:n==='data-message-id'?id:'';}};}

function run(mode='success'){
  let clipboard='ORIGINAL_CLIPBOARD', xrunExit='0', generating=mode==='generating', focused=false, selectedAll=false;
  let composerText='', sendClicks=0, bridgeCalls=0, postSendSleeps=0, newUser=false, nextAssistant=false, runCalledWhileGenerating=false;
  const typed=[]; const csv=new Map();
  const messages=[message('user','user-1','Initial'),message('assistant','assistant-1','Completed')];
  const composerSnapshot=()=> mode==='snapshot_stale' ? '' : composerText;
  const uiv={
    tabs:{list:()=>[{index:1,url:projectUrl}],select:()=>({index:1,url:projectUrl})},
    findElements(locator,opts={}){
      if(locator.includes('stop-button')) return generating?[{kind:'stop'}]:[];
      if(locator.includes('data-message-author-role')) return messages.slice();
      if(locator.includes('prompt-textarea')||locator.includes('contenteditable')) return [{kind:'composer',text:composerSnapshot(),value:composerSnapshot()}];
      if(locator.includes('composer-submit-button-color')&&locator.includes('Send prompt')&&opts.includeHidden===true) return composerText?[{kind:'send',attributes:{},getAttribute:n=>n==='aria-disabled'?'false':null}]:[];
      return [];
    },
    setVar(){}, getVar:n=>n==='!xrun_exitcode'?xrunExit:'',
    sleep(){
      if(mode==='generating'&&generating&&sendClicks===0) generating=false;
      if(sendClicks){
        postSendSleeps++;
        if(mode!=='ambiguous'&&!newUser&&postSendSleeps>=1){messages.push(message('user','user-2',targetPrompt));newUser=true;generating=true;composerText='';}
        if(newUser&&!nextAssistant&&postSendSleeps>=3){messages.push(message('assistant','assistant-2','LIGHT_PRODUCTION_TARGET_OK'));nextAssistant=true;generating=false;}
      }
    },
    clipboard:{read:()=>clipboard,write:v=>{clipboard=String(v);}},
    run(command){
      assert.equal(command,'XRunAndWait'); bridgeCalls++; if(generating) runCalledWhileGenerating=true;
      const e=JSON.parse(clipboard);
      clipboard=JSON.stringify({protocol:'relay-light-production-action-v1',nonce:mode==='stale'?e.nonce+'_STALE':e.nonce,conversation_id:e.conversation_id,assistant_message_id:e.assistant_message_id,assistant_text_length:e.assistant_text_length,assistant_text_sha256:'a'.repeat(64),action:mode==='stop'?'STOP':mode==='human'?'HUMAN':'SEND_PROMPT',prompt:(mode==='stop'||mode==='human')?'':targetPrompt,prompt_sha256:'b'.repeat(64),reason:'simulated',codex_version:'codex-cli-test',codex_exit_code:0,codex_duration_ms:1});
    },
    browser:{
      click(m){if(m.kind==='composer'){focused=true;return;} if(m.kind==='send'){if(mode==='send_click_fail')throw new Error('send click fail');sendClicks++;return;} throw new Error('bad click');},
      type(text){
        assert.equal(focused,true); typed.push(String(text));
        if(text==='${KEY_CTRL+KEY_V}') composerText=clipboard;
        else if(text==='${KEY_CTRL+KEY_A}') selectedAll=true;
        else if(text==='${KEY_CTRL+KEY_C}') {assert.equal(selectedAll,true);clipboard=mode==='copyback_mismatch'?composerText+'X':composerText;}
        else throw new Error('unexpected trusted key chord '+text);
      }
    },
    csv:{exists:n=>csv.has(n),read:n=>csv.get(n),write:(n,r)=>csv.set(n,r)},
    files:{exportToDownloads(){}}, log(){}
  };
  if(mode==='duplicate') csv.set('LIGHT_PRODUCTION_STATE.csv',[['assistant_message_id','status','updated_at'],['assistant-1','SENT_CONFIRMED','x']]);
  let error=null; try{vm.runInNewContext(source,{uiv,console,Date,Math,JSON,Number,Set,Array,String,Error,RegExp},{timeout:3000});}catch(e){error=e;}
  return {error,clipboard,typed,sendClicks,bridgeCalls,csv,runCalledWhileGenerating};
}

for(const mode of ['success','snapshot_stale']){
  const r=run(mode); assert.equal(r.error,null,`${mode} must pass`); assert.deepEqual(r.typed,['${KEY_CTRL+KEY_V}','${KEY_CTRL+KEY_A}','${KEY_CTRL+KEY_C}']); assert.equal(r.sendClicks,1); assert.equal(r.clipboard,'ORIGINAL_CLIPBOARD');
}

const gen=run('generating'); assert.equal(gen.error,null); assert.equal(gen.runCalledWhileGenerating,false); assert.equal(gen.sendClicks,1);
const clickFail=run('send_click_fail'); assert.ok(clickFail.error); assert.equal(clickFail.sendClicks,0); assert.equal(clickFail.csv.get('LIGHT_PRODUCTION_STATE.csv')[1][1],'SEND_AMBIGUOUS');
const bad=run('copyback_mismatch'); assert.ok(bad.error); assert.match(String(bad.error.message),/staged prompt copy-back does not match/); assert.equal(bad.sendClicks,0); assert.equal(bad.clipboard,'ORIGINAL_CLIPBOARD');
const stale=run('stale'); assert.ok(stale.error); assert.match(String(stale.error.message),/STALE_IDENTITY/); assert.equal(stale.sendClicks,0); assert.equal(stale.typed.length,0);
const amb=run('ambiguous'); assert.ok(amb.error); assert.match(String(amb.error.message),/SEND_AMBIGUOUS_NO_RETRY/); assert.equal(amb.sendClicks,1); assert.equal(amb.csv.get('LIGHT_PRODUCTION_STATE.csv')[1][1],'SEND_AMBIGUOUS');
for(const mode of ['stop','human']){const r=run(mode); assert.equal(r.error,null); assert.equal(r.sendClicks,0); assert.equal(r.typed.length,0);}
const dup=run('duplicate'); assert.ok(dup.error); assert.match(String(dup.error.message),/DUPLICATE_SOURCE_TURN/); assert.equal(dup.bridgeCalls,0);
console.log('LIGHT PRODUCTION STAGE COPY-BACK SIMULATION: PASS');
