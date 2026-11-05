import {workspacePage} from '../lib/workspace-ui';
import Shell from './gallery-components/shell';
import {Home} from './gallery-components/views';
import {getGallery} from '../lib/gallery/server';
import {getWordPressHero} from '../lib/gallery/wordpress';
export const dynamic='force-dynamic';
export default async function Page({searchParams}:{searchParams:Promise<{view?:string}>}){const q=await searchParams;if(q.view){const {default:Studio}=await import('./studio');return <Studio initialPage={workspacePage(q.view)}/>;}const [data,heroCopy]=await Promise.all([getGallery(),getWordPressHero()]);return <Shell><Home data={data} heroCopy={heroCopy}/></Shell>;}
