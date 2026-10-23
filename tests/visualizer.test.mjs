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
