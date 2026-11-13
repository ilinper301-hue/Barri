const { chromium } = require("playwright");
(async()=>{
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:780},deviceScaleFactor:2,hasTouch:true,isMobile:true});
const page=await ctx.newPage();const errs=[];page.on("pageerror",e=>errs.push(e.message));
await page.goto(process.env.APP_URL+"?nosplash");await page.waitForTimeout(400);
const cdp=await ctx.newCDPSession(page);
const touch=(type,x,y,id=1)=>cdp.send("Input.dispatchTouchEvent",{type,touchPoints:type==="touchEnd"||type==="touchCancel"?[]:[{x,y,id}]});
const sleep=ms=>page.waitForTimeout(ms);
const pos=(sel,i=0)=>page.evaluate(([s,i])=>{const e=document.querySelectorAll(s)[i];if(!e)return null;const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}},[sel,i]);
const tap=async(p,j=0)=>{await touch("touchStart",p.x,p.y);if(j){await touch("touchMove",p.x+j,p.y+j*.5);await sleep(16)}await sleep(40);await touch("touchEnd");await sleep(120)};
const S_=()=>page.evaluate(()=>JSON.stringify({fill:S.fill,sel:S.sel,sh:S.sh}));
await page.evaluate(()=>play(2,2));await sleep(150);
const bg=await page.evaluate(()=>{const e=document.querySelector('[data-a="go1"]');return getComputedStyle(e).backgroundColor});console.log("1) fondo del boton 'Ya lo lei':",bg);
await page.screenshot({path:process.env.TMPD+"/b1.png"});
await tap(await pos('[data-a="go1"]'));await page.evaluate(()=>{if(S.cp){S.cp=false;render()}if(S.mc)pick(kindOf(P[S.i]))});
// 2) toque con temblor (8 px) sobre ficha
await tap(await pos(".chip"),8);console.log("2) ficha con temblor 8px -> sel:",await page.evaluate(()=>S.sel));
await tap(await pos(".slot[data-s]"),8);console.log("   hueco con temblor -> fill:",await page.evaluate(()=>JSON.stringify(S.fill)));
// 3) pointercancel a mitad de arrastre
let c=await pos(".chip",1),s=await pos(".slot[data-s]",1);
await touch("touchStart",c.x,c.y);for(let i=1;i<=6;i++){await touch("touchMove",c.x+(s.x-c.x)*i/6,c.y+(s.y-c.y)*i/6);await sleep(16)}await touch("touchCancel");await sleep(150);
console.log("3) cancelado sobre hueco -> fill:",await page.evaluate(()=>JSON.stringify(S.fill)),"| dr:",await page.evaluate(()=>dr===null));
// 4) rafaga de toques rapidos: ficha-hueco x 12 sin esperas largas
let ok=0;for(let i=0;i<12;i++){const ci=i%3,si=i%2;const cp=await pos(".chip",ci);await touch("touchStart",cp.x,cp.y);await touch("touchEnd");const sp=await pos(".slot[data-s]",si);await touch("touchStart",sp.x,sp.y);await touch("touchEnd");await sleep(30);ok++}
console.log("4) rafaga:",await page.evaluate(()=>JSON.stringify(S.fill)),"| sigue vivo:",await page.evaluate(()=>S.on&&!!document.querySelector('[data-a="exit"]')));
// 5) dos dedos a la vez
const a=await pos(".chip",0),z=await pos(".slot[data-s]",0);
await cdp.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x:a.x,y:a.y,id:1},{x:200,y:300,id:2}]});await sleep(40);
await cdp.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x:z.x,y:z.y,id:1},{x:210,y:310,id:2}]});await sleep(40);
await cdp.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});await sleep(150);
console.log("5) dos dedos -> vivo:",await page.evaluate(()=>S.on&&dr===null));
// 6) tras todo, una colocacion limpia sigue funcionando
await page.evaluate(()=>{S.fill={};S.sel=null;render()});await sleep(60);
const c2=await pos(".chip",0),s2=await pos(".slot[data-s]",0);await tap(c2);await tap(s2);console.log("6) colocacion limpia:",await page.evaluate(()=>JSON.stringify(S.fill)));
console.log("errores JS:",JSON.stringify(errs));
// fracciones
await page.evaluate(()=>{S.on=false;play(3,1)});await sleep(150);await tap(await pos('[data-a="go1"]'));await page.evaluate(()=>{if(S.cp){S.cp=false;render()}if(S.mc)pick(kindOf(P[S.i]))});await sleep(100);
await page.screenshot({path:process.env.TMPD+"/f1.png"});
await page.evaluate(()=>{S.on=false;play(3,2)});await sleep(150);await tap(await pos('[data-a="go1"]'));await page.evaluate(()=>{if(S.cp){S.cp=false;render()}if(S.mc)pick(kindOf(P[S.i]))});await sleep(100);
const cells=await page.evaluate(()=>document.querySelectorAll(".cell[data-c]").length);const cl=await pos(".cell[data-c]",1);await tap(cl);await sleep(100);
await page.screenshot({path:process.env.TMPD+"/f2.png"});console.log("celdas",cells,"sombreadas tras tocar la 2a:",await page.evaluate(()=>Object.keys(S.sh).length));
await b.close()})();
