# Flebo Animaciones

Web educativa del Instituto Mexicano de Flebología: 22 módulos (13 en 3D y 9 esquemas 2D) organizados en cuatro unidades, perfiles paciente/médico, 66 pasos de observación, 22 preguntas de repaso, narraciones y progreso local. Los modelos 3D permiten seleccionar estructuras, aislarlas y separar capas cuando corresponde al tema.

- Web pública: https://imf-hub.github.io/flebo-animaciones/
- Repositorio: https://github.com/imf-hub/flebo-animaciones

## Crear animaciones de este nivel o mejores

**Manual principal para Claude, Codex y otros LLM:** [GUIA_PARA_FUTURAS_ANIMACIONES.md](GUIA_PARA_FUTURAS_ANIMACIONES.md). Reúne las instrucciones, skills instaladas, código reutilizable, efectos, modelos interactivos, video y comprobaciones para continuar sin depender de este chat.

Por instrucción del propietario, las animaciones originales son el mínimo de calidad. El objetivo es mejorar movimiento, anatomía, estructuras 3D y claridad de la explicación.

Para cualquier LLM, empezar por [AGENTS.md](AGENTS.md). Hay entradas equivalentes para Claude y Gemini, y una [skill propia del proyecto](skills/flebo-animaciones/SKILL.md).

- [Arquitectura e inventario de los 12 módulos](docs/animacion/ARQUITECTURA.md).
- [Experiencia interactiva implementada y contratos actuales](docs/animacion/EXPERIENCIA_INTERACTIVA.md).
- [Cierre de los temas pendientes y revisión completa](docs/animacion/entregas/cierre-temas-2026-11-06.md).
- [Siete modelos nuevos: producción, comprobaciones y límites](docs/animacion/entregas/siete-modulos-2026-11-06.md).
- [Contraste documental del contenido médico nuevo](docs/animacion/REVISION_MEDICA_SIETE_MODULOS.md).
- [Estándar de calidad y mejoras prioritarias](docs/animacion/CALIDAD.md).
- [Cómo producir e integrar animaciones y videos](docs/animacion/PRODUCCION.md).
- [Skills y herramientas investigadas, con compatibilidad](docs/animacion/SKILLS_Y_HERRAMIENTAS.md).
- [Plantilla para un nuevo encargo](docs/animacion/PLANTILLA_ENCARGO.md).

La guía de experiencia distingue las mejoras implementadas de las pendientes. Los 22 módulos cuentan con contraste documental de textos y mecanismos, con correcciones de los originales y fuentes dentro de cada tema. No equivale a aprobación clínica independiente: ver [revisión del catálogo completo](docs/animacion/REVISION_MEDICA_CATALOGO_COMPLETO.md).

## Trabajar en el proyecto

Se necesita Node.js. No hay que instalar paquetes.

```sh
npm run check
npm run inspect:animations
npm run build
npm run dev
```

Abrir http://127.0.0.1:4173. Después de cambiar archivos, volver a ejecutar `npm run build` y recargar.

El build añade versiones basadas en el contenido a los estilos y scripts de `index.html`, tanto en la raíz como en `dist/`. Guardar ese HTML actualizado al publicar: evita combinar una interfaz nueva con archivos antiguos de la caché.

## Archivos

- `index.html`: estructura, identidad y metadatos.
- `assets/styles.css` y `assets/experience.css`: estilos heredados y diseño adaptable actual.
- `assets/app.js`: simulaciones, textos, guiones y reproductor.
- `assets/anatomy-scenes.js` y `assets/anatomy-scenes.css`: siete escenas y el constructor reutilizable `FLEBO3D`.
- `assets/clinical-scenes.js`: ablación, TVS y obstrucción ilíaca con relaciones espaciales editables.
- `assets/extension-data.js`: lecciones, fuentes, fichas, guiones y recorrido ampliado.
- `assets/extension-audio.js`: duraciones, marcas y versiones de las 22 narraciones activas.
- `assets/course.js`: recorrido, objetivos por perfil, pasos, preguntas y fichas anatómicas.
- `assets/experience.js`: aprendizaje, selección de estructuras, portada 3D y progreso local.
- `assets/logos/`: logotipos originales del IMF.
- `assets/vendor/`: Three.js 0.128.0 y OrbitControls, con su licencia MIT; se cargan al abrir un modelo 3D.
- `assets/fonts/`: tipografías locales con sus licencias.
- `audio/`: 22 narraciones en español, incluidas las doce revisiones y diez temas añadidos; se cargan solo al reproducir.
- `scripts/`: verificación, exportación y servidor local.
- `docs/animacion/`: arquitectura, mínimo de calidad, producción, herramientas y referencia conservada.
- `skills/flebo-animaciones/`: instrucciones reutilizables para agentes.
- `skills/external/`: siete guías de diseño y Three.js, con revisión de origen y licencias.
- `examples/animacion/`: núcleo de muestreo temporal reproducible; no es un módulo visual terminado.

El material entregado se conserva localmente en `material-original/` y `original-extraido/`, fuera de Git y de la exportación pública. El nombre heredado del archivo de origen no es el nombre de la web.

## Publicación

GitHub Pages sirve la rama `main`, carpeta `/ (root)`. Los cambios en esa rama actualizan la web. No requiere servidor de aplicación, base de datos, claves ni servicios externos para reproducir las animaciones.

Para Hostinger, ejecutar `npm run build` y subir el contenido de `dist/` a `public_html/`. Si se cambia de URL, actualizar la URL canónica y las etiquetas sociales en `index.html`, y las direcciones de `sitemap.xml` y `robots.txt`. El dominio aún no está conectado.

## Contenido y derechos

El material original y los logotipos proceden del contenido institucional proporcionado por el usuario. Se añadieron modelos, guiones y narraciones para este proyecto, conservando su carácter didáctico y simplificado. El contraste documental del catálogo no equivale a aprobación clínica independiente. No se ha concedido una licencia de redistribución del material institucional; las bibliotecas y fuentes conservan sus licencias respectivas.
