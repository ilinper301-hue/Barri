const fs=require("fs"),vm=require("vm"),assert=require("assert");
const el=()=>({set innerHTML(v){global.LAST=v},get innerHTML(){return global.LAST},classList:{add(){},remove(){},toggle(){}},dataset:{},style:{},remove(){}});
global.document={getElementById:()=>el(),documentElement:el(),body:{appendChild(){}},addEventListener(){},createElement:()=>({click(){}}),querySelector:()=>({}),head:{appendChild(){}}};
global.window={scrollTo(){},addEventListener(){}};global.navigator={};global.location={protocol:"file:",search:"?nosplash"};global.localStorage={getItem:()=>null,setItem(){}};global.matchMedia=()=>({matches:false});global.setInterval=()=>1;global.clearInterval=()=>{};
const html=fs.readFileSync(process.env.DIST+"/index.html","utf8");const js=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join("\n");
global.FS=fs;vm.runInThisContext(js);
vm.runInThisContext(`
const rows=JSON.parse(FS.readFileSync(process.env.ROOT+"/tests/rows.json","utf8"));let ok=0,bad=0,nul=0;const out=[];
rows.forEach(r=>{try{const p=mkProb(r);if(!p){nul++;return}out.push(p)}catch(e){bad++;console.log("ERR",r[0],e.message)}});
console.log("convertidos",out.length,"sin modelo",nul,"errores",bad,"banco original",ORIG.length);
const A=JSON.stringify(out),B=JSON.stringify(ORIG);console.log("idéntico al banco original:",A===B);
if(A!==B){for(let i=0;i<out.length;i++){if(JSON.stringify(out[i])!==JSON.stringify(ORIG[i])){console.log("difiere",out[i].id,JSON.stringify(out[i]).slice(0,200),"\\n",JSON.stringify(ORIG[i]).slice(0,200));break}}}
// mundo 4 con más de 6 bloques: debe ignorarse; datos inválidos: error claro
console.log("ID malo:",(()=>{try{mkProb(["X1",1,1,"","","Ana tiene 3 y Leo tiene 4",3,4,null,7,"3 + 4","","h","h"])}catch(e){return e.message}})());
console.log("resultado no entero:",(()=>{try{mkProb(["M4-N1-05",1,1,"","","Cada bolsa 3 pelotas 5 bolsas",15,4,null,0,"15 ÷ 4","","h","h"])}catch(e){return e.message}})());
`);
process.exit(0);
