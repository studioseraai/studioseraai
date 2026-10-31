import styles from './StudioSeraaiAnimatedHero.module.css';

/** Homepage-only entrance. CSS supplies the final layout even without JavaScript. */
export default function StudioSeraaiAnimatedHero() {
  return (
    <section className={styles.hero} aria-label="Studio Seraai — Art lives in space">
      <img className={styles.room} src="/gallery/hero/room.webp" width={1671} height={941} alt="" fetchPriority="high" />
      <div className={styles.navBackdrop} aria-hidden="true" />
      <div className={styles.cube} aria-hidden="true">
        <div className={styles.cables}><i /><i /><i /></div>
        <img src="/gallery/hero/cube.webp" width={1300} height={1210} alt="" loading="eager" />
      </div>
      <div className={styles.table} aria-hidden="true">
        <div className={styles.shadow} />
        <img src="/gallery/hero/table.webp" width={2048} height={759} alt="" loading="eager" />
      </div>
      <div className={styles.copy}>
        <p className={styles.eyebrow}>ART LIVES IN SPACE</p>
        <h1 className={styles.title}>STUDIO<br />SERAAI</h1>
        <p className={styles.description}>A contemporary art gallery.<br />A meeting point between art,<br />architecture and life.</p>
        <a className={styles.cta} href="#collections">EXPLORE ARTWORKS <span aria-hidden="true">→</span></a>
      </div>
    </section>
  );
}
