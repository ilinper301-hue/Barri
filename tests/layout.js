const { chromium } = require("playwright");
(async()=>{const b=await chromium.launch();let bad=0,total=0;
for(const w of (process.env.W?[+process.env.W]:[340,360,390,412])){const ctx=await b.newContext({viewport:{width:w,height:780},deviceScaleFactor:1,hasTouch:true,isMobile:true});const page=await ctx.newPage();
await page.goto(process.env.APP_URL+"?nosplash");await page.waitForTimeout(400);
const ids=await page.evaluate(()=>DATA.problems.filter(p=>p.rows.some(r=>r.t!==undefined)).map(p=>p.id));
for(const id of ids){for(const mode of ["edit","lock"]){
 const r=await page.evaluate(([id,mode])=>{S.on=false;const p=DATA.problems.find(x=>x.id===id);startGame([p]);S.step=1;S.fill={};if(mode==="lock"){p.rows.forEach((rw,ri)=>{rw.s.forEach((s,si)=>S.fill[ri+"."+si]=String(typeof s==="object"?s.v:s))});S.step=2}render();
  const rows=[...document.querySelectorAll(".mr")].map(m=>[...m.querySelectorAll(".slot")].map(e=>Math.round(e.getBoundingClientRect().top)));
  const over=document.documentElement.scrollWidth>innerWidth;return{wrap:rows.some(t=>t.length&&Math.max(...t)-Math.min(...t)>3),over}},[id,mode]);
 total++;if(r.wrap||r.over){bad++;console.log("FALLO",w,id,mode,JSON.stringify(r))}}}
await ctx.close()}
console.log("filas comprobadas:",total,"con salto de línea o desbordamiento:",bad);await b.close()})();
