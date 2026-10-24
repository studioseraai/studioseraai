import test from 'node:test';
import assert from 'node:assert/strict';
import {renderScene} from '../lib/visualizer-render.ts';
function fixture(overrides={}){
 const calls=[];const ctx=new Proxy({}, {get:(_,name)=>(...args)=>calls.push([name,...args]),set:(_,name,value)=>{calls.push(['set',name,value]);return true;}});
 const painting={width:600,height:900}, room={width:2400,height:1200};
 const scene={room,painting,clean:null,overlay:null,type:'empty',category:'Living Room',placement:{x:700,y:330,width:300,rotation:30},frame:true,frameColor:'#b99a57',shadow:true,region:null,preparing:false,...overrides};
 return {scene,calls,ctx,painting,room};
}
test('composition preserves artwork and room proportions and rotation',()=>{
 const {ctx,scene,calls,painting,room}=fixture();renderScene(ctx,scene,false);
 assert.deepEqual(calls.find(c=>c[0]==='drawImage'&&c[1]===painting),['drawImage',painting,-150,-225,300,450]);
 assert.deepEqual(calls.find(c=>c[0]==='drawImage'&&c[1]===room),['drawImage',room,0,100,1600,800]);
 assert.ok(calls.some(c=>c[0]==='rotate'&&c[1]===Math.PI/6));
 assert.ok(calls.some(c=>c[0]==='set'&&c[1]==='shadowBlur'&&c[2]===22));
 assert.ok(calls.some(c=>c[0]==='set'&&c[1]==='fillStyle'&&c[2]===scene.frameColor));
});
test('PNG render excludes selection handles; editor includes them',()=>{
 const f=fixture();renderScene(f.ctx,f.scene,false);assert.equal(f.calls.filter(c=>c[0]==='strokeRect').length,0);
 renderScene(f.ctx,f.scene,true);assert.equal(f.calls.filter(c=>c[0]==='strokeRect').length,1);
});
test('unprepared replacement never draws new artwork over old painting',()=>{
 const f=fixture({type:'replacement'});renderScene(f.ctx,f.scene,false);assert.ok(!f.calls.some(c=>c[0]==='drawImage'&&c[1]===f.painting));
});
test('prepared replacement draws clean room then artwork then foreground',()=>{
 const clean={width:2400,height:1200},overlay={width:2400,height:1200};const f=fixture({type:'replacement',clean,overlay});renderScene(f.ctx,f.scene,false);
 assert.deepEqual(f.calls.filter(c=>c[0]==='drawImage').map(c=>c[1]),[clean,f.painting,overlay]);
});
test('frame and shadow can both be disabled',()=>{const f=fixture({frame:false,shadow:false});renderScene(f.ctx,f.scene,false);assert.ok(!f.calls.some(c=>c[0]==='set'&&c[1]==='shadowBlur'));assert.deepEqual(f.calls.find(c=>c[0]==='fillRect'&&c[1]===-150),['fillRect',-150,-225,300,450]);});
test('custom frame width preserves painting dimensions',()=>{const f=fixture({frameWidth:20,frameColor:'#d44545'});renderScene(f.ctx,f.scene,false);assert.ok(f.calls.some(c=>c[0]==='fillRect'&&c[1]===-170&&c[2]===-245&&c[3]===340&&c[4]===490));assert.ok(f.calls.some(c=>c[0]==='drawImage'&&c[1]===f.painting&&c[4]===300&&c[5]===450));});
test('custom wall region is clipped and painted before artwork',()=>{const f=fixture({wallColor:'#9ca990',wallOpacity:.75,wallPolygon:[[0,0],[1,0],[1,.6],[0,.6]]});renderScene(f.ctx,f.scene,false);const wall=f.calls.findIndex(c=>c[0]==='set'&&c[1]==='globalCompositeOperation'&&c[2]==='multiply');const artwork=f.calls.findIndex(c=>c[0]==='drawImage'&&c[1]===f.painting);assert.ok(wall>0&&wall<artwork);assert.ok(f.calls.some(c=>c[0]==='clip'));assert.ok(f.calls.some(c=>c[0]==='set'&&c[1]==='globalAlpha'&&c[2]===.75));});
test('wall tint reset leaves original room unmodified',()=>{const f=fixture({wallColor:'',wallPolygon:[[0,0],[1,0],[1,1]]});renderScene(f.ctx,f.scene,false);assert.ok(!f.calls.some(c=>c[0]==='set'&&c[1]==='globalCompositeOperation'));});
test('prepared wall mask is tinted without applying color to the original painting',()=>{const layerCalls=[];const layerCtx=new Proxy({}, {get:(_,name)=>(...args)=>layerCalls.push([name,...args]),set:(_,name,value)=>{layerCalls.push(['set',name,value]);return true;}});const layer={getContext:()=>layerCtx};const original=globalThis.document;globalThis.document={createElement:()=>layer};try{const mask={width:2400,height:1200};const f=fixture({wallMask:mask,wallColor:'#465c78'});renderScene(f.ctx,f.scene,false);assert.ok(layerCalls.some(c=>c[0]==='drawImage'&&c[1]===mask));assert.ok(layerCalls.some(c=>c[0]==='set'&&c[1]==='globalCompositeOperation'&&c[2]==='source-in'));const images=f.calls.filter(c=>c[0]==='drawImage').map(c=>c[1]);assert.deepEqual(images,[f.room,layer,f.painting]);}finally{globalThis.document=original;}});
test('multi-painting export draws every artwork in stack order with no selection guides',()=>{const a={width:900,height:600},b={width:500,height:800},overlay={width:2400,height:1200};const common={placement:{x:400,y:300,width:240,rotation:0},frame:true,frameColor:'#111111',frameWidth:10,shadow:true};const f=fixture({layers:[{id:'a',image:a,...common},{id:'b',image:b,...common,placement:{x:1100,y:350,width:200,rotation:20},frameColor:'#ffffff',shadow:false}],activeLayerId:'a',overlay});renderScene(f.ctx,f.scene,false);assert.deepEqual(f.calls.filter(c=>c[0]==='drawImage').map(c=>c[1]),[f.room,a,b,overlay]);assert.equal(f.calls.filter(c=>c[0]==='strokeRect').length,0);assert.ok(f.calls.some(c=>c[0]==='drawImage'&&c[1]===b&&c[4]===200&&c[5]===320));});
test('multi-painting editor outlines only the selected artwork',()=>{const a={width:900,height:600},b={width:500,height:800};const common={placement:{x:800,y:300,width:240,rotation:0},frame:true,frameColor:'#111111',frameWidth:10,shadow:true};const f=fixture({layers:[{id:'a',image:a,...common},{id:'b',image:b,...common}],activeLayerId:'b'});renderScene(f.ctx,f.scene,true);assert.equal(f.calls.filter(c=>c[0]==='strokeRect').length,1);assert.deepEqual(f.calls.filter(c=>c[0]==='drawImage').map(c=>c[1]),[f.room,a,b]);});
test('unprepared replacement hides all artwork layers rather than covering old art',()=>{const a={width:900,height:600},common={placement:{x:800,y:300,width:240,rotation:0},frame:true,frameColor:'#111111',frameWidth:10,shadow:true};const f=fixture({layers:[{id:'a',image:a,...common}],type:'replacement'});renderScene(f.ctx,f.scene,false);assert.ok(!f.calls.some(c=>c[0]==='drawImage'&&c[1]===a));});
