// v1.14: elegir modelo, 1 parte, estimar, frase respuesta, errores típicos, Mezcla, Retos, proyector, barras proporcionales
const { chromium } = require("playwright");
let bad=0;const ok=(c,m)=>{if(!c){bad++;console.log("FALLO",m)}};
(async()=>{const b=await chromium.launch();
for(const [W,H] of [[390,780],[1180,820]]){
const page=await b.newPage({viewport:{width:W,height:H}});page.on("pageerror",e=>{bad++;console.log("ERROR JS",e.message)});
await page.goto(process.env.APP_URL+"?nosplash");await page.waitForTimeout(300);
const tag=" ["+W+"]";
// 1) elegir el modelo (nivel 2) con un fallo
await page.evaluate(()=>{S.on=false;startList([DATA.problems.find(x=>x.w===3&&x.l===2&&x.fr&&x.fr.g1==="?"&&x.fr.k>1&&x.ans!==x.tot/x.fr.d)])});await page.click('[data-a="go1"]');
ok(await page.locator(".mkb").count()===3,"tres modelos para elegir"+tag);
const wrong=await page.evaluate(()=>S.mo.find(k=>k!==kindOf(P[0])));await page.click(`.mkb[data-mk="${wrong}"]`);
ok(await page.evaluate(w=>S.mc&&S.mx[w]===1&&S.mis.mod===1,wrong),"modelo equivocado: se marca y se registra"+tag);
await page.click('.mkb[data-mk="fr"]');ok(await page.evaluate(()=>!S.mc&&S.step===1&&!!document.querySelector(".cell[data-c]")),"modelo correcto: pasa a dibujar"+tag);
// 2) 1 parte = __
await page.evaluate(()=>{const q=P[0];for(let i=0;i<q.fr.k;i++)S.sh[i]=true;["g1","g2"].forEach(k=>{if(q.fr[k]!==undefined)S.fill[k]=String(q.fr[k])});S.fill.t=String(q.tot);chkM()});
ok(await page.evaluate(()=>S.step===2&&S.uq&&!!document.querySelector(".unitq")),"pregunta 1 parte tras el modelo"+tag);
await page.evaluate(()=>{S.ans=String(unitOf(P[0])+1);chkU()});ok(await page.evaluate(()=>S.uq&&S.mis.uni===1),"1 parte mal: sigue y registra"+tag);
await page.evaluate(()=>{S.ans=String(unitOf(P[0]));chkU()});ok(await page.evaluate(()=>!S.uq&&S.unit===unitOf(P[0])&&!!document.querySelector(".exs,.ex")),"1 parte bien: pasa a operar"+tag);
// 3) estimar
await page.evaluate(()=>{const q=P[0];S.ops=[String(q.tot),"÷",String(q.fr.d),"a","×",String(q.fr.k)];chkO()});ok(await page.evaluate(()=>S.step===3&&S.ck==="est"&&!document.querySelector(".pad")),"estimar antes del teclado"+tag);
await page.evaluate(()=>pick(S.ckq.c==="may"?"men":"may"));ok(await page.evaluate(()=>S.ck==="est"&&S.mis.est===1),"estimación mal"+tag);
await page.evaluate(()=>pick(S.ckq.c));ok(await page.evaluate(()=>!S.ck&&!!document.querySelector(".pad")),"estimación bien: teclado"+tag);
// 4) frase respuesta
await page.evaluate(()=>{S.ans=String(unitOf(P[0]));chkA();S.ans=String(P[0].ans);chkA()});ok(await page.evaluate(()=>S.ck==="fr"&&!S.done&&document.querySelectorAll(".ckb").length===3),"frase respuesta tras acertar el número"+tag);
const t=await page.evaluate(()=>S.ckq.o.map(x=>x[0])),tw=await page.evaluate(()=>P[0].ans+" "+unitW(P[0]));ok(t.includes(tw)&&new Set(t).size===3,"opciones de frase "+t.join(" | ")+tag);
await page.evaluate(()=>pick(String(S.ckq.o.findIndex(x=>!x[1]))));ok(await page.evaluate(()=>S.mis.fra===1&&!S.done),"frase mal"+tag);
await page.evaluate(()=>pick(String(S.ckq.o.findIndex(x=>x[1]))));ok(await page.evaluate(()=>S.done&&/tiene sentido/i.test(S.msg)),"frase bien: termina y recuerda la estimación"+tag);
const lg=await page.evaluate(()=>st.log.slice(-1)[0]||{});ok(/mod\*1/.test(lg.mis)&&/uni\*1/.test(lg.mis)&&/est\*1/.test(lg.mis)&&/fra\*1/.test(lg.mis),"errores típicos guardados "+lg.mis+tag);
// 5) signo cambiado y total/parte
await page.evaluate(()=>{S.on=false;startList([DATA.problems.find(x=>x.id==="M1-N2-04")]);S.step=2;S.ops=[String(P[0].tot),"+",String(P[0].rows[0].s[0])];chkO()});ok(await page.evaluate(()=>S.mis.omp===1),"suma en vez de resta registrada"+tag);
await page.evaluate(()=>{S.on=false;startList([DATA.problems.find(x=>x.id==="M1-N2-04")]);S.step=1;S.fill={"0.0":String(P[0].tot),"0.1":"?",t:String(P[0].rows[0].s[0])};chkM()});ok(await page.evaluate(()=>S.mis.tp===1),"total y parte confundidos"+tag);
// 6) nivel 1: sin elegir modelo ni estimar
await page.evaluate(()=>{S.on=false;startList([DATA.problems.find(x=>x.id==="M1-N1-01")])});await page.click('[data-a="go1"]');ok(await page.evaluate(()=>!S.mc),"nivel 1 sin elegir modelo"+tag);
// 7) barras proporcionales al colocar
await page.evaluate(()=>{S.on=false;startList([DATA.problems.find(x=>x.id==="M1-N2-01")]);S.mc=false;S.step=1;render()});
const w0=await page.evaluate(()=>[document.querySelector('[data-s="m:0.0"]').offsetWidth,document.querySelector('[data-s="m:0.1"]').offsetWidth]);
await page.evaluate(()=>{const s=P[0].rows[0].s;place("m:0.0",String(Math.max(...s)));place("m:0.1",String(Math.min(...s)))});await page.waitForTimeout(500);
const w1=await page.evaluate(()=>[document.querySelector('[data-s="m:0.0"]').offsetWidth,document.querySelector('[data-s="m:0.1"]').offsetWidth]);
ok(w0[0]===w0[1]&&w1[0]>w1[1],"bloques crecen en proporción "+w0+" -> "+w1+tag);
await page.evaluate(()=>{S.on=false;go("home")});
// 7b) tocar una ficha en Calcular la coloca en el primer hueco libre
await page.evaluate(()=>{S.on=false;startList([DATA.problems.find(x=>x.id==="M1-N2-01")]);S.mc=false;S.step=2;render()});
const ab=await page.evaluate(()=>P[0].rows[0].s.map(String));for(const v of [ab[0],"+",ab[1]]){await page.click(`.tray .chip[data-v="${v}"]`);await page.waitForTimeout(60)}
ok(await page.evaluate(()=>S.ops.join(" ")===P[0].rows[0].s[0]+" + "+P[0].rows[0].s[1]),"toque coloca en el primer hueco "+await page.evaluate(()=>S.ops.join(" "))+tag);
await page.evaluate(()=>{S.on=false;go("home")});
// 8) Mezcla
await page.click('[data-mix="1"]');const mx=await page.evaluate(()=>P.map(p=>p.w));
ok(mx.length>=4&&mx.every((w,i)=>!i||w!==mx[i-1]),"Mezcla alterna mundos "+mx.join(",")+tag);await page.evaluate(()=>{S.on=false;go("home")});
// 9) Retos: abierto tras comparación y fracciones nivel 2
ok(await page.evaluate(()=>!open(5,2)),"Retos cerrado al principio"+tag);
await page.evaluate(()=>{[2,3].forEach(w=>pool(w,2).slice(0,5).forEach(p=>st.solved[p.id]=1))});ok(await page.evaluate(()=>open(5,2)),"Retos se abre"+tag);
await page.evaluate(()=>{pool(5,2).concat(pool(5,3)).forEach(p=>{startGame([p]);S.step=1;p.rows.forEach((r,ri)=>{r.s.forEach((s,si)=>S.fill[ri+"."+si]=String(sv(s)));if(r.t!==undefined)S.fill[ri+".t"]=String(r.t)});if(p.tot!==undefined)S.fill.t=String(p.tot);chkM();if(S.step!==2)window.__r5=(window.__r5||"")+p.id});S.on=false});
ok(await page.evaluate(()=>!window.__r5),"modelos de Retos correctos "+await page.evaluate(()=>window.__r5)+tag);
// 10) informe del tutor
await page.evaluate(()=>go("tutor",{tab:"p"}));await page.click('[data-sub="mis"]');const rep=await page.locator(".lmis").count();ok(rep>=3,"informe de errores típicos ("+rep+")"+tag);
ok(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)),"tutor sin desbordar"+tag);
// 11) proyector
await page.evaluate(()=>go("proj",{w:3,l:2}));ok(await page.locator(".pjt").count()===1&&await page.locator(".pjm").count()===0,"proyector: solo enunciado"+tag);
await page.keyboard.press("ArrowRight");ok(await page.evaluate(()=>[...document.querySelectorAll(".pjm .slot")].every(e=>!e.textContent.trim())),"proyector: modelo vacío"+tag);
await page.keyboard.press("ArrowRight");await page.keyboard.press("ArrowRight");await page.keyboard.press("ArrowRight");ok(await page.locator(".pja").count()===1,"proyector: solución"+tag);
await page.click('[data-pj="next"]');ok(await page.evaluate(()=>cx.i===1&&!cx.k),"proyector: siguiente problema"+tag);
await page.click('[data-pj="day"]');ok(await page.evaluate(()=>cx.day===1&&!!document.querySelector(".pjt")),"proyector: problema del día"+tag);
ok(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)),"proyector sin desbordar"+tag);
await page.evaluate(()=>go("adv",{w:5}));ok(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)),"mapa con 5 mundos sin desbordar"+tag);
await page.close()}
console.log(bad?"v114.js: "+bad+" fallos":"v114.js: todo OK");await b.close()})();
