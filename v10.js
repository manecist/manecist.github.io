'use strict';
const powerLabels={rocket:'Cohete',bomb:'Bomba',disco:'Bola disco'};
window.resetGemLesson=function(){window.gemHint=null;window.gemRoundEvents=[];$('#gem-lesson-hint').hidden=true;$('#gem-power-message').textContent='Tres poderes te esperan en el tablero.';$$('[data-gem-lesson]').forEach(b=>b.setAttribute('aria-pressed','false'));};
window.updateGemTools=function(){
 const counts={rocket:0,bomb:0,disco:0};mg.flat().forEach(x=>{if(x.special)counts[x.special]++;});
 const inv=$('#gem-inventory');inv.replaceChildren();Object.entries(counts).forEach(([type,count])=>{const badge=document.createElement('span'),img=document.createElement('img');img.src='assets/gema-'+type+'.svg';img.alt='';badge.append(img,document.createTextNode(powerLabels[type]+': '+count));inv.append(badge);});
 if(mScore>0&&window.gemHint){window.gemHint=null;$('#gem-lesson-hint').textContent='¡Combinación creada! Busca el poder en el tablero e intercámbialo con una gema vecina para activarlo.';}
 if(window.gemHint){window.gemHint.forEach(([r,c],i)=>{const b=$('#match-grid').children[r*N+c];b.classList.add('lesson-gem');b.dataset.hint=i+1;b.setAttribute('aria-label',b.getAttribute('aria-label')+', paso '+(i+1)+' del reto');});}
};
window.showGemPower=function(activated,created){const el=$('#gem-power-message');window.gemRoundEvents=window.gemRoundEvents||[];activated.forEach(x=>gemRoundEvents.push(x+' activada'));created.forEach(x=>gemRoundEvents.push('Has creado '+powerLabels[x]));if(gemRoundEvents.length)el.textContent=[...new Set(gemRoundEvents)].join(' · ')+'.';
 const grid=$('#match-grid');grid.classList.toggle('bomb-explosion',activated.includes('bomba'));clearTimeout(window.gemEffectTimer);window.gemEffectTimer=setTimeout(()=>grid.classList.remove('bomb-explosion'),650);
};
function startGemLesson(type){
 mEpoch++;mBusy=false;mSel=null;mScore=0;resetGemLesson();
 const mode=type;type=type.startsWith('bomb')?'bomb':type;const config={rocket:{source:[3,2],target:[4,2],cells:[[4,1],[4,3],[4,4]]},bomb:{source:[3,3],target:[4,3],cells:[[4,1],[4,2],[4,4],[4,5]]},disco:{source:[5,3],target:[4,3],cells:[[4,1],[4,2],[4,4],[2,3],[3,3]]},'bomb-l':{source:[5,2],target:[4,2],cells:[[4,3],[4,4],[2,2],[3,2]]},'bomb-t':{source:[3,3],target:[4,3],cells:[[4,2],[4,4],[5,3],[6,3]]}};const {source,target,cells}=config[mode],size={rocket:4,bomb:5,disco:6}[type];
 let ready=false;
 for(let trial=0;trial<500;trial++){
  freshBoard();cells.forEach(([r,c])=>mg[r][c].color=0);mg[source[0]][source[1]].color=0;mg[target[0]][target[1]].color=1;
  if(findMatches().length)continue;swap(source,target);const groups=matchGroups(findMatches());ready=groups.length===1&&groups[0].cells.size===size;swap(source,target);if(ready)break;
 }
 if(!ready){initMatch();$('#match-message').textContent='Prueba los poderes del tablero y vuelve a elegir el reto.';return;}
 window.gemHint=[source,target];$('#gem-lesson-hint').hidden=false;$('#gem-lesson-hint').textContent='Toca la estrella marcada 1 y después la gema marcada 2. '+(mode==='bomb-l'||mode==='bomb-t'?'Unirás dos líneas de tres en '+(mode==='bomb-l'?'L':'T')+'. Comparten una estrella: son cinco en total y forman una bomba.':type==='disco'?'Formarás dos líneas conectadas de seis estrellas en total.':'Unirás '+size+' estrellas para crear '+(type==='bomb'?'una bomba.':'un cohete.'));
 $('#gem-power-message').textContent='Tu reto: crear '+powerLabels[type].toLowerCase()+'.';$('#match-message').textContent='Las dos casillas señaladas son vecinas: selecciónalas en orden.';$$('[data-gem-lesson]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.gemLesson===mode)));renderMatch();
 $('#match-grid').scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'center'});
}
$$('[data-gem-lesson]').forEach(b=>b.addEventListener('click',()=>startGemLesson(b.dataset.gemLesson)));
window.updateAtlas=function(){const gallery=$('#atlas-gallery');if(!gallery.children.length){constellations.forEach((cfg,i)=>{const b=document.createElement('button');b.type='button';b.dataset.constellation=i;
 const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 100 100');svg.setAttribute('aria-hidden','true');
 cfg.edges.forEach(([a,z])=>{const line=document.createElementNS(ns,'line');line.setAttribute('x1',cfg.points[a][0]);line.setAttribute('y1',cfg.points[a][1]);line.setAttribute('x2',cfg.points[z][0]);line.setAttribute('y2',cfg.points[z][1]);svg.append(line);});
 cfg.points.forEach(([x,y])=>{const c=document.createElementNS(ns,'circle');c.setAttribute('cx',x);c.setAttribute('cy',y);c.setAttribute('r','2.7');svg.append(c);});
 const title=document.createElement('strong'),state=document.createElement('small');title.textContent=cfg.name;b.append(svg,title,state);b.addEventListener('click',()=>{constellationIndex=i;revealIndex=i;initStars();$('#constellation-board').scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'center'});});gallery.append(b);});}
 [...gallery.children].forEach((b,i)=>{const done=discovered.has(constellations[i].id);b.setAttribute('aria-pressed',String(i===constellationIndex));b.classList.toggle('discovered',done);b.querySelector('small').textContent=done?'✦ Descubierta':'Jugar';});
};
updateGemTools();updateAtlas();
$('#tetris-magic-demo').addEventListener('click',()=>{
 play.start();play.board[19]=[1,1,2,2,3,3,4,4,0,0];play.piece=[[1,1],[1,1]];play.type=1;play.x=8;play.y=0;play.draw();play.emit();$('#play-tetris').focus({preventScroll:true});
});
let lastGroundState='';
setInterval(()=>{const state=play.over?'fin':!play.running?'inicio':play.paused?'pausa':play.lockTimer?'suelo':'aire';if(state===lastGroundState)return;lastGroundState=state;const el=$('#landing-status');el.dataset.state=state;el.textContent={inicio:'Pulsa Iniciar para jugar.',aire:'Flechas para mover y girar · Espacio fija de inmediato.',suelo:'✦ En el suelo: tienes 1,5 segundos para mover o girar.',pausa:'Pausa · el margen para acomodar la pieza está detenido.',fin:'Partida terminada. Puedes comenzar otra.'}[state];},120);
