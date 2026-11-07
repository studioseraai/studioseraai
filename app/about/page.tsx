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
 'Pakistani artists encouraged; everyone welcome'
];

export default function Page(){
 return <Shell><div className={s.page}>
  <section className={s.hero} aria-labelledby="about-title">
   <div className={s.heroCopy}>
    <p className={s.kicker}>ABOUT US</p>
    <h1 id="about-title">Studio Seraai</h1>
    <p className={s.heroTagline}>A GALLERY WHERE WALLS BREATHE ART.</p>
    <span className={s.rule} aria-hidden="true"/>
    <p className={s.heroDescription}>“Seraai” is a Turkish / Persian word for a traveller’s inn or royal palace. A temporary home for art, until it finds a permanent place with those who cherish it.</p>
   </div>
   <div className={s.heroImage}>
    <img src="/gallery/warm-corridor.webp" alt="Warm gallery-inspired interior with framed artworks" fetchPriority="high"/>
    <span className={s.photoCaption}>GALLERY-INSPIRED VISUAL</span>
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
    <p className={s.kicker}>OUR PURPOSE</p>
    <h2 id="about-purpose">A Bridge Between<br/>Artists and Collectors.</h2>
    <span className={s.rule} aria-hidden="true"/>
    <p>Studio Seraai transforms creative expression into shared cultural experiences — connecting artists and collectors through art that inspires, tells stories and brings spaces to life.</p>
   </div>
  </section>

  <section className={s.artistInvitation} aria-labelledby="artist-invitation">
   <div className={s.artistCopy}>
    <p className={s.kicker}>CALL TO ARTISTS</p>
    <h2 id="artist-invitation">Exhibit With Us.</h2>
    <span className={s.rule} aria-hidden="true"/>
    <p>We welcome emerging and established artists to share their original work. Our aim is to nurture lasting relationships built on respect, visibility, opportunity and professional growth.</p>
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
    <p>After more than thirty years of appreciating and collecting art, Dr Nasser Janjua founded Studio Seraai following his career as a bureaucrat. His vision is to promote art while ensuring artists receive the respect, recognition and economic appreciation they deserve.</p>
    <Link className={s.founderLink} href="/contact">BEGIN A CONVERSATION <ArrowUpRight size={15} aria-hidden="true"/></Link>
   </div>
   <div className={s.founderAccent} aria-hidden="true"/>
  </section>
 </div></Shell>;
}