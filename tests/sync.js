// v1.18: cuenta docente con Firebase simulado (dos dispositivos que comparten un servidor falso)
const { chromium } = require("playwright");
let bad=0;const ok=(c,m)=>{if(!c){bad++;console.log("FALLO",m)}};
const SRV=new Map();
const srv=(op,a,b)=>{if(op==="get")return SRV.get(a)||null;if(op==="list")return [...SRV.entries()].filter(([k])=>k.startsWith(a+"/")&&!k.slice(a.length+1).includes("/")).map(([k,v])=>[k.slice(a.length+1),v]);if(op==="batch"){a.forEach(o=>o.t==="set"?SRV.set(o.p,o.d):SRV.delete(o.p));return true}};
const MOCK=()=>{const AUTH={currentUser:null,cbs:[],onAuthStateChanged(f){this.cbs.push(f);setTimeout(()=>f(this.currentUser),0)},async signInWithPopup(){this.currentUser={uid:"u1",email:"maestro@cole.es",displayName:"Maestro"};this.cbs.forEach(f=>f(this.currentUser))},async signOut(){this.currentUser=null;this.cbs.forEach(f=>f(null))},async getRedirectResult(){}};
 const ref=p=>({id:p.split("/").pop(),path:p,async get(){const d=await window.__srv("get",p);return{exists:!!d,data:()=>d}},collection:n=>({doc:id=>ref(p+"/"+n+"/"+id),async get(){const L=await window.__srv("list",p+"/"+n);return{forEach:f=>L.forEach(([id,d])=>f({id,data:()=>d}))}}})});
 const DB={collection:n=>({doc:id=>ref(n+"/"+id)}),batch(){const ops=[];return{set:(r,d)=>ops.push({t:"set",p:r.path,d}),delete:r=>ops.push({t:"del",p:r.path}),commit:()=>window.__srv("batch",ops)}}};
 window.firebase={apps:[],initializeApp(c){this.apps.push(c)},auth:Object.assign(()=>AUTH,{GoogleAuthProvider:function(){}}),firestore:()=>DB}};
const CFG=`const firebaseConfig = {\n  apiKey: "AIzaFake",\n  authDomain: "barri-test.firebaseapp.com",\n  projectId: "barri-test",\n  appId: "1:123:web:abc"\n};`;
(async()=>{const b=await chromium.launch();
const dev=async()=>{const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();p.on("pageerror",e=>{bad++;console.log("ERROR JS",e.message)});p.on("dialog",d=>d.accept());await p.exposeFunction("__srv",srv);await p.addInitScript(MOCK);await p.goto(process.env.APP_URL+"?nosplash");await p.waitForTimeout(300);return p};
const A=await dev();
await A.evaluate(()=>{st.name="Ana";st.stars=7;st.solved={"M1-N1-01":3};save();addStu("Luis");st.pin="2468";gsave();UNL=Date.now();go("tutor",{tab:"s"})});
ok(await A.locator("#fbc").count()===0&&await A.locator('[data-act="fblogin"]').count()===1&&await A.locator('[data-act="fbcfgx"]').count()===0,"configuración incluida: solo Entrar con Google");
ok(await A.evaluate(()=>fbCfg().projectId==="mis-apps-educativas"&&parseCfg(`const firebaseConfig = {apiKey:"x",projectId:"p",appId:"y"};`).projectId==="p"),"configuración incrustada y lector de config");
await A.click('[data-act="fblogin"]');await A.waitForFunction(()=>SYNC.last>0&&!SYNC.busy,null,{timeout:5000});
ok([...SRV.keys()].filter(k=>k.startsWith("barri/u1/stu/")).length===2&&SRV.has("barri/u1"),"primera sincronización sube el aula "+[...SRV.keys()]);
ok(/maestro@cole.es/.test(await A.locator("body").innerText()),"muestra la cuenta");
// dispositivo B vacío: descarga
const B=await dev();
await B.evaluate(c=>{localStorage.setItem("barri.fb",JSON.stringify(parseCfg(c)))},CFG);await B.evaluate(()=>fbLogin());await B.waitForFunction(()=>SYNC.last>0&&!SYNC.busy,null,{timeout:5000});
let r=await B.evaluate(()=>({n:roster().map(x=>x[1].name).sort().join(","),pin:st.pin,ana:roster().find(x=>x[1].name==="Ana")[1].stars}));
ok(r.n==="Ana,Luis"&&r.pin==="2468"&&r.ana===7,"dispositivo nuevo descarga el aula "+JSON.stringify(r));
// B juega con Ana y sincroniza; A recibe el cambio
await B.evaluate(async()=>{const id=roster().find(x=>x[1].name==="Ana")[0];swStu(id);st.stars=12;st.solved["M2-N1-01"]=3;save();await syncNow()});
await A.evaluate(async()=>{await syncNow()});
r=await A.evaluate(()=>{const a=roster().find(x=>x[1].name==="Ana")[1];return{s:a.stars,k:Object.keys(a.solved).length}});ok(r.s===12&&r.k===2,"el progreso viaja al otro dispositivo "+JSON.stringify(r));
// ajustes: el más reciente gana
await B.evaluate(async()=>{st.set.dur=30;gsave();await syncNow()});await A.evaluate(async()=>{await syncNow()});ok(await A.evaluate(()=>st.set.dur===30),"ajustes sincronizados");
// borrar alumno en A llega a B
await A.evaluate(async()=>{const id=roster().find(x=>x[1].name==="Luis")[0];delStu(id);await syncNow()});await B.evaluate(async()=>{await syncNow()});
ok(await B.evaluate(()=>!roster().some(x=>x[1].name==="Luis")),"alumno borrado desaparece en el otro dispositivo");
// alumno nuevo en B llega a A
await B.evaluate(async()=>{addStu("Sara");await syncNow()});await A.evaluate(async()=>{await syncNow()});ok(await A.evaluate(()=>roster().some(x=>x[1].name==="Sara")),"alumno nuevo llega al otro dispositivo");
// dispositivo C con datos propios: pregunta y usa la cuenta (diálogo aceptado)
const C=await dev();await C.evaluate(c=>{st.name="Pepe";st.stars=2;save();localStorage.setItem("barri.fb",JSON.stringify(parseCfg(c)))},CFG);await C.evaluate(()=>fbLogin());await C.waitForFunction(()=>SYNC.last>0&&!SYNC.busy,null,{timeout:5000});
ok(await C.evaluate(()=>!roster().some(x=>x[1].name==="Pepe")&&roster().some(x=>x[1].name==="Ana")),"con datos propios pregunta y usa los de la cuenta");
// cerrar sesión
await C.evaluate(()=>{UNL=Date.now();go("tutor",{tab:"s"})});await C.click('[data-act="fblogout"]');ok(await C.evaluate(()=>!FBU&&!!document.querySelector('[data-act="fblogin"]')),"cerrar sesión");
console.log(bad?"sync.js: "+bad+" fallos":"sync.js: todo OK");await b.close()})();
