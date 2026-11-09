#!/usr/bin/env python3
"""Convierte GIFTI fsaverage5 + atlas Destrieux .annot a archivos binarios para el navegador.
Las superficies y parcelaciones originales deben conservar su propia atribución/licencia."""
from pathlib import Path
import base64,gzip,struct,json,zlib,xml.etree.ElementTree as ET,collections
root=Path(__file__).resolve().parent.parent
source=root/'.cache/atlas'
dest=root/'public/atlas'
dest.mkdir(parents=True,exist_ok=True)

def gifti(path):
  xml=ET.fromstring(gzip.open(path,'rb').read())
  arrays=[]
  for da in xml.findall('DataArray'):
    info=da.attrib
    raw=base64.b64decode(da.findtext('Data').strip())
    if info.get('Encoding')=='GZipBase64Binary':raw=zlib.decompress(raw)
    datatype={'NIFTI_TYPE_FLOAT32':'f','NIFTI_TYPE_INT32':'i'}[info['DataType']]
    count=1
    for idx in range(int(info['Dimensionality'])):count*=int(info[f'Dim{idx}'])
    vals=struct.unpack(('<' if info['Endian']=='LittleEndian' else '>')+str(count)+datatype,raw)
    arrays.append(vals)
  return arrays

def annotation(path):
  raw=path.read_bytes()
  n=struct.unpack_from('>i',raw,0)[0]
  assert n==10242,n
  offset=4
  labels=[0]*n
  for i in range(n):
    vertex,value=struct.unpack_from('>ii',raw,offset)
    offset+=8
    labels[vertex]=value
  def readint():
    nonlocal offset
    x=struct.unpack_from('>i',raw,offset)[0];offset+=4;return x
  def readstr():
    nonlocal offset
    n=readint()
    s=raw[offset:offset+n].decode('utf-8',errors='replace').strip('\x00')
    offset+=n
    return s
  assert readint()==1, 'missing colortable'
  ver=readint()
  values={}
  if ver<0:
    assert ver==-2,ver
    maximum=readint()
    origin=readstr()
    entries=readint()
    for j in range(entries):
      idx=readint()
      label=readstr()
      r,g,b,a=(readint(),readint(),readint(),readint())
      code=r+(g<<8)+(b<<16)
      values[code]=(idx,label,(r,g,b))
  else:
    origin=readstr()
    for j in range(ver):
      label=readstr()
      r,g,b,a=(readint(),readint(),readint(),readint())
      code=r+(g<<8)+(b<<16)
      values[code]=(j,label,(r,g,b))
  return labels,values

# Asignación macroscópica didáctica basada en la nomenclatura Destrieux, no en coordenadas arbitrarias.
LOBE_GROUPS = {
  'frontal': {1,5,12,13,14,15,16,24,29,31,53,54,55,63,64,65,69,70,71},
  'parietal': {25,26,27,28,30,56,57,68,72},
  'temporal': {21,23,33,34,35,36,37,38,44,51,52,61,73,74,75},
  'occipital': {2,11,19,20,22,43,45,58,59,60,62,66},
  'cingulate': {6,7,8,9,10,32,47,67},
  'insula': {17,18,48,49,50},
  'frontoparietal': {3,4,46},
  'sylvian': {39,40,41}
}
def category(idx):
  for group, ids in LOBE_GROUPS.items():
    if idx in ids:return group
  return 'other'

surfaces={}
both={}
for hemi in ('left','right'):
  labels,table=annotation(source/f'{hemi}.annot')
  records=sorted(table.values())
  id_to_label={idx:name for idx,name,_ in records}
  ids={code:idx for code,(idx,_,__) in table.items()}
  vertex_ids=bytes(ids.get(code,0) for code in labels)
  if any(i>=256 for i in vertex_ids):raise ValueError('labels exceed byte')
  import collections
  hist=collections.Counter(vertex_ids)
  print(hemi,'regions',len(records),'vertices',len(labels),'idx span',min(vertex_ids),max(vertex_ids),'top',hist.most_common(6))
  both[hemi]={idx:name for idx,name,_ in records}
  for mode in ('pial','infl'):
    positions,faces=gifti(source/f'{mode}_{hemi}.gii.gz')
    sulc,=gifti(source/f'sulc_{hemi}.gii.gz')
    assert len(positions)==10242*3 and len(faces)==20480*3 and len(sulc)==10242
    surfaces[(hemi,mode)]=(positions,faces,vertex_ids,sulc)

# Single normalization for both pial hemispheres; uniform scale retains real anatomical proportions.
pial=[surfaces[(h,'pial')][0] for h in ('left','right')]
minmax=[]
for d in range(3):
  vals=[v for p in pial for v in p[d::3]]
  minmax.append((min(vals),max(vals)))
center=[(v[0]+v[1])/2 for v in minmax]
scale=1/58
print('boundaries(R,A,S)',minmax,'center',center)
for hemi in ('left','right'):
  for mode in ('pial','infl'):
    xyz,faces,labels,sulc=surfaces[(hemi,mode)]
    # Convert from FreeSurfer RAS to WebGL x-horizontal, y-vertical, z-anterior.
    vertices=[]
    for x,y,z in zip(xyz[0::3],xyz[1::3],xyz[2::3]):
      vertices.extend(((x-center[0])*scale,(z-center[2])*scale,(y-center[1])*scale))
    # x,y,z -> x,z,y reverses parity: reverse winding of every face for consistent outward normals.
    faces2=[]
    for a,b,c in zip(faces[0::3],faces[1::3],faces[2::3]):
      faces2.extend((a,c,b))
    binary=b'NATL'+struct.pack('<II',len(labels),len(faces2)//3)
    binary+=struct.pack('<'+str(len(vertices))+'f',*vertices)
    binary+=struct.pack('<'+str(len(faces2))+'H',*faces2)
    binary+=labels
    binary+=struct.pack('<'+str(len(sulc))+'f',*sulc)
    target=dest/f'{mode}_{hemi}.bin'
    target.write_bytes(binary)
    print('wrote',target.name,len(binary),'minmax',round(min(vertices),3),round(max(vertices),3))

assert set(both['left'])==set(both['right'])
atlas=[]
for idx,name in sorted(both['left'].items()):
  atlas.append({'id':idx,'name':name,'lobe':category(idx)})
(dest/'regions.json').write_text(json.dumps({'name':'Destrieux 2009 surface atlas','source':'https://nilearn.github.io/stable/modules/generated/nilearn.datasets.fetch_atlas_surf_destrieux.html','template':'FreeSurfer fsaverage5','vertexCountPerHemisphere':10242,'faceCountPerHemisphere':20480,'regions':atlas},ensure_ascii=False,indent=2))
print('ATLAS_REGIONS',len(atlas))
print('\n'.join(f'{r["id"]:>3} {r["lobe"]:<15} {r["name"]}' for r in atlas))

