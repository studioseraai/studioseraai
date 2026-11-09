import Link from 'next/link';
import {Boxes, Layers3, Heart, UsersRound, Check, ArrowUpRight} from 'lucide-react';
import Shell from '../gallery-components/shell';
import s from './OurStory.module.css';

export const metadata={
 title:'About Us — Studio Seraai',
 description:'Discover the meaning of Seraai, our commitment to artists and collectors, and the story behind Studio Seraai in Karachi.'
};

const principles=[
 {title:'Discover',copy:'Original art from Pakistan and beyond.',Icon:Boxes},
 {title:'Exhibit',copy:'Curated shows that spark dialogue.',Icon:Layers3},
 {title:'Support',copy:'More opportunities for artists to grow.',Icon:UsersRound},
 {title:'Connect',copy:'Bringing art and collectors together.',Icon:Heart}
];
const criteria=[
 'Original artworks',
 'All styles and mediums welcome',
 'Professional presentation',
 'Pakistani artists encouraged; all artists welcome to contact us'
];

export default function Page(){
 return <Shell><div className={s.page}>
  <section className={s.hero} aria-labelledby="about-title">
   <div className={s.heroCopy}>
    <p className={s.kicker}>ABOUT US</p>
    <h1 id="about-title">Studio Seraai</h1>
    <p className={s.heroTagline}>A GALLERY WHERE WALLS BREATHE ART.</p>
    <span className={s.rule} aria-hidden="true"/>
    <p className={s.missionLabel}>OUR MISSION</p>
    <div className={s.missionCopy}>
      <p>Our mission is to make fine art a shared experience rather than a closed privilege. We are redefining the relationship between the creator and the collector by stripping away the gatekeeping that separates them. Our gallery is a dynamic canvas where art is accessible, dialogue is encouraged and trust is foundational.</p>
      <p>We champion artists by giving their voices room to breathe, and we guide art lovers into becoming confident collectors, moving art out of isolated spaces and into our collective cultural life.</p>
    </div>
   </div>
   <div className={s.heroImage}>
    <img src="/gallery/studio-seraai-office-about.webp" alt="Studio Seraai gallery office with framed artworks, consultation seating and wooden bookshelves" fetchPriority="high"/>
    <span className={s.photoCaption}>STUDIO SERAAI · KARACHI</span>
   </div>
  </section>

  <section className={s.principles} aria-label="The Studio Seraai approach">
   {principles.map(({title,copy,Icon})=><article className={s.principle} key={title}>
    <Icon aria-hidden="true" strokeWidth={1.35}/>
    <h2>{title}</h2>
    <p>{copy}</p>
   </article>)}
  </section>

  <section className={s.purpose} aria-labelledby="about-purpose">
   <div className={s.purposeImage}>
    <img src="/gallery/warm-collection.webp" alt="Textured artworks in a warm-toned gallery environment" loading="lazy"/>
   </div>
   <div className={s.purposeCopy}>
    <p className={s.kicker}>THE MEANING BEHIND OUR NAME</p>
    <h2 id="about-purpose">Why Seraai?</h2>
    <span className={s.rule} aria-hidden="true"/>
    <p>“Serai” is a Turkish / Persian word which literally means a traveller’s inn or a royal palace. Studio Seraai envisages acting as a bridge between artists and art collectors, transforming artistic creative expressions into shared cultural experiences.</p>
    <p>Hence, Studio Seraai is a temporary abode for an artwork until it finds a permanent place in the homes of art lovers and collectors.</p>
   </div>
  </section>

  <section className={s.artistInvitation} aria-labelledby="artist-invitation">
   <div className={s.artistCopy}>
    <p className={s.kicker}>CALL TO ARTISTS</p>
    <h2 id="artist-invitation">Exhibit With Us.</h2>
    <span className={s.rule} aria-hidden="true"/>
    <p>We invite and encourage all serious artists to join hands with us and exhibit their works. We endeavour to support artists so our interactions breed respect, economic benefit and professional progression.</p>
    <p>For us, art connects people, tells stories and makes a space alive. We look forward to exhibiting original works by established and emerging artists across styles and mediums, and helping work created with passion and intent find the love and care it deserves.</p>
    <p>We intend to break the economic shackles in which many Pakistani artists find themselves.</p>
    <Link className={s.cta} href="/contact?subject=Collaboration">SUBMIT YOUR PORTFOLIO <ArrowUpRight aria-hidden="true" size={17}/></Link>
   </div>
   <div className={s.criteria}>
    <p className={s.kicker}>WHAT WE ARE LOOKING FOR</p>
    <ul>{criteria.map(item=><li key={item}><Check size={18} strokeWidth={1.5} aria-hidden="true"/><span>{item}</span></li>)}</ul>
   </div>
   <div className={s.artistObject} aria-hidden="true"/>
  </section>

  <section className={s.founder} aria-labelledby="about-founder">
   <div className={s.founderImage}>
    <img src="/gallery/warm-corridor.webp" alt="Architectural gallery corridor featuring displayed artworks" loading="lazy"/>
   </div>
   <div className={s.founderCopy}>
    <p className={s.kicker}>ABOUT THE FOUNDER</p>
    <h2 id="about-founder">Dr Nasser Janjua</h2>
    <span className={s.rule} aria-hidden="true"/>
    <p>Nurturing a passion for art appreciation and collecting for over thirty years, it was only natural that, after ending his bureaucratic journey, Dr Nasser Janjua gravitated further into the art world by opening an art gallery. His intent and passion are to promote art and ensure artists receive their due share of respect and appreciation, both professionally and economically.</p>
    <Link className={s.founderLink} href="/contact">BEGIN A CONVERSATION <ArrowUpRight size={15} aria-hidden="true"/></Link>
   </div>
   <div className={s.founderAccent} aria-hidden="true"/>
  </section>
 </div></Shell>;
}