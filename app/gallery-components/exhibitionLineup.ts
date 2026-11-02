import type {GalleryEvent} from '../../lib/gallery/types';

// Public exhibition history. Supplement live gallery events, never edit Supabase records.
// Upcoming show details are deliberately limited to the confirmed date and artist.
const curated:GalleryEvent[]=[
 {id:'sm-naqvi-november-2026',title:'S. M. Naqvi — Upcoming Exhibition',starts_at:'2026-11-17T12:00:00+05:00',venue:'Studio Seraai, Karachi',category:'Upcoming exhibition',description:'A forthcoming exhibition featuring S. M. Naqvi on 17 November 2026. Opening time and further details will be announced.'},
 {id:'safar-e-khayal-2026',title:'Safar-e-Khayal',starts_at:'2026-09-05T12:00:00+05:00',venue:'Studio Seraai, DHA Phase VI, Karachi',category:'Past exhibition',description:'Irfan Ahmed’s first solo exhibition, held 5–9 September 2026, featuring his paintings.'},
 {id:'an-ode-to-the-masters-2026',title:'An Ode to the Masters',starts_at:'2026-08-05T12:00:00+05:00',venue:'Studio Seraai, Karachi',category:'Past exhibition',description:'An inaugural group exhibition celebrating the legacy of Pakistani masters including Mashkoor Raza, Iqbal Hussain, Wahab Jaffer and Ahmed Khan.'}
];
const norm=(v:string)=>v.toLowerCase().replace(/[^a-z0-9]+/g,'');
export function exhibitionLineup(events:GalleryEvent[]):GalleryEvent[]{
 const matching=(event:GalleryEvent)=>
  /safar.?e.?khayal|safar.?e.?khyal/i.test(event.title)?'safar':
  /ode.?to.?the.?masters/i.test(event.title)?'ode':
  /(?:s\.?\s*m\.?\s*naqvi)/i.test(event.title)?'naqvi':norm(event.title);
 const seen=new Set(curated.map(matching));
 return [...curated,...events.filter(e=>!seen.has(matching(e)))].sort((a,b)=>Date.parse(b.starts_at)-Date.parse(a.starts_at));
}
