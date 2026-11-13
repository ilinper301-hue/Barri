#!/usr/bin/env python3
"""Publica: copia dist/ a la raíz del repositorio (lo que sirve GitHub Pages). Uso: python3 tools/publish.py
Antes: python3 tools/build.py y bash tests/run_all.sh. Después: git add -A, commit con la versión y push a main."""
import shutil
from pathlib import Path
R = Path(__file__).resolve().parent.parent; D = R / "dist"
if not (D / "index.html").exists(): raise SystemExit("Falta dist/: ejecuta antes python3 tools/build.py")
n = 0
for f in D.rglob("*"):
    if f.is_file():
        t = R / f.relative_to(D); t.parent.mkdir(parents=True, exist_ok=True)
        if not t.exists() or t.read_bytes() != f.read_bytes(): shutil.copyfile(f, t); n += 1; print("actualizado", t.relative_to(R))
print(f"{n} archivos actualizados en la raíz")
