'use client';
import { useEffect, useRef, useState } from 'react';
import {MAX_WALL_PAINTINGS,createWallLayer,updateWallLayer,reorderWallLayer,hitTestLayers,arrangeWallRow,wallImagesReady,type WallLayer} from '../lib/visualizer-layers';
import './visualizer.css';
import {mediaId,type MediaId} from '../lib/workspace-ui';
import { roomTemplates, wallSwatches } from '../lib/visualizer-rooms';
import { renderScene, type Placement } from '../lib/visualizer-render';
type Artwork = {
    id: number;
    title: string;
    artist?: string;
    width?: number | string;
    height?: number | string;
    status?: string;
};
type Photo = {
    id: MediaId;
    artwork_id: number;
    category?: string;
};
const initial: Placement = { x: 800, y: 340, width: 330, rotation: 0 };
const colors = { Black: '#181818', Gold: '#b99a57', White: '#f5f1e8', 'Natural wood': '#9e7048' };
const identifier = (id: number) => `SS-${String(id).padStart(4, '0')}`;
function imageFrom(url: string): Promise<HTMLImageElement> { return new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = () => reject(new Error('Image could not be decoded. Please use a valid JPG, PNG or WebP.')); image.src = url; }); }
async function localImage(file: File) { if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 20 * 1024 * 1024)
    throw new Error('Choose JPG, PNG or WebP up to 20 MB.'); const url = URL.createObjectURL(file); try {
    const image = await imageFrom(url);
    if (image.width * image.height > 40000000)
        throw new Error('Image is too large. Please use a photograph under 40 megapixels.');
    return image;
}
finally {
    URL.revokeObjectURL(url);
} }
export default function ArtVisualizer({ artworks, photos, initialArtworkId }: {
    artworks: Artwork[];
    photos: Photo[];
    initialArtworkId?: number;
}) {
    const roomRequest = useRef(0);
    const canvas = useRef<HTMLCanvasElement>(null), drag = useRef<{
        x: number;
        y: number;
        start: Placement;
        layerId:string;
    } | null>(null);
    const initialPhoto=photos.find(photo=>photo.artwork_id===initialArtworkId);
    const [layers,setLayers]=useState<WallLayer[]>(()=>initialArtworkId&&initialPhoto?[createWallLayer('initial-'+initialArtworkId,initialArtworkId,initialPhoto.id,roomTemplates[0].placement)]:[]);
    const [activeLayerId,setActiveLayerId]=useState<string|null>(initialArtworkId&&initialPhoto?'initial-'+initialArtworkId:null);
    const pendingPhotos=useRef(new Map<string,{photoId:MediaId;controller:AbortController}>());
    const [query,setQuery]=useState(''),[room,setRoom]=useState<HTMLImageElement|null>(null),[clean,setClean]=useState<HTMLImageElement|null>(null),[overlay,setOverlay]=useState<HTMLImageElement|null>(null),[roomName,setRoomName]=useState('Living room'),[category,setCategory]=useState('Living Room'),[type,setType]=useState('empty'),[error,setError]=useState(''),[preparing,setPreparing]=useState(false),[region,setRegion]=useState<{x:number;y:number;w:number;h:number}|null>(null),[drawing,setDrawing]=useState<{x:number;y:number}|null>(null);
    const [wallMask, setWallMask] = useState<HTMLImageElement | null>(null);
    const [templateId, setTemplateId] = useState('living'), [roomLoading, setRoomLoading] = useState(true), [wallColor, setWallColor] = useState(''), [wallOpacity, setWallOpacity] = useState(.85), [wallPolygon, setWallPolygon] = useState<number[][]>(roomTemplates[0].wall), [wallSelecting, setWallSelecting] = useState(false), [wallStart, setWallStart] = useState<{
        x: number;
        y: number;
    } | null>(null);
    const activeLayer=layers.find(layer=>layer.id===activeLayerId),selected=activeLayer?.artworkId??null,photoId=activeLayer?.photoId??null,painting=activeLayer?.image??null;
    const placement=activeLayer?.placement??initial,frame=activeLayer?.frame??true,frameHex=activeLayer?.frameColor??colors.Gold,frameWidth=activeLayer?.frameWidth??8,shadow=activeLayer?.shadow??true;
    const color=Object.entries(colors).find(([,hex])=>hex===frameHex)?.[0]??'Custom';
    const art=artworks.find(a=>a.id===selected),artPhotos=photos.filter(p=>p.artwork_id===selected),ready=type==='empty'||!!clean;
    const loaded=layers.filter(layer=>!!layer.image).length,loading=layers.some(layer=>!layer.image&&!layer.loadError),hasFailed=layers.some(layer=>!!layer.loadError);
    function patchActive(patch:Partial<WallLayer>){if(activeLayerId)setLayers(current=>updateWallLayer(current,activeLayerId,patch));}
    function setPlacement(next:Placement){patchActive({placement:next});}
    function setFrame(next:boolean){patchActive({frame:next});}
    function setFrameHex(next:string){patchActive({frameColor:next});}
    function setFrameWidth(next:number){patchActive({frameWidth:next});}
    function setShadow(next:boolean){patchActive({shadow:next});}
    const W = 1600, H = 1000;
    const roomDefault=roomTemplates.find(template=>template.id===templateId)?.placement||initial;
    const [exportNotice,setExportNotice]=useState(''),[artLimit,setArtLimit]=useState(36);
    useEffect(() => { let active = true; const request = ++roomRequest.current; Promise.all([imageFrom(roomTemplates[0].image), imageFrom(roomTemplates[0].mask)]).then(([image, mask]) => { if (active && request === roomRequest.current) {
        setRoom(image);
        setWallMask(mask);
        setRoomLoading(false);
    } }).catch(() => { if (active && request === roomRequest.current) {
        setError('Room image could not load. Try another room or upload your own.');
        setRoomLoading(false);
    } }); return () => { active = false; }; }, []);
    async function chooseRoom(id: string) { const template = roomTemplates.find(t => t.id === id); if (!template)
        return; const request = ++roomRequest.current; setRoomLoading(true); setError(''); try {
        const [image, mask] = await Promise.all([imageFrom(template.image), imageFrom(template.mask)]);
        if (request !== roomRequest.current)
            return;
        setRoom(image);
        setWallMask(mask);
        setTemplateId(id);
        setRoomName(template.name);
        setCategory(template.name);
        setClean(null);
        setOverlay(null);
        setType('empty');
        setRegion(null);
        setPreparing(false);
        setDrawing(null);
        setWallSelecting(false);
        setWallStart(null);
        setWallPolygon(template.wall);
        // Keep every painting and its placement when switching rooms.
    }
    catch {
        if (request === roomRequest.current)
            setError('This room could not load. Try again or upload a room.');
    }
    finally {
        if (request === roomRequest.current)
            setRoomLoading(false);
    } }
    function wallPoint(p: {
        x: number;
        y: number;
    }) { if (!room)
        return p; const scale = Math.min(W / room.width, H / room.height), w = room.width * scale, h = room.height * scale; return { x: Math.max(0, Math.min(1, (p.x - (W - w) / 2) / w)), y: Math.max(0, Math.min(1, (p.y - (H - h) / 2) / h)) }; }
    function addArtwork(artworkId:number){const existing=layers.find(layer=>layer.artworkId===artworkId);if(existing){setActiveLayerId(existing.id);return;}const photo=photos.find(photo=>photo.artwork_id===artworkId);if(!photo){setError('This artwork needs a photograph. Add one in Artwork Inventory before placing it on the wall.');return;}if(layers.length>=MAX_WALL_PAINTINGS){setError('A wall can contain up to '+MAX_WALL_PAINTINGS+' paintings. Remove one from the composition to add another.');return;}const offset=[0,350,-350][layers.length%3],row=Math.floor(layers.length/3);const layer=createWallLayer(crypto.randomUUID(),artworkId,photo.id,{...roomDefault,x:Math.max(180,Math.min(1420,roomDefault.x+offset)),y:Math.min(700,roomDefault.y+row*100),width:layers.length?Math.min(roomDefault.width,280):roomDefault.width});setLayers(current=>[...current,layer]);setActiveLayerId(layer.id);setError('');setExportNotice('');}
    function removeArtwork(id:string){const remaining=layers.filter(layer=>layer.id!==id);pendingPhotos.current.get(id)?.controller.abort();setLayers(remaining);if(activeLayerId===id)setActiveLayerId(remaining.at(-1)?.id??null);setError('');setExportNotice('');}
    function selectPhoto(id:MediaId|null){if(id!==null&&id!==photoId){patchActive({photoId:id,image:null,loadError:undefined});setError('');setExportNotice('');}}
    useEffect(()=>{const pending=pendingPhotos.current;
      for(const [id,request] of pending){const layer=layers.find(layer=>layer.id===id);if(!layer||layer.photoId!==request.photoId){request.controller.abort();pending.delete(id);}}
      for(const layer of layers){if(layer.image||layer.loadError||pending.has(layer.id))continue;const controller=new AbortController();pending.set(layer.id,{photoId:layer.photoId,controller});
        void (async()=>{let url:string|undefined;try{const response=await fetch('/api/media?id='+encodeURIComponent(layer.photoId),{signal:controller.signal});if(!response.ok)throw Error('Unable to load this artwork photograph.');url=URL.createObjectURL(await response.blob());const image=await imageFrom(url);if(image.width*image.height>40_000_000)throw Error('Choose an artwork photograph under 40 megapixels.');if(!controller.signal.aborted)setLayers(current=>current.map(item=>item.id===layer.id&&item.photoId===layer.photoId?{...item,image,loadError:undefined}:item));}catch(error){if(!controller.signal.aborted)setLayers(current=>current.map(item=>item.id===layer.id&&item.photoId===layer.photoId?{...item,image:null,loadError:error instanceof Error?error.message:'Photograph could not load.'}:item));}finally{if(url)URL.revokeObjectURL(url);if(pending.get(layer.id)?.controller===controller)pending.delete(layer.id);}})();
      }
    },[layers]);
    useEffect(()=>{const pending=pendingPhotos.current;return()=>{for(const request of pending.values())request.controller.abort();pending.clear();};},[]);
    function arrangeRow(){const bounds=region&&type==='replacement'?{x:region.x+region.w/2,y:region.y+region.h/2,width:region.w,height:region.h}:{x:roomDefault.x,y:roomDefault.y,width:1180,height:400};const arranged=arrangeWallRow(layers,bounds);if(arranged===layers){setError('This placement area is too small for the row. Enlarge the area or reduce frame widths.');return;}setLayers(arranged);setError('');setExportNotice('');}
    function fitRegion(r: {
        x: number;
        y: number;
        w: number;
        h: number;
    }, image: HTMLImageElement | null = painting) { if (!image)
        return; setPlacement({ x: r.x + r.w / 2, y: r.y + r.h / 2, width: Math.max(10, Math.min(r.w, r.h * image.width / image.height) - (frame ? frameWidth * 2 : 0)), rotation: 0 }); }
    function render(ctx: CanvasRenderingContext2D, editing: boolean) { renderScene(ctx, { layers,activeLayerId,room, clean, overlay, painting, type, category, placement, frame, frameColor: frameHex, frameWidth, wallMask, wallColor, wallOpacity, wallPolygon, wallSelecting, shadow, region, preparing }, editing); }
    useEffect(() => { const ctx = canvas.current?.getContext('2d'); if (ctx)
        render(ctx, true); });
    function point(e: React.PointerEvent<HTMLCanvasElement>) { const r = e.currentTarget.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; }
    function down(e: React.PointerEvent<HTMLCanvasElement>) { const p = point(e); if (roomLoading)
        return; if (wallSelecting) {
        setWallMask(null);
        const w = wallPoint(p);
        setWallStart(w);
        setWallPolygon([[w.x, w.y], [w.x, w.y], [w.x, w.y], [w.x, w.y]]);
        e.currentTarget.setPointerCapture(e.pointerId);
        return;
    } if (preparing) {
        setDrawing(p);
        setRegion({ x: p.x, y: p.y, w: 0, h: 0 });
        e.currentTarget.setPointerCapture(e.pointerId);
        return;
    } if (!ready)return;const hit=hitTestLayers(layers,p);setActiveLayerId(hit);if(!hit)return;const layer=layers.find(layer=>layer.id===hit)!;drag.current={...p,start:layer.placement,layerId:hit};e.currentTarget.setPointerCapture(e.pointerId); }
    function move(e: React.PointerEvent<HTMLCanvasElement>) { const p = point(e); if (wallStart) {
        const w = wallPoint(p);
        setWallPolygon([[wallStart.x, wallStart.y], [w.x, wallStart.y], [w.x, w.y], [wallStart.x, w.y]]);
        return;
    } if (drawing) {
        setRegion({ x: Math.min(p.x, drawing.x), y: Math.min(p.y, drawing.y), w: Math.abs(p.x - drawing.x), h: Math.abs(p.y - drawing.y) });
        return;
    } if (drag.current) {
        const d = drag.current;
        setLayers(current=>updateWallLayer(current,d.layerId,{placement:{...d.start,x:Math.max(0,Math.min(W,d.start.x+p.x-d.x)),y:Math.max(0,Math.min(H,d.start.y+p.y-d.y))}}));
    } }
    function up() { drag.current = null; if (wallStart) {
        setWallStart(null);
        setWallSelecting(false);
        return;
    } if (drawing) {
        setDrawing(null);
        if (region && region.w > 20 && region.h > 20) {
            fitRegion(region);
            setPreparing(false);
        }
    } }
    async function upload(file: File | undefined, kind: 'room' | 'clean' | 'overlay') { if (!file)
        return; try {
        setError('');
        const image = await localImage(file);
        if (kind === 'room') {
            ++roomRequest.current;
            setRoomLoading(false);
            setTemplateId('custom');
            setWallMask(null);
            setWallPolygon([]);
            setWallColor('');
            setWallSelecting(false);
            setWallStart(null);
            setRoom(image);
            setPreparing(false);
            setDrawing(null);
            setRoomName(file.name);
            setClean(null);
            setOverlay(null);
            setRegion(null);
            // Custom rooms keep the current wall composition.
        }
        else {
            if (!room || Math.abs(image.width / image.height - room.width / room.height) > .005)
                throw new Error('Clean background and foreground overlay must have the same aspect ratio as the original room.');
            if (kind === 'clean')
                setClean(image);
            else
                setOverlay(image);
        }
    }
    catch (e) {
        setError(e instanceof Error ? e.message : 'Upload failed');
    } }
    // Room photographs retain their original proportions within the composition.
    const roomRatio = room ? room.width / room.height : 1.6;
    const canExport=wallImagesReady(layers)&&ready&&!roomLoading&&!!room;
    function download() { if (!canExport)
        return; try {
        const output = document.createElement('canvas');
        output.width = W;
        output.height = H;
        const ctx = output.getContext('2d');
        if (!ctx)
            throw Error('Canvas is unavailable');
        render(ctx, false);
        output.toBlob(blob => { if (!blob) {
            setError('PNG export failed.');
            return;
        } const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `seraai-wall-${layers.length}-paintings.png`; a.click();setExportNotice('PNG prepared. Check your browser downloads.'); setTimeout(() => URL.revokeObjectURL(url), 1000); }, 'image/png');
    }
    catch (e) {
        setError(e instanceof Error ? e.message : 'Export failed');
    } }
    const filtered = artworks.filter(a => [a.title, a.artist, identifier(a.id)].join(' ').toLowerCase().includes(query.toLowerCase()));
    return <section className="visualizer"><div className="vz-intro"><strong>Art Visualizer</strong><span>Private room preview · Approximate scale · Add multiple paintings · Select each to adjust</span></div>{error && <div role="alert" className="error">{error}<button onClick={() => setError('')}>Dismiss</button></div>}{exportNotice&&<div className="notice" role="status">{exportNotice}<button className="textbutton" onClick={()=>setExportNotice('')}>Dismiss</button></div>}<div className="vz-layout"><aside className="vz-panel"><h2>Add paintings</h2><p className="vz-note">Click an artwork to add it to the wall. Already added? Click it to select.</p><input aria-label="Search artwork" placeholder="Title, artist or inventory ID" value={query} onChange={e => {setQuery(e.target.value);setArtLimit(36);}}/><div className="vz-artlist">{filtered.slice(0,artLimit).map(a => { const p = photos.find(p => p.artwork_id === a.id); return <button key={a.id} className={selected === a.id ? 'vz-art chosen' : 'vz-art'} onClick={()=>addArtwork(a.id)}>{p ? <img src={'/api/media?id=' + p.id} alt="" loading="lazy"/> : <span className="vz-noimage">No photo</span>}<span><strong>{a.title}</strong><small>{a.artist || 'Artist not recorded'}</small><small>{identifier(a.id)} · {a.width || '—'} × {a.height || '—'} cm</small><small>{a.status || 'Availability not recorded'}</small><small>{layers.some(layer=>layer.artworkId===a.id)?'On this wall · select':p?'＋ Add to wall':'Photograph required'}</small></span></button>; })}{filtered.length>artLimit&&<button className="secondary" onClick={()=>setArtLimit(n=>n+36)}>Show more artworks ({filtered.length-artLimit} remaining)</button>}{!filtered.length && <p>No matching artwork.</p>}</div></aside><div className="vz-center"><div className="vz-roomlibrary"><div className="vz-librarytitle"><span>CHOOSE A SETTING</span><small>Photorealistic generated mockups</small></div><div className="vz-rooms">{roomTemplates.map(t => <button key={t.id} aria-pressed={templateId === t.id} className={templateId === t.id ? 'vz-room active' : 'vz-room'} disabled={roomLoading} onClick={() => void chooseRoom(t.id)}><img src={t.image} alt={t.name + ' interior mockup'} loading="lazy"/><strong>{t.name}</strong><small>{t.description}</small></button>)}</div></div><div className="vz-roomhead"><strong>{roomName}</strong><span>{roomLoading ? 'Loading room…' : wallSelecting ? 'Drag a rectangle over the wall area to recolor' : loading?'Loading artwork photographs…':hasFailed?'A photograph needs attention. Retry or remove it below.':!layers.length?'Add paintings from the inventory':!ready?'Replacement requires a clean background':activeLayer?'Drag the selected painting · Controls apply only to this painting':'Click a painting on the wall to select it'}</span></div><div className="vz-stage"><canvas ref={canvas} width={W} height={H} aria-label="Room with multiple paintings. Select a painting in the On this wall list and use its position controls as an alternative to dragging." onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={() => { drag.current = null; setDrawing(null); setWallStart(null); }}/></div><div className="vz-wall-list"><div className="vz-wall-heading"><strong>On this wall <small>{layers.length}/{MAX_WALL_PAINTINGS}</small></strong><button className="secondary" disabled={layers.length<2||loaded!==layers.length||!ready||roomLoading} onClick={arrangeRow}>Arrange row</button></div>{!layers.length?<p className="vz-note">Build your wall by adding paintings from the inventory.</p>:<div className="vz-layer-grid">{layers.map((layer,index)=>{const title=artworks.find(art=>art.id===layer.artworkId)?.title||identifier(layer.artworkId);return <div key={layer.id} className={activeLayerId===layer.id?'vz-layer selected':'vz-layer'}><button className="vz-layer-select" aria-pressed={activeLayerId===layer.id} onClick={()=>setActiveLayerId(layer.id)}><span className="vz-layer-number">{index+1}</span><span><strong>{title}</strong><small>{layer.loadError?'Photograph failed':layer.image?identifier(layer.artworkId):'Loading photograph…'}</small></span></button>{layer.loadError&&<><span className="vz-layer-error" role="alert">{layer.loadError}</span><button className="textbutton" onClick={()=>setLayers(current=>updateWallLayer(current,layer.id,{loadError:undefined}))}>Retry photo</button></>}<button className="vz-remove" aria-label={'Remove '+title+' from wall'} onClick={()=>removeArtwork(layer.id)}>Remove</button></div>;})}</div>}</div><p className="vz-note">Room and wall colors are included in your export. Client room photos stay in this browser session. Original artwork files are never changed. {room && `Room ratio: ${roomRatio.toFixed(2)}.`}</p></div><aside className="vz-panel vz-controls"><h2>Room & placement</h2><p className="vz-note">Choose a room above, or upload a client’s room below.</p><label className="vz-upload">Upload your room<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => { void upload(e.target.files?.[0], 'room'); e.target.value = ''; }}/></label><div className="vz-wallcontrols"><h3>Wall color</h3><div className="vz-swatches">{wallSwatches.map(w => <button key={w.name} title={w.name} aria-label={'Wall color ' + w.name} aria-pressed={wallColor === w.color} style={{ background: w.color }} onClick={() => setWallColor(w.color)}/>)}</div><label>Custom wall color<input aria-label="Custom wall color" type="color" value={wallColor || '#f2ecdf'} onChange={e => setWallColor(e.target.value)}/></label><label>Paint strength · {Math.round(wallOpacity * 100)}%<input type="range" min="0" max="1" step=".05" value={wallOpacity} onChange={e => setWallOpacity(Number(e.target.value))}/></label><div className="vz-actions"><button className="secondary" disabled={!room || roomLoading} onClick={() => { setWallSelecting(!wallSelecting); setPreparing(false); setDrawing(null); }}>{wallSelecting ? 'Cancel selection' : 'Define wall area'}</button><button className="secondary" onClick={() => setWallColor('')}>Original wall</button></div><small>{wallPolygon.length ? 'Color is applied only inside the wall area. Use Define wall area to change it.' : 'Define a wall area before applying color to your uploaded room.'} Paint is a visual approximation.</small></div><label>Mockup type<select value={type} onChange={e => { setType(e.target.value); setRegion(null); }}><option value="empty">Empty room</option><option value="replacement">Replace existing painting</option></select></label>{type === 'replacement' && <div className="vz-preparation"><p>{clean ? 'Clean background ready. Define the original painting region to fit artwork.' : 'Preparation required: upload a version with the old painting completely removed. No automatic removal.'}</p><label>Prepared clean background<input type="file" accept="image/jpeg,image/png,image/webp" disabled={!room} onChange={e => { void upload(e.target.files?.[0], 'clean'); e.target.value = ''; }}/></label><button className="secondary" disabled={!room} onClick={() => setPreparing(!preparing)}>{preparing ? 'Cancel area selection' : 'Define placement area'}</button>{preparing && <small>Drag a rectangle on the room.</small>}{region && <button className="secondary" disabled={!painting} onClick={() => fitRegion(region)}>Fit to placement area</button>}<label>Optional foreground PNG<input type="file" accept="image/png" disabled={!room} onChange={e => { void upload(e.target.files?.[0], 'overlay'); e.target.value = ''; }}/></label>{overlay && <button className="secondary" onClick={() => setOverlay(null)}>Remove overlay</button>}</div>}{artPhotos.length > 1 && <label>Artwork photograph<select value={photoId ?? ''} onChange={e => selectPhoto(mediaId(e.target.value))}>{artPhotos.map(p => <option key={p.id} value={p.id}>{p.category || 'Photo'} · {p.id}</option>)}</select></label>}<fieldset disabled={!painting || !ready || roomLoading || !room}><legend>Selected painting</legend><p className="vz-selected-title">{art?.title||'Select a painting on the wall'}</p><label>Size · {Math.round(placement.width / W * 100)}% of room width<input type="range" min="30" max="1500" value={placement.width} onChange={e => setPlacement({ ...placement, width: Number(e.target.value) })}/></label><label>Rotation · {placement.rotation}°<input type="range" min="-180" max="180" value={placement.rotation} onChange={e => setPlacement({ ...placement, rotation: Number(e.target.value) })}/></label><label>Horizontal position<input type="range" min="0" max={W} value={placement.x} onChange={e => setPlacement({ ...placement, x: Number(e.target.value) })}/></label><label>Vertical position<input type="range" min="0" max={H} value={placement.y} onChange={e => setPlacement({ ...placement, y: Number(e.target.value) })}/></label><div className="vz-actions"><button className="secondary" onClick={() => setPlacement({ ...placement, x: roomDefault.x, y: roomDefault.y })}>Center</button><button className="secondary" onClick={() => setPlacement(roomDefault)}>Reset</button></div><label className="vz-check"><input type="checkbox" checked={frame} onChange={e => setFrame(e.target.checked)}/>Frame</label><label>Frame color<select value={color} onChange={e => { const name = e.target.value as keyof typeof colors; setFrameHex(colors[name]); }}>{color==='Custom'&&<option disabled>Custom</option>}{Object.keys(colors).map(c => <option key={c}>{c}</option>)}</select></label><label>Custom frame color<input aria-label="Custom frame color" type="color" value={frameHex} onChange={e => setFrameHex(e.target.value)}/></label><label>Frame width · {frameWidth}px<input type="range" min="2" max="30" value={frameWidth} onChange={e => setFrameWidth(Number(e.target.value))}/></label><label className="vz-check"><input type="checkbox" checked={shadow} onChange={e => setShadow(e.target.checked)}/>Wall shadow</label><div className="vz-actions"><button className="secondary" disabled={!activeLayer||layers.findIndex(layer=>layer.id===activeLayerId)===layers.length-1} onClick={()=>activeLayerId&&setLayers(current=>reorderWallLayer(current,activeLayerId,1))}>Bring forward</button><button className="secondary" disabled={!activeLayer||layers.findIndex(layer=>layer.id===activeLayerId)===0} onClick={()=>activeLayerId&&setLayers(current=>reorderWallLayer(current,activeLayerId,-1))}>Send backward</button></div></fieldset><button className="primary" disabled={!canExport} onClick={download}>Download wall · PNG</button><p className="vz-note">Downloads exclude editing guides. Removing a painting here never deletes its inventory record. Compositions stay in this tab; saving sessions and perspective adjustment are not included.</p></aside></div></section>;
}
