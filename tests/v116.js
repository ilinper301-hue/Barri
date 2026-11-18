// v1.16: volver a fases, mascota y altavoz, letras, anchos, fracciones, tutor, Extremo, banco variado
const { chromium } = require("playwright");
let bad=0;const ok=(c,m)=>{if(!c){bad++;console.log("FALLO",m)}};
(async()=>{const b=await chromium.launch();const page=await b.newPage({viewport:{width:390,height:780}});page.on("pageerror",e=>{bad++;console.log("ERROR JS",e.message)});
await page.addInitScript(()=>{window.__said=[];try{speechSynthesis.speak=u=>{window.__said.push(u.text)}}catch(e){}});
await page.goto(process.env.APP_URL+"?nosplash");await page.waitForTimeout(400);
// altavoz junto al enunciado, no arriba
await page.evaluate(()=>{S.on=false;startList([DATA.problems.find(x=>x.id==="M3-N2-01")])});
ok(await page.locator(".tx .txr").count()===1&&await page.locator('.top [data-a="read"]').count()===0,"altavoz junto al enunciado");
await page.click(".tx .txr");ok(await page.evaluate(()=>window.__said.includes(P[0].t)),"altavoz lee el enunciado");
await page.evaluate(()=>{window.__said=[]});await page.click(".bub svg");ok(await page.evaluate(()=>window.__said.includes(S.msg)),"tocar a Bloquito");
ok(await page.locator(".bsp").count()===0,"sin botón de audio en la burbuja");
// volver a una fase anterior
await page.evaluate(()=>{const q=P[0];S.step=2;S.uq=false;render()});ok(await page.locator('.pills [data-st="1"]').count()===1,"pasos hechos son botones");
await page.click('.pills [data-st="1"]');ok(await page.evaluate(()=>S.step===1),"volver a Dibujar");
await page.evaluate(()=>{S.step=3;S.rv=[P[0].ans];render()});await page.click('.pills [data-st="2"]');ok(await page.evaluate(()=>S.step===2&&!S.rv),"volver a Calcular");
await page.click('.pills [data-st="0"]');ok(await page.evaluate(()=>S.step===0),"volver a Leer");
// letras a, b en varias líneas
await page.evaluate(()=>{S.on=false;startList([DATA.problems.find(x=>x.n===5&&!x.fr)]);S.mc=false;S.cp=false;S.step=2;render()});
ok(await page.locator('.tray .chip.var[data-v="a"]').count()===1&&await page.locator(".exs .tk .var").count()===1,"resultado intermedio con letra a");
// anchos: filas con el mismo total miden igual (comparación «menos»)
const eq=await page.evaluate(()=>DATA.problems.filter(x=>x.w===2&&x.rows[1]&&x.rows[1].s.some(s=>typeof s==="object")).slice(0,8).map(q=>{S.on=false;startGame([q]);S.step=3;S.rv=[q.ans];render();const r=[...document.querySelectorAll(".mr")].map(m=>[...m.querySelectorAll(".slot")].reduce((a,s)=>a+s.offsetWidth+4,-4));return Math.abs(r[0]-r[1])}));
ok(eq.every(d=>d<=2),"barra de arriba = suma de las de abajo "+eq);
// bloques iguales miden igual (Extremo 1)
const u=await page.evaluate(()=>{S.on=false;const q=DATA.problems.find(x=>x.id==="M6-N3-01");startGame([q]);S.step=3;S.rv=[q.ans];render();return [...document.querySelectorAll(".mr")].map(m=>m.querySelector(".slot").offsetWidth)});
ok(new Set(u).size===1,"barras de unidad iguales "+u);
// fracciones: líneas al juntar partes
await page.evaluate(()=>{S.on=false;const q=DATA.problems.find(x=>x.fr&&x.fr.k>1&&x.fr.g1==="?");startGame([q]);for(let i=0;i<q.fr.k;i++)S.sh[i]=true;S.step=2;S.uq=false;render()});
ok(await page.evaluate(()=>getComputedStyle(document.querySelector(".reg .rl .slot")).backgroundImage.includes("repeating-linear-gradient")),"líneas entre partes juntas");
// Extremo abierto y en el mapa
ok(await page.evaluate(()=>open(6,3)&&pool(6,3).length===5),"mundo Extremo con 5 problemas abierto");
await page.evaluate(()=>{S.on=false;go("adv",{w:6})});ok(await page.locator('.wcd[data-w="6"]').count()===1,"Extremo en el mapa");
ok(await page.evaluate(()=>!mixList(50).some(p=>p.w===6)),"Extremo fuera de Mezcla");
// números del selector con el color del mundo
await page.evaluate(()=>{go("adv",{w:1,tutor:1});document.querySelector(".psel").open=true});ok(await page.evaluate(()=>getComputedStyle(document.querySelector(".lvw .pp b")).backgroundColor!==getComputedStyle(document.querySelector(".ib")||document.body).backgroundColor&&getComputedStyle(document.querySelector(".lvw")).getPropertyValue("--wc").trim()==="#0E7490"),"selector con color del mundo");
// tutor: dos bloques y desplegables
await page.evaluate(()=>go("tutor",{tab:"p"}));ok(await page.locator(".pg-2").count()===1&&await page.locator(".pg-2 .lh").count()>=2&&await page.locator(".pst>div").count()===4,"tutor reorganizado en listas");
// banco variado
const v=await page.evaluate(()=>{const P=DATA.problems.filter(p=>p.w<=4),s=new Set(P.map(p=>p.t.replace(/\d+/g,"#").slice(0,28)));return [s.size,P.length]});ok(v[0]/v[1]>.6,"variedad de enunciados "+v);
console.log(bad?"v116.js: "+bad+" fallos":"v116.js: todo OK");await b.close()})();
