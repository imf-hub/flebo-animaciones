/* Learning experience: audience, guided observation, structure selection and local progress. */
(()=>{
  const order=COURSE.units.flatMap(unit=>unit.ids),storageKey='flebo-learning-progress-v2';
  let completed=new Set(),selectedPart=null,isolated=false,toastTimer=0,preview=null,previewRaf=0,previewToken=0,heroVisible=false;
  try{const saved=JSON.parse(localStorage.getItem(storageKey)||'[]');if(Array.isArray(saved))completed=new Set(saved.filter(id=>order.includes(id)))}catch{}
  const element=id=>document.getElementById(id);
  let activePanel='guide',mountedLesson=null,activeStep=-1,answered=-1,panelMotion=null;
  const panels=['guide','explore','reading'];
  function showPanel(name,{focus=false,animate=false}={}){
    if(!panels.includes(name))return;
    const changed=activePanel!==name;activePanel=name;
    panelMotion?.cancel();panelMotion=null;
    for(const key of panels){const selected=key===name,tab=element('tab-'+key);tab.setAttribute('aria-selected',selected);tab.tabIndex=selected?0:-1;element('panel-'+key).hidden=!selected}
    element('viewer').dataset.panel=name;
    if(changed)element('viewer').querySelector('.panel-body').scrollTop=0;
    if(focus)element('tab-'+name).focus();
    if(changed&&animate&&!reduced())panelMotion=element('panel-'+name).animate([{opacity:.4,transform:'translateY(4px)'},{opacity:1,transform:'translateY(0)'}],{duration:180,easing:'cubic-bezier(.23,1,.32,1)'});
  }
  panels.forEach((name,index)=>{const tab=element('tab-'+name);tab.onclick=event=>showPanel(name,{animate:event.detail>0});tab.onkeydown=event=>{let next;if(event.key==='ArrowRight')next=(index+1)%panels.length;else if(event.key==='ArrowLeft')next=(index+panels.length-1)%panels.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=panels.length-1;else return;event.preventDefault();showPanel(panels[next],{focus:true})}});
  document.addEventListener('pointerdown',event=>{if(!element('playbackSettings').contains(event.target))element('playbackSettings').open=false});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&element('playbackSettings').open){event.preventDefault();event.stopImmediatePropagation();element('playbackSettings').open=false;element('playbackSettings').querySelector('summary').focus()}},true);
  const toast=text=>{element('toast').textContent=text;element('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{element('toast').hidden=true},2600)};
  function saveProgress(){try{localStorage.setItem(storageKey,JSON.stringify([...completed]))}catch{}updateProgress()}
  function updateProgress(){element('progressText').textContent=completed.size+' de '+order.length+' temas explorados';element('courseProgress').max=order.length;element('courseProgress').value=completed.size;
    document.querySelectorAll('.card').forEach(card=>card.classList.toggle('is-complete',completed.has(MODS[+card.dataset.index].id)));
    if(cur){const done=completed.has(cur.m.id);element('completeLesson').setAttribute('aria-pressed',done);element('completeLesson').innerHTML=done?'Tema explorado <span aria-hidden="true">✓</span>':'Marcar como explorado <span aria-hidden="true">✓</span>'}
    element('startCourse').innerHTML=(completed.size?'Continuar mi recorrido':'Comenzar a explorar')+' <span aria-hidden="true">↗</span>';
  }
  COURSE.units.forEach((unit,i)=>{const button=document.createElement('button');button.type='button';button.setAttribute('aria-pressed','false');button.innerHTML='<span class="unit-num"></span><span><strong></strong><small></small></span>';button.firstChild.textContent=i+1;button.querySelector('strong').textContent=unit.title;button.querySelector('small').textContent=unit.description;button.onclick=()=>{UNIT_FILTER=UNIT_FILTER===unit.id?'all':unit.id;CATALOG_VIEW='guided';syncFilters();element('biblioteca').scrollIntoView({behavior:reduced()?'auto':'smooth',block:'start'})};button.dataset.unit=unit.id;element('unitNav').appendChild(button)});
  function reduced(){return matchMedia('(prefers-reduced-motion: reduce)').matches}
  function syncFilters(){element('biblioteca').classList.toggle('catalog-view',CATALOG_VIEW==='all');element('guidedView').setAttribute('aria-pressed',CATALOG_VIEW==='guided');element('allView').setAttribute('aria-pressed',CATALOG_VIEW==='all');
    element('unitNav').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.unit===UNIT_FILTER));applyFilter();
  }
  element('guidedView').onclick=()=>{CATALOG_VIEW='guided';UNIT_FILTER='all';syncFilters()};
  element('allView').onclick=()=>{CATALOG_VIEW='all';UNIT_FILTER='all';FILTER='Todos';document.querySelectorAll('.chip').forEach(b=>b.setAttribute('aria-pressed',b.textContent==='Todos'));syncFilters()};
  element('clearFilters').onclick=()=>{element('search').value='';FILTER='Todos';UNIT_FILTER='all';document.querySelectorAll('.chip').forEach(b=>b.setAttribute('aria-pressed',b.textContent==='Todos'));syncFilters();element('search').focus()};
  element('startCourse').onclick=()=>openMod(MODS.findIndex(m=>m.id===(order.find(id=>!completed.has(id))||order[0])));
  element('heroOpen').onclick=()=>openMod(MODS.findIndex(m=>m.id==='pared-3d'));
  const dialog=element('audienceDialog');element('roleSwitch').onclick=()=>dialog.showModal();element('closeAudience').onclick=()=>dialog.close();
  dialog.querySelectorAll('[data-aud]').forEach(b=>b.addEventListener('click',()=>dialog.close()));
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
  function audience(a){const doctor=a==='medico';element('roleSwitch').innerHTML=(doctor?'Modo médico':'Modo paciente')+' <span aria-hidden="true">⌄</span>';
    element('heroTitle').innerHTML=doctor?'La anatomía cobra<br>movimiento.':'Mira de cerca.<br>Comprende tus venas.';
    element('heroIntro').textContent=doctor?'Explora la anatomía venosa por capas. Relaciona estructuras, flujo y mecanismos con modelos interactivos y explicaciones en contexto.':'Descubre cómo circula la sangre y qué ocurre cuando una vena cambia. Gira los modelos, separa sus capas y aprende a tu ritmo.';
    element('courseTitle').textContent=doctor?'De la anatomía al mecanismo.':'Primero la estructura. Después, el movimiento.';
    element('courseDescription').textContent=doctor?'Un recorrido de relaciones anatómicas, función y conceptos clínicos.':'Avanza de lo básico a lo que sucede cuando el sistema cambia.';
    element('libraryKicker').textContent=doctor?'Recorrido para profesionales':'Tu laboratorio visual';
    if(cur){mountLesson();if(selectedPart&&COURSE.structures[selectedPart])element('structureDetail').querySelector('p').textContent=COURSE.structures[selectedPart][doctor?'medico':'patient'];if(!vid){state.labels=doctor;element('vLabels').setAttribute('aria-pressed',state.labels)}}
  }
  function technicalControls(){
    const patient=AUD==='paciente';element('vControls').querySelectorAll('.ctl').forEach(control=>{const label=control.querySelector('label')?.textContent||'';control.hidden=patient&&/concentración|aguja|volumen/i.test(label)});
    element('modelStatus').querySelectorAll('.readouts>div').forEach(row=>{row.hidden=patient&&/riesgo|recomendado|parámetro del ejemplo|volumen|concentración|polidocanol|aguja|resultado|escenario|evento/i.test(row.firstChild.textContent)});
  }
  function mountLesson(){if(!cur||!cur.sim)return;const m=cur.m,lesson=COURSE.lessons[m.id],unit=COURSE.units.find(u=>u.ids.includes(m.id));if(!lesson)return;
    const changed=mountedLesson!==m.id;if(changed){mountedLesson=m.id;activeStep=-1;answered=-1;element('modelStatus').replaceChildren();element('lessonSources').open=false;element('viewer').querySelector('.knowledge-check').open=false;showPanel('guide')}
    element('viewer').dataset.audience=AUD;element('vTitle').textContent=AUD==='paciente'?lesson.patientTitle:m.title;element('vCat').textContent=unit.title;element('viewerCounter').textContent='Tema '+(order.indexOf(m.id)+1)+' de '+order.length+' · '+(m.kind==='3d'?'Modelo 3D interactivo':'Esquema animado');
    element('learningObjective').textContent=AUD==='medico'?lesson.medObjective:lesson.objective;element('explanationSummary').textContent=AUD==='medico'?'Anatomía y mecanismo':'Entender el mecanismo';
    element('lessonSources').hidden=!m.sources;element('lessonScope').textContent=m.scope||'';element('lessonSourceList').replaceChildren();for(const sourceId of m.sources||[]){const source=EXTENSION_SOURCES[sourceId];const item=document.createElement('li'),link=document.createElement('a');link.textContent=source.title;link.href=source.url;link.target='_blank';link.rel='noopener';item.append(link);element('lessonSourceList').append(item)}
    element('observationSteps').replaceChildren();lesson.steps.forEach((title,i)=>{const button=document.createElement('button');button.type='button';button.className='observation-step';button.innerHTML='<span></span><div></div>';button.firstChild.textContent=i+1;button.lastChild.textContent=title;button.setAttribute('aria-pressed',activeStep===i);button.onclick=()=>runStep(i);element('observationSteps').appendChild(button)});
    element('stepHint').textContent=activeStep>=0?'Paso '+(activeStep+1)+' de '+lesson.steps.length+' activo.':'Selecciona un paso para cambiar el modelo.';
    element('quizQuestion').textContent=lesson.question;element('quizOptions').replaceChildren();element('quizFeedback').textContent='';
    lesson.answers.forEach((answer,i)=>{const button=document.createElement('button');button.type='button';button.textContent=answer;button.setAttribute('aria-pressed',answered===i);if(answered===i){button.className=i===lesson.correct?'correct':'incorrect';element('quizFeedback').textContent=(i===lesson.correct?'Así es. ':'Vuelve a observar. ')+lesson.why}button.onclick=()=>{answered=i;element('quizOptions').querySelectorAll('button').forEach(b=>{b.className='';b.setAttribute('aria-pressed','false')});button.className=i===lesson.correct?'correct':'incorrect';button.setAttribute('aria-pressed','true');element('quizFeedback').textContent=(i===lesson.correct?'Así es. ':'Vuelve a observar. ')+lesson.why};element('quizOptions').appendChild(button)});
    element('structurePicker').hidden=!(m.kind==='3d'&&cur.sim.parts?.length);element('structureSelect').replaceChildren(new Option('Elige en la lista o toca el modelo',''));
    for(const part of cur.sim.parts||[])element('structureSelect').appendChild(new Option(part.name,part.id));element('structureSelect').value=selectedPart||'';element('showAllParts').disabled=!selectedPart;element('readStructure').hidden=!selectedPart;
    for(const status of element('vControls').querySelectorAll(':scope > .readouts,:scope > .legend'))element('modelStatus').appendChild(status);element('modelStatusDetails').hidden=!element('modelStatus').children.length;
    element('completeLesson').onclick=()=>{if(!cur)return;const id=cur.m.id;if(completed.has(id))completed.delete(id);else completed.add(id);saveProgress();toast(completed.has(id)?'Tema marcado como explorado.':'Tema pendiente de explorar.')};
    technicalControls();updateProgress();
  }
  const cameras2d={
    'valvula-sana':[[500,300,1],[545,262,1.8],[500,300,1.1]],
    'valvula-incompetente':[[500,300,1],[545,262,1.8],[430,262,1.5]],
    fascias:[[500,300,1],[450,270,1.8],[500,300,1]],
    'bomba-muscular':[[500,300,1],[550,300,1.4],[500,300,1]],
    'union-safenofemoral':[[500,300,1],[450,250,1.4],[500,300,1]],
    microcirculacion:[[500,300,1],[500,280,1.45],[500,300,1]],
    escleroterapia:[[500,300,1],[550,290,1.35],[500,300,1]],
    'trombosis-venosa-profunda':[[500,300,1],[600,215,1.6],[500,300,1]],
    'sindrome-postrombotico':[[500,300,1],[500,240,1.45],[500,300,1]]
  };
  function runStep(i){if(!cur)return;stopVideo();state.playing=true;element('viewer').classList.remove('paused');element('vPlay').textContent='Pausar';element('vPlay').setAttribute('aria-pressed',true);const lesson=COURSE.lessons[cur.m.id];
    for(const action of lesson.actions[i]||[]){if(action[0]==='anim')vAct(['sl',action[1],action[2]]);else vAct(action)}
    if(cur.view){const camera=cameras2d[cur.m.id]?.[i]||[500,300,1];cur.view={x:camera[0],y:camera[1],z:camera[2]}}
    if(cur.m.id==='compartimentos-3d'){const positions=[[7,6,11],[6.5,4.5,9],[7,3.4,9]],targets=[[0,1.1,0],[.5,1.3,.8],[1.8,.2,.3]];cur.sim.moveCamera?.(positions[i],targets[i])}
    if(cur.m.id==='progresion-varice')cur.sim.moveCamera?.([7,2,12],[.3,0,-.6]);
    activeStep=i;showPanel('guide');element('observationSteps').querySelectorAll('button').forEach((button,index)=>button.setAttribute('aria-pressed',i===index));element('stepHint').textContent='Paso '+(i+1)+' de '+lesson.steps.length+' activo: '+lesson.steps[i]+'.';
  }
  const isolateButton=document.createElement('button');isolateButton.type='button';isolateButton.className='text-button isolate-button';isolateButton.textContent='Aislar';isolateButton.id='isolateSelection';isolateButton.setAttribute('aria-pressed','false');isolateButton.disabled=true;element('structurePicker').querySelector('.structure-actions').prepend(isolateButton);
  isolateButton.onclick=()=>{if(!cur)return;isolated=!isolated;cur.sim.isolatePart?.(isolated);isolateButton.setAttribute('aria-pressed',isolated);isolateButton.textContent=isolated?'Ver en contexto':'Aislar'};
  function clearSelection(){selectedPart=null;isolated=false;cur?.sim?.isolatePart?.(false);cur?.sim?.selectPart?.(null);element('structureSelect').value='';element('structureDetail').hidden=true;element('readStructure').hidden=true;element('showAllParts').disabled=true;isolateButton.disabled=true;isolateButton.setAttribute('aria-pressed','false');isolateButton.textContent='Aislar'}
  element('clearSelection').onclick=clearSelection;element('showAllParts').onclick=clearSelection;
  element('structureSelect').onchange=event=>{if(event.target.value)cur?.sim?.selectPart?.(event.target.value);else clearSelection()};
  element('readStructure').onclick=event=>{showPanel('reading',{animate:event.detail>0});element('panel-reading').focus({preventScroll:true})};
  document.addEventListener('flebo:part',event=>{const id=event.detail.id;if(!cur){if(id&&COURSE.structures[id])toast(COURSE.structures[id].name+': '+COURSE.structures[id][AUD==='paciente'?'patient':'medico']);return}
    if(!element('stageHost').contains(event.target))return;selectedPart=id;isolateButton.disabled=!id;element('structureSelect').value=id||'';element('showAllParts').disabled=!id;element('readStructure').hidden=!id;if(id&&!vid&&activePanel!=='reading')showPanel('explore');
    const data=COURSE.structures[id];element('structureDetail').hidden=!data;if(data){element('structureDetail').querySelector('h3').textContent=data.name;element('structureDetail').querySelector('p').textContent=data[AUD==='paciente'?'patient':'medico']}
  });
  function navigate(delta){if(!cur)return;const index=order.indexOf(cur.m.id),id=order[(index+delta+order.length)%order.length];openMod(MODS.findIndex(m=>m.id===id))}
  element('vPrev').onclick=()=>navigate(-1);element('vNext').onclick=()=>navigate(1);
  element('playAll').onclick=()=>{const list=order.map(id=>MODS.findIndex(m=>m.id===id));openMod(list[0]).then(ok=>{if(ok)startVideo(list)})};
  function destroyPreview(){previewToken++;cancelAnimationFrame(previewRaf);if(preview){preview.sim.destroy();preview=null}element('heroModel').replaceChildren()}
  async function startPreview(){if(preview||!heroVisible||cur||document.hidden)return;const token=++previewToken,host=element('heroModel');host.innerHTML='<p class="hero-loading">Preparando el modelo…</p>';
    try{await load3D();if(token!==previewToken||cur||!heroVisible)return;host.replaceChildren();const sim=wall3D(host,STUB);preview={sim,last:0};sim.cam.position.set(-2.3,2.1,8.8);sim.ctrl.target.set(0,0,0);sim.ctrl.minDistance=5;sim.ctrl.maxDistance=15;sim.ctrl.update();element('heroExplode').setAttribute('aria-pressed','false');
      function tick(time){if(!preview||!heroVisible||cur||document.hidden)return;const dt=preview.last?Math.min(.05,(time-preview.last)/1000):0;preview.last=time;preview.sim.frame(reduced()?0:dt,{labels:false,playing:!reduced(),speed:1});previewRaf=requestAnimationFrame(tick)}
      preview.tick=tick;previewRaf=requestAnimationFrame(tick);
    }catch{if(token===previewToken){host.innerHTML='<p class="hero-loading">Explora las animaciones para conocer el sistema venoso.</p>'}}
  }
  const heroObserver=new IntersectionObserver(entries=>{heroVisible=entries[0].isIntersecting;if(heroVisible){if(preview){preview.last=0;cancelAnimationFrame(previewRaf);previewRaf=requestAnimationFrame(preview.tick)}else startPreview()}else cancelAnimationFrame(previewRaf)},{threshold:.05});heroObserver.observe(element('heroModel'));
  element('heroExplode').onclick=()=>{if(!preview)return;const value=element('heroExplode').getAttribute('aria-pressed')!=='true';element('heroExplode').setAttribute('aria-pressed',value);preview.sim.setExplode?.(value ? .9 : 0);if(reduced()){preview.sim.frame(.8,{labels:false,playing:true});preview.sim.frame(0,{labels:false,playing:false})}};
  document.addEventListener('flebo:open',()=>{destroyPreview();element('playbackSettings').open=false;mountedLesson=null;selectedPart=null;isolated=false;isolateButton.disabled=true;isolateButton.setAttribute('aria-pressed','false');isolateButton.textContent='Aislar';mountLesson()});
  document.addEventListener('flebo:close',()=>{panelMotion?.cancel();mountedLesson=null;selectedPart=null;element('structureDetail').hidden=true;if(preview&&heroVisible){preview.last=0;previewRaf=requestAnimationFrame(preview.tick)}else startPreview()});
  document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(previewRaf);if(!document.hidden&&heroVisible&&!cur){if(preview){preview.last=0;previewRaf=requestAnimationFrame(preview.tick)}else startPreview()}});
  window.learningUI={audience,refresh:mountLesson};audience(AUD);syncFilters();updateProgress();if(cur?.sim)mountLesson();
})();
