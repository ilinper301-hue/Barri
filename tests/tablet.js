const { chromium } = require("playwright");
const SHOT=process.env.SHOT_DIR||"";
(async()=>{const b=await chromium.launch();let bad=0,tot=0;const rep=[];
for(const [w,h] of [[1024,768],[1180,820],[1280,800],[960,540],[844,390]]){
 const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:true,deviceScaleFactor:1});const page=await ctx.newPage();page.on("pageerror",e=>{bad++;console.log("ERROR JS",e.message)});
 await page.goto(process.env.APP_URL+"?nosplash");await page.waitForTimeout(300);
 const chk=async(tag)=>{const r=await page.evaluate(()=>({ox:document.documentElement.scrollWidth>innerWidth+1,oy:document.documentElement.scrollHeight-innerHeight,wrap:[...document.querySelectorAll(".mr")].some(m=>{const t=[...m.querySelectorAll(".slot")].map(e=>Math.round(e.getBoundingClientRect().top));return t.length&&Math.max(...t)-Math.min(...t)>3})}));tot++;if(r.ox||r.wrap){bad++;console.log("FALLO",w+"x"+h,tag,JSON.stringify(r))}return r};
 let r=await chk("home");rep.push([w+"x"+h,"home","oy="+r.oy]);
 if(SHOT&&w===1180)await page.screenshot({path:SHOT+"/home.png"});
 const ids=await page.evaluate(()=>[1,2,3,4].map(w=>DATA.problems.find(p=>p.w===w&&p.l===2).id));
 let maxoy=0;
 for(const id of ids){for(const step of [1,2,3]){
  await page.evaluate(([id,step])=>{S.on=false;const p=DATA.problems.find(x=>x.id===id);startGame([p]);S.step=step;render()},[id,step]);await page.waitForTimeout(60);
  r=await chk(id+" paso "+step);maxoy=Math.max(maxoy,r.oy);
  const two=await page.evaluate(()=>document.getElementById("app").dataset.cols);
  if(step>1&&two!=="2"){bad++;console.log("FALLO sin 2 columnas",w,id,step,two)}
  if(SHOT&&w===1180&&step===1&&(id.startsWith("M1")||id.startsWith("M3")))await page.screenshot({path:SHOT+"/game_"+id+"_"+step+".png"});
  if(SHOT&&w===1180&&step===3&&id.startsWith("M2"))await page.screenshot({path:SHOT+"/game_"+id+"_3.png"});
 }}
 rep.push([w+"x"+h,"juego","desborde vertical máx="+maxoy+"px"]);
 await page.evaluate(()=>{S.on=false;go("tutor",{tab:"p"})});await page.waitForTimeout(100);r=await chk("tutor");
 if(SHOT&&w===1180)await page.screenshot({path:SHOT+"/tutor.png"});
 await page.evaluate(()=>{addStu("Luis");go("tutor",{tab:"a"})});await page.waitForTimeout(100);await chk("aula");
 if(SHOT&&w===1180)await page.screenshot({path:SHOT+"/aula.png"});
 for(const s of ["adv","album","learn","profiles"]){await page.evaluate(s=>go(s),s);await page.waitForTimeout(80);await chk(s);if(SHOT&&w===1180)await page.screenshot({path:SHOT+"/"+s+".png"})}
 await ctx.close()}
rep.forEach(x=>console.log(x.join(" | ")));console.log("comprobaciones:",tot,"fallos:",bad);await b.close()})();
