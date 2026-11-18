#!/usr/bin/env python3
"""Compila src/ -> dist/index.html (+ archivos PWA). Uso: python tools/build.py   (requiere: pip install openpyxl)
Fuente de verdad: src/ y data/banco_problemas.xlsx. NO edites dist/ a mano."""
import re, json, base64, shutil
from pathlib import Path
from openpyxl import load_workbook
R = Path(__file__).resolve().parent.parent
XLSX = R / "data" / "banco_problemas.xlsx"

def convert(row):
    """Fila del Excel -> problema con modelo de barras (misma lógica que mkProb en src/js/app.js)."""
    id_, mundo, lvl, edad, tipo, tx, a, b, c, resp, op, modelo, h1, h2, err = row[:15]
    w, t = int(id_[1]), ((int(id_[-2:]) - 1) // 3) % 4
    m = re.match(r"(\S+) tiene .* y (\S+) tiene", tx); n1, n2 = m.groups() if m else (tx.split()[0], None)
    tot = None; rows = None; fr = None; nn = None; opn = None
    if w == 1:
        rows = [{"l": "Partes", "s": [a, b] if t == 0 else [b, "?"]}]; tot, val = ("?", a + b) if t == 0 else (a, a - b)
    elif w == 2:
        if t == 0: rows = [{"l": n1, "s": [a]}, {"l": n2, "s": [a, b], "t": "?"}]; val = a + b
        elif t == 1: rows = [{"l": n1, "s": [a]}, {"l": n2, "s": ["?", {"v": b, "g": 1}]}]; val = a - b
        elif t == 2: rows = [{"l": n1, "s": [b, "?"], "t": a}, {"l": n2, "s": [b]}]; val = a - b
        else: rows = [{"l": n1, "s": [a]}, {"l": n2, "s": [a, b]}]; tot, val = "?", 2 * a + b
    elif w == 3:
        d_, k_ = b, c; rows = [{"l": "Partes", "s": []}]
        if t == 0: fr, tot, val, nn = {"d": d_, "k": k_, "g1": "?"}, a, a // d_ * k_, 5
        elif t == 1: fr, tot, val, nn = {"d": d_, "k": k_, "g2": "?"}, a, a - a // d_ * k_, 7
        elif t == 2: fr, tot, val, nn = {"d": d_, "k": 1, "g2": "?"}, a, a - a // d_, 5
        else: fr, tot, val, nn = {"d": d_, "k": k_, "g1": a}, "?", a // k_ * d_, 5
    elif w == 5:
        if t == 0:
            m5 = re.match(r"Entre (\S+) y (\S+) tienen", tx); big, small = m5.groups()
            rows = [{"l": small, "s": ["?"]}, {"l": big, "s": ["?", b]}]; tot, val, nn = a, (a - b) // 2, 5
        elif t == 1: rows = [{"l": n1, "s": [b, "?", "?"], "t": a}, {"l": n2, "s": [b]}]; val, nn = (a - b) // 2, 5
        elif t == 2:
            x = a // b; y = (a - x) // c; rows = [{"l": "Partes", "s": [x, "?", "?"] if c == 2 else [x, y, "?"]}]; tot, val, nn = a, a - x - y, (7 if c == 2 else 9)
    elif w == 4 and b <= 6 and t < 3:
        if t == 0: rows = [{"l": "Grupos", "s": [a] * b}]; tot, val = "?", a * b
        elif t == 1: rows = [{"l": "Cajas", "s": ["?"] * b}]; tot, val = a, a // b
        else: rows = [{"l": re.search(r"de ([^\s.]+)\.", tx).group(1), "s": [a]}, {"l": n1, "s": [a] * b}]; tot, val = "?", a * (b + 1)
    if w >= 6:
        # Mundos Extremo y Avanzado: modelo libre en la columna «Modelo» → "Ana: ?; Bea: ?, 15; TOTAL: 155"  (fila con total: "Ana: 8, ? = 20")
        rows = []
        for part in [x.strip() for x in str(modelo).split(";") if x.strip()]:
            lab, rest = [y.strip() for y in part.split(":", 1)]
            cv = lambda v: "?" if v.strip() == "?" else int(v)
            if lab.upper() == "TOTAL": tot = cv(rest); continue
            bl, _, tt = rest.partition("=")
            rw = {"l": lab, "s": [cv(v) for v in bl.split(",")]}
            if tt.strip(): rw["t"] = cv(tt)
            rows.append(rw)
        val = int(resp); lines = [x for x in str(op).split(";") if x.strip()]; nn = 2 * len(lines) + 1
        opn = sorted({int(v) for ln in lines for v in re.findall(r"\d+", ln.split("=")[0])})
    if rows is None: return None
    nums = {x for rw in ([] if fr else rows) for s in rw["s"] for x in [s["v"] if isinstance(s, dict) else s] if x != "?"}
    nums |= {x for x in [tot] + [rw.get("t") for rw in rows] if isinstance(x, int)}
    if fr: nums |= {x for x in [fr.get("g1"), fr.get("g2")] if isinstance(x, int)}
    xd = []
    if int(id_[-2:]) >= 25 and w <= 4:  # datos sobrantes: números del enunciado que no están en el modelo
        known = set(nums) | {a, b} | ({c} if w == 3 and c else set())
        xd = sorted({int(x) for x in re.findall(r"(?<![\d/])\d+(?![\d/])", tx)} - known)
    d = val + 1 if val + 1 not in nums else val + 2
    p = {"id": id_, "w": w, "l": lvl, "t": tx, "rows": rows, "ans": val, "tray": sorted(set(nums) | set(xd)) + ["?", d],
         "ops": (opn if w >= 6 else sorted({a, b} | ({c} if w in (3, 5) else set()) | set(xd))) + ["+", "−", "×", "÷"],
         "n": nn or (5 if (w == 2 and t == 3) or (w == 4 and t == 2) else 3), "h": [h1, h2, "Prueba con: " + op.replace("(", "").replace(")", "")]}
    if tot is not None: p["tot"] = tot
    if fr: p["fr"] = fr
    if xd: p["xd"] = xd
    return p

def main():
    ws = load_workbook(XLSX, data_only=True)["Problemas"]
    rows = [list(r[:15]) for r in ws.iter_rows(min_row=2, values_only=True) if r[0]]
    probs = [p for p in (convert(r) for r in rows) if p]
    data_js = "\nconst DATA=" + json.dumps({"problems": probs}, ensure_ascii=False) + ";\n\n"
    (R / "tests").mkdir(exist_ok=True); (R / "tests" / "rows.json").write_text(json.dumps(rows, ensure_ascii=False))
    tpl = (R / "src" / "index.template.html").read_text()
    html = (tpl.replace("{{CSS}}", (R / "src/css/styles.css").read_text())
               .replace("{{DATA_JS}}", data_js)
               .replace("{{GAME_JS}}", (R / "src/js/game.js").read_text())
               .replace("{{APP_JS}}", (R / "src/js/app.js").read_text()))
    (R / "dist").mkdir(exist_ok=True); (R / "dist" / "index.html").write_text(html)
    shutil.copy(XLSX, R / "dist" / "banco_problemas.xlsx")
    for f in (R / "src" / "pwa").iterdir(): shutil.copy(f, R / "dist" / f.name)
    (R / "dist" / "fonts").mkdir(exist_ok=True)
    for f in (R / "src" / "fonts").iterdir(): shutil.copy(f, R / "dist" / "fonts" / f.name)
    print(f"dist/index.html: {len(html)//1024} KB, {len(probs)} problemas con modelo de {len(rows)} filas")

if __name__ == "__main__": main()
