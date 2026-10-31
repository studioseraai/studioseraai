import Shell from '../gallery-components/shell';
import {ConnectionNotice} from '../gallery-components/views';
import {getGallery} from '../../lib/gallery/server';
import ArtistExperience from './ArtistExperience';
export const metadata={title:'Artists — Studio Seraai'};
export const dynamic='force-dynamic';
export default async function Page(){
 const data=await getGallery();
 const grouped=new Map<string,typeof data.artworks>();
 for(const work of data.artworks){const name=work.artist?.trim();if(!name)continue;grouped.set(name,[...(grouped.get(name)||[]),work]);}
 const artists=[...grouped].map(([name,works])=>({name,works})).sort((a,b)=>a.name.localeCompare(b.name));
 return <Shell><ConnectionNotice data={data}/><ArtistExperience artists={artists}/></Shell>;
}
