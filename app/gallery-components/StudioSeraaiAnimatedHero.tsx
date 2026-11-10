'use client';

import {useEffect, useMemo, useState, type CSSProperties, type KeyboardEvent} from 'react';
import Link from 'next/link';
import type {Artwork} from '../../lib/gallery/types';
import type {WordPressHero} from '../../lib/gallery/wordpress';
import styles from './StudioSeraaiAnimatedHero.module.css';

function dimensions(art: Artwork) {
  let width = Number.parseFloat(art.width || '');
  let height = Number.parseFloat(art.height || '');
  let unit = (art.dimensionUnit || 'cm').trim().toLowerCase();
  if (!(width > 0 && height > 0)) {
    const match = (art.size || '').match(/(\d+(?:\.\d+)?)\s*(?:cm|mm|m|in|inch|inches)?\s*[x×]\s*(\d+(?:\.\d+)?)/i);
    if (match) {
      width = Number(match[1]);
      height = Number(match[2]);
      unit = (art.size || '').toLowerCase().match(/(inches|inch|in|mm|cm|m)/)?.[1] || 'cm';
    }
  }
  const scale = unit.startsWith('in') ? 2.54 : unit === 'mm' ? 0.1 : unit === 'm' ? 100 : 1;
  width *= scale;
  height *= scale;
  return {width, height, area: width > 0 && height > 0 ? width * height : 0, longest: Math.max(width, height)};
}

export default function StudioSeraaiAnimatedHero({copy, artworks = []}:{copy?:WordPressHero|null;artworks?:Artwork[]}) {
  const title=copy?.title||'Vision Meets Collection';
  const words=title.trim().split(/\s+/);
  const emphasized=words.length>1?words.pop()!:'Collection';
  const leading=words.length?words.join(' '):'Vision Meets';
  const description=copy?.description||'Exceptional art. Thoughtfully curated. Made to live beyond the gallery.';
  const slides=useMemo(()=>{
    const ranked=artworks
      .filter(art=>art.photos?.[0]?.id)
      .map(art=>({art,...dimensions(art)}))
      .sort((a,b)=>b.area-a.area || b.longest-a.longest);
    const measured=ranked.filter(item=>item.longest>=100);
    return (measured.length?measured:ranked).slice(0,5).map(item=>item.art);
  },[artworks]);
  const [active,setActive]=useState(0);
  const [paused,setPaused]=useState(false);
  const current=slides[active];
  const currentDimensions=current?dimensions(current):null;
  const frameStyle:CSSProperties=currentDimensions&&currentDimensions.width>0&&currentDimensions.height>0
    ? {aspectRatio:String(currentDimensions.width/currentDimensions.height)}
    : {aspectRatio:'1.25'};
  const advance=(step:number)=>setActive(index=>(index+step+slides.length)%slides.length);
  const onKeyDown=(event:KeyboardEvent<HTMLElement>)=>{
    if(event.key==='ArrowRight'){event.preventDefault();advance(1);}
    if(event.key==='ArrowLeft'){event.preventDefault();advance(-1);}
  };

  useEffect(()=>{
    if(slides.length<2||paused||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const timer=window.setInterval(()=>setActive(index=>(index+1)%slides.length),6500);
    return ()=>window.clearInterval(timer);
  },[slides.length,paused]);

  return (
    <section className={styles.hero} aria-label="Studio Seraai — A Gallery Where Walls Breathe Art.">
      <img className={styles.room} src="/gallery/hero/gallery-wall-slider.webp" width={1774} height={887} alt="" fetchPriority="high" />
      <div className={styles.copy}>
        <p className={styles.eyebrow}>A GALLERY WHERE WALLS BREATHE ART.</p>
        <h1 className={styles.title}>{leading}<br /><em>{emphasized}</em></h1>
        <p className={styles.description}>{description.includes('Made to live beyond the gallery.') ? <>{description.slice(0,description.indexOf('Made to live beyond the gallery.')).trim()}<br />{description.slice(description.indexOf('Made to live beyond the gallery.')).trim()}</> : description}</p>
        <Link className={styles.cta} href="#collections">EXPLORE COLLECTIONS <span aria-hidden="true">↗</span></Link>
      </div>

      {current&&<div className={styles.slider} role="region" aria-label="Large artworks from the collection" tabIndex={0} onKeyDown={onKeyDown} onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)} onFocus={()=>setPaused(true)} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node|null))setPaused(false);}}>
        <div className={styles.artFrame} style={frameStyle} key={current.id}>
          <img src={'/api/gallery/image/'+current.photos[0].id} alt={current.title} fetchPriority="high" />
        </div>
        <div className={styles.artCaption}>
          <span>{current.title}</span>{current.artist&&<span>{current.artist}</span>}
        </div>
        {slides.length>1&&<div className={styles.controls}>
          <button type="button" aria-label="Previous artwork" onClick={()=>advance(-1)}>‹</button>
          <div className={styles.dots} aria-label={'Artwork '+(active+1)+' of '+slides.length}>
            {slides.map((art,index)=><button key={art.id} type="button" aria-label={'Show artwork '+(index+1)} aria-current={index===active?'true':undefined} onClick={()=>setActive(index)} />)}
          </div>
          <button type="button" aria-label="Next artwork" onClick={()=>advance(1)}>›</button>
        </div>}
      </div>}
    </section>
  );
}
