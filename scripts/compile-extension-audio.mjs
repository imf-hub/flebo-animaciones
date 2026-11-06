import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {runInNewContext} from 'node:vm';
import {literal} from './animation-catalog.mjs';
const archive='docs/animacion/entregas/voz-siete';
await mkdir(archive,{recursive:true});
const jobs=JSON.parse(await readFile(`${archive}/solicitudes.json`,'utf8').catch(()=>readFile('local-output/narracion-siete/solicitudes.json','utf8')));
const videos=runInNewContext('('+literal(await readFile('assets/extension-data.js','utf8'),'EXTENSION_VIDEOS')+')',{}, {timeout:500});
const normalize=text=>text.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,'');
const tracks=runInNewContext('('+literal(await readFile('assets/extension-audio.js','utf8'),'EXTENSION_AUDIO')+')',{}, {timeout:500}),provenance=[];
for(const job of jobs){
  const result=JSON.parse(await readFile(`${archive}/${job.id}.json`,'utf8').catch(()=>readFile(`local-output/narracion-siete/${job.id}-heygen.json`,'utf8')));
  await writeFile(`${archive}/${job.id}.json`,JSON.stringify({duration:result.duration,engine:result.engine,voice_id:job.voiceId,submitted:job.text,word_timestamps:result.word_timestamps},null,2)+'\n');
  const groups=[[]];
  for(const word of result.word_timestamps){if(word.word.startsWith('<break'))groups.push([]);else if(!word.word.startsWith('<'))groups.at(-1).push(word)}
  assert.equal(groups.length,job.scenes.length,`${job.id}: número de pausas incorrecto`);
  const measured=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','format=duration:stream=codec_name,sample_rate','-of','json',`audio/${job.id}.mp3`],{encoding:'utf8'}));
  const duration=+measured.format.duration;
  assert.ok(measured.streams.some(s=>s.codec_name==='mp3'),`${job.id}: falta audio MP3`);
  assert.ok(Math.abs(duration-result.duration)<.3,`${job.id}: duración diferente de los timestamps`);
  groups.forEach((words,i)=>{
    assert.ok(words.length,`${job.id}: toma vacía`);
    assert.equal(normalize(words.map(w=>w.word).join(' ')),normalize(job.scenes[i]),`${job.id}: discrepancia de transcripción en toma ${i+1}`);
    assert.ok(words.at(-1).end<duration,`${job.id}: marcas fuera de audio`);
  });
  const words=groups.flat(),scenes=videos[job.id];let cursor=0;
  assert.equal(normalize(scenes.map(s=>s.s).join(' ')),normalize(job.scenes.join(' ')),`${job.id}: la edición cambia palabras grabadas`);
  const cues=scenes.map((scene,i)=>{
    const start=cursor,target=normalize(scene.s);let matched='';
    while(cursor<words.length&&matched!==target){matched+=normalize(words[cursor++].word);assert.ok(target.startsWith(matched),`${job.id}: no se alinea la toma ${i+1}`)}
    assert.equal(matched,target,`${job.id}: toma incompleta`);
    const t=i===0?0:+words[start].start.toFixed(3);
    return{t,s:[t]};
  });
  tracks[job.id]={dur:duration,cues};
  const hash=createHash('sha256').update(await readFile(`audio/${job.id}.mp3`)).digest('hex');
  tracks[job.id].version=hash.slice(0,12);
  provenance.push({id:job.id,provider:'HeyGen',voice_id:job.voiceId,voice_name:'Rocío - Calm & Trustworthy',requested_engine:'saved default',returned_engine:result.engine,language:job.language,requested_speed:'omitted (provider default)',playback_rate:1,local_speed_processing:'none',duration_seconds:duration,sha256:hash,timing:'Provider word timestamps; original pause groups and edited phrase segmentation matched without changing recorded words.',scenes:scenes.map((scene,i)=>({text:scene.s,start:cues[i].t,end:i+1<cues.length?cues[i+1].t:duration})),review:'Transcript/timestamp verification is not an auditory review; see delivery report for listening coverage.'});
}
await writeFile('assets/extension-audio.js','/* Measured MP3 durations and phrase starts; see narration provenance. */\nconst EXTENSION_AUDIO='+JSON.stringify(tracks,null,2)+';\n');
await writeFile('docs/animacion/entregas/narraciones-siete.json',JSON.stringify(provenance,null,2)+'\n');
await writeFile(`${archive}/solicitudes.json`,JSON.stringify(jobs,null,2)+'\n');
console.log(`Compiladas ${jobs.length} narraciones; texto, MP3, marcas y duración comprobados.`);
