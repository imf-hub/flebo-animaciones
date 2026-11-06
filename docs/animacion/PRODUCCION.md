# Producir e integrar animaciones y videos

**Estado vigente (22 módulos):** consultar [la entrega de cierre](entregas/cierre-temas-2026-11-06.md). Todos los tiempos y versiones MP3 se concentran en `assets/extension-audio.js`; el reproductor conserva `AUDIO_DIR` y añade el hash a la URL del audio. Ambos compiladores de lotes fusionan registros para no borrar otras narraciones. El contrato de tomas descrito a continuación sigue siendo válido.

Para extender la web de aprendizaje, completar también el contrato de `COURSE` y las piezas semánticas descritos en [Experiencia interactiva](EXPERIENCIA_INTERACTIVA.md). El catálogo visual y el recorrido deben seguir siendo coherentes.

## Elegir la representación

| Necesidad | Ruta aconsejada |
| --- | --- |
| Corte con mecanismo, flujo, comparación y controles sencillos | Canvas 2D actual; conservar la escala lógica y mejorar el encuadre/rotulación. |
| Capas, relaciones espaciales, giro y deformación paramétrica | Three.js actual, con geometría procedural e instancias. |
| Anatomía orgánica compleja, rig o morph authorados | Crear un activo en Blender u otra herramienta de modelado y preparar GLB; incorporar el cargador compatible en un cambio aislado. |
| Video renderizado con control exacto por fotograma | Escena muestreable por tiempo + compositor como Remotion, o pipeline 3D de render y edición. |
| Gráficos 2D y montaje sobre material ya producido | Herramientas de motion graphics/edición disponibles; reutilizar fuentes y tiempos finales. |

La elección se justifica por el mecanismo y el resultado pedido. No migrar toda la web para añadir una única animación ni usar un video generativo como única prueba de una relación anatómica precisa.

## Contrato actual de un módulo web

El catálogo `MODS` contiene:

```js
{
  id: 'id-estable-en-minusculas',
  cat: 'Categoría',
  title: 'Título comprensible',
  kind: '2d', // o '3d'
  init: inicializador,
  blurb: 'Qué se puede observar y explorar.',
  text: {paciente: '<p>Explicación…</p>', medico: '<p>Explicación…</p>'},
  thumbT: 1 // segundos del estado de miniatura 2D
  // En 3D: thumb(ctx), dibuja una miniatura 2D de referencia.
}
```

Para 2D: `inicializador({ctx}, ui) → {draw(dt, S)}`. Para 3D: `inicializador(host, ui) → {frame(dt, S), destroy(), cam, ctrl}`; `cam` y `ctrl` son necesarios para cámaras dirigidas. `make3D(host)` ofrece escena, render, etiquetas, cámara, controles y limpieza. No copies un módulo con IDs o variables globales que colisionen.

`ui` ofrece `slider`, `toggle`, `segmented`, `buttons`, `readout` y `legend`. El controlador establece el parámetro; la simulación determina la consecuencia visual. El catálogo y sus textos no deben convertirse en una segunda simulación independiente.

El generador de miniaturas usa `STUB`, no los controles reales. Por ello el inicializador no puede necesitar efectos externos para crear una miniatura y debe disponer de valores iniciales válidos.

## Contrato del guion heredado

Cada toma de `VIDEOS[id]` puede declarar:

| Campo | Significado actual |
| --- | --- |
| `s` | Texto narrado; las frases alimentan subtítulos. |
| `a` | Acciones sobre controles. |
| `c` | Cámara 2D `[centroX, centroY, zoom]` o 3D `{p:[x,y,z], t:[x,y,z]}`. |
| `sp` | Elipse de foco 2D `[x,y,radioX,radioY]`. |
| `pt` | Puntos rotulados 2D `[x,y,texto]` o 3D `[x,y,z,texto]`. |
| `v` | Velocidad de la simulación en esa toma; no equivale a un cambio de velocidad de narración. |

Acciones existentes: `['btn', texto]`, `['seg', etiqueta, índice]`, `['sl', etiqueta, valor]`, `['tg', etiqueta, booleano]`, `['anim', etiqueta, valorFinal, duraciónSegundos]`. Sus etiquetas son dependencias reales del guion: no cambiarlas sin verificar las tomas afectadas. Para una extensión grande, introducir IDs de control conservando un adaptador para los guiones existentes.

Para la narración grabada: `audio/<id>.mp3` y `AUDIO[id] = {dur, cues:[{t, s:[inicioFrase,…]},…]}`. `t` y los inicios de frase son **segundos absolutos en el MP3**, no relativos a la toma. Cada entrada `cues[i]` corresponde a `VIDEOS[id][i]`. Si se cambia el audio o una frase, volver a alinear y verificar sus marcas; no conservar los tiempos antiguos por conveniencia.

## Ruta recomendada para nuevas piezas reproducibles

Separar cuatro responsabilidades, con la menor estructura que resuelva el encargo:

```text
definición anatómica + fuentes
            ↓
sample(t, parámetros, semilla) → estado de la escena
            ↓
render(estado, cámara, formato) → imagen

guion + audio final → tiempo/toma/foco/subtítulo
```

`sample` no debe depender del fotograma anterior, de `Date.now()`, de `performance.now()` ni de aleatoriedad nueva en cada render. Para un proceso que requiera integración, usar pasos fijos, entradas con semilla y checkpoints/reconstrucción de estado; no asumir que toda simulación se resuelve con una fórmula analítica. Separar el reloj editorial del tiempo físico/ilustrativo.

El archivo [muestreo-tiempo.mjs](../../examples/animacion/muestreo-tiempo.mjs) demuestra un núcleo determinista con estados y partículas; es una ayuda de programación, no una muestra de calidad visual. Sus parámetros están en unidades ilustrativas.

- **Web interactiva:** un controlador administra el tiempo activo y los cambios de parámetros. Pausar congela el reloj pertinente; la cámara puede seguir siendo manipulable si esa es la interacción elegida. Evitar tweens ocultos que continúen desplazando la cámara dirigida mientras la pieza dice estar pausada.
- **Video:** `t = frame / fps`; cada fotograma se obtiene independientemente del orden de render. Cámara, deformación, rótulos y parámetros se evalúan desde esa misma línea de tiempo. Usar intervalos `[inicio, fin)` y un único dueño por propiedad para evitar saltos o doble aplicación de transformaciones.
- **Audio:** usar el archivo final como referencia editorial; mantener el tiempo de narración separado de velocidades de partículas o procesos. Una cámara puede anticipar el lugar, pero la nueva información debe aparecer con la frase que la explica.

## Geometría y movimiento 3D

Construir primero la estructura y su espacio de referencia. Definir ejes, escala, puntos de unión, orientaciones y capas; después añadir partículas, luz y rótulos. Para vasos curvos usar un eje y una base local estable; revisar inversiones de la base, torsión y discontinuidades en bifurcaciones. El parámetro sobre una curva no siempre representa distancia uniforme: usar distancia de arco cuando la velocidad espacial deba ser uniforme.

Para deformación continua, conservar la correspondencia de vértices. Las normales deben seguir la superficie. En una malla procedural pequeña puede actualizarse un buffer; para una forma compleja pueden convenir morph targets o un rig. Evitar asignar nuevas geometrías/materiales por fotograma. Medir antes de mover cálculos a shaders: una representación difícil de editar o verificar no es necesariamente una mejora.

Instanciar eritrocitos/elementos repetidos y reutilizar matrices, vectores y colores. Al mutar instancias, marcar los buffers afectados. Mantener partículas en la luz y controlar su transferencia entre tramos. No ocultar penetraciones con cámara o transparencia si son visibles en la exploración del usuario.

## Preparar un video exportable

La aplicación actual no contiene un exportador MP4. Implementar esta ruta cuando se pida un archivo final:

1. Fijar formato y duración; preparar el guion y audio final con sus marcas.
2. Construir una composición reproducible por tiempo/fotograma, reutilizando el modelo anatómico. Crear encuadres propios para 16:9, 9:16 u otro formato; no encoger la web completa dentro de un video.
3. Renderizar sin botones, galería, cursor ni marcas de depuración. Conservar identidad institucional de forma proporcionada.
4. Componer narración/subtítulos; entregar MP4 compatible y los archivos de texto de subtítulos cuando formen parte del encargo. Revisar licencia y configuración del motor elegido antes de usar un servicio de render.
5. Comprobar metadatos de resolución, FPS, duración y pistas; reproducir el resultado completo para detectar cortes, silencios, deriva, frames negros y rótulos fuera de zona.

Una vista de Remotion, una secuencia de imágenes y un MP4 son entregables diferentes. Nombrar exactamente el que se produjo.

## Integración y cierre

Para añadir al catálogo actual: incluir inicializador y registro `MODS`, miniatura, textos, `VIDEOS`, MP3 y marcas `AUDIO`; integrar recursos locales y licencias que se hayan añadido. Si el encargo no lleva narración, definir explícitamente un modo de módulo sin audio y adaptar el contrato/validador; no dejar archivos ficticios para satisfacer una comprobación.

Ejecutar `npm run inspect:animations`, `npm run check` y `npm run build`. El validador admite ampliar el catálogo y protege los IDs del mínimo; no exige que el total siga siendo exactamente 12. Comprobar después el movimiento y los controles en navegador. La validación de datos no sustituye la inspección visual.

Mantener los originales y las evidencias locales fuera del despliegue. La referencia original se conserva; los cambios autorizados del producto pueden evolucionar su implementación sin degradar los mecanismos o capacidades pertinentes.
