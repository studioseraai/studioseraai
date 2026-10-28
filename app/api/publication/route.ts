import {authorize} from '../../../lib/platform/vercel';
import {galleryBackend} from '../../../lib/gallery/server';
export const dynamic='force-dynamic';
async function handle(request:Request){const denied=authorize(request);if(denied)return denied;
 if(request.method==='POST'&&request.headers.get('origin')!==new URL(request.url).origin)return new Response('Forbidden',{status:403});
 try{const body=request.method==='POST'?await request.text():undefined;if(body&&body.length>16000)return new Response('Too large',{status:413});const r=await galleryBackend('admin',{method:request.method,body});return new Response(r.body,{status:r.status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});}catch{return Response.json({error:'Gallery publishing is unavailable.'},{status:503});}}
export const GET=handle;export const POST=handle;
