/* ==========================================================================
   libro.js · el libro mágico
   Tras la intro, una estela cruza el cielo y aparece un libro cerrado, con
   la portada sin emblema. El dragón rosa llega volando, se posa sobre ella,
   brilla y, dibujo a dibujo, se transforma en el emblema rosado de Studios Conari. Luego el hada llega
   volando, toca la tapa con su varita y el libro se abre. Desde
   ahí se elige: leer el portafolio como cuento (páginas que se pasan) o la
   versión clásica (una sola página con el reino de fondo).
   Las demostraciones son las mismas en ambos modos: el libro las «toma
   prestadas» de la versión clásica y las devuelve al cerrar.
   © 2026 María Inés Cisterna Escobar · Studios Conari SpA. Todos los derechos reservados.
   ========================================================================== */
(function () {
  'use strict';
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const escena = $('#escena'), libro = $('#libro'), tapa = $('#libro-tapa'), cuerpo = libro.querySelector('.libro-cuerpo');
  const izq = $('#pag-izq'), der = $('#pag-der'), almacen = $('#paginas'), folio = $('#libro-folio');
  const site = $('#site'), raiz = document.documentElement;
  const paginas = [...almacen.querySelectorAll(':scope > .pagina')];
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mqUna = matchMedia('(max-width: 860px)');
  let una = mqUna.matches, actual = 0, abierto = false, animando = false, hada = null, empezo = false;
  const espera = ms => new Promise(r => setTimeout(r, quieto ? 0 : ms));
  const guardar = (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) { /* sin almacenamiento */ } };
  const leer = k => { try { return sessionStorage.getItem(k); } catch (e) { return null; } };

  paginas.forEach((p, i) => { p.dataset.n = i; const f = document.createElement('span'); f.className = 'pagina-num'; f.textContent = i ? String(i) : ''; f.setAttribute('aria-hidden', 'true'); p.append(f); });

  // ------------------------------------------------------------ medidas
  function medir() {
    una = mqUna.matches;
    const navH = 64, vw = innerWidth, vh = innerHeight;
    const ph = Math.max(420, Math.min(900, vh - navH - (una ? 22 : 46)));
    const pw = una ? Math.min(vw - 20, 620) : Math.min(660, (vw - 70) / 2, ph * .92);
    libro.style.setProperty('--pw', Math.round(pw) + 'px');
    libro.style.setProperty('--ph', Math.round(ph) + 'px');
    libro.classList.toggle('una', una);
  }
  medir();
  addEventListener('resize', () => { const antes = una; medir(); if (abierto && antes !== una) colocar(una ? actual : actual - actual % 2); });

  // ------------------------------------------------------------ préstamo de demostraciones
  const origen = new Map();
  function prestar(p) {
    p.querySelectorAll('.ranura[data-widget]').forEach(r => {
      const w = document.querySelector(r.dataset.widget);
      if (!w || r.contains(w)) return;
      if (!origen.has(w)) { const c = document.createComment('vuelve:' + r.dataset.widget); w.before(c); origen.set(w, c); }
      r.append(w);
    });
  }
  function devolver() { origen.forEach((c, w) => c.replaceWith(w)); origen.clear(); }

  function despertarHadas(p) {
    if (!window.Magia) return;
    p.querySelectorAll('.hada-viva').forEach(n => { if (!n._hada) { n._hada = new Magia.Hada(n, { hechizoCada: 6500 }); n.addEventListener('click', () => n._hada.hechizo()); } });
  }

  // ------------------------------------------------------------ colocar páginas
  function colocar(i) {
    i = Math.max(0, Math.min(paginas.length - 1, i));
    if (!una) i -= i % 2;
    actual = i;
    [...izq.children, ...der.children].forEach(p => almacen.append(p));
    const vis = una ? [paginas[i]] : [paginas[i], paginas[i + 1]];
    if (una) der.append(vis[0]); else { izq.append(vis[0]); if (vis[1]) der.append(vis[1]); }
    vis.forEach(p => { if (!p) return; prestar(p); despertarHadas(p); p.scrollTop = 0; });
    const ref = vis[vis.length - 1] || vis[0];
    folio.textContent = (ref.dataset.cap || '') + ' · ' + (una ? (i + 1) : (i + 1) + '–' + Math.min(paginas.length, i + 2)) + ' / ' + paginas.length;
    $('#libro-prev').disabled = i === 0;
    $('#libro-next').disabled = i + (una ? 1 : 2) >= paginas.length;
    guardar('mce-pagina', String(i));
  }

  // copia visual de una página (sin ids ni foco) para la hoja que gira
  function clon(p) {
    if (!p) { const v = document.createElement('div'); v.className = 'pagina pagina-vacia'; return v; }
    const c = p.cloneNode(true);
    c.removeAttribute('id'); c.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
    c.setAttribute('aria-hidden', 'true'); c.inert = true;
    const a = p.querySelectorAll('canvas'), b = c.querySelectorAll('canvas');
    a.forEach((cv, k) => { try { b[k].getContext('2d').drawImage(cv, 0, 0); } catch (e) { /* lienzo vacío */ } });
    const st = p.scrollTop; requestAnimationFrame(() => { c.scrollTop = st; });
    return c;
  }

  // ------------------------------------------------------------ pasar páginas
  function ir(nuevo, dir) {
    if (animando || !abierto) return;
    if (!una) nuevo -= nuevo % 2;
    nuevo = Math.max(0, Math.min(paginas.length - 1, nuevo));
    dir = dir || Math.sign(nuevo - actual);
    if (!dir || nuevo === actual) return;
    if (quieto) { colocar(nuevo); return; }
    animando = true;
    const hoja = document.createElement('div');
    const frente = document.createElement('div'), dorso = document.createElement('div');
    frente.className = 'hoja-cara hoja-frente'; dorso.className = 'hoja-cara hoja-dorso';
    if (una) {
      hoja.className = 'hoja hoja-una ' + (dir > 0 ? 'va' : 'vuelve');
      frente.append(clon(paginas[actual]));
      hoja.append(frente);
      colocar(nuevo);
    } else if (dir > 0) {
      hoja.className = 'hoja hoja-der';
      frente.append(clon(paginas[actual + 1])); dorso.append(clon(paginas[nuevo]));
      hoja.append(frente, dorso);
      [...der.children].forEach(p => almacen.append(p));
      if (paginas[nuevo + 1]) { der.append(paginas[nuevo + 1]); prestar(paginas[nuevo + 1]); despertarHadas(paginas[nuevo + 1]); paginas[nuevo + 1].scrollTop = 0; }
    } else {
      hoja.className = 'hoja hoja-izq';
      frente.append(clon(paginas[actual])); dorso.append(clon(paginas[nuevo + 1]));
      hoja.append(frente, dorso);
      [...izq.children].forEach(p => almacen.append(p));
      izq.append(paginas[nuevo]); prestar(paginas[nuevo]); despertarHadas(paginas[nuevo]); paginas[nuevo].scrollTop = 0;
    }
    cuerpo.append(hoja);
    if (hada && window.Magia) hada.hechizo();
    requestAnimationFrame(() => requestAnimationFrame(() => hoja.classList.add('gira')));
    const fin = () => { hoja.remove(); if (!una) colocar(nuevo); animando = false; };
    hoja.addEventListener('transitionend', e => { if (e.target === hoja) fin(); }, { once: true });
    setTimeout(() => { if (hoja.isConnected) fin(); }, 1400);
    if (window.Magia) { const r = libro.getBoundingClientRect(); Magia.chispas(r.left + r.width / 2, r.top + r.height * .15, { n: 10, vel: 2.4 }); }
  }
  const pasar = d => ir(actual + d * (una ? 1 : 2), d);

  // ------------------------------------------------------------ abrir el libro
  function abrir() {
    if (abierto) return;
    abierto = true; tapa.disabled = true;
    libro.classList.remove('espera-emblema'); document.querySelector('.dragon-portada')?.remove(); libro.querySelector('.tapa-transforma')?.remove();
    $('#escena-pista').classList.add('fuera');
    colocar(Number(leer('mce-pagina-ir') || 0));
    libro.dataset.estado = 'abriendo';
    if (window.Magia) { const r = tapa.getBoundingClientRect(); Magia.chispas(r.left + r.width * .5, r.top + r.height * .45, { n: 60, vel: 6 }); }
    setTimeout(() => { libro.dataset.estado = 'abierto'; escena.classList.add('leyendo'); posarHada(); }, quieto ? 0 : 1500);
    setTimeout(() => { tapa.hidden = true; }, quieto ? 0 : 1600);
  }
  tapa.addEventListener('click', () => { if (hada && !abierto) hada.hechizo(); abrir(); });

  // ------------------------------------------------------------ el hada vuela hasta el libro
  function crearHada() {
    if (hada || !window.Magia) return;
    hada = new Magia.Hada($('#hada-escena'), { hechizoCada: 0 });
    $('#hada-escena').addEventListener('click', () => hada.hechizo());
  }
  function volar(el, puntos, dur) {
    return new Promise(fin => {
      if (quieto) { const p = puntos[puntos.length - 1]; el.style.transform = `translate(${p[0]}px,${p[1]}px)`; fin(); return; }
      const t0 = performance.now();
      const bez = (t, a, b, c, d) => { const u = 1 - t; return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d; };
      (function paso(ahora) {
        let t = Math.min(1, (ahora - t0) / dur); const e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const x = bez(e, puntos[0][0], puntos[1][0], puntos[2][0], puntos[3][0]), y = bez(e, puntos[0][1], puntos[1][1], puntos[2][1], puntos[3][1]);
        const flot = Math.sin(ahora / 180) * 6;
        el.style.transform = `translate(${x}px,${y + flot}px) rotate(${(1 - e) * -10}deg)`;
        const r = el.getBoundingClientRect();
        if (window.Magia && r.width) Magia.estela(r.left + r.width * .5, r.top + r.height * .6, { n: 2 });
        if (t < 1) requestAnimationFrame(paso); else fin();
      })(performance.now());
    });
  }
  function posarHada() {
    const el = $('#hada-escena'); if (!el) return;
    el.classList.add('posada');
    const w = el.offsetWidth, h = el.offsetHeight;
    const r = libro.getBoundingClientRect();
    const nav = $('#libro-nav').getBoundingClientRect();
    const x = una ? 2 : (r.left > w * .9 ? r.left - w * .9 : Math.max(4, nav.left - w - 6)), y = una ? innerHeight - h - 4 : (r.left > w * .9 ? r.bottom - h : innerHeight - h - 2);
    const m = (el.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px/) || [0, x, y]).slice(1).map(Number);
    volar(el, [m, [m[0] - 40, m[1] - 80], [x + 30, y - 60], [x, y]], 1200);
  }

  // seis dibujos: el dragón aislado, cuatro etapas y el emblema rosado de la portada
  const FOTOGRAMAS = [0, 1, 2, 3, 4, 5].map(i => `assets/portada/dragon-logo-${i}.webp`), PAUSAS = [420, 300, 300, 300, 300];
  // el dragón rosa vuela desde la izquierda, se posa sobre la portada y se convierte en el emblema
  async function dragonPortada() {
    FOTOGRAMAS.forEach(src => { new Image().src = src; });   // precarga para que la transformación no parpadee
    const emblema = libro.querySelector('.tapa-emblema');
    if (quieto || !emblema) { libro.classList.remove('espera-emblema'); return; }
    const d = document.createElement('div'); d.className = 'dragon-portada'; d.setAttribute('aria-hidden', 'true');
    document.body.append(d);
    const r = emblema.getBoundingClientRect(), esc = r.width * .95 / 254;
    const meta = [r.left + r.width / 2 - 127, r.top + r.height / 2 - 120 - r.height * .04];
    const ini = [-300, innerHeight * .25];
    const ctrl = [[innerWidth * .18, innerHeight * .02], [meta[0] - 160, meta[1] - 190]];
    await new Promise(fin => {
      const t0 = performance.now(), dur = 2100;
      const bez = (t, a, b, c, e) => { const u = 1 - t; return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * e; };
      (function paso(ahora) {
        if (abierto) { fin(); return; }
        const t = Math.min(1, (ahora - t0) / dur), e = 1 - Math.pow(1 - t, 3);
        const x = bez(e, ini[0], ctrl[0][0], ctrl[1][0], meta[0]), y = bez(e, ini[1], ctrl[0][1], ctrl[1][1], meta[1]);
        // el sprite mira a la izquierda: se refleja porque vuela hacia la derecha
        d.style.transform = `translate(${x}px,${y + Math.sin(ahora / 160) * 5 * (1 - t)}px) scale(${-esc * (1.25 - .25 * e)},${esc * (1.25 - .25 * e)})`;
        if (window.Magia && t < .95) Magia.estela(x + 127, y + 150, { n: 2 });
        if (t < 1) requestAnimationFrame(paso); else fin();
      })(t0);
    });
    if (abierto) { d.remove(); return; }
    // se posa: cuadro sentado y un pequeño rebote
    d.classList.add('posado');
    await espera(650);
    if (abierto) { d.remove(); return; }
    // brilla y se funde con el primer dibujo; luego se transforma, etapa por etapa, en el emblema
    d.classList.add('brilla');
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    if (window.Magia) Magia.chispas(cx, cy, { n: 50, vel: 4 });
    await espera(380);
    if (abierto) { d.remove(); return; }
    const caja = document.createElement('span'); caja.className = 'tapa-transforma'; caja.setAttribute('aria-hidden', 'true');
    Object.assign(caja.style, { left: emblema.offsetLeft + 'px', top: emblema.offsetTop + 'px', width: emblema.offsetWidth + 'px', height: emblema.offsetHeight + 'px' });
    const fotos = FOTOGRAMAS.map(src => { const im = new Image(); im.src = src; im.alt = ''; caja.append(im); return im; });
    emblema.parentElement.append(caja);
    fotos[0].classList.add('ve'); d.classList.add('se-va');
    for (let i = 1; i < fotos.length; i++) {
      await espera(PAUSAS[i - 1]);
      if (abierto) { caja.remove(); d.remove(); return; }
      fotos[i].classList.add('ve'); fotos[i - 1].classList.add('sale');
      if (window.Magia) Magia.chispas(cx, cy, { n: i === fotos.length - 1 ? 60 : 16, vel: i === fotos.length - 1 ? 5 : 2.6 });
    }
    await espera(700);
    libro.classList.remove('espera-emblema');   // el emblema de la tapa ya es el logo rosado
    caja.remove(); d.remove();
  }

  async function escenaInicial() {
    if (empezo) return; empezo = true;
    escena.classList.add('activa');
    await espera(80);
    escena.classList.add('estela-pasa');
    // la estela cruza el cielo y deja polvo de estrellas
    if (window.Magia && !quieto) {
      const t0 = performance.now();
      (function polvo(t) { const k = (t - t0) / 1100; if (k > 1) return; const x = -60 + k * (innerWidth + 120), y = innerHeight * (.18 + .5 * k * k); Magia.chispas(x, y, { n: 4, vel: 1.6, tam: 4 }); requestAnimationFrame(polvo); })(t0);
    }
    await espera(700);
    libro.classList.add('espera-emblema', 'aparece');
    await espera(900);
    await dragonPortada();
    if (abierto) return;
    await espera(250);
    crearHada();
    const el = $('#hada-escena');
    if (!el || !hada) { $('#escena-pista').classList.add('visible'); return; }
    const r = libro.getBoundingClientRect(), w = el.offsetWidth, h = el.offsetHeight;
    const fx = Math.min(innerWidth - w - 8, r.right - w * .35), fy = Math.max(6, r.top - h * .35);
    el.classList.add('vuela');
    await volar(el, [[innerWidth + 40, -h], [innerWidth * .9, innerHeight * .55], [fx + 180, fy - 120], [fx, fy]], 2300);
    if (abierto) return;
    el.classList.remove('vuela');
    $('#escena-pista').classList.add('visible');
    await espera(350);
    if (abierto) return;
    await hada.hechizo(() => abrir());
  }

  // ------------------------------------------------------------ modos
  function aClasico(hash) {
    devolver();
    escena.classList.remove('activa', 'leyendo'); escena.classList.add('oculta');
    escena.setAttribute('aria-hidden', 'true');
    site.classList.add('ready'); site.setAttribute('aria-hidden', 'false');
    document.body.classList.remove('bloqueado');
    guardar('mce-modo', 'clasico');
    // el hada pinta el reino de fondo (no si se llega directo a una sección)
    window.MCEReino?.mostrar(!hash);
    if (hash && document.querySelector(hash)) document.querySelector(hash).scrollIntoView();
    else scrollTo(0, 0);
    $('#nombre-principal')?.focus({ preventScroll: true });
  }
  function aLibro(pagina) {
    escena.classList.remove('oculta'); escena.setAttribute('aria-hidden', 'false');
    document.body.classList.add('bloqueado');
    site.setAttribute('aria-hidden', 'true');
    guardar('mce-modo', 'libro');
    if (!empezo) { if (pagina != null) guardar('mce-pagina-ir', String(pagina)); escenaInicial(); return; }
    escena.classList.add('activa');
    if (!abierto) { if (pagina != null) guardar('mce-pagina-ir', String(pagina)); abrir(); return; }
    colocar(pagina != null ? pagina : actual);
    if (escena.classList.contains('leyendo')) posarHada();
  }

  // botones del libro y de las páginas
  escena.addEventListener('click', e => {
    const irA = e.target.closest('[data-ir]'), modo = e.target.closest('[data-modo]');
    if (irA && abierto) { e.preventDefault(); ir(Number(irA.dataset.ir)); }
    if (modo && modo.dataset.modo === 'clasico') { e.preventDefault(); aClasico(); }
  });
  $('#libro-prev').addEventListener('click', () => pasar(-1));
  $('#libro-next').addEventListener('click', () => pasar(1));
  $('#libro-indice').addEventListener('click', () => ir(una ? 1 : 0));
  $('#libro-clasico').addEventListener('click', () => aClasico());
  $('#abrir-cuento').addEventListener('click', () => aLibro(una ? 1 : 0));

  // esquinas para pasar la página
  ['prev', 'next'].forEach(d => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'doblez doblez-' + d;
    b.setAttribute('aria-label', d === 'next' ? 'Pasar la página' : 'Volver una página'); b.tabIndex = -1;
    b.addEventListener('click', () => pasar(d === 'next' ? 1 : -1)); cuerpo.append(b);
  });

  // teclado y gesto de deslizar
  addEventListener('keydown', e => {
    if (!escena.classList.contains('activa') || escena.classList.contains('oculta')) return;
    if (e.target.closest('input,select,textarea,canvas,[contenteditable],.calc-magica,.match-grid,.constellation-board') || document.querySelector('dialog[open]')) return;
    if (!abierto && (e.key === 'Enter' || e.key === ' ') && e.target === document.body) { e.preventDefault(); abrir(); }
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); pasar(1); }
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); pasar(-1); }
  });
  let x0 = null, y0 = 0;
  cuerpo.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse' || e.target.closest('.ranura,button,a,input,select')) { x0 = null; return; } x0 = e.clientX; y0 = e.clientY; });
  cuerpo.addEventListener('pointerup', e => { if (x0 == null) return; const dx = e.clientX - x0, dy = e.clientY - y0; if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) pasar(dx < 0 ? 1 : -1); x0 = null; });

  // ------------------------------------------------------------ arranque
  function arrancar() {
    const hash = location.hash && location.hash.length > 1 ? location.hash : null;
    const modo = leer('mce-modo');
    if (hash && hash !== '#inicio' && document.querySelector(hash)) { aClasico(hash); return; }
    if (modo === 'clasico') { aClasico(); return; }
    if (modo === 'libro') {
      guardar('mce-pagina-ir', leer('mce-pagina') || '0');
      escena.classList.add('activa'); empezo = true; crearHada(); libro.classList.add('aparece');
      abrir(); return;
    }
    escenaInicial();
  }
  function cuandoListo() {
    if (raiz.classList.contains('con-intro')) addEventListener('mce-intro-fin', arrancar, { once: true });
    else arrancar();
  }
  if (document.readyState === 'complete') cuandoListo(); else addEventListener('load', cuandoListo, { once: true });
  window.MCELibro = { ir, pasar, aClasico, aLibro, abrir };
})();
