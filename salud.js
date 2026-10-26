/* ==========================================================================
   salud.js · lo que hago como matrona, en la versión clásica:
   1 · Datos: los cinco tableros de salud (Power BI y Tableau) con sus hallazgos,
       sus indicadores explicados y cada página del tablero.
   2 · Matrona hoy: las cápsulas en video, las páginas interactivas en vivo
       y la planilla PAP.
   Los tableros vienen de datos-salud.js (generado desde los README del repositorio).
   © 2026 María Inés Cisterna Escobar · Studios Conari SpA. Todos los derechos reservados.
   ========================================================================== */
(function () {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const el = (tag, cls, txt) => { const n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; };
  const boton = (cls, txt, extra = {}) => { const b = el('button', cls, txt); b.type = 'button'; Object.assign(b, extra); return b; };
  const enlace = (cls, txt, href) => { const a = el('a', cls, txt); a.href = href; a.target = '_blank'; a.rel = 'noopener'; return a; };

  /* ======================================================================
     1 · Datos de salud: cinco tableros
     ====================================================================== */
  (function tableros() {
    const raiz = $('#tableros'); if (!raiz || !window.TABLEROS) return;
    const REPO = 'https://github.com/manecist/Analisis-de-datos-dashboards';
    const CORTO = { anticonceptivos: 'Anticonceptivos', its: 'ITS', embarazo: 'Embarazo y matronas', ajuar: 'Ajuar del recién nacido', cancer: 'Cáncer' };
    const T = window.TABLEROS;
    const TV = window.TABLEROS_VIVOS;
    let t = 0, pag = 0, vista = TV ? 'vivo' : 'pbi', sub = 'investigue', kpiSel = 0;

    // temas
    const temas = el('div', 'tab-temas'); temas.setAttribute('role', 'tablist'); temas.setAttribute('aria-label', 'Elige un tablero');
    T.forEach((d, i) => {
      const b = boton('tab-tema', null, { role: 'tab' });
      b.append(el('span', 'tab-tema-ico', d.emoji), el('span', null, CORTO[d.id] || d.titulo));
      b.addEventListener('click', () => elegir(i));
      temas.append(b);
    });

    // columna de lectura: título, pregunta y pestañas internas
    const info = el('div', 'tab-info');
    const titulo = el('h3', 'tab-titulo'), pregunta = el('p', 'tab-pregunta');
    const subs = el('div', 'tab-subs'); subs.setAttribute('role', 'tablist');
    const panel = el('div', 'tab-panel'); panel.setAttribute('aria-live', 'polite');
    info.append(titulo, pregunta, subs, panel);

    // visor de páginas del tablero
    const visor = el('div', 'tab-visor');
    const barra = el('div', 'tab-barra');
    const pagNombre = el('p', 'tab-pag-nombre');
    const vistas = el('div', 'tab-vistas'); vistas.setAttribute('aria-label', 'Programa');
    const bPbi = boton('activo', 'Power BI'), bTab = boton('', 'Tableau');
    // «En vivo»: el tablero rehecho en la web (filtros y gráficos que responden); Power BI y Tableau quedan como capturas
    const bVivo = boton('', 'En vivo');
    if (TV) vistas.append(bVivo); vistas.append(bPbi, bTab);
    bVivo.addEventListener('click', () => { vista = 'vivo'; pag = 0; pintarTira(); pintarPagina(); });
    bPbi.addEventListener('click', () => { const v = vista; vista = 'pbi'; if (v === 'vivo') { pag = 0; pintarTira(); } pintarPagina(); });
    bTab.addEventListener('click', () => { const v = vista; vista = 'tableau'; if (v === 'vivo') { pag = 0; pintarTira(); } pintarPagina(); });
    barra.append(pagNombre, vistas);
    const marco = el('figure', 'tab-marco');
    const img = el('img'); img.alt = ''; img.decoding = 'async'; img.draggable = false;
    const ant = boton('tab-flecha ant', '‹', { ariaLabel: 'Página anterior' }), sig = boton('tab-flecha sig', '›', { ariaLabel: 'Página siguiente' });
    const ampliar = boton('tab-ampliar', '⤢ Ampliar');
    const pie = el('figcaption', 'tab-pie');
    const vivo = el('div', 'tv-pagina'); vivo.hidden = true;
    marco.append(img, vivo, ant, sig, ampliar, pie);
    const tira = el('div', 'tab-tira'); tira.setAttribute('aria-label', 'Páginas del tablero');
    visor.append(barra, marco, tira);
    ant.addEventListener('click', () => irPagina(pag - 1)); sig.addEventListener('click', () => irPagina(pag + 1));

    // vista ampliada
    const zoom = el('dialog', 'tab-zoom'); zoom.setAttribute('aria-label', 'Página del tablero ampliada');
    const zImg = el('img'); zImg.alt = ''; zImg.draggable = false;
    const zVivo = el('div', 'tv-pagina tv-grande'); zVivo.hidden = true;
    const zPie = el('p', 'tab-zoom-pie');
    const zCerrar = boton('tab-zoom-cerrar', '✕', { ariaLabel: 'Cerrar' });
    const zAnt = boton('tab-flecha ant', '‹', { ariaLabel: 'Página anterior' }), zSig = boton('tab-flecha sig', '›', { ariaLabel: 'Página siguiente' });
    zoom.append(zImg, zVivo, zAnt, zSig, zPie, zCerrar);
    document.body.append(zoom);
    const abrirZoom = () => { pintarZoom(); if (!zoom.open) zoom.showModal(); };
    img.addEventListener('click', abrirZoom); ampliar.addEventListener('click', abrirZoom);
    zCerrar.addEventListener('click', () => zoom.close());
    zoom.addEventListener('close', () => TV && TV.ocultar());
    zoom.addEventListener('click', e => { if (e.target === zoom) zoom.close(); });
    zAnt.addEventListener('click', () => { irPagina(pag - 1); pintarZoom(); }); zSig.addEventListener('click', () => { irPagina(pag + 1); pintarZoom(); });
    // en vivo, el clic en la página es para usar los filtros: solo «Ampliar» abre la vista grande
    zoom.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') { irPagina(pag - 1); pintarZoom(); } if (e.key === 'ArrowRight') { irPagina(pag + 1); pintarZoom(); } });
    [img, zImg].forEach(n => n.addEventListener('contextmenu', e => e.preventDefault()));

    const cuerpo = el('div', 'tab-cuerpo'); cuerpo.append(info, visor);
    raiz.append(temas, cuerpo);
    // en la versión por escenas la carpeta, el monitor y los separadores se dibujan a la medida del escritorio (1672 px de ancho)
    // y se escalan con --k: así siguen la perspectiva exacta del dibujo
    const medir = () => raiz.style.setProperty('--k', (raiz.clientWidth / 1672).toFixed(5));
    new ResizeObserver(medir).observe(raiz); medir();

    const src = (d, p, tipo) => `assets/datos/${d.id}/${p.img}${tipo === 'mini' ? '-mini' : tipo === 'tableau' ? '-tableau' : ''}.webp`;
    const actual = () => T[t], pagina = () => actual().paginas[pag];
    const vivas = () => (TV && TV.temas[actual().id]) || [];
    const enVivo = () => vista === 'vivo' && vivas().length > 0;
    const nPaginas = () => enVivo() ? vivas().length : actual().paginas.length;
    const tieneTableau = () => !!pagina().tableau;

    function elegir(i) {
      t = i; pag = 0; kpiSel = 0; if (sub === 'sim' && !actual().simulador) sub = 'investigue';
      $$('.tab-tema', temas).forEach((b, k) => { b.classList.toggle('activo', k === t); b.setAttribute('aria-selected', String(k === t)); });
      const d = actual();
      titulo.textContent = d.titulo;
      // la primera frase de «Qué muestra» va dentro de «Qué investigué» (la hoja muestra una sola parte a la vez, completa)
      pregunta.textContent = d.muestra.split(/ Cada página parte/)[0]; pregunta.hidden = true;
      // pestañas internas
      subs.replaceChildren();
      /* antes: [['hallazgos', 'Lo que encontré'], ['kpi', …], …] con lo investigado, lo observado y lo concluido juntos (no cabía en la hoja) */
      [['investigue', 'Qué investigué'], ['observe', 'Lo que observé'], ['concluyo', 'Lo que concluyo'], ['kpi', 'Indicadores'], ...(d.simulador ? [['sim', 'Simulador']] : []), ['archivos', 'Archivos']].forEach(([id, txt]) => {
        const b = boton('tab-sub', txt, { role: 'tab' }); b.dataset.sub = id;
        b.addEventListener('click', () => { sub = id; pintarSub(); });
        subs.append(b);
      });
      pintarTira();
      pintarSub(); pintarPagina();
    }

    // tira de páginas: miniaturas de las capturas, o los nombres de las páginas en vivo
    function pintarTira() {
      const d = actual(); tira.replaceChildren(); tira.classList.toggle('tv-tira', enVivo());
      if (enVivo()) {
        vivas().forEach((p, k) => { const b = boton('tab-mini tv-mini'); b.title = p.t; b.append(el('span', null, p.e + ' ' + p.t)); b.addEventListener('click', () => irPagina(k)); tira.append(b); });
        return;
      }
      d.paginas.forEach((p, k) => {
        const b = boton('tab-mini'); b.title = p.titulo; b.setAttribute('aria-label', 'Página ' + (k + 1) + ': ' + p.titulo);
        const m = el('img'); m.src = src(d, p, 'mini'); m.alt = ''; m.loading = 'lazy'; m.draggable = false;
        b.append(m, el('span', null, (k + 1) + '. ' + p.titulo));
        b.addEventListener('click', () => irPagina(k));
        tira.append(b);
      });
    }

    function pintarSub() {
      const d = actual();
      $$('.tab-sub', subs).forEach(b => { const on = b.dataset.sub === sub; b.classList.toggle('activo', on); b.setAttribute('aria-selected', String(on)); });
      panel.replaceChildren();
      if (sub === 'hallazgos' || sub === 'investigue') {
        panel.append(el('p', 'tab-etiqueta', 'Qué investigué'), el('p', 'tab-texto', pregunta.textContent), el('p', 'tab-texto', d.investigue));
      } else if (sub === 'observe') {
        panel.append(el('p', 'tab-etiqueta', 'Lo que observé'));
        const ul = el('ul', 'tab-obs'); d.observe.forEach(o => ul.append(el('li', null, o))); panel.append(ul);
      } else if (sub === 'concluyo') {
        panel.append(el('p', 'tab-etiqueta', 'Lo que concluyo'));
        const q = el('blockquote', 'tab-conclusion'); q.append(document.createTextNode(d.concluyo)); panel.append(q);
      } else if (sub === 'kpi') {
        // un indicador a la vez (con flechas para pasar al siguiente), así cada uno se lee completo en la hoja
        /* antes: la grilla con todos los indicadores y el detalle debajo (no cabía en la hoja) */
        const n = d.kpi.length, nav = el('div', 'tab-kpi-nav');
        const kAnt = boton('tab-kpi-flecha', '‹', { ariaLabel: 'Indicador anterior' }), kSig = boton('tab-kpi-flecha', '›', { ariaLabel: 'Indicador siguiente' });
        kAnt.addEventListener('click', () => { kpiSel = (kpiSel - 1 + n) % n; pintarSub(); }); kSig.addEventListener('click', () => { kpiSel = (kpiSel + 1) % n; pintarSub(); });
        nav.append(kAnt, el('span', 'tab-kpi-cuenta', 'Indicador ' + (kpiSel + 1) + ' de ' + n), kSig);
        const k = d.kpi[kpiSel], detalle = el('div', 'tab-kpi-detalle');
        detalle.append(el('h4', null, k.nombre), el('p', 'tab-kpi-grande', k.valor));
        const dl = el('dl');
        [['Cómo se calcula', k.calculo], ['Qué evalúa', k.evalua], ['Por qué importa', k.importa], ['Meta o referencia', k.meta]].forEach(([a, b]) => { if (b && b !== '—') dl.append(el('dt', null, a), el('dd', null, b)); });
        detalle.append(dl);
        panel.append(nav, detalle);
      } else if (sub === 'sim') {
        panel.append(el('p', 'tab-texto', 'Mueve los supuestos y mira qué cambiaría con matronas haciendo educación sexual integral en los colegios:'));
        const ul = el('ul', 'tab-obs'); d.simulador.puntos.forEach(o => ul.append(el('li', null, o))); panel.append(ul);
        if (d.simulador.aviso) panel.append(el('p', 'tab-aviso', '⚠️ ' + d.simulador.aviso));
        const k = d.paginas.findIndex(p => /^Simulador/.test(p.titulo));
        if (k >= 0) { const b = boton('btn primary', 'Ver el simulador en el tablero →'); b.addEventListener('click', () => irPagina(k)); panel.append(b); }
      } else {
        const raw = f => `${REPO}/raw/main/${d.carpeta}/${encodeURIComponent(f)}`;
        panel.append(el('p', 'tab-texto', 'Las imágenes muestran cada página. Para usar los filtros, menús y controles, descarga el tablero y ábrelo con Power BI Desktop o Tableau Public (los dos son gratis).'));
        const lista = el('div', 'tab-archivos');
        if (d.archivos.pbix) lista.append(enlace('btn primary', '📊 Power BI (.pbix)', raw(d.archivos.pbix)));
        if (d.archivos.twbx) lista.append(enlace('btn ghost', '🎨 Tableau (.twbx)', raw(d.archivos.twbx)));
        if (d.archivos.xlsx) lista.append(enlace('btn ghost', '🗂️ Base de datos (Excel)', raw(d.archivos.xlsx)));
        lista.append(enlace('btn ghost', 'Ver en GitHub ↗', `${REPO}/tree/main/${d.carpeta}`));
        panel.append(lista);
        panel.append(el('p', 'tab-nota', 'Cifras de fuentes públicas (MINSAL, DEIS, INE, ISP, OMS y otras): cada dato tiene su fuente en la hoja «Fuentes» de la base de datos.'));
      }
      // lo elegido se lee completo en la hoja, sin barra: si no cabe, la letra se achica lo justo
      const dentro = el('div', 'tab-dentro'); dentro.append(...panel.childNodes); panel.append(dentro);
      const caber = () => { let z = 1; dentro.style.zoom = ''; while (panel.clientHeight && panel.scrollHeight > panel.clientHeight + 1 && z > .58) { z -= .03; dentro.style.zoom = z.toFixed(2); } };
      caber(); setTimeout(caber, 300);
    }

    function irPagina(k) { const n = nPaginas(); pag = (k + n) % n; pintarPagina(); }
    function pintarPagina() {
      const d = actual();
      bVivo.classList.toggle('activo', vista === 'vivo');
      marco.classList.toggle('tv-marco-vivo', enVivo()); img.hidden = enVivo(); vivo.hidden = !enVivo();
      if (enVivo()) {
        bPbi.classList.remove('activo'); bTab.classList.remove('activo'); bTab.disabled = false;
        const v = vivas()[pag];
        // el nombre de la página es un menú: se salta directo a cualquier página
        const menu = el('select', 'tv-paginas'); menu.setAttribute('aria-label', 'Página del tablero');
        vivas().forEach((x, k) => { const o = el('option', null, `${k + 1}. ${x.e} ${x.t}`); o.value = k; menu.append(o); });
        menu.value = pag; menu.addEventListener('change', () => irPagina(+menu.value));
        pagNombre.replaceChildren(el('span', null, `En vivo · ${pag + 1} de ${vivas().length}`), menu);
        pie.textContent = v.texto;
        $$('.tab-mini', tira).forEach((b, k) => b.classList.toggle('activo', k === pag));
        const m = tira.children[pag]; if (m) tira.scrollTo({ left: m.offsetLeft - tira.clientWidth / 2 + m.clientWidth / 2, behavior: 'smooth' });
        pintarVivo(vivo, v);
        return;
      }
      const p = pagina();
      if (vista === 'tableau' && !tieneTableau()) vista = 'pbi';
      bPbi.classList.toggle('activo', vista === 'pbi'); bTab.classList.toggle('activo', vista === 'tableau'); bTab.disabled = !tieneTableau();
      pagNombre.replaceChildren(el('span', null, `Página ${pag + 1} de ${d.paginas.length}`), el('b', null, p.emoji + ' ' + p.titulo));
      img.src = src(d, p, vista === 'tableau' ? 'tableau' : 'grande'); img.alt = `${d.titulo} · ${p.titulo} (${vista === 'tableau' ? 'Tableau' : 'Power BI'})`;
      pie.textContent = p.texto;
      $$('.tab-mini', tira).forEach((b, k) => b.classList.toggle('activo', k === pag));
      const m = tira.children[pag]; if (m) tira.scrollTo({ left: m.offsetLeft - tira.clientWidth / 2 + m.clientWidth / 2, behavior: 'smooth' });
      // precarga la página siguiente
      const s = d.paginas[(pag + 1) % d.paginas.length]; new Image().src = src(d, s, vista === 'tableau' && s.tableau ? 'tableau' : 'grande');
    }
    // dibuja una página en vivo (los datos se cargan la primera vez)
    function pintarVivo(caja, v) {
      TV.ocultar(); caja.replaceChildren(el('p', 'tv-cargando', 'Abriendo el tablero…'));
      TV.listo().then(() => { caja.replaceChildren(); v.pintar(caja); }).catch(() => caja.replaceChildren(el('p', 'tv-cargando', 'No se pudieron cargar los datos. Revisa la conexión.')));
    }
    function pintarZoom() {
      zImg.hidden = enVivo(); zVivo.hidden = !enVivo();
      if (enVivo()) { const v = vivas()[pag]; pintarVivo(zVivo, v); zPie.textContent = `${actual().titulo} · ${v.t} (en vivo) · ${pag + 1}/${vivas().length}`; return; }
      zImg.src = img.src; zImg.alt = img.alt; zPie.textContent = `${actual().titulo} · ${pagina().titulo} (${vista === 'tableau' ? 'Tableau' : 'Power BI'}) · ${pag + 1}/${actual().paginas.length}`; }

    elegir(0);
  })();

  /* ======================================================================
     2 · Matrona hoy: cápsulas en video, páginas interactivas y planilla PAP
     ====================================================================== */
  (function matronaHoy() {
    const raiz = $('#matrona-hoy'); if (!raiz) return;
    const SITIO = 'https://manecist.github.io/Matrona/';
    const CAPSULAS = [
      ['01_como_guardo_mi_leche', '🍼', '¿Cómo guardo mi leche?', '1:31', 'Cuánto dura tu leche a temperatura ambiente, en el refrigerador y en el congelador.'],
      ['02_masaje_shantala', '👐', 'Masaje Shantala', '3:04', 'Paso a paso para relajar a tu guagua, ayudarla con los gases y dormir mejor.'],
      ['03_sacar_chanchitos', '🫧', 'Sacar los chanchitos', '1:21', 'Cuándo hacerlo, las posiciones que funcionan y cuándo consultar.'],
      ['04_sueno_seguro', '🛏️', 'Sueño seguro', '1:29', 'Boca arriba, cuna despejada y en tu pieza: así se previene la muerte súbita.'],
      ['05_hora_de_ir_a_la_maternidad', '🏥', '¿Ya es hora de ir a la maternidad?', '1:05', 'Cómo saber si las contracciones ya son de trabajo de parto y cuándo partir.'],
      ['06_que_es_el_pap', '🔬', '¿Qué es el PAP?', '1:27', 'Para qué sirve, dónde se toma y cómo prepararte para que salga bien.'],
      ['07_pildora_del_dia_despues', '💊', 'Píldora del día después', '1:18', 'Cuándo tomarla, dónde conseguirla gratis y qué esperar.'],
      ['08_mitos_de_la_lactancia', '🤱', 'Mitos de la lactancia', '1:33', 'Leche aguada, cerveza, mastitis y té: lo que es mito y lo que es realidad.']
    ].map(([k, e, t, dur, txt]) => ({ e, t, dur, txt, nueva: true, poster: `assets/matrona/portada_${k}.webp`, video: `${SITIO}capsula/videos/Capsula_${k}.mp4` }));
    CAPSULAS.push({ e: '🤰', t: 'Cápsula Chile Crece Contigo', dur: '2020', txt: 'Mi cápsula original de 2020 sobre embarazo, parto, recién nacido y lactancia, hecha para Chile Crece Contigo.', poster: 'assets/matrona/portada_capsula.webp', video: `${SITIO}capsula/capsula_chile_crece_contigo.mp4` });
    const PAGINAS = [
      { e: '🤰', t: 'Cápsula Chile Crece Contigo', url: 'capsula.html', img: 'capsula', txt: 'La cápsula de 2020 ampliada: embarazo, parto, recién nacido, lactancia y posparto en 7 etapas, con guías paso a paso y una guía de regalo en PDF.', hacer: ['Medir contracciones y ver la curva', 'Revisar los 17 reflejos del recién nacido', 'Ver la ictericia por zonas de Kramer', 'Anotar mamadas y ver cuánto dura la leche guardada'] },
      { e: '💊', t: 'Anticonceptivos al toque', url: 'guia-anticonceptivos.html', img: 'guia-anticonceptivos', txt: 'Una guía rápida para encontrar tu anticonceptivo y compararlo con los demás métodos.', hacer: ['Buscar por marca u hormona', 'Comparar eficacia y seguridad'] },
      { e: '📋', t: 'Torpedo profesional', url: 'torpedo.html', img: 'torpedo', txt: 'Para colegas: ficha por marca, criterios de elegibilidad y cálculos del control prenatal.', hacer: ['Saber si se puede usar un método según la salud (CDC 2024 / OMS)', 'Calcular edad gestacional y fecha probable de parto'] },
      { e: '🎗️', t: 'Cáncer: cómo ganarle', url: 'historia-cancer.html', img: 'historia-cancer', txt: 'Una historia con datos sobre prevenir y detectar a tiempo el cáncer de mama y de cuello uterino.', hacer: ['Mover los gráficos', 'Responder el quiz'] },
      { e: '🔴', t: 'ITS: lo que no se ve', url: 'historia-its.html', img: 'historia-its', txt: 'Sífilis, VIH y VPH en Chile: cuánto han aumentado y cómo se previenen.', hacer: ['Mover los gráficos', 'Responder el quiz'] },
      { e: '👩‍⚕️', t: 'Más matronas, más vida', url: 'historia-matronas.html', img: 'historia-matronas', txt: 'Hay matronas de sobra en Chile: ¿por qué no las contratan donde hacen falta?', hacer: ['Mover los gráficos', 'Responder el quiz'] },
      { e: '🎓', t: 'Mi tesis', url: 'tesis.html', img: 'tesis', txt: '«La sexualidad no se jubila» (Universidad San Sebastián, 2017), convertida en una historia visual.', hacer: ['Recorrer los resultados con gráficos'] }
    ];

    const cab = el('div', 'mh-cabeza');
    cab.append(el('span', 'chip', 'MATRONA HOY · MATERIAL EDUCATIVO'), el('h3', null, 'Lo que explico en la consulta, ahora en video y en páginas que se pueden usar'),
      el('p', null, 'Simple, paso a paso y con fuentes chilenas: para la sala de espera, la casa o compartir por WhatsApp. Todo el contenido clínico está revisado por mí.'));
    const tabs = el('div', 'mh-tabs'); tabs.setAttribute('role', 'tablist');
    const zonas = {};
    [['videos', '🎬 Cápsulas en video'], ['paginas', '🗺️ Páginas interactivas'], ['pap', '🧾 Planilla PAP']].forEach(([id, txt]) => {
      const b = boton('mh-tab', txt, { role: 'tab' }); b.dataset.mh = id; b.addEventListener('click', () => mostrar(id)); tabs.append(b);
      zonas[id] = el('div', 'mh-zona mh-' + id);
    });
    raiz.append(cab, tabs, ...Object.values(zonas));

    // cápsulas: el reproductor a la izquierda y las cápsulas a la derecha
    const rep = el('div', 'mh-reproductor');
    const video = el('video'); video.controls = true; video.preload = 'none'; video.playsInline = true; video.setAttribute('controlslist', 'nodownload');
    video.addEventListener('contextmenu', e => e.preventDefault());
    const vTit = el('h4'), vTxt = el('p');
    rep.append(video, vTit, vTxt);
    const lista = el('div', 'mh-capsulas');
    CAPSULAS.forEach((c, i) => {
      const b = boton('mh-capsula'); b.setAttribute('aria-label', 'Ver ' + c.t);
      const f = el('span', 'mh-portada'); const im = el('img'); im.src = c.poster; im.alt = ''; im.loading = 'lazy'; f.append(im, el('span', 'mh-dur', c.dur));
      if (c.nueva) f.append(el('span', 'mh-nueva', 'NUEVA 2026'));
      b.append(f, el('b', null, c.e + ' ' + c.t));
      b.addEventListener('click', () => elegirCapsula(i, true));
      lista.append(b);
    });
    zonas.videos.append(rep, lista);
    function elegirCapsula(i, reproducir) {
      const c = CAPSULAS[i];
      $$('.mh-capsula', lista).forEach((b, k) => b.classList.toggle('activo', k === i));
      video.poster = c.poster; vTit.textContent = c.e + ' ' + c.t; vTxt.textContent = c.txt;
      // la fuente va siempre puesta (con preload none no descarga nada hasta darle play); sin ella el botón de play no hacía nada
      video.src = c.video;
      if (reproducir) video.play().catch(() => {});
    }
    /* antes: la fuente se ponía recién al dar play (no funcionaba: sin fuente el video no emite «play»)
    video.addEventListener('play', () => { if (!video.getAttribute('src') && video.dataset.src) { video.src = video.dataset.src; video.play().catch(() => {}); } });
    */
    elegirCapsula(0, false);

    // páginas: la lista a la izquierda y la página en vivo a la derecha
    const menu = el('div', 'mh-paginas-lista');
    const vivo = el('div', 'mh-vivo');
    const vBarra = el('div', 'mh-vivo-barra'), vNombre = el('span'), vAbrir = enlace('mh-abrir', 'Abrir en otra pestaña ↗', SITIO);
    vBarra.append(el('i'), el('i'), el('i'), vNombre, vAbrir);
    const marco = el('iframe'); marco.title = 'Página interactiva de matrona'; marco.loading = 'lazy';
    const hacer = el('div', 'mh-hacer');
    vivo.append(vBarra, marco, hacer);
    PAGINAS.forEach((p, i) => {
      const b = boton('mh-pagina'); b.append(el('b', null, p.e + ' ' + p.t), el('small', null, p.txt));
      b.addEventListener('click', () => elegirPagina(i));
      menu.append(b);
    });
    menu.append(enlace('btn ghost mh-todo', 'Ver todo el portafolio de matrona ↗', SITIO));
    zonas.paginas.append(menu, vivo);
    let pagCargada = -1, pagSel = 0;
    function elegirPagina(i) {
      pagSel = i; const p = PAGINAS[i];
      $$('.mh-pagina', menu).forEach((b, k) => b.classList.toggle('activo', k === i));
      vNombre.textContent = 'manecist.github.io/Matrona/' + p.url; vAbrir.href = SITIO + p.url;
      hacer.replaceChildren(el('span', null, 'Qué puedes hacer:'), ...p.hacer.map(h => el('em', null, h)));
      if (!zonas.paginas.hidden) cargarPagina();
    }
    // la página en vivo carga recién cuando se mira
    function cargarPagina() { if (pagCargada === pagSel) return; pagCargada = pagSel; marco.src = SITIO + PAGINAS[pagSel].url; }
    elegirPagina(0);

    // planilla PAP
    zonas.pap.append(
      el('div', 'mh-pap-texto'),
      el('div', 'mh-pap-imgs')
    );
    const pt = zonas.pap.firstChild;
    pt.append(el('h4', null, 'Del registro en papel a una planilla que avisa sola'),
      el('p', null, 'La armé para llevar el registro de PAP del CESFAM sin perder a nadie de vista.'));
    const ul = el('ul', 'tab-obs');
    ['Formulario para ingresar a cada usuaria (botón INGRESAR, con macros).', 'Calcula sola la edad, separa el resultado según la nomenclatura del informe y pone la fecha de vigencia del próximo PAP.', 'Marca el estado (al día o atrasado) y destaca en color los resultados para revisar.', 'Resumen anual: PAP por mes y por año (2017 a 2023), derivaciones a UPC y VPH positivos, con gráficos.'].forEach(t => ul.append(el('li', null, t)));
    pt.append(ul, el('p', 'tab-nota', '🔒 Todos los nombres y datos son 100 % ficticios.'), enlace('btn primary', 'Descargar la planilla (.xlsm)', 'https://github.com/manecist/Matrona/raw/main/planilla-pap/PAP_portafolio_MariaCisterna.xlsm'));
    [['pap_registro', 'Registro por año'], ['pap_resumen', 'Resumen anual con gráficos']].forEach(([f, t]) => {
      const fig = el('figure'); const im = el('img'); im.src = 'assets/matrona/' + f + '.webp'; im.alt = 'Planilla PAP · ' + t; im.loading = 'lazy'; im.draggable = false;
      fig.append(im, el('figcaption', null, t)); zonas.pap.lastChild.append(fig);
    });

    function mostrar(id) {
      $$('.mh-tab', tabs).forEach(b => { const on = b.dataset.mh === id; b.classList.toggle('activo', on); b.setAttribute('aria-selected', String(on)); });
      Object.entries(zonas).forEach(([k, z]) => { z.hidden = k !== id; });
      if (id !== 'videos') video.pause();
      if (id === 'paginas') cargarPagina();
    }
    mostrar('videos');
    // la versión por escenas arma la sala de espera con estas mismas piezas (las páginas van en el revistero)
    window.MCEMatrona = { pausar: () => video.pause(), paginas: PAGINAS, sitio: SITIO };
  })();

  /* ======================================================================
     3 · Banco de Evaluaciones: el demo en vivo carga recién al mirarlo
     ====================================================================== */
  (function banco() {
    const marco = $('#banco-card iframe'); if (!marco) return;
    const cargar = () => { if (marco.dataset.src) { marco.src = marco.dataset.src; marco.removeAttribute('data-src'); } };
    $('.dev-tab[data-dev="banco"]')?.addEventListener('click', cargar);
    window.MCEBanco = { cargar };
  })();
})();
