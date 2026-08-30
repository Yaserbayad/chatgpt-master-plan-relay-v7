// Q10 read-only diagnostic: bind UI.Vision explicitly to the exact ChatGPT tab,
// then inspect raw DOM-finder results. NO Project navigation, typing, or Send.

const TARGET_PROJECT_TOKEN = 'g-p-6a9323b61110819182dba0224678aa8b';
const EXPECTED_OLD_CONVERSATION_ID = '6a932926-c750-83ed-9e99-d3addc14f456';

function clean(v) { return v == null ? '' : String(v).replace(/\s+/g, ' ').trim(); }
function attrsOf(m) { return m && m.attributes && typeof m.attributes === 'object' ? m.attributes : {}; }
function attr(m, n) {
  try { const v = m.getAttribute(n); return v == null ? '' : String(v); }
  catch (_) { const a = attrsOf(m); return Object.prototype.hasOwnProperty.call(a, n) ? String(a[n] == null ? '' : a[n]) : ''; }
}
function rectOf(m) {
  const r = m && m.rect && typeof m.rect === 'object' ? m.rect : {};
  return {
    x: Number(r.x) || Number(m && m.x) || 0,
    y: Number(r.y) || Number(m && m.y) || 0,
    width: Number(r.width) || 0,
    height: Number(r.height) || 0
  };
}
function visible(m) { const r = rectOf(m); return r.width > 0 && r.height > 0; }
function findRaw(locator, timeout = 2) {
  try {
    const r = uiv.findElements(locator, {required:false, timeout, includeHidden:true});
    return {matches:Array.isArray(r) ? r : [], error:''};
  } catch (e) {
    return {matches:[], error:clean(e && e.message ? e.message : e)};
  }
}
function convId(url) {
  const m = String(url || '').match(/\/c\/([^/?#]+)/);
  return m ? m[1] : '';
}
function sample(m) {
  if (!m) return {tag:'', href:'', aria:'', active:'', sidebarItem:'', role:'', x:0, y:0, width:0, height:0};
  const r = rectOf(m);
  return {
    tag: clean(m.tagName || m.tag || ''),
    href: attr(m, 'href'),
    aria: attr(m, 'aria-label'),
    active: attr(m, 'data-active'),
    sidebarItem: attr(m, 'data-sidebar-item'),
    role: attr(m, 'role'),
    x:r.x, y:r.y, width:r.width, height:r.height
  };
}

const tabsBefore = uiv.tabs.list();
const targetTabs = tabsBefore.filter(t => {
  const u = clean(t && t.url);
  return u.includes(TARGET_PROJECT_TOKEN) && convId(u) === EXPECTED_OLD_CONVERSATION_ID;
});
if (targetTabs.length !== 1) throw new Error(`Q10 diagnostic requires exactly one exact target conversation tab; found ${targetTabs.length}`);

const selected = uiv.tabs.select(targetTabs[0].index);
uiv.sleep(300);
const selectedUrl = clean(selected && selected.url) || clean((uiv.tabs.list().find(t => t && t.index === targetTabs[0].index) || {}).url);

const probes = [
  ['body', 'css=body'],
  ['composer', 'css=#prompt-textarea'],
  ['any_sidebar_item', 'css=[data-sidebar-item]'],
  ['any_active', 'css=[data-active]'],
  ['target_project_sidebar_items', `css=[data-sidebar-item][href*="${TARGET_PROJECT_TOKEN}"]`],
  ['active_target_conversation', `css=a[data-sidebar-item][data-active][href*="${TARGET_PROJECT_TOKEN}"][href*="/c/"]`],
  ['open_sidebar', 'css=button[aria-label="Open sidebar"]'],
  ['open_project_home', 'css=button[aria-label="Open project home"]']
];

const rows = [[
  'category','name','locator','raw_count','visible_count','error','tag','href','aria_label','data_active','data_sidebar_item','role','x','y','width','height','selected_tab_index','selected_url'
]];

const results = {};
for (const [name, locator] of probes) {
  const out = findRaw(locator, 2);
  const vis = out.matches.filter(visible);
  const s = sample(out.matches[0]);
  results[name] = {raw:out.matches.length, visible:vis.length, error:out.error};
  rows.push(['probe',name,locator,out.matches.length,vis.length,out.error,s.tag,s.href,s.aria,s.active,s.sidebarItem,s.role,s.x,s.y,s.width,s.height,targetTabs[0].index,selectedUrl]);
}

let diagnosis = 'UNCLASSIFIED';
if (results.body.raw === 0) diagnosis = 'DOM_FINDER_CONTEXT_FAILURE_AFTER_EXPLICIT_TAB_SELECT';
else if (results.active_target_conversation.raw > 0 && results.active_target_conversation.visible === 0) diagnosis = 'VISIBILITY_SNAPSHOT_GEOMETRY_FALSE_NEGATIVE';
else if (results.active_target_conversation.raw === 0 && results.target_project_sidebar_items.raw > 0) diagnosis = 'ACTIVE_ATTRIBUTE_SELECTOR_DRIFT';
else if (results.active_target_conversation.raw === 1) diagnosis = 'ACTIVE_SELECTOR_RESOLVED_AFTER_EXPLICIT_TAB_SELECT';
else diagnosis = 'SELECTOR_OR_RENDER_STATE_REQUIRES_FURTHER_READ_ONLY_DIAGNOSIS';

rows.push(['meta','diagnosis','',0,0,diagnosis,'','','','','','','','','','',targetTabs[0].index,selectedUrl]);
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const file = `Q10_tab_binding_diagnostic_${stamp}.csv`;
uiv.csv.write(file, rows);
uiv.files.exportToDownloads(file);
uiv.log(`Q10 read-only diagnostic: ${diagnosis}; ${file}`, diagnosis.includes('RESOLVED') ? 'green' : 'blue');
