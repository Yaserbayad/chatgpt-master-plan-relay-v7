// Q10 Same-Project fresh-chat/SPA qualification for ChatGPT Master Plan Relay v7.
// MATERIAL TEST: navigates the current tab to the configured Project root and performs exactly ONE trusted Send.
// Never retries/resends after that Send. Transitional chatgpt.com URLs are UNKNOWN_TRANSITIONAL, not false wrong-Project.
// Official UI.Vision basis: https://ui.vision/rpa/docs/uiv and https://ui.vision/ai/ai-system-prompt

const TARGET_PROJECT_TOKEN = 'g-p-6a9323b61110819182dba0224678aa8b';
const PROJECT_ROOT = `https://chatgpt.com/g/${TARGET_PROJECT_TOKEN}/project`;
const EXPECTED_UIVISION = '10.0.178';
const COMPOSER = 'css=[role="textbox"][contenteditable="true"][aria-label="Chat with ChatGPT"]';
const SEND = 'css=button[class*="composer-submit-button-color"][aria-label="Send prompt"]';
const MARKER = 'Q10_FRESH_CHAT_SPA_PROBE';

function clean(v) { return v == null ? '' : String(v).replace(/\s+/g, ' ').trim(); }
function getAttr(m, n) {
  try { const v = m.getAttribute(n); return v == null ? '' : String(v); }
  catch (_) { const a = m && m.attributes ? m.attributes : {}; return Object.prototype.hasOwnProperty.call(a, n) ? String(a[n] == null ? '' : a[n]) : ''; }
}
function hasAttr(m, n) {
  const a = m && m.attributes ? m.attributes : {};
  if (Object.prototype.hasOwnProperty.call(a, n)) return true;
  try { return m.getAttribute(n) !== null; } catch (_) { return false; }
}
function findAll(locator, timeout = 2, includeHidden = false) {
  const opts = {required: false, timeout};
  if (includeHidden) opts.includeHidden = true;
  const r = uiv.findElements(locator, opts);
  return Array.isArray(r) ? r : [];
}
function currentUrl() {
  const tabs = uiv.tabs.list();
  const tab = tabs.find(t => t && t.current) || tabs.find(t => t && t.active);
  return tab && tab.url ? clean(tab.url) : '';
}
function conversationId(url) {
  const m = String(url || '').match(/\/c\/([^/?#]+)/);
  return m ? m[1] : '';
}
function classify(url, oldConversationId) {
  const u = String(url || '');
  if (!u) return 'UNKNOWN_TRANSITIONAL';
  if (u.includes(TARGET_PROJECT_TOKEN)) {
    const cid = conversationId(u);
    if (!cid) return 'SAME_PROJECT_TRANSITIONAL';
    if (cid === oldConversationId) return 'SAME_PROJECT_OLD_CONVERSATION';
    return 'SAME_PROJECT_NEW_CONVERSATION';
  }
  if (u.startsWith('https://chatgpt.com/') || u === 'https://chatgpt.com') return 'UNKNOWN_TRANSITIONAL';
  return 'DIFFERENT_PROJECT_OR_ORIGIN';
}
function enabled(m) {
  return m && !hasAttr(m, 'disabled') && clean(getAttr(m, 'aria-disabled')).toLowerCase() !== 'true';
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
let result = 'FAIL';
let failureReason = '';
let freshRootObserved = false;
let newConversationId = '';

try {
  // Deterministic fresh entry to this exact Project in the current tab.
  uiv.open(PROJECT_ROOT);

  let composerReady = false;
  for (let i = 0; i < 12; i += 1) {
    const o = observe(`fresh-entry-${i + 1}`, oldConversationId);
    if (o.state === 'DIFFERENT_PROJECT_OR_ORIGIN') throw new Error(`Q10 left ChatGPT/Project during fresh entry: ${o.url}`);
    if (o.state === 'SAME_PROJECT_OLD_CONVERSATION') throw new Error(`Q10 fresh entry retained old conversation ID ${oldConversationId}`);
    if (o.state === 'SAME_PROJECT_NEW_CONVERSATION') throw new Error(`Q10 new conversation ID appeared before qualification Send: ${o.cid}`);
    if (o.state === 'SAME_PROJECT_TRANSITIONAL') {
      freshRootObserved = true;
      if (findAll('css=[data-testid="stop-button"]', 1).length) throw new Error('Q10 unexpected generation at fresh Project root');
      const mounted = findAll(COMPOSER, 1);
      if (mounted.length > 1) throw new Error(`Q10 fresh Project root has multiple composers; found ${mounted.length}`);
      if (mounted.length === 1) { composerReady = true; break; }
    }
    uiv.sleep(250);
  }
  if (!freshRootObserved) throw new Error('Q10 did not resolve fresh entry to the configured Project root before Send');
  if (!composerReady) throw new Error('Q10 configured Project root was reached but fresh-chat composer did not become ready within the SPA readiness window');

  const composers = findAll(COMPOSER, 1);
  if (composers.length !== 1) throw new Error(`Q10 fresh Project root lost its ready composer; found ${composers.length}`);

  uiv.browser.click(composers[0]);
  uiv.browser.type(MARKER);
  uiv.sleep(350);

  const sends = findAll(SEND, 2, true).filter(enabled);
  if (sends.length !== 1) throw new Error(`Q10 requires exactly one enabled Send prompt after staging marker; found ${sends.length}`);

  // THE ONLY SEND ACTION. Never retry/resend after this point.
  uiv.browser.click(sends[0]);
  sendActionCount += 1;
  sendPerformed = true;

  for (let i = 0; i < 40; i += 1) {
    uiv.sleep(250);
    const o = observe(`post-send-${i + 1}`, oldConversationId);
    if (o.state === 'DIFFERENT_PROJECT_OR_ORIGIN') {
      failureReason = `post-send navigation left ChatGPT/Project: ${o.url}`;
      break;
    }
    if (o.state === 'SAME_PROJECT_OLD_CONVERSATION') {
      failureReason = `post-send URL resolved to old conversation ID ${oldConversationId}`;
      break;
    }
    if (o.state === 'SAME_PROJECT_NEW_CONVERSATION') {
      newConversationId = o.cid;
      result = 'PASS';
      break;
    }
    // SAME_PROJECT_TRANSITIONAL and UNKNOWN_TRANSITIONAL are allowed while the SPA resolves.
  }
  if (result !== 'PASS' && !failureReason) failureReason = 'new same-Project conversation ID was not proven after the single Send';
} catch (error) {
  failureReason = clean(error && error.message ? error.message : error);
}

const rows = [[
  'category','result','failure_reason','send_performed','send_action_count','project_root','url_before','old_conversation_id','fresh_root_observed','new_conversation_id','expected_uivision',
  'timestamp','label','classification','url','conversation_id'
]];
rows.push([
  'meta',result,failureReason,sendPerformed,sendActionCount,PROJECT_ROOT,before,oldConversationId,freshRootObserved,newConversationId,EXPECTED_UIVISION,
  '','','','',''
]);
for (const t of trace) rows.push(['trace','','','','','','','','','','',t[0],t[1],t[2],t[3],t[4]]);

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const file = `Q10_fresh_chat_spa_${stamp}.csv`;
uiv.csv.write(file, rows);
uiv.files.exportToDownloads(file);

if (result !== 'PASS') {
  throw new Error(`Q10 ${sendPerformed ? 'AMBIGUOUS_AFTER_SINGLE_SEND' : 'PRE_SEND_FAILURE'}: ${failureReason}; NO RESEND; evidence=${file}`);
}
uiv.log(`Q10 PASS: fresh same-Project entry resolved to new conversation ${newConversationId}; ${file}`, 'green');
