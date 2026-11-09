import React,{useEffect,useRef,useState} from 'react';
import {Layers3,ScanLine,Info,Eye,EyeOff,RotateCcw,Maximize2,ZoomIn,ZoomOut,MonitorSmartphone} from 'lucide-react';

const BASE=import.meta.env.BASE_URL+'volume/';
const TITLES={
  axial:{name:'Axial',plane:'R–L · A–P',axis:'z',range:96},
  coronal:{name:'Coronal',plane:'R–L · S–I',axis:'y',range:114},
  sagittal:{name:'Sagital',plane:'A–P · S–I',axis:'x',range:96}
};
const COLOR_BY_LABEL={
  17:[183,132,213],53:[183,132,213],
  18:[230,134,142],54:[230,134,142],
  10:[123,146,224],49:[123,146,224],
  11:[105,215,194],50:[105,215,194],
  12:[237,177,108],51:[237,177,108],
  13:[223,199,121],52:[223,199,121],
  16:[140,196,228],
  8:[176,204,157],47:[176,204,157],
  251:[243,217,158],252:[243,217,158],253:[243,217,158],254:[243,217,158],255:[243,217,158],
  4:[110,208,230],43:[110,208,230]
};
const REGION_LABELS={hipocampo:[17,53],amigdala:[18,54],talamo:[10,49],caudado:[11,50],putamen:[12,51],palido:[13,52],tronco:[16],cerebelo:[8,47],calloso:[251,252,253,254,255],ventriculos:[4,43]};
function index(x,y,z,width,height){return x+width*(y+height*z)}
export function parseNavl(buffer){
 if(String.fromCharCode(...new Uint8Array(buffer,0,4))!=='NAVL')throw Error('Formato de volumen no válido');
 const d=new DataView(buffer),nx=d.getUint16(4,true),ny=d.getUint16(6,true),nz=d.getUint16(8,true);
 if(nx!==97||ny!==115||nz!==97||buffer.byteLength!==10+nx*ny*nz)throw Error('Dimensiones de RM incompatibles');
 return {nx,ny,nz,data:new Uint8Array(buffer.slice(10))};
}
function viewDims(axis){return axis==='axial'?[97,115]:axis==='coronal'?[97,97]:[115,97]}
function mapVoxel(axis,x,y,coord){
 if(axis==='axial')return [96-x,114-y,coord.z];
 if(axis==='coronal')return [96-x,coord.y,96-y];
 return [coord.x,114-x,96-y];
}
function mapCross(axis,c){
 if(axis==='axial')return [96-c.x,114-c.y];
 if(axis==='coronal')return [96-c.x,96-c.z];
 return [114-c.y,96-c.z];
}
function Plane({axis,title,coord,setCoord,mri,seg,showLabels,selectedCategory,primary,onPromote}){
 const [zoom,setZoom]=useState(1);
 const [pan,setPan]=useState({x:0,y:0});
 const viewRef=useRef(null),pointer=useRef(null);
 const canvas=useRef(null),dims=viewDims(axis),[w,h]=dims,field=TITLES[axis];
 useEffect(()=>{
  const ctx=canvas.current?.getContext('2d',{willReadFrequently:true});
  if(!ctx||!mri||!seg)return;
  const img=ctx.createImageData(w,h);
  const chosenIds=REGION_LABELS[selectedCategory]||[];
  for(let py=0;py<h;py++)for(let px=0;px<w;px++){
   const [x,y,z]=mapVoxel(axis,px,py,coord);
   const idx=index(x,y,z,mri.nx,mri.ny);
   const gray=mri.data[idx];
   const j=(px+py*w)*4;
   let r=gray,g=gray,b=gray;
   const label=seg.data[idx],col=COLOR_BY_LABEL[label];
   if(showLabels&&col){
     const alpha=chosenIds.includes(label) ? .66 : .34;
     r=Math.round(r*(1-alpha)+col[0]*alpha);
     g=Math.round(g*(1-alpha)+col[1]*alpha);
     b=Math.round(b*(1-alpha)+col[2]*alpha);
   }
   img.data[j]=r;img.data[j+1]=g;img.data[j+2]=b;img.data[j+3]=255;
  }
  ctx.putImageData(img,0,0);
  const [cx,cy]=mapCross(axis,coord);
  ctx.beginPath();ctx.strokeStyle='#53d8c7';ctx.lineWidth=.53;ctx.moveTo(cx+.5,0);ctx.lineTo(cx+.5,h);ctx.moveTo(0,cy+.5);ctx.lineTo(w,cy+.5);ctx.stroke();
  ctx.beginPath();ctx.strokeStyle='#e4fff8';ctx.lineWidth=.8;ctx.arc(cx+.5,cy+.5,2.7,0,Math.PI*2);ctx.stroke();
 },[axis,coord,mri,seg,showLabels,selectedCategory,w,h]);
 const slice=coord[field.axis];
 const mm=field.axis==='x'?coord.x*2-96.5:field.axis==='y'?coord.y*2-132.5:coord.z*2-78.5;
 const label=(mm>=0?'+':'')+mm.toFixed(1)+' mm';
 const choose=evt=>{
  const rect=canvas.current.getBoundingClientRect();
  // Account for contain letterboxing (preserve anatomical aspect ratio).
  const scale=Math.min(rect.width/w,rect.height/h);
  const visualWidth=w*scale,visualHeight=h*scale;
  const left=rect.left+(rect.width-visualWidth)/2,top=rect.top+(rect.height-visualHeight)/2;
  if(evt.clientX<left||evt.clientX>left+visualWidth||evt.clientY<top||evt.clientY>top+visualHeight)return;
  const px=Math.max(0,Math.min(w-1,Math.floor((evt.clientX-left)/visualWidth*w)));
  const py=Math.max(0,Math.min(h-1,Math.floor((evt.clientY-top)/visualHeight*h)));
  const [x,y,z]=mapVoxel(axis,px,py,coord);
  setCoord({x,y,z});
 };
 const down=e=>{pointer.current={x:e.clientX,y:e.clientY,pan:{...pan},drag:false};e.currentTarget.setPointerCapture?.(e.pointerId);};
 const move=e=>{
   const p=pointer.current;if(!p||zoom<=1)return;
   const dx=e.clientX-p.x,dy=e.clientY-p.y;
   if(Math.abs(dx)+Math.abs(dy)>4)p.drag=true;
   setPan({x:p.pan.x+dx,y:p.pan.y+dy});
 };
 const up=e=>{const wasDragging=pointer.current?.drag;pointer.current=null;if(!wasDragging)choose(e);};
 const updateZoom=value=>{const next=Math.min(4,Math.max(1,value));setZoom(next);if(next===1)setPan({x:0,y:0});};
 const full=()=>{
   const target=viewRef.current;
   if(document.fullscreenElement)document.exitFullscreen?.();
   else target?.requestFullscreen?.().catch(()=>{});
 };
 return <article ref={viewRef} className={'mri-plane '+(primary?'mri-plane--primary':'mri-plane--secondary')}>
   <div className="mri-plane-title"><div><strong>{title}</strong><small>{field.plane}</small></div><span>{label}</span>
     {!primary&&<button className="mri-promote" onClick={()=>onPromote(axis)}>Ampliar esta vista</button>}
     {primary&&<button className="mri-expand" onClick={full} title="Pantalla completa"><Maximize2 size={16}/><span>Pantalla completa</span></button>}
   </div>
   <div className="mri-frame">
     <span className="mri-corner">MNI152 · T1 · REFERENCIA ANATÓMICA</span>
     <canvas ref={canvas} width={w} height={h} onPointerDown={down} onPointerMove={move}
      onPointerUp={up} onPointerCancel={()=>{pointer.current=null;}}
      onWheel={e=>{e.preventDefault();updateZoom(zoom+(e.deltaY>0?-.2:.2));}}
      style={{transform:'translate('+pan.x+'px,'+pan.y+'px) scale('+zoom+')'}}
      aria-label={'Corte de resonancia '+title} role="img" title="Toca para localizar · arrastra para desplazar con zoom"/>
     <div className="mri-frame-foot"><span>{axis==='sagittal'?'A':'R'}</span><span>{axis==='sagittal'?'P':'L'}</span></div>
     {primary&&<div className="mri-zoom-tools"><button onClick={()=>updateZoom(zoom-.25)} aria-label="Alejar resonancia"><ZoomOut size={17}/></button><span>{Math.round(zoom*100)}%</span><button onClick={()=>updateZoom(zoom+.25)} aria-label="Acercar resonancia"><ZoomIn size={17}/></button><button onClick={()=>{setZoom(1);setPan({x:0,y:0});}} aria-label="Restablecer zoom"><RotateCcw size={16}/></button></div>}
   </div>
   <div className="mri-slider"><span>NIVEL</span><input aria-label={'Mover corte '+title} type="range" min="0" max={field.range} value={slice} onChange={e=>setCoord({...coord,[field.axis]:Number(e.target.value)})}/><strong>{slice+1}/{field.range+1}</strong></div>
 </article>;
}
export default function MRIViewer({selectedDeep}){
 const [mri,setMri]=useState(null),[seg,setSeg]=useState(null),[error,setError]=useState('');
 const [coord,setCoord]=useState({x:48,y:57,z:49});
 const [showLabels,setShowLabels]=useState(true);
 const [activePlane,setActivePlane]=useState('sagittal');
 useEffect(()=>{
  const abort=new AbortController();
  Promise.all(['mni152_t1.bin','mni152_aseg.bin'].map(name=>fetch(BASE+name,{signal:abort.signal}).then(r=>{if(!r.ok)throw Error('No se pudo cargar el volumen de resonancia');return r.arrayBuffer()}).then(parseNavl)))
  .then(([a,b])=>{setMri(a);setSeg(b)}).catch(e=>{if(e.name!=='AbortError')setError(e.message)});
  return()=>abort.abort();
 },[]);
 const category=selectedDeep?.replace(/-(left|right)$/,'')?.replace('corpus-callosum','calloso')?.replace('brainstem','tronco')?.replace('cerebellum','cerebelo')?.replace('hippocampus','hipocampo')?.replace('amygdala','amigdala')?.replace('thalamus','talamo')?.replace('caudate','caudado')?.replace('pallidum','palido');
 return <section className="mri-lesson">
   <div className="mode-explanation"><span className="evidence-icon"><ScanLine size={18}/></span><div>
     <strong>Resonancia magnética T1 · cortes ortogonales</strong>
     <p>Volumen anatómico real de referencia MNI152NLin2009cAsym, resolución 2 mm. Los tres planos comparten coordenadas; toca cualquier corte para explorarlos en conjunto.</p></div></div>
   <div className="mri-actions">
    <div className="mri-actions-label"><Layers3 size={16}/> Segmentación aseg superpuesta</div>
    <button aria-pressed={showLabels} onClick={()=>setShowLabels(v=>!v)}>{showLabels?<Eye size={16}/>:<EyeOff size={16}/>} {showLabels?'Ocultar etiquetas':'Mostrar etiquetas'}</button>
    <button onClick={()=>setCoord({x:48,y:57,z:49})}><RotateCcw size={16}/> Centrar cortes</button>
   </div>
   <div className="mri-view-toolbar" role="group" aria-label="Seleccionar plano principal de resonancia">
     <div><MonitorSmartphone size={17}/><strong>VISOR ANATÓMICO AMPLIADO</strong><span>Elige el plano principal para estudiarlo con detalle</span></div>
     <div className="mri-plane-picker">{['sagittal','coronal','axial'].map(axis=><button key={axis}
       onClick={()=>setActivePlane(axis)} aria-pressed={activePlane===axis}
       className={activePlane===axis?'active':''}>{TITLES[axis].name}</button>)}</div>
   </div>
   {mri&&seg?<div className="mri-planes mri-planes--focused">
      {[activePlane,...['sagittal','coronal','axial'].filter(axis=>axis!==activePlane)].map((axis,i)=>
        <Plane key={axis} axis={axis} title={TITLES[axis].name} coord={coord} setCoord={setCoord}
          mri={mri} seg={seg} primary={i===0} onPromote={setActivePlane}
          showLabels={showLabels} selectedCategory={category}/>)}
    </div>:<div className="mri-loading" role="status">{error||'Cargando volumen anatómico T1 y parcelación…'}</div>}
   <div className="mri-coordinate"><strong>Coordenadas anatómicas de plantilla (RAS, mm)</strong><div>
     <span>R-L <b>{(coord.x*2-96.5).toFixed(1)}</b></span>
     <span>A-P <b>{(coord.y*2-132.5).toFixed(1)}</b></span>
     <span>S-I <b>{(coord.z*2-78.5).toFixed(1)}</b></span></div></div>
   <div className="method-alert"><Info size={16}/><span>Las imágenes son promedios anatómicos de plantilla, no estudios de pacientes. La superposición de colores representa una segmentación automática de referencia, no actividad cerebral ni diagnóstico. T1 y etiquetas volumétricas comparten el espacio MNI152; las superficies corticales fsaverage5 pertenecen a otra referencia.</span></div>
 </section>;
}

