import { readFile, access } from 'node:fs/promises';
import assert from 'node:assert/strict';
const html = await readFile('index.html', 'utf8');
const app = await readFile('assets/app.js', 'utf8');
assert.match(html, /<html lang="es"/);
assert.match(html, /<title>Flebo Animaciones/);
assert.doesNotMatch(html, /Atlas Venoso|Ocho láminas|https:\/\/(?:fonts\.googleapis|cdnjs|cdn\.jsdelivr)/);
for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  if (!/^(https?:|data:)/.test(match[1])) await access(match[1]);
}
const ids = [...app.matchAll(/\{id:'([^']+)',cat:/g)].map(m => m[1]);
assert.equal(ids.length, 12);
for (const id of ids) {
  await access(`audio/${id}.mp3`);
  assert.ok(app.includes(`'${id}':[`), `Falta guion de ${id}`);
}
for (const file of ['assets/vendor/three.min.js', 'assets/vendor/OrbitControls.js', 'assets/vendor/three-LICENSE.txt']) await access(file);
console.log('Validado: 12 módulos, 12 narraciones, guiones, dependencias locales y enlaces.');
