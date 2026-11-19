/* Digitar Pro - mãos dinâmicas neon sobre o próprio teclado (ABNT2). */
(()=>{
'use strict';
const keyboard=document.getElementById('keyboard');
const toggle=document.getElementById('showHands');
const typing=document.getElementById('typing');
if(!keyboard||!toggle)return;
const NS='http://www.w3.org/2000/svg';
const home=[['a','s','d','f'],['j','k','l','ç']];
const mapping={
 q:[0,0],a:[0,0],z:[0,0],w:[0,1],s:[0,1],x:[0,1],e:[0,2],d:[0,2],c:[0,2],
 r:[0,3],t:[0,3],f:[0,3],g:[0,3],v:[0,3],b:[0,3],
 y:[1,0],u:[1,0],h:[1,0],j:[1,0],n:[1,0],m:[1,0],
 i:[1,1],k:[1,1],',':[1,1],o:[1,2],l:[1,2],'.':[1,2],
 p:[1,3],'ç':[1,3],' ':[1,0]
};
let overlay=null,frame=0,lastTarget='',lastPress=0,resizeTimer=0;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
function el(name,attrs={},parent){
 const node=document.createElementNS(NS,name);
 for(const [k,v] of Object.entries(attrs))node.setAttribute(k,String(v));
 if(parent)parent.appendChild(node);
 return node;
}
function position(letter){
 const key=[...keyboard.querySelectorAll('.key')].find(n=>n.dataset.key===letter);
 if(!key)return null;
 const r=key.getBoundingClientRect(),p=keyboard.getBoundingClientRect();
 return {x:r.left-p.left+keyboard.scrollLeft+r.width/2,y:r.top-p.top+keyboard.scrollTop+r.height/2};
}
function curved(points){
 if(points.length<2)return '';
 let d='M '+points[0].x+' '+points[0].y;
 for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i];
  d+=' Q '+a.x+' '+((a.y+b.y)/2)+' '+b.x+' '+b.y;
 }
 return d;
}
function activeTarget(){
 const key=keyboard.querySelector('.key.target');
 return key?key.dataset.key:'';
}
function paint(){
 if(!overlay)return;
 const bounds=keyboard.getBoundingClientRect();
 const width=keyboard.scrollWidth,height=keyboard.scrollHeight;
 overlay.setAttribute('viewBox','0 0 '+width+' '+height);
 overlay.setAttribute('width',width);overlay.setAttribute('height',height);
 overlay.replaceChildren();
 const defs=el('defs',{},overlay);
 const grad=el('linearGradient',{id:'handFill',x1:'0',y1:'0',x2:'0',y2:'1'},defs);
 el('stop',{offset:'0%','stop-color':'#4deaff','stop-opacity':'.24'},grad);
 el('stop',{offset:'100%','stop-color':'#073454','stop-opacity':'.65'},grad);
 const filter=el('filter',{id:'handGlow',x:'-60%',y:'-60%',width:'220%',height:'220%'},defs);
 el('feGaussianBlur',{stdDeviation:'2.2',result:'blur'},filter);
 const merge=el('feMerge',{},filter);
 el('feMergeNode',{in:'blur'},merge);el('feMergeNode',{in:'SourceGraphic'},merge);
 const coords=home.map(row=>row.map(position));
 if(coords.some(row=>row.some(p=>!p)))return;
 const keyNow=activeTarget();
 const map=mapping[keyNow];
 const now=performance.now();
 const pulse=Math.max(0,1-(now-lastPress)/230);
 for(let side=0;side<2;side++){
   const hs=coords[side];
   const first=hs[0],last=hs[3];
   const mid=(first.x+last.x)/2;
   const y=hs[0].y;
   const palmBottom=Math.min(height-8,y+Math.min(130,height-y-12));
   const palmTop=y+29;
   // Palm stays beneath the home row, thumbs are free near Space.
   const rx=Math.abs(last.x-first.x)/2+20,cy=(palmTop+palmBottom)/2;
   el('ellipse',{class:'neon-palm',cx:mid,cy,rx,ry:Math.max(24,(palmBottom-palmTop)/2)},overlay);
   const thumbX=side===0?last.x+42:first.x-42;
   const thumbY=Math.min(height-19,y+90);
   const thumbStart={x:side===0?mid+28:mid-28,y:palmBottom-13};
   const thumbEnd={x:thumbX,y:thumbY};
   el('path',{class:'neon-digit',d:curved([thumbStart,{x:thumbX,y:thumbY+23},thumbEnd]),style:'stroke-width:22'},overlay);
   el('path',{class:'neon-finger-edge',d:curved([thumbStart,{x:thumbX,y:thumbY+23},thumbEnd])},overlay);
   for(let f=0;f<4;f++){
     const start=hs[f];
     const isActive=!!map&&map[0]===side&&map[1]===f;
     const dest=isActive?(position(keyNow)||start):start;
     const shouldMove=isActive&&!reduced.matches;
     // Smoothly glide to the highlighted key, then return to home row.
     const t=shouldMove?(.5-.5*Math.cos(now/370*Math.PI))*.8:0;
     const tip={x:start.x+(dest.x-start.x)*t,y:start.y+(dest.y-start.y)*t};
     if(isActive&&pulse>0){tip.y+=Math.min(6,pulse*6)}
     const root={x:mid+(start.x-mid)*.67,y:palmBottom-22};
     const bend={x:start.x+(mid-start.x)*.08,y:y+35};
     const path=curved([root,bend,{x:tip.x,y:tip.y+7}]);
     el('path',{class:'neon-digit'+(isActive?' is-target':''),d:path},overlay);
     el('path',{class:'neon-finger-edge',d:path},overlay);
     el('circle',{class:'neon-tip'+(isActive?' is-target':''),cx:tip.x,cy:tip.y+7,r:isActive?8:5},overlay);
     if(isActive&&!reduced.matches&&Math.abs(dest.x-start.x)+Math.abs(dest.y-start.y)>4){
       el('path',{class:'neon-guide',d:'M '+start.x+' '+start.y+' Q '+((start.x+dest.x)/2)+' '+(Math.min(start.y,dest.y)-18)+' '+dest.x+' '+dest.y},overlay);
     }
   }
 }
 overlay.hidden=!toggle.checked;
 if(!reduced.matches&&toggle.checked&&keyNow)frame=requestAnimationFrame(paint);
}
function schedule(){cancelAnimationFrame(frame);frame=requestAnimationFrame(paint)}
function change(){lastTarget=activeTarget();schedule()}
overlay=el('svg',{id:'neonHandsOverlay','aria-hidden':'true',focusable:'false',preserveAspectRatio:'none'},keyboard);
const observer=new MutationObserver(list=>{
 if(list.some(item=>item.type==='attributes'&&item.attributeName==='class'&&item.target.classList.contains('key')))change();
});
keyboard.querySelectorAll('.key').forEach(key=>observer.observe(key,{attributes:true,attributeFilter:['class']}));
toggle.addEventListener('change',schedule);
if(typing)typing.addEventListener('keydown',e=>{
 if(e.key.length===1){lastPress=performance.now();schedule()}
});
window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(schedule,70)},{passive:true});
if('ResizeObserver'in window)new ResizeObserver(schedule).observe(keyboard);
change();
})();
