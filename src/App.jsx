import React,{useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {
  Brain,BookOpen,Info,Search,ChevronDown,ChevronRight,RotateCcw,Layers3,GraduationCap,
  Maximize2,Minimize2,Download,Menu,X,Target,CheckCircle2,AlertCircle,Eye,MousePointer2,
  Activity,ExternalLink,SlidersHorizontal,BookMarked,ArrowRight,Play,Pause,Network,PanelRightClose
} from 'lucide-react';
import AtlasViewer from './AtlasViewer.jsx';
import {LOBES,DOMAINS,REGION_NAMES,SOURCES,regionInfo} from './anatomy.js';
import './styles.css';

const ORIENTATIONS=[
  {id:'oblique',label:'Oblicua'},
  {id:'lateral',label:'Lateral'},
  {id:'medial',label:'Medial'},
  {id:'anterior',label:'Anterior'},
  {id:'posterior',label:'Posterior'},
  {id:'superior',label:'Superior'},
  {id:'inferior',label:'Inferior'}
];
const EXAM_POOL=[12,14,15,16,23,25,26,27,28,29,30,33,34,36,45,11,19,21,9,18];
const hemisphereName=h=>h==='left'?'Izquierdo':h==='right'?'Derecho':'Ambos';
const hemiShort=h=>h==='left'?'I':'D';
function makeQuestion(previous){
 const candidates=EXAM_POOL.filter(x=>x!==previous?.id);
 const id=candidates[Math.floor(Math.random()*candidates.length)];
 const hemi=Math.random()>.5?'left':'right';
 return {id,hemi};
}
function Pill({children,selected,onClick,title}){
 return <button type="button" title={title} className={'seg-pill'+(selected?' selected':'')} onClick={onClick}>{children}</button>;
}
function App(){
 const [regions,setRegions]=useState([]);
 const [error,setError]=useState('');
 const [loading,setLoading]=useState(true);
 const [hemi,setHemi]=useState('both');
 const [surface,setSurface]=useState('pial');
 const [display,setDisplay]=useState('anatomy');
 const [orientation,setOrientation]=useState('oblique');
 const [domain,setDomain]=useState('all');
 const [selected,setSelected]=useState({hemi:'left',id:29});
 const [hovered,setHovered]=useState(null);
 const [search,setSearch]=useState('');
 const [lobeFilter,setLobeFilter]=useState('all');
 const [rotate,setRotate]=useState(false);
 const [showLabels,setShowLabels]=useState(true);
 const [opacity,setOpacity]=useState(100);
 const [reset,setReset]=useState(0);
 const [inspectorTab,setInspectorTab]=useState('anatomy');
 const [navOpen,setNavOpen]=useState(false);
 const [fullscreen,setFullscreen]=useState(false);
 const [exam,setExam]=useState(false);
 const [question,setQuestion]=useState(()=>makeQuestion(null));
 const [answered,setAnswered]=useState(null);
 const [attempts,setAttempts]=useState(0);
 const [correct,setCorrect]=useState(0);
 
 const viewerShell=useRef(null),canvasRef=useRef(null),searchInput=useRef(null);
 useEffect(()=>{
   let cancelled=false;
   fetch(import.meta.env.BASE_URL+'atlas/regions.json').then(r=>{if(!r.ok)throw new Error('No se pudo cargar la parcelación Destrieux.');return r.json();})
   .then(json=>{if(!cancelled)setRegions(json.regions||[]);})
   .catch(e=>{if(!cancelled)setError(e.message);});
   return()=>{cancelled=true;};
 },[]);
 const regionMap=useMemo(()=>new Map(regions.map(r=>[r.id,r])),[regions]);
 const selectedRegion=regionMap.get(selected.id)||{id:29,name:'G_precentral',lobe:'frontal'};
 const info=regionInfo(selectedRegion);
 const activeDomain=DOMAINS.find(d=>d.id===domain)||DOMAINS[0];
 const focusIds=activeDomain.ids;
 const selectedIsFocus=!focusIds.length||focusIds.includes(selected.id);
 const list=useMemo(()=>{
   const q=search.toLocaleLowerCase('es').trim();
   return regions.filter(r=>r.id>0&&r.id!==42&&(lobeFilter==='all'||r.lobe===lobeFilter)&&
     (!q||(REGION_NAMES[r.id]||r.name).toLocaleLowerCase('es').includes(q)||r.name.toLowerCase().includes(q)))
     .sort((a,b)=>(REGION_NAMES[a.id]||a.name).localeCompare(REGION_NAMES[b.id]||b.name,'es'));
 },[regions,search,lobeFilter]);
 const updateHemi=useCallback(next=>{setHemi(next);if(next==='both'&&orientation==='medial')setOrientation('oblique');setReset(n=>n+1);},[orientation]);
 const updateOrientation=next=>{
   if(next==='medial'&&hemi==='both')setHemi('left');
   setOrientation(next);setReset(n=>n+1);
 };
 const handleError=useCallback(message=>{setError(message);setLoading(false);},[]);
 const handleHover=useCallback(value=>{setHovered(previous=>previous?.id===value?.id&&previous?.hemi===value?.hemi?previous:value);},[]);
 const handleSelection=useCallback(value=>{
   if(exam){
     if(answered)return;
     const yes=value.id===question.id&&value.hemi===question.hemi;
     setAnswered({yes,chosen:value});
     setAttempts(n=>n+1);
     if(yes)setCorrect(n=>n+1);
   }
   setSelected(value);
   setInspectorTab('anatomy');
 },[exam,answered,question]);
 const goToRegion=(id,h)=>{
   setExam(false);setAnswered(null);
   setSelected({id,hemi:h});
   setHemi(h);
   setOrientation('lateral');
   setInspectorTab('anatomy');
   setReset(n=>n+1);
   viewerShell.current?.scrollIntoView({behavior:'smooth',block:'center'});
 };
 const toggleExam=()=>{
   if(!exam){setSelected({hemi:'left',id:0});setQuestion(makeQuestion(null));setAnswered(null);setAttempts(0);setCorrect(0);setHemi('both');setDisplay('lobes');setOrientation('oblique');setReset(n=>n+1);}
   else{setAnswered(null);setDisplay('anatomy');}
   setExam(v=>!v);
 };
 const nextQuestion=()=>{setQuestion(q=>makeQuestion(q));setAnswered(null);setSelected({hemi:'left',id:0});setHemi('both');setReset(n=>n+1);};
 const takeCapture=()=>{
   const c=canvasRef.current;
   if(!c){setError('El visor todavía no se ha inicializado.');return;}
   try{const a=document.createElement('a');a.download='neuroatlas-fsaverage5.png';a.href=c.toDataURL('image/png');a.click();}
   catch{setError('La captura no está disponible en este navegador.');}
 };
 const toggleFullscreen=async()=>{
   try{if(document.fullscreenElement)await document.exitFullscreen();else await viewerShell.current?.requestFullscreen();}
   catch{setError('El navegador no permitió la pantalla completa.');}
 };
 useEffect(()=>{
   const onChange=()=>setFullscreen(!!document.fullscreenElement);
   document.addEventListener('fullscreenchange',onChange);
   return()=>document.removeEventListener('fullscreenchange',onChange);
 },[]);
 const jump=id=>{setNavOpen(false);document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'});};
 return <div className="app">
   <aside className={'rail'+(navOpen?' rail-open':'')}>
     <div className="brand"><div className="brand-icon"><Brain size={23}/></div><div><strong>NEURO<span>ATLAS</span></strong><small>LABORATORIO 3D</small></div></div>
     <div className="rail-section">LABORATORIO</div>
     <button className="rail-link active" onClick={()=>jump('explorar')}><Brain size={18}/>Atlas cortical<ChevronRight size={14} className="trailing"/></button>
     <button className="rail-link" onClick={()=>{setDomain('language');jump('explorar');}}><Network size={18}/>Redes neuropsicológicas</button>
     <button className={'rail-link'+(exam?' is-quiz':'')} onClick={()=>{toggleExam();jump('explorar');setNavOpen(false);}}><Target size={18}/>Modo evaluación</button>
     <div className="rail-section rail-second">REFERENCIA</div>
     <button className="rail-link" onClick={()=>jump('regiones')}><Layers3 size={18}/>Índice anatómico</button>
     <button className="rail-link" onClick={()=>jump('metodologia')}><BookOpen size={18}/>Fuentes científicas</button>
     <div className="rail-grow"/>
     <div className="rail-note"><span className="rail-note-kicker"><GraduationCap size={18}/> HERRAMIENTA DOCENTE</span><strong>Comprender el cerebro empieza por observarlo.</strong><p>Geometría anatómica de referencia y correlatos neuropsicológicos.</p></div>
     <div className="rail-version"><span className="status-dot"/> Datos fsaverage5 <span>v2.0</span></div>
   </aside>
   {navOpen&&<button className="nav-scrim" aria-label="Cerrar menú" onClick={()=>setNavOpen(false)}/>}
   <div className="app-main">
     <header className="topbar"><div className="top-path"><button className="hamburger" onClick={()=>setNavOpen(true)} aria-label="Abrir navegación"><Menu size={20}/></button><span>Laboratorio de neurociencias</span><ChevronRight size={15}/><strong>Atlas cortical interactivo</strong></div><div className="top-actions"><span className="source-status"><span className="status-dot"/> DATOS ANATÓMICOS REALES</span><button className="help-btn" onClick={()=>jump('metodologia')} title="Fuentes y limitaciones"><Info size={17}/></button><div className="avatar">NA</div></div></header>
     <main className="content">
       <section id="explorar" className="page-header">
         <div className="eyebrow"><span/> NEUROCIENCIAS · ATLAS ACADÉMICO</div>
         <h1>Explora el cerebro. <em>Comprende sus redes.</em></h1>
         <p>Un espacio de estudio interactivo para conectar la anatomía cortical con la neuropsicología.</p>
         <div className="source-metrics"><div><strong>20 484</strong><span>VÉRTICES CORTICALES</span></div><i/><div><strong>74</strong><span>PARCELAS POR HEMISFERIO</span></div><i/><div><strong>fsaverage5</strong><span>SUPERFICIE DE REFERENCIA</span></div></div>
       </section>
       <div className="explorer-top"><div><span className="section-kicker">01 / EXPLORADOR</span><h2>Atlas anatómico 3D</h2></div><div className="atlas-actions"><span><span className="status-dot"/> Vista en tiempo real</span><button onClick={takeCapture}><Download size={16}/> Exportar PNG</button></div></div>
       <section className="viewer-workspace" ref={viewerShell}>
         <div className="stage-column">
           <div className="stage-toolbar">
             <div className="control-group"><span className="control-label">HEMISFERIO</span><div className="segmented">
               {['both','left','right'].map(h=><Pill key={h} selected={hemi===h} onClick={()=>updateHemi(h)}>{hemisphereName(h)}</Pill>)}
             </div></div>
             <div className="control-group"><span className="control-label">SUPERFICIE</span><div className="segmented">
               <Pill selected={surface==='pial'} onClick={()=>{setSurface('pial');setLoading(true);}}>Pial</Pill>
               <Pill selected={surface==='infl'} onClick={()=>{setSurface('infl');setLoading(true);}}>Inflada</Pill>
             </div></div>
           </div>
           <div className="canvas-shell">
             <div className="canvas-badge"><span className="status-dot"/> FREE SURFER · FSAVERAGE5</div>
             <div className="compass">S <span>·</span> A <span>·</span> R</div>
             <AtlasViewer hemi={hemi} mode={surface} display={display} selected={selected}
               onSelect={handleSelection} onHover={handleHover} regionMap={regionMap} focusIds={focusIds}
               quiz={exam} orientation={orientation} reset={reset} rotate={rotate} opacity={opacity/100}
               onLoading={setLoading} onError={handleError} canvasRef={canvasRef}/>
             {loading&&<div className="loading-overlay" role="status"><span className="load-ring"/><strong>Cargando superficie cortical…</strong><small>fsaverage5 / Destrieux</small></div>}
             {showLabels&&!exam&&hovered&&regionMap.has(hovered.id)&&<div className="hover-label">
               <span className="hover-dot"/><div><strong>{REGION_NAMES[hovered.id]}</strong><small>Hemisferio {hemisphereName(hovered.hemi).toLowerCase()} · Seleccionar con clic</small></div>
             </div>}
             <div className="canvas-grid-mark">SUPERFICIE ANATÓMICA • NO DIAGNÓSTICA</div>
             <div className="canvas-bottom">
               <span className="drag-hint"><MousePointer2 size={15}/> Arrastra para rotar · Rueda para zoom</span>
               <div className="canvas-tools">
                 <button title="Restablecer cámara" onClick={()=>setReset(n=>n+1)}><RotateCcw size={17}/></button>
                 <button title={rotate?'Detener giro':'Rotación automática'} aria-pressed={rotate} className={rotate?'pressed':''} onClick={()=>setRotate(v=>!v)}>{rotate?<Pause size={17}/>:<Play size={17}/>}</button>
                 <button title={showLabels?'Ocultar identificación al señalar':'Mostrar identificación'} aria-pressed={showLabels} className={showLabels?'pressed':''} onClick={()=>setShowLabels(v=>!v)}><Eye size={17}/></button>
                 <button title={fullscreen?'Salir de pantalla completa':'Pantalla completa'} onClick={toggleFullscreen}>{fullscreen?<Minimize2 size={17}/>:<Maximize2 size={17}/>}</button>
               </div>
             </div>
           </div>
           <div className="stage-settings">
             <div className="setting-line"><span>ORIENTACIÓN</span><div className="orientation-row">{ORIENTATIONS.map(item=><button key={item.id} onClick={()=>updateOrientation(item.id)} className={orientation===item.id?'chosen':''}>{item.label}</button>)}</div></div>
             <div className="setting-line"><span>COLORACIÓN</span><div className="orientation-row">{[['anatomy','Anatómica'],['lobes','Lóbulos'],['parcels','74 regiones']].map(([id,label])=><button key={id} className={display===id?'chosen':''} onClick={()=>setDisplay(id)}>{label}</button>)}</div></div>
             <div className="setting-line opacity-line"><label htmlFor="opacity">OPACIDAD <strong>{opacity}%</strong></label><input id="opacity" type="range" min="25" max="100" step="5" value={opacity} onChange={e=>setOpacity(Number(e.target.value))}/></div>
           </div>
         </div>
         <aside className="inspector">
           <div className="inspector-tabs"><button onClick={()=>setInspectorTab('anatomy')} className={inspectorTab==='anatomy'?'current':''}>Anatomía</button><button onClick={()=>setInspectorTab('neuro' )} className={inspectorTab==='neuro'?'current':''}>Neuropsicología</button></div>
           <div className="inspector-content">
             <div className="inspector-kicker"><span style={{background:info.color}}/> {info.lobe} / {hemiShort(selected.hemi)}</div>
             <h3>{info.name}</h3><p className="latin-name">{info.original} · Destrieux 2009</p>
             <div className="inspector-separator"/>
             {inspectorTab==='anatomy'?<>
               <div className="field-kicker">DESCRIPCIÓN ANATÓMICA</div>
               <p className="info-description">{info.description}</p>
               <div className="field-kicker field-secondary">IDENTIFICACIÓN</div>
               <div className="property-list"><div><span>Atlas</span><strong>Destrieux a2009s</strong></div><div><span>Hemisferio</span><strong>{hemisphereName(selected.hemi)}</strong></div><div><span>Región</span><strong>{String(selected.id).padStart(2,'0')} / 75</strong></div><div><span>Geometría</span><strong>{surface==='pial'?'Pial':'Inflada'}</strong></div></div>
             </>:<>
               <div className="field-kicker">CORRELATOS FUNCIONALES</div>
               <div className="domain-tags">{info.domains.map(d=><span key={d}>{d}</span>)}</div>
               <p className="info-description">{info.description}</p>
               <div className="field-kicker field-secondary">INTERPRETACIÓN CLÍNICA</div>
               <div className="clinical-note"><Activity size={16}/><p>{info.clinical}</p></div>
             </>}
             <div className="inspector-footnote"><Info size={15}/> La superficie pial no representa núcleos profundos ni tractos de sustancia blanca.</div>
           </div>
           <div className="inspector-footer"><span className="status-dot"/> REFERENCIA ANATÓMICA <span>FS5</span></div>
         </aside>
       </section>
       {error&&<div role="alert" className="error-banner"><AlertCircle size={17}/>{error}<button onClick={()=>setError('')} aria-label="Cerrar aviso"><X size={15}/></button></div>}
       <div className="below-grid">
         <section className="network-card">
           <div className="panel-heading"><div><span className="section-kicker">02 / NEUROPSICOLOGÍA</span><h2>Explorar por dominio cognitivo</h2></div><Network size={20}/></div>
           <p>Visualiza agrupaciones corticales relacionadas con sistemas funcionales distribuidos.</p>
           <div className="domain-grid">{DOMAINS.map(d=><button key={d.id} className={'domain-option'+(domain===d.id?' picked':'')}
             onClick={()=>{setDomain(d.id);if(d.id!=='all')setDisplay('lobes');}}>{d.name}{domain===d.id&&<CheckCircle2 size={15}/>}</button>)}</div>
           <div className="domain-description"><Info size={17}/><div><strong>{activeDomain.name}</strong><p>{activeDomain.description} {domain!=='all'?'Las áreas señaladas son referencias didácticas, no una delimitación funcional exhaustiva.':''}</p></div></div>
         </section>
         <section className="quiz-card">
           <div className="panel-heading"><div><span className="section-kicker">03 / APRENDIZAJE ACTIVO</span><h2>Autoevaluación anatómica</h2></div><Target size={20}/></div>
           {!exam?<><p>Pon a prueba tu identificación de estructuras corticales en ambos hemisferios.</p><div className="quiz-illustration"><div><Target size={36}/><span>IDENTIFICA · LOCALIZA · REPASA</span></div></div><button className="quiz-primary" onClick={toggleExam}>Comenzar evaluación <ArrowRight size={17}/></button></>:
             <div className="quiz-running"><div className="quiz-top"><span>PREGUNTA {attempts+(!answered?1:0)}</span><span>{correct} / {attempts} aciertos</span></div>
             <p>Selecciona en el modelo:</p><strong>{REGION_NAMES[question.id]}</strong><span>Hemisferio {hemisphereName(question.hemi).toLowerCase()}</span>
             {answered&&<div className={'exam-feedback'+(answered.yes?' correct':' incorrect')}>{answered.yes?<CheckCircle2 size={18}/>:<AlertCircle size={18}/>} {answered.yes?'Localización correcta.':'Respuesta incorrecta. Revisa la región y su hemisferio.'}</div>}
             <div className="quiz-actions">{answered?<button className="quiz-primary" onClick={nextQuestion}>Siguiente pregunta <ArrowRight size={16}/></button>:<div className="exam-hint">Puedes rotar, acercar y cambiar la vista antes de seleccionar.</div>}<button className="quiz-stop" onClick={toggleExam}>Salir de la evaluación</button></div></div>}
         </section>
       </div>
       <section id="regiones" className="regions-section">
         <div className="panel-heading"><div><span className="section-kicker">04 / CONSULTA ANATÓMICA</span><h2>Índice de regiones corticales</h2></div><span className="count-label">{regions.filter(r=>r.id>0&&r.id!==42).length} etiquetas corticales</span></div>
         <p className="section-intro">Busca una región por su denominación anatómica. Selecciónala para ubicarla en el modelo y consultar sus correlaciones.</p>
         <div className="index-toolbar"><label className="index-search"><Search size={18}/><input ref={searchInput} placeholder="Buscar giro, surco o estructura…" value={search} onChange={e=>setSearch(e.target.value)}/>{search&&<button onClick={()=>setSearch('')} aria-label="Limpiar búsqueda"><X size={15}/></button>}</label><div className="filter-wrap"><SlidersHorizontal size={16}/><select aria-label="Filtrar por región" value={lobeFilter} onChange={e=>setLobeFilter(e.target.value)}><option value="all">Todas las regiones</option>{Object.entries(LOBES).filter(([key])=>key!=='other').map(([key,val])=><option key={key} value={key}>{val.label}</option>)}</select><ChevronDown size={14}/></div></div>
         <div className="region-list" role="list">{list.length?list.map(r=><div className="region-row" key={r.id} role="listitem"><span className="region-id">{String(r.id).padStart(2,'0')}</span><span className="region-color" style={{background:(LOBES[r.lobe]||LOBES.other).color}}/><div className="region-text"><strong>{REGION_NAMES[r.id]||r.name}</strong><small>{(LOBES[r.lobe]||LOBES.other).label} · {r.name}</small></div><button onClick={()=>goToRegion(r.id,'left')} title="Explorar hemisferio izquierdo">I</button><button onClick={()=>goToRegion(r.id,'right')} title="Explorar hemisferio derecho">D</button></div>):<div className="no-results">No se encontraron regiones para esta búsqueda.</div>}</div>
       </section>
       <section id="metodologia" className="references">
         <div className="panel-heading"><div><span className="section-kicker">05 / RIGOR CIENTÍFICO</span><h2>Metodología y fuentes</h2></div><BookMarked size={20}/></div>
         <div className="reference-grid"><div className="methods-copy"><strong>¿Qué estás observando?</strong><p>Superficies corticales de referencia fsaverage5, reconstruidas a partir de datos anatómicos y divididas por el atlas Destrieux. Las superficies infladas facilitan la observación de áreas ocultas en los surcos, pero distorsionan la forma anatómica.</p>
         <div className="method-alert"><Info size={16}/> No es una reconstrucción individual, un mapa de activación funcional, un atlas subcortical ni una herramienta diagnóstica.</div></div>
         <div className="reference-list">{SOURCES.map(s=><a key={s.url} href={s.url} target="_blank" rel="noreferrer"><span><strong>{s.title}</strong><small>{s.detail}</small></span><ExternalLink size={16}/></a>)}</div></div>
       </section>
       <footer className="site-footer"><span><Brain size={15}/> NeuroAtlas 3D · Anatomía basada en datos de referencia</span><span>Educación e investigación · Uso no diagnóstico</span></footer>
     </main>
   </div>
 </div>;
}
export default App;

