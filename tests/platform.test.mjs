import test from 'node:test';
import assert from 'node:assert/strict';
import {authorize,forward} from '../lib/platform/vercel.ts';
const originalEnv={...process.env};const originalFetch=globalThis.fetch;
const password='isolated-test-password-only';
function configure(){process.env.SERAAI_PASSWORD=password;process.env.SERAAI_BACKEND_URL='https://qa-backend.invalid/functions/v1/art-vault';process.env.SERAAI_BACKEND_TOKEN='isolated-qa-token';}
function request(method='GET',origin='https://qa-app.invalid'){return new Request('https://qa-app.invalid/api/data',{method,headers:{authorization:'Basic '+btoa('owner:'+password),origin},...(method==='POST'?{body:'{}'}:{})});}
test.afterEach(()=>{process.env={...originalEnv};globalThis.fetch=originalFetch;});
test('workspace fails closed without a configured password',()=>{delete process.env.SERAAI_PASSWORD;assert.equal(authorize(new Request('https://qa-app.invalid')).status,503);});
test('protected requests reject missing and incorrect owner credentials',()=>{configure();assert.equal(authorize(new Request('https://qa-app.invalid')).status,401);assert.equal(authorize(new Request('https://qa-app.invalid',{headers:{authorization:'Basic '+btoa('owner:wrong')}})).status,401);assert.equal(authorize(request()),null);});
test('writes reject a different Origin before contacting storage',async()=>{configure();let calls=0;globalThis.fetch=async()=>{calls++;return Response.json({ok:true});};assert.equal((await forward(request('POST','https://different.invalid'),'/api/data')).status,403);assert.equal(calls,0);});
test('missing, malformed and non-HTTPS backend configuration returns a safe configuration error',async()=>{configure();for(const value of ['', 'not a URL','http://qa-backend.invalid']){process.env.SERAAI_BACKEND_URL=value;assert.equal((await forward(request(),'/api/data')).status,503);}});
test('proxy keeps workspace credentials server-side and sends only the backend token upstream',async()=>{configure();let outgoing;globalThis.fetch=async(url,init)=>{outgoing={url:String(url),init};return Response.json({records:[],photos:[]});};const r=await forward(request(),'/api/data');assert.equal(r.status,200);assert.equal(outgoing.init.headers.get('authorization'),'Bearer isolated-qa-token');assert.ok(outgoing.url.endsWith('/functions/v1/art-vault/api/data'));assert.ok(!JSON.stringify(await r.json()).includes(password));assert.equal(r.headers.get('cache-control'),'private, no-store');});
test('upstream failure returns a safe error without credentials',async()=>{configure();globalThis.fetch=async()=>{throw Error('isolated upstream failure');};const r=await forward(request(),'/api/data');assert.equal(r.status,502);assert.ok(!(await r.text()).includes(process.env.SERAAI_BACKEND_TOKEN));});
