// v1.19/v1.20: Zona del tutor en listas · Progreso · Alumno · Ajustes (como Lectori 3.24/3.25)
const { chromium } = require("playwright");
let bad=0;const ok=(c,m)=>{if(!c){bad++;console.log("FALLO",m)}};
(async()=>{const b=await chromium.launch();
for(const [W,H] of [[390,800],[1180,820]]){const p=await b.newPage({viewport:{width:W,height:H}});p.on("pageerror",e=>{bad++;console.log("ERROR JS",e.message)});p.on("dialog",d=>{bad++;console.log("DIÁLOGO inesperado",d.message());d.dismiss()});
await p.goto(process.env.APP_URL+"?nosplash");await p.waitForTimeout(300);const tag=" ["+W+"]",T=()=>p.locator(".tz").innerText();
await p.evaluate(()=>{st.name="Ana";st.pin="1234";UNL=Date.now();save();go("tutor",{tab:"p"})});
// cabecera y pestañas
ok(await p.locator(".tz .seg3 button").count()===3&&/Progreso[\s\S]*Alumno[\s\S]*Ajustes/.test(await p.locator(".seg3").innerText()),"tres pestañas: Progreso · Alumno · Ajustes"+tag);
ok(await p.locator('.tz [data-go="home"]').count()===1&&await p.locator(".tz .ih").count()===0,"un solo botón ✕ y sin «← Inicio»"+tag);
ok(await p.locator('.tzh [data-go="profiles"]').count()===0,"sin «Cambiar de alumno» con un solo alumno"+tag);
let t=await T();ok(/Nivel 1 de \d+/.test(t)&&!/Le cuesta/.test(t)&&!/INDICADORES|Indicadores/i.test(t)&&/PARA REFORZAR|Para reforzar/.test(t),"sin datos: sin «Le cuesta» ni indicadores"+tag);
ok(await p.locator(".pst>div").count()===4&&await p.locator(".pwk>div").count()===7,"4 cifras y semana"+tag);
// con datos: orden Para reforzar → Diagnóstico → Seguimiento → Indicadores
await p.evaluate(()=>{const now=Date.now();DATA.problems.filter(q=>q.w===1).slice(0,12).forEach((q,i)=>{st.solved[q.id]=2;st.log.push({ts:now-i*6e5,id:q.id,w:1,l:q.l,errs:i%2?0:2,hints:0,dt:60000,mis:"tp*1"})});save();show()});
const HS=await p.evaluate(()=>[...document.querySelectorAll(".pg-2 .lh")].map(e=>e.textContent));ok(HS.join("|")==="Para reforzar|Diagnóstico|Seguimiento|Indicadores","orden de secciones "+HS.join("|")+tag);
ok(await p.evaluate(()=>{const a=document.querySelector(".pal.palr"),r=document.querySelector('[data-rev]');return a&&r&&a.nextElementSibling&&a.nextElementSibling.contains(r)}),"«Le cuesta» y justo debajo repasar"+tag);
// subpantallas con «← Zona del tutor»
await p.click('[data-sub="notes"]');ok(/← Zona del tutor/.test(await T())&&await p.locator(".seg3").count()===0,"subpantalla con «← Zona del tutor»"+tag);await p.fill("#nt","Va bien");ok(await p.evaluate(()=>st.notes==="Va bien"),"nota guardada"+tag);
await p.click('[data-sub=""]');ok(await p.locator(".pg-2").count()===1,"volver a la zona"+tag);
// Alumno
await p.click('[data-tab="u"]');t=(await T()).toUpperCase();ok(["ALUMNO","PUNTO DE PARTIDA","APOYOS DE JUEGO","SESIÓN","GESTIÓN"].every(x=>t.includes(x)),"secciones de Alumno"+tag);
ok(await p.locator(".lr.ldg").count()===2&&t.lastIndexOf("GESTIÓN")>t.lastIndexOf("SESIÓN"),"Gestión al final con 2 acciones en rojo"+tag);
ok(!/APLICAR/.test(t),"sin botones Aplicar"+tag);
await p.selectOption("#dur","0");ok(await p.evaluate(()=>st.dur===0&&durOf()===0),"tiempo de uso por alumno (sin límite)"+tag);
await p.selectOption("#pl2","3");ok(await p.evaluate(()=>st.place[2]===3&&PL(2)===3),"punto de partida se guarda al cambiar"+tag);
await p.selectOption("#apcb","1");ok(await p.evaluate(()=>st.ap.cb===true&&document.documentElement.dataset.cb==="1")&&await p.locator("#cbpv i[data-p]").count()===3,"daltonismo: vista previa al momento"+tag);
const bg=await p.evaluate(()=>getComputedStyle(document.querySelector('#cbpv i[data-p="1"]')).backgroundImage);ok(bg!=="none","la vista previa muestra las tramas"+tag);
await p.click('[data-act="reset"]');ok(await p.evaluate(()=>st.log.length===12),"reiniciar: 1ª pulsación no borra"+tag);
await p.click('[data-act="reset"]');ok(await p.evaluate(()=>st.log.length===0&&st.name==="Ana"&&st.notes==="Va bien"),"reiniciar: 2ª borra y conserva nombre y notas"+tag);
await p.fill("#nm","Ana María");await p.click('[data-act="rename"]');ok(await p.evaluate(()=>st.name==="Ana María"),"renombrar"+tag);
// Ajustes
await p.click('[data-tab="c"]');t=(await T()).toUpperCase();const ord=["CUENTA","COPIAS DE SEGURIDAD","ALUMNOS","SONIDO","SEGURIDAD Y USO","SISTEMA"].map(x=>t.indexOf(x));ok(ord.every((v,i)=>v>=0&&(!i||v>ord[i-1])),"orden de Ajustes "+ord+tag);
await p.selectOption("#thm","dark");ok(await p.evaluate(()=>st.theme==="dark"&&document.documentElement.dataset.theme==="dark"),"tema: cambia al momento"+tag);await p.selectOption("#thm","");
await p.selectOption("#snd","0");ok(await p.evaluate(()=>st.set.snd===false),"sonido se guarda al cambiar"+tag);
await p.fill("#pin","5678");await p.click('[data-act="setpin"]');ok(await p.evaluate(()=>st.pin==="5678"),"PIN"+tag);
ok(!/Diagnóstico de instalación|Instalada en este dispositivo/.test(await T()),"sin diagnóstico ni «Instalada»"+tag);
await p.click('[data-sub="aula"]');ok(await p.locator(".lr.stu").count()===1&&/← Zona del tutor/.test(await T()),"vista de aula como subpantalla"+tag);
await p.fill("#nn","Luis");await p.click('[data-act="addp"]');ok(await p.locator(".lr.stu").count()===2&&await p.evaluate(()=>cx.sub==="aula"),"añadir alumno vuelve a la vista de aula"+tag);
await p.click('[data-sub=""]');ok(await p.locator('.tzh [data-go="profiles"]').count()===1,"con 2 alumnos: «Cambiar de alumno»"+tag);
for(const tb of ["p","u","c"]){await p.evaluate(x=>{cx.tab=x;cx.sub="";show()},tb);ok(!(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)),"sin desbordar "+tb+tag)}
// Familias y Modo Docente
await p.evaluate(()=>{st.rol="fam";go("tutor",{tab:"p"})});t=await T();ok(/Práctica/i.test(t)&&!/Seguimiento/i.test(t),"Familias: Práctica sin Seguimiento"+tag);
await p.evaluate(()=>{st.rol="doc";enterMd();go("tutor",{})});ok(/Clase[\s\S]*Ajustes/.test(await p.locator(".seg3").innerText())&&await p.locator(".seg3 button").count()===2&&await p.evaluate(()=>cx.tab==="u"),"Modo Docente: Clase · Ajustes"+tag);
await p.close()}
console.log(bad?"v119.js: "+bad+" fallos":"v119.js: todo OK");await b.close()})();
