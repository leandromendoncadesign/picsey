'use strict';
/* ---------- componentes de painel ---------- */
const SWATCH=['#ffffff','#000000','#f0b429','#e5484d','#3b82f6','#22c55e','#8b5cf6'];
function slider(label,min,max,step,get,set,fmt){fmt=fmt||(v=>String(Math.round(v*100)/100));
  const out=h('output',{},fmt(get())),inp=h('input',{type:'range',min,max,step});inp.value=get();
  inp.addEventListener('input',()=>{set(+inp.value);out.textContent=fmt(+inp.value);render()});
  inp.addEventListener('change',()=>commit());
  return h('label',{class:'row sl'},h('span',{class:'lab'},label),inp,out)}
function chips(opts,get,set){return h('div',{class:'chips'},opts.map(o=>h('button',{class:'chip'+(get()===o.v?' on':''),onclick:()=>{set(o.v);commit();panel();render()}},o.l)))}
function toggle(label,get,set){const i=h('input',{type:'checkbox',checked:!!get()});i.addEventListener('change',()=>{set(i.checked);commit();panel();render()});return h('label',{class:'switch'},i,h('span',{},label))}
function colorField(label,get,set){const inp=h('input',{type:'color'});inp.value=get();
  inp.addEventListener('input',()=>{set(inp.value);render()});inp.addEventListener('change',()=>commit());
  const sw=h('div',{class:'sw'},SWATCH.map(c=>h('button',{style:{background:c},'aria-label':c,onclick:()=>{set(c);inp.value=c;commit();render()}})));
  return h('div',{},h('div',{class:'row'},h('span',{class:'lab'},label),inp,h('button',{class:'ghost sm',onclick:()=>{pickCb=c=>{set(c);inp.value=c;commit();render()};toast('Toque na arte para pegar uma cor')}},'Conta-gotas')),sw)}
const opacityRow=l=>slider('Opacidade',0,100,1,()=>l.op*100,v=>l.op=v/100,v=>Math.round(v)+'%');

/* ---------- painéis ---------- */
const svgI=inner=>{const s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('viewBox','0 0 24 24');s.innerHTML=inner;return s};
const BOT=[
 ['adjust','Ajustar','<path d="M3 7h6M15 7h6M3 12h2M11 12h10M3 17h8M17 17h4"/><circle cx="12" cy="7" r="2.2"/><circle cx="8" cy="12" r="2.2"/><circle cx="14" cy="17" r="2.2"/>'],
 ['effect','Efeito','<path d="m3.5 20.5 10-10"/><path d="m15 4 1.1 2.9L19 8l-2.9 1.1L15 12l-1.1-2.9L11 8l2.9-1.1z"/><path d="m19 14 .7 1.8L21.5 16.5l-1.8.7L19 19l-.7-1.8-1.8-.7 1.8-.7z"/>'],
 ['sticker','Adesivo','<path d="M12 4c5 0 9 3 9 7s-4 7-9 7c-1 0-2-.1-3-.3L5 20l1-3.5C4.2 15.3 3 13.300 3 11c0-4 4-7 9-7z" fill="currentColor"/>'],
 ['export','Exportar','<circle cx="6" cy="12" r="2.6" fill="currentColor"/><circle cx="18" cy="6" r="2.6" fill="currentColor"/><circle cx="18" cy="18" r="2.6" fill="currentColor"/><path d="m8.3 10.8 7.4-3.6M8.3 13.2l7.4 3.6"/>']];
const bottomEl=$('#bottom');
BOT.forEach(([id,lab,ic])=>bottomEl.append(h('button',{class:'bi','data-id':id,onclick:()=>botTap(id)},svgI(ic),lab)));
function botTap(id){
  if(id==='layers'){openLayers();return}
  if(id==='export'){openExport();return}
  openList(id)}
const IC={
 flipH:'<path d="M12 3v18" stroke-dasharray="2 3"/><path d="M9 7 3 17h6z"/><path d="m15 7 6 10h-6z"/>',
 flipV:'<path d="M3 12h18" stroke-dasharray="2 3"/><path d="M7 9h10l-5-6z"/><path d="M7 15h10l-5 6z"/>',
 rot:'<path d="M20 12a8 8 0 1 1-3-6.2"/><path d="M20 4v5h-5"/>',
 arc:'<path d="M3 18c1-9 17-9 18 0"/><path d="M7.500 13.500h.01M12 11.800h.01M16.500 13.500h.01" stroke-width="3.2"/>',
 ras:'<rect x="4" y="4" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/><rect x="13" y="4" width="7" height="7" opacity=".45"/><rect x="4" y="13" width="7" height="7" opacity=".45"/>'};
Object.assign(IC,{opts:'<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
 lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
 unlock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.500-2"/>',
 dup:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3"/>',
 del:'<path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/>'});
const act=(label,ic,fn,on,cls)=>h('button',{class:'act'+(on?' on':'')+(cls?' '+cls:''),onclick:fn},svgI(ic),h('span',{},label));
function xformActs(l,extra){
  return h('div',{class:'acts'},...(extra||[]),
    act('Espelhar',IC.flipH,()=>{l.flip=!l.flip;commit('Espelhar');panel();render()},l.flip),
    act('Virar',IC.flipV,()=>{l.flipV=!l.flipV;commit('Virar');panel();render()},l.flipV),
    act('Girar 90°',IC.rot,()=>{let r=l.rot+90;if(r>180)r-=360;l.rot=r;commit('Girar 90°');panel();render()}))}
async function rasterizeText(l){
  try{const b=bbox(l),m=l.shadow?Math.ceil(l.shB*2+Math.max(Math.abs(l.shX),Math.abs(l.shY))):0,W=b.w+2*m,H=b.h+2*m,k=Math.min(2,4096/Math.max(W,H)),c=mk(Math.max(1,Math.round(W*k)),Math.max(1,Math.round(H*k)));
    drawLayer(c.getContext('2d'),Object.assign({},l,{x:W/2,y:H/2,rot:0,flip:false,flipV:false,op:1}),k);
    const blob=await new Promise(r=>c.toBlob(r,'image/png'));if(!blob)throw new Error('Não consegui rasterizar o texto.');
    const id=await addAsset(blob),i=doc.layers.findIndex(x=>x.id===l.id);if(i<0)return;
    const n=newLayer('image',{asset:id,name:(l.text.replace(/\s+/g,' ').trim().slice(0,18)||'Texto')+' (imagem)',x:l.x,y:l.y,rot:l.rot,flip:l.flip,flipV:l.flipV,op:l.op,w:W,h:H,adj:defAdj()});
    doc.layers[i]=n;sel=n.id;commit('Rasterizar texto');panel();render();toast('O texto virou imagem. Agora aceita efeitos, ajustes e borracha.')}
  catch(e){toast(e.message||'Falha ao rasterizar')}}
const SHEETNAME={text:'Texto',shape:'Forma',image:'Imagem',paint:'Pintura'};
let optsOpen=false;
function quickBar(l){const lk=!!l.locked;
  return h('div',{class:'acts'},...[
    act('Opções',IC.opts,()=>{optsOpen=true;panel()}),
    act(lk?'Destrancar':'Trancar',lk?IC.unlock:IC.lock,()=>{l.locked=!l.locked;commit(l.locked?'Trancar camada':'Destrancar camada');panel();render();toast(l.locked?'Camada trancada. Ela não se move mais.':'Camada destrancada.')},lk),
    act('Espelhar',IC.flipH,()=>{l.flip=!l.flip;commit('Espelhar');panel();render()},l.flip),
    act('Virar',IC.flipV,()=>{l.flipV=!l.flipV;commit('Virar');panel();render()},l.flipV),
    act('Girar 90°',IC.rot,()=>{let r=l.rot+90;if(r>180)r-=360;l.rot=r;commit('Girar 90°');panel();render()}),
    l.type==='text'?act('Meia-lua',IC.arc,()=>{l.arc=l.arc?0:100;commit('Meia-lua');panel();render()},!!l.arc):null,
    l.type==='text'?act('Rasterizar',IC.ras,()=>rasterizeText(l)):null,
    act('Duplicar',IC.dup,()=>dupLayer(l.id)),
    lk?null:act('Excluir',IC.del,()=>deleteLayer(l.id),false,'danger')].filter(Boolean))}
function panel(){
  const body=$('#panelBody'),sh=$('#sheet'),ov=$('#ovl'),ob=$('#ovlBody');body.replaceChildren();ob.replaceChildren();
  let title=null,items=null,close=null;
  if(crop)items=pCrop();
  else if(mode==='brush'){title='Pincel';items=pBrush();close=['Concluir',()=>{mode='view';goBack()}]}
  const list=items?items.flat(Infinity).filter(Boolean):[];
  if(list.length){ov.hidden=true;sh.hidden=false;
    if(title)body.append(h('div',{class:'shead'},h('strong',{},title),close?h('button',{class:'ghost',onclick:()=>{close[1]();panel();render()}},close[0]):null));
    body.append(...list);return}
  sh.hidden=true;
  const l=curLayer();if(!l){ov.hidden=true;optsOpen=false;return}
  ov.hidden=false;ov.classList.toggle('full',optsOpen);
  if(!optsOpen){ob.append(quickBar(l));return}
  const its=(l.type==='text'?pText():l.type==='shape'?pShape():l.type==='image'?pImage():pPaintSel()).flat(Infinity).filter(Boolean);
  ob.append(h('div',{class:'shead'},h('strong',{},SHEETNAME[l.type]+(l.locked?' (trancada)':'')),h('button',{class:'ghost',onclick:()=>{optsOpen=false;panel()}},'Fechar')),...its)}
function pLayers(){const out=[];
  if(!doc.layers.length)out.push(h('div',{class:'note'},'Nenhuma camada ainda. Use as abas Texto, Formas ou Imagem para adicionar.'));
  const n=doc.layers.length;
  for(let i=n-1;i>=0;i--){const l=doc.layers[i];
    out.push(h('div',{class:'layer'+(l.id===sel?' on':'')},
      h('button',{class:'s','aria-label':l.vis?'Ocultar':'Mostrar',onclick:()=>{l.vis=!l.vis;commit();panel();render()}},l.vis?'●':'○'),
      h('button',{class:'nm',onclick:()=>select(l.id)},layerLabel(l)),h('span',{class:'t'},TYPELAB[l.type]),
      h('button',{class:'s','aria-label':'Para frente',disabled:i===n-1,onclick:()=>moveLayer(l.id,1)},'↑'),
      h('button',{class:'s','aria-label':'Para trás',disabled:i===0,onclick:()=>moveLayer(l.id,-1)},'↓'),
      h('button',{class:'s','aria-label':'Duplicar',onclick:()=>dupLayer(l.id)},'⧉'),
      h('button',{class:'s','aria-label':'Excluir',onclick:()=>deleteLayer(l.id)},'✕')))}
  const l=curLayer();
  if(l){out.push(h('div',{class:'h'},'Camada selecionada'),opacityRow(l),toggle('Espelhar na horizontal',()=>l.flip,v=>l.flip=v),
    slider('Girar',-180,180,1,()=>l.rot,v=>l.rot=v,v=>Math.round(v)+'°'))}
  out.push(h('div',{class:'note'},'↑ traz para frente, ↓ envia para trás. A camada de cima aparece sobre as de baixo.'));
  return out}
function pText(){const out=[];const l=curLayer();
  if(!l||l.type!=='text')return out;
  const ta=h('textarea',{id:'txt','aria-label':'Texto',value:l.text});
  ta.addEventListener('input',()=>{l.text=ta.value||' ';render()});ta.addEventListener('change',()=>{commit();panel()});
  out.push(xformActs(l,[act('Meia-lua',IC.arc,()=>{l.arc=l.arc?0:100;commit('Meia-lua');panel();render()},!!l.arc),act('Rasterizar',IC.ras,()=>rasterizeText(l))]),ta,h('div',{class:'frow'},h('span',{class:'lab note'},'Fonte'),h('button',{class:'pick',style:{fontFamily:`"${l.font}", sans-serif`},onclick:()=>openFontPicker(l)},l.font)),
    slider('Tamanho',8,Math.max(400,Math.round(doc.w/2)),1,()=>l.size,v=>l.size=v,v=>Math.round(v)),
    slider('Curvatura',-100,100,1,()=>l.arc||0,v=>l.arc=v,v=>Math.round(v)+'%'),
    colorField('Cor',()=>l.color,v=>l.color=v),
    h('div',{class:'chips'},
      h('button',{class:'chip'+(l.bold?' on':''),onclick:()=>{l.bold=!l.bold;commit();panel();render()}},'Negrito'),
      h('button',{class:'chip'+(l.italic?' on':''),onclick:()=>{l.italic=!l.italic;commit();panel();render()}},'Itálico')),
    chips([{v:'left',l:'Esquerda'},{v:'center',l:'Centro'},{v:'right',l:'Direita'}],()=>l.align,v=>l.align=v),
    slider('Entrelinha',0.7,2,0.05,()=>l.lh,v=>l.lh=v),
    h('div',{class:'h'},'Contorno'),
    slider('Espessura',0,Math.max(30,Math.round(l.size/3)),1,()=>l.strokeW,v=>l.strokeW=v,v=>Math.round(v)),
    l.strokeW>0?colorField('Cor do contorno',()=>l.strokeC,v=>l.strokeC=v):null,
    h('div',{class:'h'},'Sombra'),
    toggle('Sombra',()=>l.shadow,v=>l.shadow=v),
    l.shadow?[colorField('Cor da sombra',()=>l.shC,v=>l.shC=v),slider('Desfoque',0,60,1,()=>l.shB,v=>l.shB=v),slider('Horizontal',-40,40,1,()=>l.shX,v=>l.shX=v),slider('Vertical',-40,40,1,()=>l.shY,v=>l.shY=v)]:null,
    opacityRow(l));
  return out}
function pShape(){const out=[];const l=curLayer();if(!l||l.type!=='shape')return out;
  const mx=Math.max(doc.w,doc.h)*1.5;
  const ln=l.shape==='line'||l.shape==='arrow';
  out.push(xformActs(l),h('div',{class:'h'},'Editar forma selecionada'),
    ln?null:toggle('Preenchimento',()=>l.fill,v=>l.fill=v),!ln&&l.fill?colorField('Cor de dentro',()=>l.fillC,v=>l.fillC=v):null,
    slider(ln?'Espessura':'Contorno',ln?1:0,Math.max(40,Math.round(doc.w/20)),1,()=>l.strokeW,v=>l.strokeW=v,v=>Math.round(v)),
    l.strokeW>0?colorField(ln?'Cor da linha':'Cor do contorno',()=>l.strokeC,v=>l.strokeC=v):null,
    l.strokeW>0?chips([{v:0,l:'Contínua'},{v:1,l:'Tracejada'},{v:2,l:'Pontilhada'}],()=>l.dash||0,v=>l.dash=v):null,
    slider(ln?'Comprimento':'Largura',20,mx,1,()=>l.w,v=>l.w=v,v=>Math.round(v)),ln?null:slider('Altura',20,mx,1,()=>l.h,v=>l.h=v,v=>Math.round(v)),
    l.shape==='round'?slider('Cantos',0,1,0.01,()=>l.radius,v=>l.radius=v,v=>Math.round(v*100)+'%'):null,
    l.shape==='star'||l.shape==='burst'?slider('Pontas',3,l.shape==='burst'?30:12,1,()=>l.points,v=>l.points=Math.round(v),v=>Math.round(v)):null,
    l.shape==='speech'||l.shape==='thought'?[slider('Direção',0,360,1,()=>l.tailA,v=>l.tailA=v,v=>Math.round(v)+'°'),slider('Tamanho da ponta',0.1,1.2,0.01,()=>l.tailL,v=>l.tailL=v)]:null,
    opacityRow(l),h('div',{class:'note'},'Arraste uma borda da forma para esticar só naquele lado, ou um canto para esticar nos dois sentidos.'));
  return out}
function pImage(){const l=curLayer();if(!l||l.type!=='image')return[];
  return[xformActs(l),h('div',{class:'chips'},h('button',{class:'chip',onclick:()=>{fillLayer(l,true)}},'Preencher a tela'),h('button',{class:'chip',onclick:()=>{fillLayer(l,false)}},'Caber na tela'),h('button',{class:'chip',onclick:()=>{brush.mode='erase';mode='brush';panel();render()}},'Apagar com a borracha')),
    opacityRow(l),
    slider('Girar',-180,180,1,()=>l.rot,v=>l.rot=v,v=>Math.round(v)+'°'),
    h('div',{class:'note'},'Arraste para mover. Use o canto para redimensionar e o círculo de cima para girar. Para efeitos e ajustes só desta imagem, abra Efeito ou Ajustar e escolha Camada.')]}
function pPaintSel(){const l=curLayer();return[xformActs(l),opacityRow(l),slider('Girar',-180,180,1,()=>l.rot,v=>l.rot=v,v=>Math.round(v)+'°'),
    h('button',{class:'btn',onclick:()=>{brush.mode='paint';mode='brush';panel();render()}},'Pintar nesta camada')]}
function pBrush(){
  const s=curLayer();
  const modeTxt={paint:'Pintando',erase:'Apagando',restore:'Restaurando'}[brush.mode];
  const ok=brush.mode==='paint'||(s&&(s.type==='image'||(s.type==='paint'&&brush.mode==='erase')));
  const msg=brush.mode==='paint'?(s&&s.type==='paint'?'Pintando na camada “'+layerLabel(s)+'”.':'Ao tocar na arte, uma nova camada de pintura é criada.'):(ok?modeTxt+' em “'+layerLabel(s)+'”.':(brush.mode==='restore'?'Restaurar funciona em imagens. Escolha uma abaixo.':'Escolha uma imagem ou camada de pintura abaixo.'));
  const prev=h('canvas',{width:240,height:56,style:{width:'100%',maxWidth:'240px',height:'56px',borderRadius:'8px',background:'repeating-conic-gradient(var(--ck1) 0 25%,var(--ck2) 0 50%) 0 0/14px 14px'}});
  const drawPrev=()=>{const x=prev.getContext('2d');x.clearRect(0,0,240,56);const st={m:'paint',c:brush.mode==='paint'?brush.color:'#ffffff',s:Math.min(brush.size,46),hd:brush.hard};
    const img=stampImg(st),d=Math.max(1,Math.ceil(st.s));x.globalAlpha=brush.op;for(let i=0;i<=40;i++){const t=i/40,px=24+t*192,py=28+Math.sin(t*6.28)*10;x.drawImage(img,px-d/2-1,py-d/2-1)}};
  drawPrev();
  const out=[chips([{v:'paint',l:'Pincel'},{v:'erase',l:'Borracha'},{v:'restore',l:'Restaurar'}],()=>brush.mode,v=>brush.mode=v),
    h('div',{class:'note'},msg)];
  const targets=doc.layers.filter(l=>l.type==='paint'||l.type==='image');
  if(targets.length)out.push(h('div',{class:'chips'},targets.slice().reverse().map(l=>h('button',{class:'chip'+(l.id===sel?' on':''),onclick:()=>select(l.id)},layerLabel(l)))));
  out.push(prev,
    slider('Tamanho',1,Math.max(300,Math.round(doc.w/4)),1,()=>brush.size,v=>{brush.size=v;drawPrev()},v=>Math.round(v)),
    slider('Dureza',0,100,1,()=>brush.hard*100,v=>{brush.hard=v/100;drawPrev()},v=>Math.round(v)+'%'),
    slider('Opacidade',5,100,1,()=>brush.op*100,v=>{brush.op=v/100;drawPrev()},v=>Math.round(v)+'%'));
  if(brush.mode==='paint')out.push(colorField('Cor',()=>brush.color,v=>{brush.color=v;drawPrev()}));
  out.push(h('div',{class:'chips'},
    h('button',{class:'chip',onclick:()=>{addPaintLayer();commit();panel();render()}},'Nova camada de pintura'),
    h('button',{class:'chip',onclick:()=>{if(!s)return;if(s.type==='paint')s.strokes=[];else if(s.type==='image')s.mask=[];else return;s._sv=null;commit();render();toast('Camada limpa')}},'Limpar camada')),
    h('div',{class:'note'},'Dureza baixa deixa a borda macia, como um aerógrafo. Dois dedos fazem zoom e movem a tela. Cada traço entra no desfazer.'));
  return out}
function pCanvas(close){close=close||(()=>{});
  const ratio=doc.w/doc.h,wI=h('input',{type:'number',id:'rw',min:16,max:6000,inputmode:'numeric',value:doc.w}),hI=h('input',{type:'number',id:'rh',min:16,max:6000,inputmode:'numeric',value:doc.h});
  wI.oninput=()=>{hI.value=Math.round(wI.value/ratio)};hI.oninput=()=>{wI.value=Math.round(hI.value*ratio)};
  const PRE=[['Instagram quadrado',1080,1080],['Instagram retrato 4:5',1080,1350],['Stories e Reels 9:16',1080,1920],['Facebook link',1200,630],['Facebook quadrado',1200,1200]];
  return[h('div',{class:'note'},'Tamanho atual: '+doc.w+' × '+doc.h+' px'),
    h('div',{class:'h'},'Redimensionar tudo'),
    h('div',{class:'row'},wI,h('span',{},'×'),hI,h('span',{class:'note'},'px')),
    h('div',{class:'chips'},[50,75,150,200].map(p=>h('button',{class:'chip',onclick:()=>{wI.value=Math.round(doc.w*p/100);wI.oninput()}},p+'%'))),
    h('button',{class:'btn accent',onclick:()=>{resizeDoc(+wI.value);close()}},'Aplicar novo tamanho'),
    h('div',{class:'note'},'Mantém a proporção e escala fotos, textos e formas juntos.'),
    h('div',{class:'h'},'Recortar'),
    h('button',{class:'btn',onclick:()=>{close();startCrop()}},'Recortar a arte'),
    h('div',{class:'h'},'Tamanho da tela (sem escalar)'),
    h('div',{class:'chips'},PRE.map(([l,w,hh])=>h('button',{class:'chip'+(doc.w===w&&doc.h===hh?' on':''),onclick:()=>{resizeCanvas(w,hh);close()}},l+' '+w+'×'+hh))),
    h('div',{class:'h'},'Fundo'),
    toggle('Fundo transparente',()=>!doc.bg,v=>doc.bg=v?null:'#ffffff'),
    doc.bg?colorField('Cor do fundo',()=>doc.bg,v=>doc.bg=v):null]}
function pCrop(){
  const R=[{v:null,l:'Livre'},{v:1,l:'1:1'},{v:4/5,l:'4:5'},{v:9/16,l:'9:16'},{v:16/9,l:'16:9'},{v:4/3,l:'4:3'}];
  return[h('div',{class:'note'},'Arraste os cantos e as bordas na arte. Arraste dentro para mover.'),
    h('div',{class:'chips'},R.map(o=>h('button',{class:'chip'+(crop.ratio===o.v?' on':''),onclick:()=>{crop.ratio=o.v;if(o.v){const f=fitRatio(o.v);Object.assign(crop,f)}panel();render()}},o.l))),
    h('div',{class:'frow'},h('button',{class:'btn accent',style:{flex:1},onclick:applyCrop},'Aplicar recorte'),h('button',{class:'btn',style:{flex:1},onclick:()=>{crop=null;panel();render();goBack()}},'Cancelar'))]}
/* ---------- tela de camadas ---------- */
function layThumb(l){const bw=96,bh=Math.max(24,Math.round(96*doc.h/doc.w)),k=bw/doc.w,c=h('canvas',{class:'th',width:bw,height:Math.min(bh,120)}),x=c.getContext('2d');
  x.fillStyle='#d8d8d8';x.fillRect(0,0,c.width,c.height);try{const t=mk(bw,Math.min(bh,120));drawLayer(t.getContext('2d'),l,k);x.fillStyle='#777';x.drawImage(t,0,0)}catch(e){}return c}
function openLayers(){crop=null;buildLayers();$('#lay').hidden=false}
function closeLayers(){$('#lay').hidden=true;panel();render()}
function buildLayers(){const list=$('#layList'),foot=$('#layFoot'),keep=list.scrollTop;list.replaceChildren();foot.replaceChildren();
  const n=doc.layers.length;
  if(!n)list.append(h('div',{class:'note'},'Nenhuma camada ainda. Use Adesivo para adicionar texto e formas, ou Efeito para inserir uma imagem.'));
  for(let i=n-1;i>=0;i--){const l=doc.layers[i];
    list.append(h('div',{class:'lrow'+(l.id===sel?' on':'')},layThumb(l),
      h('button',{class:'nm',onclick:()=>{sel=l.id;closeLayers()}},h('b',{},layerLabel(l)),h('small',{},TYPELAB[l.type]+(l.vis?'':' · oculta')+(l.locked?' · trancada':''))),
      h('div',{class:'lb'},h('button',{class:'s lk'+(l.locked?' on':''),'aria-label':l.locked?'Destrancar':'Trancar',onclick:()=>{l.locked=!l.locked;commit(l.locked?'Trancar camada':'Destrancar camada');buildLayers();panel();render()}},l.locked?'🔒':'🔓'),h('button',{class:'s','aria-label':l.vis?'Ocultar':'Mostrar',onclick:()=>{l.vis=!l.vis;commit(l.vis?'Mostrar camada':'Ocultar camada');buildLayers();render()}},l.vis?'●':'○'),
      h('button',{class:'s','aria-label':'Para frente',disabled:i===n-1,onclick:()=>{moveLayer(l.id,1);buildLayers()}},'↑'),
      h('button',{class:'s','aria-label':'Para trás',disabled:i===0,onclick:()=>{moveLayer(l.id,-1);buildLayers()}},'↓'),
      h('button',{class:'s','aria-label':'Duplicar',onclick:()=>{dupLayer(l.id);buildLayers()}},'⧉'),
      h('button',{class:'s','aria-label':'Excluir',onclick:()=>{deleteLayer(l.id);buildLayers()}},'✕'))))}
  list.scrollTop=keep;
  const l=curLayer();
  if(l)foot.append(h('div',{class:'h',style:{marginTop:0}},'Selecionada: '+layerLabel(l)),slider('Opacidade',0,100,1,()=>l.op*100,v=>l.op=v/100,v=>Math.round(v)+'%'));
  foot.append(h('div',{class:'note'},'↑ traz para frente e ↓ envia para trás. A camada de cima aparece sobre as de baixo. Toque no nome para editar a camada.'))}
$('#layClose').onclick=closeLayers;$('#layBtn').onclick=openLayers;$('#lay').addEventListener('click',e=>{if(e.target.id==='lay')closeLayers()});
