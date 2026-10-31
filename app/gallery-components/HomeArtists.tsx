'use client';
import {useState} from 'react';
import Link from 'next/link';
import type {Artwork} from '../../lib/gallery/types';
import s from './HomeArtists.module.css';
export default function HomeArtists({artworks}:{artworks:Artwork[]}){
 const artists=[...new Set(artworks.map(a=>a.artist?.trim()).filter((x):x is string=>Boolean(x)))].slice(0,12);
 const [index,setIndex]=useState(0);
 const name=artists[index];
 const works=artworks.filter(a=>a.artist?.trim()===name);
 const work=works.find(a=>a.photos.length>0)||works[0];
 const leadImage=work?.photos[0]?.id;
 const image=(id:string)=>'/api/gallery/image/'+encodeURIComponent(id);
 return <section className={s.section} aria-label="Meet our artists">
  <div className={s.wall} aria-hidden="true"/>
  <div className={s.sideArt} aria-hidden="true"><span/><span/></div>
  <div className={s.plinth} aria-hidden="true"><i/></div>
  <div className={s.copy}>
   <div className={s.number}>03 <span/></div>
   <p className={s.kicker}>OUR ARTISTS</p>
   <h2>The People<br/>Behind<br/>The Art.</h2>
   <p className={s.description}>Meet the artists whose vision, experience and unique perspectives bring meaning, depth and character to our collection.</p>
   <Link href="/artists" className={s.explore}>EXPLORE ARTISTS <span aria-hidden="true">→</span></Link>
  </div>
  <div className={s.feature}>
   <div className={s.artwork} key={leadImage||'placeholder'}>
    {leadImage?<img src={image(leadImage)} alt={work.title+' by '+name} loading="lazy" decoding="async"/>:<div className={s.artPlaceholder} aria-label="Gallery artwork illustration"/>}
   </div>
   <div className={s.artistCopy}>
    <p className={s.kicker}>FEATURED ARTIST</p>
    <h3>{name||'Our Artists'}</h3>
    <div className={s.line}/>
    <p className={s.bio}>{name?`Discover ${name}'s artistic perspective through ${works.length===1?'a selected artwork':`${works.length} selected artworks`} in our collection.`:'A gallery shaped by the people and perspectives behind every work.'}</p>
    <Link href={name?'/artists/'+encodeURIComponent(name):'/artists'} className={s.view}>VIEW ARTIST <span aria-hidden="true">→</span></Link>
    <div className={s.controls}>
     <span aria-live="polite">{String(artists.length?index+1:0).padStart(2,'0')} / {String(artists.length).padStart(2,'0')}</span>
     <button type="button" aria-label="Previous featured artist" disabled={artists.length<2} onClick={()=>setIndex((index+artists.length-1)%artists.length)}>←</button>
     <button type="button" aria-label="Next featured artist" disabled={artists.length<2} onClick={()=>setIndex((index+1)%artists.length)}>→</button>
    </div>
   </div>
  </div>
  <div className={s.scroll} aria-hidden="true"><span>↓</span> SCROLL TO EXPLORE <i/></div>
 </section>;
}
