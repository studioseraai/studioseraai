// Read-only public catalog attributes. Private inventory details never leave the service.
const API=Deno.env.get('SUPABASE_URL')!;
const KEYS=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')||'{}');
const KEY=KEYS.default||Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
async function getRows(path:string){
 const headers=new Headers({'apikey':KEY});
 if(KEY.startsWith('eyJ'))headers.set('Authorization','Bearer '+KEY);
 const response=await fetch(API+'/rest/v1/'+path,{headers});
 if(!response.ok)throw Error('Query failed');
 return await response.json();
}
Deno.serve(async req=>{
 if(req.method!=='GET'||new URL(req.url).pathname.split('/').pop()!=='catalog')return json({error:'Not found'},404);
 const expected=Deno.env.get('SERAAI_BACKEND_TOKEN');
 const supplied=(req.headers.get('authorization')||'').replace(/^Bearer /i,'');
 if(!expected||!supplied||supplied.length!==expected.length){return json({error:'Unauthorized'},401);}
 // Constant-time comparison of credentials.
 const a=new TextEncoder().encode(supplied),b=new TextEncoder().encode(expected);
 let difference=0;for(let i=0;i<a.length;i++)difference|=a[i]^b[i];
 if(difference!==0)return json({error:'Unauthorized'},401);
 if(!KEY)return json({error:'Unavailable'},503);
 try{
  const pubs=await getRows('seraai_publications?published=eq.true&select=artwork_id');
  const result=[];
  for(let i=0;i<pubs.length;i+=100){
   const ids=pubs.slice(i,i+100).map((p:{artwork_id:number})=>p.artwork_id).join(',');
   if(!ids)continue;
   const [rows,photos]=await Promise.all([
    getRows('seraai_records?kind=eq.artwork&id=in.('+ids+')&select=id,data'),
    getRows('seraai_media?artwork_id=in.('+ids+')&select=artwork_id&limit=10000')
   ]);
   const photographed=new Set(photos.map((p:{artwork_id:number})=>p.artwork_id));
   for(const row of rows){
    const d=row.data||{};
    if(d.sample||d.archived||!photographed.has(row.id))continue;
    result.push({id:row.id,theme:String(d.theme||''),style:String(d.style||''),surface:String(d.surface||''),size:String(d.originalSize||d.wordpressSize||''),medium:String(d.medium||'')});
   }
  }
  return json({attributes:result});
 }catch{return json({error:'Catalog temporarily unavailable'},503);}
});