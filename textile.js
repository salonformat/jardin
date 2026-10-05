import {drawMotif,painterFor} from './motif-model.js';
import {Garden,INKS} from './garden.js';
export const GROUNDS=['#f6f1e5','#efc5ca','#efd37f'];
// A single seamless tile is shared by the flying cloth, experiments and downloads.
export function makeTile(design,size=600){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=size;const ctx=canvas.getContext('2d');
 ctx.fillStyle=GROUNDS[design.ground||0];ctx.fillRect(0,0,size,size);
 const painter=painterFor(ctx);
 if(Array.isArray(design.motifs)){for(const m of design.motifs)for(let y=-1;y<=1;y++)for(let x=-1;x<=1;x++)drawMotif(painter,m,size,(m.x+x)*size,(m.y+y)*size);return canvas;}
 const n=design.scale?2:4,step=size/n,r=step*.25;
 for(let row=-1;row<=n;row++)for(let col=-1;col<=n;col++){
 const x=col*step+step*.5+(design.layout&&Math.abs(row)%2?step*.5:0),y=row*step+step*.3;
 painter.textileMotif(x,y,r,INKS[design.palette]);
 }
 return canvas;
}
export async function downloadPattern(design,large=false){
 const tile=makeTile(design),out=large?document.createElement('canvas'):tile;
 if(large){out.width=out.height=2400;const ctx=out.getContext('2d');ctx.fillStyle=ctx.createPattern(tile,'repeat');ctx.fillRect(0,0,2400,2400);}
 const blob=await new Promise(resolve=>out.toBlob(resolve,'image/png'));if(!blob)throw Error('Export failed');
 const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=large?'un-jardin-a-soi-tissu.png':'un-jardin-a-soi-motif.png';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),15000);
}
export class Textile{
 constructor(canvas,{design,paused=false,flat=false,reveal=false}={}){
 this.canvas=canvas;this.ctx=canvas.getContext('2d');this.design={...design};this.paused=paused;this.flat=flat;this.reveal=reveal;this.time=0;this.zoom=0;this.targetZoom=0;this.pointer=0;this.tile=makeTile(design);this.texture=document.createElement('canvas');this.texture.width=this.texture.height=1200;this.litTexture=document.createElement('canvas');this.litTexture.width=this.litTexture.height=1200;this.paintTexture();
 this.resize=()=>{const rect=canvas.getBoundingClientRect();this.w=rect.width;this.h=rect.height;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=this.w*dpr;canvas.height=this.h*dpr;this.ctx.setTransform(dpr,0,0,dpr,0,0);this.draw();};this.observer=new ResizeObserver(this.resize);this.observer.observe(canvas);
 this.move=e=>{this.pointer=(e.clientX-canvas.getBoundingClientRect().left)/this.w-.5;};canvas.addEventListener('pointermove',this.move);
 this.tick=now=>{if(this.dead)return;const dt=Math.min((now-(this.last||now))/1000,.04);this.last=now;if(!document.hidden&&!this.paused){this.time+=dt;this.zoom+=(this.targetZoom-this.zoom)*dt*3;this.draw();}this.frame=requestAnimationFrame(this.tick);};this.frame=requestAnimationFrame(this.tick);
 }
 paintTexture(){const c=this.texture.getContext('2d');c.fillStyle=c.createPattern(this.tile,'repeat');c.fillRect(0,0,1200,1200);c.lineWidth=.65;for(let n=0;n<1200;n+=4){c.strokeStyle=n%8?'#6453450c':'#ffffff26';c.beginPath();c.moveTo(n,0);c.lineTo(n,1200);c.moveTo(0,n);c.lineTo(1200,n);c.stroke();}}
 set({paused,design,zoom}={}){if(paused!==undefined)this.paused=paused;if(design){this.design={...design};this.tile=makeTile(design);this.paintTexture();}if(zoom!==undefined)this.targetZoom=zoom;if(this.paused)this.zoom=this.targetZoom;this.draw();}
 point(u,v){const w=this.w,h=this.h,t=this.paused?0:this.time;
 const entry=this.paused?1:Math.min(1,this.time/2.2);const arrive=1-Math.pow(1-entry,3);
 const scale=(this.flat?.86:.77)*(1+this.zoom*1.65)*(.75+.25*arrive);
 const side=Math.min(w,h*1.05)*scale;
 const wave=Math.sin(u*8+v*3-t*1.2)*.085+Math.sin(v*9-u*2+t*.8)*.035;
 const z=wave*(this.flat?.25:1),perspective=1/(1+z*.7);
 const angle=this.flat?-.05:-.13+Math.sin(t*.22)*.055+this.pointer*.07;
 let x=(u-.5)*side*perspective,y=(v-.5)*side*perspective+z*side*.65;
 return {x:w*.5+x*Math.cos(angle)-y*Math.sin(angle),y:h*.48+x*Math.sin(angle)+y*Math.cos(angle)+(1-arrive)*h*.12,z};
 }
 triangle(a,b,c,ta,tb,tc){const ctx=this.ctx;
 const cx=(a.x+b.x+c.x)/3,cy=(a.y+b.y+c.y)/3;const expand=p=>{const dx=p.x-cx,dy=p.y-cy,d=Math.hypot(dx,dy);return {x:p.x+dx/d*.7,y:p.y+dy/d*.7};};const aa=expand(a),bb=expand(b),cc=expand(c);ctx.save();ctx.beginPath();ctx.moveTo(aa.x,aa.y);ctx.lineTo(bb.x,bb.y);ctx.lineTo(cc.x,cc.y);ctx.closePath();ctx.clip();
 const den=ta.x*(tb.y-tc.y)+tb.x*(tc.y-ta.y)+tc.x*(ta.y-tb.y);
 const f=(p,q,r)=>[(p*(tb.y-tc.y)+q*(tc.y-ta.y)+r*(ta.y-tb.y))/den,(p*(tc.x-tb.x)+q*(ta.x-tc.x)+r*(tb.x-ta.x))/den,(p*(tb.x*tc.y-tc.x*tb.y)+q*(tc.x*ta.y-ta.x*tc.y)+r*(ta.x*tb.y-tb.x*ta.y))/den];
 const x=f(a.x,b.x,c.x),y=f(a.y,b.y,c.y);ctx.transform(x[0],y[0],x[1],y[1],x[2],y[2]);ctx.drawImage(this.litTexture,0,0);ctx.restore();
 }
 draw(){if(!this.w||!this.h)return;const ctx=this.ctx,w=this.w,h=this.h;ctx.clearRect(0,0,w,h);
 const lightContext=this.litTexture.getContext('2d');lightContext.drawImage(this.texture,0,0);
 const light=lightContext.createLinearGradient(0,0,1200,0),time=this.paused?0:this.time;
 for(let i=0;i<=32;i++)light.addColorStop(i/32,`rgba(27,31,26,${.08+.065*Math.cos(i/32*8-time*1.2)})`);
 lightContext.fillStyle=light;lightContext.fillRect(0,0,1200,1200);
 const N=24,grid=[];for(let j=0;j<=N;j++){grid[j]=[];for(let i=0;i<=N;i++)grid[j][i]=this.point(i/N,j/N);}
 // The shadow anchors a visibly free edge; pattern and folds share the same mesh.
 ctx.save();ctx.filter='blur(22px)';ctx.fillStyle='#071b1940';ctx.beginPath();const first=grid[0][0];ctx.moveTo(first.x+15,first.y+38);for(let i=1;i<=N;i++)ctx.lineTo(grid[0][i].x+15,grid[0][i].y+38);for(let j=1;j<=N;j++)ctx.lineTo(grid[j][N].x+15,grid[j][N].y+38);for(let i=N-1;i>=0;i--)ctx.lineTo(grid[N][i].x+15,grid[N][i].y+38);for(let j=N-1;j>=0;j--)ctx.lineTo(grid[j][0].x+15,grid[j][0].y+38);ctx.fill();ctx.restore();
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){
 const unfolding=this.reveal&&!this.paused?Math.min(1,Math.max(0,(this.time-.7)/3.5)):1;const extent=.5+.5*(1-Math.pow(1-unfolding,3));
 const a=grid[j][i],b=grid[j][i+1],c=grid[j+1][i+1],d=grid[j+1][i],s=1200*extent/N;
 this.triangle(a,b,c,{x:i*s,y:j*s},{x:(i+1)*s,y:j*s},{x:(i+1)*s,y:(j+1)*s});this.triangle(a,c,d,{x:i*s,y:j*s},{x:(i+1)*s,y:(j+1)*s},{x:i*s,y:(j+1)*s});

 }
 }
 destroy(){this.dead=true;cancelAnimationFrame(this.frame);this.observer.disconnect();this.canvas.removeEventListener('pointermove',this.move);}
}
