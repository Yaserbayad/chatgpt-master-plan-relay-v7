const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const probePath = path.resolve(__dirname, '../../../Q10_FRESH_CHAT_SPA_PROBE.js');
const probeSource = fs.readFileSync(probePath, 'utf8');
const marker = 'Q10_FRESH_CHAT_SPA_PROBE';
const token = 'g-p-6a9323b61110819182dba0224678aa8b';
const oldConversation = '6a932926-c750-83ed-9e99-d3addc14f456';
const newConversation = '7b111111-2222-4333-8444-555555555555';

function match(kind, attributes = {}, text = '') {
  return {
    kind,
    attributes,
    text,
    rect: {x: 10, y: 10, width: 100, height: 30},
    getAttribute(name) {
      return Object.prototype.hasOwnProperty.call(attributes, name) ? attributes[name] : null;
    },
  };
}

function runScenario({userTexts = [marker], changeUrl = true, throwAfterDispatch = false, exposeActiveConversation = true} = {}) {
  let currentUrl = `https://chatgpt.com/g/${token}/c/${oldConversation}`;
  let stagedText = '';
  let postSendMessages = [];
  const clicks = [];
  let writtenRows = null;

  const activeConversationSelector = `css=a[data-sidebar-item][data-active][href*="${token}"][href*="/c/"]`;
  const projectGroupSelector = `css=li:has(a[data-sidebar-item][data-active][href*="${token}"][href*="/c/"]):has(button[aria-label="Open project home"])`;
  const relatedHomeSelector = `${projectGroupSelector} button[aria-label="Open project home"]`;
  const activeConversation = match('active-conversation', {href: `/g/${token}/c/${oldConversation}`, 'data-sidebar-item': '', 'data-active': ''});
  const projectGroup = match('project-group');
  const homeButton = match('home-button', {'aria-label': 'Open project home'});
  const composer = match('composer', {id: 'prompt-textarea', role: 'textbox', contenteditable: 'true'});
  const sendButton = match('send-button', {'aria-label': 'Send prompt'});

  const uiv = {
    findElements(locator) {
      if (locator === activeConversationSelector) return exposeActiveConversation ? [activeConversation] : [];
      if (locator === projectGroupSelector) return exposeActiveConversation ? [projectGroup] : [];
      if (locator === relatedHomeSelector) return exposeActiveConversation ? [homeButton] : [];
      if (locator.includes('[data-sidebar-keep-open="true"]')) return [];
      if (locator.includes('button[aria-label="Open sidebar"]')) return [];
      if (locator.includes('[data-testid="stop-button"]')) return [];
      if (locator.includes('#prompt-textarea')) return currentUrl.includes('/project') ? [composer] : [];
      if (locator.includes('aria-label="Send prompt"')) return stagedText ? [sendButton] : [];
      if (locator.includes('[data-message-author-role]')) return postSendMessages;
      return [];
    },
    tabs: {list: () => [{current: true, url: currentUrl}]},
    browser: {
      click(element) {
        clicks.push(element.kind);
        if (element.kind === 'home-button') currentUrl = `https://chatgpt.com/g/${token}-t/project`;
        if (element.kind === 'send-button') {
          if (changeUrl) currentUrl = `https://chatgpt.com/g/${token}/c/${newConversation}`;
          postSendMessages = userTexts.map((text, index) => match('user-message', {
            'data-message-author-role': 'user',
            'data-message-id': `user-${index + 1}`,
          }, text));
          if (throwAfterDispatch) throw new Error('simulated lost click acknowledgement');
        }
      },
      type(text) { stagedText = text; },
    },
    sleep() {},
    csv: {write(_file, rows) { writtenRows = rows; }},
    files: {exportToDownloads() {}},
    log() {},
  };

  let executionError = null;
  try {
    vm.runInNewContext(probeSource, {uiv, Date, Error, JSON, Map, Number, Object, RegExp, Set, String});
  } catch (error) {
    executionError = error;
  }

  const headers = writtenRows && writtenRows[0];
  const metaRow = writtenRows && writtenRows.find(row => row[0] === 'meta');
  const meta = headers && metaRow ? Object.fromEntries(headers.map((header, index) => [header, metaRow[index]])) : null;
  return {clicks, executionError, meta, stagedText, writtenRows};
}

{
  const outcome = runScenario();
  assert.equal(outcome.executionError, null);
  assert.deepEqual(outcome.clicks, ['home-button', 'composer', 'send-button']);
  assert.equal(outcome.stagedText, marker);
  assert.equal(outcome.meta.result, 'PASS');
  assert.equal(outcome.meta.send_attempted, true);
  assert.equal(outcome.meta.send_action_count, 1);
  assert.equal(outcome.meta.send_dispatch_state, 'CLICK_RETURNED');
  assert.equal(outcome.meta.new_conversation_id, newConversation);
  assert.equal(outcome.meta.new_user_count, 1);
  assert.equal(outcome.meta.marker_user_count, 1);
  assert.equal(outcome.meta.new_user_text, marker);
}

{
  const outcome = runScenario({throwAfterDispatch: true});
  assert.match(outcome.executionError.message, /AMBIGUOUS_AFTER_POSSIBLE_SEND/);
  assert.equal(outcome.meta.result, 'FAIL');
  assert.equal(outcome.meta.send_attempted, true);
  assert.equal(outcome.meta.send_action_count, 1);
  assert.equal(outcome.meta.send_dispatch_state, 'DISPATCH_POSSIBLE');
}

{
  const outcome = runScenario({userTexts: []});
  assert.match(outcome.executionError.message, /AMBIGUOUS_AFTER_POSSIBLE_SEND/);
  assert.match(outcome.meta.failure_reason, /0 newly observed stable user message IDs/);
}

{
  const outcome = runScenario({userTexts: ['WRONG_MARKER']});
  assert.match(outcome.executionError.message, /AMBIGUOUS_AFTER_POSSIBLE_SEND/);
  assert.match(outcome.meta.failure_reason, /0 stable user turns with the exact marker/);
}

{
  const outcome = runScenario({userTexts: [marker, marker]});
  assert.match(outcome.executionError.message, /AMBIGUOUS_AFTER_POSSIBLE_SEND/);
  assert.match(outcome.meta.failure_reason, /2 newly observed stable user message IDs/);
}

{
  const outcome = runScenario({exposeActiveConversation: false});
  assert.match(outcome.executionError.message, /PRE_SEND_FAILURE/);
  assert.equal(outcome.meta.send_attempted, false);
  assert.equal(outcome.meta.send_action_count, 0);
}

console.log('PASS: Q10 proves one marker turn and fails closed for possible-Send ambiguity, URL-only, absent-marker, duplicate-marker, and pre-Send failures');
