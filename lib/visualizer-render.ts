const tintCache=new WeakMap<HTMLImageElement,{color:string;canvas:HTMLCanvasElement}>();
function tintedWall(mask:HTMLImageElement,color:string){const cached=tintCache.get(mask);if(cached?.color===color)return cached.canvas;const canvas=document.createElement('canvas');canvas.width=mask.width;canvas.height=mask.height;const ctx=canvas.getContext('2d');if(!ctx)return null;ctx.drawImage(mask,0,0);ctx.globalCompositeOperation='source-in';ctx.fillStyle=color;ctx.fillRect(0,0,canvas.width,canvas.height);tintCache.set(mask,{color,canvas});return canvas;}
export type Placement={x:number;y:number;width:number;rotation:number};
export type Scene={wallMask?:HTMLImageElement|null;wallColor?:string;wallOpacity?:number;wallPolygon?:number[][];wallSelecting?:boolean;frameWidth?:number;room:HTMLImageElement|null;clean:HTMLImageElement|null;overlay:HTMLImageElement|null;painting:HTMLImageElement|null;type:string;category:string;placement:Placement;frame:boolean;frameColor:string;shadow:boolean;region:{x:number;y:number;w:number;h:number}|null;preparing:boolean};
export function renderScene(ctx:CanvasRenderingContext2D,scene:Scene,editing:boolean){
const {room,clean,overlay,painting,type,placement,frame,frameColor,shadow,region,preparing}=scene;
const W=1600,H=1000,ready=type==='empty'||!!clean;
ctx.clearRect(0,0,W,H);const background=type==='replacement'&&clean?clean:room;
 if(background){ctx.fillStyle='#252421';ctx.fillRect(0,0,W,H);const scale=Math.min(W/background.width,H/background.height);const w=background.width*scale,h=background.height*scale;ctx.drawImage(background,(W-w)/2,(H-h)/2,w,h);}else{
 ctx.fillStyle='#292826';ctx.fillRect(0,0,W,H);ctx.fillStyle='#e9e3d6';ctx.font='24px sans-serif';ctx.fillText('Choose a room photograph to begin',480,500);
 }
 if(background&&scene.wallColor&&scene.wallMask){const tint=tintedWall(scene.wallMask,scene.wallColor);if(tint){const scale=Math.min(W/background.width,H/background.height),w=background.width*scale,h=background.height*scale;ctx.save();ctx.globalCompositeOperation='multiply';ctx.globalAlpha=scene.wallOpacity??.8;ctx.drawImage(tint,(W-w)/2,(H-h)/2,w,h);ctx.restore();}}
 else if(background&&scene.wallColor&&scene.wallPolygon?.length){
 const scale=Math.min(W/background.width,H/background.height),w=background.width*scale,h=background.height*scale,ox=(W-w)/2,oy=(H-h)/2;
 ctx.save();ctx.beginPath();scene.wallPolygon.forEach(([x,y],i)=>{if(i===0)ctx.moveTo(ox+x*w,oy+y*h);else ctx.lineTo(ox+x*w,oy+y*h);});ctx.closePath();ctx.clip();ctx.globalCompositeOperation='multiply';ctx.globalAlpha=scene.wallOpacity??.8;ctx.fillStyle=scene.wallColor;ctx.fillRect(ox,oy,w,h);ctx.restore();
 }
 if(editing&&background&&scene.wallSelecting&&scene.wallPolygon?.length){const scale=Math.min(W/background.width,H/background.height),w=background.width*scale,h=background.height*scale,ox=(W-w)/2,oy=(H-h)/2;ctx.save();ctx.beginPath();scene.wallPolygon.forEach(([x,y],i)=>{if(i===0)ctx.moveTo(ox+x*w,oy+y*h);else ctx.lineTo(ox+x*w,oy+y*h);});ctx.closePath();ctx.strokeStyle='#7dc8bc';ctx.lineWidth=4;ctx.setLineDash([10,8]);ctx.stroke();ctx.restore();}
 if(painting&&ready){const h=placement.width*painting.height/painting.width;ctx.save();ctx.translate(placement.x,placement.y);ctx.rotate(placement.rotation*Math.PI/180);if(shadow){ctx.shadowColor='rgba(0,0,0,.4)';ctx.shadowBlur=22;ctx.shadowOffsetX=10;ctx.shadowOffsetY=15;}ctx.fillStyle=frame?frameColor:'#fff';const border=frame?(scene.frameWidth??8):0;ctx.fillRect(-placement.width/2-border,-h/2-border,placement.width+border*2,h+border*2);ctx.shadowColor='transparent';ctx.drawImage(painting,-placement.width/2,-h/2,placement.width,h);if(editing){ctx.strokeStyle='#c09b50';ctx.lineWidth=2;ctx.setLineDash([8,6]);ctx.strokeRect(-placement.width/2-border-4,-h/2-border-4,placement.width+border*2+8,h+border*2+8);}ctx.restore();}
 if(overlay){const scale=Math.min(W/overlay.width,H/overlay.height);const w=overlay.width*scale,h=overlay.height*scale;ctx.drawImage(overlay,(W-w)/2,(H-h)/2,w,h);}
 if(editing&&region&&preparing){ctx.save();ctx.strokeStyle='#b78220';ctx.lineWidth=4;ctx.setLineDash([12,6]);ctx.strokeRect(region.x,region.y,region.w,region.h);ctx.restore();}
 
}
