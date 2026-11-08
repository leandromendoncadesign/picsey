'use strict';
/* ---------- janelas ---------- */
function modal(title,body){const m=h('div',{class:'modal',onclick:e=>{if(e.target===m)close()}},h('div',{class:'dlg',role:'dialog','aria-label':title},h('div',{class:'dh'},h('strong',{},title),h('button',{class:'ghost',onclick:()=>close()},'Fechar')),h('div',{class:'db'},body)));
  function close(){if(m.classList.contains('out'))return;fontPickerRefresh=null;m.classList.add('out');setTimeout(()=>m.remove(),200)}document.body.append(m);return close}
function showChangelog(){modal('Histórico de mudanças',h('div',{class:'chlog'},CHANGELOG.map(c=>h('div',{},h('h4',{},'Versão '+c.v+' · '+c.d+(c.h?' às '+c.h:'')),h('ul',{},c.t.map(t=>h('li',{},t)))))))}
async function doExport(){
  try{let k=Math.min(1,(exp.max||1e9)/Math.max(doc.w,doc.h));if(doc.w*k*doc.h*k>16e6)k=Math.sqrt(16e6/(doc.w*doc.h));
    const c=document.createElement('canvas');c.width=Math.round(doc.w*k);c.height=Math.round(doc.h*k);
    const wasSel=sel;renderDoc(c.getContext('2d'),k,exp.fmt==='jpg');
    const mime=exp.fmt==='jpg'?'image/jpeg':'image/png',blob=await new Promise(r=>c.toBlob(r,mime,exp.q));
    if(!blob)throw new Error('Não consegui gerar a imagem. Tente um tamanho menor.');
    const url=URL.createObjectURL(blob),file=new File([blob],'quotes-editor.'+(exp.fmt==='jpg'?'jpg':'png'),{type:mime});sel=wasSel;
    const body=h('div',{class:'chlog'});
    body.append(h('img',{src:url,alt:'Arte exportada'}),h('div',{class:'note'},`${c.width} × ${c.height} px · ${(blob.size/1048576).toFixed(2)} MB. Segure o dedo sobre a imagem e escolha Salvar na Fototeca.`),
      h('button',{class:'btn accent',onclick:async()=>{try{if(navigator.canShare&&navigator.canShare({files:[file]}))await navigator.share({files:[file]});else toast('Compartilhar não está disponível aqui. Segure o dedo na imagem para salvar.')}catch(e){if(e&&e.name!=='AbortError')toast('Compartilhar não está disponível aqui. Segure o dedo na imagem para salvar.')}}},'Compartilhar'));
    modal('Imagem pronta',body)}catch(e){toast(e.message||'Falha ao exportar')}}

/* ---------- listas e efeitos ---------- */
const PCT=v=>Math.round(v)+'%',DEG=v=>Math.round(v)+'°';
const KEYED=(key,o)=>Object.assign({key,step:1,init:0,off:0,fmt:v=>String(Math.round(v)),get:a=>a[key],set:(a,v)=>{a[key]=v},reset:a=>{a[key]=0},on:a=>!!a[key]},o);
const FX={
 bright:KEYED('bright',{label:'Brilho',min:-100,max:100,prev:45}),
 contrast:KEYED('contrast',{label:'Contraste',min:-100,max:100,prev:50}),
 sat:KEYED('sat',{label:'Saturação',min:-100,max:100,prev:70}),
 exp:KEYED('exp',{label:'Exposição',min:-100,max:100,prev:40}),
 sharp:KEYED('sharp',{label:'Nitidez',min:0,max:100,prev:60,init:50,fmt:PCT}),
 blur:KEYED('blur',{label:'Desfoque',min:0,max:40,prev:6,init:8}),
 grain:KEYED('grain',{label:'Granulação',min:0,max:100,prev:40,init:35,fmt:PCT,opts:[{key:'gsize',label:'Tamanho do grão',min:1,max:8,step:.5}]}),
 pop:KEYED('poph',{label:'Cor em destaque',min:0,max:360,prev:120,init:120,fmt:DEG,set:(a,v)=>{a.poph=v;a.pop=1},reset:a=>{a.pop=0},on:a=>a.pop>0}),
 sph:KEYED('sph',{label:'Esferizar',min:0,max:100,prev:85,init:60,fmt:PCT}),
 twi:KEYED('twi',{label:'Redemoinho',min:-100,max:100,prev:55,init:50,fmt:PCT}),
 bul:KEYED('bul',{label:'Inchar e comprimir',min:-100,max:100,prev:70,init:60,fmt:PCT}),
 spl:KEYED('spl',{label:'Respingo circular',min:0,max:100,prev:70,init:50,fmt:PCT}),
 str:KEYED('str',{label:'Esticar',min:0,max:100,prev:70,init:50,fmt:PCT}),
 strV:KEYED('strV',{label:'Esticar na vertical',min:0,max:100,prev:80,init:50,fmt:PCT}),
 strH:KEYED('strH',{label:'Esticar na horizontal',min:0,max:100,prev:80,init:50,fmt:PCT}),
 mir:KEYED('mir',{label:'Espelho',min:10,max:90,prev:55,init:55,off:50,fmt:PCT}),
 hue:KEYED('hue',{label:'Matiz',min:-180,max:180,prev:120,fmt:DEG}),
 colz:KEYED('colh',{label:'Colorizar',min:0,max:360,prev:210,init:200,fmt:DEG,set:(a,v)=>{a.colh=v;a.colz=1},reset:a=>{a.colz=0},on:a=>a.colz>0}),
 gray:KEYED('gray',{label:'Escala de cinza',min:0,max:100,prev:100,init:100,fmt:PCT}),
 bw:KEYED('bwt',{label:'Preto e branco',min:1,max:255,prev:128,init:128,off:1}),
 duo:KEYED('duo',{label:'Duotone',min:0,max:100,prev:100,init:100,fmt:PCT,colors:[{key:'duoA',label:'Cor das sombras'},{key:'duoB',label:'Cor das luzes'}]}),
 rain:KEYED('rain',{label:'Arco-íris',min:0,max:100,prev:70,init:60,fmt:PCT}),
 tint:KEYED('tint',{label:'Mesclar com cor',min:0,max:100,prev:60,init:50,fmt:PCT,colors:[{key:'tintC',label:'Cor'}]}),
 comic:KEYED('comic',{label:'Estampa de quadrinhos',min:3,max:30,prev:6,init:8,off:3}),
 post:KEYED('post',{label:'Posterizar',min:2,max:16,prev:4,init:5,off:2}),
 part:KEYED('part',{label:'Pop Art',min:0,max:100,prev:100,init:100,fmt:PCT}),
 sepia:KEYED('sepia',{label:'Sépia',min:0,max:100,prev:100,init:100,fmt:PCT}),
 neg:KEYED('neg',{label:'Negativo',min:0,max:100,prev:100,init:100,fmt:PCT}),
 pix:KEYED('pix',{label:'Pixelar',min:0,max:100,prev:14,init:14}),
 vig:KEYED('vig',{label:'Vinheta',min:0,max:100,prev:70,init:60,fmt:PCT})};
const SH=(label,shape)=>({label,shape,go:()=>addShape(shape)});
const LISTS={
 effect:{title:'Efeito',sections:[
  {title:'',items:[
   {label:'✎ Pintar',photo:true,ret:true,go:()=>{mode='brush';panel();render()}},
   {label:'+ Inserir imagem',photo:true,go:()=>$('#imgIn').click()},
   FX.pop]},
  {title:'Distorção',items:[FX.sph,FX.twi,FX.bul,FX.spl,FX.str,FX.strV,FX.strH,FX.mir]},
  {title:'Ajustes de cor',items:[FX.hue,FX.colz,FX.gray,FX.bw,FX.duo,FX.rain,FX.tint]},
  {title:'Artístico',items:[FX.comic,FX.post,FX.part,FX.sepia,FX.neg,FX.pix,FX.vig]}]},
 adjust:{title:'Ajustar',sections:[
  {title:'Girar e cortar',items:[
   {label:'Recortar',photo:true,ret:true,go:()=>startCrop()},
   {label:'Redimensionar',photo:true,ret:true,go:()=>openSizeModal()},
   {label:'Girar à direita',photo:true,keep:true,go:()=>rotateDoc(1)},
   {label:'Girar à esquerda',photo:true,keep:true,go:()=>rotateDoc(-1)},
   {label:'Espelhar',photo:true,keep:true,go:()=>mirrorDoc()}]},
  {title:'Luz e cor',items:[FX.bright,FX.contrast,FX.sat,FX.exp]},
  {title:'Detalhes',items:[FX.sharp,FX.blur,FX.grain]}]},
 sticker:{title:'Adesivo',sections:[
  {title:'Texto',items:[{label:'Texto',icon:'text',go:()=>addText()}]},
  {title:'Balões',items:[SH('Balão de fala','speech'),SH('Balão de pensamento','thought'),SH('Balão de grito','burst')]},
  {title:'Formas',items:[SH('Retângulo','rect'),SH('Retângulo arredondado','round'),SH('Círculo','ellipse'),SH('Triângulo','triangle'),SH('Estrela','star'),SH('Coração','heart')]}]}};
let eff=null,effTarget='layer',backKind=null,listScroll={};
function goBack(){const k=backKind;backKind=null;if(k)openList(k,true)}
const effAdj=()=>{const l=curLayer();return effTarget==='layer'&&l&&l.type==='image'?l.adj:doc.adj};
function iconThumb(th,it){const x=th.getContext('2d');x.fillStyle='#ececec';x.fillRect(0,0,128,84);x.save();x.translate(64,42);
  if(it.icon==='text'){x.fillStyle='#222';x.font='bold 46px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('Aa',0,3)}
  else{const sp=it.shape==='speech'||it.shape==='thought',w=it.shape==='triangle'||it.shape==='heart'||it.shape==='star'?46:68,hh=it.shape==='rect'||it.shape==='round'||sp?42:it.shape==='burst'?64:46;
    x.translate(0,sp?-6:0);shapePath(x,{shape:it.shape,radius:.35,points:it.shape==='burst'?12:5,tailA:100,tailL:.4},w,hh);x.fillStyle='#fff';x.fill();x.lineWidth=4;x.lineJoin='round';x.strokeStyle='#222';x.stroke()}
  x.restore()}
function closeList(){$('#lst').hidden=true}
function openList(kind,keep){
  const L=LISTS[kind],list=$('#efList');list.replaceChildren();$('#lstTitle').textContent=L.title;
  const k=Math.min(1,160/Math.max(doc.w,doc.h)),bw=Math.max(1,Math.round(doc.w*k)),bh=Math.max(1,Math.round(doc.h*k)),base=mk(bw,bh);
  renderDoc(base.getContext('2d'),k,true);
  const baseData=base.getContext('2d').getImageData(0,0,bw,bh),jobs=[];
  const cover=(th,cv2)=>{const x=th.getContext('2d'),sc=Math.max(128/bw,84/bh),dw=bw*sc,dh=bh*sc;x.drawImage(cv2,(128-dw)/2,(84-dh)/2,dw,dh)};
  for(const sec of L.sections){
    if(sec.title)list.append(h('div',{class:'sech'},sec.title));
    for(const it of sec.items){
      const th=h('canvas',{class:'th',width:128,height:84});
      list.append(h('button',{class:'erow',onclick:()=>{listScroll[kind]=list.scrollTop;closeList();backKind=(!it.go||it.ret||it.keep)?kind:null;if(it.go){it.go();if(it.keep)goBack()}else startEffect(it)}},th,h('span',{},it.label)));
      jobs.push(()=>{
        if(it.icon||it.shape){iconThumb(th,it);return}
        if(it.photo){cover(th,base);return}
        const id=new ImageData(new Uint8ClampedArray(baseData.data),bw,bh),p=defAdj();it.set(p,it.prev);applyAdj(id,p,k);
        const t=mk(bw,bh);t.getContext('2d').putImageData(id,0,0);cover(th,t)});
    }
  }
  $('#lst').hidden=false;list.scrollTop=keep?(listScroll[kind]||0):0;
  let i=0;const run=()=>{const t0=performance.now();while(i<jobs.length&&performance.now()-t0<14)jobs[i++]();if(i<jobs.length)setTimeout(run,0)};run();
}
function showEffMode(on){$('#topEff').hidden=!on;$('#effbar').hidden=!on;$('#bottom').hidden=on;$('#fl').hidden=on;if(on)$('#sheet').hidden=true}
function startEffect(it){const l=curLayer();effTarget=l&&l.type==='image'?'layer':'all';eff={it,adj:null,backup:null};showEffMode(true);beginEff()}
function beginEff(){const it=eff.it;eff.adj=effAdj();eff.backup=JSON.parse(JSON.stringify(eff.adj));
  if(!it.on(eff.adj)&&it.init)it.set(eff.adj,it.init);
  const a=eff.adj,r=$('#effRange');r.min=it.min;r.max=it.max;r.step=it.step;r.value=it.on(a)?it.get(a):it.off;
  const o=$('#effOpts');o.replaceChildren();
  for(const op of it.opts||[]){const x=h('input',{type:'range',min:op.min,max:op.max,step:op.step});x.value=a[op.key];x.addEventListener('input',()=>{a[op.key]=+x.value;render()});o.append(h('label',{class:'opt'},op.label,x))}
  const t=$('#effTgt');t.replaceChildren();
  if(curLayer()&&curLayer().type==='image')t.append(h('span',{},'Aplicar em:'),...[['layer','Camada'],['all','Imagem inteira']].map(([v,lab])=>h('button',{class:'chip'+(effTarget===v?' on':''),onclick:()=>{if(effTarget===v)return;Object.assign(eff.adj,eff.backup);effTarget=v;beginEff()}},lab)));
  updEffUI();render()}
function updEffUI(){const it=eff.it,a=eff.adj,v=it.on(a)?it.get(a):it.off;
  $('#effTitle').textContent=it.label+' '+it.fmt(v);
  $('#effIcon').style.background=it.colors?a[it.colors[0].key]:''}
function endEff(){eff=null;showEffMode(false);panel();render();goBack()}
$('#effRange').addEventListener('input',e=>{if(!eff)return;eff.it.set(eff.adj,+e.target.value);updEffUI();render()});
const nudge=d=>{if(!eff)return;const it=eff.it,r=$('#effRange'),st=Math.max(+it.step,(it.max-it.min)/50);r.value=clamp(+r.value+d*st,it.min,it.max);r.dispatchEvent(new Event('input'))};
$('#effMinus').onclick=()=>nudge(-1);$('#effPlus').onclick=()=>nudge(1);
$('#effOk').onclick=()=>{if(!eff)return;commit('Efeito: '+eff.it.label);endEff()};
$('#effCancel').onclick=()=>{if(!eff)return;Object.assign(eff.adj,eff.backup);endEff()};
$('#effPill').onclick=()=>{if(!eff)return;const it=eff.it;
  if(it.colors){const body=h('div',{class:'chlog'});
    for(const c of it.colors){const i=h('input',{type:'color'});i.value=eff.adj[c.key];i.addEventListener('input',()=>{eff.adj[c.key]=i.value;updEffUI();render()});body.append(h('label',{class:'row'},h('span',{class:'lab'},c.label),i))}
    modal('Cores do efeito',body);return}
  it.reset(eff.adj);$('#effRange').value=it.off;updEffUI();render()};
$('#efClose').onclick=closeList;

/* ---------- ações de ajuste ---------- */
function startCrop(){mode='view';crop={x:0,y:0,w:doc.w,h:doc.h,ratio:null};sel=null;panel();render()}
function openSizeModal(){const body=h('div',{class:'chlog'});const close0=modal('Tamanho da arte',body);const close=()=>{close0();goBack()};body.append(...pCanvas(close).flat(Infinity).filter(Boolean))}
function rotateDoc(dir){const W=doc.w,H=doc.h;for(const l of doc.layers){const x=l.x,y=l.y;if(dir>0){l.x=H-y;l.y=x}else{l.x=y;l.y=W-x}l.rot+=90*dir}
  doc.w=H;doc.h=W;view.zoom=1;view.px=view.py=0;crop=null;commit(dir>0?'Girar à direita':'Girar à esquerda');panel();render()}
function mirrorDoc(){for(const l of doc.layers){l.x=doc.w-l.x;l.rot=-l.rot;l.flip=!l.flip}commit('Espelhar');panel();render()}
function openExport(){const body=h('div',{});const close=modal('Exportar',body);
  const opt=(list,get,set)=>h('div',{class:'chips'},list.map(o=>h('button',{class:'chip'+(get()===o.v?' on':''),onclick:()=>{set(o.v);build()}},o.l)));
  const build=()=>{body.replaceChildren(...[
    h('div',{class:'h'},'Formato'),opt([{v:'png',l:'PNG'},{v:'jpg',l:'JPG'}],()=>exp.fmt,v=>exp.fmt=v),
    exp.fmt==='jpg'?h('label',{class:'row sl'},h('span',{class:'lab'},'Qualidade'),(()=>{const r=h('input',{type:'range',min:.5,max:1,step:.01});r.value=exp.q;r.addEventListener('input',()=>{exp.q=+r.value});return r})()):null,
    h('div',{class:'h'},'Tamanho'),opt([{v:0,l:'Original'},{v:2048,l:'Até 2048'},{v:1080,l:'Até 1080'}],()=>exp.max,v=>exp.max=v),
    h('div',{class:'note'},'Arte de '+doc.w+' × '+doc.h+' px.'),
    h('button',{class:'btn accent',onclick:()=>{close();doExport()}},'Gerar imagem')].filter(Boolean))};build()}
function openHistory(){const body=h('div',{class:'chlog'});const close=modal('Histórico',body);
  const build=()=>{body.replaceChildren(
    h('div',{class:'frow'},h('button',{class:'btn',style:{flex:1},disabled:hi<=0,onclick:()=>{if(hi>0){hi--;restore(hist[hi]);build()}}},'Desfazer'),h('button',{class:'btn',style:{flex:1},disabled:hi>=hist.length-1,onclick:()=>{if(hi<hist.length-1){hi++;restore(hist[hi]);build()}}},'Refazer')),
    h('div',{class:'h'},'Passos'),
    ...hist.map((_,i)=>i).reverse().map(i=>h('button',{class:'layer'+(i===hi?' on':''),onclick:()=>{hi=i;restore(hist[i]);build()}},h('span',{class:'nm'},(i+1)+'. '+(labels[i]||'Edição')))),
    h('div',{class:'h'},'Projeto'),
    h('button',{class:'btn',onclick:()=>{close();showSplash(true)}},'Tela inicial'),
    h('button',{class:'btn',onclick:()=>{close();showChangelog()}},'Histórico de mudanças do app'))};build()}
$('#histBtn').onclick=openHistory;
$('#homeBtn').onclick=()=>{closeList();$('#lay').hidden=true;showSplash(true)};
