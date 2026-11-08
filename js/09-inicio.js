'use strict';
/* ---------- tela inicial ---------- */
function showSplash(on){$('#splash').hidden=!on;if(on){mode='view';crop=null}if(on){$('#spCont').hidden=!doc.layers.length;$('#spVer').textContent=VERSION}}
$('#spPhoto').onclick=()=>$('#photoIn').click();
$('#spBlank').onclick=()=>{doc={w:1080,h:1080,bg:'#ffffff',adj:defAdj(),nid:1,layers:[]};sel=null;mode='view';view.zoom=1;view.px=view.py=0;commit('Tela em branco');showSplash(false);panel();render()};
$('#spCont').onclick=()=>{showSplash(false);panel();render()};
$('#spLog').onclick=showChangelog;

/* ---------- início ---------- */
async function restoreFonts(){const keys=await kvKeys();for(const k of keys||[])if(String(k).startsWith('font:')){const buf=await kvGet(k),n=String(k).slice(5);try{const ff=new FontFace(n,buf);await ff.load();document.fonts.add(ff);customFonts[n]=ff}catch(e){}}}
async function loadState(s){const o=JSON.parse(s);doc=o.doc;sel=o.sel;fixDoc();
  for(const l of[...doc.layers])if(l.type==='image'&&!assets[l.asset]){const b=await kvGet('asset:'+l.asset);if(b){const im=await loadImg(b);assets[l.asset]={blob:b,img:im,w:im.naturalWidth,h:im.naturalHeight}}else doc.layers=doc.layers.filter(x=>x!==l)}
  if(!doc.layers.some(l=>l.id===sel))sel=null}
async function init(){
  document.fonts.addEventListener&&document.fonts.addEventListener('loadingdone',()=>render());
  await safe(restoreFonts);
  const st=await safe(()=>kvGet('state'));let ok=false;
  if(st){try{await loadState(st);ok=true}catch(e){}}
  if(!ok)doc={w:1080,h:1080,bg:'#ffffff',adj:defAdj(),nid:1,layers:[]};
  hist=[snap()];labels=['Início'];hi=0;updUndo();panel();render();showSplash(true);
  await Promise.all(BUILTIN.map(f=>safe(()=>document.fonts.load(`40px "${f}"`)))).then(()=>render());
}
init();
