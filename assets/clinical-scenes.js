/* Three educational clinical relationships. No treatment planning or flow calculation. */
const CLINICAL3D=(()=>{
  function deform(vessel,profile){
    const g=vessel.mesh.geometry,n=g.parameters.tubularSegments,r=g.parameters.radialSegments;
    if(!g.userData.frames){g.userData.frames=vessel.curve.computeFrenetFrames(n,false);g.userData.centers=vessel.curve.getSpacedPoints(n)}
    const p=g.attributes.position,f=g.userData.frames,state={r:1,z:1,offset:0};
    for(let i=0;i<=n;i++){state.r=state.z=1;state.offset=0;profile(i/n,state);const c=g.userData.centers[i];
      for(let j=0;j<=r;j++){const a=j/r*Math.PI*2,co=-Math.cos(a)*vessel.radius*state.r,si=Math.sin(a)*vessel.radius*state.z,nn=f.normals[i],bb=f.binormals[i];
        p.setXYZ(i*(r+1)+j,c.x+co*nn.x+si*bb.x,c.y+co*nn.y+si*bb.y,c.z+co*nn.z+si*bb.z+state.offset)}}
    p.needsUpdate=true;g.computeVertexNormals();g.computeBoundingSphere();if(g.boundingBox)g.computeBoundingBox();
  }
  const bell=(s,center,width)=>Math.exp(-(((s-center)/width)**2));
  function segment(h,whole,from,to,radius,color,id,opacity=.4){
    class Section extends THREE.Curve{getPoint(t,target=new THREE.Vector3()){return whole.getPointAt(lerp(from,to,t),target)}}
    const curve=new Section(),mesh=h.add(new THREE.TubeGeometry(curve,80,radius,14,false),color,id,opacity);
    return{mesh,curve,radius,id,fade:1};
  }
  function cutaway(h,width=4.8,height=7.6){
    const fat=h.add(FLEBO3D.slabGeometry(width,height,.48),FLEBO3D.colors.fat,'tejido',.13);fat.rotation.x=Math.PI/2;fat.position.z=-.45;fat.userData.pickThrough=true;
    return fat;
  }
  function thumb(kind){return(ctx)=>{const w=ctx.canvas.width,hh=ctx.canvas.height;ctx.fillStyle='#142f3b';ctx.fillRect(0,0,w,hh);ctx.lineCap='round';ctx.lineWidth=9;ctx.strokeStyle='#7397c8';ctx.beginPath();ctx.moveTo(w*.45,hh*.85);ctx.bezierCurveTo(w*.4,hh*.5,w*.64,hh*.4,w*.5,hh*.12);ctx.stroke();ctx.lineWidth=5;ctx.strokeStyle=kind==='ablation'?'#ecc17c':kind==='svt'?'#a63e55':'#c36a73';ctx.beginPath();ctx.moveTo(w*.47,hh*.6);ctx.lineTo(w*.53,hh*.36);ctx.stroke();ctx.fillStyle='#e9f0ef';ctx.font='600 '+Math.round(hh*.11)+'px sans-serif';ctx.fillText({ablation:'ABLACIÓN',svt:'TVS',iliac:'PEL VIS'}[kind].replace('PEL VIS','PELVIS'),w*.08,hh*.19)}}
  return{deform,bell,segment,cutaway,thumb};
})();
function clinicalThumb(kind){return CLINICAL3D.thumb(kind)}

function endovenousAblation3D(host,ui){
  const h=FLEBO3D.stage(host,ui,'ablation','Cerrar un segmento; conservar el drenaje','Ablación térmica esquemática · sin parámetros de tratamiento',[8,3,13],[0,.2,0]);
  let phase=0,progress=.55,tissue=true,shownPhase=-1,shownProgress=-1;
  const phases=ui.segmented('Etapa',['Anatomía','Tumescencia','Retirada con energía','Fibrosis conceptual'],0,i=>{phase=i});
  const amount=ui.slider('Recorrido del catéter',0,1,.01,progress,v=>{progress=v},v=>v<.1?'Inicio ilustrado':v>.9?'Fin ilustrado':'Retirada parcial');
  const tissueToggle=ui.toggle('Mostrar referencia tisular',true,v=>{tissue=v});
  const fat=CLINICAL3D.cutaway(h),superficial=h.vessel([[-.65,-3.3,.05],[-.72,-1.7,.05],[-.55,.2,.05],[-.65,2.5,.05]],.25,0x6d8dba,'vena-tratada',h.scene,.5);
  const deep=h.vessel([[1.65,-3.3,-.6],[1.55,0,-.6],[1.65,3.25,-.6]],.32,0x807cb4,'vena-profunda-contexto',h.scene,.63);
  const junction=h.vessel([[-.65,2.5,.05],[-.3,3.1,-.02],[.7,3.2,-.35],[1.65,3.25,-.6]],.22,0x6d8dba,'union-contexto',h.scene,.55);
  const nerve=h.vessel([[-1.7,-3.3,.02],[-1.62,0,.03],[-1.7,3.1,.03]],.07,0xd7c47d,'nervio-contexto',h.scene,.9);
  const tumor=h.vessel([[-.65,-3.3,.05],[-.72,-1.7,.05],[-.55,.2,.05],[-.65,2.5,.05]],.61,0x8ecdd0,'tumescencia',h.scene,.2);
  const catheter=h.vessel([[-.65,-3.3,.05],[-.72,-1.7,.05],[-.55,.2,.05],[-.65,2.5,.05]],.057,0xe7d6b7,'cateter-termico',h.scene,.95);
  const tip=h.sphere([-.65,2.5,.05],[.1,.15,.1],0xf2be73,'cateter-termico',1);
  const ring=h.add(new THREE.TorusGeometry(.31,.035,10,40),0xe4a35d,'zona-termica',.9);ring.rotation.x=Math.PI/2;
  h.tag('Vena superficial tratada',[-.7,.4,.05],'vena-tratada');h.tag('Vena profunda preservada',[1.6,.7,-.6],'vena-profunda-contexto');
  h.tag('Unión: referencia proximal',[.5,3.2,-.3],'union-contexto');h.tag('Nervio: referencia',[-1.65,-.8,.03],'nervio-contexto');
  h.tag('Tumescencia',[-1.17,1.25,.05],'tumescencia',()=>phase===1||phase===2);h.tag('Catéter',()=>tip.position,'cateter-termico',()=>phase<3);
  superficial.radialMin=.54;superficial.radialMax=.68;const flow=h.blood([superficial,deep,junction],{size:.055,speed:.5,density:12});
  const ro=ui.readout('Mecanismo observado'),safe=ui.readout('Límite del esquema');
  h.onSelection(id=>{if(id==='tumescencia'){phase=1;phases.set(phase)}if(id==='zona-termica'||id==='cateter-termico'){phase=2;phases.set(phase)}if(id==='tejido')tissueToggle.set(true)});
  return h.finish((time,dt,vdt)=>{
    const q=phase<2?0:phase===3?1:progress,front=.92-q*.82;
    const closure=s=>phase>=2?smooth(clamp((s-front)/.045,0,1))*(1-smooth(clamp((s-.94)/.055,0,1))):0;
    superficial.radiusScale=s=>1-.78*closure(s);superficial.visibleAt=s=>closure(s)<.01;
    if(phase!==shownPhase||progress!==shownProgress){CLINICAL3D.deform(superficial,(s,o)=>{o.r=o.z=1-.78*closure(s)});
      CLINICAL3D.deform(catheter,(s,o)=>{o.r=o.z=s<front?1:.001});shownPhase=phase;shownProgress=progress}
    tip.position.copy(superficial.curve.getPointAt(front));ring.position.copy(tip.position);h.opacity(ring,phase===2?(.6+.3*Math.sin(time*4)):0);
    h.opacity(tip,phase<3?1:0);h.opacity(catheter.mesh,phase<3?1:0);h.opacity(tumor.mesh,phase===1||phase===2?1:0);h.opacity(fat,tissue?1:0);
    superficial.mesh.material.color.setHex(phase===3?0xb59b83:0x6d8dba);flow(time);
    ro.set(['Localización superficial y drenaje profundo','Líquido perivenoso: anestesia y separación tisular','Energía localizada durante retirada ilustrada','Remodelado fibroso, sin plazo predicho'][phase]);
    safe.set('Sin distancia, potencia, temperatura ni dosis clínica');h.status(['La vena profunda permanece permeable','La tumescencia rodea el segmento superficial','El frente no alcanza la unión profunda','Comparación conceptual: el resultado puede variar'][phase]);
  });
}

function superficialThrombosis3D(host,ui){
  const h=FLEBO3D.stage(host,ui,'svt','Superficial no significa sin riesgo','Localización y extensión · escenarios independientes',[8,3,14],[0,.1,0]);
  let mode=0,skin=true,lastMode=-1;
  const modes=ui.segmented('Escenario',['TVS localizada','TVS próxima a la unión','TVP asociada: comparación'],0,i=>{mode=i});
  const skinToggle=ui.toggle('Mostrar referencia tisular',true,v=>{skin=v});
  const fat=CLINICAL3D.cutaway(h),deep=h.vessel([[1.5,-3.4,-.45],[1.5,0,-.45],[1.5,3.3,-.45]],.33,0x777fc1,'vena-profunda-contexto',h.scene,.48);
  const full=FLEBO3D.curve([[-.9,-3.3,.1],[-.8,-1,.1],[-.9,1.1,.1],[-.75,2.3,.1],[.2,2.9,-.1],[1.5,2.9,-.45]]);
  const surface=CLINICAL3D.segment(h,full,0,.75,.23,0x62a9bd,'safena-tvs');
  CLINICAL3D.segment(h,full,.75,1,.23,0x62a9bd,'union-contexto');
  const clot=h.vessel([[-.97,-3.3,.1],[-.87,-1,.1],[-.97,1.1,.1],[-.82,2.3,.1],[.13,2.9,-.1],[1.43,2.9,-.45]],.14,0x8c3047,'trombo-superficial',h.scene,.96);
  const halo=h.vessel([[-.9,-3.3,.1],[-.8,-1,.1],[-.9,1.1,.1],[-.75,2.3,.1],[.2,2.9,-.1],[1.5,2.9,-.45]],.38,0xd1787c,'inflamacion-local',h.scene,.16);
  const associated=h.vessel([[1.41,-1.8,-.45],[1.41,-.3,-.45],[1.41,.5,-.45]],.22,0x8c3047,'trombo-profundo',h.scene,.94);
  const flowPath={...surface,curve:full,radius:.23,visibleAt:s=>s<.12||s>(mode===1?.99:.66)};
  const flow=h.blood([flowPath,deep],{density:12,size:.035,speed:.52});deep.visibleAt=s=>!(mode===2&&s>.23&&s<.6);
  h.tag('Safena: sistema superficial',[-.8,.8,.1],'safena-tvs');h.tag('Unión con el sistema profundo',[.45,2.9,-.2],'union-contexto');
  h.tag('Vena profunda',[1.5,1.1,-.45],'vena-profunda-contexto');h.tag('Trombo superficial',[-.9,-1,.1],'trombo-superficial');
  h.tag('Inflamación local',[-1.25,-.2,.1],'inflamacion-local');h.tag('TVP asociada: otro escenario',[1.4,-.9,-.45],'trombo-profundo',()=>mode===2);
  const extent=ui.readout('Relación anatómica'),message=ui.readout('Qué debe comprobarse');
  h.onSelection(id=>{if(id==='trombo-profundo'){mode=2;modes.set(mode)}if(id==='tejido')skinToggle.set(true)});
  return h.finish((time)=>{
    const end=mode===1?.92:.56;
    if(lastMode!==mode){for(const v of [clot,halo])CLINICAL3D.deform(v,(s,o)=>{const inside=smooth(clamp((s-.16)/.04,0,1))*(1-smooth(clamp((s-end)/.04,0,1)));o.r=o.z=.001+.999*inside});lastMode=mode}
    h.opacity(associated.mesh,mode===2?1:0);h.opacity(fat,skin?1:0);flow(time);
    extent.set(['Segmento superficial, alejado en este dibujo','El extremo se aproxima a la unión profunda','TVS y TVP mostradas juntas, sin inferir cronología'][mode]);
    message.set('Dúplex: extensión y relación con venas profundas');h.status(['La extensión del trombo no se deduce del enrojecimiento','La cercanía a una unión modifica la evaluación y el manejo','La coexistencia exige valoración; no ocurre en todos los casos'][mode]);
  });
}

function iliacObstruction3D(host,ui){
  const h=FLEBO3D.stage(host,ui,'iliac','Un cruce anatómico, distintas situaciones clínicas','Vista anterior oblicua · izquierda del paciente a la derecha del modelo',[9,5,15],[0,.6,0]);
  let mode=0,amount=.75,target=0,separation=0,collateral=false,lastKey='';
  const modes=ui.segmented('Relación proximal',['Referencia permeable','Compresión anatómica','Secuela postrombótica'],0,i=>{mode=i});
  ui.slider('Estrechamiento ilustrado',0,1,.01,amount,v=>{amount=v},v=>v<.3?'Menor':v<.75?'Intermedio':'Mayor');
  ui.slider('Separar relaciones',0,1,.01,0,v=>{target=v},v=>v<.1?'En conjunto':'Despiece anatómico');
  const col=ui.toggle('Mostrar vías colaterales',false,v=>{collateral=v});
  const boneGroup=new THREE.Group(),arteryGroup=new THREE.Group();h.scene.add(boneGroup,arteryGroup);
  for(let i=0;i<3;i++){const bone=h.add(new THREE.CylinderGeometry(.65,.69,.66,40),0xd7cfb8,'columna-lumbar',.8,boneGroup);bone.rotation.x=Math.PI/2;bone.position.set(-.15,-.6+i*1.1,-.62);h.sphere([-.15,-.6+i*1.1,-1.1],[.95,.22,.23],0xd7cfb8,'columna-lumbar',.7,boneGroup)}
  const left=h.vessel([[2.6,-2.8,0],[1,-1.2,0],[.15,.2,0],[-.6,1.3,0]],.29,0x7e8ac4,'iliaca-comun-izquierda',h.scene,.59);
  const right=h.vessel([[-2.6,-2.8,0],[-1.7,-1,0],[-.9,.5,0],[-.6,1.3,0]],.29,0x7e8ac4,'iliaca-comun-derecha',h.scene,.59);
  const cava=h.vessel([[-.6,1.3,0],[-.6,3,0],[-.6,4.35,0]],.37,0x7e8ac4,'cava',h.scene,.59);
  const artery=h.vessel([[.5,3.2,.51],[.1,1.45,.51],[-.25,.55,.51],[-2.8,-2.8,.51]],.22,0xbd6872,'arteria-iliaca-derecha',arteryGroup,.86);
  h.vessel([[.5,3.2,.51],[.85,1.4,.51],[2.8,-2.8,.51]],.22,0xbd6872,'arteria-iliaca-izquierda',arteryGroup,.76);
  const webs=[];for(let i=0;i<3;i++){const web=h.add(new THREE.TorusGeometry(.21,.028,8,36),0xc8b09a,'sinequias-iliacas',.9);web.position.copy(left.curve.getPointAt(.72+i*.07));web.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),left.curve.getTangentAt(.72+i*.07));web.scale.x=.6;webs.push(web)}
  const connections=[h.vessel([[2.1,-2.1,0],[1.8,-.8,.75],[.1,-.2,.8],[-1.7,.4,.45],[-1.25,-.4,0]],.07,0x64b5b6,'colaterales-pelvicas',h.scene,.78)];
  const profile=(s,o)=>{const k=mode===1?amount:0,local=CLINICAL3D.bell(s,.82,.11);o.z=1-.82*k*local;o.offset=-.29*(1-o.z)};
  left.radiusScale=s=>mode===1?1-.82*amount*CLINICAL3D.bell(s,.82,.11):mode===2&&s>.66&&s<.94?.45:1;
  left.offsetZ=s=>mode===1?-.29*.82*amount*CLINICAL3D.bell(s,.82,.11):0;
  const flow=h.blood([left,right,cava,...connections],{size:.04,density:13,speed:.5});left.visibleAt=s=>!(mode===2&&s>.66&&s<.94);
  h.tag('Ilíaca común izquierda',[1,-1.2,0],'iliaca-comun-izquierda');h.tag('Ilíaca común derecha',[-1.7,-1,0],'iliaca-comun-derecha');h.tag('Vena cava inferior',[-.6,3.4,0],'cava');
  h.tag('Arteria ilíaca común derecha',()=>artery.curve.getPointAt(.45).add(arteryGroup.position),'arteria-iliaca-derecha');
  h.tag('Referencia lumbar',()=>new THREE.Vector3(-.2,.6,-.62).add(boneGroup.position),'columna-lumbar');h.tag('Vía colateral: ejemplo',[.1,-.2,.8],'colaterales-pelvicas',()=>collateral);
  const cause=ui.readout('Situación comparada'),limit=ui.readout('Interpretación');
  h.onSelection(id=>{if(id==='sinequias-iliacas'){mode=2;modes.set(mode)}if(id==='colaterales-pelvicas'){collateral=true;col.set(true)}});
  return h.finish((time,dt,vdt)=>{
    separation+=(target-separation)*(1-Math.exp(-7*vdt));arteryGroup.position.z=separation*1.7;boneGroup.position.z=-separation*1.4;
    const key=mode+':'+amount;if(key!==lastKey){CLINICAL3D.deform(left,profile);CLINICAL3D.deform(artery,(s,o)=>{const pt=artery.curve.getPointAt(s);o.offset=mode===1?-.58*.82*amount*Math.exp(-(((pt.x+.25)/.65)**2+((pt.y-.55)/.8)**2)):0});lastKey=key}
    webs.forEach(m=>h.opacity(m,mode===2?1:0));connections.forEach(v=>{v.fade=collateral?1:0;h.opacity(v.mesh,v.fade)});flow(time);
    cause.set(['Drenaje proximal permeable','Arteria anterior y referencia lumbar posterior','Bandas intraluminales tras una trombosis previa'][mode]);
    limit.set('La anatomía aislada no determina síntomas ni indica un stent');h.status(['Sigue las dos ilíacas hasta la cava','Compresión puede existir sin síndrome clínico','Se comparan mecanismos diferentes, sin calcular obstrucción'][mode]);
  });
}
