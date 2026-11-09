import Link from 'next/link';
import type {Artwork} from '../../lib/gallery/types';
import s from './ArtistExperience.module.css';

type ArtistEntry={name:string;works:Artwork[]};
const finishes=['champagne','gold','walnut','ivory','bronze','gold','ivory','walnut'];
export default function ArtistExperience({artists}:{artists:ArtistEntry[]}){
 return <main className={s.page}>
  <section className={s.hero} aria-labelledby="artists-heading">
   <div className={s.heroCopy}>
    <p className={s.eyebrow}>OUR ARTISTS <span aria-hidden="true"/></p>
    <h1 id="artists-heading">Meet the<br/><em>Creative Minds</em></h1>
    <p className={s.heroDescription}>The artists behind the collection—visionaries whose imagination, craftsmanship, and distinctive perspectives turn ideas into works that will adorn the walls of your home.</p>
    <Link className={s.heroCta} href="#artist-directory">Explore Our Artists <span aria-hidden="true">→</span></Link>
   </div>
   <div className={s.heroVisual}>
    <img src="/gallery/artist-page-muse.webp" alt="A classical sculptural muse with expressive abstract brushwork in warm gallery tones" width={1350} height={1165} fetchPriority="high"/>
   </div>
   <div className={s.wave} aria-hidden="true"/>
  </section>
  <section className={s.directory} id="artist-directory" aria-labelledby="directory-heading">
   <div className={s.directoryHeading}><span aria-hidden="true"/><h2 id="directory-heading">Featured Artists</h2><span aria-hidden="true"/></div>
   {artists.length>0?<>
    <div className={s.gallery}>
     {artists.map((artist,i)=><Link
       href={'/collections?artist='+encodeURIComponent(artist.name)}
       className={s.card}
       data-finish={finishes[i%finishes.length]}
       key={artist.name}
       aria-label={'Explore artworks by '+artist.name}>
       <span className={s.paper} aria-hidden="true"/>
       <span className={s.artistName}>{artist.name}</span>
       <span className={s.cardMark} aria-hidden="true"/>
       <span className={s.cardHover} aria-hidden="true">EXPLORE ARTWORKS ↗</span>
      </Link>)}
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
