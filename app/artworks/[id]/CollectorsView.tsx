'use client';
import {useRef,useState} from 'react';
import Link from 'next/link';
import {ArrowLeft,ArrowRight} from 'lucide-react';
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
export default function CollectorsView({art,related}:{art:Artwork;related:Artwork[]}){
 const [finish,setFinish]=useState<Finish>('wood');
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
    <div className={s.actions}>
      <Link href={'/contact?artwork='+art.id} className={s.inquire}>INQUIRE ABOUT THIS ARTWORK <span aria-hidden="true">→</span></Link>
      <div className={s.exclusiveExperience}>
       <p className={s.kicker}>EXCLUSIVE GALLERY EXPERIENCE</p>
       <h2>See Art in Your Space.</h2>
       <p>Discover how this artwork could look in your home with a personalized, in-gallery Art Visualizer experience.</p>
       <Link className={s.visualize} href={'/contact?artwork='+art.id+'&viewing=1'}>EXPERIENCE OUR ART VISUALIZER · BOOK A PRIVATE VIEWING <span aria-hidden="true">↗</span></Link>
      </div>
     </div>
   </div>
  </section>
  {related.length>0&&<section className={s.related} aria-labelledby="related-title">
   <div className={s.relatedIntro}><div><p className={s.kicker}>CONTINUE EXPLORING</p><h2 id="related-title">Some Other Artworks That May Incite You!</h2></div><div className={s.railControls}><button onClick={()=>move(-1)} aria-label="Previous artworks"><ArrowLeft size={18}/></button><button onClick={()=>move(1)} aria-label="Next artworks"><ArrowRight size={18}/></button></div></div>
   <div className={s.rail} ref={rail}>{related.map(item=><Link className={s.relatedItem} href={'/artworks/'+item.id} key={item.id}><div className={s.relatedArt}><img src={source(item)} alt={item.title} loading="lazy"/></div><div className={s.relatedCaption}><strong>{item.title}</strong><span>{item.artist||'Studio Seraai'} · {item.medium||'Artwork'}</span></div></Link>)}</div>
  </section>}
 </div>;
}
