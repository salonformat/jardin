// Original botanical geometry. No historic patterns or museum images are reproduced.
const TAU=Math.PI*2;
export const INKS=['#dd593e','#345583','#913853','#59794d','#c48b23','#8170ac','#20766d','#d5788f'];
const ease=x=>1-Math.pow(1-x,3);
export class Garden {
  constructor(canvas,{scene='jardin',paused=false,bloom=0,repeated=false,palette=0,spacing=45}={}){
    this.canvas=canvas;this.ctx=canvas.getContext('2d');this.scene=scene;this.paused=paused;
    this.bloom=bloom;this.targetBloom=bloom;this.repeat=repeated?1:0;this.targetRepeat=this.repeat;this.palette=palette;this.spacing=spacing;
    this.pointer={x:0,y:0,active:false};this.t=0;this.last=0;this.alive=true;
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(canvas);
    this.move=e=>{const r=canvas.getBoundingClientRect();this.pointer={x:(e.clientX-r.left)/r.width-.5,y:(e.clientY-r.top)/r.height-.5,active:true};if(this.paused)this.draw();};
    this.leave=()=>{this.pointer.active=false;};canvas.parentElement.addEventListener('pointermove',this.move);canvas.parentElement.addEventListener('pointerdown',this.move);canvas.parentElement.addEventListener('pointerleave',this.leave);
    this.loop=this.loop.bind(this);this.frame=requestAnimationFrame(this.loop);
  }
  resize(){const r=this.canvas.getBoundingClientRect();this.w=r.width;this.h=r.height;const dpr=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.round(r.width*dpr);this.canvas.height=Math.round(r.height*dpr);this.ctx.setTransform(dpr,0,0,dpr,0,0);this.draw();}
  set({paused,bloom,repeated,palette,spacing}={}){if(paused!==undefined)this.paused=paused;if(bloom!==undefined)this.targetBloom=bloom;if(repeated!==undefined)this.targetRepeat=repeated?1:0;if(palette!==undefined)this.palette=palette;if(spacing!==undefined)this.spacing=spacing;if(this.paused){this.bloom=this.targetBloom;this.repeat=this.targetRepeat;}this.draw();}
  loop(now){if(!this.alive)return;const dt=Math.min((now-this.last)/1000||.016,.05);this.last=now;if(!document.hidden&&!this.paused){this.t+=dt;this.bloom+=(this.targetBloom-this.bloom)*dt*3;this.repeat+=(this.targetRepeat-this.repeat)*dt*2.1;this.draw();}this.frame=requestAnimationFrame(this.loop);}
  leaf(x,y,size,angle,colour){const c=this.ctx;c.save();c.translate(x,y);c.rotate(angle);c.fillStyle=colour;c.beginPath();c.moveTo(0,0);c.bezierCurveTo(size*.32,-size*.6,size*.9,-size*.56,size,0);c.bezierCurveTo(size*.6,size*.22,size*.27,size*.33,0,0);c.fill();c.strokeStyle='rgba(246,241,229,.4)';c.lineWidth=.9;c.beginPath();c.moveTo(size*.12,0);c.quadraticCurveTo(size*.48,-size*.05,size*.85,0);c.stroke();c.restore();}
  flowerShape(x,y,size,seed=0,open=1,colours=['#ed503e','#f4aea9','#8a2039','#f0cd65'],rotation=0){
    const c=this.ctx;c.save();c.translate(x,y);c.rotate(rotation);let petals=seed%3===0?9:7;
    for(let i=0;i<petals;i++){
      c.save();c.rotate(i*TAU/petals);let stretch=.28+open*.72;let radius=size*(.86+Math.sin(i*1.3+seed)*.1);c.fillStyle=colours[0];
      c.beginPath();c.moveTo(-size*.075,size*.06);c.bezierCurveTo(-radius*.67,-radius*.16*stretch,-radius*.64,-radius*.9*stretch,-radius*.19,-radius*stretch);c.bezierCurveTo(radius*.28,-radius*1.13*stretch,radius*.69,-radius*.76*stretch,radius*.36,-radius*.27*stretch);c.quadraticCurveTo(radius*.2,-radius*.08,0,size*.09);c.fill();
      c.strokeStyle=colours[1];c.lineWidth=Math.max(.65,size*.013);for(let j=-1;j<=1;j++){c.beginPath();c.moveTo(j*size*.05,-size*.2*stretch);c.quadraticCurveTo(j*size*.16,-size*.5*stretch,j*size*.15,-size*.78*stretch);c.stroke();}c.restore();
    }
    c.fillStyle=colours[2];c.beginPath();c.arc(0,0,size*(.23+.055*open),0,TAU);c.fill();
    c.fillStyle=colours[3];for(let i=0;i<19;i++){let a=i*2.399963,r=Math.sqrt(i/19)*size*.205;c.beginPath();c.arc(Math.cos(a)*r,Math.sin(a)*r,Math.max(1.1,size*.022),0,TAU);c.fill();}c.restore();
  }
  flower(x,y,size,seed=0,open=1,colours=['#ed503e','#f4aea9','#8a2039','#f0cd65'],rotation=0){
    // Pigment is baked once into each blossom, so the paper grain moves with it.
    this.chalkCache ||= new Map();
    const key=seed+colours.join('');let stamp=this.chalkCache.get(key);
    if(!stamp){
      stamp=document.createElement('canvas');stamp.width=stamp.height=640;
      const pigment=stamp.getContext('2d'),original=this.ctx;this.ctx=pigment;
      this.flowerShape(320,320,232,seed,1,colours,0);this.ctx=original;
      let rand=seed+147;const random=()=>{rand=(rand*1664525+1013904223)>>>0;return rand/4294967296;};
      pigment.globalCompositeOperation='source-atop';
      for(let i=0;i<1300;i++){
        const px=random()*640,py=random()*640;
        pigment.strokeStyle=`rgba(255,243,213,${.03+random()*.13})`;pigment.lineWidth=.5+random()*2;
        pigment.beginPath();pigment.moveTo(px,py);pigment.lineTo(px+8+random()*32,py-4-random()*12);pigment.stroke();
      }
      pigment.globalCompositeOperation='destination-out';
      for(let i=0;i<14000;i++){
        const px=random()*640,py=random()*640;
        pigment.fillStyle=`rgba(0,0,0,${.06+random()*.34})`;
        pigment.fillRect(px,py,.5+random()*2.2,.5+random()*1.6);
      }
      this.chalkCache.set(key,stamp);
    }
    const c=this.ctx;c.save();c.translate(x,y);c.rotate(rotation);c.scale(1,.88+open*.12);
    c.drawImage(stamp,-size*320/232,-size*320/232,size*640/232,size*640/232);c.restore();
  }
  stem(x,y,size,seed,colour,angle=0){const c=this.ctx;const sway=this.paused?0:Math.sin(this.t*.55+seed)*.025;
    c.save();c.translate(x,y);c.rotate(angle+sway);c.strokeStyle=colour;c.lineWidth=Math.max(2,size*.033);c.beginPath();c.moveTo(0,size*.1);c.bezierCurveTo(-size*.18,size*.8,size*.33,size*1.45,size*.05,size*2.05);c.stroke();this.leaf(size*.04,size*.85,size*.72,-.6,colour);this.leaf(size*.04,size*1.28,size*.61,3.75,colour);c.restore();}
  draw(){if(!this.w||!this.h)return;const c=this.ctx,w=this.w,h=this.h;c.clearRect(0,0,w,h);
    if(this.scene==='jardin')this.cover();else if(this.scene==='decouverte'){const size=Math.min(w*.27,h*.22);this.stem(w*.5,h*.35,size,2,'#97b69b',-.12);this.flower(w*.5,h*.35,size,2,1,['#bcafd8','#74679f','#da684d','#f7e8b6'],this.paused?-.12:Math.sin(this.t*.5)*.06-.12);}else this.study();
  }
  cover(){
    const w=this.w,h=this.h,c=this.ctx,mobile=w<700,basis=Math.min(w,h);
    const px=this.paused?0:this.pointer.x,py=this.paused?0:this.pointer.y;
    const flowers=mobile?[
      [.06,.05,.14,4,-.4],[.86,.1,.16,3,.3],[1.08,.43,.15,1,-.1],[-.12,.53,.14,2,.4],
      [.03,.99,.18,0,-.2],[.37,1.03,.16,4,.1],[.76,.91,.23,5,-.3],[1.02,.75,.18,1,.2]
    ]:[
      [.02,.08,.23,4,-.4],[.24,-.03,.22,3,.2],[.49,-.08,.20,6,-.3],[.74,.03,.22,0,.4],[.98,.13,.25,3,-.2],
      [.08,.39,.25,1,.3],[.29,.31,.19,5,-.3],[.54,.30,.17,4,.2],[.79,.37,.23,1,-.35],[1.04,.49,.25,6,.3],
      [-.03,.71,.25,2,-.2],[.21,.70,.22,0,.2],[.46,.68,.18,3,-.3],[.73,.70,.24,5,.15],[.94,.85,.23,4,.2],
      [.08,1.01,.25,5,-.3],[.34,1.04,.24,6,.3],[.60,1.02,.23,2,-.3],[.83,1.10,.24,0,.2]
    ];
    const palettes=[
      ['#f1a487','#c6615f','#89314e','#f4d988'],
      ['#bcafd8','#74679f','#da684d','#f7e8b6'],
      ['#ec6687','#953c67','#f6c663','#64443a'],
      ['#e8c45d','#c59042','#87595c','#f8e7b7'],
      ['#97b69b','#548674','#e5a7b7','#602e4a'],
      ['#e78561','#bd474c','#633d67','#f9d77d'],
      ['#c59bc7','#875c9d','#e7ba72','#81544f']
    ];
    // Foliage connects the blossoms into one continuous textile landscape.
    flowers.forEach(([xx,yy,ss,seed,rot],i)=>{
      const wind=this.paused?0:Math.sin(this.t*.8+i*.61)*14+Math.sin(this.t*.29+i)*8;
      let x=xx*w+px*(28+i*3)+wind*.4,y=yy*h+py*18+wind*.5;
      const arrival=this.paused?1:ease(Math.max(0,Math.min(1,(this.t-i*.065)/1.8)));
      let size=ss*basis*(mobile?1.7:1)*(.2+.8*arrival);
      const d=Math.hypot(xx-.5-px,yy-.5-py),attention=this.pointer.active?Math.max(0,1-d*3):0;
      const angle=rot+wind*.004;
      this.stem(x,y,size*1.18,seed,i%2?'#74956e':'#a0ae79',angle);
      this.flower(x,y,size*(1+attention*.18),seed,this.paused?1:.89+Math.sin(this.t*.85+i)*.13+attention*.1,palettes[seed],angle);
    });
    if(!this.paused){for(let i=0;i<11;i++){const x=(Math.sin(this.t*.045+i*5.2)*.5+.5)*w,y=h-(this.t*12+i*83)%h;c.save();c.translate(x,y);c.rotate(this.t*.2+i);c.fillStyle=i%2?'#e9c87666':'#efb1b366';c.beginPath();c.ellipse(0,0,2,5,0,0,TAU);c.fill();c.restore();}}
  }
  textileMotif(x,y,size,ink,rotation=0){
    const c=this.ctx,paper='#f6f1e5';
    this.stem(x,y,size,2,ink,rotation);
    this.flower(x,y,size,2,1,[ink,paper,paper,ink],rotation);
  }
  study(){
    const c=this.ctx,w=this.w,h=this.h,ink=INKS[this.palette];
    c.fillStyle='#f6f1e5';c.fillRect(0,0,w,h);
    const moving=!this.paused,fold=this.repeat;
    // Warp and weft follow the same wave as the printed motifs: the surface is cloth.
    c.lineWidth=.55;
    const wave=(x,y)=>moving?Math.sin(this.t*.8+x*.009+y*.004)*9*fold:0;
    for(let y=0;y<h;y+=7){c.strokeStyle=y%14===0?'#78664416':'#7866440b';c.beginPath();for(let x=0;x<=w;x+=20){const yy=y+wave(x,y);if(x===0)c.moveTo(x,yy);else c.lineTo(x,yy);}c.stroke();}
    for(let x=0;x<w;x+=7){c.strokeStyle='#7866440d';c.beginPath();for(let y=0;y<=h;y+=20){const xx=x+wave(x,y)*.6;if(y===0)c.moveTo(xx,y);else c.lineTo(xx,y);}c.stroke();}
    const mobile=w<700,cx=w*.5,cy=h*.40,base=Math.min(w*(mobile?.25:.18),h*.24);
    const size=base*(1-fold*.49),open=this.bloom;
    if(fold>.001){
      const sx=size*2.7,sy=size*3.5;
      const rows=Math.ceil(h/sy)+2,cols=Math.ceil(w/sx)+2;
      for(let row=-rows;row<=rows;row++)for(let col=-cols;col<=cols;col++){
        if(!row&&!col)continue;
        const d=Math.hypot(row*.8,col*.65),reveal=ease(Math.max(0,Math.min(1,(fold-d*.055)*2)));
        if(reveal<=0)continue;
        const xx=cx+col*sx+(Math.abs(row)%2?sx*.5:0),yy=cy+row*sy;
        c.save();c.globalAlpha=reveal;this.textileMotif(xx+wave(xx,yy)*.7,yy+wave(xx,yy),size*reveal,ink,moving?Math.sin(this.t*.8+col*.2+row*.3)*.026:0);c.restore();
      }
    }
    // The print appears beneath the departing block. It is not a flower-growing simulation.
    if(open>.02){c.save();c.globalAlpha=Math.min(1,open*2.2);this.textileMotif(cx+wave(cx,cy)*.7,cy+wave(cx,cy),size,ink,moving?Math.sin(this.t*.8)*.026*fold:0);c.restore();}
    if(open<.999){
      const lift=ease(open),bx=cx+lift*w*.67,by=cy-lift*h*.12;
      c.save();c.translate(bx,by);c.rotate(-.075+lift*.35);c.globalAlpha=1-lift*.8;
      const block=base*2.65;c.shadowColor='#5a342932';c.shadowBlur=16;c.shadowOffsetY=12+lift*20;
      c.fillStyle='#c59a6b';c.fillRect(-block*.5,-base*1.2,block,base*3.1);c.shadowColor='transparent';
      c.strokeStyle='#805e3b';c.lineWidth=1.3;c.strokeRect(-block*.5+7,-base*1.2+7,block-14,base*3.1-14);
      for(let i=0;i<6;i++){c.strokeStyle='#835f3a30';c.beginPath();c.moveTo(-block*.45,-base+i*base*.48);c.bezierCurveTo(-block*.2,-base+i*base*.48+12,block*.2,-base+i*base*.48-8,block*.45,-base+i*base*.48+3);c.stroke();}
      this.textileMotif(0,0,base*.86,ink);c.restore();
    }
    // Light and shade move across the printed cotton once it becomes a complete fabric.
    if(fold>.1){const sheen=c.createLinearGradient(0,0,w,0);for(let i=0;i<=12;i++){const v=(Math.sin(i*2.3+(moving?this.t*.7:0))*.5+.5)*.085*fold;sheen.addColorStop(i/12,`rgba(63,41,28,${v})`);}c.fillStyle=sheen;c.fillRect(0,0,w,h);}
  }
  destroy(){this.alive=false;cancelAnimationFrame(this.frame);this.resizeObserver.disconnect();this.canvas.parentElement.removeEventListener('pointermove',this.move);this.canvas.parentElement.removeEventListener('pointerdown',this.move);this.canvas.parentElement.removeEventListener('pointerleave',this.leave);}
}
