'use client';
import {useState} from 'react';
import Link from 'next/link';
import type {Artwork} from '../../lib/gallery/types';
import s from './HomeArtists.module.css';

export default function HomeArtists({artworks}:{artworks:Artwork[]}) {
 const names=[...new Set(artworks.map(a=>a.artist?.trim()).filter((v):v is string=>Boolean(v)))].slice(0,12);
 const [index,setIndex]=useState(0);
 const total=names.length;
 const name=names[index];
 const change=(step:number)=>setIndex(i=>total?(i+step+total)%total:0);
 return <section className={s.section} id="featured-artists" aria-labelledby="home-artist-heading">
   <div className={s.canvas}>
     <div className={s.left}>
       <div className={s.portraitFrame} aria-label="Artist portrait placeholder">
         <div className={s.frameInner}>
           <span className={s.portraitMark}>STUDIO SERAAI</span>
           <span className={s.portraitNote}>ARTIST PORTRAIT<br/>COMING SOON</span>
         </div>
       </div>
     </div>
     <div className={s.right}>
       <div className={s.rule} aria-hidden="true"/>
       <p className={s.eyebrow}>Featured <em>Artist</em></p>
       <h2 className={s.name} id="home-artist-heading" key={name||'empty'}>{name||'Our Artists'}</h2>
       <p className={s.description}>Explore the artists shaping the Studio Seraai collection. Artist portraits and personal stories will be added soon.</p>
       <div className={s.actionRow}>
         <Link className={s.cta} href={name?'/artists/'+encodeURIComponent(name):'/artists'}>View Collection <span aria-hidden="true">→</span></Link>
         <div className={s.navigation} aria-label="Featured artist slider">
           <button type="button" onClick={()=>change(-1)} disabled={total<2} aria-label="Previous artist">←</button>
           <span aria-live="polite">{String(total?index+1:0).padStart(2,'0')} / {String(total).padStart(2,'0')}</span>
           <button type="button" onClick={()=>change(1)} disabled={total<2} aria-label="Next artist">→</button>
         </div>
       </div>
     </div>
   </div>
 </section>;
}
