/* ==========================================================================
   tableros-vivos.js · los cinco tableros de salud, interactivos en la web
   (sin Power BI ni Tableau): filtros, botones, gráficos con detalle al pasar
   el mouse y simuladores. Los datos vienen de datos-tableros.js, que se carga
   recién cuando se abre la sección (pesa más que el resto).
   window.TABLEROS_VIVOS = { listo(): Promise, temas: { id: [páginas] } }
   cada página: { e, t, texto, pintar(raiz) }
   © 2026 María Inés Cisterna Escobar · Studios Conari SpA. Todos los derechos reservados.
   ========================================================================== */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, cls, txt) => { const n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; };
  const sv = (tag, at = {}, txt) => { const n = document.createElementNS(NS, tag); for (const k in at) n.setAttribute(k, at[k]); if (txt != null) n.textContent = txt; return n; };
  const num = (v, d = 0) => v == null || v === '' ? '—' : Number(v).toLocaleString('es-CL', { minimumFractionDigits: d, maximumFractionDigits: d });
  const num1 = v => v == null ? '—' : Number(v).toLocaleString('es-CL', { maximumFractionDigits: 1 });
  const pct = (v, d = 0) => v == null ? '—' : num(v * 100, d) + '%';
  const COL = { rosa: '#e0679f', lila: '#9b7fd4', oro: '#c9963a', menta: '#4fae98', durazno: '#ee9a5e', azul: '#6c8fd6', gris: '#b9adc4', tinta: '#4a2556' };
  const SERIE = [COL.rosa, COL.lila, COL.menta, COL.durazno, COL.azul, COL.oro];
  const OMS = { 1: '#8fd3b0', 2: '#d5e89a', 3: '#f6c27a', 4: '#ef7f8f' };

  // ---------------------------------------------------------------- datos (carga diferida)
  let promesa = null;
  function listo() {
    if (window.DATOS_TABLEROS) return Promise.resolve();
    if (!promesa) promesa = new Promise((ok, mal) => { const s = document.createElement('script'); s.src = 'datos-tableros.js?v=20261028a'; s.onload = ok; s.onerror = mal; document.head.append(s); });
    return promesa;
  }
  const tabla = (tema, hoja) => { const t = window.DATOS_TABLEROS[tema][hoja]; return t.f.map(r => Object.fromEntries(t.c.map((c, i) => [c, r[i]]))); };
  const unicos = (filas, c) => [...new Set(filas.map(f => f[c]).filter(v => v != null))];

  // ---------------------------------------------------------------- detalle al pasar el mouse
  let globo = null;
  function tip(n, html) {
    n.addEventListener('pointerenter', e => mostrar(e, html)); n.addEventListener('pointermove', mover); n.addEventListener('pointerleave', ocultar);
    n.addEventListener('click', e => mostrar(e, html));
  }
  function mostrar(e, html) {
    if (!globo) { globo = el('div', 'tv-globo'); document.body.append(globo); }
    const dlg = e.target.closest('dialog'); if (dlg && globo.parentNode !== dlg) dlg.append(globo); else if (!dlg && globo.parentNode !== document.body) document.body.append(globo);
    globo.innerHTML = typeof html === 'function' ? html() : html; globo.hidden = false; mover(e);
  }
  function mover(e) { if (!globo || globo.hidden) return; const w = globo.offsetWidth, h = globo.offsetHeight; let x = e.clientX + 14, y = e.clientY - h - 10; if (x + w > innerWidth - 8) x = e.clientX - w - 14; if (y < 8) y = e.clientY + 16; globo.style.left = x + 'px'; globo.style.top = y + 'px'; }
  function ocultar() { if (globo) globo.hidden = true; }
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ---------------------------------------------------------------- piezas de página
  function kpis(lista) { const f = el('div', 'tv-kpis'); lista.forEach(([v, t, c]) => { const k = el('div', 'tv-kpi'); if (c) k.style.setProperty('--c', c); k.append(el('b', null, v), el('span', null, t)); f.append(k); }); return f; }
  function chips(opciones, actual, alCambiar, cls = '') {
    const f = el('div', 'tv-chips ' + cls);
    opciones.forEach(o => { const [v, t] = Array.isArray(o) ? o : [o, o]; const b = el('button', v === actual ? 'activo' : '', t); b.type = 'button'; b.addEventListener('click', () => { [...f.children].forEach(x => x.classList.toggle('activo', x === b)); alCambiar(v); }); f.append(b); });
    return f;
  }
  function selector(opciones, actual, alCambiar, etiqueta) {
    const l = el('label', 'tv-select'); if (etiqueta) l.append(el('span', null, etiqueta));
    const s = el('select');
    opciones.forEach(o => { if (o.grupo) { const g = el('optgroup'); g.label = o.grupo; o.items.forEach(i => { const op = el('option', null, i); op.value = i; g.append(op); }); s.append(g); } else { const op = el('option', null, o); op.value = o; s.append(op); } });
    s.value = actual; s.addEventListener('change', () => alCambiar(s.value)); l.append(s); return l;
  }
  function deslizador(etiqueta, min, max, paso, valor, fmt, alCambiar) {
    const l = el('label', 'tv-desliza'); const t = el('span'); const b = el('b', null, fmt(valor));
    t.append(document.createTextNode(etiqueta + ' '), b);
    const r = el('input'); r.type = 'range'; r.min = min; r.max = max; r.step = paso; r.value = valor;
    r.addEventListener('input', () => { b.textContent = fmt(+r.value); alCambiar(+r.value); });
    l.append(t, r); return l;
  }
  const lienzo = () => el('div', 'tv-lienzo');
  const nota = t => el('p', 'tv-nota', t);
  function leyenda(items) { const f = el('div', 'tv-leyenda'); items.forEach(([t, c]) => { const s = el('span'); s.style.setProperty('--c', c); s.textContent = t; f.append(s); }); return f; }

  // ---------------------------------------------------------------- gráficos (SVG con viewBox: se escalan con el monitor)
  const W = 640, H = 270;
  function svgBase(h = H) { return sv('svg', { viewBox: `0 0 ${W} ${h}`, class: 'tv-svg' + (h > H ? ' tv-alto' : ''), role: 'img', preserveAspectRatio: 'xMidYMid meet' }); }
  const corta = (s, n) => s.length > n ? s.slice(0, n - 1) + '…' : s;

  // barras horizontales: [{t, v, c, tip}]
  function barrasH(datos, { fmt = num1, max, etiqueta = 190, alto } = {}) {
    const n = datos.length, h = alto || Math.max(120, 26 * n + 20), s = svgBase(h);
    const m = max ?? (Math.max(...datos.map(d => d.v || 0)) * 1.12 || 1), x0 = etiqueta, ancho = W - x0 - 60, fila = (h - 14) / n;
    datos.forEach((d, i) => {
      const y = 8 + i * fila, bh = Math.min(18, fila * .7), g = sv('g', { class: 'tv-marca' });
      g.append(sv('text', { x: x0 - 8, y: y + fila / 2 + 4, 'text-anchor': 'end', class: 'tv-eje' }, corta(d.t, 30)));
      g.append(sv('rect', { x: x0, y: y + (fila - bh) / 2, width: Math.max(2, (d.v || 0) / m * ancho), height: bh, rx: 4, fill: d.c || COL.rosa }));
      g.append(sv('text', { x: x0 + Math.max(2, (d.v || 0) / m * ancho) + 6, y: y + fila / 2 + 4, class: 'tv-valor' }, d.v == null ? 's/d' : fmt(d.v)));
      if (d.tip) tip(g, d.tip);
      s.append(g);
    });
    return s;
  }
  // rangos mínimo–máximo: [{t, a, b, c, tip}]
  function rangos(datos, { fmt = num1, etiqueta = 230 } = {}) {
    const n = datos.length, h = Math.max(140, 28 * n + 30), s = svgBase(h), m = Math.max(...datos.map(d => d.b || 0)) * 1.08, x0 = etiqueta, ancho = W - x0 - 70, fila = (h - 30) / n;
    for (let k = 0; k <= 4; k++) { const v = m * k / 4, x = x0 + ancho * k / 4; s.append(sv('line', { x1: x, x2: x, y1: 4, y2: h - 22, class: 'tv-guia' }), sv('text', { x, y: h - 8, 'text-anchor': 'middle', class: 'tv-eje' }, fmt(v))); }
    datos.forEach((d, i) => {
      const y = 6 + i * fila + fila / 2, g = sv('g', { class: 'tv-marca' });
      g.append(sv('text', { x: x0 - 8, y: y + 4, 'text-anchor': 'end', class: 'tv-eje' }, corta(d.t, 36)));
      if (d.a == null) g.append(sv('text', { x: x0 + 4, y: y + 4, class: 'tv-valor tv-tenue' }, 'sin datos suficientes'));
      else { const xa = x0 + d.a / m * ancho, xb = x0 + d.b / m * ancho; g.append(sv('rect', { x: xa - 5, y: y - 7, width: Math.max(10, xb - xa + 10), height: 14, rx: 7, fill: d.c })); g.append(sv('text', { x: xb + 10, y: y + 4, class: 'tv-valor' }, d.a === d.b ? fmt(d.a) : fmt(d.a) + '–' + fmt(d.b))); }
      if (d.tip) tip(g, d.tip); s.append(g);
    });
    return s;
  }
  // líneas: series [{t, c, p: [[x, y, tip?]], punteada}]
  function lineas(series, { fmt = num1, fmtX = String, min0 = true } = {}) {
    const s = svgBase(), xs = series.flatMap(r => r.p.map(p => p[0])), ys = series.flatMap(r => r.p.map(p => p[1]));
    const x1 = Math.min(...xs), x2 = Math.max(...xs), y2 = Math.max(...ys) * 1.12, y1 = min0 ? 0 : Math.min(...ys) * .9;
    const L = 58, R = 24, T = 14, B = 30, X = v => L + (x2 === x1 ? .5 : (v - x1) / (x2 - x1)) * (W - L - R), Y = v => H - B - (v - y1) / (y2 - y1) * (H - T - B);
    for (let k = 0; k <= 4; k++) { const v = y1 + (y2 - y1) * k / 4; s.append(sv('line', { x1: L, x2: W - R, y1: Y(v), y2: Y(v), class: 'tv-guia' }), sv('text', { x: L - 6, y: Y(v) + 4, 'text-anchor': 'end', class: 'tv-eje' }, fmt(v))); }
    [...new Set(xs)].sort((a, b) => a - b).forEach(v => s.append(sv('text', { x: X(v), y: H - 10, 'text-anchor': 'middle', class: 'tv-eje' }, fmtX(v))));
    series.forEach(r => {
      const p = [...r.p].sort((a, b) => a[0] - b[0]);
      s.append(sv('path', { d: p.map((q, i) => (i ? 'L' : 'M') + X(q[0]) + ' ' + Y(q[1])).join(' '), fill: 'none', stroke: r.c, 'stroke-width': 3, 'stroke-linejoin': 'round', 'stroke-dasharray': r.punteada ? '6 5' : 'none' }));
      p.forEach(q => { const g = sv('g', { class: 'tv-marca' }); g.append(sv('circle', { cx: X(q[0]), cy: Y(q[1]), r: 5, fill: '#fff', stroke: r.c, 'stroke-width': 3 })); tip(g, q[2] || `<b>${esc(r.t)}</b><br>${fmtX(q[0])}: ${fmt(q[1])}`); s.append(g); });
    });
    return s;
  }
  // columnas agrupadas: grupos [{t, v: [..]}], series [{t, c}]
  function columnas(grupos, series, { fmt = num1, max } = {}) {
    const s = svgBase(), L = 46, R = 12, T = 22, B = 36, m = max ?? Math.max(...grupos.flatMap(g => g.v.filter(v => v != null))) * 1.15, gw = (W - L - R) / grupos.length, bw = Math.min(46, gw * .8 / series.length);
    const Y = v => H - B - v / m * (H - T - B);
    for (let k = 0; k <= 4; k++) { const v = m * k / 4; s.append(sv('line', { x1: L, x2: W - R, y1: Y(v), y2: Y(v), class: 'tv-guia' }), sv('text', { x: L - 6, y: Y(v) + 4, 'text-anchor': 'end', class: 'tv-eje' }, fmt(v))); }
    grupos.forEach((g, i) => {
      const cx = L + gw * i + gw / 2; s.append(sv('text', { x: cx, y: H - 14, 'text-anchor': 'middle', class: 'tv-eje' }, corta(g.t, Math.max(8, Math.floor(gw / 7)))));
      g.v.forEach((v, j) => {
        if (v == null) return; const x = cx - bw * series.length / 2 + bw * j, q = sv('g', { class: 'tv-marca' });
        q.append(sv('rect', { x: x + 2, y: Y(v), width: bw - 4, height: H - B - Y(v), rx: 4, fill: series[j].c }));
        q.append(sv('text', { x: x + bw / 2, y: Y(v) - 5, 'text-anchor': 'middle', class: 'tv-valor tv-chico' }, fmt(v)));
        tip(q, `<b>${esc(g.t)}</b><br>${esc(series[j].t)}: ${fmt(v)}`); s.append(q);
      });
    });
    return s;
  }
  // ficha de texto: [[campo, valor]]
  function ficha(titulo, campos) { const f = el('div', 'tv-ficha'); if (titulo) f.append(el('h5', null, titulo)); const dl = el('dl'); campos.forEach(([a, b]) => { if (b != null && b !== '' && b !== '—') dl.append(el('dt', null, a), el('dd', null, String(b))); }); f.append(dl); return f; }

  // página estándar: cabecera de KPI, controles y un lienzo que se repinta al cambiar un filtro
  function pagina(raiz, { kpi, controles = [], pintar, pie }) {
    if (kpi) raiz.append(kpis(kpi));
    const c = el('div', 'tv-controles'); controles.forEach(x => x && c.append(x)); if (controles.length) raiz.append(c);
    const l = lienzo(); raiz.append(l);
    if (pie) raiz.append(nota(pie));
    const repintar = () => { ocultar(); l.replaceChildren(); pintar(l); };
    repintar(); return repintar;
  }

  /* ======================================================================
     Anticonceptivos
     ====================================================================== */
  const anticonceptivos = [
    { e: '🎯', t: 'Eficacia de cada método', texto: 'Embarazos por cada 100 mujeres en el primer año. Cambia entre uso típico (la vida real, con olvidos) y uso perfecto, y filtra por tipo de método.', pintar(r) {
      const M = tabla('anticonceptivos', 'Metodos').filter(m => m.Grupo !== 'Referencia'); let uso = 'UsoTipico_pct', grupo = 'Todos';
      const colorG = { 'Larga duración (LARC)': COL.menta, 'Hormonal de corta duración': COL.rosa, 'Barrera': COL.azul, 'Basado en comportamiento': COL.durazno, 'Permanente': COL.lila };
      const rep = pagina(r, {
        kpi: [['85 de 100', 'se embarazan en un año sin método', COL.gris], ['0,1', 'implante y DIU hormonal', COL.menta], ['7 vs 0,3', 'píldora: uso típico vs perfecto', COL.rosa]],
        controles: [chips([['UsoTipico_pct', 'Uso típico'], ['UsoPerfecto_pct', 'Uso perfecto']], uso, v => { uso = v; rep(); }), chips(['Todos', ...Object.keys(colorG)].map(g => [g, g.replace(' (LARC)', '')]), grupo, v => { grupo = v; rep(); }, 'tv-chips-chicas')],
        pintar: l => {
          const d = M.filter(m => grupo === 'Todos' || m.Grupo === grupo).sort((a, b) => (a[uso] ?? 99) - (b[uso] ?? 99));
          l.append(barrasH(d.map(m => ({ t: m.Metodo, v: m[uso], c: colorG[m.Grupo], tip: `<b>${esc(m.Metodo)}</b><br>Uso típico: ${num1(m.UsoTipico_pct)} · perfecto: ${num1(m.UsoPerfecto_pct)} de 100<br>Dura: ${esc(m.Duracion || '—')} · Red pública: ${esc(m.DisponibleAPS_Chile)}${m.NotaEficacia ? '<br><i>' + esc(m.NotaEficacia) + '</i>' : ''}` })), { fmt: v => num1(v), etiqueta: 230 }));
          l.append(leyenda(Object.entries(colorG).map(([t, c]) => [t.replace(' (LARC)', ''), c])));
        } });
    } },
    { e: '🩸', t: 'Riesgo de trombosis', texto: 'Casos de trombosis venosa por cada 10.000 mujeres al año según el método, comparados con no usar nada, el embarazo y el posparto.', pintar(r) {
      const R = tabla('anticonceptivos', 'RiesgoTrombosis'); let ver = 'todo';
      const rep = pagina(r, {
        kpi: [['2', 'sin método (por 10.000 al año)', COL.gris], ['5–7', 'píldora con levonorgestrel', COL.menta], ['40–65', 'posparto: el riesgo más alto', COL.rosa]],
        controles: [chips([['todo', 'Todo'], ['metodos', 'Solo anticonceptivos'], ['ref', 'Referencias']], ver, v => { ver = v; rep(); })],
        pintar: l => l.append(rangos(R.filter(f => ver === 'todo' || (ver === 'ref') === (f.Tipo === 'Referencia')).map(f => ({ t: f.Categoria, a: f.Riesgo_min_10000, b: f.Riesgo_max_10000, c: f.Tipo === 'Referencia' ? COL.lila : COL.rosa, tip: `<b>${esc(f.Categoria)}</b><br>${f.Riesgo_min_10000 == null ? 'Datos insuficientes' : num1(f.Riesgo_min_10000) + ' a ' + num1(f.Riesgo_max_10000) + ' por 10.000 al año'}${f.Nota ? '<br><i>' + esc(f.Nota) + '</i>' : ''}` })))),
        pie: 'El embarazo y el posparto tienen más riesgo de trombosis que cualquier anticonceptivo.' });
    } },
    { e: '🩺', t: '¿Puedo usarlo? (OMS/CDC)', texto: 'Elige una condición de salud y mira la categoría de cada método: 1 se puede usar, 2 los beneficios superan los riesgos, 3 no se recomienda, 4 no se debe usar.', pintar(r) {
      const E = tabla('anticonceptivos', 'Elegibilidad'), grupos = unicos(E, 'GrupoCondicion');
      const opciones = grupos.map(g => ({ grupo: g, items: unicos(E.filter(f => f.GrupoCondicion === g), 'Condicion') }));
      let cond = 'Migraña con aura'; if (!E.some(f => f.Condicion === cond)) cond = opciones[0].items[0];
      const rep = pagina(r, {
        controles: [selector(opciones, cond, v => { cond = v; rep(); }, 'Condición')],
        pintar: l => {
          const filas = E.filter(f => f.Condicion === cond), g = el('div', 'tv-oms');
          filas.forEach(f => { const cat = f.CategoriaMax, c = el('div', 'tv-oms-celda'); c.style.setProperty('--c', OMS[cat] || '#eee'); c.append(el('b', null, f.CategoriaTexto), el('span', null, f.Metodo)); tip(c, `<b>${esc(f.Metodo)}</b> · categoría ${esc(f.CategoriaTexto)}${f.Nota ? '<br>' + esc(f.Nota) : ''}`); g.append(c); });
          l.append(g, leyenda([['1 · sin restricción', OMS[1]], ['2 · beneficios > riesgos', OMS[2]], ['3 · no recomendado', OMS[3]], ['4 · no usar', OMS[4]]]));
        }, pie: '73 condiciones de los criterios OMS 2015 y CDC 2024. «3/4» indica que depende del caso.' });
    } },
    { e: '✨', t: 'Beneficios además de evitar el embarazo', texto: 'Elige qué te importa (acné, dolor menstrual, sangrado…) y mira qué métodos ayudan y cuáles lo empeoran.', pintar(r) {
      const B = tabla('anticonceptivos', 'Beneficios'), A = tabla('anticonceptivos', 'Aspectos').sort((a, b) => a.Orden - b.Orden).map(a => a.Aspecto); let asp = A[0];
      const colorP = p => p >= 2 ? COL.menta : p >= 1 ? '#8fcdb9' : p > 0 ? '#c6e3d6' : p === 0 ? COL.gris : COL.rosa;
      const rep = pagina(r, {
        controles: [selector(A, asp, v => { asp = v; rep(); }, 'Me importa')],
        pintar: l => {
          const d = B.filter(b => b.Aspecto === asp).sort((a, b) => b.Puntaje - a.Puntaje), g = el('div', 'tv-lista');
          d.forEach(b => { const f = el('div', 'tv-fila'); f.style.setProperty('--c', colorP(b.Puntaje)); f.append(el('b', null, b.Metodo), el('span', null, b.Categoria)); tip(f, `<b>${esc(b.Metodo)}</b> · ${esc(b.Categoria)}<br>${esc(b.Nota || '')}`); g.append(f); });
          l.append(g, leyenda([['Beneficio claro', COL.menta], ['Moderado', '#8fcdb9'], ['Sin efecto', COL.gris], ['Empeora', COL.rosa]]));
          const guia = tabla('anticonceptivos', 'GuiaNecesidad').find(x => x.Aspecto === asp);
          if (guia) l.append(ficha('Qué conviene', [['Primera opción', guia.PrimeraOpcion], ['Alternativas', guia.Alternativas], ['Evitar o con precaución', guia.EvitarOPrecaucion], ['Nota', guia.Nota]]));
        } });
    } },
    { e: '💊', t: 'Mi pastilla: ficha por marca', texto: 'Busca tu marca y mira su principio activo, eficacia, efecto en el peso, trombosis, cuándo no usarla y sus equivalentes.', pintar(r) {
      const F = tabla('anticonceptivos', 'FichaProducto').sort((a, b) => String(a.Marca).localeCompare(b.Marca, 'es')); let marca = F.find(f => /Yasmin/i.test(f.Marca))?.Marca || F[0].Marca;
      const tipos = unicos(F, 'TipoProducto').map(t => ({ grupo: t, items: F.filter(f => f.TipoProducto === t).map(f => f.Marca) }));
      const rep = pagina(r, {
        kpi: [[String(F.length), 'marcas registradas en Chile', COL.rosa], [String(unicos(F, 'PrincipioActivo').length), 'principios activos', COL.lila]],
        controles: [selector(tipos, marca, v => { marca = v; rep(); }, 'Marca')],
        pintar: l => { const f = F.find(x => x.Marca === marca); l.append(ficha(f.Marca, [['Principio activo', f.PrincipioActivo], ['Tipo', f.TipoProducto], ['Eficacia', f.Eficacia], ['Para qué sirve', f.ParaQueSirve], ['Peso', f.Peso], ['Trombosis', f.Trombosis], ['Presión, tabaco y migraña', f.PresionTabacoMigrana], ['Cáncer', f.Cancer], ['No usar si', f.NoUsarSi], ['Equivalentes', f.Equivalentes], ['Red pública', f.RedPublica], ['Nota', f.Nota]])); } });
    } },
    { e: '⚠️', t: '¿Algo le baja la eficacia?', texto: 'Elige una situación (un medicamento, vómitos, bajar de peso…) y mira con qué métodos sigue funcionando y con cuáles no.', pintar(r) {
      const I = tabla('anticonceptivos', 'Interacciones'), sit = unicos(I, 'Grupo').map(g => ({ grupo: g, items: unicos(I.filter(f => f.Grupo === g), 'Situacion') })); let s = sit[0].items[0];
      const rep = pagina(r, {
        controles: [selector(sit, s, v => { s = v; rep(); }, 'Situación')],
        pintar: l => {
          const d = I.filter(f => f.Situacion === s).sort((a, b) => a.OrdenMetodo - b.OrdenMetodo), g = el('div', 'tv-oms');
          d.forEach(f => { const c = el('div', 'tv-oms-celda'); c.style.setProperty('--c', f.Afecta ? OMS[4] : OMS[1]); c.append(el('b', null, f.Afecta ? '✕' : '✓'), el('span', null, f.Metodo)); tip(c, `<b>${esc(f.Metodo)}</b> · ${esc(f.Efecto)}<br>${esc(f.QueHacer || '')}`); g.append(c); });
          l.append(g); if (d[0]?.Detalle) l.append(nota('Incluye: ' + d[0].Detalle));
          const q = d.find(f => f.Afecta) || d[0]; if (q?.QueHacer) l.append(ficha('Qué hacer', [['', q.QueHacer]]));
        } });
    } },
    { e: '🇨🇱', t: 'Chile: cómo parten las adolescentes', texto: 'Con qué método inician las adolescentes en Chile: la mayoría parte con condón o píldora y muy pocas con implante o DIU, que son los que menos fallan.', pintar(r) {
      const C = tabla('anticonceptivos', 'ChileInicioAdolescentes').sort((a, b) => a.Orden - b.Orden), I = tabla('anticonceptivos', 'ChileIndicadores').sort((a, b) => a.Orden - b.Orden);
      pagina(r, { kpi: I.slice(0, 3).map((f, i) => [f.Valor, f.Indicador, SERIE[i]]),
        pintar: l => l.append(barrasH(C.map((f, i) => ({ t: f.Metodo, v: f.Porcentaje, c: /Implante|DIU/.test(f.Metodo) ? COL.menta : COL.rosa, tip: `<b>${esc(f.Metodo)}</b>: ${num1(f.Porcentaje)}% de las adolescentes que inician (${f.Anio})` })), { fmt: v => num1(v) + '%', etiqueta: 120 })),
        pie: 'En verde, los métodos de larga duración: solo 8,8% inicia con ellos.' });
    } }
  ];

  /* ======================================================================
     ITS
     ====================================================================== */
  const its = [
    { e: '📈', t: 'Cómo han cambiado', texto: 'Casos notificados por año. Elige la infección y si ver casos o tasa por 100 mil habitantes.', pintar(r) {
      const T = tabla('its', 'Tendencias'), lista = unicos(T, 'ITS'); let i = lista[0], m = 'Casos';
      const rep = pagina(r, {
        kpi: [['11.155', 'casos de sífilis en 2025', COL.rosa], ['×2,5', 'gonorrea desde 2021', COL.lila], ['4.313', 'diagnósticos de VIH en 2025', COL.azul]],
        controles: [chips(lista, i, v => { i = v; rep(); }), chips([['Casos', 'Casos'], ['TasaPor100mil', 'Tasa por 100 mil']], m, v => { m = v; rep(); })],
        pintar: l => { const p = T.filter(f => f.ITS === i && f[m] != null).map(f => [f.Anio, f[m]]); if (p.length < 2) { l.append(nota('No hay serie de ' + (m === 'Casos' ? 'casos' : 'tasas') + ' para esta infección: prueba la otra medida.')); return; } l.append(lineas([{ t: i, c: SERIE[lista.indexOf(i) % SERIE.length], p }], { fmt: v => num(v), min0: true })); } });
    } },
    { e: '👥', t: 'Por edad y por sexo', texto: 'Tasa por 100 mil según grupo de edad, y la comparación entre hombres y mujeres.', pintar(r) {
      const E = tabla('its', 'EdadTasa'), S = tabla('its', 'SexoLargo'), lista = unicos(E, 'ITS'); let i = lista[0], ver = 'edad';
      const rep = pagina(r, {
        controles: [chips([["edad", "Por edad"], ["sexo", "Hombres y mujeres"]], ver, v => { ver = v; rep(); })],
        pintar: l => {
          if (ver === 'edad') {
            const c = chips(lista, i, v => { i = v; rep(); }); l.append(c);
            const d = E.filter(f => f.ITS === i).sort((a, b) => a.OrdenEdad - b.OrdenEdad);
            l.append(barrasH(d.map(f => ({ t: f.GrupoEdad + ' (' + f.AnioDato + ')', v: f.TasaPor100mil, c: COL.lila, tip: `<b>${esc(f.ITS)} · ${esc(f.GrupoEdad)}</b><br>${num1(f.TasaPor100mil)} por 100 mil (${f.AnioDato})${f.Nota ? '<br><i>' + esc(f.Nota) + '</i>' : ''}` })), { etiqueta: 170 }));
          } else {
            const comp = unicos(S, 'Comparacion');
            l.append(columnas(comp.map(c => ({ t: c, v: ['Hombres', 'Mujeres'].map(x => S.find(f => f.Comparacion === c && f.Sexo === x)?.Tasa) })), [{ t: 'Hombres', c: COL.azul }, { t: 'Mujeres', c: COL.rosa }]), leyenda([['Hombres', COL.azul], ['Mujeres', COL.rosa]]));
          }
        } });
    } },
    { e: '🌎', t: 'Chile frente al mundo', texto: 'Tasa por 100 mil habitantes en Chile, Estados Unidos y la Unión Europea.', pintar(r) {
      const M = tabla('its', 'ChileMundoITS'), lugares = unicos(M, 'Lugar'), lista = unicos(M, 'ITS');
      pagina(r, { kpi: [['55,2', 'sífilis por 100 mil en Chile', COL.rosa], ['10,8', 'en la Unión Europea', COL.lila]],
        pintar: l => l.append(columnas(lista.map(i => ({ t: i, v: lugares.map(g => M.find(f => f.ITS === i && f.Lugar === g)?.Tasa) })), lugares.map((g, k) => ({ t: g, c: [COL.rosa, COL.azul, COL.lila][k] }))), leyenda(lugares.map((g, k) => [g, [COL.rosa, COL.azul, COL.lila][k]]))),
        pie: 'La sífilis en Chile es 5 veces la de Europa; la gonorrea, en cambio, es menor (o se diagnostica menos).' });
    } },
    { e: '🎗️', t: 'Cascada del VIH (95-95-95)', texto: 'De todas las personas que viven con VIH: cuántas lo saben, cuántas están en tratamiento y cuántas tienen el virus suprimido.', pintar(r) {
      const C = tabla('its', 'CascadaLargo'), et = unicos(C, 'Etapa'), lug = unicos(C, 'Lugar');
      pagina(r, { kpi: [['91.000', 'personas viven con VIH en Chile', COL.rosa], ['21.915', 'diagnosticadas sin tratamiento', COL.durazno]],
        pintar: l => l.append(columnas(et.map(e => ({ t: e.replace(/^\d\. /, ''), v: lug.map(g => C.find(f => f.Etapa === e && f.Lugar === g)?.Porcentaje) })), lug.map((g, k) => ({ t: g, c: [COL.rosa, COL.lila, COL.azul][k] })), { fmt: v => num(v) + '%', max: 100 }), leyenda(lug.map((g, k) => [g, [COL.rosa, COL.lila, COL.azul][k]]))),
        pie: 'La meta es 95-95-95. Chile diagnostica bien (95) pero se pierde en el paso al tratamiento (71).' });
    } },
    { e: '🩺', t: 'Guía clínica', texto: 'Elige una infección: síntomas, signos de alarma, tratamiento, qué pasa en el embarazo y qué hace la matrona.', pintar(r) {
      const G = tabla('its', 'GuiaClinica'); let i = G[0].ITS;
      const rep = pagina(r, { controles: [selector(G.map(g => g.ITS), i, v => { i = v; rep(); }, 'Infección')],
        pintar: l => { const g = G.find(x => x.ITS === i); l.append(ficha(g.ITS, [['Agente', g.Agente], ['Síntomas en la mujer', g.SintomasMujer], ['Síntomas en el hombre', g.SintomasHombre], ['Signos de alarma', g.SignosAlarma], ['Cómo no confundirla', g.ComoNoConfundir], ['Tratamiento', g.Tratamiento], ['¿Se cura?', g.SeCura], ['En el embarazo', g.EnElEmbarazo], ['Riesgos para la guagua', g.RiesgosGuagua], ['Prevención', g.Prevencion], ['Quién atiende', g.QuienAtiende]])); } });
    } },
    { e: '🏫', t: 'Simulador: matronas en colegios', texto: 'Mueve los supuestos: cuántos colegios tienen matrona con educación sexual integral y cuánto sube el uso de condón. Se calcula cuántos casos de ITS se evitarían en un año.', pintar: r => simColegios(r, 'its') }
  ];

  // simulador compartido (Embarazo e ITS usan los mismos supuestos)
  function simColegios(r, tema) {
    const B = Object.fromEntries(tabla(tema, 'SimIndicadores').map(f => [f.Indicador, f.Base]));
    let col = 50, acceso = 1, efecto = 5, condon = 10;
    const salida = el('div', 'tv-sim');
    const calc = () => {
      const nac = B['Nacimientos 15–19'] * col / 100 * (acceso ? efecto / 100 : 0), prot = col / 100 * condon / 100 * .8;
      const fila = (t, base, ev, c) => { const f = el('div', 'tv-sim-fila'); f.style.setProperty('--c', c); const barra = el('i'); barra.style.width = Math.min(100, base ? ev / base * 100 * 5 : 0) + '%'; f.append(el('span', null, t), el('b', null, '−' + num(ev)), barra, el('small', null, 'de ' + num(base) + ' al año')); return f; };
      salida.replaceChildren(fila('Nacimientos de madres de 15 a 19', B['Nacimientos 15–19'], nac, COL.rosa), fila('Casos de gonorrea', B.Gonorrea, B.Gonorrea * prot, COL.lila), fila('Casos de sífilis', B['Sífilis'], B['Sífilis'] * prot, COL.azul));
      if (!acceso) salida.append(nota('Sin entrega de anticonceptivos, la educación sola no mostró efecto claro en los embarazos (Cochrane 2016).'));
    };
    const c = el('div', 'tv-controles tv-sim-controles');
    c.append(deslizador('Colegios con matrona', 0, 100, 10, col, v => v + '%', v => { col = v; calc(); }),
      deslizador('Más uso de condón', 0, 20, 5, condon, v => '+' + v + ' puntos', v => { condon = v; calc(); }),
      chips([[1, 'Anticonceptivos desde los 14: sí'], [0, 'No']], acceso, v => { acceso = v; calc(); }),
      chips([[5, 'Efecto conservador (5%)'], [10, 'Alto (10%)']], efecto, v => { efecto = v; calc(); }));
    r.append(c, salida, nota('Simulación educativa con supuestos explícitos (no es una proyección oficial). Protección del condón: 80%.'));
    calc();
  }

  /* ======================================================================
     Embarazo y matronas
     ====================================================================== */
  const embarazo = [
    { e: '👧', t: 'Embarazo adolescente', texto: 'Nacidos vivos de madres adolescentes por año. Elige el grupo de edad o la tasa de fecundidad de 15 a 19 años.', pintar(r) {
      const A = tabla('embarazo', 'AdolLargo'), F = tabla('embarazo', 'Adolescentes').filter(f => f.TasaFecundidad15a19 != null); let ver = 'Madres de 15 a 19';
      const rep = pagina(r, {
        kpi: [['8,3', 'por 1.000 de 15 a 19 años (2025)', COL.rosa], ['−87%', 'nacidos de madres de 15 a 19 desde 2010', COL.menta], ['146', 'nacidos de niñas de 10 a 14 (2025)', COL.durazno]],
        controles: [chips([['Madres de 15 a 19', '15 a 19 años'], ['Madres de 10 a 14', '10 a 14 años'], ['tasa', 'Tasa por 1.000']], ver, v => { ver = v; rep(); })],
        pintar: l => l.append(ver === 'tasa' ? lineas([{ t: 'Tasa de fecundidad 15–19', c: COL.lila, p: F.map(f => [f.Anio, f.TasaFecundidad15a19, `<b>${f.Anio}</b>: ${num1(f.TasaFecundidad15a19)} por 1.000<br><i>${esc(f.Calidad)}</i>`]) }])
          : lineas([{ t: ver, c: ver.includes('15') ? COL.rosa : COL.durazno, p: A.filter(f => f.Serie === ver).map(f => [f.Anio, f.Nacidos]) }], { fmt: v => num(v) })),
        pie: '2024 y 2025 son cifras provisionales.' });
    } },
    { e: '👩‍⚕️', t: 'Matronas en Chile', texto: 'Matronas inscritas en la Superintendencia de Salud por año, y cuántas hay frente a otras profesiones.', pintar(r) {
      const M = tabla('embarazo', 'MatronasSerie'), P = tabla('embarazo', 'Profesiones'); let ver = 'serie';
      const rep = pagina(r, { kpi: [['23.333', 'matronas/es inscritos (2025)', COL.rosa], ['+61%', 'desde 2019', COL.menta]],
        controles: [chips([['serie', 'Por año'], ['prof', 'Frente a otras profesiones']], ver, v => { ver = v; rep(); })],
        pintar: l => l.append(ver === 'serie' ? lineas([{ t: 'Matronas inscritas', c: COL.rosa, p: M.map(f => [f.Anio, f.MatronasInscritas]) }], { fmt: v => num(v), min0: false })
          : barrasH(P.map((f, i) => ({ t: f.Profesion, v: f.Inscritos2025, c: [COL.azul, COL.lila, COL.rosa][i] })), { fmt: v => num(v), etiqueta: 140 })),
        pie: 'Hay matronas de sobra: el problema es que no se contratan donde hacen falta.' });
    } },
    { e: '🤱', t: 'Mortalidad materna e infantil', texto: 'Muertes maternas por 100 mil nacidos vivos, la comparación con la región, y la mortalidad infantil y neonatal.', pintar(r) {
      const M = tabla('embarazo', 'MortalidadMaterna'), C = tabla('embarazo', 'MaternaComparacion').sort((a, b) => a.Orden - b.Orden), I = tabla('embarazo', 'InfantilLargo'); let ver = 'materna';
      const rep = pagina(r, { kpi: [['10', 'muertes maternas por 100 mil (2023)', COL.menta], ['197', 'en el mundo', COL.rosa], ['5,9', 'mortalidad infantil por 1.000 (2025)', COL.lila]],
        controles: [chips([['materna', 'Materna en Chile'], ['region', 'Chile y la región'], ['infantil', 'Infantil y neonatal']], ver, v => { ver = v; rep(); })],
        pintar: l => l.append(ver === 'materna' ? lineas([{ t: 'Razón de mortalidad materna', c: COL.rosa, p: M.map(f => [f.Anio, f.RazonPor100milNV]) }])
          : ver === 'region' ? barrasH(C.map(f => ({ t: f.Lugar, v: f.RazonPor100milNV2023, c: f.Lugar === 'Chile' ? COL.menta : COL.lila })), { fmt: v => num(v), etiqueta: 130 })
          : lineas(['Infantil', 'Neonatal'].map((t, k) => ({ t, c: [COL.lila, COL.rosa][k], p: I.filter(f => f.Tipo === t).map(f => [f.Anio, f.PorMil]) })))),
        pie: 'El salto de 2020 corresponde a la pandemia.' });
    } },
    { e: '📚', t: 'Lo que dice la evidencia', texto: 'Qué muestran los estudios sobre ampliar la atención de matronas. Pasa el mouse por cada hallazgo para ver el estudio.', pintar(r) {
      const E = tabla('embarazo', 'Evidencia'), g = el('div', 'tv-lista');
      E.forEach((f, i) => { const x = el('div', 'tv-fila'); x.style.setProperty('--c', SERIE[i % SERIE.length]); x.append(el('b', null, f.Magnitud), el('span', null, f.Hallazgo)); tip(x, `<b>${esc(f.Estudio)}</b><br>${esc(f.TipoEvidencia)}`); g.append(x); });
      r.append(g);
    } },
    { e: '🏫', t: 'Simulador: matronas en colegios', texto: 'Mueve los supuestos y mira cuántos embarazos adolescentes y casos de ITS se evitarían en un año.', pintar: r => simColegios(r, 'embarazo') }
  ];

  /* ======================================================================
     Cáncer
     ====================================================================== */
  const cancer = [
    { e: '📊', t: 'Los cánceres ginecológicos', texto: 'Casos nuevos, muertes y sobrevivientes en Chile (GLOBOCAN 2024). Elige la medida.', pintar(r) {
      const G = tabla('cancer', 'Globocan2024'); let m = 'CasosNuevos';
      const nombres = { CasosNuevos: 'Casos nuevos', TasaIncidencia: 'Casos por 100 mil', Muertes: 'Muertes', TasaMortalidad: 'Muertes por 100 mil', MuertesPor10Casos: 'Muertes por cada 10 casos', Prevalencia5anios: 'Viven con el cáncer (5 años)' };
      const rep = pagina(r, { kpi: [['59.887', 'casos nuevos de cáncer al año', COL.rosa], ['1 de 4', 'muertes en Chile es por cáncer', COL.lila]],
        controles: [chips(Object.entries(nombres), m, v => { m = v; rep(); }, 'tv-chips-chicas')],
        pintar: l => l.append(barrasH([...G].sort((a, b) => b[m] - a[m]).map((f, i) => ({ t: f.Cancer, v: f[m], c: SERIE[i], tip: `<b>${esc(f.Cancer)}</b><br>${Object.entries(nombres).map(([k, t]) => t + ': ' + num1(f[k])).join('<br>')}` })), { fmt: v => num1(v), etiqueta: 130 })) });
    } },
    { e: '🌎', t: 'Chile frente al mundo', texto: 'Elige un cáncer y compara Chile con Latinoamérica y el mundo.', pintar(r) {
      const L = tabla('cancer', 'ChileMundoLargo'), lista = unicos(L, 'Cancer'), ind = unicos(L, 'Indicador'), lug = ['Chile', 'Latinoamérica', 'Mundo']; let c = lista[0];
      const rep = pagina(r, { controles: [chips(lista, c, v => { c = v; rep(); }, 'tv-chips-chicas')],
        pintar: l => l.append(columnas(ind.map(i => ({ t: i, v: lug.map(g => L.find(f => f.Cancer === c && f.Indicador === i && f.Lugar === g)?.Valor) })), lug.map((g, k) => ({ t: g, c: [COL.rosa, COL.durazno, COL.lila][k] }))), leyenda(lug.map((g, k) => [g, [COL.rosa, COL.durazno, COL.lila][k]]))),
        pie: 'Muertes por cada 10 casos: en Chile de mama mueren más por caso que en el mundo (3,6 vs 2,8).' });
    } },
    { e: '📉', t: '¿Está aumentando?', texto: 'Muertes por cáncer en Chile, muertes por cáncer de mama y la tasa de cáncer cervicouterino con su proyección.', pintar(r) {
      const S = tabla('cancer', 'MuertesSerie'), M = tabla('cancer', 'MamaMuertes'), C = tabla('cancer', 'CervixTasa'); let ver = 'total';
      const rep = pagina(r, { kpi: [['+71%', 'muertes por cáncer 2001–2024', COL.rosa], ['2019', 'pasa a ser la primera causa de muerte', COL.lila]],
        controles: [chips([['total', 'Todos los cánceres'], ['mama', 'Mama'], ['cervix', 'Cuello uterino']], ver, v => { ver = v; rep(); })],
        pintar: l => l.append(ver === 'total' ? lineas([{ t: 'Muertes por cáncer', c: COL.rosa, p: S.map(f => [f.Anio, f.MuertesPorCancer, `<b>${f.Anio}</b>: ${num(f.MuertesPorCancer)} muertes${f.PorcentajeDefunciones ? ' (' + pct(f.PorcentajeDefunciones, 1) + ' del total)' : ''}<br><i>${esc(f.Nota)}</i>`]) }], { fmt: v => num(v), min0: false })
          : ver === 'mama' ? lineas([{ t: 'Muertes por cáncer de mama', c: COL.rosa, p: M.map(f => [f.Anio, f.Muertes]) }], { fmt: v => num(v), min0: false })
          : lineas([{ t: 'Observado', c: COL.lila, p: C.filter(f => f.Tipo === 'Observado').map(f => [f.Anio, f.TasaMortalidadPor100milMujeres]) }, { t: 'Proyección', c: COL.lila, punteada: true, p: C.filter(f => f.Anio >= 2024).map(f => [f.Anio, f.TasaMortalidadPor100milMujeres]) }])) });
    } },
    { e: '⏱️', t: 'Llegar a tiempo', texto: 'Sobrevida a 5 años si el cáncer se detecta localizado o cuando ya hizo metástasis.', pintar(r) {
      const S = tabla('cancer', 'SobrevidaEtapa');
      pagina(r, { kpi: [['99%', 'sobrevive al cáncer de mama localizado', COL.menta], ['32%', 'si ya hizo metástasis', COL.rosa]],
        pintar: l => l.append(columnas(S.map(f => ({ t: f.Cancer, v: [f.SobrevidaLocalizado, f.SobrevidaMetastasis] })), [{ t: 'Localizado', c: COL.menta }, { t: 'Con metástasis', c: COL.rosa }], { fmt: v => num(v) + '%', max: 100 }), leyenda([['Localizado', COL.menta], ['Con metástasis', COL.rosa]])) });
    } },
    { e: '🔎', t: 'Simulador: pesquisa', texto: 'Mueve la cobertura de mamografía y de PAP y mira cuántas muertes y casos se evitarían al año.', pintar(r) {
      const G = Object.fromEntries(tabla('cancer', 'Globocan2024').map(f => [f.Cancer, f])); let mamo = 37.4, pap = 43;
      const salida = el('div', 'tv-sim');
      const calc = () => {
        const muertes = G.Mama.Muertes * .4 * .4 * Math.max(0, mamo - 37.4) / 100, casos = G['Cuello uterino'].CasosNuevos * .8 * Math.max(0, pap - 43) / 100;
        const fila = (t, v, base, c, u) => { const f = el('div', 'tv-sim-fila'); f.style.setProperty('--c', c); const b = el('i'); b.style.width = Math.min(100, v / base * 100 * 3) + '%'; f.append(el('span', null, t), el('b', null, '−' + num(v)), b, el('small', null, u)); return f; };
        salida.replaceChildren(fila('Muertes por cáncer de mama', muertes, G.Mama.Muertes, COL.rosa, 'de ' + num(G.Mama.Muertes) + ' al año'), fila('Casos de cáncer cervicouterino', casos, G['Cuello uterino'].CasosNuevos, COL.lila, 'de ' + num(G['Cuello uterino'].CasosNuevos) + ' al año'));
      };
      const c = el('div', 'tv-controles tv-sim-controles');
      c.append(deslizador('Mamografía (50 a 69 años)', 37.4, 90, .1, mamo, v => num1(v) + '%', v => { mamo = v; calc(); }), deslizador('PAP al día', 43, 90, 1, pap, v => num(v) + '%', v => { pap = v; calc(); }));
      r.append(kpis([['37,4%', 'cobertura actual de mamografía (meta 70%)', COL.rosa], ['43%', 'cobertura estimada de PAP (meta 80%)', COL.lila]]), c, salida, nota('Supuestos: la mamografía reduce 40% la mortalidad en quienes se la hacen; 40% de las muertes por cáncer de mama ocurre entre los 50 y 69 años; el tamizaje cada 3 a 5 años evita 80% de los casos de cáncer cervicouterino. Simulación educativa.'));
      calc();
    } }
  ];

  /* ======================================================================
     Ajuar del recién nacido
     ====================================================================== */
  const ajuar = [
    { e: '📦', t: 'Entregas y cobertura', texto: 'Sets entregados por año, la población que tenía derecho y la cobertura. Elige qué ver.', pintar(r) {
      const E = tabla('ajuar', 'Entregas'); let ver = 'sets';
      const rep = pagina(r, { kpi: [['97–99%', 'cobertura 2019–2022', COL.menta], ['113.858', 'sets entregados en 2022', COL.rosa], ['60,1%', 'de los nacidos del país lo reciben', COL.lila]],
        controles: [chips([['sets', 'Sets entregados'], ['cob', 'Cobertura'], ['pais', 'Parte de los nacidos del país']], ver, v => { ver = v; rep(); })],
        pintar: l => l.append(ver === 'sets' ? lineas([{ t: 'Sets entregados', c: COL.rosa, p: E.map(f => [f.Anio, f.SetsEntregados]) }, { t: 'Población objetivo', c: COL.lila, punteada: true, p: E.filter(f => f.PoblacionObjetivo).map(f => [f.Anio, f.PoblacionObjetivo]) }], { fmt: v => num(v), min0: false })
          : ver === 'cob' ? columnas(E.filter(f => f.Cobertura).map(f => ({ t: String(f.Anio), v: [f.Cobertura * 100] })), [{ t: 'Cobertura', c: COL.menta }], { fmt: v => num(v) + '%', max: 100 })
          : columnas(E.filter(f => f.ProporcionNacidosConSet).map(f => ({ t: String(f.Anio), v: [f.ProporcionNacidosConSet * 100] })), [{ t: 'Nacidos del país con set', c: COL.lila }], { fmt: v => num1(v) + '%', max: 100 })),
        pie: 'La baja de 2020–2021 sigue la caída de la natalidad y la pandemia.' });
    } },
    { e: '💰', t: 'Presupuesto', texto: 'Presupuesto del programa en miles de pesos de 2023 y su ejecución.', pintar(r) {
      const P = tabla('ajuar', 'Presupuesto');
      pagina(r, { kpi: [['$19.272 M', 'presupuesto 2019 (pesos 2023)', COL.oro], ['99–100%', 'ejecución', COL.menta]],
        pintar: l => l.append(columnas(P.map(f => ({ t: String(f.Anio), v: [f.PresupuestoMiles / 1e6] })), [{ t: 'Presupuesto', c: COL.oro }], { fmt: v => '$' + num1(v) + ' mil M' })),
        pie: '2022 aparece reducido a la mitad por un ajuste del año calendario, no por un recorte real.' });
    } },
    { e: '🚚', t: 'De la compra a la familia', texto: 'Las etapas de la cadena logística. Toca cada una para ver quién la hace, cuánto tarda y su punto crítico.', pintar(r) {
      const C = tabla('ajuar', 'CadenaLogistica').sort((a, b) => a.Orden - b.Orden); let k = 0;
      const pasos = el('div', 'tv-pasos'), det = el('div');
      const ver = () => { [...pasos.children].forEach((b, i) => b.classList.toggle('activo', i === k)); const f = C[k]; det.replaceChildren(ficha(f.Orden + '. ' + f.Etapa, [['Responsable', f.Responsable], ['Qué ocurre', f.QueOcurre], ['Tiempo', f.Tiempo], ['Punto crítico', f.PuntoCritico]])); };
      C.forEach((f, i) => { const b = el('button', null); b.type = 'button'; b.append(el('b', null, f.Orden), el('span', null, f.Etapa)); b.addEventListener('click', () => { k = i; ver(); }); pasos.append(b); });
      r.append(pasos, det); ver();
    } },
    { e: '🧸', t: 'Qué contiene', texto: 'Los artículos del set, por paquete.', pintar(r) {
      const C = tabla('ajuar', 'Contenido'), paq = unicos(C, 'Paquete'); let p = paq[0];
      const rep = pagina(r, { kpi: [['$67.480', 'costo neto por set (2018)', COL.oro], ['137', 'maternidades públicas lo entregan', COL.rosa]],
        controles: [chips(paq, p, v => { p = v; rep(); })],
        pintar: l => { const g = el('div', 'tv-lista tv-lista-2'); C.filter(f => f.Paquete === p).sort((a, b) => a.Orden - b.Orden).forEach((f, i) => { const x = el('div', 'tv-fila'); x.style.setProperty('--c', SERIE[i % SERIE.length]); x.append(el('b', null, String(f.Orden)), el('span', null, f.Articulo)); g.append(x); }); l.append(g); } });
    } }
  ];

  window.TABLEROS_VIVOS = { listo, ocultar, temas: { anticonceptivos, its, embarazo, cancer, ajuar } };
})();
