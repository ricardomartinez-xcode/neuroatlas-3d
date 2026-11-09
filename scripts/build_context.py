#!/usr/bin/env python3
"""Create an explanatory semi-transparent MNI cortical envelope from the SAME aseg volume as deep nuclei.
NOT an individual pial reconstruction; only an outer context mask. Does not modify the labelled nuclei.
"""
from pathlib import Path
import json,struct,hashlib
import numpy as np
import nibabel as nib
from scipy.ndimage import binary_fill_holes,binary_closing,gaussian_filter,label
from skimage.measure import marching_cubes
ROOT=Path(__file__).resolve().parent.parent
src=ROOT/'.cache/volume/aseg_1mm.nii.gz'
dst=ROOT/'public/volume'
vol=nib.load(str(src))
v=np.asarray(vol.dataobj,dtype='uint8')
assert v.shape==(193,229,193)
outputs=[]
for name,codes in [('left',(2,3)),('right',(41,42))]:
  mask=np.isin(v,codes)
  assert mask.sum()>500000,name
  mask=binary_closing(mask,iterations=1)
  # Cortex and white matter form large connected structures; remove small disconnected islets
  labels,num=label(mask)
  count=np.bincount(labels.ravel());count[0]=0
  dominant=int(count.argmax())
  mask=(labels==dominant)
  mask=binary_fill_holes(mask)
  voxel_count=int(mask.sum())
  bounds=np.argwhere(mask)
  lo=np.maximum(bounds.min(axis=0)-3,0)
  hi=np.minimum(bounds.max(axis=0)+4,v.shape)
  sub=mask[lo[0]:hi[0],lo[1]:hi[1],lo[2]:hi[2]].astype('float32')
  field=gaussian_filter(sub,sigma=.84)
  xyz,faces,_,_=marching_cubes(field,level=.5,step_size=2)
  coords=nib.affines.apply_affine(vol.affine,xyz+lo)
  # Same MNI RAS world -> scene coordinate as volume-derived nuclei
  positions=np.column_stack([coords[:,0]/72,(coords[:,2]-18)/72,(coords[:,1]+18)/72]).astype('<f4')
  triangles=np.asarray(faces[:,[0,2,1]],dtype='<u4')
  output=b'NAVM'+struct.pack('<II',len(positions),len(triangles))+positions.tobytes()+triangles.tobytes()
  target=dst/f'cortex-context-{name}.bin'
  target.write_bytes(output)
  outputs.append({'file':target.name,'hemisphere':name,'sourceLabels':list(codes),'vertices':len(xyz),'faces':len(faces),'sha256':hashlib.sha256(output).hexdigest(),'note':'contextual silhouette generated from white and gray matter labels, not a native FreeSurfer pial surface'})
  print(name,'mask voxels',voxel_count,'vertices',len(xyz),'faces',len(faces),'bytes',len(output))
manifest_path=dst/'manifest.json'
manifest=json.loads(manifest_path.read_text())
manifest['contextSurfaces']=outputs
manifest['contextCaveat']='MNI same-space cortical hemisphere envelopes reconstructed from aseg gray/white tissue via morphological fill and marching cubes. Context is illustrative, not exact pial reconstruction.'
manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2))

