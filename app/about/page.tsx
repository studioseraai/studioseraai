import Link from 'next/link';
import Shell from '../gallery-components/shell';
import s from './OurStory.module.css';

export const metadata={
  title:'Our Story — Studio Seraai',
  description:'A Gallery Without Walls. Discover the philosophy, journey, and creative community behind Studio Seraai in Karachi.'
};

const journey=[
  {number:'01',title:'The Beginning.',text:'A belief that art deserves to be experienced beyond the conventional gallery—and that every encounter with a work can begin a conversation.'},
  {number:'02',title:'The Vision.',text:'To bring art, artists, and collectors closer together through thoughtful exhibitions, discovery, and personal experiences.'},
  {number:'03',title:'Today.',text:'A gallery without walls, connecting creative perspectives with the spaces and people that give art new meaning.'}
];
const community=[
  {title:'The Artists',note:'THE CREATIVE VOICES',image:'/gallery/studio-seraai-v4-artists-sculpture.webp',position:'center 44%'},
  {title:'Exhibitions',note:'SHARED EXPERIENCES',image:'/gallery/an-ode-to-the-masters.webp',position:'center 45%'},
  {title:'Collectors',note:'PERSONAL CONNECTIONS',image:'/gallery/studio-seraai-event-safar-e-khayal.webp',position:'center 40%'},
  {title:'Our Space',note:'KARACHI & BEYOND',image:'/gallery/warm-corridor.webp',position:'center'}
];

export default function Page(){
  return <Shell>
    <div className={s.page}>
      <section className={s.hero} aria-labelledby="story-hero-title">
        <div className={s.heroShade}/>
        <div className={s.heroCopy}>
          <p className={s.kicker}>OUR STORY</p>
          <h1 id="story-hero-title">A Gallery<br/>Without Walls.</h1>
          <p>Studio Seraai brings art, artists, and collectors into meaningful conversation—beyond the limits of a single space.</p>
        </div>
        <span className={s.heroSignature}>STUDIO SERAAI · KARACHI</span>
      </section>

      <section className={s.content} aria-label="About Studio Seraai">
        <div className={s.introduction}>
          <div className={s.introCopy}>
            <p className={s.kicker}>STUDIO SERAAI</p>
            <h2>Who We Are.</h2>
            <p>Studio Seraai is a gallery and a meeting place for art, artists, and collectors—a space for discovering new perspectives and finding a personal connection with art.</p>
            <p>We believe collecting should feel thoughtful, approachable, and deeply human. Online and in person, we invite every visitor to look closer and discover what speaks to them.</p>
          </div>
          <div className={s.introPicture}>
            <img src="/gallery/warm-collection.webp" alt="A warm gallery-inspired interior, representing the Studio Seraai aesthetic" loading="lazy"/>
            <span>ILLUSTRATIVE GALLERY IMAGE</span>
          </div>
        </div>

        <section className={s.journey} aria-labelledby="story-journey-title">
          <div className={s.sectionIntro}>
            <div><p className={s.kicker}>OUR JOURNEY</p><h2 id="story-journey-title">Our Journey.</h2></div>
            <p>It starts with a simple belief: art can create deeper connections between people, places, and ideas. Studio Seraai carries that belief into every conversation and experience.</p>
          </div>
          <div className={s.journeyGrid}>
            {journey.map(item=><article className={s.journeyItem} key={item.number}>
              <span className={s.number}>{item.number}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>)}
          </div>
        </section>

        <section className={s.community} aria-labelledby="story-community-title">
          <div className={s.sectionIntro}>
            <div><p className={s.kicker}>OUR COMMUNITY</p><h2 id="story-community-title">Who’s With Us.</h2></div>
            <p>From makers and curators to collectors and art lovers, Studio Seraai is shaped by people who believe in the power of art to connect us.</p>
          </div>
          <div className={s.communityGrid}>
            {community.map(item=><article className={s.communityCard} key={item.title}>
              <div className={s.communityImage}><img src={item.image} alt="" style={{objectPosition:item.position}} loading="lazy" decoding="async"/></div>
              <h3>{item.title}</h3>
              <p>{item.note}</p>
            </article>)}
          </div>
          <p className={s.placeholderNote}>Illustrative photographs for the current design. Official team portraits and details can be added later.</p>
        </section>
      </section>

      <section className={s.closing} aria-labelledby="story-closing-title">
        <div className={s.closingVisual}><img src="/gallery/gallery.webp" alt="A gallery interior representing the connection between art and place" loading="lazy"/></div>
        <div className={s.closingCopy}>
          <p className={s.kicker}>KARACHI & BEYOND</p>
          <h2 id="story-closing-title">Art, Connection,<br/>and Karachi.</h2>
          <p>Rooted in Karachi, open to the world. Studio Seraai celebrates the city’s creative energy while bringing art closer to people—across spaces, backgrounds, and perspectives.</p>
          <Link href="/contact" className={s.button}>GET IN TOUCH <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
    </div>
  </Shell>;
}
