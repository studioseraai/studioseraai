'use client';
import Link from 'next/link';
import {useRef} from 'react';
import type {Artwork} from '../../lib/gallery/types';
import s from './ArtistExperience.module.css';

type ArtistEntry={name:string;works:Artwork[];photoId?:string};
const finishes=['champagne','gold','walnut','ivory','bronze','gold','ivory','walnut'];
export default function ArtistExperience({artists}:{artists:ArtistEntry[]}){
 const rowRefs=useRef<Array<HTMLDivElement|null>>([]);
 const rows=[0,1,2].map(row=>artists.filter((_,index)=>index%3===row));
 const moveRow=(row:number,direction:-1|1)=>{
  const track=rowRefs.current[row];
  if(!track)return;
  const card=track.firstElementChild as HTMLElement|null;
  track.scrollBy({left:direction*((card?.getBoundingClientRect().width||230)+20)*2,behavior:'smooth'});
 };
 return <main className={s.page}>
  <section className={s.directory} id="artist-directory" aria-labelledby="directory-heading">
   <div className={s.directoryHeading}><span aria-hidden="true"/><h2 id="directory-heading">Featured Artists</h2><span aria-hidden="true"/></div>
   {artists.length>0?<>
    <div className={s.sliderRows} aria-label="All artists">
     {rows.map((row,rowIndex)=><div className={s.sliderRow} key={rowIndex}>
      <button type="button" className={s.sliderArrow} aria-label={`Previous artists in row ${rowIndex+1}`} disabled={row.length<2} onClick={()=>moveRow(rowIndex,-1)}>‹</button>
      <div className={s.sliderTrack} role="list" aria-label={`Artist row ${rowIndex+1} of 3`} ref={node=>{rowRefs.current[rowIndex]=node;}}>
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
   </>:<div className={s.empty}>
     <h3>Our artist collection is being curated.</h3>
     <p>Discover the artworks currently available in the gallery.</p>
     <Link href="/collections">EXPLORE ARTWORKS <span aria-hidden="true">→</span></Link>
    </div>}
  </section>
 </main>;
}
