/* ==========================================================================
   Versión clásica por escenas: la página deja de desplazarse hacia abajo.
   Cada giro de la rueda (o flecha abajo / AvPág) pasa a la escena siguiente;
   las piezas aparecen con suavidad (sin estirarse). Algunas escenas tienen pasos
   internos (pestañas de desarrollo y juegos). Al entrar a las secciones grandes
   pasa el hada volando desde la esquina superior derecha a la inferior izquierda
   y, detrás de su varita, dibuja la escena siguiente sobre la actual con brillos
   y estrellas. Los nodos de la página se mueven (no se copian), así la
   calculadora, la caja, el oráculo y los juegos siguen funcionando.
   Solo en escritorio con mouse; ?normal vuelve a la página con scroll.
   ========================================================================== */
(() => {
  const raiz = document.documentElement;
  const apto = matchMedia('(pointer: fine)').matches && innerWidth >= 1000 && !matchMedia('(prefers-reduced-motion: reduce)').matches
    && !/[?&]normal\b/.test(location.search) && window.gsap;
  if (!apto) return;
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const main = $('#site main'), site = $('#site'), reino = $('#reino');
  if (!main || !site) return;
  raiz.classList.add('escenas');

  // ---------------------------------------------------------- piezas
  const velo = document.createElement('div'); velo.className = 'escenas-velo'; main.append(velo);   // oscurece el reino detrás del contenido
  const capa = document.createElement('div'); capa.className = 'escenas-capa'; main.append(capa);
  const crear = (clase, ...nodos) => {
    const ev = document.createElement('div'); ev.className = 'ev ' + clase;
    const caja = document.createElement('div'); caja.className = 'ev-caja';
    nodos.flat().filter(Boolean).forEach(n => caja.append(n));
    ev.append(caja); capa.append(ev); return ev;
  };
  const W = () => innerWidth;
  const de = (sel, s) => $(sel, $(s));
  const cabeza = id => de('.section-head', id);
  // apariciones suaves: sube un poco y se aclara, o llega de un costado
  const sube = (tl, x, pos, o = {}) => tl.from(x, { opacity: 0, y: 26, duration: .55, stagger: .1, ease: 'power2.out', ...o }, pos);
  const lado = (tl, x, d, pos, o = {}) => tl.from(x, { opacity: 0, x: d * 60, duration: .6, stagger: .12, ease: 'power2.out', ...o }, pos);
  const crece = (tl, x, pos, o = {}) => tl.from(x, { opacity: 0, scale: .94, duration: .5, stagger: .07, ease: 'power2.out', ...o }, pos);

  const E = [];
  // ---------------------------------------------------------- 1. inicio
  const inicio = $('#inicio');
  E.push({
    id: 'inicio', ev: crear('ev-inicio', inicio),
    entrar(tl, ev, dir) { if (dir < 0) { lado(tl, $('.hero-copy', ev), -1); sube(tl, $('.fairy-stage', ev), '<.1'); } },
  });

  // ---------------------------------------------------------- 2-4. Studios Conari
  const est = '#estudio';
  E.push({
    id: 'estudio', ev: crear('ev-estudio', cabeza(est), de('.studio-hero', est)),
    entrar(tl, ev) {
      sube(tl, $$('.section-head > *', ev));
      lado(tl, $('.studio-brand-card', ev), -1, '-=.2');
      crece(tl, $('.studio-visual', ev), '<.1', { duration: .7 });
    },
  });
  E.push({
    id: 'servicios', ev: crear('ev-servicios', de('.service-gallery', est), de('.service-more', est)),
    entrar(tl, ev) { sube(tl, $$('.service-gallery article', ev)); sube(tl, $$('.service-more article', ev), '-=.2'); },
  });
  E.push({
    id: 'equipo', ev: crear('ev-equipo', de('.studio-team', est)),
    entrar(tl, ev) {
      sube(tl, $$('.studio-team > div:first-child > *', ev));
      sube(tl, $$('.role-node', ev), '-=.2', { stagger: .15 });
      tl.from($('.team-outcome', ev), { opacity: 0, duration: .5 });
    },
  });

  // ---------------------------------------------------------- 5. desarrollo: un proyecto por paso (las mismas pestañas)
  const dev = '#desarrollo', tabsDev = $$('.dev-tab', $(dev)), panelesDev = $$('.dev-panel', $(dev));
  E.push({
    id: 'desarrollo', hada: 'Desarrollo', ev: crear('ev-desarrollo', cabeza(dev), de('.dev-tabs', dev), panelesDev),
    pasos: tabsDev.length, tabs: tabsDev,
    entrar(tl, ev) { sube(tl, $$('.section-head > *', ev)); sube(tl, tabsDev, '-=.2', { duration: .35, stagger: .06 }); this.paso(tl, 0, 1, true); },
    paso(tl, i, dir, primero) { pasarPestana(tl, this, i, dir, primero, panelesDev); },
  });

  // ---------------------------------------------------------- 6-8. diseño e ilustración
  const dis = '#diseno';
  E.push({
    id: 'diseno', hada: 'Diseño e ilustración', ev: crear('ev-diseno', cabeza(dis), de('.art-context', dis), de('.art-controls', dis), de('.art-compare', dis), de('.art-credit', dis)),
    entrar(tl, ev) {
      sube(tl, $$('.section-head > *', ev));
      sube(tl, [$('.art-context', ev), ...$$('.art-controls .btn', ev)], '-=.2', { stagger: .06 });
      lado(tl, $('.art-card', ev), -1, '-=.1'); lado(tl, $('.art-card.digital', ev), 1, '<');
      crece(tl, $('.art-arrow', ev), '-=.2');
      tl.from($('.art-credit', ev), { opacity: 0, duration: .4 });
    },
  });
  E.push({
    id: 'leyendas', ev: crear('ev-leyendas', $('#leyendas')),
    entrar(tl, ev) { sube(tl, $$('.leyendas-cabeza > *', ev)); crece(tl, $$('.leyendas-grid > *', ev).slice(0, 16), '-=.2', { stagger: .04 }); tl.from($('.leyendas-aviso', ev), { opacity: 0, duration: .4 }, '-=.2'); },
  });
  E.push({
    id: 'historia', ev: crear('ev-historia', de('.design-story', dis)),
    entrar(tl, ev) {
      tl.from($('.fairy-design', ev), { opacity: 0, x: -50, y: -30, duration: .9, ease: 'power2.out' });
      sube(tl, $$('.design-story > div:last-child > :not(.creative-journey)', ev), '-=.5');
      sube(tl, $$('.journey-step', ev), '-=.2', { stagger: .1 });
    },
  });

  // ---------------------------------------------------------- 9. datos: el oráculo
  const dat = '#datos';
  E.push({
    id: 'datos', ev: crear('ev-datos', cabeza(dat), $('#oraculo')),
    entrar(tl, ev) {
      sube(tl, $$('.section-head > *', ev));
      lado(tl, $('.oraculo-form', ev), -1, '-=.2'); lado(tl, $('.oraculo-viz', ev), 1, '<.1');
      crece(tl, $$('.oraculo-kpis > *', ev), '-=.2');
    },
  });

  // ---------------------------------------------------------- 10-11. trayectoria
  const tra = '#trayectoria', explic = $$('.transition-explanation', $(tra));
  E.push({
    id: 'trayectoria', hada: 'Trayectoria', ev: crear('ev-trayectoria', cabeza(tra), de('.vida-tira', tra), explic[0], de('.transition-path', tra), explic[1]),
    entrar(tl, ev) {
      sube(tl, $$('.section-head > *', ev));
      sube(tl, $$('.vida-tira figure', ev), '-=.2', { stagger: .06, duration: .45 });
      tl.from(explic[0], { opacity: 0, duration: .4 }, '-=.2');
      lado(tl, $$('.transition-path > *', ev), 1, undefined, { stagger: .06, duration: .4 });
      tl.from(explic[1], { opacity: 0, duration: .4 });
    },
  });
  E.push({
    id: 'salud', ev: crear('ev-salud', $('#salud-card')),
    entrar(tl, ev) { crece(tl, $('.health-card', ev), 0, { duration: .6 }); sube(tl, $$('.health-card > div > *', ev), '-=.3'); },
  });

  // ---------------------------------------------------------- 12. formación
  const form = '#formacion';
  E.push({
    id: 'formacion', ev: crear('ev-formacion', cabeza(form), de('.credential-gallery', form), de('.cv-cta', form)),
    entrar(tl, ev) { sube(tl, $$('.section-head > *', ev)); sube(tl, $$('.credential-gallery article', ev), '-=.2', { stagger: .1 }); sube(tl, $('.cv-cta', ev), '-=.1'); },
  });

  // ---------------------------------------------------------- 13. arcade: un juego por paso
  const arc = '#arcade', tabsJ = $$('.game-tab', $(arc)), panelesJ = $$('.game-panel', $(arc));
  E.push({
    id: 'arcade', hada: 'Arcade mágico', ev: crear('ev-arcade', cabeza(arc), $('#arcade-zona')),
    pasos: tabsJ.length, tabs: tabsJ,
    entrar(tl, ev) { sube(tl, $$('.section-head > *', ev)); sube(tl, tabsJ, '-=.2', { duration: .35, stagger: .06 }); this.paso(tl, 0, 1, true); },
    paso(tl, i, dir, primero) { pasarPestana(tl, this, i, dir, primero, panelesJ); },
  });

  // ---------------------------------------------------------- 14. contacto
  const pie = $('#site > footer');
  E.push({
    id: 'contacto', ev: crear('ev-contacto', $('#contacto'), pie),
    entrar(tl, ev) {
      sube(tl, $$('#contacto .wrap > :not(.contact-buttons)', ev));
      sube(tl, $$('.contact-buttons a', ev), '-=.2', { stagger: .08 });
      tl.from(pie, { opacity: 0, duration: .5 }, '-=.2');
    },
  });

  // las pestañas (desarrollo y juegos) se cambian con un fundido y un leve deslizamiento
  function pasarPestana(tl, e, i, dir, primero, paneles) {
    const tab = e.tabs[i], nuevo = paneles[i], viejo = paneles.find(p => p.classList.contains('active') && p !== nuevo);
    const activar = () => { if (!tab.classList.contains('active')) { sincronizando = true; tab.click(); sincronizando = false; } };
    if (primero || !viejo) { tl.call(activar); sube(tl, nuevo, '-=.1', { duration: .6 }); return; }
    tl.to(viejo, { opacity: 0, x: -dir * 40, duration: .3, ease: 'power2.in' })
      .set(viejo, { clearProps: 'transform,opacity' })
      .call(activar)
      .fromTo(nuevo, { opacity: 0, x: dir * 40 }, { opacity: 1, x: 0, duration: .45, ease: 'power2.out' })
      .call(() => ajustar(e));
  }
  // si se elige una pestaña con el mouse, la escena sabe en qué paso quedó
  let sincronizando = false;
  E.filter(e => e.tabs).forEach(e => e.tabs.forEach((t, k) => t.addEventListener('click', () => {
    if (sincronizando || E[actual] !== e) return;
    paso = k; requestAnimationFrame(() => ajustar(e));
  })));

  // ---------------------------------------------------------- el hada que dibuja la escena siguiente
  const magia = document.createElement('div'); magia.className = 'hechizo-paso'; magia.setAttribute('aria-hidden', 'true');
  magia.innerHTML = '<div class="hechizo-brillo"></div><p class="hechizo-nombre"></p><img class="hechizo-hada" src="assets/hada-hechizo-3.webp" alt="">';
  document.body.append(magia);
  const brillo = $('.hechizo-brillo', magia), nombreHada = $('.hechizo-nombre', magia), hadaImg = $('.hechizo-hada', magia);
  const HADA_ALTO = 210, PUNTA = [30 / 360, 372 / 480];             // la punta de la varita dentro de la imagen
  const ESTRELLAS = ['✦', '✧', '⋆', '✶', '★'];
  function estrella(x, y) {
    const s = document.createElement('i'); s.className = 'hechizo-estrella'; s.textContent = ESTRELLAS[Math.random() * ESTRELLAS.length | 0];
    s.style.cssText = `left:${x}px;top:${y}px;--t:${(10 + Math.random() * 18).toFixed(0)}px;--g:${(Math.random() * 360) | 0}deg;--c:${['#fff', '#ffd9ea', '#f5a8cf', '#f3d48a', '#d9c4ff'][Math.random() * 5 | 0]}`;
    magia.append(s); setTimeout(() => s.remove(), 1500);
  }
  // r = avance del dibujo (0: esquina superior derecha, 100: inferior izquierda). La línea que separa
  // lo dibujado de lo que falta es perpendicular al vuelo; detrás del hada ya está la escena nueva.
  function hechizo(viejo, nuevo, texto, alFin) {
    const w = W(), h = innerHeight, larga = Math.hypot(w, h);
    const ancho = HADA_ALTO * .75;
    magia.style.visibility = 'visible'; nombreHada.textContent = texto || '';
    nuevo.classList.add('revela'); viejo.classList.add('queda');
    nuevo.style.setProperty('--r', -12); viejo.style.setProperty('--r', -12);
    const obj = { r: -12 }; let ultima = 0;
    gsap.set(nombreHada, { opacity: 0, scale: .9 });
    const tl = gsap.timeline({ onComplete: () => {
      nuevo.classList.remove('revela'); viejo.classList.remove('queda'); nuevo.style.removeProperty('--r'); viejo.style.removeProperty('--r');
      magia.style.visibility = 'hidden'; alFin && alFin();
    } });
    tl.to(obj, { r: 112, duration: 2.1, ease: 'sine.inOut', onUpdate() {
      const r = obj.r;
      [nuevo, viejo, brillo].forEach(el => el.style.setProperty('--r', r.toFixed(2)));
      // la punta de la varita va por la diagonal, con un vaivén suave de vuelo
      const s = Math.min(1.1, Math.max(-.1, r / 100)), ola = Math.sin(s * Math.PI * 3) * 22;
      const px = w * (1 - s) + ola * (h / larga), py = h * s + ola * (w / larga);
      hadaImg.style.transform = `translate(${(px - ancho * PUNTA[0]).toFixed(1)}px, ${(py - HADA_ALTO * PUNTA[1]).toFixed(1)}px) rotate(${(Math.sin(s * 9) * 4).toFixed(1)}deg)`;
      // destellos en la varita y estrellas que caen a lo largo del borde que se va dibujando
      if (window.Magia) Magia.estela(px, py, { n: 3, colores: ['#fff', '#ffd9ea', '#f5a8cf', '#f3d48a', '#d9c4ff'] });
      const ahora = performance.now();
      if (ahora - ultima > 45 && s > 0 && s < 1) {
        ultima = ahora;
        for (let k = 0; k < 2; k++) {
          const u = (Math.random() - .5) * 1.4;                     // un punto al azar sobre la línea del borde
          const x = px + u * w * .5, y = py + u * h * .5;
          if (x > -20 && x < w + 20 && y > -20 && y < h + 20) estrella(x, y);
        }
      }
    } })
      .to(nombreHada, { opacity: 1, scale: 1, duration: .5, ease: 'power2.out' }, .7)
      .to(nombreHada, { opacity: 0, duration: .5 }, 1.75)
      .fromTo(nuevo.firstElementChild, { filter: 'grayscale(.85) brightness(1.35) contrast(.85)' }, { filter: 'grayscale(0) brightness(1) contrast(1)', duration: 1.1, ease: 'power1.inOut', clearProps: 'filter' }, .9);
    if (window.Magia) tl.call(() => Magia.chispas(30, innerHeight - 40, { n: 40, vel: 5 }), null, 2.05);
    return tl;
  }

  // ---------------------------------------------------------- índice lateral: una estrella por escena
  const NOMBRE = { inicio: 'Inicio', estudio: 'Studios Conari', servicios: 'Servicios', equipo: 'El equipo', desarrollo: 'Desarrollo', diseno: 'Diseño e ilustración', leyendas: 'Leyendas dibujadas', historia: 'Por qué dibuja', datos: 'Datos', trayectoria: 'Trayectoria', salud: 'Matrona', formacion: 'Formación', arcade: 'Arcade mágico', contacto: 'Contacto' };
  const SECCION = ['inicio', 'estudio', 'desarrollo', 'diseno', 'datos', 'trayectoria', 'formacion', 'arcade', 'contacto'];
  const indice = document.createElement('nav'); indice.className = 'escenas-indice'; indice.setAttribute('aria-label', 'Escenas');
  E.forEach((e, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', NOMBRE[e.id]); b.dataset.nombre = NOMBRE[e.id];
    if (SECCION.includes(e.id)) b.classList.add('seccion');
    b.addEventListener('click', () => irA(i)); indice.append(b);
  });
  document.body.append(indice);
  const pistaRueda = document.createElement('div'); pistaRueda.className = 'escenas-pista'; pistaRueda.setAttribute('aria-hidden', 'true'); pistaRueda.innerHTML = '<span></span>';
  document.body.append(pistaRueda);

  // ---------------------------------------------------------- ajuste a la pantalla: si no cabe, se reduce; si aún no cabe, scroll interno
  const barra = () => { const t = $('.topbar', site); return t ? Math.round(t.getBoundingClientRect().bottom) : 70; };
  function ajustar(e) {
    if (!e) return;
    capa.style.top = barra() + 'px';
    const caja = e.ev.firstElementChild;
    caja.style.zoom = ''; e.ev.classList.remove('desborda');
    const disp = e.ev.clientHeight - 70, alto = caja.scrollHeight;   // margen para la pista de la rueda
    if (alto > disp) {
      const k = Math.max(.62, disp / alto); caja.style.zoom = k.toFixed(3);
      if (caja.scrollHeight * k > disp + 2) e.ev.classList.add('desborda');
    }
  }
  addEventListener('resize', () => ajustar(E[actual]));
  let ajustando = false;
  const ro = new ResizeObserver(() => {
    if (ajustando) return;
    requestAnimationFrame(() => { ajustando = true; ajustar(E[actual]); requestAnimationFrame(() => { ajustando = false; }); });
  });
  ['#lab-viz', '#leyendas-grid', '.creative-journey', '#arcade-zona', '#m7-galeria', '#printer-output'].forEach(s => { const n = $(s); if (n) ro.observe(n); });
  $$('img', capa).forEach(img => {                 // las imágenes diferidas cambian el alto al cargar
    img.loading = 'eager';
    if (!img.complete) img.addEventListener('load', () => { if (img.closest('.ev.activa')) requestAnimationFrame(() => ajustar(E[actual])); }, { once: true });
  });

  // ---------------------------------------------------------- navegación
  let actual = 0, paso = 0, ocupado = false, tlEntrada = null;
  const objetivos = tl => [...new Set(tl.getChildren(true, true, false).flatMap(t => t.targets()))].filter(t => t instanceof Element);
  const marcarMenu = e => {
    const zona = { servicios: 'estudio', equipo: 'estudio', leyendas: 'diseno', historia: 'diseno', salud: 'trayectoria' }[e.id] || e.id;
    $$('.topbar nav a, .topbar .mini-cta').forEach(a => a.classList.toggle('activo', a.getAttribute('href') === '#' + zona));
  };
  function mostrar(e) {
    E.forEach(x => x.ev.classList.toggle('activa', x === e));
    $$('button', indice).forEach((b, i) => b.classList.toggle('activo', E[i] === e));
    velo.classList.toggle('visible', e.id !== 'inicio');
    if (reino) reino.style.setProperty('--scroll', e.id === 'inicio' ? '0' : '1');
    pistaRueda.classList.toggle('oculta', e.id === 'contacto');
    marcarMenu(e);
    e.ev.scrollTop = 0; ajustar(e);
  }
  function entrar(e, dir, pasoInicial) {
    e.ev.classList.add('animando');
    const tl = gsap.timeline();
    if (e.pasos) {                                    // al volver desde abajo, se entra en el último paso
      const n = pasoInicial ?? (dir < 0 ? e.pasos - 1 : 0);
      paso = n;
      if (n === 0) e.entrar.call(e, tl, e.ev, dir);
      else e.paso.call(e, tl, n, 1, true);
    } else { paso = 0; e.entrar.call(e, tl, e.ev, dir); }
    return tl;
  }
  function limpiar(tl) { gsap.set(objetivos(tl).filter(t => capa.contains(t)), { clearProps: 'transform,opacity,visibility,filter' }); }
  // al pasar hacia adelante a una sección grande, o al volver hacia atrás desde una, pasa el hada
  const conHada = (de, a, dir) => dir > 0 ? !!a.hada : !!de.hada;
  function irA(i, pasoInicial) {
    if (ocupado || i === actual || i < 0 || i >= E.length) return;
    ocupado = true;
    const dir = i > actual ? 1 : -1, de = E[actual], a = E[i];
    if (tlEntrada) { tlEntrada.progress(1); limpiar(tlEntrada); tlEntrada = null; }
    if (conHada(de, a, dir)) {
      // la escena nueva queda lista (sin animar sus piezas) y el hada la dibuja encima de la actual
      actual = i; mostrar(a); de.ev.classList.add('activa');
      paso = pasoInicial ?? (dir < 0 && a.pasos ? a.pasos - 1 : 0);
      if (a.tabs) { const t = a.tabs[paso]; if (!t.classList.contains('active')) { sincronizando = true; t.click(); sincronizando = false; } }
      ajustar(a);
      hechizo(de.ev, a.ev, dir > 0 ? a.hada : (seccionDe(i) || NOMBRE[a.id]), () => {
        de.ev.classList.remove('activa'); de.ev.scrollTop = 0; ocupado = false;
      });
      return;
    }
    const sal = gsap.timeline();
    sal.to(de.ev.firstElementChild, { opacity: 0, y: dir > 0 ? -30 : 30, duration: .35, ease: 'power2.in' })
      .call(() => {
        limpiar(sal);
        actual = i; mostrar(a);
        tlEntrada = entrar(a, dir, pasoInicial);
        ajustar(a);
        tlEntrada.eventCallback('onComplete', () => { ocupado = false; a.ev.classList.remove('animando'); });
        gsap.delayedCall(Math.min(1, tlEntrada.duration()), () => { ocupado = false; });   // una entrada larga no bloquea seguir
      });
  }
  // al volver hacia arriba, el nombre que escribe el hada es el de la sección a la que se entra
  function seccionDe(i) { for (let k = i; k >= 0; k--) if (E[k].hada) return E[k].hada; return ''; }
  function irPaso(n) {
    const e = E[actual]; if (!e.pasos || ocupado || n === paso || n < 0 || n >= e.pasos) return;
    ocupado = true;
    const dir = n > paso ? 1 : -1; paso = n;
    e.ev.classList.add('animando');
    const tl = gsap.timeline({ onComplete: () => { ocupado = false; e.ev.classList.remove('animando'); } });
    e.paso.call(e, tl, n, dir, false);
  }
  function avanzar(dir) {
    const e = E[actual];
    if (e.pasos && paso + dir >= 0 && paso + dir < e.pasos) return irPaso(paso + dir);
    irA(actual + dir);
  }
  // salto sin animación (al llegar desde el cuento o con un enlace directo)
  function saltar(i) {
    if (i < 0 || i >= E.length) return;
    if (tlEntrada) { tlEntrada.progress(1); limpiar(tlEntrada); tlEntrada = null; }
    actual = i; paso = 0; ocupado = false; mostrar(E[i]);
    if (E[i].tabs && !E[i].tabs[0].classList.contains('active')) { sincronizando = true; E[i].tabs[0].click(); sincronizando = false; }
  }
  window.MCEEscenas = { irA: n => irA(typeof n === 'string' ? E.findIndex(e => e.id === n) : n), avanzar, saltar: n => saltar(typeof n === 'string' ? E.findIndex(e => e.id === n) : n) };

  // ---------------------------------------------------------- entrada: rueda, teclado y enlaces
  const bloqueada = () => site.getAttribute('aria-hidden') === 'true' || site.classList.contains('pintando') || document.body.classList.contains('bloqueado') || $('dialog[open]');
  let acumulado = 0, ultimaRueda = 0, gestoUsado = false;
  addEventListener('wheel', e => {
    if (bloqueada()) return;
    if (e.target.closest('select') || (e.target.closest('canvas') && document.activeElement === e.target.closest('canvas'))) return;   // jugando con foco, la rueda no cambia de escena
    const ev = E[actual].ev, ahora = performance.now();
    if (ev.classList.contains('desborda')) {          // escena más alta que la pantalla: primero se recorre
      const puede = e.deltaY > 0 ? ev.scrollTop + ev.clientHeight < ev.scrollHeight - 2 : ev.scrollTop > 0;
      if (puede) return;
    }
    const det = e.target.closest('details[open] > div, .table-wrap, .printer-output');   // un recuadro con su propio scroll
    if (det && det.scrollHeight > det.clientHeight + 2) { const puede = e.deltaY > 0 ? det.scrollTop + det.clientHeight < det.scrollHeight - 2 : det.scrollTop > 0; if (puede) return; }
    e.preventDefault();
    if (ahora - ultimaRueda > 220) { gestoUsado = false; acumulado = 0; }   // un gesto nuevo tras una pausa
    ultimaRueda = ahora;
    if (gestoUsado || ocupado) return;                // la inercia del touchpad no encadena escenas
    acumulado += e.deltaY;
    if (Math.abs(acumulado) > 45) { gestoUsado = true; avanzar(acumulado > 0 ? 1 : -1); acumulado = 0; }
  }, { passive: false });
  addEventListener('keydown', e => {
    if (bloqueada() || e.target.closest('input, select, textarea, canvas, .calc-magica, .match-grid, .constellation-board')) return;
    if (['ArrowDown', 'PageDown'].includes(e.key)) { e.preventDefault(); avanzar(1); }
    if (['ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); avanzar(-1); }
    if (e.key === 'Home') { e.preventDefault(); irA(0); }
    if (e.key === 'End') { e.preventDefault(); irA(E.length - 1); }
  });
  const DESTINO = { inicio: 'inicio', estudio: 'estudio', desarrollo: 'desarrollo', diseno: 'diseno', leyendas: 'leyendas', datos: 'datos', trayectoria: 'trayectoria', 'salud-card': 'salud', formacion: 'formacion', arcade: 'arcade', contacto: 'contacto' };
  const indiceDe = id => E.findIndex(e => e.id === id);
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]'); if (!a || !site.contains(a)) return;
    const id = DESTINO[a.getAttribute('href').slice(1)]; if (!id) return;
    e.preventDefault(); $('#main-nav')?.classList.remove('open');
    irA(indiceDe(id));
  }, true);

  // al volver a la versión clásica (desde el cuento o con un enlace a una sección) se muestra la escena que corresponde
  history.scrollRestoration = 'manual';
  new MutationObserver(() => {
    if (site.getAttribute('aria-hidden') !== 'false') return;
    scrollTo(0, 0);
    const id = DESTINO[location.hash.slice(1)];
    saltar(id ? indiceDe(id) : actual);
  }).observe(site, { attributes: true, attributeFilter: ['aria-hidden'] });

  // ---------------------------------------------------------- arranque
  mostrar(E[0]);
  const inicial = DESTINO[location.hash.slice(1)];
  if (inicial && inicial !== 'inicio') saltar(indiceDe(inicial));
})();
