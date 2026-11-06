# Cierre de temas pendientes y revisión del catálogo

Encargo: completar los temas que faltaban y revisar el contenido médico de la web. Los pendientes del listado eran **ablación endovenosa, trombosis venosa superficial y obstrucción ilíaca**. Se conservan los siete temas añadidos previamente y los doce originales, con sus correcciones.

## Entrega implementada

| Tema | Inicializador | Qué se puede explorar |
| --- | --- | --- |
| `ablacion-endovenosa` | `endovenousAblation3D` | Segmento superficial, drenaje profundo, catéter, tumescencia, referencia nerviosa y cierre/fibrosis conceptual. |
| `trombosis-venosa-superficial` | `superficialThrombosis3D` | Trombo e inflamación, unión con sistema profundo y TVP coexistente en un escenario independiente. |
| `obstruccion-iliaca` | `iliacObstruction3D` | Cruce arterial anterior, vena ilíaca izquierda y referencia lumbar posterior; despiece, bandas postrombóticas y vía colateral. |

Los tres son modelos 3D reales en Three.js r128, con 23 piezas seleccionables/aislables, nueve pasos guiados, tres preguntas y perfiles paciente/médico. Tienen siete tomas narradas cada uno. No se usaron clips generativos para justificar anatomía.

El catálogo completo contiene **22 módulos, 13 modelos 3D, 9 esquemas 2D, 66 pasos, 22 preguntas y 199 tomas narradas**. El filtro «Nuevos 3D» distingue los diez añadidos, aunque todos los temas cuentan ahora con fuentes. La revisión de los originales no los convierte en temas nuevos.

## Cambios médicos y didácticos

La [matriz del catálogo completo](../REVISION_MEDICA_CATALOGO_COMPLETO.md) explica las correcciones y fuentes por tema. Las afirmaciones clínicas de los originales se revisaron y sus doce guiones se volvieron a grabar. Las voces anteriores se conservan en el historial Git y en una copia local excluida de la web.

Se retiraron las inferencias no validadas de dosis adecuada, riesgo porcentual de TVP, dímero D, Villalta, presión clínica y pronóstico. Se corrigieron las explicaciones de cierre valvular, retorno linfático, evolución variable de enfermedad y nomenclatura. Las comparaciones siguen siendo interactivas; sus respuestas elegidas no se presentan como resultados predichos.

Se revisaron también puntos rotulados: femoral común en la unión, filtración sin reabsorción universal y fibrina pericapilar como mecanismo propuesto. La lista de comprobación debe incluir siempre rótulos, flechas, gráficas y acciones, además del guion escrito.

## Arquitectura reutilizable

- `assets/clinical-scenes.js`: `CLINICAL3D.segment` separa piezas sobre un mismo eje continuo. `CLINICAL3D.deform` actualiza buffers de tubos, conserva topología y recalcula normales/límites. Se calculan marcos y muestras una vez por geometría. El cambio se aplica al modificar el estado, no se recrea una malla por fotograma.
- La vena ilíaca modifica sección y centro local. Las partículas usan el mismo desplazamiento y un radio conservador. No se calcula conservación de caudal, resistencia, gradiente o presión.
- En ablación, la punta y el catéter comparten eje; los eritrocitos se mantienen alrededor del instrumento y se omiten en el tramo cerrado. El frente ilustrado no invade la conexión profunda. No se codifica una distancia terapéutica.
- En TVS se omiten partículas dentro de la región trombosada del dibujo, sin inferir una oclusión completa ni calcular el flujo residual. La unión es una pieza real seleccionable. El escenario con TVP es independiente y no una secuencia que anuncie que toda TVS se extenderá.
- `makeUI().toggle` ofrece ahora `set(value)`, que sincroniza el control y su acción. La selección de una pieza oculta puede activar el estado necesario para mostrarla.
- El modelo original de compartimentos incorpora dos cúspides curvas por nivel, con inserciones que se conservan y coordenadas adaptadas al eje del vaso. La perforante competente detiene el flujo ilustrado durante el cierre. El tamaño de sus eritrocitos se limita al radio local. Una prueba de 20 estados comprueba finitud, contención radial e inserción de la geometría normalizada, sin certificar fisiología.
- Los anillos del modelo de tortuosidad se identifican como marcadores de nivel valvular; no se presentan como la geometría real de una válvula.
- Los rótulos y placas de los esquemas 2D consideran la parte visible del canvas y pueden partir textos largos para evitar cortes de borde. Esto no implementa una solución completa de colisiones entre todos los rótulos 2D.
- Caminar/detenerse y pausar/reproducir evolución tienen acciones explícitas e idempotentes. Cambiar sus textos requiere comprobar los destinos de los guiones.

## Narración y mantenimiento

Se realizaron **15 solicitudes iniciales de grabación**, una por guion y sin retomas ni muestras alternativas: las doce revisiones y tres temas nuevos. Voz pública Rocío - Calm & Trustworthy, español y motor guardado por defecto; el servicio informó `orca`. Se omitió el parámetro de velocidad del proveedor; los archivos no se aceleraron localmente y se reproducen en la web a 1×. Duración conjunta medida: **771,865908 s**, aproximadamente 12 min 52 s. Las siete grabaciones previas se conservan.

- [Registro final de los quince audios](narraciones-cierre.json).
- [Solicitudes originales](voz-cierre/solicitudes.json) y marcas de palabra por archivo en la misma carpeta, sin URLs temporales de descarga ni credenciales.
- `scripts/prepare-reviewed-narration.mjs` prepara este lote sin llamar servicios y se niega a sobrescribir solicitudes existentes.
- `scripts/compile-reviewed-narration.mjs` coteja texto, transcripción, pausas, duración MP3 medida con FFprobe y hash. Fusiona sus marcas con las del lote anterior.
- `scripts/compile-extension-audio.mjs` conserva ahora los otros lotes al recompilar los siete previos.

**Autoridad única:** `assets/extension-audio.js` contiene las marcas y el hash corto de los 22 MP3. `AUDIO` comienza vacío en el reproductor y se completa desde ese registro. Conservar `AUDIO_DIR='audio/'`; al unificar el registro se detectó y corrigió una referencia ausente a esta ruta durante QA.

El reproductor usa `audio/<id>.mp3?v=<hash>`. Así una narración corregida no utiliza un MP3 antiguo de caché con marcas nuevas. Cambiar solamente el texto o la duración no basta.

## Verificación

[Registro estructurado de verificación](verificacion-cierre.json).

- Los 22 temas abren su canvas; los 13 modelos 3D informan render correcto. La pasada final no registró errores ni advertencias de consola.
- Se verificaron los destinos de todas las acciones de guion y pasos de los 22 temas: sin destinos ausentes tras corregir los nombres antiguos de escleroterapia.
- Los objetivos de ambos perfiles y las 22 respuestas correctas muestran su contenido y retroalimentación.
- Los tres modelos nuevos completaron nueve pasos, selección/aislamiento de sus 23 piezas y regreso al conjunto. Se incluyó el caso de seleccionar una pieza oculta en otro estado.
- Se reprodujeron completos los 15 audios generados/revisados, con sus 145 tomas (124 de los originales y 21 nuevas). Compartimentos se repitió después de mejorar sus valvas: 16 reproducciones registradas, 15 temas únicos. Las siete narraciones conservadas mantienen su evidencia de reproducción del lote anterior.
- Guion, transcripción del proveedor, duración FFprobe, pausas, marcas y hash se contrastan al recompilar ambos lotes. El resultado conserva los 22 audios y sus versiones.
- Escritorio a 1280 × 720. Los 22 temas renderizaron en móvil emulado a 390 × 844, sin desbordamiento horizontal. Se revisó además el acercamiento del esquema de microcirculación y la lectura del cruce ilíaco.
- Las muestras puntuales de FPS de las escenas 3D narradas rondaron 60 en esta sesión. No son percentiles ni un benchmark de teléfono físico.
- `npm run check` incluye la prueba geométrica de 20 estados de valvas y los contratos de los 22 temas. `npm run build` prepara raíz publicada y exportación estática. Se comprobó además que ambos compiladores de audio se pueden ejecutar consecutivamente sin borrar otros lotes.

Capturas de composición: [ablación](../referencia/cierre/ablacion-endovenosa.png), [TVS](../referencia/cierre/trombosis-venosa-superficial.png), [obstrucción ilíaca](../referencia/cierre/obstruccion-iliaca.png). Una captura no demuestra por sí sola la fluidez o exactitud de una secuencia.

## Límites

Contraste documental médico y comprobaciones técnicas/visuales; **no aprobación clínica independiente**. Las formas no son anatomía individual ni histología a escala. Los colores, flujos y fases son docentes. Los mecanismos no calculan decisiones clínicas.

La comprobación de transcripción/timestamps y reproducción completa no equivale a una auditoría fonética independiente. El modo narrado es una reproducción dentro de la web; no se solicitó ni se entrega un MP4 exportado. La emulación móvil, cuando se registre, se distinguirá de una prueba en un dispositivo físico.
