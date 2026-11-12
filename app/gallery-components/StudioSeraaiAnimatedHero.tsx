'use client';

import Image from 'next/image';
import {useEffect, useMemo, useState} from 'react';
import Link from 'next/link';
import type {Artwork} from '../../lib/gallery/types';
import type {WordPressHero} from '../../lib/gallery/wordpress';
import styles from './StudioSeraaiAnimatedHero.module.css';

type HeroSlide = {
  id: string;
  src: string;
  width: number;
  height: number;
};

const suppliedArtwork: HeroSlide = {
  id: 'seraai-reference-artwork',
  src: '/gallery/hero/v5-featured-art.webp',
  width: 686,
  height: 330,
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

export default function StudioSeraaiAnimatedHero({artworks = [], heroArtworkId}: {copy?: WordPressHero | null; artworks?: Artwork[]; heroArtworkId?: number}) {
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
        width: 1200,
        height: 590,
      }));
    const chosenHero = artworks.find(art => art.id === heroArtworkId && art.photos?.[0]?.id);
    if (!chosenHero) return [suppliedArtwork, ...verifiedCandidates];
    const selectedSlide: HeroSlide = {
      id: String(chosenHero.id),
      src: '/api/gallery/image/' + chosenHero.photos[0].id,
      width: 1200,
      height: 590,
    };
    return [selectedSlide, ...verifiedCandidates.filter(slide => slide.id !== String(chosenHero.id))];
  }, [artworks, heroArtworkId]);

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const current = slides[active] || suppliedArtwork;

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setMotionAllowed(!preference.matches);
    updatePreference();
    preference.addEventListener('change', updatePreference);
    return () => preference.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    if (!motionAllowed || paused || slides.length < 2) return;
    const timer = window.setInterval(() => {
      setActive(index => (index + 1) % slides.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [motionAllowed, paused, slides.length]);

  return <section className={styles.hero} aria-label="Studio Seraai — a contemporary art gallery">
    <div className={styles.room} aria-hidden="true">
      <Image className={`${styles.roomImage} ${styles.roomEmpty}`} src="/gallery/hero/v5-empty-wall.webp" width={1774} height={887} alt="" priority sizes="100vw" />
    </div>

    <div className={styles.decor} aria-hidden="true">
      <Image className={styles.sideTable} src="/gallery/hero/v5-side-table.webp" width={1536} height={1024} alt="" sizes="14vw" />
      <Image className={styles.mainTable} src="/gallery/hero/v5-main-table.webp" width={1448} height={1086} alt="" sizes="(max-width: 650px) 72vw, (max-width: 1100px) 49vw, 46vw" />
      <Image className={styles.cube} src="/gallery/hero/v5-cube.webp" width={1312} height={1199} alt="" sizes="(max-width: 650px) 14vw, (max-width: 1100px) 19vw, 20vw" />
    </div>

    <div
      className={styles.artStage}
      role="region"
      aria-label="Featured artwork"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className={styles.artFrame} key={current.id}>
        <Image src={current.src} alt="Featured artwork" width={current.width} height={current.height} sizes="(max-width: 650px) 86vw, (max-width: 1100px) 52vw, 42vw" className={styles.artImage} priority={active === 0} />
      </div>
    </div>

    <div className={styles.copy}>
      <p className={styles.eyebrow}>A GALLERY WHERE WALLS BREATHE ART.</p>
      <h1 className={styles.title}><span>Vision Meets</span><em>Collection</em></h1>
      <p className={styles.description}>Original artworks, thoughtfully selected to bring character, culture, and creativity to your space.</p>
      <Link className={styles.cta} href="/collections">Explore Collections <span aria-hidden="true">→</span></Link>
    </div>
  </section>;
}
