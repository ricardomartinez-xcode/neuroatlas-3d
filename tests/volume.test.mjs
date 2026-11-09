import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
const root='public/volume/';
const exists=existsSync(root+'manifest.json');
test('MNI152 source manifest and consistent anatomical reference', {skip:!exists},()=>{
 const m=JSON.parse(readFileSync(root+'manifest.json','utf8'));
 assert.equal(m.template,'MNI152NLin2009cAsym');
 assert.deepEqual(m.voxelDimensions,[97,115,97]);
 assert.deepEqual(m.spacingMm,[2,2,2]);
 assert.ok(m.structures.length>=17);
 assert.ok(m.sha256['t1_2mm.nii.gz']);
 const ids=new Set(m.structures.map(s=>s.id));
 for(const name of ['hippocampus-left','hippocampus-right','amygdala-left','amygdala-right','thalamus-left','thalamus-right','brainstem','corpus-callosum','cerebellum-left','cerebellum-right'])assert.ok(ids.has(name));
 assert.equal(m.rasAffine[0][0],2);
 assert.equal(m.rasAffine[1][1],2);
 assert.equal(m.rasAffine[2][2],2);
});
for(const vol of ['mni152_t1.bin','mni152_aseg.bin']){
 test('Reference volume '+vol+' shape and index', {skip:!exists},()=>{
  const b=readFileSync(root+vol);
  assert.equal(b.subarray(0,4).toString(),'NAVL');
  assert.deepEqual([b.readUInt16LE(4),b.readUInt16LE(6),b.readUInt16LE(8)],[97,115,97]);
  assert.equal(b.length,10+97*115*97);
  assert.ok(b.subarray(10).some(x=>x!==0));
 });
}
test('All subcortical meshes are valid indexed anatomies', {skip:!exists},()=>{
 const m=JSON.parse(readFileSync(root+'manifest.json','utf8'));
 for(const region of m.structures){
   const file=readFileSync(root+region.file);
   assert.equal(file.subarray(0,4).toString(),'NAVM');
   const nv=file.readUInt32LE(4),nf=file.readUInt32LE(8);
   assert.equal(nv,region.vertices);
   assert.equal(nf,region.faces);
   assert.equal(file.length,12+nv*12+nf*12);
   assert.ok(nv>100&&nf>200);
   let min=Infinity,max=-Infinity;
   for(let i=0;i<nv*3;i++){
     const v=file.readFloatLE(12+i*4);
     assert.ok(Number.isFinite(v),region.id);
     min=Math.min(min,v);max=Math.max(max,v);
   }
   assert.ok(min>-10&&max<10);
   for(let i=0;i<nf*3;i++)assert.ok(file.readUInt32LE(12+nv*12+i*4)<nv,region.id);
 }
});

