import React,{useEffect,useMemo,useState} from 'react';
import {Canvas,useThree} from '@react-three/fiber';
import {OrbitControls,useGLTF} from '@react-three/drei';
import * as THREE from 'three';
import {Bone,Info,Eye,EyeOff,RotateCcw,Play,Pause,Activity,ExternalLink,Target} from 'lucide-react';

const BASE=import.meta.env.BASE_URL+'spine/';
const LEVELS=[
  ...Array.from({length:8},(_,i)=>'C'+(i+1)),
  ...Array.from({length:12},(_,i)=>'T'+(i+1)),
  ...Array.from({length:5},(_,i)=>'L'+(i+1)),
  ...Array.from({length:5},(_,i)=>'S'+(i+1))
];
const GROUPS={
 C:{label:'Cervical',color:'#a6c9d5',description:'Conexiones cervicales para cuello, miembros superiores y, en segmentos altos, funciones respiratorias.'},
 T:{label:'Torácico',color:'#d7b592',description:'Interconexiones con musculatura del tronco y vías sensitivo-motoras; circuitos autonómicos torácicos.'},
 L:{label:'Lumbar',color:'#baa4d5',description:'Contribución a circuitos motores y sensitivos de miembros inferiores.'},
 S:{label:'Sacro',color:'#a7c3a5',description:'Región lumbosacra distal, con conexiones relacionadas con miembros inferiores, pelvis y funciones esfinterianas.'}
};
function levelInfo(level){
 const group=GROUPS[level?.[0]]||GROUPS.C;
 let relevance=group.description;
 if(['C3','C4','C5'].includes(level))relevance+=' Las motoneuronas del nervio frénico se asocian ampliamente con segmentos C3–C5.';
 if(['S2','S3','S4'].includes(level))relevance+=' S2–S4 contribuye al control parasimpático y somático de esfínteres y suelo pélvico.';
 return {...group,relevance};
}
function CameraReset({reset}){
 const {camera,controls,invalidate}=useThree();
 useEffect(()=>{
  camera.position.set(2.9,1.2,6.5);camera.lookAt(0,0,0);
  if(controls){controls.target.set(0,0,0);controls.update();}
  invalidate();
 },[camera,controls,invalidate,reset]);
 return null;
}
function SpinalMesh({onPick,selected,isolated,wireframe,showLabels}){
 const gltf=useGLTF(BASE+'hra-male-spinal-cord.glb');
 const {meshes,center,scale}=useMemo(()=>{
  // HRA source nodes are a sequence of 30 segment-specific anatomical meshes.
  const items=[];gltf.scene.traverse(o=>{if(o.isMesh)items.push(o)});
  if(items.length!==30)throw Error('El modelo HRA no contiene los 30 segmentos esperados.');
  const bounding=new THREE.Box3().setFromObject(gltf.scene);
  const sz=bounding.getSize(new THREE.Vector3());
  const origin=bounding.getCenter(new THREE.Vector3());
  return {meshes:items,center:origin,scale:3.7/Math.max(sz.y,.001)};
 },[gltf.scene]);
 const picked=LEVELS.indexOf(selected);
 const groupCenter=useMemo(()=>{
   if(!isolated||picked<0||!meshes[picked])return {target:new THREE.Vector3(),multiplier:1};
   const bounds=new THREE.Box3().setFromObject(meshes[picked]);
   const size=bounds.getSize(new THREE.Vector3());
   return {target:bounds.getCenter(new THREE.Vector3()),multiplier:Math.min(2.25,1.2/Math.max(.002,size.y*scale))};
 },[meshes,picked,isolated,scale]);
 return <group>
  {meshes.map((node,i)=>{
   const id=LEVELS[i],cat=GROUPS[id[0]],yes=id===selected;
   if(isolated&&!yes)return null;
   const col=yes?'#f2d280':cat.color;
   const faded=!isolated&&selected&&!yes;
   const opacity=faded ? .42 : 1;
   const fact=scale*(isolated?groupCenter.multiplier:1);
   const origin=isolated?groupCenter.target:center;
   return <mesh key={id} geometry={node.geometry} position={[
      (node.position.x-origin.x)*fact,
      (node.position.y-origin.y)*fact,
      (node.position.z-origin.z)*fact
    ]} rotation={node.rotation} scale={[
      node.scale.x*fact,node.scale.y*fact,node.scale.z*fact
    ]}
    onClick={e=>{e.stopPropagation();onPick(id)}}>
    <meshStandardMaterial color={col} roughness={.83} metalness={0}
      emissive={yes?'#5f3f18':'#000000'} emissiveIntensity={yes ? .14 : 0}
      side={THREE.DoubleSide} transparent={faded} opacity={opacity} depthWrite={!faded}
      wireframe={wireframe}/>
   </mesh>;
  })}
 </group>;
}
export default function SpineViewer({selectedLevel='C4'}){
 const [selected,setSelected]=useState(selectedLevel);
 useEffect(()=>{if(LEVELS.includes(selectedLevel))setSelected(selectedLevel)},[selectedLevel]);
 const [isolate,setIsolate]=useState(false);
 const [wireframe,setWireframe]=useState(false);
 const [rotate,setRotate]=useState(false);
 const [reset,setReset]=useState(0);
 const [error,setError]=useState('');
 const groups=Object.entries(GROUPS);
 const info=levelInfo(selected);
 return <section className="spine-lesson">
  <div className="mode-explanation"><span className="evidence-icon"><Bone size={18}/></span><div>
   <strong>Médula espinal 3D: 30 segmentos anatómicos de referencia</strong>
   <p>Modelo de referencia producido por HuBMAP a partir de imágenes del Visible Human Male. Representa C1–C8, T1–T12, L1–L5 y S1–S5 con mallas independientes de anatomía de referencia.</p>
  </div></div>
  <div className="spine-workspace">
   <div className="spine-left">
    <div className="deep-toolbar"><span className="control-label">VISUALIZACIÓN</span><div className="deep-controls">
     <button onClick={()=>setIsolate(s=>!s)} aria-pressed={isolate}><Target size={16}/>{isolate?'Volver al conjunto':'Aislar segmento'}</button>
     <button onClick={()=>setWireframe(s=>!s)} aria-pressed={wireframe}>{wireframe?<EyeOff size={16}/>:<Eye size={16}/>} {wireframe?'Superficie':'Malla'}</button>
     <button onClick={()=>setRotate(s=>!s)} aria-pressed={rotate}>{rotate?<Pause size={16}/>:<Play size={16}/>}</button>
     <button onClick={()=>setReset(n=>n+1)} aria-label="Restablecer cámara"><RotateCcw size={16}/></button>
    </div></div>
    <div className="spine-canvas">
     <Canvas camera={{fov:42,near:.02,far:100,position:[2.9,1.2,6.5]}}
       frameloop={rotate?'always':'demand'} dpr={[1,1.5]} gl={{alpha:true,antialias:true,powerPreference:'low-power'}}>
       <ambientLight intensity={.8}/><hemisphereLight args={['#f4f9ff','#597587',1.0]}/>
       <directionalLight position={[3,6,5]} intensity={1.5}/><directionalLight position={[-3,-2,1]} intensity={.5}/>
       <React.Suspense fallback={null}>
         <SpinalMesh selected={selected} onPick={setSelected} isolated={isolate} wireframe={wireframe}/>
       </React.Suspense>
       <OrbitControls makeDefault enableDamping dampingFactor={.08} minDistance={2} maxDistance={11} enableZoom enablePan
         autoRotate={rotate} autoRotateSpeed={.55}/>
       <CameraReset reset={reset}/>
     </Canvas>
     <div className="spine-canvas-instruction">Selecciona un segmento directamente sobre el modelo · Desliza para rotar</div>
    </div>
    <div className="spine-segment-index">
     {groups.map(([code,cat])=><div key={code}><strong>{cat.label}</strong><div>{LEVELS.filter(n=>n[0]===code).map(level=><button key={level}
       onClick={()=>{setSelected(level);setIsolate(false);}} className={selected===level?'active':''} aria-pressed={selected===level}>{level}</button>)}</div></div>)}
    </div>
   </div>
   <aside className="spine-right">
    <span className="section-kicker">SEGMENTO ESPINAL</span>
    <h3>{selected}</h3><p className="spine-subtitle">Región {info.label.toLowerCase()}</p>
    <div className="clinical-subheading"><Activity size={16}/> Función y correlación neurológica</div><p>{info.relevance}</p>
    <div className="clinical-subheading"><Info size={16}/> Consideraciones clínicas</div><p>Las lesiones medulares pueden producir déficits motores, sensitivos y autonómicos, pero el patrón depende de la altura, extensión y mecanismo. El segmento anatómico medular no coincide necesariamente con el nivel vertebral del mismo nombre.</p>
    <div className="clinical-subheading"><Bone size={16}/> Procedencia del modelo</div>
    <p>Segmentación del Human Reference Atlas a partir de datos del Visible Human Male. Son 30 piezas anatómicas, no un modelo de raíces periféricas, columnas vertebrales ni tractos internos.</p>
    <a className="spine-source" href="https://humanatlas.io/3d-reference-library" target="_blank" rel="noopener noreferrer">Human Reference Atlas · CC BY 4.0 <ExternalLink size={15}/></a>
    <a className="spine-source" href="https://spinalcordtoolbox.com/6.1/overview/concepts/pam50.html" target="_blank" rel="noopener noreferrer">PAM50 · Atlas para futuras capas de sustancia gris y blanca <ExternalLink size={15}/></a>
    {error&&<div className="error-banner" role="alert">{error}</div>}
   </aside>
  </div>
  <div className="method-alert"><Info size={16}/> El modelo representa médula espinal segmentada a partir de anatomía de referencia. La representación de raíces, nervios periféricos y tractos internos requiere modelos adicionales; no se simulan mediante geometría inventada.</div>
 </section>;
}
export {LEVELS};

