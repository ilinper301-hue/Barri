// Barri: funciona sin conexión. Red primero (así los cambios llegan solos) y copia guardada si no hay red.
const V="barri-pwa-28",CORE=["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png","fonts/fredoka.woff","fonts/fredoka-ext.woff","fonts/nunito.woff","fonts/inter-400.woff","fonts/inter-500.woff","fonts/inter-600.woff"],FONTS=["fonts.googleapis.com","fonts.gstatic.com"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(CORE.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith("barri-pwa-")&&x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);
if(FONTS.includes(u.hostname)){e.respondWith(caches.match(r).then(h=>h||fetch(r).then(n=>{const c=n.clone();caches.open(V).then(x=>x.put(r,c));return n}).catch(()=>h)));return}
if(u.origin!==location.origin)return;
e.respondWith(fetch(r).then(n=>{if(n.ok){const c=n.clone();caches.open(V).then(x=>x.put(r,c))}return n}).catch(()=>caches.match(r).then(h=>h||caches.match("index.html"))))});
