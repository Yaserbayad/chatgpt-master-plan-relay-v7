// Q10 Same-Project fresh-chat/SPA qualification for ChatGPT Master Plan Relay v7.
// MATERIAL TEST: uses the active configured-Project conversation's nearest Project-group
// "Open project home" control,
// then performs exactly ONE trusted Send. Never retries/resends after that Send.

const TARGET_PROJECT_TOKEN = 'g-p-6a9323b61110819182dba0224678aa8b';
const EXPECTED_UIVISION = '10.0.178';
const ACTIVE_PROJECT_CONVERSATION = `css=a[data-sidebar-item][data-active][href*="${TARGET_PROJECT_TOKEN}"][href*="/c/"]`;
const ACTIVE_PROJECT_GROUP = `css=li:has(a[data-sidebar-item][data-active][href*="${TARGET_PROJECT_TOKEN}"][href*="/c/"]):has(button[aria-label="Open project home"])`;
const CURRENT_PROJECT_HOME_BUTTON = `${ACTIVE_PROJECT_GROUP} button[aria-label="Open project home"]`;
const OPEN_SIDEBAR = 'css=button[aria-label="Open sidebar"]';
const COMPOSER = 'css=#prompt-textarea[role="textbox"][contenteditable="true"]';
const SEND = 'css=button[class*="composer-submit-button-color"][aria-label="Send prompt"]';
const MESSAGE = 'css=[data-message-author-role]';
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
function messageRows(stage, matches) {
  return matches.map((m, i) => ({
    stage,
    index: i + 1,
    author: clean(getAttr(m, 'data-message-author-role')),
    id: clean(getAttr(m, 'data-message-id')),
    text: clean(m.text)
  }));
}
function addById(map, rows) {
  for (const row of rows) if (row.id && !map.has(row.id)) map.set(row.id, row);
}

function locateCurrentProjectHomeButton() {
  const active = uniqueVisible(ACTIVE_PROJECT_CONVERSATION, 2);
  if (active.length !== 1) return {button:null, reason:`active configured-Project conversation links=${active.length}`};
  const groups = uniqueVisible(ACTIVE_PROJECT_GROUP, 2);
  if (groups.length !== 1) return {button:null, reason:`nearest active configured-Project groups=${groups.length}`};
  const homes = uniqueVisible(CURRENT_PROJECT_HOME_BUTTON, 2);
  return homes.length === 1 ? {button:homes[0], reason:''} : {button:null, reason:`ancestor-related Project-home controls=${homes.length}`};
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

let sendAttempted = false;
let sendActionCount = 0;
let sendDispatchState = 'NOT_ATTEMPTED';
let homeClickCount = 0;
let sidebarClickCount = 0;
let result = 'FAIL';
let failureReason = '';
let freshRootObserved = false;
let freshRootUrl = '';
let newConversationId = '';
let afterRows = [];
let newUsers = [];
let markerUsers = [];

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

  // Target-proven fresh-entry mechanism: active configured-Project conversation -> nearest Project-group ancestor -> unique Open project home control.
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

  const beforeSend = new Map();
  addById(beforeSend, messageRows('before-send-visible', findAll(MESSAGE)));
  addById(beforeSend, messageRows('before-send-all', findAll(MESSAGE, 2, true)));
  const beforeUserIds = new Set(Array.from(beforeSend.values()).filter(r => r.author === 'user').map(r => r.id));
  if (beforeUserIds.size) throw new Error(`Q10 fresh Project root unexpectedly contains ${beforeUserIds.size} stable user message IDs before Send`);

  uiv.browser.click(composers[0]);
  uiv.browser.type(MARKER);
  uiv.sleep(350);

  const sends = findAll(SEND, 2, true).filter(m => visible(m) && enabled(m));
  if (sends.length !== 1) throw new Error(`Q10 requires exactly one enabled Send prompt after staging marker; found ${sends.length}`);

  // THE ONLY SEND ACTION. Crossing this boundary is permanently ambiguous unless
  // stable target evidence later proves the exact marker turn. Never retry/resend.
  sendAttempted = true;
  sendActionCount += 1;
  sendDispatchState = 'DISPATCH_POSSIBLE';
  uiv.browser.click(sends[0]);
  sendDispatchState = 'CLICK_RETURNED';

  const after = new Map();
  for (let i = 0; i < 40; i += 1) {
    uiv.sleep(250);
    const o = observe(`post-send-${i + 1}`, oldConversationId);
    if (o.state === 'DIFFERENT_PROJECT_OR_ORIGIN') { failureReason = `post-send navigation left configured Project: ${o.url}`; break; }
    if (o.state === 'SAME_PROJECT_OLD_CONVERSATION') { failureReason = `post-send URL resolved to old conversation ID ${oldConversationId}`; break; }
    addById(after, messageRows(`after-${i + 1}-visible`, findAll(MESSAGE)));
    addById(after, messageRows(`after-${i + 1}-all`, findAll(MESSAGE, 2, true)));
    afterRows = Array.from(after.values());
    newUsers = afterRows.filter(r => r.author === 'user' && !beforeUserIds.has(r.id));
    markerUsers = newUsers.filter(r => r.text === MARKER);
    if (o.state === 'SAME_PROJECT_NEW_CONVERSATION') newConversationId = o.cid;
    if (newConversationId && newUsers.length) break;
  }
  if (!failureReason && !newConversationId) failureReason = 'new same-Project conversation ID was not proven after the single possible Send';
  else if (!failureReason && sendActionCount !== 1) failureReason = `internal Send action count is ${sendActionCount}, expected 1`;
  else if (!failureReason && newUsers.length !== 1) failureReason = `single possible Send produced ${newUsers.length} newly observed stable user message IDs`;
  else if (!failureReason && markerUsers.length !== 1) failureReason = `single possible Send produced ${markerUsers.length} stable user turns with the exact marker`;
  else if (!failureReason && newUsers[0].text !== MARKER) failureReason = `new stable user turn text does not exactly match marker: ${newUsers[0].text}`;
  else if (!failureReason) result = 'PASS';
} catch (error) {
  failureReason = clean(error && error.message ? error.message : error);
}

const rows = [[
  'category','result','failure_reason','send_attempted','send_action_count','send_dispatch_state','home_click_count','sidebar_click_count','url_before','old_conversation_id','fresh_root_observed','fresh_root_url','new_conversation_id','new_user_count','marker_user_count','new_user_id','new_user_text','expected_uivision',
  'timestamp','label','classification','url','conversation_id','stage','author','message_id','text'
]];
rows.push(['meta',result,failureReason,sendAttempted,sendActionCount,sendDispatchState,homeClickCount,sidebarClickCount,before,oldConversationId,freshRootObserved,freshRootUrl,newConversationId,newUsers.length,markerUsers.length,newUsers.length === 1 ? newUsers[0].id : '',newUsers.length === 1 ? newUsers[0].text : '',EXPECTED_UIVISION,'','','','','','','','','']);
for (const t of trace) rows.push(['trace','','','','','','','','','','','','','','','','','',t[0],t[1],t[2],t[3],t[4],'','','','']);
for (const r of afterRows) rows.push(['message','','','','','','','','','','','','','','','','','','','','','','',r.stage,r.author,r.id,r.text]);

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const file = `Q10_fresh_chat_spa_${stamp}.csv`;
uiv.csv.write(file, rows);
uiv.files.exportToDownloads(file);

if (result !== 'PASS') throw new Error(`Q10 ${sendAttempted ? 'AMBIGUOUS_AFTER_POSSIBLE_SEND' : 'PRE_SEND_FAILURE'}: ${failureReason}; NO RESEND; evidence=${file}`);
uiv.log(`Q10 PASS: one possible Send resolved to exactly one marker user turn ${newUsers[0].id} in new conversation ${newConversationId}; ${file}`, 'green');
