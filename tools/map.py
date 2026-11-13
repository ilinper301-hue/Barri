#!/usr/bin/env python3
"""Genera CODEMAP.md: índice de funciones/constantes con nº de línea (para localizar código sin abrir archivos enteros)."""
import re
from pathlib import Path
R=Path(__file__).resolve().parent.parent; out=["# CODEMAP (generado por tools/map.py; no editar a mano)\n","Usa `sed -n 'INICIO,FINp' archivo` o `grep -n` para leer solo lo necesario. Líneas muy largas: usa `cut -c1-200`.\n"]
for f in ["src/js/game.js","src/js/app.js"]:
    out.append(f"\n## {f}\n")
    for i,l in enumerate((R/f).read_text().split("\n"),1):
        m=re.match(r"^(?:async )?function (\w+)",l) or re.match(r"^(?:const|let) (\w+)\s*=",l) or re.match(r"^(\w+)\(\)\{",l) or re.match(r"^([a-z])\(\)\{",l)
        if m: out.append(f"- L{i}: `{m.group(1)}`" + (" (pantalla/pestaña dentro de SC o TB)" if re.match(r"^\w+\(\)\{",l) else ""))
out.append("\n## src/css/styles.css (secciones)\n")
for i,l in enumerate((R/"src/css/styles.css").read_text().split("\n"),1):
    if l.startswith("/*") and "=====" in l: out.append(f"- L{i}: {l.strip()}")
out.append("\n## Bloques grandes que NO hay que abrir\n- `data/banco_problemas.xlsx` (banco; se edita con Excel). `src/js/data.generated.js` (referencia; lo regenera build.py). `{{XLSX_B64}}` en app.js se inyecta al compilar.\n")
(R/"CODEMAP.md").write_text("\n".join(out)+"\n"); print(len(out),"entradas")
