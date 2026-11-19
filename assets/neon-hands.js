/* Digitar Pro — mãos holográficas transparentes com movimento de digitação e toque nas teclas */
(()=>{
'use strict';
const keyboard=document.getElementById('keyboard');
const toggle=document.getElementById('showHands');
const typing=document.getElementById('typing');
if(!keyboard||!toggle)return;

const NS='http://www.w3.org/2000/svg';
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');

// Mapeamento ABNT2: [lado (0=esq, 1=dir), dedo (0=mínimo, 1=anelar, 2=médio, 3=indicador, 4=polegar)]
const mapping={
  q:[0,0],a:[0,0],z:[0,0],
  w:[0,1],s:[0,1],x:[0,1],
  e:[0,2],d:[0,2],c:[0,2],
  r:[0,3],t:[0,3],f:[0,3],g:[0,3],v:[0,3],b:[0,3],
  y:[1,3],u:[1,3],h:[1,3],j:[1,3],n:[1,3],m:[1,3],
  i:[1,2],k:[1,2],',':[1,2],
  o:[1,1],l:[1,1],'.':[1,1],
  p:[1,0],'ç':[1,0],'!':[1,0],
  ' ':[1,4]
};

// Tecla de repouso (home row) de cada dedo
const homeKeys={
  '0:0':'a','0:1':'s','0:2':'d','0:3':'f','0:4':' ',
  '1:4':' ','1:3':'j','1:2':'k','1:1':'l','1:0':'ç'
};

// Posição normalizada (%) dentro de assets/hands-transparent.webp (960x429): [tipX, tipY, knuckleX, knuckleY]
const fingerRig={
  '0:0':[15.7,10.3,18.2,39.5],
  '0:1':[22.9,6.3,24.4,36.5],
  '0:2':[30.3,6.5,31.0,36.0],
  '0:3':[38.5,7.9,37.4,38.0],
  '0:4':[43.5,45.8,39.2,61.0],
  '1:4':[57.3,45.8,61.5,61.0],
  '1:3':[63.0,8.0,63.8,38.0],
  '1:2':[69.9,6.6,69.5,36.0],
  '1:1':[77.1,6.6,76.0,36.5],
  '1:0':[84.8,10.5,82.2,39.5]
};

const ASPECT=429/960;
const ANCHOR_LEFT_X=0.157;
const ANCHOR_RIGHT_X=0.848;
const ANCHOR_SPAN_X=ANCHOR_RIGHT_X-ANCHOR_LEFT_X;
const ANCHOR_HOME_Y=0.082;

const existing=document.getElementById('neonHandsOverlay');
if(existing)existing.remove();

function svgEl(tag,attrs={},parent){
  const node=document.createElementNS(NS,tag);
  for(const [k,v] of Object.entries(attrs))node.setAttribute(k,String(v));
  if(parent)parent.appendChild(node);
  return node;
}

const overlay=document.createElement('div');
overlay.id='neonHandsOverlay';
overlay.setAttribute('aria-hidden','true');

const leftImg=document.createElement('img');
leftImg.className='hologram-hand-half hologram-hand-left';
leftImg.src='assets/hands-transparent.webp?v=4';
leftImg.alt='';
leftImg.draggable=false;

const rightImg=document.createElement('img');
rightImg.className='hologram-hand-half hologram-hand-right';
rightImg.src='assets/hands-transparent.webp?v=4';
rightImg.alt='';
rightImg.draggable=false;

const motionSvg=svgEl('svg',{class:'hologram-motion-svg'});
const defs=svgEl('defs',{},motionSvg);
const grad=svgEl('linearGradient',{id:'activeFingerGrad',x1:'0',y1:'1',x2:'0',y2:'0'},defs);
svgEl('stop',{offset:'0%','stop-color':'#1598c4','stop-opacity':'0.08'},grad);
svgEl('stop',{offset:'55%','stop-color':'#3be8ef','stop-opacity':'0.52'},grad);
svgEl('stop',{offset:'100%','stop-color':'#baffff','stop-opacity':'0.92'},grad);
const blur=svgEl('filter',{id:'activeFingerBlur',x:'-50%',y:'-50%',width:'200%',height:'200%'},defs);
svgEl('feGaussianBlur',{stdDeviation:'2.4'},blur);

const fingerBeam=svgEl('path',{class:'active-finger-beam'},motionSvg);
const fingerRim=svgEl('path',{class:'active-finger-rim'},motionSvg);
const ripplesGroup=svgEl('g',{},motionSvg);

const tipGlow=document.createElement('span');
tipGlow.className='hologram-finger-glow';

overlay.appendChild(leftImg);
overlay.appendChild(rightImg);
overlay.appendChild(motionSvg);
overlay.appendChild(tipGlow);
keyboard.appendChild(overlay);

// Estado de animação de batida real e ondas de toque nas teclas
let raf=0,resizeTimer=0,lastTappedEl=null;
let strike={side:-1,finger:-1,key:'',time:0,isError:false};
const ripples=[];

function findKeyEl(letter){
  return [...keyboard.querySelectorAll('.key')].find(n=>n.dataset.key===letter)||null;
}

function keyRect(letter){
  const el=findKeyEl(letter);
  if(!el)return null;
  const r=el.getBoundingClientRect(),p=keyboard.getBoundingClientRect();
  return {
    el,
    cx:r.left-p.left+keyboard.scrollLeft+r.width/2,
    cy:r.top-p.top+keyboard.scrollTop+r.height/2,
    bottom:r.bottom-p.top+keyboard.scrollTop,
    width:r.width,
    height:r.height
  };
}

function activeKey(){
  const el=keyboard.querySelector('.key.target');
  return el?el.dataset.key:'';
}

function clearGuideTap(){
  if(lastTappedEl){
    lastTappedEl.classList.remove('guide-tap');
    lastTappedEl=null;
  }
}

function renderFrame(now){
  overlay.hidden=!toggle.checked;
  if(!toggle.checked){
    clearGuideTap();
    keyboard.style.paddingBottom='18px';
    return;
  }

  const keyA=keyRect('a');
  const keyC=keyRect('ç');
  if(!keyA||!keyC)return;

  const kbW=keyboard.scrollWidth;
  const kbH=keyboard.scrollHeight;
  motionSvg.setAttribute('viewBox',`0 0 ${kbW} ${kbH}`);

  const spanPx=Math.max(240,keyC.cx-keyA.cx);
  const imgWidth=spanPx/ANCHOR_SPAN_X;
  const imgHeight=imgWidth*ASPECT;

  const targetTipY=keyA.cy+keyA.height*0.30;
  const imgTop=targetTipY-ANCHOR_HOME_Y*imgHeight;
  const neededBottom=Math.max(48,Math.ceil(imgTop+imgHeight-(keyRect(' ')?.bottom||targetTipY)+8));
  keyboard.style.paddingBottom=Math.min(138,neededBottom)+'px';

  const centerX=(keyA.cx+keyC.cx)/2-((ANCHOR_LEFT_X+ANCHOR_RIGHT_X)/2-0.5)*imgWidth;
  const imgLeft=centerX-imgWidth/2;

  for(const handImg of [leftImg,rightImg]){
    handImg.style.width=imgWidth.toFixed(1)+'px';
    handImg.style.height=imgHeight.toFixed(1)+'px';
    handImg.style.left=imgLeft.toFixed(1)+'px';
    handImg.style.top=imgTop.toFixed(1)+'px';
  }

  const target=activeKey();
  const finger=mapping[target];
  const strikeAge=now-strike.time;
  const strikeStrength=strikeAge>=0&&strikeAge<220?Math.sin((1-strikeAge/220)*Math.PI):0;

  // Movimento sutil da mão inteira acompanhando o dedo que vai tocar ou acabou de tocar a tecla
  let leftShiftX=0,leftShiftY=0,rightShiftX=0,rightShiftY=0;
  const isMotionAllowed=!reduced.matches;

  // Ciclo suave de demonstração contínua (como um dedo tocando ritmicamente a próxima tecla)
  const guideWave=isMotionAllowed?(0.5-0.5*Math.cos((now/460)*Math.PI)):1;
  const reach=Math.min(1,guideWave*0.92+strikeStrength*0.45);

  if(finger){
    const side=finger[0];
    const rigKey=side+':'+finger[1];
    const rig=fingerRig[rigKey];
    const homeLetter=homeKeys[rigKey];
    const homeRect=keyRect(homeLetter);
    const destRect=keyRect(target);

    if(rig&&destRect){
      // Deslocamento da mão ativa em direção à linha superior/inferior quando necessário
      const dxKey=homeRect&&target!==' '?(destRect.cx-homeRect.cx):0;
      const dyKey=homeRect&&target!==' '?(destRect.cy-homeRect.cy):0;
      const handFollowX=dxKey*0.22*reach;
      const handFollowY=dyKey*0.24*reach+(strike.side===side?strikeStrength*4.5:guideWave>0.82?1.8:0);

      if(side===0){leftShiftX=handFollowX;leftShiftY=handFollowY;}
      else{rightShiftX=handFollowX;rightShiftY=handFollowY;}

      // Aplica efeito visual de tecla sendo tocada no pico do movimento do dedo guia
      if(isMotionAllowed&&guideWave>0.78){
        if(lastTappedEl&&lastTappedEl!==destRect.el)lastTappedEl.classList.remove('guide-tap');
        destRect.el.classList.add('guide-tap');
        lastTappedEl=destRect.el;
      }else{
        clearGuideTap();
      }

      // Coordenadas da articulação (knuckle) e da ponta do dedo animada articulando até a tecla
      const shiftX=side===0?leftShiftX:rightShiftX;
      const shiftY=side===0?leftShiftY:rightShiftY;
      const baseTipX=imgLeft+(rig[0]/100)*imgWidth+shiftX;
      const baseTipY=imgTop+(rig[1]/100)*imgHeight+shiftY;
      const knuckleX=imgLeft+(rig[2]/100)*imgWidth+shiftX*0.55;
      const knuckleY=imgTop+(rig[3]/100)*imgHeight+shiftY*0.55;

      const destX=target===' '?baseTipX:destRect.cx;
      const destY=target===' '?destRect.cy:destRect.cy+destRect.height*0.14;

      const tipX=baseTipX+(destX-baseTipX)*reach;
      const tipY=baseTipY+(destY-baseTipY)*reach+(strike.side===side?strikeStrength*3.5:0);
      const midX=(knuckleX+tipX)/2+(destX-baseTipX)*0.12*reach;
      const midY=(knuckleY+tipY)/2-7*reach;

      const d=`M ${knuckleX.toFixed(1)} ${knuckleY.toFixed(1)} Q ${midX.toFixed(1)} ${midY.toFixed(1)} ${tipX.toFixed(1)} ${tipY.toFixed(1)}`;
      const fingerWidth=Math.max(14,Math.min(26,imgWidth*0.028));
      fingerBeam.setAttribute('d',d);
      fingerBeam.setAttribute('stroke-width',fingerWidth.toFixed(1));
      fingerRim.setAttribute('d',d);

      tipGlow.style.left=tipX.toFixed(1)+'px';
      tipGlow.style.top=tipY.toFixed(1)+'px';
      const tipScale=0.88+0.26*reach+0.25*strikeStrength;
      tipGlow.style.transform=`translate(-50%,-50%) scale(${tipScale.toFixed(2)})`;
      tipGlow.classList.add('is-active');
    }
  }else{
    clearGuideTap();
    fingerBeam.setAttribute('d','');
    fingerRim.setAttribute('d','');
    tipGlow.classList.remove('is-active');
  }

  leftImg.style.transform=`translate3d(${leftShiftX.toFixed(1)}px,${leftShiftY.toFixed(1)}px,0)`;
  rightImg.style.transform=`translate3d(${rightShiftX.toFixed(1)}px,${rightShiftY.toFixed(1)}px,0)`;

  // Desenha ondas luminosas de impacto nas teclas recém-digitadas pelo aluno
  ripplesGroup.replaceChildren();
  for(let i=ripples.length-1;i>=0;i--){
    const rp=ripples[i];
    const age=now-rp.time;
    if(age>340){ripples.splice(i,1);continue;}
    const p=age/340;
    const r=8+p*24;
    const op=(1-p)*0.9;
    svgEl('circle',{
      class:'key-touch-ripple'+(rp.isError?' is-error':''),
      cx:rp.x.toFixed(1),
      cy:rp.y.toFixed(1),
      r:r.toFixed(1),
      opacity:op.toFixed(2)
    },ripplesGroup);
  }

  if(isMotionAllowed&&toggle.checked&&(finger||ripples.length>0||strikeStrength>0)){
    raf=requestAnimationFrame(renderFrame);
  }
}

function schedule(){
  cancelAnimationFrame(raf);
  raf=requestAnimationFrame(renderFrame);
}

// Captura cada tecla digitada para disparar impacto do dedo + onda luminosa na tecla tocada
if(typing){
  typing.addEventListener('keydown',e=>{
    if(e.ctrlKey||e.altKey||e.metaKey||e.isComposing)return;
    const pressed=e.key===' '?' ':e.key.toLocaleLowerCase('pt-BR');
    if(pressed.length!==1)return;
    const rect=keyRect(pressed);
    const f=mapping[pressed];
    const expected=activeKey();
    const isError=Boolean(expected&&pressed!==expected);
    const now=performance.now();
    if(f){
      strike={side:f[0],finger:f[1],key:pressed,time:now,isError};
    }
    if(rect){
      ripples.push({x:rect.cx,y:rect.cy,time:now,isError});
    }
    schedule();
  });
  typing.addEventListener('input',schedule);
}

const observer=new MutationObserver(list=>{
  if(list.some(m=>m.type==='attributes'&&m.attributeName==='class'&&!m.target.classList.contains('guide-tap')))schedule();
});
keyboard.querySelectorAll('.key').forEach(k=>observer.observe(k,{attributes:true,attributeFilter:['class']}));

toggle.addEventListener('change',schedule);
leftImg.addEventListener('load',schedule);
rightImg.addEventListener('load',schedule);
window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(schedule,60)},{passive:true});
if('ResizeObserver'in window)new ResizeObserver(schedule).observe(keyboard);

schedule();
})();
