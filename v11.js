'use strict';
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
