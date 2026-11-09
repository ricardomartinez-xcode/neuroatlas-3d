import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const atlas=JSON.parse(readFileSync('public/atlas/regions.json','utf8'));
const count=10242, faces=20480;
const labelSet=new Set(atlas.regions.map(r=>r.id));
test('Parcelación Destrieux: 76 entradas, incluidas desconocida y pared medial',()=>{
 assert.equal(atlas.regions.length,76);
 for(let n=0;n<76;n++)assert.ok(labelSet.has(n));
 assert.equal(atlas.vertexCountPerHemisphere,count);
 assert.equal(atlas.faceCountPerHemisphere,faces);
});
for(const hemi of ['left','right'])for(const mode of ['pial','infl']){
 test('Geometría real '+mode+' '+hemi+' de fsaverage5',()=>{
  const f=readFileSync('public/atlas/'+mode+'_'+hemi+'.bin');
  assert.equal(f.subarray(0,4).toString('ascii'),'NATL');
  assert.equal(f.readUInt32LE(4),count);
  assert.equal(f.readUInt32LE(8),faces);
  assert.equal(f.length,12+count*12+faces*6+count+count*4);
  let offset=12;
  for(let i=0;i<count*3;i++)assert.ok(Number.isFinite(f.readFloatLE(offset+i*4)));
  offset+=count*12;
  for(let i=0;i<faces*3;i++)assert.ok(f.readUInt16LE(offset+i*2)<count);
  offset+=faces*6;
  const mapped=f.subarray(offset,offset+count);
  assert.ok(mapped.some(v=>v!==0));
  assert.ok(mapped.every(v=>labelSet.has(v)));
 });
}
