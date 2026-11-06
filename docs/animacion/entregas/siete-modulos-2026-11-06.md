# Siete módulos nuevos: producción y revisión

Encargo del propietario: construir los siete primeros temas propuestos como modelos profesionales interactivos y recorridos narrados dentro de Flebo Animaciones. Conservar los doce módulos existentes y los perfiles paciente/médico.

## Alcance

1. Recorrido venoso del pie a la aurícula derecha.
2. Telangiectasias, venas reticulares y várices.
3. Compresión médica y actividad muscular.
4. Ultrasonido dúplex: anatomía y representación esquemática.
5. Filtración, tejido y drenaje linfático.
6. Componente clínico CEAP 2020.
7. Úlcera venosa: contexto, tejido y reparación conceptual.

## Decisiones de producción

Motor compatible: Three.js r128; piezas procedurales editables, registro semántico, geometría reutilizada, partículas instanciadas, cámaras y etiquetas del motor común. Nuevos módulos separados del archivo heredado. Una narración básica por tema; explicación médica adicional escrita. Los videos solicitados son los recorridos narrados de la web, no una exportación MP4 solicitada.

Se consultan las guías locales de geometría, animación, interacción, rendimiento, materiales, iluminación y diseño. No se añaden React ni motores incompatibles.

## Criterios médicos de aceptación

- Distinguir nomenclatura y variantes anatómicas; no llamar «femoral superficial» a la vena femoral.
- No identificar arteria/vena únicamente por rojo/azul Doppler ni prometer diagnóstico mediante una imagen esquemática.
- La compresión no repara por sí misma una válvula ni se prescribe desde un deslizador; requiere valoración, incluyendo circulación arterial.
- El líquido intersticial se relaciona con filtración y retorno linfático; no repetir un modelo de reabsorción venular universal.
- CEAP describe manifestaciones; no es un pronóstico ni una cronología. Incluir C4a/b/c y distinguir C5 de C6.
- Úlcera venosa multifactorial, con contexto de hipertensión venosa; no todas las heridas de pierna son venosas ni el esquema decide tratamiento.
- Tiempos, colores, escalas, flujos y deformaciones son convenciones didácticas, no CFD ni estimaciones clínicas.

## Estado

Implementados e integrados los siete modelos, con tres pasos guiados y pregunta por tema, selección/aislamiento, explicación paciente/médico y un recorrido narrado básico en español por modelo. El catálogo conserva los doce originales: ahora son **19 módulos, 57 pasos y 19 preguntas**. Hay 10 escenas 3D y 9 esquemas 2D; el conjunto contiene 178 tomas narradas.

La publicación se realiza desde la raíz de `main` en [GitHub Pages](https://imf-hub.github.io/flebo-animaciones/). El filtro **Nuevos 3D** permite encontrar el lote.

## Implementación reutilizable

| Tema / ID | Inicializador | Evidencia de composición |
| --- | --- | --- |
| `viaje-venoso` | `venousJourney3D` | [Captura](../referencia/siete/viaje-venoso.png) |
| `venas-superficiales` | `surfaceVeins3D` | [Captura](../referencia/siete/venas-superficiales.png) |
| `compresion-medica` | `compression3D` | [Captura](../referencia/siete/compresion-medica.png) |
| `ultrasonido-duplex` | `duplex3D` | [Captura](../referencia/siete/ultrasonido-duplex.png) |
| `edema-linfatico` | `edema3D` | [Captura](../referencia/siete/edema-linfatico.png) |
| `clasificacion-ceap` | `ceap3D` | [Captura](../referencia/siete/clasificacion-ceap.png) |
| `ulcera-venosa` | `ulcer3D` | [Captura](../referencia/siete/ulcera-venosa.png) |

`assets/anatomy-scenes.js` contiene `FLEBO3D`: perfiles de pierna, láminas con abertura, superficies cutáneas, vasos, partículas instanciadas, materiales, contexto y limpieza. `assets/extension-data.js` separa objetivos, fuentes, textos y guiones del dibujo. `assets/extension-audio.js` contiene las duraciones y marcas medidas.

El motor común conserva selección por geometría/lista/rótulo. `setBeforeSelect` permite hacer visible una pieza antes de seleccionarla; `tag` acepta una cuarta función para condicionar el rótulo al estado. Se reservan los espacios de encabezado y panel diagnóstico al resolver colisiones. La piel transparente de referencia permite seleccionar estructuras internas. No se ha implementado oclusión completa de etiquetas por profundidad.

Las partículas se ajustan al radio local: su tamaño más el desplazamiento radial permanece dentro de la luz. En compresión, el segmento central se deforma con continuidad y los tramos proximal/distal tienen fases de eyección/relleno diferentes; se evita representar partículas atravesando una válvula cerrada. No se calcula conservación de caudal ni hemodinámica clínica.

La microvasculatura del corte de úlcera sigue el plano dérmico al separar capas y se dispone junto al borde de la abertura, sin tender un vaso a través del espacio vacío. La separación es didáctica, no una deformación real de tejido vivo.

## Audio y sincronía conservados

Se generaron siete tomas con la voz pública **Rocío - Calm & Trustworthy** de HeyGen, idioma español y reproducción a 1×, sin alterar localmente la velocidad. El parámetro de velocidad del proveedor se omitió. Se solicitó el motor guardado por defecto y el proveedor devolvió `orca`. No se clonó una voz. Duración nueva total medida: **302,184376 s**, aproximadamente 5 min 2 s.

Las pausas y marcas de palabra del proveedor se cotejaron con el texto y la duración real de cada MP3. CEAP se editó en doce tomas usando esas marcas, sin cambiar palabras ni generar otra grabación: C0/C1, C2/C3, C4a/b/c y C5/C6 cambian con la frase correspondiente.

- [Procedencia y segmentación finales](narraciones-siete.json).
- [Solicitudes originales y marcas de palabra preservadas](voz-siete/solicitudes.json); los otros JSON de esa carpeta guardan las marcas por módulo sin URLs temporales del proveedor.
- `node scripts/compile-extension-audio.mjs` verifica MP3 con FFprobe, coteja texto/marcas, genera el registro y las marcas web. Usa Node y FFmpeg/FFprobe; reproducir la web no requiere estas herramientas ni conexión con HeyGen.
- `scripts/prepare-extension-narration.mjs` prepara solicitudes, pero no genera voz ni llama una API. Conserva las solicitudes locales existentes salvo `--replace`; no reemplazarlas para recompilar la grabación actual.

Se reprodujeron completos los siete recorridos en navegador, incluidos sus finales y cambios de toma. **Esto no es una auditoría auditiva/fonética independiente**: se comprobó la transcripción del proveedor, las marcas, los archivos y la reproducción. No afirmar que un especialista escuchó o aprobó las grabaciones.

## Comprobaciones realizadas

[Resumen estructurado de verificación](verificacion-siete.json).

- Sintaxis de los seis archivos JS de aplicación y coherencia de los 19 registros, audios, guiones, cámaras, marcas y recursos mediante `npm run check`.
- Build estático y hashes de estilos/scripts con `npm run build`; inventario con `npm run inspect:animations`. Se conserva `baseline.json`.
- Los 21 pasos nuevos cambiaron controles/estados; se comprobaron los dos perfiles y la retroalimentación de las siete preguntas.
- Se seleccionaron y aislaron las **40 piezas** nuevas, mostrando una ficha no vacía y regresando al conjunto.
- Reproducción completa de los siete MP3 y sus tomas. Compresión se repitió tras corregir la coordinación valvular. CEAP completó doce tomas; los demás, siete.
- Comprobación de nueve categorías CEAP y modificadores: C2r,S y C6r,S; no se añade r a C4c.
- Pausa: el reloj del mecanismo permaneció constante mientras se consultaba el panel de fuentes.
- Se abrieron de nuevo los **19 módulos** y se observó su canvas; no se observaron errores ni advertencias de consola durante esas comprobaciones.
- Escritorio en navegador Windows a 1280 × 720; móvil emulado a **390 × 844**. Los siete modelos renderizaron sin desbordamiento horizontal. El panel de dúplex se amplía a 366 px en ese viewport y puede reducirse.
- Los contadores puntuales de render de las reproducciones mostraron aproximadamente 60 fps en esta sesión. No se midieron percentiles, consumo GPU en bytes ni rendimiento en un teléfono físico.

## Fuentes y límites médicos

Ver la [matriz de contraste documental](../REVISION_MEDICA_SIETE_MODULOS.md). Cada tema nuevo presenta sus fuentes y alcance en el visor. El material está contrastado con publicaciones y documentos de organismos; **no equivale a una aprobación clínica por un especialista humano** ni a validación de un simulador fisiológico. No se ha hecho una revisión médica integral de todos los textos/audios heredados.

Los modelos son procedurales, simplificados y no proceden de imágenes de pacientes. No se añadieron GLB externos, CFD, una segunda pista de voz médica ni un exportador MP4. El entregable solicitado dentro de la web es la escena interactiva con recorrido narrado. Los originales y sus referencias se conservan.
