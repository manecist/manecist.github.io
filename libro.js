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
  // En pantalla ancha se ven de a dos (los pliegos anchos ocupan ambas); en el celular, de a una y sin huecos.
  let orden = paginas;
  const esAncha = p => p && p.classList.contains('pagina-ancha');
  const posDe = n => Math.max(0, orden.indexOf(paginas[n]) >= 0 ? orden.indexOf(paginas[n]) : orden.indexOf(paginas[n - 1]));
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mqUna = matchMedia('(max-width: 860px)');
  let una = mqUna.matches, actual = 0, abierto = false, animando = false, hada = null, empezo = false;
  const espera = ms => new Promise(r => setTimeout(r, quieto ? 0 : ms));
  const guardar = (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) { /* sin almacenamiento */ } };
  const leer = k => { try { return sessionStorage.getItem(k); } catch (e) { return null; } };

  // el índice busca la primera página de cada capítulo: agregar páginas no lo desordena
  $$('[data-ir-cap]').forEach(b => {
    const c = b.dataset.irCap, i = paginas.findIndex(p => (p.dataset.cap || '') === c || (p.dataset.cap || '').startsWith(c + ' ·'));
    if (i >= 0) b.dataset.ir = i;
  });
  let num = 0;
  paginas.forEach((p, i) => {
    p.dataset.n = i; if (p.classList.contains('pagina-hueco')) return; num++;
    const f = document.createElement('span'); f.className = 'pagina-num'; f.textContent = i ? String(i) : ''; f.setAttribute('aria-hidden', 'true'); p.append(f);
  });

  // ------------------------------------------------------------ medidas
  function medir() {
    una = mqUna.matches;
    const navH = 64, vw = innerWidth, vh = innerHeight;
    const ph = Math.max(420, Math.min(900, vh - navH - (una ? 22 : 46)));
    const pw = una ? Math.min(vw - 20, 620) : Math.min(660, (vw - 70) / 2, ph * .92);
    libro.style.setProperty('--pw', Math.round(pw) + 'px');
    libro.style.setProperty('--ph', Math.round(ph) + 'px');
    libro.classList.toggle('una', una);
    orden = una ? paginas.filter(p => !p.classList.contains('pagina-hueco')) : paginas;
  }
  medir();
  addEventListener('resize', () => {
    const antes = una, pag = orden[actual]; medir();
    if (abierto && antes !== una) colocar(Math.max(0, orden.indexOf(pag) >= 0 ? orden.indexOf(pag) : orden.indexOf(paginas[Number(pag.dataset.n) - 1])));
    else [...izq.children, ...der.children].forEach(ajustar);
  });

  // ------------------------------------------------------------ préstamo de demostraciones
  const origen = new Map();
  function prestar(p) {
    p.querySelectorAll('.ranura[data-widget]').forEach(r => {
      const w = document.querySelector(r.dataset.widget);
      if (!w || r.contains(w)) return;
      if (!origen.has(w)) { const c = document.createComment('vuelve:' + r.dataset.widget); w.before(c); origen.set(w, c); }
      r.append(w);
      // un desplegable que en el libro tiene su propia página se muestra abierto
      if (r.hasAttribute('data-abierto') && 'open' in w) { if (w.dataset.antes == null) w.dataset.antes = w.open ? '1' : ''; w.open = true; }
    });
  }
  function devolver() {
    origen.forEach((c, w) => { c.replaceWith(w); if (w.dataset.antes != null) { w.open = !!w.dataset.antes; delete w.dataset.antes; } });
    origen.clear();
  }

  function despertarHadas(p) {
    if (!window.Magia) return;
    p.querySelectorAll('.hada-viva').forEach(n => { if (!n._hada) { n._hada = new Magia.Hada(n, { hechizoCada: 6500 }); n.addEventListener('click', () => n._hada.hechizo()); } });
  }

  // ------------------------------------------------------------ colocar páginas
  function colocar(i) {
    i = Math.max(0, Math.min(orden.length - 1, i));
    if (!una) i -= i % 2;
    actual = i;
    [...izq.children, ...der.children].forEach(p => p.classList.contains('clon-bajo') ? p.remove() : almacen.append(p));
    const ancha = !una && esAncha(orden[i]);
    libro.classList.toggle('pliego-ancho', ancha);
    const vis = una || ancha ? [orden[i]] : [orden[i], orden[i + 1]];
    if (una) der.append(vis[0]); else { izq.append(vis[0]); if (vis[1]) der.append(vis[1]); }
    vis.forEach(p => { if (!p) return; prestar(p); despertarHadas(p); ajustar(p); p.scrollTop = 0; });
    vigilar(vis);
    const ref = vis[vis.length - 1] || vis[0];
    const visibles = orden.filter(p => !p.classList.contains('pagina-hueco'));
    const n = visibles.indexOf(vis[0]) + 1;
    folio.textContent = (ref.dataset.cap || '') + ' · ' + n + ' / ' + visibles.length;
    $('#libro-prev').disabled = i === 0;
    $('#libro-next').disabled = i + (una ? 1 : 2) >= orden.length;
    guardar('mce-pagina', ref.dataset.n);
    // pliegos pop-up: el libro entero se acuesta (cámara baja) y los recortes se paran sobre la hoja
    const esPop = vis.some(p => p && p.classList.contains('pagina-pop'));
    // la esquina inferior derecha se dobla un poco: debajo asoma el piso del pliego que viene (o el papel)
    const sig = orden[i + (una ? 1 : 2)];
    libro.classList.toggle('hay-sig', !!sig); libro.classList.remove('invita');
    libro.style.setProperty('--suelo-sig', sig && sig.dataset.suelo ? 'url("' + sig.dataset.suelo + '")' : 'none');
    if (esPop) { libro.classList.add('acostado'); requestAnimationFrame(() => libro.classList.add('pop-listo')); } else libro.classList.remove('acostado', 'pop-listo');
    window.dispatchEvent(new CustomEvent('cuento-paginas', { detail: { paginas: vis.filter(Boolean) } }));
  }

  // si una página no cabe (pantallas bajas o contenido que crece), su contenido se reduce lo justo
  const ZOOM_MIN = .7;
  function ajustar(p) {
    if (!p || !p.isConnected) return;
    const hijos = [...p.children].filter(c => !c.classList.contains('pagina-num'));
    hijos.forEach(c => { c.style.zoom = ''; });
    let f = 1;
    for (let k = 0; k < 3 && p.scrollHeight > p.clientHeight && f > ZOOM_MIN; k++) {
      const cs = getComputedStyle(p), pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
      f = Math.max(ZOOM_MIN, f * (p.clientHeight - pad) / Math.max(1, p.scrollHeight - pad) - .02);
      hijos.forEach(c => { c.style.zoom = f.toFixed(3); });
    }
  }
  let pendiente = 0;
  const vigia = new ResizeObserver(() => { cancelAnimationFrame(pendiente); pendiente = requestAnimationFrame(() => [...izq.children, ...der.children].forEach(ajustar)); });
  function vigilar(vis) { vigia.disconnect(); vis.forEach(p => p && p.querySelectorAll('.ranura, .pagina > *').forEach(n => vigia.observe(n))); }

  // copia visual de una página (sin ids ni foco) para la hoja que gira
  function clon(p, mitadDerecha) {
    if (!p || p.classList.contains('pagina-hueco')) { const v = document.createElement('div'); v.className = 'pagina pagina-vacia'; return v; }
    const c = p.cloneNode(true);
    if (mitadDerecha) c.classList.add('clon-mitad-der');
    c.removeAttribute('id'); c.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
    c.setAttribute('aria-hidden', 'true'); c.inert = true;
    const a = p.querySelectorAll('canvas'), b = c.querySelectorAll('canvas');
    a.forEach((cv, k) => { try { b[k].getContext('2d').drawImage(cv, 0, 0); } catch (e) { /* lienzo vacío */ } });
    const st = p.scrollTop; requestAnimationFrame(() => { c.scrollTop = st; });
    return c;
  }

  // ------------------------------------------------------------ pasar páginas
  let levantando = false;
  function ir(nuevo, dir) {
    if (animando || !abierto) return;
    if (!una) nuevo -= nuevo % 2;
    nuevo = Math.max(0, Math.min(orden.length - 1, nuevo));
    dir = dir || Math.sign(nuevo - actual);
    if (!dir || nuevo === actual) return;
    // si el libro está acostado, los recortes se pliegan y el libro se levanta MIENTRAS gira la hoja
    if (libro.classList.contains('acostado') && !quieto) {
      if (levantando) return;
      levantando = true;
      document.querySelectorAll('.pop-escena.abierta').forEach(e => e.classList.remove('abierta'));
      window.dispatchEvent(new Event('cuento-levanta'));
      setTimeout(() => { levantando = false; libro.classList.remove('acostado', 'pop-listo'); ir(nuevo, dir); }, 280);
      return;
    }
    // el pliego de destino es pop-up: el libro se acuesta mientras gira la hoja (no antes ni después)
    const destino = una ? [orden[nuevo]] : [orden[nuevo], orden[nuevo + 1]];
    const vaPop = destino.some(p => p && p.classList.contains('pagina-pop'));
    libro.classList.remove('pop-listo');
    if (!quieto) libro.classList.toggle('acostado', vaPop);
    libro.classList.remove('hay-sig', 'invita');   // la esquina doblada se esconde mientras gira la hoja
    window.dispatchEvent(new Event('cuento-pasa'));
    if (quieto) { colocar(nuevo); return; }
    animando = true;
    const hoja = document.createElement('div');
    const frente = document.createElement('div'), dorso = document.createElement('div');
    frente.className = 'hoja-cara hoja-frente'; dorso.className = 'hoja-cara hoja-dorso';
    const actAncha = !una && esAncha(orden[actual]), nuevaAncha = !una && esAncha(orden[nuevo]);
    if (una) {
      hoja.className = 'hoja hoja-una ' + (dir > 0 ? 'va' : 'vuelve');
      frente.append(clon(orden[actual]));
      hoja.append(frente);
      colocar(nuevo);
    } else if (dir > 0) {
      hoja.className = 'hoja hoja-der';
      frente.append(actAncha ? clon(orden[actual], true) : clon(orden[actual + 1]));
      dorso.append(clon(orden[nuevo]));
      hoja.append(frente, dorso);
      [...der.children].forEach(p => almacen.append(p));
      if (actAncha) { libro.classList.remove('pliego-ancho'); }
      // pliego ancho de destino: bajo la hoja que gira se ve su mitad derecha (no papel en blanco)
      if (nuevaAncha) { const c = clon(orden[nuevo], true); c.classList.add('clon-bajo'); der.append(c); }
      if (!nuevaAncha && orden[nuevo + 1]) { der.append(orden[nuevo + 1]); prestar(orden[nuevo + 1]); despertarHadas(orden[nuevo + 1]); ajustar(orden[nuevo + 1]); orden[nuevo + 1].scrollTop = 0; }
    } else {
      hoja.className = 'hoja hoja-izq';
      frente.append(clon(orden[actual]));
      dorso.append(nuevaAncha ? clon(orden[nuevo], true) : clon(orden[nuevo + 1]));
      hoja.append(frente, dorso);
      [...izq.children, ...(actAncha ? [] : [])].forEach(p => almacen.append(p));
      if (actAncha) libro.classList.remove('pliego-ancho');
      if (nuevaAncha) { const c = clon(orden[nuevo]); c.classList.add('clon-bajo'); izq.append(c); }
      if (!nuevaAncha) { izq.append(orden[nuevo]); prestar(orden[nuevo]); despertarHadas(orden[nuevo]); ajustar(orden[nuevo]); orden[nuevo].scrollTop = 0; }
    }
    cuerpo.append(hoja);
    if (hada && window.Magia) hada.hechizo();
    requestAnimationFrame(() => requestAnimationFrame(() => hoja.classList.add('gira')));
    const fin = () => { if (!hoja.isConnected) return; hoja.remove(); if (!una) colocar(nuevo); animando = false; };
    hoja.addEventListener('transitionend', e => { if (e.target === hoja) fin(); }, { once: true });
    setTimeout(fin, 1400);
    if (window.Magia) { const r = libro.getBoundingClientRect(); Magia.chispas(r.left + r.width / 2, r.top + r.height * .15, { n: 10, vel: 2.4 }); }
  }
  const pasar = d => ir(actual + d * (una ? 1 : 2), d);

  // ------------------------------------------------------------ abrir el libro
  function abrir() {
    if (abierto) return;
    abierto = true; tapa.disabled = true;
    libro.classList.remove('espera-emblema'); document.querySelector('.dragon-portada')?.remove(); libro.querySelector('.tapa-transforma')?.remove();
    $('#escena-pista').classList.add('fuera');
    colocar(posDe(Number(leer('mce-pagina-ir') || 0)));
    libro.dataset.estado = 'abriendo';
    if (window.Magia) { const r = tapa.getBoundingClientRect(); Magia.chispas(r.left + r.width * .5, r.top + r.height * .45, { n: 60, vel: 6 }); }
    setTimeout(() => { libro.dataset.estado = 'abierto'; escena.classList.add('leyendo'); posarHada(); }, quieto ? 0 : 1750);
    setTimeout(() => { tapa.hidden = true; }, quieto ? 0 : 1800);
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
    const x = una ? 2 : (r.left > w * .9 ? r.left - w * .9 : 6);
    // siempre dentro de la pantalla (con el libro acostado su borde inferior puede quedar más abajo)
    const y = Math.min(innerHeight - h - 4, una ? innerHeight - h - 4 : (r.left > w * .9 ? r.bottom - h : innerHeight - h - 2));
    const m = (el.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px/) || [0, x, y]).slice(1).map(Number);
    el.classList.add('vuela');
    volar(el, [m, [m[0] - 40, m[1] - 80], [x + 30, y - 60], [x, y]], 1200).then(() => el.classList.remove('vuela'));
  }

  // el hada vuela hasta quedar sobre un personaje, le lanza su hechizo desde arriba y vuelve a su lugar
  let hadaEnVuelo = false;
  async function hadaMagia(objetivo, alTocar) {
    const el = $('#hada-escena');
    if (!el || hadaEnVuelo) { alTocar && alTocar(null); return; }
    // si el libro se abrió sin pasar por la portada, el hada aún no existe: se crea y entra volando desde el costado
    if (!hada) crearHada();
    if (!hada || hada.ocupada) { alTocar && alTocar(null); return; }
    hadaEnVuelo = true;
    let m = (el.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px/) || [0, NaN, NaN]).slice(1).map(Number);
    if (isNaN(m[0]) || m[0] > innerWidth || m[0] < -innerWidth) m = [-el.offsetWidth - 40, innerHeight * .45];
    el.classList.add('posada', 'vuela');   // vuela con el mismo tamaño pequeño que tiene en reposo
    const r = objetivo.getBoundingClientRect(), w = el.offsetWidth, h = el.offsetHeight;
    // la punta de la varita (abajo a la izquierda del cuadro al lanzar) queda justo sobre la cabeza
    const x = r.left + r.width * .5 - w * .1, y = r.top - h * .7;
    await volar(el, [m, [m[0] + 160, m[1] - 260], [x + 220, y - 140], [x, y]], quieto ? 0 : 3200);
    el.classList.remove('vuela');
    await hada.hechizo(p => alTocar && alTocar(p));
    hadaEnVuelo = false;
    posarHada();
  }

  // la transformación es un video (Wan 2.2, primer y último cuadro): empieza en el dragón posado y termina en el emblema exacto
  const MORFOSIS = ['assets/portada/dragon-logo.webm', 'assets/portada/dragon-logo.mp4'];
  // el dragón rosa vuela desde la izquierda, se posa sobre la portada y se convierte en el emblema
  async function dragonPortada() {
    // el video se prepara mientras el dragón vuela, para que la transformación no parpadee
    const video = document.createElement('video'); video.className = 'tapa-morfosis'; video.muted = true; video.playsInline = true; video.preload = 'auto'; video.setAttribute('aria-hidden', 'true');
    MORFOSIS.forEach(src => { const f = document.createElement('source'); f.src = src; f.type = src.endsWith('webm') ? 'video/webm' : 'video/mp4'; video.append(f); });
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
    // el dragón mismo se transforma: su cuerpo se enrolla en el anillo y del libro crece el mundo (video sobre la tapa)
    Object.assign(video.style, { left: (emblema.offsetLeft - emblema.offsetWidth * .05) + 'px', top: (emblema.offsetTop - emblema.offsetWidth * .05) + 'px', width: emblema.offsetWidth * 1.1 + 'px', height: emblema.offsetWidth * 1.1 + 'px' });
    emblema.parentElement.append(video);
    const listo = await Promise.race([new Promise(ok => { if (video.readyState >= 3) ok(true); else video.addEventListener('canplaythrough', () => ok(true), { once: true }); video.addEventListener('error', () => ok(false), { once: true }); }), espera(4000).then(() => video.readyState >= 2)]);
    if (abierto) { video.remove(); d.remove(); return; }
    if (!listo || !(await video.play().then(() => true, () => false))) { video.remove(); d.classList.add('se-va'); libro.classList.remove('espera-emblema'); await espera(700); d.remove(); return; }
    video.classList.add('ve'); d.remove();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2, POLVO = ['#ff8fc0', '#ffd9ea', '#f3d48a', '#fff'];
    const chispea = setInterval(() => { if (window.Magia) Magia.estela(cx + (Math.random() - .5) * r.width * .8, cy + (Math.random() - .5) * r.height * .8, { n: 2, colores: POLVO }); }, 90);
    await new Promise(fin => { video.addEventListener('ended', fin, { once: true }); setTimeout(fin, 6000); });
    clearInterval(chispea);
    if (abierto) { video.remove(); return; }
    if (window.Magia) Magia.chispas(cx, cy, { n: 60, vel: 5 });
    libro.classList.remove('espera-emblema');   // el emblema de la tapa ya es el logo rosado (el último cuadro del video es igual)
    await espera(350);
    video.remove();
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
    window.dispatchEvent(new Event('cuento-levanta')); libro.classList.remove('acostado');
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
    colocar(pagina != null ? posDe(pagina) : actual);
    if (escena.classList.contains('leyendo')) posarHada();
  }

  // botones del libro y de las páginas
  escena.addEventListener('click', e => {
    const irA = e.target.closest('[data-ir]'), modo = e.target.closest('[data-modo]');
    if (irA && abierto) { e.preventDefault(); ir(posDe(Number(irA.dataset.ir))); }
    if (modo && modo.dataset.modo === 'clasico') { e.preventDefault(); aClasico(); }
  });
  $('#libro-prev').addEventListener('click', () => pasar(-1));
  $('#libro-next').addEventListener('click', () => pasar(1));
  $('#libro-indice').addEventListener('click', () => ir(posDe(1)));
  $('#libro-clasico').addEventListener('click', () => aClasico());
  $('#abrir-cuento').addEventListener('click', () => aLibro(1));

  // esquinas para pasar la página
  ['prev', 'next'].forEach(d => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'doblez doblez-' + d;
    b.setAttribute('aria-label', d === 'next' ? 'Pasar la página' : 'Volver una página'); b.tabIndex = -1;
    b.addEventListener('click', () => pasar(d === 'next' ? 1 : -1)); cuerpo.append(b);
  });

  // teclado y gesto de deslizar
  addEventListener('keydown', e => {
    if (!escena.classList.contains('activa') || escena.classList.contains('oculta')) return;
    if (e.target.closest('input,select,textarea,canvas,[contenteditable],.calc-magica,.match-grid,.constellation-board,.arcade-zona') || document.querySelector('dialog[open]')) return;
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
  libro.querySelector('.libro-esquina')?.addEventListener('click', () => pasar(1));
  window.MCELibro = { ir, pasar, aClasico, aLibro, abrir, hadaMagia, visibles: () => [...izq.children, ...der.children] };
})();
