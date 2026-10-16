/* ==========================================================================
   secciones.js · calculadora encantada, leyendas
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
     3 · Leyendas dibujadas: galería protegida con marca de agua y visor
     ====================================================================== */
  (function leyendas() {
    const grid = $('#leyendas-grid'); if (!grid) return;
    const OBRAS = [
      ['achachila', 'Achachila', 'leyenda', 'Espíritu protector de los cerros en la tradición aymara.'],
      ['alicanto', 'Alicanto', 'leyenda', 'Ave mítica del desierto de Atacama; sus alas brillan con la luz de los metales.'],
      ['alicanto-cria', 'Alicanto · cría', 'leyenda', 'El Alicanto pequeño, en lineart.'],
      ['make-make', 'Make-Make', 'leyenda', 'Dios creador del pueblo rapanui, con su máscara de ave.'],
      ['pachamama', 'Pachamama', 'leyenda', 'La Madre Tierra en la cosmovisión andina.'],
      ['supai', 'Supai', 'leyenda', 'Espíritu del mundo de abajo en la cosmovisión andina.'],
      ['lascar', 'Láscar', 'leyenda', 'El volcán de Atacama convertido en personaje.'],
      ['tirana-1', 'La Tirana', 'leyenda', 'Inspirada en la fiesta de La Tirana, en Tarapacá.'],
      ['tirana-2', 'La Tirana · variante', 'leyenda', 'Segunda propuesta de vestuario y tocado.'],
      ['reina-noche', 'Reina de la Noche', 'leyenda', 'Personaje de la serie de leyendas.'],
      ['lica', 'Lica', 'leyenda', 'Personaje de la serie de leyendas.'],
      ['emilia-expresiones', 'Emilia · expresiones', 'proceso', 'Hoja de expresiones de Emilia, personaje de Studios Conari.'],
      ['tirana-proceso', 'La Tirana · proceso', 'proceso', 'Boceto de trabajo antes del color.'],
      ['alicanto-lineart', 'Alicanto · lineart', 'proceso', 'La línea del Alicanto antes del color.'],
      ['make-make-rostro', 'Make-Make · sin máscara', 'proceso', 'Variante de Make-Make sin la máscara de ave.'],
      ['benja', 'Benja', 'proceso', 'Pose principal del personaje.'],
      ['benja-base', 'Benja · base', 'proceso', 'Cuerpo base antes del vestuario.'],
      ['mochilero', 'Mochilero', 'proceso', 'Pose principal con su mochila de viaje.'],
      ['mochilero-base', 'Mochilero · base', 'proceso', 'Cuerpo base antes del vestuario.'],
      ['chibi', 'Chibi', 'proceso', 'Pose principal en estilo chibi.'],
      ['chibi-base', 'Chibi · base', 'proceso', 'Cuerpo base antes del vestuario.'],
      ['regalo-1', 'Regalo', 'regalo', 'Ilustración hecha como regalo.'],
      ['regalo-2', 'Regalo', 'regalo', 'Ilustración hecha como regalo.'],
      ['regalo-2-lineart', 'Regalo · lineart', 'regalo', 'La línea del regalo antes del color.']
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
      mostrar(animar, forzar) {
        if (!window.FondoAcuarela) return;
        if (!fondo) fondo = FondoAcuarela.montar($('#reino-acuarela'), document.documentElement.dataset.tema === 'claro' ? 'dia' : 'noche');
        let visto = false; try { visto = !!sessionStorage.getItem('mce-acuarela'); } catch (e) { /* sin almacenamiento */ }
        if (!animar || quieto || (visto && !forzar)) { fondo.pintada(); return; }
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
      window.dispatchEvent(new CustomEvent('tienda-dice', { detail: { quien, txt } }));   // el cuento también lo cuenta
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
      setTimeout(() => window.dispatchEvent(new Event('tienda-boleta')), 1800);
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
