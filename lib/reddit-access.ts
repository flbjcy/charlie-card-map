import {env} from 'cloudflare:workers';
// Reddit app credentials are server-only runtime secrets. This is app-only
// access to public comments; visitors never need to connect an account.
export async function fetchRedditComments(){
 const config=env as unknown as Record<string,string|undefined>;
 const headers:Record<string,string>={'User-Agent':config.REDDIT_USER_AGENT||'web:CharlieCardHunt:1.0 (community sightings map)'};
 let host='https://www.reddit.com';
 if(config.REDDIT_CLIENT_ID&&config.REDDIT_CLIENT_SECRET){
  const body=new URLSearchParams(config.REDDIT_REFRESH_TOKEN?{grant_type:'refresh_token',refresh_token:config.REDDIT_REFRESH_TOKEN}:{grant_type:'client_credentials'});
  const res=await fetch('https://www.reddit.com/api/v1/access_token',{method:'POST',headers:{...headers,'Content-Type':'application/x-www-form-urlencoded',Authorization:'Basic '+btoa(config.REDDIT_CLIENT_ID+':'+config.REDDIT_CLIENT_SECRET)},body,signal:AbortSignal.timeout(10000)});
  if(!res.ok)throw Error('Reddit authorization unavailable');
  const token=await res.json() as {access_token?:string};if(!token.access_token)throw Error('Reddit token unavailable');
  host='https://oauth.reddit.com';headers.Authorization='Bearer '+token.access_token;
 }
 return fetch(host+'/r/mbta/comments/1xaqcns.json?sort=new&limit=500&raw_json=1',{headers,signal:AbortSignal.timeout(12000)});
}
