// Q08 trusted composer/input qualification probe for ChatGPT Master Plan Relay v7.
// No Submit. It leaves the verified draft in the composer and restores the original OS clipboard.
// Official API basis:
// https://ui.vision/rpa/docs/uiv
// https://ui.vision/ai/ai-system-prompt

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
    disabled: hasAttr(match, 'disabled'),
    ariaDisabled: clean(getAttr(match, 'aria-disabled'))
  };
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

const originalClipboard = uiv.clipboard.read();
let copiedBack = '';
let send = null;
let observedDraft = '';
let result = 'FAIL';

try {
  uiv.clipboard.write(PAYLOAD);
  if (normalizeText(uiv.clipboard.read()) !== normalizeText(PAYLOAD)) {
    throw new Error('Q08 clipboard write/read verification failed before paste');
  }

  uiv.log(`Q08 ready: switch to a non-Chrome app now; trusted input begins in ${BACKGROUND_SWITCH_DELAY_MS} ms`, 'blue');
  uiv.sleep(BACKGROUND_SWITCH_DELAY_MS);

  uiv.browser.click(composerBefore);
  uiv.browser.type('${KEY_CTRL+KEY_V}');
  uiv.sleep(350);

  const composersAfter = findAll('css=[contenteditable="true"],textarea');
  if (composersAfter.length !== 1) throw new Error(`Q08 composer lost uniqueness after paste; found ${composersAfter.length}`);
  const composerAfter = composersAfter[0];
  observedDraft = composerText(composerAfter);
  for (const token of ['Q08_INPUT_PROBE', 'café naïve', 'Ελληνικά', '日本語', '🙂', 'BLANK-LINE-BEFORE-THIS']) {
    if (!normalizeText(observedDraft).includes(token)) throw new Error(`Q08 draft observation missing token: ${token}`);
  }

  uiv.browser.click(composerAfter);
  uiv.browser.type('${KEY_CTRL+KEY_A}');
  uiv.browser.type('${KEY_CTRL+KEY_C}');
  uiv.sleep(200);
  copiedBack = uiv.clipboard.read();
  if (normalizeText(copiedBack) !== normalizeText(PAYLOAD)) {
    throw new Error('Q08 copy-back verification did not exactly preserve multiline/Unicode payload');
  }
  uiv.browser.click(composerAfter);

  const controls = findAll('css=button,[role="button"]').map(controlSnapshot);
  let sendCandidates = controls.filter(c => c.testid.toLowerCase() === 'send-button');
  if (!sendCandidates.length) {
    sendCandidates = controls.filter(c => /(^|\s)(send|submit)(\s|$)/i.test(`${c.testid} ${c.aria} ${c.title} ${c.text}`));
  }
  const enabledSend = sendCandidates.filter(c => !c.disabled && c.ariaDisabled.toLowerCase() !== 'true');
  if (enabledSend.length !== 1) {
    throw new Error(`Q08 requires exactly one enabled Send control after paste; found ${enabledSend.length} enabled of ${sendCandidates.length} candidates`);
  }
  send = enabledSend[0];
  result = 'PASS';
} finally {
  uiv.clipboard.write(originalClipboard);
}

const rows = [[
  'result','url','conversation_id','composer_count','payload','observed_draft','copied_back','send_tag','send_testid','send_aria','send_title','send_text','send_aria_disabled','background_switch_delay_ms','expected_uivision'
]];
rows.push([
  result,currentUrl,conversationId,1,PAYLOAD,observedDraft,copiedBack,send.tag,send.testid,send.aria,send.title,send.text,send.ariaDisabled,BACKGROUND_SWITCH_DELAY_MS,EXPECTED_UIVISION
]);

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const file = `Q08_input_probe_${stamp}.csv`;
uiv.csv.write(file, rows);
uiv.files.exportToDownloads(file);
uiv.log(`Q08 ${result}: verified trusted clipboard paste and exactly one enabled Send; draft left unsent`, 'green');
