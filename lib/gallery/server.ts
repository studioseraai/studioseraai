import 'server-only';
import type {GalleryData} from './types';
export async function galleryBackend(path:string,init:RequestInit={}){
 const origin=process.env.SERAAI_BACKEND_URL,token=process.env.SERAAI_BACKEND_TOKEN;
 if(!origin||!token)throw Error('Gallery connection is unavailable');
 const base=new URL(origin);if(base.protocol!=='https:')throw Error('Invalid gallery backend');
 const url=new URL(base.origin+'/functions/v1/public-gallery/'+path);
 return fetch(url,{...init,headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`,...init.headers},cache:'no-store',signal:AbortSignal.timeout(15000)});
}
export async function getGallery():Promise<GalleryData>{try{const r=await galleryBackend('catalog');if(!r.ok)throw Error();return {...await r.json() as GalleryData,now:Date.now()};}catch{return {artworks:[],events:[],unavailable:true,now:Date.now()};}}
