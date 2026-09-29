'use strict';
window.showLineMagic=function(lines){const effect=$('#line-magic'),fragments=$('#line-fragments');effect.classList.remove('casting');fragments.replaceChildren();const y=lines.length?(lines.reduce((a,b)=>a+b,0)/lines.length+.5)/20*100:80;effect.style.setProperty('--line-y',y+'%');
 for(const row of lines){for(let col=0;col<10;col++){const shard=document.createElement('i');shard.style.left=(col+.5)*10+'%';shard.style.top=(row+.5)/20*100+'%';shard.style.setProperty('--dx',((col-4.5)*11)+'px');shard.style.setProperty('--dy',(-40-Math.random()*65)+'px');shard.style.setProperty('--delay',(col*25)+'ms');fragments.append(shard);}}
 void effect.offsetWidth;effect.classList.add('casting');clearTimeout(window.lineMagicTimer);window.lineMagicTimer=setTimeout(()=>effect.classList.remove('casting'),2500);};
$('#play-start').addEventListener('click',()=>$('#line-magic').classList.remove('casting'));
