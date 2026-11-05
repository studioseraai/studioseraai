'use client';
import {useMemo,useState} from 'react';
import s from './Journal.module.css';

type Story={id:string;category:string;title:string;summary:string;image:string;position?:string};
const featured:Story={
 id:'language-of-texture',
 category:'Reflection',
 title:'The Language of Texture',
 summary:'How surface, material and gesture shape meaning in contemporary art.',
 image:'/gallery/warm-collection.webp',
 position:'center center'
};
const stories:Story[]=[
 {id:'ode-masters',category:'Exhibition Notes',title:'An Ode to the Masters: A Look Back',summary:'Reflections on an exhibition honoring the legacy of Pakistani masters.',image:'/gallery/an-ode-to-the-masters.webp'},
 {id:'studio-practice',category:'Artist Stories',title:'In the Studio: Process and Practice',summary:'The marks, materials and decisions behind an artist’s work.',image:'/gallery/studio-seraai-v4-artists-sculpture.webp',position:'center 40%'},
 {id:'art-everyday',category:'Reflection',title:'Why Art Belongs in Everyday Spaces',summary:'Art can bring meaning and character into the places we inhabit.',image:'/gallery/studio-seraai-v4-contact-background.webp'},
 {id:'safar',category:'Exhibition Notes',title:'Safar-e-Khayal: A Journey in Colour',summary:'Looking back at Irfan Ahmed’s solo exhibition.',image:'/gallery/studio-seraai-event-safar-e-khayal.webp'},
 {id:'living-gallery',category:'Studio Journal',title:'The Living Gallery',summary:'How architecture and art change the way we experience a collection.',image:'/gallery/warm-corridor.webp'},
 {id:'material',category:'Reflection',title:'Material, Form and Feeling',summary:'The quiet relationship between surfaces, objects and the stories they tell.',image:'/gallery/hero/seraai-v3-new-main-table.webp'}
];
const categories=['All Posts','Reflection','Artist Stories','Exhibition Notes','Studio Journal'];
const preview='EDITORIAL PREVIEW · COMING SOON';
export default function JournalIndex(){
 const [category,setCategory]=useState('All Posts');
 const [query,setQuery]=useState('');
 const filtered=useMemo(()=>stories.filter(story=>(category==='All Posts'||story.category===category)&&(!query.trim()||[story.title,story.category,story.summary].join(' ').toLowerCase().includes(query.toLowerCase().trim()))),[category,query]);
 return <div className={s.page}>
  <div className={s.waveLeft} aria-hidden="true"/><div className={s.waveRight} aria-hidden="true"/>
  <div className={s.inner}>
   <div className={s.heading}>
    <p className={s.eyebrow}>THE JOURNAL</p>
    <h1>Thoughts on Art</h1>
    <p className={s.tagline}>Stories, reflections and insights from the world of Studio Seraai.</p>
   </div>
   <section className={s.featured} aria-labelledby="journal-featured-title">
    <div className={s.featureImage}><img src={featured.image} style={{objectPosition:featured.position}} alt="Textured painting from the Studio Seraai gallery" fetchPriority="high"/></div>
    <div className={s.featureText}>
     <p className={s.kicker}>REFLECTION <span aria-hidden="true"/></p>
     <h2 id="journal-featured-title">{featured.title}</h2>
     <p className={s.summary}>{featured.summary}</p>
     <p className={s.featurePreview}>{preview}</p>
     <div className={s.dots} aria-hidden="true"><i/><i/><i/><i/></div>
    </div>
   </section>
   <div className={s.divider}/>
   <div className={s.filters} aria-label="Journal categories">
    {categories.map(c=><button type="button" key={c} aria-pressed={c===category} onClick={()=>setCategory(c)}>{c}</button>)}
   </div>
   <div className={s.searchArea}>
    <label className={s.search}><span className={s.sr}>Search journal previews</span><span aria-hidden="true">⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search stories..." type="search"/></label>
   </div>
   <section className={s.cards} aria-label="Journal stories">
    {filtered.map(story=><article className={s.card} key={story.id}>
      <div className={s.cardImage}><img src={story.image} alt="" loading="lazy" decoding="async" style={{objectPosition:story.position||'center'}}/></div>
      <div className={s.cardText}><p className={s.cardCategory}>{story.category.toUpperCase()}</p><h2>{story.title}</h2><p className={s.cardPreview}>{preview}</p></div>
     </article>)}
   </section>
   {!filtered.length&&<div className={s.empty}><p>No stories match your selection.</p><button onClick={()=>{setCategory('All Posts');setQuery('')}}>Clear filters</button></div>}
  </div>
 </div>;
}
