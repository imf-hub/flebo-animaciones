/* Editorial structure only. Clinical paragraphs remain in the module registry. */
const LESSON_READING={
  'pared-3d':['Capas y valvas','Cómo se relacionan'],
  'valvula-sana':['El ciclo valvular','Qué explica el cierre'],
  'valvula-incompetente':['Coaptación y reflujo','Cómo se interpreta'],
  'bomba-muscular':['Vaciado y llenado','Función de la bomba'],
  fascias:['El compartimento safeno','Conexiones entre sistemas'],
  'compartimentos-3d':['Los planos anatómicos','Comunicantes y perforantes'],
  'union-safenofemoral':['La unión y sus variantes','Exploración del flujo'],
  'progresion-varice':['Comparar la forma','Qué significa la comparación'],
  microcirculacion:['El intercambio con el tejido','Cambios relacionados'],
  escleroterapia:['El mecanismo','Respuesta y variabilidad','Cuidados y alcance'],
  'trombosis-venosa-profunda':['El coágulo','Mecanismos y evaluación','Embolia y tratamiento'],
  'sindrome-postrombotico':['Después de una trombosis','Secuelas y evaluación','Seguimiento y manejo'],
  'viaje-venoso':['La red de retorno','Trayectos y variantes'],
  'venas-superficiales':['Tres formas de vasos','Cómo interpretar el aspecto'],
  'compresion-medica':['El soporte externo','Valoración y ajuste'],
  'ultrasonido-duplex':['Qué muestra el estudio','Interpretación y límites'],
  'edema-linfatico':['Líquido y drenaje','El balance en los tejidos'],
  'clasificacion-ceap':['Categorías clínicas','Cómo leer la clasificación'],
  'ulcera-venosa':['El tejido y la lesión','Valoración y manejo'],
  'ablacion-endovenosa':['El segmento tratado','Tumescencia y protección','Selección y alcance'],
  'trombosis-venosa-superficial':['Localizar el trombo','Relación con el sistema profundo','Valoración y atención'],
  'obstruccion-iliaca':['El cruce en la pelvis','Compresión y síntomas','Interpretación y alcance']
};
function renderLessonReading(module,audience,host){
  const source=document.createElement('template');source.innerHTML=module.text[audience];
  const titles=LESSON_READING[module.id]||[];host.replaceChildren();
  [...source.content.children].forEach((node,index)=>{
    const section=document.createElement('section');section.className='reading-section';
    const heading=document.createElement('h4');heading.textContent=titles[index]||'Para comprender mejor';
    const body=document.createElement('div');body.className='reading-body';
    // Preserve every word and delimiter while giving long definitions a scan path.
    if(index===0&&audience==='medico'&&module.id==='clasificacion-ceap'){
      const pieces=node.textContent.split(/(?=C[0-6][abc]?:?\s)/),intro=document.createElement('p');intro.textContent=pieces.shift();body.append(intro);
      const list=document.createElement('ul');list.className='classification-list';
      for(const piece of pieces){const item=document.createElement('li'),match=piece.match(/^(C[0-6][abc]?:?)([\s\S]*)/),term=document.createElement('strong');term.textContent=match[1];item.append(term,document.createTextNode(match[2]));list.append(item)}body.append(list);
    }else if(index===0&&audience==='medico'&&module.id==='venas-superficiales'){
      const list=document.createElement('ul');list.className='definition-list';
      for(const text of node.textContent.split(/(?=Reticulares:|Várices:)/)){const item=document.createElement('li'),colon=text.indexOf(':'),term=document.createElement('strong');term.textContent=text.slice(0,colon+1);item.append(term,document.createTextNode(text.slice(colon+1)));list.append(item)}body.append(list);
    }else body.append(node);
    section.append(heading,body);host.append(section);
  });
}
