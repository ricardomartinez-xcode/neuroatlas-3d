import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
const root='public/atlas/';
const high=existsSync(root+'fs6-meta.json');
test('Anatomical fsaverage6 surfaces are authentic nested 40962 vertex meshes',{skip:!high},()=>{
 const m=JSON.parse(readFileSync(root+'fs6-meta.json','utf8'));
 assert.equal(m.mesh,'fsaverage6');
 assert.equal(m.verticesPerHemisphere,40962);
 assert.equal(m.facesPerHemisphere,81920);
 assert.match(m.parcellation,/approximate/i);
 for(const hemi of ['left','right']){
  const source=readFileSync(root+'pial_'+hemi+'.bin');
  const srcOffset=12+10242*12+20480*6;
  const nativeLabels=source.subarray(srcOffset,srcOffset+10242);
  for(const mode of ['pial','infl']){
   const b=readFileSync(root+mode+'6_'+hemi+'.bin');
   const n=b.readUInt32LE(4),tri=b.readUInt32LE(8);
   assert.equal(b.subarray(0,4).toString(),'NATL');
   assert.equal(n,40962);
   assert.equal(tri,81920);
   assert.equal(b.length,12+n*12+tri*6+n+n*4);
   const offset=12+n*12+tri*6;
   assert.deepEqual(b.subarray(offset,offset+10242),nativeLabels);
   for(let i=0;i<n*3;i++)assert.ok(Number.isFinite(b.readFloatLE(12+i*4)));
   for(let i=0;i<tri*3;i++)assert.ok(b.readUInt16LE(12+n*12+i*2)<n);
  }
 }
});
const contextual=existsSync('public/volume/cortex-context-left.bin');
test('Deep brain context derives from the same MNI template, with anatomical checks',{skip:!contextual},()=>{
 const m=JSON.parse(readFileSync('public/volume/manifest.json','utf8'));
 assert.equal(m.contextSurfaces.length,2);
 assert.match(m.contextCaveat,/not exact pial/i);
 for(const model of m.contextSurfaces){
  const b=readFileSync('public/volume/'+model.file);
  assert.equal(b.subarray(0,4).toString(),'NAVM');
  const n=b.readUInt32LE(4),f=b.readUInt32LE(8);
  assert.equal(n,model.vertices);
  assert.equal(f,model.faces);
  assert.equal(b.length,12+n*12+f*12);
  assert.ok(n>10000);
  for(let i=0;i<n*3;i++)assert.ok(Number.isFinite(b.readFloatLE(12+i*4)));
  for(let i=0;i<f*3;i++)assert.ok(b.readUInt32LE(12+n*12+i*4)<n);
 }
});

