'use client';
import {useRef,useState} from 'react';
import Link from 'next/link';
import type {Artwork} from '../../lib/gallery/types';
import styles from './CuratedCollectionSlider.module.css';

export default function CuratedCollectionSlider({artworks}:{artworks:Artwork[]}) {
  const works=[...artworks].filter(a=>a.photos?.[0]?.id).sort((a,b)=>Number(b.featured)-Number(a.featured)).slice(0,12);
  const rail=useRef<HTMLDivElement>(null);
  const pointer=useRef<{x:number;scroll:number;moved:boolean}|null>(null);
  const suppressClick=useRef(false);
  const [index,setIndex]=useState(0);
  const count=works.length;
  function moveTo(next:number) {
    const el=rail.current;if(!el||!count)return;
    const target=Math.max(0,Math.min(count-1,next));
    const card=el.children[target] as HTMLElement|undefined;
    if(!card)return;
    el.scrollTo({left:card.offsetLeft-(el.clientWidth-card.offsetWidth)/2,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    setIndex(target);
  }
  function updateActive(){
    const el=rail.current;if(!el)return;
    const center=el.scrollLeft+el.clientWidth/2;
    let closest=0,dist=Infinity;
    Array.from(el.children).forEach((c,i)=>{const item=c as HTMLElement;const d=Math.abs(item.offsetLeft+item.offsetWidth/2-center);if(d<dist){dist=d;closest=i;}});
    setIndex(closest);
  }
  return <section className={styles.section} id="collections" aria-labelledby="curated-heading">
    <div className={styles.sheet} aria-hidden="true"><svg viewBox="0 0 1440 400" preserveAspectRatio="none"><path d="M0 364 C160 414 340 297 545 216 S1082 20 1440 77 L1440 0 L0 0 Z"/></svg></div>
    <div className={styles.intro}>
      <div className={styles.number}>02 <span/></div>
      <p className={styles.kicker}>FEATURED ARTWORKS</p>
      <h2 id="curated-heading">A Curated<br/>Collection.</h2>
      <p className={styles.description}>Explore a thoughtfully curated selection of contemporary artworks that reflect our vision of art, space and modern living.</p>
      <Link className={styles.cta} href="/collections">EXPLORE COLLECTION <span aria-hidden="true">→</span></Link>
    </div>
    <div className={styles.display}>
      {count>0?<div className={styles.rail} ref={rail} role="region" aria-label="Curated artwork slider" tabIndex={0} onScroll={updateActive}
        onKeyDown={e=>{if(e.target!==e.currentTarget)return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();moveTo(index+(e.key==='ArrowRight'?1:-1));}}}
        onPointerDown={e=>{if(e.pointerType==='touch')return;pointer.current={x:e.clientX,scroll:e.currentTarget.scrollLeft,moved:false};}}
        onPointerMove={e=>{if(!pointer.current||!(e.buttons&1))return;const dx=e.clientX-pointer.current.x;if(Math.abs(dx)>6){pointer.current.moved=true;suppressClick.current=true;e.currentTarget.scrollLeft=pointer.current.scroll-dx;}}}
        onPointerUp={()=>{pointer.current=null;window.setTimeout(()=>{suppressClick.current=false;},100);}}
        onPointerCancel={()=>{pointer.current=null;}}
        onClickCapture={e=>{if(suppressClick.current){e.preventDefault();e.stopPropagation();}}}>
        {works.map((art,i)=>{
          const width=parseFloat(art.width),height=parseFloat(art.height);
          const aspect=Number.isFinite(width)&&width>0&&Number.isFinite(height)&&height>0?Math.max(.62,Math.min(1.55,width/height)):1;
          return <div key={art.id} className={styles.item} data-active={i===index} data-side={i<index?'left':'right'}>
            <Link href={'/artworks/'+art.id} className={styles.artLink} aria-label={art.title+' by '+(art.artist||'Studio Seraai')}>
              <div className={styles.artwork} style={{aspectRatio:String(aspect)}}>
                <img src={'/api/gallery/image/'+art.photos[0].id} alt={art.title} loading={i<3?'eager':'lazy'} decoding="async" draggable={false}/>
                <span className={styles.frame} aria-hidden="true"/>
              </div>
              <span className={styles.caption}>{i===index?<><strong>{art.title}</strong><small>{art.artist||'STUDIO SERAAI'}</small></>:null}</span>
            </Link>
          </div>;
        })}
      </div>:<div className={styles.empty}><p>Our selection is being curated.</p><Link href="/contact">INQUIRE WITH THE GALLERY →</Link></div>}
    </div>
    <div className={styles.controls}>
      <span className={styles.drag}>↕ <span>DRAG TO EXPLORE</span><i/></span>
      <div className={styles.navigation}>
        <button type="button" onClick={()=>moveTo(index-1)} disabled={index===0||!count} aria-label="Previous artwork">←</button>
        <span aria-live="polite">{String(count?index+1:0).padStart(2,'0')} / {String(count).padStart(2,'0')}</span>
        <button type="button" onClick={()=>moveTo(index+1)} disabled={index===count-1||!count} aria-label="Next artwork">→</button>
      </div>
    </div>
  </section>;
}
