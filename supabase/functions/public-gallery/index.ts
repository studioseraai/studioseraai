type Publication={artwork_id:number;description:string;featured:boolean};
type Photo={id:string;artwork_id:number;category:string};
type PublicArtwork={id:number;photos:{id:string;category:string}[];[key:string]:unknown};
// Separate authenticated service. Never changes the existing art-vault function.
const API=Deno.env.get('SUPABASE_URL')!;
const KEY=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')||'{}').default||Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const TOKEN_HASH='__TOKEN_HASH__';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const digest=async(s:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(v=>v.toString(16).padStart(2,'0')).join('');
async function api(path:string,init:RequestInit={}){const headers=new Headers(init.headers);headers.set('apikey',KEY);if(KEY.startsWith('eyJ'))headers.set('Authorization','Bearer '+KEY);const r=await fetch(API+path,{...init,headers});if(!r.ok)throw Error('Database operation failed');return r;}
const rows=async(path:string)=>await(await api('/rest/v1/'+path)).json();
const post=async(path:string,body:unknown,merge=false)=>api('/rest/v1/'+path,{method:'POST',headers:{'Content-Type':'application/json',...(merge?{Prefer:'resolution=merge-duplicates'}:{})},body:JSON.stringify(body)});
async function catalog(){
 const pubs=await rows('seraai_publications?published=eq.true&select=artwork_id,description,featured');
 const artworks=[];
 for(let i=0;i<pubs.length;i+=100){const ids=pubs.slice(i,i+100).map((p:Publication)=>p.artwork_id).join(',');if(!ids)continue;
 const records=await rows('seraai_records?kind=eq.artwork&id=in.('+ids+')&select=id,data');
 const photos=await rows('seraai_media?artwork_id=in.('+ids+')&select=id,artwork_id,category&order=created.asc&limit=10000');
 for(const r of records){const d=r.data;if(d.sample||d.archived)continue;const images=photos.filter((p:Photo)=>p.artwork_id===r.id).map((p:Photo)=>({id:p.id,category:p.category}));if(!images.length)continue;const pub=pubs.find((p:Publication)=>p.artwork_id===r.id);const a:PublicArtwork={id:r.id,description:pub.description,featured:pub.featured,photos:images};for(const k of ['title','artist','medium','style','status','width','height','dimensionUnit','year'])a[k]=String(d[k]??'');artworks.push(a);}
 }
 const events=await rows('seraai_events?published=eq.true&select=id,title,description,starts_at,venue,category&order=starts_at.asc');
 return {artworks,events};
}
Deno.serve(async(req:Request)=>{
 const token=(req.headers.get('authorization')||'').replace(/^Bearer /,'');
 const secret=Deno.env.get('SERAAI_BACKEND_TOKEN');
 if(!token||await digest(token)!==(secret?await digest(secret):TOKEN_HASH))return json({error:'Unauthorized'},401);
 const path=new URL(req.url).pathname.split('/public-gallery/')[1];
 try{
 if(path==='catalog'&&req.method==='GET')return json(await catalog());
 if(path?.startsWith('image/')&&req.method==='GET'){
 const id=path.slice(6);if(!/^[a-f0-9-]{36}$/i.test(id))return json({error:'Not found'},404);
 const media=await rows('seraai_media?id=eq.'+id+'&select=artwork_id');if(!media.length)return json({error:'Not found'},404);
 const aid=media[0].artwork_id;const [pubs,records]=await Promise.all([rows('seraai_publications?artwork_id=eq.'+aid+'&published=eq.true&select=artwork_id'),rows('seraai_records?id=eq.'+aid+'&kind=eq.artwork&select=data')]);if(!pubs.length||!records.length||records[0].data.sample||records[0].data.archived)return json({error:'Not found'},404);
 const image=await api('/storage/v1/object/seraai-artworks/'+id);return new Response(image.body,{headers:{'Content-Type':image.headers.get('Content-Type')||'image/jpeg','Cache-Control':'no-store'}});
 }
 if(path==='inquire'&&req.method==='POST'){
 const b=await req.json();if(b.website)return json({error:'Unable to submit this inquiry.'},400);
 if(typeof b.name!=='string'||b.name.trim().length<2||b.name.length>120||typeof b.email!=='string'||b.email.length>254||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)||typeof b.message!=='string'||b.message.trim().length<10||b.message.length>4000||typeof b.phone!=='string'||b.phone.length>60||b.consent!==true)return json({error:'Please check your name, email, message and consent.'},400);
 if(b.preferred_date&&(!/^\d{4}-\d{2}-\d{2}$/.test(b.preferred_date)||!Number.isFinite(Date.parse(b.preferred_date))||b.preferred_date<new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Karachi'})))return json({error:'Choose a valid future viewing date.'},400);
 if(!/^[a-f0-9]{64}$/.test(b.rateKey))return json({error:'Invalid request'},400);
 const allowed=await(await post('rpc/seraai_inquiry_rate',{k:b.rateKey})).json();if(!allowed)return json({error:'Too many inquiries. Please try again in an hour.'},429);
 const id=b.artwork_id?Number(b.artwork_id):null;if(id&&!(await catalog()).artworks.some((a:PublicArtwork)=>a.id===id))return json({error:'Artwork is no longer published.'},400);
 await post('seraai_inquiries',{name:b.name.trim(),email:b.email.trim(),phone:b.phone.trim(),message:b.message.trim(),preferred_date:b.preferred_date||null,artwork_id:id});return json({ok:true},201);
 }
 if(path==='admin'&&req.method==='GET')return json({publications:await rows('seraai_publications?select=*'),inquiries:await rows('seraai_inquiries?select=*&order=created.desc&limit=200'),events:await rows('seraai_events?select=*&order=starts_at.desc')});
 if(path==='admin'&&req.method==='POST'){
 const b=await req.json();
 if(b.action==='publication'){
 if(!Number.isSafeInteger(b.artwork_id)||typeof b.published!=='boolean'||typeof b.featured!=='boolean'||typeof b.description!=='string'||b.description.length>6000)return json({error:'Invalid publication'},400);
 const records=await rows('seraai_records?kind=eq.artwork&id=eq.'+b.artwork_id+'&select=data');if(!records.length)return json({error:'Artwork not found'},404);
 if(b.published&&(records[0].data.sample||records[0].data.archived||!(await rows('seraai_media?artwork_id=eq.'+b.artwork_id+'&select=id&limit=1')).length))return json({error:'Only real, active artworks with photographs may be published.'},400);
 await post('seraai_publications?on_conflict=artwork_id',{artwork_id:b.artwork_id,published:b.published,featured:b.featured,description:b.description,updated:new Date().toISOString()},true);return json({ok:true});
 }
 if(b.action==='event'){
 for(const k of ['title','description','venue','category','starts_at'])if(typeof b[k]!=='string'||!b[k].trim()||b[k].length>6000)return json({error:'Complete all event fields.'},400);
 if(!Number.isFinite(Date.parse(b.starts_at))||typeof b.published!=='boolean'||b.id&&!/^[a-f0-9-]{36}$/i.test(b.id))return json({error:'Invalid event'},400);
 await post('seraai_events?on_conflict=id',{id:b.id||crypto.randomUUID(),title:b.title,description:b.description,venue:b.venue,category:b.category,starts_at:b.starts_at,published:b.published},true);return json({ok:true});
 }
 return json({error:'Unknown action'},400);
 }
 return json({error:'Not found'},404);
 }catch{return json({error:'Gallery service is temporarily unavailable.'},503);}
});
