# Análisis de consumo de tokens y medidas aplicadas

## Dónde se gastaba más (en este proyecto)
1. **Contexto acumulado**: en un chat muy largo cada mensaje arrastra todo lo anterior. Es el mayor coste con diferencia.
2. **Capturas**: cada imagen vista (propias o las que genero para revisar) pesa bastante más que una línea de texto.
3. **Archivos grandes**: `index.html` ~170 KB (de ellos ~85 KB son datos y un Excel en base64). Releerlo o reescribirlo entero es muy caro.
4. **Scripts de prueba reescritos** en cada ocasión y **compilaciones/publicaciones repetidas** tras cambios mínimos.
5. **Respuestas largas** con listas repetidas y explicaciones ya dadas.
6. **Búsquedas a ciegas** en el código para encontrar "dónde estaba esto".

## Medidas aplicadas en este zip
- Código **modular** (`src/`) + `build.py` reproducible: se edita un archivo pequeño en lugar del HTML de 170 KB (el build sale idéntico byte a byte).
- Datos pesados **fuera del código** (Excel → build). El asistente tiene prohibido abrirlos.
- `CODEMAP.md` generado: índice de funciones con nº de línea → lectura por rangos.
- **Batería de tests incluida** (lógica, táctil, maquetación, Excel, PWA, diagnóstico): no hay que reescribirla; se compara con números.
- `CONTEXT.md` con arquitectura, decisiones, trampas ya resueltas y preferencias → no se redescubre ni se repite el trabajo.
- Protocolo de trabajo (sección 13): parches mínimos, una entrega por bloque, capturas solo si hacen falta, respuestas cortas.

## Consejos para ti
- **Un chat por bloque de trabajo** (p. ej. "accesibilidad", "perfiles"). Al empezar uno nuevo, pega `PROMPT_NUEVO_CHAT.md` y adjunta el zip.
- Agrupa peticiones en un solo mensaje (lista numerada) en vez de una por mensaje.
- Describe el problema en texto y adjunta **solo** la captura imprescindible, recortada.
- Pide "respuesta breve" y "por partes" si te interesa.
- Evita "Continúa" sin necesidad: ya hay mucho contexto cargado; mejor di qué falta.
- Antes de un cambio grande de diseño, pide una propuesta corta (una imagen) y decide; evita iterar sobre el código.

## Lo que no se puede ahorrar
Probar en tu móvil real (instalación, fluidez táctil) y las decisiones de diseño: son tuyas y valen más que los tokens.

## Cuando te cortan a mitad (y hay que escribir "Continúa")
No se puede evitar del todo, pero sí que no se pierda nada: `ESTADO.md` + `tools/ck.py` registran cada paso, los cambios son atómicos y la entrega se hace en cuanto lo esencial está listo (CONTEXT.md, sección 14). Al continuar basta con decir "Continúa"; el asistente lee `ESTADO.md` y sigue por el primer paso pendiente.
