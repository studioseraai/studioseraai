'use client';
import {useState} from 'react';
import Link from 'next/link';
import type {Artwork} from '../../lib/gallery/types';
import s from './HomeArtists.module.css';

export default function HomeArtists({artworks}:{artworks:Artwork[]}){
 const artists=[...new Set(artworks.map(a=>a.artist?.trim()).filter((v):v is string=>Boolean(v)))].slice(0,12);
 const [index,setIndex]=useState(0);
 const name=artists[index];
 const works=artworks.filter(a=>a.artist?.trim()===name);
 const featured=works.find(a=>a.photos?.[0]?.id);
 const imageId=featured?.photos[0]?.id;
 const total=artists.length;
 const change=(step:number)=>setIndex(i=>(i+step+total)%total);
 return <section className={s.section} aria-labelledby="home-artist-heading">
  <div className={s.container}>
   <div className={s.label}><span>OUR ARTISTS</span></div>
   <div className={s.layout}>
    <div className={s.visual} key={imageId||name||'empty'}>
     {imageId?<img src={'/api/gallery/image/'+encodeURIComponent(imageId)} alt={featured.title+' — a selected artwork by '+name} loading="lazy" decoding="async"/>:<div className={s.placeholder} aria-hidden="true">STUDIO SERAAI</div>}
     <span className={s.photoCredit}>{imageId?'SELECTED ARTWORK · '+name:'ARTISTS OF STUDIO SERAAI'}</span>
    </div>
    <div className={s.content}>
     <p className={s.eyebrow}>FEATURED ARTIST</p>
     <h2 id="home-artist-heading">{name||'The People Behind The Art.'}</h2>
     <span className={s.rule}/>
     <p className={s.description}>{name?`Discover the perspective and creative practice of ${name} through ${works.length===1?'one published artwork':`${works.length} published artworks`} in the Studio Seraai collection.`:'Explore the artists whose work brings character and meaning to our collection.'}</p>
     <Link className={s.cta} href={name?'/artists/'+encodeURIComponent(name):'/artists'}>{name?'EXPLORE THEIR COLLECTION':'EXPLORE ARTISTS'} <span aria-hidden="true">→</span></Link>
     <div className={s.controls}>
      <span aria-live="polite">{String(total?index+1:0).padStart(2,'0')} / {String(total).padStart(2,'0')}</span>
      <div className={s.buttons}>
       <button type="button" aria-label="Previous artist" disabled={total<2} onClick={()=>change(-1)}>←</button>
       <button type="button" aria-label="Next artist" disabled={total<2} onClick={()=>change(1)}>→</button>
      </div>
     </div>
    </div>
   </div>
  </div>
 </section>;
}
