'use strict';
/* ---------- recorte ---------- */
function fitRatio(r){const w=Math.min(doc.w,doc.h*r),hh=w/r;return{x:(doc.w-w)/2,y:(doc.h-hh)/2,w,h:hh}}
function cropDrag(d,p){
  const{x,y,w,h:hh}=d.r,dx=p.x-d.p.x,dy=p.y-d.p.y,m=24;
  if(d.hd==='move'){crop.x=clamp(x+dx,0,doc.w-w);crop.y=clamp(y+dy,0,doc.h-hh);return}
  let x1=x,y1=y,x2=x+w,y2=y+hh;const hd=d.hd;
  if(hd.includes('w'))x1=clamp(x+dx,0,x2-m);if(hd.includes('e'))x2=clamp(x+w+dx,x1+m,doc.w);
  if(hd.includes('n'))y1=clamp(y+dy,0,y2-m);if(hd.includes('s'))y2=clamp(y+hh+dy,y1+m,doc.h);
  if(crop.ratio){const r=crop.ratio;let nw=x2-x1,nh=y2-y1;
    if(hd.length===2){nh=nw/r}else if(hd==='n'||hd==='s'){nw=nh*r}else{nh=nw/r}
    const cx=(x1+x2)/2,cy=(y1+y2)/2;
    if(hd.length===2){if(hd.includes('w'))x1=x2-nw;else x2=x1+nw;if(hd.includes('n'))y1=y2-nh;else y2=y1+nh}
    else if(hd==='n'||hd==='s'){x1=cx-nw/2;x2=cx+nw/2;if(hd==='n')y1=y2-nh;else y2=y1+nh}
    else{y1=cy-nh/2;y2=cy+nh/2;if(hd==='w')x1=x2-nw;else x2=x1+nw}
    const sx=Math.min(1,(Math.min(x2,doc.w)-Math.max(x1,0))/(x2-x1)),sy=Math.min(1,(Math.min(y2,doc.h)-Math.max(y1,0))/(y2-y1)),s=Math.min(sx,sy);
    if(s<1||x1<0||y1<0||x2>doc.w||y2>doc.h){const f=fitRatio(r);const k=Math.min(1,Math.min(nw,f.w)/f.w);
      const ww=Math.min(nw,doc.w,doc.h*r),hh2=ww/r;let ax=(x1+x2)/2-ww/2,ay=(y1+y2)/2-hh2/2;
      x1=clamp(ax,0,doc.w-ww);y1=clamp(ay,0,doc.h-hh2);x2=x1+ww;y2=y1+hh2;void k}}
  crop.x=x1;crop.y=y1;crop.w=x2-x1;crop.h=y2-y1;
}
function applyCrop(){const c=crop;doc.layers.forEach(l=>{l.x-=c.x;l.y-=c.y});doc.w=Math.max(16,Math.round(c.w));doc.h=Math.max(16,Math.round(c.h));crop=null;view.zoom=1;view.px=view.py=0;commit('Recorte');panel();render();goBack();toast('Recortado para '+doc.w+' × '+doc.h)}

/* ---------- operações de documento ---------- */
function resizeDoc(nw){nw=clamp(Math.round(nw),16,6000);const f=nw/doc.w,nh=Math.max(16,Math.round(doc.h*f));
  for(const l of doc.layers){l.x*=f;l.y*=f;if(l.type==='text'){l.size*=f;l.strokeW*=f;l.shB*=f;l.shX*=f;l.shY*=f}else{l.w*=f;l.h*=f;if(l.type==='shape')l.strokeW*=f;else if(l.adj){l.adj.blur*=f;l.adj.pix*=f;l.adj.gsize=Math.max(.5,l.adj.gsize*f)}}}
  doc.adj.blur*=f;doc.adj.pix*=f;doc.adj.gsize=Math.max(.5,doc.adj.gsize*f);doc.w=nw;doc.h=nh;commit('Redimensionar arte');panel();render();toast('Nova medida: '+doc.w+' × '+doc.h)}
function resizeCanvas(nw,nh){const dx=(nw-doc.w)/2,dy=(nh-doc.h)/2;doc.layers.forEach(l=>{l.x+=dx;l.y+=dy});doc.w=nw;doc.h=nh;view.zoom=1;view.px=view.py=0;commit('Tamanho da tela');panel();render();toast('Tela '+nw+' × '+nh)}
function fillLayer(l,cover){const f=(cover?Math.max:Math.min)(doc.w/l.w,doc.h/l.h);l.w*=f;l.h*=f;l.x=doc.w/2;l.y=doc.h/2;commit();render()}

/* ---------- camadas ---------- */
function select(id){sel=id;panel();render()}
function deleteLayer(id){doc.layers=doc.layers.filter(l=>l.id!==id);if(sel===id)sel=null;commit('Excluir camada');panel();render()}
function moveLayer(id,dir){const i=doc.layers.findIndex(l=>l.id===id),j=i+dir;if(j<0||j>=doc.layers.length)return;[doc.layers[i],doc.layers[j]]=[doc.layers[j],doc.layers[i]];commit();panel();render()}
function dupLayer(id){const i=doc.layers.findIndex(l=>l.id===id);if(i<0)return;const c=JSON.parse(JSON.stringify(doc.layers[i],rep));c.id=doc.nid++;c.x+=doc.w*.03;c.y+=doc.w*.03;doc.layers.splice(i+1,0,c);sel=c.id;commit();panel();render()}
function addText(){const l=newLayer('text',{text:'Seu texto aqui',font:'Anton',size:Math.round(doc.w*.085),color:'#ffffff',bold:false,italic:false,align:'center',lh:1.15,strokeW:0,strokeC:'#000000',shadow:false,shC:'#000000',shB:10,shX:0,shY:6});
  doc.layers.push(l);sel=l.id;optsOpen=true;commit('Texto');panel();render()}
function addShape(v){const base=Math.round(doc.w*.4),ln=v==='line'||v==='arrow';
  const l=newLayer('shape',{shape:v,w:base,h:ln?30:v==='speech'||v==='thought'?Math.round(base*.65):v==='rect'||v==='round'?Math.round(base*.65):base,fill:false,fillC:'#ffffff',strokeW:Math.max(ln?6:4,Math.round(doc.w*(ln?.012:.008))),strokeC:'#ffffff',dash:0,radius:.35,points:v==='burst'?12:5,tailA:100,tailL:.45});
  doc.layers.push(l);sel=l.id;optsOpen=true;commit('Forma');panel();render()}

/* ---------- imagens ---------- */
function loadImg(blob){return new Promise((res,rej)=>{const u=URL.createObjectURL(blob),im=new Image();im.onload=()=>res(im);im.onerror=()=>rej(new Error('Não consegui abrir a imagem.'));im.src=u})}
async function addAsset(file){
  let blob=file,im=await loadImg(blob);
  const max=4096;if(Math.max(im.naturalWidth,im.naturalHeight)>max){
    const f=max/Math.max(im.naturalWidth,im.naturalHeight),c=document.createElement('canvas');c.width=Math.round(im.naturalWidth*f);c.height=Math.round(im.naturalHeight*f);c.getContext('2d').drawImage(im,0,0,c.width,c.height);
    const png=/png|webp|gif/i.test(file.type);blob=await new Promise(r=>c.toBlob(r,png?'image/png':'image/jpeg',.95));im=await loadImg(blob)}
  const id='a'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
  assets[id]={blob,img:im,w:im.naturalWidth,h:im.naturalHeight};safe(()=>kvSet('asset:'+id,blob));return id}
async function openPhoto(file){try{const id=await addAsset(file),a=assets[id];
    doc={w:a.w,h:a.h,bg:null,adj:defAdj(),nid:1,layers:[]};sel=null;view.zoom=1;view.px=view.py=0;
    const l=newLayer('image',{asset:id,name:'Foto',w:a.w,h:a.h,adj:defAdj()});doc.layers.push(l);sel=l.id;commit('Foto aberta');panel();render();showSplash(false);toast('Foto aberta: '+a.w+' × '+a.h)}catch(e){toast(e.message)}}
async function addImages(files){try{for(const f of files){const id=await addAsset(f),a=assets[id];const s=Math.min(1,doc.w*.8/a.w,doc.h*.8/a.h);
      const l=newLayer('image',{asset:id,name:f.name.replace(/\.[^.]+$/,'').slice(0,24)||'Imagem',w:a.w*s,h:a.h*s,adj:defAdj()});doc.layers.push(l);sel=l.id}
    commit('Imagem inserida');panel();render()}catch(e){toast(e.message)}}
$('#photoIn').onchange=e=>{const f=e.target.files[0];e.target.value='';if(f)openPhoto(f)};
$('#imgIn').onchange=e=>{const f=[...e.target.files];e.target.value='';if(f.length)addImages(f)};

/* ---------- fontes do aparelho ---------- */
async function addFontFile(file){const buf=await file.arrayBuffer();let name=file.name.replace(/\.[^.]+$/,'').replace(/[_]+/g,' ').trim()||'Fonte';
  if(customFonts[name]||BUILTIN.includes(name))name+=' '+(Object.keys(customFonts).length+2);
  const ff=new FontFace(name,buf);await ff.load();document.fonts.add(ff);customFonts[name]=ff;fontBufs[name]=buf;safe(()=>kvSet('font:'+name,buf));return name}
$('#fontIn').onchange=async e=>{const fs=[...e.target.files];e.target.value='';let ok=0,bad=0;
  for(const f of fs){try{await addFontFile(f);ok++}catch(err){bad++}}
  toast(ok?`${ok} fonte(s) carregada(s)${bad?`, ${bad} inválida(s)`:''}`:'Arquivo de fonte inválido. Use .ttf, .otf ou .woff.');
  if(fontPickerRefresh)fontPickerRefresh();render()};
let fontPickerRefresh=null;
function openFontPicker(l){
  const body=h('div',{});
  const close=modal('Escolher fonte',body);
  const build=()=>{body.replaceChildren();
    body.append(h('button',{class:'btn accent',onclick:()=>$('#fontIn').click()},'Carregar fonte do aparelho'),
      h('div',{class:'note'},'Escolha arquivos .ttf, .otf ou .woff no app Arquivos. As fontes ficam salvas neste navegador.'));
    const group=(title,names,rm)=>{if(!names.length)return;body.append(h('div',{class:'h'},title));
      for(const n of names)body.append(h('div',{class:'frow'},
        h('button',{class:'pick',style:{fontFamily:`"${n}", sans-serif`},onclick:()=>{l.font=n;commit();render();panel();close();fontPickerRefresh=null}},n+'  Aa Bb 123'),
        rm?h('button',{class:'ghost sm danger',onclick:()=>{document.fonts.delete(customFonts[n]);delete customFonts[n];safe(()=>kvDel('font:'+n));build();render()}},'Remover'):null))};
    group('Fontes do PicSay',BUILTIN);group('Do seu aparelho',Object.keys(customFonts),true);group('Do iPhone',SYSFONTS)};
  fontPickerRefresh=build;build()}

/* ---------- histórico ---------- */
const updUndo=()=>{$('#undo').disabled=hi<=0;$('#redo').disabled=hi>=hist.length-1};
let saveT=0;
function commit(label){const s=snap();if(hist[hi]===s)return;hist=hist.slice(0,hi+1);labels=labels.slice(0,hi+1);hist.push(s);labels.push(typeof label==='string'?label:'Edição');if(hist.length>80){hist.shift();labels.shift()}hi=hist.length-1;updUndo();
  clearTimeout(saveT);saveT=setTimeout(()=>safe(()=>kvSet('state',s)),700)}
function restore(s){const o=JSON.parse(s);doc=o.doc;sel=o.sel;fixDoc();crop=null;updUndo();panel();render();clearTimeout(saveT);saveT=setTimeout(()=>safe(()=>kvSet('state',s)),700)}
$('#undo').onclick=()=>{if(hi>0){hi--;restore(hist[hi])}};
$('#redo').onclick=()=>{if(hi<hist.length-1){hi++;restore(hist[hi])}};
