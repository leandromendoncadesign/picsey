'use strict';
/* ---------- medidas ---------- */
const mctx=document.createElement('canvas').getContext('2d');
const fontStr=(l,k)=>`${l.italic?'italic ':''}${l.bold?'700':'400'} ${Math.max(1,l.size*k)}px "${l.font}", sans-serif`;
function arcSag(ws,th,size){th=Math.abs(th);let m=0;for(const w of ws)if(w>1)m=Math.max(m,w/th*(1-Math.cos(th/2)));return m+size*.1*th/Math.PI}
function bbox(l){
  if(l.type==='shape'&&(l.shape==='line'||l.shape==='arrow'))return{w:l.w,h:Math.max(l.h,l.strokeW+24)};
  if(l.type!=='text')return{w:l.w,h:l.h};
  mctx.font=fontStr(l,1);
  const lines=l.text.split('\n');let w=0;const ws=[];for(const s of lines){const m=mctx.measureText(s).width;ws.push(m);w=Math.max(w,m)}
  const pad=l.strokeW+4,sag=l.arc&&Math.abs(l.arc)>=1?arcSag(ws,l.arc/100*Math.PI,l.size):0;
  return{w:Math.max(20,w+pad*2),h:Math.max(20,lines.length*l.size*l.lh+pad*2+sag)};
}

/* ---------- ajustes de imagem ---------- */
function boxPass(src,dst,w,h,r,horiz){
  const len=horiz?w:h,lines=horiz?h:w,si=horiz?4:w*4,sl=horiz?w*4:4,div=2*r+1;
  for(let ln=0;ln<lines;ln++){const base=ln*sl;
    for(let c=0;c<4;c++){let sum=0;
      for(let j=-r;j<=r;j++)sum+=src[base+clamp(j,0,len-1)*si+c];
      for(let i=0;i<len;i++){dst[base+i*si+c]=sum/div;
        sum+=src[base+Math.min(len-1,i+r+1)*si+c]-src[base+Math.max(0,i-r)*si+c];}}}
}
function boxBlur(d,w,h,r){r=clamp(Math.round(r*0.58),1,40);const tmp=new Uint8ClampedArray(d.length);
  for(let i=0;i<3;i++){boxPass(d,tmp,w,h,r,true);boxPass(tmp,d,w,h,r,false)}}
function hash2(x,y){let n=Math.imul(x,374761393)+Math.imul(y,668265263)|0;n=Math.imul(n^(n>>>13),1274126177);n^=n>>>16;return(n&1023)/511.5-1}
function hueMat(deg){const a=deg*Math.PI/180,c=Math.cos(a),n=Math.sin(a);return[.213+c*.787-n*.213,.715-c*.715-n*.715,.072-c*.072+n*.928,.213-c*.213+n*.143,.715+c*.285+n*.14,.072-c*.072-n*.283,.213-c*.213-n*.787,.715-c*.715+n*.715,.072+c*.928+n*.072]}
function distortPass(d,w,h,p){
  const src=new Uint8ClampedArray(d),cx=w/2,cy=h/2,R=Math.min(w,h)/2;
  const sph=p.sph/100,bul=p.bul/100,twi=p.twi/100,spl=p.spl/100,stH=(p.strH+p.str)/100,stV=(p.strV+p.str)/100,mir=p.mir>0?p.mir/100*h:0,pa=p.part/100;
  const pm=pa>0?[0,90,180,270].map(hueMat):null;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    let sx=x+.5,sy=y+.5;
    if(stH>0||stV>0){let ix=(sx-cx)/cx,iy=(sy-cy)/cy;if(stH>0)ix=Math.sign(ix)*Math.pow(Math.abs(ix),1+stH*1.5);if(stV>0)iy=Math.sign(iy)*Math.pow(Math.abs(iy),1+stV*1.5);sx=cx+ix*cx;sy=cy+iy*cy}
    let u=(sx-cx)/R,v=(sy-cy)/R;
    if(sph>0){const r=Math.hypot(u,v);if(r>0&&r<1){const f=(r*(1-sph)+sph*Math.asin(r)/(Math.PI/2))/r;u*=f;v*=f}}
    if(bul!==0){const r=Math.hypot(u,v);if(r>0&&r<1){const rs=bul>0?Math.pow(r,1+bul*1.2):Math.pow(r,1/(1-bul*1.2));const f=rs/r;u*=f;v*=f}}
    if(twi!==0){const r=Math.hypot(u,v);if(r<1){const t=twi*Math.PI*2*(1-r)*(1-r),c=Math.cos(t),n=Math.sin(t),nu=u*c-v*n;v=u*n+v*c;u=nu}}
    if(spl>0){const r=Math.hypot(u,v);if(r>0){const f=(r+spl*.06*Math.sin(r*Math.PI*12))/r;u*=f;v*=f}}
    sx=cx+u*R;sy=cy+v*R;
    if(mir>0&&sy>mir)sy=2*mir-sy;
    let q=0;
    if(pa>0){q=(sx>=cx?1:0)+(sy>=cy?2:0);sx=((sx*2)%w+w)%w;sy=((sy*2)%h+h)%h}
    const fx=clamp(sx-.5,0,w-1),fy=clamp(sy-.5,0,h-1),x0=fx|0,y0=fy|0,x1=Math.min(w-1,x0+1),y1=Math.min(h-1,y0+1),ax=fx-x0,ay=fy-y0;
    const i00=(y0*w+x0)*4,i10=(y0*w+x1)*4,i01=(y1*w+x0)*4,i11=(y1*w+x1)*4,o=(y*w+x)*4;
    const w00=(1-ax)*(1-ay),w10=ax*(1-ay),w01=(1-ax)*ay,w11=ax*ay;
    let r=src[i00]*w00+src[i10]*w10+src[i01]*w01+src[i11]*w11,g=src[i00+1]*w00+src[i10+1]*w10+src[i01+1]*w01+src[i11+1]*w11,b=src[i00+2]*w00+src[i10+2]*w10+src[i01+2]*w01+src[i11+2]*w11;
    d[o+3]=src[i00+3]*w00+src[i10+3]*w10+src[i01+3]*w01+src[i11+3]*w11;
    if(pa>0){const m=pm[q],R2=m[0]*r+m[1]*g+m[2]*b,G2=m[3]*r+m[4]*g+m[5]*b,B2=m[6]*r+m[7]*g+m[8]*b,L=.299*R2+.587*G2+.114*B2;
      const pr=Math.round(clamp(L+(R2-L)*1.6,0,255)/255*3)/3*255,pg=Math.round(clamp(L+(G2-L)*1.6,0,255)/255*3)/3*255,pb=Math.round(clamp(L+(B2-L)*1.6,0,255)/255*3)/3*255;
      r+=(pr-r)*pa;g+=(pg-g)*pa;b+=(pb-b)*pa}
    d[o]=r;d[o+1]=g;d[o+2]=b}
}
const hexArr=h6=>{const n=parseInt(h6.slice(1),16);return[(n>>16)&255,(n>>8)&255,n&255]};
function hsl2rgb(h,s,l){h=(((h%360)+360)%360)/360;const q=l<.5?l*(1+s):l+s-l*s,p2=2*l-q,f=t=>{t=(t+1)%1;return t<1/6?p2+(q-p2)*6*t:t<.5?q:t<2/3?p2+(q-p2)*(2/3-t)*6:p2};return[f(h+1/3)*255,f(h)*255,f(h-1/3)*255]}
function applyAdj(id,p,s){
  const d=id.data,w=id.width,h=id.height,n=d.length;
  if(p.sph>0||p.bul!==0||p.twi!==0||p.spl>0||p.str>0||p.strH>0||p.strV>0||p.mir>0||p.part>0)distortPass(d,w,h,p);
  if(p.pix>0){const b=Math.max(2,Math.round(p.pix*s));
    for(let y0=0;y0<h;y0+=b)for(let x0=0;x0<w;x0+=b){const x1=Math.min(w,x0+b),y1=Math.min(h,y0+b);let r=0,g=0,bl=0,a=0,c=0;
      for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const i=(y*w+x)*4;r+=d[i];g+=d[i+1];bl+=d[i+2];a+=d[i+3];c++}
      r/=c;g/=c;bl/=c;a/=c;
      for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const i=(y*w+x)*4;d[i]=r;d[i+1]=g;d[i+2]=bl;d[i+3]=a}}}
  if(p.blur>0)boxBlur(d,w,h,p.blur*s);
  if(p.sharp>0){const c=new Uint8ClampedArray(d);boxBlur(c,w,h,Math.max(2,2.2*s));const a=p.sharp/100*1.6;
    for(let i=0;i<n;i+=4){d[i]+=a*(d[i]-c[i]);d[i+1]+=a*(d[i+1]-c[i+1]);d[i+2]+=a*(d[i+2]-c[i+2])}}
  const ex=Math.pow(2,p.exp/50),br=p.bright*1.02,cf=p.contrast>=0?1+p.contrast/50:1+p.contrast/100,sf=p.sat>=0?1+p.sat/50:1+p.sat/100;
  const ha=p.hue*Math.PI/180,hc=Math.cos(ha),hs=Math.sin(ha),hueOn=p.hue!==0;
  const m0=.213+hc*.787-hs*.213,m1=.715-hc*.715-hs*.715,m2=.072-hc*.072+hs*.928,m3=.213-hc*.213+hs*.143,m4=.715+hc*.285+hs*.14,m5=.072-hc*.072-hs*.283,m6=.213-hc*.213-hs*.787,m7=.715-hc*.715+hs*.715,m8=.072+hc*.928+hs*.072;
  const popOn=p.pop>0,gy=p.gray/100,se=p.sepia/100,ng=p.neg/100,tt=p.tint/100,dd=p.duo/100,rr=p.rain/100,vg=p.vig/100,bwt=p.bwt,ps=p.post>1?p.post-1:0;
  const tc=hexArr(p.tintC||'#3b82f6'),lutC=p.colz>0?Array.from({length:256},(_,i)=>hsl2rgb(p.colh,.6,.12+.76*i/255)):null;
  const da=hexArr(p.duoA||'#2a0a5e'),db=hexArr(p.duoB||'#ffc83d'),lutD=dd>0?Array.from({length:256},(_,i)=>[da[0]+(db[0]-da[0])*i/255,da[1]+(db[1]-da[1])*i/255,da[2]+(db[2]-da[2])*i/255]):null;
  const rain=rr>0?Array.from({length:w},(_,x)=>hsl2rgb(x/w*360,1,.5)):null;
  const any=popOn||ex!==1||br!==0||cf!==1||sf!==1||hueOn||gy>0||se>0||ng>0||tt>0||lutC||dd>0||rr>0||vg>0||bwt>0||ps>0;
  if(any){const cx=w/2,cy=h/2,maxd=Math.hypot(cx,cy)||1;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
      let r=d[i]*ex+br,g=d[i+1]*ex+br,b=d[i+2]*ex+br;
      if(cf!==1){r=(r-128)*cf+128;g=(g-128)*cf+128;b=(b-128)*cf+128}
      if(hueOn){const R=r,G=g,B=b;r=m0*R+m1*G+m2*B;g=m3*R+m4*G+m5*B;b=m6*R+m7*G+m8*B}
      if(sf!==1){const L=.299*r+.587*g+.114*b;r=L+(r-L)*sf;g=L+(g-L)*sf;b=L+(b-L)*sf}
      if(popOn){const mx=Math.max(r,g,b),mn=Math.min(r,g,b),dl=mx-mn;let k=0;
        if(dl>10){let hh=mx===r?((g-b)/dl)%6:mx===g?(b-r)/dl+2:(r-g)/dl+4;hh=((hh*60)+360)%360;let dh=Math.abs(hh-p.poph);dh=Math.min(dh,360-dh);k=clamp(1-(dh-25)/30,0,1)}
        const L=.299*r+.587*g+.114*b;r=L+(r-L)*k;g=L+(g-L)*k;b=L+(b-L)*k}
      if(gy>0){const L=.299*r+.587*g+.114*b;r+=(L-r)*gy;g+=(L-g)*gy;b+=(L-b)*gy}
      if(se>0){const L=.299*r+.587*g+.114*b;r+=(L*1.07+18-r)*se;g+=(L*.92+8-g)*se;b+=(L*.72-b)*se}
      if(ng>0){r=r*(1-ng)+(255-r)*ng;g=g*(1-ng)+(255-g)*ng;b=b*(1-ng)+(255-b)*ng}
      if(bwt>0){const L=.299*r+.587*g+.114*b;r=g=b=L>=bwt?255:0}
      if(ps>0){r=Math.round(clamp(r,0,255)/255*ps)/ps*255;g=Math.round(clamp(g,0,255)/255*ps)/ps*255;b=Math.round(clamp(b,0,255)/255*ps)/ps*255}
      if(tt>0){const L=clamp(.299*r+.587*g+.114*b,0,255),k=.25+L/255;r+=(clamp(tc[0]*k,0,255)-r)*tt;g+=(clamp(tc[1]*k,0,255)-g)*tt;b+=(clamp(tc[2]*k,0,255)-b)*tt}
      if(lutC){const c=lutC[clamp(.299*r+.587*g+.114*b,0,255)|0];r=c[0];g=c[1];b=c[2]}
      if(dd>0){const c=lutD[clamp(.299*r+.587*g+.114*b,0,255)|0];r+=(c[0]-r)*dd;g+=(c[1]-g)*dd;b+=(c[2]-b)*dd}
      if(rr>0){const L=clamp(.299*r+.587*g+.114*b,0,255),k=.3+1.1*L/255,c=rain[x];r+=(clamp(c[0]*k,0,255)-r)*rr;g+=(clamp(c[1]*k,0,255)-g)*rr;b+=(clamp(c[2]*k,0,255)-b)*rr}
      if(vg>0){const t=Math.max(0,(Math.hypot(x-cx,y-cy)/maxd-.35)/.65),f=1-vg*t*t*1.1;r*=f;g*=f;b*=f}
      d[i]=r;d[i+1]=g;d[i+2]=b}}
  if(p.comic>0){const cell=Math.max(3,Math.round(p.comic*s)),src=new Uint8ClampedArray(d);
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const ccx=(Math.floor(x/cell)+.5)*cell,ccy=(Math.floor(y/cell)+.5)*cell,ci=(Math.min(h-1,ccy|0)*w+Math.min(w-1,ccx|0))*4,i=(y*w+x)*4;
      const L=(.299*src[ci]+.587*src[ci+1]+.114*src[ci+2])/255,rad=cell*.72*Math.sqrt(1-L);
      if(Math.hypot(x+.5-ccx,y+.5-ccy)<rad){const q=v=>Math.round(clamp(v*1.1,0,255)/255*4)/4*255;d[i]=q(src[ci]);d[i+1]=q(src[ci+1]);d[i+2]=q(src[ci+2])}
      else{d[i]=246;d[i+1]=240;d[i+2]=225}}}
  if(p.grain>0){const amp=p.grain/100*90,cell=Math.max(1,Math.round(p.gsize*s));
    for(let y=0;y<h;y++){const cy=(y/cell)|0;for(let x=0;x<w;x++){const v=hash2((x/cell)|0,cy)*amp,i=(y*w+x)*4;d[i]+=v;d[i+1]+=v;d[i+2]+=v}}}
}
function baseImageSource(l,k){
  const a=assets[l.asset];if(!a)return null;
  if(isDefAdj(l.adj))return a.img;
  const tw=Math.max(1,Math.round(Math.min(a.w,l.w*k))),th=Math.max(1,Math.round(tw*a.h/a.w));
  const key=JSON.stringify(l.adj)+'|'+tw;
  if(l._p&&l._p.key===key)return l._p.c;
  const c=document.createElement('canvas');c.width=tw;c.height=th;const cx=c.getContext('2d',{willReadFrequently:true});
  cx.drawImage(a.img,0,0,tw,th);const id=cx.getImageData(0,0,tw,th);applyAdj(id,l.adj,tw/l.w);cx.putImageData(id,0,0);
  l._p={key,c};return c;
}
