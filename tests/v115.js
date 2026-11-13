// v1.15: apoyos por alumno (fase con objetos, lectura en voz alta, daltonismo), fuentes alojadas y dificultad adaptativa
const { chromium } = require("playwright");
let bad=0;const ok=(c,m)=>{if(!c){bad++;console.log("FALLO",m)}};
(async()=>{const b=await chromium.launch();const page=await b.newPage({viewport:{width:390,height:780}});page.on("pageerror",e=>{bad++;console.log("ERROR JS",e.message)});
await page.addInitScript(()=>{window.__said=[];try{const o=speechSynthesis.speak.bind(speechSynthesis);speechSynthesis.speak=u=>{window.__said.push(u.text)}}catch(e){}});
await page.goto(process.env.APP_URL+"?nosplash");await page.waitForTimeout(400);
// fuentes
ok(await page.evaluate(async()=>{await document.fonts.ready;const f=[...document.fonts].filter(x=>x.status==="loaded").map(x=>x.family);const all=[...document.fonts].map(x=>x.family);await Promise.all([...document.fonts].filter(x=>x.family==="Fredoka").map(x=>x.load().catch(()=>{})));return f.includes("Fredoka")&&all.includes("Nunito")&&[...document.fonts].some(x=>x.family==="Fredoka"&&x.weight==="400 700"&&x.status==="loaded")}),"fuentes alojadas cargadas (Fredoka 400-700)");
ok(!(await page.evaluate(()=>!!document.querySelector('link[href*="fonts.googleapis"]'))),"sin Google Fonts");
// valores por defecto y saneado
ok(await page.evaluate(()=>{const a=cleanAp(undefined);return a.cp==="w12"&&a.nr==="w12"&&a.cb===false}),"apoyos por defecto");
ok(await page.evaluate(()=>{const a=cleanAp({cp:"x",nr:"all",cb:"si"});return a.cp==="w12"&&a.nr==="all"&&a.cb===false}),"apoyos saneados");
// fase con objetos (mundo 1, nivel 1)
await page.evaluate(()=>{S.on=false;startList([DATA.problems.find(x=>x.id==="M1-N1-04")])});await page.click('[data-a="go1"]');
ok(await page.evaluate(()=>S.cp&&document.querySelectorAll(".cpc .grp").length===3),"fase con objetos: total, parte y ?");
ok(await page.evaluate(()=>document.querySelectorAll(`.grp[data-cnt="${P[0].tot}"] .ob`).length===P[0].tot),"tantos objetos como el total");
const b0=await page.evaluate(()=>P[0].rows[0].s[0]);await page.click(`.grp[data-cnt="${b0}"]`);await page.waitForTimeout(700);ok(await page.evaluate(b=>window.__said.some(t=>t.startsWith(b+" ")),b0),"contar en voz alta");
await page.click('[data-a="cpgo"]');await page.waitForTimeout(1400);ok(await page.evaluate(()=>!S.cp&&!!document.querySelector('.slot[data-s^="m:"]')),"convertir en barras");
// decenas para números grandes y sin fase en mundo 3
await page.evaluate(()=>{S.on=false;startList([DATA.problems.find(x=>x.w===2&&x.l===2&&!x.draw&&cpMax(x)<=60&&x.rows.some(r=>r.s.some(v=>+sv(v)>20)))])});await page.click('[data-a="go1"]');ok(await page.locator(".cpc .ten").count()>=2,"decenas en números grandes");
await page.evaluate(()=>{S.on=false;startList([DATA.problems.find(x=>x.id==="M3-N1-01")])});await page.click('[data-a="go1"]');ok(await page.evaluate(()=>!S.cp),"sin fase con objetos en fracciones");
// lectura en voz alta
await page.evaluate(()=>{S.on=false;window.__said=[];startList([DATA.problems.find(x=>x.id==="M1-N1-01")])});await page.waitForTimeout(700);
ok(await page.evaluate(()=>document.querySelectorAll(".tx .w").length>5&&!!document.querySelector(".tx .pic")),"enunciado con palabras marcadas y dibujo");
ok(await page.evaluate(()=>window.__said.some(t=>t===P[0].t)),"lee el enunciado al empezar");
await page.evaluate(()=>{window.__said=[]});await page.click(".bub svg");ok(await page.evaluate(()=>window.__said.includes(S.msg)),"tocar a Bloquito repite el mensaje");
await page.click('[data-a="go1"]');await page.waitForTimeout(200);ok(await page.evaluate(()=>window.__said.some(t=>/objetos/.test(t))),"lee los mensajes de Bloquito");
// mundo 3 sin lectura por defecto
await page.evaluate(()=>{S.on=false;startList([DATA.problems.find(x=>x.id==="M3-N2-01")])});ok(await page.evaluate(()=>!document.querySelector(".tx .w")),"mundo 3 sin lectura por defecto");
// ajustes: aplicar apoyos
await page.evaluate(()=>{S.on=false;go("tutor",{tab:"u"})});await page.selectOption("#apcp","off");await page.selectOption("#apnr","all");await page.selectOption("#apcb","1");
ok(await page.evaluate(()=>st.ap.cp==="off"&&st.ap.nr==="all"&&st.ap.cb===true&&document.documentElement.dataset.cb==="1"),"guardar apoyos");
await page.evaluate(()=>{startList([DATA.problems.find(x=>x.id==="M1-N2-01")]);S.mc=false;S.step=1;S.fill={"0.0":"30","0.1":"21"};render()});
ok(await page.evaluate(()=>getComputedStyle(document.querySelector('.slot[data-p="1"]')).backgroundImage.includes("gradient")),"trama en daltonismo");
ok(await page.evaluate(()=>document.querySelector('[data-s="m:0.0"]').style.backgroundColor.includes("230, 159, 0")),"paleta segura (Okabe-Ito)");
await page.evaluate(()=>{S.on=false;startList([DATA.problems.find(x=>x.id==="M1-N1-04")])});await page.click('[data-a="go1"]');ok(await page.evaluate(()=>!S.cp),"fase con objetos desactivada");
// apoyos por alumno: otro perfil no los hereda
await page.evaluate(()=>{S.on=false;addStu("Nora");go("home")});ok(await page.evaluate(()=>!st.ap.cb&&!document.documentElement.dataset.cb),"apoyos separados por alumno");
// dificultad adaptativa
const r=await page.evaluate(()=>{S.on=false;play(1,2);const ids0=P.map(p=>p.id),d0=P.filter(p=>!p.sp).map(dif);const cur=P[0];S.i=0;
 const m1=adapt({errs:0,hints:0,pst:3,id:P[0].id});S.i=1;const m2=adapt({errs:0,hints:0,pst:3,id:P[1].id});const up=P[2]&&dif(P[2])>dif(P[1]);
 S.i=2;const t=ptype(P[2]),m3=adapt({errs:4,hints:1,pst:1,id:P[2].id});const same=P[3]&&ptype(P[3])===t;
 return{ord:d0.every((v,i)=>!i||v>=d0[i-1]),m1,m2,up,m3,same}});
ok(r.ord,"nivel empieza ordenado de fácil a difícil");ok(!r.m1&&/difícil/.test(r.m2||"")&&r.up,"sube la dificultad tras 2 aciertos limpios "+JSON.stringify(r));ok(/parecido/.test(r.m3||"")&&r.same,"baja con uno del mismo tipo tras fallar "+JSON.stringify(r));
ok(await page.evaluate(()=>{pool(1,2).slice(0,5).forEach(p=>st.solved[p.id]=3);ADP.sum=15;ADP.n=5;return /nivel 3/.test(endExtra())}),"propone subir de nivel");
ok(await page.evaluate(()=>{ADP.sum=5;ADP.n=5;return /cómo se hace/.test(endExtra())}),"propone repasar la lección");
ok(await page.evaluate(()=>{S.on=false;mixList();startList(mixList());return ADP===null}),"Mezcla sin adaptación");
await page.evaluate(()=>{S.on=false;st.log=[];for(let i=0;i<6;i++)st.log.push({id:"x",w:1,l:2,errs:0,ts:1});play(1,2)});ok(await page.evaluate(()=>dif(P[0])>Math.min(...pool(1,2).map(dif))),"alumno con buen historial empieza más arriba");
console.log(bad?"v115.js: "+bad+" fallos":"v115.js: todo OK");await b.close()})();
