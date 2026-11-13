// v1.25: fichas imprimibles con soluciones
const { chromium } = require("playwright");
let bad=0;const ok=(c,m)=>{if(!c){bad++;console.log("FALLO",m)}};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});p.on("pageerror",e=>{bad++;console.log("ERROR JS",e.message)});
await p.goto(process.env.APP_URL+"?nosplash");await p.waitForTimeout(300);
await p.evaluate(()=>{st.name="Ana";st.pin="1234";UNL=Date.now();save();go("tutor",{tab:"p"})});
await p.click('[data-act="fic"]');ok(await p.evaluate(()=>scr==="fic")&&await p.locator(".fsh .fp").count()===6,"abre la ficha con 6 problemas del nivel del alumno");
ok(await p.locator(".fsols .fsl").count()===6,"hoja de soluciones con 6");
const a1=await p.evaluate(()=>[...document.querySelectorAll(".fpt")].map(e=>e.textContent).join("|"));await p.click('[data-act="ficnew"]');const a2=await p.evaluate(()=>[...document.querySelectorAll(".fpt")].map(e=>e.textContent).join("|"));ok(a1!==a2,"«Otros problemas» cambia la selección");
await p.selectOption("#fn","4");ok(await p.locator(".fsh .fp").count()===4,"número de problemas");
await p.selectOption("#fs","0");ok(await p.locator(".fsols").count()===0,"sin soluciones");await p.selectOption("#fs","1");
// todos los mundos y niveles se generan sin errores y las soluciones muestran la respuesta
const R=await p.evaluate(()=>{const out=[];for(const w of WS)for(const l of [1,2,3,4]){if(!pool(w,l).length)continue;FIC.w=w;FIC.l=l;FIC.n=8;FIC.sol=1;show();const ps=ficPick(),sl=[...document.querySelectorAll(".fsl")];
 if(ps.length!==sl.length)out.push(w+"/"+l+" cuenta");ps.forEach((q,i)=>{if(!sl[i]||!sl[i].querySelector(".fsa").textContent.includes(String(q.ans)))out.push(q.id+" sin respuesta")});
 if(l>=3&&!document.querySelector(".fdraw"))out.push(w+"/"+l+" sin recuadro de dibujo");if(l<=2&&!document.querySelector(".fmod"))out.push(w+"/"+l+" sin modelo")}return out});
ok(!R.length,"todas las fichas: "+R.slice(0,6).join(", "));
ok(!(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)),"sin desbordar en el móvil");
await p.emulateMedia({media:"print"});ok(await p.evaluate(()=>getComputedStyle(document.querySelector(".ftool")).display==="none"),"al imprimir se ocultan los controles");
const pdf=await p.pdf({format:"A4"});ok(pdf.length>20000,"genera PDF A4");
console.log(bad?"fic.js: "+bad+" fallos":"fic.js: todo OK");await b.close()})();
