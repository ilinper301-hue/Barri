# Barri · contexto del proyecto (leer ENTERO antes de tocar nada; ~5 min)

## 1. Qué es
**Barri**: PWA educativa (móvil, vertical) para niños de 6 a 12 años que aprenden a **resolver problemas con el modelo de barras de Singapur**.
Un solo archivo `index.html` (HTML+CSS+JS vanilla, sin librerías) + manifest + service worker + 2 iconos. Idioma: **español**. Tema oscuro por defecto (hay claro).
Usuario: **maestro/a** que prueba con su grupo; usa **Chrome en Android**; sube a **GitHub Pages**.

## 2. Despliegue (¡mismo dominio que otra app!)
- Barri: https://ilinper301-hue.github.io/Barri/  (repo `Barri`)
- Lectori (otra app suya, lectura): https://ilinper301-hue.github.io/Educacion/
- **Comparten origen** → comparten caché del navegador, localStorage y reglas de instalación PWA. Reglas:
  - Manifest de Barri: `id:"barri-mates-app"`, `scope:"./"`, `start_url:"./"`. Nunca `id:"./"` ni `"/"` (colisiona con Lectori → "la app ya existe").
  - Service worker: cachés `barri-pwa-N` (subir N en cada release); **borrar solo cachés con ese prefijo**.
  - Claves de localStorage propias (`barri.v1`). **Nunca aconsejar "borrar datos del sitio"** (borraría el progreso de Lectori).
  - Ajustes > Perfil y sistema > "Diagnóstico de instalación" compara ids/alcances con la otra app.
- La app publicada es la raíz del repositorio (index.html, manifest.webmanifest, sw.js, iconos, fonts/): se actualiza con `python3 tools/publish.py`, nunca a mano.

## 3. Estructura
```
src/index.template.html   plantilla ({{CSS}} {{DATA_JS}} {{GAME_JS}} {{APP_JS}}); contiene <head> con favicon/apple-icon en data URI
src/css/styles.css        todo el CSS (secciones con /* ===== ... ===== */)
src/js/game.js            motor del juego de 4 pasos + arrastrar/tocar
src/js/app.js             pantallas, progreso, álbum, tutor, Excel, PWA, splash, diagnóstico
src/js/data.generated.js  referencia (lo regenera build.py desde el Excel; NO editar)
src/pwa/                  manifest.webmanifest, sw.js, iconos PNG (se copian a dist/)
src/assets/               logo.svg, mascot*.svg, icon.svg + ref/ (imágenes originales del usuario)
data/banco_problemas.xlsx banco de 297 problemas (279 con modelo; mundo 5 Retos con 18; IDs 01-24 por mundo y nivel, mundo 4 solo 01-21 útiles) = fuente de datos
tools/build.py            src + Excel -> dist/ (byte a byte reproducible). tools/map.py -> CODEMAP.md
tests/                    run_all.sh (node + Playwright/Chromium). CODEMAP.md = índice de código
dist/                     SALIDA lista para GitHub (no editar a mano)
```
Flujo: editar `src/` → `python3 tools/build.py` → `bash tests/run_all.sh` → entregar los archivos de `dist/` que cambien.
Requisitos: python3 + openpyxl; node + playwright global (`NODE_PATH=$(npm root -g)`), chromium en `/opt/pw-browsers`.

## 4. Arquitectura JS (nombres reales; ver CODEMAP.md para líneas)
Scripts globales (sin módulos). Orden: DATA → game.js → app.js.
- **Datos**: `DATA.problems[]`. `ORIG` = copia del banco original (app.js). Importar Excel sustituye `DATA.problems` (se guarda en `st.bank`).
- **Estado persistente `st`** (localStorage `barri.v1`): name, stars, solved{id:estrellas}, log[], days[], acc("casco|gafas|capa"), theme, set{dur,voice}, bank, bankFile. `DEF()`, `save()`.
- **Navegación**: `SC` (pantallas: home, learn, les, adv, album, nb, gate, tutor), `TB` (pestañas tutor: p,c,s), `go(pantalla,ctx)`, `show()`. Clicks por delegación con `data-go|data-play|data-act|data-tab|data-rev|data-l|data-g`.
- **Juego (game.js)** estado `S`: i, step(0 Leer,1 Dibujar,2 Calcular,3 Comprobar), fill{clave:valor}, sh{partes sombreadas}, db/dw/nd (modo dibujo), ops[], ans, errs/hints/em/eo/ea, done, on, sel, sk. Funciones: `startGame(list)`, `reset()`, `prefill()` (nivel 1), `render()`, `model()/fmodel()/dmodel()`, `slot()`, `chkM/chkF/chkD` (validar modelo), `chkO` (operación), `chkA` (respuesta), `place/slotTap/dropAt/endPtr` (táctil), `recover()`.
- Callbacks juego→app: `Game.done(r)` (registra intento y estrellas), `Game.exit()` (insignias nuevas → pantalla `nb`).
- Claves de `S.fill`: `"fila.segmento"` (p. ej. "0.1"), `"fila.t"` (total de fila), `"t"` (total global), `"g1"/"g2"` (fracciones).

## 5. Modelo de datos del problema
`{id:"M{w}-N{l}-{nn}", w:1-4, l:1-3, t:enunciado, rows:[{l:etiqueta, s:[valores|"?"|{v,g:1}], t?:total fila}], tot?:total, fr?:{d,k,g1?,g2?}, ans, tray:[fichas], ops:[números+signos], n:huecos operación, h:[pista1,pista2,pista3]}`
- El **tipo** sale del ID: mundo `w` y plantilla `t=floor((nn-1)/3)` (4 plantillas por mundo, 3 problemas por plantilla y nivel).
- Mundos: 1 Suma y resta (parte-todo), 2 Comparación, 3 Fracciones (barra en d partes iguales, se sombrean k), 4 Multiplicar/dividir (solo ≤6 bloques iguales; 18 filas del Excel quedan fuera).
- Excel (hoja "Problemas", columnas): A ID, B Mundo, C Nivel, D Edad, E Tipo, F Enunciado, G/H/I Dato1-3 (números), J Respuesta (se ignora; se recalcula), K Operación (texto), L Modelo (texto), M/N Pistas, O Error típico. `convert()` en build.py y `mkProb()` en app.js son la MISMA lógica (test `mkprob.js` lo comprueba).
- Etiquetas de barras: superior **"Total"**, inferior **"Partes"** (o nombres de niños en comparación). Evitar "Todo".

## 6. Reglas pedagógicas y de juego
- 4 pasos: Leer → Dibujar (modelo) → Calcular (operación con fichas) → Comprobar (respuesta con teclado). Estrellas: 3 si errs+pistas=0; ≤2 → 2; si no 1. Solo suman la 1.ª vez que se resuelve.
- Niveles por mundo: **N1 "Modelo casi hecho"** (todo prefijado salvo los "?"), **N2 "Completa el modelo"**, **N3 "Construye tú"** (2 fichas distractoras extra), **N4 "Dibuja tú"** (clona N2-N3 con id+"d", `draw:true`: añadir/quitar bloques con +/−, estirar con el asa, partes iguales en fracciones; se valida nº de bloques, valores y proporciones relativas, no el tamaño del "?").
- Orden de bloques dentro de una barra: libre (excepto el bloque punteado de diferencia). No se exige estimar tamaños; huecos de igual tamaño al construir, a escala al validar.
- Desbloqueo: nivel l se abre al resolver min(5, tamaño) del nivel l-1. **Modo tutor** (`cx.tutor`) lo abre todo.
- Total en barra superior del mismo ancho que las partes (1 fila); llave vertical a la derecha (2+ filas). En fracciones el "?" ocupa TODA la zona sombreada/resto; zonas sin bloque son transparentes (borde, sin relleno) hasta colocar la ficha.
- Insignias `BD` (9-10, bronce/plata/oro por umbrales) premian proceso (errores superados, pistas, constancia), sin rankings ni velocidad. Accesorios de la mascota por estrellas (gafas 30, capa 60).
- Repasar = problemas cuyo último intento tuvo errores. Racha tolerante.

## 7. Interacción táctil (lecciones aprendidas, NO romper)
- Todo con **Pointer Events** en document; `touch-action:none` en fichas, huecos y asas.
- Tocar ≠ arrastrar: umbral 10 px (14 px de recorrido final para contar como arrastre). Toque en ficha = seleccionar; toque en hueco = colocar la seleccionada o vaciar. Los huecos NO usan `click` (se hace en pointerup; evita dobles acciones).
- `pointercancel` termina el arrastre en la última posición. Un 2.º dedo se ignora si hay arrastre activo <3 s. `dr` se reinicia en cada pointerdown.
- El temporizador de la lección **no** debe repintar durante el juego (`scr="game"` en `startList`, comprobar `S.on`). `recover()` limpia estados colgados. No re-renderizar mientras se arrastra el asa (se actualiza el DOM directamente).
- Con `S.on` el handler de clicks de app.js se ignora salvo que falte el botón salir.

## 8. Diseño
- Paleta oscura: bg `#0F172A`, tarjetas `#1E293B`, bordes `#334155`, texto `#F8FAFC`, secundario `#94A3B8`, azul `#2563EB/#60A5FA`, **naranja principal `#F97316`** (acción destacada: texto oscuro encima), verde `#16A34A`, rojo `#EF4444` (Borrar sólido; Reiniciar contorno). Variables en `:root[data-theme="dark"]`; claro por defecto en `:root`.
- Fuentes: Fredoka (títulos), Nunito (texto), **Inter en la zona del tutor** (estética de Lectori: etiquetas MAYÚSCULAS con espaciado, tarjetas con icono, métricas en 3 columnas).
- Microcopia: plurales dinámicos (`pl(n,"día","días")`), nada de texto cortado (clamp/ellipsis), botones de formulario deshabilitados hasta haber texto válido, "¡Todo al día!" sin flecha cuando no hay repasos.
- **Mascota** (Bloquito): cuerpo morado `#6E2AD3` casi cuadrado, un ojo (blanco/iris `#1B1F5C`), sonrisa con lengua lila, bolita naranja `#F2993A` en la esquina, brazo izquierdo saludando (`.arm`), parpadeo (`.eyes`). SVG en `bot` (game.js) con marcadores `<!--cape-->` y `<!--gl-->` para accesorios; `mas(size)` en app.js.
- **Logo**: cabeza de la mascota sobre bloque azul marino `#13214F` con bolita naranja (igual que la mascota). `logo(s)` en app.js; iconos PNG con fondo a sangre. Referencias originales en `src/assets/ref/`.
- Animación de inicio (`splash()`): mascota cae, barras se construyen, "Barri" salta letra a letra (~3,3 s), se salta tocando; `?nosplash` la desactiva; respeta `prefers-reduced-motion`.
- Tamaños: tarjetas del inicio min 92-96 px; controles 44 px; modo compacto `.app.cmp` en juego/lección con botón de acción fijo (`.dock`).

## 9. PWA e instalación
- `sw.js`: red primero con copia en caché (los cambios llegan solos); fuentes de Google en caché-primero.
- "Instalar en este dispositivo" aparece si el navegador dispara `beforeinstallprompt`.
- Si "ya instalada": revisar `chrome://webapks` (Android), desinstalar copias antiguas, usar el diagnóstico de la app. Chrome cachea el manifest: probar en pestaña nueva.

## 10. Preferencias del usuario (respetar)
- Responder en **español**, **breve** y **por partes** cuando sea largo (se queda sin cuota rápido).
- Entregar **solo el/los archivos que cambian** (prefiere un único `index.html`; PWA añade manifest/sw/iconos solo si cambian). Le cuesta subir muchas carpetas/archivos a GitHub.
- Prefiere que el asistente **implemente y pruebe**, no que proponga. Diseño minimalista, tema oscuro, estética coherente con Lectori en la zona tutor.
- Valora: arrastrar bloques fiable, pantalla sin desplazar, textos legibles, accesos claros. No quiere botones que se camuflen ni textos cortados.

## 10b. Perfiles, aula y privacidad (v1.10, Parte 3)
- **Varios alumnos en un dispositivo**: `st` sigue siendo el alumno ACTIVO (todo el código previo funciona igual). Campos por alumno: `STU=[name,stars,solved,log,days,acc,notes]`. Los demás alumnos viven en `st.profs{id:snapshot}`; `st.cur` = id del activo. Funciones: `swStu(id)`, `addStu(nombre)`, `delStu(id)`, `snap()`, `roster()`, `asStu(obj,fn)` (ejecuta `fn` con `st` temporalmente sustituido: así `nextLv/streak/wk/review/comp` sirven para cualquier alumno). Los ajustes (tema, duración, voz, banco) son globales. Copias antiguas se migran solas (`cur:"p1"`).
- **Inicio**: si hay ≥2 alumnos, chips `.wc` (`data-pid`) para elegir quién juega (`whoSel()`).
- **Tutor** (4 pestañas: Progreso `p`, Aula `a`, Ajustes `c`, Perfil `s`). Aula = resumen de clase, "para reforzar en grupo", tarjeta por alumno, añadir alumno, CSV del aula, imprimir. Progreso añade **Competencias** (`comp()`: proceso = representar/plantear/calcular/autonomía + contenidos por mundo; últimos 12 problemas; En inicio <50, En proceso 50-74, Logrado 75-89, Destacado ≥90; ≥3 intentos, si no "Sin datos"), **Notas del tutor** (`st.notes`, autoguardado) y **Resumen para las familias** (`famTxt()`: copiar/compartir/.txt; tono positivo, sin comparar alumnos). Los niveles se muestran con texto, no solo color.
- **Privacidad (RGPD)**: sección en Perfil. Sin cuentas ni servidor; datos solo en localStorage; exportar JSON de un alumno (`expj`), eliminar alumno (`delp`), "borrar todo". Nombres se escapan con `esc()`. Pendiente conocido: las tipografías se cargan de Google Fonts (autoalojarlas eliminaría ese tráfico).
- Piloto: ver `PILOTO.md`.

## 10d. Adaptación a Lectori (v1.11, Lectori es la app base de diseño y funciones)
- **Diseño unificado** (final de styles.css): mismos tokens que Lectori (`--bg --card --tx --mu --ln --bd --soft`) con la paleta de Barri: acento morado `--ac #7C3AED` (texto `--acx`), naranja `--sun`/héroe, tarjetas planas con aro `--bd` (sin sombras 3D), tipografía Fredoka (`--fd`) y tema que **sigue al sistema** (claro por defecto; botón luna fuerza oscuro/claro; `st.theme` null = sistema). Los azules de datos (colores de mundos, fichas, insignias) se conservan; el azul de interfaz pasó a `var(--ac)`. `manifest.orientation:"any"` (antes bloqueaba el modo horizontal al instalar).
- **Copia con un toque** (`shareBk`): comparte `barri-copia-AAAA-MM-DD.json` con el menú de compartir (Drive); si no se puede, descarga; cancelar no anota. Aviso `bkBanner()` en Progreso/Aula si hay progreso y no hay copia o tiene ≥14 días (`localStorage['barri.bk']`). La copia es `{v:2,d,st}`. **Importación saneada**: `cleanAll/cleanStu` (todo campo nuevo de alumno o global hay que añadirlo ahí); acepta también copias antiguas (st plano). `bkState()` evita guardar el perfil virtual docente.
- **Perfil de uso** `st.rol` (`doc` por defecto / `fam`), en Perfil › Perfil de uso. Familias: sin competencias, notas, resumen, informe, CSV, banco de problemas ni modo docente; la pestaña Aula pasa a «Alumnos». Guarda de acciones en el manejador de clics (lista de `"csv","csva","print","xdl","xup","xreset","famcp","famsh","famtx"`).
- **Perfiles** (como Lectori): la inicial del encabezado (`.av`, `data-go="profiles"`) abre `SC.profiles` («¿Quién juega?»): botón **Modo Docente** (solo rol doc, degradado morado→naranja) junto a los alumnos, más «Nuevo perfil». Elegir (`data-pid`) cambia de perfil y vuelve al inicio; en modo docente la inicial es 🎓 y no hay estrellas. Ya no hay chips en el inicio. La «Zona del tutor» sigue en su botón del inicio (con operación).
- **Modo docente**: perfil virtual → `st.cur="md"`, alumno virtual en blanco; `Game.done` no guarda, mapa con todos los niveles abiertos, zona del tutor solo con Perfil; los alumnos reales siguen en `st.profs`. Salir = tocar el nombre de un alumno. `roster()` excluye `md`.
- Pendiente de adaptar desde Lectori: evaluación de nivel (diagnóstico inicial), modo apoyo tras 3 fallos, audios pregrabados (`audio/…` con voz sintética de reserva), PIN docente, autoalojar fuentes.

## 10e. v1.13 (parte lógica)
- **PIN** `st.pin` (4 cifras o ""), Ajustes › PIN (`pinSec`, acciones `setpin/delpin`). `gate()` pide PIN si existe (autoenvío a 4 cifras); «¿Olvidaste el PIN?» (`pinfg`) pide una multiplicación de 2×2 cifras que lo quita. `cx.next="md"` → la puerta lleva al Modo Docente (`gateOk`). Sin PIN, sigue la multiplicación. El PIN viaja en la copia (saneado en `cleanAll`).
- **Borrado total** solo en Ajustes › Avanzado (`advSec`), con confirmación y escribir «BORRAR». En Perfil solo «Reiniciar progreso» del alumno.
- **Selector libre**: en el mapa en modo tutor/docente cada nivel tiene «Elegir problema» (`psel`, `data-pp="w,l,k"` → `startList([pool(w,l)[k]])`).
- **Fichas por fase**: al dibujar, `trayD(p)` = números del enunciado + los que necesita el modelo + «?» (sin distractores cercanos a la respuesta; `startGame` ya no los añade). En Calcular, `p.ops` (+ fichas ①② en varias líneas).
- **Deshacer/Reiniciar** en el paso Dibujar de fracciones y «Dibuja tú» (`hist()` en cada `render`, pila `S.hs`, `S.h0` inicial; acciones `undo/rst`).
- **Operaciones en varias líneas**: si `p.n>3`, `NL(p)=(n-1)/2` líneas de 3 huecos (`o:3l..3l+2`), fichas ①② = resultado de líneas anteriores (`TK`). `chkOL` valida línea a línea (enteros ≥0, última = respuesta) y guarda `S.rv`. En el paso de respuesta se calcula línea a línea (`S.ln`, `S.lr`) y `remind(p)` muestra siempre la operación construida.
- **Sonido** `chime()` (Web Audio, 4 notas suaves) al acertar; `st.set.snd` (Ajustes › Audio).
- Tipo de problema por ID cíclico: `((NN-1)//3)%4` (build.py y `mkProb`), para poder ampliar a IDs 13-24.

- v1.13 (Sonnet): CSS de tablet (alto completo, zonas de soltar 68/60/52/44 px, CTA vs secundarios, fichas con agarre, burbuja 16-18 px; test fill.js). Banco ampliado con IDs 13-24 (tipo = ((NN-1)//3)%4): contextos y nombres variados, fracciones con denominadores 3,4,5,6,10 y numeradores distintos. Tras editar el xlsx con openpyxl, recalcular con LibreOffice (soffice --convert-to xlsx) para conservar valores cacheados.

- v1.13.1 (Opus): fichas sin brillo ni puntos (sombra original). Pizarra táctil `.spad` bajo el enunciado solo en tablet horizontal (pad() tras wrap2; trazos normalizados en S.pd, se borran al cambiar de problema; ojo: `.pad` es el teclado numérico del paso 3). Bloques iguales repetidos se agrupan en uno «apilado» + «×n veces» desde 5 (tablet) / 3 (móvil): xc(), xv(), xsync() copia el bloque 0 al resto antes de pintar/comprobar (también en dibujo libre si la fila espera bloques iguales). Fracciones: ancho de celda según pantalla. Test tests/pad.js.
- Reparto de modelos (todo el chat): Opus = lógica JS nueva y depuración difícil; Sonnet = CSS, contenido del banco, textos, tests rutinarios, versión y entrega.

## 10f. v1.14 (Singapur + diseño, Opus)
- Línea de estirar: `--bc` en `.blk` (color del bloque) y `:after` más oscuro con color-mix.
- Barras proporcionales al colocar: `wd()` en model(); hueco relleno = valor×k; `grow()` anima el ancho (FLIP) entre renders del mismo paso.
- Elegir modelo (niveles 2-3, no dibujo libre): `S.mc`, `kindOf()` (pt/cmp/eq/fr), `mkOpts()`, `mkCard()`, `pick()`.
- 1 parte = __ (fracciones): tras chkF, `S.uq` + teclado → `chkU()`; `S.unit` se muestra bajo la barra.
- Paso 4: `enter3()` estimación (nivel 2+, `estQ`) antes del teclado; tras acertar, frase respuesta (`frQ`, `unitW`) y `finish()` (estrellas, Game.done).
- Errores típicos: `S.mis` → `log.mis` ("tag*n", cleanLog lo conserva): mod, tp, oXY (signo), par, cal, uni, est, fra. Informe `misSec()` en Progreso.
- Mezcla: `mixList()` (niveles abiertos, alterna mundos), tarjeta en inicio (`data-mix`).
- Mundo 5 Retos (`WS`, WN/WC/EX): t0 suma y diferencia (Entre X y Y tienen…), t1 dar para igualar, t2 fracción del resto (c=2 → [x,?,?]); abre con nivel 2 de Comparación y Fracciones. build.py y mkProb iguales.
- Mapa (v1.14.1): `.wgrid` tarjetas de mundo (WI iconos, WD descripciones), `.wh` cabecera, `.lvr` filas de nivel con data-play. Inicio: `.hm .lc.hero` más grande.
- Proyector: pantalla `proj` (`pjState`, `pjDo`, teclas/clicker), problema del día; entrada en inicio Docente y Progreso del tutor.
- v1.14.4: grosores rebajados (no volver a 700-800); para ver fuentes reales en tests, interceptar fonts.googleapis con Fredoka/Nunito locales.
- v1.14.3: toque en ficha (paso 2) = primer hueco libre; pizarra blanca; `.hero.soft` en inicio docente; psel dentro de `.lvw`.
- Tests: tests/v114.js. Ojo: `.pad` = teclado numérico; la pizarra es `.spad`.

## Publicación
Desde el 13/11/2026 el repositorio `ilinper301-hue/Barri` contiene **fuente y app publicada** (GitHub Pages desde main, raíz). `dist/` no se sube (.gitignore). Tras pasar tests: `python3 tools/publish.py` copia `dist/` a la raíz; commit con la versión y `git push origin main` (el usuario quiere publicar directo en main). `.nojekyll` evita que GitHub procese los `.md` (CONTEXT.md contiene llaves dobles que rompían Jekyll). Reglas de trabajo resumidas en `CLAUDE.md`; plan de mejoras en `PLAN-BARRI.md`.

## 10g. v1.15 (apoyos y adaptación, Opus)
- Apoyos por alumno `st.ap={cp,nr,cb}` (en STU; `cleanAp`; Ajustes › «Apoyos de…»). cp/nr: w12 (mundos 1-2, por defecto) | all | off; cb: bool → `html[data-cb="1"]` (theme(), también en show()).
- Fase con objetos (CPA): `cpOn`, `cpCard` (grupos con emojis `EMO`, decenas >20, '?' discontinuo, huecos «−n» en grises), tocar grupo = contar (`cpCount`), «Convertir en barras» (`cpgo`, animación .morph). Niveles 1-2, sin dibujo libre ni fracciones ni Retos.
- Lectura en voz alta (`nrOn`): `txHTML` marca palabras (.w data-c) y añade emoji tras sustantivos; `sayHL` resalta con onboundary (o por tiempo); lee al empezar y cada mensaje nuevo (`nrPost`, botón 🔊 `.bsp`, `rmsg`); iconos en botones.
- Daltonismo: `col()` usa Okabe-Ito con cb; `pat()`/`data-p` + tramas CSS; huecos malos en punteado naranja; ✓ en pasos hechos. Inline usa background-color (no shorthand) para no tapar la trama.
- Fuentes alojadas: src/fonts (woff recortadas: Fredoka 400-600, Nunito 400-700, Inter 400/500/600) → dist/fonts; @font-face al inicio de styles.css; SW las precachea. Sin Google Fonts. Regenerar con fontTools (subset + instancer).
- Dificultad adaptativa: `dif()`, `ptype()`, `skill()`; `play()` ordena por dificultad y arranca según historial; `adapt()` (gancho en «next» de game.js) sube tras 2 limpios / baja a uno del mismo tipo tras ≥3 errores o ≥2 pistas; `endExtra()` propone subir de nivel o ver la lección (`data-a="adp"` → `adpGo`). Solo en partidas de nivel (ADP=null en Mezcla/repaso).
- Tests: tests/v115.js. run_all copia dist con -r (carpeta fonts).

## 10h. v1.16 (Opus)
- Juego: tocar a Bloquito (.bub svg) repite el mensaje (sin botón 🔊); altavoz discreto `.txr` dentro del enunciado; pasos hechos = botones `[data-st]` → `back(i)`; transición objetos→barras en 2 fases (.morph → .out → `.card.fin`); resultados intermedios con letras `TK=["a","b","c"]` (clase `.var`).
- Barras: `RW/RS` en model(): ancho por valor coherente (mismo valor = mismo ancho) y filas con igual total se igualan estirando su bloque mayor (valores convertidos a número: antes en nivel 1 se sumaban como texto). Fracciones: líneas en `.reg .rl .slot` con `--cw`. Sombras de brazos con clipPath `#bsl/#bsr`. Selector del mapa con `--wc` en `.lvw`.
- PIN obligatorio (como Lectori): sin PIN, la puerta pide crearlo dos veces; `UNL` evita pedirlo 5 min; «¿Olvidaste el PIN?» = multiplicación difícil → crear uno nuevo. Ajustes: solo «Cambiar PIN».
- Zona del tutor estilo Lectori: Inter, bordes 1px `--tzb`, pestañas subrayadas, Progreso en `.tzg` (2 columnas ≥860px) + «Más detalles» en `details.acc` (competencias, errores por fase, álbum, notas, familias).
- Banco: mundos 1-4 regenerados con generador (scratchpad bankgen.py; semilla fija): nombres, contextos, objetos y números variados, sin pares repetidos por nivel; W4 con ≤6 bloques → 293 problemas con modelo de 302 filas.
- Mundo 6 Extremo (`WS` incluye 6; abierto siempre; fuera de Mezcla): 5 problemas nivel 3 con **modelo libre** en la columna «Modelo» (`Ana: ?; Bea: ?, 15; TOTAL: 155`, fila con total `X: 8, ? = 20`), respuesta en «Respuesta» y operaciones en «Operación» (`15 + 15 = a; a + 20 = b; …`) → n = 2·líneas+1 y fichas = números de las operaciones. build.py y mkProb iguales.
- Tests: tests/v116.js; tests adaptados al PIN nuevo y a valores dinámicos del banco.

## 10i. v1.17 (Opus)
- Modo apoyo (`apoCheck` en render; `st.ap.apo` on/off): 3 fallos en el mismo paso → paso 1 coloca todo menos el «?» (`apo1`), paso 2 da la unidad o la operación y el principio (`apo2`), paso 3 descompone el cálculo (`apo3`). Cuenta como pista (`hints`) y registra `apo`.
- Retos de pensar (`P[i].sp`): `spItem(base,kind)` en app.js: «inv» (¿qué problema encaja con este modelo?), «invop» (¿cuál se resuelve con esta operación?) y «make» (inventar con piezas quién/qué/qué pasa/pregunta; solo mundos 1-2). Distractores con los mismos números y otra estructura (`story`, `KEYS`, `baseAB`). `play()` añade uno al final (mundos 1, 2, 4; niveles 1-3). Render propio `spRender`; `Game.done` con `sp` no cuenta como resuelto.
- Evaluación inicial (`startEval`, `evalNext` enganchado en «next» antes de terminar, `EVSEQ`): 2 fallos seguidos terminan; `evalApply` guarda `st.place={mundo:nivel}` (STU, `cleanPl`); `open()` abre l ≤ place y `nextLv()` salta los niveles inferiores. Herramienta en el tutor (`data-act="eval"`).
- Datos sobrantes: filas con ID ≥ 25 (mundos 1-4; tipo por la regla habitual) → `xd` = números del enunciado que no están en el modelo; van a fichas y operaciones (build.py y mkProb iguales, mismo orden de campos). Aviso en niveles 1-2; `estQ` los ignora; registro `sob`. 37 problemas (generador scratchpad bankx.py).
- Tests: tests/v117.js.

## 10j. v1.18 cuenta docente (Opus)
- Proyecto real: mis-apps-educativas (config incrustada en FB_CFG, colección FB_COL="barri"; Lectori usará "lectori"). Cuenta visible también en Familias.
- Firebase opcional (Auth Google + Firestore), SDK compat 10.12.2 cargado de gstatic solo al usarlo. Config: FB_CFG (incrustada, ahora null) o pegada en Tutor › Perfil › Cuenta docente (localStorage "barri.fb").
- Firestore: barri/{uid} {meta,ts} y barri/{uid}/stu/{id} {d,mt}. Reglas: match /{app}/{uid}/{document=**} con request.auth.uid==uid.
- save() sube st.mt y programa syncSoon (15 s); gsave() sube st.gmt (ajustes globales). Borrados → st.del (lápidas).
- 1ª sync por dispositivo ("barri.sync.uid"): remoto vacío→sube; local vacío→baja; si no, pantalla propia (ver 10k). Después, fusión por campos (10k).
- v1.18.2: pantalla "wel" la 1ª vez (sin datos y sin flag barri.wel): Entrar con Google / Empezar sin cuenta. Los tests con ?nosplash no la ven (salvo ?nosplash&wel). Test wel.js.
- Test: tests/sync.js con Firebase simulado (3 dispositivos). Firebase real no probado en sandbox.

## 10k. v1.28 · Fase 1 de PLAN-BARRI: que no se pierda nada (Opus)
- **Guardado:** saveRaw() ya no falla en silencio: SVERR + aviso #sverr (fuera de #app, role=alert; «Ver» → PIN → Ajustes › Espacio). Desaparece al volver a guardar bien.
- **Espacio:** stoSec() en Ajustes (tras Copias): barra Barri (claves barri.*) / otras apps del dominio / libre sobre ~5 MB. Nunca aconsejar «borrar datos del sitio».
- **Fusión por campos (mergeStu):** progreso = historial unido por (ts,id), resueltos por máximo, estrellas = repetición de las partidas que faltan (replay, simétrico con max para converger); días unidos. Campos FT (name, acc, notes, ap, place, dur) con fecha propia en st.ft, que pone stampFt() al guardar comparando con lo último guardado (ftBase() tras sincronizar). Reiniciar progreso pone st.rs: el reinicio más reciente manda y solo se suman partidas posteriores.
- **Incremental:** cada doc lleva ts = serverTimestamp(); se consulta where("ts",">",cursor). barri.sync.c = {u,c (cursor ms),f (última lectura completa)}; lectura completa al cambiar de cuenta, al decidir, con «Sincronizar ahora» y cada 24 h. barri.sync.base = {h:{id:huella}} de lo que ya está en la nube: solo se sube lo que cambió. Docs sin ts (versiones viejas) se reescriben una vez. Meta solo se escribe si cambia.
- **Primera sincronización con datos en los dos lados:** SYNC.ask (sin tocar nada) → pantalla SC.syncask, solo tras el PIN (gateOk o desde la Zona del tutor). Juntar por defecto (+ «Unir los que se llaman igual», nameMatch); un mismo id con otro nombre recibe id nuevo (todos empiezan en p1). «Solo la cuenta» y «solo este dispositivo» piden doble toque.
- Test: tests/sync2.js (Firebase simulado con hora de servidor y consultas; cuenta lecturas).

## 10k. v1.19 Zona del tutor en listas (estilo Lectori 3.23, Opus)
- Componentes en app.js: LH (cabecera mayúsculas), LST (lista; en Barri LS ya es el estado de la lección), ROW({i,av,t,s,v,c,on,d,nc,k}) (en Barri RW ya existe en game.js), NOTE, SEL(id,ch,opciones,actual) = desplegable con guardado al cambiar (data-ch → doAct). `on` son atributos data-* (data-act, data-go, data-sub, data-tab, data-rev).
- Pestañas: tzP (progreso: «Nivel X de Y» de LADDER(), 4 cifras .pst, semana .pwk, «Le cuesta» .pal solo con datos, listas Diagnóstico/Seguimiento/Indicadores; Familias: Práctica/Indicadores), tzA (aula), tzC (ajustes), tzS (Cuenta, Alumno, Aula, Copias, Seguridad y uso, Sistema).
- Subpantallas de Progreso con cx.sub: notes, fam, comp, mis (.lmis), album. data-sub="" vuelve. Cambiar de pestaña las cierra.
- Destructivas (reset, delp, wipe, xreset): ROW d:1 → clase .ldg (rojo) + data-sure: 1ª pulsación «¿Seguro? Pulsa otra vez» (4 s), 2ª ejecuta. Sin confirm(). El borrado total pasó de Ajustes › Avanzado a Perfil › Seguridad y uso.
- Clases evitadas por chocar con Barri: .lc (tarjetas de Aprender) → .lcx; .dg (pre del diagnóstico) → .ldg; .mis → .lmis. Todo el contenido de la pestaña va en .tzw (ocupa todo el ancho de la rejilla tablet); .tzb = 2 columnas en tablet horizontal.
- Test: tests/v119.js.
- v1.20 (como Lectori 3.24/3.25): 3 pestañas TB={p:tzP,u:tzU,c:tzC}. Progreso = lo que hace el alumno (resumen, «Para reforzar» = .pal.palr + fila de repasar, Diagnóstico, Seguimiento, Indicadores). Alumno = ese niño (nombre, exportar, punto de partida por mundo `pl1..pl5` → st.place, apoyos con vista previa de tramas #cbpv, tiempo de uso al día `st.dur` por alumno (null = st.set.dur; 0 = sin límite; durOf()), Gestión en rojo). Ajustes = toda la app (Cuenta, Copias, Alumnos → subpantalla «aula», Sonido, Pantalla/Tema `thm`, Banco (Docente), Seguridad y uso con borrado total, Sistema). Modo Docente: Clase · Ajustes.
- Cabecera única .tzh: avatar, nombre, «Zona del tutor · Cambiar de alumno» (si hay >1 alumno; en MD «Cambiar de perfil») y un solo ✕. Subpantallas: «← Zona del tutor» y sin pestañas. Tabs antiguas: "a" → c+sub aula, "s" → c.
- Clase .pin de Barri (puntos del PIN) choca: el aviso usa .palr.

## 10l. v1.21 (inicio como Lectori)
- Sin diagnóstico de instalación (diag/runDiag/readMan eliminados, tests/diag.js fuera de run_all) ni fila «Instalada». Sistema: Versión, Instalar (solo si hay INST), Buscar actualización, Actualizar ahora.
- Fredoka de Lectori (variable 400-700) en fonts/fredoka.woff; la antigua (400-600) queda como fonts/fredoka-ext.woff solo para U+0131,U+0152-0153,U+2122,U+2212 (el «−»).
- Inicio: home() = .hd + .hmc(.hml: saludo, aviso, héroe | .hmr: [Proyectar MD], [Repasar si hay pendientes], Mezcla, Aprender, álbum/mapa, Zona del tutor). Tarjetas sin flecha. Medidas de Lectori: héroe 92 px r22, tarjetas 80 px r22, álbum/mapa 56 px r18, tutor 48 px r16, títulos Fredoka 700, subtítulos Fredoka 400. Bloque CSS «v1.21» con prefijo #app. Tablet horizontal: 2 columnas centradas en vertical, héroe bajo el saludo.

## 10m. v1.22 limpieza CSS
- styles.css 79→66 KB: reglas sin cobertura en toda la batería y con clases que ya no genera el código, más restos conocidos del tutor/inicio antiguos; y declaraciones pisadas por la misma regla posterior (mismo selector y @media). Comparación visual píxel a píxel en 20 pantallas × 4 configuraciones: idéntica.
- Herramientas en el scratchpad de la sesión (no en el repo): covhook.js (NODE_OPTIONS=--require, cobertura CSS de cada página de los tests), cssan.py, dead2.py, clean.py, vreg.js (regresión visual).
- profiles.js se ejecuta por HTTP (localhost:8766/barri/) en run_all: el fallo «persistencia tras recargar» era de file://.

## 10n. v1.23 pantallas del niño como Lectori
- ih(): solo «⌂ Inicio» (o «← Aprender»), sin el ✕ duplicado. Iconos nuevos en IO: home, back.
- Capa CSS «v1.23» (#app): Fredoka 700/400, tarjetas r22 borde 2px sin sombra, botones planos r16, pastillas de fase redondas, estrella en pastilla blanca. Aprender: icono y color de cada mundo (lc clase "lw", data-wi).

## 10o. v1.24 mundo 7 «Avanzado» (5.º y 6.º)
- WS=[1,2,3,4,5,7,6]; WN/WC/WI/WD/EX con clave 7. Se abre con Retos (open(5,2)); nivel 3 tras need(7,2). 24 problemas M7-N2-01..12 (antes y después, fracción del resto) y M7-N3-01..12 (razones, porcentajes) con el modelo libre de Extremo (mkProb/convert: w>=6).
- Juego (game.js): en el mundo 7 no se agrupan bloques iguales (×n veces) y los anchos se ajustan al espacio real (W7, av7, m46 y reescalado de RW) para que cada fila quepa en una línea de 340 a 1180 px. Test: v124.js y w7layout.js.
- Al diseñar problemas: que la respuesta no aparezca como número del modelo (lo comprueba v113) y como mucho 4 pasos (letras a, b, c).

## 10p. v1.25 fichas imprimibles
- Pantalla SC.fic (ficScreen): estado FIC {w,l,n,sol,seed}; ficPick() baraja con semilla; ficBars(p,sol) dibuja el modelo en HTML (filas proporcionales, fracciones con celdas); ficProb/ficSol. Niveles 1-2: modelo para completar (nivel 1 con datos); 3-4: recuadro para dibujar. Soluciones en hoja aparte (break-before:page).
- Se abre desde Tutor › Progreso: Seguimiento (Docente) o Práctica (Familias), data-act="fic" (empieza en el nivel actual del alumno). Selectores data-ch="fic". CSS «v1.25» con @media print (A4, 14 mm, oculta .noprint). Test: fic.js.

## 10q. v1.26 problemas más grandes
- Capa CSS «v1.26»: paso «Leer» (data-cols="1") con enunciado 1.3rem en móvil y clamp(1.7rem…2.5rem) en tablet; en tablet (min-width 700 y min-height 560) enunciado clamp(1.25rem…1.6rem) y burbuja, pastillas, etiquetas, botones, fichas y teclado más grandes.
- Los problemas de varios pasos (Extremo, Avanzado) ya desbordaban a 1000×667 en el paso de calcular (≈80-130 px de scroll); con el cambio, unos 6-12 px más.

## 10r. v1.27
- manifest theme_color = #F4F0FB (antes morado: Android pintaba de morado la barra de navegación). tcol() (en theme() y al final de show()) pone una sola meta theme-color con el fondo real de la pantalla; se actualiza al cambiar el tema del sistema.
- Inicio en Modo Docente: héroe naranja normal (sin «soft», que dejaba la letra oscura sobre fondo oscuro), sin la fila álbum/mapa repetida; en su lugar «Fichas para imprimir». La ficha vuelve a donde se abrió (FIC.from), para no saltarse el PIN.

## 10c. Modo tablet / horizontal
- `@media (orientation:landscape) and (min-width:700px)` (final de styles.css). `show()` pone `#app[data-sc=pantalla]`; el juego pone `data-sc="game"` y `wrap2()` (game.js) reparte el DOM en `.gl` (enunciado + mascota) y `.gr2` (modelo, fichas, teclado, botones) solo en horizontal; `data-cols="1"` en el paso Leer. Un cambio de orientación re-renderiza (`two()` change). Inicio en 2 columnas, tutor en rejilla de 2, resto centrado a 760 px. Sin desbordes en 1024×768, 1180×820, 1280×800; en 960×540 y móviles apaisados puede haber algo de scroll vertical.

## 11. Estado / historial resumido (v1.10.0, oct 2026)
Hecho: 4 mundos (126 problemas), 4 niveles (incl. dibujo), lecciones animadas, álbum+insignias, zona tutor (progreso, config, perfil/sistema, informe imprimible, CSV, copia de seguridad), importar/exportar Excel, PWA instalable offline, splash, logo y mascota nuevos, diagnóstico de instalación, tema claro/oscuro.
Verificación pendiente por el usuario: instalación en su móvil con el id nuevo (ver sección 2); rendimiento de la animación y arrastre en su dispositivo.

## 12. Pendiente / roadmap (propuestas ya dadas)
Parte 1 entregada (feedback explicativo sobre barras, evaluar proceso, dificultad adaptativa, problemas de dos pasos/datos sobrantes/inverso, fase de objetos concretos). **Parte 2** (accesibilidad: daltonismo con patrones, lectura palabra a palabra, fuente dislexia, modo sin lectura; motivación: retos cortos, mini-historias, cierres de sesión) **sin entregar**. **Parte 3** entregada en v1.10.0 (perfiles, aula, competencias, notas, resumen familias, privacidad, guía de piloto) junto con el modo tablet. Pendiente de Parte 3: autoalojar fuentes; sincronizar entre dispositivos (no hay servidor).
Hecho en v1.14: barras proporcionales, Mezcla, 1 parte, elegir modelo, estimar y frase respuesta, Retos, informe de errores típicos, proyector. Otros: bloque repetido ×n (mundo 4 nivel 3 solo 2 problemas), llave vertical en comparación con total de fila. (Resuelto en 1.10.1: anchos <350 px en filas con total.)

## 13. Protocolo de ahorro de tokens (el asistente DEBE seguirlo)
1. Empieza leyendo solo CONTEXT.md y CODEMAP.md. **No abras `dist/index.html`, `data.generated.js` ni el Excel.**
2. Localiza con `grep -n` / `sed -n 'a,bp' | cut -c1-200`; edita `src/` con parches mínimos (python `str.replace` con `assert` de unicidad o `str_replace`). Nunca reimprimas archivos enteros.
3. Compila y prueba con scripts; saca conclusiones de **números** (consola) antes que de capturas. Si hace falta ver algo: una sola captura recortada o un collage de varias.
4. No re-ejecutes toda la batería tras cambios de CSS menores: usa el test afectado (`layout.js`, `nav.js`, `touch.js`…). `run_all.sh` solo antes de entregar.
5. Una publicación/entrega al final de cada bloque de cambios, no tras cada microajuste. Entrega solo archivos modificados.
6. Respuestas cortas: qué cambió, cómo se comprobó, límites. Sin repetir listas ya dadas. Si es largo, por partes.
7. Si el usuario manda varias peticiones, agrúpalas en un único parche y una única compilación.
8. Mantén este documento y CODEMAP.md actualizados (`python3 tools/map.py`) al cambiar estructura.

## 14. Protocolo anti-cortes (el usuario se queda sin cuota a mitad de tareas)
El usuario no puede evitar escribir "Continúa" cuando te cortan. Hazlo barato:
1. **Primero ESTADO.md.** Al recibir "Continúa" o empezar: léelo, retoma desde el primer paso sin marcar. No repitas ni resumas lo hecho.
2. **Planifica en pasos pequeños** (`ck.py --tarea`) y marca cada uno al acabarlo (`ck.py --paso N`). Un corte nunca debe dejar trabajo sin registrar.
3. **Cada paso deja el proyecto compilable.** Aplica cambios con un único script de parches con `assert` (todo o nada); no dejes `src/` a medias. `dist/` siempre válido.
4. **Entrega temprano:** en cuanto el build y el test afectado pasen, haz `present_files` de lo que cambió y da 2 líneas de estado. El pulido opcional (capturas extra, revisiones) va después.
5. **El resumen final, corto, se escribe en cuanto lo esencial está entregado**; no lo dejes para tras comprobaciones opcionales.
6. Orden de prioridad dentro de cada tarea: lo que el usuario pidió → verificación mínima → entrega → extras.
7. Si la tarea es larga, dilo y propón partes (Parte 1/2/3) y entrega cada una completa.
