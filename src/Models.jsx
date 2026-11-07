import React,{useMemo,useEffect,useState} from 'react';
import * as THREE from 'three';
import {Canvas,useThree} from '@react-three/fiber';
import {OrbitControls,Html,Float} from '@react-three/drei';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';

const COLORS={frontal:'#eaa78d',parietal:'#8bbdcb',temporal:'#e4bc78',occipital:'#ad9bce'};
const cortex='#e1b9a6';
function region(y,z){if(z>0.45)return 'frontal';if(z<-0.7)return 'occipital';if(y<-.23)return 'temporal';return 'parietal';}

function makeHemisphere(side,segmented){
  const g=new THREE.SphereGeometry(1,112,80),p=g.attributes.position,cols=[],color=new THREE.Color();
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
    const ridges=1+0.035*Math.sin(z*26+y*17)*Math.cos(x*19-z*7)+0.019*Math.sin(y*38-z*18)+0.01*Math.cos(x*42+y*15);
    const px=side*.735+x*.69*ridges*(1-.07*Math.max(0,-z));
    const py=.08+y*.93*ridges;
    const pz=z*1.27*ridges;
    p.setXYZ(i,px,py,pz);
    color.set(segmented?COLORS[region(py,pz)]:cortex);
    const shade=.91+.11*Math.sin(x*34+z*13)*Math.cos(y*29);
    cols.push(color.r*shade,color.g*shade,color.b*shade);
  }
  g.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));g.computeVertexNormals();return g;
}
function Hemisphere({side,segmented,transparent=false,onSelect}){
  const geo=useMemo(()=>makeHemisphere(side,segmented),[side,segmented]);
  useEffect(()=>()=>geo.dispose(),[geo]);
  return <mesh geometry={geo} onClick={e=>{e.stopPropagation();onSelect(region(e.point.y,e.point.z));}} castShadow>
    <meshStandardMaterial vertexColors roughness={.87} metalness={.01} opacity={transparent ? 0.15 : 1} transparent={transparent} side={THREE.DoubleSide}/>
  </mesh>;
}
function Tube({points,color='#e6aa96',radius=.04}){
  const path=JSON.stringify(points);
  const geo=useMemo(()=>new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),Math.max(24,points.length*10),radius,7,false),[path,radius]);
  useEffect(()=>()=>geo.dispose(),[geo]);
  return <mesh geometry={geo}><meshStandardMaterial color={color} roughness={.7}/></mesh>;
}
function Ellipsoid({at,scale,color,roughness=.8}){
  return <mesh position={at} scale={scale} castShadow><sphereGeometry args={[1,40,32]}/><meshStandardMaterial color={color} roughness={roughness}/></mesh>;
}
function Pin({at,label,active,onClick}){
  return <Html position={at} center distanceFactor={7} zIndexRange={[30,0]}>
    <button type="button" className={'anatomy-pin'+(active?' active':'')} onClick={onClick}><i/>{label}</button>
  </Html>;
}
function Brain({model,selected,onSelect,labels}){
  const medial=model==='sagittal',segmented=model==='lobes';
  return <group>
    <Hemisphere side={-1} segmented={segmented} transparent={medial} onSelect={onSelect}/>
    {!medial&&<Hemisphere side={1} segmented={segmented} onSelect={onSelect}/>}
    <Ellipsoid at={[0,-.84,-.28]} scale={[.25,.59,.32]} color="#bda7a5"/>
    <Ellipsoid at={[0,-.82,-.92]} scale={[.66,.39,.47]} color={segmented?'#7fafbd':'#bf9392'}/>
    {medial&&<>
      <Tube points={[[.02,.30,-.79],[.03,.53,-.47],[.02,.58,.02],[.02,.46,.53],[.01,.16,.84]]} radius={.11} color="#efd5b7"/>
      <Ellipsoid at={[0,.01,.05]} scale={[.26,.25,.32]} color="#8ccac1"/>
      <Ellipsoid at={[0,-.38,.23]} scale={[.17,.26,.17]} color="#eba38b"/>
      <Tube points={[[0,-.21,-.26],[0,-.43,-.51],[0,-.53,-.22],[0,-.41,.09]]} radius={.077} color="#e1bb79"/>
    </>}
    {labels&&(medial?<>
      <Pin at={[.05,.73,.34]} label="Cuerpo calloso" active={selected==='callosum'} onClick={()=>onSelect('callosum')}/>
      <Pin at={[.13,.0,.24]} label="Tálamo" active={selected==='thalamus'} onClick={()=>onSelect('thalamus')}/>
      <Pin at={[.12,-.60,-.35]} label="Hipocampo" active={selected==='hippocampus'} onClick={()=>onSelect('hippocampus')}/>
    </>:<>
      <Pin at={[1.25,.55,1.02]} label="Frontal" active={selected==='frontal'} onClick={()=>onSelect('frontal')}/>
      <Pin at={[-1.32,.93,-.04]} label="Parietal" active={selected==='parietal'} onClick={()=>onSelect('parietal')}/>
      <Pin at={[1.38,-.49,.10]} label="Temporal" active={selected==='temporal'} onClick={()=>onSelect('temporal')}/>
      <Pin at={[-1.06,.30,-1.09]} label="Occipital" active={selected==='occipital'} onClick={()=>onSelect('occipital')}/>
    </>)}
  </group>;
}
const DENDRITES=[
  [[-.45,0,0],[-1,.46,.1],[-1.6,.76,.29],[-1.95,.95,.4]],
  [[-1,.46,.1],[-1.26,.99,-.2],[-1.58,1.2,-.28]],
  [[-.45,0,0],[-1.08,-.53,.09],[-1.45,-.85,.35],[-1.81,-.94,.5]],
  [[-1.08,-.53,.09],[-1.42,-.46,-.35],[-1.76,-.7,-.56]],
  [[-.48,0,0],[-1.09,.07,.65],[-1.52,-.19,.89]],
  [[-.48,0,0],[-.96,.27,-.65],[-1.37,.47,-.89]]
];
function Neuron({labels,selected,onSelect}){
  return <group scale={.88} position={[-.25,0,0]}>
    <Ellipsoid at={[-.42,.02,0]} scale={[.55,.48,.42]} color="#eaaa95" roughness={.55}/>
    <Ellipsoid at={[-.43,.06,.38]} scale={[.18,.19,.075]} color="#a9799b"/>
    {DENDRITES.map((p,i)=><Tube key={i} points={p} radius={.058-i*.004} color="#d99188"/>)}
    <Tube points={[[0,.02,0],[.65,.03,.02],[1.28,-.03,0],[1.95,.05,0],[2.45,-.08,0]]} radius={.075} color="#e6ad9b"/>
    {[.59,1.16,1.72,2.24].map((x,i)=><Ellipsoid key={i} at={[x,.02,0]} scale={[.25,.15,.16]} color="#8bc5bd" roughness={.4}/>)}
    {[[[2.35,-.08,0],[2.66,.30,0],[2.96,.46,.28]],[[2.35,-.08,0],[2.68,-.30,0],[3,-.49,.2]],[[2.35,-.08,0],[2.76,-.12,-.42],[3.04,-.13,-.59]]].map((p,i)=><Tube key={i} points={p} radius={.034} color="#dd8d88"/>)}
    {labels&&<>
      <Pin at={[-1.6,1.12,.3]} label="Dendritas" active={selected==='dendrites'} onClick={()=>onSelect('dendrites')}/>
      <Pin at={[-.55,-.56,.3]} label="Soma" active={selected==='soma'} onClick={()=>onSelect('soma')}/>
      <Pin at={[1.32,.34,.15]} label="Axón" active={selected==='axon'} onClick={()=>onSelect('axon')}/>
    </>}
  </group>;
}
function Cerebellum({labels,selected,onSelect}){
  const stripes=[];
  for(const side of [-1,1]) for(let i=0;i<14;i++){
    const y=-.83+i*.13,z=Math.sqrt(Math.max(0,1-y*y));
    const p=Array.from({length:20},(_,j)=>{const t=-Math.PI*.8+j/19*Math.PI*1.6;return [side*.70+.80*Math.cos(t)*z,y*.69,Math.sin(t)*.78*z+.02];});
    stripes.push(<Tube key={side+'-'+i} points={p} radius={.012} color="#b97e80"/>);
  }
  return <group><Ellipsoid at={[-.70,0,0]} scale={[.85,.69,.82]} color="#eac2aa"/>
    <Ellipsoid at={[.70,0,0]} scale={[.85,.69,.82]} color="#dcae9d"/>
    {stripes}<Ellipsoid at={[0,-.78,-.1]} scale={[.23,.57,.31]} color="#93b7b3"/>
    {labels&&<Pin at={[1.2,.62,.65]} label="Hemisferios" active={selected==='cerebellum'} onClick={()=>onSelect('cerebellum')}/>}
  </group>;
}
function Dna({labels,selected,onSelect}){
  const a=Array.from({length:70},(_,i)=>{const t=i/69*Math.PI*5;return [Math.cos(t)*.63,(i/69-.5)*3.3,Math.sin(t)*.63];});
  const b=a.map(([x,y,z])=>[-x,y,-z]);
  return <group rotation={[0,0,-.17]}>
    <Tube points={a} radius={.060} color="#eaa18c"/>
    <Tube points={b} radius={.060} color="#85c1c3"/>
    {Array.from({length:23},(_,i)=>{const t=i/22*Math.PI*5,y=(i/22-.5)*3.3,x=Math.cos(t)*.63,z=Math.sin(t)*.63;
      return <Tube key={i} points={[[x,y,z],[0,y,0],[-x,y,-z]]} radius={.032} color={i%2?'#ddc17e':'#b9a6d7'}/>;})}
    {labels&&<Pin at={[.8,.72,.5]} label="Doble hélice" active={selected==='dna'} onClick={()=>onSelect('dna')}/>}
  </group>;
}
function Imported({url,onError}){
  const [object,setObject]=useState(null);
  useEffect(()=>{
    let alive=true;
    new GLTFLoader().load(url,gltf=>{
      if(!alive)return;
      const scene=gltf.scene,box=new THREE.Box3().setFromObject(scene),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
      scene.position.sub(center);
      const group=new THREE.Group();group.add(scene);group.scale.setScalar(3/(Math.max(size.x,size.y,size.z)||1));
      setObject(group);
    },undefined,()=>{if(alive)onError('El archivo no se pudo cargar. Selecciona un GLB válido.');});
    return ()=>{alive=false;};
  },[url,onError]);
  return object&&<primitive object={object}/>;
}
function CameraReset({reset}){
  const {camera,controls}=useThree();
  useEffect(()=>{camera.position.set(2.5,1.35,5.25);camera.lookAt(0,0,0);if(controls){controls.target.set(0,0,0);controls.update();}},[reset,camera,controls]);
  return null;
}
export default function Viewer3D({model,selected,onSelect,labels,rotate,reset,uploaded,onError}){
  return <Canvas dpr={[1,1.75]} camera={{position:[2.5,1.35,5.25],fov:39,near:.1,far:100}}
    gl={{alpha:true,antialias:true,preserveDrawingBuffer:true}} fallback={<p>WebGL no está disponible en este dispositivo.</p>}>
    <ambientLight intensity={1.7}/>
    <hemisphereLight args={['#f8fcff','#364957',1.4]}/>
    <directionalLight position={[5,6,5]} intensity={2.4} color="#fff3e7"/>
    <directionalLight position={[-5,3,-4]} intensity={1.1} color="#91cada"/>
    <Float speed={1} floatIntensity={.12} rotationIntensity={.035}>
      {uploaded?.url?<Imported url={uploaded.url} onError={onError}/>:
      model==='neuron'?<Neuron labels={labels} selected={selected} onSelect={onSelect}/>:
      model==='cerebellum'?<Cerebellum labels={labels} selected={selected} onSelect={onSelect}/>:
      model==='dna'?<Dna labels={labels} selected={selected} onSelect={onSelect}/>:
      <Brain model={model} selected={selected} onSelect={onSelect} labels={labels}/>}
    </Float>
    <OrbitControls makeDefault enablePan={false} enableDamping dampingFactor={.08} minDistance={2.5} maxDistance={12} autoRotate={rotate} autoRotateSpeed={.7}/>
    <CameraReset reset={reset}/>
  </Canvas>;
}

