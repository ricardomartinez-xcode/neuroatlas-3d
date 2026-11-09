export const LOBES = {
  frontal: {label:'Frontal',color:'#DAA277',short:'Planeación y acción'},
  parietal:{label:'Parietal',color:'#8BB8C9',short:'Integración sensorial y espacial'},
  temporal:{label:'Temporal',color:'#C5A7C8',short:'Audición, reconocimiento y memoria'},
  occipital:{label:'Occipital',color:'#8DB6A5',short:'Procesamiento visual'},
  cingulate:{label:'Cingulada',color:'#E4C080',short:'Integración y regulación'},
  insula:{label:'Ínsula',color:'#E5A8A6',short:'Interocepción y saliencia'},
  frontoparietal:{label:'Central / paracentral',color:'#A6B8D8',short:'Red sensoriomotora'},
  sylvian:{label:'Fisura lateral',color:'#AAC2C3',short:'Referencia anatómica'},
  other:{label:'Otros',color:'#A5B1BA',short:'Estructuras anatómicas'}
};
export const REGION_NAMES=[
'No asignada','Giro y surco frontomarginal','Giro y surco occipital inferior','Giro y surco paracentral','Giro y surco subcentral',
'Giro y surco transverso frontopolar','Giro y surco cingulado anterior','Giro y surco cingulado medio anterior',
'Giro y surco cingulado medio posterior','Giro cingulado posterior dorsal','Giro cingulado posterior ventral','Cúneo',
'Giro frontal inferior, porción opercular','Giro frontal inferior, porción orbital','Giro frontal inferior, porción triangular',
'Giro frontal medio','Giro frontal superior','Giros largos y surco central de la ínsula','Giros cortos de la ínsula',
'Giro occipital medio','Giro occipital superior','Giro occipitotemporal lateral (fusiforme)','Giro occipitotemporal medial (lingual)',
'Giro parahipocampal','Giros orbitarios','Giro angular','Giro supramarginal','Lobulillo parietal superior',
'Giro poscentral','Giro precentral','Precúneo','Giro recto','Giro subcalloso',
'Giro temporal transverso (Heschl)','Giro temporal superior lateral','Plano polar temporal','Plano temporal',
'Giro temporal inferior','Giro temporal medio','Fisura lateral anterior horizontal','Fisura lateral anterior vertical',
'Fisura lateral posterior','Pared medial (sin parcelación cortical)','Polo occipital','Polo temporal','Surco calcarino',
'Surco central (Rolando)','Surco cingulado, rama marginal','Surco circular anterior de la ínsula',
'Surco circular inferior de la ínsula','Surco circular superior de la ínsula','Surco colateral transverso anterior',
'Surco colateral transverso posterior','Surco frontal inferior','Surco frontal medio','Surco frontal superior',
'Surco intermedio de Jensen','Surco intraparietal y surco parietal transverso',
'Surco occipital medio y surco lunado','Surco occipital superior y transverso','Surco occipital anterior',
'Surco occipitotemporal lateral','Surco occipitotemporal medial y lingual','Surco orbitario lateral',
'Surco orbitario medial (olfatorio)','Surco orbitario en H','Surco parietooccipital','Surco pericalloso',
'Surco poscentral','Surco precentral inferior','Surco precentral superior','Surco suborbitario',
'Surco subparietal','Surco temporal inferior','Surco temporal superior','Surco temporal transverso'
];
export const IMPORTANT_REGIONS={
  12:{description:'Porción opercular del giro frontal inferior, asociada a componentes de la producción lingüística y articulatoria, especialmente en el hemisferio dominante.',domains:['Lenguaje','Control motor del habla'],clinical:'La evaluación del lenguaje requiere valorar lateralización y redes frontotemporales; esta parcela no equivale a toda el área de Broca.'},
  14:{description:'Porción triangular del giro frontal inferior; participa en procesos de lenguaje, selección y control semántico dentro de redes habitualmente lateralizadas.',domains:['Lenguaje','Control ejecutivo'],clinical:'La relación entre lesión y síntomas depende de lateralidad, extensión y conexiones.'},
  15:{description:'Giro frontal medio, con participación heterogénea en redes de memoria de trabajo, control ejecutivo y atención.',domains:['Funciones ejecutivas','Atención'],clinical:'El rendimiento ejecutivo no se localiza en una sola circunvolución.'},
  16:{description:'Giro frontal superior, relacionado con componentes de control ejecutivo, atención y organización de acciones.',domains:['Funciones ejecutivas','Atención'],clinical:'La función depende de subregiones y conectividad.'},
  23:{description:'Giro parahipocampal, región cortical medial temporal vinculada a memoria contextual y procesamiento espacial.',domains:['Memoria','Orientación espacial'],clinical:'No debe confundirse con el hipocampo propiamente dicho, que no se representa en la superficie pial.'},
  25:{description:'Giro angular, componente de redes temporoparietales de lenguaje, procesamiento semántico y otras funciones integradoras.',domains:['Lenguaje','Atención','Cognición'],clinical:'Las funciones varían según hemisferio, tarea y conexiones.'},
  26:{description:'Giro supramarginal, implicado en integración multimodal y procesos fonológicos del lenguaje, entre otras funciones.',domains:['Lenguaje','Integración sensorial'],clinical:'Una lesión puede asociarse a perfiles diversos; no existe relación uno a uno entre parcela y síndrome.'},
  27:{description:'Lobulillo parietal superior, importante para integración visuoespacial, atención y guía sensoriomotora.',domains:['Atención','Visuoespacial'],clinical:'Interpretar junto con circuitos frontoparietales.'},
  28:{description:'Giro poscentral, correspondiente principalmente a corteza somatosensorial primaria.',domains:['Somatosensación'],clinical:'Su organización funcional depende de la somatotopía contralateral.'},
  29:{description:'Giro precentral, que contiene gran parte de la corteza motora primaria.',domains:['Motricidad'],clinical:'El déficit motor depende de la organización somatotópica y vías descendentes.'},
  30:{description:'Precúneo, implicado en procesos visuoespaciales, memoria autobiográfica y redes de cognición interna.',domains:['Visuoespacial','Memoria'],clinical:'Suele estudiarse como nodo de redes y no como módulo aislado.'},
  33:{description:'Giro temporal transverso o región de Heschl, relacionado con el procesamiento auditivo primario.',domains:['Audición'],clinical:'La representación auditiva es ampliamente bilateral.'},
  34:{description:'Región lateral del giro temporal superior, relevante para procesos auditivos, del habla y sociales.',domains:['Lenguaje','Audición'],clinical:'Los procesos receptivos del lenguaje abarcan redes temporales y frontoparietales.'},
  36:{description:'Plano temporal, región perisilviana importante para análisis auditivo complejo y del habla.',domains:['Lenguaje','Audición'],clinical:'El patrón de lateralización depende de función y persona.'},
  45:{description:'Surco calcarino, referencia anatómica que delimita gran parte de la corteza visual primaria en sus paredes.',domains:['Visión'],clinical:'El surco es un hito anatómico; V1 ocupa áreas de sus márgenes.'},
  11:{description:'Cúneo, sector occipital medial relacionado con redes del procesamiento visual.',domains:['Visión'],clinical:'Las asociaciones visuales específicas requieren cartografía funcional.'},
  19:{description:'Giro occipital medio, componente de redes visuales de asociación.',domains:['Visión'],clinical:'Las funciones visuales se distribuyen por múltiples áreas.'},
  21:{description:'Giro occipitotemporal lateral (fusiforme), relacionado con reconocimiento visual complejo y representaciones de objetos.',domains:['Reconocimiento visual'],clinical:'La especialización para rostros implica subregiones y redes ventrales.'},
  9:{description:'Giro cingulado posterior dorsal, relacionado con memoria, atención interna e integración de redes de gran escala.',domains:['Memoria','Cognición'],clinical:'La participación en redes cambia según estado y tarea.'},
  18:{description:'Giros cortos de la ínsula, implicados en interocepción, integración saliente y procesamiento afectivo.',domains:['Interocepción','Saliencia'],clinical:'La ínsula es heterogénea; no permite inferir estados emocionales individuales.'}
};
export const DOMAINS=[
 {id:'all',name:'Atlas completo',description:'Exploración macroscópica y parcelación completa.',ids:[]},
 {id:'language',name:'Lenguaje',description:'Red distribuida con participación frontal inferior y temporal, especialmente en el hemisferio dominante.',ids:[12,14,25,26,34,36]},
 {id:'executive',name:'Funciones ejecutivas',description:'Control cognitivo y planeación vinculados con circuitos frontoparietales, no con un centro único.',ids:[12,14,15,16,24,25,27]},
 {id:'memory',name:'Memoria',description:'Participación cortical parahipocampal y asociativa. El hipocampo no está representado en la superficie pial.',ids:[23,9,10,30,25]},
 {id:'attention',name:'Atención',description:'Procesamiento atencional apoyado en redes dorsales y ventrales distribuidas.',ids:[15,16,25,26,27,30]},
 {id:'motor',name:'Sistema motor',description:'Áreas precentrales y paracentrales de corteza sensoriomotora.',ids:[29,3,4,69,70]},
 {id:'sensory',name:'Somatosensación',description:'Corteza poscentral y áreas de integración somática.',ids:[28,68,3]},
 {id:'visual',name:'Procesamiento visual',description:'Regiones occipitales y occipitotemporales relacionadas con percepción visual.',ids:[11,19,20,21,22,43,45]},
 {id:'auditory',name:'Audición',description:'Regiones temporales superiores y transversas implicadas en procesamiento auditivo.',ids:[33,34,35,36,75]},
 {id:'intero',name:'Interocepción',description:'Contribuciones insulares a señales corporales y redes de saliencia.',ids:[17,18,48,49,50]}
];
export const SOURCES=[
 {title:'Destrieux et al. (2010)',detail:'Parcelación de giros y surcos corticales',url:'https://doi.org/10.1016/j.neuroimage.2010.06.010'},
 {title:'FreeSurfer',detail:'Documentación de parcellation cortical',url:'https://surfer.nmr.mgh.harvard.edu/fswiki/CorticalParcellation'},
 {title:'Nilearn / fsaverage5',detail:'Superficies anatómicas de referencia',url:'https://nilearn.github.io/stable/modules/generated/nilearn.datasets.fetch_surf_fsaverage.html'}
];
export function regionInfo(region){
 const id=region?.id??0,lobe=LOBES[region?.lobe]||LOBES.other,special=IMPORTANT_REGIONS[id];
 return {
  id,name:REGION_NAMES[id]||region?.name||'Región cortical',original:region?.name||'',
  lobe:lobe.label,color:lobe.color,domains:special?.domains||[lobe.short],
  description:special?.description||('Área cortical etiquetada como "'+(REGION_NAMES[id]||region?.name)+'" en la parcelación Destrieux. La etiqueta describe una referencia anatómica y no una función psicológica exclusiva.'),
  clinical:special?.clinical||'La correlación clínico-funcional requiere lateralización, conectividad y datos neuropsicológicos complementarios.'
 };
}

