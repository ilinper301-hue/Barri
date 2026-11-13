const { chromium } = require("playwright");const {execSync}=require("child_process");
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:700},deviceScaleFactor:1,hasTouch:true,isMobile:true});await ctx.addInitScript(()=>{try{localStorage.setItem('barri.wel','1')}catch(e){}});const page=await ctx.newPage();const errs=[];page.on("pageerror",e=>errs.push(e.message));
const t0=Date.now();await page.goto(process.env.APP_URL);
const times=[250,900,1500,2100,2800,3500,4300];let i=0;
for(const t of times){const w=t-(Date.now()-t0);if(w>0)await page.waitForTimeout(w);await page.screenshot({path:`${process.env.TMPD}/sp${i++}.png`})}
console.log("splash presente al final:",await page.evaluate(()=>!!document.getElementById("splash")),"| clases #app:",await page.evaluate(()=>document.getElementById("app").className));
console.log("home interactiva:",await page.evaluate(()=>{const e=document.querySelector('.hm [data-go="learn"]');const r=e.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('[data-go="learn"]')!==null}));
// saltar con toque
const p2=await ctx.newPage();await p2.goto(process.env.APP_URL);await p2.waitForTimeout(600);await p2.touchscreen.tap(190,350);await p2.waitForTimeout(800);console.log("tras tocar: splash",await p2.evaluate(()=>!!document.getElementById("splash")));
// sin animación por parámetro
const p3=await ctx.newPage();await p3.goto(process.env.APP_URL+"?nosplash");await p3.waitForTimeout(300);console.log("?nosplash: splash",await p3.evaluate(()=>!!document.getElementById("splash")));
// movimiento reducido
const c2=await b.newContext({viewport:{width:390,height:700},reducedMotion:"reduce"});await c2.addInitScript(()=>{try{localStorage.setItem('barri.wel','1')}catch(e){}});const p4=await c2.newPage();await p4.goto(process.env.APP_URL);await p4.waitForTimeout(1800);console.log("movimiento reducido: splash",await p4.evaluate(()=>!!document.getElementById("splash")));
console.log("errores JS:",JSON.stringify(errs));await b.close()})();
