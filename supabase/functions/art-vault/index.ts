// Deno Edge Function; calls PostgREST/Storage using platform-managed server credentials.
const API=Deno.env.get('SUPABASE_URL')!;
const KEY=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')||'{}').default||Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const TOKEN_HASH='__TOKEN_HASH__';
const BUCKET='seraai-artworks';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const digest=async(b:BufferSource)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',b))).map(v=>v.toString(16).padStart(2,'0')).join('');
async function api(path:string,init:RequestInit={}){const h=new Headers(init.headers);h.set('apikey',KEY);if(KEY.startsWith('eyJ'))h.set('Authorization','Bearer '+KEY);const r=await fetch(API+path,{...init,headers:h});if(!r.ok){console.error('Supabase operation failed',r.status,path.split('?')[0]);throw Error('Storage operation failed');}return r;}
const titles=['Quiet Geometry','Terracotta Study','The Long Afternoon','Indigo Memory','A Place Between','Still in Bloom','Golden Hour','Earth & Silence','Monsoon Notes','The Courtyard','Soft Boundaries','Woven Light','Distant Hills','Open Window','Evening Rhythm','Ochre Fields','Blue Passage','A Small Gathering','Lines of Home','After the Rain'];
Deno.serve(async(req:Request)=>{
 const token=(req.headers.get('authorization')||'').replace(/^Bearer /,'');
 const configuredToken=Deno.env.get('SERAAI_BACKEND_TOKEN');
 const expectedHash=configuredToken?await digest(new TextEncoder().encode(configuredToken)):TOKEN_HASH;
 if(!token||await digest(new TextEncoder().encode(token))!==expectedHash)return json({error:'Unauthorized'},401);
 const url=new URL(req.url);const media=url.pathname.endsWith('/api/media');const data=url.pathname.endsWith('/api/data');
 try{
 if(data&&req.method==='GET'){
  const records:{id:number;kind:string;created:string;data:Record<string,unknown>}[]=[];for(let offset=0;;offset+=1000){const rows=await(await api(`/rest/v1/seraai_records?select=*&order=id.desc&offset=${offset}&limit=1000`)).json();records.push(...rows);if(rows.length<1000)break;}
  const photos:Record<string,unknown>[]=[];for(let offset=0;;offset+=1000){const rows=await(await api(`/rest/v1/seraai_media?select=*&order=created.asc&offset=${offset}&limit=1000`)).json();photos.push(...rows);if(rows.length<1000)break;}
  return json({records:records.map(r=>({...r.data,id:r.id,kind:r.kind,created:r.created})),photos});
 }
 if(data&&req.method==='POST'){
  const b=await req.json();if(!['save','movement','seed'].includes(b.action))return json({error:'Invalid action'},400);
  if(b.action==='save'&&(!['artist','artwork'].includes(b.kind)||!b.data?.title?.trim()))return json({error:'Title is required'},400);
  if(b.action==='save'&&b.data?.price!==undefined&&b.data.price!==''&&(!Number.isFinite(Number(b.data.price))||Number(b.data.price)<0))return json({error:'Invalid price'},400);
  if(b.action==='movement'&&b.effective){const date=new Date(b.effective+(b.effective.length===16?'+05:00':''));if(Number.isNaN(date.getTime()))return json({error:'Invalid movement time'},400);b.effective=date.toISOString();}
  if(b.action==='seed')b.records=titles.map((title,i)=>({title,artist:`Fictional Artist ${i%5+1}`,medium:['Oil on canvas','Acrylic on canvas','Mixed media'][i%3],style:['Abstract','Landscape','Contemporary'][i%3],year:2024+i%3,width:60+i*2,height:80,price:45000+i*12000,status:i===3?'Reserved':i===7?'Sold':'Available',location:['Gallery · Wall A','Storage · Rack A','Gallery · Wall B','External exhibition'][i%4],ownership:i%2?'Consignment':'Gallery-owned',condition:'Good',notes:'Fictional demonstration record',sample:true}));
  const h=new Headers({'Content-Type':'application/json','apikey':KEY});if(KEY.startsWith('eyJ'))h.set('Authorization','Bearer '+KEY);
  const r=await fetch(API+'/rest/v1/rpc/seraai_action',{method:'POST',headers:h,body:JSON.stringify({b})});
  if(!r.ok){const e=await r.json();return json({error:e.message||'Unable to save record'},400);}return json(await r.json());
 }
 if(media&&req.method==='GET'){
  const id=url.searchParams.get('id');if(!id||!/^[0-9a-f-]{36}$/i.test(id))return json({error:'Invalid image'},400);
  const rows=await(await api('/rest/v1/seraai_media?select=mime&id=eq.'+id)).json();if(!rows.length)return json({error:'Not found'},404);
  const f=await api('/storage/v1/object/'+BUCKET+'/'+id);return new Response(f.body,{headers:{'Content-Type':rows[0].mime,'Cache-Control':'private, max-age=300','X-Content-Type-Options':'nosniff'}});
 }
 if(media&&req.method==='POST'){
  const form=await req.formData();const file=form.get('file');const artworkId=Number(form.get('artworkId'));
  if(!(file instanceof File)||!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size<=0||file.size>20971520)return json({error:'Use JPG, PNG or WebP up to 20 MB'},400);
  const rows=await(await api(`/rest/v1/seraai_records?select=id&id=eq.${artworkId}&kind=eq.artwork`)).json();if(!rows.length)return json({error:'Artwork not found'},404);
  const bytes=await file.arrayBuffer();const s=new Uint8Array(bytes);if(!(file.type==='image/png'&&s[0]===137&&s[1]===80&&s[2]===78&&s[3]===71||file.type==='image/jpeg'&&s[0]===255&&s[1]===216&&s[2]===255||file.type==='image/webp'&&String.fromCharCode(...s.slice(0,4))==='RIFF'&&String.fromCharCode(...s.slice(8,12))==='WEBP'))return json({error:'Invalid image data'},400);
  const id=crypto.randomUUID();await api('/storage/v1/object/'+BUCKET+'/'+id,{method:'POST',headers:{'Content-Type':file.type},body:bytes});
  try{await api('/rest/v1/seraai_media',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,artwork_id:artworkId,name:file.name,mime:file.type,category:String(form.get('category')||'Front'),size:file.size,hash:await digest(bytes)})});}
  catch(e){await api('/storage/v1/object/'+BUCKET,{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({prefixes:[id]})});throw e;}
  return json({ok:true});
 }
 return json({error:'Not found'},404);
 }catch{return json({error:'Unable to reach inventory storage. Please retry.'},502);}
});
