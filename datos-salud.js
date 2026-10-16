/* Generado desde los README de github.com/manecist/Analisis-de-datos-dashboards */
window.TABLEROS = [
 {
  "id": "anticonceptivos",
  "emoji": "💊",
  "titulo": "Anticonceptivos en Chile",
  "carpeta": "dashboard-anticonceptivos-chile",
  "muestra": "Todos los métodos anticonceptivos disponibles en Chile: cómo funciona cada uno, su eficacia en uso típico y perfecto, su seguridad (trombosis, contraindicaciones y cáncer), sus beneficios además de la anticoncepción, una ficha por marca comercial, qué conviene según tu condición, cada hormona, los criterios de elegibilidad OMS/CDC, qué medicamentos les bajan la eficacia y los datos de Chile. Cada página parte con sus indicadores clave (KPI) y una página final explica qué mide cada KPI, cómo se calcula y por qué importa. Power BI y Tableau tienen las mismas páginas.",
  "investigue": "Comparé la eficacia de cada método en uso típico y perfecto, sus riesgos (trombosis, cáncer), los criterios de elegibilidad OMS/CDC 2024 en 73 condiciones, las interacciones con medicamentos y cómo se usan los métodos en Chile.",
  "observe": [
   "El implante y el DIU hormonal tienen 0,1 embarazos por 100 mujeres al año; la píldora, 7 en uso típico: la diferencia no es el método sino los olvidos.",
   "Solo 8,8% de las adolescentes inicia con implante o DIU; 2 de cada 3 parten con píldora o inyectable.",
   "Los métodos combinados tienen 37 condiciones que los desaconsejan; el implante, 6, y el DIU de cobre, 5.",
   "14 de 21 medicamentos o situaciones revisadas bajan la eficacia de algún método; ninguna afecta al DIU ni al condón.",
   "El riesgo de trombosis de la píldora con levonorgestrel (5 a 7 por 10.000) es menor que el del embarazo (5 a 20) y el posparto (40 a 65)."
  ],
  "concluyo": "Elegir bien es más importante que elegir cualquier método: ofrecer primero los métodos de larga duración, sobre todo a adolescentes, es la medida con más impacto.\n\n---",
  "kpi": [
   {
    "nombre": "Tasa de falla en el primer año (uso típico)",
    "valor": "Implante 0,1 · píldora 7 · condón 13 por 100 mujeres",
    "calculo": "Embarazos no planeados en el primer año de uso ÷ mujeres que usan el método × 100",
    "evalua": "Qué tan eficaz es cada método en la vida real, con olvidos y errores",
    "importa": "Es el dato clave para elegir: sin método se embarazan 85 de cada 100 mujeres en un año",
    "meta": "Menos de 1 por 100 = muy eficaz (OMS)"
   },
   {
    "nombre": "Brecha entre uso típico y uso perfecto",
    "valor": "Píldora: 7 vs 0,3 · implante y DIU: 0",
    "calculo": "Tasa de falla en uso típico − tasa de falla en uso perfecto",
    "evalua": "Cuánto depende la eficacia de que la persona lo use bien",
    "importa": "Una brecha alta indica que conviene un método que no dependa de la memoria o más apoyo en la consejería",
    "meta": "Lo más cercana a 0"
   },
   {
    "nombre": "Riesgo de trombosis venosa por 10.000 mujeres al año",
    "valor": "Píldora con levonorgestrel 5–7 · sin método 2 · embarazo 5–20 · posparto 40–65",
    "calculo": "Casos de trombosis venosa ÷ mujeres-año de uso × 10.000",
    "evalua": "El principal riesgo de los métodos con estrógeno",
    "importa": "Permite elegir el combinado de menor riesgo y no indicarlo con factores de riesgo; el embarazo y el posparto tienen más riesgo",
    "meta": "Menor que el riesgo del embarazo"
   },
   {
    "nombre": "Riesgo relativo de cáncer de mama con métodos hormonales",
    "valor": "RR 1,20 · 13 casos más por 100.000 usuarias al año",
    "calculo": "Riesgo en usuarias ÷ riesgo en no usuarias",
    "evalua": "Si usar hormonas cambia el riesgo de cáncer de mama",
    "importa": "El aumento es pequeño en riesgo absoluto y desaparece a los 10 años de suspender; los combinados protegen de cáncer de endometrio y ovario",
    "meta": "RR 1 = sin diferencia"
   },
   {
    "nombre": "Condiciones de salud que desaconsejan el método (categoría 3 o 4)",
    "valor": "Combinados 37 · inyectable trimestral 16 · implante 6 · DIU de cobre 5",
    "calculo": "Número de condiciones con categoría 3 o 4 en los criterios de elegibilidad CDC 2024",
    "evalua": "A cuántas personas les sirve el método con seguridad",
    "importa": "Menos condiciones = más personas pueden usarlo, incluso con migraña con aura o hipertensión",
    "meta": "Categoría 1 o 2 = se puede usar"
   },
   {
    "nombre": "Situaciones que bajan la eficacia de algún método",
    "valor": "14 de 21 situaciones revisadas · DIU y condón: 0",
    "calculo": "Situaciones con efecto en al menos un método ÷ situaciones revisadas",
    "evalua": "Qué medicamentos, malestares o cirugías interfieren con cada método",
    "importa": "Permite avisar a tiempo y sumar condón o cambiar a un DIU, que no se afecta con medicamentos",
    "meta": "—"
   },
   {
    "nombre": "Métodos gratuitos en la red pública",
    "valor": "13 tipos (2025)",
    "calculo": "Número de métodos distintos que entrega la atención primaria sin costo",
    "evalua": "Acceso a la anticoncepción en el sistema público",
    "importa": "La Ley 20.418 garantiza información y acceso; más opciones permiten elegir el método adecuado para cada persona",
    "meta": "Acceso universal (ODS 3.7)"
   },
   {
    "nombre": "Uso de anticonceptivos en mujeres de 15 a 29 años",
    "valor": "82,6% (2018)",
    "calculo": "Mujeres de 15 a 29 que declaran usar algún método ÷ mujeres de 15 a 29 encuestadas × 100",
    "evalua": "Qué parte de las mujeres jóvenes se protege de un embarazo no planeado",
    "importa": "Muestra la cobertura real; el método más usado en la última relación fue el condón (40,5%)",
    "meta": "Referencia ODS 3.7.1: demanda satisfecha con métodos modernos"
   },
   {
    "nombre": "Adolescentes que inician con un método de larga duración (implante o DIU)",
    "valor": "8,8% (2018)",
    "calculo": "Adolescentes que inician implante o DIU ÷ adolescentes que inician un método en el sistema público × 100",
    "evalua": "Uso de los métodos más eficaces en adolescentes",
    "importa": "Hoy 2 de cada 3 adolescentes parten con píldora o inyectable, que dependen de la memoria",
    "meta": "Aumentar: el acceso gratuito a LARC baja el embarazo adolescente"
   },
   {
    "nombre": "Tasa de fecundidad adolescente (15 a 19 años)",
    "valor": "11,0 por 1.000 (2023) · 64,6 en 1992",
    "calculo": "Nacidos vivos de madres de 15 a 19 ÷ mujeres de 15 a 19 × 1.000",
    "evalua": "Cuántos nacimientos hay por cada 1.000 adolescentes",
    "importa": "Es el resultado que más refleja el acceso a anticoncepción y educación sexual",
    "meta": "Indicador ODS 3.7.2: seguir bajando"
   }
  ],
  "simulador": null,
  "paginas": [
   {
    "titulo": "Resumen rápido",
    "emoji": "📊",
    "texto": "Eficacia y condiciones que desaconsejan cada método.",
    "img": "01_resumen_rapido",
    "tableau": true
   },
   {
    "titulo": "Métodos 1: larga duración",
    "emoji": "🌱",
    "texto": "Implante, DIU, inyectables y esterilización, con ilustración y teoría.",
    "img": "02_metodos_larga_duracion",
    "tableau": true
   },
   {
    "titulo": "Métodos 2: corta duración",
    "emoji": "💊",
    "texto": "Píldoras, anillo, parche, condón y píldora de emergencia.",
    "img": "03_metodos_corta_duracion",
    "tableau": true
   },
   {
    "titulo": "Eficacia",
    "emoji": "🎯",
    "texto": "Embarazos por 100 mujeres al año, uso típico vs perfecto, con filtros.",
    "img": "04_eficacia",
    "tableau": true
   },
   {
    "titulo": "Seguridad",
    "emoji": "🛡️",
    "texto": "Trombosis, contraindicaciones del estrógeno y cáncer.",
    "img": "05_seguridad",
    "tableau": true
   },
   {
    "titulo": "Beneficios",
    "emoji": "✨",
    "texto": "Efecto de cada método en dolor, sangrado, acné, SOP y más.",
    "img": "06_beneficios",
    "tableau": true
   },
   {
    "titulo": "Mi pastilla",
    "emoji": "🔎",
    "texto": "Ficha de 141 marcas comerciales y sus equivalentes.",
    "img": "07_mi_pastilla",
    "tableau": true
   },
   {
    "titulo": "Según tu condición",
    "emoji": "🩺",
    "texto": "Qué conviene y qué evitar en 18 condiciones.",
    "img": "08_segun_tu_condicion",
    "tableau": true
   },
   {
    "titulo": "Hormonas",
    "emoji": "🧬",
    "texto": "Cada estrógeno y progestina: beneficios, riesgos y cuándo usarla.",
    "img": "09_hormonas",
    "tableau": true
   },
   {
    "titulo": "¿Puedo usarlo?",
    "emoji": "✅",
    "texto": "Criterios de elegibilidad CDC 2024 / OMS en 73 condiciones.",
    "img": "10_puedo_usarlo",
    "tableau": true
   },
   {
    "titulo": "¿Qué baja la eficacia?",
    "emoji": "⚠️",
    "texto": "Medicamentos, malestares y cirugías que interfieren.",
    "img": "11_que_baja_la_eficacia",
    "tableau": true
   },
   {
    "titulo": "Chile",
    "emoji": "🇨🇱",
    "texto": "Uso de métodos, inicio en adolescentes y fecundidad adolescente.",
    "img": "12_chile",
    "tableau": true
   },
   {
    "titulo": "Qué mide cada KPI",
    "emoji": "📐",
    "texto": "Fórmula, qué evalúa, por qué importa y meta.",
    "img": "13_que_mide_cada_kpi",
    "tableau": true
   }
  ],
  "archivos": {
   "pbix": "Anticonceptivos_MariaCisterna.pbix",
   "twbx": "Anticonceptivos_MariaCisterna.twbx",
   "xlsx": "Anticonceptivos_BaseDatos.xlsx"
  }
 },
 {
  "id": "its",
  "emoji": "🩺",
  "titulo": "ITS en Chile",
  "carpeta": "dashboard-its-chile",
  "muestra": "Las ITS en Chile —sífilis, gonorrea, VIH, hepatitis B, clamidia, VPH, herpes, tricomoniasis, linfogranuloma venéreo y mpox—: cómo han aumentado, a quiénes afectan, cómo está Chile frente al mundo, una guía clínica de cada ITS y un simulador de lo que cambiaría con matronas haciendo educación sexual integral en los colegios. Cada página parte con sus indicadores clave (KPI) y una página final explica qué mide cada KPI, cómo se calcula y por qué importa. Power BI y Tableau tienen las mismas páginas.",
  "investigue": "Revisé los boletines de vigilancia del MINSAL y el ISP, la cascada de VIH de ONUSIDA y comparé Chile con Estados Unidos y la Unión Europea. También revisé qué ITS se vigilan en Chile y cuáles no.",
  "observe": [
   "La sífilis subió 64% desde 2020 y llegó a 55,2 por 100 mil en 2025: casi igual a EE.UU. (62,5) y 5 veces Europa (10,8).",
   "VIH: 95% de las personas conoce su diagnóstico, pero solo 71% está en tratamiento; 21.915 personas diagnosticadas no lo reciben.",
   "Solo 4 de las 10 ITS revisadas son de notificación obligatoria; clamidia, VPH, herpes y tricomoniasis casi no tienen datos en Chile.",
   "La sífilis se concentra entre los 20 y 29 años y la gonorrea crece más rápido en mujeres."
  ],
  "concluyo": "Las ITS van en sentido contrario al embarazo adolescente: hace falta más testeo, tratamiento oportuno y uso de condón, y medir las ITS que hoy no se vigilan.\n\n---",
  "kpi": [
   {
    "nombre": "Tasa de incidencia notificada de sífilis",
    "valor": "55,2 por 100 mil (2025)",
    "calculo": "Casos nuevos notificados en el año ÷ población × 100.000",
    "evalua": "Cuántas personas se diagnostican con sífilis cada año, ajustado por tamaño de la población",
    "importa": "Permite comparar años, regiones y países y ver si la transmisión sube o baja; es enfermedad de notificación obligatoria",
    "meta": "Bajar la tendencia; Unión Europea: 10,8"
   },
   {
    "nombre": "Tasa de incidencia notificada de gonorrea",
    "valor": "13,3 por 100 mil (2025)",
    "calculo": "Casos nuevos notificados en el año ÷ población × 100.000",
    "evalua": "Magnitud y tendencia de la gonorrea",
    "importa": "Su aumento alerta sobre relaciones sin condón y riesgo de resistencia a antibióticos",
    "meta": "Bajar la tendencia; Unión Europea: 26,9"
   },
   {
    "nombre": "Nuevos diagnósticos de VIH confirmados",
    "valor": "4.313 casos (2025)",
    "calculo": "Número de casos confirmados por el ISP en el año",
    "evalua": "Cuántas personas se diagnostican con VIH cada año",
    "importa": "Mide la llegada al diagnóstico; más testeo puede subir el número aunque baje la transmisión",
    "meta": "Reducir nuevas infecciones (ONUSIDA)"
   },
   {
    "nombre": "Tasa de sífilis congénita",
    "valor": "0,41 por 1.000 nacidos vivos",
    "calculo": "Casos de sífilis congénita ÷ nacidos vivos × 1.000",
    "evalua": "Cuántas guaguas nacen con sífilis transmitida durante el embarazo",
    "importa": "Es evitable con VDRL en el control prenatal y tratamiento oportuno de la gestante y su pareja",
    "meta": "Eliminación OPS: ≤ 0,5 por 1.000 nacidos vivos"
   },
   {
    "nombre": "Tasa específica por edad",
    "valor": "Sífilis 20 a 29: 111,3 por 100 mil",
    "calculo": "Casos del grupo de edad ÷ población de ese grupo × 100.000",
    "evalua": "En qué edades se concentra cada ITS",
    "importa": "Orienta dónde focalizar educación, testeo y anticoncepción con condón",
    "meta": "—"
   },
   {
    "nombre": "Razón de tasas hombre:mujer",
    "valor": "VIH 4,7 : 1 (2023)",
    "calculo": "Tasa en hombres ÷ tasa en mujeres",
    "evalua": "Cuántas veces más afecta a hombres que a mujeres",
    "importa": "Muestra brechas por sexo y dónde crece más rápido (gonorrea en mujeres × 3,8)",
    "meta": "—"
   },
   {
    "nombre": "Cascada VIH 95-95-95: diagnóstico",
    "valor": "95% conoce su diagnóstico",
    "calculo": "Personas diagnosticadas ÷ personas que viven con VIH × 100",
    "evalua": "Qué parte de las personas con VIH sabe que lo tiene",
    "importa": "Sin diagnóstico no hay tratamiento ni prevención de nuevos contagios",
    "meta": "95% (ONUSIDA 2030)"
   },
   {
    "nombre": "Cascada VIH 95-95-95: tratamiento",
    "valor": "71% en tratamiento",
    "calculo": "Personas en tratamiento antirretroviral ÷ personas que viven con VIH × 100",
    "evalua": "Qué parte de las personas con VIH recibe tratamiento",
    "importa": "Es el punto débil de Chile: 21.915 personas diagnosticadas no están en tratamiento",
    "meta": "95% (ONUSIDA 2030)"
   },
   {
    "nombre": "Cascada VIH 95-95-95: carga viral suprimida",
    "valor": "68% con carga viral suprimida",
    "calculo": "Personas con carga viral indetectable ÷ personas que viven con VIH × 100",
    "evalua": "Qué parte logra que el virus no se detecte en sangre",
    "importa": "Indetectable = intransmisible: es el KPI que mejor refleja el control de la epidemia",
    "meta": "95% (ONUSIDA 2030)"
   },
   {
    "nombre": "Tasa de transmisión vertical de VIH",
    "valor": "1,5%",
    "calculo": "Recién nacidos con VIH ÷ recién nacidos de madres con VIH × 100",
    "evalua": "Cuántas guaguas adquieren el VIH de su madre",
    "importa": "Mide la calidad del protocolo de prevención en el embarazo, el parto y la lactancia",
    "meta": "< 2% (meta OPS de eliminación)"
   }
  ],
  "simulador": {
   "puntos": [
    "% de colegios con matrona: qué parte de los colegios tendría una matrona haciendo educación sexual integral.",
    "Anticonceptivos desde los 14 años: si además se entregan métodos (la Ley 20.418 garantiza información y acceso; desde los 14 años la atención es confidencial).",
    "Escenario de efecto: 5% (conservador) o 10% (alto) menos nacimientos adolescentes, según la evidencia de acceso gratuito a DIU e implantes.",
    "Más uso de condón: cuántos puntos sube el uso de condón gracias a la educación; el condón usado siempre reduce cerca de 80% la transmisión del VIH."
   ],
   "aviso": "Es una simulación educativa con supuestos explícitos, no una proyección oficial. La educación sola, sin acceso a métodos, no mostró un efecto claro en embarazos (Cochrane 2016): por eso el simulador separa los dos efectos."
  },
  "paginas": [
   {
    "titulo": "Resumen",
    "emoji": "📊",
    "texto": "Indicadores clave, hallazgos y rol de la matrona.",
    "img": "01_resumen",
    "tableau": true
   },
   {
    "titulo": "Tendencias",
    "emoji": "📈",
    "texto": "Casos y tasa por año de cada ITS.",
    "img": "02_tendencias",
    "tableau": true
   },
   {
    "titulo": "¿A quiénes afecta?",
    "emoji": "👥",
    "texto": "Edad y sexo.",
    "img": "03_a_quienes_afecta",
    "tableau": true
   },
   {
    "titulo": "Chile y el mundo",
    "emoji": "🌍",
    "texto": "Chile frente a EE.UU. y Europa, y cascada VIH 95-95-95.",
    "img": "04_chile_y_el_mundo",
    "tableau": true
   },
   {
    "titulo": "Todas las ITS",
    "emoji": "🧪",
    "texto": "Las 10 ITS: qué se vigila en Chile y cuánto hay en el mundo.",
    "img": "04b_todas_las_its",
    "tableau": true
   },
   {
    "titulo": "Guía de cada ITS",
    "emoji": "📖",
    "texto": "Síntomas, alarma, tratamiento, embarazo y quién atiende.",
    "img": "05_guia_de_cada_its",
    "tableau": true
   },
   {
    "titulo": "Simulador: matronas en colegios",
    "emoji": "🏫",
    "texto": "Mueve los supuestos y mira cuántos casos se evitan.",
    "img": "06_simulador_matronas_en_colegios",
    "tableau": true
   },
   {
    "titulo": "Qué mide cada KPI",
    "emoji": "📐",
    "texto": "Fórmula, qué evalúa, por qué importa y meta.",
    "img": "07_que_mide_cada_kpi",
    "tableau": true
   }
  ],
  "archivos": {
   "pbix": "ITS_Chile_MariaCisterna.pbix",
   "twbx": "ITS_Chile_MariaCisterna.twbx",
   "xlsx": "ITS_Chile_BaseDatos.xlsx"
  }
 },
 {
  "id": "embarazo",
  "emoji": "🤰",
  "titulo": "Embarazo no planificado y matronería en Chile",
  "carpeta": "dashboard-embarazo-matronas-chile",
  "muestra": "Embarazo adolescente, matronas en Chile, mortalidad materna y neonatal, lo que dice la evidencia sobre más matronas, propuestas y un simulador de educación sexual integral con matronas en los colegios y entrega de anticonceptivos desde los 14 años. Cada página parte con sus indicadores clave (KPI) y una página final explica qué mide cada KPI, cómo se calcula y por qué importa. Power BI y Tableau tienen las mismas páginas.",
  "investigue": "Usé estadísticas vitales del INE y DEIS, el Registro Nacional de Prestadores de la Superintendencia de Salud, estimaciones de ONU/OMS de mortalidad materna y la evidencia Cochrane sobre la continuidad de atención por matronas.",
  "observe": [
   "La fecundidad de 15 a 19 años bajó de 23,2 a 8,3 por mil entre 2018 y 2025: cayó a un tercio.",
   "Aún nacen 146 guaguas al año de madres de 10 a 14 años: todo embarazo a esa edad debe investigarse.",
   "Las matronas inscritas crecieron de 13.723 a 23.333 (+70%) entre 2018 y 2025.",
   "La mortalidad materna de Chile (10 por 100 mil nacidos vivos) es de las más bajas de la región.",
   "El último dato nacional de embarazo no planificado es de 2010."
  ],
  "concluyo": "La prevención funciona y Chile tiene más matronas que nunca: el desafío es ponerlas donde está la prevención, como los colegios, y volver a medir el embarazo no planificado.\n\n---",
  "kpi": [
   {
    "nombre": "Tasa específica de fecundidad de 15 a 19 años",
    "valor": "8,3 por 1.000 (2025)",
    "calculo": "Nacidos vivos de madres de 15 a 19 ÷ mujeres de 15 a 19 × 1.000",
    "evalua": "Cuántos nacimientos hay por cada 1.000 adolescentes",
    "importa": "Indicador ODS 3.7.2; refleja acceso a educación sexual y anticoncepción",
    "meta": "Seguir bajando (23,2 en 2018)"
   },
   {
    "nombre": "Nacidos vivos de madres de 10 a 14 años",
    "valor": "146 (2025)",
    "calculo": "Número de nacidos vivos de madres de 10 a 14 años en el año",
    "evalua": "Embarazos en niñas",
    "importa": "Todo embarazo bajo 14 años es una alerta de protección y posible abuso",
    "meta": "Cero"
   },
   {
    "nombre": "Uso de anticonceptivo en la primera relación",
    "valor": "86,6% (2022)",
    "calculo": "Jóvenes que usaron algún método en su inicio sexual ÷ jóvenes con inicio sexual × 100",
    "evalua": "Protección desde la primera relación",
    "importa": "Es el momento de mayor riesgo de embarazo no planificado e ITS",
    "meta": "Acercarse al 100%"
   },
   {
    "nombre": "Necesidad insatisfecha de planificación familiar",
    "valor": "6% (2019)",
    "calculo": "Mujeres que no quieren embarazarse y no usan método ÷ mujeres en edad fértil × 100",
    "evalua": "Brecha entre el deseo de no embarazarse y el acceso a un método",
    "importa": "Relacionado con el ODS 3.7.1: mide el acceso real a anticoncepción",
    "meta": "Lo más bajo posible"
   },
   {
    "nombre": "Densidad de matronas",
    "valor": "8,7 por 10.000 habitantes (2022)",
    "calculo": "Matronas inscritas ÷ población × 10.000",
    "evalua": "Disponibilidad de matronas para la población",
    "importa": "La OMS usa la densidad de personal de salud para estimar si alcanza para cubrir la atención",
    "meta": "—"
   },
   {
    "nombre": "Crecimiento de matronas inscritas",
    "valor": "+61% (2019–2025)",
    "calculo": "(Inscritas 2025 − inscritas 2019) ÷ inscritas 2019 × 100",
    "evalua": "Cuánto crece la fuerza de trabajo",
    "importa": "Chile forma más matronas de las que contrata: el desafío son los cupos",
    "meta": "—"
   },
   {
    "nombre": "Razón de mortalidad materna (RMM)",
    "valor": "10 por 100.000 nacidos vivos (ONU 2023)",
    "calculo": "Muertes maternas ÷ nacidos vivos × 100.000",
    "evalua": "Riesgo de morir por causas del embarazo, parto o puerperio",
    "importa": "Indicador ODS 3.1.1: refleja acceso y calidad de la atención materna",
    "meta": "ODS: < 70 (mundo); Chile ya la cumple"
   },
   {
    "nombre": "Tasa de mortalidad infantil",
    "valor": "5,9 por 1.000 nacidos vivos (2025)",
    "calculo": "Defunciones de menores de 1 año ÷ nacidos vivos × 1.000",
    "evalua": "Riesgo de morir antes del primer año",
    "importa": "Es uno de los mejores reflejos del nivel de salud de un país",
    "meta": "Mantener bajo 7"
   },
   {
    "nombre": "Tasa de mortalidad neonatal",
    "valor": "4,8 por 1.000 nacidos vivos (2023)",
    "calculo": "Defunciones de 0 a 27 días ÷ nacidos vivos × 1.000",
    "evalua": "Riesgo de morir en el primer mes",
    "importa": "Indicador ODS 3.2.2: depende del control prenatal, el parto y la atención del recién nacido",
    "meta": "ODS: ≤ 12"
   },
   {
    "nombre": "Riesgo relativo de parto prematuro con continuidad de matrona",
    "valor": "RR 0,76 (−24%)",
    "calculo": "Riesgo en el grupo con continuidad de matrona ÷ riesgo en el grupo con atención habitual",
    "evalua": "Cuánto cambia el riesgo con el modelo de matronas",
    "importa": "Un RR menor que 1 indica protección; viene de ensayos clínicos (Cochrane)",
    "meta": "—"
   }
  ],
  "simulador": {
   "puntos": [
    "% de colegios con matrona: qué parte de los colegios tendría una matrona haciendo educación sexual integral.",
    "Anticonceptivos desde los 14 años: si además se entregan métodos (la Ley 20.418 garantiza información y acceso; desde los 14 años la atención es confidencial).",
    "Escenario de efecto: 5% (conservador) o 10% (alto) menos nacimientos adolescentes, según la evidencia de acceso gratuito a DIU e implantes.",
    "Más uso de condón: cuántos puntos sube el uso de condón gracias a la educación; el condón usado siempre reduce cerca de 80% la transmisión del VIH."
   ],
   "aviso": "Es una simulación educativa con supuestos explícitos, no una proyección oficial. La educación sola, sin acceso a métodos, no mostró un efecto claro en embarazos (Cochrane 2016): por eso el simulador separa los dos efectos."
  },
  "paginas": [
   {
    "titulo": "Resumen",
    "emoji": "📊",
    "texto": "Indicadores clave y hallazgos.",
    "img": "01_resumen",
    "tableau": true
   },
   {
    "titulo": "Embarazo adolescente",
    "emoji": "👧",
    "texto": "Fecundidad de 15 a 19 años y nacidos de madres adolescentes.",
    "img": "02_embarazo_adolescente",
    "tableau": true
   },
   {
    "titulo": "Matronas en Chile",
    "emoji": "🩺",
    "texto": "Inscritas por año y comparación con otras profesiones.",
    "img": "03_matronas_en_chile",
    "tableau": true
   },
   {
    "titulo": "Mortalidad materna y neonatal",
    "emoji": "❤️",
    "texto": "Chile, la región y el mundo.",
    "img": "04_mortalidad_materna_y_neonatal",
    "tableau": true
   },
   {
    "titulo": "Lo que dice la evidencia",
    "emoji": "🔬",
    "texto": "Estudios y competencias de la matrona.",
    "img": "05_lo_que_dice_la_evidencia",
    "tableau": true
   },
   {
    "titulo": "Propuestas",
    "emoji": "💡",
    "texto": "Dónde suma una matrona.",
    "img": "06_propuestas",
    "tableau": true
   },
   {
    "titulo": "Simulador: matronas en colegios",
    "emoji": "🏫",
    "texto": "Educación + anticonceptivos desde los 14 años.",
    "img": "07_simulador_matronas_en_colegios",
    "tableau": true
   },
   {
    "titulo": "Qué mide cada KPI",
    "emoji": "📐",
    "texto": "Fórmula, qué evalúa, por qué importa y meta.",
    "img": "08_que_mide_cada_kpi",
    "tableau": true
   }
  ],
  "archivos": {
   "pbix": "Embarazo_Matronas_MariaCisterna.pbix",
   "twbx": "Embarazo_Matronas_MariaCisterna.twbx",
   "xlsx": "Embarazo_Matronas_BaseDatos.xlsx"
  }
 },
 {
  "id": "ajuar",
  "emoji": "🍼",
  "titulo": "El ajuar de Chile Crece Contigo (PARN)",
  "carpeta": "dashboard-ajuar-chile-crece-contigo",
  "muestra": "El Programa de Apoyo al Recién Nacido en datos: cuántos sets se entregan y su cobertura, cuánto cuesta, la cadena logística de la licitación a la familia, qué trae el ajuar y por qué es importante retirarlo para la guagua, la madre y la familia. Cada página parte con sus indicadores clave (KPI) y una página final explica qué mide cada KPI, cómo se calcula y por qué importa. Power BI y Tableau tienen las mismas páginas.",
  "investigue": "Revisé las evaluaciones de DIPRES, la glosa presupuestaria del MINSAL, Cenabast, Chile Crece Contigo y los nacidos vivos del INE para entender cuánto llega el ajuar y cuánto cuesta.",
  "observe": [
   "Entre 97% y 99% de las guaguas que nacen en la red pública recibe el set (2019–2022).",
   "Los sets entregados bajan (141.883 en 2018, 113.858 en 2022) porque nacen menos guaguas, no porque falle el programa.",
   "Cada set cuesta cerca de $67.480 y la ejecución del presupuesto fue 85% en 2018; en 2026 el presupuesto bajó 10,5%.",
   "95,5% de las madres participa en el taller educativo, donde aprende sueño seguro, lactancia y cuidados."
  ],
  "concluyo": "El ajuar llega a casi todas las familias de la red pública; cuidar la cadena de compra y el taller es lo que mantiene ese logro.\n\n---",
  "kpi": [
   {
    "nombre": "Cobertura del set",
    "valor": "97–99% (2019–2022)",
    "calculo": "Sets entregados ÷ nacidos vivos en la red pública × 100",
    "evalua": "Cuántas guaguas que tienen derecho al ajuar lo reciben",
    "importa": "Mide si el programa llega a toda su población objetivo",
    "meta": "100%"
   },
   {
    "nombre": "Proporción de nacidos vivos del país con set",
    "valor": "60,1% (2022)",
    "calculo": "Sets entregados ÷ nacidos vivos en Chile × 100",
    "evalua": "Alcance del programa en todo el país",
    "importa": "El resto nace en clínicas privadas, que no entregan el set",
    "meta": "—"
   },
   {
    "nombre": "Sets entregados",
    "valor": "113.858 (2022)",
    "calculo": "Número de sets entregados en el año",
    "evalua": "Producción del programa",
    "importa": "Se ajusta a la natalidad: bajó de 141.883 (2018) a 100.977 (2021)",
    "meta": "—"
   },
   {
    "nombre": "Ejecución presupuestaria",
    "valor": "85% (2018)",
    "calculo": "Gasto ejecutado ÷ presupuesto asignado × 100",
    "evalua": "Qué parte del dinero asignado se usó",
    "importa": "Un valor bajo puede indicar compras atrasadas o sobrestock",
    "meta": "Cercano a 100%"
   },
   {
    "nombre": "Costo unitario por set",
    "valor": "$67.480 neto (2018)",
    "calculo": "Costo total de compra y distribución ÷ sets",
    "evalua": "Cuánto cuesta cada ajuar",
    "importa": "Permite evaluar eficiencia y comparar licitaciones",
    "meta": "—"
   },
   {
    "nombre": "Variación del presupuesto",
    "valor": "−10,5% (2026)",
    "calculo": "(Presupuesto del año − año anterior) ÷ año anterior × 100",
    "evalua": "Cuánto cambia el financiamiento",
    "importa": "Se justificó por la baja de natalidad y el stock alto",
    "meta": "Garantizar la entrega"
   },
   {
    "nombre": "Puntos de entrega",
    "valor": "137 maternidades",
    "calculo": "Número de maternidades públicas que entregan el set",
    "evalua": "Acceso territorial al programa",
    "importa": "Más puntos de entrega = más familias lo reciben al alta",
    "meta": "Todas las maternidades públicas"
   },
   {
    "nombre": "Participación en el taller educativo",
    "valor": "95,5% (2018)",
    "calculo": "Madres que asistieron al taller ÷ madres que recibieron el set × 100",
    "evalua": "Si la familia aprende a usar cada artículo",
    "importa": "El taller de la matrona es el paso que da sentido al ajuar: sueño seguro, lactancia y apego",
    "meta": "100%"
   }
  ],
  "simulador": null,
  "paginas": [
   {
    "titulo": "Resumen",
    "emoji": "📊",
    "texto": "Indicadores clave, hallazgos y datos clave.",
    "img": "01_resumen",
    "tableau": true
   },
   {
    "titulo": "Entregas y cobertura",
    "emoji": "📦",
    "texto": "Sets por año, cobertura y nacidos vivos.",
    "img": "02_entregas_y_cobertura",
    "tableau": true
   },
   {
    "titulo": "Presupuesto",
    "emoji": "💰",
    "texto": "Presupuesto, costo por set y ejecución.",
    "img": "03_presupuesto",
    "tableau": true
   },
   {
    "titulo": "Cadena logística",
    "emoji": "🔗",
    "texto": "Las 8 etapas: quién, qué, cuánto tarda y punto crítico.",
    "img": "04_cadena_logistica",
    "tableau": true
   },
   {
    "titulo": "¿Qué contiene?",
    "emoji": "🎁",
    "texto": "Los 17 artículos de los dos paquetes.",
    "img": "05_que_contiene",
    "tableau": true
   },
   {
    "titulo": "¿Por qué es importante?",
    "emoji": "💜",
    "texto": "Beneficios y primeros cuidados del recién nacido.",
    "img": "06_por_que_es_importante",
    "tableau": true
   },
   {
    "titulo": "Qué mide cada KPI",
    "emoji": "📐",
    "texto": "Fórmula, qué evalúa, por qué importa y meta.",
    "img": "07_que_mide_cada_kpi",
    "tableau": true
   }
  ],
  "archivos": {
   "pbix": "Ajuar_PARN_MariaCisterna.pbix",
   "twbx": "Ajuar_PARN_MariaCisterna.twbx",
   "xlsx": "Ajuar_PARN_BaseDatos.xlsx"
  }
 },
 {
  "id": "cancer",
  "emoji": "🎗️",
  "titulo": "Cáncer en Chile: cuánto aumenta y cómo ganarle",
  "carpeta": "dashboard-cancer-chile",
  "muestra": "Cuántos casos y muertes por cáncer hay en Chile, cómo han aumentado, cuál predomina en hombres y en mujeres, cómo prevenir cada uno y qué examen lo detecta a tiempo, con las cintas de cada cáncer explicadas. Cada página parte con sus indicadores clave (KPI) y una página final explica qué mide cada KPI, cómo se calcula y por qué importa. Power BI y Tableau tienen las mismas páginas.",
  "investigue": "Usé las defunciones del DEIS, las estimaciones de GLOBOCAN (IARC), la Encuesta Nacional de Salud y datos de cobertura de mamografía, PAP y vacuna VPH, además de la sobrevida por etapa.",
  "observe": [
   "En 2024 hubo cerca de 59.887 casos nuevos y el cáncer causa 1 de cada 4 muertes en Chile.",
   "Las muertes por cáncer aumentaron 71% entre 2001 y 2024, en parte por el envejecimiento de la población.",
   "Solo 37,4% de las mujeres de 50 a 69 años tiene su mamografía al día; la meta es 70%.",
   "Cáncer de mama detectado localizado: 99% de sobrevida a 5 años; con metástasis: 32%.",
   "Cerca de 37,8% de los cánceres se asocia a factores que se pueden modificar."
  ],
  "concluyo": "En cáncer, llegar a tiempo cambia todo: subir la pesquisa (mamografía, PAP, test VPH) y completar la vacuna VPH es lo que más vidas salva.\n\n---",
  "kpi": [
   {
    "nombre": "Casos nuevos de cáncer al año",
    "valor": "59.887 (2024)",
    "calculo": "Número de casos nuevos estimados en el año",
    "evalua": "Carga total de cáncer en Chile",
    "importa": "Sirve para planificar oncólogos, quimioterapia, cirugías y camas",
    "meta": "—"
   },
   {
    "nombre": "Variación de muertes por cáncer",
    "valor": "+71% (2001–2024)",
    "calculo": "(Muertes 2024 − muertes 2001) ÷ muertes 2001 × 100",
    "evalua": "Cuánto ha aumentado la mortalidad por cáncer",
    "importa": "Se explica en parte por el envejecimiento: por eso importan la prevención y la detección precoz",
    "meta": "—"
   },
   {
    "nombre": "Proporción de muertes por cáncer",
    "valor": "1 de cada 4 muertes (26%)",
    "calculo": "Muertes por cáncer ÷ total de defunciones × 100",
    "evalua": "Peso del cáncer entre todas las causas de muerte",
    "importa": "Desde 2019 es la primera causa de muerte en Chile",
    "meta": "—"
   },
   {
    "nombre": "Tasa de incidencia por 100 mil",
    "valor": "Mama: 29,4",
    "calculo": "Casos nuevos ÷ población × 100.000",
    "evalua": "Riesgo de que aparezca un cáncer en un año",
    "importa": "Permite comparar Chile con el mundo y entre tipos de cáncer",
    "meta": "Mundo, mama: 47,8"
   },
   {
    "nombre": "Tasa de mortalidad por 100 mil",
    "valor": "Mama: 10,1",
    "calculo": "Muertes ÷ población × 100.000",
    "evalua": "Riesgo de morir por ese cáncer en un año",
    "importa": "Junto a la incidencia muestra cuán letal es cada cáncer",
    "meta": "Mundo, mama: 12,9"
   },
   {
    "nombre": "Razón mortalidad / incidencia",
    "valor": "Mama: 3,6 muertes por cada 10 casos",
    "calculo": "Muertes ÷ casos nuevos × 10",
    "evalua": "Cuántos mueren por cada 10 diagnosticados",
    "importa": "Es un reflejo del acceso a diagnóstico precoz y tratamiento: más bajo es mejor",
    "meta": "Mundo, mama: 2,8"
   },
   {
    "nombre": "Cobertura de mamografía vigente",
    "valor": "37,4% (mujeres de 50 a 69)",
    "calculo": "Mujeres con mamografía al día ÷ mujeres de 50 a 69 × 100",
    "evalua": "Qué parte de la población objetivo está tamizada",
    "importa": "La mamografía cada 2 a 3 años reduce cerca de 40% las muertes en quienes se la hacen",
    "meta": "70%"
   },
   {
    "nombre": "Cobertura de PAP vigente",
    "valor": "43% (estimada)",
    "calculo": "Mujeres con PAP al día ÷ mujeres de 25 a 64 × 100",
    "evalua": "Qué parte de la población objetivo está tamizada",
    "importa": "El tamizaje cada 3 a 5 años reduce hasta 80% los casos de cáncer cervicouterino",
    "meta": "OMS 2030: 70% tamizadas con test de alta calidad"
   },
   {
    "nombre": "Cobertura de vacuna VPH",
    "valor": "86,2% (niñas menores de 15)",
    "calculo": "Niñas vacunadas ÷ niñas de la cohorte × 100",
    "evalua": "Protección contra el virus que causa el cáncer cervicouterino",
    "importa": "Es la prevención primaria más eficaz; parte de la estrategia de eliminación de la OMS",
    "meta": "90% (OMS 90-70-90)"
   },
   {
    "nombre": "Sobrevida a 5 años según etapa",
    "valor": "Mama: 99% localizado · 32% con metástasis",
    "calculo": "Personas vivas a 5 años del diagnóstico ÷ personas diagnosticadas × 100",
    "evalua": "Probabilidad de seguir con vida 5 años después",
    "importa": "Muestra el valor de detectar a tiempo: la etapa cambia todo",
    "meta": "—"
   },
   {
    "nombre": "Fracción atribuible a factores modificables",
    "valor": "37,8%",
    "calculo": "Casos que se evitarían eliminando los factores de riesgo ÷ casos totales × 100",
    "evalua": "Qué parte del cáncer se puede prevenir",
    "importa": "Tabaco, alcohol, sedentarismo, obesidad e infecciones (VPH, hepatitis B, H. pylori) se pueden cambiar",
    "meta": "—"
   }
  ],
  "simulador": null,
  "paginas": [
   {
    "titulo": "Resumen",
    "emoji": "📊",
    "texto": "Casos y muertes por tipo de cáncer.",
    "img": "01_resumen",
    "tableau": true
   },
   {
    "titulo": "¿Está aumentando?",
    "emoji": "📈",
    "texto": "Muertes por año y proyección.",
    "img": "02_esta_aumentando",
    "tableau": true
   },
   {
    "titulo": "¿Cuál predomina?",
    "emoji": "⚖️",
    "texto": "Los más frecuentes en hombres y mujeres.",
    "img": "03_cual_predomina",
    "tableau": true
   },
   {
    "titulo": "Cómo prevenirlo",
    "emoji": "🛡️",
    "texto": "Prevención y detección de cada cáncer.",
    "img": "04_como_prevenirlo",
    "tableau": true
   },
   {
    "titulo": "Chile y el mundo",
    "emoji": "🌍",
    "texto": "Tasas y muertes por cada 10 casos.",
    "img": "05_chile_y_el_mundo",
    "tableau": true
   },
   {
    "titulo": "Cáncer de mama",
    "emoji": "🌸",
    "texto": "Muertes y mamografía.",
    "img": "06_cancer_de_mama",
    "tableau": true
   },
   {
    "titulo": "Cuello uterino",
    "emoji": "💠",
    "texto": "Vacuna VPH, PAP y mortalidad.",
    "img": "07_cuello_uterino",
    "tableau": true
   },
   {
    "titulo": "Detectarlo a tiempo",
    "emoji": "🔎",
    "texto": "Sobrevida según la etapa y exámenes.",
    "img": "08_detectarlo_a_tiempo",
    "tableau": true
   },
   {
    "titulo": "Qué mide cada KPI",
    "emoji": "📐",
    "texto": "Fórmula, qué evalúa, por qué importa y meta.",
    "img": "09_que_mide_cada_kpi",
    "tableau": true
   }
  ],
  "archivos": {
   "pbix": "Cancer_Chile_MariaCisterna.pbix",
   "twbx": "Cancer_Chile_MariaCisterna.twbx",
   "xlsx": "Cancer_Chile_BaseDatos.xlsx"
  }
 }
];
