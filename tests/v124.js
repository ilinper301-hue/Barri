// v1.24: mundo 7 «Avanzado» (5.º y 6.º): antes y después, fracción del resto, razones y porcentajes
const { chromium } = require("playwright");
let bad=0;const ok=(c,m)=>{if(!c){bad++;console.log("FALLO",m)}};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});p.on("pageerror",e=>{bad++;console.log("ERROR JS",e.message)});
await p.goto(process.env.APP_URL+"?nosplash");await p.waitForTimeout(300);
const ids=await p.evaluate(()=>DATA.problems.filter(x=>x.w===7).map(x=>x.id));ok(ids.length===24,"24 problemas en Avanzado ("+ids.length+")");
ok(await p.evaluate(()=>pool(7,2).length===12&&pool(7,3).length===12),"12 en nivel 2 y 12 en nivel 3");
for(const id of ids){const r=await p.evaluate(id=>{const q=DATA.problems.find(x=>x.id===id);S.on=false;startList([q]);S.mc=false;S.step=1;
 q.rows.forEach((rw,ri)=>{rw.s.forEach((s,si)=>S.fill[ri+"."+si]=String(sv(s)));if(rw.t!==undefined)S.fill[ri+".t"]=String(rw.t)});if(q.tot!==undefined)S.fill.t=String(q.tot);chkM();if(S.step!==2)return"modelo: "+S.msg;
 const L=q.h[2].replace("Prueba con: ","").split(";").map(x=>x.trim()).filter(Boolean);S.ops=[];L.forEach(ln=>{const[lhs]=ln.split("=");const t=lhs.trim().split(/\s+/);S.ops.push(t[0],{"-":"−","+":"+","×":"×","÷":"÷"}[t[1]],t[2])});
 if(L.length===1)S.ops=S.ops.slice(0,3);chkO();if(S.step!==3)return"operación: "+S.msg+" | "+S.ops.join(" ");return"ok"},id);ok(r==="ok",id+" "+r)}
// abre tras Retos y en el mapa aparece
ok(await p.evaluate(()=>!open(7,2)),"cerrado al principio");
await p.evaluate(()=>{[2,3].forEach(w=>pool(w,2).slice(0,5).forEach(q=>st.solved[q.id]=1))});ok(await p.evaluate(()=>open(7,2)&&!open(7,3)),"se abre con Retos (nivel 2)");
await p.evaluate(()=>{S.on=false;go("adv",{w:7})});ok(/Avanzado/.test(await p.locator("#app").innerText())&&!(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)),"mapa con Avanzado sin desbordar");
await p.evaluate(()=>{go("learn")});ok(await p.locator('[data-go="les"][data-w="7"]').count()===1,"explicación en Aprender");
await p.evaluate(()=>{go("tutor",{tab:"u"})});ok(await p.locator("#pl7").count()===1,"punto de partida de Avanzado");
console.log(bad?"v124.js: "+bad+" fallos":"v124.js: todo OK");await b.close()})();
