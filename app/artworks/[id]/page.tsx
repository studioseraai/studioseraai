import {notFound} from 'next/navigation';
import Shell from '../../gallery-components/shell';
import CollectorsView from './CollectorsView';
import {getGallery} from '../../../lib/gallery/server';

export const dynamic='force-dynamic';

export async function generateMetadata({params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 const data=await getGallery();
 const art=data.artworks.find(a=>String(a.id)===id);
 return {title:(art?.title||'Artwork')+' — Studio Seraai',description:art?'Explore '+art.title+' by '+(art.artist||'Studio Seraai')+', including medium, surface, style, theme and dimensions.':'Discover exceptional art at Studio Seraai.'};
}
export default async function Page({params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 const data=await getGallery();
 if(data.unavailable)throw Error('Gallery unavailable');
 const art=data.artworks.find(a=>String(a.id)===id);
 if(!art||!art.photos?.length)notFound();
 const related=data.artworks.filter(a=>a.id!==art.id&&a.photos?.length).sort((a,b)=>Number(b.artist===art.artist)-Number(a.artist===art.artist)).slice(0,12);
 return <Shell><CollectorsView art={art} related={related}/></Shell>;
}
