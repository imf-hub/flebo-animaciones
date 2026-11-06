# Guías externas instaladas en este repositorio

Instaladas el 6 de noviembre de 2026 por solicitud del propietario. Son documentación para agentes; la web no las ejecuta ni las descarga. Las siete guías iniciales se conservan en el proyecto; `web-design-guidelines` también se instaló en el directorio personal de Codex. Leer únicamente las necesarias para el trabajo y dar prioridad a la petición del propietario y al contexto médico del proyecto.

| Carpeta | Procedencia fijada | Licencia |
| --- | --- | --- |
| `threejs-geometry` | CloudAI-X/threejs-skills | MIT |
| `threejs-animation` | Mismo repositorio | MIT |
| `threejs-interaction` | Mismo repositorio | MIT |
| `threejs-materials` | Mismo repositorio | MIT |
| `threejs-lighting` | Mismo repositorio | MIT |
| `threejs-performance` | Mismo repositorio | MIT |
| `frontend-design` | anthropics/skills | Apache-2.0, ver su LICENSE.txt |
| `web-design-guidelines` | vercel-labs/agent-skills | MIT, declarada en el README de origen; ver PROVENANCE.md |

Three.js skills: revisión [`0e181866f095b5f06d005133876e926515390d95`](https://github.com/CloudAI-X/threejs-skills/tree/0e181866f095b5f06d005133876e926515390d95/skills); licencia conservada en `THREEJS-SKILLS-LICENSE.txt`. Guías comunitarias dirigidas a r186: adaptar conceptos al motor r128 real, sin copiar imports WebGPU/TSL ni cambiar la versión implícitamente.

Frontend design: revisión [`ca45fc496a3436251f191354091d557da31c15b5`](https://github.com/anthropics/skills/tree/ca45fc496a3436251f191354091d557da31c15b5/skills/frontend-design). Se conserva el archivo de instrucciones y su licencia original.

Aplicación en esta evolución: geometría bicóncava, buffers reutilizados, registro semántico/raycasting, separación de piezas, materiales/luz compatibles, cámaras amortiguadas, limpieza de recursos, prioridad de etiquetas y diseño orientado al aprendizaje. No son bibliotecas anatómicas ni validación médica. Ver `docs/animacion/EXPERIENCIA_INTERACTIVA.md` desde la raíz para los contratos y límites reales.

La revisión de interfaz incorpora una octava guía con [procedencia y revisión fijadas](web-design-guidelines/PROVENANCE.md). La composición vigente está documentada en [UX/UI del visor](../../docs/UX_UI_VISOR.md): Guía, Explorar y Lectura; reproducción separada; selección nativa; foco y teclado. No introducir una librería de animación para transiciones simples.
