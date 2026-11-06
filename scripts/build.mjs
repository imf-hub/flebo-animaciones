import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
// Pages serves the committed root. Stamp it as well as the Hostinger export so
// returning visitors do not combine a new HTML document with older scripts.
let html = await readFile('index.html', 'utf8');
for (const path of ['assets/styles.css', 'assets/experience.css', 'assets/anatomy-scenes.css', 'assets/course.js', 'assets/anatomy-scenes.js', 'assets/clinical-scenes.js', 'assets/extension-data.js', 'assets/extension-audio.js', 'assets/app.js', 'assets/experience.js']) {
  const hash = createHash('sha256').update(await readFile(path)).digest('hex').slice(0, 12);
  const escaped = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  html = html.replace(new RegExp(`((?:src|href)=")${escaped}(?:\\?v=[a-z0-9-]+)?"`, 'g'), `$1${path}?v=${hash}"`);
}
await writeFile('index.html', html);
await mkdir('dist', { recursive: true });
for (const path of ['index.html', '404.html', 'assets', 'audio', 'robots.txt', 'sitemap.xml', '.nojekyll']) {
  await cp(path, `dist/${path}`, { recursive: true });
}
console.log('Web preparada en dist/. Lista para GitHub Pages o Hostinger.');
