import Shell from '../gallery-components/shell';
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
            <div className={s.detail}><span className={s.detailIcon} aria-hidden="true">⌖</span><span>Karachi, Pakistan</span></div>
          </div>
        </div>
        <div className={s.divider} aria-hidden="true"/>
        <div className={s.formWrap}><ContactV4Form selectedArtwork={q.artwork} viewing={q.viewing==='1'}/></div>
      </div>
    </section>
    <section className={s.faq}><div className={s.faqInner}><ViewingQuestions/></div></section>
  </Shell>;
}
