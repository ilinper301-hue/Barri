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
2. ~~**Primera sincronización con `confirm()`.**~~ Resuelto en la fase 1.
3. ~~**Fusión «gana el último, entero».**~~ Resuelto en la fase 1.
4. ~~**Guardado que falla en silencio.**~~ Resuelto en la fase 1.
5. ~~**Cada sincronización lee todos los alumnos.**~~ Resuelto en la fase 1.
6. **Sin conexión mala = espera.** El service worker pide siempre a la red primero y sin tiempo límite: con wifi de centro lenta la app tarda en abrir aunque esté guardada. Queda código muerto de fuentes de Google.
7. **Estado por «intercambio».** Los datos del alumno activo viven en la raíz de `st` y se intercambian con `st.profs` al cambiar de alumno (`stash`, `swStu`, `asStu`). Funciona, pero es frágil: cada función nueva tiene que acordarse de ello.
8. Menores: `Function("return …")` para calcular la operación (validado, pero sustituible por 10 líneas); los datos no se sanean al cargar, solo al importar; el README dice «7 mundos» con Extremo y las instrucciones del proyecto listan «Pasos múltiples»; `ESTADO.md` y partes de `CONTEXT.md` describen versiones antiguas (1.12–1.13).

### B. Diseño e interfaz

1. ~~**Controles por debajo de 44 px**~~ Resuelto en la fase 2 (v1.29.0); lo vigila `tests/tap44.js`.
2. ~~**Color con demasiados significados.**~~ Resuelto en la fase 3 (v1.30.0).
3. ~~**Hoja de estilos por capas.**~~ Parcialmente resuelto en la fase 3: escalas de radio y letra en variables, `!important` de 45 a 7 líneas. Las capas «por versión» siguen en el archivo (sin cambio visual).
4. **Dos lenguajes visuales.** Zona del tutor en listas (estilo Lectori); inicio, mapa, aprender y álbum siguen en tarjetas con borde grueso.
5. ~~**Bloquito cambia de sitio en cada paso** y en Comprobar queda bajo el teclado.~~ Resuelto en la fase 4 (v1.31.0). ~~Su mensaje no se anuncia a lectores de pantalla~~ (resuelto en la fase 2).
6. ~~**Tableta horizontal desaprovechada.**~~ Resuelto en la fase 4 (v1.31.0). Queda algo de scroll a 844 × 390 en problemas de 3-4 líneas de operaciones (máx. 65 px, antes 333).
7. **Mapa:** «0 de 140» en el mundo frente a «0 de 28» en el nivel sin explicar la diferencia; «Bloqueado» sin decir cómo se abre; siete mundos y cuatro niveles en la misma pantalla.
8. **Estados vacíos:** la gráfica semanal sin datos son siete rayas; el álbum sin insignias no invita a nada.

## 2. Fases

### Fase 0 · El código, a salvo — ✅ **hecha el 2026-11-13**
El repositorio contiene ya `src/`, `tools/`, `tests/`, `data/` y la documentación. Comprobado: compilar desde el repositorio da byte a byte el `index.html` publicado, y pasan los 25 grupos de pruebas. Nuevo: `tools/publish.py` (copia `dist/` a la raíz), `CLAUDE.md` (reglas de trabajo), `.nojekyll` y `.gitignore`. Decisión D1: código en el mismo repositorio público.

### Fase 1 · Que no se pierda nada — ✅ **hecha el 2026-11-18 (v1.28.0)**
Aviso visible si falla el guardado y medidor de espacio en Ajustes. Pantalla «Datos en tu cuenta» tras el PIN (Juntar, unir por nombre, ids «p1» que chocan). Fusión por campos con reinicio. Lectura incremental por hora del servidor (en reposo, 1 lectura en vez de todos los alumnos). `tests/sync2.js`. Detalle en CONTEXT.md §10k.

### Fase 2 · Dedos y lectores de pantalla — ✅ **hecha el 2026-11-18 (v1.29.0)**
Todos los controles táctiles miden 44 px o más; `role="status" aria-live="polite"` en el mensaje de Bloquito y foco visible naranja. `tests/tap44.js` mide los controles en 390 y 1180 px. Detalle en CONTEXT.md §10s.

### Fase 3 · Un solo sistema de diseño — ✅ **hecha el 2026-11-18 (v1.30.0)**
Decisión D3 (tomada por Claude): **naranja = acción principal**, **verde = solo acierto**, **morado = marca y progreso**. Botones de comprobar y siguiente en naranja con texto oscuro; barra de progreso y pasos del problema en morado; mundo 1 en cian y barra verde en teal (la paleta de barras sigue aparte). Variables de radio (`--r1..r4`, `--rp`) y de letra (`--f1..f8`) y variables semánticas de color (`--act`, `--ok`…). `!important` de 45 a 7 líneas (solo impresión, movimiento reducido y el hueco del altavoz). Nunito se queda (fuente del cuerpo, 27 KB). `tools/shots.js` hace capturas en las cuatro combinaciones para comparar. Detalle en CONTEXT.md §10t.

### Fase 4 · Pantalla de juego — ✅ **hecha el 2026-11-18 (v1.31.0)**
Bloquito justo bajo el enunciado en móvil y fijo abajo a la izquierda en tableta (siempre visible, también con scroll). Pasos dentro de la barra superior en tableta. Pizarra plegable: cerrada por defecto, botón «Pizarra» arriba, conserva el dibujo al cerrarla. Al calcular y comprobar, el modelo pasa a la columna izquierda y la derecha queda para las operaciones. Barras al ancho de la tarjeta (`wide()`): crecen en tableta y encogen en móvil si no caben (arregla «×n veces» que saltaba de línea). Móvil apaisado (844 × 390): de 1044 de 1062 pantallas con scroll (máx. 333 px) a unas 20-50 (máx. 65 px). `tests/v131.js` y `tools/gshots.js`. Detalle en CONTEXT.md §10u.

### Fase 5 · Inicio, mapa y álbum en listas — ✅ **hecha el 2026-11-18 (v1.32.0)**
Álbum en lista con progreso, contadores «n de m resueltos» en mundo y nivel, motivo del bloqueo en Retos y Avanzado, estado vacío del álbum. Inicio sin cambios. Detalle en CONTEXT.md §10v.

### Fase 6 · Abrir rápido y diagnóstico — *Sonnet, esfuerzo medio*
Sacar del `index.html` el Excel incrustado (y, si compensa, el banco) a archivos guardados por el service worker. Abrir desde la copia guardada y avisar cuando haya versión nueva. Quitar `Function()`. Panel «Diagnóstico» en Ajustes: versión, caché, espacio usado y últimos errores (útil al trabajar solo desde el móvil).

### Fase 7 (opcional) · Estado por alumno sin intercambio — *Opus, esfuerzo alto*
`st.alumnos[id]` con un puntero al activo y migración automática de `barri.v1`. Solo si las fases 1 y 4 dejan ver que el intercambio estorba (en la fase 4 no ha estorbado).

## 3. Decisiones que te tocan

- **D1.** ✅ Código fuente en el mismo repositorio público.
- **D2.** ✅ (decidida por Claude) Listas para información; tarjetas grandes para mundos y Aventuras.
- **D3.** ✅ Acción principal naranja en toda la app (verde solo para acierto).

## 4. Cómo pedir cada fase

En un chat nuevo del proyecto, con el modelo y esfuerzo indicados: «Haz la fase N de PLAN-BARRI.md». El código se clona de GitHub; ya no hace falta adjuntar el ZIP.
