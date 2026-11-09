import Link from 'next/link';
import type {Artwork} from '../../lib/gallery/types';
import s from './HomeArtists.module.css';

export default function HomeArtists({artworks}:{artworks:Artwork[]}) {
  void artworks;
  return (
    <section className={s.section} id="featured-artists" aria-labelledby="home-artist-heading">
      <div className={s.canvas}>
        <div className={s.left}>
          <div className={s.portraitFrame}>
            <div className={s.frameInner}>
              <img
                className={s.artistImage}
                src="/gallery/studio-seraai-featured-artist.webp"
                alt="A painterly abstract portrait of artists creating together, surrounded by expressive orange, rust, cream and charcoal brushstrokes"
                width={1199}
                height={1312}
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
        <div className={s.right}>
          <div className={s.rule} aria-hidden="true"/>
          <h2 className={s.eyebrow} id="home-artist-heading">Featured <em>Artist</em>s</h2>
          
          <p className={s.description}>
            Meet the creative minds behind the collection—artists whose imagination, craftsmanship, and distinctive perspectives turn ideas into works that will adorn the walls of your home.
          </p>
          <div className={s.actionRow}>
            <Link className={s.cta} href="/artists">
              Explore Our Artists <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
