// Q08 trusted composer/input qualification probe for ChatGPT Master Plan Relay v7.
// No Submit. Exact copy-back uses a sentinel so an unchanged clipboard cannot false-pass.
// Official API basis: https://ui.vision/rpa/docs/uiv and https://ui.vision/ai/ai-system-prompt

const TARGET_PROJECT_TOKEN = 'g-p-6a9323b61110819182dba0224678aa8b';
const EXPECTED_UIVISION = '10.0.178';
const BACKGROUND_SWITCH_DELAY_MS = 3500;
const PAYLOAD = [
  'Q08_INPUT_PROBE',
  'ASCII: trusted browser clipboard paste',
  'Unicode: café naïve Ελληνικά 日本語 🙂',
  '',
  'BLANK-LINE-BEFORE-THIS'
].join('\n');

function clean(value) {
  return value == null ? '' : String(value).replace(/\s+/g, ' ').trim();
}

function normalizeText(value) {
  return String(value == null ? '' : value).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function normalizeEditorClipboard(value) {
  // Chrome/contenteditable copy may append terminal NBSP markers. Preserve all internal whitespace.
  return normalizeText(value).replace(/\u00A0+$/, '');
}

function getAttr(match, name) {
  try {
    const value = match.getAttribute(name);
    return value == null ? '' : String(value);
  } catch (_) {
    const attrs = match && match.attributes ? match.attributes : {};
    return Object.prototype.hasOwnProperty.call(attrs, name) ? String(attrs[name] == null ? '' : attrs[name]) : '';
  }
}

function hasAttr(match, name) {
  const attrs = match && match.attributes ? match.attributes : {};
  if (Object.prototype.hasOwnProperty.call(attrs, name)) return true;
  try {
    return match.getAttribute(name) !== null;
  } catch (_) {
    return false;
  }
}

function findAll(locator, timeout = 2) {
  const result = uiv.findElements(locator, {required: false, timeout});
  return Array.isArray(result) ? result : [];
}

function composerText(match) {
  const value = match && match.value != null ? String(match.value) : '';
  const text = match && match.text != null ? String(match.text) : '';
  return value || text;
}

function controlSnapshot(match) {
  return {
    tag: clean(match.tag || match.tagName),
    testid: clean(getAttr(match, 'data-testid')),
    aria: clean(getAttr(match, 'aria-label')),
    title: clean(getAttr(match, 'title')),
    text: clean(match.text).slice(0, 160),
    className: clean(getAttr(match, 'class')).slice(0, 300),
    disabled: hasAttr(match, 'disabled'),
    ariaDisabled: clean(getAttr(match, 'aria-disabled'))
  };
}

function enabled(control) {
  return control && !control.disabled && control.ariaDisabled.toLowerCase() !== 'true';
}

function submitSurfaces() {
  return findAll('css=form button').map(controlSnapshot).filter(c => c.className.includes('composer-submit-button-color'));
}

const tabs = uiv.tabs.list();
const currentTab = tabs.find(tab => tab && tab.current) || tabs.find(tab => tab && tab.active);
if (!currentTab || !currentTab.url) throw new Error('Q08 cannot determine the current browser tab URL');
const currentUrl = clean(currentTab.url);
if (!currentUrl.includes(TARGET_PROJECT_TOKEN)) throw new Error(`Q08 wrong Project: ${currentUrl}`);
const conversationMatch = currentUrl.match(/\/c\/([^/?#]+)/);
const conversationId = conversationMatch ? conversationMatch[1] : '';
if (!conversationId) throw new Error(`Q08 cannot parse conversation ID: ${currentUrl}`);

if (findAll('css=[data-testid="stop-button"]', 1).length) {
  throw new Error('Q08 must run only when ChatGPT is completed/idle; live stop-button is present');
}

const composersBefore = findAll('css=[contenteditable="true"],textarea');
if (composersBefore.length !== 1) throw new Error(`Q08 requires exactly one composer; found ${composersBefore.length}`);
const composerBefore = composersBefore[0];
if (normalizeText(composerText(composerBefore)).trim() !== '') {
  throw new Error('Q08 requires an empty composer; existing draft detected and was not modified');
}

const baselineSurfaces = submitSurfaces();
const baselineSubmit = baselineSurfaces.length === 1 ? baselineSurfaces[0] : null;
const originalClipboard = uiv.clipboard.read();
const copySentinel = `Q08_COPYBACK_SENTINEL_${new Date().toISOString()}`;
let copiedBack = '';
let observedDraft = '';
let postSubmit = null;
let result = 'FAIL';
let failureReason = '';

try {
  uiv.clipboard.write(PAYLOAD);
  if (normalizeText(uiv.clipboard.read()) !== normalizeText(PAYLOAD)) {
    throw new Error('Q08 clipboard write/read verification failed before paste');
  }

  uiv.log(`Q08 ready: switch to a non-Chrome app now; trusted input begins in ${BACKGROUND_SWITCH_DELAY_MS} ms`, 'blue');
  uiv.sleep(BACKGROUND_SWITCH_DELAY_MS);

  uiv.browser.click(composerBefore);
  uiv.browser.type('${KEY_CTRL+KEY_V}');
  uiv.sleep(500);

  const composersAfter = findAll('css=[contenteditable="true"],textarea');
  if (composersAfter.length !== 1) throw new Error(`Q08 composer lost uniqueness after paste; found ${composersAfter.length}`);
  const composerAfter = composersAfter[0];
  observedDraft = composerText(composerAfter); // diagnostic only; finder matches are snapshots.

  uiv.clipboard.write(copySentinel);
  if (uiv.clipboard.read() !== copySentinel) throw new Error('Q08 could not seed copy-back sentinel');

  uiv.browser.click(composerAfter);
  uiv.browser.type('${KEY_CTRL+KEY_A}');
  uiv.browser.type('${KEY_CTRL+KEY_C}');
  uiv.sleep(250);
  copiedBack = uiv.clipboard.read();
  if (copiedBack === copySentinel) {
    throw new Error('Q08 copy-back did not replace sentinel; trusted paste/copy is not proven');
  }
  if (normalizeEditorClipboard(copiedBack) !== normalizeEditorClipboard(PAYLOAD)) {
    throw new Error('Q08 copy-back content differs beyond terminal editor NBSP serialization');
  }
  uiv.browser.click(composerAfter);

  const postSurfaces = submitSurfaces();
  const enabledPost = postSurfaces.filter(enabled);
  if (enabledPost.length !== 1) {
    throw new Error(`Q08 requires exactly one enabled composer submit surface after proven paste; found ${enabledPost.length} enabled of ${postSurfaces.length}`);
  }
  postSubmit = enabledPost[0];
  const semantic = `${postSubmit.testid} ${postSubmit.aria} ${postSubmit.title} ${postSubmit.text}`.toLowerCase();
  const explicitlySend = /send|submit/.test(semantic);
  const transitionedFromVoice = postSubmit.aria.toLowerCase() !== 'start voice' && (!baselineSubmit || baselineSubmit.aria.toLowerCase() === 'start voice');
  if (!explicitlySend && !transitionedFromVoice) {
    throw new Error(`Q08 submit surface did not transition to Send state; aria=${postSubmit.aria || '(empty)'}`);
  }

  result = 'PASS';
} catch (error) {
  failureReason = clean(error && error.message ? error.message : error);
} finally {
  uiv.clipboard.write(originalClipboard);
}

const b = baselineSubmit || {tag:'',testid:'',aria:'',title:'',text:'',className:'',disabled:false,ariaDisabled:''};
const s = postSubmit || {tag:'',testid:'',aria:'',title:'',text:'',className:'',disabled:false,ariaDisabled:''};
const rows = [[
  'result','failure_reason','url','conversation_id','composer_count','payload','observed_draft','copy_sentinel','copied_back',
  'baseline_submit_testid','baseline_submit_aria','baseline_submit_class','post_submit_testid','post_submit_aria','post_submit_title','post_submit_text','post_submit_class','post_submit_aria_disabled',
  'background_switch_delay_ms','expected_uivision'
]];
rows.push([
  result,failureReason,currentUrl,conversationId,1,PAYLOAD,observedDraft,copySentinel,copiedBack,
  b.testid,b.aria,b.className,s.testid,s.aria,s.title,s.text,s.className,s.ariaDisabled,
  BACKGROUND_SWITCH_DELAY_MS,EXPECTED_UIVISION
]);

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const file = `Q08_input_probe_v3_${stamp}.csv`;
uiv.csv.write(file, rows);
uiv.files.exportToDownloads(file);

if (failureReason) throw new Error(`${failureReason}; evidence exported as ${file}`);
uiv.log(`Q08 PASS: sentinel-overwrite copy-back exact after terminal-NBSP normalization; enabled Send state proven; draft left unsent; ${file}`, 'green');
