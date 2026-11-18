// Capturas para comparar diseño: node tools/shots.js <carpeta>  (necesita APP_URL y NODE_PATH)
const { chromium } = require("playwright");const fs=require("fs");const out=process.argv[2];fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch();
for(const [w,h,tn] of [[390,844,"m"],[1180,820,"t"]])for(const cs of ["light","dark"]){
 const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:w<700,colorScheme:cs,reducedMotion:"reduce"});const page=await ctx.newPage();
 await page.goto(process.env.APP_URL+"?nosplash");await page.waitForTimeout(400);
 await page.evaluate(()=>{st.name="Gael";st.stars=70;save();go("home")});
 const shot=async n=>{await page.waitForTimeout(250);await page.screenshot({path:`${out}/${tn}-${cs}-${n}.png`})};
 for(const s of ["home","adv","learn","album"]){await page.evaluate(s=>{S.on=false;go(s)},s);await shot(s)}
 for(const [ww,l] of [[1,1],[3,2],[2,3]]){await page.evaluate(([a,c])=>{S.on=false;play(a,c)},[ww,l]);await shot(`g${ww}${l}a`);
  await page.evaluate(()=>{const e=document.querySelector('[data-a="go1"]');if(e)e.click()});await page.evaluate(()=>{if(S.cp){S.cp=false;render()}if(S.mc)pick(kindOf(P[S.i]))});await shot(`g${ww}${l}b`)}
 await page.evaluate(()=>{UNL=Date.now();go("tutor")});await shot("tutor");await ctx.close()}
await b.close()})();
