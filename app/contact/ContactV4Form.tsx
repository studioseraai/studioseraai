'use client';
import {useState} from 'react';
import Link from 'next/link';
import styles from './ContactV4.module.css';

type Props={selectedArtwork?:string;viewing?:boolean};
export default function ContactV4Form({selectedArtwork,viewing=false}:Props){
  const [subject,setSubject]=useState(viewing?'Private viewing':'General inquiry');
  const [busy,setBusy]=useState(false);
  const [feedback,setFeedback]=useState('');
  const [sent,setSent]=useState(false);
  async function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    if(busy)return;
    const form=e.currentTarget;
    const fields=Object.fromEntries(new FormData(form));
    const message=String(fields.message||'').trim();
    const payload={
      name:String(fields.name||'').trim(),
      email:String(fields.email||'').trim(),
      phone:'',
      subject,
      message:subject+': '+message,
      preferred_date:fields.preferred_date||'',
      artwork_id:selectedArtwork||'',
      website:String(fields.website||''),
      consent:fields.consent==='on'
    };
    setBusy(true);setFeedback('');
    try{
      const response=await fetch('/api/gallery/inquire',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const json=await response.json() as {error?:string};
      if(!response.ok)throw new Error(json.error||'Unable to send inquiry');
      form.reset();
      setSent(true);
      setFeedback('Your message has been received. Private viewings are confirmed personally by the gallery.');
    }catch(error){
      setFeedback(error instanceof Error?error.message:'Unable to send your message. Please try again.');
    }finally{setBusy(false);}
  }
  if(sent)return <div className={styles.success} role="status">
    <h2>Thank you for reaching out.</h2>
    <p>{feedback}</p>
    <button type="button" className={styles.send} onClick={()=>{setSent(false);setFeedback('');}}>Send another message →</button>
  </div>;
  return <form className={styles.form} onSubmit={submit}>
    <label htmlFor="contact-name">YOUR NAME *</label>
    <input id="contact-name" name="name" type="text" autoComplete="name" minLength={2} maxLength={120} required/>
    <label htmlFor="contact-email">EMAIL ADDRESS *</label>
    <input id="contact-email" name="email" type="email" autoComplete="email" maxLength={254} required/>
    <label htmlFor="contact-subject">SUBJECT *</label>
    <select id="contact-subject" name="subject" value={subject} onChange={e=>setSubject(e.target.value)} required>
      <option value="General inquiry">General inquiry</option>
      <option value="Private viewing">Private viewing</option>
      <option value="Artwork inquiry">Artwork inquiry</option>
      <option value="Collaboration">Collaboration</option>
      <option value="Other">Other</option>
    </select>
    {subject==='Private viewing'&&<><label htmlFor="contact-date">PREFERRED VIEWING DATE (OPTIONAL)</label><input id="contact-date" name="preferred_date" type="date"/></>}
    <label htmlFor="contact-message">YOUR MESSAGE *</label>
    <textarea id="contact-message" name="message" rows={4} minLength={10} maxLength={4000} required/>
    <label className={styles.honeypot} aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label>
    <label className={styles.consent}><input type="checkbox" name="consent" required/><span>I agree to be contacted about my inquiry. <Link href="/privacy">Privacy information</Link>.</span></label>
    {feedback&&<p role="alert" className={styles.error}>{feedback}</p>}
    <button type="submit" disabled={busy} className={styles.send}>{busy?'SENDING…':'SEND MESSAGE'} <span aria-hidden="true">→</span></button>
    {subject==='Private viewing'&&<p className={styles.note}>Your visit is confirmed only after the gallery contacts you.</p>}
  </form>;
}
