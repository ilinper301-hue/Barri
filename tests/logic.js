const fs=require("fs"),vm=require("vm");let H={};
const el=()=>({set innerHTML(v){global.LAST=v},get innerHTML(){return global.LAST},classList:{add(){},remove(){},toggle(){}},dataset:{},style:{},remove(){}});
const root=el();
global.document={getElementById:()=>el(),documentElement:root,body:{appendChild(){}},addEventListener:(t,f)=>{H[t]=f},createElement:()=>({click(){}}),elementFromPoint:()=>global.EFP};
global.window={scrollTo(){},addEventListener(){}};global.navigator={};global.location={protocol:"file:",search:"?nosplash"};global.localStorage={getItem:()=>null,setItem(){}};global.confirm=()=>true;global.matchMedia=()=>({matches:false});global.H=H;
let src=[...fs.readFileSync(process.env.DIST+"/index.html","utf8").matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join("\n");
src+=`
let bad=0,ok=0,pre=0;
DATA.problems.forEach(p=>{startGame([p]);S.step=1;
 const had=Object.keys(S.fill).length+Object.keys(S.sh).length;if(p.l===1&&had>0)pre++;
 if(p.fr){for(let i=0;i<p.fr.k;i++)S.sh[i]=true;["g1","g2"].forEach(k=>{if(p.fr[k]!==undefined)S.fill[k]=String(p.fr[k])});S.fill.t=String(p.tot)}
 else{p.rows.forEach((r,ri)=>{r.s.forEach((s,si)=>{S.fill[ri+"."+si]=String(typeof s==="object"?s.v:s)});if(r.t!==undefined)S.fill[ri+".t"]=String(r.t)});if(p.tot!==undefined)S.fill.t=String(p.tot)}
 chkM();if(S.step!==2){bad++;console.log("MODEL FAIL",p.id,S.msg)}else ok++;
 {const tn=new Set((String(p.t).match(/\\d+/g)||[]).map(Number));if(p.w<5&&trayD(P[0]).some(x=>x!=="?"&&!tn.has(+x)&&+x!==p.tot))bad++}});
console.log("engine ok",ok,"bad",bad,"prefilled L1",pre);
for(const s of ["home","learn","adv","album","gate"])go(s);[1,2,3,4].forEach(w=>go("les",{w}));go("adv",{w:3});
["p","c","s"].forEach(t=>go("tutor",{tab:t}));go("nb",{list:tiers().slice(0,1)});console.log("screens ok");

let dbad=0,dok=0,neg=0;
for(const w of [1,2,3,4])pool(w,4).forEach(p0=>{startGame([p0]);const p=P[0];S.step=1;
 if(p.fr){S.nd=p.fr.d;for(let i=0;i<p.fr.k;i++)S.sh[i]=true;["g1","g2"].forEach(k=>{if(p.fr[k]!==undefined)S.fill[k]=String(p.fr[k])});S.fill.t=String(p.tot);
  S.nd=p.fr.d+1;chkM();if(S.step!==1||!/partes iguales/.test(S.msg))dbad++;S.nd=p.fr.d;S.step=1}
 else{p.rows.forEach((r,ri)=>{S.db[ri]=r.s.length;r.s.forEach((x,si)=>{const v=typeof x==="object"?x.v:x;S.fill[ri+"."+si]=String(v);S.dw[ri+"."+si]=Math.max(40,(v==="?"?p.ans:v)*8)});if(r.t!==undefined)S.fill[ri+".t"]=String(r.t)});if(p.tot!==undefined)S.fill.t=String(p.tot);
  const keep={...S.db};S.db[0]=r0=(S.db[0]||0)+1;chkM();if(S.step!==1||!/Hay que dibujar/.test(S.msg))dbad++;S.db={...keep};S.step=1;neg++}
 S.step=1;chkM();if(S.step!==2){dbad++;console.log("DRAW FAIL",p.id,S.msg)}else dok++;
 try{render()}catch(e){dbad++;console.log("render",e.message)}});
console.log("draw ok",dok,"bad",dbad);
// proporciones invertidas
{const p=pool(2,4)[0];startGame([p]);S.step=1;p.rows.forEach((r,ri)=>{S.db[ri]=r.s.length;r.s.forEach((x,si)=>{const v=typeof x==="object"?x.v:x;S.fill[ri+"."+si]=String(v);S.dw[ri+"."+si]=v==="?"?60:Math.max(40,300-v*8)})});if(p.tot!==undefined)S.fill.t=String(p.tot);p.rows.forEach((r,ri)=>{if(r.t!==undefined)S.fill[ri+".t"]=String(r.t)});chkM();console.log("proporciones:",S.step===1,S.msg)}
// vertical brace
{const p=DATA.problems.find(x=>x.w===2&&x.rows.length>1&&x.tot!==undefined);S.fill={};S.sh={};S.lh=null;console.log("vertical brace",/class="brc"/.test(model(p,true)),/class="vb2"/.test(model(p,false)))}
// lecciones
for(const w of [1,2,3,4]){go("les",{w});let fr=LS.f.length;for(let k=0;k<fr;k++){LS.k=k;SC.les()}console.log("leccion",w,"frames",fr,"final done",S.done);clearInterval(LT)}
go("adv",{w:2});console.log("adv ok",/Dibuja tú/.test(LAST));
`;
vm.runInThisContext(src);
