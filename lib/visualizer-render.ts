export type Placement={x:number;y:number;width:number;rotation:number};
export type Scene={room:HTMLImageElement|null;clean:HTMLImageElement|null;overlay:HTMLImageElement|null;painting:HTMLImageElement|null;type:string;category:string;placement:Placement;frame:boolean;frameColor:string;shadow:boolean;region:{x:number;y:number;w:number;h:number}|null;preparing:boolean};
export function renderScene(ctx:CanvasRenderingContext2D,scene:Scene,editing:boolean){
const {room,clean,overlay,painting,type,category,placement,frame,frameColor,shadow,region,preparing}=scene;
const W=1600,H=1000,ready=type==='empty'||!!clean;
ctx.clearRect(0,0,W,H);const background=type==='replacement'&&clean?clean:room;
 if(background){ctx.fillStyle='#252421';ctx.fillRect(0,0,W,H);const scale=Math.min(W/background.width,H/background.height);const w=background.width*scale,h=background.height*scale;ctx.drawImage(background,(W-w)/2,(H-h)/2,w,h);}else{
 ctx.fillStyle=category==='Gallery'?'#e9e5df':'#d4c9b9';ctx.fillRect(0,0,W,800);ctx.fillStyle='#aa9279';ctx.fillRect(0,800,W,200);ctx.fillStyle='#e7ddd0';ctx.fillRect(0,785,W,15);ctx.fillStyle='#aaa092';ctx.fillRect(270,650,1060,170);ctx.fillStyle='#bab0a2';ctx.fillRect(300,625,1000,145);ctx.fillStyle='#63584b';ctx.fillRect(310,810,25,60);ctx.fillRect(1260,810,25,60);ctx.fillStyle='#eee7dc';ctx.fillRect(380,635,170,100);ctx.fillRect(1050,635,170,100);ctx.fillStyle='#736d56';ctx.fillRect(1370,540,90,240);ctx.fillStyle='#58654b';ctx.beginPath();ctx.ellipse(1410,480,85,150,-.3,0,Math.PI*2);ctx.fill();ctx.fillStyle='#756c5e';ctx.font='20px sans-serif';ctx.fillText('ILLUSTRATED DEMONSTRATION ROOM · APPROXIMATE SCALE',45,955);
 }
 if(painting&&ready){const h=placement.width*painting.height/painting.width;ctx.save();ctx.translate(placement.x,placement.y);ctx.rotate(placement.rotation*Math.PI/180);if(shadow){ctx.shadowColor='rgba(0,0,0,.4)';ctx.shadowBlur=22;ctx.shadowOffsetX=10;ctx.shadowOffsetY=15;}ctx.fillStyle=frame?frameColor:'#fff';const border=frame?8:0;ctx.fillRect(-placement.width/2-border,-h/2-border,placement.width+border*2,h+border*2);ctx.shadowColor='transparent';ctx.drawImage(painting,-placement.width/2,-h/2,placement.width,h);if(editing){ctx.strokeStyle='#c09b50';ctx.lineWidth=2;ctx.setLineDash([8,6]);ctx.strokeRect(-placement.width/2-border-4,-h/2-border-4,placement.width+border*2+8,h+border*2+8);}ctx.restore();}
 if(overlay){const scale=Math.min(W/overlay.width,H/overlay.height);const w=overlay.width*scale,h=overlay.height*scale;ctx.drawImage(overlay,(W-w)/2,(H-h)/2,w,h);}
 if(editing&&region&&preparing){ctx.save();ctx.strokeStyle='#b78220';ctx.lineWidth=4;ctx.setLineDash([12,6]);ctx.strokeRect(region.x,region.y,region.w,region.h);ctx.restore();}
 
}
