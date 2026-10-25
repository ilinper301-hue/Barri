# Barri: mates con barras

App web educativa para niños de 6 a 12 años: resolver problemas con el **modelo de barras de Singapur**, paso a paso (Leer → Dibujar → Calcular → Comprobar). Funciona en móvil, tableta (también en horizontal) y ordenador, se puede instalar como app y funciona sin conexión.

**Abrir la app:** https://ilinper301-hue.github.io/barri/

## Qué incluye
- **6 mundos:** Suma y resta, Comparación, Fracciones, Multiplicar y dividir, Retos (varios pasos) y Extremo. 330 problemas en 4 niveles, del modelo casi hecho a dibujar las barras desde cero.
- **Método Singapur:** fase con objetos antes de las barras, elegir el modelo, barras proporcionales, «1 parte = …» en fracciones, estimar antes de calcular y responder con frase completa.
- **Apoyos por alumno:** lectura en voz alta con resaltado (para quien empieza a leer), colores para daltonismo y dificultad que se adapta.
- **Para el aula:** perfiles de alumnos, Modo Docente (todo abierto, sin guardar), modo proyector con «problema del día», informe de errores típicos, competencias y resumen para las familias. La Zona del tutor tiene PIN.
- **Cuenta docente (opcional):** con tu cuenta de Google y tu propio proyecto de Firebase, el aula se sincroniza entre dispositivos.
- **Privacidad:** sin cuenta, los datos se guardan solo en el dispositivo; hay copia de seguridad con un toque. Con cuenta, se guardan en tu Firebase y solo tú puedes leerlos.

## Archivos
| Archivo | Para qué sirve |
|---|---|
| `index.html` | La app completa (estilos, código y banco de problemas incluidos) |
| `sw.js` | Funcionamiento sin conexión y actualizaciones |
| `manifest.webmanifest` | Datos para instalarla como app |
| `icon-192.png`, `icon-512.png` | Iconos |
| `fonts/` | Fuentes Fredoka, Nunito e Inter (licencia OFL) |

## Editar los problemas
Desde la app: **Zona del tutor → Ajustes → Banco de problemas → Descargar Excel**. Edita enunciados, números y pistas y vuelve a importarlo. Cada fila necesita su ID (`M1-N1-01`…): el mundo y el tipo de problema salen del ID.

## Desarrollo
El código fuente vive en un proyecto aparte (`src/` + `tools/build.py` + tests). Aquí solo se publica el resultado compilado. GitHub Pages sirve la rama `main` desde la raíz.
