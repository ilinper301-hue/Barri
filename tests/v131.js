// v1.31 · Fase 4 de PLAN-BARRI: pantalla de juego (Bloquito fijo, pizarra plegable, modelo a la izquierda, barras al ancho, horizontal bajo)
const { chromium } = require("playwright");let bad=0;const ok=(c,m)=>{if(!c){bad++;console.log("FALLO",m)}};
(async()=>{const b=await chromium.launch();
const open=async(w,h)=>{const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:true,reducedMotion:"reduce"});const p=await ctx.newPage();p.on("pageerror",e=>{bad++;console.log("ERROR JS",e.message)});await p.goto(process.env.APP_URL+"?nosplash");await p.waitForTimeout(300);return [ctx,p]};
const put=(p,id,step)=>p.evaluate(([id,step])=>{S.on=false;startGame([DATA.problems.find(x=>x.id===id)]);if(S.cp)S.cp=false;S.step=step;if(S.mc)S.mc=0;S.uq=0;S.ck=0;render()},[id,step]);
// 1. Móvil: Bloquito justo bajo el enunciado en los 4 pasos
{const [ctx,p]=await open(390,844);for(const id of ["M1-N2-01","M3-N2-01","M7-N2-01"])for(const s of [0,1,2,3]){await put(p,id,s);
 ok(await p.evaluate(()=>{const t=document.querySelector("#app>.tx");return !!t&&t.nextElementSibling&&t.nextElementSibling.matches(".bub")}),"móvil: Bloquito bajo el enunciado "+id+" paso "+s)}
 // barras que no caben en móvil encogen (antes «×4 veces» saltaba de línea)
 const [c2,p2]=await open(360,640);let wr=0;for(const id of await p2.evaluate(()=>DATA.problems.filter(x=>x.w===4&&x.l<=3).map(x=>x.id)))for(const s of [2,3]){await put(p2,id,s);
  if(await p2.evaluate(()=>[...document.querySelectorAll(".mr")].some(m=>{const t=[...m.querySelectorAll(".slot")].map(e=>Math.round(e.getBoundingClientRect().top));return t.length&&Math.max(...t)-Math.min(...t)>3})))wr++}
 ok(wr===0,"360 px: filas del mundo 4 sin saltos ("+wr+")");await c2.close();await ctx.close()}
// 2. Tableta: estructura, pizarra plegable, barras al ancho
{const [ctx,p]=await open(1180,820);await put(p,"M1-N2-01",1);
 ok(await p.evaluate(()=>!!document.querySelector(".top>.pills")&&!!document.querySelector(".top>.pzb")),"pasos y botón Pizarra en la barra superior");
 ok(await p.evaluate(()=>document.querySelector(".gl").lastElementChild.matches(".bub")&&!document.querySelector(".spad")),"Bloquito abajo a la izquierda y pizarra cerrada");
 await put(p,"M1-N2-01",2);ok(await p.evaluate(()=>{const g=document.querySelector(".gl");return [...g.children].map(e=>e.className.split(" ").slice(-1)[0]).join(",")==="tx,mdl,bub"&&!document.querySelector(".gr2 .mdl")}),"Calcular: enunciado, modelo y Bloquito a la izquierda");
 const m=await p.evaluate(()=>{const c=document.querySelector(".mdl"),cs=getComputedStyle(c),av=c.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight),r=[...c.querySelectorAll(".mr")],tb=c.querySelector(".tb"),ps=[...r[1].querySelectorAll(".bars>.slot")];
  const span=ps[ps.length-1].getBoundingClientRect().right-ps[0].getBoundingClientRect().left;return {av,span,tb:tb.getBoundingClientRect().width,w:ps.map(e=>e.getBoundingClientRect().width)}});
 ok(m.span>m.av*0.6,"barras ocupan el ancho de la tarjeta "+JSON.stringify(m));ok(Math.abs(m.tb-m.span)<=2,"Total del mismo ancho que las partes");ok(Math.abs(m.w[0]/m.w[1]-21/13)<0.15,"proporción 21:13 conservada "+m.w);
 await put(p,"M3-N2-01",2);ok(await p.evaluate(()=>{const c=document.querySelector(".mdl"),R=c.getBoundingClientRect();return [...c.querySelectorAll(".reg,.tb")].every(e=>e.getBoundingClientRect().right<=R.right)}),"fracciones dentro de la tarjeta");
 await ctx.close()}
// 3. Barrido de todos los problemas (pasos 1-3): sin desbordes horizontales ni saltos; Bloquito siempre visible
for(const [w,h,maxN,maxOy] of [[1180,820,0,0],[1024,768,0,0],[960,540,0,0],[844,390,30,70]]){const [ctx,p]=await open(w,h);
 const r=await p.evaluate(()=>{const o={n:0,ov:0,oy:0,hid:0,wrap:0,ox:0};for(const id of DATA.problems.filter(x=>x.l<=3&&!x.sp).map(x=>x.id))for(const step of [1,2,3]){S.on=false;startGame([DATA.problems.find(x=>x.id===id)]);if(S.cp)S.cp=false;S.step=step;if(S.mc)S.mc=0;S.uq=0;S.ck=0;render();o.n++;
  const oy=document.documentElement.scrollHeight-innerHeight;if(oy>0)o.ov++;o.oy=Math.max(o.oy,oy);if(document.documentElement.scrollWidth>innerWidth+1)o.ox++;
  const q=document.querySelector(".bub").getBoundingClientRect();if(q.bottom>innerHeight+1||q.top<0)o.hid++;
  if([...document.querySelectorAll(".mr")].some(m=>{const t=[...m.querySelectorAll(".slot")].map(e=>Math.round(e.getBoundingClientRect().top));return t.length&&Math.max(...t)-Math.min(...t)>3}))o.wrap++;
  if([...document.querySelectorAll(".mdl,.gr2>.card")].some(c=>[...c.querySelectorAll(".slot,.reg")].some(e=>e.getBoundingClientRect().right>c.getBoundingClientRect().right+1)))o.ox++}return o});
 console.log(w+"x"+h,JSON.stringify(r));ok(r.hid===0,w+"x"+h+": Bloquito visible siempre");ok(r.ox===0,w+"x"+h+": sin desbordes horizontales");ok(r.wrap<=3,w+"x"+h+": filas sin saltar");ok(r.ov<=maxN&&r.oy<=maxOy,w+"x"+h+": desborde vertical acotado");
 if(w===844){await put(p,"M1-N2-01",3);ok(await p.evaluate(()=>getComputedStyle(document.querySelector(".pad")).gridTemplateColumns.split(" ").length===6),"844x390: teclado en 6 columnas")}
 await ctx.close()}
console.log(bad?"v131.js: "+bad+" fallos":"v131.js: todo OK");await b.close()})();
