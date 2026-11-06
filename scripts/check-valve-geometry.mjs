import{readFile}from'node:fs/promises';import{createRequire}from'node:module';import{runInNewContext}from'node:vm';import assert from'node:assert/strict';
const require=createRequire(import.meta.url),THREE=require('../assets/vendor/three.min.js');
const source=await readFile('assets/app.js','utf8'),start=source.indexOf('function curvedCuspGeometry('),end=source.indexOf('function updateTubeMesh(',start);
assert.ok(start>=0&&end>start,'No se encuentra la geometría de valvas.');
const functions=runInNewContext(source.slice(start,end)+';({curvedCuspGeometry,updateCurvedCusp})',{THREE,lerp:(a,b,t)=>a+(b-a)*t,smooth:t=>t*t*(3-2*t)},{timeout:500});
let states=0;
for(const side of [-1,1])for(const gap of [.02,.38]){
 const geometry=functions.curvedCuspGeometry(side),uv=geometry.attributes.uv,roots=[];
 for(let i=0;i<uv.count;i++)if(uv.getY(i)===0)roots.push([i,geometry.attributes.position.getX(i),geometry.attributes.position.getY(i),geometry.attributes.position.getZ(i)]);
 for(const closure of [0,.25,.5,.75,1]){
  functions.updateCurvedCusp(geometry,closure,gap);const p=geometry.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);assert.ok([x,y,z].every(Number.isFinite));assert.ok(Math.hypot(x,y)<=.981,'Valva fuera de la luz normalizada.');}
  for(const[i,x,y,z]of roots){assert.ok(Math.abs(p.getX(i)-x)<1e-6&&Math.abs(p.getY(i)-y)<1e-6&&Math.abs(p.getZ(i)-z)<1e-6,'Se desplazó una inserción durante el cierre.');}
  states++;
 }
 geometry.dispose();
}
console.log(`Geometría valvular: ${states} estados finitos, dentro de la luz y con inserción fija. No valida fisiología.`);
