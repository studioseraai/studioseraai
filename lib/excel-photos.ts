import {BlobReader,BlobWriter,TextWriter,ZipReader,type Entry} from '@zip.js/zip.js';
import {XMLParser} from 'fast-xml-parser';
import {autoMap,detectHeader,parseSize} from './inventory-import.ts';
import type {GalleryRecord,GalleryPhoto} from './workspace-ui';
type Value=string|Xml|Value[];
interface Xml{[key:string]:Value|undefined}
const obj=(v:Value|undefined):Xml=>typeof v==='object'&&!Array.isArray(v)&&v!==null?v:{};
const values=(v:Value|undefined):Value[]=>v===undefined?[]:Array.isArray(v)?v:[v];
const nodes=(v:Value|undefined)=>values(v).map(obj);
const text=(v:Value|undefined):string=>typeof v==='string'?v:typeof v==='object'&&!Array.isArray(v)&&v?text(v['#text']):'';
const normal=(v:unknown)=>String(v??'').trim().replace(/\s+/g,' ').toLowerCase();
const parser=new XMLParser({ignoreAttributes:false,attributeNamePrefix:'@',removeNSPrefix:true,parseTagValue:false,parseAttributeValue:false,trimValues:false});
function xml(value:string|undefined):Xml{if(!value)return {};if(value.length>8_000_000||/<!DOCTYPE|<!ENTITY/i.test(value))throw Error('Unsupported or oversized workbook XML.');return parser.parse(value) as Xml;}
export function resolveExcelPart(source:string,target:string):string{if(!target||/[\\:]|^\/\//.test(target))return '';const parts=target.startsWith('/')?[]:source.split('/').slice(0,-1);for(const part of target.split('/')){if(part==='..'){if(!parts.length)return '';parts.pop();}else if(part&&part!=='.')parts.push(part);}const path=parts.join('/');return path.startsWith('xl/')?path:'';}
const relPath=(p:string)=>p.replace(/([^/]+)$/,'_rels/$1.rels');
function relationships(files:Record<string,string>,source:string){return new Map(nodes(obj(xml(files[relPath(source)]).Relationships).Relationship).filter(r=>text(r['@TargetMode'])!=='External').map(r=>[text(r['@Id']),resolveExcelPart(source,text(r['@Target']))]));}
function richText(node:Xml){return node.t!==undefined?text(node.t):nodes(node.r).map(r=>text(r.t)).join('');}
const colIndex=(reference:string)=>{let value=0;for(const char of reference.match(/^[A-Z]+/i)?.[0].toUpperCase()||'')value=value*26+char.charCodeAt(0)-64;return value-1;};
export type ExcelPhoto={key:string;sheet:string;row:number;path:string;title:string;artist:string;legacyInventoryId:string;originalSize:string;width?:number;height?:number};
export type PhotoMatch={photo:ExcelPhoto;artwork?:GalleryRecord;reason:string;ready:boolean;hasPhoto:boolean;reviewRequired?:boolean};
export function indexExcelPhotos(files:Record<string,string>):{photos:ExcelPhoto[];sheetNames:string[];ignored:number}{
 const shared=nodes(obj(xml(files['xl/sharedStrings.xml']).sst).si).map(richText),bookRels=relationships(files,'xl/workbook.xml');
 const metadata=obj(xml(files['xl/metadata.xml']).metadata),types=nodes(obj(metadata.metadataTypes).metadataType),richType=types.findIndex(t=>text(t['@name'])==='XLRICHVALUE')+1;
 const future=nodes(metadata.futureMetadata).find(m=>text(m['@name'])==='XLRICHVALUE'),futureBlocks=nodes(future?.bk),valueBlocks=nodes(obj(metadata.valueMetadata).bk);
 const richValues=nodes(obj(xml(files['xl/richData/rdrichvalue.xml']).rvData).rv),structures=nodes(obj(xml(files['xl/richData/rdrichvaluestructure.xml']).rvStructures).s),richRels=relationships(files,'xl/richData/richValueRel.xml'),richLinks=nodes(obj(xml(files['xl/richData/richValueRel.xml']).richValueRels).rel);
 function richImage(vm:number){const rc=nodes(valueBlocks[vm-1]?.rc).find(r=>Number(text(r['@t']))===richType);if(!rc)return '';const block=futureBlocks[Number(text(rc['@v']))],rvb=obj(obj(obj(block?.extLst).ext).rvb),rv=richValues[Number(text(rvb['@i']))];if(!rv)return '';const structure=structures[Number(text(rv['@s']))];if(text(structure?.['@t'])!=='_localImage')return '';const index=nodes(structure.k).findIndex(k=>text(k['@n'])==='_rvRel:LocalImageIdentifier');if(index<0)return '';const link=richLinks[Number(text(values(rv.v)[index]))];return richRels.get(text(link?.['@id']))||'';}
 const photos:ExcelPhoto[]=[],sheetNames:string[]=[];let ignored=0;
 for(const sheet of nodes(obj(obj(xml(files['xl/workbook.xml']).workbook).sheets).sheet)){
  const name=text(sheet['@name']),part=bookRels.get(text(sheet['@id']));if(!part||!files[part])continue;sheetNames.push(name);
  const worksheet=obj(xml(files[part]).worksheet),rows:unknown[][]=[],cells=new Map<string,Xml>();
  for(const row of nodes(obj(worksheet.sheetData).row)){const number=Number(text(row['@r']));if(number<1||number>10000)continue;const line:unknown[]=[];for(const cell of nodes(row.c)){const ref=text(cell['@r']),col=colIndex(ref);if(col<0||col>200)continue;cells.set(ref,cell);const raw=text(cell.v);line[col]=text(cell['@t'])==='s'?shared[Number(raw)]||'':text(cell['@t'])==='inlineStr'?richText(obj(cell.is)):text(cell['@t'])==='e'?'':raw;}rows[number-1]=line;}
  for(let i=0;i<rows.length;i++)rows[i]??=[];
  const h=detectHeader(rows),mapping=autoMap(rows[h]||[]),imageCol=(rows[h]||[]).findIndex(v=>/^(paintingimage|image|photo|photograph)$/i.test(String(v??'').replace(/\s/g,'')));
  const refs:{row:number;col:number;path:string}[]=[];
  for(const [ref,cell] of cells)if(cell['@vm'])refs.push({row:Number(ref.match(/\d+$/)?.[0]),col:colIndex(ref),path:richImage(Number(text(cell['@vm'])))});
  const sheetRels=relationships(files,part);
  for(const drawing of nodes(worksheet.drawing)){const path=sheetRels.get(text(drawing['@id']));if(!path)continue;const root=obj(xml(files[path]).wsDr),links=relationships(files,path);for(const anchor of [...nodes(root.oneCellAnchor),...nodes(root.twoCellAnchor)]){const from=obj(anchor.from),blip=obj(obj(obj(anchor.pic).blipFill).blip);refs.push({row:Number(text(from.row))+1,col:Number(text(from.col)),path:links.get(text(blip['@embed']))||''});}}
  const seen=new Set<string>();
  for(const ref of refs){if(mapping.title===undefined||imageCol<0||ref.col!==imageCol||ref.row<=h+1||!ref.path.startsWith('xl/media/')){ignored++;continue;}const line=rows[ref.row-1]||[],get=(field:keyof typeof mapping)=>mapping[field]===undefined?'':String(line[mapping[field]!]??'').trim();const title=get('title'),artist=get('artist');if(!title&&!artist){ignored++;continue;}const key=part+':'+ref.row+':'+ref.path;if(seen.has(key))continue;seen.add(key);const unit=/inch/i.test(String(rows[h]?.[mapping.size??-1]))?'inches':'cm',size=parseSize(get('size'),unit);photos.push({key,sheet:name,row:ref.row,path:ref.path,title,artist,legacyInventoryId:get('legacyInventoryId'),originalSize:get('size'),...size});}
 }
 return {photos,sheetNames,ignored};
}
export function matchExcelPhotos(photos:ExcelPhoto[],records:GalleryRecord[],existing:GalleryPhoto[]):PhotoMatch[]{const arts=records.filter(a=>a.kind==='artwork');const matches:PhotoMatch[]=photos.map(photo=>{const compatible=(a:GalleryRecord)=>!photo.legacyInventoryId||!a.legacyInventoryId||normal(a.legacyInventoryId)===normal(photo.legacyInventoryId);
 let found=photo.legacyInventoryId?arts.filter(a=>normal(a.legacyInventoryId)===normal(photo.legacyInventoryId)):[];
 if(!found.length)found=arts.filter(a=>compatible(a)&&a.importSheet===photo.sheet&&a.importRow===photo.row&&normal(a.title)===normal(photo.title)&&normal(a.artist)===normal(photo.artist));
 if(!found.length&&photo.title&&photo.artist&&photo.width&&photo.height)found=arts.filter(a=>compatible(a)&&normal(a.title)===normal(photo.title)&&normal(a.artist)===normal(photo.artist)&&Math.abs(Number(a.width)-photo.width!)<.01&&Math.abs(Number(a.height)-photo.height!)<.01);
 if(found.length!==1)return {photo,reason:found.length?'Multiple artwork matches — review manually':'No existing artwork matched',ready:false,hasPhoto:false};const artwork=found[0],hasPhoto=existing.some(p=>p.artwork_id===artwork.id);
 if(artwork.archived)return {photo,artwork,hasPhoto,ready:false,reason:'Artwork is archived — restore it first'};
 if(normal(artwork.title)!==normal(photo.title)||(photo.artist&&normal(artwork.artist)!==normal(photo.artist)))return {photo,artwork,hasPhoto,ready:false,reason:'Inventory reference matches, but title or artist differs'};
 return {photo,artwork,hasPhoto,ready:!hasPhoto,reason:hasPhoto?'Already has photographs — skipped':'Matched existing artwork'};
 });const counts=new Map<number,number>();for(const match of matches)if(match.ready&&match.artwork)counts.set(match.artwork.id,(counts.get(match.artwork.id)||0)+1);return matches.map(match=>match.ready&&match.artwork&&(counts.get(match.artwork.id)||0)>1?{...match,reviewRequired:true,reason:'Multiple Excel images match this artwork — choose one'}:match);}
export async function openExcelPhotos(file:Blob){if(file.size>300*1024*1024)throw Error('Choose an Excel workbook up to 300 MB.');const reader=new ZipReader(new BlobReader(file),{useWebWorkers:false});try{const entries=await reader.getEntries();if(entries.length>15000)throw Error('Workbook has too many files.');const map=new Map<string,Entry>(entries.map(e=>[e.filename,e])),files:Record<string,string>={};let total=0;for(const entry of entries){if(!entry.directory&&/^xl\/(workbook\.xml|_rels\/workbook\.xml.rels|sharedStrings\.xml|metadata\.xml|richData\/.*\.xml(?:\.rels)?|worksheets\/sheet[^/]*\.xml|worksheets\/_rels\/.*\.rels|drawings\/drawing[^/]*\.xml|drawings\/_rels\/.*\.rels)$/.test(entry.filename)){total+=entry.uncompressedSize;if(entry.uncompressedSize>8_000_000||total>32_000_000)throw Error('Workbook XML is too large.');files[entry.filename]=await entry.getData(new TextWriter());}}
 const index=indexExcelPhotos(files);return {...index,async readPhoto(path:string){const entry=map.get(path);if(!entry||entry.directory||!path.startsWith('xl/media/'))throw Error('Embedded image file is missing.');if(entry.uncompressedSize>25*1024*1024)throw Error('Image exceeds 25 MB.');const type=/\.png$/i.test(path)?'image/png':/\.jpe?g$/i.test(path)?'image/jpeg':/\.webp$/i.test(path)?'image/webp':'';if(!type)throw Error('Unsupported embedded image format.');return entry.getData(new BlobWriter(type));},close:()=>reader.close()};
 }catch(e){await reader.close();throw e;}}
