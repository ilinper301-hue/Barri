#!/usr/bin/env python3
"""Punto de control: python tools/ck.py "texto" | --tarea "titulo" "p1|p2|p3" | --paso N | --fin"""
import sys, re, time
from pathlib import Path
f = Path(__file__).resolve().parent.parent / "ESTADO.md"; s = f.read_text(); a = sys.argv[1:]
def sec(name, body):
    global s; s = re.sub(rf"(## {name}\n).*?(?=\n## |\Z)", lambda m: m.group(1) + body + "\n", s, flags=re.S)
if a and a[0] == "--tarea":
    sec("Tarea actual", a[1]); sec("Pasos", "\n".join(f"- [ ] {p}" for p in a[2].split("|")) if len(a) > 2 else "")
elif a and a[0] == "--paso":
    n = int(a[1]); i = 0
    def mark(m):
        global i; i += 1; return "- [x] " if i == n else m.group(0)
    s = re.sub(r"- \[ \] ", mark, s)
elif a and a[0] == "--fin":
    sec("Tarea actual", "(ninguna en curso)"); sec("Pasos", "(vacío)")
else:
    s = s.rstrip("\n") + f"\n- [{time.strftime('%d/%m %H:%M')}] {' '.join(a)}\n"
f.write_text(s); print("ok")
