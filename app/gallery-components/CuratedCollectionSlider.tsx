'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import type {Artwork} from '../../lib/gallery/types';
import styles from './CuratedCollectionSlider.module.css';

export default function CuratedCollectionSlider({artworks}:{artworks:Artwork[]}){
 const works=[...artworks].filter(a=>a.photos?.[0]?.id).sort((a,b)=>Number(b.featured)-Number(a.featured)).slice(0,12);
 const count=works.length;
 const initial=Math.min(2,Math.max(0,count-1));
 const [index,setIndex]=useState(initial);
 const rail=useRef<HTMLDivElement>(null);
 const drag=useRef<{x:number;left:number;didDrag:boolean}|null>(null);
 const cancelClick=useRef(false);
 function moveTo(next:number,behavior:ScrollBehavior='smooth'){
  const el=rail.current;if(!el||!count)return;
  const n=Math.max(0,Math.min(count-1,next));
  const card=el.children[n] as HTMLElement|undefined;if(!card)return;
  el.scrollTo({left:card.offsetLeft-(el.clientWidth-card.offsetWidth)/2,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':behavior});
  setIndex(n);
 }
 useEffect(()=>{const id=requestAnimationFrame(()=>moveTo(initial,'instant'));return ()=>cancelAnimationFrame(id)},[initial]);
 function syncIndex(){
  const el=rail.current;if(!el)return;
  const midpoint=el.scrollLeft+el.clientWidth/2;
  let best=0,dist=Infinity;
  Array.from(el.children).forEach((child,i)=>{const card=child as HTMLElement;const d=Math.abs(card.offsetLeft+card.offsetWidth/2-midpoint);if(d<dist){dist=d;best=i}});
  setIndex(best);
 }
 return <section className={styles.section} id="collections" aria-labelledby="collection-title">
  <div className={styles.architecture} aria-hidden="true"/>
  <header className={styles.intro}>
   <p className={styles.kicker}>OUR COLLECTION</p>
   <h2 id="collection-title">Beyond the Ordinary.<br/><em>Into Art.</em></h2>
   <p className={styles.description}>A carefully curated collection of timeless works, from emerging voices to established masters.</p>
  </header>
  {count>0?<div className={styles.stage}>
   <button className={styles.leftArrow} type="button" onClick={()=>moveTo(index-1)} disabled={index===0} aria-label="Previous artwork">←</button>
   <div className={styles.rail} ref={rail} role="region" aria-label="Artworks carousel" tabIndex={0} onScroll={syncIndex}
    onKeyDown={e=>{if(e.target!==e.currentTarget)return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();moveTo(index+(e.key==='ArrowRight'?1:-1))}}}
    onPointerDown={e=>{if(e.pointerType==='touch')return;drag.current={x:e.clientX,left:e.currentTarget.scrollLeft,didDrag:false}}}
    onPointerMove={e=>{if(!drag.current||!(e.buttons&1))return;const dx=e.clientX-drag.current.x;if(Math.abs(dx)>6){drag.current.didDrag=true;cancelClick.current=true;e.currentTarget.scrollLeft=drag.current.left-dx}}}
    onPointerUp={()=>{drag.current=null;setTimeout(()=>cancelClick.current=false,100)}}
    onPointerCancel={()=>{drag.current=null}}
    onClickCapture={e=>{if(cancelClick.current){e.preventDefault();e.stopPropagation()}}}>
    {works.map((art,i)=>{
      const w=Number.parseFloat(art.width),h=Number.parseFloat(art.height);
      const ratio=w>0&&h>0?Math.max(.68,Math.min(1.38,w/h)):.82;
      return <div className={styles.item} key={art.id} data-active={i===index} data-side={i<index?'left':'right'} data-distance={Math.min(3,Math.abs(i-index))}>
       <Link className={styles.artLink} href={'/artworks/'+art.id} aria-label={'View '+art.title}>
        <div className={styles.artwork} style={{width:`min(100%, calc(var(--art-height) * ${ratio}))`}}>
         <img src={'/api/gallery/image/'+encodeURIComponent(art.photos[0].id)} alt={art.title} loading={Math.abs(i-initial)<3?'eager':'lazy'} draggable={false}/>
         <span className={styles.frame} aria-hidden="true"/>
        </div>
        <span className={styles.caption}>{i===index?<><strong>{art.title}</strong><small>{art.artist||'STUDIO SERAAI'}</small></>:null}</span>
       </Link>
      </div>;
    })}
   </div>
   <button className={styles.rightArrow} type="button" onClick={()=>moveTo(index+1)} disabled={index===count-1} aria-label="Next artwork">→</button>
  </div>:<div className={styles.empty}>The collection is being curated. <Link href="/contact">Inquire with the gallery →</Link></div>}
  <div className={styles.footer}>
   <span className={styles.counter} aria-live="polite">{String(count?index+1:0).padStart(2,'0')} <span className={styles.progress}><i style={{width:count?`${((index+1)/count)*100}%`:'0%'}}/></span> {String(count).padStart(2,'0')}</span>
   <Link className={styles.cta} href="/collections">VIEW COLLECTION <span aria-hidden="true">→</span></Link>
  </div>
 </section>
}
