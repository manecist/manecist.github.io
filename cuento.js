/* ==========================================================================
   cuento.js · lo que pasa dentro de las páginas del libro
   - Narrador: lee en voz alta cada página (voz masculina en español del
     navegador, gratis). Pensado también para personas ciegas.
   - Cielo de noche y de día.
   - Escenas: la monita que crece, Ari y Coen que se dibujan y se pintan,
     el reino pop-up, la tienda, el paseo con la ropa nueva, la ilustración
     que se dibuja y la galería que saluda.
   © 2026 María Inés Cisterna Escobar · Studios Conari SpA. Todos los derechos reservados.
   ========================================================================== */
(function () {
  'use strict';
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const guardar = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* sin almacenamiento */ } };
  const leer = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  let timers = [];
  const luego = (fn, ms) => { const t = setTimeout(fn, quieto ? 0 : ms); timers.push(t); return t; };
  const limpiar = () => { timers.forEach(clearTimeout); timers = []; };

  /* ------------------------------------------------------------ cielo de noche y de día */
  const raiz = document.documentElement;
  function ponerCielo(c) {
    raiz.dataset.cielo = c;
    $$('[data-cielo-btn]').forEach(b => { b.setAttribute('aria-pressed', String(c === 'dia')); b.querySelector('span').textContent = c === 'dia' ? '☀' : '☾'; b.setAttribute('aria-label', c === 'dia' ? 'Cambiar a cielo de noche' : 'Cambiar a cielo de día'); });
  }
  // el cielo del libro y el modo día de la versión clásica son el mismo: manda data-tema
  window.MCECielo = ponerCielo;
  ponerCielo(raiz.dataset.tema === 'claro' ? 'dia' : 'noche');
  $$('[data-cielo-btn]').forEach(b => b.addEventListener('click', () => {
    const t = raiz.dataset.cielo === 'dia' ? 'oscuro' : 'claro';
    if (window.MCETema) MCETema.poner(t);
    else { raiz.dataset.tema = t; guardar('mce-tema', t); ponerCielo(t === 'claro' ? 'dia' : 'noche'); }
  }));

  // estrellas que titilan (de noche) y destellos suaves (de día)
  (function cielo() {
    const cv = $('#escena-estrellas'); if (!cv) return;
    const c = cv.getContext('2d'); let est = [], fugaces = [];
    function medir() { cv.width = innerWidth; cv.height = innerHeight; est = Array.from({ length: Math.round(innerWidth * innerHeight / 3800) }, () => ({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, r: Math.random() * 1.4 + .25, f: Math.random() * 6, v: .5 + Math.random() * 1.8, rosa: Math.random() < .18 })); }
    medir(); addEventListener('resize', medir);
    function cuadro(t) {
      const esc = $('#escena');
      if (esc && esc.classList.contains('activa') && !document.hidden) {
        c.clearRect(0, 0, cv.width, cv.height);
        const dia = raiz.dataset.cielo === 'dia';
        for (const s of est) {
          const a = (.3 + .7 * Math.abs(Math.sin(s.f + t / 1000 * s.v))) * (dia ? .35 : 1);
          c.globalAlpha = a; c.fillStyle = dia ? '#fff' : s.rosa ? '#ffd1e8' : '#fff8ff';
          c.beginPath(); c.arc(s.x, s.y, dia ? s.r * .8 : s.r, 0, 7); c.fill();
        }
        if (!dia && !quieto && Math.random() < .006) fugaces.push({ x: Math.random() * cv.width * .8, y: Math.random() * cv.height * .4, v: 9 + Math.random() * 6, l: 1 });
        fugaces = fugaces.filter(f => f.l > 0);
        for (const f of fugaces) {
          f.x += f.v; f.y += f.v * .45; f.l -= .02;
          const g = c.createLinearGradient(f.x - 90, f.y - 40, f.x, f.y); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,230,245,' + f.l + ')');
          c.globalAlpha = 1; c.strokeStyle = g; c.lineWidth = 2; c.beginPath(); c.moveTo(f.x - 90, f.y - 40); c.lineTo(f.x, f.y); c.stroke();
        }
        c.globalAlpha = 1;
      }
      requestAnimationFrame(cuadro);
    }
    requestAnimationFrame(cuadro);
  })();

  /* ------------------------------------------------------------ narrador */
  const voz = 'speechSynthesis' in window ? window.speechSynthesis : null;
  const btnVoz = $('#libro-voz');
  let narrando = leer('mce-narrador') === 'si', vozElegida = null, turno = 0;
  const HOMBRE = /(alvaro|álvaro|jorge|pablo|raul|raúl|tom[aá]s|lorenzo|diego|gonzalo|andr[eé]s|enrique|juan|carlos|alonso|federico|emilio|dar[ií]o|gerardo|jos[eé]|male|hombre|masculin)/i;
  const MUJER = /(helena|elvira|paloma|laura|sabina|dalia|camila|catalina|elena|lupe|paulina|monica|mónica|ximena|valentina|female|mujer)/i;
  function elegirVoz() {
    if (!voz) return null;
    const vs = voz.getVoices().filter(v => /^es/i.test(v.lang));
    if (!vs.length) return null;
    const puntos = v => (HOMBRE.test(v.name) ? 20 : 0) - (MUJER.test(v.name) ? 15 : 0) + (/natural|online|neural|premium|enhanced/i.test(v.name) ? 8 : 0) + (/es-(CL|419|MX|US|AR|CO)/i.test(v.lang) ? 3 : /es-ES/i.test(v.lang) ? 2 : 0) + (v.localService ? 0 : 1);
    return vs.sort((a, b) => puntos(b) - puntos(a))[0];
  }
  if (voz) { vozElegida = elegirVoz(); voz.addEventListener?.('voiceschanged', () => { vozElegida = elegirVoz(); }); }
  function callar() { turno++; if (voz) voz.cancel(); $$('.voz-activa').forEach(n => n.classList.remove('voz-activa')); }
  function decir(texto, o = {}) {
    return new Promise(fin => {
      if (!voz || !texto) { fin(); return; }
      const u = new SpeechSynthesisUtterance(texto.replace(/[«»✦✧♪♫♥]/g, '').replace(/\s+/g, ' ').trim());
      const v = o.voz || vozElegida || elegirVoz();
      if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'es-CL';
      u.rate = o.rate ?? .96; u.pitch = o.pitch ?? (v && HOMBRE.test(v.name) ? .95 : .7); u.volume = 1;
      u.onend = u.onerror = () => fin();
      voz.speak(u);
    });
  }
  function textosDe(pags) {
    const nodos = [];
    pags.forEach(p => p.querySelectorAll('.cap-num,.cap-titulo,.capitular,.cuento,.huellas li,.poderes li').forEach(n => {
      if (n.closest('.ranura') || n.closest('[data-narracion-propia]') || n.offsetParent === null && !n.closest('.pagina')) return;
      nodos.push(n);
    }));
    return nodos;
  }
  async function narrar(pags) {
    callar(); if (!narrando || !voz) return;
    const mio = ++turno;
    await new Promise(r => setTimeout(r, 650));
    for (const n of textosDe(pags)) {
      if (mio !== turno) return;
      n.classList.add('voz-activa');
      await decir(n.innerText);
      n.classList.remove('voz-activa');
    }
  }
  function pintarBotonVoz() {
    if (!btnVoz) return;
    btnVoz.setAttribute('aria-pressed', String(narrando));
    btnVoz.querySelector('b').textContent = narrando ? 'Narrador activo' : 'Narrador';
    btnVoz.hidden = !voz;
  }
  pintarBotonVoz();
  btnVoz?.addEventListener('click', () => {
    narrando = !narrando; guardar('mce-narrador', narrando ? 'si' : 'no'); pintarBotonVoz();
    if (narrando) narrar(window.MCELibro?.visibles?.() || []); else callar();
  });
  window.MCENarrador = { decir, callar, get activo() { return narrando && !!voz; } };

  /* ------------------------------------------------------------ escenas */
  document.querySelectorAll('.pagina-pop[data-suelo]').forEach(p => p.style.setProperty('--suelo', 'url("' + p.dataset.suelo + '")'));
  const ESCENAS = [];
  const escena = (sel, fn) => ESCENAS.push([sel, fn]);
  // pop-up: los recortes se acuestan de golpe sobre la hoja y, ya con la página quieta, se levantan uno tras otro
  const abrirPop = (el, espera = 550) => {
    if (document.getElementById('libro')?.classList.contains('recien-girado')) { el.classList.add('sin-trans', 'abierta'); void el.offsetWidth; requestAnimationFrame(() => el.classList.remove('sin-trans')); return; }
    el.classList.add('sin-trans'); el.classList.remove('abierta'); void el.offsetWidth; el.classList.remove('sin-trans');
    luego(() => el.classList.add('abierta'), espera);
  };

  // I · la monita crece: niña → adolescente → hoy
  escena('[data-crece]', el => {
    const fases = [...el.querySelectorAll('.etapa-vida')]; let i = 0;
    const mostrar = k => fases.forEach((f, j) => f.classList.toggle('activa', j === k));
    mostrar(0);
    const paso = () => { i = (i + 1) % fases.length; mostrar(i); if (window.Magia) { const r = el.getBoundingClientRect(); Magia.chispas(r.left + r.width / 2, r.top + r.height / 2, { n: 18, vel: 3 }); } luego(paso, 3400); };
    luego(paso, 3400);
  });

  // III · Ari y Coen: lineart → pintura → se juntan
  escena('[data-pareja]', el => {
    el.classList.remove('dibuja', 'pinta', 'juntos'); void el.offsetWidth;
    luego(() => el.classList.add('dibuja'), 200);
    luego(() => el.classList.add('pinta'), 2300);
    luego(() => { el.classList.add('juntos'); if (window.Magia) { const r = el.getBoundingClientRect(); Magia.chispas(r.left + r.width / 2, r.top + r.height * .45, { n: 40, colores: ['#ff8fc0', '#ffd9ea', '#f3d48a', '#fff'] }); } }, 4600);
  });

  // ✦ el reino pop-up
  escena('[data-popup]', el => {
    const pasos = [...el.querySelectorAll('[data-paso]')];
    const pagina = el.closest('.pagina'); pagina.setAttribute('data-narracion-propia', '');
    const tiempos = [0, 4200, 9000, 15000, 21000];
    el.className = 'popup'; void el.offsetWidth;
    const mio = turno;
    pasos.forEach((p, i) => luego(async () => {
      el.classList.add('paso-' + (i + 1));
      pasos.forEach((q, j) => q.classList.toggle('activo', j === i));
      if (window.Magia) {
        const r = el.querySelector('.popup-escenario').getBoundingClientRect();
        if (i === 0) for (let k = 0; k < 6; k++) setTimeout(() => Magia.chispas(r.left + r.width * (.2 + k * .12), r.bottom - 30, { n: 12, vel: 3, subir: 2 }), k * 120);
        if (i === 3) [...el.querySelectorAll('.pp-monstruos .mo')].forEach((m, k) => setTimeout(() => { const q = m.getBoundingClientRect(); if (q.width) Magia.chispas(q.left + q.width / 2, q.top + q.height / 2, { n: 16, colores: ['#91dcff', '#d9b8ff', '#fff'] }); }, 400 + k * 260));
      }
      if (window.MCENarrador.activo) { if (i === 0) callar(); await decir(p.innerText); }
    }, tiempos[i]));
    luego(() => el.classList.add('fin'), 26500);
  });
  $$('[data-popup] .popup-repetir').forEach(b => b.addEventListener('click', () => { limpiar(); const el = b.closest('[data-popup]'); ESCENAS.find(([s]) => s === '[data-popup]')[1](el); }));

  // calculadora y caja aparecen como pop-up desde la página
  escena('.ranura-pop', el => { el.classList.remove('sube'); void el.offsetWidth; luego(() => el.classList.add('sube'), 250); });

  // VI · la tienda: Ari y Coen entran caminando
  escena('[data-tienda]', el => { el.classList.remove('entran'); void el.offsetWidth; luego(() => el.classList.add('entran'), 150); });

  // VI · el paseo con la ropa nueva
  function compraActual() {
    const items = $$('#printed-receipt .paper-item span:first-child, #m4-items p:not(.empty) span').map(n => n.textContent.replace(/\s×.*$/, '').trim()).filter(Boolean);
    return [...new Set(items)];
  }
  escena('[data-paseo]', el => {
    const compra = compraActual();
    const cap = el.querySelector('[data-ropa="ari"]');
    if (cap) cap.textContent = compra.length ? 'Estrenan: ' + compra.slice(0, 3).join(', ') : 'Ari y Coen, listos para pasear';
    el.classList.remove('camina'); void el.offsetWidth; luego(() => el.classList.add('camina'), 200);
  });

  // I · probador: Ari cambia de outfit
  const OUTFITS = [['etapa-15', 'Pelo ondulado, chaleco peludito y cargo oscuro'], ['etapa-13', 'Short negro, polera lila y chaleco blanco'], ['etapa-14', 'Polerón lila de castillito y short celeste'], ['etapa-12', 'Jeans flare claros y polera rosada'], ['etapa-11', 'Chaqueta de cuero y un mundo en la mano']];
  $$('[data-probador]').forEach(el => {
    let k = 0; const img = el.querySelector('.probador-img'), figura = el.querySelector('.probador-pop');
    OUTFITS.forEach(([s]) => { const i = new Image(); i.src = 'assets/cuento/etapas/' + s + '.webp'; });
    let cambiando = false;
    // el hada llega volando y le tira polvos mágicos desde arriba: Ari brilla y aparece con otra ropa
    const transformar = () => {
      k = (k + 1) % OUTFITS.length;
      const r = figura.getBoundingClientRect(), POLVO = ['#ffe9a8', '#ffd9ea', '#fff', '#c9a6ff', '#ff8fc0'];
      if (window.Magia) for (let i = 0; i < 9; i++) setTimeout(() => Magia.chispas(r.left + r.width * (.15 + Math.random() * .7), r.top + r.height * (.05 + i * .02), { n: 14, vel: 1.4, angulo: Math.PI / 2, abertura: 1.4, subir: -.6, grav: .05, colores: POLVO }), i * 70);
      figura.classList.add('magia');
      setTimeout(() => { img.src = 'assets/cuento/etapas/' + OUTFITS[k][0] + '.webp'; img.alt = 'Ari hoy: ' + OUTFITS[k][1]; }, quieto ? 0 : 520);
      setTimeout(() => { figura.classList.remove('magia'); cambiando = false; if (window.Magia) Magia.chispas(r.left + r.width / 2, r.top + r.height * .45, { n: 34, vel: 4, colores: POLVO }); }, quieto ? 0 : 1100);
    };
    const cambiar = () => {
      if (cambiando) return; cambiando = true;
      if (window.MCELibro?.hadaMagia && document.getElementById('libro').classList.contains('acostado')) MCELibro.hadaMagia(figura, transformar);
      else transformar();
    };
    figura.addEventListener('click', cambiar);
    figura.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cambiar(); } });
  });
  escena('[data-probador]', el => { el.classList.remove('gira'); abrirPop(el, quieto ? 0 : 1250); luego(() => el.classList.add('gira'), 2200); });

  // II · la vida caminando: la monita avanza por el pliego y se transforma
  const VIDA = [
    ['etapa-01', '4–6 años', 'Una niña princesa de rulos color miel y lentes gigantes de poto de botella.'],
    ['etapa-02', '8–10 años', 'Dibujaba en cada cuaderno que encontraba.'],
    ['etapa-03', '12–14 años', 'Descubrió los videojuegos… siempre en el PC.'],
    ['etapa-04', '15–18 años', 'Gamer de PC, pelo largo y liso, audífonos de gatito.'],
    ['etapa-05', '20–22 años', 'Matrona: balayage y uniforme rojo de puntitos.'],
    ['etapa-06', '23–25 años', 'Platinada, enseñando clínica a sus alumnas.'],
    ['etapa-07', '26–28 años', 'Puntas fucsia y uniforme de estrellas.'],
    ['etapa-09', '29 años', 'Programadora de noches largas en Java.'],
    ['etapa-10', '30 años', 'Streamer en ArianesDCoen junto a Coen.'],
    ['etapa-11', '31 años', 'Creadora de mundos: vuelven sus ondas naturales.'],
    ['etapa-12', 'Hoy', 'Ilustradora con su tableta rosada.'],
    ['etapa-15', 'Hoy · 32 años', 'Ari: fundadora de Studios Conari. ¡Y la historia sigue!']
  ];
  // cada etapa camina de verdad: una tira con un ciclo completo de caminata (sacado de video)
  const tiraDe = s => 'assets/cuento/caminata/' + s + '.webp';
  // ciclo de caminata completo en 2 s (paso tranquilo); cada cuadro se funde brevemente con el siguiente.
  // Entre etapas no hay pausa: el paso sigue corriendo y la etapa nueva entra en la misma fase del paso.
  const CICLO = 2000, CICLOS_POR_TRAMO = 2, TRAMO = CICLO * CICLOS_POR_TRAMO;
  const ponerCuadro = (capa, p) => {   // p: avance en cuadros (puede tener decimales)
    const n = cuadrosDe[capa.dataset.etapa] || 6, [c1, c2] = capa.children, k = Math.floor(p) % n, f = p - Math.floor(p), mezcla = Math.max(0, (f - .7) / .3);   // fundido corto: sin piernas dobles
    capa.style.setProperty('--n', n);
    c1.style.backgroundPositionX = k / (n - 1) * 100 + '%'; c2.style.backgroundPositionX = (k + 1) % n / (n - 1) * 100 + '%'; c2.style.opacity = mezcla.toFixed(3);
  };
  // paso continuo: las dos capas (la etapa que sale y la que entra) avanzan en la misma fase del ciclo
  const andar = el => {
    if (el._raf || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t0 = performance.now(), capas = [...el.querySelectorAll('.vida-img')];
    const cuadro = t => {
      if (!document.body.contains(el)) { el._raf = 0; return; }
      const fase = ((t - t0) / CICLO) % 1;
      capas.forEach(c => { if (c.dataset.etapa) ponerCuadro(c, fase * (cuadrosDe[c.dataset.etapa] || 6)); });
      el._raf = requestAnimationFrame(cuadro);
    };
    el.classList.add('andando'); el._raf = requestAnimationFrame(cuadro);
  };
  const detener = el => {                // se queda parada en el primer cuadro
    cancelAnimationFrame(el._raf); el._raf = 0; el.classList.remove('andando');
    el.querySelectorAll('.vida-img').forEach(c => { if (c.dataset.etapa) ponerCuadro(c, 0); });
  };
  // cuántos cuadros trae cada tira (celdas de proporción 0,8): se lee del tamaño de la imagen
  const cuadrosDe = {};
  VIDA.forEach(([s]) => { const i = new Image(); i.onload = () => { cuadrosDe[s] = Math.max(1, Math.round(i.naturalWidth / (i.naturalHeight * .8))); }; i.src = tiraDe(s); });
  const AMB = n => 'assets/cuento/cap2/' + n + '.webp';
  // ambiente de cada etapa: g01..g11 (fondo = gNN-fondo, objetos = gNN-1..3)
  const GRUPO = ['g01', 'g02', 'g03', 'g04', 'g05', 'g05e', 'g05f', 'g07b', 'g08', 'g09', 'g10', 'g11'];
  // ambientes al aire libre: ahí sí va el pasto delante
  const AFUERA = ['g05f', 'g09', 'g11'];
  // al salir del capítulo II el piso vuelve al de la primera etapa (para la próxima vez que se gire hacia él)
  window.addEventListener('cuento-paginas', e => { if (!e.detail.paginas.some(p => p.classList.contains('pagina-camino-vida'))) { document.getElementById('libro')?.style.removeProperty('--suelo-vida'); document.querySelectorAll('.vida-suelo i').forEach((c, i) => { c.classList.toggle('ver', !i); if (!i) c.style.backgroundImage = 'url("' + AMB('g01-suelo') + '")'; }); } });
  [...new Set(GRUPO)].forEach(g => ['fondo', 'suelo', 1, 2, 3].forEach(k => { const i = new Image(); i.src = AMB(g + '-' + k); }));
  escena('[data-vida]', el => {
    const a = el.querySelector('.vida-img'), b = el.querySelector('.vida-img-b'), rango = el.querySelector('.vida-rango');
    const edad = el.querySelector('.vida-edad'), txt = el.querySelector('.vida-texto'), play = el.querySelector('.vida-play'), andante = el.querySelector('.vida-andante');
    const pagina = el.closest('.pagina'); pagina.setAttribute('data-narracion-propia', '');
    let k = -1, pausa = false, frente = a;
    detener(el);
    const ambiente = el.querySelector('.vida-ambiente'); let ambActual = -1, grupoActual = '';
    const levantar = (im, d) => { if (document.getElementById('libro')?.classList.contains('recien-girado') && /fondo/.test(im.className)) { im.classList.add('ya'); (im.classList.contains('amb') ? el.querySelector('.vida-ambiente') : zona).append(im); return; } im.classList.add('pliega'); im.style.setProperty('--d', d + 's'); ambiente.append(im); requestAnimationFrame(() => requestAnimationFrame(() => im.classList.remove('pliega'))); };
    const plegar = sel => [...ambiente.querySelectorAll(sel)].forEach(p => { p.classList.add('pliega'); setTimeout(() => p.remove(), 900); });
    // al cambiar de etapa: los objetos se pliegan y se levantan otros junto a Ari; el panorama de fondo cambia con el ambiente
    const ponerAmbiente = n => {
      if (!ambiente || n === ambActual) return; ambActual = n;
      const g = GRUPO[n];
      if (g !== grupoActual) {
        grupoActual = g; plegar('.amb-fondo');
        // el piso del libro cambia con el ambiente (fundido entre dos capas); la hoja que gira usa el mismo piso
        const capas = el.querySelectorAll('.vida-suelo i');
        if (capas.length) { const nueva = [...capas].find(c => !c.classList.contains('ver')) || capas[0]; nueva.style.backgroundImage = 'url("' + AMB(g + '-suelo') + '")'; capas.forEach(c => c.classList.toggle('ver', c === nueva)); }
        document.getElementById('libro')?.style.setProperty('--suelo-vida', 'url("' + AMB(g + '-suelo') + '")');
        el.classList.toggle('afuera', AFUERA.includes(g));
        const f = document.createElement('img'); f.src = AMB(g + '-fondo'); f.alt = ''; f.className = 'vida-pop amb amb-fondo'; levantar(f, .05);
      }
      plegar('.amb-obj');
      // los 3 objetos se reparten parejo a lo ancho, en el primer plano del libro y pequeños: no tapan la caminata ni el fondo
      // en la última etapa Ari se queda a la derecha apuntando a la esquina: los objetos le dejan espacio
      (n === VIDA.length - 1 ? [12, 36, 60] : [18, 50, 82]).forEach((centro, j) => {
        const im = document.createElement('img'); im.src = AMB(g + '-' + (j + 1)); im.alt = '';
        im.className = 'vida-pop amb amb-obj amb-primer';
        im.style.left = (centro - 4.5).toFixed(1) + '%';
        im.style.width = '9%';
        levantar(im, .25 + j * .2);
      });
    };
    // al abrir la página, los recortes del pop-up se despliegan uno tras otro (cuando el libro ya se acostó)
    abrirPop(el, quieto ? 0 : 1250);
    const mostrar = async (n, hablar) => {
      if (n === k) return; k = n; rango.value = n;
      const otra = frente === a ? b : a; otra.dataset.etapa = VIDA[n][0]; otra.style.setProperty('--tira', 'url(' + tiraDe(VIDA[n][0]) + ')'); if (!el._raf) ponerCuadro(otra, 0); otra.setAttribute('aria-label', 'Ari, ' + VIDA[n][1] + ': ' + VIDA[n][2]);
      otra.classList.add('visible'); frente.classList.remove('visible'); frente = otra;
      el.style.setProperty('--x', (4 + n / (VIDA.length - 1) * 70).toFixed(1) + '%');   // la monita y su sombra avanzan juntas
      el.style.setProperty('--hora', n / (VIDA.length - 1));
      ponerAmbiente(n);
      edad.textContent = VIDA[n][1]; txt.textContent = VIDA[n][2];
      el.classList.remove('cambia'); void el.offsetWidth; el.classList.add('cambia');
      if (window.Magia) { const r = andante.getBoundingClientRect(); if (r.width) Magia.chispas(r.left + r.width / 2, r.top + r.height * .45, { n: 22, vel: 3, colores: ['#ff8fc0', '#ffd9ea', '#c9a6ff', '#f3d48a', '#fff'] }); }
      if (hablar && window.MCENarrador.activo) await decir(VIDA[n][1] + '. ' + VIDA[n][2]);
    };
    const avanzar = async () => {
      if (pausa || !document.body.contains(el)) return;
      const n = k + 1;
      if (n >= VIDA.length) { detener(el); el.classList.add('llego'); document.getElementById('libro')?.classList.add('invita'); play.textContent = '↻'; play.setAttribute('aria-label', 'Volver a caminar'); pausa = true; return; }
      andar(el); const inicio = performance.now();
      await mostrar(n, true);
      // la próxima etapa llega justo cuando termina el tramo (si el narrador habló más, sigue de inmediato)
      luego(avanzar, Math.max(0, TRAMO - (performance.now() - inicio)));
    };
    el.classList.remove('llego'); play.textContent = '❚❚'; k = -1;
    mostrar(0, false).then(() => { if (window.MCENarrador.activo) { callar(); decir(el.closest('.pagina').querySelector('.vida-cabeza').innerText).then(() => luego(avanzar, 400)); } else luego(avanzar, 5200); });
    play.onclick = () => {
      if (el.classList.contains('llego')) { el.classList.remove('llego'); document.getElementById('libro')?.classList.remove('invita'); pausa = false; play.textContent = '❚❚'; k = -1; mostrar(0, false); andar(el); luego(avanzar, 1200); return; }
      pausa = !pausa; play.textContent = pausa ? '▶' : '❚❚'; play.setAttribute('aria-label', pausa ? 'Seguir caminando' : 'Pausar la caminata');
      if (pausa) detener(el);
      if (!pausa) luego(avanzar, 300);
    };
    rango.oninput = () => { pausa = true; detener(el); play.textContent = '▶'; el.classList.remove('llego'); document.getElementById('libro')?.classList.remove('invita'); mostrar(Number(rango.value), false); };
  });

  // ✦ Escenarios pop-up: cada pliego acostado tiene una o varias escenas (fondo + piso + actores que se levantan).
  // Los actores son hojas de cuadros (videos Wan con fondo verde, recortados) o imágenes fijas; cada paso los hace actuar.
  // alto: altura del actor en % del ancho del pliego (todos a la misma escala); x: centro en %; desde: entra caminando desde ahí.
  const ESCENARIOS = {
    iv: { carpeta: 'cap4/', hitos: [
      { fondo: 'fondo-noche.webp', suelo: 'suelo-noche.webp', titulo: 'Las 2 de la mañana', texto: '…y un error más.', pasos: [
        { actor: 'cama', x: 34, alto: 15, de: 0, a: 1, ms: 4500 },                                         // a la izquierda: programa en la cama… y se duerme
        { texto: { titulo: 'z z z…', texto: 'Se quedó dormida estudiando.' }, ms: 900 },
        { actor: 'coen', camina: [0, 1], desde: 92, x: 51, alto: 16, ms: 3800, delante: true,
          texto: { titulo: 'Y cada mañana…', texto: 'Coen llegaba con un café.' } },                        // Coen llega caminando con el café
        { actor: 'coen', de: 2, a: 3, ms: 2600, pausa: 200 },                                               // se lo ofrece…
        { actor: 'cama', de: 1, a: 2, ms: 3500, texto: { titulo: '«Despierta, que vas a lograrlo» ☕', texto: '' } },   // …y ella despierta con el café en la mano
        { app: true, ms: 400 }                                                                              // baja la calculadora
      ] }
    ] },
    v: { carpeta: 'cap5/', hitos: [
      { fondo: 'fondo-estudio.webp', suelo: 'suelo-estudio.webp', titulo: 'Un trazo de lápiz…', texto: 'dio vida a Ari, la asesina ágil de cintas rosadas.', pasos: [
        { nombre: 'ari', img: 'assets/personajes/ari-frente.webp', linea: 'assets/personajes/ari-frente-lineart.webp', x: 40, alto: 16, ms: 4200, pausa: 400 },
        { nombre: 'coen', img: 'assets/personajes/coen-frente.webp', linea: 'assets/personajes/coen-frente-lineart.webp', x: 60, alto: 17, ms: 4200,
          texto: { titulo: '…y a Coen,', texto: 'el caballero de capa carmesí.' } },
        { nombre: 'pareja', actor: 'pareja', x: 50, alto: 17, reemplaza: ['ari', 'coen'], efecto: 'brilla', ms: 1800, bucle: [0, 1], cicloMs: 3000,
          texto: { titulo: 'Línea a línea, color a color…', texto: 'se encontraron y se tomaron de la mano.' } },
        { nombre: 'pareja', mueve: 27, ms: 1400, pausa: 100 },                                         // la pareja le hace espacio al logo
        { nombre: 'logo', img: 'assets/logo-conari-circulo.webp', x: 50, alto: 14, efecto: 'brilla', ms: 2600,
          texto: { titulo: 'Y juntos fundamos Studios Conari', texto: 'Un estudio creativo chileno: narrativa, diseño, programación, datos y arte 3D.' } },
        { nombre: 'pareja', actor: 'pareja', ms: 300, rotulo: 'María Inés · Kevin' },
        { nombre: 'rancek', img: 'assets/personajes/rancek-frente.webp', x: 73, alto: 17, ms: 2400,
          rotulo: 'Elías · animación y arte 3D',
          texto: { titulo: '…y se unió al equipo un tercero', texto: 'María Inés (dirección creativa · Full Stack Java), Kevin (dirección técnica · videojuegos y datos) y Elías (animación y arte 3D).' } }
      ] }
    ] },
    reino: { carpeta: 'reino/', hitos: [
      { fondo: null, suelo: 'suelo-reino.webp', titulo: 'Entonces…', texto: 'el libro se abrió de par en par y de sus páginas brotó un humo mágico.', pasos: [
        { nombre: 'humo', img: 'humo.webp', x: 50, alto: 18, efecto: 'flota', ms: 2600 },
        { quita: 'humo', texto: { titulo: 'Del humo nacieron…', texto: 'la cordillera de los Andes, el gran árbol de sakura, el sol, la luna y un castillo en lo alto. Y el dragón rosado despertó.' }, ms: 300 },
        { nombre: 'andes', img: 'assets/cuento/popup/andes.webp', x: 50, ancho: 94, fila: 'atras', ms: 200, pausa: 300 },
        { nombre: 'sol', img: 'sol.webp', x: 12, alto: 8, clase: 'en-cielo', efecto: 'flota', ms: 200, pausa: 200 },
        { nombre: 'luna', img: 'luna.webp', x: 89, alto: 7, clase: 'en-cielo', efecto: 'flota', ms: 200, pausa: 200 },
        { nombre: 'arbol', img: 'assets/cuento/popup/arbol.webp', x: 21, alto: 22, fila: 'medio', ms: 300, pausa: 200 },
        { nombre: 'castillo', img: 'assets/cuento/popup/castillo.webp', x: 76, alto: 19, fila: 'medio', ms: 300, pausa: 300 },
        { actor: 'dragon', camina: [0, 1], desde: 50, x: 50, alto: 10, clase: 'vuela', ms: 2600 },          // el dragón despierta y aletea
        { texto: { titulo: 'Pero de la niebla…', texto: 'salieron monstruitos. Ari saltó con su daga, ágil como el viento, y Coen alzó su espada para protegerla.' }, ms: 300 },
        { nombre: 'mo1', img: 'assets/cuento/popup/mo-1.webp', x: 62, alto: 7, delante: true, efecto: 'salta', ms: 150, pausa: 100 },
        { nombre: 'mo2', img: 'assets/cuento/popup/mo-2.webp', x: 72, alto: 7, delante: true, efecto: 'salta', ms: 150, pausa: 100 },
        { nombre: 'mo3', img: 'assets/cuento/popup/mo-3.webp', x: 82, alto: 7, delante: true, efecto: 'salta', ms: 150, pausa: 100 },
        { nombre: 'mo4', img: 'assets/cuento/popup/mo-4.webp', x: 91, alto: 7, delante: true, efecto: 'salta', ms: 150, pausa: 300 },
        { nombre: 'ari', actor: 'ari-salta', x: 38, alto: 18, delante: true, de: 0, a: 1, ms: 2600, pausa: 200 },
        { nombre: 'coen', actor: 'coen-ataca', x: 50, alto: 16, delante: true, de: 0, a: 1, ms: 2400 },
        { texto: { titulo: 'Desde el cielo…', texto: 'llegó Rancek volando sobre su báculo, y el dragón lanzó su fuego rosado. ¡Los monstruitos huyeron!' }, ms: 200 },
        { nombre: 'rancek', img: 'assets/cuento/popup/rancek-vuela.webp', x: 26, alto: 13, clase: 'vuela', efecto: 'flota', ms: 900 },
        { nombre: 'fuego', img: 'assets/cuento/popup/dragon-fuego.webp', x: 60, alto: 14, clase: 'vuela', reemplaza: 'dragon', ms: 1400 },
        { quita: ['mo1', 'mo2', 'mo3', 'mo4'], ms: 900 },
        { quita: ['ari', 'coen', 'rancek', 'fuego'], texto: { titulo: 'Cuando la niebla se despejó…', texto: 'los tres caminaron juntos hacia el castillo. Porque, a pesar de las dificultades, siempre llegarán a la cima: al castillo soñado.' }, ms: 400 },
        { actor: 'dragon', camina: [0, 1], desde: 34, x: 70, alto: 10, clase: 'vuela', ms: 4400, junto: true },   // y vuela hacia el castillo
        { nombre: 'pari', img: 'assets/personajes/ari-lado.webp', camina: [0, 0], desde: 16, x: 50, alto: 16, ms: 4200, delante: true, junto: true },
        { nombre: 'pcoen', img: 'assets/personajes/coen-lado.webp', camina: [0, 0], desde: 8, x: 42, alto: 17, ms: 4200, delante: true, junto: true },
        { nombre: 'prancek', img: 'assets/personajes/rancek-lado.webp', camina: [0, 0], desde: 2, x: 34, alto: 17, ms: 4200, delante: true }
      ] }
    ] },
    vi: { carpeta: 'cap6/', hitos: [
      { fondo: 'fondo-tienda.webp', suelo: 'suelo-tienda.webp', titulo: 'La tienda mágica de Rancek', texto: 'Joyas, vestidos, perfumes y trajes encantados.', pasos: [
        { nombre: 'mago', img: 'assets/personajes/rancek-frente.webp', x: 40, alto: 16, fila: 'medio', ms: 900 },                    // Rancek atiende detrás del mostrador
        { nombre: 'coen', img: 'assets/personajes/coen-frente.webp', camina: [0, 0], desde: 96, x: 74, alto: 17, ms: 3200, delante: true, junto: true },
        { nombre: 'ari', img: 'assets/personajes/ari-frente.webp', camina: [0, 0], desde: 90, x: 62, alto: 16, ms: 3000, delante: true },   // Ari y Coen entran
        { texto: { titulo: 'Rancek:', texto: '«¡Bienvenidos a mi tienda! ¿Qué se les ofrece?»' }, nombre: 'mago', efecto: 'salta', ms: 2200 },
        { texto: { titulo: 'Ari:', texto: '«¡Algo bonito para la fiesta del reino! ✧»' }, nombre: 'ari', efecto: 'salta', ms: 2200 },
        { texto: { titulo: 'Tú manejas la caja', texto: 'Elige lo que compran, aplica un descuento, cobra… ¡y entrega la boleta!' }, app: true, ms: 600 }
      ] }
    ] },
    paseo: { carpeta: 'cap6/', hitos: [
      { fondo: 'fondo-paseo.webp', suelo: 'suelo-paseo.webp', titulo: 'Con sus compras puestas…', texto: 'Ari con su vestido de chica mágica y sus botas de plataforma; Coen con su jogger blanco y su polera burdeo.', pasos: [
        { nombre: 'pareja', actor: 'paseo', camina: [0, 1], cicloMs: 1500, desde: 12, x: 58, alto: 17, ms: 5200, delante: true },   // salen a pasear por el reino
        { texto: { titulo: 'Rancek:', texto: '«¡Espérenme! ¡Yo también voy!»' }, nombre: 'rancek', actor: 'rancek-corre', camina: [0, 1], cicloMs: 900, desde: 4, x: 32, alto: 13, ms: 2600, delante: true }   // y Rancek corre detrás
      ] }
    ] },
    vii: { carpeta: 'cap7/', hitos: [
      { fondo: 'fondo-mercado.webp', suelo: 'suelo-mercado.webp', titulo: 'La tiendita creció…', texto: '…hasta convertirse en un mercado entero.', pasos: [
        { nombre: 'vitrina', img: 'vitrina.webp', x: 52, alto: 19, fila: 'medio', efecto: 'brilla', ms: 1800,
          texto: { titulo: 'Magical Alliance', texto: 'Mi proyecto final Full Stack Java: roles, catálogo, carrito, cupones, pedidos, stock y panel de administración.' } },
        { nombre: 'ari', img: 'assets/cuento/ari-casual.webp', x: 28, alto: 16, delante: true, ms: 1200 },                       // Ari llega como clienta…
        { nombre: 'coen', img: 'assets/personajes/coen-frente.webp', x: 76, alto: 17, delante: true, ms: 1200,
          texto: { titulo: 'Clienta o administradora', texto: 'Llena el carrito y mira cómo cambia el stock.' } },                     // …y Coen la acompaña
        { nombre: 'ari', efecto: 'salta', ms: 1400 },
        { app: true, ms: 400 }
      ] }
    ] },
    viii: { carpeta: 'cap8/', hitos: [
      { fondo: 'fondo-taller.webp', suelo: 'suelo-taller.webp', titulo: 'Aprendí sola', texto: 'Primero con papel, lápices y pintura…', pasos: [
        { nombre: 'papel1', img: 'assets/galeria/papel-luna-sakura.webp', x: 16, alto: 9, fila: 'atras', clase: 'cuadro', ms: 300, pausa: 200 },
        { nombre: 'papel2', img: 'assets/galeria/papel-amerikano.webp', x: 84, alto: 10, fila: 'atras', clase: 'cuadro', ms: 900 },
        { actor: 'atril', x: 32, alto: 16, de: 0, a: 1, ms: 4000, texto: { titulo: 'Después con tableta…', texto: '…redibujando hasta encontrar mi propio trazo.' } },
        { nombre: 'lienzo', img: 'assets/galeria/regalo-1.webp', linea: 'assets/galeria/regalo-1-lineart.webp', x: 66, alto: 17, clase: 'cuadro', ms: 4600,
          texto: { titulo: 'Así nace cada ilustración', texto: 'Primero la línea… y después el color.' } }
      ] }
    ] },
    galeria: { carpeta: 'cap8/', hitos: [
      { fondo: 'fondo-galeria.webp', suelo: 'suelo-galeria.webp', pasos: [
        { nombre: 'achachila', img: 'assets/galeria/achachila.webp', x: 9.0, alto: 15, clase: 'cuadro', ms: 250, pausa: 150 },
        { nombre: 'alicanto', img: 'assets/galeria/alicanto.webp', x: 20.7, alto: 15, fila: 'medio', clase: 'cuadro', ms: 250, pausa: 150 },
        { nombre: 'lascar', img: 'assets/galeria/lascar.webp', x: 32.4, alto: 15, clase: 'cuadro', ms: 250, pausa: 150 },
        { nombre: 'lica', img: 'assets/galeria/lica.webp', x: 44.1, alto: 15, fila: 'medio', clase: 'cuadro', ms: 250, pausa: 150 },
        { nombre: 'puma', img: 'assets/galeria/puma.webp', x: 55.8, alto: 15, clase: 'cuadro', ms: 250, pausa: 150 },
        { nombre: 'reina-noche', img: 'assets/galeria/reina-noche.webp', x: 67.5, alto: 15, fila: 'medio', clase: 'cuadro', ms: 250, pausa: 150 },
        { nombre: 'supai', img: 'assets/galeria/supai.webp', x: 79.2, alto: 15, clase: 'cuadro', ms: 250, pausa: 150 },
        { nombre: 'tirana-1', img: 'assets/galeria/tirana-1.webp', x: 90.9, alto: 15, fila: 'medio', clase: 'cuadro', ms: 250, pausa: 150 },
        { app: true, ms: 300 }
      ] }
    ] },
    ix: { carpeta: 'cap9/', hitos: [
      { fondo: 'fondo-torre.webp', suelo: 'suelo-torre.webp', titulo: 'En lo alto de la torre…', texto: 'vive un oráculo que guarda los colores y las canciones favoritas de quienes lo visitan.', pasos: [
        { nombre: 'oraculo', img: 'oraculo.webp', x: 24, alto: 16, efecto: 'flota', clase: 'brilla', ms: 2200 },
        { nombre: 'pergamino', img: 'pergamino.webp', x: 62, alto: 30, clase: 'pergamino-datos', ms: 1600 },
        { texto: { titulo: 'Lo que aprendió', texto: '' }, ms: 400, evento: 'oraculo-cartel' }
      ] }
    ] },
    x: { carpeta: 'cap10/', hitos: [
      { fondo: 'fondo-juegos.webp', suelo: 'suelo-juegos.webp', titulo: 'El salón de los juegos', texto: 'Toca una máquina para jugar.', pasos: [
        { nombre: 'a1', img: 'arcade1.webp', x: 25, alto: 17, fila: 'medio', abre: 'bloques', rotulo: 'Bloques encantados', ms: 300, pausa: 200 },
        { nombre: 'a2', img: 'arcade2.webp', x: 50, alto: 17, fila: 'medio', abre: 'gemas', rotulo: 'Jardín de gemas lunares', ms: 300, pausa: 200 },
        { nombre: 'a3', img: 'arcade3.webp', x: 75, alto: 17, fila: 'medio', abre: 'estrellas', rotulo: 'Cielo de constelaciones', ms: 300 }
      ] }
    ] },
    final: { carpeta: 'final/', hitos: [
      { fondo: 'fondo-cima.webp', suelo: 'suelo-cima.webp', titulo: 'No es el fin…', texto: '…es solo el inicio.', pasos: [
        { nombre: 'ari', actor: 'baculo-anim', x: 50, alto: 17, efecto: 'brilla', ms: 2600, bucle: [0, 1], cicloMs: 3000,
          texto: { titulo: 'A pesar de los obstáculos…', texto: 'siempre debes alcanzar tu sueño.' } },
        { evento: 'cuento-dibuja-mundo', ms: 6500 }                                           // un rato para leer, y Ari dibuja su mundo
      ] }
    ] },
    logros: { carpeta: 'logros/', hitos: [
      { fondo: 'fondo-podio.webp', suelo: 'suelo-podio.webp', titulo: 'Logro desbloqueado', texto: 'Junio de 2026: Desarrollo de Aplicaciones Full Stack Java, 480 horas de SENCE y Talento Digital.', pasos: [
        { nombre: 'ari', actor: 'medalla', x: 50, alto: 16, efecto: 'brilla', ms: 2800, bucle: [0, 1], cicloMs: 3000 },                       // Ari levanta su medalla en el podio
        { nombre: 'ari', efecto: 'salta', ms: 2600, texto: { titulo: 'Y sigo aprendiendo', texto: 'Certificado de Análisis de Datos de Google (Coursera): cinco cursos aprobados.' } }
      ] },
      { fondo: 'fondo-stream.webp', suelo: 'suelo-stream.webp', titulo: 'ArianesDCoen', texto: 'Nuestro canal de streaming: videojuegos, risas y una comunidad que nos acompañaba.', pasos: [
        { nombre: 'streamers', actor: 'streamers-anim', x: 50, alto: 15.7, fila: 'medio', ms: 2400, bucle: [0, 1], cicloMs: 3000 },                                                  // Ari y Coen juegan en vivo
        { nombre: 'publico', img: 'publico.webp', x: 50, alto: 7, clase: 'primer', efecto: 'salta', ms: 2600,
          texto: { titulo: '¡En vivo!', texto: 'El público animaba con corazones y barras de luz.' } },                     // el público los anima
        { texto: { titulo: 'En pausa… por ahora', texto: 'Lo pausamos por los proyectos… ¡pero volveremos!' }, ms: 2400 }
      ] }
    ] },
    cv: { carpeta: 'logros/', hitos: [
      { fondo: 'fondo-mapa.webp', suelo: 'suelo-mapa.webp', titulo: 'El mapa de mi camino', texto: 'Cada lugar de mi historia se levanta en el año en que llegué.', pasos: [
        { nombre: 'lugarb1', img: 'assets/cuento/logros/lugarb1.webp', x: 8, alto: 10, rotulo: '2018', ms: 2300, texto: { titulo: '2018 · Matrona · titulación con distinción', texto: 'Universidad San Sebastián, Concepción.' } },
        { nombre: 'lugar1', img: 'assets/cuento/logros/lugar1.webp', x: 20, alto: 9, fila: 'medio', rotulo: '2019', ms: 2300, texto: { titulo: '2019 · Matrona · Hospital de Andacollo', texto: 'Clínica de Lactancia Materna, programa VIH y atención primaria.' } },
        { nombre: 'lugar2', img: 'assets/cuento/logros/lugar2.webp', x: 32, alto: 10, rotulo: '2019 – 2021', ms: 2300, texto: { titulo: '2019 – 2021 · Matrona clínica · Hospital San José de Coronel', texto: 'Urgencias obstétricas, preparto, parto y puerperio.' } },
        { nombre: 'lugar3', img: 'assets/cuento/logros/lugar3.webp', x: 44, alto: 9, fila: 'medio', rotulo: '2021', ms: 2300, texto: { titulo: '2021 · Matrona · CESFAM O\'Higgins', texto: 'Atención integral, planillas de PAP y mamografía, campañas educativas.' } },
        { nombre: 'lugar4', img: 'assets/cuento/logros/lugar4.webp', x: 56, alto: 10, rotulo: '2022 – 2023', ms: 2300, texto: { titulo: '2022 – 2023 · Matrona · SSMSO', texto: 'Campañas de PAP en clínicas móviles y seguimiento de pacientes.' } },
        { nombre: 'lugarb2', img: 'assets/cuento/logros/lugarb2.webp', x: 68, alto: 9, fila: 'medio', rotulo: '2024', ms: 2300, texto: { titulo: '2024 · Educadora · Academia Aliwen', texto: 'Matemáticas, Ciencias y Lenguaje con material adaptado.' } },
        { nombre: 'lugarb3', img: 'assets/cuento/logros/lugarb3.webp', x: 80, alto: 10, rotulo: '2025 – 2026', ms: 2300, texto: { titulo: '2025 – 2026 · VILU · arte y 3D', texto: 'Line art de 14 personajes, modelado, rigging y animación en Blender, integración en Godot.' } },
        { nombre: 'lugarb4', img: 'assets/cuento/logros/lugarb4.webp', x: 92, alto: 9, fila: 'medio', rotulo: '2026 – hoy', ms: 2300, texto: { titulo: '2026 – hoy · Socia fundadora · Studios Conari SpA', texto: 'Diseño editorial, ilustración, 3D, sitio web y administración.' } },
        { texto: { titulo: 'Mi currículum completo', texto: 'Experiencia, formación y habilidades.' }, app: true, ms: 400 }
      ] }
    ] },
    iii: { carpeta: 'cap3/', textos: 'huellas', hitos: [
      { fondo: 'fondo-cesfam.webp', suelo: 'suelo-cesfam.webp', pasos: [
        { actor: 'disp', x: 50, alto: 16, de: 0, a: 1, ms: 5000 },                   // al centro: arma el dispensador y lo muestra
        { actor: 'muro', x: 74, alto: 17, de: 0, a: 1, ms: 3500, quita: 'disp' },    // a la derecha: lo instala en el muro
        { actor: 'pac', camina: [0, 1], desde: 92, x: 82, alto: 16.5, ms: 3400, delante: true },   // una paciente llega caminando desde la derecha…
        { actor: 'pac', de: 2, a: 3, ms: 3000 }                                       // …saca uno del dispensador y sonríe
      ] },
      { fondo: 'fondo-feria.webp', suelo: 'suelo-feria.webp', pasos: [
        { actor: 'edu', x: 28, alto: 16, de: 0, a: 1, ms: 4500 }                      // a la izquierda: explica con una lámina a las alumnas
      ] },
      { fondo: 'fondo-plaza.webp', suelo: 'suelo-plaza.webp', pasos: [
        { actor: 'abr', x: 56, alto: 16, de: 0, a: 1, ms: 4500 }                      // al centro: un transeúnte llega y la abraza
      ] },
      { fondo: 'fondo-biblioteca.webp', suelo: 'suelo-biblioteca.webp', pasos: [
        { actor: 'tes', x: 27, alto: 15, de: 0, a: 1, ms: 4000 },                     // a la izquierda: escribe la tesis y la muestra
        { actor: 'par', x: 72, alto: 13, de: 0, a: 1, ms: 3500 }                      // a la derecha: el cariño de los adultos mayores
      ] },
      { fondo: 'fondo-box.webp', suelo: 'suelo-box.webp', pasos: [
        { actor: 'pla', x: 44, alto: 15, de: 0, a: 1, ms: 4500 }                      // los papeles se vuelven planilla
      ] },
      { fondo: 'fondo-familia.webp', suelo: 'suelo-familia.webp', pasos: [
        { actor: 'ccc', x: 64, alto: 16, de: 0, a: 1, ms: 4500 }                      // a la derecha: graba el video para las familias
      ] },
      { fondo: 'assets/cuento/cap2/g05f-fondo.webp', suelo: 'assets/cuento/cap2/g05f-suelo.webp', pasos: [
        { actor: 'ssm', x: 36, alto: 16, de: 0, a: 1, ms: 4500 }                      // a la izquierda: guía a las mujeres hacia el camión
      ] }
    ] },
  };
  const ruta = (esc, n) => n.startsWith('assets/') ? n : 'assets/cuento/' + esc.carpeta + n;
  const hojas = {};
  const hojaDe = src => hojas[src] || (hojas[src] = fetch(src.replace(/\.webp$/, '.json')).then(r => r.json()).then(m => ({ ...m, marcas: m.marcas || [...Array(m.n).keys()] })));
  // las hojas pesan: se cargan recién al llegar al pliego, la primera escena antes que las demás
  const precargar = esc => esc.hitos.forEach((h, i) => setTimeout(() => {
    if (h.fondo) new Image().src = ruta(esc, h.fondo); new Image().src = ruta(esc, h.suelo);
    h.pasos.forEach(p => { if (p.actor) { hojaDe(ruta(esc, p.actor + '.webp')); new Image().src = ruta(esc, p.actor + '.webp'); } else if (p.img) new Image().src = ruta(esc, p.img); });
  }, i * 700));
  window.MCEFondoInicial = pag => {
    const h = pag.querySelector('[data-hitos]');
    if (h) { const esc = ESCENARIOS[h.dataset.hitos || 'iii']; const H = esc && esc.hitos[0]; return H && H.fondo ? { src: ruta(esc, H.fondo), clase: 'hito-pop hito-fondo', contenedor: '.hitos-escena' } : null; }
    if (pag.querySelector('[data-vida]')) return { src: AMB(GRUPO[0] + '-fondo'), clase: 'vida-pop amb amb-fondo', contenedor: '.vida-ambiente' };
    return null;
  };
  escena('[data-hitos]', el => {
    const esc = ESCENARIOS[el.dataset.hitos || 'iii']; if (!esc) return;
    precargar(esc);
    const pagina = el.closest('.pagina'), zona = el.querySelector('.hitos-escena'), lis = esc.textos === 'huellas' ? [...pagina.querySelectorAll('.huellas > li')] : [];
    const titulo = el.querySelector('.hito-titulo'), texto = el.querySelector('.hito-texto'), num = el.querySelector('.hito-num'), play = el.querySelector('.hito-play');
    const total = esc.hitos.length;
    let h = -1, pausa = false, vuelta = 0, fondoActual = '';
    const actores = {};
    const nombre = p => p.nombre || p.actor || p.img;
    const levantar = (im, d) => { if (document.getElementById('libro')?.classList.contains('recien-girado') && /fondo/.test(im.className)) { im.classList.add('ya'); (im.classList.contains('amb') ? el.querySelector('.vida-ambiente') : zona).append(im); return; } im.classList.add('pliega'); im.style.setProperty('--d', d + 's'); zona.append(im); requestAnimationFrame(() => requestAnimationFrame(() => im.classList.remove('pliega'))); };
    const plegar = n => { const a = n.nodeType ? n : actores[n]; if (!a) return; a.classList.add('pliega'); setTimeout(() => a.remove(), 900); if (!n.nodeType) delete actores[n]; };
    const sacar = n => { const a = actores[n]; if (a) { a.remove(); delete actores[n]; } };   // sin plegarse: otro actor toma su lugar
    // un cuadro de la hoja; entre dos cuadros se funde (suaviza los saltos)
    const cuadro = (a, f) => {
      const m = a._m; if (!m) return;
      const k = Math.max(0, Math.min(m.n - 1, Math.floor(f))), fr = f - k, filas = Math.ceil(m.n / m.cols);
      const pos = j => ((j % m.cols) / Math.max(1, m.cols - 1) * 100) + '% ' + (Math.floor(j / m.cols) / Math.max(1, filas - 1) * 100) + '%';
      a.children[0].style.backgroundPosition = pos(k); a.children[1].style.backgroundPosition = pos(Math.min(m.n - 1, k + 1)); a.children[1].style.opacity = fr.toFixed(3);
    };
    const tam = src => new Promise(ok => { const i = new Image(); i.onload = () => ok({ w: i.naturalWidth, h: i.naturalHeight }); i.onerror = () => ok({ w: 1, h: 1 }); i.src = src; });
    const actor = async (p, d, sinPliegue) => {
      const n = nombre(p); if (actores[n]) return actores[n];
      const a = document.createElement('div');
      let w, hh;
      if (p.actor) {
        const m = await hojaDe(ruta(esc, p.actor + '.webp')); a._m = m; w = m.w; hh = m.h; a.innerHTML = '<i></i><i></i>';
        [...a.children].forEach(c => { c.style.backgroundImage = 'url(' + ruta(esc, p.actor + '.webp') + ')'; c.style.backgroundSize = (m.cols * 100) + '% ' + (Math.ceil(m.n / m.cols) * 100) + '%'; });
      } else {
        const t = await tam(ruta(esc, p.img)); w = t.w; hh = t.h; a.classList.add('hito-fija');
        a.innerHTML = '<img alt="" src="' + ruta(esc, p.img) + '">' + (p.linea ? '<img class="hito-linea" alt="" src="' + ruta(esc, p.linea) + '">' : '');
      }
      a._ancho = p.ancho ?? p.alto * w / hh;
      a.classList.add('hito-pop', 'hito-actor'); if (p.delante) a.classList.add('delante'); if (p.fila) a.classList.add('fila-' + p.fila); if (p.clase) a.classList.add(...p.clase.split(' '));
      a.style.left = ((p.desde ?? p.x) - a._ancho / 2) + '%'; a.style.width = a._ancho + '%'; a.style.aspectRatio = w + ' / ' + hh;
      if (a._m) cuadro(a, a._m.marcas[p.camina ? p.camina[0] : (p.de ?? 0)]);
      actores[n] = a; window.dispatchEvent(new CustomEvent('cuento-actor', { detail: a }));
      if (sinPliegue) { a.classList.add('ya'); zona.append(a); } else levantar(a, d);
      return a;
    };
    const tramo = (a, de, al, ms, mia) => new Promise(fin => {
      const t0 = performance.now(); a._vive = null;
      const paso = t => { if (mia !== vuelta || !a.isConnected) { fin(false); return; } const u = Math.min(1, (t - t0) / ms); cuadro(a, de + (al - de) * u); if (u < 1) requestAnimationFrame(paso); else fin(true); };
      if (quieto) { cuadro(a, al); fin(true); } else requestAnimationFrame(paso);
    });
    // animación que sigue viva en bucle (ida y vuelta, sin salto) mientras la escena esté a la vista
    const vivir = (a, c0, c1, ms, mia) => { if (quieto || c1 <= c0) return; const t0 = performance.now(); a._vive = t0; const paso = t => { if (mia !== vuelta || !a.isConnected || a._vive !== t0) return; const u = ((t - t0) % (2 * ms)) / ms; cuadro(a, c0 + (c1 - c0) * (u < 1 ? u : 2 - u)); requestAnimationFrame(paso); }; requestAnimationFrame(paso); };
    const caminar = (a, p, mia) => new Promise(fin => {
      const m = a._m, c0 = m ? m.marcas[p.camina[0]] : 0, c1 = m ? m.marcas[p.camina[1]] : 0, t0 = performance.now(), CICLO = p.cicloMs || 1000; a._vive = null;
      a.classList.add('camina'); a.classList.toggle('camina-fija', c1 <= c0);
      const paso = t => {
        if (mia !== vuelta || !a.isConnected) { fin(false); return; }
        const u = Math.min(1, (t - t0) / p.ms);
        a.style.left = (p.desde + (p.x - p.desde) * u - a._ancho / 2).toFixed(2) + '%';
        if (c1 > c0) cuadro(a, c0 + (((t - t0) % CICLO) / CICLO) * (c1 - c0));
        if (u < 1) requestAnimationFrame(paso); else { a.classList.remove('camina', 'camina-fija'); fin(true); }
      };
      if (quieto) { a.style.left = (p.x - a._ancho / 2) + '%'; fin(true); } else requestAnimationFrame(paso);
    });
    // imagen que se dibuja sola: primero la línea (de arriba hacia abajo) y luego el color
    const dibujar = (a, ms, mia) => new Promise(fin => {
      a.style.setProperty('--dur', ms + 'ms'); a.classList.add('dibuja');
      luego(() => { a.classList.add('colorea'); luego(() => fin(mia === vuelta), ms * .5); }, ms * .65);
    });
    const espera = (ms, mia) => new Promise(fin => luego(() => fin(mia === vuelta), ms));
    const suelo = src => { const capas = zona.querySelectorAll('.hitos-suelo i'), nueva = [...capas].find(c => !c.classList.contains('ver')) || capas[0]; nueva.style.backgroundImage = 'url("' + ruta(esc, src) + '")'; capas.forEach(c => c.classList.toggle('ver', c === nueva)); };
    const cartel = (n, H) => {
      const li = lis[n], t = H.titulo ?? (li ? li.querySelector('b').textContent : ''), x = H.texto ?? (li ? li.querySelector('span').textContent : '');
      if (titulo) titulo.textContent = t; if (texto) texto.textContent = x;
      if (num) num.textContent = (n + 1) + ' / ' + total;
    };
    const mostrar = async n => {
      h = n; const mia = ++vuelta, H = esc.hitos[Math.min(n, total - 1)];
      el.classList.remove('llego'); document.getElementById('libro')?.classList.remove('invita');
      cartel(n, H);
      Object.keys(actores).forEach(plegar);
      if (H.fondo && H.fondo !== fondoActual) {
        zona.querySelectorAll('.hito-fondo').forEach(plegar); fondoActual = H.fondo;
        const f = document.createElement('img'); f.src = ruta(esc, H.fondo); f.alt = ''; f.className = 'hito-pop hito-fondo'; levantar(f, .05);
      }
      if (H.suelo) suelo(H.suelo);
      if (!(await espera(900, mia))) return;
      for (const p of H.pasos) {
        if (p.quita) { [].concat(p.quita).forEach(plegar); if (!(await espera(500, mia))) return; }
        if (p.texto) { if (titulo && p.texto.titulo != null) titulo.textContent = p.texto.titulo; if (texto) texto.textContent = p.texto.texto ?? ''; }
        if (p.app) window.dispatchEvent(new CustomEvent('cuento-app', { detail: { abrir: p.app } }));
        if (p.evento) { const ev = p.evento; luego(() => { if (mia === vuelta) window.dispatchEvent(new CustomEvent(ev, { detail: { zona } })); }, p.ms || 400); }
        if (!nombre(p)) { if (!(await espera(p.ms || 600, mia))) return; continue; }
        const nuevo = !actores[nombre(p)];
        const a = await actor(p, p.d ?? .1, !!p.reemplaza);
        if (p.reemplaza) [].concat(p.reemplaza).forEach(sacar);
        if (!(await espera(nuevo && !p.reemplaza ? 1100 : 300, mia))) return;
        if (p.efecto) a.classList.add(p.efecto);
        if (p.abre && !a.dataset.abre) { a.dataset.abre = p.abre; a.classList.add('clicable'); a.addEventListener('click', () => window.dispatchEvent(new CustomEvent('cuento-app', { detail: { abrir: p.abre } }))); }
        if (p.rotulo && !a.querySelector('.hito-rotulo')) { const r = document.createElement('span'); r.className = 'hito-rotulo'; r.textContent = p.rotulo; a.append(r); }
        let ok;
        if (p.junto) { if (p.camina) caminar(a, p, mia); await espera(120, mia); continue; }
        if (p.mueve != null) ok = await new Promise(fin => { a.style.transition = 'left ' + (p.ms || 1200) + 'ms cubic-bezier(.45,0,.3,1)'; a.style.left = (p.mueve - a._ancho / 2) + '%'; luego(() => { a.style.transition = ''; fin(mia === vuelta); }, p.ms || 1200); });
        else if (p.camina) ok = await caminar(a, p, mia);
        else if (p.linea) ok = await dibujar(a, p.ms || 3000, mia);
        else if (a._m && p.a != null) ok = await tramo(a, a._m.marcas[p.de ?? 0], a._m.marcas[p.a], p.ms, mia);
        else ok = await espera(p.ms || 600, mia);
        if (!ok) return;
        if (p.bucle && a._m) vivir(a, a._m.marcas[p.bucle[0]], a._m.marcas[p.bucle[1]], p.cicloMs || 2600, mia);
        if (!(await espera(p.pausa ?? 1300, mia))) return;
      }
      if (!(await espera(1800, mia))) return;
      if (pausa) return;
      if (h + 1 < total) mostrar(h + 1);
      else { el.classList.add('llego'); document.getElementById('libro')?.classList.add('invita'); }
    };
    const ant = el.querySelector('.hito-ant'), sig = el.querySelector('.hito-sig');
    if (ant) ant.onclick = () => { if (h > 0) mostrar(h - 1); };
    if (sig) sig.onclick = () => { if (h + 1 < total) mostrar(h + 1); };
    if (play && esc.repetible !== false && !el.querySelector('.hito-ant')) play.onclick = () => { zona.querySelectorAll('.hito-pop').forEach(p => p.remove()); Object.keys(actores).forEach(k => delete actores[k]); fondoActual = ''; mostrar(0); };
    else if (play) play.onclick = () => { pausa = !pausa; play.textContent = pausa ? '▶' : '❚❚'; play.setAttribute('aria-label', pausa ? 'Seguir' : 'Pausar'); if (!pausa && el.classList.contains('llego')) mostrar(0); };
    // al abrir: el pliego se despliega cuando el libro ya se acostó
    zona.querySelectorAll('.hito-pop').forEach(p => p.remove()); Object.keys(actores).forEach(k => delete actores[k]);
    const girado = document.getElementById('libro')?.classList.contains('recien-girado');
    el.classList.remove('abierta'); if (girado) { el.classList.add('abierta'); mostrar(0); } else luego(() => { el.classList.add('abierta'); mostrar(0); }, quieto ? 0 : 1250);
  });

  // IX · el análisis del oráculo: cruza edad, color y música, los dibuja a mano y saca una conclusión
  const ETAPAS = [[1, 12, 'Niñez', '1–12'], [13, 17, 'Adolescencia', '13–17'], [18, 29, 'Juventud', '18–29'], [30, 44, 'Adultez', '30–44'], [45, 120, 'Madurez', '45+']];
  const contar = (lista, k) => { const m = new Map(); lista.forEach(r => m.set(r[k], (m.get(r[k]) || 0) + 1)); return [...m].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0]), 'es')); };
  const pc = (n, d) => Math.round(n / Math.max(1, d) * 100);
  const analizar = () => {
    const O = window.MCEOraculo; if (!O || !O.filas || !O.filas.length) return null;
    const filas = O.filas, total = filas.length, colores = contar(filas, 'color');
    const etapas = ETAPAS.map(([a, b, nom, rango]) => {
      const g = filas.filter(r => r.edad >= a && r.edad <= b); if (!g.length) return null;
      const [c, nc] = contar(g, 'color')[0], [m, nm] = contar(g, 'musica')[0];
      return { nom, rango, n: g.length, color: c, pcColor: pc(nc, g.length), musica: m, pcMusica: pc(nm, g.length) };
    }).filter(Boolean);
    // color ↔ música: qué escuchan quienes eligen cada color
    const pares = colores.slice(0, 3).map(([c, n]) => { const g = filas.filter(r => r.color === c), [m, nm] = contar(g, 'musica')[0]; return { color: c, musica: m, pc: pc(nm, g.length) }; });
    const joven = etapas[0], mayor = etapas[etapas.length - 1];
    const cambia = etapas.length > 1 && (joven.color !== mayor.color || joven.musica !== mayor.musica);
    const conclusion = `<b>Conclusión:</b> ${cambia
      ? `el color y la música cambian juntos con la edad. En la ${joven.nom.toLowerCase()} (${joven.rango}) domina el <b>${joven.color}</b> con <b>${joven.musica}</b>; en la ${mayor.nom.toLowerCase()} (${mayor.rango}), el <b>${mayor.color}</b> con <b>${mayor.musica}</b>.`
      : `todas las edades coinciden en el <b>${joven.color}</b> y la música <b>${joven.musica}</b>.`}
      El color más elegido es el <b>${colores[0][0]}</b> (${pc(colores[0][1], total)}%), y quienes lo eligen escuchan sobre todo <b>${pares[0].musica}</b> (${pares[0].pc}%).${total < 12 ? ' Son pocas personas: es una tendencia, no una regla.' : ''}`;
    return { total, colores, etapas, pares, conclusion, hex: O.hex || {} };
  };
  // trazo de lápiz: un filtro de temblor hace que las líneas se vean dibujadas a mano
  const LAPIZ = '<defs><filter id="lapiz" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="3.2"/></filter></defs>';
  const torta = (A, r = 70, cx = 100, cy = 100, conEtiquetas = true) => {
    let ang = -Math.PI / 2, svg = '';
    const top = A.colores.slice(0, 6), resto = A.total - top.reduce((s, [, n]) => s + n, 0), partes = resto > 0 ? [...top, ['Otros', resto]] : top;
    partes.forEach(([c, n]) => {
      const fr = n / A.total, a2 = ang + fr * Math.PI * 2, gran = fr > .5 ? 1 : 0, ri = r * .48;
      const p = (rr, a) => (cx + rr * Math.cos(a)).toFixed(1) + ' ' + (cy + rr * Math.sin(a)).toFixed(1);
      const d = fr >= .999 ? `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0M${cx - ri} ${cy}a${ri} ${ri} 0 1 1 ${2 * ri} 0a${ri} ${ri} 0 1 1 ${-2 * ri} 0`
        : `M${p(r, ang)}A${r} ${r} 0 ${gran} 1 ${p(r, a2)}L${p(ri, a2)}A${ri} ${ri} 0 ${gran} 0 ${p(ri, ang)}Z`;
      svg += `<path d="${d}" fill="${A.hex[c] || '#e3d6ee'}" stroke="#6b3a5e" stroke-width="2.4" stroke-linejoin="round" fill-rule="evenodd"/>`;
      const med = (ang + a2) / 2;
      if (conEtiquetas && fr >= .08) svg += `<text x="${(cx + r * 1.2 * Math.cos(med)).toFixed(1)}" y="${(cy + r * 1.2 * Math.sin(med) + 4).toFixed(1)}" text-anchor="middle" font-family="Mali" font-weight="700" font-size="13" fill="#5e2f52">${pc(n, A.total)}%</text>`;
      ang = a2;
    });
    return `<g filter="url(#lapiz)">${svg}</g><text x="${cx}" y="${cy - 2}" text-anchor="middle" font-family="Mali" font-weight="700" font-size="20" fill="#6a2c55">${A.total}</text><text x="${cx}" y="${cy + 14}" text-anchor="middle" font-family="Mali" font-size="10" fill="#8c5a80">personas</text>`;
  };
  const pintarAnalisis = () => {
    const A = analizar();
    document.querySelectorAll('[data-analisis]').forEach(el => {
      if (!A) { el.innerHTML = '<p>El oráculo aún no conoce a nadie.</p>'; return; }
      el.innerHTML = `<h4>Lo que aprendió el oráculo</h4>
        <div class="oa-fila"><div class="oa-torta"><svg viewBox="0 0 200 200">${LAPIZ}${torta(A)}</svg></div>
          <div class="oa-leyenda">${A.colores.slice(0, 6).map(([c, n]) => `<span><i style="background:${A.hex[c] || '#e3d6ee'}"></i>${c} · ${pc(n, A.total)}%</span>`).join('')}</div></div>
        <table class="oa-tabla"><thead><tr><th>Edad</th><th>Color favorito</th><th>Música favorita</th></tr></thead><tbody>
          ${A.etapas.map(e => `<tr><td>${e.nom} <small>(${e.rango} · ${e.n})</small></td><td><span class="chip-color" style="background:${A.hex[e.color] || '#e3d6ee'}"></span>${e.color} ${e.pcColor}%</td><td>${e.musica} ${e.pcMusica}%<span class="oa-barra" style="width:${Math.round(e.pcMusica * .5)}px"></span></td></tr>`).join('')}
        </tbody></table>
        <p class="oa-conclusion">${A.conclusion}</p>`;
    });
    // el pergamino del libro: la torta y los tres colores principales
    document.querySelectorAll('.pergamino-datos').forEach(p => {
      let caja = p.querySelector('.perg-svg'); if (!caja) { caja = document.createElement('div'); caja.className = 'perg-svg'; p.append(caja); }
      if (!A) { caja.innerHTML = ''; return; }
      const ley = A.colores.slice(0, 3).map(([c, n], k) => `<g transform="translate(205 ${52 + k * 34})"><circle r="9" cx="0" cy="-5" fill="${A.hex[c] || '#e3d6ee'}" stroke="#6b3a5e" stroke-width="2.4"/><text x="16" y="0" font-family="Mali" font-weight="700" font-size="17" fill="#5e2f52">${c} ${pc(n, A.total)}%</text></g>`).join('');
      caja.innerHTML = `<svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">${LAPIZ}<text x="200" y="26" text-anchor="middle" font-family="Mali" font-weight="700" font-size="20" fill="#6a2c55">Colores favoritos</text><g transform="translate(5 22) scale(.85)">${torta(A, 70, 100, 100, false)}</g><g filter="url(#lapiz)">${ley}</g></svg>`;
    });
    // el cartel cuenta la conclusión en corto
    const A2 = A && A.etapas.length ? A : null;
    document.querySelectorAll('[data-hitos="ix"] .hito-texto').forEach(t => { if (A2 && t.closest('.hitos').dataset.cartel === '1') t.textContent = `${A2.etapas[0].nom}: ${A2.etapas[0].color} y ${A2.etapas[0].musica}. ${A2.etapas[A2.etapas.length - 1].nom}: ${A2.etapas[A2.etapas.length - 1].color} y ${A2.etapas[A2.etapas.length - 1].musica}. Mira el análisis completo ↑`; });
  };
  window.addEventListener('oraculo-datos', pintarAnalisis);
  window.addEventListener('cuento-actor', e => { if (e.detail.classList.contains('pergamino-datos')) requestAnimationFrame(pintarAnalisis); });
  window.addEventListener('oraculo-cartel', e => { const H = e.detail?.zona?.closest('.hitos'); if (H) H.dataset.cartel = '1'; pintarAnalisis(); });
  setTimeout(pintarAnalisis, 0);

  // ✦ Final: el báculo dibuja trazos de luz por toda la pantalla, la cámara entra al dibujo con un brillo
  // y aparece la versión clásica, donde el hada dibuja el lineart desde la hoja en blanco y luego lo pinta
  let dibujando = false;
  const dibujarMundo = origen => {
    if (dibujando) return; dibujando = true;
    const capa = document.createElement('div'); capa.className = 'mundo-dibujo'; capa.setAttribute('aria-hidden', 'true');
    const cv = document.createElement('canvas'), brillo = document.createElement('i'); capa.append(cv, brillo); document.body.append(capa);
    const d = Math.min(devicePixelRatio || 1, 1.5), W = cv.width = Math.round(innerWidth * d), H = cv.height = Math.round(innerHeight * d), g = cv.getContext('2d');
    const r = origen ? origen.getBoundingClientRect() : null, x0 = (r ? r.left + r.width * .62 : innerWidth / 2) * d, y0 = (r ? r.top + r.height * .04 : innerHeight / 2) * d;
    const COL = ['#ffd9ea', '#ff8fc0', '#f3d48a', '#c9a6ff', '#ffffff', '#9fe3ff'];
    // trazos: espirales y curvas que nacen del báculo y se abren hasta cubrir la pantalla
    const trazos = Array.from({ length: 44 }, (_, i) => ({ a: i / 44 * Math.PI * 2 + Math.random() * .3, giro: (Math.random() < .5 ? -1 : 1) * (1.2 + Math.random() * 2.6), largo: Math.hypot(W, H) * (.8 + Math.random() * .7), c: COL[i % COL.length], w: (2 + Math.random() * 4) * d, ini: Math.random() * .35 }));
    const DUR = quieto ? 0 : 3400, t0 = performance.now();
    const paso = ahora => {
      const t = Math.min(1, (ahora - t0) / Math.max(1, DUR));
      g.globalCompositeOperation = 'lighter';
      trazos.forEach(s => {
        const u = Math.max(0, Math.min(1, (t - s.ini) / (1 - s.ini))); if (u <= 0) return;
        const p = q => { const rr = q * s.largo, an = s.a + s.giro * q; return [x0 + Math.cos(an) * rr, y0 + Math.sin(an) * rr * .8]; };
        const [ax, ay] = p(Math.max(0, u - .04)), [bx, by] = p(u);
        g.strokeStyle = s.c; g.lineWidth = s.w; g.lineCap = 'round'; g.shadowColor = s.c; g.shadowBlur = 14 * d;
        g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke();
        if (window.Magia && Math.random() < .25) Magia.estela(bx / d, by / d, { n: 1, colores: COL });
      });
      if (t < 1) requestAnimationFrame(paso);
      else entrar();
    };
    // zoom hacia dentro del dibujo con la pantalla brillando; en el blanco cambia a la versión clásica
    const entrar = () => {
      capa.classList.add('entra');
      const escL = document.getElementById('escena'); if (escL) { escL.style.transition = 'opacity 1.2s ease'; escL.style.opacity = '0'; setTimeout(() => { escL.style.opacity = ''; escL.style.transition = ''; }, 2600); }
      setTimeout(() => {
        // el libro desaparece de inmediato bajo el brillo (no se ve cómo se levanta ni sus hojas en blanco)
        const esc = document.getElementById('escena'); if (esc) { esc.style.visibility = 'hidden'; setTimeout(() => { esc.style.visibility = ''; }, 2500); }
        window.MCELibro?.aClasico(null, { pintar: true });
        capa.classList.add('sale');
        setTimeout(() => { capa.remove(); dibujando = false; }, 1100);
      }, quieto ? 0 : 1500);
    };
    requestAnimationFrame(paso);
  };
  window.addEventListener('cuento-dibuja-mundo', e => { const z = e.detail && e.detail.zona; dibujarMundo(z && z.querySelector('.hito-actor')); });
  document.addEventListener('click', e => { if (e.target.closest('[data-entrar-mundo]')) { e.preventDefault(); dibujarMundo(document.querySelector('[data-hitos="final"] .hito-actor')); } });

  document.addEventListener('submit', e => {
    if (e.target.id !== 'lab-form' || !e.target.closest('.colgante-app')) return;
    const n = document.getElementById('lab-nombre'); if (n && !n.value.trim()) n.value = 'Visitante ' + (1 + Math.floor(Math.random() * 99));
  }, true);

  // ✦ juegos colgantes: "Jugar" muestra el tablero en grande (el tetris además arranca); "Ver instrucciones" vuelve a la explicación
  document.addEventListener('click', e => {
    const empezar = e.target.closest('.juego-empezar'), volver = e.target.closest('.juego-volver'), cielo = e.target.closest('.app-estrellas #atlas-gallery button, .app-estrellas #atlas-gallery [role="button"]');
    const app = (empezar || volver || cielo)?.closest('.colgar-app'); if (!app) return;
    app.classList.toggle('jugando', !volver);
    if (empezar && app.classList.contains('app-bloques')) { document.getElementById('play-start')?.click(); setTimeout(() => document.getElementById('play-tetris')?.focus(), 60); }
  });

  // IV · noches de código: escenas que se suceden
  escena('[data-escenas]', el => {
    const cs = [...el.querySelectorAll('.escena-cuadro')], ps = [...el.querySelectorAll('.escenas-puntos i')]; let i = 0;
    const ver = n => { i = n; cs.forEach((c, j) => c.classList.toggle('activa', j === n)); ps.forEach((p, j) => p.classList.toggle('on', j === n)); };
    ver(0);
    const paso = () => { ver((i + 1) % cs.length); luego(paso, 4200); };
    luego(paso, 4200);
    el.onclick = () => { limpiar(); ver((i + 1) % cs.length); luego(paso, 5200); };
  });

  // ✦ currículum con pestañas
  $$('.cv-tabs').forEach(t => t.addEventListener('click', e => {
    const b = e.target.closest('[data-cv]'); if (!b) return;
    const pag = t.closest('.pagina');
    t.querySelectorAll('[data-cv]').forEach(x => x.setAttribute('aria-selected', String(x === b)));
    pag.querySelectorAll('[data-cv-panel]').forEach(p => { p.hidden = p.dataset.cvPanel !== b.dataset.cv; });
  }));

  // ✦ final: el mundo ideal se dibuja y Ari se transforma en hada
  escena('[data-final]', el => {
    const pag = el.closest('.pagina');
    el.classList.remove('dibuja', 'transforma', 'hada'); pag.classList.remove('l1', 'l2'); void el.offsetWidth;
    luego(() => el.classList.add('dibuja'), 200);
    luego(() => pag.classList.add('l1'), 2600);
    luego(() => pag.classList.add('l2'), 4600);
    luego(() => { el.classList.add('transforma'); if (window.Magia) { const r = el.querySelector('.final-trans').getBoundingClientRect(); for (let k = 0; k < 5; k++) setTimeout(() => Magia.chispas(r.left + r.width / 2, r.top + r.height / 2, { n: 26, vel: 4, colores: ['#ff8fc0', '#ffd9ea', '#c9a6ff', '#f3d48a', '#fff'] }), k * 220); } }, 7000);
    luego(() => el.classList.add('hada'), 8200);
  });
  $$('.final-repetir').forEach(b => b.addEventListener('click', () => { limpiar(); ESCENAS.find(([s]) => s === '[data-final]')[1](b.closest('.pagina').querySelector('[data-final]')); }));

  // VII · la ilustración que se dibuja y se pinta
  escena('[data-dibujandose]', el => { el.classList.remove('dibuja', 'pinta'); void el.offsetWidth; luego(() => el.classList.add('dibuja'), 300); luego(() => el.classList.add('pinta'), 3600); });
  $$('.dj-repetir').forEach(b => b.addEventListener('click', () => { const el = b.parentElement.querySelector('[data-dibujandose]'); ESCENAS.find(([s]) => s === '[data-dibujandose]')[1](el); }));

  // VII · obras en papel
  $$('[data-papeles]').forEach(el => {
    [['papel-luna-sakura', 'Luna, lobo y sakura · acrílico sobre papel'], ['papel-amerikano', 'Amerikano · lápices de colores sobre papel']].forEach(([s, t], i) => {
      const f = document.createElement('figure'); f.className = 'papel papel-' + i;
      const img = document.createElement('img'); img.src = 'assets/galeria/' + s + '.webp'; img.alt = t; img.draggable = false; img.loading = 'lazy';
      const c = document.createElement('figcaption'); c.textContent = t; f.append(img, c); el.append(f);
    });
    el.addEventListener('contextmenu', e => e.preventDefault());
  });

  // VII · la galería saluda con vocecitas
  const SALUDOS = { 'Achachila': '¡Hola! Soy el Achachila, cuido los cerros.', 'Alicanto': '¡Hola! Soy el Alicanto, ¡mis alas brillan!', 'Supai': 'Hola… soy Supai, del mundo de abajo.', 'Láscar': '¡Soy Láscar, el volcán!', 'La Tirana': '¡Hola! ¡A bailar en La Tirana!', 'Reina de la Noche': 'Buenas noches… soy la Reina de la Noche.', 'Lica': '¡Hola, hola! Soy Lica.', 'Puma': '¡Grrr… hola! Soy el Puma.', 'Emilia': '¡Hola! ¡Soy Emilia!', 'Regalo': '¡Hola! Soy un regalo hecho con cariño.' };
  $$('[data-saludar]').forEach(b => b.addEventListener('click', () => { document.querySelectorAll('.hitos-escena .hito-actor.cuadro').forEach((a, i) => { a.classList.remove('saluda'); void a.offsetWidth; a.style.setProperty('--k', i); a.classList.add('saluda'); setTimeout(() => a.classList.remove('saluda'), 3200); }); }));
  $$('[data-saludar]').forEach(b => b.addEventListener('click', async () => {
    const obras = $$('#leyendas .obra'); b.disabled = true;
    for (const [i, o] of obras.entries()) {
      const nombre = (o.querySelector('.obra-nombre')?.textContent || '').split(' · ')[0];
      const frase = SALUDOS[nombre] || '¡Hola!';
      o.classList.remove('saluda'); void o.offsetWidth; o.classList.add('saluda');
      let g = o.querySelector('.obra-globo'); if (!g) { g = document.createElement('span'); g.className = 'obra-globo'; o.append(g); }
      g.textContent = frase;
      if (window.Magia) { const r = o.getBoundingClientRect(); Magia.chispas(r.left + r.width / 2, r.top + 20, { n: 10, vel: 2.5 }); }
      if (voz) await decir(frase, { pitch: 1.6 + (i % 4) * .12, rate: 1.12, voz: (voz.getVoices().filter(v => /^es/i.test(v.lang)).sort((x, y) => (MUJER.test(y.name) ? 1 : 0) - (MUJER.test(x.name) ? 1 : 0))[0]) });
      else await new Promise(r => setTimeout(r, 700));
    }
    setTimeout(() => { $$('.obra-globo').forEach(g => g.remove()); b.disabled = false; }, 1600);
  }));

  /* ------------------------------------------------------------ al mostrar páginas */
  window.addEventListener('cuento-pasa', () => { limpiar(); callar(); });
  window.addEventListener('cuento-paginas', e => {
    limpiar();
    const pags = e.detail.paginas;
    pags.forEach(p => ESCENAS.forEach(([sel, fn]) => p.querySelectorAll(sel).forEach(el => fn(el))));
    narrar(pags.filter(p => !p.hasAttribute('data-narracion-propia') || true));
  });
})();

/* ==========================================================================
   Compañeros: Ari salta en la esquina del libro y el dragoncito rosa mira
   lo que hace quien lee.
   ========================================================================== */
(function () {
  'use strict';
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Ari: al bajar dentro de una página salta con agilidad; al tocarla sube con un dash */
  const ari = $('#ari-libro');
  if (ari) {
    let ultimo = 0, t = 0, enDash = false;
    const paginaConScroll = () => [...document.querySelectorAll('#pag-izq > .pagina, #pag-der > .pagina')].find(p => p.scrollTop > 40);
    const salta = cls => { ari.classList.remove('salta', 'aterriza', 'dash', 'agacha'); void ari.offsetWidth; ari.classList.add(cls); };
    document.addEventListener('scroll', e => {
      const p = e.target; if (!(p instanceof Element) || !p.matches('.pag > .pagina')) return;
      const y = p.scrollTop;
      ari.classList.toggle('visible', !!paginaConScroll() || enDash);
      if (!enDash && y - ultimo > 8 && performance.now() - t > 650) { t = performance.now(); salta('salta'); }
      ultimo = y;
    }, true);
    ari.addEventListener('click', () => {
      if (enDash) return; enDash = true; salta('agacha');
      setTimeout(() => {
        salta('dash');
        const r = ari.getBoundingClientRect();
        if (window.Magia) for (let i = 0; i < 8; i++) setTimeout(() => Magia.estela(r.left + r.width / 2, r.top - i * 50, { n: 4, colores: ['#f5a8cf', '#ff6fa8', '#ffd9ea', '#e2ba53'] }), i * 30);
        $$('#pag-izq > .pagina, #pag-der > .pagina').forEach(p => p.scrollTo({ top: 0, behavior: quieto ? 'auto' : 'smooth' }));
      }, quieto ? 0 : 160);
      setTimeout(() => { salta('aterriza'); enDash = false; ari.classList.toggle('visible', !!paginaConScroll()); }, quieto ? 50 : 1100);
    });
    // al pasar la página da un saltito si está a la vista
    window.addEventListener('cuento-pasa', () => { if (ari.classList.contains('visible')) salta('salta'); setTimeout(() => ari.classList.remove('visible'), 400); });
  }

  /* Teatro de papel: con el libro acostado, los recuadros bajan colgados de hilos desde el techo
     y el texto suelto se va escribiendo sobre la hoja, como un cuento que está naciendo */
  (() => {
    const escenaLibro = $('#escena'); if (!escenaLibro) return;
    const teatro = document.createElement('div'); teatro.className = 'teatro'; teatro.setAttribute('aria-hidden', 'false');
    escenaLibro.append(teatro);
    // el cielo: el texto del capítulo se escribe en la galaxia, detrás del libro (las hojas quedan lisas)
    const cielo = document.createElement('div'); cielo.className = 'teatro-cielo';
    $('#libro').before(cielo);
    let enCielo = [];
    const COLGAR = '.botonera, .vida-cartel, .vida-controles, .colgar, .colgar-app';
    const ESCRIBIR = '.cap-num, .cap-titulo, .cuento';
    let colgados = [], turno = 0;
    // cada letra en su propia cajita (una sola vez por elemento); se respetan negritas y la letra capital
    const letras = el => {
      if (el.dataset.letras) return;
      el.dataset.letras = '1';
      const caminar = n => [...n.childNodes].forEach(h => {
        if (h.nodeType === 3) {
          const f = document.createDocumentFragment();
          for (const ch of h.textContent) { if (/\s/.test(ch)) { f.append(ch); continue; } const s = document.createElement('span'); s.className = 'ch'; s.textContent = ch; f.append(s); }
          h.replaceWith(f);
        } else if (h.nodeType === 1 && !h.classList.contains('ch')) caminar(h);
      });
      caminar(el);
    };
    // la esfera nace abajo en el lado contrario, da una vuelta grande alrededor del libro dejando estela y llega a su lugar
    // doble hélice: las esferas suben girando alrededor de un eje vertical al centro, como las dos hebras del ADN
    // (las de la izquierda y las de la derecha van en hebras opuestas); arriba se separan hacia su lugar
    const volarEsfera = (el, retraso, dur, haciaDerecha) => {
      if (!el || quieto) return;
      el.style.opacity = 0;
      const mio = turno;
      setTimeout(() => {
        if (mio !== turno || !el.isConnected) { el.style.opacity = ''; return; }
        const b = el.getBoundingClientRect(), fx = b.left + b.width / 2, fy = b.top + b.height / 2;
        const W = innerWidth, H = innerHeight, cx = W / 2, A = Math.min(W * .26, 420), VUELTAS = 1.5, SUBE = .82;
        const fEnd = haciaDerecha ? Math.PI / 2 : -Math.PI / 2, yTop = Math.max(fy, H * .12);
        const POLVO = ['#ffd9ea', '#c9a6ff', '#fff', '#ffe9a8', '#9fe3ff'];
        const t0 = performance.now(); el.style.opacity = 1; el.classList.add('esfera-vuela');
        const paso = ahora => {
          if (!el.isConnected) return;
          const t = Math.min(1, (ahora - t0) / dur);
          const s1 = Math.min(t, SUBE) / SUBE, fi = Math.max(0, (t - SUBE) / (1 - SUBE));
          const ease = fi < .5 ? 2 * fi * fi : 1 - Math.pow(-2 * fi + 2, 2) / 2;
          const fase = fEnd - 2 * Math.PI * VUELTAS * (1 - s1);
          const hx = cx + A * Math.sin(fase), hy = H + 40 - (H + 40 - yTop) * s1;
          const prof = (Math.cos(fase) + 1) / 2;   // 1 = adelante, 0 = atrás
          const x = hx + (fx - hx) * ease, y = hy + (fy - hy) * ease;
          const esc = (.45 + .5 * prof) * (1 - ease) + ease;
          el.style.transform = 'translate(' + (x - fx).toFixed(1) + 'px,' + (y - fy).toFixed(1) + 'px) scale(' + esc.toFixed(3) + ')';
          el.style.opacity = ((.45 + .55 * prof) * (1 - ease) + ease).toFixed(3);
          if (window.Magia && Math.random() < .55) Magia.estela(x, y, { n: 2, tam: 3.4 + prof * 1.6, vel: .7, colores: POLVO });
          if (t < 1) requestAnimationFrame(paso);
          else { el.style.transform = ''; el.style.opacity = ''; el.classList.remove('esfera-vuela'); if (window.Magia) Magia.chispas(fx, fy, { n: 18, vel: 3, colores: POLVO }); }
        };
        requestAnimationFrame(paso);
      }, retraso);
    };
    const escribir = paginas => {
      let k = 0; cielo.innerHTML = ''; enCielo = [];
      // en el capítulo de las huellas el texto es largo: el cielo se ensancha para que no baje hasta el pop-up
      cielo.classList.toggle('ancho', paginas.some(p => p.classList.contains('pagina-hitos')));
      const angosto = matchMedia('(max-width: 860px) and (orientation: portrait), (max-width: 560px)').matches;
      const lados = angosto ? [] : ['izq', 'der'].map(n => { const d = document.createElement('div'); d.className = 'cielo-lado cielo-' + n; cielo.append(d); return d; });
      let nl = 0;
      const estrellas = [];
      paginas.forEach(p => p.querySelectorAll('.poderes > li').forEach(li => estrellas.push(li)));
      const escribirEstrellas = () => estrellas.forEach(li => {
        if (angosto) return;
        const marca = document.createComment('cielo'); li.before(marca); enCielo.push({ el: li, marca });
        li.classList.remove('por-colgar');
        letras(li); li.classList.add('escribe', 'estrella');
        // cada característica llega como una esfera volando desde el lado contrario; después se escriben sus letras
        const RETRASO = 1400 + nl * 420, VUELO = 4600;
        let kl = 0; li.style.setProperty('--base', ((RETRASO + VUELO) / 1000).toFixed(2) + 's');
        li.querySelectorAll('.ch').forEach(s => s.style.setProperty('--kl', kl++));
        const lado = nl++ % 2; lados[lado].append(li);
        volarEsfera(li.querySelector(':scope > span:not(.ch)'), RETRASO, VUELO, lado === 1);
      });
      paginas.forEach(p => {
        const bloque = document.createElement('div'); bloque.className = 'cielo-bloque';
        p.querySelectorAll(ESCRIBIR).forEach(el => {
          const marca = document.createComment('cielo'); el.before(marca); enCielo.push({ el, marca });
          letras(el); el.classList.add('escribe'); el.classList.remove('por-escribir');
          el.querySelectorAll('.ch').forEach(s => s.style.setProperty('--k', k++));
          bloque.append(el);
        });
        if (bloque.children.length) cielo.append(bloque);
      });
      escribirEstrellas();
      cielo.classList.add('visible');
    };
    const bajarDelCielo = () => {
      cielo.classList.remove('visible');
      enCielo.forEach(({ el, marca }) => { if (marca.isConnected) marca.replaceWith(el); });
      enCielo = []; cielo.innerHTML = '';
    };
    const borrarEscritura = () => document.querySelectorAll('.escribe, .por-escribir, .por-colgar, .estrella').forEach(e => e.classList.remove('escribe', 'por-escribir', 'por-colgar', 'estrella'));
    const colgar = paginas => {
      teatro.innerHTML = ''; colgados = [];
      const angosto = matchMedia('(max-width: 860px) and (orientation: portrait), (max-width: 560px)').matches;
      const zonas = (angosto ? ['der'] : ['izq', 'der']).map(n => { const z = document.createElement('div'); z.className = 'teatro-lado teatro-' + n; teatro.append(z); return z; });
      let i = 0;
      paginas.forEach((p, j) => p.querySelectorAll(COLGAR).forEach(el => {
        if (el.parentElement.closest('.colgar-app')) { el.classList.remove('por-colgar'); return; }   // lo que va dentro de una aplicación cuelga con ella
        const marca = document.createComment('colgante'); el.before(marca); el.classList.remove('por-colgar');
        const c = document.createElement('div'); c.className = 'colgante';
        c.style.setProperty('--i', i); c.style.setProperty('--hilo', (6 + ((i * 29) % 34)) + 'px'); i++;
        const padre = marca.parentElement;
        if (/^(UL|OL)$/.test(padre.tagName)) { const w = document.createElement(padre.tagName); w.className = padre.className; w.append(el); c.append(w); } else c.append(el);
        if (el.classList.contains('colgar-app')) {
          c.classList.add('colgante-app', 'arriba'); c.dataset.app = el.dataset.appId || '';
          const tab = document.createElement('button'); tab.type = 'button'; tab.className = 'app-pestana';
          const nom = el.dataset.app || 'la aplicación', verbo = el.dataset.verbo || 'Usar';
          const rotular = () => { const arriba = c.classList.contains('arriba'); tab.textContent = arriba ? '▼ ' + verbo + ' ' + nom : '▲ Subir'; tab.setAttribute('aria-expanded', String(!arriba)); };
          tab.addEventListener('click', () => { const abrir = c.classList.contains('arriba'); teatro.querySelectorAll('.colgante-app').forEach(o => { o.classList.add('mueve'); clearTimeout(o._mv); o._mv = setTimeout(() => o.classList.remove('mueve'), 1000); o.classList.toggle('arriba', !(abrir && o === c)); o._rotular && o._rotular(); }); });
          c._rotular = rotular; rotular(); c.append(tab);
          // el cuadro entero (con su marco) se achica lo justo para caber entre el borde de arriba y la barra del libro
          const ajustarApp = () => {
            el.style.zoom = ''; c.style.scale = '';
            const nav = document.getElementById('libro-nav'), techo = (c.parentElement ? c.parentElement.getBoundingClientRect().top : 0) + (parseFloat(getComputedStyle(c).marginTop) || 0);
            const piso = nav && nav.offsetParent ? nav.getBoundingClientRect().top - 10 : innerHeight - 10;
            const f = Math.min(1, (piso - techo) / Math.max(1, c.offsetHeight), (innerWidth - 24) / Math.max(1, c.offsetWidth));
            if (f < .995) c.style.scale = Math.max(.42, f).toFixed(3);
          };
          c._ajustar = ajustarApp; new ResizeObserver(() => requestAnimationFrame(ajustarApp)).observe(el); addEventListener('resize', () => requestAnimationFrame(ajustarApp));
          let centro = teatro.querySelector('.teatro-app');
          if (!centro) { centro = document.createElement('div'); centro.className = 'teatro-app'; teatro.append(centro); }
          centro.append(c);
        } else zonas[zonas.length - 1].append(c);
        colgados.push({ el, marca });
      }));
      // los carteles de cada lado siempre caben en la pantalla (si son muchos, se achican lo justo)
      const caber = () => zonas.forEach(z => { z.style.zoom = ''; const r = z.getBoundingClientRect(), disp = innerHeight * .9 - r.top; if (z.scrollHeight > disp && disp > 120) z.style.zoom = Math.max(.6, disp / z.scrollHeight).toFixed(3); });
      requestAnimationFrame(caber); setTimeout(caber, 700);
      const apps = [...teatro.querySelectorAll('.colgante-app')]; apps.forEach((c, k) => c.style.setProperty('--tab', (93 - (apps.length - 1 - k) * 24) + '%'));
      teatro.querySelector('.teatro-app')?.classList.toggle('varias', apps.length > 1);   // con varias, se abren desde la escena
      requestAnimationFrame(() => requestAnimationFrame(() => teatro.classList.add('baja')));
    };
    const descolgar = inmediato => {
      const mio = ++turno, lista = colgados; colgados = [];
      teatro.classList.remove('baja');
      const devolver = () => { lista.forEach(({ el, marca }) => { if (marca.isConnected) { marca.replaceWith(el); } }); if (mio === turno) teatro.innerHTML = ''; };
      if (inmediato || quieto) devolver(); else setTimeout(devolver, 650);
    };
    window.addEventListener('cuento-levanta', () => { descolgar(); bajarDelCielo(); borrarEscritura(); });
    window.addEventListener('resize', () => teatro.querySelectorAll('.colgante-app').forEach(c => c._ajustar && c._ajustar()));
    window.addEventListener('cuento-app', e => { const id = e.detail.abrir; teatro.querySelectorAll('.colgante-app').forEach(c => { c.classList.add('mueve'); clearTimeout(c._mv); c._mv = setTimeout(() => c.classList.remove('mueve'), 1000); const mia = id === true || (typeof id === 'string' && c.dataset.app === id); c.classList.toggle('arriba', !(id && mia)); c._rotular && c._rotular(); }); });
    window.addEventListener('cuento-pasa', () => { if (colgados.length) descolgar(true); bajarDelCielo(); borrarEscritura(); });
    window.addEventListener('cuento-paginas', e => {
      const ps = e.detail.paginas, pop = ps.some(p => p.classList.contains('pagina-pop'));
      if (colgados.length) descolgar(true);
      bajarDelCielo(); borrarEscritura();
      if (!pop) return;
      // mientras el libro se acuesta, el texto y los recuadros esperan escondidos (no se ven planos y luego desaparecen)
      ps.forEach(p => { p.querySelectorAll(ESCRIBIR).forEach(el => el.classList.add('por-escribir')); p.querySelectorAll(COLGAR + ', .poderes > li').forEach(el => el.classList.add('por-colgar')); });
      const mio = turno;
      setTimeout(() => { if (mio !== turno || !$('#libro').classList.contains('acostado')) return; colgar(ps); escribir(ps); }, quieto ? 0 : 1100);
    });
  })();

  /* Dragoncito: vuela cerca del puntero, mira hacia donde vas y celebra lo que haces */
  const dr = $('#dragoncito');
  if (dr) {
    // solo acompaña en la versión clásica, y recién cuando el hada terminó de pintar el reino desde el lineart
    // (nunca en la intro ni dentro del libro)
    const sitio = $('#site'), libroEscena = $('#escena');
    const ver = () => dr.classList.toggle('visible', !!sitio && sitio.classList.contains('ready') && !sitio.classList.contains('pintando')
      && sitio.getAttribute('aria-hidden') !== 'true' && (!libroEscena || libroEscena.classList.contains('oculta')));
    const obs = new MutationObserver(ver);
    [sitio, libroEscena].forEach(n => n && obs.observe(n, { attributes: true, attributeFilter: ['class', 'aria-hidden'] }));
    ver();
    const globo = dr.querySelector('.dragoncito-globo');
    let x = innerWidth - 120, y = 90, tx = x, ty = y, mira = -1, ultimoMov = performance.now(), dormido = false;
    addEventListener('pointermove', e => {
      // se queda a una distancia prudente, arriba del puntero, sin tapar lo que se toca
      tx = Math.min(innerWidth - 70, Math.max(10, e.clientX + (e.clientX > innerWidth / 2 ? -150 : 90)));
      ty = Math.min(innerHeight - 120, Math.max(10, e.clientY - 130));
      ultimoMov = performance.now();
      if (dormido) { dormido = false; dr.classList.remove('duerme'); }
    }, { passive: true });
    const frases = { calc: ['¡Qué cálculo!', '¡Java mágico!'], caja: ['¡Compra lista!', '¡Qué lindo!'], juego: ['¡Bien jugado!', '¡Wiii!'], pagina: ['✦', '♥', '¡Otra página!'], dato: ['¡Anotado!'] };
    const decir = tipo => {
      const f = frases[tipo] || frases.pagina; globo.textContent = f[Math.floor(Math.random() * f.length)];
      dr.classList.remove('feliz'); void dr.offsetWidth; dr.classList.add('feliz');
      if (window.Magia) { const r = dr.getBoundingClientRect(); Magia.chispas(r.left + r.width / 2, r.top + r.height / 2, { n: 10, vel: 2.4, colores: ['#ff8fc0', '#ffd9ea', '#fff'] }); }
    };
    window.addEventListener('cuento-pasa', () => decir('pagina'));
    document.addEventListener('click', e => {
      const t = e.target;
      if (t.closest('.calc-teclas [data-k="="]')) decir('calc');
      else if (t.closest('#m4-confirm')) decir('caja');
      else if (t.closest('#lab-form button[type="submit"]')) decir('dato');
      else if (t.closest('#play-start,.match-grid,.constellation-board')) decir('juego');
    }, true);
    (function vuelo(ahora) {
      if (!quieto) {
        x += (tx - x) * .035; y += (ty - y) * .035;
        const vx = tx - x; if (Math.abs(vx) > 6) mira = vx > 0 ? 1 : -1;
        const flot = Math.sin(ahora / 420) * 8;
        dr.style.transform = `translate(${x.toFixed(1)}px,${(y + flot).toFixed(1)}px)`;
        dr.style.setProperty('--mira', mira);
        if (!dormido && ahora - ultimoMov > 12000) { dormido = true; dr.classList.add('duerme'); globo.textContent = 'z z z'; }
      } else dr.style.transform = `translate(${innerWidth - 120}px,90px)`;
      requestAnimationFrame(vuelo);
    })(performance.now());
  }
})();
