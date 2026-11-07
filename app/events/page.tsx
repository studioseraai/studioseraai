import Link from 'next/link';
import Shell from '../gallery-components/shell';
import {exhibitionLineup} from '../gallery-components/exhibitionLineup';
import {getGallery} from '../../lib/gallery/server';
import styles from './ExhibitionsEditorial.module.css';

export const metadata={
 title:'Exhibitions — Studio Seraai',
 description:'Discover past and upcoming exhibitions from Studio Seraai, Karachi.'
};
export const dynamic='force-dynamic';

const covers:Record<string,{src:string;alt:string;date:string}>={
 'an-ode-to-the-masters-2026':{
  src:'/gallery/an-ode-to-the-masters.webp',
  alt:'Original An Ode to the Masters exhibition cover',
  date:'AUGUST 2026'
 },
 'safar-e-khayal-2026':{
  src:'/gallery/studio-seraai-event-safar-e-khayal.webp',
  alt:'Original Safar-e-Khayal exhibition cover',
  date:'05 — 09 SEPTEMBER 2026'
 }
};

export default async function Page({searchParams}:{searchParams:Promise<{period?:string}>}){
 const data=await getGallery();
 const events=exhibitionLineup(data.events);
 const now=data.now||Date.now();
 const past=events.filter(e=>Date.parse(e.starts_at)<now).sort((a,b)=>Date.parse(a.starts_at)-Date.parse(b.starts_at));
 const future=events.filter(e=>Date.parse(e.starts_at)>=now).sort((a,b)=>Date.parse(a.starts_at)-Date.parse(b.starts_at));
 const {period}=await searchParams;
 const ordered=period==='past'?past:[...past,...future];
 return <Shell>
  <section className={styles.page} aria-labelledby="exhibition-page-heading">
   <div className={styles.waveLeft} aria-hidden="true"/>
   <div className={styles.waveRight} aria-hidden="true"/>
   <div className={styles.intro}>
    <p className={styles.eyebrow}>THE EXHIBITIONS</p>
    <h1 id="exhibition-page-heading">Exhibitions</h1>
    <p className={styles.subtitle}>A journey through our past and upcoming exhibitions.</p>
   </div>
   <div className={styles.list} id="exhibitions-list">
    {ordered.map((event,i)=>{
     const upcoming=Date.parse(event.starts_at)>=now;
     const cover=covers[event.id];
     const date=cover?.date||new Date(event.starts_at).toLocaleDateString('en-GB',{timeZone:'Asia/Karachi',day:'2-digit',month:'short',year:'numeric'}).toUpperCase();
     const href='/events/'+encodeURIComponent(event.id);
     return <article key={event.id} className={styles.row} data-upcoming={upcoming}>
      <Link href={href} className={styles.coverLink} aria-label={'View '+event.title}>
       {cover?<img src={cover.src} alt={cover.alt} className={styles.cover} loading={i<2?'eager':'lazy'}/>:<div className={styles.futureCover} aria-hidden="true"><span>STUDIO SERAAI</span><strong>{upcoming?'THE NEXT CHAPTER':'EXHIBITION ARCHIVE'}</strong></div>}
      </Link>
      <div className={styles.details}>
       <p className={styles.type}>{upcoming?'UPCOMING EXHIBITION':'PAST EXHIBITION'}</p>
       <h2><Link href={href}>{event.title}</Link></h2>
       <p className={styles.date}>{date}</p>
       {upcoming&&<span className={styles.soon}>COMING SOON</span>}
      </div>
      <Link href={href} className={styles.action}>View Details <span aria-hidden="true">→</span></Link>
     </article>;
    })}
    {!ordered.length&&<div className={styles.empty}><p>Exhibition announcements are being prepared.</p><Link href="/contact">Contact the gallery →</Link></div>}
   </div>
  </section>
 </Shell>;
}
