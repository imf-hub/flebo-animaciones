"use strict";
const LOGO={"h_light": "assets/logos/h_light.png", "h_dark": "assets/logos/h_dark.png", "seal_light": "assets/logos/seal_light.png", "seal_dark": "assets/logos/seal_dark.png"};
document.querySelectorAll("img[data-logo]").forEach(i=>{i.src=LOGO[i.dataset.logo]});
/* ---------- utilidades ---------- */
const TAU=Math.PI*2, clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), lerp=(a,b,t)=>a+(b-a)*t, smooth=t=>t*t*(3-2*t);
const rnd=(a,b)=>a+Math.random()*(b-a);
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const STAGE='#0d1e28';
const C={ink:'#e6edf3',dim:'#9fb0c0',line:'#2a3a47',blood:'#a32132',bloodS:'#5c0d16',reflux:'#e8963a',refluxS:'#8a4f12',
  lumen:'#2b0c13',endo:'#f1cdd2',endoN:'#c98390',intima:'#e1a6b0',media:'#a8443d',mediaD:'#7a2c28',advent:'#d4b07a',adventD:'#a8844c',
  valve:'#efdcc4',valveS:'#b99d7d',fascia:'#e9eef2',fat:'#dcb85e',fatL:'#efd486',skin:'#d9a58c',dermis:'#e8bcab',muscle:'#8c3434',muscleL:'#a64848',
  veinWall:'#6d7fbf',artery:'#c23a3a',nerve:'#e9d36b',ok:'#5cc29a'};
const FONT='"IBM Plex Sans", system-ui, sans-serif', MONO='"IBM Plex Mono", ui-monospace, monospace';

function canvasViewBounds(ctx){const m=ctx.getTransform();return{left:-m.e/m.a,right:(ctx.canvas.width-m.e)/m.a,top:-m.f/m.d,bottom:(ctx.canvas.height-m.f)/m.d}}
function canvasTextLines(ctx,text,width){const lines=[];let line='';for(const word of text.split(' ')){const candidate=line?line+' '+word:word;if(line&&ctx.measureText(candidate).width>width){lines.push(line);line=word}else line=candidate}if(line)lines.push(line);return lines}
function clearCanvasZoom(ctx,bounds,x,y,w,h){const m=ctx.getTransform(),ratio=ctx.canvas.width/(ctx.canvas.clientWidth||ctx.canvas.width),rx=60*ratio/m.a,ry=130*ratio/m.d;return y+h>bounds.bottom-ry&&x+w>bounds.right-rx?Math.max(bounds.left+5,Math.min(x,bounds.right-rx-w)):x}
function lbl(ctx,x,y,tx,ty,text,side){
  ctx.save();const bounds=canvasViewBounds(ctx);if(x<bounds.left||x>bounds.right||y<bounds.top||y>bounds.bottom){ctx.restore();return}
  ctx.font='500 14px '+FONT;ctx.textBaseline='middle';
  const lines=canvasTextLines(ctx,text,Math.min(420,(bounds.right-bounds.left)*.72)),w=Math.max(...lines.map(s=>ctx.measureText(s).width))+12,h=lines.length*17+7,right=side?side==='r':tx>=x;
  let bx=clamp(right?tx+2:tx-w,bounds.left+5,bounds.right-w-5);const by=clamp(ty-h/2,bounds.top+5,bounds.bottom-h-5);bx=clearCanvasZoom(ctx,bounds,bx,by,w,h);
  ctx.strokeStyle='rgba(230,237,243,.6)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(clamp(x,bx,bx+w),clamp(y,by,by+h));ctx.stroke();
  ctx.fillStyle=C.ink;ctx.beginPath();ctx.arc(x,y,3,0,TAU);ctx.fill();
  ctx.fillStyle='rgba(15,23,30,.9)';ctx.strokeStyle='rgba(159,176,192,.35)';ctx.fillRect(bx,by,w,h);ctx.strokeRect(bx,by,w,h);
  ctx.fillStyle=C.ink;ctx.textAlign='left';lines.forEach((line,i)=>ctx.fillText(line,bx+6,by+12+i*17));ctx.restore();
}
function banner(ctx,title,sub,color){
  ctx.save();ctx.textBaseline='alphabetic';ctx.textAlign='left';
  ctx.fillStyle=color||C.ink;ctx.font='600 19px '+FONT;ctx.fillText(title,24,36);
  if(sub){ctx.fillStyle=C.dim;ctx.font='400 14px '+FONT;ctx.fillText(sub,24,58);}
  ctx.restore();
}
function pill(ctx,x,y,text,align,color){
  ctx.save();ctx.font='500 13px '+FONT;ctx.textBaseline='middle';const bounds=canvasViewBounds(ctx),lines=canvasTextLines(ctx,text,Math.min((bounds.right-bounds.left)-28,(bounds.right-bounds.left)*.8)),w=Math.max(...lines.map(s=>ctx.measureText(s).width))+12,h=lines.length*17+5;
  let bx=clamp(align==='right'?x-w:x,bounds.left+5,bounds.right-w-5);const by=clamp(y-h/2,bounds.top+5,bounds.bottom-h-5);bx=clearCanvasZoom(ctx,bounds,bx,by,w,h);ctx.fillStyle='rgba(15,23,30,.88)';ctx.fillRect(bx,by,w,h);
  ctx.fillStyle=color||C.dim;ctx.textAlign='left';lines.forEach((line,i)=>ctx.fillText(line,bx+6,by+11+i*17));ctx.restore();
}
function arrow(ctx,x1,y1,x2,y2,color,w){
  ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=w||3;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
  const a=Math.atan2(y2-y1,x2-x1),h=8+(w||3)*2;
  ctx.beginPath();ctx.moveTo(x2+Math.cos(a)*2,y2+Math.sin(a)*2);ctx.lineTo(x2-Math.cos(a-0.45)*h,y2-Math.sin(a-0.45)*h);ctx.lineTo(x2-Math.cos(a+0.45)*h,y2-Math.sin(a+0.45)*h);ctx.closePath();ctx.fill();ctx.restore();
}
function rbc(ctx,x,y,ang,retro,s){
  s=s||1;ctx.save();ctx.translate(x,y);ctx.rotate(ang);
  ctx.fillStyle=retro?C.reflux:C.blood;ctx.strokeStyle=retro?C.refluxS:C.bloodS;ctx.lineWidth=1;
  ctx.beginPath();ctx.ellipse(0,0,5*s,3*s,0,0,TAU);ctx.fill();ctx.stroke();ctx.restore();
}
/* válvula genérica: (x,y) centro, (dx,dy) dirección fisiológica del flujo, hw semiancho de la luz, c cierre 0..1, gap */
function drawValve(ctx,x,y,dx,dy,hw,c,gap,len){
  const nx=-dy,ny=dx;len=len||hw*1.5;
  for(const s of [1,-1]){
    const bx=x+nx*hw*s,by=y+ny*hw*s;
    const ox=x+dx*len+nx*(hw-2.5)*s,oy=y+dy*len+ny*(hw-2.5)*s;
    const g=Math.max(gap,0.8),cx=x+dx*len*0.85+nx*g*s,cy=y+dy*len*0.85+ny*g*s;
    const tx=lerp(ox,cx,c),ty=lerp(oy,cy,c);
    const k=lerp(0.95,0.5,c),kx=x+dx*len*0.35+nx*hw*k*s,ky=y+dy*len*0.35+ny*hw*k*s;
    ctx.save();ctx.lineCap='round';
    ctx.strokeStyle=C.valveS;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(bx,by);ctx.quadraticCurveTo(kx,ky,tx,ty);ctx.stroke();
    ctx.strokeStyle=C.valve;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(bx,by);ctx.quadraticCurveTo(kx,ky,tx,ty);ctx.stroke();
    ctx.restore();
  }
}
/* trazado tipo Doppler */
class Trace{
  constructor(n){this.b=new Float32Array(n);this.i=0;this.n=n}
  push(v){this.b[this.i]=v;this.i=(this.i+1)%this.n}
  draw(ctx,x,y,w,h,title,scale,thrNote){
    ctx.save();ctx.fillStyle='rgba(22,33,42,.92)';ctx.strokeStyle=C.line;ctx.fillRect(x,y,w,h);ctx.strokeRect(x,y,w,h);
    const mid=y+h*0.55;ctx.strokeStyle='rgba(159,176,192,.25)';ctx.lineWidth=1;
    const pxs=w/(this.n/60);for(let s=0;s<=this.n/60;s++){ctx.beginPath();ctx.moveTo(x+s*pxs,y+22);ctx.lineTo(x+s*pxs,y+h);ctx.stroke();}
    ctx.strokeStyle='rgba(230,237,243,.55)';ctx.beginPath();ctx.moveTo(x,mid);ctx.lineTo(x+w,mid);ctx.stroke();
    const sc=scale||h*0.38;
    for(let k=0;k<this.n;k++){const v=this.b[(this.i+k)%this.n];if(!v)continue;const px=x+k*w/this.n;
      ctx.strokeStyle=v>=0?'rgba(230,90,105,.9)':'rgba(232,150,58,.95)';ctx.beginPath();ctx.moveTo(px,mid);ctx.lineTo(px,mid-clamp(v,-1.4,1.4)*sc);ctx.stroke();}
    ctx.fillStyle=C.ink;ctx.font='600 13px '+FONT;ctx.textBaseline='alphabetic';ctx.textAlign='left';ctx.fillText(title,x+10,y+17);
    ctx.font='400 11px '+FONT;ctx.fillStyle=C.dim;ctx.fillText('anterógrado',x+6,mid-sc-2<y+30?y+34:mid-sc+12);ctx.fillText('retrógrado',x+6,y+h-6);
    ctx.textAlign='right';ctx.fillText('1 s por división',x+w-6,y+h-6);
    ctx.restore();
  }
}
function refluxMeter(){return{cur:0,last:0,acc:0,step(v,dt,tr,thr){this.acc+=dt;while(this.acc>=1/60){this.acc-=1/60;tr.push(v);if(v<-(thr||0.06))this.cur+=1/60;else if(this.cur>0){this.last=this.cur;this.cur=0;}}},get value(){return Math.max(this.cur,this.cur>0?0:this.last)}}}

/* ---------- 1 · Válvula sana / incompetente (corte longitudinal) ---------- */
function valveSim(defInc){
  return function(api,ui){
    const ctx=api.ctx;let inc=defInc;
    const sl=ui.slider('Grado de incompetencia valvular (ilustrado)',0,1,0.01,inc,v=>{inc=v},v=>v<0.12?'Aproximación conservada':v<0.45?'Menor separación':v<0.75?'Separación intermedia':'Mayor separación');
    ui.buttons([['Válvula sana',()=>sl.set(0)],['Válvula incompetente',()=>sl.set(0.85)]]);
    ui.legend([[C.blood,'Flujo anterógrado (hacia el corazón)'],[C.reflux,'Reflujo (flujo retrógrado)'],[C.valve,'Valva: núcleo de colágeno cubierto de endotelio']]);
    const roT=ui.readout('Flujo inverso: tiempo ilustrado'),roD=ui.readout('Diámetro relativo de la vena');
    const y0=262,xb=500,L=82,xg=xb+66;
    const P=[];for(let i=0;i<360;i++)P.push({x:rnd(0,1000),f:rnd(-.9,.9),u:0});
    let t=0,v=0,U=0,ph=0;const tr=new Trace(300),rm=refluxMeter();
    const Rb=()=>58+inc*32;
    const Rx=x=>{let r=Rb();if(x<xb)r+=inc*12*clamp((xb-x)/220,0,1);const a=xb-4,b=xb+132;if(x>a&&x<b)r+=(13+inc*5)*Math.sin(Math.PI*(x-a)/(b-a));return r};
    function flow(tt){const T=4,p=(tt%T)/T,rd=0.06+inc*0.3,ra=0.3+inc*0.45;
      if(p<0.35)return[Math.sin(Math.PI*p/0.35),0];
      if(p<0.35+rd)return[-ra*Math.sin(Math.PI*(p-0.35)/rd),1];
      return[0.1,2]}
    function band(sg,o1,o2,fill){ctx.beginPath();for(let x=-10;x<=1010;x+=8)ctx.lineTo(x,y0+sg*(Rx(x)+o1));for(let x=1010;x>=-10;x-=8)ctx.lineTo(x,y0+sg*(Rx(x)+o2));ctx.closePath();ctx.fillStyle=fill;ctx.fill()}
    function wave(sg,off,amp,k,color,w){ctx.strokeStyle=color;ctx.lineWidth=w;ctx.beginPath();for(let x=-10;x<=1010;x+=6)ctx.lineTo(x,y0+sg*(Rx(x)+off+amp*Math.sin(x*k+sg)));ctx.stroke()}
    return{draw(dt,S){
      t+=dt;[U,ph]=flow(t);
      const tgt=U<0?1:0;v+=(tgt-v)*Math.min(1,dt*(tgt?14:6));
      const R0=Rb(),gapMin=Math.max(1.2,inc*R0*0.42),a=Math.max(R0*(1-v)*0.95,gapMin),leak=clamp(a/R0*2.4,0,1);
      if(dt>0)for(const p of P){
        const R=Rx(p.x),prof=Math.max(0.15,1-p.f*p.f);let u=U*230*prof;
        if(U<0){if(p.x<xg||v>0.55)u*=leak;
          if(leak<0.98&&v>0.4&&Math.abs(p.x-xg)<70){const lim=a/R*0.9;p.f+=(clamp(p.f,-lim,lim)-p.f)*Math.min(1,dt*5);u*=1+(1-leak)*0.6}}
        let nx=p.x+u*dt;
        if((p.x-xg)*(nx-xg)<0&&Math.abs(p.f)*Rx(xg)>a+1)nx=p.x;
        if(p.x>xb&&nx<=xb&&Math.abs(p.f)>0.55)nx=p.x;
        if(p.x<xb&&nx>=xb&&Math.abs(p.f)>0.8)p.f=Math.sign(p.f)*0.78;
        if(v>0.3&&p.x>xb&&p.x<xb+100&&Math.abs(p.f)>0.55){const s=Math.sign(p.f),lx=(p.x-(xb+50))/50,lf=(Math.abs(p.f)-0.78)/0.22;nx+=-lf*45*dt*v;p.f+=s*lx*0.55*dt*v}
        p.u=(nx-p.x)/dt;p.x=nx;p.f=clamp(p.f+(Math.random()-.5)*dt*0.06,-0.93,0.93);
        if(p.x>1010){p.x=-8;p.f=rnd(-.9,.9)}else if(p.x<-10){p.x=1008;p.f=rnd(-.9,.9)}
      }
      const Up=U>0?U:U*leak;rm.step(Up,dt,tr);
      // luz
      ctx.beginPath();for(let x=-10;x<=1010;x+=8)ctx.lineTo(x,y0-Rx(x));for(let x=1010;x>=-10;x-=8)ctx.lineTo(x,y0+Rx(x));ctx.closePath();
      const g=ctx.createLinearGradient(0,y0-100,0,y0+100);g.addColorStop(0,'#3a1019');g.addColorStop(.5,C.lumen);g.addColorStop(1,'#3a1019');ctx.fillStyle=g;ctx.fill();
      for(const p of P){const R=Rx(p.x);rbc(ctx,p.x,y0+p.f*R,p.u<0?Math.PI:0,p.u<-4,1)}
      // valvas
      for(const sg of [-1,1]){
        const baseY=y0+sg*R0;
        const toX=xb+L+10,toY=y0+sg*(Rx(xb+L+10)-6),tcX=xb+L-inc*55,tcY=y0+sg*gapMin;
        const tx=lerp(toX,tcX,v),ty=lerp(toY,tcY,v),cx=lerp(xb+36,xb+22+inc*10,v),cy=lerp(y0+sg*(R0-2),y0+sg*R0*0.5,v);
        ctx.lineCap='round';ctx.strokeStyle=C.valveS;ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(xb,baseY);ctx.quadraticCurveTo(cx,cy,tx,ty);ctx.stroke();
        ctx.strokeStyle=C.valve;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(xb,baseY);ctx.quadraticCurveTo(cx,cy,tx,ty);ctx.stroke();
        ctx.strokeStyle=C.endo;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(xb,baseY);ctx.quadraticCurveTo(cx,cy,tx,ty);ctx.stroke();
      }
      // pared: endotelio, íntima, media, adventicia
      for(const sg of [-1,1]){
        band(sg,0,3,C.endo);band(sg,3,6.5,C.intima);band(sg,6.5,22,C.media);band(sg,22,42,C.advent);
        ctx.fillStyle=C.endoN;for(let x=12;x<1000;x+=30){ctx.beginPath();ctx.ellipse(x,y0+sg*(Rx(x)+1.5),4,1.2,0,0,TAU);ctx.fill()}
        ctx.fillStyle=C.mediaD;for(let x=6,k=0;x<1000;x+=15,k++){const off=14+((k%2)?3.5:-3.5);ctx.beginPath();ctx.ellipse(x,y0+sg*(Rx(x)+off),6,1.6,0,0,TAU);ctx.fill()}
        wave(sg,29,2,0.09,C.adventD,1.2);wave(sg,36,2,0.07,C.adventD,1.2);
        for(const x of [140,410,760,900]){ctx.strokeStyle='#b02c2c';ctx.fillStyle='#e07070';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y0+sg*(Rx(x)+33),3.2,0,TAU);ctx.fill();ctx.stroke()}
        // agger
        ctx.fillStyle=C.valve;ctx.beginPath();ctx.arc(xb,y0+sg*(R0+1),4.5,0,TAU);ctx.fill();
      }
      // flechas
      if(ph===0)arrow(ctx,700,y0,830,y0,'rgba(240,120,130,.85)',4);
      else if(ph===1&&leak>0.3)arrow(ctx,560,y0,400,y0,'rgba(232,150,58,.95)',4);
      pill(ctx,14,y0-14,'← Distal (pie)','left');pill(ctx,986,y0-14,'Proximal (corazón) →','right');
      // sonda Doppler
      const prx=330,pry=y0+Rx(prx)+50;
      ctx.save();ctx.setLineDash([4,4]);ctx.strokeStyle='rgba(230,237,243,.55)';ctx.beginPath();ctx.moveTo(prx,pry);ctx.lineTo(prx-30,y0);ctx.stroke();ctx.setLineDash([]);
      ctx.strokeStyle=C.ink;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(prx-38,y0-5);ctx.lineTo(prx-22,y0-5);ctx.moveTo(prx-38,y0+5);ctx.lineTo(prx-22,y0+5);ctx.stroke();
      ctx.fillStyle='#c9d3dc';ctx.beginPath();ctx.roundRect?ctx.roundRect(prx-14,pry,28,22,4):ctx.rect(prx-14,pry,28,22);ctx.fill();ctx.restore();
      tr.draw(ctx,470,458,510,132,'Doppler pulsado · vena distal a la válvula');
      const rv=rm.value,path=inc>.3;
      ctx.save();ctx.font='600 13px '+MONO;ctx.textAlign='right';ctx.fillStyle=path?C.reflux:C.ok;ctx.fillText('reflujo '+rv.toFixed(2)+' s '+'· esquema',970,475);ctx.restore();
      roT.set(rv.toFixed(2)+' s · '+'de animación');roD.set((Rb()/58*100).toFixed(0)+' %');
      const titles=['Sístole muscular: flujo anterógrado','Inversión de presión: '+(inc<0.3?'las valvas se aproximan durante el cierre':'las valvas no coaptan → reflujo'),'Reposo: llenado lento desde la periferia'];
      banner(ctx,titles[ph],ph===1&&inc<0.3?'El seno y el flujo local participan en la dinámica del cierre':'Corte longitudinal de vena superficial de la pierna',ph===1&&inc>=0.3?C.reflux:C.ink);
      if(S.labels){
        const ay=y0+Rx(60);
        lbl(ctx,60,ay+1.5,60,548,'Endotelio','r');lbl(ctx,100,ay+5,100,524,'Íntima / subendotelio','r');
        lbl(ctx,140,ay+14,140,500,'Media: músculo liso','r');lbl(ctx,180,ay+32,180,476,'Adventicia: colágeno y vasa vasorum','r');
        lbl(ctx,xb,y0-R0-1,470,96,'Agger (base valvar)','l');
        const mx=lerp(xb+42,xb+38,v),my=lerp(y0-R0+4,y0-R0*0.55,v);lbl(ctx,mx,my,560,96,'Valva (cúspide)','r');
        lbl(ctx,xb+78,y0-Rx(xb+78)+6,760,124,'Seno valvular','r');
        const tcX=lerp(xb+L+10,xb+L-inc*55,v);lbl(ctx,tcX,y0,780,y0+46,inc<0.3?'Bordes valvulares':'Coaptación incompleta','r');
      }
    }};
  };
}

/* ---------- 2 · Bomba muscular de la pantorrilla ---------- */
function calfPump(api,ui){
  const ctx=api.ctx;let incomp=false,walking=true;
  ui.segmented('Estado venoso',['Sano','Insuficiencia (perforante y safena)'],0,i=>{incomp=i===1});
  ui.buttons([['Caminar',()=>{walking=true}],['Detenerse (de pie quieto)',()=>{walking=false}]]);
  ui.legend([[C.blood,'Flujo hacia el corazón / hacia el sistema profundo'],[C.reflux,'Reflujo o flujo profundo → superficial']]);
  const roP=ui.readout('Tendencia de presión ilustrada'),roV=ui.readout('Alcance del gráfico');
  const dX=550,gX=280,yT=70,yB=590,vD=440,vP=170,fasL=360,fasR=726;
  const perf=q=>{const a=[gX+8,400],c=[430,425],b=[dX-12,380],m=1-q;return[m*m*a[0]+2*m*q*c[0]+q*q*b[0],m*m*a[1]+2*m*q*c[1]+q*q*b[1]]};
  const D=[],G=[],F=[];for(let i=0;i<150;i++)D.push({y:rnd(yT,yB),l:rnd(-1,1),u:0});for(let i=0;i<70;i++)G.push({y:rnd(yT,yB),l:rnd(-1,1),u:0});for(let i=0;i<26;i++)F.push({q:Math.random(),l:rnd(-1,1),u:0});
  let t=0,m=0,P=90,cD=0,cP=0,cF=0,cG=0;const hist=new Float32Array(240);let hi=0,acc=0;
  const bulge=y=>(y>vP+15&&y<vD-15)?Math.sin(Math.PI*(y-vP-15)/(vD-vP-30)):0;
  const dW=y=>13*(1-0.6*m*bulge(y));
  const rand=mulberry(7),lob=[];for(let i=0;i<60;i++)lob.push([rnd(206,352),rand()*520+70,8+rand()*10]);
  return{draw(dt,S){
    t+=dt;const p=(t%1.6)/1.6,contr=walking&&p<0.42;m=walking?(p<0.42?Math.sin(Math.PI*p/0.42):0):0;
    const relax=walking&&!contr;
    cD+=((contr?1:0)-cD)*Math.min(1,dt*12);cP+=((relax?1:0)-cP)*Math.min(1,dt*12);
    cF+=(((contr&&!incomp)?1:0)-cF)*Math.min(1,dt*12);cG+=(((relax&&!incomp)?0.9:0)-cG)*Math.min(1,dt*10);
    const target=walking?(incomp?72:26):90,tau=walking?2.2:(incomp?1.4:6);P+=(target-P)*Math.min(1,dt/tau);
    const Pshow=P+m*(incomp?22:4);
    acc+=dt;while(acc>=1/30){acc-=1/30;hist[hi]=Pshow;hi=(hi+1)%hist.length}
    if(dt>0){
      for(const q of D){let u;if(!walking)u=-22;else if(contr)u=q.y>vD?-6:-300*m-30;else u=q.y>vD?-110:(q.y>vP?-35:-55);q.u=u;let nextY=q.y+u*dt;if(contr&&cD>.65&&q.y>vD&&nextY<vD+7)nextY=vD+7;if(relax&&cP>.65&&q.y>vP&&nextY<vP+7)nextY=vP+7;q.y=nextY;if(q.y<yT){q.y=yB;q.l=rnd(-1,1)}if(q.y>yB)q.y=yT}
      for(const q of G){let u;if(!walking)u=incomp?-6:-20;else if(incomp)u=contr?-50:150;else u=contr?-25:-40;q.u=u;q.y+=u*dt;if(q.y<yT)q.y=yB;if(q.y>yB)q.y=yT}
      for(const q of F){let u;if(!walking)u=0.06;else if(incomp)u=contr?-1.5:0.4;else u=contr?0:0.9;q.u=u;q.q+=u*dt;if(q.q>1)q.q=0;if(q.q<0)q.q=1}
    }
    // pierna: piel, tejido subcutáneo, fascia, músculos
    ctx.fillStyle=C.skin;ctx.fillRect(190,yT,12,yB-yT);ctx.fillRect(742,yT,12,yB-yT);
    ctx.fillStyle=C.fat;ctx.fillRect(202,yT,158,yB-yT);ctx.fillRect(730,yT,12,yB-yT);
    ctx.fillStyle=C.fatL;ctx.strokeStyle='rgba(160,120,40,.5)';for(const [x,y,r] of lob){ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();ctx.stroke()}
    ctx.fillStyle='#5a2222';ctx.fillRect(364,yT,362,yB-yT);
    for(const side of [-1,1]){
      ctx.beginPath();const inner=side<0?dX-16:dX+16,outer=side<0?368:722;
      ctx.moveTo(outer,yT);for(let y=yT;y<=yB;y+=8){const b=bulge(y);ctx.lineTo(inner+side*(1-b*m*0.55)*2+(-side)*b*m*12+side*b*(1-m)*8,y)}ctx.lineTo(outer,yB);ctx.closePath();
      const g=ctx.createLinearGradient(outer,0,inner,0);g.addColorStop(0,C.muscle);g.addColorStop(1,C.muscleL);ctx.fillStyle=g;ctx.fill();
      ctx.strokeStyle='rgba(60,10,10,.35)';ctx.lineWidth=1;for(let k=1;k<8;k++){const x0=lerp(outer,inner,k/8);ctx.beginPath();for(let y=yT;y<=yB;y+=10){const b=bulge(y);ctx.lineTo(x0-side*b*m*10*(k/8)+side*b*6*(k/8),y)}ctx.stroke()}
    }
    ctx.strokeStyle=C.fascia;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(fasL,yT);ctx.lineTo(fasL,yB);ctx.moveTo(fasR,yT);ctx.lineTo(fasR,yB);ctx.stroke();
    // vena profunda
    ctx.beginPath();for(let y=yT;y<=yB;y+=6)ctx.lineTo(dX-dW(y)-4,y);for(let y=yB;y>=yT;y-=6)ctx.lineTo(dX+dW(y)+4,y);ctx.closePath();ctx.fillStyle=C.veinWall;ctx.fill();
    ctx.beginPath();for(let y=yT;y<=yB;y+=6)ctx.lineTo(dX-dW(y),y);for(let y=yB;y>=yT;y-=6)ctx.lineTo(dX+dW(y),y);ctx.closePath();ctx.fillStyle=C.lumen;ctx.fill();
    for(const q of D){rbc(ctx,dX+q.l*dW(q.y)*.18,q.y,Math.PI/2,q.u>4,Math.min(.85,dW(q.y)/7))}
    drawValve(ctx,dX,vD,0,-1,dW(vD),cD,1,20);drawValve(ctx,dX,vP,0,-1,dW(vP),cP,1,20);
    // safena
    const gw=y=>incomp?10+5*Math.max(0,Math.sin(y*0.045)):7,gx=y=>gX+(incomp?Math.sin(y*0.035)*12:0);
    ctx.lineJoin='round';ctx.beginPath();for(let y=yT;y<=yB;y+=6)ctx.lineTo(gx(y)-gw(y)-3,y);for(let y=yB;y>=yT;y-=6)ctx.lineTo(gx(y)+gw(y)+3,y);ctx.closePath();ctx.fillStyle=C.veinWall;ctx.fill();
    ctx.beginPath();for(let y=yT;y<=yB;y+=6)ctx.lineTo(gx(y)-gw(y),y);for(let y=yB;y>=yT;y-=6)ctx.lineTo(gx(y)+gw(y),y);ctx.closePath();ctx.fillStyle=C.lumen;ctx.fill();
    for(const q of G)rbc(ctx,gx(q.y)+q.l*gw(q.y)*0.6,q.y,Math.PI/2,q.u>4,0.75);
    drawValve(ctx,gx(250),250,0,-1,gw(250),cG,incomp?gw(250)*0.5:1,14);
    // perforante
    const pw=incomp?7:5;ctx.lineCap='round';ctx.strokeStyle=C.veinWall;ctx.lineWidth=pw*2+6;ctx.beginPath();for(let q=0;q<=1.001;q+=0.05){const [x,y]=perf(q);ctx.lineTo(x,y)}ctx.stroke();
    ctx.strokeStyle=C.lumen;ctx.lineWidth=pw*2;ctx.stroke();
    for(const f of F){const [x,y]=perf(f.q),[x2,y2]=perf(Math.min(1,f.q+0.02));rbc(ctx,x+f.l*pw*0.4,y,Math.atan2(y2-y,x2-x),f.u<0,0.7)}
    const [vx,vy]=perf(0.42),[vx2,vy2]=perf(0.46),pl=Math.hypot(vx2-vx,vy2-vy);drawValve(ctx,vx,vy,(vx2-vx)/pl,(vy2-vy)/pl,pw,cF,incomp?pw*0.6:0.8,10);
    ctx.strokeStyle=C.fascia;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(fasL,370);ctx.lineTo(fasL,440);ctx.stroke();
    // flechas de fase
    if(contr){arrow(ctx,dX+50,320,dX+50,230,'rgba(240,120,130,.9)',4);if(incomp)arrow(ctx,400,395,320,395,'rgba(232,150,58,.95)',4)}
    else if(walking){arrow(ctx,300,385,340,388,'rgba(240,120,130,.9)',3);if(incomp)arrow(ctx,gX+38,280,gX+38,360,'rgba(232,150,58,.95)',4)}
    // gráfica PVA
    const cx=775,cy=80,cw=210,ch=220;ctx.fillStyle='rgba(22,33,42,.92)';ctx.strokeStyle=C.line;ctx.fillRect(cx,cy,cw,ch);ctx.strokeRect(cx,cy,cw,ch);
    ctx.font='400 11px '+MONO;ctx.fillStyle=C.dim;ctx.textAlign='right';
    for(const mm of [0,30,60,90]){const yy=cy+ch-10-mm/100*(ch-36);ctx.fillText(mm===0?'menor':mm===90?'mayor':'',cx+24,yy+4);ctx.strokeStyle='rgba(159,176,192,.2)';ctx.beginPath();ctx.moveTo(cx+30,yy);ctx.lineTo(cx+cw-6,yy);ctx.stroke()}
    ctx.strokeStyle=incomp?C.reflux:'#7fc8f0';ctx.lineWidth=2;ctx.beginPath();for(let k=0;k<hist.length;k++){const v=hist[(hi+k)%hist.length]||90;ctx.lineTo(cx+30+k*(cw-36)/hist.length,cy+ch-10-v/100*(ch-36))}ctx.stroke();
    ctx.textAlign='left';ctx.fillStyle=C.ink;ctx.font='600 13px '+FONT;ctx.fillText('Presión relativa · esquema',cx+8,cy+18);
    ctx.font='600 30px '+MONO;ctx.fillStyle=incomp?C.reflux:C.ink;ctx.fillText(Pshow>65?'Mayor':'Menor',cx,cy+ch+44);
    ctx.font='400 13px '+FONT;ctx.fillStyle=C.dim;ctx.fillText(walking?'Caminando: la bomba vacía la pierna':'De pie quieto: columna hidrostática',cx,cy+ch+68);
    ctx.fillText('Sin valores clínicos ni unidades',cx,cy+ch+88);
    roP.set(Pshow>65?'Mayor en este esquema':'Menor en este esquema');roV.set('No mide rellenado ni presión de una persona');
    banner(ctx,!walking?'De pie, sin movimiento: no hay bombeo':contr?'Contracción (sístole muscular): vaciado de venas profundas':(incomp?'Relajación: reflujo safeno y relleno profundo':'Relajación: llenado desde el sistema superficial'),
      !walking?'La columna hidrostática contribuye a la presión venosa distal':contr?(incomp?'La perforante incompetente expulsa sangre hacia la superficie':'Válvula proximal abierta, distal y perforante cerradas'):'Válvula proximal cerrada; distal y perforante abiertas',(walking&&incomp&&!contr)?C.reflux:C.ink);
    if(S.labels){
      lbl(ctx,196,110,182,110,'Piel','l');lbl(ctx,230,160,182,150,'Tejido subcutáneo','l');lbl(ctx,gX-9,215,182,200,'Vena safena mayor','l');
      lbl(ctx,fasL,300,182,300,'Fascia muscular','l');lbl(ctx,330,412,182,430,'Vena perforante','l');
      lbl(ctx,dX+12,300,600,118,'Venas profundas (tibiales)','r');lbl(ctx,dX+14,vP,620,150,'Válvula proximal','r');lbl(ctx,dX+14,vD,620,475,'Válvula distal','r');
      pill(ctx,400,560,'Sóleo y gemelos','left',C.ink);
    }
  }};
}

/* ---------- 3 · Fascias y compartimento safeno (corte transversal) ---------- */
function fasciaSim(api,ui){
  const ctx=api.ctx;let mode=0,k=0,t=0;
  ui.segmented('Estado',['Normal','Insuficiencia venosa crónica'],0,i=>{mode=i});
  ui.legend([[C.fascia,'Fascias (safena y muscular)'],[C.veinWall,'Pared venosa'],[C.reflux,'Reflujo / flujo invertido']]);
  const ro=ui.readout('Dirección en la perforante');
  const rand=mulberry(11),lob=[];for(let i=0;i<120;i++)lob.push([rand()*1000,105+rand()*220,9+rand()*13]);
  const musc=[];for(let i=0;i<70;i++)musc.push([rand()*1000,345+rand()*250,14+rand()*16]);
  const sapUp=x=>232-48*Math.exp(-(((x-450)/75)**2)),musF=x=>332+16*Math.exp(-(((x-450)/85)**2));
  const perf=q=>{const a=[452,296],c=[425,370],b=[462,470],m=1-q;return[m*m*a[0]+2*m*q*c[0]+q*q*b[0],m*m*a[1]+2*m*q*c[1]+q*q*b[1]]};
  const dots=[];for(let i=0;i<14;i++)dots.push(Math.random());
  return{draw(dt,S){
    t+=dt;k+=(mode-k)*Math.min(1,dt*2.5);
    ctx.fillStyle=C.skin;ctx.fillRect(0,36,1000,16);
    ctx.fillStyle=C.dermis;ctx.beginPath();ctx.moveTo(0,52);for(let x=0;x<=1000;x+=10)ctx.lineTo(x,52+4*Math.sin(x*0.15));ctx.lineTo(1000,100);ctx.lineTo(0,100);ctx.closePath();ctx.fill();
    ctx.fillStyle=C.fat;ctx.fillRect(0,100,1000,236);
    ctx.save();ctx.beginPath();ctx.rect(0,100,1000,236);ctx.clip();ctx.fillStyle=C.fatL;ctx.strokeStyle='rgba(150,110,30,.45)';
    for(const [x,y,r] of lob){if(Math.abs(x-450)<120&&y>sapUp(x)-8)continue;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();ctx.stroke()}ctx.restore();
    // compartimento safeno
    ctx.beginPath();for(let x=330;x<=570;x+=5)ctx.lineTo(x,sapUp(x)-k*8*Math.exp(-(((x-450)/70)**2)));for(let x=570;x>=330;x-=5)ctx.lineTo(x,musF(x));ctx.closePath();ctx.fillStyle='rgba(239,212,134,.55)';ctx.fill();
    // edema
    if(k>0.01){ctx.fillStyle='rgba(120,175,230,'+(0.16*k)+')';ctx.fillRect(0,52,1000,284)}
    // dermis: capilares, telangiectasias, hemosiderina
    ctx.strokeStyle='rgba(180,40,50,.6)';ctx.lineWidth=1.2;for(let x=30;x<1000;x+=55){ctx.beginPath();ctx.moveTo(x,96);ctx.quadraticCurveTo(x+6,62,x+12,96);ctx.stroke()}
    if(k>0.05){ctx.globalAlpha=k;ctx.strokeStyle='#7a4fa0';ctx.lineWidth=2;for(const x0 of [640,700,880]){ctx.beginPath();for(let i=0;i<8;i++)ctx.lineTo(x0+i*9,78+Math.sin(i*1.7+x0)*6);ctx.stroke()}
      ctx.fillStyle='#7a4a25';for(let i=0;i<26;i++){ctx.beginPath();ctx.arc(560+((i*67)%420),62+((i*29)%34),2.2,0,TAU);ctx.fill()}ctx.globalAlpha=1}
    // fascia safena y fascia muscular
    ctx.strokeStyle=C.fascia;ctx.lineWidth=3;ctx.beginPath();for(let x=0;x<=1000;x+=5)ctx.lineTo(x,sapUp(x)-k*8*Math.exp(-(((x-450)/70)**2)));ctx.stroke();
    ctx.fillStyle='#4f1d1d';ctx.fillRect(0,336,1000,264);
    for(const [x,y,r] of musc){ctx.fillStyle=C.muscle;ctx.strokeStyle='#5a1f1f';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='rgba(255,170,170,.12)';ctx.beginPath();ctx.arc(x-r*0.3,y-r*0.3,r*0.4,0,TAU);ctx.fill()}
    ctx.strokeStyle=C.fascia;ctx.lineWidth=5;ctx.beginPath();for(let x=0;x<=1000;x+=5)ctx.lineTo(x,musF(x));ctx.stroke();
    ctx.strokeStyle='rgba(233,238,242,.5)';ctx.lineWidth=1;ctx.beginPath();for(let x=0;x<=1000;x+=5)ctx.lineTo(x,musF(x)+4);ctx.stroke();
    // paquete profundo
    ctx.fillStyle='rgba(60,25,25,.85)';ctx.beginPath();ctx.ellipse(432,482,75,40,0,0,TAU);ctx.fill();
    const pa=12+1.6*Math.max(0,Math.sin(t*7.5));
    const vein=(x,y,r)=>{ctx.fillStyle=C.veinWall;ctx.beginPath();ctx.arc(x,y,r+3.5,0,TAU);ctx.fill();ctx.fillStyle=C.lumen;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill()};
    vein(396,486,13);vein(468,488,12+k*2);
    ctx.fillStyle='#d65a5a';ctx.beginPath();ctx.arc(432,478,pa+4,0,TAU);ctx.fill();ctx.fillStyle='#5a0f12';ctx.beginPath();ctx.arc(432,478,pa-2,0,TAU);ctx.fill();
    ctx.fillStyle=C.nerve;ctx.beginPath();ctx.arc(436,510,6,0,TAU);ctx.fill();
    // perforante
    const pw=4+k*4;ctx.lineCap='round';ctx.strokeStyle=C.veinWall;ctx.lineWidth=pw*2+5;ctx.beginPath();for(let q=0;q<=1.001;q+=0.05){const [x,y]=perf(q);ctx.lineTo(x,y)}ctx.stroke();ctx.strokeStyle=C.lumen;ctx.lineWidth=pw*2;ctx.stroke();
    const dir=k>0.5?-1:1;for(let i=0;i<dots.length;i++){dots[i]=(dots[i]+dir*dt*0.45+1)%1;const [x,y]=perf(dots[i]);ctx.fillStyle=k>0.5?C.reflux:C.blood;ctx.beginPath();ctx.arc(x,y,2.6+k,0,TAU);ctx.fill()}
    const [vx,vy]=perf(0.3),[vx2,vy2]=perf(0.34),ll=Math.hypot(vx2-vx,vy2-vy);drawValve(ctx,vx,vy,(vx2-vx)/ll,(vy2-vy)/ll,pw,k>0.5?0:(Math.sin(t*2)>0?1:0.2),k>0.5?pw:0.8,9);
    // vena safena mayor
    const gr=20+k*9;vein(450,272-k*3,gr);
    const out=(Math.floor(t/1.5)%2===0)||k<0.5;ctx.save();ctx.translate(450,272-k*3);ctx.lineWidth=2.4;
    if(out){ctx.strokeStyle=C.ink;ctx.beginPath();ctx.arc(0,0,8,0,TAU);ctx.stroke();ctx.fillStyle=C.ink;ctx.beginPath();ctx.arc(0,0,2.6,0,TAU);ctx.fill()}
    else{ctx.strokeStyle=C.reflux;ctx.beginPath();ctx.arc(0,0,8,0,TAU);ctx.moveTo(-5.5,-5.5);ctx.lineTo(5.5,5.5);ctx.moveTo(5.5,-5.5);ctx.lineTo(-5.5,5.5);ctx.stroke()}ctx.restore();
    ctx.fillStyle=C.nerve;ctx.beginPath();ctx.arc(480,292,4,0,TAU);ctx.fill();
    // tributaria superficial
    const tr=7+k*17;vein(770,165,tr);if(k>0.05){ctx.globalAlpha=smooth(clamp(k*1.4,0,1));vein(720,140,tr*0.85);vein(830,184,tr*0.95);ctx.globalAlpha=1}
    ro.set(k>0.5?'profundo → superficial (incompetente)':'superficial → profundo (normal)');
    banner(ctx,k>0.5?'Comparación: dilatación superficial y flujo saliente':'Corte transversal de la cara medial de la pierna',
      k>0.5?'La safena y las tributarias pueden dilatarse; los hallazgos varían':'⊙ flujo hacia el corazón, saliendo del plano · ⊗ reflujo entrando al plano',k>0.5?C.reflux:C.ink);
    if(S.labels){
      lbl(ctx,90,44,90,22+60,'Epidermis','r');lbl(ctx,180,80,180,118,'Dermis','r');lbl(ctx,140,200,140,160,'Tejido subcutáneo','r');
      lbl(ctx,330,sapUp(330),210,250,'Fascia safena','l');lbl(ctx,250,musF(250),180,300,'Fascia muscular profunda','l');
      lbl(ctx,450-gr,272,250,212,'Compartimento safeno ("ojo egipcio")','l');lbl(ctx,450+gr,262,600,240,'Vena safena mayor','r');
      lbl(ctx,770,165-tr,830,118,k>0.5?'Tributaria varicosa':'Tributaria superficial','r');
      lbl(ctx,432,394,600,388,'Vena perforante','r');lbl(ctx,480,488,600,440,'Venas tibiales posteriores','r');lbl(ctx,432,478,600,520,'Arteria tibial posterior','r');lbl(ctx,436,512,600,555,'Nervio tibial','r');
      lbl(ctx,150,420,150,470,'Músculo','r');
    }
  }};
}

/* ---------- 4 · Unión safeno-femoral y maniobra de Valsalva ---------- */
function sfjSim(api,ui){
  const ctx=api.ctx;let inc=false,man=null,mt=0,t=0;
  ui.segmented('Estado de la unión',['Competente','Incompetente'],0,i=>{inc=i===1});
  ui.buttons([['Maniobra de Valsalva',()=>{man='v';mt=0}],['Compresión distal y liberación',()=>{man='c';mt=0}]]);
  ui.legend([[C.blood,'Flujo anterógrado'],[C.reflux,'Reflujo'],[C.artery,'Arteria femoral']]);
  const roT=ui.readout('Reflujo en safena (Doppler)'),roM=ui.readout('Maniobra');
  const P0=[430,600],P1=[440,330],P2=[586,262],jY=262,cX=610,aX=700;
  const B=s=>{const m=1-s;return[m*m*P0[0]+2*m*s*P1[0]+s*s*P2[0],m*m*P0[1]+2*m*s*P1[1]+s*s*P2[1]]};
  const Cf=[],Gs=[];for(let i=0;i<130;i++)Cf.push({y:rnd(0,600),l:rnd(-1,1),u:0});for(let i=0;i<80;i++)Gs.push({s:Math.random(),l:rnd(-1,1),u:0});
  const tr=new Trace(300),rm=refluxMeter();let cT=0,cPT=0,cU=0,cL=0;
  function speeds(){let up=1,lo=1,g=0.6;if(!man)return[up,lo,g];const T=mt;
    if(man==='v'){if(T>3.5){man=null;return[up,lo,g]}
      if(inc){up=T<0.3?-0.4:-0.55;lo=T<0.3?-0.2:0;g=-0.95}else{up=T<0.3?-0.5:0;lo=T<0.3?-0.25:0;g=T<0.25?-0.35:0}}
    else{if(T>3.8){man=null;return[up,lo,g]}
      if(T<0.8){up=1.6;lo=1.7;g=2.0}else{const r=T-0.8;if(inc){g=r<2.2?-1:0.4;up=0.8;lo=r<0.3?-0.2:0.6}else{g=r<0.25?-0.35:0.4;up=1;lo=r<0.3?-0.25:0.8}}}
    return[up,lo,g]}
  const vein=(pts,w)=>{ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=C.veinWall;ctx.lineWidth=w*2+8;ctx.beginPath();pts.forEach(p=>ctx.lineTo(p[0],p[1]));ctx.stroke();ctx.strokeStyle=C.lumen;ctx.lineWidth=w*2;ctx.stroke()};
  const gPts=[];for(let s=0;s<=1.0001;s+=0.025)gPts.push(B(s));
  return{draw(dt,S){
    t+=dt;if(man)mt+=dt;const [up,lo,g]=speeds();const gw=inc?17:12;
    cT+=(((g<0&&!inc)?1:0)-cT)*Math.min(1,dt*14);cPT+=(((g<0&&!inc)?1:0)-cPT)*Math.min(1,dt*12);cU+=(((up<0&&!inc)?1:0)-cU)*Math.min(1,dt*12);cL+=((lo<=0?1:0)-cL)*Math.min(1,dt*12);
    if(dt>0){for(const p of Cf){const u=p.y<jY?up:lo;p.u=u;p.y-=u*150*dt;if(p.y<0)p.y=600;if(p.y>600)p.y=0;if(p.y>jY&&p.y-(-u*150*dt)<=jY&&u<0)p.y=0}
      for(const p of Gs){p.u=g;p.s+=g*0.32*dt;if(p.s>1)p.s=0;if(p.s<0)p.s=1}}
    rm.step(g,dt,tr,0.05);
    // ligamento inguinal y fascia cribiforme
    ctx.strokeStyle='#cfd8df';ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(380,132);ctx.lineTo(920,70);ctx.stroke();
    ctx.fillStyle='#d65a5a';ctx.fillRect(aX-15,0,30,600);ctx.fillStyle='#6a1015';const pa=Math.max(0,Math.sin(t*7.5))*2;ctx.fillRect(aX-9-pa/2,0,18+pa,600);
    // tributarias del cayado
    const q=B(0.9);ctx.globalAlpha=0.95;vein([q,[520,200],[470,108]],4);vein([q,[640,190],[760,150]],4);vein([q,[450,300],[330,312]],4);ctx.globalAlpha=1;
    vein([[cX,0],[cX,600]],24);vein(gPts,gw);
    ctx.save();ctx.setLineDash([6,6]);ctx.strokeStyle='rgba(233,238,242,.65)';ctx.lineWidth=1.6;ctx.beginPath();ctx.ellipse(580,262,105,62,-0.15,0,TAU);ctx.stroke();ctx.restore();
    for(const p of Cf)rbc(ctx,cX+p.l*17,p.y,Math.PI/2,(p.y<jY?up:lo)<0,0.85);
    for(const p of Gs){const [x,y]=B(p.s),[x2,y2]=B(Math.min(1,p.s+0.01));const a=Math.atan2(y2-y,x2-x);rbc(ctx,x-Math.sin(a)*p.l*gw*0.6,y+Math.cos(a)*p.l*gw*0.6,a,p.u<0,0.8)}
    const vAt=(s,c,gap)=>{const [x,y]=B(s),[x2,y2]=B(s+0.012),l=Math.hypot(x2-x,y2-y);drawValve(ctx,x,y,(x2-x)/l,(y2-y)/l,gw,c,gap,16)};
    vAt(0.94,cT,inc?gw*0.55:0.8);vAt(0.74,cPT,inc?gw*0.5:0.8);
    drawValve(ctx,cX,150,0,-1,24,cU,inc?10:0.8,26);drawValve(ctx,cX,420,0,-1,24,cL*0.9,0.8,26);
    // sonda
    const [sx,sy]=B(0.55);ctx.strokeStyle=C.ink;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(sx-gw-8,sy-6);ctx.lineTo(sx-gw-8,sy+6);ctx.moveTo(sx+gw+8,sy-6);ctx.lineTo(sx+gw+8,sy+6);ctx.stroke();
    if(man==='v'){arrow(ctx,cX,40,cX,110,'rgba(232,150,58,.95)',5);pill(ctx,cX+34,40,'↑ presión intraabdominal','left',C.reflux)}
    if(man==='c'&&mt<0.8)pill(ctx,470,580,'Compresión de la pantorrilla','left',C.ink);
    tr.draw(ctx,24,400,320,180,'Doppler · safena mayor proximal');
    const rv=rm.value,path=inc;ctx.font='600 13px '+MONO;ctx.textAlign='right';ctx.fillStyle=path?C.reflux:C.ok;ctx.fillText(rv.toFixed(2)+' s de esquema',336,417);ctx.textAlign='left';
    roT.set(rv.toFixed(2)+' s de animación');roM.set(man==='v'?'Valsalva en curso':man==='c'?(mt<0.8?'Compresión':'Liberación'):'En reposo');
    banner(ctx,man?(g<0&&inc?'Reflujo safeno‑femoral: la válvula terminal no cierra':'La válvula terminal cierra: no hay reflujo'):'Unión safeno‑femoral (cayado), pierna izquierda, vista anterior',
      man?'Trazado didáctico: el criterio clínico depende del segmento':'Pulse "Maniobra de Valsalva" o "Compresión distal" en el panel',man&&g<0&&inc?C.reflux:C.ink);
    if(S.labels){
      lbl(ctx,cX+28,500,760,500,'Vena femoral común','r');lbl(ctx,aX+15,555,760,555,'Arteria femoral común','r');lbl(ctx,880,75,870,40,'Ligamento inguinal','l');
      lbl(ctx,672,282,760,330,'Fascia cribiforme','r');const [tx,ty]=B(0.94);lbl(ctx,tx-6,ty-gw,360,214,'Válvula terminal','l');const [px,py]=B(0.74);lbl(ctx,px-gw,py,360,356,'Válvula preterminal','l');
      lbl(ctx,cX+24,150,760,190,'Válvula femoral/ilíaca (inconstante)','r');lbl(ctx,470,108,470,88,'V. epigástrica superficial','r');lbl(ctx,760,150,766,128,'V. circunfleja ilíaca superficial','r');lbl(ctx,330,312,300,290,'V. pudenda externa','l');
      const [gx,gy]=B(0.15);lbl(ctx,gx+gw,gy,480,560,'Vena safena mayor','r');
    }
  }};
}

/* ---------- 5 · Microcirculación e hipertensión venosa ---------- */
function microSim(api,ui){
  const ctx=api.ctx;let Pv=20,fast=1,t=0;
  const sl=ui.slider('Presión venosa relativa',10,90,1,Pv,v=>{Pv=v},v=>v<40?'Menor':'Mayor');
  ui.buttons([['Comparar hipertensión venosa',()=>{sl.set(85);fast=4}],['Restablecer',()=>{sl.set(20);fast=1;plasma.length=0;hemo.length=0;cuff=0;leuk.forEach(l=>{l.st=0;l.x=rnd(0,700)})}]]);
  ui.legend([[C.blood,'Eritrocitos'],['#f2e7a6','Plasma filtrado (edema)'],['#7a4a25','Hemosiderina (pigmento)'],['#f5f5f5','Leucocitos']]);
  const roF=ui.readout('Filtración neta'),roE=ui.readout('Edema intersticial'),roC=ui.readout('Correlación clínica');
  const yc=225,R=x=>x<250?lerp(28,10,smooth(clamp(x/250,0,1))):x<720?10:lerp(10,32,smooth(clamp((x-720)/260,0,1)));
  const red=[];for(let i=0;i<80;i++)red.push({x:rnd(0,1000),o:rnd(-1,1)});
  const leuk=[];for(let i=0;i<7;i++)leuk.push({x:rnd(0,1000),side:Math.random()<.5?-1:1,st:0,ts:0,out:0});
  const plasma=[],hemo=[];let cuff=0,spP=0,spH=0;
  const ly=420;
  return{draw(dt,S){
    t+=dt;const h=clamp((Pv-15)/75,0,1),fd=dt*fast;
    cuff=clamp(cuff+(h>0.6?(h-0.6)*0.06*fd:-0.004*dt),0,1);
    if(dt>0){
      for(const r of red){const v=150*(1-0.72*h)*(10/R(r.x))**0.8;r.x+=v*dt;if(r.x>1010){r.x=-10;r.o=rnd(-1,1)}}
      for(const l of leuk){
        if(l.st===0){l.x+=150*(1-0.72*h)*(10/R(l.x))*dt;if(l.x>740&&h>0.25)l.st=1;if(l.x>1010){l.x=-10}}
        else if(l.st===1){l.x+=Math.max(6,40*(1-h))*dt;if(h>0.5&&Math.random()<dt*0.4*fast)l.st=2;if(h<0.2)l.st=0;if(l.x>1010){l.x=-10;l.st=0}}
        else if(l.st===2){l.ts+=fd;if(h>0.7&&l.ts>3){l.st=3}if(h<0.3){l.st=1;l.ts=0}}
        else{l.out=Math.min(1,l.out+fd*0.15)}
      }
      spP+=fd*(2+h*h*55);while(spP>1){spP--;if(plasma.length<380){const x=rnd(430,960),s=Math.random()<.5?-1:1;plasma.push({x,y:yc+s*(R(x)+3),vx:rnd(-6,6),vy:s*rnd(14,28)})}}
      if(h>0.6){spH+=fd*(h-0.6)*7;while(spH>1){spH--;if(hemo.length<160){const x=rnd(740,960),s=Math.random()<.5?-1:1;hemo.push({x,y:yc+s*(R(x)+3),vy:s*rnd(10,20),age:0})}}}
      for(let i=plasma.length-1;i>=0;i--){const p=plasma[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx+=rnd(-20,20)*dt;p.vy*=1-dt*0.6;p.vy+=rnd(-14,14)*dt+(p.y<yc?-1:1)*2*dt;
        if(p.y>ly-16&&p.y<ly+16&&p.x>270&&Math.random()<dt*(1.6-h*0.9))plasma.splice(i,1);else{p.y=clamp(p.y,112,ly+30);p.x=clamp(p.x,10,990)}}
      for(const q of hemo){q.age+=fd;q.y+=q.vy*dt;q.vy*=1-dt*1.5}
    }
    const edema=plasma.length/380;
    // intersticio
    ctx.fillStyle='#2a2320';ctx.fillRect(0,100,1000,370);
    ctx.fillStyle='rgba(120,175,230,'+(0.05+edema*0.3)+')';ctx.fillRect(0,100,1000,370);
    ctx.strokeStyle='rgba(220,200,160,.12)';ctx.lineWidth=2;for(let i=0;i<14;i++){ctx.beginPath();ctx.moveTo(i*75,108);ctx.bezierCurveTo(i*75+40,200,i*75-30,320,i*75+20,460);ctx.stroke()}
    // linfático
    ctx.fillStyle='rgba(200,230,215,.25)';ctx.strokeStyle='#9fd4bd';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(1000,ly-14);ctx.lineTo(280,ly-14);ctx.arc(280,ly,14,-Math.PI/2,Math.PI/2,true);ctx.lineTo(1000,ly+14);ctx.fill();ctx.stroke();
    // manguito de fibrina
    if(cuff>0.02){ctx.strokeStyle='rgba(230,205,120,'+(cuff*0.75)+')';ctx.lineWidth=7;for(const s of [-1,1]){ctx.beginPath();for(let x=420;x<=980;x+=8)ctx.lineTo(x,yc+s*(R(x)+9));ctx.stroke()}}
    // vaso
    ctx.beginPath();for(let x=0;x<=1000;x+=6)ctx.lineTo(x,yc-R(x));for(let x=1000;x>=0;x-=6)ctx.lineTo(x,yc+R(x));ctx.closePath();ctx.fillStyle='#4a1219';ctx.fill();
    const gap=0.5+6*h*h;
    for(const s of [-1,1])for(let x0=0;x0<1000;x0+=36){ctx.strokeStyle=C.endo;ctx.lineWidth=4;ctx.lineCap='butt';ctx.beginPath();for(let x=x0+gap/2;x<=x0+36-gap/2;x+=3)ctx.lineTo(x,yc+s*(R(x)+2));ctx.stroke();ctx.fillStyle=C.endoN;ctx.beginPath();ctx.ellipse(x0+18,yc+s*(R(x0+18)+3),6,2.2,0,0,TAU);ctx.fill()}
    ctx.strokeStyle='#c88aa0';ctx.lineWidth=3;for(const px of [360,560]){for(const s of [-1,1]){ctx.beginPath();ctx.arc(px,yc+s*12,14,s<0?Math.PI*1.1:Math.PI*0.1,s<0?Math.PI*1.9:Math.PI*0.9);ctx.stroke()}}
    for(const r of red){const rr=R(r.x);rbc(ctx,r.x,yc+r.o*Math.max(0,rr-7),0,false,rr<12?0.95:1.05)}
    for(const l of leuk){let y=yc;if(l.st>=1)y=yc+l.side*(R(l.x)-7);if(l.st===3)y=yc+l.side*(R(l.x)+4+l.out*30);
      ctx.fillStyle='#f5f5f5';ctx.strokeStyle='#9aa';ctx.lineWidth=1;ctx.beginPath();ctx.arc(l.x,y,8,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='#8a5fb0';for(const [a,b] of [[-3,-2],[2,-2],[0,3]]){ctx.beginPath();ctx.arc(l.x+a,y+b,2.4,0,TAU);ctx.fill()}}
    for(const p of plasma){ctx.fillStyle='rgba(242,231,166,.85)';ctx.beginPath();ctx.arc(p.x,p.y,2.2,0,TAU);ctx.fill()}
    for(const q of hemo){const a=clamp(q.age/6,0,1);ctx.fillStyle=a<1?`rgb(${Math.round(lerp(163,122,a))},${Math.round(lerp(33,74,a))},${Math.round(lerp(50,37,a))})`:'#7a4a25';ctx.beginPath();ctx.ellipse(q.x,q.y,a<1?5:3.5,a<1?3:3.5,0,0,TAU);ctx.fill()}
    // Starling
    arrow(ctx,320,yc-16,320,yc-58,'rgba(242,231,166,.9)',3);arrow(ctx,320,yc+16,320,yc+58,'rgba(242,231,166,.9)',3);
    arrow(ctx,650,yc+65,650,ly-20,'rgba(127,200,240,.9)',3);
    pill(ctx,860,yc,'Presión relativa: '+(h>.5?'mayor':'menor'),'left',h>.5?C.reflux:C.ink);
    const hc=hemo.filter(q=>q.age>6).length;
    roF.set(h<.35?'Filtración y drenaje linfático':h<.6?'Filtración aumentada: ejemplo':'Filtración mayor: ejemplo');roE.set(edema>.25?'Más líquido representado':'Menos líquido representado');
    roC.set('No asigna CEAP ni probabilidad de úlcera');
    banner(ctx,h<0.35?'Balance intersticial: filtración y retorno linfático':'Hipertensión venosa: la presión se transmite al capilar',
      h<0.35?'El drenaje linfático participa en el retorno del líquido intersticial':'Fuga de plasma y eritrocitos, adhesión leucocitaria y depósito de hemosiderina',h<0.35?C.ink:C.reflux);
    ctx.font='400 13px '+MONO;ctx.fillStyle=C.dim;ctx.textAlign='left';ctx.fillText('Esquema cualitativo: no calcula fuerzas de Starling ni caudales',24,585);
    if(S.labels){
      lbl(ctx,100,yc-22,100,130,'Arteriola','r');lbl(ctx,470,yc-12,470,130,'Capilar','r');lbl(ctx,880,yc-28,880,130,'Vénula poscapilar','r');
      lbl(ctx,540,yc+13,540,320,'Endotelio y uniones intercelulares','r');lbl(ctx,360,yc+26,200,320,'Pericito','l');lbl(ctx,600,ly+14,600,500,'Capilar linfático','r');
      lbl(ctx,180,ly-60,180,500,'Intersticio','l');
      if(cuff>0.2)lbl(ctx,800,yc+R(800)+9,820,360,'Manguito pericapilar de fibrina','r');
    }
  }};
}

/* ---------- 9 · Escleroterapia: mecanismo paso a paso ---------- */
function scleroSim(api,ui){
  const ctx=api.ctx;
  const TYPES=[
    {name:'Telangiectasia',size:'< 1 mm',y0:132,R:7,w:3,xc:420,ang:12,needle:'Referencia didáctica',rec:[.6,1.4],recTxt:'Sin prescripción',vol:'No calculado',col:'#c2364a',dil:0.95,layer:'dermis'},
    {name:'Vena reticular',size:'1 a < 3 mm',y0:215,R:15,w:6,xc:540,ang:20,needle:'Referencia didáctica',rec:[.6,1.4],recTxt:'Sin prescripción',vol:'No calculado',col:'#3f86a8',dil:0.75,layer:'subdérmica'},
    {name:'Tributaria varicosa',size:'≥ 3 mm',y0:310,R:36,w:12,xc:520,ang:35,needle:'Referencia didáctica',rec:[.6,1.4],recTxt:'Sin prescripción',vol:'No calculado',col:'#5b6fbf',dil:0.4,layer:'subcutánea'}];
  let reopen=false;let ti=2,foam=true,conc=1,comp=true,extra=false,step=0,p=0,seq=true,t=0;
  const D=[3,3.5,4.5,4.5,4.5,7];
  ui.segmented('Tipo de vena',TYPES.map(T=>T.name+' ('+T.size+')'),2,i=>{ti=i;restart()});
  ui.segmented('Agente esclerosante',['Líquido','Espuma'],1,i=>{foam=i===1;restart()});
  ui.slider('Intensidad del efecto (didáctica)',0.1,3,0.05,conc,v=>{conc=v},v=>v<.7?'Menor':v<1.8?'Intermedia':'Mayor');
  ui.toggle('Mostrar compresión posterior',true,v=>{comp=v});
  ui.segmented('Respuesta del ejemplo',['Fibrosis','Recanalización'],0,i=>{reopen=i===1});
  ui.toggle('Simular extravasación perivenosa',false,v=>{extra=v});
  const stepSeg=ui.segmented('Paso',['1 Vena','2 Punción','3 Inyección','4 Endotelio','5 Compresión','6 Fibrosis'],0,i=>{step=i;p=0;seq=false});
  ui.buttons([['Reproducir secuencia completa',()=>{restart()}],['Siguiente paso →',()=>{if(step<5){step++;p=0;seq=false;stepSeg&&stepSeg.set(step)}}]]);
  ui.legend([['#f4f7fa','Espuma (microburbujas de gas)'],['#50c8be','Moléculas de polidocanol activas'],['#7d8790','Polidocanol inactivado por proteínas'],['#e1463c','Inflamación y necrosis por exceso'],[C.endo,'Endotelio'],['#e8d27a','Colágeno subendotelial expuesto'],['#8f6fd0','Plaquetas y fibrina'],['#b08c6a','Fibroblastos / cordón fibroso'],['#7a4a25','Hemosiderina']]);
  const roN=ui.readout('Punción'),roR=ui.readout('Tratamiento'),roV=ui.readout('Volumen'),roM=ui.readout('Intensidad'),roE=ui.readout('Contacto representado'),roO=ui.readout('Respuesta seleccionada');
  const hash=i=>{const s=Math.sin(i*12.9898)*43758.5453;return s-Math.floor(s)};
  const bubbles=[];for(let i=0;i<260;i++)bubbles.push({u:hash(i+1),f:hash(i+300)*2-1,r:0.5+hash(i+600)});
  const fib=[];for(let i=0;i<40;i++)fib.push([hash(i+900),hash(i+950)*2-1,hash(i+990),hash(i+1030)*2-1]);
  const lob=[];{const r=mulberry(5);for(let i=0;i<70;i++)lob.push([r()*1000,190+r()*290,10+r()*16])}
  let RB=[];
  const MOL=[];for(let i=0;i<80;i++)MOL.push({x:Math.random(),y:Math.random()*0.85,st:0,a:null,ph:Math.random()*TAU});
  const ALB=[];for(let i=0;i<12;i++)ALB.push({x:Math.random(),y:0.1+Math.random()*0.6,ph:Math.random()*TAU});
  const BUB=[[0.1,0.2],[0.33,0.24],[0.58,0.22],[0.82,0.21],[0.22,0.12],[0.7,0.13],[0.46,0.11]];
  let microDmg=0;
  function resetMol(){MOL.forEach(m=>{m.x=Math.random();m.y=Math.random()*0.6;m.st=0;m.a=null})}
  function restart(){resetMol();step=0;p=0;seq=true;stepSeg&&stepSeg.set(0);RB=[];const T=TYPES[ti];for(let i=0;i<Math.round(40+T.R*4);i++)RB.push({x:rnd(-10,1010),f:rnd(-0.85,0.85)})}
  restart();
  let lastFoam=foam;
  return{draw(dt,S){
    const T=TYPES[ti];t+=dt;
    if(dt>0){p+=dt/D[step];if(p>=1){if(seq&&step<5){step++;p=0;stepSeg&&stepSeg.set(step)}else p=1}}
    const eff=conc*(foam?1:T.dil),ratio=eff/T.rec[0],dmg=clamp((ratio-0.3)/0.7,0,1),excess=eff>T.rec[1]*1.8,recanal=reopen;
    const sp=x=>smooth(clamp(x,0,1));
    const q=step>2?1:step===2?sp(p):0;
    const W0=(foam?190:120)*(ti===0?0.8:1),W1=(foam?330:220)*(ti===0?0.8:1);
    const recShrink=(step===5&&recanal)?1-sp(p):1;
    const x0=T.xc-W0*q*recShrink,x1=T.xc+W1*q*recShrink;
    const inR=x=>q<=0?0:clamp(Math.min(x-x0,x1-x)/24+0.5,0,1);
    // factor de radio en la zona tratada
    let fz=1;
    if(step>=3){const spasm=1-0.32*dmg*(step===3?sp(p):1);fz=spasm;
      if(step>=4&&comp)fz=lerp(spasm,0.1,step===4?sp(p):1);
      if(step===5){if(recanal)fz=lerp(fz,0.9,sp(p));else fz=comp?0.1:lerp(spasm,0.45,sp(p))}}
    const Rc=x=>T.R*lerp(1,fz,inR(x));
    const y0=T.y0,surf=80;
    const padOn=comp&&step>=4,dip=x=>padOn?6*Math.exp(-(((x-(x0+x1)/2)/((x1-x0)/2+40))**4)):0;
    // tejidos
    ctx.fillStyle='#5a2222';ctx.fillRect(0,499,1000,46);ctx.strokeStyle='rgba(60,10,10,.4)';for(let x=0;x<1000;x+=18){ctx.beginPath();ctx.moveTo(x,502);ctx.lineTo(x+30,542);ctx.stroke()}
    ctx.fillStyle=C.fat;ctx.fillRect(0,170,1000,327);
    ctx.fillStyle=C.fatL;ctx.strokeStyle='rgba(150,110,30,.45)';for(const [x,y,r] of lob){if(Math.abs(y-y0)<T.R+T.w+r+4)continue;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();ctx.stroke()}
    ctx.fillStyle=C.dermis;ctx.beginPath();ctx.moveTo(0,170);for(let x=0;x<=1000;x+=8)ctx.lineTo(x,surf+12+dip(x)+3*Math.sin(x*0.16));ctx.lineTo(1000,170);ctx.closePath();ctx.fill();
    ctx.fillStyle=C.skin;ctx.beginPath();for(let x=0;x<=1000;x+=8)ctx.lineTo(x,surf+dip(x));for(let x=1000;x>=0;x-=8)ctx.lineTo(x,surf+12+dip(x)+3*Math.sin(x*0.16));ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(180,40,50,.5)';ctx.lineWidth=1.2;for(let x=20;x<1000;x+=46){ctx.beginPath();ctx.moveTo(x,166);ctx.quadraticCurveTo(x+6,surf+22,x+12,166);ctx.stroke()}
    ctx.strokeStyle=C.fascia;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,497);ctx.lineTo(1000,497);ctx.stroke();
    // extravasación
    if(extra&&step>=2){const a=step===2?sp(p):1;ctx.fillStyle='rgba(80,200,190,'+(0.35*a)+')';ctx.beginPath();ctx.ellipse(T.xc-30,y0-T.R-14,40+T.R,18+T.R*0.4,-0.3,0,TAU);ctx.fill();
      if(step>=3&&eff>=0.5){ctx.fillStyle='rgba(70,30,20,'+(0.45*Math.min(1,eff/2)*(step===3?sp(p):1))+')';ctx.beginPath();ctx.ellipse(T.xc-30,y0-T.R-14,30+T.R,13+T.R*0.3,-0.3,0,TAU);ctx.fill()}}
    // pared venosa
    const band=(sg,o1,o2,fill)=>{ctx.beginPath();for(let x=-10;x<=1010;x+=6)ctx.lineTo(x,y0+sg*(Rc(x)+o1));for(let x=1010;x>=-10;x-=6)ctx.lineTo(x,y0+sg*(Rc(x)+o2));ctx.closePath();ctx.fillStyle=fill;ctx.fill()};
    for(const sg of [-1,1]){if(ti===0)band(sg,0,T.w,'#c98f9a');else{band(sg,0,T.w*0.55,C.media);band(sg,T.w*0.55,T.w,C.advent)}}
    const lumen=()=>{ctx.beginPath();for(let x=-10;x<=1010;x+=6)ctx.lineTo(x,y0-Rc(x));for(let x=1010;x>=-10;x-=6)ctx.lineTo(x,y0+Rc(x));ctx.closePath()};
    lumen();ctx.fillStyle=C.lumen;ctx.fill();
    // contenido de la zona tratada
    if(q>0){ctx.save();lumen();ctx.clip();
      if(step===5&&!recanal){ctx.fillStyle='#d9c7ae';ctx.fillRect(x0,y0-T.R-2,x1-x0,2*T.R+4);ctx.fillStyle='#b08c6a';for(let i=0;i<60;i++){const x=lerp(x0,x1,hash(i+70)),y=y0+(hash(i+140)*2-1)*Rc(x)*0.7;ctx.beginPath();ctx.ellipse(x,y,5,1.4,0.2,0,TAU);ctx.fill()}}
      else if(step>=4&&!comp&&!(step===5&&recanal)){ctx.fillStyle='#4a0b12';ctx.fillRect(x0,y0-T.R,x1-x0,2*T.R)}
      else if(!(step===5&&recanal)){
        if(foam){ctx.fillStyle='#e6ecf1';ctx.fillRect(x0,y0-T.R,x1-x0,2*T.R);ctx.strokeStyle='rgba(150,170,190,.7)';ctx.lineWidth=0.8;ctx.fillStyle='#f8fbfd';
          const bs=ti===0?0.8:ti===1?1.2:2.2;for(const b of bubbles){const x=lerp(x0,x1,b.u),y=y0+b.f*Rc(x)*0.9;ctx.beginPath();ctx.arc(x,y,b.r*bs+0.6,0,TAU);ctx.fill();ctx.stroke()}}
        else{const g=ctx.createLinearGradient(x0,0,x1,0),a=Math.min(0.75,0.35+eff*0.25);g.addColorStop(0,'rgba(80,200,190,0)');g.addColorStop(clamp((T.xc-x0)/Math.max(1,x1-x0),0.01,0.99),'rgba(80,200,190,'+a+')');g.addColorStop(1,'rgba(80,200,190,0)');ctx.fillStyle=g;ctx.fillRect(x0,y0-T.R,x1-x0,2*T.R)}}
      if(step>=4&&!(step===5&&recanal)){const a=step===4?sp(p):1;ctx.strokeStyle='rgba(143,111,208,'+(0.75*a)+')';ctx.lineWidth=1;for(const [u1,f1,u2,f2] of fib){const xa=lerp(x0,x1,u1),xb=lerp(x0,x1,u2);ctx.beginPath();ctx.moveTo(xa,y0+f1*Rc(xa));ctx.lineTo(xb,y0+f2*Rc(xb));ctx.stroke()}}
      ctx.restore()}
    // eritrocitos
    if(dt>0)for(const r of RB){let v=step===0?70:step===1?50:step>=3&&!(step===5&&recanal)?8:35;if(step===5&&recanal)v=60*sp(p)+8;
      r.x+=v*dt;if(r.x>1010){r.x=-10;r.f=rnd(-0.85,0.85)}
      if(inR(r.x)>0.5&&!(step===5&&recanal)){if(foam||step>=4)r.x=r.x<(x0+x1)/2?x0-rnd(2,14):x1+rnd(2,14)}}
    const rs=ti===0?0.5:ti===1?0.75:1;
    for(const r of RB){const w=inR(r.x);if(w>0.5&&(foam||step>=4)&&!(step===5&&recanal))continue;const lumen=Rc(r.x);if(lumen<4)continue;rbc(ctx,r.x,y0+r.f*lumen*.6,0,false,Math.min(rs,lumen*.065))}
    // endotelio y colágeno expuesto
    const det=step<3?0:step===3?sp(p):1;
    for(let i=0,x=4;x<1000;x+=11,i++)for(const sg of [-1,1]){const hit=inR(x)>0.5&&hash(i*2+(sg>0?1:0))<dmg,d=hit?clamp(det*1.6-hash(i+77)*0.6,0,1):0;const yw=y0+sg*(Rc(x)-1);
      if(step===5&&!recanal&&inR(x)>0.5)continue;
      if(d>0){ctx.strokeStyle='#e8d27a';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(x-5,yw);ctx.lineTo(x+5,yw);ctx.stroke();
        if(step>=4){const a=step===4?sp(p):1;ctx.fillStyle='rgba(143,111,208,'+(0.95*a)+')';for(let k=0;k<3;k++){ctx.beginPath();ctx.arc(x-4+k*4,yw-sg*2.2,1.5,0,TAU);ctx.fill()}}}
      if(d<1){ctx.globalAlpha=1-d;ctx.fillStyle=C.endo;ctx.beginPath();ctx.ellipse(x+d*14,yw-sg*d*Rc(x)*0.6,4.6,1.4,d*1.5,0,TAU);ctx.fill();ctx.fillStyle=C.endoN;ctx.beginPath();ctx.arc(x+d*14,yw-sg*d*Rc(x)*0.6,1,0,TAU);ctx.fill();ctx.globalAlpha=1}}
    // reabsorción
    if(step===5&&!recanal){const a=sp(clamp(p*1.6-0.5,0,1))*(comp?0.85:0.45);ctx.fillStyle=ti===0?'rgba(232,188,171,'+a+')':'rgba(220,184,94,'+a+')';ctx.fillRect(x0+10,y0-T.R-T.w-2,x1-x0-20,2*(T.R+T.w)+4)}
    // exceso de concentración: necrosis de la media e inflamación perivenosa
    const over=clamp((eff/T.rec[1]-1)/1.2,0,1);
    if(step>=3&&over>0&&q>0&&!(step===5&&!recanal&&comp&&p>0.8)){const a=(step===3?sp(p):1)*over;
      for(const sg of [-1,1]){ctx.fillStyle='rgba(225,70,60,'+(0.38*a)+')';ctx.beginPath();for(let x=x0;x<=x1;x+=6)ctx.lineTo(x,y0+sg*(Rc(x)+T.w));for(let x=x1;x>=x0;x-=6)ctx.lineTo(x,y0+sg*(Rc(x)+T.w+6+22*over));ctx.closePath();ctx.fill();
        ctx.fillStyle='rgba(40,8,8,'+(0.8*a)+')';for(let i=0;i<Math.round(30*over);i++){const x=lerp(x0,x1,hash(i+1200));ctx.beginPath();ctx.arc(x,y0+sg*(Rc(x)+T.w*0.5),Math.max(1.2,T.w*0.3),0,TAU);ctx.fill()}
        ctx.fillStyle='rgba(245,245,245,'+(0.9*a)+')';for(let i=0;i<Math.round(24*over);i++){const x=lerp(x0,x1,hash(i+1300));ctx.beginPath();ctx.arc(x,y0+sg*(Rc(x)+T.w+5+hash(i+1350)*18*over),2.4,0,TAU);ctx.fill()}}}
    // aguja y jeringa
    const a=T.ang*Math.PI/180,dx=Math.cos(a),dy=Math.sin(a),dist=(y0-surf)/dy;
    const ins=step===1?sp(p):step===2?1:step===3?1-sp(Math.min(1,p*2.5)):0;
    if(step>=1&&step<=3&&ins>0){const tx=T.xc-dx*(1-ins)*(dist+40),ty=y0-dy*(1-ins)*(dist+40),Ln=dist+60,hx=tx-dx*Ln,hy=ty-dy*Ln;
      ctx.strokeStyle='#c9d3dc';ctx.lineWidth=ti===0?1.6:ti===1?2.2:3;ctx.lineCap='butt';ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(hx,hy);ctx.stroke();
      ctx.save();ctx.translate(hx,hy);ctx.rotate(a);ctx.fillStyle='#7fa7c9';ctx.fillRect(-16,-5,16,10);
      if(step===1&&p>0.8&&ti>0){ctx.fillStyle='#8a1422';ctx.fillRect(-14,-3,12,6)}
      const fill=step===2?1-0.65*sp(p):step>2?0.35:1;ctx.fillStyle='rgba(230,237,243,.18)';ctx.strokeStyle='#c9d3dc';ctx.lineWidth=1.5;ctx.fillRect(-196,-14,180,28);ctx.strokeRect(-196,-14,180,28);
      ctx.fillStyle=foam?'#eef3f6':'rgba(80,200,190,.8)';ctx.fillRect(-16-180*fill,-12,180*fill,24);ctx.fillStyle='#9fb0c0';ctx.fillRect(-16-180*fill-8,-13,8,26);ctx.fillRect(-16-180*fill-80,-3,72,6);ctx.restore()}
    // compresión
    if(padOn){const cx=(x0+x1)/2,w=x1-x0+40,a2=step===4?sp(p):1;ctx.globalAlpha=a2;ctx.fillStyle='#e9e4da';ctx.fillRect(cx-w/2,surf-24+6,w,20);ctx.fillStyle='#b9c7d6';ctx.fillRect(cx-w/2-30,surf-34+6,w+60,10);ctx.globalAlpha=1;
      arrow(ctx,cx,surf-70,cx,surf-36,'rgba(230,237,243,.9)',3)}
    // pigmentación / matting en dermis
    if(step===5&&(!comp||over>0)){const n=Math.round(sp(p)*(( !comp?40:0)+over*45));ctx.fillStyle='#7a4a25';for(let i=0;i<n;i++){ctx.beginPath();ctx.arc(lerp(x0,x1,hash(i+400)),surf+22+hash(i+460)*50,2.2,0,TAU);ctx.fill()}}
    if(step===5&&excess&&ti===0){ctx.strokeStyle='rgba(200,40,60,'+sp(p)+')';ctx.lineWidth=1;for(let i=0;i<10;i++){const x=lerp(x0-40,x1+40,hash(i+500));ctx.beginPath();for(let k=0;k<6;k++)ctx.lineTo(x+k*7,surf+30+hash(i*7+k)*16);ctx.stroke()}}
    // vista de la piel
    const ix=20,iy=378,iw=240,ih=112;ctx.fillStyle='#e5b39c';ctx.fillRect(ix,iy,iw,ih);ctx.strokeStyle=C.line;ctx.strokeRect(ix,iy,iw,ih);
    let vis=1,blanch=0;if(step===2)blanch=sp(p);if(step===3)blanch=1-0.4*sp(p);if(step===4){blanch=comp?0:0;vis=comp?0.55:0.9}
    if(step===5){vis=recanal?lerp(0.6,1,sp(p)):(comp?0.55*(1-sp(p))+0.04:0.6)}
    ctx.save();ctx.beginPath();ctx.rect(ix,iy,iw,ih);ctx.clip();ctx.lineCap='round';
    const vcol=step>=4&&!comp&&!recanal?'#3a2a4a':T.col;ctx.globalAlpha=vis;ctx.strokeStyle=vcol;
    if(ti===0){ctx.lineWidth=1.4;for(let k=0;k<9;k++){const an=k/9*TAU;ctx.beginPath();ctx.moveTo(ix+120,iy+56);for(let j=1;j<=5;j++)ctx.lineTo(ix+120+Math.cos(an+j*0.15)*j*14,iy+56+Math.sin(an+j*0.15)*j*9);ctx.stroke()}}
    else{ctx.lineWidth=ti===1?3:9;ctx.beginPath();for(let x=0;x<=iw;x+=6)ctx.lineTo(ix+x,iy+56+Math.sin(x*0.05)*(ti===1?10:18));ctx.stroke()}
    if(blanch>0){ctx.globalAlpha=blanch*0.9;ctx.strokeStyle='#f4ece6';ctx.lineWidth+=1;ctx.stroke()}
    ctx.globalAlpha=1;
    if(step===5&&(!comp||over>0)){ctx.fillStyle='rgba(122,74,37,'+(0.7*sp(p))+')';for(let i=0;i<Math.round((!comp?18:0)+over*24);i++){ctx.beginPath();ctx.arc(ix+20+hash(i+40)*200,iy+40+hash(i+90)*32,3,0,TAU);ctx.fill()}}
    if(step===5&&extra&&eff>=1){ctx.fillStyle='rgba(60,20,15,'+sp(p)+')';ctx.beginPath();ctx.ellipse(ix+80,iy+40,12,8,0,0,TAU);ctx.fill()}
    if(step>=1){ctx.fillStyle='#7a2a2a';ctx.beginPath();ctx.arc(ix+70,iy+52,1.8,0,TAU);ctx.fill()}
    ctx.restore();ctx.font='600 12px '+FONT;ctx.fillStyle='#3a2a20';ctx.textAlign='left';ctx.fillText('Vista de la piel',ix+6,iy+14);
    // Clinical dose is deliberately not inferred from calibre or visual intensity.
    {const gx=278,gy=378,gw=362,gh=112;ctx.fillStyle='rgba(15,23,30,.92)';ctx.fillRect(gx,gy,gw,gh);ctx.strokeStyle=C.line;ctx.strokeRect(gx,gy,gw,gh);
      ctx.fillStyle=C.ink;ctx.font='600 13px '+FONT;ctx.textAlign='left';ctx.fillText('Mecanismo, no selección de dosis',gx+12,gy+23);
      ctx.font='400 12px '+FONT;ctx.fillText('Intensidad: parámetro visual sin unidades',gx+12,gy+48);ctx.fillText('Fibrosis o recanalización: respuestas elegidas',gx+12,gy+70);ctx.fillText('No calcula concentración ni volumen clínico',gx+12,gy+92)}
    // zoom microscópico: química del líquido frente a la espuma
    {const mx=652,my=378,mw=330,mh=112,top=my+18,bot=my+mh-22,H=bot-top,PX=u=>mx+u*mw,PY=v=>top+v*H;
      if(foam!==lastFoam){resetMol();lastFoam=foam}
      const mt=step<2?0:(step===2?sp(p)*0.5:step===3?0.5+0.5*sp(p):1)*clamp(eff/T.rec[0]*0.7,0,1.6);microDmg+=(mt-microDmg)*Math.min(1,dt*2);
      ctx.save();ctx.beginPath();ctx.rect(mx,my,mw,mh);ctx.clip();ctx.fillStyle=foam?'#1f2630':'#3a1c20';ctx.fillRect(mx,my,mw,mh);
      const nM=Math.round(12+conc*22);
      if(!foam){
        for(let i=0;i<4;i++){const x=PX((i*0.27+t*0.03)%1),y=PY(0.25+0.15*Math.sin(i*2+t));rbc(ctx,x,y,0.3*i,false,2.4)}
        for(const a of ALB){a.x=(a.x+dt*0.025+1)%1;a.y=clamp(a.y+Math.sin(t+a.ph)*dt*0.05,0.05,0.75);ctx.fillStyle='#a9b3bd';ctx.beginPath();ctx.ellipse(PX(a.x),PY(a.y),7,4.5,0,0,TAU);ctx.fill()}
        for(let i=0;i<Math.min(nM,MOL.length);i++){const m=MOL[i];
          if(m.st===0&&step>=2){m.x=(m.x+(Math.random()-.5)*dt*0.25+dt*0.02+1)%1;m.y=clamp(m.y+(Math.random()-.45)*dt*0.35,0,1);
            for(const a of ALB){if(Math.abs(a.x-m.x)<0.03&&Math.abs(a.y-m.y)<0.06){m.st=1;m.a=a;break}}
            if(m.y>=0.99)m.st=2}
          let x,y;if(m.st===1){x=PX(m.a.x)+Math.cos(m.ph)*7;y=PY(m.a.y)+Math.sin(m.ph)*5}else if(m.st===2){x=PX(m.x);y=bot-2}else{x=PX(m.x);y=PY(m.y)}
          if(step<2&&m.st===0)continue;
          ctx.strokeStyle=m.st===1?'#7d8790':'#50c8be';ctx.fillStyle=m.st===1?'#7d8790':'#50c8be';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+5,y+3);ctx.stroke();ctx.beginPath();ctx.arc(x,y,2.4,0,TAU);ctx.fill()}
      }else{
        for(let b=0;b<BUB.length;b++){const [u,r]=BUB[b];const shrink=step>=4?Math.max(0.35,1-(step===4?sp(p)*0.4:0.4+sp(p)*0.6)):1;const R=r*H*1.1*shrink*(step>=2?1:0);if(R<=0)continue;
          const cx=PX(u),cy=bot-R-1-(b>=4?R*0.9+18:0);ctx.fillStyle='rgba(220,235,245,.12)';ctx.strokeStyle='rgba(220,235,245,.7)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx,cy,R,0,TAU);ctx.fill();ctx.stroke();
          const k=Math.round(6+conc*7*(R/24));for(let j=0;j<k;j++){const an=j/k*TAU+t*0.2,hx=cx+Math.cos(an)*R,hy=cy+Math.sin(an)*R;ctx.strokeStyle='#50c8be';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(hx,hy);ctx.lineTo(hx-Math.cos(an)*5,hy-Math.sin(an)*5);ctx.stroke();ctx.fillStyle='#50c8be';ctx.beginPath();ctx.arc(hx,hy,2,0,TAU);ctx.fill()}}
        if(step>=2){ctx.fillStyle='#50c8be';for(let i=0;i<Math.round(nM*0.5*Math.min(1,microDmg+0.2));i++){ctx.beginPath();ctx.arc(PX(hash(i+2000)),bot-1-hash(i+2100)*4,1.6,0,TAU);ctx.fill()}}
        if(step<2)for(let i=0;i<4;i++)rbc(ctx,PX((i*0.27+t*0.03)%1),PY(0.4),0.3*i,false,2.4);
        else for(let i=0;i<3;i++)rbc(ctx,PX(0.1+i*0.35),top+4,0,false,1.8);
      }
      const nc=10;for(let i=0;i<nc;i++){const d=clamp(microDmg*1.3-hash(i+3000)*0.6,0,1),cx=mx+i*mw/nc,w=mw/nc;
        ctx.fillStyle=d<0.5?C.endo:d<1?'#b9a3a8':'#6d5b5e';ctx.fillRect(cx+1+d*2,bot+1-d*5,w-2-d*4,9);ctx.fillStyle=C.endoN;ctx.beginPath();ctx.ellipse(cx+w/2,bot+5-d*5,4,1.8,0,0,TAU);ctx.fill()}
      ctx.fillStyle=microDmg>1.05?'rgba(200,40,40,'+clamp(microDmg-1,0,0.6)/0.6+')':'#e8d27a';ctx.fillRect(mx,bot+11,mw,3);
      ctx.restore();ctx.strokeStyle=C.line;ctx.strokeRect(mx,my,mw,mh);
      ctx.fillStyle=C.ink;ctx.font='600 12px '+FONT;ctx.textAlign='left';ctx.fillText('Zoom: endotelio · '+(foam?'espuma':'líquido'),mx+8,my+14);
      pill(ctx,mx+mw,my+mh+14,foam?'Espuma: contacto con la pared y actividad variable al mezclarse':'Molécula libre (turquesa) se diluye; la albúmina la inactiva (gris)','right',C.ink)}
    // línea de tiempo
    const names=['Vena','Punción','Inyección','Daño endotelial','Compresión','Fibrosis'],times=['antes','segundos','segundos','segundos–minutos','horas–días','semanas–meses'];
    const tw=960/6;for(let i=0;i<6;i++){const x=20+i*tw;ctx.fillStyle=i===step?'rgba(147,179,232,.28)':'rgba(22,33,42,.92)';ctx.fillRect(x+2,550,tw-4,42);
      if(i===step){ctx.fillStyle='rgba(147,179,232,.85)';ctx.fillRect(x+2,588,(tw-4)*p,4)}
      ctx.fillStyle=i<=step?C.ink:C.dim;ctx.font='600 13px '+FONT;ctx.textAlign='left';ctx.fillText((i+1)+' · '+names[i],x+10,567);ctx.font='400 11px '+MONO;ctx.fillStyle=C.dim;ctx.fillText(times[i],x+10,582)}
    // textos de fase
    const tt=[
      ['1 · '+T.name+' antes del ejemplo','Relación tisular y calibre convencional; proporciones ampliadas'],
      ['2 · Punción intraluminal: referencia','La posición y la técnica requieren formación y evaluación; no se enseñan desde este dibujo'],
      ['3 · Contacto con el endotelio',foam?'La espuma desplaza parte de la sangre, se mezcla y pierde actividad':'El líquido se mezcla y su actividad cambia al contactar sangre y proteínas'],
      ['4 · Lesión endotelial ilustrada','El efecto depende de múltiples parámetros; no se calcula una ventana terapéutica'],
      ['5 · Cuidado posterior: comparación',comp?'La compresión se representa como apoyo externo, sin asegurar cierre':'El cuidado posterior y la compresión se individualizan'],
      [recanal?'6 · Recanalización: respuesta seleccionada':'6 · Fibrosis: respuesta seleccionada','Resultados posibles, sin tiempo ni probabilidad de éxito calculados']];
    banner(ctx,tt[step][0],tt[step][1],(step===5&&recanal)||(step===4&&!comp)?C.reflux:C.ink);
    if(S.labels){
      pill(ctx,994,surf+6,'Epidermis','right',C.ink);pill(ctx,994,surf+52,'Dermis','right',C.ink);pill(ctx,994,250,'Tejido subcutáneo','right',C.ink);pill(ctx,994,534,'Fascia muscular · músculo','right',C.ink);
      const lx=T.xc+W1*0.55;lbl(ctx,lx+60,y0-Rc(lx+60)+1,lx+90,y0-T.R-T.w-34,'Endotelio','r');
      if(step>=1&&step<=2){const mx=T.xc-dx*dist*0.5,my=y0-dy*dist*0.5;lbl(ctx,mx,my,mx-40,my-30<surf+20?my+40:my-30,'Aguja en la luz venosa','l')}
      if(step===2||step===3)lbl(ctx,T.xc+50,y0,T.xc+110,y0+T.R+T.w+30,foam?'Espuma esclerosante':'Esclerosante líquido','r');
      if(step===3)lbl(ctx,T.xc-40,y0-Rc(T.xc-40),T.xc-90,y0-T.R-T.w-34,'Colágeno subendotelial expuesto','l');
      if(step===4)lbl(ctx,T.xc,y0+Rc(T.xc)-2,T.xc+40,y0+T.R+T.w+34,'Plaquetas y fibrina (esclerotrombo)','r');
      if(step===5&&!recanal)lbl(ctx,T.xc,y0,T.xc+40,y0+T.R+T.w+34,'Cordón fibroso','r');
      if(padOn)lbl(ctx,(x0+x1)/2+60,surf-8,(x0+x1)/2+120,surf-40,'Apósito y vendaje de compresión','r');
      if(extra&&step>=2)lbl(ctx,T.xc-50,y0-T.R-18,T.xc-120,y0-T.R-T.w-50<surf+20?surf+110:y0-T.R-T.w-50,'Extravasación perivenosa','l');
    }
    roN.set('Referencia intraluminal');roR.set('Indicación profesional');roV.set('No calculado');roM.set(conc<.7?'Menor, sin unidades':conc<1.8?'Intermedia, sin unidades':'Mayor, sin unidades');roE.set(foam?'Espuma: desplazamiento y mezcla':'Líquido: mezcla e inactivación');roO.set(recanal?'Recanalización elegida':'Fibrosis elegida');
  }};
}

/* ---------- 10 · Trombosis venosa profunda ---------- */
function dvtSim(api,ui){
  const ctx=api.ctx;let est=0.85,hip=0.6,les=0.6,antic=false,t=0,g=0.02,days=0,emb=null,embN=0,embT=-9,forceEmb=false;
  const lvl=v=>v<0.25?'baja':v<0.6?'moderada':'alta';
  const sE=ui.slider('Estasis (inmovilidad, yeso, insuficiencia cardiaca)',0,1,0.01,est,v=>{est=v},lvl);
  const sH=ui.slider('Hipercoagulabilidad (cáncer, embarazo, estrógenos, trombofilia)',0,1,0.01,hip,v=>{hip=v},lvl);
  const sL=ui.slider('Lesión endotelial (cirugía, trauma, catéter)',0,1,0.01,les,v=>{les=v},lvl);
  ui.buttons([['Posoperatorio de cadera',()=>{sE.set(.9);sH.set(.6);sL.set(.7)}],['Cáncer en quimioterapia',()=>{sE.set(.5);sH.set(.95);sL.set(.4)}],['Embarazo / puerperio',()=>{sE.set(.6);sH.set(.75);sL.set(.2)}],['Viaje largo, persona sana',()=>{sE.set(.6);sH.set(.1);sL.set(0)}]]);
  ui.toggle('Anticoagulación',false,v=>{antic=v});
  ui.buttons([['Simular desprendimiento (embolia)',()=>{forceEmb=true}],['Reiniciar',()=>{g=0.02;days=0;emb=null;embN=0;embT=-9}]]);
  ui.legend([[C.blood,'Eritrocitos'],['#e89a5a','Endotelio activado (P‑selectina, factor tisular)'],['#f5f5f5','Neutrófilos y monocitos'],['#8f6fd0','Plaquetas'],['#5a0d14','Trombo rojo: fibrina y eritrocitos'],['#5cc29a','Plasmina (fibrinólisis)']]);
  const roD=ui.readout('Tiempo de animación'),roR=ui.readout('Escenario ilustrativo'),roT=ui.readout('Trombo del esquema'),roE=ui.readout('Evento representado');
  const y0=215,R=58,xv=430;
  const Rx=x=>R+((x>xv-4&&x<xv+120)?14*Math.sin(Math.PI*(x-xv+4)/124):0);
  const hash=i=>{const s=Math.sin(i*12.9898)*43758.5453;return s-Math.floor(s)};
  const P=[];for(let i=0;i<300;i++)P.push({x:rnd(0,1000),f:rnd(-.9,.9)});
  const spk=[];for(let i=0;i<500;i++)spk.push([hash(i+11),hash(i+57),hash(i+93)]);
  return{draw(dt,S){
    t+=dt;days+=dt*0.6;
    const risk=clamp(Math.max(est,hip,les)*.7+(est+hip+les)/10,0,1);
    if(dt>0){
      if(antic)g=Math.max(Math.min(g,0.22),g-0.012*dt);
      else g=clamp(g+(risk>0.35?0.04*(risk-0.35)*(1+g):-0.004)*dt,0,1);
      if(forceEmb&&g>.06&&!emb){emb={x:0,y:0,r:0,init:true};g-=0.15}
      forceEmb=false;
    }
    const gp=clamp((g-0.2)/0.8,0,1),xA=470,xE=xA+gp*480;
    const thBase=R*(0.25+1.8*clamp((g-0.2)/0.55,0,1));
    const th=x=>{if(g<0.2||x<xA||x>xE)return 0;const u=(x-xA)/Math.max(1,xE-xA);let v=thBase*(1-0.75*u**3);if(u>0.75)v+=4*Math.sin(t*3+x*0.05);return clamp(v,0,2*Rx(x)-3)};
    let occ=0;for(let x=xA;x<=xE;x+=10)occ=Math.max(occ,th(x)/(2*Rx(x)));
    const occluded=occ>0.95;
    if(emb&&emb.init){emb.x=xE-20;emb.y=y0-Rx(xE)+thBase*0.4;emb.r=Math.max(10,thBase*0.45);emb.init=false}
    if(emb&&dt>0){emb.x+=260*dt;emb.y+=(y0-emb.y)*dt*2;if(emb.x>1060){emb=null;embN++;embT=t}}
    // tejido perivenoso y pared
    ctx.fillStyle='#3a2523';ctx.fillRect(0,80,1000,280);
    const band=(sg,o1,o2,fill)=>{ctx.beginPath();for(let x=-10;x<=1010;x+=8)ctx.lineTo(x,y0+sg*(Rx(x)+o1));for(let x=1010;x>=-10;x-=8)ctx.lineTo(x,y0+sg*(Rx(x)+o2));ctx.closePath();ctx.fillStyle=fill;ctx.fill()};
    ctx.beginPath();for(let x=-10;x<=1010;x+=8)ctx.lineTo(x,y0-Rx(x));for(let x=1010;x>=-10;x-=8)ctx.lineTo(x,y0+Rx(x));ctx.closePath();ctx.fillStyle=C.lumen;ctx.fill();
    // hipoxia del seno valvular
    const hyp=est*0.6+0.1;for(const sg of [-1,1]){const gr=ctx.createRadialGradient(xv+60,y0+sg*(R-6),4,xv+60,y0+sg*(R-6),70);gr.addColorStop(0,'rgba(90,110,170,'+(0.55*hyp)+')');gr.addColorStop(1,'rgba(90,110,170,0)');ctx.fillStyle=gr;ctx.fillRect(xv,y0-R-20,130,2*R+40)}
    // flujo
    const pulse=0.75+0.25*Math.sin(t*1.6),base=95*(1-0.78*est)*pulse;
    if(dt>0)for(const p of P){const r=Rx(p.x),lo=-1+(th(p.x)+3)/r;let u=base;
      if(occluded&&p.x<xE)u=p.x<xA-10?base*0.15:0;else{const open=1-th(p.x)/(2*r);u=base/Math.max(0.2,open)}
      const pocket=p.x>xv&&p.x<xv+115&&Math.abs(p.f)>0.62;if(pocket)u*=0.12;
      p.x+=u*dt;if(p.f<lo)p.f=Math.min(0.9,lo+0.02);
      if(p.x>1010){p.x=-10;p.f=rnd(-.9,.9)}}
    for(const p of P){const lo=-1+(th(p.x)+5)/Rx(p.x);if(p.f<lo)continue;rbc(ctx,p.x,y0+p.f*Rx(p.x),0,false,1)}
    drawValve(ctx,xv,y0,1,0,R,0.08,1,95);
    // endotelio, activación
    const act=clamp(est*0.6+les*0.55+hip*0.25,0,1);
    for(let i=0,x=4;x<1000;x+=12,i++)for(const sg of [-1,1]){const inS=x>xv&&x<xv+120,a=inS?act:les*0.35*hash(i+5);
      const c1=[241,205,210],c2=[232,154,90],c=c1.map((v,k)=>Math.round(lerp(v,c2[k],a)));ctx.fillStyle=`rgb(${c})`;ctx.beginPath();ctx.ellipse(x,y0+sg*(Rx(x)-1.5),5,1.6,0,0,TAU);ctx.fill();
      if(inS&&a>0.4&&i%2===0){ctx.strokeStyle='#ffd27a';ctx.lineWidth=1;const yy=y0+sg*(Rx(x)-3);ctx.beginPath();ctx.moveTo(x,yy);ctx.lineTo(x,yy-sg*5);ctx.moveTo(x,yy-sg*5);ctx.lineTo(x-2.5,yy-sg*8);ctx.moveTo(x,yy-sg*5);ctx.lineTo(x+2.5,yy-sg*8);ctx.stroke()}
      if(inS&&a>0.5&&i%3===1){ctx.fillStyle='#5cc29a';ctx.fillRect(x-2,y0+sg*(Rx(x)-4)-2,4,4)}}
    for(const sg of [-1,1]){band(sg,0,3,'rgba(0,0,0,0)');band(sg,3,16,C.media);band(sg,16,30,C.advent)}
    // leucocitos, NETs y plaquetas en el seno
    const nL=Math.round(act*7);for(let k=0;k<nL;k++)for(const sg of [-1,1]){if(sg>0&&k>nL/2)continue;const x=xv+18+k*13,y=y0+sg*(Rx(x)-9);
      if(hip>0.45&&g>0.04){ctx.strokeStyle='rgba(230,230,235,.55)';ctx.lineWidth=0.8;for(let j=0;j<4;j++){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(hash(k*9+j)-0.5)*40,y-sg*(10+hash(k*7+j)*26));ctx.stroke()}}
      ctx.fillStyle='#f5f5f5';ctx.beginPath();ctx.arc(x,y,6,0,TAU);ctx.fill();ctx.fillStyle='#8a5fb0';for(const [a,b] of [[-2,-1.5],[2,-1.5],[0,2]]){ctx.beginPath();ctx.arc(x+a,y+b,1.7,0,TAU);ctx.fill()}}
    ctx.fillStyle='#8f6fd0';for(let k=0;k<Math.round(act*24+g*30);k++){const x=xv+10+hash(k+300)*110,sg=hash(k+340)<0.7?-1:1;ctx.beginPath();ctx.arc(x,y0+sg*(Rx(x)-6-hash(k+380)*10),1.8,0,TAU);ctx.fill()}
    // trombo: nido en el seno y propagación proximal
    const nid=clamp(g/0.2,0,1);
    const thrombusPath=()=>{ctx.beginPath();ctx.moveTo(xv+8,y0-Rx(xv+8));for(let x=xv+8;x<=xv+112;x+=6)ctx.lineTo(x,y0-Rx(x)+Math.min(Rx(x)*0.62,6+nid*Rx(x)*0.6)*Math.sin(Math.PI*(x-xv-8)/104)**0.5);
      if(g>=0.2){for(let x=xA;x<=xE;x+=6)ctx.lineTo(x,y0-Rx(x)+th(x));ctx.lineTo(xE,y0-Rx(xE))}ctx.lineTo(xv+8,y0-Rx(xv+8));ctx.closePath()};
    if(g>0.01){ctx.save();thrombusPath();ctx.fillStyle='#5a0d14';ctx.fill();ctx.clip();
      ctx.strokeStyle='rgba(225,200,205,.5)';ctx.lineWidth=2.4;for(let k=-40;k<120;k++){ctx.beginPath();ctx.moveTo(xv+k*9,y0-R-20);ctx.lineTo(xv+k*9+60,y0+R);ctx.stroke()}
      ctx.fillStyle='rgba(163,33,50,.9)';for(let k=0;k<160;k++){const x=xv+hash(k+700)*(Math.max(120,xE-xv)),y=y0-R+hash(k+760)*2*R;ctx.beginPath();ctx.ellipse(x,y,4,2.4,hash(k)*3,0,TAU);ctx.fill()}
      if(antic){ctx.fillStyle='rgba(235,225,215,.25)';ctx.fillRect(0,0,1000,600)}
      ctx.restore();
      if(antic){ctx.fillStyle='#5cc29a';for(let k=0;k<26;k++){const x=lerp(xv+20,Math.max(xv+110,xE),hash(k+900));const yy=g>=0.2&&x>=xA?y0-Rx(x)+th(x):y0-Rx(x)+20;ctx.beginPath();ctx.arc(x,yy+2+Math.sin(t*3+k)*2,2.2,0,TAU);ctx.fill()}}
      if(g<0.2){ctx.fillStyle='rgba(90,13,20,'+nid+')';ctx.beginPath();ctx.ellipse(xv+60,y0+Rx(xv+60)-10,30*nid,8*nid,0,0,TAU);ctx.fill()}
      else{ctx.fillStyle='#5a0d14';ctx.beginPath();ctx.ellipse(xv+60,y0+Rx(xv+60)-14,40,14,0,0,TAU);ctx.fill()}}
    if(emb){ctx.fillStyle='#5a0d14';ctx.strokeStyle='rgba(225,200,205,.6)';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(emb.x,emb.y,emb.r*1.6,emb.r,0.2,0,TAU);ctx.fill();ctx.stroke();arrow(ctx,emb.x+emb.r*1.8,emb.y,emb.x+emb.r*1.8+50,emb.y,'rgba(232,150,58,.95)',3)}
    pill(ctx,14,y0-Rx(0)-44,'← Distal (pantorrilla)','left');pill(ctx,986,y0-R-44,'Proximal → corazón y pulmón','right');
    // ecografía de compresión
    {const ix=20,iy=372,iw=280,ih=212,cx=ix+120,cy=iy+125;ctx.save();ctx.beginPath();ctx.rect(ix,iy,iw,ih);ctx.clip();ctx.fillStyle='#0c0c0c';ctx.fillRect(ix,iy,iw,ih);
      for(const [a,b,c] of spk){ctx.fillStyle=`rgba(200,200,200,${0.08+c*0.22})`;ctx.fillRect(ix+a*iw,iy+30+b*(ih-30),2,1.5)}
      const ph=(t%4)/4,press=ph<0.4?Math.sin(Math.PI*ph/0.4):0,tg=clamp(g/0.3,0,1);
      ctx.fillStyle='rgba(230,230,230,.75)';ctx.fillRect(ix,iy+34+press*10,iw,3);
      const ry=28*(1-press*0.92*(1-tg));ctx.fillStyle='#050505';ctx.beginPath();ctx.ellipse(cx,cy,36,Math.max(2,ry),0,0,TAU);ctx.fill();
      if(tg>0){ctx.fillStyle=`rgba(150,150,150,${0.45*tg})`;for(let k=0;k<60;k++){const a=hash(k+40)*TAU,r=Math.sqrt(hash(k+80));ctx.fillRect(cx+Math.cos(a)*r*32,cy+Math.sin(a)*r*ry*0.9,2,1.5)}}
      ctx.strokeStyle='rgba(235,235,235,.85)';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(cx,cy,37,Math.max(3,ry+1),0,0,TAU);ctx.stroke();
      const ar=17+1.2*Math.max(0,Math.sin(t*7));ctx.fillStyle='#050505';ctx.beginPath();ctx.arc(cx+70,cy-4,ar,0,TAU);ctx.fill();ctx.lineWidth=3;ctx.stroke();
      ctx.restore();ctx.strokeStyle=C.line;ctx.strokeRect(ix,iy,iw,ih);
      ctx.fillStyle='#9fb0c0';ctx.fillRect(cx-60,iy+4+press*10,150,22);ctx.fillStyle='#0f171e';ctx.font='600 11px '+FONT;ctx.textAlign='center';ctx.fillText('Transductor',cx+15,iy+19+press*10);
      ctx.font='600 13px '+FONT;ctx.fillStyle=C.ink;ctx.fillText('V',cx,cy+5);ctx.fillText('A',cx+70,cy+1);ctx.textAlign='left';
      ctx.fillStyle=C.ink;ctx.font='600 12px '+FONT;ctx.fillText('Ecografía de compresión (corte transversal)',ix+8,iy+ih-26);
      ctx.fillStyle=tg>0.4?C.reflux:C.ok;ctx.fillText(tg>0.4?'No compresible: hallazgo del ejemplo':'Compresible: un punto del estudio',ix+8,iy+ih-9)}
    // tríada de Virchow
    {const vx=[[455,400],[335,565],[575,565]],cg=[455,510],vals=[est,hip,les],names=['Estasis','Hipercoagulabilidad','Lesión endotelial'];
      ctx.fillStyle='rgba(22,33,42,.92)';ctx.strokeStyle=C.line;ctx.fillRect(312,372,288,212);ctx.strokeRect(312,372,288,212);
      ctx.strokeStyle='rgba(159,176,192,.6)';ctx.lineWidth=1;ctx.beginPath();vx.forEach(v=>ctx.lineTo(v[0],v[1]));ctx.closePath();ctx.stroke();
      ctx.fillStyle=`rgba(232,150,58,${0.25+risk*0.5})`;ctx.beginPath();vx.forEach((v,i)=>ctx.lineTo(cg[0]+(v[0]-cg[0])*vals[i],cg[1]+(v[1]-cg[1])*vals[i]));ctx.closePath();ctx.fill();
      ctx.font='600 12px '+FONT;ctx.fillStyle=C.ink;ctx.textAlign='center';ctx.fillText(names[0],vx[0][0],vx[0][1]-8+18*0);ctx.fillText(names[1],vx[1][0]+40,vx[1][1]+14);ctx.fillText(names[2],vx[2][0]-40,vx[2][1]+14);
      ctx.font='600 13px '+MONO;ctx.fillText('sin probabilidad calculada',cg[0],cg[1]+5);ctx.textAlign='left';ctx.font='600 12px '+FONT;ctx.fillText('Tríada de Virchow',322,390)}
    // clínica y diagnóstico
    {const x=612,y=372;ctx.fillStyle='rgba(22,33,42,.92)';ctx.strokeStyle=C.line;ctx.fillRect(x,y,370,212);ctx.strokeRect(x,y,370,212);
      const stage=g<0.06?'sin trombo':g<0.2?'nido en el seno valvular':occluded?'oclusivo':g<0.6?'propagación proximal':'extenso con cola flotante';
      const lines=[['Trombo',stage],['Luz del dibujo',occ>.55?'Mayor ocupación':'Menor ocupación'],['Dímero D','No se calcula'],['Ecografía',g>0.12?'no compresible':'compresible'],
        ['Clínica','No se deduce del dibujo'],['Embolia','Sin estimación de riesgo'],['Émbolos liberados',String(embN)]];
      ctx.font='600 12px '+FONT;ctx.fillStyle=C.ink;ctx.fillText('Clínica y diagnóstico (ilustrativo)',x+10,y+18);
      lines.forEach(([a,b],i)=>{ctx.font='400 12.5px '+FONT;ctx.fillStyle=C.dim;ctx.fillText(a,x+10,y+44+i*24);ctx.font='500 12.5px '+FONT;ctx.fillStyle=(i===5&&g>0.6&&!antic)||(i===6&&embN>0)?C.reflux:C.ink;ctx.fillText(b,x+140,y+44+i*24)})}
    const stageT=g<0.06?['1 · Estasis en el seno valvular','Flujo lento, hipoxia del seno y activación endotelial: un posible lugar de inicio']:g<0.2?['2 · Nido trombótico en el seno','Neutrófilos, monocitos (factor tisular), NETs y plaquetas inician la coagulación']:g<0.6?['3 · Propagación proximal','Trombo rojo de fibrina y eritrocitos con líneas de Zahn; crece hacia el corazón']:['4 · Trombo extenso con cola flotante','La cola no adherida puede desprenderse y causar embolia pulmonar'];
    if(t-embT<3.5)banner(ctx,'Embolia pulmonar: un fragmento viaja al pulmón','Por la vena cava y las cavidades derechas hasta las arterias pulmonares',C.reflux);
    else if(antic)banner(ctx,'Anticoagulación: menor tendencia a extensión','Reduce el riesgo, no lo elimina; no disuelve directamente el trombo',C.ok);
    else banner(ctx,stageT[0],stageT[1]);
    if(S.labels){
      lbl(ctx,xv,y0-R+4,xv-50,y0-R-44,'Válvula','l');lbl(ctx,xv+70,y0+R+6,xv+130,y0+R+48,'Seno valvular: hipoxia','r');
      lbl(ctx,xv+30,y0-Rx(xv+30)+2,xv+100,y0-R-56,'Endotelio activado','r');
      if(g>0.25){const lx=xA+(xE-xA)*0.35;lbl(ctx,lx,y0-Rx(lx)+th(lx)*0.5,lx+80,y0+R+46,'Trombo rojo y líneas de Zahn','r')}
      if(g>0.6&&!emb){lbl(ctx,xE-10,y0-Rx(xE)+th(xE-10),Math.min(960,xE+10),y0+R+20,'Cola flotante','l')}
      if(nL>0)lbl(ctx,xv+24,y0-Rx(xv+24)+9,250,y0-R-24,'Neutrófilos y NETs','l');
    }
    roD.set(t.toFixed(0)+' s de animación');roR.set(lvl(risk)+' · sin escala clínica');roT.set(g>.6?'Más extendido':g>.2?'Propagación ilustrada':'Focal en este esquema');roE.set(emb?'desprendimiento representado':embN?'evento previo representado':'sin evento representado');
  }};
}

/* ---------- 11 · Síndrome postrombótico ---------- */
function ptsSim(api,ui){
  const ctx=api.ctx;let m=0,auto=true,rec=0.6,trap=true,ilio=false,comp=false,t=0;
  const sT=ui.slider('Etapa didáctica tras TVP',0,24,0.1,0,v=>{m=v},v=>v<1?'Inicio del ejemplo':v<6?'Organización ilustrada':'Recanalización ilustrada');
  ui.buttons([['Pausar evolución',()=>{auto=false}],['Reproducir evolución',()=>{auto=true}],['Volver al inicio',()=>{sT.set(0)}]]);
  ui.slider('Grado de recanalización',0,1,0.01,rec,v=>{rec=v},v=>v<0.3?'escasa: obstrucción residual':v<0.75?'parcial, con sinequias':'casi completa');
  ui.toggle('Representar daño valvular residual',true,v=>{trap=v});
  ui.toggle('TVP iliofemoral extensa',false,v=>{ilio=v});
  ui.toggle('Compresión elástica y ejercicio',false,v=>{comp=v});
  ui.legend([['#5a0d14','Trombo agudo'],['#c9b29a','Trombo organizado (tejido fibroso)'],[C.blood,'Flujo anterógrado'],[C.reflux,'Reflujo por válvula destruida'],['#7a4a25','Hemosiderina en la piel']]);
  const roF=ui.readout('Fase'),roR=ui.readout('Reflujo'),roO=ui.readout('Obstrucción'),roP=ui.readout('Presión venosa'),roV=ui.readout('Villalta'),roC=ui.readout('Alcance');
  const y0=215,R=56,xa=150,xb=850,xv=380;
  const hash=i=>{const s=Math.sin(i*12.9898)*43758.5453;return s-Math.floor(s)};
  const lanes=[-0.52,0,0.52];const P=[];for(let i=0;i<220;i++)P.push({x:rnd(0,1000),k:i%3,j:rnd(-1,1)});
  const CP=[];for(let i=0;i<40;i++)CP.push(Math.random());
  const SYM=['Dolor','Calambres','Pesadez','Parestesias','Prurito'],SIG=['Edema','Induración cutánea','Hiperpigmentación','Enrojecimiento','Ectasia venosa','Dolor a la compresión de pantorrilla'];
  const offS=[0.3,0.6,0.15,0.9,1.0],offG=[0,0.7,0.45,0.6,0.35,0.5];
  return{draw(dt,S){
    t+=dt;if(auto&&dt>0&&m<24)sT.set(Math.min(24,m+dt*1.1));
    const org=smooth(clamp((m-0.5)/5,0,1)),rc=rec*smooth(clamp((m-1.5)/12,0,1));
    const reflux=(trap?1:0.15)*rc,coll=(1-rc)*smooth(clamp(m/10,0,1));
    const obs=clamp((1-rc)*(ilio?1:0.85)-0.25*coll,0,1);
    const VH=clamp(0.6*reflux+0.55*obs*(ilio?1.4:1),0,1.3);
    const Sv=VH*smooth(clamp((m-2)/16,0,1))*(comp?0.72:1);
    const sym=offS.map(o=>Math.round(clamp(Sv*3-o,0,3))),sig=offG.map(o=>Math.round(clamp(Sv*3.1-o,0,3))),ulcer=Sv>1.0;
    const score=sym.reduce((a,b)=>a+b,0)+sig.reduce((a,b)=>a+b,0),evalOK=m>=3;
    const cat=ulcer?'grave (úlcera)':score<5?'sin SPT':score<10?'leve':score<15?'moderado':'grave';
    // pared, tejido y colaterales
    ctx.fillStyle='#3a2523';ctx.fillRect(0,80,1000,250);
    const cw=(1-rc)>0.25?clamp(coll*(ilio?14:10),0,14):0;
    if(cw>1){ctx.lineCap='round';ctx.strokeStyle=C.veinWall;ctx.lineWidth=cw*2+5;const cpath=()=>{ctx.beginPath();for(let x=60;x<=940;x+=10)ctx.lineTo(x,y0-R-40-Math.sin((x-60)/880*Math.PI)*24+Math.sin(x*0.05)*6)};cpath();ctx.stroke();ctx.strokeStyle=C.lumen;ctx.lineWidth=cw*2;cpath();ctx.stroke();
      for(let i=0;i<CP.length;i++){CP[i]=(CP[i]+dt*0.12)%1;const x=60+CP[i]*880;rbc(ctx,x,y0-R-40-Math.sin((x-60)/880*Math.PI)*24+Math.sin(x*0.05)*6,0,false,0.7)}}
    const wt=14+10*org;
    for(const sg of [-1,1]){ctx.fillStyle=C.media;ctx.fillRect(0,sg<0?y0-R-wt:y0+R,1000,wt);ctx.fillStyle=C.advent;ctx.fillRect(0,sg<0?y0-R-wt-12:y0+R+wt,1000,12);
      if(org>0.05){ctx.fillStyle=`rgba(220,205,180,${0.55*org})`;ctx.fillRect(xa,sg<0?y0-R-wt:y0+R,xb-xa,wt);ctx.strokeStyle=`rgba(160,140,110,${0.7*org})`;ctx.lineWidth=1;for(let x=xa;x<xb;x+=9){ctx.beginPath();ctx.moveTo(x,sg<0?y0-R-wt+3:y0+R+3);ctx.lineTo(x+7,sg<0?y0-R-3:y0+R+wt-3);ctx.stroke()}}}
    if(m<2){ctx.fillStyle=`rgba(225,70,60,${0.3*(1-m/2)})`;ctx.fillRect(xa,y0-R-wt-26,xb-xa,14);ctx.fillRect(xa,y0+R+wt+12,xb-xa,14)}
    ctx.fillStyle=C.lumen;ctx.fillRect(0,y0-R,1000,2*R);
    // trombo que se organiza y se recanaliza
    const tc=[[90,13,20],[201,178,154]].reduce((a,b)=>a.map((v,k)=>Math.round(lerp(v,b[k],org))));
    ctx.save();ctx.beginPath();ctx.rect(xa,y0-R,xb-xa,2*R);ctx.clip();
    ctx.fillStyle=`rgb(${tc})`;ctx.beginPath();ctx.moveTo(xa,y0-R);ctx.quadraticCurveTo(xa-30,y0,xa,y0+R);ctx.lineTo(xb,y0+R);ctx.quadraticCurveTo(xb+30,y0,xb,y0-R);ctx.closePath();ctx.fill();
    if(org>0.1&&org<1.01){ctx.strokeStyle=`rgba(200,40,50,${0.7*Math.sin(Math.PI*clamp(org*1.1,0,1))})`;ctx.lineWidth=1.2;for(let k=0;k<40;k++){const x=xa+hash(k+3)*(xb-xa),sg=hash(k+9)<0.5?-1:1;ctx.beginPath();ctx.moveTo(x,y0+sg*R);ctx.quadraticCurveTo(x+12,y0+sg*R*(0.5),x+(hash(k+15)-0.5)*30,y0+sg*R*(0.9-org*0.8));ctx.stroke()}
      ctx.fillStyle=`rgba(150,110,80,${org})`;for(let k=0;k<70;k++){ctx.beginPath();ctx.ellipse(xa+hash(k+30)*(xb-xa),y0-R+hash(k+60)*2*R,5,1.4,hash(k+90)*3,0,TAU);ctx.fill()}}
    const hw=R*(0.06+0.26*rc)+(m<0.5?0:R*0.04);
    ctx.lineCap='round';ctx.strokeStyle=C.lumen;ctx.lineWidth=2*hw;
    lanes.forEach((f,k)=>{ctx.beginPath();for(let x=xa-20;x<=xb+20;x+=8)ctx.lineTo(x,y0+(f*(1-0.25*rc)+0.12*Math.sin(x*0.02+k*2))*R);ctx.stroke()});
    ctx.restore();
    // válvula
    if(trap){const th=4+6*org;ctx.fillStyle=org>0.3?'#d9c6aa':C.valve;for(const sg of [-1,1]){ctx.beginPath();ctx.ellipse(xv+18,y0+sg*(R-th*0.8),26-8*org,th,0,0,TAU);ctx.fill()}}
    else{const ph=(t%3)/3;drawValve(ctx,xv,y0,1,0,R,ph<0.5?0.1:1,1,70)}
    // eritrocitos por los canales
    const ph=(t%3)/3,sys=ph<0.5,U=sys?Math.sin(Math.PI*ph/0.5)*(0.45+0.55*rc+0.3*coll):(reflux>0.2?-reflux*0.8:0.05);
    if(dt>0)for(const p of P){const inSeg=p.x>xa-20&&p.x<xb+20;let v=U*170;if(inSeg&&v>0)v*=Math.min(2,R*0.35/Math.max(6,hw));p.x+=v*dt;if(p.x>1010)p.x=-10;if(p.x<-10)p.x=1010}
    for(const p of P){const inSeg=p.x>xa-10&&p.x<xb+10;const f=lanes[p.k];let y;
      if(inSeg){if(hw<5)continue;y=y0+(f*(1-0.25*rc)+0.12*Math.sin(p.x*0.02+p.k*2))*R+p.j*hw*0.6}else y=y0+(f*1.4+p.j*0.25)*R*0.6;
      rbc(ctx,p.x,y,0,U<-0.05,inSeg?Math.min(.9,hw*.07):.9)}
    pill(ctx,14,y0-R-wt-28,'← Distal','left');pill(ctx,986,y0-R-wt-28,'Proximal →','right');
    // pierna
    {const lx=20,ly=345,lw=300,lh=240;ctx.fillStyle='rgba(22,33,42,.92)';ctx.strokeStyle=C.line;ctx.fillRect(lx,ly,lw,lh);ctx.strokeRect(lx,ly,lw,lh);
      const ed=sig[0]*7,ind=sig[1]/3,cx=lx+150;
      const wAt=y=>{const u=(y-ly-10)/(lh-70);let w=lerp(70,32,smooth(clamp(u,0,1)));w+=ed*smooth(clamp((u-0.45)/0.4,0,1));if(ind>0.5)w-=ind*8*smooth(clamp((u-0.6)/0.3,0,1));return w};
      ctx.beginPath();for(let y=ly+10;y<=ly+lh-60;y+=4)ctx.lineTo(cx-wAt(y),y);ctx.lineTo(cx-34-ed*0.5,ly+lh-30);ctx.lineTo(cx+80,ly+lh-14);ctx.lineTo(cx+86,ly+lh-36);ctx.lineTo(cx+wAt(ly+lh-60),ly+lh-60);for(let y=ly+lh-60;y>=ly+10;y-=4)ctx.lineTo(cx+wAt(y),y);ctx.closePath();
      ctx.fillStyle='#d9a58c';ctx.fill();ctx.save();ctx.clip();
      const hp=sig[2]/3;if(hp>0){const gr=ctx.createRadialGradient(cx-10,ly+lh-80,5,cx-10,ly+lh-80,70);gr.addColorStop(0,`rgba(110,65,35,${0.85*hp})`);gr.addColorStop(1,'rgba(110,65,35,0)');ctx.fillStyle=gr;ctx.fillRect(lx,ly,lw,lh)}
      if(sig[3]>0){ctx.fillStyle=`rgba(200,60,60,${0.12*sig[3]})`;ctx.fillRect(lx,ly+lh*0.55,lw,lh*0.3)}
      if(sig[4]>0){ctx.strokeStyle='#5a4fa0';ctx.lineWidth=1.3;for(let k=0;k<sig[4]*6;k++){const x=cx-40+hash(k+20)*80,y=ly+lh-62+hash(k+40)*14;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+6,y-6);ctx.lineTo(x+11,y-2);ctx.stroke()}}
      if(sig[0]>0&&evalOK){ctx.strokeStyle='rgba(255,255,255,.35)';ctx.setLineDash([3,3]);ctx.beginPath();for(let y=ly+lh*0.5;y<=ly+lh-60;y+=4)ctx.lineTo(cx-lerp(70,32,smooth(clamp((y-ly-10)/(lh-70),0,1))),y);ctx.stroke();ctx.setLineDash([])}
      if(ulcer){ctx.fillStyle='#b5463a';ctx.beginPath();ctx.ellipse(cx-18,ly+lh-88,16,11,0.2,0,TAU);ctx.fill();ctx.fillStyle='#e6c86a';ctx.beginPath();ctx.ellipse(cx-18,ly+lh-88,8,5,0.2,0,TAU);ctx.fill()}
      ctx.restore();ctx.fillStyle=C.ink;ctx.font='600 12px '+FONT;ctx.textAlign='left';ctx.fillText('Pierna (cara medial)',lx+8,ly+16);
      if(S.labels){ctx.font='400 11px '+FONT;ctx.fillStyle=C.dim;const notes=[];if(sig[0])notes.push('edema');if(sig[2])notes.push('pigmento');if(sig[1]>1)notes.push('lipodermatoesclerosis');if(sig[4])notes.push('corona flebectásica');if(ulcer)notes.push('úlcera');ctx.fillText(notes.join(' · ')||'sin signos cutáneos',lx+8,ly+lh-6)}}
    // Villalta requires an interview and examination, not inferred scene values.
    {const x=335,y=345,w=645;ctx.fillStyle='rgba(22,33,42,.92)';ctx.fillRect(x,y,w,240);ctx.strokeStyle=C.line;ctx.strokeRect(x,y,w,240);
      ctx.fillStyle=C.ink;ctx.font='600 14px '+FONT;ctx.textAlign='left';ctx.fillText('Villalta: requiere síntomas y exploración',x+14,y+25);
      ctx.fillStyle=C.dim;ctx.font='400 12px '+FONT;ctx.fillText('Cinco síntomas',x+14,y+53);ctx.fillText('Seis signos',x+320,y+53);
      ctx.fillStyle=C.ink;SYM.forEach((n,i)=>ctx.fillText(n,x+14,y+78+i*22));SIG.forEach((n,i)=>ctx.fillText(n,x+320,y+78+i*22));
      ctx.fillStyle=C.dim;ctx.fillText('La escena no asigna intensidad, puntuación ni diagnóstico.',x+14,y+221)}
    const phase=m<1?['Fase aguda: trombo oclusivo e inflamación de la pared','El trombo rojo obstruye la luz; la pared se inflama (flebitis)']:m<6?['Organización del trombo: ejemplo de tejido fibroso','Fibroblastos y neovasos invaden el trombo; la válvula queda atrapada']:['Recanalización: canales y posibles secuelas',rc<0.3?'Recanalización escasa: obstrucción residual y circulación colateral':(trap?'La luz reabre, pero la válvula engrosada no cierra: reflujo':'La válvula respetada mantiene la competencia')];
    banner(ctx,phase[0],phase[1],(!sys&&reflux>0.2&&m>=6)?C.reflux:C.ink);
    if(S.labels){
      if(m<6)lbl(ctx,560,y0+10,600,y0+R+wt+40,m<1?'Trombo rojo agudo':'Trombo en organización (fibroblastos, neovasos)','r');
      else{lbl(ctx,640,y0+(0.52*(1-0.25*rc)+0.12*Math.sin(640*0.02+4))*R,680,y0+R+wt+40,'Canales de recanalización','r');lbl(ctx,520,y0+0.27*R,470,y0+R+wt+40,'Sinequias (trabéculas fibrosas)','l')}
      lbl(ctx,xv+18,y0-R+6,xv-30,y0-R-wt-46,trap?'Válvula engrosada y adherida':'Válvula respetada','l');
      lbl(ctx,800,y0-R-wt/2,830,y0-R-wt-46,'Pared engrosada y fibrosa','r');
      if(cw>1)lbl(ctx,500,y0-R-64,560,y0-R-82,'Circulación colateral','r');
    }
    roF.set(m<1?'aguda':m<6?'organización':'recanalización / crónica');roR.set(reflux>.2?'Representado':'Menor en este ejemplo');roO.set(obs>.5?'Mayor en este ejemplo':'Menor en este ejemplo');
    roP.set('No calculada');roV.set('Requiere valoración clínica');roC.set('Comparación sin pronóstico');
  }};
}

/* ---------- 3D comunes ---------- */
function make3D(el){
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,innerWidth<700?1.6:2));renderer.setClearColor(0x0d1e28,0);renderer.outputEncoding=THREE.LinearEncoding;renderer.toneMapping=THREE.NoToneMapping;
  const canvas=renderer.domElement;canvas.setAttribute('aria-label','Modelo anatómico 3D. Arrastra para girar o selecciona una estructura.');el.appendChild(canvas);
  const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(38,1,0.1,120),ctrl=new THREE.OrbitControls(cam,canvas);ctrl.enableDamping=true;ctrl.dampingFactor=.075;ctrl.minDistance=2.8;ctrl.maxDistance=24;ctrl.enablePan=true;
  scene.add(new THREE.HemisphereLight(0xe8f5ff,0x291a21,.8));const key=new THREE.DirectionalLight(0xffeedf,1.0);key.position.set(-3,5,7);scene.add(key);const rim=new THREE.DirectionalLight(0x90bfd4,.6);rim.position.set(5,1,-4);scene.add(rim);
  const tags=document.createElement('div');tags.className='model-labels';el.appendChild(tags);
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('label-lines');el.appendChild(svg);
  const hint=document.createElement('div');hint.className='hint3d';hint.textContent='Arrastra para girar · pellizca para acercar · toca para reconocer';el.appendChild(hint);
  const list=[],entries=[],parts=new Map();let selected=null,isolated=false,cameraTarget=null,restoreView=null,beforeSelect=null,lastRender=0,alive=true,frameCount=0,measureStart=performance.now();
  const size=()=>{const w=el.clientWidth,h=el.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);canvas.style.width='100%';canvas.style.height='100%';cam.aspect=w/h;cam.updateProjectionMatrix();svg.setAttribute('viewBox',`0 0 ${w} ${h}`)};
  const ro=new ResizeObserver(size);ro.observe(el);size();
  function register(mesh,id,name,manageOpacity=false){
    if(!parts.has(id))parts.set(id,{id,name:name||COURSE.structures[id]?.name||id});
    mesh.traverse(o=>{if(!o.isMesh)return;o.userData.partId=id;if(!entries.some(x=>x.mesh===o))entries.push({mesh:o,id,opacity:o.material.opacity,emissive:o.material.emissive?.clone(),manageOpacity})});return mesh;
  }
  function select(id){if(beforeSelect)beforeSelect(id);selected=parts.has(id)?id:null;for(const entry of entries)if(entry.mesh.material.emissive)entry.mesh.material.emissive.copy(entry.emissive);if(isolated&&selected)fitSelection();el.dispatchEvent(new CustomEvent('flebo:part',{bubbles:true,detail:{id:selected,parts:[...parts.values()]}}));}
  function fitSelection(){scene.updateMatrixWorld(true);const box=new THREE.Box3();for(const entry of entries)if(entry.id===selected)box.union(new THREE.Box3().setFromObject(entry.mesh));if(box.isEmpty())return;const center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3()),distance=(Math.max(size.y,size.x/Math.max(.5,cam.aspect))/(2*Math.tan(cam.fov*Math.PI/360))+size.z*.5)*1.25,direction=cam.position.clone().sub(ctrl.target).normalize();moveTo(center.clone().addScaledVector(direction,Math.max(3.5,distance)).toArray(),center.toArray())}
  function isolate(value){if(value&&!isolated){restoreView={p:cam.position.toArray(),t:ctrl.target.toArray()}}isolated=!!value;if(isolated&&selected)fitSelection();else if(restoreView){moveTo(restoreView.p,restoreView.t);restoreView=null}}
  function factor(id){return isolated&&selected&&id!==selected?0.12:1}
  function moveTo(position,target){cameraTarget={p:new THREE.Vector3(...position),t:new THREE.Vector3(...target)}}
  ctrl.addEventListener('start',()=>{cameraTarget=null});
  function inferPart(text){const s=text.toLowerCase();return /endotelio/.test(s)?'endotelio':/íntima/.test(s)?'intima':/media:|músculo liso/.test(s)?'media':/adventicia|colágeno/.test(s)?'adventicia':/valva|válvula/.test(s)?'valvas':/safena mayor/.test(s)?'safena':/comunicante/.test(s)?'comunicante':/perforante/.test(s)?'perforante':/fascia muscular/.test(s)?'fascia-muscular':/fascia safena|canal safeno/.test(s)?'fascia-safena':/epidermis|dermis|piel/.test(s)?'piel':/subcutáneo|tributaria|reticulares/.test(s)?'tejido':/vena profunda|vena femoral|n1/.test(s)?'profunda':/nervio safeno/.test(s)?'nervio':/arteria/.test(s)?'arteria':/músculo/.test(s)?'musculo':/vena superficial/.test(s)?'superficial':null}
  function tag(text,getPos,partId,isVisible){const id=partId||inferPart(text),d=document.createElement('div');d.className='tag3d';d.innerHTML='<i></i><span></span>';d.lastChild.textContent=text;d.title=text;
    if(id){d.tabIndex=0;d.setAttribute('role','button');d.setAttribute('aria-label','Reconocer '+text);d.onclick=()=>select(id);d.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(id)}}}
    tags.appendChild(d);const line=document.createElementNS('http://www.w3.org/2000/svg','line');line.setAttribute('stroke','#93b7c7');line.setAttribute('stroke-opacity','.5');svg.appendChild(line);list.push({d,line,getPos,id,text,isVisible});return d;
  }
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let down=null;
  const onDown=e=>{down={x:e.clientX,y:e.clientY}};
  const onUp=e=>{if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>6){down=null;return}down=null;const rect=canvas.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,cam);
    const visible=entries.filter(x=>{let o=x.mesh;while(o){if(!o.visible)return false;o=o.parent}return !x.mesh.userData.pickThrough&&x.mesh.material.opacity>.04}).map(x=>x.mesh);
    const hit=raycaster.intersectObjects(visible,false)[0];if(hit)select(hit.object.userData.partId);
  };canvas.addEventListener('pointerdown',onDown);canvas.addEventListener('pointerup',onUp);
  const v=new THREE.Vector3(),world=new THREE.Vector3();
  function render(S){if(!alive)return;const now=performance.now(),dt=Math.min(.05,(now-(lastRender||now))/1000);lastRender=now;
    if(cameraTarget&&ctrl.enabled){const alpha=1-Math.exp(-5*dt);cam.position.lerp(cameraTarget.p,alpha);ctrl.target.lerp(cameraTarget.t,alpha);if(cam.position.distanceTo(cameraTarget.p)<.005)cameraTarget=null}
    for(const entry of entries){const material=entry.mesh.material,active=selected===entry.id;if(material.emissive&&selected){material.emissive.copy(entry.emissive);if(active)material.emissive.setHex(0x153948)}if(entry.manageOpacity){const opacity=entry.opacity*factor(entry.id);material.opacity=opacity;material.transparent=opacity<1;material.depthWrite=opacity>.96}}
    ctrl.update();renderer.render(scene,cam);frameCount++;if(now-measureStart>1000){canvas.dataset.fps=(frameCount*1000/(now-measureStart)).toFixed(1);canvas.dataset.drawCalls=renderer.info.render.calls;frameCount=0;measureStart=now}canvas.dataset.rendered='true';
    const w=el.clientWidth,h=el.clientHeight,limit=w<520?(AUD==='medico'?4:2):(AUD==='medico'?7:4),occupied=[],hostBounds=el.getBoundingClientRect();let shown=0;
    for(const panel of el.querySelectorAll('.scene-caption,.diagnostic-panel')){const r=panel.getBoundingClientRect();occupied.push({x:r.left-hostBounds.left,y:r.top-hostBounds.top,w:r.width,h:r.height})}
    const ordered=[...list].sort((a,b)=>(b.id===selected?1:0)-(a.id===selected?1:0));
    for(const t of ordered){t.getPos(world);v.copy(world).project(cam);const active=selected&&t.id===selected,visible=(!t.isVisible||t.isVisible())&&(S.labels||active)&&(!isolated||active)&&v.z<1&&v.z>-1&&Math.abs(v.x)<1.05&&Math.abs(v.y)<1.05&&shown<limit;
      t.d.hidden=!visible;t.line.style.display=visible?'':'none';if(!visible)continue;
      t.d.classList.toggle('is-active',!!active);const px=(v.x+1)/2*w,py=(1-v.y)/2*h,bw=t.d.offsetWidth,bh=t.d.offsetHeight||28;
      const dx=px>w*.6?-bw-22:22,ys=[py-bh/2,py-bh-35,py+28,py-bh-70,py+65];let chosen=null;
      for(const yy of ys){const x=clamp(px+dx,12,Math.max(12,w-bw-12)),y=clamp(yy,48,Math.max(48,h-bh-38));const rect={x,y,w:bw,h:bh};if(!occupied.some(a=>x<a.x+a.w+7&&x+bw+7>a.x&&y<a.y+a.h+7&&y+bh+7>a.y)){chosen=rect;break}}
      if(!chosen){t.d.hidden=true;t.line.style.display='none';continue}occupied.push(chosen);shown++;t.d.style.transform=`translate(${chosen.x}px,${chosen.y}px)`;t.line.setAttribute('x1',px);t.line.setAttribute('y1',py);t.line.setAttribute('x2',chosen.x+(dx<0?bw:0));t.line.setAttribute('y2',chosen.y+bh/2);
    }
  }
  function destroy(){alive=false;ro.disconnect();canvas.removeEventListener('pointerdown',onDown);canvas.removeEventListener('pointerup',onUp);ctrl.dispose();const geometries=new Set(),materials=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m))});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer.dispose();renderer.forceContextLoss?.();entries.length=0;parts.clear()}
  return{renderer,scene,cam,ctrl,tag,render,destroy,register,select,isolate,factor,moveTo,setBeforeSelect:fn=>{beforeSelect=fn},get parts(){return[...parts.values()]},get selected(){return selected},get isolated(){return isolated}};
}

function rbcGeometry(radius=.06){const profile=[];for(let side=1;side>=-1;side-=2){for(let k=0;k<=12;k++){const r=side===1?k/12:1-k/12;profile.push(new THREE.Vector2(Math.max(.001,r),side*Math.sqrt(Math.max(0,1-r*r))*(.1035+1.0015*r*r-.5615*r**4)))}}const geometry=new THREE.LatheGeometry(profile,16);geometry.scale(radius,radius,radius);return geometry}

function curvedCuspGeometry(side){
  const geometry=new THREE.PlaneGeometry(1,1,16,8);geometry.userData.cuspSide=side;updateCurvedCusp(geometry,0,.02);return geometry;
}
function updateCurvedCusp(geometry,closure,gap){
  const p=geometry.attributes.position,uv=geometry.attributes.uv,side=geometry.userData.cuspSide;
  for(let i=0;i<p.count;i++){const theta=(uv.getX(i)-.5)*Math.PI,t=uv.getY(i),c=Math.cos(theta),root=.98*c,edge=lerp(.9,gap,closure)*c;
    const baseZ=.9*(1-c),freeZ=.9+.45*c;
    p.setXYZ(i,side*lerp(root,edge,smooth(t)),.98*Math.sin(theta),lerp(baseZ,freeZ,t));}
  p.needsUpdate=true;geometry.computeVertexNormals();geometry.computeBoundingSphere();if(geometry.boundingBox)geometry.computeBoundingBox();
}

function updateTubeMesh(mesh,curve,segments,radialSegments,radius,material,parent){
  const geometry=mesh?mesh.geometry:new THREE.TubeGeometry(curve,segments,1,radialSegments,false),frames=curve.computeFrenetFrames(segments,false),positions=geometry.attributes.position,center=new THREE.Vector3();
  for(let i=0;i<=segments;i++){curve.getPointAt(i/segments,center);const n=frames.normals[i],b=frames.binormals[i],r=typeof radius==='function'?radius(i/segments):radius;
    for(let j=0;j<=radialSegments;j++){const angle=j/radialSegments*TAU,cs=-Math.cos(angle),sn=Math.sin(angle),index=i*(radialSegments+1)+j;positions.setXYZ(index,center.x+r*(cs*n.x+sn*b.x),center.y+r*(cs*n.y+sn*b.y),center.z+r*(cs*n.z+sn*b.z))}}
  positions.needsUpdate=true;geometry.computeVertexNormals();geometry.computeBoundingSphere();if(geometry.boundingBox)geometry.computeBoundingBox();geometry.normals=frames.normals;geometry.binormals=frames.binormals;
  if(!mesh){mesh=new THREE.Mesh(geometry,material);parent.add(mesh)}return mesh;
}

/* ---------- 6 · Pared venosa y válvula en 3D ---------- */
function wall3D(el,ui){
  const E=make3D(el),{scene,cam,ctrl}=E;let inc=false,showBlood=true,t=0,c=0,separation=0,targetSeparation=0;
  const home=()=>{cam.position.set(-2.0,2.5,8.4);ctrl.target.set(0,.15,0);ctrl.update()};home();
  const explode=ui.slider('Separación de capas',0,1,.01,0,v=>{targetSeparation=v;E.moveTo([-2-v*2.5,2.5+v*5,8.4+v*11],[0,.15+v*4.5,0])},v=>v<.05?'Capas unidas':v<.65?'Separación parcial':'Capas separadas');
  ui.toggle('Válvula incompetente',false,v=>{inc=v});ui.toggle('Mostrar eritrocitos',true,v=>{showBlood=v;rb.visible=v});ui.buttons([['Restablecer vista',home]]);
  ui.legend([[C.endo,'Endotelio'],[C.intima,'Íntima / lámina elástica interna'],[C.media,'Media (músculo liso)'],[C.advent,'Adventicia (colágeno)'],[C.valve,'Valvas']]);
  const roF=ui.readout('Fase');
  const a0=200*Math.PI/180,a1=430*Math.PI/180;
  function shell(rin,rout,x0,x1,color,rough){const s=new THREE.Shape();s.absarc(0,0,rout,a0,a1,false);s.absarc(0,0,rin,a1,a0,true);
    const g=new THREE.ExtrudeGeometry(s,{depth:x1-x0,bevelEnabled:false,curveSegments:80});g.rotateY(Math.PI/2);g.translate(x0,0,0);
    const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color,roughness:rough,metalness:0,side:THREE.DoubleSide}));scene.add(m);return m}
  const layers=[shell(1,1.035,-3.2,3.2,0xeabdc8,.45),shell(1.035,1.08,-2.7,3.2,0xcd8d9f,.6),shell(1.08,1.3,-2.1,3.2,0xa24443,.72),shell(1.3,1.62,-1.4,3.2,0xc59f72,.9)];
  ['endotelio','intima','media','adventicia'].forEach((id,i)=>E.register(layers[i],id,COURSE.structures[id].name,true));
  const wp=(x,r,deg)=>{const f=deg*Math.PI/180;return new THREE.Vector3(x,Math.sin(f)*r,-Math.cos(f)*r)};
  const tube=(pts,r,col)=>{const m=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),80,r,8,false),new THREE.MeshStandardMaterial({color:col,roughness:.5}));layers[3].add(m);E.register(m,'adventicia',COURSE.structures.adventicia.name,true);return m};
  const vv=(off,col)=>{const p=[];for(let k=0;k<=9;k++)p.push(wp(-1.3+k*0.5,1.64,300+55*Math.sin(k*0.8+off)));return tube(p,0.028,col)};
  vv(0,0xc23a3a);vv(1.7,0x5468b0);const nv=[];for(let k=0;k<=9;k++)nv.push(wp(-1.3+k*0.5,1.645,250+20*Math.sin(k*0.6)));tube(nv,0.02,0xe9d36b);
  {const points=[];for(let row=0;row<24;row++){const angle=(208+row*8.8)*Math.PI/180;for(let x=-1.35;x<3.12;x+=.32){const a=wp(x,1.626,angle*180/Math.PI),b=wp(x+.25,1.627,(angle+.035*Math.sin(x*4+row))*180/Math.PI);points.push(a.x,a.y,a.z,b.x,b.y,b.z)}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points,3));layers[3].add(new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0xf3d6a9,transparent:true,opacity:.25})));}
  {const cells=new THREE.InstancedMesh(new THREE.SphereGeometry(1,8,6),new THREE.MeshStandardMaterial({color:0x9d647d,roughness:.7}),96),dummy=new THREE.Object3D();for(let i=0;i<96;i++){const x=-3+(i%16)*.38,angle=208+Math.floor(i/16)*36;dummy.position.copy(wp(x,.995,angle));dummy.scale.set(.055,.018,.028);dummy.rotation.x=angle*Math.PI/180;dummy.updateMatrix();cells.setMatrixAt(i,dummy.matrix)}layers[0].add(cells);E.register(cells,'endotelio','Endotelio',true)}
  // valvas
  const xb=0.55,L=0.95,R=0.975,thc=70*Math.PI/180,nu=26,nv2=14;const cusps=[];
  for(let i=0;i<2;i++){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array((nu+1)*(nv2+1)*3),3));
    const idx=[];for(let a=0;a<nu;a++)for(let b=0;b<nv2;b++){const p=a*(nv2+1)+b,q=p+nv2+1;idx.push(p,q,p+1,q,q+1,p+1)}g.setIndex(idx);
    const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:0xe7c7a7,roughness:.6,side:THREE.DoubleSide}));scene.add(m);E.register(m,'valvas','Valvas',true);cusps.push({g,i})}
  function updCusps(cc){for(const {g,i} of cusps){const pa=g.attributes.position.array;let n=0;const dc=Math.cos(thc),ds=Math.sin(thc);
    for(let a=0;a<=nu;a++){const u=a/nu,th=thc+(i+u)*Math.PI,wy=R*Math.cos(th),wz=R*Math.sin(th),dot=wy*dc+wz*ds,py=dot*dc,pz=dot*ds,ty=lerp(wy,py,cc),tz=lerp(wz,pz,cc);
      for(let b=0;b<=nv2;b++){const v=b/nv2,k=v*v*(1.6-0.6*v);pa[n++]=xb+L*v*(1-0.22*cc*Math.sin(Math.PI*u));pa[n++]=lerp(wy,ty,k);pa[n++]=lerp(wz,tz,k)}}
    g.attributes.position.needsUpdate=true;g.computeVertexNormals()}}
  // eritrocitos
  const N=200,rb=new THREE.InstancedMesh(rbcGeometry(.065),new THREE.MeshStandardMaterial({color:0xffffff,roughness:.53}),N);scene.add(rb);
  const random=mulberry(601),parts=[];for(let k=0;k<N;k++){const a=random()*TAU,r=Math.sqrt(random())*.8;parts.push({x:lerp(-3.2,3.2,random()),a,r,ph:random()*TAU})}
  const M=new THREE.Matrix4(),Q=new THREE.Quaternion(),Sv=new THREE.Vector3(1,1,1),Pv=new THREE.Vector3(),col=new THREE.Color(),eu=new THREE.Euler();
  E.tag('Endotelio',v=>v.copy(wp(-3.0,1.02,200)).add(layers[0].position));E.tag('Íntima',v=>v.copy(wp(-2.45,1.06,200)).add(layers[1].position));
  E.tag('Media · músculo liso',v=>v.copy(wp(-1.8,1.19,200)).add(layers[2].position),'media');E.tag('Adventicia',v=>v.copy(wp(-0.9,1.62,215)).add(layers[3].position),'adventicia');
  E.tag('Vasa vasorum',v=>v.copy(wp(1.2,1.66,300+55*Math.sin(5*0.8))).add(layers[3].position),'adventicia');E.tag('Nervio de la pared',v=>v.copy(wp(2.2,1.65,250)).add(layers[3].position),'adventicia');
  E.tag('Valva (cúspide)',v=>v.set(xb+0.55,0.2,0.62));E.tag('Luz venosa',v=>v.set(-3.25,-0.3,0.3));
  return{frame(dt,S){
    separation+=(targetSeparation-separation)*(1-Math.exp(-5*dt));[0,2.6,5.8,9.4].forEach((offset,i)=>{layers[i].position.y=offset*separation;layers[i].position.z=-i*.12*separation});
    t+=dt;const T=3.2,p=(t%T)/T,incv=inc?0.85:0,rd=0.06+incv*0.3;let U;if(p<0.38)U=Math.sin(Math.PI*p/0.38);else if(p<0.38+rd)U=-(0.3+incv*0.4)*Math.sin(Math.PI*(p-0.38)/rd);else U=0.08;
    const tgt=U<0?(inc?0.6:1):0.02;c+=(tgt-c)*Math.min(1,dt*(U<0?12:5));updCusps(c);
    roF.set(U>0.15?'Flujo anterógrado: valvas abiertas':U<0?(inc?'Reflujo por falta de coaptación':'Cierre valvular'):'Reposo');
    const xg=xb+L*0.8;
    for(let k=0;k<N;k++){const q=parts[k];const prof=Math.max(0.2,1-(q.r/0.85)**2);let u=U*1.4*prof;
      if(U<0){if(!inc&&c>0.5)u*=0.04;else if(inc&&Math.abs(q.x-xg)<0.5)q.r*=1-dt*2}
      let nx=q.x+u*dt;if((q.x-xg)*(nx-xg)<0&&c>0.6&&q.r>(inc?0.3:0.05))nx=q.x;q.x=nx;q.r=Math.min(0.8,q.r+dt*0.02);
      if(q.x>3.2)q.x=-3.2;if(q.x<-3.2)q.x=3.2;q.ph+=dt;
      Pv.set(q.x,Math.cos(q.a)*q.r,Math.sin(q.a)*q.r);eu.set(q.ph,0.3,q.ph*0.7);Q.setFromEuler(eu);M.compose(Pv,Q,Sv);rb.setMatrixAt(k,M);
      col.set(u<-0.02?0xe8963a:0x9a1a28);rb.setColorAt(k,col)}
    rb.instanceMatrix.needsUpdate=true;if(rb.instanceColor)rb.instanceColor.needsUpdate=true;
    E.render(S)},destroy:E.destroy,cam,ctrl,selectPart:E.select,isolatePart:E.isolate,moveCamera:E.moveTo,setExplode:v=>explode.set(v),get parts(){return E.parts}};
}

/* ---------- 7 · De vena sana a várice (3D) ---------- */
function tort3D(el,ui){
  const E=make3D(el),{scene,cam,ctrl}=E;let deg=0.15,auto=false,dirA=1,t=0,built=-1,skinOn=false;
  const home=()=>{cam.position.set(7,1.8,12);ctrl.target.set(.3,0,-.6);ctrl.update()};home();
  const sl=ui.slider('Deformación ilustrada',0,1,0.01,deg,v=>{deg=v},v=>v<0.12?'Vena sana':v<0.3?'Reticular (< 3 mm)':v<0.7?'Várice (C2, ≥ 3 mm)':'Várice con dilataciones saculares');
  const ab=ui.buttons([['Animar progresión',()=>{auto=!auto;ab[0].textContent=auto?'Detener animación':'Animar progresión'}],['Restablecer vista',home]]);
  ui.toggle('Mostrar piel',false,v=>{skinOn=v;skin.visible=v});
  ui.legend([['#5b6fbf','Vena superficial (tributaria)'],['#2f3d78','Vena profunda'],['#5cc29a','Válvula competente'],[C.reflux,'Válvula incompetente / reflujo']]);
  const roD=ui.readout('Diámetro ilustrativo'),roT=ui.readout('Índice de tortuosidad'),roV=ui.readout('Marcadores cambiados: ejemplo');
  const fas=new THREE.Mesh(new THREE.PlaneGeometry(7,9.4),new THREE.MeshStandardMaterial({color:0xe9eef2,transparent:true,opacity:.13,side:THREE.DoubleSide,depthWrite:false}));fas.position.set(0.6,0,-1.5);scene.add(fas);
  E.register(fas,'fascia-muscular','Fascia muscular',true);
  const fe=new THREE.LineSegments(new THREE.EdgesGeometry(fas.geometry),new THREE.LineBasicMaterial({color:0xe9eef2,transparent:true,opacity:.5}));fe.position.copy(fas.position);scene.add(fe);
  const skin=new THREE.Mesh(new THREE.PlaneGeometry(7,9.4),new THREE.MeshStandardMaterial({color:0xd9a58c,transparent:true,opacity:.28,side:THREE.DoubleSide,depthWrite:false}));skin.position.set(0.6,0,1.9);skin.visible=false;scene.add(skin);
  const deepC=new THREE.LineCurve3(new THREE.Vector3(2.2,-4.6,-2.6),new THREE.Vector3(2.2,4.6,-2.6));
  const deepMesh=new THREE.Mesh(new THREE.TubeGeometry(deepC,20,.36,24,false),new THREE.MeshStandardMaterial({color:0x2f3d78,roughness:.45,transparent:true,opacity:.75}));scene.add(deepMesh);E.register(deepMesh,'profunda','Vena profunda',true);
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(2.85,-4.6,-2.6),new THREE.Vector3(2.85,4.6,-2.6)),20,0.2,16,false),new THREE.MeshStandardMaterial({color:0xc23a3a,roughness:.4})));
  const vMat=new THREE.MeshPhysicalMaterial({color:0x5b6fbf,roughness:.35,transparent:true,opacity:.42,side:THREE.DoubleSide,depthWrite:false,clearcoat:.5});
  let sup=null,perf=null,curve=null,cen=[],nor=[],bin=[],rad=[];const TS=320,valves=[],vS=[0.1,0.26,0.42,0.58,0.74,0.9];
  const ringG=new THREE.TorusGeometry(1,0.07,10,40);
  vS.forEach(()=>{const m=new THREE.Mesh(ringG,new THREE.MeshStandardMaterial({color:0x5cc29a,roughness:.4}));scene.add(m);E.register(m,'nivel-valvular','Nivel valvular: marcador',true);valves.push(m)});
  const pMat=new THREE.MeshStandardMaterial({color:0x5468b0,roughness:.4});
  const rFn=(s,d)=>0.16*(1+d*1.3*(0.5+0.5*Math.sin(s*29)**2)+d*d*1.6*(Math.exp(-(((s-0.33)/0.035)**2))+Math.exp(-(((s-0.66)/0.04)**2))));
  const failed=d=>vS.map((s,i)=>d>0.28+0.09*(5-i));
  function build(d){
    const pts=[];for(let i=0;i<=48;i++){const y=-4.5+9*i/48;pts.push(new THREE.Vector3(d*(0.95*Math.sin(y*2.2)+0.3*Math.sin(y*5.1+1)),y,0.4+d*0.75*Math.cos(y*1.8+0.5)))}
    curve=new THREE.CatmullRomCurve3(pts);sup=updateTubeMesh(sup,curve,TS,28,s=>rFn(s,d),vMat,scene);const g=sup.geometry;
    cen=[];nor=g.normals;bin=g.binormals;rad=[];for(let i=0;i<=TS;i++){cen.push(curve.getPointAt(i/TS));rad.push(rFn(i/TS,d))}
    E.register(sup,'superficial','Vena superficial',true);
    const f=failed(d);vS.forEach((s,i)=>{const ii=Math.round(s*TS),m=valves[i],c0=cen[ii],tg=curve.getTangentAt(s);m.position.copy(c0);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),tg);m.scale.setScalar(rad[ii]*0.92);m.material.color.set(f[i]?0xe8963a:0x5cc29a)});
    const a=cen[Math.round(0.4*TS)];perf=updateTubeMesh(perf,new THREE.CatmullRomCurve3([a.clone(),new THREE.Vector3((a.x+2.2)/2,a.y-.3,-1.5),new THREE.Vector3(2.2,a.y-.6,-2.6)]),40,10,.07+d*.07,pMat,scene);E.register(perf,'perforante','Vena perforante',true);
    pMat.color.set(d>0.62?0xe8963a:0x5468b0);
    let len=curve.getLength();roD.set(d<.3?'Menor en este modelo':'Mayor en este modelo');roT.set((len/9).toFixed(2));roV.set(f.filter(Boolean).length+' de '+vS.length);built=d}
  const N=260,ib=new THREE.InstancedMesh(rbcGeometry(.055),new THREE.MeshStandardMaterial({color:0xffffff,roughness:.5}),N);scene.add(ib);
  const rand=mulberry(712),ps=[];for(let k=0;k<N;k++)ps.push({s:rand(),a:rand()*TAU,r:Math.sqrt(rand())*.6});
  const ND=70,idp=new THREE.InstancedMesh(new THREE.SphereGeometry(0.06,10,8),new THREE.MeshStandardMaterial({color:0x9a1a28,roughness:.5}),ND);scene.add(idp);
  const dps=[];for(let k=0;k<ND;k++)dps.push({y:rnd(-4.6,4.6),a:Math.random()*TAU,r:Math.random()*0.25});
  const M=new THREE.Matrix4(),P=new THREE.Vector3(),Q=new THREE.Quaternion(),Sc=new THREE.Vector3(1,1,1),col=new THREE.Color();
  E.tag('Vena superficial',v=>v.copy(cen[Math.round(0.8*TS)]||v.set(0,3,0)).add(new THREE.Vector3(0.3,0,0)));E.tag('Fascia muscular',v=>v.set(-2.6,3.9,-1.5));
  E.tag('Vena profunda',v=>v.set(2.2,-3.6,-2.6));E.tag('Arteria',v=>v.set(2.85,-2.6,-2.6));E.tag('Vena perforante',v=>{const a=cen[Math.round(0.4*TS)];a?v.set((a.x+2.2)/2,a.y-0.3,-1.5):v.set(1,0,-1.5)});
  E.tag('Nivel valvular: marcador',v=>v.copy(cen[Math.round(0.58*TS)]||v.set(0,0.7,0)),'nivel-valvular');
  build(deg);
  return{frame(dt,S){
    t+=dt;if(auto&&dt>0){let d=deg+dirA*dt*0.12;if(d>1){d=1;dirA=-1}if(d<0){d=0;dirA=1}sl.set(d,true)}
    if(Math.abs(deg-built)>0.004)build(deg);
    const T=3,p=(t%T)/T,fail=failed(deg);let ds;
    if(p<0.45)ds=0.16*(1-0.55*deg)*Math.sin(Math.PI*p/0.45)+0.02;else if(deg>0.3&&p<0.45+0.4*deg)ds=-0.24*smooth(clamp((deg-0.3)/0.6,0,1));else ds=0.015;
    for(let k=0;k<N;k++){const q=ps[k];let v=ds;
      if(v<0){for(let i=0;i<vS.length;i++){if(!fail[i]&&q.s>vS[i]&&q.s+v*dt<=vS[i]){v=0;break}}}
      q.s+=v*dt*(1+0.2*Math.sin(k));if(q.s>1)q.s-=1;if(q.s<0)q.s+=1;
      const ii=Math.min(TS,Math.round(q.s*TS)),c0=cen[ii],nn=nor[ii],bb=bin[ii],rr=rad[ii]*q.r;
      P.set(c0.x+(nn.x*Math.cos(q.a)+bb.x*Math.sin(q.a))*rr,c0.y+(nn.y*Math.cos(q.a)+bb.y*Math.sin(q.a))*rr,c0.z+(nn.z*Math.cos(q.a)+bb.z*Math.sin(q.a))*rr);
      Sc.setScalar(0.7+deg*0.6);M.compose(P,Q,Sc);ib.setMatrixAt(k,M);col.set(v<-0.01?0xe8963a:0x9a1a28);ib.setColorAt(k,col)}
    ib.instanceMatrix.needsUpdate=true;if(ib.instanceColor)ib.instanceColor.needsUpdate=true;
    Sc.setScalar(1);for(let k=0;k<ND;k++){const q=dps[k];q.y+=dt*0.7;if(q.y>4.6)q.y=-4.6;P.set(2.2+Math.cos(q.a)*q.r,q.y,-2.6+Math.sin(q.a)*q.r);M.compose(P,Q,Sc);idp.setMatrixAt(k,M)}idp.instanceMatrix.needsUpdate=true;
    E.render(S)},destroy:E.destroy,cam,ctrl,selectPart:E.select,isolatePart:E.isolate,moveCamera:E.moveTo,get parts(){return E.parts}};
}

/* ---------- 8 · Compartimentos, comunicantes y perforantes (3D, cara medial del muslo) ---------- */
function compart3D(el,ui){
  const E=make3D(el),{scene,cam,ctrl}=E;let e=0,target=0,focus='all',inc=false,t=0,builtE=-1,builtInc=null;
  const home=()=>{cam.position.set(6.6,5.6,9.4);ctrl.target.set(0,0.3,0);ctrl.update()};home();
  const separationControl=ui.slider('Separación de capas',0,1,0.01,target,v=>{target=v},v=>v<0.05?'Anatomía in situ':v<0.5?'Separación parcial':'Vista explosionada');
  ui.segmented('Resaltar',['Todo','Comunicantes','Perforantes','N3','N2','N1'],0,i=>{focus=['all','comm','perf','n3','n2','n1'][i]});
  ui.toggle('Insuficiencia venosa (reflujo y perforante incompetente)',false,v=>{inc=v});
  ui.buttons([['Restablecer vista',home]]);
  ui.legend([['#3fbf8f','Comunicante: une venas del mismo sistema, no cruza la fascia muscular'],['#9a6ae0','Perforante: cruza la fascia muscular hacia el sistema profundo'],['#efdcc4','Válvula'],['#c23a3a','Arteria femoral'],[C.reflux,'Reflujo']]);
  const roC=ui.readout('Flujo en comunicante'),roP=ui.readout('Flujo en perforante'),roF=ui.readout('Fase');
  const L=8,W=6;
  const sfY=z=>0.08+Math.max(0.64*Math.exp(-(((z-0.8)/0.6)**2)),0.42*Math.exp(-(((z+1.2)/0.42)**2)),0.28*Math.exp(-(((z+0.2)/0.9)**4)));
  const zP=x=>2.2-0.12*x;
  const mat=(color,op,extra)=>new THREE.MeshStandardMaterial(Object.assign({color,roughness:.6,transparent:true,opacity:op,side:THREE.DoubleSide,depthWrite:op>0.95},extra||{}));
  const groups={};for(const k of ['n1','mf','n2','sf','n3','skin']){groups[k]=new THREE.Group();scene.add(groups[k])}
  const offs=()=>({n1:0,mf:0.5*e,n2:1.0*e,sf:1.4*e,n3:1.9*e,skin:2.5*e});
  const tracked=[];
  const add=(g,m,comp,kind)=>{const partId=g==='skin'?'piel':g==='n3'?'tejido':g==='mf'?'fascia-muscular':g==='sf'?'fascia-safena':g==='n1'?'musculo':kind==='nerve'?'nervio':null;m.userData={op:m.material.opacity,comp,kind,partId};groups[g].add(m);tracked.push(m);if(partId)E.register(m,partId,COURSE.structures[partId].name);return m};
  const rand=mulberry(23);
  // N1: músculo con fibras
  add('n1',new THREE.Mesh(new THREE.BoxGeometry(L,2.2,W),mat(0x9c3c3c,0.4)),1,'tissue').position.y=-1.12;
  {const pos=[];for(let i=0;i<110;i++){const y=-2.15+rand()*1.95,z=-2.9+rand()*5.8;if(Math.hypot(y+0.85,z+1.25)<0.75)continue;const x0=-4+rand()*1.5;pos.push(x0,y,z,x0+5+rand()*1.5,y+(rand()-.5)*0.2,z+(rand()-.5)*0.3)}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));add('n1',new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0x5e1a1a,transparent:true,opacity:.55})),1,'tissue')}
  // fascia muscular (profunda)
  add('mf',new THREE.Mesh(new THREE.BoxGeometry(L,0.05,W),mat(0xe4ebf1,0.85)),1,'fascia').position.y=0.025;
  // fascia safena: techo del canal safeno y del canal de la accesoria anterior
  {const g=new THREE.PlaneGeometry(L,W,40,80);g.rotateX(-Math.PI/2);const p=g.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,sfY(p.getZ(i)));g.computeVertexNormals();add('sf',new THREE.Mesh(g,mat(0x6aa0e0,0.45)),2,'fascia')}
  // nervio safeno en N2
  {const g=new THREE.CylinderGeometry(0.05,0.05,L,12);g.rotateZ(Math.PI/2);const m=add('n2',new THREE.Mesh(g,mat(0xe9d36b,1,{roughness:.4})),2,'nerve');m.position.set(0,0.2,1.22)}
  // N3: lobulillos grasos
  for(let i=0;i<46;i++){const x=-3.6+rand()*7.2,z=-2.7+rand()*5.4,y=Math.max(sfY(z)+0.45,0.6+rand()*1.1);const r=0.25+rand()*0.2;const m=add('n3',new THREE.Mesh(new THREE.SphereGeometry(r,14,10),mat(0xf0d27a,0.13)),3,'tissue');m.position.set(x,Math.min(y,1.85-r*0.5),z)}
  // piel: dermis con papilas y epidermis
  add('skin',new THREE.Mesh(new THREE.BoxGeometry(L,0.4,W),mat(0xe8bcab,0.28)),3,'skin').position.y=2.1;
  {const g=new THREE.PlaneGeometry(L,W,120,90);g.rotateX(-Math.PI/2);const p=g.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,2.3+0.035*Math.sin(p.getX(i)*8)*Math.sin(p.getZ(i)*8));g.computeVertexNormals();add('skin',new THREE.Mesh(g,mat(0xd99a8a,0.55)),3,'skin')}
  add('skin',new THREE.Mesh(new THREE.BoxGeometry(L,0.1,W),mat(0xe7c2a6,0.45)),3,'skin').position.y=2.37;

  function defs(){
    const V=[];const sup=0x5b6fbf,deep=0x2f3d78;
    V.push({n:'fv',kind:'deep',comp:1,r:.32,col:deep,sp:1.1,pts:[['n1',-4.3,-0.9,-1.0],['n1',4.3,-0.9,-1.0]]});
    V.push({n:'fa',kind:'art',comp:1,r:.2,col:0xc23a3a,sp:2.4,art:true,pts:[['n1',4.3,-0.72,-1.62],['n1',-4.3,-0.72,-1.62]]});
    V.push({n:'mv',kind:'deep',comp:1,r:.12,col:deep,sp:.8,pts:[['n1',-4.2,-1.7,2.2],['n1',-2.0,-1.52,1.4],['n1',-0.5,-1.15,-0.3],['n1',0.25,-0.92,-0.9]]});
    V.push({n:'gsv',kind:'trunk',comp:2,r:inc?.36:.28,col:sup,sp:.9,refl:true,pts:[['n2',-4.2,.42,.8],['n2',4.2,.42,.8]]});
    V.push({n:'aa',kind:'trunk',comp:2,r:.17,col:sup,sp:.8,pts:[['n2',-4.2,.3,-1.2],['n2',4.2,.3,-1.2]]});
    const pa=[];for(let x=-4;x<=4.01;x+=0.5)pa.push(['n3',x,1.0+(inc?0.12*Math.sin(x*1.7):0),zP(x)+(inc?0.22*Math.sin(x*2.2):0)]);
    V.push({n:'pa',kind:'trib',comp:3,r:inc?.27:.17,col:sup,sp:.7,refl:true,pts:pa});
    V.push({n:'c1',kind:'comm',comp:0,r:.08,col:sup,sp:.5,valve:.3,c1:true,pts:[['n3',0.6,pa[9][2],zP(0.6)],['n3',0.9,0.72,1.7],['sf',1.1,sfY(1.25),1.25],['n2',1.4,0.52,0.98]]});
    V.push({n:'c2',kind:'comm',comp:0,r:.07,col:sup,sp:.45,valve:.35,pts:[['n2',-1.0,0.3,-1.03],['n2',-0.6,0.2,-0.2],['n2',-0.2,0.35,0.55]]});
    V.push({n:'p1',kind:'perf',comp:0,r:inc?.13:.09,col:sup,sp:.6,valve:.6,perf:true,pts:[['n2',2.2,0.25,0.65],['n2',2.4,0.12,0.45],['mf',2.6,0.03,0.2],['n1',2.85,-0.4,-0.35],['n1',3.0,-0.75,-0.78]]});
    V.push({n:'p2',kind:'perf',comp:0,r:inc?.11:.08,col:sup,sp:.6,valve:.72,perf:true,pts:[['n3',-2.6,1.0,zP(-2.6)],['n3',-2.7,0.6,2.45],['sf',-2.8,sfY(2.4),2.4],['mf',-2.85,0.03,2.2],['n1',-2.9,-0.8,1.75],['n1',-2.95,-1.55,1.62]]});
    const ret=0x3f86a8;
    V.push({n:'r1',kind:'ret',comp:3,r:inc?.075:.055,col:ret,sp:.35,pts:[['n3',-3.8,1.78,-0.8],['n3',-2,1.8,0.2],['n3',-0.5,1.76,1.0],['n3',0.3,1.4,1.8],['n3',0.6,1.05,zP(0.6)]]});
    V.push({n:'r2',kind:'ret',comp:3,r:inc?.075:.055,col:ret,sp:.35,pts:[['n3',3.8,1.78,-1.5],['n3',2.5,1.8,-0.5],['n3',1.8,1.75,0.8],['n3',1.4,1.45,1.6],['n3',1.2,1.05,zP(1.2)]]});
    const tel=0x9b3f8f;
    [[-2.0,0.2,'t1'],[2.5,-0.5,'t2']].forEach(([cx,cz,nm])=>{const legs=6;for(let k=0;k<legs;k++){const a=k/legs*TAU+0.4,c=Math.cos(a),s=Math.sin(a),R=inc?0.6:0.42;
        V.push({n:nm+'l'+k,kind:'tel',comp:3,r:inc?.026:.017,col:tel,sp:.18,pts:[['skin',cx+c*R,2.17,cz+s*R],['skin',cx+c*R*0.5+s*0.07,2.165,cz+s*R*0.5-c*0.07],['skin',cx,2.14,cz]]})}
      V.push({n:nm,kind:'tel',comp:3,r:inc?.04:.03,col:tel,sp:.25,pts:[['skin',cx,2.14,cz],['skin',cx,1.97,cz],['n3',cx,1.8,cz]]})});
    return V;
  }
  let vessels=[],vMeshes=[],ligs=null;const byName={},vesselCache=new Map();
  const W3=p=>{const o=offs();return new THREE.Vector3(p[1],p[2]+o[p[0]],p[3])};
  const Z=new THREE.Vector3(0,0,1),Y=new THREE.Vector3(0,1,0);
  function build(){
    vessels=defs();
    for(const v of vessels){
      const pts=v.pts.map(W3),curve=pts.length===2?new THREE.LineCurve3(pts[0],pts[1]):new THREE.CatmullRomCurve3(pts,false,'centripetal');
      v.len=curve.getLength();v.S=curve.getSpacedPoints(100);const frames=curve.computeFrenetFrames(100,false);v.N=frames.normals;v.B=frames.binormals;v.T=frames.tangents;
      v.partId=v.kind==='perf'?'perforante':v.kind==='comm'?'comunicante':v.kind==='deep'?'profunda':v.kind==='art'?'arteria':v.n==='gsv'?'safena':'superficial';
      let cached=vesselCache.get(v.n);
      if(!cached){cached={segments:Math.max(16,Math.min(128,Math.round(v.len*14))),radial:v.r<.05?8:18};cached.mesh=updateTubeMesh(null,curve,cached.segments,cached.radial,v.r,mat(v.col,v.kind==='art'?.8:.48,{roughness:.4}),scene);vesselCache.set(v.n,cached);tracked.push(cached.mesh);vMeshes.push(cached.mesh)}
      else updateTubeMesh(cached.mesh,curve,cached.segments,cached.radial,v.r,null,scene);
      const m=cached.mesh;m.userData={op:v.kind==='art'?.8:.48,comp:v.comp,kind:v.kind,partId:v.partId};E.register(m,v.partId,COURSE.structures[v.partId]?.name||v.partId);byName[v.n]=v;
      if(v.valve!=null){const i=Math.round(v.valve*100),bad=inc&&(v.kind==='perf'||v.c1);
        if(!cached.ring){cached.ring=new THREE.Mesh(new THREE.TorusGeometry(1.02,.12,8,24),mat(0xefdcc4,1,{roughness:.4}));scene.add(cached.ring);tracked.push(cached.ring);cached.leaves=[1,-1].map(side=>{const lf=new THREE.Mesh(curvedCuspGeometry(side),mat(0xefdcc4,.9,{roughness:.4}));scene.add(lf);tracked.push(lf);return lf})}
        const ring=cached.ring;ring.position.copy(v.S[i]);ring.scale.setScalar(v.r);ring.quaternion.setFromUnitVectors(Z,v.T[i]);ring.material.color.setHex(bad?0xe8963a:0xefdcc4);ring.userData={op:1,comp:v.comp,kind:v.kind,partId:'valvas'};E.register(ring,'valvas','Válvulas');
        cached.leaves.forEach(lf=>{lf.position.set(0,0,0);lf.scale.setScalar(1);lf.quaternion.identity();lf.material.color.setHex(bad?0xe8963a:0xefdcc4);lf.userData={op:.9,comp:v.comp,kind:v.kind,partId:'valvas'};E.register(lf,'valvas','Valvas')})}
    }
    // ligamentos safenos: tractos fibrosos entre la safena y la fascia safena
    const o=offs(),lp=[];for(let x=-3.6;x<=3.61;x+=0.6)for(const d of [35,65,115,145]){const th=d*Math.PI/180,r=inc?.36:.28;lp.push(x,.42+o.n2+r*Math.sin(th),.8+r*Math.cos(th));const zb=.8+0.66*Math.cos(th);lp.push(x+0.05,sfY(zb)+o.sf,zb)}
    if(!ligs){const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute(lp,3));ligs=new THREE.LineSegments(lg,new THREE.LineBasicMaterial({color:0xf2f4f6,transparent:true,opacity:.75}));ligs.userData={op:.75,comp:2,kind:'fascia',partId:'fascia-safena'};scene.add(ligs);tracked.push(ligs)}
    else{ligs.geometry.attributes.position.array.set(lp);ligs.geometry.attributes.position.needsUpdate=true;ligs.geometry.computeBoundingSphere()}
    builtE=e;builtInc=inc;
  }
  build();
  // eritrocitos bicóncavos (perfil de Evans‑Fung) por cada vaso
  const prof=[];for(let i=0;i<=12;i++){const r=i/12;prof.push(new THREE.Vector2(Math.max(0.001,r),Math.sqrt(Math.max(0,1-r*r))*(0.1035+1.0015*r*r-0.5615*r**4)))}
  for(let i=12;i>=0;i--){const r=i/12;prof.push(new THREE.Vector2(Math.max(0.001,r),-Math.sqrt(Math.max(0,1-r*r))*(0.1035+1.0015*r*r-0.5615*r**4)))}
  const rbcG=new THREE.LatheGeometry(prof,18);rbcG.scale(0.055,0.055,0.055);
  const parts=[];vessels.forEach((v,vi)=>{const n=v.kind==='tel'?3:Math.round(clamp(v.len*v.r*95,5,150));for(let k=0;k<n;k++)parts.push({vi,s:Math.random(),a:Math.random()*TAU,rr:Math.sqrt(Math.random())*0.6,sp:0.85+Math.random()*0.3,ph:Math.random()*TAU})});
  const IM=new THREE.InstancedMesh(rbcG,new THREE.MeshStandardMaterial({color:0xffffff,roughness:.45}),parts.length);scene.add(IM);
  const M=new THREE.Matrix4(),P=new THREE.Vector3(),Q=new THREE.Quaternion(),Q2=new THREE.Quaternion(),Sc=new THREE.Vector3(),col=new THREE.Color(),eu=new THREE.Euler();
  const fFor=(comp,kind)=>{if(focus==='all')return 1;if(focus==='comm'||focus==='perf'){if(kind===focus)return 1;if(kind==='trunk'||kind==='deep'||kind==='trib'||kind==='fascia')return 0.3;return 0.06}
    const c={n3:3,n2:2,n1:1}[focus];return comp===c?1:0.06};
  // etiquetas
  const tv=(text,n,s,dy)=>E.tag(text,v=>{const ve=byName[n];if(!ve)return v.set(0,0,0);v.copy(ve.S[Math.round(s*100)]);v.y+=dy||0});
  const ts=(text,fn)=>E.tag(text,v=>fn(v,offs()));
  ts('Epidermis',(v,o)=>v.set(-3.8,2.43+o.skin,2.95));ts('Dermis y papilas dérmicas',(v,o)=>v.set(-2.4,2.2+o.skin,2.95));
  tv('Telangiectasias (dermis)','t1l1',0.05,0.04);tv('Venas reticulares (plexo subdérmico)','r1',0.12,0.06);
  ts('Tejido subcutáneo',(v,o)=>v.set(-3.7,1.45+o.n3,-2.6));tv('Tributaria posterior (extrafascial)','pa',0.08,0.2);
  tv('Vena comunicante','c1',0.5,0.1);tv('Vena comunicante intrafascial','c2',0.5,0.08);
  ts('Fascia safena',(v,o)=>v.set(-3.9,sfY(1.55)+o.sf,1.55));ts('Canal safeno ("ojo egipcio")',(v,o)=>v.set(3.3,sfY(0.8)+o.sf+0.03,0.8));
  ts('Ligamentos safenos',(v,o)=>v.set(-1.5,0.42+(o.n2+o.sf)/2+0.2,1.35));
  tv('V. safena mayor','gsv',0.12,0.35);ts('Nervio safeno',(v,o)=>v.set(-2.6,0.2+o.n2,1.22));
  tv('V. safena anterior (alineada sobre los vasos femorales)','aa',0.06,0.2);
  ts('Fascia muscular (profunda)',(v,o)=>v.set(-3.9,0.06+o.mf,-2.6));
  tv('Vena perforante directa','p1',0.45);tv('Vena perforante indirecta','p2',0.55);tv('Válvula','p1',0.6,0.12);
  tv('Vena femoral','fv',0.04,0.32);tv('Arteria femoral','fa',0.96,0.2);tv('Vena muscular','mv',0.1);ts('Músculo',(v)=>v.set(-2.2,-2.0,2.95));
  ts('N3 · superficial',(v,o)=>v.set(4.35,1.3+o.n3,2.9));ts('N2 · safeno',(v,o)=>v.set(4.35,0.4+o.n2,2.9));ts('N1 · profundo',(v)=>v.set(4.35,-1.0,2.9));
  return{frame(dt,S){
    t+=dt;e+=(target-e)*(1-Math.exp(-3.6*dt));
    const o=offs();for(const k in groups)groups[k].position.y=o[k];
    if(Math.abs(e-builtE)>0.004||inc!==builtInc){const keep=vessels.map(v=>v.n);build();if(vessels.map(v=>v.n).join()!==keep.join()){/* cambia el número de ramas: reasignar */parts.forEach(p=>{if(p.vi>=vessels.length)p.vi=p.vi%vessels.length})}}
    const ph=(t%3)/3,sys=ph<0.5;
    for(const v of vessels)if(v.valve!=null){const cached=vesselCache.get(v.n),bad=inc&&(v.kind==='perf'||v.c1),targetClose=v.kind==='perf'&&sys?1:0;cached.closure=(cached.closure||0)+(targetClose-(cached.closure||0))*(1-Math.exp(-12*dt));cached.leaves.forEach(lf=>{
      updateCurvedCusp(lf.geometry,cached.closure,bad?.38:.02);const p=lf.geometry.attributes.position;
      for(let j=0;j<p.count;j++){const x=p.getX(j)*v.r,y=p.getY(j)*v.r,u=clamp(v.valve+p.getZ(j)*v.r/v.len,0,1)*100,i=Math.min(99,Math.floor(u)),f=u-i,a=v.S[i],b=v.S[i+1],n=v.N[i],bb=v.B[i];p.setXYZ(j,lerp(a.x,b.x,f)+x*n.x+y*bb.x,lerp(a.y,b.y,f)+x*n.y+y*bb.y,lerp(a.z,b.z,f)+x*n.z+y*bb.z)}
      p.needsUpdate=true;lf.geometry.computeVertexNormals();lf.geometry.computeBoundingSphere();if(lf.geometry.boundingBox)lf.geometry.computeBoundingBox();
    });}
    for(const m of tracked){const k=m.userData.kind,f=E.isolated&&E.selected===m.userData.partId?1:fFor(m.userData.comp,k),want=m.userData.op*f*E.factor(m.userData.partId);m.material.opacity+=(want-m.material.opacity)*Math.min(1,dt*6+0.02);m.material.depthWrite=m.material.opacity>0.95;
      if(m.material.emissive)m.material.emissive.setHex(focus==='comm'&&k==='comm'?0x1f8a5f:focus==='perf'&&k==='perf'?0x5a2fa0:0x000000)}
    const st=vessels.map(v=>{let dir=1,refl=false,sp=v.sp;
      if(v.kind==='perf'){if(inc&&sys){dir=-1;refl=true;sp=0.9}else sp=sys?0:0.9}
      if(inc&&v.refl&&!sys){dir=-1;refl=true}
      if(inc&&v.c1&&!sys){dir=-1;refl=true}
      return{d:dir*sp/v.len,refl,vis:(E.isolated&&E.selected===v.partId?1:fFor(v.comp,v.kind))*E.factor(v.partId)>0.25?1:0}});
    for(let k=0;k<parts.length;k++){const p=parts[k],v=vessels[p.vi],s0=st[p.vi];p.s+=s0.d*dt*p.sp;if(p.s>1)p.s-=1;if(p.s<0)p.s+=1;p.ph+=dt*1.5;
      const fi=p.s*100,i=Math.min(99,Math.floor(fi)),f=fi-i,a=v.S[i],b=v.S[i+1],n=v.N[i],bb=v.B[i],rr=v.r*p.rr;
      P.set(lerp(a.x,b.x,f)+(n.x*Math.cos(p.a)+bb.x*Math.sin(p.a))*rr,lerp(a.y,b.y,f)+(n.y*Math.cos(p.a)+bb.y*Math.sin(p.a))*rr,lerp(a.z,b.z,f)+(n.z*Math.cos(p.a)+bb.z*Math.sin(p.a))*rr);
      const nearValve=v.valve!=null&&Math.abs(p.s-v.valve)*v.len<v.r*1.7;
      eu.set(p.ph,p.a,p.ph*0.6);Q.setFromEuler(eu);const sc=(nearValve?0:s0.vis)*Math.min(1,v.r*.32/.055);Sc.set(sc,sc,sc);M.compose(P,Q,Sc);IM.setMatrixAt(k,M);
      col.setHex(v.art?0xd0202a:s0.refl?0xe8963a:0x8a1422);IM.setColorAt(k,col)}
    IM.instanceMatrix.needsUpdate=true;if(IM.instanceColor)IM.instanceColor.needsUpdate=true;
    roC.set(inc&&!sys?'safena → conexión superficial (reflujo)':'conexión superficial → safena mayor (ejemplo)');
    roP.set(inc&&sys?'profunda → superficial (incompetente)':sys?'cerrada durante la contracción':'superficial → profunda (normal)');
    roF.set(sys?'Sístole muscular':'Diástole muscular');
    E.render(S)},destroy:E.destroy,cam,ctrl,selectPart:E.select,isolatePart:E.isolate,moveCamera:E.moveTo,setExplode:v=>separationControl.set(v),get parts(){return E.parts}};
}

/* miniaturas para las láminas 3D */
function thumbComp(ctx){
  const slab=(y,h,c,op)=>{ctx.globalAlpha=op||1;ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(180,y);ctx.lineTo(820,y);ctx.lineTo(900,y-70);ctx.lineTo(260,y-70);ctx.closePath();ctx.fill();ctx.fillRect(180,y,640,h);ctx.globalAlpha=1};
  slab(560,0,C.muscle);ctx.fillStyle=C.muscle;ctx.fillRect(180,470,640,90);slab(470,0,C.muscleL);
  slab(420,6,'#dfe6ee',0.9);
  ctx.strokeStyle='#5b6fbf';ctx.lineWidth=26;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(250,360);ctx.lineTo(760,320);ctx.stroke();
  slab(280,6,'#6aa0e0',0.75);
  ctx.lineWidth=14;for(const [y,o] of [[190,0],[170,40]]){ctx.beginPath();for(let x=240;x<=800;x+=20)ctx.lineTo(x,y-o*0.5+Math.sin(x*0.02+o)*14);ctx.stroke()}
  slab(110,22,C.skin);
  ctx.fillStyle='#2f3d78';for(const x of [430,500]){ctx.beginPath();ctx.arc(x,520,18,0,TAU);ctx.fill()}ctx.fillStyle='#c23a3a';ctx.beginPath();ctx.arc(465,520,12,0,TAU);ctx.fill();
  ctx.lineWidth=9;ctx.strokeStyle='#3fbf8f';ctx.beginPath();ctx.moveTo(620,180);ctx.quadraticCurveTo(600,260,560,330);ctx.stroke();ctx.strokeStyle='#9a6ae0';ctx.beginPath();ctx.moveTo(700,325);ctx.quadraticCurveTo(640,420,500,520);ctx.stroke();
  ctx.font='600 30px '+MONO;ctx.fillStyle=C.ink;ctx.fillText('N3',920,170);ctx.fillText('N2',920,340);ctx.fillText('N1',920,520);
}
function thumbWall(ctx){
  const cx=520,cy=300;const layers=[[250,C.advent],[205,C.media],[172,C.intima],[160,C.endo],[150,C.lumen]];
  for(const [r,c] of layers){ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,-2.2,2.6);ctx.closePath();ctx.fill()}
  ctx.fillStyle=C.lumen;ctx.beginPath();ctx.arc(cx,cy,150,0,TAU);ctx.fill();
  ctx.strokeStyle=C.valve;ctx.lineWidth=10;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(cx-120,cy-90);ctx.quadraticCurveTo(cx-20,cy-40,cx,cy);ctx.moveTo(cx+120,cy+90);ctx.quadraticCurveTo(cx+20,cy+40,cx,cy);ctx.stroke();
  for(let i=0;i<30;i++){const a=i*2.4,r=40+(i*37)%100;rbc(ctx,cx+Math.cos(a)*r,cy+Math.sin(a)*r,a,false,2)}
  ctx.strokeStyle='#c23a3a';ctx.lineWidth=4;ctx.beginPath();ctx.arc(cx,cy,232,-2,-0.6);ctx.stroke();
}
function thumbTort(ctx){
  ctx.fillStyle='rgba(233,238,242,.12)';ctx.fillRect(560,40,10,520);
  ctx.strokeStyle='#2f3d78';ctx.lineWidth=40;ctx.beginPath();ctx.moveTo(760,20);ctx.lineTo(760,580);ctx.stroke();
  ctx.lineCap='round';ctx.lineJoin='round';
  const pts=[];for(let y=20;y<=580;y+=6)pts.push([360+Math.sin(y*0.022)*110+Math.sin(y*0.06)*30,y,30+22*Math.sin(y*0.05)**2]);
  for(let i=1;i<pts.length;i++){ctx.strokeStyle='rgba(91,111,191,.75)';ctx.lineWidth=pts[i][2]*2;ctx.beginPath();ctx.moveTo(pts[i-1][0],pts[i-1][1]);ctx.lineTo(pts[i][0],pts[i][1]);ctx.stroke()}
  for(let i=0;i<pts.length;i+=4)rbc(ctx,pts[i][0]+((i*13)%20-10),pts[i][1],Math.PI/2,i%12<4,1.6);
  ctx.strokeStyle=C.reflux;ctx.lineWidth=6;ctx.beginPath();ctx.ellipse(pts[40][0],pts[40][1],44,12,0,0,TAU);ctx.stroke();
}

/* ---------- catálogo ---------- */
const MODS=[{"id":"pared-3d",
"cat":"Anatomía",
"title":"Pared venosa y válvula en 3D",
"kind":"3d",
"init":wall3D,
"thumb":thumbWall,
"blurb":"Modelo rotable con las capas de la pared, vasa vasorum y una válvula bicúspide que abre y cierra.",
"text":{"paciente":"<p>La pared de una vena tiene varias capas: una cubierta interna llamada endotelio, tejido con músculo liso y una envoltura externa de sostén. El endotelio sano participa en mantener la sangre fluida; no impide por sí solo toda trombosis.</p><p>Las válvulas ayudan a limitar el flujo hacia atrás. Compara una coaptación conservada con otra incompleta. Las causas de enfermedad venosa son diversas: el reflujo no explica por sí solo todos los casos.</p>",
"medico":"<p>Íntima, media y adventicia varían según el territorio y el calibre venoso. Las valvas son pliegues con núcleo conjuntivo y revestimiento endotelial. El modelo muestra una válvula bicúspide, con espesores ampliados.</p><p>El movimiento valvular depende de las relaciones entre pared, gradientes y flujo local; los senos participan en la dinámica perivalvular. La dilatación y la lesión valvular pueden contribuir a la incompetencia, sin una secuencia histológica universal ni una causa única de várices.</p>"},
"sources":["valve",
"esvs"],
"scope":"Modelo conceptual con escalas y tiempos ilustrativos. No calcula diagnóstico, riesgo, pronóstico ni tratamiento individual."},
{"id":"valvula-sana",
"cat":"Fisiología",
"title":"Válvula venosa sana",
"kind":"2d",
"init":valveSim(0),
"thumbT":1.55,
"blurb":"Corte longitudinal con flujo de eritrocitos: apertura en sístole muscular, cierre y vórtice del seno valvular.",
"text":{"paciente":"<p>Las valvas se abren durante el flujo hacia el corazón y se aproximan para limitar el regreso de sangre. El movimiento de la pantorrilla ayuda al retorno venoso.</p><p>El cierre depende del flujo y de las diferencias de presión. Los remolinos del seno forman parte de su dinámica; no significan que la válvula se lave o quede protegida de toda enfermedad. El registro de abajo es un esquema.</p>",
"medico":"<p>El ciclo valvular incluye apertura, equilibrio, cierre y fase cerrada. Las valvas abiertas permanecen en la corriente cerca de la pared del seno, sin que sea necesario que se apoyen contra ella.</p><p>Los cambios de geometría y los vórtices perivalvulares participan en el cierre; no requiere un gran volumen de reflujo. El trazado es didáctico y no permite aplicar umbrales diagnósticos a una persona. Los criterios de reflujo dependen del segmento y del protocolo de dúplex.</p>"},
"sources":["valve",
"valve2002"],
"scope":"Modelo conceptual con escalas y tiempos ilustrativos. No calcula diagnóstico, riesgo, pronóstico ni tratamiento individual."},
{"id":"valvula-incompetente",
"cat":"Fisiopatología",
"title":"Válvula incompetente y reflujo",
"kind":"2d",
"init":valveSim(0.85),
"thumbT":1.8,
"blurb":"Coaptación incompleta y flujo retrógrado en un trazado didáctico, sin medición clínica.",
"text":{"paciente":"<p>Si las valvas no se aproximan adecuadamente, parte del flujo puede regresar: eso se llama reflujo. La dilatación es una de sus posibles causas.</p><p>La enfermedad venosa puede incluir reflujo, obstrucción y alteraciones de la bomba muscular. No todas las personas siguen la misma evolución ni todos los casos comienzan en la ingle.</p>",
"medico":"<p>La falta de coaptación puede relacionarse con dilatación, lesión o alteración del desarrollo valvular y cambios postrombóticos. La forma del dibujo no establece cuál es la causa en un paciente.</p><p>En el dúplex, SVS/AVF/AVLS define reflujo como flujo invertido mayor de 500 ms en troncos superficiales y determinados segmentos, y mayor de 1 s en femoral común, femoral y poplítea. La técnica y el territorio deben constar; no existe un único umbral para todas las venas. El contador del esquema no es una medición clínica.</p>"},
"sources":["svs",
"valve"],
"scope":"Modelo conceptual con escalas y tiempos ilustrativos. No calcula diagnóstico, riesgo, pronóstico ni tratamiento individual."},
{"id":"bomba-muscular",
"cat":"Fisiología",
"title":"Bomba muscular de la pantorrilla",
"kind":"2d",
"init":calfPump,
"thumbT":0.4,
"blurb":"Sístole y diástole muscular, válvulas proximal y distal, perforante y presión venosa ambulatoria.",
"text":{"paciente":"<p>Al contraerse, la pantorrilla comprime las venas profundas y ayuda a impulsar la sangre. Las válvulas coordinan el vaciado y el llenado.</p><p>Durante la relajación se representa el llenado desde el pie y desde las conexiones superficiales. El ejemplo compara situaciones; no calcula la presión de una persona ni sustituye una indicación de ejercicio.</p>",
"medico":"<p>En el esquema de eyección, la válvula distal cierra y la proximal abre; durante el relleno se invierte esa coordinación. Las perforantes de la pantorrilla participan en las relaciones entre sistemas superficial y profundo.</p><p>El bombeo eficaz reduce la presión venosa distal durante la marcha. El reflujo, la obstrucción y la disfunción de bomba pueden limitar esa reducción. Las curvas y su amplitud son cualitativas: no se calcula presión venosa ambulatoria ni tiempo de rellenado fotopletismográfico.</p>"},
"sources":["pump",
"esvs"],
"scope":"Modelo conceptual con escalas y tiempos ilustrativos. No calcula diagnóstico, riesgo, pronóstico ni tratamiento individual."},
{"id":"fascias",
"cat":"Anatomía",
"title":"Fascias y compartimento safeno",
"kind":"2d",
"init":fasciaSim,
"thumbT":1,
"blurb":"Corte transversal: piel, tejido subcutáneo, ojo egipcio, fascia muscular, perforante y paquete profundo.",
"text":{"paciente":"<p>La fascia muscular separa las venas superficiales de las profundas. La safena mayor discurre en un compartimento delimitado por fascia safena y fascia muscular.</p><p>Las tributarias pueden estar fuera de ese compartimento. Tanto la safena como sus ramas pueden dilatarse. Una perforante atraviesa la fascia muscular para conectar los sistemas.</p>",
"medico":"<p>El compartimento safeno se identifica entre la fascia safena y la fascia muscular; su configuración ecográfica se describe como signo del ojo safeno. La presencia de fascia no impide la dilatación o el reflujo del tronco.</p><p>Las perforantes conectan sistemas superficial y profundo; las comunicantes conectan venas del mismo sistema. El flujo de las perforantes debe interpretarse según localización y protocolo. El modelo muestra una comparación conceptual y no clasifica una perforante como patológica por su aspecto.</p>"},
"sources":["nomenclature",
"esvs"],
"scope":"Modelo conceptual con escalas y tiempos ilustrativos. No calcula diagnóstico, riesgo, pronóstico ni tratamiento individual."},
{"id":"compartimentos-3d",
"cat":"Anatomía",
"title":"Compartimentos, comunicantes y perforantes",
"kind":"3d",
"init":compart3D,
"thumb":thumbComp,
"blurb":"Bloque 3D de la cara medial del muslo: piel, N3, canal safeno N2, fascia muscular y N1, con eritrocitos en comunicantes y perforantes.",
"text":{"paciente":"<p>Separa los tejidos para reconocer venas superficiales, compartimento safeno y sistema profundo. La separación es una herramienta de aprendizaje.</p><p>Las comunicantes unen venas del mismo sistema. Las perforantes cruzan la fascia muscular para conectar sistemas superficial y profundo. Estas conexiones no son todas iguales.</p>",
"medico":"<p>N1, N2 y N3 se usan aquí como referencias topográficas didácticas: sistema profundo, compartimento safeno y territorio superficial extrafascial. No sustituyen la nomenclatura anatómica ni representan tres sistemas independientes.</p><p>La perforante atraviesa la fascia muscular; la comunicante une venas del mismo sistema sin cruzarla. El flujo predominante superficial-profundo en las perforantes de la pantorrilla es una simplificación contextual, no una regla universal para todas las conexiones del cuerpo.</p>"},
"sources":["nomenclature",
"esvs","asv"],
"scope":"Modelo conceptual con escalas y tiempos ilustrativos. No calcula diagnóstico, riesgo, pronóstico ni tratamiento individual."},
{"id":"union-safenofemoral",
"cat":"Diagnóstico",
"title":"Unión safeno‑femoral y Valsalva",
"kind":"2d",
"init":sfjSim,
"thumbT":1,
"blurb":"Cayado con válvulas terminal y preterminal, tributarias, maniobra de Valsalva y trazado Doppler.",
"text":{"paciente":"<p>La safena mayor desemboca en la vena femoral común, cerca de la ingle. La disposición de válvulas y ramas puede variar.</p><p>En el dúplex se utilizan maniobras para observar cómo responde el flujo. Un dibujo o un registro aislado no decide por sí solo dónde tratar.</p>",
"medico":"<p>La unión safenofemoral conecta la safena mayor con la femoral común. La disposición de válvulas terminal y preterminal y la entrada de tributarias presenta variantes.</p><p>Valsalva puede utilizarse para evaluar la femoral común y la unión; las maniobras distales de aumento y liberación se interpretan en el territorio correspondiente. El reflujo de la safena y el de la femoral común utilizan criterios distintos. Una terminal incompetente no demuestra por sí sola reflujo axial de toda la safena.</p>"},
"sources":["nomenclature",
"svs"],
"scope":"Modelo conceptual con escalas y tiempos ilustrativos. No calcula diagnóstico, riesgo, pronóstico ni tratamiento individual."},
{"id":"progresion-varice",
"cat":"Morfología",
"title":"Dilatación y tortuosidad: comparación en 3D",
"kind":"3d",
"init":tort3D,
"thumb":thumbTort,
"blurb":"Comparación de dilatación, elongación y tortuosidad, sin cronología ni pronóstico individual.",
"text":{"paciente":"<p>El control compara formas de una vena: menos dilatada o más dilatada y tortuosa. No representa años ni un empeoramiento inevitable.</p><p>La presencia, el origen y la extensión del reflujo requieren evaluación. El aspecto de una vena no demuestra por sí solo que dañará la piel o que necesita una intervención.</p>",
"medico":"<p>C2 describe venas varicosas subcutáneas de diámetro igual o mayor a 3 mm en bipedestación. Las reticulares se distinguen convencionalmente entre 1 y menos de 3 mm; las telangiectasias son menores de 1 mm.</p><p>El remodelado parietal, la elongación y la alteración de coaptación pueden relacionarse con tortuosidad y reflujo. El parámetro morfológico no es una escala clínica, cronológica o de pronóstico; la enfermedad puede ser multifocal y no sigue una secuencia universal descendente.</p>"},
"sources":["svs",
"esvs"],
"scope":"Modelo conceptual con escalas y tiempos ilustrativos. No calcula diagnóstico, riesgo, pronóstico ni tratamiento individual."},
{"id":"microcirculacion",
"cat":"Fisiopatología",
"title":"Microcirculación e hipertensión venosa",
"kind":"2d",
"init":microSim,
"thumbT":1.2,
"blurb":"Filtración, retorno linfático, inflamación y pigmentación en un esquema microvascular.",
"text":{"paciente":"<p>En los vasos pequeños se intercambian gases y sustancias con los tejidos. Parte del líquido se filtra y el sistema linfático contribuye a devolverlo a la circulación.</p><p>La presión venosa elevada mantenida puede favorecer edema, inflamación y pigmentación. No todos estos cambios aparecen juntos ni terminan en una úlcera.</p>",
"medico":"<p>El balance intersticial depende de filtración microvascular, barrera endotelial y transporte linfático, entre otros factores. El principio de Starling revisado incorpora el glucocálix; no debe enseñarse una reabsorción venular sostenida universal como vía principal de retorno.</p><p>La hipertensión venosa puede contribuir a extravasación eritrocitaria, hemosiderina y activación inflamatoria. La ulceración es multifactorial; el manguito de fibrina es un hallazgo/mecanismo propuesto y no prueba una barrera única de hipoxia. Los estados no asignan CEAP ni riesgo individual de úlcera.</p>"},
"sources":["starling",
"esvs"],
"scope":"Modelo conceptual con escalas y tiempos ilustrativos. No calcula diagnóstico, riesgo, pronóstico ni tratamiento individual."},
{"id":"escleroterapia",
"cat":"Tratamiento",
"title":"Escleroterapia: cómo se cierra una vena",
"kind":"2d",
"init":scleroSim,
"thumbT":8,
"blurb":"Comparación de líquido y espuma, lesión endotelial, fibrosis y respuestas variables, sin selección de dosis.",
"text":{"paciente":"<p>La escleroterapia introduce un medicamento en una vena seleccionada para producir una lesión controlada de su revestimiento y favorecer su cierre. Puede usarse líquido o espuma, según el caso.</p><p>La respuesta puede incluir inflamación, trombo intraluminal y posterior fibrosis. No todas las venas se cierran de manera permanente ni desaparecen; pueden necesitarse reevaluación u otros tratamientos.</p><p>Puede causar complicaciones, algunas graves. La selección del medicamento, su concentración, volumen, técnica y cuidados posteriores pertenece a una valoración profesional. El control de intensidad de esta escena es didáctico y no prescribe.</p>",
"medico":"<p>Los esclerosantes detergentes lesionan membranas y endotelio. El contacto con sangre y proteínas modifica su actividad. La espuma desplaza parte de la sangre y cambia el contacto con la pared, pero también se mezcla, degrada e inactiva; no es correcto afirmar ausencia de dilución.</p><p>La fibrosis es un objetivo del tratamiento, con respuestas variables y posible recanalización. Las complicaciones incluyen pigmentación, matting, trombosis, reacciones alérgicas y eventos neurológicos o lesión cutánea, entre otras. La evaluación de contraindicaciones y el seguimiento son parte del procedimiento.</p><p>El modelo conserva la comparación líquido/espuma y los estados de daño, sin concentraciones, volúmenes, receta de espuma ni una ventana terapéutica calculada. La intensidad, el color y el resultado se seleccionan para explorar posibilidades; no indican una dosis adecuada ni una probabilidad clínica.</p>"},
"sources":["sclero2023",
"sclero2021"],
"scope":"Modelo conceptual con escalas y tiempos ilustrativos. No calcula diagnóstico, riesgo, pronóstico ni tratamiento individual."},
{"id":"trombosis-venosa-profunda",
"cat":"Trombosis",
"title":"Trombosis venosa profunda",
"kind":"2d",
"init":dvtSim,
"thumbT":16,
"blurb":"Tríada de Virchow, nido en el seno valvular, propagación, embolia pulmonar, ecografía de compresión y anticoagulación.",
"text":{"paciente":"<p>Una trombosis venosa profunda es un coágulo en una vena profunda. Puede causar dolor o hinchazón y también puede pasar inadvertida.</p><p>El flujo lento, la tendencia de la sangre a coagular y las alteraciones de la pared son grupos de mecanismos, llamados tríada de Virchow. No tienen que estar los tres presentes ni el modelo puede calcular un riesgo.</p><p>Un fragmento puede llegar a las arterias pulmonares. La anticoagulación reduce el riesgo de extensión y embolia, sin eliminarlo ni disolver directamente el trombo. La sospecha de TVP requiere valoración; ante falta de aire, dolor torácico o desmayo se necesita atención urgente.</p>",
"medico":"<p>La TVP puede relacionarse con estasis, hipercoagulabilidad y lesión/activación endotelial, con contribuciones distintas en cada caso. El seno valvular es un lugar de inicio posible, sin afirmar que toda TVP comienza allí.</p><p>La estrategia diagnóstica integra probabilidad clínica, dímero D en contextos apropiados y ecografía. La no compresibilidad es un hallazgo importante que debe interpretarse en un estudio completo y con el contexto, especialmente ante cambios residuales de TVP previa. Un estudio negativo puede requerir repetición o pruebas adicionales.</p><p>La anticoagulación reduce extensión y recurrencia; no garantiza ausencia de embolia ni determina por sí sola la resolución. La indicación, fármaco y duración dependen del territorio, factores desencadenantes y riesgo hemorrágico. La animación no genera pruebas de laboratorio, porcentajes de riesgo o decisiones terapéuticas.</p>"},
"sources":["ashDiagnosis",
"esvsThrombosis"],
"scope":"Modelo conceptual con escalas y tiempos ilustrativos. No calcula diagnóstico, riesgo, pronóstico ni tratamiento individual."},
{"id":"sindrome-postrombotico",
"cat":"Trombosis",
"title":"Síndrome postrombótico",
"kind":"2d",
"init":ptsSim,
"thumbT":9,
"blurb":"Organización, recanalización y posibles secuelas; componentes de Villalta sin calcular un diagnóstico.",
"text":{"paciente":"<p>Después de una TVP el trombo puede reducirse y la vena puede recuperar parte de su paso. También pueden persistir obstrucción, cicatrices internas o válvulas dañadas. No todas las personas desarrollan síndrome postrombótico.</p><p>Las molestias persistentes pueden relacionarse con esas secuelas y con presión venosa elevada. La evolución es variable. Los estados de la escena no indican meses reales ni predicen síntomas.</p><p>El equipo médico valora síntomas, exploración y pruebas según el caso. La compresión puede aliviar síntomas en algunas personas, pero no debe prometerse que prevenga siempre el síndrome.</p>",
"medico":"<p>La resolución de una TVP incluye procesos de fibrinólisis, organización y recanalización en proporciones variables. El reflujo y la obstrucción residual pueden contribuir a hipertensión venosa; no toda válvula queda destruida ni toda vena conserva una obstrucción significativa.</p><p>El diagnóstico de SPT es clínico y debe distinguirse de síntomas de la fase aguda. Villalta reúne cinco síntomas y seis signos, graduados de 0 a 3; su aplicación real requiere entrevista y exploración. El dibujo no deduce síntomas ni calcula un resultado de Villalta.</p><p>El seguimiento y el manejo se individualizan. Las medias pueden aliviar síntomas y edema en casos seleccionados; no equivalen a una garantía preventiva. La animación no estima presión venosa, puntuación clínica, velocidad de recanalización o indicación de intervención.</p>"},
"sources":["pts",
"ashTreatment"],
"scope":"Modelo conceptual con escalas y tiempos ilustrativos. No calcula diagnóstico, riesgo, pronóstico ni tratamiento individual."}];

/* ---------- interfaz ---------- */
let AUD='paciente';try{const a=localStorage.getItem('flebo-animaciones-aud');if(a==='paciente'||a==='medico')AUD=a}catch(e){}
let FILTER='Todos';
let UNIT_FILTER='all',CATALOG_VIEW='guided';
const $=s=>document.querySelector(s);let uid=0;
function makeUI(root){
  const ui={
    slider(label,min,max,step,val,fn,fmt){const id='ctl'+(++uid),d=document.createElement('div');d.className='ctl';
      d.innerHTML=`<div class="ctl-h"><label for="${id}"></label><output for="${id}"></output></div><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}">`;
      d.querySelector('label').textContent=label;const inp=d.querySelector('input'),out=d.querySelector('output');
      const upd=v=>{out.textContent=fmt?fmt(v):v};upd(val);inp.addEventListener('input',()=>{const v=+inp.value;fn(v);upd(v)});root.appendChild(d);
      return{set(v){inp.value=v;fn(+v);upd(+v)}}},
    toggle(label,val,fn){const id='ctl'+(++uid),d=document.createElement('label');d.className='ctl-h';d.style.alignItems='center';d.setAttribute('for',id);
      d.innerHTML=`<span></span><input type="checkbox" id="${id}" ${val?'checked':''}>`;d.firstChild.textContent=label;const input=d.querySelector('input');input.addEventListener('change',e=>fn(e.target.checked));root.appendChild(d);return{set(value){input.checked=!!value;fn(!!value)}}},
    segmented(label,opts,idx,fn){const d=document.createElement('div');d.className='ctl';const h=document.createElement('div');h.className='ctl-h';h.textContent=label;const s=document.createElement('div');s.className='seg';s.setAttribute('role','group');
      const bs=opts.map((o,i)=>{const b=document.createElement('button');b.type='button';b.textContent=o;b.setAttribute('aria-pressed',i===idx);b.onclick=()=>{bs.forEach((x,j)=>x.setAttribute('aria-pressed',j===i));fn(i)};s.appendChild(b);return b});
      d.append(h,s);root.appendChild(d);return{set(i){bs.forEach((x,j)=>x.setAttribute('aria-pressed',j===i))}}},
    buttons(list){const r=document.createElement('div');r.className='btnrow';const bs=list.map(([l,f],i)=>{const b=document.createElement('button');b.type='button';b.className='btn'+(i===0?' primary':'');b.textContent=l;b.onclick=f;r.appendChild(b);return b});root.appendChild(r);return bs},
    readout(label){if(!ui._dl){ui._dl=document.createElement('dl');ui._dl.className='readouts';root.appendChild(ui._dl)}const w=document.createElement('div');w.innerHTML='<dt></dt><dd>—</dd>';w.firstChild.textContent=label;ui._dl.appendChild(w);const dd=w.lastChild;let last='';return{set(t){if(t!==last){dd.textContent=t;last=t}}}},
    legend(items){const d=document.createElement('div');d.className='legend';for(const [c,l] of items){const s=document.createElement('span');s.innerHTML='<i></i>';s.firstChild.style.background=c;s.append(l);d.appendChild(s)}root.appendChild(d)}
  };return ui;
}
const STUB={slider:(l,a,b,s,v,fn)=>({set(x){fn(x)}}),toggle(){},segmented:()=>({set(){}}),buttons:l=>l.map(()=>({})),readout:()=>({set(){}}),legend(){}};

function fit(ctx,cw,ch,dpr){const s=Math.min(cw/1000,ch/600),ox=(cw-1000*s)/2,oy=(ch-600*s)/2;ctx.setTransform(dpr*s,0,0,dpr*s,dpr*ox,dpr*oy)}
function renderThumb(m,cv){
  const ctx=cv.getContext('2d');cv.width=600;cv.height=360;ctx.fillStyle=STAGE;ctx.fillRect(0,0,600,360);fit(ctx,600,360,1);
  if(m.kind==='3d'){m.thumb(ctx);return}
  const sim=m.init({ctx},STUB),S={labels:false},steps=Math.round((m.thumbT||1)*30);
  for(let i=0;i<steps;i++){ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=STAGE;ctx.fillRect(0,0,600,360);fit(ctx,600,360,1);sim.draw(1/30,S)}
}
const thumbObserver=new IntersectionObserver(entries=>{for(const e of entries){if(!e.isIntersecting)continue;thumbObserver.unobserve(e.target);const m=MODS[+e.target.dataset.index];const draw=()=>{try{renderThumb(m,e.target.querySelector('canvas'))}catch(err){console.error(err)}};(window.requestIdleCallback||window.setTimeout)(draw)}},{rootMargin:'160px'});
function buildGallery(){
  const cats=['Todos','Nuevos 3D',...new Set(MODS.map(m=>m.cat))],chips=$('#chips');
  cats.forEach(c=>{const b=document.createElement('button');b.type='button';b.className='chip';b.textContent=c;b.setAttribute('aria-pressed',c===FILTER);b.onclick=()=>{FILTER=c;[...chips.children].forEach(x=>x.setAttribute('aria-pressed',x.textContent===c));applyFilter()};chips.appendChild(b)});
  const grid=$('#grid');
  COURSE.units.forEach((unit,unitIndex)=>{
   const heading=document.createElement('div');heading.className='unit-heading';heading.dataset.unit=unit.id;heading.innerHTML='<h3></h3><p></p>';heading.querySelector('h3').textContent=(unitIndex+1)+'. '+unit.title;heading.querySelector('p').textContent=unit.description;grid.appendChild(heading);
   unit.ids.forEach(id=>{const i=MODS.findIndex(m=>m.id===id),m=MODS[i];if(!m)return;const b=document.createElement('button');b.type='button';b.className='card';b.dataset.cat=m.cat;b.dataset.unit=unit.id;b.dataset.index=i;b.dataset.search=(m.title+' '+m.blurb+' '+m.cat+' '+COURSE.lessons[m.id].patientTitle+' '+COURSE.lessons[m.id].patient).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    b.innerHTML=`<canvas class="thumb" aria-hidden="true"></canvas><div class="card-body"><div class="card-meta"><span class="eyebrow"></span><span class="kind">${m.kind==='3d'?'3D interactivo':'Animación 2D'}</span></div><h3></h3><p></p><span class="go">Abrir animación →</span></div>`;
    b.dataset.new=m.new3d?'true':'false';if(m.new3d){b.querySelector('.kind').textContent='Nuevo · 3D';b.querySelector('.kind').classList.add('new-kind')}b.querySelector('.eyebrow').textContent=m.cat;b.querySelector('h3').textContent=m.title;b.querySelector('p').textContent=m.blurb;b.onclick=()=>openMod(i);grid.appendChild(b);
    thumbObserver.observe(b)});
  });
}
function applyFilter(){
  const q=$('#search').value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();let count=0;
  document.querySelectorAll('.card').forEach(c=>{c.hidden=!((FILTER==='Todos'||c.dataset.cat===FILTER||(FILTER==='Nuevos 3D'&&c.dataset.new==='true'))&&(UNIT_FILTER==='all'||c.dataset.unit===UNIT_FILTER)&&(!q||c.dataset.search.includes(q)));if(!c.hidden)count++});
  document.querySelectorAll('.unit-heading').forEach(h=>{h.hidden=CATALOG_VIEW==='all'||![...document.querySelectorAll('.card')].some(c=>!c.hidden&&c.dataset.unit===h.dataset.unit)});
  $('#resultCount').textContent=count+' de '+MODS.length+' animaciones';$('#emptyState').hidden=count!==0;
}
$('#search').addEventListener('input',applyFilter);
function setAud(a){AUD=a;try{localStorage.setItem('flebo-animaciones-aud',a)}catch(e){}
  document.documentElement.dataset.audience=a;
  document.querySelectorAll('[data-aud]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.aud===a));if(cur)$('#vText').innerHTML=MODS[cur.i].text[AUD];
  document.querySelectorAll('.card').forEach(b=>{const m=MODS[+b.dataset.index],lesson=COURSE.lessons[m.id];b.querySelector('h3').textContent=a==='paciente'?lesson.patientTitle:m.title;b.querySelector('p').textContent=a==='paciente'?lesson.patient:m.blurb});
  if(window.learningUI)window.learningUI.audience(a);
}
document.querySelectorAll('[data-aud]').forEach(b=>b.addEventListener('click',()=>setAud(b.dataset.aud)));

const state={playing:true,speed:1,labels:AUD==='medico'};
if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)state.speed=0.5;
let cur=null,raf=0,lastTs=0,opener=null;
let threePromise=null;
function load3D(){
  if(window.THREE&&THREE.OrbitControls)return Promise.resolve();
  if(!threePromise){
    const load=src=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>{s.remove();reject(new Error('No se pudo cargar el modelo 3D.'))};document.head.appendChild(s)});
    threePromise=load('assets/vendor/three.min.js').then(()=>load('assets/vendor/OrbitControls.js')).catch(e=>{threePromise=null;throw e});
  }
  return threePromise;
}
async function openMod(i){
  closeMod(true);const m=MODS[i],host=$('#stageHost');opener=opener||document.activeElement;
  $('#viewer').hidden=false;document.body.style.overflow='hidden';$('#siteShell').inert=true;$('#structureDetail').hidden=true;
  state.playing=true;state.speed=matchMedia('(prefers-reduced-motion: reduce)').matches?0.5:1;state.labels=AUD==='medico';$('#viewer').classList.remove('paused');$('#vPlay').textContent='Pausa';$('#vPlay').setAttribute('aria-pressed',true);$('#vSpeed').value=state.speed;$('#vLabels').setAttribute('aria-pressed',state.labels);
  $('.v-side').scrollTop=0;$('#vCat').textContent=m.cat+' · '+(m.kind==='3d'?'modelo 3D':'animación');$('#vTitle').textContent=m.title;$('#vText').innerHTML=m.text[AUD];
  const ctr=$('#vControls');ctr.innerHTML='';const ui=makeUI(ctr);
  cur={i,m};
  if(m.kind==='2d'){const cv=document.createElement('canvas');cv.setAttribute('aria-label','Animación de '+m.title);host.appendChild(cv);const ctx=cv.getContext('2d');cur.cv=cv;cur.ctx=ctx;cur.sim=m.init({ctx},ui);cur.view={x:500,y:300,z:1};
    const zoom=document.createElement('div');zoom.className='stage-zoom';zoom.innerHTML='<button type="button" aria-label="Acercar esquema">+</button><button type="button" aria-label="Alejar esquema">−</button><button type="button" aria-label="Restablecer encuadre">↺</button>';host.appendChild(zoom);
    zoom.children[0].onclick=()=>{if(cur?.view)cur.view.z=Math.min(3,cur.view.z+0.4)};zoom.children[1].onclick=()=>{if(cur?.view)cur.view.z=Math.max(1,cur.view.z-0.4)};zoom.children[2].onclick=()=>{if(cur?.view)cur.view={x:500,y:300,z:1}};
    let drag=null;cv.onpointerdown=e=>{if(cur?.view?.z>1&&!vid){drag={x:e.clientX,y:e.clientY,cx:cur.view.x,cy:cur.view.y};cv.setPointerCapture(e.pointerId)}};cv.onpointermove=e=>{if(drag&&cur?.view){const scale=Math.min(host.clientWidth/1000,host.clientHeight/600)*cur.view.z;cur.view.x=clamp(drag.cx-(e.clientX-drag.x)/scale,100,900);cur.view.y=clamp(drag.cy-(e.clientY-drag.y)/scale,100,500)}};cv.onpointerup=cv.onpointercancel=()=>{drag=null};
  }
  else{
    const token=cur;host.innerHTML='<p class="stage-message" role="status">Cargando modelo 3D…</p>';
    try{await load3D();if(cur!==token)return false;host.innerHTML='';cur.sim=m.init(host,ui)}
    catch(e){if(cur!==token)return false;host.innerHTML='<div class="stage-message"><p>No se pudo abrir el modelo 3D en este navegador.</p><button class="sbtn" type="button">Intentar de nuevo</button><p>Puede consultar la explicación o abrir una animación 2D.</p></div>';host.querySelector('button').onclick=()=>openMod(i);$('#vClose').focus();return false}
  }
  {const wm=document.createElement('img');wm.className='wm';wm.src=LOGO.h_dark;wm.alt='Instituto Mexicano de Flebología';host.appendChild(wm)}
  try{history.replaceState(null,'','#'+m.id)}catch(e){}
  lastTs=0;raf=requestAnimationFrame(loop);$('#vClose').focus();document.dispatchEvent(new CustomEvent('flebo:open',{detail:{id:m.id,index:i}}));return true;
}
function closeMod(keep){
  stopVideo();cancelAnimationFrame(raf);if(cur&&cur.sim&&cur.sim.destroy)cur.sim.destroy();cur=null;$('#stageHost').innerHTML='';
  if(!keep){$('#viewer').hidden=true;document.body.style.overflow='';$('#siteShell').inert=false;try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}if(opener&&opener.focus)opener.focus();opener=null;if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});document.dispatchEvent(new Event('flebo:close'))}
}
function loop(ts){
  if(!cur||document.hidden)return;if(lastTs&&ts-lastTs<1000/60-1){raf=requestAnimationFrame(loop);return}const dt=lastTs?Math.min(0.05,(ts-lastTs)/1000):0;lastTs=ts;const sdt=state.playing?dt*state.speed*(vid?vid.simulationSpeed||1:1):0;
  if(cur.m.kind==='2d'){const cv=cur.cv,host=cv.parentElement,dpr=Math.min(devicePixelRatio||1,2),w=host.clientWidth,h=host.clientHeight;
    if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr)}
    const ctx=cur.ctx;ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=STAGE;ctx.fillRect(0,0,cv.width,cv.height);fit(ctx,w,h,dpr);if(vid){vTick(dt);vCam2D(ctx,state.playing?dt:0)}else if(cur.view){cur.cameraView=cur.cameraView||{x:500,y:300,z:1};const alpha=1-Math.exp(-7*dt);for(const k of ['x','y','z'])cur.cameraView[k]+=(cur.view[k]-cur.cameraView[k])*alpha;ctx.translate(500,300);ctx.scale(cur.cameraView.z,cur.cameraView.z);ctx.translate(-cur.cameraView.x,-cur.cameraView.y)}cur.sim.draw(sdt,state);if(vid)vOverlay2D(ctx,state.playing?dt:0)}
  else{if(vid){vTick(dt);vCam3D(state.playing?dt:0)}cur.sim.frame(sdt,state);if(vid)vPts3D()}
  raf=requestAnimationFrame(loop);
}
$('#vClose').onclick=()=>closeMod(false);
$('#vPlay').onclick=e=>{state.playing=!state.playing;$('#viewer').classList.toggle('paused',!state.playing);if(vid&&vid.audio){if(state.playing)playNarration(vid);else vid.audio.pause()}if(HAS_TTS&&vid){try{state.playing?speechSynthesis.resume():speechSynthesis.pause()}catch(err){}}e.currentTarget.textContent=state.playing?'Pausa':'Reproducir';e.currentTarget.setAttribute('aria-pressed',state.playing)};
$('#vSpeed').oninput=e=>{state.speed=+e.target.value;if(vid&&vid.audio)vid.audio.playbackRate=state.speed};$('#vSpeed').value=state.speed;
$('#vLabels').onclick=e=>{state.labels=!state.labels;e.currentTarget.setAttribute('aria-pressed',state.labels)};
$('#vFull').onclick=()=>{const v=$('#viewer');if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});else if(v.requestFullscreen)v.requestFullscreen().catch(()=>{})};
$('#vPrev').onclick=()=>{if(cur)openMod((cur.i+MODS.length-1)%MODS.length)};$('#vNext').onclick=()=>{if(cur)openMod((cur.i+1)%MODS.length)};
document.addEventListener('keydown',e=>{if(!cur)return;if(e.key==='Escape')closeMod(false);else if(e.key===' '&&e.target===document.body){e.preventDefault();$('#vPlay').click()}});
/* ---------- videos dirigidos para el paciente ---------- */
/* Cada toma: s texto narrado · a acciones ['btn',t] ['seg',etiqueta,i] ['sl',etiqueta,v] ['tg',etiqueta,bool] ['anim',etiqueta,v,segundos]
   c cámara 2D [x,y,zoom] o 3D {p:[x,y,z],t:[x,y,z]} · sp foco [x,y,rx,ry] · pt señaladores [[x,y,(z),texto]] · v velocidad de la animación */
const HOME3={pared:{p:[-1.6,2.3,6.2],t:[-0.3,0,0]},comp:{p:[6.6,5.6,9.4],t:[0,0.3,0]},prog:{p:[5.5,1.2,8.5],t:[0.3,0,-0.6]}};
const VIDEOS={
  "pared-3d": [
    {
      "s": "Este modelo muestra una vena y sus capas, con proporciones ampliadas para aprender.",
      "a": [
        [
          "tg",
          "Válvula incompetente",
          false
        ],
        [
          "tg",
          "Mostrar eritrocitos",
          true
        ]
      ],
      "c": {
        "p": [
          -1.6,
          2.3,
          6.2
        ],
        "t": [
          -0.3,
          0,
          0
        ]
      }
    },
    {
      "s": "El endotelio recubre su interior y participa en mantener la sangre fluida.",
      "c": {
        "p": [
          -4.4,
          0.6,
          3.2
        ],
        "t": [
          -2.9,
          -0.2,
          0.6
        ]
      },
      "pt": [
        [
          -3,
          -0.35,
          0.96,
          "Endotelio"
        ]
      ]
    },
    {
      "s": "La pared contiene músculo liso y tejido de sostén.",
      "c": {
        "p": [
          -3.4,
          0.9,
          3.8
        ],
        "t": [
          -1.9,
          -0.3,
          0.8
        ]
      },
      "pt": [
        [
          -1.8,
          -0.41,
          1.12,
          "Capa muscular"
        ]
      ]
    },
    {
      "s": "La envoltura externa aporta soporte y puede contener pequeños vasos y nervios.",
      "c": {
        "p": [
          -0.6,
          1.4,
          4.6
        ],
        "t": [
          0,
          -0.3,
          0.6
        ]
      },
      "pt": [
        [
          -0.9,
          -0.93,
          1.33,
          "Colágeno"
        ]
      ]
    },
    {
      "s": "Los elementos rojos representan glóbulos rojos dentro de la luz venosa.",
      "c": {
        "p": [
          -1.2,
          0.5,
          4.4
        ],
        "t": [
          -0.6,
          0,
          0
        ]
      },
      "pt": [
        [
          -1.6,
          0,
          0,
          "Glóbulos rojos"
        ]
      ]
    },
    {
      "s": "La válvula representada tiene dos valvas cubiertas de endotelio.",
      "c": {
        "p": [
          2.4,
          1.5,
          3.4
        ],
        "t": [
          1,
          0,
          0
        ]
      },
      "pt": [
        [
          1.1,
          0.2,
          0.6,
          "Válvula"
        ]
      ],
      "v": 0.6
    },
    {
      "s": "Sus movimientos ayudan a favorecer el avance de la sangre y limitar el flujo hacia atrás.",
      "v": 0.6
    },
    {
      "s": "Compare ahora una coaptación incompleta de las valvas.",
      "a": [
        [
          "tg",
          "Válvula incompetente",
          true
        ]
      ],
      "pt": [
        [
          1.3,
          0.1,
          0.3,
          "Hueco entre las hojas"
        ]
      ],
      "v": 0.6
    },
    {
      "s": "El flujo retrógrado se llama reflujo; puede contribuir a la enfermedad venosa.",
      "v": 0.8
    },
    {
      "s": "La pared, las válvulas y el movimiento muscular trabajan juntos; este dibujo no predice una enfermedad individual.",
      "a": [
        [
          "tg",
          "Válvula incompetente",
          false
        ]
      ],
      "c": {
        "p": [
          -1.6,
          2.3,
          6.2
        ],
        "t": [
          -0.3,
          0,
          0
        ]
      },
      "v": 1
    }
  ],
  "valvula-sana": [
    {
      "s": "Observe una vena de la pierna en un corte longitudinal ampliado.",
      "a": [
        [
          "btn",
          "Válvula sana"
        ]
      ],
      "c": [
        500,
        300,
        1
      ],
      "v": 0.7
    },
    {
      "s": "El extremo distal está a la izquierda y el proximal a la derecha.",
      "pt": [
        [
          70,
          262,
          "Pie"
        ],
        [
          930,
          262,
          "Corazón"
        ]
      ]
    },
    {
      "s": "La actividad muscular ayuda a impulsar la sangre hacia el corazón.",
      "c": [
        560,
        262,
        1.5
      ],
      "sp": [
        560,
        262,
        360,
        110
      ]
    },
    {
      "s": "Las valvas se abren y permanecen cerca de la pared del seno, sin pegarse a ella.",
      "c": [
        545,
        262,
        2.3
      ],
      "pt": [
        [
          545,
          212,
          "Hoja de la válvula"
        ],
        [
          545,
          312,
          ""
        ]
      ],
      "v": 0.45
    },
    {
      "s": "Cuando cambia el flujo y la relación de presiones, las valvas se aproximan.",
      "v": 0.45
    },
    {
      "s": "Los senos y el flujo local participan en el movimiento valvular.",
      "c": [
        570,
        232,
        3
      ],
      "pt": [
        [
          575,
          200,
          "Bolsillo"
        ]
      ]
    },
    {
      "s": "El cierre limita el regreso de sangre; el remolino no garantiza que la válvula permanezca sana.",
      "c": [
        560,
        262,
        2.2
      ],
      "pt": [
        [
          582,
          262,
          "Cierre"
        ]
      ]
    },
    {
      "s": "El recuadro inferior representa un registro Doppler esquemático.",
      "c": [
        725,
        520,
        1.9
      ],
      "sp": [
        725,
        524,
        270,
        80
      ],
      "v": 1
    },
    {
      "s": "Los colores distinguen los sentidos del flujo dentro de esta ilustración."
    },
    {
      "s": "La escena explica un mecanismo; sus tiempos no son una prueba diagnóstica.",
      "c": [
        500,
        300,
        1
      ]
    }
  ],
  "valvula-incompetente": [
    {
      "s": "Comience comparando unas valvas que se aproximan durante el cierre.",
      "a": [
        [
          "btn",
          "Válvula sana"
        ]
      ],
      "c": [
        545,
        262,
        2
      ],
      "pt": [
        [
          582,
          262,
          "Hojas juntas"
        ]
      ],
      "v": 0.5
    },
    {
      "s": "En este ejemplo, la dilatación modifica la relación entre pared y valvas.",
      "a": [
        [
          "anim",
          "Grado de incompetencia valvular",
          0.55,
          5
        ]
      ],
      "c": [
        520,
        262,
        1.3
      ]
    },
    {
      "s": "Los bordes dejan un espacio de coaptación incompleta.",
      "a": [
        [
          "anim",
          "Grado de incompetencia valvular",
          0.9,
          4
        ]
      ],
      "c": [
        545,
        262,
        2
      ]
    },
    {
      "s": "Por ese espacio se representa flujo hacia el extremo distal.",
      "c": [
        530,
        262,
        2.4
      ],
      "pt": [
        [
          533,
          262,
          "Hueco"
        ]
      ],
      "v": 0.45
    },
    {
      "s": "El color naranja identifica el flujo retrógrado, llamado reflujo.",
      "c": [
        420,
        262,
        1.6
      ],
      "sp": [
        420,
        262,
        380,
        120
      ],
      "pt": [
        [
          380,
          262,
          "Reflujo"
        ]
      ]
    },
    {
      "s": "El tiempo de flujo invertido se interpreta según la vena y la técnica de estudio.",
      "c": [
        725,
        520,
        1.9
      ],
      "sp": [
        725,
        524,
        270,
        80
      ],
      "v": 1
    },
    {
      "s": "El reflujo puede contribuir a mantener una presión venosa elevada durante la actividad.",
      "c": [
        300,
        262,
        1.3
      ]
    },
    {
      "s": "La dilatación y las várices tienen mecanismos diversos; esta transformación no predice su evolución.",
      "c": [
        500,
        300,
        1
      ]
    }
  ],
  "bomba-muscular": [
    {
      "s": "La pantorrilla participa en el retorno venoso mediante su actividad muscular.",
      "a": [
        [
          "seg",
          "Estado venoso",
          0
        ]
      ],
      "c": [
        460,
        330,
        1.15
      ]
    },
    {
      "s": "El corte distingue piel, tejido subcutáneo, fascia y músculo.",
      "pt": [
        [
          196,
          200,
          "Piel"
        ],
        [
          270,
          140,
          "Grasa"
        ],
        [
          360,
          250,
          "Fascia"
        ],
        [
          450,
          300,
          "Músculo"
        ]
      ]
    },
    {
      "s": "La contracción comprime las venas profundas del segmento ilustrado.",
      "c": [
        550,
        300,
        1.6
      ],
      "sp": [
        550,
        300,
        160,
        250
      ],
      "pt": [
        [
          550,
          300,
          "Vena profunda"
        ]
      ],
      "v": 0.6
    },
    {
      "s": "En la eyección, la válvula proximal abre y la distal limita el retorno hacia el pie.",
      "pt": [
        [
          550,
          170,
          "Abre"
        ],
        [
          550,
          440,
          "Cierra"
        ]
      ]
    },
    {
      "s": "Al relajarse el músculo, se representa el llenado desde distal y desde conexiones superficiales.",
      "c": [
        410,
        400,
        2
      ],
      "pt": [
        [
          410,
          410,
          "Perforante"
        ]
      ]
    },
    {
      "s": "La gráfica compara la tendencia de presión durante la marcha, sin dar una medición clínica.",
      "c": [
        870,
        240,
        1.9
      ],
      "sp": [
        880,
        230,
        140,
        150
      ],
      "v": 1
    },
    {
      "s": "Estar de pie sin moverse reduce la contribución de la bomba muscular.",
      "a": [
        [
          "btn",
          "Detenerse"
        ]
      ]
    },
    {
      "s": "Compare ahora el escenario con incompetencia valvular.",
      "a": [
        [
          "btn",
          "Caminar"
        ],
        [
          "seg",
          "Estado venoso",
          1
        ]
      ],
      "c": [
        460,
        330,
        1.15
      ]
    },
    {
      "s": "El dibujo muestra reflujo superficial y flujo saliente por una perforante incompetente.",
      "c": [
        340,
        340,
        1.7
      ],
      "pt": [
        [
          290,
          320,
          "Reflujo en safena"
        ],
        [
          400,
          400,
          "Sale hacia la piel"
        ]
      ],
      "v": 0.6
    },
    {
      "s": "La presión venosa elevada puede contribuir a molestias y cambios de los tejidos.",
      "c": [
        870,
        240,
        1.9
      ],
      "sp": [
        880,
        230,
        140,
        150
      ],
      "v": 1
    },
    {
      "s": "La actividad física y otras medidas se adaptan a la valoración y a la capacidad de cada persona.",
      "c": [
        500,
        300,
        1
      ]
    }
  ],
  "fascias": [
    {
      "s": "Observe un corte transversal simplificado de la pierna.",
      "a": [
        [
          "seg",
          "Estado",
          0
        ]
      ],
      "c": [
        500,
        300,
        1
      ]
    },
    {
      "s": "La piel y el tejido subcutáneo quedan por encima de la fascia muscular.",
      "pt": [
        [
          120,
          60,
          "Piel"
        ],
        [
          150,
          200,
          "Grasa"
        ],
        [
          150,
          450,
          "Músculo"
        ]
      ]
    },
    {
      "s": "Las fascias delimitan relaciones anatómicas entre tejidos y venas.",
      "c": [
        450,
        280,
        1.6
      ],
      "pt": [
        [
          330,
          215,
          "Fascia safena"
        ],
        [
          600,
          334,
          "Fascia muscular"
        ]
      ]
    },
    {
      "s": "La safena mayor discurre en su compartimento, reconocible en ecografía como el ojo safeno.",
      "c": [
        450,
        272,
        2.6
      ],
      "sp": [
        450,
        272,
        130,
        70
      ],
      "pt": [
        [
          450,
          272,
          "Safena"
        ]
      ]
    },
    {
      "s": "Bajo la fascia muscular se sitúan las venas profundas y estructuras arteriales.",
      "c": [
        432,
        480,
        2.4
      ],
      "pt": [
        [
          396,
          486,
          "Vena"
        ],
        [
          432,
          478,
          "Arteria"
        ]
      ]
    },
    {
      "s": "Una perforante atraviesa esa fascia y conecta los dos sistemas venosos.",
      "c": [
        445,
        380,
        2
      ],
      "pt": [
        [
          440,
          380,
          "Perforante"
        ]
      ],
      "v": 0.6
    },
    {
      "s": "Compare ahora un escenario con alteraciones venosas.",
      "a": [
        [
          "seg",
          "Estado",
          1
        ]
      ],
      "c": [
        500,
        300,
        1
      ],
      "v": 1
    },
    {
      "s": "La safena también puede dilatarse a pesar de estar en su compartimento.",
      "c": [
        450,
        272,
        2.4
      ],
      "pt": [
        [
          450,
          272,
          "Safena"
        ]
      ]
    },
    {
      "s": "Las tributarias extrafasciales pueden presentar dilatación y tortuosidad.",
      "c": [
        775,
        160,
        2.2
      ],
      "pt": [
        [
          780,
          165,
          "Rama varicosa"
        ]
      ]
    },
    {
      "s": "El flujo saliente por una perforante puede coexistir con cambios tisulares; el dibujo no demuestra una causa única.",
      "c": [
        500,
        250,
        1.3
      ],
      "pt": [
        [
          440,
          380,
          "Flujo invertido"
        ],
        [
          700,
          75,
          "Arañitas y manchas"
        ]
      ]
    }
  ],
  "compartimentos-3d": [
    {
      "s": "Este bloque anatómico relaciona tejidos y venas del miembro inferior.",
      "a": [
        [
          "seg",
          "Resaltar",
          0
        ],
        [
          "tg",
          "Insuficiencia venosa",
          false
        ],
        [
          "sl",
          "Separación de capas",
          0
        ]
      ],
      "c": {
        "p": [
          6.6,
          5.6,
          9.4
        ],
        "t": [
          0,
          0.3,
          0
        ]
      }
    },
    {
      "s": "Separe las capas para observar sus conexiones.",
      "a": [
        [
          "anim",
          "Separación de capas",
          0.8,
          3
        ]
      ],
      "c": {
        "p": [
          8,
          6.5,
          11
        ],
        "t": [
          0,
          1.2,
          0
        ]
      }
    },
    {
      "s": "La piel contiene una red vascular pequeña, muy ampliada en esta representación.",
      "c": {
        "p": [
          3,
          7.5,
          6
        ],
        "t": [
          -1,
          4.2,
          0
        ]
      },
      "pt": [
        [
          -2,
          4.15,
          0.2,
          "Piel y arañitas"
        ]
      ]
    },
    {
      "s": "El tejido subcutáneo aloja tributarias superficiales.",
      "c": {
        "p": [
          3,
          5,
          7
        ],
        "t": [
          -0.5,
          2.5,
          1.5
        ]
      },
      "pt": [
        [
          -1,
          2.52,
          2.32,
          "Rama superficial"
        ]
      ]
    },
    {
      "s": "La safena mayor se muestra dentro de su compartimento.",
      "c": {
        "p": [
          3,
          3.5,
          7
        ],
        "t": [
          -1,
          1.2,
          0.8
        ]
      },
      "pt": [
        [
          -2,
          1.25,
          0.8,
          "Vena safena"
        ]
      ]
    },
    {
      "s": "Las venas profundas están bajo la fascia muscular, próximas a estructuras arteriales.",
      "c": {
        "p": [
          2,
          0.5,
          7.5
        ],
        "t": [
          -1,
          -0.9,
          -1
        ]
      },
      "pt": [
        [
          -2,
          -0.9,
          -1,
          "Vena profunda y arteria"
        ]
      ]
    },
    {
      "s": "Las comunicantes unen venas del mismo sistema sin atravesar la fascia muscular.",
      "a": [
        [
          "seg",
          "Resaltar",
          1
        ]
      ],
      "c": {
        "p": [
          6,
          4.5,
          8
        ],
        "t": [
          0.5,
          1.5,
          0.5
        ]
      },
      "pt": [
        [
          1.1,
          1.56,
          1.25,
          "Comunicante"
        ]
      ]
    },
    {
      "s": "Las perforantes cruzan esa fascia y conectan los sistemas superficial y profundo.",
      "a": [
        [
          "seg",
          "Resaltar",
          2
        ]
      ],
      "c": {
        "p": [
          7,
          3,
          7
        ],
        "t": [
          1.5,
          0,
          0
        ]
      },
      "pt": [
        [
          2.6,
          0.43,
          0.2,
          "Perforante"
        ]
      ]
    },
    {
      "s": "El ejemplo representa válvulas y flujo predominante hacia el sistema profundo."
    },
    {
      "s": "La comparación con incompetencia muestra una posible alteración del flujo, no una evolución obligatoria.",
      "a": [
        [
          "seg",
          "Resaltar",
          0
        ],
        [
          "tg",
          "Insuficiencia venosa",
          true
        ]
      ],
      "c": {
        "p": [
          8,
          6.5,
          11
        ],
        "t": [
          0,
          1.2,
          0
        ]
      }
    },
    {
      "s": "La anatomía se completa con la exploración clínica y el estudio dúplex cuando está indicado.",
      "a": [
        [
          "anim",
          "Separación de capas",
          0,
          3
        ]
      ],
      "c": {
        "p": [
          6.6,
          5.6,
          9.4
        ],
        "t": [
          0,
          0.3,
          0
        ]
      }
    }
  ],
  "union-safenofemoral": [
    {
      "s": "Este esquema sitúa la unión venosa cerca de la ingle.",
      "a": [
        [
          "seg",
          "Estado de la unión",
          0
        ]
      ],
      "c": [
        500,
        300,
        1
      ]
    },
    {
      "s": "La safena mayor desemboca en la vena femoral común, que es profunda.",
      "c": [
        560,
        330,
        1.4
      ],
      "pt": [
        [
          450,
          450,
          "Vena safena"
        ],
        [
          610,
          480,
          "Vena femoral común"
        ]
      ]
    },
    {
      "s": "Se representan las válvulas terminal y preterminal; su anatomía puede variar.",
      "c": [
        560,
        285,
        2.4
      ],
      "pt": [
        [
          569,
          271,
          "Puerta"
        ],
        [
          521,
          309,
          "Respaldo"
        ]
      ]
    },
    {
      "s": "La maniobra de Valsalva modifica las presiones durante el estudio dúplex.",
      "a": [
        [
          "btn",
          "Maniobra de Valsalva"
        ]
      ],
      "c": [
        590,
        230,
        1.4
      ],
      "pt": [
        [
          610,
          70,
          "Presión del abdomen"
        ]
      ]
    },
    {
      "s": "Compare la respuesta del flujo con el cierre valvular conservado.",
      "c": [
        560,
        285,
        2.4
      ],
      "pt": [
        [
          569,
          271,
          "Cerrada"
        ]
      ],
      "v": 0.7
    },
    {
      "s": "Ahora se ilustra una unión con incompetencia.",
      "a": [
        [
          "seg",
          "Estado de la unión",
          1
        ]
      ],
      "c": [
        500,
        300,
        1
      ],
      "v": 1
    },
    {
      "s": "La presión puede acompañarse de flujo retrógrado hacia la safena.",
      "a": [
        [
          "btn",
          "Maniobra de Valsalva"
        ]
      ],
      "c": [
        520,
        360,
        1.6
      ],
      "pt": [
        [
          470,
          400,
          "Reflujo"
        ]
      ],
      "v": 0.8
    },
    {
      "s": "El registro es esquemático; los umbrales dependen del segmento explorado.",
      "c": [
        184,
        490,
        2
      ],
      "sp": [
        184,
        490,
        170,
        95
      ],
      "v": 1
    },
    {
      "s": "La compresión distal y su liberación son otras maniobras del estudio venoso.",
      "a": [
        [
          "btn",
          "Compresión distal"
        ]
      ],
      "c": [
        420,
        420,
        1.3
      ]
    },
    {
      "s": "El diagnóstico y la planificación requieren integrar el mapa completo y la situación clínica.",
      "c": [
        500,
        300,
        1
      ]
    }
  ],
  "progresion-varice": [
    {
      "s": "Este modelo compara distintas formas de una vena superficial.",
      "a": [
        [
          "tg",
          "Mostrar piel",
          false
        ],
        [
          "sl",
          "Deformación ilustrada",
          0.05
        ]
      ],
      "c": {
        "p": [
          5.5,
          1.2,
          8.5
        ],
        "t": [
          0.3,
          0,
          -0.6
        ]
      }
    },
    {
      "s": "Los elementos valvulares y el flujo están ampliados para reconocerlos.",
      "c": {
        "p": [
          2.2,
          1.4,
          4.2
        ],
        "t": [
          0,
          0.6,
          0.3
        ]
      },
      "pt": [
        [
          0,
          0.72,
          0.4,
          "Válvula"
        ]
      ]
    },
    {
      "s": "El control aumenta la dilatación como una transformación didáctica.",
      "a": [
        [
          "anim",
          "Deformación ilustrada",
          0.35,
          5
        ]
      ],
      "c": {
        "p": [
          5.5,
          1.2,
          8.5
        ],
        "t": [
          0.3,
          0,
          -0.6
        ]
      }
    },
    {
      "s": "También modifica la longitud y la tortuosidad de la geometría.",
      "a": [
        [
          "anim",
          "Deformación ilustrada",
          0.65,
          6
        ]
      ]
    },
    {
      "s": "Se representa una posible coaptación incompleta y flujo retrógrado.",
      "c": {
        "p": [
          3,
          1.5,
          4.5
        ],
        "t": [
          0.4,
          0.6,
          0.3
        ]
      },
      "pt": [
        [
          0.45,
          0.72,
          0.4,
          "Válvula dañada"
        ]
      ],
      "v": 0.7
    },
    {
      "s": "Las várices se definen como venas subcutáneas dilatadas de al menos tres milímetros en bipedestación.",
      "a": [
        [
          "anim",
          "Deformación ilustrada",
          0.95,
          5
        ],
        [
          "tg",
          "Mostrar piel",
          true
        ]
      ],
      "c": {
        "p": [
          6,
          2,
          9.5
        ],
        "t": [
          0.3,
          0,
          -0.3
        ]
      },
      "v": 1
    },
    {
      "s": "La fascia y la vena profunda permiten reconocer el contexto anatómico.",
      "a": [
        [
          "tg",
          "Mostrar piel",
          false
        ]
      ],
      "c": {
        "p": [
          7,
          3,
          3
        ],
        "t": [
          1.4,
          0,
          -2
        ]
      },
      "pt": [
        [
          2.2,
          -2,
          -2.6,
          "Vena profunda"
        ]
      ]
    },
    {
      "s": "La comparación no predice progresión ni decide tratamiento; cada caso requiere valoración.",
      "c": {
        "p": [
          5.5,
          1.2,
          8.5
        ],
        "t": [
          0.3,
          0,
          -0.6
        ]
      }
    }
  ],
  "microcirculacion": [
    {
      "s": "Esta es una representación ampliada de los vasos pequeños de la piel.",
      "a": [
        [
          "btn",
          "Restablecer"
        ]
      ],
      "c": [
        500,
        300,
        1
      ]
    },
    {
      "s": "El intercambio microvascular permite relacionar la sangre con el tejido.",
      "c": [
        480,
        225,
        1.7
      ],
      "pt": [
        [
          480,
          225,
          "Capilar"
        ]
      ]
    },
    {
      "s": "Parte del líquido se filtra hacia el espacio intersticial.",
      "pt": [
        [
          320,
          175,
          "Filtración al intersticio"
        ]
      ]
    },
    {
      "s": "El transporte linfático contribuye al retorno del líquido; no es solamente una vía para un sobrante mínimo.",
      "c": [
        580,
        400,
        1.6
      ],
      "pt": [
        [
          600,
          420,
          "Vaso linfático"
        ]
      ]
    },
    {
      "s": "La hipertensión venosa puede modificar la filtración y la barrera vascular.",
      "a": [
        [
          "anim",
          "Presión venosa",
          70,
          4
        ]
      ],
      "c": [
        800,
        225,
        1.7
      ],
      "pt": [
        [
          860,
          225,
          "Presión alta"
        ]
      ]
    },
    {
      "s": "Si la filtración supera la capacidad de drenaje, aumenta el líquido intersticial.",
      "c": [
        600,
        280,
        1.3
      ],
      "sp": [
        600,
        300,
        400,
        170
      ]
    },
    {
      "s": "La extravasación de eritrocitos y el depósito de hemosiderina pueden producir pigmentación.",
      "a": [
        [
          "btn",
          "Comparar hipertensión"
        ]
      ],
      "c": [
        850,
        250,
        2
      ],
      "pt": [
        [
          850,
          300,
          "Hierro: manchas"
        ]
      ]
    },
    {
      "s": "La activación inflamatoria también participa en las alteraciones de los tejidos.",
      "c": [
        850,
        225,
        2.4
      ],
      "pt": [
        [
          860,
          205,
          "Glóbulo blanco"
        ]
      ]
    },
    {
      "s": "La lesión cutánea tiene mecanismos múltiples; un manguito de fibrina no explica por sí solo una úlcera.",
      "c": [
        700,
        225,
        1.6
      ],
      "pt": [
        [
          800,
          262,
          "Fibrina pericapilar: un mecanismo propuesto"
        ]
      ]
    },
    {
      "s": "Los colores y la aceleración comparan mecanismos, sin equivaler a años ni calcular daño de una persona.",
      "c": [
        500,
        300,
        1
      ]
    }
  ],
  "escleroterapia": [
    {
      "s": "La escleroterapia busca cerrar una vena seleccionada mediante un medicamento esclerosante.",
      "a": [
        [
          "seg",
          "Tipo de vena",
          2
        ],
        [
          "seg",
          "Agente",
          1
        ],
        [
          "sl",
          "Intensidad del efecto",
          1
        ],
        [
          "tg",
          "Mostrar compresión",
          true
        ],
        [
          "tg",
          "Simular extravasación",
          false
        ],
        [
          "seg",
          "Paso",
          0
        ]
      ],
      "c": [
        500,
        300,
        1
      ]
    },
    {
      "s": "El corte muestra una vena y los tejidos que la rodean.",
      "c": [
        520,
        250,
        1.4
      ],
      "pt": [
        [
          640,
          310,
          "Vena"
        ],
        [
          880,
          86,
          "Piel"
        ]
      ]
    },
    {
      "s": "La punción se representa dentro de la luz, sin enseñar una técnica de aplicación.",
      "a": [
        [
          "seg",
          "Paso",
          1
        ]
      ],
      "c": [
        400,
        230,
        1.6
      ],
      "pt": [
        [
          340,
          190,
          "Aguja"
        ]
      ]
    },
    {
      "s": "El ejemplo muestra un esclerosante detergente en forma de espuma.",
      "a": [
        [
          "seg",
          "Paso",
          2
        ]
      ],
      "c": [
        560,
        310,
        1.7
      ]
    },
    {
      "s": "La espuma desplaza parte de la sangre y facilita el contacto con la pared.",
      "c": [
        650,
        310,
        2.4
      ],
      "pt": [
        [
          650,
          310,
          "Espuma"
        ]
      ]
    },
    {
      "s": "La lesión endotelial y la respuesta local pueden favorecer el cierre venoso.",
      "a": [
        [
          "seg",
          "Paso",
          3
        ]
      ],
      "c": [
        600,
        290,
        2.6
      ],
      "pt": [
        [
          600,
          276,
          "Pared irritada"
        ]
      ]
    },
    {
      "s": "La compresión posterior se decide según el procedimiento y la situación clínica.",
      "a": [
        [
          "seg",
          "Paso",
          4
        ]
      ],
      "c": [
        590,
        200,
        1.4
      ],
      "pt": [
        [
          595,
          60,
          "Compresión"
        ]
      ]
    },
    {
      "s": "Los cuidados y la actividad después del tratamiento se individualizan."
    },
    {
      "s": "Con el tiempo puede desarrollarse fibrosis, aunque también puede haber recanalización.",
      "a": [
        [
          "seg",
          "Paso",
          5
        ]
      ],
      "c": [
        560,
        330,
        1.5
      ]
    },
    {
      "s": "La vista de la piel es una comparación conceptual, sin prometer desaparición.",
      "c": [
        140,
        434,
        2.6
      ]
    },
    {
      "s": "El esclerosante líquido se mezcla con la sangre y su actividad cambia al contactar con proteínas.",
      "a": [
        [
          "seg",
          "Agente",
          0
        ],
        [
          "seg",
          "Paso",
          2
        ]
      ],
      "c": [
        817,
        434,
        2.3
      ],
      "sp": [
        817,
        434,
        175,
        62
      ]
    },
    {
      "s": "La espuma también se mezcla y pierde actividad; no elimina los riesgos del procedimiento.",
      "a": [
        [
          "seg",
          "Agente",
          1
        ],
        [
          "seg",
          "Paso",
          2
        ]
      ]
    },
    {
      "s": "La intensidad de este control no representa una concentración ni una dosis clínica.",
      "a": [
        [
          "sl",
          "Intensidad del efecto",
          3
        ],
        [
          "seg",
          "Paso",
          3
        ]
      ],
      "c": [
        459,
        434,
        2.3
      ],
      "sp": [
        459,
        434,
        190,
        62
      ]
    },
    {
      "s": "Una lesión excesiva puede acompañarse de inflamación o daño de los tejidos.",
      "c": [
        600,
        300,
        1.6
      ],
      "pt": [
        [
          600,
          252,
          "Inflamación"
        ]
      ]
    },
    {
      "s": "La indicación y todos los parámetros de tratamiento requieren valoración y seguimiento profesional.",
      "a": [
        [
          "sl",
          "Intensidad del efecto",
          1
        ]
      ],
      "c": [
        459,
        434,
        2.3
      ],
      "sp": [
        459,
        434,
        190,
        62
      ]
    }
  ],
  "trombosis-venosa-profunda": [
    {
      "s": "Una trombosis venosa profunda es un coágulo dentro de una vena profunda.",
      "a": [
        [
          "tg",
          "Anticoagulación",
          false
        ],
        [
          "btn",
          "Reiniciar"
        ],
        [
          "btn",
          "Viaje largo"
        ]
      ],
      "c": [
        500,
        215,
        1.2
      ]
    },
    {
      "s": "El seno valvular es uno de los lugares donde puede iniciarse, pero no es el único.",
      "c": [
        490,
        200,
        2.4
      ],
      "pt": [
        [
          490,
          170,
          "Bolsillo de la válvula"
        ]
      ]
    },
    {
      "s": "La tríada de Virchow agrupa mecanismos; no exige que estén los tres presentes.",
      "c": [
        456,
        478,
        2
      ],
      "sp": [
        456,
        478,
        150,
        105
      ]
    },
    {
      "s": "La inmovilidad prolongada puede contribuir al riesgo, que varía entre personas."
    },
    {
      "s": "La cirugía es otro contexto en el que pueden coexistir varios factores.",
      "a": [
        [
          "btn",
          "Posoperatorio de cadera"
        ]
      ]
    },
    {
      "s": "La activación de la coagulación y de células sanguíneas participa en la formación del trombo.",
      "c": [
        490,
        190,
        2.6
      ],
      "pt": [
        [
          480,
          170,
          "Glóbulos blancos y plaquetas"
        ]
      ],
      "v": 2
    },
    {
      "s": "El trombo puede extenderse; esta secuencia no predice su velocidad ni su evolución.",
      "c": [
        650,
        215,
        1.4
      ],
      "pt": [
        [
          650,
          190,
          "Coágulo"
        ]
      ],
      "v": 2.5
    },
    {
      "s": "La compresibilidad es parte del estudio ecográfico y se interpreta junto con otros hallazgos.",
      "c": [
        160,
        478,
        2.3
      ],
      "sp": [
        160,
        478,
        145,
        110
      ],
      "v": 1.5
    },
    {
      "s": "Un fragmento puede viajar a las arterias pulmonares y causar embolia pulmonar.",
      "a": [
        [
          "btn",
          "Simular desprendimiento"
        ]
      ],
      "c": [
        700,
        215,
        1.3
      ],
      "v": 1
    },
    {
      "s": "La anticoagulación reduce extensión y embolia, sin eliminar el riesgo ni disolver directamente el coágulo.",
      "a": [
        [
          "tg",
          "Anticoagulación",
          true
        ]
      ],
      "c": [
        600,
        215,
        1.6
      ],
      "pt": [
        [
          600,
          190,
          "Menor tendencia a extensión"
        ]
      ],
      "v": 2
    },
    {
      "s": "Ante falta de aire, dolor torácico o desmayo se necesita atención urgente.",
      "c": [
        500,
        300,
        1
      ],
      "v": 1
    }
  ],
  "sindrome-postrombotico": [
    {
      "s": "El síndrome postrombótico puede aparecer después de una trombosis, pero no ocurre en todas las personas.",
      "a": [
        [
          "btn",
          "Pausar evolución"
        ],
        [
          "sl",
          "Grado de recanalización",
          0.6
        ],
        [
          "tg",
          "Representar daño valvular",
          true
        ],
        [
          "tg",
          "TVP iliofemoral",
          false
        ],
        [
          "tg",
          "Compresión elástica",
          false
        ],
        [
          "sl",
          "Etapa didáctica tras TVP",
          0.2
        ]
      ],
      "c": [
        500,
        300,
        1
      ]
    },
    {
      "s": "Al inicio se representa un trombo que reduce el paso de sangre.",
      "c": [
        500,
        215,
        1.4
      ],
      "pt": [
        [
          500,
          215,
          "Coágulo"
        ]
      ]
    },
    {
      "s": "Durante la resolución pueden coexistir reducción del trombo y organización fibrosa.",
      "a": [
        [
          "anim",
          "Etapa didáctica tras TVP",
          5,
          6
        ]
      ],
      "c": [
        500,
        215,
        1.6
      ]
    },
    {
      "s": "El tejido fibroso y los pequeños vasos forman parte de esa respuesta variable.",
      "c": [
        560,
        215,
        2.4
      ],
      "pt": [
        [
          560,
          215,
          "Cicatriz"
        ]
      ]
    },
    {
      "s": "La recanalización permite recuperar parte del paso a través de la vena.",
      "a": [
        [
          "anim",
          "Etapa didáctica tras TVP",
          14,
          7
        ]
      ],
      "c": [
        600,
        215,
        1.8
      ],
      "pt": [
        [
          640,
          245,
          "Canales"
        ]
      ]
    },
    {
      "s": "Pueden quedar bandas fibrosas y alteraciones de las válvulas; no es inevitable.",
      "c": [
        400,
        215,
        2.4
      ],
      "pt": [
        [
          398,
          165,
          "Válvula dañada"
        ]
      ]
    },
    {
      "s": "Si existe incompetencia, parte del flujo puede regresar.",
      "c": [
        500,
        215,
        1.3
      ],
      "v": 0.7
    },
    {
      "s": "La obstrucción o el reflujo pueden contribuir a molestias y cambios de la piel.",
      "a": [
        [
          "anim",
          "Etapa didáctica tras TVP",
          24,
          6
        ]
      ],
      "c": [
        170,
        465,
        2.2
      ],
      "sp": [
        170,
        465,
        155,
        125
      ],
      "v": 1
    },
    {
      "s": "La escala de Villalta requiere síntomas y exploración; esta escena no calcula un diagnóstico.",
      "c": [
        657,
        465,
        1.5
      ],
      "sp": [
        657,
        465,
        330,
        125
      ]
    },
    {
      "s": "El manejo se adapta a cada persona y puede incluir actividad, cuidados y compresión cuando esté indicada.",
      "a": [
        [
          "tg",
          "Compresión elástica",
          true
        ]
      ],
      "c": [
        500,
        300,
        1
      ]
    }
  ]
};
let VOICE=null;const HAS_TTS='speechSynthesis' in window;
function loadVoice(){try{const vs=speechSynthesis.getVoices();VOICE=vs.find(v=>/es[-_]MX/i.test(v.lang))||vs.find(v=>/es[-_](US|419)/i.test(v.lang))||vs.find(v=>/^es/i.test(v.lang))||null}catch(e){}}
if(HAS_TTS){loadVoice();try{speechSynthesis.onvoiceschanged=loadVoice}catch(e){}}
const AUDIO={},AUDIO_DIR='audio/';
let vid=null;const VC={x:500,y:300,z:1},VCT={x:500,y:300,z:1};let vSpot=null,vSpotA=0,vSpotLast=null,vPts=[];
function vSlider(l){const c=[...$('#vControls').querySelectorAll('.ctl')].find(c=>{const lb=c.querySelector('label');return lb&&lb.textContent.startsWith(l)});return c&&c.querySelector('input[type=range]')}
function vAct(a){const root=$('#vControls'),[k,l,v,d]=a;
  if(k==='btn'){const b=[...root.querySelectorAll('.btnrow button')].find(b=>b.textContent.startsWith(l));if(b)b.click()}
  else if(k==='seg'){const c=[...root.querySelectorAll('.ctl')].find(c=>c.querySelector('.seg')&&c.firstChild.textContent.startsWith(l));const b=c&&c.querySelectorAll('.seg button')[v];if(b)b.click()}
  else if(k==='sl'){const i=vSlider(l);if(i){i.value=v;i.dispatchEvent(new Event('input'))}}
  else if(k==='anim'){const i=vSlider(l);if(i&&vid)vid.tw.push({i,from:+i.value,to:v,dur:d,t:0})}
  else if(k==='tg'){const c=[...root.querySelectorAll('label.ctl-h')].find(c=>c.firstChild.textContent.startsWith(l));const i=c&&c.querySelector('input');if(i&&i.checked!==v){i.checked=v;i.dispatchEvent(new Event('change'))}}}
function vTick(dt){if(!vid)return;vid.elapsed=(vid.elapsed||0)+(state.playing?dt*state.speed:0);vAudioTick();for(const w of vid.tw){if(w.t>=w.dur)continue;w.t=Math.min(w.dur,w.t+dt*state.speed*(state.playing?1:0));w.i.value=lerp(w.from,w.to,smooth(w.t/w.dur));w.i.dispatchEvent(new Event('input'))}vid.tw=vid.tw.filter(w=>w.t<w.dur)}
function vCam2D(ctx,dt){const k=Math.min(1,dt*2.2);VC.x+=(VCT.x-VC.x)*k;VC.y+=(VCT.y-VC.y)*k;VC.z+=(VCT.z-VC.z)*k;ctx.translate(500,300);ctx.scale(VC.z,VC.z);ctx.translate(-VC.x,-VC.y)}
function vOverlay2D(ctx,dt){vSpotA+=((vSpot?1:0)-vSpotA)*Math.min(1,dt*3);const z=VC.z;
  if(vSpotA>0.01&&vSpotLast){const [x,y,rx,ry]=vSpotLast;ctx.save();ctx.fillStyle=`rgba(4,8,12,${0.62*vSpotA})`;ctx.beginPath();ctx.rect(-3000,-3000,7000,7000);ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fill('evenodd');ctx.restore()}
  const tt=vid?vid.elapsed||0:0,right=VC.x+500/z;
  for(const [x,y,txt] of vPts){ctx.save();ctx.strokeStyle='#ffd166';ctx.lineWidth=3/z;ctx.beginPath();ctx.arc(x,y,(15+4*Math.sin(tt*5))/z,0,TAU);ctx.stroke();
    if(txt){ctx.font=`600 ${18/z}px ${FONT}`;const w=ctx.measureText(txt).width;let px=x+24/z;if(px+w+10/z>right)px=x-24/z-w;const py=y-26/z;
      ctx.fillStyle='rgba(8,12,16,.9)';ctx.fillRect(px-7/z,py-15/z,w+14/z,28/z);ctx.fillStyle='#ffd166';ctx.textBaseline='middle';ctx.textAlign='left';ctx.fillText(txt,px,py+1/z)}
    ctx.restore()}}
function vCam3D(dt){const s=cur&&cur.sim;if(!s||!s.cam||!vid||!vid.c3p)return;const k=Math.min(1,dt*1.5);s.cam.position.lerp(vid.c3p,k);s.ctrl.target.lerp(vid.c3t,k)}
function vPts3D(){const s=cur&&cur.sim;if(!s||!s.cam||!vid)return;const host=$('#stageHost'),w=host.clientWidth,h=host.clientHeight;
  for(const e of vid.ptEls){const v=new THREE.Vector3(e.p[0],e.p[1],e.p[2]).project(s.cam);e.d.hidden=v.z>1;e.d.style.transform=`translate(${(v.x+1)/2*w}px,${(1-v.y)/2*h}px)`}}
function vSetPts(pts){vPts=pts||[];if(!vid)return;vid.ptEls.forEach(e=>e.d.remove());vid.ptEls=[];
  if(cur&&cur.m.kind==='3d'){const host=$('#stageHost');for(const p of vPts){const d=document.createElement('div');d.className='vpt';d.innerHTML='<i></i><span></span>';d.lastChild.textContent=p[3];host.appendChild(d);vid.ptEls.push({d,p})}}}
function showSub(t){const s=$('#vSubs');s.textContent=t;s.hidden=!t}
function updBar(){if(vid)$('#vProg').firstChild.style.width=Math.min(100,vid.spoken/vid.total*100)+'%'}
function setVideoBtn(){const b=$('#vVideo'),completed=cur&&$('#viewer').dataset.narrationResult==='completed'&&$('#viewer').dataset.narrationLast===cur.m.id;b.textContent=vid?'■ Volver a explorar':completed?'▶ Repetir explicación':'▶ Explicación narrada';b.setAttribute('aria-pressed',!!vid)}
function card(title,sub,ms){const c=$('#vCard');c.querySelector('h3').textContent=title;c.querySelector('p').textContent=sub;c.hidden=false;c.classList.remove('out');clearTimeout(card.t);card.t=setTimeout(()=>{c.classList.add('out');card.hide=setTimeout(()=>{c.hidden=true},500)},ms)}
function stopVideo(){clearTimeout(card.t);clearTimeout(card.hide);$('#vCard').hidden=true;$('#vAudio').hidden=true;const was=vid;if(was){clearTimeout(was.timer);was.ptEls.forEach(e=>e.d.remove());state.labels=was.prevLabels;$('#vLabels').setAttribute('aria-pressed',state.labels);
    if(was.audio){try{was.audio.onended=was.audio.onerror=null;was.audio.pause();was.audio.removeAttribute('src');was.audio.load();was.audio.remove()}catch(e){}}}
  vid=null;if(cur?.sim?.ctrl)cur.sim.ctrl.enabled=true;if(HAS_TTS)try{speechSynthesis.cancel()}catch(e){}showSub('');$('#vProg').hidden=true;$('#viewer').classList.remove('video');
  VCT.x=VC.x=500;VCT.y=VC.y=300;VCT.z=VC.z=1;vSpot=vSpotLast=null;vSpotA=0;vPts=[];setVideoBtn()}
function startVideo(playlist){if(!cur||!cur.sim)return;const m=MODS[cur.i],sc=VIDEOS[m.id];if(!sc)return;stopVideo();if(cur.sim.ctrl)cur.sim.ctrl.enabled=false;$('#structureDetail').hidden=true;
  $('#viewer').dataset.narrationResult='playing';$('#viewer').dataset.narrationLast=m.id;$('#viewer').dataset.narrationScenes='0';
  cur.sim.isolatePart?.(false);cur.sim.selectPart?.(null);cur.sim.setExplode?.(0);state.playing=true;state.speed=1;$('#viewer').classList.remove('paused');$('#vSpeed').value=1;$('#vPlay').textContent='Pausa';$('#vPlay').setAttribute('aria-pressed',true);
  const total=sc.reduce((n,c)=>n+c.s.split(/\s+/).length,0);
  vid={id:m.id,sc,si:-1,playlist,total,spoken:0,timer:0,tw:[],ptEls:[],c3p:null,c3t:null,prevLabels:state.labels,audio:null,started:false,ci:-1,sk:-1};
  state.labels=false;$('#vLabels').setAttribute('aria-pressed',false);$('#viewer').classList.add('video');$('#vProg').hidden=false;updBar();setVideoBtn();
  const tok=vid,man=AUDIO[m.id];
  if(man){const a=new Audio(AUDIO_DIR+m.id+'.mp3'+(man.version?'?v='+man.version:''));a.preload='none';a.hidden=true;$('#stageHost').appendChild(a);tok.audio=a;tok.man=man;a.onended=()=>{if(vid===tok)endVideo(tok)};a.onerror=()=>{if(vid===tok){a.pause();a.remove();tok.audio=null;$('#vAudio').hidden=true;nextScene(tok)}}}
  else if(HAS_TTS&&!VOICE)loadVoice();
  card(m.title,'Explicación para pacientes · '+(cur.i+1)+' de '+MODS.length,1500);
  if(sc[0].a)sc[0].a.forEach(a=>{try{vAct(a)}catch(e){}});
  if(tok.audio)playNarration(tok);else nextScene(tok);
}
function playNarration(tok){
  if(vid!==tok||!tok.audio)return;
  tok.audio.play().then(()=>{if(vid===tok){tok.started=true;$('#vAudio').hidden=true}}).catch(()=>{if(vid===tok)$('#vAudio').hidden=false});
}
$('#vAudio').onclick=()=>{if(vid){state.playing=true;$('#viewer').classList.remove('paused');$('#vPlay').textContent='Pausa';$('#vPlay').setAttribute('aria-pressed','true');playNarration(vid)}};
/* sincronía con el audio grabado: la toma y el subtítulo se eligen por el tiempo de reproducción */
function vAudioTick(){const tok=vid;if(!tok||!tok.audio||!tok.started)return;const a=tok.audio;
  if(!state.playing&&!a.paused)a.pause();
  const t=a.currentTime,cs=tok.man.cues;let ci=0;while(ci+1<cs.length&&cs[ci+1].t<=t)ci++;
  if(ci!==tok.ci){tok.ci=ci;tok.si=ci;applyCue(tok,ci)}
  const ss=cs[ci].s,sents=tok.sc[ci].s.split(/(?<=[.!?])\s+/);let sk=0;while(sk+1<ss.length&&ss[sk+1]<=t)sk++;
  if(ci*100+sk!==tok.sk){tok.sk=ci*100+sk;showSub(sents[Math.min(sk,sents.length-1)])}
  $('#vProg').firstChild.style.width=Math.min(100,t/tok.man.dur*100)+'%'}
function applyCue(tok,i){const cue=tok.sc[i];(i>0&&cue.a?cue.a:[]).forEach(a=>{try{vAct(a)}catch(e){console.error(e)}});
  if(cue.c){if(Array.isArray(cue.c)){VCT.x=cue.c[0];VCT.y=cue.c[1];VCT.z=cue.c[2]}else if(window.THREE){tok.c3p=new THREE.Vector3(...cue.c.p);tok.c3t=new THREE.Vector3(...cue.c.t)}}
  if(cue.sp){vSpot=vSpotLast=cue.sp}else if(cue.c)vSpot=null;
  vSetPts(cue.pt);if(cue.v)tok.simulationSpeed=cue.v}
function endVideo(tok){$('#viewer').dataset.narrationResult='completed';$('#viewer').dataset.narrationLast=tok.id;$('#viewer').dataset.narrationScenes=String(tok.audio?tok.ci+1:tok.si);$('#viewer').dataset.narrationDuration=String(tok.audio?.currentTime||0);const pl=tok.playlist,i=cur?cur.i:-1,sequence=Array.isArray(pl)?pl:MODS.map((m,index)=>index),position=sequence.indexOf(i),next=sequence[position+1];showSub('');
  if(pl&&position>=0&&next!==undefined){card('Siguiente: '+MODS[next].title,'',1500);tok.timer=setTimeout(()=>{if(vid!==tok)return;stopVideo();openMod(next).then(ok=>{if(ok)startVideo(sequence)})},1600)}
  else{card('Fin','Pregunte a su médico cualquier duda',2600);tok.timer=setTimeout(()=>{if(vid===tok)stopVideo()},2800)}}
/* respaldo sin audio grabado: voz del navegador o solo subtítulos */
function nextScene(tok){if(vid!==tok)return;tok.si++;
  if(tok.si>=tok.sc.length){endVideo(tok);return}
  applyCue(tok,tok.si);const sents=tok.sc[tok.si].s.split(/(?<=[.!?])\s+/);let k=0;
  const next=()=>{if(vid!==tok)return;if(k>=sents.length){tok.timer=setTimeout(()=>nextScene(tok),500);return}
    const s=sents[k++],words=s.split(/\s+/).length;showSub(s);let fin=false;
    const go=()=>{if(fin||vid!==tok)return;if(!state.playing){tok.timer=setTimeout(go,400);return}fin=true;clearTimeout(tok.timer);tok.spoken+=words;updBar();setTimeout(next,250)};
    if(HAS_TTS&&VOICE){try{const u=new SpeechSynthesisUtterance(s);u.lang=VOICE.lang;u.voice=VOICE;u.rate=0.93;u.onend=go;u.onerror=go;speechSynthesis.speak(u)}catch(e){}tok.timer=setTimeout(go,words*700+4000)}
    else tok.timer=setTimeout(go,words*400+900)};
  next()}
$('#vVideo').onclick=()=>{if(vid)stopVideo();else startVideo(false)};
$('#playAll').onclick=()=>{openMod(0).then(ok=>{if(ok)startVideo(true)})};
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){cancelAnimationFrame(raf);if(vid&&vid.audio)vid.audio.pause();if(HAS_TTS&&vid)speechSynthesis.pause()}
  else if(cur&&cur.sim){lastTs=0;raf=requestAnimationFrame(loop);if(state.playing&&vid&&vid.audio)playNarration(vid);if(HAS_TTS&&vid&&state.playing)speechSynthesis.resume()}
});
document.addEventListener('keydown',e=>{
  if(!cur||e.key!=='Tab')return;
  const list=[...$('#viewer').querySelectorAll('button,input,a[href]')].filter(el=>!el.disabled&&el.getClientRects().length);
  const first=list[0],last=list[list.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
});
EXTENSION_MODULES.forEach(m=>{m.new3d=true});MODS.push(...EXTENSION_MODULES);Object.assign(VIDEOS,EXTENSION_VIDEOS);Object.assign(AUDIO,EXTENSION_AUDIO);
buildGallery();setAud(AUD);applyFilter();
const h0=location.hash.slice(1),ix=MODS.findIndex(m=>m.id===h0);if(ix>=0)openMod(ix);
