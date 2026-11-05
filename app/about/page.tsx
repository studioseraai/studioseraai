import Link from 'next/link';
import {Boxes,Layers3,HeartHandshake} from 'lucide-react';
import Shell from '../gallery-components/shell';
import s from './OurStory.module.css';

export const metadata={
 title:'About Us — Studio Seraai',
 description:'Studio Seraai is a contemporary art gallery from Karachi. Discover, exhibit and connect with art beyond the gallery walls.'
};
const principles=[
 {title:'Discover',copy:'Emerging and established artists across diverse practices.',Icon:Boxes},
 {title:'Exhibit',copy:'Curated shows that spark dialogue and new perspectives.',Icon:Layers3},
 {title:'Connect',copy:'Art, artists and audiences beyond physical boundaries.',Icon:HeartHandshake}
];

export default function Page(){
 return <Shell><div className={s.page}>
  <section className={s.hero} aria-labelledby="about-hero-title">
   <div className={s.heroWave} aria-hidden="true"/>
   <div className={s.heroContent}>
    <p className={s.kicker}>ABOUT US</p>
    <h1 id="about-hero-title">Studio Seraai</h1>
    <p className={s.heroTagline}>A Gallery Without Walls.</p>
    <span className={s.smallRule} aria-hidden="true"/>
    <p className={s.heroDescription}>Studio Seraai is a contemporary art gallery from Karachi, committed to discovering, exhibiting and representing exceptional art from Pakistan and beyond.</p>
    <span className={s.smallRule} aria-hidden="true"/>
   </div>
   <div className={s.heroVisual}>
    <img src="/gallery/warm-corridor.webp" alt="Warm gallery-inspired architectural interior with exhibited art" fetchPriority="high"/>
    <span className={s.visualNote}>GALLERY-INSPIRED VISUAL</span>
   </div>
  </section>
  <section className={s.principles} aria-label="What we do">
   {principles.map(({title,copy,Icon})=><article className={s.principle} key={title}>
    <Icon aria-hidden="true" strokeWidth={1.2}/>
    <h2>{title}</h2>
    <p>{copy}</p>
   </article>)}
  </section>
  <section className={s.philosophy} aria-labelledby="about-philosophy-heading">
   <div className={s.artVisual}>
    <img src="/gallery/warm-collection.webp" alt="Textural artwork and gallery setting representing Studio Seraai's art philosophy" loading="lazy"/>
    <div className={s.emptyFrame} aria-hidden="true"/>
   </div>
   <div className={s.philosophyCopy}>
    <p className={s.kicker}>OUR PHILOSOPHY</p>
    <h2 id="about-philosophy-heading">Art Belongs<br/>Everywhere.</h2>
    <span className={s.smallRule} aria-hidden="true"/>
    <p>We believe art is not confined to a single place. It lives in homes, workplaces, public spaces and in the everyday lives of people who connect with it.</p>
    <span className={s.smallRule} aria-hidden="true"/>
   </div>
  </section>
  <section className={s.karachi} aria-labelledby="about-karachi-heading">
   <div className={s.karachiWave} aria-hidden="true"/>
   <p className={s.kicker}>OUR HOME</p>
   <h2 id="about-karachi-heading">Karachi</h2>
   <p>A city of stories, people and a living art culture.</p>
   <Link className={s.contact} href="/contact">BEGIN A CONVERSATION <span aria-hidden="true">↗</span></Link>
  </section>
 </div></Shell>;
}
