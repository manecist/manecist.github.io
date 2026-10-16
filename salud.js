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
    let t = 0, pag = 0, vista = 'pbi', sub = 'hallazgos', kpiSel = 0;

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
    vistas.append(bPbi, bTab);
    bPbi.addEventListener('click', () => { vista = 'pbi'; pintarPagina(); });
    bTab.addEventListener('click', () => { vista = 'tableau'; pintarPagina(); });
    barra.append(pagNombre, vistas);
    const marco = el('figure', 'tab-marco');
    const img = el('img'); img.alt = ''; img.decoding = 'async'; img.draggable = false;
    const ant = boton('tab-flecha ant', '‹', { ariaLabel: 'Página anterior' }), sig = boton('tab-flecha sig', '›', { ariaLabel: 'Página siguiente' });
    const ampliar = boton('tab-ampliar', '⤢ Ampliar');
    const pie = el('figcaption', 'tab-pie');
    marco.append(img, ant, sig, ampliar, pie);
    const tira = el('div', 'tab-tira'); tira.setAttribute('aria-label', 'Páginas del tablero');
    visor.append(barra, marco, tira);
    ant.addEventListener('click', () => irPagina(pag - 1)); sig.addEventListener('click', () => irPagina(pag + 1));

    // vista ampliada
    const zoom = el('dialog', 'tab-zoom'); zoom.setAttribute('aria-label', 'Página del tablero ampliada');
    const zImg = el('img'); zImg.alt = ''; zImg.draggable = false;
    const zPie = el('p', 'tab-zoom-pie');
    const zCerrar = boton('tab-zoom-cerrar', '✕', { ariaLabel: 'Cerrar' });
    const zAnt = boton('tab-flecha ant', '‹', { ariaLabel: 'Página anterior' }), zSig = boton('tab-flecha sig', '›', { ariaLabel: 'Página siguiente' });
    zoom.append(zImg, zAnt, zSig, zPie, zCerrar);
    document.body.append(zoom);
    const abrirZoom = () => { pintarZoom(); if (!zoom.open) zoom.showModal(); };
    img.addEventListener('click', abrirZoom); ampliar.addEventListener('click', abrirZoom);
    zCerrar.addEventListener('click', () => zoom.close());
    zoom.addEventListener('click', e => { if (e.target === zoom) zoom.close(); });
    zAnt.addEventListener('click', () => { irPagina(pag - 1); pintarZoom(); }); zSig.addEventListener('click', () => { irPagina(pag + 1); pintarZoom(); });
    zoom.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') { irPagina(pag - 1); pintarZoom(); } if (e.key === 'ArrowRight') { irPagina(pag + 1); pintarZoom(); } });
    [img, zImg].forEach(n => n.addEventListener('contextmenu', e => e.preventDefault()));

    const cuerpo = el('div', 'tab-cuerpo'); cuerpo.append(info, visor);
    raiz.append(temas, cuerpo);

    const src = (d, p, tipo) => `assets/datos/${d.id}/${p.img}${tipo === 'mini' ? '-mini' : tipo === 'tableau' ? '-tableau' : ''}.webp`;
    const actual = () => T[t], pagina = () => actual().paginas[pag];
    const tieneTableau = () => !!pagina().tableau;

    function elegir(i) {
      t = i; pag = 0; kpiSel = 0; if (sub === 'sim' && !actual().simulador) sub = 'hallazgos';
      $$('.tab-tema', temas).forEach((b, k) => { b.classList.toggle('activo', k === t); b.setAttribute('aria-selected', String(k === t)); });
      const d = actual();
      titulo.textContent = d.titulo;
      // la primera frase de «Qué muestra»: el resto es común a los cinco tableros
      pregunta.textContent = d.muestra.split(/ Cada página parte/)[0];
      // pestañas internas
      subs.replaceChildren();
      [['hallazgos', 'Lo que encontré'], ['kpi', 'Indicadores (' + d.kpi.length + ')'], ...(d.simulador ? [['sim', 'Simulador']] : []), ['archivos', 'Archivos']].forEach(([id, txt]) => {
        const b = boton('tab-sub', txt, { role: 'tab' }); b.dataset.sub = id;
        b.addEventListener('click', () => { sub = id; pintarSub(); });
        subs.append(b);
      });
      // tira de páginas
      tira.replaceChildren();
      d.paginas.forEach((p, k) => {
        const b = boton('tab-mini'); b.title = p.titulo; b.setAttribute('aria-label', 'Página ' + (k + 1) + ': ' + p.titulo);
        const m = el('img'); m.src = src(d, p, 'mini'); m.alt = ''; m.loading = 'lazy'; m.draggable = false;
        b.append(m, el('span', null, (k + 1) + '. ' + p.titulo));
        b.addEventListener('click', () => irPagina(k));
        tira.append(b);
      });
      pintarSub(); pintarPagina();
    }

    function pintarSub() {
      const d = actual();
      $$('.tab-sub', subs).forEach(b => { const on = b.dataset.sub === sub; b.classList.toggle('activo', on); b.setAttribute('aria-selected', String(on)); });
      panel.replaceChildren();
      if (sub === 'hallazgos') {
        panel.append(el('p', 'tab-etiqueta', 'Qué investigué'), el('p', 'tab-texto', d.investigue), el('p', 'tab-etiqueta', 'Lo que observé'));
        const ul = el('ul', 'tab-obs'); d.observe.forEach(o => ul.append(el('li', null, o))); panel.append(ul);
        const q = el('blockquote', 'tab-conclusion'); q.append(el('b', null, 'Lo que concluyo · '), document.createTextNode(d.concluyo)); panel.append(q);
      } else if (sub === 'kpi') {
        panel.append(el('p', 'tab-ayuda', 'Toca un indicador para ver cómo se calcula, qué evalúa y por qué importa.'));
        const grilla = el('div', 'tab-kpis');
        const detalle = el('div', 'tab-kpi-detalle');
        d.kpi.forEach((k, i) => {
          const b = boton('tab-kpi'); b.append(el('span', 'tab-kpi-nombre', k.nombre), el('b', 'tab-kpi-valor', k.valor));
          b.addEventListener('click', () => { kpiSel = i; pintarSub(); });
          if (i === kpiSel) b.classList.add('activo');
          grilla.append(b);
        });
        const k = d.kpi[kpiSel];
        detalle.append(el('h4', null, k.nombre));
        const dl = el('dl');
        [['Valor en Chile', k.valor], ['Cómo se calcula', k.calculo], ['Qué evalúa', k.evalua], ['Por qué importa', k.importa], ['Meta o referencia', k.meta]].forEach(([a, b]) => { if (b && b !== '—') dl.append(el('dt', null, a), el('dd', null, b)); });
        detalle.append(dl);
        panel.append(grilla, detalle);
      } else if (sub === 'sim') {
        panel.append(el('p', 'tab-texto', 'Una página del tablero donde se mueven los supuestos y se ve qué cambiaría con matronas haciendo educación sexual integral en los colegios:'));
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
    }

    function irPagina(k) { const n = actual().paginas.length; pag = (k + n) % n; pintarPagina(); }
    function pintarPagina() {
      const d = actual(), p = pagina();
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
    function pintarZoom() { zImg.src = img.src; zImg.alt = img.alt; zPie.textContent = `${actual().titulo} · ${pagina().titulo} (${vista === 'tableau' ? 'Tableau' : 'Power BI'}) · ${pag + 1}/${actual().paginas.length}`; }

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
      if (reproducir) { video.src = c.video; video.play().catch(() => {}); }
      else { video.removeAttribute('src'); video.load(); video.dataset.src = c.video; }
    }
    video.addEventListener('play', () => { if (!video.getAttribute('src') && video.dataset.src) { video.src = video.dataset.src; video.play().catch(() => {}); } });
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
    window.MCEMatrona = { pausar: () => video.pause() };
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
