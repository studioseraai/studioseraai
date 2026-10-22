// Vercel has no D1/R2 bindings. Keep credentials and storage access server-side.
export function authorize(request: Request): Response | null {
 const password=process.env.SERAAI_PASSWORD;
 if(!password || password.length<16) return Response.json({error:'Set SERAAI_PASSWORD (at least 16 characters) in Vercel environment variables.'},{status:503});
 let supplied='';try{supplied=atob((request.headers.get('authorization')||'').replace(/^Basic /,''));}catch{}
 if(supplied!==`owner:${password}`)return new Response('Sign in with username owner and your workspace password.',{status:401,headers:{'WWW-Authenticate':'Basic realm="Studio Seraai OS", charset="UTF-8"','Cache-Control':'no-store'}});
 return null;
}
export async function forward(request:Request, endpoint:string){
 const denied=authorize(request);if(denied)return denied;
 const origin=process.env.SERAAI_BACKEND_URL, token=process.env.SERAAI_BACKEND_TOKEN;
 if(!origin||!token)return Response.json({error:'Storage backend is not configured. Follow DEPLOY_VERCEL.md to set SERAAI_BACKEND_URL and SERAAI_BACKEND_TOKEN.'},{status:503});
 if(request.method==='POST'&&request.headers.get('origin')!==new URL(request.url).origin)return new Response('Forbidden',{status:403});
 const base=new URL(origin);if(base.protocol!=='https:')return Response.json({error:'Backend must use HTTPS'},{status:503});
 const url=new URL(base.href.replace(/\/$/,'')+'/'+endpoint.replace(/^\//,''));url.search=new URL(request.url).search;
 const headers=new Headers();headers.set('authorization',`Bearer ${token}`);headers.set('origin',url.origin);
 const contentType=request.headers.get('content-type');if(contentType)headers.set('content-type',contentType);
 try{const upstream=await fetch(url,{method:request.method,headers,body:request.method==='POST'?await request.arrayBuffer():undefined,redirect:'error',cache:'no-store'});const outgoing=new Headers({'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'});outgoing.set('Content-Type',upstream.headers.get('content-type')||'application/json');return new Response(upstream.body,{status:upstream.status,headers:outgoing});}
 catch{return Response.json({error:'Storage backend unavailable. Check backend URL and deployment.'},{status:502});}
}
