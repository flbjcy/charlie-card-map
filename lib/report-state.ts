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
 const numbered=/\b\d{4,6}\b/.test(r.machine)&&! /possibly|think|maybe/i.test(r.machine);
 const located=Boolean(r.exitId)||/leftmost|rightmost|second from|closest to|next to|by the kiosk|platform|entrance|concourse/i.test(r.machine);
 const detail=(numbered?10:0)+(located?5:0);
 const recency=h<=6?60:h<=24?45:h<=48?25:5;
 const score=Math.max(0,recency+detail+Math.min(20,(supports-1)*10)-(conflict?40:0));
 const detailReason=[numbered?'Machine number supplied':null,located?'Location details supplied':null].filter(Boolean).join('. ');
 return {level,score,reason:conflict?'Reports disagree within the past day. The newest observation takes precedence.':`Reported ${age}. ${supports>1?`${supports} matching reports within 48 hours.`:'No independent recent confirmation.'}${detailReason?' '+detailReason+'.':''}`};
}

export function availableReports(reports:Report[]){return currentReports(reports).filter(r=>r.status==='available')}

export function rankedCardGroups(reports:Report[],station:string,design='all',now=Date.now()){
 const groups=new Map<string,Report[]>();
 for(const r of availableReports(reports).filter(r=>r.station===station&&(design==='all'||r.design===design))){groups.set(r.design,[...(groups.get(r.design)||[]),r]);}
 return [...groups.entries()].map(([design,items])=>({design,items:items.sort((a,b)=>confidence(b,reports,now).score-confidence(a,reports,now).score||b.observedAt-a.observedAt||a.id.localeCompare(b.id))})).sort((a,b)=>confidence(b.items[0],reports,now).score-confidence(a.items[0],reports,now).score||a.design.localeCompare(b.design));
}
export function reportHistory(r:Report,reports:Report[]){return reports.filter(x=>machineKey(x)===machineKey(r)).sort((a,b)=>b.observedAt-a.observedAt||b.createdAt-a.createdAt);}
