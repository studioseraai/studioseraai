import {spawn} from 'node:child_process';
import {randomBytes,randomInt,createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const cwd=fileURLToPath(new URL('..',import.meta.url)),password=randomBytes(24).toString('hex'),port=randomInt(43000,44000),base=`http://127.0.0.1:${port}`;
const headers={authorization:'Basic '+Buffer.from('owner:'+password).toString('base64')};
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',String(port)],{cwd,env:{...process.env,VERCEL:'1',SERAAI_PASSWORD:password,SERAAI_BACKEND_URL:'',SERAAI_BACKEND_TOKEN:''},stdio:'ignore'});
try{let ready=false;for(let i=0;i<60;i++){try{if((await fetch(base+'/visualizer')).status===401){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,150));}assert.ok(ready,'production server did not start');
for(const path of ['/','/visualizer','/api/data','/api/media?id=00000000-0000-4000-8000-000000000001'])assert.equal((await fetch(base+path)).status,401);console.log('PASS protected pages, inventory API and private media reject anonymous access');
for(const page of ['Overview','Artwork Inventory','Artists','Daily Movements','Reports']){const r=await fetch(base+'/?view='+encodeURIComponent(page),{headers});assert.equal(r.status,200);assert.ok((await r.text()).includes('<strong>'+page+'</strong>'));}assert.equal((await fetch(base+'/visualizer',{headers})).status,200);for(const page of ['Photo Vault','Locations','Settings']){const r=await fetch(base+'/?view='+encodeURIComponent(page),{headers});assert.equal(r.status,200);assert.ok((await r.text()).includes('<strong>Overview</strong>'));}console.log('PASS remaining workspace entry points and removed-page fallbacks');
for(const path of ['/brand/seraai-os-logo.webp','/fonts/cormorant-garamond.woff','/fonts/manrope.woff',...['living','corridor','guest','dining','office'].flatMap(id=>['/rooms/'+id+'.webp','/rooms/'+id+'-wall.png'])]){const r=await fetch(base+path,{headers});assert.equal(r.status,200);const bytes=Buffer.from(await r.arrayBuffer()),local=await readFile(cwd+'/public'+path);assert.equal(createHash('sha256').update(bytes).digest('hex'),createHash('sha256').update(local).digest('hex'));}console.log('PASS logo, fonts and all 10 room assets match committed bytes');
assert.equal((await fetch(base+'/api/data',{headers})).status,503);console.log('PASS missing storage configuration fails closed; no external backend or production data used');
}finally{child.kill('SIGTERM');}
