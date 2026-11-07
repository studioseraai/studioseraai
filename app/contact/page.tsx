import Shell from '../gallery-components/shell';
import {MapPin,Phone,Clock3,AtSign,ExternalLink,Navigation} from 'lucide-react';
import {ViewingQuestions} from '../gallery-components/editorial';
import ContactV4Form from './ContactV4Form';
import s from './ContactV4.module.css';

export const metadata={title:'Contact & Private Viewings — Studio Seraai'};
export default async function Page({searchParams}:{searchParams:Promise<{artwork?:string;viewing?:string}>}){
  const q=await searchParams;
  return <Shell>
    <section className={s.hero} aria-labelledby="contact-title">
      <div className={s.grid}>
        <div className={s.left}>
          <p className={s.kicker}>CONTACT US</p>
          <h1 id="contact-title" className={s.heading}>Let’s Begin<em>a Conversation.</em></h1>
          <p className={s.intro}>Whether you're looking for a particular artwork, arranging a private viewing, or simply sharing an idea — we'd love to hear from you.</p>
          <div className={s.details}>
            <div className={s.detail}>
              <MapPin aria-hidden="true" className={s.detailIcon}/>
              <div><strong>OUR ADDRESS</strong><address>1st Floor, 40-C, Lane 4, Shahbaz Commercial, DHA 6, Karachi - Pakistan</address><a href="https://maps.app.goo.gl/ZFB4s8X9CwBd1M7G8" target="_blank" rel="noopener noreferrer">Get directions <ExternalLink aria-hidden="true" size={13}/></a></div>
            </div>
            <div className={s.detail}>
              <Phone aria-hidden="true" className={s.detailIcon}/>
              <div><strong>PHONE NUMBER</strong><a href="tel:+923001737224">+92 300 1737224</a></div>
            </div>
            <div className={s.detail}>
              <Clock3 aria-hidden="true" className={s.detailIcon}/>
              <div><strong>BUSINESS HOURS</strong><span>Monday – Saturday: 11 AM – 8 PM</span><span>Sunday: Closed</span></div>
            </div>
          </div>
          <div className={s.follow}>
            <p>FOLLOW US</p>
            <div className={s.socials} aria-label="Follow Studio Seraai">
              <a href="https://www.instagram.com/studioseraai_/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="2.5" y="2.5" width="19" height="19" rx="5"/><circle cx="12" cy="12" r="4.3"/><circle cx="17.8" cy="6.3" r="1" fill="currentColor" stroke="none"/></svg></a>
              <a href="https://www.youtube.com/channel/UC4sp_C-lEp9Iw82owk_uKaw" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none"/></svg></a>
              <a href="https://www.pinterest.com/studioseraai/" target="_blank" rel="noopener noreferrer" aria-label="Pinterest" className={s.socialLetter}>P</a>
              <a href="https://www.threads.com/@studioseraai_" target="_blank" rel="noopener noreferrer" aria-label="Threads"><AtSign aria-hidden="true"/></a>
              <a href="https://x.com/studioseraai" target="_blank" rel="noopener noreferrer" aria-label="X" className={s.socialLetter}>𝕏</a>
              <a href="https://www.tiktok.com/@studioseraai" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className={s.socialLetter}>♪</a>
            </div>
          </div>
        </div>
        <div className={s.divider} aria-hidden="true"/>
        <div className={s.formWrap}><ContactV4Form selectedArtwork={q.artwork} viewing={q.viewing==='1'}/></div>
      </div>
    </section>
    <section className={s.visit} aria-labelledby="visit-heading">
      <div className={s.visitHeader}>
        <div><p className={s.visitKicker}>VISIT THE GALLERY</p><h2 id="visit-heading">Find Us in Karachi.</h2><p>Shahbaz Commercial, DHA Phase 6.</p></div>
        <a className={s.directions} href="https://maps.app.goo.gl/ZFB4s8X9CwBd1M7G8" target="_blank" rel="noopener noreferrer"><Navigation size={17} aria-hidden="true"/> Open directions <ExternalLink size={14} aria-hidden="true"/></a>
      </div>
      <div className={s.mapFrame}>
        <iframe title="Map showing Studio Seraai address at Shahbaz Commercial, DHA Phase 6, Karachi" src="https://www.google.com/maps?q=1st%20Floor%2C%2040-C%2C%20Lane%204%2C%20Shahbaz%20Commercial%2C%20DHA%20Phase%206%2C%20Karachi%2C%20Pakistan&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen/>
      </div>
    </section>
    <section className={s.faq}><div className={s.faqInner}><ViewingQuestions/></div></section>
  </Shell>;
}
