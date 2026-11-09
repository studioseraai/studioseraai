import Link from 'next/link';
import s from './Journal.module.css';

const featured={
 title:'The Art of Deception',
 category:'Art & Culture',
 summary:'Inside the hidden world of art forgeries — from a museum scandal to provenance, scientific analysis and collecting with confidence.',
 image:'/gallery/journal-deception-hero.webp'
};

export default function JournalIndex(){
 return <main className={s.page}>
  <div className={s.waveLeft} aria-hidden="true"/><div className={s.waveRight} aria-hidden="true"/>
  <div className={s.inner}>
   <div className={s.heading}>
    <p className={s.eyebrow}>THE JOURNAL</p>
    <h1>Thoughts on Art</h1>
    <p className={s.tagline}>Stories, reflections and insights from the world of Studio Seraai.</p>
   </div>
   <section className={s.featured} aria-labelledby="journal-featured-title">
    <Link href="/journal/the-art-of-deception" className={s.featureImage} aria-label="Read The Art of Deception">
     <img src={featured.image} alt="A conservator examining a painting with a magnifying lens" fetchPriority="high"/>
    </Link>
    <div className={s.featureText}>
     <p className={s.kicker}>{featured.category.toUpperCase()} <span aria-hidden="true"/></p>
     <h2 id="journal-featured-title"><Link href="/journal/the-art-of-deception">{featured.title}</Link></h2>
     <p className={s.summary}>{featured.summary}</p>
     <Link className={s.featurePreview} href="/journal/the-art-of-deception">READ THE FEATURE ↗</Link>
     <div className={s.dots} aria-hidden="true"><i/><i/><i/><i/></div>
    </div>
   </section>
  </div>
 </main>;
}
