/* Digitar Pro — figura realista de mãos holográficas transparentes sobre o teclado */
(()=>{
'use strict';
const keyboard=document.getElementById('keyboard');
const toggle=document.getElementById('showHands');
const typing=document.getElementById('typing');
if(!keyboard||!toggle)return;

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

// Posição normalizada (%) de cada ponta de dedo dentro de assets/hands-transparent.webp (960x429)
const tipAnchors={
  '0:0':[15.7,10.3], // mínimo esquerdo (A)
  '0:1':[22.9,6.3],  // anelar esquerdo (S)
  '0:2':[30.3,6.5],  // médio esquerdo (D)
  '0:3':[38.5,7.9],  // indicador esquerdo (F)
  '0:4':[43.5,45.8], // polegar esquerdo (Espaço)
  '1:4':[57.3,45.8], // polegar direito (Espaço)
  '1:3':[63.0,8.0],  // indicador direito (J)
  '1:2':[69.9,6.6],  // médio direito (K)
  '1:1':[77.1,6.6],  // anelar direito (L)
  '1:0':[84.8,10.5]  // mínimo direito (Ç)
};

const ASPECT=429/960;
const ANCHOR_LEFT_X=0.157;
const ANCHOR_RIGHT_X=0.848;
const ANCHOR_SPAN_X=ANCHOR_RIGHT_X-ANCHOR_LEFT_X; // 0.691 da largura da imagem entre A e Ç
const ANCHOR_HOME_Y=0.082; // linha média das pontas dos dedos na imagem

const existing=document.getElementById('neonHandsOverlay');
if(existing)existing.remove();

const overlay=document.createElement('div');
overlay.id='neonHandsOverlay';
overlay.setAttribute('aria-hidden','true');

const img=document.createElement('img');
img.className='hologram-hands-img';
img.src='assets/hands-transparent.webp?v=3';
img.alt='';
img.draggable=false;

const tipGlow=document.createElement('span');
tipGlow.className='hologram-finger-glow';

overlay.appendChild(img);
overlay.appendChild(tipGlow);
keyboard.appendChild(overlay);

let raf=0,resizeTimer=0;

function keyRect(letter){
  const el=[...keyboard.querySelectorAll('.key')].find(n=>n.dataset.key===letter);
  if(!el)return null;
  const r=el.getBoundingClientRect(),p=keyboard.getBoundingClientRect();
  return {
    cx:r.left-p.left+keyboard.scrollLeft+r.width/2,
    cy:r.top-p.top+keyboard.scrollTop+r.height/2,
    bottom:r.bottom-p.top+keyboard.scrollTop,
    height:r.height
  };
}

function activeKey(){
  const el=keyboard.querySelector('.key.target');
  return el?el.dataset.key:'';
}

function layoutHands(){
  overlay.hidden=!toggle.checked;
  if(!toggle.checked){keyboard.style.paddingBottom='18px';return}

  const keyA=keyRect('a');
  const keyC=keyRect('ç');
  if(!keyA||!keyC)return;

  const spanPx=Math.max(240,keyC.cx-keyA.cx);
  const imgWidth=spanPx/ANCHOR_SPAN_X;
  const imgHeight=imgWidth*ASPECT;

  // Ajusta dinamicamente o espaço inferior do teclado para abrigar punhos/antebraços sem cobrir a legenda
  const targetTipY=keyA.cy+keyA.height*0.30;
  const imgTop=targetTipY-ANCHOR_HOME_Y*imgHeight;
  const neededBottom=Math.max(48,Math.ceil(imgTop+imgHeight-(keyRect(' ')?.bottom||targetTipY)+8));
  keyboard.style.paddingBottom=Math.min(138,neededBottom)+'px';

  // Posiciona para que as pontas dos dedos toquem a base das teclas da linha central (A S D F / J K L Ç)
  const centerX=(keyA.cx+keyC.cx)/2-((ANCHOR_LEFT_X+ANCHOR_RIGHT_X)/2-0.5)*imgWidth;
  const imgLeft=centerX-imgWidth/2;

  img.style.width=imgWidth.toFixed(1)+'px';
  img.style.height=imgHeight.toFixed(1)+'px';
  img.style.left=(imgLeft+imgWidth/2).toFixed(1)+'px';
  img.style.top=imgTop.toFixed(1)+'px';

  const target=activeKey();
  const finger=mapping[target];
  if(!finger){
    tipGlow.classList.remove('is-active');
    return;
  }

  const anchor=tipAnchors[finger[0]+':'+finger[1]];
  const targetRect=keyRect(target);
  if(!anchor){
    tipGlow.classList.remove('is-active');
    return;
  }

  let gx=imgLeft+(anchor[0]/100)*imgWidth;
  let gy=imgTop+(anchor[1]/100)*imgHeight;

  // Desloca sutilmente o brilho na direção da tecla-alvo mantendo aderência à ponta do dedo
  if(targetRect&&target!==' '){
    gx=gx*0.62+targetRect.cx*0.38;
    gy=gy*0.68+(targetRect.cy+targetRect.height*0.26)*0.32;
  }

  tipGlow.style.left=gx.toFixed(1)+'px';
  tipGlow.style.top=gy.toFixed(1)+'px';
  tipGlow.classList.add('is-active');
}

function schedule(){
  cancelAnimationFrame(raf);
  raf=requestAnimationFrame(layoutHands);
}

const observer=new MutationObserver(list=>{
  if(list.some(m=>m.type==='attributes'&&m.attributeName==='class'))schedule();
});
keyboard.querySelectorAll('.key').forEach(k=>observer.observe(k,{attributes:true,attributeFilter:['class']}));

toggle.addEventListener('change',schedule);
img.addEventListener('load',schedule);
if(typing)typing.addEventListener('input',schedule);
window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(schedule,60)},{passive:true});
if('ResizeObserver'in window)new ResizeObserver(schedule).observe(keyboard);

schedule();
})();
