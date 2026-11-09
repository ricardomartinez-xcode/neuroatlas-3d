import React,{useEffect,useRef,useState} from 'react';
import {Layers3,ScanLine,Info,Eye,EyeOff,RotateCcw,Maximize2,ZoomIn,ZoomOut,MonitorSmartphone,Database,Image as ImageIcon} from 'lucide-react';

const BASE=import.meta.env.BASE_URL+'volume/';
const TITLES={
 axial:{name:'Axial',plane:'R–L · A–P',axis:'z'},
 coronal:{name:'Coronal',plane:'R–L · S–I',axis:'y'},
 sagittal:{name:'Sagital',plane:'A–P · S–I',axis:'x'}
};
const COLOR_BY_LABEL={
 17:[183,132,213],53:[183,132,213],18:[230,134,142],54:[230,134,142],
 10:[123,146,224],49:[123,146,224],11:[105,215,194],50:[105,215,194],
 12:[237,177,108],51:[237,177,108],13:[223,199,121],52:[223,199,121],
 16:[140,196,228],8:[176,204,157],47:[176,204,157],
 251:[243,217,158],252:[243,217,158],253:[243,217,158],254:[243,217,158],255:[243,217,158],
 4:[110,208,230],43:[110,208,230]
};
const REGION_LABELS={
 hipocampo:[17,53],amigdala:[18,54],talamo:[10,49],caudado:[11,50],
 putamen:[12,51],palido:[13,52],tronco:[16],cerebelo:[8,47],
 calloso:[251,252,253,254,255],ventriculos:[4,43]
};
const ORIGIN={x:-96,y:-132,z:-78};
function clamp(n,min,max){return Math.min(max,Math.max(min,n));}
function formatMm(mm){return (mm>=0?'+':'')+mm.toFixed(1)+' mm';}
function index(x,y,z,volume){return x+volume.nx*(y+volume.ny*z);}
export function parseNavl(buffer){
 if(String.fromCharCode(...new Uint8Array(buffer,0,4))!=='NAVL')throw Error('Encabezado NAVL no reconocido');
 const d=new DataView(buffer);
 const nx=d.getUint16(4,true),ny=d.getUint16(6,true),nz=d.getUint16(8,true);
 if(!((nx===97&&ny===115&&nz===97)||(nx===193&&ny===229&&nz===193)))throw Error('Dimensiones de referencia desconocidas');
 if(buffer.byteLength!==10+nx*ny*nz)throw Error('Volumen anatómico incompleto');
 const spacing=nx===193?1:2;
 const origins=spacing===1?ORIGIN:{x:-96.5,y:-132.5,z:-78.5};
 return {nx,ny,nz,data:new Uint8Array(buffer.slice(10)),spacing,origins};
}
async function fetchNavl(path,compressed,signal){
 const response=await fetch(BASE+path,{signal});
 if(!response.ok)throw Error('No se descargó '+path+' ('+response.status+')');
 const bytes=await response.arrayBuffer();
 if(!compressed)return parseNavl(bytes);
 if(typeof DecompressionStream==='undefined')throw Error('Tu navegador no admite descompresión gzip en memoria.');
 const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
 return parseNavl(await new Response(stream).arrayBuffer());
}
function voxelFromWorld(world,volume){
 const c={};for(const axis of ['x','y','z']){
  const dim=axis==='x'?volume.nx:axis==='y'?volume.ny:volume.nz;
  c[axis]=clamp(Math.round((world[axis]-volume.origins[axis])/volume.spacing),0,dim-1);
 }return c;
}
function worldFromVoxel(voxel,volume){
 const c={};for(const axis of ['x','y','z'])c[axis]=volume.origins[axis]+voxel[axis]*volume.spacing;
 return c;
}
function dimensions(axis,vol){
 return axis==='axial'?[vol.nx,vol.ny]:axis==='coronal'?[vol.nx,vol.nz]:[vol.ny,vol.nz];
}
function mapVoxel(axis,px,py,coord,vol){
 if(axis==='axial')return [vol.nx-1-px,vol.ny-1-py,coord.z];
 if(axis==='coronal')return [vol.nx-1-px,coord.y,vol.nz-1-py];
 return [coord.x,vol.ny-1-px,vol.nz-1-py];
}
function mapCross(axis,c,vol){
 if(axis==='axial')return [vol.nx-1-c.x,vol.ny-1-c.y];
 if(axis==='coronal')return [vol.nx-1-c.x,vol.nz-1-c.z];
 return [vol.ny-1-c.y,vol.nz-1-c.z];
}
function Plane({axis,title,world,setWorld,mri,seg,showLabels,selectedCategory,primary,onPromote}){
 const [zoom,setZoom]=useState(1),[pan,setPan]=useState({x:0,y:0});
 const viewRef=useRef(null),pointer=useRef(null),canvas=useRef(null);
 const [w,h]=dimensions(axis,mri),field=TITLES[axis],coord=voxelFromWorld(world,mri);
 const planeAxis=field.axis,dimension=planeAxis==='x'?mri.nx:planeAxis==='y'?mri.ny:mri.nz;
 useEffect(()=>{
  const ctx=canvas.current?.getContext('2d');
  if(!ctx)return;
  const img=ctx.createImageData(w,h);
  const highlighted=REGION_LABELS[selectedCategory]||[];
  for(let py=0;py<h;py++)for(let px=0;px<w;px++){
   const [x,y,z]=mapVoxel(axis,px,py,coord,mri);
   const idx=index(x,y,z,mri),value=mri.data[idx],offset=(px+py*w)*4;
   let r=value,g=value,b=value;
   const color=COLOR_BY_LABEL[seg.data[idx]];
   if(showLabels&&color){
    const alpha=highlighted.includes(seg.data[idx]) ? .62 : .31;
    r=Math.round(r*(1-alpha)+color[0]*alpha);
    g=Math.round(g*(1-alpha)+color[1]*alpha);
    b=Math.round(b*(1-alpha)+color[2]*alpha);
   }
   img.data[offset]=r;img.data[offset+1]=g;img.data[offset+2]=b;img.data[offset+3]=255;
  }
  ctx.putImageData(img,0,0);
  const [cx,cy]=mapCross(axis,coord,mri);
  ctx.beginPath();ctx.strokeStyle='#41dbc4';ctx.lineWidth=mri.spacing===1?.85:.6;
  ctx.moveTo(cx+.5,0);ctx.lineTo(cx+.5,h);ctx.moveTo(0,cy+.5);ctx.lineTo(w,cy+.5);ctx.stroke();
  ctx.beginPath();ctx.strokeStyle='#dcfff6';ctx.lineWidth=1.15;ctx.arc(cx+.5,cy+.5,mri.spacing===1?4:2.5,0,Math.PI*2);ctx.stroke();
 },[axis,coord.x,coord.y,coord.z,mri,seg,showLabels,selectedCategory,w,h]);
 const choose=e=>{
  const rect=canvas.current.getBoundingClientRect();
  // The image uses object-fit: contain, so the drawable area can be letterboxed.
  const scale=Math.min(rect.width/w,rect.height/h);
  const dw=w*scale,dh=h*scale,left=rect.left+(rect.width-dw)/2,top=rect.top+(rect.height-dh)/2;
  if(e.clientX<left||e.clientX>left+dw||e.clientY<top||e.clientY>top+dh)return;
  const px=clamp(Math.floor((e.clientX-left)/dw*w),0,w-1);
  const py=clamp(Math.floor((e.clientY-top)/dh*h),0,h-1);
  const [x,y,z]=mapVoxel(axis,px,py,coord,mri);
  setWorld(worldFromVoxel({x,y,z},mri));
 };
 const down=e=>{pointer.current={x:e.clientX,y:e.clientY,pan:{...pan},drag:false};e.currentTarget.setPointerCapture?.(e.pointerId);};
 const move=e=>{
  const p=pointer.current;if(!p||zoom<=1)return;
  const dx=e.clientX-p.x,dy=e.clientY-p.y;
  if(Math.abs(dx)+Math.abs(dy)>4)p.drag=true;
  setPan({x:p.pan.x+dx,y:p.pan.y+dy});
 };
 const up=e=>{const dragged=pointer.current?.drag;pointer.current=null;if(!dragged)choose(e);};
 const updateZoom=value=>{const v=clamp(value,1,4);setZoom(v);if(v===1)setPan({x:0,y:0});};
 const fullscreen=()=>{
  if(document.fullscreenElement)document.exitFullscreen?.();
  else viewRef.current?.requestFullscreen?.().catch(()=>{});
 };
 const changeSlice=n=>setWorld({...world,[planeAxis]:mri.origins[planeAxis]+n*mri.spacing});
 const currentLabel=formatMm(worldFromVoxel(coord,mri)[planeAxis]);
 return <article ref={viewRef} className={'mri-plane '+(primary?'mri-plane--primary':'mri-plane--secondary')}>
  <div className="mri-plane-title"><div><strong>{title}</strong><small>{field.plane}</small></div><span>{currentLabel}</span>
   {!primary&&<button className="mri-promote" onClick={()=>onPromote(axis)}>Ampliar vista</button>}
   {primary&&<button className="mri-expand" onClick={fullscreen} title="Pantalla completa"><Maximize2 size={17}/><span>Pantalla completa</span></button>}
  </div>
  <div className="mri-frame">
   <span className="mri-corner">MNI152 · T1 · {mri.spacing} MM</span>
   <canvas ref={canvas} width={w} height={h} onPointerDown={down} onPointerMove={move} onPointerUp={up}
    onPointerCancel={()=>{pointer.current=null;}}
    onWheel={e=>{e.preventDefault();updateZoom(zoom+(e.deltaY>0?-.2:.2));}}
    style={{transform:'translate('+pan.x+'px,'+pan.y+'px) scale('+zoom+')'}}
    aria-label={'Imagen de referencia de resonancia '+title} role="img" title="Toca para localizar. Arrastra para desplazar con zoom."/>
   <div className="mri-frame-foot"><span>{axis==='sagittal'?'A':'R'}</span><span>{axis==='sagittal'?'P':'L'}</span></div>
   {primary&&<div className="mri-zoom-tools">
    <button onClick={()=>updateZoom(zoom-.25)} aria-label="Alejar resonancia"><ZoomOut size={17}/></button>
    <span>{Math.round(zoom*100)}%</span>
    <button onClick={()=>updateZoom(zoom+.25)} aria-label="Acercar resonancia"><ZoomIn size={17}/></button>
    <button onClick={()=>{setZoom(1);setPan({x:0,y:0});}} aria-label="Restablecer zoom"><RotateCcw size={16}/></button>
   </div>}
  </div>
  <div className="mri-slider"><span>NIVEL</span><input aria-label={'Mover corte '+title} type="range" min="0"
   max={dimension-1} value={coord[planeAxis]} onChange={e=>changeSlice(Number(e.target.value))}/>
   <strong>{coord[planeAxis]+1}/{dimension}</strong></div>
 </article>;
}
export default function MRIViewer({selectedDeep}){
 const [dataset,setDataset]=useState(null);
 const [quality,setQuality]=useState('1mm');
 const [loading,setLoading]=useState(true),[error,setError]=useState('');
 const [world,setWorld]=useState({x:0,y:-18,z:20});
 const [showLabels,setShowLabels]=useState(false);
 const [activePlane,setActivePlane]=useState('sagittal');
 useEffect(()=>{
  const controller=new AbortController();
  setLoading(true);setError('');
  const files=quality==='1mm'
    ?[['mni152_t1_1mm.navl.gz',true],['mni152_aseg_1mm.navl.gz',true]]
    :[['mni152_t1.bin',false],['mni152_aseg.bin',false]];
  Promise.all(files.map(([name,zip])=>fetchNavl(name,zip,controller.signal)))
   .then(([mri,seg])=>{
    if(mri.nx!==seg.nx||mri.ny!==seg.ny||mri.nz!==seg.nz)throw Error('MRI y segmentación no comparten geometría');
    setDataset({mri,seg});setLoading(false);
   }).catch(e=>{
    if(e.name==='AbortError')return;
    if(quality==='1mm'){
     setError('No se pudo cargar la resolución de 1 mm; se muestra la versión de 2 mm.');
     setQuality('2mm');
    }else{setError(e.message);setLoading(false);}
   });
  return()=>controller.abort();
 },[quality]);
 const category=selectedDeep?.replace(/-(left|right)$/,'')?.replace('corpus-callosum','calloso')
  ?.replace('brainstem','tronco')?.replace('cerebellum','cerebelo')?.replace('hippocampus','hipocampo')
  ?.replace('amygdala','amigdala')?.replace('thalamus','talamo')?.replace('caudate','caudado')?.replace('pallidum','palido');
 const mri=dataset?.mri,seg=dataset?.seg;
 return <section className="mri-lesson">
  <div className="mode-explanation"><span className="evidence-icon"><ScanLine size={19}/></span><div>
   <strong>Resonancia magnética T1 — plantilla anatómica MNI152</strong>
   <p>Imágenes derivadas de un volumen de resonancia de referencia, no generadas por inteligencia artificial. Tres planos sincronizados; intensidades adaptadas a escala de grises para visualización. No son imágenes de un paciente.</p>
  </div></div>
  <div className="mri-academic-bar">
   <div><ImageIcon size={17}/><strong>Detalle de imagen</strong><span>Elige la resolución nativa de la plantilla</span></div>
   <div className="mri-quality-picker" role="group" aria-label="Resolución de las imágenes T1">
    <button className={quality==='1mm'?'active':''} aria-pressed={quality==='1mm'} onClick={()=>setQuality('1mm')}>1 mm · Alta definición</button>
    <button className={quality==='2mm'?'active':''} aria-pressed={quality==='2mm'} onClick={()=>setQuality('2mm')}>2 mm · Ligera</button>
   </div>
   <button className="mri-overlay-toggle" aria-pressed={showLabels} onClick={()=>setShowLabels(v=>!v)}>
    {showLabels?<Eye size={17}/>:<EyeOff size={17}/>} {showLabels?'Ocultar parcelación':'Mostrar parcelación'}
   </button>
   <button className="mri-reset" onClick={()=>setWorld({x:0,y:-18,z:20})}><RotateCcw size={16}/> Centrar cortes</button>
  </div>
  <div className="mri-view-toolbar" role="group" aria-label="Seleccionar plano principal">
   <div><MonitorSmartphone size={17}/><strong>VISOR ANATÓMICO AMPLIADO</strong><span>Selecciona el plano que deseas explorar</span></div>
   <div className="mri-plane-picker">{['sagittal','coronal','axial'].map(axis=><button key={axis}
    onClick={()=>setActivePlane(axis)} aria-pressed={activePlane===axis}
    className={activePlane===axis?'active':''}>{TITLES[axis].name}</button>)}</div>
  </div>
  {loading||!mri||!seg?<div className="mri-loading" role="status">
   {loading?'Cargando la plantilla T1 y la segmentación anatómica…':error||'Sin datos de resonancia'}
  </div>:<div className="mri-planes mri-planes--focused">
   {[activePlane,...['sagittal','coronal','axial'].filter(a=>a!==activePlane)].map((axis,i)=>
    <Plane key={axis} axis={axis} title={TITLES[axis].name} world={world} setWorld={setWorld}
     mri={mri} seg={seg} primary={i===0} onPromote={setActivePlane}
     showLabels={showLabels} selectedCategory={category}/>)}
  </div>}
  <div className="mri-coordinate"><strong>Coordenadas espaciales RAS · plantilla MNI (mm)</strong><div>
   <span>Derecha–izquierda <b>{world.x.toFixed(1)}</b></span>
   <span>Anterior–posterior <b>{world.y.toFixed(1)}</b></span>
   <span>Superior–inferior <b>{world.z.toFixed(1)}</b></span>
  </div></div>
  {error&&<div className="mri-fallback-message" role="status">{error}</div>}
  <div className="method-alert"><Info size={16}/><span>Fuente: TemplateFlow, MNI152NLin2009cAsym, T1w y segmentación FreeSurfer aseg de la misma plantilla. Los colores opcionales representan etiquetas anatómicas, no actividad funcional. La resolución de 1 mm procede de datos muestreados a 1 mm; el zoom no genera detalle nuevo. Uso académico; no diagnóstico.</span></div>
 </section>;
}

