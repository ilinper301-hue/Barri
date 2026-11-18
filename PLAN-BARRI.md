# Plan de Barri: análisis y fases

Análisis hecho el 2026-11-13 sobre la versión **1.27.0** publicada en GitHub (`index.html` compilado, commit `1bbf56c`, caché `barri-pwa-34`): lectura del código y capturas reales con Chrome a 390 × 800 (claro y oscuro) y 1180 × 820 (tableta horizontal), recorriendo inicio, mapa, juego (mundos 1, 2, 3, 5 y 7), álbum, perfiles y Zona del tutor.

El diagnóstico se hizo sobre el compilado, antes de tener el código fuente. Las pruebas (`tests/`) y el banco en Excel no se han revisado a fondo: cada fase debe leer primero las pruebas que le afecten.

Cada fase es un chat independiente. Al terminar una fase: márcala aquí como hecha y resume en `ESTADO.md`.

## 1. Diagnóstico

### A. Sistema y código

**Cómo está hecha.** Un `index.html` de 459 KB: banco de problemas (145 KB), el Excel del banco incrustado en base64 (77 KB), CSS (75 KB) y unas 230 funciones de JavaScript. Estado global `st` en `localStorage` (`barri.v1`); cada cambio repinta `#app` entero. Sin errores de consola en todo el recorrido.

**Lo que está bien y no hay que tocar:** saneado de datos (`cleanStu`/`cleanAll`), Pointer Events con «tocar no es arrastrar», recuperación ante errores (`recover`), service worker que solo borra `barri-pwa-*`, fuentes propias, sin desbordes horizontales, contraste correcto en el inicio, 25 grupos de pruebas que pasan.

**Riesgos, de mayor a menor:**

1. ~~**El código fuente no está en GitHub.**~~ Resuelto en la fase 0.
2. ~~**Primera sincronización con `confirm()`.**~~ Resuelto en la fase 1. «Aceptar» sustituye los datos del dispositivo y «Cancelar» sustituye **y borra** los de la cuenta (los alumnos que no estén en ese dispositivo se eliminan de la nube). Un toque equivocado en una tableta con algo de juego local puede borrar la clase.
3. **Fusión «gana el último, entero».** Si un alumno juega en una tableta y a la vez se editan sus notas o apoyos en otro dispositivo, se pierde uno de los dos cambios.
4. **Guardado que falla en silencio.** `saveRaw()` ignora el error. Medido: 30 alumnos con historial lleno ocupan unos 2 millones de caracteres, de un límite de unos 5 millones **compartido con Lectori, Tabula, Charta, Calculi y Fori** (mismo dominio). Si se llena, el progreso deja de guardarse sin avisar.
5. **Cada sincronización lee todos los alumnos.** Tras cada problema resuelto (espera de 15 s) se descargan todos los documentos de la clase. Con 25 tabletas en la misma cuenta son miles de lecturas por sesión, de una cuota gratuita compartida con las otras apps.
6. **Sin conexión mala = espera.** El service worker pide siempre a la red primero y sin tiempo límite: con wifi de centro lenta la app tarda en abrir aunque esté guardada. Queda código muerto de fuentes de Google.
7. **Estado por «intercambio».** Los datos del alumno activo viven en la raíz de `st` y se intercambian con `st.profs` al cambiar de alumno (`stash`, `swStu`, `asStu`). Funciona, pero es frágil: cada función nueva tiene que acordarse de ello.
8. Menores: `Function("return …")` para calcular la operación (validado, pero sustituible por 10 líneas); los datos no se sanean al cargar, solo al importar; el README dice «7 mundos» con Extremo y las instrucciones del proyecto listan «Pasos múltiples»; `ESTADO.md` y partes de `CONTEXT.md` describen versiones antiguas (1.12–1.13).

### B. Diseño e interfaz

1. **Controles por debajo de 44 px** (regla del proyecto): pasos «1 Leer… 4 Comprobar» (21 px de alto y sirven para volver atrás), altavoz del enunciado (34 px, el más importante en 1.º), ✕ de salir (38), pestañas del tutor (41), herramientas de la pizarra (40), «Guardar copia» (34), huecos de operación en varios pasos (42).
2. **Color con demasiados significados.** La acción principal es naranja en el inicio y verde en el juego; el verde es a la vez «paso hecho», «botón principal», color de barra y color del mundo 1; el morado es marca y color de barra. 64 colores escritos a mano frente a 19 variables.
3. **Hoja de estilos por capas.** 18 tamaños de letra, 14 radios, 44 `!important`, capas «por versión» que pisan a las anteriores y tres familias (Fredoka, Nunito, Inter; unos 177 KB).
4. **Dos lenguajes visuales.** Zona del tutor en listas (estilo Lectori); inicio, mapa, aprender y álbum siguen en tarjetas con borde grueso.
5. **Bloquito cambia de sitio en cada paso** y en Comprobar queda bajo el teclado. Su mensaje es la única retroalimentación y no se anuncia a lectores de pantalla (no hay `aria-live` ni estilo de foco visible).
6. **Tableta horizontal desaprovechada.** Las barras mantienen tamaño de móvil dentro de una tarjeta enorme; la pizarra vacía ocupa media pantalla aunque no se use; los pasos siguen diminutos. Sigue pendiente compactar Calcular en varios pasos.
7. **Mapa:** «0 de 140» en el mundo frente a «0 de 28» en el nivel sin explicar la diferencia; «Bloqueado» sin decir cómo se abre; siete mundos y cuatro niveles en la misma pantalla.
8. **Estados vacíos:** la gráfica semanal sin datos son siete rayas; el álbum sin insignias no invita a nada.

## 2. Fases

### Fase 0 · El código, a salvo — ✅ **hecha el 2026-11-13**
El repositorio contiene ya `src/`, `tools/`, `tests/`, `data/` y la documentación. Comprobado: compilar desde el repositorio da byte a byte el `index.html` publicado, y pasan los 25 grupos de pruebas. Nuevo: `tools/publish.py` (copia `dist/` a la raíz), `CLAUDE.md` (reglas de trabajo), `.nojekyll` y `.gitignore`. La app publicada no cambia (sigue en 1.27.0). Decisión D1: código en el mismo repositorio público.

### Fase 1 · Que no se pierda nada — ✅ **hecha el 2026-11-18 (v1.28.0)**
Aviso visible si falla el guardado y medidor de espacio en Ajustes. Sustituir el `confirm()` por una pantalla propia, tras el PIN, con «Juntar» por defecto. Fusión por campos (historial por fecha, resueltos por máximo, notas y apoyos por su propia fecha). Sincronizar leyendo solo lo cambiado desde la última vez. Pruebas de cada caso.
Hecho: aviso #sverr y medidor en Ajustes; pantalla «Datos en tu cuenta» tras el PIN (Juntar, unir por nombre, ids «p1» que chocan); fusión por campos con reinicio; lectura incremental por hora del servidor (en reposo, 1 lectura en vez de todos los alumnos); `tests/sync2.js`. Detalle en CONTEXT.md §10k. Riesgos 2-5 del diagnóstico resueltos.

### Fase 2 · Dedos y lectores de pantalla — ✅ **hecha el 2026-11-18 (v1.29.0)**
Todos los controles a 44 px o más (lista en B.1), `aria-live` en el mensaje de Bloquito, foco visible. Prueba automática que mida los tamaños en cada pantalla.

### Fase 3 · Un solo sistema de diseño — ✅ **hecha el 2026-11-18 (v1.30.0)**
Variables para color, tamaño de letra, radio y espacio; aplanar las capas por versión y quitar `!important`. Un color por significado: naranja = acción principal, verde = solo acierto, morado = marca; paleta de barras separada. Decidir si Nunito se queda. Capturas antes y después en las cuatro combinaciones (móvil/tableta, claro/oscuro).

### Fase 4 · Pantalla de juego — *Opus, esfuerzo alto* · depende de 3
Bloquito en un sitio fijo y siempre visible. En tableta: barras que crecen con el ancho, pizarra plegable, Calcular compacto en varios pasos.

### Fase 5 · Inicio, mapa y álbum en listas — *Sonnet, esfuerzo medio* · depende de 3
Mismo lenguaje que Lectori y la Zona del tutor, con los colores de Barri. Contadores coherentes, motivo del bloqueo en cada mundo, estados vacíos con sentido.

### Fase 6 · Abrir rápido y diagnóstico — *Sonnet, esfuerzo medio*
Sacar del `index.html` el Excel incrustado (y, si compensa, el banco) a archivos guardados por el service worker. Abrir desde la copia guardada y avisar cuando haya versión nueva. Quitar `Function()`. Panel «Diagnóstico» en Ajustes: versión, caché, espacio usado y últimos errores (útil al trabajar solo desde el móvil).

### Fase 7 (opcional) · Estado por alumno sin intercambio — *Opus, esfuerzo alto*
`st.alumnos[id]` con un puntero al activo y migración automática de `barri.v1`. Solo si las fases 1 y 4 dejan ver que el intercambio estorba.

## 3. Decisiones que te tocan

- **D1.** ✅ Código fuente en el mismo repositorio público.
- **D2.** ¿Inicio y mapa del alumno pasan a listas como Lectori, o el lado del niño conserva tarjetas grandes?
- **D3.** ¿Acción principal naranja en toda la app (verde solo para acierto)?

## 4. Cómo pedir cada fase

En un chat nuevo del proyecto, con el modelo y esfuerzo indicados: «Haz la fase N de PLAN-BARRI.md». El código se clona de GitHub; ya no hace falta adjuntar el ZIP.
