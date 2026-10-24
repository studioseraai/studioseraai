export const workspacePages = ['Overview', 'Artwork Inventory', 'Artists', 'Art Visualizer', 'Daily Movements', 'Reports'] as const;
export function workspacePage(value: string | null | undefined) { return workspacePages.find(page => page === value) || 'Overview'; }
export function workspaceUrl(value:string){const page=workspacePage(value);return page==='Art Visualizer'?'/visualizer':page==='Overview'?'/':'/?view='+encodeURIComponent(page);}
export function errorMessage(error: unknown) { return error instanceof Error ? error.message : 'Something went wrong. Please try again.'; }
export type GalleryRecord = {
    id: number;
    kind: string;
    title: string;
    artist?: string;
    status: string;
    location: string;
    archived?: boolean;
    sample?: boolean;
    price?: number;
    width?: number | string;
    height?: number | string;
    medium?: string;
    created: string;
    effective: string;
    artworkId?: number;
    type?: string;
    from?: string;
    to?: string;
    receiver?: string;
    city?: string;
    year?: string | number;
    style?: string;
    ownership?: string;
    condition?: string;
    notes?: string;
};
export type GalleryPhoto = {
    id: MediaId;
    artwork_id: number;
    category: string;
};
export type RecordModal = {
    type: 'artwork' | 'artist' | 'movement';
    record?: GalleryRecord;
    movement?: string;
    artworkId?: number;
};
export async function readInventory(signal?:AbortSignal){const response=await fetch('/api/data',{signal});const data=await response.json() as {records?:GalleryRecord[];photos?:GalleryPhoto[];error?:string};if(!response.ok)throw Error(data.error||'Could not load inventory. Please retry.');if(!Array.isArray(data.records)||!Array.isArray(data.photos))throw Error('Inventory response was incomplete. Please retry.');return {records:data.records,photos:data.photos};}
export type MediaId=string|number;
export function moneyLabel(value:unknown){if(value===null||value===undefined||String(value).trim()===''||!Number.isFinite(Number(value)))return 'Not recorded';return 'PKR '+Number(value).toLocaleString('en-PK');}
export function recordIssues(art:GalleryRecord,hasPhoto:boolean){const issues:string[]=[];if(!art.title?.trim())issues.push('title');if(!art.artist?.trim())issues.push('artist');if(!art.medium?.trim())issues.push('medium');if(!(Number(art.width)>0&&Number(art.height)>0))issues.push('dimensions');if(moneyLabel(art.price)==='Not recorded')issues.push('asking price');if(!art.location?.trim())issues.push('location');if(!art.status?.trim())issues.push('availability');if(!hasPhoto)issues.push('photograph');return issues;}
export function formatGalleryDate(value:string|undefined,withTime=false){if(!value||Number.isNaN(new Date(value).getTime()))return 'Date not recorded';return new Date(value).toLocaleString('en-GB',{timeZone:'Asia/Karachi',day:'2-digit',month:'short',year:'numeric',...(withTime?{hour:'2-digit',minute:'2-digit'}:{})});}
export function mediaId(value:string){return value;}
export function csvCell(value:unknown){let text=String(value??'');if(/^\s*[=+@-]|^[\t\r]/.test(text))text="'"+text;return '"'+text.replaceAll('"','""')+'"';}
