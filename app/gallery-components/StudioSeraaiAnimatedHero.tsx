'use client';

import Image from 'next/image';
import {useMemo, useState, type KeyboardEvent} from 'react';
import Link from 'next/link';
import type {Artwork} from '../../lib/gallery/types';
import type {WordPressHero} from '../../lib/gallery/wordpress';
import styles from './StudioSeraaiAnimatedHero.module.css';

type HeroSlide = {
  id: string;
  src: string;
  title: string;
  artist: string;
  width: number;
  height: number;
};

const suppliedArtwork: HeroSlide = {
  id: 'seraai-reference-artwork',
  src: '/gallery/hero/v5-featured-art.webp',
  title: 'Featured artwork',
  artist: 'Studio Seraai',
  width: 687,
  height: 339,
};

function dimensions(art: Artwork) {
  let width = Number.parseFloat(art.width || '');
  let height = Number.parseFloat(art.height || '');
  let unit = (art.dimensionUnit || 'cm').trim().toLowerCase();
  if (!(width > 0 && height > 0)) {
    const match = (art.size || '').match(/(\d+(?:\.\d+)?)\s*(?:cm|mm|m|in|inch|inches)?\s*[x×]\s*(\d+(?:\.\d+)?)/i);
    if (match) {
      width = Number(match[1]);
      height = Number(match[2]);
      unit = (art.size || '').toLowerCase().match(/(inches|inch|in|mm|cm|m)/)?.[1] || 'cm';
    }
  }
  const scale = unit.startsWith('in') ? 2.54 : unit === 'mm' ? 0.1 : unit === 'm' ? 100 : 1;
  width *= scale;
  height *= scale;
  return {area: width > 0 && height > 0 ? width * height : 0, longest: Math.max(width, height)};
}

export default function StudioSeraaiAnimatedHero({artworks = []}: {copy?: WordPressHero | null; artworks?: Artwork[]}) {
  const slides = useMemo<HeroSlide[]>(() => {
    const ranked = artworks
      .filter(art => art.photos?.[0]?.id)
      .map(art => ({art, ...dimensions(art)}))
      .sort((a, b) => b.area - a.area || b.longest - a.longest);
    const large = ranked.filter(item => item.longest >= 100);
    const selected = (large.length ? large : ranked).slice(0, 5);
    const verifiedCandidates = selected
      .filter(({art}) => art.id !== 4478 && art.id !== 4636)
      .slice(0, 3)
      .map(({art}) => ({
        id: String(art.id),
        src: '/api/gallery/image/' + art.photos[0].id,
        title: art.title,
        artist: art.artist || 'Studio Seraai',
        width: 1200,
        height: 590,
      }));
    return [suppliedArtwork, ...verifiedCandidates];
  }, [artworks]);

  const [active, setActive] = useState(0);
  const current = slides[active] || suppliedArtwork;
  const move = (step: number) => setActive(index => (index + step + slides.length) % slides.length);
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
  };

  return <section className={styles.hero} aria-label="Studio Seraai — a contemporary art gallery">
    <div className={styles.room} aria-hidden="true">
      <Image className={`${styles.roomImage} ${styles.roomEmpty}`} src="/gallery/hero/v5-empty-wall.webp" width={1774} height={887} alt="" priority sizes="100vw" />
      <Image className={`${styles.roomImage} ${styles.roomPainted}`} src="/gallery/hero/v5-wall-painted.webp" width={1672} height={941} alt="" priority sizes="100vw" />
    </div>

    <div className={styles.decor} aria-hidden="true">
      <Image className={styles.sideTable} src="/gallery/hero/v5-side-table.webp" width={1536} height={1024} alt="" sizes="14vw" />
      <Image className={styles.mainTable} src="/gallery/hero/v5-main-table.webp" width={1448} height={1086} alt="" sizes="35vw" />
      <Image className={styles.cube} src="/gallery/hero/v5-cube.webp" width={1312} height={1199} alt="" sizes="12vw" />
    </div>

    <div className={styles.artStage} role="region" aria-label="Featured artwork slider" tabIndex={0} onKeyDown={onKeyDown}>
      <div className={styles.artFrame} key={current.id}>
        <Image src={current.src} alt={current.title} width={current.width} height={current.height} sizes="(max-width: 650px) 86vw, (max-width: 1100px) 52vw, 42vw" className={styles.artImage} priority={active === 0} />
      </div>
      <div className={styles.artCaption} aria-live="polite"><span>{current.title}</span><span>{current.artist}</span></div>
      {slides.length > 1 && <div className={styles.controls}>
        <button type="button" aria-label="Previous artwork" onClick={() => move(-1)}>‹</button>
        <div className={styles.dots}>{slides.map((slide, index) => <button key={slide.id} type="button" aria-label={'Show artwork ' + (index + 1)} aria-current={index === active ? 'true' : undefined} onClick={() => setActive(index)} />)}</div>
        <button type="button" aria-label="Next artwork" onClick={() => move(1)}>›</button>
      </div>}
    </div>

    <div className={styles.copy}>
      <p className={styles.eyebrow}>CURATED ART COLLECTIONS</p>
      <h1 className={styles.title}><span>Art for</span><em>Inspired Spaces</em></h1>
      <p className={styles.description}>Original artworks, thoughtfully selected to bring character, culture, and creativity to your space.</p>
      <Link className={styles.cta} href="/collections">Explore Collections <span aria-hidden="true">→</span></Link>
    </div>
  </section>;
}
