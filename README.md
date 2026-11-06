# Flebo Animaciones

Web educativa del Instituto Mexicano de Flebología: 12 módulos de animación 2D/3D, explicación para pacientes y médicos, narraciones grabadas, subtítulos y reproducción continua.

- Web pública: https://imf-hub.github.io/flebo-animaciones/
- Repositorio: https://github.com/imf-hub/flebo-animaciones

## Crear animaciones de este nivel o mejores

Por instrucción del propietario, las animaciones originales son el mínimo de calidad. El objetivo es mejorar movimiento, anatomía, estructuras 3D y claridad de la explicación.

Para cualquier LLM, empezar por [AGENTS.md](AGENTS.md). Hay entradas equivalentes para Claude y Gemini, y una [skill propia del proyecto](skills/flebo-animaciones/SKILL.md).

- [Arquitectura e inventario de los 12 módulos](docs/animacion/ARQUITECTURA.md).
- [Estándar de calidad y mejoras prioritarias](docs/animacion/CALIDAD.md).
- [Cómo producir e integrar animaciones y videos](docs/animacion/PRODUCCION.md).
- [Skills y herramientas investigadas, con compatibilidad](docs/animacion/SKILLS_Y_HERRAMIENTAS.md).
- [Plantilla para un nuevo encargo](docs/animacion/PLANTILLA_ENCARGO.md).

Esta documentación no implica que las mejoras propuestas ya se hayan implementado ni que el contenido heredado haya pasado una revisión médica integral.

## Trabajar en el proyecto

Se necesita Node.js. No hay que instalar paquetes.

```sh
npm run check
npm run inspect:animations
npm run build
npm run dev
```

Abrir http://127.0.0.1:4173. Después de cambiar archivos, volver a ejecutar `npm run build` y recargar.

## Archivos

- `index.html`: estructura, identidad y metadatos.
- `assets/styles.css`: diseño adaptable.
- `assets/app.js`: simulaciones, textos, guiones y reproductor.
- `assets/logos/`: logotipos originales del IMF.
- `assets/vendor/`: Three.js 0.128.0 y OrbitControls, con su licencia MIT; se cargan al abrir un modelo 3D.
- `assets/fonts/`: tipografías locales con sus licencias.
- `audio/`: 12 narraciones originales MP3, cargadas solo al reproducir.
- `scripts/`: verificación, exportación y servidor local.
- `docs/animacion/`: arquitectura, mínimo de calidad, producción, herramientas y referencia conservada.
- `skills/flebo-animaciones/`: instrucciones reutilizables para agentes.
- `examples/animacion/`: núcleo de muestreo temporal reproducible; no es un módulo visual terminado.

El material entregado se conserva localmente en `material-original/` y `original-extraido/`, fuera de Git y de la exportación pública. El nombre heredado del archivo de origen no es el nombre de la web.

## Publicación

GitHub Pages sirve la rama `main`, carpeta `/ (root)`. Los cambios en esa rama actualizan la web. No requiere servidor de aplicación, base de datos, claves ni servicios externos para reproducir las animaciones.

Para Hostinger, ejecutar `npm run build` y subir el contenido de `dist/` a `public_html/`. Si se cambia de URL, actualizar la URL canónica y las etiquetas sociales en `index.html`, y las direcciones de `sitemap.xml` y `robots.txt`. El dominio aún no está conectado.

## Contenido y derechos

Los textos, modelos, guiones, logotipos y audios proceden del material institucional proporcionado por el usuario. Se conserva su carácter didáctico y simplificado. Esta migración no constituye una revisión médica integral del contenido. No se ha concedido una licencia de redistribución del material institucional; las bibliotecas y fuentes conservan sus licencias respectivas.
