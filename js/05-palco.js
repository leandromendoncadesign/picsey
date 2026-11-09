'use strict';
/* ---------- palco ---------- */
const stage=$('#stage'),cv=$('#cv'),ov=$('#ov');
const pk=()=>Math.min(1,1600/Math.max(doc.w,doc.h));
let raf=0,hnd={};
function render(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;drawNow()})}
function layout(){
  const sw=stage.clientWidth,sh=stage.clientHeight,fit=Math.min((sw-32)/doc.w,(sh-24)/doc.h),s=fit*view.zoom,W=doc.w*s,H=doc.h*s;
  const left=(sw-W)/2+view.px,top=(sh-H)/2+view.py;
  for(const c of[cv,ov]){c.style.width=W+'px';c.style.height=H+'px';c.style.left=left+'px';c.style.top=top+'px'}
}
function drawNow(){
  const k=pk(),W=Math.max(1,Math.round(doc.w*k)),H=Math.max(1,Math.round(doc.h*k));
  if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;ov.width=W;ov.height=H}
  layout();const c=cv.getContext('2d');c.clearRect(0,0,W,H);renderDoc(c,k,false);drawOverlay(k);
  $('#hint').hidden=doc.layers.length>0;
}
function drawOverlay(k){
  const c=ov.getContext('2d');c.clearRect(0,0,ov.width,ov.height);hnd={};if(eff)return;
  const rect=cv.getBoundingClientRect(),cpp=(rect.width/cv.width)||1,u=px=>px/cpp;
  if(crop){const x=crop.x*k,y=crop.y*k,w=crop.w*k,hh=crop.h*k;
    c.fillStyle='rgba(0,0,0,.55)';c.beginPath();c.rect(0,0,ov.width,ov.height);c.rect(x,y,w,hh);c.fill('evenodd');
    c.strokeStyle='#f0b429';c.lineWidth=u(2);c.strokeRect(x,y,w,hh);
    c.strokeStyle='rgba(255,255,255,.45)';c.lineWidth=u(1);c.beginPath();
    for(let i=1;i<3;i++){c.moveTo(x+w*i/3,y);c.lineTo(x+w*i/3,y+hh);c.moveTo(x,y+hh*i/3);c.lineTo(x+w,y+hh*i/3)}c.stroke();
    const pts={nw:[x,y],n:[x+w/2,y],ne:[x+w,y],e:[x+w,y+hh/2],se:[x+w,y+hh],s:[x+w/2,y+hh],sw:[x,y+hh],w:[x,y+hh/2]};
    for(const[kk,p]of Object.entries(pts)){hnd[kk]=p;c.fillStyle='#f0b429';c.strokeStyle='#1a1405';c.lineWidth=u(1.5);c.beginPath();c.arc(p[0],p[1],u(8),0,7);c.fill();c.stroke()}
    return}
  if(mode==='brush'){if(brushPos){const rr=brush.size/2*k;c.beginPath();c.arc(brushPos.x*k,brushPos.y*k,Math.max(u(3),rr),0,7);c.strokeStyle='rgba(0,0,0,.75)';c.lineWidth=u(3);c.stroke();c.strokeStyle='#fff';c.lineWidth=u(1.3);c.stroke()}return}
  if(guides){c.save();c.lineWidth=u(1.6);c.setLineDash([u(9),u(6)]);
    const line=(x1,y1,x2,y2)=>{c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.strokeStyle='rgba(0,0,0,.55)';c.lineWidth=u(3.4);c.stroke();c.strokeStyle='#ff4be0';c.lineWidth=u(1.6);c.stroke()};
    if(guides.v)line(doc.w/2*k,0,doc.w/2*k,ov.height);if(guides.h)line(0,doc.h/2*k,ov.width,doc.h/2*k);c.restore()}
  const l=curLayer();if(!l||!l.vis)return;
  const b=bbox(l),cx=l.x*k,cy=l.y*k,hw=b.w*k/2,hh=b.h*k/2,a=l.rot*Math.PI/180,co=Math.cos(a),si=Math.sin(a);
  const P=(x,y)=>[cx+x*co-y*si,cy+x*si+y*co];
  const poly=[P(-hw,-hh),P(hw,-hh),P(hw,hh),P(-hw,hh)];
  const path=()=>{c.beginPath();poly.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath()};
  path();c.strokeStyle='rgba(0,0,0,.7)';c.lineWidth=u(4);c.stroke();path();c.strokeStyle=l.locked?'#9aa0a6':'#f0b429';c.lineWidth=u(2);if(l.locked)c.setLineDash([u(8),u(6)]);c.stroke();c.setLineDash([]);
  if(l.locked){const q=P(0,0);c.fillStyle='rgba(20,20,20,.85)';c.beginPath();c.arc(q[0],q[1],u(18),0,7);c.fill();c.strokeStyle='#e8e8e8';c.lineWidth=u(2.2);c.lineCap='round';c.lineJoin='round';
    c.strokeRect(q[0]-u(7),q[1]-u(1),u(14),u(10));c.beginPath();c.arc(q[0],q[1]-u(2),u(5),Math.PI,0);c.stroke();return}
  if(l.type==='shape'||l.type==='image'){const ln=l.type==='shape'&&(l.shape==='line'||l.shape==='arrow');
    const E=(x,y,r)=>{const q=P(x,y);c.save();c.translate(q[0],q[1]);c.rotate(a+r);c.fillStyle='#f0b429';c.strokeStyle='#1a1405';c.lineWidth=u(1.5);c.beginPath();c.roundRect(-u(5),-u(13),u(10),u(26),u(5));c.fill();c.stroke();c.restore()};
    E(hw,0,0);E(-hw,0,0);if(!ln){E(0,hh,Math.PI/2);E(0,-hh,Math.PI/2)}}
  const rot=P(0,-hh-u(38)),top=P(0,-hh);
  c.beginPath();c.moveTo(top[0],top[1]);c.lineTo(rot[0],rot[1]);c.strokeStyle='#f0b429';c.lineWidth=u(2);c.stroke();
  const H=(name,p,g)=>{hnd[name]=p;c.fillStyle='#f0b429';c.strokeStyle='#1a1405';c.lineWidth=u(2);c.beginPath();c.arc(p[0],p[1],u(14),0,7);c.fill();c.stroke();
    c.fillStyle='#1a1405';c.font=`bold ${u(16)}px sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText(g,p[0],p[1]+u(1))};
  H('scale',P(hw+u(14),hh+u(14)),'⤡');H('rot',rot,'↻');H('del',P(-hw-u(14),-hh-u(14)),'✕');
}
const toDoc=e=>{const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*doc.w,y:(e.clientY-r.top)/r.height*doc.h}};
function handleAt(e){const r=cv.getBoundingClientRect(),cpp=r.width/cv.width;let best=null,bd=24;
  for(const[k,p]of Object.entries(hnd)){const d=Math.hypot(r.left+p[0]*cpp-e.clientX,r.top+p[1]*cpp-e.clientY);if(d<bd){bd=d;best=k}}return best}
function inLayer(l,p){const r=cv.getBoundingClientRect(),pad=10/(r.width/doc.w),b=bbox(l),a=-l.rot*Math.PI/180,dx=p.x-l.x,dy=p.y-l.y;
  const x=dx*Math.cos(a)-dy*Math.sin(a),y=dx*Math.sin(a)+dy*Math.cos(a);if(l.type==='paint'&&l.id!==sel)return paintHit(l,x,y);return Math.abs(x)<=b.w/2+pad&&Math.abs(y)<=b.h/2+pad}
function hitLayer(p){const s=curLayer();if(s&&s.vis&&!s.locked&&inLayer(s,p))return s;
  for(let i=doc.layers.length-1;i>=0;i--){const l=doc.layers[i];if(l.vis&&!l.locked&&inLayer(l,p))return l}return null}
function edgeAt(e,l){
  if(!l||l.locked||!l.vis||(l.type!=='shape'&&l.type!=='image'))return null;
  const sc=cv.getBoundingClientRect().width/doc.w,p=toDoc(e),b=bbox(l),a=-l.rot*Math.PI/180,dx=p.x-l.x,dy=p.y-l.y,
    x=dx*Math.cos(a)-dy*Math.sin(a),y=dx*Math.sin(a)+dy*Math.cos(a),hw=b.w/2,hh=b.h/2,ln=l.type==='shape'&&(l.shape==='line'||l.shape==='arrow'),
    tx=Math.min(18/sc,hw*.4),ty=ln?0:Math.min(18/sc,hh*.4);
  if(Math.abs(x)>hw+tx||Math.abs(y)>hh+(ln?18/sc:ty))return null;
  let s='';
  if(!ln){if(Math.abs(y+hh)<=ty)s+='n';else if(Math.abs(y-hh)<=ty)s+='s'}
  if(Math.abs(x+hw)<=tx)s+='w';else if(Math.abs(x-hw)<=tx)s+='e';
  return s||null}
const snapBase=l=>({size:l.size,strokeW:l.strokeW,w:l.w,h:l.h,shB:l.shB,shX:l.shX,shY:l.shY});
function scaleLayer(l,b,f){if(l.type==='text'){l.size=Math.max(4,b.size*f);l.strokeW=b.strokeW*f;l.shB=b.shB*f;l.shX=b.shX*f;l.shY=b.shY*f}else{l.w=Math.max(8,b.w*f);l.h=Math.max(8,b.h*f)}}

/* ponteiros */
const ptrs=new Map();let drag=null,gest=null;
stage.addEventListener('pointerdown',e=>{if(e.target.closest('#zoom,#fl,#ovl'))return;if(e.isPrimary&&ptrs.size)resetPtrs();try{stage.setPointerCapture(e.pointerId)}catch(_){}ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(ptrs.size===2){if(drag&&drag.mode==='brush'){const i=drag.list.indexOf(drag.s);if(i>=0)drag.list.splice(i,1);drag.l._ls=null;drag.l._sv=null;brushPos=null;render()}else if(drag&&drag.changed)commit();drag=null;startGest();return}if(ptrs.size>2)return;onDown(e)});
stage.addEventListener('pointermove',e=>{if(!ptrs.has(e.pointerId))return;ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});if(gest)doGest();else if(drag)onMove(e)});
function finishDrag(){if(!drag)return;const dm=drag.mode;guides=null;
  if(dm==='brush'){endStroke(drag.l,drag.list);brushPos=null;commit(({paint:'Pincel',erase:'Borracha',restore:'Restaurar'})[brush.mode]);panel();render()}
  else if(dm==='crop'){}
  else if(drag.changed){commit(({move:'Mover',scale:'Redimensionar',edge:'Redimensionar',rot:'Girar'})[dm]||'Edição');render()}
  drag=null}
function resetPtrs(){if(gest){if(gest.changed)commit('Redimensionar');gest=null}finishDrag();ptrs.clear()}
const up=e=>{if(!ptrs.has(e.pointerId))return;ptrs.delete(e.pointerId);
  if(gest&&ptrs.size<2){if(gest.changed)commit('Redimensionar');gest=null;return}
  finishDrag()};
stage.addEventListener('pointerup',up);stage.addEventListener('pointercancel',up);stage.addEventListener('lostpointercapture',up);
window.addEventListener('pointerup',up);window.addEventListener('pointercancel',up);
stage.addEventListener('touchend',e=>{if(e.touches.length===0)resetPtrs()});stage.addEventListener('touchcancel',()=>resetPtrs());
document.addEventListener('visibilitychange',()=>{if(document.hidden)resetPtrs()});
stage.addEventListener('wheel',e=>{e.preventDefault();zoomBy(e.deltaY<0?1.15:1/1.15)},{passive:false});
document.addEventListener('gesturestart',e=>e.preventDefault());
function pair(){const a=[...ptrs.values()];return{d:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)||1,ang:Math.atan2(a[1].y-a[0].y,a[1].x-a[0].x),mx:(a[0].x+a[1].x)/2,my:(a[0].y+a[1].y)/2}}
function startGest(){const g=pair(),l=curLayer();
  gest=l&&!l.locked&&!crop&&mode!=='brush'?{t:'layer',g,l,base:snapBase(l),rot:l.rot,changed:false}:{t:'view',g,zoom:view.zoom,px:view.px,py:view.py};}
function doGest(){const g=pair();gest.changed=true;
  if(gest.t==='layer'){scaleLayer(gest.l,gest.base,g.d/gest.g.d);gest.l.rot=gest.rot+(g.ang-gest.g.ang)*180/Math.PI}
  else{view.zoom=clamp(gest.zoom*g.d/gest.g.d,.4,10);view.px=gest.px+(g.mx-gest.g.mx);view.py=gest.py+(g.my-gest.g.my)}
  render()}
function zoomBy(f){view.zoom=clamp(view.zoom*f,.4,10);view.px*=f;view.py*=f;render()}
$('#zin').onclick=()=>zoomBy(1.3);$('#zout').onclick=()=>zoomBy(1/1.3);$('#zfit').onclick=()=>{view.zoom=1;view.px=0;view.py=0;render()};
new ResizeObserver(()=>render()).observe(stage);

function samplePixel(e,cb){const r=cv.getBoundingClientRect();const x=clamp(Math.floor((e.clientX-r.left)/r.width*cv.width),0,cv.width-1),y=clamp(Math.floor((e.clientY-r.top)/r.height*cv.height),0,cv.height-1);
  const d=cv.getContext('2d').getImageData(x,y,1,1).data;cb('#'+[d[0],d[1],d[2]].map(v=>v.toString(16).padStart(2,'0')).join(''))}
function onDown(e){
  const p=toDoc(e);
  if(pickCb){const cb=pickCb;pickCb=null;samplePixel(e,cb);return}
  if(crop){const hd=handleAt(e);drag={mode:'crop',hd:hd||(p.x>=crop.x&&p.x<=crop.x+crop.w&&p.y>=crop.y&&p.y<=crop.y+crop.h?'move':null),r:{...crop},p};if(!drag.hd)drag=null;return}
  if(mode==='brush'){const t=brushTarget();
    if(t&&t.l.locked){toast('Camada trancada. Destranque para pintar nela.');return}
    if(!t){toast(brush.mode==='restore'?'Restaurar funciona em imagens. Selecione uma na lista.':'Selecione uma imagem ou camada de pintura na lista.');return}
    const q=toLocal(t.l,p),st={u:Math.random().toString(36).slice(2,9),m:brush.mode,c:brush.color,s:Math.max(1,brush.size/q.sc),hd:brush.hard,o:brush.op,p:[r1(q.x),r1(q.y)]};
    t.list.push(st);t.l._ls=st;drag={mode:'brush',l:t.l,list:t.list,s:st,changed:true};brushPos=p;render();return}
  const hd=handleAt(e),l=curLayer();
  if(hd&&l&&!l.locked){
    if(hd==='del'){deleteLayer(l.id);return}
    if(hd==='scale'){drag={mode:'scale',base:snapBase(l),d0:Math.hypot(p.x-l.x,p.y-l.y)||1,l};return}
    if(hd==='rot'){drag={mode:'rot',r0:l.rot,a0:Math.atan2(p.y-l.y,p.x-l.x),l};return}}
  const ed=edgeAt(e,l);if(ed){drag={mode:'edge',ed,l,p0:p,w0:l.w,h0:l.h,x0:l.x,y0:l.y};return}
  const hit=hitLayer(p);
  if(hit){if(sel!==hit.id)select(hit.id);drag={mode:'move',sx:p.x,sy:p.y,lx:hit.x,ly:hit.y,l:hit}}
  else{if(sel!=null){sel=null;panel();render()}drag={mode:'pan',cx:e.clientX,cy:e.clientY,px:view.px,py:view.py}}
}
function onMove(e){
  const p=toDoc(e),d=drag;
  if(d.mode==='pan'){view.px=d.px+e.clientX-d.cx;view.py=d.py+e.clientY-d.cy;render();return}
  if(d.mode==='crop'){cropDrag(d,p);render();return}
  if(d.mode==='brush'){const q=toLocal(d.l,p),pp=d.s.p;if(Math.hypot(q.x-pp[pp.length-2],q.y-pp[pp.length-1])>=Math.max(.5,d.s.s*.03))pp.push(r1(q.x),r1(q.y));brushPos=p;render();return}
  d.changed=true;
  if(d.mode==='move'){let nx=d.lx+p.x-d.sx,ny=d.ly+p.y-d.sy;const sc=cv.getBoundingClientRect().width/doc.w,tv=(guides&&guides.v?15:10)/sc,th=(guides&&guides.h?15:10)/sc;
    guides={v:false,h:false};
    if(Math.abs(nx-doc.w/2)<tv){nx=doc.w/2;guides.v=true}
    if(Math.abs(ny-doc.h/2)<th){ny=doc.h/2;guides.h=true}
    d.l.x=nx;d.l.y=ny}
  else if(d.mode==='edge'){const a=d.l.rot*Math.PI/180,co=Math.cos(a),si=Math.sin(a),dx=p.x-d.p0.x,dy=p.y-d.p0.y,lx=dx*co+dy*si,ly=-dx*si+dy*co;
    let w=d.w0,hh=d.h0,sx=0,sy=0;
    if(d.ed.includes('e')){w=Math.max(8,d.w0+lx);sx=(w-d.w0)/2}else if(d.ed.includes('w')){w=Math.max(8,d.w0-lx);sx=-(w-d.w0)/2}
    if(d.ed.includes('s')){hh=Math.max(8,d.h0+ly);sy=(hh-d.h0)/2}else if(d.ed.includes('n')){hh=Math.max(8,d.h0-ly);sy=-(hh-d.h0)/2}
    d.l.w=w;d.l.h=hh;d.l.x=d.x0+sx*co-sy*si;d.l.y=d.y0+sx*si+sy*co}
  else if(d.mode==='scale'){scaleLayer(d.l,d.base,Math.hypot(p.x-d.l.x,p.y-d.l.y)/d.d0)}
  else if(d.mode==='rot'){let r=d.r0+(Math.atan2(p.y-d.l.y,p.x-d.l.x)-d.a0)*180/Math.PI;const m=Math.round(r/45)*45;if(Math.abs(r-m)<4)r=m;d.l.rot=r}
  render();
}
