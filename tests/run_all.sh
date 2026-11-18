#!/usr/bin/env bash
# Uso: bash tests/run_all.sh [--full]   (--full añade el fuzz táctil, ~4 min)
# Requisitos: node + playwright global (NODE_PATH), chromium (PLAYWRIGHT_BROWSERS_PATH), python3 + openpyxl
set -u
ROOT=$(cd "$(dirname "$0")/.." && pwd); export ROOT DIST="$ROOT/dist" APP_URL="file://$ROOT/dist/index.html" TMPD=$(mktemp -d)
export NODE_PATH=${NODE_PATH:-$(npm root -g)}
python3 "$ROOT/tools/build.py" || exit 1
python3 "$ROOT/tests/make_edit_xlsx.py" "$TMPD/edit.xlsx" >/dev/null
for d in srv/barri srv2/Barri srv2/Educacion srv2/Edu2; do mkdir -p "$TMPD/$d"; done
cp -r "$DIST"/* "$TMPD/srv/barri/"; cp -r "$DIST"/* "$TMPD/srv2/Barri/"
printf '<!doctype html><link rel="manifest" href="manifest.webmanifest"><title>Lectori</title>' > "$TMPD/srv2/Educacion/index.html"
echo '{"name":"Lectori","id":"/","start_url":"/","scope":"/"}' > "$TMPD/srv2/Educacion/manifest.webmanifest"
printf '<!doctype html><link rel="manifest" href="manifest.webmanifest"><title>L2</title>' > "$TMPD/srv2/Edu2/index.html"
echo '{"name":"L2","start_url":"./"}' > "$TMPD/srv2/Edu2/manifest.webmanifest"
python3 -m http.server 8766 --directory "$TMPD/srv" >/dev/null 2>&1 & python3 -m http.server 8767 --directory "$TMPD/srv2" >/dev/null 2>&1 &
trap 'kill $(jobs -p) 2>/dev/null' EXIT; sleep 1
cd "$ROOT/tests"
run(){ echo "== $1 =="; shift; timeout 280 "$@" 2>&1 | tail -${TAILN:-12}; }
run "lógica del motor (354 problemas, dibujo, lecciones)" node logic.js
run "conversor Excel->problemas (idéntico al banco)" node mkprob.js
run "navegación y destinos de la pantalla de inicio" node nav.js
run "maquetación sin saltos de línea (4 anchos)" node layout.js
run "animación de inicio" node splash.js
run "colocación táctil (toque, temblor, cancelar, 2 dedos)" node touch.js
run "importar/exportar Excel" env APP_URL=http://localhost:8766/barri/index.html node excel.js
run "PWA: instalable, offline, service worker" node pwa.js
run "perfiles, aula, competencias, notas, familias, privacidad" env APP_URL=http://localhost:8766/barri/index.html node profiles.js
run "modo tablet horizontal (5 tamaños)" node tablet.js
run "copia con un toque, aviso e importación saneada" node backup.js
run "perfil de uso Docente/Familias y modo docente" node roles.js
run "v1.13: PIN, selector, borrado, fichas por fase, deshacer, operaciones en líneas, sonido" node v113.js
run "v1.13: relleno vertical y zonas de soltar (5 tamaños)" node fill.js
run "v1.13.1/v1.31: pizarra plegable bajo el enunciado (tablet)" node pad.js
run "v1.14: modelo, 1 parte, estimar, frase, errores típicos, Mezcla, Retos, proyector" node v114.js
run "v1.15: objetos, lectura en voz alta, daltonismo, fuentes, dificultad adaptativa" node v115.js
run "v1.16: fases, mascota, letras, anchos, fracciones, tutor, Extremo" node v116.js
run "v1.17: apoyo, evaluación, retos de pensar, datos sobrantes" node v117.js
run "v1.18: cuenta docente (Firebase simulado)" node sync.js
run "v1.29: controles de 44 px, aria-live y foco visible" node tap44.js
run "v1.31: pantalla de juego (Bloquito fijo, pizarra plegable, barras al ancho, horizontal bajo)" node v131.js
run "v1.28: que no se pierda nada (fusión, incremental, decisión, guardado)" node sync2.js
run "v1.33: Function() fuera, Diagnóstico, aviso de versión, Excel aparte" env APP_URL=http://localhost:8766/barri/index.html node v133.js
run "v1.18.2: bienvenida con Google" node wel.js
run "v1.19-1.20: Zona del tutor (Progreso · Alumno · Ajustes)" node v119.js
run "v1.24: mundo Avanzado (5.º y 6.º)" node v124.js
run "v1.24: modelos de Avanzado en una línea (6 anchos)" node w7layout.js
run "v1.25: fichas imprimibles con soluciones" node fic.js
[ "${1:-}" = "--full" ] && run "fuzz táctil (largo)" node fuzz.js
echo "Capturas en: $TMPD"
