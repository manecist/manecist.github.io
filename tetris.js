
(function(root){
'use strict';
const SHAPES=[[[1,1,1,1]],[[1,1],[1,1]],[[0,1,0],[1,1,1]],[[0,1,1],[1,1,0]],[[1,1,0],[0,1,1]],[[1,0,0],[1,1,1]],[[0,0,1],[1,1,1]]];
const COLORS=['#f5a8cf','#ba93f0','#91dcff','#e2ba53','#ff83b8','#9ac6ff','#f1c593'];
class Tetris{
 constructor(canvas,{demo=false,onChange=()=>{}}={}){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.demo=demo;this.onChange=onChange;this.timer=null;this.lastClear=0;this.lockDelay=1500;this.lockTimer=null;this.lockDue=0;this.lockRemaining=0;this.reset(demo)}
 reset(demo=this.demo){clearTimeout(this.timer);this.clearLock();this.lockResets=0;this.demo=demo;this.board=Array.from({length:20},()=>Array(10).fill(0));this.score=0;this.lines=0;this.over=false;this.paused=false;this.running=true;this.bag=[];if(this.demo)this.seedDemo();this.spawn();this.draw();this.emit()}
 bagNext(){if(!this.bag.length){this.bag=[0,1,2,3,4,5,6];for(let i=6;i>0;i--){const j=Math.floor(Math.random()*(i+1));[this.bag[i],this.bag[j]]=[this.bag[j],this.bag[i]];}}return this.bag.pop()}
 spawn(){this.clearLock();this.lockResets=0;this.type=this.bagNext();this.piece=SHAPES[this.type].map(r=>r.slice());this.x=3;this.y=0;if(this.demo)this.planDemo();if(this.collides()){this.over=true;this.running=false}}
 seedDemo(){this.board[19]=[1,1,2,2,0,0,3,3,3,3];this.board[18]=[1,1,2,2,0,0,0,0,4,4];this.board[17]=[0,0,0,0,0,0,0,0,4,4];}
 planDemo(){let best=null;let rotated=this.piece;for(let turn=0;turn<4;turn++){for(let x=0;x<=10-rotated[0].length;x++){let y=0;if(this.collides(rotated,x,y))continue;while(!this.collides(rotated,x,y+1))y++;const trial=this.board.map(r=>r.slice());rotated.forEach((r,dy)=>r.forEach((v,dx)=>{if(v)trial[y+dy][x+dx]=this.type+1;}));let holes=0,heights=[];for(let col=0;col<10;col++){let top=trial.findIndex(row=>row[col]);heights.push(top<0?0:20-top);if(top>=0)for(let row=top;row<20;row++)if(!trial[row][col])holes++;}const lines=trial.filter(row=>row.every(Boolean)).length;const bump=heights.slice(1).reduce((s,v,i)=>s+Math.abs(v-heights[i]),0);const cost=holes*20+heights.reduce((s,v)=>s+v,0)+bump*2-lines*35;if(!best||cost<best.cost)best={cost,x,piece:rotated.map(r=>r.slice())};}rotated=rotated[0].map((_,x)=>rotated.map(row=>row[x]).reverse());}if(best){this.piece=best.piece;this.x=best.x;}}
 collides(piece=this.piece,x=this.x,y=this.y){return piece.some((row,dy)=>row.some((v,dx)=>v&&(x+dx<0||x+dx>=10||y+dy>=20||(y+dy>=0&&this.board[y+dy][x+dx]))))}
 clearLock(){clearTimeout(this.lockTimer);this.lockTimer=null;this.lockDue=0;this.lockRemaining=0}
 grounded(){return this.collides(this.piece,this.x,this.y+1)}
 armLock(delay=this.lockDelay){if(this.demo||this.lockTimer||!this.can()||!this.grounded())return;this.lockDue=performance.now()+delay;this.lockTimer=setTimeout(()=>{this.lockTimer=null;if(!this.can())return;if(this.grounded()){this.lock();this.draw();this.emit();}},delay)}
 updateGround(reset=false){if(this.demo)return;if(!this.grounded()){this.clearLock();return;}if(reset&&this.lockResets<15){this.lockResets++;this.clearLock();}this.armLock()}
 move(dx){if(!this.can())return;if(!this.collides(this.piece,this.x+dx,this.y)){this.x+=dx;this.updateGround(true);}this.draw()}
 rotate(){if(!this.can())return;const r=this.piece[0].map((_,x)=>this.piece.map(row=>row[x]).reverse());for(const [dx,dy] of [[0,0],[-1,0],[1,0],[-2,0],[2,0],[0,-1],[-1,-1],[1,-1],[0,-2],[-2,-2],[2,-2]])if(this.y+dy>=0&&!this.collides(r,this.x+dx,this.y+dy)){this.piece=r;this.x+=dx;this.y+=dy;this.updateGround(true);break}this.draw()}
 down(manual=false){if(!this.can())return;if(!this.collides(this.piece,this.x,this.y+1)){this.y++;if(manual)this.score++;this.updateGround();}else if(this.demo)this.lock();else this.armLock();this.draw();this.emit()}
 drop(){if(!this.can())return;this.clearLock();while(!this.collides(this.piece,this.x,this.y+1)){this.y++;this.score+=2}this.lock();this.draw();this.emit()}
 can(){return this.running&&!this.paused&&!this.over}
 lock(){this.clearLock();this.piece.forEach((row,dy)=>row.forEach((v,dx)=>{if(v&&this.y+dy>=0)this.board[this.y+dy][this.x+dx]=this.type+1}));let n=0;this.clearedRows=[];this.board=this.board.filter((row,index)=>{if(row.every(Boolean)){this.clearedRows.push(index);n++;return false}return true});while(this.board.length<20)this.board.unshift(Array(10).fill(0));this.lastClear=n;this.lines+=n;this.score+=[0,100,300,500,900][n]*(1+Math.floor(this.lines/10));this.spawn()}
 pause(){if(!this.running)return;if(!this.paused){this.lockRemaining=this.lockTimer?Math.max(1,this.lockDue-performance.now()):0;clearTimeout(this.lockTimer);this.lockTimer=null;this.paused=true;}else{this.paused=false;const remaining=this.lockRemaining;this.lockRemaining=0;if(this.grounded())this.armLock(remaining||this.lockDelay);}this.draw();this.emit()}
 schedule(){clearTimeout(this.timer);const delay=this.demo?280:Math.max(140,540-Math.floor(this.lines/8)*45);this.timer=setTimeout(()=>{if(this.demo&&this.over)this.reset(true);else if(!this.paused)this.down();this.schedule()},delay)}
 start(){this.reset(false);this.schedule();if(!this.brillo){const loop=()=>{if(!this.demo&&this.running&&!this.paused&&!document.hidden)this.draw();this.brillo=setTimeout(loop,120)};this.brillo=setTimeout(loop,120);}}
 emit(){this.onChange({score:this.score,lines:this.lines,over:this.over,paused:this.paused,cleared:this.lastClear,clearedRows:this.clearedRows||[]});this.lastClear=0}
 dibujarPapel(c,w,h,s){
  // hoja de cuaderno: papel crema con cuadrícula rosada suave
  c.fillStyle='#fff8ef';c.fillRect(0,0,w,h);c.strokeStyle='rgba(214,150,190,.28)';c.lineWidth=1;
  for(let x=1;x<10;x++){c.beginPath();c.moveTo(x*s+.5,0);c.lineTo(x*s+.5,h);c.stroke()}for(let y=1;y<20;y++){c.beginPath();c.moveTo(0,y*s+.5);c.lineTo(w,y*s+.5);c.stroke()}
  // ficha dibujada: color pastel, contorno de tinta ciruela, brillo blanco y un detalle (corazón, estrella o luna)
  const ficha=(x,y,v,ghost)=>{const px=x*s,py=y*s,col=COLORS[v-1],r=s*.22;
   c.beginPath();c.roundRect?c.roundRect(px+2,py+2,s-4,s-4,r):c.rect(px+2,py+2,s-4,s-4);
   if(ghost){c.setLineDash([3,3]);c.strokeStyle='rgba(122,63,104,.45)';c.lineWidth=1.5;c.stroke();c.setLineDash([]);return;}
   c.fillStyle=col;c.fill();c.lineWidth=2;c.strokeStyle='#6b3a5e';c.stroke();
   c.fillStyle='rgba(255,255,255,.65)';c.beginPath();c.ellipse(px+s*.34,py+s*.3,s*.16,s*.09,-.5,0,7);c.fill();
   c.fillStyle='rgba(107,58,94,.55)';const m=v%3;c.beginPath();
   if(m===0){c.arc(px+s*.62,py+s*.64,s*.09,0,7);}else if(m===1){const cx=px+s*.62,cy=py+s*.62,a=s*.12;c.moveTo(cx,cy-a);c.lineTo(cx+a*.35,cy-a*.35);c.lineTo(cx+a,cy);c.lineTo(cx+a*.35,cy+a*.35);c.lineTo(cx,cy+a);c.lineTo(cx-a*.35,cy+a*.35);c.lineTo(cx-a,cy);c.lineTo(cx-a*.35,cy-a*.35);}else{c.arc(px+s*.6,py+s*.64,s*.1,.6,5.6);}
   c.fill();};
  this.board.forEach((row,y)=>row.forEach((v,x)=>v&&ficha(x,y,v)));
  if(this.piece){if(!this.over){let gy=this.y;while(!this.collides(this.piece,this.x,gy+1))gy++;this.piece.forEach((row,y)=>row.forEach((v,x)=>v&&ficha(this.x+x,gy+y,this.type+1,true)))}this.piece.forEach((row,y)=>row.forEach((v,x)=>v&&ficha(this.x+x,this.y+y,this.type+1)))}
  if(this.paused||this.over){c.fillStyle='rgba(255,248,239,.85)';c.fillRect(0,0,w,h);c.fillStyle='#7a2f5f';c.textAlign='center';c.font='bold 20px Mali, sans-serif';c.fillText(this.over?'¡Fin de partida!':'Pausa',w/2,h/2)}
 }
 draw(){const c=this.ctx,w=this.canvas.width,h=this.canvas.height,s=w/10;c.clearRect(0,0,w,h);if(!this.demo&&this.canvas.closest&&this.canvas.closest('.colgante-app'))return this.dibujarPapel(c,w,h,s);const bg=c.createLinearGradient(0,0,w,h);bg.addColorStop(0,'#141a40');bg.addColorStop(.5,'#25163f');bg.addColorStop(1,'#091b36');c.fillStyle=this.demo?'#b5bea0':bg;c.fillRect(0,0,w,h);if(!this.demo){if(!this.cielo){this.cielo=Array.from({length:46},()=>[Math.random()*w,Math.random()*h,Math.random()*1.2+.3,Math.random()]);}const t=performance.now()/900;this.cielo.forEach(([x,y,r,f])=>{c.globalAlpha=.25+.55*Math.abs(Math.sin(t+f*6));c.fillStyle=f>.7?'#ffd9ea':'#fff';c.beginPath();c.arc(x,y,r,0,7);c.fill();});c.globalAlpha=1;const au=c.createRadialGradient(w*.5,h*1.05,10,w*.5,h,h*.8);au.addColorStop(0,'rgba(245,168,207,.22)');au.addColorStop(1,'rgba(245,168,207,0)');c.fillStyle=au;c.fillRect(0,0,w,h);}
  c.strokeStyle=this.demo?'rgba(66,42,64,.10)':'rgba(255,255,255,.035)';for(let x=1;x<10;x++){c.beginPath();c.moveTo(x*s,0);c.lineTo(x*s,h);c.stroke()}for(let y=1;y<20;y++){c.beginPath();c.moveTo(0,y*s);c.lineTo(w,y*s);c.stroke()}
  const block=(x,y,v,ghost=false)=>{const px=x*s,py=y*s;if(this.demo){c.fillStyle=ghost?'rgba(255,255,255,.05)':'#414b36'}else{c.fillStyle=ghost?'rgba(255,255,255,.07)':COLORS[v-1]};if(!ghost&&!this.demo){c.shadowColor=COLORS[v-1];c.shadowBlur=5;}if(this.demo||ghost){c.fillRect(px+1,py+1,s-2,s-2);c.shadowBlur=0;c.strokeStyle=this.demo?'rgba(255,255,255,.14)':'rgba(255,215,240,.45)';c.setLineDash(ghost?[3,3]:[]);c.strokeRect(px+3,py+3,s-6,s-6);c.setLineDash([]);return;}
  const col=COLORS[v-1],g=c.createLinearGradient(px,py,px+s,py+s);g.addColorStop(0,'#fff');g.addColorStop(.18,col);g.addColorStop(1,'rgba(40,20,70,.9)');
  c.beginPath();c.roundRect?c.roundRect(px+1,py+1,s-2,s-2,5):c.rect(px+1,py+1,s-2,s-2);c.fillStyle=g;c.fill();c.shadowBlur=0;
  c.fillStyle=col;c.beginPath();c.moveTo(px+s*.5,py+s*.18);c.lineTo(px+s*.82,py+s*.5);c.lineTo(px+s*.5,py+s*.82);c.lineTo(px+s*.18,py+s*.5);c.closePath();c.fill();
  c.fillStyle='rgba(255,255,255,.55)';c.beginPath();c.moveTo(px+s*.5,py+s*.18);c.lineTo(px+s*.82,py+s*.5);c.lineTo(px+s*.5,py+s*.5);c.closePath();c.fill();
  c.fillStyle='rgba(255,255,255,.85)';c.beginPath();c.arc(px+s*.3,py+s*.28,s*.07,0,7);c.fill();
  c.strokeStyle='rgba(255,255,255,.45)';c.lineWidth=1;c.stroke&&c.strokeRect(px+1.5,py+1.5,s-3,s-3)};
  this.board.forEach((row,y)=>row.forEach((v,x)=>v&&block(x,y,v)));
  if(this.piece){if(!this.demo&&!this.over){let gy=this.y;while(!this.collides(this.piece,this.x,gy+1))gy++;this.piece.forEach((row,y)=>row.forEach((v,x)=>v&&block(this.x+x,gy+y,this.type+1,true)))}this.piece.forEach((row,y)=>row.forEach((v,x)=>v&&block(this.x+x,this.y+y,this.type+1)))}
  if(this.paused||this.over){c.fillStyle='rgba(7,16,39,.82)';c.fillRect(0,0,w,h);c.fillStyle='#ffe1ee';c.textAlign='center';c.font='bold 18px monospace';c.fillText(this.over?'FIN DE PARTIDA':'PAUSA',w/2,h/2)}
 }
 destroy(){clearTimeout(this.timer);this.clearLock()}
}
root.ConariTetris=Tetris;
})(window);
