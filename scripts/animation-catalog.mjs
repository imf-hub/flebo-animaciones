import { readFile } from 'node:fs/promises';
import { createContext, runInContext } from 'node:vm';
import { pathToFileURL } from 'node:url';

// Read the project's four declarative registries without running its DOM or simulations.
// This is a source-inspection helper, not a sandbox for arbitrary downloaded JavaScript.
export function literal(source, name) {
  const start = new RegExp(`\\bconst\\s+${name}\\s*=`).exec(source);
  if (!start) throw new Error(`No se encontró ${name}; adapte el inspector a la arquitectura actual.`);
  let i = start.index + start[0].length;
  while (/\s/.test(source[i])) i++;
  const begin = i, stack = [], pairs = { '}': '{', ']': '[', ')': '(' };
  let quote = null, comment = null;
  for (; i < source.length; i++) {
    const c = source[i], next = source[i + 1];
    if (comment === 'line') { if (c === '\n') comment = null; continue; }
    if (comment === 'block') { if (c === '*' && next === '/') { comment = null; i++; } continue; }
    if (quote) { if (c === '\\') i++; else if (c === quote) quote = null; continue; }
    if (c === '/' && next === '/') { comment = 'line'; i++; continue; }
    if (c === '/' && next === '*') { comment = 'block'; i++; continue; }
    if (c === '"' || c === "'" || c === '`') { quote = c; continue; }
    if ('[{('.includes(c)) stack.push(c);
    else if ('}])'.includes(c)) {
      if (stack.pop() !== pairs[c]) throw new Error(`Literal ${name} desbalanceado.`);
      if (!stack.length) return source.slice(begin, i + 1);
    }
  }
  throw new Error(`Literal ${name} incompleto.`);
}

export async function readAnimationCatalog() {
  const source = await readFile(new URL('../assets/app.js', import.meta.url), 'utf8');
  const extension = await readFile(new URL('../assets/extension-data.js', import.meta.url), 'utf8');
  const scenes = await readFile(new URL('../assets/anatomy-scenes.js', import.meta.url), 'utf8');
  const narration = await readFile(new URL('../assets/extension-audio.js', import.meta.url), 'utf8');
  const marker = name => Object.assign((...args) => marker(`${name}(${args.map(value => JSON.stringify(value)).join(',')})`), { catalogName: name });
  const bindings = Object.create(null);
  const modulesLiteral = literal(source, 'MODS')+'\n'+literal(extension,'EXTENSION_MODULES');
  for (const [, name] of modulesLiteral.matchAll(/\b(?:init|thumb)\s*:\s*([A-Za-z_$][\w$]*)/g)) {
    if (!new RegExp(`(?:function\\s+|(?:const|let|var)\\s+)${name}\\b`).test(source+'\n'+scenes)) throw new Error(`No se encontró la declaración de ${name}.`);
    bindings[name] = marker(name);
  }
  const context = createContext(bindings, { codeGeneration: { strings: false, wasm: false } });
  const declarations = ['HOME3', 'MODS', 'VIDEOS', 'AUDIO'].map(name => `const ${name}=${literal(source, name)};`).join('\n');
  const additions=['EXTENSION_SOURCES','EXTENSION_MODULES','EXTENSION_VIDEOS'].map(name=>`const ${name}=${literal(extension,name)};`).join('\n')+`\nconst EXTENSION_AUDIO=${literal(narration,'EXTENSION_AUDIO')};`;
  return runInContext(declarations+'\n'+additions+'\nMODS.push(...EXTENSION_MODULES);Object.assign(VIDEOS,EXTENSION_VIDEOS);Object.assign(AUDIO,EXTENSION_AUDIO);\n({modules:MODS,videos:VIDEOS,audio:AUDIO,sources:EXTENSION_SOURCES})', context, { timeout: 500 });
}

export async function readCourseData(){
  const source=await readFile(new URL('../assets/course.js',import.meta.url),'utf8'),extension=await readFile(new URL('../assets/extension-data.js',import.meta.url),'utf8');
  const additions=['EXTENSION_UNITS','EXTENSION_LESSONS','EXTENSION_STRUCTURES'].map(name=>`const ${name}=${literal(extension,name)};`).join('\n');
  return runInContext(source+'\n'+additions+'\nCOURSE.units=EXTENSION_UNITS;Object.assign(COURSE.lessons,EXTENSION_LESSONS);Object.assign(COURSE.structures,EXTENSION_STRUCTURES);COURSE',createContext({},{codeGeneration:{strings:false,wasm:false}}),{timeout:500});
}

export function validateAnimationCatalog({ modules, videos, audio }, baselineIds = []) {
  const errors = [], ids = new Set();
  const fail = (id, message) => errors.push(`${id}: ${message}`);
  const finiteVector = (value, length) => Array.isArray(value) && value.length === length && value.every(Number.isFinite);
  const actions = new Set(['btn', 'seg', 'sl', 'tg', 'anim']);
  if (!Array.isArray(modules) || !modules.length) return ['Catálogo vacío.'];
  for (const m of modules) {
    if (typeof m.id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(m.id)) fail(m.id, 'ID inválido.');
    if (ids.has(m.id)) fail(m.id, 'ID duplicado.');
    ids.add(m.id);
    for (const key of ['cat', 'title', 'blurb']) if (typeof m[key] !== 'string' || !m[key].trim()) fail(m.id, `Falta ${key}.`);
    if (!['2d', '3d'].includes(m.kind)) fail(m.id, 'Motor desconocido.');
    if (typeof m.init !== 'function') fail(m.id, 'Inicializador ausente.');
    if (m.kind === '3d' && typeof m.thumb !== 'function') fail(m.id, 'Falta miniatura 3D.');
    for (const audience of ['paciente', 'medico']) if (typeof m.text?.[audience] !== 'string' || !m.text[audience].trim()) fail(m.id, `Falta texto para ${audience}.`);
    const scenes = videos[m.id], track = audio[m.id];
    if (!Array.isArray(scenes) || !scenes.length) { fail(m.id, 'Falta guion.'); continue; }
    if (!track || !Number.isFinite(track.dur) || track.dur <= 0 || !Array.isArray(track.cues)) { fail(m.id, 'Falta duración o marcas de audio válidas.'); continue; }
    if (track.cues.length !== scenes.length) fail(m.id, 'El número de tomas no coincide con sus marcas de audio.');
    let previousTime = -1;
    scenes.forEach((scene, i) => {
      const cue = track.cues[i], prefix = `toma ${i + 1}`;
      if (typeof scene.s !== 'string' || !scene.s.trim()) { fail(m.id, `${prefix}: texto ausente.`); return; }
      if (scene.c && (m.kind === '2d' ? !finiteVector(scene.c, 3) || scene.c[2] <= 0 : !finiteVector(scene.c.p, 3) || !finiteVector(scene.c.t, 3))) fail(m.id, `${prefix}: cámara incompatible.`);
      if (scene.sp && (!finiteVector(scene.sp, 4) || scene.sp[2] <= 0 || scene.sp[3] <= 0)) fail(m.id, `${prefix}: foco inválido.`);
      if (scene.v !== undefined && (!Number.isFinite(scene.v) || scene.v <= 0)) fail(m.id, `${prefix}: velocidad inválida.`);
      if (scene.pt) for (const p of scene.pt) {
        const dims = m.kind === '3d' ? 3 : 2;
        if (!Array.isArray(p) || p.length !== dims + 1 || !p.slice(0, dims).every(Number.isFinite) || typeof p[dims] !== 'string') fail(m.id, `${prefix}: punto/etiqueta incompatible.`);
      }
      if (scene.a) for (const a of scene.a) {
        if (!Array.isArray(a) || !actions.has(a[0]) || typeof a[1] !== 'string' || !a[1]) { fail(m.id, `${prefix}: acción desconocida.`); continue; }
        const [kind, , value, duration] = a;
        if (kind === 'seg' && (!Number.isInteger(value) || value < 0)) fail(m.id, `${prefix}: índice de control inválido.`);
        if (['sl', 'anim'].includes(kind) && !Number.isFinite(value)) fail(m.id, `${prefix}: valor de control inválido.`);
        if (kind === 'tg' && typeof value !== 'boolean') fail(m.id, `${prefix}: toggle inválido.`);
        if (kind === 'anim' && (!Number.isFinite(duration) || duration <= 0)) fail(m.id, `${prefix}: duración de acción inválida.`);
      }
      if (!cue || !Number.isFinite(cue.t) || cue.t < 0 || cue.t <= previousTime || cue.t >= track.dur) { fail(m.id, `${prefix}: tiempo de toma inválido.`); return; }
      previousTime = cue.t;
      const sentences = scene.s.split(/(?<=[.!?])\s+/);
      if (!Array.isArray(cue.s) || cue.s.length !== sentences.length) { fail(m.id, `${prefix}: frases y tiempos de subtítulo no coinciden.`); return; }
      let previousSentence = cue.t - 0.001;
      const end = track.cues[i + 1]?.t ?? track.dur;
      for (const time of cue.s) {
        if (!Number.isFinite(time) || time < cue.t || time <= previousSentence || time >= end) fail(m.id, `${prefix}: tiempo de frase fuera de su intervalo.`);
        previousSentence = time;
      }
    });
  }
  for (const id of baselineIds) if (!ids.has(id)) fail(id, 'Falta un módulo de la referencia mínima.');
  for (const id of new Set([...Object.keys(videos), ...Object.keys(audio)])) if (!ids.has(id)) fail(id, 'Audio o guion sin módulo asociado.');
  return errors;
}

export function summarizeCatalog(catalog) {
  return catalog.modules.map(m => ({ id: m.id, title: m.title, kind: m.kind, initializer: m.init.catalogName, thumbnail: m.thumb?.catalogName ?? 'renderThumb', scenes: catalog.videos[m.id]?.length ?? 0, duration_seconds: catalog.audio[m.id]?.dur ?? null }));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const catalog = await readAnimationCatalog();
  const baseline = JSON.parse(await readFile(new URL('../docs/animacion/baseline.json', import.meta.url), 'utf8'));
  const errors = validateAnimationCatalog(catalog, baseline.modules.map(m => m.id));
  const report = { modules: summarizeCatalog(catalog), errors, limits: 'Inspección de datos; no prueba destinos de controles, fluidez ni contenido médico.' };
  if (process.argv.includes('--json')) console.log(JSON.stringify(report, null, 2));
  else {
    console.table(report.modules);
    console.log(errors.length ? errors.join('\n') : 'Catálogo coherente: IDs, tomas, cámaras, acciones y tiempos.');
    console.log(report.limits);
  }
  if (errors.length) process.exitCode = 1;
}
