const { chromium } = require("playwright");
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const page=await ctx.newPage();const errs=[];page.on("pageerror",e=>errs.push(e.message));
await page.goto("http://localhost:8767/Barri/?nosplash");await page.waitForTimeout(1200);
// una caché "de otra app" debe sobrevivir
await page.evaluate(async()=>{const c=await caches.open("lectori-cache-1");await c.put("/x",new Response("ok"))});
await page.evaluate(()=>{go("tutor",{tab:"s"});cx.dg=1;show()});await page.waitForTimeout(150);
const run=async(url)=>{await page.fill("#du",url);await page.click('[data-act="diag"]');await page.waitForTimeout(700);return page.evaluate(()=>document.getElementById("dg").textContent)};
console.log("=== Otra app con id '/' y alcance '/' ===\n"+await run("http://localhost:8767/Educacion/"));
console.log("\n=== Otra app independiente ===\n"+await run("http://localhost:8767/Edu2/"));
console.log("\n=== URL que no existe ===\n"+await run("http://localhost:8767/Nada/"));
// activar de nuevo el SW (nueva versión) y comprobar cachés
await page.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();await r.update()});await page.waitForTimeout(500);
console.log("\ncachés presentes:",JSON.stringify(await page.evaluate(()=>caches.keys())));
console.log("errores JS:",JSON.stringify(errs));await b.close()})();
