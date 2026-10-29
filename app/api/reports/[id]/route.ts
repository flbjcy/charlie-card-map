import {env} from 'cloudflare:workers';
import {eq} from 'drizzle-orm';
import {getDb} from '../../../../db';
import {reports} from '../../../../db/schema';
import {allowedOrigin,cors,preflight} from '../../../../lib/cors';

export async function DELETE(req:Request,{params}:{params:Promise<{id:string}>}){
 if(!allowedOrigin(req))return Response.json({error:'Invalid request origin.'},{status:403});
 const {id}=await params;
 const token=req.headers.get('x-report-token')||'';
 if(!/^[0-9a-f-]{36}$/.test(id)||!/^[0-9a-f]{64}$/.test(token))return cors(req,Response.json({error:'This browser cannot remove that report.'},{status:403}));
 try{
  const receipt=await env.BUCKET?.get('report-edit/'+id);
  if(!receipt)return cors(req,Response.json({error:'This report cannot be removed from this browser.'},{status:403}));
  const expected=await receipt.text();
  const actual=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token))),byte=>byte.toString(16).padStart(2,'0')).join('');
  let difference=0;for(let i=0;i<64;i++)difference|=expected.charCodeAt(i)^actual.charCodeAt(i);
  if(expected.length!==64||difference!==0)return cors(req,Response.json({error:'This browser cannot remove that report.'},{status:403}));
  const db=getDb();
  const [report]=await db.select({source:reports.source,status:reports.status}).from(reports).where(eq(reports.id,id)).limit(1);
  if(!report||report.source!=='community'||report.status==='retracted')return cors(req,Response.json({error:'Report not found.'},{status:404}));
  await db.update(reports).set({status:'retracted'}).where(eq(reports.id,id));
  await env.BUCKET?.delete('report-edit/'+id);
  return cors(req,Response.json({ok:true},{headers:{'Cache-Control':'no-store'}}));
 }catch{return cors(req,Response.json({error:'Could not remove the report. Please try again.'},{status:503}));}
}

export const OPTIONS=preflight;
