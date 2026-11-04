import Link from 'next/link';
import s from './PrivateViewing.module.css';

export default function PrivateViewing() {
  return (
    <section className={s.section} aria-labelledby="private-viewing-heading">
      <div className={s.inner}>
        <div className={s.copy}>
          <h2 id="private-viewing-heading">Request a <em>Private Viewing</em></h2>
          <div className={s.rule} aria-hidden="true" />
          <p className={s.description}>
            Preview selected works and curated wall compositions in a private consultation setting.
          </p>
          <Link className={s.cta} href="/contact?viewing=1">
            <span>Book a Viewing</span><span className={s.arrow} aria-hidden="true">→</span>
          </Link>
        </div>
        <div className={s.scene} role="img" aria-label="Studio Seraai private art consultation: a gallery representative presents artwork arrangements to a guest using the art visualizer.">
          <img
            className={s.photo}
            src="/gallery/studio-seraai-v4-private-viewing-blue-art.webp"
            alt=""
            loading="lazy"
            decoding="async"
            width={1672}
            height={941}
          />
        </div>
      </div>
      <div className={s.curve} aria-hidden="true" />
    </section>
  );
}
