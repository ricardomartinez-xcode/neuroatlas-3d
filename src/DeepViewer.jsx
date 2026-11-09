import React,{useEffect,useMemo,useRef,useState,useCallback} from 'react';
import {Canvas,useThree} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import * as THREE from 'three';
import {RotateCcw,Play,Pause,Layers3,MousePointer2,Info,Eye,EyeOff} from 'lucide-react';

const BASE=import.meta.env.BASE_URL+'volume/';
const CACHE=new Map();
export function parseVolumeMesh(bytes){
 const v=new DataView(bytes);
 if(String.fromCharCode(...new Uint8Array(bytes,0,4))!=='NAVM')throw Error('Archivo 3D inválido');
 const n=v.getUint32(4,true),f=v.getUint32(8,true);
 if(n<10||n>150000||f>300000||bytes.byteLength!==12+n*12+f*12)throw Error('Geometría fuera de especificación');
 const xyz=new Float32Array(bytes.slice(12,12+n*12));
 const triangles=new Uint32Array(bytes.slice(12+n*12));
 const geo=new THREE.BufferGeometry();
 geo.setAttribute('position',new THREE.BufferAttribute(xyz,3));
 geo.setIndex(new THREE.BufferAttribute(triangles,1));
 geo.computeVertexNormals();
 return geo;
}
function requestMesh(file){
 if(!CACHE.has(file))CACHE.set(file,fetch(BASE+file).then(r=>{if(!r.ok)throw Error('No se pudo descargar '+file);return r.arrayBuffer()}).then(parseVolumeMesh).catch(e=>{CACHE.delete(file);throw e}));
 return CACHE.get(file);
}
function Substructure({region,isSelected,dimmed,onSelect,opacity}){
 const [geometry,setGeometry]=useState(null);
 useEffect(()=>{
  let mounted=true;
  requestMesh(region.file).then(mesh=>{if(mounted)setGeometry(mesh);}).catch(console.error);
  return()=>{mounted=false;};
 },[region.file]);
 if(!geometry)return null;
 return <mesh geometry={geometry} renderOrder={isSelected?3:0}
    onClick={e=>{e.stopPropagation();onSelect(region.id)}}
    onPointerOver={e=>{e.stopPropagation();document.body.style.cursor='pointer'}}
    onPointerOut={()=>{document.body.style.cursor='auto'}}>
     <meshStandardMaterial color={region.color} roughness={0.68} metalness={.08} side={THREE.DoubleSide}
       transparent opacity={dimmed ? .15 : opacity} depthWrite={!dimmed}
       emissive={isSelected?region.color:'#000000'} emissiveIntensity={isSelected ? .21 : 0}/>
 </mesh>;
}
function Rig({reset}){
 const {camera,controls}=useThree();
 useEffect(()=>{
  camera.position.set(3.0,1.85,4.1);camera.lookAt(0,0,0);
  if(controls){controls.target.set(0,0,0);controls.update();}
 },[camera,controls,reset]);
 return null;
}
export function DeepViewer({selected,onSelect}){
 const [manifest,setManifest]=useState(null);
 const [error,setError]=useState('');
 const [focus,setFocus]=useState('all');
 const [isolate,setIsolate]=useState(false);
 const [spin,setSpin]=useState(false);
 const [opacity,setOpacity]=useState(95);
 const [reset,setReset]=useState(0);
 useEffect(()=>{
   const controller=new AbortController();
   fetch(BASE+'manifest.json',{signal:controller.signal}).then(r=>{if(!r.ok)throw Error('No se pudo cargar la segmentación MNI');return r.json()})
     .then(setManifest).catch(e=>{if(e.name!=='AbortError')setError(e.message)});
   return()=>controller.abort();
 },[]);
 const groups=useMemo(()=>manifest?.structures||[],[manifest]);
 const types=useMemo(()=>Array.from(new Set(groups.map(s=>s.category))),[groups]);
 const chosen=groups.find(s=>s.id===selected)||groups.find(s=>s.id==='hippocampus-left');
 const shown=groups.filter(s=>focus==='all'||s.category===focus);
 return <section className="deep-lesson">
   <div className="mode-explanation"><span className="evidence-icon"><Layers3 size={18}/></span><div><strong>Segmentación anatómica 3D · MNI152</strong>
     <p>17 superficies derivadas de etiquetas volumétricas FreeSurfer aseg en una plantilla anatómica de referencia a 1 mm. Cada estructura puede identificarse y aislarse.</p></div></div>
   <div className="deep-split">
      <div className="deep-left">
       <div className="deep-toolbar"><label>Estructuras <select aria-label="Filtrar estructura cerebral" value={focus} onChange={e=>setFocus(e.target.value)}>
        <option value="all">Todas ({groups.length})</option>{types.map(t=><option key={t} value={t}>{({hipocampo:'Hipocampo',amigdala:'Amígdala',talamo:'Tálamo',caudado:'Caudado',putamen:'Putamen',palido:'Globo pálido',tronco:'Tronco encefálico',cerebelo:'Cerebelo',calloso:'Cuerpo calloso',ventriculos:'Ventrículos'})[t]||t}</option>)}
        </select></label><div className="deep-controls">
        <button onClick={()=>setIsolate(s=>!s)} aria-pressed={isolate} title="Aislar estructura seleccionada">{isolate?<EyeOff size={16}/>:<Eye size={16}/>} {isolate?'Mostrar otras':'Aislar'}</button>
        <button onClick={()=>setSpin(s=>!s)} aria-pressed={spin} title="Girar automáticamente">{spin?<Pause size={16}/>:<Play size={16}/>}</button>
        <button onClick={()=>setReset(x=>x+1)} aria-label="Restablecer vista"><RotateCcw size={16}/></button>
       </div></div>
       <div className="deep-canvas">
        {groups.length?<Canvas camera={{fov:43,position:[3,2,4.1],near:.01,far:50}} dpr={[1,1.5]} frameloop={spin?'always':'demand'} gl={{antialias:true,alpha:true,powerPreference:'low-power'}}>
         <ambientLight intensity={1.9}/><hemisphereLight args={['#eaf4fe','#8893a5',1.45]}/><directionalLight position={[4,5,3]} intensity={2.4}/>
         <directionalLight position={[-4,1,-2]} intensity={1.0}/>
         {shown.filter(s=>!isolate||s.id===chosen?.id).map(s=><Substructure key={s.id} region={s}
           isSelected={chosen?.id===s.id} dimmed={chosen&&s.id!==chosen.id&&!isolate} opacity={opacity/100} onSelect={onSelect}/>)}
         <OrbitControls makeDefault enableDamping enableZoom minDistance={1.05} maxDistance={12} autoRotate={spin} autoRotateSpeed={.8}/>
         <Rig reset={reset}/>
        </Canvas>:<div className="deep-loading">Cargando estructuras anatómicas…</div>}
        <div className="deep-canvas-caption"><MousePointer2 size={15}/> Desliza para rotar · pellizca para acercar · toca para identificar</div>
       </div>
       <div className="deep-opacity"><span>Visibilidad</span><input aria-label="Opacidad de estructuras" type="range" min="35" max="100" value={opacity} onChange={e=>setOpacity(+e.target.value)}/><strong>{opacity}%</strong></div>
      </div>
      <aside className="deep-detail">
       <div className="deep-detail-kicker">ESTRUCTURA NEUROANATÓMICA</div>
       {chosen?<><div className="structure-swatch" style={{background:chosen.color}}/><h3>{chosen.name}</h3><p className="deep-original">{chosen.category.toUpperCase()} · MNI152NLin2009cAsym</p>
         <hr/><div className="field-kicker">CORRELATOS NEUROPSICOLÓGICOS</div><p>{chosen.role}.</p>
         <div className="deep-value-row"><span>Etiquetas aseg</span><strong>{chosen.labels.join(', ')}</strong></div>
         <div className="deep-value-row"><span>Vértices</span><strong>{chosen.vertices.toLocaleString('es-MX')}</strong></div>
         <div className="deep-value-row"><span>Resolución de segmentación</span><strong>1 mm</strong></div>
         <div className="deep-neutral-note"><Info size={15}/><span>Las formas derivan de la segmentación anatómica de una plantilla promedio. No son reconstrucciones de un paciente, ni definen funciones aisladas.</span></div>
       </>:<p>Selecciona una estructura del visor.</p>}
       {error&&<div role="alert" className="error-banner">{error}</div>}
       <div className="deep-source-note">TemplateFlow · aseg dseg · geometría derivada por isosuperficie</div>
      </aside>
   </div>
   <div className="deep-index" aria-label="Seleccionar estructura 3D">{groups.map(s=><button key={s.id} className={chosen?.id===s.id?'active':''} onClick={()=>{onSelect(s.id);setFocus('all')}}><span style={{background:s.color}}/>{s.name}</button>)}</div>
   <div className="method-alert"><Info size={16}/> La geometría MNI152 de estas estructuras y la superficie cortical fsaverage5 provienen de espacios de referencia distintos. No deben interpretarse como una superposición registrada del mismo individuo.</div>
 </section>;
}

