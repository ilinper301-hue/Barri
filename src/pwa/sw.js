// Barri: funciona sin conexión y abre rápido. Copia guardada primero; en segundo plano se baja la nueva y se avisa a la app.
const V="barri-pwa-40",CORE=["./","index.html","manifest.webmanifest","banco_problemas.xlsx","icon-192.png","icon-512.png","fonts/fredoka.woff","fonts/fredoka-ext.woff","fonts/nunito.woff","fonts/inter-400.woff","fonts/inter-500.woff","fonts/inter-600.woff"],FONTS=["fonts.googleapis.com","fonts.gstatic.com"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(CORE.map(u=>fetch(u,{cache:"reload"}).then(r=>r.ok&&c.put(u,r)).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(async k=>{const old=k.filter(x=>x.startsWith("barri-pwa-")&&x!==V);await Promise.all(old.map(x=>caches.delete(x)));await self.clients.claim();if(old.length)(await self.clients.matchAll()).forEach(c=>c.postMessage({t:"nuevo",v:V}))}))});
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);
if(FONTS.includes(u.hostname)){e.respondWith(caches.match(r).then(h=>h||fetch(r).then(n=>{const c=n.clone();caches.open(V).then(x=>x.put(r,c));return n}).catch(()=>h)));return}
if(u.origin!==location.origin)return;
const nav=r.mode==="navigate",key=nav?"index.html":r;
e.respondWith(caches.match(key,{ignoreSearch:true}).then(h=>{const red=fetch(r).then(n=>{if(n.ok){const c=n.clone();caches.open(V).then(x=>x.put(key,c))}return n}).catch(()=>h);if(h){e.waitUntil(red.catch(()=>{}));return h}return red}))});
