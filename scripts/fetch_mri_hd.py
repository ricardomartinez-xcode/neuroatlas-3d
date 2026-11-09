#!/usr/bin/env python3
"""Retrieve and checksum official 1mm T1 and aseg reference files from TemplateFlow."""
from pathlib import Path
from urllib.request import Request,urlopen
import hashlib
BASE=Path(__file__).resolve().parent.parent/'.cache/volume'
BASE.mkdir(parents=True,exist_ok=True)
FILES={
't1_1mm.nii.gz':('tpl-MNI152NLin2009cAsym_res-01_T1w.nii.gz','1f27aabea9f7183dc0c69dafa71e1787b921ca778d655d9c1bf302b273d5627a'),
'aseg_1mm.nii.gz':('tpl-MNI152NLin2009cAsym_res-01_seg-aseg_dseg.nii.gz','0bb033414fbbd6df626d063b73801a14c71fb33b83204585f2aa1fbb4aef60dd')
}
for target,(source,expected) in FILES.items():
 path=BASE/target
 if not path.exists() or hashlib.sha256(path.read_bytes()).hexdigest()!=expected:
  with urlopen(Request('https://templateflow.s3.amazonaws.com/tpl-MNI152NLin2009cAsym/'+source,headers={'User-Agent':'NeuroAtlas 3D academic atlas'}),timeout=100) as r: data=r.read()
  if hashlib.sha256(data).hexdigest()!=expected:raise ValueError('Source hash mismatch: '+target)
  path.write_bytes(data)
 print('VALIDATED',target,path.stat().st_size)

