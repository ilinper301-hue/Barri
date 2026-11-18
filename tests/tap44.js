// v1.29 Fase 2: todos los controles táctiles visibles miden >=44 px (y mínimo de foco visible / aria-live)
const { chromium } = require("playwright");
const SEL='button,a[href],select,input,textarea,[role=button],[data-a],[data-go],[data-act],[data-g],.chip,.slot,.cell';
(async()=>{
const b=await chromium.launch();let bad=0;const errs=[];
for(const [w,h] of [[390,844],[1180,820]]){
 const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:w<700});
 const page=await ctx.newPage();page.on("pageerror",e=>errs.push(e.message));
 await page.goto(process.env.APP_URL+"?nosplash");await page.waitForTimeout(400);
 await page.evaluate(()=>{st.name="Gael";st.stars=70;save();go("home")});
 const audit=async(name)=>{await page.waitForTimeout(150);
  const r=await page.evaluate(SEL=>{const out=[];document.querySelectorAll(SEL).forEach(e=>{const cs=getComputedStyle(e);if(cs.visibility==="hidden"||cs.display==="none"||e.type==="hidden")return;const r=e.getBoundingClientRect();if(r.width<2||r.height<2)return;if(e.closest("[hidden],.pwk"))return;
   if(r.height<43.5||r.width<43.5)out.push((e.tagName+"."+(e.className||"").toString().split(" ")[0]+(e.dataset.a?"[a="+e.dataset.a+"]":e.dataset.go?"[go="+e.dataset.go+"]":""))+" "+Math.round(r.width)+"x"+Math.round(r.height))});return out},SEL);
  const u=[...new Set(r)];bad+=u.length;console.log(w+"px "+name+": "+(u.length?u.join(" | "):"ok"))};
 for(const s of ["home","learn","adv","album","profiles"]){await page.evaluate(s=>{S.on=false;go(s)},s);await audit(s)}
 await page.evaluate(()=>{UNL=Date.now();go("tutor")});await audit("tutor");
 for(const [ww,l] of [[1,1],[1,2],[1,3],[1,4],[3,2],[4,3],[7,2]]){
  await page.evaluate(([ww,l])=>{S.on=false;play(ww,l)},[ww,l]);await audit("juego "+ww+"-"+l+" leer");
  for(let k=0;k<3;k++){await page.evaluate(()=>{const e=document.querySelector('[data-a="go1"]');if(e)e.click()});await page.evaluate(()=>{if(S.cp){S.cp=false;render()}if(S.mc)pick(kindOf(P[S.i]))});await audit("juego "+ww+"-"+l+" paso "+(k+2));break}
 }
 // lectores de pantalla y foco
 await page.evaluate(()=>{S.on=false;play(1,1)});await page.waitForTimeout(150);
 const live=await page.evaluate(()=>!!document.querySelector('[aria-live]'));console.log(w+"px aria-live en el juego:",live);if(!live)bad++;
 const foc=await page.evaluate(()=>{const s=[...document.styleSheets].flatMap(x=>[...x.cssRules]).some(r=>r.selectorText&&r.selectorText.includes(":focus-visible"));return s});console.log(w+"px :focus-visible definido:",foc);if(!foc)bad++;
 await ctx.close()}
console.log("errores JS:",JSON.stringify(errs));console.log(bad?"FALLA: "+bad:"OK");await b.close();process.exit(bad||errs.length?1:0)})();
