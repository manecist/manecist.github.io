'use strict';
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
 const scope=node('div',undefined,'cohort-scope');scope.append(node('span','✧ '+selected.length+' personas en la selección'),node('span',ageLabel),node('span',color==='all'?'Todos los colores':color));root.append(scope);
 // Una lectura completa conserva siempre edad + color + denominador.
 const focus=colorGroups[0],focusBands=ageBands.map(b=>({band:b,list:cohortFor(focus.list,b)})).filter(g=>g.list.length);
 const lead=node('article',undefined,'cohort-reading');lead.append(node('span','✦ LECTURA DE LA MUESTRA','reading-label'));
 lead.append(node('h5',focus.name+(focusBands.length>1?' a través de las edades':' · '+focusBands[0].band.label)));
 focusBands.slice(0,2).forEach(g=>lead.append(node('p',cohortSentence(focus.name,g.band,g.list))));
 lead.append(node('small',focusBands.length>1?'La comparación describe a estas personas. No demuestra que la edad o el color causen una preferencia musical.':'Para comparar edades de este color, agrega personas de otro rango o selecciona «Todas las edades».'));
 root.append(lead);
 colorGroups.forEach(({name,list})=>{
  const section=node('section',undefined,'color-cohorts');section.style.setProperty('--cohort-color',colorHex[name]||'#c8a7ea');
  const head=node('div',undefined,'color-cohort-heading'),dot=node('i');dot.setAttribute('aria-hidden','true');head.append(dot,node('h5',name),node('span',list.length+' personas'));section.append(head);
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
   card.append(node('small','Escala común: 0–100% · base: '+s.total+' personas de esta edad y color.','cohort-base'));
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
