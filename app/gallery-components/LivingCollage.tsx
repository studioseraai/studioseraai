'use client';
import {useMemo,useState} from 'react';
import Link from 'next/link';
import {Search,Grid2X2,Rows3,ChevronDown,ArrowRight,X} from 'lucide-react';
import type {Artwork} from '../../lib/gallery/types';
import styles from './LivingCollage.module.css';

type FilterKey='medium'|'surface'|'style'|'theme'|'artist'|'status';
type Orientation='portrait'|'landscape'|'square';
const slots:{shape:Orientation;frame:string}[]=[
 {shape:'portrait',frame:'gold'},{shape:'square',frame:'ivory'},{shape:'landscape',frame:'dark'},
 {shape:'portrait',frame:'bronze'},{shape:'landscape',frame:'gold'},{shape:'square',frame:'dark'},
 {shape:'portrait',frame:'ivory'},{shape:'landscape',frame:'bronze'},{shape:'square',frame:'gold'},
 {shape:'portrait',frame:'dark'},{shape:'landscape',frame:'ivory'},{shape:'square',frame:'bronze'}
];
function orientation(a:Artwork):Orientation{
 let w=Number(a.width),h=Number(a.height);
 if(!(w>0&&h>0)){
  const m=(a.size||'').match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/i);
  if(m){w=Number(m[1]);h=Number(m[2]);}
 }
 if(w>0&&h>0){const r=w/h;if(r>1.15)return 'landscape';if(r<.87)return 'portrait';}
 return 'square';
}
function sizeGroup(a:Artwork){const w=Number(a.width),h=Number(a.height);if(w>0&&h>0){const max=Math.max(w,h);return max<60?'Small':max<=120?'Medium':'Large';}const m=(a.size||'').match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/i);if(!m)return '';const max=Math.max(Number(m[1]),Number(m[2]))*2.54;return max<60?'Small':max<=120?'Medium':'Large';}
function arrange(arts:Artwork[]){
 const pool=[...arts];const assigned:{art:Artwork;shape:Orientation;frame:string}[]=[];
 for(let i=0;i<arts.length;i++){
  const slot=slots[i%slots.length];
  const found=pool.findIndex(a=>orientation(a)===slot.shape);
  const art=pool.splice(found>=0?found:0,1)[0];
  if(art)assigned.push({art,shape:orientation(art),frame:slot.frame});
 }
 return assigned;
}
export default function LivingCollage({artworks,initialQuery='',initialArtist=''}:{artworks:Artwork[];initialQuery?:string;initialArtist?:string}){
 const [imageRatios,setImageRatios]=useState<Record<number,number>>({});
 const [query,setQuery]=useState(initialQuery),[filters,setFilters]=useState<Record<FilterKey,string>>({medium:'',surface:'',style:'',theme:'',artist:initialArtist,status:''}),[size,setSize]=useState(''),[sort,setSort]=useState('featured'),[limit,setLimit]=useState(24),[view,setView]=useState<'collage'|'grid'>('collage');
 const options=(key:FilterKey)=>[...new Set(artworks.map(a=>a[key]).filter(Boolean))].sort();
 const result=useMemo(()=>artworks.filter(a=>{
  if(query&&!([a.title,a.artist,a.medium,a.style,a.theme,a.surface,a.size].join(' ').toLowerCase().includes(query.toLowerCase())))return false;
  for(const k of Object.keys(filters) as FilterKey[]){if(filters[k]&&a[k]!==filters[k])return false;}
  return !size||sizeGroup(a)===size;
 }).sort((a,b)=>sort==='title'?a.title.localeCompare(b.title):sort==='artist'?a.artist.localeCompare(b.artist):sort==='newest'?b.id-a.id:Number(b.featured)-Number(a.featured)),[artworks,query,filters,size,sort]);
 const visible=useMemo(()=>view==='collage'?arrange(result.slice(0,limit)):result.slice(0,limit).map((art,i)=>({art,shape:orientation(art),frame:slots[i%slots.length].frame})),[result,limit,view]);
 const setFilter=(key:FilterKey,v:string)=>{setFilters(prev=>({...prev,[key]:v}));setLimit(24);};
 const reset=()=>{setQuery('');setFilters({medium:'',surface:'',style:'',theme:'',artist:'',status:''});setSize('');setLimit(24);};
 const active=Boolean(query||size||Object.values(filters).some(Boolean));
 return <div className={styles.page}>
  <div className={styles.heading}><span className={styles.eyebrow}>THE COLLECTION</span><span className={styles.line} aria-hidden="true"/><h1>Artworks</h1><p>A Curated Selection from Studio Seraai</p></div>
  <div className={styles.tools}>
   <button className={styles.allButton} type="button" onClick={reset}>All Artworks</button>
   <div className={styles.filters} aria-label="Artwork filters">
    {(['medium','surface','style','theme'] as FilterKey[]).map(key=><label className={styles.filter} key={key}><span className={styles.sr}>Filter by {key}</span><select aria-label={'Filter by '+key} value={filters[key]} onChange={e=>setFilter(key,e.target.value)}><option value="">{key[0].toUpperCase()+key.slice(1)}</option>{options(key).map(x=><option key={x} value={x}>{x}</option>)}</select><ChevronDown size={15} aria-hidden="true"/></label>)}
    <label className={styles.filter}><span className={styles.sr}>Filter by size</span><select value={size} onChange={e=>{setSize(e.target.value);setLimit(24)}} aria-label="Filter by size"><option value="">Size</option>{['Small','Medium','Large'].map(x=><option key={x} value={x}>{x}</option>)}</select><ChevronDown size={15} aria-hidden="true"/></label>
   </div>
   <div className={styles.views}>
    <button type="button" aria-label="Collage view" aria-pressed={view==='collage'} onClick={()=>setView('collage')}><Grid2X2 size={20}/></button>
    <button type="button" aria-label="Grid view" aria-pressed={view==='grid'} onClick={()=>setView('grid')}><Rows3 size={20}/></button>
   </div>
  </div>
  <div className={styles.secondary}>
   <span className={styles.count}>{result.length} ARTWORKS</span>
   <label className={styles.search}><Search size={16} aria-hidden="true"/><input type="search" aria-label="Search artworks and artists" placeholder="Search artworks, artists, or keywords..." value={query} onChange={e=>{setQuery(e.target.value);setLimit(24)}}/></label>
   <label className={styles.extra}><span className={styles.sr}>Artist</span><select aria-label="Filter by artist" value={filters.artist} onChange={e=>setFilter('artist',e.target.value)}><option value="">All artists</option>{options('artist').map(x=><option value={x} key={x}>{x}</option>)}</select></label>
   <label className={styles.extra}><span className={styles.sr}>Availability</span><select aria-label="Filter by availability" value={filters.status} onChange={e=>setFilter('status',e.target.value)}><option value="">All availability</option>{options('status').map(x=><option value={x} key={x}>{x}</option>)}</select></label>
   <label className={styles.sort}><span className={styles.sr}>Sort artworks</span><select value={sort} aria-label="Sort artworks" onChange={e=>setSort(e.target.value)}><option value="featured">Featured</option><option value="newest">Newest</option><option value="title">Title A–Z</option><option value="artist">Artist A–Z</option></select></label>
   {active&&<button className={styles.clear} onClick={reset}>Clear filters <X size={13}/></button>}
  </div>
  {visible.length?<div className={view==='collage'?styles.collage:styles.grid} aria-label="Artwork collection">
   {visible.map(({art,shape,frame},i)=>{
    const storedW=Number(art.width),storedH=Number(art.height);
    const match=(art.size||'').match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/i);
    const fallback=storedW>0&&storedH>0?storedW/storedH:match?Number(match[1])/Number(match[2]):shape==='portrait'?.72:shape==='landscape'?1.5:1;
    const ratio=imageRatios[art.id]||fallback;
    const measuredShape=ratio>1.15?'landscape':ratio<.87?'portrait':'square';
    return <Link href={'/artworks/'+art.id} className={styles.artItem} data-shape={measuredShape} data-frame={frame} key={art.id} style={{'--order':i} as React.CSSProperties}>
    <div className={styles.frame} style={{aspectRatio:String(ratio)}}><img src={art.photos[0]?.id?'/api/gallery/image/'+art.photos[0].id:''} alt={art.title} loading={i<6?'eager':'lazy'} decoding="async" onLoad={e=>{const img=e.currentTarget;const r=img.naturalWidth/img.naturalHeight;if(Number.isFinite(r)&&r>0)setImageRatios(prev=>prev[art.id]===r?prev:{...prev,[art.id]:r});}}/></div>
    <span className={styles.artDetails}><strong>{art.title}</strong><small>{art.artist||'Studio Seraai collection'}</small></span>
   </Link>})}
  </div>:<div className={styles.empty}><span className={styles.eyebrow}>THE COLLECTION</span><h2>{artworks.length?'No artworks match your selection.':'A collection, thoughtfully considered.'}</h2><p>{artworks.length?'Try another search or clear your filters.':'Our online selection is being curated. Contact the gallery to discover available works.'}</p><Link href="/contact">Inquire with the gallery <ArrowRight size={17}/></Link></div>}
  {result.length>limit&&<button className={styles.more} onClick={()=>setLimit(n=>n+24)}>Explore More Artworks <ArrowRight size={19}/></button>}
  {visible.length>0&&result.length<=limit&&<p className={styles.endNote}>EVERY WORK TELLS A STORY.</p>}
 </div>;
}
