# ESTADO (punto de control del trabajo)
**Si el usuario escribe "Continúa" o empiezas un chat: lee ESTADO.md PRIMERO, retoma desde el primer paso sin marcar y NO rehagas lo ya hecho.**
Tras cada paso: `python3 tools/ck.py "qué se hizo"` (1 línea). Al empezar una tarea: `python3 tools/ck.py --tarea "descripción" "paso1|paso2|paso3"`. Al terminar: `python3 tools/ck.py --fin`.

## Tarea actual
(ninguna en curso)

## Pasos
(vacío)

## Estado de entrega
- Versión publicada: **1.33.0** (caché barri-pwa-40). Desde el 13/11/2026 este repositorio contiene fuente + app publicada; flujo en `CLAUDE.md`, plan de mejoras por fases en `PLAN-BARRI.md` (fases 0-6 hechas; siguiente: fase 7 (opcional, Opus)).
- Pendiente de que el usuario pruebe: sincronización real con Firebase y piloto con alumnos.
- Aviso: la sección «Relevo para Sonnet» de abajo es histórica (v1.13) y ya está hecha.

## Relevo para Sonnet (pasos [SONNET], en este orden)
Reglas: trabaja en src/ y data/, compila `python3 tools/build.py`, prueba con `bash tests/run_all.sh` (y `node tests/<x>.js` con NODE_PATH, APP_URL, DIST exportados). No abras dist/index.html ni el Excel entero. Tras cada paso: `python3 tools/ck.py --paso 1` + `python3 tools/ck.py "qué se hizo"`.
1. **Layout y zonas de soltar (solo CSS, final de src/css/styles.css, dentro de `@media (orientation:landscape) and (min-width:700px)` lo que sea de tablet):**
   - Juego en horizontal (`.app[data-sc="game"]`, columnas `.gl`/`.gr2`): ocupar alto de pantalla (`min-height:calc(100dvh - 40px)`; `.gr2` con `justify-content:space-between` o repartir con `flex:1` en la tarjeta del modelo) para que no quede vacía la mitad inferior en ningún paso.
   - Zonas de soltar `.slot` (Total, Partes, casillas `.ex` de operación): alto 64-72 px en tablet (56 en móvil), `border-width:4px` dashed, más padding interno, radio 14 px. **Mantén** el test `layout.js` sin saltos de línea a 340/360/390/412 px y `tablet.js` sin desbordes.
2. **Ergonomía (CSS):** `.acts`/`.dock`: botón de comprobar (`[data-a^="chk"]`, `.bt` sin `.o`) como CTA (verde/morado lleno, más ancho, `flex:2`), «Pista» (`.bt.o`) y `.bt2` secundarios (contorno, sin relleno, `flex:1`). Fichas `.chip`: sombra paralela + borde inferior elevado + puntos de agarre (p. ej. `background-image:radial-gradient` de 2×3 puntos en un lateral o `::before`), `cursor:grab`. Burbuja `.bub`: padding 14-18 px, `p` a 17-18 px, line-height 1.4, icono con margen.
3. **Banco de problemas (data/banco_problemas.xlsx, hoja «Problemas»):** el tipo sale ahora de `((NN-1)//3)%4` (Opus ya lo cambió en build.py y mkProb), así que puedes **añadir IDs 13-24** por nivel (13-15 tipo0, 16-18 tipo1, 19-21 tipo2, 22-24 tipo3). Varía contextos/objetos (menos «globos»), nombres y números; en fracciones (mundo 3) usa denominadores 3,4,5,6,10 y numeradores variados (no solo 2/8), con `a` divisible por el denominador. Respeta los patrones que lee build.py: mundo 2 «X tiene … y Y tiene …»; mundo 4 tipo2 «… de <palabra>.»; mundo 4 `b<=6`. Columnas: ID, mundo, nivel, edad, tipo, texto, a, b, c, respuesta, operación, modelo, pista1, pista2, error. Comprueba con `tests/logic.js` (engine bad 0, draw bad 0), `mkprob.js` (idéntico) y `v113.js` (operaciones en líneas resolubles). Actualiza el «126 problemas» del título en run_all.sh.
4. **Cierre:** VER en app.js → `1.13.0 · <fecha>`; sw.js → `barri-pwa-10`; añade a CONTEXT.md §10d una línea con lo de v1.13 (ver Registro); batería completa; entrega `dist/index.html` y `dist/sw.js` (manifest no cambia); `python3 tools/ck.py --fin`.

## Registro
- [23/10 11:41] 1 modelo multi-perfil (st.cur/profs, swStu/addStu/delStu/asStu/roster, migración sin pérdida)
- [23/10 11:49] 2-5 aula, selector, competencias, notas, familias, privacidad (JS+CSS compilado; falta test profiles.js)
- [23/10 11:49] test tests/profiles.js OK (migración, aislamiento, aula, notas, CSV, familias, XSS)
- [23/10 11:51] 6 modo tablet horizontal: CSS (@media landscape ≥700px) + wrap2 en game.js + data-sc en show(); falta verificarlo con capturas/números
- [23/10 11:52] 7a versión 1.10.0, SW barri-pwa-7, tests añadidos a run_all, CONTEXT/PILOTO/CODEMAP actualizados; falta pasar run_all
- [23/10 12:00] 7 batería completa OK (único fallo layout 340px M2 ya existía en 1.9.3); entrega: dist/index.html + dist/sw.js + PILOTO.md
- [23/10 12:17] 340px: escala k rt 118->104 y ancho mínimo 34 en filas con total (game.js); layout 340 OK; falta run_all
- [23/10 12:21] entrega 1.10.1 (fix 340px); batería OK
- [23/10 18:08] A diseño unificado aplicado (tokens morados, tarjetas planas, tema sistema, Fredoka, manifest orientation any, theme-color); falta pasar tests
- [23/10 18:09] B copia con un toque (shareBk), aviso de copia (bkBanner), importación saneada (cleanAll); falta test backup
- [23/10 18:12] C roles Familias/Docente + modo Docente (st.cur=md, no guarda); falta tests/roles.js y pasar batería
- [23/10 18:13] version 1.11.0, SW v8, tests backup/roles en run_all, CONTEXT actualizado; falta pasar run_all
- [23/10 18:18] entrega 1.11.0: adaptación a Lectori; batería OK
- [24/10 09:03] perfiles estilo Lectori (pantalla profiles, avatar, sin chips); tests actualizados; falta run_all y entrega
- [24/10 09:07] entrega 1.12.0 perfiles estilo Lectori; batería OK (test de persistencia endurecido)
- [24/10 13:15] 4a 4b 4c 8 2 5 6 hechos (Opus): PIN, selector libre, borrado en Avanzado, bug ${MD()} y bordes docente, fichas por fase, deshacer/reiniciar, sonido, recordatorio, operaciones en líneas; tests v113/roles/backup/logic OK
- [24/10 13:16] Opus: tipo por ID cíclico ((n-1)//3)%4 en build.py y mkProb -> se pueden añadir IDs 13-24 por nivel
- [24/10 13:27] Batería tras Opus: todo OK salvo 'persistencia tras recargar' de profiles.js, intermitente solo dentro de run_all (pasa suelto y 4 en paralelo); el test ahora imprime el estado si vuelve a fallar
- [24/10 13:32] Sonnet 1: layout vertical (grid min-height 100dvh, columnas que llenan el alto, enunciado centrado) y zonas de soltar grandes (68/60/52 px según altura, borde 4-5px, fondo suave); tests/fill.js nuevo; layout.js/tablet.js OK
- [24/10 13:35] Sonnet 3: CTA verde destacado vs Pista/Deshacer secundarios, fichas con sombra y puntos de agarre, burbuja 16-18px con más padding; nowrap 340-412 OK; fill.js ampliado
- [24/10 13:44] Sonnet 7: banco 279 filas (261 con modelo), v1.13.0, SW barri-pwa-10, batería OK; entrega index.html+sw.js
- [24/10 16:20] v1.13.1: fichas sin brillo, pizarra .spad (tablet), bloques ×n veces (5 tablet/3 móvil), fracciones caben; tests OK (pad.js nuevo)
- [24/10 16:40] v1.13.2: asa de estirar integrada (línea dentro del bloque, zona táctil 24px); tests OK; entregado
- [24/10 16:52] Línea de estirar del color del bloque (más oscura, redondeada); barras proporcionales al colocar con animación (grow/FLIP)
- [24/10 16:54] 1 parte = __ (fracciones, teclado tras el modelo), elegir modelo (niveles 2-3, 3 miniaturas), estimar antes de calcular (nivel 2+), frase respuesta con unidad; errores típicos en S.mis -> log.mis
- [24/10 16:57] Mezcla (mixList, home), mundo 5 Retos (suma-diferencia, igualar, fracción del resto; 18 problemas; build.py+mkProb), informe Errores típicos (misSec)
- [24/10 17:03] Proyector (proj, clicker, problema del día); v1.14.0, SW barri-pwa-13, tests/v114.js; batería completa OK; entregado
- [24/10 17:17] v1.14.1: mapa con tarjetas de mundo grandes (color, icono, progreso) + cabecera del mundo + niveles compactos; Aventuras más grande en inicio; tests OK; entregado
- [24/10 17:26] v1.14.2: inicio compacto (Aventuras 110px, tarjetas 62px, Zona del tutor 42px); cabe sin scroll desde 360x640; entregado
- [24/10 18:00] v1.14.3: docente sin borde (✓ Activo), pizarra blanca sin puntos ni texto, toque coloca en primer hueco (Calcular), Elegir problema dentro de su nivel, sombra en brazos de la mascota, hero docente naranja suave; tests OK; entregado
- [24/10 21:23] v1.14.4: tipografía más ligera (grosores -1/-2 escalones en todo el CSS; Fredoka 500 títulos, números 600; fuentes 400-700 cargadas); verificado con Fredoka/Nunito reales; tests OK; entregado
- [24/10 22:26] v1.15.0: fase con objetos, lectura en voz alta, daltonismo (apoyos por alumno), fuentes alojadas (dist/fonts), dificultad adaptativa; tests/v115.js; batería OK; entregado (index, sw, fonts)
- [25/10 12:05] Repositorio GitHub ilinper301-hue/barri conectado (clon en /home/claude/barri-repo); publicada 1.15.0 + fonts + manifest actual (orientation any) directamente en main
- [25/10 12:12] Repo limpiado: borrados 10 archivos antiguos, README nuevo; publicado en main
- [25/10 12:58] Juego (mascota habla al tocarla, altavoz junto al enunciado, transición suave, volver a fases, a/b/c), barras (anchos exactos, líneas en fracciones, sombras de brazos, números del mapa), PIN obligatorio con confirmación y 5 min, tutor estilo Lectori (2 columnas, desplegables)
- [25/10 13:11] v1.16.0: banco regenerado, mundo Extremo (modelo libre), tests v116 y adaptados; batería OK; publicado en GitHub main
- [25/10 19:21] v1.17.0 publicado: apoyo, evaluación, retos de pensar, datos sobrantes; batería OK
- [13/11 15:38] Fase 0 de PLAN-BARRI: fuente, tests y docs subidos al repo; build == publicado; tools/publish.py, CLAUDE.md, .nojekyll
- [18/11 01:31] Fase 1 pasos 1-5: aviso de guardado + medidor, pantalla syncask tras PIN, fusión por campos (ft, rs, repetición de log), lectura incremental por ts del servidor, tests/sync2.js (y sync.js adaptado) OK
- [18/11 01:35] v1.28.0 publicada (barri-pwa-35); batería completa OK
- [18/11 01:40] Fase 2: CSS 44px, aria-live, foco, tests/tap44.js; falta batería
- [18/11 01:47] F3: tokens semánticos y colores (CTA naranja, pasos/progreso morado, mundo 1 cian, barra teal); falta tests y capturas
- [18/11 01:47] F3: variables de radio y letra (escala)
- [18/11 01:50] F3: !important no necesarios quitados (28); falta tests, nunito, publicar
- [18/11 12:54] 1-4: Bloquito bajo el enunciado (móvil) y abajo a la izquierda fijo y sticky (tableta); pizarra plegable (botón en barra superior, cerrada por defecto); pasos en la barra superior; modelo a la izquierda en Calcular/Comprobar; wide() ajusta barras al ancho; teclado 6 col y compacto en horizontal bajo; 844x390 de 1044/1062 con scroll a 51 (máx 65px); falta tests
- [18/11 13:08] 5-6: tests/v131.js + pad.js adaptado; batería completa OK; v1.31.0 (barri-pwa-38); CONTEXT §10u, PLAN fase 4 hecha
- [18/11 13:13] Fase 5 hecha: álbum en lista, contadores, bloqueo; v1.32.0
- [18/11 13:35] Fase 6 hecha: v1.33.0, batería OK
