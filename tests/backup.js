const { chromium } = require("playwright");
let bad=0;const ok=(c,m)=>{if(!c){bad++;console.log("FALLO",m)}};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,acceptDownloads:true});const page=await ctx.newPage();
page.on("pageerror",e=>{bad++;console.log("ERROR JS",e.message)});page.on("dialog",d=>d.accept());
await page.goto(process.env.APP_URL+"?nosplash");await page.waitForTimeout(300);
await page.evaluate(()=>{st.name="Ana";st.stars=7;st.solved={"M1-N1-01":3};st.notes="Va bien, usa 'barras'";save();addStu("Luis");st.stars=2;save();go("tutor",{tab:"p"})});
ok(await page.locator(".bk").count()===1,"aviso de copia pendiente visible con progreso y sin copia");
// compartir
await page.evaluate(()=>{navigator.canShare=()=>true;navigator.share=async d=>{window.__f=d.files[0]}});
await page.click('.bk [data-act="save"]');await page.waitForTimeout(200);
let r=await page.evaluate(async()=>({t:window.__f?await window.__f.text():null,n:window.__f&&window.__f.name,a:bkAge()}));
const j=JSON.parse(r.t);ok(j.v===2&&j.st.name==="Luis"&&j.st.profs.p1.name==="Ana"&&/^barri-copia-\d{4}-\d\d-\d\d\.json$/.test(r.n)&&r.a===0,"copia compartida con ambos alumnos "+r.n);
ok(await page.locator(".bk").count()===0,"el aviso desaparece tras guardar");
ok((await page.locator("body").innerText()).includes("Copia enviada"),"mensaje de copia enviada");
// cancelar
await page.evaluate(()=>{localStorage.removeItem("barri.bk");navigator.share=async()=>{const e=new Error("x");e.name="AbortError";throw e}});
await page.evaluate(()=>show());await page.click('.bk [data-act="save"]');await page.waitForTimeout(150);
ok(await page.evaluate(()=>bkAge()===null),"cancelar no anota copia");
// sin compartir: descarga
await page.evaluate(()=>{navigator.share=undefined});
const [dl]=await Promise.all([page.waitForEvent("download"),page.click('.bk [data-act="save"]')]);
ok(/barri-copia-/.test(dl.suggestedFilename())&&await page.evaluate(()=>bkAge()===0),"sin menú de compartir: descarga y anota");
const good=require("fs").readFileSync(await dl.path(),"utf8");
// restaurar copia válida (ida y vuelta)
await page.evaluate(()=>{addStu("Extra");save();go("tutor",{tab:"s"})});
await page.setInputFiles("#rf",{name:"c.json",mimeType:"application/json",buffer:Buffer.from(good)});await page.waitForTimeout(250);
r=await page.evaluate(()=>({k:roster().map(x=>x[1].name).join(","),s:Object.fromEntries(roster().map(x=>[x[1].name,x[1].stars])),n:roster().find(x=>x[1].name==="Ana")[1].notes}));
ok(r.k==="Ana,Luis"&&r.s.Ana===7&&r.s.Luis===2&&r.n==="Va bien, usa 'barras'","restaurar ida y vuelta "+JSON.stringify(r));
// formato antiguo (st plano)
await page.evaluate(()=>go("tutor",{tab:"s"}));
await page.setInputFiles("#rf",{name:"v.json",mimeType:"application/json",buffer:Buffer.from(JSON.stringify({name:"Vieja",stars:3,solved:{"M1-N1-01":2},log:[],days:["2026-10-01"],theme:"dark"}))});await page.waitForTimeout(250);
r=await page.evaluate(()=>({n:st.name,s:st.stars,c:st.cur,t:st.theme}));ok(r.n==="Vieja"&&r.s===3&&r.c==="p1"&&r.t==="dark","importar copia antigua "+JSON.stringify(r));
// copia hostil
const evil={v:2,st:{name:"<img src=x onerror=window.__x=1>"+"A".repeat(100),stars:-5,solved:[1,2],log:[{id:"M1",w:1,errs:2,x:{a:1},__proto__:{z:1}},"basura",null],days:["no","2026-10-02"],acc:"hack",notes:"n".repeat(5000),theme:"rosa",set:{dur:"abc",voice:{}},bank:[{id:1}],cur:"../x",profs:{"p9":{name:"B",stars:"9e99"},"__proto__":{name:"X"},"bad key":{name:"Y"}}}};
await page.evaluate(()=>go("tutor",{tab:"s"}));
await page.setInputFiles("#rf",{name:"e.json",mimeType:"application/json",buffer:Buffer.from(JSON.stringify(evil))});await page.waitForTimeout(250);
r=await page.evaluate(()=>({n:st.name.length,s:st.stars,sv:Object.keys(st.solved).length,lg:st.log.length,lk:Object.keys(st.log[0]||{}).sort().join(),d:st.days.join(),acc:st.acc,nt:st.notes.length,th:st.theme,set:JSON.stringify(st.set),bank:st.bank,cur:st.cur,pk:Object.keys(st.profs).join(),ps:st.profs.p9&&st.profs.p9.stars,x:!!window.__x}));
ok(r.n===30&&r.s===0&&r.sv===0&&r.lg===1&&r.lk==="errs,id,w"&&r.d==="2026-10-02"&&r.acc==="casco"&&r.nt===600&&r.th===null&&r.set==='{"dur":15,"voice":"","snd":true}'&&r.bank===null&&r.cur==="p1"&&r.pk==="p9"&&r.ps===1000000000&&!r.x,"copia hostil saneada "+JSON.stringify(r));
await page.evaluate(()=>{go("tutor",{tab:"a"})});await page.waitForTimeout(150);ok(!(await page.evaluate(()=>!!window.__x)),"sin XSS al mostrar aula");
// archivo no válido
await page.evaluate(()=>go("tutor",{tab:"s"}));let alerta="";page.removeAllListeners("dialog");page.on("dialog",d=>{alerta=d.message();d.accept()});
await page.setInputFiles("#rf",{name:"m.json",mimeType:"application/json",buffer:Buffer.from("[1,2]")});await page.waitForTimeout(200);ok(/no válido/.test(alerta)&&await page.evaluate(()=>st.name.length===30),"archivo no válido rechazado sin perder datos");
console.log(bad?("backup.js: "+bad+" fallos"):"backup.js: todo OK");await b.close()})();
