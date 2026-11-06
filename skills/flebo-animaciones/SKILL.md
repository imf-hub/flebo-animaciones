---
name: flebo-animaciones
description: Crear y mejorar animaciones médicas 2D/3D y videos de Flebo Animaciones con anatomía editable, movimiento explicativo, cámara, partículas y narración sincronizada; integrar módulos conservando al menos la calidad de la referencia del proyecto.
---

# Crear animaciones mejores que la referencia

La instrucción del propietario es tomar las animaciones originales como **suelo de calidad**. Conserva sus fortalezas —estructuras por capas, mecanismos que cambian de estado, flujo relacionado con las válvulas, exploración 3D y explicación guiada— y supera sus limitaciones. Evalúa el mecanismo y la legibilidad, no solo la apariencia de una captura.

Esta skill vive en el repositorio. Se usa leyendo este archivo desde `AGENTS.md`; no presupone instalación global ni activación automática en todos los agentes. Si se copia a otro lugar, conserva el acceso a `docs/animacion/` y a los ejemplos del proyecto.

## Escoger el camino

La guía operativa completa para conservar y reutilizar lo desarrollado es [GUIA_PARA_FUTURAS_ANIMACIONES.md](../../GUIA_PARA_FUTURAS_ANIMACIONES.md). Consultarla al iniciar una nueva pieza; enlaza las skills locales y explica qué componentes del motor reutilizar y cómo dejar una ficha de entrega.

Antes de modificar la web actual, leer [la evolución interactiva](../../docs/animacion/EXPERIENCIA_INTERACTIVA.md). Describe el recorrido, perfiles, pasos, fichas y las APIs para seleccionar, aislar y separar modelos. Para profundizar en cada área, usar las [siete guías instaladas](../external/README.md) según la tarea. La capa didáctica es parte de la calidad: toda estructura debe ayudar a comprender una relación o un mecanismo.

- **Extender la web actual:** lee [arquitectura](../../docs/animacion/ARQUITECTURA.md) y [contratos de integración](../../docs/animacion/PRODUCCION.md). Inspecciona el inicializador del módulo más parecido. Sigue la versión real de Three.js.
- **Mejorar movimiento o 3D:** usa [criterios y prioridades](../../docs/animacion/CALIDAD.md). Revisa capas, continuidad de malla, deformación, trayectoria, cámara y etiquetas como un sistema.
- **Hacer un video exportable:** consulta la ruta de tiempo absoluto y render de [producción](../../docs/animacion/PRODUCCION.md). Reutiliza el modelo conceptual, no dependas de grabar la interfaz o de temporizadores del navegador.
- **Elegir nuevas capacidades:** consulta [skills y herramientas](../../docs/animacion/SKILLS_Y_HERRAMIENTAS.md). Selecciona solo las necesarias y comprueba versiones; una skill de Three.js moderno no actualiza este proyecto automáticamente.

## Flujo de producción

1. Especifica en una frase qué relación o mecanismo debe comprenderse. Revisa las fuentes y distingue datos medidos de parámetros ilustrativos.
2. Escoge uno de los mejores módulos como comparación: `wall3D` para capas y válvulas, `compart3D` para relaciones espaciales/partículas, `tort3D` para transformación continua, `valveSim` para mecanismo 2D. Identifica la mejora concreta.
3. Prepara un breve storyboard: contexto, foco, transformación causal, consecuencia y reposo. Decide qué se retira antes de añadir nueva información. Parte de [la plantilla de encargo](../../docs/animacion/PLANTILLA_ENCARGO.md).
4. Construye geometría editable con semántica anatómica y parámetros comprensibles. Separa modelo, estado, presentación y guion cuando la complejidad lo justifique. Prueba pronto el plano más difícil.
5. Define el tiempo y la autoridad sobre cada propiedad. Usa aleatoriedad con semilla, transiciones acotadas y trayectorias continuas. Para exportar, el mismo tiempo debe producir el mismo estado sin depender de la historia de reproducción.
6. Añade narración, subtítulos, cámara y señales de foco sobre el audio final. Conserva pausas de lectura y contexto espacial. No muevas todos los elementos al mismo tiempo.
7. Integra y ejecuta los controles del catálogo. Revisa en movimiento y a tamaño de consumo. Corrige los problemas observados y compara contra la referencia con los criterios de calidad.

## Cierre de trabajo

Entregar una escena o video utilizable y sus fuentes editables. Incluir: objetivo, mejora lograda, evidencia visual/de reproducción, comprobaciones técnicas y límites médicos o de dispositivos que queden pendientes. Para un encargo solo documental, entregar instrucciones y recursos comprobados sin afirmar que las mejoras de animación ya están implementadas.

No reemplazar un mecanismo por un póster con desplazamiento. No añadir complejidad visual sin función. No reducir controles o claridad para alcanzar una captura vistosa. Si una dimensión no aplica a la pieza, justificarla en vez de añadirla artificialmente.
