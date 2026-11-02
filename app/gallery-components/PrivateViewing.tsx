import Link from 'next/link';
import s from './PrivateViewing.module.css';

export default function PrivateViewing() {
  return (
    <section className={s.section} aria-labelledby="private-viewing-heading">
      <div className={s.copy}>
        <h2 id="private-viewing-heading">Request a <em>Private Viewing</em></h2>
        <div className={s.rule} aria-hidden="true" />
        <p className={s.description}>Experience selected works in an intimate, personal setting.</p>
        <Link className={s.cta} href="/contact?viewing=1">
          Book a Viewing <span aria-hidden="true">→</span>
        </Link>
      </div>
      <div className={s.scene} aria-hidden="true">
        {/* Transparent sculptural image uploaded to public/gallery on main. */}
        <img className={s.cube} src="/gallery/private-viewing-cube.webp" alt="" loading="lazy" decoding="async" />
      </div>
    </section>
  );
}
