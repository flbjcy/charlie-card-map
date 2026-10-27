import type {Report} from './catalog';
export function machineKey(r:Report){const number=r.machine.match(/\b\d{4,6}\b/)?.[0];return number ? `${r.station}|${r.design}|${number}` : `${r.station}|${r.design}|${r.exitId||'unknown'}|${r.machine.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}`}
export function currentReports(reports:Report[]){const latest=new Map<string,Report>();for(const r of [...reports].sort((a,b)=>b.observedAt-a.observedAt||b.createdAt-a.createdAt)){const key=machineKey(r);if(!latest.has(key))latest.set(key,r)}return [...latest.values()]}
export function confidence(r:Report,reports:Report[],now=Date.now()){
 const h=Math.max(0,(now-r.observedAt)/3600000),key=machineKey(r);
 const related=reports.filter(x=>machineKey(x)===key && Math.abs(r.observedAt-x.observedAt)<=48*3600000);
 const supports=new Set(related.filter(x=>x.status===r.status).map(x=>x.sourceUrl||x.id)).size;
 const conflict=related.some(x=>x.status!==r.status&&Math.abs(x.observedAt-r.observedAt)<24*3600000);
 const recentSupports=new Set(related.filter(x=>x.status===r.status&&now-x.observedAt<=6*3600000).map(x=>x.sourceUrl||x.id)).size;
 const level=conflict?'Low':h<=6&&recentSupports>=2?'High':h<=24||h<=48&&supports>=2?'Medium':'Low';
 const age=h<1?'less than an hour ago':h<24?`${Math.floor(h)} hours ago`:`${Math.floor(h/24)} days ago`;
 return {level,reason:conflict?'Reports disagree within the past day. The newest observation takes precedence.':`Reported ${age}. ${supports>1?`${supports} matching reports within 48 hours.`:'No independent recent confirmation.'}`};
}

export function availableReports(reports:Report[]){return currentReports(reports).filter(r=>r.status==='available')}
