import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CLINICAL_CARDS,CLINICAL_REFERENCES} from '../src/clinicalData.js';
const app=readFileSync('src/App.jsx','utf8');
test('La clínica antecede al atlas en el flujo educativo',()=>{
 const c=app.indexOf('<ClinicalExplorer onNavigate=');
 const cases=app.indexOf('<ClinicalCases onStudy=');
 const anatomy=app.indexOf('id="explorar"');
 assert.ok(c>0&&cases>c&&anatomy>cases);
 assert.match(app,/Neuropsicología clínica/);
 assert.match(app,/APOYO NEUROANATÓMICO/);
});
test('Fichas: sustento de fuentes, dominios y límites explícitos',()=>{
 assert.ok(CLINICAL_CARDS.length>=10);
 for(const card of CLINICAL_CARDS){
  assert.ok(card.id&&card.group&&card.title);
  for(const key of ['anatomy','function','evidence','caveat'])assert.ok(card[key]?.length>12,card.id);
  assert.ok(card.symptoms?.length>=1&&card.conditions?.length>=1&&card.evaluation?.length>=1);
  assert.ok(card.refs?.length>=1);
  for(const ref of card.refs){
   assert.ok(CLINICAL_REFERENCES[ref]?.url?.startsWith('https://'),card.id+':'+ref);
  }
 }
});
test('Los casos académicos no se confunden con pacientes reales',()=>{
 const source=readFileSync('src/ClinicalCases.jsx','utf8');
 assert.match(source,/fictici/i);
 for(const name of ['memoria','atencion','lenguaje','ejecutivas'])assert.ok(source.includes("id:'"+name+"'"));
 assert.match(source,/hipot/i);
});
