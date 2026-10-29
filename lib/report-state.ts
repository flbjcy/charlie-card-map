import type {Report} from './catalog';
export function cleanMachineLabel(machine:string){return machineNumber(machine)||'Unknown'}
function machineNumber(machine:string){const matches=[...machine.matchAll(/(?:^|\D)(\d{3,6})(?!\d)/g)].map(match=>match[1]);return matches.length===1?matches[0]:null}
export function machineKey(r:Report,reports:Report[]=[]){
 const number=machineNumber(r.machine);
 if(number){
  if(number.length===6)return `${r.station}|${r.design}|${number}`;
  const matches=new Set(reports.filter(other=>other.station===r.station&&other.design===r.design).map(other=>machineNumber(other.machine)).filter((candidate):candidate is string=>Boolean(candidate&&candidate.length===6&&candidate.endsWith(number))));
  // A suffix is only safe when one full machine ID fits this station and card.
  return `${r.station}|${r.design}|${matches.size===1?[...matches][0]:`suffix-${number}`}`;
 }
 return `${r.station}|${r.design}|${r.exitId||'unknown'}|${r.machine.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}`;
}
export function currentReports(reports:Report[]){const latest=new Map<string,Report>();for(const r of [...reports].sort((a,b)=>b.observedAt-a.observedAt||b.createdAt-a.createdAt)){const key=machineKey(r,reports);if(!latest.has(key))latest.set(key,r)}return [...latest.values()]}
export function confidence(r:Report,reports:Report[],now=Date.now()){
 const h=Math.max(0,(now-r.observedAt)/3600000),key=machineKey(r,reports);
 const related=reports.filter(x=>machineKey(x,reports)===key && Math.abs(r.observedAt-x.observedAt)<=48*3600000);
 const supports=new Set(related.filter(x=>x.status===r.status).map(x=>x.sourceUrl||x.id)).size;
 const conflict=related.some(x=>x.status!==r.status&&Math.abs(x.observedAt-r.observedAt)<24*3600000);
 const recentSupports=new Set(related.filter(x=>x.status===r.status&&now-x.observedAt<=6*3600000).map(x=>x.sourceUrl||x.id)).size;
 const level=conflict?'Low':h<=6&&recentSupports>=2?'High':h<=24||h<=48&&supports>=2?'Medium':'Low';
 const age=h<1?'less than an hour ago':h<24?`${Math.floor(h)} hours ago`:`${Math.floor(h/24)} days ago`;
 const numbered=Boolean(machineNumber(r.machine))&&! /possibly|think|maybe/i.test(r.machine);
 const located=Boolean(r.exitId)||/leftmost|rightmost|second from|closest to|next to|by the kiosk|platform|entrance|concourse/i.test(r.machine);
 const detail=(numbered?(machineNumber(r.machine)?.length===6?10:7):0)+(located?5:0);
 const recency=h<=6?60:h<=24?45:h<=48?25:5;
 const score=Math.max(0,recency+detail+Math.min(20,(supports-1)*10)-(conflict?40:0));
 const detailReason=[numbered?(machineNumber(r.machine)?.length===6?'Machine number supplied':'Machine number suffix supplied'):null,located?'Location details supplied':null].filter(Boolean).join('. ');
 return {level,score,reason:conflict?'Reports disagree within the past day. The newest observation takes precedence.':`Reported ${age}. ${supports>1?`${supports} matching reports within 48 hours.`:'No independent recent confirmation.'}${detailReason?' '+detailReason+'.':''}`};
}

export function availableReports(reports:Report[]){return currentReports(reports).filter(r=>r.status==='available')}

export function rankedCardGroups(reports:Report[],station:string,design='all',now=Date.now()){
 const groups=new Map<string,Report[]>();
 for(const r of availableReports(reports).filter(r=>r.station===station&&(design==='all'||r.design===design))){groups.set(r.design,[...(groups.get(r.design)||[]),r]);}
 return [...groups.entries()].map(([design,items])=>({design,items:items.sort((a,b)=>confidence(b,reports,now).score-confidence(a,reports,now).score||b.observedAt-a.observedAt||a.id.localeCompare(b.id))})).sort((a,b)=>confidence(b.items[0],reports,now).score-confidence(a.items[0],reports,now).score||a.design.localeCompare(b.design));
}
export function reportHistory(r:Report,reports:Report[]){return reports.filter(x=>machineKey(x,reports)===machineKey(r,reports)).sort((a,b)=>b.observedAt-a.observedAt||b.createdAt-a.createdAt);}
