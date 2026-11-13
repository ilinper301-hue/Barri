const { chromium } = require("playwright");
(async()=>{
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true});
const page=await ctx.newPage();const errs=[];page.on("pageerror",e=>errs.push(e.message));
await page.goto(process.env.APP_URL+"?nosplash");await page.waitForTimeout(500);
await page.evaluate(()=>{st.name="Gael";st.stars=70;save();go("home")});
const dest=async(sel)=>{await page.evaluate(()=>go("home"));await page.waitForTimeout(80);await page.click(sel);await page.waitForTimeout(120);return page.evaluate(()=>({scr,on:S.on,h:document.querySelector("h2,.ttl2")?.textContent?.slice(0,30)}))};
console.log("Aventuras ->",JSON.stringify(await dest('.hm .lc.hero')));
await page.evaluate(()=>{S.on=false});
console.log("Aprender ->",JSON.stringify(await dest('.hm [data-go="learn"]')));
console.log("Mi álbum ->",JSON.stringify(await dest('.hm [data-go="album"]')));
console.log("Mapa de mundos ->",JSON.stringify(await dest('.hm [data-go="adv"]')));
console.log("Zona del tutor ->",JSON.stringify(await dest('.hm .tut'))," (pide la operación, no entra directo)");
console.log("Avatar ->",JSON.stringify(await dest('.hm .av')));
// tema
await page.evaluate(()=>go("home"));const t0=await page.evaluate(()=>document.documentElement.dataset.theme);await page.click('.hm [data-act="theme"]');const t1=await page.evaluate(()=>document.documentElement.dataset.theme);console.log("tema:",t0,"->",t1);
await page.click('.hm [data-act="theme"]');
// repasar con pendientes
await page.evaluate(()=>{const p=DATA.problems[0];st.log.push({id:p.id,w:p.w,l:p.l,errs:2,hints:0,pst:1,ts:Date.now(),dt:1000});save();go("home")});
console.log("Repasar (con pendientes) ->",JSON.stringify(await dest('.hm [data-rev]')));
await page.evaluate(()=>{S.on=false});
// estrellas dinámicas
await page.evaluate(()=>{st.stars=12;go("home")});console.log("estrellas:",await page.evaluate(()=>document.querySelector(".hm .pill").textContent.trim()));
// accesorios de la mascota
await page.evaluate(()=>{st.acc="gafas";go("album")});await page.waitForTimeout(100);await page.screenshot({path:process.env.TMPD+"/acc_gafas.png",clip:{x:0,y:0,width:390,height:300}});
await page.evaluate(()=>{st.acc="capa";go("album")});await page.waitForTimeout(100);await page.screenshot({path:process.env.TMPD+"/acc_capa.png",clip:{x:0,y:0,width:390,height:300}});
// alturas
await page.evaluate(()=>{st.acc="casco";go("home")});
console.log("alturas de tarjetas:",JSON.stringify(await page.evaluate(()=>[...document.querySelectorAll(".hm .lc")].map(e=>Math.round(e.getBoundingClientRect().height)))));
console.log("errores JS:",JSON.stringify(errs));await b.close()})();
