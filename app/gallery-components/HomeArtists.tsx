import Link from 'next/link';
import type {Artwork} from '../../lib/gallery/types';
import s from './HomeArtists.module.css';

export default function HomeArtists({artworks}:{artworks:Artwork[]}) {
  void artworks; // Keep the homepage integration unchanged; this editorial section is intentionally static.
  return (
    <section className={s.section} id="featured-artists" aria-labelledby="home-artist-heading">
      <div className={s.canvas}>
        <div className={s.visual}>
          <img
            className={s.sculpture}
            src="/gallery/studio-seraai-v4-artists-sculpture.webp"
            alt="Sculptural hands reaching toward a flowing bronze and gold brushstroke"
            width={1122}
            height={1402}
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className={s.copy}>
          <div className={s.rule} aria-hidden="true"/>
          <p className={s.eyebrow}>Featured <em>Artist</em>s</p>
          <h2 id="home-artist-heading" className={s.heading}>Our Artists</h2>
          <p className={s.description}>
            Meet the creative minds behind the collection—artists whose imagination,
            craftsmanship, and distinctive perspectives turn ideas into works that stay with us.
          </p>
          <Link href="/artists" className={s.cta}>
            <span>Explore Our Artists</span>
            <span className={s.arrow} aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
