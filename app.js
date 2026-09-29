
'use strict';
const personas=n=>n+(n===1?' persona':' personas');
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));

/* suspensión MCE */
const suspendCanvas=$('#suspend-tetris');
const demoTetris=new ConariTetris(suspendCanvas,{demo:true});
if(!reduceMotion)demoTetris.schedule();
$('#power-button').addEventListener('click',()=>{
  const suspension=$('#suspension'),site=$('#site');
  if(suspension.classList.contains('powering'))return;
  suspension.classList.add('powering');
  $('#power-button').disabled=true;
  setTimeout(()=>{
    demoTetris.destroy();
    suspension.classList.add('hide');
    site.classList.add('ready');site.setAttribute('aria-hidden','false');
    document.body.classList.remove('bloqueado');
    window.scrollTo(0,0);
    suspension.setAttribute('aria-hidden','true');
    $('#nombre-principal').focus({preventScroll:true});
  },reduceMotion?0:720);
});

/* pestañas desarrollo */
$$('.dev-tab').forEach(btn=>btn.addEventListener('click',()=>{
  $$('.dev-tab').forEach(x=>x.classList.remove('active'));
  $$('.dev-panel').forEach(x=>x.classList.remove('active'));
  btn.classList.add('active');$('#dev-'+btn.dataset.dev).classList.add('active');
}));

/* calculadora */
let calcOp='+';
const codeMap={
  '+':['Suma','double resultado = a + b;'],
  '-':['Resta','double resultado = a - b;'],
  '*':['Multiplicación','double resultado = a * b;'],
  '/':['División','double resultado = b != 0 ? a / b : Double.NaN;'],
  '%':['Porcentaje','double resultado = a * (b / 100.0);'],
  'log':['Logaritmo','double resultado = Math.log10(a);']
};
function updateCalc(){
 const a=Number($('#calc-a').value||0),b=Number($('#calc-b').value||0);
 $('#calc-b').disabled=calcOp==='log';
 let expr='',res=0;
 if(calcOp==='+'){expr=`${a} + ${b}`;res=a+b}
 if(calcOp==='-'){expr=`${a} − ${b}`;res=a-b}
 if(calcOp==='*'){expr=`${a} × ${b}`;res=a*b}
 if(calcOp==='/'){expr=`${a} ÷ ${b}`;res=b===0?NaN:a/b}
 if(calcOp==='%'){expr=`${b}% de ${a}`;res=a*(b/100)}
 if(calcOp==='log'){expr=`log10(${a})`;res=a>0?Math.log10(a):NaN}
 $('#calc-expression').textContent=expr;$('#calc-result').textContent=Number.isFinite(res)?String(Math.round(res*100000)/100000):(calcOp==='/'&&b===0?'No dividir por 0':calcOp==='log'&&a<=0?'Usa A > 0':'Fuera de rango');
 $('#calc-op-name').textContent=codeMap[calcOp][0];$('#java-title').textContent=codeMap[calcOp][0];$('#java-code').textContent=codeMap[calcOp][1];
}
$$('[data-op]').forEach(b=>b.addEventListener('click',()=>{calcOp=b.dataset.op;updateCalc()}));
$('#calc-equals').addEventListener('click',updateCalc);
$('#calc-clear').addEventListener('click',()=>{$('#calc-a').value=0;$('#calc-b').value=0;calcOp='+';updateCalc()});
['#calc-a','#calc-b'].forEach(id=>$(id).addEventListener('keydown',e=>{if(e.key==='Enter')updateCalc()}));
updateCalc();

/* Tienda M4: simulación local, cantidades enteras y pesos redondeados. */
let m4Cart=[];
const clp=n=>'$'+Math.round(n).toLocaleString('es-CL');
function renderM4(){
 const box=$('#m4-items');box.replaceChildren();
 if(!m4Cart.length){const p=document.createElement('p');p.className='empty';p.textContent='Carrito vacío';box.append(p);}
 m4Cart.forEach((item,idx)=>{const p=document.createElement('p'),name=document.createElement('span'),price=document.createElement('b'),remove=document.createElement('button');name.textContent=`${item.name} × ${item.qty}`;price.textContent=clp(item.price*item.qty);remove.className='remove-item';remove.textContent='Quitar';remove.setAttribute('aria-label','Quitar '+item.name);remove.onclick=()=>{m4Cart.splice(idx,1);renderM4();$('#m4-message').textContent='Producto retirado.';};p.append(name,price,remove);box.append(p);});
 const subtotal=m4Cart.reduce((s,i)=>s+i.price*i.qty,0),raw=$('#m4-discount').value,disc=Number(raw),discountValid=raw.trim()!==''&&Number.isFinite(disc)&&disc>=0&&disc<=100,save=discountValid?Math.round(subtotal*disc/100):0,total=subtotal-save,paid=Number($('#m4-paid').value);$('#m4-discount').setAttribute('aria-invalid',String(!discountValid));$('#discount-error').textContent=discountValid?'Escribe un porcentaje entre 0 y 100; admite decimales.':'Ingresa un porcentaje válido entre 0 y 100.';window.clearPrintedReceipt?.();
 $('#m4-subtotal').textContent=clp(subtotal);$('#m4-save').textContent='−'+clp(save);$('#m4-total').textContent=clp(total);$('#m4-change').textContent=Number.isFinite(paid)&&paid>=total?clp(paid-total):'$0';$('#m4-confirm').disabled=false;
 if($('#register-display'))$('#register-display').textContent=clp(total);
 if(!discountValid){$('#m4-total').textContent='—';$('#register-display').textContent='—';}window.lastM4Totals={subtotal,disc,save,total,paid,discountValid};return lastM4Totals;
}
$('#m4-add').addEventListener('click',()=>{const s=$('#m4-product'),o=s.options[s.selectedIndex],qty=Number($('#m4-qty').value);if(!Number.isInteger(qty)||qty<1||qty>20){$('#m4-message').textContent='Ingresa una cantidad entera entre 1 y 20.';return;}m4Cart.push({name:o.text.split(' · ')[0],price:Number(o.value),qty});renderM4();$('#m4-message').textContent='Producto agregado al carrito.';});
['#m4-discount','#m4-paid'].forEach(id=>$(id).addEventListener('input',()=>{renderM4();$('#m4-message').textContent='Importes actualizados. Simulación sin pagos reales.';}));
$('#m4-confirm').addEventListener('click',()=>{const x=renderM4(),message=$('#m4-message');if(!x.discountValid){message.textContent='Ingresa un porcentaje válido entre 0 y 100.';return;}if(!m4Cart.length){message.textContent='Agrega al menos un producto al carrito.';return;}if(!Number.isSafeInteger(x.paid)||x.paid<0){message.textContent='Ingresa un pago en pesos enteros, mayor o igual que cero.';return;}if(x.paid<x.total){message.textContent=`Pago insuficiente. Faltan ${clp(x.total-x.paid)}.`;return;}message.textContent=`Compra simulada confirmada · vuelto ${clp(x.paid-x.total)}. No se realizó ningún cobro.`;$('#m4-confirm').disabled=true;});
$('#m4-clear').addEventListener('click',()=>{m4Cart=[];$('#m4-paid').value=0;$('#m4-discount').value=0;renderM4();$('#m4-message').textContent='Caja lista para una nueva compra simulada.';});renderM4();

/* Datos de la muestra: no persistencia ni peticiones de red. */
let rows=[{name:'Luna',age:28,color:'Morado',music:'Soundtracks'},{name:'Nico',age:34,color:'Negro',music:'Rock'},{name:'Mara',age:25,color:'Rosado',music:'Pop'}];
const colorHex={'Rojo':'#e86a80','Amarillo':'#ead37f','Azul':'#8aaaf0','Naranja':'#efad7b','Verde':'#a8d9b8','Violeta':'#ba93f0','Rojo anaranjado':'#e98b87','Amarillo anaranjado':'#efc183','Amarillo verdoso':'#cbd791','Azul verdoso':'#88cfc5','Azul violáceo':'#a49ce0','Rojo violáceo':'#dc98cc','Rosado':'#f5a8cf','Morado':'#ba93f0','Celeste':'#91dcff','Turquesa':'#81d1d7','Dorado':'#e2ba53','Blanco':'#fffafd','Gris':'#b8b9cf','Negro':'#74758c','Café':'#bc9382','Otro':'#ccacd9'};
const chartPalette=['#f5a8cf','#ba93f0','#91dcff','#e2ba53','#c6b9ed','#b2daca'];
function escapeHTML(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
function counts(key){const tally=new Map();rows.forEach(r=>tally.set(r[key],(tally.get(r[key])||0)+1));return [...tally].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'es'));}
function renderData(){
 const tb=$('#data-table');tb.replaceChildren();
 rows.forEach(r=>{const tr=document.createElement('tr');[r.name,String(r.age),r.color,r.music].forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.append(td)});tb.append(tr)});
 if(!rows.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=4;td.textContent='Aún no hay registros. Crea tu propia muestra.';tr.append(td);tb.append(tr);}
 const avg=rows.length?rows.reduce((s,r)=>s+r.age,0)/rows.length:0;
 const top=key=>{const list=counts(key);if(!list.length)return 'Sin datos';const tied=list.filter(x=>x[1]===list[0][1]);return `${tied.length>1?'Empate: ':''}${tied.map(x=>x[0]).join(', ')} · ${Math.round(list[0][1]/rows.length*100)}%${tied.length>1?' cada uno':''}`;};
 const stats=$('#data-stats');stats.replaceChildren();
 [['Registros',rows.length],['Edad promedio',rows.length?avg.toLocaleString('es-CL',{minimumFractionDigits:1,maximumFractionDigits:1}):'—'],['Color más elegido',top('color')],['Música más elegida',top('music')]].forEach(([label,value])=>{const d=document.createElement('div');d.className='stat';const s=document.createElement('small'),v=document.createElement('strong');s.textContent=label;v.textContent=value;d.append(s,v);stats.append(d)});
 renderChart();if(window.renderCrossAnalysis)window.renderCrossAnalysis();
}
function renderChart(){if(window.renderVerticalData){window.renderVerticalData();return;}
 const key=$('#chart-kind').value,chart=$('#data-chart');chart.replaceChildren();$('#chart-title').textContent=key==='color'?'Los colores de esta muestra':'La música de esta muestra';
 if(!rows.length){const p=document.createElement('p');p.className='empty-chart';p.textContent='Agrega un registro para comenzar a dibujar las barras.';chart.append(p);return;}
 counts(key).forEach(([name,count],i)=>{const percent=count/rows.length*100;const row=document.createElement('div');row.className='chart-row';const label=document.createElement('div');label.className='bar-label';const n=document.createElement('span'),v=document.createElement('strong');n.textContent=name;v.textContent=`${count} · ${Math.round(percent)}%`;label.append(n,v);const track=document.createElement('div');track.className='bar-track';track.setAttribute('aria-hidden','true');const fill=document.createElement('div');fill.className='bar-fill';fill.style.width=percent+'%';fill.style.setProperty('--bar',key==='color'?colorHex[name]||chartPalette[0]:chartPalette[i%chartPalette.length]);track.append(fill);row.append(label,track);chart.append(row)});
}
function musicOther(){const other=$('#data-music').value==='Otro';$('#other-music-label').hidden=!other;$('#data-other-music').required=other;}
$('#data-music').addEventListener('change',musicOther);
$('#data-color').addEventListener('change',()=>$('#color-swatch').style.background=colorHex[$('#data-color').value]);
$('#chart-kind').addEventListener('change',renderChart);
$('#data-form').addEventListener('submit',e=>{e.preventDefault();const name=$('#data-name').value.trim(),age=Number($('#data-age').value),music=$('#data-music').value==='Otro'?$('#data-other-music').value.trim():$('#data-music').value;if(!name||!music||!Number.isInteger(age)||age<1||age>120){$('#data-message').textContent='Escribe un nombre, una edad entera de 1 a 120 y un género musical.';return;}rows.push({name,age,color:$('#data-color').value,music});e.target.reset();musicOther();$('#color-swatch').style.background=colorHex.Rosado;renderData();$('#data-message').textContent='Registro guardado. Las estadísticas y las barras están actualizadas.';});
$('#data-clear').addEventListener('click',()=>{rows=[];renderData();$('#data-message').textContent='Muestra vacía. Puedes comenzar de nuevo.'});
renderData();musicOther();

/* tabs juegos */
$$('.game-tab').forEach(btn=>btn.addEventListener('click',()=>{
  $$('.game-tab').forEach(x=>x.classList.remove('active'));$$('.game-panel').forEach(x=>x.classList.remove('active'));
  btn.classList.add('active');$('#game-'+btn.dataset.game).classList.add('active');
  if(btn.dataset.game!=='tetris'&&play.running&&!play.paused)play.pause();
}));

/* tetris jugable */
const play=new ConariTetris($('#play-tetris'),{onChange:s=>{
 $('#play-level').textContent=String(1+Math.floor(s.lines/8));
 $('#play-score').textContent=String(s.score).padStart(5,'0');$('#play-lines').textContent=String(s.lines).padStart(2,'0');
 $('#play-status').textContent=s.over?'Fin de partida · pulsa iniciar para volver a jugar':s.paused?'Pausa':`${s.lines} líneas · sigue jugando`;
 if(s.cleared&&window.showLineMagic)window.showLineMagic(s.clearedRows);
}});
play.running=false;play.draw();
$('#play-start').addEventListener('click',()=>{play.start();$('#play-tetris').focus({preventScroll:true})});
function controlTetris(action){if(!play.running)return;if(action==='left')play.move(-1);if(action==='right')play.move(1);if(action==='down')play.down(true);if(action==='rotate')play.rotate();if(action==='drop')play.drop();if(action==='pause')play.pause();}
$('#play-tetris').addEventListener('keydown',e=>{if(!$('#game-tetris').classList.contains('active')||!play.running)return;const action={ArrowLeft:'left',ArrowRight:'right',ArrowDown:'down',ArrowUp:'rotate',' ':'drop',p:'pause',P:'pause'}[e.key];if(action){e.preventDefault();controlTetris(action);}},{passive:false});
$$('[data-tetris-action]').forEach(b=>b.addEventListener('click',()=>controlTetris(b.dataset.tetrisAction)));
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(play.running&&!play.paused)play.pause();demoTetris.destroy();}else if(!$('#site').classList.contains('ready')&&!reduceMotion)demoTetris.schedule();});
new IntersectionObserver(entries=>{if(!entries[0].isIntersecting&&play.running&&!play.paused)play.pause();},{threshold:.1}).observe($('#play-tetris'));

/* Match-3: 4 cohete, 5 bomba, 6+ bola disco. */
const gems=[['✦','#f6cf63','Estrella'],['◆','#bd92ef','Cristal'],['●','#8fe0ff','Perla'],['♥','#ff94c3','Corazón'],['☾','#ded1ff','Luna']];
const N=7;let mg=[],mSel=null,mScore=0,mBusy=false,mEpoch=0;
const randomGem=()=>({color:Math.floor(Math.random()*gems.length),special:null});
const adjacent=(a,b)=>Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1])===1;
function findMatches(){const runs=[];for(let r=0;r<N;r++){let s=0;for(let c=1;c<=N;c++){if(c<N&&mg[r][c].color===mg[r][s].color)continue;if(c-s>=3)runs.push(Array.from({length:c-s},(_,i)=>[r,s+i]));s=c;}}for(let c=0;c<N;c++){let s=0;for(let r=1;r<=N;r++){if(r<N&&mg[r][c].color===mg[s][c].color)continue;if(r-s>=3)runs.push(Array.from({length:r-s},(_,i)=>[s+i,c]));s=r;}}return runs;}
function matchGroups(runs){const groups=[];for(const run of runs){let cells=new Set(run.map(p=>p.join(','))),joined=[];for(let i=0;i<groups.length;i++)if([...cells].some(k=>groups[i].cells.has(k)))joined.push(i);const allRuns=[run];for(const i of joined.reverse()){groups[i].cells.forEach(k=>cells.add(k));allRuns.push(...groups[i].runs);groups.splice(i,1);}groups.push({cells,runs:allRuns});}return groups;}
function swap(a,b){[mg[a[0]][a[1]],mg[b[0]][b[1]]]=[mg[b[0]][b[1]],mg[a[0]][a[1]]];}
function hasMove(){for(let r=0;r<N;r++)for(let c=0;c<N;c++){if(mg[r][c].special)return true;for(const [dr,dc] of [[0,1],[1,0]]){const b=[r+dr,c+dc];if(b[0]>=N||b[1]>=N)continue;swap([r,c],b);const yes=findMatches().length>0;swap([r,c],b);if(yes)return true;}}return false;}
function freshBoard(){let attempts=0;do{mg=[];for(let r=0;r<N;r++){mg[r]=[];for(let c=0;c<N;c++){let item;do{item=randomGem();}while((c>=2&&mg[r][c-1].color===item.color&&mg[r][c-2].color===item.color)||(r>=2&&mg[r-1][c].color===item.color&&mg[r-2][c].color===item.color));mg[r][c]=item;}}}while(!hasMove()&&++attempts<100);}
function initMatch(){mEpoch++;mBusy=false;mScore=0;mSel=null;freshBoard();mg[3][1].special='rocket';mg[3][1].axis='row';mg[3][3].special='bomb';mg[3][5].special='disco';window.gemHint=null;renderMatch();$('#match-message').textContent='Regalo inicial: un cohete, una bomba y una bola disco. Intercambia cualquiera con una gema vecina para activarlo.';window.resetGemLesson?.();}
const specialName={rocket:'cohete',bomb:'bomba',disco:'bola disco'};
function renderMatch(burst=new Set()){
 const grid=$('#match-grid');grid.replaceChildren();
 mg.forEach((row,r)=>row.forEach((item,c)=>{const b=document.createElement('button');b.type='button';b.className='gem'+(item.special?' special '+item.special:'')+(mSel&&mSel[0]===r&&mSel[1]===c?' selected':'')+(burst.has(`${r},${c}`)?' burst':'');b.style.setProperty('--gem',gems[item.color][1]);
 if(item.special){const img=document.createElement('img');img.src='assets/gema-'+item.special+'.svg';img.alt='';img.className='special-art';if(item.special==='rocket'&&item.axis==='column')img.style.transform='rotate(-90deg)';b.append(img);}else b.textContent=gems[item.color][0];
 b.disabled=mBusy;b.setAttribute('aria-pressed',String(!!mSel&&mSel[0]===r&&mSel[1]===c));b.setAttribute('aria-label',`${gems[item.color][2]}${item.special?', '+specialName[item.special]+(item.special==='rocket'?', limpia '+(item.axis==='column'?'columna':'fila'):''):''}, fila ${r+1}, columna ${c+1}`);b.onclick=()=>pickGem(r,c);b.onkeydown=e=>{const dir={ArrowLeft:[0,-1],ArrowRight:[0,1],ArrowUp:[-1,0],ArrowDown:[1,0]}[e.key];if(dir){e.preventDefault();const nr=(r+dir[0]+N)%N,nc=(c+dir[1]+N)%N;grid.children[nr*N+nc].focus();}};grid.append(b)}));$('#match-score').textContent=String(mScore).padStart(4,'0');window.updateGemTools?.();
}
function pauseGem(){return new Promise(resolve=>setTimeout(resolve,reduceMotion?0:320));}
async function resolveMatch(epoch,preferred,forced=[],discoTargets=new Map()){
 let combo=0;
 while(epoch===mEpoch){
  const runs=findMatches();if(!runs.length&&!forced.length)break;
  const clear=new Set(runs.flat().map(p=>p.join(',')));forced.forEach(p=>clear.add(p.join(',')));
  const created=new Map();matchGroups(runs).filter(g=>g.cells.size>=4).forEach(group=>{const cells=[...group.cells],prefer=preferred?.join(',');const at=cells.includes(prefer)&&!mg[preferred[0]][preferred[1]].special?prefer:cells.find(k=>{const [r,c]=k.split(',').map(Number);return !mg[r][c].special;});if(!at)return;const [r,c]=at.split(',').map(Number),longest=group.runs.reduce((a,b)=>a.length>=b.length?a:b);created.set(at,{color:mg[r][c].color,special:group.cells.size>=6?'disco':group.cells.size===5?'bomb':'rocket',axis:longest[0][0]===longest[1][0]?'row':'column'});});
  const processed=new Set(),activated=[];
  // La cola crece cuando un especial alcanza a otro. Cada uno se activa una vez.
  let previous=-1;while(previous!==clear.size){previous=clear.size;for(const key of [...clear]){if(processed.has(key))continue;processed.add(key);const [r,c]=key.split(',').map(Number),item=mg[r][c];if(!item.special)continue;activated.push(specialName[item.special]);if(item.special==='rocket'){for(let i=0;i<N;i++)clear.add(item.axis==='column'?`${i},${c}`:`${r},${i}`);}else if(item.special==='bomb'){for(let dr=-2;dr<=2;dr++)for(let dc=-2;dc<=2;dc++)if(r+dr>=0&&r+dr<N&&c+dc>=0&&c+dc<N)clear.add(`${r+dr},${c+dc}`);}else{const target=discoTargets.has(key)?discoTargets.get(key):item.color;mg.forEach((row,rr)=>row.forEach((v,cc)=>{if(target===-1||v.color===target)clear.add(`${rr},${cc}`)}));}}}
  created.forEach((item,key)=>clear.delete(key));combo++;mScore+=clear.size*40*combo;
  $('#match-message').textContent=`${combo>1?'Cascada ×'+combo+' · ':''}${clear.size} gemas iluminadas${activated.length?' · '+activated.join(' + '):''}${created.size?' · creado: '+[...created.values()].map(x=>specialName[x.special]).join(', '):''}.`;
  renderMatch(clear);window.showGemPower?.(activated,[...created.values()].map(x=>x.special));await pauseGem();if(epoch!==mEpoch)return;
  created.forEach((item,key)=>{const [r,c]=key.split(',').map(Number);mg[r][c]=item;});
  for(let c=0;c<N;c++){const kept=[];for(let r=N-1;r>=0;r--)if(!clear.has(`${r},${c}`))kept.push(mg[r][c]);while(kept.length<N)kept.push(randomGem());for(let r=N-1,k=0;r>=0;r--,k++)mg[r][c]=kept[k];}
  forced=[];preferred=null;discoTargets=new Map();renderMatch();await pauseGem();if(combo>=100){freshBoard();break;}
 }
 if(epoch!==mEpoch)return;mBusy=false;if(!hasMove()){freshBoard();$('#match-message').textContent='El jardín se reorganizó: hay nuevas combinaciones disponibles.';}renderMatch();
}
function pickGem(r,c){if(mBusy)return;const b=[r,c];if(!mSel){mSel=b;renderMatch();$('#match-grid').children[r*N+c].focus({preventScroll:true});return;}const a=mSel;if(a[0]===r&&a[1]===c){mSel=null;renderMatch();return;}if(!adjacent(a,b)){mSel=b;renderMatch();$('#match-grid').children[r*N+c].focus({preventScroll:true});return;}swap(a,b);mSel=null;const forced=[a,b].filter(([rr,cc])=>mg[rr][cc].special);if(!findMatches().length&&!forced.length){swap(a,b);$('#match-message').textContent='Ese intercambio no forma una combinación. Prueba otra pareja.';renderMatch();return;}const targets=new Map();for(const [here,other] of [[a,b],[b,a]]){const item=mg[here[0]][here[1]],neighbor=mg[other[0]][other[1]];if(item.special==='disco')targets.set(here.join(','),neighbor.special==='disco'?-1:neighbor.color);}window.gemRoundEvents=[];mBusy=true;resolveMatch(mEpoch,b,forced,targets);}
$('#match-reset').addEventListener('click',initMatch);initMatch();


/* Trazados reales proyectados en un tablero cuadrado; las ramas no se unen entre sí. */
const constellations=window.CONSTELLATIONS;
const revealArt=[['assets/expressions.webp','Estudio de expresiones · María Inés'],['assets/digital-lineart.webp','Line art y vestuario · María Inés'],['assets/arte-transicion-soledad-alegria.jpeg','Transición de soledad a alegría · obra tradicional'],['assets/arte-personaje-esteban.jpeg','Personaje personalizado · dibujo tradicional'],['assets/arte-panorama-kevin.jpeg','Panorama para Kevin · dibujo tradicional'],['assets/mundo-conari-sol-luna.webp','El mundo de Conari · ilustración del portafolio'],['assets/hada-corregida.webp','El hada del portafolio · recurso visual'],['assets/emblema-conari-magico.webp','Identidad mágica de Studios Conari']];
let constellationIndex=0,starIndex=0,revealIndex=0,starRound=0;const discovered=new Set();
constellations.forEach((item,i)=>{const o=document.createElement('option');o.value=i;o.textContent=item.name;$('#constellation-select').append(o);});
function initStars(){starRound++;$('#reveal-image').hidden=true;$('#reveal-image').removeAttribute('src');$('#reveal-image').alt='Recompensa oculta';const cfg=constellations[constellationIndex];starIndex=0;$('#constellation-select').value=constellationIndex;$('#constellation-name').textContent=cfg.name;$('#constellation-note').textContent=cfg.note;$('#lesson-title').textContent=cfg.latin+' · '+cfg.name;$('#lesson-description').textContent=cfg.lesson;$('#atlas-progress').textContent=discovered.size+' de '+constellations.length+' constelaciones descubiertas';$('#constellation-source').href=cfg.source;$('#constellation-board').classList.remove('complete');$('#constellation-lines').replaceChildren();const art=revealArt[revealIndex%revealArt.length];$('#reveal-image').setAttribute('aria-hidden','true');const layer=$('#star-layer');layer.replaceChildren();cfg.points.forEach((p,i)=>{const b=document.createElement('button');b.type='button';b.className='star-point'+(i===0?' next':'');b.style.left=p[0]+'%';b.style.top=p[1]+'%';b.textContent='✦';b.dataset.step=i+1;b.setAttribute('aria-label',`Estrella ${i+1} de ${cfg.points.length}${i===0?', siguiente':''}`);b.onclick=()=>hitStar(i);layer.append(b)});$('#star-message').textContent='Comienza por la estrella 1, que está brillando.';updateStarText();window.updateAtlas?.();}
function hitStar(i){const cfg=constellations[constellationIndex];if(starIndex>=cfg.points.length)return;if(i!==starIndex){$('#star-message').textContent=`Sigue el brillo: toca la estrella ${starIndex+1}.`;return;}const points=$$('.star-point');points[i].classList.remove('next');points[i].classList.add('done');points[i].setAttribute('aria-label',`Estrella ${i+1}, completada`);starIndex++;
 $('#constellation-lines').replaceChildren();cfg.edges.filter(([a,b])=>a<starIndex&&b<starIndex).forEach(([a,b])=>{const line=document.createElementNS('http://www.w3.org/2000/svg','line');line.setAttribute('x1',cfg.points[a][0]);line.setAttribute('y1',cfg.points[a][1]);line.setAttribute('x2',cfg.points[b][0]);line.setAttribute('y2',cfg.points[b][1]);$('#constellation-lines').append(line);});
 if(starIndex<cfg.points.length){points[starIndex].classList.add('next');points[starIndex].setAttribute('aria-label',`Estrella ${starIndex+1}, siguiente`);$('#star-message').textContent=`Estrella ${starIndex} conectada. Sigue con la ${starIndex+1}.`;points[starIndex].focus({preventScroll:true});}else{revealReward(cfg);$('#star-reset').focus({preventScroll:true});}updateStarText();}
async function revealReward(cfg){const round=starRound,img=$('#reveal-image'),art=revealArt[revealIndex%revealArt.length];discovered.add(cfg.id);window.updateAtlas?.();$('#atlas-progress').textContent=discovered.size+' de '+constellations.length+' constelaciones descubiertas';$('#star-message').textContent=cfg.name+' completa · revelando tu recompensa…';img.src=art[0];try{await img.decode();}catch{if(round===starRound)$('#star-message').textContent='Constelación completa. No fue posible cargar la ilustración.';return;}if(round!==starRound)return;img.alt=art[1];img.hidden=false;img.removeAttribute('aria-hidden');$('#constellation-board').classList.add('complete');$('#star-message').textContent=cfg.name+' completa. Ilustración revelada: '+art[1]+'.';}
function updateStarText(){$('#star-progress').textContent=`${starIndex} / ${constellations[constellationIndex].points.length}`;}
$('#star-reset').addEventListener('click',()=>{constellationIndex=(constellationIndex+1)%constellations.length;revealIndex++;initStars();});
$('#constellation-select').addEventListener('change',e=>{constellationIndex=Number(e.target.value);revealIndex++;initStars();});initStars();

/* Navegación y preferencias de lectura. */
$('.menu-toggle').addEventListener('click',()=>{const open=$('#main-nav').classList.toggle('open');$('.menu-toggle').setAttribute('aria-expanded',String(open));});
$$('#main-nav a').forEach(link=>link.addEventListener('click',()=>{$('#main-nav').classList.remove('open');$('.menu-toggle').setAttribute('aria-expanded','false');}));
$$('[data-art]').forEach(b=>b.addEventListener('click',()=>{$('.art-compare').dataset.view=b.dataset.art;$$('[data-art]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});}));
function accessibleTabs(buttonSelector,panelPrefix){const buttons=$$(buttonSelector);buttons[0].parentElement.setAttribute('role','tablist');buttons.forEach((b,i)=>{const key=b.dataset.dev||b.dataset.game;b.id=panelPrefix+'tab-'+key;b.setAttribute('role','tab');b.setAttribute('aria-controls',panelPrefix+key);b.setAttribute('aria-selected',String(b.classList.contains('active')));b.tabIndex=b.classList.contains('active')?0:-1;const panel=$('#'+panelPrefix+key);panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',b.id);b.addEventListener('click',()=>buttons.forEach(x=>{x.setAttribute('aria-selected',String(x===b));x.tabIndex=x===b?0:-1;}));b.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%buttons.length;if(e.key==='ArrowLeft')n=(i-1+buttons.length)%buttons.length;if(e.key==='Home')n=0;if(e.key==='End')n=buttons.length-1;if(n!==undefined){e.preventDefault();buttons[n].click();buttons[n].focus();}});});}
accessibleTabs('.dev-tab','dev-');accessibleTabs('.game-tab','game-');
