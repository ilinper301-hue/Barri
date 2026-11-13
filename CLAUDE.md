# Barri · reglas de trabajo

Este repositorio contiene **el código fuente y la app publicada**. GitHub Pages sirve la raíz de `main`.

1. Lee `CONTEXT.md` y `ESTADO.md` antes de tocar nada; `CODEMAP.md` para localizar código. El plan de mejoras por fases está en `PLAN-BARRI.md`.
2. Edita solo `src/` y `data/banco_problemas.xlsx`. **No edites a mano** los archivos de la raíz (`index.html`, `sw.js`, `manifest.webmanifest`, iconos, `fonts/`): los genera la compilación.
3. Compila: `python3 tools/build.py` (genera `dist/`, que no se sube).
4. Prueba: `export NODE_PATH=$(npm root -g); bash tests/run_all.sh`.
5. En cada versión: sube `VER` en `src/js/app.js` y la caché `barri-pwa-N` en `src/pwa/sw.js`.
6. Publica: `python3 tools/publish.py` (copia `dist/` a la raíz), commit con la versión y push directo a `main`.
7. Registra los pasos con `python3 tools/ck.py`.

No abras archivos enormes (`index.html`, `dist/index.html`, `src/js/data.generated.js`, el Excel entero).
Reglas que no se rompen (mismo dominio que Lectori y las demás apps, privacidad, táctil, 44 px): `CONTEXT.md`, secciones 2, 7 y 10b.
