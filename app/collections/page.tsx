import Shell from '../gallery-components/shell';
import {Intro,ConnectionNotice} from '../gallery-components/views';
import {Catalog} from '../gallery-components/interactive';
import {getGallery} from '../../lib/gallery/server';
export const metadata={title:'Collections — Studio Seraai'};export const dynamic='force-dynamic';
export default async function Page({searchParams}:{searchParams:Promise<{q?:string}>}){const data=await getGallery();const q=await searchParams;return <Shell><Intro label="OUR COLLECTION" title="Beyond the Ordinary. Into Art." description="A curated collection of timeless works, from emerging voices to iconic masters." image/><ConnectionNotice data={data}/><Catalog artworks={data.artworks} initialQuery={q.q}/></Shell>;}
