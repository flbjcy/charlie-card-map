// Allow the public GitHub Pages frontend to use this shared backend.
const pagesOrigin='https://flbjcy.github.io';
export function allowedOrigin(req:Request){const origin=req.headers.get('origin');return !origin||origin===new URL(req.url).origin||origin===pagesOrigin;}
export function cors(req:Request,response:Response){
 if(req.headers.get('origin')===pagesOrigin){response.headers.set('Access-Control-Allow-Origin',pagesOrigin);response.headers.set('Vary','Origin');}
 return response;
}
export function preflight(req:Request){
 if(!allowedOrigin(req))return new Response(null,{status:403});
 const response=new Response(null,{status:204});response.headers.set('Access-Control-Allow-Methods','GET, POST, OPTIONS');response.headers.set('Access-Control-Allow-Headers','Content-Type');return cors(req,response);
}
