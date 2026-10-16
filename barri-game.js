
let P=[];
const col=v=>v==="?"?["#FDE68A","#1F2A44"]:/^\d+$/.test(String(v))?[["#2563EB","#fff"],["#15803D","#fff"],["#F59E0B","#1F2A44"],["#7C3AED","#fff"]][v%4]:["#E3DDF5","#1F2A44"];
const sv=s=>typeof s==="object"?s.v:s;
const S={i:0,stars:0,fin:false,on:false};
function reset(){Object.assign(S,{step:0,sel:null,fill:{},sh:{},dw:{},db:{},nd:2,lh:null,lk:null,ops:[],ans:"",bad:{},hc:0,hints:0,errs:0,em:0,eo:0,ea:0,t0:Date.now(),done:false,hl:{},pst:0,msg:"Lee con atención y toca los números importantes."})}
reset();
const bot='<svg width="64" height="64" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="22" r="16" fill="#7C3AED"/><path d="M10 22a16 16 0 0132 0z" fill="#F59E0B"/><circle cx="20" cy="26" r="4" fill="#fff"/><circle cx="32" cy="26" r="4" fill="#fff"/><circle cx="21" cy="27" r="2" fill="#1F2A44"/><circle cx="33" cy="27" r="2" fill="#1F2A44"/><path d="M12 38q-2 10 4 10M22 38q0 11 4 10M30 38q0 11-4 10M40 38q2 10-4 10" stroke="#7C3AED" stroke-width="5" fill="none" stroke-linecap="round"/></svg>';
const star='<svg width="44" height="44" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l3 6.5 7 .8-5.2 4.8 1.5 7-6.3-3.6-6.3 3.6 1.5-7L2 9.3l7-.8z" fill="#F59E0B"/></svg>';
function slotList(p){const o=[];p.rows.forEach((r,ri)=>r.s.forEach((s,si)=>o.push({k:ri+"."+si,v:sv(s)})));if(p.tot!==undefined)o.push({k:"t",v:p.tot});return o}
function slot(id,exp,w,g,edit){const k=id.slice(2);let cur=edit?(id[0]==="o"?S.ops[+k]:S.fill[k]):exp;if(!edit&&S.lh&&S.lh[k])cur=undefined;const em=cur===undefined;let sh=cur;if(!edit&&S.done&&cur==="?")sh=P[S.i].ans;const[c,f]=em?["transparent","var(--mu)"]:col(sh);
return `<div class="slot${em?" em":""}${S.bad[k]&&id[0]==="m"?" bad":""}${g?" gp":""}${!edit&&S.lk===k?" pop":""}"${edit?` data-s="${id}"`:""} style="width:${w}px;background:${c};color:${f}">${em?"":sh}</div>`}
function fmodel(p,edit){const f=p.fr,dn=p.draw&&edit?S.nd:f.d,cw=Math.max(18,Math.floor(250/dn)-3),tv=edit?p.tot:(S.fill.t??p.tot);
let h=`<div class="mr"><b class="lb"></b><div class="tb" style="width:${dn*(cw+3)}px">${slot("m:t",tv,110,false,edit)}<div class="br"></div></div></div><div class="mr"><b class="lb">${p.rows[0].l}</b><div class="bars" style="gap:3px">`+Array.from({length:dn},(_,i)=>`<div class="cell${S.sh[i]?" sh":""}"${edit?` data-c="${i}"`:""} style="width:${cw}px"></div>`).join("")+"</div></div>";
[["g1","partes sombreadas"],["g2","resto"]].forEach(([k,t])=>{if(f[k]!==undefined)h+=`<div class="mr"><b class="lb"></b>${slot("m:"+k,edit?f[k]:(S.fill[k]??f[k]),56,false,edit)}<span class="mut">${t}</span></div>`});if(p.draw&&edit)h=`<div class="stp"><span class="mut">Partes iguales</span><button data-d="np" data-v="-1">−</button><b>${dn}</b><button data-d="np" data-v="1">+</button></div>`+h;return h}
function dmodel(p){const vert=p.tot!==undefined&&p.rows.length>1,one=p.rows.length===1&&p.tot!==undefined;let h="",bw=0;
p.rows.forEach((r,ri)=>{const n=S.db[ri]||0;let b="",tw=0;for(let i=0;i<n;i++){const k=ri+"."+i,w=S.dw[k]||64;tw+=w+4;b+=`<div class="blk" style="width:${w}px">${slot("m:"+k,0,w-14,false,true)}<span class="rz" data-rz="${k}" aria-label="Estirar"></span></div>`}
bw=Math.max(bw,tw);b+=`<div class="pm"><button data-d="add" data-r="${ri}" aria-label="Añadir bloque">+</button><button data-d="del" data-r="${ri}" aria-label="Quitar bloque">−</button></div>`;if(r.t!==undefined)b+=`<b>=</b>`+slot("m:"+ri+".t",0,56,false,true);h+=`<div class="mr"><b class="lb">${r.l}</b><div class="bars">${b}</div></div>`});
if(one)h=`<div class="mr"><b class="lb"></b><div class="tb" style="width:${Math.max(bw,110)}px">${slot("m:t",0,110,false,true)}<div class="br"></div></div></div>`+h;
if(vert)h=`<div class="vb2"><div class="rws">${h}</div><div class="vbr"><div class="brc"></div>${slot("m:t",0,56,false,true)}</div></div>`;return h}
function model(p,edit){if(p.fr)return fmodel(p,edit);if(p.draw&&edit)return dmodel(p);const val=v=>v==="?"?p.ans:v;const mx=Math.max(...p.rows.map(r=>r.s.reduce((a,s)=>a+val(sv(s)),0)));const vert=p.tot!==undefined&&p.rows.length>1;const k=Math.min(18,(vert?165:230)/mx);const one=p.rows.length===1&&p.tot!==undefined;
const wd=(r,ri,si,s)=>edit?(s.g?70:Math.max(46,Math.min(96,Math.floor((vert?170:240)/r.s.length)-4))):Math.max(46,val(S.fill[ri+"."+si]??sv(s))*k);
const tv=edit?p.tot:(S.fill.t??p.tot);let h="";
if(one){const r=p.rows[0];const bw=r.s.reduce((a,s,si)=>a+wd(r,0,si,s),0)+4*(r.s.length-1);h+=`<div class="mr"><b class="lb"></b><div class="tb" style="width:${bw}px">${slot("m:t",tv,110,false,edit)}<div class="br"></div></div></div>`}
p.rows.forEach((r,ri)=>{h+=`<div class="mr"><b class="lb">${r.l}</b><div class="bars">`;r.s.forEach((s,si)=>{h+=slot("m:"+ri+"."+si,S.fill[ri+"."+si]??sv(s),wd(r,ri,si,s),!!s.g,edit)});if(r.t!==undefined)h+=`<b>=</b>`+slot("m:"+ri+".t",S.fill[ri+".t"]??r.t,56,false,edit);h+="</div></div>"});
if(vert)h=`<div class="vb2"><div class="rws">${h}</div><div class="vbr"><div class="brc"></div>${slot("m:t",tv,56,false,edit)}</div></div>`;return h}
function chips(a){return `<div class="tray">${a.map(v=>{const[c,f]=col(v);return `<div class="chip${S.sel===String(v)?" sel":""}" data-v="${v}" style="background:${c};color:${f}">${v}</div>`}).join("")}</div>`}
function render(){const p=P[S.i];const A=document.getElementById("app");
if(S.fin){A.innerHTML=`<div class="card win">${bot}<div>¡Misión cumplida!</div><div style="margin:10px 0">${star}${star}${star}</div><div>${S.stars} estrellas ganadas</div></div><button class="bt" data-a="exit">Volver</button>`;return}
const pr=(S.i*4+S.step+(S.done?1:0))/(P.length*4)*100;let n=0;
const tx=p.t.replace(/\d+/g,m=>{n++;return `<span class="nm${S.hl[n]?" on":""}" data-n="${n}">${m}</span>`});
let h=`<div class="top"><button class="ib g" data-a="exit" aria-label="Salir">✕</button><div class="pg"><i style="width:${pr}%"></i></div><div class="st">${star.replace(/44/g,"18")}${S.stars}</div><button class="ib" data-a="read" aria-label="Escuchar enunciado"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z" fill="#fff"/><path d="M16.5 9a4 4 0 010 6M19 6.5a7.5 7.5 0 010 11"/></svg></button></div>
<div class="pills">${["1 Leer","2 Dibujar","3 Calcular","4 Comprobar"].map((x,i)=>`<span class="${i===S.step&&!S.done?"on":i<S.step||S.done?"ok":""}">${x}</span>`).join("")}</div>
<div class="card tx">${tx}</div>`;
if(S.step===0)h+=`<div class="bub">${bot}<p>${S.msg}</p></div><button class="bt" data-a="go1">Ya lo leí</button>`;
if(S.step===1)h+=`<div class="card">${model(p,true)}</div>${chips(p.tray)}<div class="bub">${bot}<p>${S.msg}</p></div><div class="acts"><button class="bt o" data-a="hint">Pista</button><button class="bt" data-a="chkm">Comprobar barras</button></div>`;
if(S.step===2)h+=`<div class="card">${model(p,false)}</div><div class="card"><div class="ex">${Array.from({length:p.n},(_,i)=>slot("o:"+i,0,52,false,true)).join("")}<span>=</span><div class="slot em" style="width:56px">?</div></div></div>${chips(p.ops)}<div class="bub">${bot}<p>${S.msg}</p></div><div class="acts"><button class="bt o" data-a="hint">Pista</button><button class="bt" data-a="chko">Comprobar operación</button></div>`;
if(S.step===3){h+=`<div class="card">${model(p,false)}</div>`;
if(S.done)h+=`<div class="card win">${Array(S.pst).fill(star).join("")}<div>¡Correcto! +${S.pst}</div></div><div class="bub">${bot}<p>${S.msg}</p></div><button class="bt" data-a="next">${S.i===P.length-1?"Ver resultado":"Siguiente problema"}</button>`;
else h+=`<div class="ans">Respuesta: ${S.ans||"…"}</div><div class="pad">${[1,2,3,4,5,6,7,8,9].map(d=>`<button data-k="${d}">${d}</button>`).join("")}<button data-k="b">⌫</button><button data-k="0">0</button><button data-k="ok" style="background:#16A34A;color:#fff">OK</button></div><div class="bub">${bot}<p>${S.msg}</p></div>`}
A.innerHTML=h}
const lab=k=>k==="t"?"el total":"la barra de "+P[S.i].rows[+k.split(".")[0]].l;
function place(t,v){const k=t.slice(2);if(t[0]==="m"){S.fill[k]=v;delete S.bad[k]}else S.ops[+k]=v;S.sel=null;render()}
function say(t){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang="es-ES";if(typeof st!=="undefined"&&st.set.voice){const v=speechSynthesis.getVoices().find(x=>x.name===st.set.voice);if(v)u.voice=v}u.rate=.9;speechSynthesis.speak(u)}catch(e){}}
function chkF(){const p=P[S.i],f=p.fr;let miss=0,w=null;S.bad={};const ns=Object.keys(S.sh).filter(i=>S.sh[i]&&(!p.draw||+i<S.nd)).length;
[["t",p.tot],["g1",f.g1],["g2",f.g2]].filter(x=>x[1]!==undefined).forEach(([k,v])=>{if(S.fill[k]===undefined){miss++;S.bad[k]=1}else if(String(S.fill[k])!==String(v)){S.bad[k]=1;w=w||k}});
if(p.draw&&S.nd!==f.d){S.errs++;S.em++;S.msg="Divide la barra en el número de partes iguales que indica la fracción."}else if(ns!==f.k){S.errs++;S.em++;S.msg=`Sombrea ${f.k} de las ${f.d} partes iguales.`}else if(miss||w){S.errs++;S.em++;S.msg=miss?"Faltan bloques por colocar.":"Revisa el bloque marcado: no encaja."}else{S.step=2;S.msg="¡Modelo perfecto! Ahora arma la operación."}render()}
function chkD(){const p=P[S.i];let miss=0,w=null,msg="";S.bad={};
p.rows.forEach((r,ri)=>{const n=S.db[ri]||0,ex=r.s.map(x=>String(sv(x))),ks=Array.from({length:n},(_,i)=>ri+"."+i);
if(n!==ex.length){w=w||ri+".0";msg=msg||`La barra de ${r.l} debe tener ${ex.length} ${ex.length===1?"bloque":"bloques"}.`;return}
ks.forEach(k=>{if(S.fill[k]===undefined){miss++;S.bad[k]=1}});
if(ks.every(k=>S.fill[k]!==undefined)){const got=ks.map(k=>String(S.fill[k]));if(got.slice().sort().join()!==ex.slice().sort().join()){ks.forEach(k=>S.bad[k]=1);w=w||ri+".0"}}
if(r.t!==undefined){const q=ri+".t";if(S.fill[q]===undefined){miss++;S.bad[q]=1}else if(String(S.fill[q])!==String(r.t)){S.bad[q]=1;w=w||ri+".0"}}});
if(p.tot!==undefined){if(S.fill.t===undefined){miss++;S.bad.t=1}else if(String(S.fill.t)!==String(p.tot)){S.bad.t=1;w=w||"t"}}
if(!msg&&!miss&&!w){const bl=[];p.rows.forEach((r,ri)=>{for(let i=0;i<S.db[ri];i++){const v=S.fill[ri+"."+i];if(v!=="?")bl.push({v:+v,w:S.dw[ri+"."+i]||64,k:ri+"."+i})}});
outer:for(const a of bl)for(const b of bl){if(a.v<b.v&&a.w>=b.w*.9||a.v===b.v&&Math.abs(a.w-b.w)>Math.max(a.w,b.w)*.25){S.bad[a.k]=S.bad[b.k]=1;msg=a.v===b.v?`Los bloques de ${a.v} deben medir parecido.`:`El bloque de ${b.v} debe ser más largo que el de ${a.v}.`;break outer}}}
if(miss||w||msg){S.errs++;S.em++;S.msg=msg||(miss?"Faltan bloques por colocar.":`Revisa ${lab(w)}: algún bloque no encaja.`)}else{S.step=2;S.msg="¡Modelo perfecto! Ahora arma la operación."}render()}
function chkM(){if(P[S.i].draw&&!P[S.i].fr)return chkD();if(P[S.i].fr)return chkF();const p=P[S.i];let miss=0,w=null;S.bad={};
p.rows.forEach((r,ri)=>{const ks=r.s.map((_,si)=>ri+"."+si),ex=r.s.map(x=>String(sv(x)));ks.forEach(q=>{if(S.fill[q]===undefined){miss++;S.bad[q]=1}});
if(ks.every(q=>S.fill[q]!==undefined)){const got=ks.map(q=>String(S.fill[q]));const ok=r.s.some(x=>x.g)?got.every((g,i)=>g===ex[i]):got.slice().sort().join()===ex.slice().sort().join();if(!ok){ks.forEach(q=>S.bad[q]=1);w=w||ri+".0"}}if(r.t!==undefined){const q=ri+".t";if(S.fill[q]===undefined){miss++;S.bad[q]=1}else if(String(S.fill[q])!==String(r.t)){S.bad[q]=1;w=w||ri+".0"}}});
if(p.tot!==undefined){if(S.fill.t===undefined){miss++;S.bad.t=1}else if(String(S.fill.t)!==String(p.tot)){S.bad.t=1;w=w||"t"}}
if(miss||w){S.errs++;S.em++;S.msg=miss?"Faltan bloques por colocar. Rellena los huecos punteados.":`Revisa ${lab(w)}: algún bloque no encaja.`}else{S.step=2;S.msg="¡Modelo perfecto! Ahora arma la operación."}render()}
function chkO(){const p=P[S.i];const q=S.ops.slice(0,p.n);const ok=q.length===p.n&&q.every((x,i)=>x!==undefined&&(i%2===0)===/^\d+$/.test(x));const e=ok?q.join("").replace(/×/g,"*").replace(/÷/g,"/").replace(/−/g,"-"):"";
if(!ok||!/^\d+([+\-*\/]\d+)*$/.test(e)){S.errs++;S.eo++;S.msg="Alterna número y signo hasta llenar todos los huecos."}
else{const r=Function("return "+e)();if(Math.abs(r-p.ans)<1e-9){S.step=3;S.msg="Escribe el resultado con el teclado.";}else{S.errs++;S.eo++;S.msg=`Esa operación da ${Math.round(r*100)/100}. ¿Encaja con el modelo?`}}render()}
function chkA(){const p=P[S.i];if(+S.ans===p.ans){S.done=true;const e=S.errs+S.hints;S.pst=e===0?3:e<=2?2:1;S.stars+=S.pst;Game.done({dt:Math.min(Date.now()-S.t0,3e5),id:p.id,w:p.w,l:p.l,errs:S.errs,hints:S.hints,pst:S.pst,em:S.em,eo:S.eo,ea:S.ea,tot:p.tot!==undefined||p.rows.some(r=>r.t!==undefined)});S.msg="¡El '?' encaja perfecto en el modelo!"}else{S.errs++;S.ea++;S.msg="Casi. Mira el modelo: ¿encaja ese número en el '?'";S.ans=""}render()}
document.addEventListener("click",e=>{if(S.skip||!S.on)return;const p=P[S.i],a=e.target.closest("[data-a]"),s=e.target.closest(".slot[data-s]"),n=e.target.closest(".nm"),k=e.target.closest("[data-k]");const ce=e.target.closest(".cell[data-c]");if(ce&&S.step===1){S.sh[ce.dataset.c]=!S.sh[ce.dataset.c];render();return}const dd=e.target.closest("[data-d]");if(dd&&S.step===1){const v=dd.dataset.d,r=dd.dataset.r;if(v==="np")S.nd=Math.max(1,Math.min(12,S.nd+ +dd.dataset.v));else if(v==="add")S.db[r]=Math.min(6,(S.db[r]||0)+1);else{const n=S.db[r]||0;if(n){delete S.fill[r+"."+(n-1)];delete S.dw[r+"."+(n-1)];S.db[r]=n-1}}render();return}
if(a){const x=a.dataset.a;if(x==="read")say(p.t);if(x==="exit"){S.on=false;Game.exit();return}if(x==="go1"){S.step=1;S.msg=P[S.i].draw?(P[S.i].fr?"Elige cuántas partes iguales tiene la barra, sombrea y coloca los números.":"Dibuja las barras: pulsa + para añadir bloques, estira cada uno por el borde y arrastra los números."):P[S.i].l===1?"Nivel 1: el modelo ya casi está hecho. Completa los huecos que faltan.":P[S.i].fr?"Toca las partes para sombrearlas y arrastra los bloques a los huecos.":"Arrastra bloques a los huecos (o toca un bloque y luego el hueco).";render()}
if(x==="hint"){S.hints++;S.msg=p.h[Math.min(S.hc++,p.h.length-1)];render()}if(x==="chkm")chkM();if(x==="chko")chkO();
if(x==="next"){if(S.i===P.length-1)S.fin=true;else{S.i++;reset();prefill()}render()}if(x==="again"){S.i=0;S.stars=0;S.fin=false;reset();render()}return}
if(s){const t=s.dataset.s;if(S.sel!==null)place(t,S.sel);else{if(t[0]==="m")delete S.fill[t.slice(2)];else S.ops[+t.slice(2)]=undefined;render()}return}
if(n&&S.step===0){S.hl[n.dataset.n]=!S.hl[n.dataset.n];render();return}
if(k){const d=k.dataset.k;if(d==="b")S.ans=S.ans.slice(0,-1);else if(d==="ok")return chkA();else if(S.ans.length<3)S.ans+=d;render()}});
let dr=null;
document.addEventListener("pointerdown",e=>{const rz=S.on&&e.target.closest("[data-rz]");if(rz){const k=rz.dataset.rz;dr={rz:k,x:e.clientX,w:S.dw[k]||64};return}const c=S.on&&e.target.closest(".chip"),sl=S.on&&!c&&e.target.closest(".slot[data-s]:not(.em)");if(c)dr={v:c.dataset.v,x:e.clientX,y:e.clientY,m:false,el:c,g:null};else if(sl){const t=sl.dataset.s,k=t.slice(2),v=t[0]==="m"?S.fill[k]:S.ops[+k];if(v!==undefined)dr={v:String(v),x:e.clientX,y:e.clientY,m:false,el:sl,g:null,src:t}}});
document.addEventListener("pointermove",e=>{if(!dr)return;if(dr.rz){const w=Math.max(40,Math.min(220,Math.round((dr.w+e.clientX-dr.x)/4)*4)),el=document.querySelector(`[data-rz="${dr.rz}"]`);S.dw[dr.rz]=w;if(el){el.parentElement.style.width=w+"px";el.previousElementSibling.style.width=(w-14)+"px"}return}if(!dr.m&&Math.hypot(e.clientX-dr.x,e.clientY-dr.y)>6){dr.m=true;dr.g=dr.el.cloneNode(true);dr.g.className="chip ghost";dr.g.style.width="auto";dr.g.style.minWidth="52px";dr.g.style.padding="0 14px";document.body.appendChild(dr.g)}
if(dr.g){dr.g.style.left=e.clientX+"px";dr.g.style.top=e.clientY+"px"}});
document.addEventListener("pointerup",e=>{if(!dr)return;const d=dr;dr=null;if(d.rz){render();S.skip=true;setTimeout(()=>S.skip=false,0);return}if(d.g)d.g.remove();
if(d.m){const t=document.elementFromPoint(e.clientX,e.clientY)?.closest(".slot[data-s]");if(d.src&&(!t||t.dataset.s!==d.src)){const k=d.src.slice(2);if(d.src[0]==="m")delete S.fill[k];else S.ops[+k]=undefined}if(t)place(t.dataset.s,d.v);else render();S.skip=true;setTimeout(()=>S.skip=false,0)}
else if(!d.src){S.sel=S.sel===d.v?null:d.v;render()}});
document.addEventListener("pointercancel",()=>{if(dr&&dr.g)dr.g.remove();dr=null});
function prefill(){const p=P[S.i];if(!p||p.l!==1)return;
if(p.fr){for(let i=0;i<p.fr.k;i++)S.sh[i]=true;if(p.tot!=="?")S.fill.t=String(p.tot);["g1","g2"].forEach(k=>{if(p.fr[k]!==undefined&&p.fr[k]!=="?")S.fill[k]=String(p.fr[k])});return}
p.rows.forEach((r,ri)=>{r.s.forEach((s,si)=>{const v=typeof s==="object"?s.v:s;if(v!=="?")S.fill[ri+"."+si]=String(v)});if(r.t!==undefined&&r.t!=="?")S.fill[ri+".t"]=String(r.t)});if(p.tot!==undefined&&p.tot!=="?")S.fill.t=String(p.tot)}
function startGame(list){P=list.map(p=>p.l>=3?{...p,tray:p.tray.concat([p.ans+3,p.ans+5].filter(x=>!p.tray.includes(x)))}:p);S.on=true;S.i=0;S.stars=0;S.fin=false;reset();prefill();render()}
