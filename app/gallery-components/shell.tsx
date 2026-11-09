'use client';
import Link from 'next/link';
import {useEffect,useRef,useState} from 'react';
import {Menu,Search,X,ArrowUpRight,AtSign,Image as ImageIcon,UsersRound,Layers3,BookOpen,Info,Mail} from 'lucide-react';
import nav from './FloatingNav.module.css';
import footer from './GlassFooter.module.css';
import WhatsAppConcierge from './WhatsAppConcierge';
const links=[['Artworks','/collections'],['Artists','/artists'],['Exhibitions','/events'],['Journal','/journal'],['Our Story','/about'],['Contact','/contact']];
const primaryLinks=[{title:'ARTWORKS',href:'/collections',Icon:ImageIcon},{title:'ARTISTS',href:'/artists',Icon:UsersRound},{title:'EXHIBITIONS',href:'/events',Icon:Layers3},{title:'JOURNAL',href:'/journal',Icon:BookOpen},{title:'ABOUT',href:'/about',Icon:Info},{title:'CONTACT US',href:'/contact',Icon:Mail}];
export default function Shell({children}:{children:React.ReactNode}){const dialog=useRef<HTMLDialogElement>(null);const [mode,setMode]=useState('menu');const [scrolled,setScrolled]=useState(false);useEffect(()=>{const sync=()=>setScrolled(window.scrollY>24);sync();window.addEventListener('scroll',sync,{passive:true});return()=>window.removeEventListener('scroll',sync);},[]);return <div className="sg wa"><a className="sg-skip" href="#gallery-main">Skip to content</a><div className={nav.shell}><div className={nav.wave} aria-hidden="true"/><header className={nav.header} data-scrolled={scrolled}>
<Link className={nav.brand} href="/" aria-label="Studio Seraai homepage"><img className={nav.brandLogo} src="/brand/studio-seraai-logo.png" alt="" aria-hidden="true"/></Link>
<nav className={nav.items} aria-label="Main navigation">
 {primaryLinks.map(({title,href,Icon})=><Link className={nav.navLink} key={href} href={href}><Icon aria-hidden="true"/><span>{title}</span></Link>)}
</nav>
<div className={nav.actions}>
 <button type="button" className={nav.iconButton} aria-label="Search artworks" onClick={()=>{setMode('search');dialog.current?.showModal();}}><Search aria-hidden="true"/></button>
 <button type="button" className={nav.iconButton+' '+nav.menuButton} aria-label="Open navigation" onClick={()=>{setMode('menu');dialog.current?.showModal();}}><Menu aria-hidden="true"/></button>
</div></header></div><dialog ref={dialog} aria-label={mode==='menu'?'Explore Studio Seraai':'Search the collection'} className="sg-dialog" onClick={e=>{if(e.target===e.currentTarget)dialog.current?.close();}}><button className="sg-icon sg-close" aria-label="Close navigation" onClick={()=>dialog.current?.close()}><X/></button>{mode==='menu'?<nav aria-label="Main navigation">{links.map(([label,url],i)=><Link key={url} href={url} onClick={()=>dialog.current?.close()}><small>0{i+1}</small>{label}<ArrowUpRight/></Link>)}<button className="sg-menu-search" onClick={()=>setMode('search')}><Search size={18}/>Search the collection</button></nav>:<form action="/collections"><label htmlFor="gallery-search">Find a work that speaks to you.</label><div className="sg-search"><input id="gallery-search" name="q" type="search" placeholder="Artwork, artist, medium…" required autoFocus/><button className="sg-icon" aria-label="Search"><Search/></button></div></form>}</dialog><main id="gallery-main">{children}</main><footer className={footer.shell} aria-label="Studio Seraai footer">
<div className={footer.wave} aria-hidden="true"/>
<div className={footer.glass}>
 <div className={footer.top}>
  <div className={footer.identity}>
   <Link href="/" className={footer.logo} aria-label="Studio Seraai home"><img className={footer.brandLogo} src="/brand/studio-seraai-logo.png" alt="" aria-hidden="true"/></Link>
   <p className={footer.tagline}>A GALLERY WHERE WALLS BREATHE ART.</p>
  </div>
  <nav className={footer.links} aria-label="Footer navigation">{links.map(([label,url])=><Link key={url} href={url}>{label}</Link>)}</nav>
 </div>
 <div className={footer.rule} aria-hidden="true"/>
 <div className={footer.lower}>
  <div className={footer.social} aria-label="Studio Seraai social media"><a href="https://www.instagram.com/studioseraai_/" target="_blank" rel="noopener noreferrer" aria-label="Studio Seraai on Instagram"><svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true"><rect x="2.5" y="2.5" width="19" height="19" rx="5"/><circle cx="12" cy="12" r="4.3"/><circle cx="17.8" cy="6.3" r="1" fill="currentColor" stroke="none"/></svg></a><a href="https://www.youtube.com/channel/UC4sp_C-lEp9Iw82owk_uKaw" target="_blank" rel="noopener noreferrer" aria-label="Studio Seraai on YouTube"><svg width={25} height={25} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none"/></svg></a><a href="https://www.pinterest.com/studioseraai/" target="_blank" rel="noopener noreferrer" aria-label="Studio Seraai on Pinterest" className={footer.socialLetter}>P</a><a href="https://www.threads.com/@studioseraai_" target="_blank" rel="noopener noreferrer" aria-label="Studio Seraai on Threads"><AtSign size={24}/></a><a href="https://x.com/studioseraai" target="_blank" rel="noopener noreferrer" aria-label="Studio Seraai on X" className={footer.socialLetter}>𝕏</a><a href="https://www.tiktok.com/@studioseraai" target="_blank" rel="noopener noreferrer" aria-label="Studio Seraai on TikTok" className={footer.socialLetter}>♪</a></div>
  <div className={footer.legal}><span>© {new Date().getFullYear()} STUDIO SERAAI</span><Link href="/privacy">PRIVACY</Link></div>
 </div>
</div>
</footer><WhatsAppConcierge/></div>}
