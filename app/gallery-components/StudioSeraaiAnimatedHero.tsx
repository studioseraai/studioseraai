'use client';

import {useEffect, useMemo, useRef, useState, type KeyboardEvent} from 'react';
import Link from 'next/link';
import type {Artwork} from '../../lib/gallery/types';
import type {WordPressHero} from '../../lib/gallery/wordpress';
import styles from './StudioSeraaiAnimatedHero.module.css';

function dimensions(art: Artwork) {
  let width=Number.parseFloat(art.width||'');
  let height=Number.parseFloat(art.height||'');
  let unit=(art.dimensionUnit||'cm').trim().toLowerCase();
  if(!(width>0&&height>0)){
    const match=(art.size||'').match(/(\d+(?:\.\d+)?)\s*(?:cm|mm|m|in|inch|inches)?\s*[x×]\s*(\d+(?:\.\d+)?)/i);
    if(match){width=Number(match[1]);height=Number(match[2]);unit=(art.size||'').toLowerCase().match(/(inches|inch|in|mm|cm|m)/)?.[1]||'cm';}
  }
  const scale=unit.startsWith('in')?2.54:unit==='mm'?0.1:unit==='m'?100:1;
  width*=scale;height*=scale;
  return {area:width>0&&height>0?width*height:0,longest:Math.max(width,height)};
}

export default function StudioSeraaiAnimatedHero({copy,artworks=[]}:{copy?:WordPressHero|null;artworks?:Artwork[]}) {
  const title=copy?.title||'Vision Meets Collection';
  const words=title.trim().split(/\s+/);
  const emphasized=words.length>1?words.pop()!:'Collection';
  const leading=words.length?words.join(' '):'Vision Meets';
  const description=copy?.description||'Exceptional art. Thoughtfully curated. Made to live beyond the gallery.';
  const slides=useMemo(()=>{
    const ranked=artworks.filter(art=>art.photos?.[0]?.id).map(art=>({art,...dimensions(art)})).sort((a,b)=>b.area-a.area||b.longest-a.longest);
    const large=ranked.filter(item=>item.longest>=100);
    return (large.length?large:ranked).slice(0,5).map(item=>item.art);
  },[artworks]);
  const [active,setActive]=useState(0);
  const [paused,setPaused]=useState(false);
  const rail=useRef<HTMLDivElement>(null);
  const goTo=(next:number,smooth=true)=>{
    if(!slides.length)return;
    const index=(next+slides.length)%slides.length;
    setActive(index);
    const container=rail.current;
    const target=container?.children[index] as HTMLElement|undefined;
    if(container&&target)container.scrollTo({left:target.offsetLeft-container.offsetLeft,behavior:smooth?'smooth':'auto'});
  };
  const onKeyDown=(event:KeyboardEvent<HTMLDivElement>)=>{
    if(event.key==='ArrowRight'){event.preventDefault();goTo(active+1);}
    if(event.key==='ArrowLeft'){event.preventDefault();goTo(active-1);}
  };

  useEffect(()=>{
    if(slides.length<2||paused||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const timer=window.setInterval(()=>goTo((active+1)%slides.length),6500);
    return ()=>window.clearInterval(timer);
  },[active,slides.length,paused]);

  return <section className={styles.hero} aria-label="Studio Seraai — A Gallery Where Walls Breathe Art.">
    <img className={styles.room} src="/gallery/hero/gallery-wall-slider.webp" width={1774} height={887} alt="" fetchPriority="high" />
    <div className={styles.decor} aria-hidden="true">
      <img className={styles.sideTable} src="/gallery/hero/seraai-v3-single-cabinet-final.webp" width={1536} height={1024} alt="" />
      <img className={styles.mainTable} src="/gallery/hero/seraai-v3-new-main-table.webp" width={1448} height={1086} alt="" />
      <img className={styles.cube} src="/gallery/hero/v2-cube.webp" width={1312} height={1199} alt="" />
    </div>
    <div className={styles.copy}>
      <p className={styles.eyebrow}>A GALLERY WHERE WALLS BREATHE ART.</p>
      <h1 className={styles.title}>{leading}<br/><em>{emphasized}</em></h1>
      <p className={styles.description}>{description.includes('Made to live beyond the gallery.')?<>{description.slice(0,description.indexOf('Made to live beyond the gallery.')).trim()}<br/>{description.slice(description.indexOf('Made to live beyond the gallery.')).trim()}</>:description}</p>
      <Link className={styles.cta} href="#collections">EXPLORE COLLECTIONS <span aria-hidden="true">↗</span></Link>
    </div>
    {slides.length>0&&<div className={styles.slider} role="region" aria-label="Large artworks from the collection" onKeyDown={onKeyDown} onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)} onFocus={()=>setPaused(true)} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node|null))setPaused(false);}}>
      <div className={styles.rail} ref={rail} tabIndex={0} aria-label="Browse artworks horizontally" onScroll={event=>{const node=event.currentTarget;const cards=Array.from(node.children) as HTMLElement[];let best=0;let distance=Infinity;cards.forEach((card,index)=>{const next=Math.abs(card.offsetLeft-node.offsetLeft-node.scrollLeft);if(next<distance){distance=next;best=index;}});setActive(best);}}>
        {slides.map((art,index)=><article className={styles.slide} key={art.id} aria-label={art.title}>
          <Link className={styles.artFrame} href={'/artworks/'+art.id} tabIndex={active===index?0:-1} aria-label={'View '+art.title}>
            <img src={'/api/gallery/image/'+art.photos[0].id} alt={art.title} fetchPriority={index<3?'high':'auto'} />
          </Link>
          <div className={styles.artCaption}><span>{art.title}</span><span>{art.artist||'Studio Seraai'}</span></div>
        </article>)}
      </div>
      {slides.length>1&&<div className={styles.controls}>
        <button type="button" aria-label="Previous artworks" onClick={()=>goTo(active-1)}>‹</button>
        <div className={styles.dots}>{slides.map((art,index)=><button key={art.id} type="button" aria-label={'Show artwork '+(index+1)} aria-current={index===active?'true':undefined} onClick={()=>goTo(index)} />)}</div>
        <button type="button" aria-label="Next artworks" onClick={()=>goTo(active+1)}>›</button>
      </div>}
    </div>}
  </section>;
}
