import {env} from 'cloudflare:workers';
import {eq} from 'drizzle-orm';
import {getDb} from '../../../../db';
import {reports} from '../../../../db/schema';
import {cors} from '../../../../lib/cors';

export async function GET(req:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 if(!/^[0-9a-f-]{36}$/.test(id))return new Response('Photo not found',{status:404});
 try{
  const [report]=await getDb().select({photoKey:reports.photoKey}).from(reports).where(eq(reports.id,id)).limit(1);
  if(!report?.photoKey)return new Response('Photo not found',{status:404});
  const photo=await env.BUCKET?.get(report.photoKey);
  if(!photo)return new Response('Photo not found',{status:404});
  return cors(req,new Response(photo.body,{headers:{'Content-Type':'image/jpeg','Cache-Control':'public, max-age=86400','X-Content-Type-Options':'nosniff'}}));
 }catch{return new Response('Photo temporarily unavailable',{status:503});}
}
