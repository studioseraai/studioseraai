'use client';
import {useState} from 'react';
import Link from 'next/link';
import type {Artwork} from '../../lib/gallery/types';
import styles from './CuratedCollectionSlider.module.css';

/** A fixed central gallery frame: switch the artwork, not the frame. */
export default function CuratedCollectionSlider({artworks}:{artworks:Artwork[]}){
 const works=[...artworks].filter(a=>a.photos?.[0]?.id).sort((a,b)=>Number(b.featured)-Number(a.featured)).slice(0,12);
 const count=works.length;
 const [index,setIndex]=useState(Math.min(2,Math.max(0,count-1)));
 const [frameColor,setFrameColor]=useState<'wood'|'black'|'white'>('wood');
 const active=works[index];
 const choose=(next:number)=>setIndex((next+count)%count);
 const image=(a:Artwork)=>'/api/gallery/image/'+encodeURIComponent(a.photos[0].id);
 return <section className={styles.section} id="collections" aria-labelledby="collection-title">
  <div className={styles.architecture} aria-hidden="true"/>
  <div className={styles.intro}>
   <p className={styles.kicker}>OUR COLLECTION</p>
   <h2 id="collection-title">Beyond the Ordinary.<br/><em>Into Art.</em></h2>
   <p className={styles.description}>A carefully curated collection of timeless works, from emerging voices to established masters.</p>
  </div>
  {count>0 && active ? <>
   <div className={styles.stage} aria-label="Featured artworks">
    <button className={styles.arrow} type="button" onClick={()=>choose(index-1)} disabled={count<2} aria-label="Previous artwork">←</button>
    <div className={styles.previewSide}>
     {[2,1].map(offset=>{const a=works[(index-offset+count)%count];return <button key={'left-'+offset} type="button" className={styles.preview} disabled={count<2} onClick={()=>choose(index-offset)} aria-label={'Select '+a.title}><img src={image(a)} alt={a.title} loading="lazy"/></button>})}
    </div>
    <div className={styles.center}>
     <Link className={styles.fixedFrame} href={'/artworks/'+active.id} data-frame={frameColor} aria-label={'View '+active.title}>
      <span className={styles.frameSurface}>
       <img key={active.id} className={styles.centerImage} src={image(active)} alt={active.title} loading="eager"/>
      </span>
     </Link>
     <div className={styles.caption} aria-live="polite"><strong>{active.title}</strong><small>{active.artist||'STUDIO SERAAI'}</small></div>
    </div>
    <div className={styles.previewSide}>
     {[1,2].map(offset=>{const a=works[(index+offset)%count];return <button key={'right-'+offset} type="button" className={styles.preview} disabled={count<2} onClick={()=>choose(index+offset)} aria-label={'Select '+a.title}><img src={image(a)} alt={a.title} loading="lazy"/></button>})}
    </div>
    <button className={styles.arrow} type="button" onClick={()=>choose(index+1)} disabled={count<2} aria-label="Next artwork">→</button>
   </div>
   <div className={styles.footer}>
    <div className={styles.framePicker} role="group" aria-label="Center painting frame finish"><span>FRAME</span>{(['wood','black','white'] as const).map(color=><button key={color} className={styles.frameChoice} type="button" data-color={color} aria-pressed={frameColor===color} onClick={()=>setFrameColor(color)}><i aria-hidden="true"/>{color.toUpperCase()}</button>)}</div>
    <p className={styles.systemNote}>✧ <i>Adaptive Frame System</i> <span>Automatically fits artwork inside a single frame.</span></p>
    <span className={styles.counter} aria-live="polite">{String(index+1).padStart(2,'0')} <span className={styles.progress}><i style={{width:`${((index+1)/count)*100}%`}}/></span> {String(count).padStart(2,'0')}</span>
    <Link className={styles.cta} href="/collections">VIEW COLLECTION <span aria-hidden="true">→</span></Link>
   </div>
  </>:<div className={styles.empty}>The collection is being curated. <Link href="/contact">Inquire with the gallery →</Link></div>}
 </section>;
}
