import{mkdir,writeFile,access}from'node:fs/promises';
import{readAnimationCatalog}from'./animation-catalog.mjs';
const destination='local-output/narracion-cierre/solicitudes.json';
try{await access(destination);throw new Error('Las solicitudes ya existen; conservar el lote original.')}catch(e){if(e.code!=='ENOENT')throw e}
const c=await readAnimationCatalog(),ids=c.modules.slice(0,12).map(m=>m.id).concat(['ablacion-endovenosa','trombosis-venosa-superficial','obstruccion-iliaca']);
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const jobs=ids.map(id=>({id,voiceId:'84854979e66846989bc6c5855f53268f',language:'es',inputType:'ssml',text:'<speak>'+c.videos[id].map(s=>escape(s.s)).join('<break time="0.9s"/>')+'</speak>',scenes:c.videos[id].map(s=>s.s)}));
for(const j of jobs)if(j.text.length>5000)throw Error('Límite de texto: '+j.id);
await mkdir('local-output/narracion-cierre',{recursive:true});await writeFile(destination,JSON.stringify(jobs,null,2)+'\n');
console.log(JSON.stringify(jobs.map(({id,text,scenes})=>({id,characters:text.length,scenes:scenes.length}))));
