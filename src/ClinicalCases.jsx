import React,{useState} from 'react';
import {Activity,BookOpen,BrainCircuit,ClipboardList,ChevronRight,GraduationCap,
 ShieldAlert,Network,ArrowUpRight,Stethoscope} from 'lucide-react';
import {clinicalSource} from './clinicalData.js';

// Ejercicios originales y totalmente ficticios: NO son expedientes reales.
export const CASES=[
 {id:'memoria',number:'CASO 01',title:'Dificultades de memoria reciente',domain:'Memoria',
  intro:'Una persona adulta mayor presenta quejas de aprendizaje de información reciente. Familiares refieren repetición de preguntas y cambios en la gestión de actividades. Se desconoce la trayectoria completa, los medicamentos y las condiciones de sueño.',
  facts:['Quejas de memoria reciente y dificultades referidas por informantes','Información funcional incompleta','No se han realizado pruebas normadas ni evaluación clínica integral'],
  hypotheses:['Distinguir codificación, almacenamiento y recuperación en memoria episódica.','Investigar contribuciones de atención, estado afectivo, sueño, fármacos y causas médicas.','Considerar distintas etiologías sin etiquetar el caso como enfermedad neurodegenerativa.'],
  assessment:['Entrevista longitudinal con informante y contexto funcional.','Explorar aprendizaje verbal/visual, recuerdo diferido y reconocimiento con normas adecuadas.','Controlar escolaridad, estado emocional, atención, sueño y funcionamiento instrumental.'],
  caveat:'Ninguna prueba aislada ni la localización hipocampal bastan para establecer una causa o un diagnóstico.',
  target:'hipocampo',refs:['alzheimer','instruments']},
 {id:'atencion',number:'CASO 02',title:'Omisión del lado izquierdo',domain:'Atención espacial',
  intro:'Durante rehabilitación después de una lesión neurológica se observa que una persona deja comida del lado izquierdo del plato e ignora estímulos contralesionales. No se conoce su exploración visual, sensitiva o motora.',
  facts:['Omisiones en tareas cotidianas orientadas al lado izquierdo','Se desconoce la integridad de los campos visuales','No se dispone de correlación de imágenes del caso'],
  hypotheses:['Explorar una alteración de la atención espacial dentro de redes distribuidas.','Diferenciar negligencia espacial de hemianopsia, pérdida sensorial o limitación motora.','Comprobar variación del fenómeno por tarea, estímulo y entorno.'],
  assessment:['Cancelación, bisección de líneas y observación funcional contextual.','Exploración neurológica de campos visuales, fuerza y sensibilidad.','Valoración de atención, conciencia del déficit y actividades cotidianas.'],
  caveat:'No se puede inferir una lesión parietal específica solo por el patrón observado.',
  target:'atencion-espacial',refs:['neglect','stroke']},
 {id:'lenguaje',number:'CASO 03',title:'Expresión verbal esforzada',domain:'Lenguaje',
  intro:'Una persona presenta enunciados breves y producción verbal poco fluida después de un episodio neurológico. Parece comprender algunas órdenes simples; no hay información sobre repetición, escritura o evaluación motora del habla.',
  facts:['Habla reducida y producción esforzada','Comprensión aparentemente conservada para órdenes simples','Sin estudio de repetición, denominación, lectura y escritura'],
  hypotheses:['Investigar procesos lingüísticos expresivos y redes frontotemporales.','Distinguir afasia, disartria y apraxia del habla.','Evitar atribuir todo el cuadro a una única región cortical.'],
  assessment:['Habla espontánea, denominación, comprensión y repetición.','Lectoescritura, examen orofacial y evaluación neurológica.','Utilizar instrumentos adecuados al idioma y contexto educativo.'],
  caveat:'La no fluidez no demuestra por sí sola un subtipo concreto de afasia.',
  target:'lenguaje-frontal',refs:['language','stroke']},
 {id:'ejecutivas',number:'CASO 04',title:'Planificación e impulsividad',domain:'Funciones ejecutivas',
  intro:'Meses después de un traumatismo craneoencefálico una persona refiere dificultad de planificación, lentitud y menor autocontrol. También describe fatiga, alteraciones del sueño y dolor, factores que podrían influir en el rendimiento.',
  facts:['Cambios de organización y regulación conductual','Posibles factores confundentes: dolor, sueño y fatiga','Sin evaluación de funcionamiento premórbido ni desempeño cotidiano'],
  hypotheses:['Investigar control ejecutivo y redes frontoparietales/frontoestriatales.','Separar velocidad de procesamiento, memoria de trabajo, inhibición y flexibilidad.','Examinar las influencias afectivas y del contexto antes de localizar disfunciones.'],
  assessment:['Entrevista funcional e informantes; referencia al desempeño premórbido.','Atención, velocidad, flexibilidad, planificación e inhibición.','Tareas ecológicas y valoración de fatiga, dolor, sueño y afecto.'],
  caveat:'Las dificultades ejecutivas no confirman una lesión frontal localizada.',
  target:'funciones-ejecutivas',refs:['tbi','guidelines']}
];
const TABS=[['facts','Datos del caso'],['hypotheses','Hipótesis diferenciales'],['assessment','Plan de evaluación']];
export default function ClinicalCases({onStudy}){
 const [current,setCurrent]=useState(CASES[0].id);
 const [tab,setTab]=useState('facts');
 const [expanded,setExpanded]=useState(false);
 const c=CASES.find(v=>v.id===current)||CASES[0];
 return <section className="case-lab" id="casos">
  <div className="panel-heading"><div><span className="section-kicker">02 / APRENDIZAJE BASADO EN CASOS</span><h2>Razonamiento neuropsicológico</h2></div><GraduationCap size={22}/></div>
  <p className="section-intro">Situaciones ficticias para distinguir datos, formular hipótesis, evaluar explicaciones alternativas y seleccionar estrategias de valoración. No contienen datos de pacientes ni puntuaciones simuladas.</p>
  <div className="case-workspace">
   <div className="case-select" role="group" aria-label="Seleccionar caso académico">{CASES.map(item=>
    <button key={item.id} className={c.id===item.id?'selected':''} aria-pressed={c.id===item.id}
     onClick={()=>{setCurrent(item.id);setTab('facts');setExpanded(false)}}>
     <span>{item.number}</span><strong>{item.title}</strong><small>{item.domain}</small><ChevronRight size={16}/>
    </button>)}</div>
   <article className="case-paper">
    <div className="case-paper-top"><div><span className="case-label">{c.number} · EJEMPLO FICTICIO</span><h3>{c.title}</h3><p>{c.domain}</p></div><BrainCircuit size={27}/></div>
    <div className="case-purpose"><Stethoscope size={17}/><p>{c.intro}</p></div>
    <div className="case-tabs" role="tablist" aria-label="Etapas de análisis del caso">
     {TABS.map(([key,label])=><button key={key} role="tab" aria-selected={tab===key}
      className={tab===key?'active':''} onClick={()=>setTab(key)}>{label}</button>)}</div>
    <div className="case-body">
     <div className="clinical-subheading">{tab==='facts'?<ClipboardList size={16}/>:tab==='hypotheses'?<Network size={16}/>:<Activity size={16}/>}
      {tab==='facts'?'Observaciones e información faltante':tab==='hypotheses'?'Hipótesis de trabajo':'Evaluación orientada a hipótesis'}</div>
     <ul>{c[tab].map(text=><li key={text}>{text}</li>)}</ul>
     <div className="case-reflection">
      <button aria-expanded={expanded} onClick={()=>setExpanded(v=>!v)}><ShieldAlert size={16}/>{expanded?'Ocultar límite de interpretación':'¿Qué conclusión no puede establecerse todavía?'}</button>
      {expanded&&<p>{c.caveat}</p>}
     </div>
    </div>
    <div className="case-footer">
     <button onClick={()=>onStudy(c.target)}><BookOpen size={16}/>Consultar ficha clínica<ArrowUpRight size={16}/></button>
     <div className="case-sources">{c.refs.map(key=>clinicalSource(key)).filter(Boolean).map(ref=>
      <a key={ref.url} href={ref.url} target="_blank" rel="noopener noreferrer">{ref.title}</a>)}</div>
    </div>
   </article>
  </div>
 </section>;
}
