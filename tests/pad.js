const {chromium}=require("playwright");let bad=0;const ok=(c,m)=>{if(!c){bad++;console.log("FALLO",m)}};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1180,height:820},hasTouch:true});p.on("pageerror",e=>{bad++;console.log("ERR",e.message)});
await p.goto(process.env.APP_URL+"?nosplash");await p.waitForTimeout(300);
await p.evaluate(()=>{S.on=false;startGame([DATA.problems.find(x=>x.id==="M1-N2-01")]);S.step=1;render()});await p.waitForTimeout(100);
ok(await p.locator(".gl .spad canvas").count()===1,"pizarra visible en tablet");
const r=await p.locator(".spad canvas").boundingBox();ok(r&&r.height>=140,"alto pizarra "+JSON.stringify(r));
await p.mouse.move(r.x+30,r.y+30);await p.mouse.down();for(let i=1;i<10;i++)await p.mouse.move(r.x+30+i*15,r.y+30+i*8);await p.mouse.up();
ok(await p.evaluate(()=>S.pd.length===1&&S.pd[0].p.length>5),"trazo guardado");
const px=async()=>p.evaluate(()=>{const c=document.querySelector(".spad canvas"),d=c.getContext("2d").getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i])n++;return n});
ok(await px()>50,"hay píxeles pintados");
await p.evaluate(()=>render());ok(await px()>50,"el trazo sobrevive a render()");
ok(await p.evaluate(()=>S.step===1&&Object.keys(S.fill).length===0),"pintar no toca el juego");
await p.click('[data-pd="u"]');ok(await p.evaluate(()=>S.pd.length===0)&&await px()===0,"deshacer trazo");
await p.mouse.move(r.x+50,r.y+50);await p.mouse.down();await p.mouse.move(r.x+90,r.y+70);await p.mouse.up();await p.click('[data-pd="x"]');ok(await p.evaluate(()=>S.pd.length===0),"borrar pizarra");
await p.click('[data-pd="1"]');ok(await p.locator('[data-pd="1"].on').count()===1,"elegir color");
// arrastre de ficha sigue funcionando
const chip=p.locator(".tray .chip").first(),v=await chip.getAttribute("data-v"),sl=p.locator('.slot[data-s^="m:"]').first();const a=await chip.boundingBox(),z=await sl.boundingBox();
await p.mouse.move(a.x+a.width/2,a.y+a.height/2);await p.mouse.down();await p.mouse.move(z.x+z.width/2,z.y+z.height/2,{steps:8});await p.mouse.up();await p.waitForTimeout(100);
ok(await p.evaluate(()=>Object.keys(S.fill).length===1),"arrastrar ficha con pizarra presente");
await p.evaluate(()=>{startGame([DATA.problems[5]])});ok(await p.evaluate(()=>S.pd.length===0),"problema nuevo: pizarra limpia");
await p.screenshot({path:(process.env.TMPD||"/tmp")+"/pad.png"});
await p.setViewportSize({width:390,height:780});await p.waitForTimeout(200);ok(await p.locator(".spad").count()===0,"sin pizarra en móvil");
console.log(bad?"pad.js: "+bad+" fallos":"pad.js: todo OK");await b.close()})()
