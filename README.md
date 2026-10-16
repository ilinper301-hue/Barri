# Barri: mates con barras

App web educativa (6 a 12 años) para resolver problemas con el **modelo de barras de Singapur**. Sin dependencias ni instalación: HTML, CSS y JavaScript.

## Cómo probarla
- **En local:** abre `index.html` en el navegador (doble clic). Funciona sin servidor; el progreso se guarda en `localStorage`.
- **En GitHub Pages:** sube el repositorio, ve a *Settings > Pages* y elige la rama `main` y la carpeta `/ (root)`. Ábrela desde el móvil o la tableta.

## Estructura (todo en la raíz, sin carpetas)
| Archivo | Para qué sirve |
|---|---|
| `index.html` | Página única; carga los scripts |
| `styles.css` | Estilos, modo oscuro automático |
| `game.js` | Juego de 4 pasos (Leer, Dibujar, Calcular, Comprobar) |
| `app.js` | Pantallas, progreso, insignias y zona de adultos |
| `data.js` | Problemas con su modelo de barras (**generado**) |
| `banco_problemas.xlsx` | Banco de 144 problemas editable |
| `build_data.py` | Convierte el Excel en `data.js` |

## Cómo trastear
- **Cambiar o añadir problemas:** edita el Excel y ejecuta `pip install openpyxl` y `python build_data.py`. El script comprueba que las respuestas cuadran.
- **Cambiar insignias:** array `BD` de `app.js` (nombre, categoría, cómo se mide, umbrales de bronce, plata y oro).
- **Accesorios de Bloquito:** array `ACC` de `app.js` (estrellas necesarias).
- **Reglas de validación del modelo:** función `chkM` de `game.js`. Dentro de una barra el orden de los bloques es libre; solo el bloque punteado de diferencia exige posición.
- **Desbloqueo de niveles:** función `open` de `app.js` (ahora, resolver 5 del nivel anterior).

## Estado actual y pendientes
- Incluidos: los 4 mundos: Suma y resta, Comparación, Fracciones y Multiplicar y dividir (126 problemas con modelo).
- **Fracciones:** el niño sombrea las partes de una barra ya dividida en partes iguales; la barra se divide sola, falta que el niño la divida.
- **Multiplicar y dividir, nivel 3:** solo hay 2 problemas con modelo (se filtran los de más de 6 bloques iguales). Pendiente un bloque repetido "×n".
- Pendientes: barras que se estiran libremente, lecciones animadas de Aprender, llave vertical del total en comparación, sonidos, sincronización en la nube.
- Los datos de progreso viven solo en este dispositivo.

## Privacidad
No hay cuentas, analítica ni peticiones a servidores (solo la fuente de Google Fonts). Si añades servidor o analítica con menores, revisa COPPA y RGPD.
