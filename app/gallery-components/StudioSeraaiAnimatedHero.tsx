import styles from './StudioSeraaiAnimatedHero.module.css';
import type {WordPressHero} from '../../lib/gallery/wordpress';

/** Hero V2: asset-driven entrance with CSS-only animation, preserving existing shell/navigation. */
export default function StudioSeraaiAnimatedHero({copy}:{copy?:WordPressHero|null}) {
  const title=copy?.title||'Vision Meets Collection';
  const words=title.trim().split(/\s+/);
  const emphasized=words.length>1?words.pop()!:'Collection';
  const leading=words.length?words.join(' '):'Vision Meets';
  const description=copy?.description||'Exceptional art. Thoughtfully curated. Made to live beyond the gallery.';
  return (
    <section className={styles.hero} aria-label="Studio Seraai — A Gallery Without Walls">
      <img className={styles.room} src="/gallery/hero/room.webp" width={1671} height={941} alt="" fetchPriority="high" />
      <div className={styles.navBackdrop} aria-hidden="true" />

      <div className={styles.sideTables} aria-hidden="true">
        <img src="/gallery/hero/seraai-v3-single-cabinet-final.webp" width={1536} height={1024} alt="" />
      </div>
      <div className={styles.mainTable} aria-hidden="true">
        <img src="/gallery/hero/seraai-v3-new-main-table.webp" width={1448} height={1086} alt="" />
      </div>
      <div className={styles.cube} aria-hidden="true">
        <img src="/gallery/hero/v2-cube.webp" width={1312} height={1199} alt="" />
      </div>

      <div className={styles.copy}>
        <p className={styles.eyebrow}>A GALLERY WITHOUT WALLS</p>
        <h1 className={styles.title}>{leading}<br /><em>{emphasized}</em></h1>
        <p className={styles.description}>{description}</p>
        <a className={styles.cta} href="#collections">EXPLORE COLLECTIONS <span aria-hidden="true">↗</span></a>
      </div>
    </section>
  );
}
