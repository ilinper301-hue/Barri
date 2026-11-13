const { chromium } = require("playwright");
let bad=0;const ok=(c,m)=>{if(!c){bad++;console.log("FALLO",m)}};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,acceptDownloads:true});const page=await ctx.newPage();
page.on("pageerror",e=>{bad++;console.log("ERROR JS",e.message)});page.on("dialog",d=>d.accept());
await page.goto(process.env.APP_URL+"?nosplash");await page.waitForTimeout(300);
const T=()=>page.evaluate(()=>document.body.innerText);
await page.evaluate(()=>{st.name="Ana";st.stars=7;st.solved={"M1-N1-01":3};save();addStu("Luis");st.stars=2;save();swStu("p1");go("home")});
ok(await page.evaluate(()=>st.rol==="doc"),"perfil por defecto: Docente");
await page.click(".hm .av");ok(await page.evaluate(()=>scr==="profiles")&&await page.locator(".pbtn.md").count()===1,"Modo Docente junto a los perfiles");
// --- modo docente
await page.click(".pbtn.md");for(const d of "24682468")await page.click(`[data-g="${d}"]`);
let r=await page.evaluate(()=>({c:st.cur,k:roster().length,n:st.name,pa:st.profs.p1&&st.profs.p1.stars,pb:Object.values(st.profs).map(x=>x.name).sort().join()}));
ok(r.c==="md"&&r.k===2&&r.n==="Docente"&&r.pa===7&&r.pb==="Ana,Luis","entrar en modo docente conserva a los alumnos "+JSON.stringify(r));
ok((await page.locator(".hm .av").innerText()).includes("🎓"),"la inicial pasa a 🎓 en modo docente");ok((await T()).includes("no se guarda progreso")&&(await T()).includes("Mapa de mundos"),"inicio en modo docente");
await page.evaluate(()=>{const p=DATA.problems[0];Game.done({id:p.id,w:p.w,l:p.l,errs:0,hints:0,pst:3,dt:60000})});
ok(await page.evaluate(()=>st.stars===0&&st.log.length===0&&Object.keys(st.solved).length===0),"el modo docente no guarda progreso");
await page.evaluate(()=>go("adv",{}));ok(await page.locator('[data-play$=",4"]').count()===1,"todos los niveles abiertos en el mapa");
await page.evaluate(()=>go("tutor",{tab:"p"}));ok(await page.locator(".seg3 button").count()===2&&await page.evaluate(()=>cx.tab==="u"),"modo docente: Clase · Ajustes");await page.evaluate(()=>go("tutor",{tab:"c"}));ok((await T()).includes("Perfil de uso"),"perfil de uso en Ajustes");
ok(!(await T()).includes("Borrar alumno")&&!(await T()).includes("Reiniciar progreso"),"sin borrar/renombrar en modo docente");
// copia desde modo docente
await page.evaluate(()=>{navigator.canShare=()=>true;navigator.share=async d=>{window.__f=d.files[0]}});
await page.click('[data-act="save"]');await page.waitForTimeout(200);
r=await page.evaluate(async()=>JSON.parse(await window.__f.text()));
ok(r.st.cur!=="md"&&r.st.name&&r.st.profs&&Object.keys(r.st.profs).length===1,"la copia desde modo docente guarda alumnos reales "+r.st.cur);
// recarga en modo docente y salida
await page.reload();await page.waitForTimeout(300);ok(await page.evaluate(()=>st.cur==="md"),"el modo docente persiste al recargar");
await page.click(".hm .av");await page.click('.pbtn:not(.md):has-text("Ana")');
r=await page.evaluate(()=>({n:st.name,s:st.stars,sv:Object.keys(st.solved).length,k:roster().length,c:st.cur}));
ok(r.n==="Ana"&&r.s===7&&r.sv===1&&r.k===2&&r.c==="p1","salir del modo docente restaura al alumno "+JSON.stringify(r));
// --- Familias
await page.evaluate(()=>go("tutor",{tab:"c"}));await page.selectOption("#rol","fam");await page.waitForTimeout(100);
ok(await page.evaluate(()=>st.rol==="fam"),"cambiar a Familias");
await page.evaluate(()=>go("tutor",{tab:"p"}));let t=await T();
ok(!/Competencias|Notas del tutor|Resumen para las familias|Informe imprimible|Exportar datos \(CSV\)/.test(t),"Familias no ve competencias, notas, informe ni CSV");
ok(/Nivel \d+ de \d+/.test(t),"Familias sí ve el progreso");
await page.evaluate(()=>go("tutor",{tab:"a"}));t=await T();ok(/Alumnos/i.test(t)&&!/CSV del aula|Para reforzar en grupo/.test(t)&&/Añadir alumno/i.test(t),"pestaña Alumnos para Familias");
await page.evaluate(()=>go("tutor",{tab:"c"}));t=await T();ok(!/Banco de problemas/i.test(t)&&/Sonido/i.test(t),"Familias sin banco de problemas");
await page.evaluate(()=>go("profiles"));ok(await page.locator(".pbtn.md").count()===0,"Familias sin modo docente");
let bajada=false;page.on("download",()=>bajada=true);await page.evaluate(()=>document.dispatchEvent(new Event("x")));
await page.evaluate(()=>{go("tutor",{tab:"p"});const b=document.createElement("button");b.dataset.act="csv";b.id="zz";document.body.appendChild(b)});await page.click("#zz");await page.waitForTimeout(300);ok(!bajada,"la acción CSV está bloqueada para Familias");
// copia conserva rol; hostil no rompe
await page.evaluate(()=>{navigator.canShare=()=>true;navigator.share=async d=>{window.__f=d.files[0]}});await page.evaluate(()=>shareBk());await page.waitForTimeout(200);
const cp=await page.evaluate(async()=>await window.__f.text());r=JSON.parse(cp);ok(r.st.rol==="fam","la copia guarda el perfil de uso");
await page.evaluate(()=>go("tutor",{tab:"c"}));await page.selectOption("#rol","doc");
await page.setInputFiles("#rf",{name:"c.json",mimeType:"application/json",buffer:Buffer.from(cp)});await page.waitForTimeout(250);ok(await page.evaluate(()=>st.rol==="fam"),"restaurar recupera el perfil de uso");
await page.evaluate(()=>go("profiles"));await page.fill("#nn","Nuevo");await page.click('[data-act="addp2"]');await page.waitForTimeout(100);
ok(await page.evaluate(()=>st.name==="Nuevo"&&scr==="home"&&roster().length===3),"crear perfil desde la pantalla de perfiles");
console.log(bad?("roles.js: "+bad+" fallos"):"roles.js: todo OK");await b.close()})();
