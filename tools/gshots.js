// Capturas y medidas de la pantalla de juego: node tools/gshots.js <carpeta> [anchoxalto ...]  (APP_URL, NODE_PATH)
const { chromium } = require("playwright");const fs=require("fs");const out=process.argv[2];fs.mkdirSync(out,{recursive:true});
const SZ=(process.argv.slice(3).length?process.argv.slice(3):["390x844","844x390","960x540","1180x820"]).map(s=>s.split("x").map(Number));
(async()=>{const b=await chromium.launch();const rows=[];
for(const [w,h] of SZ)for(const cs of ["light"]){
 const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:true,colorScheme:cs,reducedMotion:"reduce"});const page=await ctx.newPage();
 page.on("pageerror",e=>console.log("ERROR JS",e.message));
 await page.goto(process.env.APP_URL+"?nosplash");await page.waitForTimeout(300);
 const ids=await page.evaluate(()=>{const f=(w,l,c)=>(DATA.problems.find(p=>p.w===w&&p.l===l&&(!c||c(p)))||{}).id;
  return [f(1,2),f(3,2),f(6,2)||f(5,2),f(7,2)].filter(Boolean)});
 for(const id of ids)for(const step of [0,1,2,3]){
  await page.evaluate(([id,step])=>{S.on=false;const p=DATA.problems.find(x=>x.id===id);startGame([p]);if(S.cp)S.cp=false;if(step)S.step=step;if(S.mc)S.mc=0;S.uq=0;S.ck=0;render()},[id,step]);await page.waitForTimeout(120);
  const r=await page.evaluate(()=>{const R=e=>e?e.getBoundingClientRect():null;const bub=R(document.querySelector(".bub")),mdl=R(document.querySelector(".card .mr,.card .mdl,.card .vb2")),sp=R(document.querySelector(".spad"));
   const bars=[...document.querySelectorAll(".mr")].map(e=>e.getBoundingClientRect().width);const card=document.querySelector(".gr2>.card,#app>.card:not(.tx)");
   return {oy:document.documentElement.scrollHeight-innerHeight,bub:bub&&[Math.round(bub.left),Math.round(bub.top),Math.round(bub.bottom)],bubVis:bub?bub.bottom<=innerHeight&&bub.top>=0:null,barW:bars.length?Math.round(Math.max(...bars)):0,cardW:card?Math.round(card.getBoundingClientRect().width):0,pad:sp&&Math.round(sp.height)}});
  rows.push([w+"x"+h,id,step,JSON.stringify(r)].join(" | "));
  await page.screenshot({path:`${out}/${w}x${h}-${id}-${step}.png`})}
 await ctx.close()}
rows.forEach(x=>console.log(x));await b.close()})();
