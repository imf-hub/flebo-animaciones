# Calidad mínima y cómo superarla

Esta es una especificación del propietario para el trabajo futuro. La referencia es la versión original conservada en `baseline.json`. Las métricas siguientes son objetivos de producción y criterios de revisión; no son resultados de una medición ya realizada sobre los módulos originales.

## Qué cuenta como una animación de este nivel

El espectador debe poder reconocer **qué estructura es, qué cambia, qué causa ese cambio y qué consecuencia tiene**. La representación debe seguir siendo comprensible al moverse y al detenerse en un estado significativo. Para la web, el usuario debe poder explorar o comparar las variables relevantes. Para un video, el montaje debe conducir esa exploración con claridad.

Los mejores comparadores son `wall3D` para pared/valvas, `compart3D` para relaciones y capas, `tort3D` para cambios de forma y `valveSim` para flujo y mecanismo en corte. No es necesario usar todos los recursos de todos los ejemplos en cada pieza.

## Puertas de aceptación

| Dimensión | Mínimo exigido en nuevas piezas | Evidencia útil |
| --- | --- | --- |
| Comprensión | Una idea por plano o estado; cambio causal y resultado distinguibles. | Ver la secuencia a velocidad normal y explicar el mecanismo sin leer el guion. |
| Anatomía | Capas, conexiones y orientación coherentes; simplificaciones identificadas. | Vista general, detalle y corte o giro que demuestren relaciones. |
| Movimiento | Continuidad de posición, orientación y forma; velocidades con significado. | Reproducción normal y revisión de puntos de unión/inversión. |
| Calidad 3D, si aplica | Volumen real, superficies continuas, grosor y profundidad legibles; interacción o cámaras que lo evidencien. | Giro, separación de capas o sección; no basta una captura frontal. |
| Flujo/partículas, si aplica | Trayectoria dentro del conducto, dirección clara y respuesta al mecanismo. | Comprobar sístole/relajación o estados equivalentes; vigilar penetraciones y saltos. |
| Narración, si aplica | Audio comprensible; frase, acción, foco y subtítulo coordinados con el audio final. | Escuchar inicio, cambios de toma y final; revisar también la secuencia completa. |
| Legibilidad | Rótulos importantes legibles, sin colisiones ni objetos clave tapados; jerarquía clara. | Ver a tamaño real en escritorio y móvil o en el formato final del video. |
| Usabilidad | Pausa/reinicio, errores recuperables, acceso por teclado y movimiento reducido apropiados. | Interacción real y reapertura; pausa de las capas temporales que corresponda. |
| Rendimiento | Respuesta fluida en el equipo objetivo; carga selectiva y recursos liberados. | Medición con equipo/escena/viewport descritos, no solo una afirmación de «optimizado». |
| Rigor | Fuentes de afirmaciones y límites del modelo; imágenes y cifras no inducen a una conclusión falsa. | Relación entre afirmación, fuente, fecha y elemento visual que la representa. |

No compensar un fallo grave de anatomía, sincronía o legibilidad con una iluminación vistosa. Si una dimensión no aplica, consignar por qué. Un error anatómico conocido, audio truncado o control roto bloquea la entrega de esa pieza.

## Dirección visual y del movimiento

**Estructuras.** Crear piezas con nombres semánticos: pared, luz, valva, seno, tejido o vaso conectado. Usar radios y espesores consistentes; evitar tubos que simplemente se interpenetran en las bifurcaciones. La unión debe poder verse en el encuadre que se entrega. En tejidos blandos, priorizar cambios continuos de superficie y una sensación de volumen; una textura compleja no corrige una forma incorrecta.

**Valvas y deformaciones.** Conservar inserciones y topología durante el cierre. Los bordes se acercan con un movimiento coherente y sin atravesar la pared; el hueco residual, si forma parte de la explicación, se observa con claridad. Preferir mallas preparadas, morph targets, rig o deformación de vértices según el caso. No reconstruir una escena completa para cambiar una apertura.

**Partículas.** Densidad suficiente para leer el flujo sin ocultar la pared. Variación controlada de fase, posición radial y orientación; semilla estable para comparaciones y render. Mantener continuidad al pasar de un tramo a otro. Si hay recirculación o un perfil de velocidad, explicar su carácter ilustrativo o verificar su sustento. No anunciar una simulación hemodinámica/CFD validada cuando son trayectorias artísticas.

**Cámara.** Hacer movimientos con una función: localizar, acercar, revelar una capa o comparar. Mantener un punto de referencia anatómico. Encadenar plano general → detalle → resultado cuando sirva a la idea; no imponer siempre ese patrón. Dejar reposos para escuchar y observar. Evitar giro constante, rebotes, cambios de eje sin orientación y zooms que atraviesen la pared o corten el mecanismo.

**Luz y materiales.** Separar planos y superficies con luz, rugosidad y contraste. Usar transparencia solo cuando ayude a ver una relación; revisar orden de dibujo, oclusión y `depthWrite`. No recurrir automáticamente a cristal brillante, bloom, sombras pesadas o efectos de posproducción. El tejido y las valvas deben ser distinguibles también en un móvil.

**Rótulos.** Mostrar primero el nombre imprescindible para la idea actual. Resolver colisiones, permitir ocultar etiquetas y evitar que un rótulo de una capa se vea sobre otra como si perteneciera a ella. Mantener texto de interfaz en píxeles de pantalla; en Canvas, calcular un tamaño legible o usar rótulos DOM. Como punto de partida, probar etiquetas críticas de al menos 14 px en pantalla estrecha y texto de lectura de 16 px; ajustar mediante inspección, no reducir todo el contenido para que quepa.

**Tiempo.** El movimiento continuo que representa una tasa debe respetar esa tasa; no aplicarle un easing arbitrario que cambie su significado. Las entradas y cámaras sí pueden desacelerar hasta una pose estable. Para suavizado independiente del refresco, usar `alpha = 1 - exp(-lambda * dt)` en vez de una fracción constante por fotograma. Para render por tiempo absoluto, muestrear una transición con inicio y fin explícitos.

## Objetivos técnicos iniciales

- Medir buscando aproximadamente 60 fps en escritorio y al menos 30 fps en el móvil objetivo: presupuestos orientativos de 16,7 y 33,3 ms por fotograma. Registrar percentiles de tiempo, pausas perceptibles y el equipo; no declarar estos objetivos alcanzados sin medición.
- Para nuevos videos, buscar que el cambio semántico y su frase clave coincidan dentro de unos 100 ms, salvo anticipación deliberada documentada. Verificar con los timestamps del audio final.
- En exportación, fijar resolución, FPS, duración y relación de aspecto. Usar 1080p como entrega habitual si el encargo no exige otra; no reescalar una captura pequeña para llamarla 1080p.
- Comprobar al menos un viewport estrecho de 390 × 844 y el escritorio de referencia. Si no se usa un teléfono real, indicarlo.
- Abrir/cerrar varias veces los módulos afectados y observar que no se acumulan escenas, audios, observadores o listeners. Cuando se mida memoria GPU, diferenciar cachés estables de crecimiento sostenido.

## Prioridades específicas encontradas en el código actual

| Prioridad | Mejora propuesta | Razón y aceptación |
| --- | --- | --- |
| P1 | Separar reloj de audio, estado reproducible y dibujo | Hoy conviven `currentTime`, integración `dt`, temporizadores y `performance.now()`. Poder reproducir el mismo estado desde un tiempo arbitrario y congelar las capas temporales pertinentes al pausar. |
| P1 | Rótulos con prioridad y detección de colisiones | `make3D().tag` proyecta puntos pero no evita solapamientos/oclusiones. Texto crítico legible en móvil y sin cruces con subtítulos. |
| P1 | Acciones por ID estable | `vAct` depende del texto visible y `startsWith`. Renombrar un control no debe romper el guion. |
| P2 | Deformación/reuso de buffers | `tort3D` y `compart3D` reconstruyen tubos durante cambios. Mantener calidad y continuidad reduciendo asignaciones; comprobar el impacto mediante perfilado. |
| P2 | Geometría anatómica más fina | Mejorar bifurcaciones, inserciones, valvas y tejidos. Demostrar la mejora con el plano que antes revelaba el defecto. |
| P2 | Composición específica para móvil | Los 1000 × 600 lógicos hacen pequeños muchos rótulos al encoger el conjunto. Cambiar encuadre y selección de información, sin perder el mecanismo. |
| P3 | Modelos GLB y animación de rig/morph cuando lo justifiquen | Permiten anatomía y deformaciones elaboradas fuera del navegador. Incorporar pipeline, licencias y niveles de detalle; no imponer descarga pesada a toda la galería. |
| P3 | Exportación de video determinista | Actualmente el modo video es una reproducción web. Producir el mismo plano a cualquier fotograma y un archivo final sin interfaz de navegador. |

Estas mejoras son trabajo futuro, no cambios incluidos en este análisis.

## Cómo registrar la evaluación

Guardar con la pieza: comparador, dimensiones aplicables, mejora concreta, defectos encontrados/corregidos, archivos de evidencia, revisión de movimiento, equipo/viewport, fuentes y limitaciones. No inventar calificaciones para los módulos de referencia ni usar un promedio para ocultar un fallo. Una captura demuestra composición; una reproducción demuestra además movimiento y sincronía.
