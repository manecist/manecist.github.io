/* ==========================================================================
   magia.js · chispas compartidas y el hada viva
   - Magia.chispas(x, y, opciones): estallido de destellos en pantalla.
   - Magia.estela(x, y): un destello suelto (para dejar rastro al volar).
   - new Magia.Hada(elemento): el hada con parpadeo, vuelo y un hechizo
     de varita con fotogramas intermedios (fundidos entre poses).
   © 2026 María Inés Cisterna Escobar · Studios Conari SpA. Todos los derechos reservados.
   ========================================================================== */
(function () {
  'use strict';
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const COLORES = ['#fff6fb', '#ffd9ea', '#f5a8cf', '#d9b8ff', '#ba93f0', '#ffe39a', '#91dcff'];

  // ---------------------------------------------------------------- partículas
  const lienzo = document.getElementById('magia-canvas');
  const ctx = lienzo ? lienzo.getContext('2d') : null;
  let parts = [], corriendo = false, dpr = 1;
  function medir() {
    if (!lienzo) return;
    dpr = Math.min(2, devicePixelRatio || 1);
    lienzo.width = innerWidth * dpr; lienzo.height = innerHeight * dpr;
  }
  medir(); addEventListener('resize', medir);

  function estrella(c, x, y, r, rot) {
    c.save(); c.translate(x, y); c.rotate(rot); c.beginPath();
    for (let i = 0; i < 8; i++) {
      const rr = i % 2 ? r * .32 : r, a = i * Math.PI / 4;
      c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    c.closePath(); c.fill(); c.restore();
  }
  function bucle() {
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter(p => p.vida > 0);
    ctx.globalCompositeOperation = 'source-over';
    for (const p of parts) {
      p.vida -= p.paso; p.x += p.vx; p.y += p.vy; p.vy += p.grav; p.vx *= .985; p.vy *= .985; p.rot += p.giro;
      const a = Math.max(0, Math.min(1, p.vida));
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color; ctx.shadowBlur = 6;
      if (p.forma === 'estrella') estrella(ctx, p.x, p.y, p.r * (0.6 + a * .4), p.rot);
      else { ctx.beginPath(); ctx.arc(p.x, p.y, p.r * a, 0, 7); ctx.fill(); }
    }
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    if (parts.length) requestAnimationFrame(bucle); else corriendo = false;
  }
  function arrancar() { if (!corriendo) { corriendo = true; requestAnimationFrame(bucle); } }

  function chispas(x, y, o = {}) {
    if (!ctx || quieto) return;
    const n = o.n ?? 26, vel = o.vel ?? 4.2, colores = o.colores || COLORES;
    for (let i = 0; i < n; i++) {
      const ang = o.angulo != null ? o.angulo + (Math.random() - .5) * (o.abertura ?? 1.2) : Math.random() * Math.PI * 2;
      const v = vel * (.35 + Math.random() * .9);
      parts.push({
        x, y, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v - (o.subir ?? .6), grav: o.grav ?? .06,
        r: (o.tam ?? 4.5) * (.5 + Math.random()), vida: 1, paso: .012 + Math.random() * .02,
        color: colores[Math.floor(Math.random() * colores.length)], forma: Math.random() < .55 ? 'estrella' : 'punto',
        rot: Math.random() * 3, giro: (Math.random() - .5) * .2
      });
    }
    if (parts.length > 900) parts.splice(0, parts.length - 900);
    arrancar();
  }
  function estela(x, y, o = {}) {
    chispas(x, y, { n: o.n ?? 2, vel: o.vel ?? .9, tam: o.tam ?? 3.4, grav: .015, subir: .1, colores: o.colores });
  }

  // ---------------------------------------------------------------- el hada
  const POSES = {
    abierta: 'assets/hada-corregida.webp', parpado: 'assets/hada-parpadeo.webp',
    h0: 'assets/hada-hechizo-0.webp', h1: 'assets/hada-hechizo-1.webp',
    h2: 'assets/hada-hechizo-2.webp', h3: 'assets/hada-hechizo-3.webp'
  };
  // punta de la varita en cada pose (fracción del cuadro 3:4)
  const VARITA = { abierta: [.14, .17], parpado: [.14, .17], h0: [.16, .18], h1: [.2, .05], h2: [.08, .62], h3: [.06, .63] };
  Object.values(POSES).forEach(src => { const i = new Image(); i.src = src; });

  class Hada {
    constructor(el, o = {}) {
      this.el = el; this.pose = 'abierta'; this.ocupada = false; this.timers = [];
      el.classList.add('hada-lista');
      el.replaceChildren();
      const marco = document.createElement('div'); marco.className = 'hada-marco';
      this.capas = {};
      for (const [k, src] of Object.entries(POSES)) {
        const img = document.createElement('img'); img.src = src; img.alt = ''; img.draggable = false;
        img.className = 'hada-pose'; img.dataset.pose = k; marco.append(img); this.capas[k] = img;
      }
      const brillo = document.createElement('span'); brillo.className = 'hada-brillo';
      el.append(brillo, marco);
      this.mostrar('abierta');
      if (!quieto && o.parpadeo !== false) this.parpadear();
      if (o.hechizoCada && !quieto) this.ciclo = setInterval(() => { if (!document.hidden && this.visible()) this.hechizo(); }, o.hechizoCada);
    }
    visible() { const r = this.el.getBoundingClientRect(); return r.width > 0 && r.bottom > 0 && r.top < innerHeight; }
    mostrar(k, medio) {
      for (const [n, img] of Object.entries(this.capas)) img.style.opacity = n === k ? 1 : n === medio ? .55 : 0;
      this.pose = k;
    }
    punta(k = this.pose) {
      const r = this.el.querySelector('.hada-marco').getBoundingClientRect(), [fx, fy] = VARITA[k] || VARITA.abierta;
      const espejo = getComputedStyle(this.el).getPropertyValue('--hada-espejo').trim() === '-1';
      return { x: r.left + r.width * (espejo ? 1 - fx : fx), y: r.top + r.height * fy };
    }
    parpadear() {
      const t = setTimeout(() => {
        if (!this.ocupada && this.pose === 'abierta') {
          this.mostrar('parpado');
          setTimeout(() => { if (!this.ocupada) this.mostrar('abierta'); }, 140);
        }
        this.parpadear();
      }, 2600 + Math.random() * 2600);
      this.timers.push(t);
    }
    // Hechizo con fotogramas intermedios: cada cambio de pose pasa por un fundido
    // de un cuadro, y la varita deja una estela de chispas en cada posición.
    hechizo(alTocar) {
      if (this.ocupada) return Promise.resolve();
      this.ocupada = true; this.el.classList.add('lanzando');
      if (quieto) { this.mostrar('h2'); alTocar && alTocar(this.punta('h2')); setTimeout(() => { this.mostrar('abierta'); this.ocupada = false; this.el.classList.remove('lanzando'); }, 600); return Promise.resolve(); }
      const seq = [
        ['abierta', 'h0', 70], ['h0', null, 110], ['h0', 'h1', 60], ['h1', null, 220], ['h1', 'h2', 50],
        ['h2', null, 90, 'toque'], ['h2', 'h3', 50], ['h3', null, 380], ['h3', 'h2', 60], ['h2', null, 140],
        ['h2', 'h1', 60], ['h1', null, 120], ['h1', 'h0', 60], ['h0', null, 100], ['h0', 'abierta', 70], ['abierta', null, 10]
      ];
      return new Promise(fin => {
        let t = 0;
        seq.forEach(([k, medio, dur, marca]) => {
          this.timers.push(setTimeout(() => {
            if (medio) this.mostrar(medio, k); else this.mostrar(k);
            const p = this.punta(medio || k);
            estela(p.x, p.y, { n: 3 });
            if (marca === 'toque') { chispas(p.x, p.y, { n: 34, vel: 5 }); alTocar && alTocar(p); }
          }, t));
          t += dur;
        });
        this.timers.push(setTimeout(() => { this.ocupada = false; this.el.classList.remove('lanzando'); fin(); }, t + 20));
      });
    }
    destruir() { this.timers.forEach(clearTimeout); clearInterval(this.ciclo); }
  }

  window.Magia = { chispas, estela, Hada, quieto };
})();
