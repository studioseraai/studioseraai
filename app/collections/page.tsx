import Shell from '../gallery-components/shell';
import {ConnectionNotice} from '../gallery-components/views';
import LivingCollage from '../gallery-components/LivingCollage';
import {getGallery} from '../../lib/gallery/server';
export const metadata={title:'Artworks — Studio Seraai',description:'Explore a curated collection of art in the Studio Seraai living collage.'};
export const dynamic='force-dynamic';
export default async function Page({searchParams}:{searchParams:Promise<{q?:string}>}){
 const [data,q]=await Promise.all([getGallery(),searchParams]);
 return <Shell><ConnectionNotice data={data}/><LivingCollage artworks={data.artworks} initialQuery={q.q}/></Shell>;
}
