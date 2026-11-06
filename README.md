# Flebo Animaciones

Web educativa del Instituto Mexicano de Flebología: 12 módulos de animación 2D/3D, explicación para pacientes y médicos, narraciones grabadas, subtítulos y reproducción continua.

- Web pública: https://imf-hub.github.io/flebo-animaciones/
- Repositorio: https://github.com/imf-hub/flebo-animaciones

## Trabajar en el proyecto

Se necesita Node.js. No hay que instalar paquetes.

```sh
npm run check
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

El material entregado se conserva localmente en `material-original/` y `original-extraido/`, fuera de Git y de la exportación pública. El nombre heredado del archivo de origen no es el nombre de la web.

## Publicación

GitHub Pages sirve la rama `main`, carpeta `/ (root)`. Los cambios en esa rama actualizan la web. No requiere servidor de aplicación, base de datos, claves ni servicios externos para reproducir las animaciones.

Para Hostinger, ejecutar `npm run build` y subir el contenido de `dist/` a `public_html/`. Si se cambia de URL, actualizar la URL canónica y las etiquetas sociales en `index.html`, y las direcciones de `sitemap.xml` y `robots.txt`. El dominio aún no está conectado.

## Contenido y derechos

Los textos, modelos, guiones, logotipos y audios proceden del material institucional proporcionado por el usuario. Se conserva su carácter didáctico y simplificado. Esta migración no constituye una revisión médica integral del contenido. No se ha concedido una licencia de redistribución del material institucional; las bibliotecas y fuentes conservan sus licencias respectivas.
