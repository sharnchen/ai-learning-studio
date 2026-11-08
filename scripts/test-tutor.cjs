const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');const ctx=vm.createContext({console,Blob,TextEncoder,document:{addEventListener(){}},setTimeout,clearTimeout,AbortController});
for(const name of ['lessons.js','scope.js','practice-data.js','assessment-data.js','tutor.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',name),'utf8'),ctx);
assert.equal(vm.runInContext("tutorMatch('Gradient Ascent是什麼')[0].zh",ctx),'梯度上升');assert.equal(vm.runInContext("tutorMatch('梯度上升與梯度下降')[0].zh",ctx),'梯度下降');
assert(vm.runInContext("tutorLocal('xyz-unknown').answer.includes('未辨識')",ctx));assert(vm.runInContext("tutorLocal('梯度上升').answer.includes('3.24')",ctx));
for(const id of vm.runInContext('keywordCatalog.map(t=>t.id)',ctx)){assert(vm.runInContext(`assessmentBank.some(q=>q.termId===${JSON.stringify(id)})`,ctx))}
console.log('Tutor bilingual retrieval, unknown-query fallback and 577-topic challenge coverage passed');
