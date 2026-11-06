'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {ArrowLeft,ArrowRight,ImagePlus,Maximize2,Move,RotateCcw,X} from 'lucide-react';
import type {Artwork} from '../../../lib/gallery/types';
import s from './CollectorsView.module.css';

type Finish='wood'|'black'|'white'|'silver'|'gold';
const finishes:Finish[]=['wood','black','white','silver','gold'];
const source=(art:Artwork)=>'/api/gallery/image/'+encodeURIComponent(art.photos[0].id);
function ArtworkFrame({art,finish,preview=false}:{art:Artwork;finish:Finish;preview?:boolean}){
 const width=Number(art.width),height=Number(art.height);
 const [imageRatio,setImageRatio]=useState(0);
 const ratio=imageRatio||(width>0&&height>0?width/height:1);
 return <div className={preview?s.previewFrame:s.artFrame} data-finish={finish} style={{aspectRatio:String(ratio),width:preview?'100%':`min(100%, ${Math.min(600,Math.max(180,500*ratio))}px)`}}>
  <div className={s.mat}><img src={source(art)} alt={preview?'':art.title} loading={preview?'eager':'eager'} onLoad={e=>{const image=e.currentTarget;if(image.naturalWidth&&image.naturalHeight)setImageRatio(image.naturalWidth/image.naturalHeight);}}/></div>
 </div>;
}
function WallPreview({art,finish,onClose}:{art:Artwork;finish:Finish;onClose:()=>void}){
 const [wall,setWall]=useState<string>('/rooms/living.webp');
 const [uploaded,setUploaded]=useState(false);
 const [scale,setScale]=useState(34),[x,setX]=useState(50),[y,setY]=useState(45);
 const input=useRef<HTMLInputElement>(null);
 useEffect(()=>()=>{if(uploaded)URL.revokeObjectURL(wall)},[wall,uploaded]);
 useEffect(()=>{
  const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape')onClose();};
  window.addEventListener('keydown',onKey);return ()=>window.removeEventListener('keydown',onKey);
 },[onClose]);
 const selectWall=(file?:File)=>{
  if(!file)return;
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>15_000_000){window.alert('Choose a JPG, PNG or WebP under 15 MB.');return;}
  const url=URL.createObjectURL(file);setWall(url);setUploaded(true);
 };
 return <div className={s.modalBackdrop} role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}>
  <section className={s.modal} role="dialog" aria-modal="true" aria-label="Preview artwork on your wall">
   <div className={s.modalHeader}><div><p className={s.kicker}>ART PLACEMENT PREVIEW</p><h2>Visualize on Your Wall</h2></div><button className={s.iconButton} onClick={onClose} aria-label="Close wall preview"><X/></button></div>
   <p className={s.modalNote}>A simple visual guide, not a measurement-accurate installation preview. Your wall photograph stays in this browser.</p>
   <div className={s.roomStage} style={{backgroundImage:`url("${wall}")`}}>
    <div className={s.wallArtwork} style={{left:x+'%',top:y+'%',width:scale+'%'}}><ArtworkFrame art={art} finish={finish} preview/></div>
   </div>
   <div className={s.modalTools}>
    <label className={s.upload}><ImagePlus size={16}/> Upload your wall photo<input ref={input} type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>selectWall(e.target.files?.[0])}/></label>
    <label><Maximize2 size={15}/> Size <input type="range" min={12} max={70} value={scale} onChange={e=>setScale(Number(e.target.value))}/></label>
    <label><Move size={15}/> Left / Right <input type="range" min={10} max={90} value={x} onChange={e=>setX(Number(e.target.value))}/></label>
    <label>Up / Down <input type="range" min={10} max={85} value={y} onChange={e=>setY(Number(e.target.value))}/></label>
    <button type="button" className={s.reset} onClick={()=>{setScale(34);setX(50);setY(45);}}><RotateCcw size={15}/> Reset</button>
   </div>
   <p className={s.modalNote}>For exact dimensions or a professional mockup, <Link href={'/contact?artwork='+art.id}>contact Studio Seraai</Link>.</p>
  </section>
 </div>;
}
export default function CollectorsView({art,related}:{art:Artwork;related:Artwork[]}){
 const [finish,setFinish]=useState<Finish>('wood');
 const [visualizing,setVisualizing]=useState(false);
 const rail=useRef<HTMLDivElement>(null);
 const dimensions=Number(art.width)>0&&Number(art.height)>0?`${art.width} × ${art.height} ${art.dimensionUnit||'cm'}`:art.size;
 const attributes=[['Medium',art.medium],['Surface',art.surface],['Theme',art.theme],['Style',art.style],['Dimensions',dimensions]].filter(([,value])=>Boolean(value));
 const move=(direction:number)=>{const list=rail.current;if(!list)return;const first=list.querySelector('a');const distance=first?(first.getBoundingClientRect().width+24):300;list.scrollBy({left:direction*distance,behavior:'smooth'});};
 return <div className={s.page}>
  <section className={s.hero} aria-label={'Artwork: '+art.title}>
   <div className={s.galleryWall}>
    <div className={s.artworkPlacement}><ArtworkFrame art={art} finish={finish}/></div>
    <span className={s.wallLabel}>STUDIO SERAAI · COLLECTOR'S VIEW</span>
   </div>
   <div className={s.info}>
    <Link href="/collections" className={s.back}>← BACK TO COLLECTION</Link>
    <h1>{art.title}</h1>
    {art.artist&&<Link className={s.artist} href={'/collections?artist='+encodeURIComponent(art.artist)}>{art.artist} <span aria-hidden="true">↗</span></Link>}
    <dl className={s.attributes}>{attributes.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    {art.description&&<p className={s.description}>{art.description}</p>}
    <div className={s.finishSection}><p className={s.kicker}>FRAME FINISH</p><div className={s.finishes} role="group" aria-label="Choose frame finish">
     {finishes.map(v=><button type="button" className={s.finishOption} key={v} aria-pressed={finish===v} onClick={()=>setFinish(v)}><span className={s.finishSwatch} data-finish={v}><i/></span><span>{v==='wood'?'Wood':v[0].toUpperCase()+v.slice(1)}</span></button>)}
    </div><p className={s.finishDisclaimer}>Frame finishes are illustrative previews.</p></div>
    <div className={s.actions}><Link href={'/contact?artwork='+art.id} className={s.inquire}>INQUIRE ABOUT THIS ARTWORK <span aria-hidden="true">→</span></Link><button className={s.visualize} type="button" onClick={()=>setVisualizing(true)}><Maximize2 size={15}/> VISUALIZE ON YOUR WALL</button></div>
   </div>
  </section>
  {related.length>0&&<section className={s.related} aria-labelledby="related-title">
   <div className={s.relatedIntro}><div><p className={s.kicker}>CONTINUE EXPLORING</p><h2 id="related-title">Another Way of Seeing</h2></div><div className={s.railControls}><button onClick={()=>move(-1)} aria-label="Previous artworks"><ArrowLeft size={18}/></button><button onClick={()=>move(1)} aria-label="Next artworks"><ArrowRight size={18}/></button></div></div>
   <div className={s.rail} ref={rail}>{related.map(item=><Link className={s.relatedItem} href={'/artworks/'+item.id} key={item.id}><div className={s.relatedArt}><img src={source(item)} alt={item.title} loading="lazy"/></div><div className={s.relatedCaption}><strong>{item.title}</strong><span>{item.artist||'Studio Seraai'} · {item.medium||'Artwork'}</span></div></Link>)}</div>
  </section>}
  {visualizing&&<WallPreview art={art} finish={finish} onClose={()=>setVisualizing(false)}/>}
 </div>;
}
