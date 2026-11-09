#!/usr/bin/env python3
"""Pack actual TemplateFlow MNI152NLin2009cAsym 1-mm T1/aseg references.
The 1mm MRI volume is original sampled anatomy, intensity mapped into 8-bit for browser rendering;
it is not AI-generated or an upscaled 2-mm screenshot.
"""
from pathlib import Path
import gzip,json,struct,hashlib
import nibabel as nib
import numpy as np
BASE=Path(__file__).resolve().parent.parent
CACHE=BASE/'.cache/volume'
OUT=BASE/'public/volume'
OUT.mkdir(parents=True,exist_ok=True)
INFILES={
't1_1mm.nii.gz':('1f27aabea9f7183dc0c69dafa71e1787b921ca778d655d9c1bf302b273d5627a',
'https://templateflow.s3.amazonaws.com/tpl-MNI152NLin2009cAsym/tpl-MNI152NLin2009cAsym_res-01_T1w.nii.gz'),
'aseg_1mm.nii.gz':('0bb033414fbbd6df626d063b73801a14c71fb33b83204585f2aa1fbb4aef60dd',
'https://templateflow.s3.amazonaws.com/tpl-MNI152NLin2009cAsym/tpl-MNI152NLin2009cAsym_res-01_seg-aseg_dseg.nii.gz')
}
for name,(sha,url) in INFILES.items():
 p=CACHE/name
 if not p.exists() or hashlib.sha256(p.read_bytes()).hexdigest()!=sha:raise ValueError('Source missing or SHA mismatch: '+name+'. Run fetch_mri_hd.py')
t1=nib.load(str(CACHE/'t1_1mm.nii.gz'))
seg=nib.load(str(CACHE/'aseg_1mm.nii.gz'))
assert t1.shape==seg.shape==(193,229,193)
assert np.allclose(t1.affine,seg.affine,atol=1e-5)
assert np.allclose(t1.affine[:3,:3],np.eye(3))
assert np.allclose(t1.affine[:3,3],[-96,-132,-78])
raw=np.asarray(t1.dataobj,dtype=np.float32)
positive=raw[raw>0]
black,white=np.percentile(positive,[.5,99.5])
assert white>black>=0
mapped=np.round(np.clip((raw-black)/(white-black),0,1)*255).astype('u1')
labels=np.asarray(seg.dataobj,dtype='u1')
assert labels.max()<=255 and labels.min()>=0
def dump(fname,pixels):
 header=b'NAVL'+struct.pack('<3H',*pixels.shape)
 volume=header+pixels.tobytes(order='F')
 packed=gzip.compress(volume,compresslevel=7,mtime=0)
 path=OUT/fname
 path.write_bytes(packed)
 print(fname,'size',len(packed),'raw',len(volume),'sha256',hashlib.sha256(packed).hexdigest())
 return {'file':fname,'compressedBytes':len(packed),'uncompressedBytes':len(volume),'sha256':hashlib.sha256(packed).hexdigest()}
manifest={
 'template':'MNI152NLin2009cAsym','resolutionMm':1,'shape':[193,229,193],
 'affineRAS':t1.affine.tolist(),
 't1':dump('mni152_t1_1mm.navl.gz',mapped),
 'aseg':dump('mni152_aseg_1mm.navl.gz',labels),
 'originalT1':INFILES['t1_1mm.nii.gz'][1],'originalAseg':INFILES['aseg_1mm.nii.gz'][1],
 'originalT1SHA256':INFILES['t1_1mm.nii.gz'][0],'originalAsegSHA256':INFILES['aseg_1mm.nii.gz'][0],
 'conversion':'8-bit linear mapping of actual T1 template intensities; .5 to 99.5 percentile of nonzero voxels, clipped; original voxel sampling preserved. aseg label values stored as unsigned bytes without spatial resampling.',
 'intensityLUT':{'minimumPercentile':0.5,'maximumPercentile':99.5,'lowerIntensity':float(black),'upperIntensity':float(white)},
 'rights':'See public/volume/LICENSE-MNI.txt and DATA_SOURCES.md. Data are an MRI population average, not an individual patient or clinical diagnostic acquisition.',
 'voxelOrder':'x fastest: x + 193 * (y + 229*z)'
}
(OUT/'mri-1mm-manifest.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n')

