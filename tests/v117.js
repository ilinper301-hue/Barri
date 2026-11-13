// v1.17: modo apoyo, evaluación inicial, retos de pensar (inverso e inventar) y datos sobrantes
const { chromium } = require("playwright");
let bad=0;const ok=(c,m)=>{if(!c){bad++;console.log("FALLO",m)}};
(async()=>{const b=await chromium.launch();const page=await b.newPage({viewport:{width:390,height:844}});page.on("pageerror",e=>{bad++;console.log("ERROR JS",e.message)});
await page.goto(process.env.APP_URL+"?nosplash");await page.waitForTimeout(400);
// modo apoyo en los tres pasos
const ap=await page.evaluate(()=>{S.on=false;const q=DATA.problems.find(x=>x.w===1&&x.l===2&&ptype(x)===1&&!x.xd);startList([q]);S.step=1;S.mc=false;S.cp=false;render();for(let i=0;i<3;i++){S.fill={"0.0":"1"};chkM()}
 const a1=/Te ayudo/.test(S.msg)&&S.fill["0.0"]===String(q.rows[0].s[0])&&S.fill.t===String(q.tot)&&S.fill["0.1"]===undefined;S.fill["0.1"]="?";chkM();const s2=S.step===2;
 for(let i=0;i<3;i++){S.ops=["1","+","1"];chkO()}const a2=/Te ayudo/.test(S.msg)&&S.ops[0]===String(q.tot);
 S.ops=[String(q.tot),"−",String(q.rows[0].s[0])];chkO();if(S.ck)pick(S.ckq.c);for(let i=0;i<3;i++){S.ans="1";chkA()}const a3=/Te ayudo/.test(S.msg);return{a1,s2,a2,a3,h:S.hints,mis:misStr()}});
ok(ap.a1&&ap.s2,"apoyo al dibujar "+JSON.stringify(ap));ok(ap.a2,"apoyo al plantear");ok(ap.a3,"apoyo al calcular");ok(ap.h===3&&/apo\*3/.test(ap.mis),"apoyo cuenta como pista");
ok(await page.evaluate(()=>{st.ap={apo:"off"};S.on=false;const q=DATA.problems.find(x=>x.w===1&&x.l===2);startList([q]);S.step=1;S.mc=false;S.cp=false;for(let i=0;i<4;i++){S.fill={"0.0":"1"};chkM()}const r=!/Te ayudo/.test(S.msg);st.ap={};return r}),"apoyo desactivable");
// retos de pensar
await page.evaluate(()=>{S.on=false;play(1,2)});ok(await page.evaluate(()=>P.length===6&&!!P[5].sp),"cada nivel añade un reto de pensar");
for(const k of ["inv","invop","make"]){const r=await page.evaluate(k=>{S.on=false;const base=pool(1,2).find(x=>x.n===3&&ptype(x)===0);startList([spItem(base,k)]);const q=P[0];const st0=Object.keys(st.solved).length;
 if(k==="make"){S.spk={act:q.acts.findIndex(x=>!x.ok),q:q.qs.findIndex(x=>x.ok)};spChk();const e=S.errs;S.spk.act=q.acts.findIndex(x=>x.ok);spChk();return{e,done:S.done,cards:document.querySelectorAll(".spc").length,solved:Object.keys(st.solved).length-st0}}
 spPick(q.opts.findIndex(o=>!o.ok));const e=S.errs;spPick(q.opts.findIndex(o=>o.ok));return{e,done:S.done,n:q.opts.length,uniq:new Set(q.opts.map(o=>o.t)).size,solved:Object.keys(st.solved).length-st0}},k);
 ok(r.e===1&&r.done&&r.solved===0,`reto ${k} `+JSON.stringify(r))}
// evaluación inicial
const ev=await page.evaluate(()=>{S.on=false;st.place={};startEval();const pat=[1,1,0,1,0,0];const seq=[];for(const okk of pat){const q=P[S.i];evalNext({errs:okk?0:3,hints:0,pst:3,id:q.id});seq.push(q.w+"-"+q.l);if(S.i<P.length-1)S.i++;else break}evalApply();return{seq,pl:st.place,open12:open(1,2),open13:open(1,3),nx:nextLv()}});
ok(ev.seq[0]==="1-1"&&ev.pl[1]>=2&&ev.open12,"evaluación ubica por mundo "+JSON.stringify(ev));
ok(await page.evaluate(()=>{S.fin=true;render();return /Prueba terminada/.test(document.body.innerText)&&!!document.querySelector(".evr")}),"pantalla de resultado de la prueba");
ok(await page.evaluate(()=>cleanPl({1:3,2:"x",9:2,3:7}).toString()&&JSON.stringify(cleanPl({1:3,2:"x",9:2,3:7}))==='{"1":3}'),"ubicación saneada");
await page.evaluate(()=>{S.on=false;go("tutor",{tab:"p"})});ok(await page.locator('[data-act="eval"]').count()===1,"evaluación en herramientas del tutor");
// datos sobrantes
const xd=await page.evaluate(()=>{S.on=false;const q=DATA.problems.find(x=>x.xd&&x.w===1&&x.l===1&&ptype(x)===0);startList([q]);document.querySelector('[data-a="go1"]').click();const warn0=S.msg;S.cp=false;S.mc=false;render();const chips=[...document.querySelectorAll(".tray .chip")].map(c=>c.dataset.v);const warn=/dato que no hace falta/.test(warn0);S.fill={"0.0":String(q.xd[0]),"0.1":String(q.rows[0].s[1]),t:"?"};chkM();return{chips,x:q.xd,warn,sob:/sob/.test(misStr()),n:DATA.problems.filter(p=>p.xd).length}});
ok(xd.chips.includes(String(xd.x[0]))&&xd.warn&&xd.sob&&xd.n>=30,"datos sobrantes: ficha, aviso y registro "+JSON.stringify(xd));
console.log(bad?"v117.js: "+bad+" fallos":"v117.js: todo OK");await b.close()})();
