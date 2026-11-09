#!/usr/bin/env python3
"""Fetch MNI152NLin2009cAsym public references with exact SHA-256 validation."""
from pathlib import Path
from urllib.request import Request,urlopen
import hashlib
BASE='https://templateflow.s3.amazonaws.com/tpl-MNI152NLin2009cAsym/'
DEST=Path(__file__).resolve().parent.parent/'.cache/volume'
DEST.mkdir(parents=True,exist_ok=True)
FILES={
't1_2mm.nii.gz':('tpl-MNI152NLin2009cAsym_res-02_T1w.nii.gz','7c4e551ae8150ac1f468595bd62074aa15aed747cd334fce6d177182972b6220'),
'aseg_2mm.nii.gz':('tpl-MNI152NLin2009cAsym_res-02_seg-aseg_dseg.nii.gz','9d65771138c0be317183e546dff6b9d36cf774c3fa84be7be114a90272408108'),
'aseg_1mm.nii.gz':('tpl-MNI152NLin2009cAsym_res-01_seg-aseg_dseg.nii.gz','0bb033414fbbd6df626d063b73801a14c71fb33b83204585f2aa1fbb4aef60dd'),
}
for local,(path,expected) in FILES.items():
    target=DEST/local
    if not target.exists() or hashlib.sha256(target.read_bytes()).hexdigest()!=expected:
        req=Request(BASE+path,headers={'User-Agent':'NeuroAtlas3D-research-reproducibility'})
        with urlopen(req,timeout=90) as response: data=response.read()
        if hashlib.sha256(data).hexdigest()!=expected: raise ValueError('Input checksum mismatch: '+local)
        target.write_bytes(data)
    print('VALIDATED',local)

