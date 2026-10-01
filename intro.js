/* ==========================================================================
   Intro de Studios Conari: el hada dibuja y pinta el estudio (GSAP)
   1. primer plano: un rayo de magia, sin ver aún de dónde sale, dibuja el
      lineart de cada emblema; la cámara sigue la línea de la constelación
      hasta el siguiente
   2. la cámara se aleja y aparece el hada dibujando al dragón
   3. con todo en lineart, su hechizo pinta a la vez los emblemas y el dragón,
      que cobra vida, da una vuelta y reúne los emblemas en la luna
   5. el dragón cruza por delante del nombre y revela STUDIOS CONARI a su paso
   Es lo primero que aparece al abrir la página (una vez por sesión); al
   terminar abre la escena del libro mágico. Cualquier tecla, clic o
   toque la salta. Con movimiento reducido no se reproduce.
   ========================================================================== */
(() => {
  // index.html marca <html class="con-intro"> antes de pintar si corresponde mostrarla
  const raiz = document.documentElement;
  if (!raiz.classList.contains('con-intro') || !window.gsap || !window.MCE_TRAZOS) { raiz.classList.remove('con-intro'); return; }
  window.MCEIntroActiva = true;
  iniciar();

  function iniciar() {
    gsap.registerPlugin(...[window.MotionPathPlugin].filter(Boolean));
    const T = window.MCE_TRAZOS, NS = 'http://www.w3.org/2000/svg';
    const movil = matchMedia('(pointer: coarse)').matches;
    const vertical = innerHeight > innerWidth;

    // ---------------------------------------------------------- escena
    const intro = document.createElement('div');
    intro.className = 'intro'; intro.setAttribute('aria-hidden', 'true');
    intro.innerHTML = `
      <canvas class="intro-cielo"></canvas>
      <div class="intro-escenario"><div class="intro-camara">
        <svg class="intro-constelacion" viewBox="0 0 1000 600"></svg>
        <div class="intro-logo">
          <img class="iw iw-luna" src="assets/intro/w-luna.png" alt="">
          <img class="iw iw-lineas" src="assets/intro/w-lineas.png" alt="">
          <img class="iw iw-studios" src="assets/intro/w-studios.png" alt="">
          <img class="iw iw-conari" src="assets/intro/w-conari.png" alt="">
          <img class="iw iw-base" src="assets/intro/w-base.png" alt="">
          <svg viewBox="0 0 620 362"></svg>
          <div class="intro-brillo"></div>
        </div>
        <div class="intro-hada">${[0, 1, 2, 3].map(i => `<img src="assets/hada-hechizo-${i}.webp" alt="">`).join('')}</div>
        <div class="intro-dragon-dibujo"><div class="intro-dragon-color pintable"></div><svg viewBox="0 0 254 240"></svg></div>
        <div class="intro-onda"></div>
        <div class="intro-hechizo"></div>
        <div class="intro-destello"></div>
        <div class="intro-dragon"><div class="intro-dragon-spr"></div></div>
        <div class="intro-pluma"></div>
        <p class="intro-presenta">PRESENTA<span>El portafolio de María Inés Cisterna Escobar</span></p>
      </div></div>
      <p class="intro-saltar">${movil ? 'Toca' : 'Pulsa cualquier tecla'} para saltar</p>`;
    document.body.appendChild(intro);
    const $ = s => intro.querySelector(s);
    const escenario = $('.intro-escenario'), camara = $('.intro-camara'), lienzo = $('.intro-cielo'), ctx = lienzo.getContext('2d');

    // trazos: se mide cada línea para dibujarla en orden, como con un lápiz
    const trazos = (svg, clave) => T[clave].map(d => {
      const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); p.setAttribute('class', 'trazo');
      svg.appendChild(p); const largo = p.getTotalLength();
      p.style.strokeDasharray = largo; p.style.strokeDashoffset = largo;
      return { p, largo };
    });

    // ocho emblemas en una elipse alrededor del centro (escenario de 1000 × 600)
    const NOMBRES = ['estrella', 'castillo-montana-bosque', 'investigacion', 'dragon', 'arbol', 'libro', 'sol-luna', 'proyeccion'];
    const C = { x: 500, y: 300 }, RX = vertical ? 255 : 420, RY = vertical ? 290 : 225;
    const constel = $('.intro-constelacion');
    const emblemas = NOMBRES.map((n, i) => {
      const a = -Math.PI / 2 + i * Math.PI / 4, x = C.x + Math.cos(a) * RX, y = C.y + Math.sin(a) * RY;
      const el = document.createElement('div'); el.className = 'intro-emblema'; el.style.left = x + 'px'; el.style.top = y + 'px';
      const img = new Image(); img.src = `assets/intro/logo-${n}.png`; img.alt = ''; img.className = 'pintable';
      const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 256 256');
      el.append(img, svg); camara.insertBefore(el, $('.intro-logo'));
      return { el, img, svg, x, y, lineas: trazos(svg, 'ic-' + n), a: (xx, yy) => ({ x: x - 70 + xx * 140 / 256, y: y - 70 + yy * 140 / 256 }) };
    });
    emblemas.forEach((e, i) => {
      const q = emblemas[(i + 1) % emblemas.length], l = document.createElementNS(NS, 'line');
      Object.entries({ x1: e.x, y1: e.y, x2: q.x, y2: q.y, pathLength: 1 }).forEach(([k, v]) => l.setAttribute(k, v));
      constel.appendChild(l);
    });
    const dibujo = $('.intro-dragon-dibujo'), dragonLineas = trazos($('.intro-dragon-dibujo svg'), 'dragon');
    const DS = 220 / 254, aDragon = (xx, yy) => ({ x: 390 + xx * DS, y: 196 + yy * DS });   // dibujo de 220 px de ancho en el centro
    const svgLogo = $('.intro-logo svg'), lineasLuna = trazos(svgLogo, 'luna');

    // ---------------------------------------------------------- escala del escenario
    let k = 1, ox = 0, oy = 0;
    function medir() {
      lienzo.width = innerWidth; lienzo.height = innerHeight;
      k = vertical ? Math.min(innerWidth / 600, innerHeight / 700) : Math.min(innerWidth / 1000, innerHeight / 600) * .94;
      ox = (innerWidth - 1000 * k) / 2; oy = (innerHeight - 600 * k) / 2;
      escenario.style.transform = `translate(${ox}px, ${oy}px) scale(${k})`;
    }
    medir(); addEventListener('resize', medir);

    // ---------------------------------------------------------- pluma, hada y partículas
    // P es la punta de la varita. El hada la sigue: cada pose sostiene la varita en otro lugar.
    const P = { x: 1150, y: 230 }, hada = $('.intro-hada'), pluma = $('.intro-pluma'), poses = [...hada.children];
    const PUNTA = [[72, 97], [113, 42], [22, 318], [30, 372]], ESC = 150 / 360;
    let pose = 0; const A = { x: 500, y: 300, on: 1 }, H = { x: A.x, y: A.y };
    // cámara: punto del escenario que queda al centro y su acercamiento
    const Cam = { x: 500, y: 300, z: 1 };
    const pantalla = (x, y) => [ox + k * (500 + (x - Cam.x) * Cam.z), oy + k * (300 + (y - Cam.y) * Cam.z)];
    const posar = i => { pose = i; poses.forEach((img, j) => img.classList.toggle('activa', j === i)); };
    posar(0);
    const estrellas = Array.from({ length: movil ? 70 : 150 }, () => ({ x: Math.random(), y: Math.random(), f: Math.random() * 6.3, v: .5 + Math.random() * 1.5, r: .6 + Math.random() * 1.3, c: Math.random() < .3 ? '245,168,207' : Math.random() < .5 ? '186,147,240' : '232,238,255' }));
    const polvo = [], COLORES = ['255,217,240', '245,168,207', '186,147,240', '255,212,90'];
    const dragon = $('.intro-dragon'), sprite = $('.intro-dragon-spr');
    let previoX = null, previo = { x: P.x, y: P.y }, vivo = true, t = 0;
    function cuadro() {
      if (!vivo) return;
      requestAnimationFrame(cuadro); pintarCuadro();
    }
    function pintarCuadro() {
      t += 1 / 60;
      camara.style.transform = `translate(${500 - Cam.x * Cam.z}px, ${300 - Cam.y * Cam.z}px) scale(${Cam.z})`;
      // el hada sigue a la punta de su varita con un pequeño retraso y flota
      const meta = A.on ? A : P;
      H.x += (meta.x - H.x) * .35; H.y += (meta.y - H.y) * .35;
      const [px, py] = PUNTA[pose];
      hada.style.transform = `translate(${H.x - px * ESC}px, ${H.y - py * ESC + Math.sin(t * 3.2) * 3}px)`;
      pluma.style.transform = `translate(${P.x}px, ${P.y}px) scale(${1 / Math.sqrt(Cam.z)})`;
      ctx.clearRect(0, 0, lienzo.width, lienzo.height);
      for (const s of estrellas) {
        const b = .25 + .75 * Math.max(0, Math.sin(t * s.v + s.f));
        ctx.fillStyle = `rgba(${s.c}, ${b * .8})`;
        ctx.beginPath(); ctx.arc(s.x * lienzo.width, s.y * lienzo.height, s.r * Math.max(1, k), 0, 6.3); ctx.fill();
      }
      // rayo de magia desde la varita hasta el trazo cuando dibuja a distancia
      if (A.on && +gsap.getProperty(pluma, 'opacity') > 0) {
        const [x1, y1] = pantalla(H.x, H.y), [x2, y2] = pantalla(P.x, P.y), kz = k * Math.sqrt(Cam.z);
        const g = ctx.createLinearGradient(x1, y1, x2, y2);
        g.addColorStop(0, 'rgba(255,236,250,.15)'); g.addColorStop(1, 'rgba(255,236,250,.85)');
        ctx.save(); ctx.strokeStyle = g; ctx.lineWidth = 1.8 * kz; ctx.shadowColor = 'rgba(245,168,207,.9)'; ctx.shadowBlur = 12 * kz;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo((x1 + x2) / 2 + Math.sin(t * 9) * 12 * kz, (y1 + y2) / 2 - 25 * kz, x2, y2); ctx.stroke(); ctx.restore();
      }
      // destellos de colores detrás de la varita mientras se mueve
      const mov = Math.hypot(P.x - previo.x, P.y - previo.y);
      if (+gsap.getProperty(pluma, 'opacity') > 0 && mov > .4 / Cam.z) {
        const [sx, sy] = pantalla(P.x, P.y);
        for (let i = 0; i < (movil ? 1 : 3); i++) polvo.push({ x: sx + (Math.random() - .5) * 10 * k, y: sy + (Math.random() - .5) * 10 * k, v: 1, vy: .2 + Math.random() * .7, vx: (Math.random() - .5) * .6, r: 1 + Math.random() * 2, c: COLORES[Math.random() * 4 | 0] });
      }
      previo = { x: P.x, y: P.y };
      // estela dorada detrás del dragón
      const dx = gsap.getProperty(dragon, 'x'), dy = gsap.getProperty(dragon, 'y');
      if (+gsap.getProperty(dragon, 'opacity') > 0) {
        if (previoX !== null) sprite.style.transform = `scaleX(${dx > previoX + .2 ? -1 : 1})`;   // el sprite mira a la izquierda
        const [sx, sy] = pantalla(dx, dy + 18);
        for (let i = 0; i < (movil ? 1 : 2); i++) polvo.push({ x: sx + (Math.random() - .5) * 30 * k, y: sy + (Math.random() - .5) * 20 * k, v: 1, vy: .3 + Math.random() * .8, vx: 0, r: 1.2 + Math.random() * 1.6, c: Math.random() < .7 ? '255,212,90' : '245,168,207' });
      }
      previoX = dx;
      for (let i = polvo.length - 1; i >= 0; i--) {
        const q = polvo[i]; q.v -= .02; q.y += q.vy; q.x += q.vx; if (q.v <= 0) { polvo.splice(i, 1); continue; }
        ctx.fillStyle = `rgba(${q.c}, ${q.v * .9})`;
        ctx.beginPath(); ctx.arc(q.x, q.y, q.r * Math.max(1, k * .9) * q.v, 0, 6.3); ctx.fill();
      }
    }
    requestAnimationFrame(cuadro);

    // dibuja las líneas una tras otra; la varita recorre cada trazo
    function dibujar(lineas, aEscenario, duracion, conPluma = true) {
      const total = lineas.reduce((s, l) => s + l.largo, 0), o = { v: 0 };
      return gsap.to(o, {
        v: total, duration: duracion, ease: 'power1.inOut',
        onUpdate() {
          let resto = o.v;
          for (const l of lineas) {
            const hecho = Math.max(0, Math.min(l.largo, resto));
            l.p.style.strokeDashoffset = l.largo - hecho;
            if (conPluma && hecho > 0 && hecho < l.largo) { const q = l.p.getPointAtLength(hecho), e = aEscenario(q.x, q.y); P.x = e.x; P.y = e.y; }
            resto -= l.largo;
          }
        }
      });
    }
    const inicioDe = (lineas, aEscenario) => { const q = lineas[0].p.getPointAtLength(0); return aEscenario(q.x, q.y); };
    const pintar = (el, duracion) => gsap.fromTo(el, { '--pinta': '100%' }, { '--pinta': '0%', duration: duracion, ease: 'power1.inOut' });
    [...emblemas.map(e => e.img), $('.intro-dragon-color')].forEach(el => { el.style.webkitMaskPosition = 'var(--pinta, 100%) 0'; el.style.maskPosition = 'var(--pinta, 100%) 0'; });

    // ---------------------------------------------------------- guion
    const L = { x: 500 - 620 * .85 / 2, y: 300 - 362 * .85 / 2, s: .85 };
    const estrellaLuna = { x: L.x + 311 * L.s, y: L.y + 75 * L.s };
    const conariY = L.y + 258 * L.s;
    gsap.set(dragon, { x: 500, y: 300, opacity: 0 });
    // STUDIOS, CONARI y las líneas laterales quedan ocultos hasta que pase el dragón
    const nombre = ['.iw-lineas', '.iw-studios', '.iw-conari'].map(s => $(s));
    gsap.set(nombre, { opacity: 1, clipPath: 'inset(0 0 0 100%)' });

    const tl = gsap.timeline({ onComplete: terminar });
    const iniD = inicioDe(dragonLineas, aDragon), onda = $('.intro-onda'), dragonColor = $('.intro-dragon-color');
    gsap.set(onda, { width: RX * 2.3, height: RY * 2.3, marginLeft: -RX * 1.15, marginTop: -RY * 1.15 });
    // dónde flota el hada mientras trabaja en el dragón (en pantallas verticales, debajo de él)
    const ANCLA = vertical
      ? { dibuja: { x: 520, y: 450 }, hechizo: { x: 555, y: 560 } }
      : { dibuja: { x: 680, y: 230 }, hechizo: { x: 655, y: 350 } };

    // 1. primer plano: el rayo dibuja cada emblema y la cámara sigue la línea hasta el siguiente.
    //    El rayo sale del centro del anillo, que queda fuera de cuadro mientras la cámara está cerca.
    const Z = vertical ? 2 : 2.4, RITMO = [.55, .45, .4, .36, .33, .31, .3, .3], VIAJE = .36;
    Object.assign(Cam, { x: emblemas[0].x, y: emblemas[0].y, z: Z });
    Object.assign(P, inicioDe(emblemas[0].lineas, emblemas[0].a));
    posar(1);
    tl.to(intro, { opacity: 1, duration: .6 }, 0)
      .to(pluma, { opacity: 1, duration: .3 }, .35);
    let tt = .5;
    emblemas.forEach((e, i) => {
      const ini = inicioDe(e.lineas, e.a);
      tl.to(P, { x: ini.x, y: ini.y, duration: .1, ease: 'power1.out' }, tt).set(e.el, { opacity: 1 }, tt);
      tt += .1;
      tl.add(dibujar(e.lineas, e.a, RITMO[i]), tt);
      tt += RITMO[i];
      if (i === emblemas.length - 1) return;
      const q = emblemas[i + 1];
      tl.to(P, { x: e.x, y: e.y, duration: .08 }, tt);
      tt += .08;
      tl.to(P, { x: q.x, y: q.y, duration: VIAJE, ease: 'power1.inOut' }, tt)
        .to(constel.children[i], { strokeDashoffset: 0, duration: VIAJE, ease: 'power1.inOut' }, tt)
        .to(Cam, { x: q.x, y: q.y, duration: VIAJE, ease: 'power1.inOut' }, tt);
      tt += VIAJE;
    });

    // 2. la cámara se aleja: aparece el hada, que es quien lanzaba el rayo, y dibuja al dragón
    tl.to(constel.children[emblemas.length - 1], { strokeDashoffset: 0, duration: .7, ease: 'power1.inOut' }, tt)
      .to(Cam, { x: 500, y: 300, z: 1, duration: 1.4, ease: 'power2.inOut' }, tt)
      .to(A, { ...ANCLA.dibuja, duration: 1.1, ease: 'power2.inOut' }, tt + .2)
      .to(hada, { opacity: 1, duration: .6 }, tt + .55)
      .to(P, { x: iniD.x, y: iniD.y, duration: .5, ease: 'power2.inOut' }, tt + .3)
      .to(constel, { opacity: .5, duration: .6 }, tt + 1)
      .set(dibujo, { opacity: 1 }, tt + .8)
      .add(dibujar(dragonLineas, aDragon, 1.3), tt + .8);
    tt += 2.15;

    // 3. con todo en lineart, un solo hechizo pinta los emblemas y el dragón, que cobra vida
    tl.call(posar, [2], tt)
      .to(A, { ...ANCLA.hechizo, duration: .3, ease: 'power2.out' }, tt)
      .to(P, { x: 560, y: 300, duration: .3, ease: 'power2.out' }, tt)
      .fromTo('.intro-hechizo', { scale: .1, opacity: 0 }, { scale: 1.25, opacity: 1, duration: .45, ease: 'power2.out' }, tt + .25)
      .fromTo(onda, { scale: .05, opacity: 1 }, { scale: 1, opacity: 0, duration: 1, ease: 'power2.out', immediateRender: false }, tt + .35)
      .to(constel, { opacity: 1, duration: .4 }, tt + .4)
      .add(pintar(dragonColor, .35), tt + .35)
      .to('.intro-dragon-dibujo svg', { opacity: 0, duration: .3 }, tt + .5);
    emblemas.forEach((e, i) => {
      const t0 = tt + .6 + (i % 2) * .05;   // la onda alcanza el anillo casi a la vez
      tl.add(pintar(e.img, .35), t0).to(e.svg, { opacity: 0, duration: .3 }, t0 + .2)
        .fromTo(e.img, { filter: 'brightness(2.2) drop-shadow(0 0 14px rgba(255,236,250,.9))' }, { filter: 'brightness(1) drop-shadow(0 0 8px rgba(255,212,90,.5))', duration: .6, immediateRender: false }, t0 + .15);
    });
    tl.set(dibujo, { opacity: 0 }, tt + .75)
      .set(dragon, { opacity: 1, scale: 220 / (254 * .6) }, tt + .75)
      .to('.intro-hechizo', { opacity: 0, scale: 1.6, duration: .6, ease: 'power1.in' }, tt + .8)
      .to(pluma, { opacity: 0, duration: .3 }, tt + .7);
    tt += .95;
    // el hada se despide volando hacia arriba mientras el dragón da la vuelta y reúne los emblemas en la luna
    tl.call(posar, [0], tt + .2)
      .set(A, { on: 0 }, tt + .2)
      .set(P, { x: () => H.x, y: () => H.y }, tt + .2)
      .to(P, { x: vertical ? 700 : 1150, y: vertical ? 1000 : 760, duration: 1, ease: 'power2.in' }, tt + .25)
      .to(hada, { opacity: 0, duration: .5 }, tt + .9)
      .to(dragon, { scale: 1, duration: .5 }, tt)
      .to(dragon, {
        duration: 2, ease: 'power1.inOut',
        motionPath: { path: [{ x: 760, y: 110 }, { x: 560, y: 20 }, { x: 150, y: 90 }, { x: 40, y: 330 }, { x: 260, y: 560 }, { x: 740, y: 575 }, { x: 1010, y: conariY - 30 }], curviness: 1.25 }
      }, tt)
      .to(constel, { opacity: 0, duration: .5 }, tt + .8)
      .add(dibujar(lineasLuna, (x, y) => ({ x: L.x + x * L.s, y: L.y + y * L.s }), 1.1, false), tt + .5)
      .set(pluma, { opacity: 0 }, tt + .5);
    emblemas.forEach((e, i) => {
      tl.to(e.el, { left: estrellaLuna.x, top: estrellaLuna.y, scale: .15, opacity: 0, duration: .55, ease: 'power2.in' }, tt + .45 + i * .09);
    });
    tt += 1.55;
    tl.fromTo('.intro-destello', { scale: 0, opacity: 0, left: estrellaLuna.x, top: estrellaLuna.y }, { scale: 2.2, opacity: 1, duration: .35, yoyo: true, repeat: 1, ease: 'power2.out' }, tt)
      .to('.iw-luna', { opacity: 1, duration: .5 }, tt)
      .to(lineasLuna.map(l => l.p), { opacity: 0, duration: .5 }, tt + .2)
      .fromTo('.iw-luna', { filter: 'brightness(1)' }, { filter: 'brightness(1.8)', duration: .35, yoyo: true, repeat: 1 }, tt)
      // 5. nombre del estudio
      // el dragón cruza por delante del nombre y lo va dejando a la vista a su paso
      .to(dragon, {
        x: -220, y: conariY - 40, duration: 1.15, ease: 'none',
        onUpdate() {
          const f = Math.min(100, Math.max(0, (gsap.getProperty(dragon, 'x') - L.x) / (620 * L.s) * 100));
          nombre.forEach(el => { el.style.clipPath = `inset(0 0 0 ${f}%)`; });
        }
      }, tt + .65)
      .to(dragon, { x: () => -ox / k - 260, y: conariY - 150, duration: .75, ease: 'none' }, tt + 1.8)
      .set(dragon, { opacity: 0 }, tt + 2.55)
      .fromTo('.iw-base', { opacity: 0, scale: .3 }, { opacity: 1, scale: 1, duration: .5, ease: 'back.out(3)' }, tt + 1.6)
      .fromTo('.intro-brillo', { backgroundPosition: '-250% 0' }, { backgroundPosition: '300% 0', duration: 1.3, ease: 'power1.inOut' }, tt + 1.75)
      .fromTo('.intro-presenta', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .6 }, tt + 1.95)
      .to('.intro-saltar', { opacity: 0, duration: .4 }, tt + 1.85)
      .to({}, { duration: .9 })
      .to(intro, { opacity: 0, duration: .6 });

    // ---------------------------------------------------------- salto y cierre
    let cerrado = false;
    function terminar() {
      if (cerrado) return; cerrado = true; vivo = false;
      try { sessionStorage.setItem('mce-intro', '1'); } catch (e) { /* sin almacenamiento */ }
      intro.remove(); raiz.classList.remove('con-intro');
      window.dispatchEvent(new Event('mce-intro-fin'));
      removeEventListener('keydown', saltar, true); removeEventListener('resize', medir);
    }
    function saltar(e) {
      if (e) { e.preventDefault(); e.stopImmediatePropagation(); }   // la tecla no llega a los juegos
      if (cerrado || tl.progress() > .93) return;
      tl.kill(); gsap.to(intro, { opacity: 0, duration: .35, onComplete: terminar });
    }
    addEventListener('keydown', saltar, true);
    intro.addEventListener('pointerdown', saltar);
    window.MCEIntro = { tl, saltar, cuadro: pintarCuadro };
  }
})();
