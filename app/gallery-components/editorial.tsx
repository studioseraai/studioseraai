'use client';
import {useState} from 'react';
import Link from 'next/link';
import type {Artwork} from '../../lib/gallery/types';

export function ArtistSpotlight({artworks}:{artworks:Artwork[]}) {
 const names=[...new Set(artworks.map(a=>a.artist).filter(Boolean))].slice(0,3);
 const [index,setIndex]=useState(0);
 const name=names[index];
 const works=artworks.filter(a=>a.artist===name);
 const work=works[0];
 return <section className="sg-artists-feature sg-light" aria-label="Artist spotlight">
  <div className="sg-artists-photo" key={name||'gallery'}>
   <img src={work?.photos[0]?'/api/gallery/image/'+work.photos[0].id:'/gallery/gallery.webp'} alt={work?`${work.title}, by ${name}`:'An imagined gallery interior, illustrating our curatorial direction'} loading="lazy" decoding="async"/>
   <small>{work?'SELECTED WORK · '+work.title:'GALLERY CONCEPT · STUDIO SERAAI'}</small>
  </div>
  <div className="sg-artists-copy">
   <p className="sg-kicker">OUR ARTISTS <span aria-hidden="true">—</span></p>
   <h2>The Minds Behind<br/>the Masterpieces.</h2>
   <p className="sg-serif">Every artwork begins with a human story.</p>
   {work?<div className="sg-spotlight-story" key={name}>
    <p className="sg-kicker">IN FOCUS</p><h3>{name}</h3>
    <p className="sg-artist-medium">{[...new Set(works.map(a=>a.medium).filter(Boolean))].slice(0,2).join(' · ')}</p>
    <div className="sg-rule"/><p>Look closer at {works.length===1?'a selected work':'a selection of '+works.length+' works'} by {name}. Discover the materials, dimensions, and details of each piece.</p>
    <Link className="sg-button" href={'/artists/'+encodeURIComponent(name)}>VIEW ARTIST’S WORKS ↗</Link>
   </div>:<div className="sg-spotlight-story"><div className="sg-rule"/><h3>A practice. A perspective.<br/>A world of their own.</h3><p>Meet the artists through the works they create. Our artist selection will appear as works are published.</p><Link className="sg-button" href="/artists">EXPLORE THE ARTISTS ↗</Link></div>}
   {names.length>1&&<div className="sg-spotlight-controls"><button aria-label="Previous artist" onClick={()=>setIndex((index+names.length-1)%names.length)}>←</button><span aria-live="polite" aria-atomic="true">{String(index+1).padStart(2,'0')} <i>/</i> {String(names.length).padStart(2,'0')}<span className="sg-sr-only"> · {name}</span></span><button aria-label="Next artist" onClick={()=>setIndex((index+1)%names.length)}>→</button></div>}
  </div>
 </section>;
}

export function EditorialBanner({label,title,description,kind='gallery'}:{label:string;title:string;description:string;kind?:'gallery'|'clouds'}) {
 return <section className={'sg-editorial-banner sg-editorial-'+kind}><img src={'/gallery/'+kind+'.webp'} alt="" fetchPriority="high"/><div className="sg-editorial-overlay"/><div className="sg-editorial-copy"><p className="sg-kicker">{label}</p><h1>{title}</h1><p>{description}</p></div><span className="sg-banner-caption">{kind==='gallery'?'AN IMAGINED GALLERY · AN OPEN INVITATION':'STUDIO SERAAI · KARACHI'}</span></section>;
}

export function ViewingQuestions(){return <div className="sg-faq"><p className="sg-kicker">A FEW THINGS TO KNOW</p>{[
 ['How do I arrange a private viewing?','Send an inquiry with your preferred date and the works you would like to see. Your viewing is confirmed only after the gallery contacts you.'],
 ['How can I find out the price of a work?','Use the inquiry button on the artwork page. The gallery can discuss pricing, availability, and the details of the work with you.'],
 ['Can I ask for help choosing art for my space?','Yes. Tell us about your space, the dimensions you have in mind, and the kinds of work that interest you. Start with a conversation.']
 ].map(([q,a])=><details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}</div>}
