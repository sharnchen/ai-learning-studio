'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),c=vm.createContext({document:{addEventListener(){}},console});
for(const file of ["lessons.js","scope.js","practice-data.js","math-notation.js","math-formulas.js","calculation-trace.js","practice-ui.js","lab-engines.js","lab-ui.js"])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),c,{filename:file});
const result=vm.runInContext(`(()=>{
let count=0,defaultTrue=0,caseCount=0;
function equal(a,b,label){if(a!==b)throw Error(label+': expected '+JSON.stringify(b)+' got '+JSON.stringify(a));}
for(const e of labEngines){
 const defaults=labDefaults(e);
 for(const c of e.controls.filter(c=>c.type==='checkbox')){
   count++;if(defaults[c.id]===true)defaultTrue++;
   equal(sanitizeLabValues(e,{})[c.id],defaults[c.id],e.id+' missing '+c.id);
   for(const v of [undefined,null,'false','true',0,1,[],{}])equal(sanitizeLabValues(e,{[c.id]:v})[c.id],defaults[c.id],e.id+' invalid '+c.id);
   for(const v of [false,true])equal(sanitizeLabValues(e,{[c.id]:v})[c.id],v,e.id+' explicit '+c.id);
   for(const v of [false,true])equal(sanitizeLabValues(e,{}, {...defaults,[c.id]:v})[c.id],v,e.id+' custom default '+c.id);
 }
}
for(const t of labCases){
 const e=labEngineFor(t),defaults=labCaseDefaults(t,e);
 const clean=sanitizeLabRuns({[t.id]:{values:{},runs:7,note:'保留筆記',baseline:[['a','b']]}});
 const record=clean[t.id];equal(record.runs,7,t.zh+' runs');equal(record.note,'保留筆記',t.zh+' note');equal(JSON.stringify(record.baseline),JSON.stringify([['a','b']]),t.zh+' baseline');
 for(const c of e.controls.filter(c=>c.type==='checkbox')){
   equal(record.values[c.id],defaults[c.id],t.zh+' preset');
   for(const v of [true,false])equal(sanitizeLabRuns({[t.id]:{values:{[c.id]:v}}})[t.id].values[c.id],v,t.zh+' saved checkbox');
 }
 const a=e.compute(defaults),b=e.compute(record.values);
 equal(JSON.stringify(a),JSON.stringify(b),t.zh+' restored result');
 caseCount++;
}
return {engines:labEngines.length,checkboxes:count,defaultTrue,cases:caseCount};})()`,c);
console.log('PASS: experiment checkbox recovery',JSON.stringify(result));
