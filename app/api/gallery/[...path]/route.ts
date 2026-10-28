import {galleryBackend} from '../../../../lib/gallery/server';
import {createHash} from 'node:crypto';
export const dynamic='force-dynamic';
export async function GET(request:Request,{params}:{params:Promise<{path:string[]}>}){
 const {path}=await params;
 if(path.length!==2||path[0]!=='image'||!/^[a-f0-9-]{36}$/i.test(path[1]))return new Response('Not found',{status:404});
 try{const r=await galleryBackend('image/'+path[1]);return new Response(r.body,{status:r.status,headers:{'Content-Type':r.headers.get('content-type')||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}catch{return new Response('Image unavailable',{status:503});}
}
export async function POST(request:Request,{params}:{params:Promise<{path:string[]}>}){
 const {path}=await params;if(path.join('/')!=='inquire')return new Response('Not found',{status:404});
 if(request.headers.get('origin')!==new URL(request.url).origin)return new Response('Forbidden',{status:403});
 if(!request.headers.get('content-type')?.includes('application/json'))return new Response('JSON required',{status:415});
 try{const raw=await request.text();if(raw.length>12000)return new Response('Request too large',{status:413});const b=JSON.parse(raw);
 const ip=request.headers.get('x-vercel-forwarded-for')||request.headers.get('x-forwarded-for')||'unknown';
 b.rateKey=createHash('sha256').update((process.env.SERAAI_BACKEND_TOKEN||'')+ip.split(',')[0]).digest('hex');
 const r=await galleryBackend('inquire',{method:'POST',body:JSON.stringify(b)});return new Response(r.body,{status:r.status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Unable to send your inquiry. Please try again.'},{status:503});}
}
