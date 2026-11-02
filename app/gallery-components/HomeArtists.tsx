'use client';
import {useState} from 'react';
import Link from 'next/link';
import type {Artwork} from '../../lib/gallery/types';
import s from './HomeArtists.module.css';

export default function HomeArtists({artworks}:{artworks:Artwork[]}){
 const artists=[...new Set(artworks.map(a=>a.artist?.trim()).filter((v):v is string=>Boolean(v)))].slice(0,12);
 const [index,setIndex]=useState(0);
 const total=artists.length;
 const name=artists[index];
 const works=artworks.filter(a=>a.artist?.trim()===name);
 const featured=works.find(a=>a.photos?.[0]?.id);
 const imageId=featured?.photos[0]?.id;
 const change=(step:number)=>setIndex(i=>total?(i+step+total)%total:0);
 return <section className={s.section} aria-labelledby="home-artist-heading" aria-label="Meet our artists">
  <div className={s.arch} aria-hidden="true"/><div className={s.container}>
   <div className={s.heading}><p className={s.kicker}>THE PEOPLE BEHIND THE ART</p><h2 id="home-artist-heading">Meet Our <em>Artists.</em></h2></div>
   <div className={s.layout}>
    <div className={s.visualWrap}><div className={s.visual} key={imageId||name||'empty'}>
     {imageId?<img src={'/api/gallery/image/'+encodeURIComponent(imageId)} alt={'Selected artwork by '+name+': '+featured.title} loading="lazy" decoding="async"/>:<div className={s.placeholder} aria-hidden="true">STUDIO SERAAI</div>}
     <span className={s.photoCredit}>{imageId?'FEATURED ARTWORK · '+(featured?.title||name):'ARTISTS OF STUDIO SERAAI'}</span>
    </div><div className={s.artBadge} aria-hidden="true"><span>ART</span><i>Without</i><span>WALLS</span></div></div>
    <div className={s.content}>
     <p className={s.eyebrow}>AN ARTIST IN FOCUS <span>{String(total?index+1:0).padStart(2,'0')} — {String(total).padStart(2,'0')}</span></p>
     <div className={s.copy} key={name||'none'}>
      <h3>{name||'The People Behind The Art.'}</h3>
      <span className={s.rule}/><p className={s.subline}>A DIFFERENT WAY OF SEEING</p>
      <p className={s.description}>{name?`Explore the distinctive perspective of ${name} through ${works.length===1?'a selected artwork':`${works.length} artworks`} in the Studio Seraai collection.`:'Discover the creative voices who bring our collection to life.'}</p>
      {featured&&<p className={s.artNote}>SELECTED WORK <span>{featured.title}</span></p>}
      <Link className={s.cta} href={name?'/artists/'+encodeURIComponent(name):'/artists'}>{name?'EXPLORE ARTIST COLLECTION':'DISCOVER ARTISTS'} <span aria-hidden="true">↗</span></Link>
     </div>
     <div className={s.controls}>
      <div className={s.progress} aria-hidden="true"><span style={{width:total?`${((index+1)/total)*100}%`:'0%'}}/></div>
      <div className={s.buttons}>
       <button type="button" aria-label="Previous artist" disabled={total<2} onClick={()=>change(-1)}>←</button>
       <button type="button" aria-label="Next artist" disabled={total<2} onClick={()=>change(1)}>→</button>
      </div>
     </div>
    </div>
   </div>
   <div className={s.bottom}><span>CURATED VOICES · STUDIO SERAAI</span><Link href="/artists">VIEW ALL ARTISTS ↗</Link></div>
  </div>
 </section>;
}
