import {getDb} from '../../../db';
import {traffic} from '../../../db/schema';
import {sql,lt} from 'drizzle-orm';
import {allowedOrigin,cors,preflight} from '../../../lib/cors';
export const OPTIONS=preflight;
export async function POST(req:Request){
 if(!allowedOrigin(req))return new Response(null,{status:403});
 try{
 const raw=await req.text();if(raw.length>500)return cors(req,new Response(null,{status:413}));
 const b=JSON.parse(raw);
 if(!b||typeof b.id!=='string'||!/^[0-9a-f-]{36}$/.test(b.id)||!['Direct / unknown','Reddit','Google','GitHub','Other'].includes(b.source)||!['Mobile','Desktop'].includes(b.device)||typeof b.visit!=='boolean')return cors(req,new Response(null,{status:400}));
 if(/bot|crawler|spider|headless/i.test(req.headers.get('user-agent')||'')||req.headers.get('dnt')==='1'||req.headers.get('sec-gpc')==='1')return cors(req,new Response(null,{status:204}));
 const now=Date.now(),db=getDb();
 await db.insert(traffic).values({id:b.id,day:new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(now),createdAt:now,source:b.source,device:b.device,visit:b.visit?1:0}).onConflictDoNothing();
 await db.delete(traffic).where(lt(traffic.createdAt,now-90*86400000));
 return cors(req,new Response(null,{status:204}));
 }catch{return cors(req,new Response(null,{status:503}));}
}
export async function GET(req:Request){try{
 const db=getDb(),cutoff=Date.now()-90*86400000;
 const rows=await db.select({day:traffic.day,source:traffic.source,device:traffic.device,views:sql<number>`count(*)`,visits:sql<number>`sum(${traffic.visit})`}).from(traffic).where(sql`${traffic.createdAt} >= ${cutoff}`).groupBy(traffic.day,traffic.source,traffic.device).orderBy(traffic.day);
 return cors(req,Response.json({rows},{headers:{'Cache-Control':'no-store'}}));
 }catch{return cors(req,Response.json({error:'Traffic totals are temporarily unavailable.'},{status:503}));}}
