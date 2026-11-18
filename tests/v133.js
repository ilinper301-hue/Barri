// v1.33: calcQ sin Function(), panel Diagnóstico, aviso de versión nueva, registro de errores, Excel fuera del index
const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch(), ctx = await b.newContext({ viewport: { width: 390, height: 844 } }), p = await ctx.newPage();
  let bad = 0; const ok = (n, c) => { console.log((c ? "ok " : "MAL ") + n); if (!c) bad++ };
  p.on("pageerror", e => { bad++; console.log("ERROR JS", e.message) });
  await p.goto(process.env.APP_URL + "?nosplash"); await p.waitForTimeout(1500);
  const c = await p.evaluate(() => [calcQ(["2","+","3"]), calcQ(["2","+","3","×","4"]), calcQ(["20","−","8","÷","2"]), calcQ(["6","×","3","−","4","+","1"]), calcQ(["12","÷","4","×","2"])]);
  ok("calcQ " + JSON.stringify(c), JSON.stringify(c) === "[5,14,16,15,6]");
  ok("sin Function() ni XLSX_B64 en el código", await p.evaluate(() => !/Function\(["']return/.test(chkO.toString()) && typeof XLSX_B64 === "undefined"));
  ok("index sin Excel incrustado", (await p.content()).length < 600000);
  await p.evaluate(() => { logErr("prueba"); go("tutor", { tab: "c" }) }); await p.waitForTimeout(150);
  await p.click('[data-act="diag"]'); await p.waitForTimeout(600);
  const t = await p.evaluate(() => document.getElementById("app").innerText);
  ok("diagnóstico muestra versión y errores", /Versión 1\.33/.test(t) && /Últimos errores: .*prueba/.test(t) && /Espacio del sitio|Datos de Barri/.test(t));
  await p.evaluate(() => navigator.serviceWorker.dispatchEvent(new MessageEvent("message", { data: { t: "nuevo" } }))); await p.waitForTimeout(100);
  ok("aviso de versión nueva", await p.evaluate(() => !!document.getElementById("updbar") && document.querySelector("#updbar button").offsetHeight >= 44));
  await b.close(); console.log(bad ? "FALLOS: " + bad : "v133.js: todo OK"); process.exit(bad ? 1 : 0);
})();
