const { chromium } = require("playwright");
(async()=>{
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true,acceptDownloads:true});
const page=await ctx.newPage();const errs=[];page.on("pageerror",e=>errs.push(e.message));
await page.goto(process.env.APP_URL+"?nosplash");await page.waitForTimeout(500);
// --- inicio: Repasar al día no se sale; botones más pequeños
const m=await page.evaluate(()=>{const W=innerWidth;const lcs=[...document.querySelectorAll(".lc")].map(e=>{const r=e.getBoundingClientRect();return Math.round(r.left)+"-"+Math.round(r.right)});const hc=[...document.querySelectorAll(".hc")].map(e=>Math.round(e.getBoundingClientRect().height)+"x"+Math.round(e.getBoundingClientRect().width));return{W,lcs,hc,over:document.documentElement.scrollWidth>W,rep:document.querySelector(".lc.done")?.textContent}});
console.log("tarjetas .lc (izq-der):",JSON.stringify(m.lcs),"| botones álbum/mapa (alto x ancho):",JSON.stringify(m.hc),"| scroll horizontal:",m.over,"|",m.rep);
await page.screenshot({path:process.env.TMPD+"/hh.png"});
// --- zona tutor -> mundos desbloqueados
await page.evaluate(()=>go("tutor",{tab:"p"}));await page.waitForTimeout(150);
await page.click('[data-go="adv"][data-tutor="1"]');await page.waitForTimeout(150);
const adv=await page.evaluate(()=>({nota:document.querySelector(".note")?.textContent,jugar:[...document.querySelectorAll("[data-play]")].map(e=>e.textContent),atras:document.querySelector(".back").textContent}));
console.log("mundos desde tutor:",JSON.stringify(adv));
await page.click('[data-go="adv"][data-w="3"]');await page.waitForTimeout(100);
console.log("tras cambiar de mundo sigue modo tutor:",await page.evaluate(()=>!!document.querySelector(".note")&&document.querySelectorAll("[data-play]").length));
await page.click(".back");await page.waitForTimeout(100);console.log("volver:",await page.evaluate(()=>document.querySelector(".who")?"zona del tutor":"otra"));
// sin tutor: niveles bloqueados
await page.evaluate(()=>go("adv",{w:1}));console.log("modo niño nivel 3 bloqueado:",await page.evaluate(()=>document.querySelectorAll("[data-play]").length),"botones de jugar");
// --- Excel: descargar
await page.evaluate(()=>go("tutor",{tab:"c"}));await page.waitForTimeout(100);
const [dl]=await Promise.all([page.waitForEvent("download"),page.click('[data-act="xdl"]')]);await dl.saveAs(process.env.TMPD+"/descarga.xlsx");console.log("descarga:",dl.suggestedFilename());
// --- importar el original
await page.setInputFiles("#xf",process.env.TMPD+"/descarga.xlsx");await page.waitForTimeout(800);
console.log("import original:",await page.evaluate(()=>document.querySelector(".note")?.textContent),"| total",await page.evaluate(()=>DATA.problems.length));
// --- importar el editado
await page.setInputFiles("#xf",process.env.TMPD+"/edit.xlsx");await page.waitForTimeout(800);
const e=await page.evaluate(()=>({nota:document.querySelector(".note")?.textContent,total:DATA.problems.length,p:DATA.problems.find(p=>p.id==="M1-N1-01"),nuevo:DATA.problems.find(p=>p.id==="M1-N2-99")?.t,roto:!!DATA.problems.find(p=>p.id==="M1-N1-02"),guardado:!!JSON.parse(localStorage.getItem("barri.v1")).bank}));
console.log("import editado:",JSON.stringify({nota:e.nota,total:e.total,texto:e.p.t,ans:e.p.ans,nuevo:e.nuevo,rotoIncluido:e.roto,guardado:e.guardado}));
// el problema editado se juega con la respuesta nueva
await page.evaluate(()=>{S.on=false;play(1,1)});await page.waitForTimeout(150);
console.log("primer problema del juego:",await page.evaluate(()=>P[0].t));
// recargar: el banco importado persiste
await page.reload();await page.waitForTimeout(400);console.log("tras recargar:",await page.evaluate(()=>DATA.problems.length+" problemas; M1-N1-01 = "+DATA.problems.find(p=>p.id==="M1-N1-01").t.slice(0,20)));
// volver al original
page.on("dialog",d=>d.accept());await page.evaluate(()=>go("tutor",{tab:"c"}));await page.click('[data-act="xreset"]');await page.waitForTimeout(150);
console.log("banco original:",await page.evaluate(()=>DATA.problems.length+" | "+DATA.problems.find(p=>p.id==="M1-N1-01").t.slice(0,25)));
await page.screenshot({path:process.env.TMPD+"/cfg.png",fullPage:true});
console.log("errores JS:",JSON.stringify(errs));await b.close()})();
