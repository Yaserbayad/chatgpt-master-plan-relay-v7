// Q08 input-path diagnostic for ChatGPT Master Plan Relay v7.
// No Submit. Separates trusted direct typing, key-combo clearing, Ctrl+V paste, and Ctrl+C copy-back.
// Official basis: https://ui.vision/ai/ai-system-prompt

const TARGET_PROJECT_TOKEN = 'g-p-6a9323b61110819182dba0224678aa8b';
const EXPECTED_UIVISION = '10.0.178';
const BACKGROUND_SWITCH_DELAY_MS = 3500;
const COMPOSER = 'css=[role="textbox"][contenteditable="true"][aria-label="Chat with ChatGPT"]';
const SUBMIT_SURFACE = 'css=button[class*="composer-submit-button-color"]';
const DIRECT_MARKER = 'Q08_DIRECT_TRUSTED_TYPE_Δ日本語🙂';
const PASTE_PAYLOAD = [
  'Q08_CLIPBOARD_PASTE_PROBE',
  'ASCII: clipboard via trusted browser input',
  'Unicode: café naïve Ελληνικά 日本語 🙂',
  '',
  'BLANK-LINE-BEFORE-THIS'
].join('\n');

function clean(v) { return v == null ? '' : String(v).replace(/\s+/g, ' ').trim(); }
function normalize(v) { return String(v == null ? '' : v).replace(/\r\n/g, '\n').replace(/\r/g, '\n'); }
function getAttr(m, n) {
  try { const v = m.getAttribute(n); return v == null ? '' : String(v); }
  catch (_) { const a = m && m.attributes ? m.attributes : {}; return Object.prototype.hasOwnProperty.call(a, n) ? String(a[n] == null ? '' : a[n]) : ''; }
}
function hasAttr(m, n) {
  const a = m && m.attributes ? m.attributes : {};
  if (Object.prototype.hasOwnProperty.call(a, n)) return true;
  try { return m.getAttribute(n) !== null; } catch (_) { return false; }
}
function findAll(locator, timeout = 2) {
  const r = uiv.findElements(locator, {required: false, timeout});
  return Array.isArray(r) ? r : [];
}
function surfaceSnapshot() {
  const xs = findAll(SUBMIT_SURFACE, 1);
  if (xs.length !== 1) return {count: xs.length, aria: '', testid: '', disabled: '', ariaDisabled: ''};
  const m = xs[0];
  return {
    count: 1,
    aria: clean(getAttr(m, 'aria-label')),
    testid: clean(getAttr(m, 'data-testid')),
    disabled: hasAttr(m, 'disabled') ? 'true' : 'false',
    ariaDisabled: clean(getAttr(m, 'aria-disabled'))
  };
}
function isVoice(s) { return s.count === 1 && s.aria.toLowerCase() === 'start voice'; }
function isEnabledNonVoice(s) { return s.count === 1 && s.disabled !== 'true' && s.ariaDisabled.toLowerCase() !== 'true' && s.aria.toLowerCase() !== 'start voice'; }

const tabs = uiv.tabs.list();
const tab = tabs.find(t => t && t.current) || tabs.find(t => t && t.active);
if (!tab || !tab.url) throw new Error('Q08 path diagnostic cannot determine current tab URL');
const currentUrl = clean(tab.url);
if (!currentUrl.includes(TARGET_PROJECT_TOKEN)) throw new Error(`Q08 path diagnostic wrong Project: ${currentUrl}`);
if (findAll('css=[data-testid="stop-button"]', 1).length) throw new Error('Q08 path diagnostic requires idle/completed ChatGPT');
const cm = currentUrl.match(/\/c\/([^/?#]+)/);
const conversationId = cm ? cm[1] : '';
if (!conversationId) throw new Error(`Q08 path diagnostic cannot parse conversation ID: ${currentUrl}`);
if (findAll(COMPOSER).length !== 1) throw new Error('Q08 path diagnostic requires exactly one target composer');

const baseline = surfaceSnapshot();
if (!isVoice(baseline)) throw new Error(`Q08 path diagnostic requires empty composer / Start Voice baseline; found count=${baseline.count}, aria=${baseline.aria || '(empty)'}`);

const originalClipboard = uiv.clipboard.read();
const copySentinel = `Q08_COPY_SENTINEL_${new Date().toISOString()}`;
let copiedBack = '';
let direct = {count:0, aria:'', testid:'', disabled:'', ariaDisabled:''};
let cleared = {count:0, aria:'', testid:'', disabled:'', ariaDisabled:''};
let pasted = {count:0, aria:'', testid:'', disabled:'', ariaDisabled:''};
let directTypeSuccess = false;
let comboClearSuccess = false;
let pasteStateSuccess = false;
let copyChangedSentinel = false;
let copyExact = false;
let failureStage = '';

try {
  uiv.log(`Q08 path diagnostic: switch to a non-Chrome app now; trusted input begins in ${BACKGROUND_SWITCH_DELAY_MS} ms`, 'blue');
  uiv.sleep(BACKGROUND_SWITCH_DELAY_MS);

  uiv.browser.click(COMPOSER);
  uiv.browser.type(DIRECT_MARKER);
  uiv.sleep(400);
  direct = surfaceSnapshot();
  directTypeSuccess = isEnabledNonVoice(direct);
  if (!directTypeSuccess) failureStage = 'direct_trusted_type';

  if (directTypeSuccess) {
    uiv.browser.click(COMPOSER);
    uiv.browser.type('${KEY_CTRL+KEY_A}');
    uiv.browser.type('${KEY_BACKSPACE}');
    uiv.sleep(350);
    cleared = surfaceSnapshot();
    comboClearSuccess = isVoice(cleared);
    if (!comboClearSuccess) failureStage = 'ctrl_a_backspace';
  }

  if (comboClearSuccess) {
    uiv.clipboard.write(PASTE_PAYLOAD);
    if (normalize(uiv.clipboard.read()) !== normalize(PASTE_PAYLOAD)) throw new Error('Q08 path diagnostic clipboard pre-paste round-trip failed');
    uiv.browser.click(COMPOSER);
    uiv.browser.type('${KEY_CTRL+KEY_V}');
    uiv.sleep(500);
    pasted = surfaceSnapshot();
    pasteStateSuccess = isEnabledNonVoice(pasted);
    if (!pasteStateSuccess) failureStage = 'ctrl_v_paste';
  }

  if (pasteStateSuccess) {
    uiv.clipboard.write(copySentinel);
    if (uiv.clipboard.read() !== copySentinel) throw new Error('Q08 path diagnostic could not seed copy sentinel');
    uiv.browser.click(COMPOSER);
    uiv.browser.type('${KEY_CTRL+KEY_A}');
    uiv.browser.type('${KEY_CTRL+KEY_C}');
    uiv.sleep(250);
    copiedBack = uiv.clipboard.read();
    copyChangedSentinel = copiedBack !== copySentinel;
    copyExact = copyChangedSentinel && normalize(copiedBack) === normalize(PASTE_PAYLOAD);
    if (!copyChangedSentinel) failureStage = 'ctrl_c_copy';
    else if (!copyExact) failureStage = 'copy_content_mismatch';
  }
} finally {
  uiv.clipboard.write(originalClipboard);
}

const rows = [[
  'result','failure_stage','url','conversation_id','direct_marker','paste_payload','copy_sentinel','copied_back',
  'baseline_aria','direct_aria','cleared_aria','pasted_aria',
  'direct_type_success','combo_clear_success','paste_state_success','copy_changed_sentinel','copy_exact',
  'background_switch_delay_ms','expected_uivision'
]];
const allPass = directTypeSuccess && comboClearSuccess && pasteStateSuccess && copyExact;
rows.push([
  allPass ? 'PASS' : 'FAIL', failureStage, currentUrl, conversationId, DIRECT_MARKER, PASTE_PAYLOAD, copySentinel, copiedBack,
  baseline.aria, direct.aria, cleared.aria, pasted.aria,
  directTypeSuccess, comboClearSuccess, pasteStateSuccess, copyChangedSentinel, copyExact,
  BACKGROUND_SWITCH_DELAY_MS, EXPECTED_UIVISION
]);
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const file = `Q08_input_path_${stamp}.csv`;
uiv.csv.write(file, rows);
uiv.files.exportToDownloads(file);
if (!allPass) throw new Error(`Q08 input-path diagnostic failed at ${failureStage || 'unknown'}; evidence exported as ${file}`);
uiv.log(`Q08 input-path diagnostic PASS; ${file}; no Submit performed`, 'green');
