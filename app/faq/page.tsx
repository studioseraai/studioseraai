import Link from 'next/link';
import Shell from '../gallery-components/shell';
import {ArrowUpRight} from 'lucide-react';
import styles from './FAQPage.module.css';

export const metadata={title:'Frequently Asked Questions — Studio Seraai',description:'Answers about collecting, private viewings, art visualization, artist submissions, purchases and caring for original artworks at Studio Seraai.'};

const groups=[
 {title:'Collecting & Viewing',items:[
  ['What is Studio Seraai?','Studio Seraai deals in contemporary and commercial Pakistani art, and acts as a bridge between artists and art collectors.'],
  ['How can I explore the artworks?','Browse our online collection. Artwork pages include available details such as the artist, medium, surface, style, theme and dimensions.'],
  ['Are the artworks original?','Studio Seraai exhibits and displays 100% original artworks. Proper documentation, including a Certificate of Authenticity, is provided with each artwork.'],
  ['How do I ask about an artwork’s price or availability?','Our team will gladly address your queries about an artwork, including its price and availability. Use the inquiry option on the artwork page or contact us directly.'],
  ['Can I see an artwork in person before deciding?','Visit us for a personal viewing. Please contact us to arrange a suitable visit.'],
  ['What is the Art Visualization experience?','We can recreate your available home space on a projector and suggest artwork options to adorn your walls. Arrange a session at the gallery to see how selected works could look in your space.'],
  ['Can Studio Seraai visit my home?','Ask us about a home visit. We can discuss your available space and suggest artwork options for your walls.'],
  ['How do I arrange a viewing or consultation?','Kindly pay us a visit or contact us by phone or through our website to arrange a personal viewing or consultation.']
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
   <div className={styles.groupHeading}><span>0{groupIndex+1}</span><h2 id={'faq-group-'+groupIndex}>{group.title}</h2><i aria-hidden="true"/></div>
   <div className={styles.questions}>{group.items.map(([question,answer],index)=><details className={styles.item} key={question}>
    <summary><span className={styles.number}>{String(groups.slice(0,groupIndex).reduce((n,g)=>n+g.items.length,0)+index+1).padStart(2,'0')}</span><span className={styles.question}>{question}</span><span className={styles.toggle} aria-hidden="true"/></summary>
    <p className={styles.answer}>{answer}</p>
   </details>)}</div>
  </section>)}
 </section>
 <section className={styles.contact}><p>STILL CURIOUS?</p><h2>Let’s talk about art.</h2><Link href="/contact">CONTACT THE GALLERY <ArrowUpRight size={16} aria-hidden="true"/></Link></section>
 </Shell>;}
