import React,{useEffect,useMemo,useState,useCallback} from 'react';
import {Canvas,useThree} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import * as THREE from 'three';
import {LOBES} from './anatomy.js';

// fsaverage6 retains authentic geometries (40,962 vertices/hemisphere).
// The Destrieux annotation comes from fsaverage5 and is interpolated to new fsaverage6
// vertices by nearest neighbour on the sphere: parcel boundaries are approximate.
const CACHE=new Map();
const BASE=import.meta.env.BASE_URL+'atlas/';
export function parseSurface(buffer){
 const v=new DataView(buffer);
 if(String.fromCharCode(...new Uint8Array(buffer,0,4))!=='NATL')throw Error('Formato de superficie no válido.');
 const n=v.getUint32(4,true),faces=v.getUint32(8,true);
 if(!((n===10242&&faces===20480)||(n===40962&&faces===81920)))throw Error('Dimensiones corticales desconocidas.');
 const needed=12+n*12+faces*6+n+n*4;
 if(buffer.byteLength!==needed)throw Error('Malla cortical incompleta.');
 let i=12;
 const positions=new Float32Array(buffer.slice(i,i+n*12));i+=n*12;
 const indices=new Uint16Array(buffer.slice(i,i+faces*6));i+=faces*6;
 const ids=new Uint8Array(buffer.slice(i,i+n));i+=n;
 const sulc=new Float32Array(buffer.slice(i,i+n*4));
 if(positions.some(x=>!Number.isFinite(x)))throw Error('Coordenadas corticales inválidas');
 return {positions,faces:indices,ids,sulc,highDetail:n===40962};
}
function loadSurface(hemi,mode){
 const key=mode+'6_'+hemi;
 if(!CACHE.has(key)){
  CACHE.set(key,fetch(BASE+key+'.bin').then(r=>{
   if(!r.ok)throw Error('High resolution not available');
   return r.arrayBuffer();
  }).then(parseSurface).catch(async ()=>{
   const res=await fetch(BASE+mode+'_'+hemi+'.bin');
   if(!res.ok)throw Error('No se pudo descargar la superficie cerebral');
   return parseSurface(await res.arrayBuffer());
  }).catch(e=>{CACHE.delete(key);throw e;}));
 }
 return CACHE.get(key);
}
function regionColor(id,display,regionMap){
 if(display==='anatomy')return new THREE.Color('#ccbcb4');
 const lobe=LOBES[regionMap.get(id)?.lobe]||LOBES.other;
 if(display==='lobes')return new THREE.Color(lobe.color);
 return new THREE.Color().setHSL(((id*.61803399)%1),.34,.62);
}
function faceId(ids,a,b,c){
 const x=ids[a],y=ids[b],z=ids[c];
 return x===y||x===z?x:y===z?y:x;
}
function makeGeometry(data,display,regionMap,selected,side,focusIds){
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.BufferAttribute(data.positions,3));
 geometry.setIndex(new THREE.BufferAttribute(data.faces,1));
 geometry.computeVertexNormals(); // smooth normals from actual surface, not face-faceting
 const palette=Array.from({length:76},(_,i)=>regionColor(i,display,regionMap));
 const focused=new Set(focusIds||[]);
 const isFocus=focused.size>0;
 const highlight=selected?.hemi===side&&selected?.id>0;
 const gold=new THREE.Color('#eeb859'),neutral=new THREE.Color('#8b9aa2');
 if(display==='anatomy'&&!isFocus&&!highlight){
   // Preserve topology and normals; use sulcal depth solely as modest shading.
   const colors=new Float32Array(data.ids.length*3);
   const base=palette[0];
   for(let i=0;i<data.ids.length;i++){
    const brightness=.87+.13*(1+Math.tanh(data.sulc[i]))/2;
    colors[i*3]=base.r*brightness;
    colors[i*3+1]=base.g*brightness;
    colors[i*3+2]=base.b*brightness;
   }
   geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
   return geometry;
 }
 // Categorical labels must have SHARP face boundaries. Native per-vertex palette
 // interpolation previously caused false-looking gradients between gyri/sulci.
 const expanded=geometry.toNonIndexed();
 geometry.dispose();
 const colors=new Float32Array(data.faces.length*3);
 const ids=data.ids,idx=data.faces;
 for(let k=0;k<idx.length;k+=3){
  const id=faceId(ids,idx[k],idx[k+1],idx[k+2]);
  const base=palette[id]||neutral;
  const col=highlight&&id===selected.id?gold:base;
  let r=col.r,g=col.g,b=col.b;
  if(isFocus&&!focused.has(id)){r=r*.28+neutral.r*.72;g=g*.28+neutral.g*.72;b=b*.28+neutral.b*.72;}
  for(let i=0;i<3;i++){
   const j=k*3+i*3;
   colors[j]=r;colors[j+1]=g;colors[j+2]=b;
  }
 }
 expanded.setAttribute('color',new THREE.BufferAttribute(colors,3));
 return expanded;
}
function Surface({hemi,mode,display,selected,onSelect,onHover,regionMap,focusIds,onLoad,onError,opacity}){
 const [data,setData]=useState(null);
 useEffect(()=>{
  let alive=true;setData(null);
  loadSurface(hemi,mode).then(d=>{if(alive){setData(d);onLoad(hemi);}}).catch(e=>{if(alive)onError(e.message);});
  return()=>{alive=false;};
 },[hemi,mode,onLoad,onError]);
 const geometry=useMemo(()=>data?makeGeometry(data,display,regionMap,selected,hemi,focusIds):null,[data,display,regionMap,selected,hemi,focusIds]);
 useEffect(()=>()=>geometry?.dispose(),[geometry]);
 const choose=e=>{
  if(!data||!e.face)return 0;
  // When geometry is non-indexed, face indices refer to expanded vertices.
  if(!geometry.index){
   const k=e.faceIndex*3,f=data.faces;
   return faceId(data.ids,f[k],f[k+1],f[k+2]);
  }
  const f=e.face;
  return faceId(data.ids,f.a,f.b,f.c);
 };
 if(!geometry)return null;
 return <mesh geometry={geometry}
   onClick={e=>{e.stopPropagation();const id=choose(e);if(id>0&&id!==42)onSelect({hemi,id});}}
   onPointerMove={e=>{e.stopPropagation();const id=choose(e);if(id>0&&id!==42)onHover({hemi,id});}}
   onPointerOut={()=>onHover(null)}>
   <meshStandardMaterial vertexColors side={THREE.DoubleSide} roughness={.96} metalness={0}
      transparent={opacity<1} opacity={opacity} flatShading={false} depthWrite={opacity>=1}/>
 </mesh>;
}
function CameraRig({hemi,orientation,mode,reset}){
 const {camera,controls,size,invalidate}=useThree();
 useEffect(()=>{
   const aspect=size.width/Math.max(1,size.height);
   const side=hemi==='left'?-1:1;
   const horizontal=hemi==='both';
   const targetX=horizontal?0:side*.54;
   // Fit for the narrow viewport without hiding either hemisphere; closer on desktop.
   const base=horizontal?(aspect<.9?4.8:3.7):(aspect<.9?3.45:3.2);
   const dist=base*(mode==='infl'?1.25:1);
   const directions={
     oblique:[.65,.38,.78],lateral:[side,.12,.18],medial:[-side,.1,.16],
     anterior:[0,.12,1],posterior:[0,.12,-1],superior:[.08,1,.06],inferior:[.08,-1,.06]
   };
   const vec=new THREE.Vector3(...(directions[orientation]||directions.oblique)).normalize();
   const target=new THREE.Vector3(targetX,0,0);
   camera.position.copy(target).addScaledVector(vec,dist);
   camera.lookAt(target);
   if(controls){controls.target.copy(target);controls.update();}
   camera.updateProjectionMatrix();
   invalidate();
 },[camera,controls,size.width,size.height,invalidate,hemi,orientation,mode,reset]);
 return null;
}
export default function AtlasViewer({
 hemi,mode,display,selected,onSelect,onHover,regionMap,focusIds,quiz,orientation,reset,rotate,opacity,onLoading,onError,canvasRef
}){
 const onLoad=useCallback(()=>onLoading(false),[onLoading]);
 return <Canvas frameloop={rotate?'always':'demand'} dpr={[1,Math.min(window.devicePixelRatio||1,1.5)]}
   camera={{position:[2.7,1.4,3.4],fov:42,near:.04,far:100}}
   gl={{alpha:true,antialias:true,preserveDrawingBuffer:true,powerPreference:'low-power'}}
   onCreated={({gl})=>{canvasRef.current=gl.domElement;}}>
   <ambientLight intensity={.7}/>
   <hemisphereLight args={['#f5faff','#566476',.85]}/>
   <directionalLight position={[4,6,5]} intensity={1.25} color="#fff5e7"/>
   <directionalLight position={[-4,2,-5]} intensity={.45} color="#c1d7ec"/>
   {['left','right'].filter(h=>hemi==='both'||hemi===h).map(h=>
     <Surface key={h} hemi={h} mode={mode} display={display} selected={selected}
       onSelect={onSelect} onHover={onHover} regionMap={regionMap} focusIds={focusIds}
       onLoad={onLoad} onError={onError} opacity={opacity}/>)}
   <OrbitControls makeDefault enableDamping dampingFactor={.09}
      enablePan minDistance={1.3} maxDistance={10} autoRotate={rotate} autoRotateSpeed={.5}/>
   <CameraRig hemi={hemi} orientation={orientation} mode={mode} reset={reset}/>
 </Canvas>;
}

