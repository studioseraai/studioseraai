'use client';
import {useState} from 'react';
import Link from 'next/link';
import type {Artwork} from '../../lib/gallery/types';
import s from './ArtistExperience.module.css';

type ArtistEntry={name:string;works:Artwork[]};
const demoFrames=['walnut','ivory','gold','black','gold'];
function Portrait({name,index,isPlaceholder}:{name:string;index:number;isPlaceholder:boolean}){
 const [missing,setMissing]=useState(false);
 const key=name.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 const src='/gallery/artist-portraits/'+key+'.webp';
 return <div className={s.portrait}>
  {!isPlaceholder&&!missing?<img src={src} alt={'Portrait of '+name} onError={()=>setMissing(true)} loading={index<5?'eager':'lazy'}/>:<div className={s.silhouette} aria-label={isPlaceholder?'Illustrative portrait placeholder':'Portrait not yet available'}><span className={s.figureHead}/><span className={s.figureBody}/></div>}
 </div>;
}
export default function ArtistExperience({artists}:{artists:ArtistEntry[]}){
 const preview=artists.length===0;
 const positions=preview?Array.from({length:5},(_,i)=>({name:'Artist portrait '+(i+1),works:[] as Artwork[]})):artists;
 return <section className={s.page} aria-labelledby="artists-heading">
  <div className={s.ribbonLeft} aria-hidden="true"/><div className={s.ribbonRight} aria-hidden="true"/><div className={s.ribbonBottom} aria-hidden="true"/>
  <div className={s.intro}>
   <p className={s.eyebrow}>THE ARTISTS</p>
   <h1 id="artists-heading">Our Artists</h1>
   <p className={s.subtitle}>Meet the minds behind the masterpieces.</p>
   <span className={s.line} aria-hidden="true"/>
  </div>
  <div className={s.gallery} data-preview={preview}>
   {positions.map((artist,i)=>{
    const card=<>
     <div className={s.artPatch} aria-hidden="true"/>
     <div className={s.frame} data-finish={demoFrames[i%demoFrames.length]}><Portrait name={artist.name} index={i} isPlaceholder={preview}/></div>
     {!preview&&<div className={s.caption}><h2>{artist.name}</h2><span>VIEW ARTWORKS ↗</span></div>}
    </>;
    return preview?<div className={s.card} key={i} data-position={i%5}>{card}</div>:
     <Link href={'/collections?artist='+encodeURIComponent(artist.name)} className={s.card} key={artist.name} data-position={i%5} aria-label={'View artworks by '+artist.name}>{card}</Link>;
   })}
  </div>
  {preview?<p className={s.notice}>Artist portraits will appear here as their collections are published. Framed portraits above are layout placeholders.</p>:
   <p className={s.notice}>Select an artist to explore their artworks.</p>}
 </section>;
}
