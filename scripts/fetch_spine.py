#!/usr/bin/env python3
"""Reproducible public HRA CC BY 4.0 spinal-cord model fetch and integrity validation."""
from pathlib import Path
from urllib.request import Request,urlopen
import json,hashlib,struct
ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'public/spine'
OUT.mkdir(parents=True,exist_ok=True)
URL='https://ccf-ontology.hubmapconsortium.org/objects/v1.2/VH_M_Spinal_Cord.glb'
SHA='a7858d88c2237aa7d559c4c1d638923d213d2a9f46c575dea03d6ba67a9975c0'
FILE=OUT/'hra-male-spinal-cord.glb'
if not FILE.exists() or hashlib.sha256(FILE.read_bytes()).hexdigest()!=SHA:
    with urlopen(Request(URL,headers={'User-Agent':'NeuroAtlas3D academic anatomy source validation'}),timeout=60) as resp:
        data=resp.read()
    digest=hashlib.sha256(data).hexdigest()
    if digest!=SHA:
        raise RuntimeError('Source dataset hash mismatch: '+digest)
    FILE.write_bytes(data)
b=FILE.read_bytes()
assert len(b)==489992 and b[:4]==b'glTF' and hashlib.sha256(b).hexdigest()==SHA
chunk_len,chunk_type=struct.unpack_from('<II',b,12)
assert chunk_type==0x4e4f534a
source=json.loads(b[20:20+chunk_len])
assert len(source['meshes'])==30 and len(source['nodes'])==31
names=[m['name'] for m in source['meshes']]
assert all('spinal_cord' in n for n in names)
manifest={
 'model':'HRA Visible Human Male spinal cord','sourceUrl':URL,'sha256':SHA,
 'source':'Human Reference Atlas (HuBMAP), built on the U.S. National Library of Medicine Visible Human Project',
 'license':'Creative Commons Attribution 4.0 International (CC BY 4.0)',
 'sourceCredit':'HuBMAP Human Reference Atlas, 3D Reference Object Library. Data derived from the NLM Visible Human Male Project. CC BY 4.0.',
 'licenseUrl':'https://creativecommons.org/licenses/by/4.0/',
 'sourceDocumentation':'https://humanatlas.io/3d-reference-library',
 'meshCount':30,'levels':['C'+str(i) for i in range(1,9)]+['T'+str(i) for i in range(1,13)]+['L'+str(i) for i in range(1,6)]+['S'+str(i) for i in range(1,6)],
 'limitations':'Reference segmentation of spinal cord external segments. Nerve roots, vertebrae, internal white/gray tracts, and peripheral nerves are NOT included in this file. Not patient-specific.'
}
(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n')
print('HRA SPINAL MODEL VERIFIED:',FILE.stat().st_size,'bytes; 30 distinct segment meshes.')

