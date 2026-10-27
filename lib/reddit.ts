import { designs, stations, type Report, THREAD } from './catalog';
// Ambiguous comments stay off the map. A line color is not a card design.
export function parseComment(c:{id:string;body:string;created_utc:number;permalink:string},now=Date.now()):Report|null {
 const t=c.body.toLowerCase();
 if(!c.id || !Number.isFinite(c.created_utc)||c.created_utc*1000>now || /\?|\b(hope|hopefully|maybe|might|heard|last week|yesterday|last month|previously)\b/.test(t))return null;
 const ds=designs.filter(d=>d.aliases.some(a=>t.includes(a)));
 const ss=stations.filter(s=>t.includes('at '+s.name.toLowerCase())||t.includes('from '+s.name.toLowerCase()));
 if(ds.length!==1||ss.length!==1||!(/\b(got|found|dispensed|available|picked up|sold out|ran out)\b/.test(t)))return null;
 const machine=t.match(/(?:machine|kiosk|fvm)\s*(?:#|number|no\.)?\s*(\d{1,6})\b/i)?.[1];
 return {id:'reddit-'+c.id,station:ss[0].id,design:ds[0].id,machine:machine?'Machine '+machine:'Not specified',color:t.match(/\b(red|blue|green|orange|purple|yellow|silver|gold|pink|black)\b/)?.[1]||'Not specified',status:/sold out|ran out/.test(t)?'unavailable':'available',observedAt:c.created_utc*1000,createdAt:now,notes:c.body.slice(0,1000),source:'reddit',sourceUrl: /^\/r\/mbta\/comments\/1xaqcns\//.test(c.permalink)?'https://www.reddit.com'+c.permalink:THREAD};
}
