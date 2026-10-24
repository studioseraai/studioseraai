export const workspacePages = ['Overview', 'Artwork Inventory', 'Artists', 'Photo Vault', 'Art Visualizer', 'Daily Movements', 'Locations', 'Reports', 'Settings'] as const;
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
    id: number;
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
