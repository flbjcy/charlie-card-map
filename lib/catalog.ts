import exitData from './exits.json';
export const exits=exitData;
import stationsData from './stations.json';
export const stations = stationsData;
export const THREAD='https://www.reddit.com/r/mbta/comments/1xaqcns/limited_edition_special_design_charlie_cards/';
export const designs = [
 {id:'library',name:'Boston Public Library',short:'Public Library',symbol:'▥',season:'Summer 2026',aliases:['boston public library','public library','bpl']},
 {id:'south',name:'South Station',short:'South Station',symbol:'▤',season:'Summer 2026',aliases:['south station card','south station design']},
 {id:'constitution',name:'USS Constitution',short:'USS Constitution',symbol:'⚓',season:'Summer 2026',aliases:['uss constitution','constitution','old ironsides']},
 {id:'capitol',name:'Massachusetts State House',short:'State House',symbol:'♜',season:'Fall 2026',aliases:['massachusetts state house','new state house','state capitol','state capital']},
 {id:'bunker',name:'Bunker Hill Monument',short:'Bunker Hill',symbol:'♙',season:'Fall 2026',aliases:['bunker hill','bunkerhill']},
 {id:'tea',name:'Boston Tea Party Ships & Museum',short:'Tea Party Ships',symbol:'♧',season:'Fall 2026',aliases:['tea party']},
 {id:'oldstate',name:'Old State House',short:'Old State House',symbol:'♖',season:'Fall 2026',aliases:['old state house']},
 {id:'garden',name:'TD Garden',short:'TD Garden',symbol:'▦',season:'Fall 2026',aliases:['td garden']},
];
export type Report={id:string;station:string;exitId?:string|null;design:string;machine:string;color:string;status:string;observedAt:number;createdAt:number;notes:string;source:string;sourceUrl?:string|null;hasPhoto?:boolean};
export function freshness(r:Report,now=Date.now()) {const h=Math.max(0,(now-r.observedAt)/3600000);return h<=6?'Fresh':h<=24?'Recent':h<=72?'Aging':'Stale';}
export function age(time:number,now=Date.now()){const m=Math.max(0,Math.floor((now-time)/60000));return m<1?'Just now':m<60?`${m}m ago`:m<1440?`${Math.floor(m/60)}h ago`:`${Math.floor(m/1440)}d ago`;}
