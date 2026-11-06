/* Seven source-based lessons. Geometry and audio live in separate local files. */
const EXTENSION_SOURCES={
  "nomenclature": {
    "title": "Caggiati et al. · Nomenclatura venosa (consenso UIP, 2002)",
    "url": "https://doi.org/10.1067/mva.2002.125847"
  },
  "esvs": {
    "title": "ESVS · Guía de enfermedad venosa crónica, 2022",
    "url": "https://www.sf-phlebologie.org/wp-content/uploads/2022/04/ESVS-2022-CVD-guidelines.pdf"
  },
  "svs": {
    "title": "SVS / AVF / AVLS · Guía de várices, parte I",
    "url": "https://pubmed.ncbi.nlm.nih.gov/36326210/"
  },
  "svs2": {
    "title": "SVS / AVF / AVLS · Guía de várices, parte II",
    "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC11523430/"
  },
  "compression": {
    "title": "Rabe et al. · Consenso sobre riesgos y contraindicaciones de compresión, 2020",
    "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC7383414/"
  },
  "pump": {
    "title": "Keijsers et al. · Dinámica de la bomba muscular, 2015",
    "url": "https://doi.org/10.1002/cnm.2714"
  },
  "starling": {
    "title": "Levick y Michel · Intercambio microvascular y principio de Starling revisado, 2010",
    "url": "https://doi.org/10.1093/cvr/cvq062"
  },
  "ceap": {
    "title": "Lurie et al. · Actualización CEAP 2020",
    "url": "https://doi.org/10.1016/j.jvsv.2019.12.075"
  },
  "nih": {
    "title": "NHLBI / NIH · Várices, diagnóstico y tratamiento",
    "url": "https://www.nhlbi.nih.gov/health/varicose-veins"
  },
  "evra": {
    "title": "Gohel et al. · Ensayo EVRA, 2018",
    "url": "https://doi.org/10.1056/NEJMoa1801214"
  },
  "valve": {
    "title": "Lurie et al. · Ciclo y dinámica valvular, 2003",
    "url": "https://pubmed.ncbi.nlm.nih.gov/14603200/"
  },
  "valve2002": {
    "title": "Lurie et al. · Cierre valvular en condiciones fisiológicas, 2002",
    "url": "https://pubmed.ncbi.nlm.nih.gov/11932668/"
  },
  "esvsThrombosis": {
    "title": "ESVS · Guía de trombosis venosa, 2021",
    "url": "https://doi.org/10.1016/j.ejvs.2020.09.023"
  },
  "ashDiagnosis": {
    "title": "ASH · Diagnóstico de tromboembolia venosa, 2018",
    "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC6258916/"
  },
  "ashTreatment": {
    "title": "ASH · Tratamiento de TVP y embolia pulmonar, 2020",
    "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC7556153/"
  },
  "sclero2023": {
    "title": "UIP · Consenso de escleroterapia y prevención de complicaciones, 2023",
    "url": "https://pubmed.ncbi.nlm.nih.gov/36916540/"
  },
  "sclero2021": {
    "title": "DGP · Guía de escleroterapia, 2021",
    "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC8692296/"
  },
  "pts": {
    "title": "Kahn et al. · Orientaciones sobre síndrome postrombótico, 2016",
    "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC4715836/"
  },
  "nivl": {
    "title": "VIVA / AVF / AVLS · Consenso de lesiones ilíacas no trombóticas, 2024",
    "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC11332375/"
  },
  "acrIliac": {
    "title": "ACR · Criterios de imagen en lesión ilíaca no trombótica, 2026",
    "url": "https://pubmed.ncbi.nlm.nih.gov/41701131/"
  },
  "asv": {
    "title": "AVLS / AVF / UIP · Safena anterior: declaración anatómica, 2024",
    "url": "https://pubmed.ncbi.nlm.nih.gov/38008181/"
  }
};
const EXTENSION_UNITS=[
  {
    "id": "estructura",
    "title": "Conoce las estructuras",
    "description": "Del recorrido completo a las capas y conexiones.",
    "ids": [
      "viaje-venoso",
      "pared-3d",
      "fascias",
      "compartimentos-3d",
      "venas-superficiales"
    ]
  },
  {
    "id": "movimiento",
    "title": "Sigue el movimiento",
    "description": "Válvulas, músculos y soporte externo.",
    "ids": [
      "valvula-sana",
      "bomba-muscular",
      "union-safenofemoral",
      "compresion-medica"
    ]
  },
  {
    "id": "cambios",
    "title": "Entiende qué cambia",
    "description": "Reflujo, líquidos, piel y manifestaciones clínicas.",
    "ids": [
      "valvula-incompetente",
      "progresion-varice",
      "microcirculacion",
      "edema-linfatico",
      "clasificacion-ceap",
      "ulcera-venosa"
    ]
  },
  {
    "id": "clinica",
    "title": "Conecta los conceptos",
    "description": "Exploración, tratamiento y trombosis.",
    "ids": [
      "ultrasonido-duplex",
      "escleroterapia",
      "trombosis-venosa-profunda",
      "sindrome-postrombotico",
      "ablacion-endovenosa",
      "trombosis-venosa-superficial",
      "obstruccion-iliaca"
    ]
  }
];
const EXTENSION_STRUCTURES={
  "safena-menor": {
    "name": "Safena menor",
    "patient": "Una vena superficial que asciende por la parte posterior de la pantorrilla.",
    "medico": "Vena safena menor. Se representa una terminación safenopoplítea habitual; existen variantes."
  },
  "tibiales": {
    "name": "Venas tibiales",
    "patient": "Venas profundas de la pierna que conducen sangre hacia la rodilla.",
    "medico": "Trayecto tibial profundo esquemático. Las venas acompañantes y la red plantar se simplifican."
  },
  "poplitea": {
    "name": "Vena poplítea",
    "patient": "Una vena profunda situada detrás de la rodilla.",
    "medico": "Segmento poplíteo, continuo proximalmente con el sistema femoral."
  },
  "femoral": {
    "name": "Venas femorales",
    "patient": "El trayecto profundo que conduce la sangre por el muslo.",
    "medico": "Venas femoral y femoral común. La vena femoral pertenece al sistema profundo."
  },
  "iliacas": {
    "name": "Venas ilíacas",
    "patient": "Conducen la sangre por la pelvis hacia una vena de mayor tamaño.",
    "medico": "Continuidad ilíaca externa–común, representada de forma simplificada antes de la cava inferior."
  },
  "cava": {
    "name": "Vena cava inferior",
    "patient": "La gran vena que lleva sangre desde la parte inferior del cuerpo hacia el corazón.",
    "medico": "Vena cava inferior, que desemboca en la aurícula derecha."
  },
  "auricula": {
    "name": "Aurícula derecha",
    "patient": "La cavidad del corazón que recibe este retorno venoso.",
    "medico": "Aurícula derecha esquemática. Se omiten las demás cavidades y el resto del circuito."
  },
  "telangiectasias": {
    "name": "Telangiectasias",
    "patient": "Vasos pequeños visibles en la piel, a veces llamados arañitas.",
    "medico": "Vénulas intradérmicas dilatadas, habitualmente menores de 1 mm. Componente clínico C1."
  },
  "corona-flebectasica": {
    "name": "Corona flebectásica",
    "patient": "Una disposición en abanico de pequeños vasos alrededor del tobillo o del pie.",
    "medico": "Corona phlebectatica: patrón de pequeñas venas intradérmicas en abanico en región maleolar/pie, clasificado como C4c en CEAP 2020; no confundir con C1 por el calibre aislado."
  },
  "reticulares": {
    "name": "Venas reticulares",
    "patient": "Venas pequeñas que suelen verse como una red bajo la piel.",
    "medico": "Venas subdérmicas dilatadas de 1 a menos de 3 mm; se incluyen en C1."
  },
  "varices": {
    "name": "Várices",
    "patient": "Venas superficiales dilatadas que pueden sobresalir y hacerse tortuosas.",
    "medico": "Venas subcutáneas dilatadas de al menos 3 mm en bipedestación; C2. La escala del modelo está ampliada."
  },
  "dermis": {
    "name": "Dermis",
    "patient": "Una capa de la piel donde hay pequeños vasos.",
    "medico": "Plano dérmico esquemático, representado separado de epidermis y tejido subcutáneo."
  },
  "epidermis": {
    "name": "Epidermis",
    "patient": "La capa más externa de la piel.",
    "medico": "Cubierta epidérmica; el espesor y el tamaño de las células están ampliados para su lectura."
  },
  "media-compresion": {
    "name": "Media de compresión",
    "patient": "Una prenda que aplica presión externa sobre la pierna.",
    "medico": "Compresión graduada esquemática. No se representa una clase de presión ni se indica una prescripción."
  },
  "valvula": {
    "name": "Válvula venosa",
    "patient": "Pliegues que ayudan a limitar el flujo de regreso.",
    "medico": "Representación bicúspide del mecanismo valvular, con inserciones y coaptación simplificadas."
  },
  "transductor": {
    "name": "Transductor",
    "patient": "El dispositivo que envía y recibe ondas de ultrasonido.",
    "medico": "Transductor lineal esquemático, sin parámetros de adquisición ni simulación acústica."
  },
  "vena-ecografia": {
    "name": "Vena en el plano de estudio",
    "patient": "La vena representada debajo del transductor.",
    "medico": "Vena permeable del ejemplo. Su compresibilidad aislada no sustituye un examen completo."
  },
  "arteria-ecografia": {
    "name": "Arteria de referencia",
    "patient": "Un vaso vecino utilizado para comparar las estructuras.",
    "medico": "Vaso arterial acompañante del esquema. La identificación no se establece únicamente por el color Doppler."
  },
  "capilar": {
    "name": "Microvaso sanguíneo",
    "patient": "Un vaso pequeño donde parte del líquido pasa hacia el tejido.",
    "medico": "Microvasculatura simplificada: intercambio transvascular e interfaz con el intersticio."
  },
  "intersticio": {
    "name": "Intersticio",
    "patient": "El espacio entre las células, donde puede acumularse líquido.",
    "medico": "Compartimento intersticial; su volumen se representa de forma conceptual, sin unidades clínicas."
  },
  "linfatico": {
    "name": "Vasos linfáticos",
    "patient": "Recogen líquido del tejido y lo transportan de regreso hacia la circulación.",
    "medico": "Capilares iniciales y colector linfático esquemáticos. No se modelan caudales ni la anatomía completa del drenaje."
  },
  "edema": {
    "name": "Edema",
    "patient": "Acumulación de líquido en los tejidos.",
    "medico": "Aumento conceptual del líquido intersticial por desequilibrio entre filtración y transporte; no identifica la causa en una persona."
  },
  "lesion": {
    "name": "Lesión cutánea",
    "patient": "Una zona de piel con lesión o cicatriz, según el estado observado.",
    "medico": "Lesión o secuela cutánea de representación no fotográfica. El aspecto aislado no demuestra una etiología venosa."
  },
  "inflamacion": {
    "name": "Entorno inflamatorio",
    "patient": "Cambios en las células y el tejido que participan en la lesión.",
    "medico": "Representación cualitativa de activación celular, alteración de barrera y daño tisular; no una cascada molecular exhaustiva."
  },
  "reparacion": {
    "name": "Reparación del tejido",
    "patient": "El cierre de la herida requiere recuperar tejido y cubrir la superficie.",
    "medico": "Granulación y epitelización conceptuales. No predicen plazos ni respuesta a un tratamiento."
  },
  "vena-tratada": {
    "name": "Vena superficial seleccionada",
    "patient": "Segmento superficial representado para explicar el cierre.",
    "medico": "Segmento superficial con lesión térmica y remodelado esquemáticos. No fija indicación ni extensión del tratamiento."
  },
  "vena-profunda-contexto": {
    "name": "Vena profunda",
    "patient": "Conduce sangre por debajo de la fascia muscular.",
    "medico": "Referencia del sistema profundo: debe distinguirse del segmento superficial tratado o trombosado."
  },
  "union-contexto": {
    "name": "Unión superficial-profunda",
    "patient": "Zona donde se conectan una vena superficial y otra profunda.",
    "medico": "Referencia proximal de una conexión superficial-profunda, sin distancias a escala. No sirve para posicionar un catéter."
  },
  "cateter-termico": {
    "name": "Catéter térmico",
    "patient": "Instrumento que transmite energía al segmento seleccionado.",
    "medico": "Representación conjunta de técnicas térmicas. La posición, potencia, temperatura y velocidad dependen del dispositivo, técnica y evaluación."
  },
  "tumescencia": {
    "name": "Tumescencia perivenosa",
    "patient": "Líquido colocado alrededor de la vena durante ciertos procedimientos.",
    "medico": "En ablación térmica, la tumescencia aporta anestesia y ayuda a separar/proteger tejidos y comprimir el segmento. No se representa dosis ni composición."
  },
  "zona-termica": {
    "name": "Frente térmico ilustrado",
    "patient": "Zona de acción localizada durante la retirada del catéter.",
    "medico": "Marcador conceptual de energía. No representa un mapa térmico ni modela la propagación de calor."
  },
  "nervio-contexto": {
    "name": "Nervio: referencia de proximidad",
    "patient": "Estructura cercana que debe protegerse durante el tratamiento.",
    "medico": "Referencia nerviosa simplificada. La proximidad nervio-vena varía según el territorio y la persona."
  },
  "safena-tvs": {
    "name": "Safena: sistema superficial",
    "patient": "Vena superficial que puede contener un trombo.",
    "medico": "Eje safeno ilustrado para localizar TVS y relacionar su extremo proximal con el sistema profundo."
  },
  "trombo-superficial": {
    "name": "Trombo superficial",
    "patient": "Coágulo localizado en una vena superficial.",
    "medico": "TVS de extensión variable. El aspecto de la piel no mide longitud ni excluye TVP o embolia pulmonar."
  },
  "trombo-profundo": {
    "name": "TVP asociada: comparación",
    "patient": "Coágulo en una vena profunda, mostrado en un escenario distinto.",
    "medico": "Ejemplo de coexistencia de TVS y TVP; no representa una progresión inevitable ni una tasa de extensión."
  },
  "inflamacion-local": {
    "name": "Inflamación perivenosa",
    "patient": "Cambio local que puede acompañar un trombo superficial.",
    "medico": "Halo conceptual de inflamación; no demuestra infección ni representa temperatura medida."
  },
  "iliaca-comun-izquierda": {
    "name": "Ilíaca común izquierda",
    "patient": "Vena que conduce sangre desde el lado izquierdo de la pelvis hacia la cava.",
    "medico": "Cruza hacia la cava inferior y puede relacionarse con la arteria ilíaca común derecha y estructuras lumbares. Compresión anatómica no equivale a síndrome."
  },
  "iliaca-comun-derecha": {
    "name": "Ilíaca común derecha",
    "patient": "Conduce sangre desde el lado derecho de la pelvis.",
    "medico": "Se une con la ilíaca común izquierda para formar la cava inferior; trayecto y proporciones simplificados."
  },
  "arteria-iliaca-derecha": {
    "name": "Arteria ilíaca común derecha",
    "patient": "Arteria que cruza por delante de la vena ilíaca común izquierda.",
    "medico": "Relación anterior en el patrón clásico de compresión ilíaca izquierda. No implica por sí sola una obstrucción clínicamente significativa."
  },
  "arteria-iliaca-izquierda": {
    "name": "Arteria ilíaca común izquierda",
    "patient": "Arteria que lleva sangre hacia el lado izquierdo de la pelvis.",
    "medico": "Referencia arterial contralateral para orientación espacial. No se simula circulación arterial."
  },
  "columna-lumbar": {
    "name": "Referencia lumbar posterior",
    "patient": "Estructuras óseas que ayudan a situar los vasos en profundidad.",
    "medico": "Referencia vertebral simplificada posterior al cruce vascular, sin reconstrucción individual ni asignación de nivel a escala."
  },
  "sinequias-iliacas": {
    "name": "Bandas postrombóticas",
    "patient": "Tejido residual que puede alterar el paso por una vena después de una trombosis.",
    "medico": "Bandas intraluminales conceptuales en una comparación postrombótica. Se distinguen de la lesión ilíaca no trombótica."
  },
  "colaterales-pelvicas": {
    "name": "Vía colateral: ejemplo",
    "patient": "Camino alternativo que puede participar en el drenaje venoso.",
    "medico": "Trayecto conceptual, no mapa anatómico exhaustivo. Su presencia no mide la relevancia hemodinámica ni indica por sí sola intervención."
  },
  "nivel-valvular": {
    "name": "Nivel valvular: marcador",
    "patient": "Los anillos señalan niveles valvulares de referencia; no son la forma de una válvula.",
    "medico": "Marcadores anulares de posición/estado en esta comparación morfológica. No representan la geometría de las cúspides ni un diagnóstico de competencia valvular."
  }
};
const EXTENSION_LESSONS={
  "viaje-venoso": {
    "patientTitle": "Del pie al corazón",
    "patient": "Sigue la sangre por los sistemas profundo y superficial hasta la aurícula derecha.",
    "objective": "Reconocer los caminos principales del retorno venoso.",
    "medObjective": "Relacionar tibiales, poplítea, femorales, ilíacas y cava con los ejes safenos.",
    "steps": [
      "Localiza los sistemas",
      "Sigue el trayecto profundo",
      "Explora la safena mayor"
    ],
    "actions": [
      [
        [
          "seg",
          "Trayecto",
          0
        ]
      ],
      [
        [
          "seg",
          "Trayecto",
          1
        ]
      ],
      [
        [
          "seg",
          "Trayecto",
          2
        ]
      ]
    ],
    "question": "¿A qué cavidad llega la vena cava inferior?",
    "answers": [
      "A la aurícula derecha",
      "Directamente al ventrículo izquierdo"
    ],
    "correct": 0,
    "why": "La cava inferior desemboca en la aurícula derecha. El modelo no representa el circuito completo."
  },
  "venas-superficiales": {
    "patientTitle": "Arañitas, reticulares y várices",
    "patient": "Compara tres ejemplos por su aspecto y su relación con la piel.",
    "objective": "Distinguir vasos pequeños de la piel y venas subcutáneas dilatadas.",
    "medObjective": "Relacionar localización, calibres convencionales y componentes C1/C2 sin inferir el origen del reflujo.",
    "steps": [
      "Compara las tres formas",
      "Separa la piel por capas",
      "Reconoce una várice"
    ],
    "actions": [
      [
        [
          "seg",
          "Comparación",
          0
        ]
      ],
      [
        [
          "sl",
          "Separación de tejidos",
          0.85
        ]
      ],
      [
        [
          "seg",
          "Comparación",
          3
        ]
      ]
    ],
    "question": "¿Las arañitas y las várices representan siempre la misma manifestación clínica?",
    "answers": [
      "Sí, son términos idénticos",
      "No, se distinguen por características y clasificación"
    ],
    "correct": 1,
    "why": "Telangiectasias y reticulares corresponden a C1; las várices, a C2. El aspecto no establece por sí solo su causa."
  },
  "compresion-medica": {
    "patientTitle": "Qué hace una media de compresión",
    "patient": "Explora el soporte externo y su relación con la actividad muscular.",
    "objective": "Entender el papel de la compresión sin usar el modelo para elegir una presión.",
    "medObjective": "Relacionar soporte tisular y bomba muscular; reconocer la valoración arterial y el ajuste como requisitos clínicos.",
    "steps": [
      "Observa sin la prenda",
      "Añade el soporte externo",
      "Activa la bomba muscular"
    ],
    "actions": [
      [
        [
          "seg",
          "Situación",
          0
        ]
      ],
      [
        [
          "seg",
          "Situación",
          1
        ]
      ],
      [
        [
          "seg",
          "Situación",
          2
        ]
      ]
    ],
    "question": "¿El control de esta animación sirve para elegir la presión de una media?",
    "answers": [
      "No, esa selección requiere valoración profesional",
      "Sí, cuanto más alto, mejor para todos"
    ],
    "correct": 0,
    "why": "La indicación depende del problema, la perfusión arterial, el ajuste y otras condiciones. El control no prescribe."
  },
  "ultrasonido-duplex": {
    "patientTitle": "Una mirada con ultrasonido",
    "patient": "Relaciona transductor, anatomía y representaciones del estudio dúplex.",
    "objective": "Distinguir imagen anatómica, compresión y señales de flujo.",
    "medObjective": "Diferenciar modo B, compresibilidad y Doppler; evitar interpretar rojo/azul como identidad vascular o diagnóstico aislado.",
    "steps": [
      "Localiza la vena en modo B",
      "Explora la compresibilidad",
      "Observa el flujo y su registro"
    ],
    "actions": [
      [
        [
          "seg",
          "Vista del estudio",
          0
        ]
      ],
      [
        [
          "seg",
          "Vista del estudio",
          1
        ]
      ],
      [
        [
          "seg",
          "Vista del estudio",
          3
        ]
      ]
    ],
    "question": "¿El rojo y el azul del Doppler significan siempre arteria y vena?",
    "answers": [
      "Sí, el color basta para identificarlas",
      "No, representan dirección respecto al haz según el mapa"
    ],
    "correct": 1,
    "why": "El mapa de color depende de la dirección respecto al transductor y de la configuración; no identifica por sí solo el tipo de vaso."
  },
  "edema-linfatico": {
    "patientTitle": "Líquido entre las células",
    "patient": "Sigue el intercambio entre sangre, tejido y vasos linfáticos.",
    "objective": "Relacionar la hinchazón con el equilibrio del líquido en el tejido.",
    "medObjective": "Representar filtración y retorno linfático sin imponer reabsorción venular sostenida universal ni una causa única de edema.",
    "steps": [
      "Observa el equilibrio",
      "Aumenta la carga de filtración",
      "Reduce el transporte linfático"
    ],
    "actions": [
      [
        [
          "seg",
          "Escenario",
          0
        ]
      ],
      [
        [
          "seg",
          "Escenario",
          1
        ]
      ],
      [
        [
          "seg",
          "Escenario",
          2
        ]
      ]
    ],
    "question": "¿Qué sistema participa en retirar líquido del intersticio?",
    "answers": [
      "El sistema linfático",
      "Solamente la superficie de la piel"
    ],
    "correct": 0,
    "why": "El transporte linfático es fundamental para el balance tisular. La hinchazón puede tener causas venosas, linfáticas y sistémicas."
  },
  "clasificacion-ceap": {
    "patientTitle": "Un lenguaje para describir lo que vemos",
    "patient": "Explora las manifestaciones clínicas de C0 a C6 sin tratarlas como una cuenta regresiva.",
    "objective": "Comprender que la clasificación describe hallazgos, no el futuro de una persona.",
    "medObjective": "Identificar el componente clínico CEAP 2020, incluidas C4a/b/c, C5/C6 y los modificadores aplicables.",
    "steps": [
      "Compara C1 y C2",
      "Explora los cambios de piel",
      "Distingue úlcera cerrada y abierta"
    ],
    "actions": [
      [
        [
          "seg",
          "Manifestación clínica",
          2
        ]
      ],
      [
        [
          "seg",
          "Manifestación clínica",
          4
        ]
      ],
      [
        [
          "seg",
          "Manifestación clínica",
          8
        ]
      ]
    ],
    "question": "¿Una persona con C1 necesariamente terminará en C6?",
    "answers": [
      "Sí, CEAP es una cronología obligatoria",
      "No, son categorías descriptivas"
    ],
    "correct": 1,
    "why": "El componente clínico clasifica manifestaciones en un momento determinado. No predice una evolución inevitable."
  },
  "ulcera-venosa": {
    "patientTitle": "Cuando la piel pierde su continuidad",
    "patient": "Acércate al tejido y relaciona el contexto venoso con la lesión y la reparación.",
    "objective": "Entender que una herida requiere estudiar su causa y no solo su aspecto.",
    "medObjective": "Relacionar hipertensión venosa, microcirculación y lesión cutánea, distinguiendo mecanismo ilustrativo, etiología y evaluación arterial.",
    "steps": [
      "Ubica los planos del tejido",
      "Examina una lesión abierta",
      "Observa la reparación conceptual"
    ],
    "actions": [
      [
        [
          "seg",
          "Estado del tejido",
          0
        ],
        [
          "sl",
          "Separación de tejidos",
          0.65
        ]
      ],
      [
        [
          "seg",
          "Estado del tejido",
          1
        ],
        [
          "sl",
          "Separación de tejidos",
          0.65
        ]
      ],
      [
        [
          "seg",
          "Estado del tejido",
          2
        ],
        [
          "sl",
          "Separación de tejidos",
          0.25
        ]
      ]
    ],
    "question": "¿Toda herida cerca del tobillo es venosa?",
    "answers": [
      "No, la causa requiere evaluación clínica",
      "Sí, la localización es suficiente"
    ],
    "correct": 0,
    "why": "Pueden existir causas arteriales, mixtas y otras. La valoración de la herida y de la circulación orienta el diagnóstico y el manejo."
  },
  "ablacion-endovenosa": {
    "patientTitle": "Cómo se cierra un segmento seleccionado",
    "patient": "Explora catéter, líquido perivenoso y cierre conceptual.",
    "objective": "Distinguir el segmento tratado del drenaje profundo.",
    "medObjective": "Relacionar ablación térmica, tumescencia y conservación del sistema profundo.",
    "steps": [
      "Localiza las relaciones",
      "Observa la tumescencia",
      "Compara el cierre"
    ],
    "actions": [
      [
        [
          "seg",
          "Etapa",
          0
        ]
      ],
      [
        [
          "seg",
          "Etapa",
          1
        ]
      ],
      [
        [
          "seg",
          "Etapa",
          2
        ],
        [
          "sl",
          "Recorrido del catéter",
          0.75
        ]
      ]
    ],
    "question": "¿El esquema permite elegir potencia o dosis de tumescencia?",
    "answers": [
      "Sí, con la posición del catéter",
      "No, requiere valoración y técnica específica"
    ],
    "correct": 1,
    "why": "El modelo explica relaciones y un mecanismo. No representa dosimetría, distancias ni un plan de tratamiento."
  },
  "trombosis-venosa-superficial": {
    "patientTitle": "Un coágulo en una vena superficial",
    "patient": "Sitúa el trombo y su relación con las venas profundas.",
    "objective": "Entender por qué importa localizar y medir la extensión de una TVS.",
    "medObjective": "Distinguir TVS localizada, cercanía a la unión y coexistencia de TVP.",
    "steps": [
      "Sitúa la TVS",
      "Acércate a la unión",
      "Compara una TVP asociada"
    ],
    "actions": [
      [
        [
          "seg",
          "Escenario",
          0
        ]
      ],
      [
        [
          "seg",
          "Escenario",
          1
        ]
      ],
      [
        [
          "seg",
          "Escenario",
          2
        ]
      ]
    ],
    "question": "¿El enrojecimiento de la piel muestra toda la extensión del trombo?",
    "answers": [
      "No, se necesita evaluación y dúplex",
      "Sí, siempre coincide con sus extremos"
    ],
    "correct": 0,
    "why": "La evaluación por dúplex localiza la extensión y busca relación con el sistema profundo o TVP coexistente."
  },
  "obstruccion-iliaca": {
    "patientTitle": "Cuando el drenaje se estrecha en la pelvis",
    "patient": "Separa arteria, vena y referencia lumbar para comprender el cruce.",
    "objective": "Distinguir una compresión anatómica de un diagnóstico clínico.",
    "medObjective": "Comparar compresión no trombótica y cambios postrombóticos sin inferir indicación de stent.",
    "steps": [
      "Reconoce el drenaje proximal",
      "Separa el cruce vascular",
      "Compara la secuela trombótica"
    ],
    "actions": [
      [
        [
          "seg",
          "Relación proximal",
          0
        ],
        [
          "sl",
          "Separar relaciones",
          0
        ]
      ],
      [
        [
          "seg",
          "Relación proximal",
          1
        ],
        [
          "sl",
          "Separar relaciones",
          0.65
        ]
      ],
      [
        [
          "seg",
          "Relación proximal",
          2
        ],
        [
          "sl",
          "Separar relaciones",
          0
        ],
        [
          "tg",
          "Mostrar vías colaterales",
          true
        ]
      ]
    ],
    "question": "¿Una compresión ilíaca vista en una imagen indica siempre un stent?",
    "answers": [
      "Sí, por su forma",
      "No, requiere correlación clínica y estudio apropiado"
    ],
    "correct": 1,
    "why": "La compresión puede ser asintomática. La decisión integra síntomas, diagnósticos alternativos y pruebas adecuadas."
  }
};
const EXTENSION_MODULES=[
  {id:'viaje-venoso',cat:'Anatomía',title:'Retorno venoso: del pie a la aurícula derecha',kind:'3d',init:venousJourney3D,thumb:extensionThumb('journey'),blurb:'Sistemas superficial y profundo, conexiones proximales y llegada al corazón en un recorrido 3D.',sources:['nomenclature','esvs'],scope:'Trayectos y proporciones simplificados. Se ilustra una anatomía habitual; existen variantes.',text:{paciente:'<p>La sangre regresa desde los pies hacia el corazón por una red de venas. Unas recorren los planos superficiales; otras discurren por debajo de la fascia muscular.</p><p>Sigue el camino profundo hasta la pelvis y la vena cava inferior. La safena mayor y la menor se conectan con el sistema profundo. Este recorrido termina en la aurícula derecha.</p>',medico:'<p>El modelo relaciona un eje tibial esquemático con vena poplítea, vena femoral, femoral común, ilíaca externa, ilíaca común y cava inferior. La vena femoral es profunda.</p><p>Se muestran las uniones safenofemoral y una terminación safenopoplítea habitual. La terminación de la safena menor es variable. Se simplifican venas acompañantes, tributarias y trayectos pélvicos; no es un atlas individual ni una simulación hemodinámica.</p>'}},
  {id:'venas-superficiales',cat:'Morfología',title:'Telangiectasias, reticulares y várices en 3D',kind:'3d',init:surfaceVeins3D,thumb:extensionThumb('surface'),blurb:'Comparación anatómica de vasos dérmicos, subdérmicos y venas subcutáneas dilatadas.',sources:['esvs','svs2'],scope:'Calibres y capas ampliados. Ejemplos comparativos; no representan una progresión obligatoria.',text:{paciente:'<p>Las arañitas son vasos pequeños visibles en la piel. Las venas reticulares forman redes algo mayores bajo ella. Las várices son venas superficiales dilatadas que pueden sobresalir y hacerse tortuosas.</p><p>Separa las capas para reconocer su ubicación. Una apariencia concreta no permite saber por sí sola cómo funciona todo el sistema venoso.</p>',medico:'<p>Telangiectasias: vénulas intradérmicas habitualmente menores de 1 mm. Reticulares: venas subdérmicas de 1 a menos de 3 mm. Ambas pertenecen a C1. Várices: venas subcutáneas de al menos 3 mm en bipedestación, C2.</p><p>Los ejemplos amplían espesores y calibres para ser legibles. La clasificación morfológica no demuestra reflujo, su origen ni la necesidad de tratamiento; la evaluación se individualiza.</p>'}},
  {id:'compresion-medica',cat:'Tratamiento',title:'Compresión médica y bomba muscular',kind:'3d',init:compression3D,thumb:extensionThumb('compression'),blurb:'Prenda graduada, soporte tisular y contracción muscular con planos explorables.',sources:['compression','nih','pump'],scope:'No representa una clase de presión ni recomienda una prenda. Requiere valoración y ajuste, incluida la circulación arterial.',text:{paciente:'<p>Una prenda de compresión aplica presión externa. Puede ayudar a controlar hinchazón y otros síntomas, y se relaciona con la actividad muscular al caminar.</p><p>No reconstruye por sí sola las válvulas dañadas. La indicación, talla y presión se eligen con valoración profesional. El modelo muestra un mecanismo general y no permite elegir una media.</p>',medico:'<p>La compresión modifica el entorno mecánico de tejidos y vasos y puede apoyar la función de bombeo. La representación graduada es cualitativa: no se calculan presión de interfaz, rigidez ni respuesta de un paciente.</p><p>La evaluación debe considerar perfusión arterial, piel, sensibilidad, ajuste y comorbilidades. La enfermedad arterial grave y determinadas situaciones de insuficiencia cardiaca exigen especial consideración. No se proporcionan umbrales ni una prescripción.</p>'}},
  {id:'ultrasonido-duplex',cat:'Diagnóstico',title:'Ultrasonido dúplex: anatomía, compresión y flujo',kind:'3d',init:duplex3D,thumb:extensionThumb('duplex'),blurb:'Transductor 3D y panel esquemático de modo B, compresión, color y Doppler espectral.',sources:['svs','nih'],scope:'Imágenes y señales generadas como esquemas. No son un estudio real ni permiten establecer o excluir un diagnóstico.',text:{paciente:'<p>El transductor envía y recibe ultrasonido. El estudio permite relacionar la forma de los vasos con información sobre el flujo.</p><p>Explora distintas vistas del ejemplo. La presión suave del transductor modifica una vena permeable. Los colores indican dirección respecto al haz según el mapa usado; no significan simplemente arteria y vena.</p>',medico:'<p>El esquema separa modo B, compresibilidad, Doppler color y registro espectral. La evaluación de reflujo considera posición, maniobras, segmento estudiado y mediciones en un examen completo.</p><p>La compresibilidad de un único segmento y la presencia o ausencia de color no establecen ni descartan TVP. La señal cambia con técnica y configuración. Se omiten ajustes instrumentales, umbrales diagnósticos y adquisición clínica.</p>'}},
  {id:'edema-linfatico',cat:'Fisiopatología',title:'Filtración, intersticio y drenaje linfático',kind:'3d',init:edema3D,thumb:extensionThumb('edema'),blurb:'Intercambio microvascular y transporte de líquido hacia linfáticos en un tejido explorable.',sources:['starling','compression'],scope:'Balance conceptual sin unidades clínicas. El edema tiene múltiples causas y no se diagnostica con estos controles.',text:{paciente:'<p>Parte del líquido de los vasos pequeños pasa al espacio entre las células. Los vasos linfáticos recogen líquido y proteínas del tejido y contribuyen a devolverlos a la circulación.</p><p>Puede haber hinchazón si entra más líquido del que se retira o si el transporte está limitado. Las causas pueden ser venosas, linfáticas o sistémicas; no toda hinchazón significa várices.</p>',medico:'<p>Se ilustra el balance entre filtración transvascular y transporte linfático. En la mayoría de los tejidos, el estado estable no se describe correctamente como filtración arterial compensada por reabsorción venular sostenida universal.</p><p>El aumento de presión venosa puede elevar la carga de filtración; alteraciones de barrera, proteínas plasmáticas y transporte linfático también participan. El modelo no calcula fuerzas de Starling, caudales ni respuesta terapéutica.</p>'}},
  {id:'clasificacion-ceap',cat:'Diagnóstico',title:'CEAP 2020: manifestaciones clínicas en 3D',kind:'3d',init:ceap3D,thumb:extensionThumb('ceap'),blurb:'Categorías clínicas, cambios cutáneos y diferencia entre úlcera cicatrizada y activa.',sources:['ceap','esvs'],scope:'Componente clínico C. Las categorías no son una línea de tiempo ni un diagnóstico por imagen.',text:{paciente:'<p>Esta clasificación sirve para describir lo que se observa en una pierna. Puedes comparar vasos visibles, hinchazón, cambios en la piel y heridas cerradas o abiertas.</p><p>Los botones son categorías de comparación: no representan el destino de una persona ni una secuencia obligatoria de empeoramiento. Los síntomas y el estudio médico aportan más información.</p>',medico:'<p>Componente clínico CEAP 2020: C0 sin signos visibles o palpables; C1 telangiectasias/reticulares; C2 várices; C3 edema; C4 cambios cutáneos y subcutáneos. C4a: pigmentación o eczema; C4b: lipodermatoesclerosis o atrofia blanca; C4c: corona flebectásica; C5: úlcera cicatrizada; C6: úlcera activa.</p><p>Los modificadores A/S indican ausencia/presencia de síntomas; r se aplica a várices o úlceras recurrentes (C2r/C6r). CEAP incluye además etiología, anatomía y fisiopatología, no inferibles de este modelo. No es una escala temporal de evolución.</p>'}},
  {id:'ulcera-venosa',cat:'Fisiopatología',title:'Úlcera venosa: tejido, lesión y reparación',kind:'3d',init:ulcer3D,thumb:extensionThumb('ulcer'),blurb:'Corte tisular con lesión, entorno microvascular y comparación de reparación conceptual.',sources:['esvs','evra'],scope:'Mecanismo simplificado, sin tiempos de curación. La etiología y la perfusión arterial requieren evaluación clínica.',text:{paciente:'<p>Una úlcera es una pérdida de continuidad de la piel. En la enfermedad venosa, la presión elevada mantenida y los cambios en los vasos pequeños pueden contribuir al daño del tejido.</p><p>No todas las heridas de pierna son venosas. Estudiar su causa y la circulación permite orientar el manejo. La reparación mostrada aquí es un concepto, no una promesa de curación.</p>',medico:'<p>La hipertensión venosa sostenida se asocia a alteraciones microcirculatorias, inflamación y cambios tisulares que participan en la ulceración. No se presenta una única vía causal ni una evolución inevitable desde una várice.</p><p>La valoración debe establecer etiología, perfusión arterial y factores locales/sistémicos. La compresión y el manejo del reflujo pueden formar parte del tratamiento cuando están indicados; el esquema no selecciona intervenciones ni predice plazos de cicatrización.</p>'}}
,

  {
    "id": "ablacion-endovenosa",
    "cat": "Tratamiento",
    "title": "Ablación endovenosa térmica en 3D",
    "kind": "3d",
    "init": endovenousAblation3D,
    "thumb": clinicalThumb("ablation"),
    "blurb": "Catéter, tumescencia y cierre del segmento superficial, conservando la referencia profunda.",
    "sources": [
      "esvs",
      "svs2"
    ],
    "scope": "Comparación de etapas, sin parámetros de tratamiento, simulación térmica ni garantía de cierre.",
    "text": {
      "paciente": "<p>La ablación térmica utiliza energía transmitida desde un catéter para producir una lesión controlada en una vena superficial seleccionada. Con el remodelado puede quedar un segmento fibroso.</p><p>Durante estas técnicas se utiliza tumescencia alrededor de la vena para anestesia y protección de tejidos. La vena profunda se conserva como parte del drenaje.</p><p>La indicación y los cuidados se individualizan. Hay alternativas térmicas y no térmicas; el dibujo no elige una técnica ni promete un resultado.</p>",
      "medico": "<p>El esquema reúne principios de ablación térmica por láser o radiofrecuencia, sin reproducir un dispositivo ni su dosimetría. La posición ecográfica, el control de energía, la tumescencia y las relaciones con piel, nervios y sistema profundo son relevantes para la seguridad.</p><p>La tumescencia proporciona anestesia, compresión perivenosa y separación/protección de estructuras. El daño térmico y el posterior remodelado pueden producir oclusión; existen recanalización y complicaciones, incluidas lesión nerviosa/cutánea y extensión trombótica relacionada con ablación.</p><p>No se representan dosis, temperatura, potencia, distancia a la unión, retirada validada ni criterios de selección. El segmento proximal de referencia no es una recomendación de posicionamiento.</p>"
    }
  },
  {
    "id": "trombosis-venosa-superficial",
    "cat": "Trombosis",
    "title": "Trombosis venosa superficial en 3D",
    "kind": "3d",
    "init": superficialThrombosis3D,
    "thumb": clinicalThumb("svt"),
    "blurb": "Trombo superficial, inflamación local, proximidad a la unión y comparación con TVP coexistente.",
    "sources": [
      "esvsThrombosis",
      "svs2"
    ],
    "scope": "Escenarios independientes; no mide extensión, distancia, riesgo ni una indicación de anticoagulación.",
    "text": {
      "paciente": "<p>La trombosis venosa superficial es un coágulo en una vena superficial. Puede acompañarse de dolor, enrojecimiento o un cordón sensible, pero esos signos no muestran necesariamente toda su extensión.</p><p>Puede coexistir con una trombosis profunda o aproximarse a una unión con el sistema profundo. Por eso requiere valoración y estudio dúplex cuando se sospecha.</p><p>El tratamiento depende de la extensión, localización y situación de la persona. Ante falta de aire, dolor torácico o desmayo se necesita atención urgente.</p>",
      "medico": "<p>El dúplex debe localizar el trombo, describir su longitud y cercanía a las uniones, y evaluar el sistema profundo. El aspecto inflamatorio local no excluye extensión o TVP concomitante.</p><p>La anatomía y los factores clínicos modifican la estrategia, incluida la consideración de anticoagulación. No debe equipararse TVS a una enfermedad inocua ni tratar toda TVS con una pauta idéntica.</p><p>Los tres escenarios son comparaciones, sin cronología obligatoria ni distancias a escala. No se simula infección, probabilidad embólica, laboratorio ni respuesta a medicamentos.</p>"
    }
  },
  {
    "id": "obstruccion-iliaca",
    "cat": "Diagnóstico",
    "title": "Compresión y obstrucción ilíaca en 3D",
    "kind": "3d",
    "init": iliacObstruction3D,
    "thumb": clinicalThumb("iliac"),
    "blurb": "Cruce arteria-vena, referencia lumbar, comparación postrombótica y vía colateral conceptual.",
    "sources": [
      "nivl",
      "acrIliac"
    ],
    "scope": "Relaciones simplificadas; anatomía aislada no equivale a síndrome ni determina indicación de intervención.",
    "text": {
      "paciente": "<p>Las venas ilíacas llevan sangre desde la pelvis hacia la vena cava inferior. En una disposición habitual, una arteria cruza por delante de la vena ilíaca común izquierda.</p><p>Una compresión puede observarse sin causar síntomas. En otras situaciones, la dificultad de drenaje o una secuela de trombosis puede participar en molestias e hinchazón.</p><p>Separar las piezas ayuda a comprender su posición. El diagnóstico y la necesidad de tratamiento requieren relacionar síntomas y estudios; la imagen por sí sola no indica un stent.</p>",
      "medico": "<p>La relación clásica es la compresión de la vena ilíaca común izquierda entre la arteria ilíaca común derecha y la referencia lumbar posterior. La compresión anatómica es frecuente en personas asintomáticas y no debe denominarse automáticamente síndrome clínico.</p><p>Se distingue una lesión no trombótica de bandas y obstrucción residual postrombótica. La atribución de síntomas requiere considerar otras causas y realizar estudio apropiado. Dúplex y técnicas axiales aportan información; la valoración invasiva con venografía/IVUS se reserva al contexto correspondiente.</p><p>La animación no calcula reducción de área, gradiente o caudal ni indica stent o antitrombóticos. Las colaterales son una referencia conceptual y no una prueba aislada de relevancia clínica.</p>"
    }
  }
];
const EXTENSION_VIDEOS={
  "viaje-venoso": [
    {
      "s": "Vamos a seguir el regreso de la sangre desde el pie hasta el corazón, en una anatomía simplificada.",
      "a": [
        [
          "seg",
          "Trayecto",
          0
        ]
      ],
      "c": {
        "p": [
          10,
          3,
          24
        ],
        "t": [
          0,
          1.5,
          0
        ]
      }
    },
    {
      "s": "Las venas profundas recorren los planos situados por debajo de la fascia muscular.",
      "a": [
        [
          "seg",
          "Trayecto",
          1
        ]
      ],
      "c": {
        "p": [
          7,
          0,
          16
        ],
        "t": [
          0,
          -1,
          0
        ]
      }
    },
    {
      "s": "Desde la pierna, el trayecto continúa por la vena poplítea y las venas del muslo.",
      "c": {
        "p": [
          7,
          2,
          16
        ],
        "t": [
          0,
          1,
          0
        ]
      }
    },
    {
      "s": "La safena mayor pertenece al sistema superficial y se une a la vena femoral común cerca de la ingle.",
      "a": [
        [
          "seg",
          "Trayecto",
          2
        ]
      ],
      "c": {
        "p": [
          8,
          3,
          16
        ],
        "t": [
          0.3,
          2.3,
          0
        ]
      }
    },
    {
      "s": "La safena menor asciende por detrás de la pantorrilla; su terminación puede variar entre personas.",
      "a": [
        [
          "seg",
          "Trayecto",
          3
        ]
      ],
      "c": {
        "p": [
          -9,
          0,
          -15
        ],
        "t": [
          0,
          -1,
          0
        ]
      }
    },
    {
      "s": "El retorno sigue por las venas ilíacas y la vena cava inferior hasta la aurícula derecha.",
      "a": [
        [
          "seg",
          "Trayecto",
          0
        ]
      ],
      "c": {
        "p": [
          8,
          6,
          18
        ],
        "t": [
          0,
          6,
          0
        ]
      }
    },
    {
      "s": "Los colores y las proporciones ayudan a reconocer los caminos; no son una medición del flujo de una persona.",
      "c": {
        "p": [
          10,
          3,
          24
        ],
        "t": [
          0,
          1.5,
          0
        ]
      }
    }
  ],
  "venas-superficiales": [
    {
      "s": "No todas las venas visibles tienen la misma forma ni ocupan el mismo plano de la piel.",
      "a": [
        [
          "seg",
          "Comparación",
          0
        ],
        [
          "sl",
          "Separación de tejidos",
          0
        ]
      ],
      "c": {
        "p": [
          9,
          7,
          13
        ],
        "t": [
          0,
          0.2,
          0
        ]
      }
    },
    {
      "s": "Las telangiectasias, llamadas arañitas, son vasos pequeños visibles en la piel.",
      "a": [
        [
          "seg",
          "Comparación",
          1
        ]
      ],
      "c": {
        "p": [
          3,
          5,
          10
        ],
        "t": [
          -2.6,
          0.9,
          0
        ]
      }
    },
    {
      "s": "Las venas reticulares suelen dibujar una red algo mayor bajo la superficie.",
      "a": [
        [
          "seg",
          "Comparación",
          2
        ]
      ],
      "c": {
        "p": [
          5,
          5,
          10
        ],
        "t": [
          0,
          0.4,
          0
        ]
      }
    },
    {
      "s": "Las várices son venas superficiales dilatadas que pueden sobresalir y hacerse tortuosas.",
      "a": [
        [
          "seg",
          "Comparación",
          3
        ]
      ],
      "c": {
        "p": [
          8,
          5,
          10
        ],
        "t": [
          2.6,
          0.1,
          0
        ]
      }
    },
    {
      "s": "Al separar las capas puedes comparar su relación con la dermis y el tejido subcutáneo.",
      "a": [
        [
          "seg",
          "Comparación",
          0
        ],
        [
          "anim",
          "Separación de tejidos",
          0.85,
          2
        ]
      ],
      "c": {
        "p": [
          10,
          8,
          15
        ],
        "t": [
          0,
          1.1,
          0
        ]
      }
    },
    {
      "s": "Son ejemplos distintos, no una transformación obligatoria de una arañita en una várice.",
      "c": {
        "p": [
          9,
          7,
          14
        ],
        "t": [
          0,
          1.1,
          0
        ]
      }
    },
    {
      "s": "Su apariencia no permite determinar por sí sola el origen de un problema venoso.",
      "a": [
        [
          "sl",
          "Separación de tejidos",
          0
        ]
      ],
      "c": {
        "p": [
          9,
          7,
          13
        ],
        "t": [
          0,
          0.2,
          0
        ]
      }
    }
  ],
  "compresion-medica": [
    {
      "s": "Una media de compresión aplica presión externa sobre la pierna y da soporte a los tejidos.",
      "a": [
        [
          "seg",
          "Situación",
          1
        ]
      ],
      "c": {
        "p": [
          8,
          2,
          14
        ],
        "t": [
          0,
          -0.4,
          0
        ]
      }
    },
    {
      "s": "La prenda graduada se representa con mayor soporte distal, sin indicar aquí una presión concreta.",
      "c": {
        "p": [
          6,
          -1,
          10
        ],
        "t": [
          0,
          -2,
          0
        ]
      }
    },
    {
      "s": "Al caminar, la contracción muscular participa en el movimiento de la sangre hacia arriba.",
      "a": [
        [
          "seg",
          "Situación",
          2
        ]
      ],
      "c": {
        "p": [
          7,
          1,
          11
        ],
        "t": [
          0,
          -0.8,
          0
        ]
      }
    },
    {
      "s": "La compresión puede ayudar al control de síntomas y edema, pero no reconstruye por sí sola una válvula dañada.",
      "c": {
        "p": [
          7,
          1,
          11
        ],
        "t": [
          0,
          -0.8,
          0
        ]
      }
    },
    {
      "s": "El efecto depende también del ajuste de la prenda y de las características de cada persona.",
      "a": [
        [
          "anim",
          "Separación de la prenda",
          0.8,
          2
        ]
      ],
      "c": {
        "p": [
          9,
          2,
          15
        ],
        "t": [
          0.5,
          -0.5,
          0
        ]
      }
    },
    {
      "s": "La circulación arterial y otras condiciones deben valorarse antes de indicar compresión.",
      "a": [
        [
          "sl",
          "Separación de la prenda",
          0
        ]
      ],
      "c": {
        "p": [
          8,
          2,
          14
        ],
        "t": [
          0,
          -0.4,
          0
        ]
      }
    },
    {
      "s": "Este modelo explica una relación mecánica; no sirve para elegir una talla, una presión o un tratamiento.",
      "c": {
        "p": [
          8,
          2,
          14
        ],
        "t": [
          0,
          -0.4,
          0
        ]
      }
    }
  ],
  "ultrasonido-duplex": [
    {
      "s": "El ultrasonido permite relacionar la anatomía de los vasos con información sobre el flujo de sangre.",
      "a": [
        [
          "seg",
          "Vista del estudio",
          0
        ]
      ],
      "c": {
        "p": [
          8,
          4,
          12
        ],
        "t": [
          0,
          0,
          0
        ]
      }
    },
    {
      "s": "El transductor envía y recibe ondas; en el panel vemos una imagen generada como esquema, no un estudio real.",
      "c": {
        "p": [
          7,
          4,
          11
        ],
        "t": [
          0,
          0.4,
          0
        ]
      }
    },
    {
      "s": "En modo be reconocemos las estructuras y la luz de los vasos.",
      "a": [
        [
          "seg",
          "Vista del estudio",
          0
        ]
      ],
      "c": {
        "p": [
          7,
          3,
          11
        ],
        "t": [
          0,
          0,
          0
        ]
      }
    },
    {
      "s": "La compresión modifica una vena permeable, pero un único segmento no basta para establecer ni descartar una trombosis.",
      "a": [
        [
          "seg",
          "Vista del estudio",
          1
        ]
      ],
      "c": {
        "p": [
          7,
          3,
          11
        ],
        "t": [
          0,
          0,
          0
        ]
      }
    },
    {
      "s": "En Doppler color, rojo y azul representan dirección respecto al haz según el mapa utilizado; no significan simplemente arteria y vena.",
      "a": [
        [
          "seg",
          "Vista del estudio",
          2
        ]
      ],
      "c": {
        "p": [
          7,
          3,
          11
        ],
        "t": [
          0,
          0,
          0
        ]
      }
    },
    {
      "s": "El registro espectral permite observar una señal de flujo a lo largo del tiempo.",
      "a": [
        [
          "seg",
          "Vista del estudio",
          3
        ]
      ],
      "c": {
        "p": [
          7,
          3,
          11
        ],
        "t": [
          0,
          0,
          0
        ]
      }
    },
    {
      "s": "La interpretación clínica requiere un examen completo, técnica adecuada y el contexto de la persona.",
      "c": {
        "p": [
          8,
          4,
          12
        ],
        "t": [
          0,
          0,
          0
        ]
      }
    }
  ],
  "edema-linfatico": [
    {
      "s": "Entre las células existe un espacio con líquido llamado intersticio.",
      "a": [
        [
          "seg",
          "Escenario",
          0
        ]
      ],
      "c": {
        "p": [
          9,
          7,
          13
        ],
        "t": [
          0,
          0,
          0
        ]
      }
    },
    {
      "s": "Parte del líquido de los pequeños vasos pasa hacia ese tejido mediante filtración.",
      "c": {
        "p": [
          7,
          5,
          10
        ],
        "t": [
          -1,
          0.2,
          0
        ]
      }
    },
    {
      "s": "Los vasos linfáticos recogen líquido y proteínas y contribuyen a su retorno hacia la circulación.",
      "c": {
        "p": [
          8,
          5,
          11
        ],
        "t": [
          1,
          0,
          0
        ]
      }
    },
    {
      "s": "Si aumenta la carga de filtración, el sistema necesita transportar más líquido.",
      "a": [
        [
          "seg",
          "Escenario",
          1
        ]
      ],
      "c": {
        "p": [
          9,
          7,
          13
        ],
        "t": [
          0,
          0,
          0
        ]
      }
    },
    {
      "s": "Si el transporte resulta insuficiente, el líquido puede acumularse y producir hinchazón.",
      "a": [
        [
          "seg",
          "Escenario",
          2
        ]
      ],
      "c": {
        "p": [
          9,
          7,
          13
        ],
        "t": [
          0,
          0,
          0
        ]
      }
    },
    {
      "s": "En la mayoría de los tejidos, el equilibrio depende de forma importante del drenaje linfático.",
      "a": [
        [
          "seg",
          "Escenario",
          0
        ]
      ],
      "c": {
        "p": [
          8,
          5,
          11
        ],
        "t": [
          1,
          0,
          0
        ]
      }
    },
    {
      "s": "No toda hinchazón tiene la misma causa: puede haber factores venosos, linfáticos y enfermedades de otros órganos.",
      "c": {
        "p": [
          9,
          7,
          13
        ],
        "t": [
          0,
          0,
          0
        ]
      }
    }
  ],
  "clasificacion-ceap": [
    {
      "s": "La clasificación clínica describe manifestaciones que se observan en una pierna; no predice su futuro.",
      "a": [
        [
          "seg",
          "Manifestación clínica",
          0
        ]
      ],
      "c": {
        "p": [
          8,
          1,
          15
        ],
        "t": [
          0,
          -1,
          0
        ]
      }
    },
    {
      "s": "Cero indica ausencia de signos visibles o palpables;",
      "a": [
        [
          "seg",
          "Manifestación clínica",
          0
        ]
      ],
      "c": {
        "p": [
          7,
          0,
          12
        ],
        "t": [
          0,
          -1.4,
          0
        ]
      }
    },
    {
      "s": "uno incluye arañitas y venas reticulares.",
      "a": [
        [
          "seg",
          "Manifestación clínica",
          1
        ]
      ],
      "c": {
        "p": [
          7,
          0,
          12
        ],
        "t": [
          0,
          -1.4,
          0
        ]
      }
    },
    {
      "s": "Dos corresponde a várices",
      "a": [
        [
          "seg",
          "Manifestación clínica",
          2
        ]
      ],
      "c": {
        "p": [
          7,
          0,
          12
        ],
        "t": [
          0,
          -1.4,
          0
        ]
      }
    },
    {
      "s": "y tres a edema.",
      "a": [
        [
          "seg",
          "Manifestación clínica",
          3
        ]
      ],
      "c": {
        "p": [
          7,
          0,
          12
        ],
        "t": [
          0,
          -1.4,
          0
        ]
      }
    },
    {
      "s": "Cuatro agrupa cambios de piel y tejido, con subcategorías para distintas manifestaciones.",
      "a": [
        [
          "seg",
          "Manifestación clínica",
          4
        ]
      ],
      "c": {
        "p": [
          6,
          -1,
          10
        ],
        "t": [
          0,
          -2.5,
          0
        ]
      }
    },
    {
      "s": "Entre ellas se distinguen pigmentación o eczema,",
      "a": [
        [
          "seg",
          "Manifestación clínica",
          4
        ]
      ],
      "c": {
        "p": [
          6,
          -1,
          10
        ],
        "t": [
          0,
          -2.5,
          0
        ]
      }
    },
    {
      "s": "cambios de fibrosis",
      "a": [
        [
          "seg",
          "Manifestación clínica",
          5
        ]
      ],
      "c": {
        "p": [
          6,
          -1,
          10
        ],
        "t": [
          0,
          -2.5,
          0
        ]
      }
    },
    {
      "s": "y la corona de pequeños vasos alrededor del tobillo.",
      "a": [
        [
          "seg",
          "Manifestación clínica",
          6
        ]
      ],
      "c": {
        "p": [
          6,
          -1,
          10
        ],
        "t": [
          0,
          -2.5,
          0
        ]
      }
    },
    {
      "s": "Cinco describe una úlcera cicatrizada;",
      "a": [
        [
          "seg",
          "Manifestación clínica",
          7
        ]
      ],
      "c": {
        "p": [
          6,
          -1,
          10
        ],
        "t": [
          0,
          -2.5,
          0
        ]
      }
    },
    {
      "s": "seis, una úlcera activa.",
      "a": [
        [
          "seg",
          "Manifestación clínica",
          8
        ]
      ],
      "c": {
        "p": [
          6,
          -1,
          10
        ],
        "t": [
          0,
          -2.5,
          0
        ]
      }
    },
    {
      "s": "Aquí puedes compararlas sin asumir que todas las personas pasarán de una categoría a otra.",
      "a": [
        [
          "seg",
          "Manifestación clínica",
          8
        ]
      ],
      "c": {
        "p": [
          8,
          1,
          15
        ],
        "t": [
          0,
          -1,
          0
        ]
      }
    }
  ],
  "ulcera-venosa": [
    {
      "s": "Una úlcera es una zona donde la piel ha perdido su continuidad.",
      "a": [
        [
          "seg",
          "Estado del tejido",
          1
        ]
      ],
      "c": {
        "p": [
          9,
          7,
          13
        ],
        "t": [
          0,
          0.2,
          0
        ]
      }
    },
    {
      "s": "En la enfermedad venosa, la presión elevada mantenida puede contribuir a cambios en la microcirculación.",
      "a": [
        [
          "anim",
          "Separación de tejidos",
          0.7,
          2
        ]
      ],
      "c": {
        "p": [
          9,
          7,
          13
        ],
        "t": [
          0,
          0.6,
          0
        ]
      }
    },
    {
      "s": "La alteración de la barrera y la inflamación participan en el daño de los tejidos.",
      "c": {
        "p": [
          7,
          5,
          10
        ],
        "t": [
          0,
          0.1,
          0
        ]
      }
    },
    {
      "s": "El corte permite relacionar epidermis, dermis, tejido subcutáneo y pequeños vasos.",
      "a": [
        [
          "sl",
          "Separación de tejidos",
          0.85
        ]
      ],
      "c": {
        "p": [
          9,
          7,
          14
        ],
        "t": [
          0,
          0.8,
          0
        ]
      }
    },
    {
      "s": "No toda herida del tobillo es venosa: también hay causas arteriales, mixtas y otras.",
      "c": {
        "p": [
          9,
          7,
          14
        ],
        "t": [
          0,
          0.8,
          0
        ]
      }
    },
    {
      "s": "La reparación incluye recuperar tejido y cubrir la superficie, pero su evolución depende de la causa y del manejo.",
      "a": [
        [
          "seg",
          "Estado del tejido",
          2
        ],
        [
          "sl",
          "Separación de tejidos",
          0.3
        ]
      ],
      "c": {
        "p": [
          8,
          6,
          12
        ],
        "t": [
          0,
          0.3,
          0
        ]
      }
    },
    {
      "s": "Este cierre es una comparación didáctica, sin un plazo de curación ni una indicación de tratamiento.",
      "c": {
        "p": [
          9,
          7,
          13
        ],
        "t": [
          0,
          0.2,
          0
        ]
      }
    }
  ],
  "ablacion-endovenosa": [
    {
      "s": "La ablación térmica busca cerrar un segmento superficial seleccionado, conservando el drenaje profundo.",
      "a": [
        [
          "seg",
          "Etapa",
          0
        ]
      ],
      "c": {
        "p": [
          8,
          3,
          13
        ],
        "t": [
          0,
          0.2,
          0
        ]
      }
    },
    {
      "s": "El catéter transmite energía bajo control ecográfico; aquí no se representan parámetros de tratamiento.",
      "a": [
        [
          "seg",
          "Etapa",
          0
        ]
      ],
      "c": {
        "p": [
          6,
          2,
          10
        ],
        "t": [
          -0.6,
          0.8,
          0
        ]
      }
    },
    {
      "s": "La tumescencia rodea la vena y aporta anestesia, separación y protección de tejidos.",
      "a": [
        [
          "seg",
          "Etapa",
          1
        ]
      ],
      "c": {
        "p": [
          7,
          2,
          11
        ],
        "t": [
          -0.6,
          0,
          0
        ]
      }
    },
    {
      "s": "Durante la retirada ilustrada, la acción se localiza en el segmento seleccionado.",
      "a": [
        [
          "seg",
          "Etapa",
          2
        ],
        [
          "sl",
          "Recorrido del catéter",
          0.1
        ],
        [
          "anim",
          "Recorrido del catéter",
          0.85,
          5
        ]
      ],
      "c": {
        "p": [
          7,
          2,
          11
        ],
        "t": [
          -0.4,
          0,
          0
        ]
      }
    },
    {
      "s": "La vena profunda y las estructuras cercanas deben distinguirse del objetivo tratado.",
      "c": {
        "p": [
          8,
          3,
          13
        ],
        "t": [
          0,
          0.2,
          0
        ]
      }
    },
    {
      "s": "El remodelado posterior puede producir un segmento fibroso, pero el resultado no está garantizado.",
      "a": [
        [
          "seg",
          "Etapa",
          3
        ]
      ],
      "c": {
        "p": [
          7,
          2,
          11
        ],
        "t": [
          -0.5,
          0,
          0
        ]
      }
    },
    {
      "s": "La técnica, sus riesgos y el seguimiento se adaptan a cada persona; este modelo no prescribe.",
      "c": {
        "p": [
          8,
          3,
          13
        ],
        "t": [
          0,
          0.2,
          0
        ]
      }
    }
  ],
  "trombosis-venosa-superficial": [
    {
      "s": "Una trombosis venosa superficial es un coágulo dentro de una vena superficial.",
      "a": [
        [
          "seg",
          "Escenario",
          0
        ]
      ],
      "c": {
        "p": [
          8,
          3,
          14
        ],
        "t": [
          0,
          0.1,
          0
        ]
      }
    },
    {
      "s": "Puede acompañarse de dolor e inflamación local, sin que la piel muestre toda su extensión.",
      "c": {
        "p": [
          6,
          2,
          11
        ],
        "t": [
          -0.7,
          -0.5,
          0
        ]
      }
    },
    {
      "s": "La safena se conecta con el sistema profundo, por eso importa localizar el extremo del trombo.",
      "c": {
        "p": [
          6,
          3,
          11
        ],
        "t": [
          0.2,
          2.4,
          0
        ]
      }
    },
    {
      "s": "Compare un trombo que se aproxima a esa unión; la relación anatómica modifica la evaluación.",
      "a": [
        [
          "seg",
          "Escenario",
          1
        ]
      ],
      "c": {
        "p": [
          6,
          3,
          11
        ],
        "t": [
          0.2,
          2.4,
          0
        ]
      }
    },
    {
      "s": "También puede coexistir una trombosis profunda, como en este escenario independiente.",
      "a": [
        [
          "seg",
          "Escenario",
          2
        ]
      ],
      "c": {
        "p": [
          7,
          2,
          12
        ],
        "t": [
          0.7,
          0,
          0
        ]
      }
    },
    {
      "s": "El estudio dúplex ayuda a definir extensión y coexistencia; el manejo depende del caso.",
      "c": {
        "p": [
          8,
          3,
          14
        ],
        "t": [
          0,
          0.1,
          0
        ]
      }
    },
    {
      "s": "Ante falta de aire, dolor torácico o desmayo se necesita atención urgente.",
      "c": {
        "p": [
          8,
          3,
          14
        ],
        "t": [
          0,
          0.1,
          0
        ]
      }
    }
  ],
  "obstruccion-iliaca": [
    {
      "s": "Las venas ilíacas conducen la sangre de la pelvis hacia la vena cava inferior.",
      "a": [
        [
          "seg",
          "Relación proximal",
          0
        ],
        [
          "sl",
          "Separar relaciones",
          0
        ]
      ],
      "c": {
        "p": [
          9,
          5,
          15
        ],
        "t": [
          0,
          0.6,
          0
        ]
      }
    },
    {
      "s": "En el patrón clásico, la arteria ilíaca común derecha cruza por delante de la vena ilíaca común izquierda.",
      "a": [
        [
          "seg",
          "Relación proximal",
          1
        ]
      ],
      "c": {
        "p": [
          7,
          3,
          11
        ],
        "t": [
          -0.2,
          0.6,
          0
        ]
      }
    },
    {
      "s": "La referencia lumbar queda por detrás; separar las piezas permite comprender la relación.",
      "a": [
        [
          "anim",
          "Separar relaciones",
          0.7,
          2
        ]
      ],
      "c": {
        "p": [
          9,
          5,
          15
        ],
        "t": [
          0,
          0.6,
          0
        ]
      }
    },
    {
      "s": "Una compresión anatómica puede existir sin síntomas y no equivale por sí sola a un síndrome.",
      "a": [
        [
          "sl",
          "Separar relaciones",
          0
        ]
      ],
      "c": {
        "p": [
          8,
          4,
          13
        ],
        "t": [
          0,
          0.6,
          0
        ]
      }
    },
    {
      "s": "Otra situación es la secuela de una trombosis, con bandas o cambios dentro de la vena.",
      "a": [
        [
          "seg",
          "Relación proximal",
          2
        ]
      ],
      "c": {
        "p": [
          7,
          3,
          11
        ],
        "t": [
          -0.2,
          0.6,
          0
        ]
      }
    },
    {
      "s": "Pueden participar vías colaterales, pero el dibujo no calcula cuánto drenan ni la gravedad.",
      "a": [
        [
          "tg",
          "Mostrar vías colaterales",
          true
        ]
      ],
      "c": {
        "p": [
          9,
          5,
          15
        ],
        "t": [
          0,
          0.6,
          0
        ]
      }
    },
    {
      "s": "El diagnóstico y la indicación de tratamiento integran síntomas, otras causas y estudios apropiados.",
      "c": {
        "p": [
          9,
          5,
          15
        ],
        "t": [
          0,
          0.6,
          0
        ]
      }
    }
  ]
};
COURSE.units=EXTENSION_UNITS;
Object.assign(COURSE.lessons,EXTENSION_LESSONS);
Object.assign(COURSE.structures,EXTENSION_STRUCTURES);
