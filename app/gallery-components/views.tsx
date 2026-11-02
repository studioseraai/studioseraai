import Link from 'next/link';
import type {GalleryData,GalleryEvent} from '../../lib/gallery/types';
import {Hero,ArtCard} from './interactive';
import CuratedCollectionSlider from './CuratedCollectionSlider';
import HomeArtists from './HomeArtists';
import PrivateViewing from './PrivateViewing';
import continuity from './HomeContinuity.module.css';
import {exhibitionLineup} from './exhibitionLineup';

export function Intro({label,title,description,image=false}:{label:string;title:string;description?:string;image?:boolean}){return <section className={'sg-intro '+(image?'sg-intro-image':'')}><p className="sg-kicker">{label}</p><h1>{title}</h1>{description&&<p>{description}</p>}</section>}
export function ConnectionNotice({data}:{data:GalleryData}){return data.unavailable?<p className="sg-service" role="status">The collection is temporarily unavailable. Please try again shortly.</p>:null;}
export function EventCards({events}:{events:GalleryEvent[]}){return events.length?<div className="sg-event-grid">{events.map(e=><Link className="sg-event-card" href={'/events/'+e.id} key={e.id}><div className="sg-event-visual"><span>{new Date(e.starts_at).toLocaleDateString('en-GB',{day:'2-digit',month:'short',timeZone:'Asia/Karachi'})}</span></div><div><p className="sg-kicker">{e.category}</p><h3>{e.title}</h3><p>{e.venue}</p><p className="sg-event-description">{e.description}</p><span className="sg-link">VIEW DETAILS ↗</span></div></Link>)}</div>:<div className="sg-empty sg-event-empty"><p className="sg-kicker">THE NEXT CHAPTER</p><h3>Something to look forward to.</h3><p>New exhibitions and conversations will appear here when announced.</p><Link className="sg-link" href="/contact">Stay in conversation ↗</Link></div>}
function Chapter({number,label,title,description,href,action,image,tone='light',children}:{number:string;label:string;title:React.ReactNode;description:string;href:string;action:string;image:string;tone?:string;children?:React.ReactNode}){return <section className={'wa-chapter wa-'+tone}><img className="wa-chapter-image" src={image} alt="" loading="lazy" decoding="async"/><div className="wa-chapter-shade"/><div className="wa-chapter-copy"><p className="sg-kicker">{label}</p><h2>{title}</h2><p>{description}</p><Link className="wa-action" href={href}><span>↗</span>{action}</Link></div>{children}<span className="wa-concept">ILLUSTRATIVE GALLERY CONCEPT</span></section>}
export function Home({data}:{data:GalleryData}){return <div className={"wa-home "+continuity.flow}><Hero/><CuratedCollectionSlider artworks={data.artworks}/><ConnectionNotice data={data}/><HomeArtists artworks={data.artworks}/><section className="wa-exhibitions" id="exhibitions" aria-labelledby="exhibitions-v3-heading">
 <div className="ev3-intro"><p className="sg-kicker">EXHIBITIONS & EVENTS</p><h2 id="exhibitions-v3-heading">Where Art Comes <em>Alive.</em></h2><p>Stories told through art, artists, and the spaces we share.</p></div>
 <div className="ev3-feature">
  <div className="ev3-feature-copy">
   <p className="ev3-overline">UPCOMING EXHIBITION <span>17 NOVEMBER 2026</span></p>
   <h3>S. M. Naqvi</h3>
   <p>A forthcoming exhibition at Studio Seraai, Karachi. Discover the show and inquire about a private invitation.</p>
   <div className="ev3-actions"><Link href="/events/sm-naqvi-november-2026">EXPLORE EXHIBITION <span aria-hidden="true">↗</span></Link><Link href="/contact?viewing=1">REQUEST AN INVITATION ↗</Link></div>
  </div>
  <div className="ev3-feature-art" aria-label="Exhibition announcement artwork">
   <div className="ev3-art-outline" aria-hidden="true"/>
   <div className="ev3-announcement"><span>STUDIO SERAAI</span><div className="ev3-mark" aria-hidden="true"/><strong>S. M.<br/>Naqvi</strong><small>17 NOVEMBER · 2026</small><span>AN UPCOMING EXHIBITION</span></div>
   <p>Editorial announcement · official exhibition artwork to follow</p>
  </div>
 </div>
 <div className="ev3-archive-heading"><div><p className="sg-kicker">PREVIOUS EXHIBITIONS</p><h3>From Our Archive.</h3></div><Link href="/events?period=past">VIEW ALL EXHIBITIONS ↗</Link></div>
 <div className="ev3-archive">
  <Link href="/events/safar-e-khayal-2026" className="ev3-archive-card ev3-safar"><div className="ev3-archive-art"><span>05—09 SEPTEMBER 2026</span><strong>Safar-e-<br/><em>Khayal</em></strong><small>IRFAN AHMED · SOLO EXHIBITION</small></div><div className="ev3-archive-copy"><span>PAST EXHIBITION · 2026</span><h4>Safar-e-Khayal</h4><p>Irfan Ahmed's solo exhibition at Studio Seraai, Karachi.</p><b>VIEW EXHIBITION ↗</b></div></Link>
  <Link href="/events/an-ode-to-the-masters-2026" className="ev3-archive-card ev3-ode"><div className="ev3-archive-art"><span>AUGUST 2026</span><strong>An Ode<br/><em>to the</em><br/>Masters</strong><small>STUDIO SERAAI · KARACHI</small></div><div className="ev3-archive-copy"><span>PAST EXHIBITION · 2026</span><h4>An Ode to the Masters</h4><p>A group exhibition honouring the legacy of Pakistani painters.</p><b>VIEW EXHIBITION ↗</b></div></Link>
 </div>
 </section><PrivateViewing/></div>}
export function Related({data,exclude}:{data:GalleryData;exclude:number}){const items=data.artworks.filter(a=>a.id!==exclude).slice(0,4);return items.length?<section className="sg-section sg-light"><p className="sg-kicker">CONTINUE EXPLORING</p><h2>Another way of seeing.</h2><div className="sg-grid">{items.map(a=><ArtCard key={a.id} art={a}/>)}</div></section>:null;}
