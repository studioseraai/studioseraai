import type {GalleryRecord} from './workspace-ui';
export const importFields = {
 legacyInventoryId:'Old inventory number', legacyWebNumber:'New web number', webId:'Web ID',
 title:'Title / Subject', artist:'Artist', size:'Size', width:'Width', height:'Height', surface:'Surface', medium:'Medium', webCode:'Web code', price:'Price (PKR)', status:'Availability', location:'Location', notes:'Notes',
} as const;
export type ImportField=keyof typeof importFields;
export type Mapping=Partial<Record<ImportField,number>>;
export type Sheet={sheet:string;data:unknown[][]};
export type ImportData={title:string;artist:string;legacyInventoryId:string;legacyWebNumber:string;webId:string;webCode:string;surface:string;medium:string;originalSize:string;width?:number;height?:number;price?:number;status:string;location:string;notes:string;importKey:string;importSource:string;importSheet:string;importRow:number};
export type PreviewRow={row:number;data:ImportData;errors:string[];warnings:string[];duplicate:boolean;possibleDuplicate:boolean};
const norm=(v:unknown)=>String(v??'').trim().replace(/\s+/g,' ').toLowerCase();
const header=(v:unknown)=>norm(v).replace(/[^a-z0-9]/g,'');
const aliases:Record<ImportField,string[]>={legacyInventoryId:['srnoinv','old srin','oldsr','inventoryid','inventorynumber','oldinventorynumber'],legacyWebNumber:['newweb'],webId:['webidno','idno','webid'],title:['titlesubject','title','subject','artworktitle'],artist:['artist','artistname'],size:['sizeinches','sizecm','size','dimensions'],width:['width','widthcm','widthinches'],height:['height','heightcm','heightinches'],surface:['surface'],medium:['medium'],webCode:['webcode'],price:['price','pricepkr','askingprice','askingpricepkr'],status:['availability','status'],location:['location','currentlocation'],notes:['notes','remarks']};
export function autoMap(row:unknown[]):Mapping{const map:Mapping={};for(const field of Object.keys(importFields) as ImportField[]){const col=row.findIndex(value=>aliases[field].map(header).includes(header(value)));if(col>=0)map[field]=col;}return map;}
export function detectHeader(data:unknown[][]){let best=0,score=0;for(let i=0;i<Math.min(30,data.length);i++){const m=autoMap(data[i]),s=Object.keys(m).length+(m.title!==undefined?5:0)+(m.artist!==undefined?3:0);if(s>score){score=s;best=i;}}return best;}
export function dimension(value:string):number|null{const cleaned=value.trim().replace(/½/g,' 1/2').replace(/¼/g,' 1/4').replace(/¾/g,' 3/4').replace(/(\d)-(\d+\/\d+)/g,'$1 $2').trim();const m=cleaned.match(/^(?:(\d+(?:\.\d+)?)\s+)?(\d+)\/(\d+)$/);const number=m?Number(m[1]||0)+Number(m[2])/Number(m[3]):/^\d+(?:\.\d+)?$/.test(cleaned)?Number(cleaned):NaN;return Number.isFinite(number)&&number>0?number:null;}
export function parseSize(raw:string,unit:'inches'|'cm'):{width:number;height:number}|null{const parts=raw.toLowerCase().replace(/\(each\)/g,'').replace(/\b(?:inches|inch|in|cm|cms)\b|["″”]/g,'').trim().split(/\s*[x×*]\s*/);if(parts.length!==2)return null;const w=dimension(parts[0]),h=dimension(parts[1]);if(w===null||h===null)return null;const scale=unit==='inches'?2.54:1;return {width:Math.round(w*scale*10000)/10000,height:Math.round(h*scale*10000)/10000};}
export function artworkSignature(a:{title?:string;artist?:string;width?:number|string;height?:number|string}){return JSON.stringify([norm(a.title),norm(a.artist),Number(a.width)||0,Number(a.height)||0]);}
export function previewImport(sheet:Sheet,headerIndex:number,mapping:Mapping,unit:'inches'|'cm',existing:GalleryRecord[],source:string):PreviewRow[]{
 const seen=new Set<string>(),keys=new Set(existing.filter(a=>a.kind==='artwork').map(a=>a.importKey).filter(Boolean)),legacyIds=new Set(existing.filter(a=>a.kind==='artwork'&&a.legacyInventoryId).map(a=>norm(a.legacyInventoryId))),signatures=new Set(existing.filter(a=>a.kind==='artwork').map(artworkSignature));
 const columns=Object.values(mapping);if(new Set(columns).size!==columns.length)throw Error('Each Excel column can be mapped to only one field.');if(mapping.title===undefined)throw Error('Map a Title / Subject column before reviewing rows.');if(sheet.data.length>10001)throw Error('A worksheet may contain up to 10,000 rows.');
 return sheet.data.slice(headerIndex+1).flatMap((cells,index)=>{
 const get=(field:ImportField)=>mapping[field]===undefined?'':String(cells[mapping[field]!]??'').trim();
 // Only mapped artwork data makes a row an import candidate; images and comparison notes are ignored.
 if(!(['title','artist','size','width','height','surface','medium','price','status','location','notes'] as ImportField[]).some(field=>get(field)))return [];
 const errors:string[]=[],warnings:string[]=[];const title=get('title'),artist=get('artist'),legacyInventoryId=get('legacyInventoryId');
 if(!title)errors.push('Title is missing');if(title.length>150||artist.length>150)errors.push('Title / artist must be 150 characters or fewer');if(legacyInventoryId.length>100)errors.push('Old inventory number is too long');
 let size:ReturnType<typeof parseSize>=null;const originalSize=get('size')||(get('width')||get('height')?get('width')+' × '+get('height'):'');
 if(originalSize){size=parseSize(originalSize,unit);if(!size)errors.push('Size could not be read; use width × height');else if(size.width>1e6||size.height>1e6)errors.push('Dimensions are too large');}else warnings.push('Dimensions missing');
 const rawPrice=get('price');let price:number|undefined;if(rawPrice&&!/^(sold|reserved)$/i.test(rawPrice)){const cleaned=rawPrice.replace(/^(?:PKR|RS\.?)\s*/i,'').replace(/,/g,'').trim();if(!/^\d+(?:\.\d+)?$/.test(cleaned)||(!Number.isFinite(Number(cleaned))||Number(cleaned)>1e15))errors.push('Price must be a non-negative PKR amount');else price=Number(cleaned);}else warnings.push('Price missing');
 const priceStatus=/^(sold|reserved)$/i.test(rawPrice)?rawPrice:'';if(priceStatus)warnings.push('Price cell records '+priceStatus+'; price left blank');const rawStatus=get('status')||priceStatus,status=['Available','Reserved','Sold'].find(s=>norm(s)===norm(rawStatus))||'';if(rawStatus&&!status)errors.push('Availability must be Available, Reserved or Sold');if(!status)warnings.push('Availability not recorded');if(!artist)warnings.push('Artist missing');if(!get('location'))warnings.push('Location not recorded');
 const row=headerIndex+index+2;const data:ImportData={title,artist,legacyInventoryId,legacyWebNumber:get('legacyWebNumber'),webId:get('webId'),webCode:get('webCode'),surface:get('surface'),medium:get('medium'),originalSize:originalSize?originalSize+' '+unit:'',...size,...(price!==undefined?{price}:{}),status,location:get('location'),notes:get('notes'),importKey:'',importSource:source,importSheet:sheet.sheet,importRow:row};
 data.importKey=legacyInventoryId?'legacy:'+norm(legacyInventoryId):'artwork:'+artworkSignature(data);
 const duplicate=seen.has(data.importKey)||keys.has(data.importKey)||(!!legacyInventoryId&&legacyIds.has(norm(legacyInventoryId)));seen.add(data.importKey);
 const possibleDuplicate=!duplicate&&signatures.has(artworkSignature(data));if(possibleDuplicate)warnings.push('Similar title, artist and size already in inventory');if(duplicate)warnings.push('Duplicate inventory number or previously imported artwork');
 return [{row,data,errors,warnings,duplicate,possibleDuplicate}];
 });
}
