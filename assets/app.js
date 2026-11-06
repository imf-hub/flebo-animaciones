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

function lbl(ctx,x,y,tx,ty,text,side){
  ctx.save();ctx.strokeStyle='rgba(230,237,243,.6)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(tx,ty);ctx.stroke();
  ctx.fillStyle=C.ink;ctx.beginPath();ctx.arc(x,y,3,0,TAU);ctx.fill();
  ctx.font='500 14px '+FONT;ctx.textBaseline='middle';
  const right=side?side==='r':tx>=x, w=ctx.measureText(text).width;
  const bx=right?tx+2:tx-w-14;
  ctx.fillStyle='rgba(15,23,30,.84)';ctx.strokeStyle='rgba(159,176,192,.35)';
  ctx.beginPath();ctx.rect(bx,ty-11,w+12,22);ctx.fill();ctx.stroke();
  ctx.fillStyle=C.ink;ctx.textAlign='left';ctx.fillText(text,bx+6,ty+.5);ctx.restore();
}
function banner(ctx,title,sub,color){
  ctx.save();ctx.textBaseline='alphabetic';ctx.textAlign='left';
  ctx.fillStyle=color||C.ink;ctx.font='600 19px '+FONT;ctx.fillText(title,24,36);
  if(sub){ctx.fillStyle=C.dim;ctx.font='400 14px '+FONT;ctx.fillText(sub,24,58);}
  ctx.restore();
}
function pill(ctx,x,y,text,align,color){
  ctx.save();ctx.font='500 13px '+FONT;ctx.textBaseline='middle';const w=ctx.measureText(text).width;
  const bx=align==='right'?x-w-12:x;ctx.fillStyle='rgba(15,23,30,.8)';ctx.fillRect(bx,y-11,w+12,22);
  ctx.fillStyle=color||C.dim;ctx.textAlign='left';ctx.fillText(text,bx+6,y+.5);ctx.restore();
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
    const sl=ui.slider('Grado de incompetencia valvular',0,1,0.01,inc,v=>{inc=v},v=>v<0.12?'Competente':v<0.45?'Leve':v<0.75?'Moderada':'Severa');
    ui.buttons([['Válvula sana',()=>sl.set(0)],['Válvula incompetente',()=>sl.set(0.85)]]);
    ui.legend([[C.blood,'Flujo anterógrado (hacia el corazón)'],[C.reflux,'Reflujo (flujo retrógrado)'],[C.valve,'Valva: núcleo de colágeno cubierto de endotelio']]);
    const roT=ui.readout('Tiempo de reflujo (Doppler)'),roD=ui.readout('Diámetro relativo de la vena');
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
      const rv=rm.value,path=rv>0.5;
      ctx.save();ctx.font='600 13px '+MONO;ctx.textAlign='right';ctx.fillStyle=path?C.reflux:C.ok;ctx.fillText('reflujo '+rv.toFixed(2)+' s '+(path?'> 0,5 s':'< 0,5 s'),970,475);ctx.restore();
      roT.set(rv.toFixed(2)+' s · '+(path?'patológico':'fisiológico'));roD.set((Rb()/58*100).toFixed(0)+' %');
      const titles=['Sístole muscular: flujo anterógrado','Inversión de presión: '+(inc<0.3?'las valvas se cierran y sellan':'las valvas no coaptan → reflujo'),'Reposo: llenado lento desde la periferia'];
      banner(ctx,titles[ph],ph===1&&inc<0.3?'El seno valvular se llena, empuja las cúspides y crea un vórtice que lava la válvula':'Corte longitudinal de vena superficial de la pierna',ph===1&&inc>=0.3?C.reflux:C.ink);
      if(S.labels){
        const ay=y0+Rx(60);
        lbl(ctx,60,ay+1.5,60,548,'Endotelio','r');lbl(ctx,100,ay+5,100,524,'Íntima / subendotelio','r');
        lbl(ctx,140,ay+14,140,500,'Media: músculo liso','r');lbl(ctx,180,ay+32,180,476,'Adventicia: colágeno y vasa vasorum','r');
        lbl(ctx,xb,y0-R0-1,470,96,'Agger (base valvar)','l');
        const mx=lerp(xb+42,xb+38,v),my=lerp(y0-R0+4,y0-R0*0.55,v);lbl(ctx,mx,my,560,96,'Valva (cúspide)','r');
        lbl(ctx,xb+78,y0-Rx(xb+78)+6,760,124,'Seno valvular','r');
        const tcX=lerp(xb+L+10,xb+L-inc*55,v);lbl(ctx,tcX,y0,780,y0+46,inc<0.3?'Línea de coaptación':'Coaptación incompleta','r');
      }
    }};
  };
}

/* ---------- 2 · Bomba muscular de la pantorrilla ---------- */
function calfPump(api,ui){
  const ctx=api.ctx;let incomp=false,walking=true;
  ui.segmented('Estado venoso',['Sano','Insuficiencia (perforante y safena)'],0,i=>{incomp=i===1});
  const wb=ui.buttons([['Detenerse (de pie quieto)',()=>{walking=!walking;wb[0].textContent=walking?'Detenerse (de pie quieto)':'Caminar'}]]);
  ui.legend([[C.blood,'Flujo hacia el corazón / hacia el sistema profundo'],[C.reflux,'Reflujo o flujo profundo → superficial']]);
  const roP=ui.readout('Presión venosa en tobillo'),roV=ui.readout('Tiempo de rellenado venoso');
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
      for(const q of D){let u;if(!walking)u=-22;else if(contr)u=q.y>vD?-6:-300*m-30;else u=q.y>vD?-110:(q.y>vP?-35:-55);q.u=u;q.y+=u*dt;if(q.y<yT){q.y=yB;q.l=rnd(-1,1)}if(q.y>yB)q.y=yT}
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
    for(const q of D){rbc(ctx,dX+q.l*dW(q.y)*0.75,q.y,Math.PI/2,q.u>4,0.85)}
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
    for(const mm of [0,30,60,90]){const yy=cy+ch-10-mm/100*(ch-36);ctx.fillText(mm,cx+24,yy+4);ctx.strokeStyle='rgba(159,176,192,.2)';ctx.beginPath();ctx.moveTo(cx+30,yy);ctx.lineTo(cx+cw-6,yy);ctx.stroke()}
    ctx.strokeStyle=incomp?C.reflux:'#7fc8f0';ctx.lineWidth=2;ctx.beginPath();for(let k=0;k<hist.length;k++){const v=hist[(hi+k)%hist.length]||90;ctx.lineTo(cx+30+k*(cw-36)/hist.length,cy+ch-10-v/100*(ch-36))}ctx.stroke();
    ctx.textAlign='left';ctx.fillStyle=C.ink;ctx.font='600 13px '+FONT;ctx.fillText('Presión venosa · tobillo (mmHg)',cx+8,cy+18);
    ctx.font='600 30px '+MONO;ctx.fillStyle=incomp?C.reflux:C.ink;ctx.fillText(Math.round(Pshow)+' mmHg',cx,cy+ch+44);
    ctx.font='400 13px '+FONT;ctx.fillStyle=C.dim;ctx.fillText(walking?'Caminando: la bomba vacía la pierna':'De pie quieto: columna hidrostática',cx,cy+ch+68);
    ctx.fillText(incomp?'PVA alta: no baja de ~70 mmHg':'PVA normal: baja a ~20–30 mmHg',cx,cy+ch+88);
    roP.set(Math.round(Pshow)+' mmHg');roV.set(incomp?'< 20 s (anormal)':'> 20 s (normal)');
    banner(ctx,!walking?'De pie, sin movimiento: no hay bombeo':contr?'Contracción (sístole muscular): vaciado de venas profundas':(incomp?'Relajación: reflujo en safena y perforante':'Relajación: llenado desde el sistema superficial'),
      !walking?'La presión en el tobillo equivale a la columna de sangre hasta la aurícula derecha':contr?(incomp?'La perforante incompetente expulsa sangre hacia la superficie':'Válvula proximal abierta, distal y perforante cerradas'):'Válvula proximal cerrada; distal y perforante abiertas',(walking&&incomp&&!contr)?C.reflux:C.ink);
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
    banner(ctx,k>0.5?'Insuficiencia: la tributaria sin soporte fascial se vuelve varicosa':'Corte transversal de la cara medial de la pierna',
      k>0.5?'La safena dentro de su compartimento se dilata menos; aparecen edema, telangiectasias y pigmento':'⊙ flujo hacia el corazón, saliendo del plano · ⊗ reflujo entrando al plano',k>0.5?C.reflux:C.ink);
    if(S.labels){
      lbl(ctx,90,44,90,22+60,'Epidermis','r');lbl(ctx,180,80,180,118,'Dermis','r');lbl(ctx,140,200,140,160,'Tejido subcutáneo','r');
      lbl(ctx,330,sapUp(330),210,250,'Fascia safena','l');lbl(ctx,250,musF(250),180,300,'Fascia muscular profunda','l');
      lbl(ctx,450-gr,272,250,212,'Compartimento safeno ("ojo egipcio")','l');lbl(ctx,450+gr,262,600,240,'Vena safena mayor','r');
      lbl(ctx,770,165-tr,830,118,k>0.5?'Tributaria varicosa (cortes de una vena tortuosa)':'Tributaria superficial','r');
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
    const rv=rm.value,path=rv>0.5;ctx.font='600 13px '+MONO;ctx.textAlign='right';ctx.fillStyle=path?C.reflux:C.ok;ctx.fillText(rv.toFixed(2)+' s',336,417);ctx.textAlign='left';
    roT.set(rv.toFixed(2)+' s · '+(path?'patológico (> 0,5 s)':'normal'));roM.set(man==='v'?'Valsalva en curso':man==='c'?(mt<0.8?'Compresión':'Liberación'):'En reposo');
    banner(ctx,man?(g<0&&inc?'Reflujo safeno‑femoral: la válvula terminal no cierra':'La válvula terminal cierra: no hay reflujo'):'Unión safeno‑femoral (cayado), pierna izquierda, vista anterior',
      man?'Criterio dúplex: reflujo superficial > 0,5 s; femoral o poplíteo > 1 s':'Pulse "Maniobra de Valsalva" o "Compresión distal" en el panel',man&&g<0&&inc?C.reflux:C.ink);
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
  const sl=ui.slider('Presión venosa (mmHg)',10,90,1,Pv,v=>{Pv=v},v=>v+' mmHg');
  ui.buttons([['Simular años de hipertensión venosa',()=>{sl.set(85);fast=4}],['Restablecer',()=>{sl.set(20);fast=1;plasma.length=0;hemo.length=0;cuff=0;leuk.forEach(l=>{l.st=0;l.x=rnd(0,700)})}]]);
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
    if(h<0.35){arrow(ctx,650,yc-58,650,yc-16,'rgba(127,200,240,.9)',3);arrow(ctx,650,yc+58,650,yc+16,'rgba(127,200,240,.9)',3)}
    else{arrow(ctx,650,yc-16,650,yc-58,'rgba(242,231,166,.9)',3);arrow(ctx,650,yc+16,650,yc+58,'rgba(242,231,166,.9)',3)}
    pill(ctx,860,yc,'Pv '+Pv+' mmHg','left',h>0.5?C.reflux:C.ink);
    const hc=hemo.filter(q=>q.age>6).length;
    roF.set(h<0.35?'equilibrada (reabsorción venular)':h<0.6?'aumentada':'muy aumentada');roE.set(Math.round(edema*100)+' %');
    roC.set(cuff>0.75&&hc>60?'Riesgo de úlcera (C6)':hc>20||cuff>0.35?'Pigmentación / lipodermatoesclerosis (C4)':edema>0.25?'Edema (C3)':'Sin cambios cutáneos (C0–C2)');
    banner(ctx,h<0.35?'Microcirculación normal: filtración y reabsorción en equilibrio':'Hipertensión venosa: la presión se transmite al capilar',
      h<0.35?'El exceso de líquido lo drena el capilar linfático':'Fuga de plasma y eritrocitos, adhesión leucocitaria y depósito de hemosiderina',h<0.35?C.ink:C.reflux);
    ctx.font='400 13px '+MONO;ctx.fillStyle=C.dim;ctx.textAlign='left';ctx.fillText('Starling: Jv = Kf [(Pc − Pi) − σ(πc − πi)]',24,585);
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
    {name:'Telangiectasia',size:'< 1 mm',y0:132,R:7,w:3,xc:420,ang:12,needle:'30–32 G, bisel hacia arriba',rec:[0.25,0.5],recTxt:'POL 0,25–0,5 % líquido',vol:'0,1–0,2 mL por punto',col:'#c2364a',dil:0.95,layer:'dermis'},
    {name:'Vena reticular',size:'1–3 mm',y0:215,R:15,w:6,xc:540,ang:20,needle:'27–30 G',rec:[0.5,1],recTxt:'POL 0,5–1 % líquido o 0,5 % espuma',vol:'0,1–0,3 mL por punto',col:'#3f86a8',dil:0.75,layer:'subdérmica'},
    {name:'Tributaria varicosa',size:'≥ 3 mm',y0:310,R:36,w:12,xc:520,ang:35,needle:'25–27 G, idealmente guiada por ecografía',rec:[0.5,1],recTxt:'POL 0,5–1 % en espuma',vol:'0,5–2 mL de espuma por punto; ≤ 10 mL por sesión',col:'#5b6fbf',dil:0.4,layer:'subcutánea'}];
  let ti=2,foam=true,conc=1,comp=true,extra=false,step=0,p=0,seq=true,t=0;
  const D=[3,3.5,4.5,4.5,4.5,7];
  ui.segmented('Tipo de vena',TYPES.map(T=>T.name+' ('+T.size+')'),2,i=>{ti=i;restart()});
  ui.segmented('Agente esclerosante',['Líquido','Espuma (Tessari 1:4)'],1,i=>{foam=i===1;restart()});
  ui.slider('Concentración de polidocanol',0.1,3,0.05,conc,v=>{conc=v},v=>v.toFixed(2).replace('.',',')+' %');
  ui.toggle('Compresión después de la sesión',true,v=>{comp=v});
  ui.toggle('Simular extravasación perivenosa',false,v=>{extra=v});
  const stepSeg=ui.segmented('Paso',['1 Vena','2 Punción','3 Inyección','4 Endotelio','5 Compresión','6 Fibrosis'],0,i=>{step=i;p=0;seq=false});
  ui.buttons([['Reproducir secuencia completa',()=>{restart()}],['Siguiente paso →',()=>{if(step<5){step++;p=0;seq=false;stepSeg&&stepSeg.set(step)}}]]);
  ui.legend([['#f4f7fa','Espuma (microburbujas de gas)'],['#50c8be','Moléculas de polidocanol activas'],['#7d8790','Polidocanol inactivado por proteínas'],['#e1463c','Inflamación y necrosis por exceso'],[C.endo,'Endotelio'],['#e8d27a','Colágeno subendotelial expuesto'],['#8f6fd0','Plaquetas y fibrina'],['#b08c6a','Fibroblastos / cordón fibroso'],['#7a4a25','Hemosiderina']]);
  const roN=ui.readout('Aguja del ejemplo'),roR=ui.readout('Parámetro del ejemplo'),roV=ui.readout('Volumen ilustrativo'),roM=ui.readout('Polidocanol en 1 mL'),roE=ui.readout('Concentración ilustrativa en pared'),roO=ui.readout('Respuesta del esquema');
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
    const eff=conc*(foam?1:T.dil),ratio=eff/T.rec[0],dmg=clamp((ratio-0.3)/0.7,0,1),excess=eff>T.rec[1]*1.8,recanal=dmg<0.85;
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
    for(const r of RB){const w=inR(r.x);if(w>0.5&&(foam||step>=4)&&!(step===5&&recanal))continue;rbc(ctx,r.x,y0+r.f*Rc(r.x)*0.8,0,false,rs)}
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
    // escala de concentración
    {const gx=278,gy=378,gw=362,gh=112,r0=T.rec[0],r1=T.rec[1],lg=v=>(Math.log10(clamp(v,0.1,3))+1)/(Math.log10(3)+1),X=v=>gx+14+lg(v)*(gw-28),by=gy+50;
      ctx.fillStyle='rgba(15,23,30,.92)';ctx.strokeStyle=C.line;ctx.fillRect(gx,gy,gw,gh);ctx.strokeRect(gx,gy,gw,gh);
      ctx.fillStyle=C.ink;ctx.font='600 12px '+FONT;ctx.textAlign='left';ctx.fillText('Polidocanol para '+T.name.toLowerCase()+' (escala log, %)',gx+10,gy+15);
      const zones=[[0.1,r0,'#4a6d9c'],[r0,r1,'#3f9e6e'],[r1,Math.min(3,r1*1.8),'#c98a2e'],[Math.min(3,r1*1.8),3,'#b53a3a']];
      for(const [a,b,c] of zones){if(b<=a)continue;ctx.fillStyle=c;ctx.fillRect(X(a),by,X(b)-X(a),12)}
      ctx.font='400 10px '+MONO;ctx.fillStyle=C.dim;ctx.textAlign='center';for(const v of [0.1,0.25,0.5,1,2,3]){ctx.fillRect(X(v)-0.5,by+12,1,4);ctx.fillText(String(v).replace('.',','),X(v),by+26)}
      const tri=(x,y,up,c)=>{ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-6,y+(up?9:-9));ctx.lineTo(x+6,y+(up?9:-9));ctx.closePath();ctx.fill()};
      tri(X(conc),by-1,false,'#ffffff');ctx.font='500 10px '+FONT;ctx.fillStyle=C.ink;ctx.textAlign='center';ctx.fillText('jeringa '+conc.toFixed(2).replace('.',','),clamp(X(conc),gx+40,gx+gw-40),by-13);
      if(!foam&&Math.abs(X(conc)-X(eff))>4){arrow(ctx,X(conc),by+6,X(eff)+4,by+6,'rgba(80,200,190,.95)',2)}
      tri(X(eff),by+13,true,'#50c8be');
      const zt=ratio<1?['Insuficiente: daño endotelial parcial → recanalización','#8fb3e8']:eff<=r1?['Ventana terapéutica: oclusión y fibrosis','#7fd6a8']:eff<=r1*1.8?['Por encima del rango: más inflamación, dolor y flebitis','#e8b25a']:['Excesiva: necrosis de la pared, pigmentación, matting; úlcera si se extravasa','#f08080'];
      ctx.textAlign='left';ctx.font='600 11.5px '+FONT;ctx.fillStyle=zt[1];ctx.fillText(zt[0],gx+10,gy+gh-22);
      ctx.font='400 10.5px '+FONT;ctx.fillStyle=C.dim;ctx.fillText('▼ en la jeringa   ▲ en la pared'+(foam?' (la espuma no se diluye)':' (el líquido se diluye en la sangre)'),gx+10,gy+gh-8)}
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
      pill(ctx,mx+mw,my+mh+14,foam?'Burbujas de gas recubiertas de polidocanol: contacto directo, sin diluirse':'Molécula libre (turquesa) se diluye; la albúmina la inactiva (gris)','right',C.ink)}
    // línea de tiempo
    const names=['Vena','Punción','Inyección','Daño endotelial','Compresión','Fibrosis'],times=['antes','segundos','segundos','segundos–minutos','horas–días','semanas–meses'];
    const tw=960/6;for(let i=0;i<6;i++){const x=20+i*tw;ctx.fillStyle=i===step?'rgba(147,179,232,.28)':'rgba(22,33,42,.92)';ctx.fillRect(x+2,550,tw-4,42);
      if(i===step){ctx.fillStyle='rgba(147,179,232,.85)';ctx.fillRect(x+2,588,(tw-4)*p,4)}
      ctx.fillStyle=i<=step?C.ink:C.dim;ctx.font='600 13px '+FONT;ctx.textAlign='left';ctx.fillText((i+1)+' · '+names[i],x+10,567);ctx.font='400 11px '+MONO;ctx.fillStyle=C.dim;ctx.fillText(times[i],x+10,582)}
    // textos de fase
    const tt=[
      ['1 · '+T.name+' antes del tratamiento','Localización '+T.layer+', calibre '+T.size+'. Flujo lento con aumento de presión venosa'],
      ['2 · Punción: la aguja entra en la luz',T.needle+'; ángulo bajo y tangencial. '+(ti===0?'En telangiectasias la posición se confirma por el blanqueamiento':'El reflujo de sangre al cono confirma la posición intravascular')],
      ['3 · Inyección: '+(foam?'la espuma desplaza la sangre':'el líquido se mezcla y se diluye con la sangre'),foam?'Mayor superficie de contacto con el endotelio y menor dilución: misma eficacia con menor concentración':'La concentración efectiva cae con la distancia al punto de inyección ('+Math.round(T.dil*100)+' % de la nominal en este calibre)'],
      ['4 · Daño endotelial y vasoespasmo','El detergente (polidocanol) altera la membrana lipídica del endotelio: descamación y exposición del colágeno subendotelial'],
      [comp?'5 · Compresión: paredes en contacto y esclerotrombo mínimo':'5 · Sin compresión: coágulo atrapado en la luz',comp?'Adhesión plaquetaria y fibrina sobre el colágeno expuesto; la compresión reduce el trombo intraluminal':'El trombo intraluminal aumenta el dolor, la flebitis y la pigmentación por hemosiderina'],
      recanal?['6 · Recanalización: daño endotelial insuficiente','Concentración efectiva por debajo de la recomendada: el flujo vuelve y la vena reaparece']:['6 · Fibrosis y reabsorción','Fibroblastos y colágeno transforman la vena en un cordón fibroso que se reabsorbe en semanas a meses'+(comp?'':'; persiste pigmentación')]];
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
    roN.set(T.needle);roR.set(T.recTxt);roV.set(T.vol);roM.set((conc*10).toFixed(1).replace('.',',')+' mg');
    roE.set(eff.toFixed(2).replace('.',',')+' % · '+(ratio<1?'insuficiente':excess?'excesiva':'adecuada'));
    roO.set(recanal?'Recanalización probable':eff>T.rec[1]&&!excess?'Oclusión con más inflamación y dolor':excess?'Oclusión; ↑ riesgo de pigmentación, matting o necrosis':!comp?'Oclusión con trombo atrapado; ↑ pigmentación':'Oclusión y fibrosis');
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
    const risk=clamp(0.42*est+0.32*hip+0.2*les+0.3*est*hip,0,1);
    if(dt>0){
      if(antic)g=Math.max(Math.min(g,0.22),g-0.012*dt);
      else g=clamp(g+(risk>0.35?0.04*(risk-0.35)*(1+g):-0.004)*dt,0,1);
      if(!antic&&((g>0.6&&Math.random()<dt*0.06*(g-0.5))||(forceEmb&&g>0.35))&&!emb){emb={x:0,y:0,r:0,init:true};g-=0.15}
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
    for(const p of P){const lo=-1+(th(p.x)+3)/Rx(p.x);if(p.f<lo-0.02)continue;rbc(ctx,p.x,y0+p.f*Rx(p.x)*0.92,0,false,1)}
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
      ctx.fillStyle=tg>0.4?C.reflux:C.ok;ctx.fillText(tg>0.4?'Vena no compresible → TVP':'Vena compresible → sin TVP en este punto',ix+8,iy+ih-9)}
    // tríada de Virchow
    {const vx=[[455,400],[335,565],[575,565]],cg=[455,510],vals=[est,hip,les],names=['Estasis','Hipercoagulabilidad','Lesión endotelial'];
      ctx.fillStyle='rgba(22,33,42,.92)';ctx.strokeStyle=C.line;ctx.fillRect(312,372,288,212);ctx.strokeRect(312,372,288,212);
      ctx.strokeStyle='rgba(159,176,192,.6)';ctx.lineWidth=1;ctx.beginPath();vx.forEach(v=>ctx.lineTo(v[0],v[1]));ctx.closePath();ctx.stroke();
      ctx.fillStyle=`rgba(232,150,58,${0.25+risk*0.5})`;ctx.beginPath();vx.forEach((v,i)=>ctx.lineTo(cg[0]+(v[0]-cg[0])*vals[i],cg[1]+(v[1]-cg[1])*vals[i]));ctx.closePath();ctx.fill();
      ctx.font='600 12px '+FONT;ctx.fillStyle=C.ink;ctx.textAlign='center';ctx.fillText(names[0],vx[0][0],vx[0][1]-8+18*0);ctx.fillText(names[1],vx[1][0]+40,vx[1][1]+14);ctx.fillText(names[2],vx[2][0]-40,vx[2][1]+14);
      ctx.font='600 13px '+MONO;ctx.fillText('riesgo '+Math.round(risk*100)+' %',cg[0],cg[1]+5);ctx.textAlign='left';ctx.font='600 12px '+FONT;ctx.fillText('Tríada de Virchow',322,390)}
    // clínica y diagnóstico
    {const x=612,y=372;ctx.fillStyle='rgba(22,33,42,.92)';ctx.strokeStyle=C.line;ctx.fillRect(x,y,370,212);ctx.strokeRect(x,y,370,212);
      const stage=g<0.06?'sin trombo':g<0.2?'nido en el seno valvular':occluded?'oclusivo':g<0.6?'propagación proximal':'extenso con cola flotante';
      const lines=[['Trombo',stage],['Oclusión de la luz',Math.round(occ*100)+' %'],['Dímero D',g>0.06?'elevado (sensible, poco específico)':'normal'],['Ecografía',g>0.12?'no compresible':'compresible'],
        ['Clínica',occ>0.55?'edema, dolor, calor, empastamiento':g>0.06?'escasa o ausente (no oclusivo)':'—'],['Embolia pulmonar',antic?'riesgo reducido (anticoagulado)':g>0.6?'riesgo alto (cola flotante)':g>0.25?'riesgo moderado':'riesgo bajo'],['Émbolos liberados',String(embN)]];
      ctx.font='600 12px '+FONT;ctx.fillStyle=C.ink;ctx.fillText('Clínica y diagnóstico (ilustrativo)',x+10,y+18);
      lines.forEach(([a,b],i)=>{ctx.font='400 12.5px '+FONT;ctx.fillStyle=C.dim;ctx.fillText(a,x+10,y+44+i*24);ctx.font='500 12.5px '+FONT;ctx.fillStyle=(i===5&&g>0.6&&!antic)||(i===6&&embN>0)?C.reflux:C.ink;ctx.fillText(b,x+140,y+44+i*24)})}
    const stageT=g<0.06?['1 · Estasis en el seno valvular','Flujo lento, hipoxia del seno y activación endotelial: el inicio de la TVP']:g<0.2?['2 · Nido trombótico en el seno','Neutrófilos, monocitos (factor tisular), NETs y plaquetas inician la coagulación']:g<0.6?['3 · Propagación proximal','Trombo rojo de fibrina y eritrocitos con líneas de Zahn; crece hacia el corazón']:['4 · Trombo extenso con cola flotante','La cola no adherida puede desprenderse y causar embolia pulmonar'];
    if(t-embT<3.5)banner(ctx,'Embolia pulmonar: un fragmento viaja al pulmón','Por la vena cava y las cavidades derechas hasta las arterias pulmonares',C.reflux);
    else if(antic)banner(ctx,'Anticoagulación: el trombo deja de crecer','Evita extensión y embolia; la plasmina endógena reduce el trombo lentamente',C.ok);
    else banner(ctx,stageT[0],stageT[1]);
    if(S.labels){
      lbl(ctx,xv,y0-R+4,xv-50,y0-R-44,'Válvula','l');lbl(ctx,xv+70,y0+R+6,xv+130,y0+R+48,'Seno valvular: hipoxia','r');
      lbl(ctx,xv+30,y0-Rx(xv+30)+2,xv+100,y0-R-56,'Endotelio activado','r');
      if(g>0.25){const lx=xA+(xE-xA)*0.35;lbl(ctx,lx,y0-Rx(lx)+th(lx)*0.5,lx+80,y0+R+46,'Trombo rojo y líneas de Zahn','r')}
      if(g>0.6&&!emb){lbl(ctx,xE-10,y0-Rx(xE)+th(xE-10),Math.min(960,xE+10),y0+R+20,'Cola flotante','l')}
      if(nL>0)lbl(ctx,xv+24,y0-Rx(xv+24)+9,250,y0-R-24,'Neutrófilos y NETs','l');
    }
    roD.set(t.toFixed(0)+' s de animación');roR.set(lvl(risk)+' · sin escala clínica');roT.set(Math.round(g*100)+' % del esquema');roE.set(emb?'desprendimiento representado':embN?'evento previo representado':'sin evento representado');
  }};
}

/* ---------- 11 · Síndrome postrombótico ---------- */
function ptsSim(api,ui){
  const ctx=api.ctx;let m=0,auto=true,rec=0.6,trap=true,ilio=false,comp=false,t=0;
  const sT=ui.slider('Tiempo desde la TVP',0,24,0.1,0,v=>{m=v},v=>v<1?Math.round(v*30)+' días':v.toFixed(1).replace('.',',')+' meses');
  const ab=ui.buttons([['Pausar evolución',()=>{auto=!auto;ab[0].textContent=auto?'Pausar evolución':'Reproducir evolución'}],['Volver al día 0',()=>{sT.set(0)}]]);
  ui.slider('Grado de recanalización',0,1,0.01,rec,v=>{rec=v},v=>v<0.3?'escasa: obstrucción residual':v<0.75?'parcial, con sinequias':'casi completa');
  ui.toggle('Válvula atrapada en el trombo (destruida)',true,v=>{trap=v});
  ui.toggle('TVP iliofemoral extensa',false,v=>{ilio=v});
  ui.toggle('Compresión elástica y ejercicio',false,v=>{comp=v});
  ui.legend([['#5a0d14','Trombo agudo'],['#c9b29a','Trombo organizado (tejido fibroso)'],[C.blood,'Flujo anterógrado'],[C.reflux,'Reflujo por válvula destruida'],['#7a4a25','Hemosiderina en la piel']]);
  const roF=ui.readout('Fase'),roR=ui.readout('Reflujo'),roO=ui.readout('Obstrucción'),roP=ui.readout('Presión venosa ambulatoria (estimada)'),roV=ui.readout('Puntuación de Villalta'),roC=ui.readout('Categoría');
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
      rbc(ctx,p.x,y,0,U<-0.05,0.9)}
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
    // escala de Villalta
    {const vx=335,vy=345,vw=645,vh=240;ctx.fillStyle='rgba(22,33,42,.92)';ctx.strokeStyle=C.line;ctx.fillRect(vx,vy,vw,vh);ctx.strokeRect(vx,vy,vw,vh);
      ctx.fillStyle=C.ink;ctx.font='600 12px '+FONT;ctx.textAlign='left';ctx.fillText('Escala de Villalta (0 ausente · 1 leve · 2 moderado · 3 grave)',vx+10,vy+17);
      const row=(name,v,x,y)=>{ctx.font='400 12px '+FONT;ctx.fillStyle=evalOK?C.ink:C.dim;ctx.fillText(name,x,y);for(let k=0;k<3;k++){ctx.fillStyle=k<v?(v>=3?'#e06a5a':v===2?'#e8b25a':'#93b3e8'):'rgba(159,176,192,.18)';ctx.fillRect(x+212+k*20,y-10,16,12)}};
      ctx.font='600 11px '+MONO;ctx.fillStyle=C.dim;ctx.fillText('SÍNTOMAS',vx+10,vy+40);ctx.fillText('SIGNOS',vx+330,vy+40);
      SYM.forEach((n,i)=>row(n,sym[i],vx+10,vy+62+i*24));SIG.forEach((n,i)=>row(n,sig[i],vx+330,vy+62+i*24));
      ctx.font='400 12px '+FONT;ctx.fillStyle=evalOK?C.ink:C.dim;ctx.fillText('Úlcera venosa',vx+10,vy+62+5*24);ctx.fillStyle=ulcer?'#e06a5a':'rgba(159,176,192,.18)';ctx.fillRect(vx+222,vy+52+5*24,56,12);ctx.fillStyle=C.ink;ctx.font='500 10px '+FONT;ctx.fillText(ulcer?'presente':'ausente',vx+228,vy+62+5*24);
      const cc=!evalOK?C.dim:ulcer||score>=15?'#f08080':score>=10?'#e8b25a':score>=5?'#93b3e8':C.ok;
      ctx.font='600 15px '+MONO;ctx.fillStyle=cc;ctx.fillText(evalOK?('Total '+score+' · '+cat):'SPT aún no evaluable',vx+10,vy+vh-14);
      ctx.font='400 11px '+FONT;ctx.fillStyle=C.dim;ctx.textAlign='right';ctx.fillText(evalOK?'< 5 sin SPT · 5–9 leve · 10–14 moderado · ≥ 15 o úlcera grave':'Se diagnostica a partir de 3–6 meses tras la TVP',vx+vw-10,vy+vh-14);ctx.textAlign='left'}
    const phase=m<1?['Fase aguda: trombo oclusivo e inflamación de la pared','El trombo rojo obstruye la luz; la pared se inflama (flebitis)']:m<6?['Organización: el trombo se convierte en tejido fibroso','Fibroblastos y neovasos invaden el trombo; la válvula queda atrapada']:['Recanalización: canales, sinequias y válvula destruida',rc<0.3?'Recanalización escasa: obstrucción residual y circulación colateral':(trap?'La luz reabre, pero la válvula engrosada no cierra: reflujo':'La válvula respetada mantiene la competencia')];
    banner(ctx,phase[0],phase[1],(!sys&&reflux>0.2&&m>=6)?C.reflux:C.ink);
    if(S.labels){
      if(m<6)lbl(ctx,560,y0+10,600,y0+R+wt+40,m<1?'Trombo rojo agudo':'Trombo en organización (fibroblastos, neovasos)','r');
      else{lbl(ctx,640,y0+(0.52*(1-0.25*rc)+0.12*Math.sin(640*0.02+4))*R,680,y0+R+wt+40,'Canales de recanalización','r');lbl(ctx,520,y0+0.27*R,470,y0+R+wt+40,'Sinequias (trabéculas fibrosas)','l')}
      lbl(ctx,xv+18,y0-R+6,xv-30,y0-R-wt-46,trap?'Válvula engrosada y adherida':'Válvula respetada','l');
      lbl(ctx,800,y0-R-wt/2,830,y0-R-wt-46,'Pared engrosada y fibrosa','r');
      if(cw>1)lbl(ctx,500,y0-R-64,560,y0-R-82,'Circulación colateral','r');
    }
    roF.set(m<1?'aguda':m<6?'organización':'recanalización / crónica');roR.set(Math.round(reflux*100)+' %');roO.set(Math.round(obs*100)+' %');
    roP.set(Math.round(25+VH*55-(comp?8:0))+' mmHg');roV.set(evalOK?String(score):'no evaluable aún');roC.set(evalOK?cat:'—');
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
  const sl=ui.slider('Progresión de la enfermedad',0,1,0.01,deg,v=>{deg=v},v=>v<0.12?'Vena sana':v<0.3?'Reticular (< 3 mm)':v<0.7?'Várice (C2, ≥ 3 mm)':'Várice con dilataciones saculares');
  const ab=ui.buttons([['Animar progresión',()=>{auto=!auto;ab[0].textContent=auto?'Detener animación':'Animar progresión'}],['Restablecer vista',home]]);
  ui.toggle('Mostrar piel',false,v=>{skinOn=v;skin.visible=v});
  ui.legend([['#5b6fbf','Vena superficial (tributaria)'],['#2f3d78','Vena profunda'],['#5cc29a','Válvula competente'],[C.reflux,'Válvula incompetente / reflujo']]);
  const roD=ui.readout('Diámetro ilustrativo'),roT=ui.readout('Índice de tortuosidad'),roV=ui.readout('Válvulas incompetentes');
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
  vS.forEach(()=>{const m=new THREE.Mesh(ringG,new THREE.MeshStandardMaterial({color:0x5cc29a,roughness:.4}));scene.add(m);E.register(m,'valvas','Válvulas',true);valves.push(m)});
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
    let len=curve.getLength();roD.set((2+d*9).toFixed(1)+' mm');roT.set((len/9).toFixed(2));roV.set(f.filter(Boolean).length+' de '+vS.length);built=d}
  const N=260,ib=new THREE.InstancedMesh(rbcGeometry(.055),new THREE.MeshStandardMaterial({color:0xffffff,roughness:.5}),N);scene.add(ib);
  const rand=mulberry(712),ps=[];for(let k=0;k<N;k++)ps.push({s:rand(),a:rand()*TAU,r:Math.sqrt(rand())*.6});
  const ND=70,idp=new THREE.InstancedMesh(new THREE.SphereGeometry(0.06,10,8),new THREE.MeshStandardMaterial({color:0x9a1a28,roughness:.5}),ND);scene.add(idp);
  const dps=[];for(let k=0;k<ND;k++)dps.push({y:rnd(-4.6,4.6),a:Math.random()*TAU,r:Math.random()*0.25});
  const M=new THREE.Matrix4(),P=new THREE.Vector3(),Q=new THREE.Quaternion(),Sc=new THREE.Vector3(1,1,1),col=new THREE.Color();
  E.tag('Vena superficial',v=>v.copy(cen[Math.round(0.8*TS)]||v.set(0,3,0)).add(new THREE.Vector3(0.3,0,0)));E.tag('Fascia muscular',v=>v.set(-2.6,3.9,-1.5));
  E.tag('Vena profunda',v=>v.set(2.2,-3.6,-2.6));E.tag('Arteria',v=>v.set(2.85,-2.6,-2.6));E.tag('Vena perforante',v=>{const a=cen[Math.round(0.4*TS)];a?v.set((a.x+2.2)/2,a.y-0.3,-1.5):v.set(1,0,-1.5)});
  E.tag('Válvula',v=>v.copy(cen[Math.round(0.58*TS)]||v.set(0,0.7,0)));
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
      if(!cached){cached={segments:Math.max(16,Math.min(128,Math.round(v.len*14))),radial:v.r<.05?8:18};cached.mesh=updateTubeMesh(null,curve,cached.segments,cached.radial,v.r,mat(v.col,v.kind==='art'?1:.92,{roughness:.4}),scene);vesselCache.set(v.n,cached);tracked.push(cached.mesh);vMeshes.push(cached.mesh)}
      else updateTubeMesh(cached.mesh,curve,cached.segments,cached.radial,v.r,null,scene);
      const m=cached.mesh;m.userData={op:v.kind==='art'?1:.92,comp:v.comp,kind:v.kind,partId:v.partId};E.register(m,v.partId,COURSE.structures[v.partId]?.name||v.partId);byName[v.n]=v;
      if(v.valve!=null){const i=Math.round(v.valve*100),bad=inc&&(v.kind==='perf'||v.c1);
        if(!cached.ring){cached.ring=new THREE.Mesh(new THREE.TorusGeometry(1.02,.28,8,24),mat(0xefdcc4,1,{roughness:.4}));scene.add(cached.ring);tracked.push(cached.ring);cached.leaves=[1,-1].map(()=>{const lf=new THREE.Mesh(new THREE.CircleGeometry(.98,16,0,Math.PI),mat(0xefdcc4,.9,{roughness:.4}));scene.add(lf);tracked.push(lf);return lf})}
        const ring=cached.ring;ring.position.copy(v.S[i]);ring.scale.setScalar(v.r);ring.quaternion.setFromUnitVectors(Z,v.T[i]);ring.material.color.setHex(bad?0xe8963a:0xefdcc4);ring.userData={op:1,comp:v.comp,kind:v.kind,partId:'valvas'};E.register(ring,'valvas','Válvulas');
        cached.leaves.forEach((lf,li)=>{lf.position.copy(v.S[i]);lf.scale.setScalar(v.r);lf.quaternion.setFromUnitVectors(Z,v.T[i]);lf.rotateZ(li===0?0:Math.PI);lf.rotateX(bad?-.25:-.9);lf.material.color.setHex(bad?0xe8963a:0xefdcc4);lf.userData={op:.9,comp:v.comp,kind:v.kind,partId:'valvas'};E.register(lf,'valvas','Valvas')})}
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
  ts('Tejido subcutáneo',(v,o)=>v.set(-3.7,1.45+o.n3,-2.6));tv('V. safena accesoria posterior (extrafascial)','pa',0.08,0.2);
  tv('Vena comunicante','c1',0.5,0.1);tv('Vena comunicante intrafascial','c2',0.5,0.08);
  ts('Fascia safena',(v,o)=>v.set(-3.9,sfY(1.55)+o.sf,1.55));ts('Canal safeno ("ojo egipcio")',(v,o)=>v.set(3.3,sfY(0.8)+o.sf+0.03,0.8));
  ts('Ligamentos safenos',(v,o)=>v.set(-1.5,0.42+(o.n2+o.sf)/2+0.2,1.35));
  tv('V. safena mayor','gsv',0.12,0.35);ts('Nervio safeno',(v,o)=>v.set(-2.6,0.2+o.n2,1.22));
  tv('V. safena accesoria anterior (alineada sobre los vasos femorales)','aa',0.06,0.2);
  ts('Fascia muscular (profunda)',(v,o)=>v.set(-3.9,0.06+o.mf,-2.6));
  tv('Vena perforante directa','p1',0.45);tv('Vena perforante indirecta','p2',0.55);tv('Válvula','p1',0.6,0.12);
  tv('Vena femoral','fv',0.04,0.32);tv('Arteria femoral','fa',0.96,0.2);tv('Vena muscular','mv',0.1);ts('Músculo',(v)=>v.set(-2.2,-2.0,2.95));
  ts('N3 · superficial',(v,o)=>v.set(4.35,1.3+o.n3,2.9));ts('N2 · safeno',(v,o)=>v.set(4.35,0.4+o.n2,2.9));ts('N1 · profundo',(v)=>v.set(4.35,-1.0,2.9));
  return{frame(dt,S){
    t+=dt;e+=(target-e)*(1-Math.exp(-3.6*dt));
    const o=offs();for(const k in groups)groups[k].position.y=o[k];
    if(Math.abs(e-builtE)>0.004||inc!==builtInc){const keep=vessels.map(v=>v.n);build();if(vessels.map(v=>v.n).join()!==keep.join()){/* cambia el número de ramas: reasignar */parts.forEach(p=>{if(p.vi>=vessels.length)p.vi=p.vi%vessels.length})}}
    const ph=(t%3)/3,sys=ph<0.5;
    for(const m of tracked){const k=m.userData.kind,f=E.isolated&&E.selected===m.userData.partId?1:fFor(m.userData.comp,k),want=m.userData.op*f*E.factor(m.userData.partId);m.material.opacity+=(want-m.material.opacity)*Math.min(1,dt*6+0.02);m.material.depthWrite=m.material.opacity>0.95;
      if(m.material.emissive)m.material.emissive.setHex(focus==='comm'&&k==='comm'?0x1f8a5f:focus==='perf'&&k==='perf'?0x5a2fa0:0x000000)}
    const st=vessels.map(v=>{let dir=1,refl=false,sp=v.sp;
      if(v.kind==='perf'){if(inc&&sys){dir=-1;refl=true;sp=0.9}else sp=sys?0.15:0.9}
      if(inc&&v.refl&&!sys){dir=-1;refl=true}
      if(inc&&v.c1&&!sys){dir=-1;refl=true}
      return{d:dir*sp/v.len,refl,vis:(E.isolated&&E.selected===v.partId?1:fFor(v.comp,v.kind))*E.factor(v.partId)>0.25?1:0}});
    for(let k=0;k<parts.length;k++){const p=parts[k],v=vessels[p.vi],s0=st[p.vi];p.s+=s0.d*dt*p.sp;if(p.s>1)p.s-=1;if(p.s<0)p.s+=1;p.ph+=dt*1.5;
      const fi=p.s*100,i=Math.min(99,Math.floor(fi)),f=fi-i,a=v.S[i],b=v.S[i+1],n=v.N[i],bb=v.B[i],rr=v.r*p.rr;
      P.set(lerp(a.x,b.x,f)+(n.x*Math.cos(p.a)+bb.x*Math.sin(p.a))*rr,lerp(a.y,b.y,f)+(n.y*Math.cos(p.a)+bb.y*Math.sin(p.a))*rr,lerp(a.z,b.z,f)+(n.z*Math.cos(p.a)+bb.z*Math.sin(p.a))*rr);
      eu.set(p.ph,p.a,p.ph*0.6);Q.setFromEuler(eu);const sc=s0.vis*Math.min(1,v.r/0.09);Sc.set(sc,sc,sc);M.compose(P,Q,Sc);IM.setMatrixAt(k,M);
      col.setHex(v.art?0xd0202a:s0.refl?0xe8963a:0x8a1422);IM.setColorAt(k,col)}
    IM.instanceMatrix.needsUpdate=true;if(IM.instanceColor)IM.instanceColor.needsUpdate=true;
    roC.set(inc&&!sys?'safena → accesoria (reflujo)':'accesoria → safena mayor (normal)');
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
const MODS=[
 {id:'pared-3d',cat:'Anatomía',title:'Pared venosa y válvula en 3D',kind:'3d',init:wall3D,thumb:thumbWall,
  blurb:'Modelo rotable con las capas de la pared, vasa vasorum y una válvula bicúspide que abre y cierra.',
  text:{paciente:'<p>La vena es un tubo con tres capas. Por dentro la recubre el <b>endotelio</b>, una capa muy fina y lisa que evita que la sangre se coagule. En medio está la <b>capa muscular</b>, que da tono a la vena, y por fuera una envoltura de <b>colágeno</b> que la sostiene.</p><p>Dentro hay <b>válvulas</b>: dos pequeñas compuertas que se abren cuando la sangre sube hacia el corazón y se cierran para que no regrese hacia el pie. Gire el modelo con el dedo o el ratón.</p>',
   medico:'<ul><li><b>Íntima:</b> endotelio sobre membrana basal y subendotelio; la lámina elástica interna es delgada y discontinua en venas.</li><li><b>Media:</b> fina en comparación con la arteria; músculo liso en haces circulares y longitudinales con colágeno I/III y elastina.</li><li><b>Adventicia:</b> la capa más gruesa de la vena; colágeno, fibroblastos, vasa vasorum y nervi vasorum.</li><li><b>Válvula:</b> bicúspide, núcleo de colágeno cubierto de endotelio por ambas caras; se inserta en el agger y forma el seno valvular. Las válvulas son más numerosas en los segmentos distales.</li><li>En la vena varicosa se describen hipertrofia y luego atrofia de la media, desorganización del músculo liso, desequilibrio colágeno/elastina y aumento de metaloproteinasas.</li></ul>'}},
 {id:'valvula-sana',cat:'Fisiología',title:'Válvula venosa sana',kind:'2d',init:valveSim(0),thumbT:1.55,
  blurb:'Corte longitudinal con flujo de eritrocitos: apertura en sístole muscular, cierre y vórtice del seno valvular.',
  text:{paciente:'<p>Cuando camina, los músculos aprietan las venas y la sangre sube. Las dos hojas de la válvula se abren y la dejan pasar.</p><p>En cuanto el músculo se relaja, la sangre intenta bajar por la gravedad. Llena los pequeños bolsillos detrás de las hojas, las empuja hacia el centro y la válvula se cierra en una fracción de segundo. Así la sangre no regresa al pie.</p>',
   medico:'<ul><li>Apertura con el gradiente anterógrado; las cúspides se apoyan sobre el seno sin tocar la pared, lo que evita la estasis.</li><li>Al invertirse el gradiente, el flujo helicoidal y el vórtice del seno llenan la cara parietal de la cúspide y producen la coaptación.</li><li>Existe un reflujo breve de cierre, fisiológico, habitualmente <b>&lt; 0,5 s</b> en el sistema superficial.</li><li>El vórtice del seno lava la cara parietal y renueva el contacto endotelial con oxígeno; el seno es la zona de menor cizallamiento y lugar típico de inicio de trombos.</li><li>Use el control deslizante para pasar progresivamente a incompetencia y compare el trazado Doppler.</li></ul>'}},
 {id:'valvula-incompetente',cat:'Fisiopatología',title:'Válvula incompetente y reflujo',kind:'2d',init:valveSim(0.85),thumbT:1.8,
  blurb:'Vena dilatada, cúspides que no coaptan, chorro de reflujo y tiempo de reflujo medido en el trazado.',
  text:{paciente:'<p>Si la pared de la vena se debilita y se ensancha, las hojas de la válvula ya no se tocan al cerrarse. Queda un hueco por donde la sangre <b>regresa hacia el pie</b>: eso se llama <b>reflujo</b>.</p><p>La sangre se acumula abajo, la presión sube y la vena se estira todavía más. Con los años se vuelve gruesa, abultada y tortuosa: así se forma una várice.</p>',
   medico:'<ul><li>Mecanismos: dilatación de la pared que separa los bordes libres (teoría parietal), lesión o agenesia valvular, elongación y prolapso de la cúspide, secuela postrombótica.</li><li>Criterio dúplex en bipedestación: reflujo <b>&gt; 0,5 s</b> en safenas, tributarias y venas profundas de la pierna; <b>&gt; 1 s</b> en femoral y poplítea; <b>&gt; 0,5 s</b> en perforantes.</li><li>El reflujo aumenta la carga de volumen y presión distal: círculo vicioso de dilatación → más incompetencia.</li><li>Observe el chorro centrado en el hueco de coaptación y la duración del reflujo en el trazado.</li></ul>'}},
 {id:'bomba-muscular',cat:'Fisiología',title:'Bomba muscular de la pantorrilla',kind:'2d',init:calfPump,thumbT:0.4,
  blurb:'Sístole y diástole muscular, válvulas proximal y distal, perforante y presión venosa ambulatoria.',
  text:{paciente:'<p>La pantorrilla funciona como un <b>segundo corazón</b>. Cada paso contrae el músculo, que exprime las venas profundas y empuja la sangre hacia arriba.</p><p>Al relajarse, la sangre de las venas de la piel pasa a las profundas por unas venas de conexión llamadas <b>perforantes</b>. Por eso caminar baja la presión en el tobillo y estar de pie quieto mucho tiempo la sube.</p>',
   medico:'<ul><li><b>Sístole:</b> la presión intracompartimental supera la venosa; válvula proximal abierta, distal y perforantes cerradas. La fascia muscular inextensible hace eficaz la compresión.</li><li><b>Diástole:</b> caída de presión profunda; llenado desde distal y desde el sistema superficial a través de perforantes.</li><li><b>Presión venosa ambulatoria:</b> de pie en reposo ≈ 80–90 mmHg; caminando desciende a ≈ 20–30 mmHg. Con reflujo o falla de bomba se mantiene alta (≥ 60–70 mmHg).</li><li><b>Tiempo de rellenado venoso</b> (fotopletismografía): &gt; 20 s normal; acortado en reflujo.</li><li>Cambie a "Insuficiencia" para ver la perforante con flujo de salida en sístole y el reflujo safeno en diástole.</li></ul>'}},
 {id:'fascias',cat:'Anatomía',title:'Fascias y compartimento safeno',kind:'2d',init:fasciaSim,thumbT:1,
  blurb:'Corte transversal: piel, tejido subcutáneo, ojo egipcio, fascia muscular, perforante y paquete profundo.',
  text:{paciente:'<p>Bajo la piel hay una capa de grasa y, debajo, una membrana fuerte llamada <b>fascia</b> que envuelve a los músculos. La vena safena va dentro de un túnel formado por dos fascias, que la sostiene.</p><p>Sus ramas, en cambio, quedan en la grasa sin ese soporte. Por eso, cuando hay reflujo, son las ramas las que más se abultan y se ven como várices bajo la piel.</p>',
   medico:'<ul><li>La safena mayor discurre en el <b>compartimento safeno</b>, entre la fascia safena (superficial) y la fascia muscular (profunda): el "ojo egipcio" de la ecografía.</li><li>Las tributarias están por encima de la fascia safena y carecen de soporte, por lo que tienden más a la dilatación varicosa. Ayuda a distinguir en eco la safena de una tributaria paralela o accesoria.</li><li>Las perforantes atraviesan la fascia muscular y llevan flujo normal de superficial a profundo. Se consideran patológicas con reflujo &gt; 0,5 s, diámetro ≥ 3,5 mm y localización bajo úlcera abierta o cicatrizada.</li><li>En insuficiencia crónica se añaden edema intersticial, telangiectasias y pigmento dérmico.</li></ul>'}},
 {id:'compartimentos-3d',cat:'Anatomía',title:'Compartimentos, comunicantes y perforantes',kind:'3d',init:compart3D,thumb:thumbComp,
  blurb:'Bloque 3D de la cara medial del muslo: piel, N3, canal safeno N2, fascia muscular y N1, con eritrocitos en comunicantes y perforantes.',
  text:{paciente:'<p>Las venas de la pierna están en <b>tres pisos</b>: bajo la piel (venas pequeñas y arañitas), en medio la vena safena dentro de un canal formado por una membrana, y abajo, dentro del músculo, las venas profundas.</p><p>Hay dos tipos de venas que conectan: las <b>comunicantes</b> unen venas del mismo piso o de pisos superficiales entre sí; las <b>perforantes</b> atraviesan la membrana del músculo y llevan la sangre de la superficie hacia las venas profundas. Use "Resaltar" para ver cada tipo con la sangre circulando.</p><p>Si una perforante se daña, la sangre sale hacia la superficie al caminar (se ve en naranja) y aumenta la presión en las venas de la piel.</p>',
   medico:'<ul><li><b>Perforante:</b> vena que atraviesa la fascia muscular y conecta el sistema superficial (N2 o N3) con el profundo (N1). <b>Directa</b> si drena en una vena axial (aquí, femoral); <b>indirecta</b> si drena en una vena muscular. Sus válvulas, habitualmente subfasciales, orientan el flujo superficial → profundo.</li><li><b>Comunicante:</b> une venas del mismo sistema sin cruzar la fascia muscular: superficial–superficial (accesoria o tributaria → safena, a menudo atravesando la fascia safena) o profunda–profunda. Nomenclatura del consenso UIP (Caggiati et al., 2002).</li><li><b>N2:</b> la safena mayor en el canal safeno, sostenida por ligamentos fibrosos hasta la fascia safena, junto al nervio safeno. La accesoria anterior también es intrafascial y se alinea sobre los vasos femorales (signo de alineación).</li><li><b>N3:</b> tributarias y accesoria posterior extrafasciales, plexo subdérmico de venas reticulares (1–3 mm) y telangiectasias dérmicas (&lt; 1 mm) que drenan hacia ellas (C1).</li><li><b>Incompetencia:</b> perforante patológica con flujo saliente &gt; 0,5 s y diámetro ≥ 3,5 mm (especialmente bajo úlcera). La comunicante puede invertirse y alimentar tributarias desde una safena con reflujo.</li><li>Ciclo animado: sístole muscular (0–1,5 s) y diástole (1,5–3 s). Normal: la perforante cierra en sístole y drena en diástole.</li></ul>'}},
 {id:'union-safenofemoral',cat:'Diagnóstico',title:'Unión safeno‑femoral y Valsalva',kind:'2d',init:sfjSim,thumbT:1,
  blurb:'Cayado con válvulas terminal y preterminal, tributarias, maniobra de Valsalva y trazado Doppler.',
  text:{paciente:'<p>En la ingle, la vena safena desemboca en la vena grande del muslo. Ahí hay una válvula de entrada que funciona como puerta.</p><p>Durante el ultrasonido el médico le pide <b>pujar</b> (maniobra de Valsalva) o le aprieta la pantorrilla. Si la puerta cierra bien, la sangre no baja. Si no cierra, el ultrasonido muestra sangre bajando por la safena: esa es una causa frecuente de várices.</p>',
   medico:'<ul><li>Válvula <b>terminal</b> en el ostium y <b>preterminal</b> unos 2–5 cm distal, por debajo de la desembocadura de las tributarias del cayado (epigástrica superficial, circunfleja ilíaca superficial, pudendas externas).</li><li>Valsalva: aumento de presión intraabdominal; con válvulas competentes solo hay un reflujo breve de cierre.</li><li>Compresión distal y liberación: aumento anterógrado y luego se evalúa el reflujo tras la liberación.</li><li>Reflujo patológico: <b>&gt; 0,5 s</b> en safena; <b>&gt; 1 s</b> en vena femoral común.</li><li>La competencia de la preterminal con terminal incompetente sugiere reflujo limitado al ostium, útil para planificar la estrategia terapéutica.</li></ul>'}},
 {id:'progresion-varice',cat:'Morfología',title:'De vena sana a várice en 3D',kind:'3d',init:tort3D,thumb:thumbTort,
  blurb:'Dilatación, elongación y tortuosidad progresivas, válvulas que fallan y reflujo dentro de la vena.',
  text:{paciente:'<p>Mueva el control de "sana" a "várice". Con el reflujo, la vena se ensancha y además se <b>alarga</b>. Como no cabe en el mismo espacio, se dobla y se enrosca: por eso las várices se ven tortuosas y con bultos.</p><p>Las válvulas fallan una tras otra (se ponen naranjas) y la sangre empieza a ir hacia abajo.</p>',
   medico:'<ul><li>Várice: vena superficial subcutánea dilatada <b>≥ 3 mm</b> en bipedestación (CEAP C2); reticular &lt; 3 mm y telangiectasia &lt; 1 mm (C1).</li><li>La elongación de la pared genera tortuosidad; las dilataciones saculares suelen coincidir con debilidad parietal focal.</li><li>Progresión del reflujo: se discuten teorías descendente (desde la unión) y ascendente o multifocal (desde tributarias), esta última apoyada por estudios de seguimiento.</li><li>Se muestra la fascia muscular separando el sistema superficial del profundo y una perforante que se vuelve incompetente en fases avanzadas.</li></ul>'}},
 {id:'microcirculacion',cat:'Fisiopatología',title:'Microcirculación e hipertensión venosa',kind:'2d',init:microSim,thumbT:1.2,
  blurb:'Fuerzas de Starling, edema, fuga de eritrocitos, hemosiderina, leucocitos y manguito de fibrina.',
  text:{paciente:'<p>La presión alta en las venas llega hasta los vasos más pequeños de la piel. El líquido se escapa y aparece <b>hinchazón</b> en el tobillo.</p><p>Con los años también escapan glóbulos rojos; su hierro deja <b>manchas oscuras</b> en la piel. La piel se inflama, se endurece y puede llegar a abrirse una <b>úlcera</b>. Pulse "Simular años de hipertensión venosa".</p>',
   medico:'<ul><li>La hipertensión venosa ambulatoria eleva la presión venular y capilar: aumenta la filtración neta (Starling) y supera la capacidad de drenaje linfático → edema (C3).</li><li>Ensanchamiento de uniones endoteliales, extravasación eritrocitaria y depósito de <b>hemosiderina</b> → pigmentación (C4a).</li><li>Bajo cizallamiento y activación endotelial: rodamiento, adhesión (ICAM‑1, VCAM‑1) y migración leucocitaria; liberación de MMP y citocinas → lipodermatoesclerosis (C4b).</li><li>Manguitos pericapilares de fibrina (Browse y Burnand) y atrapamiento de factores de crecimiento (Falanga) como hipótesis de la hipoxia tisular y la úlcera (C5–C6).</li></ul>'}},
 {id:'escleroterapia',cat:'Tratamiento',title:'Escleroterapia: cómo se cierra una vena',kind:'2d',init:scleroSim,thumbT:8,
  blurb:'Punción, inyección de espuma o líquido, daño endotelial, compresión y fibrosis, con concentraciones y agujas según calibre.',
  text:{paciente:'<p>La escleroterapia trata arañitas y várices sin cirugía. Con una aguja muy fina se inyecta dentro de la vena un medicamento (habitualmente <b>polidocanol</b>), en líquido o batido como <b>espuma</b>.</p><p>El medicamento irrita la capa interna de la vena. La vena se contrae y sus paredes se pegan. Por eso, después le pondremos <b>compresión</b> (vendaje o media) y le pediremos que camine. En las semanas siguientes el cuerpo convierte la vena en un cordón y la reabsorbe poco a poco.</p><p>Es normal que la zona se vea morada o con pequeños bultos unas semanas. A veces quedan manchas color café que suelen aclarar con el tiempo. Pueden necesitarse varias sesiones. Use "Paso" para ver cada momento y "Compresión" para ver por qué es importante.</p><p><b>Más concentración no es mejor.</b> Cada tamaño de vena tiene una dosis justa (zona verde de la escala). Si es baja, la vena se vuelve a abrir. Si es muy alta, el medicamento daña también la pared y el tejido alrededor: más inflamación, dolor, manchas y nuevas arañitas, y si se sale de la vena puede lastimar la piel.</p><p><b>Espuma o líquido.</b> El líquido se mezcla con la sangre y pierde fuerza, como una gota de jabón en un vaso de agua. La espuma son burbujitas de aire cubiertas del medicamento: empujan la sangre y tocan directamente la pared de la vena, por eso funciona con menos cantidad en venas más grandes.</p>',
   medico:'<ul><li><b>Mecanismo:</b> los detergentes (polidocanol, tetradecilsulfato sódico) desnaturalizan la membrana lipídica del endotelio. Producen descamación endotelial, exposición del colágeno subendotelial, vasoespasmo, adhesión plaquetaria y esclerotrombo, y después fibrosis. Objetivo: cordón fibroso, no trombo.</li><li><b>Química:</b> el polidocanol (lauromacrogol 400) es un detergente no iónico anfipático: cabeza hidrófila y cola lipófila. Se inserta en la bicapa lipídica del endotelio y la disuelve. El efecto depende de la concentración que llega a la pared y del tiempo de contacto.</li><li><b>Líquido:</b> se diluye en la sangre y se inactiva parcialmente al unirse a albúmina y otras proteínas plasmáticas y a membranas de eritrocitos y plaquetas. La concentración en la pared cae con la distancia y con el calibre: en venas grandes el líquido pierde eficacia.</li><li><b>Espuma:</b> el detergente actúa como tensioactivo y estabiliza microburbujas de gas, con las colas hacia el gas y las cabezas hacia fuera. La espuma desplaza la sangre (efecto émbolo), aumenta la superficie y el tiempo de contacto, y casi no se diluye. A igual concentración es más potente que el líquido, lo que permite usar concentraciones menores (Hamel‑Desnos 2003). El CO₂/O₂ se absorbe más rápido que el aire (N₂), con menos síntomas neurológicos.</li><li><b>Ventana terapéutica:</b> por debajo hay denudación endotelial parcial y recanalización. Por encima, la lesión alcanza la media y el tejido perivenoso: más inflamación, flebitis, pigmentación por hemosiderina, matting y, con extravasación o inyección arteriolar, necrosis cutánea. El objetivo es la mínima concentración eficaz para cada calibre.</li><li><b>Concentraciones de polidocanol (guía europea 2014):</b> telangiectasias 0,25–0,5 % líquido; reticulares 0,5–1 % líquido o 0,5 % espuma; tributarias 0,5–1 % espuma; troncos safenos 1–3 % espuma, ecoguiada.</li><li><b>Espuma (Tessari):</b> 1 parte de líquido y 4 de aire (o CO₂/O₂) con dos jeringas y llave de tres vías; usar de inmediato. La espuma desplaza la sangre: menos dilución y más contacto, más eficaz en venas ≥ 3 mm. Volumen máximo habitual: 10 mL por sesión.</li><li><b>Dosis:</b> 1 mL al 1 % = 10 mg. Máximo de polidocanol 2 mg/kg/día; verifique la ficha técnica local.</li><li><b>Técnica:</b> aguja 30–32 G en telangiectasias, 27–30 G en reticulares; bisel hacia arriba, inyección lenta a baja presión. Suspenda si aparece habón o dolor (extravasación).</li><li><b>Después:</b> compresión (vendaje o media) y deambulación inmediata. Evaluar trombo atrapado y hacer microtrombectomía a las 1–3 semanas para reducir la pigmentación.</li><li><b>Complicaciones:</b> hiperpigmentación, matting telangiectásico, tromboflebitis, necrosis cutánea (extravasación o inyección arteriolar), TVP rara, alteraciones visuales o migraña con espuma (shunt derecha‑izquierda), alergia rara.</li><li><b>Contraindicaciones:</b> alergia conocida al esclerosante, TVP o TEP agudos, infección local o sistémica grave, inmovilidad prolongada, shunt derecha‑izquierda sintomático conocido (con espuma).</li></ul><p><b>Referencias</b></p><ol style="font-size:13px;padding-left:18px"><li>Rabe E, Breu FX, Cavezzi A, et al. European guidelines for sclerotherapy in chronic venous disorders. <i>Phlebology</i>. 2014;29(6):338‑354.</li><li>De Maeseneer MG, Kakkos SK, Aherne T, et al. ESVS 2022 Clinical Practice Guidelines on the Management of Chronic Venous Disease of the Lower Limbs. <i>Eur J Vasc Endovasc Surg</i>. 2022;63(2):184‑267.</li><li>Tessari L, Cavezzi A, Frullini A. Preliminary experience with a new sclerosing foam in the treatment of varicose veins. <i>Dermatol Surg</i>. 2001;27(1):58‑60.</li><li>Breu FX, Guggenbichler S, Wollmann JC. 2nd European Consensus Meeting on Foam Sclerotherapy 2006. <i>Vasa</i>. 2008;37(Suppl 71):1‑29.</li><li>Hamel‑Desnos C, Desnos P, Wollmann JC, et al. Evaluation of the efficacy of polidocanol in the form of foam compared with liquid form in sclerotherapy of the greater saphenous vein: initial results. <i>Dermatol Surg</i>. 2003;29(12):1170‑1175.</li><li>Parsi K, Exner T, Connor DE, et al. The lytic effects of detergent sclerosants on erythrocytes, platelets, endothelial cells and microparticles are attenuated by albumin and other plasma components in vitro. <i>Eur J Vasc Endovasc Surg</i>. 2008;36(2):216‑223.</li><li>Goldman MP, Weiss RA. <i>Sclerotherapy: Treatment of Varicose and Telangiectatic Leg Veins</i>. 6.ª ed. Elsevier; 2017.</li></ol>'}},
 {id:'trombosis-venosa-profunda',cat:'Trombosis',title:'Trombosis venosa profunda',kind:'2d',init:dvtSim,thumbT:16,
  blurb:'Tríada de Virchow, nido en el seno valvular, propagación, embolia pulmonar, ecografía de compresión y anticoagulación.',
  text:{paciente:'<p>Una <b>trombosis venosa profunda</b> es un coágulo dentro de una vena profunda, casi siempre de la pierna. Suele empezar en el pequeño bolsillo que hay detrás de una válvula, donde la sangre se mueve muy despacio.</p><p>Se juntan tres cosas: la sangre <b>quieta</b> (reposo, cirugía, viajes largos), la sangre <b>más espesa de lo normal</b> (cáncer, embarazo, hormonas) y una <b>pared lastimada</b> (golpes, operaciones). Mueva los tres controles y verá que con uno solo rara vez se forma el coágulo.</p><p>El coágulo crece hacia el corazón. Si un pedazo se suelta, viaja al pulmón: es la <b>embolia pulmonar</b>, una urgencia. Por eso el tratamiento con <b>anticoagulantes</b> es importante: evita que crezca y que se suelte, mientras el cuerpo lo va disolviendo poco a poco.</p><p>Acuda a urgencias si tiene falta de aire, dolor en el pecho, tos con sangre o desmayo.</p>',
   medico:'<ul><li><b>Inicio:</b> la mayoría de las TVP comienzan en el seno valvular de las venas de la pantorrilla. El flujo lento produce hipoxia del seno, que activa el endotelio: expresión de P‑selectina, liberación de factor von Willebrand y exposición de factor tisular.</li><li><b>Inmunotrombosis:</b> neutrófilos y monocitos se adhieren. Los monocitos aportan factor tisular y los neutrófilos liberan <b>NETs</b>, que atrapan plaquetas y eritrocitos y activan el factor XII. Se forma un <b>trombo rojo</b> rico en fibrina y eritrocitos, con líneas de Zahn.</li><li><b>Propagación</b> proximal y cola no adherida: riesgo de embolia pulmonar, mayor en trombos proximales (poplítea y más arriba). Las TVP distales aisladas tienen menor riesgo embólico.</li><li><b>Diagnóstico:</b> probabilidad clínica (Wells), dímero D (alta sensibilidad y baja especificidad; útil para descartar con probabilidad baja) y <b>ecografía de compresión</b>: una vena que no se colapsa bajo el transductor confirma la TVP.</li><li><b>Tratamiento:</b> la anticoagulación (anticoagulantes orales directos o heparina seguida de antagonistas de la vitamina K) detiene la extensión y la embolia, pero no lisa el trombo. La plasmina endógena lo reduce y el resto se organiza. Duración mínima de 3 meses; prolongada según el factor desencadenante y el riesgo de sangrado. Trombólisis dirigida por catéter en casos seleccionados (flegmasia, TVP iliofemoral extensa en pacientes jóvenes).</li><li><b>Prevención:</b> movilización precoz, compresión mecánica y tromboprofilaxis farmacológica según el riesgo.</li></ul><p><b>Referencias</b></p><ol style="font-size:13px;padding-left:18px"><li>Wolberg AS, Rosendaal FR, Weitz JI, et al. Venous thrombosis. <i>Nat Rev Dis Primers</i>. 2015;1:15006.</li><li>Bovill EG, van der Vliet A. Venous valvular stasis‑associated hypoxia and thrombosis: what is the link? <i>Annu Rev Physiol</i>. 2011;73:527‑545.</li><li>von Brühl ML, Stark K, Steinhart A, et al. Monocytes, neutrophils, and platelets cooperate to initiate and propagate venous thrombosis in mice in vivo. <i>J Exp Med</i>. 2012;209(4):819‑835.</li><li>Wells PS, Anderson DR, Rodger M, et al. Evaluation of D‑dimer in the diagnosis of suspected deep‑vein thrombosis. <i>N Engl J Med</i>. 2003;349(13):1227‑1235.</li><li>Stevens SM, Woller SC, Kreuziger LB, et al. Antithrombotic therapy for VTE disease: second update of the CHEST guideline. <i>Chest</i>. 2021;160(6):e545‑e608.</li><li>Ortel TL, Neumann I, Ageno W, et al. ASH 2020 guidelines for management of venous thromboembolism: treatment of DVT and PE. <i>Blood Adv</i>. 2020;4(19):4693‑4738.</li></ol>'}},
 {id:'sindrome-postrombotico',cat:'Trombosis',title:'Síndrome postrombótico',kind:'2d',init:ptsSim,thumbT:9,
  blurb:'Organización y recanalización del trombo, sinequias, válvula destruida, obstrucción residual y escala de Villalta en la pierna.',
  text:{paciente:'<p>Después de una trombosis, el cuerpo no "borra" el coágulo: lo convierte en <b>cicatriz</b> dentro de la vena. Con los meses se abren canales para que la sangre pase de nuevo, pero quedan bandas de cicatriz y la vena se vuelve rígida.</p><p>Si la válvula quedó atrapada en el coágulo, se daña y ya no cierra: la sangre se regresa hacia el pie. Si la vena no se abre bien, la sangre tiene que buscar otros caminos. En ambos casos la presión en la pierna sube.</p><p>Eso produce el <b>síndrome postrombótico</b>: pesadez, hinchazón, calambres, manchas oscuras, piel dura y, en casos graves, úlceras cerca del tobillo. Mueva el tiempo y vea cómo cambia la pierna. Caminar, cuidar el peso y, cuando el médico la indica, la media de compresión ayudan a controlar los síntomas.</p>',
   medico:'<ul><li><b>Frecuencia:</b> se desarrolla en un 20–50 % de los pacientes tras una TVP proximal; grave en un 5–10 %. Suele manifestarse en los primeros 1–2 años.</li><li><b>Fisiopatología:</b> el trombo se organiza (fibroblastos, neovascularización, depósito de colágeno) y se recanaliza de forma incompleta, con sinequias y trabéculas. Las válvulas atrapadas se engrosan, se acortan y se adhieren a la pared, lo que causa <b>reflujo</b>. La <b>obstrucción residual</b> limita el drenaje y obliga a desarrollar colaterales. La suma de ambas produce hipertensión venosa ambulatoria, con la microangiopatía y los cambios cutáneos de la enfermedad venosa crónica (C3–C6).</li><li><b>Factores de riesgo:</b> TVP iliofemoral, TVP ipsilateral recurrente, síntomas persistentes al mes, obesidad, edad avanzada y anticoagulación subterapéutica en los primeros meses.</li><li><b>Diagnóstico:</b> clínico, con la escala de Villalta a partir de 3–6 meses tras la fase aguda: 5 síntomas y 6 signos de 0 a 3, más la úlcera. &lt; 5 sin SPT; 5–9 leve; 10–14 moderado; ≥ 15 o úlcera grave (recomendación ISTH, Kahn 2009). La ecografía muestra engrosamiento parietal, sinequias, reflujo y obstrucción.</li><li><b>Prevención:</b> anticoagulación adecuada desde el inicio. El ensayo SOX no mostró que la media de compresión prevenga el SPT, aunque puede aliviar síntomas. El ensayo ATTRACT no redujo la incidencia global con la trombólisis farmacomecánica, aunque sí la gravedad en algunos casos iliofemorales.</li><li><b>Tratamiento:</b> compresión para los síntomas, ejercicio supervisado, control del peso, cuidado de la piel y de las úlceras. En la obstrucción iliocava sintomática se valora la recanalización endovascular con stent.</li></ul><p><b>Referencias</b></p><ol style="font-size:13px;padding-left:18px"><li>Kahn SR, Comerota AJ, Cushman M, et al. The postthrombotic syndrome: evidence‑based prevention, diagnosis, and treatment strategies. A scientific statement from the American Heart Association. <i>Circulation</i>. 2014;130(18):1636‑1661.</li><li>Kahn SR, Partsch H, Vedantham S, Prandoni P, Kearon C. Definition of post‑thrombotic syndrome of the leg for use in clinical investigations: a recommendation for standardization. <i>J Thromb Haemost</i>. 2009;7(5):879‑883.</li><li>Kahn SR, Shapiro S, Wells PS, et al. Compression stockings to prevent post‑thrombotic syndrome: a randomised placebo‑controlled trial (SOX). <i>Lancet</i>. 2014;383(9920):880‑888.</li><li>Vedantham S, Goldhaber SZ, Julian JA, et al. Pharmacomechanical catheter‑directed thrombolysis for deep‑vein thrombosis (ATTRACT). <i>N Engl J Med</i>. 2017;377(23):2240‑2252.</li><li>Prandoni P, Lensing AW, Cogo A, et al. The long‑term clinical course of acute deep venous thrombosis. <i>Ann Intern Med</i>. 1996;125(1):1‑7.</li></ol>'}},
];

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
      d.innerHTML=`<span></span><input type="checkbox" id="${id}" ${val?'checked':''}>`;d.firstChild.textContent=label;d.querySelector('input').addEventListener('change',e=>fn(e.target.checked));root.appendChild(d)},
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
    b.dataset.new=m.sources?'true':'false';if(m.sources){b.querySelector('.kind').textContent='Nuevo · 3D';b.querySelector('.kind').classList.add('new-kind')}b.querySelector('.eyebrow').textContent=m.cat;b.querySelector('h3').textContent=m.title;b.querySelector('p').textContent=m.blurb;b.onclick=()=>openMod(i);grid.appendChild(b);
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
 'pared-3d':[
  {s:'Así es una vena por dentro. Es un tubo con tres capas, como una manguera muy fina.',a:[['tg','Válvula incompetente',false],['tg','Mostrar eritrocitos',true]],c:HOME3.pared},
  {s:'La capa de adentro se llama endotelio. Es lisa como el cristal y evita que la sangre se pegue y forme coágulos.',c:{p:[-4.4,0.6,3.2],t:[-2.9,-0.2,0.6]},pt:[[-3.0,-0.35,0.96,'Endotelio']]},
  {s:'En medio hay una capa de músculo, que le da firmeza a la vena.',c:{p:[-3.4,0.9,3.8],t:[-1.9,-0.3,0.8]},pt:[[-1.8,-0.41,1.12,'Capa muscular']]},
  {s:'Por fuera, una envoltura de colágeno la sostiene, con sus propios vasos y nervios muy pequeños.',c:{p:[-0.6,1.4,4.6],t:[0,-0.3,0.6]},pt:[[-0.9,-0.93,1.33,'Colágeno']]},
  {s:'Los puntos rojos son glóbulos rojos que viajan hacia el corazón.',c:{p:[-1.2,0.5,4.4],t:[-0.6,0,0]},pt:[[-1.6,0,0,'Glóbulos rojos']]},
  {s:'Dentro de la vena hay una válvula con dos hojas, como una puerta doble.',c:{p:[2.4,1.5,3.4],t:[1.0,0,0]},pt:[[1.1,0.2,0.6,'Válvula']],v:0.6},
  {s:'Cuando la sangre sube, las hojas se abren. Cuando intenta regresar, se cierran y la detienen.',v:0.6},
  {s:'Ahora vea una válvula enferma. Las hojas ya no se juntan.',a:[['tg','Válvula incompetente',true]],pt:[[1.3,0.1,0.3,'Hueco entre las hojas']],v:0.6},
  {s:'Queda un hueco y la sangre se regresa hacia el pie. Ese regreso de sangre se llama reflujo, y es el origen de las várices.',v:0.8},
  {s:'En resumen: una vena sana tiene paredes firmes y válvulas que cierran bien. Cuando la pared se debilita o la válvula falla, la sangre se acumula en la pierna.',a:[['tg','Válvula incompetente',false]],c:HOME3.pared,v:1}],
 'valvula-sana':[
  {s:'Esta es una vena de la pierna, vista por dentro y cortada a lo largo.',a:[['btn','Válvula sana']],c:[500,300,1],v:0.7},
  {s:'El pie está a la izquierda, y el corazón a la derecha.',pt:[[70,262,'Pie'],[930,262,'Corazón']]},
  {s:'Cuando usted camina, los músculos aprietan la vena, y la sangre avanza hacia el corazón.',c:[560,262,1.5],sp:[560,262,360,110]},
  {s:'Las dos hojas de la válvula se abren y se apoyan en la pared para dejarla pasar.',c:[545,262,2.3],pt:[[545,212,'Hoja de la válvula'],[545,312,'']],v:0.45},
  {s:'Cuando el músculo se relaja, la gravedad jala la sangre hacia abajo.',v:0.45},
  {s:'La sangre llena el pequeño bolsillo que hay detrás de cada hoja, y las empuja hacia el centro.',c:[570,232,3],pt:[[575,200,'Bolsillo']]},
  {s:'Así, la válvula se cierra en menos de medio segundo. Ese pequeño remolino también la limpia y la mantiene sana.',c:[560,262,2.2],pt:[[582,262,'Cierre']]},
  {s:'Abajo ve un registro como el del ultrasonido Doppler.',c:[725,520,1.9],sp:[725,524,270,80],v:1},
  {s:'Las barras rojas son la sangre que sube. Casi no hay barras naranjas, porque la sangre no regresa.'},
  {s:'Así funciona una válvula sana: deja pasar la sangre en un solo sentido.',c:[500,300,1]}],
 'valvula-incompetente':[
  {s:'Empecemos con una válvula sana. Sus dos hojas se juntan y no dejan regresar la sangre.',a:[['btn','Válvula sana']],c:[545,262,2],pt:[[582,262,'Hojas juntas']],v:0.5},
  {s:'Ahora la pared de la vena se debilita y se ensancha poco a poco.',a:[['anim','Grado de incompetencia valvular',0.55,5]],c:[520,262,1.3]},
  {s:'Las hojas de la válvula quedan cada vez más separadas.',a:[['anim','Grado de incompetencia valvular',0.9,4]],c:[545,262,2]},
  {s:'Mire el hueco entre las hojas. Al relajarse el músculo, la sangre se regresa hacia el pie por ahí.',c:[530,262,2.4],pt:[[533,262,'Hueco']],v:0.45},
  {s:'Los glóbulos de color naranja son ese regreso de sangre, llamado reflujo.',c:[420,262,1.6],sp:[420,262,380,120],pt:[[380,262,'Reflujo']]},
  {s:'En el registro de abajo aparecen barras naranjas. Si el reflujo dura más de medio segundo, el médico lo considera anormal.',c:[725,520,1.9],sp:[725,524,270,80],v:1},
  {s:'La sangre que regresa se acumula, la presión sube y la vena se estira todavía más.',c:[300,262,1.3]},
  {s:'Así, con los años, la vena se vuelve gruesa, abultada y torcida. Eso es una várice.',c:[500,300,1]}],
 'bomba-muscular':[
  {s:'La pantorrilla funciona como un segundo corazón.',a:[['seg','Estado venoso',0]],c:[460,330,1.15]},
  {s:'Aquí ve la pierna por dentro: la piel, la grasa, una membrana llamada fascia, y los músculos.',pt:[[196,200,'Piel'],[270,140,'Grasa'],[360,250,'Fascia'],[450,300,'Músculo']]},
  {s:'Cada vez que da un paso, el músculo se contrae y exprime las venas profundas.',c:[550,300,1.6],sp:[550,300,160,250],pt:[[550,300,'Vena profunda']],v:0.6},
  {s:'La sangre sube hacia el corazón, y la válvula de abajo se cierra para que no regrese.',pt:[[550,170,'Abre'],[550,440,'Cierra']]},
  {s:'Al relajarse, la sangre de las venas de la piel pasa a las profundas por una vena de conexión, la perforante.',c:[410,400,2],pt:[[410,410,'Perforante']]},
  {s:'Mire la gráfica. Al caminar, la presión en el tobillo baja de unos noventa a unos veinticinco.',c:[870,240,1.9],sp:[880,230,140,150],v:1},
  {s:'Si se queda de pie sin moverse, la bomba se apaga y la presión vuelve a subir.',a:[['btn','Detenerse']]},
  {s:'Ahora, con las válvulas dañadas.',a:[['btn','Caminar'],['seg','Estado venoso',1]],c:[460,330,1.15]},
  {s:'Aunque camine, la sangre se regresa por la safena y sale por la perforante hacia la piel.',c:[340,340,1.7],pt:[[290,320,'Reflujo en safena'],[400,400,'Sale hacia la piel']],v:0.6},
  {s:'La presión se queda alta, y eso causa hinchazón, cansancio y várices.',c:[870,240,1.9],sp:[880,230,140,150],v:1},
  {s:'Por eso le recomendamos caminar, mover los tobillos y no pasar mucho tiempo quieto.',c:[500,300,1]}],
 'fascias':[
  {s:'Este es un corte de la pierna, como si viera una rebanada.',a:[['seg','Estado',0]],c:[500,300,1]},
  {s:'Arriba está la piel, luego la grasa, y abajo el músculo.',pt:[[120,60,'Piel'],[150,200,'Grasa'],[150,450,'Músculo']]},
  {s:'Entre la grasa y el músculo hay membranas fuertes llamadas fascias.',c:[450,280,1.6],pt:[[330,215,'Fascia safena'],[600,334,'Fascia muscular']]},
  {s:'La vena safena va dentro de un túnel formado por dos de ellas. En el ultrasonido parece un ojo, por eso se le llama el ojo egipcio.',c:[450,272,2.6],sp:[450,272,130,70],pt:[[450,272,'Safena']]},
  {s:'Abajo, junto a la arteria, están las venas profundas.',c:[432,480,2.4],pt:[[396,486,'Vena'],[432,478,'Arteria']]},
  {s:'Una vena perforante une la safena con ellas, y normalmente lleva la sangre de afuera hacia adentro.',c:[445,380,2],pt:[[440,380,'Perforante']],v:0.6},
  {s:'Ahora, con insuficiencia venosa.',a:[['seg','Estado',1]],c:[500,300,1],v:1},
  {s:'La safena está protegida por su túnel y se ensancha poco.',c:[450,272,2.4],pt:[[450,272,'Safena']]},
  {s:'Pero sus ramas en la grasa no tienen ese soporte y se hinchan mucho: son las várices que usted ve.',c:[775,160,2.2],pt:[[780,165,'Rama varicosa']]},
  {s:'La perforante se invierte y empuja sangre hacia afuera. Aparecen hinchazón, arañitas y manchas en la piel.',c:[500,250,1.3],pt:[[440,380,'Flujo invertido'],[700,75,'Arañitas y manchas']]}],
 'compartimentos-3d':[
  {s:'Este modelo muestra un bloque del muslo, con todas sus capas en su lugar.',a:[['seg','Resaltar',0],['tg','Insuficiencia venosa',false],['sl','Separación de capas',0]],c:HOME3.comp},
  {s:'Vamos a separarlas, como las páginas de un libro.',a:[['anim','Separación de capas',0.8,3]],c:{p:[8,6.5,11],t:[0,1.2,0]}},
  {s:'Arriba está la piel, con pequeñas arañitas.',c:{p:[3,7.5,6],t:[-1,4.2,0]},pt:[[-2.0,4.15,0.2,'Piel y arañitas']]},
  {s:'Debajo, en la grasa, hay venas pequeñas y ramas.',c:{p:[3,5,7],t:[-0.5,2.5,1.5]},pt:[[-1,2.52,2.32,'Rama superficial']]},
  {s:'En medio va la vena safena, dentro de su canal.',c:{p:[3,3.5,7],t:[-1,1.2,0.8]},pt:[[-2,1.25,0.8,'Vena safena']]},
  {s:'Y abajo, dentro del músculo, están las venas profundas y la arteria.',c:{p:[2,0.5,7.5],t:[-1,-0.9,-1]},pt:[[-2,-0.9,-1.0,'Vena profunda y arteria']]},
  {s:'Estas venas en verde se llaman comunicantes. Unen venas del mismo sistema, por ejemplo una rama con la safena, y no atraviesan la membrana del músculo.',a:[['seg','Resaltar',1]],c:{p:[6,4.5,8],t:[0.5,1.5,0.5]},pt:[[1.1,1.56,1.25,'Comunicante']]},
  {s:'Estas en violeta son las perforantes. Atraviesan la membrana del músculo y llevan la sangre de la superficie a las venas profundas.',a:[['seg','Resaltar',2]],c:{p:[7,3,7],t:[1.5,0,0]},pt:[[2.6,0.43,0.2,'Perforante']]},
  {s:'Tienen válvulas para que la sangre vaya solo hacia adentro.'},
  {s:'Cuando hay insuficiencia, la perforante deja salir sangre hacia la superficie, y la safena tiene reflujo.',a:[['seg','Resaltar',0],['tg','Insuficiencia venosa',true]],c:{p:[8,6.5,11],t:[0,1.2,0]}},
  {s:'Conocer estas capas permite a su médico decidir qué vena tratar y cómo hacerlo.',a:[['anim','Separación de capas',0,3]],c:HOME3.comp}],
 'union-safenofemoral':[
  {s:'Aquí estamos en la ingle.',a:[['seg','Estado de la unión',0]],c:[500,300,1]},
  {s:'La vena safena, que sube por la pierna, desemboca en la vena grande del muslo, la femoral.',c:[560,330,1.4],pt:[[450,450,'Vena safena'],[610,480,'Vena femoral']]},
  {s:'Justo en la entrada hay una válvula que funciona como puerta. Y un poco más abajo, otra de respaldo.',c:[560,285,2.4],pt:[[569,271,'Puerta'],[521,309,'Respaldo']]},
  {s:'Durante el ultrasonido, el médico le pide que puje, como si inflara un globo.',a:[['btn','Maniobra de Valsalva']],c:[590,230,1.4],pt:[[610,70,'Presión del abdomen']]},
  {s:'La presión empuja la sangre hacia abajo. Si la puerta cierra bien, la sangre no baja por la safena.',c:[560,285,2.4],pt:[[569,271,'Cerrada']],v:0.7},
  {s:'Ahora, la válvula está dañada.',a:[['seg','Estado de la unión',1]],c:[500,300,1],v:1},
  {s:'Al pujar, la sangre baja por la safena.',a:[['btn','Maniobra de Valsalva']],c:[520,360,1.6],pt:[[470,400,'Reflujo']],v:0.8},
  {s:'En el registro aparecen barras naranjas por más de medio segundo. Esto confirma el reflujo.',c:[184,490,2],sp:[184,490,170,95],v:1},
  {s:'El médico también puede apretar la pantorrilla y soltarla. Al soltar, si la válvula falla, la sangre se regresa.',a:[['btn','Compresión distal']],c:[420,420,1.3]},
  {s:'Con estas pruebas sabemos dónde empieza el problema, y cómo tratarlo.',c:[500,300,1]}],
 'progresion-varice':[
  {s:'Esta es una vena superficial sana de la pierna.',a:[['tg','Mostrar piel',false],['sl','Progresión de la enfermedad',0.05]],c:HOME3.prog},
  {s:'Es delgada y recta. La sangre sube sin regresar, y los anillos verdes son sus válvulas.',c:{p:[2.2,1.4,4.2],t:[0,0.6,0.3]},pt:[[0,0.72,0.4,'Válvula']]},
  {s:'Con el tiempo, si las válvulas empiezan a fallar, la vena se ensancha un poco.',a:[['anim','Progresión de la enfermedad',0.35,5]],c:HOME3.prog},
  {s:'Después se hace más ancha y también más larga. Como no cabe en el mismo espacio, se dobla.',a:[['anim','Progresión de la enfermedad',0.65,6]]},
  {s:'Las válvulas dañadas se ponen naranjas, y la sangre empieza a regresar.',c:{p:[3,1.5,4.5],t:[0.4,0.6,0.3]},pt:[[0.45,0.72,0.4,'Válvula dañada']],v:0.7},
  {s:'En etapas avanzadas la vena forma bultos y curvas. Eso es una várice: mide más de tres milímetros y se ve bajo la piel.',a:[['anim','Progresión de la enfermedad',0.95,5],['tg','Mostrar piel',true]],c:{p:[6,2,9.5],t:[0.3,0,-0.3]},v:1},
  {s:'Al fondo están la membrana del músculo y la vena profunda. La perforante que las une también puede dañarse.',a:[['tg','Mostrar piel',false]],c:{p:[7,3,3],t:[1.4,0,-2]},pt:[[2.2,-2,-2.6,'Vena profunda']]},
  {s:'Por eso conviene tratar las várices a tiempo, antes de que crezcan y dañen la piel.',c:HOME3.prog}],
 'microcirculacion':[
  {s:'Ahora vamos a lo más pequeño: los capilares de la piel.',a:[['btn','Restablecer']],c:[500,300,1]},
  {s:'Aquí la sangre entrega oxígeno y recoge desechos.',c:[480,225,1.7],pt:[[480,225,'Capilar']]},
  {s:'Un poco de líquido sale del capilar hacia el tejido, y luego regresa.',pt:[[320,175,'Sale'],[650,175,'Regresa']]},
  {s:'Lo que sobra lo recoge un vaso linfático. Todo está en equilibrio.',c:[580,400,1.6],pt:[[600,420,'Vaso linfático']]},
  {s:'Cuando las venas no funcionan, la presión alta llega hasta aquí.',a:[['anim','Presión venosa',70,4]],c:[800,225,1.7],pt:[[860,225,'Presión alta']]},
  {s:'Sale más líquido del que puede regresar, y se acumula. Esa es la hinchazón del tobillo.',c:[600,280,1.3],sp:[600,300,400,170]},
  {s:'Con los años, también salen glóbulos rojos. Su hierro se queda en la piel y deja manchas color café.',a:[['btn','Simular años']],c:[850,250,2],pt:[[850,300,'Hierro: manchas']]},
  {s:'Los glóbulos blancos se pegan a la pared e inflaman la piel, que se vuelve dura.',c:[850,225,2.4],pt:[[860,205,'Glóbulo blanco']]},
  {s:'Alrededor de los capilares se forma una capa que dificulta el paso del oxígeno. La piel se debilita, y puede abrirse una úlcera.',c:[700,225,1.6],pt:[[800,262,'Capa que bloquea']]},
  {s:'Por eso, bajar la presión en las venas caminando, elevando las piernas y usando compresión cuando su médico la indique, protege su piel.',c:[500,300,1]}],
 'escleroterapia':[
  {s:'La escleroterapia trata las várices y arañitas sin cirugía.',a:[['seg','Tipo de vena',2],['seg','Agente',1],['sl','Concentración',1],['tg','Compresión',true],['tg','Simular extravasación',false],['seg','Paso',0]],c:[500,300,1]},
  {s:'Aquí ve una vena de la pierna, bajo la piel y la grasa.',c:[520,250,1.4],pt:[[640,310,'Vena'],[880,86,'Piel']]},
  {s:'Con una aguja muy fina, el médico entra en la vena.',a:[['seg','Paso',1]],c:[400,230,1.6],pt:[[340,190,'Aguja']]},
  {s:'Se inyecta un medicamento llamado polidocanol. Aquí está batido como espuma.',a:[['seg','Paso',2]],c:[560,310,1.7]},
  {s:'Las burbujas empujan la sangre y tocan directamente la pared de la vena.',c:[650,310,2.4],pt:[[650,310,'Espuma']]},
  {s:'El medicamento irrita la capa interna de la vena. Las células se desprenden, y la vena se contrae.',a:[['seg','Paso',3]],c:[600,290,2.6],pt:[[600,276,'Pared irritada']]},
  {s:'Después se coloca un vendaje o una media de compresión. Así las paredes se juntan y se pegan.',a:[['seg','Paso',4]],c:[590,200,1.4],pt:[[595,60,'Compresión']]},
  {s:'Le pediremos que camine.'},
  {s:'En las semanas siguientes, el cuerpo convierte la vena en un cordón y lo reabsorbe. La vena desaparece poco a poco.',a:[['seg','Paso',5]],c:[560,330,1.5]},
  {s:'En este recuadro ve la piel: la vena se va borrando.',c:[140,434,2.6]},
  {s:'Con medicamento líquido, este se mezcla con la sangre y pierde fuerza.',a:[['seg','Agente',0],['seg','Paso',2]],c:[817,434,2.3],sp:[817,434,175,62]},
  {s:'Por eso, en venas grandes se prefiere la espuma: sus burbujas tocan la pared sin diluirse.',a:[['seg','Agente',1],['seg','Paso',2]]},
  {s:'Y más medicamento no es mejor.',a:[['sl','Concentración',3],['seg','Paso',3]],c:[459,434,2.3],sp:[459,434,190,62]},
  {s:'Si la dosis es muy alta, también se daña el tejido de alrededor, con inflamación y manchas.',c:[600,300,1.6],pt:[[600,252,'Inflamación']]},
  {s:'Su médico elige la dosis justa para cada vena, en la zona verde.',a:[['sl','Concentración',1]],c:[459,434,2.3],sp:[459,434,190,62]}],
 'trombosis-venosa-profunda':[
  {s:'Una trombosis venosa profunda es un coágulo dentro de una vena profunda de la pierna.',a:[['tg','Anticoagulación',false],['btn','Reiniciar'],['btn','Viaje largo']],c:[500,215,1.2]},
  {s:'Casi siempre empieza en el bolsillo que hay detrás de una válvula, donde la sangre se mueve muy despacio.',c:[490,200,2.4],pt:[[490,170,'Bolsillo de la válvula']]},
  {s:'Para que se forme suelen juntarse tres cosas: sangre quieta, sangre que coagula de más, y una pared lastimada.',c:[456,478,2],sp:[456,478,150,105]},
  {s:'En una persona sana que viaja mucho tiempo, normalmente no pasa nada.'},
  {s:'Pero después de una cirugía de cadera se suman los tres factores.',a:[['btn','Posoperatorio de cadera']]},
  {s:'La pared se inflama, se pegan glóbulos blancos y plaquetas, y empieza el coágulo.',c:[490,190,2.6],pt:[[480,170,'Glóbulos blancos y plaquetas']],v:2},
  {s:'El coágulo crece hacia el corazón.',c:[650,215,1.4],pt:[[650,190,'Coágulo']],v:2.5},
  {s:'Abajo a la izquierda ve el ultrasonido. La vena sana se aplasta al apretar; la vena con coágulo no se aplasta. Así se hace el diagnóstico.',c:[160,478,2.3],sp:[160,478,145,110],v:1.5},
  {s:'Si un pedazo se suelta, viaja hasta el pulmón. Eso es una embolia pulmonar, y es una urgencia.',a:[['btn','Simular desprendimiento']],c:[700,215,1.3],v:1},
  {s:'Por eso se dan anticoagulantes. Evitan que el coágulo crezca y se suelte, mientras el cuerpo lo disuelve poco a poco.',a:[['tg','Anticoagulación',true]],c:[600,215,1.6],pt:[[600,190,'Deja de crecer']],v:2},
  {s:'Si tiene falta de aire, dolor en el pecho, o se desmaya, acuda a urgencias de inmediato.',c:[500,300,1],v:1}],
 'sindrome-postrombotico':[
  {s:'El síndrome postrombótico son las molestias que pueden quedar en la pierna después de una trombosis.',a:[['btn','Pausar evolución'],['sl','Grado de recanalización',0.6],['tg','Válvula atrapada',true],['tg','TVP iliofemoral',false],['tg','Compresión elástica',false],['sl','Tiempo desde la TVP',0.2]],c:[500,300,1]},
  {s:'Al principio, el coágulo tapa la vena y la pared se inflama.',c:[500,215,1.4],pt:[[500,215,'Coágulo']]},
  {s:'Con las semanas, el cuerpo no borra el coágulo: lo convierte en cicatriz.',a:[['anim','Tiempo desde la TVP',5,6]],c:[500,215,1.6]},
  {s:'Entran células y pequeños vasos nuevos, y el coágulo se vuelve blanco y fibroso.',c:[560,215,2.4],pt:[[560,215,'Cicatriz']]},
  {s:'Con los meses se abren canales para que la sangre vuelva a pasar.',a:[['anim','Tiempo desde la TVP',14,7]],c:[600,215,1.8],pt:[[640,245,'Canales']]},
  {s:'Pero quedan bandas de cicatriz, y la válvula, que quedó atrapada, se engruesa y ya no cierra.',c:[400,215,2.4],pt:[[398,165,'Válvula dañada']]},
  {s:'Por eso la sangre se regresa hacia el pie.',c:[500,215,1.3],v:0.7},
  {s:'Abajo ve la pierna. Al subir la presión aparecen hinchazón, manchas oscuras y piel dura.',a:[['anim','Tiempo desde la TVP',24,6]],c:[170,465,2.2],sp:[170,465,155,125],v:1},
  {s:'El médico mide estos cambios con una escala llamada Villalta.',c:[657,465,1.5],sp:[657,465,330,125]},
  {s:'Caminar, cuidar el peso, mover los tobillos y, cuando su médico lo indique, usar media de compresión, ayudan a controlar las molestias.',a:[['tg','Compresión elástica',true]],c:[500,300,1]}]
};
let VOICE=null;const HAS_TTS='speechSynthesis' in window;
function loadVoice(){try{const vs=speechSynthesis.getVoices();VOICE=vs.find(v=>/es[-_]MX/i.test(v.lang))||vs.find(v=>/es[-_](US|419)/i.test(v.lang))||vs.find(v=>/^es/i.test(v.lang))||null}catch(e){}}
if(HAS_TTS){loadVoice();try{speechSynthesis.onvoiceschanged=loadVoice}catch(e){}}
const AUDIO={"pared-3d":{"dur":70.8,"cues":[{"t":0.0,"s":[0.1,2.66]},{"t":7.128,"s":[7.228,10.253]},{"t":15.384,"s":[15.484]},{"t":20.04,"s":[20.14]},{"t":27.144,"s":[27.244]},{"t":31.848,"s":[31.948]},{"t":37.152,"s":[37.252,40.689]},{"t":44.784,"s":[44.884,47.59]},{"t":50.184,"s":[50.284,53.961]},{"t":59.544,"s":[59.644,65.196]}]},"valvula-sana":{"dur":59.76,"cues":[{"t":0.0,"s":[0.1]},{"t":5.16,"s":[5.26]},{"t":9.408,"s":[9.508]},{"t":15.936,"s":[16.036]},{"t":21.432,"s":[21.532]},{"t":26.544,"s":[26.644]},{"t":33.264,"s":[33.364,37.626]},{"t":42.144,"s":[42.244]},{"t":46.2,"s":[46.3,49.418]},{"t":53.952,"s":[54.052]}]},"valvula-incompetente":{"dur":53.28,"cues":[{"t":0.0,"s":[0.1,2.965]},{"t":7.2,"s":[7.3]},{"t":11.76,"s":[11.86]},{"t":15.888,"s":[15.988,18.587]},{"t":23.784,"s":[23.884]},{"t":29.496,"s":[29.596,33.419]},{"t":39.144,"s":[39.244]},{"t":45.456,"s":[45.556,51.094]}]},"bomba-muscular":{"dur":66.312,"cues":[{"t":0.0,"s":[0.1]},{"t":3.912,"s":[4.012]},{"t":11.496,"s":[11.596]},{"t":17.496,"s":[17.596]},{"t":23.496,"s":[23.596]},{"t":31.2,"s":[31.3,33.288]},{"t":39.168,"s":[39.268]},{"t":44.856,"s":[44.956]},{"t":48.168,"s":[48.268]},{"t":54.408,"s":[54.508]},{"t":60.168,"s":[60.268]}]},"fascias":{"dur":59.016,"cues":[{"t":0.0,"s":[0.1]},{"t":4.68,"s":[4.78]},{"t":9.48,"s":[9.58]},{"t":14.544,"s":[14.644,19.238]},{"t":24.408,"s":[24.508]},{"t":29.208,"s":[29.308]},{"t":36.048,"s":[36.148]},{"t":39.384,"s":[39.484]},{"t":43.776,"s":[43.876]},{"t":50.664,"s":[50.764,54.773]}]},"compartimentos-3d":{"dur":66.264,"cues":[{"t":0.0,"s":[0.1]},{"t":5.496,"s":[5.596]},{"t":9.696,"s":[9.796]},{"t":13.632,"s":[13.732]},{"t":18.216,"s":[18.316]},{"t":22.224,"s":[22.324]},{"t":27.84,"s":[27.94,31.55]},{"t":39.192,"s":[39.292,42.49]},{"t":48.84,"s":[48.94]},{"t":53.088,"s":[53.188]},{"t":60.672,"s":[60.772]}]},"union-safenofemoral":{"dur":59.52,"cues":[{"t":0.0,"s":[0.1]},{"t":2.544,"s":[2.644]},{"t":9.456,"s":[9.556,13.685]},{"t":17.328,"s":[17.428]},{"t":23.352,"s":[23.452,26.557]},{"t":31.224,"s":[31.324]},{"t":34.464,"s":[34.564]},{"t":38.232,"s":[38.332,43.072]},{"t":45.6,"s":[45.7,49.869]},{"t":54.528,"s":[54.628]}]},"progresion-varice":{"dur":53.424,"cues":[{"t":0.0,"s":[0.1]},{"t":3.84,"s":[3.94,6.087]},{"t":11.304,"s":[11.404]},{"t":17.304,"s":[17.404,20.934]},{"t":24.648,"s":[24.748]},{"t":30.096,"s":[30.196,34.272]},{"t":39.528,"s":[39.628,43.85]},{"t":47.544,"s":[47.644]}]},"microcirculacion":{"dur":64.656,"cues":[{"t":0.0,"s":[0.1]},{"t":4.416,"s":[4.516]},{"t":8.712,"s":[8.812]},{"t":14.016,"s":[14.116,17.46]},{"t":19.776,"s":[19.876]},{"t":24.6,"s":[24.7,28.988]},{"t":31.824,"s":[31.924,35.8]},{"t":39.96,"s":[40.06]},{"t":45.456,"s":[45.556,51.015]},{"t":55.152,"s":[55.252]}]},"escleroterapia":{"dur":83.016,"cues":[{"t":0.0,"s":[0.1]},{"t":4.752,"s":[4.852]},{"t":9.144,"s":[9.244]},{"t":13.296,"s":[13.396,17.112]},{"t":19.896,"s":[19.996]},{"t":25.08,"s":[25.18,28.936]},{"t":32.928,"s":[33.028,37.17]},{"t":40.344,"s":[40.444]},{"t":42.792,"s":[42.892,48.563]},{"t":51.504,"s":[51.604]},{"t":55.728,"s":[55.828]},{"t":61.104,"s":[61.204]},{"t":67.848,"s":[67.948]},{"t":70.896,"s":[70.996]},{"t":77.832,"s":[77.932]}]},"trombosis-venosa-profunda":{"dur":75.72,"cues":[{"t":0.0,"s":[0.1]},{"t":5.88,"s":[5.98]},{"t":12.936,"s":[13.036]},{"t":21.144,"s":[21.244]},{"t":26.688,"s":[26.788]},{"t":31.512,"s":[31.612]},{"t":37.728,"s":[37.828]},{"t":40.704,"s":[40.804,43.949,49.135]},{"t":51.84,"s":[51.94,55.869]},{"t":59.832,"s":[59.932,62.718]},{"t":68.712,"s":[68.812]}]},"sindrome-postrombotico":{"dur":60.096,"cues":[{"t":0.0,"s":[0.1]},{"t":6.648,"s":[6.748]},{"t":11.472,"s":[11.572]},{"t":17.064,"s":[17.164]},{"t":22.944,"s":[23.044]},{"t":27.504,"s":[27.604]},{"t":34.584,"s":[34.684]},{"t":37.992,"s":[38.092,40.253]},{"t":45.48,"s":[45.58]},{"t":49.992,"s":[50.092]}]}},AUDIO_DIR='audio/';
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
  if(man){const a=new Audio(AUDIO_DIR+m.id+'.mp3');a.preload='none';a.hidden=true;$('#stageHost').appendChild(a);tok.audio=a;tok.man=man;a.onended=()=>{if(vid===tok)endVideo(tok)};a.onerror=()=>{if(vid===tok){a.pause();a.remove();tok.audio=null;$('#vAudio').hidden=true;nextScene(tok)}}}
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
MODS.push(...EXTENSION_MODULES);Object.assign(VIDEOS,EXTENSION_VIDEOS);Object.assign(AUDIO,EXTENSION_AUDIO);
buildGallery();setAud(AUD);applyFilter();
const h0=location.hash.slice(1),ix=MODS.findIndex(m=>m.id===h0);if(ix>=0)openMod(ix);
