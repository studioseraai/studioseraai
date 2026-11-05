'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import s from './WhatsAppConcierge.module.css';

const MESSAGE = "Hi Studio Seraai! I'd love to see how an artwork could look in my space. Can you help me choose and visualize one?";
const rawNumber = process.env.NEXT_PUBLIC_SERAAI_WHATSAPP_NUMBER || '';
const phone = rawNumber.replace(/[^0-9]/g,'');
const whatsappReady = /^\d{10,15}$/.test(phone);
const whatsappLink = whatsappReady ? 'https://wa.me/'+phone+'?text='+encodeURIComponent(MESSAGE) : '';

function WhatsAppMark(){
 return <svg viewBox="0 0 32 32" aria-hidden="true" fill="currentColor"><path d="M16 .8A15.1 15.1 0 0 0 3 23.6L.8 31.2l7.8-2.1A15.2 15.2 0 1 0 16 .8Zm0 27.4a12.2 12.2 0 0 1-6.2-1.7l-.4-.3-4.6 1.2 1.2-4.5-.3-.5A12.2 12.2 0 1 1 16 28.2Zm6.7-9.1c-.4-.2-2.3-1.1-2.7-1.2-.4-.1-.6-.2-.9.2s-1 1.2-1.2 1.4c-.2.2-.5.3-.9.1-.4-.2-1.7-.6-3.2-2-1.2-1.1-2-2.4-2.2-2.8-.2-.4 0-.6.2-.8l.7-.8.4-.6c.1-.2 0-.5 0-.7l-1.2-2.9c-.3-.7-.6-.6-.9-.6H9c-.3 0-.8.1-1.2.5s-1.6 1.6-1.6 3.8 1.6 4.4 1.8 2.9 3.9 4.3 5.4 1.9 2.6 1.6 3.6 1.5 2.1-.9 2.4-1.8 2.4-2.1c0-.3-.3-.5-.7-.7Z"/></svg>;
}
export default function WhatsAppConcierge(){
 const [open,setOpen]=useState(false);
 useEffect(()=>{
  let seen=false;
  try{seen=sessionStorage.getItem('seraai-concierge-seen')==='yes';}catch{}
  if(seen)return;
  const timer=window.setTimeout(()=>{
   setOpen(true);
   try{sessionStorage.setItem('seraai-concierge-seen','yes');}catch{}
  },4500);
  return ()=>window.clearTimeout(timer);
 },[]);
 return <aside className={s.widget} aria-label="Studio Seraai art concierge">
  {open&&<div className={s.popup} id="seraai-concierge-message">
   <button className={s.close} type="button" aria-label="Dismiss message" onClick={()=>setOpen(false)}>×</button>
   <p className={s.kicker}>STUDIO SERAAI · ART CONCIERGE</p>
   <h2>Wonder how art would look in your space?</h2>
   <p className={s.detail}>Share a photo of your wall. We'll help you imagine the perfect artwork.</p>
   {whatsappReady
    ? <a className={s.action} href={whatsappLink} target="_blank" rel="noopener noreferrer" onClick={()=>setOpen(false)}>Chat on WhatsApp <span aria-hidden="true">↗</span></a>
    : <Link className={s.action} href="/contact" onClick={()=>setOpen(false)}>Send an inquiry <span aria-hidden="true">↗</span></Link>}
  </div>}
  <button className={s.fab} type="button" aria-label={open?'Close art concierge':'Open art concierge'} aria-expanded={open} aria-controls="seraai-concierge-message" onClick={()=>setOpen(v=>!v)}><WhatsAppMark/></button>
 </aside>;
}
