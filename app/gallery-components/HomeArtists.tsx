'use client';
import {useState} from 'react';
import Link from 'next/link';
import type {Artwork} from '../../lib/gallery/types';
import s from './HomeArtists.module.css';

export default function HomeArtists({artworks}:{artworks:Artwork[]}){
 const names=[...new Set(artworks.map(a=>a.artist?.trim()).filter((v):v is string=>Boolean(v)))].slice(0,12);
 const [index,setIndex]=useState(0);
 const total=names.length;
 const name=names[index];
 const works=artworks.filter(a=>a.artist?.trim()===name && a.photos?.[0]?.id);
 const featured=works[0];
 const change=(step:number)=>setIndex(i=>total?(i+step+total)%total:0);
 const image=(art:Artwork)=>'/api/gallery/image/'+encodeURIComponent(art.photos[0].id);
 return <section className={s.section} aria-label="Meet our artists" aria-labelledby="home-artist-heading">
  <div className={s.canvas}>
   <div className={s.left}>
    <div className={s.stoneCircle} aria-hidden="true"/><div className={s.stoneBlock} aria-hidden="true"/><div className={s.bronzeOutline} aria-hidden="true"/>
    <div className={s.archFrame} key={name||'empty'}>
     {featured?<img className={s.heroArt} src={image(featured)} alt={'Featured artwork by '+name+': '+featured.title} loading="lazy"/>:<div className={s.placeholder}>STUDIO SERAAI</div>}
     <span className={s.artCaption}>FEATURED ARTWORK · {featured?.title||'STUDIO SERAAI'}</span>
    </div>

   </div>
   <div className={s.right}>
    <div className={s.kickerLine}><span>OUR ARTISTS</span><i/></div>
    <h2 id="home-artist-heading" className={s.name} key={name||'heading'}>{name||'The People Behind The Art.'}</h2>
    <p className={s.description}> {name?`Discover the perspective and creative practice of ${name} through a curated selection of works in the Studio Seraai collection.`:'Discover the voices shaping the Studio Seraai collection.'}</p>
    <div className={s.actionRow}>
     <Link className={s.cta} href={name?'/artists/'+encodeURIComponent(name):'/artists'}>EXPLORE ARTIST COLLECTION <span aria-hidden="true">→</span></Link>
     <div className={s.navigation}>
      <div className={s.arrows}><button type="button" disabled={total<2} aria-label="Previous artist" onClick={()=>change(-1)}>←</button><button type="button" disabled={total<2} aria-label="Next artist" onClick={()=>change(1)}>→</button></div>
      <span aria-live="polite">{String(total?index+1:0).padStart(2,'0')} / {String(total).padStart(2,'0')}</span>
     </div>
    </div>
   </div>
  </div>
 </section>;
}
