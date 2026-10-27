import assert from 'node:assert/strict';
import {currentReports,availableReports,confidence} from '../lib/report-state';
import data from '../lib/reviewed-reports.json';
import type {Report} from '../lib/catalog';
const now=Date.parse('2026-10-26T17:35:00Z');
const rows=currentReports(data as Report[]);
const blue=rows.filter(r=>r.station==='place-state'&&r.design==='capitol');
assert.equal(blue.length,1);assert.equal(blue[0].status,'unavailable');
const old=data.find(r=>r.design==='capitol'&&r.status==='available')!;
const gone={...old,id:'new',machine:'FVM #221054',exitId:'known-exit',status:'unavailable',observedAt:now};
assert.equal(currentReports([old,gone])[0].id,'new');assert.equal(currentReports([gone,old]).length,1);
const fresh={...old,id:'a',observedAt:now,sourceUrl:'https://reddit.com/comment/a'};
assert.equal(confidence(fresh,[fresh],now).level,'Medium');
const confirm={...fresh,id:'b',sourceUrl:'https://reddit.com/comment/b'};
assert.equal(confidence(fresh,[fresh,confirm],now).level,'High');
assert.equal(confidence(fresh,[fresh,{...confirm,status:'unavailable'}],now).level,'Low');
assert.equal(confidence(old,[old],now).level,'Low');
console.log('Passed: newer gone report supersedes older availability; machine IDs match across labels/exits; confidence uses recency, corroboration and conflict.');

assert.equal(availableReports([old,gone]).length,0);
assert.equal(availableReports([gone,{...old,id:"restocked",observedAt:now+1}]).length,1);
assert.ok(!availableReports(data as Report[]).some(r=>r.station==="place-coecl"));
assert.ok(availableReports(data as Report[]).some(r=>r.station==="place-aqucl"&&r.design==="constitution"));
assert.ok(!availableReports(data as Report[]).some(r=>r.station==="place-forhl"&&r.design==="library"));

// Details affect ranking, not which observation supersedes an older one.
const vague={...fresh,id:'vague',machine:'Unknown',exitId:null,notes:''};
const detailed={...vague,id:'detailed',machine:'Machine 123456',exitId:'known-exit'};
assert.ok(confidence(detailed,[detailed],now).score>confidence(vague,[vague],now).score);
assert.equal(confidence({...vague,notes:'great '.repeat(100)},[vague],now).score,confidence(vague,[vague],now).score);
assert.equal(confidence({...detailed,source:'community'},[detailed],now).score,confidence(detailed,[detailed],now).score);
const removed={...detailed,id:'removed',observedAt:now+1,status:'unavailable'};
assert.equal(availableReports([detailed,removed]).length,0);
