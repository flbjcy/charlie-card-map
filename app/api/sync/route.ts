import {fetchRedditComments} from '../../../lib/reddit-access';
import {getDb} from '../../../db';
import {reports,syncState} from '../../../db/schema';
import {parseComment} from '../../../lib/reddit';
import {eq,lt} from 'drizzle-orm';
export async function POST(){const db=getDb(),now=Date.now();try{
 await db.insert(syncState).values({id:'reddit',attemptedAt:0,message:'Not checked yet'}).onConflictDoNothing();
 const lock=await db.update(syncState).set({attemptedAt:now}).where(lt(syncState.attemptedAt,now-600000)).returning();
 if(!lock.length){const state=await db.select().from(syncState).limit(1);const failed=!state[0]?.succeededAt||state[0].succeededAt<state[0].attemptedAt;return Response.json(failed?{error:'The latest Reddit sync failed. Browser-reviewed reports remain available. The server will retry after ten minutes.'}:{message:'Reddit was checked recently. Next automatic check is within ten minutes.'},{status:failed?503:200});}
 const response=await fetchRedditComments();
 if(!response.ok || !response.headers.get('content-type')?.includes('json'))throw new Error('Reddit blocked the request');
 const data=await response.json() as any;if(!Array.isArray(data)||!data[1]?.data?.children)throw new Error('Unexpected Reddit response');
 const parsed:any[]=[];let scanned=0,more=false;
 function walk(nodes:any[]){for(const n of nodes){if(n.kind==='more'){more=true;continue}if(n.kind!=='t1')continue;scanned++;const r=parseComment(n.data,now);if(r)parsed.push(r);if(n.data.replies?.data?.children)walk(n.data.replies.data.children)}}walk(data[1].data.children);
 for(const r of parsed)await db.insert(reports).values(r).onConflictDoUpdate({target:reports.id,set:{...r}});
 const message=`Checked ${scanned} comments; ${parsed.length} explicit sightings matched.${more?' Some nested comments are not included.':''} Ambiguous comments are skipped.`;
 await db.update(syncState).set({succeededAt:now,message}).where(eq(syncState.id,'reddit'));return Response.json({ok:true,message});
 }catch{const message='Reddit live sync is unavailable. Community reports still work. View the thread for comments we could not import.';try{await db.update(syncState).set({message}).where(eq(syncState.id,'reddit'))}catch{}return Response.json({error:message},{status:503});}}
