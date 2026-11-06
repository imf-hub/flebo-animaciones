import { cp, mkdir } from 'node:fs/promises';
await mkdir('dist', { recursive: true });
for (const path of ['index.html', '404.html', 'assets', 'audio', 'robots.txt', 'sitemap.xml', '.nojekyll']) {
  await cp(path, `dist/${path}`, { recursive: true });
}
console.log('Web preparada en dist/. Lista para GitHub Pages o Hostinger.');
