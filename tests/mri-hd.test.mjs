import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const dir='public/volume/';
const exists=existsSync(dir+'mri-1mm-manifest.json');
test('MNI152 1mm T1 source is real sampled template, not upsampled from 2mm',{skip:!exists},()=>{
 const m=JSON.parse(readFileSync(dir+'mri-1mm-manifest.json','utf8'));
 assert.equal(m.template,'MNI152NLin2009cAsym');
 assert.equal(m.resolutionMm,1);
 assert.deepEqual(m.shape,[193,229,193]);
 assert.deepEqual(m.affineRAS,[ [1,0,0,-96],[0,1,0,-132],[0,0,1,-78],[0,0,0,1] ]);
 assert.equal(m.originalT1SHA256,'1f27aabea9f7183dc0c69dafa71e1787b921ca778d655d9c1bf302b273d5627a');
 assert.equal(m.originalAsegSHA256,'0bb033414fbbd6df626d063b73801a14c71fb33b83204585f2aa1fbb4aef60dd');
 assert.match(m.conversion,/original voxel sampling preserved/i);
 for(const key of ['t1','aseg']){
   const source=readFileSync(dir+m[key].file);
   const h=createHash('sha256').update(source).digest('hex');
   assert.equal(h,m[key].sha256);
   const data=gunzipSync(source);
   assert.equal(data.subarray(0,4).toString('ascii'),'NAVL');
   assert.deepEqual([data.readUInt16LE(4),data.readUInt16LE(6),data.readUInt16LE(8)],[193,229,193]);
   assert.equal(data.length,10+193*229*193);
   assert.ok(data.subarray(10).some(n=>n>0));
 }
});

