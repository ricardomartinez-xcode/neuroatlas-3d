import React,{useEffect,useMemo,useState,useCallback} from 'react';
import {Canvas,useThree} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import * as THREE from 'three';
import {LOBES} from './anatomy.js';

const CACHE=new Map();
const BASE=import.meta.env.BASE_URL+'atlas/';
export function parseSurface(buffer){
  const view=new DataView(buffer);
  if(String.fromCharCode(...new Uint8Array(buffer,0,4))!=='NATL')throw new Error('Formato de superficie no válido.');
  const count=view.getUint32(4,true),triangles=view.getUint32(8,true);
  if(count!==10242||triangles!==20480)throw new Error('Las dimensiones no coinciden con fsaverage5.');
  let start=12;
  const positions=new Float32Array(buffer.slice(start,start+count*12));start+=count*12;
  const faces=new Uint16Array(buffer.slice(start,start+triangles*6));start+=triangles*6;
  const ids=new Uint8Array(buffer.slice(start,start+count));start+=count;
  const sulc=new Float32Array(buffer.slice(start,start+count*4));
  if(positions.some(v=>!Number.isFinite(v)))throw new Error('Coordenadas de superficie no válidas.');
  return {positions,faces,ids,sulc};
}
function loadSurface(hemi,mode){
  const key=mode+'_'+hemi;
  if(!CACHE.has(key)){
    CACHE.set(key,fetch(BASE+key+'.bin').then(r=>{if(!r.ok)throw new Error('No se pudo descargar la superficie '+key);return r.arrayBuffer();}).then(parseSurface).catch(e=>{CACHE.delete(key);throw e;}));
  }
  return CACHE.get(key);
}
function modeColor(id,mode,regionMap){
  if(mode==='anatomy')return new THREE.Color('#d4b5a7');
  const region=regionMap.get(id);
  const lobe=LOBES[region?.lobe]||LOBES.other;
  if(mode==='lobes')return new THREE.Color(lobe.color);
  return new THREE.Color().setHSL(((id*0.61803398875)%1),.38,.64);
}
function makeGeometry(data,mode,regionMap,selected,side,focusIds,quiz){
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(data.positions,3));
  g.setIndex(new THREE.BufferAttribute(data.faces,1));
  const cs=new Float32Array(data.ids.length*3);
  const highlight=selected?.id>0&&selected?.hemi===side;
  const filter=focusIds?.length>0;
  const focusSet=new Set(focusIds);
  const palette=Array.from({length:76},(_,id)=>modeColor(id,mode,regionMap));
  const neutral=new THREE.Color('#78929d');
  const gold=new THREE.Color('#f7d27c');
  for(let i=0;i<data.ids.length;i++){
    const id=data.ids[i],col=palette[id]||neutral;
    const sulc=Math.max(-1,Math.min(1,data.sulc[i]));
    const brightness=.84+.13*(sulc+1)/2;
    const enabled=!filter||focusSet.has(id);
    const selectedHere=highlight&&selected.id===id;
    const c=selectedHere?gold:col.clone();
    if(!enabled)c.lerp(neutral,.78);
    if(quiz&&!enabled)c.lerp(neutral,.14);
    cs[i*3]=c.r*brightness;
    cs[i*3+1]=c.g*brightness;
    cs[i*3+2]=c.b*brightness;
  }
  g.setAttribute('color',new THREE.BufferAttribute(cs,3));
  g.computeVertexNormals();
  return g;
}
function chooseLabel(face,ids){
  if(!face)return 0;
  const a=ids[face.a],b=ids[face.b],c=ids[face.c];
  return a===b||a===c?a:b===c?b:a;
}
function RegionHalo({data,regionId}){
  const geometry=useMemo(()=>{
    if(!data||!regionId)return null;
    const faces=data.faces,ids=data.ids;
    const chosen=[];
    for(let k=0;k<faces.length;k+=3){
      const a=faces[k],b=faces[k+1],c=faces[k+2];
      if((ids[a]===regionId)+(ids[b]===regionId)+(ids[c]===regionId)>=2)chosen.push(a,b,c);
    }
    if(!chosen.length)return null;
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.BufferAttribute(data.positions,3));
    g.setIndex(chosen);
    g.computeVertexNormals();
    return g;
  },[data,regionId]);
  useEffect(()=>()=>geometry?.dispose(),[geometry]);
  if(!geometry)return null;
  return <mesh geometry={geometry} renderOrder={4}>
    <meshBasicMaterial color="#fbe098" transparent opacity={.28} depthWrite={false} side={THREE.DoubleSide} polygonOffset polygonOffsetFactor={-2}/>
  </mesh>;
}
function Surface({hemi,mode,display,selected,onSelect,onHover,regionMap,focusIds,quiz,onLoad,onError,opacity}){
  const [data,setData]=useState(null);
  useEffect(()=>{
    let alive=true;setData(null);
    loadSurface(hemi,mode).then(d=>{if(alive){setData(d);onLoad(hemi);}}).catch(e=>{if(alive)onError(e.message);});
    return()=>{alive=false;};
  },[hemi,mode,onLoad,onError]);
  const geometry=useMemo(()=>data?makeGeometry(data,display,regionMap,selected,hemi,focusIds,quiz):null,[data,display,regionMap,selected,hemi,focusIds,quiz]);
  useEffect(()=>()=>geometry?.dispose(),[geometry]);
  const choose=e=>data?chooseLabel(e.face,data.ids):null;
  if(!geometry||!data)return null;
  return <group>
    <mesh geometry={geometry}
      onClick={e=>{e.stopPropagation();const id=choose(e);if(id&&id!==42)onSelect({hemi,id});}}
      onPointerMove={e=>{e.stopPropagation();const id=choose(e);if(id&&id!==42)onHover({hemi,id});}}
      onPointerOut={()=>onHover(null)}>
      <meshStandardMaterial vertexColors side={THREE.DoubleSide} roughness={.9} metalness={0}
        transparent={opacity<1} opacity={opacity}/>
    </mesh>

  </group>;
}
function CameraRig({hemi,orientation,mode,reset}){
  const {camera,controls}=useThree();
  useEffect(()=>{
    const side=hemi==='left'?-1:1;
    const offset=hemi==='both'?[0,0,0]:[side*.62,0,0];
    const dist=mode==='infl'?6.2:4.95;
    const dirs={
      lateral:[side*dist,.45,.45],
      medial:[-side*dist,.25,.3],
      anterior:[0,.4,dist],
      posterior:[0,.25,-dist],
      superior:[.02,dist,.05],
      inferior:[.02,-dist,.05],
      oblique:[2.9,1.6,4.2]
    };
    const p=dirs[orientation]||dirs.oblique;
    const target=new THREE.Vector3(...offset);
    camera.position.set(p[0]+offset[0],p[1]+offset[1],p[2]+offset[2]);
    camera.lookAt(target);
    if(controls){controls.target.copy(target);controls.update();}
    camera.updateProjectionMatrix();
  },[camera,controls,hemi,orientation,mode,reset]);
  return null;
}
export default function AtlasViewer({
  hemi,mode,display,selected,onSelect,onHover,regionMap,focusIds,quiz,orientation,reset,rotate,opacity,onLoading,onError,canvasRef
}){
  const onLoad=useCallback(()=>onLoading(false),[onLoading]);
  return <Canvas frameloop={rotate?'always':'demand'} dpr={[1,Math.min(window.devicePixelRatio||1,1.5)]}
    camera={{position:[2.9,1.6,4.2],fov:42,near:.04,far:100}}
    gl={{alpha:true,antialias:true,preserveDrawingBuffer:true,powerPreference:'low-power'}}
    onCreated={({gl})=>{canvasRef.current=gl.domElement;}}
    fallback={<div className="canvas-fallback">Este navegador no permite visualización WebGL.</div>}>
    <ambientLight intensity={1.75}/>
    <hemisphereLight args={['#f3fbff','#69727c',1.15]}/>
    <directionalLight position={[4,6,5]} intensity={2.4} color="#fff1df"/>
    <directionalLight position={[-4,2,-5]} intensity={1.25} color="#c0d9ef"/>
    {['left','right'].filter(h=>hemi==='both'||hemi===h).map(h=><Surface
      key={h} hemi={h} mode={mode} display={display} selected={selected} onSelect={onSelect}
      onHover={onHover} regionMap={regionMap} focusIds={focusIds} quiz={quiz}
      onLoad={onLoad} onError={onError} opacity={opacity}/>)}
    <OrbitControls makeDefault enableDamping dampingFactor={.07}
      enablePan minDistance={1.5} maxDistance={12} autoRotate={rotate}
      autoRotateSpeed={.6} target={[0,0,0]}/>
    <CameraRig hemi={hemi} orientation={orientation} mode={mode} reset={reset}/>
  </Canvas>;
}

