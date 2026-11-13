const { chromium } = require("playwright");
let bad=0;const ok=(c,m)=>{if(!c){bad++;console.log("FALLO",m)}};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1180,height:820},hasTouch:true});const page=await ctx.newPage();
page.on("pageerror",e=>{bad++;console.log("ERROR JS",e.message)});
await page.addInitScript(()=>{window.__osc=0;window.AudioContext=class{constructor(){this.currentTime=0;this.state="running";this.destination={}}resume(){}createOscillator(){window.__osc++;return{type:"",frequency:{value:0},connect(){},start(){},stop(){}}}createGain(){return{gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}}}}});
await page.addInitScript(()=>{window.__ck=()=>{if(typeof S!=="undefined"&&S.ck==="fr")pick(String(S.ckq.o.findIndex(x=>x[1])))}});await page.goto(process.env.APP_URL+"?nosplash");await page.waitForTimeout(300);
const T=()=>page.evaluate(()=>document.body.innerText);
let dlg=[];page.on("dialog",d=>{dlg.push(d.message());d.type()==="prompt"?d.accept(globalThis.__ans||"BORRAR"):d.accept()});
await page.evaluate(()=>{st.name="Ana";st.stars=3;save()});
// ---- 4a / 4c: mapa desde modo docente
await page.evaluate(()=>{enterMd();go("adv",{w:3})});
let t=await T();ok(!/\$\{|MD\(\)/.test(t)&&/Modo docente/.test(t),"mapa en modo docente sin texto anómalo");
ok(await page.locator(".psel").count()===4,"selector de problemas en cada nivel");
await page.locator(".psel summary").nth(2).click();const k=await page.locator(".psel").nth(2).locator(".pp").count();
await page.locator(".psel").nth(2).locator(".pp").nth(k-1).click();await page.waitForTimeout(100);
let r=await page.evaluate(()=>({on:S.on,id:P[0].id,n:P.length}));const want=await page.evaluate(k=>pool(3,3)[k].id,k-1);
ok(r.on&&r.n===1&&r.id===want,"abrir un problema concreto desde el selector "+JSON.stringify(r));
await page.evaluate(()=>{S.on=false;go("home")});
// ---- 4b (v1.19): borrado total en Perfil › Seguridad y uso, en rojo y con doble pulsación
await page.evaluate(()=>{const id=Object.keys(st.profs)[0];swStu(id);go("tutor",{tab:"c"})});
ok(await page.locator('.lr.ldg[data-act="wipe"][data-sure]').count()===1,"borrado total en rojo con doble pulsación");
await page.evaluate(()=>go("tutor",{tab:"u"}));ok(await page.locator('[data-act="wipe"]').count()===0,"sin borrado total en Alumno");
await page.evaluate(()=>go("tutor",{tab:"c"}));await page.click('[data-act="wipe"]');ok(await page.evaluate(()=>st.name==="Ana")&&/Pulsa otra vez/.test(await T()),"una pulsación no borra: pide confirmar");
// ---- 8: PIN
await page.fill("#pin","12a4");await page.click('[data-act="setpin"]');ok(await page.evaluate(()=>st.pin==="")&&/4 números/.test(await T()),"PIN inválido rechazado");
await page.fill("#pin","2468");await page.click('[data-act="setpin"]');ok(await page.evaluate(()=>st.pin==="2468"),"PIN guardado");
await page.evaluate(()=>{UNL=0;go("gate")});ok(await page.locator(".pin span").count()===4,"puerta pide PIN");
for(const d of "1111")await page.click(`[data-g="${d}"]`);ok(await page.evaluate(()=>scr==="gate")&&/PIN incorrecto/.test(await T()),"PIN incorrecto no entra");
for(const d of "2468")await page.click(`[data-g="${d}"]`);ok(await page.evaluate(()=>scr==="tutor"),"PIN correcto entra en la zona del tutor");
await page.evaluate(()=>{UNL=0;go("profiles")});await page.click(".pbtn.md");ok(await page.evaluate(()=>scr==="gate"&&cx.next==="md"),"Modo Docente pide PIN");
for(const d of "2468")await page.click(`[data-g="${d}"]`);ok(await page.evaluate(()=>st.cur==="md"&&scr==="home"),"PIN correcto entra en modo docente");
await page.evaluate(()=>{const id=Object.keys(st.profs)[0];swStu(id);UNL=0;go("gate")});await page.click('[data-act="pinfg"]');
await page.evaluate(()=>{cx.q.v=String(cx.q.a*cx.q.b)});await page.click('[data-g="ok"]');ok(await page.evaluate(()=>st.pin===""&&scr==="gate"&&!cx.fg),"olvidé el PIN: operación difícil lo quita");
for(const d of "13571357")await page.click(`[data-g="${d}"]`);ok(await page.evaluate(()=>st.pin==="1357"&&scr==="tutor"),"crear PIN nuevo (dos veces) entra");
r=await page.evaluate(()=>JSON.stringify(cleanAll({...st,pin:"9999"}).pin)+JSON.stringify(cleanAll({...st,pin:"<x>"}).pin));ok(r==='"9999"""',"PIN en copias saneado "+r);
// ---- 2: fichas al dibujar = datos del enunciado + '?'
r=await page.evaluate(()=>{const out=[];DATA.problems.forEach(p=>{startGame([p]);const q=P[0],tr=trayD(q),tn=new Set((q.t.match(/\d+/g)||[]).map(Number));if(q.w<5&&tr.some(x=>x!=="?"&&!tn.has(+x)))out.push(q.id+":"+tr.join("|"));if(!tn.has(q.ans)&&tr.includes(q.ans))out.push(q.id+" muestra la respuesta")});S.on=false;return out});
ok(r.length===0,"fichas de dibujo solo con datos del enunciado: "+r.slice(0,4).join(" ; "));
// ---- 5: deshacer y reiniciar en fracciones
r=await page.evaluate(()=>{const p=DATA.problems.find(x=>x.fr&&x.l===2);startGame([p]);S.step=1;render();const c=()=>Object.keys(S.sh).filter(i=>S.sh[i]).length;
document.querySelectorAll(".cell[data-c]")[2].click();const a=c();document.querySelectorAll(".cell[data-c]")[0].click();const b2=c();
document.querySelector('[data-a="undo"]').click();const u=c();document.querySelector('[data-a="rst"]').click();const z=c();const dis=document.querySelector('[data-a="rst"]').disabled;S.on=false;return[a,b2,u,z,dis]});
ok(JSON.stringify(r)==="[3,1,3,0,true]","fracciones: sombrear, deshacer y reiniciar "+JSON.stringify(r));
// ---- 6: operaciones en varias líneas resolubles, recordatorio y sonido
r=await page.evaluate(()=>{const fails=[];let multi=0;const OPS=["+","−","×","÷"],ev=(x,o,y)=>o==="+"?x+y:o==="−"?x-y:o==="×"?x*y:x/y;
DATA.problems.forEach(p0=>{startGame([p0]);const p=P[0],L=NL(p);if(L<2){S.on=false;return}multi++;const nums=p.ops.filter(x=>/^\d+$/.test(String(x))).map(String);
 let sol=null;const rec=(l,vals,lines)=>{if(sol)return;if(l===L){if(vals[L-1]===p.ans)sol=lines.slice();return}const cand=nums.concat(TK.slice(0,l));
  for(const a of cand)for(const o of OPS)for(const c of cand){const v=x=>TK.indexOf(x)>-1?vals[TK.indexOf(x)]:+x,res=ev(v(a),o,v(c));if(res>=0&&Number.isInteger(res)){lines.push([a,o,c]);vals.push(res);rec(l+1,vals,lines);vals.pop();lines.pop();if(sol)return}}};rec(0,[],[]);
 if(!sol){fails.push(p.id+" sin solución en líneas");S.on=false;return}
 S.step=2;S.ops=sol.flat();chkO();if(S.step!==3){fails.push(p.id+" chkO: "+S.msg);S.on=false;return}
 const rem=document.querySelectorAll(".rem .exr").length;if(rem!==L)fails.push(p.id+" recordatorio "+rem);
 S.rv.forEach((v,i)=>{S.ans=String(v);chkA();__ck()});if(!S.done)fails.push(p.id+" no termina: "+S.msg);S.on=false});
return{fails,multi}});
ok(r.multi>20&&r.fails.length===0,"operaciones en varias líneas ("+r.multi+"): "+r.fails.slice(0,4).join(" ; "));
r=await page.evaluate(()=>{const p=DATA.problems.find(x=>x.n===3);startGame([p]);S.step=2;const nums=P[0].ops.filter(x=>/^\d+$/.test(String(x)));
 for(const a of nums)for(const o of["+","−","×","÷"])for(const c of nums){S.ops=[a,o,c];S.errs=0;chkO();if(S.step===3)break}if(S.step!==3)return"sin op";
 const one=document.querySelectorAll(".rem .exr").length;const o0=window.__osc;S.ans="9999";chkA();__ck();const wrong=S.done;S.ans=String(P[0].ans);chkA();__ck();const snd=window.__osc-o0;S.on=false;return{one,wrong,done:S.done,snd}});
ok(r.one===1&&!r.wrong&&r.done&&r.snd>0,"una línea: recordatorio, error y sonido al acertar "+JSON.stringify(r));
await page.evaluate(()=>{st.set.snd=false;const p=DATA.problems.find(x=>x.n===3);startGame([p]);S.step=3;S.rv=[P[0].ans];S.ans=String(P[0].ans);window.__o1=window.__osc;chkA();__ck();S.on=false});
ok(await page.evaluate(()=>window.__osc===window.__o1),"sin sonido si está desactivado");
// tarjeta docente sin bordes
await page.evaluate(()=>{st.set.snd=true;go("profiles")});r=await page.evaluate(()=>getComputedStyle(document.querySelector(".pbtn.md")).borderLeftWidth);ok(r==="0px","tarjeta Modo Docente sin bordes laterales "+r);
console.log(bad?("v113.js: "+bad+" fallos"):"v113.js: todo OK");await b.close()})();
