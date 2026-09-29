'use strict';
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
 else{card(ageLabel,`${ageRows.length} de ${rows.length} personas · ${percent(ageRows.length,rows.length)} de la muestra total.`);
 if(ageRows.length){const topColor=colors[0][1],winners=colors.filter(x=>x[1]===topColor);card(winners.length>1?'Colores con igual frecuencia':'Color más frecuente',winners.map(([k,n])=>`${k}: ${n}/${ageRows.length} (${percent(n,ageRows.length)})`).join(' · ')+'.');}
 else card('Grupo sin registros','Todavía no hay personas en este rango de edad. Prueba otro grupo.');
 if(color!=='all')card('Personas que prefieren '+color,`${selected.length} de ${ageRows.length} dentro de esta edad · ${percent(selected.length,ageRows.length)}. La música se calcula solo entre esas ${selected.length} personas.`);
 const music=freq(selected,'music');if(music.length){const topMusic=music[0][1];card(color==='all'?'Música en este grupo':'Música entre quienes prefieren '+color,music.filter(x=>x[1]===topMusic).map(([k,n])=>`${k}: ${n} de ${selected.length} (${percent(n,selected.length)})`).join(' · ')+'.');}}
 const bars=$('#analysis-bars');bars.replaceChildren();if(!selected.length)bars.append(node('p','Sin datos para esta selección.','empty-chart'));
 freq(selected,'music').forEach(([key,count],i)=>{const item=node('div',undefined,'chart-row'),label=node('div',undefined,'bar-label');label.append(node('span',key),node('strong',`${count}/${selected.length} · ${percent(count,selected.length)}`));const track=node('div',undefined,'bar-track'),fill=node('div',undefined,'bar-fill');fill.style.width=count/selected.length*100+'%';fill.style.setProperty('--bar',chartPalette[i%chartPalette.length]);track.setAttribute('aria-hidden','true');track.append(fill);item.append(label,track);bars.append(item);});
 const table=$('#cross-table');table.replaceChildren();
 if(selected.length){const music=freq(selected,'music').map(x=>x[0]);const cap=node('caption',`Relación color y música · ${ageLabel.toLowerCase()} · ${selected.length} personas`);table.append(cap);const head=node('thead'),hr=node('tr');['Color / música',...music,'Personas'].forEach(text=>{const th=node('th',text);th.scope='col';hr.append(th);});head.append(hr);table.append(head);const body=node('tbody');freq(selected,'color').forEach(([c,total])=>{const tr=node('tr'),th=node('th',c);th.scope='row';tr.append(th);music.forEach(m=>{const n=selected.filter(r=>r.color===c&&r.music===m).length,td=node('td',`${n} · ${percent(n,total)}`);td.style.background=n?'rgba(186,147,240,'+(0.08+0.3*n/total)+')':'transparent';tr.append(td);});tr.append(node('td',String(total)));body.append(tr);});table.append(body);}
 else table.append(node('caption','No hay combinaciones para mostrar.'));
 $('#analysis-caution').textContent=selected.length?`${selected.length<10?'Grupo pequeño: cada persona puede cambiar mucho los porcentajes. ':''}Base del análisis musical: ${selected.length} personas. Estos resultados describen solo los registros visibles; no representan a toda la población.`:'Las estadísticas aparecerán al agregar registros a este grupo.';window.renderRelationshipReport?.(ageRows,selected,color,ageLabel);
};
['#analysis-age','#analysis-color'].forEach(s=>$(s).addEventListener('change',renderCrossAnalysis));
$('#data-form').addEventListener('submit',()=>{if($('#data-message').textContent.startsWith('Registro guardado'))$('#sample-origin').textContent='Muestra local: registros ingresados y cualquier ejemplo ficticio que hayas conservado.';});
$('#data-clear').addEventListener('click',()=>{$('#sample-origin').textContent='Muestra vacía · lista para tus propios registros.';});
$('#data-example').addEventListener('click',()=>{
 const demo=[[6,'Rojo','Pop'],[7,'Rojo','Pop'],[9,'Rojo','Pop'],[10,'Rojo','Pop'],[12,'Rojo','Romántica'],[31,'Rojo','Rock'],[34,'Rojo','Rock'],[38,'Rojo','Rock'],[40,'Rojo','Metal'],[44,'Rojo','Pop'],[18,'Negro','Metal'],[22,'Negro','Metal'],[25,'Negro','Metal sinfónico'],[29,'Negro','Rock'],[13,'Rosado','K-pop'],[15,'Rosado','K-pop'],[17,'Rosado','Pop'],[46,'Morado','Romántica'],[52,'Morado','Romántica'],[58,'Morado','Clásica']];
 rows=demo.map(([age,color,music],i)=>({name:'Ejemplo '+String(i+1).padStart(2,'0'),age,color,music}));$('#analysis-age').value='all';$('#analysis-color').value='all';renderData();$('#sample-origin').textContent='20 registros completamente ficticios para aprender a interpretar relaciones. Reemplazaron la muestra anterior.';$('#data-message').textContent='Ejemplo ficticio cargado. Selecciona Rojo y compara sus grupos de edad. Los valores del ejemplo son inventados, no resultados de estudios.';
});
renderCrossAnalysis();
