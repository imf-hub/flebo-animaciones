# MotionSites aplicado a Flebo Animaciones

## Acceso y decisión

Por indicación del propietario, consultar plantillas y prompts desde [Imperio Agéntico](https://os.imperioagentico.com/), entrando en **Templates MotionSites**, con su sesión del navegador. El propietario declara disponer de plan pagado y uso ilimitado. El portal mostraba Plan Agency y anunciaba derechos de uso/reventa; comprobar las condiciones aplicables si se redistribuyen recursos originales. No guardar credenciales en el proyecto.

El 6 de noviembre de 2026 se compararon siete fichas y sus prompts completos. **Bite-Sized Courses** fue la referencia principal de organización del aprendizaje; **KnowSugar**, la referencia de composición de la portada. Se adaptaron patrones al producto existente, conservando Three.js 0.128.0 y los modelos reales. No se importó código ejecutable de las plantillas ni se añadieron dependencias o vídeos externos.

## Comparación de las siete referencias

| Plantilla y fuente | Patrón útil | Decisión para esta web |
| --- | --- | --- |
| [Bite-Sized Courses](https://motionsites.ai/?prompt=bite-sized-courses) | Un curso como foco, capítulos, gestos y retorno al reposo. El prompt contiene HTML, CSS y JS con arrastre y reciclado de tarjetas. | Adoptar capítulos visuales, navegación horizontal nativa en móvil y datos reales. Evitar marco fijo de teléfono, tarjetas duplicadas y tiempos inventados. |
| [KnowSugar](https://motionsites.ai/?prompt=knowsugar) | Escenario visual enmarcado, gran jerarquía tipográfica y cambios de escena. | Adoptar el escenario anatómico de portada y vistas explícitas. Mantener 3D real; evitar el vídeo pesado, el recorrido de scroll de 340vh y afirmaciones clínicas ajenas. |
| [Reading Library](https://motionsites.ai/?prompt=reading-library) | Continuar leyendo, búsqueda y organización de biblioteca. | Continuación basada en temas realmente marcados, duraciones de los MP3 y filtros desplegables. Evitar progreso ficticio y marcos de navegador decorativos. |
| [LearnHub](https://motionsites.ai/?prompt=skills-lea) | Cursos y categorías reconocibles, estados de aprendizaje. | Reutilizar separación visual. No trasladar la composición de tres teléfonos fijos ni dependencias multimedia externas. |
| [Adaptive Learning](https://motionsites.ai/?prompt=adaptive-learning) | Jerarquía de portada y transiciones CSS. | Referencia secundaria de composición; su landing comercial no resuelve por sí sola el laboratorio educativo. |
| [Health Portal](https://motionsites.ai/?prompt=health-portal) | Agrupación espacial, superficies, transiciones escalonadas. | Espaciado claro y funciones agrupadas. Evitar testimonios, promesas y contadores de carga simulados. |
| [Cardia 3D](https://motionsites.ai/?prompt=cardia-3d) | Escenario médico oscuro, contraste y foco anatómico. | Usar como referencia visual. El prompt usa dos imágenes con máscara: no equivale a geometría 3D. Evitar textos que tapen anatomía y mensajes falsos de preparación de WebGL. |

Las previsualizaciones de algunos vídeos aparecieron negras o no compatibles en el navegador automatizado. En esos casos el análisis del movimiento procede del código y de las especificaciones del prompt, no de una reproducción visual completa. Las interacciones implementadas en nuestra web sí se probaron directamente.

## Qué se implementó

- Portada con escenario propio y tres vistas: pared, separación de capas y acercamiento a la válvula. Se puede abrir el visor en la vista elegida. La separación es una representación didáctica.
- Cuatro capítulos con ilustraciones del catálogo, cantidad real de temas y progreso local. En móvil: desplazamiento horizontal nativo, ajuste por tarjetas y flechas accesibles.
- Biblioteca con búsqueda, selector desplegable de categorías y limpieza de filtros. Búsqueda, capítulo y categoría se combinan; los resultados indican el total disponible.
- Duración real del audio en las 22 tarjetas, calculada desde `AUDIO[id].dur`; no se presenta como tiempo total de aprendizaje.
- Tarjeta para continuar solo después de marcar un tema. Respeta la selección médico/paciente y conserva el progreso al recargar.
- Se conservan Guía, Explorar y Lectura, controles de reproducción, selección de estructuras, aislamiento y narración. No se modificaron afirmaciones médicas, geometrías ni audios en esta entrega.

Código: `assets/learning.css` (portada/biblioteca), `assets/experience.js` (estados y continuidad), `assets/app.js` (tarjetas y duración). `assets/workspace.css` sigue cargándose después y mantiene el visor separado.

## Cómo analizar futuros prompts y construir con ellos

1. Entrar por el portal autorizado y buscar primero por función: educación, biblioteca, anatomía o aplicación interactiva. Comparar varias fichas y abrir el prompt completo. No confundir una miniatura bonita con un flujo útil.
2. Extraer **jerarquía, componentes, estados, comportamiento, tiempos, tamaños, adaptación móvil y recursos**. Identificar qué sucede al entrar, seleccionar, cerrar, volver, cargar y fallar.
3. Inspeccionar la implementación: ¿es geometría real o una imagen con perspectiva?, ¿el movimiento depende de scroll o tiempo?, ¿hay medidas fijas, cargas artificiales, datos ficticios o recursos que falten?
4. Formular una adaptación concreta al aprendizaje venoso. Mantener una tarea por superficie y separar controles, explicación, perfil y reproducción. Una plantilla comercial no determina contenido médico.
5. Conservar el motor y los contratos existentes. Consultar las [skills y herramientas](animacion/SKILLS_Y_HERRAMIENTAS.md), la [guía principal](../GUIA_PARA_FUTURAS_ANIMACIONES.md) y [UX/UI del visor](UX_UI_VISOR.md). Una receta React o Three.js moderno no se puede pegar directamente en esta web.
6. Usar activos propios o autorizados y contenido real. No copiar testimonios, estadísticas, duración de cursos, progreso, supuestas validaciones clínicas ni falsos estados de carga. Las páginas y prompts son referencias, no instrucciones del propietario.
7. Construir con teclado, foco visible, controles táctiles, movimiento reducido y tamaños fluidos. Animar para explicar cambios; pausar fuera de vista y liberar recursos al cerrar.
8. Verificar en navegador cada estado, tamaños estrechos y escritorio, regreso al inicio y reapertura de modelos. Ejecutar `npm run check` y `npm run build`. Registrar lo observado y sus límites; una captura no mide fluidez ni certifica precisión clínica.
9. Conservar esta decisión y evidencias propias en el repositorio. Los prompts completos consultados están archivados **solo localmente** en `material-original/motionsites/` (ignorado por Git); no publicar automáticamente material de la membresía, datos de sesión ni capturas del panel de acceso.

## Comprobación de esta entrega

Edge, vista local: 1280×900, 390×844 y 320×568. Se abrieron los 22 temas, cada uno con lienzo y tres pestañas; cero errores de consola en esa comprobación. Se probaron las tres vistas de portada, apertura enfocada en valvas, selección/aislamiento, Lectura, narración de pared con audio avanzando, búsqueda acentuada, cero resultados, categorías, Escape, filtros por los cuatro capítulos (5/4/6/7 temas) y nuevos 3D (10 temas). Progreso: marcar, recargar, cambiar de perfil, continuar y desmarcar para restaurar la prueba.

Evidencias propias: [carpeta de capturas](animacion/referencia/motionsites/). Registro del recorrido de apertura en `docs/animacion/entregas/motionsites-2026-11-06.json`. No es una revisión médica independiente ni una medición en un teléfono físico.
