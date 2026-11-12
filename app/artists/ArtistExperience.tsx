'use client';
import Link from 'next/link';
import {useMemo, useRef, useState} from 'react';
import type {Artwork} from '../../lib/gallery/types';
import s from './ArtistExperience.module.css';

type ArtistEntry={name:string;works:Artwork[];photoId?:string};
const finishes=['champagne','gold','walnut','ivory','bronze','gold','ivory','walnut'];
export default function ArtistExperience({artists}:{artists:ArtistEntry[]}){
 const rowRefs=useRef<Array<HTMLDivElement|null>>([]);
 const [query,setQuery]=useState('');
 const filteredArtists=useMemo(()=>{
  const term=query.trim().toLocaleLowerCase();
  return term?artists.filter(artist=>artist.name.toLocaleLowerCase().includes(term)):artists;
 },[artists,query]);
 const rowCount=Math.min(3,filteredArtists.length);
 const rows=Array.from({length:rowCount},(_,row)=>filteredArtists.filter((_,index)=>index%rowCount===row));
 const moveRow=(row:number,direction:-1|1)=>{
  const track=rowRefs.current[row];
  if(!track)return;
  const card=track.firstElementChild as HTMLElement|null;
  track.scrollBy({left:direction*((card?.getBoundingClientRect().width||230)+20)*2,behavior:'smooth'});
 };
 return <main className={s.page}>
  <section className={s.directory} id="artist-directory" aria-labelledby="directory-heading">
   <div className={s.directoryHeading}><span aria-hidden="true"/><h2 id="directory-heading">Featured Artists</h2><span aria-hidden="true"/></div>
   <div className={s.searchArea}>
    <label className={s.searchBox}>
     <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg>
     <input type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search artists by name" aria-label="Search artists by name"/>
     {query&&<button type="button" className={s.clearSearch} onClick={()=>setQuery('')} aria-label="Clear artist search">×</button>}
    </label>
    <p className={s.searchCount} aria-live="polite">{filteredArtists.length} {filteredArtists.length===1?'artist':'artists'}</p>
   </div>
   {artists.length>0&&filteredArtists.length>0?<>
    <div className={s.sliderRows} aria-label="All artists">
     {rows.map((row,rowIndex)=><div className={s.sliderRow} key={rowIndex}>
      <button type="button" className={s.sliderArrow} aria-label={`Previous artists in row ${rowIndex+1}`} disabled={row.length<2} onClick={()=>moveRow(rowIndex,-1)}>‹</button>
      <div className={s.sliderTrack} role="list" aria-label={`Artist row ${rowIndex+1} of ${rowCount}`} ref={node=>{rowRefs.current[rowIndex]=node;}}>
       {row.map((artist,index)=><Link
        href={'/collections?artist='+encodeURIComponent(artist.name)}
        className={s.card}
        data-finish={finishes[(rowIndex+index)%finishes.length]}
        key={artist.name}
        role="listitem"
        aria-label={'Explore artworks by '+artist.name}>
        {artist.photoId&&<img className={s.artistPortrait} src={'/api/gallery/image/'+encodeURIComponent(artist.photoId)} alt="" loading="lazy" decoding="async"/>}
        {artist.photoId&&<span className={s.portraitShade} aria-hidden="true"/>}
        <span className={s.paper} aria-hidden="true"/>
        <span className={s.artistName}>{artist.name}</span>
        <span className={s.cardMark} aria-hidden="true"/>
        <span className={s.cardHover} aria-hidden="true">EXPLORE ARTWORKS ↗</span>
       </Link>)}
      </div>
      <button type="button" className={s.sliderArrow} aria-label={`Next artists in row ${rowIndex+1}`} disabled={row.length<2} onClick={()=>moveRow(rowIndex,1)}>›</button>
     </div>)}
    </div>
    <p className={s.notice}>Select an artist to discover their collection.</p>
    <Link className={s.explore} href="/collections">EXPLORE THE COLLECTION <span aria-hidden="true">→</span></Link>
   </>:artists.length===0?<div className={s.empty}>
     <h3>Our artist collection is being curated.</h3>
     <p>Discover the artworks currently available in the gallery.</p>
     <Link href="/collections">EXPLORE ARTWORKS <span aria-hidden="true">→</span></Link>
    </div>:<div className={s.noResults} role="status">
      <h3>No artists found</h3>
      <p>Try another name or clear your search.</p>
      <button type="button" onClick={()=>setQuery('')}>CLEAR SEARCH</button>
    </div>}
  </section>
 </main>;
}
