import 'server-only';
import type {GalleryData} from './types';
import {unstable_cache} from 'next/cache';
export async function galleryBackend(path:string,init:RequestInit={},service:'public-gallery'|'catalog-attributes-v4'='public-gallery'){
 const origin=process.env.SERAAI_BACKEND_URL,token=process.env.SERAAI_BACKEND_TOKEN;
 if(!origin||!token)throw Error('Gallery connection is unavailable');
 const base=new URL(origin);if(base.protocol!=='https:')throw Error('Invalid gallery backend');
 const url=new URL(base.origin+'/functions/v1/'+service+'/'+path);
 return fetch(url,{...init,headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`,...init.headers},cache:'no-store',signal:AbortSignal.timeout(15000)});
}
async function loadGallery():Promise<GalleryData>{
 try{
  const original=await galleryBackend('catalog');
  if(!original.ok)throw Error('Public catalog failed');
  const data=await original.json() as GalleryData;
  const base=(data.artworks||[]).map(a=>({...a,theme:a.theme||'',surface:a.surface||'',size:a.size||''}));
  try{
   const response=await galleryBackend('catalog',{},'catalog-attributes-v4');
   if(response.ok){
    const payload=await response.json() as {attributes?:Array<{id:number;theme:string;style:string;surface:string;size:string;medium:string}>};
    if(Array.isArray(payload.attributes)){
     const byId=new Map(payload.attributes.map(a=>[a.id,a]));
     data.artworks=base.map(a=>{
      const extra=byId.get(a.id);
      return extra?{...a,theme:extra.theme||'',surface:extra.surface||'',size:extra.size||'',style:extra.style||a.style,medium:extra.medium||a.medium}:a;
     });
    }else data.artworks=base;
   }else data.artworks=base;
  }catch{data.artworks=base;}
  return {...data,now:Date.now()};
 }catch{return {artworks:[],events:[],unavailable:true,now:Date.now()};}
}

// Reuse public gallery reads briefly; private admin and inquiry requests stay uncached.
const cachedGallery=unstable_cache(loadGallery,['studio-seraai-public-gallery-v1'],{revalidate:60});
export async function getGallery():Promise<GalleryData>{return cachedGallery();}
