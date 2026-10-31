'use client';
import {useState} from 'react';
import Link from 'next/link';
import type {Artwork} from '../../lib/gallery/types';
import s from './ArtistExperience.module.css';

type ArtistEntry={name:string;works:Artwork[]};
export default function ArtistExperience({artists}:{artists:ArtistEntry[]}){
 const [index,setIndex]=useState(0);
 const [showAll,setShowAll]=useState(false);
 const active=artists[index];
 const art=active?.works.find(w=>w.photos.length>0)||active?.works[0];
 const selected=artists.length>0;
 const navigate=(offset:number)=>setIndex(i=>(i+offset+artists.length)%artists.length);
 return <div className={s.page}>
  <section className={s.hero} aria-label="Our artists">
   <div className={s.curve} aria-hidden="true"/>
   <div className={s.copy}>
    <div className={s.chapter}><span>03</span><i/></div>
    <p className={s.kicker}>OUR ARTISTS</p>
    <h1>The People<br/>Behind<br/>The Art.</h1>
    <p className={s.intro}>Meet the artists whose vision, experience and unique perspectives bring meaning, depth and character to our collection.</p>
    <a className={s.outlineButton} href="#artist-directory" onClick={()=>setShowAll(true)}>EXPLORE ARTISTS <span>→</span></a>
   </div>
   <div className={s.galleryScene} aria-hidden="true"><div className={s.artGhost}/><div className={s.artGhostSecond}/></div>
   <div className={s.feature}>
    <div className={s.featureImage}>
     {art?.photos[0]?<img key={art.photos[0].id} src={'/api/gallery/image/'+encodeURIComponent(art.photos[0].id)} alt={art.title+' by '+active.name} fetchPriority="high"/>:<div className={s.noImage}>STUDIO SERAAI</div>}
    </div>
    <div className={s.featureCopy}>
     <p className={s.kicker}>FEATURED ARTIST</p>
     <h2>{selected?active.name:'The Artists'}</h2>
     <span className={s.shortLine}/>
     <p>{selected?`${active.works.length} published ${active.works.length===1?'work':'works'} in our collection. Discover the artist's perspective through their selected artworks.`:'Our artists will appear here as their works are published.'}</p>
     {selected&&<Link href={'/artists/'+encodeURIComponent(active.name)} className={s.view}>VIEW ARTIST <span>→</span></Link>}
     <div className={s.controls}>
      <span aria-live="polite">{String(selected?index+1:0).padStart(2,'0')} / {String(artists.length).padStart(2,'0')}</span>
      <button type="button" onClick={()=>navigate(-1)} disabled={artists.length<2} aria-label="Previous artist">←</button>
      <button type="button" onClick={()=>navigate(1)} disabled={artists.length<2} aria-label="Next artist">→</button>
     </div>
    </div>
   </div>
   <div className={s.scroll}><span className={s.mouse}>↓</span><span>SCROLL TO EXPLORE</span><i/></div>
  </section>
  <section id="artist-directory" className={s.directory}>
   <div className={s.directoryHeading}><p className={s.kicker}>THE DIRECTORY</p><h2>Artists at Studio Seraai.</h2><p>Discover the works and perspectives behind our collection.</p></div>
   {selected?<div className={s.grid}>{artists.map(a=>{const first=a.works.find(w=>w.photos[0])||a.works[0];return <Link href={'/artists/'+encodeURIComponent(a.name)} className={s.artistCard} key={a.name}><div className={s.thumbnail}>{first?.photos[0]?<img src={'/api/gallery/image/'+encodeURIComponent(first.photos[0].id)} alt={'Selected work by '+a.name} loading="lazy"/>:<div className={s.noImage}>STUDIO SERAAI</div>}</div><h3>{a.name}</h3><p>{a.works.length} {a.works.length===1?'artwork':'artworks'} <span>↗</span></p></Link>})}</div>:<p className={s.empty}>The artist directory is being curated. <Link href="/contact">Inquire with the gallery →</Link></p>}
  </section>
 </div>;
}
