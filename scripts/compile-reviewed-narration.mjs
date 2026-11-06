import{readFile,writeFile,mkdir}from'node:fs/promises';
import{execFileSync}from'node:child_process';import{createHash}from'node:crypto';import assert from'node:assert/strict';
import{readAnimationCatalog,literal}from'./animation-catalog.mjs';import{runInNewContext}from'node:vm';
const archive='docs/animacion/entregas/voz-cierre';await mkdir(archive,{recursive:true});
const jobs=JSON.parse(await readFile(archive+'/solicitudes.json','utf8').catch(()=>readFile('local-output/narracion-cierre/solicitudes.json','utf8')));
const c=await readAnimationCatalog(),tracks=runInNewContext('('+literal(await readFile('assets/extension-audio.js','utf8'),'EXTENSION_AUDIO')+')');
const normalize=s=>s.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,'');
const provenance=[];
for(const job of jobs){
 const r=JSON.parse(await readFile(archive+'/'+job.id+'.json','utf8').catch(()=>readFile('local-output/narracion-cierre/'+job.id+'-heygen.json','utf8')));
 const groups=[[]];for(const word of r.word_timestamps){if(word.word.startsWith('<break'))groups.push([]);else if(!word.word.startsWith('<'))groups.at(-1).push(word)}
 assert.equal(groups.length,job.scenes.length,job.id+': pausas distintas');
 groups.forEach((words,i)=>assert.equal(normalize(words.map(w=>w.word).join(' ')),normalize(job.scenes[i]),job.id+': transcripción distinta '+i));
 const metadata=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','format=duration:stream=codec_name','-of','json','audio/'+job.id+'.mp3'],{encoding:'utf8'})),duration=+metadata.format.duration;
 assert.ok(metadata.streams.some(s=>s.codec_name==='mp3'));assert.ok(Math.abs(duration-r.duration)<.3,job.id+': duración distinta');
 const scenes=c.videos[job.id];assert.equal(normalize(scenes.map(s=>s.s).join(' ')),normalize(job.scenes.join(' ')),job.id+': guion cambiado');
 const words=groups.flat();let cursor=0;const cues=scenes.map((scene,i)=>{let start=cursor,matched='',target=normalize(scene.s);while(cursor<words.length&&matched!==target){matched+=normalize(words[cursor++].word);assert.ok(target.startsWith(matched),job.id+': no alinea '+i)}assert.equal(matched,target);const t=i?+words[start].start.toFixed(3):0;return{t,s:[t]}});
 assert.equal(cursor,words.length);assert.ok(words.at(-1).end<duration);
 const sha256=createHash('sha256').update(await readFile('audio/'+job.id+'.mp3')).digest('hex');tracks[job.id]={dur:duration,cues,version:sha256.slice(0,12)};
 await writeFile(archive+'/'+job.id+'.json',JSON.stringify({duration:r.duration,engine:r.engine,voice_id:job.voiceId,submitted:job.text,word_timestamps:r.word_timestamps},null,2)+'\n');
 provenance.push({id:job.id,provider:'HeyGen',voice_id:job.voiceId,voice_name:'Rocío - Calm & Trustworthy',requested_engine:'saved default',returned_engine:r.engine,language:job.language,requested_speed:'omitted (provider default)',playback_rate:1,local_speed_processing:'none',duration_seconds:duration,sha256,scenes:scenes.map((s,i)=>({text:s.s,start:cues[i].t,end:cues[i+1]?.t??duration})),review:'Provider transcript and timing matched; browser playback coverage documented separately. No independent auditory or clinician approval.'});
}
for(const module of c.modules){const hash=createHash('sha256').update(await readFile('audio/'+module.id+'.mp3')).digest('hex');assert.ok(tracks[module.id],module.id+': sin marcas');tracks[module.id].version=hash.slice(0,12)}
await writeFile('assets/extension-audio.js','/* Measured MP3 timing and asset versions. Provenance: docs/animacion/entregas/. */\nconst EXTENSION_AUDIO='+JSON.stringify(tracks,null,2)+';\n');
await writeFile('docs/animacion/entregas/narraciones-cierre.json',JSON.stringify(provenance,null,2)+'\n');await writeFile(archive+'/solicitudes.json',JSON.stringify(jobs,null,2)+'\n');
console.log('Compiladas y contrastadas '+jobs.length+' narraciones; las siete del lote anterior se conservan.');
