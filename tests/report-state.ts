import assert from 'node:assert/strict';
import {currentReports,availableReports,confidence,reportHistory} from '../lib/report-state';
import data from '../lib/reviewed-reports.json';
import type {Report} from '../lib/catalog';
const now=Date.parse('2026-10-26T17:35:00Z');
const rows=currentReports(data as Report[]);
const blue=rows.filter(r=>r.station==='place-state'&&r.design==='capitol');
assert.equal(blue.length,1);assert.equal(blue[0].status,'unavailable');
const old=data.find(r=>r.id==='reviewed-19rn5fs90warl-place-state-capitol')!;
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

// A unique three-digit suffix is the same machine only within its station and design.
const parkFull={...fresh,id:'park-full',station:'place-pktrm',design:'oldstate',machine:'Machine 221186',status:'available'};
const parkShort={...parkFull,id:'park-short',machine:'186',status:'unavailable',observedAt:now+1};
assert.deepEqual(currentReports([parkFull,parkShort]).map(r=>r.id),['park-short']);
assert.equal(reportHistory(parkFull,[parkFull,parkShort]).length,2);
const stateFull={...fresh,id:'state-full',station:'place-state',design:'bunker',machine:'221277'};
const stateShort={...stateFull,id:'state-short',machine:'Ending 277',observedAt:now+1};
assert.equal(currentReports([stateFull,stateShort]).length,1);
assert.equal(currentReports([{...stateFull,machine:'221227'},{...stateShort,machine:'227'}]).length,1);
assert.equal(currentReports([stateFull,{...stateShort,station:'place-pktrm'}]).length,2);
assert.equal(currentReports([stateFull,{...stateShort,design:'tea'}]).length,2);
const collision={...stateFull,id:'collision',machine:'222277'};
assert.equal(currentReports([stateFull,stateShort,collision]).length,3);
