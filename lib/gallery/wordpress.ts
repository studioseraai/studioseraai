/**
 * Optional headless WordPress content for the V3 hero.
 *
 * In the existing WordPress admin, create a published Page with slug
 * "seraai-v3-homepage". Its title becomes the hero headline and its
 * excerpt becomes the hero description. This never writes to WordPress.
 * If the API fails, the design uses its existing static fallback.
 */
export type WordPressHero = {title:string;description:string};
const endpoint='https://studioseraai.com/wp-json/wp/v2/pages?slug=seraai-v3-homepage&_fields=id,slug,status,title,excerpt&per_page=1';
function textOnly(value:unknown):string {
  if(typeof value!=='string')return '';
  return value.replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/gi,' ')
    .replace(/&amp;/gi,'&').replace(/&quot;/gi,'"')
    .replace(/&#39;|&apos;/gi,"'").replace(/&lt;/gi,'<')
    .replace(/&gt;/gi,'>').replace(/\s+/g,' ').trim().slice(0,280);
}
export async function getWordPressHero():Promise<WordPressHero|null>{
  try{
    const response=await fetch(endpoint,{
      next:{revalidate:60},
      signal:AbortSignal.timeout(3500),
      headers:{Accept:'application/json'},
    });
    if(!response.ok)return null;
    const json:unknown=await response.json();
    if(!Array.isArray(json)||!json.length)return null;
    const page=json[0];
    if(!page||typeof page!=='object'||page.status!=='publish')return null;
    const title=textOnly(page.title?.rendered);
    const description=textOnly(page.excerpt?.rendered);
    if(!title)return null;
    return {title,description};
  }catch{return null;}
}
