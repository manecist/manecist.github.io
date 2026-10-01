# Portafolio · María Inés Cisterna Escobar

Portafolio interactivo de María Inés Cisterna Escobar (MCE): fundadora de Studios Conari SpA, desarrolladora Full Stack Java, diseño y producción digital, análisis de datos y matrona.

Sitio estático (HTML, CSS y JavaScript sin dependencias ni compilación), preparado para GitHub Pages.

## Cómo se recorre

- **Intro de Studios Conari**: lo primero que aparece (una vez por sesión; cualquier tecla, clic o toque la salta). El hada dibuja y pinta los emblemas del estudio y al dragón rosa, que revela STUDIOS CONARI.
- **El libro mágico**: al terminar la intro, una estela cruza el cielo del reino y aparece un libro cerrado. El hada llega volando, lo toca con su varita y el libro se abre. Ahí se elige cómo conocer la historia:
  - **Cuento**: el portafolio contado página a página, con hojas que giran (flechas, teclado, deslizar en el celular o las esquinas dobladas). Ocho capítulos: la matrona que soñaba con mundos, el nacimiento de Studios Conari, la calculadora Java, la tienda del mago (Rancek atiende la caja registradora y Ari y Coen compran), la tienda Magical Alliance (M7), las leyendas dibujadas, el oráculo de los colores y el salón de juegos.
  - **Versión clásica**: todo en una sola página, con el reino de fondo. Al elegirla, la escena aparece en lineart blanco y negro y el hada, pequeña, la pinta en acuarela de lo más cercano a lo más lejano (primer plano, mago, dragón) mientras la cámara la sigue; el cielo lo tiñe con un hechizo desde la luna (unos 13 s, una vez por sesión; se salta con cualquier tecla o toque). Luego queda como fondo en paralaje con el puntero y el desplazamiento, con pétalos de sakura. El botón «Leer como cuento» vuelve al libro.
  - Las demostraciones son las mismas en los dos modos: el libro las toma prestadas de la versión clásica y las devuelve al cerrarse.
- **Calculadora encantada**: teclado completo (también con el teclado físico) y, al lado, el mismo cálculo escrito en Java.
- **Caja registradora M4**: 68 productos de [Ecommerce-Backend-M4](https://github.com/manecist/Ecommerce-Backend-M4), descuento de 0 a 100 %, boleta impresa y cajón con el vuelto. En el cuento, el mago comenta cada compra.
- **Magical Alliance (M7)**: capturas reales y enlace a la [vitrina interactiva](https://manecist.github.io/Ecommerce-Portafolio-Final-M7/).
- **Leyendas dibujadas**: ilustraciones originales con marca de agua incrustada, sin menú contextual ni arrastre, y visor ampliado.
- **El oráculo de los colores**: laboratorio de datos con un mapa de burbujas color × edad; cada burbuja muestra la música de ese grupo con su base y advierte cuando el grupo es pequeño.
- **Arcade**: Bloques Encantados (gemas y cielo estrellado), Jardín de Gemas y Constelaciones.
- **Volver arriba**: Ari salta cuando bajas por la página y, al tocarla, sube haciendo un dash.

Las animaciones respetan la preferencia de movimiento reducido del sistema. Los datos del laboratorio viven solo en la memoria de la página.

## Ver en local

Abre `index.html` en el navegador (mejor con un servidor local, por ejemplo `python -m http.server`). No hace falta instalar nada; los enlaces externos requieren conexión.

## Publicar en GitHub Pages

1. Sube el contenido de esta carpeta a un repositorio de GitHub (el archivo `index.html` debe quedar en la raíz).
2. En el repositorio: **Settings → Pages → Build and deployment**, elige **Deploy from a branch**, rama `main` y carpeta `/ (root)`.
3. El sitio quedará en `https://<usuario>.github.io/<repositorio>/`.

El archivo `.nojekyll` evita que GitHub procese el sitio con Jekyll.

## Estructura

| Ruta | Contenido |
| --- | --- |
| `index.html` | Página completa del portafolio |
| `styles.css` | Todos los estilos |
| `app.js` | Caja registradora, Jardín de Gemas, constelaciones y Tetris jugable |
| `libro.js`, `libro.css` | Escena del libro mágico, modo cuento y estilos nuevos |
| `magia.js` | Chispas y el hada viva (parpadeo y hechizo con fotogramas intermedios) |
| `fondo-acuarela.js` | Escena del reino: del lineart a la acuarela pintada por el hada, y paralaje por capas (imágenes en `assets/fondo/acuarela/`) |
| `secciones.js` | Calculadora encantada, oráculo de los colores, leyendas dibujadas, reino de fondo, Ari que vuelve arriba y diálogos de la tienda |
| `tetris.js` | Motor de Bloques Encantados |
| `constellations.js` | Coordenadas y trazados de las diez constelaciones |
| `intro.js`, `intro.css` | Intro animada de Studios Conari |
| `intro-trazos.js` | Contornos vectoriales del logotipo, los emblemas y el dragón rosa que dibuja el hada |
| `vendor/` | GSAP 3.15 y MotionPathPlugin (animación de la intro) |
| `assets/` | Imágenes, iconos y CV; `assets/intro/` guarda el logotipo por piezas, los emblemas y la hoja de sprites del dragón rosa |
| `java/` | Aplicación de escritorio en Java (Swing); ver `java/README-JAVA.md` |

Al modificar `styles.css` o los archivos `.js`, cambia el valor `?v=` de sus enlaces en `index.html` (por ejemplo, la fecha del cambio) para que los visitantes no vean una copia antigua guardada en caché.

## Fuentes y créditos

- Catálogo M4 y capturas M7: repositorios de [manecist](https://github.com/manecist).
- Constelaciones: coordenadas y líneas de [d3-celestial](https://github.com/ofrohn/d3-celestial) (Olaf Frohn, BSD-3-Clause; ver [LICENCIAS.txt](LICENCIAS.txt)), con proyección gnomónica. Nombres y figuras: [IAU](https://iauarchive.eso.org/public/themes/constellations/). Son figuras tradicionales, no los límites oficiales de las regiones del cielo.
- Investigaciones citadas en el laboratorio de datos: [FUENTES_ANALISIS.md](FUENTES_ANALISIS.md).
- Identidad visual e ilustraciones: Studios Conari SpA y María Inés Cisterna Escobar. La intro reutiliza el logotipo y los emblemas de la intro de [kdelrio.github.io](https://kdelrio.github.io/).
- Animación: [GSAP](https://gsap.com) (GreenSock, licencia estándar sin costo).

## Licencia

© 2026 María Inés Cisterna Escobar y Studios Conari SpA. **Todos los derechos reservados.** Ilustraciones, personajes, textos, diseño y código son obra original: no se permite copiarlos, reutilizarlos ni usarlos para entrenar modelos de IA sin autorización escrita. Detalles y componentes de terceros en [LICENSE](LICENSE).
