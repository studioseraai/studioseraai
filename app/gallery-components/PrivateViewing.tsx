import Link from 'next/link';
import s from './PrivateViewing.module.css';

export default function PrivateViewing(){
 return <section className={s.section} aria-labelledby="private-viewing-heading">
   <div className={s.copy}>
     <div className={s.label}><span>06</span><i/> PRIVATE VIEWING</div>
     <p className={s.eyebrow}>AN INVITATION TO EXPLORE</p>
     <h2 id="private-viewing-heading">A More <em>Personal</em><br/>Experience.</h2>
     <p className={s.description}>An intimate encounter with art, at your own pace. Visit Studio Seraai, discover remarkable works and find the pieces that speak to you.</p>
     <Link className={s.cta} href="/contact?viewing=1">ARRANGE A PRIVATE VIEWING <span aria-hidden="true">↗</span></Link>
     <span className={s.footnote}>STUDIO SERAAI · KARACHI</span>
   </div>
   <div className={s.gallery}>
    <div className={s.mainPhoto}><img src="/gallery/private-viewing-main.webp" onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src="/gallery/warm-corridor.webp"}} alt="Studio Seraai gallery interior" loading="lazy"/></div>
    <div className={s.secondary}><img src="/gallery/private-viewing-detail.webp" onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src="/gallery/warm-collection.webp"}} alt="Selected gallery artwork display" loading="lazy"/></div>
    <div className={s.details}><span className={s.line}/><span>THE ART OF LOOKING CLOSER</span><span>01 — 02</span></div>
   </div>
 </section>
}