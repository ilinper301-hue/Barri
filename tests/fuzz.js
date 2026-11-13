const { chromium } = require("playwright");
(async()=>{
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:780},deviceScaleFactor:2,hasTouch:true,isMobile:true});
const page=await ctx.newPage();const errs=[];page.on("pageerror",e=>errs.push(e.message));
await page.goto(process.env.APP_URL+"?nosplash");await page.waitForTimeout(400);
const cdp=await ctx.newCDPSession(page);
const touch=(type,x,y)=>cdp.send("Input.dispatchTouchEvent",{type,touchPoints:type==="touchEnd"?[]:[{x,y,id:1}]});
const tap=async p=>{await touch("touchStart",p.x,p.y);await page.waitForTimeout(40);await touch("touchEnd");await page.waitForTimeout(120)};
const drag=async(a,c,steps=8)=>{await touch("touchStart",a.x,a.y);for(let i=1;i<=steps;i++){await touch("touchMove",a.x+(c.x-a.x)*i/steps,a.y+(c.y-a.y)*i/steps);await page.waitForTimeout(16)}await touch("touchEnd");await page.waitForTimeout(150)};
const P=(sel,i)=>page.evaluate(([s,i])=>{const e=document.querySelectorAll(s)[i];if(!e)return null;const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2,ok:r.y>40&&r.bottom<innerHeight-40}},[sel,i]);
const cnt=sel=>page.evaluate(s=>document.querySelectorAll(s).length,sel);
const fill=()=>page.evaluate(()=>JSON.stringify([S.fill,S.sh,S.db,S.nd]));
const R=(n)=>Math.floor(Math.random()*n);
let fails=0,total=0;
for(const [w,l] of [[1,1],[1,2],[2,2],[3,2],[2,3],[4,2],[1,4],[2,4],[3,4]]){
 await page.evaluate(([w,l])=>{S.on=false;play(w,l)},[w,l]);await page.waitForTimeout(150);
 const g=await P('[data-a="go1"]',0);if(g)await tap(g);
 let log=[];
 for(let n=0;n<40;n++){
  const nc=await cnt(".chip:not(.ghost)"),ns=await cnt(".slot[data-s]"),ncell=await cnt(".cell[data-c]"),nadd=await cnt('[data-d="add"]');
  const op=R(8);const before=await fill();let name="",expectChange=false;
  try{
  if(op===0&&nc&&ns){const c=await P(".chip:not(.ghost)",R(nc)),s=await P(".slot[data-s]",R(ns));if(c&&s&&c.ok&&s.ok){name="arrastrar chip->hueco";await drag(c,s);expectChange=null}}
  else if(op===1&&nc&&ns){const ci=R(nc),si=R(ns);const c=await P(".chip:not(.ghost)",ci);if(c&&c.ok){await tap(c);const s=await P(".slot[data-s]",si);if(s&&s.ok){name="tocar chip y hueco";await tap(s);expectChange=null}}}
  else if(op===2&&ns){const si=R(ns);const s=await P(".slot[data-s]",si);if(s&&s.ok){name="tocar hueco";await tap(s);expectChange=null}}
  else if(op===3&&ns){const s=await P(".slot[data-s]",R(ns));if(s&&s.ok){name="sacar bloque arrastrando";await drag(s,{x:20,y:s.y+60})}}
  else if(op===4&&ncell){const c=await P(".cell[data-c]",R(ncell));if(c&&c.ok){name="sombrear parte";await tap(c)}}
  else if(op===5&&nadd){const a=await P('[data-d="add"]',R(nadd));if(a&&a.ok){name="añadir bloque";await tap(a);expectChange=true}}
  else if(op===6){const d=await P('[data-d="del"]',0);if(d&&d.ok){name="quitar bloque";await tap(d)}}
  else if(op===7){const z=await cnt(".rz");if(z){const r=await P(".rz",R(z));if(r&&r.ok){name="estirar bloque";await drag(r,{x:r.x+40+R(40),y:r.y})}}}
  }catch(e){log.push("EXC "+e.message)}
  if(!name)continue;total++;
  // comprobación de vida: el juego sigue respondiendo
  const alive=await page.evaluate(()=>({on:S.on,game:!!document.querySelector('[data-a="exit"]')}));
  const after=await fill();
  if(!alive.on||!alive.game){fails++;log.push("MUERTO tras "+name)}
  if(expectChange===true&&before===after){fails++;log.push("SIN CAMBIO: "+name+" ("+w+","+l+")")}
 }
 // prueba final: ¿responde todo aún? tocar Pista
 const hint=await P('[data-a="hint"]',0);if(hint){await tap(hint);}
 const msg=await page.evaluate(()=>S.msg);
 console.log("mundo",w,"nivel",l,"->",log.length?log.join("; "):"ok","| msg:",msg.slice(0,40));
}
console.log("operaciones",total,"fallos",fails,"errores JS",JSON.stringify(errs.slice(0,3)));
await b.close()})();
