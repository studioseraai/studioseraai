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
   <img src={work?.photos[0]?'/api/gallery/image/'+work.photos[0].id:'/gallery/warm-corridor.webp'} alt={work?`${work.title}, by ${name}`:'An imagined gallery interior, illustrating our curatorial direction'} loading="lazy" decoding="async"/>
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
 return <section className={'sg-editorial-banner sg-editorial-'+kind}><img src={kind==='gallery'?'/gallery/warm-corridor.webp':'/gallery/warm-collection.webp'} alt="" fetchPriority="high"/><div className="sg-editorial-overlay"/><div className="sg-editorial-copy"><p className="sg-kicker">{label}</p><h1>{title}</h1><p>{description}</p></div><span className="sg-banner-caption">{kind==='gallery'?'AN IMAGINED GALLERY · AN OPEN INVITATION':'STUDIO SERAAI · KARACHI'}</span></section>;
}

const viewingFaqGroups=[
 {title:'Collecting & Viewing',items:[
  ['What is Studio Seraai?','Studio Seraai is a Karachi art gallery connecting artists and collectors through original artworks and shared cultural experiences.'],
  ['How can I explore the artworks?','Browse our online collection. Artwork pages include available details such as the artist, medium, surface, style, theme and dimensions.'],
  ['Are the artworks original?','Studio Seraai presents original artworks. For details or supporting documentation about a specific piece, please contact us.'],
  ['How do I ask about an artwork’s price or availability?','Use the inquiry option on the artwork page or contact Studio Seraai directly. Our team can provide details about the piece.'],
  ['Can I see an artwork in person before deciding?','Contact us to discuss viewing an artwork at the gallery. We’ll help arrange a suitable visit.'],
  ['What is the Art Visualization experience?','At the gallery, we can use a projector to help you preview how selected artworks could look in your space.'],
  ['Can Studio Seraai visit my home?','Yes. You can request a home consultation to explore artwork placement in your space.'],
  ['How do I arrange a viewing or consultation?','Contact us by phone or through the website and tell us whether you prefer an in-gallery projector session or a home visit.']
 ]},
 {title:'For Artists',items:[
  ['Can artists submit their work to Studio Seraai?','Yes. We welcome serious artists interested in exhibiting their work with us.'],
  ['Which artists can get in touch?','We welcome established and emerging artists. Pakistani artists are encouraged to contact us, and artists from elsewhere are welcome too.'],
  ['Which styles and mediums do you consider?','All styles and mediums are welcome.'],
  ['What should I include when contacting you about exhibiting?','Share a short introduction and information about your artistic practice. You can include portfolio images or a link to your work.']
 ]},
 {title:'Purchases & Artwork Care',items:[
  ['What payment methods do you accept?','Please contact us about the specific artwork. We’ll confirm the accepted payment options and applicable terms directly.'],
  ['Do you deliver artworks, and what does delivery cost?','Contact us before confirming a purchase to ask whether delivery is available for your destination and to confirm the cost and arrangements.'],
  ['Can I return or exchange an artwork?','Please contact Studio Seraai before purchase to confirm the return or cancellation terms that apply to the specific artwork.']
 ]}
];
export function ViewingQuestions(){return <div className="sg-faq">
 <p className="sg-kicker">A FEW THINGS TO KNOW</p>
 {viewingFaqGroups.map(group=><section className="sg-faq-group" key={group.title} aria-label={group.title}>
  <h2>{group.title}</h2>
  {group.items.map(([q,a])=><details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}
 </section>)}
</div>}
