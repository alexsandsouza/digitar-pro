/* Optional Phaser 3 renderer. The learning core owns all scoring and timing. */
(function(){
'use strict';
window.createPhaserArcadeRenderer=function(host,read,onReady,onFailure){
 if(!window.Phaser)return null;
 const P=window.Phaser;let active=true,sceneRef=null,gameRef=null;
 const width=960,height=460;
 class MeteorScene extends P.Scene{
 constructor(){super('MeteorStrike')}
 preload(){this.load.svg('ship','assets/arcade-ship.svg',{width:240,height:260});this.load.svg('rock','assets/arcade-asteroid.svg',{width:220,height:220})}
 create(){if(!active)return;sceneRef=this;this.bg=this.add.graphics();this.bg.fillGradientStyle(0x111e42,0x081322,0x201b3b,0x070f21,1);this.bg.fillRect(0,0,width,height);this.stars=[];for(let i=0;i<145;i++){const x=(i*137.51)%width,y=(i*71.9)%height;this.stars.push(this.add.circle(x,y,0.5+(i%4)*.55,0xcce6ff,.25+(i%5)*.12))}this.planet=this.add.graphics();for(let i=85;i>0;i--){const t=i/85;this.planet.fillStyle(P.Display.Color.GetColor(Math.round(24+(1-t)*92),Math.round(48+(1-t)*102),Math.round(83+(1-t)*105)),1);this.planet.fillCircle(820+(1-t)*-18,96+(1-t)*-20,i)}this.planet.lineStyle(2,0x77b7da,.7);this.planet.strokeCircle(820,96,85);this.ship=this.add.image(480,410,'ship').setDisplaySize(112,121);this.rock=this.add.image(480,70,'rock').setDisplaySize(100,100);this.beam=this.add.graphics();this.shield=this.add.graphics();this.shield.lineStyle(2,0x68e2e6,.4);this.shield.strokeEllipse(480,462,850,65);this.rock.setVisible(false);this.events.once('shutdown',()=>{sceneRef=null});onReady()}
 update(time,delta){if(!active||!this.rock)return;const s=read();const moving=s.state==='running'&&s.effects&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches;this.rock.setVisible(s.state==='running'||s.state==='paused');this.rock.setPosition(width*(s.meteorOrigin+(s.meteorLane-s.meteorOrigin)*s.fall),height*(.13+.60*s.fall));if(moving){this.rock.rotation+=delta*.0006;this.stars.forEach((star,i)=>{star.y=(star.y+delta*(.004+(i%4)*.003))%height})}}
 burst(bad){if(!this.rock||!read().effects||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;const x=this.rock.x,y=this.rock.y;if(!bad){const bolt=this.add.rectangle(480,385,5,25,0xb8ffff).setDepth(5);bolt.rotation=Math.atan2(y-385,x-480)+Math.PI/2;this.tweens.add({targets:bolt,x,y,duration:150,onComplete:()=>{bolt.destroy();this.explode(x,y,false)}})}else this.explode(x,y,true)}
 explode(x,y,bad){const ring=this.add.circle(x,y,10,0xffffff,0).setStrokeStyle(3,bad?0xff6677:0xffce88,1);this.tweens.add({targets:ring,scale:7,alpha:0,duration:450,onComplete:()=>ring.destroy()});for(let i=0;i<30;i++){const a=i*2.399,r=25+(i%7)*11;const p=this.add.circle(x,y,2+i%3,bad?0xff6677:i%3?0xffae57:0xfff2cc);this.tweens.add({targets:p,x:x+Math.cos(a)*r,y:y+Math.sin(a)*r,alpha:0,scale:.2,duration:300+(i%6)*55,onComplete:()=>p.destroy()})}}
 }
 try{gameRef=new P.Game({type:P.AUTO,parent:host,width,height,transparent:false,backgroundColor:'#081322',scene:[MeteorScene],audio:{noAudio:true},scale:{mode:P.Scale.FIT,autoCenter:P.Scale.CENTER_BOTH},render:{antialias:true,pixelArt:false},banner:false});}catch(e){onFailure();return null}
 return {burst(bad){sceneRef?.burst(bad)},destroy(){active=false;gameRef?.destroy(true);sceneRef=null}};
};
})();