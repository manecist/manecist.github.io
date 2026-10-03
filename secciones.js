/* ==========================================================================
   secciones.js · calculadora encantada, oráculo de los colores, leyendas
   dibujadas, paisaje del reino, la asesina que vuelve arriba y la tienda
   del mago.
   © 2026 María Inés Cisterna Escobar · Studios Conari SpA. Todos los derechos reservados.
   ========================================================================== */
(function () {
  'use strict';
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const el = (tag, cls, txt) => { const n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; };
  const fmt = n => Number.isFinite(n) ? (Math.round(n * 1e8) / 1e8).toLocaleString('es-CL', { maximumFractionDigits: 8 }) : '—';

  /* ======================================================================
     1 · Calculadora encantada + el mismo cálculo en Java
     ====================================================================== */
  (function calculadora() {
    const raiz = $('#calc'); if (!raiz) return;
    const pantalla = $('#calc-result'), expr = $('#calc-expression'), nombre = $('#calc-op-name');
    const jTitulo = $('#java-title'), jCodigo = $('#java-code');
    const SIM = { '+': '+', '-': '−', '*': '×', '/': '÷', '%': '%' };
    const NOM = { '+': 'Suma', '-': 'Resta', '*': 'Multiplicación', '/': 'División', '%': 'Porcentaje', log: 'Logaritmo base 10', sqrt: 'Raíz cuadrada', sq: 'Cuadrado', inv: 'Inverso', neg: 'Cambio de signo' };
    let entrada = '0', guardado = null, op = null, recien = false;

    const jnum = n => Number.isInteger(n) ? n + '.0' : String(n);
    const jlit = s => { const n = Number(s); return Number.isInteger(n) ? String(n) : String(n); };
    function java(lineas) {
      const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
      jCodigo.innerHTML = lineas.map(l => {
        let [codigo, com] = l.split('//');
        // una sola pasada: así una regla no colorea dentro de las etiquetas que puso otra
        codigo = esc(codigo).replace(/(".*?")|\b(double|if|else|return)\b|\b(Math|System)\b|(?<![\w.])(-?\d+(?:\.\d+)?)/g,
          (m, cad, pal, tipo) => `<span class="${cad ? 'js' : pal ? 'jk' : tipo ? 'jt' : 'jn'}">${m}</span>`);
        return codigo + (com != null ? '<span class="jc">//' + esc(com) + '</span>' : '');
      }).join('\n');
      jCodigo.parentElement.classList.remove('escribe'); void jCodigo.offsetWidth; jCodigo.parentElement.classList.add('escribe');
    }
    function binario(a, b, o) {
      if (o === '+') return a + b; if (o === '-') return a - b; if (o === '*') return a * b;
      if (o === '/') return b === 0 ? NaN : a / b; if (o === '%') return a * (b / 100);
    }
    function javaBinario(a, b, o, r) {
      const formula = { '+': 'a + b', '-': 'a - b', '*': 'a * b', '/': 'a / b', '%': 'a * (b / 100.0)' }[o];
      const lineas = ['double a = ' + jlit(a) + ';', 'double b = ' + jlit(b) + ';'];
      if (o === '/' && b === 0) lineas.push('if (b == 0) {', '    System.out.println("No se puede dividir por 0");', '}');
      else lineas.push('double resultado = ' + formula + ';   // ' + jnum(r), 'System.out.println(resultado);');
      jTitulo.textContent = NOM[o]; java(lineas);
    }
    function javaUnario(a, k, r) {
      const f = { log: 'Math.log10(a)', sqrt: 'Math.sqrt(a)', sq: 'Math.pow(a, 2)', inv: '1.0 / a', neg: '-a' }[k];
      const lineas = ['double a = ' + jlit(a) + ';'];
      if (!Number.isFinite(r)) lineas.push('// ' + (k === 'log' ? 'log10 solo acepta a > 0' : k === 'sqrt' ? 'no hay raíz real de un negativo' : 'no se puede dividir por 0'));
      else lineas.push('double resultado = ' + f + ';   // ' + jnum(r));
      lineas.push('System.out.println(resultado);');
      jTitulo.textContent = NOM[k]; java(lineas);
    }
    function pintar() {
      pantalla.textContent = entrada === 'Error' ? 'Error' : entrada.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))(?=[^,]*$)/g, '.');
      pantalla.classList.toggle('largo', entrada.length > 11);
      expr.textContent = guardado != null && op ? fmt(guardado) + ' ' + SIM[op] + (recien ? '' : '') : ' ';
    }
    function chispa() {
      if (!window.Magia) return;
      const r = pantalla.getBoundingClientRect();
      Magia.chispas(r.right - 20, r.top + r.height / 2, { n: 14, vel: 3 });
    }
    function tecla(k) {
      if (entrada === 'Error' && k !== 'C') { entrada = '0'; guardado = null; op = null; }
      if (/^\d$/.test(k)) {
        if (recien) { entrada = '0'; recien = false; }
        if (entrada.replace(/[-.]/g, '').length >= 14) return;
        entrada = entrada === '0' ? k : entrada === '-0' ? '-' + k : entrada + k;
      } else if (k === '.') {
        if (recien) { entrada = '0'; recien = false; }
        if (!entrada.includes('.')) entrada += '.';
      } else if (k === 'back') {
        if (recien) return;
        entrada = entrada.length > 1 && !(entrada.length === 2 && entrada.startsWith('-')) ? entrada.slice(0, -1) : '0';
      } else if (k === 'C') {
        entrada = '0'; guardado = null; op = null; recien = false; nombre.textContent = 'Lista para calcular';
        jTitulo.textContent = 'Suma'; java(['double a = 0;', 'double b = 0;', 'double resultado = a + b;']);
      } else if (SIM[k]) {
        const v = Number(entrada);
        if (guardado != null && op && !recien) { const r = binario(guardado, v, op); javaBinario(guardado, v, op, r); if (!Number.isFinite(r)) { entrada = 'Error'; guardado = null; op = null; pintar(); return; } guardado = r; }
        else guardado = v;
        op = k; recien = true; nombre.textContent = NOM[k]; entrada = String(guardado);
      } else if (k === '=') {
        if (guardado == null || !op) return;
        const b = Number(entrada), r = binario(guardado, b, op);
        javaBinario(guardado, b, op, r);
        expr.textContent = fmt(guardado) + ' ' + SIM[op] + ' ' + fmt(b) + ' =';
        entrada = Number.isFinite(r) ? String(Math.round(r * 1e10) / 1e10) : 'Error';
        nombre.textContent = Number.isFinite(r) ? NOM[op] : 'No se puede dividir por 0';
        guardado = null; op = null; recien = true;
        pantalla.textContent = entrada === 'Error' ? 'Error' : fmt(Number(entrada)); chispa(); return;
      } else if (['log', 'sqrt', 'sq', 'inv', 'neg'].includes(k)) {
        const a = Number(entrada);
        const r = k === 'log' ? (a > 0 ? Math.log10(a) : NaN) : k === 'sqrt' ? (a >= 0 ? Math.sqrt(a) : NaN) : k === 'sq' ? a * a : k === 'inv' ? (a === 0 ? NaN : 1 / a) : -a;
        javaUnario(a, k, r); nombre.textContent = NOM[k];
        if (k === 'neg') { entrada = entrada.startsWith('-') ? entrada.slice(1) : entrada === '0' ? '0' : '-' + entrada; pintar(); return; }
        entrada = Number.isFinite(r) ? String(Math.round(r * 1e10) / 1e10) : 'Error'; recien = true;
        pintar(); expr.textContent = ({ log: 'log₁₀(', sqrt: '√(', sq: '(', inv: '1 / (' })[k] + fmt(a) + (k === 'sq' ? ')²' : ')') + ' ='; chispa(); return;
      }
      pintar();
    }
    raiz.addEventListener('click', e => {
      const b = e.target.closest('[data-k]'); if (!b) return;
      b.classList.remove('pulsa'); void b.offsetWidth; b.classList.add('pulsa');
      tecla(b.dataset.k);
    });
    raiz.tabIndex = -1;
    document.addEventListener('keydown', e => {
      if (!raiz.matches(':hover') && !raiz.contains(document.activeElement)) return;
      if (e.target.matches('input,select,textarea')) return;
      const mapa = { Enter: '=', '=': '=', Backspace: 'back', Escape: 'C', Delete: 'C', ',': '.', '.': '.', '+': '+', '-': '-', '*': '*', x: '*', '/': '/', '%': '%' };
      const k = /^\d$/.test(e.key) ? e.key : mapa[e.key];
      if (!k) return; e.preventDefault(); tecla(k);
      const b = raiz.querySelector(`[data-k="${CSS.escape(k)}"]`); if (b) { b.classList.remove('pulsa'); void b.offsetWidth; b.classList.add('pulsa'); }
    });
    pintar();
  })();

  /* ======================================================================
     2 · El oráculo de los colores (laboratorio de datos)
     ====================================================================== */
  (function oraculo() {
    const form = $('#lab-form'); if (!form) return;
    const COLORES = [['Rojo', '#e8576f'], ['Naranja', '#f09a5b'], ['Amarillo', '#f2d36b'], ['Verde', '#7fcf98'], ['Turquesa', '#5fd0cf'], ['Celeste', '#91dcff'],
      ['Azul', '#6d8df0'], ['Violeta', '#a57bf0'], ['Morado', '#7b4fc4'], ['Rosado', '#f5a8cf'], ['Dorado', '#e2ba53'], ['Café', '#a87660'], ['Blanco', '#fbf7ff'], ['Gris', '#a3a6bd'], ['Negro', '#1d1a26']];
    const HEX = Object.fromEntries(COLORES);
    const MUSICA = ['Pop', 'Rock', 'Rock alternativo', 'Indie', 'Metal', 'Metal sinfónico', 'Punk', 'Blues', 'Jazz', 'Soul', 'R&B', 'Hip hop / Rap', 'Reguetón', 'Trap', 'Electrónica', 'Lo-fi', 'Clásica', 'Ópera', 'Soundtracks', 'Música de videojuegos', 'Anime / Anisong', 'J-pop', 'K-pop', 'Cumbia', 'Salsa', 'Bachata', 'Romántica', 'Bolero', 'Tango', 'Folclore chileno', 'Música andina', 'Folk', 'Reggae', 'Góspel', 'Otro'];
    const TRAMOS = [[1, 4, '1–4'], [5, 12, '5–12'], [13, 17, '13–17'], [18, 29, '18–29'], [30, 44, '30–44'], [45, 59, '45–59'], [60, 120, '60+']];
    const EJEMPLO = [[6, 'Rojo', 'Pop'], [7, 'Rojo', 'Pop'], [9, 'Rojo', 'Pop'], [10, 'Rojo', 'Pop'], [12, 'Rojo', 'Romántica'], [31, 'Rojo', 'Rock'], [34, 'Rojo', 'Rock'], [38, 'Rojo', 'Rock'], [40, 'Rojo', 'Metal'], [44, 'Rojo', 'Pop'], [18, 'Negro', 'Metal'], [22, 'Negro', 'Metal'], [25, 'Negro', 'Metal sinfónico'], [29, 'Negro', 'Rock'], [13, 'Rosado', 'K-pop'], [15, 'Rosado', 'K-pop'], [17, 'Rosado', 'Pop'], [46, 'Morado', 'Romántica'], [52, 'Morado', 'Romántica'], [58, 'Morado', 'Clásica']];
    const NOMBRES = ['Luna', 'Nico', 'Mara', 'Tomás', 'Sofía', 'Benja', 'Emilia', 'Joaquín', 'Isi', 'Vale', 'Martín', 'Cata', 'Diego', 'Flor', 'Amaru', 'Javi', 'Antu', 'Rayén', 'Pablo', 'Coni'];
    let filas = [], origen = 'ejemplo', color = 'Rosado', sel = null;
    const tramoDe = edad => TRAMOS.findIndex(([a, b]) => edad >= a && edad <= b);
    const personas = n => n + (n === 1 ? ' persona' : ' personas');
    const pct = (n, d) => d ? (n / d * 100).toLocaleString('es-CL', { maximumFractionDigits: 0 }) + '%' : '—';
    function frec(lista, k) { const m = new Map(); lista.forEach(r => m.set(r[k], (m.get(r[k]) || 0) + 1)); return [...m].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'es')); }

    // paleta de gotas
    const gotas = $('#lab-colores');
    COLORES.forEach(([n, h]) => {
      const b = el('button', 'gota'); b.type = 'button'; b.style.setProperty('--c', h); b.dataset.color = n;
      b.setAttribute('aria-label', n); b.title = n; b.setAttribute('aria-pressed', String(n === color));
      b.addEventListener('click', () => { color = n; $('#lab-color-nombre').textContent = n; $$('.gota').forEach(g => g.setAttribute('aria-pressed', String(g === b))); });
      gotas.append(b);
    });
    const sMus = $('#lab-musica'); MUSICA.forEach(m => sMus.append(new Option(m, m)));
    sMus.addEventListener('change', () => { $('#lab-otra-wrap').hidden = sMus.value !== 'Otro'; });

    function cargarEjemplo() { filas = EJEMPLO.map(([edad, c, m], i) => ({ nombre: NOMBRES[i], edad, color: c, musica: m, ficticio: true })); origen = 'ejemplo'; sel = null; pintar(); }
    form.addEventListener('submit', e => {
      e.preventDefault();
      const nombre = $('#lab-nombre').value.trim(), edad = Number($('#lab-edad').value), musica = sMus.value === 'Otro' ? $('#lab-otra').value.trim() : sMus.value;
      const msg = $('#lab-msg');
      if (!nombre) { msg.textContent = 'Escribe un nombre (puede ser inventado).'; $('#lab-nombre').focus(); return; }
      if (!Number.isInteger(edad) || edad < 1 || edad > 120) { msg.textContent = 'La edad debe ser un número entero entre 1 y 120.'; $('#lab-edad').focus(); return; }
      if (!musica) { msg.textContent = 'Escribe el género musical.'; $('#lab-otra').focus(); return; }
      if (origen === 'ejemplo') { filas = []; origen = 'propio'; }
      filas.push({ nombre, edad, color, musica });
      sel = { color, tramo: tramoDe(edad) };
      form.reset(); $('#lab-otra-wrap').hidden = true; sMus.value = 'Pop';
      msg.textContent = `✦ ${nombre} quedó guardado. El oráculo ahora conoce a ${personas(filas.length)}.`;
      pintar();
      const b = $(`.burbuja[data-color="${CSS.escape(sel.color)}"][data-tramo="${sel.tramo}"]`);
      if (b && window.Magia) { const r = b.getBoundingClientRect(); Magia.chispas(r.left + r.width / 2, r.top + r.height / 2, { n: 22, colores: [HEX[sel.color] || '#fff', '#fff6fb', '#ffe39a'] }); }
    });
    $('#lab-ejemplo').addEventListener('click', () => { cargarEjemplo(); $('#lab-msg').textContent = 'Cargué 20 personas inventadas para practicar.'; });
    $('#lab-limpiar').addEventListener('click', () => { filas = []; origen = 'propio'; sel = null; pintar(); $('#lab-msg').textContent = 'El oráculo quedó en blanco. Agrega la primera persona.'; });

    function kpis() {
      const k = $('#lab-kpis'); k.replaceChildren();
      const lider = key => { const f = frec(filas, key); if (!f.length) return '—'; const emp = f.filter(x => x[1] === f[0][1]); return emp.length > 2 ? `Empate (${emp.length})` : emp.map(x => x[0]).join(' y '); };
      const prom = filas.length ? (filas.reduce((s, r) => s + r.edad, 0) / filas.length).toLocaleString('es-CL', { maximumFractionDigits: 1 }) : '—';
      [['Personas', filas.length, origen === 'ejemplo' ? 'ejemplo ficticio' : 'registradas aquí'], ['Edad promedio', prom, 'años'], ['Color más elegido', lider('color'), ''], ['Música más escuchada', lider('musica'), '']]
        .forEach(([t, v, s]) => { const d = el('div', 'kpi'); d.append(el('span', null, t), el('strong', null, String(v))); if (s) d.append(el('small', null, s)); k.append(d); });
    }
    function mapa() {
      const m = $('#lab-mapa'); m.replaceChildren();
      if (!filas.length) { m.append(el('p', 'mapa-vacio', '✧ El oráculo aún no conoce a nadie. Agrega una persona o carga el ejemplo.')); return; }
      const porColor = frec(filas, 'color').map(([c]) => c);
      let max = 1; const cuenta = {};
      filas.forEach(r => { const key = r.color + '|' + tramoDe(r.edad); cuenta[key] = (cuenta[key] || 0) + 1; max = Math.max(max, cuenta[key]); });
      m.style.setProperty('--cols', TRAMOS.length);
      m.append(el('span', 'mapa-esquina', 'Edad →'));
      TRAMOS.forEach((t, i) => { const b = el('button', 'mapa-tramo', t[2]); b.type = 'button'; b.title = 'Ver todas las personas de ' + t[2] + ' años'; b.addEventListener('click', () => { sel = { tramo: i }; lectura(); marcar(); }); m.append(b); });
      porColor.forEach(c => {
        const lab = el('button', 'mapa-color'); lab.type = 'button'; lab.style.setProperty('--c', HEX[c] || '#ccacd9');
        lab.append(el('i'), el('span', null, c)); lab.title = 'Ver todas las edades de ' + c; lab.addEventListener('click', () => { sel = { color: c }; lectura(); marcar(); });
        m.append(lab);
        TRAMOS.forEach((t, i) => {
          const n = cuenta[c + '|' + i] || 0, celda = el('div', 'mapa-celda');
          if (n) {
            const b = el('button', 'burbuja'); b.type = 'button'; b.dataset.color = c; b.dataset.tramo = i;
            const tam = 28 + 30 * Math.sqrt(n / max);
            b.style.cssText = `--c:${HEX[c] || '#ccacd9'};--t:${tam}px`;
            b.append(el('span', null, String(n)));
            b.setAttribute('aria-label', `${c}, ${t[2]} años: ${personas(n)}`); b.dataset.tip = `${c} · ${t[2]} años · ${personas(n)}`;
            b.addEventListener('click', () => { sel = { color: c, tramo: i }; lectura(); marcar(); });
            celda.append(b);
          } else celda.append(el('i', 'mapa-nada'));
          m.append(celda);
        });
      });
    }
    function marcar() {
      $$('.burbuja').forEach(b => b.classList.toggle('activa', !!sel && (sel.color == null || b.dataset.color === sel.color) && (sel.tramo == null || +b.dataset.tramo === sel.tramo)));
    }
    function lectura() {
      const L = $('#lab-lectura'); L.replaceChildren();
      if (!filas.length) return;
      if (!sel) { // por defecto, la burbuja más grande
        const f = frec(filas.map(r => ({ k: r.color + '|' + tramoDe(r.edad) })), 'k')[0][0].split('|'); sel = { color: f[0], tramo: +f[1] };
      }
      const grupo = filas.filter(r => (sel.color == null || r.color === sel.color) && (sel.tramo == null || tramoDe(r.edad) === sel.tramo));
      const tit = [sel.color, sel.tramo != null ? TRAMOS[sel.tramo][2] + ' años' : 'todas las edades'].filter(Boolean).join(' · ');
      const cab = el('div', 'lectura-cab'); if (sel.color) { const d = el('i'); d.style.background = HEX[sel.color] || '#ccacd9'; cab.append(d); }
      cab.append(el('h4', null, tit), el('span', null, personas(grupo.length)));
      L.append(cab);
      if (!grupo.length) { L.append(el('p', null, 'Nadie en este grupo todavía.')); return; }
      const mus = frec(grupo, 'musica'), top = mus[0][1], lideres = mus.filter(x => x[1] === top).map(x => x[0]);
      let frase;
      if (grupo.length === 1) frase = `Solo hay una persona aquí y escucha ${lideres[0]}. Un caso no alcanza para hablar de una tendencia.`;
      else if (lideres.length > 1) frase = `Empate: ${lideres.join(' y ')} con ${top} de ${grupo.length} cada uno.`;
      else frase = `${top} de ${grupo.length} (${pct(top, grupo.length)}) escuchan ${lideres[0]}${top > grupo.length / 2 ? ': es la mayoría del grupo.' : ': es lo más frecuente, aunque no llega a la mitad.'}`;
      L.append(el('p', 'lectura-frase', frase));
      const barras = el('ul', 'lectura-barras');
      mus.forEach(([m, n]) => { const li = el('li'); const bar = el('span', 'lb-barra'); bar.style.setProperty('--p', n / grupo.length); li.append(el('b', null, m), bar, el('span', 'lb-n', `${n} · ${pct(n, grupo.length)}`)); barras.append(li); });
      L.append(barras);
      if (grupo.length < 5) L.append(el('small', 'lectura-nota', `Grupo pequeño: cada persona pesa ${pct(1, grupo.length)}.`));
    }
    function tabla() {
      const t = $('#lab-tabla'); t.replaceChildren();
      // en el libro se muestran las primeras filas y se avisa cuántas quedan (en la versión clásica, todas)
      const MAX = 12;
      filas.forEach((r, i) => { const tr = el('tr', i >= MAX ? 'fila-extra' : null); [r.nombre, r.edad, r.color, r.musica].forEach(v => tr.append(el('td', null, String(v)))); t.append(tr); });
      const mas = $('#lab-tabla-mas'); if (mas) mas.textContent = filas.length > MAX ? `… y ${filas.length - MAX} registros más; en la versión clásica se ven todos.` : '';
    }
    function pintar() { kpis(); mapa(); if (sel && !filas.some(r => (sel.color == null || r.color === sel.color) && (sel.tramo == null || tramoDe(r.edad) === sel.tramo))) sel = null; lectura(); marcar(); tabla();
      // el libro levanta estos conteos como barras de papel (capítulo IX)
      const datos = frec(filas, 'color').map(([c, n]) => ({ c, n, hex: HEX[c] || '#ccacd9' }));
      window.MCEOraculo = { datos }; window.dispatchEvent(new CustomEvent('oraculo-datos', { detail: datos }));
    }
    cargarEjemplo();
  })();

  /* ======================================================================
     3 · Leyendas dibujadas: galería protegida con marca de agua y visor
     ====================================================================== */
  (function leyendas() {
    const grid = $('#leyendas-grid'); if (!grid) return;
    const OBRAS = [
      ['achachila', 'Achachila', 'leyenda', 'Espíritu protector de los cerros en la tradición aymara.'],
      ['alicanto', 'Alicanto', 'leyenda', 'Ave mítica del desierto de Atacama; sus alas brillan con la luz de los metales.'],
      ['supai', 'Supai', 'leyenda', 'Espíritu del mundo de abajo en la cosmovisión andina.'],
      ['lascar', 'Láscar', 'leyenda', 'El volcán de Atacama convertido en personaje.'],
      ['tirana-1', 'La Tirana', 'leyenda', 'Inspirada en la fiesta de La Tirana, en Tarapacá.'],
      ['tirana-2', 'La Tirana · variante', 'leyenda', 'Segunda propuesta de vestuario y tocado.'],
      ['reina-noche', 'Reina de la Noche', 'leyenda', 'Personaje de la serie de leyendas.'],
      ['lica', 'Lica', 'leyenda', 'Personaje de la serie de leyendas.'],
      ['emilia-expresiones', 'Emilia · expresiones', 'proceso', 'Hoja de expresiones de Emilia, personaje de Studios Conari.'],
      ['emilia-vistas', 'Emilia · vistas', 'proceso', 'Vistas de frente, perfil y espalda para animación.'],
      ['puma', 'Puma', 'proceso', 'Lineart y paleta de color del guardián de la cordillera.'],
      ['tirana-proceso', 'La Tirana · proceso', 'proceso', 'Boceto de trabajo antes del color.'],
      ['regalo-1', 'Regalo', 'regalo', 'Ilustración hecha como regalo.'],
      ['regalo-2', 'Regalo', 'regalo', 'Ilustración hecha como regalo.']
    ];
    let vista = OBRAS, idx = 0, hoja = 0;
    // en el libro la galería se recorre por hojas de seis (en la versión clásica se ven todas)
    const POR_HOJA = 6, pie = el('div', 'leyendas-hojas'), hAnt = el('button', null, '‹'), hSig = el('button', null, '›'), hTxt = el('span');
    hAnt.type = hSig.type = 'button'; hAnt.setAttribute('aria-label', 'Ilustraciones anteriores'); hSig.setAttribute('aria-label', 'Más ilustraciones');
    pie.append(hAnt, hTxt, hSig); grid.after(pie);
    function paginar(h) {
      const n = Math.max(1, Math.ceil(vista.length / POR_HOJA)); hoja = (h + n) % n;
      [...grid.children].forEach((b, i) => b.classList.toggle('fuera-hoja', Math.floor(i / POR_HOJA) !== hoja));
      hTxt.textContent = `${hoja + 1} / ${n}`; pie.hidden = n < 2;
    }
    hAnt.addEventListener('click', () => paginar(hoja - 1)); hSig.addEventListener('click', () => paginar(hoja + 1));
    const visor = $('#visor'), vImg = $('#visor-img'), vTxt = $('#visor-texto');
    function pintar(f) {
      vista = f === 'todas' ? OBRAS : OBRAS.filter(o => o[2] === f);
      grid.replaceChildren();
      vista.forEach(([slug, tit, tipo, txt], i) => {
        const b = el('button', 'obra obra-' + tipo + (/^emilia|^papel/.test(slug) ? ' obra-horizontal' : '')); b.type = 'button'; b.style.setProperty('--i', i);
        const img = el('img'); img.src = 'assets/galeria/' + slug + '.webp'; img.alt = tit + '. ' + txt; img.loading = 'lazy'; img.draggable = false; img.decoding = 'async';
        b.append(img, el('span', 'obra-escudo'), el('span', 'obra-nombre', tit));
        b.addEventListener('click', () => abrir(i));
        grid.append(b);
      });
      paginar(0);
    }
    function abrir(i) {
      idx = (i + vista.length) % vista.length; const [slug, tit, tipo, txt] = vista[idx];
      vImg.src = 'assets/galeria/' + slug + '.webp'; vImg.alt = tit;
      vTxt.replaceChildren(el('b', null, tit), el('span', null, txt), el('small', null, tipo === 'regalo' ? '© Arianes · obra regalada, con todos los derechos reservados' : '© Studios Conari SpA · María Inés Cisterna (Ari) · todos los derechos reservados'));
      if (!visor.open) visor.showModal();
    }
    $$('[data-filtro]').forEach(b => b.addEventListener('click', () => { $$('[data-filtro]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); pintar(b.dataset.filtro); }));
    $('#visor-prev').addEventListener('click', () => abrir(idx - 1));
    $('#visor-next').addEventListener('click', () => abrir(idx + 1));
    $('#visor-cerrar').addEventListener('click', () => visor.close());
    visor.addEventListener('click', e => { if (e.target === visor) visor.close(); });
    visor.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') abrir(idx - 1); if (e.key === 'ArrowRight') abrir(idx + 1); });
    // protección: sin menú contextual ni arrastre sobre las obras
    const proteger = n => { n.addEventListener('contextmenu', e => e.preventDefault()); n.addEventListener('dragstart', e => e.preventDefault()); };
    [grid, visor].forEach(proteger);
    pintar('todas');
  })();

  /* ======================================================================
     4 · El reino de fondo: la escena en acuarela, pétalos y paralaje
     ====================================================================== */
  (function reino() {
    const r = $('#reino'); if (!r) return;
    // la escena se carga solo cuando se elige la versión clásica (pesa ~2 MB)
    let fondo = null;
    const site = $('#site');
    function terminarPintura() {
      site.classList.remove('pintando'); document.body.classList.remove('bloqueado');
      removeEventListener('keydown', saltar, true); removeEventListener('pointerdown', saltar, true);
      try { sessionStorage.setItem('mce-acuarela', '1'); } catch (e) { /* sin almacenamiento */ }
    }
    function saltar(e) { if (e) { e.preventDefault(); e.stopImmediatePropagation(); } fondo?.saltar(); }
    // modo día / noche: cambia el tema del sitio y funde el fondo con la escena del otro modo
    const raizDoc = document.documentElement, botonTema = $('#tema-boton'), metaColor = document.querySelector('meta[name="theme-color"]');
    function aplicarTema(t) {
      raizDoc.dataset.tema = t;
      const claro = t === 'claro';
      if (botonTema) { botonTema.querySelector('span').textContent = claro ? '☾' : '☀'; botonTema.setAttribute('aria-label', claro ? 'Cambiar a modo noche' : 'Cambiar a modo día'); }
      if (metaColor) metaColor.content = claro ? '#f6efe4' : '#0b1430';
      fondo?.tema(claro ? 'dia' : 'noche');
      window.MCECielo?.(claro ? 'dia' : 'noche');   // el cielo del libro acompaña al modo
    }
    window.MCETema = { poner(t) { try { localStorage.setItem('mce-tema', t); } catch (e) { /* sin almacenamiento */ } aplicarTema(t); } };
    aplicarTema(raizDoc.dataset.tema === 'claro' ? 'claro' : 'oscuro');
    botonTema?.addEventListener('click', () => {
      if (site.classList.contains('pintando')) return;
      MCETema.poner(raizDoc.dataset.tema === 'claro' ? 'oscuro' : 'claro');
    });
    window.MCEReino = {
      // animar: el hada pinta la escena desde el lineart (una vez por sesión y sin movimiento reducido)
      mostrar(animar) {
        if (!window.FondoAcuarela) return;
        if (!fondo) fondo = FondoAcuarela.montar($('#reino-acuarela'), document.documentElement.dataset.tema === 'claro' ? 'dia' : 'noche');
        let visto = false; try { visto = !!sessionStorage.getItem('mce-acuarela'); } catch (e) { /* sin almacenamiento */ }
        if (!animar || quieto || visto) { fondo.pintada(); return; }
        site.classList.add('pintando'); document.body.classList.add('bloqueado');
        addEventListener('keydown', saltar, true); addEventListener('pointerdown', saltar, true);
        fondo.reproducir().then(terminarPintura);
      }
    };
    // pétalos de sakura
    const caja = $('#reino-petalos');
    if (!quieto) for (let i = 0; i < 22; i++) {
      const p = el('i'); p.style.cssText = `--x:${Math.random() * 100}vw;--d:${9 + Math.random() * 11}s;--r:${Math.random() * 360}deg;--s:${.5 + Math.random() * .9};--dx:${(Math.random() * 40 - 10)}vw;animation-delay:-${Math.random() * 20}s`;
      caja.append(p);
    }
    // paralaje con el puntero y velo según el scroll
    let mx = 0, my = 0, tx = 0, ty = 0;
    addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });
    function mover() {
      tx += (mx - tx) * .06; ty += (my - ty) * .06;
      r.style.setProperty('--px', tx.toFixed(4)); r.style.setProperty('--py', ty.toFixed(4));
      // al bajar por la página las capas cercanas se desplazan más que las lejanas
      const largo = Math.max(1, document.documentElement.scrollHeight - innerHeight), s = scrollY / largo;
      fondo?.mover(tx * 1.6, ty * 1.2 + (s - .5) * 1.4);
      requestAnimationFrame(mover);
    }
    if (!quieto) mover();
    const velo = () => r.style.setProperty('--scroll', Math.min(1, scrollY / (innerHeight * .9)).toFixed(3));
    addEventListener('scroll', velo, { passive: true }); velo();
  })();

  /* ======================================================================
     5 · La asesina que vuelve arriba: salta al bajar y sube haciendo dash
     ====================================================================== */
  (function volverArriba() {
    const b = $('#volver-arriba'); if (!b) return;
    let ultimo = scrollY, saltoT = 0, enDash = false;
    addEventListener('scroll', () => {
      const y = scrollY, visible = y > innerHeight * .8 && $('#site').classList.contains('ready');
      b.classList.toggle('visible', visible || enDash);
      if (!enDash && visible && y - ultimo > 6 && performance.now() - saltoT > 700) {
        saltoT = performance.now(); b.classList.remove('salta'); void b.offsetWidth; b.classList.add('salta');
      }
      ultimo = y;
    }, { passive: true });
    b.addEventListener('click', () => {
      if (enDash) return; enDash = true;
      b.classList.remove('salta', 'aterriza'); b.classList.add('agacha');
      const r = b.getBoundingClientRect();
      setTimeout(() => {
        b.classList.remove('agacha'); b.classList.add('dash');
        if (window.Magia) for (let i = 0; i < 8; i++) setTimeout(() => Magia.estela(r.left + r.width / 2, r.top + r.height * (1 - i / 8) - i * 40, { n: 4, colores: ['#f5a8cf', '#ff6fa8', '#ffd9ea', '#e2ba53'] }), i * 30);
        scrollTo({ top: 0, behavior: quieto ? 'auto' : 'smooth' });
      }, quieto ? 0 : 160);
      setTimeout(() => { b.classList.remove('dash'); b.classList.add('aterriza'); enDash = false; b.classList.remove('visible'); }, quieto ? 50 : 1100);
    });
  })();

  /* ======================================================================
     6 · Hadas vivas en la portada y en las páginas
     ====================================================================== */
  window.addEventListener('load', () => {
    if (!window.Magia) return;
    $$('#site .hada-viva[data-hada]').forEach(n => { n._hada = new Magia.Hada(n, { hechizoCada: 7000 }); });
    $$('#site .hada-viva[data-hada]').forEach(n => n.addEventListener('click', () => n._hada.hechizo()));
  });

  /* ======================================================================
     7 · La tienda del mago: diálogos según lo que pasa en la caja
     ====================================================================== */
  (function tienda() {
    const items = $('#m4-items'), boleta = $('#printed-receipt'); if (!items) return;
    const decir = (quien, txt) => {
      const g = document.querySelector(`[data-tienda] [data-globo="${quien}"]`); if (!g) return;
      g.textContent = txt; g.classList.remove('habla'); void g.offsetWidth; g.classList.add('habla');
    };
    const MAGO = n => [`¡${n}! Excelente elección, viene con encantamiento incluido.`, `${n}… lo forjé yo mismo bajo la luna llena.`, `Anotado: ${n}. ¿Algo más para la fiesta?`];
    const ARI = ['¡Me encanta! ✧', 'Coen, ¿verdad que es precioso?', '¡Uno más y nos vamos, lo prometo!'];
    const COEN = ['…yo pago 😅', 'Mi bolsa de oro tiembla.', 'Lo que tú quieras, Ari.'];
    let antes = 0, turno = 0;
    new MutationObserver(() => {
      const filas = items.querySelectorAll('p:not(.empty)'), n = filas.length;
      if (n > antes) {
        const nombre = (filas[n - 1].querySelector('span')?.textContent || 'ese tesoro').replace(/\s×.*$/, '');
        decir('mago', MAGO(nombre)[turno % 3]);
        setTimeout(() => decir('ari', (turno % 2 ? COEN : ARI)[turno % 3]), 900); turno++;
      } else if (n === 0 && antes > 0) { decir('mago', 'Caja limpia. ¿Empezamos otra compra?'); decir('ari', 'Mmm… déjame mirar otra vez ✧'); }
      antes = n;
    }).observe(items, { childList: true, subtree: true });
    if (boleta) new MutationObserver(() => {
      if (!boleta.childElementCount) return;
      const vuelto = $('#drawer-change')?.textContent || '';
      decir('mago', '¡Aquí tienen su boleta! ' + vuelto + '. Vuelvan pronto ✦');
      setTimeout(() => decir('ari', '¡Gracias, Rancek! Coen, lleva las bolsas 💕'), 900);
      const m = document.querySelector('[data-tienda] .t-mago');
      if (m && window.Magia) { const r = m.getBoundingClientRect(); if (r.width) Magia.chispas(r.left + r.width / 2, r.top + r.height * .3, { n: 30 }); }
    }).observe(boleta, { childList: true });
  })();

  /* mantener presionado repite el movimiento en el control táctil */
  document.querySelectorAll('.control-magico [data-tetris-action]').forEach(b => {
    if (!/left|right|down/.test(b.dataset.tetrisAction)) return;
    let t1, t2;
    const parar = () => { clearTimeout(t1); clearInterval(t2); };
    b.addEventListener('pointerdown', () => { parar(); t1 = setTimeout(() => { t2 = setInterval(() => b.click(), 90); }, 260); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => b.addEventListener(ev, parar));
  });

  /* ======================================================================
     8 · Bloques Encantados: chispas cuando el hada rompe una línea
     ====================================================================== */
  (function tetrisMagico() {
    const original = window.showLineMagic; if (!original) return;
    window.showLineMagic = function (lineas) {
      original(lineas);
      const cv = $('#play-tetris'); if (!cv || !window.Magia) return;
      const r = cv.getBoundingClientRect();
      (lineas || []).forEach((fila, k) => setTimeout(() => {
        const y = r.top + (fila + .5) / 20 * r.height;
        for (let i = 0; i < 5; i++) Magia.chispas(r.left + r.width * (i + .5) / 5, y, { n: 10, vel: 4 });
      }, 650 + k * 60));
    };
  })();
})();
