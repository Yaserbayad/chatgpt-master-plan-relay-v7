// Q10 Same-Project fresh-chat/SPA qualification for ChatGPT Master Plan Relay v7.
// MATERIAL TEST: uses the active Project row's target-proven "Open project home" control,
// then performs exactly ONE trusted Send. Never retries/resends after that Send.

const TARGET_PROJECT_TOKEN = 'g-p-6a9323b61110819182dba0224678aa8b';
const EXPECTED_UIVISION = '10.0.178';
const ACTIVE_PROJECT_ROW = 'css=[data-sidebar-item][data-sidebar-keep-open="true"][data-active][role="button"]';
const PROJECT_HOME_BUTTON = 'css=button[aria-label="Open project home"]';
const OPEN_SIDEBAR = 'css=button[aria-label="Open sidebar"]';
const COMPOSER = 'css=#prompt-textarea[role="textbox"][contenteditable="true"]';
const SEND = 'css=button[class*="composer-submit-button-color"][aria-label="Send prompt"]';
const MARKER = 'Q10_FRESH_CHAT_SPA_PROBE';

function clean(v) { return v == null ? '' : String(v).replace(/\s+/g, ' ').trim(); }
function attrsOf(m) { return m && m.attributes && typeof m.attributes === 'object' ? m.attributes : {}; }
function getAttr(m, n) {
  try { const v = m.getAttribute(n); return v == null ? '' : String(v); }
  catch (_) { const a = attrsOf(m); return Object.prototype.hasOwnProperty.call(a, n) ? String(a[n] == null ? '' : a[n]) : ''; }
}
function hasAttr(m, n) {
  const a = attrsOf(m);
  if (Object.prototype.hasOwnProperty.call(a, n)) return true;
  try { return m.getAttribute(n) !== null; } catch (_) { return false; }
}
function rectOf(m) {
  const r = m && m.rect && typeof m.rect === 'object' ? m.rect : {};
  return {x:Number(r.x)||Number(m&&m.x)||0,y:Number(r.y)||Number(m&&m.y)||0,width:Number(r.width)||0,height:Number(r.height)||0};
}
function visible(m) { const r = rectOf(m); return r.width > 0 && r.height > 0; }
function findAll(locator, timeout = 2, includeHidden = false) {
  const opts = {required:false, timeout};
  if (includeHidden) opts.includeHidden = true;
  const r = uiv.findElements(locator, opts);
  return Array.isArray(r) ? r : [];
}
function uniqueVisible(locator, timeout = 2) { return findAll(locator, timeout, true).filter(visible); }
function currentUrl() {
  const tabs = uiv.tabs.list();
  const tab = tabs.find(t => t && t.current) || tabs.find(t => t && t.active);
  return tab && tab.url ? clean(tab.url) : '';
}
function conversationId(url) {
  const m = String(url || '').match(/\/c\/([^/?#]+)/);
  return m ? m[1] : '';
}
function isProjectRoot(url) { return /\/project(?:[/?#]|$)/.test(String(url || '')) && !conversationId(url); }
function classify(url, oldConversationId) {
  const u = String(url || '');
  if (!u) return 'UNKNOWN_TRANSITIONAL';
  if (u.includes(TARGET_PROJECT_TOKEN)) {
    const cid = conversationId(u);
    if (!cid) return 'SAME_PROJECT_TRANSITIONAL';
    if (cid === oldConversationId) return 'SAME_PROJECT_OLD_CONVERSATION';
    return 'SAME_PROJECT_NEW_CONVERSATION';
  }
  if (/^https:\/\/chatgpt\.com\/g\/g-p-[^/]+(?:\/|$)/.test(u)) return 'DIFFERENT_PROJECT_OR_ORIGIN';
  if (u.startsWith('https://chatgpt.com/') || u === 'https://chatgpt.com') return 'UNKNOWN_TRANSITIONAL';
  return 'DIFFERENT_PROJECT_OR_ORIGIN';
}
function enabled(m) { return m && !hasAttr(m,'disabled') && clean(getAttr(m,'aria-disabled')).toLowerCase() !== 'true'; }

function locateCurrentProjectHomeButton() {
  const active = uniqueVisible(ACTIVE_PROJECT_ROW, 2);
  if (active.length !== 1) return {button:null, reason:`active Project rows=${active.length}`};
  const ar = rectOf(active[0]);
  const homes = uniqueVisible(PROJECT_HOME_BUTTON, 2);
  const matches = homes.filter(h => {
    const r = rectOf(h);
    const verticalOverlap = Math.min(ar.y + ar.height, r.y + r.height) - Math.max(ar.y, r.y);
    return verticalOverlap > 0 && r.x >= ar.x && r.x <= ar.x + ar.width + 20;
  });
  return matches.length === 1 ? {button:matches[0], reason:''} : {button:null, reason:`matching Project-home controls=${matches.length}`};
}

const trace = [];
function observe(label, oldConversationId) {
  const url = currentUrl();
  const cid = conversationId(url);
  const state = classify(url, oldConversationId);
  trace.push([new Date().toISOString(), label, state, url, cid]);
  return {url, cid, state};
}

const before = currentUrl();
if (!before || !before.includes(TARGET_PROJECT_TOKEN)) throw new Error(`Q10 must start in configured Project conversation: ${before || '(unknown URL)'}`);
const oldConversationId = conversationId(before);
if (!oldConversationId) throw new Error(`Q10 requires an existing conversation ID before fresh entry: ${before}`);
if (findAll('css=[data-testid="stop-button"]', 1).length) throw new Error('Q10 requires ChatGPT idle/completed before fresh entry');

let sendPerformed = false;
let sendActionCount = 0;
let homeClickCount = 0;
let sidebarClickCount = 0;
let result = 'FAIL';
let failureReason = '';
let freshRootObserved = false;
let freshRootUrl = '';
let newConversationId = '';

try {
  let home = locateCurrentProjectHomeButton();
  if (!home.button) {
    const openers = uniqueVisible(OPEN_SIDEBAR, 1);
    if (openers.length !== 1) throw new Error(`Q10 cannot expose current Project home control: ${home.reason}; Open sidebar controls=${openers.length}`);
    uiv.browser.click(openers[0]);
    sidebarClickCount += 1;
    uiv.sleep(300);
    home = locateCurrentProjectHomeButton();
  }
  if (!home.button) throw new Error(`Q10 current Project home control unresolved: ${home.reason}`);

  // Target-proven fresh-entry mechanism: active Project row -> its unique associated Open project home control.
  uiv.browser.click(home.button);
  homeClickCount += 1;

  let composerReady = false;
  for (let i = 0; i < 24; i += 1) {
    const o = observe(`fresh-entry-${i + 1}`, oldConversationId);
    if (o.state === 'DIFFERENT_PROJECT_OR_ORIGIN') throw new Error(`Q10 left configured Project during fresh entry: ${o.url}`);
    if (o.state === 'SAME_PROJECT_NEW_CONVERSATION') throw new Error(`Q10 new conversation ID appeared before qualification Send: ${o.cid}`);
    if (o.state === 'SAME_PROJECT_TRANSITIONAL' && isProjectRoot(o.url)) {
      freshRootObserved = true;
      freshRootUrl = o.url;
      if (findAll('css=[data-testid="stop-button"]', 1).length) throw new Error('Q10 unexpected generation at fresh Project root');
      const mounted = uniqueVisible(COMPOSER, 1);
      if (mounted.length > 1) throw new Error(`Q10 fresh Project root has multiple visible composers; found ${mounted.length}`);
      if (mounted.length === 1) { composerReady = true; break; }
    }
    // Old-conversation and generic ChatGPT SPA states may exist transiently during the trusted navigation click.
    uiv.sleep(250);
  }
  if (!freshRootObserved) throw new Error('Q10 did not resolve the active Project-home click to a same-Project root before Send');
  if (!composerReady) throw new Error('Q10 same-Project root resolved but the Project-scoped fresh-chat composer was not uniquely ready');

  const preSendUrl = currentUrl();
  if (!preSendUrl.includes(TARGET_PROJECT_TOKEN) || !isProjectRoot(preSendUrl)) throw new Error(`Q10 lost verified Project root before staging: ${preSendUrl}`);
  const composers = uniqueVisible(COMPOSER, 1);
  if (composers.length !== 1) throw new Error(`Q10 fresh Project root lost its unique composer; found ${composers.length}`);

  uiv.browser.click(composers[0]);
  uiv.browser.type(MARKER);
  uiv.sleep(350);

  const sends = findAll(SEND, 2, true).filter(m => visible(m) && enabled(m));
  if (sends.length !== 1) throw new Error(`Q10 requires exactly one enabled Send prompt after staging marker; found ${sends.length}`);

  // THE ONLY SEND ACTION. Never retry/resend after this point.
  uiv.browser.click(sends[0]);
  sendActionCount += 1;
  sendPerformed = true;

  for (let i = 0; i < 40; i += 1) {
    uiv.sleep(250);
    const o = observe(`post-send-${i + 1}`, oldConversationId);
    if (o.state === 'DIFFERENT_PROJECT_OR_ORIGIN') { failureReason = `post-send navigation left configured Project: ${o.url}`; break; }
    if (o.state === 'SAME_PROJECT_OLD_CONVERSATION') { failureReason = `post-send URL resolved to old conversation ID ${oldConversationId}`; break; }
    if (o.state === 'SAME_PROJECT_NEW_CONVERSATION') { newConversationId = o.cid; result = 'PASS'; break; }
  }
  if (result !== 'PASS' && !failureReason) failureReason = 'new same-Project conversation ID was not proven after the single Send';
} catch (error) {
  failureReason = clean(error && error.message ? error.message : error);
}

const rows = [[
  'category','result','failure_reason','send_performed','send_action_count','home_click_count','sidebar_click_count','url_before','old_conversation_id','fresh_root_observed','fresh_root_url','new_conversation_id','expected_uivision',
  'timestamp','label','classification','url','conversation_id'
]];
rows.push(['meta',result,failureReason,sendPerformed,sendActionCount,homeClickCount,sidebarClickCount,before,oldConversationId,freshRootObserved,freshRootUrl,newConversationId,EXPECTED_UIVISION,'','','','','']);
for (const t of trace) rows.push(['trace','','','','','','','','','','','','',t[0],t[1],t[2],t[3],t[4]]);

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const file = `Q10_fresh_chat_spa_${stamp}.csv`;
uiv.csv.write(file, rows);
uiv.files.exportToDownloads(file);

if (result !== 'PASS') throw new Error(`Q10 ${sendPerformed ? 'AMBIGUOUS_AFTER_SINGLE_SEND' : 'PRE_SEND_FAILURE'}: ${failureReason}; NO RESEND; evidence=${file}`);
uiv.log(`Q10 PASS: active Project-home entry resolved to new conversation ${newConversationId}; ${file}`, 'green');
