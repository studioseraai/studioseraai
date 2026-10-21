import * as data from '../lib/platform/cloudflare-data';
import * as media from '../lib/platform/cloudflare-media';
export default {async fetch(request:Request,env:{SERAAI_BACKEND_TOKEN:string}){
 if(!env.SERAAI_BACKEND_TOKEN||request.headers.get('authorization')!==`Bearer ${env.SERAAI_BACKEND_TOKEN}`)return new Response('Unauthorized',{status:401});
 const path=new URL(request.url).pathname;
 if(path==='/api/data')return request.method==='GET'?data.GET():request.method==='POST'?data.POST(request):new Response('Method not allowed',{status:405});
 if(path==='/api/media')return request.method==='GET'?media.GET(request):request.method==='POST'?media.POST(request):new Response('Method not allowed',{status:405});
 return new Response('Not found',{status:404});
}};
