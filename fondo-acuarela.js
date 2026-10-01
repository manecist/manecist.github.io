/* ==========================================================================
   Fondo en parallax: del lineart a la acuarela
   La escena empieza dibujada en blanco y negro. El hada, pequeña, vuela por
   las capas y las pinta con manchas de acuarela, de la más cercana a la más
   lejana; el fondo lo pinta con un hechizo desde la luna. Al terminar queda
   como fondo en parallax.
   render(t, px, py) es determinista: el mismo t produce el mismo cuadro.
   En la página: FondoAcuarela.montar(canvas) devuelve un controlador con
   reproducir() (promesa que se cumple al terminar o saltar), saltar() y
   mover(px, py) para el parallax del puntero y del desplazamiento y tema('dia'|'noche')
   para cambiar de escena con un fundido (las imágenes de cada modo se cargan al usarse).
   ========================================================================== */
window.FondoAcuarela = (() => {
  const W = 1660, H = 948;                         // marco común de todas las capas
  const DURACION = 13;                             // segundos de la animación de pintado

  // generador pseudoaleatorio con semilla: el resultado es siempre el mismo
  const azar = semilla => () => { semilla |= 0; semilla = semilla + 0x6D2B79F5 | 0; let t = Math.imul(semilla ^ semilla >>> 15, 1 | semilla); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const suave = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
  const lienzo = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

  // capas de la más lejana a la más cercana. orden: cuándo las pinta el hada (0 = primero)
  const CAPAS = [
    { id: '01-fondo', prof: .12, orden: 3 },
    { id: '02-dragon', prof: .3, orden: 2, flota: [1.3, 7] },
    // el mago no trae el marco panorámico: se ubica sobre el valle, bajo el dragón
    { id: '06-mago-baculo', prof: .6, orden: 1, flota: [1.7, 9], region: [180, 420, 560, 373] },
    { id: '07-primer-plano-integrado', prof: 1, orden: 0 }
  ];

  // recorrido del hada sobre cada capa (coordenadas del marco de 1660 × 948)
  const TRAMOS = [
    { capa: 3, ini: 1.1, fin: 4.2, radio: 170, ruta: [[880, 880], [1050, 760], [1250, 880], [1450, 760], [1600, 860], [1560, 570], [1330, 610], [1170, 470], [1320, 330], [1220, 250], [1560, 330], [1600, 150], [1380, 60], [1120, 100], [900, 50]] },
    { capa: 2, ini: 4.75, fin: 6.9, radio: 140, ruta: [[230, 560], [330, 500], [440, 470], [400, 600], [520, 560], [610, 610], [710, 560], [580, 700], [430, 740], [300, 650]] },
    { capa: 1, ini: 7.35, fin: 8.9, radio: 150, ruta: [[640, 290], [520, 240], [400, 180], [270, 140], [170, 120], [300, 100], [450, 150], [330, 250], [560, 320]] }
  ];
  const LUNA = [797, 465], HECHIZO = 9.55;

  // ---------------------------------------------------------- recorridos suaves (Catmull-Rom)
  function curva(pts) {
    const seg = [], L = [0];
    for (let i = 0; i < pts.length - 1; i++) seg.push([pts[Math.max(0, i - 1)], pts[i], pts[i + 1], pts[Math.min(pts.length - 1, i + 2)]]);
    const punto = (s, u) => { const [a, b, c, d] = s, u2 = u * u, u3 = u2 * u; return [0, 1].map(k => .5 * (2 * b[k] + (-a[k] + c[k]) * u + (2 * a[k] - 5 * b[k] + 4 * c[k] - d[k]) * u2 + (-a[k] + 3 * b[k] - 3 * c[k] + d[k]) * u3)); };
    const muestras = []; seg.forEach(s => { for (let j = 0; j < 30; j++) muestras.push(punto(s, j / 30)); }); muestras.push(pts[pts.length - 1]);
    for (let i = 1; i < muestras.length; i++) L.push(L[i - 1] + Math.hypot(muestras[i][0] - muestras[i - 1][0], muestras[i][1] - muestras[i - 1][1]));
    const total = L[L.length - 1];
    return { total, en(f) { const d = Math.max(0, Math.min(1, f)) * total; let i = 1; while (i < L.length - 1 && L[i] < d) i++; const k = (d - L[i - 1]) / ((L[i] - L[i - 1]) || 1); return [muestras[i - 1][0] + (muestras[i][0] - muestras[i - 1][0]) * k, muestras[i - 1][1] + (muestras[i][1] - muestras[i - 1][1]) * k]; } };
  }
  TRAMOS.forEach(tr => { tr.c = curva(tr.ruta); });

  // posición de la punta de la varita en el tiempo t y la capa sobre la que está
  function varita(t) {
    const entrada = [W + 120, 760];
    if (t < TRAMOS[0].ini) { const f = suave((t - .5) / (TRAMOS[0].ini - .5)); const a = TRAMOS[0].c.en(0); return { p: [entrada[0] + (a[0] - entrada[0]) * f, entrada[1] + (a[1] - entrada[1]) * f], capa: 3, pose: 0 }; }
    for (let i = 0; i < TRAMOS.length; i++) {
      const tr = TRAMOS[i];
      if (t <= tr.fin) return { p: tr.c.en(suave((t - tr.ini) / (tr.fin - tr.ini)) * .15 + (t - tr.ini) / (tr.fin - tr.ini) * .85), capa: tr.capa, pose: 3 };
      const sig = TRAMOS[i + 1], meta = sig ? sig.c.en(0) : LUNA.map((v, k) => v + [-40, -70][k]), hasta = sig ? sig.ini : HECHIZO;
      if (t < hasta) { const f = suave((t - tr.fin) / (hasta - tr.fin)), a = tr.c.en(1); return { p: [a[0] + (meta[0] - a[0]) * f, a[1] + (meta[1] - a[1]) * f], capa: sig ? sig.capa : 0, mezcla: f, desde: tr.capa, pose: 1 }; }
    }
    // hechizo sobre la luna y despedida hacia arriba
    const base = LUNA.map((v, k) => v + [-40, -70][k]);
    if (t < 11.3) return { p: base, capa: 0, pose: 2 };
    const f = suave((t - 11.3) / 1.2);
    return { p: [base[0] + 700 * f, base[1] - 620 * f * f], capa: 0, pose: 1 };
  }

  // ---------------------------------------------------------- manchas de acuarela
  // cada capa guarda sus manchas: nacen cuando pasa la varita y se expanden como pigmento en papel mojado
  const manchas = CAPAS.map(() => []);
  const r = azar(7);
  TRAMOS.forEach(tr => {
    const pasos = Math.ceil(tr.c.total / (tr.radio * .42));
    for (let i = 0; i <= pasos; i++) {
      const f = i / pasos, nace = tr.ini + f * (tr.fin - tr.ini);
      const [x, y] = tr.c.en(f);
      manchas[tr.capa].push({ x: x + (r() - .5) * 60, y: y + (r() - .5) * 60, R: tr.radio * (.85 + r() * .4), nace, v: r() * 4 | 0 });
    }
  });
  manchas[0].push({ x: LUNA[0], y: LUNA[1], R: 1500, nace: HECHIZO + .15, crece: 1.9, v: 0 });
  [[880, 560], [300, 380], [1400, 480], [1250, 150], [350, 120], [600, 700], [1500, 750]].forEach(([x, y], i) =>
    manchas[0].push({ x, y, R: 420 + r() * 120, nace: HECHIZO + .5 + i * .1, crece: 1, v: i % 4 }));
  // al cerrar cada tramo, el color termina de asentarse en toda la capa
  const ASIENTA = { 3: TRAMOS[0].fin + .25, 2: TRAMOS[1].fin + .25, 1: TRAMOS[2].fin + .25, 0: HECHIZO + 1.9 };

  // sellos: cada uno es una mancha irregular hecha de círculos difusos
  const sellos = [0, 1, 2, 3].map(v => {
    const c = lienzo(256, 256), g = c.getContext('2d'), rr = azar(100 + v);
    for (let i = 0; i < 22; i++) {
      const a = rr() * 6.28, d = rr() * 62, x = 128 + Math.cos(a) * d, y = 128 + Math.sin(a) * d, rad = 40 + rr() * 52;
      const gr = g.createRadialGradient(x, y, 0, x, y, rad);
      gr.addColorStop(0, 'rgba(0,0,0,.42)'); gr.addColorStop(.7, 'rgba(0,0,0,.28)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, rad, 0, 6.3); g.fill();
    }
    return c;
  });
  const destello = (() => { const c = lienzo(64, 64), g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.25, 'rgba(255,214,236,.9)'); gr.addColorStop(1, 'rgba(255,170,215,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return c; })();

  // ---------------------------------------------------------- carga
  // un juego de imágenes por modo; img apunta al que se dibuja
  const juegos = {}; let img = null, hada = null, listos = false;
  const tmp = lienzo(W, H);
  const cargar = src => new Promise((ok, mal) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => mal(new Error(src)); i.src = src; });
  // de día solo cambian las acuarelas y el lineart del fondo (sin luna); el resto del dibujo es común
  const ruta = (tema, id, e) => `assets/fondo/${tema === 'dia' && (e === 'acuarela' || id === '01-fondo') ? 'acuarela-dia' : 'acuarela'}/${id}-${e}.webp`;
  async function preparar(tema = 'noche') {
    if (!juegos[tema]) juegos[tema] = cargarJuego(tema);
    const juego = await juegos[tema];
    if (!hada) hada = await Promise.all([0, 1, 2, 3].map(i => cargar(`assets/hada-hechizo-${i}.webp`)));
    img = juego; listos = true;
    return juego;
  }
  async function cargarJuego(tema) {
    const juego = {};
    await Promise.all(CAPAS.map(async c => {
      const [lin, acu] = await Promise.all(['lineart', 'acuarela'].map(e => cargar(ruta(tema, c.id, e))));
      // lineart en blanco y negro, ajustado al marco común; se calcula una sola vez
      const zona = c.region || [0, 0, W, H];
      const bn = lienzo(W, H), g = bn.getContext('2d'); g.filter = 'grayscale(1) contrast(1.25) brightness(1.06)'; g.drawImage(lin, ...zona);
      const co = lienzo(W, H); co.getContext('2d').drawImage(acu, ...zona);
      juego[c.id] = { bn, co, mascara: lienzo(W / 2, H / 2), capa: lienzo(W, H) };
    }));
    return juego;
  }

  // ---------------------------------------------------------- dibujo de un cuadro
  const PUNTA = [[72, 97], [113, 42], [22, 318], [30, 372]], HADA_ALTO = 118, HADA_ESC = HADA_ALTO / 480;
  // acercamiento de la cámara en el tiempo (1 = la escena completa cubre la pantalla)
  const ZOOM_CERCA = 1.5, CLAVES = [[0, 1.14], [.9, 1.14], [2, ZOOM_CERCA], [9, ZOOM_CERCA], [10.2, 1.14], [DURACION, 1.08]];
  function acercamiento(t) {
    if (t >= DURACION) return 1.08;
    for (let i = 1; i < CLAVES.length; i++) if (t <= CLAVES[i][0]) { const [t0, z0] = CLAVES[i - 1], [t1, z1] = CLAVES[i]; return z0 + (z1 - z0) * suave((t - t0) / (t1 - t0)); }
    return 1.08;
  }
  // el foco es la posición del hada suavizada: promedia su recorrido cercano para que el paneo sea fluido
  function foco_(t) {
    let x = 0, y = 0, n = 0;
    for (let d = -.7; d <= .71; d += .1) { const q = varita(Math.max(.9, Math.min(DURACION, t + d))).p; x += q[0]; y += q[1]; n++; }
    return [x / n, y / n];
  }
  const DESPLAZA = 38;                              // desplazamiento máximo del parallax, en px del marco

  function render(ctx, t, px = 0, py = 0) {
    if (!listos) return;
    const cw = ctx.canvas.width, ch = ctx.canvas.height;
    // cámara: plano general al inicio; se acerca y hace paneo siguiendo al hada mientras pinta cada capa;
    // se abre para el hechizo de la luna y termina en el encuadre del fondo (con margen para el parallax)
    const zoom = acercamiento(t), cerca = (zoom - 1.08) / (ZOOM_CERCA - 1.08);
    const k = Math.max(cw / W, ch / H) * zoom, foco = foco_(t);
    const cx = W / 2 + (foco[0] - W / 2) * cerca, cy = H / 2 + (foco[1] - H / 2) * cerca;
    const mw = (W * k - cw) / 2, mh = (H * k - ch) / 2;   // cuánto puede moverse sin mostrar bordes
    const ox = (cw - W * k) / 2 + Math.max(-mw, Math.min(mw, (W / 2 - cx) * k)) * .92;
    const oy = (ch - H * k) / 2 + Math.max(-mh, Math.min(mh, (H / 2 - cy) * k)) * .92;
    // durante la intro la cámara se balancea suave para mostrar la profundidad
    const intro = 1 - suave((t - DURACION) / 1.5);
    const mx = px + intro * Math.sin(t * .42) * .55, my = py + intro * Math.sin(t * .31 + 1) * .2;
    const v = varita(Math.min(t, DURACION));
    ctx.fillStyle = '#f4f1ea'; ctx.fillRect(0, 0, cw, ch);
    if (t >= DURACION) {
      CAPAS.forEach((c, i) => {
        const dx = -mx * DESPLAZA * c.prof, dy = -my * DESPLAZA * c.prof + (c.flota ? Math.sin(t * c.flota[0] + i) * c.flota[1] : 0);
        ctx.drawImage(img[c.id].co, ox + dx * k, oy + dy * k, W * k, H * k);
      });
      return;
    }

    CAPAS.forEach((c, i) => {
      const I = img[c.id], m = I.mascara, g = m.getContext('2d');
      // máscara de color de esta capa
      g.clearRect(0, 0, m.width, m.height);
      for (const s of manchas[i]) {
        if (t < s.nace) continue;
        const R = s.R * (.35 + .65 * suave((t - s.nace) / (s.crece || .7))) / 2;
        g.drawImage(sellos[s.v], s.x / 2 - R, s.y / 2 - R, R * 2, R * 2);
      }
      const asentado = suave((t - ASIENTA[i]) / .7);
      if (asentado > 0) { g.globalAlpha = asentado; g.fillStyle = '#000'; g.fillRect(0, 0, m.width, m.height); g.globalAlpha = 1; }
      // color: la acuarela recortada por la máscara
      const tg = tmp.getContext('2d');
      tg.globalCompositeOperation = 'source-over'; tg.clearRect(0, 0, W, H);
      tg.drawImage(I.co, 0, 0); tg.globalCompositeOperation = 'destination-in'; tg.drawImage(m, 0, 0, W, H);
      // lineart: se retira con la máscara complementaria y desaparece del todo al asentarse el color
      const capa = I.capa, cg = capa.getContext('2d');
      cg.globalCompositeOperation = 'source-over'; cg.clearRect(0, 0, W, H);
      cg.globalAlpha = 1 - asentado; cg.drawImage(I.bn, 0, 0); cg.globalAlpha = 1;
      cg.globalCompositeOperation = 'destination-out'; cg.drawImage(m, 0, 0, W, H);
      cg.globalCompositeOperation = 'source-over'; cg.drawImage(tmp, 0, 0);
      const dx = -mx * DESPLAZA * c.prof, dy = -my * DESPLAZA * c.prof + (c.flota ? Math.sin(t * c.flota[0] + i) * c.flota[1] : 0);
      ctx.drawImage(capa, ox + dx * k, oy + dy * k, W * k, H * k);
    });

    // el hada vuela sobre la capa que está pintando
    if (t < 12.6) {
      const prof = v.mezcla !== undefined ? CAPAS[v.desde].prof + (CAPAS[v.capa].prof - CAPAS[v.desde].prof) * v.mezcla : CAPAS[v.capa].prof;
      const dx = -mx * DESPLAZA * prof, dy = -my * DESPLAZA * prof;
      const tx = ox + (v.p[0] + dx) * k, ty = oy + (v.p[1] + dy) * k, e = HADA_ESC * k;
      // estela de destellos: se calcula desde el tiempo, sin estado
      for (let s = Math.floor((t - .9) * 40) / 40; s <= t; s += 1 / 40) {
        if (s < .6 || s > 12.4) continue;
        const q = varita(s), h = azar(Math.round(s * 400))(), edad = t - s, a = 1 - edad / .9;
        const sx = ox + (q.p[0] + dx + (h - .5) * 26 + Math.sin(s * 31) * 8) * k, sy = oy + (q.p[1] + dy + edad * 40 + (azar(Math.round(s * 977))() - .5) * 20) * k;
        const tam = (5 + h * 8) * k * a;
        ctx.globalAlpha = a * .9; ctx.drawImage(destello, sx - tam, sy - tam, tam * 2, tam * 2);
      }
      ctx.globalAlpha = Math.min(1, (t - .5) / .4) * (1 - suave((t - 12) / .5));
      const [pxh, pyh] = PUNTA[v.pose], bob = Math.sin(t * 3.4) * 3 * k;
      ctx.drawImage(hada[v.pose], tx - pxh * e, ty - pyh * e + bob, 360 * e, 480 * e);
      ctx.globalAlpha = 1;
      // luz del hechizo sobre la luna
      const luz = Math.max(0, 1 - Math.abs(t - (HECHIZO + .35)) / .55);
      if (luz > 0) {
        const lx = ox + (LUNA[0] - mx * DESPLAZA * .12) * k, ly = oy + (LUNA[1] - my * DESPLAZA * .12) * k, rad = (120 + 380 * luz) * k;
        const gr = ctx.createRadialGradient(lx, ly, 0, lx, ly, rad);
        gr.addColorStop(0, `rgba(255,255,255,${.95 * luz})`); gr.addColorStop(.3, `rgba(255,226,240,${.6 * luz})`); gr.addColorStop(1, 'rgba(255,200,230,0)');
        ctx.fillStyle = gr; ctx.fillRect(lx - rad, ly - rad, rad * 2, rad * 2);
      }
    }
  }

  function montar(canvas, temaInicial = 'noche') {
    const ctx = canvas.getContext('2d');
    let t0 = null, t = 0, fin = null, saltado = false, px = 0, py = 0, vivo = true;
    let actual = null, anterior = null, fundidoIni = 0, pedido = temaInicial;   // fundido entre modos
    const ajustar = () => { const d = Math.min(devicePixelRatio || 1, 1.5); canvas.width = Math.round(innerWidth * d); canvas.height = Math.round(innerHeight * d); };
    ajustar(); addEventListener('resize', ajustar);
    const cargado = preparar(temaInicial).then(j => { actual = j; });
    function bucle(ahora) {
      if (!vivo) return;
      requestAnimationFrame(bucle);
      if (document.hidden) return;
      if (t0 !== null && !saltado) { t = (ahora - t0) / 1000; if (t >= DURACION && fin) { const f = fin; fin = null; f(); } }
      // tras la animación el tiempo sigue corriendo solo para que el dragón y el mago floten
      if (saltado || t0 === null) t = DURACION + 2 + ahora / 1000;
      // al cambiar de modo, la escena anterior se funde con la nueva durante 0,9 s
      const a = anterior ? Math.min(1, (ahora - fundidoIni) / 900) : 1;
      if (a < 1) { img = anterior; render(ctx, t, px, py); ctx.globalAlpha = a; }
      else anterior = null;
      img = actual; render(ctx, t, px, py); ctx.globalAlpha = 1;
    }
    cargado.then(() => requestAnimationFrame(bucle));
    return {
      cargado,
      // pinta la escena desde el lineart; la promesa se cumple al terminar o al saltarla
      reproducir() { return cargado.then(() => new Promise(ok => { saltado = false; t0 = performance.now(); fin = ok; })); },
      saltar() { saltado = true; if (fin) { const f = fin; fin = null; f(); } },
      // sin animación: la escena ya pintada
      pintada() { saltado = true; },
      mover(x, y) { px = x; py = y; },
      tema(nuevo) {
        pedido = nuevo;
        return preparar(nuevo).then(j => { if (pedido !== nuevo || j === actual) return; anterior = actual; actual = j; fundidoIni = performance.now(); });
      },
      detener() { vivo = false; }
    };
  }

  return { preparar, render, montar, DURACION };
})();
