import Link from 'next/link';
import type {Artwork} from '../../lib/gallery/types';
import s from './ArtistExperience.module.css';

type ArtistEntry={name:string;works:Artwork[]};
const finishes=['champagne','gold','walnut','ivory','bronze','gold','ivory','walnut'];
export default function ArtistExperience({artists}:{artists:ArtistEntry[]}){
 return <section className={s.page} aria-labelledby="artists-heading">
  <div className={s.ribbonLeft} aria-hidden="true"/><div className={s.ribbonRight} aria-hidden="true"/><div className={s.ribbonBottom} aria-hidden="true"/>
  <div className={s.intro}>
   <p className={s.eyebrow}>STUDIO SERAAI</p>
   <h1 id="artists-heading">Our Artists</h1>
   <p className={s.subtitle}>A curated community of contemporary artists<br className={s.desktopBreak}/> shaping a more expressive world.</p>
   <span className={s.line} aria-hidden="true">✦</span>
  </div>
  {artists.length>0?<>
   <div className={s.gallery}>
    {artists.map((artist,i)=><Link
      href={'/collections?artist='+encodeURIComponent(artist.name)}
      className={s.card}
      data-finish={finishes[i%finishes.length]}
      data-shape={i%11===4?'square':i%11===1?'wide':'standard'}
      key={artist.name}
      aria-label={'Explore artworks by '+artist.name}>
      <span className={s.paper} aria-hidden="true"/>
      <span className={s.artistName}>{artist.name}</span>
      <span className={s.cardMark} aria-hidden="true"/>
      <span className={s.cardHover} aria-hidden="true">EXPLORE ARTWORKS ↗</span>
     </Link>)}
   </div>
   <p className={s.notice}>Select an artist to discover their collection.</p>
   <div className={s.bottomAccent} aria-hidden="true">✦</div>
   <Link className={s.explore} href="/collections">EXPLORE THEIR WORK <span aria-hidden="true">→</span></Link>
  </>:<div className={s.empty}>
    <h2>Our artist collection is being curated.</h2>
    <p>Discover the artworks currently available in the gallery.</p>
    <Link href="/collections">EXPLORE ARTWORKS <span aria-hidden="true">→</span></Link>
  </div>}
 </section>;
}
