import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const path='public/spine/hra-male-spinal-cord.glb',present=existsSync(path);
test('Human Reference Atlas authentic spinal cord 30 separate segments', {skip:!present},()=>{
 const b=readFileSync(path);
 assert.equal(b.toString('utf8',0,4),'glTF');
 assert.equal(b.readUInt32LE(4),2);
 assert.equal(b.readUInt32LE(8),b.length);
 assert.equal(b.readUInt32LE(16),0x4e4f534a);
 const json=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)).toString('utf8'));
 assert.equal(json.meshes.length,30);
 assert.equal(json.nodes.length,31);
 for(const m of json.meshes)assert.match(m.name,/spinal_cord/);
 const manifest=JSON.parse(readFileSync('public/spine/manifest.json','utf8'));
 assert.equal(manifest.meshCount,30);
 assert.equal(manifest.levels.length,30);
 assert.match(manifest.license,/CC BY 4.0/);
 assert.equal(manifest.sha256,'a7858d88c2237aa7d559c4c1d638923d213d2a9f46c575dea03d6ba67a9975c0');
});

