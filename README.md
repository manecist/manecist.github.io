# Portafolio · María Inés Cisterna Escobar

Portafolio interactivo de María Inés Cisterna Escobar (MCE): fundadora de Studios Conari SpA, desarrolladora Full Stack Java, diseño y producción digital, análisis de datos y matrona.

Sitio estático (HTML, CSS y JavaScript sin dependencias ni compilación), preparado para GitHub Pages.

## Secciones

- **Pantalla de inicio**: consola rosada con Tetris automático en la pantalla LCD. Al pulsar **ENCENDER** comienza la intro.
- **Intro de Studios Conari** (unos 14 s, una vez por sesión; cualquier tecla, clic o toque la salta): el hada dibuja con su varita el lineart de los ocho emblemas del estudio y los pinta todos con un hechizo de área. Después dibuja al dragón con un rayo de magia, lo colorea y le da vida con un hechizo de luz. El dragón da una vuelta, reúne los emblemas en la luna y revela STUDIOS CONARI. No se reproduce si el sistema pide movimiento reducido.
- **Portada**: el hada del portafolio y cinco burbujas perladas que llevan a Empresa, Desarrollo, Diseño, Datos y Salud.
- **Studios Conari**: la empresa, sus servicios y el equipo (María Inés, Kevin Alexis y Elías Alejandro).
- **Desarrollo**
  - Calculadora con la lógica equivalente en Java.
  - Caja registradora con los 68 productos del catálogo de [Ecommerce-Backend-M4](https://github.com/manecist/Ecommerce-Backend-M4): descuento de 0 a 100 % (con decimales), teclado de pago, boleta impresa animada y cajón con el vuelto. El descuento es global y de ejemplo; no replica las reglas por categoría de la aplicación Java.
  - Galería con cuatro capturas reales de [Ecommerce-Portafolio-Final-M7](https://github.com/manecist/Ecommerce-Portafolio-Final-M7). Es una galería, no el backend en ejecución.
- **Diseño e ilustración**: obra tradicional y digital, y un recorrido creativo de cuatro etapas que se abren al pulsarlas.
- **Datos · «El color de nuestras melodías»**: registra nombre, edad, color favorito y música favorita, y compara un mismo color entre tramos de edad (1–4, 5–12, 13–17, 18–29, 30–44, 45–59 y 60+ años). Cada porcentaje muestra su denominador; los empates, los grupos de una persona y las opciones más frecuentes sin mayoría se explican por escrito. Incluye un ejemplo ficticio de 20 registros y dos investigaciones citadas como contexto.
- **Trayectoria y formación**: experiencia en salud y credenciales verificables.
- **Arcade**
  - *Bloques Encantados*: Tetris con 1,5 s para acomodar la pieza al aterrizar (se renueva hasta 15 veces al moverla o girarla), caída instantánea con Espacio y un hada que rompe las líneas completas.
  - *Jardín de Gemas*: 4 gemas crean un cohete; 5, una bomba (también en L o en T), y 6 o más, una bola disco. Incluye retos guiados para aprender a crear cada poder.
  - *Constelaciones*: diez figuras (Cruz del Sur, Casiopea, Lira, Orión, Cefeo, Delfín, Triángulo, Libra, Cisne y León) que revelan una ilustración al completarse.

Las animaciones respetan la preferencia de movimiento reducido del sistema. Los datos del laboratorio viven solo en la memoria de la página y no se envían a ningún servidor.

## Ver en local

Abre `index.html` en el navegador y pulsa **ENCENDER**. No hace falta instalar nada; los enlaces externos requieren conexión.

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
| `app.js` | Lógica del sitio: calculadora, caja, laboratorio de datos, Jardín de Gemas y constelaciones |
| `tetris.js` | Motor de Bloques Encantados |
| `constellations.js` | Coordenadas y trazados de las diez constelaciones |
| `intro.js`, `intro.css` | Intro animada de Studios Conari |
| `intro-trazos.js` | Contornos vectoriales del logotipo, los emblemas y el dragón que dibuja el hada |
| `vendor/` | GSAP 3.15 y MotionPathPlugin (animación de la intro) |
| `assets/` | Imágenes, iconos y CV; `assets/intro/` guarda el logotipo por piezas, los emblemas y el dragón |
| `java/` | Aplicación de escritorio en Java (Swing); ver `java/README-JAVA.md` |

Al modificar `styles.css` o los archivos `.js`, cambia el valor `?v=` de sus enlaces en `index.html` (por ejemplo, la fecha del cambio) para que los visitantes no vean una copia antigua guardada en caché.

## Fuentes y créditos

- Catálogo M4 y capturas M7: repositorios de [manecist](https://github.com/manecist).
- Constelaciones: coordenadas y líneas de [d3-celestial](https://github.com/ofrohn/d3-celestial) (Olaf Frohn, BSD-3-Clause; ver [LICENCIAS.txt](LICENCIAS.txt)), con proyección gnomónica. Nombres y figuras: [IAU](https://iauarchive.eso.org/public/themes/constellations/). Son figuras tradicionales, no los límites oficiales de las regiones del cielo.
- Investigaciones citadas en el laboratorio de datos: [FUENTES_ANALISIS.md](FUENTES_ANALISIS.md).
- Identidad visual e ilustraciones: Studios Conari SpA y María Inés Cisterna Escobar. La intro reutiliza el logotipo, los emblemas y el dragón de la intro de [kdelrio.github.io](https://kdelrio.github.io/).
- Animación: [GSAP](https://gsap.com) (GreenSock, licencia estándar sin costo).
