import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {literal} from './animation-catalog.mjs';
if(!process.argv.includes('--replace')){try{await access('local-output/narracion-siete/solicitudes.json');console.log('Solicitudes originales conservadas. Usa --replace solo para preparar una nueva generación autorizada.');process.exit(0)}catch{}}
const source=await readFile('assets/extension-data.js','utf8');
const videos=runInNewContext('('+literal(source,'EXTENSION_VIDEOS')+')',{}, {timeout:500});
const escape=text=>text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const jobs=Object.entries(videos).map(([id,scenes])=>({id,voiceId:'84854979e66846989bc6c5855f53268f',language:'es',inputType:'ssml',text:'<speak>'+scenes.map(scene=>escape(scene.s)).join('<break time="0.9s"/>')+'</speak>',scenes:scenes.map(s=>s.s)}));
await mkdir('local-output/narracion-siete',{recursive:true});
await writeFile('local-output/narracion-siete/solicitudes.json',JSON.stringify(jobs,null,2));
console.log(JSON.stringify(jobs));
