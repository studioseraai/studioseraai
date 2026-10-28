import {workspacePage} from '../lib/workspace-ui';
import Shell from './gallery-components/shell';
import {Home} from './gallery-components/views';
import {getGallery} from '../lib/gallery/server';
export const dynamic='force-dynamic';
export default async function Page({searchParams}:{searchParams:Promise<{view?:string}>}){const q=await searchParams;if(q.view){const {default:Studio}=await import('./studio');return <Studio initialPage={workspacePage(q.view)}/>;}return <Shell><Home data={await getGallery()}/></Shell>;}
