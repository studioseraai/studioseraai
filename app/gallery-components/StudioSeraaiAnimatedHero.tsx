import styles from './StudioSeraaiAnimatedHero.module.css';

/** Hero V2: asset-driven entrance with CSS-only animation, preserving existing shell/navigation. */
export default function StudioSeraaiAnimatedHero() {
  return (
    <section className={styles.hero} aria-label="Studio Seraai — A Gallery Without Walls">
      <img className={styles.room} src="/gallery/hero/room.webp" width={1671} height={941} alt="" fetchPriority="high" />
      <div className={styles.navBackdrop} aria-hidden="true" />

      <div className={styles.sideTables} aria-hidden="true">
        <img src="/gallery/hero/v2-side-tables.webp" width={1536} height={1024} alt="" />
      </div>
      <div className={styles.mainTable} aria-hidden="true">
        <img src="/gallery/hero/v2-main-table.webp" width={1672} height={941} alt="" />
      </div>
      <div className={styles.cube} aria-hidden="true">
        <img src="/gallery/hero/v2-cube.webp" width={1312} height={1199} alt="" />
      </div>

      <div className={styles.copy}>
        <p className={styles.eyebrow}>A GALLERY WITHOUT WALLS</p>
        <h1 className={styles.title}>Art Belongs<br /><em>Everywhere.</em></h1>
        <p className={styles.description}>Exceptional art. Thoughtfully curated.<br />Made to live beyond the gallery.</p>
        <a className={styles.cta} href="#collections">EXPLORE COLLECTIONS <span aria-hidden="true">↗</span></a>
      </div>
    </section>
  );
}
