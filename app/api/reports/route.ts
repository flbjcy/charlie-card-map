import {allowedOrigin,cors,preflight} from '../../../lib/cors';
import reviewedReports from '../../../lib/reviewed-reports.json';
import { getDb } from '../../../db';
import { reports, syncState } from '../../../db/schema';
import { desc, eq, and, gt } from 'drizzle-orm';
import { stations, designs, exits } from '../../../lib/catalog';
async function getReports(){try{const db=getDb();const rows=await db.select({id:reports.id,station:reports.station,exitId:reports.exitId,design:reports.design,machine:reports.machine,color:reports.color,status:reports.status,observedAt:reports.observedAt,createdAt:reports.createdAt,notes:reports.notes,source:reports.source,sourceUrl:reports.sourceUrl}).from(reports).orderBy(desc(reports.observedAt)).limit(2000);const sync=await db.select().from(syncState).limit(1);return Response.json({reports:[...rows,...reviewedReports.filter(r=>!rows.some(x=>x.id===r.id))].sort((a,b)=>b.observedAt-a.observedAt),sync:sync[0]||null},{headers:{'Cache-Control':'no-store'}});}catch{return Response.json({error:'Reports are temporarily unavailable. Please try again.'},{status:503});}}
async function postReport(req:Request){try{
 if(!allowedOrigin(req))return Response.json({error:'Invalid request origin.'},{status:403});
 const raw=await req.text();if(raw.length>5000)return Response.json({error:'Report is too large.'},{status:413});
 let b;try{b=JSON.parse(raw)}catch{return Response.json({error:'Invalid report.'},{status:400})}
 const now=Date.now();
 if(!b||typeof b!=='object'||!stations.some(s=>s.id===b.station)||!designs.some(d=>d.id===b.design)||!['available','unavailable'].includes(b.status)||typeof b.machine!=='string'||b.machine.trim().length<2||b.machine.length>120||typeof b.color!=='string'||b.color.length>40||typeof b.notes!=='string'||b.notes.length>1000||typeof b.observedAt!=='number'||!Number.isFinite(b.observedAt)||b.observedAt>now+60000||b.observedAt<now-30*86400000)return Response.json({error:'Check the station, design, machine, and time (within the past 30 days).'}, {status:400});
 if(b.exitId && !exits.some(x=>x.id===b.exitId&&x.station===b.station))return Response.json({error:'Choose an exit belonging to this station, or Exit unknown.'},{status:400});
 if(b.website)return Response.json({error:'Unable to accept this report.'},{status:400});
 const ip=req.headers.get('cf-connecting-ip')||'local';
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ip+new Date().toISOString().slice(0,10))))).map(x=>x.toString(16).padStart(2,'0')).join('');
 const db=getDb();const recent=await db.select({id:reports.id}).from(reports).where(and(eq(reports.clientHash,hash),gt(reports.createdAt,now-3600000))).limit(20);
 if(recent.length>=20)return Response.json({error:'Please wait before submitting more reports. Limit: 20 per hour.'},{status:429});
 const r={id:crypto.randomUUID(),station:b.station,exitId:b.exitId||null,design:b.design,machine:b.machine.trim(),color:b.color.trim()||'Not specified',status:b.status,observedAt:b.observedAt,createdAt:now,notes:b.notes.trim(),source:'community',sourceUrl:null,clientHash:hash};
 await db.insert(reports).values(r);return Response.json({ok:true,id:r.id},{status:201});
 }catch{return Response.json({error:'Your report could not be saved. Please try again.'},{status:503});}}

export async function GET(req:Request){return cors(req,await getReports());}
export async function POST(req:Request){return cors(req,await postReport(req));}
export const OPTIONS=preflight;
