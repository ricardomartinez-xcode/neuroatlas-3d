#!/usr/bin/env python3
"""Descarga insumos anatómicos fijados por SHA-256. Python estándar, sin dependencias."""
from pathlib import Path
import hashlib,urllib.request
BASE=Path(__file__).resolve().parent.parent/'.cache/atlas'
BASE.mkdir(parents=True,exist_ok=True)
URL='https://raw.githubusercontent.com/nilearn/nilearn/main/nilearn/datasets/data/fsaverage5/'
FILES={
'pial_left.gii.gz':(URL+'pial_left.gii.gz','1e76fe43ac194c15fd272643f7ae7995621e2a496b3102b2d6175f0f8e6d7fc8'),
'pial_right.gii.gz':(URL+'pial_right.gii.gz','fdfae008bc10acf7cba82737ea5db9a7298948c41884a2d3330a785783a60a91'),
'infl_left.gii.gz':(URL+'infl_left.gii.gz','1a571c9d598a476a202c7295c235a709de63360047b92c0e7b75ed18b0f37e74'),
'infl_right.gii.gz':(URL+'infl_right.gii.gz','9f66b009e1da72158d75b4e739c6289aba0c1b08d818b2f0f9f61204aa4ba895'),
'sulc_left.gii.gz':(URL+'sulc_left.gii.gz','bd0f87e0cba153e9d5c5281edc7267f631b1967e5883d4027924766c8430eb62'),
'sulc_right.gii.gz':(URL+'sulc_right.gii.gz','97afe76225903205a16b88f88cd796945f2a27011328e98decaa9128ff063afb'),
'left.annot':('https://www.nitrc.org/frs/download.php/9343/lh.aparc.a2009s.annot','c2401d6137949f33788283a4926cb61cb3b0bfe5bda1b368c22aa921ea06d38d'),
'right.annot':('https://www.nitrc.org/frs/download.php/9342/rh.aparc.a2009s.annot','99c028f9f9d8dce617e9f29a5ebdc2f1b187d83650b68128fae53c3669588da7'),
}
for name,(url,expected) in FILES.items():
    path=BASE/name
    if not path.is_file() or hashlib.sha256(path.read_bytes()).hexdigest()!=expected:
        print('Downloading:',name,flush=True)
        req=urllib.request.Request(url,headers={'User-Agent':'NeuroAtlas-3D/2.0 academic dataset reproduction'})
        with urllib.request.urlopen(req,timeout=40) as response:
            data=response.read()
        actual=hashlib.sha256(data).hexdigest()
        if actual!=expected:raise RuntimeError(f'SHA-256 mismatch for {name}: {actual}')
        path.write_bytes(data)
    print('OK',name)

