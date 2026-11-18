const { chromium } = require("playwright");
(async()=>{
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true});
const page=await ctx.newPage();const errs=[];page.on("pageerror",e=>errs.push(e.message));
const cdp=await ctx.newCDPSession(page);
await page.goto("http://localhost:8766/barri/");await page.waitForTimeout(1500);
const man=await cdp.send("Page.getAppManifest");console.log("manifest:",man.errors.length?JSON.stringify(man.errors):"sin errores");
try{const id=await cdp.send("Page.getAppId");console.log("ID de la app:",id.appId,"| recomendado:",id.recommendedId)}catch(e){console.log("getAppId:",e.message.slice(0,50))}
const ie=await cdp.send("Page.getInstallabilityErrors");console.log("errores de instalabilidad:",JSON.stringify(ie.installabilityErrors));
console.log("service worker:",await page.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();return r?r.scope:null}));
await page.reload();await page.waitForTimeout(500);
await ctx.setOffline(true);await page.reload();await page.waitForTimeout(600);console.log("sin conexión abre:",await page.evaluate(()=>document.getElementById("app").innerText.length>20));await ctx.setOffline(false);
// pantallas
await page.evaluate(()=>{st.name="Gael";st.stars=3;save();go("home")});await page.waitForTimeout(250);await page.screenshot({path:process.env.TMPD+"/n_home.png"});
await page.evaluate(()=>{st.theme="light";theme();go("home")});await page.waitForTimeout(150);await page.screenshot({path:process.env.TMPD+"/n_home_l.png",clip:{x:0,y:0,width:390,height:330}});await page.evaluate(()=>{st.theme="dark";theme()});
await page.evaluate(()=>{S.on=false;play(1,2)});await page.waitForTimeout(150);await page.screenshot({path:process.env.TMPD+"/n_game.png",clip:{x:0,y:0,width:390,height:700}});
await page.evaluate(()=>{S.on=false;st.acc="gafas";go("album")});await page.waitForTimeout(150);await page.screenshot({path:process.env.TMPD+"/n_alb1.png",clip:{x:0,y:200,width:390,height:140}});
await page.evaluate(()=>{st.acc="capa";go("album")});await page.waitForTimeout(150);await page.screenshot({path:process.env.TMPD+"/n_alb2.png",clip:{x:0,y:200,width:390,height:140}});
console.log("errores JS:",JSON.stringify(errs));await b.close()})();
