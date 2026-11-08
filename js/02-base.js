'use strict';
/* ---------- utilidades ---------- */
const $=(s,r=document)=>r.querySelector(s);
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const h=(tag,props={},...kids)=>{const e=document.createElement(tag);let val,chk;
  for(const[k,v]of Object.entries(props)){
    if(k==='class')e.className=v;
    else if(k==='value'){val=v}
    else if(k==='checked'){chk=v}
    else if(k.startsWith('on'))e.addEventListener(k.slice(2),v);
    else if(k==='style'&&typeof v==='object')Object.assign(e.style,v);
    else if(v===true)e.setAttribute(k,'');
    else if(v!==false&&v!=null)e.setAttribute(k,v);}
  for(const c of kids.flat(Infinity))if(c!=null&&c!==false)e.append(c.nodeType?c:document.createTextNode(String(c)));
  if(val!==undefined)e.value=val; if(chk!==undefined)e.checked=chk; return e;};
const safe=async f=>{try{return await f()}catch(e){return undefined}};
let toastT=0;
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),2400)}

/* ---------- armazenamento (IndexedDB, opcional) ---------- */
let dbp;
const db=()=>dbp||(dbp=new Promise((res,rej)=>{const r=indexedDB.open('quotes-editor',1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}));
const kv=async(mode,fn)=>{const d=await db();return new Promise((res,rej)=>{const tx=d.transaction('kv',mode);const r=fn(tx.objectStore('kv'));tx.oncomplete=()=>res(r&&r.result);tx.onerror=()=>rej(tx.error)})};
const kvGet=k=>kv('readonly',s=>s.get(k)), kvSet=(k,v)=>kv('readwrite',s=>s.put(v,k)), kvDel=k=>kv('readwrite',s=>s.delete(k)), kvKeys=()=>kv('readonly',s=>s.getAllKeys());

/* ---------- estado ---------- */
const BUILTIN=['Anton','Comic Silver Age','Comic Silver Age LC','Lockergnome','Deftone Stylus','Delta Hey Max Nine','Yataghan','Daniel','Vinque','Foo'];
const SYSFONTS=['Helvetica Neue','Arial','Arial Rounded MT Bold','Avenir Next','American Typewriter','Baskerville','Bradley Hand','Chalkboard SE','Chalkduster','Copperplate','Courier New','Didot','Futura','Georgia','Gill Sans','Impact','Marker Felt','Noteworthy','Optima','Palatino','Papyrus','Snell Roundhand','Times New Roman','Trebuchet MS','Verdana','Zapfino'];
const defAdj=()=>({bright:0,contrast:0,sat:0,exp:0,hue:0,gray:0,bwt:0,sepia:0,neg:0,tint:0,tintC:'#3b82f6',colz:0,colh:200,duo:0,duoA:'#2a0a5e',duoB:'#ffc83d',rain:0,post:0,pix:0,vig:0,sph:0,bul:0,twi:0,spl:0,str:0,strH:0,strV:0,mir:0,pop:0,poph:0,comic:0,part:0,grain:0,gsize:2,sharp:0,blur:0});
const ADJ_NUM=['bright','contrast','sat','exp','hue','gray','bwt','sepia','neg','tint','colz','duo','rain','post','pix','vig','sph','bul','twi','spl','str','strH','strV','mir','pop','comic','part','grain','sharp','blur'];
const isDefAdj=a=>!a||ADJ_NUM.every(k=>!a[k]);
function fixAdj(a){const o=Object.assign(defAdj(),a||{});if(o.filter){if(o.filter==='bw')o.gray=100;else if(o.filter==='sepia')o.sepia=100;else if(o.filter==='neg')o.neg=100;delete o.filter}return o}
function fixDoc(){doc.adj=fixAdj(doc.adj);doc.layers.forEach(l=>{if(l.type==='image')l.adj=fixAdj(l.adj)})}
let doc={w:1080,h:1080,bg:'#ffffff',adj:defAdj(),nid:1,layers:[]};
let sel=null, tab='layers', crop=null, pickCb=null;
const assets={};      // id -> {blob,img,w,h}
const customFonts={}; // nome -> FontFace
const exp={fmt:'png',q:0.92,max:0};
const view={zoom:1,px:0,py:0};
const brush={mode:'paint',color:'#ffffff',size:48,hard:.6,op:1};let brushPos=null,guides=null,mode='view',labels=[];
let hist=[],hi=-1;
const r1=v=>Math.round(v*10)/10;
const curLayer=()=>doc.layers.find(l=>l.id===sel)||null;
const rep=(k,v)=>k[0]==='_'?undefined:v;
const snap=()=>JSON.stringify({doc,sel},rep);

const SHAPES=[
 {v:'rect',l:'Retângulo',p:'<rect x="4" y="7" width="22" height="16"/>'},
 {v:'round',l:'Arredondado',p:'<rect x="4" y="7" width="22" height="16" rx="7"/>'},
 {v:'ellipse',l:'Círculo',p:'<ellipse cx="15" cy="15" rx="11" ry="9"/>'},
 {v:'triangle',l:'Triângulo',p:'<path d="M15 5 26 25H4z"/>'},
 {v:'star',l:'Estrela',p:'<path d="m15 3 3.5 8 8.5.8-6.4 5.7 1.9 8.5L15 21.5 7.5 26l1.9-8.5L3 11.8l8.5-.8z"/>'},
 {v:'heart',l:'Coração',p:'<path d="M15 26C4 18 4 9 10 7c3-1 5 1 5 3 0-2 2-4 5-3 6 2 6 11-5 19z"/>'},
 {v:'speech',l:'Balão de fala',p:'<path d="M15 5C8 5 4 9 4 14s4 8 9 9l-2 5 7-5c6-1 10-4 10-9s-5-9-13-9z"/>'},
 {v:'thought',l:'Pensamento',p:'<ellipse cx="14" cy="11" rx="10" ry="7"/><circle cx="12" cy="21" r="2.5"/><circle cx="9" cy="26" r="1.5"/>'},
 {v:'burst',l:'Grito',p:'<path d="m15 2 3 6 6-3-1 7 7 2-6 4 4 6-7-1-1 7-5-5-5 5-1-7-7 1 4-6-6-4 7-2-1-7 6 3z"/>'}];
const shapeName=v=>(SHAPES.find(s=>s.v===v)||{}).l||'Forma';

function newLayer(type,props){return Object.assign({id:doc.nid++,type,x:doc.w/2,y:doc.h/2,rot:0,flip:false,op:1,vis:true},props)}
function layerLabel(l){return l.type==='text'?'“'+l.text.replace(/\n/g,' ').slice(0,24)+'”':l.type==='shape'?shapeName(l.shape):(l.name||'Imagem')}
const TYPELAB={text:'texto',shape:'forma',image:'imagem',paint:'pintura'};
