/* ==========================================================================
   Versión clásica por escenas: la página deja de desplazarse hacia abajo.
   Cada giro de la rueda (o flecha abajo / AvPág) pasa a la escena siguiente;
   las piezas aparecen con suavidad (sin estirarse). Algunas escenas tienen pasos
   internos (pestañas de desarrollo y juegos). Al entrar a las secciones grandes
   pasa el hada volando desde la esquina superior derecha a la inferior izquierda:
   la estela de cometa que nace de su varita tapa todo con niebla mágica, aparece
   el nombre de la sección y en una segunda pasada la estela descubre la nueva.
   Los nodos de la página se mueven (no se copian), así la
   calculadora, la caja, los tableros y los juegos siguen funcionando.
   Solo en escritorio con mouse; ?normal vuelve a la página con scroll.
   ========================================================================== */
(() => {
  const raiz = document.documentElement;
  const apto = matchMedia('(pointer: fine)').matches && innerWidth >= 1000 && !matchMedia('(prefers-reduced-motion: reduce)').matches
    && !/[?&]normal\b/.test(location.search) && window.gsap;
  // en celular y tableta: las mismas escenas dibujadas, una debajo de otra, y se recorren bajando con el dedo («pila»)
  const pila = !apto && !/[?&]normal\b/.test(location.search) && !!window.gsap;
  if (!apto && !pila) return;
  // en el computador las escenas también van una debajo de otra (scroll continuo), cada una del alto de la pantalla
  // y achicada lo justo para verse completa («flujo»); ya no se cambia de escena con la rueda ni pasa el hada
  const flujo = apto;
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const main = $('#site main'), site = $('#site'), reino = $('#reino');
  if (!main || !site) return;
  raiz.classList.add('escenas'); if (pila) raiz.classList.add('escenas-pila'); if (flujo) raiz.classList.add('escenas-flujo');
  // los títulos van en una sola línea centrada: el salto de línea pasa a ser un espacio
  $$('.section-head h2 br').forEach(b => b.replaceWith(' '));
  // títulos cortos, como en kdelrio
  const tEst = $('#estudio .section-head h2'); if (tEst) tEst.textContent = 'Studios Conari';
  // en la cinta de cada capítulo va su nombre corto (sin el número), y el lema queda debajo
  const NOMBRES_CINTA = { desarrollo: 'Desarrollo', diseno: 'Diseño', datos: 'Datos de salud', trayectoria: 'Trayectoria', formacion: 'Formación', arcade: 'Arcade mágico', contacto: 'Contacto' };
  Object.entries(NOMBRES_CINTA).forEach(([id, t]) => { const e = $('#' + id + ' .section-head .eyebrow'); if (e) { e.dataset.original = e.textContent; e.textContent = t; e.classList.add('cinta-nombre'); } });

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
  const mundo = document.createElement('img'); mundo.className = 'estudio-mundo'; mundo.src = 'assets/mundo-conari-sol-luna.webp'; mundo.alt = 'Un libro abre el mundo de Conari: dragón, sakura, castillo y Andes';
  const marca = div('estudio-marca', lema, cuerpo && cuerpo.querySelector(':scope > p:not(.official-slogan)'), cuerpo && cuerpo.querySelector('.studio-actions'));
  const ICONOS = { 'Documentación y propuestas': 'assets/icon-document.webp', 'Modelado y animación 3D': 'assets/pergamino/icon-3d.webp' };
  const servicios = div('estudio-servicios', [...$$('.service-gallery article, .service-more article', $(est))].map(a => {
    const t = a.querySelector('h3')?.textContent || '', ico = a.querySelector('img')?.getAttribute('src') || ICONOS[t] || 'assets/icon-company.webp';
    const fila = document.createElement('div'); fila.className = 'estudio-servicio';
    fila.innerHTML = '<img src="' + ico + '" alt=""><div><h3></h3><p></p></div>';
    fila.querySelector('h3').textContent = t; fila.querySelector('p').textContent = a.querySelector('p')?.textContent || '';
    return fila;
  }));
  const rolTit = document.createElement('p'); rolTit.className = 'estudio-rol'; rolTit.textContent = 'Lo que hacemos';
  E.push({
    id: 'estudio', hada: 'Studios Conari', ev: crear('ev-estudio', cabeza(est), div('estudio-dos estudio-tres', div('estudio-mundo-caja', mundo), marca, div('estudio-lista', rolTit, servicios))),
    entrar(tl, ev) {
      sube(tl, $$('.section-head > div > *', ev));
      sube(tl, $$('.estudio-marca > *', ev), '-=.2', { stagger: .08 });
      tl.from(rolTit, { opacity: 0, duration: .4 }, '<.2');
      lado(tl, $$('.estudio-servicio', ev), 1, '<.1', { stagger: .08, duration: .5 });
    },
  });
  // junto al perfil: las credenciales como medallas pequeñas y la cinta para descargar el CV
  const credPerfil = div('perfil-credenciales', ...[...$$('#formacion .credential-gallery article')].map(a => {
    const m = document.createElement('div'); m.className = 'perfil-medalla';
    m.innerHTML = '<img alt=""><b></b><small></small>';
    m.querySelector('img').src = a.querySelector('img')?.getAttribute('src') || '';
    m.querySelector('b').textContent = a.querySelector('h3')?.textContent || '';
    m.querySelector('small').textContent = a.querySelector('span')?.textContent || '';
    // el detalle de cada credencial (lo que antes estaba en la escena Formación) se abre al pasar el mouse o tocarla
    const det = document.createElement('div'); det.className = 'perfil-medalla-detalle';
    det.append(Object.assign(document.createElement('p'), { textContent: a.querySelector('p')?.textContent || '' }));
    const ver = a.querySelector('a'); if (ver) det.append(Object.assign(ver.cloneNode(true), { className: 'perfil-verificar' }));
    // Google Data Analytics: los ocho cursos aprobados, cada uno con su verificación en Coursera
    if (/Google/.test(a.querySelector('h3')?.textContent || '')) {
      const CURSOS = [['Introducing Data Analytics and Analytical Thinking', '72KSUXXUTTN8'], ['Ask Effective Questions', 'QCHGFWSZVHAX'], ['Make Data-Driven Decisions', 'G3M3UPJH8XBW'],
        ['Foundations: Data, Data, Everywhere', 'V2VZ8253MZM4'], ['Always Remember the Stakeholder', '6G83E5NKKUZ2'], ['Data Responsibility', 'GBTX8I7UTNHN'],
        ['Ask Questions to Make Data-Driven Decisions', '5XHJQVCJB0YE'], ['The Importance of Integrity', 'PQV30EPTHB4T']];
      const ol = document.createElement('ol'); ol.className = 'perfil-cursos';
      CURSOS.forEach(([t, c]) => { const li = document.createElement('li'), l = document.createElement('a'); l.href = 'https://coursera.org/verify/' + c; l.target = '_blank'; l.rel = 'noopener'; l.textContent = t + ' ↗'; li.append(l); ol.append(li); });
      det.append(ol); det.classList.add('con-cursos');
    }
    m.append(det); m.tabIndex = 0;
    m.addEventListener('click', e => { if (!e.target.closest('a')) m.classList.toggle('abierta'); });
    return m;
  }));
  const cv = document.createElement('a'); cv.className = 'perfil-cv'; cv.href = 'assets/cv-maria-cisterna.pdf'; cv.target = '_blank'; cv.rel = 'noopener'; cv.download = '';
  cv.innerHTML = '<span>✦ Descargar mi CV ✦</span>';
  credPerfil.append(cv);
  const perfilPro = $('#estudio .perfil-pro'); if (perfilPro) perfilPro.append(credPerfil);
  E.push({
    id: 'equipo', ev: crear('ev-equipo', de('.studio-team', est)),
    // al llegar sin animación (por ejemplo al volver del cuento) el pergamino se muestra ya abierto con sus credenciales
    listo(ev) {
      const perg = $('.perfil-pro-texto', ev); if (!perg) return;
      gsap.set(perg, { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1 }); perg.style.clipPath = ''; perg.classList.add('abierto');
      const rollo = $('.perfil-rollito', ev); if (rollo) rollo.style.opacity = 0;
      gsap.set($$('.perfil-medalla, .perfil-cv', ev), { opacity: 1 });
    },
    entrar(tl, ev) {
      // el perfil profesional: primero el retrato, luego el texto línea por línea
      // el pergamino llega cerrado; el hada vuela, lo toca con su varita y se desenrolla; después aparecen las credenciales
      const perg = $('.perfil-pro-texto', ev), medallas = $$('.perfil-medalla, .perfil-cv', ev);
      // el rollito cerrado se pone sobre el pergamino (una sola vez)
      let rollo = $('.perfil-rollito', ev);
      if (!rollo) { rollo = document.createElement('img'); rollo.className = 'perfil-rollito'; rollo.src = 'assets/pergamino/rollito.webp'; rollo.alt = ''; perg.parentElement.style.position = 'relative'; perg.after(rollo); }
      perg.classList.remove('abierto'); gsap.set(medallas, { opacity: 0 });
      // el rollito empieza arriba, sobre el rollo superior; al desenrollarse baja y el papel aparece detrás de él
      const w = perg.offsetWidth * 1.08, h = w * 351 / 900, top0 = perg.offsetTop - h * .18, top1 = perg.offsetTop + perg.offsetHeight - h * .82;
      Object.assign(rollo.style, { width: w + 'px', left: (perg.offsetLeft + perg.offsetWidth / 2 - w / 2) + 'px', top: top0 + 'px' });
      const corte = y => Math.max(0, 100 - (y - perg.offsetTop + h * .5) / perg.offsetHeight * 100);
      // mientras está enrollado, el pergamino no se ve; aparece detrás del rollito a medida que baja
      gsap.set(perg, { clipPath: 'inset(0% 0% 100% 0%)', opacity: 0 }); gsap.set(rollo, { opacity: 1, y: 0 });
      sube(tl, $$('.perfil-pro-retrato', ev));
      tl.from(rollo, { opacity: 0, y: -20, duration: .5 }, '<.1');
      const hada = document.createElement('img'); hada.src = 'assets/hada-cometa.webp'; hada.alt = ''; hada.className = 'perfil-hada'; ev.append(hada);
      if (!$('.perfil-destello', ev)) { const d = document.createElement('span'); d.className = 'perfil-destello'; $('.perfil-pro-retrato', ev).append(d); }
      const r = perg.getBoundingClientRect(), base = ev.getBoundingClientRect();
      const x = r.left - base.left + r.width * .6, y = r.top - base.top - 30;
      const paso = { y: top0 };
      tl.fromTo(hada, { x: base.width + 60, y: -80, rotate: -12, opacity: 0 }, { x, y, rotate: 0, opacity: 1, duration: 1.2, ease: 'power2.out' })
        .call(() => { if (window.Magia) Magia.chispas(r.left + r.width / 2, r.top + 10, { n: 40, vel: 4 }); })
        .set(perg, { opacity: 1 }, '+=.1')
        .to(paso, { y: top1, duration: 1.4, ease: 'power2.inOut', onUpdate() { rollo.style.top = paso.y + 'px'; perg.style.clipPath = 'inset(0% 0% ' + corte(paso.y).toFixed(2) + '% 0%)'; } }, '<')
        .to(rollo, { opacity: 0, duration: .3 })
        .set(perg, { clipPath: 'inset(0% 0% 0% 0%)' }, '<')
        .call(() => perg.classList.add('abierto'))
        // la primera vez, el hada también toca a Ari y ella se transforma en la asesina (luz rosada y chispas)
        .add(() => {
          const humana = $('.perfil-pro-ari:not(.perfil-pro-asesina)', ev), asesina = $('.perfil-pro-asesina', ev); if (!humana || !asesina) return;
          let vista = false; try { vista = !!sessionStorage.getItem('mce-transformada'); } catch (e) { /* sin almacenamiento */ }
          if (vista) { gsap.set(humana, { opacity: 0 }); gsap.set(asesina, { opacity: 1 }); return; }
          const rr = humana.getBoundingClientRect(), destello = $('.perfil-destello', ev);
          gsap.timeline()
            .to(hada, { x: rr.left - base.left + rr.width * .55, y: rr.top - base.top + rr.height * .12, duration: .8, ease: 'power2.inOut' })
            .call(() => { if (window.Magia) Magia.chispas(rr.left + rr.width / 2, rr.top + rr.height / 2, { n: 70, vel: 6, colores: ['#ff8fc0', '#ffd9ea', '#f3d48a', '#fff'] }); })
            .to(destello, { opacity: 1, scale: 1.15, duration: .45, ease: 'power2.out' })
            .set(humana, { opacity: 0 }).set(asesina, { opacity: 1 })
            .to(destello, { opacity: 0, scale: 1.4, duration: .7, ease: 'power1.out' })
            .to(hada, { x: base.width + 80, y: -120, opacity: 0, duration: .9, ease: 'power1.in' }, '<')
            .call(() => { hada.remove(); try { sessionStorage.setItem('mce-transformada', '1'); } catch (e) { /* sin almacenamiento */ } });
        })
        .to({}, { duration: 2.3 })
        .to(medallas, { opacity: 1, x: 0, duration: .5, stagger: .12 }, '-=.7');
    },
  });

  // ---------------------------------------------------------- 5. desarrollo: un proyecto por paso, cada uno en su marco de papel
  const dev = '#desarrollo';
  const vitrina = document.createElement('iframe'); vitrina.title = 'Magical Alliance, la tienda en vivo'; vitrina.loading = 'lazy'; vitrina.allow = 'clipboard-write';
  vitrina.dataset.src = 'https://manecist.github.io/Ecommerce-Portafolio-Final-M7/#/inicio';
  const puestoArte = () => { const i = document.createElement('img'); i.className = 'tienda-arte'; i.src = 'assets/pergamino/puesto.webp'; i.alt = 'Puesto de la tienda Magical Alliance'; i.draggable = false; return i; };
  // las etiquetas de la repisa agregan ese producto al carrito (posición en % del dibujo del puesto)
  const ETIQUETAS = [   // cada cosa de las repisas es un producto del catálogo M4 (posición en % del dibujo del puesto)
    { id: 59, x: 6.5, y: 39, w: 8.5, h: 27, n: 'Vestido Princes' }, { id: 56, x: 15.5, y: 39, w: 9, h: 27, n: 'Vestido Magical' },
    { id: 65, x: 26.5, y: 36, w: 8, h: 9, n: 'Zap Magic' }, { id: 13, x: 35, y: 37, w: 5, h: 8, n: 'Cosmetiqueros 01' },
    { id: 25, x: 26.5, y: 49, w: 14, h: 9, n: 'Bases Col' }, { id: 31, x: 28, y: 62, w: 6, h: 11, n: 'Sombra Ojos' },
    { id: 14, x: 35, y: 63, w: 7, h: 10, n: 'Cosmetiqueros 02' }, { id: 1, x: 18, y: 68, w: 10, h: 8, n: 'Anillo Magic' },
    { id: 10, x: 41.5, y: 35, w: 7, h: 12, n: 'Cartera Magic' }, { id: 9, x: 49, y: 35, w: 7, h: 12, n: 'Cartera Sailor' }];
  const etiqueta = t => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'tienda-etiqueta'; b.setAttribute('aria-label', 'Agregar ' + t.n + ' al carrito'); b.title = 'Agregar ' + t.n;
    b.style.cssText = `left:${t.x}%;top:${t.y}%;width:${t.w}%;height:${t.h}%`;
    b.addEventListener('click', () => {
      const sel = $('#m4-product'), op = sel && sel.querySelector(`option[data-product-id="${t.id}"]`); if (!op) return;
      sel.value = op.value; op.selected = true; $('#m4-qty').value = 1; $('#m4-add')?.click();
      const r = b.getBoundingClientRect(); if (window.Magia) Magia.chispas(r.left + r.width / 2, r.top + r.height / 2, { n: 24, vel: 3 });
    });
    return b;
  };
  // el letrero y la boleta se sacan de la caja ANTES de mover la caja al mesón
  const tiendaPuesto = () => { const letrero = div('tienda-letrero', pasoCaja(1, 'Elige tus productos'), $('#m4-picker')), boleta = div('tienda-boleta', $('#m4-recibo'));
    // la libreta con los 68 productos se abre desde una cinta (el puesto queda grande); se cierra con la ✕
    const abrir = document.createElement('button'); abrir.type = 'button'; abrir.className = 'tienda-abre-libreta'; abrir.textContent = '✦ Ver los 68 productos';
    const cerrar = document.createElement('button'); cerrar.type = 'button'; cerrar.className = 'tienda-cierra-libreta'; cerrar.setAttribute('aria-label', 'Cerrar la libreta'); cerrar.textContent = '✕';
    letrero.prepend(cerrar); abrir.addEventListener('click', () => letrero.classList.toggle('abierta')); cerrar.addEventListener('click', () => letrero.classList.remove('abierta'));
    $('#m4-add')?.addEventListener('click', () => letrero.classList.remove('abierta'));
    // con la boleta de vista previa oculta, una pequeña línea bajo la pantalla de la caja muestra lo que se paga con el teclado
    const pago = $('#m4-paid'), linea = document.createElement('output'); linea.className = 'caja-pago'; linea.setAttribute('aria-live', 'polite');
    const ver = () => { const v = Number(String($('#m4-paid')?.value || '').replace(/\D/g, '')) || 0; linea.textContent = v ? 'Pagas $' + v.toLocaleString('es-CL') : 'Paga con el teclado'; };
    $('#caja .register-marquee')?.after(linea); ver(); setInterval(ver, 300);
    // todo en un solo puesto, como la maqueta aprobada: repisas que se tocan, la caja registradora sobre el mesón y la vitrina,
    // que muestra la tienda en vivo (M7) o la caja M4 para elegir y revisar el pedido; la boleta sale de la caja sobre el mantel
    const pestanaVitrina = (t, cual) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = t; b.dataset.vista = cual; return b; };
    const selector = div('vitrina-pestanas', pestanaVitrina('✦ Elegir y pagar', 'caja'), pestanaVitrina('Tienda en vivo · M7', 'web'));
    // el catálogo: los 68 productos de la caja M4 como tarjetas por categoría; tocar una tarjeta la agrega al pedido
    const sel = letrero.querySelector('#m4-product'), chips = div('catalogo-chips'), grilla = div('catalogo-grilla');
    const grupos = sel ? [...sel.querySelectorAll('optgroup')] : [];
    const verGrupo = g => {
      chips.querySelectorAll('button').forEach(b => b.classList.toggle('activo', b.textContent === g.label));
      grilla.replaceChildren(...[...g.querySelectorAll('option')].map(op => {
        const [nombre, precio] = op.textContent.split(' · '); const t = document.createElement('button'); t.type = 'button'; t.className = 'catalogo-item';
        t.innerHTML = '<b></b><span></span><i>＋</i>'; t.querySelector('b').textContent = nombre; t.querySelector('span').textContent = precio || '';
        t.addEventListener('click', () => { sel.value = op.value; op.selected = true; $('#m4-qty').value = 1; $('#m4-add')?.click(); t.classList.remove('sumado'); void t.offsetWidth; t.classList.add('sumado'); });
        return t;
      }));
    };
    grupos.forEach(g => { const b = document.createElement('button'); b.type = 'button'; b.textContent = g.label; b.addEventListener('click', () => verGrupo(g)); chips.append(b); });
    if (grupos.length) verGrupo(grupos.find(g => g.label === 'Vestidos') || grupos[0]);
    const vistaCaja = div('vitrina-caja', div('vitrina-col catalogo', pasoCaja(1, 'Elige tus productos'), chips, grilla), div('vitrina-col pedido', pasoCaja(2, 'Tu pedido'), boleta), letrero);
    letrero.hidden = true;   // la libreta con el desplegable queda de respaldo; el catálogo la reemplaza
    // la vitrina muestra siempre la tienda Magical Alliance en vivo (M7); el catálogo y el pedido de la caja M4 van en la tableta del mesón
    const vidrio = div('tienda-vidrio', div('vitrina-web', vitrina));
    const tableta = div('tienda-tableta', div('tableta-pantalla', vistaCaja));
    const mostrarVista = v => { vidrio.dataset.vista = v; selector.querySelectorAll('button').forEach(b => b.classList.toggle('activo', b.dataset.vista === v));
      if (v === 'web' && vitrina.dataset.src) { vitrina.src = vitrina.dataset.src; vitrina.removeAttribute('data-src'); } };
    selector.addEventListener('click', e => { const b = e.target.closest('button'); if (b) mostrarVista(b.dataset.vista); });
    vidrio.dataset.vista = 'web'; if (vitrina.dataset.src) { vitrina.src = vitrina.dataset.src; vitrina.removeAttribute('data-src'); }
    // se compra tocando los productos de las repisas; la caja muestra el total, se paga con su teclado y bota la boleta
    const oculto = div('tienda-oculto', vistaCaja); oculto.hidden = true;
    const pista = document.createElement('p'); pista.className = 'tienda-pista'; pista.textContent = 'Toca un producto de las repisas para llevarlo a la caja · paga con el teclado y cobra';
    // cómo comprar, en tres pasos cortos bajo el puesto
    pista.innerHTML = '<span>1</span> Toca un producto de las repisas <span>2</span> Escribe en el teclado de la caja con cuánto pagas <span>3</span> Pulsa «Cobrar e imprimir boleta»';
    // la boleta impresa se lee completa y ancha, pegada en el vidrio de la vitrina (la ranura de la caja es muy angosta):
    // productos, total, con cuánto se pagó, el medio de pago y el vuelto. «Nueva compra» deja la caja lista otra vez
    const boletaVista = div('tienda-boleta-vista'); boletaVista.hidden = true;
    const nueva = document.createElement('button'); nueva.type = 'button'; nueva.className = 'tienda-boleta-nueva'; nueva.textContent = '✦ Nueva compra';
    nueva.addEventListener('click', () => { boletaVista.hidden = true; window.clearPrintedReceipt?.(); $('#m4-clear')?.click(); });
    const copiarBoleta = () => {
      const out = $('#printer-output'), papel = $('#printed-receipt');
      if (!out || out.hidden || !papel || !papel.childElementCount || !escena.contains(out)) { boletaVista.hidden = true; return; }
      const hoja = papel.cloneNode(true); hoja.removeAttribute('id'); hoja.className = 'tienda-boleta-hoja';
      const pago = hoja.querySelectorAll('.paper-total');   // después de «Pagaste» se indica el medio de pago
      const pagaste = [...pago].find(l => /Pagaste/.test(l.textContent));
      if (pagaste) { const m = document.createElement('div'); m.className = 'paper-total paper-medio'; m.innerHTML = '<span>Medio de pago</span><b>Efectivo (teclado de la caja)</b>'; pagaste.after(m); }
      boletaVista.replaceChildren(hoja, nueva); boletaVista.hidden = false;
      if (window.Magia) { const r = boletaVista.getBoundingClientRect(); Magia.chispas(r.left + r.width / 2, r.top + 30, { n: 26, vel: 3 }); }
    };
    new MutationObserver(() => requestAnimationFrame(copiarBoleta)).observe($('#printer-output') || document.body, { attributes: true, attributeFilter: ['hidden'] });
    const escena = div('tienda-puesto', puestoArte(), vidrio, ...ETIQUETAS.map(etiqueta), oculto, div('tienda-caja', $('#caja')), boletaVista, pista);
    letrero.classList.add('abierta');
    // la boleta impresa cae desde la ranura de la caja sobre el mantel (alto limitado a la pantalla)
    const ubicar = () => { const out = $('#printer-output'); if (!out || out.hidden || !escena.isConnected) return;
      const libre = innerHeight - out.getBoundingClientRect().top - 12; out.style.maxHeight = Math.max(140, libre) + 'px'; out.style.overflow = 'auto'; };
    new MutationObserver(() => requestAnimationFrame(ubicar)).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['hidden'] });
    return escena; };
    /* versión anterior (caja dentro del puesto)
    return puesto; */
  // en la hoja derecha del cuaderno, cómo se usa (solo en la versión clásica; en el cuento la explica el narrador)
  const guiaCalc = document.createElement('ol'); guiaCalc.className = 'calc-guia';
  ['Pulsa las teclas de la calculadora o usa tu teclado (números, + − × ÷, Enter).', 'En la hoja izquierda se escribe el mismo cálculo en Java, línea por línea.', 'Descarga la app para probarla en tu computador.']
    .forEach(t => { const li = document.createElement('li'); li.textContent = t; guiaCalc.append(li); });
  $('#calc-java .botonera')?.before(guiaCalc);
  const marcosDev = [
    papel('app-calc', nota('Mi primer conjuro en Java fue una calculadora. Pulsa las teclas: al lado se escribe el mismo cálculo en Java.'), div('app-doble', $('#calc-zona'), $('#calc-java'))),
    // la tienda Magical Alliance en un solo puesto: repisas (etiquetas que se pueden tocar), caja registradora en el mesón,
    // la boleta y la tienda web en vivo en la vitrina
    papel('app-tienda app-caja', nota('<b>Magical Alliance</b>: elige en la repisa (o en el letrero), paga en la caja y recibe tu boleta. En la vitrina está la tienda Full Stack Java en vivo. Los 68 productos vienen de <a href="https://github.com/manecist/Ecommerce-Backend-M4" target="_blank" rel="noopener">Ecommerce-Backend-M4 ↗</a>.'),
      tiendaPuesto(),
      $('#dev-m7 .botonera')),
    /* versión anterior: la caja y la vitrina en pasos separados
    papel('app-caja app-tres', ...), papel('app-vitrina', ...), */
    papel('app-banco', $('#banco-card')),
  ];
  const botonesDev = pestanas(['Calculadora Java', 'Tienda Magical Alliance', 'Banco de Evaluaciones']);
  E.push({
    id: 'desarrollo', hada: 'Desarrollo', ev: crear('ev-desarrollo', cabeza(dev), botonesDev, div('papel-marcos', marcosDev)),
    pasos: marcosDev.length, marcos: marcosDev, botones: [...botonesDev.children],
    alMostrar(i) {   // la tienda y el banco en vivo cargan recién al verlos
      this.ev.classList.toggle('tienda-activa', i === 1); this.ev.classList.toggle('banco-activo', i === 2);   // con la tienda, el título se compacta para que el puesto se vea grande
      if (i === 2) window.MCEBanco?.cargar();
    },
    entrar(tl, ev) { sube(tl, $$('.section-head > *', ev)); sube(tl, this.botones, '-=.2', { duration: .35, stagger: .06 }); this.paso(tl, 0, 1, true); },
    paso(tl, i, dir, primero) { cambiarMarco(tl, this, i, dir, primero); },
  });

  // ---------------------------------------------------------- 6-8. diseño e ilustración
  const dis = '#diseno';
  E.push({
    id: 'diseno', hada: 'Diseño e ilustración', ev: crear('ev-diseno', de('.art-context', dis), de('.art-controls', dis), de('.art-compare', dis), de('.art-credit', dis)),
    entrar(tl, ev) {
      sube(tl, $$('.section-head > *', ev));
      sube(tl, [$('.art-context', ev), ...$$('.art-controls .btn', ev)], '-=.2', { stagger: .06 });
      lado(tl, $('.art-card', ev), -1, '-=.1'); lado(tl, $('.art-card.digital', ev), 1, '<');
      crece(tl, $('.art-arrow', ev), '-=.2');
      tl.from($('.art-credit', ev), { opacity: 0, duration: .4 });
    },
  });
  E.push({
    id: 'leyendas', hada: 'Diseño', ev: crear('ev-leyendas', cabeza(dis)),   // el cuaderno «Mi trazo» se arma más abajo
    entrar(tl, ev) { sube(tl, $$('.leyendas-cabeza > *', ev)); crece(tl, $('.ley-cuadro', ev), '-=.2'); crece(tl, $$('.leyendas-grid > *', ev).slice(0, 18), '-=.3', { stagger: .03 }); tl.from($('.leyendas-aviso', ev), { opacity: 0, duration: .4 }, '-=.2'); },
  });
  E.push({
    id: 'historia', ev: crear('ev-historia', de('.design-story', dis)),
    entrar(tl, ev) {
      tl.from($('.fairy-design', ev), { opacity: 0, x: -50, y: -30, duration: .9, ease: 'power2.out' });
      sube(tl, $$('.design-story > div:last-child > :not(.creative-journey)', ev), '-=.5');
      sube(tl, $$('.journey-step', ev), '-=.2', { stagger: .1 });
    },
  });

  // ---------------------------------------------------------- 9. datos: los cinco tableros de salud, en su marco de papel
  const dat = '#datos';
  E.push({
    id: 'datos', hada: 'Datos de salud', ev: crear('ev-datos', cabeza(dat), papel('app-tableros activo', $('#tableros'))),
    entrar(tl, ev) {
      sube(tl, $$('.section-head > *', ev));
      crece(tl, $('.app-tableros', ev), '-=.2', { duration: .6 });
      sube(tl, $$('.tab-tema', ev), '-=.3', { stagger: .06, duration: .35 });
    },
  });

  // ---------------------------------------------------------- 10-11. trayectoria
  const tra = '#trayectoria', explic = $$('.transition-explanation', $(tra));
  /* antes: el camino de íconos en una franja y la tarjeta de matrona en su propia escena
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
  */
  // el diario mural del CESFAM: la historia de matrona en la hoja grande, los lugares donde trabajó en fotos clavadas,
  // la campaña PAP en el afiche y, en la planilla con visto bueno, las capacidades que se suman (de Salud a Studios Conari)
  function muralTrayectoria() {
    const salud = $('#salud-card'), ps = $$('p', salud);
    const el = (tag, clase, txt) => { const n = document.createElement(tag); if (clase) n.className = clase; if (txt != null) n.textContent = txt; return n; };
    /* antes: la historia de matrona en dos párrafos (no cabía entera en la hoja)
    const hoja = div('mural-hoja', el('span', 'mural-chip', salud.querySelector('.chip')?.textContent || ''), el('h3', null, 'La salud fue una base, no un capítulo perdido.'),
      el('p', null, ps[0]?.textContent.trim().replace(/\s+/g, ' ')), el('p', null, ps[1]?.textContent.trim().replace(/\s+/g, ' ')));
    */
    // la hoja grande: la trayectoria laboral (dónde trabajó y qué hizo, del CV); lo que estudió está en Formación
    const PASOS = [
      ['2019–20', 'Matrona clínica y de atención primaria', 'Hospital Dr. José Luis Arraño, Andacollo', 'Lactancia, programa VIH, urgencias y cápsula Chile Crece Contigo'],
      ['2019–21', 'Matrona clínica', 'Hospital San José de Coronel', 'Emergencias obstétricas, preparto, parto y puerperio'],
      ['2021', 'Matrona', 'CESFAM O’Higgins', 'Planillas Excel de PAP y mamografía; condón femenino'],
      ['2022–23', 'Matrona · Programa de Cáncer Cervicouterino', 'SS Metropolitano Sur Oriente', 'Campañas de PAP, seguimiento de positivos y derivaciones'],
      ['2024', 'Atención en sala de ventas', 'Daily Fresh', ''],
      ['2024', 'Educadora', 'Academia Aliwen', 'Matemáticas, Ciencias y Lenguaje'],
      ['2026', 'Socia fundadora y administradora', 'Studios Conari SpA', 'Diseño editorial, ilustración, 3D y desarrollo web'],
    ];
    const hoja = div('mural-hoja', el('h3', null, 'Mi trayectoria'),
      div('mural-pasos', PASOS.map(([a, t, d, q]) => div('mural-paso', el('b', null, a), el('span', null, t), el('small', null, d), q ? el('i', null, q) : null))));
    const fotos = [['Hospital San José', 'Coronel · 2019–2021'], ['CESFAM O’Higgins', 'Atención primaria · 2021'], ['Hospital Dr. José Luis Arraño', 'Andacollo · 2019–2020']]
      .map(([t, s], i) => div('mural-foto mural-foto-' + (i + 1), el('b', null, t), el('small', null, s)));
    // la planilla PAP vive en «Matrona hoy»: el afiche de la campaña lleva directo a ella
    const verPap = el('a', 'mural-ver-pap', 'Ver la planilla PAP →'); verPap.href = '#matrona-hoy';
    verPap.addEventListener('click', () => setTimeout(() => window.MCESala?.planilla(), 950));
    const afiche = div('mural-afiche', el('b', null, 'Campaña PAP'), el('span', null, 'Programa de Cáncer Cervicouterino · SS Metropolitano Sur Oriente · 2022–2023'),
      el('small', null, 'Tomas de PAP, seguimiento de positivos y derivaciones'), verPap);
    const filas = [...$$('.transition-path a', $(tra))].map((a, i) => {
      const fin = a.classList.contains('transition-finale');
      const f = el('a', 'mural-fila mural-fila-' + (i + 1)); f.href = a.getAttribute('href');
      f.title = fin ? a.querySelector('span')?.textContent || '' : a.querySelector('small')?.textContent || '';
      f.append(el('span', null, fin ? 'Studios Conari ✦' : a.querySelector('span')?.textContent || ''));
      return f;
    });
    const planilla = div('mural-planilla', el('b', 'mural-planilla-titulo', 'Capacidades que se suman'), ...filas);
    const lemaMural = el('p', 'mural-lema', explic[0]?.textContent || '');   // junto a las flores de la esquina de la hoja
    const mural = div('mural', div('mural-tablero', hoja, lemaMural, ...fotos, afiche, planilla));
    // el tablero se arma en píxeles del dibujo (1672 de ancho) y se escala con --k
    new ResizeObserver(() => mural.style.setProperty('--k', (mural.clientWidth / 1672).toFixed(5))).observe(mural);
    return mural;
  }
  E.push({
    id: 'trayectoria', hada: 'Trayectoria', ev: crear('ev-trayectoria', cabeza(tra), muralTrayectoria()),
    entrar(tl, ev) {
      sube(tl, $$('.section-head > *', ev));
      crece(tl, $('.mural-tablero', ev), '-=.2', { duration: .6 });
      sube(tl, $$('.mural-foto, .mural-afiche, .mural-planilla', ev), '-=.3', { stagger: .08 });
      lado(tl, $$('.mural-fila', ev), -1, '-=.2', { stagger: .06, duration: .35 });
    },
  });
  // la matrona hoy: cápsulas en video, páginas interactivas y planilla PAP
  /* antes: todo en un panel de papel con pestañas
  E.push({
    id: 'matrona', ev: crear('ev-matrona', papel('app-matrona activo', $('#matrona-hoy'))),
    entrar(tl, ev) { crece(tl, $('.app-matrona', ev), 0, { duration: .6 }); sube(tl, $$('.mh-cabeza > *, .mh-tab', ev), '-=.3', { stagger: .06 }); },
    salir() { window.MCEMatrona?.pausar(); },
  });
  */
  // la sala de espera de la matrona (sala.webp, 1672 × 941): las cápsulas en la tele, las páginas interactivas en los
  // folletos del revistero y la planilla PAP en la carpeta de la mesita. Cada página o la planilla se abre en un folleto grande
  function salaEspera() {
    const mh = $('#matrona-hoy'), M = window.MCEMatrona || {}, SITIO = M.sitio || 'https://manecist.github.io/Matrona/';
    const el = (tag, clase, txt) => { const n = document.createElement(tag); if (clase) n.className = clase; if (txt != null) n.textContent = txt; return n; };
    // la tele: la cápsula a pantalla completa (se reproduce ahí mismo); flechas para pasar de cápsula y la lista como menú del televisor
    const videos = $('.mh-videos', mh), lista = $('.mh-capsulas', videos);
    const tele = div('sala-tele', videos);
    const pasar = d => { const bs = $$('.mh-capsula', lista), i = bs.findIndex(b => b.classList.contains('activo')); bs[(i + d + bs.length) % bs.length]?.click(); };
    const flechaA = el('button', 'sala-tele-flecha ant', '‹'), flechaS = el('button', 'sala-tele-flecha sig', '›'), menuTele = el('button', 'sala-tele-menu', '☰ Cápsulas');
    [flechaA, flechaS, menuTele].forEach(b => { b.type = 'button'; });
    flechaA.setAttribute('aria-label', 'Cápsula anterior'); flechaS.setAttribute('aria-label', 'Cápsula siguiente');
    flechaA.addEventListener('click', () => pasar(-1)); flechaS.addEventListener('click', () => pasar(1));
    menuTele.addEventListener('click', () => tele.classList.toggle('lista-abierta'));
    lista.addEventListener('click', e => { if (e.target.closest('.mh-capsula')) tele.classList.remove('lista-abierta'); });
    tele.append(flechaA, flechaS, menuTele);
    // un botón grande de play al centro (y tocar la pantalla pausa o sigue), como en un televisor
    const video = $('video', videos), play = el('button', 'sala-tele-play'); play.type = 'button'; play.setAttribute('aria-label', 'Reproducir cápsula'); play.append(el('span', null, '▶'));
    const alternar = () => { if (video.paused) video.play().catch(() => {}); else video.pause(); };
    play.addEventListener('click', alternar);
    video.addEventListener('click', e => { e.preventDefault(); alternar(); });
    const estado = () => tele.classList.toggle('reproduciendo', !video.paused);
    ['play', 'pause', 'ended'].forEach(t => video.addEventListener(t, estado));
    tele.append(play);
    // el folleto grande que se abre al tocar un folleto o la carpeta
    const dlg = el('dialog', 'sala-dialogo'), dlgCuerpo = el('div', 'sala-dialogo-cuerpo'), cerrar = el('button', 'sala-cerrar', '✕');
    // la tableta o la carpeta sale desde el objeto que se tocó (crece desde ahí) y al cerrar vuelve a él
    let origen = null;
    const desdeOrigen = () => {
      if (!origen) return null; const o = origen.getBoundingClientRect(), d = dlg.getBoundingClientRect();
      return `translate(${(o.left + o.width / 2 - (d.left + d.width / 2)).toFixed(0)}px, ${(o.top + o.height / 2 - (d.top + d.height / 2)).toFixed(0)}px) scale(${Math.max(.06, o.width / d.width).toFixed(3)})`;
    };
    const abrirDesde = desde => {
      origen = desde || null; dlg.showModal();
      const t = desdeOrigen(); if (t) dlg.animate([{ transform: t, opacity: .3 }, { transform: 'none', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' });
    };
    const cerrarHacia = () => {
      const t = desdeOrigen(); if (!t || !dlg.open) { dlg.close(); return; }
      dlg.animate([{ transform: 'none', opacity: 1 }, { transform: t, opacity: .2 }], { duration: 320, easing: 'cubic-bezier(.5,0,.8,.4)' }).onfinish = () => dlg.close();
    };
    cerrar.type = 'button'; cerrar.setAttribute('aria-label', 'Cerrar'); cerrar.addEventListener('click', cerrarHacia);
    dlg.addEventListener('cancel', e => { e.preventDefault(); cerrarHacia(); });
    dlg.append(cerrar, dlgCuerpo); dlg.addEventListener('click', e => { if (e.target === dlg) cerrarHacia(); });
    const pap = $('.mh-pap', mh);
    dlg.addEventListener('close', () => { if (pap && pap.parentNode === dlgCuerpo) mh.append(pap); dlgCuerpo.replaceChildren(); });
    document.body.append(dlg);
    const abrirPagina = (p, desde) => {
      const marco = el('iframe'); marco.title = p.t; marco.addEventListener('load', () => marco.classList.add('cargada'), { once: true }); marco.src = SITIO + p.url;
      const abrir = el('a', 'sala-abrir', 'Abrir en otra pestaña ↗'); abrir.href = SITIO + p.url; abrir.target = '_blank'; abrir.rel = 'noopener';
      // la página se ve en la pantalla de una tableta mágica: arriba una barra de app con el nombre y qué se puede hacer
      dlgCuerpo.replaceChildren(div('sala-pantalla', div('sala-dialogo-barra', el('b', null, p.e + ' ' + p.t), abrir),
        div('sala-dialogo-hacer', el('span', null, 'Qué puedes hacer:'), ...(p.hacer || []).map(h => el('em', null, h))), marco));
      dlg.classList.remove('sala-planilla'); dlg.classList.add('sala-tableta'); M.pausar?.(); abrirDesde(desde);
    };
    const abrirPlanilla = desde => {
      if (pap) { pap.hidden = false; dlgCuerpo.replaceChildren(pap); }
      dlg.classList.remove('sala-tableta'); dlg.classList.add('sala-planilla'); M.pausar?.(); abrirDesde(desde instanceof Element ? desde : carpeta);
    };
    window.MCESala = { planilla: abrirPlanilla };
    const CORTO = ['Chile Crece Contigo', 'Anticoncep­tivos al toque', 'Torpedo profesional', 'Cáncer', 'ITS', 'Más matronas', 'Mi tesis'];
    const folletos = (M.paginas || []).map((p, i) => {
      const b = el('button', 'sala-folleto sala-folleto-' + (i + 1)); b.type = 'button'; b.title = p.t + ' · ' + p.txt;
      b.append(el('span', 'sala-folleto-ico', p.e), el('span', null, CORTO[i] || p.t)); b.addEventListener('click', () => abrirPagina(p, b)); return b;
    });
    const fPap = el('button', 'sala-folleto sala-folleto-8'); fPap.type = 'button'; fPap.title = 'Planilla PAP';
    fPap.append(el('span', 'sala-folleto-ico', '🧾'), el('span', null, 'Planilla PAP')); fPap.addEventListener('click', () => abrirPlanilla(fPap));
    const fSitio = el('a', 'sala-folleto sala-folleto-9'); fSitio.href = SITIO; fSitio.target = '_blank'; fSitio.rel = 'noopener'; fSitio.title = 'Todo el portafolio de matrona';
    fSitio.append(el('span', 'sala-folleto-ico', '🌸'), el('span', null, 'Todo el sitio'));
    const carpeta = el('button', 'sala-carpeta'); carpeta.type = 'button'; carpeta.title = 'Planilla PAP'; carpeta.append(el('span', null, '🧾 Planilla PAP'));
    carpeta.addEventListener('click', () => abrirPlanilla(carpeta));
    const cinta = el('p', 'eyebrow cinta-nombre', 'Matrona hoy');
    const sala = div('sala', div('sala-capa', tele, ...folletos, fPap, fSitio, carpeta));
    new ResizeObserver(() => sala.style.setProperty('--k', (sala.clientWidth / 1672).toFixed(5))).observe(sala);
    return [div('section-head', div(null, cinta)), sala];
  }
  E.push({
    id: 'matrona', ev: crear('ev-matrona', salaEspera()),
    entrar(tl, ev) { crece(tl, $('.sala', ev), 0, { duration: .6 }); sube(tl, $$('.sala-folleto, .sala-carpeta', ev), '-=.3', { stagger: .04 }); },
    salir() { window.MCEMatrona?.pausar(); },
  });

  // ---------------------------------------------------------- 12. formación
  const form = '#formacion';
  /* antes: escena propia de Formación (repetía las medallas del perfil; sus detalles ahora van en cada medalla)
  E.push({
    id: 'formacion', ev: crear('ev-formacion', cabeza(form), de('.credential-gallery', form), de('.cv-cta', form)),
    entrar(tl, ev) { sube(tl, $$('.section-head > *', ev)); sube(tl, $$('.credential-gallery article', ev), '-=.2', { stagger: .1 }); sube(tl, $('.cv-cta', ev), '-=.1'); },
  });
  */

  // ---------------------------------------------------------- 13. arcade: el salón de los juegos con sus máquinas
  const arc = '#arcade';
  const acciones = () => div('juego-acciones', ...[['btn juego-salon', '← Volver al salón'], ['btn juego-empezar', '▶ Jugar'], ['btn juego-volver', '← Ver instrucciones']].map(([c, t]) => { const b = document.createElement('button'); b.type = 'button'; b.className = c; b.textContent = t; return b; }));
  const portada = document.createElement('img'); portada.className = 'arcade-portada'; portada.src = 'assets/cuento/cap10/arcade-bloques.webp'; portada.alt = '';
  $('#game-tetris')?.classList.add('active');
  /* antes: cada juego en un papel crema con su portada y el tablero al lado
  const juegos = {
    bloques: papel('app-juego app-bloques', acciones(), portada, ranura($('#game-tetris'))),
    gemas: papel('app-juego app-gemas', acciones(), div('app-doble', div('arcade-dibujo', ranura($('#match-grid'))), div('juego-papel', ranura($('#gema-intro')), ranura($('#gema-guia')), ranura($('#gema-lado'))))),
    estrellas: papel('app-juego app-estrellas', acciones(), div('app-doble', div('arcade-dibujo', ranura($('#constellation-board'))), div('juego-papel', ranura($('#estrellas-intro')), ranura($('#estrellas-lado')), ranura($('#estrellas-leccion'))))),
  };
  */
  // cada juego se juega dentro de la pantalla de su propia máquina (vista de cerca, grande); los puntos y el botón principal
  // van en el tablero de controles de la máquina y las instrucciones en un pergamino al lado
  // las piezas de cada juego se sacan de su panel para ponerlas en la máquina, pero el cuento usa los mismos paneles:
  // cada pieza recuerda su lugar original y vuelve a él mientras se lee el cuento (y regresa a la máquina al volver)
  const piezas = [];
  const pieza = el => { if (el) { const vuelve = document.createComment('pieza'); el.before(vuelve); piezas.push({ el, vuelve }); } return el; };
  const maquina = (n, pantalla, ...tablero) => div('maq-juego maq-' + n, div('maq-pantalla', pieza(pantalla)), div('maq-tablero', ...tablero.map(pieza)));
  const ladoJuego = (...hijos) => div('juego-lado', acciones(), div('juego-lado-texto', ...hijos.map(pieza)));   // el texto se recorre dentro del papel
  const fila = sel => $(sel)?.closest('.score-row');
  const juegos = {
    bloques: papel('app-juego app-bloques jugando', div('maq-escena',
      maquina(1, $('#game-tetris .tetris-frame'), fila('#play-score'), fila('#play-lines'), fila('#play-level'), $('#play-start')),
      // el control táctil (mover, girar, bajar y soltar) va junto a la máquina: en el teléfono queda bajo la pantalla
      pieza($('#game-tetris .control-magico')),
      ladoJuego($('#game-tetris .game-side')))),
    gemas: papel('app-juego app-gemas jugando', div('maq-escena',
      maquina(2, $('#match-grid'), fila('#match-score'), $('#match-reset')),
      ladoJuego($('#gema-intro'), $('#gema-lado')))),
    estrellas: papel('app-juego app-estrellas jugando', div('maq-escena',
      maquina(3, $('#constellation-board'), fila('#star-progress'), $('#star-reset')),
      ladoJuego($('#estrellas-intro'), $('#estrellas-lado')))),
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
  // el cuento usa estas mismas máquinas (las pide prestadas enteras): cada escena de máquina tiene su nombre
  Object.entries(juegos).forEach(([k, j]) => { const m = j.querySelector('.maq-escena'); if (m) m.id = 'maq-escena-' + k; });
  const devolverPiezas = () => piezas.forEach(p => {
    if (!p.vuelve.isConnected || p.el.closest('.ranura') || p.el.closest('.maq-escena')) return;   // las piezas de las máquinas se quedan en ellas (el cuento pide la máquina entera)
    if (!p.aqui) { p.aqui = document.createComment('pieza-clasica'); p.el.before(p.aqui); }   // su lugar en la versión clásica
    p.vuelve.after(p.el);
  });
  addEventListener('mce-a-libro', devolverPiezas);
  const tomarPiezas = () => piezas.forEach(p => { if (p.aqui && p.aqui.isConnected) p.aqui.after(p.el); });
  let maqTocada = null;   // la máquina del salón que se eligió: el juego crece desde ella
  const abrirJuego = id => {
    const desde = maqTocada?.getBoundingClientRect(); maqTocada = null;
    salon.hidden = !!id; sala.classList.toggle('abierta', !!id); E.find(e => e.id === 'arcade')?.ev.classList.toggle('jugando-arcade', !!id);
    if (flujo) { raiz.classList.toggle('arcade-pantalla', !!id); const ea = E.find(e => e.id === 'arcade'); if (ea) encajar(ea); }
    if (id && desde) requestAnimationFrame(() => {
      const m = $('.app-juego.activo .maq-juego', sala); if (!m) return; const r = m.getBoundingClientRect();
      gsap.fromTo(m, { x: desde.left + desde.width / 2 - (r.left + r.width / 2), y: desde.top + desde.height / 2 - (r.top + r.height / 2), scale: desde.height / r.height, transformOrigin: '50% 50%' },
        { x: 0, y: 0, scale: 1, duration: .7, ease: 'power3.out', clearProps: 'transform' });
      gsap.from($('.app-juego.activo .juego-lado', sala), { opacity: 0, x: 40, duration: .5, delay: .35, clearProps: 'all' });
    });
    Object.entries(juegos).forEach(([k, j]) => j.classList.toggle('activo', k === id));
    if (id && window.Magia) { const r = sala.getBoundingClientRect(); Magia.chispas(r.left + r.width / 2, r.top + 60, { n: 30, vel: 4 }); }
    requestAnimationFrame(() => ajustar(E[actual]));
  };
  salon.addEventListener('click', e => { const m = e.target.closest('.maquina'); if (m) { maqTocada = m; abrirJuego(m.dataset.juego); } });
  addEventListener('keydown', e => { if (e.key === 'Escape' && sala.classList.contains('abierta') && !$('dialog[open]')) { $$('.colgar-app.jugando', sala).forEach(j => j.classList.remove('jugando')); abrirJuego(null); } });
  // en el teléfono el juego se abre a pantalla completa: un botón fijo arriba vuelve al salón
  if (pila) {
    const volver = document.createElement('button'); volver.type = 'button'; volver.className = 'btn arcade-volver-fijo'; volver.textContent = '← Volver al salón'; volver.hidden = true; document.body.append(volver);
    volver.addEventListener('click', () => { $$('.colgar-app.jugando', sala).forEach(j => j.classList.remove('jugando')); abrirJuego(null); });
    new MutationObserver(() => { volver.hidden = !sala.classList.contains('abierta'); document.body.style.overflow = volver.hidden ? '' : 'hidden'; }).observe(sala, { attributes: true, attributeFilter: ['class'] });
  }
  sala.addEventListener('click', e => { if (e.target.closest('.juego-salon')) { e.target.closest('.colgar-app').classList.remove('jugando'); abrirJuego(null); } });
  E.push({
    id: 'arcade', hada: 'Arcade mágico', ev: crear('ev-arcade', cabeza(arc), salon, sala),
    entrar(tl, ev) { sube(tl, $$('.section-head > *', ev)); if (!salon.hidden) sube(tl, $$('.maquina', ev), '-=.2', { stagger: .14, y: 40 }); else sube(tl, sala, '-=.2'); },
  });

  // ---------------------------------------------------------- 14. contacto
  const pie = $('#site > footer');
  E.push({
    id: 'contacto', hada: 'Contacto', ev: crear('ev-contacto', $('#contacto'), pie, $('.nido-escena')),   // como en kdelrio: las crías esperan debajo del pie
    entrar(tl, ev) {
      sube(tl, $('.section-head > *, .section-head > div > *', ev));
      sube(tl, $('.contacto', ev), '-=.2', { stagger: .08 });
      tl.from(pie, { opacity: 0, duration: .5 }, '-=.2');
    },
  });

  // el orden de lectura: primero quién es y de dónde viene (perfil y trayectoria), después lo que hace;
  // «Matrona hoy» queda junto a Datos (las dos son su trabajo actual en salud)
  // la portada con burbujas repetía lo mismo que el perfil: se quita y la página empieza en el perfil profesional
  /* antes: const ORDEN = ['inicio', 'estudio', 'equipo', 'trayectoria', 'desarrollo', 'diseno', 'leyendas', 'historia', 'datos', 'matrona', 'arcade', 'contacto']; */
  const ORDEN = ['equipo', 'estudio', 'trayectoria', 'desarrollo', 'leyendas', 'datos', 'matrona', 'arcade', 'contacto'];
  // «Del papel a lo digital» (historia) y «Por qué dibujo» (diseno) se cuentan ahora dentro del cuaderno Mi trazo
  for (let k = E.length - 1; k >= 0; k--) if (!ORDEN.includes(E[k].id)) { E[k].ev.remove(); E.splice(k, 1); }
  E.sort((a, b) => ORDEN.indexOf(a.id) - ORDEN.indexOf(b.id));

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
  E.filter(e => e.botones).forEach(e => e.botones.forEach((b, k) => b.addEventListener('click', () => { if (flujo) { actual = E.indexOf(e); paso = k; marcar(e, k); encajar(e); return; } if (E[actual] === e) irPaso(k); })));

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
  // una sola pasada: el hada cruza con su estela, la estela cubre la pantalla, se cambia la sección y la luz se disuelve
  // mostrando el capítulo nuevo con su propio título (sin cartel aparte ni segunda pasada)
  function hechizo(texto, alCubrir, alFin) {
    lienzo.width = W(); lienzo.height = innerHeight; ctx.clearRect(0, 0, lienzo.width, lienzo.height); pintarNiebla();
    magia.style.visibility = 'visible'; nombreHada.textContent = ''; gsap.set(lienzo, { opacity: 1 });
    const velo = { a: 0 };
    const tl = gsap.timeline({ onComplete: () => { magia.style.visibility = 'hidden'; ctx.clearRect(0, 0, lienzo.width, lienzo.height); gsap.set(lienzo, { opacity: 1 }); alFin && alFin(); } });
    tl.add(pasada(false, 1.25))
      .to(velo, { a: 1, duration: .2, onUpdate() { ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = velo.a; ctx.drawImage(niebla, 0, 0); ctx.globalAlpha = 1; } }, '-=.2')
      .call(() => alCubrir && alCubrir())
      .to(lienzo, { opacity: 0, duration: .55, ease: 'power1.out' })
      .call(() => { if (window.Magia) Magia.chispas(40, innerHeight - 40, { n: 30, vel: 5, colores: TONOS }); }, null, '<');
    return tl;
  }
  /* versión anterior: dos pasadas con el nombre de la sección en la niebla (≈6 s)
  function hechizoDoble(texto, alCubrir, alFin) {
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
  } */

  // ---------------------------------------------------------- Diseño: «Mi trazo», el cuaderno de bocetos de Ari
  // Cuenta su camino del papel a lo digital con sus propias obras: en la hoja derecha se elige (Mi camino, Papel o sus dibujos
  // por tipo) y en la hoja izquierda aparece la obra; los dibujos se dibujan solos con un lápiz y terminan nítidos y completos.
  // La galería de leyendas la usa también el cuento: sus filtros y su muro de cuadritos se toman prestados (piezas) y vuelven a su lugar.
  /* antes: el cuaderno se armaba dentro de #leyendas (le cambiaba títulos y estructura) y el cuento mostraba la galería desarmada */
  const rejilla = $('#leyendas-grid');
  const evLey = E.find(e => e.id === 'leyendas')?.ev;
  if (rejilla && evLey) {
    const el = (tag, clase, txt) => { const n = document.createElement(tag); if (clase) n.className = clase; if (txt != null) n.textContent = txt; return n; };
    const cuadro = document.createElement('figure'); cuadro.className = 'ley-cuadro';
    cuadro.innerHTML = '<div class="ley-marco"><img class="ley-foto" alt="" draggable="false"></div><figcaption><b></b><span></span><button type="button" class="btn ghost ley-ver">⤢ Ver en grande</button></figcaption>';
    const cFoto = $('.ley-foto', cuadro), cTit = $('b', cuadro), cTxt = $('figcaption span', cuadro), marco = $('.ley-marco', cuadro);
    const muro = div('ley-muro');
    const museo = div('ley-museo', cuadro, muro);
    evLey.firstElementChild.append(museo, el('p', 'leyendas-aviso', $('#leyendas .leyendas-aviso')?.textContent || ''));

    // las pestañas propias del cuaderno y, al lado, los filtros de la galería (Todas, Leyendas, Proceso, Regalos)
    const filtros = $('#leyendas .leyendas-filtros');
    const tabCamino = el('button', null, 'Mi camino'), tabPapel = el('button', null, 'Papel');
    [tabCamino, tabPapel].forEach(b => { b.type = 'button'; b.setAttribute('aria-pressed', 'false'); });
    const pestanasCuaderno = div('ley-pestanas', tabCamino, tabPapel, pieza(filtros));

    // Mi camino: por qué dibuja y sus cuatro etapas (lo que antes era la escena «Dibujo porque…»)
    const ETAPAS = [
      ['01', 'Papel y pintura', 'Observar y dar forma', 'Mi punto de partida fue el trazo a mano, el color y la emoción: pintar por gusto, sin una formación formal.', 'assets/galeria/papel-luna-sakura.webp', 'foto'],
      ['02', 'Line art y color', 'Llevar la idea a la pantalla', 'Pasé al dibujo digital probando líneas, paletas y vestuario para construir un lenguaje propio.', 'assets/galeria/digital-lineart.webp', 'dibujo'],
      ['03', 'Personajes e historias', 'Crear una identidad', 'Relaciono expresiones, narrativa gráfica y estilo para que cada personaje comunique.', 'assets/galeria/expressions.webp', 'dibujo'],
      ['04', 'Exploración 3D', 'Ampliar las posibilidades', 'Hoy sumo Blender, la preparación de recursos y la impresión 3D en PLA, y sigo aprendiendo.', 'assets/emblema-conari-magico.webp', 'foto'],
    ];
    const camino = div('ley-camino',
      el('h4', null, 'Dibujo porque me gusta transformar ideas en imágenes'),
      el('p', null, 'Me inspiran el anime, la fantasía, la magia y las leyendas de Chile y los Andes. Aprendo experimentando, redibujando y pintando.'),
      el('ol', 'ley-etapas'));
    const etapas = ETAPAS.map(([n, t, s, txt, src, modo]) => {
      const b = el('button', 'ley-etapa'); b.type = 'button';
      b.append(el('span', 'ley-etapa-num', n), el('b', null, t), el('small', null, s));
      b.addEventListener('click', () => { etapas.forEach(o => o.classList.toggle('elegida', o === b)); mostrar(src, t, txt, modo); });
      const li = el('li'); li.append(b); $('.ley-etapas', camino).append(li); return b;
    });

    // Papel: fotos de sus obras tradicionales (no se «dibujan»: son fotos pegadas en la hoja)
    const PAPEL = [
      ['assets/galeria/papel-luna-sakura.webp', 'Transición de soledad a alegría', 'Pintura a mano: un lobo bajo la luna junto a un cerezo en flor.'],
      ['assets/galeria/papel-amerikano.webp', 'Amerikano', 'Dibujo a mano con personajes de armadura y alas.'],
      ['assets/galeria/arte-panorama-kevin.jpeg', 'Panorama', 'Lámina panorámica dibujada y pintada a mano.'],
    ];
    const papelGrid = div('ley-papel', PAPEL.map(([src, t, txt]) => {
      const b = el('button', 'obra ley-foto-mini'); b.type = 'button';
      const im = el('img'); im.src = src; im.alt = t; im.draggable = false; b.append(im, el('span', 'obra-nombre', t));
      b.addEventListener('click', () => { $$('.ley-foto-mini', papelGrid).forEach(o => o.classList.toggle('elegida', o === b)); mostrar(src, t, txt, 'foto'); });
      return b;
    }));
    muro.append(pestanasCuaderno, camino, papelGrid, pieza(rejilla));

    let vistaMuro = '';
    const verMuro = v => {
      vistaMuro = v; muro.dataset.vista = v;
      tabCamino.setAttribute('aria-pressed', String(v === 'camino')); tabPapel.setAttribute('aria-pressed', String(v === 'papel'));
      if (v !== 'dibujos') $$('button', filtros).forEach(b => b.setAttribute('aria-pressed', 'false'));
      if (v === 'camino') etapas[0].click();
      if (v === 'papel') $('.ley-foto-mini', papelGrid)?.click();
      if (v === 'dibujos') destacar(rejilla.firstElementChild);
    };
    tabCamino.addEventListener('click', () => verMuro('camino'));
    tabPapel.addEventListener('click', () => verMuro('papel'));
    filtros?.addEventListener('click', e => { if (e.target.closest('button') && vistaMuro !== 'dibujos') setTimeout(() => verMuro('dibujos')); });

    // la hoja izquierda: una foto pegada o un dibujo que se dibuja solo
    const lienzo = document.createElement('canvas'); lienzo.className = 'ley-lienzo'; lienzo.setAttribute('role', 'img');
    const lapiz = document.createElement('span'); lapiz.className = 'ley-lapiz'; lapiz.setAttribute('aria-hidden', 'true');
    lapiz.innerHTML = '<svg viewBox="0 0 64 64"><path d="M50 4l10 10-34 34-14 4 4-14z" fill="#f6a9cc" stroke="#6a2c55" stroke-width="2"/><path d="M42 12l10 10" stroke="#6a2c55" stroke-width="2"/><path d="M50 4l10 10 3-3a3 3 0 0 0 0-4l-6-6a3 3 0 0 0-4 0z" fill="#d9b56a" stroke="#6a2c55" stroke-width="2"/><path d="M16 38l10 10-14 4z" fill="#fbe3c8" stroke="#6a2c55" stroke-width="2"/><path d="M12 52l-2 2 4-1z" fill="#4a2556"/></svg>';
    marco.append(lienzo, lapiz);
    [lienzo, cFoto].forEach(n => n.addEventListener('contextmenu', e => e.preventDefault()));
    let dibujo = 0, pendiente = null, actualSrc = '', actualModo = '';
    new ResizeObserver(() => { if (pendiente && marco.clientWidth) dibujar(...pendiente); }).observe(marco);
    function mostrar(src, titulo, texto, modo) {
      actualSrc = src; actualModo = modo; cTit.textContent = titulo; cTxt.textContent = texto || '';
      cuadro.dataset.modo = modo;
      if (modo === 'foto') { dibujo++; lapiz.style.opacity = 0; cFoto.src = src; cFoto.alt = titulo; return; }
      dibujar(src, titulo);
    }
    // el dibujo se ve tal cual es (nítido): el papel del cuaderno se ve a través del blanco porque el lienzo se mezcla «multiplicando»;
    // la marca de agua gris clara se aclara un poco para que no tape las líneas
    function dibujar(src, alt) {
      const yo = ++dibujo, img = new Image();
      img.onload = () => {
        if (yo !== dibujo) return;
        const W = marco.clientWidth, H = marco.clientHeight; if (!W || !H) { pendiente = [src, alt]; return; } pendiente = null;
        const k = Math.min(W * .97 / img.width, H * .97 / img.height), w = Math.round(img.width * k), h = Math.round(img.height * k), dpr = Math.min(3, (devicePixelRatio || 1) * 1.5);
        lienzo.width = Math.round(w * dpr); lienzo.height = Math.round(h * dpr); lienzo.style.width = w + 'px'; lienzo.style.height = h + 'px'; lienzo.setAttribute('aria-label', alt);
        const mk = () => { const c = document.createElement('canvas'); c.width = lienzo.width; c.height = lienzo.height; return c; };
        const color = mk(), cx = color.getContext('2d'); cx.imageSmoothingQuality = 'high'; cx.drawImage(img, 0, 0, color.width, color.height);
        const d = cx.getImageData(0, 0, color.width, color.height), p = d.data;
        const lineas = mk(), lx = lineas.getContext('2d'), dl = lx.createImageData(color.width, color.height), q = dl.data;
        for (let i = 0; i < p.length; i += 4) {
          const mx = Math.max(p[i], p[i + 1], p[i + 2]), mn = Math.min(p[i], p[i + 1], p[i + 2]), lum = (p[i] + p[i + 1] + p[i + 2]) / 3;
          if (mx - mn < 28 && lum > 175) { const f = .45; p[i] = 255 - (255 - p[i]) * f; p[i + 1] = 255 - (255 - p[i + 1]) * f; p[i + 2] = 255 - (255 - p[i + 2]) * f; }   // marca de agua más suave
          const tinta = lum < 150 ? Math.min(1, (150 - lum) / 60) : 0;   // el boceto: solo los trazos oscuros
          q[i] = 74; q[i + 1] = 37; q[i + 2] = 86; q[i + 3] = Math.round(tinta * 230);
        }
        cx.putImageData(d, 0, 0); lx.putImageData(dl, 0, 0);
        const ctx = lienzo.getContext('2d'), mascara = mk(), mctx = mascara.getContext('2d');
        const final = () => { ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, lienzo.width, lienzo.height); ctx.drawImage(color, 0, 0); lapiz.style.opacity = 0; };
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) { final(); return; }
        const pasadas = [{ capa: lineas, ms: 1400, ancho: .08 }, { capa: color, ms: 1200, ancho: .12 }];
        let n = 0, t0 = performance.now(), hechoLineas = false, prev = null;
        const zig = (u, filas) => { const f = Math.min(filas - 1, Math.floor(u * filas)), v = u * filas - f; return [f % 2 ? 1 - v : v, (f + .5) / filas]; };
        const paso = ahora => {
          if (yo !== dibujo) return;
          const ps = pasadas[n], u = Math.min(1, (ahora - t0) / ps.ms), [x, y] = zig(u, Math.round(1 / ps.ancho)), X = x * lienzo.width, Y = y * lienzo.height;
          mctx.lineCap = 'round'; mctx.lineWidth = lienzo.height * ps.ancho * 1.8; mctx.strokeStyle = '#000';
          if (prev) { mctx.beginPath(); mctx.moveTo(prev[0], prev[1]); mctx.lineTo(X, Y); mctx.stroke(); } prev = [X, Y];
          ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, lienzo.width, lienzo.height);
          if (hechoLineas) ctx.drawImage(lineas, 0, 0);
          const tmp = mk(), tx = tmp.getContext('2d'); tx.drawImage(mascara, 0, 0); tx.globalCompositeOperation = 'source-in'; tx.drawImage(ps.capa, 0, 0); ctx.drawImage(tmp, 0, 0);
          lapiz.style.opacity = 1; lapiz.style.transform = `translate(${(lienzo.offsetLeft + x * w).toFixed(1)}px, ${(lienzo.offsetTop + y * h).toFixed(1)}px)`;
          if (u < 1) { requestAnimationFrame(paso); return; }
          if (n === 0) { hechoLineas = true; n = 1; t0 = performance.now(); mctx.clearRect(0, 0, mascara.width, mascara.height); prev = null; requestAnimationFrame(paso); return; }
          final();   // al terminar queda el dibujo completo, igual al original
        };
        requestAnimationFrame(paso);
        setTimeout(() => { if (yo === dibujo) { dibujo++; final(); } }, 4200);   // aunque la pestaña quede en segundo plano, siempre termina completo
      };
      img.src = src;
    }
    // los dibujos de la galería (leyendas, procesos y regalos)
    let elegida = null;
    const destacar = b => {
      if (!b) return; elegida = b;
      const im = b.querySelector('img'), alt = im.alt || '', corte = alt.indexOf('. ');
      mostrar(im.src, b.querySelector('.obra-nombre')?.textContent || alt.slice(0, corte), corte >= 0 ? alt.slice(corte + 2) : '', 'dibujo');
      $$('.obra', rejilla).forEach(o => o.classList.toggle('elegida', o === b));
    };
    rejilla.addEventListener('click', e => { if (!museo.contains(rejilla)) return; const b = e.target.closest('.obra'); if (!b || b._directo) return; e.stopImmediatePropagation(); destacar(b); }, true);
    new MutationObserver(() => { if (museo.contains(rejilla) && vistaMuro === 'dibujos') destacar(rejilla.firstElementChild); }).observe(rejilla, { childList: true });
    // ver en grande: los dibujos en el visor de la galería (mismo marco para todos); las fotos de papel, en un visor simple
    const visorFoto = document.createElement('dialog'); visorFoto.className = 'visor ley-visor-foto'; visorFoto.setAttribute('aria-label', 'Obra ampliada');
    visorFoto.innerHTML = '<figure><div class="visor-img"><img alt="" draggable="false"></div><figcaption><b></b><span></span></figcaption></figure><button type="button" class="visor-cerrar" aria-label="Cerrar">✕</button>';
    document.body.append(visorFoto);
    $('.visor-cerrar', visorFoto).addEventListener('click', () => visorFoto.close());
    visorFoto.addEventListener('click', e => { if (e.target === visorFoto) visorFoto.close(); });
    const ampliar = () => {
      if (actualModo === 'dibujo' && elegida && vistaMuro === 'dibujos') { elegida._directo = true; elegida.click(); elegida._directo = false; return; }
      const im = $('img', visorFoto); im.src = actualSrc; im.alt = cTit.textContent; $('b', visorFoto).textContent = cTit.textContent; $('span', visorFoto).textContent = cTxt.textContent;
      visorFoto.showModal();
    };
    $('.ley-ver', cuadro).addEventListener('click', ampliar); lienzo.addEventListener('click', ampliar); cFoto.addEventListener('click', ampliar);
    // al volver del cuento la galería vuelve al cuaderno: se muestra lo que estaba elegido
    addEventListener('mce-a-clasico', () => { if (vistaMuro === 'dibujos') destacar(rejilla.firstElementChild); });
    verMuro('camino');
  }

  // ---------------------------------------------------------- destellos en los bordes: aparecen aquí y allá, alternados, sobre los cuadros de la escena
  const CUADROS = '.studio-brand-card, .service-gallery article, .service-more article, .role-node, .perfil-pro, .leyendas, .design-story, .health-card, .credential-gallery article, .cv-cta, .oraculo-form, .oraculo-viz, .transition-path a, .papel-app.activo';   // (sin .contacto: los destellos tapaban los correos)
  const capaBrillos = div('brillos-borde'); capaBrillos.setAttribute('aria-hidden', 'true'); document.body.append(capaBrillos);
  const TONOS_BORDE = ['#fff6d8', '#f3d48a', '#f5a8cf', '#d9c4ff', '#bfe9ff'];
  setInterval(() => {
    if (document.hidden || bloqueada() || magia.style.visibility === 'visible') return;
    if (!E[actual]) return;
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
  const NOMBRE = { inicio: 'Inicio', estudio: 'Studios Conari', equipo: 'Mi perfil', desarrollo: 'Desarrollo', diseno: 'Diseño e ilustración', leyendas: 'Mi trazo', historia: 'Por qué dibuja', datos: 'Datos de salud', trayectoria: 'Trayectoria', salud: 'Matrona', matrona: 'Matrona hoy', formacion: 'Formación', arcade: 'Arcade mágico', contacto: 'Contacto' };
  const SECCION = ['inicio', 'estudio', 'trayectoria', 'desarrollo', 'diseno', 'datos', 'arcade', 'contacto'];
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
    if (!e || pila) return;
    if (flujo) { encajar(e); return; }
    capa.style.top = barra() + 'px';
    const caja = e.ev.firstElementChild;
    caja.style.zoom = ''; e.ev.classList.remove('desborda');
    const disp = e.ev.clientHeight - 70, alto = caja.scrollHeight;   // margen para la pista de la rueda
    // la tienda no se achica: se recorre con la rueda (sus objetos necesitan su tamaño real para usarse)
    // el escritorio de Datos y el diario mural de Trayectoria van a todo el ancho y no se achican: si no cabe, se recorre hacia abajo
    if (['datos', 'trayectoria', 'matrona', 'arcade'].includes(e.id)) { if (alto > e.ev.clientHeight + 2) e.ev.classList.add('desborda'); return; }
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
  ['.papel-marcos', '.tab-panel', '.tab-tira', '.mh-capsulas', '.mh-paginas-lista', '#leyendas-grid', '.creative-journey', '#arcade-zona', '#m7-galeria'].forEach(s => { const n = $(s); if (n) ro.observe(n); });
  $$('img', capa).forEach(img => {                 // las imágenes diferidas cambian el alto al cargar
    img.loading = 'eager';
    if (!img.complete) img.addEventListener('load', () => { if (img.closest('.ev.activa')) requestAnimationFrame(() => ajustar(E[actual])); }, { once: true });
  });

  // ---------------------------------------------------------- navegación
  let actual = 0, paso = 0, ocupado = false, tlEntrada = null;
  const objetivos = tl => [...new Set(tl.getChildren(true, true, false).flatMap(t => t.targets()))].filter(t => t instanceof Element);
  const marcarMenu = e => {
    const zona = { servicios: 'estudio', equipo: 'inicio', leyendas: 'diseno', historia: 'diseno', salud: 'trayectoria', matrona: 'trayectoria' }[e.id] || e.id;
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
    de.salir && de.salir();   // por ejemplo, la cápsula en video se pausa al dejar la escena
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
    E[i].listo?.(E[i].ev);
    raiz.classList.toggle('escena-final', E[i].id === 'contacto');
  }
  window.MCEEscenas = { irA: n => irA(typeof n === 'string' ? E.findIndex(e => e.id === n) : n), avanzar, saltar: n => saltar(typeof n === 'string' ? E.findIndex(e => e.id === n) : n) };

  // ---------------------------------------------------------- entrada: rueda, teclado y enlaces
  const bloqueada = () => site.getAttribute('aria-hidden') === 'true' || site.classList.contains('pintando') || document.body.classList.contains('bloqueado') || $('dialog[open]');
  let acumulado = 0, ultimaRueda = 0, gestoUsado = false;
  addEventListener('wheel', e => {
    if (pila || flujo || bloqueada()) return;
    if (e.target.closest('select') || (e.target.closest('canvas') && document.activeElement === e.target.closest('canvas'))) return;   // jugando con foco, la rueda no cambia de escena
    const ev = E[actual].ev, ahora = performance.now();
    if (ev.classList.contains('desborda')) {          // escena más alta que la pantalla: primero se recorre
      const puede = e.deltaY > 0 ? ev.scrollTop + ev.clientHeight < ev.scrollHeight - 2 : ev.scrollTop > 0;
      if (puede) return;
    }
    const det = e.target.closest('details[open] > div, .table-wrap, .printer-output, .tab-panel, .mh-capsulas, .mh-paginas-lista');   // un recuadro con su propio scroll
    if (det && det.scrollHeight > det.clientHeight + 2) { const puede = e.deltaY > 0 ? det.scrollTop + det.clientHeight < det.scrollHeight - 2 : det.scrollTop > 0; if (puede) return; }
    e.preventDefault();
    if (ahora - ultimaRueda > 220) { gestoUsado = false; acumulado = 0; }   // un gesto nuevo tras una pausa
    ultimaRueda = ahora;
    if (gestoUsado || ocupado) return;                // la inercia del touchpad no encadena escenas
    acumulado += e.deltaY;
    if (Math.abs(acumulado) > 45) { gestoUsado = true; avanzar(acumulado > 0 ? 1 : -1); acumulado = 0; }
  }, { passive: false });
  addEventListener('keydown', e => {
    if (pila || flujo || bloqueada() || e.target.closest('input, select, textarea, canvas, .calc-magica, .match-grid, .constellation-board')) return;
    if (['ArrowDown', 'PageDown'].includes(e.key)) { e.preventDefault(); avanzar(1); }
    if (['ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); avanzar(-1); }
    if (e.key === 'Home') { e.preventDefault(); irA(0); }
    if (e.key === 'End') { e.preventDefault(); irA(E.length - 1); }
  });
  const DESTINO = { inicio: 'equipo', estudio: 'estudio', desarrollo: 'desarrollo', diseno: 'leyendas', leyendas: 'leyendas', datos: 'datos', trayectoria: 'trayectoria', 'salud-card': 'trayectoria', 'matrona-hoy': 'matrona', formacion: 'equipo', arcade: 'arcade', contacto: 'contacto' };
  const indiceDe = id => E.findIndex(e => e.id === id);
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]'); if (!a || !site.contains(a)) return;
    const id = DESTINO[a.getAttribute('href').slice(1)]; if (!id) return;
    e.preventDefault(); $('#main-nav')?.classList.remove('open');
    if (pila || flujo) { irFlujo(indiceDe(id), true); return; }
    irA(indiceDe(id));
  }, true);

  // al volver a la versión clásica (desde el cuento o con un enlace a una sección) se muestra la escena que corresponde
  history.scrollRestoration = 'manual';
  if (site.getAttribute('aria-hidden') === 'true') devolverPiezas();   // la página partió en el cuento
  new MutationObserver(() => {
    if (site.getAttribute('aria-hidden') !== 'false') return;
    tomarPiezas(); window.dispatchEvent(new Event('mce-a-clasico'));
    scrollTo(0, 0);
    const id = DESTINO[location.hash.slice(1)];
    if (pila || flujo) { if (id) irFlujo(indiceDe(id)); return; }
    saltar(id ? indiceDe(id) : actual);
  }).observe(site, { attributes: true, attributeFilter: ['aria-hidden'] });

  // ---------------------------------------------------------- scroll continuo en el computador
  // cada escena mide lo que queda de pantalla bajo el menú y su contenido se achica lo justo para verse entero
  // (se escala con transform y no con zoom: los dibujos que ocupan todo el ancho, como el mural, con zoom volvían a crecer)
  function encajar(e) {
    const alto = innerHeight - barra(), caja = e.ev.firstElementChild;
    // jugando en el Arcade: el juego ocupa toda la pantalla (la máquina se ve de cerca), sin achicarse
    if (e.ev.classList.contains('jugando-arcade')) { e.ev.style.height = ''; caja.style.transform = ''; e.escala = 1; return; }
    // solo los dibujos completos (mural, escritorio, sala) se achican para verse enteros; lo demás va en su tamaño real (la letra no se achica)
    if (!['trayectoria', 'datos', 'matrona'].includes(e.id)) { e.ev.style.height = ''; e.ev.style.minHeight = alto + 'px'; caja.style.transform = ''; e.escala = 1; return; }
    e.ev.style.height = alto + 'px';
    const cs = getComputedStyle(e.ev), dispH = alto - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom),
      dispW = e.ev.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const h = Math.max(1, caja.scrollHeight), w = Math.max(1, caja.scrollWidth);
    // nunca bajo 0,9: la letra de lo importante se tiene que leer (si no cabe entero, la sección es un poco más alta y se baja con la rueda)
    const k = Math.max(.9, Math.min(1, dispH / h, dispW / w)), y = Math.max(0, (dispH - h * k) / 2);
    if (h * k > dispH) e.ev.style.height = (h * k + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom)) + 'px';
    caja.style.transformOrigin = '50% 0';
    caja.style.transform = 'translateY(' + y.toFixed(1) + 'px)' + (k < .995 ? ' scale(' + k.toFixed(4) + ')' : '');
    e.escala = k;
  }
  const encajarTodo = () => { capa.style.top = ''; E.forEach(encajar); };
  function irFlujo(i, suave) {
    const e = E[i]; if (!e) return;
    const y = e.ev.getBoundingClientRect().top + scrollY - barra();
    scrollTo({ top: Math.max(0, y), behavior: suave ? 'smooth' : 'instant' });
  }
  function arrancarFlujo() {
    $$('button', indice).forEach((b, i) => { const n = b.cloneNode(true); n.addEventListener('click', () => irFlujo(i, true)); b.replaceWith(n); });
    velo.classList.add('visible'); raiz.classList.add('escena-contenido');
    let cola = 0; const pedir = () => { cancelAnimationFrame(cola); cola = requestAnimationFrame(encajarTodo); };
    addEventListener('resize', pedir);
    const ro = new ResizeObserver(pedir); E.forEach(e => ro.observe(e.ev.firstElementChild));
    $$('img', capa).forEach(img => { img.loading = 'eager'; if (!img.complete) img.addEventListener('load', pedir, { once: true }); });
    encajarTodo();
    // la escena que ocupa el centro de la pantalla es la «actual»: marca el menú y la estrella del índice
    const vista = () => {
      const medio = innerHeight / 2; let i = E.findIndex(e => { const r = e.ev.getBoundingClientRect(); return r.top <= medio && r.bottom > medio; });
      if (i < 0 || i === actual) return;
      E[actual]?.salir && E[actual].salir();
      actual = i; marcarMenu(E[i]); $$('button', indice).forEach((b, k) => b.classList.toggle('activo', k === i));
    };
    addEventListener('scroll', vista, { passive: true }); actual = -1; vista();
    const ini = DESTINO[location.hash.slice(1)]; if (ini && ini !== 'equipo') requestAnimationFrame(() => irFlujo(indiceDe(ini)));
  }

  // ---------------------------------------------------------- arranque
  if (pila || flujo) {
    // todas las escenas visibles, en orden, sin el índice de estrellas ni la pista de la rueda
    E.forEach(e => { e.ev.classList.add('activa'); capa.append(e.ev); e.listo?.(e.ev); if (e.marcos) marcar(e, 0); });
    pistaRueda.remove();
    if (flujo) { arrancarFlujo(); return; }
    indice.remove();
    // las escenas que son un solo dibujo ancho se ven completas; al tocar una de sus partes con información,
    // la cámara la encuadra entera (la ventana crece para mostrarla grande) y se lee bajando dentro de ella.
    // Las partes están medidas en el dibujo (porcentaje de ancho y alto): [nombre, x, y, ancho, alto]
    const PARTES = {
      '.app-tableros .tableros': ['el escritorio', [['Carpeta y temas', 4, 10, 42, 60], ['Monitor', 46, 13, 50, 52]]],
      '.mural': ['el mural', [['Mi trayectoria', 19, 12, 30, 61], ['Lugares, campaña y planilla', 47, 14, 34, 58]]],
      '.sala': ['la sala', [['Tele de cápsulas', 30, 14, 42, 41], ['Revistero', 8, 38, 20, 36], ['Planilla PAP', 71, 44, 25, 26]]],
      '.ev-leyendas .ley-museo': ['el cuaderno', [['Dibujo elegido', 5, 7, 44, 78], ['Mis dibujos', 51, 6, 45, 80]]],
    };
    Object.entries(PARTES).forEach(([sel, [nombre, partes]]) => {
      const lam = $(sel); if (!lam) return;
      const marco = document.createElement('div'); marco.className = 'zoom-marco'; lam.before(marco); marco.append(lam);
      const barra = document.createElement('div'); barra.className = 'zoom-barra';
      const todo = document.createElement('button'); todo.type = 'button'; todo.className = 'zoom-todo'; todo.textContent = '⤢ Ver todo ' + nombre;
      const botones = partes.map((pt, k) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'zoom-parte'; b.textContent = pt[0]; b.addEventListener('click', () => acercar(k)); return b; });
      barra.append(...botones, todo); marco.after(barra);
      let actualParte = -1;
      function acercar(k) {
        actualParte = k;
        const W = marco.clientWidth, Hl = lam.offsetHeight, [, x, y, w, h] = partes[k], rx = x / 100 * W, ry = y / 100 * Hl, rw = w / 100 * W, rh = h / 100 * Hl;
        let z = W / rw; const tope = innerHeight * .78; if (rh * z > tope) z = tope / rh;
        const tx = (W - rw * z) / 2 - rx * z, ty = -ry * z;
        marco.style.height = (rh * z).toFixed(0) + 'px';
        lam.style.transition = 'transform .5s cubic-bezier(.2,.8,.2,1)'; lam.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${z.toFixed(3)})`;
        marco.classList.add('acercado'); barra.classList.add('acercado');
        botones.forEach((b, n) => b.classList.toggle('activo', n === k));
        requestAnimationFrame(() => marco.scrollIntoView({ behavior: 'smooth', block: 'center' }));
      }
      function verTodo() {
        actualParte = -1; marco.style.height = ''; lam.style.transform = ''; marco.classList.remove('acercado'); barra.classList.remove('acercado');
        botones.forEach(b => b.classList.remove('activo'));
      }
      todo.addEventListener('click', verTodo);
      // de lejos, tocar el dibujo acerca la parte tocada (o la más cercana); ya acercado, los toques funcionan normal
      marco.addEventListener('click', e => {
        if (actualParte >= 0) return;
        e.preventDefault(); e.stopPropagation();
        const r = lam.getBoundingClientRect(), px = (e.clientX - r.left) / r.width * 100, py = (e.clientY - r.top) / r.height * 100;
        let k = partes.findIndex(([, x, y, w, h]) => px >= x && px <= x + w && py >= y && py <= y + h);
        if (k < 0) k = partes.map(([, x, y, w, h], n) => [Math.hypot(px - x - w / 2, py - y - h / 2), n]).sort((a, b) => a[0] - b[0])[0][1];
        acercar(k);
      }, true);
      addEventListener('resize', () => { if (actualParte >= 0) acercar(actualParte); });
    });
    // la tele: al darle play en el teléfono, la cápsula pasa a pantalla completa y se gira a lo ancho
    const videoTele = $('.sala-tele video');
    if (videoTele) videoTele.addEventListener('play', () => {
      if (document.fullscreenElement || !videoTele.requestFullscreen) return;
      videoTele.requestFullscreen().then(() => screen.orientation?.lock?.('landscape').catch(() => {})).catch(() => {});
    });
    document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement) screen.orientation?.unlock?.(); });
    const ini = DESTINO[location.hash.slice(1)]; if (ini && ini !== 'inicio') requestAnimationFrame(() => E[indiceDe(ini)]?.ev.scrollIntoView({ block: 'start' }));
    return;
  }
  mostrar(E[0]);
  const inicial = DESTINO[location.hash.slice(1)];
  if (inicial && inicial !== 'inicio') saltar(indiceDe(inicial));
})();
