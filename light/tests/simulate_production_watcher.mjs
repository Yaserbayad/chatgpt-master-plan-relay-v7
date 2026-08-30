import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const source=fs.readFileSync(new URL('../production/LIGHT_PRODUCTION_WATCHER.js',import.meta.url),'utf8');
const projectUrl='https://chatgpt.com/g/g-p-6a9323b61110819182dba0224678aa8b/c/convo-1';
const targetPrompt='Reply exactly LIGHT_PRODUCTION_TARGET_OK.';
const composerLocator='css=[role="textbox"][contenteditable="true"][aria-label="Chat with ChatGPT"]';
function message(author,id,text){return {text,attributes:{'data-message-author-role':author,'data-message-id':id},getAttribute(n){return this.attributes[n]??null;}};}
function surface(aria){return {kind:'submit',attributes:{'aria-label':aria},getAttribute(n){return this.attributes[n]??null;}};}
function composer(){return {kind:'composer',text:'',value:'',attributes:{},getAttribute(){return null;}};}

function run(mode='success'){
  let clipboard='ORIGINAL_CLIPBOARD',generating=mode==='generating',selectedAll=false,focused=false,composerText='',sendClicks=0,bridgeCalls=0,postSendSleeps=0,newUser=false,nextAssistant=false,runCalledWhileGenerating=false;
  const typed=[]; const csv=new Map(); const messages=[message('user','user-1','Initial'),message('assistant','assistant-1','Completed')];
  const uiv={
    tabs:{list:()=>[{index:1,url:projectUrl}],select:()=>({index:1,url:projectUrl})},
    findElements(locator){
      if(locator.includes('stop-button')) return generating?[{kind:'stop'}]:[];
      if(locator.includes('data-message-author-role')) return messages.slice();
      if(locator.includes('role="textbox"')||locator.includes('prompt-textarea')||locator.includes('data-virtualkeyboard')) return [composer()];
      if(locator.includes('composer-submit-button-color')) return [surface(composerText?'Send prompt':'Start Voice')];
      return [];
    },
    setVar(){},getVar:n=>n==='!xrun_exitcode'?'0':'',
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
      assert.equal(command,'XRunAndWait'); bridgeCalls++; if(generating)runCalledWhileGenerating=true; const e=JSON.parse(clipboard);
      clipboard=JSON.stringify({protocol:'relay-light-production-action-v1',nonce:mode==='stale'?e.nonce+'_STALE':e.nonce,conversation_id:e.conversation_id,assistant_message_id:e.assistant_message_id,assistant_text_length:e.assistant_text_length,assistant_text_sha256:'a'.repeat(64),action:mode==='stop'?'STOP':mode==='human'?'HUMAN':'SEND_PROMPT',prompt:(mode==='stop'||mode==='human')?'':targetPrompt,prompt_sha256:(mode==='stop'||mode==='human')?'':'b'.repeat(64),reason:'simulated',codex_version:'codex-cli-test',codex_exit_code:0,codex_duration_ms:1});
    },
    browser:{
      click(m){if(m===composerLocator){focused=true;return;}if(m&&m.kind==='composer'){focused=false;return;}if(m&&m.kind==='submit'){if(mode==='send_click_fail')throw new Error('send click fail');sendClicks++;return;}throw new Error('bad click');},
      type(text){
        typed.push(String(text));
        if(!focused)return;
        if(text==='${KEY_CTRL+KEY_V}'){if(mode!=='paste_noop')composerText=clipboard;}
        else if(text==='${KEY_CTRL+KEY_A}')selectedAll=true;
        else if(text==='${KEY_CTRL+KEY_C}'){
          assert.equal(selectedAll,true);
          if(mode==='copy_noop') return;
          clipboard=mode==='copy_mismatch'?composerText+'X':composerText+(mode==='success_nbsp'?'\u00A0\u00A0':'');
        } else throw new Error('unexpected trusted key chord '+text);
      }
    },
    csv:{exists:n=>csv.has(n),read:n=>csv.get(n),write:(n,r)=>csv.set(n,r)},files:{exportToDownloads(){}},log(){}
  };
  if(mode==='duplicate')csv.set('LIGHT_PRODUCTION_STATE.csv',[['assistant_message_id','status','updated_at'],['assistant-1','SENT_CONFIRMED','x']]);
  let error=null;try{vm.runInNewContext(source,{uiv,Date,Math,JSON,Number,Set,Array,String,Error,RegExp,Object},{timeout:3000});}catch(e){error=e;}
  const target=[...csv.entries()].find(([k])=>k.startsWith('LIGHT_PRODUCTION_target_'))?.[1]||null;
  return {error,clipboard,typed,sendClicks,bridgeCalls,csv,runCalledWhileGenerating,target};
}

for(const mode of ['success','success_nbsp']){const r=run(mode);assert.equal(r.error,null,`${mode} must pass`);assert.deepEqual(r.typed,['${KEY_CTRL+KEY_V}','${KEY_CTRL+KEY_A}','${KEY_CTRL+KEY_C}']);assert.equal(r.sendClicks,1);assert.equal(r.clipboard,'ORIGINAL_CLIPBOARD');const h=r.target[0],v=r.target[1];assert.equal(h.includes('bridge_prompt_sha256'),true);assert.equal(v[h.indexOf('bridge_prompt_sha256')],'b'.repeat(64));}
const gen=run('generating');assert.equal(gen.error,null);assert.equal(gen.runCalledWhileGenerating,false);assert.equal(gen.sendClicks,1);
const pasteNoop=run('paste_noop');assert.ok(pasteNoop.error);assert.match(String(pasteNoop.error.message),/submit surface did not transition to Send prompt/);assert.equal(pasteNoop.sendClicks,0);
const copyNoop=run('copy_noop');assert.ok(copyNoop.error);assert.match(String(copyNoop.error.message),/copy-back did not replace sentinel/);assert.equal(copyNoop.sendClicks,0);
const copyBad=run('copy_mismatch');assert.ok(copyBad.error);assert.match(String(copyBad.error.message),/staged prompt copy-back does not match/);assert.equal(copyBad.sendClicks,0);
const stale=run('stale');assert.ok(stale.error);assert.match(String(stale.error.message),/STALE_IDENTITY/);assert.equal(stale.sendClicks,0);assert.equal(stale.typed.length,0);
const clickFail=run('send_click_fail');assert.ok(clickFail.error);assert.equal(clickFail.sendClicks,0);assert.equal(clickFail.csv.get('LIGHT_PRODUCTION_STATE.csv')[1][1],'SEND_AMBIGUOUS');
const amb=run('ambiguous');assert.ok(amb.error);assert.match(String(amb.error.message),/SEND_AMBIGUOUS_NO_RETRY/);assert.equal(amb.sendClicks,1);assert.equal(amb.csv.get('LIGHT_PRODUCTION_STATE.csv')[1][1],'SEND_AMBIGUOUS');
for(const mode of ['stop','human']){const r=run(mode);assert.equal(r.error,null);assert.equal(r.sendClicks,0);assert.equal(r.typed.length,0);}
const dup=run('duplicate');assert.ok(dup.error);assert.match(String(dup.error.message),/DUPLICATE_SOURCE_TURN/);assert.equal(dup.bridgeCalls,0);
console.log('LIGHT PRODUCTION SENTINEL/SUBMIT-SURFACE SIMULATION: PASS');
