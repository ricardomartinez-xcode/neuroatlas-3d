#!/usr/bin/env python3
"""Generate MNI152 reference MRI orthogonal volume and independently segmented 3D deep structures.
Source: TemplateFlow MNI152NLin2009cAsym (T1w + FreeSurfer-aseg dseg)."""
from pathlib import Path
import gzip, hashlib, json, struct
import numpy as np
import nibabel as nib
from scipy.ndimage import gaussian_filter
from skimage.measure import marching_cubes

ROOT=Path(__file__).resolve().parent.parent
CACHE=ROOT/'.cache/volume'
OUT=ROOT/'public/volume'
OUT.mkdir(parents=True,exist_ok=True)
SOURCE="https://templateflow.s3.amazonaws.com/tpl-MNI152NLin2009cAsym/"
VOL_NAME='tpl-MNI152NLin2009cAsym_res-02_T1w.nii.gz'
SEG_NAME='tpl-MNI152NLin2009cAsym_res-02_seg-aseg_dseg.nii.gz'
SEG_HI_NAME='tpl-MNI152NLin2009cAsym_res-01_seg-aseg_dseg.nii.gz'
vol=nib.load(CACHE/'t1_2mm.nii.gz')
seg=nib.load(CACHE/'aseg_2mm.nii.gz')
seg_high=nib.load(CACHE/'aseg_1mm.nii.gz')
assert vol.shape==seg.shape==(97,115,97), (vol.shape,seg.shape)
assert seg_high.shape==(193,229,193)
assert np.allclose(vol.affine,seg.affine,atol=.1), 'T1 and segmentation are not coregistered'
image=np.asarray(vol.dataobj,dtype=np.float32)
seg2=np.asarray(seg.dataobj,dtype=np.uint8)
seg1=np.asarray(seg_high.dataobj,dtype=np.uint8)
assert (seg1>0).sum()>150000, 'Not a valid anatomical labelmap'
positive=image[image>0]
low,high=np.percentile(positive,[1,99.7])
scaled=(np.clip((image-low)/(high-low),0,1)*255).astype(np.uint8)
# Pack volume x-fastest, then y then z: JS idx=x + width*(y + height*z)
def save_volume(name,arr):
    dest=OUT/name
    raw=b'NAVL'+struct.pack('<3H',*arr.shape)+arr.tobytes(order='F')
    dest.write_bytes(raw)
    print('SAVED',name,len(raw),'range',int(arr.min()),int(arr.max()))
save_volume('mni152_t1.bin',scaled)
save_volume('mni152_aseg.bin',seg2)
defs=[
('hippocampus-left','Hipocampo izquierdo',[17],'#c1a1d6','Memoria episódica y espacial','hipocampo'),
('hippocampus-right','Hipocampo derecho',[53],'#d1b6e5','Memoria episódica y espacial','hipocampo'),
('amygdala-left','Amígdala izquierda',[18],'#df9b9b','Saliencia y aprendizaje afectivo','amigdala'),
('amygdala-right','Amígdala derecha',[54],'#edbbbb','Saliencia y aprendizaje afectivo','amigdala'),
('thalamus-left','Tálamo izquierdo',[10],'#b3b9e5','Relés e integración talamocortical','talamo'),
('thalamus-right','Tálamo derecho',[49],'#cad0ee','Relés e integración talamocortical','talamo'),
('caudate-left','Núcleo caudado izquierdo',[11],'#85c9bb','Circuitos frontoestriatales','caudado'),
('caudate-right','Núcleo caudado derecho',[50],'#a2d9cd','Circuitos frontoestriatales','caudado'),
('putamen-left','Putamen izquierdo',[12],'#e5ae7b','Control motor y aprendizaje de hábitos','putamen'),
('putamen-right','Putamen derecho',[51],'#f1c6a0','Control motor y aprendizaje de hábitos','putamen'),
('pallidum-left','Globo pálido izquierdo',[13],'#e7d38f','Circuitos motores de ganglios basales','palido'),
('pallidum-right','Globo pálido derecho',[52],'#f3e3a5','Circuitos motores de ganglios basales','palido'),
('brainstem','Tronco encefálico',[16],'#99c5dd','Vías de paso y núcleos vitales','tronco'),
('cerebellum-left','Cerebelo izquierdo, corteza',[8],'#acbea0','Coordinación y aprendizaje motor','cerebelo'),
('cerebellum-right','Cerebelo derecho, corteza',[47],'#c3d4b8','Coordinación y aprendizaje motor','cerebelo'),
('corpus-callosum','Cuerpo calloso',[251,252,253,254,255],'#e7cb9e','Conectividad interhemisférica','calloso'),
('ventricles','Ventrículos laterales',[4,43],'#7bc3d6','Sistema ventricular, líquido cefalorraquídeo','ventriculos')
]
metadata=[]
for key,title,labels,color,function,category in defs:
    mask=np.isin(seg1,labels)
    if mask.sum()<20:print('SKIP LABEL',key);continue
    coords=np.array(np.where(mask))
    mn=np.maximum(coords.min(axis=1)-3,0);mx=np.minimum(coords.max(axis=1)+4,np.array(mask.shape))
    cropped=mask[mn[0]:mx[0],mn[1]:mx[1],mn[2]:mx[2]].astype('float32')
    smoothed=gaussian_filter(cropped,sigma=.66)
    # Use 0.5 continuous surface from the actual labelmap, preserving topological origin.
    vertices,faces,_,_=marching_cubes(smoothed,level=.5,step_size=1 if mask.sum()<50000 else 2)
    ijk=vertices+mn[np.newaxis,:]
    # Accurate MNI affine (RAS): x Right, y Anterior, z Superior.
    ras=nib.affines.apply_affine(seg_high.affine,ijk)
    # Three axes x=R, y=S, z=A; recenter same normalized MNI frame for all structures.
    xyz=np.column_stack([(ras[:,0]) / 72,(ras[:,2]-18)/72,(ras[:,1]+18)/72]).astype('<f4')
    faces=faces[:,[0,2,1]].astype('<u4')
    # JS BufferGeometry supports uint32 indices for all supported WebGL2 platforms.
    header=b'NAVM'+struct.pack('<II',len(xyz),len(faces))
    target=OUT/(key+'.bin')
    target.write_bytes(header+xyz.tobytes(order='C')+faces.tobytes(order='C'))
    metadata.append({'id':key,'name':title,'labels':labels,'color':color,'role':function,'category':category,
                     'file':target.name,'vertices':int(len(xyz)),'faces':int(len(faces)),'voxelCount':int(mask.sum())})
    print('MESH',key,'vertices',len(xyz),'faces',len(faces),'bytes',target.stat().st_size)
info={
 'template':'MNI152NLin2009cAsym','voxelDimensions':[97,115,97],
 'spacingMm':[2,2,2], 'rasAffine':vol.affine.tolist(),
 'voxelIndexOrder':'x + 97*(y + 115*z)',
 'anatomicalGeometry':'FreeSurfer-aseg dseg 1 mm template transformed by template MNI affine; NOT fsaverage5 surfaces',
 'structures':metadata,
 'sourceT1':SOURCE+VOL_NAME,'sourceAseg':SOURCE+SEG_NAME,'sourceAsegHigh':SOURCE+SEG_HI_NAME,
 'sha256':{x:hashlib.sha256((CACHE/x).read_bytes()).hexdigest() for x in ['t1_2mm.nii.gz','aseg_2mm.nii.gz','aseg_1mm.nii.gz']}
}
(OUT/'manifest.json').write_text(json.dumps(info,ensure_ascii=False,indent=2),encoding='utf-8')
print('TOTAL_MESHES',len(metadata),'BYTES',sum((OUT/(r['file'])).stat().st_size for r in metadata))

