import Link from 'next/link';
import Shell from '../gallery-components/shell';
import {ArrowUpRight} from 'lucide-react';
import styles from './FAQPage.module.css';

export const metadata={title:'Frequently Asked Questions — Studio Seraai',description:'Answers about collecting, private viewings, art visualization, artist submissions, purchases and caring for original artworks at Studio Seraai.'};

const groups=[
 {title:'Collecting & Viewing',items:[
  ['What is Studio Seraai?','Studio Seraai is a Karachi art gallery connecting artists and collectors through original artworks and shared cultural experiences.'],
  ['How can I explore the artworks?','Browse our online collection. Artwork pages include available details such as the artist, medium, surface, style, theme and dimensions.'],
  ['Are the artworks original?','Studio Seraai presents original artworks. For details or supporting documentation about a specific piece, please contact us.'],
  ['How do I ask about an artwork’s price or availability?','Use the inquiry option on the artwork page or contact Studio Seraai directly. Our team can provide details about the piece.'],
  ['Can I see an artwork in person before deciding?','Contact us to discuss viewing an artwork at the gallery. We’ll help arrange a suitable visit.'],
  ['What is the Art Visualization experience?','At the gallery, we can use a projector to help you preview how selected artworks could look in your space.'],
  ['Can Studio Seraai visit my home?','Yes. You can request a home consultation to explore artwork placement in your space.'],
  ['How do I arrange a viewing or consultation?','Contact us by phone or through the website and tell us whether you prefer an in-gallery projector session or a home visit.']
 ]},
 {title:'For Artists',items:[
  ['Can artists submit their work to Studio Seraai?','Yes. We welcome serious artists interested in exhibiting their work with us.'],
  ['Which artists can get in touch?','We welcome established and emerging artists. Pakistani artists are encouraged to contact us, and artists from elsewhere are welcome too.'],
  ['Which styles and mediums do you consider?','All styles and mediums are welcome.'],
  ['What should I include when contacting you about exhibiting?','Share a short introduction and information about your artistic practice. You can include portfolio images or a link to your work.']
 ]},
 {title:'Purchases & Artwork Care',items:[
  ['What payment methods do you accept?','Please contact us about the specific artwork. We’ll confirm the accepted payment options and applicable terms directly.'],
  ['Do you deliver artworks, and what does delivery cost?','Contact us before confirming a purchase to ask whether delivery is available for your destination and to confirm the cost and arrangements.'],
  ['Can I return or exchange an artwork?','Please contact Studio Seraai before purchase to confirm the return or cancellation terms that apply to the specific artwork.']
 ]}
];

export default function FAQPage(){return <Shell>
 <section className={styles.hero} aria-labelledby="faq-title">
  <div className={styles.heroTop}><p className={styles.kicker}>STUDIO SERAAI · A FEW THINGS TO KNOW</p><span className={styles.index}>COLLECT · VIEW · DISCOVER</span></div>
  <div className={styles.titleRow}><h1 id="faq-title">Questions,<br/><em>answered.</em></h1><p>Everything you need to know about discovering art, arranging a viewing, and sharing your work with Studio Seraai.</p></div>
  <div className={styles.rule}><span>15 QUESTIONS</span><span>01 — 15</span></div>
 </section>
 <section className={styles.content} aria-label="Frequently asked questions">
  {groups.map((group,groupIndex)=><section className={styles.group} key={group.title} aria-labelledby={'faq-group-'+groupIndex}>
   <header className={styles.groupHeading}><span>0{groupIndex+1}</span><h2 id={'faq-group-'+groupIndex}>{group.title}</h2><i aria-hidden="true"/></header>
   <div className={styles.questions}>{group.items.map(([question,answer],index)=><details className={styles.item} key={question}>
    <summary><span className={styles.number}>{String(groups.slice(0,groupIndex).reduce((n,g)=>n+g.items.length,0)+index+1).padStart(2,'0')}</span><span className={styles.question}>{question}</span><span className={styles.toggle} aria-hidden="true"/></summary>
    <p className={styles.answer}>{answer}</p>
   </details>)}</div>
  </section>)}
 </section>
 <section className={styles.contact}><p>STILL CURIOUS?</p><h2>Let’s talk about art.</h2><Link href="/contact">CONTACT THE GALLERY <ArrowUpRight size={16} aria-hidden="true"/></Link></section>
 </Shell>;}
