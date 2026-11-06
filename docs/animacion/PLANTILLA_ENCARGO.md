# Plantilla para encargar una animación a cualquier LLM

Este texto puede usarse como brief. Los campos entre corchetes se completan para cada pieza; la referencia y los criterios ya están definidos en el repositorio.

```text
Trabaja en Flebo Animaciones. Lee GUIA_PARA_FUTURAS_ANIMACIONES.md,
AGENTS.md y skills/flebo-animaciones/SKILL.md, y las referencias pertinentes.
Abre los SKILL.md locales necesarios y reutiliza los componentes ya desarrollados.

Quiero: [crear / mejorar] [mecanismo o módulo].
La idea que debe comprenderse es: [relación o proceso en una frase].
Audiencia: [pacientes / médicos / ambos].
Entrega: [web interactiva / vista de video / MP4 / combinación].
Formato o duración, si son necesarios: [datos del encargo].
Fuentes o material que debes respetar: [referencias y archivos disponibles].

Usa los módulos originales como mínimo. Escoge el mejor comparador para este
mecanismo y explica qué mejora observable vas a conseguir en movimiento,
estructura, profundidad, cámara o legibilidad. No basta añadir efectos.

Construye anatomía editable y coherente; vincula el movimiento con el mecanismo.
Usa 3D real si la relación espacial lo requiere. Prepara estados claros, transiciones
continuas y reposos de lectura. Si hay flujo, que siga el conducto y el estado de las
válvulas. Coordina acciones, foco y subtítulos con el audio final.

Conserva una versión funcional mientras trabajas. Verifica versiones de las
herramientas y no mezcles APIs nuevas con Three.js r128 sin una migración explícita.
No tomes las ecuaciones o cifras ilustrativas heredadas como validación clínica.

Entrega una pieza utilizable, código/activos editables, fuentes, comparación con
la referencia y comprobaciones de movimiento, rendimiento y legibilidad a tamaño
real. Indica los límites de la revisión. Si pido MP4, exporta y comprueba el archivo.
```

## Ficha de producción

| Decisión | Qué registrar |
| --- | --- |
| Referencia | ID y revisión del mejor módulo comparable. |
| Mejora | Defecto concreto a resolver o capacidad nueva que será observable. |
| Representación | Motor, versión, escala y motivo de elegir 2D, 3D o una combinación. |
| Anatomía | Piezas, conexiones, puntos de inserción, orientación y simplificaciones. |
| Parámetros | Nombre, unidad, rango, efecto visual y si está medido o es ilustrativo. |
| Tiempo | Audio final o FPS/tiempo absoluto, semilla y estrategia de reconstrucción. |
| Recursos | Archivos, origen, licencias y formatos editables. |
| Revisión | Dispositivo/viewport, escenas comprobadas, evidencias, defectos y límites. |

## Storyboard por estados

Para cada toma, registrar: inicio/fin, frase clave y momento de esa frase, estructura visible, cambio que ocurre, foco, cámara, etiquetas imprescindibles, estado final y elementos que se retiran. Estos tiempos se fijan o corrigen sobre el audio final.

Ejemplo de estructura editorial, sin imponerla a todos los mecanismos:

| Estado | Función | Movimiento útil |
| --- | --- | --- |
| Orientación | Ubicar la estructura y sus conexiones | Giro breve o revelado de capas con un ancla estable. |
| Mecanismo normal | Mostrar relación causa → efecto | Cambian valva, pared y flujo de manera coordinada. |
| Cambio relevante | Aislar la diferencia que se estudia | Un parámetro cambia con continuidad, sin perder la referencia. |
| Consecuencia | Hacer visible el resultado | El flujo o la estructura responden al estado anterior. |
| Reposo | Dar tiempo para observar y concluir | Cámara y etiquetas estables; permanece solo lo necesario. |

## Registro de aceptación

No llenar «aprobado» por defecto. Registrar para cada dimensión aplicable de `CALIDAD.md`: evidencia, resultado, defecto pendiente y corrección. Distinguir revisión de una captura, de una sección de movimiento y de la pieza completa. Los objetivos de FPS y sincronía deben medirse antes de presentarlos como logrados.
