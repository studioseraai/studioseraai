import Link from 'next/link';
import {ArrowRight, House, Projector} from 'lucide-react';
import s from './PrivateViewing.module.css';

export default function PrivateViewing() {
  return (
    <section className={s.section} aria-labelledby="private-viewing-heading">
      <div className={s.inner}>
        <div className={s.copy}>
          <div className={s.eyebrow}><span>STUDIO SERAAI</span><span className={s.eyebrowRule} aria-hidden="true" /></div>
          <h2 id="private-viewing-heading">Private Viewing &amp; <em>Art Visualization</em></h2>
          <div className={s.rule} aria-hidden="true" />
          <p className={s.description}>
            Studio Seraai can visit your home or welcome you to the studio to help you preview how selected artworks could look in your space.
          </p>
          <Link className={s.cta} href="/contact?viewing=1">
            <span>Request a Private Viewing</span><ArrowRight aria-hidden="true" size={23}/>
          </Link>
        </div>
        <div className={s.collage} aria-label="Private artwork consultations at home or with Studio Seraai's in-gallery projector">
          <div className={s.homeScene}>
            <img src="/gallery/seraai-v5-cta-home.webp" alt="Artwork visualization consultation in a warm interior" loading="lazy" decoding="async"/>
          </div>
          <div className={s.studioScene}>
            <img src="/gallery/seraai-v5-cta-projector.webp" alt="Studio Seraai representative presenting an artwork placement using a projector" loading="lazy" decoding="async" width={1448} height={1086}/>
          </div>
          <div className={s.homeBadge}><House aria-hidden="true" size={24} strokeWidth={1.6}/><span>HOME VISIT<br/>ART CONSULTATION</span></div>
          <div className={s.studioBadge}><Projector aria-hidden="true" size={25} strokeWidth={1.6}/><span>IN-GALLERY<br/>PROJECTOR VISUALIZATION</span></div>
        </div>
      </div>
      <div className={s.curve} aria-hidden="true"/>
    </section>
  );
}
