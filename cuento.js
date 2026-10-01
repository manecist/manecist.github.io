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
  const ESCENAS = [];
  const escena = (sel, fn) => ESCENAS.push([sel, fn]);

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
    let k = 0; const img = el.querySelector('.probador-img');
    el.querySelector('[data-probador-btn]').addEventListener('click', () => {
      k = (k + 1) % OUTFITS.length;
      img.classList.remove('activa'); el.classList.remove('gira'); void el.offsetWidth; el.classList.add('gira');
      setTimeout(() => { img.src = 'assets/cuento/etapas/' + OUTFITS[k][0] + '.webp'; img.alt = 'Ari hoy: ' + OUTFITS[k][1]; img.classList.add('activa'); }, quieto ? 0 : 260);
      if (window.Magia) { const r = el.getBoundingClientRect(); Magia.chispas(r.left + r.width / 2, r.top + r.height / 2, { n: 30, colores: ['#c9a6ff', '#ff8fc0', '#fff', '#f3d48a'] }); }
    });
  });
  escena('[data-probador]', el => { el.classList.remove('gira'); void el.offsetWidth; el.classList.add('gira'); });

  // II · la vida caminando: la monita avanza por el pliego y se transforma
  const VIDA = [
    ['etapa-01', '4–6 años', 'Una niña princesa de rulos color miel y lentes gigantes de poto de botella.'],
    ['etapa-02', '8–10 años', 'Dibujaba en cada cuaderno que encontraba.'],
    ['etapa-03', '12–14 años', 'Descubrió los videojuegos… siempre en el PC.'],
    ['etapa-04', '15–18 años', 'Gamer de PC, pelo largo y liso, audífonos de gatito.'],
    ['etapa-05', '20–22 años', 'Matrona: balayage y uniforme rojo de puntitos.'],
    ['etapa-06', '23–25 años', 'Platinada, enseñando clínica a sus alumnas.'],
    ['etapa-07', '26–28 años', 'Puntas fucsia y uniforme de estrellas.'],
    ['etapa-08', '28 años', 'Vuelve el café… y empieza otro sueño.'],
    ['etapa-09', '29 años', 'Programadora de noches largas en Java.'],
    ['etapa-10', '30 años', 'Streamer en ArianesDCoen junto a Coen.'],
    ['etapa-11', '31 años', 'Creadora de mundos: vuelven sus ondas naturales.'],
    ['etapa-12', 'Hoy', 'Ilustradora con su tableta rosada.'],
    ['etapa-13', 'Hoy', 'Feliz, con su estilo de siempre.'],
    ['etapa-14', 'Hoy', 'Lila por sobre todo.'],
    ['etapa-15', 'Hoy · 32 años', 'Ari: fundadora de Studios Conari. ¡Y la historia sigue!']
  ];
  VIDA.forEach(([s]) => { const i = new Image(); i.src = 'assets/cuento/etapas/' + s + '.webp'; });
  escena('[data-vida]', el => {
    const a = el.querySelector('.vida-img'), b = el.querySelector('.vida-img-b'), rango = el.querySelector('.vida-rango');
    const edad = el.querySelector('.vida-edad'), txt = el.querySelector('.vida-texto'), play = el.querySelector('.vida-play'), andante = el.querySelector('.vida-andante');
    const pagina = el.closest('.pagina'); pagina.setAttribute('data-narracion-propia', '');
    let k = -1, pausa = false, frente = a;
    const mostrar = async (n, hablar) => {
      if (n === k) return; k = n; rango.value = n;
      const otra = frente === a ? b : a; otra.src = 'assets/cuento/etapas/' + VIDA[n][0] + '.webp'; otra.alt = 'Ari, ' + VIDA[n][1] + ': ' + VIDA[n][2];
      otra.classList.add('visible'); frente.classList.remove('visible'); frente = otra;
      andante.style.setProperty('--x', (4 + n / (VIDA.length - 1) * 78).toFixed(1) + '%');
      el.style.setProperty('--hora', n / (VIDA.length - 1));
      edad.textContent = VIDA[n][1]; txt.textContent = VIDA[n][2];
      el.classList.remove('cambia'); void el.offsetWidth; el.classList.add('cambia');
      if (window.Magia) { const r = andante.getBoundingClientRect(); if (r.width) Magia.chispas(r.left + r.width / 2, r.top + r.height * .45, { n: 22, vel: 3, colores: ['#ff8fc0', '#ffd9ea', '#c9a6ff', '#f3d48a', '#fff'] }); }
      if (hablar && window.MCENarrador.activo) await decir(VIDA[n][1] + '. ' + VIDA[n][2]);
    };
    const avanzar = async () => {
      if (pausa || !document.body.contains(el)) return;
      const n = k + 1;
      if (n >= VIDA.length) { el.classList.add('llego'); play.textContent = '↻'; play.setAttribute('aria-label', 'Volver a caminar'); pausa = true; return; }
      await mostrar(n, true);
      luego(avanzar, window.MCENarrador.activo ? 900 : 2300);
    };
    el.classList.remove('llego'); play.textContent = '❚❚'; k = -1;
    mostrar(0, false).then(() => { if (window.MCENarrador.activo) { callar(); decir(el.closest('.pagina').querySelector('.vida-cabeza').innerText).then(() => luego(avanzar, 400)); } else luego(avanzar, 2600); });
    play.onclick = () => {
      if (el.classList.contains('llego')) { el.classList.remove('llego'); pausa = false; play.textContent = '❚❚'; k = -1; mostrar(0, false); luego(avanzar, 1800); return; }
      pausa = !pausa; play.textContent = pausa ? '▶' : '❚❚'; play.setAttribute('aria-label', pausa ? 'Seguir caminando' : 'Pausar la caminata');
      if (!pausa) luego(avanzar, 300);
    };
    rango.oninput = () => { pausa = true; play.textContent = '▶'; el.classList.remove('llego'); mostrar(Number(rango.value), false); };
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

  /* Dragoncito: vuela cerca del puntero, mira hacia donde vas y celebra lo que haces */
  const dr = $('#dragoncito');
  if (dr) {
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
