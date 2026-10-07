import {Garden,INKS} from './garden.js?v=fresh-cloth-fit-screen';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function cleanMotifs(value){return Array.isArray(value)?value.slice(0,40).filter(m=>m&&['x','y','size','angle','ink','kind'].every(k=>Number.isFinite(m[k]))).map(m=>({x:((m.x%1)+1)%1,y:((m.y%1)+1)%1,size:clamp(m.size,.025,.2),angle:clamp(m.angle,-Math.PI,Math.PI),ink:clamp(Math.round(m.ink),0,7),kind:clamp(Math.round(m.kind),0,3)})):null;}
export function initialMotifs(d){const n=d.scale?2:4;return Array.from({length:n*n},(_,i)=>{const row=Math.floor(i/n),col=i%n;return {x:((col+.5+(d.layout&&row%2?.5:0))/n)%1,y:(row+.3)/n,size:.25/n,angle:0,ink:d.palette,kind:0};});}
const chalkCache=new Map();
export function painterFor(ctx){const p=Object.create(Garden.prototype);p.ctx=ctx;p.chalkCache=chalkCache;p.paused=true;p.t=0;return p;}
export function drawMotif(p,m,unit,x=m.x*unit,y=m.y*unit){const c=p.ctx,s=m.size*unit,ink=INKS[m.ink];c.save();c.translate(x,y);c.rotate(m.angle);
 if(m.kind===0)p.textileMotif(0,0,s,ink);
 if(m.kind===1)p.flower(0,0,s,0,1,[ink,'#f6f1e5','#f6f1e5',ink]);
 if(m.kind===2){p.stem(0,0,s,2,ink);p.flower(0,-s*.3,s*.62,0,1,[ink,'#f6f1e5','#f6f1e5',ink]);p.flower(-s*.48,s*.68,s*.38,2,1,[ink,'#f6f1e5','#f6f1e5',ink]);p.flower(s*.48,s*1.1,s*.38,2,1,[ink,'#f6f1e5','#f6f1e5',ink]);}
 if(m.kind===3){p.stem(0,-s*.8,s,2,ink);p.leaf(0,-s*.4,s*.8,-1.2,ink);p.leaf(0,0,s*.8,3.6,ink);}
 c.restore();}
export function applyIdea(state,kind,n){const prev=state[kind==='ink'?'palette':kind];state[kind==='ink'?'palette':kind]=kind==='ink'?[5,2,6][n]:n;
 if(!state.motifs)return;
 if(kind==='ink')state.motifs.forEach(m=>m.ink=state.palette);
 if(kind==='scale'&&prev!==n)state.motifs.forEach(m=>m.size=clamp(m.size*(n?1.5:1/1.5),.025,.2));
 if(kind==='layout'){const cols=Math.ceil(Math.sqrt(state.motifs.length)),rows=Math.ceil(state.motifs.length/cols);state.motifs.forEach((m,i)=>{const row=Math.floor(i/cols);m.x=((i%cols+.5+(n&&row%2?.5:0))/cols)%1;m.y=(row+.3)/rows;});}
}
