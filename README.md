# Portafolio · María Inés Cisterna Escobar

Portafolio interactivo de María Inés Cisterna Escobar (MCE): fundadora de Studios Conari SpA, desarrolladora Full Stack Java, diseño y producción digital, análisis de datos y matrona.

Sitio estático (HTML, CSS y JavaScript sin dependencias ni compilación), preparado para GitHub Pages.

## Contenido

- **Studios Conari**: la empresa, sus servicios y el equipo (María Inés, Kevin Alexis y Elías Alejandro).
- **Desarrollo**: calculadora con su lógica equivalente en Java, caja registradora con el catálogo del proyecto [Ecommerce-Backend-M4](https://github.com/manecist/Ecommerce-Backend-M4) y galería del proyecto final [Ecommerce-Portafolio-Final-M7](https://github.com/manecist/Ecommerce-Portafolio-Final-M7).
- **Diseño e ilustración**: obra tradicional y digital, y recorrido creativo en cuatro etapas.
- **Datos**: laboratorio «El color de nuestras melodías», que cruza edad, color favorito y música favorita con registros ingresados en la página.
- **Trayectoria y formación**: experiencia en salud y credenciales verificables.
- **Arcade**: Bloques Encantados (Tetris), Jardín de Gemas y Constelaciones.

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
| `styles.css` | Estilos (base y ajustes de cada versión, en orden) |
| `app.js` | Lógica principal: calculadora, caja, datos y juegos |
| `v8.js` … `v12.js` | Mejoras incorporadas en cada versión, cargadas después de `app.js` |
| `tetris.js` | Motor de Bloques Encantados |
| `constellations.js` | Coordenadas y trazados de las diez constelaciones |
| `assets/` | Imágenes, iconos y CV |
| `java/` | Aplicación de escritorio en Java (Swing); ver `java/README-JAVA.md` |

## Documentación

- [CHANGELOG.md](CHANGELOG.md): historial de cambios por versión.
- [FUENTES_ANALISIS.md](FUENTES_ANALISIS.md): investigaciones citadas en el laboratorio de datos.
- [VERIFICACION.md](VERIFICACION.md): comprobaciones realizadas a la V12.
- [LICENCIAS.txt](LICENCIAS.txt): licencia de los trazados celestes.

## Fuentes y créditos

- Catálogo M4 y capturas M7: repositorios de [manecist](https://github.com/manecist).
- Constelaciones: coordenadas y líneas de [d3-celestial](https://github.com/ofrohn/d3-celestial) (Olaf Frohn, BSD-3-Clause), con proyección gnomónica. Nombres y figuras: [IAU](https://iauarchive.eso.org/public/themes/constellations/).
- Identidad visual e ilustraciones: Studios Conari SpA y María Inés Cisterna Escobar.

Los datos del laboratorio viven solo en la memoria de la página; el ejemplo de 20 registros es ficticio y no procede de los estudios citados.
