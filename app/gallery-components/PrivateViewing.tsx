'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {ArrowRight, House, Projector} from 'lucide-react';
import s from './PrivateViewing.module.css';

export default function PrivateViewing() {
  const sectionRef=useRef<HTMLElement>(null);
  const [entered,setEntered]=useState(false);
  const [motionReady,setMotionReady]=useState(false);
  useEffect(()=>{
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;
    const section=sectionRef.current;
    if(!section)return;
    const observer=new IntersectionObserver(([entry])=>{
      if(entry.isIntersecting){setEntered(true);observer.disconnect();}
    },{threshold:0.12});
    observer.observe(section);
    setMotionReady(true);
    return ()=>observer.disconnect();
  },[]);
  return (
    <section ref={sectionRef} className={s.section} data-motion={motionReady?(entered?'visible':'pending'):'off'} aria-labelledby="private-viewing-heading">
      <div className={s.inner}>
        <div className={s.copy}>
          <div className={s.eyebrow}><span>STUDIO SERAAI</span><span className={s.eyebrowRule} aria-hidden="true" /></div>
          <h2 id="private-viewing-heading">Private Viewing &amp; <em>Art Visualization</em></h2>
          <div className={s.rule} aria-hidden="true" />
          <p className={s.description}>
            Studio Seraai can visit your home or welcome you to the studio to help you preview how selected artworks will look in your space.
          </p>
          <Link className={s.cta} href="/contact?viewing=1">
            <span>Request a Private Viewing</span><ArrowRight aria-hidden="true" size={23}/>
          </Link>
        </div>
        <div className={s.collage} aria-label="Private artwork consultations at home or with Studio Seraai's in-gallery projector">
          <div className={s.homeScene}>
            <Image src="/gallery/seraai-v5-cta-home.webp" alt="Artwork visualization consultation in a warm interior" width={1200} height={900} sizes="(max-width: 700px) 90vw, 42vw" loading="lazy"/>
          </div>
          <div className={s.studioScene}>
            <Image src="/gallery/seraai-v5-cta-projector.webp" alt="Studio Seraai representative presenting an artwork placement using a projector" loading="lazy" width={1448} height={1086} sizes="(max-width: 700px) 90vw, 42vw"/>
          </div>
          <div className={s.homeBadge}><House aria-hidden="true" size={24} strokeWidth={1.6}/><span>HOME VISIT<br/>ART CONSULTATION</span></div>
          <div className={s.studioBadge}><Projector aria-hidden="true" size={25} strokeWidth={1.6}/><span>IN-GALLERY<br/>PROJECTOR VISUALIZATION</span></div>
        </div>
      </div>
      <div className={s.curve} aria-hidden="true"/>
    </section>
  );
}
