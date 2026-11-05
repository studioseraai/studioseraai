'use client';
import {useMemo,useState} from 'react';
import Link from 'next/link';
import s from './Journal.module.css';

type Story={id:string;category:string;title:string;summary:string;image:string;position?:string;featured?:boolean};
const stories:Story[]=[
 {id:'living-gallery',category:'Art & Artists',title:'The Living Gallery: How Space Shapes the Art Experience',summary:'A closer look at the dialogue between art, architecture and the human senses—and how a thoughtfully curated space can transform the way we see and connect with art.',image:'/gallery/warm-corridor.webp',featured:true},
 {id:'rise-abstraction',category:'Art & Artists',title:'The Rise of Contemporary Abstraction',summary:'Why abstraction continues to resonate with new generations of collectors and creators.',image:'/gallery/warm-collection.webp'},
 {id:'earth-form',category:'Materials & Process',title:'From Earth to Form: The Art of Material',summary:'On stone, texture, surface and the power of simple materials to tell lasting stories.',image:'/gallery/hero/seraai-v3-new-main-table.webp'},
 {id:'exhibitions',category:'Exhibitions',title:'Exhibitions as Shared Experiences',summary:'How artists, collectors and visitors create moments of connection through exhibitions.',image:'/gallery/an-ode-to-the-masters.webp'},
 {id:'masters',category:'Art & Culture',title:'The Enduring Influence of Pakistani Masters',summary:'A look at the artistic legacy that continues to inspire contemporary conversations.',image:'/gallery/an-ode-to-the-masters.webp',position:'center 30%'},
 {id:'studio-day',category:'The Studio',title:'A Day in the Studio: Process and Intuition',summary:'Exploring the gestures, decisions and quiet breakthroughs behind creative work.',image:'/gallery/studio-seraai-v4-artists-sculpture.webp',position:'center 43%'},
 {id:'gesture',category:'Art & Artists',title:'The Language of Gesture',summary:'How a simple mark can carry movement, memory and meaning.',image:'/gallery/hero/v2-cube.webp'}
];
const categories=['All','Art & Artists','Exhibitions','Materials & Process','The Studio','Art & Culture'];
const display=(story:Story)=> <article key={story.id} className={s.card}>
  <div className={s.cardImage}><img src={story.image} style={{objectPosition:story.position||'center'}} alt="" loading="lazy" decoding="async"/></div>
  <div className={s.cardBody}>
    <p className={s.category}>{story.category}</p>
    <h3>{story.title}</h3>
    <p className={s.summary}>{story.summary}</p>
    <span className={s.preview}>EDITORIAL PREVIEW · COMING SOON</span>
  </div>
</article>;
export default function JournalIndex(){
 const [category,setCategory]=useState('All');
 const [query,setQuery]=useState('');
 const filtered=useMemo(()=>stories.filter(story=>(category==='All'||story.category===category)&&(!query||[story.title,story.category,story.summary].join(' ').toLowerCase().includes(query.trim().toLowerCase()))),[category,query]);
 const featured=stories[0];
 return <div className={s.journal}>
  <section className={s.hero} aria-labelledby="seraai-journal-title">
   <div className={s.heroTint}/>
   <div className={s.heroCopy}>
     <p className={s.eyebrow}>THE JOURNAL <span aria-hidden="true"/></p>
     <h1 id="seraai-journal-title">The Seraai<br/>Journal</h1>
     <p>Art, ideas, and cultural expression — a space to explore creativity, artists, materials, and the stories that shape contemporary art today.</p>
   </div>
   <div className={s.heroObject} aria-hidden="true"><img src="/gallery/hero/v2-cube.webp" alt=""/></div>
  </section>
  <div className={s.body}>
   <div className={s.main}>
     <section className={s.featured} aria-labelledby="journal-feature-title">
       <div className={s.featurePhoto}><img src={featured.image} alt="Warm contemporary gallery interior" loading="lazy"/></div>
       <div className={s.featureCopy}>
         <p className={s.lineLabel}>FEATURED STORY <span/></p>
         <h2 id="journal-feature-title">{featured.title}</h2>
         <p>{featured.summary}</p>
         <span className={s.preview}>EDITORIAL PREVIEW · COMING SOON</span>
       </div>
     </section>
     <section className={s.latest} aria-labelledby="latest-stories-heading">
       <div className={s.sectionTitle}><h2 id="latest-stories-heading">LATEST FROM THE JOURNAL</h2><span/></div>
       <div className={s.mobileCategories} aria-label="Filter stories">
         {categories.map(c=><button type="button" key={c} aria-pressed={category===c} onClick={()=>setCategory(c)}>{c}</button>)}
       </div>
       <div className={s.cards}>
         {filtered.map(display)}
       </div>
       {!filtered.length&&<div className={s.empty}><p>No stories match that search.</p><button onClick={()=>{setCategory('All');setQuery('')}}>Clear filters</button></div>}
     </section>
   </div>
   <aside className={s.sidebar} aria-label="Journal sidebar">
     <label className={s.searchLabel} htmlFor="journal-search">Search the Journal</label>
     <div className={s.search}><span aria-hidden="true">⌕</span><input id="journal-search" type="search" placeholder="Search the Journal..." value={query} onChange={e=>setQuery(e.target.value)}/></div>
     <h2 className={s.sideHeading}>CATEGORIES</h2>
     <nav className={s.categoryList} aria-label="Journal categories">
       {categories.map(c=><button type="button" key={c} onClick={()=>setCategory(c)} aria-current={category===c?'true':undefined}><span>{c}</span><span>{c==='All'?stories.length:stories.filter(st=>st.category===c).length}</span></button>)}
     </nav>
     <h2 className={s.sideHeading}>FROM OUR ARCHIVE</h2>
     <div className={s.recent}>
       {stories.slice(1,4).map(st=><div key={st.id} className={s.recentItem}>
         <img src={st.image} alt="" loading="lazy"/><div><strong>{st.title}</strong><small>EDITORIAL PREVIEW</small></div>
       </div>)}
     </div>
     <h2 className={s.sideHeading}>FEATURED READ</h2>
     <div className={s.sideFeatured}><img src="/gallery/studio-seraai-v4-artists-sculpture.webp" alt="Sculptural hands and flowing bronze brushstroke" loading="lazy"/><h3>Abstraction as a Language</h3><p>How visual expression can speak beyond words.</p><span className={s.preview}>COMING SOON</span></div>
   </aside>
  </div>
  <section className={s.closing}>
   <div className={s.closingImage}><img src="/gallery/hero/seraai-v3-new-main-table.webp" alt="" loading="lazy"/></div>
   <div className={s.closingCopy}><p className={s.lineLabel}>JOIN THE CONVERSATION <span/></p><h2>Art Closer to You</h2><p>Discover our exhibitions, artists and ideas. The Journal is being curated; original stories will be published here soon.</p></div>
   <Link className={s.closingLink} href="/contact">GET IN TOUCH <span aria-hidden="true">↗</span></Link>
  </section>
 </div>;
}
