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
  // voz neural chilena (Catalina, edge-tts): cada texto narrado tiene su mp3 pregenerado en assets/voz/<clave>.mp3
  const limpiarVoz = t => (t || '').replace(/[«»✦✧♪♫♥]/g, '').replace(/\p{Extended_Pictographic}/gu, '').replace(/\s+/g, ' ').trim();
  const claveVoz = t => { let h = 0x811c9dc5; const x = limpiarVoz(t).toLowerCase(); for (let i = 0; i < x.length; i++) { h ^= x.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); };
  let audios = null, sonando = null, terminar = null;
  const cargarAudios = () => audios || (audios = fetch('assets/voz/indice.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : {}).catch(() => ({})));
  cargarAudios();
  function callar() { turno++; dicho = ''; if (sonando) { sonando.pause(); sonando = null; } if (terminar) { const f = terminar; terminar = null; f(); } cola = Promise.resolve(); if (voz) voz.cancel(); $$('.voz-activa').forEach(n => n.classList.remove('voz-activa')); }
  function decir(texto, o = {}) {
    return new Promise(async fin => {
      if (!texto) { fin(); return; }
      if (!o.voz) {
        const idx = await cargarAudios(), k = claveVoz(texto);
        if (idx[k]) { const a = new Audio('assets/voz/' + k + '.mp3'); sonando = a; let listo = false; const acaba = () => { if (listo) return; listo = true; if (sonando === a) sonando = null; if (terminar === acaba) terminar = null; fin(); }; terminar = acaba; a.onended = a.onerror = acaba; a.play().catch(acaba); return; }
      }
      if (!o.voz) console.debug('voz-sin-audio:', limpiarVoz(texto));
      if (!o.voz || !voz) { fin(); return; }   // el narrador solo usa la voz elegida (Alonso): sin audio, no habla con la voz del navegador
      const u = new SpeechSynthesisUtterance(texto.replace(/[«»✦✧♪♫♥]/g, '').replace(/\s+/g, ' ').trim());
      const v = o.voz || vozElegida || elegirVoz();
      if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'es-CL';
      u.rate = o.rate ?? .96; u.pitch = o.pitch ?? (v && HOMBRE.test(v.name) ? .95 : .7); u.volume = 1;
      u.onend = u.onerror = () => fin();
      voz.speak(u);
    });
  }
  let cola = Promise.resolve(), preparando = false;
  let dicho = '';
  const norm = t => limpiarVoz(t).toLowerCase().normalize('NFD').replace(/[^a-z0-9ñ]/g, '');
  // un cartel no repite lo que el narrador ya dijo en este pliego: si su texto ya se leyó, no se lee; si solo el título, se omite el título
  const sinRepetir = (t, x) => { const d = dicho; if (x && d.includes(norm(x))) return ''; if (t && !/:\s*$/.test(t) && d.includes(norm(t))) return limpiarVoz(x || ''); return vozCartel(t, x); };   // el nombre de quien habla («Rancek:») siempre se dice
  const encolar = (t, antes, despues) => { const mio = turno; dicho += norm(t); cola = cola.then(async () => { if (mio !== turno || !narrando) return; antes && antes(); await decir(t); despues && despues(); }); return cola; };
  // lo que dice un cartel de escena al cambiar: el título (si cambió) y su texto
  const pausa = ms => { const mio = turno; cola = cola.then(() => mio === turno && narrando ? new Promise(r => setTimeout(r, ms)) : null); };
  // un nodo narrable se dice en partes: en las características, el título, una pausa y la descripción
  const partesDe = n => n.matches('li') && n.querySelector(':scope > b') ? [n.querySelector(':scope > b').innerText, (n.querySelector('.corto') || n.querySelector('small'))?.innerText].filter(Boolean) : [n.innerText];
  // todo el texto de un pliego como un relato: capítulo, título y párrafos unidos con puntuación natural
  const unir = partes => partes.map(v => limpiarVoz(v)).filter(Boolean).reduce((a, b) => a ? a + (/[.…:!?¡¿,]$/.test(a) ? ' ' : '. ') + b : b, '');
  const textoPliego = pags => unir(textosDe(pags).map(n => n.textContent));   // el texto original (sin mayúsculas de estilo ni letras separadas)
  const vozCartel = (t, x) => [t, x].map(v => limpiarVoz(v)).filter(Boolean).reduce((a, b) => a ? a + (/[.…:!?¡¿,]$/.test(a) ? ' ' : '. ') + b : b, '');
  // lo narrable de un pliego: primero lo que se escribe en el cielo (capítulo, título, cuento, características), luego lo que queda en las páginas
  function textosDe(pags) {
    const nodos = [...document.querySelectorAll('.teatro-cielo.visible .cielo-bloque > *')];   // las características no se leen
    pags.forEach(p => p.querySelectorAll('.cap-num,.cap-titulo,.capitular,.cuento,.huellas li').forEach(n => {
      if (n.closest('.ranura') || n.closest('[data-narracion-propia]') || n.offsetParent === null || nodos.includes(n)) return;
      nodos.push(n);
    }));
    return nodos;
  }
  async function narrar(pags) {
    callar(); if (!narrando) return;
    const mio = ++turno; preparando = true; setTimeout(() => { preparando = false; }, 4500);
    await new Promise(r => setTimeout(r, 900));
    for (let i = 0; i < 12 && !document.querySelector('.teatro-cielo.visible') && mio === turno; i++) await new Promise(r => setTimeout(r, 150));
    const nodos = textosDe(pags), relato = textoPliego(pags);
    if (relato) encolar(relato, () => nodos.forEach(n => n.classList.add('voz-activa')), () => nodos.forEach(n => n.classList.remove('voz-activa')));
    preparando = false;
  }
  function pintarBotonVoz() {
    if (!btnVoz) return;
    btnVoz.setAttribute('aria-pressed', String(narrando));
    btnVoz.querySelector('b').textContent = narrando ? 'Narrador activo' : 'Narrador';
    btnVoz.hidden = false;
  }
  pintarBotonVoz();
  btnVoz?.addEventListener('click', () => {
    narrando = !narrando; guardar('mce-narrador', narrando ? 'si' : 'no'); pintarBotonVoz();
    if (narrando) narrar(window.MCELibro?.visibles?.() || []); else callar();
  });
  // todos los textos que puede leer el narrador (para pregenerar la voz)
  const todosLosTextos = () => { const out = new Set(); { const t = textoPliego(window.MCELibro?.visibles?.() || []); if (t) out.add(t); } (window.MCEVida || []).forEach(t => out.add(limpiarVoz(t))); document.querySelectorAll('.vida-cabeza').forEach(n => out.add(unir([...n.children].map(c => c.textContent)))); return [...out].filter(Boolean).map(t => ({ k: claveVoz(t), t })); };
  // espera a que el narrador termine todo lo que tiene en cola (y lo que está por encolar del pliego)
  const esperar = async () => { while (preparando && narrando) await new Promise(r => setTimeout(r, 120)); await cola; };
  window.MCENarrador = { decir, callar, encolar, vozCartel, sinRepetir, esperar, textos: () => [...todosLosTextos(), ...(window.MCETextosEscenas ? window.MCETextosEscenas() : []).map(t => ({ k: claveVoz(t), t: limpiarVoz(t) }))], get activo() { return narrando; } };

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
      if (window.MCENarrador.activo) { if (i === 0) callar(); await encolar(p.innerText); }
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
    ['etapa-01', '4–6 años', 'Soñaba con princesas, castillos y dragones.'],
    ['etapa-02', '8–10 años', 'Dibujaba en cada cuaderno que encontraba, inspirada por el anime.'],
    ['etapa-03', '12–18 años', 'Descubrió los videojuegos, siempre en el PC.'],
    ['etapa-08', '19–25 años', 'Estudiando Obstetricia en la USS Concepción.'],
    ['etapa-06', '25–27 años', 'Matrona en el CESFAM O’Higgins, enseñando clínica a sus alumnas.'],
    ['etapa-07', '27–29 años', 'Trabajando en la clínica ginecológica móvil.'],
    ['etapa-13', '30 años', 'Educando a niños en la Academia Aliwen.'],
    ['etapa-09', '31–32 años', 'Programadora Full Stack Java.'],
    ['etapa-10', '31–32 años', 'Streamer en ArianesDCoen junto a Coen.'],
    ['etapa-11', '32 años', 'Al fin creando sus propios mundos.'],
    ['etapa-12', '32 años', 'Ilustradora 2D y 3D.'],
    ['etapa-15', 'Hoy', 'Fundadora de Studios Conari. ¡Y la historia sigue!']
  ];
  window.MCEVida = VIDA.map(v => v[1] + '. ' + v[2]);   // lo que narra cada etapa (para pregenerar la voz)
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
  const GRUPO = ['g01', 'g02', 'g03', 'g05', 'g05e', 'g05f', 'g02', 'g07b', 'g08', 'g09', 'g10', 'g11'];   // ambiente de cada etapa (Aliwen en la sala de clases)
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
      if (hablar && window.MCENarrador.activo && (window.MCELibro?.visibles?.() || []).some(p => p.contains(el))) await encolar(VIDA[n][1] + '. ' + VIDA[n][2]);
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
    mostrar(0, false).then(() => { if (window.MCENarrador.activo) { callar(); encolar(unir([...el.closest('.pagina').querySelector('.vida-cabeza').children].map(c => c.textContent))); encolar(VIDA[0][1] + '. ' + VIDA[0][2]).then(() => luego(avanzar, 400)); } else luego(avanzar, 5200); });
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
  const ESCALA_PJ = 1.35;
  const ESCENARIOS = {
    iv: { carpeta: 'cap4/', hitos: [
      { fondo: 'fondo-noche.webp', suelo: 'suelo-noche.webp', titulo: 'Las 2 de la mañana', texto: '…y aún no termina.', pasos: [
        { actor: 'cama', x: 34, alto: 15, de: 0, a: 1, ms: 4500 },                                         // a la izquierda: programa en la cama… y se duerme
        { texto: { titulo: 'z z z…', texto: 'Se quedó dormida estudiando.' }, ms: 900 },
        { actor: 'coen', camina: [0, 1], desde: 92, x: 47, alto: 16, ms: 3800, delante: true, pausa: 0,
          texto: { titulo: 'Y cada vez que casi no podía más…', texto: 'Coen llegaba con un café.' } },                        // Coen llega caminando con el café
        { actor: 'coen', de: 1, a: 2, ms: 450, pausa: 0, sigue: true },                                      // sin detenerse, le extiende la taza
        { actor: 'cama', de: 1, a: 2, ms: 3500, junto: true, sigue: true, texto: { titulo: '«Despierta, que vas a lograrlo» ☕', texto: '' } },   // ella despierta y se estira mientras él sostiene el café…
        { actor: 'coen', de: 2, a: 3, ms: 2700, pausa: 0, sigue: true },
        { actor: 'coen', de: 3, a: 4, ms: 450, pausa: 0, sigue: true },                                      // …y justo cuando ella tiene el café en la mano, él ya no lo tiene
        { actor: 'coen', de: 4, a: 5, ms: 1800 },                                                            // y se rasca la cabeza, tímido
        { app: true, ms: 400 }                                                                              // baja la calculadora
      ] }
    ] },
    v: { carpeta: 'cap5/', hitos: [
      { fondo: 'fondo-estudio.webp', suelo: 'suelo-estudio.webp', titulo: 'Un trazo de lápiz…', texto: 'dio vida a Ari, la asesina ágil de cintas rosadas.', pasos: [
        // el hada dibuja y pinta a Ari y a Coen…
        { nombre: 'ari', img: 'assets/personajes/ari-frente.webp', linea: 'assets/personajes/ari-frente-lineart.webp', x: 46, alto: 16, ms: 4200, pausa: 300 },
        { nombre: 'coen', img: 'assets/personajes/coen-frente.webp', linea: 'assets/personajes/coen-frente-lineart.webp', x: 56, alto: 17, ms: 4200,
          texto: { titulo: '…y a Coen,', texto: 'el caballero de capa carmesí.' } },
        // …y se separan, uno hacia cada lado
        { texto: { titulo: 'Línea a línea, color a color…', texto: 'se volvieron un equipo.' }, nombre: 'ari-c', actor: 'ari-anda', camina: [0, 1], cicloMs: 1000, x: 46, alto: 16, clase: 'espejo', reemplaza: 'ari', sigue: true, ruta: [[0, 46], [1, 20]], ms: 2600, junto: true },
        { nombre: 'coen-c', actor: 'coen-anda', camina: [0, 1], cicloMs: 1000, x: 56, alto: 17, reemplaza: 'coen', sigue: true, ruta: [[0, 56], [1, 80]], ms: 2600, pausa: 0 },
        { nombre: 'ari', img: 'assets/personajes/ari-frente.webp', x: 20, alto: 16, reemplaza: 'ari-c', sigue: true, rotulo: 'María Inés', ms: 100, pausa: 0 },
        { nombre: 'coen', img: 'assets/personajes/coen-frente.webp', x: 80, alto: 17, reemplaza: 'coen-c', sigue: true, rotulo: 'Kevin', ms: 300, pausa: 300 },
        // al medio, el hada dibuja el logo de Studios Conari…
        { nombre: 'logo', img: 'assets/logo-conari-circulo.webp', linea: 'assets/logo-conari-circulo-lineart.webp', x: 50, alto: 14, ms: 3600, pj: false,
          texto: { titulo: 'Y juntos fundaron Studios Conari', texto: 'Un estudio creativo chileno: narrativa, diseño, programación, datos y arte 3D.' } },
        // …el logo se va y el estudio entero aparece de fondo
        { quita: 'logo', fondo: 'fondo-conari.webp', ms: 1600 },
        // en el lugar vacío del medio, el hada dibuja y pinta a Rancek
        { nombre: 'rancek-d', img: 'assets/personajes/rancek-frente.webp', linea: 'assets/personajes/rancek-frente-lineart.webp', x: 50, alto: 17, ms: 3600, pausa: 0 },
        { nombre: 'rancek', actor: 'rancek-saluda', x: 53.5, alto: 17, reemplaza: 'rancek-d', sigue: true, de: 0, a: 1, ms: 2400,
          rotulo: 'Elías · animación y arte 3D',
          texto: { titulo: '…y se unió al equipo un tercero', texto: 'María Inés (dirección creativa · Full Stack Java), Kevin (dirección técnica · videojuegos y datos) y Elías (animación y arte 3D).' } }
      ] }
    ] },
    reino: { carpeta: 'reino/', suave: true, hitos: [
      // respaldo: el capítulo empezaba directo con el humo
      // { fondo: null, suelo: 'suelo-reino.webp', titulo: 'Entonces…', texto: 'el libro se abrió de par en par y de sus páginas brotó un humo mágico.', pasos: [
      // una noche, en un café cowork frente a la gran torre, Ari le cuenta a Rancek de qué se trata el proyecto… y se le cae el libro
      { fondo: 'fondo-cafe.webp', suelo: 'assets/cuento/cap6/suelo-tienda.webp', titulo: 'Una noche…', texto: 'los tres se juntaron en un café a conversar.', pasos: [
        // respaldo: piezas quietas
        // { nombre: 'coen', img: 'cafe-coen.webp', x: 27, alto: 18.4, pj: true, delante: true, clase: 'vive', ms: 500, pausa: 0 },
        // { nombre: 'ari', img: 'cafe-ari.webp', x: 43, alto: 17.6, pj: true, delante: true, clase: 'vive', ms: 500, pausa: 0 },
        // { nombre: 'rancek', img: 'cafe-rancek.webp', x: 62, alto: 18.2, pj: true, delante: true, clase: 'vive', ms: 1200 },
        // { texto: { titulo: 'Ari:', texto: '«Mira, Rancek: de esto se trata lo que tenemos… un libro donde todo lo que soñamos cobra vida ✧»' }, nombre: 'ari', clase: 'vive saluda', ms: 3200 },
        // { texto: { titulo: 'Rancek:', texto: '«¿En serio? ¡A ver, muéstrame!»' }, nombre: 'rancek', clase: 'vive saluda', ruta: [[0, 62], [1, 57]], ms: 1400 },
        // // ¡pam!: se le cae el libro
        // { texto: { titulo: '', texto: '¡Pam!' }, nombre: 'ari-u', img: 'cafe-ari-ups.webp', x: 43, alto: 17.6, pj: true, delante: true, reemplaza: 'ari', sigue: true, ms: 0, pausa: 0 },
        // { nombre: 'libro', img: 'cafe-libro.webp', x: 49, alto: 5, delante: true, entra: true, sigue: true, ruta: [[0, 49, 9, 0], [.6, 50, 1, 70], [.8, 50.5, 2.5, 85], [1, 51, 0, 90]], ms: 900, suave: 'ease-in', fx: { tipo: 'destello', x: 51, ancho: 10, y: 1, tras: 700, ms: 1000 }, pausa: 300 },
        // { texto: { titulo: '', texto: 'Las hojas comenzaron a pasar solas… el libro se abrió de par en par y brotó un humo mágico.' }, fx: [{ tipo: 'destello', x: 51, ancho: 16, y: 4, ms: 1400 }], ms: 2200 },
        // respaldo: versión con Ari soltando el libro
        // // cada uno con su propia animación (Wan): conversan, Ari le muestra el libro a Rancek, él se lo pide… y se le resbala
        // { nombre: 'coen', actor: 'cafe-coen-escucha', x: 24, alto: 18.89, pj: true, delante: true, de: 0, a: 0, bucle: [0, 1], cicloMs: 2100, ms: 500, pausa: 0 },
        // { nombre: 'ari', actor: 'cafe-ari-habla', x: 40, alto: 18.96, pj: true, delante: true, de: 0, a: 0, bucle: [0, 1], cicloMs: 2000, ms: 500, pausa: 0 },
        // { nombre: 'rancek', actor: 'cafe-rancek-mira', x: 57, alto: 19.38, pj: true, delante: true, de: 0, a: 0, bucle: [0, 1], cicloMs: 3800, ms: 1200 },
        // { texto: { titulo: 'Ari:', texto: '«Mira, Rancek: de esto se trata lo que tenemos… un libro donde todo lo que soñamos cobra vida ✧»' }, ms: 3400 },
        // { nombre: 'ari-o', actor: 'cafe-ari-ofrece', x: 40, alto: 18.96, pj: true, delante: true, reemplaza: 'ari', sigue: true, de: 0, a: 1, ms: 2000, pausa: 0 },   // abre el libro y se lo muestra
        // { texto: { titulo: 'Rancek:', texto: '«¿En serio? ¡A ver, préstamelo!»' }, nombre: 'rancek-p', actor: 'cafe-rancek-pide', x: 57, alto: 19.38, pj: true, delante: true, reemplaza: 'rancek', sigue: true, de: 0, a: 1, ms: 2000, pausa: 300 },   // se lo pide estirando las manos
        // // al pasárselo… ¡se resbala!
        // { texto: { titulo: '', texto: '¡Pam! Se le resbaló de las manos…' }, nombre: 'ari-u', img: 'cafe-ari-ups.webp', x: 40, alto: 17.6, pj: true, delante: true, reemplaza: 'ari-o', sigue: true, ms: 0, pausa: 0 },
        // { nombre: 'libro', img: 'cafe-libro.webp', x: 48, alto: 5, delante: true, entra: true, sigue: true, ruta: [[0, 48, 9, 0], [.6, 49, 1, 70], [.8, 49.5, 2.5, 85], [1, 50, 0, 90]], ms: 900, suave: 'ease-in', fx: { tipo: 'destello', x: 50, ancho: 10, y: 1, tras: 700, ms: 1000 }, pausa: 300 },
        // { texto: { titulo: '', texto: 'Las hojas comenzaron a pasar solas… el libro se abrió de par en par y brotó un humo mágico.' }, fx: [{ tipo: 'destello', x: 50, ancho: 16, y: 4, ms: 1400 }], ms: 2200 },
        // conversan de cerca, cada uno con su animación (Wan); todas parten de la pose base, así el cambio no parpadea
        { aLaVez: true, nombre: 'ari', actor: 'cafe-ari-habla', x: 40, alto: 18.96, pj: true, delante: true, de: 0, a: 0, bucle: [0, 1], cicloMs: 4000, ms: 500, junto: true, sigue: true },
        // los tres conversan por turnos: quien habla gesticula y da un saltito; los otros escuchan (Coen con las manos en los bolsillos)
        /* antes: Coen y Ari hablaban en bucle a la vez y solo se notaba a Rancek moverse
        { aLaVez: true, nombre: 'coen', actor: 'cafe-coen-habla', x: 28.5, alto: 18.89, pj: true, delante: true, de: 0, a: 0, bucle: [0, 1], cicloMs: 1400, ms: 500, junto: true, sigue: true }, */
        { aLaVez: true, nombre: 'coen', actor: 'cafe-coen-habla', x: 28.5, alto: 18.89, pj: true, delante: true, de: 2, a: 2, bucle: [2, 3], cicloMs: 3200, ms: 500, junto: true, sigue: true },
        { nombre: 'rancek', actor: 'cafe-rancek-mira', x: 50.5, alto: 19.38, pj: true, delante: true, de: 0, a: 0, bucle: [0, 1], cicloMs: 4000, ms: 1200 },
        // (los pasos «junto» no arrancan su bucle: cada animación se enciende con un paso corto propio, antes de su cartel)
        { nombre: 'coen', bucle: [2, 3], cicloMs: 3200, ms: 10, sigue: true, pausa: 0 },   // Coen escucha mirando a Ari, con las manos en los bolsillos (cuadros 24–30)
        { nombre: 'ari', bucle: [0, 1], cicloMs: 2600, ms: 10, sigue: true, pausa: 0 },     // Ari habla
        { texto: { titulo: 'Ari:', texto: '«Mira, Rancek: estas son nuestras ilustraciones. Creamos un estudio: queremos hacer un videojuego, soluciones digitales, diseño… ¡de todo! ✧»' }, nombre: 'ari', clase: 'saluda', sigue: true, ms: 3400 },
        { nombre: 'ari', de: 0, a: 0, ms: 10, sigue: true, pausa: 0 },                        // Ari termina y escucha
        { nombre: 'coen', bucle: [0, 1], cicloMs: 1400, ms: 10, sigue: true, pausa: 0 },      // Coen gesticula al hablar
        { texto: { titulo: 'Coen:', texto: '«Ahí está todo lo que queremos crear juntos. ¡Tienes que verlo!»' }, nombre: 'coen', clase: 'saluda', sigue: true, ms: 3000 },
        { nombre: 'coen', bucle: [2, 3], cicloMs: 3200, ms: 10, sigue: true, pausa: 0 },      // vuelve a las manos en los bolsillos
        { texto: { titulo: 'Rancek:', texto: '«¿Un estudio? ¡Cuéntenme más!»' }, nombre: 'rancek', clase: 'saluda', sigue: true, ms: 2200 },
        { nombre: 'ari', de: 0, a: 0, ms: 120, pausa: 0 },   // vuelve a su pose base…
        { nombre: 'ari-o', actor: 'cafe-ari-ofrece', x: 40, alto: 18.96, pj: true, delante: true, clase: 'encima', reemplaza: 'ari', sigue: true, de: 0, a: 1, ms: 2000, pausa: 0 },   // …abre el libro y se lo muestra
        { nombre: 'rancek', de: 0, a: 0, ms: 120, pausa: 0 },
        { texto: { titulo: 'Rancek:', texto: '«¿En serio? ¡A ver, préstamelo!»' }, nombre: 'rancek-p', actor: 'cafe-rancek-pide', x: 50.5, alto: 19.38, pj: true, delante: true, reemplaza: 'rancek', sigue: true, de: 0, a: 1, ms: 2000, pausa: 200 },
        // respaldo: entrega por piezas separadas (el libro cambiaba)
        // // se lo pasa: en el mismo instante Ari queda con las manos vacías y Rancek con el libro
        // { nombre: 'ari-e', actor: 'cafe-ari-entrega', x: 40, alto: 18.96, pj: true, delante: true, reemplaza: 'ari-o', sigue: true, de: 1, a: 1, ms: 10, pausa: 0 },
        // { nombre: 'rancek-r', actor: 'cafe-rancek-resbala', x: 50.5, alto: 19.38, pj: true, delante: true, reemplaza: 'rancek-p', sigue: true, de: 0, a: 0, ms: 700, pausa: 0 },
        // // …y se le resbala de las manos
        // { texto: { titulo: '', texto: '¡Pam! Se le resbaló de las manos…' }, nombre: 'rancek-r', de: 0, a: 1, ms: 1000, pausa: 0 },   // hasta que el libro se le escapa
        // // en ese cuadro el libro pasa a ser una pieza que cae (Rancek queda con las manos vacías intentando atraparlo)
        // { nombre: 'rancek-v', actor: 'cafe-rancek-pide', x: 50.5, alto: 19.38, pj: true, delante: true, reemplaza: 'rancek-r', sigue: true, de: 1, a: 1, ms: 10, pausa: 0 },
        // { nombre: 'libro', img: 'cafe-libro.webp', x: 47.5, alto: 5, delante: true, entra: true, sigue: true, ruta: [[0, 47.5, 10, 20], [.7, 47.8, 0.8, 80], [.85, 48, 2, 88], [1, 48.2, 0, 90]], ms: 650, suave: 'ease-in', fx: { tipo: 'destello', x: 48.2, ancho: 10, y: 1, tras: 500, ms: 1000 }, pausa: 0 },
        // { nombre: 'ari-u', img: 'cafe-ari-ups.webp', x: 40, alto: 17.6, pj: true, delante: true, reemplaza: 'ari-e', sigue: true, ms: 600, pausa: 0 },
        // Ari y Rancek en una sola animación (Wan): el mismo libro pasa de mano en mano, se le resbala a Rancek y cae abierto
        { nombre: 'rancek-p', de: 1, a: 1, ms: 10, pausa: 0 },
        { texto: { titulo: '', texto: '¡Pam! Se le resbaló de las manos…' }, nombre: 'par', actor: 'cafe-par-cae', x: 41.67, alto: 18.96, pj: true, delante: true, reemplaza: ['ari-o', 'rancek-p'], sigue: true, de: 0, a: 1, ms: 2500, junto: true },
        { ms: 1150 },   // justo cuando el libro se escapa…
        { nombre: 'coen', de: 0, a: 0, ms: 10, pausa: 0 },
        { nombre: 'coen-s', actor: 'cafe-coen-sorpresa', x: 28.5, alto: 18.89, pj: true, delante: true, reemplaza: 'coen', sigue: true, de: 0, a: 1, ms: 1200, pausa: 0 },   // …Coen también se sorprende
        { ms: 550 },
        // { texto: { titulo: '', texto: 'Las hojas comenzaron a pasar solas… el libro se abrió de par en par y brotó un humo mágico.' }, fx: [{ tipo: 'destello', x: 46, ancho: 16, y: 2, ms: 1400 }], ms: 2200 },
        { fx: [{ tipo: 'destello', x: 46, ancho: 16, y: 2, ms: 1400 }], ms: 900 },   // sin texto: la película muestra lo que pasa
        { quita: ['coen-s', 'par'], sinFondo: true, suelo: 'suelo-reino.webp', ms: 900 },
        // la película del reino (video sin bordes); si no carga, sigue el pop-up de respaldo
        { nombre: 'pelicula', video: 'assets/cuento/reino/reino' },
        { sinVideo: 'pelicula', nombre: 'humo', img: 'humo.webp', x: 50, alto: 18, efecto: 'flota', ms: 2600 },
        { sinVideo: 'pelicula', quita: 'humo', texto: { titulo: 'Del humo nacieron…', texto: 'la cordillera de los Andes, el sol, la luna y un gran castillo en lo alto.' }, ms: 300 },
        { sinVideo: 'pelicula', nombre: 'andes', img: 'assets/cuento/popup/andes.webp', x: 50, ancho: 94, fila: 'atras', ms: 200, pausa: 300 },
        { sinVideo: 'pelicula', nombre: 'sol', img: 'sol.webp', x: 12, alto: 8, clase: 'en-cielo', efecto: 'flota', ms: 200, pausa: 200 },
        { sinVideo: 'pelicula', nombre: 'luna', img: 'luna.webp', x: 89, alto: 7, clase: 'en-cielo', efecto: 'flota', ms: 200, pausa: 200 },
        { sinVideo: 'pelicula', nombre: 'castillo', img: 'assets/cuento/popup/castillo.webp', x: 50, alto: 34, fila: 'medio', ms: 300, pausa: 300 },
        { sinVideo: 'pelicula', nombre: 'arbol', img: 'arbol.webp', x: 14, alto: 30, fila: 'medio', ms: 300, pausa: 300 },   // el árbol florido junto a la montaña
        { sinVideo: 'pelicula', texto: { titulo: 'Pero de la niebla…', texto: 'salieron monstruitos.' }, ms: 300 },
        { sinVideo: 'pelicula', nombre: 'mo1', img: 'assets/cuento/popup/mo-1.webp', x: 66, alto: 5.5, delante: true, clase: 'espejo', efecto: 'salta', ms: 150, pausa: 100 },
        { sinVideo: 'pelicula', nombre: 'mo2', img: 'assets/cuento/popup/mo-2.webp', x: 73, alto: 5.5, delante: true, clase: 'espejo', efecto: 'salta', ms: 150, pausa: 100 },
        { sinVideo: 'pelicula', nombre: 'mo3', img: 'assets/cuento/popup/mo-3.webp', x: 80, alto: 5.5, delante: true, clase: 'espejo', efecto: 'salta', ms: 150, pausa: 100 },
        { sinVideo: 'pelicula', nombre: 'mo4', img: 'assets/cuento/popup/mo-4.webp', x: 87, alto: 5.5, delante: true, clase: 'espejo', efecto: 'salta', ms: 150, pausa: 300 },
        // Ari llega corriendo, ataca a los cuatro con su daga y vuelve de un salto hacia atrás
        { sinVideo: 'pelicula', texto: { titulo: 'Ari corrió hacia ellos…', texto: 'ágil como el viento, y los atacó uno a uno con su daga.' }, nombre: 'ari-corre', actor: 'ari-corre', camina: [0, 1], cicloMs: 700, x: -6, alto: 12.5, delante: true, entra: true, ruta: [[0, -6], [1, 54]], ms: 1500, pausa: 0 },
        { sinVideo: 'pelicula', nombre: 'ari', actor: 'ari-ataca', x: 54, alto: 14, delante: true, reemplaza: 'ari-corre', sigue: true, de: 0, a: 1, ms: 2600, pausa: 0,
          ruta: [[0, 54, 0], [.25, 62, 3], [.5, 70, 0], [.75, 78, 3], [1, 84, 0]],
          fx: [{ tipo: 'tajo', x: 63, ancho: 8, y: 4, tras: 480, golpe: 'mo1' }, { tipo: 'tajo', x: 71, ancho: 8, y: 4, tras: 1100, golpe: 'mo2' }, { tipo: 'tajo', x: 79, ancho: 8, y: 4, tras: 1720, golpe: 'mo3' }, { tipo: 'tajo', x: 87, ancho: 8, y: 4, tras: 2340, golpe: 'mo4' }] },
        // y vuelve con una voltereta hacia atrás
        { sinVideo: 'pelicula', nombre: 'ari-vuelta', actor: 'ari-atras', x: 84, alto: 14, delante: true, reemplaza: 'ari', sigue: true, de: 0, a: 1, ms: 1700, pausa: 200,
          ruta: [[0, 84, 0], [.25, 81, 0], [.6, 52, 13], [.85, 32, 2], [1, 28, 0]] },
        { sinVideo: 'pelicula', nombre: 'ari-h', img: 'ari-heroica.webp', x: 28, alto: 12.5, delante: true, reemplaza: 'ari-vuelta', sigue: true, pj: true, ms: 200, pausa: 200 },   // queda en guardia, lista para más
        // Coen llega, salta al centro de los monstruos, los golpea con una onda de choque y vuelve a cubrir a Ari
        { sinVideo: 'pelicula', texto: { titulo: 'Entonces llegó Coen…', texto: 'saltó al centro de los monstruos y su espada abrió una onda de choque.' }, nombre: 'coen-corre', actor: 'coen-corre', camina: [0, 1], cicloMs: 800, x: -6, alto: 14, delante: true, entra: true, ruta: [[0, -6], [1, 24]], ms: 1200, pausa: 0 },
        { sinVideo: 'pelicula', nombre: 'coen', actor: 'coen-golpe', x: 24, alto: 15.4, delante: true, reemplaza: 'coen-corre', sigue: true, de: 0, a: 1, ms: 2400, suave: 'linear', pausa: 0,
          ruta: [[0, 24, 0], [.3, 40, 0], [.5, 56, 12], [.65, 64, 0], [1, 64, 0]], fx: { tipo: 'onda', x: 76, ancho: 38, ms: 1000, tras: 1000, golpe: ['mo1', 'mo2', 'mo3', 'mo4'] } },
        { sinVideo: 'pelicula', nombre: 'coen-v', actor: 'coen-corre', camina: [0, 1], cicloMs: 800, x: 64, alto: 14, delante: true, clase: 'espejo', reemplaza: 'coen', sigue: true, ruta: [[0, 64], [1, 41]], ms: 1100, pausa: 0 },
        { sinVideo: 'pelicula', nombre: 'coen', img: 'coen-heroico.webp', x: 41, alto: 13.3, delante: true, pj: true, reemplaza: 'coen-v', sigue: true, ms: 200, pausa: 300 },
        // Rancek llega volando sobre su báculo: círculo mágico bajo los monstruos y picos de hielo
        { sinVideo: 'pelicula', texto: { titulo: 'Desde el cielo…', texto: 'llegó Rancek volando sobre su báculo y abrió un círculo mágico: ¡picos de hielo!' }, nombre: 'rancek', actor: 'rancek-vuela', camina: [0, 1], cicloMs: 3000, bucle: [0, 1], x: -12, alto: 11.7, entra: true, ruta: [[0, -12, 20], [1, 10, 9]], ms: 1600, suave: 'ease-out', pausa: 0 },
        { sinVideo: 'pelicula', fx: [{ tipo: 'circulo', x: 75, ancho: 40, ms: 2600 }, { tipo: 'picos', x: 75, ancho: 36, ms: 1700, tras: 900, golpe: ['mo1', 'mo2', 'mo3', 'mo4'] }], ms: 2300 },
        { sinVideo: 'pelicula', nombre: 'rancek', ruta: [[0, 10, 9], [1, 12, 0]], ms: 800, suave: 'ease-in', pausa: 0 },
        { sinVideo: 'pelicula', nombre: 'rancek-h', img: 'rancek-heroico.webp', x: 13, alto: 13.6, delante: true, reemplaza: 'rancek', sigue: true, pj: true, ms: 200, pausa: 200 },
        // el dragón vuelve y les lanza su fuego
        { sinVideo: 'pelicula', texto: { titulo: 'Y el dragón rosado…', texto: 'llegó volando y les lanzó su fuego. ¡Los monstruitos desaparecieron!' }, nombre: 'dragon', actor: 'dragon-vuela', camina: [0, 1], cicloMs: 700, x: -20, alto: 11, clase: 'vuela', entra: true, ruta: [[0, -20, 10], [1, 46, 3]], ms: 1800, suave: 'ease-out', pausa: 0 },
        { sinVideo: 'pelicula', nombre: 'fuego', actor: 'dragon-sopla', x: 46, alto: 11, clase: 'vuela llama-suave', reemplaza: 'dragon', sigue: true, de: 0, a: 1, ms: 3000, pausa: 0, fx: { tipo: 'llamas', x: 76, ancho: 34, y: 1, ms: 1500, tras: 1000, golpe: ['mo1', 'mo2', 'mo3', 'mo4'] } },
        { sinVideo: 'pelicula', muere: ['mo1', 'mo2', 'mo3', 'mo4'], ms: 1500 },
        // la niebla se despeja: la montaña y el castillo lejano se pliegan y se levanta la fachada del castillo, a la escala de los héroes
        { sinVideo: 'pelicula', quita: ['fuego', 'castillo', 'andes', 'arbol'], texto: { titulo: 'Cuando la niebla se despejó…', texto: 'los tres caminaron juntos hacia el castillo. Porque, a pesar de las dificultades, siempre llegarán a la cima: al castillo soñado.' }, ms: 700 },
        { sinVideo: 'pelicula', nombre: 'fachada', actor: 'fachada', x: 50, ancho: 96, fila: 'atras', pj: false, ms: 900, pausa: 0 },
        // las puertas se abren…
        { sinVideo: 'pelicula', nombre: 'fachada', de: 0, a: 1, ms: 1400, fx: { tipo: 'destello', x: 50, ancho: 14, y: 14, tras: 900, ms: 1200 }, pausa: 200 },
        // …y los tres caminan en fila hasta la puerta y entran uno tras otro: Coen, Ari y Rancek
        { sinVideo: 'pelicula', nombre: 'pcoen', actor: 'coen-anda', camina: [0, 1], cicloMs: 1000, x: 41, alto: 13.3, delante: true, reemplaza: 'coen', sigue: true, ruta: [[0, 41], [1, 50]], ms: 1700, junto: true },
        { sinVideo: 'pelicula', nombre: 'pari', actor: 'ari-anda', camina: [0, 1], cicloMs: 1000, x: 28, alto: 12.5, delante: true, reemplaza: 'ari-h', sigue: true, ruta: [[0, 28], [1, 50]], ms: 3500, junto: true },
        { sinVideo: 'pelicula', nombre: 'prancek', actor: 'rancek-anda', camina: [0, 1], cicloMs: 1000, x: 12, alto: 13.3, delante: true, reemplaza: 'rancek-h', sigue: true, ruta: [[0, 12], [1, 50]], ms: 5300, junto: true },
        { sinVideo: 'pelicula', ms: 1650 },
        { sinVideo: 'pelicula', nombre: 'ecoen', img: 'assets/personajes/coen-espalda.webp', x: 50, alto: 13.3, delante: true, reemplaza: 'pcoen', sigue: true, ms: 350, pausa: 0 },   // de espaldas, mirando la puerta…
        { sinVideo: 'pelicula', nombre: 'ecoen', clase: 'adentro', ms: 1400, pausa: 0 },                                                                                     // …y entra
        { sinVideo: 'pelicula', nombre: 'eari', img: 'assets/personajes/ari-espalda.webp', x: 50, alto: 12.5, delante: true, reemplaza: 'pari', sigue: true, ms: 350, pausa: 0 },
        { sinVideo: 'pelicula', nombre: 'eari', clase: 'adentro', ms: 1400, pausa: 0 },
        { sinVideo: 'pelicula', nombre: 'erancek', img: 'assets/personajes/rancek-espalda.webp', x: 50, alto: 13.3, delante: true, reemplaza: 'prancek', sigue: true, ms: 350, pausa: 0 },
        { sinVideo: 'pelicula', nombre: 'erancek', clase: 'adentro', fx: { tipo: 'destello', x: 50, ancho: 16, y: 10, tras: 500, ms: 1200 }, ms: 1600, pausa: 600 }
      ] }
    ] },
    vi: { carpeta: 'cap6/', suave: true, hitos: [
      { fondo: 'fondo-tienda.webp', suelo: 'suelo-tienda.webp', titulo: 'Magical Alliance', texto: 'La tienda mágica donde atiende Rancek: joyas, vestidos, perfumes y trajes encantados.', pasos: [
        // Rancek atiende detrás de su mesa, con su delantal de Magical Alliance
        { nombre: 'mago', img: 'assets/cuento/tienda/rancek-tienda-m.webp', x: 78, alto: 17.85, clase: 'tras-mostrador', ms: 500, pausa: 0 },
        { nombre: 'mesa', img: 'mesa-perfil.webp', x: 66, alto: 19, clase: 'mostrador espejo', abre: 'tienda', rotulo: 'Magical Alliance', ms: 600, pausa: 300 },   // el mostrador abre la tienda real en línea
        // Ari y Coen llegan caminando de la mano
        // respaldo: caminata anterior (ropa casual vieja)
        // { texto: { titulo: 'Un día…', texto: 'Ari y Coen llegaron a Magical Alliance.' }, nombre: 'pareja-c', actor: 'assets/cuento/tienda/pareja-anda', camina: [0, 1], cicloMs: 1280, x: -10, alto: 17.5, delante: true, entra: true, ruta: [[0, -10], [1, 40]], ms: 3800, pausa: 0 },
        // { nombre: 'pareja', img: 'assets/cuento/tienda/pareja-1.webp', x: 40, alto: 17.5, delante: true, reemplaza: 'pareja-c', sigue: true, ms: 300, pausa: 200 },
        // llegan de la mano con su ropa casual nueva (ciclo Wan de 19 cuadros)
        { texto: { titulo: 'Un día…', texto: 'Ari y Coen llegaron a Magical Alliance.' }, nombre: 'pareja-c', actor: 'assets/cuento/tienda/pareja-casual-anda-m', camina: [0, 1], cicloMs: 1900, x: 7, alto: 19.9, delante: true, entra: true, ruta: [[0, 7], [1, 40]], ms: 2300, pausa: 0 },
        { nombre: 'pareja', img: 'assets/cuento/tienda/pareja-casual-quieta-m.webp', x: 40, alto: 19.67, delante: true, reemplaza: 'pareja-c', sigue: true, ms: 300, pausa: 200 },
        { texto: { titulo: 'Rancek:', texto: '«¡Bienvenidos a mi tienda! ¿Qué se les ofrece?»' }, nombre: 'mago', clase: 'tras-mostrador saluda', fx: { tipo: 'destello', x: 78, ancho: 9, y: 16 }, ms: 1800 },
        { texto: { titulo: 'Ari:', texto: '«¡Algo bonito para la fiesta del reino! ✧»' }, nombre: 'pareja', clase: 'saluda', ms: 1800 },
        // se sueltan: Ari va a probarse ropa y Coen la espera
        { nombre: 'coen', img: 'assets/cuento/tienda/coen-casual-m.webp', x: 40.6, alto: 18.39, delante: true, reemplaza: 'pareja', sigue: true, ms: 200, pausa: 0 },
        // { nombre: 'ari', img: 'assets/cuento/tienda/ari-casual.webp', x: 32, alto: 15.8, delante: true, entra: true, sigue: true, ms: 600, pausa: 200 },   // respaldo: casual vieja
        { nombre: 'ari', img: 'assets/cuento/tienda/ari-casual-2-m.webp', x: 36.8, alto: 16.59, delante: true, clase: 'vive', entra: true, sigue: true, ms: 600, pausa: 200 },
        { texto: { titulo: 'La vitrina de Magical Alliance', texto: 'Elige el look que Ari se va a probar.' }, app: 'looks', espera: 'look-elegido', cierraApp: true, ms: 300 },
        // { texto: { titulo: '¡Magia!', texto: 'Ari se lo prueba con un destello.' }, nombre: 'ari-look', look: true, x: 32, alto: 15.8, delante: true, reemplaza: 'ari', sigue: true, fx: [{ tipo: 'destello', x: 32, ancho: 14, y: 8, ms: 1200 }], ms: 900 },
        // el hada vuela hasta Ari, la envuelve en luz y le pone el look elegido
        { texto: { titulo: '¡Magia!', texto: 'El hada vuela hasta Ari y, con un remolino de luz, le pone el look que elegiste.' }, hadaSobre: 'ari' },
        { nombre: 'ari-look', look: true, x: 36.8, alto: 16.59, delante: true, clase: 'vive', reemplaza: 'ari', sigue: true, fx: [{ tipo: 'destello', x: 36.8, ancho: 14, y: 8, ms: 1200 }], ms: 900 },
        // se queda con el Vestido Magical y sale de la tienda con él puesto
        // respaldo: se quedaba con el Vestido Magical desde el probador
        // { si: '!magical', texto: { titulo: 'Ari:', texto: '«Me encanta… pero me quedo con el Vestido Magical ✧»' }, hadaSobre: 'ari-look' },   // lo dice y el hada la vuelve a cambiar
        // { si: '!magical', texto: { titulo: 'Ari:', texto: '«Me encanta… pero me quedo con el Vestido Magical ✧»' }, nombre: 'ari-m', img: 'assets/cuento/tienda/ari-look-magical.webp', x: 32, alto: 15.8, delante: true, reemplaza: 'ari-look', sigue: true, fx: [{ tipo: 'destello', x: 32, ancho: 14, y: 8, ms: 1200 }], ms: 1800 },
        // { si: 'magical', texto: { titulo: 'Ari:', texto: '«¡Me lo llevo puesto! ✧»' }, nombre: 'ari-m', img: 'assets/cuento/tienda/ari-look-magical.webp', x: 32, alto: 15.8, delante: true, reemplaza: 'ari-look', sigue: true, ms: 1600 },
        // { texto: { titulo: 'Coen:', texto: '«Te queda precioso… yo pago 😅»' }, nombre: 'coen', clase: 'saluda', ms: 1800 },
        // dice que se lo lleva, Coen paga… y el hada la devuelve a su ropa casual para ir a la caja
        { si: '!magical', texto: { titulo: 'Ari:', texto: '«Me encanta… pero me llevo el Vestido Magical ✧»' }, nombre: 'ari-look', clase: 'saluda', ms: 2000 },
        { si: 'magical', texto: { titulo: 'Ari:', texto: '«¡Me encanta! Me lo llevo ✧»' }, nombre: 'ari-look', clase: 'saluda', ms: 1800 },
        { texto: { titulo: 'Coen:', texto: '«Te queda precioso… yo pago 😅»' }, nombre: 'coen', clase: 'saluda', ms: 1800 },
        { texto: { titulo: '', texto: 'Y el hada la devolvió a su ropa de siempre para ir a pagar.' }, hadaSobre: 'ari-look' },
        { nombre: 'ari-c2', img: 'assets/cuento/tienda/ari-casual-2-m.webp', x: 36.8, alto: 16.59, delante: true, clase: 'vive', reemplaza: 'ari-look', sigue: true, fx: [{ tipo: 'destello', x: 36.8, ancho: 14, y: 8, ms: 1200 }], ms: 1200 },
        { texto: { titulo: 'Tú manejas la caja', texto: 'Elige lo que compran, aplica un descuento, cobra… ¡y entrega la boleta!' }, app: 'caja', ms: 600 },
        { espera: 'tienda-boleta', cierraApp: true, ms: 900 },
        // respaldo: lámina de video y entrega por piezas sueltas (rompían el estilo pop-up)
        // // la caja como escena continua (Wan): Rancek empaca la polera burdeo, se las pasa a Coen en la mano y los despide
        // { texto: { titulo: 'Rancek:', texto: '«¡Aquí tienen sus bolsas! Gracias por su compra ✦»' }, nombre: 'caja-v', video: 'assets/cuento/tienda/escena-caja' },
        // // y recién ahí el hada le pone a Coen su ropa nueva
        // { texto: { titulo: '¡A estrenar!', texto: 'Y el hada le puso a Coen su ropa nueva: polera burdeo y jogger blanco.' }, nombre: 'caja-v', hada: 'assets/cuento/tienda/escena-caja-hada.webp', fxX: 36, ms: 1800 },
        // // detrás de la lámina el pop-up queda como terminó la escena, y la lámina se pliega
        // { conVideo: 'caja-v', nombre: 'coen-n', img: 'assets/cuento/tienda/coen-con-bolsas.webp', x: 47, alto: 17.5, delante: true, reemplaza: 'coen', sigue: true, ms: 0, pausa: 0 },
        // { conVideo: 'caja-v', quita: 'caja-v', ms: 700 },
        // // respaldo pop-up si el video no carga
        // // ¡a estrenar!: Coen también se pone lo suyo
        // { sinVideo: 'caja-v', texto: { titulo: '¡A estrenar!', texto: 'Coen también estrena su polera burdeo y su jogger blanco.' }, nombre: 'coen-n', img: 'assets/cuento/tienda/coen-paseo.webp', x: 47, alto: 17.5, delante: true, reemplaza: 'coen', sigue: true, fx: { tipo: 'destello', x: 47, ancho: 14, y: 8, ms: 1200 }, ms: 1600 },
        // // Rancek les entrega las bolsas con lo que traían puesto
        // // respaldo: entrega con bolsas sin nombre
        // // { texto: { titulo: 'Rancek:', texto: '«¡Aquí tienen sus bolsas! Gracias por su compra ✦»' }, nombre: 'mago-e', actor: 'assets/cuento/tienda/rancek-entrega', x: 76.2, alto: 17.1, clase: 'tras-mostrador', reemplaza: 'mago', sigue: true, de: 0, a: 1, ms: 1900, pausa: 300 },
        // // respaldo: entrega por partes (se veía cortada)
        // // { texto: { titulo: 'Rancek:', texto: '«¡Aquí tienen sus bolsas! Gracias por su compra ✦»' }, nombre: 'mago-e', actor: 'assets/cuento/tienda/rancek-entrega-ma', x: 76.2, alto: 17.1, clase: 'tras-mostrador', reemplaza: 'mago', sigue: true, de: 0, a: 1, ms: 1900, pausa: 300 },
        // // // Coen estira los brazos y toma las bolsas «Magical Alliance» (Wan, primer→último cuadro)
        // // { nombre: 'coen-b', actor: 'assets/cuento/tienda/coen-toma-bolsas', x: 47, alto: 17.5, delante: true, reemplaza: 'coen-n', sigue: true, de: 0, a: 1, ms: 2300, pausa: 0 },
        // // { nombre: 'coen-n', img: 'assets/cuento/tienda/coen-con-bolsas.webp', x: 47, alto: 17.5, delante: true, reemplaza: 'coen-b', sigue: true, ms: 0, pausa: 200 },
        // // una sola animación continua (Wan encadenado): Rancek se agacha, recoge las bolsas «Magical Alliance», se levanta y se las extiende
        // { sinVideo: 'caja-v', texto: { titulo: 'Rancek:', texto: '«¡Aquí tienen sus bolsas! Gracias por su compra ✦»' }, nombre: 'mago-e', actor: 'assets/cuento/tienda/rancek-entrega-fluida', x: 76.2, alto: 17.1, clase: 'tras-mostrador', reemplaza: 'mago', sigue: true, de: 0, a: 1, ms: 10750, junto: true },
        // { sinVideo: 'caja-v', ms: 7300 },   // …hasta que suelta las bolsas
        // // y Coen las recibe a la par
        // { sinVideo: 'caja-v', nombre: 'coen-b', actor: 'assets/cuento/tienda/coen-toma-bolsas', x: 47, alto: 17.5, delante: true, reemplaza: 'coen-n', sigue: true, de: 0, a: 1, ms: 3000, pausa: 0 },
        // { sinVideo: 'caja-v', nombre: 'coen-n', img: 'assets/cuento/tienda/coen-con-bolsas.webp', x: 47, alto: 17.5, delante: true, reemplaza: 'coen-b', sigue: true, ms: 0, pausa: 0 },
        // { sinVideo: 'caja-v', ms: 500 },
        // respaldo: animación grupal Wan (se deformaba y cambiaba de tamaño)
        // la caja en pop-up: Coen y Rancek son un solo recorte animado (Wan) y el mueble de la caja va pegado encima, idéntico al real.
        // Rancek se agacha tras el mueble, se levanta con la polera burdeo y las bolsas, las empaca y se las pasa a Coen en la mano.
        // { texto: { titulo: 'Rancek:', texto: '«¡Aquí tienen sus bolsas! Gracias por su compra ✦»' }, nombre: 'grupo', actor: 'assets/cuento/tienda/grupo-caja', x: 61.9, alto: 19.78, delante: true, reemplaza: ['coen', 'mago', 'mesa'], sigue: true, de: 0, a: 1, ms: 10333, pausa: 0 },
        // al terminar, cada uno vuelve a ser su propia pieza, en el mismo lugar del último cuadro
        // { nombre: 'mesa', img: 'mesa-perfil.webp', x: 66, alto: 19, clase: 'mostrador espejo', abre: 'tienda', rotulo: 'Magical Alliance', directo: true, sigue: true, ms: 0, pausa: 0 },
        // { nombre: 'coen-g', img: 'assets/cuento/tienda/coen-caja-fin.webp', x: 44.38, alto: 17.03, delante: true, directo: true, sigue: true, ms: 0, pausa: 0 },
        // { nombre: 'mago', img: 'assets/cuento/tienda/rancek-caja-fin.webp', x: 74.37, alto: 16.701, delante: true, reemplaza: 'grupo', sigue: true, ms: 0, pausa: 300 },
        // y recién ahí el hada le pone a Coen su ropa nueva
        // { texto: { titulo: '¡A estrenar!', texto: 'Y el hada le puso a Coen su ropa nueva: polera burdeo y jogger blanco.' }, hadaSobre: 'coen-g' },
        // { texto: { titulo: '¡A estrenar!', texto: 'Y el hada les puso su ropa nueva: a Coen, su polera burdeo y su jogger blanco…' }, hadaSobre: 'coen-g' },
        // { nombre: 'coen-n', img: 'assets/cuento/tienda/coen-caja-burdeo.webp', x: 44.38, alto: 17.03, delante: true, reemplaza: 'coen-g', sigue: true, fx: { tipo: 'destello', x: 44.32, ancho: 14, y: 8, ms: 1200 }, ms: 1600 },
        // la caja como dibujo animado: poses dibujadas desde tus piezas originales (mismo tamaño en todas), sin Wan
        { texto: { titulo: 'Rancek:', texto: '«¡Aquí tienen sus bolsas! Gracias por su compra ✦»' }, nombre: 'mago-a', actor: 'assets/cuento/tienda/rancek-poses', x: 78, alto: 18.21, clase: 'tras-mostrador', reemplaza: 'mago', sigue: true, de: 0, a: 0, ms: 300, pausa: 0 },
        { nombre: 'coen-a', actor: 'assets/cuento/tienda/coen-poses', x: 40.6, alto: 18.75, delante: true, reemplaza: 'coen', sigue: true, de: 0, a: 0, ms: 200, pausa: 0 },
        // { nombre: 'mago-a', de: 1, a: 1, ruta: [[0, 78], [1, 74]], ms: 700, pausa: 0 },   // Rancek camina hasta el mueble de la caja
        { nombre: 'mago-w', actor: 'assets/cuento/tienda/rancek-anda-tienda', camina: [0, 1], cicloMs: 2917, x: 73.5, alto: 19.12, clase: 'tras-mostrador', reemplaza: 'mago-a', sigue: true, ruta: [[0, 78], [1, 73.5]], ms: 250, pausa: 0 },   // Rancek camina (Wan) hasta el mueble
        { nombre: 'mago-a', actor: 'assets/cuento/tienda/rancek-poses', x: 73.5, alto: 18.21, clase: 'tras-mostrador', reemplaza: 'mago-w', sigue: true, de: 2, a: 2, ms: 10, pausa: 0 },
        { nombre: 'mago-a', de: 2, a: 2, ms: 750, pausa: 0 },     // se agacha y toma las bolsas
        { nombre: 'mago-a', de: 3, a: 3, ms: 1300, pausa: 0 },    // guarda la polera burdeo
        // { nombre: 'coen-a', de: 1, a: 1, ruta: [[0, 47], [1, 57.5]], ms: 1000, pausa: 0 },   // Coen camina hasta la caja
        // Coen camina hasta la caja con un ciclo de caminata dibujado (25 % de escena por ciclo: el avance calza con el paso)
        { nombre: 'coen-w', actor: 'assets/cuento/tienda/coen-anda-der', camina: [0, 1], cicloMs: 1500, x: 57.5, alto: 20.61, delante: true, reemplaza: 'coen-a', sigue: true, ruta: [[0, 40.6], [1, 57.5]], ms: 600, pausa: 0 },
        // { nombre: 'coen-a', de: 2, a: 2, ms: 350, junto: true, sigue: true },              // estira la mano…
        { nombre: 'coen-a', actor: 'assets/cuento/tienda/coen-poses', x: 57.5, alto: 18.75, delante: true, reemplaza: 'coen-w', sigue: true, de: 2, a: 2, ms: 350, junto: true },   // estira la mano…
        { nombre: 'mago-a', de: 4, a: 4, ms: 700, pausa: 0 },     // …y Rancek le ofrece las bolsas
        { nombre: 'coen-a', de: 3, a: 3, ms: 250, junto: true, sigue: true },              // Coen las toma de su mano…
        { nombre: 'mago-a', de: 5, a: 5, sigue: true, ms: 900, pausa: 0 },     // …en el mismo instante en que Rancek las suelta
        // { nombre: 'coen-a', de: 5, a: 5, ruta: [[0, 57.5], [1, 47]], ms: 1000, junto: true, sigue: true },   // Coen vuelve con las bolsas
        { nombre: 'coen-w2', actor: 'assets/cuento/tienda/coen-anda-bolsas', camina: [0, 1], cicloMs: 1750, x: 40.6, alto: 20.61, delante: true, reemplaza: 'coen-a', sigue: true, ruta: [[0, 57.5], [1, 40.6]], ms: 705, junto: true },   // Coen vuelve caminando con las bolsas
        // { nombre: 'mago-a', de: 1, a: 1, clase: 'espejo', ruta: [[0, 74], [1, 78]], ms: 700, pausa: 0 },   // y vuelve a su lugar
        { nombre: 'mago-w2', actor: 'assets/cuento/tienda/rancek-anda-tienda', camina: [0, 1], cicloMs: 2917, x: 78, alto: 19.12, clase: 'tras-mostrador espejo', reemplaza: 'mago-a', sigue: true, ruta: [[0, 73.5], [1, 78]], ms: 250, pausa: 0 },   // y vuelve caminando a su lugar
        // { nombre: 'mago-a', quitaClase: 'espejo', de: 6, a: 6, ms: 500, pausa: 0 },     // Rancek queda tranquilo
        { nombre: 'mago-a', actor: 'assets/cuento/tienda/rancek-poses', x: 78, alto: 18.21, clase: 'tras-mostrador', reemplaza: 'mago-w2', sigue: true, de: 6, a: 6, ms: 500, pausa: 0 },     // Rancek queda tranquilo
        { nombre: 'coen-g', img: 'assets/cuento/tienda/coen-pose-bolsas.webp', x: 40.6, alto: 18.75, delante: true, reemplaza: 'coen-w2', sigue: true, ms: 0, pausa: 0 },
        { nombre: 'mago', img: 'assets/cuento/tienda/rancek-pose-tranquilo.webp', x: 78, alto: 18.21, clase: 'tras-mostrador', reemplaza: 'mago-a', sigue: true, ms: 0, pausa: 300 },
        // y recién ahí el hada les pone su ropa nueva
        { texto: { titulo: '¡A estrenar!', texto: 'Y el hada les puso su ropa nueva: a Coen, su polera burdeo y su jogger blanco…' }, hadaSobre: 'coen-g' },
        { nombre: 'coen-n', img: 'assets/cuento/tienda/coen-pose-burdeo.webp', x: 40.6, alto: 18.75, delante: true, reemplaza: 'coen-g', sigue: true, fx: { tipo: 'destello', x: 40.6, ancho: 14, y: 8, ms: 1200 }, ms: 1600 },
        { texto: { titulo: '¡A estrenar!', texto: '…y a Ari, su Vestido Magical ✧' }, hadaSobre: 'ari-c2' },
        { nombre: 'ari-m', img: 'assets/cuento/tienda/ari-look-magical-2-m.webp', x: 36.8, alto: 16.59, delante: true, clase: 'vive', reemplaza: 'ari-c2', sigue: true, fx: { tipo: 'destello', x: 36.8, ancho: 14, y: 8, ms: 1200 }, ms: 1600 },
        // respaldo: conversación anterior (Ari y Coen desaparecían; Rancek sin delantal desde el principio)
        // { nombre: 'mago', img: 'assets/cuento/tienda/rancek-perfil-m.webp', x: 78, alto: 17.86, clase: 'tras-mostrador', reemplaza: 'mago-e', sigue: true, ms: 0, pausa: 0 },
        // { nombre: 'ari-m', clase: 'saluda', fx: { tipo: 'destello', x: 40, ancho: 16, y: 6, ms: 1100 }, ms: 500, pausa: 0 },
        // { nombre: 'coen-n', clase: 'saluda', ms: 900 },
        // «vendo de todo»: y a ellos se les ocurre una idea
        // { texto: { titulo: 'Rancek:', texto: '«Vendo de todo y hago de todo… ¡hasta modelos 3D!»' }, nombre: 'mago-p', img: 'assets/cuento/tienda/rancek-presume-1-m.webp', x: 78, alto: 17.85, clase: 'tras-mostrador', reemplaza: 'mago', sigue: true, ms: 1300, pausa: 0 },   // se saca el delantal y abre los brazos, orgulloso
        // { nombre: 'mago-f', img: 'assets/cuento/tienda/rancek-presume-2-m.webp', x: 78, alto: 17.85, clase: 'tras-mostrador', reemplaza: 'mago-p', sigue: true, fx: { tipo: 'destello', x: 74, ancho: 6, y: 20, ms: 900 }, ms: 1600 },   // …y muestra una figurita que imprimió en 3D
        // { nombre: 'ari-m', clase: 'saluda', ms: 500, pausa: 0 },   // se miran…
        // { nombre: 'coen-n', clase: 'saluda', ms: 700, pausa: 200 },
        // { texto: { titulo: 'Ari y Coen:', texto: '«Tenemos una idea… ¿y si creamos algo juntos?»' }, nombre: 'ari-m', clase: 'saluda', fx: { tipo: 'destello', x: 32, ancho: 10, y: 15 }, ms: 2200 },
        // { texto: { titulo: 'Rancek:', texto: '«Mmm… aún no sé. Lo voy a pensar.»' }, nombre: 'mago-d', img: 'assets/cuento/tienda/rancek-presume-3-m.webp', x: 78, alto: 17.85, clase: 'tras-mostrador', reemplaza: 'mago-f', sigue: true, ms: 2000 },
        // { texto: { titulo: 'Ari y Coen:', texto: '«¡Piénsalo! Nos vemos, Rancek ✧»' }, nombre: 'coen-n', clase: 'saluda', ms: 1600 },
        // se van con su ropa nueva… y Rancek se queda pensando
        // { sale: ['ari-m', 'coen-n'], ms: 1400 },
        // { ms: 2600 },
        // { texto: { titulo: '', texto: 'Y Rancek se quedó pensando…' }, nombre: 'mago-d', clase: 'tras-mostrador', ms: 2400 },
        // { texto: { titulo: 'Rancek:', texto: '«¡Sí! ¡Voy con todo!»' }, nombre: 'mago-s', img: 'assets/cuento/tienda/rancek-presume-1-m.webp', x: 78, alto: 17.85, clase: 'tras-mostrador', reemplaza: 'mago-d', sigue: true, fx: { tipo: 'destello', x: 78, ancho: 12, y: 14 }, ms: 1800 },
        // { texto: { titulo: 'Rancek:', texto: '«…¿Eh? ¿Ya se fueron?»' }, nombre: 'mago-x', img: 'assets/cuento/tienda/rancek-presume-3-m.webp', x: 78, alto: 17.85, clase: 'tras-mostrador', reemplaza: 'mago-s', sigue: true, ms: 2400 }
        // la conversación completa: Rancek con su delantal, poses dibujadas desde su pieza
        { texto: { titulo: 'Rancek:', texto: '«Chicos, aquí yo solo vendo… pero para que sepan, hago modelos 3D. Si necesitan algo, se los hago ✦»' }, nombre: 'mago-f', img: 'assets/cuento/tienda/rancek-figurita.webp', x: 78, alto: 19.69, clase: 'tras-mostrador vive', reemplaza: 'mago', sigue: true, fx: { tipo: 'destello', x: 73, ancho: 6, y: 22, ms: 900 }, ms: 3200 },
        { nombre: 'ari-m', clase: 'vive saluda', ms: 400, pausa: 0 },   // se miran…
        { nombre: 'coen-n', clase: 'saluda', ms: 600, pausa: 0 },
        { texto: { titulo: 'Ari y Coen:', texto: '«¿Y si te sumas a nosotros? Estamos creando algo importante ✧»' }, nombre: 'ari-m', clase: 'vive saluda', fx: { tipo: 'destello', x: 40, ancho: 12, y: 15 }, ms: 2800 },
        { texto: { titulo: 'Rancek:', texto: '«Mmm… no sé. Es que trabajo en varios lados…»' }, nombre: 'mago-p', img: 'assets/cuento/tienda/rancek-piensa.webp', x: 78, alto: 19.69, clase: 'tras-mostrador vive', reemplaza: 'mago-f', sigue: true, ms: 2600 },
        // mientras él piensa, Ari y Coen se toman de la mano y salen de la tienda caminando (Wan, avance real) hasta el borde del libro
        // respaldo: caminata reflejada (Ari y Coen cambiaban de lado)
        // { texto: { titulo: '', texto: 'Y Rancek se quedó pensando… mientras Ari y Coen salían de la tienda.' }, nombre: 'pareja-s1', actor: 'assets/cuento/tienda/pareja-paseo-real-1', x: 25.7, alto: 17.98, delante: true, clase: 'espejo', reemplaza: ['ari-m', 'coen-n'], sigue: true, de: 0, a: 1, ms: 3000, pausa: 0 },
        // { nombre: 'pareja-s2', actor: 'assets/cuento/tienda/pareja-paseo-real-1', x: -2, alto: 17.98, delante: true, clase: 'espejo', reemplaza: 'pareja-s1', sigue: true, de: 0, a: 1, ms: 3000, junto: true },
        // { ms: 1050 },
        // respaldo: salida en dos tramos (al cambiar de tramo parpadeaba)
        // { texto: { titulo: '', texto: 'Y Rancek se quedó pensando… mientras Ari y Coen salían de la tienda.' }, nombre: 'pareja-s1', actor: 'assets/cuento/tienda/pareja-sale', x: 26.7, alto: 18.63, delante: true, reemplaza: ['ari-m', 'coen-n'], sigue: true, de: 0, a: 1, ms: 3000, pausa: 0 },
        // { nombre: 'pareja-s2', actor: 'assets/cuento/tienda/pareja-sale', x: 1.1, alto: 18.63, delante: true, reemplaza: 'pareja-s1', sigue: true, de: 0, a: 1, ms: 3000, junto: true },
        // { ms: 3000 },   // camina hasta cruzar el borde del libro
        // { sale: ['pareja-s2'], ms: 200 },
        // { texto: { titulo: '', texto: 'Y Rancek se quedó pensando… mientras Ari y Coen salían de la tienda.' }, nombre: 'pareja-s1', actor: 'assets/cuento/tienda/pareja-sale-larga', x: 13.97, alto: 18.63, delante: true, reemplaza: ['ari-m', 'coen-n'], sigue: true, de: 0, a: 1, ms: 6000, pausa: 0 },   // una sola caminata continua hasta cruzar el borde
        { texto: { titulo: '', texto: 'Y Rancek se quedó pensando… mientras Ari y Coen salían de la tienda.' }, nombre: 'pareja-s1', actor: 'assets/cuento/tienda/pareja-sale-centro', x: 39.5, alto: 18.63, delante: true, reemplaza: ['ari-m', 'coen-n'], sigue: true, de: 0, a: 1, ruta: [[0, 39.5], [1, -11.67]], ms: 6000, pausa: 0 },   // caminan de verdad hasta cruzar el borde
        { sale: ['pareja-s1'], ms: 200 },
        { texto: { titulo: 'Rancek:', texto: '«¡Sí! ¡Voy con todo!»' }, nombre: 'mago-s', img: 'assets/cuento/tienda/rancek-voy.webp', x: 78, alto: 19.69, clase: 'tras-mostrador vive', reemplaza: 'mago-p', sigue: true, fx: { tipo: 'destello', x: 78, ancho: 12, y: 16 }, ms: 2000 },
        { texto: { titulo: 'Rancek:', texto: '«…¿Eh? ¡Ay, no! ¡Se fueron!»' }, nombre: 'mago-x', img: 'assets/cuento/tienda/rancek-sorpresa.webp', x: 78, alto: 19.69, clase: 'tras-mostrador vive', reemplaza: 'mago-s', sigue: true, ms: 2200 },
        { nombre: 'mago-d', img: 'assets/cuento/tienda/rancek-delantal.webp', x: 78, alto: 19.69, clase: 'tras-mostrador', reemplaza: 'mago-x', sigue: true, ms: 1300 },
        // …y salió corriendo tras ellos hasta el borde del libro
        { texto: { titulo: 'Rancek:', texto: '«¡Espérenme!»' }, nombre: 'mago-c', actor: 'assets/cuento/tienda/rancek-corre-amigo-m', camina: [0, 1], cicloMs: 900, x: -12, alto: 17.96, clase: 'tras-mostrador espejo', reemplaza: 'mago-d', sigue: true, ruta: [[0, 78], [1, -12]], ms: 3270, pausa: 0 },
        { sale: ['mago-c'], ms: 300 },
        { texto: { titulo: '', texto: 'Rancek salió corriendo a alcanzarlos… ¡pasa la página para ver si los encuentra! →' }, ms: 1800 }   // la tienda no queda vacía sin explicación
      ] }
    ] },
    paseo: { carpeta: 'cap6/', suave: true, hitos: [
      { fondo: 'fondo-paseo.webp', suelo: 'suelo-paseo.webp', titulo: 'Con sus compras puestas…', texto: 'Ari con su Vestido Magical; Coen con su jogger blanco y su polera burdeo.', pasos: [
        // pasean por el reino con su ropa nueva de Magical Alliance
        // respaldo: pareja quieta
        // { nombre: 'coen', img: 'assets/cuento/tienda/coen-paseo.webp', x: 64, alto: 17.5, delante: true, ms: 500, pausa: 0 },
        // { nombre: 'ari', img: 'assets/cuento/tienda/ari-look-magical.webp', x: 52, alto: 15.8, delante: true, ms: 1400 },
        // { nombre: 'ari', clase: 'saluda', ms: 600, pausa: 0 },
        // { nombre: 'coen', clase: 'saluda', ms: 1200 },
        // caminan de la mano desde el borde del libro, Coen con las bolsas (ciclo Wan de 18 cuadros)
        // { nombre: 'pareja-c', actor: 'assets/cuento/tienda/pareja-paseo-anda', camina: [0, 1], cicloMs: 1800, x: 8, alto: 17.5, delante: true, entra: true, ruta: [[0, 8], [1, 58]], ms: 3500, pausa: 0 },
        // caminan de la mano hasta el centro; la caminata termina en el cuadro en que empiezan a darse vuelta
        // { nombre: 'pareja-c', actor: 'assets/cuento/tienda/pareja-paseo-anda', camina: [0, 1], cicloMs: 1800, x: 60, alto: 17.5, delante: true, entra: true, ruta: [[0, 8], [1, 60]], ms: 3150, junto: true },
        // { ms: 1350 },
        // caminata con avance real (Wan): los pies pisan el suelo, no resbalan; dos tramos encadenados desde el borde del libro
        // (se probó reemplazarla por el dibujo fijo deslizándose: se veía arrastrado; vuelve la caminata real)
        { nombre: 'pareja-r1', actor: 'assets/cuento/tienda/pareja-paseo-real-1', x: 22.35, alto: 17.98, delante: true, entra: true, de: 0, a: 1, ms: 3000, pausa: 0 },
        { nombre: 'pareja-c', actor: 'assets/cuento/tienda/pareja-paseo-real-2', x: 49.22, alto: 17.98, delante: true, reemplaza: 'pareja-r1', sigue: true, de: 0, a: 1, ms: 3000, junto: true },
        { ms: 1150 },
        // { nombre: 'pareja', img: 'assets/cuento/tienda/pareja-paseo-quieta.webp', x: 58, alto: 17.5, delante: true, reemplaza: 'pareja-c', sigue: true, ms: 300, pausa: 200 },
        // { nombre: 'pareja', clase: 'saluda', ms: 1200 },
        // …y Rancek llega corriendo con la respuesta que no alcanzó a darles en la tienda
        // respaldo: carrera y diálogo anteriores
        // { texto: { titulo: 'Rancek:', texto: '«¡Esperen! ¡Ya lo pensé… voy con todo!»' }, nombre: 'rancek-c', actor: 'assets/cuento/tienda/rancek-corre', camina: [0, 1], cicloMs: 640, x: 30, alto: 17.1, delante: true, entra: true, ruta: [[0, 5], [1, 30]], ms: 2600 },
        // { nombre: 'rancek', img: 'assets/cuento/tienda/rancek-presume-4.webp', x: 30, alto: 17, delante: true, reemplaza: 'rancek-c', sigue: true, ms: 600 },
        // { texto: { titulo: 'Ari y Coen:', texto: '«¡Sabíamos que vendrías! ✧»' }, nombre: 'pareja', clase: 'saluda', fx: { tipo: 'destello', x: 58, ancho: 16, y: 12 }, ms: 600, pausa: 0 },
        // { nombre: 'pareja', clase: 'saluda', ms: 1800 },
        // respaldo: llegada anterior (Rancek quieto de frente y la pareja sin darse vuelta)
        // // Rancek llega corriendo desde el borde del libro, gritando (carrera Wan de 18 cuadros)
        // { texto: { titulo: 'Rancek:', texto: '«¡Espéreeeen!»' }, nombre: 'rancek-c', actor: 'assets/cuento/tienda/rancek-corre-amigo', camina: [0, 1], cicloMs: 800, x: 34, alto: 17.1, delante: true, entra: true, ruta: [[0, 5], [1, 34]], ms: 1500, pausa: 0 },
        // { nombre: 'rancek', img: 'assets/cuento/tienda/rancek-presume-4.webp', x: 34, alto: 17, delante: true, reemplaza: 'rancek-c', sigue: true, ms: 1400 },
        // { texto: { titulo: 'Rancek:', texto: '«¡Sí, sí! Ya lo pensé… ¡voy con todo! Hagamos de todo juntos.»' }, nombre: 'rancek', clase: 'saluda', fx: { tipo: 'destello', x: 34, ancho: 12, y: 14 }, ms: 3000 },
        // { texto: { titulo: 'Ari y Coen:', texto: '«¡Sabíamos que vendrías! ✧»' }, nombre: 'pareja', clase: 'saluda', fx: { tipo: 'destello', x: 58, ancho: 16, y: 12 }, ms: 2600 },
        // Rancek llega corriendo desde el borde del libro, gritando; dos zancadas completas para frenar en el cuadro de partida
        // { texto: { titulo: 'Rancek:', texto: '«¡Espéreeeen!»' }, nombre: 'rancek-c', actor: 'assets/cuento/tienda/rancek-corre-amigo', camina: [0, 1], cicloMs: 800, x: 34, alto: 17.1, delante: true, entra: true, ruta: [[0, 5], [1, 34]], ms: 1600, pausa: 0 },
        { texto: { titulo: 'Rancek:', texto: '«¡Espéreeeen!»' }, nombre: 'rancek-c', actor: 'assets/cuento/tienda/rancek-corre-amigo-m', camina: [0, 1], cicloMs: 900, x: 38, alto: 17.96, delante: true, entra: true, ruta: [[0, 2], [1, 38]], ms: 1800, pausa: 0 },
        // Ari y Coen lo escuchan y se dan vuelta de la mano mientras él frena (Wan)
        { nombre: 'pareja-g', actor: 'assets/cuento/tienda/pareja-gira', x: 62.65, alto: 17.5, delante: true, reemplaza: 'pareja-c', sigue: true, de: 0, a: 1, ms: 2500, junto: true },
        { nombre: 'rancek-f', actor: 'assets/cuento/tienda/rancek-frena', x: 38, alto: 17.1, delante: true, reemplaza: 'rancek-c', sigue: true, de: 0, a: 1, ms: 2100, pausa: 0 },
        // y ya frente a frente, Rancek les habla gesticulando
        { nombre: 'rancek', actor: 'assets/cuento/tienda/rancek-habla', x: 38, alto: 17.1, delante: true, reemplaza: 'rancek-f', sigue: true, bucle: [0, 1], cicloMs: 2500, ms: 200, pausa: 0 },
        { texto: { titulo: 'Rancek:', texto: '«¡Sí, sí! Ya lo pensé… ¡voy con todo! Hagamos de todo juntos.»' }, fx: { tipo: 'destello', x: 38, ancho: 12, y: 14 }, ms: 3200 },
        { texto: { titulo: 'Ari y Coen:', texto: '«¡Sabíamos que vendrías! ✧»' }, nombre: 'pareja-g', clase: 'saluda', fx: { tipo: 'destello', x: 62.65, ancho: 16, y: 12 }, ms: 2600 },
        { texto: { titulo: '', texto: 'Y así, los tres juntos, empezaron a crear algo nuevo…' }, fx: [{ tipo: 'destello', x: 30, ancho: 12, y: 10, ms: 1200 }, { tipo: 'destello', x: 58, ancho: 16, y: 10, ms: 1200, tras: 300 }], ms: 2600 }
      ] }
    ] },
    vii: { carpeta: 'cap7/', hitos: [
      { fondo: 'fondo-mercado.webp', suelo: 'suelo-mercado.webp', titulo: '', texto: '', pasos: [
        { nombre: 'vitrina', img: 'vitrina.webp', x: 52, alto: 19, fila: 'medio', efecto: 'brilla', ms: 1800 },
        { nombre: 'ari', img: 'assets/cuento/tienda/ari-casual.webp', x: 28, alto: 15.8, delante: true, ms: 1400, pausa: 300 },                       // Ari llega como clienta…
        { nombre: 'coen', img: 'assets/cuento/tienda/coen-casual.webp', x: 76, alto: 17.5, delante: true, ms: 1400 },                     // …y Coen la acompaña
        { nombre: 'ari', efecto: 'salto', ms: 2200 },
        { app: true, ms: 400 }
      ] }
    ] },
    viii: { carpeta: 'cap8/', hitos: [
      { fondo: 'fondo-taller.webp', suelo: 'suelo-taller.webp', titulo: 'Aprendió sola', texto: 'Primero con papel, lápices y pintura…', pasos: [
        { nombre: 'papel1', img: 'assets/galeria/papel-luna-sakura.webp', x: 16, alto: 9, fila: 'atras', clase: 'cuadro', ms: 300, pausa: 200 },
        { nombre: 'papel2', img: 'assets/galeria/papel-amerikano.webp', x: 84, alto: 10, fila: 'atras', clase: 'cuadro', ms: 900 },
        { actor: 'atril', x: 32, alto: 16, de: 0, a: 1, ms: 4000, texto: { titulo: 'Después con tableta…', texto: '…redibujando hasta encontrar su propio trazo.' } },
        { nombre: 'lienzo', img: 'assets/galeria/regalo-1.webp', linea: 'assets/galeria/regalo-1-lineart.webp', x: 66, alto: 17, clase: 'cuadro', ms: 4600,
          texto: { titulo: 'Así nace cada ilustración', texto: 'Primero la línea… y después el color.' } }
      ] }
    ] },
    // las ocho láminas en una sola fila, del mismo tamaño y lejos de los bordes (antes alternaban dos filas y la de atrás se veía más chica)
    galeria: { carpeta: 'cap8/', hitos: [
      { fondo: 'fondo-galeria.webp', suelo: 'suelo-galeria.webp', pasos: [
        { nombre: 'achachila', img: 'assets/galeria/achachila.webp', x: 13, alto: 14, clase: 'cuadro', ms: 250, pausa: 150 },
        { nombre: 'alicanto', img: 'assets/galeria/alicanto.webp', x: 23.6, alto: 14, clase: 'cuadro', ms: 250, pausa: 150 },
        { nombre: 'lascar', img: 'assets/galeria/lascar.webp', x: 34.2, alto: 14, clase: 'cuadro', ms: 250, pausa: 150 },
        { nombre: 'lica', img: 'assets/galeria/lica.webp', x: 44.8, alto: 14, clase: 'cuadro', ms: 250, pausa: 150 },
        { nombre: 'pachamama', img: 'assets/galeria/pachamama.webp', x: 55.2, alto: 14, clase: 'cuadro', ms: 250, pausa: 150 },
        { nombre: 'reina-noche', img: 'assets/galeria/reina-noche.webp', x: 65.8, alto: 14, clase: 'cuadro', ms: 250, pausa: 150 },
        { nombre: 'supai', img: 'assets/galeria/supai.webp', x: 76.4, alto: 14, clase: 'cuadro', ms: 250, pausa: 150 },
        { nombre: 'tirana-1', img: 'assets/galeria/tirana-1.webp', x: 87, alto: 14, clase: 'cuadro', ms: 250, pausa: 150 },
        { app: true, ms: 300 }
      ] }
    ] },
    ix: { carpeta: 'cap9/', hitos: [
      { fondo: 'fondo-torre.webp', suelo: 'suelo-torre.webp', titulo: 'En lo alto de la torre…', texto: 'vive un oráculo que guarda los colores y las canciones favoritas de quienes lo visitan.', pasos: [
        { nombre: 'oraculo', actor: 'oraculo-anim', pj: false, x: 24, alto: 16, clase: 'brilla', bucle: [0, 1], cicloMs: 3000, ms: 2200 },
        { nombre: 'pergamino', img: 'pergamino.webp', x: 62, alto: 30, clase: 'pergamino-datos', ms: 1600 },
        { texto: { titulo: 'Lo que aprendió', texto: '' }, ms: 400, evento: 'oraculo-cartel' }
      ] }
    ] },
    x: { carpeta: 'cap10/', hitos: [
      { fondo: 'fondo-juegos.webp', suelo: 'suelo-juegos.webp', titulo: 'El salón de los juegos', texto: 'Toca una máquina para jugar.', pasos: [
        { nombre: 'a1', actor: 'arcade1-anim', pj: false, bucle: [0, 1], cicloMs: 3000, x: 25, alto: 17, fila: 'medio', abre: 'bloques', rotulo: 'Bloques encantados', ms: 300, pausa: 200 },
        { nombre: 'a2', actor: 'arcade2-anim', pj: false, bucle: [0, 1], cicloMs: 3000, x: 50, alto: 17, fila: 'medio', abre: 'gemas', rotulo: 'Jardín de gemas lunares', ms: 300, pausa: 200 },
        { nombre: 'a3', actor: 'arcade3-anim', pj: false, bucle: [0, 1], cicloMs: 3000, x: 75, alto: 17, fila: 'medio', abre: 'estrellas', rotulo: 'Cielo de constelaciones', ms: 300 }
      ] }
    ] },
    final: { carpeta: 'final/', hitos: [
      { fondo: 'fondo-cima.webp', suelo: 'suelo-cima.webp', titulo: 'No es el fin…', texto: '…es solo el inicio.', pasos: [
        { nombre: 'ari', actor: 'baculo-anim', x: 50, alto: 17, efecto: 'brilla', ms: 2600, bucle: [0, 1], cicloMs: 3000,
          texto: { titulo: 'A pesar de los obstáculos…', texto: 'siempre debes alcanzar tu sueño.' } },
        // Ari se transforma como una chica mágica: cintas de luz la envuelven y queda con el traje y las alas del hada
        { nombre: 'ari-t', actor: 'final-anim', x: 49.6, alto: 17.4, pj: true, clase: 'hada-final', reemplaza: 'ari', sigue: true, de: 0, a: 1, ms: 5200, pausa: 300,
          fx: [{ tipo: 'destello', x: 50, ancho: 26, y: 6, ms: 1400 }, { tipo: 'destello', x: 50, ancho: 30, y: 10, ms: 1300, tras: 3800 }] },
        // …ya vestida de hada dibuja un círculo de luz con su varita; al terminar el encantamiento, la niebla nace de la estrella
        { nombre: 'ari-t', de: 1, a: 2, ms: 4000, pausa: 0 },   // la misma animación sigue, sin cambiar de imagen
        { evento: 'cuento-dibuja-mundo', ms: 50 }
      ] }
    ] },
    logros: { carpeta: 'logros/', hitos: [
      { fondo: 'fondo-podio.webp', suelo: 'suelo-podio.webp', central: 'Después de tantas noches de código, llegó su recompensa: en junio de 2026 terminó el curso Desarrollo de Aplicaciones Full Stack Java, 480 horas de SENCE y Talento Digital. Su medalla es digital y cualquiera puede verificarla. Pero Ari nunca deja de aprender: hoy estudia el Certificado de Análisis de Datos de Google, con cinco cursos ya aprobados.', titulo: 'Logro desbloqueado', texto: 'Un reconocimiento muy importante para su carrera.', pasos: [
        { nombre: 'ari', actor: 'medalla', x: 50, alto: 16, efecto: 'brilla', ms: 2800, bucle: [0, 1], cicloMs: 3000 },                       // Ari levanta su medalla en el podio
        { nombre: 'ari', efecto: 'salto', ms: 2400 }   // salta de alegría con su medalla
      ] },
      { fondo: 'fondo-stream.webp', suelo: 'suelo-stream.webp', central: 'Y cuando caía la noche, encendía la cámara junto a Coen. En ArianesDCoen jugaban, reían y compartían sus aventuras con una pequeña comunidad que los acompañaba en cada partida.', titulo: '¡En vivo!', texto: 'El público animaba con corazones y barras de luz.', pasos: [
        { nombre: 'streamers', actor: 'streamers-anim', x: 50, alto: 15.7, fila: 'medio', ms: 2400, bucle: [0, 1], cicloMs: 3000 },                                                  // Ari y Coen juegan en vivo
        { nombre: 'publico', actor: 'publico-anim', x: 50, alto: 7, clase: 'primer', ms: 2600, bucle: [0, 1], cicloMs: 2600 },                     // el público los anima
        { texto: { titulo: 'En pausa… por ahora', texto: 'Lo pausaron por sus proyectos… ¡pero volverán!' }, ms: 2400 }
      ] }
    ] },
    cv: { carpeta: 'logros/', apura: true, hitos: [
      { fondo: 'fondo-mapa.webp', suelo: 'suelo-mapa.webp', titulo: 'El mapa de su camino', texto: 'Cada lugar de su historia se levanta en el año en que llegó.', pasos: [
        // los lugares en orden de llegada, todos del mismo tamaño en una sola fila y lejos de los bordes del libro (antes el de 2018 quedaba cortado)
        { nombre: 'lugarb1', img: 'assets/cuento/logros/lugarb1.webp', clase: 'rebote', x: 12, ancho: 9.5, rotulo: '2018', ms: 1100, pausa: 350, texto: { titulo: '2018 · Matrona · titulación con distinción', texto: 'Universidad San Sebastián, Concepción.' } },
        { nombre: 'lugar1', img: 'assets/cuento/logros/lugar1.webp?v=2', clase: 'rebote', x: 23, ancho: 9.5, rotulo: '2019', ms: 1100, pausa: 350, texto: { titulo: '2019 · Matrona · Hospital de Andacollo', texto: 'Clínica de Lactancia Materna, programa VIH y atención primaria.' } },
        { nombre: 'lugar2', img: 'assets/cuento/logros/lugar2.webp', clase: 'rebote', x: 34, ancho: 9.5, rotulo: '2019 – 2021', ms: 1100, pausa: 350, texto: { titulo: '2019 – 2021 · Matrona clínica · Hospital San José de Coronel', texto: 'Urgencias obstétricas, preparto, parto y puerperio.' } },
        { nombre: 'lugar3', img: 'assets/cuento/logros/lugar3.webp', clase: 'rebote', x: 45, ancho: 9.5, rotulo: '2021', ms: 1100, pausa: 350, texto: { titulo: '2021 · Matrona · CESFAM O\'Higgins', texto: 'Atención integral, planillas de PAP y mamografía, campañas educativas.' } },
        { nombre: 'lugar4', img: 'assets/cuento/logros/lugar4.webp', clase: 'rebote', x: 56, ancho: 9.5, rotulo: '2022 – 2023', ms: 1100, pausa: 350, texto: { titulo: '2022 – 2023 · Matrona · SSMSO', texto: 'Campañas de PAP en clínicas móviles y seguimiento de pacientes.' } },
        { nombre: 'lugarb2', img: 'assets/cuento/logros/lugarb2.webp', clase: 'rebote', x: 67, ancho: 9.5, rotulo: '2024', ms: 1100, pausa: 350, texto: { titulo: '2024 · Educadora · Academia Aliwen', texto: 'Matemáticas, Ciencias y Lenguaje con material adaptado.' } },
        { nombre: 'lugarb4', img: 'assets/cuento/logros/lugarb4.webp', clase: 'rebote', x: 78, ancho: 9.5, rotulo: '2026 – hoy', ms: 1100, pausa: 350, texto: { titulo: '2026 – hoy · Socia fundadora · Studios Conari SpA', texto: 'Diseño editorial, ilustración, 3D, sitio web y administración.' } },
        { nombre: 'lugarb3', img: 'assets/cuento/logros/lugarb3.webp', clase: 'rebote', x: 89, ancho: 9.5, rotulo: '2026', ms: 1100, pausa: 350, texto: { titulo: '2026 · VILU · proyecto de Studios Conari', texto: 'Para postular al Fondo de Cultura: line art de 14 personajes, modelado, rigging y animación en Blender, integración en Godot.' } },
        { texto: { titulo: 'Su currículum completo', texto: 'Experiencia, formación y habilidades.' }, app: true, ms: 400 }
      ] }
    ] },
    iii: { carpeta: 'cap3/', textos: 'huellas', hitos: [
      // en el orden de su currículum: tesis, hospital, Andacollo, CESFAM, clínica móvil, Academia Aliwen y su estudio
      { fondo: 'fondo-biblioteca.webp', suelo: 'suelo-biblioteca.webp', pasos: [
        { actor: 'tes', x: 27, alto: 15, de: 0, a: 1, ms: 4000 },                     // a la izquierda: escribe la tesis y la muestra
        { actor: 'par', x: 72, alto: 13, de: 0, a: 1, ms: 3500 }                      // a la derecha: el cariño de los adultos mayores
      ] },
      { fondo: 'fondo-familia.webp', suelo: 'suelo-familia.webp', pasos: [
        { actor: 'ccc', x: 64, alto: 16, de: 0, a: 1, ms: 4500 }                      // a la derecha: graba el video para las familias
      ] },
      { fondo: 'fondo-cesfam.webp', suelo: 'suelo-cesfam.webp', pasos: [
        { actor: 'disp', x: 50, alto: 16, de: 0, a: 1, ms: 5000 },                   // al centro: arma el dispensador y lo muestra
        { actor: 'muro', x: 74, alto: 17, de: 0, a: 1, ms: 3500, quita: 'disp' },    // a la derecha: lo instala en el muro
        { actor: 'pac', camina: [0, 1], desde: 92, x: 82, alto: 16.5, ms: 3400, delante: true, pausa: 0 },   // una paciente llega caminando desde la derecha…
        { actor: 'pac', de: 1, a: 2, ms: 450, pausa: 0, sigue: true },                             // …y sin detenerse pasa de la caminata a estirar la mano (fundido)
        { actor: 'pac', de: 2, a: 3, ms: 3000, sigue: true }                                       // …saca uno del dispensador y sonríe
      ] },
      { fondo: 'fondo-feria.webp', suelo: 'suelo-feria.webp', pasos: [
        { actor: 'edu', x: 28, alto: 16, de: 0, a: 1, ms: 4500 }                      // a la izquierda: explica con una lámina a las alumnas
      ] },
      { fondo: 'fondo-box.webp', suelo: 'suelo-box.webp', pasos: [
        { actor: 'pla', x: 44, alto: 15, de: 0, a: 1, ms: 4500 }                      // los papeles se vuelven planilla
      ] },
      { fondo: 'assets/cuento/cap2/g05f-fondo.webp', suelo: 'assets/cuento/cap2/g05f-suelo.webp', pasos: [
        { actor: 'ssm', x: 40, alto: 16, de: 0, a: 1, ms: 4500 }                      // la matrona las atiende y se despide desde su lugar; ellas se van al camión
      ] },
      { fondo: 'fondo-aula.webp', suelo: 'assets/cuento/cap2/g02-suelo.webp', pasos: [
        { nombre: 'profe', actor: 'aula-anim', x: 46, alto: 19.5, pj: true, bucle: [0, 1], cicloMs: 3100, ms: 3200 }      // enseña a los niños de básica
      ] },
      { fondo: 'fondo-taller3d.webp', suelo: 'suelo-box.webp', pasos: [
        { nombre: 'f1', img: 'obj3d-soporte.webp', x: 20, alto: 10, fila: 'medio', clase: 'rebote', ms: 500, pausa: 200 },
        { nombre: 'f2', img: 'obj3d-matias.webp', x: 33, alto: 10, fila: 'medio', clase: 'rebote', ms: 500, pausa: 200 },
        { nombre: 'f3', img: 'obj3d-casita.webp', x: 67, alto: 11, fila: 'medio', clase: 'rebote', ms: 500, pausa: 200 },
        { nombre: 'ender', img: 'ender3.webp', x: 84, alto: 13, fila: 'medio', clase: 'rebote', ms: 600, pausa: 200 },   // su impresora Ender 3
        { nombre: 'ari3d', img: 'ari-impresora.webp', x: 50, alto: 16, pj: true, efecto: 'brilla', ms: 2600 }   // muestra su figura impresa y pintada a mano
      ] }
    ] },
    // IX · practicando sus hechizos: en la torre, el libro de hechizos de la matrona (tableros), sus cápsulas y el banco
    hechizos: { carpeta: 'cap9/', hitos: [
      { fondo: 'fondo-torre.webp', suelo: 'suelo-torre.webp', titulo: 'La torre de los hechizos', texto: 'Después de sus medallas, Ari siguió practicando cada día.', pasos: [
        { nombre: 'ari', img: 'assets/cuento/etapas/ari-hoy.webp', pj: true, x: 22, alto: 16, delante: true, clase: 'vive', ms: 900, pausa: 300 },   // se levanta de la página como figura pop-up y respira (sin deslizarse ni saltar)
        { texto: { titulo: 'Ari:', texto: '«Lo que aprendí de datos… ¡lo voy a usar en lo que conozco de cerca!»' }, nombre: 'ari', clase: 'vive saluda', ms: 1800 },
        { nombre: 'perg', img: 'pergamino.webp', x: 62, alto: 19, clase: 'pergamino-hechizo', fx: { tipo: 'destello', x: 62, ancho: 14, y: 12 }, ms: 1200 },
        { pergTitulo: 'Mis nuevos hechizos', perg: 'Datos de salud que se entienden, cápsulas para las familias y herramientas para enseñar.', evento: 'hechizo-pergamino', ms: 2400 }
      ] },
      { suelo: 'suelo-torre.webp', titulo: 'El libro de hechizos de la matrona', texto: 'Cinco tableros con datos de salud de Chile. Cada gema guarda lo que descubrió.', pasos: [
        { nombre: 'ari', img: 'assets/cuento/etapas/ari-hoy.webp', pj: true, x: 87, alto: 16, delante: true, clase: 'vive', ms: 900, pausa: 300 },   // se levanta de la página como figura pop-up y respira (sin deslizarse ni saltar)
        { nombre: 'perg', img: 'pergamino.webp', x: 72, alto: 24, clase: 'pergamino-hechizo', ms: 600, pausa: 200 },
        { nombre: 'g-anticonceptivos', img: 'assets/cuento/hechizos/gema-anticonceptivos.webp', x: 10, alto: 7, fila: 'atras', clase: 'gema rebote', abre: 'tableros', rotulo: 'Anticonceptivos', ms: 300, pausa: 120 },
        { nombre: 'g-its', img: 'assets/cuento/hechizos/gema-its.webp', x: 22, alto: 7, fila: 'atras', clase: 'gema rebote', abre: 'tableros', rotulo: 'ITS', ms: 300, pausa: 120 },
        { nombre: 'g-embarazo', img: 'assets/cuento/hechizos/gema-embarazo.webp', x: 34, alto: 7, fila: 'atras', clase: 'gema rebote', abre: 'tableros', rotulo: 'Embarazo y matronas', ms: 300, pausa: 120 },
        { nombre: 'g-ajuar', img: 'assets/cuento/hechizos/gema-ajuar.webp', x: 46, alto: 7, fila: 'atras', clase: 'gema rebote', abre: 'tableros', rotulo: 'El ajuar', ms: 300, pausa: 120 },
        { nombre: 'g-cancer', img: 'assets/cuento/hechizos/gema-cancer.webp', x: 58, alto: 7, fila: 'atras', clase: 'gema rebote', abre: 'tableros', rotulo: 'Cáncer', ms: 300, pausa: 120 },
        { nombre: 'g-anticonceptivos', clase: 'encendida', perg: 'Ofrecer primero los métodos de larga duración es lo que más ayuda.', texto: { titulo: 'Anticonceptivos', texto: 'Elegir bien es más importante que elegir cualquier método: ofrecer primero los métodos de larga duración, sobre todo a adolescentes, es la medida con más impacto.' }, evento: 'hechizo-pergamino', ms: 500, pausa: 600, lee: 4500 },
        { nombre: 'g-its', clase: 'encendida', perg: 'Hace falta más testeo, tratamiento a tiempo y condón.', texto: { titulo: 'ITS', texto: 'Las ITS van en sentido contrario al embarazo adolescente: hace falta más testeo, tratamiento oportuno y uso de condón, y medir las ITS que hoy no se vigilan.' }, evento: 'hechizo-pergamino', ms: 500, pausa: 600, lee: 4500 },
        { nombre: 'g-embarazo', clase: 'encendida', perg: 'La prevención funciona: las matronas deben estar en los colegios.', texto: { titulo: 'Embarazo y matronas', texto: 'La prevención funciona y Chile tiene más matronas que nunca: el desafío es ponerlas donde está la prevención, como los colegios.' }, evento: 'hechizo-pergamino', ms: 500, pausa: 600, lee: 4500 },
        { nombre: 'g-ajuar', clase: 'encendida', perg: 'Llega a casi todas las familias: hay que cuidar su cadena.', texto: { titulo: 'El ajuar', texto: 'El ajuar llega a casi todas las familias de la red pública; cuidar la cadena de compra es lo que mantiene ese logro.' }, evento: 'hechizo-pergamino', ms: 500, pausa: 600, lee: 4500 },
        { nombre: 'g-cancer', clase: 'encendida', perg: 'Llegar a tiempo cambia todo: PAP, mamografía y vacuna VPH.', texto: { titulo: 'Cáncer', texto: 'En cáncer, llegar a tiempo cambia todo: la mamografía, el PAP, el test VPH y la vacuna VPH son lo que más vidas salva.' }, evento: 'hechizo-pergamino', ms: 500, pausa: 600, lee: 4500 },
        { texto: { titulo: '', texto: 'Toca una gema para abrir sus tableros.' }, ms: 900 }
      ] },
      { suelo: 'suelo-torre.webp', titulo: 'Ocho cápsulas nuevas', texto: 'Animadas y narradas por ella, con la información vigente en Chile.', pasos: [
        { nombre: 'ari', img: 'assets/cuento/etapas/ari-hoy.webp', pj: true, x: 16, alto: 16, delante: true, clase: 'vive', ms: 900, pausa: 300 },   // se levanta de la página como figura pop-up y respira (sin deslizarse ni saltar)
        // la cápsula aparece cerrada, se abre y de adentro van saliendo las cápsulas de video
        { nombre: 'capsula', img: 'assets/cuento/hechizos/capsula.webp', x: 60, alto: 9, fila: 'atras', efecto: 'flota', ms: 1100, pausa: 400 },
        { nombre: 'capsula-ab', img: 'assets/cuento/hechizos/capsula-abierta.webp', x: 60, alto: 10.1, fila: 'atras', reemplaza: 'capsula', sigue: true, fx: { tipo: 'destello', x: 60, ancho: 18, y: 10, ms: 1200 }, ms: 700, pausa: 200 },
        { nombre: 'c1', img: 'assets/matrona/portada_01_como_guardo_mi_leche.webp', desde: 60, x: 36, alto: 9, fila: 'medio', clase: 'cuadro sale-capsula', abre: 'capsulas', entra: true, ruta: [[0, 60, 6], [.42, 47, 16], [.72, 36, 0], [.83, 36, 3], [.92, 36, 0], [.97, 36, 1], [1, 36, 0]], suave: 'linear', ms: 1400, pausa: 250 },
        { nombre: 'c2', img: 'assets/matrona/portada_04_sueno_seguro.webp', desde: 60, x: 60, alto: 9, fila: 'medio', clase: 'cuadro sale-capsula', abre: 'capsulas', entra: true, ruta: [[0, 60, 6], [.42, 60, 19], [.72, 60, 0], [.83, 60, 3], [.92, 60, 0], [.97, 60, 1], [1, 60, 0]], suave: 'linear', ms: 1400, pausa: 250 },
        { nombre: 'c3', img: 'assets/matrona/portada_06_que_es_el_pap.webp', desde: 60, x: 84, alto: 9, fila: 'medio', clase: 'cuadro sale-capsula', abre: 'capsulas', entra: true, ruta: [[0, 60, 6], [.42, 73, 16], [.72, 84, 0], [.83, 84, 3], [.92, 84, 0], [.97, 84, 1], [1, 84, 0]], suave: 'linear', ms: 1400, pausa: 300 },
        // (antes la cápsula desaparecía en una nube de humo: ahora se queda abierta y los videos caen rebotando)
        { texto: { titulo: 'Ari:', texto: '«Leche materna, Shantala, sueño seguro, el PAP… ¡para ver en la sala de espera o en la casa!»' }, nombre: 'ari', efecto: 'brilla', ms: 1800 }
      ] },
      { suelo: 'suelo-torre.webp', titulo: 'El Banco de Evaluaciones', texto: 'Un banco de preguntas para docentes, probado con un Moodle real.', pasos: [
        { nombre: 'ari', img: 'assets/cuento/etapas/ari-hoy.webp', pj: true, x: 20, alto: 16, delante: true, clase: 'vive', ms: 900, pausa: 300 },   // se levanta de la página como figura pop-up y respira (sin deslizarse ni saltar)
        { nombre: 'banco', img: 'assets/cuento/hechizos/banco.webp', x: 62, alto: 12, fila: 'medio', clase: 'cuadro', abre: 'banco', fx: { tipo: 'destello', x: 62, ancho: 16, y: 10 }, ms: 900 },
        { texto: { titulo: 'Ari:', texto: '«La inteligencia artificial ayuda, pero la respuesta correcta siempre la confirma una persona.»' }, nombre: 'ari', efecto: 'salto', ms: 1800 }
      ] },
      { suelo: 'suelo-torre.webp', titulo: '', texto: '', pasos: [
        { nombre: 'ari', img: 'assets/cuento/etapas/ari-hoy.webp', pj: true, x: 50, alto: 16, delante: true, clase: 'vive', ms: 900, pausa: 300 },   // se levanta de la página como figura pop-up y respira (sin deslizarse ni saltar)
        { texto: { titulo: 'Ari:', texto: '«Cada hechizo que aprendo lo uso para ayudar a alguien.»' }, nombre: 'ari', efecto: 'brilla', fx: { tipo: 'destello', x: 50, ancho: 14, y: 14 }, ms: 1800 },
        { texto: { titulo: '', texto: 'Y sin que nadie lo notara, algo más grande empezaba a nacer…' }, ms: 2200 }
      ] }
    ] },
  };
  const ruta = (esc, n) => n.startsWith('assets/') ? n : 'assets/cuento/' + esc.carpeta + n;
  const hojas = {};
  // la hoja queda lista (datos e imagen ya decodificada) antes de mostrarse: así un personaje reemplaza a otro sin parpadeo
  const imagenLista = src => { const i = new Image(); i.src = src; return (i.decode ? i.decode() : new Promise(ok => { i.onload = ok; })).catch(() => {}); };
  const hojaDe = src => hojas[src] || (hojas[src] = Promise.all([fetch(src.replace(/\.webp$/, '.json')).then(r => r.json()), imagenLista(src)]).then(([m]) => ({ ...m, marcas: m.marcas || [...Array(m.n).keys()] })));
  // las hojas pesan: se cargan recién al llegar al pliego, la primera escena antes que las demás
  const precargar = esc => esc.hitos.forEach((h, i) => setTimeout(() => {
    if (h.fondo) new Image().src = ruta(esc, h.fondo); new Image().src = ruta(esc, h.suelo);
    h.pasos.forEach(p => { if (p.actor) { hojaDe(ruta(esc, p.actor + '.webp')); new Image().src = ruta(esc, p.actor + '.webp'); } else if (p.img) new Image().src = ruta(esc, p.img); });
  }, i * 700));
  window.MCECarteles = k => { const esc = ESCENARIOS[k]; if (!esc) return []; const out = []; const v = (t, x) => [t, x].filter(Boolean).join(' — '); esc.hitos.forEach(H => { if (H.titulo != null || H.texto != null) out.push(v(H.titulo, H.texto)); H.pasos.forEach(p => { if (p.texto) out.push(v(p.texto.titulo, p.texto.texto)); }); }); return out; };
  window.MCETextosEscenas = () => {
    const v = window.MCENarrador.vozCartel, out = [];
    Object.values(ESCENARIOS).forEach(esc => esc.hitos.forEach((H, n) => {
      if (esc.textos === 'huellas') document.querySelectorAll('.huellas > li').forEach(li => out.push(v(li.querySelector('b')?.textContent, li.querySelector('span')?.textContent)));
      if (H.central) out.push(H.central);
      if (H.titulo != null || H.texto != null) out.push(v(H.titulo, H.texto));
      H.pasos.forEach(p => { if (p.texto) { out.push(v(p.texto.titulo, p.texto.texto)); if (p.texto.texto) out.push(p.texto.texto); } });
      if (H.texto) out.push(H.texto);
    }));
    return out.filter(Boolean);
  };
  window.MCEFondoInicial = pag => {
    const h = pag.querySelector('[data-hitos]');
    if (h) { const esc = ESCENARIOS[h.dataset.hitos || 'iii']; const H = esc && esc.hitos[0]; return H && H.fondo ? { src: ruta(esc, H.fondo), clase: 'hito-pop hito-fondo', contenedor: '.hitos-escena' } : null; }
    if (pag.querySelector('[data-vida]')) return { src: AMB(GRUPO[0] + '-fondo'), clase: 'vida-pop amb amb-fondo', contenedor: '.vida-ambiente' };
    return null;
  };
  escena('[data-hitos]', el => {
    const esc = ESCENARIOS[el.dataset.hitos || 'iii']; if (!esc) return;
    precargar(esc);
    if (esc.suave) el.classList.add('suave');   // personajes que respiran, hablan con gestos leves y cambian de pose con un fundido
    const pagina = el.closest('.pagina'), zona = el.querySelector('.hitos-escena'), lis = esc.textos === 'huellas' ? [...pagina.querySelectorAll('.huellas > li')] : [];
    // el libro tiene límites: lo que pasa del canto de la página se recorta, así los personajes entran y salen justo por el borde
    if (zona) { const borde = () => { if (!el.isConnected) return;
      if (zona.offsetWidth) { const f = zona.querySelector(':scope > .hito-fondo'), z = (f && f.offsetWidth ? f : zona).getBoundingClientRect();   // el borde es el telón del escenario
        zona.querySelectorAll(':scope > .hito-actor').forEach(a => { const r = a.getBoundingClientRect(); if (!r.width) return;
          const iz = Math.max(0, (z.left - r.left) / r.width), de = Math.max(0, (r.right - z.right) / r.width);
          const v = iz || de ? 'inset(-30% ' + (de * 100).toFixed(2) + '% -10% ' + (iz * 100).toFixed(2) + '%)' : '';
          if (a.style.clipPath !== v) a.style.clipPath = v; }); }
      requestAnimationFrame(borde); }; requestAnimationFrame(borde); }
    const titulo = el.querySelector('.hito-titulo'), texto = el.querySelector('.hito-texto'), num = el.querySelector('.hito-num'), play = el.querySelector('.hito-play');
    const total = esc.hitos.length;
    let h = -1, pausa = false, vuelta = 0, fondoActual = '';
    const actores = {};
    // lo que pasa en la caja se cuenta en el cartel y el que habla da un saltito
    window.addEventListener('tienda-dice', e => {
      if (!el.isConnected || !actores.mago) return;
      const { quien, txt } = e.detail, a = quien === 'mago' ? actores.mago : (/Coen|pago|oro/.test(txt) ? actores.coen : actores.ari);
      if (titulo) titulo.textContent = quien === 'mago' ? 'Rancek:' : (a === actores.coen ? 'Coen:' : 'Ari:'); if (texto) texto.textContent = txt;
      if (a) { a.classList.remove('saluda'); void a.offsetWidth; a.classList.add('saluda'); }
    });
    const nombre = p => p.nombre || p.actor || p.img;
    const levantar = (im, d) => { if (document.getElementById('libro')?.classList.contains('recien-girado') && /fondo/.test(im.className)) { im.classList.add('ya'); (im.classList.contains('amb') ? el.querySelector('.vida-ambiente') : zona).append(im); return; } im.classList.add('pliega'); im.style.setProperty('--d', d + 's'); zona.append(im); requestAnimationFrame(() => requestAnimationFrame(() => im.classList.remove('pliega'))); };
    const plegar = n => { const a = n.nodeType ? n : actores[n]; if (!a) return; a.classList.add('pliega'); setTimeout(() => a.remove(), 900); if (!n.nodeType) delete actores[n]; };
    // sin plegarse: otro actor toma su lugar. El anterior se queda debajo unos instantes, hasta que el nuevo ya se pintó (sin parpadeo)
    // const sacar = n => { const a = actores[n]; if (!a) return; delete actores[n]; requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(() => a.remove(), esc.suave ? 380 : 140))); };
    // encadenado (sigue): el nuevo ya está pintado, así que el anterior se va en el mismo cuadro, sin verse doble ni transparente
    // const sacar = (n, directo) => { const a = actores[n]; if (!a) return; delete actores[n]; requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(() => a.remove(), directo ? 0 : esc.suave ? 380 : 140))); };
    // directo: la pieza anterior se oculta en el mismo cuadro en que se agrega la nueva (nunca se ven las dos)
    const sacar = (n, directo) => { const a = actores[n]; if (!a) return; delete actores[n]; if (directo) { requestAnimationFrame(() => requestAnimationFrame(() => { a.style.visibility = 'hidden'; setTimeout(() => a.remove(), 60); })); return; } requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(() => a.remove(), esc.suave ? 380 : 140))); };
    // un cuadro de la hoja; entre dos cuadros se funde (suaviza los saltos)
    const cuadro = (a, f) => {
      const m = a._m; if (!m) return;
      // const k = Math.max(0, Math.min(m.n - 1, Math.floor(f))), fr = m.n < 24 ? 0 : f - k, filas = Math.ceil(m.n / m.cols);   // con pocos cuadros, como dibujo animado: sin fundir uno con otro
      const k = Math.max(0, Math.min(m.n - 1, Math.floor(f))), fr = m.n < 24 || m.corte ? 0 : f - k, filas = Math.ceil(m.n / m.cols);   // corte: hojas de video (Wan), cuadro a cuadro; fundirlas las muestra dobles
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
        if (p.linea) a.classList.add('por-dibujar');
      }
      // los personajes (animados o recortes de personaje) van más grandes que el escenario, todos en la misma proporción
      const esPj = p.pj ?? (!!p.actor || /personajes\/|\/(ari-|coen-|rancek|pareja|paseo|medalla|baculo|streamers|publico|dragon-fuego|mo-\d)/.test(p.img ? ruta(esc, p.img) : ''));
      a._ancho = p.ancho ?? p.alto * (esPj ? ESCALA_PJ : 1) * w / hh;
      a.classList.add('hito-pop', 'hito-actor'); if (p.delante) a.classList.add('delante'); if (p.fila) a.classList.add('fila-' + p.fila); if (p.clase) a.classList.add(...p.clase.split(' '));
      a.style.left = ((p.desde ?? p.x) - a._ancho / 2) + '%'; a.style.width = a._ancho + '%'; a.style.aspectRatio = w + ' / ' + hh;
      if (a._m) cuadro(a, a._m.marcas[p.camina ? p.camina[0] : (p.de ?? 0)]);
      actores[n] = a; window.dispatchEvent(new CustomEvent('cuento-actor', { detail: a }));
      // if (sinPliegue) { a.classList.add('ya'); if (esc.suave && p.reemplaza) a.classList.add('funde'); zona.append(a); } else levantar(a, d);
      // if (sinPliegue) { a.classList.add('ya'); if (esc.suave && p.reemplaza && !p.sigue) a.classList.add('funde'); zona.append(a); } else levantar(a, d);   // encadenado: corte directo, sin fundido
      if (sinPliegue) { a.classList.add('ya'); zona.append(a); } else levantar(a, d);   // sin fundido: el reemplazo es directo
      return a;
    };
    const tramo = (a, de, al, ms, mia) => new Promise(fin => {
      const t0 = performance.now(); a._vive = null;
      const paso = t => { if (mia !== vuelta || !a.isConnected) { fin(false); return; } const u = Math.min(1, (t - t0) / ms); cuadro(a, de + (al - de) * u); if (u < 1) requestAnimationFrame(paso); else fin(true); };
      if (quieto) { cuadro(a, al); fin(true); } else requestAnimationFrame(paso);
    });
    // animación que sigue viva en bucle (ida y vuelta, sin salto) mientras la escena esté a la vista
    const vivir = (a, c0, c1, ms, mia) => { if (quieto || c1 <= c0) return; const t0 = performance.now(); a._vive = t0; const paso = t => { if (mia !== vuelta || !a.isConnected || a._vive !== t0) return; const u = ((t - t0) % (2 * ms)) / ms; cuadro(a, c0 + (c1 - c0) * (u < 1 ? u : 2 - u)); requestAnimationFrame(paso); }; requestAnimationFrame(paso); };
    // recorrido con saltos: puntos [t 0–1, x %, alto sobre el piso (% de la escena), giro°, espejo ±1]
    const recorrer = (a, p, mia) => new Promise(fin => {
      a._vive = null; const H = (p.yAncho ? zona.offsetWidth : zona.offsetHeight) || 1, pts = p.ruta, ms = p.ms || 1200;   // yAncho: la altura en % del ancho (igual que 'alto')
      const kf = pts.map(([t, x, y = 0, g = 0, e = 1]) => ({ offset: t, left: (x - a._ancho / 2) + '%', translate: '0 0 ' + ((y / 100) * H).toFixed(1) + 'px', rotate: 'y ' + g + 'deg', scale: e + ' 1' }));   // el piso está acostado: subir es el eje Z y el giro de un salto, alrededor de la profundidad
      const fin0 = pts[pts.length - 1];
      const cerrar = () => { a.style.left = (fin0[1] - a._ancho / 2) + '%'; a.style.translate = '0 0 ' + (((fin0[2] || 0) / 100) * H).toFixed(1) + 'px'; a.style.rotate = 'y ' + (fin0[3] || 0) + 'deg'; a.style.scale = (fin0[4] ?? 1) + ' 1'; };
      if (quieto) { cerrar(); fin(true); return; }
      const an = a.animate(kf, { duration: ms, easing: p.suave || 'linear', fill: 'forwards' });
      const t0 = performance.now(), m = a._m, c0 = m && p.de != null ? m.marcas[p.de] : null, c1 = m && p.a != null ? m.marcas[p.a] : null;
      if (c0 != null) { const paso = t => { if (mia !== vuelta || !a.isConnected) return; const u = Math.min(1, (t - t0) / ms); cuadro(a, c0 + (c1 - c0) * u); if (u < 1) requestAnimationFrame(paso); }; requestAnimationFrame(paso); }
      else if (m && p.camina) { const k0 = m.marcas[p.camina[0]], k1 = m.marcas[p.camina[1]], C = p.cicloMs || 900; const paso = t => { if (mia !== vuelta || !a.isConnected || t - t0 > ms) return; cuadro(a, Math.floor(k0 + (((t - t0) % C) / C) * (k1 - k0 + 1)) % (k1 + 1)); requestAnimationFrame(paso); }; requestAnimationFrame(paso); }   // corre o camina mientras avanza
      an.onfinish = () => { cerrar(); an.cancel(); fin(mia === vuelta); };
    });
    // efectos dibujados sobre el piso: tajo, onda, círculo mágico, picos de hielo, llamas, humo
    // los efectos de la batalla son recortes de papel dibujados: se levantan de la hoja y se vuelven a plegar
    const FX_PAPEL = { picos: 'hielo', llamas: 'llamas', circulo: 'circulo', onda: 'onda', tajo: 'tajo', humo: 'humo' };
    const efecto = (tipo, x, ancho = 10, y = 0, ms = 900) => {
      if (FX_PAPEL[tipo]) {
        const im = document.createElement('img'); im.src = 'assets/cuento/fx/' + FX_PAPEL[tipo] + '.webp'; im.alt = '';
        im.className = 'hito-pop hito-actor delante fx-papel fx-' + tipo + (tipo === 'circulo' ? ' plano' : ''); im.style.left = (x - ancho / 2) + '%'; im.style.width = ancho + '%';
        if (y) im.style.setProperty('--alza', y + '%');
        levantar(im, 0); setTimeout(() => plegar(im), Math.max(500, ms - 400)); return;
      }
      const e = document.createElement('div'); e.className = 'hito-fx fx-' + tipo; e.style.left = (x - ancho / 2) + '%'; e.style.width = ancho + '%'; e.style.setProperty('--z', ((y / 100) * (zona.offsetHeight || 1)).toFixed(1) + 'px'); e.style.setProperty('--ms', ms + 'ms');
      if (tipo === 'picos') e.innerHTML = '<i></i><i></i><i></i><i></i><i></i><i></i><i></i>';
      if (tipo === 'llamas' || tipo === 'humo') e.innerHTML = '<i></i><i></i><i></i><i></i><i></i>';
      zona.append(e); setTimeout(() => e.remove(), ms + 200);
    };
    const caminar = (a, p, mia) => new Promise(fin => {
      const m = a._m, c0 = m ? m.marcas[p.camina[0]] : 0, c1 = m ? m.marcas[p.camina[1]] : 0, t0 = performance.now(), CICLO = p.cicloMs || 1000; a._vive = null;
      a.classList.add('camina'); a.classList.toggle('camina-fija', c1 <= c0);
      const paso = t => {
        if (mia !== vuelta || !a.isConnected) { fin(false); return; }
        const u = Math.min(1, (t - t0) / p.ms);
        a.style.left = (p.desde + (p.x - p.desde) * u - a._ancho / 2).toFixed(2) + '%';
        if (c1 > c0) cuadro(a, Math.floor(c0 + (((t - t0) % CICLO) / CICLO) * (c1 - c0 + 1)) % (c1 + 1));   // caminata: cuadro entero, sin fundido (si no, se ven dos pies)
        if (u < 1) requestAnimationFrame(paso); else { a.classList.remove('camina', 'camina-fija'); fin(true); }
      };
      if (quieto) { a.style.left = (p.x - a._ancho / 2) + '%'; fin(true); } else requestAnimationFrame(paso);
    });
    // imagen que se dibuja sola: primero la línea (de arriba hacia abajo) y luego el color
    // el hada llega volando y, con su hechizo, dibuja la línea y después la pinta
    const dibujar = (a, ms, mia) => new Promise(fin => {
      const trazar = () => { a.style.setProperty('--dur', ms + 'ms'); a.classList.add('dibuja'); a.classList.remove('por-dibujar'); luego(() => { a.classList.add('colorea'); luego(() => fin(mia === vuelta), ms * .5); }, ms * .65); };
      if (!quieto && window.MCELibro?.hadaMagia && document.getElementById('libro')?.classList.contains('acostado')) { let hecho = false; const una = () => { if (!hecho) { hecho = true; trazar(); } }; MCELibro.hadaMagia(a, una); setTimeout(una, 6500); }
      else trazar();
    });
    // apura: en escenas que lo permiten, un clic sobre el escenario hace que lo que falta aparezca de inmediato
    let rapido = 1;
    if (esc.apura && zona) zona.closest('.hitos')?.addEventListener('click', e => { if (!e.target.closest('button, a, .colgante')) rapido = .04; });
    const espera = (ms, mia) => new Promise(fin => luego(() => fin(mia === vuelta), ms * rapido));
    // escena animada (video Wan): una lámina que se levanta del papel como cualquier pop-up; si no carga, corren los pasos de respaldo (sinVideo)
    const videos = {};
    const verVideo = (p, mia) => new Promise(fin => {
      const n = nombre(p), c = document.createElement('div'); c.className = 'hito-pop hito-video';
      c.innerHTML = '<video muted playsinline preload="auto"></video><img alt="">';
      const v = c.firstChild; v.poster = ruta(esc, p.video + '.jpg');
      ['webm', 'mp4'].forEach(t => { const s = document.createElement('source'); s.src = ruta(esc, p.video + '.' + t); s.type = 'video/' + t; v.append(s); });
      actores[n] = c; levantar(c, .05);
      let listo = false; const termina = ok => { if (listo) return; listo = true; clearInterval(vig); fin(ok && mia === vuelta); };
      const vig = setInterval(() => { if (mia !== vuelta) termina(false); }, 400);
      v.addEventListener('ended', () => termina(true));
      v.addEventListener('error', () => termina(false), true);
      setTimeout(() => { if (v.readyState < 2) termina(false); }, 6000);   // no cargó a tiempo: respaldo
      setTimeout(() => v.play().catch(() => termina(false)), 900);         // espera a que la lámina termine de levantarse
    });
    // el hada cambia la escena del video (ropa nueva): vuela, lanza su magia y aparece la imagen final
    const hadaEnVideo = (p, mia) => new Promise(fin => {
      const c = actores[nombre(p)], im = c && c.querySelector('img'); if (!im) { fin(true); return; }
      im.src = ruta(esc, p.hada); let hecho = false;
      const una = () => { if (hecho) return; hecho = true; im.classList.add('ver'); efecto('destello', p.fxX ?? 50, 22, 12, 1400); luego(() => fin(mia === vuelta), 900); };
      if (!quieto && window.MCELibro?.hadaMagia) { MCELibro.hadaMagia(c, una); setTimeout(una, 6500); } else una();
    });
    const suelo = src => { const capas = zona.querySelectorAll('.hitos-suelo i'), nueva = [...capas].find(c => !c.classList.contains('ver')) || capas[0]; nueva.style.backgroundImage = 'url("' + ruta(esc, src) + '")'; capas.forEach(c => c.classList.toggle('ver', c === nueva)); };
    const cartel = (n, H) => {
      const li = lis[n], t = H.titulo ?? (li ? li.querySelector('b').textContent : ''), x = H.texto ?? (li ? li.querySelector('span').textContent : '');
      if (titulo) titulo.textContent = t; if (texto) texto.textContent = x;
      const caja = el.querySelector('.hitos-cartel'); if (caja) caja.classList.toggle('vacio', !t && !x);
      if (num) num.textContent = (n + 1) + ' / ' + total;
      return [t, x];
    };
    // texto central propio de una escena (cambia el que se escribió sobre el libro)
    const cambiarCentral = txt => { const c = document.querySelector('.teatro-cielo .cielo-bloque .cuento') || el.closest('.pagina')?.querySelector('.cuento'); if (!c) return; c.querySelectorAll('.ch').forEach(x => x.remove()); c.textContent = txt; c.classList.remove('escribe'); void c.offsetWidth; c.classList.add('aparece'); };
    const mostrar = async n => {
      h = n; rapido = 1; const mia = ++vuelta, H = esc.hitos[Math.min(n, total - 1)];
      el.classList.remove('llego'); document.getElementById('libro')?.classList.remove('invita');
      const [ct, cx] = cartel(n, H);
      const enVista = () => (window.MCELibro?.visibles?.() || []).some(p => p.contains(el));   // solo narra la escena del pliego que se está mirando
      const conVoz = !!window.MCENarrador?.activo && enVista();
      const cajaCartel = el.querySelector('.hitos-cartel');
      if (conVoz && cajaCartel) cajaCartel.classList.add('vacio');   // con narrador, el cartel aparece cuando la voz llega a él
      if (H.central) cambiarCentral(H.central);
      Object.keys(actores).forEach(plegar);
      if (H.fondo && H.fondo !== fondoActual) {
        zona.querySelectorAll('.hito-fondo').forEach(plegar); fondoActual = H.fondo;
        const f = document.createElement('img'); f.src = ruta(esc, H.fondo); f.alt = ''; f.className = 'hito-pop hito-fondo'; levantar(f, .05);
      }
      if (H.suelo) suelo(H.suelo);
      if (!(await espera(900, mia))) return;
      // con narrador: primero termina lo que está leyendo (el capítulo o la escena anterior); luego la escena y su cartel
      let voz = null;
      if (conVoz) {
        await MCENarrador.esperar(); if (mia !== vuelta || !enVista()) return;
        if (H.central && n > 0) MCENarrador.encolar(H.central);   // la primera escena ya se leyó con el capítulo
        const dichoCartel = MCENarrador.sinRepetir(ct, cx);
        if (dichoCartel) voz = MCENarrador.encolar(dichoCartel, () => cajaCartel && cajaCartel.classList.remove('vacio'));
        else if (cajaCartel) cajaCartel.classList.toggle('vacio', !ct && !cx);
        else if (cajaCartel) cajaCartel.classList.toggle('vacio', true);
      }
      for (let p of H.pasos) {
        if (p.look) p = { ...p, img: window.MCELook() };   // el look que eligió quien lee en la vitrina
        if (p.si && !window.MCELookEs(p.si)) continue;     // pasos que solo van con cierto look
        // cambia el fondo a mitad de la escena: el anterior se pliega y el nuevo se levanta
        if (p.fondo && p.fondo !== fondoActual) { zona.querySelectorAll('.hito-fondo').forEach(plegar); fondoActual = p.fondo; const f = document.createElement('img'); f.src = ruta(esc, p.fondo); f.alt = ''; f.className = 'hito-pop hito-fondo'; levantar(f, .3); }
        if (p.sinVideo && videos[p.sinVideo] !== false) continue;   // respaldo pop-up: solo si el video no cargó
        if (p.conVideo && !videos[p.conVideo]) continue;
        if (p.sinFondo) { zona.querySelectorAll('.hito-fondo').forEach(plegar); fondoActual = null; }
        if (p.suelo) suelo(p.suelo);
        if (p.quita) { [].concat(p.quita).forEach(plegar); if (!(await espera(500, mia))) return; }
        if (p.texto) { if (titulo && p.texto.titulo != null) titulo.textContent = p.texto.titulo; if (texto) texto.textContent = p.texto.texto ?? ''; if (conVoz && enVista()) { const d = MCENarrador.sinRepetir(p.texto.titulo, p.texto.texto); voz = d ? MCENarrador.encolar(d) : null; } }
        if (p.app) window.dispatchEvent(new CustomEvent('cuento-app', { detail: { abrir: p.app } }));
        if (p.video) { const n = nombre(p); videos[n] = await verVideo(p, mia); if (mia !== vuelta) return; if (!videos[n]) plegar(n); continue; }
        if (p.hadaSobre) { const t = actores[p.hadaSobre]; if (t && !quieto && window.MCELibro?.hadaMagia) await new Promise(fin => { let hecho = false; const una = () => { if (!hecho) { hecho = true; fin(); } }; MCELibro.hadaMagia(t, una); setTimeout(una, 6500); }); if (mia !== vuelta) return; continue; }
        if (p.hada) { if (!videos[nombre(p)] || !(await hadaEnVideo(p, mia)) || !(await espera(p.ms || 1200, mia))) { if (mia !== vuelta) return; } continue; }
        // espera a que pase algo afuera del cuento (por ejemplo, que se entregue la boleta en la caja); mientras, la caja no se puede subir
        if (p.espera) { document.body.classList.add('app-obligada'); const ok = await new Promise(fin => { const f = () => { clearInterval(vig); removeEventListener(p.espera, f); removeEventListener('cuento-salta-espera', f); fin(mia === vuelta); }; const vig = setInterval(() => { if (mia !== vuelta) { clearInterval(vig); removeEventListener(p.espera, f); removeEventListener('cuento-salta-espera', f); fin(false); } }, 500); addEventListener(p.espera, f); addEventListener('cuento-salta-espera', f); }); document.body.classList.remove('app-obligada'); if (!ok) return; }
        if (p.cierraApp) window.dispatchEvent(new CustomEvent('cuento-app', { detail: { abrir: false } }));
        if (p.fx) [].concat(p.fx).forEach(f => luego(() => { if (mia !== vuelta) return; efecto(f.tipo, f.x, f.ancho, f.y, f.ms); [].concat(f.golpe || []).forEach(n => { const g = actores[n]; if (g) { g.classList.remove('golpeado'); void g.offsetWidth; g.classList.add('golpeado'); } }); }, f.tras || 0));
        if (p.golpe) [].concat(p.golpe).forEach(n => { const g = actores[n]; if (g) { g.classList.remove('golpeado'); void g.offsetWidth; g.classList.add('golpeado'); } });
        if (p.sale) [].concat(p.sale).forEach(n => { const g = actores[n]; if (!g) return; delete actores[n]; g.classList.add('se-va'); setTimeout(() => g.remove(), 1300); });
        if (p.muere) [].concat(p.muere).forEach((n, i) => { const g = actores[n]; if (!g) return; delete actores[n]; luego(() => { const x = parseFloat(g.style.left) + g._ancho / 2; g.classList.add('muere'); efecto('humo', x, g._ancho * 1.4, 0, 1000); setTimeout(() => g.remove(), 700); }, i * 120); });
        if (p.evento) { const ev = p.evento; luego(() => { if (mia === vuelta) window.dispatchEvent(new CustomEvent(ev, { detail: { zona, paso: p } })); }, p.ms || 400); }
        if (!nombre(p)) { if (!(await espera(p.ms || 600, mia))) return; if (voz && p.texto) { await voz; if (mia !== vuelta) return; } continue; }
        const nuevo = !actores[nombre(p)];
        // const a = await actor(p, p.d ?? .1, !!p.reemplaza || !!p.entra);
        const a = await actor(p, p.d ?? .1, !!p.reemplaza || !!p.entra || !!p.directo);   // directo: aparece en su lugar sin levantarse del papel   // entra: llega corriendo o volando desde fuera, sin levantarse del papel
        // if (p.reemplaza) [].concat(p.reemplaza).forEach(sacar);
        // if (p.reemplaza) [].concat(p.reemplaza).forEach(n => sacar(n, p.sigue));
        if (p.reemplaza) [].concat(p.reemplaza).forEach(n => sacar(n, p.sigue || esc.suave));   // en escenas suaves, siempre corte directo
        // if (!(nuevo ? p.entra || (p.reemplaza && p.sigue) : p.sigue) && !(await espera(nuevo && !p.reemplaza ? 1100 : 300, mia))) return;
        if (!(nuevo ? p.entra || p.directo || p.aLaVez || (p.reemplaza && p.sigue) : p.sigue) && !(await espera(nuevo && !p.reemplaza ? 1100 : 300, mia))) return;   // sigue: encadenado al paso anterior, sin respiro
        if (p.efecto) a.classList.add(p.efecto);
        if (p.quitaClase) a.classList.remove(...p.quitaClase.split(' '));
        if (!nuevo && p.clase) { const cs = p.clase.split(' '); a.classList.remove(...cs); void a.offsetWidth; a.classList.add(...cs); }   // vuelve a hacer su gesto
        if (p.abre && !a.dataset.abre) { a.dataset.abre = p.abre; a.classList.add('clicable'); a.addEventListener('click', () => window.dispatchEvent(new CustomEvent('cuento-app', { detail: { abrir: p.abre } }))); }
        if (p.rotulo && !a.querySelector('.hito-rotulo')) { const r = document.createElement('span'); r.className = 'hito-rotulo'; r.textContent = p.rotulo; a.append(r); }
        let ok;
        if (p.junto) { if (p.ruta) recorrer(a, p, mia); else if (p.mueve != null) { a.style.transition = 'left ' + (p.ms || 1200) + 'ms cubic-bezier(.45,0,.3,1)'; a.style.left = (p.mueve - a._ancho / 2) + '%'; } else if (p.camina) caminar(a, p, mia); else if (a._m && p.a != null) tramo(a, a._m.marcas[p.de ?? 0], a._m.marcas[p.a], p.ms, mia); if (!p.sigue) await espera(120, mia); continue; }   // junto: corre a la par del paso siguiente
        if (p.mueve != null) ok = await new Promise(fin => { a.style.transition = 'left ' + (p.ms || 1200) + 'ms cubic-bezier(.45,0,.3,1)'; a.style.left = (p.mueve - a._ancho / 2) + '%'; luego(() => { a.style.transition = ''; fin(mia === vuelta); }, p.ms || 1200); });
        else if (p.ruta) ok = await recorrer(a, p, mia);
        else if (p.camina) ok = await caminar(a, p, mia);
        else if (p.linea) ok = await dibujar(a, p.ms || 3000, mia);
        else if (a._m && p.a != null) ok = await tramo(a, a._m.marcas[p.de ?? 0], a._m.marcas[p.a], p.ms, mia);
        else ok = await espera(p.ms || 600, mia);
        if (!ok) return;
        if (p.bucle && a._m) vivir(a, a._m.marcas[p.bucle[0]], a._m.marcas[p.bucle[1]], p.cicloMs || 2600, mia);
        if (voz && p.texto) { await voz; if (mia !== vuelta) return; }   // el siguiente paso espera a que la voz termine este cartel
        if (!(await espera(!voz && p.lee ? p.lee : p.pausa ?? 1300, mia))) return;   // lee: sin narrador, el tiempo para leer el cartel
      }
      if (voz) { await voz; if (mia !== vuelta) return; }   // la escena no cambia mientras el narrador sigue hablando
      if (!(await espera(conVoz ? 900 : 1800, mia))) return;
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
  // IX · el pergamino escribe lo que descubrió el tablero de la gema que se enciende (lo mismo que dice el cartel)
  // la vitrina de looks de la tienda: quien lee elige qué se prueba Ari (y con qué sale a pasear)
  const LOOKS = ['magical', 'lila', 'corset', 'boda'];
  // respaldo: looks originales (cuerpo distinto al de la Ari casual)
  // window.MCELook = () => { let k = null; try { k = sessionStorage.getItem('mce-look'); } catch (e) { /* sin almacenamiento */ } return 'assets/cuento/tienda/ari-look-' + (LOOKS.includes(k) ? k : 'magical') + '.webp'; };
  // window.MCELookEs = c => { const k = window.MCELook().replace(/.*ari-look-|\.webp$/g, ''); return c[0] === '!' ? k !== c.slice(1) : k === c; };
  // looks -2: mismo diseño, con el cuerpo de la Ari casual, para que el cambio del hada no salte
  window.MCELook = () => { let k = null; try { k = sessionStorage.getItem('mce-look'); } catch (e) { /* sin almacenamiento */ } return 'assets/cuento/tienda/ari-look-' + (LOOKS.includes(k) ? k : 'magical') + '-2m.webp'; };
  window.MCELookEs = c => { const k = window.MCELook().replace(/.*ari-look-|-2m?\.webp$|\.webp$/g, ''); return c[0] === '!' ? k !== c.slice(1) : k === c; };
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-look]'); if (!b) return;
    try { sessionStorage.setItem('mce-look', b.dataset.look); } catch (er) { /* sin almacenamiento */ }
    document.querySelectorAll('[data-look]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.look === b.dataset.look)));
    window.dispatchEvent(new CustomEvent('look-elegido', { detail: b.dataset.look }));
  });
  window.addEventListener('hechizo-pergamino', e => {
    const zona = e.detail?.zona, paso = e.detail?.paso || {}, txt = { titulo: paso.pergTitulo ?? paso.texto?.titulo, texto: paso.perg || paso.texto?.texto }, perg = zona?.querySelector('.pergamino-hechizo'); if (!perg) return;
    let t = perg.querySelector('.perg-texto'); if (!t) { t = document.createElement('div'); t.className = 'perg-texto'; perg.append(t); }
    const b = document.createElement('b'), x = document.createElement('span');
    b.textContent = txt.titulo || ''; x.textContent = txt.texto || '';
    t.replaceChildren(b, x); t.classList.remove('aparece'); void t.offsetWidth; t.classList.add('aparece');
  });
  window.addEventListener('cuento-actor', e => { if (e.detail.classList.contains('pergamino-datos')) requestAnimationFrame(pintarAnalisis); });
  window.addEventListener('oraculo-cartel', e => { const H = e.detail?.zona?.closest('.hitos'); if (H) H.dataset.cartel = '1'; pintarAnalisis(); });
  setTimeout(pintarAnalisis, 0);

  // ✦ Final: el báculo dibuja trazos de luz por toda la pantalla, la cámara entra al dibujo con un brillo
  // y aparece la versión clásica, donde el hada dibuja el lineart desde la hoja en blanco y luego lo pinta
  let dibujando = false;
  // ✦ niebla mágica en círculo: nace en (cx, cy), se abre con un borde ondulado de mechones de luz hasta tapar todo;
  //   ya tapado se cambia de vista (alCubrir) y luego la niebla se abre desde el mismo centro para descubrir la página
  const TONOS_NIEBLA = ['#ffffff', '#bfe9ff', '#91dcff', '#ffd9ea', '#f5a8cf'];
  const nieblaCircular = (cx, cy, alCubrir) => new Promise(fin => {
    const W = innerWidth, H = innerHeight, cv = document.createElement('canvas'), cx2 = cv.getContext('2d');
    cv.width = W; cv.height = H; cv.className = 'niebla-circular'; cv.setAttribute('aria-hidden', 'true'); document.body.append(cv);
    const capa = document.createElement('div'); capa.className = 'niebla-brillos'; document.body.append(capa);
    // la niebla completa: blanca con manchas suaves celestes y rosadas
    const nb = document.createElement('canvas'); nb.width = W; nb.height = H; const n = nb.getContext('2d');
    n.fillStyle = '#fffafd'; n.fillRect(0, 0, W, H);
    for (let q = 0; q < 18; q++) { const x = Math.random() * W, y = Math.random() * H, r = 120 + Math.random() * 260, g = n.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, q % 2 ? 'rgba(191,233,255,.5)' : 'rgba(255,217,234,.55)'); g.addColorStop(1, 'rgba(255,250,253,0)'); n.fillStyle = g; n.fillRect(x - r, y - r, r * 2, r * 2); }
    const LEJOS = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy)) + 140;
    const MECHONES = 46, fases = Array.from({ length: MECHONES }, () => Math.random() * 6.28), largos = Array.from({ length: MECHONES }, () => .75 + Math.random() * .5);
    // contorno ondulado: cada mechón de luz avanza un poco más o menos que el radio medio, como colas de cometa hacia afuera
    const contorno = (R, t) => { cx2.beginPath(); for (let k = 0; k <= 180; k++) { const ang = k / 180 * Math.PI * 2, i = Math.floor(k / 180 * MECHONES) % MECHONES; const r = R * (1 + .16 * (largos[i] - 1)) + Math.sin(ang * 9 + t * 3 + fases[i]) * R * .045; const x = cx + Math.cos(ang) * r, y = cy + Math.sin(ang) * r; k ? cx2.lineTo(x, y) : cx2.moveTo(x, y); } cx2.closePath(); };
    const estrella = (x, y) => { if (x < -10 || y < -10 || x > W + 10 || y > H + 10) return; const e = document.createElement('i'); e.className = 'hechizo-estrella'; e.textContent = ['✦', '✧', '⋆', '✶'][Math.random() * 4 | 0];
      e.style.cssText = 'left:' + x.toFixed(0) + 'px;top:' + y.toFixed(0) + 'px;--t:' + (10 + Math.random() * 16).toFixed(0) + 'px;--g:' + (Math.random() * 360 | 0) + 'deg;--c:' + TONOS_NIEBLA[1 + (Math.random() * 4 | 0)]; capa.append(e); setTimeout(() => e.remove(), 1500); };
    const brillosBorde = (R, t) => { for (let q = 0; q < 5; q++) { const ang = Math.random() * 6.28, r = R * (.82 + Math.random() * .28); estrella(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r); } if (window.Magia && Math.random() < .5) { const ang = Math.random() * 6.28; Magia.estela(cx + Math.cos(ang) * R, cy + Math.sin(ang) * R, { n: 3, colores: TONOS_NIEBLA }); } };
    const fase = (ms, dibujar) => new Promise(listo => { const t0 = performance.now(); let ult = 0; const paso = ahora => { const u = Math.min(1, (ahora - t0) / ms), e = u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; dibujar(e, ahora / 1000); if (ahora - ult > 45) { ult = ahora; brillosBorde(e * LEJOS, ahora / 1000); } if (u < 1) requestAnimationFrame(paso); else listo(); }; requestAnimationFrame(paso); });
    const tapar = (e, t) => { cx2.clearRect(0, 0, W, H); cx2.save(); contorno(Math.max(4, e * LEJOS), t); cx2.clip(); cx2.drawImage(nb, 0, 0); cx2.restore(); };
    const abrir = (e, t) => { cx2.globalCompositeOperation = 'source-over'; cx2.clearRect(0, 0, W, H); cx2.drawImage(nb, 0, 0); cx2.globalCompositeOperation = 'destination-out'; contorno(Math.max(1, e * LEJOS), t); cx2.fill(); cx2.globalCompositeOperation = 'source-over'; };
    if (window.Magia) Magia.chispas(cx, cy, { n: 50, vel: 6, colores: TONOS_NIEBLA });
    fase(quieto ? 1 : 1700, tapar).then(() => { alCubrir && alCubrir(); return new Promise(r => setTimeout(r, quieto ? 0 : 450)); })
      .then(() => fase(quieto ? 1 : 1700, abrir))
      .then(() => { cv.remove(); setTimeout(() => capa.remove(), 1500); fin(); });
  });
  window.MCENiebla = nieblaCircular;
  const dibujarMundo = origen => {
    if (dibujando) return; dibujando = true;
    const r = origen ? origen.getBoundingClientRect() : null;
    const cx = r ? r.left + r.width * .5 : innerWidth / 2, cy = r ? r.top + r.height * .51 : innerHeight / 2;   // la estrella de la varita
    nieblaCircular(cx, cy, () => {
      const esc = document.getElementById('escena'); if (esc) { esc.style.visibility = 'hidden'; setTimeout(() => { esc.style.visibility = ''; }, 2500); }
      window.MCELibro?.aClasico(null, { pintar: true });   // ya tapado, aparece la página y el hada la pinta
    }).then(() => { dibujando = false; });
  };
  // el botón «Versión clásica» del libro también pasa con la niebla mágica, desde el centro de la pantalla
  document.addEventListener('click', e => {
    const b = e.target.closest('#libro-clasico, #escena [data-modo="clasico"]'); if (!b || dibujando) return;
    e.preventDefault(); e.stopImmediatePropagation(); dibujando = true;
    nieblaCircular(innerWidth / 2, innerHeight / 2, () => window.MCELibro?.aClasico()).then(() => { dibujando = false; });
  }, true);
  window.addEventListener('cuento-dibuja-mundo', e => { const z = e.detail && e.detail.zona; dibujarMundo(z && [...z.querySelectorAll('.hito-actor')].pop()); });
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
    if (empezar && app.classList.contains('app-maquina')) { empezar.textContent = '↻ Reiniciar'; if (!app.classList.contains('app-bloques')) (document.getElementById('match-reset') && app.classList.contains('app-gemas') ? document.getElementById('match-reset') : app.classList.contains('app-estrellas') ? document.getElementById('star-reset') : null)?.click(); }
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
    const pag = t.closest('.colgar-app') || t.closest('.pagina');   // colgada en el teatro ya no está dentro de su página
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
  const SALUDOS = { 'Achachila': '¡Hola! Soy el Achachila, cuido los cerros.', 'Alicanto': '¡Hola! Soy el Alicanto, ¡mis alas brillan!', 'Supai': 'Hola… soy Supai, del mundo de abajo.', 'Láscar': '¡Soy Láscar, el volcán!', 'La Tirana': '¡Hola! ¡A bailar en La Tirana!', 'Reina de la Noche': 'Buenas noches… soy la Reina de la Noche.', 'Lica': '¡Hola, hola! Soy Lica.', 'Pachamama': 'Hola, soy la Pachamama, la Madre Tierra.', 'Make-Make': '¡Hola! Soy Make-Make, de Rapa Nui.', 'Benja': '¡Hola! ¡Soy Benja!', 'Mochilero': '¡Hola! ¿Vamos de viaje?', 'Chibi': '¡Hola, hola!', 'Emilia': '¡Hola! ¡Soy Emilia!', 'Regalo': '¡Hola! Soy un regalo hecho con cariño.' };
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
      cielo.dataset.t0 = Date.now();
      escribirEstrellas();
      // en pantallas bajas (celular horizontal) el texto del capítulo se abre con un toque, para no tapar el pop-up
      if (cielo.querySelector('.cielo-bloque .cuento')) { const b = document.createElement('button'); b.type = 'button'; b.className = 'cielo-leer'; b.textContent = '📖 Leer'; b.setAttribute('aria-expanded', 'false'); b.addEventListener('click', () => { let hoja = document.querySelector('.hoja-leer'); if (hoja) { hoja.remove(); b.textContent = '📖 Leer'; b.setAttribute('aria-expanded', 'false'); return; } hoja = document.createElement('div'); hoja.className = 'hoja-leer'; hoja.setAttribute('role', 'dialog'); cielo.querySelectorAll('.cielo-bloque').forEach(bl => { const c = bl.cloneNode(true); c.querySelectorAll('.ch').forEach(ch => ch.replaceWith(ch.textContent)); c.querySelectorAll('.escribe').forEach(e => e.classList.remove('escribe')); hoja.append(c); }); const x = document.createElement('button'); x.type = 'button'; x.className = 'hoja-leer-cerrar'; x.textContent = '✕ Cerrar'; x.onclick = () => b.click(); hoja.append(x); hoja.addEventListener('click', e => { if (e.target === hoja) b.click(); }); document.body.append(hoja); b.textContent = '✕ Cerrar'; b.setAttribute('aria-expanded', 'true'); }); cielo.append(b); }
      document.querySelector('.hoja-leer')?.remove();
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
          const rotular = () => { const arriba = c.classList.contains('arriba'); tab.textContent = arriba ? '▼ ' + verbo + ' ' + nom : '✕ Volver al cuento'; tab.setAttribute('aria-expanded', String(!arriba)); };
          // si el cuento espera que se use la aplicación (por ejemplo, pagar en la caja), subirla deja seguir igual
          tab.addEventListener('click', () => { if (!c.classList.contains('arriba') && document.body.classList.contains('app-obligada')) window.dispatchEvent(new Event('cuento-salta-espera')); });
          tab.addEventListener('click', () => { const abrir = c.classList.contains('arriba'); teatro.querySelectorAll('.colgante-app').forEach(o => { o.classList.add('mueve'); clearTimeout(o._mv); o._mv = setTimeout(() => o.classList.remove('mueve'), 1000); o.classList.toggle('arriba', !(abrir && o === c)); o._rotular && o._rotular(); }); if (abrir) c.querySelectorAll('iframe[data-src]').forEach(f => { f.src = f.dataset.src; f.removeAttribute('data-src'); }); });
          c._rotular = rotular; rotular(); c.append(tab);
          // el cuadro entero (con su marco) se achica lo justo para caber entre el borde de arriba y la barra del libro
          /* antes: el cuadro entero se achicaba (hasta 0,42) y su contenido tenía alto fijo con barra: en pantallas de notebook quedaba cortado
          const ajustarApp = () => {
            el.style.zoom = ''; c.style.scale = '';
            const nav = document.getElementById('libro-nav'), techo = (c.parentElement ? c.parentElement.getBoundingClientRect().top : 0) + (parseFloat(getComputedStyle(c).marginTop) || 0);
            const piso = nav && nav.offsetParent ? nav.getBoundingClientRect().top - 10 : innerHeight - 10;
            const f = Math.min(1, (piso - techo) / Math.max(1, c.offsetHeight), (innerWidth - 24) / Math.max(1, c.offsetWidth));
            if (f < .995) c.style.scale = Math.max(.42, f).toFixed(3);
          }; */
          // el cuadro abierto ocupa la pantalla hasta la barra del libro; su contenido se ensancha y solo si no cabe se achica un poco
          // (nunca bajo 0,75: la letra se tiene que leer; si aun así no cabe, se recorre con la rueda dentro del marco)
          let midiendo = false;
          const ajustarApp = () => {
            if (midiendo || el.classList.contains('app-maquina')) return; midiendo = true;
            const nav = document.getElementById('libro-nav'), piso = nav && nav.offsetParent ? nav.getBoundingClientRect().top - 10 : innerHeight - 10;
            c.style.setProperty('--alto-app', Math.max(320, Math.round(piso - 8)) + 'px');
            const cs = getComputedStyle(c), iw = c.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight), ih = c.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
            if (iw > 50 && ih > 50) {
              el.style.transform = ''; el.style.height = ''; let s = 1;
              // los dibujos (la sala, el libro) no se ensanchan: se achican enteros; lo demás se ensancha para aprovechar el espacio
              const dibujo = !!el.querySelector('.sala, .calc-zona');
              if (dibujo) {   // los dibujos (la sala, la calculadora) guardan su forma: se achican enteros con zoom hasta caber en el alto
                el.style.width = iw + 'px'; el.style.height = ih + 'px'; el.style.overflow = 'hidden';
                const r = el.querySelectorAll(':scope > .ranura, :scope > .app-doble'); r.forEach(x => { x.style.zoom = ''; });
                for (let k = 0; k < 3; k++) { const f = ih / Math.max(1, el.scrollHeight); if (f > .995) break; r.forEach(x => { x.style.zoom = ((parseFloat(x.style.zoom) || 1) * f).toFixed(4); }); }
                requestAnimationFrame(() => { midiendo = false; }); return;
              }
              for (let k = 0; k < 4; k++) { el.style.width = (iw / s) + 'px'; const ns = Math.max(.75, Math.min(1, ih / Math.max(1, el.scrollHeight))); if (Math.abs(ns - s) < .01) { s = ns; break; } s = ns; }
              el.style.width = (iw / s).toFixed(1) + 'px'; el.style.height = (ih / s).toFixed(1) + 'px';
              el.style.transform = s < .995 ? 'scale(' + s.toFixed(4) + ')' : '';
            }
            requestAnimationFrame(() => { midiendo = false; });
          };
          c._ajustar = ajustarApp; new ResizeObserver(() => requestAnimationFrame(ajustarApp)).observe(c); addEventListener('resize', () => requestAnimationFrame(ajustarApp));
          // al abrirse se vuelve a medir (lo que traía adentro pudo cambiar mientras estaba arriba)
          new MutationObserver(() => { if (!c.classList.contains('arriba')) requestAnimationFrame(ajustarApp); }).observe(c, { attributes: true, attributeFilter: ['class'] });
          let centro = teatro.querySelector('.teatro-app');
          if (!centro) { centro = document.createElement('div'); centro.className = 'teatro-app'; teatro.append(centro); }
          centro.append(c);
        } else zonas[zonas.length - 1].append(c);
        colgados.push({ el, marca });
      }));
      // los carteles de cada lado siempre caben en la pantalla (si son muchos, se achican lo justo)
      // los carteles caben entre su borde de arriba y la barra del libro (si no, se achican lo justo; antes el último quedaba cortado abajo)
      const caber = () => zonas.forEach(z => { z.style.zoom = ''; const r = z.getBoundingClientRect(), nav = document.getElementById('libro-nav'), piso = nav && nav.offsetParent ? nav.getBoundingClientRect().top - 12 : innerHeight * .9, disp = piso - r.top; if (z.scrollHeight > disp && disp > 120) z.style.zoom = Math.max(.45, disp / z.scrollHeight).toFixed(3); });
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
    // la tienda en vivo se carga recién cuando su cuadro baja (no pesa mientras tanto)
    window.addEventListener('cuento-app', () => setTimeout(() => document.querySelectorAll('.teatro-app .colgante-app:not(.arriba) .vitrina-viva iframe[data-src]').forEach(f => { f.src = f.dataset.src; f.removeAttribute('data-src'); }), 50));
    window.addEventListener('cuento-app', e => { const id = e.detail.abrir; teatro.querySelectorAll('.colgante-app').forEach(c => { c.classList.add('mueve'); clearTimeout(c._mv); c._mv = setTimeout(() => c.classList.remove('mueve'), 1000); const mia = id === true || (typeof id === 'string' && c.dataset.app === id); c.classList.toggle('arriba', !(id && mia)); c._rotular && c._rotular(); }); });
    window.addEventListener('cuento-pasa', () => document.body.classList.remove('app-obligada'));
    // la boleta impresa en la caja del cuento se muestra ancha y completa en la columna del recibo (la ranura de la caja es muy angosta);
    // con «Vaciar carrito / nueva compra» vuelve la vista previa
    const salida = document.getElementById('printer-output');
    if (salida) new MutationObserver(() => {
      const app = salida.closest('.teatro-app .app-caja'); if (!app) return;
      const col = app.querySelector('.app-doble > div:nth-child(2)'); if (!col) return;
      col.querySelector('.boleta-cuento')?.remove(); col.classList.remove('con-boleta');
      const papel = document.getElementById('printed-receipt'); if (salida.hidden || !papel || !papel.childElementCount) return;
      const hoja = papel.cloneNode(true); hoja.removeAttribute('id'); hoja.className = 'boleta-cuento';
      const pagaste = [...hoja.querySelectorAll('.paper-total')].find(l => /Pagaste/.test(l.textContent));
      if (pagaste) { const m = document.createElement('div'); m.className = 'paper-total'; m.innerHTML = '<span>Medio de pago</span><b>Efectivo</b>'; pagaste.after(m); }
      col.append(hoja); col.classList.add('con-boleta');
    }).observe(salida, { attributes: true, attributeFilter: ['hidden'] });
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
    // al tocar el dragón, vuela de vuelta al inicio de la página
    dr.addEventListener('click', () => { scrollTo({ top: 0, behavior: 'smooth' }); globo.textContent = '¡Arriba!'; dr.classList.remove('feliz'); void dr.offsetWidth; dr.classList.add('feliz'); });
    let x = innerWidth - 150, y = innerHeight * .45, objY = null, mira = -1, ultimoMov = performance.now(), dormido = false, posado = false;
    const nido = $('.nido-escena'), posada = $('#nido-posada');
    addEventListener('pointermove', e => {
      // vuela en el borde derecho, a la altura del puntero, sin tapar lo que se lee
      objY = e.clientY - 52;
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
        // al final de la página (o en la última escena) aterriza en el nido; si no, borde derecho a la altura del mouse
        const rc = document.documentElement.classList;
        // con scroll continuo (computador o celular) el final es llegar al fondo de la página; con escenas, la última escena
        const final = rc.contains('escenas') && !rc.contains('escenas-flujo') && !rc.contains('escenas-pila') ? rc.contains('escena-final') : scrollY + innerHeight >= document.documentElement.scrollHeight - 40;
        const r = final && posada ? posada.getBoundingClientRect() : null;
        let tx, ty;
        if (r && r.width) { tx = r.left + (r.width - 110) / 2; ty = r.bottom - 104; }
        else { tx = innerWidth - 110 - (innerWidth < 700 ? 10 : 34); ty = Math.min(innerHeight - 112, Math.max(76, objY ?? innerHeight * .45)); }
        x += (tx - x) * (r ? .06 : .08); y += (ty - y) * (r ? .06 : .08);
        const vx = tx - x; if (Math.abs(vx) > 6) mira = vx > 0 ? 1 : -1; else if (!r) mira = -1;
        const llego = !!(r && r.width) && Math.abs(tx - x) < 2 && Math.abs(ty - y) < 2;
        if (llego !== posado) { posado = llego; dr.classList.toggle('posado', llego); nido && nido.classList.toggle('llego', llego); if (llego) { mira = -1; if (window.Magia) Magia.chispas(x + 55, y + 70, { n: 18, vel: 2.5, colores: ['#ff8fc0', '#ffd9ea', '#fff'] }); } }
        const flot = posado ? 0 : Math.sin(ahora / 420) * 8;
        dr.style.transform = `translate(${x.toFixed(1)}px,${(y + flot).toFixed(1)}px)`;
        dr.style.setProperty('--mira', mira);
        if (!dormido && !posado && ahora - ultimoMov > 12000) { dormido = true; dr.classList.add('duerme'); globo.textContent = 'z z z'; }
      } else dr.style.transform = `translate(${innerWidth - 120}px,90px)`;
      requestAnimationFrame(vuelo);
    })(performance.now());
  }
})();
