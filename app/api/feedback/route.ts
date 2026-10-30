import {env} from 'cloudflare:workers';
import {allowedOrigin,cors,preflight} from '../../../lib/cors';

export async function POST(req:Request){
 if(!allowedOrigin(req))return Response.json({error:'Invalid request origin.'},{status:403});
 const reply=(body:object,status:number)=>cors(req,Response.json(body,{status,headers:{'Cache-Control':'no-store'}}));
 if(!req.headers.get('content-type')?.includes('application/json'))return reply({error:'Send feedback as JSON.'},415);
 if(Number(req.headers.get('content-length')||0)>10000)return reply({error:'Feedback is too long.'},413);
 let body:any;
 try{const raw=await req.text();if(raw.length>6000)return reply({error:'Feedback is too long.'},413);body=JSON.parse(raw);}catch{return reply({error:'Check your feedback and try again.'},400);}
 if(!body||!['suggestion','error','other'].includes(body.category)||typeof body.message!=='string'||body.message.trim().length<3||body.message.length>2000||body.website)return reply({error:'Choose a type and enter 3–2,000 characters.'},400);
 try{
  if(!env.DB||!env.BUCKET)throw Error('Storage unavailable');
  const now=Date.now(),hour=Math.floor(now/3600000);
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode((req.headers.get('cf-connecting-ip')||'local')+':feedback:'+hour))),x=>x.toString(16).padStart(2,'0')).join('');
  const key='feedback-rate/'+hour+'/'+hash;
  const previous=await env.BUCKET.get(key);const count=previous?Number(await previous.text())||0:0;
  if(count>=8)return reply({error:'Please wait before sending more feedback. Limit: 8 per hour.'},429);
  await env.BUCKET.put(key,String(count+1));
  await env.DB.prepare('CREATE TABLE IF NOT EXISTS feedback (id TEXT PRIMARY KEY, category TEXT NOT NULL, message TEXT NOT NULL, created_at INTEGER NOT NULL)').run();
  const id=crypto.randomUUID();
  await env.DB.prepare('INSERT INTO feedback (id,category,message,created_at) VALUES (?,?,?,?)').bind(id,body.category,body.message.trim(),now).run();
  return reply({ok:true,id},201);
 }catch{return reply({error:'Feedback could not be saved. Please try again.'},503);}
}
// Feedback is not exposed by a public listing endpoint.
export const OPTIONS=preflight;
