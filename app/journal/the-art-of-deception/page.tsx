import type {Metadata} from 'next';
import Link from 'next/link';
import Shell from '../../gallery-components/shell';
import article from './deception-article.json';
import s from './Deception.module.css';

export const metadata:Metadata={
 title:'The Art of Deception: Inside the Hidden World of Art Forgeries — Studio Seraai Journal',
 description:'A Studio Seraai Journal feature on art forgery, the Musée Terrus scandal, authentication science, provenance and collecting with confidence.',
 openGraph:{title:'The Art of Deception — Studio Seraai Journal',description:'Inside the Hidden World of Art Forgeries',images:['/gallery/journal-deception-hero.webp'],type:'article'}
};
const figures:Record<string,{src:string;alt:string;caption:string;className?:string}>={
 'when-the-museum-itself-is-deceived':{src:'/gallery/journal-deception-terrus.webp',alt:'Illustration of a museum entrance with a sign referencing Étienne Terrus',caption:'Editorial illustration of the Musée Terrus story. Not a documentary photograph of the museum.'},
 'the-forger-who-fooled-the-experts':{src:'/gallery/journal-deception-forger.webp',alt:'Illustrative portrait of a painter in an old studio',caption:'Conceptual portrait illustrating the world of art forgery; not a photograph of Wolfgang Beltracchi.'},
 'the-science-beneath-the-surface':{src:'/gallery/journal-deception-science.webp',alt:'Conservator examining a painting under a microscope',caption:'Illustrative visualization of technical examination in art conservation.'},
 'provenance-the-biography-of-an-artwork':{src:'/gallery/journal-deception-provenance.webp',alt:'Antique-style provenance documents and a magnifying glass',caption:'Illustrative provenance documents. Names, dates and markings shown are not authenticated historical records.'},
 'beyond-authenticity-the-art-of-collecting-with-confidence':{src:'/gallery/journal-deception-gallery.webp',alt:'Editorial montage of gallery research and the authentication process',caption:'Conceptual scenes inspired by art research, conservation and collecting.'}
};
const questions=[
 'Who created the artwork, and how is that attribution supported?',
 'What is known about its ownership and exhibition history?',
 'Does the seller have the right to sell it?',
 'Are the invoice, description, and authenticity statements consistent?',
 'Can relevant claims be independently verified?',
 'What written remedies are available if the attribution later proves incorrect?'
];
export default function Page(){return <Shell><article className={s.page}>
 <div className={s.hero}>
  <img className={s.heroImage} src="/gallery/journal-deception-hero.webp" alt="Conservator using a magnifying lens to examine the surface of a painting" fetchPriority="high"/>
  <div className={s.heroShade}/>
  <div className={s.heroContent}>
   <Link className={s.backLink} href="/journal">← BACK TO JOURNAL</Link>
   <p className={s.heroKicker}>STUDIO SERAAI JOURNAL <span aria-hidden="true">/</span> ART &amp; CULTURE</p>
   <h1>{article.title}</h1>
   <p className={s.heroSubtitle}>{article.subtitle}</p>
   <p className={s.heroMeta}>Editorial Feature <span>•</span> Art, authentication &amp; collecting</p>
  </div>
 </div>
 <div className={s.readingArea}>
  <div className={s.opening}>
   <p>{article.dek}</p>
  </div>
  <div className={s.intro}>
   {article.intro.map((p,i)=><p key={i} className={i===0?s.firstParagraph:undefined}>{p}</p>)}
  </div>
  <div className={s.articleColumns}>
   <div className={s.body}>
    {article.sections.map((section,i)=><section id={section.id} key={section.id} className={s.section}>
      <div className={s.sectionHeader}><span>{String(i+1).padStart(2,'0')}</span><h2>{section.heading}</h2></div>
      {figures[section.id]&&<figure className={s.figure}>
        <img src={figures[section.id].src} alt={figures[section.id].alt} loading="lazy" decoding="async"/>
        <figcaption>{figures[section.id].caption}</figcaption>
      </figure>}
      {section.paragraphs.map((p,j)=>{
        if(section.id==='the-collectors-eye-what-deserves-a-closer-look'&&questions.includes(p)){
          if(p!==questions[0])return null;
          return <ul key="questions" className={s.questions}>{questions.map(q=><li key={q}>{q}</li>)}</ul>;
        }
        if(section.id==='why-do-we-value-the-original'&&p==='A reproduction celebrates an artwork. A forgery attempts to replace its identity.')return <blockquote key={j} className={s.quote}>{p}</blockquote>;
        return <p key={j}>{p}</p>;
      })}
    </section>)}
    <div className={s.signature}><p>— Studio Seraai Journal</p><span>A Gallery Where Walls Breathe Art.</span></div>
    <p className={s.imageDisclaimer}>Illustrative imagery in this feature is conceptual and should not be understood as evidence of a particular artwork, individual or historical event.</p>
    <div className={s.bottomNav}><Link href="/journal">← MORE FROM THE JOURNAL</Link><Link href="/collections">EXPLORE OUR COLLECTION →</Link></div>
   </div>
   <aside className={s.sidebar} aria-label="Article contents">
    <div className={s.toc}><p className={s.tocKicker}>IN THIS FEATURE</p>
      {article.sections.map((sec,i)=><a key={sec.id} href={'#'+sec.id}><span>{String(i+1).padStart(2,'0')}</span>{sec.heading}</a>)}
      <div className={s.asideQuote}>“A reproduction celebrates an artwork. A forgery attempts to replace its identity.”</div>
    </div>
   </aside>
  </div>
 </div>
 </article></Shell>}
