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
                src="/gallery/studio-seraai-v4-artists-sculpture.webp"
                alt="Sculptural hands and a flowing golden painter's brushstroke"
                width={1122}
                height={1402}
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
        <div className={s.right}>
          <div className={s.rule} aria-hidden="true"/>
          <p className={s.eyebrow}>Featured <em>Artist</em>s</p>
          <h2 className={s.name} id="home-artist-heading">Our Artists</h2>
          <p className={s.description}>
            Meet the creative minds behind the collection—artists whose imagination,
            craftsmanship, and distinctive perspectives turn ideas into works that stay with us.
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
