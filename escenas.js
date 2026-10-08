/* ==========================================================================
   Versión clásica por escenas: la página deja de desplazarse hacia abajo.
   Cada giro de la rueda (o flecha abajo / AvPág) pasa a la escena siguiente con
   una animación de libro pop-up: las piezas se levantan del papel, se despliegan
   o caen como cartas. Algunas escenas tienen pasos internos (pestañas de
   desarrollo y juegos) y entre secciones se cierra un telón de teatro con el
   nombre de la sección. Los nodos de la página se mueven (no se copian), así la
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
  const W = () => innerWidth, H = () => innerHeight;
  const de = (sel, s) => $(sel, $(s));
  const cabeza = id => de('.section-head', id);
  // se levanta del papel como una pieza de libro pop-up (se abre desde su base)
  const popup = { rotateX: -88, transformOrigin: '50% 100%', transformPerspective: 900, opacity: 0 };

  const E = [];
  // ---------------------------------------------------------- 1. inicio
  const inicio = $('#inicio');
  E.push({
    id: 'inicio', ev: crear('ev-inicio', inicio),
    entrar(tl, ev, dir) {
      if (dir < 0) tl.from($('.hero-copy', ev), { x: -W() * .5, opacity: 0, duration: .7, ease: 'power3.out' })
        .from($('.fairy-stage', ev), { y: 80, opacity: 0, duration: .7, ease: 'power3.out' }, '<.1');
    },
    salir(tl, ev) {                                   // el texto sale por la izquierda y Ari sube volando
      tl.to($('.hero-copy', ev), { x: 30, duration: .25, ease: 'power2.out' })
        .to($('.hero-copy', ev), { x: -W(), opacity: 0, duration: .55, ease: 'power3.in' })
        .to($('.fairy-stage', ev), { y: -H() * .8, opacity: 0, duration: .6, ease: 'power3.in' }, '<.05');
    },
  });

  // ---------------------------------------------------------- 2-4. Studios Conari
  const est = '#estudio';
  E.push({
    id: 'estudio', cortina: 'Studios Conari', ev: crear('ev-estudio', cabeza(est), de('.studio-hero', est)),
    entrar(tl, ev) {
      tl.from($$('.section-head > *', ev), { opacity: 0, y: 24, duration: .5, stagger: .12 })
        .from($('.studio-brand-card', ev), { rotateY: -95, transformOrigin: '0% 50%', transformPerspective: 1400, opacity: 0, duration: .9, ease: 'power3.out' }, '-=.2')
        .from($('.studio-visual', ev), { ...popup, duration: .8, ease: 'back.out(1.4)' }, '-=.5')
        .from($$('.studio-actions .btn', ev), { y: 16, opacity: 0, duration: .4, stagger: .1, ease: 'back.out(2)' }, '-=.3');
    },
  });
  E.push({
    id: 'servicios', ev: crear('ev-servicios', de('.service-gallery', est), de('.service-more', est)),
    entrar(tl, ev) {                                  // los servicios se reparten como cartas sobre la mesa
      const cartas = $$('.service-gallery article', ev);
      tl.from(cartas, { y: -H() * .7, rotate: i => (i % 2 ? 14 : -14), opacity: 0, duration: .7, stagger: .14, ease: 'back.out(1.3)' })
        .from($$('.service-more article', ev), { ...popup, duration: .6, stagger: .15, ease: 'back.out(1.5)' }, '-=.2');
    },
  });
  E.push({
    id: 'equipo', ev: crear('ev-equipo', de('.studio-team', est)),
    entrar(tl, ev) {
      tl.from($$('.studio-team > div:first-child > *', ev), { opacity: 0, x: -40, duration: .45, stagger: .1 })
        .from($$('.role-node', ev), { ...popup, duration: .75, stagger: .22, ease: 'back.out(1.4)' }, '-=.1')
        .from($('.team-outcome', ev), { opacity: 0, y: 16, duration: .5 });
    },
  });

  // ---------------------------------------------------------- 5. desarrollo: un proyecto por paso (las mismas pestañas)
  const dev = '#desarrollo', tabsDev = $$('.dev-tab', $(dev)), panelesDev = $$('.dev-panel', $(dev));
  E.push({
    id: 'desarrollo', cortina: 'Desarrollo', ev: crear('ev-desarrollo', cabeza(dev), de('.dev-tabs', dev), panelesDev),
    pasos: tabsDev.length, tabs: tabsDev,
    entrar(tl, ev) {
      tl.from($$('.section-head > *', ev), { opacity: 0, y: 24, duration: .45, stagger: .1 })
        .from(tabsDev, { opacity: 0, y: 14, duration: .3, stagger: .06 }, '-=.2');
      this.paso(tl, 0, 1, true);
    },
    paso(tl, i, dir, primero) { pasarPestana(tl, this, i, dir, primero, panelesDev); },
  });

  // ---------------------------------------------------------- 6-8. diseño e ilustración
  const dis = '#diseno';
  E.push({
    id: 'diseno', cortina: 'Diseño e ilustración', ev: crear('ev-diseno', cabeza(dis), de('.art-context', dis), de('.art-controls', dis), de('.art-compare', dis), de('.art-credit', dis)),
    entrar(tl, ev) {
      tl.from($$('.section-head > *', ev), { opacity: 0, y: 24, duration: .45, stagger: .1 })
        .from([$('.art-context', ev), ...$$('.art-controls .btn', ev)], { opacity: 0, y: 14, duration: .35, stagger: .07 }, '-=.2')
        .from($('.art-card', ev), { x: -W() * .45, rotate: -8, opacity: 0, duration: .75, ease: 'power3.out' })
        .from($('.art-card.digital', ev), { x: W() * .45, rotate: 8, opacity: 0, duration: .75, ease: 'power3.out' }, '<')
        .from($('.art-arrow', ev), { scale: 0, opacity: 0, duration: .5, ease: 'back.out(2.5)' }, '-=.2')
        .from($('.art-credit', ev), { opacity: 0, duration: .4 });
    },
  });
  E.push({
    id: 'leyendas', ev: crear('ev-leyendas', $('#leyendas')),
    entrar(tl, ev) {
      tl.from($$('.leyendas-cabeza > *', ev), { opacity: 0, y: 20, duration: .45, stagger: .1 })
        .from($$('.leyendas-grid > *', ev).slice(0, 16), { ...popup, duration: .55, stagger: .06, ease: 'back.out(1.5)' }, '-=.1')
        .from($('.leyendas-aviso', ev), { opacity: 0, duration: .4 }, '-=.2');
    },
  });
  E.push({
    id: 'historia', ev: crear('ev-historia', de('.design-story', dis)),
    entrar(tl, ev) {
      tl.from($('.fairy-design', ev), { x: -W() * .3, y: -H() * .3, rotate: -20, opacity: 0, duration: 1, ease: 'power2.out' })
        .from($$('.design-story > div:last-child > :not(.creative-journey)', ev), { opacity: 0, y: 20, duration: .45, stagger: .1 }, '-=.5')
        .from($$('.journey-step', ev), { ...popup, duration: .55, stagger: .14, ease: 'back.out(1.6)' }, '-=.2');
    },
  });

  // ---------------------------------------------------------- 9. datos: el oráculo
  const dat = '#datos';
  E.push({
    id: 'datos', cortina: 'Datos', ev: crear('ev-datos', cabeza(dat), $('#oraculo')),
    entrar(tl, ev) {
      tl.from($$('.section-head > *', ev), { opacity: 0, y: 24, duration: .45, stagger: .1 })
        .from($('.oraculo-form', ev), { x: -W() * .4, opacity: 0, duration: .7, ease: 'power3.out' }, '-=.2')
        .from($('.oraculo-viz', ev), { x: W() * .4, opacity: 0, duration: .7, ease: 'power3.out' }, '<.1')
        .from($$('.oraculo-kpis > *', ev), { scale: 0, opacity: 0, duration: .35, stagger: .07, ease: 'back.out(2.5)' }, '-=.2');
    },
  });

  // ---------------------------------------------------------- 10-11. trayectoria
  const tra = '#trayectoria', explic = $$('.transition-explanation', $(tra));
  E.push({
    id: 'trayectoria', cortina: 'Trayectoria', ev: crear('ev-trayectoria', cabeza(tra), de('.vida-tira', tra), explic[0], de('.transition-path', tra), explic[1]),
    entrar(tl, ev) {                                  // las etapas de Ari se levantan del papel una tras otra
      tl.from($$('.section-head > *', ev), { opacity: 0, y: 24, duration: .45, stagger: .1 })
        .from($$('.vida-tira figure', ev), { ...popup, duration: .5, stagger: .09, ease: 'back.out(1.8)' }, '-=.1')
        .from(explic[0], { opacity: 0, duration: .4 }, '-=.2')
        .from($$('.transition-path > *', ev), { opacity: 0, x: 40, duration: .35, stagger: .07, ease: 'power2.out' })
        .from(explic[1], { opacity: 0, duration: .4 });
    },
  });
  E.push({
    id: 'salud', ev: crear('ev-salud', $('#salud-card')),
    entrar(tl, ev) {
      tl.from($('.health-card', ev), { rotateY: 95, transformOrigin: '100% 50%', transformPerspective: 1400, opacity: 0, duration: .9, ease: 'power3.out' })
        .from($$('.health-card > div > *', ev), { opacity: 0, y: 16, duration: .4, stagger: .1 }, '-=.3');
    },
  });

  // ---------------------------------------------------------- 12. formación
  const form = '#formacion';
  E.push({
    id: 'formacion', cortina: 'Formación', ev: crear('ev-formacion', cabeza(form), de('.credential-gallery', form), de('.cv-cta', form)),
    entrar(tl, ev) {
      tl.from($$('.section-head > *', ev), { opacity: 0, y: 24, duration: .45, stagger: .1 })
        .from($$('.credential-gallery article', ev), { y: H() * .5, rotate: i => (i - 1.5) * 6, opacity: 0, duration: .65, stagger: .12, ease: 'back.out(1.3)' }, '-=.1')
        .from($('.cv-cta', ev), { ...popup, duration: .6, ease: 'back.out(1.5)' });
    },
  });

  // ---------------------------------------------------------- 13. arcade: un juego por paso
  const arc = '#arcade', tabsJ = $$('.game-tab', $(arc)), panelesJ = $$('.game-panel', $(arc));
  E.push({
    id: 'arcade', cortina: 'Arcade mágico', ev: crear('ev-arcade', cabeza(arc), $('#arcade-zona')),
    pasos: tabsJ.length, tabs: tabsJ,
    entrar(tl, ev) {
      tl.from($$('.section-head > *', ev), { opacity: 0, y: 24, duration: .45, stagger: .1 })
        .from(tabsJ, { opacity: 0, y: 14, duration: .3, stagger: .06 }, '-=.2');
      this.paso(tl, 0, 1, true);
    },
    paso(tl, i, dir, primero) { pasarPestana(tl, this, i, dir, primero, panelesJ); },
  });

  // ---------------------------------------------------------- 14. contacto
  const pie = $('#site > footer');
  E.push({
    id: 'contacto', cortina: '¿Construimos algo?', ev: crear('ev-contacto', $('#contacto'), pie),
    entrar(tl, ev) {                                  // los enlaces bajan colgando de sus hilos y se balancean
      tl.from($$('#contacto .wrap > :not(.contact-buttons)', ev), { opacity: 0, y: 24, duration: .45, stagger: .1 })
        .from($$('.contact-buttons a', ev), { y: -H() * .5, rotate: i => (i % 2 ? 10 : -10), opacity: 0, duration: .9, stagger: .1, ease: 'elastic.out(1, .55)' }, '-=.1')
        .from(pie, { y: 80, opacity: 0, duration: .6, ease: 'power3.out' }, '-=.4');
    },
  });

  // las pestañas (desarrollo y juegos) cambian como una hoja que gira
  function pasarPestana(tl, e, i, dir, primero, paneles) {
    const tab = e.tabs[i], nuevo = paneles[i], viejo = paneles.find(p => p.classList.contains('active') && p !== nuevo);
    const activar = () => { if (!tab.classList.contains('active')) { sincronizando = true; tab.click(); sincronizando = false; } };
    if (primero || !viejo) {
      tl.call(activar).from(nuevo, { ...popup, duration: .7, ease: 'back.out(1.3)' }, '-=.05');
      return;
    }
    tl.to(viejo, { rotateY: dir > 0 ? -90 : 90, transformOrigin: dir > 0 ? '0% 50%' : '100% 50%', transformPerspective: 1600, opacity: .3, duration: .35, ease: 'power2.in' })
      .set(viejo, { clearProps: 'transform,opacity' })
      .call(activar)
      .fromTo(nuevo, { rotateY: dir > 0 ? 90 : -90, transformOrigin: dir > 0 ? '100% 50%' : '0% 50%', transformPerspective: 1600, opacity: .3 }, { rotateY: 0, opacity: 1, duration: .45, ease: 'power2.out' })
      .call(() => ajustar(e));
  }
  // si se elige una pestaña con el mouse, la escena sabe en qué paso quedó
  let sincronizando = false;
  E.filter(e => e.tabs).forEach(e => e.tabs.forEach((t, k) => t.addEventListener('click', () => {
    if (sincronizando || E[actual] !== e) return;
    paso = k; requestAnimationFrame(() => ajustar(e));
  })));

  // ---------------------------------------------------------- telón entre secciones
  const telon = document.createElement('div'); telon.className = 'telon-escena'; telon.setAttribute('aria-hidden', 'true');
  telon.innerHTML = '<div class="telon-cenefa"></div><div class="telon-hoja telon-izq"></div><div class="telon-hoja telon-der"></div><div class="telon-cartel"><span class="telon-hilo"></span><p></p></div>';
  document.body.append(telon);
  const textoTelon = $('p', telon), cartel = $('.telon-cartel', telon), hojas = $$('.telon-hoja', telon);
  const letras = t => { textoTelon.innerHTML = ''; [...t].forEach(c => { const s = document.createElement('span'); s.textContent = c; if (c === ' ') s.className = 'esp'; textoTelon.append(s); }); return $$('span', textoTelon); };

  // ---------------------------------------------------------- índice lateral: una estrella por escena
  const NOMBRE = { inicio: 'Inicio', estudio: 'Studios Conari', servicios: 'Servicios', equipo: 'El equipo', desarrollo: 'Desarrollo', diseno: 'Diseño e ilustración', leyendas: 'Leyendas dibujadas', historia: 'Por qué dibuja', datos: 'Datos', trayectoria: 'Trayectoria', salud: 'Matrona', formacion: 'Formación', arcade: 'Arcade mágico', contacto: 'Contacto' };
  const indice = document.createElement('nav'); indice.className = 'escenas-indice'; indice.setAttribute('aria-label', 'Escenas');
  E.forEach((e, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', NOMBRE[e.id]); b.dataset.nombre = NOMBRE[e.id];
    if (e.cortina || i === 0) b.classList.add('seccion');
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
  function limpiar(tl) { gsap.set(objetivos(tl).filter(t => capa.contains(t)), { clearProps: 'transform,opacity,visibility,rotate' }); }
  function irA(i, pasoInicial) {
    if (ocupado || i === actual || i < 0 || i >= E.length) return;
    ocupado = true;
    const dir = i > actual ? 1 : -1, de = E[actual], a = E[i];
    if (tlEntrada) tlEntrada.progress(1);
    const sal = gsap.timeline();
    if (de.salir && dir > 0) de.salir(sal, de.ev);
    else sal.to(de.ev.firstElementChild, { opacity: 0, y: dir > 0 ? -50 : 50, duration: .45, ease: 'power2.in' });
    const cambio = () => {
      limpiar(sal); if (tlEntrada) limpiar(tlEntrada);
      actual = i; mostrar(a);
      tlEntrada = entrar(a, dir, pasoInicial);
      ajustar(a);
      tlEntrada.eventCallback('onComplete', () => { ocupado = false; a.ev.classList.remove('animando'); });
      gsap.delayedCall(Math.min(1.2, tlEntrada.duration()), () => { ocupado = false; });   // una entrada larga no bloquea seguir
    };
    const conTelon = dir > 0 ? !!a.cortina : !!de.cortina;           // el telón marca el paso a otra sección
    if (conTelon) {
      const span = letras(dir > 0 ? a.cortina : (seccionDe(i) || NOMBRE[a.id]));
      sal.set(telon, { visibility: 'visible' }, '-=.25')
        .fromTo(hojas[0], { xPercent: -102 }, { xPercent: 0, duration: .6, ease: 'power3.inOut' }, '<')
        .fromTo(hojas[1], { xPercent: 102 }, { xPercent: 0, duration: .6, ease: 'power3.inOut' }, '<')
        .fromTo(cartel, { y: -H() * .6, rotate: -6 }, { y: 0, rotate: 0, duration: .7, ease: 'elastic.out(1, .6)' }, '-=.15')
        .from(span, { opacity: 0, y: 18, duration: .25, stagger: .025, ease: 'back.out(2)' }, '-=.45')
        .to({}, { duration: .5 })
        .call(cambio)
        .to(cartel, { y: -H() * .6, duration: .45, ease: 'power2.in' })
        .to(hojas[0], { xPercent: -102, duration: .7, ease: 'power3.inOut' }, '-=.25')
        .to(hojas[1], { xPercent: 102, duration: .7, ease: 'power3.inOut' }, '<')
        .set(telon, { visibility: 'hidden' });
    } else sal.call(cambio);
  }
  // al volver hacia arriba, el telón muestra el nombre de la sección a la que se entra
  function seccionDe(i) { for (let k = i; k >= 0; k--) if (E[k].cortina) return E[k].cortina; return 'Inicio'; }
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
