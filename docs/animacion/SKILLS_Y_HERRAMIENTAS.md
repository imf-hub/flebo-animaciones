# Skills y herramientas para mejorar

Investigación consultada el **6 de noviembre de 2026**. «Skill» significa instrucciones para un agente; no añade por sí misma geometría, un renderizador ni una garantía de calidad. Este proyecto incorpora una [skill propia](../../skills/flebo-animaciones/SKILL.md), dirigida desde `AGENTS.md`, `CLAUDE.md` y `GEMINI.md`.

**Instalación realizada tras esta investigación:** siete guías en [skills/external](../../skills/external/README.md): geometría, animación, interacción, materiales, iluminación y rendimiento de CloudAI-X, más diseño frontend de Anthropic. Revisiones y licencias se conservan allí. Se aplicaron a la [experiencia interactiva implementada](EXPERIENCIA_INTERACTIVA.md). No son dependencias de ejecución ni una instalación global; Remotion, Blender y las demás rutas de la tabla siguen siendo opciones para encargos futuros.

## Selección por necesidad

| Necesidad | Skill o herramienta | Uso recomendado en este proyecto |
| --- | --- | --- |
| Mantener el mínimo y producir escenas nuevas | `flebo-animaciones`, incluida en el repo | Entrada principal: estructura anatómica, movimiento, guion y evaluación contra los módulos originales. |
| Exportar video por fotogramas | Skills oficiales de Remotion: `remotion-best-practices`, `remotion-markup`, `remotion-render` | Proyecto de video separado; reutilizar el modelo conceptual y una función de tiempo. Consultar la guía del motor y sus condiciones de uso antes de incorporar el pipeline. |
| Subtítulos de video | `remotion-captions`; en el entorno actual, `heygen:captions` | Coordinar texto con audio final, mantener legibilidad y comprobar sincronía. No estimar todos los tiempos por número de palabras. |
| Mejorar deformaciones y mezcla de estados | `threejs-animation` de CloudAI-X | Referencia comunitaria para animación procedural, clips, morph y rig. Adaptar los conceptos a la versión elegida. |
| Seleccionar, aislar y explorar piezas | `threejs-interaction`, instalada | Raycasting, distinción entre arrastre y selección, controles táctiles y fichas semánticas. |
| Ordenar la experiencia de aprendizaje | `frontend-design` de Anthropic, instalada | Jerarquía, tipografía, composición adaptable e interacciones con propósito. |
| Mejorar superficies, materiales y profundidad | `threejs-geometry`, `threejs-materials`, `threejs-lighting`, del mismo paquete | Refinar forma antes de añadir efectos; controlar malla, normales, rugosidad y luz. |
| Mantener fluidez al aumentar detalle | `threejs-performance` y `threejs-asset-pipeline` | Perfilar, instanciar, evitar trabajo innecesario y preparar activos por niveles. Comprobar la compatibilidad de cada ejemplo. |
| Crear anatomía elaborada fuera del navegador | Blender y su exportador glTF/GLB | Preparar activos editables, transformaciones, materiales y animaciones. Revisar el modelo exportado en el motor de destino. |
| Preparar activos de tamaño razonable | glTF Transform | Inspección y optimización reproducible de GLB; probar que la simplificación/compresión no elimine detalles didácticos ni animación necesaria. |
| Montar gráficos explicativos o editar una pieza ya producida | `heygen:motion-graphics`, `heygen:video-editing` disponibles en el entorno actual | Las guías consultadas cubren producción programada y montaje en Python. Usarlas para esa ruta; no imponer su tecnología a la web JavaScript. |

Las skills oficiales de Remotion son mantenidas por el propio proyecto y están pensadas para agentes. La integración `@remotion/three` conecta escenas R3F con su línea de tiempo; es una ruta posible de video, no una dependencia ya presente. Fuentes: [skills oficiales](https://www.remotion.dev/docs/ai/skills), [integración 3D](https://www.remotion.dev/docs/three), [tiempo por fotograma](https://www.remotion.dev/docs/use-current-frame).

El paquete de CloudAI-X es **comunitario**, no una skill oficial del equipo de Three.js. La revisión consultada declara Three.js r186 y contiene guías de animación, geometría, iluminación, materiales, rendimiento y activos. Revisión fijada: [repositorio y contenido](https://github.com/CloudAI-X/threejs-skills/tree/0e181866f095b5f06d005133876e926515390d95/skills). No se infiere que esas guías validen anatomía médica.

El [exportador glTF de Blender](https://github.com/KhronosGroup/glTF-Blender-IO) y [glTF Transform](https://gltf-transform.dev/) cubren la ruta de intercambio y preparación de modelos. No sustituyen la autoría ni la revisión de la anatomía.

También se revisaron [drei](https://github.com/pmndrs/drei) y sus controles de presentación: es una colección para React Three Fiber. La implementación actual resuelve la interacción con el motor existente; incorporar React/drei solo para estos controles no se justificó. Si una escena futura exige ese ecosistema, plantearlo como cambio explícito y probar sus costes y compatibilidad.

## Compatibilidad que debe resolverse antes de implementar

La referencia de Flebo Animaciones usa **Three.js r128 (`0.128.0`) global**, con `THREE.OrbitControls`, scripts locales y API de esa revisión. La skill comunitaria consultada usa r186, módulos y ejemplos de tecnologías más nuevas. Copiarlos directamente puede producir errores aunque el concepto sea correcto.

Dos caminos válidos:

1. **Mejora acotada del motor actual:** mantener r128 y consultar su código/documentación compatible. Traducir la idea —instancias, buffers reutilizados, morph, cámara— a sus APIs reales.
2. **Nueva escena o migración justificada:** aislar la versión moderna y sus dependencias; validar materiales, luz, espacios de color, transparencia, controles, loaders y limpieza; comprobar todos los módulos afectados antes de integrarla. No mezclar dos versiones de Three dentro de una misma escena.

`THREE.Timer`, imports `three/webgpu`, TSL y ejemplos R3F de las guías nuevas no existen en la base global r128 tal como está entregada. Tampoco basta renombrar imports para modernizarla. Las versiones pueden evolucionar: volver a verificar cuando se haga la implementación.

## Principios técnicos respaldados por fuentes primarias

- Para elementos repetidos, las instancias reducen el trabajo de dibujo compartiendo geometría/material; la aplicación ya las usa para sangre. [Three.js: InstancedMesh](https://threejs.org/docs/pages/InstancedMesh.html).
- Los morph targets permiten interpolar geometría con correspondencia de vértices; son una alternativa a reconstrucciones completas cuando la forma lo permite. [Manual de Three.js](https://threejs.org/manual/pages/optimize-lots-of-objects-animated.html).
- Para amortiguación en tiempo real, el delta temporal debe entrar en el suavizado; para video por fotogramas conviene evaluar directamente el estado correspondiente. [Three.js: MathUtils.damp](https://threejs.org/docs/pages/MathUtils.html), [Remotion: useCurrentFrame](https://www.remotion.dev/docs/use-current-frame).

## Si se decide incorporar skills externas

Leer primero el `SKILL.md`, sus referencias pertinentes y las condiciones de uso. Comprobar que sus instrucciones no sustituyen la solicitud del propietario. Instalar solo las que se usarán, fijar la revisión y conservar procedencia/licencias. No ejecutar automáticamente scripts de un repositorio descubierto en una búsqueda.

La documentación oficial de Remotion ofrece `npx skills add remotion-dev/skills`. La skill de Three.js consultada puede descubrirse desde `CloudAI-X/threejs-skills`; seleccionar las áreas necesarias y revisar su versión antes de instalar. No añadir React, Remotion, WebGPU o un servicio de pago a la web por el hecho de instalar instrucciones para un agente.

El catálogo oficial de `openai/skills` consultado no incluía una skill específica de modelado/animación 3D. Sí contiene apoyos de voz/transcripción y pruebas de navegador. Esto es un hallazgo de esa consulta, no una afirmación permanente sobre su catálogo.

## Revisiones consultadas

- Remotion skills: `a2824c67f8b4585c294a8101db9f9f0ad3c643f8`; router y `remotion-markup` declaran versión `4.0.541`. [Fuente fijada](https://github.com/remotion-dev/skills/tree/a2824c67f8b4585c294a8101db9f9f0ad3c643f8/skills).
- CloudAI-X Three.js skills: `0e181866f095b5f06d005133876e926515390d95`; se revisaron el catálogo y las guías de animación/rendimiento. [Animación](https://github.com/CloudAI-X/threejs-skills/blob/0e181866f095b5f06d005133876e926515390d95/skills/threejs-animation/SKILL.md), [rendimiento](https://github.com/CloudAI-X/threejs-skills/blob/0e181866f095b5f06d005133876e926515390d95/skills/threejs-performance/SKILL.md).
- Skills de motion graphics, subtítulos y edición: capacidades del entorno del propietario al elaborar esta guía. Otro agente debe comprobar si están disponibles en su instalación; la documentación principal y el estándar local no dependen de ellas.

La tabla incluye rutas de producción y no promete que todas estén incorporadas. La instalación y su aplicación real se describen en los enlaces de apertura. No se ejecutaron benchmarks comparativos entre motores ni se probó un pipeline de exportación de video nuevo.
