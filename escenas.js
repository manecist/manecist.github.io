/* ==========================================================================
   Versión clásica por escenas: la página deja de desplazarse hacia abajo.
   Cada giro de la rueda (o flecha abajo / AvPág) pasa a la escena siguiente;
   las piezas aparecen con suavidad (sin estirarse). Algunas escenas tienen pasos
   internos (pestañas de desarrollo y juegos). Al entrar a las secciones grandes
   pasa el hada volando desde la esquina superior derecha a la inferior izquierda:
   la estela de cometa que nace de su varita tapa todo con niebla mágica, aparece
   el nombre de la sección y en una segunda pasada la estela descubre la nueva.
   Los nodos de la página se mueven (no se copian), así la
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
  // los títulos van en una sola línea centrada: el salto de línea pasa a ser un espacio
  $$('.section-head h2 br').forEach(b => b.replaceWith(' '));
  // títulos cortos, como en kdelrio
  const tEst = $('#estudio .section-head h2'); if (tEst) tEst.textContent = 'Studios Conari SpA';

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

  // marcos de papel ilustrado, los mismos de las aplicaciones del libro (marco, letra manuscrita y colores del cuento)
  const div = (clase, ...hijos) => { const d = document.createElement('div'); if (clase) d.className = clase; hijos.flat().filter(Boolean).forEach(h => d.append(h)); return d; };
  const papel = (clase, ...hijos) => div('colgante-app colgar-app papel-app ' + clase, ...hijos);
  const nota = html => { const p = document.createElement('p'); p.className = 'cuento nota app-nota'; p.innerHTML = html; return p; };
  const pasoCaja = (n, t) => { const p = document.createElement('p'); p.className = 'caja-paso'; p.innerHTML = '<span>' + n + '</span>' + t; return p; };
  const ranura = el => div('ranura', el);
  const pestanas = nombres => div('papel-pestanas', nombres.map(t => { const b = document.createElement('button'); b.type = 'button'; b.textContent = t; return b; }));

  const E = [];
  // ---------------------------------------------------------- 1. inicio
  const inicio = $('#inicio');
  E.push({
    id: 'inicio', ev: crear('ev-inicio', inicio),
    entrar(tl, ev, dir) { if (dir < 0) { lado(tl, $('.hero-copy', ev), -1); sube(tl, $('.fairy-stage', ev), '<.1'); } },
  });

  // ---------------------------------------------------------- 2-4. Studios Conari
  const est = '#estudio';
  // la marca (logo, lema, descripción y botones) a la izquierda, sin tarjeta; a la derecha la lista de lo que hace el estudio
  const card = de('.studio-brand-card', est), cuerpo = card && card.querySelector(':scope > div');
  const lema = document.createElement('p'); lema.className = 'estudio-lema'; lema.textContent = 'Donde nacen mundos y leyendas eternas';
  const marca = div('estudio-marca', $('.studio-wordmark', card), lema, cuerpo && cuerpo.querySelector(':scope > p:not(.official-slogan)'), cuerpo && cuerpo.querySelector('.studio-actions'));
  const ICONOS = { 'Documentación y propuestas': 'assets/icon-document.webp', 'Modelado y animación 3D': 'assets/emblema-conari-magico.webp' };
  const servicios = div('estudio-servicios', [...$$('.service-gallery article, .service-more article', $(est))].map(a => {
    const t = a.querySelector('h3')?.textContent || '', ico = a.querySelector('img')?.getAttribute('src') || ICONOS[t] || 'assets/icon-company.webp';
    const fila = document.createElement('div'); fila.className = 'estudio-servicio';
    fila.innerHTML = '<img src="' + ico + '" alt=""><div><h3></h3><p></p></div>';
    fila.querySelector('h3').textContent = t; fila.querySelector('p').textContent = a.querySelector('p')?.textContent || '';
    return fila;
  }));
  const rolTit = document.createElement('p'); rolTit.className = 'estudio-rol'; rolTit.textContent = 'Lo que hacemos';
  E.push({
    id: 'estudio', ev: crear('ev-estudio', cabeza(est), div('estudio-dos', marca, div('estudio-lista', rolTit, servicios))),
    entrar(tl, ev) {
      sube(tl, $$('.section-head > div > *', ev));
      sube(tl, $$('.estudio-marca > *', ev), '-=.2', { stagger: .08 });
      tl.from(rolTit, { opacity: 0, duration: .4 }, '<.2');
      lado(tl, $$('.estudio-servicio', ev), 1, '<.1', { stagger: .08, duration: .5 });
    },
  });
  E.push({
    id: 'equipo', ev: crear('ev-equipo', de('.studio-team', est)),
    entrar(tl, ev) {
      sube(tl, $$('.studio-team > div:first-child > *', ev));
      sube(tl, $$('.role-node', ev), '-=.2', { stagger: .15 });
      tl.from($('.team-outcome', ev), { opacity: 0, duration: .5 });
    },
  });

  // ---------------------------------------------------------- 5. desarrollo: un proyecto por paso, cada uno en su marco de papel
  const dev = '#desarrollo';
  const vitrina = document.createElement('iframe'); vitrina.title = 'Magical Alliance, la tienda en vivo'; vitrina.loading = 'lazy'; vitrina.allow = 'clipboard-write';
  vitrina.dataset.src = 'https://manecist.github.io/Ecommerce-Portafolio-Final-M7/#/inicio';
  const marcosDev = [
    papel('app-calc', nota('Mi primer conjuro en Java fue una calculadora. Pulsa las teclas: al lado se escribe el mismo cálculo en Java.'), div('app-doble', $('#calc-zona'), $('#calc-java'))),
    papel('app-caja app-tres', nota('Los 68 productos y precios vienen de mi proyecto Java <a href="https://github.com/manecist/Ecommerce-Backend-M4" target="_blank" rel="noopener">Ecommerce-Backend-M4 ↗</a>.'),
      div('app-doble', div('', pasoCaja(1, 'Elige productos y descuento'), $('#m4-picker')), div('', pasoCaja(2, 'Revisa el recibo y paga'), $('#m4-recibo')), div('', pasoCaja(3, 'Cobra en la caja'), $('#caja')))),
    papel('app-vitrina', nota('<b>Magical Alliance</b>, mi proyecto final Full Stack Java, aquí mismo: recórrela como clienta o como administradora, llena el carrito y mira cómo cambia el stock.'), div('vitrina-viva', vitrina), $('#dev-m7 .botonera')),
  ];
  const botonesDev = pestanas(['Calculadora Java', 'Tienda Java · M4', 'Magical Alliance · M7']);
  E.push({
    id: 'desarrollo', hada: 'Desarrollo', ev: crear('ev-desarrollo', cabeza(dev), botonesDev, div('papel-marcos', marcosDev)),
    pasos: marcosDev.length, marcos: marcosDev, botones: [...botonesDev.children],
    alMostrar(i) { if (i === 2 && vitrina.dataset.src) { vitrina.src = vitrina.dataset.src; vitrina.removeAttribute('data-src'); } },   // la tienda en vivo carga recién al verla
    entrar(tl, ev) { sube(tl, $$('.section-head > *', ev)); sube(tl, this.botones, '-=.2', { duration: .35, stagger: .06 }); this.paso(tl, 0, 1, true); },
    paso(tl, i, dir, primero) { cambiarMarco(tl, this, i, dir, primero); },
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
    id: 'trayectoria', hada: 'Trayectoria', ev: crear('ev-trayectoria', cabeza(tra), de('.transition-path', tra), explic[0]),
    entrar(tl, ev) {
      sube(tl, $$('.section-head > *', ev));
      lado(tl, $$('.transition-path > *', ev), 1, undefined, { stagger: .06, duration: .4 });
      tl.from(explic[0], { opacity: 0, duration: .4 });
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

  // ---------------------------------------------------------- 13. arcade: el salón de los juegos con sus máquinas
  const arc = '#arcade';
  const acciones = () => div('juego-acciones', ...[['btn juego-salon', '← Volver al salón'], ['btn juego-empezar', '▶ Jugar'], ['btn juego-volver', '← Ver instrucciones']].map(([c, t]) => { const b = document.createElement('button'); b.type = 'button'; b.className = c; b.textContent = t; return b; }));
  const portada = document.createElement('img'); portada.className = 'arcade-portada'; portada.src = 'assets/cuento/cap10/arcade-bloques.webp'; portada.alt = '';
  $('#game-tetris')?.classList.add('active');
  const juegos = {
    bloques: papel('app-juego app-bloques', acciones(), portada, ranura($('#game-tetris'))),
    gemas: papel('app-juego app-gemas', acciones(), div('app-doble', div('arcade-dibujo', ranura($('#match-grid'))), div('juego-papel', ranura($('#gema-intro')), ranura($('#gema-guia')), ranura($('#gema-lado'))))),
    estrellas: papel('app-juego app-estrellas', acciones(), div('app-doble', div('arcade-dibujo', ranura($('#constellation-board'))), div('juego-papel', ranura($('#estrellas-intro')), ranura($('#estrellas-lado')), ranura($('#estrellas-leccion'))))),
  };
  const MAQUINAS = [['bloques', 'arcade1-anim', 'Bloques encantados'], ['gemas', 'arcade2-anim', 'Jardín de gemas lunares'], ['estrellas', 'arcade3-anim', 'Cielo de constelaciones']];
  const salon = div('salon-arcade', MAQUINAS.map(([id, hoja, nombre]) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'maquina'; b.dataset.juego = id; b.setAttribute('aria-label', 'Jugar ' + nombre);
    b.innerHTML = '<span class="maquina-spr" style="background-image:url(assets/cuento/cap10/' + hoja + '.webp)"></span><span class="maquina-rotulo">' + nombre + '</span>';
    return b;
  }));
  // las máquinas se mueven con su animación (hoja de 37 cuadros en 8 columnas)
  let cuadroMaq = 0;
  setInterval(() => { if (E[actual]?.id !== 'arcade' || salon.hidden) return; cuadroMaq = (cuadroMaq + 1) % 37; $$('.maquina-spr', salon).forEach((m, k) => { const c = (cuadroMaq + k * 9) % 37; m.style.backgroundPosition = (c % 8) / 7 * 100 + '% ' + Math.floor(c / 8) / 4 * 100 + '%'; }); }, 85);
  const sala = div('papel-marcos sala-juegos', Object.values(juegos));
  const abrirJuego = id => {
    salon.hidden = !!id; sala.classList.toggle('abierta', !!id);
    Object.entries(juegos).forEach(([k, j]) => j.classList.toggle('activo', k === id));
    if (id && window.Magia) { const r = sala.getBoundingClientRect(); Magia.chispas(r.left + r.width / 2, r.top + 60, { n: 30, vel: 4 }); }
    requestAnimationFrame(() => ajustar(E[actual]));
  };
  salon.addEventListener('click', e => { const m = e.target.closest('.maquina'); if (m) abrirJuego(m.dataset.juego); });
  sala.addEventListener('click', e => { if (e.target.closest('.juego-salon')) { e.target.closest('.colgar-app').classList.remove('jugando'); abrirJuego(null); } });
  E.push({
    id: 'arcade', hada: 'Arcade mágico', ev: crear('ev-arcade', cabeza(arc), salon, sala),
    entrar(tl, ev) { sube(tl, $$('.section-head > *', ev)); if (!salon.hidden) sube(tl, $$('.maquina', ev), '-=.2', { stagger: .14, y: 40 }); else sube(tl, sala, '-=.2'); },
  });

  // ---------------------------------------------------------- 14. contacto
  const pie = $('#site > footer');
  E.push({
    id: 'contacto', ev: crear('ev-contacto', $('#contacto'), pie, $('.nido-escena')),   // como en kdelrio: las crías esperan debajo del pie
    entrar(tl, ev) {
      sube(tl, $('.section-head > *, .section-head > div > *', ev));
      sube(tl, $('.contacto', ev), '-=.2', { stagger: .08 });
      tl.from(pie, { opacity: 0, duration: .5 }, '-=.2');
    },
  });

  // los marcos de un paso a otro se cambian con un fundido y un leve deslizamiento
  function marcar(e, i) {
    e.marcos.forEach((m, k) => m.classList.toggle('activo', k === i));
    e.botones?.forEach((b, k) => b.classList.toggle('activo', k === i));
    e.alMostrar && e.alMostrar(i);
  }
  function cambiarMarco(tl, e, i, dir, primero) {
    const nuevo = e.marcos[i], viejo = e.marcos.find(m => m.classList.contains('activo') && m !== nuevo);
    if (primero || !viejo) { tl.call(() => { marcar(e, i); ajustar(e); }); sube(tl, nuevo, '-=.1', { duration: .6 }); return; }
    tl.to(viejo, { opacity: 0, x: -dir * 40, duration: .3, ease: 'power2.in' })
      .set(viejo, { clearProps: 'transform,opacity' })
      .call(() => { marcar(e, i); ajustar(e); })
      .fromTo(nuevo, { opacity: 0, x: dir * 40 }, { opacity: 1, x: 0, duration: .45, ease: 'power2.out' });
  }
  E.filter(e => e.botones).forEach(e => e.botones.forEach((b, k) => b.addEventListener('click', () => { if (E[actual] === e) irPaso(k); })));

  // ---------------------------------------------------------- el hada que tapa todo con su estela y pinta la sección siguiente
  // 1. vuela de la esquina superior derecha a la inferior izquierda; de la estrella de su varita nace una estela
  //    de cometa que se ensancha detrás de ella hasta cubrir toda la pantalla de niebla blanca;
  // 2. en la niebla, con brillitos celestes y rosados, aparece el nombre de la sección;
  // 3. vuelve a pasar en la misma dirección y la misma estela de cometa va descubriendo la sección nueva.
  const magia = document.createElement('div'); magia.className = 'hechizo-paso'; magia.setAttribute('aria-hidden', 'true');
  magia.innerHTML = '<canvas class="hechizo-niebla"></canvas><p class="hechizo-nombre"></p><img class="hechizo-hada" src="assets/hada-cometa.webp" alt="">';
  document.body.append(magia);
  const lienzo = $('.hechizo-niebla', magia), ctx = lienzo.getContext('2d'), nombreHada = $('.hechizo-nombre', magia), hadaImg = $('.hechizo-hada', magia);
  const niebla = document.createElement('canvas'), nctx = niebla.getContext('2d');   // la niebla completa, para descubrirla en la segunda pasada
  const HADA_ALTO = 230, HADA_ANCHO = HADA_ALTO * .75, PUNTA = [.833, .167];   // la estrella de la varita dentro de la imagen
  const ESTRELLAS = ['✦', '✧', '⋆', '✶'], TONOS = ['#ffffff', '#bfe9ff', '#91dcff', '#ffd9ea', '#f5a8cf'];
  function estrella(x, y, tam = 9 + Math.random() * 15) {
    const s = document.createElement('i'); s.className = 'hechizo-estrella'; s.textContent = ESTRELLAS[Math.random() * ESTRELLAS.length | 0];
    s.style.cssText = `left:${x}px;top:${y}px;--t:${tam.toFixed(0)}px;--g:${(Math.random() * 360) | 0}deg;--c:${TONOS[1 + (Math.random() * 4 | 0)]}`;
    magia.append(s); setTimeout(() => s.remove(), 1500);
  }
  function pintarNiebla() {                         // niebla blanca pareja con manchas celestes y rosadas
    niebla.width = lienzo.width; niebla.height = lienzo.height;
    nctx.fillStyle = '#fffafd'; nctx.fillRect(0, 0, niebla.width, niebla.height);
    for (let q = 0; q < 16; q++) {
      const x = Math.random() * niebla.width, y = Math.random() * niebla.height, r = 120 + Math.random() * 240;
      const g = nctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, q % 2 ? 'rgba(191,233,255,.5)' : 'rgba(255,217,234,.55)'); g.addColorStop(1, 'rgba(255,250,253,0)');
      nctx.fillStyle = g; nctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
  }
  // la estela: un cono de luz que nace en la estrella y se abre hacia atrás, en tres capas (halo, cuerpo y núcleo)
  function cola(camino, abre, quitar) {
    const n = camino.length; if (n < 2) return;
    const fin = camino[n - 1];
    const capas = quitar ? [[1, 'rgba(0,0,0,.45)'], [.72, 'rgba(0,0,0,.75)'], [.42, 'rgba(0,0,0,1)']]
      : [[1, 'rgba(214,238,255,.42)'], [.72, 'rgba(255,230,244,.62)'], [.42, 'rgba(255,255,255,.95)']];
    capas.forEach(([f, color]) => {
      const izq = [], der = [];
      camino.forEach(p => {
        const dist = fin.l - p.l, hw = (5 + dist * abre) * f + Math.sin(p.l / 38 + f * 3) * Math.min(14, dist * .05);   // la cola ondula un poco al abrirse
        izq.push([p.x + p.nx * hw, p.y + p.ny * hw]); der.push([p.x - p.nx * hw, p.y - p.ny * hw]);
      });
      ctx.beginPath(); ctx.moveTo(izq[0][0], izq[0][1]);
      izq.forEach(q => ctx.lineTo(q[0], q[1])); der.reverse().forEach(q => ctx.lineTo(q[0], q[1]));
      ctx.closePath(); ctx.fillStyle = color; ctx.fill();
    });
    // la cabeza del cometa: un resplandor en la estrella de la varita
    if (!quitar) { const g = ctx.createRadialGradient(fin.x, fin.y, 0, fin.x, fin.y, 34); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.4, 'rgba(255,236,248,.8)'); g.addColorStop(1, 'rgba(191,233,255,0)'); ctx.fillStyle = g; ctx.fillRect(fin.x - 34, fin.y - 34, 68, 68); }
  }
  // una pasada: la estrella va de afuera de la esquina superior derecha hasta afuera de la inferior izquierda
  function pasada(descubrir, duracion) {
    const w = lienzo.width, h = lienzo.height, D = Math.hypot(w, h);
    const d = [-w / D, h / D], nrm = [h / D, w / D];
    const desde = [w + 120 * w / D, -120 * h / D], largo = D + 420;
    const camino = []; let ultima = 0;
    const obj = { s: 0 };
    return gsap.to(obj, { s: 1, duration: duracion, ease: 'none', onUpdate() {
      const s = obj.s, l = largo * s, ola = Math.sin(s * Math.PI * 2.5) * 34;   // vuelo con un vaivén suave
      const x = desde[0] + d[0] * l + nrm[0] * ola, y = desde[1] + d[1] * l + nrm[1] * ola;
      camino.push({ x, y, l, nx: nrm[0], ny: nrm[1] });
      const abre = .34 + .55 * s * s;                   // al final la cola se abre más y termina de cubrir las esquinas
      ctx.globalCompositeOperation = 'source-over'; ctx.clearRect(0, 0, w, h);
      if (descubrir) { ctx.drawImage(niebla, 0, 0); ctx.globalCompositeOperation = 'destination-out'; cola(camino, abre, true); ctx.globalCompositeOperation = 'source-over'; }
      else cola(camino, abre, false);
      // el hada lleva la varita en la mano: la estrella queda en la cabeza del cometa
      hadaImg.style.transform = `translate(${(x - HADA_ANCHO * PUNTA[0]).toFixed(1)}px, ${(y - HADA_ALTO * PUNTA[1]).toFixed(1)}px) rotate(${(Math.sin(s * 10) * 3).toFixed(1)}deg)`;
      if (window.Magia) Magia.estela(x, y, { n: 4, colores: TONOS });
      const ahora = performance.now();
      if (ahora - ultima > 40) {                        // brillitos celestes y rosados que quedan flotando en la cola
        ultima = ahora;
        for (let q = 0; q < 3; q++) {
          const atras = Math.random() ** 1.5 * Math.min(l, 900), ancho = (Math.random() - .5) * 2 * (5 + atras * abre) * .9;
          estrella(x - d[0] * atras + nrm[0] * ancho, y - d[1] * atras + nrm[1] * ancho);
        }
      }
    } });
  }
  function hechizo(texto, alCubrir, alFin) {
    lienzo.width = W(); lienzo.height = innerHeight; ctx.clearRect(0, 0, lienzo.width, lienzo.height); pintarNiebla();
    magia.style.visibility = 'visible'; nombreHada.textContent = texto || '';
    gsap.set(nombreHada, { opacity: 0, scale: .92 }); gsap.set(lienzo, { opacity: 1 });
    const velo = { a: 0 };
    const tl = gsap.timeline({ onComplete: () => { magia.style.visibility = 'hidden'; ctx.clearRect(0, 0, lienzo.width, lienzo.height); gsap.set(lienzo, { opacity: 1 }); alFin && alFin(); } });
    tl.add(pasada(false, 2.1))
      // lo que la cola no alcanzó se llena de niebla
      .to(velo, { a: 1, duration: .35, onUpdate() { ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = velo.a; ctx.drawImage(niebla, 0, 0); ctx.globalAlpha = 1; } }, '-=.3')
      .call(() => alCubrir && alCubrir())
      .to(nombreHada, { opacity: 1, scale: 1, duration: .5, ease: 'power2.out' })
      .call(() => { for (let q = 0; q < 26; q++) setTimeout(() => estrella(W() * (.2 + Math.random() * .6), innerHeight * (.3 + Math.random() * .4), 12 + Math.random() * 18), q * 30); }, null, '<')
      .to({}, { duration: .8 })
      .to(nombreHada, { opacity: 0, duration: .35 })
      .add(pasada(true, 2.1), '-=.1')
      .to(lienzo, { opacity: 0, duration: .35 }, '-=.35')   // lo que quede de niebla se desvanece
      .call(() => { if (window.Magia) Magia.chispas(40, innerHeight - 40, { n: 40, vel: 5, colores: TONOS }); });
    return tl;
  }

  // ---------------------------------------------------------- leyendas: carrusel infinito, un dibujo a la vez, que vuelve a empezar sin saltos
  const rejilla = $('#leyendas-grid');
  if (rejilla) {
    const marco = div('carrusel-leyendas'); rejilla.before(marco); marco.append(rejilla);
    const flecha = (t, lbl) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'carrusel-flecha'; b.textContent = t; b.setAttribute('aria-label', lbl); marco.append(b); return b; };
    const antF = flecha('‹', 'Dibujo anterior'), sigF = flecha('›', 'Dibujo siguiente');
    let moviendo = false, encima = false;
    const paso = () => { const p = rejilla.firstElementChild; return p ? p.getBoundingClientRect().width / (parseFloat(rejilla.closest('.ev-caja')?.style.zoom) || 1) + 16 : 0; };
    const fijar = (x, anima) => { rejilla.style.transition = anima ? 'transform .8s cubic-bezier(.45,0,.25,1)' : 'none'; rejilla.style.transform = 'translateX(' + x + 'px)'; };
    // adelante: se desliza un dibujo y el primero pasa al final; atrás: el último pasa al principio y se desliza a su lugar
    const avanzarCarrusel = dir => {
      if (moviendo || rejilla.children.length < 2) return; moviendo = true;
      const d = paso();
      if (dir > 0) { fijar(-d, true); setTimeout(() => { rejilla.append(rejilla.firstElementChild); fijar(0, false); moviendo = false; }, 820); }
      else { rejilla.prepend(rejilla.lastElementChild); fijar(-d, false); void rejilla.offsetWidth; fijar(0, true); setTimeout(() => { moviendo = false; }, 820); }
    };
    sigF.addEventListener('click', () => avanzarCarrusel(1)); antF.addEventListener('click', () => avanzarCarrusel(-1));
    marco.addEventListener('pointerenter', () => { encima = true; }); marco.addEventListener('pointerleave', () => { encima = false; });
    setInterval(() => { if (E[actual]?.id === 'leyendas' && !encima && !document.hidden && !bloqueada()) avanzarCarrusel(1); }, 3200);
    // al cambiar el filtro, la fila vuelve a empezar desde su lugar
    new MutationObserver(() => { if (!moviendo) fijar(0, false); }).observe(rejilla, { childList: true });
  }

  // ---------------------------------------------------------- destellos en los bordes: aparecen aquí y allá, alternados, sobre los cuadros de la escena
  const CUADROS = '.studio-brand-card, .service-gallery article, .service-more article, .role-node, .leyendas, .design-story, .health-card, .credential-gallery article, .cv-cta, .oraculo-form, .oraculo-viz, .transition-path a, .contacto, .papel-app.activo';
  const capaBrillos = div('brillos-borde'); capaBrillos.setAttribute('aria-hidden', 'true'); document.body.append(capaBrillos);
  const TONOS_BORDE = ['#fff6d8', '#f3d48a', '#f5a8cf', '#d9c4ff', '#bfe9ff'];
  setInterval(() => {
    if (document.hidden || bloqueada() || magia.style.visibility === 'visible') return;
    const cuadros = $$(CUADROS, E[actual].ev).map(q => q.getBoundingClientRect()).filter(r => r.width > 40 && r.bottom > 0 && r.top < innerHeight);
    if (!cuadros.length || Math.random() < .25) return;
    // un punto al azar sobre el contorno de un cuadro al azar
    const r = cuadros[Math.random() * cuadros.length | 0]; let t = Math.random() * 2 * (r.width + r.height), x, y;
    if (t < r.width) { x = r.left + t; y = r.top; } else if ((t -= r.width) < r.height) { x = r.right; y = r.top + t; }
    else if ((t -= r.height) < r.width) { x = r.right - t; y = r.bottom; } else { x = r.left; y = r.bottom - (t - r.width); }
    const b = document.createElement('i'), d = .9 + Math.random() * .9;
    b.className = 'brillo-borde';
    b.style.cssText = 'left:' + x.toFixed(0) + 'px;top:' + y.toFixed(0) + 'px;--t:' + (14 + Math.random() * 16).toFixed(0) + 'px;--c:' + TONOS_BORDE[Math.random() * TONOS_BORDE.length | 0] + ';--d:' + d.toFixed(2) + 's';
    capaBrillos.append(b); setTimeout(() => b.remove(), d * 1000 + 50);
  }, 180);

  // ---------------------------------------------------------- índice lateral: una estrella por escena
  const NOMBRE = { inicio: 'Inicio', estudio: 'Studios Conari', equipo: 'El equipo', desarrollo: 'Desarrollo', diseno: 'Diseño e ilustración', leyendas: 'Leyendas dibujadas', historia: 'Por qué dibuja', datos: 'Datos', trayectoria: 'Trayectoria', salud: 'Matrona', formacion: 'Formación', arcade: 'Arcade mágico', contacto: 'Contacto' };
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
  ['.papel-marcos', '#lab-viz', '#leyendas-grid', '.creative-journey', '#arcade-zona', '#m7-galeria', '#printer-output'].forEach(s => { const n = $(s); if (n) ro.observe(n); });
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
    if (e.id !== 'contacto') raiz.classList.remove('escena-final');
    $$('button', indice).forEach((b, i) => b.classList.toggle('activo', E[i] === e));
    velo.classList.toggle('visible', e.id !== 'inicio');
    raiz.classList.toggle('escena-contenido', e.id !== 'inicio');   // fuera de la portada, el velo propio de la escena reemplaza al de la portada
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
      // el hada tapa la escena actual con su niebla; ya tapada, se cambia la escena y luego la pinta
      hechizo(dir > 0 ? a.hada : (seccionDe(i) || NOMBRE[a.id]), () => {
        de.ev.scrollTop = 0; actual = i; mostrar(a);
        paso = pasoInicial ?? (dir < 0 && a.pasos ? a.pasos - 1 : 0);
        if (a.marcos) marcar(a, paso);
        ajustar(a);
      }, () => { ocupado = false; });
      return;
    }
    const sal = gsap.timeline();
    sal.to(de.ev.firstElementChild, { opacity: 0, y: dir > 0 ? -30 : 30, duration: .35, ease: 'power2.in' })
      .call(() => {
        limpiar(sal);
        actual = i; mostrar(a);
        tlEntrada = entrar(a, dir, pasoInicial);
        ajustar(a);
        tlEntrada.eventCallback('onComplete', () => { ocupado = false; a.ev.classList.remove('animando'); if (a.id === 'contacto') raiz.classList.add('escena-final'); });
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
    if (E[i].marcos) marcar(E[i], 0);
    raiz.classList.toggle('escena-final', E[i].id === 'contacto');
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
