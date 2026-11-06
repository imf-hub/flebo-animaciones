import { readFile, access } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { readAnimationCatalog, readCourseData, validateAnimationCatalog } from './animation-catalog.mjs';
import { createHash } from 'node:crypto';
const html = await readFile('index.html', 'utf8');
const app = await readFile('assets/app.js', 'utf8');
assert.match(html, /<html lang="es"/);
assert.match(html, /<title>Flebo Animaciones/);
assert.doesNotMatch(html, /Atlas Venoso|Ocho láminas|https:\/\/(?:fonts\.googleapis|cdnjs|cdn\.jsdelivr)/);
for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  if (!/^(https?:|data:)/.test(match[1])) await access(match[1].split('?')[0]);
}
const catalog = await readAnimationCatalog();
const baseline = JSON.parse(await readFile('docs/animacion/baseline.json', 'utf8'));
const errors = validateAnimationCatalog(catalog, baseline.modules.map(m => m.id));
assert.equal(errors.length, 0, errors.join('\n'));
const ids = catalog.modules.map(m => m.id);
for (const id of ids) {
  await access(`audio/${id}.mp3`);
  assert.ok((await readFile(`audio/${id}.mp3`)).length > 0, `Audio vacío: ${id}`);
}
for (const file of ['assets/vendor/three.min.js', 'assets/vendor/OrbitControls.js', 'assets/vendor/three-LICENSE.txt']) await access(file);
const course = await readCourseData();
const courseIds=course.units.flatMap(unit=>Array.from(unit.ids));
assert.equal(new Set(courseIds).size,ids.length,'Hay temas repetidos en el recorrido.');
assert.deepEqual([...courseIds].sort(),[...ids].sort(),'El recorrido no cubre el catálogo completo.');
for(const id of ids){
  const lesson=course.lessons[id];
  assert.ok(lesson?.objective&&lesson?.medObjective&&lesson?.patientTitle,`Falta nivel educativo: ${id}`);
  assert.equal(lesson.steps.length,3,`Se requieren tres pasos: ${id}`);
  assert.equal(lesson.steps.length,lesson.actions.length,`Guía incompleta: ${id}`);
  assert.ok(lesson.question&&lesson.why&&lesson.answers.length>=2,`Pregunta incompleta: ${id}`);
  assert.ok(Number.isInteger(lesson.correct)&&lesson.correct>=0&&lesson.correct<lesson.answers.length,`Respuesta inválida: ${id}`);
}
for(const key of Object.keys(course.structures))assert.ok(course.structures[key].patient&&course.structures[key].medico,`Falta explicación de estructura: ${key}`);
const narrationProof=[...JSON.parse(await readFile('docs/animacion/entregas/narraciones-siete.json','utf8')),...JSON.parse(await readFile('docs/animacion/entregas/narraciones-cierre.json','utf8'))];
for(const module of catalog.modules){
  assert.ok(module.scope&&module.sources.length>=2,`Falta alcance o fuentes: ${module.id}`);
  for(const id of module.sources)assert.match(catalog.sources[id]?.url||'',/^https:\/\//,`Fuente ausente: ${id}`);
  const proof=narrationProof.find(p=>p.id===module.id);
  assert.ok(proof&&proof.scenes.length===catalog.videos[module.id].length,`Falta procedencia de narración: ${module.id}`);
  assert.equal(createHash('sha256').update(await readFile(`audio/${module.id}.mp3`)).digest('hex'),proof.sha256,`Cambió el audio sin actualizar marcas: ${module.id}`);
  assert.equal(catalog.audio[module.id].version,proof.sha256.slice(0,12),`Falta versión de caché del audio: ${module.id}`);
  assert.equal(proof.duration_seconds,catalog.audio[module.id].dur,`Duración incoherente: ${module.id}`);
  proof.scenes.forEach((scene,i)=>assert.equal(scene.text,catalog.videos[module.id][i].s,`Cambió el guion grabado: ${module.id}, toma ${i+1}`));
}
console.log(`Validado: ${ids.length} módulos, guiones, tiempos, recorrido, perfiles, preguntas y recursos locales.`);
