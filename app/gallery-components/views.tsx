import Link from 'next/link';
import type {GalleryData,GalleryEvent} from '../../lib/gallery/types';
import type {WordPressHero} from '../../lib/gallery/wordpress';
import {Hero,ArtCard} from './interactive';
import CuratedCollectionSlider from './CuratedCollectionSlider';
import HomeArtists from './HomeArtists';
import PrivateViewing from './PrivateViewing';
import ExhibitionArchive from './ExhibitionArchive';
import continuity from './HomeContinuity.module.css';
import {exhibitionLineup} from './exhibitionLineup';

export function Intro({label,title,description,image=false}:{label:string;title:string;description?:string;image?:boolean}){return <section className={'sg-intro '+(image?'sg-intro-image':'')}><p className="sg-kicker">{label}</p><h1>{title}</h1>{description&&<p>{description}</p>}</section>}
export function ConnectionNotice({data}:{data:GalleryData}){return data.unavailable?<p className="sg-service" role="status">The collection is temporarily unavailable. Please try again shortly.</p>:null;}
export function EventCards({events}:{events:GalleryEvent[]}){return events.length?<div className="sg-event-grid">{events.map(e=><Link className="sg-event-card" href={'/events/'+e.id} key={e.id}><div className="sg-event-visual" style={
  e.id==='safar-e-khayal-2026'
    ? {backgroundImage:"linear-gradient(0deg,rgba(40,24,14,.33),rgba(40,24,14,.08)),url('/gallery/studio-seraai-event-safar-e-khayal.webp')",backgroundPosition:'center 37%'}
    : e.id==='an-ode-to-the-masters-2026'
      ? {backgroundImage:"linear-gradient(0deg,rgba(40,24,14,.33),rgba(40,24,14,.08)),url('/gallery/an-ode-to-the-masters.webp')",backgroundPosition:'center 48%'}
      : undefined
}><span>{new Date(e.starts_at).toLocaleDateString('en-GB',{day:'2-digit',month:'short',timeZone:'Asia/Karachi'})}</span></div><div><p className="sg-kicker">{e.category}</p><h3>{e.title}</h3><p>{e.venue}</p><p className="sg-event-description">{e.description}</p><span className="sg-link">VIEW DETAILS ↗</span></div></Link>)}</div>:<div className="sg-empty sg-event-empty"><p className="sg-kicker">THE NEXT CHAPTER</p><h3>Something to look forward to.</h3><p>New exhibitions and conversations will appear here when announced.</p><Link className="sg-link" href="/contact">Stay in conversation ↗</Link></div>}
function Chapter({number,label,title,description,href,action,image,tone='light',children}:{number:string;label:string;title:React.ReactNode;description:string;href:string;action:string;image:string;tone?:string;children?:React.ReactNode}){return <section className={'wa-chapter wa-'+tone}><img className="wa-chapter-image" src={image} alt="" loading="lazy" decoding="async"/><div className="wa-chapter-shade"/><div className="wa-chapter-copy"><p className="sg-kicker">{label}</p><h2>{title}</h2><p>{description}</p><Link className="wa-action" href={href}><span>↗</span>{action}</Link></div>{children}<span className="wa-concept">ILLUSTRATIVE GALLERY CONCEPT</span></section>}
export function Home({data,heroCopy}:{data:GalleryData;heroCopy:WordPressHero|null}){return <div className={"wa-home "+continuity.flow}><Hero copy={heroCopy} artworks={data.artworks} heroArtworkId={data.homepageContent?.heroArtworkId||undefined} heroArtworkIds={data.homepageContent?.heroArtworkIds}/><CuratedCollectionSlider key={(data.homepageContent?.collectionArtworkIds||[]).join('-')} artworks={data.artworks} selectedArtworkIds={data.homepageContent?.collectionArtworkIds}/><ConnectionNotice data={data}/><HomeArtists artworks={data.artworks}/><ExhibitionArchive/><PrivateViewing/></div>}
export function Related({data,exclude}:{data:GalleryData;exclude:number}){const items=data.artworks.filter(a=>a.id!==exclude).slice(0,4);return items.length?<section className="sg-section sg-light"><p className="sg-kicker">CONTINUE EXPLORING</p><h2>Another way of seeing.</h2><div className="sg-grid">{items.map(a=><ArtCard key={a.id} art={a}/>)}</div></section>:null;}
