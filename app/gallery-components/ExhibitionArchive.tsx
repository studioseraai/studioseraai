'use client';
import {useState} from 'react';
import Link from 'next/link';
import s from './ExhibitionArchive.module.css';

const shows=[
 {id:'ode',date:'AUGUST 2026',title:<>An Ode<br/><em>to the</em><br/>Masters</>,subtitle:'STUDIO SERAAI · KARACHI',href:'/events/an-ode-to-the-masters-2026'},
 {id:'safar',date:'05—09 SEPTEMBER 2026',title:<>Safar-e-<br/><em>Khayal</em></>,subtitle:'IRFAN AHMED · SOLO EXHIBITION',href:'/events/safar-e-khayal-2026'}
];
export default function ExhibitionArchive(){
 const [offset,setOffset]=useState(0);
 const visible=shows.map((_,i)=>shows[(i+offset)%shows.length]);
 return <section className={s.section} id="exhibitions" aria-labelledby="exhibitions-archive-title">
  <div className={s.heading}>
   <div><p className={s.kicker}>PREVIOUS EXHIBITIONS</p><h2 id="exhibitions-archive-title">From Our Archive.</h2></div>
   <Link href="/events?period=past" className={s.all}>VIEW ALL EXHIBITIONS <span aria-hidden="true">→</span></Link>
  </div>
  <div className={s.slider}>
   <button type="button" className={s.prev} aria-label="Previous exhibitions" onClick={()=>setOffset(i=>(i-1+shows.length)%shows.length)}>←</button>
   <div className={s.cards}>
    {visible.map(show=><Link key={show.id} className={s.card+' '+(show.id==='ode'?s.ode:s.safar)} href={show.href}>
      <div className={s.overlay}>
       <span className={s.date}>{show.date}</span>
       <h3>{show.title}</h3>
       <span className={s.subtitle}>{show.subtitle}</span>
       <span className={s.view}>VIEW EXHIBITION <span aria-hidden="true">→</span></span>
      </div>
     </Link>)}
   </div>
   <button type="button" className={s.next} aria-label="Next exhibitions" onClick={()=>setOffset(i=>(i+1)%shows.length)}>→</button>
  </div>
 </section>
}