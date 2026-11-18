// v1.28 (fase 1): que no se pierda nada. Fusión por campos, sincronización incremental, pantalla propia
// en la primera sincronización y aviso si falla el guardado. Firebase simulado con hora del servidor y consultas.
const { chromium } = require("playwright");
let bad = 0, DLG = 0; const ok = (c, m) => { if (!c) { bad++; console.log("FALLO", m) } };
const SRV = new Map(); let CLK = Date.now(), READS = 0;
const now = () => (CLK = Math.max(CLK + 1, Date.now() + OFF)); let OFF = 0;
const srv = (op, a, b) => {
  if (op === "get") { READS++; return SRV.get(a) || null }
  if (op === "list") { const L = [...SRV.entries()].filter(([k, v]) => k.startsWith(a + "/") && !k.slice(a.length + 1).includes("/") && (b == null || (typeof v.ts === "number" && v.ts > b))).map(([k, v]) => [k.slice(a.length + 1), v]); READS += Math.max(1, L.length); return L }
  if (op === "batch") { a.forEach(o => { if (o.t === "set") { const d = Object.assign({}, o.d); if (d.ts && d.ts.__st) d.ts = now(); SRV.set(o.p, d) } else SRV.delete(o.p) }); return true }
};
const MOCK = () => {
  const AUTH = { currentUser: null, cbs: [], onAuthStateChanged(f) { this.cbs.push(f); setTimeout(() => f(this.currentUser), 0) }, async signInWithPopup() { this.currentUser = { uid: "u1", email: "maestro@cole.es", displayName: "Maestro" }; this.cbs.forEach(f => f(this.currentUser)) }, async signOut() { this.currentUser = null; this.cbs.forEach(f => f(null)) }, async getRedirectResult() { } };
  const q = (p, gt) => ({ async get() { const L = await window.__srv("list", p, gt); return { forEach: f => L.forEach(([id, d]) => f({ id, data: () => d })) } } });
  const ref = p => ({ id: p.split("/").pop(), path: p, async get() { const d = await window.__srv("get", p); return { exists: !!d, data: () => d } }, collection: n => Object.assign(q(p + "/" + n), { doc: id => ref(p + "/" + n + "/" + id), where: (f, op, v) => q(p + "/" + n, v) }) });
  const DB = { collection: n => ({ doc: id => ref(n + "/" + id) }), batch() { const ops = []; return { set: (r, d) => ops.push({ t: "set", p: r.path, d }), delete: r => ops.push({ t: "del", p: r.path }), commit: () => window.__srv("batch", ops) } } };
  window.firebase = { apps: [], initializeApp(c) { this.apps.push(c) }, auth: Object.assign(() => AUTH, { GoogleAuthProvider: function () { } }), firestore: Object.assign(() => DB, { FieldValue: { serverTimestamp: () => ({ __st: 1 }) } }) };
};
(async () => {
  const b = await chromium.launch();
  const dev = async (w = 390, h = 844) => { const ctx = await b.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage(); p.on("pageerror", e => { bad++; console.log("ERROR JS", e.message) }); p.on("dialog", d => { DLG++; d.accept() }); await p.exposeFunction("__srv", srv); await p.addInitScript(MOCK); await p.goto(process.env.APP_URL + "?nosplash"); await p.waitForTimeout(300); return p };
  const sync = p => p.evaluate(async () => { await syncNow(); return { r: SYNC.reads, w: SYNC.writes || 0, e: SYNC.err } });
  const stu = (p, n) => p.evaluate(n => { const x = roster().find(x => x[1].name === n); return x ? cleanStu(x[1]) : null }, n);
  const asN = (p, n, f) => p.evaluate(([n, f]) => { const id = roster().find(x => x[1].name === n)[0]; swStu(id); return new Function(f)() }, [n, f]);
  const play = (id, pst) => `Game.done({id:"${id}",w:1,l:1,errs:0,hints:0,pst:${pst}})`;

  // 1) A crea el aula y entra: sube con hora del servidor
  const A = await dev();
  await A.evaluate(() => { st.name = "Ana"; save(); addStu("Luis"); st.pin = "2468"; gsave() });
  await A.evaluate(() => fbLogin()); await A.waitForFunction(() => SYNC.last > 0 && !SYNC.busy, null, { timeout: 5000 });
  ok([...SRV.entries()].filter(([k]) => k.startsWith("barri/u1/stu/")).every(([, v]) => typeof v.ts === "number" && v.ts > 0), "cada alumno lleva la hora del servidor");
  const B = await dev(); await B.evaluate(() => fbLogin()); await B.waitForFunction(() => SYNC.last > 0 && !SYNC.busy, null, { timeout: 5000 });
  ok((await B.evaluate(() => roster().map(x => x[1].name).sort().join())) === "Ana,Luis", "B (vacío) descarga el aula sin preguntar");

  // 2) A la vez: B juega con Ana; A le escribe notas y cambia sus apoyos
  await asN(B, "Ana", play("M1-N1-01", 3) + ";" + play("M1-N1-02", 2));
  await asN(A, "Ana", 'st.notes="Le cuesta comparar";save();st.ap=Object.assign(cleanAp(st.ap),{nr:"all"});save()');
  await sync(A); await sync(B); await sync(A); await sync(B);
  let a = await stu(A, "Ana"), bb = await stu(B, "Ana");
  ok(a.notes === "Le cuesta comparar" && a.ap.nr === "all", "las notas y apoyos de A no se pierden " + JSON.stringify([a.notes, a.ap]));
  ok(a.stars === 5 && Object.keys(a.solved).length === 2 && a.log.length === 2, "el juego de B no se pierde " + JSON.stringify([a.stars, a.solved]));
  ok(JSON.stringify(a) === JSON.stringify(bb), "los dos dispositivos quedan iguales");

  // 3) Los dos juegan con Ana a la vez, problemas distintos y uno repetido
  await asN(A, "Ana", play("M1-N1-03", 3) + ";" + play("M1-N1-05", 3));
  await asN(B, "Ana", play("M1-N1-04", 1) + ";" + play("M1-N1-05", 2));
  await sync(A); await sync(B); await sync(A); await sync(B);
  a = await stu(A, "Ana"); bb = await stu(B, "Ana");
  ok(a.stars === 12 && Object.keys(a.solved).length === 5 && a.log.length === 6, "progreso de los dos sumado " + JSON.stringify([a.stars, Object.keys(a.solved).length, a.log.length]));
  ok(JSON.stringify(a) === JSON.stringify(bb), "convergen (mismo resultado en los dos) " + JSON.stringify([a.stars, bb.stars]));
  let w = (await sync(A)).w + (await sync(B)).w;
  ok(w === 0, "sin rebotes: en reposo no se escribe nada (" + w + " escrituras)");

  // 4) Lectura incremental: en reposo solo se lee el documento de ajustes; tras un cambio, ese alumno
  OFF += 5 * 60000; let r = await sync(A);
  ok(r.r === 1, "en reposo lee 1 documento (antes leía todos): " + r.r);
  await asN(B, "Luis", play("M2-N1-01", 3)); await sync(B); OFF += 5 * 60000;
  r = await sync(A); ok(r.r === 2 && (await stu(A, "Luis")).stars === 3, "tras un cambio lee solo ese alumno: " + r.r);
  r = await A.evaluate(async () => { await syncNow("full"); return SYNC.reads }); ok(r === 3, "«Sincronizar ahora» lee todo: " + r);

  // 5) Reiniciar progreso en A manda sobre lo jugado antes en B, pero no sobre lo jugado después
  await asN(B, "Luis", play("M2-N1-02", 2));
  await A.waitForTimeout(5); await asN(A, "Luis", 'doAct("reset",{})'); await A.waitForTimeout(5);
  await asN(B, "Luis", play("M2-N1-03", 1));
  await sync(A); await sync(B); await sync(A);
  a = await stu(A, "Luis"); bb = await stu(B, "Luis");
  ok(a.stars === 1 && Object.keys(a.solved).join() === "M2-N1-03" && a.log.length === 1, "el reinicio manda y se conserva lo posterior " + JSON.stringify([a.stars, a.solved]));
  ok(JSON.stringify(a) === JSON.stringify(bb), "reinicio igual en los dos");

  // 6) Nombre: gana el cambio más reciente aunque el otro dispositivo haya jugado después
  await asN(A, "Luis", 'st.name="Luisito";save()'); await A.waitForTimeout(5); await asN(B, "Luis", play("M2-N1-04", 3));
  await sync(B); await sync(A); await sync(B);
  ok((await stu(B, "Luisito")) && (await stu(A, "Luisito")).stars === 4, "renombrar en A y jugar en B: se conservan los dos");

  // 7) Primera sincronización con datos propios: pantalla propia, Juntar por defecto, unir por nombre
  const D = await dev(1180, 820);
  await D.evaluate(() => { st.name = "ana"; save(); Game.done({ id: "M3-N1-01", w: 3, l: 1, errs: 0, hints: 0, pst: 3 }); addStu("Marta"); Game.done({ id: "M1-N1-01", w: 1, l: 1, errs: 0, hints: 0, pst: 2 }) });
  const before = JSON.stringify([...SRV.entries()]);
  await D.evaluate(() => { UNL = Date.now(); go("tutor", { tab: "c" }); fbLogin() }); await D.waitForFunction(() => !!SYNC.ask && !SYNC.busy, null, { timeout: 5000 });
  ok(DLG === 0, "ningún confirm() del navegador");
  ok(before === JSON.stringify([...SRV.entries()]), "no toca la cuenta hasta decidir");
  ok(await D.evaluate(() => scr === "syncask"), "si el tutor está dentro, se abre la pantalla de decisión");
  const txt = await D.locator("#app").innerText();
  ok(/Juntar los dos/.test(txt) && /Unir los que se llaman igual/.test(txt) && /ana/.test(txt), "pantalla con Juntar y unión por nombre");
  await D.evaluate(() => { UNL = 0; go("gate") }); ok(await D.evaluate(() => scr === "gate"), "fuera de la zona del tutor pide el PIN");
  await D.evaluate(() => { UNL = Date.now(); go("gate") }); ok(await D.evaluate(() => scr === "syncask"), "tras el PIN vuelve a la decisión");
  await D.click('[data-act="sk"][data-m="up"]'); ok(await D.evaluate(() => !!SYNC.ask && scr === "syncask"), "«solo este dispositivo» pide un segundo toque");
  await D.waitForTimeout(4200);
  await D.click('[data-act="sk"][data-m="join"]'); await D.waitForFunction(() => SYNC.last > 0 && !SYNC.busy, null, { timeout: 5000 });
  const names = await D.evaluate(() => roster().map(x => x[1].name).sort().join());
  ok(names === "Ana,Luisito,Marta", "Juntar: sin duplicados y con los de los dos lados: " + names);
  const an = await stu(D, "Ana");
  ok(an.stars === 15 && an.solved["M3-N1-01"] === 3 && an.notes === "Le cuesta comparar", "Ana une el progreso de los dos dispositivos " + JSON.stringify([an.stars, an.notes]));
  await sync(A); ok((await A.evaluate(() => roster().map(x => x[1].name).sort().join())) === "Ana,Luisito,Marta" && (await stu(A, "Ana")).stars === 15, "lo juntado llega a A");

  // 7b) Mismo id «p1» pero otro niño: Juntar no los mezcla
  const G = await dev();
  await G.evaluate(() => { st.name = "Pepe"; save(); Game.done({ id: "M1-N1-09", w: 1, l: 1, errs: 0, hints: 0, pst: 2 }); UNL = Date.now(); go("tutor", { tab: "c" }); fbLogin() });
  await G.waitForFunction(() => scr === "syncask" && !SYNC.busy, null, { timeout: 5000 });
  await G.click('[data-act="sk"][data-m="join"]'); await G.waitForFunction(() => SYNC.last > 0 && !SYNC.busy, null, { timeout: 5000 });
  const gn = await G.evaluate(() => roster().map(x => x[0] + ":" + x[1].name + ":" + x[1].stars));
  ok(gn.length === 4 && gn.some(x => /^p1:Ana:15$/.test(x)) && gn.some(x => /^p\w+:Pepe:2$/.test(x) && !/^p1:/.test(x)), "un «p1» con otro nombre queda como alumno aparte " + gn);
  ok(await G.evaluate(() => st.name === "Pepe"), "y sigue siendo el alumno activo");
  // 8) Aviso si falla el guardado y medidor de espacio
  const E = await dev();
  await E.evaluate(() => { localStorage.setItem("lectori.x", "x".repeat(200000)); const o = Storage.prototype.setItem; window.__o = o; Storage.prototype.setItem = function (k, v) { if (k === "barri.v1") { const e = new Error("lleno"); e.name = "QuotaExceededError"; throw e } return o.call(this, k, v) }; st.name = "Eva"; save() });
  ok(await E.locator("#sverr[role=alert]").isVisible(), "aviso visible si no se puede guardar");
  ok(/No se está guardando/.test(await E.locator("#sverr").innerText()), "texto del aviso");
  await E.evaluate(() => { show(); go("home") }); ok(await E.locator("#sverr").count() === 1, "el aviso sigue al repintar");
  await E.click("#sverr button"); ok(await E.evaluate(() => scr === "gate" && cx.next === "sto"), "«Ver» pide el PIN");
  await E.evaluate(() => { UNL = Date.now(); go("gate", { next: "sto" }) }); await E.waitForTimeout(150);
  const sto = await E.locator("#sto").innerText();
  ok(/Barri/.test(sto) && /Otras apps 200 KB/.test(sto) && /Libre/.test(sto), "medidor en Ajustes: " + sto.replace(/\n/g, " | "));
  ok(/espacio está lleno/.test(await E.locator(".tz").innerText()), "Ajustes explica el fallo");
  const bx = await E.locator("#sto .stob").boundingBox(); ok(bx && bx.width > 200, "barra del medidor visible");
  await E.evaluate(() => { Storage.prototype.setItem = window.__o; save() }); ok(await E.locator("#sverr").count() === 0, "al volver a guardar, el aviso desaparece");
  ok(await E.evaluate(() => JSON.parse(localStorage.getItem("barri.v1")).name === "Eva"), "y lo pendiente se guarda");
  ok(!/borrar datos del sitio|Borrar datos/i.test(sto), "nunca aconseja borrar datos del sitio");

  // 9) Capturas de la pantalla de decisión y del medidor (claro/oscuro, móvil/tableta)
  const out = process.env.TMPD || "/tmp";
  for (const [wd, ht, th] of [[390, 844, "light"], [1180, 820, "dark"]]) {
    const F = await dev(wd, ht); await F.evaluate(t => { st.theme = t; theme(); st.name = "Pepe"; save(); SYNC.ask = { u: "u1", em: "maestro@cole.es", rn: [["p1x", "Pepe"], ["p2x", "Rosa"]] }; UNL = Date.now(); go("syncask") }, th);
    await F.screenshot({ path: `${out}/syncask-${wd}-${th}.png` });
    const tooSmall = await F.evaluate(() => [...document.querySelectorAll("#app .lr")].filter(e => e.offsetParent && e.getBoundingClientRect().height < 44).map(e => e.className));
    ok(!tooSmall.length, "controles de 44 px o más en la decisión " + tooSmall);
    await F.evaluate(() => { SYNC.ask = null; go("tutor", { tab: "c" }); setTimeout(() => document.getElementById("sto").scrollIntoView(), 0) }); await F.waitForTimeout(100);
    await F.screenshot({ path: `${out}/espacio-${wd}-${th}.png` });
  }
  console.log(bad ? "sync2.js: " + bad + " fallos" : "sync2.js: todo OK"); await b.close();
})();
