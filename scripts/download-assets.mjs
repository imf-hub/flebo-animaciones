import { mkdir, writeFile } from 'node:fs/promises';
const save = async (url,path) => {
  const response=await fetch(url);
  if(!response.ok)throw new Error(`${response.status}: ${url}`);
  await writeFile(path,path.endsWith('.txt')?(await response.text()).replace(/[ \t]+$/gm,''):Buffer.from(await response.arrayBuffer()));
};
await mkdir('assets/vendor',{recursive:true});
await mkdir('assets/fonts',{recursive:true});
await save('https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js','assets/vendor/three.min.js');
await save('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js','assets/vendor/OrbitControls.js');
await save('https://cdn.jsdelivr.net/npm/three@0.128.0/LICENSE','assets/vendor/three-LICENSE.txt');
const url='https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=Source+Serif+4:opsz,wght@8..60,500;8..60,650&display=swap';
const response=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'}});
if(!response.ok)throw new Error('No se pudieron descargar las fuentes');
let css=await response.text();
// Spanish uses the Latin subset; do not ship unrelated alphabets.
css=css.split(/(?=\/\*)/).filter(block=>/^\/\* latin \*\//.test(block)).join('\n');
if(!css.includes('@font-face'))throw new Error('No hay fuentes latinas');
const urls=[...new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map(m=>m[1]))];
for(let i=0;i<urls.length;i++){
  const file=`font-${i+1}.woff2`;
  await save(urls[i],`assets/fonts/${file}`);
  css=css.replaceAll(urls[i],file);
}
await writeFile('assets/fonts/fonts.css',css);
for(const [name,dir] of [['IBM-Plex-Mono','ibmplexmono'],['IBM-Plex-Sans','ibmplexsans'],['Source-Serif-4','sourceserif4']]){
  await save(`https://raw.githubusercontent.com/google/fonts/main/ofl/${dir}/OFL.txt`,`assets/fonts/${name}-OFL.txt`);
}
console.log(`Bibliotecas y ${urls.length} archivos de fuentes guardados localmente, con sus licencias.`);
