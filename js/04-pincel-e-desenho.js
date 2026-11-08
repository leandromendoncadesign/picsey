'use strict';
/* ---------- pincel ---------- */
const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
const hexRgb=h6=>{const n=parseInt(h6.slice(1),16);return[(n>>16)&255,(n>>8)&255,n&255].join(',')};
const stampCache=new Map();
function stampImg(s){const d=Math.max(1,Math.ceil(s.s)),col=s.m==='paint'?s.c:'#ffffff',key=d+'|'+s.hd+'|'+col;let c=stampCache.get(key);if(c)return c;
  if(stampCache.size>40)stampCache.clear();
  c=mk(d+2,d+2);const x=c.getContext('2d'),r=d/2,m=r+1;
  if(s.hd>=.98){x.fillStyle=col;x.beginPath();x.arc(m,m,r,0,7);x.fill()}
  else{const g=x.createRadialGradient(m,m,0,m,m,r),rgb=hexRgb(col);g.addColorStop(0,`rgba(${rgb},1)`);g.addColorStop(Math.max(0,s.hd),`rgba(${rgb},1)`);g.addColorStop(1,`rgba(${rgb},0)`);x.fillStyle=g;x.beginPath();x.arc(m,m,r,0,7);x.fill()}
  stampCache.set(key,c);return c}
function stampAt(lx,s,x,y){const c=stampImg(s),d=Math.max(1,Math.ceil(s.s));lx.drawImage(c,x-d/2-1,y-d/2-1)}
function stampMore(lx,s){
  const p=s.p,sp=Math.max(1,s.s*0.12);if(!s._st)s._st={i:0,x:0,y:0,rem:0};const st=s._st;
  if(st.i===0&&p.length>=2){stampAt(lx,s,p[0],p[1]);st.x=p[0];st.y=p[1];st.i=2}
  while(st.i<p.length){const nx=p[st.i],ny=p[st.i+1],dx=nx-st.x,dy=ny-st.y,d=Math.hypot(dx,dy);
    if(d===0){st.i+=2;continue}
    let pos=0,dist=st.rem;
    while(d-pos+dist>=sp){pos+=sp-dist;stampAt(lx,s,st.x+dx/d*pos,st.y+dy/d*pos);dist=0}
    st.rem=dist+(d-pos);st.x=nx;st.y=ny;st.i+=2}
}
function compose(t,s,live){const tx=t.getContext('2d');tx.save();tx.globalAlpha=s.o;tx.globalCompositeOperation=s.m==='erase'?'destination-out':'source-over';tx.drawImage(live,0,0);tx.restore()}
function flushStroke(t,s,live){const lx=live.getContext('2d');lx.clearRect(0,0,live.width,live.height);s._st=null;stampMore(lx,s);compose(t,s,live)}
function strokeView(l,list,isMask,pw,ph){
  let c=l._sv;
  if(!c||c.pw!==pw||c.ph!==ph||c.mask!==isMask)c=l._sv={pw,ph,mask:isMask,sig:null,base:mk(pw,ph),live:mk(pw,ph),view:mk(pw,ph),liveOn:false,viewValid:false};
  const ls=l._ls&&list[list.length-1]===l._ls?l._ls:null,n=list.length-(ls?1:0),sig=n+'|'+(n?list[n-1].u:0);
  if(sig!==c.sig){const bx=c.base.getContext('2d');bx.globalCompositeOperation='source-over';bx.clearRect(0,0,pw,ph);if(isMask){bx.fillStyle='#fff';bx.fillRect(0,0,pw,ph)}
    for(let i=0;i<n;i++)flushStroke(c.base,list[i],c.live);c.sig=sig;c.liveOn=false}
  if(!ls)return c.base;
  const lx=c.live.getContext('2d');if(!c.liveOn||!ls._st){lx.clearRect(0,0,pw,ph);ls._st=null;c.liveOn=true}
  stampMore(lx,ls);
  const vx=c.view.getContext('2d');vx.clearRect(0,0,pw,ph);vx.drawImage(c.base,0,0);compose(c.view,ls,c.live);c.viewValid=true;return c.view}
function endStroke(l,list){const c=l._sv,s=l._ls;l._ls=null;
  if(c&&c.viewValid&&s){const bx=c.base.getContext('2d');bx.globalCompositeOperation='copy';bx.drawImage(c.view,0,0);bx.globalCompositeOperation='source-over';c.sig=list.length+'|'+s.u;c.viewValid=false;c.liveOn=false}}
const maskDims=a=>{const f=Math.min(1,2048/Math.max(a.w,a.h));return{w:Math.max(1,Math.round(a.w*f)),h:Math.max(1,Math.round(a.h*f))}};
const pdim=l=>l.type==='paint'?{w:l.pw,h:l.ph}:maskDims(assets[l.asset]);
function toLocal(l,p){const pd=pdim(l),a=-l.rot*Math.PI/180,dx=p.x-l.x,dy=p.y-l.y;let x=dx*Math.cos(a)-dy*Math.sin(a);let y=dx*Math.sin(a)+dy*Math.cos(a);if(l.flip)x=-x;if(l.flipV)y=-y;const sc=l.w/pd.w;return{x:x/sc+pd.w/2,y:y/sc+pd.h/2,sc}}
function paintSource(l){return strokeView(l,l.strokes,false,l.pw,l.ph)}
function imageSource(l,k){
  const src=baseImageSource(l,k);if(!src||!l.mask||!l.mask.length)return src;
  const a=assets[l.asset],md=maskDims(a),mv=strokeView(l,l.mask,true,md.w,md.h);
  const tw=Math.max(1,Math.round(Math.min(a.w,l.w*k))),th=Math.max(1,Math.round(tw*a.h/a.w));
  let m=l._mc;if(!m||m.width!==tw||m.height!==th)m=l._mc=mk(tw,th);
  const x=m.getContext('2d');x.globalCompositeOperation='source-over';x.clearRect(0,0,tw,th);x.drawImage(src,0,0,tw,th);
  x.globalCompositeOperation='destination-in';x.drawImage(mv,0,0,tw,th);x.globalCompositeOperation='source-over';return m}
function paintHit(l,x,y){const b={w:l.w,h:l.h};if(!(Math.abs(x)<=b.w/2&&Math.abs(y)<=b.h/2))return false;
  if(l.flip)x=-x;if(l.flipV)y=-y;const sc=l.w/l.pw,px=Math.round(x/sc+l.pw/2),py=Math.round(y/sc+l.ph/2),v=paintSource(l),
    x0=clamp(px-10,0,l.pw-1),y0=clamp(py-10,0,l.ph-1);
  try{const d=v.getContext('2d').getImageData(x0,y0,Math.min(21,l.pw-x0),Math.min(21,l.ph-y0)).data;for(let i=3;i<d.length;i+=4)if(d[i]>8)return true}catch(e){}return false}
function addPaintLayer(){const f=Math.min(1,2048/Math.max(doc.w,doc.h));
  const l=newLayer('paint',{name:'Pintura',w:doc.w,h:doc.h,pw:Math.max(1,Math.round(doc.w*f)),ph:Math.max(1,Math.round(doc.h*f)),strokes:[]});
  const s=curLayer(),idx=s?doc.layers.indexOf(s)+1:doc.layers.length;doc.layers.splice(idx,0,l);sel=l.id;return l}
function brushTarget(){const s=curLayer();
  if(brush.mode==='paint'){const l=s&&s.type==='paint'?s:addPaintLayer();if(l!==s)panel();return{l,list:l.strokes}}
  if(brush.mode==='erase'&&s&&s.type==='paint')return{l:s,list:s.strokes};
  if(s&&s.type==='image'){if(!s.mask)s.mask=[];return{l:s,list:s.mask}}
  return null}

/* ---------- desenho ---------- */
function shapePath(c,l,w,hh){
  const rx=w/2,ry=hh/2;c.beginPath();
  switch(l.shape){
    case'rect':c.rect(-rx,-ry,w,hh);break;
    case'round':{const r=Math.min(w,hh)/2*l.radius;c.moveTo(-rx+r,-ry);c.arcTo(rx,-ry,rx,ry,r);c.arcTo(rx,ry,-rx,ry,r);c.arcTo(-rx,ry,-rx,-ry,r);c.arcTo(-rx,-ry,rx,-ry,r);c.closePath();break}
    case'ellipse':c.ellipse(0,0,rx,ry,0,0,Math.PI*2);break;
    case'triangle':c.moveTo(0,-ry);c.lineTo(rx,ry);c.lineTo(-rx,ry);c.closePath();break;
    case'star':case'burst':{const n=l.points,inner=l.shape==='star'?0.45:0.7;
      for(let i=0;i<n*2;i++){const a=-Math.PI/2+i*Math.PI/n,r=i%2?inner:1;const x=Math.cos(a)*rx*r,y=Math.sin(a)*ry*r;i?c.lineTo(x,y):c.moveTo(x,y)}c.closePath();break}
    case'heart':{for(let i=0;i<=80;i++){const t=i/80*Math.PI*2,x=16*Math.pow(Math.sin(t),3),y=13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t);
      const px=x/16*rx,py=(-y-2.95)/14.05*ry;i?c.lineTo(px,py):c.moveTo(px,py)}c.closePath();break}
    case'speech':{const th=l.tailA*Math.PI/180,dl=0.3,L=1+l.tailL;
      c.ellipse(0,0,rx,ry,0,th+dl,th-dl+Math.PI*2);c.lineTo(rx*Math.cos(th)*L,ry*Math.sin(th)*L);c.closePath();break}
    case'thought':{c.ellipse(0,0,rx,ry,0,0,Math.PI*2);
      const th=l.tailA*Math.PI/180,m=Math.min(rx,ry),ux=Math.cos(th),uy=Math.sin(th),bx=rx*ux,by=ry*uy;
      for(let j=0;j<3;j++){const dist=m*l.tailL*(0.9+0.95*j),r=m*0.2*(1-0.25*j);c.moveTo(bx+ux*dist+r,by+uy*dist);c.arc(bx+ux*dist,by+uy*dist,r,0,Math.PI*2)}break}
  }
}
function drawLayer(c,l,k){
  c.save();c.globalAlpha=l.op;c.translate(l.x*k,l.y*k);c.rotate(l.rot*Math.PI/180);if(l.flip||l.flipV)c.scale(l.flip?-1:1,l.flipV?-1:1);
  if(l.type==='image'){const s=imageSource(l,k);if(s)c.drawImage(s,-l.w*k/2,-l.h*k/2,l.w*k,l.h*k)}
  else if(l.type==='paint'){const s=l.strokes.length?paintSource(l):null;if(s)c.drawImage(s,-l.w*k/2,-l.h*k/2,l.w*k,l.h*k)}
  else if(l.type==='shape'){shapePath(c,l,l.w*k,l.h*k);
    if(l.fill){c.fillStyle=l.fillC;c.fill()}
    if(l.strokeW>0){c.lineWidth=l.strokeW*k;c.strokeStyle=l.strokeC;c.lineJoin='round';c.stroke()}}
  else{
    const lines=l.text.split('\n');c.font=fontStr(l,k);c.textBaseline='middle';c.textAlign='left';c.lineJoin='round';c.miterLimit=2;
    const lh=l.size*l.lh*k,ws=lines.map(s=>c.measureText(s).width),bw=Math.max(...ws),tot=lh*lines.length;
    const arcA=l.arc&&Math.abs(l.arc)>=1?l.arc/100*Math.PI:0,sg=arcA<0?-1:1,sag=arcA?arcSag(ws,arcA,l.size*k):0;
    const sh=()=>{c.shadowColor=l.shC;c.shadowBlur=l.shB*k;c.shadowOffsetX=l.shX*k;c.shadowOffsetY=l.shY*k};
    const noSh=()=>{c.shadowColor='transparent';c.shadowBlur=0;c.shadowOffsetX=0;c.shadowOffsetY=0};
    const paint=(s,x,y)=>{if(l.strokeW>0){if(l.shadow)sh();c.lineWidth=l.strokeW*2*k;c.strokeStyle=l.strokeC;c.strokeText(s,x,y);noSh();c.fillStyle=l.color;c.fillText(s,x,y)}
      else{if(l.shadow)sh();c.fillStyle=l.color;c.fillText(s,x,y);noSh()}};
    lines.forEach((s,i)=>{const y=-tot/2+lh*(i+.5);
      if(!arcA||ws[i]<2){paint(s,l.align==='left'?-bw/2:l.align==='right'?bw/2-ws[i]:-ws[i]/2,y);return}
      const w=ws[i],R=w/Math.abs(arcA),cxl=l.align==='left'?-bw/2+w/2:l.align==='right'?bw/2-w/2:0,arr=Array.from(s);
      arr.forEach((ch,j)=>{const pre=c.measureText(arr.slice(0,j).join('')).width,adv=c.measureText(ch).width,phi=(pre+adv/2-w/2)/R;
        c.save();c.translate(cxl+R*Math.sin(phi),y-sg*sag/2+sg*(R-R*Math.cos(phi)));c.rotate(sg*phi);paint(ch,-adv/2,0);c.restore()})});
  }
  c.restore();
}
function renderDoc(c,k,opaque){
  const W=Math.round(doc.w*k),H=Math.round(doc.h*k);
  if(doc.bg){c.fillStyle=doc.bg;c.fillRect(0,0,W,H)}else if(opaque){c.fillStyle='#ffffff';c.fillRect(0,0,W,H)}
  for(const l of doc.layers)if(l.vis)drawLayer(c,l,k);
  if(!isDefAdj(doc.adj)){const id=c.getImageData(0,0,W,H);applyAdj(id,doc.adj,k);c.putImageData(id,0,0)}
}
