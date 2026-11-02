import Link from 'next/link';
import s from './PrivateViewing.module.css';

export default function PrivateViewing(){
 return <section className={s.section} aria-labelledby="private-viewing-heading">
   <div className={s.arch} aria-hidden="true"/>
   <div className={s.copy}>
     <p className={s.label}><span/>REQUEST A<span/></p>
     <h2 id="private-viewing-heading">Private View</h2>
     <p className={s.description}>Experience a curated selection of works in a<br className={s.desktopBreak}/> personal and focused setting at Studio Seraai.</p>
     <Link className={s.cta} href="/contact?viewing=1">REQUEST A PRIVATE VIEW <span aria-hidden="true">→</span></Link>
   </div>
   <div className={s.scene} aria-hidden="true">
     <div className={s.bench}>
       <div className={s.top}>
         <div className={s.booksLeft}><i/><i/><i/></div>
         <div className={s.notebook}/>
         <div className={s.booksRight}><i/><i/><i/></div>
       </div>
       <div className={s.leftLeg}/><div className={s.rightLeg}/>
     </div>
   </div>
 </section>;
}