const { chromium } = require("playwright");
const SHOT=process.env.SHOT_DIR||"";let bad=0;
(async()=>{const b=await chromium.launch();
for(const [w,h] of (process.env.VP?JSON.parse(process.env.VP):[[1024,768],[1180,820],[1280,800],[1366,1024],[390,780]])){
 const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:true,deviceScaleFactor:1});const page=await ctx.newPage();page.on("pageerror",e=>{bad++;console.log("ERROR JS",e.message)});
 await page.goto(process.env.APP_URL+"?nosplash");await page.waitForTimeout(250);
 const land=w>=700,rows=[];const multi=id=>false;
 const ids=await page.evaluate(()=>[...[1,2,3,4].map(w=>(DATA.problems.find(p=>p.w===w&&p.l===2)||DATA.problems.find(p=>p.w===w)).id),...[...new Set(DATA.problems.map(p=>p.n))].filter(n=>n>3).map(n=>DATA.problems.find(p=>p.n===n).id)]);
 for(const id of ids)for(const step of [0,1,2,3]){
  await page.evaluate(([id,step])=>{S.on=false;const p=DATA.problems.find(x=>x.id===id);startGame([p]);S.step=step;if(step===3){S.rv=[P[0].ans];S.ln=0}render()},[id,step]);await page.waitForTimeout(40);
  const m=await page.evaluate(()=>{const ch=[...document.querySelectorAll("#app > *, #app .gl > *, #app .gr2 > *")].filter(e=>e.offsetHeight);const bot=Math.max(...ch.map(e=>e.getBoundingClientRect().bottom));
   const sl=[...document.querySelectorAll(".slot[data-s]:not(.exs.l4 .slot)")].map(e=>e.getBoundingClientRect().height);
   return{n:P[0].n,bot:Math.round(bot),vh:innerHeight,doc:document.documentElement.scrollHeight,ox:document.documentElement.scrollWidth>innerWidth+1,sl:sl.length?Math.min(...sl):0}});
  rows.push([id,step,m]);
  if(land&&m.bot<m.vh*0.8){bad++;console.log("VACÍO",w+"x"+h,id,"paso",step,"contenido llega a",m.bot,"de",m.vh)}
  if(m.ox){bad++;console.log("DESBORDE X",w,id,step)}
  if((land||m.n<=3)&&m.doc>m.vh+2){bad++;console.log("SCROLL V tablet",w+"x"+h,id,"paso",step,m.doc,">",m.vh)}
  if(m.sl&&m.sl<(land?(m.vh<=830?56:64):40)){bad++;console.log("SLOT PEQUEÑO",w,id,step,m.sl)}
  if(SHOT&&w===1180&&id===ids[0])await page.screenshot({path:`${SHOT}/f_${step}.png`});
 }
 const mx=Math.max(...rows.map(r=>r[2].doc-r[2].vh));console.log(w+"x"+h,"máx. desplazamiento vertical:",mx,"px");
 await ctx.close()}
console.log(bad?"fill.js: "+bad+" fallos":"fill.js: todo OK");await b.close()})();
