import {env} from 'cloudflare:workers';
import {allowedOrigin,cors,preflight} from '../../../lib/cors';
import reviewedReports from '../../../lib/reviewed-reports.json';
import retractedReports from '../../../lib/retracted-reports.json';
import {getDb} from '../../../db';
import {reports,syncState} from '../../../db/schema';
import {desc,eq,and,gt} from 'drizzle-orm';
import {stations,designs,exits} from '../../../lib/catalog';

async function getReports(){
 try{
  const db=getDb();
  const rows=await db.select({id:reports.id,station:reports.station,exitId:reports.exitId,design:reports.design,machine:reports.machine,color:reports.color,status:reports.status,observedAt:reports.observedAt,createdAt:reports.createdAt,notes:reports.notes,source:reports.source,sourceUrl:reports.sourceUrl,photoKey:reports.photoKey}).from(reports).orderBy(desc(reports.observedAt)).limit(2000);
  const sync=await db.select().from(syncState).limit(1);
  const publicRows=rows.filter(row=>row.status!=='retracted'&&!retractedReports.includes(row.id)).map(({photoKey,...report})=>({...report,paymentMethod:report.color==='payment:credit_card'?'credit_card':report.color==='payment:coins'?'coins':report.color==='payment:both'?'both':null,hasPhoto:Boolean(photoKey)}));
  return Response.json({reports:[...publicRows,...reviewedReports.filter(r=>!rows.some(x=>x.id===r.id))].sort((a,b)=>b.observedAt-a.observedAt),sync:sync[0]||null},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Reports are temporarily unavailable. Please try again.'},{status:503});}
}

async function postReport(req:Request){
 if(!allowedOrigin(req))return Response.json({error:'Invalid request origin.'},{status:403});
 const contentType=req.headers.get('content-type')||'';
 if(contentType.includes('multipart/form-data')&&Number(req.headers.get('content-length')||0)>5_000_000)return Response.json({error:'Photo is too large (max 4 MB).'},{status:413});
 let b:Record<string,unknown>,photo:File|null=null;
 try{
  if(contentType.includes('multipart/form-data')){
   const f=await req.formData();
   b=Object.fromEntries([...f.entries()].filter(([key])=>key!=='photo'));
   b.observedAt=Number(b.observedAt);
   const candidate=f.get('photo');
   if(candidate instanceof File&&candidate.size)photo=candidate;
  }else{
   const raw=await req.text();
   if(raw.length>5000)return Response.json({error:'Report is too large.'},{status:413});
   b=JSON.parse(raw);
  }
 }catch{return Response.json({error:'Invalid report or photo.'},{status:400});}
 const now=Date.now();
 if(!b||typeof b!=='object'||!stations.some(s=>s.id===b.station)||!designs.some(d=>d.id===b.design)||!['available','unavailable'].includes(String(b.status))||typeof b.machine!=='string'||b.machine.trim().length<2||b.machine.length>120||!['','credit_card','coins','both'].includes(String(b.paymentMethod??''))||typeof b.notes!=='string'||b.notes.length>1000||typeof b.observedAt!=='number'||!Number.isFinite(b.observedAt)||b.observedAt>now+60000||b.observedAt<now-30*86400000)return Response.json({error:'Check the station, design, machine, payment, and time (within the past 30 days).'}, {status:400});
 if(b.exitId&&!exits.some(x=>x.id===b.exitId&&x.station===b.station))return Response.json({error:'Choose an exit belonging to this station, or Exit unknown.'},{status:400});
 if(b.website)return Response.json({error:'Unable to accept this report.'},{status:400});
 if(photo){
  if(photo.size>4_000_000||photo.type!=='image/jpeg')return Response.json({error:'Use a JPG photo under 4 MB.'},{status:400});
  const magic=new Uint8Array(await photo.slice(0,3).arrayBuffer());
  if(magic[0]!==0xff||magic[1]!==0xd8||magic[2]!==0xff)return Response.json({error:'Invalid photo file.'},{status:400});
 }
 try{
  const ip=req.headers.get('cf-connecting-ip')||'local';
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ip+new Date().toISOString().slice(0,10))))).map(x=>x.toString(16).padStart(2,'0')).join('');
  const db=getDb();
  const recent=await db.select({id:reports.id}).from(reports).where(and(eq(reports.clientHash,hash),gt(reports.createdAt,now-3600000))).limit(20);
  if(recent.length>=20)return Response.json({error:'Please wait before submitting more reports. Limit: 20 per hour.'},{status:429});
  const id=crypto.randomUUID(),photoKey=photo?'machine-photos/'+id+'.jpg':null;
  const token=Array.from(crypto.getRandomValues(new Uint8Array(32)),byte=>byte.toString(16).padStart(2,'0')).join('');
  const tokenHash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token))),byte=>byte.toString(16).padStart(2,'0')).join('');
  if(!env.BUCKET)throw Error('Report ownership storage unavailable');
  if(photoKey){if(!env.BUCKET)throw Error('Photo storage unavailable');await env.BUCKET.put(photoKey,photo!.stream(),{httpMetadata:{contentType:'image/jpeg'}});}
  try{
   await env.BUCKET.put('report-edit/'+id,tokenHash);
   await db.insert(reports).values({id,station:String(b.station),exitId:b.exitId?String(b.exitId):null,design:String(b.design),machine:b.machine.trim(),color:b.paymentMethod?'payment:'+String(b.paymentMethod):'Not specified',status:String(b.status),observedAt:b.observedAt,createdAt:now,notes:b.notes.trim(),source:'community',sourceUrl:null,clientHash:hash,photoKey});
  }catch(error){if(photoKey)await env.BUCKET?.delete(photoKey);await env.BUCKET.delete('report-edit/'+id);throw error;}
  return Response.json({ok:true,id,editToken:token},{status:201,headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Your report could not be saved. Please try again.'},{status:503});}
}

export async function GET(req:Request){return cors(req,await getReports());}
export async function POST(req:Request){return cors(req,await postReport(req));}
export const OPTIONS=preflight;
