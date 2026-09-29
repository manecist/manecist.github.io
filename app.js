
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
 $('#play-status').textContent=s.over?'Fin de partida · pulsa iniciar para volver a jugar':s.paused?'Pausa':`${s.lines} ${s.lines===1?'línea':'líneas'} · sigue jugando`;
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

// ===== Galería M7, teclado de la caja y análisis cruzado de datos =====
// Vistas reales del proyecto; no simulan una conexión al backend.
const m7Views=[['inicio','Inicio · identidad visual y navegación de Magical Alliance.'],['catalogo','Catálogo · búsqueda, filtros y productos organizados por categoría.'],['carrito','Carrito · revisión de productos, cantidades e importes.'],['gestion','Gestión · acceso del administrador a las áreas del sistema.']];
$$('[data-m7]').forEach(b=>b.addEventListener('click',()=>{const [key,caption]=m7Views[Number(b.dataset.m7)];$('#m7-preview').src='assets/m7-'+key+'.webp';$('#m7-preview').alt='Captura real de M7: '+caption;$('#m7-full').href=$('#m7-preview').getAttribute('src');$('#m7-caption').textContent=caption;$$('[data-m7]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));}));
$$('[data-cash-key]').forEach(b=>b.addEventListener('click',()=>{const input=$('#m4-paid'),key=b.dataset.cashKey;let val=input.value.replace(/\D/g,'');if(key==='C')val='0';else if(key==='←')val=val.slice(0,-1)||'0';else val=(val==='0'?'':val)+key;input.value=val.slice(0,12);input.dispatchEvent(new Event('input',{bubbles:true}));}));
$('#m4-confirm').addEventListener('click',()=>{const confirmed=$('#m4-confirm').disabled;$('.cash-register').classList.toggle('drawer-open',confirmed);});
$('#m4-clear').addEventListener('click',()=>$('.cash-register').classList.remove('drawer-open'));

const percent=(n,d)=>d?(n/d*100).toLocaleString('es-CL',{maximumFractionDigits:1})+'%':'—';
function freq(list,key){const out=new Map();list.forEach(r=>out.set(r[key],(out.get(r[key])||0)+1));return [...out].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'es'));}
function withinAge(r){const band=$('#analysis-age').value;if(band==='all')return true;const [lo,hi]=band.split('-').map(Number);return r.age>=lo&&r.age<=hi;}
function node(tag,text,cls){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;}
window.renderCrossAnalysis=function(){
 const ageRows=rows.filter(withinAge),old=$('#analysis-color').value;
 const colors=freq(ageRows,'color');$('#analysis-color').replaceChildren(new Option('Todos los colores','all'),...colors.map(([k,n])=>new Option(k+' · '+n,k)));
 $('#analysis-color').value=colors.some(([k])=>k===old)?old:'all';
 const color=$('#analysis-color').value,selected=ageRows.filter(r=>color==='all'||r.color===color),ageLabel=$('#analysis-age').selectedOptions[0].text;
 const findings=$('#analysis-findings');findings.replaceChildren();
 const card=(title,text)=>{const el=node('article',undefined,'finding');el.append(node('strong',title),node('p',text));findings.append(el);};
 if(!rows.length){card('Sin registros','Agrega personas o carga el ejemplo ficticio para comparar preferencias.');}
 else{card(ageLabel,`${ageRows.length} de ${personas(rows.length)} · ${percent(ageRows.length,rows.length)} de la muestra total.`);
 if(ageRows.length){const topColor=colors[0][1],winners=colors.filter(x=>x[1]===topColor);card(winners.length>1?'Colores con igual frecuencia':'Color más frecuente',winners.map(([k,n])=>`${k}: ${n}/${ageRows.length} (${percent(n,ageRows.length)})`).join(' · ')+'.');}
 else card('Grupo sin registros','Todavía no hay personas en este rango de edad. Prueba otro grupo.');
 if(color!=='all')card('Personas que prefieren '+color,`${selected.length} de ${ageRows.length} dentro de esta edad · ${percent(selected.length,ageRows.length)}. ${selected.length===1?'La música se calcula solo para esa persona.':`La música se calcula solo entre esas ${selected.length} personas.`}`);
 const music=freq(selected,'music');if(music.length){const topMusic=music[0][1];card(color==='all'?'Música en este grupo':'Música entre quienes prefieren '+color,music.filter(x=>x[1]===topMusic).map(([k,n])=>`${k}: ${n} de ${selected.length} (${percent(n,selected.length)})`).join(' · ')+'.');}}
 const bars=$('#analysis-bars');bars.replaceChildren();if(!selected.length)bars.append(node('p','Sin datos para esta selección.','empty-chart'));
 freq(selected,'music').forEach(([key,count],i)=>{const item=node('div',undefined,'chart-row'),label=node('div',undefined,'bar-label');label.append(node('span',key),node('strong',`${count}/${selected.length} · ${percent(count,selected.length)}`));const track=node('div',undefined,'bar-track'),fill=node('div',undefined,'bar-fill');fill.style.width=count/selected.length*100+'%';fill.style.setProperty('--bar',chartPalette[i%chartPalette.length]);track.setAttribute('aria-hidden','true');track.append(fill);item.append(label,track);bars.append(item);});
 const table=$('#cross-table');table.replaceChildren();
 if(selected.length){const music=freq(selected,'music').map(x=>x[0]);const cap=node('caption',`Relación color y música · ${ageLabel.toLowerCase()} · ${personas(selected.length)}`);table.append(cap);const head=node('thead'),hr=node('tr');['Color / música',...music,'Personas'].forEach(text=>{const th=node('th',text);th.scope='col';hr.append(th);});head.append(hr);table.append(head);const body=node('tbody');freq(selected,'color').forEach(([c,total])=>{const tr=node('tr'),th=node('th',c);th.scope='row';tr.append(th);music.forEach(m=>{const n=selected.filter(r=>r.color===c&&r.music===m).length,td=node('td',`${n} · ${percent(n,total)}`);td.style.background=n?'rgba(186,147,240,'+(0.08+0.3*n/total)+')':'transparent';tr.append(td);});tr.append(node('td',String(total)));body.append(tr);});table.append(body);}
 else table.append(node('caption','No hay combinaciones para mostrar.'));
 $('#analysis-caution').textContent=selected.length?`${selected.length<10?'Grupo pequeño: cada persona puede cambiar mucho los porcentajes. ':''}Base del análisis musical: ${personas(selected.length)}. Estos resultados describen solo los registros visibles; no representan a toda la población.`:'Las estadísticas aparecerán al agregar registros a este grupo.';window.renderRelationshipReport?.(ageRows,selected,color,ageLabel);
};
['#analysis-age','#analysis-color'].forEach(s=>$(s).addEventListener('change',renderCrossAnalysis));
$('#data-form').addEventListener('submit',()=>{if($('#data-message').textContent.startsWith('Registro guardado'))$('#sample-origin').textContent='Muestra local: registros ingresados y cualquier ejemplo ficticio que hayas conservado.';});
$('#data-clear').addEventListener('click',()=>{$('#sample-origin').textContent='Muestra vacía · lista para tus propios registros.';});
$('#data-example').addEventListener('click',()=>{
 const demo=[[6,'Rojo','Pop'],[7,'Rojo','Pop'],[9,'Rojo','Pop'],[10,'Rojo','Pop'],[12,'Rojo','Romántica'],[31,'Rojo','Rock'],[34,'Rojo','Rock'],[38,'Rojo','Rock'],[40,'Rojo','Metal'],[44,'Rojo','Pop'],[18,'Negro','Metal'],[22,'Negro','Metal'],[25,'Negro','Metal sinfónico'],[29,'Negro','Rock'],[13,'Rosado','K-pop'],[15,'Rosado','K-pop'],[17,'Rosado','Pop'],[46,'Morado','Romántica'],[52,'Morado','Romántica'],[58,'Morado','Clásica']];
 rows=demo.map(([age,color,music],i)=>({name:'Ejemplo '+String(i+1).padStart(2,'0'),age,color,music}));$('#analysis-age').value='all';$('#analysis-color').value='all';renderData();$('#sample-origin').textContent='20 registros completamente ficticios para aprender a interpretar relaciones. Reemplazaron la muestra anterior.';$('#data-message').textContent='Ejemplo ficticio cargado. Selecciona Rojo y compara sus grupos de edad. Los valores del ejemplo son inventados, no resultados de estudios.';
});
renderCrossAnalysis();

// ===== Hada que rompe las líneas de Bloques Encantados =====
window.showLineMagic=function(lines){const effect=$('#line-magic'),fragments=$('#line-fragments');effect.classList.remove('casting');fragments.replaceChildren();const y=lines.length?(lines.reduce((a,b)=>a+b,0)/lines.length+.5)/20*100:80;effect.style.setProperty('--line-y',y+'%');
 for(const row of lines){for(let col=0;col<10;col++){const shard=document.createElement('i');shard.style.left=(col+.5)*10+'%';shard.style.top=(row+.5)/20*100+'%';shard.style.setProperty('--dx',((col-4.5)*11)+'px');shard.style.setProperty('--dy',(-40-Math.random()*65)+'px');shard.style.setProperty('--delay',(col*25)+'ms');fragments.append(shard);}}
 void effect.offsetWidth;effect.classList.add('casting');clearTimeout(window.lineMagicTimer);window.lineMagicTimer=setTimeout(()=>effect.classList.remove('casting'),2500);};
$('#play-start').addEventListener('click',()=>$('#line-magic').classList.remove('casting'));

// ===== Poderes y retos del Jardín de Gemas, margen de aterrizaje y atlas de constelaciones =====
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
 window.gemHint=[source,target];$('#gem-lesson-hint').hidden=false;$('#gem-lesson-hint').textContent='Toca la estrella marcada 1 y después la gema marcada 2. '+(mode==='bomb-l'||mode==='bomb-t'?'Unirás dos líneas de tres en '+(mode==='bomb-l'?'L':'T')+'. Comparten una estrella: son cinco en total y forman una bomba.':type==='disco'?'Unirás seis estrellas en dos líneas conectadas para crear una bola disco.':'Unirás '+size+' estrellas para crear '+(type==='bomb'?'una bomba.':'un cohete.'));
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

// ===== Boleta impresa, gráficos verticales, lectura de relaciones y hechizo del hada =====
// El papel y el cajón solo se muestran después de validar una compra simulada.
window.clearPrintedReceipt=function(){const out=$('#printer-output');out.hidden=true;out.classList.remove('printing');out.style.height='0px';$('.cash-register').classList.remove('drawer-open');$('.cash-drawer').setAttribute('aria-hidden','true');};
$$('[data-discount]').forEach(b=>b.addEventListener('click',()=>{$('#m4-discount').value=b.dataset.discount;$('#m4-discount').dispatchEvent(new Event('input',{bubbles:true}));}));
$('#m4-confirm').addEventListener('click',()=>{
 if(!$('#m4-confirm').disabled)return;
 const x=window.lastM4Totals,paper=$('#printed-receipt');paper.replaceChildren();paper.append(node('div','✦ STUDIOS CONARI ✦','paper-brand'),node('h4','Boleta de tu compra'),node('p','DEMOSTRACIÓN · SIN VALIDEZ TRIBUTARIA','paper-note'));
 const items=node('div',undefined,'paper-items');m4Cart.forEach(item=>{const row=node('div',undefined,'paper-item');row.append(node('span',item.name+' × '+item.qty),node('b',clp(item.price*item.qty)));items.append(row);});paper.append(items);
 [['Subtotal',x.subtotal],['Descuento '+x.disc.toLocaleString('es-CL')+'%',-x.save],['TOTAL',x.total],['Pagaste',x.paid],['Tu vuelto',x.paid-x.total]].forEach(([label,n])=>{const line=node('div',undefined,'paper-total'+(label==='TOTAL'?' grand-total':''));line.append(node('span',label),node('b',n<0?'−'+clp(-n):clp(n)));paper.append(line);});
 paper.append(node('p','Gracias por crear un poquito de magia.','paper-thanks'));
 const out=$('#printer-output');out.hidden=false;out.style.height='0px';out.classList.remove('printing');void out.offsetHeight;out.style.height=(paper.scrollHeight+20)+'px';out.classList.add('printing');
 $('.cash-register').classList.add('drawer-open');$('.cash-drawer').setAttribute('aria-hidden','false');$('#drawer-change').textContent='Tu vuelto: '+clp(x.paid-x.total);
 $('#m4-message').textContent='Boleta impresa · cajón abierto · vuelto '+clp(x.paid-x.total)+'. Compra de demostración, sin cobro real.';
});
$$('[data-music-choice]').forEach(b=>b.addEventListener('click',()=>{$('#data-music').value=b.dataset.musicChoice;musicOther();$('#data-music').focus({preventScroll:true});}));

function verticalChart(target,entries,total,palette){
 const root=$(target);root.replaceChildren();root.classList.add('vertical-chart');
 if(!entries.length){root.append(node('p','Agrega registros para descubrir las preferencias.','empty-chart'));return;}
 const max=Math.max(...entries.map(x=>x[1])),unit=node('p','Personas · escala de 0 a '+max,'chart-unit');root.append(unit);
 const scroll=node('div',undefined,'columns-scroll');scroll.tabIndex=0;scroll.setAttribute('aria-label','Gráfico de barras verticales. Desplázate horizontalmente si hay más categorías.');const plot=node('div',undefined,'columns-plot');plot.style.setProperty('--columns',entries.length);
 entries.forEach(([label,count],i)=>{const item=node('figure',undefined,'vertical-column'),track=node('div',undefined,'column-track'),bar=node('div',undefined,'column-fill'),value=node('b',String(count),'column-value');bar.style.height=(count/max*100)+'%';bar.style.setProperty('--column-color',palette(label,i));bar.append(value);track.append(bar);const caption=node('figcaption');caption.append(node('strong',label),node('small',percent(count,total)));item.append(track,caption);item.setAttribute('aria-label',label+': '+count+' de '+personas(total)+', '+percent(count,total));plot.append(item);});
 scroll.append(plot);root.append(scroll,node('p','Base: '+personas(total)+'. Altura = cantidad; etiqueta = porcentaje de este grupo.','chart-base'));
}
window.renderVerticalData=function(){const key=$('#chart-kind').value;$('#chart-title').textContent=key==='color'?'Los colores de esta muestra':'La música de esta muestra';verticalChart('#data-chart',counts(key),rows.length,(name,i)=>key==='color'?(colorHex[name]||chartPalette[0]):chartPalette[i%chartPalette.length]);};
window.renderRelationshipReport=function(ageRows,selected,color,ageLabel){
 verticalChart('#analysis-bars',freq(selected,'music'),selected.length,(_,i)=>chartPalette[i%chartPalette.length]);
 const root=$('#relationship-summary');root.replaceChildren();
 if(!selected.length){root.append(node('p','Aún no hay registros para esta selección. Agrega personas o cambia el grupo de edad.'));return;}
 const groupNote=color==='all'?ageLabel:'Personas que prefieren '+color+' · '+ageLabel.toLowerCase();root.append(node('p',groupNote+' · '+selected.length+' registros analizados.','report-scope'));
 const groups=freq(selected,'color');
 if(groups.every(([,n])=>n===1))root.append(node('p','Todavía no hay una tendencia compartida: cada color tiene una sola persona. Estos registros describen preferencias individuales.','report-intro'));
 const cards=node('div',undefined,'relationship-cards');
 groups.forEach(([c,total])=>{
  const subset=selected.filter(r=>r.color===c),music=freq(subset,'music'),highest=music[0][1],leaders=music.filter(x=>x[1]===highest),card=node('article',undefined,'relationship-card');card.style.setProperty('--relation-color',colorHex[c]||'#c9a7e8');
  const title=leaders.length===1?c+' → '+leaders[0][0]:c+' · preferencias repartidas';card.append(node('h5',title));
  let sentence;if(total===1)sentence='La única persona que elige '+c+' escucha '+leaders[0][0]+'. Un registro no permite identificar una tendencia compartida.';
  else if(leaders.length>1)sentence='Entre las '+total+' personas que eligen '+c+', hay empate entre '+leaders.map(x=>x[0]).join(', ')+': '+highest+' de '+total+' ('+percent(highest,total)+') para cada estilo. No hay una música mayoritaria.';
  else sentence='De las '+total+' personas que prefieren '+c+', '+highest+' escuchan '+leaders[0][0]+' ('+percent(highest,total)+'). '+(highest>total/2?'Es la música elegida por la mayoría de este grupo.':'Es la opción más frecuente, aunque no supera la mitad del grupo.');
  card.append(node('p',sentence));
  if(leaders.length===1&&total>1){const leading=subset.filter(r=>r.music===leaders[0][0]),bands=new Map();leading.forEach(r=>{const band=[...$('#analysis-age').options].slice(1).find(o=>{const [lo,hi]=o.value.split('-').map(Number);return r.age>=lo&&r.age<=hi;});if(band)bands.set(band.text,(bands.get(band.text)||0)+1);});const list=[...bands].sort((a,b)=>b[1]-a[1]),top=list.filter(x=>x[1]===list[0][1]);card.append(node('small','Dentro de esa combinación de '+c+' y '+leaders[0][0]+', '+top.map(([age,n])=>n+' de '+leading.length+' ('+percent(n,leading.length)+') tienen '+age.toLowerCase()).join('; ')+'.'));}
  cards.append(card);
 });root.append(cards);
};
renderChart();renderCrossAnalysis();

// Poses dibujadas: preparación, brazo arriba, golpe de varita y seguimiento.
const wandFrames=Array.from({length:4},(_,i)=>'assets/hada-hechizo-'+i+'.webp');
wandFrames.forEach(src=>{const image=new Image();image.src=src;});
const originalLineMagic=window.showLineMagic;let wandTimers=[];
function stopWand(){wandTimers.forEach(clearTimeout);wandTimers=[];}
window.showLineMagic=function(lines){
 stopWand();originalLineMagic(lines);
 const sprite=$('#line-magic>img'),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 sprite.alt='Hada que levanta el brazo y toca los bloques con su varita';
 function pose(i){sprite.src=wandFrames[i];sprite.dataset.pose=String(i);}
 pose(reduced?3:0);
 if(!reduced)[[180,1],[550,2],[780,3],[1400,2],[1700,1],[1950,0]].forEach(([delay,i])=>wandTimers.push(setTimeout(()=>pose(i),delay)));
};
$('#play-start').addEventListener('click',stopWand);
// Mantener visible toda la boleta si cambia el ancho de la pantalla.
new ResizeObserver(()=>{const out=$('#printer-output');if(!out.hidden)out.style.height=($('#printed-receipt').scrollHeight+20)+'px';}).observe($('#printed-receipt'));

// ===== Informe «El color de nuestras melodías» y fuentes científicas =====
// El análisis usa únicamente los registros de la sesión. Los estudios son contexto.
$('.data-lab').append($('.cross-analysis'));
const ageBands=[...$('#analysis-age').options].filter(o=>o.value!=='all').map(o=>({id:o.value,label:o.text,...Object.fromEntries(o.value.split('-').map((v,i)=>[i?'max':'min',Number(v)]))}));
function cohortFor(list,band){return list.filter(r=>r.age>=band.min&&r.age<=band.max);}
function cohortMusicColor(music){const names=[...new Set(rows.map(r=>r.music))].sort((a,b)=>a.localeCompare(b,'es'));return chartPalette[names.indexOf(music)%chartPalette.length];}
function musicSummary(list){const entries=freq(list,'music'),n=entries[0]?.[1]||0;return {entries,n,leaders:entries.filter(x=>x[1]===n).map(x=>x[0]),total:list.length};}
function cohortSentence(color,band,list){
 const s=musicSummary(list),base='Entre las '+s.total+' personas de '+band.label.toLowerCase()+' que prefieren '+color+', ';
 if(s.total===1)return 'Hay una persona de '+band.label.toLowerCase()+' que prefiere '+color+' y escucha '+s.leaders[0]+'. Es un caso individual.';
 if(s.leaders.length>1)return base+'empatan '+s.leaders.join(' y ')+': '+s.n+' de '+s.total+' ('+percent(s.n,s.total)+') para cada estilo.';
 return base+s.n+' eligen '+s.leaders[0]+' ('+percent(s.n,s.total)+'). '+(s.n>s.total/2?'Es la mayoría de este grupo.':'Es la opción más frecuente, sin superar la mitad.');
}
window.renderRelationshipReport=function(ageRows,selected,color,ageLabel){
 verticalChart('#analysis-bars',freq(selected,'music'),selected.length,(_,i)=>chartPalette[i%chartPalette.length]);
 const root=$('#relationship-summary');root.replaceChildren();root.append(node('p',$('#sample-origin').textContent,'cohort-origin'));
 if(!selected.length){root.append(node('div','✧ Aún no hay personas en esta selección. Agrega registros o cambia los filtros para descubrir sus melodías.','cohort-empty'));return;}
 const colorGroups=freq(selected,'color').map(([name])=>({name,list:selected.filter(r=>r.color===name)}));
 const scope=node('div',undefined,'cohort-scope');scope.append(node('span','✧ '+personas(selected.length)+' en la selección'),node('span',ageLabel),node('span',color==='all'?'Todos los colores':color));root.append(scope);
 // Una lectura completa conserva siempre edad + color + denominador.
 const focus=colorGroups[0],focusBands=ageBands.map(b=>({band:b,list:cohortFor(focus.list,b)})).filter(g=>g.list.length);
 const lead=node('article',undefined,'cohort-reading');lead.append(node('span','✦ LECTURA DE LA MUESTRA','reading-label'));
 lead.append(node('h5',focus.name+(focusBands.length>1?' a través de las edades':' · '+focusBands[0].band.label)));
 focusBands.slice(0,2).forEach(g=>lead.append(node('p',cohortSentence(focus.name,g.band,g.list))));
 lead.append(node('small',focusBands.length>1?'La comparación describe a estas personas. No demuestra que la edad o el color causen una preferencia musical.':'Para comparar edades de este color, agrega personas de otro rango o selecciona «Todas las edades».'));
 root.append(lead);
 colorGroups.forEach(({name,list})=>{
  const section=node('section',undefined,'color-cohorts');section.style.setProperty('--cohort-color',colorHex[name]||'#c8a7ea');
  const head=node('div',undefined,'color-cohort-heading'),dot=node('i');dot.setAttribute('aria-hidden','true');head.append(dot,node('h5',name),node('span',personas(list.length)));section.append(head);
  const grid=node('div',undefined,'age-cohort-grid');
  ageBands.forEach(b=>{
   const group=cohortFor(list,b);if(!group.length)return;
   const s=musicSummary(group),card=node('article',undefined,'age-cohort');card.dataset.age=b.id;card.dataset.color=name;
   const heading=node('div',undefined,'age-cohort-title');heading.append(node('h6',b.label),node('span','n = '+s.total));card.append(heading);
   const badge=node('div',undefined,'cohort-key');badge.append(node('strong',percent(s.n,s.total)),node('span',s.leaders.length===1?s.leaders[0]:'Empate: '+s.leaders.join(' / ')));card.append(badge);
   card.append(node('p',s.total===1?'1 persona · preferencia individual':s.n+' de '+s.total+' personas'+(s.leaders.length>1?' por cada estilo empatado':s.n>s.total/2?' · mayoría':' · opción más frecuente'),'cohort-count'));
   const scroll=node('div',undefined,'cohort-scroll');scroll.tabIndex=0;scroll.setAttribute('aria-label','Distribución musical de '+name+', '+b.label);
   const bars=node('div',undefined,'cohort-bars');bars.style.setProperty('--cohort-columns',s.entries.length);
   s.entries.forEach(([music,n])=>{const col=node('figure'),track=node('div',undefined,'cohort-track'),fill=node('div',undefined,'cohort-fill');fill.style.height=(n/s.total*100)+'%';fill.style.setProperty('--music-color',cohortMusicColor(music));fill.append(node('b',percent(n,s.total)));track.append(fill);const cap=node('figcaption');cap.append(node('strong',music),node('small',n+' de '+s.total));col.append(track,cap);col.setAttribute('aria-label',music+': '+n+' de '+s.total+', '+percent(n,s.total));bars.append(col);});scroll.append(bars);card.append(scroll);
   card.append(node('small','Escala común: 0–100% · base: '+personas(s.total)+' de esta edad y color.','cohort-base'));
   if(s.total<5)card.append(node('small','Pocos registros: cada persona pesa '+percent(1,s.total)+'.','cohort-small'));
   grid.append(card);
  });section.append(grid);root.append(section);
 });
 root.append(node('p','Los grupos sin registros no se dibujan. Los porcentajes de cada tarjeta suman 100% antes del redondeo.','cohort-footnote'));
};
const research=node('details',undefined,'music-research');research.id='music-research';
research.append(node('summary','✧ Lo que investiga la ciencia: color, música y edad'));
const studies=[
 ['Color, emoción y sonido','En un experimento con música clásica, participantes de Estados Unidos y México asociaron piezas rápidas en modo mayor con colores más claros, saturados y amarillos. Las emociones compartidas ayudaron a explicar esas asociaciones. Elegir un color que acompaña una canción es distinto de declarar un color favorito: este estudio no permite concluir «si te gusta el rojo, te gusta el pop».','Palmer y colaboradores · PNAS, 2013','https://pmc.ncbi.nlm.nih.gov/articles/PMC3670360/'],
 ['Las preferencias también cambian con la edad','Dos estudios transversales con más de 250.000 personas encontraron diferencias entre adolescencia y mediana edad. En promedio, las dimensiones musicales «intensa» y «contemporánea» disminuían con la edad, y otras aumentaban. Son tendencias de grupos, vinculadas también a la personalidad; no reglas para cada persona ni evidencia sobre niños pequeños.','Bonneville-Roussy y colaboradores · JPSP, 2013','https://pubmed.ncbi.nlm.nih.gov/23895269/']
];
const researchGrid=node('div',undefined,'research-grid');studies.forEach(([title,text,label,url])=>{const article=node('article');article.append(node('h5',title),node('p',text));const a=node('a',label+' ↗');a.href=url;a.target='_blank';a.rel='noopener noreferrer';article.append(a);researchGrid.append(article);});research.append(researchGrid,node('p','En este laboratorio cruzamos tres respuestas: edad, color favorito y música favorita. Las fuentes aportan contexto; no se usan para inventar resultados de la muestra. El botón «Cargar ejemplo ficticio» permite practicar con datos expresamente inventados.','research-context'));
$('.cross-analysis').append(research);
renderCrossAnalysis();
new MutationObserver(()=>{const origin=$('.cohort-origin');if(origin)origin.textContent=$('#sample-origin').textContent;}).observe($('#sample-origin'),{childList:true,characterData:true,subtree:true});
