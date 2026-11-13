# ECOSISTEMA · contrato común de las apps

Versión del contrato: **1** (13-11-2026; añadida la regla 0 el mismo día). Este archivo es **idéntico en los seis repositorios**
(Lectori, Barri, Calculi, Fori, Tabula, Charta). La copia de referencia es la de `tabula`: si cambia,
se copia tal cual a los demás en el mismo día.

Léelo antes de tocar cualquier cosa que una app lea o deje para otra.

## 1. Las apps

| App | Para quién | Qué hace | Dirección | Prefijo de sus claves |
|---|---|---|---|---|
| Lectori | Alumnado | Aprender a leer | `/Lectori/` | `ar2`, `ar…`, `lectori.` |
| Barri | Alumnado | Problemas con barras (Singapur) | `/Barri/` | `barri.` |
| Calculi | Alumnado | Cálculo mental | `/Calculi/` | `calc.` |
| Fori | Docente (a la vista del alumnado) | Pizarra digital | `/Fori/` | `fori-` |
| Tabula | Docente | Cuaderno docente | `/tabula/` | `tabula:` e IndexedDB `tabula-data` |
| Charta | Docente | Fichas | `/Charta/` | `charta:` |

Todas se publican en `https://ilinper301-hue.github.io`, es decir, **mismo origen**: comparten
`localStorage` (unos 5 MB entre todas) y pueden leerse entre sí en el mismo navegador.
Las que usan la nube comparten el proyecto de Firebase `mis-apps-educativas`; las reglas completas
se publican desde `tabula/firestore.rules`.

## 2. Reglas que no se rompen

0. **Cada app funciona entera por separado.** Es la regla que manda sobre todas las demás.
   - Una app nunca necesita a otra para abrirse, usarse ni guardar el progreso. Sin Tabula, sin cuenta
     de Google y sin conexión, todo lo que la app hace hoy sigue funcionando igual.
   - Las conexiones son un **añadido opcional**: si la otra app no está o no hay datos suyos, la
     función sencillamente no aparece o dice «no hay datos», sin avisos de error ni pantallas a medias.
   - **Las familias no ven el ecosistema.** En el perfil de Familias (y en cualquier uso sin modo
     docente) no aparece ningún botón, texto ni aviso sobre Tabula u otras apps. Lo relacionado con el
     ecosistema vive solo en la zona del tutor del perfil Docente.
   - Los perfiles creados a mano, sin enlazar, son alumnos de pleno derecho: nada les falta ni se les
     pide enlazarse.
   - Cada fase se da por terminada solo si la app sigue pasando sus pruebas **sin** ningún dato de
     otra app en el navegador (instalación limpia).
1. **Cada app escribe solo en sus claves.** Las de otra app se leen, nunca se escriben ni se borran.
2. **Tabula manda en el alumnado.** Los grupos y los alumnos se crean y se corrigen en Tabula; las
   demás apps los reciben (apartado 3). Una app puede tener además perfiles propios sin enlazar
   (familias, uso en casa).
3. **Los alumnos se identifican por su id de Tabula**, no por el nombre. El nombre es solo para mostrar.
4. **Datos mínimos.** Entre apps viaja el id, el nombre que se ve en clase y resultados de aprendizaje.
   Nunca apellidos completos (salvo para deshacer un empate de nombres), medidas de atención a la
   diversidad, observaciones, asistencia ni datos de familias.
5. **Quien lee, valida.** Se comprueba `app`, `tipo` y `v`; los campos desconocidos se ignoran; si el
   dato no tiene la forma esperada se trata como «no hay datos», sin romper la app.
6. **Cambios de formato.** Añadir un campo opcional no cambia `v`. Quitar o cambiar el sentido de un
   campo sube `v`, y el lector acepta la versión anterior hasta que las seis apps estén al día.
7. **Nada se borra solo.** Si un alumno desaparece de la lista de Tabula, su perfil y su progreso en
   las otras apps se conservan (queda «sin enlazar»); solo el docente lo borra a mano.
8. **Tamaño.** La lista, como mucho 20 KB; cada resumen de resultados, como mucho 150 KB.

## 3. Lista de alumnado (Tabula → todas)

Tabula deja en `localStorage`, clave **`tabula:eco:lista`**, la lista de sus grupos activos del curso
escolar actual. La vuelve a escribir cuando cambian los grupos o los alumnos.

```json
{
  "app": "tabula", "tipo": "lista", "v": 1, "ts": 1794585600000,
  "grupos": [
    { "id": "g_abc123", "nombre": "1º A", "curso": 1, "cursoEscolar": "2026-27",
      "alumnos": [
        { "id": "s_k3j2x9", "n": "Lucía", "orden": 1 },
        { "id": "s_p8w1q4", "n": "María G.", "orden": 2 }
      ] }
  ]
}
```

- `grupos[].id` y `alumnos[].id`: los `id` de las colecciones `groups` y `students` de Tabula. No cambian.
- `n`: el nombre como Tabula lo muestra en clase (`shortName` en `tabula/js/views/aula/common.js`): «María»; si hay otra en el grupo, «María G.»; si aún
  coincide, «María García».
- `orden`: el orden de lista de Tabula.
- No se incluyen grupos archivados ni de otros cursos escolares.

### Cómo la usa una app del alumnado (Lectori, Barri, Calculi)

- En la zona del tutor: **«Traer mi clase de Tabula»**. Se elige el grupo y se crean los perfiles que falten.
- Cada perfil enlazado guarda **`tb: { a: idAlumno, g: idGrupo }`** junto a sus datos.
- La primera vez, los perfiles que ya existían se proponen emparejados por nombre y **el docente
  confirma**; si hay duda (dos nombres iguales) no se empareja solo. A partir de ahí manda el id.
- Si el nombre cambia en Tabula, se actualiza `n` del perfil enlazado al volver a traer la clase.
- Importar alumnos de otra app del alumnado (lo que hace hoy Calculi con `ar2` y `barri.v1`) sigue
  permitido, pero no crea enlace: el enlace solo sale de la lista de Tabula.

Fori lee hoy los grupos, alumnos y horario directamente del almacén interno de Tabula
(`36b-tabula.js`). Funciona, pero depende de cómo guarda Tabula por dentro; para los alumnos debe
pasar a esta lista cuando se toque esa parte (el horario sigue como está).

## 4. Resumen de resultados (apps del alumnado → Tabula)

Cada app del alumnado deja su resumen en una clave propia, poco después de cada cambio:

| App | Clave | Estado |
|---|---|---|
| Calculi | `calc.tabula` | Hecho en formato v1 (`docs/tabula.md` de Calculi) |
| Barri | `barri.tabula` | Pendiente (fase 3) |
| Lectori | `lectori.tabula` | Pendiente (fase 3) |

Formato común (**v2**):

```json
{
  "app": "barri", "tipo": "resumen", "v": 2, "ts": 1794585600000,
  "alumnos": [
    { "id": "idDelPerfilEnLaApp", "tb": { "a": "s_k3j2x9", "g": "g_abc123" }, "n": "Lucía", "curso": 1,
      "diasPractica": 9, "ultimoDia": "2026-11-12",
      "items": [
        { "id": "m1-n2", "nombre": "Parte-todo · nivel 2", "bloque": "Parte-todo", "curso": 1, "trimestre": 1,
          "dominio": 90, "semaforo": "v", "intentos": 24, "ultimo": "2026-11-12" }
      ] }
  ]
}
```

- `tb`: el enlace con Tabula, o `null` si el perfil no está enlazado.
- `items`: lo que se aprende en esa app, con un `id` **estable** (no puede cambiar entre versiones):
  en Calculi, cada truco; en Barri, cada mundo y nivel; en Lectori, cada letra o grupo de letras y
  nivel. Qué es exactamente un item lo decide cada app en la fase 3 y lo deja escrito en su `docs/tabula.md`.
- `bloque`: nombre para agrupar items en el cuaderno (opcional).
- `dominio`: de 0 a 100, aciertos sin ayuda en los últimos intentos; `null` si aún no hay datos suficientes.
- `semaforo`: `v` (80 o más), `a` (50 o más), `r` (menos de 50), `g` (sin datos). Igual en las tres apps.
- `curso`, `trimestre`, `intentos`, `ultimo`: opcionales.
- `extra`: objeto libre y opcional por alumno para datos propios de la app (por ejemplo, en Lectori,
  palabras por minuto). Tabula solo lo usa si lo conoce.
- Solo se incluyen los items del curso del alumno y los que haya practicado.

### Compatibilidad con Calculi v1

El resumen v1 de Calculi llama `trucos` a los items y no lleva `tb`. Hasta que Calculi pase a v2:
Tabula lee `items` y, si no existe, `trucos`; y si no hay `tb`, empareja por nombre como hasta ahora.
Cuando Calculi emita v2 dejará `trucos` como copia de `items` hasta que Tabula ya no lo necesite.

### Cómo lo usa Tabula

Un único importador, **«Importar de mis apps»**, en el Cuaderno: lee las tres claves, enlaza por
`tb.a` (y por nombre solo si falta), y crea o actualiza columnas con `origen` igual al nombre de la
app. Nota = `dominio / 10`.

## 5. Puentes que ya existen

| De → a | Cómo | Dónde está el código |
|---|---|---|
| Charta → Tabula | Enlace de vuelta con la composición; si es larga, `charta:aTabula` | `tabula/js/charta.js`, `Charta/src/ui/miniatura_ficha.js` |
| Tabula → Charta | «Crear ficha (Charta)» e «Imprimir juntos» (motor de Charta en un marco oculto) | `tabula/js/charta-hojas.js` |
| Charta → Fori | `charta:aFori` y `?charta=1`; también `?ficha=ID` o `?comp=…` | `Fori/src/js/05f-charta.js` |
| Tabula → Fori | Fori lee grupos, alumnos y horario de Tabula | `Fori/src/js/36b-tabula.js` |
| Calculi → Tabula | `calc.tabula` | `Calculi/src/js/48-extras.js`, `tabula/js/calculi.js` |
| Lectori, Barri → Calculi | Calculi lee nombres de `ar2` y `barri.v1` | `Calculi/src/js/10-datos.js` |

## 6. Reservado para más adelante (no implementar todavía)

- **Nube (fase 4).** La lista y los resúmenes se guardarán también en Firestore para que funcionen
  entre dispositivos: `apps/eco/users/{uid}/lista/actual` y `apps/eco/users/{uid}/resumen/{app}`,
  con los mismos formatos de los apartados 3 y 4. Antes hay que escribir y probar sus reglas (cada
  docente, solo lo suyo).
- **Refuerzo (fase 5).** Tabula abrirá Charta con una ficha preparada a partir de los items en rojo.
- **Lanzador (fase 6).** Fori abrirá una actividad concreta de Lectori, Barri o Calculi en modo aula.

Los parámetros de dirección de las fases 5 y 6 se definirán aquí antes de programarlos.

## 7. Plan por fases

| Fase | Qué | Repos | Modelo recomendado | Estado |
|---|---|---|---|---|
| 1 | Este contrato | Los seis | Fable u Opus | Hecho |
| 2 | Lista única: Tabula la publica; Lectori, Barri y Calculi la traen y enlazan perfiles | tabula, Lectori, Barri, Calculi | Sonnet | Pendiente |
| 3 | Resúmenes de Barri y Lectori; Calculi a v2; «Importar de mis apps» en Tabula | Barri, Lectori, Calculi, tabula | Sonnet | Pendiente |
| 4 | Lista y resúmenes por Firebase, con reglas | tabula y las tres del alumnado | Fable u Opus | Pendiente |
| 5 | Ficha de refuerzo desde Tabula hacia Charta | tabula, Charta | Sonnet | Pendiente |
| 6 | Fori como lanzador de actividades | Fori y las tres del alumnado | Sonnet | Pendiente |

Orden dentro de la fase 2: primero Tabula (publicar la lista), después una app del alumnado cada vez,
empezando por Calculi (es la que ya habla con Tabula).

Al terminar una fase: marca su estado aquí, en la copia de `tabula`, y copia el archivo a los otros
cinco repositorios.
