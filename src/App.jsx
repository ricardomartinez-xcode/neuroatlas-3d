import React,{useEffect,useRef,useState,useCallback} from 'react';
import {Brain,Layers3,Compass,Search,BookOpen,Info,Settings2,Upload,Download,RotateCcw,Play,Pause,Tag,Maximize2,Minimize2,Menu,X,ChevronRight,ChevronDown,MousePointer2,Move3D,Box,Check,ArrowUpRight,Atom,GraduationCap} from 'lucide-react';
import Viewer3D from './Models.jsx';

const MODELS=[
  {id:'brain',name:'Cerebro completo',sub:'Vista macroscópica',category:'Neuroanatomía',num:'01',tone:'#e8b6a4',symbol:'brain'},
  {id:'lobes',name:'Lóbulos cerebrales',sub:'Regiones por color',category:'Neuroanatomía',num:'02',tone:'#91bfc8',symbol:'lobes'},
  {id:'sagittal',name:'Vista medial',sub:'Estructuras internas',category:'Neuroanatomía',num:'03',tone:'#a79fca',symbol:'medial'},
  {id:'neuron',name:'Neurona',sub:'Anatomía celular',category:'Biología celular',num:'04',tone:'#dea78f',symbol:'neuron'},
  {id:'cerebellum',name:'Cerebelo',sub:'Coordinación motora',category:'Neuroanatomía',num:'05',tone:'#d3ab99',symbol:'cerebellum'},
  {id:'dna',name:'Doble hélice de ADN',sub:'Biología molecular',category:'Biología celular',num:'06',tone:'#86c8c5',symbol:'dna'}
];
const PARTS={
  brain:{title:'Cerebro humano',latin:'Cerebrum',type:'Visión general',color:'#e5b4a0',desc:'El cerebro integra información sensorial, participa en el movimiento voluntario y sustenta funciones como la memoria, el lenguaje y el pensamiento.',functions:['Integración sensorial','Control motor','Cognición y conducta'],note:'Observa ambos hemisferios, las circunvoluciones y la región posterior del encéfalo.'},
  frontal:{title:'Lóbulo frontal',latin:'Lobus frontalis',type:'Corteza cerebral',color:'#eaa78d',desc:'Región anterior de la corteza cerebral implicada en la planificación, el control de la conducta, la toma de decisiones y componentes de la motricidad y el lenguaje.',functions:['Funciones ejecutivas','Movimiento voluntario','Control conductual'],note:'Incluye áreas prefrontales, motoras y, habitualmente en el hemisferio dominante, parte de las áreas del lenguaje.'},
  parietal:{title:'Lóbulo parietal',latin:'Lobus parietalis',type:'Corteza cerebral',color:'#8bbdcb',desc:'Participa en el procesamiento somatosensorial y en la integración de información necesaria para orientarse y actuar en el espacio.',functions:['Somatosensación','Integración espacial','Atención'],note:'La corteza somatosensorial primaria se localiza en el giro poscentral.'},
  temporal:{title:'Lóbulo temporal',latin:'Lobus temporalis',type:'Corteza cerebral',color:'#e4bc78',desc:'Incluye regiones importantes para la audición, el reconocimiento de estímulos y la memoria; algunas intervienen en la comprensión del lenguaje.',functions:['Procesamiento auditivo','Memoria','Reconocimiento'],note:'En su región medial se encuentran estructuras relacionadas con la formación de recuerdos.'},
  occipital:{title:'Lóbulo occipital',latin:'Lobus occipitalis',type:'Corteza cerebral',color:'#ad9bce',desc:'Región cortical posterior especializada en el procesamiento inicial e integración de la información visual.',functions:['Procesamiento visual','Forma y color','Percepción visual'],note:'La corteza visual primaria se organiza alrededor de la cisura calcarina.'},
  callosum:{title:'Cuerpo calloso',latin:'Corpus callosum',type:'Sustancia blanca',color:'#efd5b7',desc:'Principal comisura de fibras nerviosas que comunica regiones de ambos hemisferios cerebrales.',functions:['Conexión interhemisférica','Transferencia de información','Integración bilateral'],note:'La representación de esta vista es una aproximación esquemática.'},
  thalamus:{title:'Tálamo',latin:'Thalamus',type:'Diencéfalo',color:'#8ccac1',desc:'Complejo de núcleos que participa en el relevo y la modulación de información sensorial y motora, así como en circuitos de atención y vigilia.',functions:['Relevo sensorial','Circuitos motores','Atención y vigilia'],note:'Casi todas las vías sensoriales hacia la corteza hacen relevo en el tálamo; la olfatoria es una excepción importante.'},
  hippocampus:{title:'Hipocampo',latin:'Hippocampus',type:'Sistema límbico',color:'#e1bb79',desc:'Estructura del lóbulo temporal medial especialmente relevante en la formación de memorias episódicas y la navegación espacial.',functions:['Memoria episódica','Aprendizaje','Navegación espacial'],note:'La forma y localización mostradas son ilustrativas, no una segmentación anatómica real.'},
  neuron:{title:'Neurona multipolar',latin:'Neuron',type:'Biología celular',color:'#eaaa95',desc:'Célula excitable especializada en recibir, integrar y transmitir señales mediante cambios eléctricos y comunicación sináptica.',functions:['Recepción de señales','Integración','Transmisión neuronal'],note:'Identifica dendritas, soma, axón y segmentos de mielina.'},
  dendrites:{title:'Dendritas',latin:'Dendritae',type:'Neurona',color:'#d99188',desc:'Prolongaciones ramificadas que reciben numerosas entradas sinápticas y conducen señales hacia el cuerpo celular.',functions:['Recepción sináptica','Integración local','Plasticidad neuronal'],note:'Su morfología varía ampliamente entre tipos de neuronas.'},
  soma:{title:'Soma neuronal',latin:'Perikaryon',type:'Neurona',color:'#eaaa95',desc:'Cuerpo celular que contiene el núcleo y gran parte de la maquinaria metabólica de la neurona.',functions:['Metabolismo celular','Síntesis proteica','Integración de señales'],note:'Se representa de forma simplificada para facilitar su identificación.'},
  axon:{title:'Axón',latin:'Axon',type:'Neurona',color:'#8bc5bd',desc:'Prolongación especializada en conducir potenciales de acción hacia terminales axónicas y otras células.',functions:['Conducción eléctrica','Comunicación sináptica','Transmisión a distancia'],note:'Algunos axones están mielinizados y otros no.'},
  cerebellum:{title:'Cerebelo',latin:'Cerebellum',type:'Metencéfalo',color:'#d3ab99',desc:'Estructura encefálica importante para la coordinación, precisión y aprendizaje de los movimientos, el equilibrio y otras funciones.',functions:['Coordinación','Equilibrio','Aprendizaje motor'],note:'La disposición de las folias está simplificada en este modelo.'},
  dna:{title:'ADN',latin:'Acidum deoxyribonucleicum',type:'Biología molecular',color:'#86c8c5',desc:'Molécula que almacena información genética. Sus dos cadenas complementarias se enrollan formando una doble hélice.',functions:['Información genética','Replicación','Herencia'],note:'Modelo didáctico sin detalle atómico ni escala física real.'},
  imported:{title:'Modelo importado',latin:'Archivo GLB',type:'Archivo local',color:'#8abcc5',desc:'Modelo tridimensional cargado desde tu dispositivo. El archivo se procesa localmente en el navegador y no se envía a un servidor.',functions:['Rotación libre','Acercamiento','Inspección 3D'],note:'Las características y la precisión dependen del archivo original.'}
};
const DEFAULT={brain:'brain',lobes:'frontal',sagittal:'callosum',neuron:'neuron',cerebellum:'cerebellum',dna:'dna'};
function MiniModel({type,color}){
  return <div className={'mini-model mini-'+type} style={{'--model-color':color}}><span/><i/><b/></div>;
}
function App(){
  const [model,setModel]=useState('brain');
  const [selected,setSelected]=useState('brain');
  const [labels,setLabels]=useState(true);
  const [rotate,setRotate]=useState(false);
  const [reset,setReset]=useState(0);
  const [category,setCategory]=useState('Todos');
  const [query,setQuery]=useState('');
  const [uploaded,setUploaded]=useState(null);
  const [error,setError]=useState('');
  const [guide,setGuide]=useState(false);
  const [mobileNav,setMobileNav]=useState(false);
  const [infoOpen,setInfoOpen]=useState(true);
  const [full,setFull]=useState(false);
  const fileInput=useRef(null);
  const viewport=useRef(null);
  const current=uploaded?PARTS.imported:(PARTS[selected]||PARTS[model]||PARTS.brain);
  const activeModel=MODELS.find(m=>m.id===model)||MODELS[0];
  const shown=MODELS.filter(m=>(category==='Todos'||m.category===category)&&
    (m.name+' '+m.sub+' '+m.category).toLocaleLowerCase('es').includes(query.toLocaleLowerCase('es')));
  const dismissError=useCallback(()=>setError(''),[]);
  const switchModel=id=>{
    if(uploaded?.url)URL.revokeObjectURL(uploaded.url);
    setUploaded(null);setModel(id);setSelected(DEFAULT[id]);setReset(n=>n+1);dismissError();
  };
  useEffect(()=>()=>{if(uploaded?.url)URL.revokeObjectURL(uploaded.url);},[uploaded]);
  const importFile=e=>{
    const file=e.target.files?.[0];e.target.value='';
    if(!file)return;
    if(!file.name.toLowerCase().endsWith('.glb')){setError('Solo se admiten archivos .glb.');return;}
    if(file.size>30*1024*1024){setError('El tamaño máximo permitido es 30 MB.');return;}
    setUploaded({name:file.name,url:URL.createObjectURL(file)});setSelected('imported');setReset(n=>n+1);dismissError();
  };
  const capture=()=>{
    const canvas=viewport.current?.querySelector('canvas');
    if(!canvas){setError('El visor todavía no está disponible.');return;}
    try{const link=document.createElement('a');link.href=canvas.toDataURL('image/png');link.download='neuroatlas-3d.png';link.click();}
    catch{setError('No se pudo generar la captura en este navegador.');}
  };
  const fullscreen=async()=>{
    try{if(!document.fullscreenElement){await viewport.current?.requestFullscreen();setFull(true);}else{await document.exitFullscreen();setFull(false);}}
    catch{setError('La pantalla completa no está disponible en este navegador.');}
  };
  useEffect(()=>{
    const handler=()=>setFull(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange',handler);
    return()=>document.removeEventListener('fullscreenchange',handler);
  },[]);
  return <div className="app-shell">
    <aside className={'sidebar '+(mobileNav?'is-open':'')}>
      <div className="brand"><div className="brand-icon"><Brain size={24} strokeWidth={1.8}/></div><div><strong>neuro<span>atlas</span></strong><small>3D EXPLORER</small></div></div>
      <div className="sidebar-label">ESPACIO DE TRABAJO</div>
      <nav aria-label="Navegación principal">
        <button className="nav-link active" onClick={()=>{setCategory('Todos');setMobileNav(false);document.getElementById('modelos')?.scrollIntoView({behavior:'smooth'});}}><Compass size={18}/>Explorar modelos<ChevronRight className="nav-trailing" size={16}/></button>
        <button className="nav-link" onClick={()=>{setCategory('Neuroanatomía');setMobileNav(false);document.getElementById('modelos')?.scrollIntoView({behavior:'smooth'});}}><Brain size={18}/>Neuroanatomía</button>
        <button className="nav-link" onClick={()=>{setCategory('Biología celular');setMobileNav(false);document.getElementById('modelos')?.scrollIntoView({behavior:'smooth'});}}><Atom size={18}/>Biología celular</button>
      </nav>
      <div className="sidebar-label second-label">HERRAMIENTAS</div>
      <nav aria-label="Herramientas">
        <button className="nav-link" onClick={()=>{fileInput.current?.click();setMobileNav(false);}}><Upload size={18}/>Importar modelo</button>
        <button className="nav-link" onClick={()=>{setGuide(true);setMobileNav(false);}}><BookOpen size={18}/>Guía de uso</button>
      </nav>
      <div className="sidebar-bottom"><div className="study-card"><div className="study-mark"><GraduationCap size={20}/></div><strong>Aprende explorando</strong><p>El conocimiento toma otra dimensión.</p><button onClick={()=>setGuide(true)}>Ver cómo funciona <ArrowUpRight size={15}/></button></div>
        <div className="sidebar-foot"><span className="online-dot"/> Atlas educativo <span>v1.0</span></div>
      </div>
    </aside>
    {mobileNav&&<button className="nav-backdrop" aria-label="Cerrar menú" onClick={()=>setMobileNav(false)}/>}
    <main className="main-area">
      <header className="topbar">
        <div className="top-left"><button className="mobile-menu icon-only" aria-label="Abrir menú" onClick={()=>setMobileNav(true)}><Menu size={21}/></button><span className="breadcrumb">Laboratorio</span><ChevronRight size={14}/><strong>Explorador 3D</strong></div>
        <div className="top-right"><span className="top-status"><span className="online-dot"/> Entorno interactivo</span><button className="round-help" aria-label="Abrir ayuda" onClick={()=>setGuide(true)}><Info size={18}/></button><div className="avatar">N</div></div>
      </header>
      <div className="page-content">
        <section className="heading-section">
          <div><div className="eyebrow"><span className="eyebrow-line"/> EL ATLAS INTERACTIVO</div>
            <h1>La anatomía, en <em>otra dimensión.</em></h1>
            <p>Explora, gira y descubre las estructuras que hacen posible la vida.</p>
          </div>
          <div className="heading-mark"><span>01 — 06</span><small>COLECCIÓN INICIAL</small></div>
        </section>
        <section className={'workspace '+(!infoOpen?'no-inspector':'')} aria-label="Visor interactivo">
          <div className="viewer-panel" ref={viewport}>
            <div className="viewer-top"><span className="view-tag"><span className="live-icon"/> VISUALIZACIÓN 3D</span><div className="viewer-top-actions"><span>MODELO ESQUEMÁTICO</span><button title={full?'Salir de pantalla completa':'Pantalla completa'} aria-label="Pantalla completa" onClick={fullscreen}>{full?<Minimize2 size={17}/>:<Maximize2 size={17}/>}</button></div></div>
            <div className="viewer-stage">
              <div className="orbit orbit-one"/><div className="orbit orbit-two"/>
              <span className="axis-label axis-left">IZQUIERDA</span><span className="axis-label axis-right">DERECHA</span>
              <Viewer3D model={model} selected={selected} onSelect={setSelected} labels={labels} rotate={rotate} reset={reset} uploaded={uploaded} onError={setError}/>
            </div>
            <div className="model-caption"><div className="caption-index">FIG {activeModel.num} / 06</div><div><h2>{uploaded?uploaded.name:activeModel.name}</h2><p>{uploaded?'Archivo local · GLB':activeModel.sub}</p></div></div>
            <div className="viewer-bottom">
              <div className="viewer-hint"><MousePointer2 size={16}/><span>Arrastra para rotar <b>·</b> Desliza para acercar</span></div>
              <div className="toolbar" role="toolbar" aria-label="Controles del visor">
                <button title="Restablecer cámara" aria-label="Restablecer cámara" onClick={()=>setReset(n=>n+1)}><RotateCcw size={17}/></button>
                <button title={rotate?'Detener rotación':'Rotación automática'} aria-label="Rotación automática" aria-pressed={rotate} className={rotate?'toggled':''} onClick={()=>setRotate(v=>!v)}>{rotate?<Pause size={17}/>:<Play size={17}/>}</button>
                <button title="Mostrar u ocultar etiquetas" aria-label="Mostrar u ocultar etiquetas" aria-pressed={labels} className={labels?'toggled':''} onClick={()=>setLabels(v=>!v)}><Tag size={17}/></button>
                <span className="toolbar-separator"/>
                <button title="Descargar imagen PNG" aria-label="Descargar imagen PNG" onClick={capture}><Download size={17}/></button>
              </div>
            </div>
          </div>
          {infoOpen&&<aside className="inspector">
            <div className="inspector-head"><span>DETALLES DEL MODELO</span><button aria-label="Ocultar detalles" onClick={()=>setInfoOpen(false)}><X size={17}/></button></div>
            <div className="inspector-body"><span className="detail-overline"><span className="detail-dot" style={{background:current.color}}/>{current.type}</span>
              <h2>{current.title}</h2><p className="latin">{current.latin}</p><div className="detail-divider"/>
              <div className="section-caption">DESCRIPCIÓN</div><p className="description">{current.desc}</p>
              <div className="section-caption function-caption">FUNCIONES PRINCIPALES</div>
              <div className="function-list">{current.functions.map((f,i)=><div className="function" key={f}><span className="check-circle"><Check size={13}/></span>{f}</div>)}</div>
              <div className="inspector-note"><Info size={17}/><p>{current.note}</p></div>
            </div>
            <div className="inspector-foot"><div><span className="foot-swatch" style={{background:current.color}}/> Identificación anatómica</div><span>EDUCATIVO</span></div>
          </aside>}
          {!infoOpen&&<button className="restore-inspector" onClick={()=>setInfoOpen(true)}><Info size={16}/> Mostrar detalles</button>}
        </section>
        {error&&<div className="error-notice" role="alert"><Info size={18}/><span>{error}</span><button aria-label="Cerrar mensaje" onClick={dismissError}><X size={16}/></button></div>}
        <section id="modelos" className="models-section">
          <div className="section-heading"><div><span className="eyebrow">EXPLORA LA COLECCIÓN</span><h2>Biblioteca de modelos <span>({MODELS.length.toString().padStart(2,'0')})</span></h2></div><button className="import-button" onClick={()=>fileInput.current?.click()}><Upload size={16}/> Importar .GLB</button></div>
          <div className="library-tools"><div className="category-tabs" aria-label="Filtrar modelos">{['Todos','Neuroanatomía','Biología celular'].map(x=><button key={x} className={category===x?'selected':''} onClick={()=>setCategory(x)}>{x}</button>)}</div><label className="search-box"><Search size={17}/><input aria-label="Buscar modelos" placeholder="Buscar modelo..." value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button aria-label="Limpiar búsqueda" onClick={()=>setQuery('')}><X size={14}/></button>}</label></div>
          <div className="model-grid">{shown.map(item=><button type="button" key={item.id} className={'model-card '+(model===item.id&&!uploaded?'is-active':'')} onClick={()=>{switchModel(item.id);viewport.current?.scrollIntoView({behavior:'smooth',block:'center'});}}>
            <div className="card-art"><span className="card-number">{item.num} / 06</span><MiniModel type={item.symbol} color={item.tone}/><span className="card-arrow"><ArrowUpRight size={17}/></span></div>
            <div className="card-info"><strong>{item.name}</strong><small>{item.sub}</small></div>
          </button>)}</div>
          {shown.length===0&&<div className="empty-results">No hay modelos que coincidan con tu búsqueda. <button onClick={()=>{setQuery('');setCategory('Todos');}}>Ver todos</button></div>}
        </section>
        <footer className="footer"><span><Brain size={15}/> NeuroAtlas 3D · Laboratorio visual de neuroanatomía</span><span>Los modelos son esquemáticos y no sustituyen atlas anatómicos validados.</span></footer>
      </div>
    </main>
    <input ref={fileInput} type="file" accept=".glb,model/gltf-binary" hidden onChange={importFile}/>
    {guide&&<div className="modal-backdrop" role="presentation" onClick={()=>setGuide(false)}><div className="guide-modal" role="dialog" aria-modal="true" aria-labelledby="guide-title" onClick={e=>e.stopPropagation()}>
      <button className="modal-close" onClick={()=>setGuide(false)} aria-label="Cerrar guía"><X size={19}/></button>
      <div className="modal-icon"><Move3D size={26}/></div><span className="eyebrow">GUÍA RÁPIDA</span><h2 id="guide-title">Explora en tres dimensiones.</h2><p>Mueve el cerebro como si estuviera frente a ti.</p>
      <div className="guide-list"><div><MousePointer2/><span><strong>Girar</strong>Arrastra con el ratón o un dedo sobre el modelo.</span></div><div><Search/><span><strong>Acercar y alejar</strong>Usa la rueda del ratón o pellizca con dos dedos.</span></div><div><Tag/><span><strong>Descubrir estructuras</strong>Selecciona las etiquetas anatómicas para consultar su descripción.</span></div><div><Upload/><span><strong>Importar</strong>Abre archivos .glb de hasta 30 MB directamente en tu navegador.</span></div></div>
      <button className="primary-cta" onClick={()=>setGuide(false)}>Comenzar a explorar <ChevronRight size={17}/></button>
    </div></div>}
  </div>;
}
export default App;

