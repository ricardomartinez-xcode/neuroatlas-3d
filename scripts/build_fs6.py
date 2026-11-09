#!/usr/bin/env python3
"""Produce genuine high-detail fsaverage6 surfaces (not procedural) and interpolated display labels.

Geometry: original pial & inflated FreeSurfer fsaverage6 distributed by Nilearn via OSF.
Labels: Destrieux fsaverage5 vertex annotations transported to fsaverage6 using spherical nearest
neighbour. This is an *approximation at parcellation boundaries*, not new native annotation.
"""
from pathlib import Path
import hashlib, json, struct, tarfile, urllib.request
import numpy as np
import nibabel as nib
from scipy.spatial import cKDTree

ROOT=Path(__file__).resolve().parent.parent
CACHE=ROOT/'.cache/fsaverage6'
CACHE.mkdir(parents=True, exist_ok=True)
ARCHIVE=CACHE/'fsaverage6.tar.gz'
URL='https://osf.io/jzxyr/download'
EXPECTED='ffab4ce0e067079388b863edca7f3c9aefa870b151511b8f91f48031a5576757'
if not ARCHIVE.exists() or hashlib.sha256(ARCHIVE.read_bytes()).hexdigest()!=EXPECTED:
    with urllib.request.urlopen(urllib.request.Request(URL,headers={'User-Agent':'NeuroAtlas3D-academic'}),timeout=90) as response:
        data=response.read()
    if hashlib.sha256(data).hexdigest()!=EXPECTED:
        raise ValueError('fsaverage6 source checksum mismatch')
    ARCHIVE.write_bytes(data)
with tarfile.open(ARCHIVE,'r:gz') as tar:
    needed=[f'{kind}_{side}.gii.gz' for side in ('left','right') for kind in ('pial','infl','sphere','sulc')]
    for member in needed:
        target=CACHE/member
        if not target.exists():
            data=tar.extractfile(member)
            if data is None:raise RuntimeError('Missing surface: '+member)
            target.write_bytes(data.read())

DEST=ROOT/'public/atlas'
pial5_positions=[]
for hemi in ('left','right'):
    f=(DEST/f'pial_{hemi}.bin').read_bytes()
    assert f[:4]==b'NATL'
    num,faces=struct.unpack_from('<II',f,4)
    assert (num,faces)==(10242,20480)
    pial5_positions.append(np.frombuffer(f,dtype='<f4',offset=12,count=num*3).reshape((-1,3)))
# Geometry is already transformed in fsaverage5 as:
# xscene=(xRAS-centerX)/58, yscene=(zRAS-centerZ)/58, zscene=(yRAS-centerY)/58.
# Derive exact older template's RAS center from an original point and the transformed point.
centers=[]
for i,hemi in enumerate(('left','right')):
    source=nib.load(str(CACHE/f'pial_{hemi}.gii.gz')).agg_data()[0].astype('float64')
    old=pial5_positions[i][0].astype('float64')
    centers.append(np.array([source[0,0]-58*old[0],source[0,1]-58*old[2],source[0,2]-58*old[1]]))
center=np.mean(centers,axis=0)
assert np.linalg.norm(centers[0]-centers[1])<.1, centers
print('Template center FreeSurfer RAS',center)
outputs=[]
for hemi in ('left','right'):
    old=(DEST/f'pial_{hemi}.bin').read_bytes()
    count5=10242;faces5=20480
    ids5=np.frombuffer(old,dtype='u1',count=count5,offset=12+count5*12+faces5*6)
    sphere=nib.load(str(CACHE/f'sphere_{hemi}.gii.gz')).agg_data()[0]
    assert sphere.shape==(40962,3)
    # First 10242 fsaverage5 vertices are contained in fsaverage6 and have matching geometry.
    kd=cKDTree(sphere[:10242])
    _,nn=kd.query(sphere[10242:],k=1)
    ids6=np.r_[ids5,ids5[nn]].astype('u1')
    assert np.array_equal(ids6[:10242],ids5)
    sulc=nib.load(str(CACHE/f'sulc_{hemi}.gii.gz')).agg_data()
    if isinstance(sulc,tuple):sulc=sulc[0]
    sulc=np.asarray(sulc,dtype='<f4').reshape(-1)
    for mode in ('pial','infl'):
        coords,faces=nib.load(str(CACHE/f'{mode}_{hemi}.gii.gz')).agg_data()
        assert coords.shape==(40962,3) and faces.shape==(81920,3)
        out=np.empty((len(coords),3),dtype='<f4')
        out[:,0]=(coords[:,0]-center[0])/58
        out[:,1]=(coords[:,2]-center[2])/58
        out[:,2]=(coords[:,1]-center[1])/58
        indices=np.asarray(faces[:,[0,2,1]],dtype='<u2')
        binary=b'NATL'+struct.pack('<II',len(coords),len(faces))
        binary+=out.tobytes()+indices.tobytes()+ids6.tobytes()+sulc.tobytes()
        file=DEST/f'{mode}6_{hemi}.bin'
        file.write_bytes(binary)
        outputs.append({'file':file.name,'vertices':len(coords),'faces':len(faces),'sha256':hashlib.sha256(binary).hexdigest()})
        print('Wrote',file.name,len(binary),'bytes','label diversity',len(np.unique(ids6)))

meta={
 'mesh':'fsaverage6','verticesPerHemisphere':40962,'facesPerHemisphere':81920,
 'geometrySource':'https://osf.io/jzxyr/download','sourceSha256':EXPECTED,
 'surfaceInterpolation':'native pial and inflated FreeSurfer fsaverage6 surfaces, no geometry interpolation',
 'parcellation':'Destrieux fsaverage5 vertex labels transferred to fsaverage6 via nearest matching vertex on the fsaverage6 sphere; boundaries are approximate, not official fsaverage6 annotations',
 'first10242Vertices':'coordinate-aligned to original fsaverage5 vertices; exact annotation retained for that subset',
 'outputs':outputs
}
(DEST/'fs6-meta.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2))

