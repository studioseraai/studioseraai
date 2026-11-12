import 'server-only';
import type {GalleryData} from './types';

// Cache only successful public catalog GET responses at the fetch layer.
// Staff writes, inquiries, and artwork image responses remain uncached here.
export async function galleryBackend(path:string,init:RequestInit={},service:'public-gallery'|'catalog-attributes-v4'='public-gallery'){
 const origin=process.env.SERAAI_BACKEND_URL,token=process.env.SERAAI_BACKEND_TOKEN;
 if(!origin||!token)throw Error('Gallery connection is unavailable');
 const base=new URL(origin);if(base.protocol!=='https:')throw Error('Invalid gallery backend');
 const url=new URL(base.origin+'/functions/v1/'+service+'/'+path);
 const catalog=path==='catalog'&&(!init.method||init.method==='GET');
 return fetch(url,{...init,headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`,...init.headers},...(catalog?{next:{revalidate:10}}:{cache:'no-store'}),signal:AbortSignal.timeout(catalog?9000:15000)});
}
export async function getGallery():Promise<GalleryData>{
 try{
  // Catalog and optional attributes no longer wait on each other.
  const [original,attributes]=await Promise.all([
   galleryBackend('catalog'),
   galleryBackend('catalog',{},'catalog-attributes-v4').catch(()=>null)
  ]);
  if(!original.ok)throw Error('Public catalog failed');
  const data=await original.json() as GalleryData;
  const base=(data.artworks||[]).map(a=>({...a,theme:a.theme||'',surface:a.surface||'',size:a.size||''}));
  if(attributes?.ok){
   try{
    const payload=await attributes.json() as {attributes?:Array<{id:number;theme:string;style:string;surface:string;size:string;medium:string}>};
    if(Array.isArray(payload.attributes)){
     const byId=new Map(payload.attributes.map(a=>[a.id,a]));
     data.artworks=base.map(a=>{
      const extra=byId.get(a.id);
      return extra?{...a,theme:extra.theme||'',surface:extra.surface||'',size:extra.size||'',style:extra.style||a.style,medium:extra.medium||a.medium}:a;
     });
    }else data.artworks=base;
   }catch{data.artworks=base;}
  }else data.artworks=base;
  return {...data,now:Date.now()};
 }catch{return {artworks:[],events:[],unavailable:true,now:Date.now()};}
}
