// Q12 Case D restart verifier: exact reread after abrupt termination.
const journal = 'Q12_durable_fence.csv';
const expectedFile = 'Q12_case_d_expected.csv';
const expectedRows = uiv.csv.read(expectedFile);
if (expectedRows.length !== 2) throw new Error(`Q12 Case D expected-evidence row count=${expectedRows.length}`);
const e = expectedRows[1];
const expected = [String(e[0]||''),String(e[2]||''),String(e[3]||''),String(e[4]||''),String(e[5]||''),String(e[6]||'')];
if (expected[0] !== 'Q12' || expected[1] !== 'Q12-CASE-D-AFTER-REREAD-BEFORE-COMPLETION' || expected[3] !== '1' || expected[4] !== 'Q12D-c3041da724474402a2d556b0c19547d9' || expected[5] !== 'FENCE' || String(e[7]||'') !== '0' || String(e[8]||'') !== '1') throw new Error('Q12 Case D expected-evidence content invalid');

const rows = uiv.csv.read(journal);
const matches = rows.filter(r => JSON.stringify(r) === JSON.stringify(expected));
const partial = rows.filter(r => String(r[1] || '') === expected[1] && JSON.stringify(r) !== JSON.stringify(expected));
const index = rows.findIndex(r => JSON.stringify(r) === JSON.stringify(expected));
const ordered = matches.length === 1 && index >= 0;

uiv.csv.write('Q12_case_d_restart_evidence.csv', [
  ['test_id','case','transaction_id','utc','sequence','checksum','record_type','exact_count','partial_or_corrupt_count','ordered','row_index','total_rows'],
  ['Q12','D_AFTER_REREAD_BEFORE_COMPLETION',...expected.slice(1),String(matches.length),String(partial.length),String(ordered),String(index),String(rows.length)]
]);
uiv.files.exportToDownloads('Q12_case_d_restart_evidence.csv');

if (matches.length !== 1 || partial.length !== 0 || !ordered) throw new Error(`Q12 Case D restart verification failed exact=${matches.length} partial=${partial.length}`);
uiv.log(`Q12 CASE D PASS tx=${expected[1]} exact=1 partial=0`, 'green');
