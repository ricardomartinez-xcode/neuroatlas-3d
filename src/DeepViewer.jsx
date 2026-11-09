import React,{useEffect,useMemo,useState} from 'react';
import {Canvas,useThree} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import * as THREE from 'three';
import {RotateCcw,Play,Pause,Layers3,MousePointer2,Info,Eye,EyeOff,Focus} from 'lucide-react';

// Source: TemplateFlow MNI152NLin2009cAsym aseg labels, in the same MNI RAS
// reference frame as the supporting cortical context and MRI planes.
const BASE=import.meta.env.BASE_URL+'volume/';
const CACHE=new Map();
export function parseVolumeMesh(buffer){
 const v=new DataView(buffer);
 if(String.fromCharCode(...new Uint8Array(buffer,0,4))!=='NAVM')throw Error('Formato 3D inválido');
 const n=v.getUint32(4,true),f=v.getUint32(8,true);
 if(n<10||n>200000||f>400000||buffer.byteLength!==12+n*12+f*12)throw Error('Geometría fuera de especificación');
 const xyz=new Float32Array(buffer.slice(12,12+n*12));
 const faces=new Uint32Array(buffer.slice(12+n*12));
 if(xyz.some(x=>!Number.isFinite(x)))throw Error('Coordenadas MNI inválidas');
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.BufferAttribute(xyz,3));
 geometry.setIndex(new THREE.BufferAttribute(faces,1));
 geometry.computeVertexNormals();geometry.computeBoundingSphere();
 return geometry;
}
function requestMesh(file){
 if(!CACHE.has(file))CACHE.set(file,fetch(BASE+file).then(r=>{
  if(!r.ok)throw Error('No se encontró la estructura '+file);
  return r.arrayBuffer();
 }).then(parseVolumeMesh).catch(e=>{CACHE.delete(file);throw e}));
 return CACHE.get(file);
}
function Structure({region,chosen,onSelect,isolated,groupOpacity}){
 const [geometry,setGeometry]=useState(null);
 useEffect(()=>{
  let live=true;
  requestMesh(region.file).then(g=>{if(live)setGeometry(g)}).catch(console.error);
  return()=>{live=false};
 },[region.file]);
 const transform=useMemo(()=>{
  if(!geometry||!isolated)return {scale:1,position:[0,0,0]};
  const s=geometry.boundingSphere,fac=.95/Math.max(.05,s.radius);
  return {scale:fac,position:[-s.center.x*fac,-s.center.y*fac,-s.center.z*fac]};
 },[geometry,isolated]);
 if(!geometry)return null;
 const opacity=isolated?1:chosen?1:groupOpacity;
 return <mesh geometry={geometry} position={transform.position} scale={transform.scale}
   onClick={e=>{e.stopPropagation();onSelect(region.id)}}
   onPointerOver={e=>{e.stopPropagation();document.body.style.cursor='pointer'}}
   onPointerOut={()=>{document.body.style.cursor='auto'}}>
   <meshStandardMaterial color={region.color} roughness={.92} metalness={0}
      transparent={opacity<1} opacity={opacity} depthWrite={opacity>=1}
      side={THREE.DoubleSide} emissive={chosen?'#372819':'#000000'} emissiveIntensity={chosen ? .18 : 0}/>
 </mesh>;
}
function CorticalContext({file,hemi}){
 const [geometry,setGeometry]=useState(null);
 useEffect(()=>{
  let live=true;
  requestMesh(file).then(g=>{if(live)setGeometry(g)}).catch(console.error);
  return()=>{live=false};
 },[file]);
 if(!geometry)return null;
 return <mesh geometry={geometry} renderOrder={3}>
   <meshStandardMaterial color={hemi==='left'?'#bdc5c1':'#b5c5c6'}
      roughness={1} side={THREE.DoubleSide} transparent opacity={.16}
      depthWrite={false} metalness={0}/>
 </mesh>;
}
function Rig({reset,isolated}){
 const {camera,controls,size,invalidate}=useThree();
 useEffect(()=>{
  const aspect=size.width/Math.max(1,size.height);
  const dist=isolated?2.65:(aspect<.9?4.1:3.45);
  camera.position.set(dist*.73,dist*.42,dist*.72);
  camera.lookAt(0,0,0);
  if(controls){controls.target.set(0,0,0);controls.update();}
  camera.updateProjectionMatrix();invalidate();
 },[camera,controls,size.width,size.height,isolated,reset,invalidate]);
 return null;
}
export function DeepViewer({selected,onSelect}){
 const [manifest,setManifest]=useState(null),[error,setError]=useState('');
 const [focus,setFocus]=useState('talamo');
 const [isolated,setIsolated]=useState(false);
 const [showContext,setShowContext]=useState(true);
 const [spin,setSpin]=useState(false);
 const [opacity,setOpacity]=useState(100);
 const [reset,setReset]=useState(0);
 useEffect(()=>{
  const c=new AbortController();
  fetch(BASE+'manifest.json',{signal:c.signal}).then(r=>{
   if(!r.ok)throw Error('No se pudo cargar el atlas MNI152');
   return r.json();
  }).then(setManifest).catch(e=>{if(e.name!=='AbortError')setError(e.message)});
  return()=>c.abort();
 },[]);
 const groups=useMemo(()=>manifest?.structures||[],[manifest]);
 useEffect(()=>{if(groups.length&&focus!=='all'&&selected){const r=groups.find(x=>x.id===selected);if(r&&r.category!==focus)setFocus(r.category);}},[groups,selected]);
 const types=useMemo(()=>Array.from(new Set(groups.map(x=>x.category))),[groups]);
 const chosen=groups.find(s=>s.id===selected)||groups.find(s=>s.category===focus)||groups[0];
 const visible=isolated?groups.filter(s=>s.id===chosen?.id):groups.filter(s=>focus==='all'||s.category===focus);
 const changeGroup=cat=>{
  setFocus(cat);setIsolated(false);
  const first=groups.find(s=>cat==='all'||s.category===cat);
  if(first)onSelect(first.id);
 };
 const changeSelection=id=>{
  onSelect(id);
  const item=groups.find(s=>s.id===id);
  if(item)setFocus(item.category);
 };
 return <section className="deep-lesson">
  <div className="mode-explanation"><span className="evidence-icon"><Layers3 size={18}/></span>
   <div><strong>Anatomía profunda segmentada · referencia MNI152</strong>
    <p>Modelos extraídos de una segmentación anatómica de 1 mm. Utiliza la vista contextual para localizar cada estructura o la vista aislada para examinar su morfología.</p>
   </div>
  </div>
  <div className="deep-split">
   <div className="deep-left">
    <div className="deep-toolbar"><label>ESTRUCTURA <select aria-label="Filtrar estructura cerebral" value={focus} onChange={e=>changeGroup(e.target.value)}>
     <option value="all">Todas las estructuras</option>
     {types.map(t=><option key={t} value={t}>{({hipocampo:'Hipocampo',amigdala:'Amígdala',talamo:'Tálamo',caudado:'Núcleo caudado',putamen:'Putamen',palido:'Globo pálido',tronco:'Tronco encefálico',cerebelo:'Cerebelo',calloso:'Cuerpo calloso',ventriculos:'Ventrículos'})[t]||t}</option>)}
    </select></label>
    <div className="deep-controls">
     <button onClick={()=>{setIsolated(x=>!x);setReset(n=>n+1)}} aria-pressed={isolated} title={isolated?'Volver a posición real':'Ampliar estructura para inspeccionarla'}><Focus size={16}/>{isolated?'En posición':'Examinar aislada'}</button>
     <button onClick={()=>setShowContext(x=>!x)} aria-pressed={showContext} title="Mostrar u ocultar la silueta cortical MNI" disabled={isolated}>{showContext?<Eye size={16}/>:<EyeOff size={16}/>} Corteza</button>
     <button onClick={()=>setSpin(x=>!x)} aria-pressed={spin} title="Rotación automática">{spin?<Pause size={16}/>:<Play size={16}/>}</button>
     <button onClick={()=>setReset(n=>n+1)} title="Restablecer encuadre"><RotateCcw size={16}/></button>
    </div></div>
    <div className="deep-canvas">
     {groups.length?<Canvas camera={{fov:42,position:[2.65,1.5,3.3],near:.02,far:100}} dpr={[1,1.5]}
       frameloop={spin?'always':'demand'} gl={{antialias:true,alpha:true,powerPreference:'low-power'}}>
       <ambientLight intensity={.72}/>
       <hemisphereLight args={['#f6faf9','#425d6a',.93]}/>
       <directionalLight position={[3,5,5]} intensity={1.65} color="#fff9ed"/>
       <directionalLight position={[-3,1,-4]} intensity={.42} color="#b3d6e6"/>
       {showContext&&!isolated&&(manifest?.contextSurfaces||[]).map(s=>
         <CorticalContext key={s.file} file={s.file} hemi={s.hemisphere}/>)}
       {visible.map(s=><Structure key={s.id} region={s} chosen={s.id===chosen?.id}
           isolated={isolated} groupOpacity={(opacity/100)*(focus==='all' ? .4 : .85)} onSelect={changeSelection}/>)}
       <OrbitControls makeDefault enableDamping dampingFactor={.09} enablePan
         minDistance={1.05} maxDistance={10} autoRotate={spin} autoRotateSpeed={.6}/>
       <Rig reset={reset} isolated={isolated}/>
     </Canvas>:<div className="deep-loading" role="status">Cargando anatomía de referencia…</div>}
     <div className="deep-canvas-caption"><MousePointer2 size={15}/> {isolated?'Pieza ampliada uniformemente (escala de visualización)':'Contexto cerebral y estructuras en coordenadas MNI'}</div>
    </div>
    <div className="deep-opacity"><span>Opacidad de las estructuras secundarias</span><input aria-label="Opacidad de estructuras" type="range" min="40" max="100" value={opacity} onChange={e=>setOpacity(+e.target.value)}/><strong>{opacity}%</strong></div>
   </div>
   <aside className="deep-detail">
    <div className="deep-detail-kicker">SEGMENTACIÓN ANATÓMICA VERIFICABLE</div>
    {chosen?<><div className="structure-swatch" style={{background:chosen.color}}/><h3>{chosen.name}</h3>
     <p className="deep-original">{chosen.category.toUpperCase()} · MNI152NLin2009cAsym</p>
     <hr/><div className="field-kicker">RELACIONES NEUROPSICOLÓGICAS</div><p>{chosen.role}.</p>
     <div className="deep-value-row"><span>Etiquetas aseg</span><strong>{chosen.labels.join(', ')}</strong></div>
     <div className="deep-value-row"><span>Vértices originales de superficie derivada</span><strong>{chosen.vertices.toLocaleString('es-MX')}</strong></div>
     <div className="deep-value-row"><span>Resolución de datos de segmentación</span><strong>1 mm</strong></div>
     <div className="deep-neutral-note"><Info size={15}/><span>La silueta gris corresponde a la corteza en el mismo espacio MNI. Su forma es una aproximación extraída del volumen; no una superficie pial individual. La ampliación aislada preserva la forma, pero no la escala respecto al cerebro.</span></div>
    </>:<p>Selecciona una estructura.</p>}
    {error&&<div className="error-banner" role="alert">{error}</div>}
    <div className="deep-source-note">MNI152NLin2009cAsym · FreeSurfer aseg · isosuperficies</div>
   </aside>
  </div>
  <div className="deep-index" aria-label="Seleccionar estructura 3D">
   {groups.map(s=><button key={s.id} className={chosen?.id===s.id?'active':''}
       onClick={()=>changeSelection(s.id)}><span style={{background:s.color}}/>{s.name}</button>)}
  </div>
  <div className="method-alert"><Info size={16}/> Las estructuras profundas y el contexto cortical comparten la misma plantilla MNI152. El atlas de superficie fsaverage6 se consulta por separado; no está registrado espacialmente con este volumen.</div>
 </section>;
}

