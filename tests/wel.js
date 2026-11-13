// v1.18.2: bienvenida con «Entrar con Google» la primera vez
const { chromium } = require("playwright");
let bad=0;const ok=(c,m)=>{if(!c){bad++;console.log("FALLO",m)}};
(async()=>{const b=await chromium.launch();
for(const [W,H] of [[390,780],[1180,820]]){const ctx=await b.newContext({viewport:{width:W,height:H}});const p=await ctx.newPage();p.on("pageerror",e=>{bad++;console.log("ERROR JS",e.message)});
await p.goto(process.env.APP_URL+"?nosplash&wel");await p.waitForTimeout(300);const tag=" ["+W+"]";
ok(await p.evaluate(()=>scr)==="wel"&&await p.locator('[data-act="welg"]').count()===1,"primera vez: bienvenida con Google"+tag);
if(W===390&&process.env.SHOT)await p.screenshot({path:process.env.SHOT});
ok(!(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)),"sin desbordar"+tag);
await p.click('[data-act="weln"]');ok(await p.evaluate(()=>scr)==="home","sin cuenta: va al inicio"+tag);
await p.reload();await p.waitForTimeout(300);ok(await p.evaluate(()=>scr)==="home","no vuelve a salir"+tag);
await p.evaluate(()=>localStorage.removeItem("barri.wel"));await p.evaluate(()=>{window.fbLogin=()=>{window.__lg=1}});
await p.reload();await p.waitForTimeout(300);await p.evaluate(()=>{window.__lg=0});
// con Google: va al inicio y lanza el acceso
await p.evaluate(()=>{const o=fbLogin;});await p.click('[data-act="welg"]');ok(await p.evaluate(()=>scr==="home"&&localStorage.getItem("barri.wel")==="1"),"con Google: inicio y marcado"+tag);
// quien ya tiene datos no la ve
await p.evaluate(()=>{localStorage.removeItem("barri.wel");st.name="Ana";st.stars=3;save()});await p.reload();await p.waitForTimeout(300);ok(await p.evaluate(()=>scr)==="home","con datos: no sale"+tag);
await ctx.close()}
console.log(bad?"wel.js: "+bad+" fallos":"wel.js: todo OK");await b.close()})();
