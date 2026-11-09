// Fichas docentes: síntesis original fundamentada, sin reproducir material protegido.
// Evidencia clínico-anatómica no equivale a causalidad exclusiva ni diagnóstico.
export const CLINICAL_REFERENCES={
  language:{title:'NIDCD — Afasia',url:'https://www.nidcd.nih.gov/es/espanol/afasia'},
  epilepsy:{title:'NINDS — Epilepsia y convulsiones',url:'https://www.ninds.nih.gov/es/health-information/disorders/epilepsia-y-convulsiones'},
  alzheimer:{title:'Alzheimer’s Association — Evaluación neuropsicológica (2025)',url:'https://alz-journals.onlinelibrary.wiley.com/doi/10.1002/alz.14337'},
  instruments:{title:'DETeCD-ADRD — Instrumentos validados (2025)',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC11772712/'},
  stroke:{title:'CDC — Signos y síntomas de ACV',url:'https://www.cdc.gov/stroke/es/signs-symptoms/signos-y-sintomas-de-accidente-cerebrovascular.html'},
  neglect:{title:'StatPearls — Negligencia espacial',url:'https://www.ncbi.nlm.nih.gov/books/NBK562184/'},
  tbi:{title:'ASHA — Lesión cerebral traumática en adultos',url:'https://www.asha.org/Practice-Portal/Clinical-Topics/Traumatic-Brain-Injury-in-Adults/'},
  ataxia:{title:'Neurologic Clinics — Evaluación de ataxias cerebelosas',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC10354692/'},
  spinal:{title:'NINDS — Lesión medular',url:'https://www.ninds.nih.gov/health-information/disorders/spinal-cord-injury'},
  guidelines:{title:'APA — Manual de evaluación neuropsicológica clínica',url:'https://www.apa.org/pubs/books/clinical-neuropsychology-fourth-edition'},
};
export const CLINICAL_CARDS=[
 {
  id:'hipocampo',title:'Hipocampo y memoria episódica',group:'Memoria',system:'Lóbulo temporal medial',
  anatomy:'Formación hipocampal de la región temporal medial; debe diferenciarse del giro parahipocampal de la superficie pial.',
  function:'Participa en la codificación y recuperación de experiencias episódicas, memoria relacional y navegación espacial mediante redes temporomediales.',
  symptoms:['Dificultad para aprender información nueva','Olvido acelerado de experiencias recientes','Desorientación contextual o espacial, según extensión y red afectada'],
  conditions:['Epilepsia temporal y esclerosis hipocampal','Enfermedad de Alzheimer y procesos neurodegenerativos','Daño hipóxico-isquémico, entre otros'],
  evaluation:['Historia evolutiva y funcional; memoria de episodios cotidianos','Aprendizaje de listas, recuerdo diferido y reconocimiento','Memoria visual y verbal atendiendo a lateralización, educación y normas'],
  caveat:'La memoria depende de una red distribuida. Una resonancia estructural aislada no permite identificar una enfermedad ni cuantificar un déficit.',
  evidence:'Asociación clínica ampliamente documentada',refs:['epilepsy','alzheimer','instruments'],
  locate:{mode:'deep',id:'hippocampus-left'}
 },
 {
  id:'lenguaje-frontal',title:'Giro frontal inferior y lenguaje',group:'Lenguaje',system:'Red frontotemporal perisilviana',
  anatomy:'Porciones opercular y triangular del giro frontal inferior, frecuentemente vinculadas con componentes expresivos del lenguaje en el hemisferio dominante.',
  function:'Selección y secuenciación lingüística, aspectos fonológicos y control articulatorio, en interacción con circuitos temporoparietales.',
  symptoms:['Lenguaje no fluente y producción esforzada','Agramatismo en algunos perfiles','Posible apraxia del habla o dificultad de repetición'],
  conditions:['Afasias adquiridas por lesiones del hemisferio dominante','Accidente cerebrovascular en red del lenguaje','Afasias progresivas por neurodegeneración'],
  evaluation:['Habla espontánea, denominación y repetición','Comprensión, lectura y escritura','Exploración de apraxia del habla y disartria como diagnósticos diferenciales'],
  caveat:'El área clásica de Broca no constituye toda la red expresiva. La lateralización individual debe evaluarse, no suponerse.',
  evidence:'Asociación clínico-anatómica sólida; expresión variable',refs:['language','stroke'],
  locate:{mode:'cortex',id:12,hemi:'left'}
 },
 {
  id:'lenguaje-temporal',title:'Temporal superior y comprensión del lenguaje',group:'Lenguaje',system:'Red temporal-perisilviana',
  anatomy:'Sectores temporales superiores y perisilvianos, especialmente del hemisferio dominante.',
  function:'Procesamiento auditivo del habla y acceso a representaciones fonológicas y semánticas a través de circuitos distribuidos.',
  symptoms:['Problemas para comprender el lenguaje','Errores léxicos o parafasias','Producción fluente con contenido poco informativo en algunos síndromes'],
  conditions:['Afasia fluente tras lesión vascular','Afasia progresiva primaria, con diferentes subtipos','Trastornos del lenguaje por lesión focal'],
  evaluation:['Comprensión de órdenes y palabras','Denominación, repetición y comprensión conversacional','Lectura y escritura; audiometría cuando corresponda'],
  caveat:'La denominación clásica «área de Wernicke» es insuficiente para describir la organización contemporánea del lenguaje.',
  evidence:'Asociación clínica sólida, localización distribuida',refs:['language'],
  locate:{mode:'cortex',id:34,hemi:'left'}
 },
 {
  id:'atencion-espacial',title:'Red parietal derecha y negligencia',group:'Atención',system:'Red atencional frontoparietal',
  anatomy:'Red que incluye regiones parietales y frontales derechas y sus conexiones; no se limita a una circunvolución.',
  function:'Orientación de la atención hacia el espacio y control de la exploración visoespacial.',
  symptoms:['Omisiones de estímulos contralesionales','Dificultad al explorar o vestirse del lado afectado','Desviación en bisección de líneas; posible falta de conciencia del déficit'],
  conditions:['Negligencia espacial tras accidente cerebrovascular','Lesiones derechas extensas de redes atencionales'],
  evaluation:['Cancelación de estímulos y bisección de líneas','Observación ecológica y valoración de actividades diarias','Diferenciar hemianopsia, problemas sensoriales y limitación motora'],
  caveat:'La negligencia es un síndrome de redes. No todo daño parietal derecho la causa y puede existir sin lesión parietal primaria.',
  evidence:'Convergencia clínica, neuroanatómica y funcional',refs:['neglect','stroke'],
  locate:{mode:'cortex',id:27,hemi:'right'}
 },
 {
  id:'funciones-ejecutivas',title:'Corteza prefrontal y control ejecutivo',group:'Funciones ejecutivas',system:'Circuitos frontoparietales y frontoestriatales',
  anatomy:'Regiones prefrontales dorsolaterales, mediales y orbitofrontales conectadas con corteza parietal y ganglios basales.',
  function:'Organización de metas, control inhibitorio, memoria de trabajo, flexibilidad cognitiva y monitorización del comportamiento.',
  symptoms:['Dificultades de planificación y secuenciación','Impulsividad o rigidez cognitiva','Reducción de iniciativa o regulación conductual'],
  conditions:['Traumatismo craneoencefálico','Trastornos neurocognitivos frontotemporales','Lesiones vasculares frontales o subcorticales'],
  evaluation:['Entrevista al consultante e informantes y evaluación funcional','Pruebas de atención, alternancia y fluidez','Tareas ecológicas de planificación, inhibición y memoria de trabajo'],
  caveat:'El rendimiento ejecutivo es sensible a sueño, estado de ánimo, medicación, dolor y motivación; no identifica por sí solo daño frontal.',
  evidence:'Asociación de redes robusta; perfiles heterogéneos',refs:['tbi','guidelines'],
  locate:{mode:'cortex',id:15,hemi:'left'}
 },
 {
  id:'corteza-motora',title:'Giro precentral y función motora',group:'Motricidad',system:'Sistema corticoespinal',
  anatomy:'Giro precentral y corteza motora primaria con organización somatotópica; conexiones descendentes corticoespinales.',
  function:'Ejecución y regulación de movimientos voluntarios en interacción con médula, ganglios basales y cerebelo.',
  symptoms:['Debilidad de predominio contralateral','Alteraciones motoras según área afectada','Posibles signos piramidales por compromiso de vía descendente'],
  conditions:['Accidente cerebrovascular','Tumores o traumatismos focales','Lesiones de vías corticoespinales'],
  evaluation:['Exploración de fuerza, tono, reflejos y sensibilidad','Valorar destreza y marcha','Imagen clínica si está indicada y evaluación funcional'],
  caveat:'La debilidad motora no permite localizar sin exploración neurológica integral; vías subcorticales y medulares también producen déficits.',
  evidence:'Asociación anatomo-funcional bien establecida',refs:['stroke','guidelines'],
  locate:{mode:'cortex',id:29,hemi:'left'}
 },
 {
  id:'cerebelo',title:'Cerebelo, coordinación y cognición',group:'Motricidad',system:'Circuitos cerebelo-tálamo-corticales',
  anatomy:'Estructura posterior infratentorial con hemisferios y vermis; redes funcionales motoras y no motoras.',
  function:'Coordinación y temporización motora; contribuciones a aprendizaje, control cognitivo y procesos afectivos.',
  symptoms:['Ataxia de marcha o extremidades','Dismetría, disartria o alteraciones oculomotoras','Alteraciones cognitivas o afectivas en algunos casos'],
  conditions:['Ataxias degenerativas o hereditarias','Accidente vascular cerebeloso','Daño cerebeloso adquirido'],
  evaluation:['Exploración de coordinación, marcha y movimientos oculares','Escala SARA cuando corresponda','Valoración cognitivo-afectiva cuando existan síntomas'],
  caveat:'La ataxia puede ser sensorial o vestibular; la evaluación etiológica requiere exploración, historia y estudios complementarios.',
  evidence:'Sólida para ataxia; evidencia heterogénea para subdominios cognitivos',refs:['ataxia','guidelines'],
  locate:{mode:'deep',id:'cerebellum-left'}
 },
 {
  id:'tálamo',title:'Tálamo y conectividad neurocognitiva',group:'Atención',system:'Circuitos talamocorticales',
  anatomy:'Estructura diencefálica bilateral integrada por múltiples núcleos de relevo y asociación.',
  function:'Modulación de circuitos sensoriales, atencionales, mnésicos y de vigilia mediante conexiones corticales extensas.',
  symptoms:['Cambios de alerta o atención según núcleo afectado','Alteraciones sensitivas o de memoria en síndromes específicos','Síntomas diversos según territorio vascular y redes'],
  conditions:['Infartos talámicos','Otras lesiones diencefálicas'],
  evaluation:['Examen del estado mental y exploración neurológica','Atención, memoria y velocidad de procesamiento','Correlación anatómica mediante neuroimagen'],
  caveat:'No todos los núcleos talámicos poseen las mismas funciones. Un modelo general de tálamo no identifica subnúcleos ni lesiones.',
  evidence:'Anatomía bien establecida; asociación clínica núcleo-dependiente',refs:['guidelines','stroke'],
  locate:{mode:'deep',id:'thalamus-left'}
 },
 {
  id:'estriado',title:'Estriado y circuitos frontoestriatales',group:'Motricidad',system:'Ganglios basales',
  anatomy:'Núcleo caudado y putamen, conectados con globo pálido, tálamo y corteza.',
  function:'Selección y aprendizaje de acciones, hábitos y contribuciones a circuitos motores y ejecutivos.',
  symptoms:['Alteraciones de iniciación y control del movimiento','Dificultades de velocidad y flexibilidad en determinados cuadros','Cambios conductuales cuando se afectan circuitos asociativos'],
  conditions:['Enfermedades de ganglios basales','Lesiones vasculares subcorticales','Trastornos del movimiento de diversas causas'],
  evaluation:['Exploración del movimiento y velocidad psicomotora','Funciones ejecutivas y conducta cotidiana','Neuroimagen e historia neurológica'],
  caveat:'La enfermedad de Parkinson y otros trastornos implican circuitos y procesos patológicos, no una lesión equivalente a un único putamen.',
  evidence:'Circuitería funcional ampliamente aceptada; patrones clínicos variables',refs:['guidelines'],
  locate:{mode:'deep',id:'putamen-left'}
 },
 {
  id:'medula-cervical',title:'Médula cervical: vías y niveles',group:'Médula espinal',system:'Sistema nervioso central',
  anatomy:'Segmentos cervicales medulares, raíces y tractos ascendentes/descendentes. Los niveles medulares no coinciden exactamente con los vertebrales.',
  function:'Transmisión y modulación de señales motoras, sensitivas y autónomas entre encéfalo y cuerpo.',
  symptoms:['Paresia o alteración sensitiva según nivel y extensión','Posibles cambios esfinterianos','Compromiso respiratorio en lesiones cervicales altas'],
  conditions:['Lesión medular traumática','Mielopatía compresiva e inflamatoria','Enfermedades desmielinizantes u otras'],
  evaluation:['Exploración motora y sensitiva por dermatomas y miotomas','Reflejos y nivel neurológico de lesión','Escalas estandarizadas de evaluación medular cuando corresponda'],
  caveat:'No inferir nivel, completitud o pronóstico a partir de una imagen docente; requiere exploración neurológica y clasificación apropiada.',
  evidence:'Anatomía y síndromes documentados; curso depende de etiología y severidad',refs:['spinal'],
  locate:{mode:'spine',id:'cervical'}
 },
 {
  id:'medula-toracica',title:'Médula torácica y vías de conducción',group:'Médula espinal',system:'Sistema nervioso central',
  anatomy:'Segmentos medulares torácicos con conexiones motoras, somatosensoriales y autonómicas.',
  function:'Conducción descendente y ascendente; participación en funciones motoras del tronco y modulación autónoma.',
  symptoms:['Debilidad o parálisis de miembros inferiores en lesiones importantes','Nivel sensitivo variable','Disfunciones autonómicas y esfinterianas'],
  conditions:['Lesión medular traumática','Compresión medular','Mielitis y otras enfermedades'],
  evaluation:['Exploración de nivel sensitivo y fuerza','Reflejos, esfínteres y funcionalidad','Imagen médica indicada según contexto'],
  caveat:'El daño medular no equivale a una disfunción cerebral ni autoriza establecer un diagnóstico sin historia y examen físico.',
  evidence:'Asociación clínico-neurológica bien establecida',refs:['spinal'],
  locate:{mode:'spine',id:'thoracic'}
 },
 {
  id:'deterioro-cognitivo',title:'Deterioro cognitivo: evaluación por dominios',group:'Neuropsicología clínica',system:'Redes neurocognitivas distribuidas',
  anatomy:'No se atribuye a una sola estructura. Se estudian circuitos de memoria, atención, lenguaje, función ejecutiva y percepción.',
  function:'Evaluar patrones de desempeño y funcionamiento cotidiano para formular hipótesis diagnósticas y diferenciales.',
  symptoms:['Quejas de aprendizaje o recuerdo','Cambios en lenguaje o funcionamiento ejecutivo','Dificultades funcionales de intensidad variable'],
  conditions:['Trastornos neurocognitivos','Etiologías vasculares, degenerativas, médicas, psiquiátricas y otras'],
  evaluation:['Entrevista longitudinal e informantes','Pruebas normadas de memoria, atención, lenguaje, funciones ejecutivas y habilidades visuoespaciales','Considerar educación, idioma, cultura, sueño, estado afectivo y validez del desempeño'],
  caveat:'Los tamizajes no constituyen diagnóstico definitivo. La selección e interpretación de instrumentos requiere normas apropiadas para la población.',
  evidence:'Recomendaciones clínicas de guías basadas en evidencia',refs:['alzheimer','instruments','guidelines'],
  locate:null
 }
];
export function clinicalSource(id){return CLINICAL_REFERENCES[id]}

