import assert from 'node:assert/strict';
import {parseComment} from '../lib/reddit';
import {freshness,stations,exits,type Report} from '../lib/catalog';
import {decodePolyline} from '../lib/map-lines';
import lines from '../lib/lines.json';
const now=Date.now();
const base={id:'test',created_utc:Math.floor(now/1000),permalink:'/r/mbta/comments/1xaqcns/x/test/'};
const good=parseComment({...base,body:'I found a USS Constitution card at Park Street, machine #12.'},now);
assert(good);assert.equal(good.station,'place-pktrm');assert.equal(good.machine,'Machine 12');assert.equal(good.status,'available');
for(const body of ['Could I find a USS Constitution card at Park Street?','I found a USS Constitution card at Park Street yesterday','I found a USS Constitution card at Park Street and from Downtown Crossing','I found green at Park Street','I heard USS Constitution is available at Park Street'])assert.equal(parseComment({...base,body},now),null,body);
assert.equal(parseComment({...base,body:'USS Constitution sold out at Park Street machine 12'},now)?.status,'unavailable');
const report={...good,observedAt:now} as Report;
for(const [hours,label] of [[0,'Fresh'],[6,'Fresh'],[7,'Recent'],[25,'Aging'],[73,'Stale']] as const)assert.equal(freshness({...report,observedAt:now-hours*3600000},now),label);
assert(exits.length>300);for(const e of exits){assert(stations.some(s=>s.id===e.station));assert(e.lat>42&&e.lat<43);assert(e.lng< -70&&e.lng> -72)}
for(const line of lines)for(const shape of line.shapes){const coords=decodePolyline(shape);assert(coords.length>2);assert(coords.every(([lat,lng])=>lat>42&&lat<43&&lng> -72&&lng< -70))}
console.log('Passed: extraction, ambiguity rejection, timestamps, freshness, 309 exit links, and subway geometry.');
